// All possible stages an order can be in, including cancellation and return flows
export type OrderStatus =
  | "order_placed"
  | "processing"
  | "ready_for_dispatch"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "return_requested"
  | "returned_refunded";

export type PaymentStatus = "pending" | "paid" | "cod_pending" | "refunded" | "failed";

export type PaymentMethod = "cod" | "jazzcash" | "easypaisa" | "card" | "raast";

// A frozen copy of an address at the time the order was placed (so later address edits don't affect old orders)
export interface OrderAddressSnapshot {
  fullName: string;
  phone: string;
  city: string;
  area: string;
  addressLine: string;
}

// A single purchased line item, with a snapshot of product details at order time
export interface OrderItem {
  productId: string;
  variantId: string;
  productName: string;
  sku: string;
  image: string;
  unitPrice: number;
  quantity: number;
  categoryName: string;
  installationRequired: boolean;
}

// Chosen date/time slot for a product's installation service
export interface InstallationSchedule {
  date: string;
  timeSlot: string;
}

// Shipping courier details for a dispatched order
export interface CourierInfo {
  name: string;
  trackingNumber?: string;
  trackingUrl?: string;
}

// One entry in an order's status audit trail
export interface OrderStatusHistoryEntry {
  status: OrderStatus;
  changedAt: string;
}

// A full customer order: items, addresses, payment, and status
export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  shippingAddress: OrderAddressSnapshot;
  billingAddress: OrderAddressSnapshot;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  subtotal: number;
  shippingFee: number;
  total: number;
  placedAt: string;
  installation?: InstallationSchedule;
  courier?: CourierInfo;
  statusHistory: OrderStatusHistoryEntry[];
}