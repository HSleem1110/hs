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

# ---------- 철자와 발음이 다른 단어 (합성할 때만 발음대로 고쳐 적어요. 앱에 보이는 글자는 그대로) ----------
# 표준 발음(орфоэпия) 규칙이에요. 단어를 추가할 때 새 예외가 있으면 여기에 더해 주세요.
VOW = 'аеёиоуыэюя'
OGO_KEEP = {'много', 'немного', 'строго', 'нестрого', 'дорого', 'недорого', 'убого', 'полого', 'отлого'}   # г를 그대로 읽는 -ого
CHN_SHN = {'конечно', 'скучно', 'скучный', 'скучная', 'скучное', 'скучные', 'нарочно', 'яичница', 'скворечник',
           'прачечная', 'пустячный', 'двоечник', 'троечник', 'горчичник'}                                  # чн → [шн]
HARD_E = {'кафе': 'кафэ', 'кофе': 'кофэ', 'компьютер': 'компьютэр', 'компьютеры': 'компьютэры', 'гипотеза': 'гипотэза',
          'тест': 'тэст', 'тесты': 'тэсты', 'отель': 'отэль', 'модель': 'модэль', 'интернет': 'интэрнэт', 'свитер': 'свитэр',
          'теннис': 'тэннис', 'шоссе': 'шоссэ', 'пюре': 'пюрэ', 'резюме': 'резюмэ', 'бизнес': 'бизнэс', 'менеджер': 'мэнэджэр',
          'сессия': 'сэссия', 'тема': 'тэма', 'темп': 'тэмп', 'стенд': 'стэнд', 'бутерброд': 'бутэрброд', 'майонез': 'майонэз',
          'тире': 'тирэ', 'фонетика': 'фонэтика', 'антенна': 'антэнна', 'шедевр': 'шэдэвр', 'кодекс': 'кодэкс', 'индекс': 'индэкс',
          'тоннель': 'тоннэль', 'детектив': 'дэтэктив', 'кашне': 'кашнэ', 'пенсне': 'пенснэ', 'кабаре': 'кабарэ'}   # 외래어 [э]
CLUSTERS = [('вств', 'ств'), ('лнц', 'нц'), ('рдц', 'рц'), ('здн', 'зн'), ('стн', 'сн'), ('стл', 'сл'),
            ('нтск', 'нск'), ('ндск', 'нск'), ('сч', 'щ'), ('зч', 'щ'), ('жч', 'щ'), ('гк', 'хк'), ('гч', 'хч')]  # 묵음 · 동화
def phon(p):
    if p in HARD_E: p = HARD_E[p]
    if (re.search(r'[ое]го$', p) and p not in OGO_KEEP) or p.startswith('сегодня'):
        p = re.sub(r'([ое])го$', r'\1во', p) if not p.startswith('сегодня') else p.replace('сегодня', 'севодня', 1)   # г → [в]
    p = re.sub(r'^(ни|кое-)?что', lambda m: (m.group(1) or '') + 'што', p).replace('чтоб', 'штоб')                 # что → [што]
    if p in CHN_SHN: p = p.replace('чн', 'шн')
    for a, b in CLUSTERS: p = p.replace(a, b)
    p = re.sub(r'ться$|тся$', 'цца', p)                                                                          # -ться / -тся → [цца]
    if p == 'бог': p = 'бох'
    return p
def respell(form):
    s = nf(form); p = s.replace('́', '')
    q = phon(p)
    if q == p: return silero_text(form)
    idx, n = None, -1                      # 강세가 몇 번째 모음인지 기억했다가 같은 모음 앞에 '+'
    for ch in s:
        if ch in VOW: n += 1
        if ch == '́': idx = n
    if idx is None: return q
    out, n = '', -1
    for ch in q:
        if ch in VOW:
            n += 1
            if n == idx: out += '+'
        out += ch
    return out

wj = args[args.index('--words') + 1] if '--words' in args else CACHE + 'words.json'
if '--words' not in args:
    subprocess.run(['node', T + 'collect_words.js', R + 'russian-quiz.html', wj], check=True)
W = json.load(open(wj, encoding='utf-8'))['words']
pack = {} if ('--all' in args or not os.path.exists(PACK)) else json.load(open(PACK, encoding='utf-8'))
META = T + 'tts-text.json'   # 팩 키 → 합성에 쓴 글자
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
    text = respell(form)
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
    meta[key] = text
    if text != silero_text(form): print(f'  발음대로: {form} → {text}', flush=True)
    if i % 100 == 0:
        json.dump(pack, open(PACK, 'w', encoding='utf-8'), ensure_ascii=False)
        print(f'  {i}/{len(jobs)}', flush=True)
json.dump(pack, open(PACK, 'w', encoding='utf-8'), ensure_ascii=False)
json.dump(meta, open(META, 'w', encoding='utf-8'), ensure_ascii=False, indent=0, sort_keys=True)
print('DONE 합성 음성', len(pack), '개 ·', round(os.path.getsize(PACK) / 1e6, 2), 'MB', flush=True)
