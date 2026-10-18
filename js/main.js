/* ==========================================================================
   Canciones para ti — máquina de estados, animaciones y audio
   ========================================================================== */
(function () {
  'use strict';

  const C = window.CONFIG;
  const UI = C.ui;
  const gsap = window.gsap;

  const $ = (id) => document.getElementById(id);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = () => window.matchMedia('(max-width: 600px)').matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const fill = (str, extra = {}) =>
    String(str).replace(/\{(\w+)\}/g, (_, k) => (k in extra ? extra[k] : k === 'to' ? C.to : k === 'from' ? C.from : ''));
  const fmt = (sec) => {
    const s = Math.max(0, Math.floor(sec || 0));
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  };
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------- DOM ---------- */
  const body = document.body;
  const main = $('main'), room = $('room'), card = $('card');
  const eyebrow = $('eyebrow'), titleEl = $('title');
  const cassette = $('cassette'), cassetteImg = $('cassetteImg'), cassetteInside = $('cassetteInside'), reelL = $('reelL'), reelR = $('reelR');
  const tracklist = $('tracklist'), statusEl = $('status');
  const noteLabel = $('noteLabel'), noteBody = $('noteBody'), finishBtn = $('finish');
  const envelope = $('envelope'), envWrap = $('envWrap'), envFloat = $('envFloat');
  const envClosed = $('envClosed'), envOpen = $('envOpen'), tapOpen = $('tapOpen');
  const wallHost = $('wallHost');
  const panel = $('panel'), panelScroll = $('panelScroll');
  const letterCard = $('letterCard');
  const voiceEl = $('voice'), voiceBtn = $('voiceBtn'), wave = $('wave'), voiceTime = $('voiceTime');
  const bouquet = $('bouquet'), bouquetRise = $('bouquetRise'), bouquetImg = $('bouquetImg');
  const playerCover = $('playerCover'), playerTitle = $('playerTitle'), playerArtist = $('playerArtist');
  const seek = $('seek'), seekFill = $('seekFill'), playerTime = $('playerTime'), playerPlay = $('playerPlay');
  const videoEl = $('video');
  const heart = $('heart'), pill = $('pill');
  const help = $('help'), helpBtn = $('helpBtn'), helpBubble = $('helpBubble');
  const modal = $('modal'), modalOverlay = $('modalOverlay'), modalSheet = $('modalSheet');
  const modalClose = $('modalClose'), modalTitle = $('modalTitle'), modalBody = $('modalBody'), modalSign = $('modalSign');

  /* ==========================================================================
     MÁQUINA DE ESTADOS
     ========================================================================== */
  const TRANSITIONS = {
    LOADING:         ['ENVELOPE'],
    ENVELOPE:        ['BLOOMING'],
    BLOOMING:        ['FLOWER_WALL'],
    FLOWER_WALL:     ['MAIN'],
    MAIN:            ['PANEL_OPEN', 'FINISHING'],
    PANEL_OPEN:      ['MAIN', 'LETTER_MODAL'],
    LETTER_MODAL:    ['PANEL_OPEN'],
    FINISHING:       ['FLOWER_WALL_END'],
    FLOWER_WALL_END: ['MAIN'],
  };
  const state = { screen: 'LOADING' };
  const audio = { status: 'idle', trackIndex: 0 };

  function go(next) {
    const prev = state.screen;
    if (!TRANSITIONS[prev].includes(next)) return false;
    state.screen = next;
    render(prev);
    return true;
  }

  const ENTER = {
    ENVELOPE: enterEnvelope,
    BLOOMING: enterBlooming,
    FLOWER_WALL: enterFlowerWall,
    MAIN: enterMain,
    FINISHING: enterFinishing,
    FLOWER_WALL_END: enterFlowerWallEnd,
  };

  function render(prev) {
    body.dataset.screen = state.screen;
    renderMainAccess();
    renderFloating();
    renderPanel();
    renderModal();
    renderLyrics();
    const enter = ENTER[state.screen];
    if (enter) enter(prev);
  }

  function renderMainAccess() {
    const live = ['MAIN', 'PANEL_OPEN', 'LETTER_MODAL'].includes(state.screen);
    main.inert = !live;
    main.setAttribute('aria-hidden', String(!live));
  }

  /* Corazón y píldora */
  function setShown(el, on, seconds) {
    if (el._shown === on) return;
    el._shown = on;
    gsap.to(el, { autoAlpha: on ? 1 : 0, duration: seconds, ease: 'power1.out', overwrite: 'auto' });
  }
  function renderFloating() {
    const s = state.screen;
    const heartOn = s !== 'LOADING' && s !== 'ENVELOPE';
    const panelUp = s === 'PANEL_OPEN' || s === 'LETTER_MODAL';
    setShown(heart, heartOn, 0.3);
    setShown(pill, heartOn && !panelUp, panelUp ? 0.2 : 0.3);
    heart.setAttribute('aria-expanded', String(panelUp));
  }

  /* ==========================================================================
     ENVELOPE → BLOOMING
     ========================================================================== */
  let envTweens = [];

  function enterEnvelope() {
    gsap.to([envWrap, tapOpen], { opacity: 1, duration: 0.4, ease: 'power1.out' });
    if (!reduceMotion) {
      envTweens.push(gsap.to(envFloat, { y: -4, duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
      envTweens.push(gsap.fromTo(tapOpen, { opacity: 0.75 }, { opacity: 1, duration: 1.2, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 0.4 }));
    }
    // Tabulable para teclado, sin robar el foco (evita el anillo de foco al cargar con mouse o dedo)
    envelope.tabIndex = 0;
  }

  function enterBlooming() {
    unlockAudio();
    envTweens.forEach((t) => t.kill());
    envTweens = [];
    envelope.tabIndex = -1;
    envelope.setAttribute('aria-hidden', 'true');

    const r = envWrap.getBoundingClientRect();
    const wall = buildWall({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    const tl = gsap.timeline({ onComplete: () => go('FLOWER_WALL') });
    tl.to(tapOpen, { opacity: 0, duration: 0.2, ease: 'power2.out', overwrite: true }, 0);

    if (reduceMotion) {
      tl.set(envOpen, { opacity: 1 }, 0).set(envClosed, { opacity: 0 }, 0);
      tl.add(wall.tl, 0.35);
      return;
    }
    tl.to(envOpen, { opacity: 1, duration: 0.18, ease: 'power2.out' }, 0)
      .to(envClosed, { opacity: 0, duration: 0.18, ease: 'power2.out' }, 0)
      .to(envWrap, { scale: 1.06, duration: 0.09, ease: 'power2.out', yoyo: true, repeat: 1 }, 0)
      .to(envWrap, { opacity: 0, duration: 0.3, ease: 'power1.out' }, 0.35)
      .add(wall.tl, 0.35);
  }

  /* ==========================================================================
     MURO DE FLORES
     ========================================================================== */
  let wallEl = null, wallInner = null, wallTl = null, wallDrift = null;

  function flowerSrc(n) {
    return C.images.dir + C.images.flowers + String(n).padStart(2, '0') + IMG_EXT;
  }

  function buildWall(origin) {
    destroyWall();
    const W = window.innerWidth, H = window.innerHeight, mobile = isMobile();
    const rng = mulberry32(14);
    const reds = C.images.redFlowers;
    const pool = [];
    for (let n = 1; n <= C.images.flowerCount; n++) if (!reds.includes(n)) pool.push(n);
    const pickN = () => pool[Math.floor(rng() * pool.length)];

    const flowers = [];
    // Muro: retícula escalonada que desborda los bordes (sin huecos)
    const cols = mobile ? 3 : 8, rows = mobile ? 6 : 5;
    const cw = W / cols, ch = H / rows;
    const base = Math.max(cw, ch) * (mobile ? 1.9 : 1.8);
    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c <= cols; c++) {
        const isRed = (r * 3 + c * 2) % 7 === 3;
        flowers.push({
          x: (c + (r % 2 ? 0.5 : 0)) * cw + (rng() - 0.5) * cw * 0.5,
          y: r * ch + (rng() - 0.5) * ch * 0.5,
          n: isRed ? reds[(r + c) % reds.length] : pickN(),
          size: base,
          scale: 1 + rng() * 0.4,
          rot: (rng() * 2 - 1) * 25,
          op: rng() < 0.2 ? 0.92 : 1,
          z: 1 + Math.floor(rng() * 40),
          cluster: false,
        });
      }
    }
    // Racimo inicial (≈25vw), muy junto, encima de todo
    const nCluster = mobile ? 6 : 9;
    const cs = (mobile ? 0.24 : 0.1) * W;
    for (let i = 0; i < nCluster; i++) {
      const a = i === 0 ? 0 : (i / (nCluster - 1)) * Math.PI * 2 + rng() * 0.5;
      const d = i === 0 ? 0 : cs * (0.42 + rng() * 0.18);
      flowers.push({
        x: origin.x + Math.cos(a) * d,
        y: origin.y + Math.sin(a) * d,
        n: pickN(),
        size: cs,
        scale: 1 + rng() * 0.15,
        rot: (rng() * 2 - 1) * 25,
        op: 1,
        z: 60 + nCluster - i,
        cluster: true,
      });
    }

    const el = document.createElement('div');
    el.className = 'wall';
    // capa de color de respaldo: se anima su opacidad (barato) en vez de repintar el fondo del muro
    const bgEl = document.createElement('div');
    bgEl.className = 'wall__bg';
    el.appendChild(bgEl);
    const inner = document.createElement('div');
    inner.className = 'wall__inner';
    el.appendChild(inner);
    for (const f of flowers) {
      const img = new Image();
      img.className = 'flower';
      img.alt = '';
      img.decoding = 'async';
      img.draggable = false;
      img.src = flowerSrc(f.n);
      img.style.left = (f.x / W) * 100 + '%';
      img.style.top = (f.y / H) * 100 + '%';
      img.style.width = img.style.height = (f.size / W) * 100 + 'vw';
      img.style.zIndex = f.z;
      img.style.willChange = 'transform, opacity';
      inner.appendChild(img);
      f.el = img;
    }
    el.addEventListener('click', onWallTap);
    wallHost.appendChild(el);
    wallEl = el;
    wallInner = inner;

    const dist = (f) => Math.hypot(f.x - origin.x, f.y - origin.y);
    const clusterF = flowers.filter((f) => f.cluster);
    const rest = flowers.filter((f) => !f.cluster).sort((a, b) => dist(a) - dist(b));
    gsap.set(flowers.map((f) => f.el), { xPercent: -50, yPercent: -50, opacity: 0 });
    flowers.forEach((f) => gsap.set(f.el, { rotation: f.rot, scale: f.scale }));

    const tl = gsap.timeline({
      onComplete: () => flowers.forEach((f) => { f.el.style.willChange = 'auto'; }),
    });
    if (reduceMotion) {
      flowers.forEach((f) => gsap.set(f.el, { opacity: f.op }));
      gsap.set(bgEl, { opacity: 1 });
      tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power1.out' });
    } else {
      clusterF.forEach((f, i) => {
        tl.fromTo(f.el, { scale: 0.15 * f.scale, opacity: 0 }, { scale: f.scale, opacity: 1, duration: 0.42, ease: 'back.out(1.3)' }, i * 0.06);
      });
      const start = 0.95, span = 1.4;
      rest.forEach((f, i) => {
        tl.fromTo(f.el, { scale: 0.3 * f.scale, opacity: 0 }, { scale: f.scale, opacity: f.op, duration: 0.6, ease: 'power3.out' },
          start + (i / Math.max(1, rest.length - 1)) * span);
      });
      // Respaldo de color bajo los pétalos: garantiza cero huecos al final
      tl.fromTo(bgEl, { opacity: 0 }, { opacity: 1, duration: 1.6, ease: 'power1.in' }, start + 0.4);
    }
    wallTl = tl;
    return { el, tl };
  }

  function destroyWall(target = wallEl) {
    if (!target) return;
    gsap.killTweensOf(target);
    target.querySelectorAll('.flower').forEach((f) => gsap.killTweensOf(f));
    target.remove();
    if (target === wallEl) {
      if (wallDrift) wallDrift.kill();
      if (wallTl) wallTl.kill();
      wallEl = wallInner = wallTl = wallDrift = null;
    }
  }

  function startDrift() {
    if (reduceMotion || !wallInner) return;
    wallInner.style.willChange = 'transform';
    wallDrift = gsap.to(wallInner, { scale: 1.06, xPercent: -1.5, yPercent: -1.5, duration: 8, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  }

  function makeWallInteractive(label) {
    wallEl.setAttribute('role', 'button');
    wallEl.setAttribute('aria-label', label);
    wallEl.tabIndex = 0;
    wallEl.focus({ preventScroll: true });
  }

  function onWallTap() {
    if (state.screen === 'FLOWER_WALL' || state.screen === 'FLOWER_WALL_END') go('MAIN');
  }

  function enterFlowerWall() {
    envelope.hidden = true;
    startDrift();
    const tap = document.createElement('p');
    tap.className = 'tap tap--reveal';
    tap.setAttribute('aria-hidden', 'true');
    tap.textContent = UI.tapToReveal;
    wallEl.appendChild(tap);
    gsap.to(tap, { opacity: 1, duration: 0.5, delay: 0.6, ease: 'power1.out' });
    makeWallInteractive(UI.aria.wall);
  }

  /* ==========================================================================
     FLOWER_WALL → MAIN
     ========================================================================== */
  function enterMain(prev) {
    if (prev !== 'FLOWER_WALL' && prev !== 'FLOWER_WALL_END') return;
    // En el mismo gesto del usuario: cumple la política de autoplay
    if (prev === 'FLOWER_WALL_END') {
      if (audio.trackIndex !== 0) loadTrack(0);
      song.currentTime = 0;
    }
    play({ fadeIn: 1.5 });
    revealMain();
  }

  function revealMain() {
    const el = wallEl;
    if (!el) return;
    el.removeAttribute('role');
    el.removeAttribute('tabindex');
    el.style.pointerEvents = 'none';
    if (wallDrift) wallDrift.pause();
    const done = () => destroyWall(el);
    if (reduceMotion) {
      gsap.to(el, { opacity: 0, duration: 0.6, ease: 'power1.out', onComplete: done });
    } else {
      // en celulares y equipos modestos se omite el desenfoque (es lo más caro de pintar a pantalla completa)
      const lite = isMobile() || (navigator.hardwareConcurrency || 8) <= 4;
      const to = { opacity: 0, scale: 1.08, duration: 1.2, ease: 'power2.inOut', onComplete: done };
      if (!lite) to.filter = 'blur(6px)';
      gsap.to(el, to);
    }
    if (trackRows[0]) trackRows[0].btn.focus({ preventScroll: true });
  }

  /* ==========================================================================
     MAIN → FINISHING → FLOWER_WALL_END
     ========================================================================== */
  function enterFinishing() {
    if (!song.paused) fadeTo(0, 1.5, () => song.pause());
    const r = cassette.getBoundingClientRect();
    const H = window.innerHeight;
    const origin = {
      x: r.left + r.width / 2,
      y: Math.min(H * 0.85, Math.max(H * 0.15, r.top + r.height / 2)),
    };
    const wall = buildWall(origin);
    wall.tl.eventCallback('onComplete', () => {
      wall.el.querySelectorAll('.flower').forEach((f) => { f.style.willChange = 'auto'; });
      go('FLOWER_WALL_END');
    });
  }

  function enterFlowerWallEnd() {
    startDrift();
    const box = document.createElement('div');
    box.className = 'wall__finale';
    const l1 = document.createElement('p');
    l1.className = 'wall__finale-1';
    l1.textContent = C.from ? C.finale.line1 + ' ' + C.from : C.finale.line1;
    const l2 = document.createElement('p');
    l2.className = 'wall__finale-2';
    l2.textContent = C.finale.line2;
    box.append(l1, l2);
    wallEl.appendChild(box);
    gsap.to(box, { opacity: 1, duration: 0.5, delay: 0.6, ease: 'power1.out' });
    makeWallInteractive(UI.aria.wallEnd);
  }

  /* ==========================================================================
     PANEL "Hay más aquí"
     ========================================================================== */
  let panelOpen = false;

  function onMoreClick() {
    const s = state.screen;
    if (s === 'MAIN') go('PANEL_OPEN');
    else if (s === 'PANEL_OPEN') go('MAIN');
    else if (s === 'FLOWER_WALL' || s === 'FLOWER_WALL_END') {
      go('MAIN');
      go('PANEL_OPEN');
    }
  }

  function layoutBouquet() {
    const h = Math.max(280, panelScroll.clientHeight - bouquet.offsetTop);
    bouquet.style.height = h + 'px';
  }

  function animateBouquet() {
    gsap.killTweensOf([bouquetRise, bouquetImg]);
    gsap.set(bouquetImg, { rotation: 0, transformOrigin: '50% 100%' });
    if (reduceMotion) {
      gsap.set(bouquetRise, { y: 0 });
      gsap.fromTo(bouquetRise, { opacity: 0 }, { opacity: 1, duration: 0.4 });
      return;
    }
    gsap.set(bouquetRise, { opacity: 1 });
    gsap.fromTo(bouquetRise, { y: bouquet.clientHeight * 0.8 }, {
      y: 0, duration: 1.2, delay: 0.25, ease: 'power3.out',
      onComplete: () => {
        gsap.to(bouquetImg, {
          rotation: 1.5, duration: 1, ease: 'sine.inOut',
          onComplete: () => gsap.fromTo(bouquetImg, { rotation: 1.5 }, { rotation: -1.5, duration: 2, ease: 'sine.inOut', yoyo: true, repeat: -1 }),
        });
      },
    });
  }

  function renderPanel() {
    const want = state.screen === 'PANEL_OPEN' || state.screen === 'LETTER_MODAL';
    if (want === panelOpen) return;
    panelOpen = want;
    gsap.killTweensOf(panel);
    const mobile = isMobile();
    if (want) {
      panel.hidden = false;
      panelScroll.scrollTop = 0;
      layoutBouquet();
      if (mobile) {
        gsap.fromTo(panel, { yPercent: 100, y: 0, opacity: 1 }, { yPercent: 0, duration: reduceMotion ? 0 : 0.38, ease: 'power2.out' });
      } else {
        gsap.fromTo(panel, { opacity: 0, y: reduceMotion ? 0 : 16, yPercent: 0 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
      }
      animateBouquet();
      letterCard.focus({ preventScroll: true });
    } else {
      const done = () => {
        panel.hidden = true;
        gsap.killTweensOf([bouquetRise, bouquetImg]);
      };
      if (mobile && !reduceMotion) gsap.to(panel, { yPercent: 100, duration: 0.25, ease: 'power2.in', onComplete: done });
      else gsap.to(panel, { opacity: 0, duration: 0.25, ease: 'power1.out', onComplete: done });
      if (panel.contains(document.activeElement)) heart.focus({ preventScroll: true });
    }
  }

  /* Modal de la carta */
  let modalOpen = false;
  function renderModal() {
    const want = state.screen === 'LETTER_MODAL';
    if (want === modalOpen) return;
    modalOpen = want;
    gsap.killTweensOf([modal, modalSheet]);
    if (want) {
      modal.hidden = false;
      modalSheet.scrollTop = 0;
      gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power1.out' });
      gsap.fromTo(modalSheet, { scale: reduceMotion ? 1 : 0.98 }, { scale: 1, duration: 0.3, ease: 'power2.out' });
      modalClose.focus({ preventScroll: true });
    } else {
      gsap.to(modal, { opacity: 0, duration: 0.2, ease: 'power1.out', onComplete: () => { modal.hidden = true; } });
      if (state.screen === 'PANEL_OPEN') letterCard.focus({ preventScroll: true });
    }
  }

  /* Ayuda */
  let helpOpen = false;
  function setHelp(open) {
    helpOpen = open;
    helpBubble.hidden = !open;
    helpBtn.setAttribute('aria-expanded', String(open));
  }

  /* Focus trap */
  function trapFocus(e, container) {
    const items = Array.from(container.querySelectorAll('button, [href], iframe, [tabindex]:not([tabindex="-1"])'))
      .filter((el) => !el.closest('[hidden]') && el.getClientRects().length > 0);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (!container.contains(document.activeElement)) {
      e.preventDefault();
      first.focus();
    } else if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  /* ==========================================================================
     AUDIO
     ========================================================================== */
  const song = new Audio();
  song.preload = 'metadata';
  let voice = null;
  let actx = null, songGain = null, voiceGain = null;
  const levels = { fade: 1, duck: 1 };

  // Con file:// el navegador trata el audio como de otro origen y el Web Audio API lo silenciaría:
  // en ese caso los fades usan element.volume. Publicado (http/https) se usa AudioContext + GainNode.
  function unlockAudio() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC || location.protocol === 'file:') return;
    if (!actx) {
      try {
        actx = new AC();
      } catch (err) {
        console.error('AudioContext no disponible, se usa element.volume:', err);
        return;
      }
      // Cada elemento se conecta por separado: si uno falla, el otro sigue con su ganancia
      try {
        const g = actx.createGain();
        actx.createMediaElementSource(song).connect(g).connect(actx.destination);
        songGain = g;
      } catch (err) {
        console.error('No se pudo conectar la canción a Web Audio:', err);
      }
      if (voice) {
        try {
          const g = actx.createGain();
          actx.createMediaElementSource(voice).connect(g).connect(actx.destination);
          voiceGain = g;
        } catch (err) {
          console.error('No se pudo conectar la nota de voz a Web Audio:', err);
        }
      }
    }
    if (actx.state === 'suspended') actx.resume().catch(() => {});
  }

  function applyLevels() {
    const v = Math.max(0, Math.min(1, levels.fade * levels.duck));
    if (songGain) songGain.gain.value = v;
    else song.volume = v;
  }

  function fadeTo(target, seconds, onComplete) {
    gsap.killTweensOf(levels, 'fade');
    return gsap.to(levels, { fade: target, duration: seconds, ease: 'none', onUpdate: applyLevels, onComplete });
  }

  function duckTo(target) {
    gsap.killTweensOf(levels, 'duck');
    gsap.to(levels, { duck: target, duration: 0.3, ease: 'power1.out', onUpdate: applyLevels });
  }

  function loadTrack(i) {
    audio.trackIndex = i;
    song.src = C.tracks[i].src;
    loadLyrics();
    setStatus('idle');
    updateMediaSession();
    renderProgress(true);
  }

  function play({ fadeIn = 0 } = {}) {
    unlockAudio();
    gsap.killTweensOf(levels, 'fade');
    if (fadeIn) {
      levels.fade = 0;
      applyLevels();
      fadeTo(1, fadeIn);
    } else {
      levels.fade = 1;
      applyLevels();
    }
    const p = song.play();
    if (p && p.catch) {
      p.catch((err) => {
        if (err.name === 'AbortError') return;
        console.error('No se pudo reproducir', C.tracks[audio.trackIndex].src, err);
        if (err.name === 'NotAllowedError') setStatus(song.currentTime > 0 ? 'paused' : 'idle');
        else setStatus('error');
      });
    }
  }

  function pause() {
    gsap.killTweensOf(levels, 'fade');
    levels.fade = 1;
    applyLevels();
    song.pause();
  }

  function toggleTrack(i = audio.trackIndex) {
    if (i !== audio.trackIndex) {
      loadTrack(i);
      play();
    } else if (audio.status === 'playing') {
      pause();
    } else {
      play();
    }
  }

  function setStatus(s) {
    audio.status = s;
    renderAudio();
  }

  song.addEventListener('play', () => setStatus('playing'));
  song.addEventListener('pause', () => {
    // un "pause" atrasado de la pista anterior no debe pisar a la que ya suena
    if (!song.paused) return;
    if (!song.ended && audio.status !== 'error') setStatus('paused');
  });
  song.addEventListener('ended', () => {
    if (audio.trackIndex < C.tracks.length - 1) {
      loadTrack(audio.trackIndex + 1);
      play();
      return;
    }
    setStatus('ended');
    renderProgress(true);
    if (state.screen === 'MAIN') go('FINISHING');
  });
  song.addEventListener('error', () => {
    if (!song.getAttribute('src')) return;
    console.error('Error al cargar la canción:', C.tracks[audio.trackIndex].src, song.error);
    setStatus('error');
  });
  song.addEventListener('loadedmetadata', () => {
    renderProgress(true);
    updatePositionState();
  });
  song.addEventListener('timeupdate', () => renderProgress(false));

  /* Render del audio (tracklist, línea de estado, reproductor, carretes) */
  const trackRows = [];
  let reelsSpinning = false;

  function renderAudio() {
    const t = C.tracks[audio.trackIndex];
    const playing = audio.status === 'playing';
    trackRows.forEach((row, i) => {
      const on = playing && i === audio.trackIndex;
      row.el.classList.toggle('is-playing', on);
      row.btn.setAttribute('aria-label', fill(on ? UI.aria.pause : UI.aria.play, { title: C.tracks[i].title }));
      row.btn.setAttribute('aria-pressed', String(on));
    });
    const word = playing ? UI.status.playing : audio.status === 'paused' ? UI.status.paused : UI.status.idle;
    statusEl.textContent = audio.status === 'error' ? UI.status.error : word + ': ' + t.title;

    playerTitle.textContent = t.title;
    playerArtist.textContent = t.artist;
    if (t.cover && playerCover.getAttribute('src') !== t.cover) playerCover.src = t.cover;
    playerPlay.classList.toggle('is-playing', playing);
    playerPlay.setAttribute('aria-label', fill(playing ? UI.aria.pause : UI.aria.play, { title: t.title }));
    cassette.setAttribute('aria-pressed', String(playing));

    if (playing !== reelsSpinning) {
      reelsSpinning = playing;
      spinReels(playing);
    }
    if (playing) startLyrics();
    else stopLyrics();
    renderLyrics();
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = playing ? 'playing' : audio.status === 'paused' ? 'paused' : 'none';
    }
  }

  let lastProgress = 0, dragging = false, dragTime = 0;
  function renderProgress(force) {
    const now = performance.now();
    if (!force && now - lastProgress < 250) return;
    lastProgress = now;
    const d = song.duration;
    const ok = isFinite(d) && d > 0;
    const cur = dragging ? dragTime : song.currentTime;
    seekFill.style.transform = 'scaleX(' + (ok ? Math.min(1, cur / d) : 0) + ')';
    const fresh = audio.status === 'idle' || audio.status === 'ended' || audio.status === 'error';
    playerTime.textContent = ok ? (fresh && !dragging ? fmt(d) : '-' + fmt(d - cur)) : '0:00';
    seek.setAttribute('aria-valuemax', String(ok ? Math.round(d) : 0));
    seek.setAttribute('aria-valuenow', String(Math.round(cur)));
    seek.setAttribute('aria-valuetext', fmt(cur) + ' / ' + (ok ? fmt(d) : '0:00'));
  }

  /* Carretes: giran solo mientras suena, con aceleración y frenado suaves */
  let reelTween = null;
  function spinReels(on) {
    if (reduceMotion) return;
    if (!reelTween) {
      reelTween = gsap.to([reelL, reelR], { rotation: '+=360', duration: 2.8, ease: 'none', repeat: -1, paused: true });
      reelTween.timeScale(0);
    }
    gsap.killTweensOf(reelTween);
    if (on) {
      reelTween.play();
      gsap.to(reelTween, { timeScale: 1, duration: 0.4, ease: 'power1.in' });
    } else {
      gsap.to(reelTween, { timeScale: 0, duration: 0.6, ease: 'power2.out', onComplete: () => reelTween.pause() });
    }
  }

  /* Barra de progreso: clic y arrastre */
  function seekTimeFrom(e) {
    const r = seek.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    return ratio * (song.duration || 0);
  }
  seek.addEventListener('pointerdown', (e) => {
    if (!isFinite(song.duration)) return;
    dragging = true;
    seek.setPointerCapture(e.pointerId);
    dragTime = seekTimeFrom(e);
    renderProgress(true);
  });
  seek.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    dragTime = seekTimeFrom(e);
    renderProgress(true);
  });
  seek.addEventListener('pointerup', () => {
    if (!dragging) return;
    dragging = false;
    song.currentTime = dragTime;
    renderProgress(true);
  });
  const cancelDrag = () => {
    if (!dragging) return;
    dragging = false;
    renderProgress(true);
  };
  seek.addEventListener('pointercancel', cancelDrag);
  seek.addEventListener('lostpointercapture', cancelDrag);
  seek.addEventListener('keydown', (e) => {
    if (!isFinite(song.duration)) return;
    const step = { ArrowRight: 5, ArrowUp: 5, ArrowLeft: -5, ArrowDown: -5 }[e.key];
    if (step) song.currentTime = Math.min(song.duration, Math.max(0, song.currentTime + step));
    else if (e.key === 'Home') song.currentTime = 0;
    else if (e.key === 'End') song.currentTime = Math.max(0, song.duration - 1);
    else return;
    e.preventDefault();
    renderProgress(true);
  });

  /* Media Session */
  function updateMediaSession() {
    if (!('mediaSession' in navigator) || typeof window.MediaMetadata !== 'function') return;
    const t = C.tracks[audio.trackIndex];
    // La portada solo se acepta con http/https (no con file://)
    const web = location.protocol.indexOf('http') === 0;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: t.title,
        artist: t.artist,
        album: UI.pageTitle,
        artwork: t.cover && web ? [{ src: new URL(t.cover, location.href).href, sizes: '300x300', type: 'image/jpeg' }] : [],
      });
    } catch (err) { /* metadatos opcionales */ }
  }
  function updatePositionState() {
    if (!('mediaSession' in navigator) || !navigator.mediaSession.setPositionState || !isFinite(song.duration)) return;
    try {
      navigator.mediaSession.setPositionState({ duration: song.duration, playbackRate: 1, position: Math.min(song.currentTime, song.duration) });
    } catch (err) { /* opcional */ }
  }
  function setupMediaSession() {
    if (!('mediaSession' in navigator)) return;
    const handlers = {
      play: () => play(),
      pause: () => pause(),
      seekto: (d) => { if (isFinite(d.seekTime)) song.currentTime = d.seekTime; updatePositionState(); },
      previoustrack: () => {
        if (audio.trackIndex > 0) { loadTrack(audio.trackIndex - 1); play(); } else { song.currentTime = 0; }
      },
      nexttrack: () => {
        if (audio.trackIndex < C.tracks.length - 1) { loadTrack(audio.trackIndex + 1); play(); }
      },
    };
    for (const [action, fn] of Object.entries(handlers)) {
      try { navigator.mediaSession.setActionHandler(action, fn); } catch (err) { /* acción no soportada */ }
    }
  }

  /* Nota de voz (opcional) */
  const WAVE_BARS = 28, WAVE_REST = 9;
  let waveBars = [];
  function renderWave(progress) {
    const on = progress == null ? WAVE_REST : Math.round(progress * WAVE_BARS);
    waveBars.forEach((b, i) => b.classList.toggle('is-on', i < on));
  }
  function setupVoice() {
    if (!C.voiceNote) {
      voiceEl.remove();
      return;
    }
    const rng = mulberry32(7);
    for (let i = 0; i < WAVE_BARS; i++) {
      const b = document.createElement('span');
      b.className = 'wave__bar';
      b.style.height = Math.round(4 + rng() * 10) + 'px';
      wave.appendChild(b);
      waveBars.push(b);
    }
    renderWave(null);
    voice = new Audio();
    voice.preload = 'metadata';
    voice.addEventListener('loadedmetadata', () => {
      voiceEl.hidden = false;
      voiceTime.textContent = fmt(voice.duration);
      if (panelOpen) layoutBouquet();
    });
    voice.addEventListener('error', () => {
      voiceEl.remove();
      voice = null;
      if (panelOpen) layoutBouquet();
    });
    voice.addEventListener('play', () => {
      voiceBtn.classList.add('is-playing');
      voiceBtn.setAttribute('aria-label', UI.aria.voicePause);
      duckTo(0.2);
    });
    const stop = () => {
      voiceBtn.classList.remove('is-playing');
      voiceBtn.setAttribute('aria-label', UI.aria.voicePlay);
      duckTo(1);
    };
    voice.addEventListener('pause', stop);
    voice.addEventListener('ended', () => {
      stop();
      renderWave(null);
    });
    voice.addEventListener('timeupdate', () => {
      if (isFinite(voice.duration) && voice.duration > 0) renderWave(voice.currentTime / voice.duration);
    });
    voiceBtn.setAttribute('aria-label', UI.aria.voicePlay);
    voiceBtn.addEventListener('click', () => {
      if (!voice) return;
      unlockAudio();
      if (voice.paused) voice.play().catch((err) => console.error('No se pudo reproducir la nota de voz', C.voiceNote, err));
      else voice.pause();
    });
    voice.src = C.voiceNote;
  }

  /* Video de YouTube (opcional) */
  function setupVideo() {
    if (!C.youtubeId) {
      videoEl.remove();
      return;
    }
    videoEl.hidden = false;
    const origin = location.protocol.indexOf('http') === 0 ? '&origin=' + encodeURIComponent(location.origin) : '';
    const iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube.com/embed/' + encodeURIComponent(C.youtubeId) + '?enablejsapi=1&rel=0&playsinline=1' + origin;
    iframe.title = UI.aria.video;
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.loading = 'lazy';
    videoEl.appendChild(iframe);
    const send = (msg) => iframe.contentWindow && iframe.contentWindow.postMessage(JSON.stringify(msg), '*');
    iframe.addEventListener('load', () => {
      send({ event: 'listening', id: 1, channel: 'widget' });
      send({ event: 'command', func: 'addEventListener', args: ['onStateChange'], id: 1, channel: 'widget' });
    });
    // Si el video empieza a sonar, la canción local se pausa
    window.addEventListener('message', (e) => {
      if (e.source !== iframe.contentWindow) return;
      let d;
      try { d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data; } catch (err) { return; }
      if (!d) return;
      const playing = (d.event === 'onStateChange' && d.info === 1) ||
        (d.event === 'infoDelivery' && d.info && d.info.playerState === 1);
      if (playing && audio.status === 'playing') pause();
    });
  }

  /* ==========================================================================
     LETRA SINCRONIZADA (js/letra.js)
     ========================================================================== */
  const lyricsEl = $('lyrics'), lyricsText = $('lyricsText'), lyricsEcho = $('lyricsEcho'), lyricsBar = $('lyricsBar');
  const LYRIC_HOLD = 0.5; // segundos que el verso sigue visible al terminar: sin voz, la cinta se va
  const lyr = { lines: [], idx: -1, echo: null, raf: 0, shown: false };

  // Cada verso principal agrupa sus ecos ({ eco: true }), que se muestran debajo en una segunda línea.
  function loadLyrics() {
    const all = window.LETRAS || {};
    const raw = (all[C.tracks[audio.trackIndex].n] || [])
      .filter((l) => l && String(l.texto || '').trim() && Number.isFinite(+l.t))
      .map((l) => ({
        t: +l.t,
        fin: Number.isFinite(+l.fin) && +l.fin > +l.t ? +l.fin : +l.t + 4,
        texto: String(l.texto).trim(),
        eco: !!l.eco,
        w: Array.isArray(l.w) ? l.w.map(Number).filter(Number.isFinite).sort((a, b) => a - b) : null,
      }))
      .sort((a, b) => a.t - b.t);
    lyr.lines = [];
    for (const l of raw) {
      const group = lyr.lines[lyr.lines.length - 1];
      if (l.eco && group) group.ecos.push(l);
      else lyr.lines.push({ t: l.t, fin: l.fin, texto: l.texto, w: l.w, ecos: [] });
    }
    for (const g of lyr.lines) g.end = Math.max(g.fin, ...g.ecos.map((e) => e.fin));
    lyr.idx = -1;
    lyr.echo = null;
    lyricsText.textContent = '';
    lyricsEcho.textContent = '';
    stopLyrics();
    renderLyrics();
  }

  // Tramos donde realmente hay voz (window.LETRAS_VOZ): fuera de ellos la cinta no se muestra.
  function singingAt(t) {
    const ranges = (window.LETRAS_VOZ || {})[C.tracks[audio.trackIndex].n];
    if (!Array.isArray(ranges) || !ranges.length) return true;
    return ranges.some(([a, b]) => t >= a - 0.25 && t <= b + 0.35);
  }

  function lyricIndexAt(t) {
    if (!singingAt(t)) return -1;
    let idx = -1;
    for (let i = 0; i < lyr.lines.length; i++) {
      const L = lyr.lines[i];
      if (L.t > t) break;
      const next = lyr.lines[i + 1];
      const until = next ? Math.min(L.end + LYRIC_HOLD, next.t) : L.end + LYRIC_HOLD;
      if (t < until) idx = i;
    }
    return idx;
  }

  function showEcho(e) {
    if (e === lyr.echo) return;
    lyr.echo = e;
    gsap.killTweensOf(lyricsEcho);
    lyricsEcho.textContent = e ? e.texto : '';
    if (e) gsap.fromTo(lyricsEcho, { opacity: 0, x: reduceMotion ? 0 : -6 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' });
  }

  // Avance del verso: palabra por palabra si hay tiempos de palabras (w), si no, lineal.
  function lineProgress(L, t) {
    const clamp = (v) => Math.min(1, Math.max(0, v));
    if (!L.w || !L.w.length) return clamp((t - L.t) / Math.max(0.3, L.fin - L.t));
    let c = 0;
    while (c < L.w.length && L.w[c] <= t) c++;
    if (c === 0) return 0;
    const from = L.w[c - 1], to = c < L.w.length ? L.w[c] : L.fin;
    return clamp((c - 1 + clamp((t - from) / Math.max(0.12, to - from))) / L.w.length);
  }

  function lyricsTick() {
    lyr.raf = 0;
    const t = song.currentTime;
    const idx = lyricIndexAt(t);
    if (idx !== lyr.idx) showLyricLine(idx);
    if (idx >= 0) {
      const L = lyr.lines[idx];
      // solo se repinta cuando el avance cambia a la vista (medio punto), no en cada cuadro
      const p = Math.round(lineProgress(L, t) * 200) / 200;
      if (p !== lyr.p) {
        lyr.p = p;
        lyricsText.style.setProperty('--p', (p * 100).toFixed(1) + '%');
        lyricsBar.style.transform = 'scaleX(' + p.toFixed(3) + ')';
      }
      let echo = null;
      for (const e of L.ecos) if (e.t <= t) echo = e;
      showEcho(echo);
    }
    if (audio.status === 'playing' && lyr.lines.length) lyr.raf = requestAnimationFrame(lyricsTick);
  }
  function startLyrics() {
    if (!lyr.raf && lyr.lines.length) lyr.raf = requestAnimationFrame(lyricsTick);
  }
  function stopLyrics() {
    if (lyr.raf) cancelAnimationFrame(lyr.raf);
    lyr.raf = 0;
  }

  function showLyricLine(idx) {
    const wasVisible = lyr.shown && lyr.idx >= 0;
    lyr.idx = idx;
    renderLyrics();
    if (idx < 0) return;
    const text = lyr.lines[idx].texto;
    gsap.killTweensOf(lyricsText);
    const enter = () => {
      showEcho(null);
      lyricsText.textContent = text;
      lyricsText.style.setProperty('--p', '0%');
      lyricsBar.style.transform = 'scaleX(0)';
      lyr.p = 0;
      if (reduceMotion) gsap.fromTo(lyricsText, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      else gsap.fromTo(lyricsText, { opacity: 0, y: 8, filter: 'blur(4px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.42, ease: 'power2.out' });
    };
    if (!wasVisible || reduceMotion) enter();
    else gsap.to(lyricsText, { opacity: 0, y: -6, filter: 'blur(3px)', duration: 0.18, ease: 'power1.in', onComplete: enter });
  }

  function renderLyrics() {
    const s = state.screen;
    const screenOk = s === 'MAIN' || ((s === 'PANEL_OPEN' || s === 'LETTER_MODAL') && !isMobile());
    const want = screenOk && lyr.idx >= 0 && (audio.status === 'playing' || audio.status === 'paused');
    lyricsEl.classList.toggle('is-paused', audio.status === 'paused');
    if (want === lyr.shown) return;
    lyr.shown = want;
    gsap.killTweensOf(lyricsEl);
    if (want) gsap.fromTo(lyricsEl, { autoAlpha: 0, y: reduceMotion ? 0 : 12 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out' });
    else gsap.to(lyricsEl, { autoAlpha: 0, y: reduceMotion ? 0 : 8, duration: 0.35, ease: 'power1.in' });
  }

  song.addEventListener('seeked', () => {
    if (!lyr.lines.length) return;
    stopLyrics();
    lyricsTick();
  });

  /* ==========================================================================
     SECCIONES DE AMOR (config.razones / config.futuro / config.promesa)
     ========================================================================== */
  const loveEl = $('love');
  const love = { jarImg: null, ringClosed: null, ringOpen: null, minis: [] };
  const ORNAMENT = '<svg class="ornament" viewBox="0 0 180 22" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" aria-hidden="true"><path d="M8 11h52M120 11h52"/><path d="M60 11c4-5 10-6 14-2M120 11c-4-5-10-6-14-2"/><path d="M66 14c3 2 7 2 10-1M114 14c-3 2-7 2-10-1"/><path d="M90 17s-6.5-3.8-6.5-8a3.3 3.3 0 0 1 6.5-1.6 3.3 3.3 0 0 1 6.5 1.6c0 4.2-6.5 8-6.5 8z" fill="currentColor" stroke="none"/></svg>';
  const ICONS = {
    corazon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.5s-7.5-4.6-7.5-10.1A4.1 4.1 0 0 1 12 8a4.1 4.1 0 0 1 7.5 2.4c0 5.5-7.5 10.1-7.5 10.1z"/><path d="M18.5 2.8v3M17 4.3h3"/></svg>',
    avion: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 11.5 20.5 4l-4.6 16-4.4-5.6-4.9 2.4 1.2-4.6z"/><path d="m11.5 14.4 9-10.4"/></svg>',
    casa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11 12 4l8 7"/><path d="M6 9.5V20h12V9.5"/><path d="M12 17.5s-2.6-1.6-2.6-3.4a1.3 1.3 0 0 1 2.6-.5 1.3 1.3 0 0 1 2.6.5c0 1.8-2.6 3.4-2.6 3.4z"/></svg>',
    anillos: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="14.5" r="5"/><circle cx="15" cy="14.5" r="5"/><path d="M9.6 7 10.8 4.5h2.4L14.4 7 12 9.2z"/></svg>',
    infinito: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12c-2-2.6-3.6-4-5.4-4a4 4 0 0 0 0 8c1.8 0 3.4-1.4 5.4-4zm0 0c2 2.6 3.6 4 5.4 4a4 4 0 0 0 0-8c-1.8 0-3.4 1.4-5.4 4z"/></svg>',
  };
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };
  const shuffled = (n) => {
    const a = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  // Recuerda lo que ella ya abrió o canjeó (solo en su navegador; si no se puede guardar, no pasa nada)
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem('mixtape:' + k) || 'null'); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem('mixtape:' + k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } },
  };

  // Hoja de papel para leer las cartas "Ábrela cuando…"
  const sheet = (() => {
    const root = el('div', 'sheet');
    root.hidden = true;
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-labelledby', 'sheetTitle');
    const overlay = el('div', 'sheet__overlay');
    const paper = el('article', 'sheet__paper');
    const close = el('button', 'sheet__close');
    close.type = 'button';
    close.setAttribute('aria-label', UI.aria.close);
    close.innerHTML = '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
    const label = el('p', 'label sheet__label');
    const title = el('h2', 'sheet__title');
    title.id = 'sheetTitle';
    const body = el('div', 'sheet__body');
    const sign = el('p', 'sheet__sign');
    paper.append(close, label, title, body, sign);
    root.append(overlay, paper);
    document.body.append(root);
    let opener = null;
    const open = ({ etiqueta, titulo, texto, firma, from }) => {
      label.textContent = etiqueta;
      title.textContent = titulo;
      body.textContent = '';
      String(texto).split(/\n\s*\n/).forEach((p) => body.append(el('p', null, p.trim())));
      sign.textContent = firma;
      opener = from || null;
      root.hidden = false;
      paper.scrollTop = 0;
      gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      gsap.fromTo(paper, { opacity: 0, y: reduceMotion ? 0 : 40, scale: reduceMotion ? 1 : 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out' });
      close.focus({ preventScroll: true });
    };
    const shut = () => {
      if (root.hidden) return;
      gsap.to(paper, { opacity: 0, y: 18, duration: 0.25 });
      gsap.to(overlay, { opacity: 0, duration: 0.25, onComplete: () => { root.hidden = true; } });
      if (opener) opener.focus({ preventScroll: true });
    };
    overlay.addEventListener('click', shut);
    close.addEventListener('click', shut);
    return { open, shut, paper, get isOpen() { return !root.hidden; } };
  })();

  function heartBurst(host, n = 14, colors = ['#F07F96', '#E25A78', '#F5A3B5', '#E9C08E']) {
    if (reduceMotion) return;
    for (let i = 0; i < n; i++) {
      const h = el('span', 'mini-heart');
      h.style.background = colors[i % colors.length];
      host.append(h);
      const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.4, d = 70 + Math.random() * 90;
      gsap.fromTo(h, { x: 0, y: 0, scale: 0.4, opacity: 1, rotation: 0 },
        { x: Math.cos(a) * d, y: Math.sin(a) * d, scale: 0.7 + Math.random() * 0.8, opacity: 0, rotation: (Math.random() - 0.5) * 60, duration: 1 + Math.random() * 0.6, ease: 'power2.out', onComplete: () => h.remove() });
    }
  }

  function loveSection(cls, cfg, id) {
    const sec = el('section', 'love-sec ' + cls);
    sec.setAttribute('aria-labelledby', id);
    sec.insertAdjacentHTML('beforeend', ORNAMENT);
    sec.append(el('p', 'label', cfg.etiqueta));
    const h = el('h2', 'love-title', cfg.titulo);
    h.id = id;
    sec.append(h);
    loveEl.append(sec);
    return sec;
  }

  function buildReasons(cfg) {
    const sec = loveSection('love-reasons', cfg, 'reasonsTitle');
    const wrap = el('div', 'reasons');
    const jar = el('button', 'jar');
    jar.type = 'button';
    jar.setAttribute('aria-label', UI.aria.jar);
    love.jarImg = el('img');
    love.jarImg.alt = '';
    love.jarImg.decoding = 'async';
    jar.append(love.jarImg);
    const col = el('div', 'reasons__col');
    const card = el('div', 'reason-card');
    card.setAttribute('aria-live', 'polite');
    const num = el('span', 'reason-card__n', '');
    const text = el('p', 'reason-card__text', cfg.pista);
    const count = el('span', 'reason-card__count', '');
    card.append(el('span', 'reason-card__tape'), num, text, count);
    const btn = el('button', 'reason-btn', cfg.boton);
    btn.type = 'button';
    btn.hidden = true;
    col.append(card, btn);
    wrap.append(jar, col);
    sec.append(wrap);

    const total = cfg.lista.length;
    let order = shuffled(total), pos = 0;
    const next = () => {
      if (pos >= total) { order = shuffled(total); pos = 0; }
      const i = order[pos++];
      const shown = pos;
      const swap = () => {
        num.textContent = 'N.º ' + String(i + 1).padStart(2, '0');
        text.textContent = cfg.lista[i];
        count.textContent = shown + ' / ' + total;
      };
      btn.hidden = false;
      if (reduceMotion) { swap(); return; }
      const a = jar.getBoundingClientRect(), b = card.getBoundingClientRect();
      const note = el('span', 'flying-note');
      document.body.append(note);
      gsap.set(note, { left: a.left + a.width / 2 - 23, top: a.top + a.height * 0.2, rotation: -24, scale: 0.6 });
      gsap.timeline({ onComplete: () => note.remove() })
        .to(jar, { rotation: -3, duration: 0.07, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 0)
        .to(note, { left: b.left + b.width / 2 - 23, top: b.top + 18, rotation: 10, scale: 1.15, duration: 0.55, ease: 'power2.inOut' }, 0.05)
        .to(note, { opacity: 0, scale: 0.5, duration: 0.18 }, 0.56)
        .to(card, { scaleY: 0.04, duration: 0.18, ease: 'power1.in' }, 0.42)
        .add(swap, 0.6)
        .to(card, { scaleY: 1, duration: 0.5, ease: 'back.out(1.7)' }, 0.6);
    };
    jar.addEventListener('click', next);
    btn.addEventListener('click', next);
  }

  function buildFuture(cfg) {
    const sec = loveSection('love-future', cfg, 'futureTitle');
    const ol = el('ol', 'timeline');
    for (const p of cfg.pasos) {
      const li = el('li', 'tl-item' + (p.destacado ? ' is-highlight' : ''));
      const dot = el('span', 'tl-dot');
      dot.setAttribute('aria-hidden', 'true');
      dot.innerHTML = ICONS[p.icono] || ICONS.corazon;
      const body = el('div', 'tl-body');
      body.append(el('p', 'tl-when', p.cuando), el('h3', 'tl-title', p.titulo), el('p', 'tl-text', p.texto));
      li.append(dot, body);
      ol.append(li);
    }
    sec.append(ol);
    const items = Array.from(ol.children);
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach((it) => it.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    }, { root: card, threshold: 0.25 });
    items.forEach((it) => io.observe(it));
  }

  function sparkleBurst(host) {
    if (reduceMotion) return;
    for (let i = 0; i < 12; i++) {
      const s = el('span', 'spark');
      host.append(s);
      const a = (i / 12) * Math.PI * 2 + Math.random() * 0.4, d = 55 + Math.random() * 75;
      gsap.fromTo(s, { x: 0, y: 0, scale: 0.3, opacity: 1, rotation: 0 },
        { x: Math.cos(a) * d, y: Math.sin(a) * d - 18, scale: 0.8 + Math.random() * 0.7, rotation: 90, opacity: 0, duration: 0.9 + Math.random() * 0.4, ease: 'power2.out', onComplete: () => s.remove() });
    }
  }

  function buildPromise(cfg) {
    const sec = loveSection('love-promise', cfg, 'promiseTitle');
    const box = el('button', 'ringbox');
    box.type = 'button';
    box.setAttribute('aria-label', UI.aria.ring);
    box.setAttribute('aria-expanded', 'false');
    love.ringClosed = el('img', 'ringbox__closed');
    love.ringOpen = el('img', 'ringbox__open');
    love.ringClosed.alt = love.ringOpen.alt = '';
    const sparks = el('span', 'sparkles');
    sparks.setAttribute('aria-hidden', 'true');
    box.append(love.ringClosed, love.ringOpen, sparks);
    const hint = el('p', 'love-hint', cfg.pista);
    const msg = el('div', 'promise-msg');
    msg.hidden = true;
    msg.append(el('p', 'promise-text', cfg.mensaje), el('p', 'promise-note', cfg.nota));
    sec.append(box, hint, msg);

    let opened = false;
    box.addEventListener('click', () => {
      sparkleBurst(sparks);
      if (opened) return;
      opened = true;
      box.setAttribute('aria-expanded', 'true');
      hint.hidden = true;
      msg.hidden = false;
      if (reduceMotion) {
        gsap.set(love.ringOpen, { opacity: 1 });
        gsap.set(love.ringClosed, { opacity: 0 });
        return;
      }
      gsap.timeline()
        .to(box, { scale: 0.95, duration: 0.12, ease: 'power1.in' })
        .to(love.ringClosed, { opacity: 0, duration: 0.25 }, 0.12)
        .to(love.ringOpen, { opacity: 1, duration: 0.25 }, 0.12)
        .to(box, { scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.5)' }, 0.12)
        .fromTo(msg, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.45);
    });
  }

  /* Mantén presionado: el corazón se llena */
  const HEART_D = 'M60 102C20 76 4 52 8 32 12 12 34 4 48 14c6 4 10 10 12 14 2-4 6-10 12-14 14-10 36-2 40 18 4 20-12 44-52 70z';
  function buildHold(cfg) {
    const sec = loveSection('love-hold', cfg, 'holdTitle');
    const wrap = el('div', 'hold-wrap');
    const btn = el('button', 'hold');
    btn.type = 'button';
    btn.setAttribute('aria-label', cfg.pista);
    btn.innerHTML = '<svg class="hold__svg" viewBox="0 0 120 110" aria-hidden="true"><defs><clipPath id="holdClip"><path d="' + HEART_D + '"/></clipPath>' +
      '<linearGradient id="holdFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F48CA2"/><stop offset="1" stop-color="#9E2A48"/></linearGradient>' +
      '<radialGradient id="holdShadow"><stop offset="0" stop-color="#9E2A48" stop-opacity=".28"/><stop offset="1" stop-color="#9E2A48" stop-opacity="0"/></radialGradient></defs>' +
      // sombra pintada una sola vez (un filtro se recalcularía con cada ola del llenado)
      '<ellipse cx="60" cy="108" rx="44" ry="7" fill="url(#holdShadow)"/>' +
      '<path d="' + HEART_D + '" transform="translate(0 5)" fill="#9E2A48" opacity=".09"/><path d="' + HEART_D + '" transform="translate(0 2.5)" fill="#9E2A48" opacity=".08"/>' +
      '<path d="' + HEART_D + '" fill="#F9E6EA"/><g clip-path="url(#holdClip)"><g class="hold__level"><path class="hold__wave" d="M-60 6Q-47.5-2-35 6T-10 6 15 6 40 6 65 6 90 6 115 6 140 6 165 6V140H-60Z" fill="url(#holdFill)"/></g></g>' +
      '<path d="' + HEART_D + '" fill="none" stroke="#B5536A" stroke-width="2.2"/><path d="M28 30Q34 18 48 20" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none" opacity=".75"/></svg>';
    const burstHost = el('span', 'hold__burst');
    wrap.append(btn, burstHost);
    const msg = el('p', 'hold__msg', cfg.pista);
    msg.setAttribute('aria-live', 'polite');
    sec.append(wrap, msg);

    const level = btn.querySelector('.hold__level');
    const wave = btn.querySelector('.hold__wave');
    let p = 0, holding = false, done = false, raf = 0, last = 0, beat = null, shown = -1;
    const waveTween = reduceMotion ? null : gsap.to(wave, { x: 50, duration: 1.4, ease: 'none', repeat: -1, paused: true });
    const marks = [0.18, 0.42, 0.66, 0.88];
    const render = () => {
      gsap.set(level, { y: 112 * (1 - p) - 6 * p });
      let k = -1;
      marks.forEach((m, i) => { if (p >= m) k = i; });
      if (!done && k !== shown) {
        shown = k;
        msg.textContent = k < 0 ? cfg.pista : cfg.pasos[k];
        msg.classList.toggle('is-active', k >= 0);
      }
    };
    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (holding) p = Math.min(1, p + dt / 3.2);
      else if (!done) p = Math.max(0, p - dt / 1.4);
      render();
      if (p >= 1 && !done) finish();
      raf = (holding || (!done && p > 0)) ? requestAnimationFrame(frame) : 0;
      if (!raf && waveTween) waveTween.pause();
    };
    const finish = () => {
      done = true;
      msg.textContent = cfg.final;
      msg.classList.add('is-final');
      heartBurst(burstHost, 18);
      if (navigator.vibrate) navigator.vibrate([40, 60, 40]);
      if (beat) beat.kill();
      if (!reduceMotion) gsap.fromTo(btn, { scale: 1.12 }, { scale: 1, duration: 0.9, ease: 'elastic.out(1, 0.4)' });
    };
    const start = () => {
      if (done) { heartBurst(burstHost, 12); return; }
      holding = true;
      if (waveTween) waveTween.play();
      if (!reduceMotion && !beat) beat = gsap.to(btn, { scale: 1.07, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
    };
    const release = () => {
      if (!holding) return;
      holding = false;
      if (beat) { beat.kill(); beat = null; gsap.to(btn, { scale: 1, duration: 0.25 }); }
      if (!raf && !done) { last = performance.now(); raf = requestAnimationFrame(frame); }
    };
    btn.addEventListener('pointerdown', (e) => { e.preventDefault(); btn.setPointerCapture(e.pointerId); start(); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((ev) => btn.addEventListener(ev, release));
    btn.addEventListener('contextmenu', (e) => e.preventDefault());
    btn.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); start(); } });
    btn.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') release(); });
    render();
  }

  /* Ábrela cuando… */
  function buildLetters(cfg) {
    const sec = loveSection('love-letters', cfg, 'lettersTitle');
    sec.append(el('p', 'love-hint', cfg.pista));
    const grid = el('div', 'letters');
    const read = new Set(store.get('cartas') || []);
    cfg.lista.forEach((c, i) => {
      const b = el('button', 'letter-env');
      b.type = 'button';
      b.setAttribute('aria-label', UI.aria.openWhen + ' ' + c.cuando);
      const img = el('img', 'letter-env__img');
      img.alt = '';
      img.decoding = 'async';
      love.minis.push({ img, v: i });
      const cap = el('span', 'letter-env__cap');
      cap.append(el('span', 'letter-env__pre', UI.aria.openWhen), el('span', 'letter-env__when', c.cuando));
      const badge = el('span', 'letter-env__read', cfg.leida);
      badge.hidden = !read.has(i);
      b.append(img, cap, badge);
      b.addEventListener('click', () => {
        read.add(i);
        store.set('cartas', [...read]);
        badge.hidden = false;
        const show = () => sheet.open({ etiqueta: cfg.etiqueta, titulo: UI.aria.openWhen + ' ' + c.cuando, texto: c.texto, firma: '— ' + (C.from || UI.firma), from: b });
        if (reduceMotion) { show(); return; }
        gsap.timeline({ onComplete: show })
          .to(img, { y: -12, rotation: -4, duration: 0.18, ease: 'power2.out' })
          .to(img, { rotation: 4, duration: 0.09, yoyo: true, repeat: 1 })
          .to(img, { y: 0, rotation: 0, duration: 0.2, ease: 'power2.in' });
      });
      grid.append(b);
    });
    sec.append(grid);
  }

  /* Nuestro cielo: estrellas que forman un corazón */
  function buildSky(cfg) {
    const sec = loveSection('love-sky', cfg, 'skyTitle');
    sec.append(el('p', 'love-hint', cfg.pista));
    const sky = el('div', 'sky');
    const n = cfg.estrellas.length;
    // Lienzo fijo 400×300 (misma proporción que .sky, 4:3) y la misma escala en X e Y: el corazón nunca se deforma.
    const VW = 400, VH = 300, S = 7.6, CX = 200, CY = 136;
    const heartAt = (t) => {
      const x = 16 * Math.sin(t) ** 3;
      const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      return [CX + x * S, CY - y * S];
    };
    // estrellas repartidas a igual distancia sobre el contorno (así ninguna tapa a otra)
    const fine = Array.from({ length: 721 }, (_, k) => heartAt((k / 720) * Math.PI * 2));
    const cum = [0];
    for (let k = 1; k < fine.length; k++) cum.push(cum[k - 1] + Math.hypot(fine[k][0] - fine[k - 1][0], fine[k][1] - fine[k - 1][1]));
    const total = cum[cum.length - 1];
    const pts = Array.from({ length: n }, (_, i) => {
      const target = (total * i) / n;
      let k = 0;
      while (k < cum.length - 1 && cum[k] < target) k++;
      return fine[k];
    });
    const rnd = (a, b) => a + Math.random() * (b - a);
    const f1 = (v) => v.toFixed(1);
    // --- fondo: nebulosas, vía láctea, retícula de carta estelar, campo de estrellas, luna, fugaces ---
    let svg = '<defs>' +
      '<radialGradient id="nebA"><stop offset="0" stop-color="#E7A9BA" stop-opacity=".38"/><stop offset="1" stop-color="#E7A9BA" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="nebB"><stop offset="0" stop-color="#8E6ABF" stop-opacity=".34"/><stop offset="1" stop-color="#8E6ABF" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="nebC"><stop offset="0" stop-color="#F3D9A6" stop-opacity=".16"/><stop offset="1" stop-color="#F3D9A6" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="milky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF4F0" stop-opacity="0"/><stop offset=".5" stop-color="#FFF4F0" stop-opacity=".09"/><stop offset="1" stop-color="#FFF4F0" stop-opacity="0"/></linearGradient>' +
      '<radialGradient id="moonGlow" cx="348" cy="46" r="40" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFF1D6" stop-opacity=".45"/><stop offset="1" stop-color="#FFF1D6" stop-opacity="0"/></radialGradient>' +
      '<mask id="moonMask"><circle cx="348" cy="46" r="15" fill="#fff"/><circle cx="355" cy="41" r="13.5" fill="#000"/></mask>' +
      '<linearGradient id="shoot" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFF6E8" stop-opacity="0"/><stop offset="1" stop-color="#FFF6E8" stop-opacity=".95"/></linearGradient>' +
      '<radialGradient id="heartFill" cx="200" cy="150" r="150" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#F7B9C9" stop-opacity=".26"/><stop offset=".7" stop-color="#E7A9BA" stop-opacity=".08"/><stop offset="1" stop-color="#E7A9BA" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="heartStroke" x1="70" y1="40" x2="330" y2="270" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#F7B9C9"/><stop offset=".55" stop-color="#F9D3C6"/><stop offset="1" stop-color="#F3D9A6"/></linearGradient>' +
      '</defs>';
    svg += '<ellipse cx="110" cy="80" rx="150" ry="90" fill="url(#nebA)"/><ellipse cx="310" cy="220" rx="170" ry="100" fill="url(#nebB)"/><ellipse cx="240" cy="60" rx="120" ry="60" fill="url(#nebC)"/>';
    svg += '<ellipse cx="200" cy="150" rx="280" ry="34" transform="rotate(-20 200 150)" fill="url(#milky)"/>';
    let field = '';
    for (let i = 0; i < 70; i++) {
      const u = rnd(-1, 1), v = rnd(-1, 1) * 0.35;
      const x = 200 + u * 260 * Math.cos(-0.35) - v * 34 * Math.sin(-0.35), y = 150 + u * 260 * Math.sin(-0.35) + v * 34 * Math.cos(-0.35);
      field += '<circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="' + rnd(0.3, 0.6).toFixed(2) + '" fill="#FFF6E8" opacity="' + rnd(0.25, 0.6).toFixed(2) + '"/>';
    }
    for (let i = 0; i < 110; i++) {
      const tint = Math.random() < 0.15 ? '#FFD6E0' : Math.random() < 0.15 ? '#DCE4FF' : '#FFF6E8';
      field += '<circle cx="' + f1(rnd(0, VW)) + '" cy="' + f1(rnd(0, VH)) + '" r="' + rnd(0.35, 0.8).toFixed(2) + '" fill="' + tint + '" opacity="' + rnd(0.3, 0.75).toFixed(2) + '"/>';
    }
    // lo fijo va en una capa y lo animado en otra: así un destello no obliga a repintar todo el cielo
    svg += field + '<g class="sky__chart" fill="none" stroke="#F3D9A6"><circle cx="200" cy="560" r="330"/><circle cx="200" cy="560" r="390"/><circle cx="200" cy="560" r="450"/><path d="M200 560 L40 -20 M200 560 L200 -20 M200 560 L360 -20"/></g>';
    svg += '<circle cx="348" cy="46" r="40" fill="url(#moonGlow)"/><circle cx="348" cy="46" r="15" fill="#FFF1D6" mask="url(#moonMask)"/>';
    const bgSvg = svg;
    svg = '';
    field = '';
    for (let i = 0; i < 18; i++) {
      field += '<circle class="sky__dot" cx="' + f1(rnd(0, VW)) + '" cy="' + f1(rnd(0, VH)) + '" r="' + rnd(0.9, 1.5).toFixed(2) + '" style="animation-delay:' + rnd(0, 4).toFixed(2) + 's;animation-duration:' + rnd(2.4, 4.6).toFixed(2) + 's"/>';
    }
    for (let i = 0; i < 7; i++) {
      const x = rnd(14, VW - 14), y = rnd(12, VH - 30), r = rnd(4, 7);
      field += '<g class="sky__glint" style="animation-delay:' + rnd(0, 5).toFixed(2) + 's"><path d="M' + f1(x - r) + ' ' + f1(y) + 'H' + f1(x + r) + 'M' + f1(x) + ' ' + f1(y - r) + 'V' + f1(y + r) + '" stroke="#FFF6E8" stroke-width=".5" stroke-linecap="round"/><circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="1.3" fill="#FFF6E8"/></g>';
    }
    svg += field;
    svg += '<g class="sky__shoot sky__shoot--a"><line x1="0" y1="0" x2="46" y2="0" stroke="url(#shoot)" stroke-width="1.3" stroke-linecap="round"/></g><g class="sky__shoot sky__shoot--b"><line x1="0" y1="0" x2="38" y2="0" stroke="url(#shoot)" stroke-width="1.1" stroke-linecap="round"/></g>';
    // --- corazón (se revela al completar) ---
    const smoothHeart = Array.from({ length: 120 }, (_, i) => heartAt((i / 120) * Math.PI * 2).map(f1).join(',')).join(' ');
    svg += '<g class="sky__heartGroup"><polygon class="heart-fill" points="' + smoothHeart + '"/>' +
      '<polygon class="heart-glow" points="' + smoothHeart + '" pathLength="1"/>' +
      '<polygon class="heart-line" points="' + smoothHeart + '" pathLength="1"/><g class="sky__motes"></g></g>';
    svg += '<g class="sky__lines"></g>';
    svg += '<text class="sky__name" x="200" y="291" text-anchor="middle">✦  ' + String(cfg.nombre || '').toUpperCase() + '  ✦</text>';
    const vb = ' viewBox="0 0 ' + VW + ' ' + VH + '" preserveAspectRatio="xMidYMid meet" aria-hidden="true"';
    sky.innerHTML = '<svg class="sky__svg sky__bg"' + vb + '>' + bgSvg + '</svg><svg class="sky__svg sky__fx"' + vb + '>' + svg + '</svg>';

    const NS = 'http://www.w3.org/2000/svg';
    const toPct = ([x, y]) => [(x / VW) * 100, (y / VH) * 100];
    const lines = sky.querySelector('.sky__lines');
    const motes = sky.querySelector('.sky__motes');
    const heartStrokes = sky.querySelectorAll('.heart-glow, .heart-line');
    const lit = new Array(n).fill(false);
    const caption = el('p', 'sky__caption', '');
    caption.setAttribute('aria-live', 'polite');
    const mk = (tag, attrs) => {
      const e = document.createElementNS(NS, tag);
      for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
      return e;
    };
    const drawSeg = (a, b) => {
      const [x1, y1] = pts[a], [x2, y2] = pts[b];
      const g = mk('g', { class: 'seg' });
      const glow = mk('line', { class: 'seg-glow', x1, y1, x2, y2, pathLength: 1 });
      const core = mk('line', { class: 'seg-core', x1, y1, x2, y2, pathLength: 1 });
      g.append(glow, core);
      lines.append(g);
      if (reduceMotion) return;
      gsap.fromTo([glow, core], { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.8, ease: 'power2.out' });
      const spark = mk('circle', { class: 'seg-spark', r: 2.4, cx: x1, cy: y1 });
      lines.append(spark);
      gsap.to(spark, { attr: { cx: x2, cy: y2 }, duration: 0.8, ease: 'power2.out', onComplete: () => gsap.to(spark, { opacity: 0, duration: 0.3, onComplete: () => spark.remove() }) });
    };
    const releaseMotes = () => {
      if (reduceMotion) return;
      for (let i = 0; i < 14; i++) {
        const [hx, hy] = heartAt(rnd(0, Math.PI * 2));
        const k = rnd(0.1, 0.8);
        const c = mk('circle', { class: 'sky__mote', cx: f1(CX + (hx - CX) * k), cy: f1(CY + 10 + (hy - CY - 10) * k), r: rnd(0.6, 1.6).toFixed(2) });
        c.style.animationDelay = rnd(0, 4).toFixed(2) + 's';
        c.style.animationDuration = rnd(3, 5.5).toFixed(2) + 's';
        motes.append(c);
      }
    };
    pts.forEach((pt, i) => {
      const [x, y] = toPct(pt);
      const s = el('button', 'star');
      s.type = 'button';
      s.style.left = x + '%';
      s.style.top = y + '%';
      s.setAttribute('aria-label', fill(UI.aria.star, { n: i + 1 }));
      // halo, rayos (en su propia capa: giran sin redibujar) y núcleo
      s.innerHTML = '<span class="star__halo" aria-hidden="true"></span>' +
        '<span class="star__spin" aria-hidden="true"><svg viewBox="0 0 48 48"><path class="star__rays" d="M24 3V45M3 24H45" stroke-linecap="round"/>' +
        '<path class="star__rays star__rays--d" d="M12 12 36 36M36 12 12 36" stroke-linecap="round"/></svg></span>' +
        '<svg class="star__body" viewBox="0 0 48 48" aria-hidden="true"><path class="star__core" d="M24 11.5 26.6 21.4 36.5 24 26.6 26.6 24 36.5 21.4 26.6 11.5 24 21.4 21.4z"/>' +
        '<circle class="star__eye" cx="24" cy="24" r="2.2"/></svg>';
      s.addEventListener('click', () => {
        caption.textContent = cfg.estrellas[i];
        caption.classList.remove('is-final');
        if (!reduceMotion) gsap.fromTo(caption, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.4 });
        if (lit[i]) return;
        lit[i] = true;
        s.classList.add('is-lit');
        if (!reduceMotion) gsap.fromTo(s, { scale: 1.9 }, { scale: 1, duration: 0.7, ease: 'back.out(2)' });
        const prev = (i - 1 + n) % n, next = (i + 1) % n;
        if (lit[prev]) drawSeg(prev, i);
        if (lit[next]) drawSeg(i, next);
        if (lit.every(Boolean)) {
          sky.classList.add('is-complete');
          releaseMotes();
          if (reduceMotion) heartStrokes.forEach((h) => { h.style.strokeDashoffset = '0'; });
          else gsap.fromTo(heartStrokes, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut', delay: 0.3 });
          setTimeout(() => {
            caption.textContent = cfg.final;
            caption.classList.add('is-final');
            if (!reduceMotion) gsap.fromTo(caption, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.6 });
          }, reduceMotion ? 0 : 1500);
        }
      });
      sky.append(s);
    });
    sec.append(sky, caption);
    // las animaciones del cielo solo corren mientras se ve (ahorra batería y evita tirones al recorrer la tarjeta)
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        for (const e of entries) sky.classList.toggle('is-live', e.isIntersecting);
      }, { root: card, threshold: 0 }).observe(sky);
    } else {
      sky.classList.add('is-live');
    }
  }

  /* Vales de amor */
  const COUPON_ICONS = {
    abrazo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 18s-5-3-5-6.8A2.7 2.7 0 0 1 8.5 10a2.7 2.7 0 0 1 5 1.2C13.5 15 8.5 18 8.5 18z"/><path d="M15.5 15.5s4.5-2.7 4.5-6.1A2.4 2.4 0 0 0 15.5 8.3"/></svg>',
    cita: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/><path d="M12 17.5s-2.6-1.6-2.6-3.3a1.3 1.3 0 0 1 2.6-.5 1.3 1.3 0 0 1 2.6.5c0 1.7-2.6 3.3-2.6 3.3z"/></svg>',
    corona: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 17.5 3 7.5l5 4 4-6 4 6 5-4-1 10z"/><path d="M4.5 20.5h15"/></svg>',
    taza: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10h12v4a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M16 11h1.5a2.5 2.5 0 0 1 0 5H16"/><path d="M10 7s-1.4-.9-1.4-1.9a.7.7 0 0 1 1.4-.3.7.7 0 0 1 1.4.3c0 1-1.4 1.9-1.4 1.9z"/></svg>',
    pelicula: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="8.5" width="17" height="11" rx="1.5"/><path d="m3.5 8.5 16-4.5.6 2.2-16 4.5"/><path d="M8 5.6l2 3M13 4.2l2 3"/></svg>',
    beso: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12c2.5-3.5 5-4.5 6.5-3.2.9-.8 2-.8 2.5-.3.5-.5 1.6-.5 2.5.3C16 7.5 18.5 8.5 21 12c-2.5 2.6-5.2 4-9 4s-6.5-1.4-9-4z"/><path d="M3 12h18"/></svg>',
  };
  function buildCoupons(cfg) {
    const sec = loveSection('love-coupons', cfg, 'couponsTitle');
    sec.append(el('p', 'love-hint', cfg.pista));
    const grid = el('div', 'coupons');
    const used = new Set(store.get('vales') || []);
    cfg.lista.forEach((v, i) => {
      const c = el('div', 'coupon' + (used.has(i) ? ' is-used' : ''));
      const stub = el('div', 'coupon__stub');
      stub.setAttribute('aria-hidden', 'true');
      stub.innerHTML = COUPON_ICONS[v.icono] || ICONS.corazon;
      const main = el('div', 'coupon__main');
      main.append(el('p', 'coupon__pre', cfg.valePor), el('h3', 'coupon__title', v.titulo), el('p', 'coupon__text', v.texto));
      const btn = el('button', 'coupon__btn', cfg.boton);
      btn.type = 'button';
      btn.hidden = used.has(i);
      main.append(btn);
      const stamp = el('span', 'coupon__stamp', cfg.sello + ' ♥');
      stamp.hidden = !used.has(i);
      c.append(stub, main, stamp);
      btn.addEventListener('click', () => {
        used.add(i);
        store.set('vales', [...used]);
        btn.hidden = true;
        stamp.hidden = false;
        c.classList.add('is-used');
        if (reduceMotion) return;
        gsap.fromTo(stamp, { scale: 2.4, opacity: 0, rotation: -26 }, { scale: 1, opacity: 1, rotation: -12, duration: 0.45, ease: 'back.out(2)' });
        gsap.fromTo(c, { x: -4 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)', delay: 0.3 });
      });
      grid.append(c);
    });
    sec.append(grid);
  }

  function buildLove() {
    const has = (o, k) => o && Array.isArray(o[k]) && o[k].length;
    if (has(C.razones, 'lista')) buildReasons(C.razones);
    if (C.cuanto && C.cuanto.final) buildHold(C.cuanto);
    if (has(C.cartas, 'lista')) buildLetters(C.cartas);
    if (has(C.cielo, 'estrellas')) buildSky(C.cielo);
    if (has(C.vales, 'lista')) buildCoupons(C.vales);
    if (has(C.futuro, 'pasos')) buildFuture(C.futuro);
    if (C.promesa && C.promesa.mensaje) buildPromise(C.promesa);
  }

  /* ==========================================================================
     TEXTOS, IMÁGENES Y EVENTOS
     ========================================================================== */
  const ICON_PLAY = '<svg class="i-play" viewBox="0 0 10 12" width="10" height="12" aria-hidden="true"><path d="M0 0L10 6L0 12Z" fill="currentColor"/></svg>';
  const ICON_PAUSE = '<svg class="i-pause" viewBox="0 0 10 12" width="10" height="12" aria-hidden="true"><rect width="3.4" height="12" rx="1" fill="currentColor"/><rect x="6.6" width="3.4" height="12" rx="1" fill="currentColor"/></svg>';

  function applyTexts() {
    document.documentElement.lang = C.lang || 'es';
    document.title = UI.pageTitle;
    eyebrow.textContent = fill(UI.eyebrow);
    titleEl.textContent = UI.pageTitle;
    tapOpen.textContent = UI.tapToOpen;
    envelope.setAttribute('aria-label', UI.aria.envelope);
    cassette.setAttribute('aria-label', UI.aria.cassette);

    noteLabel.textContent = UI.linerNoteLabel;
    const p1 = document.createElement('p');
    p1.textContent = C.linerNote.greeting;
    const p2 = document.createElement('p');
    p2.textContent = C.linerNote.body;
    const p3 = document.createElement('p');
    p3.append(C.linerNote.closing);
    if (C.from) p3.append(document.createElement('br'), C.from);
    noteBody.append(p1, p2, p3);
    finishBtn.textContent = UI.finish;

    heart.setAttribute('aria-label', UI.aria.openMore);
    pill.textContent = UI.moreHere;
    helpBtn.textContent = UI.help;
    helpBubble.textContent = UI.helpText;

    panel.setAttribute('aria-label', UI.aria.panel);
    $('letterLabel').textContent = UI.letterLabel;
    $('letterTitle').textContent = UI.letterTitle;
    $('letterSub').textContent = C.letter.subtitle;
    $('letterFrom').textContent = fill(UI.letterFrom);
    letterCard.setAttribute('aria-label', UI.aria.letter + ': ' + UI.letterTitle);
    $('voiceTitle').textContent = UI.voiceTitle;
    $('voiceHint').textContent = UI.voiceHint;
    $('bouquetTitle').textContent = UI.bouquetTitle;
    $('bouquetFrom').textContent = fill(UI.bouquetFrom);
    $('player').setAttribute('aria-label', UI.aria.player);
    seek.setAttribute('aria-label', UI.aria.seek);
    lyricsEl.setAttribute('aria-label', UI.aria.lyrics || 'Letra');

    modalTitle.textContent = UI.letterTitle;
    String(C.letter.body).split(/\n\s*\n/).forEach((para) => {
      const p = document.createElement('p');
      p.textContent = para.trim();
      modalBody.appendChild(p);
    });
    modalSign.textContent = '— ' + (C.from || UI.firma);
    modalClose.setAttribute('aria-label', UI.aria.close);
  }

  function buildTracklist() {
    C.tracks.forEach((t, i) => {
      const li = document.createElement('li');
      li.className = 'track';
      const n = document.createElement('span');
      n.className = 'track__n';
      n.textContent = t.n || String(i + 1).padStart(2, '0');
      const text = document.createElement('span');
      text.className = 'track__text';
      const ti = document.createElement('span');
      ti.className = 'track__title';
      ti.textContent = t.title;
      const ar = document.createElement('span');
      ar.className = 'track__artist';
      ar.textContent = t.artist;
      text.append(ti, ar);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'track__btn';
      btn.innerHTML = ICON_PLAY + ICON_PAUSE;
      li.append(n, text, btn);
      li.addEventListener('click', () => toggleTrack(i));
      tracklist.appendChild(li);
      trackRows.push({ el: li, btn });
    });
  }

  let IMG_EXT = '.png';
  function supportsWebP() {
    return new Promise((resolve) => {
      const im = new Image();
      im.onload = () => resolve(im.width === 1);
      im.onerror = () => resolve(false);
      im.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
    });
  }

  const imageCache = [];
  function preload(src) {
    const im = new Image();
    im.decoding = 'async';
    im.src = src;
    imageCache.push(im);
    return im.decode ? im.decode().catch(() => {}) : new Promise((r) => { im.onload = im.onerror = r; });
  }

  function bindEvents() {
    envelope.addEventListener('click', () => {
      if (state.screen === 'ENVELOPE') go('BLOOMING');
    });
    cassette.addEventListener('click', () => toggleTrack());
    cassette.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleTrack();
      }
    });
    playerPlay.addEventListener('click', () => toggleTrack());
    finishBtn.addEventListener('click', () => go('FINISHING'));
    heart.addEventListener('click', onMoreClick);
    pill.addEventListener('click', onMoreClick);
    letterCard.addEventListener('click', () => go('LETTER_MODAL'));
    modalClose.addEventListener('click', () => go('PANEL_OPEN'));
    modalOverlay.addEventListener('click', () => go('PANEL_OPEN'));
    helpBtn.addEventListener('click', () => setHelp(!helpOpen));

    // Clic fuera: cierra la ayuda y el panel
    document.addEventListener('pointerdown', (e) => {
      const t = e.target;
      if (helpOpen && !help.contains(t)) setHelp(false);
      if (state.screen === 'PANEL_OPEN' && !panel.contains(t) && !heart.contains(t) && !pill.contains(t) && !help.contains(t)) {
        go('MAIN');
      }
    }, true);

    document.addEventListener('keydown', (e) => {
      if (sheet.isOpen) {
        if (e.key === 'Escape') { e.preventDefault(); sheet.shut(); }
        else if (e.key === 'Tab') trapFocus(e, sheet.paper);
        return;
      }
      if (e.key === 'Escape') {
        if (helpOpen) setHelp(false);
        else if (state.screen === 'LETTER_MODAL') go('PANEL_OPEN');
        else if (state.screen === 'PANEL_OPEN') go('MAIN');
        return;
      }
      if (e.key === 'Tab') {
        if (state.screen === 'LETTER_MODAL') trapFocus(e, modalSheet);
        else if (state.screen === 'PANEL_OPEN') trapFocus(e, panel);
        return;
      }
      if (e.key === 'Enter' || e.key === ' ') {
        const t = e.target;
        if (t && t.closest && t.closest('button, a, input, textarea, select, [role="slider"], .cassette')) return;
        if (state.screen === 'ENVELOPE') {
          e.preventDefault();
          go('BLOOMING');
        } else if (state.screen === 'FLOWER_WALL' || state.screen === 'FLOWER_WALL_END') {
          e.preventDefault();
          go('MAIN');
        }
      }
    });

    window.addEventListener('resize', () => {
      if (panelOpen) layoutBouquet();
      renderLyrics();
    });
  }

  /* ==========================================================================
     LOADING
     ========================================================================== */
  async function boot() {
    applyTexts();
    buildTracklist();
    buildLove();
    setupVoice();
    setupVideo();
    setupMediaSession();
    bindEvents();
    render('LOADING');

    const webp = await supportsWebP();
    IMG_EXT = webp ? '.webp' : '.png';
    const I = C.images;
    const src = (name) => I.dir + name + IMG_EXT;
    envClosed.src = src(I.envelopeClosed);
    envOpen.src = src(I.envelopeOpen);
    cassetteImg.src = src(I.cassette);
    if (I.cassetteInside) cassetteInside.src = src(I.cassetteInside);
    else cassetteInside.remove();
    reelL.src = reelR.src = src(I.reel);
    bouquetImg.src = src(I.bouquet);
    if (love.jarImg && I.jar) love.jarImg.src = src(I.jar);
    if (love.ringClosed && I.ringClosed) love.ringClosed.src = src(I.ringClosed);
    if (love.ringOpen && I.ringOpen) love.ringOpen.src = src(I.ringOpen);
    const minis = I.miniEnvelopes || [];
    for (const m of love.minis) if (minis.length) m.img.src = src(minis[m.v % minis.length]);
    const bg = I.dir + I.background + (webp ? '.webp' : '.jpg');
    room.style.backgroundImage = 'url("' + bg + '")';

    loadTrack(0);

    const images = [src(I.envelopeClosed), src(I.envelopeOpen), src(I.cassette), src(I.reel), src(I.bouquet), bg];
    if (I.cassetteInside) images.push(src(I.cassetteInside));
    for (let n = 1; n <= I.flowerCount; n++) images.push(flowerSrc(n));
    const meta = new Promise((resolve) => {
      if (song.readyState >= 1) return resolve();
      song.addEventListener('loadedmetadata', resolve, { once: true });
      song.addEventListener('error', resolve, { once: true });
    });
    const fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    await Promise.race([Promise.all([...images.map(preload), meta, fonts]), wait(8000)]);
    go('ENVELOPE');
  }

  // Ayuda para pruebas automáticas (solo lectura)
  window.mixtape = {
    get screen() { return state.screen; },
    get audio() { return { ...audio, time: song.currentTime, duration: song.duration, volume: songGain ? songGain.gain.value : song.volume }; },
    seek(t) { song.currentTime = t; },
  };

  if (!gsap) {
    console.error('GSAP no cargó: revisa la conexión o js/vendor/gsap.min.js');
    return;
  }
  boot();
})();
