export interface ProductListItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  imageUrl: string;
  thumbnailUrl?: string;
  hoverImageUrl?: string;
  shortDescription?: string;
  inStock: boolean;
}

export interface ProductListPage {
  page: number;
  limit: number;
  count: number;
  products: ProductListItem[];
}
