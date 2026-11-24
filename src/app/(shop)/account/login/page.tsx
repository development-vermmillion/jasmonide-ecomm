import { notFound, redirect } from "next/navigation";
import { getSettings } from "@/lib/catalog";
import { getCustomer } from "@/lib/customer-auth";
import AuthForms from "@/components/AuthForms";

export const metadata = { title: "Sign in" };
export default async function Login({ searchParams }: { searchParams: { next?: string; err?: string } }) {
  const s = await getSettings();
  if (s.accounts_enabled !== "1") notFound();
  const next = searchParams.next?.startsWith("/") ? searchParams.next : "/account";
  if (await getCustomer()) redirect(next);
  return <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6"><h1 className="h-serif text-center text-3xl sm:text-4xl">Welcome</h1><p className="mt-1 text-center text-neutral-600">Sign in to track orders, save your address and checkout faster.</p><AuthForms next={next} err={searchParams.err} cfg={{ otp: s.login_otp_enabled === "1", google: s.login_google_enabled === "1" && !!s.google_client_id, password: s.login_password_enabled === "1" }} /></div>;
}
