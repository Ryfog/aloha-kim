// Monuments « pop-up » qui se dressent sur le plan (dessinés à la main, en SVG)
window.DECOR = {
chateau: { l: 210, h: 250, svg: `<svg viewBox="0 0 210 250" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="dcRose" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd3e2"/><stop offset="1" stop-color="#d77fa3"/></linearGradient>
<linearGradient id="dcBleu" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5b8cff"/><stop offset=".55" stop-color="#3a5fd0"/><stop offset="1" stop-color="#26409a"/></linearGradient>
<radialGradient id="dcHalo" cx=".5" cy=".7" r=".6"><stop offset="0" stop-color="#ffd38a" stop-opacity=".55"/><stop offset="1" stop-color="#ff9fc6" stop-opacity="0"/></radialGradient></defs>
<ellipse cx="105" cy="180" rx="110" ry="90" fill="url(#dcHalo)"/>
<path d="M18 250 V196 h18 V186 h16 V250 Z M158 250 V186 h16 V196 h18 V250Z" fill="url(#dcRose)"/>
<path d="M14 198 L27 160 L40 198Z M170 198 L183 160 L196 198Z" fill="url(#dcBleu)"/>
<rect x="36" y="168" width="138" height="82" fill="url(#dcRose)"/>
<path d="M36 168 h12 v-8 h10 v8 h12 v-8 h10 v8 h12 v-8 h10 v8 h12 v-8 h10 v8 h12 v-8 h10 v8 h8" fill="none" stroke="#c76f95" stroke-width="2"/>
<rect x="50" y="110" width="22" height="140" fill="url(#dcRose)"/><rect x="138" y="110" width="22" height="140" fill="url(#dcRose)"/>
<path d="M46 112 L61 40 L76 112Z M134 112 L149 40 L164 112Z" fill="url(#dcBleu)"/>
<rect x="84" y="88" width="42" height="162" fill="url(#dcRose)"/>
<path d="M80 92 L105 0 L130 92Z" fill="url(#dcBleu)"/>
<path d="M72 128 L80 104 L88 128Z M122 128 L130 104 L138 128Z" fill="url(#dcBleu)"/>
<rect x="74" y="126" width="12" height="60" fill="url(#dcRose)"/><rect x="124" y="126" width="12" height="60" fill="url(#dcRose)"/>
<circle cx="105" cy="2" r="3" fill="#ffd36b"/><circle cx="61" cy="42" r="2.5" fill="#ffd36b"/><circle cx="149" cy="42" r="2.5" fill="#ffd36b"/>
<path d="M105 2 v-2 l10 4 -10 4Z" fill="#ffd36b"/>
<path d="M88 250 V214 a17 17 0 0 1 34 0 V250Z" fill="#3a1d3a"/><path d="M93 250 V216 a12 12 0 0 1 24 0 V250Z" fill="#ffcf7a" opacity=".85"/>
<g fill="#fff1b8"><rect x="99" y="120" width="12" height="18" rx="6"/><rect x="58" y="150" width="6" height="10" rx="3"/><rect x="146" y="150" width="6" height="10" rx="3"/><rect x="99" y="160" width="12" height="16" rx="6"/><rect x="56" y="196" width="8" height="12" rx="4"/><rect x="146" y="196" width="8" height="12" rx="4"/><rect x="77" y="146" width="6" height="9" rx="3"/><rect x="127" y="146" width="6" height="9" rx="3"/></g>
<path d="M84 88 h42 M50 110 h22 M138 110 h22" stroke="#ffd36b" stroke-width="3"/>
</svg>` },
btm: { l: 230, h: 165, svg: `<svg viewBox="0 0 230 165" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="dbR" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff9a5a"/><stop offset=".5" stop-color="#c8502a"/><stop offset="1" stop-color="#7a2a16"/></linearGradient></defs>
<path d="M0 165 L18 120 L30 128 L44 70 L56 82 L66 30 L80 48 L88 8 L100 40 L108 26 L120 70 L132 58 L144 96 L158 64 L170 88 L182 50 L196 92 L210 110 L230 165Z" fill="url(#dbR)"/>
<path d="M44 70 L50 160 M66 30 L74 160 M88 8 L92 160 M120 70 L118 160 M158 64 L152 160 M182 50 L176 160" stroke="#5a1c0e" stroke-width="2" opacity=".45"/>
<path d="M10 140 Q60 120 100 136 T200 128" fill="none" stroke="#e8c58a" stroke-width="3" stroke-dasharray="6 4"/>
<path d="M30 112 h28 l6 -6 h-40Z" fill="#3a2a22"/><circle cx="34" cy="114" r="3" fill="#ffd36b"/>
<path d="M66 30 L80 48 L88 8 L92 30 L80 60Z" fill="#ffd0a0" opacity=".35"/>
</svg>` },
manoir: { l: 120, h: 112, svg: `<svg viewBox="0 0 120 112" xmlns="http://www.w3.org/2000/svg">
<path d="M10 112 V60 h100 v52Z" fill="#3b2f4f"/><path d="M4 62 L30 30 L56 62Z M64 62 L90 30 L116 62Z" fill="#241a33"/>
<rect x="44" y="20" width="32" height="92" fill="#43355a"/><path d="M40 22 L60 0 L80 22Z" fill="#241a33"/>
<g fill="#9cff9c" opacity=".85"><rect x="54" y="34" width="12" height="16" rx="6"/></g>
<g fill="#ffd78a"><rect x="20" y="72" width="10" height="14"/><rect x="90" y="72" width="10" height="14"/><rect x="54" y="66" width="12" height="16"/><rect x="20" y="94" width="10" height="12"/></g>
<path d="M0 112 h120" stroke="#6b5a8a" stroke-width="3"/>
</svg>` },
space: { l: 190, h: 135, svg: `<svg viewBox="0 0 190 135" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="dsC" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a3e1a"/><stop offset=".4" stop-color="#e09a54"/><stop offset=".7" stop-color="#b8682e"/><stop offset="1" stop-color="#5a2a10"/></linearGradient></defs>
<path d="M120 60 L186 8 L190 18 L128 74Z" fill="#8a8f9e"/><circle cx="187" cy="12" r="6" fill="#c7ccd8"/>
<path d="M14 135 C14 40 156 40 156 135Z" fill="url(#dsC)"/>
<path d="M22 112 C40 70 130 70 148 112 M32 90 C55 62 115 62 138 90 M50 72 C70 58 100 58 120 72" fill="none" stroke="#5a2a10" stroke-width="2.5" opacity=".6"/>
<path d="M85 46 V135 M50 60 L36 135 M120 60 L134 135" stroke="#ffd6a0" stroke-width="1.5" opacity=".35"/>
<rect x="8" y="128" width="154" height="7" fill="#3a2a22"/>
<g fill="#7fd3ff"><circle cx="60" cy="118" r="2.5"/><circle cx="85" cy="114" r="2.5"/><circle cx="110" cy="118" r="2.5"/></g>
</svg>` },
tour: { l: 100, h: 240, svg: `<svg viewBox="0 0 100 240" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="dtT" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b5745e"/><stop offset=".5" stop-color="#e2a98e"/><stop offset="1" stop-color="#8a5240"/></linearGradient></defs>
<rect x="18" y="34" width="64" height="206" fill="url(#dtT)"/><rect x="26" y="18" width="48" height="20" fill="url(#dtT)"/><rect x="38" y="4" width="24" height="16" fill="url(#dtT)"/>
<path d="M18 34 h64 M26 18 h48" stroke="#5a3428" stroke-width="2"/>
<g fill="#2a1a22">${Array.from({ length: 10 }, (_, i) => `<rect x="28" y="${50 + i * 17}" width="10" height="8"/><rect x="45" y="${50 + i * 17}" width="10" height="8"/><rect x="62" y="${50 + i * 17}" width="10" height="8"/>`).join('')}</g>
<g fill="#ffd36b"><rect x="45" y="84" width="10" height="8"/><rect x="28" y="152" width="10" height="8"/><rect x="62" y="118" width="10" height="8"/></g>
<rect x="30" y="40" width="40" height="8" fill="#ffcf7a" opacity=".85"/>
<path d="M0 240 h100" stroke="#3a2a22" stroke-width="4"/>
</svg>` },
chapeau: { l: 130, h: 170, svg: `<svg viewBox="0 0 130 170" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="dhB" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1e3a9a"/><stop offset=".5" stop-color="#3f6ae0"/><stop offset="1" stop-color="#18307a"/></linearGradient></defs>
<path d="M20 150 C30 90 60 60 70 0 C86 40 106 60 112 150Z" fill="url(#dhB)"/>
<ellipse cx="66" cy="152" rx="64" ry="16" fill="#18307a"/><ellipse cx="66" cy="148" rx="60" ry="12" fill="#2f55c8"/>
<g fill="#ffe08a"><path d="M60 60 l3 7 7 1 -5 5 1 7 -6 -4 -6 4 1 -7 -5 -5 7 -1Z"/><path d="M84 104 l2 5 5 1 -4 3 1 5 -4 -3 -4 3 1 -5 -4 -3 5 -1Z"/><path d="M44 112 l2 5 5 1 -4 3 1 5 -4 -3 -4 3 1 -5 -4 -3 5 -1Z"/></g>
<path d="M86 66 a12 12 0 1 0 6 18 a9 9 0 1 1 -6 -18Z" fill="#ffe08a"/>
</svg>` },
glace: { l: 300, h: 220, svg: `<svg viewBox="0 0 300 220" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="dgM" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4fbff"/><stop offset="1" stop-color="#7fb4e8"/></linearGradient>
<linearGradient id="dgP" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8fbff"/><stop offset=".5" stop-color="#8fe3ff"/><stop offset="1" stop-color="#4a9be0"/></linearGradient>
<radialGradient id="dgH" cx=".5" cy=".45" r=".5"><stop offset="0" stop-color="#9fe8ff" stop-opacity=".6"/><stop offset="1" stop-color="#9fe8ff" stop-opacity="0"/></radialGradient></defs>
<ellipse cx="150" cy="100" rx="150" ry="100" fill="url(#dgH)"/>
<path d="M0 220 L60 110 L90 140 L150 40 L200 120 L230 90 L300 220Z" fill="url(#dgM)"/>
<path d="M150 40 L170 80 L160 76 L150 92 L140 74 L132 80Z M60 110 L72 130 L60 126 L52 134Z" fill="#fff"/>
<g fill="url(#dgP)" stroke="#e8fbff" stroke-width="1.2"><path d="M140 150 L150 10 L160 150Z"/><path d="M118 160 L128 62 L138 160Z"/><path d="M162 160 L172 62 L182 160Z"/><path d="M100 172 L108 100 L116 172Z"/><path d="M184 172 L192 100 L200 172Z"/></g>
<path d="M96 172 h108 v12 h-108Z" fill="#bfe9ff"/>
<path d="M150 10 L150 150" stroke="#fff" stroke-width="1.5" opacity=".7"/>
</svg>` },
arendelle: { l: 140, h: 120, svg: `<svg viewBox="0 0 140 120" xmlns="http://www.w3.org/2000/svg">
<rect x="14" y="58" width="112" height="62" fill="#e9dcc2"/><rect x="54" y="30" width="32" height="90" fill="#efe3cb"/>
<path d="M50 32 L70 0 L90 32Z" fill="#3f9a6a"/><path d="M10 60 L30 34 L50 60Z M90 60 L110 34 L130 60Z" fill="#3f9a6a"/>
<g fill="#ffd36b"><rect x="64" y="44" width="12" height="16" rx="6"/><rect x="24" y="74" width="8" height="12"/><rect x="108" y="74" width="8" height="12"/><rect x="40" y="80" width="8" height="12"/><rect x="92" y="80" width="8" height="12"/></g>
<path d="M58 120 V98 a12 12 0 0 1 24 0 V120Z" fill="#5a3a2a"/>
<path d="M70 0 v-6 l8 3Z" fill="#d9534f"/>
</svg>` },
avengers: { l: 180, h: 120, svg: `<svg viewBox="0 0 180 120" xmlns="http://www.w3.org/2000/svg">
<rect x="10" y="46" width="160" height="74" fill="#59627a"/><rect x="10" y="46" width="160" height="10" fill="#8a95ad"/>
<rect x="20" y="66" width="140" height="8" fill="#7fd3ff" opacity=".8"/><rect x="20" y="86" width="140" height="6" fill="#c0392b" opacity=".85"/>
<path d="M40 40 L90 26 L140 40 L118 44 L90 38 L62 44Z" fill="#c9cfdc"/><path d="M84 30 h12 l4 12 h-20Z" fill="#7fd3ff"/>
<circle cx="90" cy="106" r="9" fill="none" stroke="#fff" stroke-width="2.5"/><path d="M86 112 L90 100 L94 112 M87 108 h6" stroke="#fff" stroke-width="2" fill="none"/>
</svg>` },
};
