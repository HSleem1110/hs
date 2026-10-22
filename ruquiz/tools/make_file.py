# russian-quiz.html 다시 만들기: app.js · app.css · audio-*.json · version.json → russian-quiz.html
# 사용: python3 ruquiz/tools/make_file.py [--artifact <경로>]
#   app.js / app.css / audio-*.json 을 고치고 version.json 의 ver · notes 를 올린 뒤 실행하세요.
#   version.json 의 packs(소리 팩 지문)는 이 스크립트가 채워요. 오프라인 파일은 지문이 바뀐 팩만 새로 받아요.
#   --artifact 를 주면 claude.ai 아티팩트에 올릴 페이지도 함께 만들어요.
import re, json, os, sys, base64, hashlib
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
F = R + 'tools/fonts/'
V = json.load(open(R + 'version.json', encoding='utf-8'))
VER = V['ver']
css = open(R + 'app.css', encoding='utf-8').read()
js = open(R + 'app.js', encoding='utf-8').read()
assert '</script' not in js.lower()

PACKS = {'native': 'audio-native.json', 'tts': 'audio-tts.json', 'ttsm': 'audio-tts-m.json'}
packs, pack_tags = {}, []
for name, fn in PACKS.items():
    if not os.path.exists(R + fn): continue
    data = open(R + fn, encoding='utf-8').read()
    assert '</script' not in data.lower()
    h = hashlib.sha256(data.encode()).hexdigest()[:16]
    old = (V.get('packs') or {}).get(name, {})
    packs[name] = {'file': fn, 'hash': h, 'ver': old.get('ver', VER) if old.get('hash') == h else VER, 'mb': round(len(data.encode()) / 1e6, 2)}
    pack_tags.append(f'<script type="application/json" id="pack-{name}" data-ver="{packs[name]["ver"]}" data-hash="{h}">{data}</script>')
V.update({'css': 'app.css', 'js': 'app.js', 'html': 'russian-quiz.html', 'packs': packs})
json.dump(V, open(R + 'version.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
packs_html = '\n'.join(pack_tags)

faces = []
for sub, body in re.findall(r'/\* ([a-z-]+) \*/\s*@font-face \{(.*?)\}', open(F + 'ptserif.css').read(), re.S):
    if sub not in ('cyrillic', 'latin'): continue
    fp = F + re.search(r'url\((.*?)\)', body).group(1).rsplit('/', 1)[1]
    b64 = base64.b64encode(open(fp, 'rb').read()).decode()
    faces.append('@font-face{' + re.sub(r"src: url\(.*?\) format\('woff2'\);", f"src: url(data:font/woff2;base64,{b64}) format('woff2');", body).replace('\n', '') + '}')
fontcss = '\n'.join(faces)

# 부트스트랩: 브라우저에 받아 둔 더 새 앱 코드가 있으면 그걸, 없으면 파일 안의 코드를 실행해요.
# 업데이트 확인 · 다운로드는 앱 코드(app.js)가 해요. 그래서 업데이트 방식도 업데이트로 바꿀 수 있어요.
boot = r'''(async function(){
  var EMBED = "__VER__";
  function cmp(a, b){ a = String(a).split(".").map(Number); b = String(b).split(".").map(Number);
    for(var i=0; i<Math.max(a.length,b.length); i++){ var d = (a[i]||0) - (b[i]||0); if(d) return d; } return 0; }
  function get(k){ return new Promise(function(res){ try{ var q = indexedDB.open("ruquiz-app", 1);
    q.onupgradeneeded = function(){ q.result.createObjectStore("kv"); };
    q.onsuccess = function(){ try{ var t = q.result.transaction("kv").objectStore("kv").get(k); t.onsuccess = function(){ res(t.result); }; t.onerror = function(){ res(null); }; }catch(e){ res(null); } };
    q.onerror = function(){ res(null); }; }catch(e){ res(null); } }); }
  var stored = await get("app");
  var use = stored && cmp(stored.ver, EMBED) > 0 ? stored : null;
  window.RQ = { ver: use ? use.ver : EMBED, embedded: EMBED };
  if(use) document.getElementById("app-css").textContent = use.css;
  var s = document.createElement("script");
  s.textContent = use ? use.js : document.getElementById("app-js").textContent;
  document.body.appendChild(s);
})();'''.replace('__VER__', VER)

html = f'''<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="claude:viewport-fit-sides" content="cover">
<title>러시아어 문법 퀴즈</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@400;500;600;700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet">
<style>
:root{{ padding-top:env(safe-area-inset-top,0px); padding-bottom:env(safe-area-inset-bottom,0px); }}
[hidden]{{ display:none!important; }} img{{ max-width:100%; }}
{fontcss}
</style>
<style id="app-css">
{css}</style>
</head>
<body>
<div id="app"></div>
{packs_html}
<script type="text/plain" id="app-js">
{js}</script>
<script>
{boot}
</script>
</body>
</html>
'''
open(R + 'russian-quiz.html', 'w', encoding='utf-8').write(html)
print('built', VER, round(len(html.encode()) / 1e6, 2), 'MB', {k: v['mb'] for k, v in packs.items()})

if '--artifact' in sys.argv:
    # 아티팩트 페이지는 16MB까지라 소리 팩은 따로 올리는 파일(pack-이름.js)로 내보내요: 페이지 옆 같은 폴더에 생겨요.
    out = sys.argv[sys.argv.index('--artifact') + 1]
    od = os.path.dirname(os.path.abspath(out))
    pack_js = []
    for name, p in packs.items():
        data = open(R + p['file'], encoding='utf-8').read()
        open(f'{od}/pack-{name}.js', 'w', encoding='utf-8').write(f'(window.RQ_PACKS = window.RQ_PACKS || {{}}).{name} = {data};\n')
        pack_js.append(f'<script src="pack-{name}.js"></script>')
    art = ('<title>러시아어 문법 퀴즈</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n'
           '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
           '<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@400;500;600;700&family=PT+Sans:wght@400;700&family=PT+Serif:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">\n'
           '<style>' + css + '</style>\n<div id="app"></div>\n' + '\n'.join(pack_js) + '\n<script>' + js + '</script>\n')
    open(out, 'w', encoding='utf-8').write(art)
    print('artifact page', out, round(len(art.encode()) / 1e6, 2), 'MB · 따로 올릴 파일', ' '.join(f'pack-{n}.js' for n in packs))
