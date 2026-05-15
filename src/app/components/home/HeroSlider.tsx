import React, { useRef } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Slide {
  id: number;
  image: string;
  name: string;
}

const slides: Slide[] = [
    { id: 115,
       image: "https://res.cloudinary.com/dvagrhc2w/image/upload/w_auto,dpr_auto,f_auto,q_auto/v1774890031/JG-Mascara_WebBanner.jpg_as4e2u.jpg",
      name: "like-a-pro-mascara"},
  { id: 36, image: "https://res.cloudinary.com/dvagrhc2w/image/upload/v1777641133/SC_eomey1.jpg", name: "skin-corrector" },
  // { id: 3, image: "https://i.postimg.cc/66VBWBDJ/JH-ll-jpg.jpg" },
  { id: 92, image: "https://res.cloudinary.com/dvagrhc2w/image/upload/v1778828408/JG-WebFacepowder-0_rhjmvg.jpg", name: "justgold-face-powder" },
];

export function HeroSlider() {
  const sliderRef = useRef<Slider>(null);
  const dragStateRef = useRef({ startX: 0, startY: 0, dragging: false });

  const settings = {
    dots: false,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
    pauseOnHover: true,
    arrows: false,
  };

  return (
    <section className="w-full bg-[#FAF3E0]">
      <div
        className="relative w-full hero-slider mx-auto overflow-hidden"
        style={{
          aspectRatio: "16/9",
          maxWidth: "3200px",
          maxHeight: "1800px",
        }}
      >
        <Slider ref={sliderRef} {...settings} className="h-full">
          {slides.map((slide, index) => (
            <div key={slide.id} className="w-full h-full">
              <Link
                to={`/product/${slide.id}-${slide.name}`}
                className="block w-full h-full"
                aria-label={`View ${slide.name}`}
                onPointerDown={(event) => {
                  dragStateRef.current.startX = event.clientX;
                  dragStateRef.current.startY = event.clientY;
                  dragStateRef.current.dragging = false;
                }}
                onPointerMove={(event) => {
                  const dx = Math.abs(event.clientX - dragStateRef.current.startX);
                  const dy = Math.abs(event.clientY - dragStateRef.current.startY);
                  if (dx + dy > 6) {
                    dragStateRef.current.dragging = true;
                  }
                }}
                onPointerUp={() => {
                  // Keep drag state until click fires.
                }}
                onPointerCancel={() => {
                  dragStateRef.current.dragging = false;
                }}
                onClick={(event) => {
                  if (dragStateRef.current.dragging) {
                    event.preventDefault();
                    event.stopPropagation();
                    dragStateRef.current.dragging = false;
                  }
                }}
              >
                <div
                  className="relative w-full h-full mx-auto overflow-hidden bg-transparent"
                  style={{ aspectRatio: "16/9", maxWidth: "3200px", maxHeight: "1800px" }}
                >
                  <img
                    src={slide.image}
                    alt="Hero Banner"
                    className="w-full h-full object-contain object-center block"
                    style={{ maxWidth: "3200px", maxHeight: "1800px", aspectRatio: "16/9" }}
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.12) 100%)",
                    }}
                  />
                </div>
              </Link>
            </div>
          ))}
        </Slider>
        {/* <button
          onClick={() => sliderRef.current?.slickPrev()}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10
                     w-11 h-11 bg-white/90 hover:bg-white rounded-full
                     hidden md:flex items-center justify-center
                     text-[#D4AF37] shadow-lg hover:scale-110 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => sliderRef.current?.slickNext()}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10
                     w-11 h-11 bg-white/90 hover:bg-white rounded-full
                     hidden md:flex items-center justify-center
                     text-[#D4AF37] shadow-lg hover:scale-110 transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button> */}
      </div>
    </section>
  );
}
