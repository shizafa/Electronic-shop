"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AddressForm,
  emptyAddressFormValues,
  type AddressFormValues,
} from "@/components/checkout/address-form";
import { InstallationScheduler } from "@/components/checkout/installation-scheduler";
import { OrderReview } from "@/components/checkout/order-review";
import { PaymentMethodSelector } from "@/components/checkout/payment-method";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { useProductCatalog } from "@/context/product-catalog-context";
import { cities } from "@/data/cities";
import { t } from "@/lib/i18n";
import { placeOrder } from "@/lib/orders";
import type { InstallationSchedule, PaymentMethod } from "@/types/order";

type CheckoutStep = "address" | "installation" | "payment" | "review";

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
      <div className="container-page py-12 text-sm text-muted-foreground">{t("common.loading")}</div>
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

  // final step: create the order record, empty the cart, then navigate to the confirmation page
  function handlePlaceOrder() {
    if (!user) return;
    setIsPlacingOrder(true);

    const order = placeOrder(
      {
        userId: user.id,
        lineItems,
        shippingAddress,
        // reuse shipping address as billing when the "same as shipping" checkbox is checked
        billingAddress: billingSameAsShipping ? shippingAddress : billingAddress,
        paymentMethod,
        // only attach installation details if the city actually supports the service
        installation: isInstallationCitySupported ? installation : undefined,
      },
      getCategoryById
    );

    clearCart();
    router.push(`/checkout/confirmation?orderId=${order.id}`);
  }

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-semibold sm:text-3xl">{t("common.checkout")}</h1>

      <ol className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {steps.map((step, index) => (
          <li
            key={step}
            className={`font-medium ${
              index === stepIndex
                ? "text-primary"
                : index < stepIndex
                  ? "text-foreground"
                  : "text-muted-foreground"
            }`}
          >
            {index + 1}. {t(`checkout.step.${step}`)}
          </li>
        ))}
      </ol>

      <div className="mt-6 max-w-2xl">
        {currentStep === "address" && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="mb-2 text-sm font-semibold text-foreground">{t("checkout.shippingAddress")}</p>
              <AddressForm
                idPrefix="shipping"
                values={shippingAddress}
                onChange={setShippingAddress}
                savedAddresses={user.addresses}
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-foreground">
              <Checkbox
                checked={billingSameAsShipping}
                onCheckedChange={(checked) => setBillingSameAsShipping(checked === true)}
              />
              {t("checkout.billingSameAsShipping")}
            </label>

            {!billingSameAsShipping && (
              <div>
                <p className="mb-2 text-sm font-semibold text-foreground">{t("checkout.billingAddress")}</p>
                <AddressForm idPrefix="billing" values={billingAddress} onChange={setBillingAddress} />
              </div>
            )}
          </div>
        )}

        {currentStep === "installation" &&
          (isInstallationCitySupported ? (
            <InstallationScheduler value={installation} onChange={setInstallation} />
          ) : (
            <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              {t("checkout.installationNotSupported")}
            </div>
          ))}

        {currentStep === "payment" && (
          <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} orderTotal={total} />
        )}

        {currentStep === "review" && (
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

        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={goBack} disabled={stepIndex === 0}>
            {t("checkout.back")}
          </Button>

          {currentStep === "review" ? (
            <Button onClick={handlePlaceOrder} disabled={isPlacingOrder}>
              {t("checkout.placeOrder")}
            </Button>
          ) : (
            // "Continue" is blocked until the current step's required fields are valid
            <Button
              onClick={goNext}
              disabled={
                (currentStep === "address" && !isAddressValid) ||
                (currentStep === "installation" && !isInstallationValid)
              }
            >
              {t("checkout.continue")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}