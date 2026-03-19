"use client";

import Link from "next/link";

export interface HeroSectionProps {
  onGetStarted: () => void;
}

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <div className="w-full relative px-6 md:px-16 py-24 md:py-36 animate-fade-in flex flex-col items-center text-center overflow-hidden">

      {/* SVG background decoration */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/editorial_typography_hero_bg.svg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none opacity-30"
      />

      <h1
        className="relative z-10 text-5xl md:text-7xl lg:text-8xl font-light leading-tight mb-6"
        style={{
          fontFamily: "var(--font-merriweather), Merriweather, serif",
          color: "#D4C5B0",
          letterSpacing: "-0.03em",
          maxWidth: "14ch",
        }}
      >
        A sanctuary for writers.
      </h1>

      <p
        className="relative z-10 text-slate-400 text-xl md:text-2xl mb-3 leading-relaxed"
        style={{ fontFamily: "var(--font-merriweather), Merriweather, serif", maxWidth: "42ch" }}
      >
        <em>For those who think too much, and write too little.</em>
      </p>

      <p className="relative z-10 text-slate-500 text-base md:text-lg mb-12" style={{ maxWidth: "38ch" }}>
        The blank page doesn&apos;t have to win.
      </p>

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
        <Link href="/feed" className="text-base text-slate-400 hover:text-slate-200 transition-colors">
          Explore writing →
        </Link>
      </div>
    </div>
  );
}
