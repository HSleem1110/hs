#!/usr/bin/env python3
# 발음 검사: 녹음에서 실제로 들리는 음소를 받아 적어(wav2vec2 음소 인식) 표준 발음(espeak-ng)과 자음을 비교해요.
# 합성 음성이 틀리면 다른 입력 방식 · 목소리로 다시 만들어 맞는 것만 남기고, 원어민 녹음이 틀리면 빼요(합성으로 대신 들려줘요).
#
#   python3 ruquiz/tools/audio/qa_audio.py            # 새로 생긴 녹음만 검사 · 고치기
#   python3 ruquiz/tools/audio/qa_audio.py --all      # 전부 다시 검사
#   python3 ruquiz/tools/audio/qa_audio.py --report   # 검사 결과만 보기
# 필요: pip install torch transformers phonemizer numpy (CPU) · apt install espeak-ng · ffmpeg
import json, os, sys, re, base64, subprocess, hashlib, wave
T = os.path.dirname(os.path.abspath(__file__)) + '/'
R = os.path.dirname(os.path.dirname(T.rstrip('/'))) + '/'
CACHE = T + 'cache/'; os.makedirs(CACHE + 'tts', exist_ok=True)
sys.path.insert(0, T)
from pron import nf, plain, respell, silero_text
args = sys.argv[1:]
HEARD_P, QA_P, FIX_P = CACHE + 'heard.json', T + 'qa.json', T + 'tts-fix.json'
heard = json.load(open(HEARD_P, encoding='utf-8')) if os.path.exists(HEARD_P) else {}
qa = json.load(open(QA_P, encoding='utf-8')) if os.path.exists(QA_P) else {}
fixes = json.load(open(FIX_P, encoding='utf-8')) if os.path.exists(FIX_P) else {}
save = lambda p, o: json.dump(o, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=0, sort_keys=True)

# ---------- 자음 비교 (모음 · 강세 · 연음 · 길이는 무시, 조음 위치가 다르면 틀림) ----------
CLS = {}
for cls, chars in {'K': 'ɡgkxɣ', 'P': 'bp', 'M': 'm', 'F': 'vfʋ', 'D': 'dt', 'N': 'nɲŋ', 'S': 'szʂʐɕʑʃʒ', 'R': 'rɾɹʁʀ', 'L': 'lɫʎ', 'J': 'j'}.items():
    for c in chars: CLS[c] = cls
def skel(ipa): return [CLS[c] for c in ipa if c in CLS]
def dist(a, b):
    d = list(range(len(b) + 1))
    for i, x in enumerate(a, 1):
        p, d[0] = d[0], i
        for j, y in enumerate(b, 1): p, d[j] = d[j], min(d[j] + 1, d[j - 1] + 1, p + (x != y))
    return d[len(b)]
def verdict(exp, got):
    e, g = skel(exp), skel(got)
    if not e: return 'ok', 0
    first = bool(g) and e[0] != g[0]                 # 첫 자음이 다르면 (газета → [b]) 바로 틀림
    d = dist(e, g)
    bad = first or d >= max(2, round(len(e) * 0.5))
    return ('bad' if bad else 'ok'), d

# ---------- 앱 단어 · 표준 발음 ----------
wj = CACHE + 'words.json'
if not os.path.exists(wj) or '--all' in args:
    subprocess.run(['node', T + 'collect_words.js', R + 'russian-quiz.html', wj], check=True)
W = json.load(open(wj, encoding='utf-8'))['words']
forms = {}
for k, fs in W.items():
    for key, f in ([(k, fs[0])] if len(fs) == 1 else [(nf(x), x) for x in fs]): forms[key] = f
packs = {'tts': json.load(open(R + 'audio-tts.json', encoding='utf-8')), 'native': json.load(open(R + 'audio-native.json', encoding='utf-8'))}
items = [(p, k) for p, P in packs.items() for k in P if re.search('[а-яё]', k)]
say = {k: respell(forms[k]).replace('+', '') if k in forms else k for _, k in items}
ks = sorted(set(say))
ipa = subprocess.run(['espeak-ng', '-v', 'ru', '-q', '--ipa'], input='\n'.join(say[k] for k in ks), capture_output=True, text=True).stdout.strip().split('\n')
EXP = dict(zip(ks, [x.strip() for x in ipa]))
if '--report' not in args:
    todo = [(p, k) for p, k in items if '--all' in args or f'{p}|{k}' not in qa]
    print('검사할 녹음', len(todo), flush=True)
    if todo:
        import numpy as np, torch
        from transformers import Wav2Vec2Processor, Wav2Vec2ForCTC
        torch.set_num_threads(os.cpu_count() or 4)
        M = 'facebook/wav2vec2-lv-60-espeak-cv-ft'
        proc = Wav2Vec2Processor.from_pretrained(M); asr = Wav2Vec2ForCTC.from_pretrained(M).eval()
        def phones_bytes(raw):
            x = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', 'pipe:0', '-f', 's16le', '-ac', '1', '-ar', '16000', 'pipe:1'], input=raw, capture_output=True).stdout
            x = np.frombuffer(x, dtype=np.int16).astype(np.float32) / 32768
            with torch.no_grad(): lg = asr(proc(x, sampling_rate=16000, return_tensors='pt').input_values).logits
            return proc.batch_decode(torch.argmax(lg, -1))[0]
        uri_bytes = lambda u: base64.b64decode(u.split(',', 1)[1])
        for i, (p, k) in enumerate(todo, 1):
            h = f'{p}|{k}|' + hashlib.md5(packs[p][k].encode()).hexdigest()[:10]
            if h not in heard: heard[h] = phones_bytes(uri_bytes(packs[p][k]))
            v, d = verdict(EXP[k], heard[h])
            qa[f'{p}|{k}'] = {'v': v, 'd': d, 'heard': heard[h], 'exp': EXP[k]}
            if i % 100 == 0: save(HEARD_P, heard); save(QA_P, qa); print(f'  {i}/{len(todo)}', flush=True)
        save(HEARD_P, heard); save(QA_P, qa)

        # ---------- 틀린 합성 음성 고치기: 다른 입력 · 목소리로 만들어 맞는 것만 ----------
        bad = [k for k in packs['tts'] if qa.get(f'tts|{k}', {}).get('v') == 'bad' and k in forms]
        print('틀린 합성 음성', len(bad), flush=True)
        if bad:
            mp = CACHE + 'v4_ru.pt'
            if not os.path.exists(mp): import urllib.request; urllib.request.urlretrieve('https://models.silero.ai/models/tts/ru/v4_ru.pt', mp)
            tts = torch.package.PackageImporter(mp).load_pickle('tts_models', 'model'); tts.to('cpu')
            TRIM = 'silenceremove=start_periods=1:start_threshold=-48dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-48dB:start_silence=0.12,areverse,afade=t=in:st=0:d=0.015,adelay=100:all=1,apad=pad_dur=0.1'   # 앞을 잘라낸 뒤 바로 압축하면 첫소리가 [b]처럼 깨져요 → 짧게 페이드인 + 앞 0.1초 무음
            def synth(text, spk, accent):
                a = tts.apply_tts(text=text, speaker=spk, sample_rate=24000, put_accent=accent, put_yo=True)
                pcm = (a.numpy() * 32767).clip(-32768, 32767).astype(np.int16)
                wav, mp3 = CACHE + 'tts/qa.wav', CACHE + 'tts/qa.mp3'
                with wave.open(wav, 'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000); w.writeframes(pcm.tobytes())
                subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-af', TRIM, '-ac', '1', '-ar', '22050', '-b:a', '32k', mp3], check=True)
                return open(mp3, 'rb').read()
            for k in bad:
                base = respell(forms[k]); bare = base.replace('+', '')
                cands = [(base, 'xenia', True), (bare, 'xenia', True), (base.capitalize(), 'xenia', True), (base + '.', 'xenia', True),
                         (base, 'kseniya', True), (base, 'baya', True), (bare, 'kseniya', True), (base, 'eugene', True), (base, 'aidar', True)]
                best = None
                for text, spk, acc in cands:
                    try: mp3 = synth(text, spk, acc)
                    except Exception: continue
                    got = phones_bytes(mp3); v, d = verdict(EXP[k], got)
                    if v == 'ok' and (best is None or d < best[0]): best = (d, text, spk, mp3, got)
                    if v == 'ok' and d == 0: break
                if best:
                    d, text, spk, mp3, got = best
                    packs['tts'][k] = 'data:audio/mpeg;base64,' + base64.b64encode(mp3).decode()
                    fixes[k] = {'base': base, 'text': text, 'speaker': spk}
                    qa[f'tts|{k}'] = {'v': 'fixed', 'd': d, 'heard': got, 'exp': EXP[k], 'text': text, 'speaker': spk}
                    print(f'  고침 {k}: {qa[f"tts|{k}"]["heard"]}  ← {text} · {spk}', flush=True)
                else:
                    print(f'  못 고침 {k}: 들린 소리 {qa[f"tts|{k}"]["heard"]} / 표준 {EXP[k]}', flush=True)
            json.dump(packs['tts'], open(R + 'audio-tts.json', 'w', encoding='utf-8'), ensure_ascii=False)
            save(FIX_P, fixes); save(QA_P, qa)

        # ---------- 틀린 원어민 녹음은 빼요 (그 단어는 합성 음성으로 들려줘요) ----------
        badn = [k for k in packs['native'] if qa.get(f'native|{k}', {}).get('v') == 'bad' and qa.get(f'tts|{k}', {}).get('v') in ('ok', 'fixed')
                and skel(EXP[k])[:1] != skel(qa[f'native|{k}']['heard'])[:1]]     # 첫 자음부터 다른 확실한 경우만
        if badn:
            for k in badn: packs['native'].pop(k); qa[f'native|{k}']['v'] = 'removed'
            json.dump(packs['native'], open(R + 'audio-native.json', 'w', encoding='utf-8'), ensure_ascii=False)
            save(QA_P, qa)
            print('뺀 원어민 녹음', len(badn), badn, flush=True)

from collections import Counter
for p in ('tts', 'native'):
    c = Counter(v['v'] for kk, v in qa.items() if kk.startswith(p + '|'))
    print(p, dict(c))
left = sorted(k.split('|', 1)[1] for k, v in qa.items() if k.startswith('tts|') and v['v'] == 'bad')
if left: print('아직 틀린 합성 음성:', ' '.join(left))
