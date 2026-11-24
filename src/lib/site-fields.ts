/** Editable-content fields (Admin → Brand & SEO, Admin → Homepage). Key → default. */
export type Field = { key: string; label: string; def: string; type?: "text" | "area" | "image" | "toggle" | "url" | "secret" | "select"; options?: [string, string][]; help?: string; rows?: number };
export type FieldGroup = { title: string; note?: string; fields: Field[] };

export const BRAND_SEO: FieldGroup[] = [
  { title: "Brand identity", note: "Used in the header, footer, browser tab, emails and share previews.", fields: [
    { key: "store_name", label: "Brand name", def: "Jasmonoide" },
    { key: "tagline", label: "Tagline (short)", def: "Candles that feel like coming home" },
    { key: "site_description", label: "Brand description (about 150 characters)", def: "Small-batch, hand-poured candles and jesmonite décor — made to turn ordinary evenings into memories. Packed with love and shipped across India.", type: "area", help: "Shown in Google results and when your link is shared." },
    { key: "logo_url", label: "Logo", def: "", type: "image", help: "Leave empty to show the brand name as text." },
    { key: "favicon_url", label: "Favicon (browser-tab icon, square PNG)", def: "", type: "image" },
    { key: "og_image", label: "Share image (1200×630) for WhatsApp/Instagram/Google", def: "", type: "image" },
    { key: "theme_color", label: "Browser theme colour (hex)", def: "#6d5a9c" },
  ] },
  { title: "Search engine (SEO)", fields: [
    { key: "site_url", label: "Website address (no trailing slash)", def: "https://www.yourdomain.com", type: "url", help: "Needed for the sitemap, canonical links and schema." },
    { key: "seo_home_title", label: "Home page title (50–60 chars)", def: "Jasmonoide — Hand-poured candles that feel like home" },
    { key: "seo_home_desc", label: "Home page meta description (140–160 chars)", def: "Small-batch scented candles, handmade jesmonite vessels and gifts from the heart. Also jesmonite, resin and white cement for makers. Free shipping above ₹999.", type: "area" },
    { key: "seo_title_suffix", label: "Title ending on other pages", def: " · Jasmonoide" },
    { key: "seo_keywords", label: "Keywords (comma separated, optional)", def: "premium candles, scented candles, jesmonite candles, soy candles, gift sets, jesmonite, epoxy resin, white cement" },
    { key: "seo_noindex", label: "Hide whole site from Google (use while testing)", def: "0", type: "toggle" },
    { key: "google_verification", label: "Google Search Console verification code", def: "" },
    { key: "bing_verification", label: "Bing Webmaster verification code", def: "" },
    { key: "org_sameas", label: "Other profiles (one URL per line, for Google)", def: "", type: "area" },
    { key: "business_type_note", label: "Business location line for local SEO (city, state)", def: "" },
  ] },
  { title: "AI search (GEO) — ChatGPT, Gemini, Perplexity, Claude", note: "Helps AI assistants find, understand and cite your store.", fields: [
    { key: "ai_crawlers_allowed", label: "Allow AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended…)", def: "1", type: "toggle" },
    { key: "llms_about", label: "About us for AI (plain facts: who, what, where, how long, what makes you different)", def: "Jasmonoide is a new small-batch candle studio in India. We hand-pour scented soy candles and jesmonite vessel candles, curate gift sets, and supply jesmonite, epoxy resin and white cement to makers.", type: "area" },
    { key: "llms_facts", label: "Key facts for AI (one per line: shipping, returns, payment, specialities)", def: "Ships across India\nCash on delivery available\n7-day returns on unused items", type: "area" },
  ] },
];

export const ASSISTANT: FieldGroup[] = [
  { title: "AI shopping assistant", note: "Runs on your own server — free, no API. Teach it in Admin → Assistant (chats & taught answers), FAQs, and the box below.", fields: [
    { key: "assistant_log_chats", label: "Save visitor questions so I can review and teach the assistant", def: "1", type: "toggle" },
    { key: "assistant_name", label: "Assistant name", def: "Maya" },
    { key: "assistant_greeting", label: "Greeting", def: "Hi, I'm Maya. Tell me who you're shopping for or what mood you want to create, and I'll help you find the perfect candle — or the right materials for your own making.", type: "area" },
    { key: "assistant_extra", label: "Extra knowledge (one fact per line, e.g. “Our soy candles burn for 40–50 hours”)", def: "", type: "area" },
  ] },
];

export const HOME: FieldGroup[] = [
  { title: "Hero banner", fields: [
    { key: "hero_eyebrow", label: "Small label above headline", def: "Small-batch · Hand-poured · Made with love" },
    { key: "hero_title", label: "Headline", def: "Light a little warmth into every evening" },
    { key: "hero_text", label: "Sub-text", def: "Candles poured by hand, one small batch at a time — for slow evenings, shared laughter and the people who feel like home.", type: "area" },
    { key: "hero_cta", label: "Button text", def: "Find your glow" },
    { key: "hero_link", label: "Button link", def: "/shop" },
    { key: "hero_video", label: "Hero video (MP4 link; leave empty to use the image)", def: "/media/hero.mp4", type: "url" },
    { key: "hero_image", label: "Hero image / video poster", def: "", type: "image" },
  ] },
  { title: "Side promo tiles", fields: [
    { key: "promo1_title", label: "Tile 1 title", def: "Gifts from the heart" }, { key: "promo1_text", label: "Tile 1 text", def: "Hampers that say what words can't" }, { key: "promo1_link", label: "Tile 1 link", def: "/combos" }, { key: "promo1_image", label: "Tile 1 image", def: "", type: "image" },
    { key: "promo2_title", label: "Tile 2 title", def: "Gentle savings" }, { key: "promo2_text", label: "Tile 2 text", def: "A little extra love, while it lasts" }, { key: "promo2_link", label: "Tile 2 link", def: "/sale" }, { key: "promo2_image", label: "Tile 2 image", def: "", type: "image" },
  ] },
  { title: "Trust strip (4 boxes)", fields: [
    { key: "show_usp", label: "Show this strip", def: "1", type: "toggle" },
    { key: "usp1_title", label: "Box 1 title", def: "Free shipping" }, { key: "usp1_text", label: "Box 1 text", def: "Above ₹999 · wrapped with care" },
    { key: "usp2_title", label: "Box 2 title", def: "Made by hand" }, { key: "usp2_text", label: "Box 2 text", def: "Small batches · clean soy wax" },
    { key: "usp3_title", label: "Box 3 title", def: "Pay your way" }, { key: "usp3_text", label: "Box 3 text", def: "Cash on delivery or UPI" },
    { key: "usp4_title", label: "Box 4 title", def: "A real person" }, { key: "usp4_text", label: "Box 4 text", def: "Say hello on WhatsApp" },
  ] },
  { title: "Section headings", fields: [
    { key: "cat_eyebrow", label: "Categories — label", def: "Find your mood" }, { key: "cat_title", label: "Categories — heading", def: "A candle for every moment" }, { key: "show_categories", label: "Show categories", def: "1", type: "toggle" },
    { key: "new_eyebrow", label: "New arrivals — label", def: "Just poured" }, { key: "new_title", label: "New arrivals — heading", def: "Fresh from our studio" },
    { key: "sale_eyebrow", label: "Sale rail — label", def: "While they last" }, { key: "sale_title", label: "Sale rail — heading", def: "Gentle savings" },
    { key: "combo_eyebrow", label: "Combos rail — label", def: "Made for gifting" }, { key: "combo_title", label: "Combos rail — heading", def: "Gifts that feel like a hug" },
    { key: "learn_eyebrow", label: "Courses rail — label", def: "Learn" }, { key: "learn_title", label: "Courses rail — heading", def: "E-courses & guides" }, { key: "show_learn", label: "Show courses rail", def: "0", type: "toggle" },
  ] },
  { title: "Inspiration / projects", fields: [
    { key: "show_projects", label: "Show this section", def: "1", type: "toggle" },
    { key: "proj_eyebrow", label: "Label", def: "Inspiration" }, { key: "proj_title", label: "Heading", def: "Make your home glow" },
    { key: "proj1_title", label: "Project 1 title", def: "Setting the table for a festive evening" }, { key: "proj1_image", label: "Project 1 image", def: "", type: "image" }, { key: "proj1_link", label: "Project 1 link (blog post etc.)", def: "/blog" },
    { key: "proj2_title", label: "Project 2 title", def: "A cosy corner just for you" }, { key: "proj2_image", label: "Project 2 image", def: "", type: "image" }, { key: "proj2_link", label: "Project 2 link", def: "/blog" },
    { key: "proj3_title", label: "Project 3 title", def: "Pour your very first jesmonite vessel" }, { key: "proj3_image", label: "Project 3 image", def: "", type: "image" }, { key: "proj3_link", label: "Project 3 link", def: "/blog" },
  ] },
  { title: "Brand story", fields: [
    { key: "show_story", label: "Show this section", def: "1", type: "toggle" },
    { key: "story_title", label: "Heading", def: "Made slowly, for the moments that matter" },
    { key: "story_text", label: "Text", def: "Jasmonoide is a brand-new studio built on a simple belief: the smallest rituals — a lit candle, a quiet evening, a gift chosen with care — are the ones we remember. Every piece is poured by hand in small batches, because we would rather make fewer things with more love. You are not just buying a candle; you are becoming part of our very first chapter, and we are so grateful you are here.", type: "area" },
    { key: "stat1_n", label: "Stat 1 number", def: "100%" }, { key: "stat1_l", label: "Stat 1 label", def: "hand-poured" },
    { key: "stat2_n", label: "Stat 2 number", def: "40+ hrs" }, { key: "stat2_l", label: "Stat 2 label", def: "of slow, clean burn*" },
    { key: "stat3_n", label: "Stat 3 number", def: "7 days" }, { key: "stat3_l", label: "Stat 3 label", def: "easy returns" },
  ] },
  { title: "Blog teaser & press", fields: [
    { key: "show_blog_home", label: "Show latest blog posts on home", def: "1", type: "toggle" },
    { key: "show_press", label: "Show “As featured in” strip", def: "0", type: "toggle" },
    { key: "press_names", label: "Press names (comma separated)", def: "PressLogo, DailyCraft, MakerWeekly" },
  ] },
  { title: "Top bar & footer", fields: [
    { key: "announcement", label: "Announcement bar text", def: "Free shipping above ₹999 · Every order is packed by hand, with love" },
    { key: "footer_about", label: "Footer about text", def: "Hand-poured candles and handmade décor, made in small batches to turn ordinary evenings into memories. Thank you for being part of our first chapter.", type: "area" },
    { key: "newsletter_title", label: "Newsletter heading", def: "Join our candle circle" },
    { key: "newsletter_text", label: "Newsletter text", def: "Be the first to hear about new scents and little stories from the studio. No spam — only warmth." },
  ] },
];


/** Keys that must never be sent to the browser (kept server-side only). */
export const SECRET_KEYS = ["razorpay_key_secret", "razorpay_webhook_secret", "cashfree_secret_key", "payu_salt", "shiprocket_password", "delhivery_token", "smtp_pass", "wa_access_token", "google_client_secret", "msg91_authkey", "twilio_token", "ig_access_token"];

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


import { LEGAL_PAGES } from "./legal";

export const LEGAL: FieldGroup[] = [
  { title: "Legal pages", note: "Sample text is already filled in for an Indian online store — read it, replace anything that doesn't match your business, and ideally have a lawyer/CA check it. Use {{store}}, {{email}}, {{phone}}, {{address}}, {{legal_name}}, {{return_days}}, {{free_shipping_min}}, {{shipping_flat}} and {{updated}} to insert your details automatically. Formatting: ## Heading, - bullet, **bold**.", fields: [
    { key: "legal_updated", label: "“Last updated” date shown on the pages", def: "24 November 2026" },
    { key: "cookie_banner_enabled", label: "Show the cookie notice banner", def: "1", type: "toggle" },
    { key: "cookie_banner_text", label: "Cookie banner text", def: "We use cookies to keep your bag working, understand what you love and measure our ads. You can choose.", type: "area" },
  ] },
  ...LEGAL_PAGES.map((p) => ({ title: p.title, note: `Shown at /page/${p.slug}`, fields: [{ key: p.key, label: p.title + " (full text)", def: p.def, type: "area" as const, rows: 16 }] })),
];

const SEL_OTP: [string, string][] = [["test", "Test mode — show the code on screen (for testing only!)"], ["msg91", "MSG91 (SMS)"], ["twilio", "Twilio (SMS)"], ["whatsapp", "WhatsApp (Meta Cloud API, set up below)"]];
export const INTEGRATIONS: FieldGroup[] = [
  { title: "Customer sign-in", note: "How customers log in to their account. Turn each method on or off.", fields: [
    { key: "login_otp_enabled", label: "Sign in with phone OTP", def: "1", type: "toggle" },
    { key: "login_google_enabled", label: "Sign in with Google (Gmail)", def: "0", type: "toggle" },
    { key: "login_password_enabled", label: "Sign in with email + password", def: "1", type: "toggle" },
  ] },
  { title: "Google sign-in (Gmail)", note: "Google Cloud Console → APIs & Services → Credentials → Create OAuth client ID (Web application). Add the redirect URL shown below. Change these any time to use another Google account/project.", fields: [
    { key: "google_client_id", label: "Google Client ID", def: "" },
    { key: "google_client_secret", label: "Google Client secret", def: "", type: "secret" },
    { key: "google_redirect_note", label: "Redirect URL to add in Google (copy this)", def: "https://YOUR-SITE/api/account/google/callback", help: "Replace YOUR-SITE with your real website address. For local testing use http://localhost:3000/api/account/google/callback" },
  ] },
  { title: "Phone OTP (SMS / WhatsApp)", note: "Choose how OTP codes are delivered. Test mode shows the code on screen so you can try the flow — switch it before going live.", fields: [
    { key: "otp_provider", label: "OTP delivery", def: "test", type: "select", options: SEL_OTP },
    { key: "msg91_authkey", label: "MSG91 auth key", def: "", type: "secret" },
    { key: "msg91_template_id", label: "MSG91 OTP template ID", def: "" },
    { key: "twilio_sid", label: "Twilio account SID", def: "" },
    { key: "twilio_token", label: "Twilio auth token", def: "", type: "secret" },
    { key: "twilio_from", label: "Twilio sender number", def: "" },
  ] },
  { title: "Email (SMTP)", note: "Used for order emails and alerts. Gmail: smtp.gmail.com, port 587, your Gmail address, and an App Password (Google Account → Security → App passwords). Leave off until ready.", fields: [
    { key: "email_enabled", label: "Send emails from the store", def: "0", type: "toggle" },
    { key: "email_order_confirm", label: "Email customers when they place an order", def: "1", type: "toggle" },
    { key: "smtp_host", label: "SMTP host", def: "smtp.gmail.com" },
    { key: "smtp_port", label: "SMTP port", def: "587" },
    { key: "smtp_user", label: "SMTP username (your email)", def: "" },
    { key: "smtp_pass", label: "SMTP password / app password", def: "", type: "secret" },
    { key: "email_from_name", label: "From name", def: "Jasmonoide" },
    { key: "email_from", label: "From email address", def: "" },
  ] },
  { title: "WhatsApp Business API", note: "Meta WhatsApp Cloud API (developers.facebook.com). Needed for automatic WhatsApp messages, alerts and OTP. Message templates must be approved in Meta first.", fields: [
    { key: "wa_api_enabled", label: "Send WhatsApp messages from the store", def: "0", type: "toggle" },
    { key: "wa_phone_number_id", label: "Phone number ID", def: "" },
    { key: "wa_access_token", label: "Permanent access token", def: "", type: "secret" },
    { key: "wa_template_lang", label: "Template language code", def: "en" },
    { key: "wa_otp_template", label: "OTP template name", def: "otp_login" },
    { key: "wa_alert_template", label: "Alert template name (stock & new-order alerts)", def: "store_alert" },
    { key: "wa_order_template", label: "Order-update template name", def: "order_update" },
  ] },
  { title: "Shipping", note: "Fill these when you pick a shipping partner. Until then you ship manually and add the tracking number on each order.", fields: [
    { key: "shipping_provider", label: "Shipping partner", def: "manual", type: "select", options: [["manual", "Manual (I book couriers myself)"], ["shiprocket", "Shiprocket"], ["delhivery", "Delhivery"], ["other", "Other"]] },
    { key: "shiprocket_email", label: "Shiprocket login email", def: "" },
    { key: "shiprocket_password", label: "Shiprocket API password", def: "", type: "secret" },
    { key: "delhivery_token", label: "Delhivery API token", def: "", type: "secret" },
    { key: "pickup_name", label: "Pickup location name", def: "Studio" },
    { key: "pickup_pincode", label: "Pickup pincode", def: "" },
    { key: "pickup_address", label: "Pickup address", def: "", type: "area" },
    { key: "shipping_note", label: "Delivery promise shown on product pages", def: "Dispatched in 2–3 working days · delivered in 3–7 days across India" },
    { key: "shipping_flat", label: "Flat shipping charge (₹)", def: "79" },
    { key: "free_shipping_min", label: "Free shipping above (₹)", def: "999" },
  ] },
  { title: "More payment gateways (saved for later)", note: "Razorpay is already live in Admin → Payments. These are stored so they're ready when you connect another gateway.", fields: [
    { key: "cashfree_app_id", label: "Cashfree App ID", def: "" },
    { key: "cashfree_secret_key", label: "Cashfree secret key", def: "", type: "secret" },
    { key: "payu_merchant_key", label: "PayU merchant key", def: "" },
    { key: "payu_salt", label: "PayU salt", def: "", type: "secret" },
  ] },
  { title: "Alerts to you", note: "Get told when stock runs low or an order arrives. Needs Email or WhatsApp above to be set up. Each product's “low stock” level is set on the product.", fields: [
    { key: "alert_low_stock_email", label: "Low-stock alerts by email", def: "1", type: "toggle" },
    { key: "alert_low_stock_whatsapp", label: "Low-stock alerts on WhatsApp", def: "0", type: "toggle" },
    { key: "alert_new_order", label: "Also alert me on every new order", def: "1", type: "toggle" },
    { key: "alert_email", label: "Send alerts to this email", def: "" },
    { key: "alert_whatsapp", label: "Send alerts to this WhatsApp number (with country code, e.g. 919876543210)", def: "" },
  ] },
  { title: "Automatic database backups", note: "A copy of your store data (products, orders, customers, settings) is saved on the server automatically. Download copies from Admin → Backups and keep them somewhere safe (Google Drive, laptop).", fields: [
    { key: "backup_enabled", label: "Back up automatically", def: "1", type: "toggle" },
    { key: "backup_every_hours", label: "Back up every (hours)", def: "24" },
    { key: "backup_keep", label: "Keep the latest (how many backups)", def: "14" },
  ] },
];

export const MARKETING: FieldGroup[] = [
  { title: "Tracking (Google Analytics & Meta Pixel)", note: "Paste your IDs and the site starts measuring visitors and ads. Events sent: PageView, ViewContent, AddToCart, InitiateCheckout, Purchase.", fields: [
    { key: "ga_id", label: "Google Analytics 4 ID (G-XXXXXXXXXX)", def: "" },
    { key: "meta_pixel_id", label: "Meta (Facebook/Instagram) Pixel ID", def: "" },
    { key: "track_events", label: "Send shop events (view product, add to bag, checkout, purchase)", def: "1", type: "toggle" },
  ] },
  { title: "Instagram feed on the homepage", note: "Without an access token, the feed shows your latest reels from Admin → Instagram reels. With a token it shows your real latest Instagram posts. Token: Meta developers → Instagram API → generate a long-lived token for your professional account.", fields: [
    { key: "show_ig_feed", label: "Show Instagram feed on the homepage", def: "1", type: "toggle" },
    { key: "ig_feed_title", label: "Heading", def: "Follow our little studio" },
    { key: "ig_user_id", label: "Instagram user ID (for live feed)", def: "" },
    { key: "ig_access_token", label: "Instagram access token (for live feed)", def: "", type: "secret" },
  ] },
  { title: "WhatsApp shopping", fields: [
    { key: "wa_order_button", label: "“Order on WhatsApp” button on product pages", def: "1", type: "toggle" },
    { key: "wa_cart_button", label: "“Send my bag on WhatsApp” button in the cart", def: "1", type: "toggle" },
    { key: "wa_order_text", label: "Message template ({product} and {link} are filled in)", def: "Hi {store}! I'd love to order: {product} {link}" },
  ] },
  { title: "Product feeds (Google Shopping, Instagram/Facebook Shop, WhatsApp Catalogue)", note: "Feeds update automatically when your products change. Needs “Website address” in Admin → Brand & SEO.", fields: [
    { key: "feeds_enabled", label: "Enable product feeds", def: "1", type: "toggle" },
    { key: "feed_brand", label: "Brand name in feeds", def: "Jasmonoide" },
    { key: "feed_google_category", label: "Google product category", def: "Home & Garden > Decor" },
  ] },
  { title: "Mood finder quiz", fields: [
    { key: "quiz_enabled", label: "Show the mood finder quiz", def: "1", type: "toggle" },
    { key: "quiz_title", label: "Heading", def: "Find the candle that feels like you" },
    { key: "quiz_intro", label: "Intro text", def: "Three quick questions, one little glow made just for your mood." },
  ] },
  { title: "Build-your-own gift box", fields: [
    { key: "box_enabled", label: "Show the gift box builder", def: "1", type: "toggle" },
    { key: "box_title", label: "Heading", def: "Build a box that says it for you" },
    { key: "box_intro", label: "Intro text", def: "Pick your favourites, add a handwritten note, and we'll wrap it all in our kraft gift box." },
    { key: "box_slots", label: "Items per box", def: "3" },
    { key: "box_discount", label: "Box discount (%)", def: "10" },
    { key: "box_note", label: "Packaging line", def: "Wrapped in a kraft box with twine and a handwritten card — free." },
  ] },
];

export const SITE_DEFAULTS: Record<string, string> = Object.fromEntries([...BRAND_SEO, ...ASSISTANT, ...HOME, ...PAYMENTS, ...BUSINESS, ...LEGAL, ...INTEGRATIONS, ...MARKETING].flatMap((g) => g.fields.map((f) => [f.key, f.def])));
