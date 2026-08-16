export interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface WishlistItem {
  productId: string;
  variantId?: string;
}

export interface CompareItem {
  productId: string;
}