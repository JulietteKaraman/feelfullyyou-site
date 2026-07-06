# Feel Fully You — Site Instructions for Claude

## START OF EVERY SESSION: Run the site health check

Before doing any other work, run this:

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
