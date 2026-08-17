import { activeCurrency, currencies } from "@/data/currencies";
import type { SupportedCurrency } from "@/types/i18n";

// Converts a PKR amount into the target currency and formats it with its symbol
export function formatPrice(
  amountInPKR: number,
  currency: SupportedCurrency = activeCurrency
): string {
  const definition = currencies[currency];
  const convertedAmount = amountInPKR * definition.rateFromPKR; // all prices are stored in PKR internally
  const formattedNumber = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: definition.decimalDigits,
    maximumFractionDigits: definition.decimalDigits,
  }).format(convertedAmount);

  return `${definition.symbol}${formattedNumber}`;
}