# The Sacred No — Funnel (staged for wiring)

Built 8 Jul 2026. Front-door lead funnel: free quiz → archetype result → nurture → The Sacred No 7-day reset (£27) → ascends toward Touch Point / The Room / The Beginning.

## Live pieces (done)
- **Quiz:** https://feelfullyyou.com/sacred-no-quiz  (also /the-no-quiz, /no-quiz)
  12 questions, sum-scored 12–60, maps to 7 archetypes. Delivers the full reading on-page + CTA to /sacred-no. File: `sacred-no-quiz.html`.
- **Sales page:** https://feelfullyyou.com/sacred-no  — repriced to £27, 7-day self-led somatic reset. File: `sacred-no.html`.
- **Stripe (Pleasure By Design Ltd):**
  - Product: `prod_SGzqxmQZjms9pm`
  - £27 price: `price_1Tqs53CCw18geY15u8MDw3OW`
  - £27 payment link (promo codes ON, redirects to /thankyou-sacred-no): **https://buy.stripe.com/9B6fZgfSz7X23Pvav30co1x**
  - Old £55 price (`price_1TqA3E…`) + link (`…co1q`) left inactive-in-place; retire when ready.
- **Thank-you:** /thankyou-sacred-no (`thankyou-sacred-no.html`) — delivery page, no price. Needs the daily-video delivery added (see video map).

## BLOCKED on Kit auth (do when Kit connector is live)
The quiz page email capture stays hidden until these exist. In `sacred-no-quiz.html`, fill the `TAGS` map + set `SEQ`, then `WIRED` flips true and the capture form appears.

1. Create 7 Kit tags, one per archetype:
   `The Dimmed Flame`, `The Pattern Holder`, `The Armoured One`, `The Rhythm Restorer`, `The Living Signal`, `The Embodied Current`, `The Remembered One`
2. Create one nurture sequence: **Sacred No Funnel** (Email 1 → 2 → 3 below).
3. Drop the tag IDs into `TAGS{}` and the sequence ID into `SEQ` in `sacred-no-quiz.html`, redeploy.
4. Quiz posts `{email, tagIds:[archetypeTag], sequenceId:SEQ, archetype}` to `/.netlify/functions/subscribe` (same function Pleasure Languages uses).

---

## Nurture emails (voice-cleaned: no em dashes, no "lovely", no "not alone")

### Email 1 — Your pattern (send immediately)
**Subject:** Your pattern has arrived
**Preview:** You touched base. Here is what it reveals.

Hello [First Name],

You finished the quiz, and your result is here: **[Archetype]**.

This does not define you. It reflects where your clarity, your energy, and your truth are still filtered through old habits and well-practised survival roles.

Your reading shows you three things: how you are navigating your standards right now, the quieter dynamics shaping your yes and your no, and the next step that meets you where you are.

Read it slowly. If your body already knows what comes next, trust it.

[Read your full reading]

Juliette

### Email 2 — The invitation (send day 1 after)
**Subject:** The Sacred No begins here
**Preview:** Your next edge is not in your head. It is in your body.

Hello [First Name],

Now that you have seen your pattern clearly, the real question is whether you are ready to live from something truer.

**The Sacred No** is a seven-day, body-based reset. A few minutes a day to feel your yes and your no in real time, and to stop softening what is true.

You get one short practice a day, under fifteen minutes, a tracker to witness the shift, and a simple way to feel your yes and no in the body before you speak. Self-led, self-paced, from wherever you are.

This is not about pushing people away. It is about coming home to what is real, without guilt, apology, or the need to over-explain.

[Step into The Sacred No — £27]

Juliette

### Email 3 — Final nudge (send day 3 after)
**Subject:** You do not need to be louder. You need to be clear.
**Preview:** The invitation your body has been waiting for.

Hello [First Name],

Your result revealed the part of you that is ready to shift. To claim your truth. To honour your timing, your energy, your no.

Reflection without practice fades fast. The Sacred No is where you root it, in breath and in the body, one clean no at a time. Seven days. £27.

Let your no become a place of calm rather than conflict. Power rather than protection.

[Start The Sacred No]

Juliette

> A longer 5-email launch/broadcast set (Say Yes to Your Sacred No, Struggling to Say No, Imagine Saying No Without Guilt, testimonials, Last Chance) exists in the source doc for when you run this as a timed promo. Same voice cleanup applies before sending.

---

## Sacred No 7-day delivery — video map (use existing Drive videos)
Map her own "saying no" library to the seven days already on the sales page. Host each as unlisted (YouTube/Vimeo) and embed in a daily Kit email or the members drip.

| Day | Practice (on sales page) | Video | Drive ID |
|---|---|---|---|
| Welcome | Intro to the reset | The 7 DAY CHALLENGE Say No intro | 1GsjIRvwt-Rlhnd4aw51_OhPzsUxqABdg |
| 1 | Finding the signal | 7 Signs Your Body Isn't a Yes (Even When Your Mouth Is) | 1woztbgqjP3zo_kFhEXjE9-79zYP7Z_PS |
| 2 | The breath of refusal | Saying No Meditation | 1pvl5NeNVZ8WICPD9Qvm9Gph4IXrTJbCB |
| 3 | Standing in it | Saying No Is a Full Sentence | 1HcSF8dsOeDz0Zfrzv29a4WELAgM0o0PS |
| 4 | The guilt response | Conditioned to NOT Say No | 1OL2JKNKtIWq8KgrMivnzwC3p2XNF-isB |
| 5 | Clarity without collapse | Sticking to Your Boundaries and Inner Truth | 1Z676_UAAFL3h6irBW6IsuGYLDukeEONg |
| 6 | The body as authority | The Power of Saying No: Reclaiming Your Boundaries and Inner Safety (long form, trim) | 1VKtg3neff1yiM8sk0Nm9gLB1VeR7e7Um |
| 7 | Integration | Saying No, Superpower / Tribe | 16Wp4t8tHrsZA3zd1tyaEUr-Sl42AoC5c |

Spares: "When You Say Yes But Mean No", "Why Her Yes Doesn't Always Mean Yes", "Safety with Boundaries / tell me what a boundary is for you", plus the Sacred No Tracker PDF (already promised on the sales page — needs building).

## Remaining to-do
- [ ] Kit: 7 archetype tags + Sacred No Funnel sequence (Emails 1–3), then wire IDs into `sacred-no-quiz.html`.
- [ ] Build Sacred No Tracker PDF (promised on sales page).
- [ ] Host 7 videos unlisted + build daily delivery (Kit daily emails or members drip).
- [ ] Add the quiz to entry points: /free-resources, link from The Room / for-her, and a DM keyword (e.g. NO or SACRED).
- [ ] Optional: retire the old £55 Stripe price/link once no live links point at it.
