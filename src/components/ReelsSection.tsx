import { getReels } from "@/lib/reels";
import { getSettings } from "@/lib/catalog";
import ReelRail from "./ReelRail";
import Reveal from "./Reveal";

export default async function ReelsSection({ home, productId, tone = "", eyebrow = "Instagram", title, compact }: { home?: boolean; productId?: number; tone?: string; eyebrow?: string; title?: string; compact?: boolean }) {
  const [reels, s] = await Promise.all([getReels({ home, productId }), getSettings()]);
  if (!reels.length) return null;
  return (
    <Reveal>
      <ReelRail reels={reels as any} tone={tone} eyebrow={eyebrow} title={title || s.reels_title} handle={s.reels_handle} instagram={s.instagram} compact={compact} />
    </Reveal>
  );
}
