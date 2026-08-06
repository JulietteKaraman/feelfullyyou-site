#!/bin/bash
# Guard against the "Juliette cut off on mobile" bug.
# Two genuine risks, low false positives:
#   1. A fixed max-height cap on a photo/hero (jams a tall portrait into a short box).
#   2. object-fit:cover on an <img> with NO object-position (defaults to centre, can lop a head).
# Background shorthand that already carries a position (e.g. "center top / cover") is NOT flagged.
# Run before deploying:  bash check-mobile-photos.sh   (exit 1 if a risk is found)

cd "$(dirname "$0")"
found=0
echo "== Mobile photo crop check =="

# 1. Hard max-height cap on a photo/hero cover element, with no focus point
while IFS=: read -r file line _; do
  echo "  RISK  $file:$line  max-height cap on a cover photo, no focus point -> can crop on mobile"
  found=1
done < <(grep -nE "(hero-photo|hero-img|photo-col|photo-side|photo-bleed|\.bg-img|\.photo)\b[^}]*(object-fit:cover|/ *cover)[^}]*max-height:[0-9]+px" *.html 2>/dev/null \
         | grep -viE "object-position|background-position")

# 2. object-fit:cover on an <img>-style rule with no object-position anywhere in that declaration
while IFS=: read -r file line _; do
  echo "  RISK  $file:$line  object-fit:cover with no object-position -> crops to centre"
  found=1
done < <(grep -nE "object-fit:cover" *.html 2>/dev/null | grep -viE "object-position")

if [ "$found" -eq 0 ]; then
  echo "  CLEAN — no mobile photo-crop risks."
  exit 0
fi
echo "Fix: responsive height like min(135vw,560px) + object-position/background-position:center top."
exit 1
