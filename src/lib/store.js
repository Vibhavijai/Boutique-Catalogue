import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL,
  key = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const ready = !!(
  url &&
  key &&
  !url.includes("YOUR_PROJECT") &&
  !key.includes("YOUR_SUPABASE")
);
export const db = ready ? createClient(url, key) : null;
export const shop = {
  name: import.meta.env.VITE_SHOP_NAME || "MAISON VASTRA",
  tag: import.meta.env.VITE_SHOP_TAGLINE || "CLOTHING, CURATED",
  wa: (import.meta.env.VITE_WHATSAPP_NUMBER || "919876543210").replace(
    /\D/g,
    "",
  ),
  address: import.meta.env.VITE_SHOP_ADDRESS || "Visit us in store",
  currency: import.meta.env.VITE_CURRENCY || "INR",
};
export const price = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: shop.currency,
    maximumFractionDigits: 0,
  }).format(Number(n || 0));
export const waLink = (m) =>
  shop.wa
    ? `https://wa.me/${shop.wa}?text=${encodeURIComponent(m)}`
    : "#contact";
export const image = (url) => url || "";
const shirtPhotos = [
  "WhatsApp Image 2026-10-23 at 12.00.50 AM.jpeg",
  "WhatsApp Image 2026-10-23 at 12.00.50 AM (1).jpeg",
  "WhatsApp Image 2026-10-23 at 12.00.51 AM.jpeg",
  "WhatsApp Image 2026-10-23 at 12.00.52 AM.jpeg",
  "WhatsApp Image 2026-10-23 at 12.00.53 AM.jpeg",
];

const shirtProducts = shirtPhotos.map((photo, index) => ({
  id: `shirt-${index + 1}`,
  title: [
    "Blue Check Cotton Shirt",
    "Rose Plaid Shirt",
    "Pastel Stripe Shirt",
    "Navy Check Shirt",
    "Earth Stripe Shirt",
  ][index],
  price: [1299, 1399, 1299, 1399, 1499][index],
  gender: "Men",
  category: "Shirts",
  product_code: `M-${101 + index}`,
  sizes: "S, M, L, XL",
  colors: ["Sky blue", "Rose", "Pastel", "Navy", "Ivory · Brown"][index],
  description:
    "A considered everyday shirt, selected for comfort and easy style.",
  image_url: `/images/men_shirts/${encodeURIComponent(photo)}`,
  available: true,
  featured: index === 0,
}));

export const demos = shirtProducts;
