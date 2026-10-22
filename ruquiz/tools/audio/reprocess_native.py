#!/usr/bin/env python3
# 원어민 녹음을 원본 파일에서 다시 받아 지금 방식(TRIM)으로 다시 다듬어요. 다듬는 방식을 바꿨을 때 한 번 실행하세요.
import json, os, re, sys, hashlib, base64, subprocess, urllib.parse, urllib.request
T = os.path.dirname(os.path.abspath(__file__)) + '/'; R = os.path.dirname(os.path.dirname(T.rstrip('/'))) + '/'
CACHE = T + 'cache/raw/'; os.makedirs(CACHE, exist_ok=True)
src = open(T + 'fetch_audio.py', encoding='utf-8').read()
TRIM = re.search(r"^TRIM = '(.*?)'", src, re.M).group(1)
MIRROR, UPLOAD = 'https://ftpmirror.your.org/pub/wikimedia/images/wikipedia/commons/', 'https://upload.wikimedia.org/wikipedia/commons/'
js = open(R + 'app.js', encoding='utf-8').read()
C = json.loads(re.search(r'const LL_CREDITS = (\[.*?\]);\n', js).group(1))
A = json.load(open(R + 'audio-native.json', encoding='utf-8'))
done, miss = 0, []
for word, spk, lic, url in C:
    key = word if word in A else next((k for k in A if k.replace('́', '') == word), None)
    if not key: continue
    name = urllib.parse.unquote(url.split('File:', 1)[1]).replace(' ', '_')
    h = hashlib.md5(name.encode('utf-8')).hexdigest(); path = h[0] + '/' + h[:2] + '/' + urllib.parse.quote(name)
    raw = CACHE + h + os.path.splitext(name)[1]
    if not os.path.exists(raw):
        data = None
        for base in (MIRROR, UPLOAD):
            try:
                with urllib.request.urlopen(urllib.request.Request(base + path, headers={'User-Agent': 'RuQuizAudioFetch/1.0'}), timeout=60) as r: data = r.read(); break
            except Exception: pass
        if not data: miss.append(word); continue
        open(raw, 'wb').write(data)
    out = CACHE + h + '.mp3'
    r = subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', raw, '-af', TRIM, '-ac', '1', '-ar', '22050', '-b:a', '32k', out])
    if r.returncode or os.path.getsize(out) < 800: miss.append(word); continue
    A[key] = 'data:audio/mpeg;base64,' + base64.b64encode(open(out, 'rb').read()).decode(); done += 1
    if done % 100 == 0: print(done, flush=True)
json.dump(A, open(R + 'audio-native.json', 'w', encoding='utf-8'), ensure_ascii=False)
print('DONE 다시 다듬음', done, '· 원본을 못 받아 그대로 둔 것', len(miss), miss[:30], flush=True)
