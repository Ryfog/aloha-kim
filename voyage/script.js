/* Kim, un voyage dans le futur — 5 épreuves pour charger le cristal, puis il éclate et révèle le cadeau. */
(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const CLE = 'kimFuturo';
  const memo = { lire() { try { return JSON.parse(localStorage.getItem(CLE)) || {}; } catch (e) { return {}; } },
                 ecrire(o) { try { localStorage.setItem(CLE, JSON.stringify(o)); } catch (e) {} } };
  const hasard = (a, b) => a + Math.random() * (b - a);
  const COULEURS = ['#7cf2ff', '#a68bff', '#ff86dc', '#ffd98a', '#ffffff'];
  // densité d'un canvas plein écran : au plus ~1,1 million de pixels, quel que soit l'écran
  const densite = (max) => Math.max(0.5, Math.min(max, devicePixelRatio || 1, Math.sqrt(1.1e6 / (innerWidth * innerHeight))));
  // mode léger : pas d'accélération graphique (rendu logiciel) ou forcé par ?leger=1
  const LEGER = { on: false, force: new URLSearchParams(location.search).get('leger') };
  (() => {
    if (LEGER.force === '1') { LEGER.on = true; return; } if (LEGER.force === '0') return;
    try { const gl = document.createElement('canvas').getContext('webgl'); if (!gl) { LEGER.on = true; return; }
      const ext = gl.getExtension('WEBGL_debug_renderer_info'), nom = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : '';
      if (/swiftshader|llvmpipe|software|basic render/i.test(nom)) LEGER.on = true; } catch (e) { LEGER.on = true; }
  })();
  if (LEGER.on) document.documentElement.classList.add('leger');

  /* ================= SON : tout est synthétisé, rien à télécharger ================= */
  const Son = (() => {
    let ctx = null, sortie = null, actif = true, nappe = null;
    function init() {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
        ctx = new AC(); sortie = ctx.createGain(); sortie.gain.value = 0.5;
        const comp = ctx.createDynamicsCompressor(); sortie.connect(comp); comp.connect(ctx.destination);
      }
      if (ctx.state === 'suspended') ctx.resume();
    }
    function note(f, t0, dur, type, vol) {
      const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type || 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g); g.connect(sortie); o.start(t0); o.stop(t0 + dur + 0.05);
    }
    function bruit(dur, f0, f1, vol, t0) {
      const n = Math.floor(ctx.sampleRate * dur), buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      const s = ctx.createBufferSource(); s.buffer = buf;
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.2;
      bp.frequency.setValueAtTime(f0, t0); bp.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
      const g = ctx.createGain(); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + dur * 0.4); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      s.connect(bp); bp.connect(g); g.connect(sortie); s.start(t0); s.stop(t0 + dur);
    }
    const ok = () => ctx && actif;
    return {
      init,
      tic(f) { if (!ok()) return; note(f || 880, ctx.currentTime, 0.14, 'triangle', 0.13); },
      ton(f) { if (!ok()) return; const t = ctx.currentTime; note(f, t, 0.5, 'sine', 0.2); note(f * 2, t, 0.35, 'sine', 0.05); note(f * 3, t, 0.2, 'triangle', 0.02); },
      erreur() { if (!ok()) return; const t = ctx.currentTime; note(220, t, 0.18, 'sawtooth', 0.05); note(185, t + 0.09, 0.25, 'sawtooth', 0.05); },
      petit() { if (!ok()) return; const t = ctx.currentTime; [784, 1175].forEach((f, i) => note(f, t + i * 0.07, 0.35, 'sine', 0.13)); },
      succes() { if (!ok()) return; const t = ctx.currentTime; [523, 659, 784, 1047, 1319].forEach((f, i) => { note(f, t + i * 0.085, 0.9, 'sine', 0.13); note(f * 2, t + i * 0.085, 0.4, 'triangle', 0.03); }); },
      whoosh() { if (!ok()) return; bruit(1.1, 300, 4200, 0.35, ctx.currentTime); },
      craque(n) { if (!ok()) return; const t = ctx.currentTime; bruit(0.25, 3000, 900, 0.3 + n * 0.1, t); note(140 - n * 20, t, 0.4, 'sine', 0.25); },
      eclat() {
        if (!ok()) return; const t = ctx.currentTime; bruit(1.6, 6000, 300, 0.5, t); note(65, t, 1.6, 'sine', 0.4);
        for (let i = 0; i < 26; i++) note([1047, 1319, 1568, 2093, 2637][i % 5] * (i % 3 ? 1 : 2), t + 0.15 + i * 0.06, 1.4, 'sine', 0.045);
      },
      nappe(on) {
        if (!ctx) return;
        if (on && !nappe && actif) {
          const g = ctx.createGain(); g.gain.value = 0; g.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 3);
          const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.connect(g); g.connect(sortie);
          const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.07; lg.gain.value = 400; lfo.connect(lg); lg.connect(lp.frequency); lfo.start();
          const os = [130.8, 196, 261.6, 329.6, 392].map((f, i) => { const o = ctx.createOscillator(); o.type = i % 2 ? 'triangle' : 'sawtooth'; o.frequency.value = f; o.detune.value = (i - 2) * 6; o.connect(lp); o.start(); return o; });
          nappe = { g, os, lfo };
        } else if (!on && nappe) {
          const n = nappe; nappe = null; n.g.gain.linearRampToValueAtTime(0, ctx.currentTime + 1); setTimeout(() => { n.os.forEach((o) => o.stop()); n.lfo.stop(); }, 1200);
        }
      },
      basculer() { actif = !actif; if (sortie) sortie.gain.value = actif ? 0.5 : 0; return actif; },
    };
  })();

  /* ================= CIEL : étoiles en profondeur, étoiles filantes, hyperespace ================= */
  const Ciel = (() => {
    const cv = $('#ciel'), cx = cv.getContext('2d'); let W = 0, H = 0;
    const etoiles = [], filantes = []; const etat = { v: 0.12 };
    function taille() { const d = densite(1.5); W = innerWidth; H = innerHeight; cv.width = W * d; cv.height = H * d; cx.setTransform(d, 0, 0, d, 0, 0); }
    function nouvelle(e, partout) { e.x = hasard(-1, 1); e.y = hasard(-1, 1); e.z = partout ? hasard(0.05, 1) : 1; e.c = COULEURS[(Math.random() * 5) | 0]; e.tw = hasard(0, 6.28); e.pz = e.z; return e; }
    for (let i = 0; i < 220; i++) etoiles.push(nouvelle({}, true));
    function frame(t, dt) {
      cx.clearRect(0, 0, W, H);
      const v = etat.v, f = Math.max(W, H) * 0.55;
      for (const e of etoiles) {
        e.pz = e.z; e.z -= v * dt * 0.25;
        if (e.z <= 0.03) { nouvelle(e, false); continue; }
        const sx = W / 2 + (e.x / e.z) * f, sy = H * 0.42 + (e.y / e.z) * f;
        if (sx < -50 || sx > W + 50 || sy < -50 || sy > H + 50) { nouvelle(e, false); continue; }
        const r = Math.max(0.4, (1 - e.z) * 2.3), a = Math.min(1, (1 - e.z) * 1.4) * (0.65 + 0.35 * Math.sin(t * 2 + e.tw));
        cx.globalAlpha = a; cx.fillStyle = e.c; cx.strokeStyle = e.c;
        if (v > 0.6) {
          const px = W / 2 + (e.x / e.pz) * f, py = H * 0.42 + (e.y / e.pz) * f;
          cx.lineWidth = r; cx.beginPath(); cx.moveTo(px - (sx - px) * Math.min(6, v * 1.6), py - (sy - py) * Math.min(6, v * 1.6)); cx.lineTo(sx, sy); cx.stroke();
        } else { cx.beginPath(); cx.arc(sx, sy, r, 0, 6.283); cx.fill(); }
      }
      if (Math.random() < dt * 0.25 && v < 0.6) filantes.push({ x: hasard(0, W), y: hasard(0, H * 0.5), vx: hasard(-500, -260), vy: hasard(120, 260), vie: 1 });
      for (let i = filantes.length - 1; i >= 0; i--) {
        const s = filantes[i]; s.x += s.vx * dt; s.y += s.vy * dt; s.vie -= dt * 0.9;
        if (s.vie <= 0) { filantes.splice(i, 1); continue; }
        const g = cx.createLinearGradient(s.x, s.y, s.x - s.vx * 0.18, s.y - s.vy * 0.18); g.addColorStop(0, 'rgba(255,255,255,' + s.vie + ')'); g.addColorStop(1, 'rgba(160,140,255,0)');
        cx.globalAlpha = 1; cx.strokeStyle = g; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(s.x, s.y); cx.lineTo(s.x - s.vx * 0.18, s.y - s.vy * 0.18); cx.stroke();
      }
      cx.globalAlpha = 1;
    }
    function alleger() { etoiles.length = 110; }
    return { taille, frame, etat, alleger };
  })();

  const trace = $('#trace'), tx = trace.getContext('2d');
  function tailleTrace() { const d = densite(1.5); trace.width = innerWidth * d; trace.height = innerHeight * d; tx.setTransform(d, 0, 0, d, 0, 0); }

  /* ================= ÉCLATS : particules de lumière (réussites, doigt, confettis) ================= */
  const Eclats = (() => {
    const cv = $('#eclats'), cx = cv.getContext('2d'); let W = 0, H = 0; const ps = []; let vide = false;
    const SPRITES = {};
    COULEURS.forEach((c) => { const s = document.createElement('canvas'); s.width = s.height = 64; const g = s.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      r.addColorStop(0, '#fff'); r.addColorStop(0.18, c); r.addColorStop(0.45, c + '55'); r.addColorStop(1, c + '00'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); SPRITES[c] = s; });
    function taille() { const d = densite(1.5); W = innerWidth; H = innerHeight; cv.width = W * d; cv.height = H * d; cx.setTransform(d, 0, 0, d, 0, 0); }
    function gerbe(x, y, n, force, gravite) {
      for (let i = 0; i < n; i++) { const a = hasard(0, 6.283), v = hasard(0.2, 1) * (force || 420);
        ps.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: gravite == null ? 260 : gravite, vie: 1, dv: hasard(0.6, 1.3), r: hasard(1.5, 3.6), c: COULEURS[(Math.random() * 5) | 0], forme: Math.random() < 0.35 ? 'losange' : 'rond', rot: hasard(0, 6), vr: hasard(-6, 6) }); }
    }
    function pluie(n) { for (let i = 0; i < n; i++) ps.push({ x: hasard(0, W), y: hasard(-H * 0.6, -10), vx: hasard(-30, 30), vy: hasard(80, 200), g: 30, vie: 1, dv: hasard(0.12, 0.22), r: hasard(2, 4.5), c: COULEURS[(Math.random() * 5) | 0], forme: 'losange', rot: hasard(0, 6), vr: hasard(-3, 3) }); }
    function frame(t, dt) {
      if (!ps.length) { if (!vide) { cx.clearRect(0, 0, W, H); vide = true; } return; } vide = false;
      const MAXP = LEGER.on ? 180 : 500; if (ps.length > MAXP) ps.splice(0, ps.length - MAXP);
      cx.clearRect(0, 0, W, H); cx.globalCompositeOperation = 'lighter';
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i]; p.vy += p.g * dt; p.vx *= 1 - dt * 0.8; p.x += p.vx * dt; p.y += p.vy * dt; p.vie -= dt * p.dv; p.rot += p.vr * dt;
        if (p.vie <= 0 || p.y > H + 30) { ps.splice(i, 1); continue; }
        cx.globalAlpha = Math.min(1, p.vie * 1.4); cx.fillStyle = p.c;
        const tl = p.r * 7; cx.drawImage(SPRITES[p.c] || SPRITES['#ffffff'], p.x - tl / 2, p.y - tl / 2, tl, tl);
        if (p.forme === 'losange') { cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot); cx.beginPath(); cx.moveTo(0, -p.r * 2); cx.lineTo(p.r, 0); cx.lineTo(0, p.r * 2); cx.lineTo(-p.r, 0); cx.closePath(); cx.fill(); cx.restore(); }
      }
      cx.globalAlpha = 1; cx.globalCompositeOperation = 'source-over';
    }
    return { taille, frame, gerbe, pluie, ps };
  })();
  // poussière de lumière sous le doigt
  let dernierTrait = 0;
  addEventListener('pointermove', (e) => { const n = performance.now(); if (n - dernierTrait > 70) { dernierTrait = n; Eclats.ps.push({ x: e.clientX, y: e.clientY, vx: hasard(-30, 30), vy: hasard(-40, 10), g: 40, vie: 0.8, dv: 1.6, r: hasard(1, 2.4), c: COULEURS[(Math.random() * 5) | 0], forme: 'rond', rot: 0, vr: 0 }); } }, { passive: true });

  /* ================= CRISTAL 3D (three.js) : irisé, se charge, éclate ================= */
  const Cristal = (() => {
    const cv = $('#cristal'); let rendu = null, scene, cam, mesh; const U = { uTime: { value: 0 }, uCharge: { value: 0 }, uExplose: { value: 0 }, uFlash: { value: 0 } };
    const etat = { vit: 0.4, secousse: 0 };
    try {
      rendu = new THREE.WebGLRenderer({ canvas: cv, antialias: !LEGER.on, alpha: true }); rendu.setPixelRatio(LEGER.on ? 1 : Math.min(1.5, devicePixelRatio || 1));
      scene = new THREE.Scene(); cam = new THREE.PerspectiveCamera(32, 1, 0.1, 100); cam.position.set(0, 0, 7);
      let g = new THREE.IcosahedronGeometry(1.3, 1); if (g.index) g = g.toNonIndexed(); g.scale(0.9, 1.32, 0.9);
      const p = g.attributes.position, n = p.count, nor = new Float32Array(n * 3), cen = new Float32Array(n * 3), dir = new Float32Array(n * 3), rnd = new Float32Array(n);
      const A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3(), N = new THREE.Vector3(), M = new THREE.Vector3();
      for (let i = 0; i < n; i += 3) {
        A.fromBufferAttribute(p, i); B.fromBufferAttribute(p, i + 1); C.fromBufferAttribute(p, i + 2);
        N.subVectors(C, B).cross(M.subVectors(A, B)).normalize(); M.copy(A).add(B).add(C).multiplyScalar(1 / 3);
        const r = Math.random(), d = M.clone().normalize();
        for (let k = 0; k < 3; k++) { nor.set([N.x, N.y, N.z], (i + k) * 3); cen.set([M.x, M.y, M.z], (i + k) * 3); dir.set([d.x, d.y, d.z], (i + k) * 3); rnd[i + k] = r; }
      }
      g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); g.setAttribute('aCentre', new THREE.BufferAttribute(cen, 3));
      g.setAttribute('aDir', new THREE.BufferAttribute(dir, 3)); g.setAttribute('aRnd', new THREE.BufferAttribute(rnd, 1));
      const mat = new THREE.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false, side: THREE.DoubleSide,
        vertexShader: `
          attribute vec3 aCentre; attribute vec3 aDir; attribute float aRnd; uniform float uExplose;
          varying vec3 vN; varying vec3 vV; varying float vR;
          mat3 rot(vec3 a, float t) { a = normalize(a); float s = sin(t), c = cos(t), o = 1.0 - c;
            return mat3(o*a.x*a.x + c, o*a.x*a.y + a.z*s, o*a.z*a.x - a.y*s, o*a.x*a.y - a.z*s, o*a.y*a.y + c, o*a.y*a.z + a.x*s, o*a.z*a.x + a.y*s, o*a.y*a.z - a.x*s, o*a.z*a.z + c); }
          void main() {
            float e = uExplose; mat3 R = rot(aDir + vec3(aRnd, 0.4, 1.0 - aRnd), e * (3.0 + aRnd * 9.0));
            vec3 p = R * (position - aCentre) * (1.0 - e * 0.3) + aCentre + aDir * e * (4.0 + aRnd * 7.0) - vec3(0.0, e * e * 2.0, 0.0);
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            vN = normalize(normalMatrix * (R * normal)); vV = normalize(-mv.xyz); vR = aRnd;
            gl_Position = projectionMatrix * mv; }`,
        fragmentShader: `
          uniform float uTime, uCharge, uExplose, uFlash; varying vec3 vN; varying vec3 vV; varying float vR;
          vec3 hsv(float h, float s, float v) { vec3 k = clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0); return v * mix(vec3(1.0), k, s); }
          void main() {
            vec3 n = normalize(gl_FrontFacing ? vN : -vN);
            float f = 1.0 - abs(dot(n, vV));
            float h = fract(dot(n, vec3(0.35, 0.55, 0.2)) * 0.8 + vR * 0.3 + uTime * 0.035 + f * 0.45);
            vec3 irid = hsv(h, 0.42 + 0.2 * f, 1.0);
            vec3 c = mix(vec3(0.09, 0.08, 0.26), irid, 0.45 + 0.45 * f) * (0.5 + pow(f, 1.4) * 0.9 + uCharge * 0.4);
            float sp = pow(max(dot(reflect(-vV, n), normalize(vec3(0.4, 0.8, 0.55))), 0.0), 36.0);
            float sp2 = pow(max(dot(reflect(-vV, n), normalize(vec3(-0.6, 0.2, 0.7))), 0.0), 60.0);
            c += sp * 1.3 + sp2 * vec3(1.0, 0.75, 0.95);
            c += vec3(0.78, 0.68, 1.0) * uCharge * (0.22 + 0.14 * sin(uTime * 2.2 + vR * 6.28));
            c += uFlash;
            float a = (0.62 + 0.36 * f) * (1.0 - smoothstep(0.6, 1.0, uExplose));
            gl_FragColor = vec4(c, a); }` });
      mesh = new THREE.Mesh(g, mat); scene.add(mesh);
    } catch (e) { rendu = null; cv.style.display = 'none'; const b = document.createElement('div'); b.className = 'cristal-css'; $('#cristal-boite').appendChild(b); }
    function taille() { if (!rendu) return; const w = cv.offsetWidth, h = cv.offsetHeight; if (w > 0) rendu.setSize(w, h, false); }
    let ang = 0;
    function frame(t, dt) {
      if (!rendu || cv.parentNode.style.opacity === '0') return; U.uTime.value = t; ang += dt * etat.vit;
      mesh.rotation.y = ang; mesh.rotation.x = Math.sin(t * 0.5) * 0.12 + Math.sin(t * 37) * etat.secousse; mesh.rotation.z = Math.sin(t * 41) * etat.secousse;
      rendu.render(scene, cam);
    }
    function alleger() { if (rendu) { rendu.setPixelRatio(1); taille(); } }
    return { U, etat, taille, frame, alleger, ok: () => !!rendu };
  })();

  /* ================= FOND : lumière liquide (caustiques irisées) ================= */
  const Fond = (() => {
    const cv = $('#fond'); let r = null, sc, cam, U = { uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) } };
    try {
      r = new THREE.WebGLRenderer({ canvas: cv, antialias: false, alpha: false, powerPreference: 'low-power' }); r.setPixelRatio(0.35);
      sc = new THREE.Scene(); cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      sc.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ uniforms: U, depthTest: false,
        vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
        fragmentShader: `
          uniform float uTime; uniform vec2 uRes; varying vec2 vUv;
          void main() {
            vec2 uv = vec2(vUv.x * uRes.x / uRes.y, vUv.y);
            float t = uTime * 0.22 + 23.0;
            vec2 p = mod(uv * 6.2831 * 0.9, 6.2831) - 250.0, i = p; float c = 1.0;
            for (int n = 0; n < 5; n++) { float tt = t * (1.0 - (3.5 / float(n + 1)));
              i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
              c += 1.0 / length(vec2(p.x / (sin(i.x + tt) / 0.005), p.y / (cos(i.y + tt) / 0.005))); }
            c /= 5.0; c = 1.17 - pow(c, 1.4); float k = pow(abs(c), 7.0);
            vec3 base = mix(vec3(0.025, 0.025, 0.085), vec3(0.085, 0.065, 0.22), smoothstep(0.0, 1.0, vUv.y));
            vec3 irid = 0.5 + 0.5 * cos(6.2831 * (vec3(0.0, 0.33, 0.67) + uv.x * 0.18 + vUv.y * 0.12 + uTime * 0.025));
            vec3 col = base + k * mix(vec3(0.5, 0.55, 1.0), irid, 0.65) * 0.26;
            col *= 0.75 + 0.25 * smoothstep(0.0, 0.7, vUv.y);
            gl_FragColor = vec4(col, 1.0); }` })));
    } catch (e) { r = null; cv.style.display = 'none'; }
    let fige = false;
    return { taille() { if (r) { r.setPixelRatio(Math.min(0.35, Math.sqrt(2.6e5 / (innerWidth * innerHeight)))); r.setSize(innerWidth, innerHeight, false); U.uRes.value.set(innerWidth, innerHeight); if (fige) { U.uTime.value = 40; r.render(sc, cam); } } },
             frame(t, k) { if (r && !fige && k % 2 === 0) { U.uTime.value = t; r.render(sc, cam); } },
             figer() { fige = true; if (r) { U.uTime.value = 40; r.render(sc, cam); } } };
  })();

  /* ================= boucle commune ================= */
  function taille() { Fond.taille(); Ciel.taille(); Eclats.taille(); Cristal.taille(); tailleTrace(); }
  addEventListener('resize', taille); taille();
  let t0 = performance.now(), avant = t0;
  let img = 0, acc = 0, mesures = [];
  function passerLeger() {
    if (LEGER.on && document.documentElement.classList.contains('leger-actif')) return;
    LEGER.on = true; document.documentElement.classList.add('leger', 'leger-actif'); Fond.figer(); Ciel.alleger(); Cristal.alleger(); gsap.killTweensOf('.billet-scene', 'y'); gsap.set('.billet-scene', { y: 0 });
  }
  if (LEGER.on) passerLeger();
  (function boucle(n) {
    const dt = Math.min(0.05, (n - avant) / 1000); avant = n; const t = (n - t0) / 1000; img++;
    if (!LEGER.on && LEGER.force !== '0' && t > 1 && t < 4) { mesures.push(dt); if (mesures.length === 60) { const moy = mesures.reduce((a, b) => a + b) / 60; if (moy > 0.03) passerLeger(); } }
    Fond.frame(t, img);
    if (LEGER.on) { acc += dt; if (img % 2 === 0) { Ciel.frame(t, acc); Cristal.frame(t, acc); acc = 0; } } else { Ciel.frame(t, dt); Cristal.frame(t, dt); }
    Eclats.frame(t, dt); requestAnimationFrame(boucle);
  })(t0);

  gsap.to('#halo', { opacity: 0.6, duration: 2.6, yoyo: true, repeat: -1, ease: 'sine.inOut' });

  /* ================= placements du cristal ================= */
  const boite = $('#cristal-boite');
  gsap.set(boite, { xPercent: -50, transformOrigin: '50% 0%' });
  const topBoite = () => innerHeight * 0.07;
  const cristalEn = {
    accueil: (d) => gsap.to(boite, { y: 0, scale: 1, opacity: 1, duration: d, ease: 'power3.inOut' }),
    petit: (d) => gsap.to(boite, { y: 6 - topBoite(), scale: 0.3, opacity: 1, duration: d, ease: 'power3.inOut' }),
    centre: (d) => gsap.to(boite, { y: innerHeight * 0.15, scale: 1.08, opacity: 1, duration: d, ease: 'power3.inOut' }),
  };

  /* ================= écrans et transitions ================= */
  const ecrans = ['#accueil', '#epreuve', '#bravo', '#ouvrir', '#cadeau'].map($);
  let actuel = null;
  function entrer(el) {
    el.hidden = false; el.scrollTop = 0;
    const enfants = [...el.children].filter((c) => !c.hidden);
    gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.35 });
    gsap.fromTo(enfants, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.75, stagger: 0.08, ease: 'power3.out' });
  }
  function aller(el, opts = {}) {
    return new Promise((fini) => {
      const sortant = actuel; actuel = el;
      const suite = () => {
        if (sortant) sortant.hidden = true;
        el.hidden = false; gsap.set(el, { opacity: 0 });
        if (opts.avant) opts.avant();
        if (opts.warp) {
          Son.whoosh();
          gsap.timeline({ onComplete: () => { entrer(el); fini(); } })
            .to(Ciel.etat, { v: 5, duration: 0.55, ease: 'power2.in' }).to(Ciel.etat, { v: 0.12, duration: 0.9, ease: 'power3.out' });
        } else { entrer(el); fini(); }
      };
      if (sortant) gsap.to(sortant, { opacity: 0, y: -16, duration: 0.35, ease: 'power2.in', onComplete: () => { gsap.set(sortant, { y: 0 }); suite(); } });
      else suite();
    });
  }
  function secouer(el) { gsap.fromTo(el, { x: 0 }, { x: 10, duration: 0.06, yoyo: true, repeat: 5, ease: 'sine.inOut', clearProps: 'x' }); }
  function centreDe(el) { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }

  /* ================= LES 5 ÉPREUVES ================= */
  const etatTxt = $('#ep-etat');
  const dire = (s) => { etatTxt.textContent = s; gsap.fromTo(etatTxt, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.3 }); };
  const NS = 'http://www.w3.org/2000/svg';
  const svg = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  function lueur(racine, id, c) { const d = svg('defs', {}, racine); const f = svg('filter', { id, x: '-100%', y: '-100%', width: '300%', height: '300%' }, d);
    svg('feGaussianBlur', { stdDeviation: 5, result: 'b' }, f); const m = svg('feMerge', {}, f); svg('feMergeNode', { in: 'b' }, m); svg('feMergeNode', { in: 'SourceGraphic' }, m); return d; }
  const arc = (r, a0, a1) => { const p = (a) => [Math.sin(a * Math.PI / 180) * r, -Math.cos(a * Math.PI / 180) * r]; const [x0, y0] = p(a0), [x1, y1] = p(a1);
    return `M${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`; };

  // 1. Allumage : toucher quand la lumière passe dans la zone dorée
  function jeuAllumage(el, fini) {
    const s = svg('svg', { class: 'cadran', viewBox: '-150 -150 300 300' }); lueur(s, 'gl1');
    svg('circle', { r: 120, fill: 'none', stroke: 'rgba(255,255,255,.12)', 'stroke-width': 20 }, s);
    for (let i = 0; i < 36; i++) { const a = i * 10 * Math.PI / 180; svg('line', { x1: Math.sin(a) * 96, y1: -Math.cos(a) * 96, x2: Math.sin(a) * (i % 3 ? 100 : 104), y2: -Math.cos(a) * (i % 3 ? 100 : 104), stroke: 'rgba(255,255,255,.25)', 'stroke-width': 1.5 }, s); }
    const cible = svg('path', { fill: 'none', stroke: '#ffd98a', 'stroke-width': 20, 'stroke-linecap': 'round', filter: 'url(#gl1)' }, s);
    const point = svg('circle', { r: 13, fill: '#fff', filter: 'url(#gl1)' }, s);
    const centre = svg('text', { 'text-anchor': 'middle', y: 14, fill: '#fff', 'font-family': 'Syne', 'font-weight': 800, 'font-size': 46 }, s); centre.textContent = '3';
    const mot = document.createElement('div'); mot.className = 'moteurs'; mot.innerHTML = '<i></i><i></i><i></i>';
    const bloc = document.createElement('div'); bloc.append(s, mot); el.appendChild(bloc);
    let a = 0, c = 0, larg = 30, vit = 150, coups = 0, fin = false, raf;
    const placer = () => { do { c = hasard(0, 360); } while (Math.abs(((c - a + 540) % 360) - 180) < 70); cible.setAttribute('d', arc(120, c - larg, c + larg)); gsap.fromTo(cible, { opacity: 0 }, { opacity: 1, duration: 0.3 }); };
    placer();
    let av = performance.now();
    const tour = (n) => { const dt = (n - av) / 1000; av = n; a = (a + vit * dt) % 360; const r = a * Math.PI / 180; point.setAttribute('cx', Math.sin(r) * 120); point.setAttribute('cy', -Math.cos(r) * 120); if (!fin) raf = requestAnimationFrame(tour); };
    raf = requestAnimationFrame(tour);
    dire('Touche quand la lumière est dans l’or ✨');
    const toucher = (e) => {
      if (fin) return; e.preventDefault();
      const d = Math.abs(((a - c + 540) % 360) - 180);
      const r = a * Math.PI / 180, b = s.getBoundingClientRect(), k = b.width / 300;
      if (d <= larg + 6) {
        coups++; mot.children[coups - 1].classList.add('on'); centre.textContent = String(3 - coups);
        Son.ton([523, 659, 784][coups - 1]); Eclats.gerbe(b.left + b.width / 2 + Math.sin(r) * 120 * k, b.top + b.height / 2 - Math.cos(r) * 120 * k, 26, 320);
        gsap.fromTo(s, { scale: 1.06 }, { scale: 1, duration: 0.4, ease: 'back.out(3)' });
        if (coups >= 3) { fin = true; centre.textContent = '✓'; setTimeout(fini, 450); return; }
        larg = [30, 24, 19][coups]; vit = [150, 205, 255][coups]; placer(); dire(['', 'Encore deux !', 'Plus qu’une !'][coups]);
      } else { Son.erreur(); secouer(s); dire('Presque ! Attends que la lumière soit dans l’or.'); }
    };
    el.addEventListener('pointerdown', toucher);
    return () => { fin = true; cancelAnimationFrame(raf); el.removeEventListener('pointerdown', toucher); };
  }

  // 2. Les anneaux : aligner les trois points de lumière en haut (l'anneau du milieu entraîne le petit)
  function jeuAnneaux(el, fini) {
    const s = svg('svg', { class: 'cadran', viewBox: '-150 -160 300 310' }); lueur(s, 'gl2');
    const faisceau = svg('rect', { x: -5, y: -150, width: 10, height: 150, rx: 5, fill: 'url(#fx)', opacity: 0 }, s);
    const lg = svg('linearGradient', { id: 'fx', x1: 0, y1: 0, x2: 0, y2: 1 }, s.querySelector('defs'));
    svg('stop', { offset: 0, 'stop-color': '#fff' }, lg); svg('stop', { offset: 1, 'stop-color': '#a68bff', 'stop-opacity': 0.2 }, lg);
    svg('path', { d: 'M0 -146 L-9 -158 L9 -158 Z', fill: '#ffd98a', filter: 'url(#gl2)' }, s);
    const R = [122, 86, 50], CO = ['#7cf2ff', '#ff86dc', '#ffd98a'], rot = [0, 0, 0], groupes = [];
    do { for (let i = 0; i < 3; i++) rot[i] = (1 + ((Math.random() * 5) | 0)) * 60; } while (rot.every((r) => r % 360 === 0));
    R.forEach((r, i) => {
      const gr = svg('g', {}, s);
      svg('circle', { r, fill: 'none', stroke: 'rgba(255,255,255,.14)', 'stroke-width': 18 }, gr);
      svg('circle', { r, fill: 'none', stroke: CO[i], 'stroke-opacity': 0.35, 'stroke-width': 3, 'stroke-dasharray': `${(2 * Math.PI * r / 6 - 10).toFixed(1)} 10` }, gr);
      svg('circle', { cx: 0, cy: -r, r: 11, fill: CO[i], filter: 'url(#gl2)' }, gr);
      gr.style.transformOrigin = '0px 0px'; gsap.set(gr, { rotation: rot[i], svgOrigin: '0 0' }); groupes.push(gr);
    });
    el.appendChild(s); dire('Touche un anneau pour le tourner');
    let fin = false, occupe = false;
    const tourner = (i) => { rot[i] += 60; gsap.to(groupes[i], { rotation: rot[i], svgOrigin: '0 0', duration: 0.45, ease: 'back.out(1.7)' }); };
    const toucher = (e) => {
      if (fin || occupe) return; e.preventDefault();
      const b = s.getBoundingClientRect(), k = 300 / b.width, x = (e.clientX - b.left) * k - 150, y = (e.clientY - b.top) * (310 / b.height) - 160, d = Math.hypot(x, y);
      let i = -1; if (d > 104 && d < 145) i = 0; else if (d > 68 && d <= 104) i = 1; else if (d > 25 && d <= 68) i = 2;
      if (i < 0) return;
      Son.tic([660, 880, 1100][i]); tourner(i); if (i === 1) tourner(2);
      if (rot.every((r) => r % 360 === 0)) {
        fin = true; occupe = true;
        setTimeout(() => { Son.ton(1047); gsap.fromTo(faisceau, { opacity: 0, attr: { height: 0, y: 0 } }, { opacity: 1, attr: { height: 150, y: -150 }, duration: 0.5, ease: 'power3.out' });
          Eclats.gerbe(b.left + b.width / 2, b.top + 10, 40, 380); setTimeout(fini, 700); }, 450);
      } else if (i === 1) dire('L’anneau du milieu entraîne le petit 😉');
    };
    s.addEventListener('pointerdown', toucher);
    return () => { fin = true; s.removeEventListener('pointerdown', toucher); };
  }

  // 3. Échos de lumière : refaire la suite (3, puis 4, puis 5)
  function jeuEchos(el, fini) {
    const C = [['#7cf2ff', 523.25], ['#a68bff', 659.25], ['#ff86dc', 783.99], ['#ffd98a', 1046.5]];
    const g = document.createElement('div'); g.className = 'orbes';
    const orbes = C.map(([c]) => { const o = document.createElement('button'); o.className = 'orbe'; o.style.setProperty('--c', c); o.setAttribute('aria-label', 'lumière'); g.appendChild(o); return o; });
    el.appendChild(g);
    const suite = Array.from({ length: 5 }, () => (Math.random() * 4) | 0);
    let manche = 0, pos = 0, ecoute = false, fin = false; const tempo = [];
    const LONG = [3, 4, 5];
    const allumer = (i, d) => { orbes[i].classList.add('allume'); Son.ton(C[i][1]); tempo.push(setTimeout(() => orbes[i].classList.remove('allume'), d)); };
    function montrer() {
      ecoute = false; pos = 0; dire('Regarde bien… (' + (manche + 1) + ' / 3)');
      const n = LONG[manche];
      for (let k = 0; k < n; k++) tempo.push(setTimeout(() => allumer(suite[k], 380), 700 + k * 560));
      tempo.push(setTimeout(() => { ecoute = true; dire('À toi !'); }, 700 + n * 560));
    }
    orbes.forEach((o, i) => o.addEventListener('pointerdown', (e) => {
      e.preventDefault(); if (!ecoute || fin) return;
      allumer(i, 240);
      if (i !== suite[pos]) { ecoute = false; Son.erreur(); secouer(g); dire('Oups ! On revoit la suite.'); tempo.push(setTimeout(montrer, 1100)); return; }
      pos++;
      if (pos >= LONG[manche]) {
        ecoute = false; manche++; const [x, y] = centreDe(g); Eclats.gerbe(x, y, 30, 340);
        if (manche >= 3) { fin = true; setTimeout(fini, 600); } else { Son.petit(); dire('Bien joué !'); tempo.push(setTimeout(montrer, 1100)); }
      }
    }));
    montrer();
    return () => { fin = true; tempo.forEach(clearTimeout); };
  }

  // 4. Nos souvenirs : seulement ce qu'Enzo m'a raconté (Happn, samedi 26 septembre, dimanche 27 chez ses parents)
  function jeuSouvenirs(el, fini) {
    const QUESTIONS = [
      ['Où est-ce qu’on s’est trouvés ?', ['Sur Happn', 'À une soirée', 'Dans le train', 'À la fac']],
      ['Notre premier rendez-vous (et notre premier bisou), c’était le…', ['Samedi 26 septembre', 'Vendredi 25 septembre', 'Dimanche 27 septembre', 'Samedi 3 octobre']],
      ['Le dimanche 27, tu es venue chez moi pour…', ['Rencontrer mes parents', 'Un marathon de films', 'Un concours de crêpes', 'Repeindre ma chambre']],
    ];
    const p = document.createElement('div'); p.className = 'panneau'; el.appendChild(p);
    let q = 0, fin = false;
    function poser() {
      const [txt, reps] = QUESTIONS[q], bonne = reps[0], melange = reps.slice().sort(() => Math.random() - 0.5);
      p.innerHTML = '<div class="points">' + QUESTIONS.map((_, i) => '<i class="' + (i < q ? 'on' : '') + '"></i>').join('') + '</div><p class="question"></p><div class="reponses"></div>';
      p.querySelector('.question').textContent = txt;
      const zone = p.querySelector('.reponses');
      melange.forEach((r) => {
        const b = document.createElement('button'); b.className = 'reponse'; b.textContent = r; zone.appendChild(b);
        b.addEventListener('click', () => {
          if (fin) return;
          if (r === bonne) {
            b.classList.add('bon'); Son.petit(); const [x, y] = centreDe(b); Eclats.gerbe(x, y, 26, 300); fin = true; q++;
            setTimeout(() => { fin = false; if (q >= QUESTIONS.length) { fin = true; fini(); } else { gsap.fromTo(p, { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.45 }); poser(); } }, 750);
          } else { b.classList.add('faux'); Son.erreur(); secouer(b); dire('Hmm… essaie encore 😄'); }
        });
      });
      dire('');
    }
    poser();
    return () => { fin = true; };
  }

  // 5. Pluie d'étoiles : attraper 12 étoiles filantes avec le cœur
  function jeuPluie(el, fini) {
    const cv = document.createElement('canvas'); cv.className = 'pluie'; const cpt = document.createElement('div'); cpt.className = 'compteur';
    el.append(cv, cpt);
    const cx = cv.getContext('2d'); let W, H; const d = Math.min(1.5, devicePixelRatio || 1);
    const dims = () => { const r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; cx.setTransform(d, 0, 0, d, 0, 0); };
    dims();
    const BUT = 12; let pris = 0, fin = false, raf, cible = W / 2, x = W / 2, prochaine = 0.3, t = 0; const etoiles = [];
    const maj = () => { cpt.textContent = pris + ' / ' + BUT; };
    maj(); dire('Glisse ton doigt ←  →');
    const viser = (e) => { const r = cv.getBoundingClientRect(); cible = Math.max(24, Math.min(W - 24, e.clientX - r.left)); };
    cv.addEventListener('pointerdown', (e) => { cv.setPointerCapture(e.pointerId); viser(e); });
    cv.addEventListener('pointermove', viser);
    function coeur(px, py, s) { cx.beginPath(); cx.moveTo(px, py + s * 0.35); cx.bezierCurveTo(px - s, py - s * 0.35, px - s * 0.5, py - s, px, py - s * 0.45); cx.bezierCurveTo(px + s * 0.5, py - s, px + s, py - s * 0.35, px, py + s * 0.35); cx.fill(); }
    function etoile(px, py, r, rot) { cx.beginPath(); for (let i = 0; i < 10; i++) { const a = rot + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; cx.lineTo(px + Math.cos(a) * rr, py + Math.sin(a) * rr); } cx.closePath(); cx.fill(); }
    let av = performance.now();
    function tour(n) {
      const dt = Math.min(0.05, (n - av) / 1000); av = n; t += dt; if (fin) return;
      x += (cible - x) * Math.min(1, dt * 14);
      prochaine -= dt; if (prochaine <= 0) { prochaine = hasard(0.42, 0.75); etoiles.push({ x: hasard(24, W - 24), y: -20, v: hasard(150, 230), c: COULEURS[(Math.random() * 4) | 0], rot: hasard(0, 6), ph: hasard(0, 6) }); }
      cx.clearRect(0, 0, W, H);
      const yc = H - 48;
      for (let i = etoiles.length - 1; i >= 0; i--) {
        const e = etoiles[i]; e.y += e.v * dt; e.rot += dt * 2; const ex = e.x + Math.sin(t * 2 + e.ph) * 14;
        const gr = cx.createLinearGradient(ex, e.y - 50, ex, e.y); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, e.c);
        cx.globalAlpha = 0.5; cx.strokeStyle = gr; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(ex, e.y - 50); cx.lineTo(ex, e.y); cx.stroke();
        cx.globalAlpha = 0.35; cx.fillStyle = e.c; cx.beginPath(); cx.arc(ex, e.y, 20, 0, 6.283); cx.fill(); cx.globalAlpha = 1; etoile(ex, e.y, 11, e.rot);
        if (Math.hypot(ex - x, e.y - yc) < 38) {
          etoiles.splice(i, 1); pris++; maj(); Son.ton(440 * Math.pow(2, (pris % 8) / 6)); const r = cv.getBoundingClientRect(); Eclats.gerbe(r.left + ex, r.top + e.y, 16, 240);
          if (pris >= BUT) { fin = true; dire('Toutes attrapées !'); setTimeout(fini, 500); }
        } else if (e.y > H + 30) etoiles.splice(i, 1);
      }
      const pul = 1 + Math.sin(t * 6) * 0.06;
      cx.fillStyle = '#ff86dc'; cx.shadowColor = '#ff86dc'; cx.shadowBlur = 26; coeur(x, yc, 30 * pul); cx.shadowBlur = 0;
      cx.fillStyle = 'rgba(255,255,255,.55)'; coeur(x - 7, yc - 8, 7);
      raf = requestAnimationFrame(tour);
    }
    raf = requestAnimationFrame(tour);
    addEventListener('resize', dims);
    return () => { fin = true; cancelAnimationFrame(raf); removeEventListener('resize', dims); };
  }

  const EPREUVES = [
    { titre: 'Allumage', consigne: 'Touche l’anneau quand la lumière passe dans la zone dorée. Trois fois, pour allumer les moteurs.', bravo: 'Les moteurs sont allumés. Le voyage commence.', jeu: jeuAllumage },
    { titre: 'Les anneaux', consigne: 'Touche les anneaux pour les faire tourner, et aligne les trois points de lumière sous la flèche.', bravo: 'La lumière passe. Le cristal se met à briller.', jeu: jeuAnneaux },
    { titre: 'Échos de lumière', consigne: 'Regarde la suite de lumières, puis refais-la. Trois suites, de plus en plus longues.', bravo: 'Quelle mémoire ! Plus que deux.', jeu: jeuEchos },
    { titre: 'Nos souvenirs', consigne: 'Trois questions sur nous. Facile… normalement 😏', bravo: 'Tu n’as rien oublié ❤️', jeu: jeuSouvenirs },
    { titre: 'Pluie d’étoiles', consigne: 'Glisse ton doigt pour attraper 12 étoiles filantes avec le cœur.', bravo: 'Le dernier éclat est là. Le cristal est prêt.', jeu: jeuPluie },
  ];

  /* ================= déroulé ================= */
  const hud = $('#hud'), eclHud = [...document.querySelectorAll('.eclats-hud i')];
  let etape = 0, nettoyer = null, gagnerEnCours = null;
  const majHud = () => eclHud.forEach((e, i) => e.classList.toggle('on', i < etape));

  function lancerEpreuve(i) {
    const E = EPREUVES[i];
    aller($('#epreuve'), { warp: true, avant: () => {
      hud.hidden = false; cristalEn.petit(0.8);
      $('#ep-num').textContent = 'Épreuve ' + (i + 1) + ' / 5'; $('#ep-titre').textContent = E.titre; $('#ep-consigne').textContent = E.consigne; etatTxt.textContent = '';
      $('#jeu').innerHTML = '';
      if (nettoyer) { nettoyer(); nettoyer = null; }
    } }).then(() => {
      const jeu = $('#jeu'); let gagne = false;
      gagnerEnCours = () => { if (gagne) return; gagne = true; if (nettoyer) { nettoyer(); nettoyer = null; } reussite(i); };
      nettoyer = E.jeu(jeu, gagnerEnCours);
      gsap.fromTo(jeu.children, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.5)' });
    });
  }

  function reussite(i) {
    etape = i + 1; memo.ecrire({ etape }); majHud();
    Son.succes();
    const [x, y] = centreDe($('#jeu')); Eclats.gerbe(x, y, 70, 520);
    gsap.to(Cristal.U.uCharge, { value: etape / 5, duration: 1.4, ease: 'power2.out' });
    gsap.fromTo(Cristal.U.uFlash, { value: 0.8 }, { value: 0, duration: 1 });
    $('#bravo-titre').textContent = ['Bravo !', 'Trop forte !', 'Waouh !', 'Exactement ❤️', 'Incroyable !'][i];
    $('#bravo-texte').textContent = EPREUVES[i].bravo;
    $('#suivant span').textContent = etape >= 5 ? 'Ouvrir le cristal' : 'Épreuve suivante';
    setTimeout(() => aller($('#bravo'), { avant: () => { cristalEn.petit(0.4); gsap.fromTo('.eclat-gagne', { scale: 0, rotation: -90 }, { scale: 1, rotation: 0, duration: 0.9, ease: 'back.out(2)', delay: 0.15 }); } }), 650);
  }

  $('#suivant').addEventListener('click', () => { Son.init(); if (etape >= 5) ouvrirCristal(); else lancerEpreuve(etape); });

  function ouvrirCristal() {
    aller($('#ouvrir'), { warp: true, avant: () => { hud.hidden = false; cristalEn.centre(1.2); Cristal.etat.vit = 0.25; boite.classList.add('touchable'); } });
  }
  let coupsCristal = 0;
  boite.addEventListener('pointerdown', () => {
    if (!boite.classList.contains('touchable')) return;
    coupsCristal++; Son.craque(coupsCristal);
    const [x, y] = centreDe(boite); Eclats.gerbe(x, y, 18 + coupsCristal * 12, 300 + coupsCristal * 80);
    gsap.fromTo(Cristal.etat, { secousse: 0.05 + coupsCristal * 0.04 }, { secousse: 0, duration: 0.6 });
    gsap.fromTo(Cristal.U.uFlash, { value: 0.35 + coupsCristal * 0.15 }, { value: 0, duration: 0.5 });
    gsap.fromTo(boite, { scale: 1.08 + coupsCristal * 0.04 }, { scale: 1.08, duration: 0.5, ease: 'back.out(3)' });
    if (coupsCristal === 1) $('#ouvrir-texte').textContent = 'Il se fissure… encore !';
    if (coupsCristal === 2) $('#ouvrir-texte').textContent = 'Une dernière fois !';
    if (coupsCristal >= 3) { boite.classList.remove('touchable'); eclater(); }
  });

  function eclater() {
    Son.eclat();
    const [x, y] = centreDe(boite);
    const tl = gsap.timeline();
    tl.to(Cristal.U.uFlash, { value: 1.4, duration: 0.25, ease: 'power2.in' })
      .add(() => { Eclats.gerbe(x, y, 160, 900, 200); Eclats.gerbe(x, y, 80, 500, 60); }, 0.25)
      .to('#flash', { opacity: 1, duration: 0.18 }, 0.25)
      .to(Cristal.U.uExplose, { value: 1, duration: 1.8, ease: 'expo.out' }, 0.25)
      .to(Cristal.U.uFlash, { value: 0, duration: 0.8 }, 0.4)
      .to('#flash', { opacity: 0, duration: 1.2, ease: 'power2.out' }, 0.5)
      .add(() => { memo.ecrire({ etape: 5, ouvert: true }); montrerCadeau(); }, 0.9)
      .to(boite, { opacity: 0, duration: 0.6 }, 1.6);
  }

  function montrerCadeau() {
    hud.hidden = true;
    aller($('#cadeau'), { avant: () => {
      gsap.fromTo('#billet', { rotationX: 55, y: 80, scale: 0.7, opacity: 0 }, { rotationX: 0, y: 0, scale: 1, opacity: 1, duration: 1.4, ease: 'expo.out', delay: 0.2 });
      Eclats.pluie(LEGER.on ? 40 : 80); setTimeout(() => Eclats.pluie(LEGER.on ? 25 : 50), 1400);
      Son.succes();
    } });
  }

  // billet : il bouge avec le doigt / le téléphone, le reflet holographique suit
  const billet = $('#billet');
  function pencher(px, py) { gsap.to(billet, { rotationY: (px - 0.5) * 22, rotationX: -(py - 0.5) * 16, duration: 0.6, ease: 'power2.out' }); billet.style.setProperty('--rx', (px * 100).toFixed(1) + '%'); billet.style.setProperty('--ry', (py * 100).toFixed(1) + '%'); }
  $('.billet-scene').addEventListener('pointermove', (e) => { const r = billet.getBoundingClientRect(); pencher((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height); });
  $('.billet-scene').addEventListener('pointerleave', () => pencher(0.5, 0.5));
  addEventListener('deviceorientation', (e) => { if (actuel !== $('#cadeau') || e.gamma == null) return; pencher(0.5 + Math.max(-0.5, Math.min(0.5, e.gamma / 40)), 0.5 + Math.max(-0.5, Math.min(0.5, (e.beta - 45) / 40))); });
  if (!LEGER.on) gsap.to('.billet-scene', { y: -8, duration: 2.4, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  $('#voir').addEventListener('click', () => { const g = $('#grand'); g.hidden = false; gsap.fromTo(g, { opacity: 0 }, { opacity: 1, duration: 0.3 }); gsap.fromTo('#grand img', { scale: 0.85 }, { scale: 1, duration: 0.5, ease: 'back.out(1.6)' }); });
  $('#grand').addEventListener('click', () => { $('#grand').hidden = true; });
  $('#rejouer').addEventListener('click', () => {
    memo.ecrire({}); etape = 0; coupsCristal = 0; entreeFaite = false; majHud(); $('#porte-txt').textContent = texteBase(); $('#partir').textContent = 'ou touche ici'; $('#ouvrir-texte').textContent = 'Touche-le trois fois pour l’ouvrir.';
    Cristal.U.uExplose.value = 0; Cristal.U.uCharge.value = 0; Cristal.etat.vit = 0.4; gsap.set(boite, { opacity: 1 });
    aller($('#accueil'), { warp: true, avant: () => { hud.hidden = true; cristalEn.accueil(1); } });
  });

  $('#son').addEventListener('click', () => { const on = Son.basculer(); $('#son').classList.toggle('coupe', !on); });

  /* ================= départ ================= */
  const sauve = memo.lire();
  const demarrer = () => { Son.init(); if (etape >= 5) ouvrirCristal(); else lancerEpreuve(etape); };
  $('#partir').addEventListener('click', demarrer);

  /* l'entrée : un trait-guide dessine un cœur en boucle ; elle le refait du doigt */
  const guide = $('#indice-coeur'), pointG = $('#indice-point'), LG = guide.getTotalLength();
  gsap.set(guide, { strokeDasharray: LG, strokeDashoffset: LG });
  const suivreGuide = () => { const pr = 1 - gsap.getProperty(guide, 'strokeDashoffset') / LG; const q = guide.getPointAtLength(Math.max(0, Math.min(1, pr)) * LG); pointG.setAttribute('cx', q.x); pointG.setAttribute('cy', q.y); };
  gsap.timeline({ repeat: -1, repeatDelay: 0.5 })
    .to(guide, { strokeDashoffset: 0, duration: 2.1, ease: 'power1.inOut', onUpdate: suivreGuide })
    .to([guide, pointG], { opacity: 0, duration: 0.45 }, '+=0.35').set(guide, { strokeDashoffset: LG }).set([guide, pointG], { opacity: 1 });
  const porteTxt = $('#porte-txt'), texteBase = () => (etape > 0 && etape < 5 ? 'Dessine un cœur pour reprendre' : etape >= 5 ? 'Dessine un cœur pour ouvrir le cristal' : 'Dessine un cœur pour commencer');
  let pts = null, entreeFaite = false;
  addEventListener('pointerdown', (e) => {
    if (actuel !== $('#accueil') || entreeFaite || e.target.closest('button')) return;
    Son.init(); pts = [[e.clientX, e.clientY]]; gsap.killTweensOf(trace); trace.style.opacity = 1; tx.clearRect(0, 0, innerWidth, innerHeight);
  });
  addEventListener('pointermove', (e) => {
    if (!pts) return; const [px, py] = pts[pts.length - 1]; pts.push([e.clientX, e.clientY]);
    const g = tx.createLinearGradient(px, py, e.clientX, e.clientY); g.addColorStop(0, '#b5f4ff'); g.addColorStop(1, '#ff9fe0');
    tx.lineCap = 'round'; tx.strokeStyle = 'rgba(200, 182, 255, .22)'; tx.lineWidth = 16; tx.beginPath(); tx.moveTo(px, py); tx.lineTo(e.clientX, e.clientY); tx.stroke();
    tx.strokeStyle = g; tx.lineWidth = 4.5; tx.beginPath(); tx.moveTo(px, py); tx.lineTo(e.clientX, e.clientY); tx.stroke();
    if (pts.length % 4 === 0) Son.tic(600 + Math.min(900, pts.length * 4));
  });
  const finTrace = () => {
    if (!pts) return; const p = pts; pts = null;
    let L = 0, x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    p.forEach(([x, y], i) => { if (i) L += Math.hypot(x - p[i - 1][0], y - p[i - 1][1]); x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); });
    const taille = Math.max(x1 - x0, y1 - y0), ferme = Math.hypot(p[0][0] - p[p.length - 1][0], p[0][1] - p[p.length - 1][1]) < taille * 0.38;
    if (p.length > 8 && L > 220 && taille > 80 && ferme) {
      entreeFaite = true; Son.succes();
      const [cx, cy] = centreDe(boite);
      for (let k = 0; k < p.length; k += Math.max(1, Math.floor(p.length / 40))) { const [x, y] = p[k];
        Eclats.ps.push({ x, y, vx: (cx - x) * 2.2, vy: (cy - y) * 2.2, g: 0, vie: 1, dv: 1.1, r: hasard(1.8, 3.4), c: COULEURS[(Math.random() * 5) | 0], forme: 'losange', rot: hasard(0, 6), vr: hasard(-6, 6) }); }
      gsap.fromTo(Cristal.U.uFlash, { value: 0.9 }, { value: 0, duration: 1.1 }); gsap.to(trace, { opacity: 0, duration: 0.7, delay: 0.15 });
      porteTxt.textContent = 'Parfait ❤️'; setTimeout(demarrer, 950);
    } else {
      Son.erreur(); gsap.to(trace, { opacity: 0, duration: 0.6 });
      porteTxt.textContent = L < 220 ? 'Dessine un peu plus grand ✨' : 'Presque ! Referme bien ton cœur';
      setTimeout(() => { porteTxt.textContent = texteBase(); }, 2200);
    }
  };
  addEventListener('pointerup', finTrace); addEventListener('pointercancel', finTrace);
  if (sauve.ouvert) {
    etape = 5; majHud(); Cristal.U.uExplose.value = 1; gsap.set(boite, { opacity: 0 }); actuel = null; ecrans.forEach((e) => { e.hidden = true; }); montrerCadeau();
  } else {
    etape = Math.min(5, sauve.etape || 0); majHud(); Cristal.U.uCharge.value = etape / 5;
    $('#porte-txt').textContent = texteBase(); if (etape > 0 && etape < 5) $('#partir').textContent = 'ou touche ici · épreuve ' + (etape + 1) + ' / 5';
    ecrans.forEach((e) => { e.hidden = true; });
    gsap.fromTo(boite, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.8, ease: 'expo.out' });
    aller($('#accueil'));
  }

  // pour les tests automatiques
  window.__kim = { gagner: () => gagnerEnCours && gagnerEnCours(), etape: () => etape };
})();
