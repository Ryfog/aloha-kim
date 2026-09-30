/* ============================================================
   L'île aux jeux : les écrans, la partie à deux téléphones
   (ou sur un seul), et l'affichage de chaque jeu.
   ============================================================ */
(() => {
  'use strict';
  const R = globalThis.Regles, C = globalThis.CONTENU, J = R.JEUX;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const app = $('#app'), barre = $('#barre');
  const autre = R.autre;
  const DEUX = ['a', 'b'];

  /* ---------- petite mémoire du navigateur (jamais bloquante) ---------- */
  const mem = {
    get(k, d = null) { try { const v = localStorage.getItem('ile.' + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem('ile.' + k, JSON.stringify(v)); } catch {} },
    del(k) { try { localStorage.removeItem('ile.' + k); } catch {} }
  };
  const rid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  const params = new URLSearchParams(location.search);
  const appareil = params.get('appareil') || mem.get('appareil') || (() => { const x = rid() + rid(); mem.set('appareil', x); return x; })();
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const A = (type, d = {}) => `data-a="${type}" data-d="${esc(JSON.stringify(d))}"`;

  /* ---------- personnages et jeux ---------- */
  const AVATARS = [
    ['stitch', 'Stitch'], ['angel', 'Angel'], ['lilo', 'Lilo'], ['hula', 'Stitch hula'], ['glace', 'Stitch glace'],
    ['ananas', 'Stitch ananas'], ['nounours', 'Stitch nounours'], ['coccinelle', 'Stitch coccinelle'],
    ['grenouille', 'Stitch et la grenouille'], ['musique', 'Stitch musique'], ['pasteque', 'Stitch pastèque'],
    ['elvis', 'Stitch Elvis'], ['cosmos', 'Stitch cosmonaute'], ['cuistot', 'Stitch cuistot'], ['pudge', 'Lilo et Pudge'],
    ['souillon', 'Stitch et Souillon']
  ];
  const INFOS = {
    preferes: { titre: 'Tu préfères…', img: 'bof', c: '#4C7BE0', desc: 'Deux choix, un seul possible', cat: 'decouvrir', regle: 'Chacun choisit en secret, puis on révèle en même temps : êtes-vous d’accord ?' },
    qui: { titre: 'Qui de nous deux ?', img: 'main-dans-la-main', c: '#FF8DC7', desc: 'Désignez-vous en secret', cat: 'decouvrir', regle: 'Chacun désigne celui ou celle qui correspond le mieux, sans voir la réponse de l’autre.' },
    jamais: { titre: 'Je n’ai jamais…', img: 'oups', c: '#FFCB47', desc: 'Avoue… ou pas', cat: 'decouvrir', regle: 'Pour chaque phrase, réponds « Moi si ! » ou « Jamais ». Les deux réponses s’affichent ensemble.' },
    connais: { titre: 'Tu me connais ?', img: 'timide', c: '#2FB67B', desc: 'L’un répond, l’autre devine', cat: 'decouvrir', regle: 'À tour de rôle, l’un écrit sa vraie réponse et l’autre ce qu’il imagine. Celui qui a répondu juge : juste (+2), presque (+1) ou raté.' },
    onde: { titre: 'Même longueur d’onde', img: 'surf', c: '#3FC1D9', desc: 'Un curseur de 0 à 10', cat: 'decouvrir', regle: 'L’un place le curseur pour lui-même, l’autre essaie de le mettre au même endroit. Pile dessus : 3 points pour vous deux !' },
    coeur: { titre: 'À cœur ouvert', img: 'coeur', c: '#FF5A7A', desc: 'Des questions pour se raconter', cat: 'decouvrir', regle: 'Tirez une carte et répondez chacun votre tour. Trois niveaux : léger, doux, profond.' },
    av: { titre: 'Action ou vérité', img: 'eclate', c: '#9B6CE8', desc: 'Version toute mignonne', cat: 'decouvrir', regle: 'Chacun son tour choisit action ou vérité. Trois jokers chacun pour changer de carte.' },
    dessin: { titre: 'Stitch dessine', img: 'dessine', c: '#4C7BE0', desc: 'Dessine, l’autre devine', cat: 'jouer', regle: 'L’un dessine le mot secret, l’autre voit le dessin apparaître sur son téléphone et devine. 90 secondes !' },
    mime: { titre: 'Le mime de Stitch', img: 'hula', c: '#2FB67B', desc: 'Un max de mots en 60 s', cat: 'jouer', regle: 'L’un mime les mots qui s’affichent sur son téléphone, l’autre devine à voix haute. Trouvé ou passer : le plus possible en 60 secondes.' },
    cinq: { titre: '5 secondes chrono', img: 'jongle', c: '#FFCB47', desc: 'Trois réponses, vite !', cat: 'jouer', regle: 'Une consigne s’affiche : cite trois réponses avant la fin des 5 secondes. L’autre juge.' },
    quiz: { titre: 'Quiz Stitch', img: 'lecture', c: '#FF8DC7', desc: 'Lilo & Stitch et Hawaï', cat: 'jouer', regle: 'Dix questions sur Lilo & Stitch et Hawaï. Chacun répond en secret : un point par bonne réponse.' },
    roue: { titre: 'La roue des câlins', img: 'calin', c: '#FF5A7A', desc: 'Des gages tout doux', cat: 'jouer', regle: 'Chacun son tour fait tourner la roue… et fait le gage. On peut changer les gages quand on veut.' },
    sortie: { titre: 'Idée de sortie', img: 'fusee', c: '#3FC1D9', desc: 'Trois dés pour un rendez-vous', cat: 'jouer', regle: 'Lancez les dés : un lieu, une activité, un petit plus. Gardez les idées qui vous plaisent.' },
    memory: { titre: 'Memory', img: 'souillon', c: '#4C7BE0', desc: '8 paires de Stitch', cat: 'defis', regle: 'Retournez deux cartes : une paire, c’est un point et on rejoue. Sinon, c’est au tour de l’autre.' },
    morpion: { titre: 'Morpion', img: 'amoureux', c: '#FF8DC7', desc: 'Ton personnage contre le sien', cat: 'defis', regle: 'Alignez trois fois votre personnage. Chacun commence une partie sur deux.' },
    chifoumi: { titre: 'Coco, Palme, Pince', img: 'rire', c: '#FFCB47', desc: 'Le chifoumi des îles', cat: 'defis', regle: 'La coco casse la pince, la palme couvre la coco, la pince coupe la palme. Premier à 3 !' },
    reflexes: { titre: 'Duel de réflexes', img: 'combinaison', c: '#2FB67B', desc: 'Le plus rapide gagne', cat: 'defis', regle: 'Quand Stitch surgit, touche l’écran le plus vite possible. Trop tôt, c’est perdu ! Premier à 3.' }
  };
  const CATS = [['decouvrir', 'Se découvrir 💬'], ['jouer', 'Jouer ensemble 🎉'], ['defis', 'Petits défis ⚡']];
  const MOTS_CODE = ['ALOHA', 'OHANA', 'MAHALO', 'HULA', 'LILO', 'STITCH', 'ANGEL', 'SURF', 'COCO', 'MANGUE', 'ANANAS', 'LAGON',
    'PLAGE', 'VAGUE', 'TIKI', 'KAUAI', 'BISOU', 'CALIN', 'COEUR', 'ETOILE', 'SOLEIL', 'PAPAYE', 'VANILLE', 'CORAIL', 'TORTUE',
    'PALMIER', 'UKULELE', 'HIBISCUS', 'PUDGE', 'LEI'];
  //  les phases où chacun répond en secret (sur un seul téléphone, on se le passe)
  const PHASE_SECRETE = { preferes: 'choix', qui: 'choix', jamais: 'choix', quiz: 'choix', chifoumi: 'choix', connais: 'ecrire', onde: 'choix', reflexes: 'attente' };

  /* ---------- l'état ---------- */
  let etat = null;          // la partie partagée
  let role = null;          // 'a' (a créé), 'b' (a rejoint), 'local' (un seul téléphone), 'joindre' (en cours)
  let salon = null;
  let decalage = 0;         // écart entre l'horloge de l'hôte et la nôtre
  let vuAutre = 0;          // dernière nouvelle de l'autre téléphone
  let enAttente = [];       // actions envoyées par l'invité, pas encore appliquées par l'hôte
  let profil = mem.get('profil', { nom: '', avatar: 'stitch' });
  const ui = { ecran: 'accueil', main: null, vueCle: '', section: '', anime: false, opt: null, erreur: '', code: '', rotation: 0, rouePour: '', reflexe: null };

  const maintenant = () => Date.now() + (role === 'b' || role === 'joindre' ? decalage : 0);
  const joueur = j => (etat && etat.joueurs[j]) || { nom: j === 'a' ? 'Joueur 1' : 'Joueur 2', avatar: j === 'a' ? 'stitch' : 'angel' };
  const nomDe = j => esc(joueur(j).nom);
  const imgAv = (j, cls = '') => `<img class="avatar ${j} ${cls}" src="img/${esc(joueur(j).avatar)}.webp" alt="" draggable="false">`;
  const puce = j => `<span class="puce">${imgAv(j)}<span>${nomDe(j)}</span></span>`;
  const moi = () => {
    if (role === 'a' || role === 'b') return role;
    const att = etat && etat.jeu ? R.attendus(etat) : [];
    if (att.length) return att[0];
    return (etat && etat.jeu && etat.jeu.tour) || 'a';
  };
  const peut = j => role === 'local' || role === j;
  const enLigne = () => role === 'local' || Date.now() - vuAutre < 16000;

  /* ---------- sons, vibrations, confettis ---------- */
  const Son = {
    actif: mem.get('sons', true), ctx: null,
    jouer(type) {
      if (!this.actif) return;
      try {
        this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)();
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const notes = { pop: [[660, 0, .07]], tic: [[1200, 0, .03]], ok: [[523, 0, .1], [659, .08, .1], [784, .16, .16]],
          ko: [[392, 0, .12], [311, .1, .22]], fanfare: [[523, 0, .1], [659, .09, .1], [784, .18, .1], [1047, .27, .3]] }[type] || [];
        const t0 = this.ctx.currentTime + .01;
        for (const [f, d, l] of notes) {
          const o = this.ctx.createOscillator(), g = this.ctx.createGain();
          o.type = type === 'tic' ? 'square' : 'triangle';
          o.frequency.setValueAtTime(f, t0 + d);
          g.gain.setValueAtTime(0.0001, t0 + d);
          g.gain.exponentialRampToValueAtTime(type === 'tic' ? .05 : .18, t0 + d + .012);
          g.gain.exponentialRampToValueAtTime(0.0001, t0 + d + l);
          o.connect(g).connect(this.ctx.destination);
          o.start(t0 + d); o.stop(t0 + d + l + .05);
        }
      } catch {}
    }
  };
  const vibrer = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch {} };
  function pluie(liste = ['💙', '💗', '🌺', '✨', '⭐', '🌴']) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    for (let i = 0; i < 28; i++) {
      const s = document.createElement('span');
      s.className = 'confetti';
      s.textContent = liste[i % liste.length];
      s.style.left = Math.random() * 100 + 'vw';
      s.style.setProperty('--dx', (Math.random() * 120 - 60) + 'px');
      s.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
      s.style.animationDuration = (1.8 + Math.random() * 1.6) + 's';
      s.style.animationDelay = Math.random() * .5 + 's';
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 4200);
    }
  }
  function toast(texte, duree = 2600) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = texte;
    $('#toasts').appendChild(t);
    setTimeout(() => t.remove(), duree);
    $('#annonce').textContent = texte;
  }

  /* ---------- réseau ---------- */
  function envoyerMsg(obj) { if (salon && role !== 'local') salon.envoyer('msg', obj); }
  function publier() {
    if (!salon || role !== 'a' || !etat) return;
    etat.heure = Date.now();
    salon.envoyer('etat', { t: 'etat', etat }, true);
  }
  async function ouvrirSalon(code) {
    if (salon) salon.fermer();
    salon = new globalThis.Reseau.Salon({
      code, appareil,
      surMessage: recevoir,
      surStatut: connecte => {
        if (connecte) {
          envoyerMsg({ t: 'ping' });
          if (role === 'a') publier();
          if (role === 'b' || role === 'joindre') { envoyerMsg({ t: 'sync' }); renvoyer(); }
        }
        rendreBarre();
      }
    });
    await salon.ouvrir();
  }
  function renvoyer() { for (const a of enAttente) envoyerMsg({ t: 'act', action: a }); }
  function recevoir(sous, m, garde) {
    if (!m || typeof m !== 'object') return;
    if (m.t === 'etat') { if (role === 'b' || role === 'joindre') recevoirEtat(m.etat, garde); return; }
    vuAutre = Date.now();
    //  une action déjà appliquée qui revient : l'invité n'a pas reçu l'état, on le renvoie
    if (m.t === 'act' && role === 'a') { if (!appliquerIci(m.action)) publier(); return; }
    if (m.t === 'ping') { if (typeof m.h === 'number' && role !== 'a') decalage = m.h - Date.now(); rendreBarre(); return; }
    if (m.t === 'sync' && role === 'a') { publier(); return; }
    if (m.t === 'bye') { toast('L’autre téléphone a quitté la partie 👋'); rendreBarre(); return; }
    if (['trait', 'effacer', 'tout', 'redessin'].includes(m.t)) Toile.recevoir(m);
  }
  function recevoirEtat(e, garde) {
    if (!e || !e.joueurs) return;
    if (etat && e.pid === etat.pid && e.v <= etat.v) return;
    //  un état gardé par le relais peut dater : il ne dit rien de l'heure de l'hôte
    if (!garde) { vuAutre = Date.now(); if (typeof e.heure === 'number' && e.heure) decalage = e.heure - Date.now(); }
    const avant = etat;
    etat = e;
    enAttente = enAttente.filter(a => !e.appliques.includes(a.id));
    if (role === 'joindre') {
      const b = e.joueurs.b;
      if (b && b.appareil === appareil) {
        role = 'b'; ui.erreur = ''; ui.ecran = 'ile';
        mem.set('partie', { code: e.code, role: 'b', date: Date.now() });
        toast('Te voilà sur l’île ! 🌴');
        Son.jouer('ok');
      } else if (b && b.appareil !== appareil && enAttente.length === 0) {
        ui.erreur = 'Cette partie a déjà deux joueurs 😿';
      }
    }
    if (role === 'b') { mem.set('etatInvite.' + e.code, e); mem.set('partie', { code: e.code, role: 'b', date: Date.now() }); }
    effets(avant, etat);
    rendre();
  }

  /* ---------- agir : appliquer ici (hôte, un seul téléphone) ou envoyer (invité) ---------- */
  function agir(type, data = {}, de) {
    if (!etat) return;
    const act = { type, de: de || moi(), ...data, id: rid() };
    if (role === 'b') {
      enAttente.push(act);
      envoyerMsg({ t: 'act', action: act });
      if (type === 'repondre' && etat.jeu) { ui.opt = { id: etat.jeu.id, n: data.n, val: data.val }; rendre(); }
      return;
    }
    appliquerIci(act);
  }
  function appliquerIci(act) {
    const avant = structuredClone(etat);
    if (!R.appliquer(etat, act, maintenant())) return false;
    if (act.type === 'rejoindre' && etat.joueurs.b && etat.joueurs.b.appareil === act.appareil && !(avant.joueurs.b && avant.joueurs.b.appareil === act.appareil)) {
      toast(esc(etat.joueurs.b.nom) + ' est sur l’île ! 💙');
      Son.jouer('fanfare'); pluie();
    }
    sauver();
    publier();
    planifier();
    effets(avant, etat);
    rendre();
    return true;
  }
  function sauver() {
    if (!etat || role === 'b' || role === 'joindre') return;
    mem.set('etat.' + etat.code, etat);
    mem.set('partie', { code: etat.code, role, date: Date.now() });
  }
  //  L'hôte (ou le téléphone unique) déclenche lui-même les fins de chrono
  let minuteurEcheance = null;
  function planifier() {
    clearTimeout(minuteurEcheance);
    if (!etat || role === 'b' || role === 'joindre') return;
    const liste = R.echeances(etat).sort((x, y) => x.quand - y.quand);
    if (!liste.length) return;
    const e = liste[0];
    minuteurEcheance = setTimeout(() => appliquerIci({ ...e.action, de: 'a', id: 'ech:' + JSON.stringify(e.action) }), Math.max(0, e.quand - Date.now()));
  }

  /* ---------- créer, rejoindre, reprendre, quitter ---------- */
  function genererCode() {
    return MOTS_CODE[Math.floor(Math.random() * MOTS_CODE.length)] + '-' + (10 + Math.floor(Math.random() * 90));
  }
  function profilValide() {
    const champ = $('#prenom');
    if (champ) profil.nom = champ.value.trim().slice(0, 20);
    mem.set('profil', profil);
    if (!profil.nom) { toast('Écris d’abord ton prénom 🙂'); champ && champ.focus(); return false; }
    return true;
  }
  async function creerPartie() {
    if (!profilValide()) return;
    const code = genererCode();
    etat = R.creer({ code, a: { nom: profil.nom, avatar: profil.avatar, appareil } });
    etat.pid = rid();
    role = 'a'; vuAutre = 0;
    sauver();
    ui.ecran = 'ile';
    rendre();
    verrouEcran();
    await ouvrirSalon(code);
    publier();
  }
  async function rejoindre(codeBrut) {
    if (!profilValide()) return;
    const code = globalThis.Reseau.normaliserCode(codeBrut);
    if (code.length < 4) { toast('Ce code a l’air incomplet 🤔'); return; }
    const joli = code.replace(/^([A-Z]+)(\d+)$/, '$1-$2');
    role = 'joindre'; etat = null; ui.erreur = ''; ui.code = joli; decalage = 0;
    const act = { type: 'rejoindre', de: 'b', appareil, nom: profil.nom, avatar: profil.avatar, id: rid() };
    enAttente = [act];
    rendre();
    await ouvrirSalon(code);
    renvoyer();
    setTimeout(() => {
      if (role === 'joindre' && !etat) { ui.erreur = 'Aucune partie trouvée pour l’instant… Vérifie le code, et que l’autre téléphone a bien la partie ouverte.'; rendre(); }
    }, 9000);
    verrouEcran();
  }
  function demarrerLocal() {
    const champ = $('#prenom2');
    const nom2 = champ ? champ.value.trim().slice(0, 20) : '';
    if (!profil.nom) { toast('Il manque ton prénom 🙂'); ui.ecran = 'accueil'; rendre(); return; }
    if (!nom2) { toast('Écris le prénom de l’autre joueur 🙂'); champ && champ.focus(); return; }
    mem.set('profil2', { nom: nom2, avatar: ui.avatar2 || 'angel' });
    etat = R.creer({ code: 'LOCAL', local: true, a: { nom: profil.nom, avatar: profil.avatar }, b: { nom: nom2, avatar: ui.avatar2 || 'angel' } });
    etat.pid = rid();
    role = 'local';
    sauver();
    ui.ecran = 'ile';
    rendre();
    verrouEcran();
  }
  async function reprendre(p) {
    if (!p) return;
    if (p.role === 'a' || p.role === 'local') {
      const e = mem.get('etat.' + p.code);
      if (!e) { mem.del('partie'); return; }
      etat = e; role = p.role; ui.ecran = 'ile';
      rendre();
      planifier();
      if (role === 'a') { await ouvrirSalon(e.code); publier(); }
    } else if (p.role === 'b') {
      etat = mem.get('etatInvite.' + p.code);
      role = 'b'; ui.ecran = 'ile';
      if (etat) decalage = 0;
      rendre();
      await ouvrirSalon(p.code);
      envoyerMsg({ t: 'sync' });
    }
    verrouEcran();
  }
  function quitter() {
    if (role === 'a' || role === 'b') envoyerMsg({ t: 'bye' });
    if (role === 'a' && salon) salon.effacer('etat');
    if (salon) { salon.fermer(); salon = null; }
    if (etat && etat.code) mem.del('etatInvite.' + etat.code);
    mem.del('partie');
    etat = null; role = null; enAttente = []; ui.ecran = 'accueil'; ui.main = null;
    history.replaceState(null, '', location.pathname + location.search);
    rendre();
  }
  let verrou = null;
  async function verrouEcran() {
    try { if ('wakeLock' in navigator && !verrou && document.visibilityState === 'visible') { verrou = await navigator.wakeLock.request('screen'); verrou.addEventListener('release', () => { verrou = null; }); } } catch {}
  }
  function partager() {
    if (!etat) return;
    const url = location.origin + location.pathname + '#' + etat.code.replace('-', '');
    const texte = 'Viens jouer avec moi sur l’île aux jeux 🌺 Code : ' + etat.code;
    if (navigator.share) navigator.share({ title: 'L’île aux jeux', text: texte, url }).catch(() => {});
    else {
      const copie = texte + ' — ' + url;
      (navigator.clipboard ? navigator.clipboard.writeText(copie) : Promise.reject()).then(() => toast('Lien copié ! Colle-le dans ta conversation 💌'), () => toast(copie, 6000));
    }
  }

  /* ---------- effets quand l'état change ---------- */
  function effets(avant, apres) {
    //  l'autre a lancé un jeu pendant qu'on regardait les scores : on y va
    if (apres && apres.jeu && !(avant && avant.jeu) && (ui.ecran === 'scores' || ui.ecran === 'profil')) ui.ecran = 'ile';
    if (!apres || !apres.jeu) return;
    const a = avant && avant.jeu && avant.jeu.id === apres.jeu.id ? avant.jeu : null;
    const j = apres.jeu, m = role === 'local' ? null : role;
    if (!a) { Son.jouer('pop'); return; }
    //  c'est à moi : une petite vibration
    const attAvant = R.attendus(avant), attApres = R.attendus(apres);
    if (m && attApres.includes(m) && !attAvant.includes(m) && ['memory', 'morpion', 'av', 'dessin', 'mime', 'cinq', 'roue'].includes(j.id)) vibrer(30);
    if (m && attApres.length < attAvant.length && a.phase === j.phase && a.n === j.n) Son.jouer('tic');
    const devient = ph => a.phase !== ph && j.phase === ph;
    switch (j.id) {
      case 'preferes': case 'qui':
        if (devient('revele')) { if (j.rep.a === j.rep.b) { Son.jouer('ok'); pluie(); } else Son.jouer('ko'); }
        break;
      case 'jamais':
        if (devient('revele')) Son.jouer(j.rep.a === j.rep.b ? 'ok' : 'pop');
        break;
      case 'quiz':
        if (devient('fin')) { Son.jouer('fanfare'); pluie(); }
        else if (devient('revele')) { const bonne = C.quiz[j.q][2]; Son.jouer(role === 'local' ? 'pop' : j.rep[m] === bonne ? 'ok' : 'ko'); }
        break;
      case 'chifoumi':
        if (devient('revele')) { if (j.fin) { Son.jouer('fanfare'); pluie(); } else Son.jouer(!j.gagne ? 'pop' : role === 'local' || j.gagne === m ? 'ok' : 'ko'); }
        break;
      case 'connais':
        if (devient('juge')) { if (j.verdict === 'oui') { Son.jouer('ok'); pluie(['💚', '✨', '🌺']); } else Son.jouer(j.verdict === 'non' ? 'ko' : 'pop'); }
        break;
      case 'onde':
        if (devient('revele')) { if (j.gain === 3) { Son.jouer('fanfare'); pluie(['🔮', '💙', '💗', '✨']); } else Son.jouer(j.gain ? 'ok' : 'ko'); }
        break;
      case 'dessin':
        if (devient('fin')) { if (j.trouve) { Son.jouer('fanfare'); pluie(['🎨', '✨', '💙']); } else Son.jouer('ko'); }
        break;
      case 'mime':
        if (devient('fin')) Son.jouer('fanfare');
        else if (j.k !== a.k && j.phase === 'jeu') Son.jouer(j.trouves > a.trouves ? 'ok' : 'pop');
        break;
      case 'cinq':
        if (devient('fin')) Son.jouer(j.reussi ? 'ok' : 'ko');
        if (devient('juger')) Son.jouer('tic');
        break;
      case 'memory':
        if (devient('fin')) { Son.jouer('fanfare'); pluie(); }
        else if (j.points.a + j.points.b > a.points.a + a.points.b) Son.jouer('ok');
        else if (j.retournees.length === 2 && a.retournees.length < 2) Son.jouer('ko');
        else if (j.retournees.length > a.retournees.length) Son.jouer('pop');
        break;
      case 'morpion':
        if (j.gagnant && !a.gagnant) { if (j.gagnant === 'nul') Son.jouer('pop'); else { Son.jouer('fanfare'); pluie(); } }
        else if (j.cases.filter(Boolean).length > a.cases.filter(Boolean).length) Son.jouer('pop');
        break;
      case 'reflexes':
        if (devient('resultat')) { if (j.fin) { Son.jouer('fanfare'); pluie(['⚡', '🏆', '✨']); } else Son.jouer(role === 'local' || j.gagne === m ? 'ok' : 'ko'); }
        break;
      case 'roue':
        if (devient('resultat')) { Son.jouer('fanfare'); pluie(['🤗', '💗', '💙']); }
        break;
      case 'sortie':
        if (j.n !== a.n) Son.jouer('pop');
        break;
    }
  }

  /* ---------- l'affichage ---------- */
  function rendre() {
    const section = etat && etat.jeu && role !== 'joindre' && ui.ecran === 'ile' ? etat.jeu.id + ':' + etat.jeu.n + ':' + etat.jeu.phase : ui.ecran + ':' + (etat ? 'p' : '') + (etat && etat.joueurs.b ? 'b' : '');
    ui.anime = section !== ui.section;
    const nouvellePage = section.split(':').slice(0, 2).join(':') !== ui.section.split(':').slice(0, 2).join(':');
    ui.section = section;
    let v;
    try { v = vue(); } catch (err) { console.error(err); v = { cle: 'erreur', html: `<div class="carte centre pile"><p>Oups, Stitch a tout cassé 🙈</p><button class="bouton" data-u="ile">Retour à l’île</button></div>` }; }
    if (v.cle !== ui.vueCle) {
      app.innerHTML = v.html;
      ui.vueCle = v.cle;
      if (v.monter) v.monter(app);
      if (nouvellePage) window.scrollTo({ top: 0, behavior: 'instant' });
    } else if (v.maj) v.maj(app);
    rendreBarre();
    rendreVoile();
  }
  function vue() {
    if (role === 'joindre') return vueConnexion();
    if (!etat) {
      if (ui.ecran === 'rejoindre') return vueRejoindre();
      if (ui.ecran === 'local') return vueLocal();
      return vueAccueil();
    }
    if (ui.ecran === 'scores') return vueScores();
    if (ui.ecran === 'profil') return vueProfil();
    if (!etat.joueurs.b) return vueAttente();
    if (etat.jeu) return vueJeu();
    return vueIle();
  }

  function rendreBarre() {
    if (!etat || role === 'joindre') { barre.hidden = true; return; }
    barre.hidden = false;
    const enJeu = !!etat.jeu && ui.ecran === 'ile';
    const ailleurs = ui.ecran === 'scores' || ui.ecran === 'profil';
    let point = 'vert', texte = 'en ligne';
    if (role === 'local') { point = 'vert'; texte = '1 téléphone'; }
    else if (!salon || !salon.connecte) { point = 'rouge'; texte = 'connexion…'; }
    else if (!etat.joueurs.b) { point = 'orange'; texte = 'en attente'; }
    else if (!enLigne()) { point = 'orange'; texte = 'hors ligne'; }
    const b = etat.joueurs.b;
    const html = `
      <button class="rond" data-u="${ailleurs ? 'retour' : enJeu ? 'quitterJeu' : 'scores'}" aria-label="${ailleurs ? 'Retour' : enJeu ? 'Retour à l’île' : 'Nos scores'}">${ailleurs ? '←' : enJeu ? '🏝️' : '🏆'}</button>
      <div class="barre-fond">
        <div class="duo">${imgAv('a', 'mini')}<span class="nom-court">${nomDe('a')}</span>${b ? `<span class="coeur-mini">♥</span><span class="nom-court">${nomDe('b')}</span>${imgAv('b', 'mini')}` : ''}</div>
        <span class="etat-connexion"><i class="point ${point}"></i>${texte}</span>
      </div>
      <button class="rond" data-u="menu" aria-label="Menu">⚙️</button>`;
    if (barre.dataset.cle !== html) { barre.innerHTML = html; barre.dataset.cle = html; }
  }

  function passageNecessaire() {
    if (role !== 'local' || !etat || !etat.jeu || ui.ecran !== 'ile') return null;
    const ph = PHASE_SECRETE[etat.jeu.id];
    if (!ph || etat.jeu.phase !== ph) { ui.main = null; return null; }
    const att = R.attendus(etat);
    if (!att.length) return null;
    return ui.main === att[0] ? null : att[0];
  }
  function rendreVoile() {
    const j = passageNecessaire();
    let v = $('#voile');
    if (!j) { if (v) v.remove(); return; }
    if (v && v.dataset.j === j) return;
    if (v) v.remove();
    v = document.createElement('div');
    v.id = 'voile'; v.className = 'voile'; v.dataset.j = j;
    v.innerHTML = `<div class="dedans">${imgAv(j, 'grand')}<h2 class="titre">À ${nomDe(j)} !</h2>
      <p>Passe le téléphone à ${nomDe(j)}.<br>${nomDe(autre(j))}, on ne regarde pas 🙈</p>
      <button class="bouton blanc large" data-u="prendMain" data-j="${j}">C’est moi, ${nomDe(j)} ! 👋</button></div>`;
    document.body.appendChild(v);
    setTimeout(() => { const bt = v.querySelector('button'); if (bt) bt.focus({ preventScroll: true }); }, 50);
  }

  /* ---------- écrans d'accueil ---------- */
  function blocProfil(id, valeurNom, avatarChoisi, cleAvatar, libelle) {
    return `<div class="pile">
      <div><label class="etiquette-champ" for="${id}">${libelle}</label>
        <input id="${id}" class="champ" maxlength="20" autocomplete="off" placeholder="Ton prénom" value="${esc(valeurNom)}"></div>
      <div><p class="etiquette-champ">Ton personnage</p>
        <div class="choix-avatars" role="group" aria-label="Choisir un personnage">
          ${AVATARS.map(([a, n]) => `<button type="button" class="choix-avatar" data-u="avatar" data-cle="${cleAvatar}" data-v="${a}" aria-pressed="${a === avatarChoisi}" aria-label="${esc(n)}"><img src="img/${a}.webp" alt="" loading="lazy"></button>`).join('')}
        </div></div>
    </div>`;
  }
  function vueAccueil() {
    const p = mem.get('partie');
    return {
      cle: 'accueil' + (p ? p.code : ''),
      html: `<section class="pile entree">
        <div class="accueil-haut">
          <img class="heros" src="img/duo-danse.webp" alt="Stitch et Angel qui dansent">
          <h1 class="grand-titre">L’île aux jeux</h1>
          <p class="sous-titre">Des jeux à deux, chacun sur son téléphone 🌺</p>
        </div>
        ${p ? `<div class="carte reprendre"><div class="texte"><b>Une partie en cours</b><p class="petit">${p.role === 'local' ? 'Sur ce téléphone' : 'Code ' + esc(p.code)}</p></div>
          <button class="bouton vert petit-bouton" data-u="reprendre">Reprendre</button></div>` : ''}
        <div class="carte">${blocProfil('prenom', profil.nom, profil.avatar, 'profil', 'Ton prénom')}</div>
        <div class="pile">
          <button class="bouton rose large" data-u="creer"><span class="emoji">🌺</span> Créer une partie</button>
          <button class="bouton large" data-u="versRejoindre"><span class="emoji">🔑</span> Rejoindre avec un code</button>
          <p class="centre"><button class="lien" data-u="versLocal">📱 Jouer à deux sur un seul téléphone</button></p>
        </div>
      </section>`,
      monter: m => { const c = $('#prenom', m); c.addEventListener('input', () => { profil.nom = c.value.trim().slice(0, 20); mem.set('profil', profil); }); }
    };
  }
  function vueRejoindre() {
    return {
      cle: 'rejoindre',
      html: `<section class="pile entree">
        <div class="accueil-haut"><img class="heros" src="img/coucou.webp" alt="Stitch qui fait coucou" style="width:140px"><h1 class="grand-titre" style="font-size:42px">Rejoindre</h1></div>
        <div class="carte pile">
          <div><label class="etiquette-champ" for="code">Le code de la partie</label>
            <input id="code" class="champ code" maxlength="14" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="OHANA-42" value="${esc(ui.code)}"></div>
        </div>
        <div class="carte">${blocProfil('prenom', profil.nom, profil.avatar, 'profil', 'Ton prénom')}</div>
        <button class="bouton rose large" data-u="rejoindre"><span class="emoji">🌴</span> Rejoindre la partie</button>
        <p class="centre"><button class="lien" data-u="accueil">← Retour</button></p>
      </section>`,
      monter: m => {
        const c = $('#prenom', m); c.addEventListener('input', () => { profil.nom = c.value.trim().slice(0, 20); mem.set('profil', profil); });
        const k = $('#code', m); k.addEventListener('input', () => { ui.code = k.value; });
        k.addEventListener('keydown', e => { if (e.key === 'Enter') rejoindre(k.value); });
        if (!ui.code) k.focus();
      }
    };
  }
  function vueLocal() {
    const p2 = mem.get('profil2', { nom: '', avatar: 'angel' });
    if (!ui.avatar2) ui.avatar2 = p2.avatar;
    return {
      cle: 'local',
      html: `<section class="pile entree">
        <div class="accueil-haut"><img class="heros" src="img/duo.webp" alt="" style="width:170px"><h1 class="grand-titre" style="font-size:40px">Sur un seul téléphone</h1>
          <p class="sous-titre">Vous vous passerez le téléphone quand il faut répondre en secret.</p></div>
        <div class="carte pile"><p class="titre" style="font-size:22px">${esc(profil.nom) || 'Toi'}</p>
          <p class="petit">C’est toi (tu peux changer ton prénom sur l’accueil).</p></div>
        <div class="carte">${blocProfil('prenom2', p2.nom, ui.avatar2, 'avatar2', 'Le prénom de l’autre joueur')}</div>
        <button class="bouton rose large" data-u="demarrerLocal"><span class="emoji">🌺</span> C’est parti !</button>
        <p class="centre"><button class="lien" data-u="accueil">← Retour</button></p>
      </section>`
    };
  }
  function vueConnexion() {
    const trouve = !!etat;
    return {
      cle: 'connexion' + ui.erreur + trouve,
      html: `<section class="pile entree centre">
        <div class="carte pile">
          <img class="attente-stitch" src="img/${ui.erreur ? 'inquiet' : 'coucou'}.webp" alt="">
          <p class="titre">${ui.erreur ? 'Hmm…' : trouve ? 'Partie trouvée !' : 'Recherche de la partie'}</p>
          <p class="code-geant" style="font-size:34px">${esc(ui.code)}</p>
          <p class="sous-titre">${ui.erreur ? esc(ui.erreur) : trouve ? 'On t’installe sur l’île<span class="points-attente"></span>' : 'Connexion aux relais<span class="points-attente"></span>'}</p>
          ${ui.erreur ? '<p class="petit">On continue de chercher en attendant.</p>' : ''}
        </div>
        <button class="bouton blanc large" data-u="annulerJoindre">Annuler</button>
      </section>`
    };
  }
  function vueAttente() {
    return {
      cle: 'attente' + etat.code,
      html: `<section class="pile entree centre">
        <div class="carte pile">
          <p class="titre">Ta partie est prête !</p>
          <p class="sous-titre">Donne ce code à ta moitié 💙</p>
          <p><span class="code-geant">${esc(etat.code)}</span></p>
          <button class="bouton rose large" data-u="partager"><span class="emoji">💌</span> Envoyer le lien</button>
        </div>
        <div class="carte pile">
          <img class="attente-stitch" src="img/coucou.webp" alt="">
          <p><b>En attente de l’autre joueur<span class="points-attente"></span></b></p>
          <p class="petit">Sur son téléphone : ouvrir ce site, « Rejoindre avec un code », taper <b>${esc(etat.code)}</b>. Gardez tous les deux la page ouverte pendant la partie.</p>
        </div>
        <p><button class="lien" data-u="quitter">Annuler la partie</button></p>
      </section>`
    };
  }

  /* ---------- l'île : choisir un jeu ---------- */
  function vueIle() {
    const s = etat.scores;
    const joue = id => {
      const x = s[id]; if (!x) return 0;
      return x.manches || x.cartes || x.parties || x.gages || x.essais || x.total || (x.a || 0) + (x.b || 0) + (x.nuls || 0) || 0;
    };
    const hors = role !== 'local' && etat.joueurs.b && !enLigne();
    return {
      cle: 'ile' + etat.joueurs.a.avatar + etat.joueurs.b.avatar + etat.joueurs.a.nom + etat.joueurs.b.nom + hors,
      html: `<section class="entree">
        <div class="carte transparente ile-titre pile">
          <div style="display:flex;justify-content:center;align-items:center;gap:10px">${imgAv('a', 'moyen')}<span style="font-size:30px">💞</span>${imgAv('b', 'moyen')}</div>
          <p class="titre">Aloha ${nomDe('a')} & ${nomDe('b')} !</p>
          <p class="petit">Touchez un jeu : il s’ouvre sur ${role === 'local' ? 'ce téléphone' : 'vos deux téléphones'}.</p>
        </div>
        ${hors ? `<p class="bandeau-hors-ligne" style="margin-top:12px">${role === 'a' ? nomDe('b') : nomDe('a')} n’est pas connecté(e) en ce moment. Tout reprendra dès son retour.</p>` : ''}
        ${CATS.map(([cat, titre]) => `<div class="categorie"><h2>${titre}</h2><div class="tuiles">
          ${Object.entries(INFOS).filter(([, i]) => i.cat === cat).map(([id, i]) => {
            const n = joue(id);
            return `<button class="tuile" style="--c:${i.c}" ${A('choisirJeu', { jeu: id })}>${n ? `<span class="nombre">${n}×</span>` : ''}<img src="img/${i.img}.webp" alt="" loading="lazy"><b>${i.titre}</b><span>${i.desc}</span></button>`;
          }).join('')}
        </div></div>`).join('')}
      </section>`
    };
  }

  /* ---------- l'habillage commun des jeux ---------- */
  function cadre(id, corps, sous = '') {
    const i = INFOS[id];
    return `<section class="pile ${ui.anime ? 'entree' : ''}">
      <div class="carte transparente">
        <div class="entete-jeu"><img src="img/${i.img}.webp" alt=""><div><h1 class="titre">${i.titre}</h1>${sous ? `<p class="petit">${sous}</p>` : ''}</div></div>
        <details class="regle"><summary>Comment on joue ?</summary><p>${i.regle}</p></details>
      </div>
      ${bandeauHors()}
      ${corps}
    </section>`;
  }
  const etatDuo = (fait, oui = 'a répondu ✓', non = 'réfléchit…') => `<div class="etat-duo">${DEUX.map(j => `
    <div class="etat-joueur ${fait(j) ? 'pret' : ''}">${imgAv(j, 'mini')}<div class="texte"><b>${nomDe(j)}</b><span class="${fait(j) ? 'fait' : 'reflechit'}">${fait(j) ? oui : non}</span></div></div>`).join('')}</div>`;
  const attenteDe = j => `<p class="attente">En attente de ${nomDe(j)}<span class="points-attente"></span></p>`;
  const bandeauHors = () => (role !== 'local' && !enLigne() ? `<p class="bandeau-hors-ligne">${role === 'a' ? nomDe('b') : nomDe('a')} n’est pas connecté(e)… le jeu reprend dès son retour.</p>` : '');
  function monChoix(j) {
    const m = moi();
    if (j.rep[m] !== null && j.rep[m] !== undefined) return j.rep[m];
    if (role === 'b' && ui.opt && ui.opt.id === j.id && ui.opt.n === j.n) return ui.opt.val;
    return null;
  }

  function vueJeu() {
    const j = etat.jeu;
    const f = VUES[j.id];
    if (!f) return { cle: 'inconnu', html: '<p class="carte">Jeu inconnu</p>' };
    const v = f(j);
    return { ...v, cle: j.id + '|' + v.cle + '|' + (enLigne() ? 1 : 0) };
  }

  const VUES = {};

  /* ---------- Tu préfères… ---------- */
  VUES.preferes = j => {
    const q = C.preferes[j.q], s = etat.scores.preferes;
    const tete = `<div class="carte question-carte"><p class="numero">Question ${j.n}</p><p class="intro">Tu préfères…</p></div>`;
    if (j.phase === 'choix') {
      const mien = monChoix(j), libre = mien === null;
      return {
        cle: j.n + 'c' + mien + JSON.stringify(DEUX.map(x => j.rep[x] !== null)),
        html: cadre('preferes', `${tete}
          <div class="choix-duo">
            <button class="option o0 ${mien === 0 ? 'choisie' : ''}" ${A('repondre', { n: j.n, val: 0 })} ${libre ? '' : 'disabled'}>${esc(q[0])}</button>
            <span class="ou" aria-hidden="true">ou</span>
            <button class="option o1 ${mien === 1 ? 'choisie' : ''}" ${A('repondre', { n: j.n, val: 1 })} ${libre ? '' : 'disabled'}>${esc(q[1])}</button>
          </div>
          ${!libre && role !== 'local' ? attenteDe(autre(moi())) : ''}
          ${role !== 'local' ? etatDuo(x => j.rep[x] !== null || (x === role && !libre)) : ''}`)
      };
    }
    const ok = j.rep.a === j.rep.b;
    return {
      cle: j.n + 'r',
      html: cadre('preferes', `${tete}
        <div class="choix-duo">${[0, 1].map(v => `<div class="option o${v} ${DEUX.some(x => j.rep[x] === v) ? 'choisie' : ''}">${esc(q[v])}<span class="qui-a-choisi">${DEUX.filter(x => j.rep[x] === v).map(x => imgAv(x)).join('')}</span></div>`).join('<span class="ou" aria-hidden="true">ou</span>')}</div>
        <div class="banniere ${ok ? 'accord' : 'desaccord'} pop"><span class="grand">${ok ? 'Vous êtes d’accord ! 💙' : 'Pas d’accord ! 😄'}</span>${ok ? 'Les grands esprits se rencontrent.' : 'Chacun défend son choix…'}</div>
        <button class="bouton large" ${A('suivant', { n: j.n })}>Question suivante →</button>
        <p class="stats">D’accord <b>${s.accords}</b> fois sur <b>${s.manches}</b></p>`)
    };
  };

  /* ---------- Qui de nous deux ? ---------- */
  VUES.qui = j => {
    const q = C.qui[j.q], s = etat.scores.qui;
    const tete = `<div class="carte question-carte"><p class="numero">Question ${j.n}</p><p class="intro">Qui de nous deux…</p><p class="question">${esc(q)}</p></div>`;
    if (j.phase === 'choix') {
      const mien = monChoix(j), libre = mien === null;
      return {
        cle: j.n + 'c' + mien + JSON.stringify(DEUX.map(x => j.rep[x] !== null)),
        html: cadre('qui', `${tete}
          <div class="choix-grille">${DEUX.map((x, k) => `<button class="option o${k} ${mien === x ? 'choisie' : ''}" ${A('repondre', { n: j.n, val: x })} ${libre ? '' : 'disabled'}>${imgAv(x, 'moyen')}<span>${nomDe(x)}</span></button>`).join('')}</div>
          ${!libre && role !== 'local' ? attenteDe(autre(moi())) : ''}
          ${role !== 'local' ? etatDuo(x => j.rep[x] !== null || (x === role && !libre)) : ''}`)
      };
    }
    const ok = j.rep.a === j.rep.b;
    const phrase = ok ? `Vous avez tous les deux choisi <b>${nomDe(j.rep.a)}</b> !`
      : j.rep.a === 'a' && j.rep.b === 'b' ? `Chacun s’est désigné soi-même 😆`
      : `${nomDe('a')} a choisi ${nomDe(j.rep.a)}, ${nomDe('b')} a choisi ${nomDe(j.rep.b)} 😄`;
    return {
      cle: j.n + 'r',
      html: cadre('qui', `${tete}
        <div class="choix-grille">${DEUX.map((x, k) => `<div class="option o${k} ${DEUX.some(y => j.rep[y] === x) ? 'choisie' : ''}">${imgAv(x, 'moyen')}<span>${nomDe(x)}</span><span class="qui-a-choisi">${DEUX.filter(y => j.rep[y] === x).map(y => imgAv(y)).join('')}</span></div>`).join('')}</div>
        <div class="banniere ${ok ? 'accord' : 'desaccord'} pop"><span class="grand">${ok ? 'D’accord ! 👉' : 'Débat ! 🗣️'}</span>${phrase}</div>
        <button class="bouton large" ${A('suivant', { n: j.n })}>Question suivante →</button>
        <p class="stats">${nomDe('a')} : <b>${s.a}</b> votes · ${nomDe('b')} : <b>${s.b}</b> votes · d’accord <b>${s.accords}</b>/${s.manches}</p>`)
    };
  };

  /* ---------- Je n’ai jamais… ---------- */
  VUES.jamais = j => {
    const q = C.jamais[j.q], s = etat.scores.jamais;
    const tete = `<div class="carte question-carte"><p class="numero">Phrase ${j.n}</p><p class="question">${esc(q)}</p></div>`;
    const opts = [['deja', '🙋', 'Moi, si !'], ['jamais', '😇', 'Jamais !']];
    if (j.phase === 'choix') {
      const mien = monChoix(j), libre = mien === null;
      return {
        cle: j.n + 'c' + mien + JSON.stringify(DEUX.map(x => j.rep[x] !== null)),
        html: cadre('jamais', `${tete}
          <div class="choix-grille">${opts.map(([v, e, t], k) => `<button class="option o${k} ${mien === v ? 'choisie' : ''}" ${A('repondre', { n: j.n, val: v })} ${libre ? '' : 'disabled'}><span class="grand-emoji" style="font-size:30px">${e}</span>${t}</button>`).join('')}</div>
          ${!libre && role !== 'local' ? attenteDe(autre(moi())) : ''}
          ${role !== 'local' ? etatDuo(x => j.rep[x] !== null || (x === role && !libre)) : ''}`)
      };
    }
    const deja = DEUX.filter(x => j.rep[x] === 'deja');
    const phrase = deja.length === 2 ? ['Tous les deux ! 🙌', 'Racontez-vous ça !'] : deja.length === 0 ? ['Aucun de vous deux 😇', 'Des anges, comme Angel.']
      : [`Seulement ${nomDe(deja[0])} ! 👀`, `${nomDe(deja[0])}, raconte…`];
    return {
      cle: j.n + 'r',
      html: cadre('jamais', `${tete}
        <div class="choix-grille">${opts.map(([v, e, t], k) => `<div class="option o${k} ${deja.length && v === 'deja' || DEUX.some(x => j.rep[x] === v) ? 'choisie' : ''}"><span style="font-size:26px">${e}</span>${t}<span class="qui-a-choisi">${DEUX.filter(x => j.rep[x] === v).map(x => imgAv(x)).join('')}</span></div>`).join('')}</div>
        <div class="banniere ${deja.length === 1 ? 'rose' : 'accord'} pop"><span class="grand">${phrase[0]}</span>${phrase[1]}</div>
        <button class="bouton large" ${A('suivant', { n: j.n })}>Phrase suivante →</button>
        <p class="stats">Déjà fait : ${nomDe('a')} <b>${s.a}</b> · ${nomDe('b')} <b>${s.b}</b> · tous les deux <b>${s.tousDeux}</b></p>`)
    };
  };

  /* ---------- Quiz Stitch ---------- */
  VUES.quiz = j => {
    const [q, reps, bonne, plus] = C.quiz[j.q];
    const pts = `${nomDe('a')} <b>${j.points.a}</b> · ${nomDe('b')} <b>${j.points.b}</b>`;
    const tete = `<div class="carte question-carte"><p class="numero">Question ${j.num} / ${J.quiz.taillePartie}</p><p class="question">${esc(q)}</p></div>`;
    if (j.phase === 'choix') {
      const mien = monChoix(j), libre = mien === null;
      return {
        cle: j.n + 'c' + mien + JSON.stringify(DEUX.map(x => j.rep[x] !== null)),
        html: cadre('quiz', `${tete}
          <div class="choix-grille">${reps.map((r, k) => `<button class="option o${k % 2} ${mien === k ? 'choisie' : ''}" ${A('repondre', { n: j.n, val: k })} ${libre ? '' : 'disabled'}>${esc(r)}</button>`).join('')}</div>
          ${!libre && role !== 'local' ? attenteDe(autre(moi())) : ''}
          ${role !== 'local' ? etatDuo(x => j.rep[x] !== null || (x === role && !libre)) : ''}
          <p class="stats">${pts}</p>`, 'Partie de 10 questions')
      };
    }
    const fin = j.phase === 'fin';
    const gagnant = j.points.a === j.points.b ? null : j.points.a > j.points.b ? 'a' : 'b';
    return {
      cle: j.n + j.phase,
      html: cadre('quiz', `${tete}
        <div class="choix-grille">${reps.map((r, k) => `<div class="option o${k % 2} ${k === bonne ? 'bonne' : DEUX.some(x => j.rep[x] === k) ? 'fausse' : ''}">${esc(r)}<span class="qui-a-choisi">${DEUX.filter(x => j.rep[x] === k).map(x => imgAv(x)).join('')}</span></div>`).join('')}</div>
        <div class="banniere bleu pop">${esc(plus)}</div>
        ${fin ? `<div class="banniere accord pop"><span class="grand">${gagnant ? nomDe(gagnant) + ' gagne ! 🏆' : 'Égalité parfaite ! 🤝'}</span>${j.points.a} à ${j.points.b}</div>` : ''}
        <button class="bouton large ${fin ? 'rose' : ''}" ${A('suivant', { n: j.n })}>${fin ? 'Nouvelle partie 🔄' : 'Question suivante →'}</button>
        <p class="stats">${pts}</p>`, 'Partie de 10 questions')
    };
  };

  /* ---------- Coco, Palme, Pince ---------- */
  const MAINS = { coco: ['🥥', 'Coco'], palme: ['🌴', 'Palme'], pince: ['🦀', 'Pince'] };
  VUES.chifoumi = j => {
    const pts = `<div class="carte question-carte"><p class="numero">Premier à 3</p>
      <p class="question" style="display:flex;align-items:center;justify-content:center;gap:12px">${imgAv('a', 'moyen')}<span style="font-family:Chewy;font-size:44px">${j.points.a} – ${j.points.b}</span>${imgAv('b', 'moyen')}</p></div>`;
    if (j.phase === 'choix') {
      const mien = monChoix(j), libre = mien === null;
      return {
        cle: j.n + 'c' + mien + JSON.stringify(DEUX.map(x => j.rep[x] !== null)),
        html: cadre('chifoumi', `${pts}
          <div class="choix-trois">${Object.entries(MAINS).map(([v, [e, t]], k) => `<button class="option o${k % 2} ${mien === v ? 'choisie' : ''}" ${A('repondre', { n: j.n, val: v })} ${libre ? '' : 'disabled'}><span class="grand-emoji">${e}</span>${t}</button>`).join('')}</div>
          ${!libre && role !== 'local' ? attenteDe(autre(moi())) : ''}
          ${role !== 'local' ? etatDuo(x => j.rep[x] !== null || (x === role && !libre)) : ''}`, 'La coco casse la pince, la palme couvre la coco, la pince coupe la palme')
      };
    }
    const txt = j.fin ? `${nomDe(j.fin)} remporte la partie ! 🏆` : j.gagne ? `${nomDe(j.gagne)} gagne la manche !` : 'Égalité, on rejoue !';
    return {
      cle: j.n + 'r',
      html: cadre('chifoumi', `${pts}
        <div class="choix-grille">${DEUX.map((x, k) => `<div class="option o${k} ${j.gagne === x ? 'choisie' : ''}" style="flex-direction:column">${imgAv(x)}<span class="grand-emoji pop" style="font-size:56px;animation-delay:${.15 + k * .1}s">${MAINS[j.rep[x]][0]}</span>${MAINS[j.rep[x]][1]}</div>`).join('')}</div>
        <div class="banniere ${j.gagne ? 'accord' : 'desaccord'} pop"><span class="grand">${txt}</span></div>
        <button class="bouton large ${j.fin ? 'rose' : ''}" ${A('suivant', { n: j.n })}>${j.fin ? 'Revanche 🔄' : 'Manche suivante →'}</button>`)
    };
  };

  /* ---------- Tu me connais ? ---------- */
  VUES.connais = j => {
    const q = C.connais[j.q], cible = j.cible, devin = autre(cible), s = etat.scores.connais || { a: 0, b: 0 };
    const tete = `<div class="carte question-carte"><p class="numero">Question ${j.n} · ${nomDe(cible)} répond, ${nomDe(devin)} devine</p><p class="question">« ${esc(q)} »</p></div>`;
    const pts = `<p class="stats">${nomDe('a')} <b>${s.a}</b> pts · ${nomDe('b')} <b>${s.b}</b> pts</p>`;
    if (j.phase === 'ecrire') {
      const m = moi(), envoye = j.rep[m] !== null || enAttente.some(a => a.type === 'ecrire' && a.n === j.n);
      const consigne = m === cible ? 'Écris ta vraie réponse 🤫' : `Devine ce que ${nomDe(cible)} va répondre 🔮`;
      return {
        cle: j.n + 'e' + m + envoye,
        html: cadre('connais', `${tete}
          ${envoye ? `<div class="banniere accord">C’est envoyé ! ✓</div>${role !== 'local' ? attenteDe(autre(m)) : ''}` : `
          <form class="carte pile" ${A('ecrire', { n: j.n })} data-champ="texte">
            <label class="etiquette-champ" for="texte">${consigne}</label>
            <input id="texte" class="champ" maxlength="90" autocomplete="off" placeholder="Ta réponse…" required>
            <button class="bouton large" type="submit">Valider</button>
          </form>`}
          <div data-maj="duo">${role !== 'local' ? etatDuo(x => j.rep[x] !== null) : ''}</div>${pts}`),
        monter: mm => { const c = $('#texte', mm); if (c) c.focus({ preventScroll: true }); },
        maj: mm => { const d = $('[data-maj="duo"]', mm); if (d && role !== 'local') d.innerHTML = etatDuo(x => j.rep[x] !== null); }
      };
    }
    const bulles = `<div class="deux-reponses">
      <div class="reponse-bulle ${cible}">${imgAv(cible)}<div class="bulle"><small>${nomDe(cible)} a répondu</small>${esc(j.rep[cible])}</div></div>
      <div class="reponse-bulle ${devin}">${imgAv(devin)}<div class="bulle"><small>${nomDe(devin)} a deviné</small>${esc(j.rep[devin])}</div></div></div>`;
    if (j.phase === 'revele') {
      return {
        cle: j.n + 'r',
        html: cadre('connais', `${tete}${bulles}
          ${peut(cible) ? `<p class="centre"><b>${role === 'local' ? nomDe(cible) + ', c’est' : 'C’est'} juste ?</b></p>
            <div class="rangee"><button class="bouton vert" ${A('juger', { n: j.n, verdict: 'oui' })}>✓ Oui ! +2</button>
            <button class="bouton jaune" ${A('juger', { n: j.n, verdict: 'presque' })}>≈ Presque +1</button>
            <button class="bouton rouge" ${A('juger', { n: j.n, verdict: 'non' })}>✗ Raté</button></div>` : attenteDe(cible)}${pts}`)
      };
    }
    const v = { oui: ['Bravo ! +2 💚', `${nomDe(devin)} te connaît par cœur, ${nomDe(cible)} !`], presque: ['Presque ! +1 ✨', 'Pas loin du tout…'], non: ['Raté ! 😅', 'Il reste des choses à découvrir…'] }[j.verdict];
    return {
      cle: j.n + 'j',
      html: cadre('connais', `${tete}${bulles}
        <div class="banniere ${j.verdict === 'non' ? 'desaccord' : 'accord'} pop"><span class="grand">${v[0]}</span>${v[1]}</div>
        <button class="bouton large" ${A('suivant', { n: j.n })}>Question suivante →</button>${pts}`)
    };
  };

  /* ---------- Même longueur d’onde ---------- */
  VUES.onde = j => {
    const [q, g, d] = C.onde[j.q], cible = j.cible, devin = autre(cible), s = etat.scores.onde || { points: 0, manches: 0 };
    const tete = `<div class="carte question-carte"><p class="numero">Manche ${j.n} · pour ${nomDe(cible)}</p><p class="question">${esc(q)}</p></div>`;
    if (j.phase === 'choix') {
      const m = moi(), envoye = j.rep[m] !== null || enAttente.some(a => a.type === 'repondre' && a.n === j.n);
      const consigne = m === cible ? 'Place le curseur pour toi' : `Où ${nomDe(cible)} a-t-il/elle mis le curseur ?`;
      return {
        cle: j.n + 'c' + m + envoye,
        html: cadre('onde', `${tete}
          ${envoye ? `<div class="banniere accord">C’est envoyé ! ✓</div>${role !== 'local' ? attenteDe(autre(m)) : ''}` : `
          <div class="carte pile">
            <p class="centre"><b>${consigne}</b></p>
            <div class="valeur-curseur" data-valeur>5</div>
            <div class="curseur-zone"><div class="poles"><span>0 · ${esc(g)}</span><span>${esc(d)} · 10</span></div>
              <input class="curseur" type="range" min="0" max="10" step="1" value="5" aria-label="Valeur de 0 à 10"></div>
            <button class="bouton large" data-u="envoyerCurseur" data-n="${j.n}">Valider</button>
          </div>`}
          <div data-maj="duo">${role !== 'local' ? etatDuo(x => j.rep[x] !== null) : ''}</div>`),
        monter: mm => { const c = $('.curseur', mm); if (c) c.addEventListener('input', () => { $('[data-valeur]', mm).textContent = c.value; }); },
        maj: mm => { const dd = $('[data-maj="duo"]', mm); if (dd && role !== 'local') dd.innerHTML = etatDuo(x => j.rep[x] !== null); }
      };
    }
    const ecart = Math.abs(j.rep.a - j.rep.b);
    const txt = j.gain === 3 ? ['Télépathie ! +3 🔮', 'Pile au même endroit !'] : j.gain === 2 ? ['Tout près ! +2 💙', 'Un seul cran d’écart.']
      : j.gain === 1 ? ['Pas loin ! +1', 'Deux crans d’écart.'] : ['Raté ! 😄', `${ecart} crans d’écart… à vous de vous expliquer.`];
    return {
      cle: j.n + 'r',
      html: cadre('onde', `${tete}
        <div class="carte"><div class="poles"><span>0 · ${esc(g)}</span><span>${esc(d)} · 10</span></div>
          <div class="regle-onde"><div class="piste"></div>
            ${[0, 2, 4, 6, 8, 10].map(v => `<span class="graduation" style="left:${v * 10}%">${v}</span>`).join('')}
            ${[cible, devin].map(x => `<span class="repere" style="left:${j.rep[x] * 10}%">${imgAv(x)}</span>`).join('')}
          </div>
          <p class="petit centre">${nomDe(cible)} : <b>${j.rep[cible]}</b> · ${nomDe(devin)} : <b>${j.rep[devin]}</b></p></div>
        <div class="banniere ${j.gain ? 'accord' : 'desaccord'} pop"><span class="grand">${txt[0]}</span>${txt[1]}</div>
        <button class="bouton large" ${A('suivant', { n: j.n })}>Manche suivante →</button>
        <p class="stats">Points d’équipe : <b>${s.points}</b> en ${s.manches} manches</p>`)
    };
  };

  /* ---------- À cœur ouvert ---------- */
  const NIV = [['leger', '🌸 Léger'], ['doux', '💗 Doux'], ['profond', '🌙 Profond']];
  VUES.coeur = j => ({
    cle: j.n + j.niveau,
    html: cadre('coeur', `
      <div class="rangee" role="group" aria-label="Niveau">${NIV.map(([v, t]) => `<button class="bouton petit-bouton ${v === j.niveau ? 'rose' : 'blanc'}" ${A('niveau', { niveau: v })} aria-pressed="${v === j.niveau}">${t}</button>`).join('')}</div>
      <div class="carte question-carte ${ui.anime ? 'pop' : ''}"><p class="numero">Carte ${j.n}</p><p class="question">${esc(C.coeur[j.niveau][j.q])}</p>
        <p class="petit" style="margin-top:14px">${nomDe(j.qui)} répond en premier 💬</p></div>
      <button class="bouton large" ${A('suivant', { n: j.n })}>Carte suivante →</button>
      <p class="stats"><b>${etat.scores.coeur ? etat.scores.coeur.cartes : 0}</b> cartes piochées ensemble</p>`)
  });

  /* ---------- Action ou vérité ---------- */
  VUES.av = j => {
    const s = etat.scores.av || { a: 0, b: 0 };
    const stats = `<p class="stats">Défis relevés : ${nomDe('a')} <b>${s.a}</b> · ${nomDe('b')} <b>${s.b}</b></p>`;
    if (j.phase === 'choix') {
      return {
        cle: j.n + 'c',
        html: cadre('av', `
          <div class="carte question-carte">${imgAv(j.tour, 'grand')}<p class="intro">${nomDe(j.tour)}, action ou vérité ?</p></div>
          ${peut(j.tour) ? `<div class="choix-grille">
            <button class="option o0" ${A('choisir', { n: j.n, choix: 'verite' })}><span class="grand-emoji" style="font-size:32px">🤔</span>Vérité</button>
            <button class="option o1" ${A('choisir', { n: j.n, choix: 'action' })}><span class="grand-emoji" style="font-size:32px">🔥</span>Action</button></div>` : attenteDe(j.tour)}
          ${stats}`)
      };
    }
    const texte = j.type === 'action' ? C.actions[j.q] : C.verites[j.q];
    return {
      cle: j.n + 'k' + j.q,
      html: cadre('av', `
        <div class="carte question-carte ${ui.anime ? 'pop' : ''}"><span class="etiquette ${j.type === 'action' ? 'rose' : ''}">${j.type === 'action' ? '🔥 Action' : '🤔 Vérité'} pour ${nomDe(j.tour)}</span>
          <p class="question" style="margin-top:12px">${esc(texte)}</p></div>
        <button class="bouton vert large" ${A('fait', { n: j.n })}>✓ C’est fait !</button>
        ${peut(j.tour) && j.jokers[j.tour] > 0 ? `<button class="bouton blanc large" ${A('joker', { n: j.n })}>🃏 Joker : une autre carte (${j.jokers[j.tour]})</button>` : ''}
        ${stats}`)
    };
  };

  /* ---------- Stitch dessine ---------- */
  const COULEURS = ['#1D2A4D', '#4C7BE0', '#FF8DC7', '#FF5A7A', '#FFCB47', '#2FB67B', '#8B5A2B', '#FFFFFF'];
  const EPAISSEURS = [8, 16, 32];
  const Toile = {
    n: null, traits: [], index: new Map(), canvas: null, ctx: null, lecture: true,
    couleur: '#1D2A4D', epaisseur: 16, courant: null, envoyeA: 0, minuteur: null,
    reset(n) { if (this.n !== n) { this.n = n; this.traits = []; this.index = new Map(); this.courant = null; } },
    attacher(canvas, lecture) {
      this.canvas = canvas; this.lecture = lecture;
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(3, window.devicePixelRatio || 1);
      canvas.width = canvas.height = Math.max(200, Math.round(r.width * dpr));
      this.ctx = canvas.getContext('2d');
      this.ctx.lineCap = 'round'; this.ctx.lineJoin = 'round';
      this.redessiner();
      canvas.onpointerdown = lecture ? null : e => this.debut(e);
      canvas.onpointermove = lecture ? null : e => this.bouge(e);
      canvas.onpointerup = canvas.onpointercancel = lecture ? null : () => this.fin();
    },
    point(e) {
      const r = this.canvas.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), y = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
      return [Math.round(x * 10000), Math.round(y * 10000)];
    },
    debut(e) {
      e.preventDefault();
      try { this.canvas.setPointerCapture(e.pointerId); } catch {}
      const t = { id: rid(), c: this.couleur, e: this.couleur === '#FFFFFF' ? 44 : this.epaisseur, p: [] };
      this.traits.push(t); this.index.set(t.id, t);
      this.courant = t; this.envoyeA = 0;
      this.ajouter(this.point(e));
    },
    bouge(e) {
      if (!this.courant) return;
      e.preventDefault();
      const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      for (const ev of (evs.length ? evs : [e])) this.ajouter(this.point(ev));
    },
    fin() { if (!this.courant) return; this.envoyer(); this.courant = null; },
    ajouter(pt) {
      const t = this.courant, p = t.p, k = p.length;
      if (k >= 2 && Math.abs(p[k - 2] - pt[0]) + Math.abs(p[k - 1] - pt[1]) < 18) return;
      p.push(pt[0], pt[1]);
      this.segment(t, p.length / 2 - 1);
      if (role !== 'local' && !this.minuteur) this.minuteur = setTimeout(() => this.envoyer(), 70);
    },
    segment(t, i) {
      const ctx = this.ctx; if (!ctx) return;
      const W = this.canvas.width, p = t.p;
      ctx.strokeStyle = t.c; ctx.lineWidth = Math.max(1, t.e / 1000 * W);
      ctx.beginPath();
      const x = p[2 * i] / 10000 * W, y = p[2 * i + 1] / 10000 * W;
      if (i === 0) { ctx.moveTo(x, y); ctx.lineTo(x + .01, y + .01); }
      else { ctx.moveTo(p[2 * i - 2] / 10000 * W, p[2 * i - 1] / 10000 * W); ctx.lineTo(x, y); }
      ctx.stroke();
    },
    redessiner() {
      const ctx = this.ctx; if (!ctx) return;
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      for (const t of this.traits) for (let i = 0; i < t.p.length / 2; i++) this.segment(t, i);
    },
    envoyer() {
      clearTimeout(this.minuteur); this.minuteur = null;
      const t = this.courant;
      if (!t || role === 'local') return;
      const p = t.p.slice(this.envoyeA);
      if (!p.length) return;
      envoyerMsg({ t: 'trait', n: this.n, id: t.id, c: t.c, e: t.e, i: this.envoyeA / 2, p });
      this.envoyeA = t.p.length;
    },
    effacer() {
      this.traits = []; this.index = new Map(); this.redessiner();
      envoyerMsg({ t: 'effacer', n: this.n });
    },
    recevoir(m) {
      if (!etat || !etat.jeu || etat.jeu.id !== 'dessin' || m.n !== etat.jeu.n) return;
      this.reset(m.n);
      if (m.t === 'redessin') { if (!this.lecture) envoyerMsg({ t: 'tout', n: this.n, traits: this.traits }); return; }
      if (m.t === 'effacer') { this.traits = []; this.index = new Map(); this.redessiner(); return; }
      if (m.t === 'tout') { this.traits = Array.isArray(m.traits) ? m.traits : []; this.index = new Map(this.traits.map(t => [t.id, t])); this.redessiner(); return; }
      if (m.t === 'trait') {
        let t = this.index.get(m.id);
        if (!t) { t = { id: m.id, c: m.c, e: m.e, p: [] }; this.index.set(m.id, t); this.traits.push(t); }
        const deja = t.p.length / 2;
        if (m.i > deja) { envoyerMsg({ t: 'redessin', n: this.n }); return; }
        const neufs = m.p.slice((deja - m.i) * 2);
        t.p.push(...neufs);
        for (let i = deja; i < t.p.length / 2; i++) this.segment(t, i);
      }
    }
  };
  VUES.dessin = j => {
    const s = etat.scores.dessin || { trouves: 0, manches: 0 };
    const stats = `<p class="stats">Mots trouvés ensemble : <b>${s.trouves}</b> sur ${s.manches}</p>`;
    const dessinateur = j.tour, devineur = autre(j.tour);
    const moiDessine = role === 'local' || role === dessinateur;
    Toile.reset(j.n);
    if (j.phase === 'pret') {
      return {
        cle: j.n + 'p',
        html: cadre('dessin', `
          <div class="carte question-carte">${imgAv(dessinateur, 'grand')}<p class="intro">${nomDe(dessinateur)} dessine,<br>${nomDe(devineur)} devine !</p>
            <p class="petit" style="margin-top:8px">${role === 'local' ? `${nomDe(devineur)}, ne regarde pas l’écran quand le mot apparaît 🙈` : 'Le dessin apparaît en direct sur l’autre téléphone.'}</p></div>
          ${peut(dessinateur) ? `<button class="bouton rose large" ${A('lancer', { n: j.n })}>🎨 Je suis prêt(e), montre-moi le mot</button>` : attenteDe(dessinateur)}
          ${stats}`)
      };
    }
    const mot = C.dessin[j.q];
    const toile = `<div class="toile-cadre ${moiDessine && j.phase === 'dessin' ? '' : 'lecture'}"><canvas aria-label="Zone de dessin"></canvas></div>`;
    const essais = () => `<div class="essais" data-maj="essais">${j.essais.map(e => `<span class="${e.bon ? 'bon' : ''}">${esc(e.t)}</span>`).join('')}</div>`;
    if (j.phase === 'dessin') {
      const fin = j.debut + j.duree * 1000;
      const chrono = `<div class="chrono" data-fin="${fin}" data-duree="${j.duree * 1000}"><i></i></div>`;
      if (moiDessine) {
        return {
          cle: j.n + 'd' + (role === 'local' ? 'l' : role),
          html: cadre('dessin', `
            <div class="mot-secret ${role === 'local' ? 'flou' : ''}" data-u="${role === 'local' ? 'montrerMot' : ''}"><small>${role === 'local' ? 'Appuie pour voir le mot (en cachette !)' : 'Dessine :'}</small><b>${esc(mot)}</b></div>
            <div style="display:flex;align-items:center;gap:10px"><div style="flex:1">${chrono}</div><span class="secondes" data-fin="${fin}" data-duree="${j.duree * 1000}" style="font-size:30px">${j.duree}</span></div>
            ${toile}
            <div class="outils">${COULEURS.map(c => `<button class="couleur" style="--c:${c}" data-u="couleur" data-v="${c}" aria-pressed="${c === Toile.couleur}" aria-label="${c === '#FFFFFF' ? 'Gomme' : 'Couleur'}">${c === '#FFFFFF' ? '🧽' : ''}</button>`).join('')}</div>
            <div class="outils">${EPAISSEURS.map(e => `<button class="epaisseur" data-u="epaisseur" data-v="${e}" aria-pressed="${e === Toile.epaisseur}" aria-label="Épaisseur ${e}"><i style="width:${e / 2 + 4}px;height:${e / 2 + 4}px"></i></button>`).join('')}
              <button class="bouton blanc petit-bouton" data-u="effacerToile">🗑️ Tout effacer</button></div>
            ${role === 'local' ? '' : essais()}
            <div class="rangee"><button class="bouton vert" ${A('trouve', { n: j.n })}>✓ Trouvé !</button><button class="bouton blanc" ${A('passer', { n: j.n })}>↷ Passer</button></div>`),
          monter: mm => Toile.attacher($('canvas', mm), false),
          maj: mm => { const e = $('[data-maj="essais"]', mm); if (e) e.outerHTML = essais(); }
        };
      }
      return {
        cle: j.n + 'v',
        html: cadre('dessin', `
          <div class="carte question-carte" style="padding:14px"><p class="intro" style="margin:0">Devine ce que ${nomDe(dessinateur)} dessine !</p></div>
          <div style="display:flex;align-items:center;gap:10px"><div style="flex:1">${chrono}</div><span class="secondes" data-fin="${fin}" data-duree="${j.duree * 1000}" style="font-size:30px">${j.duree}</span></div>
          ${toile}
          <form class="deviner" ${A('deviner', { n: j.n })} data-champ="texte" data-garder="1">
            <input class="champ" name="texte" maxlength="40" autocomplete="off" placeholder="Ta réponse…" aria-label="Ta réponse">
            <button class="bouton rose" type="submit">Proposer</button>
          </form>
          ${essais()}`),
        monter: mm => { Toile.attacher($('canvas', mm), true); if (!Toile.traits.length) envoyerMsg({ t: 'redessin', n: j.n }); },
        maj: mm => { const e = $('[data-maj="essais"]', mm); if (e) e.outerHTML = essais(); }
      };
    }
    return {
      cle: j.n + 'f',
      html: cadre('dessin', `
        <div class="banniere ${j.trouve ? 'accord' : 'desaccord'} pop"><span class="grand">${j.trouve ? 'Trouvé ! 🎉' : 'Pas trouvé… 😿'}</span>C’était « ${esc(mot)} »</div>
        ${toile}
        <button class="bouton large" ${A('suivant', { n: j.n })}>Au tour de ${nomDe(devineur)} de dessiner →</button>
        ${stats}`),
      monter: mm => Toile.attacher($('canvas', mm), true)
    };
  };

  /* ---------- Le mime ---------- */
  VUES.mime = j => {
    const s = etat.scores.mime || { a: 0, b: 0 };
    const mimeur = j.tour, devineur = autre(j.tour);
    const records = `<p class="stats">Records : ${nomDe('a')} <b>${s.a}</b> · ${nomDe('b')} <b>${s.b}</b></p>`;
    if (j.phase === 'pret') {
      return {
        cle: j.n + 'p',
        html: cadre('mime', `
          <div class="carte question-carte">${imgAv(mimeur, 'grand')}<p class="intro">${nomDe(mimeur)} mime,<br>${nomDe(devineur)} devine !</p>
            <p class="petit" style="margin-top:8px">🤫 ${nomDe(devineur)} ne doit pas voir l’écran de ${nomDe(mimeur)}.</p></div>
          ${peut(mimeur) ? `<button class="bouton vert large" ${A('lancer', { n: j.n })}>⏱️ C’est parti pour 60 secondes</button>` : attenteDe(mimeur)}
          ${records}`)
      };
    }
    if (j.phase === 'jeu') {
      const fin = j.debut + j.duree * 1000;
      const chrono = `<div class="chrono" data-fin="${fin}" data-duree="${j.duree * 1000}"><i></i></div><p class="secondes" data-fin="${fin}" data-duree="${j.duree * 1000}">${j.duree}</p>`;
      if (peut(mimeur)) {
        return {
          cle: j.n + 'j' + j.k,
          html: cadre('mime', `${chrono}
            <div class="mot-secret pop"><small>Mime :</small><b>${esc(C.mime[j.q])}</b></div>
            <p class="compteur-geant">${j.trouves}</p><p class="centre petit">trouvé${j.trouves > 1 ? 's' : ''}</p>
            <div class="rangee"><button class="bouton vert" ${A('trouve', { n: j.n, k: j.k })}>✓ Trouvé !</button><button class="bouton blanc" ${A('passer', { n: j.n, k: j.k })}>↷ Passer</button></div>`)
        };
      }
      return {
        cle: j.n + 'j' + j.k,
        html: cadre('mime', `${chrono}
          <div class="carte question-carte">${imgAv(mimeur, 'grand')}<p class="intro">${nomDe(mimeur)} mime… devine à voix haute !</p></div>
          <p class="compteur-geant">${j.trouves}</p><p class="centre petit">trouvé${j.trouves > 1 ? 's' : ''}</p>`)
      };
    }
    return {
      cle: j.n + 'f',
      html: cadre('mime', `
        <div class="banniere accord pop"><span class="grand">${j.trouves} mot${j.trouves > 1 ? 's' : ''} trouvé${j.trouves > 1 ? 's' : ''} ! 🎉</span>${nomDe(mimeur)} a mimé, ${nomDe(devineur)} a deviné${j.passes ? ` (${j.passes} passé${j.passes > 1 ? 's' : ''})` : ''}.</div>
        <button class="bouton large" ${A('suivant', { n: j.n })}>Au tour de ${nomDe(devineur)} de mimer →</button>
        ${records}`)
    };
  };

  /* ---------- 5 secondes chrono ---------- */
  VUES.cinq = j => {
    const s = etat.scores.cinq || { a: 0, b: 0 };
    const juge = autre(j.tour);
    const stats = `<p class="stats">Réussis : ${nomDe('a')} <b>${s.a}</b> · ${nomDe('b')} <b>${s.b}</b></p>`;
    const boutonsJuge = `<div class="rangee"><button class="bouton vert" ${A('juger', { n: j.n, reussi: true })}>✓ Réussi</button><button class="bouton rouge" ${A('juger', { n: j.n, reussi: false })}>✗ Raté</button></div>`;
    if (j.phase === 'pret') {
      return {
        cle: j.n + 'p',
        html: cadre('cinq', `
          <div class="carte question-carte">${imgAv(j.tour, 'grand')}<p class="intro">À ${nomDe(j.tour)} !</p><p class="petit">Une consigne va s’afficher : trois réponses en 5 secondes.</p></div>
          ${peut(j.tour) ? `<button class="bouton jaune large" ${A('lancer', { n: j.n })}>⚡ Go !</button>` : attenteDe(j.tour)}
          ${stats}`)
      };
    }
    const consigne = `<div class="carte question-carte pop"><p class="numero">${nomDe(j.tour)}, cite…</p><p class="question">${esc(C.cinq[j.q])}</p></div>`;
    if (j.phase === 'chrono' || j.phase === 'juger') {
      const fin = j.debut + 5000;
      return {
        cle: j.n + j.phase,
        html: cadre('cinq', `${consigne}
          ${j.phase === 'chrono' ? `<div class="rond-chrono"><svg viewBox="0 0 150 150"><circle class="fond" cx="75" cy="75" r="62"/><circle class="avance" cx="75" cy="75" r="62" data-fin="${fin}" data-duree="5000" stroke-dasharray="389.6" stroke-dashoffset="0"/></svg><span class="secondes" data-fin="${fin}" data-duree="5000">5</span></div>`
            : `<div class="banniere desaccord pop"><span class="grand">Temps écoulé ! ⏰</span></div>`}
          ${peut(juge) ? `<p class="centre"><b>${role === 'local' ? nomDe(juge) + ', alors ?' : 'Alors, réussi ?'}</b></p>${boutonsJuge}` : j.phase === 'juger' ? attenteDe(juge) : ''}`)
      };
    }
    return {
      cle: j.n + 'f',
      html: cadre('cinq', `${consigne}
        <div class="banniere ${j.reussi ? 'accord' : 'desaccord'} pop"><span class="grand">${j.reussi ? 'Réussi ! +1 ⚡' : 'Raté ! 😅'}</span></div>
        <button class="bouton large" ${A('suivant', { n: j.n })}>Au tour de ${nomDe(juge)} →</button>
        ${stats}`)
    };
  };

  /* ---------- Memory ---------- */
  VUES.memory = j => {
    const s = etat.scores.memory || { a: 0, b: 0 };
    const tete = () => {
      if (j.phase === 'fin') {
        const g = j.points.a === j.points.b ? null : j.points.a > j.points.b ? 'a' : 'b';
        return `<div class="banniere accord pop"><span class="grand">${g ? nomDe(g) + ' gagne ! 🏆' : 'Égalité ! 🤝'}</span>${j.points.a} paires à ${j.points.b}</div>`;
      }
      const moiTour = role !== 'local' && role === j.tour;
      return `<div class="banniere ${j.tour === 'a' ? 'bleu' : 'rose'}">${imgAv(j.tour, 'mini')} ${moiTour ? 'À toi de jouer !' : 'Au tour de ' + nomDe(j.tour)}</div>`;
    };
    const points = () => `<p class="stats">${nomDe('a')} <b>${j.points.a}</b> paire${j.points.a > 1 ? 's' : ''} · ${nomDe('b')} <b>${j.points.b}</b> · parties gagnées ${s.a} – ${s.b}</p>`;
    const cartes = () => j.cartes.map((c, i) => {
      const vis = j.a_qui[i] || j.retournees.includes(i);
      const libre = !vis && j.phase === 'jeu' && peut(j.tour) && j.retournees.length < 2;
      return `<button class="memo ${vis ? 'visible' : ''} ${j.a_qui[i] || ''}" ${A('retourner', { n: j.n, i })} ${libre ? '' : 'disabled'} aria-label="${vis ? 'Carte ' + c : 'Carte cachée'}"><span class="dos"></span><span class="face"><img src="img/${c}.webp" alt="" draggable="false"></span></button>`;
    }).join('');
    return {
      cle: j.n + 'm',
      html: cadre('memory', `<div data-maj="tete">${tete()}</div>
        <div class="grille-memory">${cartes()}</div>
        <div data-maj="points">${points()}</div>
        <div data-maj="rejouer">${j.phase === 'fin' ? `<button class="bouton rose large" ${A('rejouer', { n: j.n })}>Nouvelle partie 🔄</button>` : ''}</div>`),
      maj: mm => {
        $('[data-maj="tete"]', mm).innerHTML = tete();
        $('[data-maj="points"]', mm).innerHTML = points();
        $('[data-maj="rejouer"]', mm).innerHTML = j.phase === 'fin' ? `<button class="bouton rose large" ${A('rejouer', { n: j.n })}>Nouvelle partie 🔄</button>` : '';
        $$('.memo', mm).forEach((b, i) => {
          const vis = !!(j.a_qui[i] || j.retournees.includes(i));
          const avant = b.classList.contains('visible');
          b.classList.toggle('visible', vis);
          b.classList.toggle('a', j.a_qui[i] === 'a');
          b.classList.toggle('b', j.a_qui[i] === 'b');
          if (j.a_qui[i] && avant && !b.classList.contains('trouvee')) b.classList.add('trouvee');
          b.disabled = !(!vis && j.phase === 'jeu' && peut(j.tour) && j.retournees.length < 2);
        });
      }
    };
  };

  /* ---------- Morpion ---------- */
  VUES.morpion = j => {
    const s = etat.scores.morpion || { a: 0, b: 0, nuls: 0 };
    const tete = () => j.gagnant ? `<div class="banniere ${j.gagnant === 'nul' ? 'desaccord' : 'accord'} pop"><span class="grand">${j.gagnant === 'nul' ? 'Match nul ! 🤝' : nomDe(j.gagnant) + ' gagne ! 🏆'}</span></div>`
      : `<div class="banniere ${j.tour === 'a' ? 'bleu' : 'rose'}">${imgAv(j.tour, 'mini')} ${role !== 'local' && role === j.tour ? 'À toi de jouer !' : 'Au tour de ' + nomDe(j.tour)}</div>`;
    const cases = () => j.cases.map((c, i) => `<button class="case ${j.ligne && j.ligne.includes(i) ? 'gagnante' : ''}" ${A('jouer', { n: j.n, i })} ${!c && !j.gagnant && peut(j.tour) ? '' : 'disabled'} aria-label="Case ${i + 1}${c ? ' : ' + esc(joueur(c).nom) : ''}">${c ? `<img src="img/${esc(joueur(c).avatar)}.webp" alt="">` : ''}</button>`).join('');
    const bas = () => `${j.gagnant ? `<button class="bouton rose large" ${A('rejouer', { n: j.n })}>Revanche 🔄</button>` : ''}
      <p class="stats">${nomDe('a')} <b>${s.a}</b> · ${nomDe('b')} <b>${s.b}</b> · nuls <b>${s.nuls}</b></p>`;
    return {
      cle: j.n + 'm',
      html: cadre('morpion', `<div data-maj="tete">${tete()}</div><div class="grille-morpion">${cases()}</div><div data-maj="bas" class="pile">${bas()}</div>`),
      maj: mm => {
        $('[data-maj="tete"]', mm).innerHTML = tete();
        $('[data-maj="bas"]', mm).innerHTML = bas();
        const g = $('.grille-morpion', mm);
        $$('.case', g).forEach((b, i) => {
          const c = j.cases[i];
          if (c && !b.querySelector('img')) b.innerHTML = `<img src="img/${esc(joueur(c).avatar)}.webp" alt="">`;
          b.disabled = !(!c && !j.gagnant && peut(j.tour));
          b.classList.toggle('gagnante', !!(j.ligne && j.ligne.includes(i)));
        });
      }
    };
  };

  /* ---------- Duel de réflexes ---------- */
  VUES.reflexes = j => {
    const s = etat.scores.reflexes || { a: 0, b: 0, record: { a: null, b: null } };
    const score = `<div class="carte question-carte" style="padding:14px"><p class="numero">Premier à 3</p>
      <p class="question" style="display:flex;align-items:center;justify-content:center;gap:12px">${imgAv('a', 'moyen')}<span style="font-family:Chewy;font-size:40px">${j.points.a} – ${j.points.b}</span>${imgAv('b', 'moyen')}</p></div>`;
    const records = `<p class="stats">Records : ${nomDe('a')} <b>${s.record.a ?? '—'}</b> ms · ${nomDe('b')} <b>${s.record.b ?? '—'}</b> ms</p>`;
    if (j.phase === 'pret') {
      const pret = role === 'local' ? false : j.prets[role] || enAttente.some(a => a.type === 'pret' && a.n === j.n);
      return {
        cle: j.n + 'p' + pret + JSON.stringify(j.prets),
        html: cadre('reflexes', `${score}
          <div class="carte centre pile"><p><b>Pose ton doigt près de l’écran.</b></p><p class="petit">Quand Stitch surgit, touche l’écran le plus vite possible. Avant, c’est perdu !</p></div>
          ${role === 'local' ? `<button class="bouton vert large" data-u="reflexesLocal" data-n="${j.n}">⚡ On y va !</button>`
            : pret ? attenteDe(autre(role)) : `<button class="bouton vert large" ${A('pret', { n: j.n })}>⚡ Je suis prêt(e) !</button>`}
          ${role !== 'local' ? etatDuo(x => j.prets[x], 'prêt(e) ✓', 'pas encore') : ''}${records}`)
      };
    }
    if (j.phase === 'attente') {
      const m = moi();
      const envoye = j.temps[m] !== null || enAttente.some(a => a.type === 'temps' && a.n === j.n);
      if (envoye && role !== 'local') {
        return { cle: j.n + 'a-envoye', html: cadre('reflexes', `${score}<div class="zone-reflexe"><div><p class="consigne">C’est noté !</p><p>${attenteDe(autre(m))}</p></div></div>`) };
      }
      return {
        cle: j.n + 'a' + m + (role === 'local' ? ui.main : ''),
        html: cadre('reflexes', `${score}<div class="zone-reflexe" data-zone><div data-contenu><p class="consigne">Attends Stitch… 👀</p><p class="petit" style="color:#cfe0ff">${role === 'local' ? nomDe(m) + ', touche dès qu’il apparaît' : 'Ne touche pas encore !'}</p></div></div>`),
        monter: mm => lancerReflexe(mm, j, m)
      };
    }
    const txt = j.fin ? `${nomDe(j.fin)} est le plus rapide ! 🏆` : j.gagne ? `${nomDe(j.gagne)} gagne la manche !` : 'Égalité !';
    const t = x => (j.temps[x] === 'tot' ? 'Trop tôt 😅' : j.temps[x] + ' ms');
    return {
      cle: j.n + 'r',
      html: cadre('reflexes', `${score}
        <div class="choix-grille">${DEUX.map((x, k) => `<div class="option o${k} ${j.gagne === x ? 'choisie' : ''}" style="flex-direction:column">${imgAv(x)}<span class="temps-geant" style="font-size:32px">${t(x)}</span></div>`).join('')}</div>
        <div class="banniere accord pop"><span class="grand">${txt}</span></div>
        <button class="bouton large ${j.fin ? 'rose' : ''}" ${A('suivant', { n: j.n })}>${j.fin ? 'Revanche 🔄' : 'Manche suivante →'}</button>${records}`)
    };
  };
  function lancerReflexe(mm, j, m) {
    const zone = $('[data-zone]', mm), contenu = $('[data-contenu]', mm);
    if (!zone || (role === 'local' && ui.main !== m)) return;
    clearTimeout(ui.reflexeMinuteur);
    let apparu = false, t0 = 0, fini = false;
    //  en ligne : même délai pour les deux, calé sur l'horloge de l'hôte ; seul : un délai au hasard
    const attendre = role === 'local' ? 1500 + Math.random() * 3000 : Math.max(250, j.depart + j.delai - maintenant());
    ui.reflexeMinuteur = setTimeout(() => {
      if (fini) return;
      apparu = true;
      zone.classList.add('go');
      contenu.innerHTML = '<img src="img/cosmos.webp" alt="Stitch !"><p class="consigne">TOUCHE !</p>';
      requestAnimationFrame(() => { t0 = performance.now(); });
    }, attendre);
    zone.addEventListener('pointerdown', e => {
      if (fini) return;
      fini = true;
      clearTimeout(ui.reflexeMinuteur);
      if (!apparu || !t0) {
        zone.classList.add('tot');
        contenu.innerHTML = '<p class="consigne">Trop tôt ! 😅</p>';
        setTimeout(() => agir('temps', { n: j.n, tot: true }, m), 500);
      } else {
        const ms = Math.round((e.timeStamp || performance.now()) - t0);
        contenu.innerHTML = `<p class="temps-geant">${ms} ms</p>`;
        setTimeout(() => agir('temps', { n: j.n, ms }, m), 500);
      }
    }, { once: false });
  }

  /* ---------- La roue des câlins ---------- */
  const TEINTES_ROUE = ['#4C7BE0', '#FF8DC7', '#FFCB47', '#2FB67B', '#3FC1D9', '#FF5A7A'];
  function dessinRoue(gages) {
    const n = gages.length, pas = 360 / n, r = 96;
    const pt = a => [Math.sin(a * Math.PI / 180) * r, -Math.cos(a * Math.PI / 180) * r];
    return `<svg class="roue" viewBox="-100 -100 200 200" aria-hidden="true">
      <circle r="99" fill="#fff"/>
      ${gages.map((g, i) => {
        const [x1, y1] = pt(i * pas), [x2, y2] = pt((i + 1) * pas), mid = i * pas + pas / 2;
        const [e, court] = C.gages[g];
        return `<path d="M0 0 L${x1.toFixed(2)} ${y1.toFixed(2)} A${r} ${r} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z" fill="${TEINTES_ROUE[i % TEINTES_ROUE.length]}" stroke="#fff" stroke-width="1.5"/>
          <g transform="rotate(${mid - 90})"><text x="80" y="0" font-size="13" text-anchor="middle" dominant-baseline="central" transform="rotate(90 80 0)">${e}</text>
          <text x="52" y="0" font-size="7.2" font-weight="700" fill="${i % TEINTES_ROUE.length === 2 ? '#4A3300' : '#fff'}" text-anchor="middle" dominant-baseline="central" font-family="Quicksand, sans-serif">${esc(court)}</text></g>`;
      }).join('')}
    </svg>`;
  }
  VUES.roue = j => {
    const s = etat.scores.roue || { gages: 0 };
    const pas = 360 / j.gages.length;
    //  l'angle final : le milieu de la part tirée sous la flèche, après 5 tours
    const cible = j.seg === null ? ui.rotation : (() => {
      const cle = j.n + ':' + j.seg;
      if (ui.rouePour !== cle) {
        const vise = ((-(j.seg * pas + pas / 2)) % 360 + 360) % 360;
        const reste = ((vise - ui.rotation) % 360 + 360) % 360;
        ui.rouePourDepart = ui.rotation;
        ui.rotation = ui.rotation + 360 * 5 + reste;
        ui.rouePour = cle;
      }
      return ui.rotation;
    })();
    const roue = `<div class="roue-cadre"><span class="fleche"></span>${dessinRoue(j.gages)}<span class="moyeu"></span></div>`;
    const bas = j.phase === 'pret'
      ? (peut(j.tour) ? `<button class="bouton rose large" ${A('tourner', { n: j.n })}>🎡 ${role === 'local' ? nomDe(j.tour) + ' fait tourner !' : 'Faire tourner !'}</button>` : attenteDe(j.tour))
      : j.phase === 'tourne' ? `<p class="attente">Ça tourne<span class="points-attente"></span></p>`
      : `<div class="carte gage-carte pop"><div class="grand-emoji">${C.gages[j.gages[j.seg]][0]}</div><p class="texte">${esc(C.gages[j.gages[j.seg]][2])}</p><p class="petit" style="margin-top:6px">Pour ${nomDe(j.tour)}</p></div>
         <button class="bouton vert large" ${A('suivant', { n: j.n })}>✓ C’est fait ! Au tour de ${nomDe(autre(j.tour))}</button>`;
    return {
      cle: j.n + j.phase + j.gages.join(','),
      html: cadre('roue', `<div class="carte question-carte" style="padding:14px"><p class="intro" style="margin:0">${nomDe(j.tour)} fait tourner la roue</p></div>
        ${roue}${bas}
        ${j.phase !== 'tourne' ? `<p class="centre"><button class="lien" ${A('garnir', {})}>🔄 Changer les gages</button></p>` : ''}
        <p class="stats"><b>${s.gages}</b> gages faits ensemble</p>`),
      monter: mm => {
        const svg = $('svg.roue', mm);
        if (j.phase !== 'tourne') { svg.style.transition = 'none'; svg.style.transform = `rotate(${cible}deg)`; return; }
        const debut = j.depart - (role === 'b' ? decalage : 0);
        const ecoule = Date.now() - debut;
        if (ecoule > J.roue.duree) { svg.style.transition = 'none'; svg.style.transform = `rotate(${cible}deg)`; return; }
        svg.style.transition = 'none';
        svg.style.transform = `rotate(${ui.rouePourDepart || 0}deg)`;
        setTimeout(() => {
          svg.getBoundingClientRect();
          svg.style.transition = '';
          svg.style.transform = `rotate(${cible}deg)`;
        }, Math.max(30, -ecoule));
      }
    };
  };

  /* ---------- Idée de sortie ---------- */
  VUES.sortie = j => {
    const S = C.sortie, s = etat.scores.sortie || { gardees: [] };
    const t = j.tirage;
    const des = (x = t) => [['📍', 'Où ?', x ? S.ou[x.ou] : '…', '#EAF2FF'], ['🎈', 'Quoi ?', x ? S.quoi[x.quoi] : '…', '#FFEAF4'], ['✨', 'Le petit plus', x ? S.plus[x.plus] : '…', '#FFF6D6']]
      .map(([e, l, v, c]) => `<div class="de" style="--c:${c}"><span class="icone">${e}</span><div><small>${l}</small><b>${esc(v)}</b></div></div>`).join('');
    const phrase = t ? `${S.ou[t.ou]}, ${S.quoi[t.quoi]}, ${S.plus[t.plus]}.` : '';
    const dejaGardee = t && s.gardees.some(g => g.cle === [t.ou, t.quoi, t.plus].join('-'));
    return {
      cle: j.n + ':' + s.gardees.length,
      html: cadre('sortie', `
        <div class="des" data-des>${des()}</div>
        <button class="bouton rose large" ${A('lancer', {})}>🎲 ${t ? 'Relancer les dés' : 'Lancer les dés'}</button>
        ${t ? `<div class="banniere bleu">${esc(phrase)}</div>
          <button class="bouton ${dejaGardee ? 'blanc' : 'vert'} large" ${A('garder', { n: j.n })} ${dejaGardee ? 'disabled' : ''}>${dejaGardee ? '✓ Idée gardée' : '💾 On garde cette idée !'}</button>` : ''}
        ${s.gardees.length ? `<div class="carte pile"><p class="titre" style="font-size:22px">Nos idées gardées 💌</p><div class="gardees">
          ${s.gardees.map((g, i) => `<div class="gardee"><span>${esc(S.ou[g.ou])}, ${esc(S.quoi[g.quoi])}, ${esc(S.plus[g.plus])}</span><button ${A('oublier', { i })} aria-label="Retirer cette idée">×</button></div>`).join('')}
        </div></div>` : ''}`),
      monter: mm => {
        if (!t || Date.now() - (j.depart - (role === 'b' ? decalage : 0)) > 1300) return;
        //  les dés roulent un instant avant de s'arrêter
        const zone = $('[data-des]', mm);
        const fin = Date.now() + 1100;
        const tourne = () => {
          if (!zone.isConnected) return;
          if (Date.now() > fin) { zone.innerHTML = des(); return; }
          const h = () => ({ ou: Math.floor(Math.random() * S.ou.length), quoi: Math.floor(Math.random() * S.quoi.length), plus: Math.floor(Math.random() * S.plus.length) });
          zone.innerHTML = des(h());
          $$('.de', zone).forEach(d => d.classList.add('roule'));
          setTimeout(tourne, 90);
        };
        tourne();
      }
    };
  };

  /* ---------- scores et profil ---------- */
  function vueScores() {
    const s = etat.scores, a = nomDe('a'), b = nomDe('b');
    const lignes = [];
    const L = (id, texte) => lignes.push(`<div class="score-ligne"><img src="img/${INFOS[id].img}.webp" alt=""><div><b>${INFOS[id].titre}</b><span>${texte}</span></div></div>`);
    if (s.preferes) L('preferes', `D’accord ${s.preferes.accords} fois sur ${s.preferes.manches} (${Math.round(100 * s.preferes.accords / Math.max(1, s.preferes.manches))} %)`);
    if (s.qui) L('qui', `${a} : ${s.qui.a} votes · ${b} : ${s.qui.b} votes`);
    if (s.jamais) L('jamais', `Déjà fait : ${a} ${s.jamais.a} · ${b} ${s.jamais.b} · tous les deux ${s.jamais.tousDeux}`);
    if (s.connais) L('connais', `${a} ${s.connais.a} pts · ${b} ${s.connais.b} pts`);
    if (s.onde) L('onde', `${s.onde.points} points d’équipe en ${s.onde.manches} manches · ${s.onde.parfaits} télépathie${s.onde.parfaits > 1 ? 's' : ''}`);
    if (s.coeur) L('coeur', `${s.coeur.cartes} cartes piochées`);
    if (s.av) L('av', `Défis relevés : ${a} ${s.av.a} · ${b} ${s.av.b}`);
    if (s.dessin) L('dessin', `${s.dessin.trouves} mots trouvés sur ${s.dessin.manches}`);
    if (s.mime) L('mime', `Records : ${a} ${s.mime.a} · ${b} ${s.mime.b} · ${s.mime.total} mots en tout`);
    if (s.cinq) L('cinq', `Réussis : ${a} ${s.cinq.a} · ${b} ${s.cinq.b}`);
    if (s.quiz) L('quiz', `Parties gagnées : ${a} ${s.quiz.a} · ${b} ${s.quiz.b} (sur ${s.quiz.parties})`);
    if (s.roue) L('roue', `${s.roue.gages} gages faits`);
    if (s.sortie) L('sortie', `${s.sortie.gardees.length} idée${s.sortie.gardees.length > 1 ? 's' : ''} gardée${s.sortie.gardees.length > 1 ? 's' : ''}`);
    if (s.memory) L('memory', `Parties gagnées : ${a} ${s.memory.a} · ${b} ${s.memory.b} · nuls ${s.memory.nuls}`);
    if (s.morpion) L('morpion', `${a} ${s.morpion.a} · ${b} ${s.morpion.b} · nuls ${s.morpion.nuls}`);
    if (s.chifoumi) L('chifoumi', `Parties gagnées : ${a} ${s.chifoumi.a} · ${b} ${s.chifoumi.b}`);
    if (s.reflexes) L('reflexes', `Victoires : ${a} ${s.reflexes.a} · ${b} ${s.reflexes.b} · records ${s.reflexes.record.a ?? '—'} / ${s.reflexes.record.b ?? '—'} ms`);
    return {
      cle: 'scores' + etat.v,
      html: `<section class="pile ${ui.anime ? 'entree' : ''}">
        <div class="carte transparente centre pile"><img src="img/guitare.webp" alt="" style="width:110px;margin:0 auto"><p class="titre">Nos scores</p>
          <p class="petit">Tout ce que vous avez joué ensemble sur cette partie.</p></div>
        ${lignes.length ? `<div class="scores">${lignes.join('')}</div>` : '<div class="carte centre"><p>Pas encore de score : allez jouer ! 🌴</p></div>'}
        <button class="bouton large" data-u="retour">← Retour</button>
      </section>`
    };
  }
  function vueProfil() {
    const qui = role === 'local' ? DEUX : [role];
    return {
      cle: 'profil',
      html: `<section class="pile ${ui.anime ? 'entree' : ''}">
        <div class="carte transparente centre"><p class="titre">${role === 'local' ? 'Vos prénoms et personnages' : 'Ton prénom et ton personnage'}</p></div>
        ${qui.map(x => `<div class="carte" data-profil="${x}">${blocProfil('prenom-' + x, joueur(x).nom, joueur(x).avatar, 'modif-' + x, role === 'local' ? 'Prénom' : 'Ton prénom')}</div>`).join('')}
        <button class="bouton rose large" data-u="enregistrerProfil">Enregistrer</button>
        <button class="bouton blanc large" data-u="retour">Annuler</button>
      </section>`
    };
  }

  /* ---------- ce que font les boutons ---------- */
  const UI = {
    avatar(b) {
      const cle = b.dataset.cle, v = b.dataset.v;
      if (cle === 'profil') { profil.avatar = v; mem.set('profil', profil); }
      else if (cle === 'avatar2') ui.avatar2 = v;
      $$(`[data-u="avatar"][data-cle="${cle}"]`).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      Son.jouer('pop');
    },
    creer: () => creerPartie(),
    versRejoindre() { if (!profilValideDouce()) return; ui.ecran = 'rejoindre'; rendre(); },
    versLocal() { if (!profilValide()) return; ui.ecran = 'local'; rendre(); },
    accueil() { ui.ecran = 'accueil'; rendre(); },
    rejoindre() { const k = $('#code'); rejoindre(k ? k.value : ui.code); },
    annulerJoindre() { if (salon) { salon.fermer(); salon = null; } role = null; etat = null; enAttente = []; ui.ecran = 'rejoindre'; rendre(); },
    demarrerLocal: () => demarrerLocal(),
    reprendre: () => reprendre(mem.get('partie')),
    partager: () => partager(),
    quitter() { if (confirm('Quitter cette partie ?')) quitter(); },
    quitterJeu() { agir('quitterJeu'); },
    ile() { if (etat && etat.jeu) agir('quitterJeu'); ui.ecran = 'ile'; rendre(); },
    scores() { ui.ecran = 'scores'; rendre(); },
    retour() { ui.ecran = 'ile'; rendre(); },
    prendMain(b) { ui.main = b.dataset.j; rendre(); },
    menu() { ouvrirMenu(); },
    envoyerCurseur(b) {
      const c = $('.curseur');
      if (!c) return;
      agir('repondre', { n: +b.dataset.n, val: +c.value });
      if (role === 'b') rendre();
    },
    couleur(b) { Toile.couleur = b.dataset.v; $$('[data-u="couleur"]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); },
    epaisseur(b) { Toile.epaisseur = +b.dataset.v; if (Toile.couleur === '#FFFFFF') Toile.couleur = '#1D2A4D'; $$('[data-u="epaisseur"]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); },
    effacerToile() { Toile.effacer(); },
    montrerMot(b) { b.classList.toggle('flou'); },
    reflexesLocal(b) { const n = +b.dataset.n; agir('pret', { n }, 'a'); agir('pret', { n }, 'b'); },
    enregistrerProfil() {
      for (const x of (role === 'local' ? DEUX : [role])) {
        const champ = $('#prenom-' + x), nom = champ ? champ.value.trim().slice(0, 20) : '';
        const choisi = $(`[data-u="avatar"][data-cle="modif-${x}"][aria-pressed="true"]`);
        if (!nom) { toast('Il manque un prénom 🙂'); return; }
        agir('profil', { nom, avatar: choisi ? choisi.dataset.v : joueur(x).avatar }, x);
        if (x === 'a' || role === 'b') { profil = { nom, avatar: choisi ? choisi.dataset.v : profil.avatar }; mem.set('profil', profil); }
      }
      ui.ecran = 'ile'; rendre();
    },
    sons() { Son.actif = !Son.actif; mem.set('sons', Son.actif); fermerMenu(); toast(Son.actif ? 'Sons activés 🔊' : 'Sons coupés 🔇'); },
    profil() { fermerMenu(); ui.ecran = 'profil'; rendre(); },
    fermerMenu: () => fermerMenu()
  };
  //  sur la page « Rejoindre », le prénom se remplit sur place
  function profilValideDouce() { const c = $('#prenom'); if (c) { profil.nom = c.value.trim().slice(0, 20); mem.set('profil', profil); } return true; }
  // les avatars de la page profil (dans une partie) se choisissent sur place
  const ancienAvatar = UI.avatar;
  UI.avatar = b => {
    if (b.dataset.cle && b.dataset.cle.startsWith('modif-')) {
      $$(`[data-u="avatar"][data-cle="${b.dataset.cle}"]`).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      Son.jouer('pop');
      return;
    }
    ancienAvatar(b);
  };

  function ouvrirMenu() {
    fermerMenu();
    const fond = document.createElement('div');
    fond.className = 'menu-fond'; fond.dataset.u = 'fermerMenu';
    const menu = document.createElement('div');
    menu.className = 'menu'; menu.setAttribute('role', 'dialog'); menu.setAttribute('aria-label', 'Menu');
    menu.innerHTML = `<div class="poignee"></div>
      <div class="menu-liste">
        ${etat && role !== 'local' && etat.code ? `<div class="carte centre" style="padding:14px"><p class="petit">Code de la partie</p><p class="titre">${esc(etat.code)}</p></div>
          <button class="bouton rose" data-u="partager">💌 Envoyer le code</button>` : ''}
        <button class="bouton blanc" data-u="profil">🧑 Changer ${role === 'local' ? 'les prénoms' : 'mon prénom'} / personnage</button>
        <button class="bouton blanc" data-u="scores">🏆 Nos scores</button>
        <button class="bouton blanc" data-u="sons">${Son.actif ? '🔇 Couper les sons' : '🔊 Activer les sons'}</button>
        <button class="bouton rouge" data-u="quitter">🚪 Quitter la partie</button>
        <button class="bouton blanc" data-u="fermerMenu">Fermer</button>
      </div>`;
    document.body.append(fond, menu);
    setTimeout(() => { const b = menu.querySelector('button'); if (b) b.focus({ preventScroll: true }); }, 30);
  }
  function fermerMenu() { $$('.menu, .menu-fond').forEach(x => x.remove()); }

  /* ---------- les clics, les formulaires ---------- */
  document.addEventListener('click', e => {
    const u = e.target.closest('[data-u]');
    if (u && u.dataset.u && UI[u.dataset.u]) {
      e.preventDefault();
      if (u.closest('.menu') && !['fermerMenu', 'sons', 'profil'].includes(u.dataset.u)) fermerMenu();
      UI[u.dataset.u](u, e);
      return;
    }
    const b = e.target.closest('[data-a]');
    if (b && !b.disabled && b.tagName !== 'FORM') {
      e.preventDefault();
      let d = {};
      try { d = JSON.parse(b.dataset.d || '{}'); } catch {}
      Son.jouer('pop');
      agir(b.dataset.a, d);
    }
  });
  document.addEventListener('submit', e => {
    const f = e.target.closest('form[data-a]');
    if (!f) return;
    e.preventDefault();
    const champ = f.querySelector('input');
    const texte = champ ? champ.value.trim() : '';
    if (!texte) { if (champ) champ.focus(); return; }
    let d = {};
    try { d = JSON.parse(f.dataset.d || '{}'); } catch {}
    agir(f.dataset.a, { ...d, [f.dataset.champ || 'texte']: texte });
    Son.jouer('pop');
    if (f.dataset.garder && champ) { champ.value = ''; champ.focus(); }
    else if (role === 'b') rendre();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') fermerMenu(); });

  /* ---------- l'horloge : chronos, présence, renvois ---------- */
  setInterval(() => {
    const t = maintenant();
    for (const el of $$('[data-fin]')) {
      const fin = +el.dataset.fin, duree = +el.dataset.duree, reste = Math.max(0, fin - t);
      if (el.classList.contains('chrono')) el.firstElementChild.style.transform = `scaleX(${(reste / duree).toFixed(4)})`;
      else if (el.tagName === 'circle') el.setAttribute('stroke-dashoffset', (389.6 * (1 - reste / duree)).toFixed(1));
      else if (el.classList.contains('secondes')) {
        const sec = String(Math.ceil(reste / 1000));
        if (el.textContent !== sec) { el.textContent = sec; if (reste > 0 && +sec <= 3) Son.jouer('tic'); }
        el.classList.toggle('urgent', reste > 0 && reste <= 5000 && duree > 5000);
      }
    }
  }, 100);
  setInterval(() => {
    if (!salon || role === 'local' || !etat && role !== 'joindre') return;
    envoyerMsg(role === 'a' ? { t: 'ping', h: Date.now() } : { t: 'ping' });
    if (role === 'b' || role === 'joindre') renvoyer();
    rendreBarre();
  }, 3000);
  setInterval(() => { if (role === 'a' && enLigne()) publier(); }, 20000);
  //  la présence de l'autre change l'affichage (bandeau « hors ligne »)
  let dernierEnLigne = null;
  setInterval(() => { const x = enLigne(); if (x !== dernierEnLigne) { dernierEnLigne = x; if (etat) rendre(); } }, 2000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    verrouEcran();
    if (salon) { envoyerMsg({ t: 'ping' }); if (role === 'a') publier(); else if (role === 'b') envoyerMsg({ t: 'sync' }); }
  });

  //  le lien partagé ouvert alors que le site l'est déjà : seule l'ancre change
  addEventListener('hashchange', () => {
    const c = globalThis.Reseau.normaliserCode(decodeURIComponent(location.hash.slice(1)));
    if (c.length < 4 || etat || role === 'joindre') return;
    ui.code = c.replace(/^([A-Z]+)(\d+)$/, '$1-$2');
    ui.ecran = 'rejoindre';
    rendre();
  });

  /* ---------- au démarrage ---------- */
  const codeLien = globalThis.Reseau.normaliserCode(decodeURIComponent(location.hash.slice(1)));
  const p = mem.get('partie');
  if (codeLien.length >= 4 && (!p || globalThis.Reseau.normaliserCode(p.code) !== codeLien)) {
    ui.code = codeLien.replace(/^([A-Z]+)(\d+)$/, '$1-$2');
    ui.ecran = 'rejoindre';
    rendre();
  } else if (p && Date.now() - p.date < 12 * 3600 * 1000) {
    reprendre(p);
  } else {
    rendre();
  }
  //  pour les tests : l'état et quelques commandes
  globalThis.__ile = { get etat() { return etat; }, get role() { return role; }, get salon() { return salon; }, agir, ui, Toile };
})();
