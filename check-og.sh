#!/usr/bin/env bash
# check-og.sh — link-preview (Open Graph) checker for feelfullyyou.com
# Flags any page whose shared link would show a wrong/missing/portrait picture.
#
# Usage:
#   ./check-og.sh              # check every *.html in this folder
#   ./check-og.sh quiz.html    # check one or more named files
#
# Checks per page:
#   1. og:image present
#   2. twitter:image present and identical to og:image
#   3. the image file exists in this folder
#   4. the image is LANDSCAPE (portrait crops badly in WhatsApp/iMessage)
# Rules: reference_og_link_previews — landscape ~1.91:1, each page its own image.

cd "$(dirname "$0")" || exit 1
files=("$@"); [ ${#files[@]} -eq 0 ] && files=(*.html)
flags=0

# Pages that are never shared publicly (thank-you, members, internal) — a missing
# og:image on these is fine, so we don't flag it. They ARE still checked if they have one.
skip_missing='^(thankyou-|tb-thank-you|.*-thankyou|.*thank-you|success-|members\.html|.*-members\.html|cards-complete|practitioners-welcome|repair-kit-portal|page-index|stack-brief|404)'

dims () { sips -g pixelWidth -g pixelHeight "$1" 2>/dev/null | awk '/pixelWidth/{w=$2}/pixelHeight/{h=$2}END{print w" "h}'; }
tag () { grep -ioE "<meta[^>]*(property=\"$1\"|name=\"$1\")[^>]*>" "$2" | grep -ioE 'content="[^"]*"' | head -1 | sed 's/content="//;s/"$//'; }

for f in "${files[@]}"; do
  [ -f "$f" ] || continue
  og=$(tag "og:image" "$f"); tw=$(tag "twitter:image" "$f")

  if [ -z "$og" ]; then
    # noindex pages and known internal pages are never shared publicly — a missing image is fine
    noindex=$(grep -iqE '<meta[^>]*name="robots"[^>]*noindex' "$f" && echo yes)
    if [[ ! "$f" =~ $skip_missing ]] && [ -z "$noindex" ]; then
      echo "FLAG  $f — no og:image (shared link will show no picture)"; flags=$((flags+1))
    fi
    continue
  fi

  # twitter:image must match og:image
  if [ "$tw" != "$og" ]; then
    echo "FLAG  $f — twitter:image ${tw:-MISSING} does not match og:image"; flags=$((flags+1))
  fi

  # resolve local file (keep the path, e.g. media/xxx.jpg) and check it exists + is landscape
  img="${og#https://feelfullyyou.com/}"; img="${img#http://feelfullyyou.com/}"; img="${img#/}"
  case "$img" in http*) continue;; esac   # external image, can't check locally
  if [ ! -f "$img" ]; then
    echo "FLAG  $f — og image '$img' not found in folder (broken preview)"; flags=$((flags+1)); continue
  fi
  read -r w h < <(dims "$img")
  if [ -n "$w" ] && [ -n "$h" ] && [ "$h" -ge "$w" ]; then
    echo "FLAG  $f — og image '$img' is PORTRAIT ${w}x${h} (crops badly; use landscape ~1.91:1)"; flags=$((flags+1))
  fi
done

echo "----"
if [ "$flags" -eq 0 ]; then echo "OG PREVIEWS CLEAR — no flags"; else echo "OG PREVIEWS: $flags flag(s) — fix before deploy"; fi
exit $([ "$flags" -eq 0 ] && echo 0 || echo 1)
