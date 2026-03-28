export interface ProductImage {
  id: number;
  image: string;
  image_variants?: {
    thumbnail?: string;
    medium?: string;
    large?: string;
    zoom?: string;
  };
  url: string;
  alt: string;
  type: 'image' | 'video';
  thumbnail?: string;
  variantId?: string;
}

export interface ProductShade {
  id: string;
  name: string;
  productId?: string;
  colorHex?: string;
  colorPanelType?: 'hex' | 'gradient' | 'image';
  colorPanelValue?: string;
  finishType?: string;
  imageUrl?: string;
  imageVariants?: {
    thumbnail?: string;
    medium?: string;
    large?: string;
    zoom?: string;
  };
  secondaryImageUrl?: string;
  secondaryImageVariants?: {
    thumbnail?: string;
    medium?: string;
    large?: string;
    zoom?: string;
  };
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
  categoryId?: number;
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
