# GHL sales connection — Spec

Juliette, 2 Nov 2026: Miles's funnels sell the bites as order bumps in GHL, paid as one total. Those sales never pass through the separate Stripe links, so the apps are not told. "Yes, build it."

## Objective
One private address GHL calls after a sale, with the buyer's email and what they bought. It records the sale the same way a Stripe sale is recorded.

## Requirements
R1. netlify/functions/ghl-sale.js, POST only, refused without the private key GHL_SALE_KEY.
R2. Accepts email and products from the shapes GHL sends: products as a list or comma-separated text, or order line items.
R3. Matches products by name, ignoring case and punctuation.
R4. 31 Touch Points: Kit tag, welcome and daily nudges, and app access.
R5. 31 Days Closer, Trust & Repair, The Three Answers, The Fifteen Minutes After: Kit Bought tag so the email restore finds them. Welcome emails only where switched on in the table.
R6. The other bites: Buyer tag only.
R7. Telegram message for every sale, and a loud one for a product it does not know or a sale with no email.
R8. test:true in the body reports what would happen and changes nothing.
R9. Reuses addToKit and grantPracticeAppEntitlement from stripe-webhook.js, the same code as Stripe sales.

## Out of scope
Stripe sales. The decks. GHL's own confirmation emails.

## Edge cases
E1. Sent twice: tags and access do not duplicate. E2. Unknown product: the known ones still process, she is told about the rest. E3. One step fails: the rest still run, and she is told.

## Definition of done
D1. Wrong or missing key refused. D2. Each product does exactly its row. D3. test:true makes no outside calls beyond none. D4. Live test with a real GHL sale, after Miles's team connects it.
