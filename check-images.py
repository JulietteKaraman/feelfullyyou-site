#!/usr/bin/env python3
# Banned/old image sweep. Run: python3 check-images.py   (from the site folder). Any output line = a FLAG. Built 29 Oct 2026 after Juliette found the AI fireplace photo herself.
import re,glob,os,sys,json
from PIL import Image
ROOT=sys.argv[1] if len(sys.argv)>1 else os.path.dirname(os.path.abspath(__file__)); LIB=sys.argv[2] if len(sys.argv)>2 else "/Users/julietteckaraman/Documents/APP builds/03 Brand Assets/Photo Library"
os.chdir(ROOT)
def dh(p,n=12):
    try:
        im=Image.open(p).convert('L').resize((n+1,n),Image.LANCZOS)
    except Exception: return None
    px=list(im.getdata()); return tuple(px[r*(n+1)+c]>px[r*(n+1)+c+1] for r in range(n) for c in range(n))
def dist(a,b): return sum(x!=y for x,y in zip(a,b))
bans={}
for k in ['INT-01','INT-02','INT-03','INT-05','INT-06','INT-07','INT-08','INT-09','INT-10','INT-11']:  # INT-04 removed 29 Oct: Juliette says it is her REAL train selfie with Alex
    h=dh(f'{LIB}/thumbs/{k}.jpg');
    if h: bans[k+(' (AI, never)' if k in ('INT-05','INT-06','INT-07') else ' (unverified stock, avoid)')]=h
for f,why in [('cards-app-taster.jpg','OLD cards app (5 cards)'),('media/app-home-iphone.png','OLD light app home'),('media/app-library-screenshot.jpg','OLD app library'),('media/app-library-courses-iphone.png','OLD light app library'),('media/app-unspoken-distance-library.jpg','OLD Unspoken Distance library list'),('media/31dc-hero.jpg','candle scene with OLD light 31 Days Closer phone (use media/31dc-hero-dark.jpg)')]:
    h=dh(f)
    if h: bans[f+' = '+why]=h
pages=[f for f in glob.glob('**/*.html',recursive=True) if not re.search(r'_preview|_review|\.bak|node_modules|/bak',f)]
cache={}; hits={}
for pg in pages:
    s=open(pg,errors='ignore').read()
    if re.search(r'http-equiv="refresh"',s): continue
    for src in set(re.findall(r'(?:src|poster|content|href)="([^"]+\.(?:jpe?g|png|webp))"',s,re.I)):
        p=src.split('feelfullyyou.com/')[-1] if 'feelfullyyou.com/' in src else src
        if p.startswith('http'): continue
        p=os.path.normpath(os.path.join(os.path.dirname(pg),p) if not p.startswith('/') else p.lstrip('/'))
        if p not in cache: cache[p]=dh(p) if os.path.exists(p) else None
        h=cache[p]
        if not h: continue
        for k,b in bans.items():
            if (pg=='the-beginning.html' and k[:6] in ('INT-02','INT-10','INT-11')) or k[:6]=='INT-03': continue  # Juliette 29 Oct: Beginning photos OK; INT-03 b&w hands OK (her favourite on Repair Kit)  # Juliette 29 Oct: The Beginning photos are OK
            if dist(h,b)<=18: hits.setdefault((p,k),set()).add(pg)
for (p,k),pgs in sorted(hits.items(),key=lambda x:x[0][1]):
    print(f'{k} | {p} | {len(pgs)} pages: {", ".join(sorted(pgs)[:12])}{" ..." if len(pgs)>12 else ""}')
