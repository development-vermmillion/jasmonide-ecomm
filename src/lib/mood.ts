/** Mood finder: questions + scoring. Pure functions, shared by the page (client) and the API (server). */
export type Opt = { label: string; emoji: string; kw: string[] };
export type Q = { q: string; opts: Opt[] };

export const QUESTIONS: Q[] = [
  { q: "Who is this glow for?", opts: [
    { label: "Me, just me", emoji: "🫶", kw: ["candle", "jar"] },
    { label: "A friend or family", emoji: "🎁", kw: ["gift", "combo", "hamper"] },
    { label: "My home & space", emoji: "🏡", kw: ["pillar", "decor", "jesmonite", "concrete"] },
    { label: "I love making things", emoji: "🛠️", kw: ["material", "casting", "kit", "resin", "cement", "pigment"] },
  ] },
  { q: "How do you want to feel?", opts: [
    { label: "Calm & cosy", emoji: "🌙", kw: ["lavender", "vanilla", "relax", "soy", "unwind"] },
    { label: "Fresh & uplifted", emoji: "🌊", kw: ["sea salt", "fresh", "driftwood", "tealight"] },
    { label: "Warm & luxurious", emoji: "✨", kw: ["oud", "amber", "luxury", "terrazzo", "trio"] },
    { label: "Festive & joyful", emoji: "🪔", kw: ["diya", "festive", "diwali", "floating", "rose"] },
    { label: "Minimal & modern", emoji: "🪨", kw: ["concrete", "cement", "marble", "ivory", "minimal", "ribbed"] },
  ] },
  { q: "What do you love most?", opts: [
    { label: "Soft & sweet scents", emoji: "🍯", kw: ["vanilla", "bourbon", "scented"] },
    { label: "Deep, woody scents", emoji: "🌲", kw: ["oud", "amber", "driftwood"] },
    { label: "Floral & calming", emoji: "💜", kw: ["lavender", "rose", "chamomile"] },
    { label: "No scent, just beauty", emoji: "🤍", kw: ["unscented", "pillar", "ivory", "marble", "floating"] },
    { label: "Handmade vessels", emoji: "🏺", kw: ["jesmonite", "terrazzo", "sandstone", "concrete", "vessel"] },
  ] },
];

/** Higher score = better match. */
export function scoreProduct(p: { name: string; tags?: string; short_desc?: string; category_name?: string; type?: string }, picks: number[]) {
  const hay = `${p.name} ${p.tags || ""} ${p.short_desc || ""} ${p.category_name || ""} ${p.type || ""}`.toLowerCase();
  let score = 0;
  picks.forEach((i, qi) => {
    const kw = QUESTIONS[qi]?.opts[i]?.kw || [];
    for (const k of kw) if (hay.includes(k)) score += qi === 1 ? 3 : 2;   // mood counts most
  });
  const maker = picks[0] === 3;
  const isMaterial = /material|casting|kit|resin|cement|pigment/.test(hay) && !/candle/.test(p.name.toLowerCase());
  if (maker && !isMaterial) score -= 4;
  if (!maker && isMaterial) score -= 6;
  return score;
}
