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
  { id: 1, image: "https://i.postimg.cc/66VBWBDJ/JH-ll-jpg.jpg" },
  { id: 2, image: "https://i.postimg.cc/hGsDTfxm/imgi-319-2-1-9d8b855b-0880-4d79-94cc-e948519cb79d-2048x.jpg" },
  { id: 3, image: "https://i.postimg.cc/g0mcxvwG/imgi-73-hydra-lock-banner-1-2048x.jpg" },
  { id: 4, image: "https://i.postimg.cc/yNj1ck99/imgi-323-6-1-2048x.jpg" },
];

export function HeroSlider() {
  const sliderRef = useRef<Slider>(null);

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
    pauseOnHover: true,
    arrows: false,
  };

  return (
    <section className="w-full bg-[#FAF3E0]">
      <div className="relative w-full hero-slider aspect-[16/9] max-h-[820px] overflow-hidden">
        <Slider ref={sliderRef} {...settings} className="h-full">
          {slides.map((slide, index) => (
            <div key={slide.id} className="w-full h-full">
              <div className="relative w-full h-full aspect-[16/9] max-h-[820px] overflow-hidden bg-transparent">
                <img
                  src={slide.image}
                  alt="Hero Banner"
                  className="w-full h-full object-cover object-center block"
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
            </div>
          ))}
        </Slider>

        <button
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
        </button>
      </div>
    </section>
  );
}
