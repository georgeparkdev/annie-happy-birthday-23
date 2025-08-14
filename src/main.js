/* Lightweight console analytics */
(function(){
  const ns = '[bday23]';
  const log = (...args) => console.log(ns, ...args);
  const warn = (...args) => console.warn(ns, ...args);
  const error = (...args) => console.error(ns, ...args);

  // Public minimal API
  window.Tracker = {
    log, warn, error,
    event: (name, data={}) => log('event:', name, data),
    sectionView: (id) => log('section-view:', id),
    quizSelect: (qid, choice) => log('quiz-select:', { qid, choice }),
    complete: () => log('complete')
  };

  // IntersectionObserver for reveal + section view logging
  const supportsIO = 'IntersectionObserver' in window;
  const reduceMotion = (()=>{ try { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } })();

  // Element animation prep/trigger (one-time per section)
  function prepareSectionAnimations(sec){
    if(reduceMotion || !sec || sec.dataset.animPrepared === 'true') return;
    const addAnim = (el, cls, delayMs)=>{
      if(!el) return; el.classList.add(cls); el.style.setProperty('--d', `${Math.max(0, delayMs||0)}ms`);
    };
    let delay = 0;
    // Title
    const title = sec.querySelector('h1, h2');
    addAnim(title, 'anim-top', delay); delay += 60;
    // Paragraphs
    sec.querySelectorAll('p').forEach((p, i)=> addAnim(p, 'anim-bottom', delay + i*70));
    delay += 120;
    // Figure/media
    const fig = sec.querySelector('figure');
    addAnim(fig, 'anim-right', delay);
    delay += 90;
  // Skip animations for all buttons (options, CTA, Next, Reveal) to ensure visibility
  // const options = sec.querySelectorAll('.options .option');
  // options.forEach((opt, i)=> addAnim(opt, 'anim-left', delay + i*80));
  // sec.querySelectorAll('button.cta, .next-btn, #reveal-clue').forEach((b, i)=> addAnim(b, 'anim-pop', delay + i*80));
    sec.dataset.animPrepared = 'true';
  }
  function triggerSectionAnimations(sec){
    if(reduceMotion || !sec || sec.dataset.animPlayed === 'true') return;
    const els = sec.querySelectorAll('.anim-top, .anim-bottom, .anim-left, .anim-right, .anim-pop');
    const doEnter = ()=>{
      els.forEach(el=> el.classList.add('enter'));
      sec.dataset.animPlayed = 'true';
    };
    if(sec.id === 'hero'){
      // Enter immediately for the hero to avoid any flicker of hidden UI
      doEnter();
    } else {
      // next frame to ensure initial styles applied
      requestAnimationFrame(doEnter);
    }
  }
  if(supportsIO){
  const io = new IntersectionObserver((entries)=>{
      for(const entry of entries){
        if(entry.isIntersecting){
          entry.target.classList.add('in-view');
          const id = entry.target.getAttribute('id');
          if(id) window.Tracker.sectionView(id);
      // mark progress and dots
          try { setActiveNav(id); } catch(_){ }
          // one-time per-section element animations
          try { triggerSectionAnimations(entry.target); } catch(_){ }
          io.unobserve(entry.target);
        }
      }
    }, { threshold: 0.25 });

    document.querySelectorAll('section.chapter').forEach((sec)=>{
      sec.classList.add('reveal');
      // prepare element-level animations ahead of time to avoid FOUC
      try { prepareSectionAnimations(sec); } catch(_){ }
      io.observe(sec);
    });
    // Ensure hero animates immediately on load (without waiting for IO)
    requestAnimationFrame(()=>{
      const hero = document.getElementById('hero');
      if(hero){
        // Mark hero as in-view right away so section-level reveal doesn't hide it
        hero.classList.add('in-view');
        try { triggerSectionAnimations(hero); } catch(_) { /* noop */ }
      }
    });
  } else {
    log('IntersectionObserver not supported; skipping reveal');
  }

  // Expose animation helpers for other modules (quiz gating)
  try {
    window.__bd_prepareAnim = prepareSectionAnimations;
    window.__bd_triggerAnim = triggerSectionAnimations;
  } catch(_) { }

  // Prevent scrolling into locked sections
  // Reuse sectionIds from dotnav module if present; else define
    const sectionIds = ['hero','quiz1','quiz2','quiz3','finale'];
    try { window.__bd_sectionIds = sectionIds; } catch(_) { }
  const mainEl = document.getElementById('app');
  // Robust scroll helper that targets the main scroll container (fixes mobile nested scroller issues)
  function getOffsetTopWithin(el, container){
    let y = 0; let n = el;
    while(n && n !== container){ y += (n.offsetTop || 0); n = n.offsetParent; }
    return y;
  }
  function scrollToEl(el, behavior='smooth'){
    if(!el) return;
    const container = mainEl || document.getElementById('app');
    if(container){
      const top = getOffsetTopWithin(el, container);
      try { container.scrollTo({ top, behavior }); }
      catch { container.scrollTop = top; }
    } else {
      try { el.scrollIntoView({ behavior, block:'start' }); } catch { /* noop */ }
    }
  }
  try { window.__bd_scrollToEl = scrollToEl; } catch(_) { }
  function lastUnlockedIndex(){
    let idx = 0;
    for(let i=0;i<sectionIds.length;i++){
      const el = document.getElementById(sectionIds[i]);
      if(el && !el.hasAttribute('hidden')) idx = i; else break;
    }
    return idx;
  }
  function currentIndex(){
    const rects = sectionIds.map((id)=>{
      const el = document.getElementById(id);
      if(!el || el.hasAttribute('hidden')) return { id, el, score: Infinity };
      const r = el.getBoundingClientRect();
      return { id, el, score: Math.abs(r.top) };
    });
    let best = rects[0];
    for(const it of rects){ if(it.score < best.score) best = it; }
    return Math.max(0, sectionIds.indexOf(best.id));
  }
  function clampScrollIfLocked(direction){
    const lastIdx = lastUnlockedIndex();
    const curIdx = currentIndex();
    if(direction > 0 && curIdx >= lastIdx && lastIdx < sectionIds.length-1){
      const nextEl = document.getElementById(sectionIds[lastIdx+1]);
      if(nextEl && nextEl.hasAttribute('hidden')){
  const el = document.getElementById(sectionIds[lastIdx]);
  if(el){ scrollToEl(el, 'smooth'); }
        return true;
      }
    }
    return false;
  }
  if(mainEl){
    // Clamp scrollTop beyond last unlocked section continuously
    let clampRAF;
    function enforceScrollClamp(){
      if(clampRAF) return;
      clampRAF = requestAnimationFrame(()=>{
        clampRAF = undefined;
        const lastIdx = lastUnlockedIndex();
        const lastEl = document.getElementById(sectionIds[lastIdx]);
        if(lastEl && mainEl.scrollTop > lastEl.offsetTop + 2){
          mainEl.scrollTo({ top: lastEl.offsetTop, behavior: 'auto' });
        }
      });
    }
    mainEl.addEventListener('scroll', enforceScrollClamp, { passive:true });

    // Wheel
    mainEl.addEventListener('wheel', (e)=>{
      if(clampScrollIfLocked(e.deltaY)){
        e.preventDefault();
      }
    }, { passive: false });
    // Keys
    document.addEventListener('keydown', (e)=>{
      if(e.defaultPrevented) return;
      const keysDown = ['PageDown','ArrowDown',' '];
      const keysUp = ['PageUp','ArrowUp'];
      if(keysDown.includes(e.key)){
        if(clampScrollIfLocked(1)){ e.preventDefault(); }
      } else if(keysUp.includes(e.key)){
        // always allow scrolling up
      }
    });
    // Touch (basic)
    let touchStartY = 0;
    mainEl.addEventListener('touchstart', (e)=>{ if(e.touches && e.touches[0]) touchStartY = e.touches[0].clientY; }, { passive:true });
    mainEl.addEventListener('touchmove', (e)=>{
      const y = e.touches && e.touches[0] ? e.touches[0].clientY : touchStartY;
      const dir = (touchStartY - y) > 0 ? 1 : -1; // down swipe => dir 1
      if(dir > 0 && clampScrollIfLocked(1)){
        e.preventDefault();
      }
    }, { passive:false });
  }

  // Dotnav only
  const dots = Array.from(document.querySelectorAll('.dotnav .dot'));
  // use shared sectionIds
  function setActiveNav(id){
    const idx = sectionIds.indexOf(id);
    if(idx === -1) return;
    dots.forEach((d,i)=>{ d.classList.toggle('active', i===idx); });
  }
  function scrollToTarget(sel){ const el = document.querySelector(sel); if(el){ scrollToEl(el, 'smooth'); } }
  dots.forEach(d=> d.addEventListener('click', (e)=>{
    // guard: don't allow jumping to locked/hidden sections
    if(d.disabled || d.getAttribute('aria-disabled') === 'true'){ e.preventDefault(); return; }
    scrollToTarget(d.getAttribute('data-target'))
  }));

  // Continuous observer for active section tracking
  if('IntersectionObserver' in window){
    const sections = sectionIds.map(id=> document.getElementById(id)).filter(Boolean);
    const navObserver = new IntersectionObserver((entries)=>{
      let top = entries.filter(e=> e.isIntersecting).sort((a,b)=> b.intersectionRatio - a.intersectionRatio)[0];
      if(top && top.target && top.target.id){ setActiveNav(top.target.id); }
    }, { root: null, threshold: [0.25, 0.6, 0.9] });
    sections.forEach(sec=> navObserver.observe(sec));
  }
})();

// Quiz mechanics (M5)
(function(){
  const live = document.getElementById('live-region');
  const say = (msg)=> { if(live){ live.textContent = msg; } };

  function handleSelect(ev){
    const btn = ev.currentTarget;
    const qid = btn.getAttribute('data-qid');
    const isCorrect = btn.hasAttribute('data-correct');
    const group = Array.from(document.querySelectorAll(`.option[data-qid="${qid}"]`));
    group.forEach(b=>{
      b.removeAttribute('aria-pressed');
      b.classList.remove('correct','incorrect');
    });
    btn.setAttribute('aria-pressed','true');
    btn.classList.add(isCorrect? 'correct':'incorrect');
    window.Tracker && window.Tracker.quizSelect(qid, btn.getAttribute('data-value'));

    if(isCorrect){
      say('✔ Правильно! Поехали дальше.');
      const currentSection = btn.closest('section');
      let nextId;
      // Prefer explicit next button target if present
      const nextBtn = currentSection && currentSection.querySelector('.next-btn');
      if(nextBtn){
        nextBtn.disabled = false;
        const nextSel = nextBtn.getAttribute('data-next');
        if(nextSel) nextId = nextSel.replace('#','');
      }
      // Fallback: infer next section from known order
      if(!nextId){
        const ids = (window.__bd_sectionIds || ['hero','quiz1','quiz2','quiz3','finale']);
        const curId = currentSection ? currentSection.id : '';
        const idx = ids.indexOf(curId);
        if(idx !== -1 && idx < ids.length-1){ nextId = ids[idx+1]; }
      }
      if(nextId){
        unlockSection(nextId);
        setTimeout(()=>{
          const el = document.getElementById(nextId);
          if(el){
            if(el.hasAttribute('hidden')) el.removeAttribute('hidden');
            try { if(window.__bd_prepareAnim) window.__bd_prepareAnim(el); } catch(_){ }
            try { if(window.__bd_triggerAnim) window.__bd_triggerAnim(el); } catch(_){ }
            try { (window.__bd_scrollToEl || scrollToEl)(el, 'smooth'); } catch { /* noop */ }
          }
        }, 600);
      }
    } else {
      say('❌ Мимо — давай ещё разок!');
    }
  }

  document.querySelectorAll('.option').forEach((b)=>{
    b.setAttribute('aria-pressed','false');
    b.addEventListener('click', handleSelect);
    b.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); b.click(); }
    });
  });

  // Next-section gating
  document.querySelectorAll('.next-btn').forEach((btn)=>{
    btn.addEventListener('click',()=>{
      const targetSel = btn.getAttribute('data-next');
      const el = targetSel ? document.querySelector(targetSel) : null;
      if(!el) return;
      // ensure target is revealed (remove hidden) before scroll
  if(el.hasAttribute('hidden')){ el.removeAttribute('hidden'); el.classList.add('just-revealed'); requestAnimationFrame(()=> el.classList.remove('just-revealed')); }
  try { (window.__bd_scrollToEl || scrollToEl)(el, 'smooth'); } catch { /* noop */ }
    });
  });

  // Gatekeeping utilities
  function unlockSection(id){
    const dotIdx = ['hero','quiz1','quiz2','quiz3','finale'].indexOf(id);
    const dot = document.querySelectorAll('.dotnav .dot')[dotIdx];
    if(dot){ dot.disabled = false; dot.removeAttribute('aria-disabled'); }
    const sec = document.getElementById(id);
    if(sec && sec.hasAttribute('hidden')){
      sec.removeAttribute('hidden');
    }
  }
  // Initial locks: quiz1..finale are hidden in HTML; dots are disabled in HTML
  // Unlock quiz1 only after hero start button clicked (handled below)
})();

// Gift clue reveal (M7 ties in finale; button exists in markup)
(function(){
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  function init(){
    const btn = document.getElementById('reveal-clue');
    const clue = document.getElementById('gift-clue');
    if(!btn || !clue) return;
    btn.addEventListener('click', ()=>{
      clue.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      btn.disabled = true;
      if (window.Tracker) {
        window.Tracker.event('gift-clue-revealed');
        window.Tracker.complete();
      }
      // Confetti trigger (M7)
      try { confettiBurst(); } catch(e) { /* noop */ }
    });
  }
})();

// Confetti (simple, performant cap) - M7
function confettiBurst(){
  // Respect reduced motion
  try {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return; // Skip confetti for motion-sensitive users
    }
  } catch(_){}
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden','true');
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '30';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  function resize(){
    canvas.width = Math.floor(window.innerWidth * DPR);
    canvas.height = Math.floor(window.innerHeight * DPR);
  }
  resize();

  // Config
  const DURATION = 10000; // ms (longer and livelier)
  const colors = ['#7C3AED','#F472B6','#38BDF8','#FDE68A','#0EA5E9','#22C55E'];
  const AREA = Math.max(1, window.innerWidth * window.innerHeight);
  // POWER boosts overall particle count; auto-tune a bit higher on larger viewports
  const POWER = Math.max(1.35, Math.min(2.0, AREA/420000));
  const BASE = Math.min(600, Math.floor((AREA/6500) * POWER)); // higher cap & density
  const GRAV = 0.12 * DPR;
  const DRAG = 0.996;
  const WIND = 0.0008 * DPR; // small side drift

  const parts = [];
  const timeouts = [];
  const intervals = [];
  let raf;
  const start = performance.now();
  // Responsive minimums and total cap (keeps phones lively but safe)
  const VW = window.innerWidth || 0; const VH = window.innerHeight || 0;
  const MIN_BURST = VW < 420 ? 80 : VW < 640 ? 110 : 140;
  const MIN_STREAM = VW < 420 ? 16 : VW < 640 ? 22 : 28;
  const MAX_PARTS = Math.min(1400, Math.floor(AREA / 600));
  const count = (scale)=> Math.max(Math.floor(BASE*scale), Math.floor(MIN_BURST*scale));

  // Helpers
  function rand(a,b){ return a + Math.random()*(b-a); }
  function pick(arr){ return arr[(Math.random()*arr.length)|0]; }
  function emit(x,y, countN, opts={}){
    const angle = opts.angle ?? -Math.PI/2; // up
    const spread = opts.spread ?? (Math.PI/2);
    const speed = opts.speed ?? (2.2*DPR);
    const sizeMin = opts.sizeMin ?? (2*DPR);
    const sizeMax = opts.sizeMax ?? (5.5*DPR);
    const types = opts.types || ['rect','circle','triangle','star','streamer','spark'];
    const decay = opts.decay ?? 0; // per-frame life decay (for sparks)
    let n = countN|0;
    // guard against runaway particle count
    if(parts.length >= MAX_PARTS) return;
    if(parts.length + n > MAX_PARTS){ n = Math.max(0, MAX_PARTS - parts.length); }
    for(let i=0;i<n;i++){
      const a = angle + rand(-spread/2, spread/2);
      const sp = rand(speed*0.7, speed*1.3);
      parts.push({
        x, y,
        vx: Math.cos(a)*sp + rand(-0.2,0.2)*DPR,
        vy: Math.sin(a)*sp + rand(-0.2,0.2)*DPR,
        rot: rand(0, Math.PI*2),
        vr: rand(-0.25, 0.25),
        size: rand(sizeMin, sizeMax),
        color: pick(colors),
        type: pick(types),
        life: 1, // base alpha factor
        decay,
        wiggle: Math.random()*Math.PI*2, // streamer wiggle phase
        tw: Math.random()*Math.PI*2 // sparkle twinkle phase
      });
    }
  }
  function drawStar(sz){
    const spikes = 5; const outer = sz; const inner = sz*0.45;
    ctx.beginPath();
    let rot = Math.PI/2 * 3; let x=0, y=0; const step = Math.PI / spikes;
    ctx.moveTo(0, -outer);
    for(let i=0;i<spikes;i++){
      x = Math.cos(rot) * outer; y = Math.sin(rot) * outer; ctx.lineTo(x,y); rot += step;
      x = Math.cos(rot) * inner; y = Math.sin(rot) * inner; ctx.lineTo(x,y); rot += step;
    }
    ctx.lineTo(0, -outer);
    ctx.closePath();
  }

  // Initial waves: center pop + side cannons + glitter shower
  const W = ()=>canvas.width, H = ()=>canvas.height;
  // 1) Top-center celebratory burst
  emit(W()/2, H()*0.25, count(0.85), { angle: Math.PI/2, spread: Math.PI*2, speed: 2.0*DPR, sizeMax: 6.5*DPR });
  // 2) Bottom-left and bottom-right cannons
  emit(W()*0.08, H()*0.95, count(0.85), { angle: -Math.PI/3, spread: Math.PI/6, speed: 4.4*DPR, sizeMax: 7.0*DPR, types:['rect','triangle','streamer'] });
  emit(W()*0.92, H()*0.95, count(0.85), { angle: -2*Math.PI/3, spread: Math.PI/6, speed: 4.4*DPR, sizeMax: 7.0*DPR, types:['rect','triangle','streamer'] });
  // 3) Schedule extra waves for "more confetti"
  timeouts.push(setTimeout(()=> emit(W()*0.5, H()*0.1, count(0.65), { angle: Math.PI/2, spread: Math.PI*2, speed: 1.9*DPR, types:['circle','star'] }), 420));
  timeouts.push(setTimeout(()=> emit(W()*0.2, H()*0.7, count(0.5), { angle: -Math.PI/2, spread: Math.PI/2, speed: 3.2*DPR }), 860));
  timeouts.push(setTimeout(()=> emit(W()*0.8, H()*0.7, count(0.5), { angle: -Math.PI/2, spread: Math.PI/2, speed: 3.2*DPR }), 1020));

  // 4) Steady side streams for extra fullness (about 4s)
  const streamEndAt = start + 4000;
  const streamInterval = setInterval(()=>{
    if(performance.now() > streamEndAt){ clearInterval(streamInterval); return; }
    emit(W()*0.12, H()*0.96, Math.max(MIN_STREAM, Math.floor(BASE*0.12)), { angle: -Math.PI/2.4, spread: Math.PI/10, speed: 3.6*DPR, sizeMin: 2*DPR, sizeMax: 6*DPR, types:['streamer','rect'] });
    emit(W()*0.88, H()*0.96, Math.max(MIN_STREAM, Math.floor(BASE*0.12)), { angle: -Math.PI*0.76, spread: Math.PI/10, speed: 3.6*DPR, sizeMin: 2*DPR, sizeMax: 6*DPR, types:['streamer','rect'] });
  }, 110);
  intervals.push(streamInterval);

  // 5) Top glitter stream (sparkles/light) ~4.5s
  const glitterEndAt = start + 4500;
  const glitterInterval = setInterval(()=>{
    if(performance.now() > glitterEndAt){ clearInterval(glitterInterval); return; }
    const c = Math.max(8, Math.floor(MIN_STREAM*0.7));
    emit(W()*0.5 + rand(-W()*0.2, W()*0.2), H()*0.02, c, { angle: Math.PI/2.2, spread: Math.PI/6, speed: 2.2*DPR, sizeMin: 1.5*DPR, sizeMax: 3.5*DPR, types:['spark'], decay: 0.02 });
  }, 80);
  intervals.push(glitterInterval);

  // 5) Repeating pulse bursts (every ~600–800ms), alternate positions
  let pulseIdx = 0;
  function schedulePulse(){
    const now = performance.now();
    if(now > start + 7200) return; // stop pulses a bit before the end
    const delay = 600 + Math.random()*220;
    const id = setTimeout(()=>{
      const pos = pulseIdx++ % 4;
      if(pos === 0){ emit(W()*0.15, H()*0.25, count(0.32), { angle: Math.PI/2, spread: Math.PI/1.2, speed: 2.2*DPR }); }
      else if(pos === 1){ emit(W()*0.85, H()*0.25, count(0.32), { angle: Math.PI/2, spread: Math.PI/1.2, speed: 2.2*DPR }); }
      else if(pos === 2){ emit(W()*0.25, H()*0.85, count(0.28), { angle: -Math.PI/2.2, spread: Math.PI/5, speed: 3.4*DPR, types:['rect','streamer'] }); }
      else { emit(W()*0.75, H()*0.85, count(0.28), { angle: -Math.PI/1.8, spread: Math.PI/5, speed: 3.4*DPR, types:['rect','streamer'] }); }
      schedulePulse();
    }, delay);
    timeouts.push(id);
  }
  schedulePulse();

  // 6) Random fireworks-style circular bursts across the screen
  const fwCount = 3 + Math.round(Math.random()*2); // 3–5 bursts
  for(let k=0;k<fwCount;k++){
    const delay = 600 + k*650 + Math.random()*400;
    const fx = () => rand(W()*0.2, W()*0.8);
    const fy = () => rand(H()*0.25, H()*0.6);
    timeouts.push(setTimeout(()=>{
      // bright star + spark mix
      emit(fx(), fy(), count(0.5), { angle: Math.PI/2, spread: Math.PI*2, speed: 4.6*DPR, sizeMin: 2*DPR, sizeMax: 6*DPR, types:['star','spark'], decay: 0.01 });
    }, delay));
  }

  function tick(now){
    const elapsed = now - start;
    const fade = elapsed > DURATION*0.8 ? 1 - (elapsed - DURATION*0.8)/(DURATION*0.2) : 1;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.save();
    for(let i=parts.length-1;i>=0;i--){
      const p = parts[i];
  // physics
      p.vx = p.vx * DRAG + WIND; // tiny wind
      p.vy = p.vy * DRAG + GRAV;
      p.x += p.vx; p.y += p.vy; p.rot += p.vr;
  if(p.decay){ p.life -= p.decay; if(p.life <= 0){ parts.splice(i,1); continue; } }
      // Cull if far off-screen
      if(p.y > canvas.height + 40*DPR || p.x < -40*DPR || p.x > canvas.width + 40*DPR){ parts.splice(i,1); continue; }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life * fade));
      ctx.fillStyle = p.color;
      switch(p.type){
        case 'circle':
          ctx.beginPath(); ctx.arc(0,0, p.size*0.5, 0, Math.PI*2); ctx.fill(); break;
        case 'triangle':
          ctx.beginPath(); ctx.moveTo(0, -p.size*0.6); ctx.lineTo(p.size*0.6, p.size*0.6); ctx.lineTo(-p.size*0.6, p.size*0.6); ctx.closePath(); ctx.fill(); break;
        case 'star':
          drawStar(p.size*0.6); ctx.fill(); break;
        case 'streamer':
          // Long thin ribbon with gentle wiggle
          p.wiggle += 0.2;
          const sway = Math.sin(p.wiggle) * (p.size*0.6);
          ctx.fillRect(-p.size*0.2, -p.size*1.6, p.size*0.4 + sway*0.02, p.size*2.2);
          break;
        case 'spark':
          // bright, twinkling point with additive blend
          const prevComp = ctx.globalCompositeOperation;
          ctx.globalCompositeOperation = 'lighter';
          p.tw += 0.4;
          const twAlpha = 0.6 + 0.4*Math.sin(p.tw);
          ctx.globalAlpha *= twAlpha;
          ctx.beginPath(); ctx.arc(0,0, p.size*0.45, 0, Math.PI*2); ctx.fill();
          ctx.globalCompositeOperation = prevComp;
          break;
        default:
          ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.6); break;
      }
      ctx.restore();
    }
    ctx.restore();
    if(elapsed < DURATION){ raf = requestAnimationFrame(tick); } else { cleanup(); }
  }
  function cleanup(){
    cancelAnimationFrame(raf);
    timeouts.forEach(id=> clearTimeout(id));
    intervals.forEach(id=> clearInterval(id));
    window.removeEventListener('resize', resize);
    canvas.remove();
  }
  window.addEventListener('resize', resize);
  raf = requestAnimationFrame(tick);
}

// Audio system (M6)
(function(){
  const tracks = [
    { src:'./audio/bts-boy-with-love.mp3', title:'Boy With Luv — BTS' },
    { src:'./audio/bts-dna.mp3',           title:'DNA — BTS' },
    { src:'./audio/bts-dynamite.mp3',      title:'Dynamite — BTS' }
  ];
  const finaleTrack = './audio/happy-birthday.mp3';
  let order = shuffle([...tracks]);
  let idx = 0;
  const audio = new Audio();
  audio.preload = 'metadata';
  audio.volume = 0.6;
  let userStarted = false;
  let isFinalePlaying = false;

  const btnPrev = document.getElementById('audio-prev');
  const btnPlay = document.getElementById('audio-play');
  const btnNext = document.getElementById('audio-next');
  const vol = document.getElementById('audio-volume');
  const panel = document.getElementById('audio-panel');
  const toggle = document.getElementById('audio-toggle');
  const titleEl = document.getElementById('audio-title');
  const coverEl = document.getElementById('audio-cover');

  function setSource(){ audio.src = order[idx].src; updateMeta(); }
  function play(){ audio.play().catch(()=>{}); btnPlay.textContent = '⏸'; btnPlay.setAttribute('aria-pressed','true'); }
  function pause(){ audio.pause(); btnPlay.textContent = '▶️'; btnPlay.setAttribute('aria-pressed','false'); }
  function next(){ idx = (idx+1) % order.length; setSource(); play(); }
  function prev(){ idx = (idx-1+order.length) % order.length; setSource(); play(); }
  function updateMeta(){ if(titleEl){ titleEl.textContent = order[idx].title || '—'; } if(coverEl){ /* rotate playful cover variants */ const n = (idx % 3) + 5; coverEl.src = `./img/bt21/icons8-bt21-100-${n}.png`; } }

  setSource();
  audio.addEventListener('ended', ()=>{ if(!isFinalePlaying){ next(); } });

  // Controls
  btnPlay && btnPlay.addEventListener('click', ()=>{
    if(!userStarted){ userStarted = true; setSource(); }
    if(audio.paused){ play(); } else { pause(); }
  });
  btnNext && btnNext.addEventListener('click', ()=>{ if(!userStarted){ userStarted = true; } next(); });
  btnPrev && btnPrev.addEventListener('click', ()=>{ if(!userStarted){ userStarted = true; } prev(); });
  vol && vol.addEventListener('input', ()=>{ audio.volume = Number(vol.value); });

  // Toggle audio panel bottom-right
  // Declare hide timer before any calls that reference it
  let hideTimer;
  function setPanel(open){
    if(!panel || !toggle) return;
    if(open){ panel.classList.add('open'); toggle.setAttribute('aria-expanded','true'); toggle.textContent = '▼';
      window.Tracker && window.Tracker.event('audio-panel-open');
      scheduleAutoHide();
    } else { panel.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); toggle.textContent = '▲';
      window.Tracker && window.Tracker.event('audio-panel-close');
      clearAutoHide();
    }
  }
  setPanel(false);
  toggle && toggle.addEventListener('click', ()=>{
    const open = !(panel && panel.classList.contains('open'));
    setPanel(open);
  });

  // Auto-hide after inactivity
  function clearAutoHide(){ if(hideTimer){ clearTimeout(hideTimer); hideTimer = undefined; } }
  function scheduleAutoHide(){
    clearAutoHide();
    hideTimer = setTimeout(()=>{ setPanel(false); }, 8000);
  }
  function bump(){ if(panel && panel.classList.contains('open')) scheduleAutoHide(); }
  ['click','input','keydown','pointerdown'].forEach(evt=>{
    panel && panel.addEventListener(evt, bump, { passive:true });
  });
  panel && panel.addEventListener('mouseenter', clearAutoHide);
  panel && panel.addEventListener('mouseleave', scheduleAutoHide);

  // Finale integration: lower bg volume, play special, then resume
  const giftBtn = document.getElementById('reveal-clue');
  giftBtn && giftBtn.addEventListener('click', ()=>{
    if(isFinalePlaying) return;
    isFinalePlaying = true;
    const prevVol = audio.volume;
    const targetVol = Math.max(0.3, Math.min(0.4, prevVol));
    fadeVolume(audio, targetVol, 500);
    const special = new Audio(finaleTrack);
    special.volume = 1.0;
    special.play().catch(()=>{});
    special.addEventListener('ended', ()=>{
      fadeVolume(audio, prevVol, 600);
      isFinalePlaying = false;
    });
  });

  function shuffle(arr){
    for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; }
    return arr;
  }
  function fadeVolume(aud, to, ms){
    const from = aud.volume; const steps = 12; const dt = ms/steps; let s=0;
    const id = setInterval(()=>{ s++; aud.volume = from + (to-from)*(s/steps); if(s>=steps){ clearInterval(id); aud.volume = to; } }, dt);
  }
})();

// Hero CTA: start audio and scroll to first quiz
(function(){
  const btn = document.getElementById('hero-start');
  if(!btn) return;
  btn.addEventListener('click', ()=>{
    // Try to start background audio via the existing system
    try {
      const playBtn = document.getElementById('audio-play');
      if(playBtn){ playBtn.click(); }
    } catch { /* noop */ }
    window.Tracker && window.Tracker.event('hero-start');
    const targetSel = btn.getAttribute('data-next');
    const el = targetSel ? document.querySelector(targetSel) : null;
    // Unlock quiz1 now and enable its dot
    try {
      const dotQ1 = document.querySelector('.dotnav .dot[data-target="#quiz1"]');
      if(dotQ1){ dotQ1.disabled = false; dotQ1.removeAttribute('aria-disabled'); }
      if(el && el.hasAttribute('hidden')) el.removeAttribute('hidden');
    } catch(_){ }
  if(el){ try { (window.__bd_scrollToEl || scrollToEl)(el, 'smooth'); } catch { /* noop */ } }
  });
})();

// Gallery (figure-based) + Lightbox
(function(){
  const lb = document.getElementById('lightbox');
  if(!lb) return;
  const img = lb.querySelector('.lightbox-img');
  const btnClose = lb.querySelector('.lightbox-close');
  const btnPrev = lb.querySelector('.lightbox-prev');
  const btnNext = lb.querySelector('.lightbox-next');
  let currentIndex = 0;
  let currentSet = [];

  function open(src, set){
    currentSet = set || [src];
    currentIndex = Math.max(0, currentSet.indexOf(src));
    img.src = currentSet[currentIndex];
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function close(){ lb.hidden = true; document.body.style.overflow = ''; }
  function show(i){ if(!currentSet.length) return; currentIndex = (i+currentSet.length)%currentSet.length; img.src = currentSet[currentIndex]; }

  btnClose && btnClose.addEventListener('click', close);
  btnPrev && btnPrev.addEventListener('click', ()=> show(currentIndex-1));
  btnNext && btnNext.addEventListener('click', ()=> show(currentIndex+1));
  lb.addEventListener('click', (e)=>{ if(e.target === lb) close(); });
  document.addEventListener('keydown', (e)=>{ if(lb.hidden) return; if(e.key==='Escape') close(); if(e.key==='ArrowLeft') show(currentIndex-1); if(e.key==='ArrowRight') show(currentIndex+1); });

  // Bind to figures with data-images
  document.querySelectorAll('figure[data-images]').forEach((fig)=>{
    const list = (fig.getAttribute('data-images')||'').split('|').filter(Boolean);
    const main = fig.querySelector('img');
    if(!main || !list.length) return;
    main.style.cursor = 'zoom-in';
    main.addEventListener('click', ()=> open(list[0], list));
  });
})();

// Toggle visibility of BT21 stickers only for hero and finale
(function(){
  const ids = ['hero','finale'];
  const sections = ids.map(id=> document.getElementById(id)).filter(Boolean);
  function updateVisibility(){
    const vh = window.innerHeight || document.documentElement.clientHeight;
    sections.forEach(sec=>{
      const r = sec.getBoundingClientRect();
      const visible = r.top < vh*0.6 && r.bottom > vh*0.4; // center band
      sec.classList.toggle('show-icons', visible);
    });
  }
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver(()=> updateVisibility(), { threshold:[0.3,0.5,0.7] });
    sections.forEach(s=> io.observe(s));
  }
  window.addEventListener('scroll', updateVisibility, { passive:true });
  window.addEventListener('resize', updateVisibility, { passive:true });
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', updateVisibility); else updateVisibility();
})();

// Enforce one-section-per-view feel on mobile/desktop by preventing peeking of next section
// Achieved via full-height sections + scroll-snap already; additionally, we can add
// a small gradient mask at bottom of sections via CSS (added in style.css).
