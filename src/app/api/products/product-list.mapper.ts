import { ASSET_BASE_URL } from "@/app/api/http";
import type { ApiProductListItem, ApiProductListResponse } from "@/app/api/products/product-list.api-model";
import type { ProductListItem, ProductListPage } from "@/app/features/products/product-list.model";

const buildAssetUrl = (value?: string | null) => {
  if (!value) return "";
  if (value.startsWith("http")) return value;
  if (value.startsWith("/")) return `${ASSET_BASE_URL}${value}`;
  return `${ASSET_BASE_URL}/${value}`;
};

const resolvePrimaryImage = (api: ApiProductListItem) => {
  const variantImage = api.variants?.find((variant) => variant.main_image)?.main_image;
  const mediaImage = api.media?.[0]?.image_url;
  const selected = variantImage || mediaImage || "";
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
  const inStock = (api.variants ?? []).length === 0
    ? true
    : api.variants?.some((variant) => variant.stock > 0) ?? true;

  const thumbnailUrl = resolveThumbnail(api);
  const hoverImageUrl = resolveHoverImage(api);
  const primaryImage = thumbnailUrl || resolvePrimaryImage(api);

  return {
    id: String(api.id),
    slug: api.slug,
    name: api.name,
    price,
    currency: "AED",
    imageUrl: primaryImage,
    thumbnailUrl,
    hoverImageUrl,
    shortDescription: api.short_description ?? api.description ?? "",
    inStock,
  };
};

export const mapApiProductListResponse = (api: ApiProductListResponse): ProductListPage => ({
  page: api.page,
  limit: api.limit,
  count: api.count,
  products: api.products.map(mapApiListProductToProduct),
});
