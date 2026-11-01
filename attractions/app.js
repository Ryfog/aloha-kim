/* Notre Disneyland — le manège 3D des attractions et notre programme.
   Tout est gardé sur l'appareil (localStorage) ; le bouton « Envoyer » met la liste entière dans un lien. */
(() => {
'use strict';

const A = window.ATTRACTIONS || [];
const PAR_ID = new Map(A.map(a => [a.id, a]));
const $ = s => document.querySelector(s);
const CLE = 'kimDisney.v1', CLE_PHOTOS = 'kimDisney.photos', CLE_AIDE = 'kimDisney.aide';
const lire = (k, def) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch { return def; } };
const ecrire = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } };
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const mod = (n, m) => ((n % m) + m) % m;
const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const PARCS = { dlp: 'Parc Disneyland', daw: 'Disney Adventure World' };
const COULEURS = {
  'Main Street, U.S.A.': ['#6e1630', '#e39a4f'], 'Frontierland': ['#6b2412', '#e3833b'], 'Adventureland': ['#123f31', '#c9a227'],
  'Fantasyland': ['#6c1f6b', '#f39cc4'], 'Discoveryland': ['#132a63', '#c88a3c'], 'World Premiere Plaza': ['#3b1a5e', '#e8b04c'],
  'Adventure Way': ['#5a2346', '#f6c27a'], 'Worlds of Pixar': ['#8a2d10', '#f4c542'], 'Avengers Campus': ['#121c36', '#c0392b'],
  'World of Frozen': ['#163f7a', '#a9dcff'],
};
const NIVEAUX = ['', 'Tout doux', 'Ça bouge', 'Sensations fortes'];
const TAGS = { incontournable: '⭐ Incontournable', nouveau: '✨ Nouveau 2026', spectacle: '🎭 Spectacle', rencontre: '🤝 Rencontre', peur: '👻 Fait un peu peur', duel: '🏆 On se défie' };
const FILTRES = [
  ['incontournable', '⭐ Incontournables', a => a.tags.includes('incontournable')],
  ['frissons', '🎢 Sensations', a => a.niveau >= 2],
  ['doux', '🌸 Tout doux', a => a.niveau === 1 && !a.tags.includes('spectacle') && !a.tags.includes('rencontre')],
  ['spectacle', '🎭 Spectacles', a => a.tags.includes('spectacle')],
  ['rencontre', '🤝 Rencontres', a => a.tags.includes('rencontre')],
  ['nouveau', '✨ Nouveautés', a => a.tags.includes('nouveau')],
  ['coeur', '💗 Nos envies', a => !!(etat.envies[a.id] && (etat.envies[a.id].k || etat.envies[a.id].e))],
  ['reste', '📝 Pas encore placées', a => !ouEst(a.id)],
];
const EMOJIS = ['🍿', '🥨', '🍦', '🍽️', '📸', '🛍️', '🎆', '🐭', '🏰', '💤', '🚂', '💗'];
const MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const JSEM = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];

// ─── État (gardé sur l'appareil) ───────────────────────────────────────────
const defaut = () => ({
  v: 1, date: '', onglet: 'j1', perso: {}, envies: {},
  jours: [{ id: 'j1', nom: 'Jour 1', items: [] }, { id: 'j2', nom: 'Jour 2', items: [] }, { id: 'pe', nom: 'Peut-être', items: [], special: true }],
});
function valider(e) {
  if (!e || typeof e !== 'object' || !Array.isArray(e.jours) || !e.jours.length) return null;
  e.perso = e.perso && typeof e.perso === 'object' ? e.perso : {};
  e.envies = e.envies && typeof e.envies === 'object' ? e.envies : {};
  e.date = typeof e.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(e.date) ? e.date : '';
  const vus = new Set(), ids = new Set();
  e.jours = e.jours.filter(j => j && typeof j === 'object');
  for (const j of e.jours) {
    j.special = !!j.special;
    if (!j.id || ids.has(j.id)) j.id = j.special ? 'pe' : 'j' + Math.random().toString(36).slice(2, 8);
    ids.add(j.id);
    j.nom = String(j.nom || 'Jour').slice(0, 40);
    j.items = (Array.isArray(j.items) ? j.items : []).filter(it => it && (PAR_ID.has(it.id) || e.perso[it.id]) && !vus.has(it.id) && vus.add(it.id))
      .map(it => ({ id: it.id, fait: !!it.fait, note: String(it.note || '').slice(0, 120) }));
  }
  const spe = e.jours.filter(j => j.special);
  e.jours = e.jours.filter(j => !j.special);
  if (!e.jours.length) e.jours.push({ id: 'j1', nom: 'Jour 1', items: [] });
  e.jours.push(spe[0] || { id: 'pe', nom: 'Peut-être', items: [], special: true });
  if (!e.jours.some(j => j.id === e.onglet)) e.onglet = e.jours[0].id;
  return e;
}
let etat = valider(lire(CLE, null)) || defaut();
let photos = lire(CLE_PHOTOS, {});
const sauver = () => ecrire(CLE, etat);

const jourParId = id => etat.jours.find(j => j.id === id);
const joursNormaux = () => etat.jours.filter(j => !j.special);
function ouEst(id) {
  for (const j of etat.jours) { const k = j.items.findIndex(it => it.id === id); if (k >= 0) return { jour: j, k }; }
  return null;
}
function infos(id) {
  const a = PAR_ID.get(id); if (a) return a;
  const p = etat.perso[id];
  return p ? { id, nom: p.nom, emoji: p.emoji, perso: true, monde: 'Notre activité', tags: [], niveau: 0 } : null;
}
function placer(id, jourId, index = Infinity) {
  const j = jourParId(jourId); if (!j) return;
  const ancien = ouEst(id);
  let item = { id, fait: false, note: '' };
  if (ancien) {
    item = ancien.jour.items.splice(ancien.k, 1)[0];
    if (ancien.jour === j && ancien.k < index) index--;
  }
  index = Math.max(0, Math.min(index, j.items.length));
  j.items.splice(index, 0, item);
  apresChangement();
}
function retirer(id) {
  const o = ouEst(id); if (!o) return null;
  const item = o.jour.items.splice(o.k, 1)[0];
  apresChangement();
  return { item, jour: o.jour.id, k: o.k };
}
function apresChangement() {
  sauver(); rendreProgramme(); majCartes();
  if (filtre === 'reste' || filtre === 'coeur') refiltrer();
}

// ─── Visuels ───────────────────────────────────────────────────────────────
function affiche(a) {
  const [c1, c2] = COULEURS[a.monde] || ['#3b2a7a', '#d46aa0'];
  return `<div class="affiche" style="background:linear-gradient(160deg, ${c2}, ${c1})"><span class="emoji">${esc(a.emoji || '✨')}</span></div>`;
}
function visuel(a, cls = '') {
  if (photos[a.id]) return `<img class="${cls}" src="${photos[a.id]}" alt="" draggable="false">`;
  if (a.photo) return `<img class="${cls}" src="${a.photo.src}" alt="" style="object-position:${a.photo.pos}" decoding="async" draggable="false">`;
  return affiche(a);
}
function vignette(a) {
  if (photos[a.id]) return `<img class="vignette" src="${photos[a.id]}" alt="">`;
  if (a.photo) return `<img class="vignette" src="${a.photo.src}" alt="" style="object-position:${a.photo.pos}" loading="lazy">`;
  const [c1, c2] = COULEURS[a.monde] || ['#3b2a7a', '#d46aa0'];
  return `<span class="vignette" style="background:linear-gradient(160deg, ${c2}, ${c1})">${esc(a.emoji || '✨')}</span>`;
}

// ─── Toast ─────────────────────────────────────────────────────────────────
let toastT = 0;
function toast(msg, action) {
  const t = $('#toast');
  t.innerHTML = esc(msg) + (action ? ` <button class="lien" id="toastAction" style="color:#8a4b00">${esc(action.texte)}</button>` : '');
  t.hidden = false;
  if (action) $('#toastAction').onclick = () => { action.fn(); t.hidden = true; };
  clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, action ? 4500 : 2400);
}

// ─── Date et compte à rebours ──────────────────────────────────────────────
function libDate(d) { return `${JSEM[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]}`; }
function dateJour(k) {
  if (!etat.date) return '';
  const d = new Date(etat.date + 'T12:00:00'); d.setDate(d.getDate() + k);
  return libDate(d);
}
function majDate() {
  const t = $('#texteDate'), champ = $('#champDate');
  champ.value = etat.date || '';
  if (!etat.date) { t.textContent = 'Choisir notre date'; return; }
  const d = new Date(etat.date + 'T00:00:00'), auj = new Date(); auj.setHours(0, 0, 0, 0);
  const n = Math.round((d - auj) / 864e5);
  t.textContent = n > 1 ? `Plus que ${n} jours · ${libDate(d)}` : n === 1 ? `C'est demain ! · ${libDate(d)}` : n === 0 ? `C'est aujourd'hui ! ✨` : `Notre journée du ${libDate(d)}`;
}
$('#champDate').addEventListener('change', e => { etat.date = e.target.value || ''; sauver(); majDate(); rendreProgramme(); });
$('#puceDate').addEventListener('click', e => {
  const c = $('#champDate');
  if (e.target === c && typeof c.showPicker === 'function') { try { c.showPicker(); } catch {} }
});

// ─── Filtres ───────────────────────────────────────────────────────────────
let parc = 'tout', recherche = '', filtre = null, liste = A.slice();
$('#filtres').innerHTML = FILTRES.map(([id, lib]) => `<button class="puce" data-filtre="${id}" aria-pressed="false">${lib}</button>`).join('');
$('#filtres').addEventListener('click', e => {
  const b = e.target.closest('[data-filtre]'); if (!b) return;
  filtre = filtre === b.dataset.filtre ? null : b.dataset.filtre;
  for (const x of document.querySelectorAll('[data-filtre]')) x.setAttribute('aria-pressed', String(x.dataset.filtre === filtre));
  refiltrer(true);
});
$('#parcs').addEventListener('click', e => {
  const b = e.target.closest('[data-parc]'); if (!b) return;
  parc = b.dataset.parc;
  for (const x of document.querySelectorAll('[data-parc]')) x.setAttribute('aria-selected', String(x === b));
  refiltrer(true);
  if (vue === 'plan' && planPret) { deselectionner(); voler(vueCadre(cadreCourant(), cam.t || TILT), 1100); }
});
let rechT = 0;
$('#recherche').addEventListener('input', e => {
  recherche = e.target.value; e.target.closest('.recherche').classList.toggle('pleine', recherche.length > 0);
  clearTimeout(rechT); rechT = setTimeout(() => refiltrer(true), 120);
});
$('#effacerFiltres').addEventListener('click', () => {
  parc = 'tout'; filtre = null; recherche = ''; $('#recherche').value = ''; $('.recherche').classList.remove('pleine');
  for (const x of document.querySelectorAll('[data-parc]')) x.setAttribute('aria-selected', String(x.dataset.parc === 'tout'));
  for (const x of document.querySelectorAll('[data-filtre]')) x.setAttribute('aria-pressed', 'false');
  refiltrer(true);
});
function refiltrer(auDebut = false) {
  const avant = liste.length ? liste[mod(Math.round(pos), liste.length)]?.id : null;
  const q = norm(recherche.trim());
  const f = FILTRES.find(x => x[0] === filtre);
  liste = A.filter(a => (parc === 'tout' || a.parc === parc) && (!f || f[2](a)) && (!q || norm(`${a.nom} ${a.monde} ${a.desc}`).includes(q)));
  const k = liste.findIndex(a => a.id === avant);
  pos = k >= 0 ? k : 0;
  vitesse = 0; cible = null;
  for (const el of elems.values()) el.remove();
  elems.clear();
  calculAnneau(); rendreAnneau(); majEpingles();
}

// ─── Le manège 3D ──────────────────────────────────────────────────────────
const scene = $('#scene'), anneau = $('#anneau');
const elems = new Map();
let pos = 0, vitesse = 0, cible = null, enCours = false, enRoue = false, roueT = 0;
let W = 180, H = 240, M = 16, PAS = 22.5, R = 600, inclX = 0, inclY = 0;

function dimensions() {
  const sh = scene.clientHeight, sw = scene.clientWidth;
  H = Math.round(Math.max(160, Math.min(sh * 0.76, 380)));
  W = Math.round(H * 0.75);
  if (W > sw * 0.66) { W = Math.round(sw * 0.66); H = Math.round(W / 0.75); }
  document.documentElement.style.setProperty('--w', W + 'px');
  document.documentElement.style.setProperty('--h', H + 'px');
  calculAnneau(); rendreAnneau();
}
function calculAnneau() {
  const N = liste.length;
  M = Math.max(1, Math.min(16, N));
  PAS = 360 / M;
  R = Math.max(W * 0.95, (M * W * 1.13) / (2 * Math.PI));
}
function rendreAnneau() {
  const N = liste.length;
  $('#videFiltre').hidden = N > 0;
  anneau.style.transform = `translateZ(${(-R).toFixed(1)}px) rotateX(${(-2.5 + inclX).toFixed(2)}deg) rotateY(${inclY.toFixed(2)}deg)`;
  if (!N) { majPanneau(null); return; }
  const base = Math.round(pos);
  const voulu = new Map();
  if (N <= M) {
    for (let i = 0; i < N; i++) { const k = i + N * Math.round((pos - i) / N); voulu.set(liste[i].id, (k - pos) * PAS); }
  } else {
    for (let d = -Math.ceil(M / 2) + 1; d <= Math.floor(M / 2); d++) { const k = base + d; voulu.set(liste[mod(k, N)].id, (k - pos) * PAS); }
  }
  for (const [id, el] of elems) if (!voulu.has(id)) { el.remove(); elems.delete(id); }
  const devant = liste[mod(base, N)].id;
  for (const [id, ang] of voulu) {
    let el = elems.get(id);
    if (!el) { el = creerCarte(PAR_ID.get(id)); anneau.appendChild(el); elems.set(id, el); }
    el.style.transform = `rotateY(${ang.toFixed(2)}deg) translateZ(${R.toFixed(1)}px)`;
    const c = Math.cos(ang * Math.PI / 180);
    el.style.setProperty('--o', ((1 - c) * 0.36).toFixed(3));
    el.classList.toggle('devant', id === devant && Math.abs(ang) < PAS / 2 + 0.01);
  }
  majPanneau(devant);
}
function creerCarte(a) {
  const el = document.createElement('div');
  el.className = 'carte'; el.dataset.id = a.id;
  el.innerHTML = `<div class="face avant">${visuel(a, 'photo')}<div class="degrade"></div><div class="reflet"></div>
    <div class="badges"></div><div class="coeurs"></div>
    <div class="legende"><small>${esc(a.monde)}</small><b>${esc(a.nom)}</b></div>
    <button class="ajout-rapide" aria-label="Ajouter au programme">+</button><div class="ombre"></div></div>
    <div class="face dos"><div class="ombre"></div></div>`;
  majCarte(el, a);
  return el;
}
function majCarte(el, a) {
  const o = ouEst(a.id), e = etat.envies[a.id] || {};
  let b = '';
  if (a.tags.includes('nouveau')) b += '<span class="badge nouveau">Nouveau</span>';
  else if (a.tags.includes('incontournable')) b += '<span class="badge">⭐ Incontournable</span>';
  if (o) b += `<span class="badge place">✓ ${esc(o.jour.nom)}</span>`;
  el.querySelector('.badges').innerHTML = b;
  el.querySelector('.coeurs').innerHTML = (e.k ? '<i>Kim ♥</i>' : '') + (e.e ? '<i>Enzo ♥</i>' : '');
  el.classList.toggle('dedans', Boolean(o));
  const btn = el.querySelector('.ajout-rapide');
  btn.textContent = o ? '✓' : '+';
  btn.setAttribute('aria-label', o ? 'Déjà au programme' : `Ajouter à ${jourParId(etat.onglet)?.nom || 'notre programme'}`);
}
function majCartes() { for (const [id, el] of elems) majCarte(el, PAR_ID.get(id)); }
function oublierCarte(id) { const el = elems.get(id); if (el) { el.remove(); elems.delete(id); } rendreAnneau(); if (planPret) majPhotoEpingle(id); }
function majPanneau(id) {
  if (vue === 'plan') { majPanneauPlan(); return; }
  const N = liste.length;
  if (!id) { $('#monde').textContent = '—'; $('#compteur').textContent = '0 attraction'; return; }
  const a = PAR_ID.get(id);
  $('#monde').textContent = a.monde;
  $('#compteur').textContent = `${mod(Math.round(pos), N) + 1} / ${N} · ${a.parc === 'dlp' ? 'PARC DISNEYLAND' : 'ADVENTURE WORLD'}`;
}
function boucle() {
  let bouge = false;
  if (glisse.etat !== 'tourne' && !enRoue) {
    if (cible === null && Math.abs(vitesse) > 0.004) { pos += vitesse; vitesse *= 0.93; bouge = true; }
    else {
      vitesse = 0;
      const c = cible ?? Math.round(pos), diff = c - pos;
      if (Math.abs(diff) > 0.002) { pos += diff * 0.15; bouge = true; } else { pos = c; cible = null; }
    }
  }
  rendreAnneau();
  if (bouge || glisse.etat === 'tourne' || enRoue) requestAnimationFrame(boucle); else enCours = false;
}
function lancer() { if (!enCours) { enCours = true; requestAnimationFrame(boucle); } }
function allerA(id) {
  const N = liste.length, i = liste.findIndex(a => a.id === id);
  if (i < 0) return;
  vitesse = 0; cible = i + N * Math.round((pos - i) / N); lancer();
}
function decaler(n) { vitesse = 0; cible = (cible ?? Math.round(pos)) + n; lancer(); }
$('#prec').addEventListener('click', () => { if (vue === 'plan') naviguerPlan(-1); else { decaler(-1); cacherAide(); } });
$('#suiv').addEventListener('click', () => { if (vue === 'plan') naviguerPlan(1); else { decaler(1); cacherAide(); } });

// glisser sur le manège : tourner, ou attraper une carte
const glisse = { etat: null };
scene.addEventListener('pointerdown', e => {
  if (e.button > 0 || drag || vue === 'plan') return;
  if (e.target.closest('.ajout-rapide, .zone-retirer, .lien, .vues')) return;
  const carte = e.target.closest('.carte');
  Object.assign(glisse, { etat: 'indecis', source: 'anneau', x0: e.clientX, y0: e.clientY, pos0: pos, id: carte ? carte.dataset.id : null, pointer: e.pointerId, hist: [[e.clientX, performance.now()]] });
  vitesse = 0; cible = null;
  try { scene.setPointerCapture(e.pointerId); } catch {}
  clearTimeout(glisse.minuteur);
  if (glisse.id) glisse.minuteur = setTimeout(() => { if (glisse.etat === 'indecis') attraper(glisse.id, glisse.x0, glisse.y0, 'anneau'); }, 420);
});
scene.addEventListener('pointermove', e => {
  if (!glisse.etat) return;
  if (glisse.pointer !== e.pointerId || glisse.source !== 'anneau') return;
  const dx = e.clientX - glisse.x0, dy = e.clientY - glisse.y0;
  if (glisse.etat === 'indecis') {
    if (Math.hypot(dx, dy) < 9) return;
    clearTimeout(glisse.minuteur);
    if (glisse.id && Math.abs(dy) > Math.abs(dx) * 1.2) attraper(glisse.id, e.clientX, e.clientY, 'anneau');
    else { glisse.etat = 'tourne'; scene.classList.add('tourne'); cacherAide(); lancer(); }
  }
  if (glisse.etat === 'tourne') {
    pos = glisse.pos0 - dx / (W * 1.05);
    glisse.hist.push([e.clientX, performance.now()]);
    if (glisse.hist.length > 6) glisse.hist.shift();
  } else if (glisse.etat === 'porte') bougerFantome(e.clientX, e.clientY);
});
function finAnneau(e) {
  if (glisse.pointer !== e.pointerId || glisse.source !== 'anneau' || !glisse.etat) return;
  clearTimeout(glisse.minuteur);
  const et = glisse.etat; glisse.etat = null; scene.classList.remove('tourne');
  if (et === 'indecis') {
    if (e.type === 'pointerup' && glisse.id) toucherCarte(glisse.id);
    lancer();
  } else if (et === 'tourne') {
    const h = glisse.hist, [x1, t1] = h[0], [x2, t2] = h[h.length - 1];
    const v = t2 > t1 && performance.now() - t2 < 90 ? -(x2 - x1) / (t2 - t1) : 0;
    vitesse = Math.max(-0.7, Math.min(0.7, (v * 16) / (W * 1.05)));
    lancer();
  } else if (et === 'porte') lacher(e.type === 'pointerup');
}
scene.addEventListener('pointerup', finAnneau);
scene.addEventListener('pointercancel', finAnneau);
function toucherCarte(id) {
  const el = elems.get(id);
  if (el && el.classList.contains('devant')) ouvrirFiche(id);
  else allerA(id);
  cacherAide();
}
anneau.addEventListener('click', e => {
  const b = e.target.closest('.ajout-rapide'); if (!b) return;
  e.stopPropagation();
  const id = b.closest('.carte').dataset.id;
  if (ouEst(id)) { ouvrirFiche(id); return; }
  placer(id, etat.onglet);
  const j = jourParId(etat.onglet);
  toast(`${PAR_ID.get(id).nom} → ${j.nom} ✓`);
  cacherAide();
});
scene.addEventListener('wheel', e => {
  if (vue === 'plan') return;
  if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) && !e.shiftKey) return; // la molette verticale fait défiler la page
  e.preventDefault();
  const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
  pos += d / (W * 2.4); vitesse = 0; cible = null; enRoue = true; lancer();
  clearTimeout(roueT); roueT = setTimeout(() => { enRoue = false; lancer(); }, 160);
}, { passive: false });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { fermerFiche(); fermerModale(); return; }
  if (!$('#fiche').hidden || !$('#modale').hidden || ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A'].includes(document.activeElement?.tagName)) return;
  const r = scene.getBoundingClientRect();
  if (r.bottom < 0 || r.top > innerHeight) return;
  if (e.key === 'ArrowLeft') { if (vue === 'plan') naviguerPlan(-1); else decaler(-1); e.preventDefault(); }
  else if (e.key === 'ArrowRight') { if (vue === 'plan') naviguerPlan(1); else decaler(1); e.preventDefault(); }
  else if (e.key === 'Enter' && vue === 'plan' && choisie) ouvrirFiche(choisie);
  else if (e.key === 'Enter' && vue !== 'plan' && liste.length) { ouvrirFiche(liste[mod(Math.round(pos), liste.length)].id); }
});
function cacherAide() {
  const a = $('#aide');
  if (a.classList.contains('cachee')) return;
  a.classList.add('cachee'); ecrire(CLE_AIDE, 1);
  setTimeout(() => { a.hidden = true; }, 600);
}
if (lire(CLE_AIDE, 0)) $('#aide').hidden = true;

// ─── Glisser-déposer (cartes du manège et lignes du programme) ─────────────
const fantome = $('#fantome');
let drag = null, defilT = 0;
function attraper(id, x, y, source) {
  const a = infos(id); if (!a) return;
  glisse.etat = 'porte'; glisse.source = source; clearTimeout(glisse.minuteur);
  drag = { id, source, x, y, angle: 0, cible: null };
  fantome.innerHTML = `${a.photo || photos[id] ? visuel(a) : affiche(a)}<div class="nomf">${esc(a.nom)}</div>`;
  fantome.classList.remove('retour'); fantome.hidden = false;
  document.body.classList.add('glisse');
  if (source === 'liste') {
    $('#zoneRetirer').hidden = false;
    document.querySelector(`.ligne[data-id="${CSS.escape(id)}"]`)?.classList.add('porte');
  }
  if (navigator.vibrate) { try { navigator.vibrate(12); } catch {} }
  cacherAide();
  bougerFantome(x, y);
  clearInterval(defilT); defilT = setInterval(defilerListe, 30);
}
function bougerFantome(x, y) {
  if (!drag) return;
  const vx = x - drag.x; drag.x = x; drag.y = y;
  drag.angle = drag.angle * 0.8 + Math.max(-14, Math.min(14, vx * 0.9)) * 0.2;
  fantome.style.transform = `translate3d(${x - 60}px, ${y - 95}px, 0) rotate(${drag.angle.toFixed(1)}deg)`;
  const el = document.elementFromPoint(x, y);
  let c = null;
  const ong = el && el.closest('.onglet:not(.ajouter)');
  const ret = el && el.closest('[data-cible="retirer"]');
  const cadre = el && el.closest('.liste-cadre');
  if (ret) c = { type: 'retirer' };
  else if (ong) c = { type: 'onglet', jour: ong.dataset.jour };
  else if (cadre && cadre.offsetParent) c = { type: 'liste', index: indexInsertion(y) };
  else if (el && el.closest('.programme')) c = { type: 'onglet', jour: etat.onglet };
  drag.cible = c;
  for (const o of document.querySelectorAll('.onglet.survol')) if (!c || c.type !== 'onglet' || o.dataset.jour !== c.jour) o.classList.remove('survol');
  if (c && c.type === 'onglet') document.querySelector(`.onglet[data-jour="${CSS.escape(c.jour)}"]`)?.classList.add('survol');
  $('#zoneRetirer').classList.toggle('survol', Boolean(c && c.type === 'retirer'));
  placeVide(c && c.type === 'liste' ? c.index : null);
}
function indexInsertion(y) {
  const lignes = [...document.querySelectorAll('#liste .ligne')];
  let i = 0;
  for (const l of lignes) {
    if (l.classList.contains('porte')) { i++; continue; }
    const r = l.getBoundingClientRect();
    if (y < r.top + r.height / 2) return i;
    i++;
  }
  return lignes.length;
}
function placeVide(index) {
  let p = document.querySelector('.place-vide');
  if (index === null) { p?.remove(); return; }
  if (!p) { p = document.createElement('li'); p.className = 'place-vide'; }
  const lignes = [...document.querySelectorAll('#liste .ligne')];
  const avant = lignes[index];
  const listeEl = $('#liste');
  if (avant) { if (p.nextSibling !== avant) listeEl.insertBefore(p, avant); }
  else if (listeEl.lastElementChild !== p) listeEl.appendChild(p);
  listeEl.querySelector('.vide')?.setAttribute('hidden', '');
}
function defilerListe() {
  if (!drag) return;
  const cadre = $('#listeCadre');
  if (!cadre.offsetParent) return;
  const r = cadre.getBoundingClientRect();
  if (drag.x < r.left || drag.x > r.right) return;
  if (drag.y < r.top + 44 && drag.y > r.top - 30) cadre.scrollTop -= 9;
  else if (drag.y > r.bottom - 44 && drag.y < r.bottom + 30) cadre.scrollTop += 9;
}
function lacher(ok = true) {
  if (!drag) return;
  clearInterval(defilT);
  const { id, cible: c } = drag;
  const a = infos(id);
  drag = null;
  document.body.classList.remove('glisse');
  $('#zoneRetirer').hidden = true; $('#zoneRetirer').classList.remove('survol');
  for (const o of document.querySelectorAll('.onglet.survol')) o.classList.remove('survol');
  document.querySelector('.place-vide')?.remove();
  let reussi = false;
  if (ok && c && c.type === 'onglet') {
    placer(id, c.jour); etat.onglet = c.jour; sauver(); rendreProgramme(); reussi = true;
    toast(`${a.nom} → ${jourParId(c.jour).nom} ✓`);
  } else if (ok && c && c.type === 'liste') {
    placer(id, etat.onglet, c.index); reussi = true;
  } else if (ok && c && c.type === 'retirer') {
    const r = retirer(id); reussi = true;
    if (r) toast(`${a.nom} retirée`, { texte: 'Annuler', fn: () => placer(id, r.jour, r.k) });
  } else rendreProgramme();
  fantome.classList.add('retour');
  fantome.style.transform += reussi ? ' scale(.35)' : ' scale(.7)';
  setTimeout(() => { fantome.hidden = true; fantome.classList.remove('retour'); }, 360);
}
// bloque le défilement du téléphone pendant qu'on porte une carte
document.addEventListener('touchmove', e => { if (drag || glisse.etat === 'porte') e.preventDefault(); }, { passive: false });

// ─── Le programme ──────────────────────────────────────────────────────────
const prog = $('#programme'), listeEl = $('#liste');
function rendreProgramme() {
  const normaux = joursNormaux();
  $('#onglets').innerHTML = etat.jours.map(j => {
    const n = j.items.length, k = normaux.indexOf(j);
    const sous = `${n === 0 ? 'vide' : n === 1 ? '1 chose' : n + ' choses'}${!j.special && etat.date ? ' · ' + dateJour(k) : ''}`;
    return `<button class="onglet" role="tab" data-jour="${esc(j.id)}" aria-selected="${j.id === etat.onglet}"><strong>${esc(j.nom)}</strong><small>${sous}</small></button>`;
  }).join('') + '<button class="onglet ajouter" id="ajoutJour" aria-label="Ajouter un jour">＋</button>';
  const j = jourParId(etat.onglet), k = normaux.indexOf(j);
  $('#jourTete').innerHTML = `<h3>${esc(j.nom)}${!j.special && etat.date ? ` <small style="font-family:Manrope;font-size:.75rem;color:var(--or-2)">${dateJour(k)}</small>` : ''}</h3>
    <button class="mini" data-action="renommer">✏️ Renommer</button>
    ${!j.special && normaux.length > 1 ? '<button class="mini" data-action="supprimerJour" aria-label="Supprimer ce jour">🗑</button>' : ''}`;
  if (!j.items.length) {
    const rien = etat.jours.every(x => !x.items.length);
    listeEl.innerHTML = `<li class="vide">${j.special ? 'Ici, les attractions dont on n\'est pas encore sûrs.' : 'Glisse des cartes ici ✨<br>ou touche le <b>+</b> d\'une carte.'}
      ${rien ? '<br><button class="btn-doux" data-action="incontournables">⭐ Commencer avec les incontournables</button>' : ''}</li>`;
  } else {
    listeEl.innerHTML = j.items.map((it, i) => {
      const a = infos(it.id), e = etat.envies[it.id] || {};
      const coeurs = (e.k ? ' · Kim ♥' : '') + (e.e ? ' · Enzo ♥' : '');
      return `<li class="ligne${it.fait ? ' fait' : ''}" data-id="${esc(it.id)}">
        <span class="act tenir" aria-hidden="true">⋮⋮</span>
        <span class="num">${i + 1}</span>
        ${vignette(a)}
        <div class="l-texte" data-action="fiche"><span class="l-nom">${esc(a.nom)}</span><span class="l-sous">${esc(a.monde)}${coeurs}</span>${it.note ? `<span class="l-note">📝 ${esc(it.note)}</span>` : ''}</div>
        <button class="act coche" data-action="fait" aria-label="${it.fait ? 'Pas encore faite' : 'C\'est fait'}" aria-pressed="${it.fait}">✓</button>
        <button class="act" data-action="retirer" aria-label="Retirer">×</button>
      </li>`;
    }).join('');
  }
  majEpingles();
  const tout = normaux.flatMap(x => x.items), faits = tout.filter(i => i.fait).length;
  $('#progression').textContent = tout.length ? `${tout.length} au programme · ${faits} faite${faits > 1 ? 's' : ''}` : 'Rien pour l\'instant';
}
$('#onglets').addEventListener('click', e => {
  const b = e.target.closest('.onglet'); if (!b) return;
  if (b.id === 'ajoutJour') { ajouterJour(); return; }
  if (etat.onglet === b.dataset.jour && prog.classList.contains('ouvert')) { renommerJour(); return; }
  etat.onglet = b.dataset.jour; sauver(); rendreProgramme(); majCartes();
  ouvrirProgramme(true);
});
$('#onglets').addEventListener('dblclick', e => { if (e.target.closest('.onglet:not(.ajouter)')) renommerJour(); });
$('#jourTete').addEventListener('click', e => {
  const b = e.target.closest('[data-action]'); if (!b) return;
  if (b.dataset.action === 'renommer') renommerJour();
  else if (b.dataset.action === 'supprimerJour') supprimerJour();
});
listeEl.addEventListener('click', e => {
  const b = e.target.closest('[data-action]'); if (!b) return;
  const li = b.closest('.ligne'), id = li && li.dataset.id;
  const act = b.dataset.action;
  if (act === 'incontournables') { incontournables(); return; }
  if (!id) return;
  if (act === 'fiche') { if (PAR_ID.has(id)) { allerA(id); ouvrirFiche(id); } else editerPerso(id); }
  else if (act === 'fait') {
    const o = ouEst(id); if (!o) return;
    o.jour.items[o.k].fait = !o.jour.items[o.k].fait; sauver(); rendreProgramme();
    if (o.jour.items[o.k].fait) toast('Fait ! ✨');
  } else if (act === 'retirer') {
    const a = infos(id), r = retirer(id);
    if (r) toast(`${a.nom} retirée`, { texte: 'Annuler', fn: () => placer(id, r.jour, r.k) });
  }
});
// déplacer une ligne : la poignée ⋮⋮ (doigt), toute la ligne (souris), ou un appui long
listeEl.addEventListener('pointerdown', e => {
  if (e.button > 0 || drag) return;
  const li = e.target.closest('.ligne'); if (!li || e.target.closest('button')) return;
  const poignee = Boolean(e.target.closest('.tenir'));
  Object.assign(glisse, { etat: 'indecis', source: 'liste', x0: e.clientX, y0: e.clientY, id: li.dataset.id, pointer: e.pointerId, souris: e.pointerType === 'mouse', poignee });
  try { listeEl.setPointerCapture(e.pointerId); } catch {}
  clearTimeout(glisse.minuteur);
  if (poignee) attraper(li.dataset.id, e.clientX, e.clientY, 'liste');
  else glisse.minuteur = setTimeout(() => { if (glisse.etat === 'indecis' && glisse.source === 'liste') attraper(glisse.id, glisse.x0, glisse.y0, 'liste'); }, 450);
});
listeEl.addEventListener('pointermove', e => {
  if (glisse.source !== 'liste' || glisse.pointer !== e.pointerId || !glisse.etat) return;
  if (glisse.etat === 'indecis') {
    if (Math.hypot(e.clientX - glisse.x0, e.clientY - glisse.y0) < 7) return;
    clearTimeout(glisse.minuteur);
    if (glisse.souris) attraper(glisse.id, e.clientX, e.clientY, 'liste');
    else { glisse.etat = null; return; } // au doigt : c'est un défilement
  }
  if (glisse.etat === 'porte') bougerFantome(e.clientX, e.clientY);
});
function finListe(e) {
  if (glisse.source !== 'liste' || glisse.pointer !== e.pointerId) return;
  clearTimeout(glisse.minuteur);
  const et = glisse.etat; glisse.etat = null;
  if (et === 'porte') lacher(e.type === 'pointerup');
}
listeEl.addEventListener('pointerup', finListe);
listeEl.addEventListener('pointercancel', finListe);

function ouvrirProgramme(ouvrir) {
  prog.classList.toggle('ouvert', Boolean(ouvrir));
  $('#poignee').setAttribute('aria-expanded', String(Boolean(ouvrir)));
}
$('#poignee').addEventListener('click', () => ouvrirProgramme(!prog.classList.contains('ouvert')));
document.querySelector('.prog-tete').addEventListener('click', () => { if (innerWidth < 960) ouvrirProgramme(!prog.classList.contains('ouvert')); });

function ajouterJour() {
  const normaux = joursNormaux();
  const j = { id: 'j' + Date.now().toString(36), nom: `Jour ${normaux.length + 1}`, items: [] };
  etat.jours.splice(etat.jours.length - 1, 0, j);
  etat.onglet = j.id; sauver(); rendreProgramme(); ouvrirProgramme(true);
  toast(`${j.nom} ajouté`);
}
function renommerJour() {
  const j = jourParId(etat.onglet);
  modale(`<h3>Renommer</h3><p>Par exemple « Samedi », « Parc Disneyland » ou « Le jour des princesses ».</p>
    <input type="text" id="mNom" maxlength="40" value="${esc(j.nom)}">
    <div class="modale-actions"><button class="btn-doux" data-fermer>Annuler</button><button class="btn-or petit" id="mOk">Enregistrer</button></div>`, () => {
    const ok = () => { const v = $('#mNom').value.trim(); if (v) { j.nom = v; sauver(); rendreProgramme(); majCartes(); } fermerModale(); };
    $('#mOk').onclick = ok; $('#mNom').onkeydown = e => { if (e.key === 'Enter') ok(); };
    $('#mNom').focus(); $('#mNom').select();
  });
}
function supprimerJour() {
  const j = jourParId(etat.onglet), pe = etat.jours[etat.jours.length - 1];
  modale(`<h3>Supprimer « ${esc(j.nom)} » ?</h3><p>${j.items.length ? `Ses ${j.items.length} activités iront dans « ${esc(pe.nom)} ».` : 'Ce jour est vide.'}</p>
    <div class="modale-actions"><button class="btn-doux" data-fermer>Annuler</button><button class="btn-or petit" id="mOk">Supprimer</button></div>`, () => {
    $('#mOk').onclick = () => {
      pe.items.push(...j.items); etat.jours = etat.jours.filter(x => x !== j);
      etat.onglet = etat.jours[0].id; sauver(); rendreProgramme(); majCartes(); fermerModale();
    };
  });
}
function incontournables() {
  const normaux = joursNormaux();
  const j1 = normaux[0], j2 = normaux[1] || normaux[0];
  for (const a of A) if (a.tags.includes('incontournable') && !ouEst(a.id)) (a.parc === 'dlp' ? j1 : j2).items.push({ id: a.id, fait: false, note: '' });
  apresChangement(); ouvrirProgramme(true);
  toast('Les incontournables sont rangés ✨ À nous de trier !');
}

// activités à nous (churros, photo devant le château…)
$('#btnPerso').addEventListener('click', () => editerPerso(null));
function editerPerso(id) {
  const p = id ? etat.perso[id] : { nom: '', emoji: '🍿' };
  let emoji = p.emoji;
  modale(`<h3>${id ? 'Notre activité' : 'Ajouter une activité'}</h3>
    <p>Un repas, des churros, une photo devant le château, une boutique…</p>
    <input type="text" id="mNom" maxlength="60" placeholder="Ex. Churros sur Main Street" value="${esc(p.nom)}">
    <div class="emojis">${EMOJIS.map(x => `<button data-emoji="${x}" aria-pressed="${x === emoji}">${x}</button>`).join('')}</div>
    <div class="modale-actions">${id ? '<button class="btn-doux" id="mSuppr">Supprimer</button>' : ''}<button class="btn-doux" data-fermer>Annuler</button><button class="btn-or petit" id="mOk">${id ? 'Enregistrer' : `Ajouter à ${esc(jourParId(etat.onglet).nom)}`}</button></div>`, () => {
    $('.emojis').onclick = e => { const b = e.target.closest('[data-emoji]'); if (!b) return; emoji = b.dataset.emoji; for (const x of document.querySelectorAll('[data-emoji]')) x.setAttribute('aria-pressed', String(x === b)); };
    const ok = () => {
      const nom = $('#mNom').value.trim(); if (!nom) { $('#mNom').focus(); return; }
      if (id) { etat.perso[id] = { nom, emoji }; sauver(); rendreProgramme(); }
      else { const nid = 'c' + Date.now().toString(36); etat.perso[nid] = { nom, emoji }; placer(nid, etat.onglet); ouvrirProgramme(true); }
      fermerModale();
    };
    $('#mOk').onclick = ok; $('#mNom').onkeydown = e => { if (e.key === 'Enter') ok(); };
    if ($('#mSuppr')) $('#mSuppr').onclick = () => { retirer(id); delete etat.perso[id]; sauver(); rendreProgramme(); fermerModale(); };
    if (!id) $('#mNom').focus();
  });
}

// ─── Fiche d'une attraction ────────────────────────────────────────────────
let ficheId = null;
function ouvrirFiche(id) {
  const a = PAR_ID.get(id); if (!a) return;
  const nouvelle = ficheId !== id || $('#fiche').hidden;
  ficheId = id;
  $('#ficheImage').innerHTML = visuel(a);
  $('#ficheLieu').textContent = `${PARCS[a.parc]} · ${a.monde}`;
  $('#ficheNom').textContent = a.nom;
  const niv = `<span class="tag niveau">${[1, 2, 3].map(n => `<i class="${n <= a.niveau ? 'on' : ''}"></i>`).join('')}&nbsp;${NIVEAUX[a.niveau]}</span>`;
  $('#ficheTags').innerHTML = (a.tags.includes('spectacle') || a.tags.includes('rencontre') ? '' : niv) + a.tags.map(t => `<span class="tag">${TAGS[t]}</span>`).join('') + (a.taille ? `<span class="tag">📏 ${esc(a.taille)} minimum</span>` : '');
  $('#ficheDesc').textContent = a.desc;
  const e = etat.envies[id] || {};
  $('#ficheEnvies').innerHTML = `<button class="envie" data-qui="k" aria-pressed="${Boolean(e.k)}">${e.k ? '♥' : '♡'} Kim en a envie</button><button class="envie" data-qui="e" aria-pressed="${Boolean(e.e)}">${e.e ? '♥' : '♡'} Enzo en a envie</button>`;
  const o = ouEst(id);
  $('#ficheAjout').innerHTML = `<p>${o ? `Dans notre programme : <b style="color:var(--or-2)">${esc(o.jour.nom)}</b>` : 'Ajouter à notre programme'}</p>
    <div class="choix">${etat.jours.map(j => `<button data-jour="${esc(j.id)}" class="${o && o.jour === j ? 'ici' : ''}">${o && o.jour === j ? '✓ ' : ''}${esc(j.nom)}</button>`).join('')}${o ? '<button data-jour="">Retirer</button>' : ''}</div>
    ${o ? `<input type="text" id="ficheNote" maxlength="120" placeholder="📝 Une note (le soir, après manger…)" value="${esc(o.jour.items[o.k].note)}" style="margin-top:10px;width:100%;padding:.7em .9em;border-radius:12px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.05);color:inherit;font:inherit">` : ''}`;
  const n = $('#ficheNote');
  if (n) n.onchange = () => { const oo = ouEst(id); if (oo) { oo.jour.items[oo.k].note = n.value.trim(); sauver(); rendreProgramme(); } };
  const ph = a.photo;
  $('#fichePhoto').innerHTML = photos[id]
    ? `<span>📷 Notre photo</span><button class="lien" data-photo="enlever">Remettre la photo d'origine</button>`
    : `${ph ? `<span>Photo : ${ph.page ? `<a href="${ph.page}" target="_blank" rel="noopener">${esc(ph.auteur)}</a>` : esc(ph.auteur)}${ph.licence ? ' · ' + esc(ph.licence) : ''}${ph.lieu ? ' · prise à ' + esc(ph.lieu) : ''}</span>` : '<span>Pas encore de photo</span>'}
       <button class="lien" data-photo="mettre">📷 Mettre notre photo</button>`;
  const f = $('#fiche');
  if (f.hidden) { f.hidden = false; document.body.style.overflow = 'hidden'; }
  if (nouvelle) f.querySelector('.fiche').scrollTop = 0;
}
function fermerFiche() {
  if ($('#fiche').hidden) return;
  $('#fiche').hidden = true; document.body.style.overflow = ''; ficheId = null;
}
$('#fiche').addEventListener('click', e => {
  if (e.target === e.currentTarget || e.target.closest('[data-fermer]')) { fermerFiche(); return; }
  const id = ficheId; if (!id) return;
  const env = e.target.closest('[data-qui]');
  if (env) {
    const v = etat.envies[id] || (etat.envies[id] = {});
    v[env.dataset.qui] = !v[env.dataset.qui];
    if (!v.k && !v.e) delete etat.envies[id];
    sauver(); majCartes(); rendreProgramme(); ouvrirFiche(id);
    if (filtre === 'coeur') refiltrer();
    return;
  }
  const j = e.target.closest('[data-jour]');
  if (j) {
    if (j.dataset.jour) placer(id, j.dataset.jour);
    else retirer(id);
    ouvrirFiche(id); return;
  }
  const p = e.target.closest('[data-photo]');
  if (p) {
    if (p.dataset.photo === 'mettre') $('#champPhoto').click();
    else { delete photos[id]; ecrire(CLE_PHOTOS, photos); oublierCarte(id); rendreProgramme(); ouvrirFiche(id); }
  }
});
function voisine(n) {
  const base = liste.some(a => a.id === ficheId) ? liste : A;
  const i = base.findIndex(a => a.id === ficheId);
  const id = base[mod(i + n, base.length)].id;
  ouvrirFiche(id); allerA(id);
}
$('#fichePrec').addEventListener('click', () => voisine(-1));
$('#ficheSuiv').addEventListener('click', () => voisine(1));
$('#champPhoto').addEventListener('change', async e => {
  const f = e.target.files && e.target.files[0], id = ficheId;
  e.target.value = '';
  if (!f || !id) return;
  try {
    const url = URL.createObjectURL(f);
    const img = await new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = ko; i.src = url; });
    const k = Math.min(1, 720 / Math.max(img.naturalWidth, img.naturalHeight));
    const cv = document.createElement('canvas'); cv.width = Math.round(img.naturalWidth * k); cv.height = Math.round(img.naturalHeight * k);
    cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
    URL.revokeObjectURL(url);
    photos[id] = cv.toDataURL('image/jpeg', 0.8);
    if (!ecrire(CLE_PHOTOS, photos)) { delete photos[id]; toast('Plus de place sur ce téléphone pour une photo de plus'); return; }
    oublierCarte(id); rendreProgramme(); ouvrirFiche(id);
    toast('Photo enregistrée sur ce téléphone 📷');
  } catch { toast('Impossible de lire cette photo'); }
});

// ─── Petites fenêtres ──────────────────────────────────────────────────────
function modale(html, apres) {
  $('#modaleBoite').innerHTML = html;
  $('#modale').hidden = false;
  if (apres) apres();
}
function fermerModale() { $('#modale').hidden = true; $('#modaleBoite').innerHTML = ''; }
$('#modale').addEventListener('click', e => { if (e.target === e.currentTarget || e.target.closest('[data-fermer]')) fermerModale(); });

// ─── Envoyer notre liste (tout tient dans le lien) ─────────────────────────
const b64 = u8 => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const unb64 = s => { s = s.replace(/-/g, '+').replace(/_/g, '/'); const b = atob(s + '==='.slice((s.length + 3) % 4)); return Uint8Array.from(b, c => c.charCodeAt(0)); };
async function flux(u8, Classe) { return new Uint8Array(await new Response(new Blob([u8]).stream().pipeThrough(new Classe('deflate-raw'))).arrayBuffer()); }
async function encoder() {
  const o = {
    v: 1, d: etat.date || '', p: etat.perso,
    j: etat.jours.map(j => [j.nom, j.special ? 1 : 0, j.items.map(it => [it.id, it.fait ? 1 : 0, it.note || ''])]),
    e: Object.fromEntries(Object.entries(etat.envies).map(([id, v]) => [id, (v.k ? 'k' : '') + (v.e ? 'e' : '')]).filter(x => x[1])),
  };
  let u8 = new TextEncoder().encode(JSON.stringify(o)), pre = 'u';
  if ('CompressionStream' in window) { try { u8 = await flux(u8, CompressionStream); pre = 'z'; } catch {} }
  return pre + b64(u8);
}
async function decoder(code) {
  let u8 = unb64(code.slice(1));
  if (code[0] === 'z') u8 = await flux(u8, DecompressionStream);
  const o = JSON.parse(new TextDecoder().decode(u8));
  const perso = {};
  for (const [id, p] of Object.entries(o.p || {})) if (/^c\w{1,20}$/.test(id) && p && typeof p.nom === 'string') perso[id] = { nom: p.nom.slice(0, 60), emoji: String(p.emoji || '✨').slice(0, 8) };
  const envies = {};
  for (const [id, v] of Object.entries(o.e || {})) if (PAR_ID.has(id) && typeof v === 'string') envies[id] = { k: v.includes('k'), e: v.includes('e') };
  const jours = (Array.isArray(o.j) ? o.j : []).slice(0, 14).map((x, k) => ({
    id: x[1] ? 'pe' : 'j' + (k + 1), nom: String(x[0] || 'Jour'), special: Boolean(x[1]),
    items: (Array.isArray(x[2]) ? x[2] : []).map(it => ({ id: String(it[0]), fait: Boolean(it[1]), note: String(it[2] || '') })),
  }));
  return valider({ v: 1, date: String(o.d || ''), jours, perso, envies, onglet: jours[0] && jours[0].id });
}
$('#btnPartager').addEventListener('click', async () => {
  const url = location.href.split('#')[0] + '#p=' + await encoder();
  const peutPartager = typeof navigator.share === 'function';
  modale(`<h3>Envoyer notre liste 💌</h3><p>Ce lien contient toute la liste : les jours, l'ordre, les cœurs et les notes. Quand l'autre l'ouvre, elle s'affiche chez elle ou chez lui, on peut la modifier puis la renvoyer.</p>
    <div class="modale-actions">${peutPartager ? '<button class="btn-doux" id="mCopier">Copier le lien</button><button class="btn-or petit" id="mPartager">Envoyer…</button>' : '<button class="btn-doux" data-fermer>Fermer</button><button class="btn-or petit" id="mCopier">Copier le lien</button>'}</div>`, () => {
    $('#mCopier').onclick = async () => {
      try { await navigator.clipboard.writeText(url); toast('Lien copié ! Colle-le dans la conversation 💌'); }
      catch { window.prompt('Copie ce lien :', url); }
      fermerModale();
    };
    if ($('#mPartager')) $('#mPartager').onclick = async () => {
      try { await navigator.share({ title: 'Notre Disneyland', text: 'Notre liste pour Disneyland ✨', url }); fermerModale(); } catch {}
    };
  });
});
async function lireLien() {
  const m = location.hash.match(/^#p=([uz][\w-]+)$/);
  if (!m) return;
  history.replaceState(null, '', location.pathname + location.search);
  let recu;
  try { recu = await decoder(m[1]); } catch { recu = null; }
  if (!recu) { toast('Ce lien de liste est abîmé 😕'); return; }
  const nb = recu.jours.reduce((s, j) => s + j.items.length, 0);
  const appliquer = () => {
    etat = recu; sauver(); majDate(); rendreProgramme(); majCartes(); refiltrer(); fermerModale();
    toast('Liste reçue ✨'); document.getElementById('app').scrollIntoView();
  };
  const mienne = etat.jours.some(j => j.items.length) || Object.keys(etat.envies).length;
  if (!mienne) { appliquer(); return; }
  modale(`<h3>Une liste pour toi 💌</h3><p>On t'a envoyé une liste de <b>${nb}</b> activité${nb > 1 ? 's' : ''}. Tu veux l'ouvrir ? Elle remplacera celle de cet appareil.</p>
    <div class="modale-actions"><button class="btn-doux" data-fermer>Garder la mienne</button><button class="btn-or petit" id="mOk">Ouvrir cette liste</button></div>`, () => { $('#mOk').onclick = appliquer; });
}
window.addEventListener('hashchange', lireLien);

// ─── Tout recommencer ──────────────────────────────────────────────────────
$('#btnRecommencer').addEventListener('click', () => {
  modale(`<h3>Tout recommencer ?</h3><p>Le programme, les cœurs et les activités à nous seront effacés de cet appareil. La date est gardée.</p>
    <div class="modale-actions"><button class="btn-doux" data-fermer>Annuler</button><button class="btn-or petit" id="mOk">Tout effacer</button></div>`, () => {
    $('#mOk').onclick = () => { const d = etat.date; etat = defaut(); etat.date = d; sauver(); rendreProgramme(); majCartes(); refiltrer(); fermerModale(); toast('Tout est remis à zéro'); };
  });
});

// ─── Crédits des photos ────────────────────────────────────────────────────
$('#listeCredits').innerHTML = A.filter(a => a.photo).map(a => {
  const p = a.photo;
  return `<li><b>${esc(a.nom)}</b> — ${p.page ? `<a href="${p.page}" target="_blank" rel="noopener">${esc(p.auteur)}</a>` : esc(p.auteur)}${p.licence ? ' · ' + esc(p.licence) : ''}${p.lieu ? ' · prise à ' + esc(p.lieu) : ''}</li>`;
}).join('');

// ─── Le plan enchanté (semi-3D) ────────────────────────────────────────────
const PW = 2700, PH = 1200, OX = 1356, TILT = 52, Z_MAX = 1.8, RAD = Math.PI / 180;
const XY = {};
const placerXY = (ox, o) => { for (const [id, x, y] of o) XY[id] = [x + ox, y]; };
placerXY(OX, [
  ['railroad', 680, 765], ['vehicles', 640, 668], ['parade', 760, 600], ['talesofmagic', 640, 450], ['btm', 372, 655], ['phantom', 540, 705],
  ['riverboat', 480, 570], ['legends', 580, 500], ['roilion', 103, 485], ['pirates', 520, 150], ['indiana', 298, 195], ['adventureisle', 430, 232],
  ['robinson', 450, 320], ['aladdin', 553, 370], ['chateau', 705, 392], ['peterpan', 600, 122], ['smallworld', 965, 205], ['blancheneige', 630, 280],
  ['pinocchio', 655, 225], ['teacups', 790, 155], ['dumbo', 680, 150], ['casey', 857, 70], ['contes', 920, 100], ['alice', 745, 118],
  ['carrousel', 750, 225], ['meetmickey', 640, 92], ['princesses', 585, 300], ['hyperspace', 1040, 560], ['startours', 1113, 365], ['buzz', 898, 423],
  ['orbitron', 935, 480], ['autopia', 950, 650], ['nautilus', 1030, 590], ['philharmagique', 1170, 368],
]);
placerXY(0, [
  ['tower', 420, 540], ['tapis', 620, 505], ['magicien', 480, 655], ['together', 360, 610], ['stitch', 600, 710], ['animation', 560, 640],
  ['raiponce', 505, 370], ['raiponceshow', 560, 445], ['cascade', 720, 330], ['crush', 930, 520], ['carsrallye', 1010, 615], ['carsroadtrip', 880, 400],
  ['ratatouille', 1080, 720], ['rcracer', 1160, 300], ['parachute', 1060, 270], ['slinky', 1195, 410], ['flightforce', 230, 300], ['spiderman', 320, 360],
  ['herotraining', 370, 250], ['frozen', 800, 185], ['arendelleshow', 650, 235], ['rencontreroyale', 560, 168],
]);
const LIEUX = [
  ['Main Street, U.S.A.', OX + 705, 722], ['Frontierland', OX + 215, 455], ['Adventureland', OX + 330, 108], ['Fantasyland', OX + 1015, 140], ['Discoveryland', OX + 1150, 650],
  ['World Premiere', 672, 800], ['Adventure Way', 430, 425], ['World of Frozen', 960, 110], ['Avengers Campus', 250, 138], ['Worlds of Pixar', 1135, 565],
  ['Parc Disneyland', OX + 705, 885, 'parc'], ['Disney Adventure World', 672, 965, 'parc'], ['Disney Village', 1720, 975],
];
const DECORS = [['chateau', OX + 705, 352], ['btm', OX + 372, 600], ['manoir', OX + 528, 655], ['space', OX + 1045, 515], ['tour', 420, 480], ['chapeau', 560, 595], ['glace', 730, 105], ['arendelle', 560, 135], ['avengers', 240, 240]];
const CADRES = { tout: { x: 30, y: -30, w: 2640, h: 1080 }, dlp: { x: OX + 30, y: 0, w: 1300, h: 820 }, daw: { x: 60, y: 0, w: 1260, h: 920 } };
const carte = $('#carte3d'), planEl = $('#plan'), objets = $('#planObjets'), trajetEl = $('#trajet'), ap = $('#apercu');
const cam = { cx: PW / 2, cy: PH / 2, z: .3, r: 0, t: 0 };
let vue = lire('kimDisney.vue', 'plan') === 'manege' ? 'manege' : 'plan';
let apOuvert = 0, planPret = false, choisie = null, volAnim = 0, inertieAnim = 0, dernierTap = 0;
const borne = (v, a, b) => Math.max(a, Math.min(b, v));
const cadreCourant = () => (CADRES[parc] ? parc : 'tout');
function ajuster(cadre, t = TILT, r = 0) {
  const w = carte.clientWidth || 360, h = carte.clientHeight || 500;
  const tourne = Math.abs(Math.round(r / 90)) % 2 === 1;
  const fw = tourne ? cadre.h : cadre.w, fh = tourne ? cadre.w : cadre.h;
  let z = Math.min(w / fw, (h * 0.9) / (fh * Math.max(0.5, Math.cos(t * RAD)))) * 0.94;
  if (h > w * 1.15 && !tourne && cadre !== CADRES.tout) z = Math.min(z * 1.3, (h * 0.9) / (fh * Math.max(0.5, Math.cos(t * RAD))));
  return { cx: cadre.x + cadre.w / 2, cy: cadre.y + cadre.h / 2 + (t && !tourne ? cadre.h * 0.04 : 0), z };
}
// sur un téléphone en hauteur, la vue des deux parcs est tournée d'un quart de tour : elle est deux fois plus grande
function vueCadre(nom, t = TILT) {
  const portrait = carte.clientHeight > carte.clientWidth * 1.15;
  const r = nom === 'tout' && portrait ? -90 : 0;
  return { ...ajuster(CADRES[nom] || CADRES.tout, t, r), r, t };
}
const zMin = () => vueCadre('tout').z * 0.75;
const decalY = () => carte.clientHeight * (carte.clientHeight > carte.clientWidth * 1.15 ? 0.02 : 0.07);
function rendrePlan() {
  const { cx, cy, z, r, t } = cam;
  planEl.style.transform = `translate3d(0, ${decalY().toFixed(1)}px, 0) rotateX(${t.toFixed(2)}deg) scale3d(${z.toFixed(4)}, ${z.toFixed(4)}, ${z.toFixed(4)}) rotateZ(${r.toFixed(2)}deg) translate(${(-cx).toFixed(1)}px, ${(-cy).toFixed(1)}px)`;
  const s = borne(118 * z, 12, 58);
  planEl.style.setProperty('--r', r.toFixed(2));
  planEl.style.setProperty('--t', t.toFixed(2));
  planEl.style.setProperty('--k', (s / (64 * z)).toFixed(3));
  planEl.style.setProperty('--kl', borne(0.42 / z, 1, 2.3).toFixed(3));
  planEl.style.setProperty('--ep', (2.6 / Math.sqrt(z)).toFixed(2));
  carte.classList.toggle('loin', s < 27);
  carte.classList.toggle('pres', z > 0.85);
  carte.classList.toggle('tourne', Math.abs(((r % 180) + 180) % 180 - 90) < 30);
}
function borner() {
  cam.z = borne(cam.z, zMin(), Z_MAX);
  cam.cx = borne(cam.cx, 0, PW); cam.cy = borne(cam.cy, -60, PH);
}
function versPlan(dx, dy, z = cam.z, r = cam.r, t = cam.t) {
  const ux = dx / z, uy = dy / (z * Math.max(0.3, Math.cos(t * RAD)));
  const c = Math.cos(r * RAD), s = Math.sin(r * RAD);
  return [ux * c + uy * s, -ux * s + uy * c];
}
function ecranFocus() { const b = carte.getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2 + decalY()]; }
function pointPlan(sx, sy, c = cam) { const [fx, fy] = ecranFocus(); const [px, py] = versPlan(sx - fx, sy - fy, c.z, c.r, c.t); return [c.cx + px, c.cy + py]; }
function arreterVol() { cancelAnimationFrame(volAnim); cancelAnimationFrame(inertieAnim); volAnim = inertieAnim = 0; }
function voler(dest, ms = 900) {
  arreterVol();
  const de = { ...cam }, t0 = performance.now();
  if (dest.r !== undefined) { let d = ((dest.r - de.r) % 360 + 540) % 360 - 180; dest = { ...dest, r: de.r + d }; }
  const pas = now => {
    const u = Math.min(1, (now - t0) / ms), e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
    for (const k of ['cx', 'cy', 'r', 't']) if (dest[k] !== undefined) cam[k] = de[k] + (dest[k] - de[k]) * e;
    if (dest.z !== undefined) cam.z = de.z * Math.pow(dest.z / de.z, e);
    rendrePlan();
    volAnim = u < 1 ? requestAnimationFrame(pas) : 0;
  };
  volAnim = requestAnimationFrame(pas);
}
function zoomEn(sx, sy, f, anime = true) {
  const P = pointPlan(sx, sy), z = borne(cam.z * f, zMin(), Z_MAX);
  const [fx, fy] = ecranFocus(), [px, py] = versPlan(sx - fx, sy - fy, z, cam.r, cam.t);
  const dest = { z, cx: borne(P[0] - px, 0, PW), cy: borne(P[1] - py, -60, PH) };
  if (anime) voler(dest, 380); else { Object.assign(cam, dest); rendrePlan(); }
}
function zoomDetail() { return Math.min(1.4, Math.max(vueCadre('dlp').z * 2.2, 0.62)); }

function photoDe(a) { return photos[a.id] || (a.photo && a.photo.src) || ''; }
function construirePlan() {
  let h = '';
  for (const [nom, x, y, cls] of LIEUX) h += `<div class="lieu-nom ${cls || ''}" style="left:${x}px;top:${y}px">${esc(nom)}</div>`;
  for (const [cle, x, y] of DECORS) {
    const d = window.DECOR && window.DECOR[cle]; if (!d) continue;
    h += `<div class="decor" style="left:${x}px;top:${y}px;--l:${d.l}px"><div class="ombre-sol"></div><div class="debout" style="width:${d.l}px;height:${d.h}px">${d.svg}</div></div>`;
  }
  A.forEach((a, i) => {
    const p = XY[a.id]; if (!p) return;
    const c = (COULEURS[a.monde] || [])[1] || '#f5c76b';
    h += `<div class="epingle" data-id="${a.id}" style="left:${p[0]}px;top:${p[1]}px;--c:${c};--d:${(0.35 + i * 0.022).toFixed(3)}s">
      <div class="halo-sol"></div>
      <div class="debout" role="button" tabindex="0" aria-label="${esc(a.nom)}"><div class="etiquette">${esc(a.nom)}</div>
      <div class="bulle"><img src="${photoDe(a)}" alt="" style="object-position:${a.photo ? a.photo.pos : '50% 50%'}" draggable="false" loading="lazy"><span class="numero"></span></div><div class="tige"></div></div></div>`;
  });
  objets.innerHTML = h;
}
function majPhotoEpingle(id) {
  const img = objets.querySelector(`.epingle[data-id="${CSS.escape(id)}"] img`);
  const a = PAR_ID.get(id); if (img && a) img.src = photoDe(a);
}
function cheminLisse(pts) {
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0]},${p2[1]}`;
  }
  return d;
}
function majEpingles() {
  if (!planPret) return;
  const j = jourParId(etat.onglet);
  const ordre = new Map();
  if (j) j.items.forEach((it, k) => { if (XY[it.id]) ordre.set(it.id, k + 1); });
  const visibles = new Set(liste.map(a => a.id));
  for (const el of objets.querySelectorAll('.epingle')) {
    const id = el.dataset.id, n = ordre.get(id);
    el.classList.toggle('au-jour', Boolean(n));
    el.classList.toggle('ailleurs', Boolean(!n && ouEst(id)));
    el.classList.toggle('eteinte', !visibles.has(id));
    el.classList.toggle('choisie', id === choisie);
    el.querySelector('.numero').textContent = n || '';
  }
  const pts = [...ordre.keys()].map(id => XY[id]);
  trajetEl.innerHTML = pts.length > 1 ? `<path class="t-lueur" d="${cheminLisse(pts)}"/><path class="t-trait" d="${cheminLisse(pts)}"/>` : '';
  if (choisie && !ap.hidden) afficherApercu(PAR_ID.get(choisie));
  majPanneauPlan();
}
function majPanneauPlan() {
  if (vue !== 'plan') return;
  const N = liste.length, i = liste.findIndex(a => a.id === choisie);
  if (choisie) {
    const a = PAR_ID.get(choisie);
    $('#monde').textContent = a.monde;
    $('#compteur').textContent = i >= 0 ? `${i + 1} / ${N} · ${a.parc === 'dlp' ? 'PARC DISNEYLAND' : 'ADVENTURE WORLD'}` : (a.parc === 'dlp' ? 'PARC DISNEYLAND' : 'ADVENTURE WORLD');
  } else {
    $('#monde').textContent = parc === 'dlp' ? 'Parc Disneyland' : parc === 'daw' ? 'Disney Adventure World' : 'Disneyland Paris';
    $('#compteur').textContent = `${N} ATTRACTION${N > 1 ? 'S' : ''}`;
  }
}
function afficherApercu(a) {
  const o = ouEst(a.id), src = photoDe(a);
  ap.innerHTML = `<button class="ap-fermer" data-ap="fermer" aria-label="Fermer">×</button>
    ${src ? `<img src="${src}" alt="" data-ap="fiche" style="object-position:${a.photo ? a.photo.pos : '50% 50%'}">` : ''}
    <div class="ap-texte"><small>${esc(a.monde)}</small><b>${esc(a.nom)}</b>
      <div class="ap-actions">${etat.jours.map(j => `<button data-jour="${esc(j.id)}" class="${o && o.jour === j ? 'ici' : ''}">${o && o.jour === j ? '✓' : '＋'} ${esc(j.nom)}</button>`).join('')}<button class="voir" data-ap="fiche">Voir ›</button></div>
    </div>`;
  if (ap.hidden) apOuvert = performance.now();
  ap.hidden = false;
}
function choisir(id, aller = true) {
  const a = PAR_ID.get(id); if (!a || !XY[id]) return;
  choisie = id; majEpingles(); afficherApercu(a);
  if (aller) { const [x, y] = XY[id]; voler({ cx: x, cy: y - 20, z: Math.max(cam.z, zoomDetail()) }, 850); }
}
function deselectionner() { choisie = null; ap.hidden = true; majEpingles(); }
function naviguerPlan(n) {
  if (!liste.length) return;
  const i = liste.findIndex(a => a.id === choisie);
  choisir(liste[mod((i < 0 ? (n > 0 ? -1 : 0) : i) + n, liste.length)].id);
}
ap.addEventListener('click', e => {
  const j = e.target.closest('[data-jour]'), b = e.target.closest('[data-ap]');
  if (!choisie || performance.now() - apOuvert < 450) return;
  if (j) {
    const o = ouEst(choisie);
    if (o && o.jour.id === j.dataset.jour) retirer(choisie);
    else { placer(choisie, j.dataset.jour); toast(`${PAR_ID.get(choisie).nom} → ${jourParId(j.dataset.jour).nom} ✓`); }
  } else if (b && b.dataset.ap === 'fiche') ouvrirFiche(choisie);
  else if (b && b.dataset.ap === 'fermer') deselectionner();
});
document.querySelector('.plan-outils').addEventListener('click', e => {
  const b = e.target.closest('[data-outil]'); if (!b) return;
  const [fx, fy] = ecranFocus();
  cacherAidePlan();
  switch (b.dataset.outil) {
    case 'plus': zoomEn(fx, fy, 1.6); break;
    case 'moins': zoomEn(fx, fy, 1 / 1.6); break;
    case 'tourner': voler({ r: cam.r + 45 }, 700); break;
    case 'relief': { const t = cam.t > 10 ? 0 : TILT; voler({ t }, 700); b.textContent = t ? '2D' : '3D'; break; }
    case 'centrer': voler(vueCadre(cadreCourant(), cam.t), 900); break;
  }
});
// gestes : glisser, pincer / tourner à deux doigts, molette, double appui, appui long sur une épingle
const pointeurs = new Map();
let geste = null;
carte.addEventListener('pointerdown', e => {
  if (e.button > 0 || e.target.closest('.plan-outils, .apercu, .vues')) return;
  if (drag) return;
  try { carte.setPointerCapture(e.pointerId); } catch {}
  pointeurs.set(e.pointerId, { x: e.clientX, y: e.clientY });
  arreterVol();
  cacherAidePlan();
  if (pointeurs.size === 1) {
    const ep = e.target.closest('.epingle');
    geste = { type: 'pan', x0: e.clientX, y0: e.clientY, cam0: { ...cam }, id: ep ? ep.dataset.id : null, bouge: false, hist: [[e.clientX, e.clientY, performance.now()]] };
    if (geste.id) {
      const g = geste;
      g.minuteur = setTimeout(() => { if (geste === g && !g.bouge) { g.type = 'porte'; attraper(g.id, g.x0, g.y0, 'plan'); } }, 450);
    }
  } else if (pointeurs.size === 2) {
    if (geste) clearTimeout(geste.minuteur);
    const [a, b] = [...pointeurs.values()];
    const m0 = [(a.x + b.x) / 2, (a.y + b.y) / 2];
    geste = { type: 'pince', d0: Math.hypot(b.x - a.x, b.y - a.y) || 1, a0: Math.atan2(b.y - a.y, b.x - a.x), cam0: { ...cam }, P0: pointPlan(m0[0], m0[1]) };
  }
});
carte.addEventListener('pointermove', e => {
  if (!pointeurs.has(e.pointerId) || !geste) return;
  pointeurs.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (geste.type === 'porte') { bougerFantome(e.clientX, e.clientY); return; }
  if (geste.type === 'pince' && pointeurs.size >= 2) {
    const [a, b] = [...pointeurs.values()];
    cam.z = borne(geste.cam0.z * Math.hypot(b.x - a.x, b.y - a.y) / geste.d0, zMin(), Z_MAX);
    cam.r = geste.cam0.r + (Math.atan2(b.y - a.y, b.x - a.x) - geste.a0) / RAD;
    const m = [(a.x + b.x) / 2, (a.y + b.y) / 2], [fx, fy] = ecranFocus(), [px, py] = versPlan(m[0] - fx, m[1] - fy);
    cam.cx = geste.P0[0] - px; cam.cy = geste.P0[1] - py; borner(); rendrePlan();
    return;
  }
  if (geste.type === 'pan') {
    const dx = e.clientX - geste.x0, dy = e.clientY - geste.y0;
    if (!geste.bouge && Math.hypot(dx, dy) < 7) return;
    if (!geste.bouge) { geste.bouge = true; clearTimeout(geste.minuteur); carte.classList.add('glisse-plan'); }
    const [px, py] = versPlan(dx, dy, geste.cam0.z, geste.cam0.r, geste.cam0.t);
    cam.cx = geste.cam0.cx - px; cam.cy = geste.cam0.cy - py; borner(); rendrePlan();
    geste.hist.push([e.clientX, e.clientY, performance.now()]);
    if (geste.hist.length > 6) geste.hist.shift();
  }
});
function finPlan(e) {
  if (!pointeurs.has(e.pointerId)) return;
  pointeurs.delete(e.pointerId);
  if (!geste) return;
  if (geste.type === 'porte') { if (!pointeurs.size) { lacher(e.type === 'pointerup'); glisse.etat = null; geste = null; } return; }
  if (geste.type === 'pince') {
    if (pointeurs.size === 1) { const [p] = pointeurs.values(); geste = { type: 'pan', x0: p.x, y0: p.y, cam0: { ...cam }, bouge: true, hist: [[p.x, p.y, performance.now()]] }; }
    else if (!pointeurs.size) geste = null;
    return;
  }
  clearTimeout(geste.minuteur); carte.classList.remove('glisse-plan');
  if (!geste.bouge && e.type === 'pointerup') {
    const maintenant = performance.now();
    if (geste.id) { if (choisie === geste.id) ouvrirFiche(geste.id); else choisir(geste.id); }
    else if (maintenant - dernierTap < 320) zoomEn(e.clientX, e.clientY, 1.8);
    else if (choisie) deselectionner();
    dernierTap = geste.id ? 0 : maintenant;
  } else if (geste.bouge) {
    const h = geste.hist, [x1, y1, t1] = h[0], [x2, y2, t2] = h[h.length - 1];
    if (t2 > t1 && performance.now() - t2 < 80) {
      let vx = (x2 - x1) / (t2 - t1) * 16, vy = (y2 - y1) / (t2 - t1) * 16;
      const pas = () => {
        vx *= 0.92; vy *= 0.92;
        const [px, py] = versPlan(vx, vy); cam.cx -= px; cam.cy -= py; borner(); rendrePlan();
        inertieAnim = Math.hypot(vx, vy) > 0.4 ? requestAnimationFrame(pas) : 0;
      };
      inertieAnim = requestAnimationFrame(pas);
    }
  }
  geste = null;
}
carte.addEventListener('pointerup', finPlan);
carte.addEventListener('pointercancel', finPlan);
carte.addEventListener('wheel', e => {
  e.preventDefault(); e.stopPropagation(); arreterVol(); cacherAidePlan();
  zoomEn(e.clientX, e.clientY, Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0016)), false);
}, { passive: false });
carte.addEventListener('keydown', e => {
  const d = e.target.closest && e.target.closest('.epingle');
  if (d && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); choisir(d.dataset.id); }
});
function cacherAidePlan() {
  const a = $('#aidePlan');
  if (!a || a.classList.contains('cachee')) return;
  a.classList.add('cachee'); ecrire('kimDisney.aidePlan', 1); setTimeout(() => { a.hidden = true; }, 600);
}
if (lire('kimDisney.aidePlan', 0)) $('#aidePlan').hidden = true;
function initPlan() {
  construirePlan(); planPret = true; majEpingles();
  const fin = vueCadre(cadreCourant());
  Object.assign(cam, { ...vueCadre(cadreCourant(), 0), t: 0 }); cam.r = fin.r - 20; cam.z *= 0.8;
  rendrePlan();
  setTimeout(() => voler(fin, 2200), 250);
}
function changerVue(v) {
  vue = v; scene.dataset.vue = v; ecrire('kimDisney.vue', v);
  for (const b of document.querySelectorAll('#vues [data-vue]')) b.setAttribute('aria-selected', String(b.dataset.vue === v));
  if (v === 'plan') { if (!planPret) initPlan(); else { rendrePlan(); majEpingles(); } }
  else { ap.hidden = true; dimensions(); }
}
$('#vues').addEventListener('click', e => { const b = e.target.closest('[data-vue]'); if (b && b.dataset.vue !== vue) changerVue(b.dataset.vue); });
new ResizeObserver(() => { if (vue === 'plan' && planPret) { borner(); rendrePlan(); } }).observe(carte);

// ─── Lanternes du haut ─────────────────────────────────────────────────────
(function lanternes() {
  const cv = $('#lanternes'), ctx = cv.getContext('2d');
  if (!ctx || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const halo = document.createElement('canvas'); halo.width = halo.height = 64;
  const hc = halo.getContext('2d'), g = hc.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,214,140,.9)'); g.addColorStop(.3, 'rgba(255,170,90,.38)'); g.addColorStop(1, 'rgba(255,140,60,0)');
  hc.fillStyle = g; hc.fillRect(0, 0, 64, 64);
  let w = 0, h = 0, L = [], visible = true, t = 0, leger = false, lentes = 0, dernier = 0, saute = false;
  function taille() {
    const dpr = Math.min(1.5, devicePixelRatio || 1);
    w = cv.clientWidth; h = cv.clientHeight; cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = leger ? 8 : w < 600 ? 14 : 24;
    L = Array.from({ length: n }, () => nouvelle(true));
  }
  function nouvelle(partout) {
    const s = 5 + Math.random() * 9;
    return { x: Math.random() * w, y: partout ? h * (0.25 + Math.random() * 0.8) : h + 20, s, v: 0.12 + s * 0.022, ph: Math.random() * 6.3, f: 0.4 + Math.random() * 0.5 };
  }
  function image(ms) {
    if (!visible) return;
    requestAnimationFrame(image);
    const dt = dernier ? ms - dernier : 16; dernier = ms;
    if (!leger && dt > 45 && ms > 1500) { if (++lentes > 40) { leger = true; taille(); } } // appareil lent : moins de lanternes
    if (leger && (saute = !saute)) return;
    t += 0.016;
    ctx.clearRect(0, 0, w, h);
    for (const l of L) {
      l.y -= l.v * (leger ? 2 : 1); l.x += Math.sin(t * l.f + l.ph) * 0.18;
      if (l.y < -30) Object.assign(l, nouvelle(false));
      const fondu = Math.min(1, (h - l.y) / 120) * Math.min(1, (l.y + 30) / (h * 0.35));
      const scint = 0.8 + Math.sin(t * 3 + l.ph * 5) * 0.12;
      ctx.globalAlpha = Math.max(0, fondu * scint);
      ctx.drawImage(halo, l.x - l.s * 2.6, l.y - l.s * 2.6, l.s * 5.2, l.s * 5.2);
      ctx.fillStyle = '#ffd38a';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(l.x - l.s * 0.42, l.y - l.s * 0.6, l.s * 0.84, l.s * 1.15, l.s * 0.25); else ctx.rect(l.x - l.s * 0.42, l.y - l.s * 0.6, l.s * 0.84, l.s * 1.15);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  taille();
  addEventListener('resize', taille);
  new IntersectionObserver(([en]) => { const v = en.isIntersecting && !document.hidden; if (v && !visible) { visible = true; dernier = 0; requestAnimationFrame(image); } else visible = v; }).observe(cv);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && !visible && cv.getBoundingClientRect().bottom > 0) { visible = true; dernier = 0; requestAnimationFrame(image); } else if (document.hidden) visible = false; });
  requestAnimationFrame(image);
})();

// ─── Ciel étoilé derrière le plan et le manège (étoiles qui scintillent, quelques lanternes) ───
(function ciel() {
  const cv = $('#ciel'); if (!cv) return;
  const ctx = cv.getContext('2d'); if (!ctx) return;
  const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const halo = document.createElement('canvas'); halo.width = halo.height = 48;
  const hc = halo.getContext('2d'), g = hc.createRadialGradient(24, 24, 0, 24, 24, 24);
  g.addColorStop(0, 'rgba(255,214,140,.85)'); g.addColorStop(.35, 'rgba(255,170,90,.3)'); g.addColorStop(1, 'rgba(255,140,60,0)');
  hc.fillStyle = g; hc.fillRect(0, 0, 48, 48);
  let w = 0, h = 0, E = [], L = [], fondEtoiles = null, visible = false, t = 0, saute = false;
  function taille() {
    w = cv.clientWidth; h = cv.clientHeight; if (!w || !h) return;
    cv.width = w; cv.height = h;
    E = Array.from({ length: Math.round(w * h / 5200) }, () => ({ x: Math.random() * w, y: Math.random() * h * 0.85, r: Math.random() < .12 ? 1.4 : .7, ph: Math.random() * 6.3, v: .6 + Math.random() * 1.6 }));
    fondEtoiles = document.createElement('canvas'); fondEtoiles.width = w; fondEtoiles.height = h;
    const f = fondEtoiles.getContext('2d');
    for (let k = 0; k < w * h / 2600; k++) { f.fillStyle = `rgba(255,255,255,${(.08 + Math.random() * .22).toFixed(2)})`; f.fillRect(Math.random() * w, Math.random() * h * .9, 1, 1); }
    L = Array.from({ length: w < 600 ? 5 : 9 }, () => nouvelle(true));
  }
  function nouvelle(partout) { const s = 4 + Math.random() * 6; return { x: Math.random() * w, y: partout ? Math.random() * h : h + 20, s, v: .15 + s * .03, ph: Math.random() * 6.3 }; }
  function image() {
    if (!visible) return;
    requestAnimationFrame(image);
    if ((saute = !saute)) return; // 30 images/s suffisent
    t += .033;
    ctx.clearRect(0, 0, w, h);
    if (fondEtoiles) ctx.drawImage(fondEtoiles, 0, 0);
    for (const e of E) {
      ctx.globalAlpha = .35 + .65 * Math.abs(Math.sin(t * e.v + e.ph));
      ctx.fillStyle = '#fff'; ctx.fillRect(e.x, e.y, e.r * 1.6, e.r * 1.6);
    }
    for (const l of L) {
      l.y -= l.v; l.x += Math.sin(t * .8 + l.ph) * .25;
      if (l.y < -20) Object.assign(l, nouvelle(false));
      ctx.globalAlpha = Math.min(1, (h - l.y) / 160) * .85;
      ctx.drawImage(halo, l.x - l.s * 2.4, l.y - l.s * 2.4, l.s * 4.8, l.s * 4.8);
      ctx.fillStyle = '#ffd38a'; ctx.fillRect(l.x - l.s * .4, l.y - l.s * .55, l.s * .8, l.s * 1.1);
    }
    ctx.globalAlpha = 1;
  }
  taille();
  new ResizeObserver(taille).observe(cv);
  if (calme) { visible = true; image(); visible = false; return; }
  new IntersectionObserver(([en]) => { const v = en.isIntersecting; if (v && !visible) { visible = true; requestAnimationFrame(image); } else visible = v; }).observe(cv);
})();

// ─── Démarrage ─────────────────────────────────────────────────────────────
new ResizeObserver(() => dimensions()).observe(scene);
refiltrer(true);
pos = Math.max(0, liste.findIndex(a => a.id === 'raiponce')); // le manège s'ouvre sur Raiponce
changerVue(vue);
dimensions();
rendreProgramme();
majDate();
lireLien();
window.__kd = { etat: () => etat, liste: () => liste, pos: () => pos, attraper, bougerFantome, lacher, placer, encoder, decoder };
})();
