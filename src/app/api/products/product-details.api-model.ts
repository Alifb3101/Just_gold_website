export interface ApiVariant {
  id: number;
  shade: string;
  secondary_image?: string | null;
  secondary_image_variants?: {
    thumbnail?: string | null;
    medium?: string | null;
    large?: string | null;
    zoom?: string | null;
  } | null;
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
  variant_model_no: string;
  color_type?: string | null;
  color_panel_type?: 'hex' | 'gradient' | 'image' | null;
  color_panel_value?: string | null;
}

export interface ApiMedia {
  image_url: string;
  media_type: string;
}

export interface ApiProduct {
  id: number;
  name: string;
  slug: string;
  description: string;
  image?: string | null;
  image_variants?: {
    thumbnail?: string | null;
    medium?: string | null;
    large?: string | null;
    zoom?: string | null;
  } | null;
  short_description?: string | null;
  category_id: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  base_price: string;
  base_stock?: number | null;
  product_model_no: string;
  how_to_apply?: string | null;
  benefits?: string | null;
  product_description?: string | null;
  ingredients?: string | null;
  variants: ApiVariant[];
  media: ApiMedia[];
}
