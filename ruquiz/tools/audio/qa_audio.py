#!/usr/bin/env python3
# 발음 검사: 녹음에서 실제로 들리는 음소를 받아 적어(wav2vec2 음소 인식) 표준 발음(espeak-ng)과 자음을 비교해요.
#   합성 음성(여성 · 남성)이 틀리면 → 다른 입력 방식 · 같은 성별 목소리로 다시 만들어 맞는 것만 남겨요.
#   원어민 녹음이 첫소리부터 틀리면(두 합성 음성은 맞게 들리는데) → 빼요. 그 단어는 합성 음성으로 들려줘요.
#
#   python3 ruquiz/tools/audio/qa_audio.py            # 새로 생긴 · 바뀐 녹음만 검사하고 고치기
#   python3 ruquiz/tools/audio/qa_audio.py --all      # 전부 다시 검사
#   python3 ruquiz/tools/audio/qa_audio.py --report   # 결과만 보기
# 필요: pip install torch transformers phonemizer numpy scipy (CPU) · apt install espeak-ng · ffmpeg
# 한계: 이 인식기는 단어 첫머리의 [кт] · [кн] 같은 자음 묶음, [в]/[б]를 가끔 잘못 들어요. 그런 단어는 고치지 못하면 원래 녹음을 그대로 둬요.
import json, os, sys, re, base64, subprocess, hashlib
T = os.path.dirname(os.path.abspath(__file__)) + '/'
R = os.path.dirname(os.path.dirname(T.rstrip('/'))) + '/'
CACHE = T + 'cache/'
sys.path.insert(0, T)
from pron import nf, respell
import make_tts
args = sys.argv[1:]
HEARD_P, QA_P = CACHE + 'heard.json', T + 'qa.json'
load = lambda p, d: json.load(open(p, encoding='utf-8')) if os.path.exists(p) else d
save = lambda p, o: json.dump(o, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=0, sort_keys=True)
heard, qa = load(HEARD_P, {}), load(QA_P, {})
PACKS = {'native': 'audio-native.json', 'tts': 'audio-tts.json', 'ttsm': 'audio-tts-m.json'}
VOICE_OF = {'tts': 'f', 'ttsm': 'm'}
BACKUP = {'f': ['kseniya'], 'm': ['aidar']}          # 같은 성별의 다른 목소리 (xenia는 г를 [б]로 읽어서 빼요)

# ---------- 자음 비교 (모음 · 강세 · 연음 · 길이는 무시, 조음 위치가 다르면 틀림) ----------
# espeak-ng는 л을 ɭ로 적어요. 인식기는 х를 ʁ · χ · ç로, ф를 θ로, в를 w로 적기도 하고,
# 연음 д/т/г를 ɟ · c(구개 파열음)나 dʒ · tɕ(파찰음)로, х/ф를 h · ħ로 듣기도 해요. 그런 소리는 두 쪽 다 맞는 걸로 봐요.
CLS = {}
for cls, chars in {'K': 'ɡgkxɣqχʁç', 'P': 'bp', 'M': 'm', 'F': 'vfʋθβw', 'D': 'dtð', 'N': 'nɲŋ', 'S': 'szʂʐɕʑʃʒ', 'R': 'rɾɹʀ', 'L': 'lɫʎɭ', 'J': 'j',
                   'G': 'ɟc', 'H': 'hħ', 'C': 'Ꮳ'}.items():
    for c in chars: CLS[c] = cls
AFF = re.compile('t[sʃɕ]|d[zʒʑ]')
EITHER = {'G': 'KD', 'H': 'KF', 'C': 'SD', 'P': 'F', 'F': 'P'}   # 애매한 소리: 이 중 어느 쪽이어도 맞음 (б · в · п · ф는 인식기가 자주 헷갈려요)
ASP = re.compile('(?<=[ptkɕʃs])h')                # 기식음 표시(tɕh)는 빼요
VOWEL0 = re.compile(r'^[ˈˌ"]*[aɑʌɐəeɛɪiɨyɵouʊæøɔ]')
def skel(ipa, exp=None):
    # 자음 뼈대. й는 인식기가 자주 빼먹거나 덧붙여서 빼요. 겹자음(сс · дд)은 하나로. 모음으로 시작하는 단어 앞에 덧붙은 h · x · w는 빼요.
    raw = ASP.sub('', ipa.replace(' ', ''))
    if exp is not None and VOWEL0.match(exp): raw = raw.lstrip('hħxwʔç')
    s = [CLS[c] for c in AFF.sub('Ꮳ', raw) if c in CLS and CLS[c] != 'J']
    return [c for i, c in enumerate(s) if i == 0 or c != s[i - 1]]
def same(x, y): return x == y or y in EITHER.get(x, '') or x in EITHER.get(y, '')
def dist(a, b):
    d = list(range(len(b) + 1))
    for i, x in enumerate(a, 1):
        p, d[0] = d[0], i
        for j, y in enumerate(b, 1): p, d[j] = d[j], min(d[j] + 1, d[j - 1] + 1, p + (not same(x, y)))
    return d[len(b)]
def verdict(exp, got):
    e, g = skel(exp), skel(got, exp)
    if not e: return 'ok', 0
    first = bool(g) and not same(e[0], g[0])          # 첫 자음이 다르면 (газета → [b]) 바로 틀림
    d = dist(e, g)
    return ('bad' if first or d >= max(2, round(len(e) * 0.5)) else 'ok'), d

# ---------- 앱 단어 · 표준 발음 ----------
wj = CACHE + 'words.json'
if not os.path.exists(wj) or '--all' in args:
    subprocess.run(['node', T + 'collect_words.js', R + 'russian-quiz.html', wj], check=True)
forms = make_tts.app_forms(json.load(open(wj, encoding='utf-8'))['words'])
packs = {p: load(R + f, {}) for p, f in PACKS.items()}
items = [(p, k) for p, P in packs.items() for k in P if re.search('[а-яё]', k)]
say = {k: respell(forms[k]).replace('+', '') if k in forms else k for _, k in items}
ks = sorted(set(say))
ipa = subprocess.run(['espeak-ng', '-v', 'ru', '-q', '--ipa'], input='\n'.join(say[k] for k in ks), capture_output=True, text=True).stdout.strip().split('\n')
EXP = dict(zip(ks, [x.strip() for x in ipa]))

if '--report' not in args:
    digest = lambda u: hashlib.md5(u.encode()).hexdigest()[:12]
    todo = [(p, k) for p, k in items if '--all' in args or qa.get(f'{p}|{k}', {}).get('h') != digest(packs[p][k])]
    print('검사할 녹음', len(todo), flush=True)
    import numpy as np, torch
    from transformers import Wav2Vec2Processor, Wav2Vec2ForCTC
    torch.set_num_threads(os.cpu_count() or 4)
    MID = 'facebook/wav2vec2-lv-60-espeak-cv-ft'
    proc = Wav2Vec2Processor.from_pretrained(MID); asr = Wav2Vec2ForCTC.from_pretrained(MID).eval()
    def hear(raw):
        h = hashlib.md5(raw).hexdigest()
        if h not in heard:
            x = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', 'pipe:0', '-f', 's16le', '-ac', '1', '-ar', '16000', 'pipe:1'], input=raw, capture_output=True).stdout
            x = np.frombuffer(x, dtype=np.int16).astype(np.float32) / 32768
            with torch.no_grad(): lg = asr(proc(x, sampling_rate=16000, return_tensors='pt').input_values).logits
            heard[h] = proc.batch_decode(torch.argmax(lg, -1))[0]
        return heard[h]
    raw_of = lambda u: base64.b64decode(u.split(',', 1)[1])
    for i, (p, k) in enumerate(todo, 1):
        got = hear(raw_of(packs[p][k])); v, d = verdict(EXP[k], got)
        qa[f'{p}|{k}'] = {'v': v, 'd': d, 'heard': got, 'exp': EXP[k], 'h': digest(packs[p][k])}
        if i % 200 == 0: save(HEARD_P, heard); save(QA_P, qa); print(f'  {i}/{len(todo)}', flush=True)
    save(HEARD_P, heard); save(QA_P, qa)

    # ---------- 틀린 합성 음성 다시 만들기 ----------
    for p, vk in VOICE_OF.items():
        V = make_tts.VOICES[vk]; fixes = load(T + V['fix'], {}); meta = load(T + V['meta'], {})
        bad = [k for k in packs[p] if qa.get(f'{p}|{k}', {}).get('v') == 'bad' and k in forms]
        print(f'[{p} {V["speaker"]}] 틀린 합성 음성', len(bad), flush=True)
        for k in bad:
            base = respell(forms[k]); bare = base.replace('+', '')
            cands = [(t, V['speaker']) for t in (bare, base[:1].upper() + base[1:], base + '.', base + '!')] + [(t, s) for s in BACKUP[vk] for t in (base, bare)]
            best = None
            for text, spk in cands:
                try: mp3 = make_tts.synth(text, spk)
                except Exception: continue
                got = hear(mp3); v, d = verdict(EXP[k], got)
                if v == 'ok' and (best is None or d < best[0]): best = (d, text, spk, mp3, got)
                if v == 'ok' and d == 0: break
            if best:
                d, text, spk, mp3, got = best
                packs[p][k] = 'data:audio/mpeg;base64,' + base64.b64encode(mp3).decode()
                fixes[k] = {'base': base, 'text': text, 'speaker': spk, 'model': make_tts.MODEL_ID}
                meta[k] = make_tts.sig(text, spk)
                qa[f'{p}|{k}'] = {'v': 'fixed', 'd': d, 'heard': got, 'exp': EXP[k], 'text': text, 'speaker': spk, 'h': digest(packs[p][k])}
                print(f'  고침 {k}: [{got}] ← {text} · {spk}', flush=True)
            else:
                print(f'  못 고침(원래 녹음 유지) {k}: 들린 소리 [{qa[f"{p}|{k}"]["heard"]}] / 표준 [{EXP[k]}]', flush=True)
        json.dump(packs[p], open(R + PACKS[p], 'w', encoding='utf-8'), ensure_ascii=False)
        save(T + V['fix'], fixes); save(T + V['meta'], meta); save(QA_P, qa); save(HEARD_P, heard)

    # ---------- 첫소리부터 틀린 원어민 녹음은 빼요 (두 합성 음성은 그 첫소리가 맞게 들릴 때만 = 인식기 탓이 아닐 때) ----------
    ok_first = lambda p, k: qa.get(f'{p}|{k}', {}).get('v') in ('ok', 'fixed')
    first_ok = lambda exp, got: (lambda e, g: not e or not g or same(e[0], g[0]))(skel(exp), skel(got, exp))
    badn = [k for k in packs['native'] if qa.get(f'native|{k}', {}).get('v') == 'bad' and k in EXP
            and not first_ok(EXP[k], qa[f'native|{k}']['heard']) and ok_first('tts', k) and ok_first('ttsm', k)]
    for k in badn: packs['native'].pop(k); qa[f'native|{k}']['v'] = 'removed'
    if badn:
        json.dump(packs['native'], open(R + PACKS['native'], 'w', encoding='utf-8'), ensure_ascii=False); save(QA_P, qa)
    print('뺀 원어민 녹음', len(badn), ' '.join(badn), flush=True)

from collections import Counter
for p in PACKS:
    c = Counter(v['v'] for kk, v in qa.items() if kk.startswith(p + '|') and kk.split('|', 1)[1] in packs[p] or (kk.startswith(p + '|') and v['v'] == 'removed'))
    print(p, dict(c))
for p in ('tts', 'ttsm'):
    left = sorted(k.split('|', 1)[1] for k, v in qa.items() if k.startswith(p + '|') and v['v'] == 'bad' and k.split('|', 1)[1] in packs[p])
    if left: print(f'{p} 검사기가 확신하지 못한 단어(원래 녹음 유지):', ' '.join(left))
