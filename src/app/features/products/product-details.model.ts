export interface ProductImage {
  id: number;
  url: string;
  alt: string;
  type: 'image' | 'video';
  thumbnail?: string;
  variantId?: string;
}

export interface ProductShade {
  id: string;
  name: string;
  colorHex?: string;
  colorPanelType?: 'hex' | 'gradient' | 'image';
  colorPanelValue?: string;
  finishType?: string;
  imageUrl?: string;
  secondaryImageUrl?: string;
  price: number;
  discountPrice?: number | null;
  stock: number;
  variantModelNo?: string;
}

export interface ProductTab {
  id: string;
  label: string;
  content: string | React.ReactNode;
}

export interface ProductReview {
  id: number;
  name: string;
  rating: number;
  date: string;
  verified: boolean;
  comment: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  price: number;
  currency: string;
  description: string;
  baseStock?: number;
  images: ProductImage[];
  shades: ProductShade[];
  variants?: ProductShade[];
  tabs: ProductTab[];
  reviews: ProductReview[];
  averageRating: number;
  totalReviews: number;
  inStock: boolean;
  productModelNo?: string;
}
