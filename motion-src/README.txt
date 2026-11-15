Source for assets/pulse-habits.mp4.
Render: npm i @fontsource/libre-franklin playwright, serve this folder on :8766, run node render.js, then
ffmpeg -f concat -safe 0 -i list.txt -c copy -movflags +faststart pulse-habits.mp4
