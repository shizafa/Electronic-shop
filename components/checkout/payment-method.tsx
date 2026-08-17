"use client";

import { CircleCheck } from "lucide-react";
import { formatPrice } from "@/lib/currency";
import { t } from "@/lib/i18n";
import type { PaymentMethod } from "@/types/order";

// maximum order total (in the store's currency units) allowed for Cash on Delivery
export const COD_MAX_ORDER_VALUE = 300000;

const PAYMENT_METHODS: { value: PaymentMethod; labelKey: string; descriptionKey?: string }[] = [
  { value: "cod", labelKey: "paymentMethod.cod", descriptionKey: "checkout.codDescription" },
  { value: "jazzcash", labelKey: "paymentMethod.jazzcash", descriptionKey: "checkout.onlineMethodDescription" },
  {
    value: "easypaisa",
    labelKey: "paymentMethod.easypaisa",
    descriptionKey: "checkout.onlineMethodDescription",
  },
  { value: "card", labelKey: "paymentMethod.card", descriptionKey: "checkout.onlineMethodDescription" },
  { value: "raast", labelKey: "paymentMethod.raast", descriptionKey: "checkout.onlineMethodDescription" },
];

interface PaymentMethodSelectorProps {
  value: PaymentMethod;
  onChange: (value: PaymentMethod) => void;
  orderTotal: number;
}

// PaymentMethodSelector — lets the user choose a payment method; disables COD above the order value limit
export function PaymentMethodSelector({ value, onChange, orderTotal }: PaymentMethodSelectorProps) {
  const isCodAllowed = orderTotal <= COD_MAX_ORDER_VALUE;

  return (
    <div className="flex flex-col gap-2">
      {PAYMENT_METHODS.map((method) => {
        // COD is blocked once the order total exceeds the allowed limit
        const isDisabled = method.value === "cod" && !isCodAllowed;
        const isSelected = value === method.value;

        return (
          <button
            key={method.value}
            type="button"
            disabled={isDisabled}
            onClick={() => onChange(method.value)}
            className={`flex items-start justify-between gap-3 rounded-lg border p-3 text-left transition-colors ${
              isSelected ? "border-primary bg-primary/5" : "border-border"
            } disabled:cursor-not-allowed disabled:opacity-40`}
          >
            <div>
              <p className="text-sm font-medium text-foreground">{t(method.labelKey)}</p>
              {method.value === "cod" && !isCodAllowed ? (
                <p className="text-xs text-destructive">
                  {t("checkout.codLimitExceeded")} {formatPrice(COD_MAX_ORDER_VALUE)}
                </p>
              ) : method.descriptionKey ? (
                <p className="text-xs text-muted-foreground">{t(method.descriptionKey)}</p>
              ) : null}
            </div>
            {isSelected && <CircleCheck className="size-5 shrink-0 text-primary" />}
          </button>
        );
      })}
    </div>
  );
}