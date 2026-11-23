# Jasmonoide Store — Next.js + React e-commerce with full admin

A complete storefront + admin dashboard (Next.js 14 App Router, React 18, Tailwind, SQLite via libSQL).
Design is modelled on bohriali.com: warm off-white, editorial headings, category mega-menu, product rails,
quick-add cards, "Choose & add" for variable products, combos, sale and learn sections.

All images, copy, products and prices are **placeholders / sample data** — replace them from the admin.

## Quick start

```bash
npm install
cp .env.example .env.local      # then edit AUTH_SECRET + admin login
npm run dev                     # http://localhost:3000
```

The database (`data/store.db`) is created and filled with sample categories, products, combos, coupons
and ~45 demo orders on first run. Reset it any time with `npm run db:reset`.

* Storefront: http://localhost:3000
* Admin: http://localhost:3000/admin  — default login `admin@example.com` / `admin123`
  (set `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env.local` **before the first run**, or change the password in Admin → Team & users)

Production: `npm run build && npm start` (needs Node 18.17+). Always set a long random `AUTH_SECRET`.

## What's included

### Storefront
Home (hero banners, category circles, new/bestseller tabs, sale rail, combos rail, category rails, courses, projects, brand story),
Shop with search / category filter / sort, category pages, **Sale** page, **Combos** page, product page (gallery, variant picker,
stock status, "what's in this combo", related products, WhatsApp enquiry), slide-out bag + cart page, checkout
(COD / UPI-bank transfer, coupon codes, free-shipping threshold, tax), order confirmation, order tracking (order no. + phone), policy pages.

### Product types (Admin → Products → Add)
1. **Simple** – one price, one stock count
2. **Variable** – options such as size/weight, each with own price, sale price, SKU and stock
3. **Combo / bundle** – pick existing products (and options) + quantities; value is auto-calculated, set a bundle price (one-click 10/15/20% off);
   stock is derived from the items and each item is deducted when a combo sells
4. **Digital / course** – no stock, no shipping, download/course link

Products on sale: per-product sale price with optional start/end dates (variants too), plus a **bulk sale tool**
(Admin → Sales & offers) to put a whole category or the whole store on x% off, and clear it again.

### Admin dashboard
* **Dashboard** – revenue, orders, AOV (with % change vs previous period), open orders, customers, stock value, low-stock alerts,
  revenue chart, orders by status, top products, sales by category, payment methods, recent orders (7/30/90 days)
* **Products** – search/filter by type/category/status, bulk publish/unpublish/feature/delete, image upload (reorder), SEO fields, drafts
* **Categories**, **Inventory & stock** (adjust / set stock, low & out-of-stock filters, stock movement log, CSV export),
  **Orders** (status, payment status, tracking ref, notes, printable invoice, WhatsApp customer, auto stock restore on cancel/return),
  **Customers** (auto-created at checkout), **Coupons** (percent/fixed, minimum order, usage limit, expiry),
  **Sales reports** (gross/discount/shipping/tax/net, by product/category/state/day, coupon usage, CSV exports),
  **Settings** (store name, hero text, announcement, contact, shipping, tax, payment methods, UPI id),
  **Team & users** (owner / staff roles, change password)

## Project layout
```
src/app/(shop)/*        storefront pages        src/app/admin/(panel)/*   admin pages
src/app/api/*           route handlers          src/lib/*                 db, schema, seed, pricing, orders, stats
src/components/*        UI (admin/ for admin)   uploads/                  admin-uploaded images (served at /uploads/…)
```

## Replacing placeholders
* Products/categories/images: edit or delete the sample items in Admin (Products → select all → Delete), then add your own.
* Hero / promo images on the home page: `src/app/(shop)/page.tsx` (look for `placeholder(`).
* Policy pages text: `src/app/(shop)/page/[slug]/page.tsx`. Logo: text logo in `src/components/Header.tsx`.
* Colours: `tailwind.config.js` (`paper`, `ink`, `clay`).

## Deploying
* **VPS / Docker / Railway / Render with a disk**: works as-is (SQLite file + `uploads/` folder must be on persistent storage).
* **Vercel / serverless**: use a hosted DB and image storage —
  set `DATABASE_URL=libsql://…` and `DATABASE_AUTH_TOKEN` (Turso, same code), and swap `src/app/api/admin/upload/route.ts`
  to upload to S3 / Cloudinary / Vercel Blob.
* Behind plain HTTP (no HTTPS) in production add `INSECURE_COOKIES=1`, otherwise the admin cookie is `secure`-only.

## Next steps you may want
Online payments (Razorpay/Stripe — create the order in `src/lib/orders.ts`, then mark `payment_status=paid` from the webhook),
customer accounts/wishlist, email/SMS notifications, GST invoice format, shipping-rate tables or courier API, image CDN.


## Feature switches, reels & more (v3)

**Admin → Settings → Feature switches** turns features on/off instantly (save to apply): Cash on delivery, UPI, coupons, guest checkout, combos, sales, sold-out products, low-stock message, back-in-stock alerts, Instagram reels, reviews (+ auto-approve), wishlist, recently viewed, newsletter, customer accounts, returns & refunds, order tracking, contact form, WhatsApp button, search, announcement bar, light/dark toggle and **maintenance mode** (only a signed-in admin can see the store).

- **Products, combos, coupons, reels, reviews** each have an Active/Draft switch in their list. The product form has the same switch.
- **Instagram reels:** Admin → Instagram reels (home page + linked product) or the "Instagram reels for this product" box inside any product. Paste a public reel link (replace the sample `REPLACE_ME` links). You can also upload your own mp4/webm.
- **Light/dark theme** button for visitors (header) and admin (sidebar). Colours are plain pastels, no gradients.
- Also included: customer accounts, wishlist, reviews, returns/refund requests, newsletter, contact inbox, live search, filters + pagination, recently viewed, SEO schema, sitemap/robots, scroll animations.
- Existing database? New tables are empty — run `npm run db:reset` once to get the sample reels and reviews.
- Still needs third-party keys (not included): online payment gateway (Razorpay/Stripe), courier APIs, e-mail/SMS sending.


## v4 — no-code content control

- **Admin → Brand, SEO & AI:** brand name, tagline, description, logo, favicon, share image, site URL, home title/description, keywords, Google/Bing verification, Google Analytics, Meta Pixel, "hide from Google" switch, AI-crawler switch and AI-facts.
- **Admin → Homepage content:** every heading, text, image, link, stat and section on/off for the home page.
- **Admin → Blog:** write posts (headings, lists, links, images), cover, tags, per-post SEO and FAQ. Article + FAQ schema is added automatically.
- **Admin → FAQs:** appear on /faq, in Google (FAQ schema), in /llms.txt and to the assistant.
- **AI search (GEO):** `/llms.txt`, `robots.txt` rules for GPTBot/ClaudeBot/PerplexityBot/Google-Extended, Organization/Product/Article/FAQ schema, sitemap. Set your real **Website address** in Brand, SEO & AI first, then submit `/sitemap.xml` in Google Search Console.
- **AI assistant (local & free):** runs inside your server, no paid API. It answers from your products, FAQs, policies, blog and taught answers. Admin → AI assistant shows visitor questions (flags the ones it couldn't answer), lets you teach better answers, and collects thumbs up/down. Optional: install free Ollama and set `OLLAMA_URL` in `.env.local` to let a local model phrase replies.
- **Mobile:** sticky "Add to bag" bar on product pages, full-screen chat and reel player on phones, safe-area support for Instagram's in-app browser, no sideways scrolling.

## Bulk discounts
Admin → Bulk discounts: automatic discounts by quantity (e.g. 10–20 pcs) or order value, on all products, one category or one product, as % or fixed ₹. Each rule has an On/Off switch and optional dates; the whole feature has a switch in Settings. The best single matching rule applies; coupons work on top. Customers see a "Bulk savings" box on product pages and a "Add 2 more to get 5% off" nudge in the cart.
