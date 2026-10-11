// Une lettre pour Kim : l'enveloppe à ouvrir, la lettre qui s'écrit, puis les surprises.
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const g = window.gsap;
  if (g) g.registerPlugin(ScrollTrigger, SplitText);
  const memoire = {
    lire(k, d) { try { return JSON.parse(localStorage.getItem('lettreKim.' + k)) ?? d; } catch { return d; } },
    ecrire(k, v) { try { localStorage.setItem('lettreKim.' + k, JSON.stringify(v)); } catch {} },
  };

  /* ---------- le ciel : poussière dorée et petits cœurs qui montent ---------- */
  const ciel = $('#ciel'), ctx = ciel.getContext('2d');
  let W = 0, H = 0, dpr = 1, grains = [];
  function taille() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    ciel.width = W * dpr; ciel.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(70, W * H / 14000));
    grains = Array.from({ length: n }, (_, i) => nouveau(true, i));
  }
  function nouveau(partout, i = 0) {
    return { x: Math.random() * W, y: partout ? Math.random() * H : H + 20, r: .6 + Math.random() * 1.8,
      v: .12 + Math.random() * .35, o: Math.random() * Math.PI * 2, coeur: i % 9 === 0, t: 4 + Math.random() * 5 };
  }
  function coeur(x, y, t) {
    ctx.beginPath();
    ctx.moveTo(x, y + t * .3);
    ctx.bezierCurveTo(x, y, x - t * .5, y, x - t * .5, y + t * .3);
    ctx.bezierCurveTo(x - t * .5, y + t * .6, x, y + t * .8, x, y + t);
    ctx.bezierCurveTo(x, y + t * .8, x + t * .5, y + t * .6, x + t * .5, y + t * .3);
    ctx.bezierCurveTo(x + t * .5, y, x, y, x, y + t * .3);
    ctx.fill();
  }
  let dernier = 0;
  function dessiner(ms) {
    requestAnimationFrame(dessiner);
    if (document.hidden || ms - dernier < 30) return;
    dernier = ms;
    ctx.clearRect(0, 0, W, H);
    for (const p of grains) {
      p.y -= p.v; p.o += .02; p.x += Math.sin(p.o) * .25;
      if (p.y < -20) Object.assign(p, nouveau(false));
      const a = .25 + .35 * (1 + Math.sin(p.o * 1.7)) / 2;
      if (p.coeur) { ctx.fillStyle = `rgba(244,169,191,${a * .7})`; coeur(p.x, p.y, p.t); }
      else { ctx.fillStyle = `rgba(230,196,127,${a})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); }
    }
  }
  taille(); addEventListener('resize', taille);
  if (!reduit) requestAnimationFrame(dessiner); else dessiner(100);

  /* ---------- la boîte à musique (mélodie originale, Web Audio) ---------- */
  const son = $('#son');
  let audio = null, coupe = false, prochaine = 0, pas = 0, minuteur = 0;
  const NOTES = { C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880, B5: 987.77, C6: 1046.5, D6: 1174.66, E6: 1318.5, G4: 392, A4: 440, C4: 261.63, F4: 349.23, E4: 329.63 };
  const MELODIE = ['E5','G5','C6','G5','E5','G5','D6','C6', 'A4','C5','E5','A5','G5','E5','C5','E5',
                   'F4','A4','C5','F5','E5','C5','A4','C5', 'G4','B5','D6','B5','G5','D5','G5','B5'];
  function demarrerMusique() {
    if (audio || coupe) return;
    try {
      audio = new (window.AudioContext || window.webkitAudioContext)();
      const sortie = audio.createGain(); sortie.gain.value = .055;
      const filtre = audio.createBiquadFilter(); filtre.type = 'lowpass'; filtre.frequency.value = 3800;
      const echo = audio.createDelay(); echo.delayTime.value = .36;
      const retour = audio.createGain(); retour.gain.value = .32;
      filtre.connect(sortie); filtre.connect(echo); echo.connect(retour); retour.connect(echo); retour.connect(sortie);
      sortie.connect(audio.destination);
      audio._entree = filtre; audio._sortie = sortie;
      prochaine = audio.currentTime + .1;
      planifier();
    } catch { audio = null; }
  }
  function note(f, t, fort) {
    for (const [type, mult, vol] of [['triangle', 1, 1], ['sine', 2, .25]]) {
      const o = audio.createOscillator(), gn = audio.createGain();
      o.type = type; o.frequency.value = f * mult;
      gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime(vol * fort, t + .008);
      gn.gain.exponentialRampToValueAtTime(.0001, t + 1.6);
      o.connect(gn); gn.connect(audio._entree); o.start(t); o.stop(t + 1.7);
    }
  }
  function planifier() {
    while (prochaine < audio.currentTime + .4) {
      note(NOTES[MELODIE[pas % MELODIE.length]], prochaine, pas % 8 === 0 ? 1 : .7);
      if (pas % 8 === 0) note(NOTES[['C4', 'A4', 'F4', 'G4'][Math.floor(pas / 8) % 4]] / 2, prochaine, .6);
      prochaine += 60 / 76 / 2; pas++;
    }
    minuteur = setTimeout(planifier, 120);
  }
  son.addEventListener('click', () => {
    coupe = !coupe;
    son.classList.toggle('coupe', coupe);
    son.setAttribute('aria-label', coupe ? 'Remettre la musique' : 'Couper la musique');
    if (!audio) { if (!coupe) demarrerMusique(); return; }
    audio._sortie.gain.setTargetAtTime(coupe ? 0 : .055, audio.currentTime, .15);
  });

  /* ---------- l'ouverture ---------- */
  const sceau = $('#sceau'), intro = $('#intro'), contenu = $('#contenu');
  sceau.addEventListener('click', ouvrir, { once: true });
  function ouvrir() {
    demarrerMusique();
    son.hidden = false;
    $('#indice').style.visibility = 'hidden';
    sceau.style.animation = 'none';
    if (!g || reduit) { montrer(); return; }
    const tl = g.timeline({ defaults: { ease: 'power2.inOut' }, onComplete: montrer });
    tl.to('.sceau-k', { opacity: 0, duration: .15 })
      .to('.moitie.gauche', { x: -36, y: 150, rotation: -38, opacity: 0, duration: .9, ease: 'power2.in' }, 0)
      .to('.moitie.droite', { x: 36, y: 150, rotation: 34, opacity: 0, duration: .9, ease: 'power2.in' }, 0)
      .to('#rabat', { rotationX: 180, duration: .9 }, .25)
      .set('#rabat', { zIndex: -1 }, .7)
      .to('#mini-papier', { yPercent: -58, duration: .9, ease: 'power3.out' }, 1)
      .to('.intro-haut', { opacity: 0, y: -20, duration: .6 }, 1.3)
      .to('#enveloppe', { y: 40, scale: .92, opacity: 0, duration: .7, ease: 'power2.in' }, 1.9);
  }
  function montrer() {
    intro.hidden = true;
    contenu.hidden = false;
    document.body.classList.remove('ferme');
    scrollTo(0, 0);
    if (!g || reduit) { demarrerTout(); return; }
    $('#lettre').classList.add('attend');
    g.fromTo('#lettre', { scaleY: .12, opacity: 0, y: 40 }, { scaleY: 1, opacity: 1, y: 0, duration: 1.1, ease: 'power3.out' });
    document.fonts.ready.then(() => { ecrireLettre(); demarrerTout(); });
  }

  /* ---------- la lettre qui s'écrit ligne par ligne ----------
     Un paragraphe s'écrit quand le précédent est fini ET qu'il est à l'écran.
     Toucher la lettre accélère l'écriture. */
  function ecrireLettre() {
    const lettre = $('#lettre');
    g.from('.lettre-date', { opacity: 0, x: 20, duration: .8, delay: .9 });
    const lignes = [];
    let file = new Promise(r => setTimeout(r, 1200));
    let vitesse = 1;
    $$('#lettre .ligne').forEach(p => {
      const decoupe = new SplitText(p, { type: 'lines', mask: 'lines', linesClass: 'l' });
      const tl = g.timeline({ paused: true, onComplete: () => decoupe.revert() });
      decoupe.lines.forEach(l => {
        const duree = Math.min(1.1, .25 + l.textContent.length * .019);
        tl.fromTo(l, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: duree, ease: 'none' });
      });
      lignes.push(tl);
      const visible = new Promise(r => ScrollTrigger.create({ trigger: p, start: 'top 88%', once: true, onEnter: r }));
      file = file.then(() => visible).then(() => new Promise(r => { tl.eventCallback('onComplete', () => { decoupe.revert(); r(); }); tl.timeScale(vitesse).play(); }));
    });
    lettre.classList.remove('attend');
    lettre.addEventListener('click', () => { vitesse = 4; lignes.forEach(t => t.timeScale(4)); });
    const sig = $('.signature-coeur path');
    const L = sig.getTotalLength();
    g.set(sig, { strokeDasharray: L, strokeDashoffset: L });
    ScrollTrigger.create({
      trigger: '.signature', start: 'top 88%', once: true,
      onEnter: () => g.timeline().from('.signature', { opacity: 0, x: 20, duration: .8 }).to(sig, { strokeDashoffset: 0, duration: 1.4, ease: 'power1.inOut' }, '-=.2'),
    });
  }

  /* ---------- tout le reste ---------- */
  function demarrerTout() {
    compteur();
    if (g && !reduit) apparitions();
    raisons(); envies(); ouvreQuand();
    $('#relire').addEventListener('click', () => scrollTo({ top: 0, behavior: reduit ? 'auto' : 'smooth' }));
  }

  function apparitions() {
    $$('.apparait').forEach(e => g.from(e, { opacity: 0, y: 30, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: e, start: 'top 88%', once: true } }));
    g.from('#suite', { opacity: 0, duration: 1, delay: 4 });
    // le fil doré de la frise se dessine au défilement
    const frise = $('#frise');
    ScrollTrigger.create({ trigger: frise, start: 'top 70%', end: 'bottom 60%', scrub: .6,
      onUpdate: s => frise.style.setProperty('--fil', s.progress.toFixed(3)) });
    $$('.etape').forEach(e => g.from(e, { opacity: 0, x: 24, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: e, start: 'top 85%', once: true } }));
    g.from('.carte', { opacity: 0, y: 40, rotation: () => g.utils.random(-6, 6), duration: .8, stagger: .08, ease: 'back.out(1.6)', scrollTrigger: { trigger: '#raisons', start: 'top 80%', once: true } });
    g.from('#promesses li', { opacity: 0, x: -30, duration: .7, stagger: .18, ease: 'power3.out', scrollTrigger: { trigger: '#promesses', start: 'top 80%', once: true } });
    g.from('.envie', { opacity: 0, scale: .8, duration: .6, stagger: .06, ease: 'back.out(2)', scrollTrigger: { trigger: '#envies', start: 'top 82%', once: true } });
    g.from('.mini-env', { opacity: 0, y: 30, rotation: () => g.utils.random(-8, 8), duration: .8, stagger: .12, ease: 'back.out(1.6)', scrollTrigger: { trigger: '#quand', start: 'top 82%', once: true } });
    // le final : un cœur qui se dessine, puis « Je t'aime » lettre par lettre
    const path = $('#grand-coeur path'), L = path.getTotalLength();
    g.set(path, { strokeDasharray: L, strokeDashoffset: L });
    const jtm = new SplitText('#jtm', { type: 'chars' });
    g.set(jtm.chars, { opacity: 0, y: 30, rotation: -12 });
    ScrollTrigger.create({ trigger: '#final', start: 'top 65%', once: true, onEnter: () => {
      g.timeline()
        .to(path, { strokeDashoffset: 0, duration: 2, ease: 'power1.inOut' })
        .to('#grand-coeur', { scale: 1.08, duration: .25, yoyo: true, repeat: 3, ease: 'sine.inOut' }, '-=.2');
    } });
    ScrollTrigger.create({ trigger: '#jtm', start: 'top 85%', once: true, onEnter: () => {
      g.to(jtm.chars, { opacity: 1, y: 0, rotation: 0, duration: .7, stagger: .09, ease: 'back.out(2.2)' });
      pluieDeCoeurs($('#jtm'), 26);
    } });
  }

  /* ---------- compteur depuis le 26 septembre ---------- */
  function compteur() {
    const debut = new Date(2026, 8, 26, 0, 0, 0).getTime();
    const champs = ['jours', 'heures', 'minutes', 'secondes'].map(k => $('#c-' + k));
    const maj = () => {
      let s = Math.max(0, Math.floor((Date.now() - debut) / 1000));
      const v = [Math.floor(s / 86400), Math.floor(s % 86400 / 3600), Math.floor(s % 3600 / 60), s % 60];
      champs.forEach((c, i) => { c.textContent = v[i]; });
    };
    maj(); setInterval(maj, 1000);
  }

  /* ---------- cartes à retourner ---------- */
  function raisons() {
    const cartes = $$('.carte'), compte = $('#compte-raisons');
    const vues = new Set(memoire.lire('cartes', []));
    const maj = () => { compte.textContent = vues.size === cartes.length ? 'Toutes retournées 💗' : `${vues.size} / ${cartes.length} cartes retournées`; };
    cartes.forEach((c, i) => {
      c.addEventListener('click', () => {
        const r = c.classList.toggle('retournee');
        c.setAttribute('aria-pressed', String(r));
        if (r && !vues.has(i)) { vues.add(i); memoire.ecrire('cartes', [...vues]); if (vues.size === cartes.length) pluieDeCoeurs(c, 18); }
        maj();
      });
    });
    maj();
  }

  /* ---------- envies + tirage du prochain rendez-vous ---------- */
  function envies() {
    const btns = $$('.envie'), choisies = new Set(memoire.lire('envies', []));
    btns.forEach(b => {
      if (choisies.has(b.dataset.id)) b.setAttribute('aria-pressed', 'true');
      b.addEventListener('click', () => {
        const on = b.getAttribute('aria-pressed') !== 'true';
        b.setAttribute('aria-pressed', String(on));
        on ? choisies.add(b.dataset.id) : choisies.delete(b.dataset.id);
        memoire.ecrire('envies', [...choisies]);
      });
    });
    const tirer = $('#tirer'), res = $('#resultat');
    tirer.addEventListener('click', () => {
      const pool = btns.filter(b => b.getAttribute('aria-pressed') === 'true');
      const candidats = pool.length ? pool : btns;
      const gagnant = candidats[Math.floor(Math.random() * candidats.length)];
      tirer.disabled = true; res.hidden = true;
      let k = 0; const tours = reduit ? 0 : 14 + candidats.length;
      const suivant = () => {
        btns.forEach(b => b.classList.remove('eclaire'));
        if (k >= tours) {
          gagnant.classList.add('eclaire');
          $('#resultat-texte').textContent = gagnant.textContent;
          res.hidden = false; tirer.disabled = false; tirer.textContent = 'Tirer à nouveau';
          if (g && !reduit) g.from(res, { opacity: 0, y: 20, scale: .95, duration: .6, ease: 'back.out(1.8)' });
          pluieDeCoeurs(res, 20);
          res.scrollIntoView({ behavior: reduit ? 'auto' : 'smooth', block: 'center' });
          return;
        }
        const c = k === tours - 1 ? gagnant : candidats[k % candidats.length];
        c.classList.add('eclaire');
        k++;
        setTimeout(suivant, 70 + k * k * 1.6);
      };
      suivant();
    });
  }

  /* ---------- ouvre quand ---------- */
  function ouvreQuand() {
    const lues = new Set(memoire.lire('quand', []));
    const note = $('#note');
    $$('.mini-env').forEach((b, i) => {
      if (lues.has(i)) b.classList.add('lue');
      b.addEventListener('click', () => {
        $('#note-titre').textContent = 'Ouvre quand ' + b.dataset.titre;
        $('#note-texte').textContent = b.dataset.texte;
        if (note.showModal) note.showModal(); else note.setAttribute('open', '');
        lues.add(i); memoire.ecrire('quand', [...lues]); b.classList.add('lue');
      });
    });
    note.addEventListener('click', e => { if (e.target === note) note.close(); });
  }

  /* ---------- petite pluie de cœurs autour d'un élément ---------- */
  function pluieDeCoeurs(el, n) {
    if (!g || reduit) return;
    const r = el.getBoundingClientRect();
    for (let i = 0; i < n; i++) {
      const c = document.createElement('span');
      c.textContent = '♥';
      Object.assign(c.style, { position: 'fixed', left: r.left + r.width / 2 + 'px', top: r.top + r.height / 2 + 'px', zIndex: 30,
        pointerEvents: 'none', color: i % 3 ? '#f4a9bf' : '#e6c47f', fontSize: 12 + Math.random() * 16 + 'px' });
      document.body.appendChild(c);
      g.to(c, { x: g.utils.random(-160, 160), y: g.utils.random(-220, 40), rotation: g.utils.random(-90, 90), opacity: 0,
        duration: g.utils.random(1.1, 1.9), ease: 'power2.out', onComplete: () => c.remove() });
    }
  }
})();
