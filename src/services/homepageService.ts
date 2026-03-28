import { fetchJson } from '@/app/api/http';

export type HomepageSectionKey = 'best_seller' | 'new_arrivals' | 'trending' | 'deal_of_the_day';

export type HomepageProductCard = {
	id: number;
	name: string;
	slug?: string;
	description?: string;
	image: string;
	image_variants?: {
		thumbnail?: string;
		medium?: string;
		large?: string;
		zoom?: string;
	};
	price: number;
	originalPrice?: number;
	rating: number;
	reviews: number;
	badge?: string;
};

export type HomepageData = {
	best_seller: HomepageProductCard[];
	new_arrivals: HomepageProductCard[];
	trending: HomepageProductCard[];
	deal_of_the_day: HomepageProductCard[];
};

type ApiHomepageItem = {
	id?: number | string | null;
	name?: string | null;
	slug?: string | null;
	image?: string | null;
	image_variants?: {
		thumbnail?: string | null;
		medium?: string | null;
		large?: string | null;
		zoom?: string | null;
	} | null;
	thumbnail?: string | null;
	description?: string | null;
	price?: number | string | null;
	discount_price?: number | string | null;
};

type ApiHomepagePayload = {
	success?: boolean;
	data?: {
		best_seller?: ApiHomepageItem[];
		new_arrivals?: ApiHomepageItem[];
		trending?: ApiHomepageItem[];
		deal_of_the_day?: ApiHomepageItem[];
	};
};

const ENDPOINT = '/homepage';
const CACHE_TTL = 5 * 60 * 1000;

let cachedHomepage: HomepageData | null = null;
let cachedAt = 0;
let inFlight: Promise<HomepageData> | null = null;

const toNumber = (value: unknown, fallback = 0) => {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : fallback;
};

const toString = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const mapItem = (
	item: ApiHomepageItem,
	index: number,
	badge: string
): HomepageProductCard => {
	const basePrice = toNumber(item.price, 0);
	const hasDiscount = item.discount_price !== null && item.discount_price !== undefined;
	const discountPrice = hasDiscount ? toNumber(item.discount_price, basePrice) : null;

	return {
		id: toNumber(item.id, index + 1),
		name: toString(item.name) || 'Untitled Product',
		slug: toString(item.slug) || undefined,
		description: toString(item.description) || undefined,
		image: toString(item.image) || toString(item.thumbnail),
		image_variants: item.image_variants
			? {
					thumbnail: toString(item.image_variants.thumbnail) || undefined,
					medium: toString(item.image_variants.medium) || undefined,
					large: toString(item.image_variants.large) || undefined,
					zoom: toString(item.image_variants.zoom) || undefined,
			  }
			: undefined,
		price: discountPrice ?? basePrice,
		originalPrice: discountPrice !== null ? basePrice : undefined,
		rating: 5,
		reviews: 0,
		badge,
	};
};

const normalizeHomepage = (payload: ApiHomepagePayload): HomepageData => {
	if (!payload.success || !payload.data) {
		throw new Error('Homepage response is not successful.');
	}

	return {
		best_seller: (payload.data.best_seller ?? []).map((item, index) =>
			mapItem(item, index, 'Best Seller')
		),
		new_arrivals: (payload.data.new_arrivals ?? []).map((item, index) =>
			mapItem(item, index, 'New')
		),
		trending: (payload.data.trending ?? []).map((item, index) =>
			mapItem(item, index, 'Trending')
		),
		deal_of_the_day: (payload.data.deal_of_the_day ?? []).map((item, index) =>
			mapItem(item, index, 'Deal')
		),
	};
};

const hasFreshCache = () => cachedHomepage !== null && Date.now() - cachedAt < CACHE_TTL;

export async function getHomepageData(signal?: AbortSignal): Promise<HomepageData> {
	const payload = await fetchJson<ApiHomepagePayload>(ENDPOINT, { signal });
	return normalizeHomepage(payload);
}

export async function getHomepageDataCached(signal?: AbortSignal): Promise<HomepageData> {
	if (hasFreshCache() && cachedHomepage) return cachedHomepage;

	if (!inFlight) {
		inFlight = getHomepageData(signal)
			.then((result) => {
				cachedHomepage = result;
				cachedAt = Date.now();
				return result;
			})
			.finally(() => {
				inFlight = null;
			});
	}

	return inFlight;
}

export async function prefetchHomepageData() {
	if (hasFreshCache()) return;
	try {
		await getHomepageDataCached();
	} catch {
		// non-critical prefetch
	}
}
