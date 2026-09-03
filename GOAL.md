# Goal

## Outcome
Move the Touch Reset Quiz's Touch Pattern system from 3 patterns (Holder, Flame, Armour) to 4 (Holder, Operator, Explorer, Wanderer), propagated everywhere it needs to go: quiz questions + scoring, results page, Kit report emails, pattern icon images, and every other page still naming the old set.

## Why it matters
Juliette supplied all-new pattern copy for Holder (rewritten), Operator, Explorer, Wanderer, and said "we can change the Touch Reset quiz, the results, everything." Flame and Armour are retired.

## Done when
- [ ] Juliette has approved: the 6 new pattern-question answer sets, the PATTERN object copy, the tie-break order, and the Kit/icon plan
- [ ] touch-languages-quiz.html updated and pushed live (quiz questions, PATTERN object, scoring, PATTERN_TAG/PATTERN_SEQ, results-page tease lines)
- [ ] touch-hub.html, media-and-pr.html, the-room-women-original.html, touch-reset.html, questions/what-are-the-touch-languages.html, specs/warm-leads-crm.md fixed or explicitly deferred by her
- [ ] Kit: decision made and (if approved) executed on Holder's sequence content, Flame/Armour retirement, and new Operator/Explorer/Wanderer sequences — blocked on pattern icon images existing
- [ ] Icon images resolved: pattern-operator.png / pattern-explorer.png / pattern-wanderer.png sourced or commissioned

## Boundaries
- Nothing pushed live (git push or Kit `published:true`) without her explicit go-ahead on this specific piece
- No new copy invented beyond what she supplied, only formatted/adapted per surface, and new quiz-answer options drafted from her pattern descriptions for her review
- Prices stay off the results page

## Plan
1. Draft new answer options for the 6 pattern quiz questions (Q7-12), 4 options each — DONE, in chat, awaiting approval
2. Draft PATTERN object copy (name/short/line/leads/growth/braces) + tie-break order — DONE, in chat, awaiting approval
3. Repo-wide search for stale old-pattern references — DONE, in chat
4. Kit email plan (Holder rewrite, Flame/Armour retirement, new Operator/Explorer/Wanderer sequences) — drafted as a plan only, blocked on icon images, awaiting her decision
5. Once approved: implement site changes, push, then (separately) build/publish Kit changes as she signs off on each piece

## Decisions
- Superseded the first draft: Juliette supplied final copy for the 5 scored pattern questions (was 6), the results-page pattern summaries, and the scoring rule herself. Implemented as given, live now.
- Scoring: highest tally across Holder/Operator/Explorer/Wanderer wins; ties broken by whichever pattern was picked on Q10 ("something isn't quite working..."), not a fixed priority order.
- Old Q12 ("handing over control") retired from scoring; that slot is now the unscored Vision question, replaced with her new "if one thing could change" wording.
- Results page rebuilt per her spec: full pattern recognition block (name, result line, description, strength, growth edge, reflective question) + Pleasure Language block + bridge straight to the 15-Minute Touch Date. Touch Reset pitch removed from this page entirely, that CTA now points at /the-15-minute-touch-date.
- Kit email rewrite (new tone, no £97 pitch in the first email, bridges to 15-Minute Touch Date instead): she supplied a full worked example for Holder. NOT built yet, drafting is next, needs her sign-off before anything touches Kit.

## Progress
2026-09-03: Quiz question set, scoring, and results page shipped live and verified (no console errors, correct field population, tie-break logic traced by hand). GOAL.md updated to reflect the funnel change (quiz -> 15-Minute Touch Date -> Touch Reset, not quiz -> Touch Reset directly).

## Progress (cont.)
2026-09-03 later: Kit infrastructure built, DRAFTS ONLY, nothing published/live yet:
- Tags created: Touch Pattern - Operator (23079697), Touch Pattern - Explorer (23079699), Touch Pattern - Wanderer (23079700)
- Sequences created: Touch Pattern Result - Operator (2882951), - Explorer (2882952), - Wanderer (2882953)
- Draft emails written in grouped paragraphs with visual hierarchy (per her feedback that the one-line-per-line staccato version read badly): Holder's existing live email (id 10058800, sequence 2821038) has a pending unpublished draft revision; Operator (10270456), Explorer (10270458), Wanderer (10270459) are new unpublished drafts. confirm_urls given to her per sequence.
- Results page also got a visual hierarchy pass per her feedback: strength/growth-edge are now gold-accented callout cards, the reflective question is bigger and gold, Pleasure Language description split into bold-open/plain-mid/italic-gold-close instead of one flat paragraph. Live, verified with a screenshot.

## Open questions
- Icon images for Operator/Explorer/Wanderer: don't exist yet. Source new photos/icons, or a different treatment (no icon)?
- What happens to Flame/Armour Kit sequences and any subscribers already tagged with them: retire like dormant Signal/Current, or repurpose?
- Should the "Meet Touch Base™" second email (currently a draft, identical across patterns) be built per-pattern for the two new-tier patterns too, or left as-is?
- Kit drafts need her review + explicit publish before the site's PATTERN_TAG/PATTERN_SEQ get updated to the real Operator/Explorer/Wanderer IDs and pushed live — publishing the site wiring before the Kit emails are live would enroll people into sequences with no live content.
- Other pages still naming the old pattern set (touch-hub.html, media-and-pr.html, the-room-women-original.html, touch-reset.html, questions/what-are-the-touch-languages.html, specs/warm-leads-crm.md): not yet touched.
