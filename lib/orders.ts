import { createClient } from "@/lib/supabase/client";
import type {
  CourierInfo,
  InstallationSchedule,
  Order,
  OrderAddressSnapshot,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/types/order";

interface OrderItemRow {
  product_id: string;
  variant_id: string;
  product_name: string;
  sku: string;
  image: string | null;
  unit_price: string | number;
  quantity: number;
  category_name: string;
  installation_required: boolean;
}

interface OrderStatusHistoryRow {
  status: OrderStatus;
  changed_at: string;
  note: string | null;
}

export interface OrderRow {
  id: string;
  order_number: string;
  user_id: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  subtotal: string | number;
  shipping_fee: string | number;
  total: string | number;
  shipping_address: OrderAddressSnapshot;
  billing_address: OrderAddressSnapshot;
  installation: InstallationSchedule | null;
  courier: CourierInfo | null;
  placed_at: string;
  order_items?: OrderItemRow[] | null;
  order_status_history?: OrderStatusHistoryRow[] | null;
}

export const ORDER_SELECT = "*, order_items(*), order_status_history(*)";

// placed_at/changed_at are `timestamptz` columns (full ISO datetimes), but the UI was built
// around plain "YYYY-MM-DD" strings (matching the original mock seed data) — truncate to date.
function toDateOnly(isoTimestamp: string): string {
  return isoTimestamp.slice(0, 10);
}

export function mapOrderRow(row: OrderRow): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    userId: row.user_id,
    items: (row.order_items ?? []).map((item) => ({
      productId: item.product_id,
      variantId: item.variant_id,
      productName: item.product_name,
      sku: item.sku,
      image: item.image ?? "",
      unitPrice: Number(item.unit_price),
      quantity: item.quantity,
      categoryName: item.category_name,
      installationRequired: item.installation_required,
    })),
    shippingAddress: row.shipping_address,
    billingAddress: row.billing_address,
    status: row.status,
    paymentStatus: row.payment_status,
    paymentMethod: row.payment_method,
    subtotal: Number(row.subtotal),
    shippingFee: Number(row.shipping_fee),
    total: Number(row.total),
    placedAt: toDateOnly(row.placed_at),
    installation: row.installation ?? undefined,
    courier: row.courier ?? undefined,
    statusHistory: (row.order_status_history ?? [])
      .slice()
      .sort((a, b) => new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime())
      .map((entry) => ({
        status: entry.status,
        changedAt: toDateOnly(entry.changed_at),
        note: entry.note ?? undefined,
      })),
  };
}

// Returns all orders belonging to a given user, newest first
export async function getOrdersForUser(userId: string): Promise<Order[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("user_id", userId)
    .order("placed_at", { ascending: false });
  if (error) {
    console.error("getOrdersForUser failed", error);
    return [];
  }
  return (data ?? []).map((row) => mapOrderRow(row as unknown as OrderRow));
}

// Looks up a single order by id
export async function getOrderById(orderId: string): Promise<Order | undefined> {
  const supabase = createClient();
  const { data, error } = await supabase.from("orders").select(ORDER_SELECT).eq("id", orderId).maybeSingle();
  if (error) {
    console.error("getOrderById failed", error);
    return undefined;
  }
  return data ? mapOrderRow(data as unknown as OrderRow) : undefined;
}

// One step in the visual order-progress timeline shown to the user
export interface OrderTimelineStep {
  status: OrderStatus;
  labelKey: string;
  completed: boolean;
  current: boolean;
}

// Status sequence for orders that need an installation step (e.g. air conditioners)
const mainLineWithInstallation: OrderStatus[] = [
  "order_placed",
  "processing",
  "ready_for_dispatch",
  "shipped",
  "out_for_delivery",
  "delivered",
];

// Status sequence for orders that don't need installation
const mainLineWithoutInstallation: OrderStatus[] = [
  "order_placed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
];

// The order_status values that represent an order's linear (non-terminal) progress —
// cancelled/return_requested/returned_refunded branch off this line rather than sitting on it.
export function getOrderMainLine(order: Pick<Order, "items">): OrderStatus[] {
  const requiresInstallation = order.items.some((item) => item.installationRequired);
  return requiresInstallation ? mainLineWithInstallation : mainLineWithoutInstallation;
}

// Which status-change actions are valid for an order right now. Forward progress is
// single-step only (no skipping stages, no going back to an earlier one). Cancelling is only
// allowed before the order ships; the return flow is a separate two-step branch that only
// opens up once an order is delivered.
export interface OrderStatusActions {
  nextStatus: OrderStatus | null;
  canCancel: boolean;
  canRequestReturn: boolean;
  canMarkReturned: boolean;
}

export function getOrderStatusActions(order: Pick<Order, "status" | "items">): OrderStatusActions {
  const mainLine = getOrderMainLine(order);
  const index = mainLine.indexOf(order.status);
  const shippedIndex = mainLine.indexOf("shipped");

  return {
    nextStatus: index !== -1 && index < mainLine.length - 1 ? mainLine[index + 1] : null,
    canCancel: index !== -1 && index < shippedIndex,
    canRequestReturn: order.status === "delivered",
    canMarkReturned: order.status === "return_requested",
  };
}

// Server-side re-check before writing a transition — the client only ever offers actions
// getOrderStatusActions already approved, but the UI's view of the order can be stale.
export function isValidStatusTransition(order: Pick<Order, "status" | "items">, next: OrderStatus): boolean {
  const actions = getOrderStatusActions(order);
  if (next === "cancelled") return actions.canCancel;
  if (next === "return_requested") return actions.canRequestReturn;
  if (next === "returned_refunded") return actions.canMarkReturned;
  return actions.nextStatus === next;
}

// Builds the ordered list of timeline steps for an order, marking which are done/current
export function getOrderTimeline(order: Order): OrderTimelineStep[] {
  const mainLine = getOrderMainLine(order);

  if (order.status === "cancelled") {
    // Show only the main-line steps actually reached before cancellation, then a final "cancelled" step
    const reachedStatuses = new Set(order.statusHistory.map((entry) => entry.status));
    const completedMainLineSteps = mainLine
      .filter((status) => reachedStatuses.has(status))
      .map((status) => ({ status, labelKey: `orderStatus.${status}`, completed: true, current: false }));

    return [
      ...completedMainLineSteps,
      { status: "cancelled" as const, labelKey: "orderStatus.cancelled", completed: true, current: true },
    ];
  }

  const isReturnFlow = order.status === "return_requested" || order.status === "returned_refunded";
  if (isReturnFlow) {
    const completedMainLineSteps = mainLine.map((status) => ({
      status,
      labelKey: `orderStatus.${status}`,
      completed: true,
      current: false,
    }));

    const returnSteps: OrderTimelineStep[] = [
      {
        status: "return_requested",
        labelKey: "orderStatus.return_requested",
        completed: true,
        current: order.status === "return_requested",
      },
    ];

    if (order.status === "returned_refunded") {
      returnSteps.push({
        status: "returned_refunded",
        labelKey: "orderStatus.returned_refunded",
        completed: true,
        current: true,
      });
    }

    return [...completedMainLineSteps, ...returnSteps];
  }

  // Normal case: every step up to and including the current status is marked completed
  const currentIndex = mainLine.indexOf(order.status);
  return mainLine.map((status, index) => ({
    status,
    labelKey: `orderStatus.${status}`,
    completed: index <= currentIndex,
    current: index === currentIndex,
  }));
}
