import Image from "next/image";
import type { AddressFormValues } from "@/components/checkout/address-form";
import { Price } from "@/components/product/price";
import { formatPrice } from "@/lib/currency";
import { t } from "@/lib/i18n";
import { formatVariantLabel } from "@/lib/product-helpers";
import type { InstallationSchedule, PaymentMethod } from "@/types/order";
import type { Product, Variant } from "@/types/product";

interface OrderReviewProps {
  lineItems: { product: Product; variant: Variant; quantity: number }[];
  shippingAddress: AddressFormValues;
  billingAddress: AddressFormValues;
  billingSameAsShipping: boolean;
  installation?: InstallationSchedule;
  paymentMethod: PaymentMethod;
  subtotal: number;
  shippingFee: number;
  taxAmount: number;
  total: number;
}

// OrderReview — read-only summary of items, addresses, installation, payment, and totals before placing an order
export function OrderReview({
  lineItems,
  shippingAddress,
  billingAddress,
  billingSameAsShipping,
  installation,
  paymentMethod,
  subtotal,
  shippingFee,
  taxAmount,
  total,
}: OrderReviewProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-semibold text-foreground">{t("checkout.itemsInOrder")}</p>
        <div className="mt-3 flex flex-col divide-y divide-border">
          {lineItems.map(({ product, variant, quantity }) => (
            <div key={variant.id} className="flex items-center gap-3 py-3">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                {(variant.images?.[0] ?? product.images[0]) && (
                  <Image
                    src={variant.images?.[0] ?? product.images[0]}
                    alt={product.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{product.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatVariantLabel(product, variant)} · {t("common.quantity")}: {quantity}
                </p>
              </div>
              <Price price={variant.price * quantity} />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="text-sm font-semibold text-foreground">{t("checkout.shippingAddress")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {shippingAddress.fullName} · {shippingAddress.phone}
            <br />
            {shippingAddress.addressLine}, {shippingAddress.area}, {shippingAddress.city}
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">{t("checkout.billingAddress")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {billingSameAsShipping ? (
              t("checkout.sameAsShipping")
            ) : (
              <>
                {billingAddress.fullName} · {billingAddress.phone}
                <br />
                {billingAddress.addressLine}, {billingAddress.area}, {billingAddress.city}
              </>
            )}
          </p>
        </div>
      </div>

      {installation && (
        <div>
          <p className="text-sm font-semibold text-foreground">{t("checkout.installationSchedule")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {installation.date} · {installation.timeSlot}
          </p>
        </div>
      )}

      <div>
        <p className="text-sm font-semibold text-foreground">{t("checkout.paymentMethod")}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t(`paymentMethod.${paymentMethod}`)}</p>
      </div>

      {/* .rbt-cart-subttotal: same template class checkout-sidebar.tsx uses for this exact
          Subtotal/Shipping Fee/Total block, so the final review step's totals render at the
          same font size as everywhere else on the page instead of Tailwind's text-sm/text-base
          (rem-based, and shrunk further by this site's small root font-size — see
          site-overrides.css). */}
      <div className="border-top pt--16">
        <div className="rbt-cart-subttotal">
          <p>{t("common.subtotal")}</p>
          <p className="price">{formatPrice(subtotal)}</p>
        </div>
        <div className="rbt-cart-subttotal">
          <p>{t("common.shippingFee")}</p>
          <p className="price">{shippingFee === 0 ? t("common.free") : formatPrice(shippingFee)}</p>
        </div>
        {taxAmount > 0 && (
          <div className="rbt-cart-subttotal">
            <p>{t("common.tax")}</p>
            <p className="price">{formatPrice(taxAmount)}</p>
          </div>
        )}
        <hr className="mb--8 mt--8 rbt-bg-color-gray-200" />
        <div className="rbt-cart-subttotal">
          <p className="subtotal">
            <strong>{t("common.total")}</strong>
          </p>
          <p className="price">{formatPrice(total)}</p>
        </div>
      </div>
    </div>
  );
}