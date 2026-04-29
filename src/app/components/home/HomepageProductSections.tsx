import React, { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Star } from 'lucide-react';
import { ProductCard } from '@/app/components/products/ProductCard';
import { Skeleton } from '@/app/components/ui/skeleton';
import { useApp } from '@/app/contexts/AppContext';
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
					<Skeleton className="h-10 w-72 mx-auto mb-3"
					
					/>
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
	const { convertPrice } = useApp();
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

	if (state.isLoading && !state.data) {
		return (
			<>
				{SECTION_META.map((section) => (
					<ProductSectionSkeleton key={section.key} />
				))}
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
