/** Soft still-life illustrations used as product images until real photos are added. */
export type Kind = "jar" | "vessel" | "pillar" | "float" | "gift" | "material" | "hero" | "mood";

function rng(seed: number) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const hsl = (h: number, s: number, l: number, a = 1) => `hsl(${((h % 360) + 360) % 360},${s}%,${l}%,${a})`;

const flame = (x: number, y: number, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
<circle cy="-18" r="64" fill="url(#glow)"/>
<path d="M0 -46 C16 -22 15 -2 0 6 C-15 -2 -16 -22 0 -46Z" fill="url(#fl)"/>
<path d="M0 -22 C7 -12 6 -2 0 2 C-6 -2 -7 -12 0 -22Z" fill="#fff6d6" opacity=".9"/></g><path d="M${x} ${y + 4} L${x} ${y + 22}" stroke="#3b2f2a" stroke-width="3" stroke-linecap="round"/>`;

function jar(h: number, r: () => number) {
  const wax = hsl(h, 50, 88), glass = hsl(h, 30, 96, 0.55);
  return `<ellipse cx="400" cy="572" rx="170" ry="20" fill="#000" opacity=".12" filter="url(#b)"/>
<rect x="282" y="372" width="236" height="200" rx="30" fill="${wax}"/>
<rect x="282" y="372" width="236" height="200" rx="30" fill="url(#shade)"/>
<ellipse cx="400" cy="376" rx="118" ry="16" fill="${hsl(h, 45, 94)}"/>
<ellipse cx="400" cy="378" rx="30" ry="6" fill="${hsl(h, 40, 78)}"/>
<rect x="278" y="366" width="244" height="212" rx="34" fill="${glass}" stroke="#fff" stroke-opacity=".7" stroke-width="3"/>
<rect x="300" y="390" width="14" height="150" rx="7" fill="#fff" opacity=".55"/>
<rect x="336" y="440" width="128" height="86" rx="8" fill="#fff" opacity=".85"/>
<rect x="352" y="460" width="96" height="6" rx="3" fill="${hsl(h, 35, 45)}" opacity=".7"/>
<rect x="366" y="476" width="68" height="4" rx="2" fill="${hsl(h, 20, 50)}" opacity=".5"/>
<rect x="374" y="490" width="52" height="4" rx="2" fill="${hsl(h, 20, 50)}" opacity=".35"/>
${flame(400, 340, 1)}
<path d="M560 575 q40 -90 20 -150 q-30 70 -20 150Z" fill="${hsl(120, 25, 62)}" opacity=".7"/><path d="M590 575 q30 -60 60 -85 q-20 70 -60 85Z" fill="${hsl(120, 25, 55)}" opacity=".6"/>`;
}

function vessel(h: number, r: () => number) {
  const stone = hsl(h, 12, 82);
  let dots = "";
  for (let i = 0; i < 46; i++) {
    const x = 290 + r() * 220, y = 410 + r() * 160, s = 3 + r() * 9;
    dots += `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${s.toFixed(1)}" ry="${(s * (0.6 + r() * 0.5)).toFixed(1)}" transform="rotate(${(r() * 180).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})" fill="${[hsl(h, 30, 55), hsl(h + 40, 35, 68), "#fff", hsl(h, 8, 50), hsl(h + 180, 25, 72)][i % 5]}" opacity=".85"/>`;
  }
  return `<ellipse cx="400" cy="574" rx="190" ry="20" fill="#000" opacity=".14" filter="url(#b)"/>
<clipPath id="vc"><path d="M270 408 Q268 566 300 572 L500 572 Q532 566 530 408 Z"/></clipPath>
<path d="M270 408 Q268 566 300 572 L500 572 Q532 566 530 408 Z" fill="${stone}"/>
<g clip-path="url(#vc)">${dots}<rect x="270" y="408" width="260" height="170" fill="url(#shade)"/></g>
<ellipse cx="400" cy="408" rx="130" ry="20" fill="${hsl(h, 12, 90)}"/>
<ellipse cx="400" cy="410" rx="106" ry="14" fill="${hsl(h, 45, 90)}"/>
<ellipse cx="400" cy="412" rx="26" ry="5" fill="${hsl(h, 35, 72)}"/>
${flame(400, 370, 1)}`;
}

function pillar(h: number, r: () => number) {
  const P = [[300, 440, 70, 130], [400, 340, 84, 230], [500, 400, 72, 170]];
  return `<ellipse cx="400" cy="574" rx="220" ry="20" fill="#000" opacity=".13" filter="url(#b)"/>` + P.map(([x, y, w, hgt], i) => {
    const c = hsl(h + i * 14, 40, 90 - i * 3), x0 = x - w / 2;
    return `<g><rect x="${x0}" y="${y}" width="${w}" height="${hgt}" rx="10" fill="${c}"/><rect x="${x0}" y="${y}" width="${w}" height="${hgt}" rx="10" fill="url(#shade)"/>
<ellipse cx="${x}" cy="${y + 2}" rx="${w / 2 - 3}" ry="9" fill="${hsl(h + i * 14, 40, 95)}"/><rect x="${x0 + 8}" y="${y + 14}" width="8" height="${hgt - 30}" rx="4" fill="#fff" opacity=".35"/>
<path d="M${x0 + w * 0.62} ${y + 6} v${26 + r() * 30} q0 7 -7 0 v-${26}" fill="${hsl(h + i * 14, 45, 95)}"/>${flame(x, y - 4, 0.8 + i * 0.05)}</g>`;
  }).join("");
}

function float(h: number, r: () => number) {
  let petals = "";
  for (let i = 0; i < 16; i++) { const x = 250 + r() * 300, y = 470 + r() * 60; petals += `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${(14 + r() * 8).toFixed(0)}" ry="8" transform="rotate(${(r() * 180).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})" fill="${hsl(350 + r() * 20, 65, 82 - r() * 12)}" opacity=".9"/>`; }
  const c = [[330, 505], [420, 520], [490, 490]].map(([x, y]) => `<ellipse cx="${x}" cy="${y + 4}" rx="34" ry="9" fill="#000" opacity=".1"/><path d="M${x - 30} ${y - 18} h60 l-6 24 q-24 8 -48 0Z" fill="${hsl(h, 40, 94)}"/><ellipse cx="${x}" cy="${y - 18}" rx="30" ry="7" fill="${hsl(h, 40, 98)}"/>${flame(x, y - 22, 0.42)}`).join("");
  return `<ellipse cx="400" cy="585" rx="260" ry="24" fill="#000" opacity=".12" filter="url(#b)"/>
<path d="M190 440 Q200 600 400 604 Q600 600 610 440Z" fill="${hsl(h + 150, 35, 96, 0.7)}" stroke="#fff" stroke-width="3"/>
<ellipse cx="400" cy="440" rx="210" ry="40" fill="${hsl(200, 55, 88)}"/><ellipse cx="400" cy="446" rx="196" ry="32" fill="${hsl(200, 60, 94)}"/>${petals}${c}
<path d="M200 450 Q210 580 300 596" stroke="#fff" stroke-width="6" fill="none" opacity=".5" stroke-linecap="round"/>`;
}

function gift(h: number, r: () => number) {
  const box = hsl(h, 45, 82), lid = hsl(h, 45, 74), rib = hsl(h + 160, 40, 94);
  return `<ellipse cx="400" cy="578" rx="230" ry="22" fill="#000" opacity=".14" filter="url(#b)"/>
<rect x="230" y="420" width="340" height="150" rx="10" fill="${box}"/><rect x="230" y="420" width="340" height="150" rx="10" fill="url(#shade)"/>
<rect x="216" y="384" width="368" height="56" rx="10" fill="${lid}"/>
<rect x="378" y="384" width="44" height="186" fill="${rib}"/>
<path d="M400 384 C340 320 290 350 330 384Z M400 384 C460 320 510 350 470 384Z" fill="${rib}" stroke="${hsl(h + 160, 30, 84)}" stroke-width="2"/><circle cx="400" cy="382" r="14" fill="${hsl(h + 160, 30, 88)}"/>
<g transform="translate(640 0)"><rect x="-50" y="470" width="96" height="100" rx="16" fill="${hsl(h + 30, 50, 90)}"/><rect x="-54" y="466" width="104" height="108" rx="20" fill="#fff" opacity=".4" stroke="#fff"/>${flame(-2, 450, 0.6)}</g>`;
}

function material(h: number, r: () => number) {
  const pot = (x: number, c: number, w = 96, hh = 120) => `<rect x="${x}" y="${572 - hh}" width="${w}" height="${hh}" rx="14" fill="${hsl(c, 20, 94)}" stroke="#fff" stroke-width="3"/><rect x="${x - 2}" y="${572 - hh - 22}" width="${w + 4}" height="26" rx="8" fill="${hsl(c, 30, 40)}"/><rect x="${x + 12}" y="${572 - hh + 34}" width="${w - 24}" height="${hh - 60}" rx="8" fill="${hsl(c, 55, 68)}"/><rect x="${x + 20}" y="${572 - hh + 14}" width="8" height="${hh - 30}" rx="4" fill="#fff" opacity=".5"/>`;
  return `<ellipse cx="400" cy="578" rx="260" ry="22" fill="#000" opacity=".13" filter="url(#b)"/>
<path d="M250 572 Q320 420 400 440 Q480 420 550 572Z" fill="${hsl(40, 15, 96)}"/><path d="M250 572 Q320 420 400 440 Q480 420 550 572Z" fill="url(#shade)"/>
<path d="M300 572 Q360 480 400 490 Q440 480 500 572Z" fill="#fff" opacity=".6"/>
${pot(160, h, 84, 100)}${pot(560, h + 120, 84, 130)}${pot(640, h + 220, 70, 90)}`;
}

function mood(h: number, r: () => number) {
  return `<rect x="560" y="80" width="150" height="300" rx="8" fill="#fff" opacity=".35"/><path d="M560 230h150M635 80v300" stroke="#fff" stroke-width="5" opacity=".5"/>
<ellipse cx="400" cy="580" rx="280" ry="24" fill="#000" opacity=".13" filter="url(#b)"/>
<rect x="160" y="556" width="480" height="22" rx="11" fill="${hsl(h, 25, 70)}"/>
<path d="M210 556 q-30 -120 10 -210 q22 90 -10 210Z" fill="${hsl(125, 28, 60)}" opacity=".75"/><path d="M240 556 q50 -90 70 -190 q-60 60 -70 190Z" fill="${hsl(125, 28, 52)}" opacity=".7"/>
<g>${[[330, 430, 90, 130], [430, 380, 100, 180], [540, 460, 82, 100]].map(([x, y, w, hh], i) => `<rect x="${x - w / 2}" y="${y + 126 - hh + 50}" width="${w}" height="${hh}" rx="16" fill="${hsl(h + i * 22, 42, 88 - i * 3)}"/><rect x="${x - w / 2 + 8}" y="${y + 126 - hh + 60}" width="9" height="${hh - 24}" rx="4" fill="#fff" opacity=".45"/>${flame(x, y + 126 - hh + 40, 0.75)}`).join("")}</g>`;
}

const FN: Record<Kind, (h: number, r: () => number) => string> = { jar, vessel, pillar, float, gift, material, hero: mood, mood };

const SC: Record<Kind, number> = { jar: 1.55, vessel: 1.45, pillar: 1.4, float: 1.2, gift: 1.12, material: 1.15, hero: 1.2, mood: 1.2 };

export function artSvg(kind: Kind, hue: number, seed: number): string {
  const r = rng(seed);
  const h = hue;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${hsl(h, 55, 94)}"/><stop offset="1" stop-color="${hsl(h + 22, 45, 86)}"/></linearGradient>
<linearGradient id="tb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${hsl(h + 12, 30, 80)}"/><stop offset="1" stop-color="${hsl(h + 12, 28, 70)}"/></linearGradient>
<radialGradient id="glow"><stop offset="0" stop-color="#ffd98a" stop-opacity=".75"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></radialGradient>
<radialGradient id="light" cx=".5" cy=".38" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<linearGradient id="fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffcf5a"/><stop offset="1" stop-color="#f58a2c"/></linearGradient>
<linearGradient id="shade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient>
<filter id="b"><feGaussianBlur stdDeviation="9"/></filter>
</defs>
<rect width="800" height="800" fill="url(#bg)"/><rect width="800" height="800" fill="url(#light)"/>
<rect y="572" width="800" height="228" fill="url(#tb)"/><rect y="570" width="800" height="4" fill="#fff" opacity=".45"/>
<g transform="translate(400 572) scale(${SC[kind]}) translate(-400 -572)">${FN[kind](h, r)}</g>
</svg>`;
}
