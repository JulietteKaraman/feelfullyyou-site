/*
 * check-contrast.js — catches "button/card the same colour as its own
 * background" bugs, the exact bug found and fixed four times on 3 Aug
 * 2026 (quiz results buttons, quiz layer cards, quiz pitch box, cards.html
 * promo button first draft). All four were CSS that was technically
 * correct in isolation but got cancelled or matched by a nearby rule, so
 * a button rendered the same colour as the section behind it: teal on
 * teal, green on green, black on black.
 *
 * This does NOT read source CSS. It reads the page's own live, cascaded,
 * rendered colours via getComputedStyle, the same way a visitor's eyeball
 * does. That means it catches the bug regardless of WHY it happened
 * (competing theme blocks, a stray override, wrong class), which a
 * source-code / regex check cannot do.
 *
 * HOW TO RUN IT
 *
 * Option A, Juliette, on any live page:
 *   1. Open the page in Chrome/Safari.
 *   2. Open DevTools console (Cmd+Option+J in Chrome, Cmd+Option+C in Safari
 *      after enabling the Develop menu).
 *   3. Paste this whole file in and hit enter.
 *   4. Read the report. Anything printed under "FLAGGED" is a real
 *      contrast problem to go fix.
 *
 * Option B, Claude, from the Browser pane on any local or live page:
 *   const res = await fetch('/check-contrast.js'); const code = await res.text();
 *   (0,eval)(code);
 *   This must be run AFTER the page's fade-in reveals are visible (force
 *   .reveal/.rin elements to their 'in' state first if the page uses that
 *   pattern), otherwise everything still mid-animation reads as
 *   transparent/mismatched by coincidence, not by bug.
 *
 * MANDATORY: run this on any page after touching button, card, badge, or
 * CTA colour/background CSS, before pushing. Zero flags does not
 * guarantee the page is perfect (it only checks contrast, not layout,
 * copy, or images), but a flag here means stop and look before shipping.
 */
(function () {
  "use strict";

  function parseRGB(str) {
    var m = str.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    var parts = m[1].split(",").map(function (s) { return parseFloat(s); });
    return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
  }

  // Walk up from an element to find the nearest ancestor with a real,
  // non-transparent background colour, the way a browser actually paints.
  function effectiveBg(el) {
    var node = el;
    while (node && node !== document.documentElement) {
      var bg = getComputedStyle(node).backgroundColor;
      var rgb = parseRGB(bg);
      if (rgb && rgb.a > 0.05) return rgb;
      node = node.parentElement;
    }
    return { r: 255, g: 255, b: 255, a: 1 }; // fell through to page white
  }

  function ownBg(el) {
    var rgb = parseRGB(getComputedStyle(el).backgroundColor);
    if (rgb && rgb.a > 0.05) return rgb;
    return null; // transparent element, e.g. a text-only link, not a filled button
  }

  function dist(a, b) {
    // Simple perceptual-ish distance, good enough to flag "basically the
    // same colour", not trying to be a full WCAG contrast calculator.
    var dr = a.r - b.r, dg = a.g - b.g, db = a.b - b.b;
    return Math.sqrt(dr * dr * 0.3 + dg * dg * 0.59 + db * db * 0.11);
  }

  var SELECTOR = 'a.btn, button, [class*="btn"], [class*="cta"], .opt, .aud, .trow, .pitch, .deck-card, .rband';
  var candidates = document.querySelectorAll(SELECTOR);
  var flagged = [];
  var checked = 0;

  candidates.forEach(function (el) {
    var rect = el.getBoundingClientRect();
    if (rect.width < 4 || rect.height < 4) return; // hidden or not laid out
    var mine = ownBg(el);
    if (!mine) return; // no fill of its own, nothing to compare
    var parentEl = el.parentElement;
    if (!parentEl) return;
    var behind = effectiveBg(parentEl);
    checked++;
    var d = dist(mine, behind);
    if (d < 18) {
      flagged.push({
        el: el,
        tag: el.tagName,
        cls: (el.className + "").toString().slice(0, 60),
        text: (el.textContent || "").trim().slice(0, 50),
        mine: "rgb(" + Math.round(mine.r) + "," + Math.round(mine.g) + "," + Math.round(mine.b) + ")",
        behind: "rgb(" + Math.round(behind.r) + "," + Math.round(behind.g) + "," + Math.round(behind.b) + ")",
        distance: Math.round(d)
      });
    }
  });

  console.log("check-contrast.js: checked " + checked + " element(s), " + flagged.length + " flagged.");
  if (flagged.length === 0) {
    console.log("No same-colour-as-background elements found. Clean.");
  } else {
    console.log("=== FLAGGED (colour distance under 18, basically invisible) ===");
    flagged.forEach(function (f) {
      console.log(
        "[" + f.tag + (f.cls ? "." + f.cls.replace(/\s+/g, ".") : "") + "]",
        '"' + f.text + '"',
        "own=" + f.mine, "behind=" + f.behind, "distance=" + f.distance,
        f.el
      );
    });
  }

  window.__contrastReport = flagged;
  return flagged;
})();
