import ResetForm from "@/components/ResetForm";
export const metadata = { title: "Choose a new password", robots: { index: false } };
export default function Reset({ searchParams }: { searchParams: { token?: string } }) {
  return <div className="mx-auto max-w-md px-4 py-14"><p className="eyebrow">Almost there</p><h1 className="h-serif mt-1 text-3xl">Choose a new password</h1><ResetForm token={searchParams.token || ""} /></div>;
}
