# Ivorey Upload — feelfullyyou-site
## Handoff for Kiera

---

### What this is

A fully built static HTML website for feelfullyyou.com. All pages are complete and sitting in the folder on Juliette's Desktop: `feelfullyyou-site/`

Each file is a self-contained HTML page — it includes all its own CSS and images (images load from the Ivorey CDN so nothing needs uploading separately).

---

### What you need to do in Ivorey

**Step 1 — Create a page in Ivorey for each file below**

Set the slug exactly as shown in the right column:

| File | Ivorey slug |
|------|-------------|
| index.html | / (homepage) |
| for-her.html | /for-her |
| for-him.html | /for-him |
| for-both.html | /for-both |
| the-beginning.html | /the-beginning |
| the-unspoken-distance.html | /the-unspoken-distance |
| touch-point.html | /touch-point |
| mens-intensive.html | /mens-intensive |
| womens-six-week-intensive.html | /womens-six-week-intensive |
| when-she-goes-quiet.html | /when-she-goes-quiet |
| between-touches.html | /between-touches |
| 10-touch-rituals.html | /10-touch-rituals |

**Step 2 — Tell Juliette (or Claude) the slugs once set**

Before pasting the HTML, Juliette needs to send the final slugs back to Claude so the internal links across all files can be updated to full URLs (e.g. `https://feelfullyyou.com/for-her`). This takes 5 minutes and only needs to happen once.

**Step 3 — Paste the updated HTML into each page**

Once Claude has updated the links:
- Open the file in a text editor (TextEdit on Mac works fine — make sure it's in plain text mode)
- Select all (Cmd+A), copy
- In Ivorey, go to the page, add a Custom HTML block, paste everything in
- Save and preview

**Step 4 — Set index.html as the homepage**

Make sure the `/` slug page is set as the site homepage in Ivorey domain settings.

---

### What NOT to change

- Do not change any image URLs — they load directly from the Ivorey CDN and will break if edited
- Do not remove the `<style>` block at the top of each file — the design lives there
- Do not add any Ivorey header/footer templates to these pages — they are fully self-contained

---

### Questions?

Ask Juliette to loop in Claude for anything technical.

---

*Prepared by Claude · June 2026*
