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
TRIM = 'silenceremove=start_periods=1:start_threshold=-48dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-48dB:start_silence=0.12,areverse'
PACK = R + 'audio-tts.json'
args = sys.argv[1:]

nf = lambda x: unicodedata.normalize('NFC', x).lower().replace('̀', '')
plain = lambda x: nf(x).replace('́', '')
def silero_text(form):
    # 강세 부호(모음 뒤 U+0301)를 Silero 표기(모음 앞 '+')로
    s = unicodedata.normalize('NFC', form).replace('̀', '')
    out = ''
    for ch in s:
        if ch == '́' and out: out = out[:-1] + '+' + out[-1]
        else: out += ch
    return out

wj = args[args.index('--words') + 1] if '--words' in args else CACHE + 'words.json'
if '--words' not in args:
    subprocess.run(['node', T + 'collect_words.js', R + 'russian-quiz.html', wj], check=True)
W = json.load(open(wj, encoding='utf-8'))['words']
pack = {} if ('--all' in args or not os.path.exists(PACK)) else json.load(open(PACK, encoding='utf-8'))

jobs = []   # (pack key, stressed form)
for k, forms in W.items():
    if len(forms) == 1:
        if k not in pack: jobs.append((k, forms[0]))
    else:
        for f in forms:                           # 강세가 둘인 철자는 강세 표기를 키로
            if nf(f) not in pack: jobs.append((nf(f), f))
print('만들 단어', len(jobs), '· 이미 있는 단어', len(pack), flush=True)
if not jobs: sys.exit(0)

import torch, numpy as np
torch.set_num_threads(max(1, os.cpu_count() or 1))
mp = CACHE + 'v4_ru.pt'
if not os.path.exists(mp): urllib.request.urlretrieve(MODEL_URL, mp)
model = torch.package.PackageImporter(mp).load_pickle('tts_models', 'model'); model.to('cpu')

for i, (key, form) in enumerate(jobs, 1):
    text = silero_text(form)
    h = hashlib.md5((SPEAKER + '|' + text).encode()).hexdigest()
    mp3 = CACHE + 'tts/' + h + '.mp3'
    if not os.path.exists(mp3):
        try:
            a = model.apply_tts(text=text, speaker=SPEAKER, sample_rate=RATE, put_accent=True, put_yo=True)
        except Exception as e:
            print('  건너뜀', form, e, flush=True); continue
        pcm = (a.numpy() * 32767).clip(-32768, 32767).astype(np.int16)
        wav = CACHE + 'tts/' + h + '.wav'
        with wave.open(wav, 'wb') as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(RATE); w.writeframes(pcm.tobytes())
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-af', TRIM, '-ac', '1', '-ar', '22050', '-b:a', '32k', mp3], check=True)
        os.remove(wav)
    pack[key] = 'data:audio/mpeg;base64,' + base64.b64encode(open(mp3, 'rb').read()).decode()
    if i % 100 == 0:
        json.dump(pack, open(PACK, 'w', encoding='utf-8'), ensure_ascii=False)
        print(f'  {i}/{len(jobs)}', flush=True)
json.dump(pack, open(PACK, 'w', encoding='utf-8'), ensure_ascii=False)
print('DONE 합성 음성', len(pack), '개 ·', round(os.path.getsize(PACK) / 1e6, 2), 'MB', flush=True)
