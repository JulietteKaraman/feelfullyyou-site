# One Touch £197 — Kit Delivery + Room Funnel (built 1 Aug 2026)

Built alongside the One Touch price change (£97 -> £197, new Stripe link). Old £97 / Pleasure
Bundle buyers stay on the original sequence untouched — see `one-touch-welcome-email.md`
(tag `one touch`, id 20794312, sequence 2820368). This is a SEPARATE, NEW sequence for £197
buyers only, so the two audiences never cross.

## New tag: `one-touch-197` (id 21778330)
## New sequence: "One Touch £197 — Welcome + Room Funnel" (id 2846629)
## Status: all 4 emails created as DRAFTS (published: false). Header banner + Juliette's
signature photo + bio line + unsubscribe footer match the existing published One Touch email
(fixed 1 Aug, first pass was missing all of it). Then a second fix same day: the hero photo
was wrong (defaulting to something that read as 10 Touch Rituals) because email_template_id
was never linked — found the real "One Touch" starting-point template in Kit (id 5389005,
hero image asset pVgL4P2dnkcqydKXgG3C86) and rebuilt all 4 with that exact hero photo pulled
in via allow_starting_point. Nothing sends until Juliette reviews + publishes each one in
Kit, AND the webhook is wired (see below).

Review link: https://app.kit.com/sequences/2846629

## Sequence structure
- Email 1 (0 hours): delivery — same content/promise as the £97 welcome email
- Email 2 (+3 days): mid-course check-in, no pitch
- Email 3 (+5 days, ~day 8): completion beat, names the honest edge of solo work, seeds
  The Room exists (no pitch, no price)
- Email 4 (+4 days, ~day 12): The Room invite, story-led, CTA = Book a Call
  (https://tidycal.com/juliette2/the-room-consultation). No price stated — matches the
  live the-room.html page, which is call-gated and doesn't disclose price publicly either.

## RESOLVED 1 Aug 2026, end to end
Full chain now proven live: real £197 checkout (100% off via test promo code) completed,
landed on /thankyou-one-touch, webhook fired, subscriber tagged Buyer. The one gap found
was Payment Link metadata (key `price_id`, value `price_1TzdQNCCw18geY15eh9S2uOe`) was
never set, so the product-specific tag/sequence never applied automatically, backfilled
manually for that one test subscriber (jckaraman@me.com) — metadata is now added, so every
future purchase on this link should tag + enrol on its own.

**Also learned, worth remembering for next time:** Stripe won't complete a checkout at an
exact £0.00 total by default. There's an account-level setting that has to be turned on to
allow zero-amount completions — Juliette found and enabled it but couldn't pin down exactly
which settings page it lived on. If a 100%-off test code ever "won't work" again with no
visible cause, check this first before burning hours on coupon/promo-code debugging again.

## STILL OPEN before this can go live
1. **stripe-webhook.js PRODUCT_MAP** still only maps the OLD £97 price_id
   (`price_1Tpr13CCw18geY15W6ooICYF`) to tag 20794312 / sequence 2820368. The new £197
   price has its own new price_id (Stripe can't reuse/edit price_ids). Until that new
   price_id is added to the map pointing at tag 21778330 / sequence 2846629, buyers on
   the new Stripe link won't get tagged as a buyer OR enrolled in this new sequence —
   they'll fall through to whatever the generic default is.
   -> Juliette: get the price_id from the Stripe dashboard (the £197 One Touch price,
      starts `price_...`) and hand it over so the webhook can be updated.
2. **New Stripe Payment Link's "after payment" redirect.** This is a brand new Payment
   Link (not an edit of the old one), so it does not automatically inherit a redirect to
   `/thankyou-one-touch`. Needs to be set in the Stripe dashboard on this specific link.
   Can't be checked or set via any tool available here — dashboard-only.
3. Once 1+2 are done, publish the 4 drafts in Kit (or ask and I will, once told the
   sequence has been reviewed).

## Stripe checkout (new, £197): https://buy.stripe.com/dRm28qeOv0uA3Pv32B0co1L
