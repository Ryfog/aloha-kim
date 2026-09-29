/* ==========================================================================
   LES LETTRES — c'est ici qu'on change les textes.
   texte : un paragraphe par ligne du tableau.
   bonus : ce qu'il y a « dedans » : coupon, calin, bisous, chanson, final.
   c / c2 : les deux couleurs de l'enveloppe.
   ========================================================================== */
const LETTRES = [
  {
    titre: 'Ouvre-moi en premier',
    img: 'img/bras-ouverts.webp',
    c: '#8FD3F5', c2: '#5FAFE3',
    texte: [
      'Aloha Kim !',
      'Un petit extraterrestre bleu a squatté mon ordi pour te préparer ce coin de plage. Il a caché neuf lettres dans le sable. Il a aussi essayé de manger deux enveloppes, mais je les ai rattrapées à temps.',
      'Ouvre-les à ton rythme, dans l’ordre que tu veux. La dernière est fermée à clé : elle ne s’ouvre qu’une fois toutes les autres lues.'
    ],
    signe: 'Stitch & Enzo'
  },
  {
    titre: 'Ohana',
    img: 'img/main-dans-la-main.webp',
    c: '#F7B6D2', c2: '#EE8DB8',
    texte: [
      'Dans le film, Lilo explique à Stitch : « Ohana signifie famille, et famille signifie que personne ne doit être abandonné, ni oublié. »',
      'Moi, j’ajoute une ligne à la règle : toi, je ne risque pas de t’oublier.',
      'Même Stitch, qui oublie tout sauf l’endroit où sont cachés les cookies, se souvient de toi.'
    ],
    signe: 'Enzo'
  },
  {
    titre: 'Bon pour un câlin',
    img: 'img/calin.webp',
    c: '#A8E6D9', c2: '#62C6B2',
    texte: [
      'Stitch a imprimé ce bon lui-même. L’imprimante n’a pas survécu, mais le bon, lui, est parfaitement valable.'
    ],
    bonus: {
      type: 'coupon',
      quoi: 'un câlin géant',
      cond: 'Valable à vie · autant de fois que tu veux · durée : jusqu’à ce que tu dises stop (et même un peu après)',
      num: 'N° 626-001',
      tampon: 'Ohana'
    },
    signe: 'Stitch & Enzo'
  },
  {
    titre: 'Ton sourire',
    img: 'img/timide.webp',
    c: '#FFCBA8', c2: '#F6A57A',
    texte: [
      'Tu sais ce qui me fait le même effet qu’un gâteau à Stitch ?',
      'Ton sourire.',
      'Je fonds, je rougis, et j’oublie complètement ce que j’allais dire. Stitch prétend que ça se voit de très loin. Je nie tout.'
    ],
    signe: 'Enzo (tout rouge)'
  },
  {
    titre: 'Pour les jours gris',
    img: 'img/souillon.webp',
    c: '#CDBDF2', c2: '#A68FE0',
    texte: [
      'Si tu ouvres cette lettre un jour où ça ne va pas : respire un grand coup.',
      'Stitch te prête Souillon, sa poupée préférée. Il ne la prête jamais à personne, alors c’est une énorme preuve d’amour.',
      'Et moi, je te prête mes bras, mes oreilles et toutes mes blagues nulles. Tu n’es jamais toute seule.'
    ],
    bonus: { type: 'calin' },
    signe: 'Enzo'
  },
  {
    titre: 'Bon pour une soirée cocooning',
    img: 'img/cocooning.webp',
    c: '#F7B6D2', c2: '#EE8DB8',
    texte: [
      'Programme officiel, validé par Angel : un plaid immense, un film de ton choix, des snacks en quantité déraisonnable et zéro téléphone. Juste nous deux.',
      'Stitch a déjà enfilé son peignoir. Il attend.'
    ],
    bonus: {
      type: 'coupon',
      quoi: 'une soirée cocooning',
      cond: 'Plaid, film, snacks et câlins inclus · à réclamer quand tu veux',
      num: 'N° 626-002',
      tampon: 'Mahalo'
    },
    signe: 'Stitch, Angel & Enzo'
  },
  {
    titre: 'Des bisous pour Stitch',
    img: 'img/amoureux.webp',
    c: '#8FD3F5', c2: '#5FAFE3',
    texte: [
      'Stitch a entendu dire que tu faisais les meilleurs bisous de la galaxie. Il réclame une preuve.'
    ],
    bonus: { type: 'bisous' },
    signe: 'Stitch (qui attend)'
  },
  {
    titre: 'Une chanson pour toi',
    img: 'img/ukulele.webp',
    c: '#FFE08A', c2: '#F5C247',
    texte: [
      'Stitch voulait t’écrire une chanson au ukulélé. Il ne connaît que trois accords, et il en a cassé deux.',
      'Voilà quand même le résultat. Monte le son.'
    ],
    bonus: { type: 'chanson' },
    signe: 'Stitch, auteur-compositeur'
  },
  {
    titre: 'La lettre secrète',
    img: 'img/coeur.webp',
    c: '#FFD6E8', c2: '#F39CC3',
    secrete: true,
    texte: [
      'Tu les as toutes ouvertes ! Stitch est tellement fier de toi qu’il danse le hula depuis dix minutes et refuse de s’arrêter.',
      'Cette dernière lettre, c’est moi qui l’écris, sans l’aide d’aucun extraterrestre.',
      'Merci d’être toi, Kim. Merci pour ton sourire, pour ta façon d’être, et pour tous ces petits moments où tu me rends heureux sans même t’en rendre compte.',
      'Je t’aime. 💙'
    ],
    bonus: { type: 'final' },
    signe: 'Enzo'
  }
];

/* Ce que Stitch répond quand on le touche sur la plage */
const BULLES = [
  'Aloha, Kim !',
  'Ih ! (ça veut dire coucou)',
  'Tu as trouvé tes lettres ?',
  'Ohana !',
  'Enzo m’a dit de te dire que tu es magnifique.',
  'Angel, arrête, on nous regarde…'
];

/* Réactions aux câlins et aux bisous, selon le compteur */
const CALINS = [
  [1, 'Il te serre fort, lui aussi.'],
  [3, 'Il ne veut plus te lâcher.'],
  [7, 'Souillon demande à participer au câlin.'],
  [12, 'Câlin collectif validé. Personne n’est laissé de côté : c’est ça, l’ohana.'],
  [25, 'Stitch s’est endormi dans tes bras. Chut.']
];
const BISOUS = [
  [1, 'Stitch a reçu ton bisou. Il est devenu tout rouge… enfin, violet.'],
  [3, 'Il en redemande.'],
  [5, 'Angel commence à regarder Stitch de travers.'],
  [10, 'Dix ! Stitch s’est évanoui de bonheur.'],
  [20, 'Il est revenu à lui. Il en veut encore.'],
  [26, 'Encore 600 et tu arrives à 626, son numéro d’expérience.'],
  [50, 'Officiel : tu es la championne des bisous de la galaxie.'],
  [100, 'Cent bisous. Je suis un peu jaloux de Stitch, là.']
];

(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const MOUVEMENT = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CLE = 'alohaKim.ouvertes';
  const NS = 'http://www.w3.org/2000/svg';
  const hasard = (a, b) => a + Math.random() * (b - a);

  /* ---------- ce qui a déjà été ouvert (sur son téléphone à elle) ---------- */
  let ouvertes = new Set();
  try {
    const brut = JSON.parse(localStorage.getItem(CLE) || '[]');
    if (Array.isArray(brut)) ouvertes = new Set(brut.filter(n => Number.isInteger(n) && n >= 0 && n < LETTRES.length));
  } catch (e) { /* stockage indisponible : on repart de zéro */ }
  const sauver = () => { try { localStorage.setItem(CLE, JSON.stringify([...ouvertes])); } catch (e) { /* tant pis */ } };

  const nbNormales = LETTRES.filter(l => !l.secrete).length;
  const normalesLues = () => LETTRES.reduce((n, l, i) => n + (!l.secrete && ouvertes.has(i) ? 1 : 0), 0);
  const secreteLibre = () => normalesLues() >= nbNormales;

  function forme(id, cls) {
    const s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', id === 'coeur' ? '0 0 32 29' : '-50 -50 100 100');
    s.setAttribute('aria-hidden', 'true');
    if (cls) s.setAttribute('class', cls);
    const u = document.createElementNS(NS, 'use');
    u.setAttribute('href', '#' + id);
    s.appendChild(u);
    return s;
  }

  /* ---------- petits cœurs qui éclatent ---------- */
  const COULEURS = ['#F06292', '#FF8FB8', '#6FC3F0', '#4F7CC5', '#FFB3C7', '#D0457F'];
  function eclat(x, y, n = 8, taille = 18) {
    if (!MOUVEMENT) return;
    for (let k = 0; k < n; k++) {
      const c = forme('coeur', 'petit-coeur');
      const a = hasard(0, Math.PI * 2);
      const d = hasard(40, 110);
      c.style.left = x + 'px';
      c.style.top = y + 'px';
      c.style.setProperty('--dx', Math.cos(a) * d + 'px');
      c.style.setProperty('--dy', Math.sin(a) * d - 30 + 'px');
      c.style.setProperty('--r', hasard(-40, 40) + 'deg');
      c.style.setProperty('--s', hasard(taille * .6, taille * 1.2) + 'px');
      c.style.setProperty('--col', COULEURS[k % COULEURS.length]);
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 1000);
    }
  }

  /* ======================================================================
     La scène
     ====================================================================== */
  const scene = $('#haut');

  const etoiles = $('#etoiles');
  for (let k = 0; k < 28; k++) {
    const i = document.createElement('i');
    i.style.left = hasard(2, 98) + '%';
    i.style.top = hasard(3, 92) + '%';
    i.style.setProperty('--t', hasard(1.5, 3.2) + 'px');
    i.style.setProperty('--d', hasard(-3, 0) + 's');
    etoiles.appendChild(i);
  }

  const couple = $('#couple');
  const bulle = $('#bulle');
  let iBulle = 0, minuteurBulle = 0;
  couple.addEventListener('click', () => {
    bulle.textContent = BULLES[iBulle++ % BULLES.length];
    bulle.classList.add('visible');
    clearTimeout(minuteurBulle);
    minuteurBulle = setTimeout(() => bulle.classList.remove('visible'), 2600);
    couple.classList.remove('saute');
    void couple.offsetWidth;
    couple.classList.add('saute');
    const r = couple.getBoundingClientRect();
    eclat(r.left + r.width / 2, r.top + r.height * .3, 12, 22);
  });

  /* Un cœur monte entre Stitch et Angel, de temps en temps */
  let sceneVisible = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(e => { sceneVisible = e[0].isIntersecting; }).observe(scene);
  }
  if (MOUVEMENT) {
    setInterval(() => {
      if (!sceneVisible || document.hidden) return;
      const c = forme('coeur', 'coeur-monte');
      const r = couple.getBoundingClientRect();
      const s = scene.getBoundingClientRect();
      c.style.left = (r.left - s.left + r.width * hasard(.44, .56)) + 'px';
      c.style.top = (r.top - s.top + r.height * .22) + 'px';
      c.style.setProperty('--dx', hasard(-24, 24) + 'px');
      c.style.setProperty('--s', hasard(16, 26) + 'px');
      c.style.setProperty('--col', Math.random() < .5 ? '#FF6F91' : '#FFB3C7');
      scene.appendChild(c);
      setTimeout(() => c.remove(), 3300);
    }, 1500);

    /* Toucher le ciel ou la mer fait des cœurs */
    scene.addEventListener('pointerdown', e => {
      if (e.target.closest('button, a')) return;
      eclat(e.clientX, e.clientY, 5, 16);
    });

    /* Parallaxe douce au défilement : le soleil et le titre traînent un peu */
    let prevu = false;
    addEventListener('scroll', () => {
      if (prevu) return;
      prevu = true;
      requestAnimationFrame(() => {
        prevu = false;
        const y = Math.min(scrollY, scene.offsetHeight);
        scene.style.setProperty('--parallaxe', y + 'px');
      });
    }, { passive: true });
  }

  /* Des cœurs qui flottent au-dessus du sable */
  if (MOUVEMENT) {
    const flotteurs = $('#flotteurs');
    for (let k = 0; k < 12; k++) {
      const c = forme('coeur');
      c.style.left = hasard(2, 96) + '%';
      c.style.setProperty('--s', hasard(12, 26) + 'px');
      c.style.setProperty('--t', hasard(11, 18) + 's');
      c.style.setProperty('--d', hasard(-18, 0) + 's');
      c.style.setProperty('--dx', hasard(-40, 40) + 'px');
      c.style.setProperty('--col', ['rgba(243,156,195,.55)', 'rgba(111,195,240,.5)', 'rgba(208,69,127,.35)'][k % 3]);
      flotteurs.appendChild(c);
    }
  }

  /* ======================================================================
     Les enveloppes
     ====================================================================== */
  const grille = $('#grille');
  const boutons = [];
  const CADENAS = '<svg class="cadenas" viewBox="0 0 40 48" aria-hidden="true"><path d="M11 22v-8a9 9 0 0 1 18 0v8" fill="none" stroke="#6E5C95" stroke-width="5" stroke-linecap="round"/><rect x="4" y="20" width="32" height="26" rx="7" fill="#FFD166"/><circle cx="20" cy="31" r="4" fill="#6E5C95"/><rect x="18.5" y="32" width="3" height="7" rx="1.5" fill="#6E5C95"/></svg>';

  LETTRES.forEach((l, i) => {
    const li = document.createElement('li');
    if (l.secrete) li.className = 'secrete-li';
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'env' + (l.secrete ? ' secrete' : '');
    b.style.setProperty('--c', l.c);
    b.style.setProperty('--c2', l.c2);
    b.style.setProperty('--r', ((i % 3) - 1) * 2 + 'deg');
    b.style.setProperty('--d', (-i * .7) + 's');
    b.innerHTML =
      '<span class="env-corps">' +
        '<span class="env-dos"></span><span class="env-papier"></span><span class="env-poche"></span><span class="env-rabat"></span>' +
        '<span class="env-sceau"><svg viewBox="0 0 32 29" aria-hidden="true"><use href="#coeur"/></svg></span>' +
        (l.secrete ? CADENAS : '') +
      '</span>' +
      '<img class="env-sticker" src="' + l.img + '" alt="" loading="lazy">' +
      '<span class="env-titre"></span>' +
      '<span class="env-etat"></span>';
    b.querySelector('.env-titre').textContent = l.titre;
    b.addEventListener('click', () => ouvrir(i, b));
    li.appendChild(b);
    grille.appendChild(li);
    boutons.push(b);
  });

  const coeursProgres = $('#progres-coeurs');
  LETTRES.forEach(() => coeursProgres.appendChild(forme('coeur')));

  function etatGrille() {
    const libre = secreteLibre();
    const reste = nbNormales - normalesLues();
    LETTRES.forEach((l, i) => {
      const b = boutons[i];
      const lue = ouvertes.has(i);
      const fermee = Boolean(l.secrete) && !libre;   // toggle(x, undefined) bascule au lieu de retirer
      b.classList.toggle('lue', lue);
      b.classList.toggle('verrouillee', fermee);
      b.classList.toggle('attire', !ouvertes.size && i === 0);
      let etat;
      if (lue) etat = 'Ouverte ♥';
      else if (fermee) etat = 'Encore ' + reste + ' à lire';
      else if (l.secrete) etat = 'Tu peux l’ouvrir !';
      else etat = 'Lettre ' + (i + 1);
      b.querySelector('.env-etat').textContent = etat;
      b.setAttribute('aria-label', l.titre + (lue ? ', déjà ouverte' : fermee ? ', fermée à clé' : ''));
    });
    [...coeursProgres.children].forEach((c, i) => c.classList.toggle('plein', i < ouvertes.size));
    const n = ouvertes.size;
    $('#progres-txt').textContent = n === 0 ? 'Aucune lettre ouverte'
      : n === LETTRES.length ? 'Toutes les lettres sont ouvertes ♥'
      : n + ' lettre' + (n > 1 ? 's' : '') + ' ouverte' + (n > 1 ? 's' : '') + ' sur ' + LETTRES.length;
  }

  /* ======================================================================
     Ouvrir une lettre
     ====================================================================== */
  const voile = $('#voile');
  const genv = $('#grande-env');
  const lettre = $('#lettre');
  const illu = $('#l-illu');
  const bonus = $('#l-bonus');
  const suivante = $('#suivante');
  let courante = -1, dernierBouton = null, minuteurOuverture = 0, annoncerSecrete = false;

  function ouvrir(i, source) {
    const l = LETTRES[i];
    if (l.secrete && !secreteLibre()) {
      const reste = nbNormales - normalesLues();
      if (source) secouer(source);
      toast('Pas encore ! Il te reste ' + reste + ' lettre' + (reste > 1 ? 's' : '') + ' à lire avant celle-ci.');
      return;
    }
    if (source) dernierBouton = source;
    remplir(i);
    voile.hidden = false;
    document.body.classList.add('bloque');
    clearTimeout(minuteurOuverture);
    if (MOUVEMENT) {
      lettre.hidden = true;
      genv.style.setProperty('--c', l.c);
      genv.style.setProperty('--c2', l.c2);
      genv.hidden = false;
      genv.classList.remove('ouvre');
      void genv.offsetWidth;
      genv.classList.add('ouvre');
      minuteurOuverture = setTimeout(() => montrer(i), 1300);
    } else {
      montrer(i);
    }
  }

  function montrer(i) {
    genv.hidden = true;
    genv.classList.remove('ouvre');
    lettre.hidden = false;
    lettre.scrollTop = 0;
    lettre.classList.remove('arrive');
    void lettre.offsetWidth;
    lettre.classList.add('arrive');
    lettre.focus({ preventScroll: true });

    const avant = secreteLibre();
    ouvertes.add(i);
    sauver();
    if (!avant && secreteLibre() && !ouvertes.has(LETTRES.findIndex(l => l.secrete))) annoncerSecrete = true;
    etatGrille();

    const j = prochaine(i);
    suivante.textContent = j < 0 ? 'Retour à la plage' : LETTRES[j].secrete ? 'Ouvrir la lettre secrète →' : 'Lettre suivante →';
    suivante.dataset.cible = j;

    const r = lettre.getBoundingClientRect();
    eclat(r.left + r.width / 2, r.top + 70, 14, 20);
    if (LETTRES[i].bonus && LETTRES[i].bonus.type === 'final') setTimeout(fete, 350);
  }

  function prochaine(i) {
    for (let k = 1; k <= LETTRES.length; k++) {
      const j = (i + k) % LETTRES.length;
      if (!ouvertes.has(j) && (!LETTRES[j].secrete || secreteLibre())) return j;
    }
    return -1;
  }

  function fermer() {
    if (voile.hidden) return;
    clearTimeout(minuteurOuverture);
    voile.hidden = true;
    genv.hidden = true;
    lettre.hidden = true;
    document.body.classList.remove('bloque');
    arreterChanson();
    if (dernierBouton) dernierBouton.focus({ preventScroll: true });
    if (annoncerSecrete) {
      annoncerSecrete = false;
      const b = boutons[LETTRES.findIndex(l => l.secrete)];
      setTimeout(() => {
        b.scrollIntoView({ behavior: MOUVEMENT ? 'smooth' : 'auto', block: 'center' });
        b.classList.remove('debloque');
        void b.offsetWidth;
        b.classList.add('debloque');
        toast('La lettre secrète vient de se déverrouiller !');
      }, 250);
    }
  }

  $('#fermer').addEventListener('click', fermer);
  $('#refermer').addEventListener('click', fermer);
  voile.addEventListener('click', e => { if (e.target === voile) fermer(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') fermer(); });
  suivante.addEventListener('click', () => {
    const j = Number(suivante.dataset.cible);
    if (j >= 0) {
      arreterChanson();
      dernierBouton = boutons[j];
      ouvrir(j, null);
    } else fermer();
  });

  /* ---------- remplir la lettre ---------- */
  function remplir(i) {
    const l = LETTRES[i];
    courante = i;
    lettre.style.setProperty('--bande', l.c2);
    illu.src = l.img;
    illu.alt = '';
    illu.className = 'lettre-illu';
    $('#l-num').textContent = l.secrete ? 'La dernière' : 'Lettre ' + (i + 1) + ' sur ' + LETTRES.length;
    $('#l-titre').textContent = l.titre;
    const texte = $('#l-texte');
    texte.textContent = '';
    l.texte.forEach(t => {
      const p = document.createElement('p');
      p.textContent = t;
      texte.appendChild(p);
    });
    bonus.textContent = '';
    const b = l.bonus;
    if (b) {
      if (b.type === 'coupon') bonus.appendChild(coupon(b));
      else if (b.type === 'calin') bonus.appendChild(jeu('calin'));
      else if (b.type === 'bisous') bonus.appendChild(jeu('bisous'));
      else if (b.type === 'chanson') bonus.appendChild(chanson());
      else if (b.type === 'final') bonus.appendChild(finale());
    }
    $('#l-signe').textContent = l.signe ? '— ' + l.signe : '';
  }

  function el(tag, cls, txt) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }

  function coupon(b) {
    const c = el('div', 'coupon');
    c.appendChild(el('div', 'coupon-g', 'Bon pour'));
    const d = el('div', 'coupon-d');
    d.appendChild(el('span', 'coupon-quoi', b.quoi));
    d.appendChild(el('span', 'coupon-cond', b.cond));
    d.appendChild(el('span', 'coupon-num', b.num));
    c.appendChild(d);
    c.appendChild(el('span', 'tampon', b.tampon));
    return c;
  }

  /* Câlins et bisous : un bouton, un compteur, Stitch qui réagit */
  const compteurs = { calin: 0, bisous: 0 };
  function jeu(sorte) {
    const calin = sorte === 'calin';
    const paliers = calin ? CALINS : BISOUS;
    const z = el('div', 'jeu');
    const bouton = el('button', 'gros-bouton' + (calin ? ' bleu' : ''), calin ? 'Faire un câlin à Stitch' : 'Faire un bisou à Stitch 💋');
    bouton.type = 'button';
    const compteur = el('p', 'compteur');
    const reaction = el('p', 'reaction', calin ? 'Il ouvre grand les bras…' : 'Stitch ferme les yeux et attend…');
    reaction.setAttribute('aria-live', 'polite');
    const majCompteur = () => {
      compteur.textContent = '';
      compteur.appendChild(el('b', null, String(compteurs[sorte])));
      compteur.appendChild(document.createTextNode(calin
        ? (compteurs[sorte] > 1 ? ' câlins' : ' câlin')
        : (compteurs[sorte] > 1 ? ' bisous' : ' bisou')));
    };
    majCompteur();
    bouton.addEventListener('click', () => {
      compteurs[sorte]++;
      majCompteur();
      for (let k = paliers.length - 1; k >= 0; k--) {
        if (compteurs[sorte] >= paliers[k][0]) { reaction.textContent = paliers[k][1]; break; }
      }
      illu.classList.remove('serre');
      void illu.offsetWidth;
      illu.classList.add('serre');
      const r = bouton.getBoundingClientRect();
      const ri = illu.getBoundingClientRect();
      if (calin) eclat(ri.left + ri.width / 2, ri.top + ri.height / 2, 10, 20);
      else envolerBisou(r.left + r.width / 2, r.top, ri.left + ri.width / 2, ri.top + ri.height / 2);
    });
    z.appendChild(bouton);
    z.appendChild(compteur);
    z.appendChild(reaction);
    return z;
  }

  function envolerBisou(x, y, cx, cy) {
    if (!MOUVEMENT) return;
    const b = el('span', 'bisou-vole', '💋');
    b.style.left = x + 'px';
    b.style.top = y + 'px';
    b.style.setProperty('--dx', (cx - x) + 'px');
    b.style.setProperty('--dy', (cy - y) + 'px');
    document.body.appendChild(b);
    setTimeout(() => { b.remove(); eclat(cx, cy, 6, 16); }, 850);
  }

  /* ---------- la chanson au ukulélé (sons fabriqués par le navigateur) ---------- */
  const PAROLES = [
    ['♪ Kim, Kim, Kiiim… ♪', ''],
    ['(il n’a pas trouvé de rime)', 'aparte'],
    ['♪ Kim, Kim, Kiiim… ♪', ''],
    ['(il a mangé le dictionnaire)', 'aparte']
  ];
  //            [ligne, note MIDI (null = silence), durée en croches]
  const MELODIE = [
    [0, 79, 1], [0, 76, 1], [0, 84, 3], [0, null, 1],
    [1, 81, 1], [1, 79, 1], [1, 77, 1], [1, 76, 1], [1, 74, 1], [1, 76, 1], [1, 72, 2],
    [2, 79, 1], [2, 76, 1], [2, 81, 3], [2, null, 1],
    [3, 79, 1], [3, 77, 1], [3, 76, 1], [3, 74, 1], [3, 72, 1], [3, 74, 1], [3, 72, 4]
  ];
  const ACCORDS = [[60, 64, 67, 72], [53, 57, 60, 65], [57, 60, 64, 69], [55, 59, 62, 67]];
  const CROCHE = .26;
  let audio = null, minuteursChanson = [];

  const hz = n => 440 * Math.pow(2, (n - 69) / 12);
  function pince(t, note, duree, volume) {
    const o1 = audio.createOscillator(), o2 = audio.createOscillator();
    const g = audio.createGain(), g2 = audio.createGain(), f = audio.createBiquadFilter();
    o1.type = 'triangle';
    o1.frequency.value = hz(note);
    o2.type = 'sine';
    o2.frequency.value = hz(note) * 2;
    g2.gain.value = .3;
    f.type = 'lowpass';
    f.frequency.setValueAtTime(4200, t);
    f.frequency.exponentialRampToValueAtTime(700, t + duree);
    g.gain.setValueAtTime(.0001, t);
    g.gain.exponentialRampToValueAtTime(volume, t + .01);
    g.gain.exponentialRampToValueAtTime(.0001, t + duree);
    o1.connect(f);
    o2.connect(g2);
    g2.connect(f);
    f.connect(g);
    g.connect(audio.destination);
    o1.start(t);
    o2.start(t);
    o1.stop(t + duree + .05);
    o2.stop(t + duree + .05);
  }

  function arreterChanson() {
    minuteursChanson.forEach(clearTimeout);
    minuteursChanson = [];
    if (audio) { audio.close().catch(() => {}); audio = null; }
    document.querySelectorAll('.paroles span').forEach(s => s.classList.remove('chante'));
    illu.classList.remove('danse');
  }

  function chanson() {
    const z = el('div', 'jeu');
    const bouton = el('button', 'gros-bouton', '♪ Écouter la chanson de Stitch');
    bouton.type = 'button';
    const paroles = el('p', 'paroles');
    const lignes = PAROLES.map(([t, c]) => { const s = el('span', c, t); paroles.appendChild(s); return s; });
    bouton.addEventListener('click', () => {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) { bouton.textContent = 'Ton navigateur ne veut pas chanter'; return; }
      arreterChanson();
      audio = new Ctx();
      const t0 = audio.currentTime + .12;
      let t = t0, ligne = -1;
      MELODIE.forEach(([l, note, croches]) => {
        if (l !== ligne) {
          ligne = l;
          ACCORDS[l].forEach((n, k) => pince(t + k * .03, n, 1.8, .07));
          const retard = (t - t0) * 1000 + 120;
          minuteursChanson.push(setTimeout(() => {
            lignes.forEach((s, k) => s.classList.toggle('chante', k === l));
          }, retard));
        }
        if (note != null) pince(t, note, Math.max(.7, croches * CROCHE * 2), .2);
        t += croches * CROCHE;
      });
      [48, 60, 64, 67, 72].forEach((n, k) => pince(t + k * .04, n, 2.4, .08));
      illu.classList.add('danse');
      bouton.textContent = '♪ Encore une fois';
      minuteursChanson.push(setTimeout(() => {
        lignes.forEach(s => s.classList.remove('chante'));
        illu.classList.remove('danse');
      }, (t - t0) * 1000 + 1600));
    });
    z.appendChild(bouton);
    z.appendChild(paroles);
    return z;
  }

  /* ---------- la dernière lettre : Stitch danse et il pleut des cœurs ---------- */
  function finale() {
    const z = el('div', 'jeu');
    const hula = el('img', 'hula');
    hula.src = 'img/hula.webp';
    hula.alt = 'Stitch qui danse le hula';
    z.appendChild(hula);
    const encore = el('button', 'gros-bouton', 'Encore des cœurs !');
    encore.type = 'button';
    encore.addEventListener('click', fete);
    z.appendChild(encore);
    return z;
  }

  const zoneFete = $('#fete');
  function fete() {
    if (!MOUVEMENT) return;
    const formes = ['coeur', 'coeur', 'coeur', 'hibiscus'];
    const teintes = ['#FF6F91', '#FFB3C7', '#6FC3F0', '#4F7CC5', '#FFD166', '#D0457F', '#A68FE0'];
    for (let k = 0; k < 70; k++) {
      const f = forme(formes[k % formes.length]);
      f.style.left = hasard(-5, 100) + 'vw';
      f.style.setProperty('--s', hasard(14, 34) + 'px');
      f.style.setProperty('--t', hasard(2.6, 5) + 's');
      f.style.setProperty('--d', hasard(0, 1.4) + 's');
      f.style.setProperty('--dx', hasard(-80, 80) + 'px');
      f.style.setProperty('--r', hasard(-540, 540) + 'deg');
      f.style.setProperty('--col', teintes[k % teintes.length]);
      zoneFete.appendChild(f);
      setTimeout(() => f.remove(), 6800);
    }
  }

  /* ---------- petites aides ---------- */
  function secouer(b) {
    b.classList.remove('secoue');
    void b.offsetWidth;
    b.classList.add('secoue');
    setTimeout(() => b.classList.remove('secoue'), 600);
  }

  const boiteToast = $('#toast');
  let minuteurToast = 0;
  function toast(txt) {
    $('#toast-txt').textContent = txt;
    boiteToast.hidden = true;
    void boiteToast.offsetWidth;
    boiteToast.hidden = false;
    clearTimeout(minuteurToast);
    minuteurToast = setTimeout(() => { boiteToast.hidden = true; }, 3200);
  }

  /* Tout refermer : un deuxième appui confirme */
  const reset = $('#reset');
  let minuteurReset = 0;
  reset.addEventListener('click', () => {
    if (!reset.classList.contains('confirme')) {
      reset.classList.add('confirme');
      reset.textContent = 'Sûre ? Touche encore pour tout refermer';
      clearTimeout(minuteurReset);
      minuteurReset = setTimeout(() => {
        reset.classList.remove('confirme');
        reset.textContent = 'Refermer toutes les lettres';
      }, 3500);
      return;
    }
    clearTimeout(minuteurReset);
    reset.classList.remove('confirme');
    reset.textContent = 'Refermer toutes les lettres';
    ouvertes.clear();
    sauver();
    compteurs.calin = 0;
    compteurs.bisous = 0;
    etatGrille();
    toast('Toutes les lettres sont refermées. Stitch les a recachées.');
  });

  etatGrille();
})();
