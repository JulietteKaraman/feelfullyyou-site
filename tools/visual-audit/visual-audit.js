/*
 * visual-audit.js — headless render-and-check visual QA for feelfullyyou.com.
 *
 * Built 9 Aug 2026 because the daily site checker (ffy-site-check-6am) had
 * no way to catch a page that renders wrong: it can only read source HTML/
 * CSS and individual image FILES, never an actual assembled, rendered page.
 * That's exactly why the touch-hub.html footer color bug and the earlier
 * "What The Body Knows" black-box image bug both slipped through for weeks.
 *
 * This loads each URL in a REAL headless browser (Playwright/Chromium) and
 * inspects the RENDERED DOM via getComputedStyle/getBoundingClientRect —
 * the same technique as check-contrast.js one level up in this repo (which
 * Juliette runs by hand in DevTools), just automated and extended to more
 * bug classes:
 *   1. Footer brand color (must resolve to the site's ochre, #a88538)
 *   2. Broken images (naturalWidth 0 — failed to load)
 *   3. Unfilled image containers (an absolute/cover-fit image that doesn't
 *      actually fill its parent — the black-box bug's exact shape)
 *   4. Invisible-on-background buttons/CTAs (ported from check-contrast.js)
 *   5. Oversized image bands, measured on the LIVE rendered box, not grepped
 *      from source CSS (catches clamp()/vw values a static check can't
 *      resolve)
 *   6. Obvious text/content overflow
 *
 * This is a heuristic, objective-defect checker, not aesthetic judgment. It
 * will not catch "this photo doesn't feel right" or a bad crop — those stay
 * Juliette's call. Zero flags does not guarantee a page is perfect; a flag
 * means stop and look.
 *
 * Usage:
 *   node visual-audit.js <url1> [url2] ...
 *   node visual-audit.js --file urls.txt
 * Output: JSON array to stdout, one object per URL. On any issue, a
 * full-page screenshot is saved to ./screenshots/<slug>.png.
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function auditPage(browser, url) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  let loadError = null;
  try {
    // 'networkidle' is unreliable on pages with ongoing analytics/tracking
    // requests (GA4 etc. never fully go quiet) — 'load' plus a fixed settle
    // wait below is more robust across the whole site.
    await page.goto(url, { waitUntil: 'load', timeout: 20000 });
  } catch (e) {
    loadError = e.message;
  }
  if (loadError) {
    await page.close();
    return { url, ok: false, issues: [`PAGE FAILED TO LOAD: ${loadError}`], screenshot: null };
  }

  // Force scroll-reveal elements visible before auditing — established
  // pattern on this site (.reveal/.rin classes fade in on scroll; checking
  // them pre-reveal reads every one as a false "invisible element").
  await page.evaluate(() => {
    document.querySelectorAll('.reveal, .rin').forEach(el => el.classList.add('in'));
  }).catch(() => {});
  await page.waitForTimeout(800);

  const domIssues = await page.evaluate(() => {
    const out = [];

    function parseRGB(str) {
      const m = str.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const parts = m[1].split(',').map(s => parseFloat(s));
      return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
    }
    function effectiveBg(el) {
      let node = el;
      while (node && node !== document.documentElement) {
        const rgb = parseRGB(getComputedStyle(node).backgroundColor);
        if (rgb && rgb.a > 0.05) return rgb;
        node = node.parentElement;
      }
      return { r: 255, g: 255, b: 255, a: 1 };
    }
    function ownBg(el) {
      const rgb = parseRGB(getComputedStyle(el).backgroundColor);
      if (rgb && rgb.a > 0.05) return rgb;
      return null;
    }
    function dist(a, b) {
      const dr = a.r - b.r, dg = a.g - b.g, db = a.b - b.b;
      return Math.sqrt(dr * dr * 0.3 + dg * dg * 0.59 + db * db * 0.11);
    }

    // 1. FOOTER BRAND COLOR — the bug that started all of this, 9 Aug 2026.
    // Ochre (#a88538 = rgb(168,133,56)) is the one true footer color
    // sitewide, confirmed against shop.html/cards.html and now style.css.
    const footer = document.querySelector('footer');
    if (footer) {
      const bg = getComputedStyle(footer).backgroundColor;
      const rgb = parseRGB(bg);
      const isOchre = rgb && Math.abs(rgb.r - 168) < 12 && Math.abs(rgb.g - 133) < 12 && Math.abs(rgb.b - 56) < 12;
      if (!isOchre) {
        out.push(`FOOTER COLOR: expected ochre rgb(168,133,56), found ${bg}`);
      }
    }
    // No <footer> at all is not flagged here — some page types legitimately
    // don't have one (redirect stubs, etc.); FINDABILITY/LINKS categories
    // in the daily checker cover page-level completeness.

    // 2. BROKEN IMAGES
    document.querySelectorAll('img').forEach(img => {
      const rect = img.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return; // not laid out / hidden
      if (img.complete && img.naturalWidth === 0) {
        out.push(`BROKEN IMAGE: src="${img.getAttribute('src')}" failed to load (0x0 natural size)`);
      }
    });

    // 3. UNFILLED IMAGE CONTAINERS — the "black box" bug's exact shape: an
    // image meant to fill its parent (absolute + cover/contain, or 100%x100%)
    // that doesn't actually reach the parent's edges, leaving the parent's
    // own background color showing as a box around/behind it.
    document.querySelectorAll('img, picture').forEach(el => {
      const cs = getComputedStyle(el);
      const fillIntent =
        (cs.position === 'absolute' && (cs.objectFit === 'cover' || cs.objectFit === 'contain')) ||
        (cs.width === '100%' && cs.height === '100%');
      if (!fillIntent) return;
      const rect = el.getBoundingClientRect();
      const parent = el.parentElement;
      if (!parent) return;
      const prect = parent.getBoundingClientRect();
      if (prect.width < 4 || prect.height < 4) return;
      const wRatio = rect.width / prect.width;
      const hRatio = rect.height / prect.height;
      if (wRatio < 0.9 || hRatio < 0.9) {
        out.push(`UNFILLED IMAGE CONTAINER: <${el.tagName.toLowerCase()} src="${el.getAttribute('src') || ''}"> is only ${Math.round(wRatio * 100)}%x${Math.round(hRatio * 100)}% of its parent box`);
      }
    });

    // 4. INVISIBLE-ON-BACKGROUND ELEMENTS (ported from check-contrast.js)
    const SELECTOR = 'a.btn, button, [class*="btn"], [class*="cta"], .opt, .aud, .trow, .pitch, .deck-card, .rband';
    document.querySelectorAll(SELECTOR).forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width < 4 || rect.height < 4) return;
      const mine = ownBg(el);
      if (!mine) return;
      const parentEl = el.parentElement;
      if (!parentEl) return;
      const behind = effectiveBg(parentEl);
      const d = dist(mine, behind);
      if (d >= 18) return;
      // A visible border is a legitimate, common way to keep a light-on-
      // light (or dark-on-dark) card distinguishable even when its fill is
      // close to the page background — don't flag those. Only flag when
      // there's ALSO no border doing that job, which is the actual "this
      // has genuinely vanished" case.
      const style = getComputedStyle(el);
      const borderWidth = Math.max(
        parseFloat(style.borderTopWidth) || 0,
        parseFloat(style.borderLeftWidth) || 0
      );
      const borderColor = parseRGB(style.borderTopColor);
      const hasVisibleBorder = borderWidth >= 1 && borderColor && borderColor.a > 0.15 && dist(borderColor, mine) > 10;
      if (hasVisibleBorder) return;
      const cls = el.className ? '.' + String(el.className).slice(0, 40).replace(/\s+/g, '.') : '';
      out.push(`INVISIBLE ELEMENT: [${el.tagName.toLowerCase()}${cls}] "${(el.textContent || '').trim().slice(0, 40)}" is basically the same color as its background (distance ${Math.round(d)}), and has no border to distinguish it`);
    });

    // 5. OVERSIZED IMAGE BANDS — measured on the LIVE rendered box, catches
    // clamp()/vw values a static grep can't resolve. Deliberately scoped to
    // elements whose class name says "band" — the exact named bug pattern
    // (Touch Reset Quiz result photobands rendering 440px tall). This is NOT
    // applied to hero sections or generic `.photo` content images, which are
    // legitimately large by design; an earlier version of this check flagged
    // every full-bleed hero as "oversized" and had to be narrowed.
    document.querySelectorAll('[class*="band" i]').forEach(el => {
      const cs = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      if (rect.height > 320) {
        const cls = el.className ? '.' + String(el.className).slice(0, 30).replace(/\s+/g, '.') : '';
        out.push(`OVERSIZED IMAGE BAND: <${el.tagName.toLowerCase()}${cls}> renders ${Math.round(rect.height)}px tall (over the 320px calibration bar from the original quiz photoband bug)`);
      }
    });

    // 6. TEXT/CONTENT OVERFLOW
    document.querySelectorAll('p, h1, h2, h3, .card, .btn').forEach(el => {
      const cs = getComputedStyle(el);
      if (cs.overflowX === 'auto' || cs.overflowX === 'scroll') return;
      if (el.scrollWidth > el.clientWidth + 20) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 10) {
          out.push(`TEXT OVERFLOW: <${el.tagName.toLowerCase()}> content ${el.scrollWidth}px wider than its ${el.clientWidth}px box: "${(el.textContent || '').trim().slice(0, 40)}"`);
        }
      }
    });

    return out;
  });

  const issues = domIssues;

  let screenshot = null;
  if (issues.length > 0) {
    try {
      const slug = (new URL(url)).pathname.replace(/\//g, '_').replace(/^_+|_+$/g, '') || 'home';
      const dir = path.join(__dirname, 'screenshots');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      screenshot = path.join(dir, `${slug}.png`);
      await page.screenshot({ path: screenshot, fullPage: true });
    } catch (e) {
      screenshot = null;
    }
  }

  await page.close();
  return { url, ok: issues.length === 0, issues, screenshot };
}

async function main() {
  const args = process.argv.slice(2);
  let urls = [];
  if (args[0] === '--file') {
    if (!args[1]) { console.error('Usage: node visual-audit.js --file urls.txt'); process.exit(1); }
    urls = fs.readFileSync(args[1], 'utf8').split('\n').map(s => s.trim()).filter(Boolean);
  } else {
    urls = args;
  }
  if (urls.length === 0) {
    console.error('Usage: node visual-audit.js <url1> [url2] ... OR node visual-audit.js --file urls.txt');
    process.exit(1);
  }

  const browser = await chromium.launch();
  const results = [];
  for (const url of urls) {
    try {
      const r = await auditPage(browser, url);
      results.push(r);
      process.stderr.write(`${r.ok ? 'OK  ' : 'FAIL'} ${url} (${r.issues.length} issue${r.issues.length === 1 ? '' : 's'})\n`);
    } catch (e) {
      results.push({ url, ok: false, issues: [`SCRIPT ERROR: ${e.message}`], screenshot: null });
      process.stderr.write(`ERR  ${url} — ${e.message}\n`);
    }
  }
  await browser.close();

  console.log(JSON.stringify(results, null, 2));
}

main();
