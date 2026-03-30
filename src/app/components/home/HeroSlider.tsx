import React, { useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Slide {
  id: number;
  image: string;
}

const slides: Slide[] = [
    { id: 1, image: "https://i.postimg.cc/KY6GxR4x/JG_JLP_Banner_jpg.jpg" },
  { id: 2, image: "https://i.postimg.cc/25skrV3C/JG-iconicblush-jpg.jpg" },
  // { id: 3, image: "https://i.postimg.cc/66VBWBDJ/JH-ll-jpg.jpg" },
  { id: 3, image: "https://i.postimg.cc/FKMrN715/JG_SKINFIT_jpg.jpg"},
];

const HERO_ASPECT_RATIO = "3200/1300";
const HERO_MAX_WIDTH = "3200px";
const HERO_MAX_HEIGHT = "1300px";

export function HeroSlider() {
  const sliderRef = useRef<Slider>(null);

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
        className="relative w-full hero-slider mx-auto overflow-hidden min-h-[170px] sm:min-h-[220px] md:min-h-[300px] lg:min-h-0"
        style={{
          aspectRatio: HERO_ASPECT_RATIO,
          maxWidth: HERO_MAX_WIDTH,
          maxHeight: HERO_MAX_HEIGHT,
        }}
      >
        <Slider ref={sliderRef} {...settings} className="h-full">
          {slides.map((slide, index) => (
            <div key={slide.id} className="w-full h-full">
              <div
                className="relative w-full h-full mx-auto overflow-hidden bg-transparent"
                style={{
                  aspectRatio: HERO_ASPECT_RATIO,
                  maxWidth: HERO_MAX_WIDTH,
                  maxHeight: HERO_MAX_HEIGHT,
                }}
              >
                <img
                  src={slide.image}
                  alt="Hero Banner"
                  className="w-full h-full object-cover object-center block"
                  style={{
                    maxWidth: HERO_MAX_WIDTH,
                    maxHeight: HERO_MAX_HEIGHT,
                    aspectRatio: HERO_ASPECT_RATIO,
                  }}
                  loading={index === 0 ? "eager" : "lazy"}
                  sizes="100vw"
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.12) 100%)",
                  }}
                />
              </div>
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
