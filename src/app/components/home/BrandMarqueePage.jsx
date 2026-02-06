import React from "react";

const LOGO_URL =
  "https://i.postimg.cc/PqTfCmLW/Whats-App-Image-2026-02-03-at-12-22-57-PM-Nero-AI-Background-Remover-transparent.png"; 

export function BrandMarqueePage() {
  const items = Array.from({ length: 18 }, (_, i) => i);

  return (
    <div className="w-full bg-transparent py-3 sm:py-4">
      <div className="w-full">

        {/* Marquee Wrapper */}
        <div className="relative w-full overflow-hidden rounded-2xl border border-border bg-gradient-to-r from-background via-muted/40 to-background">
          {/* Soft fade edges */}
          <div className="pointer-events-none absolute left-0 top-0 h-full w-10 sm:w-16 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-10 sm:w-16 bg-gradient-to-l from-background to-transparent z-10" />

          {/* Marquee Track */}
          <div className="py-2 sm:py-3">
            <div className="marquee">
              <div className="marquee__group">
                {items.map((i) => (
                  <LogoBlock key={`a-${i}`} logo={LOGO_URL} />
                ))}
              </div>

              {/* duplicate group for seamless loop */}
              <div className="marquee__group" aria-hidden="true">
                {items.map((i) => (
                  <LogoBlock key={`b-${i}`} logo={LOGO_URL} />
                ))}
              </div>
            </div>
          </div>
        </div>

 
      </div>

      {/* ✅ Styles inside the page */}
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

        /* hover pause (desktop) */
        @media (hover: hover) {
          .marquee:hover .marquee__group {
            animation-play-state: paused;
          }
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

/* ✅ Logo + text block*/
function LogoBlock({ logo }) {
  return (
    <div className="flex items-center gap-3 opacity-95">
      <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-muted/30 border border-border flex items-center justify-center overflow-hidden">
        <img
          src={logo}
          alt="Brand"
          className="h-6 w-6 sm:h-7 sm:w-7 object-contain"
          draggable="false"
        />
      </div>

      <div className="leading-none">
        <div className="text-foreground font-semibold tracking-wide text-sm sm:text-base">
         Just Gold
        </div>
        <div className="text-muted-foreground text-[10px] sm:text-xs tracking-[0.2em] uppercase">
          Premium Collection
        </div>
      </div>
    </div>
  );
}
