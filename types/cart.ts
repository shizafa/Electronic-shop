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

// A product added to the side-by-side comparison list. categoryId is carried alongside productId
// so same-category validation never needs a catalog lookup — just the id of the product being added.
export interface CompareItem {
  productId: string;
  categoryId: string;
}