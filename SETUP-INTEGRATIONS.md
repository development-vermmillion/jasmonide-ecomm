# Setting up the new features

Everything below is configured in **Admin** (no code). Owners only unless noted.

| What | Where in Admin | What you need |
|---|---|---|
| Google (Gmail) sign-in | Integrations → Google sign-in | Google Cloud Console → Credentials → OAuth client ID (Web). Add redirect URL `https://YOUR-SITE/api/account/google/callback`. Paste Client ID + secret, switch it on. |
| Phone OTP | Integrations → Phone OTP | Starts in **Test mode** (code shown on screen). For real SMS choose MSG91 / Twilio / WhatsApp and fill the keys. **Switch off Test mode before launch.** |
| Email (order mails, alerts) | Integrations → Email (SMTP) | Gmail: `smtp.gmail.com`, port 587, your Gmail + an *App password*. |
| WhatsApp messages | Integrations → WhatsApp Business API | Meta WhatsApp Cloud API phone-number ID + token; approved templates. |
| Shipping partner | Integrations → Shipping | Shiprocket / Delhivery keys (stored for later). |
| Other payment gateways | Integrations → More payment gateways | Cashfree / PayU keys (stored for later). Razorpay is live in Payments. |
| Low-stock & new-order alerts | Integrations → Alerts to you | Email or WhatsApp set up above. "Send low-stock alert now" tests it. |
| Backups | Backups (+ Integrations → Automatic backups) | Nothing. Download copies regularly. |
| Legal pages | Legal pages | Sample text is ready — edit it. |
| GA4 + Meta Pixel | Marketing & tools | Measurement ID (G-…) and Pixel ID. |
| Instagram feed | Marketing & tools | Optional token + user ID for live posts; otherwise shows your reels. |
| Google Shopping / Instagram Shop / WhatsApp Catalogue | Marketing & tools → feed links | Paste `/feeds/google.xml` into Google Merchant Center and `/feeds/meta.csv` into Meta Commerce Manager. Set your real website address in Brand & SEO first. |
| Staff roles | Team & roles | Owner, Manager, Orders & support, Catalogue & stock, Content editor, View only. |
| CSV import / export | Import / export | Download the template, edit, upload. |
| Sales by source / abandoned carts | Sources & carts | Add `?utm_source=instagram&utm_medium=bio` to the links you share. |

Customers' phone-OTP codes, Google logins and order history all appear under *My account* on the store.

## New in this version
- **Forgot password**, **login rate limits**, **pincode delivery check**, **customer cancel order**, branded 404/error pages.
- **Gift cards, store credit, loyalty points, referrals** — Admin → Gift cards & credit, Loyalty & referrals.
- **Refill plans (Subscribe & save)** — Admin → Refill plans. Reminders need Email or WhatsApp set up; add the hourly cron URL shown in Admin → Backups.
- **Order status emails/WhatsApp** and **back-in-stock alerts** — switches in Admin → Integrations.
- **Installable app (PWA)** — works on https; upload an icon in Marketing & tools.
- **Insights & Click heatmap** — Admin → Insights / Click heatmap. First-party, no external tool; your own admin visits are ignored.
