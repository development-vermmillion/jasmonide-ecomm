/** Every on/off switch shown in Admin → Settings → Features. "1" = on. */
export type Feature = { key: string; label: string; desc: string; def: "0" | "1"; group: string };

export const FEATURES: Feature[] = [
  { group: "Payments & checkout", key: "cod_enabled", label: "Cash on delivery", desc: "Let customers pay on delivery (physical products only)", def: "1" },
  { group: "Payments & checkout", key: "upi_enabled", label: "UPI / bank transfer", desc: "Show the UPI & bank payment option at checkout", def: "1" },
  { group: "Payments & checkout", key: "coupons_enabled", label: "Coupon codes", desc: "Coupon box at checkout and all discount codes", def: "1" },
  { group: "Payments & checkout", key: "guest_checkout_enabled", label: "Guest checkout", desc: "OFF = customers must sign in to order (turn Customer accounts on)", def: "1" },
  { group: "Catalogue", key: "combos_enabled", label: "Combos & bundles", desc: "Combo products, Combos page and menu link", def: "1" },
  { group: "Catalogue", key: "sale_enabled", label: "Sales & discounts", desc: "OFF = every sale price is ignored and the Sale page is hidden", def: "1" },
  { group: "Payments & checkout", key: "bulk_enabled", label: "Bulk / quantity discounts", desc: "Automatic discounts by quantity or cart value (set rules in Admin → Bulk discounts)", def: "1" },
  { group: "Catalogue", key: "show_sold_out", label: "Show sold-out products", desc: "OFF = products that are out of stock are hidden", def: "1" },
  { group: "Catalogue", key: "stock_counter", label: "Low-stock message", desc: "Show “Only 3 left” on product pages", def: "1" },
  { group: "Catalogue", key: "notify_enabled", label: "Back-in-stock alerts", desc: "“Notify me” form on sold-out products", def: "1" },
  { group: "Engagement", key: "reels_enabled", label: "Instagram reels", desc: "Reels on the home page and on product pages", def: "1" },
  { group: "Engagement", key: "reviews_enabled", label: "Reviews & ratings", desc: "Star ratings, reviews list and review form", def: "1" },
  { group: "Engagement", key: "reviews_auto_approve", label: "Auto-approve reviews", desc: "OFF = you approve each review in Admin → Reviews first", def: "0" },
  { group: "Engagement", key: "wishlist_enabled", label: "Wishlist", desc: "Heart buttons and the wishlist page", def: "1" },
  { group: "Engagement", key: "recently_viewed_enabled", label: "Recently viewed", desc: "Recently viewed products on product pages", def: "1" },
  { group: "Engagement", key: "newsletter_enabled", label: "Newsletter signup", desc: "Email signup box in the footer", def: "1" },
  { group: "Customers & support", key: "accounts_enabled", label: "Customer accounts", desc: "Sign in / register, order history and saved address", def: "1" },
  { group: "Customers & support", key: "returns_enabled", label: "Returns & refunds", desc: "Return requests, refund-policy link and return buttons", def: "1" },
  { group: "Customers & support", key: "track_enabled", label: "Order tracking page", desc: "Public tracking by order number and phone", def: "1" },
  { group: "Customers & support", key: "contact_enabled", label: "Contact form", desc: "Enquiry form on the Contact page", def: "1" },
  { group: "Customers & support", key: "whatsapp_button", label: "Floating WhatsApp button", desc: "Chat bubble on every page", def: "1" },
  { group: "Engagement", key: "blog_enabled", label: "Blog", desc: "Blog pages, menu link and home teaser", def: "1" },
  { group: "Engagement", key: "assistant_enabled", label: "AI shopping assistant", desc: "Chat helper bubble that guides visitors", def: "1" },
  { group: "Engagement", key: "faq_enabled", label: "FAQ page", desc: "Public FAQ page (also helps Google & AI search)", def: "1" },
  { group: "Site", key: "search_enabled", label: "Search", desc: "Search box with live suggestions", def: "1" },
  { group: "Site", key: "announcement_enabled", label: "Announcement bar", desc: "Top bar with your announcement text", def: "1" },
  { group: "Site", key: "theme_toggle_enabled", label: "Dark / light switch", desc: "Let visitors switch theme", def: "1" },
  { group: "Site", key: "maintenance_mode", label: "Maintenance mode", desc: "Closes the storefront with a “back soon” message (admin keeps working)", def: "0" },
];
export const FEATURE_DEFAULTS: Record<string, string> = Object.fromEntries(FEATURES.map((f) => [f.key, f.def]));
export const on = (s: Record<string, string>, key: string) => s[key] === "1";
