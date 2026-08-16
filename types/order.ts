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

export interface OrderAddressSnapshot {
  fullName: string;
  phone: string;
  city: string;
  area: string;
  addressLine: string;
}

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

export interface InstallationSchedule {
  date: string;
  timeSlot: string;
}

export interface CourierInfo {
  name: string;
  trackingNumber?: string;
  trackingUrl?: string;
}

export interface OrderStatusHistoryEntry {
  status: OrderStatus;
  changedAt: string;
}

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