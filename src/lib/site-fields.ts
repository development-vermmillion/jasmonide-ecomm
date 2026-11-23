/** Editable-content fields (Admin → Brand & SEO, Admin → Homepage). Key → default. */
export type Field = { key: string; label: string; def: string; type?: "text" | "area" | "image" | "toggle" | "url" | "secret" | "select"; options?: [string, string][]; help?: string };
export type FieldGroup = { title: string; note?: string; fields: Field[] };

export const BRAND_SEO: FieldGroup[] = [
  { title: "Brand identity", note: "Used in the header, footer, browser tab, emails and share previews.", fields: [
    { key: "store_name", label: "Brand name", def: "Jasmonoide" },
    { key: "tagline", label: "Tagline (short)", def: "Premium candles & casting materials" },
    { key: "site_description", label: "Brand description (about 150 characters)", def: "Premium hand-poured candles, plus jesmonite, resin and white cement for makers. Shipped across India.", type: "area", help: "Shown in Google results and when your link is shared." },
    { key: "logo_url", label: "Logo", def: "", type: "image", help: "Leave empty to show the brand name as text." },
    { key: "favicon_url", label: "Favicon (browser-tab icon, square PNG)", def: "", type: "image" },
    { key: "og_image", label: "Share image (1200×630) for WhatsApp/Instagram/Google", def: "", type: "image" },
    { key: "theme_color", label: "Browser theme colour (hex)", def: "#6d5a9c" },
  ] },
  { title: "Search engine (SEO)", fields: [
    { key: "site_url", label: "Website address (no trailing slash)", def: "https://www.yourdomain.com", type: "url", help: "Needed for the sitemap, canonical links and schema." },
    { key: "seo_home_title", label: "Home page title (50–60 chars)", def: "Jasmonoide — Premium candles & casting materials in India" },
    { key: "seo_home_desc", label: "Home page meta description (140–160 chars)", def: "Shop premium scented candles, designer jesmonite candles and gift sets. Also jesmonite, epoxy resin and white cement. Free shipping above ₹999.", type: "area" },
    { key: "seo_title_suffix", label: "Title ending on other pages", def: " · Jasmonoide" },
    { key: "seo_keywords", label: "Keywords (comma separated, optional)", def: "premium candles, scented candles, jesmonite candles, soy candles, gift sets, jesmonite, epoxy resin, white cement" },
    { key: "seo_noindex", label: "Hide whole site from Google (use while testing)", def: "0", type: "toggle" },
    { key: "google_verification", label: "Google Search Console verification code", def: "" },
    { key: "bing_verification", label: "Bing Webmaster verification code", def: "" },
    { key: "ga_id", label: "Google Analytics ID (G-XXXXXXX)", def: "" },
    { key: "meta_pixel_id", label: "Meta (Facebook/Instagram) Pixel ID", def: "" },
    { key: "org_sameas", label: "Other profiles (one URL per line, for Google)", def: "", type: "area" },
    { key: "business_type_note", label: "Business location line for local SEO (city, state)", def: "" },
  ] },
  { title: "AI search (GEO) — ChatGPT, Gemini, Perplexity, Claude", note: "Helps AI assistants find, understand and cite your store.", fields: [
    { key: "ai_crawlers_allowed", label: "Allow AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended…)", def: "1", type: "toggle" },
    { key: "llms_about", label: "About us for AI (plain facts: who, what, where, how long, what makes you different)", def: "We hand-pour premium candles and also supply jesmonite, epoxy resin and white cement to makers across India.", type: "area" },
    { key: "llms_facts", label: "Key facts for AI (one per line: shipping, returns, payment, specialities)", def: "Ships across India\nCash on delivery available\n7-day returns on unused items", type: "area" },
  ] },
];

export const ASSISTANT: FieldGroup[] = [
  { title: "AI shopping assistant", note: "Runs on your own server — free, no API. Teach it in Admin → Assistant (chats & taught answers), FAQs, and the box below.", fields: [
    { key: "assistant_log_chats", label: "Save visitor questions so I can review and teach the assistant", def: "1", type: "toggle" },
    { key: "assistant_name", label: "Assistant name", def: "Maya" },
    { key: "assistant_greeting", label: "Greeting", def: "Hi! I'm Maya. Ask me about candles, scents, materials, shipping or returns.", type: "area" },
    { key: "assistant_extra", label: "Extra knowledge (one fact per line, e.g. “Our soy candles burn for 40–50 hours”)", def: "", type: "area" },
  ] },
];

export const HOME: FieldGroup[] = [
  { title: "Hero banner", fields: [
    { key: "hero_eyebrow", label: "Small label above headline", def: "Premium · Hand-poured" },
    { key: "hero_title", label: "Headline", def: "Light up every moment" },
    { key: "hero_text", label: "Sub-text", def: "Hand-poured premium candles for every mood — and jesmonite, resin and white cement for your own creations.", type: "area" },
    { key: "hero_cta", label: "Button text", def: "Shop all" },
    { key: "hero_link", label: "Button link", def: "/shop" },
    { key: "hero_image", label: "Hero image", def: "", type: "image" },
  ] },
  { title: "Side promo tiles", fields: [
    { key: "promo1_title", label: "Tile 1 title", def: "Gift sets" }, { key: "promo1_text", label: "Tile 1 text", def: "Curated candle hampers" }, { key: "promo1_link", label: "Tile 1 link", def: "/combos" }, { key: "promo1_image", label: "Tile 1 image", def: "", type: "image" },
    { key: "promo2_title", label: "Tile 2 title", def: "Sale" }, { key: "promo2_text", label: "Tile 2 text", def: "Limited-time offers" }, { key: "promo2_link", label: "Tile 2 link", def: "/sale" }, { key: "promo2_image", label: "Tile 2 image", def: "", type: "image" },
  ] },
  { title: "Trust strip (4 boxes)", fields: [
    { key: "show_usp", label: "Show this strip", def: "1", type: "toggle" },
    { key: "usp1_title", label: "Box 1 title", def: "Free shipping" }, { key: "usp1_text", label: "Box 1 text", def: "On orders above ₹999" },
    { key: "usp2_title", label: "Box 2 title", def: "Premium quality" }, { key: "usp2_text", label: "Box 2 text", def: "Clean-burning soy wax" },
    { key: "usp3_title", label: "Box 3 title", def: "Cash on delivery" }, { key: "usp3_text", label: "Box 3 text", def: "Or pay by UPI" },
    { key: "usp4_title", label: "Box 4 title", def: "Gifting help" }, { key: "usp4_text", label: "Box 4 text", def: "Ask us on WhatsApp" },
  ] },
  { title: "Section headings", fields: [
    { key: "cat_eyebrow", label: "Categories — label", def: "Shop by category" }, { key: "cat_title", label: "Categories — heading", def: "Candles & materials" }, { key: "show_categories", label: "Show categories", def: "1", type: "toggle" },
    { key: "new_eyebrow", label: "New arrivals — label", def: "Just in" }, { key: "new_title", label: "New arrivals — heading", def: "Fresh from the studio" },
    { key: "sale_eyebrow", label: "Sale rail — label", def: "Limited time" }, { key: "sale_title", label: "Sale rail — heading", def: "On sale" },
    { key: "combo_eyebrow", label: "Combos rail — label", def: "Save more" }, { key: "combo_title", label: "Combos rail — heading", def: "Gift sets & combos" },
    { key: "learn_eyebrow", label: "Courses rail — label", def: "Learn" }, { key: "learn_title", label: "Courses rail — heading", def: "E-courses & guides" }, { key: "show_learn", label: "Show courses rail", def: "0", type: "toggle" },
  ] },
  { title: "Inspiration / projects", fields: [
    { key: "show_projects", label: "Show this section", def: "1", type: "toggle" },
    { key: "proj_eyebrow", label: "Label", def: "Community" }, { key: "proj_title", label: "Heading", def: "Ideas to inspire you" },
    { key: "proj1_title", label: "Project 1 title", def: "Candle styling for festive tables" }, { key: "proj1_image", label: "Project 1 image", def: "", type: "image" }, { key: "proj1_link", label: "Project 1 link (blog post etc.)", def: "/blog" },
    { key: "proj2_title", label: "Project 2 title", def: "Cosy bedroom candle corner" }, { key: "proj2_image", label: "Project 2 image", def: "", type: "image" }, { key: "proj2_link", label: "Project 2 link", def: "/blog" },
    { key: "proj3_title", label: "Project 3 title", def: "Pouring a jesmonite candle vessel" }, { key: "proj3_image", label: "Project 3 image", def: "", type: "image" }, { key: "proj3_link", label: "Project 3 link", def: "/blog" },
  ] },
  { title: "Brand story", fields: [
    { key: "show_story", label: "Show this section", def: "1", type: "toggle" },
    { key: "story_title", label: "Heading", def: "Poured by hand, made to be gifted" },
    { key: "story_text", label: "Text", def: "Tell customers who you are, how your candles are made and why they should trust your materials.", type: "area" },
    { key: "stat1_n", label: "Stat 1 number", def: "10+" }, { key: "stat1_l", label: "Stat 1 label", def: "years" },
    { key: "stat2_n", label: "Stat 2 number", def: "50k+" }, { key: "stat2_l", label: "Stat 2 label", def: "happy customers" },
    { key: "stat3_n", label: "Stat 3 number", def: "28" }, { key: "stat3_l", label: "Stat 3 label", def: "states shipped" },
  ] },
  { title: "Blog teaser & press", fields: [
    { key: "show_blog_home", label: "Show latest blog posts on home", def: "1", type: "toggle" },
    { key: "show_press", label: "Show “As featured in” strip", def: "0", type: "toggle" },
    { key: "press_names", label: "Press names (comma separated)", def: "PressLogo, DailyCraft, MakerWeekly" },
  ] },
  { title: "Top bar & footer", fields: [
    { key: "announcement", label: "Announcement bar text", def: "Free shipping above ₹999 · Bulk order enquiries on WhatsApp" },
    { key: "footer_about", label: "Footer about text", def: "Premium candles & casting materials.", type: "area" },
    { key: "newsletter_title", label: "Newsletter heading", def: "Join our candle club" },
    { key: "newsletter_text", label: "Newsletter text", def: "New scents, offers and care tips — no spam." },
  ] },
];


/** Keys that must never be sent to the browser (kept server-side only). */
export const SECRET_KEYS = ["razorpay_key_secret", "razorpay_webhook_secret"];

export const PAYMENTS: FieldGroup[] = [
  { title: "Payment methods", note: "Turn each method on or off. Customers only see the methods that are on.", fields: [
    { key: "cod_enabled", label: "Cash on delivery (COD)", def: "1", type: "toggle" },
    { key: "upi_enabled", label: "UPI / bank transfer (customer pays, you verify)", def: "1", type: "toggle" },
    { key: "razorpay_enabled", label: "Online payments — cards, UPI, netbanking, wallets (Razorpay)", def: "0", type: "toggle" },
  ] },
  { title: "UPI details", note: "Shown to the customer after they place a UPI order, with an auto-generated QR code that already contains the order amount.", fields: [
    { key: "upi_id", label: "UPI ID (VPA)", def: "yourname@upi", help: "Example: jasmonoide@okhdfcbank" },
    { key: "upi_payee_name", label: "Name shown in the UPI app", def: "Jasmonoide" },
    { key: "upi_qr", label: "Your own QR image (optional)", def: "", type: "image", help: "Leave empty to use the auto-generated QR with the exact amount. Upload one only if you want to show your own printed QR instead." },
    { key: "upi_require_ref", label: "Ask the customer for the UPI reference / UTR number after paying", def: "1", type: "toggle" },
    { key: "upi_note", label: "Message shown with the payment details", def: "Pay the exact amount, then enter the 12-digit UPI reference (UTR) below. We confirm your order once the payment is verified.", type: "area" },
  ] },
  { title: "Bank transfer details (shown together with UPI)", note: "Optional. Leave blank to hide.", fields: [
    { key: "bank_account_name", label: "Account holder name", def: "" },
    { key: "bank_name", label: "Bank name", def: "" },
    { key: "bank_account_no", label: "Account number", def: "" },
    { key: "bank_ifsc", label: "IFSC code", def: "" },
    { key: "bank_branch", label: "Branch", def: "" },
  ] },
  { title: "Razorpay (online payment gateway)", note: "Create a free account at razorpay.com → Settings → API Keys. Use Test keys first. Secrets are stored on your server only and are never shown again after saving.", fields: [
    { key: "razorpay_key_id", label: "Key ID", def: "", help: "Starts with rzp_test_ or rzp_live_" },
    { key: "razorpay_key_secret", label: "Key secret", def: "", type: "secret" },
    { key: "razorpay_webhook_secret", label: "Webhook secret (optional but recommended)", def: "", type: "secret", help: "In Razorpay → Webhooks add URL  https://YOUR-SITE/api/payments/razorpay/webhook  with events payment.captured and order.paid, and use the same secret here." },
    { key: "razorpay_label", label: "Label shown at checkout", def: "Pay online — UPI, cards, netbanking, wallets" },
  ] },
];

export const BUSINESS: FieldGroup[] = [
  { title: "Seller details printed on invoices", note: "These appear on every invoice. Fill them with your real registered details.", fields: [
    { key: "business_legal_name", label: "Legal / trade name", def: "Jasmonoide" },
    { key: "business_address", label: "Registered address", def: "Shop / Studio no., Street, City, State, PIN", type: "area" },
    { key: "business_state", label: "State (decides CGST+SGST vs IGST)", def: "Maharashtra" },
    { key: "gstin", label: "GSTIN (leave blank if not GST-registered)", def: "", help: "When blank the document is titled “Invoice” instead of “Tax Invoice”." },
    { key: "pan", label: "PAN (optional)", def: "" },
    { key: "business_email", label: "Billing email (optional, defaults to store email)", def: "" },
  ] },
  { title: "Tax", fields: [
    { key: "tax_percent", label: "GST rate (%) applied to products", def: "18", help: "Check the correct rate/HSN for your products with your CA." },
    { key: "tax_inclusive", label: "My prices already include GST (recommended in India)", def: "1", type: "toggle", help: "On: customers pay the listed price and the invoice shows the GST contained in it. Off: GST is added at checkout." },
  ] },
  { title: "Invoice layout", fields: [
    { key: "invoice_prefix", label: "Invoice number prefix", def: "INV" },
    { key: "invoice_show_images", label: "Show product images on the invoice", def: "1", type: "toggle" },
    { key: "invoice_signatory", label: "Authorised signatory name", def: "" },
    { key: "invoice_signature", label: "Signature / stamp image (transparent PNG)", def: "", type: "image" },
    { key: "invoice_terms", label: "Terms & conditions", def: "1. Goods once sold will be exchanged or returned only as per our returns policy.\n2. Candles that have been lit cannot be returned.\n3. Subject to local jurisdiction.", type: "area" },
    { key: "invoice_footer", label: "Footer line", def: "Thank you for shopping with us!" },
  ] },
];

export const SITE_DEFAULTS: Record<string, string> = Object.fromEntries([...BRAND_SEO, ...ASSISTANT, ...HOME, ...PAYMENTS, ...BUSINESS].flatMap((g) => g.fields.map((f) => [f.key, f.def])));
