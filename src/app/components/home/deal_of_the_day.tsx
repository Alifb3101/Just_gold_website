import React, { useEffect, useState } from "react";

const DEAL_PRODUCT = {
  id: 1,
  name: "CHUBBY OIL LIPSPLASH",
  description:
    "Get all the shine of a lip gloss and none of the stickiness while experiencing FAT 12-hour hydration from the lip-lovin’ oil formula",
  price: 89,
  oldPrice: 149,
  stock: 12,
  totalStock: 40,
  image:
    "https://res.cloudinary.com/dvagrhc2w/image/upload/just_gold/products/variants/yartbzffq2rwztcp4adr.jpg",
  endTime: new Date().getTime() + 1000 * 60 * 60 * 12, // 12 hours from now
};

export default function DealOfTheDayPremium() {
  const [timeLeft, setTimeLeft] = useState<{
    [key: string]: number | undefined;
    hours?: number;
    minutes?: number;
    seconds?: number;
  }>({});
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = DEAL_PRODUCT.endTime - now;

      if (distance < 0) return;

      setTimeLeft({
        hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((distance / 1000 / 60) % 60),
        seconds: Math.floor((distance / 1000) % 60),
      });
    }, 1000);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.3 }
    );

    const dealSection = document.getElementById("deal-section");
    if (dealSection) {
      observer.observe(dealSection);
    }

    return () => clearInterval(timer);
  }, []);

  const stockPercent =
    (DEAL_PRODUCT.stock / DEAL_PRODUCT.totalStock) * 100;

  return (
    <section
      id="deal-section"
      className="relative bg-white py-24 px-6 lg:px-16 overflow-hidden"
    >
      {/* Luxury background glow */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-yellow-400/10 blur-[160px] rounded-full"></div>
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-yellow-600/10 blur-[160px] rounded-full"></div>

      <div
        className={`max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center transition-all duration-1000 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        {/* PRODUCT IMAGE */}
        <div className="relative flex justify-center group">
          {/* Animated glow */}
          <div className="absolute inset-0 bg-yellow-500/10 blur-3xl rounded-3xl animate-pulse"></div>

          <img
            src={DEAL_PRODUCT.image}
            alt={DEAL_PRODUCT.name}
            className="relative w-full max-w-md object-cover rounded-3xl shadow-[0_40px_100px_rgba(0,0,0,0.15)] transition-transform duration-700 group-hover:scale-105 animate-float"
          />
        </div>

        {/* CONTENT */}
        <div className="space-y-8">
          <div>
            <p className="text-xs tracking-[0.5em] text-yellow-600 uppercase font-semibold">
              Exclusive Offer
            </p>

            {/* Shimmer Heading */}
            <h2 className="mt-4 text-4xl lg:text-5xl font-bold leading-tight bg-gradient-to-r from-black via-yellow-600 to-black bg-[length:200%] bg-clip-text text-transparent animate-shimmer">
              Deal of the Day
            </h2>

            <h3 className="mt-4 text-2xl lg:text-3xl font-semibold text-black">
              {DEAL_PRODUCT.name}
            </h3>

            <p className="mt-6 text-gray-600 text-lg leading-relaxed max-w-xl">
              {DEAL_PRODUCT.description}
            </p>
          </div>

          {/* PRICE */}
          <div className="flex items-end gap-6">
            <span className="text-4xl font-bold text-black">
              AED {DEAL_PRODUCT.price}
            </span>
            <span className="text-xl line-through text-gray-400">
              AED {DEAL_PRODUCT.oldPrice}
            </span>
          </div>

          {/* COUNTDOWN */}
          <div className="flex gap-4 flex-wrap">
            {["hours", "minutes", "seconds"].map((unit) => (
              <div
                key={unit}
                className="bg-white border border-yellow-500/30 px-6 py-4 rounded-xl text-center shadow-sm min-w-[90px]"
              >
                <div className="text-2xl font-bold text-black">
                  {timeLeft[unit] || "00"}
                </div>
                <div className="text-xs uppercase tracking-widest text-gray-500 mt-1">
                  {unit}
                </div>
              </div>
            ))}
          </div>

          {/* STOCK PROGRESS */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Only {DEAL_PRODUCT.stock} left</span>
              <span>{DEAL_PRODUCT.totalStock} total</span>
            </div>

            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-500 transition-all duration-700"
                style={{ width: `${stockPercent}%` }}
              ></div>
            </div>
          </div>

          {/* BUTTON */}
          <button className="relative inline-flex items-center justify-center px-12 py-4 rounded-full bg-black text-white font-semibold tracking-widest overflow-hidden group transition-all duration-500">
            <span className="absolute inset-0 w-0 bg-yellow-500 transition-all duration-500 group-hover:w-full"></span>
            <span className="relative z-10 group-hover:text-black transition duration-500">
              SHOP NOW
            </span>
          </button>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        .animate-shimmer {
          animation: shimmer 4s linear infinite;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }
      `}</style>
    </section>
  );
}
