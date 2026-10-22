// 앱에 나오는 러시아어 단어(강세 표기 포함)와 이미 녹음이 있는 단어를 뽑아요.
// 사용: node collect_words.js <russian-quiz.html> <out.json>
const path = require('path'), fs = require('fs'), cp = require('child_process');
let pw; try{ pw = require('playwright'); }catch(e){ pw = require(path.join(cp.execSync('npm root -g').toString().trim(), 'playwright')); }
(async () => {
  const exe = process.env.PW_CHROMIUM || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
  const b = await pw.chromium.launch({ executablePath: exe, args: ['--no-proxy-server'] });
  const pg = await b.newPage();
  await pg.goto('file://' + path.resolve(process.argv[2])); await pg.waitForSelector('.cat', { timeout: 60000 });
  const r = await pg.evaluate(() => {
    const M = {}; const add = t => { if(!t) return; const k = llKey(t); if(/\s/.test(k.trim())) return; t = t.normalize('NFC'); (M[k] = M[k] || []).includes(t) || M[k].push(t); };
    VOCAB.forEach(w => add(w.w));
    Object.values(DATA).forEach(d => d.words.forEach(w => { add(w.ruS); add(w.plS); }));
    V3.verbs.forEach(v => { add(v.inf); (v.forms || []).forEach(add); });
    MODD.adjs.forEach(a => { add(a.w); (a.forms || []).forEach(add); });
    V3.places.forEach(p => { add(p.nom); add(p.form); });
    const have = Object.keys(LL_AUDIO);
    return { words: M, have };
  });
  fs.writeFileSync(process.argv[3], JSON.stringify(r));
  console.log('words', Object.keys(r.words).length, 'with audio keys', r.have.length);
  await b.close();
})();
