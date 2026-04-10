import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

export type InstagramReelItem = {
	id: string;
	video_url: string;
	product_name: string;
	price: string;
	product_image: string;
	product_link: string;
	instagram_link?: string;
};

export const instagramReelsMockData: InstagramReelItem[] = [
	{
		id: 'reel-1',
		video_url: 'https://zskzrnqtcbwkyhbwgnha.supabase.co/storage/v1/object/public/reels/65ebbf85-dd15-43dc-b91d-2373291b274d.mp4',
		product_name: 'Like A Pro Mascara',
		price: 'AED 40',
		product_image: 'https://ik.imagekit.io/dvagrhc2w/just_gold/products/images/JG-9447.jpg?tr=w-800,f-auto,q-auto',
		product_link: '/product/115-like-a-pro-mascara',
		instagram_link: 'https://www.instagram.com/reel/DWGwc95CFEu/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==',
	},
	{
		id: 'reel-2',
		video_url: 'https://zskzrnqtcbwkyhbwgnha.supabase.co/storage/v1/object/public/reels/85de62ea-9073-4367-a6dc-9330ab46a8d0.mp4',
		product_name: 'Butter Kohl Eyeliner',
		price: 'AED 25',
		product_image: 'https://ik.imagekit.io/dvagrhc2w/just_gold/products/variants/JG-Skin.jpg?tr=w-800,f-auto,q-auto',
		product_link: '/product/110-butter-kohl-eyeliner--made-in-germany',
		instagram_link: 'https://www.instagram.com/reel/DObCniWDFYL/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==',
	},
	{
		id: 'reel-3',
		video_url: 'https://zskzrnqtcbwkyhbwgnha.supabase.co/storage/v1/object/public/reels/b0158406-aae1-4cae-abf4-4349ace426c4.mp4',
		product_name: 'Full Coverage Concealer & Corrector',
		price: 'AED 28',
		product_image: 'https://ik.imagekit.io/dvagrhc2w/just_gold/products/variants/01.jpg?tr=w-1400,f-auto,q-auto',
		product_link: '/product/94-full-coverage-concealer--corrector',
		instagram_link: 'https://www.instagram.com/reel/DWGwc95CFEu/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==',
	},
	{
		id: 'reel-4',
		video_url: 'https://zskzrnqtcbwkyhbwgnha.supabase.co/storage/v1/object/public/reels/d3d28209-3d72-4054-bb9e-5c5b867e927e.mp4',
		product_name: 'Two-Way Cake (Made in Taiwan)',
		price: 'AED 50',
		product_image: 'https://ik.imagekit.io/dvagrhc2w/just_gold/products/images/JG-1418.jpg?tr=w-800,f-auto,q-auto',
		product_link: '/product/88-two-way-cake--made-in-taiwan',
		instagram_link: 'https://www.instagram.com/reel/DWGwc95CFEu/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==',
	},
	{
		id: 'reel-5',
		video_url: 'https://zskzrnqtcbwkyhbwgnha.supabase.co/storage/v1/object/public/reels/ef347569-3e30-4287-b349-8b9d2f0b507c.mp4',
		product_name: 'Hydra Lock Primer',
		price: 'AED 25',
		product_image: 'https://ik.imagekit.io/dvagrhc2w/just_gold/products/images/9471.jpg?tr=w-800,f-auto,q-auto',
		product_link: '/product/116-hydra-lock-primer',
		instagram_link: 'https://www.instagram.com/reel/DWGwc95CFEu/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==',
	},
	{
		id: 'reel-6',
		video_url: 'https://zskzrnqtcbwkyhbwgnha.supabase.co/storage/v1/object/public/reels/fe1be708-e9db-4a01-8bff-0da49e30f427.mp4',
		product_name: 'New Formula Foundation Stick & Concealer',
		price: 'AED 40',
		product_image: 'https://res.cloudinary.com/dvagrhc2w/image/upload/w_1400,f_auto,q_auto/just_gold/products/variants/osrzhczxxgjvpcts8ymd',
		product_link: '/product/19-new-formula-foundation-stick--concealer',
		instagram_link: 'https://www.instagram.com/reel/DWGwc95CFEu/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==',
	},
    	{
		id: 'reel-7',
		video_url: 'https://zskzrnqtcbwkyhbwgnha.supabase.co/storage/v1/object/public/reels/bfb39a8e-d4b0-4940-8722-fc129eacec7a.mp4',
		product_name: 'New Formula Foundation Stick & Concealer',
		price: 'AED 40',
		product_image: 'https://res.cloudinary.com/dvagrhc2w/image/upload/w_1400,f_auto,q_auto/just_gold/products/variants/osrzhczxxgjvpcts8ymd',
		product_link: '/product/19-new-formula-foundation-stick--concealer',
		instagram_link: 'https://www.instagram.com/reel/DWGwc95CFEu/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==',
	},
];

type InstagramReelsSectionProps = {
	items?: InstagramReelItem[];
	title?: string;
	subtitle?: string;
	maxItems?: number;
	className?: string;
};

function useIntersectionRatio<T extends Element>(targetRef: React.RefObject<T | null>, root: HTMLElement | null) {
	const [ratio, setRatio] = useState(0);

	useEffect(() => {
		const target = targetRef.current;
		if (!target) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				setRatio(entry.intersectionRatio);
			},
			{
				root: root ?? null,
				threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
				rootMargin: '0px',
			}
		);

		observer.observe(target);

		return () => observer.disconnect();
	}, [targetRef, root]);

	return ratio;
}

function ReelCard({
	item,
	scrollRoot,
	onVisibilityChange,
}: {
	item: InstagramReelItem;
	scrollRoot: HTMLElement | null;
	onVisibilityChange: (id: string, ratio: number) => void;
}) {
	const cardRef = useRef<HTMLDivElement | null>(null);
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const [hasLoadedVideo, setHasLoadedVideo] = useState(false);
	const [isEntered, setIsEntered] = useState(false);

	const visibilityRatio = useIntersectionRatio(cardRef, scrollRoot);

	useEffect(() => {
		onVisibilityChange(item.id, visibilityRatio);
	}, [item.id, onVisibilityChange, visibilityRatio]);

	useEffect(() => {
		if (visibilityRatio > 0.05) {
			setHasLoadedVideo(true);
		}
		if (visibilityRatio > 0.08) {
			setIsEntered(true);
		}
	}, [visibilityRatio]);

	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;

		if (hasLoadedVideo) {
			video.load();
			const playPromise = video.play();
			if (playPromise && typeof playPromise.catch === 'function') {
				playPromise.catch(() => {
					// Browser autoplay policy may delay playback until the next paint.
				});
			}
		} else {
			video.pause();
		}
	}, [hasLoadedVideo]);

	return (
		<div
			ref={cardRef}
			className="group relative w-[clamp(138px,42vw,170px)] sm:w-[182px] md:w-[198px] lg:w-[220px] xl:w-[224px] max-w-[224px] select-none"
		>
			<div
				className={`relative aspect-[9/16] overflow-hidden rounded-[18px] bg-[#F8F2E8] shadow-[0_16px_32px_rgba(40,28,16,0.10)] ring-1 ring-[#D4AF37]/18 transition-all duration-300 ease-out will-change-transform motion-reduce:transition-none ${
					isEntered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
				} md:group-hover:scale-[1.04] md:group-hover:shadow-[0_18px_34px_rgba(0,0,0,0.18)]`}
			>
				<img
					src={item.product_image}
					alt={item.product_name}
					className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ease-out ${
						hasLoadedVideo ? 'opacity-0' : 'opacity-100'
					}`}
					loading="lazy"
					decoding="async"
				/>

				<video
					ref={videoRef}
					className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ease-out ${
						hasLoadedVideo ? 'opacity-100' : 'opacity-0'
					}`}
					muted
					loop
					playsInline
					preload="none"
					poster={item.product_image}
					aria-label={item.product_name}
				>
					{hasLoadedVideo ? <source src={item.video_url} type="video/mp4" /> : null}
				</video>

				<div className="absolute inset-0 bg-gradient-to-t from-[#1F1B18]/66 via-[#1F1B18]/8 to-transparent" />

				<div className="absolute left-2 top-2 rounded-full border border-[#D4AF37]/20 bg-[#FFF9F0]/84 px-1.5 py-0.5 text-[7px] font-semibold uppercase tracking-[0.16em] text-[#8B7E72] backdrop-blur-md sm:left-2.5 sm:top-2.5 sm:px-2.5 sm:py-1 sm:text-[9px] sm:tracking-[0.24em]">
					Most Loved
				</div>

				<div className="absolute inset-x-0 bottom-0 p-2 sm:p-2.5">
					<div className="rounded-[14px] border border-[#D4AF37]/16 bg-[#FFF9F0]/86 px-2 py-2 shadow-[0_12px_24px_rgba(43,29,15,0.12)] backdrop-blur-[16px] sm:px-2.5 sm:py-2.5">
						<div className="flex items-center gap-1.5 sm:gap-2">
							<img
								src={item.product_image}
								alt=""
								aria-hidden="true"
								className="h-8 w-8 shrink-0 rounded-[10px] object-cover ring-1 ring-[#D4AF37]/18 sm:h-9 sm:w-9 sm:rounded-[11px]"
								loading="lazy"
								decoding="async"
							/>

							<div className="min-w-0 flex-1 pr-0.5 sm:pr-1">
								<p className="line-clamp-1 text-[10px] font-semibold leading-tight text-[#1F1B18] sm:text-[11.5px]">
									{item.product_name}
								</p>
								<p className="mt-0.5 text-[8px] font-medium tracking-[0.12em] text-[#8B7E72] sm:text-[9px] sm:tracking-[0.14em]">
									{item.price}
								</p>
							</div>

							<Link
								to={item.product_link}
								onClick={(event) => event.stopPropagation()}
								className="inline-flex shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/28 bg-[#D4AF37] px-2.5 py-1 text-[9px] font-semibold tracking-[0.03em] text-[#1F1B18] shadow-[0_6px_14px_rgba(212,175,55,0.20)] transition-transform duration-300 ease-out hover:scale-[1.04] hover:shadow-[0_8px_18px_rgba(212,175,55,0.26)] sm:px-3 sm:py-1.5 sm:text-[10.5px] sm:tracking-[0.04em]"
							>
								Shop
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export function InstagramReelsSection({
	items = instagramReelsMockData,
	title = 'Just Gold Community',
	subtitle = 'Luxury beauty stories, short-form and shoppable.',
	maxItems,
	className = '',
}: InstagramReelsSectionProps) {
	const displayItems = useMemo(() => {
		if (typeof maxItems === 'number' && maxItems > 0) {
			return items.slice(0, maxItems);
		}
		return items;
	}, [items, maxItems]);
	const carouselRef = useRef<HTMLDivElement | null>(null);
	const isMouseDraggingRef = useRef(false);
	const mouseStartXRef = useRef(0);
	const mouseStartScrollLeftRef = useRef(0);
	const ratiosRef = useRef<Record<string, number>>({});
	const [scrollRoot, setScrollRoot] = useState<HTMLElement | null>(null);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(false);

	const updateScrollState = useCallback(() => {
		const node = carouselRef.current;
		if (!node) {
			setCanScrollLeft(false);
			setCanScrollRight(false);
			return;
		}

		const maxLeft = Math.max(0, node.scrollWidth - node.clientWidth);
		setCanScrollLeft(node.scrollLeft > 2);
		setCanScrollRight(node.scrollLeft < maxLeft - 2);
	}, []);

	const setCarouselRef = useCallback((node: HTMLDivElement | null) => {
		carouselRef.current = node;
		setScrollRoot(node);
		requestAnimationFrame(updateScrollState);
	}, [updateScrollState]);

	const stopMouseDrag = useCallback(() => {
		isMouseDraggingRef.current = false;
		const node = carouselRef.current;
		if (node) node.style.cursor = 'grab';
	}, []);

	useEffect(() => {
		updateScrollState();
	}, [displayItems.length, updateScrollState]);

	useEffect(() => {
		const node = carouselRef.current;
		if (!node) return;

		const onScroll = () => updateScrollState();
		node.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll);

		return () => {
			node.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
		};
	}, [updateScrollState]);

	useEffect(() => {
		const onWindowMouseUp = () => stopMouseDrag();
		window.addEventListener('mouseup', onWindowMouseUp);
		return () => window.removeEventListener('mouseup', onWindowMouseUp);
	}, [stopMouseDrag]);

	const scrollCarousel = useCallback((direction: 'left' | 'right') => {
		const node = carouselRef.current;
		if (!node) return;
		const card = node.querySelector('[data-reel-card]') as HTMLElement | null;
		const cardWidth = card?.offsetWidth ?? 220;
		const amount = Math.max(180, Math.round(cardWidth * 1.05));
		node.scrollBy({
			left: direction === 'right' ? amount : -amount,
			behavior: 'smooth',
		});
	}, []);

	const handleVisibilityChange = useCallback(
		(id: string, ratio: number) => {
			ratiosRef.current[id] = ratio;
		},
		[]
	);

	const isAtStart = !canScrollLeft;
	const isAtEnd = !canScrollRight;

	return (
		<section className={`bg-[#F5F3EF] py-10 md:py-16 ${className}`.trim()}>
			<div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
				<div className="mb-6 text-center md:mb-8">
		
					<h2 className="mt-2 text-[1.85rem] font-semibold tracking-tight text-[#1F1B18] sm:text-3xl md:mt-3 md:text-3xl">
						{title}
					</h2>
					<p className="mx-auto mt-2 max-w-2xl text-[13px] leading-relaxed text-[#6F655D] sm:text-sm md:mt-3 md:text-base">
						{subtitle}
					</p>
				</div>

				<div className="relative">
					<div className="overflow-hidden px-10 sm:px-12 lg:px-14">
						<div
							ref={setCarouselRef}
							onMouseDown={(event) => {
								if (event.button !== 0) return;
								const node = carouselRef.current;
								if (!node) return;
								isMouseDraggingRef.current = true;
								mouseStartXRef.current = event.clientX;
								mouseStartScrollLeftRef.current = node.scrollLeft;
								node.style.cursor = 'grabbing';
								event.preventDefault();
							}}
							onMouseMove={(event) => {
								if (!isMouseDraggingRef.current) return;
								const node = carouselRef.current;
								if (!node) return;
								const deltaX = event.clientX - mouseStartXRef.current;
								node.scrollLeft = mouseStartScrollLeftRef.current - deltaX;
							}}
							onMouseUp={stopMouseDrag}
							onMouseLeave={stopMouseDrag}
							className="no-scrollbar flex gap-2 sm:gap-2.5 md:gap-3 overflow-x-auto scroll-smooth snap-x snap-proximity cursor-grab [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch] [touch-action:pan-x] [&::-webkit-scrollbar]:hidden"
						>
							{displayItems.map((item) => (
								<div key={item.id} data-reel-card className="snap-start shrink-0 px-1 sm:px-1.5 md:px-2 pb-3 pt-1">
									<ReelCard
										item={item}
										scrollRoot={scrollRoot}
										onVisibilityChange={handleVisibilityChange}
									/>
								</div>
							))}
						</div>
					</div>

					<div className={`pointer-events-none absolute inset-y-1 left-10 z-10 w-6 rounded-l-[18px] bg-gradient-to-r from-[#F5F3EF] via-[#F5F3EF]/70 to-transparent transition-opacity duration-200 sm:left-12 sm:w-7 lg:left-14 lg:w-8 ${isAtStart ? 'opacity-0' : 'opacity-100'}`} />
					<div className={`pointer-events-none absolute inset-y-1 right-10 z-10 w-6 rounded-r-[18px] bg-gradient-to-l from-[#F5F3EF] via-[#F5F3EF]/70 to-transparent transition-opacity duration-200 sm:right-12 sm:w-7 lg:right-14 lg:w-8 ${isAtEnd ? 'opacity-0' : 'opacity-100'}`} />

					<div className="pointer-events-none absolute -left-2 top-1/2 z-20 -translate-y-1/2 sm:-left-3 lg:-left-4">
						<button
							type="button"
							onClick={() => scrollCarousel('left')}
							aria-label="Scroll reels left"
							className="pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-[#FFF9F0]/95 text-[#8B7E72] shadow-[0_8px_16px_rgba(43,29,15,0.16)] transition-colors hover:bg-[#F8F2E8] sm:h-9 sm:w-9 lg:h-10 lg:w-10"
						>
							<span aria-hidden="true">&#8249;</span>
						</button>
					</div>

					<div className="pointer-events-none absolute -right-2 top-1/2 z-20 -translate-y-1/2 sm:-right-3 lg:-right-4">
						<button
							type="button"
							onClick={() => scrollCarousel('right')}
							aria-label="Scroll reels right"
							className="pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-[#FFF9F0]/95 text-[#8B7E72] shadow-[0_8px_16px_rgba(43,29,15,0.16)] transition-colors hover:bg-[#F8F2E8] sm:h-9 sm:w-9 lg:h-10 lg:w-10"
						>
							<span aria-hidden="true">&#8250;</span>
						</button>
					</div>
				</div>

				<style>{`
					.no-scrollbar::-webkit-scrollbar { display: none; }
				`}</style>
			</div>
		</section>
	);
}

export default InstagramReelsSection;

