import { ASSET_BASE_URL } from "@/app/api/http";
import type { ApiProductListItem, ApiProductListResponse } from "@/app/api/products/product-list.api-model";
import type { ProductListItem, ProductListPage } from "@/app/features/products/product-list.model";

const buildAssetUrl = (value?: string | null) => {
  if (!value) return "";
  if (value.startsWith("http")) return value;
  if (value.startsWith("/")) return `${ASSET_BASE_URL}${value}`;
  return `${ASSET_BASE_URL}/${value}`;
};

const normalizeImageVariants = (variants?: {
  thumbnail?: string | null;
  medium?: string | null;
  large?: string | null;
  zoom?: string | null;
} | null) => {
  if (!variants) return undefined;

  return {
    thumbnail: buildAssetUrl(variants.thumbnail) || undefined,
    medium: buildAssetUrl(variants.medium) || undefined,
    large: buildAssetUrl(variants.large) || undefined,
    zoom: buildAssetUrl(variants.zoom) || undefined,
  };
};

const resolvePrimaryImage = (api: ApiProductListItem) => {
  const productImage = api.image;
  const variantImage = api.variants?.find((variant) => variant.main_image)?.main_image;
  const mediaImage = api.media?.[0]?.image_url;
  const selected = productImage || variantImage || mediaImage || "";
  return buildAssetUrl(selected);
};

const resolveThumbnail = (api: ApiProductListItem) => {
  const selected = api.thumbnail || resolvePrimaryImage(api);
  return buildAssetUrl(selected);
};

const resolveHoverImage = (api: ApiProductListItem) => {
  const hoverCandidate = api.afterimage || api.media?.[1]?.image_url || api.media?.[0]?.image_url;
  return buildAssetUrl(hoverCandidate);
};

export const mapApiListProductToProduct = (api: ApiProductListItem): ProductListItem => {
  const price = Number(api.base_price) || Number(api.variants?.[0]?.price ?? 0) || 0;
  const baseStock = Number(api.base_stock ?? 0) || 0;
  const hasVariants = (api.variants ?? []).length > 0;
  const inStock = hasVariants
    ? api.variants?.some((variant) => variant.stock > 0) ?? false
    : baseStock > 0;

  const thumbnailUrl = resolveThumbnail(api);
  const hoverImageUrl = resolveHoverImage(api);
  const imageVariants = normalizeImageVariants(api.image_variants);
  const primaryImage = resolvePrimaryImage(api) || thumbnailUrl;

  return {
    id: String(api.id),
    slug: api.slug,
    name: api.name,
    price,
    currency: "AED",
    image: primaryImage,
    image_variants: imageVariants,
    imageUrl: primaryImage,
    thumbnailUrl,
    hoverImageUrl,
    shortDescription: api.short_description ?? api.description ?? "",
    inStock,
    tag: api.tag || undefined,
  };
};

export const mapApiProductListResponse = (api: ApiProductListResponse): ProductListPage => ({
  page: api.page,
  limit: api.limit,
  count: api.count,
  products: api.products.map(mapApiListProductToProduct),
});
