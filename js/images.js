/* images.js — visuels procéduraux SVG des bulletins.
   Tant que data.annonce.image est vide, chaque bulletin reçoit une
   illustration sombre cohérente avec l'univers (reflets bleu/or).
   Quand `image` contient un nom de fichier, les pages l'utilisent. */

const PAL = [
  ['#86f2ff', '#3a8cff'],
  ['#3a8cff', '#0d1f7a'],
  ['#86f2ff', '#0d1f7a'],
  ['#fff4c8', '#ffb84d'],
  ['#ffb84d', '#e65c0a'],
  ['#86f2ff', '#e65c0a']
];

function hash(s){ let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }

/* Glyphe stylisé par catégorie, tracé fin, clair sur le fond sombre */
const GLYPHS = {
  'Disparitions': '<path d="M208 150 V120 l-28-30 H120 v150 h92 v-60" fill="none"/><path d="M120 150 h88 M120 178 h88 M120 205 h88" opacity=".5"/>',
  'Affaires non résolues': '<path d="M150 90 h110 v120 H150 z" fill="none"/><path d="M152 106 h106 M152 132 h86 M152 158 h96" opacity=".5"/><circle cx="192" cy="180" r="18" fill="none" opacity=".55"/>',
  'Lieux maudits': '<path d="M150 190 v-46 l28-34 28 34 v46 H134 M206 150 v-20 h14 v20" fill="none"/>',
  'Objets troublants': '<circle cx="196" cy="150" r="40" fill="none"/><path d="M196 110 v-30 M196 190 v30 M156 150 h-26 M236 150 h26 M174 128 l-16-16 M218 172 l16 16 M174 172 l-16 16 M218 128 l16-16" opacity=".6"/>',
  'Phénomènes nocturnes': '<path d="M120 140 q20-12 40 0 t40 0 t40 0" fill="none"/><path d="M120 165 q20-12 40 0 t40 0 t40 0" fill="none" opacity=".55"/><path d="M120 190 q20-12 40 0 t40 0 t40 0" fill="none" opacity=".3"/>',
  'Apparitions & créatures': '<circle cx="196" cy="118" r="16" fill="none"/><path d="M172 136 h48 v66 h-48 z" fill="none"/>',
  'Témoignages & écrits': '<path d="M150 108 h100 M150 132 h76 M150 156 h88 M150 180 h64" opacity=".6"/><path d="M258 104 l-26 26-9 2 2-9 26-26z m-20 32 -9 2 2-9" fill="none"/>',
  'Présages & signes': '<path d="M300 96 l-26 30-26-30 M300 138 l-26 30-26-30 M300 180 l-26 30-26-30" fill="none"/>'
};

function scene(annonce, variant){
  const seed = hash(annonce.titre + annonce.id) + variant * 997;
  const [c1, c2] = PAL[seed % PAL.length];
  const flip = variant % 2 ? 1 : -1;
  const a1 = 20 + (seed % 40);
  const g = GLYPHS[annonce.categorie] || GLYPHS['Objets troublants'];
  const star = '<polygon points="196,96 202,126 232,122 209,142 228,170 199,155 190,184 186,152 159,167 176,140 154,120 183,126" fill="none" stroke-linejoin="round"/>';
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#2a2140"/><stop offset=".55" stop-color="#150f22"/><stop offset="1" stop-color="#07050c"/>
        </linearGradient>
        <radialGradient id="gl" cx="${40 + (seed % 52)}%" cy="26%" r="75%">
          <stop offset="0" stop-color="${c1}" stop-opacity=".42"/><stop offset=".5" stop-color="${c1}" stop-opacity=".13"/><stop offset="1" stop-color="${c1}" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="400" height="300" fill="url(#sky)"/>
      <rect width="400" height="300" fill="url(#gl)"/>
      <path d="M0 ${208 + (seed % 22)} C 90 ${196 + (seed % 26)} 310 ${214 + (seed % 24)} 400 ${200 + (seed % 20)}" stroke="${c1}" stroke-opacity=".6" stroke-width="1.1" fill="none"/>
      <path d="M0 ${238 + (seed % 16)} C 120 ${230} 280 ${246} 400 ${234}" stroke="${c2}" stroke-opacity=".5" stroke-width=".9" fill="none"/>
      <g transform="translate(${(seed % 60) - 30} ${(seed % 36) - 18})">
        <circle cx="150" cy="150" r="120" fill="none" stroke="${c1}" stroke-opacity=".2" stroke-width="1"/>
        <ellipse cx="150" cy="150" rx="120" ry="108" fill="none" stroke="${c2}" stroke-opacity=".15" stroke-width="1" stroke-dasharray="2 7"/>
        <g transform="rotate(${a1} 150 150)" fill="none" stroke="#f5f0e9" stroke-opacity=".13">
          <path d="M150 96 v-60 M150 204 v60 M96 150 H36 M204 150 h60"/>
          <circle cx="150" cy="150" r="112" stroke-opacity=".09"/>
        </g>
      </g>
      <g transform="translate(140 -18) scale(.85)" fill="none" stroke="${c1}" stroke-opacity="${variant ? '.45' : '.6'}" stroke-width="1">${star}</g>
      <g transform="translate(24 -12)" stroke="#f5f0e9" stroke-opacity="${variant % 2 ? '.22' : '.3'}" stroke-width="1.3" fill="none">${g}</g>
      <path d="M0 294 C 90 284 310 288 400 294 L400 300 L0 300 Z" fill="#050407" fill-opacity=".55"/>
      <g transform="translate(306 ${-40 + flip * 0}) rotate(${flip * 14} 34 180)" opacity=".8">
        <path d="M8 268 h-6 M8 250 v18 M4 258 h8" stroke="${c2}" stroke-opacity=".55" stroke-linecap="round"/>
      </g>
    </svg>`
  )}`;
}

/* URL de fond (data:) d'un bulletin ; variante 0..2 pour la galerie. */
export function bg(annonce, variant = 0){
  if (annonce.image) return `url(./assets/${annonce.image})`;
  return `url("${scene(annonce, variant)}")`;
}