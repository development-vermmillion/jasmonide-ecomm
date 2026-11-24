import { heatPaths } from "@/lib/insights";
import HeatmapView from "@/components/admin/HeatmapView";
export const dynamic = "force-dynamic";
export default async function Heatmap({ searchParams }: { searchParams: { path?: string; device?: string; days?: string } }) {
  const days = [7, 30, 90].includes(Number(searchParams.days)) ? Number(searchParams.days) : 30;
  const paths = await heatPaths(days);
  const path = searchParams.path && searchParams.path.startsWith("/") ? searchParams.path : paths[0]?.path || "/";
  return (
    <div className="space-y-4">
      <div><h1 className="h-serif text-3xl">Click heatmap</h1><p className="text-sm text-neutral-500">See exactly where customers tap on each page, on phone or desktop, and how far down they scroll.</p></div>
      <HeatmapView paths={paths} initial={{ path, device: searchParams.device === "mobile" ? "mobile" : "desktop", days }} />
    </div>
  );
}
