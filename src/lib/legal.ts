/**
 * Sample legal pages (markdown). {{tokens}} are replaced with your store details at display time,
 * so they stay correct when you change them in Admin. Edit the full text in Admin → Legal pages.
 * These are starting points written for an Indian online store — please have them reviewed by a lawyer/CA.
 */
export const LEGAL_PAGES: { slug: string; key: string; title: string; def: string }[] = [
  { slug: "privacy", key: "legal_privacy", title: "Privacy policy", def: `## Our promise
{{store}} ("we", "us") respects your privacy. This policy explains what we collect when you use {{site}}, why we collect it and the choices you have. By using the website you agree to this policy.

## What we collect
- **Details you give us:** name, phone number, email address, delivery address, order notes, and messages you send through forms or WhatsApp.
- **Account details:** if you create an account or sign in with Google or a phone OTP, we store your name, email/phone and order history.
- **Payment information:** payments are handled by our payment partners (for example Razorpay or your UPI app). We never see or store your card number, CVV, UPI PIN or net-banking password.
- **Technical data:** device, browser, pages visited and the website or ad you came from, collected with cookies and similar tools (see our Cookie policy).

## How we use it
- To process, pack, ship and support your order, and send order updates.
- To run your account, sign-in and saved addresses.
- To reply to your questions and handle returns or refunds.
- To send newsletters or offers **only if you subscribe** — you can unsubscribe at any time.
- To understand which pages and ads work, and to improve the website.
- To prevent fraud and meet legal, tax and accounting duties (for example GST invoices).

## Who we share it with
Only with people who help us serve you: courier and shipping partners (name, phone and address), payment gateways, email/WhatsApp/SMS providers, analytics and advertising tools (Google, Meta), and our hosting provider. We do **not** sell your personal data.

## How long we keep it
Order and invoice records are kept as long as the law requires (usually up to 8 years). Other data is kept while your account is active or until you ask us to delete it.

## Your rights
You may ask to see, correct or delete the personal data we hold about you, withdraw consent, or opt out of marketing. Write to **{{email}}** and we will respond within a reasonable time, as required by the Digital Personal Data Protection Act, 2023 and other applicable Indian law.

## Security
We use secure connections and limit who can see customer data. No website is 100% secure, so please keep your passwords and OTPs private.

## Children
Our store is meant for adults. We do not knowingly collect data from children under 18.

## Changes and contact
We may update this policy and will change the date below when we do. Questions? Email **{{email}}**, call {{phone}} or write to {{address}}.

*Last updated: {{updated}}*` },

  { slug: "terms", key: "legal_terms", title: "Terms of service", def: `## Welcome
These terms apply to every visit and purchase on {{site}}, run by **{{legal_name}}** ("{{store}}", "we"). By using the website or placing an order you agree to them.

## Products
We hand-make candles and décor in small batches, so colour, texture and finish can vary slightly from photos — that is part of the charm. Raw materials (jesmonite, resin, cement, pigments) are sold for crafting use; please read the product page and follow safety instructions, including gloves, ventilation and keeping them away from children.

## Candle safety
Never leave a burning candle unattended, keep it away from children, pets and flammable things, trim the wick to 5 mm before lighting and stop using it when about 1 cm of wax remains. We are not responsible for damage caused by misuse.

## Prices and payment
Prices are in Indian rupees (₹) and include GST unless stated. We may change prices or correct errors at any time before an order is confirmed. Payment methods shown at checkout may include UPI, cards, net banking, wallets and cash on delivery.

## Orders
An order is accepted only after we confirm it. We may cancel an order if an item is out of stock, a price was shown incorrectly, or we suspect fraud; if you have already paid we will refund you in full.

## Shipping, returns and refunds
See our Shipping policy and Return & refund policy — they are part of these terms.

## Accounts
Keep your sign-in details and OTPs private. You are responsible for activity on your account. Provide correct information, including a working phone number for delivery.

## Intellectual property
All photos, text, designs and logos on this website belong to {{store}} and may not be copied or used commercially without written permission.

## Liability
To the extent the law allows, our liability for any claim is limited to the amount you paid for the product concerned. We are not liable for delays caused by couriers, weather or events beyond our control.

## Governing law
These terms are governed by the laws of India. Courts at {{city}} have jurisdiction over any dispute.

## Contact
{{legal_name}}, {{address}}. Email **{{email}}**, phone {{phone}}.

*Last updated: {{updated}}*` },

  { slug: "shipping", key: "legal_shipping", title: "Shipping policy", def: `## Where we deliver
We deliver across India to all serviceable pincodes. Enter your pincode at checkout to confirm delivery to your area.

## Dispatch time
Most orders are packed by hand and dispatched within **2–3 working days**. Made-to-order and large gift boxes may take up to 5–7 working days — we will tell you if so.

## Delivery time
After dispatch, delivery usually takes **3–7 working days** depending on your location (metros are faster; remote areas may take longer).

## Shipping charges
Shipping is **free on orders above ₹{{free_shipping_min}}**. Below that, a flat charge of ₹{{shipping_flat}} applies. Cash-on-delivery orders may carry an extra handling fee if shown at checkout.

## Tracking
Once your order ships you will get the tracking details by WhatsApp/email, and you can always check your order on our Track order page using your order number and phone number.

## Packaging
Every candle and décor piece is wrapped carefully, because they are fragile. Please open the parcel with a video if anything looks damaged (see Return & refund policy).

## Delays
Couriers sometimes run late because of weather, strikes or festivals. We will help you chase your parcel — write to **{{email}}**.

## Wrong address
Please double-check your address and phone number. If a parcel comes back to us because of a wrong address, re-shipping charges may apply.

*Last updated: {{updated}}*` },

  { slug: "refund", key: "legal_refund", title: "Return & refund policy", def: `## Our promise
We want you to love what you ordered. If something is not right, we will make it right.

## Returns and replacements — {{return_days}} days
You can ask for a return or replacement within **{{return_days}} days of delivery** if:
- the product arrived **damaged, broken or leaking**,
- you received the **wrong item**, or
- the product is **significantly different** from what was described.

Please share clear photos and an **unboxing video** on WhatsApp ({{phone}}) or email **{{email}}** within 48 hours of delivery for damage claims.

## What cannot be returned
- Candles that have been **lit or used**, and anything personalised or made to order.
- Opened or mixed **raw materials** (jesmonite, resin, cement, pigments, wax) and other consumables, unless they arrived damaged or wrong.
- Digital products and courses.
- Gift sets with missing items or packaging.

## How to request
Go to your order page (or Account → Orders) and choose **Request a return**, or write to us with your order number. We will confirm within 1–2 working days.

## Refunds
Once we approve the return, we refund to your **original payment method** within **5–7 working days** (UPI/cards/net banking). For cash-on-delivery orders, we refund by bank transfer or UPI — please share the details. Shipping charges are refunded only if the mistake was ours.

## Cancellations
You can cancel before the order ships by contacting us. After shipping, the return process applies.

## Questions?
Email **{{email}}** or call {{phone}}.

*Last updated: {{updated}}*` },

  { slug: "cookies", key: "legal_cookies", title: "Cookie policy", def: `## What are cookies?
Cookies are small files saved on your device so a website can remember you and work properly.

## How we use them
- **Essential:** keep your cart, sign-in and checkout working. These cannot be turned off.
- **Preferences:** remember settings like dark/light mode and your wishlist.
- **Analytics:** tools such as Google Analytics help us see which pages are popular, so we can improve the website.
- **Marketing:** tools such as the Meta (Facebook/Instagram) Pixel help us measure our ads and show relevant offers. We also note which website or campaign brought you here (for example Instagram or Google).

## Your choices
You can accept or decline optional cookies in the banner shown on your first visit, and you can delete or block cookies in your browser settings. Blocking some cookies may stop parts of the store from working.

## More information
See our Privacy policy, or email **{{email}}**.

*Last updated: {{updated}}*` },
];

export function fillLegal(text: string, s: Record<string, string>) {
  const map: Record<string, string> = {
    store: s.store_name, site: (s.site_url || "").replace(/^https?:\/\//, "") || "our website", legal_name: s.business_legal_name || s.store_name,
    email: s.email, phone: s.phone, address: (s.business_address || s.address || "").replace(/\n/g, ", "), city: s.business_type_note || s.business_state || "our city",
    return_days: s.return_days, free_shipping_min: s.free_shipping_min, shipping_flat: s.shipping_flat, updated: s.legal_updated || "",
  };
  return text.replace(/\{\{(\w+)\}\}/g, (_, k) => map[k] ?? "")
    .replace(/^(#{1,3} .*)\n(?!\n)/gm, "$1\n\n")          // heading always on its own block
    .replace(/^([^\n-*#][^\n]*)\n(?=[-*] )/gm, "$1\n\n");   // blank line before a bullet list
}
