#!/bin/bash
# FFY site health check — runs against live feelfullyyou.com
# Set up as a cron job: crontab -e  →  0 8,20 * * * /Users/julietteckaraman/Desktop/feelfullyyou-site/check-site.sh

BASE="https://feelfullyyou.com"
FAILED=()

PAGES=(
  "/"
  "/about"
  "/work-with-me"
  "/for-her"
  "/for-him"
  "/for-both"
  "/the-room"
  "/cards"
  "/shop"
  "/free-resources"
  "/contact"
  "/media-and-pr"
  "/links"
  "/grief-duality-process"
  "/the-unspoken-distance"
  "/connect-with-essence"
  "/womens-intensive"
  "/womens-six-week-intensive"
  "/mens-intensive"
  "/mens-six-week-intensive"
  "/couples-intensive"
  "/communication-reboot-kit"
  "/romantic-relationship-repair-kit"
  "/between-touches"
  "/when-she-goes-quiet"
  "/the-beginning"
  "/the-dyad-protocol"
  "/touch-point"
  "/touch-point-live"
  "/sacred-no"
  "/10-touch-rituals"
  "/31-daily-touch-points"
  "/7-days-scrumptiousness"
  "/cards-free-taster"
  "/touch-base-anchor"
  "/trip-wire"
  "/thankyou-unspoken-distance"
  "/thankyou-connect-with-essence"
  "/thankyou-cards-taster"
  "/thankyou-between-touches"
  "/thankyou-between-touches-only"
  "/thankyou-when-she-goes-quiet"
  "/thankyou-when-she-goes-quiet-only"
  "/thankyou-communication-reboot-kit"
  "/thankyou-10rituals"
  "/thankyou-31touchpoints"
  "/thankyou-both"
  "/thankyou-grief"
  "/thankyou-touch-base"
  "/touch-point-thankyou"
  "/terms"
  "/thankyou-sacred-no"
  "/thankyou-repair-kit"
  "/touch-languages"
)

echo "=== FFY Site Health Check — $(date) ==="

for PAGE in "${PAGES[@]}"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE$PAGE")
  if [ "$STATUS" != "200" ]; then
    echo "FAIL [$STATUS] $BASE$PAGE"
    FAILED+=("$PAGE ($STATUS)")
  else
    echo "OK   $BASE$PAGE"
  fi
done

echo ""
if [ ${#FAILED[@]} -eq 0 ]; then
  echo "All pages OK."
else
  echo "=== FAILURES ==="
  for F in "${FAILED[@]}"; do
    echo "  $F"
  done
  # Uncomment and fill in to send yourself an email on failure:
  # echo "FFY site issues: ${FAILED[*]}" | mail -s "FFY SITE ALERT" juliette@feelfullyyou.com
fi
