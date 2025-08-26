// Wishlist item interface
export interface WishlistItem {
  id: string;
  url: string;
  title: string;
  description?: string | undefined;
  image?: string | undefined;
  price?: string | undefined;
  addedAt: string;
}

// URL preview interface
export interface UrlPreview {
  title: string;
  description?: string | undefined;
  image?: string | undefined;
  url: string;
  price?: string | undefined;
}

// API response types
export interface PreviewApiResponse {
  success: boolean;
  data?: UrlPreview;
  error?: string;
}

// Hook return types
export interface UseUrlPreviewReturn {
  preview: UrlPreview | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export interface UseWishlistReturn {
  items: WishlistItem[];
  addItem: (preview: UrlPreview) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}
