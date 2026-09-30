/* ==========================================================================
   L'HISTOIRE — c'est ici qu'on change les textes.
   Un paragraphe par ligne de chaque tableau `texte`.
   Un court prologue avec Stitch (seul, perdu, retrouvé), puis NOTRE histoire,
   puis la lettre et le ciel.
   humeur : la musique est mélancolique ('triste') tant que Stitch est perdu,
   puis passe en majeur ('doux') au moment où quelqu'un vient le chercher.
   ========================================================================== */
const HISTOIRE = {
  couverture: {
    titre: 'Le petit extraterrestre qui cherchait sa famille',
    pour: 'L’histoire de Kim & Enzo',
    bouton: 'Ouvrir le livre',
    casque: 'Avec le son, c’est encore mieux'
  },

  pages: [
    /* ---------- le prologue : Stitch ---------- */
    {
      scene: 'espace', img: 'img/combinaison.webp', humeur: 'triste', accent: '#6D5BC9',
      texte: [
        'Il était une fois, parmi les étoiles, un petit être bleu. Il n’avait pas de nom, juste un numéro : 626.',
        'Chaque soir, il se demandait s’il existait quelqu’un pour lui.'
      ]
    },
    {
      scene: 'chute', img: 'img/culbute.webp', humeur: 'triste', accent: '#3E6FB0',
      texte: [
        'Une nuit, il est tombé du ciel.',
        'Il a atterri sur une toute petite île, au milieu de l’océan, sans savoir que sa vie allait changer.'
      ]
    },
    {
      scene: 'pluie', img: 'img/livre.webp', humeur: 'triste', accent: '#5B6F8E',
      texte: [
        'Un soir de pluie, il a lu l’histoire d’un petit canard qui cherchait sa famille.',
        'Il a levé les yeux vers le ciel, et il a murmuré : « Je suis perdu. »'
      ]
    },
    {
      scene: 'aube', img: 'img/retrouvailles.webp', humeur: 'doux', accent: '#D0735E',
      texte: [
        'Mais un jour, quelqu’un est venu le chercher.',
        'Ce petit être bleu, c’est un peu moi. Et ce quelqu’un, c’est toi. Voici notre histoire.'
      ]
    },

    /* ---------- notre histoire ---------- */
    {
      scene: 'happn', img: 'img/coucou.webp', humeur: 'doux', accent: '#D0457F',
      texte: [
        'Tout a commencé sur Happn, l’application qui te montre les gens que tu as croisés.',
        'Un jour, nos chemins se sont croisés. Et j’ai eu beaucoup de chance.'
      ]
    },
    {
      scene: 'date', img: 'img/bisou.webp', humeur: 'doux', accent: '#C9467E',
      texte: [
        'Le samedi 26 septembre, on s’est vus pour la première fois.',
        'Ce jour-là, il y a eu notre premier bisou. Et on s’est mis ensemble : c’est notre date à nous.'
      ]
    },
    {
      scene: 'ohana', img: 'img/hula.webp', humeur: 'doux', accent: '#2E8A7E',
      texte: [
        'Et puis j’ai rencontré ta famille : ta maman, ton petit frère et ta petite sœur.',
        'Tout le monde a été adorable avec moi. Stitch appellerait ça une ohana.'
      ]
    },
    {
      scene: 'soiree', img: 'img/calin.webp', humeur: 'doux', accent: '#C0605A',
      texte: [
        'Le lendemain, dimanche, c’est toi qui es venue chez moi rencontrer mes parents.',
        'Et après ? On ne s’est plus lâchés. Des câlins, toute la soirée.'
      ]
    },
    {
      scene: 'magasins', img: 'img/peluche.webp', humeur: 'doux', accent: '#D0457F',
      texte: [
        'Mercredi, on a fait les magasins.',
        'Et j’avoue : j’ai craqué. Je t’ai offert plein de choses, dont une peluche Stitch (forcément) et un verre.'
      ]
    },
    {
      scene: 'futur', img: 'img/main-dans-la-main.webp', humeur: 'doux', accent: '#B0568F',
      texte: [
        'Et maintenant ? Maintenant, il nous reste tout le reste.',
        'D’autres samedis, d’autres câlins, d’autres magasins (je vais encore craquer), et plein de premières fois à vivre ensemble.'
      ]
    }
  ],

  lettre: {
    img: 'img/dessine.webp',
    titre: 'Kim,',
    texte: [
      'On ne se connaît que depuis quelques jours, et j’ai déjà l’impression que tu as toujours été là.',
      'Merci pour le 26 septembre, pour l’accueil de ta famille et pour tous ces câlins.',
      'Merci d’être toi. Et de supporter mes bêtises (Stitch et moi, on a ça en commun).',
      'Tourne la page : j’ai caché quelque chose dans les étoiles.'
    ],
    signe: 'Enzo'
  },

  ciel: {
    consigne: 'Touche l’étoile qui brille',
    etoiles: [
      'Merci d’avoir croisé ma route.',
      'Le 26 septembre est devenu mon jour préféré.',
      'Ton sourire rend mes journées plus belles.',
      'Avec toi, j’ai le droit d’être juste moi.',
      'Tes câlins sont mon endroit préféré au monde.',
      'Je pense à toi bien plus souvent que tu ne l’imagines.',
      'Tu es ma personne préférée.',
      'Tu ne seras jamais seule. Jamais.',
      'J’ai hâte de tout ce qui nous attend.',
      'Tu es mon ohana.'
    ],
    fin: [
      'Notre histoire commence à peine.',
      'Elle n’a que quelques jours… mais elle est déjà belle. Vraiment belle.'
    ],
    jet: 'Je t’aime, Kim.',
    signe: 'Enzo',
    relire: 'Relire depuis le début'
  }
};

(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const MOUVEMENT = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';
  const hasard = (a, b) => a + Math.random() * (b - a);

  function el(tag, cls, txt) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }
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
  function eclat(x, y, n = 10, taille = 16) {
    if (!MOUVEMENT) return;
    const teintes = ['#FFC7DF', '#FF8FB8', '#F7E2AE', '#9CC4FF', '#FFE0EE'];
    for (let k = 0; k < n; k++) {
      const c = forme('coeur', 'eclat-coeur');
      const a = hasard(0, Math.PI * 2), d = hasard(40, 120);
      c.style.left = x + 'px';
      c.style.top = y + 'px';
      c.style.setProperty('--dx', Math.cos(a) * d + 'px');
      c.style.setProperty('--dy', Math.sin(a) * d - 30 + 'px');
      c.style.setProperty('--r', hasard(-40, 40) + 'deg');
      c.style.setProperty('--s', hasard(taille * .6, taille * 1.3) + 'px');
      c.style.setProperty('--col', teintes[k % teintes.length]);
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 1200);
    }
  }

  /* ======================================================================
     La boîte à musique (tout est fabriqué par le navigateur, aucun fichier)
     ====================================================================== */
  const Son = (() => {
    let ctx = null, maitre = null, horloge = 0, coupe = false;
    let voulue = 'triste', jouee = null, mesure = 0, tMesure = 0;
    let pluieSource = null, pluieGain = null;
    const TEMPS = 60 / 66, MESURE = TEMPS * 3, VOLUME = .55;

    //  Quatre mesures qui tournent en boucle : un accord et une petite mélodie.
    //  Mineur tant que Stitch est perdu, majeur quand on le retrouve.
    const PROG = {
      triste: [
        { acc: [57, 60, 64], mel: [[69, 1.5], [72, .5], [76, 1]] },
        { acc: [53, 57, 60], mel: [[77, 1.5], [76, .5], [72, 1]] },
        { acc: [48, 52, 55], mel: [[76, 1], [74, 1], [72, 1]] },
        { acc: [52, 56, 59], mel: [[71, 2], [68, 1]] }
      ],
      doux: [
        { acc: [48, 52, 55], mel: [[76, 1.5], [79, .5], [84, 1]] },
        { acc: [55, 59, 62], mel: [[83, 1.5], [81, .5], [79, 1]] },
        { acc: [57, 60, 64], mel: [[81, 1], [79, 1], [76, 1]] },
        { acc: [53, 57, 60], mel: [[77, 1], [76, 1], [72, 1]] }
      ]
    };

    function creer() {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return false;
      ctx = new Ctx();
      maitre = ctx.createGain();
      maitre.gain.value = .0001;
      const sec = ctx.createGain();
      sec.gain.value = .8;
      const reverbe = ctx.createConvolver();
      reverbe.buffer = impulsion(2.8);
      const humide = ctx.createGain();
      humide.gain.value = .38;
      maitre.connect(sec);
      sec.connect(ctx.destination);
      maitre.connect(reverbe);
      reverbe.connect(humide);
      humide.connect(ctx.destination);
      return true;
    }
    function impulsion(s) {
      const n = Math.floor(ctx.sampleRate * s), b = ctx.createBuffer(2, n, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const d = b.getChannelData(ch);
        for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3);
      }
      return b;
    }
    function bruit(duree) {
      const n = Math.floor(ctx.sampleRate * duree), b = ctx.createBuffer(1, n, ctx.sampleRate);
      const d = b.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      return b;
    }
    //  Une note de boîte à musique : une fondamentale et quelques harmoniques qui s'éteignent vite
    function note(t, midi, duree, vol) {
      const f = 440 * Math.pow(2, (midi - 69) / 12);
      const g = ctx.createGain();
      g.gain.setValueAtTime(.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + .006);
      g.gain.exponentialRampToValueAtTime(.0001, t + duree);
      g.connect(maitre);
      [[1, 1], [2, .28], [3.01, .08], [4.2, .035]].forEach(([m, a]) => {
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.value = f * m;
        const ga = ctx.createGain();
        ga.gain.value = a;
        o.connect(ga);
        ga.connect(g);
        o.start(t);
        o.stop(t + duree + .05);
      });
    }
    function jouerMesure(t) {
      const p = PROG[jouee][mesure % 4];
      const [r, tierce, quinte] = p.acc;
      [r, quinte, r + 12, tierce + 12, r + 12, quinte].forEach((n, k) => note(t + k * TEMPS / 2, n, 1.7, .045));
      let tt = t;
      p.mel.forEach(([n, d]) => { note(tt, n, Math.max(1.3, d * TEMPS * 1.7), .095); tt += d * TEMPS; });
    }
    function boucle() {
      if (!ctx) return;
      while (tMesure < ctx.currentTime + .6) {
        if (voulue !== jouee) { jouee = voulue; mesure = 0; }
        jouerMesure(tMesure);
        mesure++;
        tMesure += MESURE;
      }
    }

    return {
      demarrer() {
        if (!ctx && !creer()) return false;
        if (ctx.state === 'suspended') ctx.resume();
        if (!horloge) {
          tMesure = ctx.currentTime + .2;
          horloge = setInterval(boucle, 120);
          boucle();
        }
        if (!coupe) maitre.gain.setTargetAtTime(VOLUME, ctx.currentTime, .8);
        return true;
      },
      humeur(h) { if (h) voulue = h; },
      basculer() {
        coupe = !coupe;
        if (ctx) maitre.gain.setTargetAtTime(coupe ? .0001 : VOLUME, ctx.currentTime, .25);
        return !coupe;
      },
      tourner() {
        if (!ctx || coupe) return;
        const t = ctx.currentTime, s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
        s.buffer = bruit(.4);
        f.type = 'bandpass';
        f.frequency.setValueAtTime(3200, t);
        f.frequency.exponentialRampToValueAtTime(700, t + .35);
        g.gain.setValueAtTime(.0001, t);
        g.gain.exponentialRampToValueAtTime(.1, t + .05);
        g.gain.exponentialRampToValueAtTime(.0001, t + .38);
        s.connect(f);
        f.connect(g);
        g.connect(maitre);
        s.start(t);
        s.stop(t + .4);
      },
      pluie(on) {
        if (!ctx) return;
        const t = ctx.currentTime;
        if (on && !pluieSource) {
          pluieSource = ctx.createBufferSource();
          pluieSource.buffer = bruit(2.5);
          pluieSource.loop = true;
          const bas = ctx.createBiquadFilter(), haut = ctx.createBiquadFilter();
          bas.type = 'lowpass';
          bas.frequency.value = 1600;
          haut.type = 'highpass';
          haut.frequency.value = 350;
          pluieGain = ctx.createGain();
          pluieGain.gain.value = .0001;
          pluieSource.connect(bas);
          bas.connect(haut);
          haut.connect(pluieGain);
          pluieGain.connect(maitre);
          pluieSource.start();
          pluieGain.gain.setTargetAtTime(.075, t, .6);
        } else if (!on && pluieSource) {
          const s = pluieSource;
          pluieGain.gain.setTargetAtTime(.0001, t, .4);
          setTimeout(() => { try { s.stop(); } catch (e) { /* déjà arrêtée */ } }, 1800);
          pluieSource = null;
        }
      },
      etoile(k) {
        if (!ctx || coupe) return;
        const gamme = [72, 74, 76, 79, 81, 84, 86, 88, 91, 93];
        note(ctx.currentTime + .02, gamme[k % gamme.length], 2.2, .12);
      },
      final() {
        if (!ctx || coupe) return;
        const t = ctx.currentTime + .1;
        [72, 76, 79, 84, 88, 91, 96].forEach((n, k) => note(t + k * .11, n, 2.6, .1));
        [48, 55, 60, 64].forEach(n => note(t, n, 3.2, .06));
      },
      pause(p) {
        if (!ctx) return;
        if (p) ctx.suspend(); else ctx.resume();
      }
    };
  })();

  /* ======================================================================
     Construire le livre
     ====================================================================== */
  const livre = $('#livre');

  function nouvelleFeuille() {
    const f = el('div', 'feuille');
    const recto = el('section', 'recto');
    const verso = el('div', 'verso');
    f.append(recto, verso);
    livre.appendChild(f);
    return recto;
  }

  /* --- la couverture --- */
  const cv = HISTOIRE.couverture;
  const couverture = nouvelleFeuille();
  couverture.classList.add('couverture');
  couverture.appendChild(el('div', 'cadre'));
  ['o1', 'o2', 'o3', 'o4'].forEach(o => couverture.appendChild(el('span', 'orne ' + o, '✦')));
  couverture.appendChild(el('h1', 'titre-livre', cv.titre));
  const imgCouv = el('img', 'eclate');
  imgCouv.src = 'img/eclate.webp';
  imgCouv.alt = 'Stitch qui traverse la couverture du livre';
  imgCouv.width = 520;
  imgCouv.height = 510;
  couverture.appendChild(imgCouv);
  couverture.appendChild(el('p', 'pour', cv.pour));
  const boutonOuvrir = el('button', 'ouvrir', cv.bouton);
  boutonOuvrir.type = 'button';
  couverture.appendChild(boutonOuvrir);
  couverture.appendChild(el('p', 'casque', cv.casque));

  /* --- les pages de l'histoire --- */
  const infos = [{ ambiance: 'nuit', humeur: null }];
  HISTOIRE.pages.forEach((p, k) => {
    const recto = nouvelleFeuille();
    recto.classList.add('page', 'page-' + p.scene);
    recto.style.setProperty('--accent', p.accent);
    const illu = el('div', 'illu');
    const tpl = document.getElementById('s-' + p.scene);
    if (tpl) illu.appendChild(tpl.content.cloneNode(true));
    const perso = el('img', 'perso perso-' + p.scene);
    perso.src = p.img;
    perso.alt = '';
    illu.appendChild(perso);
    recto.appendChild(illu);
    const texte = el('div', 'texte');
    p.texte.forEach(t => texte.appendChild(el('p', null, t)));
    recto.appendChild(texte);
    recto.appendChild(el('span', 'folio', String(k + 1)));
    recto.appendChild(el('span', 'coin'));
    infos.push({ ambiance: p.scene, humeur: p.humeur, scene: p.scene });
  });

  /* --- la lettre --- */
  const lt = HISTOIRE.lettre;
  const pageLettre = nouvelleFeuille();
  pageLettre.classList.add('page-lettre');
  const corps = el('div', 'lettre-corps');
  const dessin = el('img', 'lettre-dessin');
  dessin.src = lt.img;
  dessin.alt = 'Stitch qui dessine';
  corps.appendChild(dessin);
  corps.appendChild(el('p', 'lettre-titre', lt.titre));
  lt.texte.forEach(t => corps.appendChild(el('p', null, t)));
  corps.appendChild(el('p', 'lettre-signe', lt.signe));
  pageLettre.appendChild(corps);
  pageLettre.appendChild(forme('hibiscus', 'fleur-sechee'));
  pageLettre.appendChild(el('span', 'folio', String(HISTOIRE.pages.length + 1)));
  pageLettre.appendChild(el('span', 'coin'));
  infos.push({ ambiance: 'lettre', humeur: 'doux' });

  /* --- le ciel à allumer --- */
  const ci = HISTOIRE.ciel;
  const pageCiel = nouvelleFeuille();
  pageCiel.classList.add('page-ciel');
  const decorCiel = el('div', 'decor decor-ciel');
  decorCiel.append(el('div', 'etoiles-a'), el('div', 'etoiles-b'));
  pageCiel.appendChild(decorCiel);

  //  Dix étoiles posées sur un cœur (courbe du cœur classique, x = 16 sin³t …)
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'constellation');
  svg.setAttribute('viewBox', '0 0 100 92');
  svg.setAttribute('role', 'group');
  svg.setAttribute('aria-label', 'Une constellation à allumer, étoile par étoile');
  svg.innerHTML =
    '<defs>' +
      '<radialGradient id="halo"><stop offset="0" stop-color="#FFF6D6" stop-opacity=".9"/><stop offset="1" stop-color="#FFF6D6" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="rose-ciel" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#FFB3D1" stop-opacity=".9"/><stop offset="1" stop-color="#C9467E" stop-opacity=".25"/></radialGradient>' +
    '</defs>';
  const pointCoeur = t => [
    50 + 2.6 * 16 * Math.pow(Math.sin(t), 3),
    40 - 2.6 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))
  ];
  let d = '';
  for (let k = 0; k <= 72; k++) {
    const [x, y] = pointCoeur(k / 72 * Math.PI * 2);
    d += (k ? 'L' : 'M') + x.toFixed(2) + ' ' + y.toFixed(2);
  }
  const plein = document.createElementNS(NS, 'path');
  plein.setAttribute('class', 'coeur-plein');
  plein.setAttribute('d', d + 'Z');
  svg.appendChild(plein);
  const traits = document.createElementNS(NS, 'g');
  const astresG = document.createElementNS(NS, 'g');
  svg.append(traits, astresG);

  const NB = ci.etoiles.length;
  const points = [];
  for (let k = 0; k < NB; k++) points.push(pointCoeur(k / NB * Math.PI * 2));
  const lignes = [];
  for (let k = 0; k < NB; k++) {
    const [x1, y1] = points[k], [x2, y2] = points[(k + 1) % NB];
    const l = document.createElementNS(NS, 'line');
    l.setAttribute('class', 'trait');
    l.setAttribute('x1', x1); l.setAttribute('y1', y1);
    l.setAttribute('x2', x2); l.setAttribute('y2', y2);
    l.setAttribute('pathLength', '1');
    traits.appendChild(l);
    lignes.push(l);
  }
  const astres = points.map(([x, y], k) => {
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'astre');
    g.setAttribute('data-k', k);
    g.innerHTML = '<circle class="aura" cx="' + x + '" cy="' + y + '" r="5.5"/>' +
                  '<circle class="noyau" cx="' + x + '" cy="' + y + '" r="1.2"/>' +
                  '<circle class="zone" cx="' + x + '" cy="' + y + '" r="7.5"/>';
    astresG.appendChild(g);
    return g;
  });
  pageCiel.appendChild(svg);

  const cielTexte = el('div', 'ciel-texte');
  const consigne = el('p', 'consigne', ci.consigne);
  const phrase = el('p', 'phrase');
  phrase.setAttribute('aria-live', 'polite');
  const fin = el('div', 'fin');
  fin.hidden = true;
  ci.fin.forEach(t => fin.appendChild(el('p', null, t)));
  fin.appendChild(el('p', 'jet', ci.jet));
  fin.appendChild(el('p', 'signe', '— ' + ci.signe));
  const coeurFinal = el('img', 'coeur-final');
  coeurFinal.src = 'img/coeur.webp';
  coeurFinal.alt = 'Stitch qui tient un cœur';
  fin.appendChild(coeurFinal);
  const relire = el('button', 'relire', ci.relire);
  relire.type = 'button';
  fin.appendChild(relire);
  cielTexte.append(consigne, phrase, fin);
  pageCiel.appendChild(cielTexte);
  pageCiel.appendChild(el('div', 'filante-finale'));
  pageCiel.appendChild(el('span', 'folio', String(HISTOIRE.pages.length + 2)));
  infos.push({ ambiance: 'ciel', humeur: 'doux' });

  /* --- les particules des décors : pluie, lucioles, pétales, cœurs --- */
  if (MOUVEMENT) {
    document.querySelectorAll('.pluie').forEach(z => {
      for (let k = 0; k < 46; k++) {
        const i = el('i');
        i.style.left = hasard(-5, 105) + '%';
        i.style.setProperty('--l', hasard(12, 24) + 'px');
        i.style.setProperty('--t', hasard(.6, 1.05) + 's');
        i.style.setProperty('--d', hasard(-1.2, 0) + 's');
        z.appendChild(i);
      }
    });
    document.querySelectorAll('.lucioles').forEach(z => {
      for (let k = 0; k < 14; k++) {
        const i = el('i');
        i.style.left = hasard(3, 95) + '%';
        i.style.setProperty('--s', hasard(5, 13) + 'px');
        i.style.setProperty('--t', hasard(5, 9) + 's');
        i.style.setProperty('--d', hasard(-9, 0) + 's');
        i.style.setProperty('--dx', hasard(-30, 30) + 'px');
        z.appendChild(i);
      }
    });
    document.querySelectorAll('.petales').forEach(z => {
      const teintes = ['#FF6F91', '#FFB3C7', '#FF8FA8', '#FFD166'];
      for (let k = 0; k < 11; k++) {
        const s = forme('hibiscus');
        s.style.left = hasard(0, 92) + '%';
        s.style.setProperty('--s', hasard(12, 22) + 'px');
        s.style.setProperty('--t', hasard(7, 12) + 's');
        s.style.setProperty('--d', hasard(-12, 0) + 's');
        s.style.setProperty('--dx', hasard(-30, 30) + 'px');
        s.style.setProperty('--col', teintes[k % teintes.length]);
        z.appendChild(s);
      }
    });
    document.querySelectorAll('.coeurs-montants').forEach(z => {
      for (let k = 0; k < 12; k++) {
        const s = forme('coeur');
        s.style.left = hasard(2, 94) + '%';
        s.style.setProperty('--s', hasard(10, 20) + 'px');
        s.style.setProperty('--t', hasard(5, 8) + 's');
        s.style.setProperty('--d', hasard(-8, 0) + 's');
        s.style.setProperty('--dx', hasard(-24, 24) + 'px');
        s.style.setProperty('--col', ['rgba(255,214,232,.9)', 'rgba(255,179,209,.85)', 'rgba(255,246,214,.8)'][k % 3]);
        z.appendChild(s);
      }
    });
  }

  /* La guirlande du salon : les ampoules suivent la courbe du fil */
  document.querySelectorAll('.ampoules').forEach(z => {
    const teintes = ['#FFD166', '#FF8FB8', '#9CE0FF', '#FFF3C4'];
    for (let k = 1; k <= 9; k++) {
      const t = k / 10, u = 1 - t;
      const x = u * u * -2 + 2 * u * t * 50 + t * t * 102;
      const y = u * u * 4 + 2 * u * t * 22 + t * t * 4;
      const i = el('i');
      i.style.left = x + '%';
      i.style.top = (y / 20 * 22 + 1.2) + '%';
      i.style.setProperty('--c', teintes[k % teintes.length]);
      i.style.setProperty('--d', (-k * .37) + 's');
      z.appendChild(i);
    }
  });

  /* Les cœurs qui s'envolent au-dessus du premier bisou */
  if (MOUVEMENT) {
    document.querySelectorAll('.coeurs-pop').forEach(z => {
      for (let k = 0; k < 9; k++) {
        const s = forme('coeur');
        s.style.left = hasard(40, 60) + '%';
        s.style.setProperty('--s', hasard(11, 20) + 'px');
        s.style.setProperty('--t', hasard(2.4, 3.6) + 's');
        s.style.setProperty('--d', hasard(-3.6, 0) + 's');
        s.style.setProperty('--dx', hasard(-40, 40) + 'px');
        s.style.setProperty('--col', ['#FF8FB8', '#FFC7DF', '#E0457F'][k % 3]);
        z.appendChild(s);
      }
    });
  }

  /* ======================================================================
     Tourner les pages
     ====================================================================== */
  const feuilles = [...livre.querySelectorAll('.feuille')];
  const N = feuilles.length;
  let c = 0, nbTours = 0;

  const zonePoints = $('#points');
  const puces = feuilles.map((_, i) => {
    const b = el('button');
    b.type = 'button';
    b.setAttribute('aria-label', i === 0 ? 'Couverture' : 'Page ' + i);
    b.addEventListener('click', () => feuilleter(i));
    zonePoints.appendChild(b);
    return b;
  });
  const prec = $('#prec'), suiv = $('#suiv'), aide = $('#aide');

  function maj() {
    feuilles.forEach((f, i) => {
      const tournee = i < c;
      f.classList.toggle('tournee', tournee);
      f.classList.toggle('courante', i === c);
      f.classList.toggle('proche', Math.abs(i - c) <= 1);
      f.style.zIndex = String(tournee ? i + 1 : N * 2 - i);
      f.setAttribute('aria-hidden', String(i !== c));
      f.inert = i !== c;
    });
    puces.forEach((b, i) => b.setAttribute('aria-current', String(i === c)));
    prec.disabled = c === 0;
    suiv.disabled = c === N - 1;
    const info = infos[c];
    document.body.dataset.ambiance = info.ambiance;
    if (info.humeur) Son.humeur(info.humeur);
    Son.pluie(info.scene === 'pluie');
  }

  function aller(n) {
    n = Math.max(0, Math.min(N - 1, n));
    if (n === c) return;
    if (n > c) {
      //  La page qui part reste au-dessus pendant qu'elle se tourne
      const f = feuilles[c];
      f.classList.add('en-vol');
      setTimeout(() => f.classList.remove('en-vol'), 1250);
    }
    c = n;
    maj();
    Son.tourner();
    nbTours++;
    if (nbTours >= 2) aide.classList.add('cachee');
  }

  //  Aller loin : on tourne les pages une par une, comme on feuillette
  let minuteurFeuilleter = 0;
  function feuilleter(n) {
    clearTimeout(minuteurFeuilleter);
    const pas = () => {
      if (c === n) return;
      aller(c + (n > c ? 1 : -1));
      if (c !== n) minuteurFeuilleter = setTimeout(pas, MOUVEMENT ? 170 : 0);
    };
    pas();
  }

  function ouvrirLivre() {
    if (Son.demarrer()) $('#son').hidden = false;
    aller(1);
  }

  boutonOuvrir.addEventListener('click', e => { e.stopPropagation(); ouvrirLivre(); });
  prec.addEventListener('click', () => aller(c - 1));
  suiv.addEventListener('click', () => (c === 0 ? ouvrirLivre() : aller(c + 1)));

  //  Toucher la page : à droite on avance, à gauche on revient
  let x0 = null, y0 = null, glisse = false;
  livre.addEventListener('pointerdown', e => { x0 = e.clientX; y0 = e.clientY; glisse = false; });
  livre.addEventListener('pointerup', e => {
    if (x0 == null) return;
    const dx = e.clientX - x0, dy = e.clientY - y0;
    x0 = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      glisse = true;
      if (dx < 0) (c === 0 ? ouvrirLivre() : aller(c + 1));
      else aller(c - 1);
    }
  });
  livre.addEventListener('click', e => {
    if (glisse) { glisse = false; return; }
    if (e.target.closest('button, a, .astre')) return;
    if (c === 0) { ouvrirLivre(); return; }
    if (c === N - 1) return;              // le ciel : les touches sont pour les étoiles
    const r = livre.getBoundingClientRect();
    if ((e.clientX - r.left) / r.width < .36) aller(c - 1);
    else aller(c + 1);
  });
  addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { c === 0 ? ouvrirLivre() : aller(c + 1); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') aller(c - 1);
  });

  const boutonSon = $('#son');
  boutonSon.addEventListener('click', () => {
    const allume = Son.basculer();
    boutonSon.setAttribute('aria-pressed', String(allume));
    boutonSon.setAttribute('aria-label', allume ? 'Couper la musique' : 'Remettre la musique');
  });
  document.addEventListener('visibilitychange', () => Son.pause(document.hidden));

  /* ======================================================================
     Le ciel : allumer les étoiles une par une
     ====================================================================== */
  let allumees = 0;
  function majAstres() {
    astres.forEach((a, k) => {
      a.classList.toggle('allumee', k < allumees);
      a.classList.toggle('prochaine', k === allumees);
      a.setAttribute('role', 'button');
      a.setAttribute('tabindex', k === allumees ? '0' : '-1');
      a.setAttribute('aria-label', k < allumees ? 'Étoile allumée' : k === allumees ? 'Allumer cette étoile' : 'Étoile éteinte');
    });
  }
  function allumer(k) {
    if (k !== allumees || allumees >= NB) return;
    allumees++;
    if (k > 0) lignes[k - 1].classList.add('trace');
    phrase.textContent = ci.etoiles[k];
    phrase.classList.remove('nouvelle');
    void phrase.offsetWidth;
    phrase.classList.add('nouvelle');
    Son.etoile(k);
    const r = astres[k].getBoundingClientRect();
    eclat(r.left + r.width / 2, r.top + r.height / 2, 6, 12);
    majAstres();
    if (allumees === NB) setTimeout(terminer, 1600);
  }
  function terminer() {
    lignes[NB - 1].classList.add('trace');
    pageCiel.classList.add('complet');
    consigne.hidden = true;
    phrase.hidden = true;
    fin.hidden = false;
    Son.final();
    const r = svg.getBoundingClientRect();
    eclat(r.left + r.width / 2, r.top + r.height / 2, 22, 20);
  }
  astres.forEach((a, k) => {
    a.addEventListener('click', () => allumer(k));
    a.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); allumer(k); } });
  });
  relire.addEventListener('click', () => {
    feuilleter(0);
    setTimeout(() => {
      allumees = 0;
      lignes.forEach(l => l.classList.remove('trace'));
      pageCiel.classList.remove('complet');
      consigne.hidden = false;
      phrase.hidden = false;
      phrase.textContent = '';
      fin.hidden = true;
      majAstres();
    }, 600);
  });
  majAstres();

  /* ======================================================================
     Le ciel du fond : des étoiles qui scintillent, parfois une filante
     ====================================================================== */
  const toile = $('#ciel-fond');
  const g2 = toile.getContext('2d');
  let etoiles = [], filante = null, dernier = 0;
  function dimensionner() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    toile.width = innerWidth * dpr;
    toile.height = innerHeight * dpr;
    g2.setTransform(dpr, 0, 0, dpr, 0, 0);
    const nb = Math.round(innerWidth * innerHeight / 5200);
    etoiles = Array.from({ length: nb }, () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      r: hasard(.4, 1.5),
      v: hasard(.6, 2.2),
      p: hasard(0, Math.PI * 2),
      a: hasard(.25, .9)
    }));
  }
  function dessiner(t) {
    g2.clearRect(0, 0, innerWidth, innerHeight);
    for (const e of etoiles) {
      const al = MOUVEMENT ? e.a * (.55 + .45 * Math.sin(t / 1000 * e.v + e.p)) : e.a;
      g2.globalAlpha = al;
      g2.fillStyle = '#FFF8E6';
      g2.beginPath();
      g2.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      g2.fill();
    }
    if (MOUVEMENT) {
      if (!filante && Math.random() < .004) {
        filante = { x: hasard(0, innerWidth * .7), y: hasard(0, innerHeight * .4), vx: hasard(5, 8), vy: hasard(2, 3.5), vie: 1 };
      }
      if (filante) {
        const f = filante;
        const grad = g2.createLinearGradient(f.x, f.y, f.x - f.vx * 14, f.y - f.vy * 14);
        grad.addColorStop(0, 'rgba(255,248,230,' + f.vie + ')');
        grad.addColorStop(1, 'rgba(255,248,230,0)');
        g2.globalAlpha = 1;
        g2.strokeStyle = grad;
        g2.lineWidth = 1.6;
        g2.beginPath();
        g2.moveTo(f.x, f.y);
        g2.lineTo(f.x - f.vx * 14, f.y - f.vy * 14);
        g2.stroke();
        f.x += f.vx; f.y += f.vy; f.vie -= .012;
        if (f.vie <= 0) filante = null;
      }
    }
    g2.globalAlpha = 1;
  }
  function anime(t) {
    if (!document.hidden && t - dernier > 33) { dessiner(t); dernier = t; }
    requestAnimationFrame(anime);
  }
  dimensionner();
  addEventListener('resize', dimensionner);
  if (MOUVEMENT) requestAnimationFrame(anime); else dessiner(0);

  //  #p5 dans l'adresse ouvre directement la page 5 (pratique pour relire un passage)
  const m = /^#p(\d+)$/.exec(location.hash);
  if (m) c = Math.min(N - 1, Number(m[1]));
  maj();
})();
