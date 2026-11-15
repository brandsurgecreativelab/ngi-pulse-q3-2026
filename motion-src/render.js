const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
  const p = await (await b.newContext({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1.2 })).newPage();
  await p.goto('http://localhost:8768/habits2.html'); await p.waitForFunction('window.ready');
  const S = await p.evaluate(() => window.SCENES), FPS = 30;
  const list = [];
  for (let i = 0; i < S.length - 1; i++) {
    const f0 = Math.round(S[i] * FPS), f1 = Math.round(S[i + 1] * FPS);
    const tmp = `scene${i}.tmp.mp4`, out = `scene${i}.mp4`;
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', '30', tmp]);
    const done = new Promise((r) => ff.on('close', r));
    for (let f = f0; f < f1; f++) {
      await p.evaluate((t) => render(t), f / FPS);
      const buf = await p.screenshot({ type: 'jpeg', quality: 92 });
      if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    }
    ff.stdin.end();
    const code = await done;
    if (code !== 0) throw new Error('ffmpeg failed scene ' + i);
    fs.renameSync(tmp, out); list.push(`file '${out}'`);
    console.log('scene', i, f1 - f0, 'frames');
  }
  fs.writeFileSync('list.txt', list.join('\n') + '\n');
  await b.close();
})();
