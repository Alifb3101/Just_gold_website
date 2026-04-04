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

const optimizeCloudinaryImage = (url: string) => {
  if (!url || !url.includes('cloudinary.com') || !url.includes('/upload/')) return url;

  const [prefix, suffix] = url.split('/upload/');
  if (!prefix || !suffix) return url;

  const firstSlash = suffix.indexOf('/');
  if (firstSlash === -1) {
    return `${prefix}/upload/f_auto,q_auto/${suffix}`;
  }

  const firstSegment = suffix.slice(0, firstSlash);
  const remainder = suffix.slice(firstSlash + 1);
  const looksLikeTransform = /^[a-z]{1,3}_[^/]+(?:,[a-z]{1,3}_[^/]+)*$/i.test(firstSegment);

  if (!looksLikeTransform) {
    return `${prefix}/upload/f_auto,q_auto/${suffix}`;
  }

  const transforms = new Set(firstSegment.split(','));
  transforms.add('f_auto');
  transforms.add('q_auto');
  return `${prefix}/upload/${Array.from(transforms).join(',')}/${remainder}`;
};

export const getProductImage = (
  product: ProductImageSource | null | undefined,
  type: ProductImageVariantType
) => {
  const source = normalizeImage(product?.image_variants?.[type]) || normalizeImage(product?.image);
  return optimizeCloudinaryImage(source);
};

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
