import type { SupportedCurrency } from "@/types/i18n";

// Currency formatting config, used by lib/currency.ts to display prices.
export interface CurrencyDefinition {
  code: SupportedCurrency;
  symbol: string;
  decimalDigits: number;
  rateFromPKR: number; // conversion rate from PKR, for potential multi-currency support
}

export const currencies: Record<SupportedCurrency, CurrencyDefinition> = {
  PKR: {
    code: "PKR",
    symbol: "Rs. ",
    decimalDigits: 0,
    rateFromPKR: 1,
  },
};

// Only PKR is supported today; this is the currency used everywhere prices are shown.
export const activeCurrency: SupportedCurrency = "PKR";