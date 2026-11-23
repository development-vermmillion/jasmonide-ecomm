/** Editable-content fields (Admin → Brand & SEO, Admin → Homepage). Key → default. */
export type Field = { key: string; label: string; def: string; type?: "text" | "area" | "image" | "toggle" | "url"; help?: string };
export type FieldGroup = { title: string; note?: string; fields: Field[] };

export const BRAND_SEO: FieldGroup[] = [
  { title: "Brand identity", note: "Used in the header, footer, browser tab, emails and share previews.", fields: [
    { key: "store_name", label: "Brand name", def: "Jasmonoide" },
    { key: "tagline", label: "Tagline (short)", def: "Materials, moulds & kits for makers" },
    { key: "site_description", label: "Brand description (about 150 characters)", def: "Jesmonite, resin, moulds, pigments and kits for makers. Shipped across India.", type: "area", help: "Shown in Google results and when your link is shared." },
    { key: "logo_url", label: "Logo", def: "", type: "image", help: "Leave empty to show the brand name as text." },
    { key: "favicon_url", label: "Favicon (browser-tab icon, square PNG)", def: "", type: "image" },
    { key: "og_image", label: "Share image (1200×630) for WhatsApp/Instagram/Google", def: "", type: "image" },
    { key: "theme_color", label: "Browser theme colour (hex)", def: "#6d5a9c" },
  ] },
  { title: "Search engine (SEO)", fields: [
    { key: "site_url", label: "Website address (no trailing slash)", def: "https://www.yourdomain.com", type: "url", help: "Needed for the sitemap, canonical links and schema." },
    { key: "seo_home_title", label: "Home page title (50–60 chars)", def: "Jasmonoide — Jesmonite, resin & mould supplies in India" },
    { key: "seo_home_desc", label: "Home page meta description (140–160 chars)", def: "Buy jesmonite, epoxy resin, silicone moulds, pigments and kits. Free shipping above ₹999, COD available.", type: "area" },
    { key: "seo_title_suffix", label: "Title ending on other pages", def: " · Jasmonoide" },
    { key: "seo_keywords", label: "Keywords (comma separated, optional)", def: "jesmonite, epoxy resin, silicone moulds, resin art supplies, decor casting" },
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
    { key: "llms_about", label: "About us for AI (plain facts: who, what, where, how long, what makes you different)", def: "We are a maker-supply store selling jesmonite, resin, moulds and kits across India.", type: "area" },
    { key: "llms_facts", label: "Key facts for AI (one per line: shipping, returns, payment, specialities)", def: "Ships across India\nCash on delivery available\n7-day returns on unused items", type: "area" },
  ] },
];

export const ASSISTANT: FieldGroup[] = [
  { title: "AI shopping assistant", note: "Runs on your own server — free, no API. Teach it in Admin → Assistant (chats & taught answers), FAQs, and the box below.", fields: [
    { key: "assistant_log_chats", label: "Save visitor questions so I can review and teach the assistant", def: "1", type: "toggle" },
    { key: "assistant_name", label: "Assistant name", def: "Maya" },
    { key: "assistant_greeting", label: "Greeting", def: "Hi! I'm Maya. Ask me about products, shipping, returns — or tell me what you want to make!", type: "area" },
    { key: "assistant_extra", label: "Extra knowledge (one fact per line, e.g. “Jesmonite sets in 30–40 minutes”)", def: "", type: "area" },
  ] },
];

export const HOME: FieldGroup[] = [
  { title: "Hero banner", fields: [
    { key: "hero_eyebrow", label: "Small label above headline", def: "New · 01" },
    { key: "hero_title", label: "Headline", def: "Make something worth keeping" },
    { key: "hero_text", label: "Sub-text", def: "Jesmonite, resin, moulds, pigments and finishing — everything for decor and dressing-table pieces.", type: "area" },
    { key: "hero_cta", label: "Button text", def: "Shop all" },
    { key: "hero_link", label: "Button link", def: "/shop" },
    { key: "hero_image", label: "Hero image", def: "", type: "image" },
  ] },
  { title: "Side promo tiles", fields: [
    { key: "promo1_title", label: "Tile 1 title", def: "Combos & kits" }, { key: "promo1_text", label: "Tile 1 text", def: "Save more when you bundle" }, { key: "promo1_link", label: "Tile 1 link", def: "/combos" }, { key: "promo1_image", label: "Tile 1 image", def: "", type: "image" },
    { key: "promo2_title", label: "Tile 2 title", def: "Sale" }, { key: "promo2_text", label: "Tile 2 text", def: "Limited-time offers" }, { key: "promo2_link", label: "Tile 2 link", def: "/sale" }, { key: "promo2_image", label: "Tile 2 image", def: "", type: "image" },
  ] },
  { title: "Trust strip (4 boxes)", fields: [
    { key: "show_usp", label: "Show this strip", def: "1", type: "toggle" },
    { key: "usp1_title", label: "Box 1 title", def: "Free shipping" }, { key: "usp1_text", label: "Box 1 text", def: "On orders above ₹999" },
    { key: "usp2_title", label: "Box 2 title", def: "Quality materials" }, { key: "usp2_text", label: "Box 2 text", def: "Tested for makers" },
    { key: "usp3_title", label: "Box 3 title", def: "Cash on delivery" }, { key: "usp3_text", label: "Box 3 text", def: "Or pay by UPI" },
    { key: "usp4_title", label: "Box 4 title", def: "Maker support" }, { key: "usp4_text", label: "Box 4 text", def: "Help on WhatsApp" },
  ] },
  { title: "Section headings", fields: [
    { key: "cat_eyebrow", label: "Categories — label", def: "Shop by category" }, { key: "cat_title", label: "Categories — heading", def: "Everything for the craft" }, { key: "show_categories", label: "Show categories", def: "1", type: "toggle" },
    { key: "new_eyebrow", label: "New arrivals — label", def: "Just in" }, { key: "new_title", label: "New arrivals — heading", def: "Fresh from the studio" },
    { key: "sale_eyebrow", label: "Sale rail — label", def: "Limited time" }, { key: "sale_title", label: "Sale rail — heading", def: "On sale" },
    { key: "combo_eyebrow", label: "Combos rail — label", def: "Save more" }, { key: "combo_title", label: "Combos rail — heading", def: "Combos & kits" },
    { key: "learn_eyebrow", label: "Courses rail — label", def: "Learn" }, { key: "learn_title", label: "Courses rail — heading", def: "E-courses & guides" }, { key: "show_learn", label: "Show courses rail", def: "1", type: "toggle" },
  ] },
  { title: "Inspiration / projects", fields: [
    { key: "show_projects", label: "Show this section", def: "1", type: "toggle" },
    { key: "proj_eyebrow", label: "Label", def: "Community" }, { key: "proj_title", label: "Heading", def: "Projects to inspire you" },
    { key: "proj1_title", label: "Project 1 title", def: "Marble-effect coaster set" }, { key: "proj1_image", label: "Project 1 image", def: "", type: "image" }, { key: "proj1_link", label: "Project 1 link (blog post etc.)", def: "/blog" },
    { key: "proj2_title", label: "Project 2 title", def: "Resin & wood serving tray" }, { key: "proj2_image", label: "Project 2 image", def: "", type: "image" }, { key: "proj2_link", label: "Project 2 link", def: "/blog" },
    { key: "proj3_title", label: "Project 3 title", def: "Jesmonite dressing-table jar" }, { key: "proj3_image", label: "Project 3 image", def: "", type: "image" }, { key: "proj3_link", label: "Project 3 link", def: "/blog" },
  ] },
  { title: "Brand story", fields: [
    { key: "show_story", label: "Show this section", def: "1", type: "toggle" },
    { key: "story_title", label: "Heading", def: "Made by makers, for makers" },
    { key: "story_text", label: "Text", def: "Tell customers who you are, how long you have been doing this and why they should trust your materials.", type: "area" },
    { key: "stat1_n", label: "Stat 1 number", def: "10+" }, { key: "stat1_l", label: "Stat 1 label", def: "years" },
    { key: "stat2_n", label: "Stat 2 number", def: "50k+" }, { key: "stat2_l", label: "Stat 2 label", def: "makers served" },
    { key: "stat3_n", label: "Stat 3 number", def: "28" }, { key: "stat3_l", label: "Stat 3 label", def: "states shipped" },
  ] },
  { title: "Blog teaser & press", fields: [
    { key: "show_blog_home", label: "Show latest blog posts on home", def: "1", type: "toggle" },
    { key: "show_press", label: "Show “As featured in” strip", def: "0", type: "toggle" },
    { key: "press_names", label: "Press names (comma separated)", def: "PressLogo, DailyCraft, MakerWeekly" },
  ] },
  { title: "Top bar & footer", fields: [
    { key: "announcement", label: "Announcement bar text", def: "Free shipping above ₹999 · Bulk order enquiries on WhatsApp" },
    { key: "footer_about", label: "Footer about text", def: "Materials, moulds & kits for makers.", type: "area" },
    { key: "newsletter_title", label: "Newsletter heading", def: "Join the maker's club" },
    { key: "newsletter_text", label: "Newsletter text", def: "New arrivals, tutorials and offers — no spam." },
  ] },
];

export const SITE_DEFAULTS: Record<string, string> = Object.fromEntries([...BRAND_SEO, ...ASSISTANT, ...HOME].flatMap((g) => g.fields.map((f) => [f.key, f.def])));
