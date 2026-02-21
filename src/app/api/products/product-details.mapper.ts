import { ASSET_BASE_URL } from '@/app/api/http';
import type { ApiProduct } from '@/app/api/products/product-details.api-model';
import type { Product, ProductImage, ProductTab } from '@/app/features/products/product-details.model';

const buildAssetUrl = (value?: string | null) => {
  if (!value) return '';
  if (value.startsWith('http')) return value;
  if (value.startsWith('/')) return `${ASSET_BASE_URL}${value}`;
  return `${ASSET_BASE_URL}/${value}`;
};

const resolveMediaType = (url: string, mediaType?: string): 'image' | 'video' => {
  if (mediaType === 'video') return 'video';
  if (/\.(mp4|webm|ogg)$/i.test(url)) return 'video';
  return 'image';
};

const normalizeColorPanelType = (type?: string | null): 'hex' | 'gradient' | 'image' | undefined => {
  if (!type) return undefined;
  const normalized = type.toLowerCase();
  if (normalized === 'hex' || normalized === 'gradient' || normalized === 'image') {
    return normalized as 'hex' | 'gradient' | 'image';
  }
  return undefined;
};

const normalizeFinishType = (type?: string | null): string | undefined => {
  if (!type) return undefined;
  const normalized = type.toLowerCase();
  if (normalized === 'matte' || normalized === 'shimmer' || normalized === 'metallic') return normalized;
  return normalized;
};

export const mapApiProductToProduct = (api: ApiProduct): Product => {
  const baseStock = Number(api.base_stock ?? 0) || 0;
  const tabs: ProductTab[] = [];
  const pushTab = (id: string, label: string, content?: string | null) => {
    if (content && content.trim().length > 0) {
      tabs.push({ id, label, content });
    }
  };

  pushTab('how-to-apply', 'HOW TO APPLY', api.how_to_apply);
  pushTab('benefits', 'BENEFITS', api.benefits);
  pushTab('key-features', 'KEY FEATURES', api.key_features);
  pushTab('ingredients', 'INGREDIENTS', api.ingredients);

  const shades = (api.variants ?? []).map((variant) => {
    const colorPanelType = normalizeColorPanelType(variant.color_panel_type);
    const colorPanelValue =
      colorPanelType === 'image'
        ? buildAssetUrl(variant.color_panel_value) || undefined
        : variant.color_panel_value ?? undefined;
    const finishType = normalizeFinishType(variant.color_type) ?? 'matte';

    return {
      id: String(variant.id),
      name: variant.shade,
      colorHex: colorPanelType === 'hex' ? colorPanelValue : undefined,
      colorPanelType,
      colorPanelValue,
      finishType,
      imageUrl: buildAssetUrl(variant.main_image) || undefined,
      secondaryImageUrl: buildAssetUrl(variant.secondary_image) || undefined,
      price: Number(variant.price) || 0,
      discountPrice: variant.discount_price ? Number(variant.discount_price) : null,
      stock: Number.isFinite(variant.stock) ? variant.stock : 0,
      variantModelNo: variant.variant_model_no,
    };
  });

  const variantImages = (api.variants ?? []).flatMap((variant, index) => {
    const mainUrl = buildAssetUrl(variant.main_image);
    const secondaryUrl = buildAssetUrl(variant.secondary_image);
    const baseId = index * 2 + 1;

    const images = [] as ProductImage[];
    if (mainUrl) {
      images.push({
        id: baseId,
        url: mainUrl,
        alt: `${api.name} - ${variant.shade}`,
        type: 'image' as const,
        variantId: String(variant.id),
      });
    }
    if (secondaryUrl) {
      images.push({
        id: baseId + 1,
        url: secondaryUrl,
        alt: `${api.name} - ${variant.shade} alt`,
        type: 'image' as const,
        variantId: String(variant.id),
      });
    }
    return images;
  });

  const mediaImages = (api.media ?? []).map((media, index) => {
    const url = buildAssetUrl(media.image_url);
    return {
      id: variantImages.length + index + 1,
      url,
      alt: `${api.name} media ${index + 1}`,
      type: resolveMediaType(url, media.media_type),
    };
  });

  const images = [...variantImages, ...mediaImages].filter((image) => image.url);

  const firstVariant = api.variants?.[0];
  const price = firstVariant
    ? Number(firstVariant.discount_price || firstVariant.price || 0)
    : Number(api.base_price) || 0;

  const inStock =
    (api.variants ?? []).length === 0
      ? baseStock > 0
      : api.variants.some((variant) => variant.stock > 0);

  return {
    id: String(api.id),
    slug: api.slug,
    name: api.name,
    subtitle: api.short_description ?? api.description ?? '',
    price,
    currency: 'AED',
    description: api.description ?? '',
    categoryId: api.category_id ?? undefined,
    productModelNo: api.product_model_no,
    baseStock,
    images,
    shades,
    tabs,
    reviews: [],
    averageRating: 0,
    totalReviews: 0,
    inStock,
  };
};
