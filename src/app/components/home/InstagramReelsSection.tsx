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
		if (!target || !root) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				setRatio(entry.intersectionRatio);
			},
			{
				root,
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
	const touchStartXRef = useRef<number | null>(null);
	const touchDeltaXRef = useRef(0);
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

	const openInstagram = useCallback(() => {
		const link = item.instagram_link ?? item.product_link;
		window.open(link, '_blank', 'noopener,noreferrer');
	}, [item.instagram_link, item.product_link]);

	const handleCardClick = useCallback(() => {
		if (Math.abs(touchDeltaXRef.current) > 8) {
			touchDeltaXRef.current = 0;
			return;
		}
		openInstagram();
	}, [openInstagram]);

	return (
		<div
			ref={cardRef}
			role="link"
			tabIndex={0}
			onClick={handleCardClick}
			onTouchStart={(event) => {
				touchStartXRef.current = event.touches[0]?.clientX ?? null;
				touchDeltaXRef.current = 0;
			}}
			onTouchMove={(event) => {
				if (touchStartXRef.current == null) return;
				const currentX = event.touches[0]?.clientX;
				if (typeof currentX !== 'number') return;
				touchDeltaXRef.current = currentX - touchStartXRef.current;
			}}
			onTouchEnd={() => {
				touchStartXRef.current = null;
			}}
			onKeyDown={(event) => {
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault();
					openInstagram();
				}
			}}
			className="group relative flex-none snap-start w-[clamp(138px,42vw,170px)] sm:w-[182px] md:w-[198px] lg:w-[220px] xl:w-[224px] max-w-[224px] cursor-pointer outline-none select-none"
		>
			<div
				className={`relative aspect-[9/16] overflow-hidden rounded-[18px] bg-[#F8F2E8] shadow-[0_16px_32px_rgba(40,28,16,0.10)] ring-1 ring-[#D4AF37]/18 transition-all duration-300 ease-out will-change-transform motion-reduce:transition-none ${
					isEntered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
				} md:group-hover:scale-[1.04] md:group-hover:shadow-[0_18px_34px_rgba(0,0,0,0.18)] touch-pan-x overscroll-x-contain`}
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
	maxItems = 6,
	className = '',
}: InstagramReelsSectionProps) {
	const displayItems = useMemo(() => items.slice(0, maxItems), [items, maxItems]);
	const carouselRef = useRef<HTMLDivElement | null>(null);
	const [scrollRoot, setScrollRoot] = useState<HTMLElement | null>(null);
	const ratiosRef = useRef<Record<string, number>>({});

	const setScrollRootRef = useCallback((node: HTMLDivElement | null) => {
		carouselRef.current = node;
		setScrollRoot(node);
	}, []);

	const scrollCarousel = useCallback((direction: 'left' | 'right') => {
		const node = carouselRef.current;
		if (!node) return;
		const amount = Math.max(180, Math.round(node.clientWidth * 0.72));
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
					<div
						ref={setScrollRootRef}
						className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-3 pt-1 scroll-px-4 overscroll-x-contain sm:gap-2.5 sm:scroll-px-6 md:gap-3 md:px-6 [scrollbar-width:none] [-ms-overflow-style:none] [touch-action:pan-x] [scroll-snap-type:x_mandatory] [&::-webkit-scrollbar]:hidden"
					>
						{displayItems.map((item) => (
							<ReelCard
								key={item.id}
								item={item}
								scrollRoot={scrollRoot}
								onVisibilityChange={handleVisibilityChange}
							/>
						))}
					</div>

					<div className="pointer-events-none absolute bottom-3 left-0 top-1 z-10 w-10 rounded-l-[18px] bg-gradient-to-r from-[#F5F3EF] via-[#F5F3EF]/92 to-transparent lg:hidden" />
					<div className="pointer-events-none absolute bottom-3 right-0 top-1 z-10 w-10 rounded-r-[18px] bg-gradient-to-l from-[#F5F3EF] via-[#F5F3EF]/92 to-transparent lg:hidden" />

					<div className="pointer-events-none absolute left-1 top-1/2 z-20 -translate-y-1/2 lg:hidden">
						<button
							type="button"
							onClick={() => scrollCarousel('left')}
							aria-label="Scroll reels left"
							className="pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-[#FFF9F0]/95 text-[#8B7E72] shadow-[0_8px_16px_rgba(43,29,15,0.16)] transition-colors hover:bg-[#F8F2E8] sm:h-9 sm:w-9"
						>
							<span aria-hidden="true">&#8249;</span>
						</button>
					</div>

					<div className="pointer-events-none absolute right-1 top-1/2 z-20 -translate-y-1/2 lg:hidden">
						<button
							type="button"
							onClick={() => scrollCarousel('right')}
							aria-label="Scroll reels right"
							className="pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-[#FFF9F0]/95 text-[#8B7E72] shadow-[0_8px_16px_rgba(43,29,15,0.16)] transition-colors hover:bg-[#F8F2E8] sm:h-9 sm:w-9"
						>
							<span aria-hidden="true">&#8250;</span>
						</button>
					</div>
				</div>
			</div>
		</section>
	);
}

export default InstagramReelsSection;

