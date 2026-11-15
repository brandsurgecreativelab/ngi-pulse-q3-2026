Source for assets/pulse-habits-v2.mp4 (character walk film, Nedgroup primary and secondary colours).
Serve this folder on :8767, then: node render.js && ffmpeg -f concat -safe 0 -i list.txt -c copy -movflags +faststart pulse-habits-v2.mp4
man-rig.svg is the supplied character split into head, arms and lower legs for animation.
