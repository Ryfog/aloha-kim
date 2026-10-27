/* Un message de Stitch — pour Kim.
   Écran verrouillé → Stitch avoue qu'il a croqué le billet du Futuroscope → 3 morceaux de magie à retrouver
   (les étoiles, le vœu, la brume) → un billet à gratter → la fête. Rien ne dit « Disney » avant le grattage. */
(() => {
'use strict';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const attendre = ms => new Promise(r => setTimeout(r, ms));
const hasard = (a, b) => a + Math.random() * (b - a);
const DPR = Math.min(window.devicePixelRatio || 1, 1.6);
const vibrer = motif => { try { navigator.vibrate && navigator.vibrate(motif); } catch (e) {} };
const CLE = 'kim626';
const memoire = {
  lire() { try { return JSON.parse(localStorage.getItem(CLE)) || {}; } catch (e) { return {}; } },
  ecrire(o) { try { localStorage.setItem(CLE, JSON.stringify(Object.assign(this.lire(), o))); } catch (e) {} },
  effacer() { try { localStorage.removeItem(CLE); } catch (e) {} },
};

/* ================= pas de son (à sa demande) : les appels restent, ils ne font rien ================= */
const Son = new Proxy({}, { get: () => () => {} });

/* ================= le ciel étoilé + parallaxe ================= */
const Ciel = (() => {
  const c = $('#ciel'), x = c.getContext('2d'); let L, H, etoiles = [], filantes = [], t0 = performance.now(), leger = false;
  function taille() {
    L = innerWidth; H = innerHeight; c.width = Math.round(L * DPR); c.height = Math.round(H * DPR); x.setTransform(DPR, 0, 0, DPR, 0, 0);
    const n = leger ? 90 : Math.round(Math.min(220, L * H / 2600));
    etoiles = Array.from({ length: n }, () => ({ x: Math.random() * L, y: Math.random() * H * .72, r: hasard(.4, 1.6), p: Math.random() * 6.28, v: hasard(.6, 2.2), z: hasard(.2, 1) }));
  }
  function dessine(t) {
    x.clearRect(0, 0, L, H);
    const st = document.documentElement.style, px = +st.getPropertyValue('--px') || 0, py = +st.getPropertyValue('--py') || 0;
    for (const e of etoiles) {
      const a = .45 + .55 * Math.sin(e.p + t / 1000 * e.v);
      x.globalAlpha = Math.max(.08, a); x.fillStyle = '#fff';
      x.beginPath(); x.arc(e.x - px * 8 * e.z, e.y - py * 6 * e.z, e.r, 0, 6.283); x.fill();
    }
    if (!leger && Math.random() < .004) filantes.push({ x: hasard(L * .1, L * .9), y: hasard(0, H * .3), vx: hasard(-6, -3), vy: hasard(2, 3.5), vie: 1 });
    filantes = filantes.filter(f => f.vie > 0);
    for (const f of filantes) {
      const g = x.createLinearGradient(f.x, f.y, f.x - f.vx * 12, f.y - f.vy * 12);
      g.addColorStop(0, 'rgba(255,255,255,' + f.vie + ')'); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.globalAlpha = 1; x.strokeStyle = g; x.lineWidth = 1.6; x.beginPath(); x.moveTo(f.x, f.y); x.lineTo(f.x - f.vx * 12, f.y - f.vy * 12); x.stroke();
      f.x += f.vx; f.y += f.vy; f.vie -= .018;
    }
    x.globalAlpha = 1;
  }
  let derniere = 0;
  function boucle(t) {
    // 30 images par seconde suffisent pour un ciel qui scintille
    if (t - derniere > 32) { derniere = t; dessine(t); }
    requestAnimationFrame(boucle);
  }
  addEventListener('resize', taille);
  taille(); requestAnimationFrame(boucle);
  return { alleger() { leger = true; taille(); } };
})();

const Parallaxe = (() => {
  const r = document.documentElement.style; let cx = 0, cy = 0, gx = null, gy = null, ecoute = false;
  function poser(a, b) { cx += (a - cx) * .12; cy += (b - cy) * .12; r.setProperty('--px', cx.toFixed(3)); r.setProperty('--py', cy.toFixed(3)); }
  addEventListener('pointermove', e => { if (gx === null) poser(e.clientX / innerWidth * 2 - 1, e.clientY / innerHeight * 2 - 1); }, { passive: true });
  function surInclinaison(e) {
    if (e.gamma == null) return;
    gx = Math.max(-1, Math.min(1, e.gamma / 30)); gy = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
    poser(gx, gy); window.dispatchEvent(new CustomEvent('inclinaison', { detail: { x: gx, y: gy } }));
  }
  async function activer() {
    if (ecoute) return true;
    try {
      if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function') {
        const rep = await DeviceOrientationEvent.requestPermission(); if (rep !== 'granted') return false;
      }
      addEventListener('deviceorientation', surInclinaison); ecoute = true; return true;
    } catch (e) { return false; }
  }
  // Android : pas de permission à demander, on écoute tout de suite
  if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission !== 'function') { addEventListener('deviceorientation', surInclinaison); ecoute = true; }
  return { activer };
})();

/* ================= mode léger (téléphone qui rame) ================= */
let LEGER = /[?&]leger=1/.test(location.search);
if (!LEGER && !/[?&]leger=0/.test(location.search)) {
  let n = 0; const t0 = performance.now();
  const mesure = t => { n++; if (t - t0 < 2600) requestAnimationFrame(mesure); else if (n / ((t - t0) / 1000) < 32) { LEGER = true; document.documentElement.classList.add('leger'); Ciel.alleger(); } };
  requestAnimationFrame(mesure);
}

/* ================= les scènes ================= */
let sceneActuelle = 'verrou';
async function aller(nom) {
  const avant = $('#s-' + sceneActuelle), apres = $('#s-' + nom);
  if (avant && avant !== apres) { avant.classList.add('sort'); await attendre(420); avant.hidden = true; avant.classList.remove('sort'); }
  apres.hidden = false; apres.classList.remove('entre'); void apres.offsetWidth; apres.classList.add('entre');
  sceneActuelle = nom;
  document.body.classList.toggle('chasse', ['etoiles', 'voeu', 'brume', 'billet', 'fete'].includes(nom));
  $('#inventaire').hidden = !['etoiles', 'voeu', 'brume'].includes(nom);
  if (['etoiles', 'voeu', 'brume', 'billet', 'fete'].includes(nom)) memoire.ecrire({ scene: nom });
  if (SCENES[nom]) SCENES[nom]();
}
const SCENES = {};

/* ================= 0 · écran verrouillé ================= */
function horloge() {
  const d = new Date();
  $('#heure').textContent = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  $('#date').textContent = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}
horloge(); setInterval(horloge, 15000);

let ouvert = false;
async function ouvrir() {
  if (ouvert) return; ouvert = true; Son.init(); Son.souffle(); vibrer(20);
  const m = memoire.lire();
  if (m.scene && m.scene !== 'verrou') {
    // elle revient : on reprend là où elle s'était arrêtée
    (m.morceaux || []).forEach(i => $$('.case')[i] && $$('.case')[i].classList.add('pleine'));
    return aller(m.scene);
  }
  aller('discussion');
}
(() => {
  const zone = $('#s-verrou'); let y0 = null;
  zone.addEventListener('pointerdown', e => { y0 = e.clientY; Son.init(); });
  zone.addEventListener('pointermove', e => {
    if (y0 === null) return; const d = Math.max(0, y0 - e.clientY);
    $('.verrou-haut').style.transform = `translateY(${-d * .4}px)`; $('.verrou-haut').style.opacity = 1 - d / 300;
    if (d > 110) { y0 = null; ouvrir(); }
  });
  const fin = () => { if (y0 !== null && !ouvert) { $('.verrou-haut').style.transform = ''; $('.verrou-haut').style.opacity = ''; } y0 = null; };
  zone.addEventListener('pointerup', fin); zone.addEventListener('pointercancel', fin);
  $('#notif').addEventListener('click', ouvrir);
})();

/* ================= 1 · la discussion ================= */
const fil = $('#fil'), reponses = $('#reponses');
function defiler() { fil.scrollTo({ top: fil.scrollHeight, behavior: 'smooth' }); }
async function ecrit(ms) {
  $('#statut').textContent = 'écrit…';
  const b = document.createElement('div'); b.className = 'bulle ecrit'; b.innerHTML = '<i></i><i></i><i></i>'; fil.appendChild(b); defiler();
  await attendre(ms); b.remove(); $('#statut').textContent = 'en ligne';
}
async function dit(texte, pause) {
  await ecrit(pause != null ? pause : 500 + texte.length * 22);
  const b = document.createElement('div'); b.className = 'bulle'; b.textContent = texte; fil.appendChild(b); Son.pop(); defiler();
  await attendre(250);
  return b;
}
function choix(options) {
  return new Promise(res => {
    reponses.innerHTML = '';
    options.forEach(t => {
      const o = document.createElement('button'); o.type = 'button'; o.className = 'reponse'; o.textContent = t;
      o.addEventListener('click', () => {
        reponses.innerHTML = '';
        const b = document.createElement('div'); b.className = 'bulle moi'; b.textContent = t; fil.appendChild(b); Son.envoi(); vibrer(15); defiler();
        res(t);
      }, { once: true });
      reponses.appendChild(o);
    });
  });
}

// le billet du Futuroscope dans une bulle, dessiné dans un canvas pour pouvoir le croquer
let billetCanvas = null, billetImg = null;
function billetDansBulle() {
  return new Promise(async res => {
    await ecrit(900);
    const b = document.createElement('div'); b.className = 'bulle image';
    const cv = document.createElement('canvas'); b.appendChild(cv); fil.appendChild(b);
    const img = new Image(); img.src = '../voyage/img/billet.webp';
    const poser = () => {
      cv.width = 900; cv.height = Math.round(900 * img.naturalHeight / img.naturalWidth) || 300;
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height); billetCanvas = cv; billetImg = img; Son.pop(); defiler(); res(b);
    };
    if (img.complete && img.naturalWidth) poser(); else { img.onload = poser; img.onerror = () => { cv.width = 900; cv.height = 300; const x = cv.getContext('2d'); x.fillStyle = '#2b3fa8'; x.fillRect(0, 0, 900, 300); x.fillStyle = '#fff'; x.font = 'bold 60px Fredoka'; x.fillText('Billet pour le futur', 60, 170); billetCanvas = cv; res(b); }; }
  });
}
// une bouchée : un demi-cercle dentelé arraché au bord droit + des miettes
function bouchee(k) {
  if (!billetCanvas) return; const x = billetCanvas.getContext('2d'), W = billetCanvas.width, H = billetCanvas.height;
  const cy = H * [.35, .7, .2][k % 3], cx = W - k * W * .16, r = H * .38;
  x.save(); x.globalCompositeOperation = 'destination-out'; x.beginPath();
  for (let a = 0; a <= 64; a++) {
    const ang = Math.PI / 2 + a / 64 * Math.PI; const rr = r * (a % 4 < 2 ? 1 : .86);
    x.lineTo(cx + Math.cos(ang) * rr * .9 + r * .55, cy + Math.sin(ang) * rr);
  }
  x.closePath(); x.fill(); x.restore();
  const bord = billetCanvas.getBoundingClientRect();
  for (let i = 0; i < 14; i++) {
    const m = document.createElement('span'); m.className = 'miette';
    m.style.background = ['#3d5be0', '#9fd8ff', '#ffffff', '#ffcf6b', '#7d4cd9'][i % 5];
    m.style.left = (bord.right - (k * .16 + .1) * bord.width) + 'px'; m.style.top = (bord.top + bord.height * [.35, .7, .2][k % 3]) + 'px';
    document.body.appendChild(m);
    m.animate([{ transform: 'translate(0,0) rotate(0)' }, { transform: `translate(${hasard(-90, 90)}px, ${hasard(160, 420)}px) rotate(${hasard(-400, 400)}deg)`, opacity: 0 }],
      { duration: hasard(700, 1300), easing: 'cubic-bezier(.3,.1,.7,1)' }).onfinish = () => m.remove();
  }
}
async function surgit(type, image, mot) {
  const s = $('#surgit'); $('#surgit-img').src = image; $('#onomato').textContent = mot;
  s.className = 'surgit ' + type; s.hidden = false;
  return s;
}
SCENES.discussion = async () => {
  await attendre(700);
  await dit('Aloha Kim ! 👋', 700);
  await dit('C\'est moi, Stitch 💙 Enzo m\'a confié un truc super important pour toi…');
  await billetDansBulle();
  await dit('Ton billet pour le futur 🚀');
  await ecrit(2200);
  await dit('Sauf que…', 600);
  await dit('j\'avais un tout petit creux 🍪');
  await attendre(500);
  // Stitch surgit de l'écran et croque le billet
  await surgit('croque', 'img/croque.webp', 'CRONCH');
  await attendre(430);
  for (let k = 0; k < 3; k++) { bouchee(k); Son.croque(); vibrer(40); document.body.classList.remove('secousse'); void document.body.offsetWidth; document.body.classList.add('secousse'); await attendre(260); }
  await attendre(700); $('#surgit').hidden = true; document.body.classList.remove('secousse');
  await dit('Oups. 🙊', 500);
  await choix(['STITCH !!! 😱', 'Tu as MANGÉ mon billet ?!']);
  await dit('Ih ! Pas de panique !', 700);
  await dit('De toute façon, le futur c\'était pas assez bien pour toi.');
  await dit('Enzo et moi, on t\'a trouvé une autre destination. Top secret 🤫');
  await dit('Mais je l\'ai un peu… cassé en 3 morceaux 🙈');
  await dit('Tu m\'aides à les retrouver ?');
  await choix(['On y va ! 💙']);
  await attendre(500);
  // Stitch s'écrase contre l'écran pour partir à l'aventure
  await surgit('vitre', 'img/vitre.webp', 'SPLOTCH');
  const reflet = document.createElement('div'); reflet.className = 'reflet-vitre'; document.body.appendChild(reflet);
  await attendre(380); Son.boing(); vibrer([60, 40, 30]);
  await attendre(1750); $('#surgit').hidden = true; reflet.remove();
  memoire.ecrire({ scene: 'etoiles' });
  aller('etoiles');
};

/* ================= les morceaux ================= */
async function ramasser(i, depuis) {
  Son.ramasse(); vibrer([20, 30, 20]);
  const m = memoire.lire(); const liste = new Set(m.morceaux || []); liste.add(i); memoire.ecrire({ morceaux: [...liste] });
  const cible = $$('.case')[i].getBoundingClientRect(), d = depuis.getBoundingClientRect();
  const v = document.createElement('div'); v.className = 'vol'; document.body.appendChild(v);
  const x0 = d.left + d.width / 2 - 27, y0 = d.top - 80, x1 = cible.left + cible.width / 2 - 27, y1 = cible.top + cible.height / 2 - 36;
  await v.animate([
    { transform: `translate(${x0}px, ${y0}px) scale(.2) rotate(-30deg)`, opacity: 0 },
    { transform: `translate(${x0}px, ${y0 - 40}px) scale(1.3) rotate(0)`, opacity: 1, offset: .35 },
    { transform: `translate(${x1}px, ${y1}px) scale(.55) rotate(360deg)`, opacity: 1 },
  ], { duration: 1100, easing: 'cubic-bezier(.4,0,.2,1)' }).finished;
  v.remove(); $$('.case')[i].classList.add('pleine');
}
$$('[data-ramasser]').forEach(b => b.addEventListener('click', async () => {
  b.disabled = true; const i = +b.dataset.ramasser;
  await ramasser(i, b);
  await attendre(250);
  aller(['voeu', 'brume', 'billet'][i]);
}));

/* ================= 2 · le ciel : une constellation en trois ronds ================= */
SCENES.etoiles = () => {
  const c = $('#j-etoiles'), x = c.getContext('2d'); $('#f-etoiles').hidden = true; $('#c-etoiles').style.opacity = 1;
  let L, H, pts = [], allumees = 0, fini = false, etincelles = [];
  const N_COEUR = 30;
  function placer() {
    L = c.clientWidth; H = c.clientHeight; c.width = Math.round(L * DPR); c.height = Math.round(H * DPR); x.setTransform(DPR, 0, 0, DPR, 0, 0);
    const s = Math.min(L * .8, H * .42), ox = (L - s) / 2, oy = H * .17;
    // un cœur, étoile par étoile
    const anciens = pts; pts = [];
    for (let k = 0; k < N_COEUR; k++) {
      const a = k / N_COEUR * Math.PI * 2;
      const hx = 16 * Math.pow(Math.sin(a), 3), hy = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a));
      pts.push({ rond: 0, k, x: ox + (.5 + hx / 36) * s, y: oy + (.48 + hy / 36) * s, allumee: false, t: 0 });
    }
    anciens.forEach((a, i) => { if (pts[i]) pts[i].allumee = a.allumee; });
  }
  function toucher(e) {
    if (fini) return; const b = c.getBoundingClientRect(), mx = e.clientX - b.left, my = e.clientY - b.top;
    for (const p of pts) if (!p.allumee && Math.hypot(p.x - mx, p.y - my) < 30) {
      p.allumee = true; p.t = performance.now(); Son.carillon(allumees); allumees++; vibrer(8);
      for (let i = 0; i < 8; i++) etincelles.push({ x: p.x, y: p.y, vx: hasard(-2, 2), vy: hasard(-2, 2), vie: 1 });
      if (allumees === pts.length) gagne();
    }
  }
  async function gagne() {
    fini = true; $('#c-etoiles').style.opacity = 0; Son.magie(); vibrer([30, 50, 30, 50, 80]);
    await attendre(1500); $('#f-etoiles').hidden = false;
  }
  c.onpointerdown = e => { c.setPointerCapture && c.setPointerCapture(e.pointerId); toucher(e); };
  c.onpointermove = e => { if (e.buttons || e.pointerType === 'touch') toucher(e); };
  function voisins(p) { // relier deux étoiles qui se suivent sur le même rond
    const n = N_COEUR;
    return pts.filter(q => q.rond === p.rond && q !== p && (Math.abs(q.k - p.k) === 1 || Math.abs(q.k - p.k) === n - 1));
  }
  let vivant = true;
  function boucle(t) {
    if (!vivant || sceneActuelle !== 'etoiles') return;
    x.clearRect(0, 0, L, H);
    const lueur = fini ? .55 + .45 * Math.sin(t / 300) : 1;
    x.lineWidth = 2; x.strokeStyle = `rgba(255, 220, 140, ${.7 * lueur})`;
    for (const p of pts) if (p.allumee) for (const q of voisins(p)) if (q.allumee && pts.indexOf(q) > pts.indexOf(p)) { x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(q.x, q.y); x.stroke(); }
    for (const p of pts) {
      const age = p.allumee ? Math.min(1, (t - p.t) / 300) : 0;
      const r = p.allumee ? 4 + 3 * (1 - age) : 2.4;
      x.globalAlpha = p.allumee ? 1 : .45 + .3 * Math.sin(t / 400 + p.x);
      x.fillStyle = p.allumee ? '#ffe39a' : '#ffffff';
      x.beginPath(); x.arc(p.x, p.y, r, 0, 6.283); x.fill();
      if (p.allumee) { x.globalAlpha = .25 * lueur; x.beginPath(); x.arc(p.x, p.y, r * 3.2, 0, 6.283); x.fill(); }
      if (!p.allumee) { x.globalAlpha = .12; x.beginPath(); x.arc(p.x, p.y, 14, 0, 6.283); x.fill(); }
    }
    x.globalAlpha = 1; etincelles = etincelles.filter(s => s.vie > 0);
    for (const s of etincelles) { x.globalAlpha = s.vie; x.fillStyle = '#fff3c0'; x.fillRect(s.x, s.y, 2, 2); s.x += s.vx; s.y += s.vy; s.vie -= .04; }
    x.globalAlpha = 1;
    requestAnimationFrame(boucle);
  }
  placer(); addEventListener('resize', placer); requestAnimationFrame(boucle);
  window.__kim.etoiles = () => pts.map(p => [p.x + c.getBoundingClientRect().left, p.y + c.getBoundingClientRect().top]);
};

/* ================= feux d'artifice (vœu et fête) ================= */
function Feux(canvas) {
  const x = canvas.getContext('2d'); let L, H, fusees = [], parts = [], vivant = true;
  const COUL = ['#ffd36e', '#ff8fc2', '#8fd4ff', '#ffffff', '#b99cff', '#7dffcf'];
  // lueurs pré-calculées (pas de shadowBlur, trop lourd sur téléphone)
  const sprites = COUL.map(col => { const s = document.createElement('canvas'); s.width = s.height = 32; const g = s.getContext('2d'); const r = g.createRadialGradient(16, 16, 0, 16, 16, 16); r.addColorStop(0, '#fff'); r.addColorStop(.25, col); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, 32, 32); return s; });
  function taille() { L = canvas.clientWidth || innerWidth; H = canvas.clientHeight || innerHeight; canvas.width = Math.round(L * DPR); canvas.height = Math.round(H * DPR); x.setTransform(DPR, 0, 0, DPR, 0, 0); }
  taille(); addEventListener('resize', taille);
  function lancer(tx, ty, forme) {
    tx = tx ?? hasard(L * .15, L * .85); ty = ty ?? hasard(H * .12, H * .42);
    fusees.push({ x: tx + hasard(-30, 30), y: H + 10, tx, ty, c: Math.floor(Math.random() * COUL.length), forme: forme || (Math.random() < .25 ? 'coeur' : 'rond') });
    Son.souffle();
  }
  function eclate(f) {
    const n = LEGER ? 46 : 84; Son.boum(.8 + Math.random() * .4); vibrer(25);
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2; let vx, vy;
      if (f.forme === 'coeur') { const tt = a; vx = 16 * Math.pow(Math.sin(tt), 3) * .27; vy = -(13 * Math.cos(tt) - 5 * Math.cos(2 * tt) - 2 * Math.cos(3 * tt) - Math.cos(4 * tt)) * .27; }
      else { const v = hasard(2.8, 5.8); vx = Math.cos(a) * v; vy = Math.sin(a) * v; }
      parts.push({ x: f.x, y: f.y, vx, vy, vie: 1, c: (Math.random() < .2 ? (f.c + 1) % COUL.length : f.c), tr: hasard(.008, .016) });
    }
  }
  function boucle() {
    if (!vivant) return;
    x.globalCompositeOperation = 'destination-out'; x.fillStyle = 'rgba(0,0,0,.28)'; x.fillRect(0, 0, L, H);
    x.globalCompositeOperation = 'lighter';
    fusees = fusees.filter(f => {
      const dy = f.ty - f.y; f.y += dy * .06 - 2; f.x += (f.tx - f.x) * .06;
      x.drawImage(sprites[f.c], f.x - 6, f.y - 6, 12, 12);
      if (f.y <= f.ty + 6) { eclate(f); return false; } return true;
    });
    parts = parts.filter(p => p.vie > 0);
    for (const p of parts) { p.x += p.vx; p.y += p.vy; p.vx *= .97; p.vy = p.vy * .97 + .045; p.vie -= p.tr; const s = 13 * p.vie + 4; x.globalAlpha = Math.max(0, p.vie); x.drawImage(sprites[p.c], p.x - s / 2, p.y - s / 2, s, s); }
    x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
    requestAnimationFrame(boucle);
  }
  requestAnimationFrame(boucle);
  return { lancer, arreter() { vivant = false; x.clearRect(0, 0, L, H); } };
}

/* ================= 3 · le vœu ================= */
SCENES.voeu = () => {
  const etoile = $('#etoile-voeu'), anneau = $('#anneau'); $('#f-voeu').hidden = true;
  etoile.hidden = false; etoile.classList.remove('partie', 'tenue'); anneau.style.strokeDashoffset = 339.3;
  $('#c-voeu').textContent = 'Garde ton doigt sur l\'étoile et fais un vœu…'; $('#c-voeu').style.opacity = 1;
  let tenue = null, progres = 0, etat = 'voeu', note = 0;
  function tenir(t) {
    if (tenue === null || etat !== 'voeu') return;
    progres = Math.min(1, (t - tenue) / 2200); anneau.style.strokeDashoffset = 339.3 * (1 - progres);
    if (progres * 8 > note) { Son.carillon(note++); vibrer(6); }
    if (progres >= 1) { exauce(); return; }
    requestAnimationFrame(tenir);
  }
  etoile.onpointerdown = e => { if (etat !== 'voeu') return; e.preventDefault(); etoile.setPointerCapture && etoile.setPointerCapture(e.pointerId); tenue = performance.now(); note = 0; etoile.classList.add('tenue'); requestAnimationFrame(tenir); };
  const lacher = () => { if (etat !== 'voeu') return; tenue = null; etoile.classList.remove('tenue'); anneau.style.transition = 'stroke-dashoffset .4s'; anneau.style.strokeDashoffset = 339.3; setTimeout(() => anneau.style.transition = '', 420); };
  etoile.onpointerup = lacher; etoile.onpointerleave = lacher; etoile.onpointercancel = lacher;
  async function exauce() {
    etat = 'feux'; etoile.classList.remove('tenue'); etoile.classList.add('partie'); Son.magie(); vibrer([40, 40, 80]);
    $('#c-voeu').style.opacity = 0;
    await attendre(1100); etoile.hidden = true; etat = 'fin';
    await attendre(500); $('#f-voeu').hidden = false;
  }
  window.__kim.voeu = () => etat;
};

/* ================= 4 · la brume ================= */
SCENES.brume = () => {
  const c = $('#j-brume'), x = c.getContext('2d'), pay = $('#paysage'); $('#f-brume').hidden = true;
  c.classList.remove('partie'); pay.classList.remove('allume'); $('#c-brume').style.opacity = 1;
  let L, H, fini = false, dernier = null, compte = 0;
  // la brume est dessinée en 1x : c'est un brouillard, et la mesure du dégagé reste rapide
  function peindre() {
    L = c.clientWidth; H = c.clientHeight; c.width = L; c.height = H;
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(206,196,240,.97)'); g.addColorStop(1, 'rgba(236,222,246,.99)');
    x.fillStyle = g; x.fillRect(0, 0, L, H);
    for (let i = 0; i < 70; i++) {
      const cx = Math.random() * L, cy = Math.random() * H, r = hasard(40, 140);
      const rg = x.createRadialGradient(cx, cy, 0, cx, cy, r); rg.addColorStop(0, `rgba(255,255,255,${hasard(.25, .55)})`); rg.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = rg; x.fillRect(cx - r, cy - r, r * 2, r * 2);
    }
    x.fillStyle = 'rgba(120,100,180,.35)'; x.font = '600 18px Fredoka, sans-serif'; x.textAlign = 'center';
    x.fillText('〰  〰  〰', L / 2, H * .42);
  }
  function effacer(px, py) {
    x.globalCompositeOperation = 'destination-out';
    const r = 46, rg = x.createRadialGradient(px, py, 0, px, py, r); rg.addColorStop(0, 'rgba(0,0,0,1)'); rg.addColorStop(.6, 'rgba(0,0,0,.85)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = rg; x.beginPath(); x.arc(px, py, r, 0, 6.283); x.fill();
    x.globalCompositeOperation = 'source-over';
  }
  function degage() { // part de brume effacée (échantillon d'une grille)
    const d = x.getImageData(0, 0, L, H).data; let vides = 0, tot = 0;
    for (let yy = 4; yy < H; yy += 12) for (let xx = 4; xx < L; xx += 12) { tot++; if (d[(yy * L + xx) * 4 + 3] < 90) vides++; }
    return vides / tot;
  }
  function frotter(e) {
    if (fini) return; const b = c.getBoundingClientRect(), px = e.clientX - b.left, py = e.clientY - b.top;
    if (dernier) { const n = Math.ceil(Math.hypot(px - dernier[0], py - dernier[1]) / 12); for (let k = 1; k <= n; k++) effacer(dernier[0] + (px - dernier[0]) * k / n, dernier[1] + (py - dernier[1]) * k / n); }
    else effacer(px, py);
    dernier = [px, py];
    if (++compte % 8 === 0) { Son.bruit(0, .12, .05, 900, .7); if (degage() > .55) gagne(); }
  }
  async function gagne() {
    fini = true; c.classList.add('partie'); pay.classList.add('allume'); $('#c-brume').style.opacity = 0; Son.magie(); vibrer([30, 40, 30, 40, 90]);
    await attendre(1700); $('#f-brume').hidden = false;
  }
  c.onpointerdown = e => { c.setPointerCapture && c.setPointerCapture(e.pointerId); dernier = null; frotter(e); };
  c.onpointermove = e => { if (e.buttons || e.pointerType === 'touch') frotter(e); };
  c.onpointerup = () => { dernier = null; };
  peindre();
  window.__kim.brume = () => ({ degage: degage(), fini });
};

/* ================= 5 · le billet à gratter ================= */
let billetPret = false;
function holo(ix, iy) { // ix, iy entre -1 et 1
  const b = $('#billet'); b.style.setProperty('--tx', (ix * 10).toFixed(2)); b.style.setProperty('--ty', (-iy * 8).toFixed(2));
  b.style.setProperty('--hx', (50 + ix * 40).toFixed(1) + '%'); b.style.setProperty('--hy', (50 + iy * 40).toFixed(1) + '%');
}
addEventListener('inclinaison', e => { if (billetPret) holo(e.detail.x, e.detail.y); });
SCENES.billet = async () => {
  const b = $('#billet'), c = $('#grattage'), x = c.getContext('2d'), mo = $('#morceaux');
  $('#c-billet').style.opacity = 0; c.classList.remove('fini');
  // couche dorée à gratter, posée AVANT que les morceaux ne se soudent (rien ne dépasse)
  const W = b.clientWidth, H = b.clientHeight; c.width = Math.round(W * DPR); c.height = Math.round(H * DPR);
  const g = x.createLinearGradient(0, 0, c.width, c.height); g.addColorStop(0, '#fff3b0'); g.addColorStop(.45, '#ffd36e'); g.addColorStop(1, '#e0a93a');
  x.fillStyle = g; x.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < 260; i++) { x.fillStyle = `rgba(255,255,255,${hasard(.05, .3)})`; x.fillRect(Math.random() * c.width, Math.random() * c.height, 2 * DPR, 2 * DPR); }
  x.fillStyle = 'rgba(138,90,18,.75)'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.font = `700 ${Math.round(H * .15 * DPR)}px Fredoka, sans-serif`; x.fillText('48,87° N · 2,78° E', c.width / 2, c.height * .44);
  x.font = `600 ${Math.round(H * .085 * DPR)}px Nunito, sans-serif`; x.fillText('gratte pour découvrir où on va', c.width / 2, c.height * .66);
  // empreintes de Stitch
  x.fillStyle = 'rgba(138,90,18,.18)';
  for (const [px, py] of [[.12, .2], [.2, .34], [.84, .72], [.92, .58]]) { x.beginPath(); x.arc(px * c.width, py * c.height, 9 * DPR, 0, 6.283); x.fill(); }
  mo.classList.remove('vole', 'soude'); void mo.offsetWidth; mo.classList.add('vole', 'soude');
  await attendre(400); Son.ramasse(); await attendre(1100); Son.magie(); vibrer([30, 30, 60]);
  await attendre(900);
  $('#c-billet').style.opacity = 1;
  let fini = false, dernier = null, n = 0;
  function trou(px, py) { x.globalCompositeOperation = 'destination-out'; x.beginPath(); x.arc(px, py, 24 * DPR, 0, 6.283); x.fill(); x.globalCompositeOperation = 'source-over'; }
  function gratte(e) {
    if (fini) return; const r = c.getBoundingClientRect(), px = (e.clientX - r.left) * DPR, py = (e.clientY - r.top) * DPR;
    if (dernier) { const k = Math.ceil(Math.hypot(px - dernier[0], py - dernier[1]) / (10 * DPR)); for (let i = 1; i <= k; i++) trou(dernier[0] + (px - dernier[0]) * i / k, dernier[1] + (py - dernier[1]) * i / k); } else trou(px, py);
    dernier = [px, py];
    if (++n % 3 === 0) { Son.gratte(); vibrer(4); }
    if (n % 10 === 0 && part() > .5) revele();
  }
  function part() { const d = x.getImageData(0, 0, c.width, c.height).data; let v = 0, t = 0; for (let i = 3; i < d.length; i += 4 * 97) { t++; if (d[i] < 60) v++; } return v / t; }
  async function revele() {
    fini = true; c.classList.add('fini'); billetPret = true; Son.magie(); vibrer([60, 40, 60, 40, 160]);
    $('#c-billet').style.opacity = 0; $('#t-billet').textContent = '✨';
    await attendre(1600);
    aller('fete');
  }
  c.onpointerdown = e => { c.setPointerCapture && c.setPointerCapture(e.pointerId); dernier = null; gratte(e); };
  c.onpointermove = e => { if (e.buttons || e.pointerType === 'touch') gratte(e); };
  c.onpointerup = () => { dernier = null; };
  // le doigt fait aussi bouger le reflet
  b.onpointermove = e => { const r = b.getBoundingClientRect(); holo((e.clientX - r.left) / r.width * 2 - 1, (e.clientY - r.top) / r.height * 2 - 1); };
  window.__kim.grattage = () => ({ part: part(), fini });
};

/* ================= 6 · la fête ================= */
SCENES.fete = async () => {
  memoire.ecrire({ vu: true });
  billetPret = true;
  // le billet (déjà gratté) rejoint la fête
  const b = $('#billet'); $('#grattage').classList.add('fini'); $('#morceaux').classList.add('soude'); $('#place-billet').appendChild(b);
  // le titre, lettre par lettre
  const h = $('#annonce'); if (!h.dataset.fait) {
    h.dataset.fait = 1; let k = 0;
    const decoupe = noeud => { [...noeud.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const f = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(morceau => {
          if (!morceau) return;
          if (/^\s+$/.test(morceau) && !/ /.test(morceau)) { f.appendChild(document.createTextNode(' ')); return; }
          const mot = document.createElement('span'); mot.style.whiteSpace = 'nowrap'; mot.style.display = 'inline-block';
          [...morceau].forEach(ch => { const s = document.createElement('span'); s.className = 'lettre'; s.textContent = ch === ' ' ? ' ' : ch; s.style.animationDelay = (k++ * .05) + 's'; mot.appendChild(s); });
          f.appendChild(mot);
        });
        n.replaceWith(f);
      }
      else decoupe(n); }); };
    decoupe(h);
  }
  const feux = Feux($('#j-fete'));
  Son.fete();
  for (let k = 0; k < 6; k++) { setTimeout(() => feux.lancer(undefined, undefined, k % 3 === 1 ? 'coeur' : 'rond'), k * 420); }
  const auto = setInterval(() => { if (sceneActuelle !== 'fete') { clearInterval(auto); feux.arreter(); return; } feux.lancer(); }, 1700);
  $('#s-fete').onpointerdown = e => { if (e.target.closest('button')) return; feux.lancer(e.clientX, Math.min(e.clientY, innerHeight * .5)); };
  vibrer([80, 60, 80, 60, 200]);
};
$('#briller').addEventListener('click', async () => {
  const ok = await Parallaxe.activer();
  $('#briller').textContent = ok ? '📱 Penche ton téléphone' : '✨ Passe ton doigt sur le billet';
  Son.magie();
});
$('#revoir').addEventListener('click', () => { memoire.effacer(); location.reload(); });

/* ================= pour les tests ================= */
window.__kim = { scene: () => sceneActuelle, aller, leger: () => LEGER };
})();
