(function(){
  "use strict";
  var FORCE = /[?&]popup\b/.test(location.search);
  if (!FORCE && sessionStorage.getItem('trq_popup_seen')) return;

  var STYLE = ""
    + "#trq-pop-overlay{position:fixed;inset:0;background:rgba(7,7,7,.72);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);z-index:99998;display:none;align-items:center;justify-content:center;padding:18px;opacity:0;transition:opacity .5s ease}"
    + "#trq-pop-overlay.show{display:flex}#trq-pop-overlay.show.in{opacity:1}"
    + "#trq-pop{position:relative;background:#070707;color:#F6EFE0;border:1px solid rgba(221,201,142,.28);border-radius:20px;max-width:380px;width:100%;overflow:hidden;text-align:center;box-shadow:0 40px 90px -30px rgba(0,0,0,.9),0 0 80px -40px rgba(194,154,78,.5);font-family:'Poppins',system-ui,sans-serif;opacity:0;transform:translateY(18px) scale(.97);transition:opacity .6s cubic-bezier(.2,.8,.2,1),transform .6s cubic-bezier(.2,.8,.2,1)}"
    + "#trq-pop-overlay.show.in #trq-pop{opacity:1;transform:none}"
    + "#trq-pop-photo{position:relative;width:100%;height:250px;background:url('/touch-alex-behind.jpg') 48% 30%/cover no-repeat;filter:grayscale(1) brightness(.78) contrast(1.08)}"
    + "#trq-pop-photo:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(7,7,7,0) 45%,#070707 100%)}"
    + "#trq-pop-body{padding:4px 30px 30px;margin-top:-34px;position:relative}"
    + "#trq-pop-close{position:absolute;top:12px;right:12px;z-index:2;background:rgba(7,7,7,.45);border:1px solid rgba(221,201,142,.35);font-size:17px;line-height:1;color:#F6EFE0;cursor:pointer;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center}"
    + "#trq-pop .trq-eyebrow{font-size:10px;letter-spacing:.34em;text-transform:uppercase;color:#DDC98E;font-weight:300;margin:0 0 12px}"
    + "#trq-pop h3{font-family:'Poppins',system-ui,sans-serif;font-weight:200;font-size:2rem;color:#F6EFE0;margin:0 0 12px;line-height:1.12;letter-spacing:-.01em}"
    + "#trq-pop h3 em{font-style:italic;color:#DDC98E;font-weight:200}"
    + "#trq-pop p.trq-line{font-family:'Poppins',system-ui,sans-serif;font-weight:200;font-size:.95rem;color:rgba(246,239,224,.72);line-height:1.6;margin:0 0 24px}"
    + "#trq-pop a.trq-cta{display:inline-block;background:#DDC98E;color:#070707;text-decoration:none;font-weight:400;font-size:.72rem;letter-spacing:.3em;text-transform:uppercase;padding:14px 34px;border-radius:99px;font-family:'Poppins',system-ui,sans-serif;transition:background .25s,box-shadow .25s}"
    + "#trq-pop a.trq-cta:hover{background:#EEDE80;box-shadow:0 0 30px -6px rgba(238,222,128,.6)}"
    + "#trq-pop .trq-dismiss{display:block;margin:16px auto 0;background:none;border:none;color:rgba(246,239,224,.45);font-size:.62rem;letter-spacing:.26em;text-transform:uppercase;cursor:pointer;font-family:'Poppins',system-ui,sans-serif;font-weight:300}";

  var path = window.location.pathname.replace(/\/$/, '').replace(/\.html$/, '');
  if (!FORCE && path !== '' && path !== '/index') return;

  function T(n,o){try{if(typeof gtag==='function')gtag('event',n,o||{});}catch(e){}}
  function build(){
    var fl=document.createElement('link');fl.rel='stylesheet';fl.href='https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,200;0,300;0,400;1,200&display=swap';document.head.appendChild(fl);
    var styleEl = document.createElement('style');
    styleEl.textContent = STYLE;
    document.head.appendChild(styleEl);

    var overlay = document.createElement('div');
    overlay.id = 'trq-pop-overlay';
    overlay.innerHTML =
      '<div id="trq-pop" role="dialog" aria-label="The Touch Reset Quiz">'
      + '<button id="trq-pop-close" aria-label="Close">&times;</button>'
      + '<div id="trq-pop-photo"></div>'
      + '<div id="trq-pop-body">'
      + '<p class="trq-eyebrow">Free &middot; two minutes</p>'
      + '<h3>Where did<br><em>the touch go?</em></h3>'
      + '<p class="trq-line">Ten pictures. One dial. Your body answers.</p>'
      + '<a class="trq-cta" href="https://feelfullyyou.com/touch-reset-quiz">Take the quiz</a>'
      + '<button class="trq-dismiss">Not now</button>'
      + '</div>'
      + '</div>';
    document.body.appendChild(overlay);

    function close(){
      T('popup_close',{popup:'touch_reset_quiz'});
      overlay.classList.remove('in');
      sessionStorage.setItem('trq_popup_seen', '1');
      setTimeout(function(){ overlay.classList.remove('show'); }, 300);
    }
    overlay.addEventListener('click', function(e){ if (e.target === overlay) close(); });
    overlay.querySelector('#trq-pop-close').addEventListener('click', close);
    overlay.querySelector('.trq-dismiss').addEventListener('click', close);
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape') close(); });

    overlay.querySelector('.trq-cta').addEventListener('click',function(){T('popup_click',{popup:'touch_reset_quiz'});});
    T('popup_shown',{popup:'touch_reset_quiz'});
    overlay.classList.add('show');
    setTimeout(function(){ overlay.classList.add('in'); }, 20);
    sessionStorage.setItem('trq_popup_seen', '1');
  }

  function armTriggers(){
    var fired = false;
    function fire(){ if (fired) return; fired = true; build(); }
    var t = setTimeout(fire, FORCE ? 800 : 12000);
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
