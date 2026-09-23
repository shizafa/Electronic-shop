import { cache } from "react";
import { createClient } from "@/lib/supabase/public";

// One card in the product page's "Why shop with us" row — same 3 (usually) cards on every
// product, admin-editable, stored as jsonb on store_settings rather than per-product.
export interface WhyShopFeature {
  icon: string;
  title: string;
  desc: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  twitterUrl: string | null;
  youtubeUrl: string | null;
  currencyCode: string;
  currencySymbol: string;
  shippingFlatRate: number;
  freeShippingThreshold: number | null;
  taxPercent: number;
  codEnabled: boolean;
  shippingPolicy: string | null;
  returnPolicy: string | null;
  privacyPolicy: string | null;
  terms: string | null;
  whyShopIntro: string | null;
  whyShopFeatures: WhyShopFeature[];
}

const FALLBACK: StoreSettings = {
  storeName: "Electronics",
  tagline: null,
  logoUrl: null,
  faviconUrl: null,
  email: null,
  phone: null,
  whatsapp: null,
  address: null,
  facebookUrl: null,
  instagramUrl: null,
  twitterUrl: null,
  youtubeUrl: null,
  currencyCode: "PKR",
  currencySymbol: "Rs. ",
  shippingFlatRate: 0,
  freeShippingThreshold: null,
  taxPercent: 0,
  codEnabled: true,
  shippingPolicy: null,
  returnPolicy: null,
  privacyPolicy: null,
  terms: null,
  whyShopIntro: null,
  whyShopFeatures: [
    {
      icon: "fa-regular fa-shield-check",
      title: "Genuine Product",
      desc: "100% authentic, sourced directly from authorized distributors.",
    },
    { icon: "fa-regular fa-truck", title: "Free Shipping", desc: "2–3 weeks free delivery nationwide on this item." },
    { icon: "fa-regular fa-rotate-left", title: "7 Days Return", desc: "Free returns within 7 days of purchase." },
  ],
};

// Store branding, read with the no-cookie public client (same reasoning as
// lib/categories.ts) so pages that only need this — /about, the root layout — can still be
// statically prerendered. Returns null if the row can't be read — use this where the defaults
// would be wrong rather than just blank (placeOrder: a 0 shipping fee / 0% tax undercharges).
export const getStoredSettings = cache(async (): Promise<StoreSettings | null> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("store_settings")
    .select(
      "store_name, tagline, logo_url, favicon_url, email, phone, whatsapp, address, facebook_url, instagram_url, twitter_url, youtube_url, currency_code, currency_symbol, shipping_flat_rate, free_shipping_threshold, tax_percent, cod_enabled, shipping_policy, return_policy, privacy_policy, terms, why_shop_intro, why_shop_features"
    )
    .eq("id", 1)
    .maybeSingle();
  if (error || !data) {
    if (error) console.error("getStoredSettings failed", error);
    return null;
  }
  return {
    storeName: data.store_name || FALLBACK.storeName,
    tagline: data.tagline,
    logoUrl: data.logo_url,
    faviconUrl: data.favicon_url,
    email: data.email,
    phone: data.phone,
    whatsapp: data.whatsapp,
    address: data.address,
    facebookUrl: data.facebook_url,
    instagramUrl: data.instagram_url,
    twitterUrl: data.twitter_url,
    youtubeUrl: data.youtube_url,
    currencyCode: data.currency_code || FALLBACK.currencyCode,
    currencySymbol: data.currency_symbol || FALLBACK.currencySymbol,
    shippingFlatRate: Number(data.shipping_flat_rate),
    freeShippingThreshold: data.free_shipping_threshold !== null ? Number(data.free_shipping_threshold) : null,
    taxPercent: Number(data.tax_percent),
    codEnabled: data.cod_enabled,
    shippingPolicy: data.shipping_policy,
    returnPolicy: data.return_policy,
    privacyPolicy: data.privacy_policy,
    terms: data.terms,
    whyShopIntro: data.why_shop_intro,
    whyShopFeatures:
      Array.isArray(data.why_shop_features) && data.why_shop_features.length > 0
        ? data.why_shop_features
        : FALLBACK.whyShopFeatures,
  };
});

// Same as getStoredSettings, but falls back to hardcoded defaults if the row is missing, so the
// header/footer/metadata never render empty.
export const getSettings = cache(async (): Promise<StoreSettings> => (await getStoredSettings()) ?? FALLBACK);
