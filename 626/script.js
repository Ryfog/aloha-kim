/* Un message de Raiponce — pour Kim.
   Écran verrouillé → Raiponce casse le billet du Futuroscope d'un coup de poêle → 3 morceaux à retrouver
   (les étoiles, la fleur, la brume) → Raiponce sur son bateau lâche une lanterne : plus on monte, plus sa lumière
   monte → le billet pour Disneyland. Rien ne dit « Disney » avant la toute fin. */
(() => {
'use strict';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const attendre = ms => new Promise(r => setTimeout(r, ms));
const hasard = (a, b) => a + Math.random() * (b - a);
const lisse = (a, b, v) => { const k = Math.max(0, Math.min(1, (v - a) / (b - a))); return k * k * (3 - 2 * k); };
const melange = (a, b, k) => a.map((v, i) => Math.round(v + (b[i] - v) * k));
const rgb = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const DPR = Math.min(window.devicePixelRatio || 1, 1.6);
const vibrer = motif => { try { navigator.vibrate && navigator.vibrate(motif); } catch (e) {} };
const CLE = 'kimRaiponce';
const memoire = {
  lire() { try { return JSON.parse(localStorage.getItem(CLE)) || {}; } catch (e) { return {}; } },
  ecrire(o) { try { localStorage.setItem(CLE, JSON.stringify(Object.assign(this.lire(), o))); } catch (e) {} },
  effacer() { try { localStorage.removeItem(CLE); } catch (e) {} },
};

/* ================= pas de son (à sa demande) : les appels restent, ils ne font rien ================= */
const Son = new Proxy({}, { get: () => () => {} });

/* ================= les lanternes (dessinées une fois, réutilisées partout) ================= */
function dessinerLanterne(g, cx, cy, w, soleil, eteinte) {
  const h = w * 1.18, tw = w, bw = w * .8, r = w * .1;
  g.beginPath();
  g.moveTo(cx - tw / 2, cy - h / 2 + r); g.quadraticCurveTo(cx - tw / 2, cy - h / 2, cx - tw / 2 + r, cy - h / 2);
  g.lineTo(cx + tw / 2 - r, cy - h / 2); g.quadraticCurveTo(cx + tw / 2, cy - h / 2, cx + tw / 2, cy - h / 2 + r);
  g.lineTo(cx + bw / 2, cy + h / 2 - r * .7); g.quadraticCurveTo(cx + bw / 2, cy + h / 2, cx + bw / 2 - r, cy + h / 2);
  g.lineTo(cx - bw / 2 + r, cy + h / 2); g.quadraticCurveTo(cx - bw / 2, cy + h / 2, cx - bw / 2, cy + h / 2 - r * .7);
  g.closePath();
  const gr = g.createLinearGradient(0, cy - h / 2, 0, cy + h / 2);
  if (eteinte) { gr.addColorStop(0, '#b0703a'); gr.addColorStop(1, '#d8a060'); }
  else { gr.addColorStop(0, '#ffab45'); gr.addColorStop(.55, '#ffd27a'); gr.addColorStop(1, '#fff1bd'); }
  g.fillStyle = gr; g.fill();
  if (!eteinte) {
    g.save(); g.clip();
    const rg = g.createRadialGradient(cx, cy + h * .34, 0, cx, cy + h * .34, w * .62);
    rg.addColorStop(0, 'rgba(255,255,236,.95)'); rg.addColorStop(1, 'rgba(255,240,180,0)');
    g.fillStyle = rg; g.fillRect(cx - w, cy - h, w * 2, h * 2); g.restore();
  }
  g.strokeStyle = eteinte ? 'rgba(90,45,15,.4)' : 'rgba(200,100,30,.32)'; g.lineWidth = Math.max(1, w * .03);
  for (const k of [-.22, .22]) { g.beginPath(); g.moveTo(cx + k * tw, cy - h / 2 + 2); g.lineTo(cx + k * bw, cy + h / 2 - 2); g.stroke(); }
  if (soleil) { // le petit soleil peint sur la lanterne
    g.save(); g.translate(cx, cy - h * .05);
    g.fillStyle = g.strokeStyle = eteinte ? 'rgba(90,40,10,.55)' : 'rgba(196,92,24,.72)'; g.lineWidth = w * .035; g.lineCap = 'round';
    g.beginPath(); g.arc(0, 0, w * .11, 0, 6.283); g.fill();
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * 6.283; g.beginPath();
      g.moveTo(Math.cos(a) * w * .16, Math.sin(a) * w * .16);
      g.quadraticCurveTo(Math.cos(a + .35) * w * .23, Math.sin(a + .35) * w * .23, Math.cos(a) * w * .29, Math.sin(a) * w * .29);
      g.stroke();
    }
    g.restore();
  }
}
function spriteLanterne(w, soleil, eteinte) {
  const c = document.createElement('canvas'); c.width = Math.ceil(w * 1.5 * DPR); c.height = Math.ceil(w * 1.6 * DPR);
  const g = c.getContext('2d'); g.scale(DPR, DPR); dessinerLanterne(g, w * .75, w * .8, w, soleil, eteinte); return c;
}
const LUEUR = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, 'rgba(255,238,175,1)'); r.addColorStop(.18, 'rgba(255,200,105,.6)'); r.addColorStop(.5, 'rgba(255,150,60,.16)'); r.addColorStop(1, 'rgba(255,140,50,0)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128); return c;
})();
const PETITE = spriteLanterne(22, false);
// une petite lanterne : la lueur puis le papier (s = largeur du papier)
function petiteLanterne(x, cx, cy, s, a) {
  x.globalAlpha = a * .55; x.drawImage(LUEUR, cx - s * 2.3, cy - s * 2.3, s * 4.6, s * 4.6);
  x.globalAlpha = a; x.drawImage(PETITE, cx - s * .75, cy - s * .8, s * 1.5, s * 1.6);
}

/* ================= le ciel sur le fond d'écran : quelques lanternes qui montent ================= */
const Ciel = (() => {
  const c = $('#ciel'), x = c.getContext('2d'); let L, H, lant = [], points = [], leger = false, pause = false;
  function taille() {
    L = innerWidth; H = innerHeight; c.width = Math.round(L * DPR); c.height = Math.round(H * DPR); x.setTransform(DPR, 0, 0, DPR, 0, 0);
    lant = Array.from({ length: leger ? 8 : 15 }, () => ({ x: Math.random() * L, y: hasard(0, H), s: hasard(3, 8), v: hasard(4, 11), ph: Math.random() * 6.28 }));
    points = Array.from({ length: leger ? 25 : 50 }, () => ({ x: Math.random() * L, y: Math.random() * H * .7, r: hasard(.4, 1.3), ph: Math.random() * 6.28, v: hasard(.6, 2) }));
  }
  let avant = 0, derniere = 0;
  function boucle(t) {
    requestAnimationFrame(boucle);
    if (pause || t - derniere < 32) return; derniere = t;
    const dt = Math.min(.1, (t - (avant || t)) / 1000); avant = t;
    const st = document.documentElement.style, px = +st.getPropertyValue('--px') || 0, py = +st.getPropertyValue('--py') || 0;
    x.clearRect(0, 0, L, H);
    for (const p of points) { x.globalAlpha = Math.max(.05, .3 + .5 * Math.sin(p.ph + t / 1000 * p.v)); x.fillStyle = '#fff'; x.beginPath(); x.arc(p.x - px * 5, p.y - py * 4, p.r, 0, 6.283); x.fill(); }
    for (const l of lant) {
      l.y -= l.v * dt; if (l.y < -30) { l.y = H + 20; l.x = Math.random() * L; }
      const a = Math.min(1, l.y / (H * .25)) * (.8 + .2 * Math.sin(t / 300 + l.ph));
      petiteLanterne(x, l.x + Math.sin(t / 1800 + l.ph) * 6 - px * 10, l.y - py * 8, l.s, Math.max(0, a) * .9);
    }
    x.globalAlpha = 1;
  }
  addEventListener('resize', taille);
  taille(); requestAnimationFrame(boucle);
  return { alleger() { leger = true; taille(); }, pause(v) { pause = v; if (v) x.clearRect(0, 0, L, H); } };
})();

const Parallaxe = (() => {
  const r = document.documentElement.style; let cx = 0, cy = 0, gx = null, ecoute = false;
  function poser(a, b) { cx += (a - cx) * .12; cy += (b - cy) * .12; r.setProperty('--px', cx.toFixed(3)); r.setProperty('--py', cy.toFixed(3)); }
  addEventListener('pointermove', e => { if (gx === null) poser(e.clientX / innerWidth * 2 - 1, e.clientY / innerHeight * 2 - 1); }, { passive: true });
  function surInclinaison(e) {
    if (e.gamma == null) return;
    gx = Math.max(-1, Math.min(1, e.gamma / 30)); const gy = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
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
const CHASSE = ['etoiles', 'voeu', 'brume'];
async function aller(nom) {
  const avant = $('#s-' + sceneActuelle), apres = $('#s-' + nom);
  if (avant && avant !== apres) { avant.classList.add('sort'); await attendre(420); avant.hidden = true; avant.classList.remove('sort'); }
  apres.hidden = false; apres.classList.remove('entre'); void apres.offsetWidth; apres.classList.add('entre');
  sceneActuelle = nom; document.body.dataset.scene = nom;
  document.body.classList.toggle('chasse', CHASSE.includes(nom));
  $('#inventaire').hidden = !CHASSE.includes(nom);
  Ciel.pause(nom === 'lanterne');
  if (CHASSE.includes(nom) || nom === 'lanterne') memoire.ecrire({ scene: nom });
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
  if (ouvert) return; ouvert = true; vibrer(20);
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
  zone.addEventListener('pointerdown', e => { y0 = e.clientY; });
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
  const b = document.createElement('div'); b.className = 'bulle'; b.textContent = texte; fil.appendChild(b); defiler();
  await attendre(250);
  return b;
}
async function sticker(src) {
  await ecrit(700);
  const b = document.createElement('div'); b.className = 'bulle sticker';
  const i = new Image(); i.src = src; i.alt = ''; b.appendChild(i); fil.appendChild(b);
  await new Promise(r => { if (i.complete) r(); else { i.onload = r; i.onerror = r; } });
  defiler(); await attendre(300);
}
function choix(options) {
  return new Promise(res => {
    reponses.innerHTML = '';
    options.forEach(t => {
      const o = document.createElement('button'); o.type = 'button'; o.className = 'reponse'; o.textContent = t;
      o.addEventListener('click', () => {
        reponses.innerHTML = '';
        const b = document.createElement('div'); b.className = 'bulle moi'; b.textContent = t; fil.appendChild(b); vibrer(15); defiler();
        res(t);
      }, { once: true });
      reponses.appendChild(o);
    });
  });
}

// le billet du Futuroscope dans une bulle, dessiné dans un canvas pour pouvoir le casser
let billetCanvas = null;
function billetDansBulle() {
  return new Promise(async res => {
    await ecrit(900);
    const b = document.createElement('div'); b.className = 'bulle image';
    const cv = document.createElement('canvas'); b.appendChild(cv); fil.appendChild(b);
    const img = new Image(); img.src = '../voyage/img/billet.webp';
    const poser = () => {
      cv.width = 900; cv.height = Math.round(900 * img.naturalHeight / img.naturalWidth) || 300;
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height); billetCanvas = cv; defiler(); res(b);
    };
    if (img.complete && img.naturalWidth) poser(); else { img.onload = poser; img.onerror = () => { cv.width = 900; cv.height = 300; const x = cv.getContext('2d'); x.fillStyle = '#2b3fa8'; x.fillRect(0, 0, 900, 300); x.fillStyle = '#fff'; x.font = 'bold 60px Fredoka'; x.fillText('Billet pour le futur', 60, 170); billetCanvas = cv; res(b); }; }
  });
}
// BONG : des fissures en étoile, puis le billet se fend en deux
function fissure() {
  if (!billetCanvas) return;
  const cv = billetCanvas, x = cv.getContext('2d'), W = cv.width, H = cv.height, cx = W * .44, cy = H * .5;
  x.save(); x.lineCap = 'round'; x.lineJoin = 'round';
  for (let i = 0; i < 10; i++) {
    const a = i / 10 * Math.PI * 2 + hasard(-.2, .2); x.beginPath(); x.moveTo(cx, cy);
    for (let k = 1; k <= 5; k++) { const r = k / 5 * hasard(.3, .55) * W, b = a + hasard(-.22, .22); x.lineTo(cx + Math.cos(b) * r, cy + Math.sin(b) * r * .6); }
    x.strokeStyle = 'rgba(255,255,255,.92)'; x.lineWidth = 8; x.stroke();
    x.strokeStyle = 'rgba(40,16,60,.85)'; x.lineWidth = 2.6; x.stroke();
  }
  const rg = x.createRadialGradient(cx, cy, 0, cx, cy, H * .5); rg.addColorStop(0, 'rgba(255,255,255,.8)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = rg; x.fillRect(0, 0, W, H); x.restore();
  // la fente, en zigzag de haut en bas
  const pts = []; for (let k = 0; k <= 8; k++) pts.push(`${(cx / W * 100 + hasard(-7, 7)).toFixed(1)}% ${(k / 8 * 100).toFixed(1)}%`);
  const gauche = `polygon(0 0, ${pts.join(', ')}, 0 100%)`, droite = `polygon(100% 0, ${pts.join(', ')}, 100% 100%)`;
  const d = document.createElement('canvas'); d.width = W; d.height = H; d.getContext('2d').drawImage(cv, 0, 0);
  d.style.cssText = `position:absolute; left:${cv.offsetLeft}px; top:${cv.offsetTop}px; width:${cv.offsetWidth}px; height:${cv.offsetHeight}px; border-radius:14px; clip-path:${droite}`;
  cv.style.clipPath = gauche; cv.parentElement.appendChild(d); cv.parentElement.style.background = 'none'; cv.parentElement.style.border = '0';
  const ressort = { duration: 700, easing: 'cubic-bezier(.2,1.4,.4,1)', fill: 'forwards' };
  cv.animate([{ transform: 'none' }, { transform: 'translate(-10px, 10px) rotate(-8deg)' }], ressort);
  d.animate([{ transform: 'none' }, { transform: 'translate(12px, 20px) rotate(7deg)' }], ressort);
  // des éclats
  const bord = cv.getBoundingClientRect();
  for (let i = 0; i < 18; i++) {
    const m = document.createElement('span'); m.className = 'miette';
    m.style.background = ['#3d5be0', '#9fd8ff', '#ffffff', '#ffcf6b', '#7d4cd9'][i % 5];
    m.style.left = (bord.left + bord.width * .44) + 'px'; m.style.top = (bord.top + bord.height * .5) + 'px';
    document.body.appendChild(m);
    m.animate([{ transform: 'translate(0,0) rotate(0)' }, { transform: `translate(${hasard(-140, 140)}px, ${hasard(-60, 380)}px) rotate(${hasard(-400, 400)}deg)`, opacity: 0 }],
      { duration: hasard(700, 1300), easing: 'cubic-bezier(.3,.1,.7,1)' }).onfinish = () => m.remove();
  }
}
function surgit(type, image, mot) {
  const s = $('#surgit'); $('#surgit-img').src = image; $('#onomato').textContent = mot;
  s.className = 'surgit ' + type; s.hidden = false;
  const p = $('#pendule'); p.style.animation = 'none'; void p.offsetWidth; p.style.animation = '';
  return s;
}
SCENES.discussion = async () => {
  await attendre(700);
  await dit('Coucou Kim ! 🌸', 700);
  await dit('C\'est moi, Raiponce 💜 Enzo m\'a confié un truc super important pour toi…');
  await billetDansBulle();
  await dit('Ton billet pour le futur 🚀');
  await ecrit(2000);
  await dit('Sauf que…', 600);
  await dit('quelque chose a bougé derrière… j\'ai cru que c\'était un intrus 😳');
  await attendre(400);
  // Raiponce surgit avec sa poêle : BONG
  surgit('poele', 'img/poele.webp', 'BONG !');
  await attendre(470);
  fissure(); vibrer([60, 30, 40]); document.body.classList.remove('secousse'); void document.body.offsetWidth; document.body.classList.add('secousse');
  await attendre(1300); $('#surgit').hidden = true; document.body.classList.remove('secousse');
  await dit('Oups. 🙊', 500);
  await dit('C\'était juste Pascal…', 700);
  await sticker('img/pascal-boude.webp');
  await choix(['RAIPONCE !!! 😱', 'Tu as cassé mon billet ?!']);
  await dit('Pardon, pardon ! Pas de panique !', 700);
  await dit('De toute façon, le futur c\'était pas assez bien pour toi.');
  await dit('Enzo et moi, on t\'a trouvé une autre destination. Top secret 🤫');
  await dit('Pascal l\'a caché en 3 morceaux… il adore jouer à cache-cache 🦎');
  await dit('Tu m\'aides à les retrouver ?');
  await choix(['On y va ! 💜']);
  await attendre(400);
  // Raiponce traverse l'écran au bout de sa tresse
  surgit('balance', 'img/balance.webp', 'YOUHOU !');
  const eclair = document.createElement('div'); eclair.className = 'eclair-dore'; document.body.appendChild(eclair);
  vibrer([40, 60, 40]);
  await attendre(2150); $('#surgit').hidden = true; eclair.remove();
  memoire.ecrire({ scene: 'etoiles' });
  aller('etoiles');
};

/* ================= les morceaux ================= */
async function vol(x0, y0, x1, y1, duree = 1100) {
  const v = document.createElement('div'); v.className = 'vol'; document.body.appendChild(v);
  await v.animate([
    { transform: `translate(${x0 - 27}px, ${y0 - 36}px) scale(.2) rotate(-30deg)`, opacity: 0 },
    { transform: `translate(${x0 - 27}px, ${y0 - 76}px) scale(1.3) rotate(0)`, opacity: 1, offset: .35 },
    { transform: `translate(${x1 - 27}px, ${y1 - 36}px) scale(.55) rotate(360deg)`, opacity: 1 },
  ], { duration: duree, easing: 'cubic-bezier(.4,0,.2,1)' }).finished;
  v.remove();
}
async function ramasser(i, depuis) {
  vibrer([20, 30, 20]);
  const m = memoire.lire(); const liste = new Set(m.morceaux || []); liste.add(i); memoire.ecrire({ morceaux: [...liste] });
  const cible = $$('.case')[i].getBoundingClientRect(), d = depuis.getBoundingClientRect();
  await vol(d.left + d.width / 2, d.top - 40, cible.left + cible.width / 2, cible.top + cible.height / 2);
  $$('.case')[i].classList.add('pleine');
}
$$('[data-ramasser]').forEach(b => b.addEventListener('click', async () => {
  b.disabled = true; const i = +b.dataset.ramasser;
  await ramasser(i, b);
  await attendre(250);
  aller(['voeu', 'brume', 'lanterne'][i]);
}));

/* ================= 2 · le ciel : un cœur d'étoiles ================= */
SCENES.etoiles = () => {
  const c = $('#j-etoiles'), x = c.getContext('2d'); $('#f-etoiles').hidden = true; $('#c-etoiles').style.opacity = 1;
  let L, H, pts = [], allumees = 0, fini = false, etincelles = [];
  const N_COEUR = 30;
  function placer() {
    L = c.clientWidth; H = c.clientHeight; c.width = Math.round(L * DPR); c.height = Math.round(H * DPR); x.setTransform(DPR, 0, 0, DPR, 0, 0);
    const s = Math.min(L * .8, H * .42), ox = (L - s) / 2, oy = H * .17;
    const anciens = pts; pts = [];
    for (let k = 0; k < N_COEUR; k++) {
      const a = k / N_COEUR * Math.PI * 2;
      const hx = 16 * Math.pow(Math.sin(a), 3), hy = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a));
      pts.push({ k, x: ox + (.5 + hx / 36) * s, y: oy + (.48 + hy / 36) * s, allumee: false, t: 0 });
    }
    anciens.forEach((a, i) => { if (pts[i]) pts[i].allumee = a.allumee; });
  }
  function toucher(e) {
    if (fini) return; const b = c.getBoundingClientRect(), mx = e.clientX - b.left, my = e.clientY - b.top;
    for (const p of pts) if (!p.allumee && Math.hypot(p.x - mx, p.y - my) < 30) {
      p.allumee = true; p.t = performance.now(); allumees++; vibrer(8);
      for (let i = 0; i < 8; i++) etincelles.push({ x: p.x, y: p.y, vx: hasard(-2, 2), vy: hasard(-2, 2), vie: 1 });
      if (allumees === pts.length) gagne();
    }
  }
  async function gagne() {
    fini = true; $('#c-etoiles').style.opacity = 0; vibrer([30, 50, 30, 50, 80]);
    await attendre(1500); $('#f-etoiles').hidden = false;
  }
  c.onpointerdown = e => { c.setPointerCapture && c.setPointerCapture(e.pointerId); toucher(e); };
  c.onpointermove = e => { if (e.buttons || e.pointerType === 'touch') toucher(e); };
  const voisins = p => pts.filter(q => q !== p && (Math.abs(q.k - p.k) === 1 || Math.abs(q.k - p.k) === N_COEUR - 1));
  function boucle(t) {
    if (sceneActuelle !== 'etoiles') return;
    x.clearRect(0, 0, L, H);
    const lueur = fini ? .55 + .45 * Math.sin(t / 300) : 1;
    x.lineWidth = 2; x.strokeStyle = `rgba(255, 220, 140, ${.7 * lueur})`;
    for (const p of pts) if (p.allumee) for (const q of voisins(p)) if (q.allumee && q.k > p.k) { x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(q.x, q.y); x.stroke(); }
    for (const p of pts) {
      const age = p.allumee ? Math.min(1, (t - p.t) / 300) : 0;
      const r = p.allumee ? 4 + 3 * (1 - age) : 2.4;
      x.globalAlpha = p.allumee ? 1 : .5 + .3 * Math.sin(t / 400 + p.x);
      x.fillStyle = p.allumee ? '#ffe39a' : '#ffffff';
      x.beginPath(); x.arc(p.x, p.y, r, 0, 6.283); x.fill();
      if (p.allumee) { x.globalAlpha = .25 * lueur; x.beginPath(); x.arc(p.x, p.y, r * 3.2, 0, 6.283); x.fill(); }
      else { x.globalAlpha = .12; x.beginPath(); x.arc(p.x, p.y, 14, 0, 6.283); x.fill(); }
    }
    x.globalAlpha = 1; etincelles = etincelles.filter(s => s.vie > 0);
    for (const s of etincelles) { x.globalAlpha = s.vie; x.fillStyle = '#fff3c0'; x.fillRect(s.x, s.y, 2, 2); s.x += s.vx; s.y += s.vy; s.vie -= .04; }
    x.globalAlpha = 1;
    requestAnimationFrame(boucle);
  }
  placer(); addEventListener('resize', placer); requestAnimationFrame(boucle);
  window.__kim.etoiles = () => pts.map(p => [p.x + c.getBoundingClientRect().left, p.y + c.getBoundingClientRect().top]);
};

/* ================= feux d'artifice (la toute fin) ================= */
function Feux(canvas) {
  const x = canvas.getContext('2d'); let L, H, fusees = [], parts = [], vivant = true;
  const COUL = ['#ffd36e', '#ff8fc2', '#c9a6ff', '#ffffff', '#ffb36e', '#9fe0ff'];
  // lueurs pré-calculées (pas de shadowBlur, trop lourd sur téléphone)
  const sprites = COUL.map(col => { const s = document.createElement('canvas'); s.width = s.height = 32; const g = s.getContext('2d'); const r = g.createRadialGradient(16, 16, 0, 16, 16, 16); r.addColorStop(0, '#fff'); r.addColorStop(.25, col); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, 32, 32); return s; });
  function taille() { L = canvas.clientWidth || innerWidth; H = canvas.clientHeight || innerHeight; canvas.width = Math.round(L * DPR); canvas.height = Math.round(H * DPR); x.setTransform(DPR, 0, 0, DPR, 0, 0); }
  taille(); addEventListener('resize', taille);
  function lancer(tx, ty, forme) {
    tx = tx ?? hasard(L * .15, L * .85); ty = ty ?? hasard(H * .1, H * .4);
    fusees.push({ x: tx + hasard(-30, 30), y: H + 10, tx, ty, c: Math.floor(Math.random() * COUL.length), forme: forme || (Math.random() < .3 ? 'coeur' : 'rond') });
  }
  function eclate(f) {
    const n = LEGER ? 46 : 84; vibrer(20);
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2; let vx, vy;
      if (f.forme === 'coeur') { vx = 16 * Math.pow(Math.sin(a), 3) * .27; vy = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * .27; }
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

/* ================= 3 · le vœu : la fleur magique ================= */
SCENES.voeu = () => {
  const fleur = $('#fleur-voeu'), anneau = $('#anneau'); $('#f-voeu').hidden = true;
  fleur.hidden = false; fleur.classList.remove('partie', 'tenue'); anneau.style.strokeDashoffset = 339.3;
  $('#c-voeu').style.opacity = 1;
  let tenue = null, progres = 0, etat = 'voeu', note = 0;
  function tenir(t) {
    if (tenue === null || etat !== 'voeu') return;
    progres = Math.min(1, (t - tenue) / 2200); anneau.style.strokeDashoffset = 339.3 * (1 - progres);
    if (progres * 8 > note) { note++; vibrer(6); }
    if (progres >= 1) { exauce(); return; }
    requestAnimationFrame(tenir);
  }
  fleur.onpointerdown = e => { if (etat !== 'voeu') return; e.preventDefault(); fleur.setPointerCapture && fleur.setPointerCapture(e.pointerId); tenue = performance.now(); note = 0; fleur.classList.add('tenue'); requestAnimationFrame(tenir); };
  const lacher = () => { if (etat !== 'voeu') return; tenue = null; fleur.classList.remove('tenue'); anneau.style.transition = 'stroke-dashoffset .4s'; anneau.style.strokeDashoffset = 339.3; setTimeout(() => anneau.style.transition = '', 420); };
  fleur.onpointerup = lacher; fleur.onpointerleave = lacher; fleur.onpointercancel = lacher;
  async function exauce() {
    etat = 'part'; fleur.classList.remove('tenue'); fleur.classList.add('partie'); vibrer([40, 40, 80]);
    $('#c-voeu').style.opacity = 0;
    await attendre(1100); fleur.hidden = true; etat = 'fin';
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
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(206,190,240,.97)'); g.addColorStop(1, 'rgba(238,220,246,.99)');
    x.fillStyle = g; x.fillRect(0, 0, L, H);
    for (let i = 0; i < 70; i++) {
      const cx = Math.random() * L, cy = Math.random() * H, r = hasard(40, 140);
      const rg = x.createRadialGradient(cx, cy, 0, cx, cy, r); rg.addColorStop(0, `rgba(255,255,255,${hasard(.25, .55)})`); rg.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = rg; x.fillRect(cx - r, cy - r, r * 2, r * 2);
    }
    x.fillStyle = 'rgba(120,90,180,.35)'; x.font = '600 18px Fredoka, sans-serif'; x.textAlign = 'center';
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
    if (++compte % 8 === 0 && degage() > .55) gagne();
  }
  async function gagne() {
    fini = true; c.classList.add('partie'); pay.classList.add('allume'); $('#c-brume').style.opacity = 0; vibrer([30, 40, 30, 40, 90]);
    await attendre(1700); $('#f-brume').hidden = false;
  }
  c.onpointerdown = e => { c.setPointerCapture && c.setPointerCapture(e.pointerId); dernier = null; frotter(e); };
  c.onpointermove = e => { if (e.buttons || e.pointerType === 'touch') frotter(e); };
  c.onpointerup = () => { dernier = null; };
  peindre();
  window.__kim.brume = () => ({ degage: degage(), fini });
};

/* ================= 5 · la lanterne : Raiponce sur son bateau ================= */
let billetPret = false;
function holo(ix, iy) { // ix, iy entre -1 et 1
  const b = $('#billet'); b.style.setProperty('--tx', (ix * 10).toFixed(2)); b.style.setProperty('--ty', (-iy * 8).toFixed(2));
  b.style.setProperty('--hx', (50 + ix * 40).toFixed(1) + '%'); b.style.setProperty('--hy', (50 + iy * 40).toFixed(1) + '%');
}
addEventListener('inclinaison', e => { if (billetPret) holo(e.detail.x, e.detail.y); });

// le royaume au loin (îlot, remparts, tours), dessiné une fois puis réutilisé (avec son reflet)
function dessinerRoyaume(w) {
  const h = Math.round(w * .46), c = document.createElement('canvas'); c.width = Math.round(w * DPR); c.height = Math.round(h * DPR);
  const g = c.getContext('2d'); g.scale(DPR, DPR); const b = h;
  g.fillStyle = '#2a1440';
  g.beginPath(); g.moveTo(0, b); g.quadraticCurveTo(w * .12, b - h * .1, w * .26, b - h * .18); g.lineTo(w * .74, b - h * .18); g.quadraticCurveTo(w * .88, b - h * .1, w, b); g.closePath(); g.fill();
  const tours = [[.3, .3, .05], [.37, .42, .045], [.44, .55, .05], [.5, .92, .06], [.56, .6, .05], [.63, .46, .045], [.7, .32, .05], [.47, .7, .035], [.53, .74, .035]];
  const fen = [];
  for (const [cx, th, tw] of tours) {
    const x0 = w * (cx - tw / 2), x1 = w * (cx + tw / 2), top = b - h * .18 - h * th * .62;
    g.fillRect(x0, top, x1 - x0, b - top);
    g.beginPath(); g.moveTo(x0 - w * .006, top); g.lineTo(w * cx, top - h * th * .38); g.lineTo(x1 + w * .006, top); g.closePath(); g.fill();
    for (let k = 0; k < 3; k++) if (Math.random() < .8) fen.push([w * cx + hasard(-.3, .3) * (x1 - x0), top + (k + 1) * (b - top) * .22]);
  }
  g.fillRect(w * .27, b - h * .3, w * .46, h * .14);
  for (let i = 0; i < 10; i++) { const xx = w * (.28 + i * .046); g.fillRect(xx, b - h * .33, w * .02, h * .04); }
  for (const [fx, fy] of fen) {
    g.globalAlpha = .55; g.drawImage(LUEUR, fx - 7, fy - 7, 14, 14);
    g.globalAlpha = 1; g.fillStyle = '#ffd47e'; g.fillRect(fx - 1.2, fy - 2, 2.4, 3.6); g.fillStyle = '#2a1440';
  }
  return c;
}

SCENES.lanterne = async () => {
  const sc = $('#s-lanterne'), c = $('#j-lanterne'), x = c.getContext('2d');
  const fin = $('#final'), titre = $('#t-lanterne'), cons = $('#c-lanterne'), fl = $('#fleches');
  const dejaVu = !!memoire.lire().vu;
  fin.hidden = true; fl.hidden = true; titre.style.opacity = 1; cons.style.opacity = 1; cons.innerHTML = '&nbsp;';
  const rap = new Image(); rap.src = 'img/bateau-raiponce.webp';
  const HEROS = spriteLanterne(64, true), HEROS_ETEINTE = spriteLanterne(64, true, true);
  let L, H, MONTEE, GAIN, cam = 0, cible = 0, vit = 0, p = 0, pMax = 0, etat = 'arrivee', doigt = null, dernierY = 0, dernierT = 0;
  let lanternes = [], etoiles = [], braises = [], royaume = null, tFinal = 0, allumage = 0, calme = 0, hx = 0, hy = 0, hw = 40;
  const N = LEGER ? 70 : 150;
  function nouvelle(init, i) {
    const z = Math.pow(Math.random(), 1.5), f = .25 + z * .6;
    return { x: Math.random() * L, y: init ? hasard(-MONTEE * f - H * .2, H * .62) : H * .62 - cam * f + hasard(0, 24), z, f,
      s: 2.4 + z * z * 12 + Math.random() * 2, v: (5 + z * 13) * hasard(.7, 1.3), ph: Math.random() * 6.28,
      seuil: init ? (i < N * .14 ? 0 : Math.random() * .85) : 0 };
  }
  function taille() {
    L = c.clientWidth; H = c.clientHeight; c.width = Math.round(L * DPR); c.height = Math.round(H * DPR); x.setTransform(DPR, 0, 0, DPR, 0, 0);
    MONTEE = H * 2.4; GAIN = MONTEE / (H * 2.3);   // environ 4 glissés pour arriver en haut
    etoiles = Array.from({ length: LEGER ? 90 : 170 }, () => ({ x: Math.random() * L, y: hasard(-MONTEE * .18, H * .6), r: hasard(.4, 1.5), ph: Math.random() * 6.28, v: hasard(.6, 2) }));
    lanternes = Array.from({ length: N }, (_, i) => nouvelle(true, i));
    royaume = dessinerRoyaume(Math.min(L * .95, 460));
    cam = cible = Math.min(cam, MONTEE);
  }
  taille(); addEventListener('resize', taille);

  // -------- le doigt : glisser vers le haut = monter --------
  c.onpointerdown = e => { if (etat !== 'monte') return; c.setPointerCapture && c.setPointerCapture(e.pointerId); doigt = e.pointerId; dernierY = e.clientY; dernierT = performance.now(); vit = 0; };
  c.onpointermove = e => {
    if (doigt !== e.pointerId || etat !== 'monte') return;
    const now = performance.now(), dy = (dernierY - e.clientY) * GAIN; dernierY = e.clientY;
    cible = Math.max(0, Math.min(MONTEE, cible + dy)); vit = vit * .5 + (dy / Math.max(8, now - dernierT) * 16) * .5; dernierT = now; calme = 0;
  };
  c.onpointerup = c.onpointercancel = e => { if (doigt === e.pointerId) doigt = null; };
  sc.onwheel = e => { if (etat === 'monte') { cible = Math.max(0, Math.min(MONTEE, cible - e.deltaY * 1.4)); calme = 0; } };

  // -------- le dessin --------
  let avant = performance.now();
  function boucle(t) {
    if (sceneActuelle !== 'lanterne') return;
    requestAnimationFrame(boucle);
    const dt = Math.min(.05, (t - avant) / 1000); avant = t; const s = t / 1000;
    if (etat === 'monte') {
      if (doigt === null) { cible = Math.max(0, Math.min(MONTEE, cible + vit)); vit *= .9; if (Math.abs(vit) < .05) vit = 0; }
      calme += dt;
      fl.hidden = !(p < .04 || (calme > 4 && p < .99));
      if (p > .04) { titre.style.opacity = 0; cons.style.opacity = 0; }
    }
    cam += (cible - cam) * Math.min(1, dt * 8);
    p = Math.min(1, cam / MONTEE); pMax = Math.max(pMax, p);
    if (etat === 'monte' && p > .995) finale();
    const q = lisse(.5, 1, p);

    // ciel
    const hY = H * .63 + cam * .75;
    const zen = melange([34, 15, 74], [8, 6, 28], p), mil = melange([86, 38, 122], [26, 14, 66], p), bas = melange([176, 92, 150], [70, 34, 110], p);
    const gc = x.createLinearGradient(0, hY - H * 1.5, 0, hY);
    gc.addColorStop(0, rgb(zen)); gc.addColorStop(.62, rgb(mil)); gc.addColorStop(1, rgb(bas));
    x.fillStyle = gc; x.fillRect(0, 0, L, H);
    for (const e of etoiles) {
      const y = e.y + cam * .15; if (y < -4 || y > H) continue;
      x.globalAlpha = Math.max(.05, .35 + .55 * Math.sin(e.ph + s * e.v)) * (.6 + .4 * p); x.fillStyle = '#fff';
      x.beginPath(); x.arc(e.x, y, e.r, 0, 6.283); x.fill();
    }
    x.globalAlpha = 1;

    // la lumière de sa lanterne inonde le ciel quand on arrive en haut
    if (q > 0) {
      const rg = x.createRadialGradient(hx, hy, 0, hx, hy, H * (.35 + 1.1 * q));
      rg.addColorStop(0, `rgba(255,208,140,${.3 * q})`); rg.addColorStop(.45, `rgba(255,140,140,${.1 * q})`); rg.addColorStop(1, 'rgba(200,120,200,0)');
      x.fillStyle = rg; x.fillRect(0, 0, L, H);
    }

    // les lanternes lointaines : plus on monte, plus il y en a
    for (const l of lanternes) {
      l.y -= l.v * dt;
      if (l.y + MONTEE * l.f < -60) Object.assign(l, nouvelle(false));
      const y = l.y + cam * l.f; if (y < -40 || y > H + 40) continue;
      const vis = lisse(l.seuil, l.seuil + .12, pMax); if (vis <= 0) continue;
      const brume = y > hY - 6 ? 0 : 1;   // rien sous l'horizon
      petiteLanterne(x, l.x + Math.sin(s * .5 + l.ph) * 4, y, l.s, vis * brume * (.82 + .18 * Math.sin(s * 3 + l.ph)) * (.55 + .45 * l.z));
    }
    x.globalAlpha = 1;

    // le royaume, le lac
    if (hY < H + 10) {
      const rw = royaume.width / DPR, rh = royaume.height / DPR, rx = (L - rw) / 2;
      x.drawImage(royaume, rx, hY - rh, rw, rh);
      const gl = x.createLinearGradient(0, hY, 0, H); gl.addColorStop(0, '#3a1d62'); gl.addColorStop(1, '#130a2e');
      x.fillStyle = gl; x.fillRect(0, hY, L, H - hY);
      x.save(); x.globalAlpha = .28; x.translate(0, hY * 2); x.scale(1, -1); x.drawImage(royaume, rx, hY - rh * .9, rw, rh * .9); x.restore();
      // reflet doré de sa lanterne sur l'eau
      const lum = allumage * (.4 + .6 * p);
      for (let k = 0; k < 16; k++) {
        const y = hY + 5 + k * k * 1.5; if (y > H) break;
        const larg = (10 + k * 4) * (.6 + .4 * Math.sin(s * 2.2 + k));
        x.globalAlpha = lum * (1 - k / 16) * .55; x.fillStyle = '#ffd890';
        x.fillRect(hx - larg / 2 + Math.sin(s * 1.7 + k * 1.3) * 5, y, larg, 1.6);
      }
      x.globalAlpha = 1;
    }

    // Raiponce sur son bateau
    const ih = Math.min(H * .36, 330), iw = ih * 584 / 639;
    const wY = H * .93 + cam + Math.sin(s * 1.3) * 2.5;
    const ix = L * .5 - iw * .44, iy = wY - ih * .97;
    if (iy < H) {
      const bw = Math.min(L * 1.02, iw * 1.75), cx = L * .5, rim = wY - ih * .2, hh = ih * .27;
      x.save(); x.translate(cx, wY); x.rotate(Math.sin(s * .9) * .015); x.translate(-cx, -wY);
      // ombre et rides sous la barque
      x.fillStyle = 'rgba(8,4,20,.45)'; x.beginPath(); x.ellipse(cx, rim + hh * 1.02, bw * .52, hh * .22, 0, 0, 6.283); x.fill();
      if (rap.complete && rap.naturalWidth) x.drawImage(rap, ix, iy, iw, ih);
      // ses cheveux débordent et traînent dans l'eau
      const gch = x.createLinearGradient(cx + bw * .15, rim, cx + bw * .5, rim + hh * 1.4);
      gch.addColorStop(0, '#ffd970'); gch.addColorStop(1, 'rgba(255,205,90,0)');
      x.strokeStyle = gch; x.lineWidth = iw * .08; x.lineCap = 'round';
      x.beginPath(); x.moveTo(cx + bw * .16, rim + hh * .05); x.bezierCurveTo(cx + bw * .36, rim - hh * .1, cx + bw * .4, rim + hh * .9, cx + bw * .62, rim + hh * 1.2); x.stroke();
      // la coque
      x.beginPath();
      x.moveTo(cx - bw / 2, rim - hh * .1);
      x.quadraticCurveTo(cx, rim + hh * .2, cx + bw / 2, rim - hh * .22);
      x.quadraticCurveTo(cx + bw * .44, rim + hh * .85, cx + bw * .28, rim + hh);
      x.lineTo(cx - bw * .25, rim + hh);
      x.quadraticCurveTo(cx - bw * .45, rim + hh * .85, cx - bw / 2, rim - hh * .1);
      x.closePath();
      const gb = x.createLinearGradient(0, rim, 0, rim + hh); gb.addColorStop(0, '#9a6239'); gb.addColorStop(1, '#3d2014');
      x.fillStyle = gb; x.fill();
      x.save(); x.clip();
      x.strokeStyle = 'rgba(0,0,0,.28)'; x.lineWidth = 2;
      for (const k of [.38, .68]) { x.beginPath(); x.moveTo(cx - bw / 2, rim + hh * k); x.quadraticCurveTo(cx, rim + hh * (k + .2), cx + bw / 2, rim + hh * (k - .12)); x.stroke(); }
      x.restore();
      x.strokeStyle = `rgba(255,${190 + 40 * allumage},${120 + 40 * allumage},${.55 + .4 * allumage})`; x.lineWidth = 4;
      x.beginPath(); x.moveTo(cx - bw / 2, rim - hh * .1); x.quadraticCurveTo(cx, rim + hh * .2, cx + bw / 2, rim - hh * .22); x.stroke();
      x.restore();
    }

    // SA lanterne : elle part de ses mains et monte avec nous, de plus en plus lumineuse
    const mainX = ix + iw * .14, mainY = iy - ih * .075;
    const e = lisse(0, .3, p);
    const butX = L * .5 + Math.sin(s * .7) * 8, butY = H * (.36 - .1 * p);
    hx = mainX + (butX - mainX) * e; hy = mainY + (butY - mainY) * e + Math.sin(s * 1.6) * 2 * (1 - e);
    hw = Math.min(iw * .22, 64) * (1 - .4 * e);
    let flash = 0;
    if (etat === 'final') { const k = (t - tFinal) / 1000; flash = k < 1.1 ? lisse(0, 1.1, k) : Math.max(0, 1 - (k - 1.1) / 1.3); hy -= Math.min(1, k / 3) * H * .04; }
    const G = allumage * (.35 + .65 * p) + flash * .6;
    const R = hw * (1.6 + 8 * Math.pow(p, 1.2)) * (1 + flash * 2.5);
    if (G > 0) {
      x.globalCompositeOperation = 'lighter';
      x.globalAlpha = Math.min(1, .45 + .5 * G); x.drawImage(LUEUR, hx - R, hy - R, R * 2, R * 2);
      if (p > .55 || flash > 0) { // rayons
        const k = Math.max(lisse(.55, 1, p), flash); x.save(); x.translate(hx, hy); x.rotate(s * .08);
        for (let i = 0; i < 12; i++) {
          x.rotate(Math.PI / 6); x.globalAlpha = .07 * k * (.6 + .4 * Math.sin(s * 1.5 + i * 2));
          x.fillStyle = '#ffe2a0'; x.beginPath(); x.moveTo(0, 0); x.lineTo(-hw * .5, -H * .9); x.lineTo(hw * .5, -H * .9); x.closePath(); x.fill();
        }
        x.restore();
      }
      x.globalCompositeOperation = 'source-over';
    }
    x.globalAlpha = 1;
    const spr = allumage > .5 ? HEROS : HEROS_ETEINTE;
    x.drawImage(spr, hx - hw * .75, hy - hw * .8, hw * 1.5, hw * 1.6);
    if (allumage > 0 && allumage < 1) { x.globalAlpha = allumage; x.drawImage(HEROS, hx - hw * .75, hy - hw * .8, hw * 1.5, hw * 1.6); x.globalAlpha = 1; }

    // des braises dorées s'échappent de la lanterne
    if (allumage > .5 && braises.length < 140 && Math.random() < .25 + 1.2 * p) braises.push({ x: hx + hasard(-hw * .3, hw * .3), y: hy + hw * .5, vx: hasard(-.25, .25), vy: hasard(.15, .7), vie: 1, r: hasard(.8, 2) });
    x.globalCompositeOperation = 'lighter';
    braises = braises.filter(b => b.vie > 0);
    for (const b of braises) { b.x += b.vx + Math.sin(s * 3 + b.y * .05) * .2; b.y += b.vy; b.vie -= .011; x.globalAlpha = b.vie * .9; x.fillStyle = '#ffd98a'; x.fillRect(b.x, b.y, b.r, b.r); }
    x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1;

    // éclair blanc-doré au moment où le billet apparaît
    if (flash > 0) { x.globalAlpha = flash * .5; x.fillStyle = '#fff2cf'; x.fillRect(0, 0, L, H); x.globalAlpha = 1; }
  }
  requestAnimationFrame(boucle);

  // -------- la fin : la lanterne éclate en lumière, le billet apparaît --------
  async function finale(direct) {
    if (etat === 'final') return; etat = 'final'; fl.hidden = true; titre.style.opacity = 0; cons.style.opacity = 0;
    memoire.ecrire({ vu: true }); vibrer([60, 40, 60, 40, 160]);
    tFinal = performance.now() - (direct ? 6000 : 0);
    if (!direct) await attendre(1300);
    fin.hidden = false; billetPret = true;
    const feux = Feux($('#j-feux'));
    for (let k = 0; k < 6; k++) setTimeout(() => feux.lancer(undefined, undefined, k % 2 ? 'coeur' : 'rond'), 600 + k * 450);
    const auto = setInterval(() => { if (sceneActuelle !== 'lanterne') { clearInterval(auto); feux.arreter(); return; } feux.lancer(); }, 2300);
  }
  window.__kim.lanterne = () => ({ p, etat, cam, MONTEE });

  if (dejaVu) { cam = cible = MONTEE; allumage = 1; titre.style.opacity = 0; finale(true); return; }

  // -------- l'arrivée : les 3 morceaux volent dans la lanterne et l'allument --------
  $('#inventaire').hidden = false;
  await attendre(1100);
  const cases = $$('.case');
  await Promise.all(cases.map((k, i) => attendre(i * 180).then(() => { const r = k.getBoundingClientRect(); k.classList.remove('pleine'); return vol(r.left + r.width / 2, r.top + r.height / 2, hx, hy, 1200); })));
  $('#inventaire').hidden = true; vibrer([30, 30, 60]);
  const t0 = performance.now();
  await new Promise(r => { const f = t => { allumage = Math.min(1, (t - t0) / 900); if (allumage < 1) requestAnimationFrame(f); else r(); }; requestAnimationFrame(f); });
  cons.textContent = 'Laisse-la s\'envoler… ✨';
  etat = 'monte'; calme = 0;
};
$('#briller').addEventListener('click', async () => {
  const ok = await Parallaxe.activer();
  $('#briller').textContent = ok ? '📱 Penche ton téléphone' : '✨ Passe ton doigt sur le billet';
});
$('#billet').addEventListener('pointermove', e => { const r = e.currentTarget.getBoundingClientRect(); holo((e.clientX - r.left) / r.width * 2 - 1, (e.clientY - r.top) / r.height * 2 - 1); });
$('#revoir').addEventListener('click', () => { memoire.effacer(); location.reload(); });

/* ================= pour les tests ================= */
window.__kim = { scene: () => sceneActuelle, aller, leger: () => LEGER };
})();
