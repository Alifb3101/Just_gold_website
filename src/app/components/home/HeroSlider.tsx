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
  { id: 1, image: "https://i.postimg.cc/yNj1ck90/imgi-320-5-1-2048x.jpg" },
  { id: 2, image: "https://i.postimg.cc/hGsDTfxm/imgi-319-2-1-9d8b855b-0880-4d79-94cc-e948519cb79d-2048x.jpg" },
  { id: 3, image: "https://i.postimg.cc/g0mcxvwG/imgi-73-hydra-lock-banner-1-2048x.jpg" },
  { id: 4, image: "https://i.postimg.cc/yNj1ck99/imgi-323-6-1-2048x.jpg" },
];

export function HeroSlider() {
  const sliderRef = useRef<Slider>(null);

  const settings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    arrows: false,

    customPaging: () => (
      <div className="w-2.5 h-2.5 rounded-full bg-white/60 hover:bg-[#D4AF37] transition-all duration-300" />
    ),
    dotsClass: "slick-dots !bottom-3 md:!bottom-6",
  };

  return (
    <section className="w-full bg-[#FAF3E0]">
      {/* ✅ FULL WIDTH (NO CENTER SMALL BOX) */}
      <div className="w-full">
        <div className="relative w-full">
          <Slider ref={sliderRef} {...settings}>
            {slides.map((slide) => (
              <div key={slide.id} className="w-full">
                {/* ✅ aspect ratio fixes extra height issue */}
                
                <div
                  className="
                    relative w-full overflow-hidden bg-transparent
                    aspect-[16/9] sm:aspect-[16/7] md:aspect-[16/6] lg:aspect-[16/5]
                  "
                >
                  {/* ✅ IMAGE ALWAYS FILLS CONTAINER*/}
                  <img
                    src={slide.image}
                    alt="Hero Banner"
                    className="absolute inset-0 w-full h-full object-fill object-center "
                    loading="lazy"
                  />

                  {/* ✅ Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
                </div>
              </div>
            ))}
          </Slider>

          {/* ✅ Arrows desktop only */}
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
      </div>
    </section>
  );
}
