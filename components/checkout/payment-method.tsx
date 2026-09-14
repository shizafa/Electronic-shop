"use client";

import type { Ref } from "react";
import { StripeCardElement, type StripeCardHandle } from "@/components/checkout/stripe-card-element";
import { CARD_MAX_ORDER_VALUE } from "@/lib/card-payment";
import { formatPrice } from "@/lib/currency";
import { t } from "@/lib/i18n";
import type { PaymentMethod } from "@/types/order";

// maximum order total (in the store's currency units) allowed for Cash on Delivery
export const COD_MAX_ORDER_VALUE = 300000;

interface PaymentMethodSelectorProps {
  value: PaymentMethod;
  onChange: (value: PaymentMethod) => void;
  orderTotal: number;
  codEnabled: boolean;
  cardRef: Ref<StripeCardHandle>;
}

// PaymentMethodSelector — lets the user choose a payment method (checkout-payment.html's
// #paymentMethod accordion). The template has Cash on delivery / Credit-or-debit card / PayPal /
// Google Pay; only Cash on delivery and Card are real here, so PayPal and Google Pay are dropped.
// JazzCash/Easypaisa/Raast are no longer offered — they never had a real payment behind them
// (placeOrder now rejects them too).
// Card is a real Stripe payment: the template's card-number/expiry/CVC inputs are replaced by
// Stripe's Payment Element (StripeCardElement), which has to own those fields for the card data to
// stay inside Stripe's iframe. The "change from $X" cash field stays cosmetic and unwired.
// The template's data-bs-toggle="collapse" accordion is replaced with plain conditional classes
// driven by the selected method, same as installation-scheduler.tsx's shipping-method accordion —
// which also keeps the card element mounted while hidden, so switching methods doesn't reset it.
export function PaymentMethodSelector({ value, onChange, orderTotal, codEnabled, cardRef }: PaymentMethodSelectorProps) {
  const isCodAllowed = codEnabled && orderTotal <= COD_MAX_ORDER_VALUE;
  const isCardAllowed = orderTotal <= CARD_MAX_ORDER_VALUE;

  return (
    <div className="mb-4" id="paymentMethod" role="list">
      {/* Cash on delivery */}
      {codEnabled && (
        <div className="single-payment-methode mt-2">
          <div className="rbt-radio-accordion form-check mb-0" role="listitem">
            <label className="form-check-label w-100 text-dark-emphasis fw-semibold">
              <input
                type="radio"
                className="rbt-form-check-input me-1 me-sm-2"
                name="payment-method"
                checked={value === "cod"}
                disabled={!isCodAllowed}
                onChange={() => onChange("cod")}
              />
              {t("paymentMethod.cod")}
            </label>
            {!isCodAllowed && (
              <p className="fs-sm rbt-text-color-danger mb-0 ms-4 ps-2">
                {t("checkout.codLimitExceeded")} {formatPrice(COD_MAX_ORDER_VALUE)}
              </p>
            )}
          </div>
          <div className={`collapse${value === "cod" ? " show" : ""}`}>
            <div className="d-sm-flex align-items-center pt-2 pt-sm-1 pb-2 ps-3 ms-2 ms-sm-3">
              <span className="fs-sm me-3">
                I would require a change from:
              </span>
              <div className="rbt-price-input-grp">
                <input type="number" min="10" placeholder="10$" />
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Credit or debit card */}
      <div className="single-payment-methode mt-2 d-block">
        <div className="rbt-radio-accordion form-check mb-0" role="listitem">
          <label className="form-check-label d-flex align-items-center text-dark-emphasis fw-semibold">
            <input
              type="radio"
              className="rbt-form-check-input me-1 me-sm-2"
              name="payment-method"
              checked={value === "card"}
              disabled={!isCardAllowed}
              onChange={() => onChange("card")}
            />
            {t("paymentMethod.card")}
            <span className="d-none d-sm-flex gap-2 ms-3">
              <img src="/assets/images/payment-brand/image-01.webp" className="d-block" width="200" alt="Credit Or Debit Card" />
            </span>
          </label>
          {!isCardAllowed && (
            <p className="fs-sm rbt-text-color-danger mb-0 ms-4 ps-2">
              Card payments are available for orders up to {formatPrice(CARD_MAX_ORDER_VALUE)}
            </p>
          )}
        </div>
        {/* Not rendered above the limit: Stripe rejects a deferred-mode amount over its ceiling. */}
        {isCardAllowed && (
          <div className={`collapse${value === "card" ? " show" : ""}`}>
            <div className="pt-2 pb-2 ps-3 ms-2 ms-sm-3">
              <StripeCardElement amount={orderTotal} ref={cardRef} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
