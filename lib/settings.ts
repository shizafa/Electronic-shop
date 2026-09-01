import { cache } from "react";
import { createClient } from "@/lib/supabase/public";

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
};

// Store branding, read with the no-cookie public client (same reasoning as
// lib/categories.ts) so pages that only need this — /about, the root layout — can still be
// statically prerendered. Falls back to hardcoded defaults if the row is missing or a field
// is null, so the header/footer/metadata never render empty.
export const getSettings = cache(async (): Promise<StoreSettings> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("store_settings")
    .select(
      "store_name, tagline, logo_url, favicon_url, email, phone, whatsapp, address, facebook_url, instagram_url, twitter_url, youtube_url, currency_code, currency_symbol, shipping_flat_rate, free_shipping_threshold, tax_percent, cod_enabled, shipping_policy, return_policy, privacy_policy, terms"
    )
    .eq("id", 1)
    .maybeSingle();
  if (error || !data) {
    if (error) console.error("getSettings failed", error);
    return FALLBACK;
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
  };
});
