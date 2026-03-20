"use client";

export interface HeroSectionProps {
  onGetStarted: () => void;
}

const DESKTOP_SVG = "https://cdn.openworldregister.com/hero_16x9_2.svg";
const MOBILE_SVG = "https://cdn.openworldregister.com/hero_mobile_2.svg";

// Each spark: [left%, top%, delay(s), duration(s), size(px), color, dx(px), dy(px)]
const SPARKS: [number, number, number, number, number, string, number, number][] = [
  [12, 70, 0,    5.2, 2, "rgba(167,139,250,0.9)",   35,  -110],
  [22, 55, 1.1, 6.4, 3, "rgba(196,181,253,0.8)",  -50,   -80],
  [35, 80, 0.4, 5.8, 2, "rgba(255,255,255,0.7)",   80,   -65],
  [48, 65, 2.0, 7.0, 2, "rgba(167,139,250,0.85)", -80,   -95],
  [58, 75, 0.7, 4.8, 3, "rgba(216,180,254,0.8)",   65,    50],
  [70, 60, 1.5, 6.1, 2, "rgba(255,255,255,0.6)",  -35,    80],
  [80, 72, 0.2, 6.7, 2, "rgba(196,181,253,0.9)",   95,   -50],
  [90, 50, 1.8, 5.5, 3, "rgba(167,139,250,0.7)",  -65,  -125],
  [28, 40, 2.5, 7.4, 2, "rgba(255,255,255,0.5)",   50,    95],
  [62, 35, 0.9, 5.1, 2, "rgba(216,180,254,0.75)", -95,    65],
  [75, 45, 1.3, 6.4, 3, "rgba(167,139,250,0.8)",   15,  -140],
  [42, 30, 3.0, 5.8, 2, "rgba(255,255,255,0.65)", -110,  -35],
  [18, 85, 1.6, 6.7, 2, "rgba(196,181,253,0.7)",  125,    15],
  [55, 88, 0.3, 6.1, 3, "rgba(167,139,250,0.6)",  -15,  -120],
  [88, 82, 2.2, 4.8, 2, "rgba(255,255,255,0.8)",  -80,    80],
];

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <div className="w-full relative px-6 md:px-16 py-24 md:py-36 animate-fade-in flex flex-col items-center text-center" style={{ isolation: "isolate" }}>

      {/* Responsive SVG background */}
      <picture className="absolute inset-0 w-full pointer-events-none select-none">
        <source media="(min-width: 768px)" srcSet={DESKTOP_SVG} />
        <source media="(max-width: 767px)" srcSet={MOBILE_SVG} />
        { }
        <img src={DESKTOP_SVG} alt="" className="w-full opacity-50" />
      </picture>

      {/* Multi-layer halo — desktop only for performance */}
      {/* Layer 1 — deep indigo, upper-left of center */}
      <div className="absolute z-0 pointer-events-none hidden md:block" style={{ width: "900px", height: "500px", top: "40%", left: "35%", transform: "translate(-50%, -50%)", background: "radial-gradient(ellipse at center, rgba(49,38,156,0.35) 0%, transparent 65%)", filter: "blur(50px)", animation: "halo-float-1 9s ease-in-out infinite" }} />
      {/* Layer 2 — dark violet, lower-right of center */}
      <div className="absolute z-0 pointer-events-none hidden md:block" style={{ width: "700px", height: "700px", top: "60%", left: "65%", transform: "translate(-50%, -50%)", background: "radial-gradient(ellipse at center, rgba(76,29,149,0.3) 0%, transparent 60%)", filter: "blur(55px)", animation: "halo-float-2 13s ease-in-out infinite" }} />
      {/* Layer 3 — dark blue, upper-right of center */}
      <div className="absolute z-0 pointer-events-none hidden md:block" style={{ width: "600px", height: "500px", top: "35%", left: "68%", transform: "translate(-50%, -50%)", background: "radial-gradient(ellipse at center, rgba(23,37,84,0.35) 0%, transparent 65%)", filter: "blur(40px)", animation: "halo-float-3 7s ease-in-out infinite" }} />

      {/* Per-spark keyframes injected inline — desktop only */}
      <style>{SPARKS.map(([,,,,, , dx, dy], i) =>
        `@keyframes spark-${i} {
          0%   { opacity: 0;   transform: translate(0, 0) scale(1); }
          10%  { opacity: 1; }
          100% { opacity: 0;   transform: translate(${dx}px, ${dy}px) scale(0.5); }
        }`
      ).join('\n')}</style>

      {/* Sparks — desktop only for performance */}
      {SPARKS.map(([left, top, delay, duration, size, color], i) => (
        <div
          key={i}
          className="absolute pointer-events-none z-[1] hidden md:block"
          style={{
            left: `${left}%`,
            top: `${top}%`,
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: "50%",
            background: color,
            boxShadow: `0 0 ${size * 3}px ${size}px ${color}`,
            animation: `spark-${i} ${duration}s ease-out ${delay}s infinite`,
          }}
        />
      ))}

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

      <div className="relative z-10">
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
