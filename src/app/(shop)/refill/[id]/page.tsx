import RefillGo from "@/components/RefillGo";
export const metadata = { title: "Your refill", robots: { index: false } };
export default function Refill({ params, searchParams }: { params: { id: string }; searchParams: { t?: string } }) {
  return <div className="mx-auto max-w-md px-4 py-20 text-center"><RefillGo id={params.id} t={searchParams.t || ""} /></div>;
}
