// PainSection.tsx — purely presentational, no props, no state
// Requirements: 2.1, 2.2, 2.3, 2.4, 2.5

const struggles = [
  {
    label: "The blank page stares back. You stare back. Nobody wins.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
        />
      </svg>
    ),
    title: "Blank Page Syndrome",
    delay: "animation-delay-100",
  },
  {
    label: "You rewrite the first sentence seventeen times. It's still not right.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
        />
      </svg>
    ),
    title: "Perfectionism",
    delay: "animation-delay-200",
  },
  {
    label: "What if someone reads this and thinks it's terrible?",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        />
      </svg>
    ),
    title: "Fear of Judgment",
    delay: "animation-delay-300",
  },
  {
    label: "You've planned the piece for weeks. You haven't written a word.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
        />
      </svg>
    ),
    title: "Overthinking",
    delay: "animation-delay-400",
  },
];

export default function PainSection() {
  return (
    <section className="w-full px-4 py-12 md:py-16">
      {/* Section heading */}
      <div className="max-w-5xl mx-auto text-center mb-12 animate-fade-in-up">
        <h2
          className="text-3xl md:text-4xl font-light text-slate-100 mb-4"
          style={{ fontFamily: "var(--font-merriweather), Merriweather, serif" }}
        >
          You know the feeling.
        </h2>
      </div>

      {/* Struggle cards — 1-col mobile, 2-col md+ */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {struggles.map((item) => (
          <div
            key={item.title}
            className={`animate-fade-in-up ${item.delay} flex items-start gap-4 rounded-2xl border border-slate-800/60 bg-slate-900/30 p-5 backdrop-blur-sm`}
          >
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5 text-slate-500">
              {item.icon}
            </div>

            {/* Text */}
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1"
              >
                {item.title}
              </p>
              <p
                className="text-lg text-slate-400 leading-relaxed"
                style={{ fontFamily: "var(--font-merriweather), Merriweather, serif" }}
              >
                {item.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Pivot statement */}
      <div className="max-w-5xl mx-auto mt-12 text-center animate-fade-in-up animation-delay-400">
        <p
          className="text-lg md:text-xl text-amber-300"
          style={{ fontFamily: "var(--font-merriweather), Merriweather, serif" }}
        >
          Writersphere was built for exactly this.
        </p>
      </div>
    </section>
  );
}
