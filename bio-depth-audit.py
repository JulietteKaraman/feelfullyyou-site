#!/usr/bin/env python3
"""
bio-depth-audit.py — the 27-YEAR ARC guardrail for the Feel Fully You website.

WHY THIS EXISTS (found 27 Jul 2026): Juliette's whole site was quietly flattened
from her real 27-year arc down to a bare "15 years", and the mechanical site
checks (links/photos/SEO) never caught it because none of them read the actual
bio/tenure COPY. This script is that missing check. It reads the REAL deploy
source and flags any tenure/authority line that rests on a bare "15 years" with
no 27-year arc anchoring it, while leaving the true "fifteen years with couples"
storytelling alone.

CANON RULE (locked 27 Jul 2026, ~/.claude/canon.md):
  - The 27-year arc is REQUIRED depth on every bio/tenure line:
    teaching autistic children to feel safe in their own skin  →  the LAST
    fifteen years with couples and trauma.
  - "15 / fifteen years" is the couples-specific number that lives INSIDE the
    arc. It is legitimate in true couples storytelling.
  - A bare "15 years" that reads as her WHOLE career is a depth-killer: FLAG it.
  - NEVER recommend converting 27 -> 15. This tool only ever suggests ADDING the
    arc so the 15 sits inside the 27. It never proposes lowering a 27.

REPO TARGET (the one true source):
  ~/Desktop/feelfullyyou-site  (github.com/JulietteKaraman/feelfullyyou-site,
  main -> Netlify). The loose page copies in ~/Documents/APP builds/ (e.g.
  feel-fully-you-site/, the-room/, the-beginning.html) are STALE DUPLICATES and
  must NEVER be audited or edited as if they were the live site.

Report-only. Never edits, never commits. Exit code 1 if any depth-killer found,
0 if clean, so a scheduled task can gate on it.

Usage:
  python3 bio-depth-audit.py                 # audit ./ (the repo)
  python3 bio-depth-audit.py --root <dir>    # audit another checkout
  python3 bio-depth-audit.py --json          # machine-readable summary
"""

import os
import re
import sys
import json
import argparse

# ---- hard guard: refuse to run against the known STALE duplicate tree --------
STALE_MARKERS = ("Documents/APP builds", "Documents/APP\\ builds")

# ---- the whitelist: bare-15 couples storytelling is CANON on these pages -----
# (canon: "leave true 'fifteen years with couples' storytelling alone — About,
#  Cards, The Beginning, the intensives, the Dyad protocol, the divorce lines").
WHITELIST_SLUGS = {
    "about",                       # "Fifteen years later, Karim and I ..."
    "cards",                       # cards built over fifteen years of couples work
    "the-beginning",               # couples flagship, fifteen-years-with-couples
    "the-dyad-protocol",           # arrived independently through 15 yrs couples work
}
# any page whose slug ends in one of these is whitelisted couples/cohort work
WHITELIST_SUFFIXES = ("-intensive",)   # mens-/womens-/couples-/the-2-month-intensive

# directories that are transcripts / third-party speech, not Juliette's bio copy
SKIP_DIRS = ("podcast",)

# "soft" zones: first-person narrative where a couples-qualified "fifteen years"
# is legitimate storytelling (canon: leave true couples storytelling alone). A
# bare-15 here is surfaced for optional deepening (REVIEW tier) but does NOT fail
# the audit. Sales / funnel / bio pages (repo root) are held to the hard rule.
SOFT_DIRS = ("essays", "questions", "blog")

# ---- regexes -----------------------------------------------------------------
# a page "has the arc" if 27 / twenty-seven appears as a tenure figure, or the
# arc's origin phrase is present.
ARC_RE = re.compile(
    r"(?:\b(?:27|twenty[-\s]?seven)\b[^.<]{0,40}\byears?\b)"
    r"|(?:\byears?\b[^.<]{0,40}\b(?:27|twenty[-\s]?seven)\b)"
    r"|autism spectrum|autistic|on the (?:autism )?spectrum"
    r"|feel safe in their own skin",
    re.I,
)

# a "15-year tenure claim": fifteen/15 + years, sitting next to a work/authority cue.
FIFTEEN_RE = re.compile(r"\b(?:15|fifteen)\b[^.<]{0,60}\byears?\b|\byears?\b[^.<]{0,20}\b(?:15|fifteen)\b", re.I)
WORK_CUE_RE = re.compile(
    r"\bwork(?:ed|ing)?\b|\bin the room\b|\bpractice\b|\bclients?\b|\bthis work\b"
    r"|\bof (?:this |body[-\s]?based )?work\b|\bspecialis|\bwith couples\b|\bwith women\b"
    r"|\bwith men\b|\bof couples work\b",
    re.I,
)
# divorce / friendship storytelling that is ALWAYS fine, even with no arc on-page
DIVORCE_RE = re.compile(r"\b(?:15|fifteen)\s+years?\s+later\b", re.I)
FRIENDSHIP_RE = re.compile(r"friendships?[^.<]{0,60}\b(?:15|fifteen)\s+years?\b|\b(?:15|fifteen)\s+years?\b[^.<]{0,30}friendship", re.I)

TAG_RE = re.compile(r"<[^>]+>")


def slug(path, root):
    rel = os.path.relpath(path, root)
    return rel[:-5] if rel.endswith(".html") else rel


def is_whitelisted(sl):
    base = os.path.basename(sl)
    if base in WHITELIST_SLUGS:
        return True
    if any(base.endswith(suf) for suf in WHITELIST_SUFFIXES):
        return True
    return False


def text_lines(raw):
    """Yield (line_no, visible_text) for lines that carry a year figure, so line
    numbers map back to the source file for a human fixing it."""
    for i, line in enumerate(raw.splitlines(), 1):
        if re.search(r"\b(?:15|fifteen|27|twenty[-\s]?seven)\b", line, re.I):
            visible = TAG_RE.sub(" ", line)
            visible = re.sub(r"\s+", " ", visible).strip()
            if visible:
                yield i, visible


def audit_file(path, root):
    with open(path, encoding="utf-8", errors="ignore") as fh:
        raw = fh.read()
    sl = slug(path, root)
    has_arc = bool(ARC_RE.search(raw))

    flagged_lines = []
    for ln, txt in text_lines(raw):
        if not FIFTEEN_RE.search(txt):
            continue
        if DIVORCE_RE.search(txt) or FRIENDSHIP_RE.search(txt):
            continue  # always-fine storytelling
        if not WORK_CUE_RE.search(txt):
            continue  # a "15" that isn't a tenure/authority claim
        # this line leans authority on a 15-year figure
        flagged_lines.append((ln, txt))

    top = os.path.relpath(path, root).split(os.sep)[0]
    in_soft = top in SOFT_DIRS
    bare = bool(flagged_lines) and not has_arc and not is_whitelisted(sl)
    depth_killer = bare and not in_soft          # hard: fails the audit
    review = bare and in_soft                    # soft: surfaced, does not fail
    return dict(slug=sl, path=path, has_arc=has_arc,
                whitelisted=is_whitelisted(sl),
                fifteen_tenure_lines=flagged_lines,
                depth_killer=depth_killer, review=review)


def gather(root):
    results = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in ("node_modules", ".git")]
        rel = os.path.relpath(dirpath, root)
        top = rel.split(os.sep)[0]
        if top in SKIP_DIRS:
            continue
        for fn in filenames:
            if fn.endswith(".html"):
                results.append(audit_file(os.path.join(dirpath, fn), root))
    return sorted(results, key=lambda r: r["slug"])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default=os.path.dirname(os.path.abspath(__file__)),
                    help="repo checkout to audit (default: this script's dir = the repo)")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()
    root = os.path.abspath(a.root)

    if any(m in root for m in STALE_MARKERS):
        print(f"REFUSING: '{root}' is the STALE 'APP builds' duplicate tree, not the live "
              f"repo. Audit ~/Desktop/feelfullyyou-site instead.", file=sys.stderr)
        sys.exit(2)

    results = gather(root)
    killers = [r for r in results if r["depth_killer"]]
    review = [r for r in results if r["review"]]
    arc_ok = [r for r in results if r["has_arc"]]
    wl_pass = [r for r in results if r["whitelisted"] and r["fifteen_tenure_lines"]]

    if a.json:
        print(json.dumps(dict(root=root, total=len(results),
                              depth_killers=killers, review=review,
                              arc_intact=len(arc_ok),
                              whitelisted_couples_lines=len(wl_pass)), indent=2))
        sys.exit(1 if killers else 0)

    print(f"BIO / TENURE DEPTH AUDIT  —  {root}")
    print(f"pages scanned: {len(results)}  (podcast transcripts skipped)")
    print(f"pages with the 27-year arc intact: {len(arc_ok)}")
    print(f"whitelisted true-couples pages carrying a 'fifteen years' line (correctly PASS): "
          f"{len(wl_pass)}")
    print()
    if killers:
        print(f"FLAT-15 DEPTH-KILLERS ({len(killers)}) — sales/funnel/bio pages where tenure rests "
              f"on a bare 15 with no 27-year arc. FIX THESE:")
        for r in killers:
            print(f"\n  ✗ {r['slug']}.html")
            for ln, txt in r["fifteen_tenure_lines"]:
                snip = txt if len(txt) <= 160 else txt[:157] + "..."
                print(f"      line {ln}: {snip}")
            print(f"      FIX: add the 27-year arc to this page (autistic children -> the last "
                  f"fifteen years with couples) so 15 sits INSIDE 27. Do NOT lower the 15.")
    else:
        print("✅ No flat-15 depth-killers on any sales/funnel/bio page. Every tenure line there "
              "carries the 27-year arc or is whitelisted true-couples storytelling.")

    if review:
        print(f"\nREVIEW ({len(review)}) — first-person essay/story pages with a couples-qualified "
              f"'fifteen years' and no arc. Legitimate as storytelling; deepen only if you want "
              f"the arc there too (does NOT fail the audit):")
        for r in review:
            for ln, txt in r["fifteen_tenure_lines"]:
                snip = txt if len(txt) <= 120 else txt[:117] + "..."
                print(f"  · {r['slug']}.html  line {ln}: {snip}")

    print("\nGUARANTEE: this tool never recommends converting 27 -> 15. It only ever adds the arc.")
    sys.exit(1 if killers else 0)


if __name__ == "__main__":
    main()
