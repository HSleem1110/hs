#!/usr/bin/env python3
# 발음 검사: 녹음마다 실제로 들리는 소리를 인식기로 받아 적어 표준 발음과 비교해요. 판정은 두 인식기가 함께 해요.
#   A. 음소 인식기(wav2vec2 espeak-cv-ft, 여러 언어) → 표준 발음(위키낱말사전 IPA, 없으면 espeak-ng)과 자음을 비교
#   B. 러시아어 음성 인식기(wav2vec2-large-xlsr-53-russian) → 철자와 비교. 자음은 엄격하게(유·무성 동화만 허용),
#      약화되는 모음은 허용, 강세 모음은 정확히.
#   A와 B가 엇갈리면 C. Whisper(러시아어)로 한 번 더 듣고 다수결로 정해요.
# 합성 음성이 틀리면 → 강세 표기를 지킨 다른 입력 방식 · 같은 성별의 다른 목소리로 다시 만들어 통과한 것만 남겨요.
#   그래도 안 되면 → 통과한 다른 성별 합성 음성을 대신 넣고, 그것도 없으면 그 목소리에서 빼서 원어민 녹음으로 들려줘요.
# 원어민 녹음이 틀리면(그 단어의 합성 음성은 통과) → 빼요. 출처 목록에서도 빼고, fetch_audio.py가 다시 받지 않게 적어 둬요.
# 끝까지 통과하지 못한 녹음은 qa-review.md 에 남겨요(사람이 직접 들어 볼 것).
#
#   python3 ruquiz/tools/audio/qa_audio.py            # 새로 생긴 · 바뀐 녹음만 검사하고 고치기
#   python3 ruquiz/tools/audio/qa_audio.py --all      # 전부 다시 검사
#   python3 ruquiz/tools/audio/qa_audio.py --report   # 결과만 보기
# 필요: pip install torch transformers phonemizer numpy scipy (CPU) · apt install espeak-ng · ffmpeg
#       위키낱말사전 IPA는 fetch_audio.py가 받아 둔 kaikki 추출본(cache/kaikki-ru.jsonl.gz)에서 읽어요.
import json, os, sys, re, base64, subprocess, hashlib, gzip, unicodedata
T = os.path.dirname(os.path.abspath(__file__)) + '/'
R = os.path.dirname(os.path.dirname(T.rstrip('/'))) + '/'
CACHE = T + 'cache/'
sys.path.insert(0, T)
from pron import nf, respell
import make_tts
args = sys.argv[1:]
QA_P, REVIEW_P, STATE_P = T + 'qa.json', T + 'qa-review.md', T + 'state.json'
load = lambda p, d: json.load(open(p, encoding='utf-8')) if os.path.exists(p) else d
save = lambda p, o: json.dump(o, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=0, sort_keys=True)
NFC = lambda s: unicodedata.normalize('NFC', s)
qa = load(QA_P, {})
HEARD = {j: load(CACHE + f'heard{s}.json', {}) for j, s in (('a', ''), ('b', '-ru'), ('c', '-whisper'))}
PACKS = {'native': 'audio-native.json', 'tts': 'audio-tts.json', 'ttsm': 'audio-tts-m.json'}
VOICE_OF = {'tts': 'f', 'ttsm': 'm'}
OTHER = {'tts': 'ttsm', 'ttsm': 'tts'}
BACKUP = {'f': ['kseniya'], 'm': ['aidar']}          # 같은 성별의 다른 목소리 (xenia는 г를 [б]로 읽어서 빼요)
EXTRA = {'заяц': ['з+аец'], 'льду': ['ль д+у']}      # Silero가 철자대로는 못 읽는 단어: 발음대로 적은 후보 (за́яц [ˈzajɪt͡s], льду [lʲdu])
OLDTRIM = set(load(T + 'native-oldtrim.json', []))  # 예전 방식(첫소리 잘림)으로 다듬은 채 원본을 다시 못 받은 원어민 녹음

# ---------- A. 자음 비교 (음소 인식기) ----------
# espeak-ng · 위키낱말사전은 л을 ɫ · ɭ로 적어요. 인식기는 х를 ʁ · χ · ç로, ф를 θ로, в를 w로 적기도 하고,
# 연음 д/т/г를 ɟ · c(구개 파열음)나 dʒ · tɕ(파찰음)로, х/ф를 h · ħ로 듣기도 해요. 그런 소리는 두 쪽 다 맞는 걸로 봐요.
CLS = {}
for cls, chars in {'K': 'ɡgkxɣqχʁç', 'P': 'bp', 'M': 'm', 'F': 'vfʋθβw', 'D': 'dtð', 'N': 'nɲŋ', 'S': 'szʂʐɕʑʃʒ', 'R': 'rɾɹʀ', 'L': 'lɫʎɭ', 'J': 'j',
                   'G': 'ɟc', 'H': 'hħ', 'C': 'Ꮳ'}.items():
    for c in chars: CLS[c] = cls
AFF = re.compile('t[sʃɕʂ]|d[zʒʑʐ]')
EITHER = {'G': 'KD', 'H': 'KF', 'C': 'SD', 'P': 'F', 'F': 'P'}   # 애매한 소리: 이 중 어느 쪽이어도 맞음 (б · в · п · ф는 인식기가 자주 헷갈려요)
ASP = re.compile('(?<=[ptkɕʃs])h')                # 기식음 표시(tɕh)는 빼요
VOWEL0 = re.compile(r'^[\[ˈˌ"(]*[aɑʌɐəeɛɪiɨyɵouʊæøɔ]')
def skel(ipa, exp=None):
    # 자음 뼈대. й는 인식기가 자주 빼먹거나 덧붙여서 빼요. 겹자음(сс · дд)은 하나로. 모음으로 시작하는 단어 앞에 덧붙은 h · x · w는 빼요.
    raw = ASP.sub('', ipa.replace(' ', '').replace('͡', '').replace('(', '').replace(')', ''))
    if exp is not None and VOWEL0.match(exp): raw = raw.lstrip('hħxwʔç')
    s = [CLS[c] for c in AFF.sub('Ꮳ', raw) if c in CLS and CLS[c] != 'J']
    return [c for i, c in enumerate(s) if i == 0 or c != s[i - 1]]
def same(x, y): return x == y or y in EITHER.get(x, '') or x in EITHER.get(y, '')
CLUSTER0 = {'PD', 'DK', 'KD', 'PK', 'KP', 'DP', 'FS', 'FD', 'FC', 'SD', 'SK', 'SP'}   # 단어 첫머리 자음 묶음 (앞 자음이 약하게 들려요)
def dist(a, b, cost=lambda x, y: 0 if same(x, y) else 1, gap=lambda x: 1):
    d = [0]
    for y in b: d.append(d[-1] + gap(y))
    for x in a:
        p, d[0] = d[0], d[0] + gap(x)
        for j, y in enumerate(b, 1): p, d[j] = d[j], min(d[j] + gap(x), d[j - 1] + gap(y), p + cost(x, y))
    return d[len(b)]
def verdict_a(exp, got):
    e, g = skel(exp), skel(got, exp)
    if not e: return True, 0
    first = bool(g) and not same(e[0], g[0])          # 첫 자음이 다르면 (газета → [b]) 바로 틀림
    if first and len(e) > 1 and same(e[1], g[0]) and (e[0] + e[1] in CLUSTER0): first = False   # 이 인식기는 첫머리 пт · тк · кт · вс 의 앞 자음을 못 들어요
    d = dist(e, g)
    return not (first or d >= max(2, round(len(e) * 0.5))), d

# ---------- B · C. 철자 비교 (러시아어 인식기 · Whisper) ----------
VOW = 'аеёиоуыэюя'
VCLS = {'а': 'A', 'о': 'A', 'ё': 'O', 'е': 'I', 'э': 'I', 'и': 'I', 'ы': 'I', 'я': 'I', 'у': 'U', 'ю': 'U'}   # 약화되면 같은 소리
VFINE = {'а': 'a', 'я': 'ä', 'о': 'o', 'ё': 'o', 'е': 'e', 'э': 'e', 'и': 'i', 'ы': 'y', 'у': 'u', 'ю': 'u'}    # 강세 모음은 정확히
SOFT = {('o', 'e'), ('ä', 'e'), ('ä', 'a'), ('a', 'ä'), ('e', 'ä'), ('e', 'i')}   # ё → е, я[æ] ↔ а/е, 연음 사이 е → и (смотре́ть → ‘смотрить’)
VOICE_PAIR = str.maketrans('бвгдзж', 'пфктсш')    # 유·무성 동화 (хлеб → [хлеп], вчера → [фчера])
def letters(s):
    # 비교용 기호열: 자음 글자(유·무성 합침) + 모음 등급. й · ь · ъ · 띄어쓰기 · 문장부호는 빼고, 겹자음은 하나로
    s = NFC(s.lower()).replace('́', '').replace('+', '')
    out, vf = [], []
    for ch in s:
        if ch in VOW: out.append(VCLS[ch]); vf.append(VFINE[ch])
        elif 'а' <= ch <= 'я' and ch not in 'йьъ':
            c = ch.translate(VOICE_PAIR)
            if not (out and out[-1] == c): out.append(c)
    return out, vf
def stressed_index(form):
    f = NFC(form.lower())
    vi = -1
    for i, ch in enumerate(f):
        if ch in VOW: vi += 1
        if ch == '́' or (ch == 'ё' and '́' not in f): return vi
        if ch == '+' and i + 1 < len(f) and f[i + 1] in VOW: return vi + 1
    return None
isv = lambda x: x in 'AIUO'
def vcost(x, y): return 0 if x == y or (x == 'O' and y in 'AI') or (y == 'O' and x in 'AI') else (0.5 if isv(x) and isv(y) else 1)
def verdict_txt(form, got, syll=False):
    # 기대 철자(앱 철자 · 발음대로 고쳐 쓴 철자) 중 가장 가까운 것과 비교해요.
    # 인식기가 단어 앞 숨소리를 한 글자 전치사(в · у · с · к · о)로 덧붙여 적는 버릇은 떼고 봐요.
    tok = re.sub(r'[^\w\s-]', ' ', NFC(got.lower())).split()
    if len(tok) > 1 and len(tok[0]) == 1 and tok[0] in 'вускоиыэа' and not NFC(form.lower()).startswith(tok[0] + ' '):
        a, b = verdict_txt(form, ' '.join(tok[1:]), syll), verdict_txt(form, ''.join(tok), syll)   # 떼고 본 것 · 붙여 본 것 중 나은 쪽 (а эропорту → аэропорту)
        return a if a[0] or (not b[0] and a[1] <= b[1]) else b
    f0 = NFC(form.lower()).replace('\u0301', '')
    if re.search('[аеоуяю]и$', f0) and re.search('[аеоуяю]й$', got.strip().lower()): got = got.strip()[:-1] + 'и'   # 끝 -аи · -еи를 ‘-ай’로 적는 것 (урожа́и → урожай)
    g, gv = letters(got)
    if not g: return False, 9.0
    best = (False, 9.0)
    for exp in (form, respell(form)):
        e, ev = letters(exp)
        if not e: return True, 0.0
        d = dist(e, g, vcost, lambda x: 0.5 if isv(x) else 1)
        first = not isv(e[0]) and g[0] != e[0]                 # 첫 자음은 반드시 같아야
        si = stressed_index(form) if len(ev) == len(gv) else None
        st_ok = si is None or si >= len(ev) or ev[si] == gv[si] or (ev[si], gv[si]) in SOFT   # ё를 е로, 연음 사이 я[æ]를 е로 적는 건 허용
        n = len(e); tol = 0.5 if n <= 4 else 1.0 if n <= 9 else 1.5
        sy_ok = not syll or not ev or len(ev) == len(gv)          # 합성 음성은 음절 수가 꼭 같아야 (ду́маете를 ‘думайте’로 줄이면 틀림)
        ok = not first and st_ok and sy_ok and d <= tol
        if ok or d < best[1]: best = (ok, d)
        if ok: break
    return best

# ---------- 앱 단어 · 표준 발음 ----------
wj = CACHE + 'words.json'
if not os.path.exists(wj) or '--all' in args:
    subprocess.run(['node', T + 'collect_words.js', R + 'russian-quiz.html', wj], check=True)
forms = make_tts.app_forms(json.load(open(wj, encoding='utf-8'))['words'])
packs = {p: load(R + f, {}) for p, f in PACKS.items()}
items = [(p, k) for p, P in packs.items() for k in P if re.search('[а-яё]', k)]
keys = sorted({k for _, k in items})
say = {k: respell(forms[k]).replace('+', '') if k in forms else k for k in keys}
ipa = subprocess.run(['espeak-ng', '-v', 'ru', '-q', '--ipa'], input='\n'.join(say[k] for k in keys), capture_output=True, text=True).stdout.strip().split('\n')
EXP = dict(zip(keys, [x.strip() for x in ipa]))
WIKT_P = CACHE + 'wikt-ipa.json'
if not os.path.exists(WIKT_P) or '--all' in args:
    want, wikt = {NFC(forms.get(k, k).lower().replace('́', '')) for k in keys}, {}
    with gzip.open(CACHE + 'kaikki-ru.jsonl.gz', 'rt', encoding='utf-8') as fh:
        for line in fh:
            if '"ipa"' not in line: continue
            o = json.loads(line); w = NFC(o.get('word', '').lower())
            if w not in want: continue
            head = next((f['form'] for f in o.get('forms', []) if 'canonical' in f.get('tags', [])), w)
            for s in o.get('sounds', []):
                if 'ipa' in s: wikt.setdefault(w, []).append([NFC(head.lower()), s['ipa']])
    save(WIKT_P, wikt)
wikt = load(WIKT_P, {})
for k in keys:   # 위키낱말사전 IPA (강세가 앱 표기와 같은 항목) 가 있으면 그걸 표준으로
    f = forms.get(k, k); ents = wikt.get(NFC(f.lower().replace('́', '')), [])
    ent = next((i for h, i in ents if h == NFC(f.lower())), None) or (ents[0][1] if ents and stressed_index(f) is None else None)
    if ent: EXP[k] = ent.split('|')[0].strip()
FORM = {k: forms.get(k, k) for k in keys}

# ---------- 인식기 ----------
_m = {}
def model(j):
    if j not in _m:
        import torch
        torch.set_num_threads(os.cpu_count() or 4)
        if j == 'c':
            from transformers import WhisperProcessor, WhisperForConditionalGeneration
            mid = 'openai/whisper-small'
            _m[j] = (WhisperProcessor.from_pretrained(mid), WhisperForConditionalGeneration.from_pretrained(mid).eval())
        else:
            from transformers import Wav2Vec2Processor, Wav2Vec2ForCTC
            mid = {'a': 'facebook/wav2vec2-lv-60-espeak-cv-ft', 'b': 'jonatasgrosman/wav2vec2-large-xlsr-53-russian'}[j]
            _m[j] = (Wav2Vec2Processor.from_pretrained(mid), Wav2Vec2ForCTC.from_pretrained(mid).eval())
    return _m[j]
def pcm(raw):
    import numpy as np
    x = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', 'pipe:0', '-f', 's16le', '-ac', '1', '-ar', '16000', 'pipe:1'], input=raw, capture_output=True).stdout
    return np.frombuffer(x, dtype=np.int16).astype(np.float32) / 32768
def hear(j, raw):
    h = hashlib.md5(raw).hexdigest()
    if h not in HEARD[j]:
        import torch
        pr, m = model(j); x = pcm(raw)
        with torch.no_grad():
            if j == 'c':
                ids = m.generate(pr(x, sampling_rate=16000, return_tensors='pt').input_features, language='ru', task='transcribe')
                HEARD[j][h] = pr.batch_decode(ids, skip_special_tokens=True)[0].strip()
            else:
                lg = m(pr(x, sampling_rate=16000, return_tensors='pt').input_values).logits
                HEARD[j][h] = pr.batch_decode(torch.argmax(lg, -1))[0]
    return HEARD[j][h]
def judge(k, raw, syll=True):
    # 녹음 하나 판정: A와 B가 같으면 그대로, 엇갈리면 C(Whisper)까지 들어 다수결. syll: 음절 수까지 엄격히(합성 음성)
    a = hear('a', raw); b = hear('b', raw)
    av, ad = verdict_a(EXP[k], a); bv, bd = verdict_txt(FORM[k], b, syll)
    r = {'a': a, 'b': b, 'ad': ad, 'bd': bd, 'av': av, 'bv': bv}
    if av != bv:
        c = hear('c', raw); cv, cd = verdict_txt(FORM[k], c, syll); r.update(c=c, cd=cd, cv=cv)
        r['ok'] = cv
    else: r['ok'] = av
    r['score'] = ad + bd + r.get('cd', 0)
    return r
def save_heard():
    for j, s in (('a', ''), ('b', '-ru'), ('c', '-whisper')): save(CACHE + f'heard{s}.json', HEARD[j])
raw_of = lambda u: base64.b64decode(u.split(',', 1)[1])
digest = lambda u: hashlib.md5(u.encode()).hexdigest()[:12]
data_uri = lambda mp3: 'data:audio/mpeg;base64,' + base64.b64encode(mp3).decode()
NAME = {'native': '원어민 녹음', 'tts': '합성 여성(baya)', 'ttsm': '합성 남성(eugene)'}

if '--report' not in args:
    # ---------- 1) 전부 듣기 ----------
    todo = [(p, k) for p, k in items if '--all' in args or qa.get(f'{p}|{k}', {}).get('h') != digest(packs[p][k])]
    print('검사할 녹음', len(todo), flush=True)
    for i, (p, k) in enumerate(todo, 1):
        r = judge(k, raw_of(packs[p][k]), syll=p != 'native')
        prev = qa.get(f'{p}|{k}', {})
        qa[f'{p}|{k}'] = {**r, 'v': 'ok' if r['ok'] else 'bad', 'exp': EXP[k], 'h': digest(packs[p][k]), **({'from': prev['from']} if prev.get('from') else {})}
        if i % 200 == 0: save_heard(); save(QA_P, qa); print(f'  {i}/{len(todo)}', flush=True)
    save_heard(); save(QA_P, qa)
    if '--hear-only' in args: sys.exit(0)

    # ---------- 2) 틀린 합성 음성 다시 만들기 ----------
    # A · B 중 하나라도 틀렸다고 한 합성 음성은 다시 만들어 봐요. A · B가 모두 맞다고 하는 것을 가장 먼저 골라요.
    # (Whisper는 비슷한 진짜 단어로 고쳐 듣는 버릇이 있어서 동점일 때만 써요.)
    strict = lambda r: r.get('av') and r.get('bv')
    for p, vk in VOICE_OF.items():
        V = make_tts.VOICES[vk]; fixes = load(T + V['fix'], {}); meta = load(T + V['meta'], {})
        bad = [k for k in packs[p] if k in forms and qa.get(f'{p}|{k}', {}).get('v') in ('bad', 'ok', 'unfixed') and not strict(qa[f'{p}|{k}'])]
        bad += [k for k, fx in fixes.items() if fx.get('mode') in ('swap', 'drop') and k in forms and k not in bad]   # 다른 목소리로 대신했거나 뺀 단어도 다시 해 봐요
        print(f'[{p} {V["speaker"]}] 다시 만들어 볼 합성 음성', len(bad), flush=True)
        for n, k in enumerate(bad, 1):
            was_ok = qa.get(f'{p}|{k}', {}).get('v') == 'ok' and k in packs[p] and not fixes.get(k, {}).get('mode')
            base = respell(forms[k]); cap = base[:1].upper() + base[1:]
            texts = [base, cap, base + '.', base + '!', cap + '.', '— ' + base]
            # SSML: 앞에 짧은 쉼 · 천천히 (첫머리 ц · пт · тк 같은 소리가 또렷해져요)
            ssml = [f'<speak><prosody rate="slow">{base}</prosody></speak>', f'<speak><break time="250ms"/><prosody rate="slow">{base}</prosody></speak>',
                    f'<speak><break time="250ms"/>{base}</speak>', f'<speak><prosody rate="x-slow">{base}</prosody></speak>']
            for alt in EXTRA.get(k, []):   # 발음대로 고쳐 쓴 철자 (pron.py 규칙으로는 안 되는 단어)
                texts += [alt, f'<speak><prosody rate="slow">{alt}</prosody></speak>']; ssml += [f'<speak><prosody rate="slow">{alt}</prosody></speak>']
            cands = [(t, V['speaker']) for t in texts + ssml] + [(t, s) for s in BACKUP[vk] for t in [base, base + '.', cap] + ssml]
            best, major = None, None
            for text, spk in cands:
                try: mp3 = make_tts.synth(text, spk)
                except Exception: continue
                r = judge(k, mp3)
                if strict(r) and (best is None or r['score'] < best[0]): best = (r['score'], text, spk, mp3, r)
                elif r['ok'] and (major is None or r['score'] < major[0]): major = (r['score'], text, spk, mp3, r)
                if strict(r) and r['score'] == 0: break
            pick = best or (None if was_ok or fixes.get(k, {}).get('mode') else major)   # 대신 넣은 · 뺀 단어는 두 인식기가 모두 맞다고 할 때만 바꿔요
            if pick:
                _, text, spk, mp3, r = pick
                packs[p][k] = data_uri(mp3); meta[k] = make_tts.sig(text, spk)
                fixes[k] = {'base': base, 'text': text, 'speaker': spk, 'model': make_tts.MODEL_ID}
                qa[f'{p}|{k}'] = {**r, 'v': 'fixed', 'text': text, 'speaker': spk, 'exp': EXP[k], 'h': digest(packs[p][k])}
                print(f'  고침 {k}: A[{r["a"]}] B[{r["b"]}] ← {text} · {spk}', flush=True)
            elif was_ok:
                print(f'  그대로 {k}: C[{qa[f"{p}|{k}"].get("c", "")}]가 맞다고 해서 원래 녹음 유지', flush=True)
            elif fixes.get(k, {}).get('mode'):
                print(f'  그대로 {k}: 다시 해도 통과하지 않아 {fixes[k]["mode"]} 유지', flush=True)
            else:
                qa[f'{p}|{k}']['v'] = 'unfixed'
                print(f'  못 고침 {k}: A[{qa[f"{p}|{k}"]["a"]}] B[{qa[f"{p}|{k}"]["b"]}]', flush=True)
            if n % 20 == 0: save_heard(); save(QA_P, qa)
        json.dump(packs[p], open(R + PACKS[p], 'w', encoding='utf-8'), ensure_ascii=False)
        save(T + V['fix'], fixes); save(T + V['meta'], meta); save(QA_P, qa); save_heard()

    # ---------- 3) 두 인식기가 모두 맞다고 하지 않은 합성 음성 → 통과한 원어민 녹음(빼서 그걸로) → 통과한 다른 성별 합성 음성 ----------
    passed = lambda p, k: qa.get(f'{p}|{k}', {}).get('v') in ('ok', 'fixed')
    sure = lambda p, k: passed(p, k) and strict(qa[f'{p}|{k}']) and not qa[f'{p}|{k}'].get('from')
    for p, vk in VOICE_OF.items():
        V = make_tts.VOICES[vk]; fixes = load(T + V['fix'], {}); meta = load(T + V['meta'], {})
        for k in [k for k in list(packs[p]) if k in forms and (qa.get(f'{p}|{k}', {}).get('v') == 'unfixed' or (passed(p, k) and not strict(qa[f'{p}|{k}'])))]:
            o = OTHER[p]; base = respell(forms[k])
            if sure('native', k):
                packs[p].pop(k); meta.pop(k, None)
                fixes[k] = {'base': base, 'mode': 'drop', 'model': make_tts.MODEL_ID}
                qa[f'{p}|{k}']['v'] = 'dropped'
                print(f'  [{p}] {k}: 합성 음성에서 빼고 원어민 녹음으로', flush=True)
            elif sure(o, k) and k in packs[o]:
                packs[p][k] = packs[o][k]; meta[k] = 'swap:' + o
                fixes[k] = {'base': base, 'mode': 'swap', 'from': o, 'model': make_tts.MODEL_ID}
                qa[f'{p}|{k}'] = {**qa[f'{o}|{k}'], 'v': 'swapped', 'from': o, 'h': digest(packs[p][k])}
                print(f'  [{p}] {k}: 다른 성별 목소리로 대신', flush=True)
        json.dump(packs[p], open(R + PACKS[p], 'w', encoding='utf-8'), ensure_ascii=False)
        save(T + V['fix'], fixes); save(T + V['meta'], meta); save(QA_P, qa)

    # ---------- 4) 틀린 원어민 녹음은 빼요 (그 단어의 합성 음성이 통과했을 때만 = 인식기 탓이 아닐 때) ----------
    tts_ok = lambda k: all(passed(p, k) or qa.get(f'{p}|{k}', {}).get('v') == 'swapped' for p in VOICE_OF if k in packs[p])
    first_bad = lambda v: (lambda e, g: bool(e and g) and not same(e[0], g[0]) or (bool(e) and not g))(skel(v['exp']), skel(v['a'], v['exp']))
    tts_sure = lambda k: all(sure(p, k) or (qa.get(f'{p}|{k}', {}).get('v') == 'swapped' and strict(qa[f'{p}|{k}'])) for p in VOICE_OF if k in packs[p])
    badn = [k for k in packs['native'] if k in forms and (
        (qa.get(f'native|{k}', {}).get('v') == 'bad' and tts_ok(k)) or
        (k in OLDTRIM and not strict(qa.get(f'native|{k}', {})) and first_bad(qa[f'native|{k}']) and tts_sure(k)))]   # 첫소리가 잘린 예전 녹음
    if badn:
        state = load(STATE_P, {'checked': {}})
        for k in badn:
            packs['native'].pop(k); qa[f'native|{k}']['v'] = 'removed'; state.setdefault('checked', {})[k] = 'qa-removed'
        json.dump(packs['native'], open(R + PACKS['native'], 'w', encoding='utf-8'), ensure_ascii=False)
        js = open(R + 'app.js', encoding='utf-8').read()
        m = re.search(r'const LL_CREDITS = (\[.*?\]);\n', js)
        if m:   # 출처 목록에서도 빼요
            gone = {NFC(k.replace('́', '')) for k in badn} | {NFC(k) for k in badn}
            C = [c for c in json.loads(m.group(1)) if NFC(c[0]) not in gone]
            js = js[:m.start(1)] + json.dumps(C, ensure_ascii=False) + js[m.end(1):]
            open(R + 'app.js', 'w', encoding='utf-8').write(js)
        save(QA_P, qa); json.dump(state, open(STATE_P, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print('뺀 원어민 녹음', len(badn), ' '.join(badn), flush=True)

# ---------- 결과 ----------
from collections import Counter
live = lambda kk: kk.split('|', 1)[1] in packs[kk.split('|', 1)[0]] or qa[kk]['v'] in ('removed', 'dropped')
for p in PACKS:
    print(p, dict(Counter(v['v'] for kk, v in qa.items() if kk.startswith(p + '|') and live(kk))))
strict_ok = lambda v: v.get('av') and v.get('bv')
review = [(kk, v) for kk, v in sorted(qa.items()) if live(kk) and v['v'] in ('bad', 'unfixed', 'ok', 'fixed', 'swapped') and not strict_ok(v)]
lines = ['# 직접 들어 볼 녹음', '', '두 인식기(음소 인식기 A · 러시아어 인식기 B)가 모두 맞다고 하지는 않은 녹음이에요. 앱에서 들어 보고 이상하면 알려 주세요.',
         '‘엇갈림’은 A와 B 중 하나만 맞다고 해서 Whisper(C)로 정한 것, ‘틀림’은 끝까지 고치지 못한 것이에요.', '']
for kk, v in review:
    p, k = kk.split('|', 1)
    tag = '틀림' if v['v'] in ('bad', 'unfixed') else '엇갈림'
    lines.append(f'- {FORM.get(k, k)} · {NAME[p]} · {tag} · A [{v.get("a", "")}] · B [{v.get("b", "")}]' + (f' · C [{v["c"]}]' if v.get('c') else ''))
open(REVIEW_P, 'w', encoding='utf-8').write('\n'.join(lines) + '\n')
print('직접 들어 볼 녹음', len(review), '→', REVIEW_P)
