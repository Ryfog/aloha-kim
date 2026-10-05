/* ============================================================
   Réseau : deux téléphones qui se parlent, sans serveur à nous.
   Les messages passent par deux relais MQTT publics et gratuits
   (on écrit sur les deux, on lit le premier qui arrive). Tout est
   chiffré avec une clé tirée du code de la partie : le relais ne
   voit passer que du charabia, sur un canal au nom illisible.
   ============================================================ */
(() => {
  'use strict';

  const RELAIS = [
    'wss://broker.emqx.io:8084/mqtt',
    'wss://broker.hivemq.com:8884/mqtt'
  ];
  const texte = new TextEncoder();
  const lecture = new TextDecoder();

  /* ---------- un client MQTT 3.1.1 minuscule, par WebSocket ---------- */
  const chaine = s => { const b = texte.encode(s); return [b.length >> 8, b.length & 255, ...b]; };
  const longueur = n => { const o = []; do { let x = n % 128; n = Math.floor(n / 128); if (n > 0) x |= 128; o.push(x); } while (n > 0); return o; };
  const paquet = (entete, corps) => {
    const c = corps instanceof Uint8Array ? corps : Uint8Array.from(corps);
    const l = longueur(c.length);
    const p = new Uint8Array(1 + l.length + c.length);
    p[0] = entete; p.set(l, 1); p.set(c, 1 + l.length);
    return p;
  };

  class MiniMQTT {
    constructor(url, { id, surMessage, surEtat }) {
      this.url = url; this.id = id;
      this.surMessage = surMessage || (() => {});
      this.surEtat = surEtat || (() => {});
      this.filtres = new Set();
      this.pret = false; this.fini = false;
      this.attente = 1000; this.tampon = new Uint8Array(0); this.numero = 1;
    }
    connecter() {
      if (this.fini) return;
      let ws;
      try { ws = new WebSocket(this.url, ['mqtt']); } catch { this.relancer(); return; }
      this.ws = ws;
      ws.binaryType = 'arraybuffer';
      const delai = setTimeout(() => { if (!this.pret) ws.close(); }, 8000);
      ws.onopen = () => {
        //  CONNECT : session propre, 30 s de maintien
        const corps = [...chaine('MQTT'), 4, 0x02, 0, 30, ...chaine(this.id)];
        ws.send(paquet(0x10, corps));
      };
      ws.onmessage = e => this.recevoir(new Uint8Array(e.data));
      ws.onclose = () => {
        clearTimeout(delai); clearInterval(this.pouls);
        const etaitPret = this.pret;
        this.pret = false; this.tampon = new Uint8Array(0);
        if (etaitPret) this.surEtat(false);
        this.relancer();
      };
      ws.onerror = () => {};
    }
    relancer() {
      if (this.fini) return;
      clearTimeout(this.minuteur);
      this.minuteur = setTimeout(() => this.connecter(), this.attente);
      this.attente = Math.min(this.attente * 2, 15000);
    }
    recevoir(octets) {
      const t = new Uint8Array(this.tampon.length + octets.length);
      t.set(this.tampon); t.set(octets, this.tampon.length);
      let i = 0;
      while (t.length - i >= 2) {
        let mult = 1, lg = 0, k = i + 1, b;
        do { if (k >= t.length) { this.tampon = t.slice(i); return; } b = t[k++]; lg += (b & 127) * mult; mult *= 128; } while (b & 128);
        if (k + lg > t.length) break;
        this.traiter(t[i], t.subarray(k, k + lg));
        i = k + lg;
      }
      this.tampon = t.slice(i);
    }
    traiter(entete, corps) {
      const type = entete >> 4;
      if (type === 2) {                                   // CONNACK
        if (corps[1] !== 0) { this.ws.close(); return; }
        this.pret = true; this.attente = 1000;
        for (const f of this.filtres) this.envoyerAbonnement(f);
        this.pouls = setInterval(() => { try { this.ws.send(Uint8Array.of(0xC0, 0)); } catch {} }, 20000);
        this.surEtat(true);
      } else if (type === 3) {                            // PUBLISH
        const lgSujet = (corps[0] << 8) | corps[1];
        const sujet = lecture.decode(corps.subarray(2, 2 + lgSujet));
        let debut = 2 + lgSujet;
        if ((entete >> 1) & 3) debut += 2;                // identifiant si QoS > 0
        this.surMessage(sujet, corps.slice(debut), !!(entete & 1));   // gardé = livré depuis la mémoire du relais
      }
    }
    envoyerAbonnement(filtre) {
      const n = this.numero++ & 0xffff || 1;
      this.ws.send(paquet(0x82, [n >> 8, n & 255, ...chaine(filtre), 0]));
    }
    abonner(filtre) {
      this.filtres.add(filtre);
      if (this.pret) this.envoyerAbonnement(filtre);
    }
    publier(sujet, octets, garder = false) {
      if (!this.pret) return false;
      const s = chaine(sujet);
      const corps = new Uint8Array(s.length + octets.length);
      corps.set(s); corps.set(octets, s.length);
      try { this.ws.send(paquet(0x30 | (garder ? 1 : 0), corps)); return true; } catch { return false; }
    }
    fermer() {
      this.fini = true;
      clearTimeout(this.minuteur); clearInterval(this.pouls);
      try { if (this.pret) this.ws.send(Uint8Array.of(0xE0, 0)); this.ws.close(); } catch {}
    }
  }

  /* ---------- le code de la partie donne le canal et la clé ---------- */
  const normaliserCode = s => (s || '').toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Z0-9]/g, '');
  const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
  async function canal(code) {
    return 'ilejeux/' + hex(await crypto.subtle.digest('SHA-256', texte.encode('ile-aux-jeux|' + code))).slice(0, 24);
  }
  async function cle(code) {
    const base = await crypto.subtle.importKey('raw', texte.encode(code), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: texte.encode('ile-aux-jeux-v1'), iterations: 60000, hash: 'SHA-256' },
      base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }
  async function chiffrer(k, obj) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const c = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, k, texte.encode(JSON.stringify(obj))));
    const o = new Uint8Array(12 + c.length); o.set(iv); o.set(c, 12);
    return o;
  }
  async function dechiffrer(k, octets) {
    if (octets.length < 13) return null;
    try {
      const clair = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: octets.subarray(0, 12) }, k, octets.subarray(12));
      return JSON.parse(lecture.decode(clair));
    } catch { return null; }
  }

  /* ---------- le salon : tous les relais, un seul fil de messages ---------- */
  class Salon {
    constructor({ code, appareil, surMessage, surStatut, relais = RELAIS }) {
      this.code = normaliserCode(code);
      this.appareil = appareil;
      this.surMessage = surMessage || (() => {});
      this.surStatut = surStatut || (() => {});
      this.relais = relais;
      this.vus = new Map();
      this.clients = [];
    }
    async ouvrir() {
      this.cle = await cle(this.code);
      this.base = await canal(this.code);
      this.clients = this.relais.map((url, n) => {
        const c = new MiniMQTT(url, {
          id: 'ile-' + this.appareil.slice(0, 10) + '-' + n + '-' + Math.random().toString(36).slice(2, 7),
          surMessage: (sujet, octets, garde) => this.arrivee(sujet, octets, garde),
          surEtat: () => this.surStatut(this.connecte)
        });
        c.abonner(this.base + '/#');
        c.connecter();
        return c;
      });
    }
    get connecte() { return this.clients.some(c => c.pret); }
    async arrivee(sujet, octets, garde) {
      if (!octets.length || !this.cle) return;
      const m = await dechiffrer(this.cle, octets);
      if (!m || m.de === this.appareil) return;
      //  le même message arrive par chaque relais : on ne le traite qu'une fois
      if (m.mid) {
        if (this.vus.has(m.mid)) return;
        this.vus.set(m.mid, 1);
        if (this.vus.size > 600) this.vus.delete(this.vus.keys().next().value);
      }
      this.surMessage(sujet.slice(this.base.length + 1), m, garde);
    }
    async envoyer(sous, obj, garder = false) {
      if (!this.cle) return false;          // la clé est encore en cours de calcul
      const m = { ...obj, de: this.appareil, mid: obj.mid || (Date.now().toString(36) + Math.random().toString(36).slice(2, 8)) };
      const octets = await chiffrer(this.cle, m);
      let parti = false;
      for (const c of this.clients) parti = c.publier(this.base + '/' + sous, octets, garder) || parti;
      return parti;
    }
    effacer(sous) { for (const c of this.clients) c.publier(this.base + '/' + sous, new Uint8Array(0), true); }
    fermer() { for (const c of this.clients) c.fermer(); this.clients = []; }
  }

  globalThis.Reseau = { Salon, MiniMQTT, normaliserCode, RELAIS };
})();
