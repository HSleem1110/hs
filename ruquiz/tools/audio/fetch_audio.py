#!/usr/bin/env python3
# 앱에서 원어민 녹음이 없는 단어를 찾아 위키미디어 공용(Lingua Libre · 위키낱말사전) 녹음을 받아 넣어요.
#
#   python3 ruquiz/tools/audio/fetch_audio.py            # 새로 추가된 단어만 찾기 + 받기 + 앱에 합치기
#   python3 ruquiz/tools/audio/fetch_audio.py --retry    # 전에 받지 못한 단어(서버 제한 등)도 다시 시도
#   python3 ruquiz/tools/audio/fetch_audio.py --licenses # 출처 목록에서 라이선스가 비어 있는 녹음 채우기
#
# 순서: 앱 단어 수집(collect_words.js) → kaikki.org 위키낱말사전 추출본에서 녹음 파일 이름 찾기
#      → 녹음이 달린 사전 항목의 강세가 앱의 강세 표기와 같은 것만 고르기 → 미러/공용에서 받기
#      → ffmpeg로 앞뒤 무음 자르고 mp3 압축 → app.js의 LL_AUDIO · LL_CREDITS에 합치기
#      → version.json 올리고 russian-quiz.html 다시 만들기.  (커밋 · 푸시는 직접 하세요)
import json, re, os, sys, gzip, time, base64, hashlib, subprocess, unicodedata, urllib.request, urllib.parse, html, itertools, datetime

T = os.path.dirname(os.path.abspath(__file__)) + '/'
R = os.path.dirname(os.path.dirname(T.rstrip('/'))) + '/'
CACHE = T + 'cache/'; os.makedirs(CACHE, exist_ok=True)
STATE_P = T + 'state.json'
UA = 'RuQuizAudioFetch/1.0 (https://github.com/HSleem1110/hs/tree/claude/video-completion-automation-wq7tsc/ruquiz) python-urllib/3'
MIRROR = 'https://ftpmirror.your.org/pub/wikimedia/images/wikipedia/commons/'
UPLOAD = 'https://upload.wikimedia.org/wikipedia/commons/'
KAIKKI = 'https://kaikki.org/dictionary/Russian/kaikki.org-dictionary-Russian.jsonl.gz'
AUD = re.compile(r'\.(ogg|oga|wav|mp3|flac|opus)$', re.I)
TRIM = 'silenceremove=start_periods=1:start_threshold=-48dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-48dB:start_silence=0.12,areverse,afade=t=in:st=0:d=0.015,adelay=100:all=1,apad=pad_dur=0.1'   # 앞을 잘라낸 뒤 바로 압축하면 첫소리가 [b]처럼 깨져요 → 짧게 페이드인 + 앞 0.1초 무음
args = set(sys.argv[1:])
state = json.load(open(STATE_P, encoding='utf-8')) if os.path.exists(STATE_P) else {'checked': {}}
def save_state(): json.dump(state, open(STATE_P, 'w', encoding='utf-8'), ensure_ascii=False, indent=0, sort_keys=True)

nf = lambda x: unicodedata.normalize('NFC', x).lower().replace('̀', '')
plain = lambda x: nf(x).replace('́', '')
mono = lambda x: len(re.findall('[аеёиоуыэюя]', plain(x))) <= 1

def http(url, tries=6, cap=300, binary=True):
    wait = 20
    for _ in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=90) as r:
                b = r.read(); return b if binary else b.decode()
        except urllib.error.HTTPError as e:
            if e.code == 404: return None
            print(f'    {e.code} → {wait}s 쉬기', flush=True)
        except Exception as e:
            print(f'    {e} → {wait}s 쉬기', flush=True)
        time.sleep(wait); wait = min(wait * 2, cap)
    return None

UPLOAD_BLOCKED = False
def fetch_file(path):
    # 미러 먼저 (제한 없음). 공용 원본 서버가 429면 이번 실행에서는 더 묻지 않고 'failed'로 남겨 다음에 --retry
    global UPLOAD_BLOCKED
    try:
        with urllib.request.urlopen(urllib.request.Request(MIRROR + path, headers={'User-Agent': UA}), timeout=60) as r: return r.read()
    except Exception: pass
    if UPLOAD_BLOCKED: return None
    for wait in (0, 30, 90):
        time.sleep(wait)
        try:
            with urllib.request.urlopen(urllib.request.Request(UPLOAD + path, headers={'User-Agent': UA}), timeout=60) as r: return r.read()
        except urllib.error.HTTPError as e:
            if e.code == 404: return None
        except Exception: pass
    UPLOAD_BLOCKED = True
    print('    위키미디어 원본 서버가 막혀 있어요. 남은 파일은 다음에 --retry로 다시 시도해요.', flush=True)
    return None

def word_of(fn):
    n = AUD.sub('', fn.split(':', 1)[1] if ':' in fn[:6] else fn).replace('_', ' ')
    m = re.match(r'LL-Q7737 \(rus\)-[^-]+-(.+)$', n) or re.match(r'(?i)ru-(.+)$', n)
    return re.sub(r'\s*\(\d+\)$|[-_ ]?\d+$', '', plain(m.group(1))) if m else None

def read_app():   # 원어민 녹음은 audio-native.json 팩, 출처 목록은 app.js 의 LL_CREDITS
    js = open(R + 'app.js', encoding='utf-8').read()
    m2 = re.search(r'const LL_CREDITS = (\[.*?\]);\n', js)
    return js, json.load(open(R + 'audio-native.json', encoding='utf-8')), json.loads(m2.group(1))

def write_app(js, A, C):
    json.dump(A, open(R + 'audio-native.json', 'w', encoding='utf-8'), ensure_ascii=False)
    js = re.sub(r'const LL_CREDITS = \[.*?\];\n', lambda m: 'const LL_CREDITS = ' + json.dumps(C, ensure_ascii=False) + ';\n', js, count=1)
    open(R + 'app.js', 'w', encoding='utf-8').write(js)

def licenses(files):
    out = {}
    fl = list(files)
    for i in range(0, len(fl), 50):
        q = urllib.parse.urlencode({'action': 'query', 'titles': '|'.join('File:' + f for f in fl[i:i+50]), 'prop': 'imageinfo', 'iiprop': 'extmetadata',
                                    'iiextmetadatafilter': 'LicenseShortName|Artist', 'format': 'json', 'formatversion': '2'})
        b = http('https://ru.wiktionary.org/w/api.php?' + q, tries=4, cap=120, binary=False)
        if not b: continue
        for p in json.loads(b).get('query', {}).get('pages', []):
            em = ((p.get('imageinfo') or [{}])[0]).get('extmetadata', {})
            lic = em.get('LicenseShortName', {}).get('value', '')
            art = re.sub(r'<[^>]+>', '', html.unescape(em.get('Artist', {}).get('value', ''))).strip()[:60]
            if lic: out[p['title'].split(':', 1)[1]] = (lic, art)
        time.sleep(1)
    return out

def bump_and_build(note):
    V = json.load(open(R + 'version.json', encoding='utf-8'))
    t = datetime.date.today(); today = f'{t.year}.{t.month}.{t.day}'
    d, _, n = V['ver'].rpartition('.')
    V['ver'] = f'{d}.{int(n) + 1}' if d == today else today + '.1'
    V['notes'] = [note]
    json.dump(V, open(R + 'version.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    subprocess.run([sys.executable, R + 'tools/make_file.py'], check=True)
    print('버전', V['ver'])

# ---------- 라이선스만 채우기 ----------
if '--licenses' in args:
    js, A, C = read_app()
    todo = [c for c in C if not re.match(r'^(CC|Public|PD)', c[2])]
    fn = lambda u: urllib.parse.unquote(u.split('File:', 1)[1]).replace('_', ' ')
    L = licenses(fn(c[3]) for c in todo)
    n = 0
    for c in todo:
        if fn(c[3]) in L:
            c[2], art = L[fn(c[3])]
            if c[1] in ('', '위키미디어 공용') and art: c[1] = art
            n += 1
    write_app(js, A, C)
    print('라이선스 채움', n, '/', len(todo))
    if n: bump_and_build(f'녹음 출처 라이선스 {n}개 보완')
    sys.exit(0)

# ---------- 1) 앱 단어 ----------
wj = CACHE + 'words.json'
subprocess.run(['node', T + 'collect_words.js', R + 'russian-quiz.html', wj], check=True)
W = json.load(open(wj, encoding='utf-8'))
have = set(W['have'])
missing = {k: v for k, v in W['words'].items() if k not in have and not any(nf(x) in have for x in v)}
skip = {'none', 'ambiguous'} if '--retry' in args else {'none', 'ambiguous', 'failed'}
todo = {k: v for k, v in missing.items() if state['checked'].get(k) not in skip}
print('녹음 없는 단어', len(missing), '· 이번에 찾을 단어', len(todo), flush=True)
if not todo: sys.exit(0)

# ---------- 2) 녹음 파일 이름 + 그 항목의 강세 (kaikki.org, 위키낱말사전 추출본) ----------
gz = CACHE + 'kaikki-ru.jsonl.gz'
if not os.path.exists(gz) or time.time() - os.path.getmtime(gz) > 30 * 86400:
    print('kaikki 추출본 받는 중 (약 90MB)…', flush=True)
    urllib.request.urlretrieve(KAIKKI, gz)
files, canon = {}, {}
with gzip.open(gz) as fh:
    for line in fh:
        if b'"audio"' not in line: continue
        e = json.loads(line)
        cf = [nf(x['form']) for x in e.get('forms', []) or [] if 'canonical' in (x.get('tags') or [])] or [nf(e.get('word', ''))]
        for s in e.get('sounds', []) or []:
            f = (s.get('audio') or '').replace('_', ' ')
            if not AUD.search(f): continue
            w = word_of(f) or plain(e.get('word', ''))
            if w in todo:
                files.setdefault(w, []); f in files[w] or files[w].append(f)
                canon.setdefault(f, []); [canon[f].append(c) for c in cf if c not in canon[f]]

# ---------- 3) 강세 확인 → 받기 → 다듬기 ----------
js, A, C = read_app()
added = []
for k, forms in todo.items():
    fs = sorted(files.get(k, []), key=lambda f: (0 if f.startswith('LL-Q7737') else 1, len(f)))
    if not fs: state['checked'][k] = 'none'; continue
    F = [nf(x) for x in forms]
    pick = None
    for f in fs:
        cands = [c for c in canon.get(f, []) if plain(c) == k]
        ok = [S for S in F if cands and all(c == S or (mono(c) and plain(c) == plain(S)) for c in cands)]
        if ok: pick = (f, ok[0]); break
    if not pick: state['checked'][k] = 'ambiguous'; continue
    f, S = pick
    name = f.replace(' ', '_'); h = hashlib.md5(name.encode('utf-8')).hexdigest()
    path = h[0] + '/' + h[:2] + '/' + urllib.parse.quote(name)
    data = fetch_file(path)
    if not data: state['checked'][k] = 'failed'; save_state(); continue
    raw = CACHE + h + os.path.splitext(f)[1]; out = CACHE + h + '.mp3'
    open(raw, 'wb').write(data)
    r = subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', raw, '-af', TRIM, '-ac', '1', '-ar', '22050', '-b:a', '32k', out])
    if r.returncode or not os.path.exists(out) or os.path.getsize(out) < 800: state['checked'][k] = 'failed'; continue
    key = k if len(F) == 1 else S          # 강세가 둘인 철자(до́ма / дома́)는 강세 표기로 저장
    A[key] = 'data:audio/mpeg;base64,' + base64.b64encode(open(out, 'rb').read()).decode()
    m = re.match(r'LL-Q7737 \(rus\)-([^-]+)-', f)
    added.append([k, m.group(1).replace('_', ' ') if m else '', f])
    state['checked'][k] = 'ok'; save_state()
    print(f'  + {k} ← {f}', flush=True)
    time.sleep(0.5)
save_state()
if not added: print('새로 넣을 녹음이 없어요.'); sys.exit(0)

# ---------- 4) 출처 · 합치기 · 다시 만들기 ----------
L = licenses(a[2] for a in added)
for k, spk, f in added:
    lic, art = L.get(f, ('', ''))
    C.append([k, spk or art or '위키미디어 공용', lic or '라이선스는 원본 페이지 참조', 'https://commons.wikimedia.org/wiki/File:' + urllib.parse.quote(f.replace(' ', '_'))])
write_app(js, A, C)
print('새 녹음', len(added), '· 전체', len(A))
bump_and_build(f'원어민 녹음 {len(added)}개 추가 (전체 {len(A)}개)')
print('음성 합성도 만들려면: python3 ruquiz/tools/audio/make_tts.py (torch 필요)')
