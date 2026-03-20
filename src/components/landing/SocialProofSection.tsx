const testimonials = [
  {
    quote:
      "I'd been staring at a blank page for months. Writersphere made it feel safe to just start",
    attribution: "Gunjan, A first-time blogger",
  },
  {
    quote:
      "I'm a real overthinker. This app has helped me actually finish a piece for the first time in months.",
    attribution: "Sam, A journaling enthusiast",
  },
];

export default function SocialProofSection() {
  return (
    <section className="w-full px-4 py-12 md:py-16">
      {/* Community signal */}
      <p
        className="text-center text-amber-300 text-base mb-10 animate-fade-in-up"
        style={{ fontFamily: "var(--font-merriweather), Merriweather, serif" }}
      >
        Join hundreds of writers finding their voice.
      </p>

      {/* Testimonial grid: 1-col mobile, 2-col md+ */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 max-w-4xl mx-auto">
        {testimonials.map((t, i) => (
          <div
            key={i}
            className={`card-feature flex flex-col gap-4 animate-fade-in-up animation-delay-${(i + 1) * 100}`}
          >
            {/* Quotation mark accent */}
            <span
              className="text-5xl leading-none text-amber-500/50 select-none"
              aria-hidden="true"
              style={{ fontFamily: "var(--font-merriweather), Merriweather, serif" }}
            >
              &ldquo;
            </span>

            {/* Italic quote in Merriweather */}
            <p
              className="text-slate-200 text-base md:text-lg leading-relaxed -mt-4"
              style={{
                fontFamily: "var(--font-merriweather), Merriweather, serif",
                fontStyle: "italic",
              }}
            >
              {t.quote}
            </p>

            {/* Attribution */}
            <p className="text-slate-400 text-base mt-auto">{t.attribution}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
