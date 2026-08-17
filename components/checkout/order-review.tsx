import Image from "next/image";
import type { AddressFormValues } from "@/components/checkout/address-form";
import { Price } from "@/components/product/price";
import { formatPrice } from "@/lib/currency";
import { t } from "@/lib/i18n";
import { formatVariantLabel } from "@/lib/products";
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
                <Image
                  src={variant.images?.[0] ?? product.images[0]}
                  alt={product.name}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
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

      <div className="flex flex-col gap-2 border-t border-border pt-4 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>{t("common.subtotal")}</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>{t("common.shippingFee")}</span>
          <span>{shippingFee === 0 ? t("common.free") : formatPrice(shippingFee)}</span>
        </div>
        <div className="flex justify-between border-t border-border pt-2 text-base font-semibold text-foreground">
          <span>{t("common.total")}</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}