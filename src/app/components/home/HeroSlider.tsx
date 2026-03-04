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
    { id: 1, image: "https://i.postimg.cc/RCb9mmNc/JG-Mascara-Web-Banner-jpg.jpg" },
  { id: 2, image: "https://i.postimg.cc/sf0yzzvY/JG_Unique_Single_Blush_Web_Poster_jpg.jpg" },
  { id: 3, image: "https://i.postimg.cc/66VBWBDJ/JH-ll-jpg.jpg" },
  { id: 4, image: "https://i.postimg.cc/13TJ6KWH/JG-Skin-Fit-Web-banner-jpg.jpg" },
];

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
