(function(){
  var P='<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',S='<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';
  function t(s){s=Math.max(0,Math.floor(s||0));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');}
  var allAudio=[];
  document.querySelectorAll('.player').forEach(function(el){
    var a=new Audio(el.dataset.src);a.preload='metadata';allAudio.push(a);
    var pp=el.querySelector('.pp'),bar=el.querySelector('.bar'),fill=bar.querySelector('span'),cur=el.querySelector('.cur'),dur=el.querySelector('.dur');
    pp.innerHTML=P;
    pp.onclick=function(){if(a.paused){a.play();}else{a.pause();}};
    a.onplay=function(){allAudio.forEach(function(o){if(o!==a)o.pause();});pp.innerHTML=S;pp.setAttribute('aria-label','Pause');};
    a.onpause=a.onended=function(){pp.innerHTML=P;pp.setAttribute('aria-label','Play');};
    a.onloadedmetadata=function(){dur.textContent=t(a.duration);};
    a.ontimeupdate=function(){cur.textContent=t(a.currentTime);if(a.duration)fill.style.width=(a.currentTime/a.duration*100)+'%';};
    bar.onclick=function(e){var r=bar.getBoundingClientRect();if(a.duration)a.currentTime=(e.clientX-r.left)/r.width*a.duration;};
    el.querySelectorAll('.speeds button').forEach(function(b){b.onclick=function(){a.playbackRate=parseFloat(b.dataset.r);el.querySelectorAll('.speeds button').forEach(function(x){x.classList.toggle('on',x===b);x.setAttribute('aria-pressed',x===b);});};});
  });
})();
