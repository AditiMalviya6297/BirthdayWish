// Simple confetti and balloon spawner for static page
(function(){
  const container = document.getElementById('effects');
  const audio = document.getElementById('page-audio');
  if(!container) return;

  function makeConfetti(x){
    const el = document.createElement('div');
    el.className = 'confetti confetti--' + (1 + Math.floor(Math.random()*3));
    const size = 8 + Math.round(Math.random()*10);
    el.style.width = el.style.height = size + 'px';
    const left = (typeof x === 'number') ? x : (10 + Math.random() * Math.max(window.innerWidth-20, 40));
    el.style.left = left + 'px';
    el.style.top = (window.innerHeight + 10) + 'px';
    const duration = 5000 + Math.random()*4000;
    container.appendChild(el);
    requestAnimationFrame(()=>{
      el.style.transition = `transform ${duration}ms cubic-bezier(.2,.9,.1,1), opacity ${duration}ms linear`;
      el.style.transform = `translateY(-${window.innerHeight+60}px) translateX(${(Math.random()-0.5)*80}px) rotate(${(Math.random()*360)|0}deg)`;
      el.style.opacity = '0';
    });
    setTimeout(()=>el.remove(), duration + 200);
  }

  function makeBalloon(x){
    const el = document.createElement('div');
    el.className = 'balloon';
    const left = (typeof x === 'number') ? x : (10 + Math.random() * Math.max(window.innerWidth-40, 60));
    el.style.left = left + 'px';
    el.style.top = (window.innerHeight + 30) + 'px';
    const duration = 7000 + Math.random()*6000;
    container.appendChild(el);
    requestAnimationFrame(()=>{
      el.style.transition = `transform ${duration}ms cubic-bezier(.2,.9,.1,1), opacity ${duration}ms linear`;
      el.style.transform = `translateY(-${window.innerHeight+100}px) translateX(${(Math.random()-0.5)*60}px)`;
      el.style.opacity = '0.0';
    });
    setTimeout(()=>el.remove(), duration + 200);
  }

  let running = true;
  function tick(){
    if(!running) return;
    const r = Math.random();
    if(r < 0.6) makeConfetti();
    if(r < 0.18) makeBalloon();
    const next = 250 + Math.random()*600;
    setTimeout(tick, next);
  }

  // Start
  setTimeout(tick, 600);
  // Simple click-to-play audio control: clicking the card toggles music
  const card = document.querySelector('.card');
  if(card && audio){
    // only toggle audio when clicking the card background — ignore clicks on buttons or controls
    card.addEventListener('click', (e)=>{
      // if the click was on a button/interactive control or on candles, ignore
      if(e.target.closest('button') || e.target.closest('.candles') || e.target.closest('.pc-candle') || e.target.closest('#confetti-btn') || e.target.closest('.fab')) return;
      if(audio.paused) audio.play().catch(()=>{});
      else audio.pause();
    });
  }

  // confetti button (robust handlers for click/pointer/touch)
  const confBtn = document.getElementById('confetti-btn');
  if(confBtn){
    let lastConfetti = 0;
    const confettiHandler = (e)=>{
      try{ e.stopPropagation(); }catch(e){}
      const now = Date.now();
      if(now - lastConfetti < 450) return; // debounce duplicate pointer/click events
      lastConfetti = now;
      // quick visual feedback
      confBtn.classList.add('clicked');
      setTimeout(()=>confBtn.classList.remove('clicked'), 300);
      // emit confetti from both sides (left and right) for a symmetric sprinkle
      const leftOrigin = Math.round(window.innerWidth * 0.12);
      const rightOrigin = Math.round(window.innerWidth * 0.88);
      const bursts = 20;
      for(let i=0;i<bursts;i++){
        setTimeout(()=>{
          // alternate between left and right to create a sprinkle effect
          const origin = (i % 2 === 0) ? leftOrigin : rightOrigin;
          // small random horizontal spread away from the origin
          const x = origin + (Math.random()-0.5) * 200;
          makeConfetti(Math.max(8, Math.min(window.innerWidth-8, x)));
        }, i*30);
      }
      // a center burst as a finishing flourish
      setTimeout(()=>{
        for(let j=0;j<24;j++) setTimeout(()=>makeConfetti(window.innerWidth*0.5 + (Math.random()-0.5)*360), j*25);
      }, bursts*30 + 80);
    };

    confBtn.addEventListener('click', confettiHandler);
    confBtn.addEventListener('pointerdown', confettiHandler);
    confBtn.addEventListener('touchstart', confettiHandler, {passive:true});
    // keyboard activation
    confBtn.addEventListener('keydown', (e)=>{ if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); confettiHandler(e); } });
  }

  // music control button
  const musicBtn = document.getElementById('music-btn');
  const tooltip = document.getElementById('music-tooltip');
  const trackSelect = document.getElementById('track-select');
  const autoplayOverlay = document.getElementById('autoplay-overlay');
  const autoplayBtn = document.getElementById('autoplay-play');
  // prefer the Happy Birthday track in public/ for autoplay on page open
  const preferredAutoplaySrc = 'public/happy-birthday.mp3';
  try{
    if(trackSelect) trackSelect.value = preferredAutoplaySrc;
    if(preferredAutoplaySrc) audio.src = new URL(preferredAutoplaySrc, location.href).href;
  }catch(e){}

  // attempt autoplay on load; if blocked, show overlay prompting the user to enable audio
  async function tryAutoplay(){
    try{
      audio.muted = false;
      audio.volume = audio.volume || 0.9;
      const p = audio.play();
      if(p && p.then) await p;
      // success
      try{ musicBtn.classList.add('playing'); musicBtn.setAttribute('aria-pressed','true'); }catch(e){}
      if(autoplayOverlay) autoplayOverlay.style.display = 'none';
    }catch(err){
      console.warn('Autoplay blocked or failed:', err && err.message ? err.message : err);
      if(autoplayOverlay) autoplayOverlay.style.display = 'flex';
    }
  }

  // wire the big overlay play button to attempt playback and hide itself on success
  if(autoplayBtn){
    autoplayBtn.addEventListener('click', async (ev)=>{
      try{ ev.stopPropagation(); }catch(e){}
      try{
        audio.muted = false; audio.volume = 0.9; audio.load && audio.load();
        const p = audio.play();
        if(p && p.then) await p;
        if(autoplayOverlay) autoplayOverlay.style.display = 'none';
        try{ musicBtn.classList.add('playing'); musicBtn.setAttribute('aria-pressed','true'); }catch(e){}
      }catch(err){
        console.warn('User-initiated play failed:', err);
      }
    });
  }
  // kick off autoplay attempt when DOM is ready
  if(document.readyState === 'complete' || document.readyState === 'interactive') setTimeout(tryAutoplay, 200);
  else document.addEventListener('DOMContentLoaded', ()=>setTimeout(tryAutoplay, 200));
  if(musicBtn && audio){
    // if a track selector exists, ensure the audio src follows it and allow switching
    if(trackSelect){
      try{
        const init = trackSelect.value;
        if(init) audio.src = init;
      }catch(e){}
      trackSelect.addEventListener('change', async (ev)=>{
        const newSrc = trackSelect.value;
        const newLabel = trackSelect.selectedOptions && trackSelect.selectedOptions[0] ? trackSelect.selectedOptions[0].textContent : newSrc;
        if(!newSrc) return;
          const wasPlaying = !audio.paused && !audio.ended;
          // Resolve to an absolute URL to avoid relative-path quirks
          let resolved = newSrc;
          try{
            // If it's already an absolute URL or root-relative, keep as-is
            if(/^https?:\/\//i.test(newSrc) || newSrc.startsWith('/')){
              resolved = newSrc;
            } else {
              // strip a leading './' to avoid producing '/./' in resolved URL
              const cleaned = newSrc.replace(/^\.\//, '');
              resolved = new URL(cleaned, location.href).href;
            }
          }catch(e){ resolved = newSrc; }
          console.log('Switching to track', newSrc, '->', resolved);
          // quick HEAD check so we can give a helpful message if the file is missing
          try{
            const head = await fetch(resolved, { method: 'HEAD' });
            if(!head.ok){
              console.warn('Track not available (status ' + head.status + '):', resolved);
              if(tooltip){ tooltip.textContent = 'Track not found: ' + head.status; tooltip.style.display='block'; setTimeout(()=>{ tooltip.style.display='none'; tooltip.textContent = 'Play "Blue" by Yong Kai!'; }, 3200); }
              return;
            }
          }catch(err){
            console.warn('Network check failed for', resolved, err);
            if(tooltip){ tooltip.textContent = 'Unable to reach track'; tooltip.style.display='block'; setTimeout(()=>{ tooltip.style.display='none'; tooltip.textContent = 'Play "Blue" by Yong Kai!'; }, 3200); }
            return;
          }

          audio.src = resolved;
          try{ audio.load && audio.load(); }catch(e){}
        if(wasPlaying){
          try{
            const p = audio.play();
            if(p && p.then) await p;
            musicBtn.classList.add('playing');
            musicBtn.setAttribute('aria-pressed','true');
          }catch(err){
            console.warn('Switching track: play blocked', err);
            if(tooltip){ tooltip.textContent = 'Audio blocked — click to allow playback'; tooltip.style.display='block'; setTimeout(()=>{ tooltip.style.display='none'; tooltip.textContent = 'Play "Blue" by Yong Kai!'; }, 3200); }
          }
        } else {
          if(tooltip){ tooltip.textContent = 'Selected: ' + newLabel; tooltip.style.display='block'; setTimeout(()=>{ tooltip.style.display='none'; tooltip.textContent = 'Play "Blue" by Yong Kai!'; }, 1400); }
        }
      });
    }
    // defensive audio handling: ensure unmuted and try to play; show feedback if blocked
    // add error handler so if the file fails to load we inform the user
    audio.addEventListener('error', (ev)=>{
      console.warn('Audio element error', ev, 'code=' + (audio.error && audio.error.code));
      if(tooltip){ tooltip.textContent = 'Audio file failed to load'; tooltip.style.display = 'block'; setTimeout(()=>{ tooltip.style.display='none'; tooltip.textContent = 'Play "Blue" by Yong Kai!'; }, 3800); }
      musicBtn.classList.remove('playing');
      musicBtn.setAttribute('aria-pressed','false');
    });

    // helpful debug events
    audio.addEventListener('stalled', ()=>console.warn('Audio stalled'));
    audio.addEventListener('suspend', ()=>console.warn('Audio suspended'));
    audio.addEventListener('loadedmetadata', ()=>console.log('Audio metadata loaded:', audio.src, audio.duration));
    audio.addEventListener('canplay', ()=>console.log('Audio canplay:', audio.src));

    musicBtn.addEventListener('click', async (e)=>{
      try{ e.stopPropagation(); }catch(e){}
      audio.muted = false;
      audio.volume = audio.volume || 0.8;
      try{ audio.load && audio.load(); }catch(e){}

      if(audio.paused){
        try{
          const p = audio.play();
          if(p && p.then){
            await p;
          }
          musicBtn.classList.add('playing');
          musicBtn.setAttribute('aria-pressed','true');
          if(tooltip) tooltip.style.display='none';
        }catch(err){
          console.warn('Audio play blocked or failed:', err && err.message ? err.message : err);
          if(tooltip){ tooltip.textContent = 'Audio blocked — click to allow playback'; tooltip.style.display = 'block'; setTimeout(()=>{ tooltip.style.display='none'; tooltip.textContent = 'Play "Blue" by Yong Kai!'; }, 3200); }
        }
      } else {
        audio.pause();
        musicBtn.classList.remove('playing');
        musicBtn.setAttribute('aria-pressed','false');
        if(tooltip){ tooltip.textContent = 'Paused'; tooltip.style.display='block'; setTimeout(()=>{ tooltip.style.display='none'; tooltip.textContent = 'Play "Blue" by Yong Kai!'; }, 900); }
      }
    });
    musicBtn.addEventListener('keydown', (e)=>{ if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); musicBtn.click(); } });
  }

  // create decorative background confetti for a denser look (subtle slow rising pieces)
  function createBackgroundConfetti(count){
    for(let i=0;i<count;i++){
      const el = document.createElement('div');
      el.className = 'bg-confetti animate ' + (Math.random()<0.33? 'tiny': (Math.random()<0.6? 'small': '')) + (Math.random()<0.33? ' yellow': (Math.random()<0.66? ' blue': ' pink'));
      el.style.left = Math.random()*100 + '%';
      el.style.bottom = (-Math.random()*80) + 'px';
      const dur = 18000 + Math.random()*22000;
      el.style.animationDuration = dur + 'ms';
      el.style.opacity = 0.2 + Math.random()*0.6;
      container.appendChild(el);
      setTimeout(()=>{ try{ el.remove(); }catch(e){} }, dur + 1000);
    }
  }

  // populate a slow background confetti field and refresh periodically
  createBackgroundConfetti(36);
  setInterval(()=>createBackgroundConfetti(12), 7000);

  // add a left confetti bubble label (like the screenshot)
  function ensureConfettiBubble(){
    if(document.getElementById('confetti-bubble')) return;
    const b = document.createElement('div');
    b.id = 'confetti-bubble';
    b.className = 'confetti-bubble';
    b.innerHTML = '🎉 Click for confetti!';
    document.body.appendChild(b);
  }
  ensureConfettiBubble();
  
  /* --- Make-a-wish mini cake + candles --- */
  const miniCake = document.getElementById('mini-cake');
  const candlesRoot = document.getElementById('candles');
  if(miniCake && candlesRoot){
    const candles = Array.from(candlesRoot.querySelectorAll('.candle'));

    function blowCandle(candle){
      if(!candle) return;
      if(candle.dataset.blown === 'true') return;
      const flame = candle.querySelector('.flame');
      if(!flame) return;
      // animate puff
      let puff = document.createElement('span');
      puff.className = 'puff';
      candle.appendChild(puff);
      // trigger puff and hide flame
      requestAnimationFrame(()=>{
        flame.classList.add('blown');
        puff.classList.add('show');
      });
      candle.dataset.blown = 'true';
      // remove puff after animation
      setTimeout(()=>{ try{ puff.remove(); }catch(e){} }, 700);
    }

    // clicking the mini cake triggers sequential blowing of candles
    let blowing = false;
    miniCake.addEventListener('click', ()=>{
      if(blowing) return;
      blowing = true;
      let delay = 0;
      candles.forEach((c, i)=>{
        setTimeout(()=>{ blowCandle(c); if(i===candles.length-1) blowing=false }, delay);
        delay += 600;
      });
    });

    // clicking an individual candle blows it immediately
    candles.forEach(c => {
      c.addEventListener('click', (ev)=>{ ev.stopPropagation(); blowCandle(c); });
    });
  }

  // proper cake candle handling (bigger cake)
  const properCake = document.getElementById('proper-cake');
  const properCandlesRoot = document.getElementById('proper-candles');
  if(properCake && properCandlesRoot){
    const pcandles = Array.from(properCandlesRoot.querySelectorAll('.pc-candle'));

    function blowPCandle(candle){
      if(!candle) return;
      if(candle.dataset.blown === 'true') return;
      const flame = candle.querySelector('.pc-flame');
      if(!flame) return;
      const puff = document.createElement('span');
      puff.className = 'pc-puff';
      candle.appendChild(puff);
      requestAnimationFrame(()=>{ flame.classList.add('blown'); puff.classList.add('show'); });
      candle.dataset.blown = 'true';
      setTimeout(()=>{ try{ puff.remove(); }catch(e){} }, 800);
    }

    // sequential blow when clicking the cake image
    properCake.addEventListener('click', (ev)=>{
      ev.stopPropagation();
      let idx = 0;
      function next(){
        if(idx >= pcandles.length) return; 
        blowPCandle(pcandles[idx]);
        idx++;
        setTimeout(next, 500);
        if(idx === pcandles.length){
          // small confetti burst when finished
          setTimeout(()=>{
            for(let i=0;i<30;i++) setTimeout(()=>makeConfetti(window.innerWidth*0.5 + (Math.random()-0.5)*300), i*30);
          }, 300);
        }
      }
      next();
    });

    // clicking an individual candle blows it
    pcandles.forEach(c => {
      c.addEventListener('click', (ev)=>{ ev.stopPropagation(); blowPCandle(c); });
    });
  }

  // Make-a-wish button shows a blessing message
  const wishBtn = document.getElementById('wish-btn');
  const wishMsg = document.getElementById('wish-msg');
  if(wishBtn && wishMsg){
    wishBtn.addEventListener('click', (e)=>{
      try{ e.stopPropagation(); }catch(e){}
      const messages = [
        'May your day be filled with tiny joys and big hugs ❤️',
        'Wishing you gentle moments and sweet surprises today 🌸',
        'Happy wishes for quiet victories and warm memories 🎀'
      ];
      const txt = messages[Math.floor(Math.random()*messages.length)];
      wishMsg.textContent = txt;
      wishMsg.classList.add('show');
      // small confetti and cake puff
      for(let i=0;i<18;i++) setTimeout(()=>makeConfetti(window.innerWidth*0.5 + (Math.random()-0.5)*500), i*30);
      setTimeout(()=>{ wishMsg.classList.remove('show'); }, 4200);
    });
  }
})();