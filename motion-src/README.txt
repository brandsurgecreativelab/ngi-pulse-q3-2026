Source for assets/pulse-habits-v4.mp4.
poses/ are the supplied line-art poses; colourise.py fills them with Nedgroup primary/secondary greens into col/.
Serve this folder on :8768, then: node render.js && ffmpeg -f concat -safe 0 -i list.txt -c copy -movflags +faststart pulse-habits-v4.mp4, then re-encode at -crf 25 -preset slow -tune animation for the web
Scene poses: 1 P03, 2 P04, 3 P08, 4 P06, 5 P05, 6 P01, 7 P09, 8 P02 (P07 unused).
