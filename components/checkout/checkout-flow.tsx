"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AddressForm,
  emptyAddressFormValues,
  type AddressFormValues,
} from "@/components/checkout/address-form";
import { CheckoutSidebar } from "@/components/checkout/checkout-sidebar";
import { InstallationScheduler } from "@/components/checkout/installation-scheduler";
import { OrderReview } from "@/components/checkout/order-review";
import { PaymentMethodSelector } from "@/components/checkout/payment-method";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { useProductCatalog } from "@/context/product-catalog-context";
import { cities } from "@/data/cities";
import { placeOrder } from "@/lib/actions/orders";
import { t } from "@/lib/i18n";
import type { InstallationSchedule, PaymentMethod } from "@/types/order";

type CheckoutStep = "address" | "installation" | "payment" | "review";

// Titles for the numbered step shell (checkout-delivery-step-one.html's rbt-checkout-wrapper-box).
// "Delivery Details"/"Shipping Options"/"Secure Payment" are the template's own wording for the
// address/installation/payment steps; "review" has no template page yet, so it falls back to the
// existing checkout.step.review translation until checkout-thankyou.html (or similar) is pasted.
const STEP_TITLES: Record<CheckoutStep, string> = {
  address: "Delivery Details",
  installation: "Shipping Options",
  payment: "Secure Payment",
  review: t("checkout.step.review"),
};

// CheckoutFlow — multi-step checkout state machine: address -> (installation) -> payment -> review -> place order
export function CheckoutFlow() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { items, clearCart } = useCart();
  const {
    getProductById,
    getVariantById,
    getCategoryById,
    isLoading: isCatalogLoading,
  } = useProductCatalog();

  // resolve cart items into full product/variant data for pricing and display
  const lineItems = useMemo(
    () =>
      items
        .map((item) => {
          const product = getProductById(item.productId);
          const variant = getVariantById(item.variantId);
          if (!product || !variant) return null;
          return { product, variant, quantity: item.quantity };
        })
        .filter((entry): entry is NonNullable<typeof entry> => entry !== null),
    [items, getProductById, getVariantById]
  );

  // installation step only applies if at least one item's category requires it
  const requiresInstallation = lineItems.some(
    ({ product }) => getCategoryById(product.categoryId)?.installationRequired
  );

  // the step list itself changes depending on cart contents (installation step is skipped otherwise)
  const steps: CheckoutStep[] = requiresInstallation
    ? ["address", "installation", "payment", "review"]
    : ["address", "payment", "review"];

  const [stepIndex, setStepIndex] = useState(0);
  const [shippingAddress, setShippingAddress] = useState<AddressFormValues>(emptyAddressFormValues);
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [billingAddress, setBillingAddress] = useState<AddressFormValues>(emptyAddressFormValues);
  const [installation, setInstallation] = useState<InstallationSchedule | undefined>(undefined);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("jazzcash");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [placeOrderError, setPlaceOrderError] = useState("");

  // guard the checkout page: must be logged in and have items in the cart
  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      router.replace("/login?redirect=/checkout");
      return;
    }
    if (items.length === 0) {
      router.replace("/cart");
    }
  }, [isAuthLoading, user, items.length, router]);

  if (isAuthLoading || isCatalogLoading || !user || items.length === 0) {
    return (
      <div className="container-page py-12 text-base text-muted-foreground">{t("common.loading")}</div>
    );
  }

  const subtotal = lineItems.reduce((sum, { variant, quantity }) => sum + variant.price * quantity, 0);
  const shippingFee = 0;
  const total = subtotal + shippingFee;

  const shippingCity = cities.find((city) => city.name === shippingAddress.city);
  // installation can only be scheduled if the chosen shipping city supports it, regardless of cart contents
  const isInstallationCitySupported = shippingCity?.installationSupported ?? false;
  const currentStep = steps[stepIndex];

  // advance/rewind through the steps array, clamped to its bounds
  function goNext() {
    setStepIndex((index) => Math.min(index + 1, steps.length - 1));
  }

  function goBack() {
    setStepIndex((index) => Math.max(index - 1, 0));
  }

  // address step is only valid once shipping fields are filled, and billing fields too if it differs
  const isAddressValid =
    shippingAddress.fullName.trim() !== "" &&
    shippingAddress.phone.trim() !== "" &&
    shippingAddress.city !== "" &&
    shippingAddress.area !== "" &&
    shippingAddress.addressLine.trim() !== "" &&
    (billingSameAsShipping ||
      (billingAddress.fullName.trim() !== "" &&
        billingAddress.phone.trim() !== "" &&
        billingAddress.city !== "" &&
        billingAddress.area !== "" &&
        billingAddress.addressLine.trim() !== ""));

  // if the city doesn't support installation, the step is skipped/informational and always considered valid;
  // otherwise the user must pick both a date and a time slot
  const isInstallationValid =
    !isInstallationCitySupported || Boolean(installation?.date && installation?.timeSlot);

  // final step: create the order record server-side, empty the cart, then navigate to confirmation
  async function handlePlaceOrder() {
    if (!user) return;
    setIsPlacingOrder(true);
    setPlaceOrderError("");

    const result = await placeOrder({
      lineItems: lineItems.map(({ variant, quantity }) => ({ variantId: variant.id, quantity })),
      shippingAddress,
      // reuse shipping address as billing when the "same as shipping" checkbox is checked
      billingAddress: billingSameAsShipping ? shippingAddress : billingAddress,
      paymentMethod,
      // only attach installation details if the city actually supports the service
      installation: isInstallationCitySupported ? installation : undefined,
    });

    if (!result.success) {
      setPlaceOrderError(result.error);
      setIsPlacingOrder(false);
      return;
    }

    clearCart();
    router.push(`/checkout/confirmation?orderId=${result.orderId}`);
  }

  return (
    <>
      <div className="rbt-breadcrumb-two rbt-bg-color-white">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="rbt-breadcrumb-inner text-left">
                <ul className="rbt-breadcrumb-page-list justify-content-start mt--0">
                  <li className="rbt-breadcrumb-item">
                    <Link href="/">
                      Home
                    </Link>
                  </li>
                  <li>
                    <div className="icon-right">
                      <i className="fa-solid fa-chevron-right" />
                    </div>
                  </li>
                  <li className="rbt-breadcrumb-item">
                    <a href="#">
                      Checkout
                    </a>
                  </li>
                  <li>
                    <div className="icon-right">
                      <i className="fa-solid fa-chevron-right" />
                    </div>
                  </li>
                  <li className="rbt-breadcrumb-item active">
                    {STEP_TITLES[currentStep]}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="rbt-component-area rbt-cart-page rbt-section-gapBottom rbt-bg-color-white">
        <div className="container">
          <div className="row row--12 mt_dec--24">
            <div className="col-12 col-md-12 col-lg-8 mt--24">
              <div className="rbt-transparent-table-one-wrapper rbt-has-bg-gray">
                <div className="rbt-checkout-wrapper-box">
                  {steps.map((step, index) => {
                    // upcoming steps (not reached yet) show only the numbered header, no content
                    if (index > stepIndex) {
                      return (
                        <div className="rbt-checkout-single-content" key={step}>
                          <span className="rbt-checkout-step">
                            {index + 1}
                          </span>
                          <h3 className="title h5">
                            {STEP_TITLES[step]}
                          </h3>
                        </div>
                      );
                    }

                    // completed steps show a checkmark and a read-only recap of what was entered,
                    // with an Edit link that jumps back to that step
                    if (index < stepIndex) {
                      return (
                        <div className="rbt-checkout-single-content" key={step}>
                          <span className="rbt-checkout-step">
                            <i className="fa-regular fa-check" />
                          </span>
                          <div className="rbt-checkout-content-inner">
                            <div className="d-flex justify-content-between align-items-center">
                              <h3 className="title h5">
                                {STEP_TITLES[step]}
                              </h3>
                              <div className="rbt-link-hover">
                                <a
                                  href="#"
                                  onClick={(event) => {
                                    event.preventDefault();
                                    setStepIndex(index);
                                  }}
                                >
                                  Edit
                                </a>
                              </div>
                            </div>
                            <div className="content">
                              {step === "address" && (
                                <p className="desc mt--12 mb--0">
                                  {shippingAddress.fullName} · {shippingAddress.phone}
                                  <br />
                                  {shippingAddress.addressLine}, {shippingAddress.area}, {shippingAddress.city}
                                </p>
                              )}
                              {step === "installation" && (
                                <p className="desc mt--12 mb--0">
                                  {isInstallationCitySupported && installation
                                    ? `${installation.date} · ${installation.timeSlot}`
                                    : t("checkout.installationNotSupported")}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className="rbt-checkout-single-content active" key={step}>
                        <span className="rbt-checkout-step">
                          {index + 1}
                        </span>
                        <div className="rbt-checkout-content-inner">
                          <h3 className="title h5">
                            {STEP_TITLES[step]}
                          </h3>
                          <div className="content">
                            {step === "address" && (
                              <>
                                <p className="desc">
                                  Provide your shipping address to ensure a smooth and timely
                                  arrival. 🚚
                                </p>
                                <div className="form-area">
                                  <div className="w-100">
                                    <label htmlFor="postcode" className="form-label">
                                      Postcode :
                                    </label>
                                    <input type="text" className="form-control form-control-lg" id="postcode" placeholder="e.g. SH 5AP" />
                                  </div>
                                  <a href="#" className="rbt-btn splash-btn icon-reverse-right rbt-rounded--4 border-0">
                                    <span className="icon-left">
                                      <i className="fa-regular fa-calculator-simple mr--4" />
                                    </span>
                                    <span>
                                      Calculate cost
                                    </span>
                                    <span className="icon-right">
                                      <i className="fa-sharp fa-regular fa-arrow-right ml--4" />
                                    </span>
                                  </a>
                                </div>

                                <div className="mt--24">
                                  <p className="mb--8 rbt-text-bold">{t("checkout.shippingAddress")}</p>
                                  <AddressForm
                                    idPrefix="shipping"
                                    values={shippingAddress}
                                    onChange={setShippingAddress}
                                    savedAddresses={user.addresses}
                                  />
                                </div>

                                <h3 className="h6 mb--8 mt--16">
                                  {t("checkout.billingAddress")}
                                  <i
                                    className="fa-regular fa-circle-info align-middle ms-2 tooltips"
                                    data-tooltip="Uncheck the checkbox below if your Billing address should be different from your Shipping address."
                                    data-tooltip-position="right"
                                  />
                                </h3>
                                <div className="form-check mb-lg-4">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="same-address"
                                    checked={billingSameAsShipping}
                                    onChange={(event) => setBillingSameAsShipping(event.target.checked)}
                                  />
                                  <label htmlFor="same-address" className="form-check-label">
                                    {t("checkout.billingSameAsShipping")}
                                  </label>
                                </div>

                                {!billingSameAsShipping && (
                                  <div className="mt--16">
                                    <AddressForm idPrefix="billing" values={billingAddress} onChange={setBillingAddress} />
                                  </div>
                                )}
                              </>
                            )}

                            {step === "installation" &&
                              (isInstallationCitySupported ? (
                                <>
                                  <h3 className="h6 border-bottom pb-4 mb-0 mt--12">
                                    Choose shipping method
                                  </h3>
                                  <InstallationScheduler value={installation} onChange={setInstallation} />
                                </>
                              ) : (
                                <p className="desc">
                                  {t("checkout.installationNotSupported")}
                                </p>
                              ))}

                            {step === "payment" && (
                              <>
                                <PaymentMethodSelector
                                  value={paymentMethod}
                                  onChange={setPaymentMethod}
                                  orderTotal={total}
                                />
                                {/* No coupon/promo-code system exists in the app — kept as inert
                                    chrome, same treatment as Share Cart in checkout-sidebar.tsx. */}
                                <div className="nav pb-3 mb-2 mb-sm-3 rbt-link-hover mt-2">
                                  <a className="nav-link animate-underline rbt-text-color-gray-400 p-0 rbt-text-bold" href="#!">
                                    <i className="fa-regular fa-circle-plus fs-xl ms-a me-2" />
                                    <span className="animate-target">
                                      Add a promo code or a gift card
                                    </span>
                                  </a>
                                </div>
                                {/* Orders have no notes/comments field — kept as an unwired,
                                    cosmetic textarea, same treatment as the postcode field. */}
                                <textarea className="mb-4" rows={3} placeholder="Additional comments" />
                                <div className="form-check mb-lg-4">
                                  <input type="checkbox" className="form-check-input" id="accept-terms" />
                                  <label htmlFor="accept-terms" className="form-check-label nav align-items-center rbt-link-hover">
                                    I accept the
                                    <Link className="nav-link ms-1 p-0" href="/policies/terms">
                                      Terms and
                                      Conditions
                                    </Link>
                                  </label>
                                </div>
                              </>
                            )}

                            {step === "review" && (
                              <OrderReview
                                lineItems={lineItems}
                                shippingAddress={shippingAddress}
                                billingAddress={billingSameAsShipping ? shippingAddress : billingAddress}
                                billingSameAsShipping={billingSameAsShipping}
                                installation={isInstallationCitySupported ? installation : undefined}
                                paymentMethod={paymentMethod}
                                subtotal={subtotal}
                                shippingFee={shippingFee}
                                total={total}
                              />
                            )}

                            {placeOrderError && (
                              <p className="rbt-text-color-danger mt--16 mb--0">
                                {placeOrderError}
                              </p>
                            )}

                            <div className="rbt-btn-group mt--24">
                              <button
                                type="button"
                                className="rbt-btn rbt-btn-border"
                                onClick={goBack}
                                disabled={stepIndex === 0}
                              >
                                {t("checkout.back")}
                              </button>

                              {currentStep === "review" ? (
                                <button
                                  type="button"
                                  className="rbt-btn splash-btn icon-reverse-left rbt-rounded--4"
                                  onClick={handlePlaceOrder}
                                  disabled={isPlacingOrder}
                                >
                                  <span className="icon-left">
                                    <i className="fa-sharp fa-regular fa-arrow-right mr--4" />
                                  </span>
                                  <span>
                                    {t("checkout.placeOrder")}
                                  </span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="rbt-btn splash-btn icon-reverse-left rbt-rounded--4"
                                  onClick={goNext}
                                  disabled={
                                    (currentStep === "address" && !isAddressValid) ||
                                    (currentStep === "installation" && !isInstallationValid)
                                  }
                                >
                                  <span className="icon-left">
                                    <i className="fa-sharp fa-regular fa-arrow-right mr--4" />
                                  </span>
                                  <span>
                                    {t("checkout.continue")}
                                  </span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <CheckoutSidebar lineItems={lineItems} subtotal={subtotal} shippingFee={shippingFee} total={total} />
          </div>
        </div>
      </div>
    </>
  );
}