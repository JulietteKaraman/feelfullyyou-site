# Summit Pleasure Bundle — Follow-Up Sequence

**Status: WRITTEN, NOT WIRED.** Kit MCP isn't connected this session, so this sequence
isn't built or published yet. Paste these into a new Kit sequence ("Summit Pleasure
Bundle") once reconnected, same pattern as be-touched-masterclass-emails.md.

**Trigger:** subscriber opts in at /summit-pleasure (posts to
`/.netlify/functions/subscribe`, currently `tagIds: []` placeholder in
summit-pleasure.html — create a Kit tag e.g. "summit-pleasure" and wire its ID into
both the page and this sequence before going live).

**Why two emails, not three:** the page itself already delivers all three bundle items
instantly (One Touch, 10 Touch Rituals, 50% off the app) — no separate "here's your
stuff" email needed, per the site's standing rule that free guides deliver unconditionally,
not behind an email click. These two emails are pure follow-up: the natural next step for
Touch Rituals owners, then the highest-leverage live event.

---

## Email 1 — Day 2, "the month that follows"
**Subject:** The 10 rituals were the start. Here's the month.

Body:

Hi {{ subscriber.first_name | default: "there" }},

You picked up 10 Touch Rituals a couple of days ago. I hope one of them has already
found its way into an ordinary Tuesday.

Here's what those ten don't tell you: one touch, once, teaches your body something. A
month of them teaches your body a different way of living.

That's what 31 Daily Touch Points is. One touch point a day, for 31 days. Some alone, to
come home to your own body. Some together, to practise reaching before the moment gets
complicated. Each one comes with the reason it works, not just the instruction.

[Add the 31 days →](https://feelfullyyou.com/trip-wire)

This is the only place that bundle rate exists. It's never sold at that price on its own.

Still following the breadcrumbs,
Juliette

---

## Email 2 — Day 6, invite to Be Touched
**Subject:** Sunday, 26 July. 7pm UK.

Body:

Hi {{ subscriber.first_name | default: "there" }},

A guide teaches you the moves. A live room teaches you what happens when your body
actually tries them, in real time, with other women in the same room.

That's Be Touched. A live masterclass, 75 minutes, Sunday 26 July at 7pm UK. What
keeps a body armoured even in a loving relationship, and what it takes to come home to
it. If you can't make it live, the replay comes to you.

[Save your seat →](https://feelfullyyou.com/be-touched-masterclass)

Still following the breadcrumbs,
Juliette

---

## Build checklist for whoever wires this
1. Create Kit tag "summit-pleasure" → get its numeric ID.
2. Add that ID to `tagIds` in `summit-pleasure.html` (currently `[]`), push.
3. Create Kit sequence "Summit Pleasure Bundle" with the two emails above (delay 2 days,
   6 days from enrolment).
4. Wire the sequence ID into the same `subscribe` fetch call in `summit-pleasure.html`
   (`sequenceId`), push.
5. Confirm Be Touched Masterclass tag/sequence (21027856 / 2822605) stays untouched —
   Email 2 here just links to registration, it does not double-enrol.
