import en from "@/data/strings/en";
import type { SupportedLocale, TranslationDictionary } from "@/types/i18n";

const dictionaries: Record<SupportedLocale, TranslationDictionary> = {
  en,
};

const activeLocale: SupportedLocale = "en";

export function t(key: string): string {
  return dictionaries[activeLocale][key] ?? key;
}