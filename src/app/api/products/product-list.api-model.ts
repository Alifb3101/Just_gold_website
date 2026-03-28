export interface ApiProductListItem {
  id: number;
  name: string;
  slug: string;
  base_price: string;
  base_stock?: number | null;
  description?: string | null;
  short_description?: string | null;
  product_model_no?: string;
  created_at?: string;
  image?: string | null;
  image_variants?: {
    thumbnail?: string | null;
    medium?: string | null;
    large?: string | null;
    zoom?: string | null;
  } | null;
  thumbnail?: string | null;
  afterimage?: string | null;
  media?: Array<{ image_url: string; media_type?: string }>;
  variants?: Array<{
    id: number;
    stock: number;
    main_image: string;
    main_image_variants?: {
      thumbnail?: string | null;
      medium?: string | null;
      large?: string | null;
      zoom?: string | null;
    } | null;
    price: string;
    discount_price: string | null;
  }>;
  tag?: string | null;
}

export interface ApiProductListResponse {
  page: number;
  limit: number;
  count: number;
  products: ApiProductListItem[];
}
