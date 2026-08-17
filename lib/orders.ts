import { orders } from "@/data/orders";
import { getCategoryById } from "@/lib/categories";
import { t } from "@/lib/i18n";
import { readJSON, writeJSON } from "@/lib/storage";
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

function getAllOrders(): Order[] {
  return [...orders, ...getLocalOrders()];
}

export function getOrdersForUser(userId: string): Order[] {
  return getAllOrders().filter((order) => order.userId === userId);
}

export function getOrderById(orderId: string): Order | undefined {
  return getAllOrders().find((order) => order.id === orderId);
}

export interface PlaceOrderInput {
  userId: string;
  lineItems: { product: Product; variant: Variant; quantity: number }[];
  shippingAddress: OrderAddressSnapshot;
  billingAddress: OrderAddressSnapshot;
  paymentMethod: PaymentMethod;
  installation?: InstallationSchedule;
}

export function placeOrder(input: PlaceOrderInput): Order {
  const subtotal = input.lineItems.reduce((sum, { variant, quantity }) => sum + variant.price * quantity, 0);
  const shippingFee = 0;
  const total = subtotal + shippingFee;
  const today = new Date().toISOString().slice(0, 10);

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

  const paymentStatus: PaymentStatus = input.paymentMethod === "cod" ? "cod_pending" : "paid";

  const order: Order = {
    id: `order-${Date.now()}`,
    orderNumber: `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
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

export interface OrderTimelineStep {
  status: OrderStatus;
  labelKey: string;
  completed: boolean;
  current: boolean;
}

const mainLineWithInstallation: OrderStatus[] = [
  "order_placed",
  "processing",
  "ready_for_dispatch",
  "shipped",
  "out_for_delivery",
  "delivered",
];

const mainLineWithoutInstallation: OrderStatus[] = [
  "order_placed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
];

export function getOrderTimeline(order: Order): OrderTimelineStep[] {
  const requiresInstallation = order.items.some((item) => item.installationRequired);
  const mainLine = requiresInstallation ? mainLineWithInstallation : mainLineWithoutInstallation;

  if (order.status === "cancelled") {
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

  const currentIndex = mainLine.indexOf(order.status);
  return mainLine.map((status, index) => ({
    status,
    labelKey: `orderStatus.${status}`,
    completed: index <= currentIndex,
    current: index === currentIndex,
  }));
}