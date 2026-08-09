# Spec: Stripe payment notifications, and the CRM number underneath them

**Written 7 August 2026. Nothing built, nothing deployed.**

> **NOTE 8 Aug 2026:** the example below listing "One Touch on the old £97 link, before it moved to £197" is now backwards — One Touch reverted back to £97 on 8 Aug 2026, and that's the correct, current, live price again. The underlying point of this spec (a bare Stripe amount is ambiguous across multiple £97 offers) still stands and is arguably truer now that One Touch and The Unspoken Distance are both £97 again. Full detail on the revert: `~/.claude/projects/-Users-julietteckaraman-Documents-APP-builds/memory/project_one_touch_price_revert_to_97_8aug2026.md`.

The ask: know what a Stripe payment is FOR at the moment it lands, and use the same work to see CRM and numbers properly.

---

## 1. Why the Stripe email is useless

The notification that arrived tonight said "£97.00" and a payment ID. Nothing else. That is what Stripe's default receipt sends. It does not carry the product name.

£97 today is genuinely ambiguous. It could be any of:

- Touch Point £97/mo, a grandfathered member's renewal
- The Unspoken Distance, £97
- One Touch on the old £97 link, before it moved to £197
- the CONNECT With Essence £97 photo opt-in

Four different offers, four different meanings, one identical email.

---

## 2. What already exists (this is the good news)

`netlify/functions/stripe-webhook.js`, 624 lines, live.

It already receives every payment, verifies the Stripe signature, resolves the price to a **human-readable label**, and writes to Kit: lead stage Buyer, the product tag, the rolled-up Buyer tag, and the welcome sequence on first purchase only.

`PRODUCT_MAP` holds around 60 prices, each with a `label` already written in plain English. For example:

```js
'price_1Tw2JzCCw18geY157VQof2ka': {
  tagId: 20913132,
  sequenceId: 2825351,
  label: 'The Room £2,000 SPECIAL pay in full (until 2 Aug)'
}
```

**The identification is already happening on every single payment.** It writes that label to a server log nobody reads, and tells Juliette nothing.

> **Correction to an earlier note.** Memory records that the two Room £2,000 links were never added to `PRODUCT_MAP`. That is out of date. Both `price_1Tw2Jz...` and `price_1Tw2K3...` are in the map, with labels and the `the-room-member` tag. Verified in the file, 7 Aug 2026.

---

## 3. The five ways a payment exits the webhook

This matters, because three of them are labelled and two are blind.

| # | Trigger | Outcome | Labelled? |
|---|---|---|---|
| 1 | `invoice.paid`, price in map | product tag + sequence on first invoice only | yes |
| 2 | `invoice.paid`, price NOT in map | tagged `purchased` (20794289) | **no** |
| 3 | `checkout.session.completed`, `metadata.price_id` in map | product tag + sequence + app entitlement | yes |
| 4 | `checkout.session.completed`, matched on amount (cards app) | cards tag | yes |
| 5 | `checkout.session.completed`, price unknown | tagged `purchased` (20794289) | **no** |

**Rows 2 and 5 are the leak.** A payment lands, money is real, the buyer gets a generic `purchased` tag, and no one knows what they bought. It happens whenever a payment link is missing its `metadata.price_id`, or a new price was created in Stripe and never added to the map.

---

## 4. What gets built

### R1. A notify function

One new function inside `stripe-webhook.js`. Sends a Telegram message via the Bot API.

```
notifyPayment({ label, amountPence, currency, email, firstName, kind, identified })
```

`kind` is one of `purchase`, `first invoice`, `renewal`.

### R2. Called at all five exit points

Every one of the five rows above sends a message, including the two unidentified ones. The unidentified ones are the most important messages the system can send.

### R3. It can never break the payment flow

This is the hard requirement.

- Called **after** the Kit work has completed
- Wrapped in `try/catch` that swallows everything
- Never throws, never changes the returned status code
- If Telegram is down, the buyer is still tagged and still enrolled

The file already sets this precedent with `grantPracticeAppEntitlement`, which is wrapped exactly this way so a failure cannot affect the Kit tagging that already succeeded. Same pattern, same reasoning.

### R4. Message format

Identified:

```
£197.00 · The Room £2,000 SPECIAL pay in full
Andrea Froli · andrea@example.com
New purchase
```

Renewal:

```
£97.00 · Touch Point £97/mo GRANDFATHERED
Andrea Froli · andrea@example.com
Renewal, not a new member
```

Unidentified, deliberately loud:

```
⚠️ £97.00 · UNIDENTIFIED
Andrea Froli · andrea@example.com
Tagged "purchased" only. No product tag, no sequence.
price_id: (empty)
Fix: add metadata.price_id to that payment link, or add the price to PRODUCT_MAP.
```

The unidentified message names the fix, because that is the message that needs acting on.

### R5. Two new environment variables

`TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`, set in Netlify. If either is missing the function logs and returns quietly. No crash, no half-configured behaviour.

### R6. Renewals read as renewals

The webhook already knows: `inv.billing_reason === 'subscription_create'` means first invoice. Anything else on a subscription is a renewal. The message must say which, or a £97 renewal will read as a £97 sale and the month's numbers will be wrong.

---

## 5. The CRM and numbers part

The notification tells her about one payment. These two things tell her about the business, and both fall out of the same work.

### N1. The unidentified count is the health metric

The `purchased` tag (20794289) in Kit is, by definition, **every payment the system could not identify**. That count is a direct measure of how much revenue is landing blind.

**Checked, 7 August 2026. The number is 9.**

Nine subscribers have ever landed on the `purchased` tag. Four of those are internal: Juliette twice (juliette@feelfullyyou.com, jckaraman@me.com), Kiera, and Lyn at justwomenlive. So the real count of unidentified buyers is **five**: Andrea, Alex Lee, Dave, Ben, Tala.

That is small, and it is good news. The hole is real but it is not haemorrhaging.

**But every one of those five bought something and got no welcome sequence.** They carry the Buyer lead stage and the rolled-up Buyer tag, and nothing else. No product tag, no onboarding email.

The most recent is **Andrea, froliandrea@gmail.com, tagged 7 August 2026 at 07:36 UTC**. That is today, and the name matches the £97 Stripe notification that prompted this spec.

### N2. Weekly payments digest

A scheduled task, matching the ones already running (`payment-plan-guard`, `funnel-health-check`).

Every Monday, read the last 7 days of Stripe payments and report:

- total collected
- split by product label, using the same `PRODUCT_MAP`
- new purchases separated from renewals, so recurring revenue is visible on its own
- **every unidentified payment, listed individually with its price_id**, so the map gets fixed rather than quietly growing
- refunds and failed payments

Read-only against Stripe. Reports, never changes anything.

### N3. Kit already carries the CRM ladder

`lead_stage: 'Buyer'` is written on every purchase, the product tag lands, and the rolled-up Buyer tag lands. So the ladder is already there. It only breaks in rows 2 and 5, where the product tag is missing. Fixing the unidentified payments fixes the CRM in the same move.

---

## 6. Out of scope

- No change to how anyone is tagged, sequenced or charged
- No change to `PRODUCT_MAP` contents in this piece of work, beyond adding prices found unidentified
- Nothing that sends to a customer
- No new subscription, service, or dependency

---

## 7. Done when

1. A test payment on a mapped price produces a Telegram message with the correct label, amount, name and email within seconds.
2. A payment with no `price_id` produces the loud unidentified message naming the fix.
3. A subscription renewal reads as a renewal, not a new purchase.
4. Telegram credentials removed or wrong: the buyer is still tagged in Kit, still enrolled, and the webhook still returns 200. Verified deliberately, not assumed.
5. The unidentified count from N1 is known and written down.

---

## 8. Order of work

1. **Count tag 20794289 in Kit.** Costs nothing, needs no deploy, and tells us whether this is a small convenience or a real hole. Nothing else starts until this number exists.
2. Notify function plus the five call sites. One file, one deploy.
3. Fix whatever price IDs the unidentified messages surface over the first week.
4. Weekly digest, once the map is clean enough for the numbers to mean something.

---

## 9. Decisions needed from Juliette

- **Telegram or email** for the alerts. Telegram is assumed here, since the channel is already live and paired.
- **Every payment, or only the unidentified ones.** Every payment is assumed. If the volume is annoying it can be flipped to alerting on unidentified only, plus the weekly digest.
- Whether the Monday digest goes to Telegram, or into Notion as a page.
