/**
 * Sample photos (free to use, Unsplash licence) used in place of placeholder art.
 * Every image that would have been a drawn placeholder is routed through /api/ph,
 * which redirects to one of these. Real images uploaded from Admin are never touched.
 * To use your own pool, just edit the IDs below (the part after unsplash.com/photos/).
 */
const POOLS: Record<string, string[]> = {
  jar: ["c2UOaRzrB_8", "t366VyHaXjk", "L50vD0wn9JM", "a6RhrlYuGAA", "tRk9WKkEf7Q", "B5AmTy1K6mk"],
  vessel: ["GV7me7EmMrc", "a6RhrlYuGAA", "t366VyHaXjk", "WUmQfmvsoog"],
  pillar: ["doGw3H_MDNI", "clw6dHJYusQ", "tRk9WKkEf7Q", "jBK-A0Jm71Y"],
  float: ["GVGBs3oN6pg", "P7-jciwqmc0", "QhlWFtwBBlI", "HAeY_hnc1YU"],
  gift: ["PJbq2hUiaUg", "mcfwZ1GVdp4", "-wxHvp55IhY", "whXZENQGLog"],
  material: ["KYIUGqT2Br0", "WUmQfmvsoog", "Dnlln3G0jc0", "skI3TxvbIkM", "yHAHGi4QOgM"],
  hero: ["L50vD0wn9JM", "B5AmTy1K6mk", "QhlWFtwBBlI"],
  mood: ["HAeY_hnc1YU", "jBK-A0Jm71Y", "P7-jciwqmc0", "a6RhrlYuGAA", "GVGBs3oN6pg", "B5AmTy1K6mk"],
};

function pick(label: string): string[] {
  const l = label.toLowerCase();
  if (/hero|banner/.test(l)) return POOLS.hero;
  if (/\bkit\b|epoxy|resin|cement|pigment|mica|raw material|powder|material|casting/.test(l)) return POOLS.material;
  if (/jesmonite|terrazzo|concrete|sandstone|vessel/.test(l)) return POOLS.vessel;
  if (/pillar|ivory|marble|ribbed/.test(l)) return POOLS.pillar;
  if (/tealight|floating|diya|rose/.test(l)) return POOLS.float;
  if (/gift|combo|hamper|trio|unwind|bundle|\bset\b/.test(l)) return POOLS.gift;
  if (/candle|jar|soy|wax|vanilla|lavender|amber|oud|sea salt/.test(l)) return POOLS.jar;
  return POOLS.mood;
}

export function samplePhoto(label: string, w = 900): string {
  const pool = pick(label || "");
  const h = [...(label || "x")].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  const id = pool[h % pool.length];
  return `https://unsplash.com/photos/${id}/download?force=true&w=${w}&q=75`;
}
