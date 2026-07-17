# Summit Pleasure Bundle — Follow-Up Sequence

**Status: LIVE AND WIRED (17 Jul 2026).** Built in Kit and sending. This file is a record
of what is live, not a paste-in draft. Edit in Kit, then update this file to match.

- **Kit sequence:** "Summit Pleasure Bundle", ID `2830741`, https://app.kit.com/sequences/2830741
- **Kit tag:** `summit-pleasure`, ID `21249806`
- **Trigger:** opt-in at https://feelfullyyou.com/summit-pleasure, which posts to
  `/.netlify/functions/subscribe` with `tagIds: [21249806]`, `sequenceId: 2830741`, and
  `fields: {lead_stage: 'Warm'}`.
- **CRM:** signups are stamped `lead_stage = Warm` so summit leads are findable in Kit.
  Verified end to end on 17 Jul: subscriber created, tag applied by the function, Warm stamped.
  Note that Kit's "subscribers for tag" listing lags by a while. Trust the subscriber's own
  tag list, which updates immediately.

## The bundle is FOUR items, not three

One Touch (£97, free), 10 Touch Rituals (£7, free), **Body Confidence (£27, free)**, and
The Cards App (£55 to £27.50). Total value **£186**. Both `/summit-pleasure` and
`/thankyou-summit-pleasure` deliver everything instantly on the page, per the standing rule
that free guides deliver unconditionally rather than behind an email click.

An earlier version of this file said "three bundle items". That was wrong and it caused real
confusion on 17 Jul. Body Confidence is the meditation, added 15 Jul in commit `a13bb0d`. It
lives at `/body-confidence` as a Drive video embed, and it is also on `/free-resources`.

## Why there is no upsell in this sequence

Juliette's decision, 17 Jul: **do not upsell these people anything.** They already have a lot
of value. The emails help them use what they have. The old Email 1, a 31 Daily Touch Points
upsell, was deleted for this reason.

---

## Email 1 — Day 1, Be Touched invite
**Subject:** Sunday, 26 July. 7pm UK.
**Kit email ID:** 10092937, position 0, delay 1 day, published

Moved to first position because the masterclass is date-bound and may pass before a later
email would land. Links to https://feelfullyyou.com/be-touched-masterclass (verified 200).

**This email goes stale after 26 July 2026.** A scheduled task
(`summit-bundle-betouched-swap`, fires 27 Jul 9am) will repoint it at the replay, swap in the
next live event, or unpublish it. If that task does not fire, do it by hand.

## Email 2 — Day 5 (4 days after Email 1), no sell
**Subject:** The one most people don't open
**Kit email ID:** 10092945, position 1, delay 4 days, published

Points at Body Confidence, the item people scroll past, and hands over Touch Base®, which is
ritual two in the guide they already own, quoted from the canonical mechanics. Nothing to buy.
Links to https://feelfullyyou.com/body-confidence.

---

## Known gap

**No email template applied.** `email_template_id` is `null` on this sequence. The Kit API
rejects the Chef template (`5347398`) for sequences with "starting point template cannot be
used for sequences", so both emails send with no header or footer branding until someone sets
the template by hand in the Kit UI. This is the one step that cannot be automated.
