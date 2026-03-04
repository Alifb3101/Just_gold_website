import React, { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Star } from 'lucide-react';
import { ProductCard } from '@/app/components/products/ProductCard';
import { Skeleton } from '@/app/components/ui/skeleton';
import type { HomepageData, HomepageSectionKey } from '@/services/homepageService';
import { getHomepageDataCached } from '@/services/homepageService';

type HomepageState = {
	data: HomepageData | null;
	isLoading: boolean;
	error: string | null;
};

const SECTION_META: Array<{
	key: HomepageSectionKey;
	title: string;
	subtitle: string;
	icon: React.ComponentType<{ className?: string }>;
}> = [
	{
		key: 'best_seller',
		title: 'Golden Favorites',
		subtitle: 'Discover our most loved products, chosen by beauty enthusiasts worldwide',
		icon: Star,
	},
];

function ProductSectionSkeleton() {
	return (
		<section className="py-16 bg-white">
			<div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-12">
					<Skeleton className="h-10 w-72 mx-auto mb-3" />
					<Skeleton className="h-4 w-[28rem] max-w-full mx-auto" />
				</div>
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
					{Array.from({ length: 8 }).map((_, index) => (
						<div key={index} className="rounded-lg border border-[#EAD9B0] p-3">
							<Skeleton className="aspect-square w-full rounded-md" />
							<Skeleton className="h-4 w-3/4 mt-3" />
							<Skeleton className="h-4 w-1/2 mt-2" />
							<Skeleton className="h-5 w-1/3 mt-3" />
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

export function HomepageProductSections() {
	const mountedRef = useRef(true);
	const [state, setState] = useState<HomepageState>({
		data: null,
		isLoading: true,
		error: null,
	});

	const loadHomepage = useCallback(async (showLoader: boolean) => {
		if (showLoader) {
			setState((prev) => ({ ...prev, isLoading: true, error: null }));
		}

		try {
			const response = await getHomepageDataCached();
			if (!mountedRef.current) return;

			startTransition(() => {
				setState({ data: response, isLoading: false, error: null });
			});
		} catch (error) {
			if (!mountedRef.current) return;
			const message =
				error instanceof Error
					? error.message
					: 'Unable to load homepage products right now. Please try again.';

			setState((prev) => ({ data: prev.data, isLoading: false, error: message }));
		}
	}, []);

	useEffect(() => {
		mountedRef.current = true;
		void loadHomepage(false);

		return () => {
			mountedRef.current = false;
		};
	}, [loadHomepage]);

	const sections = useMemo(() => {
		if (!state.data) return [];
		return SECTION_META.map((meta) => ({
			...meta,
			products: state.data?.[meta.key] ?? [],
		}));
	}, [state.data]);

	const dealProduct = useMemo(() => state.data?.deal_of_the_day?.[0] ?? null, [state.data]);

	const dealProductPath = useMemo(() => {
		if (!dealProduct) return null;
		const normalized = (dealProduct.slug ?? dealProduct.name)
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)+/g, '');

		return `/product/${dealProduct.id}-${normalized}`;
	}, [dealProduct]);

	if (state.isLoading && !state.data) {
		return (
			<>
				{SECTION_META.map((section) => (
					<ProductSectionSkeleton key={section.key} />
				))}
				<section className="relative bg-white py-24 px-6 lg:px-16 overflow-hidden">
					<div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
						<Skeleton className="w-full max-w-md aspect-square rounded-3xl mx-auto" />
						<div className="space-y-6">
							<Skeleton className="h-4 w-28" />
							<Skeleton className="h-12 w-72" />
							<Skeleton className="h-8 w-80" />
							<Skeleton className="h-20 w-full" />
							<Skeleton className="h-10 w-52" />
							<Skeleton className="h-12 w-44 rounded-full" />
						</div>
					</div>
				</section>
			</>
		);
	}

	if (!state.data && state.error) {
		return (
			<section className="py-20 bg-white">
				<div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h2 className="font-['Playfair_Display'] text-3xl font-bold text-[#3E2723] mb-3">
						We couldn&apos;t load products
					</h2>
					<p className="text-[#4A4A4A] mb-6">{state.error}</p>
					<button
						onClick={() => void loadHomepage(true)}
						className="px-8 py-3 bg-transparent border-2 border-[#D4AF37] text-[#D4AF37] rounded-full hover:bg-[#D4AF37] hover:text-white transition-all duration-300 font-semibold"
					>
						Retry
					</button>
				</div>
			</section>
		);
	}

	return (
		<div className="transition-opacity duration-300 ease-out opacity-100">
			{dealProduct ? (
				<section
					id="deal-section"
					className="relative bg-white py-24 px-6 lg:px-16 overflow-hidden"
				>
					<div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-yellow-400/10 blur-[160px] rounded-full" />
					<div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-yellow-600/10 blur-[160px] rounded-full" />

					<div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
						<div className="relative flex justify-center group">
							<div className="absolute inset-0 bg-yellow-500/10 blur-3xl rounded-3xl" />
							<img
								src={dealProduct.image}
								alt={dealProduct.name}
								loading="lazy"
								decoding="async"
								className="relative w-full max-w-md object-cover rounded-3xl shadow-[0_40px_100px_rgba(0,0,0,0.15)] transition-transform duration-700 group-hover:scale-105"
							/>
						</div>

						<div className="space-y-8">
							<div>
								<p className="text-xs tracking-[0.5em] text-yellow-600 uppercase font-semibold">
									Exclusive Offer
								</p>
								<h2 className="mt-4 text-4xl lg:text-5xl font-bold leading-tight bg-gradient-to-r from-black via-yellow-600 to-black bg-[length:200%] bg-clip-text text-transparent">
									Deal of the Day
								</h2>
								<h3 className="mt-4 text-2xl lg:text-3xl font-semibold text-black">
									{dealProduct.name}
								</h3>
								{dealProduct.description ? (
									<p className="mt-6 text-gray-600 text-lg leading-relaxed max-w-xl">
										{dealProduct.description}
									</p>
								) : null}
							</div>

							<div className="flex items-end gap-6">
								<span className="text-4xl font-bold text-black">AED {dealProduct.price}</span>
								{dealProduct.originalPrice ? (
									<span className="text-xl line-through text-gray-400">AED {dealProduct.originalPrice}</span>
								) : null}
							</div>

							<a
								href={dealProductPath ?? '#'}
								className="relative inline-flex items-center justify-center px-12 py-4 rounded-full bg-black text-white font-semibold tracking-widest overflow-hidden group transition-all duration-500"
							>
								<span className="absolute inset-0 w-0 bg-yellow-500 transition-all duration-500 group-hover:w-full" />
								<span className="relative z-10 group-hover:text-black transition duration-500">SHOP NOW</span>
							</a>
						</div>
					</div>
				</section>
			) : null}

			{sections.map((section) => {
				const Icon = section.icon;

				return (
					<section key={section.key} className="py-16 bg-white">
						<div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
							<div className="text-center mb-12">
								<div className="flex items-center justify-center gap-2 mb-3">
									<Icon className="w-6 h-6 fill-[#D4AF37] text-[#D4AF37]" />
									<h2 className="font-['Playfair_Display'] text-3xl md:text-4xl font-bold text-[#3E2723]">
										{section.title}
									</h2>
									<Icon className="w-6 h-6 fill-[#D4AF37] text-[#D4AF37]" />
								</div>
								<p className="text-[#4A4A4A] max-w-2xl mx-auto">{section.subtitle}</p>
							</div>

							{section.products.length > 0 ? (
								<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
									{section.products.map((product) => (
										<ProductCard key={`${section.key}-${product.id}`} product={product} />
									))}
								</div>
							) : (
								<div className="text-center text-[#4A4A4A] py-8 border border-[#EAD9B0] rounded-lg">
									Products for this section will appear shortly.
								</div>
							)}
						</div>
					</section>
				);
			})}

		</div>
	);
}
