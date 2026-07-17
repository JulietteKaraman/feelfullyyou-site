# P-Bundle registration push — Kit broadcast

**Built in Kit as a DRAFT: broadcast `25037478`** → https://app.kit.com/campaigns/25037478/draft
**Send: Wednesday 22 July 2026, ~9am UK.** Registration closes midnight Sunday 26 July.
Rewrite of Kiera's 26 July "last chance" draft.

## Why Wednesday, not the 26th

Juliette's call, 17 Jul: **do not send this on Be Touched day.** The masterclass is Sunday
26 July, 7pm UK, and she will not have a competing ask on her own event day.

Instead, the last-chance nudge rides as a **P.S. on the Be Touched reminder** that already
goes out Sunday 26 July at 9am (broadcast `24933512`, "Tonight. 7pm UK."). That reminder
lands the same morning the bundle door shuts, so it does the last-chance job with no extra
email. Add to it when we do the Be Touched emails: *"Have you got the P-Bundle yet? Door
closes at midnight."*

Because it now sends four days before the deadline, the copy was reframed off "tonight"
and onto "Sunday" throughout. A last-chance email sent early is not a last-chance email.

## The week of 20 July, as it stands

| Day | What's already there |
|---|---|
| Mon 20 | free |
| Tue 21 | Cult OS "This Week's Lie" (whole list) |
| **Wed 22** | **FREE → this email** |
| Thu 23 | Cult OS Invitation + Be Touched reminder 1, 6pm |
| Fri 24 | Podcast (whole list) |
| Sat 25 | Be Touched reminder 2, 9am |
| Sun 26 | Be Touched reminder 3, 9am ← **the P.S. goes here** |
| Sun 26 | Be Touched reminder 4, 6:15pm · masterclass 7pm |

Wednesday is the only genuinely clean day.

## Still open before it can be scheduled

1. **AUDIENCE IS NOT SET.** Currently defaults to all subscribers. Juliette to confirm.
2. **Template is "Text only" (5332768), not Chef.** The API cannot set Chef; do it in the UI.
3. **Header image.** Kiera's Drive link (`/file/d/1gcBM.../view`) serves an HTML page rather
   than an image, so it would render broken for every recipient. Dropped from the draft. If
   she wants it, host it on feelfullyyou.com and compress first: it is currently 1.27MB.

## Subject line options (3, per the standing rule)

1. **£186 of mine, free, until Sunday** ← currently in the draft
2. **The door closes Sunday at midnight**
3. **Last chance** *(Kiera's original)*

**Preview:** The door shuts at midnight Sunday. You have until 9 August to explore it all.

## What changed from Kiera's draft, and why

1. **Moved from 26 → 22 July** and reframed off "tonight". Juliette's call.
2. **Header image would have been broken for every recipient.** Drive `/view` serves HTML.
3. **Em dashes removed** from the speaker list (hard voice ban). Colons instead.
4. **`[name]` → Kit merge tag.** `[name]` would have shipped literally.
5. **"August 9" → "9 August"** to match UK format used everywhere else.
6. **P.S. punctuation was broken** ("until August 9  tonight is just...").
7. **"this is your sign" cut.** Cliché.
8. **"worth more than 'free'" cut.** The construction fought itself.
9. **The Touch Bundle is now described.** It was named and priced but never explained, which
   is the whole reason to click. Four items now listed.
10. **Three subject lines** rather than one.

## Kit API gotcha found while building this

The `description` field on a broadcast **silently 422s if it is too long**. A ~450-character
description returned only "There has been an error saving your changes", with no hint that
the description was the culprit. The email body, £ signs, and Liquid tags were all fine.
Keep broadcast descriptions short (~60 chars is known-good).
