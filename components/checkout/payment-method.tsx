"use client";

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
}

// PaymentMethodSelector — lets the user choose a payment method (checkout-payment.html's
// #paymentMethod accordion). The template only has Cash on delivery / Credit-or-debit card /
// PayPal / Google Pay; the real methods are cod/jazzcash/easypaisa/card/raast. PayPal and Google
// Pay are dropped (no such methods exist here), Cash on delivery and Card are kept and reskinned
// into the accordion, and JazzCash/Easypaisa/Raast are added as simple radio-only rows — mirroring
// how PayPal/Google Pay were themselves just a bare radio + logo with no expanded panel — since
// the template has no equivalent UI for them.
// The card-number/expiry/CVC fields and the "change from $X" cash field stay cosmetic and
// unwired: there's no payment gateway integration, and checkout.onlineMethodDescription already
// tells the user payment happens after the order is placed, so nothing here actually charges a card.
// The template's data-bs-toggle="collapse" accordion is replaced with plain conditional classes
// driven by the selected method, same as installation-scheduler.tsx's shipping-method accordion.
export function PaymentMethodSelector({ value, onChange, orderTotal, codEnabled }: PaymentMethodSelectorProps) {
  const isCodAllowed = codEnabled && orderTotal <= COD_MAX_ORDER_VALUE;

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
              onChange={() => onChange("card")}
            />
            {t("paymentMethod.card")}
            <span className="d-none d-sm-flex gap-2 ms-3">
              <img src="/assets/images/payment-brand/image-01.webp" className="d-block" width="200" alt="Credit Or Debit Card" />
            </span>
          </label>
        </div>
        <div className={`collapse${value === "card" ? " show" : ""}`}>
          <form className="needs-validation pt-2 pb-2 ps-3 ms-2 ms-sm-3" onSubmit={(event) => event.preventDefault()}>
            <div className="position-relative mb-3 mb-sm-4">
              <input type="number" className="form-icon-end" placeholder="Card number" />
              <span className="position-absolute d-flex top-50 end-0 translate-middle-y fs-6 text-body-tertiary me-2">
                <i className="fa-regular fa-credit-card" />
              </span>
            </div>
            <div className="row row-cols-1 rbt-form-area row-cols-sm-2 g-3 g-sm-4">
              <div className="col">
                <div className="input-group date rbt-datepicker rbt-expiry-date">
                  <input type="text" placeholder="MM/YY" className="form-control" />
                  <span className="input-group-append">
                    <span className="input-group-text d-block">
                      <i className="fa fa-calendar" />
                    </span>
                  </span>
                </div>
              </div>
              <div className="col">
                <input type="number" min="0000" max="9999" placeholder="CVC" />
              </div>
            </div>
          </form>
        </div>
      </div>
      {/* JazzCash */}
      <div className="single-payment-methode mt-2">
        <div className="rbt-radio-accordion form-check mb-0" role="listitem">
          <label className="form-check-label d-flex align-items-center text-dark-emphasis fw-semibold">
            <input
              type="radio"
              className="rbt-form-check-input me-1 me-sm-2"
              name="payment-method"
              checked={value === "jazzcash"}
              onChange={() => onChange("jazzcash")}
            />
            {t("paymentMethod.jazzcash")}
          </label>
        </div>
      </div>
      {/* Easypaisa */}
      <div className="single-payment-methode mt-2">
        <div className="rbt-radio-accordion form-check mb-0" role="listitem">
          <label className="form-check-label d-flex align-items-center text-dark-emphasis fw-semibold">
            <input
              type="radio"
              className="rbt-form-check-input me-1 me-sm-2"
              name="payment-method"
              checked={value === "easypaisa"}
              onChange={() => onChange("easypaisa")}
            />
            {t("paymentMethod.easypaisa")}
          </label>
        </div>
      </div>
      {/* Raast */}
      <div className="single-payment-methode mt-2">
        <div className="rbt-radio-accordion form-check mb-0" role="listitem">
          <label className="form-check-label d-flex align-items-center text-dark-emphasis fw-semibold">
            <input
              type="radio"
              className="rbt-form-check-input me-1 me-sm-2"
              name="payment-method"
              checked={value === "raast"}
              onChange={() => onChange("raast")}
            />
            {t("paymentMethod.raast")}
          </label>
        </div>
      </div>

      {(value === "jazzcash" || value === "easypaisa" || value === "raast") && (
        <p className="fs-sm mt-2 mb-0">
          {t("checkout.onlineMethodDescription")}
        </p>
      )}
    </div>
  );
}
