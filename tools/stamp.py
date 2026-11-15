"""Rewrite the footer 'Last updated' stamp in a file to now (Africa/Johannesburg). Prints old and new <time> markup."""
import re, sys, datetime, zoneinfo
now = datetime.datetime.now(zoneinfo.ZoneInfo('Africa/Johannesburg'))
new = f'<time datetime="{now.strftime("%Y-%m-%dT%H:%M+02:00")}">{now.day} {now.strftime("%B %Y")}, {now.strftime("%H:%M")}&nbsp;SAST</time>'
p = sys.argv[1]; s = open(p).read()
m = re.findall(r'<time datetime="[^"]*">[^<]*SAST</time>', s)
assert len(m) == 1, m
open(p, 'w').write(s.replace(m[0], new)); print(m[0]); print(new)
