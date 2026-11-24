import { WhatsAppIcon } from "@/components/social";
import { CartProvider } from "@/components/cart";
import { CartDrawer } from "@/components/CartDrawer";
import { WishlistProvider } from "@/components/wishlist";
import ScrollExtras from "@/components/ScrollExtras";
import AssistantWidget from "@/components/AssistantWidget";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Tracker from "@/components/Tracker";
import Insights from "@/components/Insights";
import PwaRegister from "@/components/PwaRegister";
import CookieBanner from "@/components/CookieBanner";
import { getSettings } from "@/lib/catalog";
import { cookies } from "next/headers";
import { Wrench } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  import("@/lib/jobs").then((j) => j.maybeRunJobs()).catch(() => {});
  const isAdmin = !!cookies().get("admin_session")?.value;
  if (s.maintenance_mode === "1" && !isAdmin)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-lilac/40 px-6 text-center">
        <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-plum"><Wrench size={28} /></span>
        <h1 className="h-serif text-3xl">{s.store_name}</h1>
        <p className="mt-3 max-w-md text-neutral-700">{s.maintenance_message || "We're making a few updates. Please check back soon."}</p>
      </div>
    );
  return (
    <CartProvider>
      <WishlistProvider>
        {s.maintenance_mode === "1" && <div className="bg-butter px-4 py-1.5 text-center text-xs">Maintenance mode is ON — only you (admin) can see the store.</div>}
        <Header />
        <main className="min-h-[60vh]">{children}</main>
        <Footer />
        <CartDrawer freeMin={Number(s.free_shipping_min)} />
        <ScrollExtras />
        <Tracker />
        <Insights />
        <PwaRegister />
        {s.cookie_banner_enabled === "1" && <CookieBanner text={s.cookie_banner_text} />}
        {s.assistant_enabled === "1" && <AssistantWidget name={s.assistant_name} greeting={s.assistant_greeting} />}
        {s.whatsapp_button === "1" && (
          <a href={`https://wa.me/${s.whatsapp}`} target="_blank" aria-label="WhatsApp"
             className="float-ui fixed bottom-4 right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-110 sm:bottom-5 sm:right-5 sm:h-12 sm:w-12"><WhatsAppIcon size={24} /></a>
        )}
      </WishlistProvider>
    </CartProvider>
  );
}
