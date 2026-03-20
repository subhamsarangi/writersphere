"use client";

export interface HeroSectionProps {
  onGetStarted: () => void;
}

const DESKTOP_SVG = "https://cdn.openworldregister.com/editorial_typography_hero_16x9_2.svg";
const MOBILE_SVG = "https://cdn.openworldregister.com/editorial_typography_hero_mobile_2.svg";

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <div className="w-full relative px-6 md:px-16 py-24 md:py-36 animate-fade-in flex flex-col items-center text-center" style={{ isolation: "isolate" }}>

      {/* Responsive SVG background */}
      <picture className="absolute inset-0 w-full pointer-events-none select-none">
        <source media="(min-width: 768px)" srcSet={DESKTOP_SVG} />
        <source media="(max-width: 767px)" srcSet={MOBILE_SVG} />
        { }
        <img
          src={DESKTOP_SVG}
          alt=""
          className="w-full opacity-50"
        />
      </picture>

      <h1
        className="relative z-10 text-5xl md:text-7xl lg:text-8xl font-light leading-tight mb-6"
        style={{
          fontFamily: "var(--font-merriweather), Merriweather, serif",
          letterSpacing: "-0.03em",
          maxWidth: "14ch",
          background: "linear-gradient(135deg, #ffffff 0%, #f5ead0 25%, #eedfa8 55%, #f8f0d8 80%, #ffffff 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        A sanctuary for writers.
      </h1>

      <p
        className="relative z-10 text-slate-300 text-xl md:text-2xl mb-3 leading-relaxed"
        style={{ fontFamily: "var(--font-merriweather), Merriweather, serif", maxWidth: "42ch", textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}
      >
        <em>For those who think too much, and write too little.</em>
      </p>

      <div className="mb-12" />

      <div className="relative z-10 flex flex-row gap-6 items-center">
        <button
          type="button"
          onClick={onGetStarted}
          className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-base font-medium transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)", color: "#fff" }}
        >
          Start writing free
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
