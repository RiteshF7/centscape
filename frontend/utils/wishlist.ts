import { UrlPreview, WishlistItem } from '@/types/wishlist';

// Create a new wishlist item from a URL preview
export const createWishlistItem = (preview: UrlPreview, id?: string): WishlistItem => {
  return {
    id: id || Date.now().toString(),
    url: preview.url,
    title: preview.title,
    description: preview.description,
    image: preview.image,
    price: preview.price,
    addedAt: new Date().toISOString(),
  };
};
