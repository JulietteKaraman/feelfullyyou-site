# Feel Fully You — Site Instructions for Claude

## START OF EVERY SESSION — do both of these before anything else, every time, regardless of how the session opened (task request, greeting, or otherwise)

### 1. Read the live Canon first

Before saying anything about current offers, prices, voice rules, or "what exists," fetch this page live via the Notion MCP — do not rely on memory or on what's written below in this file, and do not wait for a greeting to trigger it:

- **🔒 FFY CURRENT CANON — READ ONLY THIS**: `https://app.notion.com/p/3bfc7588d9ea81f39022e2a83ddb8aa8`

This is the single source of truth for current facts (offers, pricing, voice, CTA routing, banned words). If anything in this CLAUDE.md file (brand rules, etc.) conflicts with Canon, Canon wins — this file is a static local mirror and can drift.

If Canon references a piece of work (e.g. the Blotato posting pipeline, the content-system doc) that isn't reflected in this repo or in the local skill set, say so explicitly rather than guessing or assuming it's missing — check the linked Notion page before concluding anything is lost.

### 2. Run the site health check

```bash
bash /Users/julietteckaraman/Desktop/feelfullyyou-site/check-site.sh
```

Report any pages that are not returning 200. If all pages are OK, say so briefly and move on.

## NAV RULES — never break these

- Desktop nav: "Work With Me" is a clickable `<a href="/work-with-me">` + a separate chevron `<button>` that opens the dropdown. These are TWO separate elements inside `.more-wrap`.
- There must NEVER be a "Start here" button in the nav. It was removed. Do not re-add it.
- Mobile nav: "Work With Me" appears as a parent link (`font-weight:600;color:var(--gold-pale)`) above the indented sub-pages (For Her / For Him / For Both / The Room).
- When editing any page's nav, preserve both the desktop and mobile nav structures exactly.

## BRAND RULES

- Four colours only: Black #070707, Off-white #fefcfa, Deep Green #0D3535, Ochre #A88538
- No em dashes. No sentences starting with "And". No "Warmly, Juliette" in page copy.
- No pricing in content — prices on sales pages only.

## DEPLOY

- Edit files locally → `git add` → `git commit` → `git push origin main` → Netlify auto-deploys
- Site: https://feelfullyyou.com
- GitHub: JulietteKaraman/feelfullyyou-site
- Netlify site ID: ab67c11e-22f1-41e8-8ae1-70a107b35ed6
