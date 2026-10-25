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
