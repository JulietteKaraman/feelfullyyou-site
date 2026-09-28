# Blotato Schedule Connector — Spec

**Written 9 August 2026. Nothing scheduled to a live account, nothing pushed. Built and tested in dry-run mode only.**

## Objective

Confirmed live via the Blotato API on 9 Aug 2026: `blotato_list_schedules` returns zero posts queued for the future. `blotato_list_posts` shows real content did go out — three reels each pushed to TikTok/Facebook/Instagram/LinkedIn on 5 Aug (all four platform copies of each reel posted within the same ~40-minute window, back to back), then a single Instagram carousel on 6, 7, and 8 Aug, one per day. Every one of those posts has a `postTime` within seconds of when it actually went live — nothing was scheduled ahead, everything went out same-day, almost certainly pasted in by hand.

Separately, `/Users/julietteckaraman/Documents/APP builds/12 Work In Progress/` (`README.md`, `needs-review/`, `approved/`, `shipped/`) exists specifically so finished content has somewhere to sit while waiting for a yes or no. As of this spec, all three folders are empty — not because nothing has been drafted today, but because (per the README's own "Not yet wired up" section) none of the content skills (`touch-demo-reel`, `broll`, `repurpose-reel`, `read-footage`, the carousel skills, etc.) have been updated yet to actually save a copy there. That wiring is separate, already-flagged work, out of scope here.

This spec covers the missing middle step: once something *does* land in `approved/`, what actually carries it into a booked Blotato slot. Right now, nothing does — a human has to remember `approved/` exists, open Blotato, and paste it in. This is the actual mechanism behind "I have so much content and nothing gets pushed."

## Hard safety constraint (non-negotiable, carries into every future run of this connector)

This connector must **never** call `blotato_create_post`, `blotato_update_schedule`, `blotato_delete_schedule`, or any other Blotato write/mutation tool against Juliette's real connected accounts without her explicit, per-run sign-off. Scheduling content to her live public social accounts is not something any automated task gets to do on its own judgement, ever, until she says otherwise in so many words.

The build against this spec is **dry-run only**: it computes and logs exactly what it *would* schedule (which item, which platform(s), what time, what caption, which Blotato account ID) using only read-only Blotato tools (`blotato_list_accounts`, `blotato_list_schedules`, `blotato_list_posts`, `blotato_get_schedule`, `blotato_list_pinterest_boards`). It never calls a Blotato write tool. This is enforced the same way every other scheduled task on this system enforces its rules — in the prompt, in explicit, repeated, capitalised language — because the scheduled-task system has no per-task tool allowlist to lock this down mechanically (checked: no existing scheduled task under `~/.claude/scheduled-tasks/` restricts its own tool access via frontmatter; enforcement is always prose-level). Flipping this connector into live mode is a distinct, future, explicitly-requested change — not a flag this spec turns on.

## Requirements

**R1.** A daily scheduled task (`blotato-schedule-connector`, `~/.claude/scheduled-tasks/blotato-schedule-connector/SKILL.md`) that runs once a day and scans `12 Work In Progress/approved/` for eligible items.

**R2.** **Eligibility filter.** Not everything in `approved/` is Blotato's job — the folder also holds Kit email drafts and site-copy rewrites (per the README), which are handled by their own tools (Kit, git), not Blotato. An item is eligible for this connector only if its filename type tag (`YYYY-MM-DD-<type>-<topic>.md`) is one of: `reel`, `broll`, `carousel`, `facebook-post`, `linkedin-post`, `static-post`, `talking-head`. Items typed `email` or `site-copy` are always skipped by this connector (left for their own tools) and are not logged as failures, just noted as "not this connector's job."

**R3.** **Metadata contract.** Because no skill writes to `approved/` yet, this is a new contract this spec defines, not one observed from real files. An eligible item must carry YAML frontmatter with:
   - `platforms:` a list of one or more of `instagram`, `facebook`, `tiktok`, `linkedin`, `pinterest`, `youtube` (must match Blotato's own platform names).
   - `caption:` the final, already-preflighted post text, verbatim.
   - `media:` a list of local file paths or public URLs (omit/empty only for LinkedIn or Facebook text posts — Instagram, TikTok, YouTube, Pinterest all require media, matching `blotato-publish`'s existing rule).
   - `media_type:` (Instagram/Facebook only) `reel`, `story`, or feed default.
   - `scheduled_time:` optional explicit ISO 8601 time; if present, the connector uses it as-is instead of the cadence assignment in R5.
   - `preflight_passed:` `true` — the connector must find this explicitly set to `true`, matching `blotato-publish`'s existing "never schedule copy that hasn't passed preflight" rule. If missing or `false`, the item is skipped with that reason logged, never scheduled anyway.
   
   An item missing `platforms`, `caption`, or (where required) `media` is skipped with the specific missing field logged — the connector never guesses a platform, invents caption text, or assumes a media file. This mirrors `blotato-publish`'s existing rule to never invent an account, page, playlist, or board ID.

**R4.** **Platform/account resolution.** For each eligible, complete item, the connector calls `blotato_list_accounts` (read-only, safe to call for real every run) to resolve the live `accountId` (and `pageId` for Facebook, matching `blotato-publish` Step 3) for each requested platform. It never hardcodes an account ID — Juliette's own `blotato-publish` skill already states account IDs can change and must be pulled live every time; this connector follows the same rule.

**R5.** **Cadence and timing — this entire requirement is an ASSUMPTION, not a confirmed fact, and needs Juliette's explicit sign-off before any of it goes live.** Inferred from the real Aug 5–8 `blotato_list_posts` pattern (checked live 9 Aug 2026):
   - 5 Aug: three separate reels, each pushed to Instagram + Facebook + TikTok + LinkedIn together, back to back, in the afternoon (roughly 16:00–16:41 UK time).
   - 6, 7, 8 Aug: one Instagram-only carousel per day, posted mid-afternoon (~14:00–15:01 UK time / 14:01 UTC each day).

   From that, the assumed default cadence is: **multi-platform "hero" items (3+ platforms on one item) get spaced roughly every other day to 3x/week; single-platform Instagram-only items get spaced daily, filling days that don't already have a hero item.** The connector orders the eligible backlog oldest-first by filename date (FIFO, so nothing sits indefinitely), and assigns each item the next open slot going forward from **tomorrow** — never today, matching `blotato-publish`'s existing "never default to post now" rule. Multi-platform items are assumed to fire at ~16:00 UK; Instagram-only items at ~14:30 UK. These specific days-per-week and clock times are the assumption Juliette needs to confirm, adjust, or reject before this becomes real scheduling behaviour — this spec does not treat the Aug 5–8 sample (4 days, 2 content shapes) as a settled cadence, only as the best available starting guess.

**R6.** **What the connector actually does each run (dry-run mode, as built):**
   1. Glob `approved/*.md`. If none match R2's eligible types, log "0 eligible items" and stop cleanly — this is not a failure state.
   2. For each eligible item, validate the R3 contract. Skip and log incomplete ones individually (do not fail the whole run over one bad file).
   3. For complete items, resolve accounts live (R4) and compute the cadence slot (R5).
   4. For each platform on each item, build and log the **exact** payload that `blotato_create_post` would receive (`accountId`, `platform`, `text`, `mediaUrls`, `scheduledTime`, plus any platform-specific required field such as `pageId`/`mediaType`/`privacyLevel`) — without calling it.
   5. Write the full proposed schedule to a status file (R8) in a form Juliette can read in one pass and approve or reject.
   6. **Never** move a file from `approved/` to `shipped/` in dry-run mode — that move only happens in a future live mode, and only after R7's confirmation step actually runs against a real, confirmed schedule.

**R7.** **Confirming a schedule took (defined now, not executed until live mode exists).** After a live `blotato_create_post` call, the connector must call `blotato_get_post_status` (if a `postSubmissionId` came back in-progress) or `blotato_list_schedules`/`blotato_get_schedule` to verify the post actually shows as `scheduled` with matching text and time before treating that platform as done. An item only moves from `approved/` to `shipped/` once **every** platform listed on it is confirmed scheduled; if one platform fails and others succeed, the item stays in `approved/`, the failure is logged per R8, and the successful platforms are noted so they aren't re-submitted on the next run (this mirrors `blotato-publish`'s existing "partial failures: report separately, never roll back" rule).

**R8.** **Never fail silently.** Every run — success, partial, or failure — writes to `12 Work In Progress/.blotato-connector-status.md`, a pinned "⚠️ SYNC STATUS" section at the top of the file, overwritten each run:
   - Success: `Last run: <date/time>. N items found, N eligible, N skipped (reasons), N proposed (dry-run) / N scheduled (live mode only).`
   - Failure (e.g. Blotato unreachable, `blotato_list_accounts` errors, a malformed file crashes parsing): `⚠️ Run failed <date/time>: <one-sentence reason>. Last known-good run: <date/time>.`
   
   This is the same lesson `warm-leads-crm-sync` already encodes for the Warm Leads CRM (a broken sync must never look identical to "nothing new today") — applied here because this connector has exactly the same failure mode: a silent no-op reads as "all caught up" when it might mean "broken."

## Out of scope

- Wiring the six content skills to actually write into `needs-review/`/`approved/` in the first place. That's the README's own flagged next step, not this connector's job — this connector only consumes what's already there. **As of this build, `approved/` is empty, so this connector currently has nothing to process.** That's a separate, already-known gap, not something this spec fixes.
- Live/write-mode scheduling. R7 defines the mechanism for when it's built, but no live-mode code path exists in this build — see the hard safety constraint above.
- Any change to the `blotato-publish` skill's own manual, conversational scheduling flow (Juliette or an agent saying "schedule this on Instagram" mid-conversation). This connector is the unattended daily sweep of `approved/`; `blotato-publish` remains the on-demand, one-at-a-time tool. They share Blotato read patterns but are separate entry points.
- Telegram or push-notification delivery of the daily proposal (the pattern `warm-leads-crm-sync` uses for its own daily push). The status file (R8) is the only output in this build; a Telegram push of the same content is a natural next step but adds a second live dependency (site env var lookup, real message send) this build didn't need to take on to close the actual gap. Flagging it rather than building it unasked.
- Any cadence or timing logic beyond R5's single assumed pattern — no per-platform-optimal-time research, no A/B slot testing, no engagement-based timing. That's a deliberate simplification pending her sign-off on even the basic cadence.

## Constraints

- Built on the same stack already proven today: the Blotato MCP (read-only tools only, per the hard safety constraint), the scheduled-task system for the daily run, `Read`/`Write`/`Glob` for the `approved/` folder and the status file.
- No pricing, brand copy, or site-facing content decisions happen in this connector — it moves and logs already-finished, already-preflighted content, exactly like `blotato-publish` does. It must never rewrite, "improve," or grade a caption; if a caption reads weak, that's Celeste/Stella/Luna's job, not this connector's.
- The `.blotato-connector-status.md` file lives inside `12 Work In Progress/` (not a Notion database, unlike `warm-leads-crm-sync` — no Notion database exists for this connector, and creating one is out of scope; a plain status file is sufficient for a single-person daily check).

## Edge cases

**E1.** `approved/` is empty (the actual state as of this build). The connector runs, finds 0 eligible items, writes a clean "0 items, nothing to do" status line, and does not error. Verified directly during this build — see the "what was actually tested" note in the build report.

**E2.** An item has `platforms: [instagram]` but no `media`. Skipped, logged as "instagram requires media, none provided" — never scheduled with a guessed or missing media URL, matching Instagram's own hard requirement (already documented in `blotato-publish`).

**E3.** An item has `preflight_passed: false` or the field is missing entirely. Skipped every time, logged as "not preflighted" — this connector does not re-run preflight itself and does not schedule anything that hasn't explicitly passed it.

**E4.** Two eligible items land on the same day with overlapping platform lists (e.g. two Instagram-only items on the same day). The cadence assignment (R5) pushes the second one to the next open Instagram-only day rather than double-booking a day, keeping the FIFO order by filename date.

**E5.** An item specifies an explicit `scheduled_time` in the past (someone typo'd a date, or the item sat in `approved/` long enough that the date passed). The connector does not schedule it for a past time (Blotato itself would reject this) — it's logged as "explicit scheduled_time has passed, needs a new time" rather than silently reinterpreting it.

**E6.** `blotato_list_accounts` returns an account that doesn't match a platform requested on an item (e.g. an item asks for `youtube` but the connected YouTube account requires a `title` under 100 characters and the item's caption is longer, or a Pinterest item is missing a `boardId`). Logged as a per-item, per-platform skip with the specific missing/invalid field — never silently dropped, never guessed.

## Definition of done

**D1.** The scheduled task exists at `~/.claude/scheduled-tasks/blotato-schedule-connector/SKILL.md`, runs daily, and its prompt explicitly and repeatedly forbids calling any Blotato write tool.

**D2.** Run against the real (currently empty) `approved/` folder produces a clean, non-erroring "0 eligible items" result and a correctly written `.blotato-connector-status.md` — confirmed by actually running it once during this build, not assumed.

**D3.** The metadata contract (R3) is documented clearly enough that whoever eventually wires the six content skills to write into `approved/` (separate, out-of-scope work) can target it directly without re-deriving it.

**D4.** When real content eventually lands in `approved/` with a complete R3 frontmatter block, the connector's dry-run output names the exact item, platform(s), computed time, and caption in a form Juliette can approve or reject in one glance — this cannot be fully verified until real content exists to run it against, and is flagged as unverified-in-practice in the build report rather than claimed as tested.

**D5.** Live mode (R7's actual `blotato_create_post` call and the `approved/` → `shipped/` move) is explicitly NOT built, NOT enabled, and requires a separate, explicit future request from Juliette before any code path calling a Blotato write tool is added.
