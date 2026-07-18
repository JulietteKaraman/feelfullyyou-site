(function(){
  "use strict";
  if (sessionStorage.getItem('trq_popup_seen')) return;

  var STYLE = "\n"
    + "#trq-pop-overlay{position:fixed;inset:0;background:rgba(6,26,26,.55);z-index:99998;display:none;align-items:center;justify-content:center;padding:20px}\n"
    + "#trq-pop-overlay.show{display:flex}\n"
    + "#trq-pop{position:relative;background:#fefcfa;border-radius:16px;max-width:380px;width:100%;padding:34px 30px 30px;text-align:center;box-shadow:0 30px 80px -20px rgba(0,0,0,.5);font-family:'Poppins',system-ui,sans-serif;opacity:0;transform:translateY(14px);transition:opacity .35s ease,transform .35s ease}\n"
    + "#trq-pop-overlay.show #trq-pop{opacity:1;transform:none}\n"
    + "#trq-pop-close{position:absolute;top:12px;right:14px;background:none;border:none;font-size:20px;line-height:1;color:#5d4a33;cursor:pointer;padding:4px}\n"
    + "#trq-pop .trq-eyebrow{font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#99680C;font-weight:600;margin:0 0 12px}\n"
    + "#trq-pop h3{font-family:'Poppins',system-ui,sans-serif;font-weight:700;font-size:1.5rem;color:#1c1714;margin:0 0 12px;line-height:1.15}\n"
    + "#trq-pop p{font-family:'Inter',system-ui,sans-serif;font-size:.95rem;color:#5d4a33;line-height:1.6;margin:0 0 22px}\n"
    + "#trq-pop a.trq-cta{display:inline-block;background:#0d3535;color:#fefcfa;text-decoration:none;font-weight:600;font-size:.98rem;padding:14px 30px;border-radius:8px;font-family:'Poppins',system-ui,sans-serif}\n"
    + "#trq-pop a.trq-cta:hover{background:#0a2a2a}\n"
    + "#trq-pop .trq-dismiss{display:block;margin:14px auto 0;background:none;border:none;color:#99680C;font-size:.8rem;text-decoration:underline;cursor:pointer;font-family:'Inter',system-ui,sans-serif}\n";

  var EXCLUDED = ['/touch-reset-quiz', '/touch-languages-quiz', '/links', '/404'];
  var path = window.location.pathname.replace(/\/$/, '').replace(/\.html$/, '');
  for (var i = 0; i < EXCLUDED.length; i++) {
    if (path === EXCLUDED[i] || path === '') { if (path === '') break; return; }
  }

  function build(){
    var styleEl = document.createElement('style');
    styleEl.textContent = STYLE;
    document.head.appendChild(styleEl);

    var overlay = document.createElement('div');
    overlay.id = 'trq-pop-overlay';
    overlay.innerHTML =
      '<div id="trq-pop" role="dialog" aria-label="The Touch Reset Quiz">'
      + '<button id="trq-pop-close" aria-label="Close">&times;</button>'
      + '<p class="trq-eyebrow">Free &middot; 5 minutes</p>'
      + '<h3>What&rsquo;s your Touch Stack?</h3>'
      + '<p>Intimacy doesn&rsquo;t come back through spontaneity. It comes back through structure. Meet the four-layer stack your body is already running.</p>'
      + '<a class="trq-cta" href="https://feelfullyyou.com/touch-reset-quiz">Take the Touch Reset Quiz</a>'
      + '<button class="trq-dismiss">No thanks</button>'
      + '</div>';
    document.body.appendChild(overlay);

    function close(){
      overlay.classList.remove('show');
      sessionStorage.setItem('trq_popup_seen', '1');
    }
    overlay.addEventListener('click', function(e){ if (e.target === overlay) close(); });
    overlay.querySelector('#trq-pop-close').addEventListener('click', close);
    overlay.querySelector('.trq-dismiss').addEventListener('click', close);
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape') close(); });

    overlay.classList.add('show');
    sessionStorage.setItem('trq_popup_seen', '1');
  }

  function armTriggers(){
    var fired = false;
    function fire(){ if (fired) return; fired = true; build(); }
    var t = setTimeout(fire, 12000);
    window.addEventListener('scroll', function onScroll(){
      var pct = (window.scrollY) / (document.body.scrollHeight - window.innerHeight);
      if (pct > 0.5) { clearTimeout(t); window.removeEventListener('scroll', onScroll); fire(); }
    }, { passive: true });
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    armTriggers();
  } else {
    document.addEventListener('DOMContentLoaded', armTriggers);
  }
})();
