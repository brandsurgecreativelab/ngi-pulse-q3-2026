const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
const p = await (await b.newContext({ viewport: { width: 1600, height: 900 } })).newPage();
await p.goto('http://localhost:8768/habits2.html'); await p.waitForFunction('window.ready');
const S=[0,5,10,15.5,21,26.5,33,39.5,46];
for (let i=1;i<=8;i++){ const t=S[i]-0.45; await p.evaluate(t=>render(t), t);
 const out = await p.evaluate((t)=>{ const R=roofAt(t), top=R-(958.78-485.18)*CSY; const res=[];
  const w=document.createTreeWalker(document.getElementById('stage'),NodeFilter.SHOW_TEXT);
  while(w.nextNode()){ const n=w.currentNode; if(!n.textContent.trim()) continue; let e=n.parentElement, skip=false, op=1;
   for(let x=e;x&&x.id!=='stage';x=x.parentElement){ if(x.matches('.card,.pill,#s8c,svg')||/row/.test(x.className)) skip=true; op*=+getComputedStyle(x).opacity; }
   if(skip||op<0.5) continue; const r=document.createRange(); r.selectNodeContents(n);
   for(const q of r.getClientRects()){ if(q.bottom>top && q.top<R) res.push(`OVERLAP "${n.textContent.trim().slice(0,24)}" y${Math.round(q.top)}-${Math.round(q.bottom)}`); } }
  return `band ${Math.round(top)}-${Math.round(R)} ` + (res.join(' ; ')||'clear'); }, t);
 console.log('scene', i, out); }
await b.close(); })();
