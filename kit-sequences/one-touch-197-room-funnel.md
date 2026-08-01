# One Touch £197 — Kit Delivery + Room Funnel (built 1 Aug 2026)

Built alongside the One Touch price change (£97 -> £197, new Stripe link). Old £97 / Pleasure
Bundle buyers stay on the original sequence untouched — see `one-touch-welcome-email.md`
(tag `one touch`, id 20794312, sequence 2820368). This is a SEPARATE, NEW sequence for £197
buyers only, so the two audiences never cross.

## New tag: `one-touch-197` (id 21778330)
## New sequence: "One Touch £197 — Welcome + Room Funnel" (id 2846629)
## Status: all 4 emails created as DRAFTS (published: false). Nothing sends until Juliette
reviews + publishes each one in Kit, AND the webhook is wired (see below).

Review link: https://app.kit.com/sequences/2846629

## Sequence structure
- Email 1 (0 hours): delivery — same content/promise as the £97 welcome email
- Email 2 (+3 days): mid-course check-in, no pitch
- Email 3 (+5 days, ~day 8): completion beat, names the honest edge of solo work, seeds
  The Room exists (no pitch, no price)
- Email 4 (+4 days, ~day 12): The Room invite, story-led, CTA = Book a Call
  (https://tidycal.com/juliette2/the-room-consultation). No price stated — matches the
  live the-room.html page, which is call-gated and doesn't disclose price publicly either.

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
