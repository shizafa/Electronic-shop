import en from "@/data/strings/en";
import type { SupportedLocale, TranslationDictionary } from "@/types/i18n";

const dictionaries: Record<SupportedLocale, TranslationDictionary> = {
  en,
};

const activeLocale: SupportedLocale = "en";

// Translates a string key into the active locale's text; falls back to the key itself if missing
export function t(key: string): string {
  return dictionaries[activeLocale][key] ?? key;
}