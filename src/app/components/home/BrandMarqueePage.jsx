import React from "react";

const LOGO_URL =
  "https://i.postimg.cc/PqTfCmLW/Whats-App-Image-2026-02-03-at-12-22-57-PM-Nero-AI-Background-Remover-transparent.png";

export function BrandMarqueePage() {
  const items = Array.from({ length: 18 }, (_, i) => i);

  return (
    <div className="w-full bg-transparent">
      <div className="w-full">

        {/* Marquee Wrapper */}
        <div className="relative w-full overflow-hidden rounded-2xl  bg-gradient-to-r from-background via-muted/40 to-background">

          {/* Soft fade edges */}
          <div className="pointer-events-none absolute left-0 top-0 h-full w-10 sm:w-16 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-10 sm:w-16 bg-gradient-to-l from-background to-transparent z-10" />

          {/* Subtle shine overlay */}
          <div className="absolute inset-0 shine-overlay pointer-events-none" />

          <div className="py-2 sm:py-3">
            <div className="marquee">
              <div className="marquee__group">
                {items.map((i) => (
                  <LogoBlock key={`a-${i}`} logo={LOGO_URL} />
                ))}
              </div>

              <div className="marquee__group" aria-hidden="true">
                {items.map((i) => (
                  <LogoBlock key={`b-${i}`} logo={LOGO_URL} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .marquee {
          display: flex;
          width: 100%;
          overflow: hidden;
          user-select: none;
        }

        .marquee__group {
          display: flex;
          align-items: center;
          gap: 28px;
          padding-left: 28px;
          flex-shrink: 0;
          min-width: 100%;
          animation: scroll 32s linear infinite;
        }

        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }

        /* Shine sweep animation */
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }

        .shine-overlay::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 40%;
          background: linear-gradient(
            120deg,
            transparent 0%,
            rgba(255,255,255,0.15) 50%,
            transparent 100%
          );
          animation: shine 6s ease-in-out infinite;
        }

        /* speed changes for mobile */
        @media (max-width: 640px) {
          .marquee__group {
            animation-duration: 24s;
            gap: 16px;
            padding-left: 16px;
          }
        }

        @media (max-width: 480px) {
          .marquee__group {
            animation-duration: 20s;
            gap: 14px;
            padding-left: 14px;
          }
        }
      `}</style>
    </div>
  );
}

/* Premium Logo Block */
function LogoBlock({ logo }) {
  return (
    <div className="logo-block flex items-center gap-4 opacity-95 transition-all duration-500">
      
      <div className="logo-circle h-11 w-11 sm:h-16 sm:w-16 rounded-full bg-muted/30 border border-border flex items-center justify-center overflow-hidden m-1.5">
        <img
          src={logo}
          alt="Brand"
          className="h-8 w-8 sm:h-13 sm:w-13 object-contain transition-transform duration-500"
          draggable="false"
        />
      </div>

      <div className="leading-none">

      </div>

      <style jsx>{`
        .logo-circle {
          transition: all 0.4s ease;
          backdrop-filter: blur(6px);
        }

        .logo-block:hover .logo-circle {
          box-shadow: 
            0 0 25px rgba(255, 215, 0, 0.35),
            0 8px 20px rgba(0, 0, 0, 0.15);
          transform: scale(1.06);
        }

        .logo-block:hover img {
          transform: scale(1.08);
        }
      `}</style>
    </div>
  );
}

