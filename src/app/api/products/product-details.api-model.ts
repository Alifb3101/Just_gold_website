export interface ApiVariant {
  id: number;
  shade: string;
  secondary_image?: string | null;
  stock: number;
  main_image: string;
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
  key_features?: string | null;
  ingredients?: string | null;
  variants: ApiVariant[];
  media: ApiMedia[];
}
