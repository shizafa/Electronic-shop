"use server";

import { createClient } from "@/lib/supabase/server";
import type { InstallationSchedule, OrderAddressSnapshot, PaymentMethod } from "@/types/order";

export interface PlaceOrderLineItem {
  variantId: string;
  quantity: number;
}

export interface PlaceOrderInput {
  lineItems: PlaceOrderLineItem[];
  shippingAddress: OrderAddressSnapshot;
  billingAddress: OrderAddressSnapshot;
  paymentMethod: PaymentMethod;
  installation?: InstallationSchedule;
}

export type PlaceOrderResult =
  | { success: true; orderId: string; orderNumber: string }
  | { success: false; error: string };

interface VariantWithProductRow {
  id: string;
  sku: string;
  price: string | number;
  images: string[] | null;
  products: {
    id: string;
    name: string;
    images: string[];
    categories: { name: string; installation_required: boolean } | null;
  } | null;
}

// Places an order for the currently authenticated user. Runs server-side (not a plain client
// function) so prices/totals are recomputed from the database rather than trusted from the
// browser — the client only sends variant ids + quantities, never prices.
export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  if (input.lineItems.length === 0) return { success: false, error: "Cart is empty" };

  const variantIds = input.lineItems.map((item) => item.variantId);
  const { data: variantRows, error: variantError } = await supabase
    .from("variants")
    .select("id, sku, price, images, products(id, name, images, categories(name, installation_required))")
    .in("id", variantIds);

  if (variantError || !variantRows) {
    return { success: false, error: "Failed to load product data" };
  }

  const variantMap = new Map(
    (variantRows as unknown as VariantWithProductRow[]).map((row) => [row.id, row])
  );

  let subtotal = 0;
  let requiresInstallation = false;
  const orderItemRows: {
    product_id: string;
    variant_id: string;
    product_name: string;
    sku: string;
    image: string | null;
    unit_price: number;
    quantity: number;
    category_name: string;
    installation_required: boolean;
  }[] = [];

  for (const lineItem of input.lineItems) {
    const variantRow = variantMap.get(lineItem.variantId);
    const product = variantRow?.products;
    if (!variantRow || !product) {
      return { success: false, error: "One of the items in your cart is no longer available" };
    }

    const category = product.categories;
    const unitPrice = Number(variantRow.price);
    subtotal += unitPrice * lineItem.quantity;
    if (category?.installation_required) requiresInstallation = true;

    orderItemRows.push({
      product_id: product.id,
      variant_id: variantRow.id,
      product_name: product.name,
      sku: variantRow.sku,
      image: variantRow.images?.[0] ?? product.images?.[0] ?? null,
      unit_price: unitPrice,
      quantity: lineItem.quantity,
      category_name: category?.name ?? "",
      installation_required: category?.installation_required ?? false,
    });
  }

  const shippingFee = 0; // shipping is currently free in this mock shop
  const total = subtotal + shippingFee;
  // Cash-on-delivery orders start "pending payment"; other methods are treated as already paid
  const paymentStatus = input.paymentMethod === "cod" ? "cod_pending" : "paid";
  const orderNumber = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`; // e.g. ORD-2026-4821

  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      user_id: user.id,
      status: "order_placed",
      payment_status: paymentStatus,
      payment_method: input.paymentMethod,
      subtotal,
      shipping_fee: shippingFee,
      total,
      shipping_address: input.shippingAddress,
      billing_address: input.billingAddress,
      // only attach installation details if at least one item actually requires the service
      installation: requiresInstallation ? (input.installation ?? null) : null,
    })
    .select("id, order_number")
    .single();

  if (orderError || !orderRow) {
    return { success: false, error: "Failed to create order" };
  }

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItemRows.map((item) => ({ ...item, order_id: orderRow.id })));
  if (itemsError) {
    return { success: false, error: "Failed to save order items" };
  }

  const { error: historyError } = await supabase
    .from("order_status_history")
    .insert({ order_id: orderRow.id, status: "order_placed" });
  if (historyError) {
    return { success: false, error: "Failed to record order status" };
  }

  return { success: true, orderId: orderRow.id, orderNumber: orderRow.order_number };
}
