import { orders } from "@/data/orders";
import { t } from "@/lib/i18n";
import { readJSON, writeJSON } from "@/lib/storage";
import type { Category } from "@/types/category";
import type {
  InstallationSchedule,
  Order,
  OrderAddressSnapshot,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/types/order";
import type { Product, Variant } from "@/types/product";

const NEW_ORDERS_KEY = "electronics_orders";

function getLocalOrders(): Order[] {
  return readJSON<Order[]>(NEW_ORDERS_KEY, []);
}

// Combines built-in seed orders with orders placed locally in this browser
function getAllOrders(): Order[] {
  return [...orders, ...getLocalOrders()];
}

// Returns all orders belonging to a given user
export function getOrdersForUser(userId: string): Order[] {
  return getAllOrders().filter((order) => order.userId === userId);
}

// Looks up a single order by id
export function getOrderById(orderId: string): Order | undefined {
  return getAllOrders().find((order) => order.id === orderId);
}

// Data needed to create a new order from the checkout flow
export interface PlaceOrderInput {
  userId: string;
  lineItems: { product: Product; variant: Variant; quantity: number }[];
  shippingAddress: OrderAddressSnapshot;
  billingAddress: OrderAddressSnapshot;
  paymentMethod: PaymentMethod;
  installation?: InstallationSchedule;
}

// Builds a new order from cart line items, computes totals, and saves it to localStorage.
// `getCategoryById` is injected from the caller's already-loaded catalog (see useProductCatalog)
// since this module is client-reachable and can't do its own Supabase queries.
export function placeOrder(
  input: PlaceOrderInput,
  getCategoryById: (id: string) => Category | undefined
): Order {
  const subtotal = input.lineItems.reduce((sum, { variant, quantity }) => sum + variant.price * quantity, 0);
  const shippingFee = 0; // shipping is currently free in this mock shop
  const total = subtotal + shippingFee;
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const items: OrderItem[] = input.lineItems.map(({ product, variant, quantity }) => {
    const category = getCategoryById(product.categoryId);
    return {
      productId: product.id,
      variantId: variant.id,
      productName: product.name,
      sku: variant.sku,
      image: variant.images?.[0] ?? product.images[0],
      unitPrice: variant.price,
      quantity,
      categoryName: category ? t(category.nameKey) : "",
      installationRequired: category?.installationRequired ?? false,
    };
  });

  // Cash-on-delivery orders start "pending payment"; other methods are treated as already paid
  const paymentStatus: PaymentStatus = input.paymentMethod === "cod" ? "cod_pending" : "paid";

  const order: Order = {
    id: `order-${Date.now()}`,
    orderNumber: `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`, // e.g. ORD-2026-4821
    userId: input.userId,
    items,
    shippingAddress: input.shippingAddress,
    billingAddress: input.billingAddress,
    status: "order_placed",
    paymentStatus,
    paymentMethod: input.paymentMethod,
    subtotal,
    shippingFee,
    total,
    placedAt: today,
    installation: input.installation,
    statusHistory: [{ status: "order_placed", changedAt: today }],
  };

  writeJSON(NEW_ORDERS_KEY, [...getLocalOrders(), order]);
  return order;
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

// Builds the ordered list of timeline steps for an order, marking which are done/current
export function getOrderTimeline(order: Order): OrderTimelineStep[] {
  const requiresInstallation = order.items.some((item) => item.installationRequired);
  const mainLine = requiresInstallation ? mainLineWithInstallation : mainLineWithoutInstallation;

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