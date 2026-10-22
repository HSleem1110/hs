#!/usr/bin/env python3
# 앱의 모든 러시아어 단어를 Silero v4 러시아어 음성 합성(xenia)으로 만들어 ruquiz/audio-tts.json 에 넣어요.
# 강세는 앱의 강세 표기(́)를 그대로 써요: приглаша́ть → пригла+шать. 이미 있는 단어는 건너뛰어요.
#
#   pip install torch --index-url https://download.pytorch.org/whl/cpu && pip install numpy
#   python3 ruquiz/tools/audio/make_tts.py [--words words.json] [--all]
#
# 모델: Silero Models (github.com/snakers4/silero-models), CC BY-NC 4.0 — 비영리 개인 학습용.
import json, os, sys, re, base64, hashlib, subprocess, unicodedata, urllib.request, wave
T = os.path.dirname(os.path.abspath(__file__)) + '/'
R = os.path.dirname(os.path.dirname(T.rstrip('/'))) + '/'
CACHE = T + 'cache/'; os.makedirs(CACHE + 'tts', exist_ok=True)
MODEL_URL, SPEAKER, RATE = 'https://models.silero.ai/models/tts/ru/v4_ru.pt', 'xenia', 24000
TRIM = 'silenceremove=start_periods=1:start_threshold=-48dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-48dB:start_silence=0.12,areverse,afade=t=in:st=0:d=0.015,adelay=100:all=1,apad=pad_dur=0.1'   # 앞을 잘라낸 뒤 바로 압축하면 첫소리가 [b]처럼 깨져요 → 짧게 페이드인 + 앞 0.1초 무음
PACK = R + 'audio-tts.json'
args = sys.argv[1:]

sys.path.insert(0, T)
from pron import nf, plain, silero_text, respell, phon, VOW

wj = args[args.index('--words') + 1] if '--words' in args else CACHE + 'words.json'
if '--words' not in args:
    subprocess.run(['node', T + 'collect_words.js', R + 'russian-quiz.html', wj], check=True)
W = json.load(open(wj, encoding='utf-8'))['words']
pack = {} if ('--all' in args or not os.path.exists(PACK)) else json.load(open(PACK, encoding='utf-8'))
META = T + 'tts-text.json'   # 팩 키 → 합성에 쓴 글자
FIXES = json.load(open(T + 'tts-fix.json', encoding='utf-8')) if os.path.exists(T + 'tts-fix.json') else {}   # 발음 검사(qa_audio.py)가 고친 단어
meta = {} if '--all' in args else (json.load(open(META, encoding='utf-8')) if os.path.exists(META) else {})

jobs = []   # (pack key, stressed form)
for k, forms in W.items():
    if not re.search('[а-яё]', k): continue                  # 글자가 없는 것(—)은 건너뛰어요
    for key, f in ([(k, forms[0])] if len(forms) == 1 else [(nf(f), f) for f in forms]):   # 강세가 둘인 철자는 강세 표기를 키로
        want = respell(f)
        if key not in pack or meta.get(key, silero_text(f)) != want: jobs.append((key, f))
print('만들 단어', len(jobs), '· 이미 있는 단어', len(pack), flush=True)
if '--dry' in args:
    for key, f in jobs: print('  ', f, '→', respell(f))
    sys.exit(0)
if not jobs: sys.exit(0)

import torch, numpy as np
torch.set_num_threads(max(1, os.cpu_count() or 1))
mp = CACHE + 'v4_ru.pt'
if not os.path.exists(mp): urllib.request.urlretrieve(MODEL_URL, mp)
model = torch.package.PackageImporter(mp).load_pickle('tts_models', 'model'); model.to('cpu')

for i, (key, form) in enumerate(jobs, 1):
    text = respell(form); spk = SPEAKER
    fx = FIXES.get(key)
    if fx and fx.get('base') == text: text, spk = fx['text'], fx['speaker']   # 검사에서 맞게 나온 방식으로
    h = hashlib.md5((spk + '|' + text).encode()).hexdigest()
    mp3 = CACHE + 'tts/' + h + '.mp3'
    if not os.path.exists(mp3):
        try:
            a = model.apply_tts(text=text, speaker=spk, sample_rate=RATE, put_accent=True, put_yo=True)
        except Exception as e:
            print('  건너뜀', form, e, flush=True); continue
        pcm = (a.numpy() * 32767).clip(-32768, 32767).astype(np.int16)
        wav = CACHE + 'tts/' + h + '.wav'
        with wave.open(wav, 'wb') as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(RATE); w.writeframes(pcm.tobytes())
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-af', TRIM, '-ac', '1', '-ar', '22050', '-b:a', '32k', mp3], check=True)
        os.remove(wav)
    pack[key] = 'data:audio/mpeg;base64,' + base64.b64encode(open(mp3, 'rb').read()).decode()
    meta[key] = respell(form)
    if text != silero_text(form): print(f'  발음대로: {form} → {text}', flush=True)
    if i % 100 == 0:
        json.dump(pack, open(PACK, 'w', encoding='utf-8'), ensure_ascii=False)
        print(f'  {i}/{len(jobs)}', flush=True)
json.dump(pack, open(PACK, 'w', encoding='utf-8'), ensure_ascii=False)
json.dump(meta, open(META, 'w', encoding='utf-8'), ensure_ascii=False, indent=0, sort_keys=True)
print('DONE 합성 음성', len(pack), '개 ·', round(os.path.getsize(PACK) / 1e6, 2), 'MB', flush=True)
print('다음: python3 ruquiz/tools/audio/qa_audio.py 로 새 녹음의 발음을 검사하세요.')
