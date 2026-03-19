import Link from "next/link";

export interface FinalCTASectionProps {
  onGetStarted: () => void;
}

export default function FinalCTASection({ onGetStarted }: FinalCTASectionProps) {
  return (
    <section className="w-full px-4 py-16 md:py-24">
      <div className="text-center animate-fade-in-up">
        <p className="text-xs uppercase tracking-widest text-slate-500 mb-6">
          Ready when you are
        </p>

        <h2
          className="text-4xl md:text-5xl font-light mb-4"
          style={{
            fontFamily: "var(--font-merriweather), Merriweather, serif",
            color: "#c8bfb0",
            letterSpacing: "-0.01em",
          }}
        >
          Your first word is waiting.
        </h2>

        <p className="text-slate-500 text-base md:text-lg mb-10 max-w-sm mx-auto">
          No pressure. No judgment. Just you and the page.
        </p>

        <div className="flex flex-row gap-4 justify-center items-center flex-wrap">
          <button
            type="button"
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all"
            style={{
              background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
              color: "#fff",
            }}
          >
            Start writing free
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </button>

          <Link
            href="/feed"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            Explore first →
          </Link>
        </div>
      </div>
    </section>
  );
}
