export interface ApiProductListItem {
  id: number;
  name: string;
  slug: string;
  base_price: string;
  description?: string | null;
  short_description?: string | null;
  product_model_no?: string;
  created_at?: string;
  thumbnail?: string | null;
  afterimage?: string | null;
  media?: Array<{ image_url: string; media_type?: string }>;
  variants?: Array<{
    id: number;
    stock: number;
    main_image: string;
    price: string;
    discount_price: string | null;
  }>;
}

export interface ApiProductListResponse {
  page: number;
  limit: number;
  count: number;
  products: ApiProductListItem[];
}
