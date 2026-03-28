export type ProductImageVariantType = 'thumbnail' | 'medium' | 'large' | 'zoom';

export type ProductImageVariants = Partial<Record<ProductImageVariantType, string | null | undefined>>;

type ProductImageSource = {
  image?: string | null;
  image_variants?: ProductImageVariants | null;
};

const normalizeImage = (value?: string | null) => {
  const normalized = value?.trim();
  return normalized ? normalized : '';
};

export const getProductImage = (
  product: ProductImageSource | null | undefined,
  type: ProductImageVariantType
) => normalizeImage(product?.image_variants?.[type]) || normalizeImage(product?.image);

export const getProductImageSrcSet = (
  product: ProductImageSource | null | undefined
) => {
  const sources = [
    getProductImage(product, 'thumbnail') && `${getProductImage(product, 'thumbnail')} 480w`,
    getProductImage(product, 'medium') && `${getProductImage(product, 'medium')} 768w`,
    getProductImage(product, 'large') && `${getProductImage(product, 'large')} 1200w`,
  ].filter(Boolean) as string[];

  return sources.length ? Array.from(new Set(sources)).join(', ') : undefined;
};
