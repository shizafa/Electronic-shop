import type { SupportedCurrency } from "@/types/i18n";

export interface CurrencyDefinition {
  code: SupportedCurrency;
  symbol: string;
  decimalDigits: number;
  rateFromPKR: number;
}

export const currencies: Record<SupportedCurrency, CurrencyDefinition> = {
  PKR: {
    code: "PKR",
    symbol: "Rs. ",
    decimalDigits: 0,
    rateFromPKR: 1,
  },
};

export const activeCurrency: SupportedCurrency = "PKR";