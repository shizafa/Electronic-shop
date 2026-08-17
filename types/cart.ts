// A single line in the shopping cart: which variant, and how many
export interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
}

// A saved-for-later item; variant is optional since wishlisting doesn't require picking one
export interface WishlistItem {
  productId: string;
  variantId?: string;
}

// A product added to the side-by-side comparison list
export interface CompareItem {
  productId: string;
}