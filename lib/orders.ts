import { orders } from "@/data/orders";
import type { Order, OrderStatus } from "@/types/order";

export function getOrdersForUser(userId: string): Order[] {
  return orders.filter((order) => order.userId === userId);
}

export function getOrderById(orderId: string): Order | undefined {
  return orders.find((order) => order.id === orderId);
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