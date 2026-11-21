# The Quiz-to-Book Funnel: working plan

Draft of 19 Nov 2026. Nothing in this plan has been built or changed. Checked against Canon (Notion, read 19 Nov) and the live quiz source (`touch-languages-quiz.html`, served at `/touch-reset-quiz`).

## The decision

The book is the result of the quiz. It is a separate thing from the Touch Languages (Emotional, Energetic, Erotic, Physical, Spiritual), which stays its own later project. Mixing the two would confuse readers, because the quiz measures Pleasure Language and Pattern, not Touch Languages.

Working title: **Where Did the Touch Go?** (matches the quiz).

## The ladder

Quiz (free) -> book (paid) -> Scrumptious Confessions (free fortnight, then membership) -> Touch Reset call -> The Scrumptious Touch Reset (the ONE core offer).

Side door for the warm: 15-Minute Touch Date (already built, 5-email Kit sequence 2898047) -> call.

Women go to the Touch Reset call. Men and couples enter through Confessions, then the couples route (The Beginning or a VIP Day). Canon says men do not enter through the Touch Reset.

## Rules this plan keeps

- The result page never offers a call. Decided 30 Oct: a Touch Audit straight after the quiz got 0 clicks and Juliette would never book a call that fast. The call is offered later, by email.
- One direction only. Each person gets one next step at a time, not a menu.
- Touch is always capital T. No em dashes. No prices inside the book or emails; prices live on sales pages.
- The Touch Reset is the method. The Scrumptious Touch Reset is the 8 week women only programme.

## What the quiz already collects

Per person, saved to Kit by `/.netlify/functions/subscribe`:

| Data | Values |
|---|---|
| State (tag + sequence) | Braced, The Fade, Reaching, Melted |
| Pleasure Language | Sensual, Sexual, Energetic, Kinky, Shapeshifter |
| Pattern | Holder, Operator, Wanderer |
| Who it is for | woman, man, couple, self, plus identity |
| Wants | feel it, stay with it, ask for it, more often, more of the same |
| Readiness | ready-good, ready-wrongkind, ready-stuck, ready-sad, ready-yes, ready-now |

The code already has `READY_CALL = {ready-yes, ready-now}`, so the call is already limited to the two most ready groups. It is just not connected to a booking path yet.

## Readiness routing

| Tag | What she said | Where she goes | Call? |
|---|---|---|---|
| ready-good | "Fine, the same again" | Book, then Confessions free fortnight (for more depth) | No |
| ready-wrongkind | "Never quite right" | Book first (Pleasure Language chapter), then Confessions | Later, after 2+ weeks in Confessions |
| ready-stuck | "Something sinks" (how would I bring this up?) | Book (conversation chapter), 15-Minute Touch Date, Confessions | Later |
| ready-sad | "Sad, then I carry on" | Book, gentle Confessions invite, no pressure | Later, softly |
| ready-yes | "I'd rather have the awkward conversation" | 15-Minute Touch Date, book, call invitation by email | Yes, email on day 3 or 4 |
| ready-now | "I want to start now" | Call invitation by email first, Touch Date same day, book as an extra | Yes, email on day 1 or 2 |

"Later" means a Kit rule: tag added when she joins Confessions, then the call invitation after about 14 days. This keeps the call for people who are ready, and gives the others a way to become ready.

## The book

About 20,000 to 25,000 words. Built around what the quiz already tells people.

1. The hook: the moment Touch stopped feeling like yours.
2. Part one, where the Touch went. One chapter per state: The Brace, The Fade, The Reach, The Melt. Each has a scene, what is happening in the body, what staying here costs, and one small practice.
3. Part two, how you are wired. Pattern (Holder, Operator, Wanderer) and Pleasure Language, with Jaiya's Erotic Blueprints credited (Canon: never hide it).
4. Part three, the way back. Touch Base, the 15-Minute Touch Date, the conversation you have been avoiding.
5. Why I built Scrumptious Confessions.
6. What to do next.

Each buyer is told which chapter to start with based on her state. One book, with a "start here" note per state. A per-state excerpt could be a later bonus.

## Changes to the quiz

1. Result page: replace the old doors (`/work-with-me`, One Touch, The Unspoken Distance) with one door, the book. Confessions follows inside the book and in the email.
2. After purchase: confirmation page gives the book and the free Confessions fortnight. A rolling 14 days from purchase is needed, because Canon has the fortnight as a fixed window (23 Nov to 6 Dec).
3. Kit: new tags for "Bought: book" and "Confessions: trial started". The readiness rules above run on these.
4. Calls: connect the TidyCal Touch Reset call slug to the ready-yes and ready-now emails only.
5. Men and couples: separate email wording after Confessions. Needs Juliette's decision.
6. Free quiz stays free. Email is still asked for before results.

## Open decisions for Juliette

- Book price: DECIDED 19 Nov, £17 (Juliette). Shown on the sales page only, never inside the book or emails. Optional later test against £27 if buyers are plentiful. Optional single order bump: the book read aloud by Juliette.
- Call format and length. Is the call free?
- Rolling fortnight versus fixed dates for the Confessions trial.
- Whether to record Touch Reset Module 1 before sending ad traffic to the call.
- Touch Reset price (currently around £1,500, possibly £2,000). The call needs it settled.
- What men and couples are offered after Confessions.
- Whether the Touch Reset call exists as a live booking route today. Canon says the Touch Reset page is waitlist only, with no Book-a-call buttons.

## Not yet verified

- The live site could not be reached from this session (network blocked), so the quiz was read from the repo copy, not the live page.
- The content of the four state email sequences (2910584, 2910585, 2910587, 2910588) was not read.
- Whether `/touch-date` and its 5-email sequence currently send people to book a call or only to the waitlist.

## Update, 21 Nov 2026: Confessions facts changed

From the Notion page "Decided 20 to 21 Nov 2026: Confessions launch thread". This replaces what this plan said about the free fortnight.

- The trial is now **7 days free, with the card going in**, and nothing charged for 7 days. It is a rolling 7 days from sign-up, not a fixed fortnight. That settles the question this plan raised about a rolling trial.
- Doors opened Monday 23 November. The first 50 members keep the starting price for as long as they stay.
- Telegram, "two weeks free", the old lower price, the waitlist and Sunday answers are all marked dead.
- Something opens most days: a Monday confession, cards, a Wednesday poem, Thursday answers, a Friday meditation, and Touch Base every day. The Touch Map starts with the wrist in week one.
- Your Day 14 post says you no longer sell work for £17 and that everything under £200 lives in Confessions. The £17 book is an exception, as a front door. Decide whether to say so.
