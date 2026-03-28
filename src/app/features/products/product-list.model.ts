export interface ProductListItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  image: string;
  image_variants?: {
    thumbnail?: string;
    medium?: string;
    large?: string;
    zoom?: string;
  };
  imageUrl: string;
  thumbnailUrl?: string;
  hoverImageUrl?: string;
  shortDescription?: string;
  inStock: boolean;
  tag?: string;
}

export interface ProductListPage {
  page: number;
  limit: number;
  count: number;
  products: ProductListItem[];
}
