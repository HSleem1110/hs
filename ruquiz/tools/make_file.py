# russian-quiz.html 다시 만들기: app.js · app.css · version.json → russian-quiz.html
# 사용: python3 ruquiz/tools/make_file.py   (app.js / app.css 를 고치고 version.json 의 ver · notes 를 올린 뒤 실행)
import re, json, os, base64
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
F = R + 'tools/fonts/'
V = json.load(open(R + 'version.json', encoding='utf-8'))
VER = V['ver']
SRC = 'https://raw.githubusercontent.com/HSleem1110/hs/claude/video-completion-automation-wq7tsc/ruquiz/'
css = open(R + 'app.css', encoding='utf-8').read()
js = open(R + 'app.js', encoding='utf-8').read()
assert '</script' not in js.lower()
faces = []
for sub, body in re.findall(r'/\* ([a-z-]+) \*/\s*@font-face \{(.*?)\}', open(F + 'ptserif.css').read(), re.S):
    if sub not in ('cyrillic', 'latin'): continue
    fp = F + re.search(r'url\((.*?)\)', body).group(1).rsplit('/', 1)[1]
    b64 = base64.b64encode(open(fp, 'rb').read()).decode()
    faces.append('@font-face{' + re.sub(r"src: url\(.*?\) format\('woff2'\);", f"src: url(data:font/woff2;base64,{b64}) format('woff2');", body).replace('\n', '') + '}')
fontcss = '\n'.join(faces)
boot = r'''(async function(){
  var EMBED = "__VER__", SRC = "__SRC__";
  try{ var o = localStorage.getItem("rq-src"); if(o) SRC = o; }catch(e){}   /* 시험용 */
  function cmp(a, b){ a = String(a).split(".").map(Number); b = String(b).split(".").map(Number);
    for(var i=0; i<Math.max(a.length,b.length); i++){ var d = (a[i]||0) - (b[i]||0); if(d) return d; } return 0; }
  function db(){ return new Promise(function(res, rej){ var r = indexedDB.open("ruquiz-app", 1);
    r.onupgradeneeded = function(){ r.result.createObjectStore("kv"); }; r.onsuccess = function(){ res(r.result); }; r.onerror = function(){ rej(r.error); }; }); }
  function get(k){ return db().then(function(d){ return new Promise(function(res, rej){ var t = d.transaction("kv").objectStore("kv").get(k); t.onsuccess = function(){ res(t.result); }; t.onerror = function(){ rej(t.error); }; }); }); }
  function put(k, v){ return db().then(function(d){ return new Promise(function(res, rej){ var tx = d.transaction("kv", "readwrite"); tx.objectStore("kv").put(v, k); tx.oncomplete = function(){ res(); }; tx.onerror = function(){ rej(tx.error); }; }); }); }
  var stored = null;
  try{ stored = await get("app"); }catch(e){}
  var use = stored && cmp(stored.ver, EMBED) > 0 ? stored : null;
  var RQ = window.RQ = { ver: use ? use.ver : EMBED, embedded: EMBED, available: null, busy: false, status: "" };
  function changed(){ window.dispatchEvent(new Event("rq-change")); }
  function fetchText(name){ return fetch(SRC + name + "?t=" + Date.now(), { cache: "no-store" }).then(function(r){ if(!r.ok) throw new Error(r.status); return r.text(); }); }
  RQ.check = async function(manual){
    if(RQ.busy) return; RQ.busy = true; if(manual){ RQ.status = "확인하는 중…"; changed(); }
    try{
      var v = JSON.parse(await fetchText("version.json"));
      if(cmp(v.ver, RQ.ver) > 0){ RQ.available = v; RQ.status = "새 버전 " + v.ver + "이(가) 있어요."; }
      else { RQ.available = null; RQ.status = "최신 버전이에요. (" + new Date().toLocaleString("ko-KR") + " 확인)"; }
    }catch(e){ RQ.status = navigator.onLine ? "업데이트 서버에 연결하지 못했어요. 잠시 뒤 다시 확인해 주세요." : "인터넷에 연결되어 있지 않아요. 지금 버전으로 계속 풀 수 있어요."; }
    RQ.busy = false; changed();
  };
  RQ.apply = async function(){
    var v = RQ.available; if(!v || RQ.busy) return;
    RQ.busy = true; RQ.status = "새 버전을 받는 중…"; changed();
    try{
      var parts = await Promise.all([fetchText(v.css), fetchText(v.js)]);
      await put("app", { ver: v.ver, css: parts[0], js: parts[1], at: Date.now() });
      RQ.status = "적용했어요. 다시 여는 중…"; changed(); location.reload(); return;
    }catch(e){ RQ.status = "이 브라우저에는 새 버전을 저장할 수 없어요. ‘최신 파일로 저장’으로 새 파일을 받아 바꿔 주세요."; }
    RQ.busy = false; changed();
  };
  RQ.saveFile = async function(){
    if(RQ.busy) return; RQ.busy = true; RQ.status = "최신 파일을 받는 중…"; changed();
    try{
      var v = RQ.available || JSON.parse(await fetchText("version.json"));
      var h = await fetchText(v.html);
      var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([h], { type: "text/html" })); a.download = "russian-quiz.html";
      document.body.appendChild(a); a.click(); a.remove();
      RQ.status = "최신 파일(" + v.ver + ")을 저장했어요. 그 파일로 바꿔 쓰세요.";
    }catch(e){ RQ.status = "파일을 받지 못했어요. 인터넷 연결을 확인해 주세요."; }
    RQ.busy = false; changed();
  };
  if(use) document.getElementById("app-css").textContent = use.css;
  var s = document.createElement("script");
  s.textContent = use ? use.js : document.getElementById("app-js").textContent;
  document.body.appendChild(s);
  if(navigator.onLine) setTimeout(function(){ RQ.check(false); }, 1200);
  window.addEventListener("online", function(){ RQ.check(false); });
})();'''.replace('__VER__', VER).replace('__SRC__', SRC)

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
<script type="text/plain" id="app-js">
{js}</script>
<script>
{boot}
</script>
</body>
</html>
'''
open(R + 'russian-quiz.html', 'w', encoding='utf-8').write(html)
print('built', VER, round(len(html.encode()) / 1e6, 2), 'MB')
