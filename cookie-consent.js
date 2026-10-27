/* Feel Fully You cookie consent.
   The Meta Pixel only loads after the visitor taps Accept (UK PECR / GDPR).
   Choice is remembered in localStorage as ffy-consent = "yes" | "no".
   To show the banner again: localStorage.removeItem('ffy-consent'). */
(function () {
  var KEY = 'ffy-consent';
  var choice = null;
  try { choice = localStorage.getItem(KEY); } catch (e) {}
  if (choice === 'yes' || choice === 'no') return;

  function save(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  var css = '' +
    '#ffy-cc{position:fixed;left:16px;right:16px;bottom:16px;z-index:2147483000;' +
    'max-width:640px;margin:0 auto;background:#0d3535;color:#fefcfa;' +
    'font-family:Poppins,system-ui,sans-serif;font-size:15px;line-height:1.5;' +
    'border-radius:14px;padding:18px 20px;box-shadow:0 10px 30px rgba(6,26,26,.35);' +
    'display:flex;flex-wrap:wrap;align-items:center;gap:14px 18px;' +
    'margin-bottom:env(safe-area-inset-bottom,0)}' +
    '#ffy-cc p{margin:0;flex:1 1 260px}' +
    '#ffy-cc a{color:#fefcfa;text-decoration:underline}' +
    '#ffy-cc .ffy-cc-btns{display:flex;gap:10px;flex:0 0 auto}' +
    '#ffy-cc button{font:inherit;font-weight:600;cursor:pointer;border-radius:999px;' +
    'padding:10px 20px;min-height:44px;border:1.5px solid #a88538}' +
    '#ffy-cc .ffy-yes{background:#a88538;color:#fefcfa}' +
    '#ffy-cc .ffy-yes:hover{background:#8f7230;border-color:#8f7230}' +
    '#ffy-cc .ffy-no{background:transparent;color:#fefcfa;border-color:#fefcfa}' +
    '#ffy-cc .ffy-no:hover{background:rgba(254,252,250,.12)}' +
    '#ffy-cc button:focus-visible{outline:2px solid #fefcfa;outline-offset:2px}';

  function show() {
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    var box = document.createElement('div');
    box.id = 'ffy-cc';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Cookie choice');
    box.innerHTML =
      '<p>I use cookies to see which of my posts and ads bring you here. ' +
      'Are you happy with that? <a href="/privacy.html">Privacy</a></p>' +
      '<div class="ffy-cc-btns">' +
      '<button type="button" class="ffy-no">No thanks</button>' +
      '<button type="button" class="ffy-yes">Accept</button>' +
      '</div>';
    document.body.appendChild(box);

    box.querySelector('.ffy-yes').addEventListener('click', function () {
      save('yes');
      if (typeof window.ffyLoadPixel === 'function') window.ffyLoadPixel();
      box.remove();
    });
    box.querySelector('.ffy-no').addEventListener('click', function () {
      save('no');
      box.remove();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', show);
  } else {
    show();
  }
})();
