import React, { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Star, X } from 'lucide-react';
import { ProductCard } from '@/app/components/products/ProductCard';
import { Skeleton } from '@/app/components/ui/skeleton';
import { useApp } from '@/app/contexts/AppContext';
import type { HomepageData, HomepageSectionKey } from '@/services/homepageService';
import { getHomepageDataCached } from '@/services/homepageService';
import { getProductImage, getProductImageSrcSet } from '@/app/utils/productImage';

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

// Replace this URL with your custom Deal of the Day badge artwork.
const DEAL_BADGE_IMAGE_URL = 'https://i.postimg.cc/SQL65yFF/Gemini-Generated-Image-199l6z199l6z199l-removebg-preview.png';
const dealIntroRuntime = { shown: false };

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
	const introTimerRef = useRef<number | null>(null);
	const lastDealInViewRef = useRef<boolean | null>(null);
	const [state, setState] = useState<HomepageState>({
		data: null,
		isLoading: true,
		error: null,
	});
	const [isDealSectionInView, setIsDealSectionInView] = useState(true);
	const [isBadgeDismissed, setIsBadgeDismissed] = useState(false);
	const [showDealIntro, setShowDealIntro] = useState(false);

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

	const dealProductImage = useMemo(() => {
		if (!dealProduct) return '';
		return getProductImage(dealProduct, 'large') || getProductImage(dealProduct, 'medium');
	}, [dealProduct]);

	const dealProductImageSrcSet = useMemo(() => getProductImageSrcSet(dealProduct), [dealProduct]);
	const dealDisplayPrice = useMemo(
		() => (dealProduct ? convertPrice(dealProduct.price) : ''),
		[dealProduct, convertPrice]
	);
	const dealDisplayOriginalPrice = useMemo(
		() =>
			dealProduct && typeof dealProduct.originalPrice === 'number'
				? convertPrice(dealProduct.originalPrice)
				: null,
		[dealProduct, convertPrice]
	);

	useEffect(() => {
		if (!dealProductImage) return;
		const img = new Image();
		img.decoding = 'async';
		img.src = dealProductImage;
	}, [dealProductImage]);

	useEffect(() => {
		const img = new Image();
		img.decoding = 'async';
		img.src = DEAL_BADGE_IMAGE_URL;
	}, []);

	const scrollToDealSection = useCallback(() => {
		const target = document.getElementById('deal-section');
		if (!target) return;
		target.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}, []);

	useEffect(() => {
		if (!dealProduct) return;

		const target = document.getElementById('deal-section');
		if (!target) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				const nextInView = entry.isIntersecting;
				if (lastDealInViewRef.current === nextInView) return;
				lastDealInViewRef.current = nextInView;
				setIsDealSectionInView(nextInView);
			},
			{
				root: null,
				threshold: 0,
				rootMargin: '0px 0px -20% 0px',
			}
		);

		observer.observe(target);

		return () => {
			observer.disconnect();
		};
	}, [dealProduct]);

	useEffect(() => {
		if (isDealSectionInView) {
			setIsBadgeDismissed(false);
		}
	}, [isDealSectionInView]);

	const handleCloseDealBadge = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		event.stopPropagation();
		setIsBadgeDismissed(true);
	}, []);

	const handleCloseDealIntro = useCallback(() => {
		if (introTimerRef.current) {
			window.clearTimeout(introTimerRef.current);
			introTimerRef.current = null;
		}
		setShowDealIntro(false);
	}, []);

	useEffect(() => {
		if (!dealProduct || dealIntroRuntime.shown) return;

		dealIntroRuntime.shown = true;
		setShowDealIntro(true);

		introTimerRef.current = window.setTimeout(() => {
			setShowDealIntro(false);
			introTimerRef.current = null;
		}, 1250);

		return () => {
			if (introTimerRef.current) {
				window.clearTimeout(introTimerRef.current);
				introTimerRef.current = null;
			}
		};
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
								src={dealProductImage}
								srcSet={dealProductImageSrcSet}
								sizes="(max-width: 1024px) 90vw, 40vw"
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
								<span className="text-4xl font-bold text-black">{dealDisplayPrice}</span>
								{dealDisplayOriginalPrice ? (
									<span className="text-xl line-through text-gray-400">{dealDisplayOriginalPrice}</span>
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

			{dealProduct && !showDealIntro && !isDealSectionInView && !isBadgeDismissed ? (
				<div
					role="button"
					tabIndex={0}
					onClick={scrollToDealSection}
					onKeyDown={(event) => {
						if (event.key === 'Enter' || event.key === ' ') {
							event.preventDefault();
							scrollToDealSection();
						}
					}}
					className="fixed z-[70] h-[82px] w-[82px] sm:h-[96px] sm:w-[96px] md:h-[108px] md:w-[108px] lg:h-[122px] lg:w-[122px] rounded-full border border-[#E7C87C]/80 bg-[radial-gradient(circle_at_30%_22%,rgba(255,255,255,0.95),rgba(255,251,239,0.9)_40%,rgba(245,227,184,0.8)_100%)] p-1 sm:p-1.5 md:p-2 shadow-[0_8px_18px_rgba(62,39,35,0.16)] md:shadow-[0_12px_28px_rgba(62,39,35,0.2)] transition-transform duration-300 hover:scale-[1.04] transform-gpu will-change-transform"
					style={{
						animation: 'dealBadgeIn 420ms cubic-bezier(0.22, 1, 0.36, 1)',
						right: 'max(0.75rem, env(safe-area-inset-right))',
						bottom: 'max(0.75rem, env(safe-area-inset-bottom))',
					}}
					aria-label="Deal of the Day shortcut"
				>
					<div className="relative h-full w-full overflow-hidden rounded-full border border-[#E5C878]/70 bg-white/70 shadow-[inset_0_1px_10px_rgba(255,255,255,0.55)]">
						<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(255,255,255,0.62),rgba(255,255,255,0)_54%)]" />
						<img
							src={DEAL_BADGE_IMAGE_URL}
							alt="Deal of the Day"
							className="h-full w-full object-cover p-[3px] sm:p-1"
							loading="eager"
							decoding="async"
						/>
					</div>
					<button
						type="button"
						onClick={handleCloseDealBadge}
						className="absolute -top-1.5 -right-1 sm:-top-2 sm:-right-1 md:-top-3 md:right-0 h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 rounded-full border border-[#E8C978] bg-white shadow-[0_8px_16px_rgba(62,39,35,0.16)] text-[#8A6A45] hover:text-[#3E2723] flex items-center justify-center z-20"
						aria-label="Close deal badge"
					>
						<X className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
					</button>
				</div>
			) : null}

			{dealProduct && showDealIntro ? (
				<div className="fixed inset-0 z-[85] pointer-events-auto">
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(62,39,35,0.08)_0%,rgba(62,39,35,0.03)_44%,rgba(62,39,35,0)_72%)]" />
					<div className="absolute inset-0 flex items-center justify-center px-3">
						<div className="w-[min(94vw,620px)] rounded-[30px] border border-[#D4AF37]/38 bg-white/92 text-[#3E2723] shadow-[0_20px_56px_rgba(62,39,35,0.14)] p-2.5 sm:p-4 animate-[dealIntroShow_220ms_ease-out] transform-gpu will-change-transform">
							<button
								type="button"
								onClick={handleCloseDealIntro}
								className="absolute right-4 top-3 h-8 w-8 rounded-full border border-[#D4AF37]/55 bg-[#FFF5E6] text-[#7A5A35] text-sm hover:bg-[#FDEBCF] hover:text-[#3E2723]"
								aria-label="Close deal popup"
							>
								x
							</button>
							<div className="flex items-center gap-2.5 sm:gap-3">
								<div className="w-[82px] sm:w-[104px] md:w-[118px] aspect-square shrink-0 rounded-2xl overflow-hidden border border-[#D4AF37]/45 shadow-[0_10px_22px_rgba(62,39,35,0.14)]">
									<img
										src={dealProductImage}
										alt={dealProduct.name}
										className="h-full w-full object-cover"
										loading="lazy"
										decoding="async"
									/>
								</div>
								<div className="flex-1 min-w-0 py-1">
									<p className="text-[10px] uppercase tracking-[0.3em] text-[#8C6A3E] font-semibold">Exclusive Drop</p>
									<h3 className="mt-1 text-lg sm:text-3xl font-black leading-tight bg-gradient-to-r from-[#3E2723] via-[#D4AF37] to-[#3E2723] bg-clip-text text-transparent">
										Deal Of The Day
									</h3>
									<p className="mt-1 text-xs sm:text-sm text-[#5A4635] line-clamp-1">{dealProduct.name}</p>
									<div className="mt-3 flex items-end gap-3">
										<span className="text-lg sm:text-2xl font-bold text-[#3E2723]">{dealDisplayPrice}</span>
										{dealDisplayOriginalPrice ? (
											<span className="text-xs sm:text-sm line-through text-[#9E8764]">{dealDisplayOriginalPrice}</span>
										) : null}
									</div>
									<p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-[#8A6A45]">Pinning shortcut...</p>
									<div className="mt-2 h-1.5 rounded-full bg-[#EADCC4] overflow-hidden">
										<span className="block h-full w-full bg-[linear-gradient(90deg,#D4AF37,#F5DA9F,#D4AF37)] animate-[dealProgress_1.2s_linear_forwards]" />
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			) : null}

			<style>{`
				@keyframes dealBadgeIn {
					0% { opacity: 0; transform: translateY(10px) scale(0.92); }
					100% { opacity: 1; transform: translateY(0) scale(1); }
				}
				@keyframes dealIntroShow {
					0% { opacity: 0; transform: translateY(10px) scale(0.98); }
					100% { opacity: 1; transform: translateY(0) scale(1); }
				}
				@keyframes dealProgress {
					0% { transform: translateX(-100%); }
					100% { transform: translateX(0%); }
				}
			`}</style>

		</div>
	);
}
