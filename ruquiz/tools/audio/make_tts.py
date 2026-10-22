#!/usr/bin/env python3
# 앱의 모든 러시아어 단어를 Silero v5.6 러시아어 음성 합성으로 만들어 소리 팩에 넣어요. 목소리는 두 개예요.
#   여성 baya  → ruquiz/audio-tts.json     (기록: tts-text.json,   고친 단어: tts-fix.json)
#   남성 eugene → ruquiz/audio-tts-m.json  (기록: tts-text-m.json, 고친 단어: tts-fix-m.json)
# 강세는 앱의 강세 표기(́)를 그대로 써요: приглаша́ть → приглаш+ать. 발음 예외는 pron.py 규칙대로 고쳐 적어요.
# 모델 · 목소리 · 글자가 그대로인 단어는 건너뛰어요. 하나라도 바뀌면 그 단어만 다시 만들어요.
#
#   pip install torch --index-url https://download.pytorch.org/whl/cpu && pip install numpy scipy
#   python3 ruquiz/tools/audio/make_tts.py [--voice f|m] [--words words.json] [--all] [--dry]
#   (그다음 반드시 qa_audio.py 로 발음 검사)
#
# 모델: Silero Models (github.com/snakers4/silero-models) v5_6_ru, CC BY-NC 4.0 — 비영리 개인 학습용.
# v4 xenia 는 г로 시작하는 단어를 [б]처럼 읽어서 쓰지 않아요(сравнение: qa_audio.py).
import json, os, sys, re, base64, hashlib, subprocess, urllib.request, wave
T = os.path.dirname(os.path.abspath(__file__)) + '/'
R = os.path.dirname(os.path.dirname(T.rstrip('/'))) + '/'
CACHE = T + 'cache/'; os.makedirs(CACHE + 'tts', exist_ok=True)
MODEL_ID, MODEL_URL, RATE, BITRATE = 'v5_6_ru', 'https://models.silero.ai/models/tts/ru/v5_6_ru.pt', 24000, '24k'
VOICES = {'f': {'speaker': 'baya', 'pack': 'audio-tts.json', 'meta': 'tts-text.json', 'fix': 'tts-fix.json'},
          'm': {'speaker': 'eugene', 'pack': 'audio-tts-m.json', 'meta': 'tts-text-m.json', 'fix': 'tts-fix-m.json'}}
TRIM = 'silenceremove=start_periods=1:start_threshold=-48dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-48dB:start_silence=0.12,areverse,afade=t=in:st=0:d=0.015,adelay=100:all=1,apad=pad_dur=0.1'   # 앞을 잘라낸 뒤 바로 압축하면 첫소리가 [b]처럼 깨져요 → 짧게 페이드인 + 앞 0.1초 무음
args = sys.argv[1:]
sys.path.insert(0, T)
from pron import nf, plain, silero_text, respell, phon, VOW

def load(p, default): return json.load(open(p, encoding='utf-8')) if os.path.exists(p) else default
def sig(text, spk): return f'{MODEL_ID}|{spk}|{BITRATE}|{text}'     # 이 녹음을 무엇으로 만들었는지

_model = None
def model():
    global _model
    if _model is None:
        import torch
        torch.set_num_threads(max(1, os.cpu_count() or 1))
        mp = CACHE + MODEL_ID + '.pt'
        if not os.path.exists(mp): urllib.request.urlretrieve(MODEL_URL, mp)
        _model = torch.package.PackageImporter(mp).load_pickle('tts_models', 'model'); _model.to('cpu')
    return _model

def synth(text, spk):
    # 한 단어를 합성해 mp3 바이트로 (캐시)
    import numpy as np
    h = hashlib.md5(sig(text, spk).encode()).hexdigest()
    mp3 = CACHE + 'tts/' + h + '.mp3'
    if not os.path.exists(mp3):
        a = model().apply_tts(text=text, speaker=spk, sample_rate=RATE, put_accent=True, put_yo=True)
        pcm = (a.numpy() * 32767).clip(-32768, 32767).astype(np.int16)
        wav = CACHE + 'tts/' + h + '.wav'
        with wave.open(wav, 'wb') as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(RATE); w.writeframes(pcm.tobytes())
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-af', TRIM, '-ac', '1', '-ar', '22050', '-b:a', BITRATE, mp3], check=True)
        os.remove(wav)
    return open(mp3, 'rb').read()

def app_forms(W):
    # 팩 키 → 앱의 강세 표기. 강세가 둘인 같은 철자(до́ма / дома́)는 강세 표기를 키로 따로
    out = {}
    for k, fs in W.items():
        if not re.search('[а-яё]', k): continue                  # 글자가 없는 것(—)은 건너뛰어요
        for key, f in ([(k, fs[0])] if len(fs) == 1 else [(nf(x), x) for x in fs]): out[key] = f
    return out

if __name__ == '__main__':
    wj = args[args.index('--words') + 1] if '--words' in args else CACHE + 'words.json'
    if '--words' not in args:
        subprocess.run(['node', T + 'collect_words.js', R + 'russian-quiz.html', wj], check=True)
    forms = app_forms(json.load(open(wj, encoding='utf-8'))['words'])
    voices = [args[args.index('--voice') + 1]] if '--voice' in args else list(VOICES)
    for v in voices:
        V = VOICES[v]; spk0 = V['speaker']
        PACK, META = R + V['pack'], T + V['meta']
        pack = {} if '--all' in args else load(PACK, {})
        meta = {} if '--all' in args else load(META, {})
        fixes = load(T + V['fix'], {})
        jobs = []
        for key, f in forms.items():
            base = respell(f); text, spk = base, spk0
            fx = fixes.get(key)
            if fx and fx.get('base') == base and fx.get('model') == MODEL_ID:
                if fx.get('mode') in ('swap', 'drop'): continue      # 발음 검사가 다른 목소리로 바꿨거나 뺀 단어는 그대로 둬요
                text, spk = fx['text'], fx['speaker']                # 발음 검사에서 맞게 나온 방식
            if key not in pack or meta.get(key) != sig(text, spk): jobs.append((key, f, text, spk))
        print(f'[{v} {spk0}] 만들 단어', len(jobs), '· 팩에 있는 단어', len(pack), flush=True)
        if '--dry' in args:
            for key, f, text, spk in jobs[:80]: print('  ', f, '→', text, spk)
            continue
        for i, (key, f, text, spk) in enumerate(jobs, 1):
            try: data = synth(text, spk)
            except Exception as e: print('  건너뜀', f, e, flush=True); continue
            pack[key] = 'data:audio/mpeg;base64,' + base64.b64encode(data).decode()
            meta[key] = sig(text, spk)
            if i % 200 == 0:
                json.dump(pack, open(PACK, 'w', encoding='utf-8'), ensure_ascii=False); json.dump(meta, open(META, 'w', encoding='utf-8'), ensure_ascii=False)
                print(f'  {i}/{len(jobs)}', flush=True)
        for k in [k for k in pack if k not in forms]: pack.pop(k); meta.pop(k, None)   # 앱에서 빠진 단어
        json.dump(pack, open(PACK, 'w', encoding='utf-8'), ensure_ascii=False)
        json.dump(meta, open(META, 'w', encoding='utf-8'), ensure_ascii=False, indent=0, sort_keys=True)
        print(f'DONE [{v} {spk0}] 합성 음성', len(pack), '개 ·', round(os.path.getsize(PACK) / 1e6, 2), 'MB', flush=True)
    print('다음: python3 ruquiz/tools/audio/qa_audio.py 로 발음을 검사하세요.')
