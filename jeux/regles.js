/* ============================================================
   Règles des jeux : l'état de la partie et ce que chaque action y change.
   Seul le téléphone qui a créé la partie applique les actions (il fait foi) ;
   l'autre envoie les siennes et reçoit l'état. Pas une ligne de DOM ici,
   pour pouvoir tout vérifier hors navigateur.
   Joueurs : 'a' = qui a créé la partie, 'b' = qui l'a rejointe.
   ============================================================ */
(() => {
  'use strict';
  const C = () => globalThis.CONTENU;
  const autre = j => (j === 'a' ? 'b' : 'a');
  const hasard = n => Math.floor(Math.random() * n);
  const DEUX = ['a', 'b'];

  function melanger(n) {
    const t = [...Array(n).keys()];
    for (let i = n - 1; i > 0; i--) { const j = hasard(i + 1); [t[i], t[j]] = [t[j], t[i]]; }
    return t;
  }
  //  Chaque jeu tire dans son paquet sans remise : pas deux fois la même
  //  question avant d'avoir vu toutes les autres, même en changeant de jeu
  function tirer(etat, cle, n) {
    const p = etat.paquets[cle] || (etat.paquets[cle] = { ordre: [], pos: 0 });
    if (p.pos >= p.ordre.length || p.ordre.length !== n) { p.ordre = melanger(n); p.pos = 0; }
    return p.ordre[p.pos++];
  }
  const score = (etat, cle, init) => etat.scores[cle] || (etat.scores[cle] = init());
  const vide = () => ({ a: null, b: null });
  const tousLa = r => r.a !== null && r.b !== null;

  /* ---------- les jeux « chacun répond en secret, puis on révèle » ---------- */
  function vote({ question, valide, revele, suite }) {
    return {
      secret: true,
      init(etat) { const jeu = { n: 1, rep: vide(), phase: 'choix' }; question(etat, jeu); return jeu; },
      agir(etat, jeu, act, de) {
        if (act.type === 'repondre' && act.n === jeu.n && jeu.phase === 'choix' && jeu.rep[de] === null && valide(act.val, jeu)) {
          jeu.rep[de] = act.val;
          if (tousLa(jeu.rep)) { jeu.phase = 'revele'; revele(etat, jeu); }
        } else if (act.type === 'suivant' && act.n === jeu.n && (jeu.phase === 'revele' || jeu.phase === 'fin')) {
          if (suite && suite(etat, jeu) === false) return;
          jeu.n++; jeu.rep = vide(); jeu.phase = 'choix';
          question(etat, jeu);
        }
      },
      attendus: (etat, jeu) => (jeu.phase === 'choix' ? DEUX.filter(j => jeu.rep[j] === null) : [])
    };
  }

  const JEUX = {};

  JEUX.preferes = vote({
    question: (etat, jeu) => { jeu.q = tirer(etat, 'preferes', C().preferes.length); },
    valide: v => v === 0 || v === 1,
    revele(etat, jeu) {
      const s = score(etat, 'preferes', () => ({ manches: 0, accords: 0 }));
      s.manches++; if (jeu.rep.a === jeu.rep.b) s.accords++;
    }
  });

  JEUX.qui = vote({
    question: (etat, jeu) => { jeu.q = tirer(etat, 'qui', C().qui.length); },
    valide: v => v === 'a' || v === 'b',
    revele(etat, jeu) {
      const s = score(etat, 'qui', () => ({ manches: 0, accords: 0, a: 0, b: 0 }));
      s.manches++; if (jeu.rep.a === jeu.rep.b) s.accords++;
      s[jeu.rep.a]++; s[jeu.rep.b]++;
    }
  });

  JEUX.jamais = vote({
    question: (etat, jeu) => { jeu.q = tirer(etat, 'jamais', C().jamais.length); },
    valide: v => v === 'jamais' || v === 'deja',
    revele(etat, jeu) {
      const s = score(etat, 'jamais', () => ({ manches: 0, tousDeux: 0, a: 0, b: 0 }));
      s.manches++;
      if (jeu.rep.a === 'deja') s.a++;
      if (jeu.rep.b === 'deja') s.b++;
      if (jeu.rep.a === 'deja' && jeu.rep.b === 'deja') s.tousDeux++;
    }
  });

  //  Quiz Stitch : parties de 10 questions, 1 point par bonne réponse
  const QUIZ_PARTIE = 10;
  JEUX.quiz = vote({
    question(etat, jeu) {
      jeu.q = tirer(etat, 'quiz', C().quiz.length);
      jeu.num = (jeu.num || 0) + 1;
      if (!jeu.points || jeu.num === 1) jeu.points = { a: 0, b: 0 };
    },
    valide: v => Number.isInteger(v) && v >= 0 && v < 4,
    revele(etat, jeu) {
      const bonne = C().quiz[jeu.q][2];
      for (const j of DEUX) if (jeu.rep[j] === bonne) jeu.points[j]++;
      if (jeu.num >= QUIZ_PARTIE) {
        jeu.phase = 'fin';
        const s = score(etat, 'quiz', () => ({ parties: 0, a: 0, b: 0 }));
        s.parties++;
        if (jeu.points.a !== jeu.points.b) s[jeu.points.a > jeu.points.b ? 'a' : 'b']++;
      }
    },
    suite(etat, jeu) { if (jeu.phase === 'fin') jeu.num = 0; }
  });
  JEUX.quiz.taillePartie = QUIZ_PARTIE;

  //  Poêle, Affiche, Ciseaux : la poêle écrase les ciseaux, l'affiche enveloppe la poêle,
  //  les ciseaux découpent l'affiche. Premier à 3.
  const BAT = { poele: 'ciseaux', affiche: 'poele', ciseaux: 'affiche' };
  JEUX.chifoumi = vote({
    question(etat, jeu) { if (!jeu.points || jeu.fin) { jeu.points = { a: 0, b: 0 }; jeu.fin = null; } jeu.gagne = null; },
    valide: v => v in BAT,
    revele(etat, jeu) {
      const { a, b } = jeu.rep;
      jeu.gagne = a === b ? null : BAT[a] === b ? 'a' : 'b';
      if (jeu.gagne) jeu.points[jeu.gagne]++;
      if (jeu.gagne && jeu.points[jeu.gagne] >= 3) {
        jeu.fin = jeu.gagne;
        score(etat, 'chifoumi', () => ({ a: 0, b: 0 }))[jeu.gagne]++;
      }
    }
  });

  /* ---------- Tu me connais ? : l'un répond sur lui, l'autre devine ---------- */
  JEUX.connais = {
    secret: true,
    init(etat) { const jeu = { n: 0 }; JEUX.connais.manche(etat, jeu); return jeu; },
    manche(etat, jeu) {
      jeu.n++;
      jeu.cible = jeu.n % 2 ? 'b' : 'a';
      jeu.q = tirer(etat, 'connais', C().connais.length);
      jeu.rep = vide(); jeu.verdict = null; jeu.phase = 'ecrire';
    },
    agir(etat, jeu, act, de) {
      if (act.type === 'ecrire' && act.n === jeu.n && jeu.phase === 'ecrire' && jeu.rep[de] === null) {
        const t = String(act.texte || '').trim().slice(0, 90);
        if (!t) return;
        jeu.rep[de] = t;
        if (tousLa(jeu.rep)) jeu.phase = 'revele';
      } else if (act.type === 'juger' && act.n === jeu.n && jeu.phase === 'revele' && ['oui', 'presque', 'non'].includes(act.verdict)) {
        jeu.verdict = act.verdict;
        jeu.phase = 'juge';
        const s = score(etat, 'connais', () => ({ a: 0, b: 0, manches: 0 }));
        s.manches++;
        s[autre(jeu.cible)] += act.verdict === 'oui' ? 2 : act.verdict === 'presque' ? 1 : 0;
      } else if (act.type === 'suivant' && act.n === jeu.n && jeu.phase === 'juge') {
        JEUX.connais.manche(etat, jeu);
      }
    },
    attendus: (etat, jeu) => jeu.phase === 'ecrire' ? DEUX.filter(j => jeu.rep[j] === null)
      : jeu.phase === 'revele' ? [jeu.cible] : []
  };

  /* ---------- Sur la même longueur d'onde : un curseur de 0 à 10 ---------- */
  JEUX.onde = {
    secret: true,
    init(etat) { const jeu = { n: 0 }; JEUX.onde.manche(etat, jeu); return jeu; },
    manche(etat, jeu) {
      jeu.n++;
      jeu.cible = jeu.n % 2 ? 'b' : 'a';
      jeu.q = tirer(etat, 'onde', C().onde.length);
      jeu.rep = vide(); jeu.phase = 'choix'; jeu.gain = 0;
    },
    agir(etat, jeu, act, de) {
      if (act.type === 'repondre' && act.n === jeu.n && jeu.phase === 'choix' && jeu.rep[de] === null
          && Number.isInteger(act.val) && act.val >= 0 && act.val <= 10) {
        jeu.rep[de] = act.val;
        if (tousLa(jeu.rep)) {
          jeu.phase = 'revele';
          const ecart = Math.abs(jeu.rep.a - jeu.rep.b);
          jeu.gain = ecart === 0 ? 3 : ecart === 1 ? 2 : ecart === 2 ? 1 : 0;
          const s = score(etat, 'onde', () => ({ manches: 0, points: 0, parfaits: 0 }));
          s.manches++; s.points += jeu.gain; if (ecart === 0) s.parfaits++;
        }
      } else if (act.type === 'suivant' && act.n === jeu.n && jeu.phase === 'revele') {
        JEUX.onde.manche(etat, jeu);
      }
    },
    attendus: (etat, jeu) => (jeu.phase === 'choix' ? DEUX.filter(j => jeu.rep[j] === null) : [])
  };

  /* ---------- À cœur ouvert : des cartes pour parler ---------- */
  const NIVEAUX = ['leger', 'doux', 'profond'];
  JEUX.coeur = {
    init(etat, opt) {
      const jeu = { n: 0, niveau: NIVEAUX.includes(opt.niveau) ? opt.niveau : 'leger', qui: 'b' };
      JEUX.coeur.carte(etat, jeu);
      return jeu;
    },
    carte(etat, jeu) {
      jeu.n++;
      jeu.qui = autre(jeu.qui);
      jeu.q = tirer(etat, 'coeur-' + jeu.niveau, C().coeur[jeu.niveau].length);
      score(etat, 'coeur', () => ({ cartes: 0 })).cartes++;
    },
    agir(etat, jeu, act) {
      if (act.type === 'niveau' && NIVEAUX.includes(act.niveau) && act.niveau !== jeu.niveau) {
        jeu.niveau = act.niveau; JEUX.coeur.carte(etat, jeu);
      } else if (act.type === 'suivant' && act.n === jeu.n) {
        JEUX.coeur.carte(etat, jeu);
      }
    },
    attendus: () => []
  };

  /* ---------- Le pinceau magique : l'un dessine, l'autre devine ---------- */
  const DUREE_DESSIN = 90;
  const normaliser = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[’']/g, ' ').replace(/\b(le|la|les|un|une|des|du|de|l|d)\b/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim()
    .split(' ').map(m => (m.length > 3 ? m.replace(/(s|x)$/, '') : m)).join(' ');
  JEUX.dessin = {
    init: () => ({ n: 1, tour: 'a', phase: 'pret', q: null, debut: 0, duree: DUREE_DESSIN, essais: [], trouve: false }),
    agir(etat, jeu, act, de, maintenant) {
      if (act.type === 'lancer' && act.n === jeu.n && jeu.phase === 'pret') {
        jeu.q = tirer(etat, 'dessin', C().dessin.length); jeu.phase = 'dessin'; jeu.debut = maintenant; jeu.essais = []; jeu.trouve = false;
      } else if (act.type === 'deviner' && act.n === jeu.n && jeu.phase === 'dessin' && de !== jeu.tour) {
        const t = String(act.texte || '').trim().slice(0, 40);
        if (!t) return;
        const bon = normaliser(t) === normaliser(C().dessin[jeu.q]);
        jeu.essais.push({ t, bon });
        if (jeu.essais.length > 12) jeu.essais.shift();
        if (bon) JEUX.dessin.finir(etat, jeu, true);
      } else if (act.type === 'trouve' && act.n === jeu.n && jeu.phase === 'dessin') {
        JEUX.dessin.finir(etat, jeu, true);
      } else if ((act.type === 'passer' || act.type === 'fin_chrono') && act.n === jeu.n && jeu.phase === 'dessin') {
        JEUX.dessin.finir(etat, jeu, false);
      } else if (act.type === 'suivant' && act.n === jeu.n && jeu.phase === 'fin') {
        jeu.n++; jeu.tour = autre(jeu.tour); jeu.phase = 'pret'; jeu.q = null; jeu.essais = [];
      }
    },
    finir(etat, jeu, trouve) {
      jeu.trouve = trouve; jeu.phase = 'fin';
      const s = score(etat, 'dessin', () => ({ manches: 0, trouves: 0 }));
      s.manches++; if (trouve) s.trouves++;
    },
    echeances: jeu => (jeu.phase === 'dessin' ? [{ quand: jeu.debut + jeu.duree * 1000, action: { type: 'fin_chrono', n: jeu.n } }] : []),
    attendus: (etat, jeu) => [jeu.tour]
  };

  /* ---------- Le mime : un maximum de mots en 60 secondes ---------- */
  const DUREE_MIME = 60;
  JEUX.mime = {
    init: () => ({ n: 1, tour: 'b', phase: 'pret', q: null, debut: 0, duree: DUREE_MIME, trouves: 0, passes: 0, k: 0 }),
    agir(etat, jeu, act, de, maintenant) {
      const suivantMot = () => { jeu.q = tirer(etat, 'mime', C().mime.length); jeu.k++; };
      if (act.type === 'lancer' && act.n === jeu.n && jeu.phase === 'pret') {
        jeu.phase = 'jeu'; jeu.debut = maintenant; jeu.trouves = 0; jeu.passes = 0; jeu.k = 0; suivantMot();
      } else if ((act.type === 'trouve' || act.type === 'passer') && act.n === jeu.n && act.k === jeu.k && jeu.phase === 'jeu') {
        if (act.type === 'trouve') jeu.trouves++; else jeu.passes++;
        suivantMot();
      } else if (act.type === 'fin_chrono' && act.n === jeu.n && jeu.phase === 'jeu') {
        jeu.phase = 'fin';
        const s = score(etat, 'mime', () => ({ a: 0, b: 0, total: 0 }));
        s[jeu.tour] = Math.max(s[jeu.tour], jeu.trouves); s.total += jeu.trouves;
      } else if (act.type === 'suivant' && act.n === jeu.n && jeu.phase === 'fin') {
        jeu.n++; jeu.tour = autre(jeu.tour); jeu.phase = 'pret'; jeu.q = null;
      }
    },
    echeances: jeu => (jeu.phase === 'jeu' ? [{ quand: jeu.debut + jeu.duree * 1000, action: { type: 'fin_chrono', n: jeu.n } }] : []),
    attendus: (etat, jeu) => [jeu.tour]
  };

  /* ---------- 5 secondes chrono ---------- */
  JEUX.cinq = {
    init: () => ({ n: 1, tour: 'b', phase: 'pret', q: null, debut: 0, reussi: null }),
    agir(etat, jeu, act, de, maintenant) {
      if (act.type === 'lancer' && act.n === jeu.n && jeu.phase === 'pret') {
        jeu.q = tirer(etat, 'cinq', C().cinq.length); jeu.phase = 'chrono'; jeu.debut = maintenant;
      } else if (act.type === 'fin_chrono' && act.n === jeu.n && jeu.phase === 'chrono') {
        jeu.phase = 'juger';
      } else if (act.type === 'juger' && act.n === jeu.n && (jeu.phase === 'juger' || jeu.phase === 'chrono') && typeof act.reussi === 'boolean') {
        jeu.reussi = act.reussi; jeu.phase = 'fin';
        const s = score(etat, 'cinq', () => ({ a: 0, b: 0, essais: 0 }));
        s.essais++; if (act.reussi) s[jeu.tour]++;
      } else if (act.type === 'suivant' && act.n === jeu.n && jeu.phase === 'fin') {
        jeu.n++; jeu.tour = autre(jeu.tour); jeu.phase = 'pret'; jeu.reussi = null; jeu.q = null;
      }
    },
    echeances: jeu => (jeu.phase === 'chrono' ? [{ quand: jeu.debut + 5400, action: { type: 'fin_chrono', n: jeu.n } }] : []),
    attendus: (etat, jeu) => (jeu.phase === 'juger' ? [autre(jeu.tour)] : jeu.phase === 'pret' ? [jeu.tour] : [])
  };

  /* ---------- Memory : 8 paires d'images Stitch ---------- */
  const IMAGES_MEMORY = ['av-raiponce', 'av-flynn', 'av-pascal', 'av-maximus', 'av-fleurs', 'av-eugene', 'av-peinture',
    'av-pascal-calin', 'av-couronne', 'av-guitare', 'av-lanterne', 'av-poele', 'av-espiegle', 'av-brune', 'av-hiver', 'av-pascal-rire'];
  JEUX.memory = {
    init(etat) { const jeu = { n: 0, premier: 'a' }; JEUX.memory.donne(jeu); return jeu; },
    donne(jeu) {
      const choix = melanger(IMAGES_MEMORY.length).slice(0, 8).map(i => IMAGES_MEMORY[i]);
      const cartes = [...choix, ...choix];
      const o = melanger(16);
      jeu.cartes = o.map(i => cartes[i]);
      jeu.a_qui = Array(16).fill(null);
      jeu.retournees = []; jeu.cacherA = 0; jeu.coups = 0;
      jeu.points = { a: 0, b: 0 };
      jeu.n++;
      jeu.premier = jeu.n === 1 ? 'b' : autre(jeu.premier);
      jeu.tour = jeu.premier; jeu.phase = 'jeu';
    },
    agir(etat, jeu, act, de, maintenant) {
      if (act.type === 'retourner' && act.n === jeu.n && jeu.phase === 'jeu' && de === jeu.tour) {
        const i = act.i;
        if (!Number.isInteger(i) || i < 0 || i > 15 || jeu.a_qui[i] || jeu.retournees.includes(i) || jeu.retournees.length >= 2) return;
        jeu.retournees.push(i);
        if (jeu.retournees.length === 2) {
          jeu.coups++;
          const [x, y] = jeu.retournees;
          if (jeu.cartes[x] === jeu.cartes[y]) {
            jeu.a_qui[x] = jeu.a_qui[y] = jeu.tour; jeu.points[jeu.tour]++; jeu.retournees = [];
            if (jeu.a_qui.every(Boolean)) {
              jeu.phase = 'fin';
              const s = score(etat, 'memory', () => ({ a: 0, b: 0, nuls: 0 }));
              if (jeu.points.a === jeu.points.b) s.nuls++; else s[jeu.points.a > jeu.points.b ? 'a' : 'b']++;
            }
          } else {
            jeu.cacherA = maintenant + 1300;
          }
        }
      } else if (act.type === 'cacher' && act.n === jeu.n && act.coups === jeu.coups && jeu.retournees.length === 2) {
        jeu.retournees = []; jeu.cacherA = 0; jeu.tour = autre(jeu.tour);
      } else if (act.type === 'rejouer' && act.n === jeu.n && jeu.phase === 'fin') {
        JEUX.memory.donne(jeu);
      }
    },
    echeances: jeu => (jeu.cacherA ? [{ quand: jeu.cacherA, action: { type: 'cacher', n: jeu.n, coups: jeu.coups } }] : []),
    attendus: (etat, jeu) => (jeu.phase === 'jeu' ? [jeu.tour] : [])
  };
  JEUX.memory.images = IMAGES_MEMORY;

  /* ---------- Morpion : chacun joue avec son avatar ---------- */
  const LIGNES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
  JEUX.morpion = {
    init() { const jeu = { n: 0, premier: 'a' }; JEUX.morpion.grille(jeu); return jeu; },
    grille(jeu) {
      jeu.n++;
      jeu.premier = jeu.n === 1 ? 'b' : autre(jeu.premier);
      jeu.cases = Array(9).fill(null); jeu.tour = jeu.premier; jeu.gagnant = null; jeu.ligne = null;
    },
    agir(etat, jeu, act, de) {
      if (act.type === 'jouer' && act.n === jeu.n && !jeu.gagnant && de === jeu.tour && Number.isInteger(act.i) && act.i >= 0 && act.i < 9 && !jeu.cases[act.i]) {
        jeu.cases[act.i] = de;
        const l = LIGNES.find(([x, y, z]) => jeu.cases[x] && jeu.cases[x] === jeu.cases[y] && jeu.cases[x] === jeu.cases[z]);
        const s = () => score(etat, 'morpion', () => ({ a: 0, b: 0, nuls: 0 }));
        if (l) { jeu.gagnant = de; jeu.ligne = l; s()[de]++; }
        else if (jeu.cases.every(Boolean)) { jeu.gagnant = 'nul'; s().nuls++; }
        else jeu.tour = autre(de);
      } else if (act.type === 'rejouer' && act.n === jeu.n && jeu.gagnant) {
        JEUX.morpion.grille(jeu);
      }
    },
    attendus: (etat, jeu) => (jeu.gagnant ? [] : [jeu.tour])
  };

  /* ---------- Duel de réflexes : chacun mesure son temps sur son écran ---------- */
  JEUX.reflexes = {
    secret: true,
    init: () => ({ n: 1, phase: 'pret', prets: { a: false, b: false }, temps: vide(), depart: 0, delai: 0, points: { a: 0, b: 0 }, gagne: null, fin: null }),
    agir(etat, jeu, act, de, maintenant) {
      if (act.type === 'pret' && act.n === jeu.n && jeu.phase === 'pret' && !jeu.prets[de]) {
        jeu.prets[de] = true;
        if (jeu.prets.a && jeu.prets.b) { jeu.phase = 'attente'; jeu.depart = maintenant + 700; jeu.delai = 1500 + hasard(3000); }
      } else if (act.type === 'temps' && act.n === jeu.n && jeu.phase === 'attente' && jeu.temps[de] === null) {
        const t = act.tot ? 'tot' : Math.max(80, Math.min(5000, Math.round(Number(act.ms) || 5000)));
        jeu.temps[de] = t;
        if (tousLa(jeu.temps)) {
          const { a, b } = jeu.temps;
          jeu.gagne = a === 'tot' && b === 'tot' ? null : a === 'tot' ? 'b' : b === 'tot' ? 'a' : a === b ? null : a < b ? 'a' : 'b';
          jeu.phase = 'resultat';
          const s = score(etat, 'reflexes', () => ({ a: 0, b: 0, record: { a: null, b: null } }));
          for (const j of DEUX) if (typeof jeu.temps[j] === 'number' && (s.record[j] === null || jeu.temps[j] < s.record[j])) s.record[j] = jeu.temps[j];
          if (jeu.gagne) {
            jeu.points[jeu.gagne]++;
            if (jeu.points[jeu.gagne] >= 3) { jeu.fin = jeu.gagne; s[jeu.gagne]++; }
          }
        }
      } else if (act.type === 'suivant' && act.n === jeu.n && jeu.phase === 'resultat') {
        if (jeu.fin) { jeu.points = { a: 0, b: 0 }; jeu.fin = null; }
        jeu.n++; jeu.phase = 'pret'; jeu.prets = { a: false, b: false }; jeu.temps = vide(); jeu.gagne = null;
      }
    },
    attendus: (etat, jeu) => jeu.phase === 'pret' ? DEUX.filter(j => !jeu.prets[j])
      : jeu.phase === 'attente' ? DEUX.filter(j => jeu.temps[j] === null) : []
  };

  /* ---------- La roue des câlins ---------- */
  const PARTS = 12;
  JEUX.roue = {
    init(etat) { const jeu = { n: 1, tour: 'b', phase: 'pret', seg: null, depart: 0, tours: 0 }; JEUX.roue.garnir(etat, jeu); return jeu; },
    garnir(etat, jeu) {
      jeu.gages = [];
      while (jeu.gages.length < PARTS) {
        const g = tirer(etat, 'gages', C().gages.length);
        if (!jeu.gages.includes(g)) jeu.gages.push(g);
      }
    },
    agir(etat, jeu, act, de, maintenant) {
      if (act.type === 'tourner' && act.n === jeu.n && jeu.phase === 'pret') {
        jeu.seg = hasard(PARTS); jeu.depart = maintenant + 250; jeu.phase = 'tourne'; jeu.tours++;
      } else if (act.type === 'fin_tour' && act.n === jeu.n && jeu.phase === 'tourne') {
        jeu.phase = 'resultat';
      } else if (act.type === 'suivant' && act.n === jeu.n && jeu.phase === 'resultat') {
        score(etat, 'roue', () => ({ gages: 0 })).gages++;
        jeu.n++; jeu.tour = autre(jeu.tour); jeu.phase = 'pret';
      } else if (act.type === 'garnir' && jeu.phase !== 'tourne') {
        JEUX.roue.garnir(etat, jeu); jeu.phase = 'pret'; jeu.seg = null; jeu.n++;
      }
    },
    echeances: jeu => (jeu.phase === 'tourne' ? [{ quand: jeu.depart + JEUX.roue.duree + 300, action: { type: 'fin_tour', n: jeu.n } }] : []),
    attendus: (etat, jeu) => (jeu.phase === 'pret' ? [jeu.tour] : [])
  };
  JEUX.roue.parts = PARTS;
  JEUX.roue.duree = 4200;

  /* ---------- Idée de sortie : trois dés ---------- */
  JEUX.sortie = {
    init: () => ({ n: 0, tirage: null, depart: 0 }),
    agir(etat, jeu, act, de, maintenant) {
      const S = C().sortie;
      if (act.type === 'lancer') {
        jeu.n++;
        jeu.tirage = { ou: hasard(S.ou.length), quoi: hasard(S.quoi.length), plus: hasard(S.plus.length) };
        jeu.depart = maintenant;
      } else if (act.type === 'garder' && act.n === jeu.n && jeu.tirage) {
        const s = score(etat, 'sortie', () => ({ gardees: [] }));
        const cle = [jeu.tirage.ou, jeu.tirage.quoi, jeu.tirage.plus].join('-');
        if (!s.gardees.some(g => g.cle === cle)) s.gardees.unshift({ cle, ...jeu.tirage, par: de });
        s.gardees = s.gardees.slice(0, 30);
      } else if (act.type === 'oublier' && Number.isInteger(act.i)) {
        const s = score(etat, 'sortie', () => ({ gardees: [] }));
        s.gardees.splice(act.i, 1);
      }
    },
    attendus: () => []
  };

  /* ---------- Deux vérités, un mensonge ---------- */
  JEUX.mensonge = {
    secret: true,
    init(etat) { const jeu = { n: 0 }; JEUX.mensonge.manche(etat, jeu); return jeu; },
    manche(etat, jeu) {
      jeu.n++;
      jeu.auteur = jeu.n % 2 ? 'b' : 'a';
      jeu.theme = tirer(etat, 'mensonge', C().mensonge.length);
      jeu.phrases = null; jeu.faux = null; jeu.choix = null; jeu.phase = 'ecrire';
    },
    agir(etat, jeu, act, de) {
      if (act.type === 'ecrire' && act.n === jeu.n && jeu.phase === 'ecrire' && de === jeu.auteur) {
        const p = Array.isArray(act.phrases) ? act.phrases.map(t => String(t || '').trim().slice(0, 120)) : [];
        if (p.length !== 3 || p.some(t => !t) || !Number.isInteger(act.faux) || act.faux < 0 || act.faux > 2) return;
        //  l'ordre est mélangé : le mensonge n'est jamais au même endroit
        const o = melanger(3);
        jeu.phrases = o.map(i => p[i]);
        jeu.faux = o.indexOf(act.faux);
        jeu.phase = 'deviner';
      } else if (act.type === 'deviner' && act.n === jeu.n && jeu.phase === 'deviner' && de !== jeu.auteur
          && Number.isInteger(act.i) && act.i >= 0 && act.i < 3) {
        jeu.choix = act.i; jeu.phase = 'revele';
        const s = score(etat, 'mensonge', () => ({ a: 0, b: 0, manches: 0 }));
        s.manches++;
        s[act.i === jeu.faux ? autre(jeu.auteur) : jeu.auteur]++;
      } else if (act.type === 'suivant' && act.n === jeu.n && jeu.phase === 'revele') {
        JEUX.mensonge.manche(etat, jeu);
      }
    },
    attendus: (etat, jeu) => (jeu.phase === 'ecrire' ? [jeu.auteur] : jeu.phase === 'deviner' ? [autre(jeu.auteur)] : [])
  };

  /* ---------- Mots jumeaux : le même mot sans se concerter ---------- */
  JEUX.jumeaux = {
    secret: true,
    init(etat) { const jeu = { n: 0 }; JEUX.jumeaux.manche(etat, jeu); return jeu; },
    manche(etat, jeu) {
      jeu.n++;
      jeu.q = tirer(etat, 'jumeaux', C().jumeaux.length);
      jeu.rep = vide(); jeu.phase = 'choix'; jeu.pareil = false; jeu.accorde = false;
    },
    agir(etat, jeu, act, de) {
      if (act.type === 'ecrire' && act.n === jeu.n && jeu.phase === 'choix' && jeu.rep[de] === null) {
        const t = String(act.texte || '').trim().slice(0, 40);
        if (!t) return;
        jeu.rep[de] = t;
        if (tousLa(jeu.rep)) {
          jeu.phase = 'revele';
          const x = normaliser(jeu.rep.a), y = normaliser(jeu.rep.b);
          jeu.pareil = !!x && x === y;
          const s = score(etat, 'jumeaux', () => ({ manches: 0, pareils: 0 }));
          s.manches++; if (jeu.pareil) s.pareils++;
        }
      } else if (act.type === 'compter' && act.n === jeu.n && jeu.phase === 'revele' && !jeu.pareil) {
        //  « fraise » et « fraises des bois » : on peut décider que ça compte
        jeu.pareil = true; jeu.accorde = true;
        score(etat, 'jumeaux', () => ({ manches: 0, pareils: 0 })).pareils++;
      } else if (act.type === 'suivant' && act.n === jeu.n && jeu.phase === 'revele') {
        JEUX.jumeaux.manche(etat, jeu);
      }
    },
    attendus: (etat, jeu) => (jeu.phase === 'choix' ? DEUX.filter(j => jeu.rep[j] === null) : [])
  };

  /* ---------- L'histoire à quatre mains : une phrase chacun ---------- */
  const PHRASES_HISTOIRE = 8;
  JEUX.histoire = {
    init(etat) { const jeu = { n: 0 }; JEUX.histoire.nouvelle(etat, jeu); return jeu; },
    nouvelle(etat, jeu) {
      jeu.n++;
      jeu.debut = tirer(etat, 'histoires', C().histoires.length);
      jeu.phrases = []; jeu.tour = jeu.n % 2 ? 'b' : 'a'; jeu.phase = 'ecrire'; jeu.max = PHRASES_HISTOIRE;
    },
    agir(etat, jeu, act, de) {
      if (act.type === 'ajouter' && act.n === jeu.n && jeu.phase === 'ecrire' && de === jeu.tour && act.k === jeu.phrases.length) {
        const t = String(act.texte || '').trim().slice(0, 160);
        if (!t) return;
        jeu.phrases.push({ de, t });
        jeu.tour = autre(jeu.tour);
        if (jeu.phrases.length >= jeu.max) JEUX.histoire.finir(etat, jeu);
      } else if (act.type === 'finir' && act.n === jeu.n && jeu.phase === 'ecrire' && jeu.phrases.length >= 2) {
        JEUX.histoire.finir(etat, jeu);
      } else if (act.type === 'nouvelle' && act.n === jeu.n && jeu.phase === 'fin') {
        JEUX.histoire.nouvelle(etat, jeu);
      }
    },
    finir(etat, jeu) {
      jeu.phase = 'fin';
      const s = score(etat, 'histoire', () => ({ histoires: 0, recueil: [] }));
      s.histoires++;
      s.recueil.unshift({ debut: jeu.debut, phrases: jeu.phrases.map(p => [p.de, p.t]) });
      s.recueil = s.recueil.slice(0, 5);
    },
    attendus: (etat, jeu) => (jeu.phase === 'ecrire' ? [jeu.tour] : [])
  };

  /* ---------- Le mot mystère : sept lanternes, une s'éteint à chaque erreur ---------- */
  const lettresDe = mot => String(mot).toUpperCase().replace(/Œ/g, 'OE').replace(/Æ/g, 'AE').normalize('NFD').replace(/[̀-ͯ]/g, '');
  JEUX.pendu = {
    secret: true,
    init() { const jeu = { n: 0 }; JEUX.pendu.manche(jeu); return jeu; },
    manche(jeu) {
      jeu.n++;
      jeu.poseur = jeu.n % 2 ? 'a' : 'b';
      jeu.phase = 'choix'; jeu.mot = null; jeu.lettres = []; jeu.erreurs = 0; jeu.max = 7; jeu.gagne = null; jeu.perso = false;
    },
    agir(etat, jeu, act, de) {
      if (act.type === 'choisir' && act.n === jeu.n && jeu.phase === 'choix' && de === jeu.poseur) {
        let mot = act.mot ? String(act.mot).replace(/[^A-Za-zÀ-ÖØ-öø-ÿŒœ \-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 24) : '';
        if (lettresDe(mot).replace(/[^A-Z]/g, '').length < 2) mot = '';
        jeu.perso = !!mot;
        jeu.mot = mot || C().pendu[tirer(etat, 'pendu', C().pendu.length)];
        jeu.phase = 'jeu';
      } else if (act.type === 'lettre' && act.n === jeu.n && jeu.phase === 'jeu' && de !== jeu.poseur) {
        const l = String(act.l || '').toUpperCase();
        if (!/^[A-Z]$/.test(l) || jeu.lettres.includes(l)) return;
        jeu.lettres.push(l);
        const lettres = lettresDe(jeu.mot).replace(/[^A-Z]/g, '');
        if (!lettres.includes(l)) jeu.erreurs++;
        if ([...lettres].every(x => jeu.lettres.includes(x))) JEUX.pendu.finir(etat, jeu, autre(jeu.poseur));
        else if (jeu.erreurs >= jeu.max) JEUX.pendu.finir(etat, jeu, jeu.poseur);
      } else if (act.type === 'suivant' && act.n === jeu.n && jeu.phase === 'fin') {
        JEUX.pendu.manche(jeu);
      }
    },
    finir(etat, jeu, g) {
      jeu.phase = 'fin'; jeu.gagne = g;
      score(etat, 'pendu', () => ({ a: 0, b: 0 }))[g]++;
    },
    attendus: (etat, jeu) => (jeu.phase === 'choix' ? [jeu.poseur] : jeu.phase === 'jeu' ? [autre(jeu.poseur)] : [])
  };
  JEUX.pendu.lettresDe = lettresDe;

  /* ---------- Quatre à la suite ---------- */
  const COLS = 7, LIGS = 6;
  function alignes(cases, r, c, j) {
    for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
      const l = [r * COLS + c];
      for (const s of [1, -1]) {
        let rr = r + dr * s, cc = c + dc * s;
        while (rr >= 0 && rr < LIGS && cc >= 0 && cc < COLS && cases[rr * COLS + cc] === j) { l.push(rr * COLS + cc); rr += dr * s; cc += dc * s; }
      }
      if (l.length >= 4) return l;
    }
    return null;
  }
  JEUX.puissance = {
    init() { const jeu = { n: 0, premier: 'a' }; JEUX.puissance.grille(jeu); return jeu; },
    grille(jeu) {
      jeu.n++;
      jeu.premier = jeu.n === 1 ? 'b' : autre(jeu.premier);
      jeu.cases = Array(COLS * LIGS).fill(null); jeu.tour = jeu.premier; jeu.gagnant = null; jeu.ligne = null; jeu.dernier = null;
    },
    agir(etat, jeu, act, de) {
      if (act.type === 'jouer' && act.n === jeu.n && !jeu.gagnant && de === jeu.tour && Number.isInteger(act.c) && act.c >= 0 && act.c < COLS) {
        let r = LIGS - 1;
        while (r >= 0 && jeu.cases[r * COLS + act.c]) r--;
        if (r < 0) return;
        const i = r * COLS + act.c;
        jeu.cases[i] = de; jeu.dernier = i;
        const l = alignes(jeu.cases, r, act.c, de);
        const s = () => score(etat, 'puissance', () => ({ a: 0, b: 0, nuls: 0 }));
        if (l) { jeu.gagnant = de; jeu.ligne = l; s()[de]++; }
        else if (jeu.cases.every(Boolean)) { jeu.gagnant = 'nul'; s().nuls++; }
        else jeu.tour = autre(de);
      } else if (act.type === 'rejouer' && act.n === jeu.n && jeu.gagnant) {
        JEUX.puissance.grille(jeu);
      }
    },
    attendus: (etat, jeu) => (jeu.gagnant ? [] : [jeu.tour])
  };
  JEUX.puissance.cols = COLS; JEUX.puissance.ligs = LIGS;

  /* ---------- Les petits carrés : celui qui ferme une case rejoue ---------- */
  const CT = 4;
  JEUX.carres = {
    init() { const jeu = { n: 0, premier: 'a' }; JEUX.carres.grille(jeu); return jeu; },
    grille(jeu) {
      jeu.n++;
      jeu.premier = jeu.n === 1 ? 'b' : autre(jeu.premier);
      jeu.h = Array((CT + 1) * CT).fill(null);
      jeu.v = Array(CT * (CT + 1)).fill(null);
      jeu.boites = Array(CT * CT).fill(null);
      jeu.tour = jeu.premier; jeu.points = { a: 0, b: 0 }; jeu.phase = 'jeu'; jeu.dernier = null;
    },
    agir(etat, jeu, act, de) {
      if (act.type === 'trait' && act.n === jeu.n && jeu.phase === 'jeu' && de === jeu.tour && (act.t === 'h' || act.t === 'v') && Number.isInteger(act.i)) {
        const tab = jeu[act.t];
        if (act.i < 0 || act.i >= tab.length || tab[act.i]) return;
        tab[act.i] = de; jeu.dernier = act.t + act.i;
        let ferme = 0;
        for (let r = 0; r < CT; r++) for (let c = 0; c < CT; c++) {
          const b = r * CT + c;
          if (!jeu.boites[b] && jeu.h[r * CT + c] && jeu.h[(r + 1) * CT + c] && jeu.v[r * (CT + 1) + c] && jeu.v[r * (CT + 1) + c + 1]) {
            jeu.boites[b] = de; jeu.points[de]++; ferme++;
          }
        }
        if (jeu.boites.every(Boolean)) {
          jeu.phase = 'fin';
          const s = score(etat, 'carres', () => ({ a: 0, b: 0, nuls: 0 }));
          if (jeu.points.a === jeu.points.b) s.nuls++; else s[jeu.points.a > jeu.points.b ? 'a' : 'b']++;
        } else if (!ferme) jeu.tour = autre(de);
      } else if (act.type === 'rejouer' && act.n === jeu.n && jeu.phase === 'fin') {
        JEUX.carres.grille(jeu);
      }
    },
    attendus: (etat, jeu) => (jeu.phase === 'jeu' ? [jeu.tour] : [])
  };
  JEUX.carres.taille = CT;

  /* ---------- Dans le même ordre : classer quatre choses chacun de son côté ---------- */
  JEUX.ordre = vote({
    question: (etat, jeu) => { jeu.q = tirer(etat, 'ordre', C().ordre.length); jeu.communs = 0; },
    valide: v => Array.isArray(v) && v.length === 4 && v.every(x => Number.isInteger(x)) && [0, 1, 2, 3].every(k => v.includes(k)),
    revele(etat, jeu) {
      jeu.communs = jeu.rep.a.filter((x, i) => jeu.rep.b[i] === x).length;
      const s = score(etat, 'ordre', () => ({ manches: 0, points: 0, parfaits: 0 }));
      s.manches++; s.points += jeu.communs; if (jeu.communs === 4) s.parfaits++;
    }
  });

  /* ---------- Plus ou moins : le nombre secret, en duel ---------- */
  JEUX.nombre = {
    secret: true,
    init() { const jeu = { n: 0, duel: vide() }; JEUX.nombre.manche(jeu); return jeu; },
    manche(jeu) {
      jeu.n++;
      jeu.poseur = jeu.n % 2 ? 'a' : 'b';
      jeu.phase = 'choix'; jeu.secret = null; jeu.essais = []; jeu.perso = false;
      if (jeu.duel.a !== null && jeu.duel.b !== null) jeu.duel = vide();
    },
    agir(etat, jeu, act, de) {
      if (act.type === 'choisir' && act.n === jeu.n && jeu.phase === 'choix' && de === jeu.poseur) {
        const v = Number(act.v);
        jeu.perso = Number.isInteger(v) && v >= 1 && v <= 100;
        jeu.secret = jeu.perso ? v : 1 + hasard(100);
        jeu.phase = 'jeu';
      } else if (act.type === 'deviner' && act.n === jeu.n && jeu.phase === 'jeu' && de !== jeu.poseur && act.k === jeu.essais.length) {
        const v = Number(act.v);
        if (!Number.isInteger(v) || v < 1 || v > 100) return;
        const sens = v < jeu.secret ? 'plus' : v > jeu.secret ? 'moins' : 'ok';
        jeu.essais.push({ v, sens });
        if (sens === 'ok') {
          jeu.phase = 'fin';
          const devin = autre(jeu.poseur);
          jeu.duel[devin] = jeu.essais.length;
          const s = score(etat, 'nombre', () => ({ a: 0, b: 0, record: { a: null, b: null } }));
          if (s.record[devin] === null || jeu.essais.length < s.record[devin]) s.record[devin] = jeu.essais.length;
          if (jeu.duel.a !== null && jeu.duel.b !== null && jeu.duel.a !== jeu.duel.b) s[jeu.duel.a < jeu.duel.b ? 'a' : 'b']++;
        }
      } else if (act.type === 'suivant' && act.n === jeu.n && jeu.phase === 'fin') {
        JEUX.nombre.manche(jeu);
      }
    },
    attendus: (etat, jeu) => (jeu.phase === 'choix' ? [jeu.poseur] : jeu.phase === 'jeu' ? [autre(jeu.poseur)] : [])
  };

  /* ---------- quand une manche est-elle finie ? (pour le grand mélange) ---------- */
  const FINI = {
    preferes: j => j.phase !== 'choix', qui: j => j.phase !== 'choix', jamais: j => j.phase !== 'choix',
    quiz: j => j.phase !== 'choix', chifoumi: j => j.phase !== 'choix', ordre: j => j.phase !== 'choix',
    connais: j => j.phase === 'juge', onde: j => j.phase === 'revele', coeur: () => true,
    jumeaux: j => j.phase === 'revele', mensonge: j => j.phase === 'revele', histoire: j => j.phase === 'fin',
    morpion: j => !!j.gagnant, puissance: j => !!j.gagnant, memory: j => j.phase === 'fin', carres: j => j.phase === 'fin',
    reflexes: j => j.phase === 'resultat', cinq: j => j.phase === 'fin', mime: j => j.phase === 'fin',
    dessin: j => j.phase === 'fin', roue: j => j.phase === 'resultat', pendu: j => j.phase === 'fin',
    nombre: j => j.phase === 'fin', sortie: j => !!j.tirage
  };
  for (const [id, f] of Object.entries(FINI)) if (JEUX[id]) JEUX[id].fini = f;

  /* ---------- le grand mélange : des manches de jeux tirés au hasard ---------- */
  const MELANGE = ['preferes', 'qui', 'jamais', 'connais', 'onde', 'coeur', 'jumeaux', 'ordre', 'mensonge', 'quiz', 'chifoumi',
    'morpion', 'reflexes', 'cinq', 'mime', 'dessin', 'roue', 'pendu', 'nombre', 'puissance'];
  function lancerMelange(etat) {
    const avant = etat.jeu ? etat.jeu.id : null;
    let id = MELANGE[tirer(etat, 'melange', MELANGE.length)];
    if (id === avant) id = MELANGE[tirer(etat, 'melange', MELANGE.length)];
    etat.jeu = JEUX[id].init(etat, {});
    etat.jeu.id = id;
    etat.melange.manche++;
    score(etat, 'melange', () => ({ manches: 0 })).manches++;
  }

  /* ---------- la partie ---------- */
  function creer({ code, local, a, b }) {
    return {
      v: 1, code, local: !!local,
      joueurs: { a: { nom: a.nom, avatar: a.avatar, appareil: a.appareil || null }, b: b ? { nom: b.nom, avatar: b.avatar, appareil: b.appareil || null } : null },
      scores: {}, paquets: {}, jeu: null, appliques: [], heure: 0
    };
  }

  //  Applique une action ; renvoie true si l'état a changé (à republier)
  function appliquer(etat, act, maintenant = Date.now()) {
    if (!act || typeof act !== 'object') return false;
    if (act.id) {
      if (etat.appliques.includes(act.id)) return false;
      etat.appliques.push(act.id);
      if (etat.appliques.length > 80) etat.appliques.shift();
    }
    const de = act.de;
    if (act.type === 'rejoindre') {
      //  la place est libre, ou c'est le même téléphone, ou le même prénom (nouveau téléphone)
      const b = etat.joueurs.b;
      const meme = x => normaliser(x).replace(/ /g, '');
      if (!b || b.appareil === act.appareil || !b.appareil || (act.nom && meme(b.nom) === meme(act.nom))) {
        etat.joueurs.b = { nom: String(act.nom || 'Toi').slice(0, 20), avatar: String(act.avatar || 'angel'), appareil: act.appareil };
      }
    } else if (de !== 'a' && de !== 'b') {
      // action d'un inconnu : ignorée (mais son id est noté)
    } else if (act.type === 'profil') {
      const j = etat.joueurs[de];
      if (j) { if (act.nom) j.nom = String(act.nom).slice(0, 20); if (act.avatar) j.avatar = String(act.avatar); }
    } else if (act.type === 'choisirJeu') {
      if (JEUX[act.jeu] && etat.joueurs.b) { etat.jeu = JEUX[act.jeu].init(etat, act.options || {}); etat.jeu.id = act.jeu; etat.melange = null; }
    } else if (act.type === 'melange') {
      if (etat.joueurs.b) { etat.melange = { manche: 0 }; lancerMelange(etat); }
    } else if (act.type === 'melangeSuivant') {
      if (etat.melange && act.m === etat.melange.manche) lancerMelange(etat);
    } else if (act.type === 'quitterJeu') {
      etat.jeu = null; etat.melange = null;
    } else if (etat.jeu && JEUX[etat.jeu.id]) {
      JEUX[etat.jeu.id].agir(etat, etat.jeu, act, de, maintenant);
    }
    etat.v++;
    return true;
  }

  const attendus = etat => (etat.jeu && JEUX[etat.jeu.id] ? JEUX[etat.jeu.id].attendus(etat, etat.jeu) : []);
  const echeances = etat => (etat.jeu && JEUX[etat.jeu.id] && JEUX[etat.jeu.id].echeances ? JEUX[etat.jeu.id].echeances(etat.jeu) : []);

  globalThis.Regles = { JEUX, creer, appliquer, attendus, echeances, autre, normaliser, melanger, MELANGE };
})();
