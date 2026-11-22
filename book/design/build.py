#!/usr/bin/env python3
# Builds the designed reader copy: ../reader-copy/Where-Did-the-Touch-Go-designed.pdf
# Usage (from book/design):  python3 -I build.py
import re, subprocess, html, os, sys
from weasyprint import HTML, CSS

BOOK = os.path.abspath('..')
HERE = os.path.abspath('.')

# (file, number label, title, opener image, epigraph taken verbatim from the chapter)
CH = [
 ('00-before-you-start.md', '', 'Before you start', 'op0', 'Are you being touched, or are you feeling it?'),
 ('01-yesterday.md', '1', 'Yesterday', 'op1', 'Then notice which of them you felt.'),
 ('02-the-brace.md', '2', 'The Brace', 'op2', 'There is no tiger in the room.'),
 ('03-the-fade.md', '3', 'The Fade', 'op3', 'Registered. Filed. No charge.'),
 ('04-the-reach.md', '4', 'The Reach', 'op4', 'Your body knows what it wants. It has been waiting to be asked.'),
 ('05-the-melt.md', '5', 'The Melt', 'op5', 'Nothing went wrong on Tuesday. Her body was paying for Sunday.'),
 ('06-your-pattern.md', '6', 'Your Pattern', 'op6', 'The moving is the tell.'),
 ('07-your-pleasure-language-and-desire-style.md', '7', 'Your Pleasure Language and Your Desire Style', 'op7', 'Pleasure is a pulse, a whisper, a slow awakening, and it was never meant to be a performance.'),
 ('08-the-way-back.md', '8', 'The Way Back', 'op8', 'Wherever you would normally let go, stay one breath more.'),
 ('09-nobody-asked-me.md', '9', 'Nobody Asked Me', 'op9', 'Nobody asked me. So now I teach people how to ask.'),
 ('10-what-the-edge-taught-me.md', '10', 'What the Edge Taught Me', 'op10', 'At the end, nobody needs fixing. They need a body beside them that is not afraid.'),
 ('11-for-him-and-for-the-two-of-you.md', '11', 'For Him, and For the Two of You', 'op11', 'Your presence is either regulating her or activating her. There is no neutral.'),
 ('12-your-first-31-days.md', '12', 'Your First 31 Days', 'op12', 'Start with three minutes, and you will know.'),
 ('13-why-i-built-scrumptious-confessions.md', '13', 'Why I Built Scrumptious Confessions', 'op13', 'Every time, my body knew first.'),
 ('14-what-comes-next.md', '14', 'What Comes Next', 'op14', 'Everything in this book, I learned in my own body first.'),
 ('15-the-toolkit.md', '', 'The Toolkit', 'opT', 'Take what you need. Leave the rest.'),
 ('16-about-the-author-and-credits.md', '', 'About the author', 'opA', 'Still following the breadcrumbs.'),
]

BANDS = {  # h2 text -> band image
 'The Holder': 'holder', 'The Operator': 'operator', 'The Wanderer': 'wanderer',
 'Things to try in your language': 'languages', 'The kitchen': 'kitchen',
 'Touch Base®': 'touchbase', 'What opening costs': 'melt',
}
PULLS = {
 '01-yesterday.md': 'If I gave something, the room got lighter. If the room got lighter, I was safe.',
 '03-the-fade.md': 'Love is not desire.',
 '04-the-reach.md': 'You do not have low desire. You have an unpaid receiving account.',
 '05-the-melt.md': 'A body can only hold so much openness at once.',
 '06-your-pattern.md': 'Calm does not have to keep moving to prove it is still there.',
 '07-your-pleasure-language-and-desire-style.md': 'Each language carries its own shame.',
 '08-the-way-back.md': 'That no is what made it safe to go anywhere at all.',
 '09-nobody-asked-me.md': 'That is how a nervous system changes its mind.',
 '10-what-the-edge-taught-me.md': 'A tool that cannot hold at the extremes is only theory.',
 '11-for-him-and-for-the-two-of-you.md': 'You do not need to say the right thing. Staying in it will do more than fixing it.',
}
PRACTICE = ['A self-touch date', 'A Touch Date with a partner', 'What does move it', 'One small rep each',
            'Things to try in your language', 'Stay one breath longer', 'Yes, or nothing', 'Move it to the morning',
            'Touch Base', 'Your first week']


def md_to_html(path):
    t = open(os.path.join(BOOK, path)).read()
    i = t.find('## Review notes for Juliette')
    if i >= 0:
        t = t[:i].rstrip() + '\n'
    lines = []
    for l in t.split('\n'):
        if re.match(r'^\*Draft 1,', l):
            continue
        if l.startswith('> **[Design note'):
            if 'scrumptious' in l.lower() and 'emblem' not in l.lower():
                lines.append('<div class="qrrow"><img src="../assets/qr-scrumptious-confessions.png"><p>Scan to open<br>Scrumptious Confessions</p></div>')
            else:
                lines.append('<div class="qrrow"><img class="emb" src="img/emblem.png"><img src="../assets/qr-touch-base.png"><img src="../assets/qr-touch-base-audio.png"></div>')
            continue
        lines.append(l)
    t = '\n'.join(lines)
    # drop the H1 and the first rule
    t = re.sub(r'^# .*\n', '', t, count=1)
    t = re.sub(r'^\s*---\s*\n', '', t.lstrip(), count=1)
    p = subprocess.run(['pandoc', '-f', 'markdown+raw_html', '-t', 'html5', '--wrap=none'], input=t, capture_output=True, text=True)
    return p.stdout


def esc(s):
    return html.escape(s, quote=False)


def add_pull(body, quote):
    key = quote.split('. ')[0].rstrip('.')
    m = re.search(r'<p>[^<]*?' + re.escape(html.escape(key.split(' ')[0], quote=False)), body)
    idx = body.find(html.escape(key, quote=False))
    if idx < 0:
        idx = body.find(key.replace("'", '\u2019'))
    if idx < 0:
        print('pull not found:', key[:40]); return body
    end = body.find('</p>', idx)
    if end < 0: return body
    end += 4
    return body[:end] + '<blockquote class="pull"><p>' + html.escape(quote, quote=False) + '</p></blockquote>' + body[end:]


def decorate(body):
    # horizontal rules -> ornament
    body = body.replace('<hr />', '<p class="orn">&#10022;</p>')
    parts = re.split(r'(?=<h2 )', body)
    out = [parts[0]]
    for sec in parts[1:]:
        m = re.match(r'<h2 id="[^"]*">(.*?)</h2>', sec, re.S)
        title = re.sub(r'<[^>]+>', '', m.group(1)).strip() if m else ''
        band = ''
        if title in BANDS:
            band = f'<div class="band"><img src="img/b_{BANDS[title]}.jpg"></div>'
        inner = sec
        if any(title.startswith(p) for p in PRACTICE):
            h = re.match(r'<h2 id="[^"]*">.*?</h2>', sec, re.S).group(0)
            rest = sec[len(h):]
            inner = band + h + '<div class="practice">' + rest + '</div>'
            band = ''
        out.append(band + inner)
    return ''.join(out)


def build():
    css = open('book-inline.css').read()
    pages = []
    # cover
    pages.append('''<section class="cover"><img class="coverimg" src="img/cover.jpg">
      <div class="covertxt"><img class="emblem" src="img/emblem.png">
      <h1>Where Did the<br>Touch Go?</h1>
      <p class="sub">Are you being touched,<br>or are you feeling it?</p>
      <p class="by">Juliette Karaman</p></div></section>''')
    pages.append('<section class="halftitle"><h1>Where Did the Touch Go?</h1></section>')
    pages.append('''<section class="titlepage"><img class="emblem" src="img/emblem.png"><h1>Where Did the<br>Touch Go?</h1>
      <p class="by">Juliette Karaman</p><p class="desc">Why you stopped feeling it,<br>and the small, structured way back</p><p class="small">feelfullyyou.com</p></section>''')
    pages.append('''<section class="copyright"><p>&copy; 2026 Juliette Karaman. All rights reserved.</p>
      <p>Touch Base&reg; is a registered mark of Juliette Karaman.</p>
      <p>Reader copy, 22 November 2026. Not for sale or distribution.</p>
      <p class="note">This book shares one woman's practice and story. It is not medical or psychological advice, and it does not replace care from a qualified professional.</p></section>''')
    # contents
    toc = ['<section class="toc"><h2 class="tochead">Contents</h2><ol>']
    for f, n, title, op, ep in CH:
        cid = 'c_' + re.sub(r'\W', '', f)
        label = (f'<span class="n">{n}</span>' if n else '<span class="n"></span>')
        toc.append(f'<li><a href="#{cid}">{label}<span class="t">{esc(title)}</span></a></li>')
    toc.append('</ol></section>')
    pages.append(''.join(toc))
    for f, n, title, op, ep in CH:
        cid = 'c_' + re.sub(r'\W', '', f)
        body = decorate(md_to_html(f))
        if f in PULLS:
            body = add_pull(body, PULLS[f])
        num = f'<div class="chnum">{n}</div>' if n else '<div class="chnum small">&#10022;</div>'
        opener = f'''<section class="opener" id="{cid}" data-title="{esc(title)}">
          <img class="opimg" src="img/{op}.jpg">
          <div class="optxt">{num}<h1>{esc(title)}</h1><p class="ep">{esc(ep)}</p></div></section>'''
        pages.append(opener + f'<section class="chapter" data-title="{esc(title)}">{body}</section>')
    # back cover
    pages.append('''<section class="backcover"><img class="emblem" src="img/emblem.png">
      <p class="q">Why you stopped feeling it,<br>and the small, structured way back</p>
      <p class="small">feelfullyyou.com</p></section>''')
    doc = f'<html lang="en-GB"><head><meta charset="utf-8"><title>Where Did the Touch Go?</title></head><body>{"".join(pages)}</body></html>'
    open('book.html', 'w').write(doc)
    out = os.path.join(BOOK, 'reader-copy', 'Where-Did-the-Touch-Go-designed.pdf')
    HTML(string=doc, base_url=HERE + '/').write_pdf(out, stylesheets=[CSS(string=css, base_url=HERE + '/')])
    print('wrote', out)


if __name__ == '__main__':
    build()
