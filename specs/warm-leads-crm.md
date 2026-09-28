# Warm Leads CRM — Spec

**Written 8 August 2026. Nothing built, nothing deployed.**

Companion to `specs/stripe-payment-notifications.md` (written 7 Aug, also not yet built). That spec makes the instant-of-purchase moment loud and correctly labelled. This spec makes the *before* visible: who took the quiz, who's warm, who's been sitting there the whole time, so a purchase never again reads as a surprise the way Andrea's did.

## Objective

Juliette currently has no single place that shows, per person, whether they took the quiz, what their result was, whether they're actually engaging with email, and whether they've bought anything. Each of those signals lives in Kit but nothing combines them, and the one page that tried (Daily CRM Brief) sat silently broken for 13 days without anyone knowing. This build replaces it with a Notion **database** (not a single page) that behaves like a spreadsheet, one row per person, accumulating and never overwritten, refreshed daily, checked every morning via a calendar reminder, and connected to the real-time purchase notification so a new buyer's row shows their prior warmth immediately, not days later by accident.

## Requirements

**R1.** A Notion database (not a page) with one row per subscriber who has EITHER taken the Touch Reset Quiz (holds any Touch Pattern tag) OR holds the Buyer tag. Columns: Name, Email, Quiz taken (Y/N), Pattern (Holder/Flame/Armour/Signal/Current/blank), Stage (Gone/Brace/Quiet/not set), Last email opened (date), Last email clicked (date), Warm (Y/N, computed — see R2), Buyer (Y/N), What they bought (product label(s), comma-separated if more than one), Social handle (text, manual entry), Notes (text, manual entry), Last synced (date).

**R2.** "Warm" (the Y/N column) = took the quiz (any Pattern tag) AND opened or clicked at least one email in the last 14 days. This is a starting definition — Juliette can tighten or loosen the window once she's used it for a week; the column must be easy to redefine without rebuilding the database.

**R3.** A daily scheduled task (replacing `daily-crm-brief` entirely — that task is deleted, not left running alongside this one) that:
   - Pulls every subscriber with a Touch Pattern tag, a Buyer tag, or both, from Kit.
   - Upserts each into the database: update existing rows by matching on email, create new rows for anyone not yet in it. Never deletes a row.
   - Pulls each person's engagement stats (`list_stats_for_a_subscriber`) to fill Last email opened / Last email clicked, and recomputes Warm per R2.
   - Excludes internal/team addresses (same exclusion list already built into the fixed `daily-crm-brief` task: jckaraman@me.com, jckaraman@aol.com, kiera.thakrar1510@gmail.com, kiera@feelfullyyou.com, juliette@feelfullyyou.com, bights_58frizzes@icloud.com, noorkaraman@icloud.com, julietteckaraman@gmail.com, kilnbyre@gmail.com, and anything containing "test").
   - Never overwrites a manually-filled Social handle or Notes cell with a blank.

**R4.** A Notion view (saved on the database) filtered to Warm=Y AND Buyer=N, sorted by Last email opened descending. This is the view the morning calendar reminder links to, it's the "who should I talk to today" list, not the full database.

**R5.** A Google Calendar event, recurring daily, titled something like "Warm leads check", with the R4 view's URL in the description. Reuses the existing recurring-event pattern already used elsewhere in the account (e.g. the Daily CRM Brief calendar link) rather than inventing a new mechanism.

**R6.** Integration with `specs/stripe-payment-notifications.md`'s `notifyPayment` function: when a payment is identified (rows 1, 3, 4 of that spec's exit-point table), after the Kit tagging succeeds, look up whether that email already has a row in this database with Warm=Y. If so, the Telegram message gets one extra line: "Was warm — took the quiz, Pattern: <X>, last opened an email <N> days ago." If they were never in the database (cold purchase, no prior quiz/engagement), no extra line. This is the actual "Andrea insight" Juliette asked for: knowing at the moment of purchase, not days later, that the buyer was already warm. Implementation detail: this requires the notify function to make one Kit lookup before sending, which must follow the same "never break the payment flow" rule as R3 of that spec — wrapped, swallowed on failure, the Telegram message still sends without the extra line if the lookup fails.

**R7.** An end-of-day check (scheduled task, evening, e.g. 6pm) that looks for anyone who crossed from Warm=Y to Buyer=Y that same day and pushes a summary notification (via the existing PushNotification mechanism, or a Telegram message matching R6's channel) only for conversions Juliette hasn't already seen via the real-time R6 alert. In practice this means: if R6's Telegram message already fired for a given purchase, don't re-notify about it at end of day; this is a safety net for anything R6 couldn't identify in the moment (e.g. the Kit lookup failed) or for Juliette catching up after a day away from her phone.

**R8.** Never fail silently. If the daily sync (R3) errors partway, or Kit/Notion is unreachable, the database itself must show a visible marker (a pinned row or a property on a settings row, not just an absent update) saying the last successful sync date, so a broken sync is never mistaken for "nobody new today." This directly follows the lesson from `daily-crm-brief` sitting dead for 13 days with no visible sign of it.

## Out of scope

- A literal Google Sheet. Juliette asked for something that "looks like Google Sheets"; a Notion database is the buildable equivalent with the tools currently connected. A real Google Sheets sync is a separate piece of work needing a new connector, not part of this build.
- Automated social handle capture. Remains a manual field (R1) until/unless the quiz or opt-in forms are changed to ask for it, which is separate work.
- Any change to how Kit tags, sequences, or the Stripe webhook's existing purchase-identification logic work. This spec reads from that system, it doesn't change it (except the one addition in R6, which is additive and wrapped so it can't break anything).
- Any change to `stripe-webhook.js` beyond the R6 addition — the rest of `specs/stripe-payment-notifications.md` is that file's own spec, not duplicated here.
- Sending anything to a lead or customer. This is Juliette's own visibility tool.
- Kiera or Charlene write access or workflow changes. They may be given read access to the Notion database if Juliette wants, but nothing in this spec assigns them a task.

## Constraints

- Built on the same stack already proven today: Kit MCP for subscriber/tag/engagement data, Notion for the database and views, the scheduled-task system for the daily sync and end-of-day check.
- R6's integration point lives inside `stripe-webhook.js` (Netlify function, `couples-cards-app`/`feelfullyyou-site` — confirm which repo owns the live webhook before implementing) and must follow that file's existing "never break the payment flow" pattern (try/catch, swallow, never affect the returned status code), same as `grantPracticeAppEntitlement` already does.
- No pricing, brand copy, or site-facing content involved; the FFY brand rules (four colours, no em dashes, etc.) don't apply to this internal tool.
- Kiera and Charlene have Notion access only, no Claude Code, no scheduled tasks, no repo access — this build is Juliette's own tool; they are not assumed users of anything but the shared database view if she chooses to share it.

## Edge cases

**E1.** A person bought before ever taking the quiz (cold purchase). Row still gets created (Buyer=Y), quiz/Pattern/Stage columns stay blank, Warm=N (fails R2's quiz requirement). No "was warm" line in the R6 notification.

**E2.** A person retakes the quiz and gets a different Pattern. The daily sync (R3) updates the Pattern column to the current tag rather than appending a second row — one row per email, always.

**E3.** A person has two email addresses in Kit (rare but possible with re-signups). Treat as two separate rows; this spec does not attempt identity resolution across multiple emails, that's a bigger problem than this build should try to solve.

**E4.** The Repair Kit tag situation from today (a Kit product tag that turned out to include free/comped recipients, not real buyers) — the daily sync must not assume any product tag equals a real purchase. Buyer=Y and "what they bought" should be sourced from the same logic `stripe-webhook.js` already uses to identify a real payment (PRODUCT_MAP-driven), not from downstream Kit tags alone, so a comped person doesn't show as a false buyer in this database the way the Kit Buyer-tag backfill briefly did today.

**E5.** Nobody converts from Warm to Buyer on a given day. R7's evening check sends nothing, not an empty "no updates" ping, matching the existing PushNotification guidance against notifying when there's nothing worth acting on.

**E6.** The database grows very large over months. Notion databases handle thousands of rows without special handling; no pagination/archiving logic needed at this scale, but the R4 filtered view keeps the daily-use case fast to scan regardless of total size.

**E7.** Someone unsubscribes or bounces after being added. The daily sync (R3) doesn't remove their row (R3 says never delete), but should reflect their current Kit subscriber state in a column if useful for Juliette to filter out — add a State column (active/cancelled/bounced) sourced directly from Kit's subscriber state field.

## Definition of done

**D1.** The Notion database exists with all R1 columns, contains a row for every current quiz-taker and every current buyer (excluding the internal-address list), and the daily sync has run at least once successfully with a visible "last synced" marker.

**D2.** The R4 filtered view (Warm=Y, Buyer=N) is saved and its URL is confirmed working by opening it directly.

**D3.** The calendar event (R5) exists, recurs daily, and its description contains the working R4 view link — confirmed by opening the calendar event and clicking through.

**D4.** A test purchase (or the next real one) on a subscriber already in the database with Warm=Y produces a Telegram message (per `stripe-payment-notifications.md`) that includes the extra "was warm" line with the correct Pattern and days-since-last-open.

**D5.** A test purchase on a subscriber NOT in the database produces the normal Telegram message with no extra line, and does not error.

**D6.** Simulating a sync failure (e.g. temporarily revoking Notion access for the test) results in the database showing a visible stale-sync marker instead of silently showing old data as current — verified deliberately, not assumed, matching the same verification standard applied to `daily-crm-brief`'s fix today.

**D7.** `daily-crm-brief` (the old scheduled task) is deleted, and the Notion page it used to update either redirects/links to the new database or is archived with a note pointing to the replacement, so nobody finds two conflicting "CRM" pages later.

**D8.** Juliette opens the database on her phone or laptop and can, within one glance at the R4 view, name three people worth reaching out to today, using only what's on the screen, no digging in Kit required.
