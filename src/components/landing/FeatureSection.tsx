export default function FeatureSection() {
  return (
    <div className="w-full px-4 py-12 md:py-16">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

      {/* Card 1: Exploration Over Performance */}
      <div className="card-feature relative animate-fade-in-up animation-delay-200 overflow-hidden">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 300 280"
          preserveAspectRatio="none"
          style={{ transform: "rotate(180deg)" }}
        >
          <defs>
            <clipPath id="soil-clip">
              <path d="M 55 6 C 28 8, 12 22, 7 48 L 5 110 C 4 145, 5 175, 6 215 C 8 245, 20 268, 45 273 L 255 274 C 278 271, 290 255, 294 230 L 296 170 C 297 135, 296 105, 294 65 C 291 35, 275 12, 250 7 Z" />
            </clipPath>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: "rgba(37, 99, 235, 0.12)", stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: "rgba(59, 130, 246, 0.1)", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "rgba(29, 78, 216, 0.08)", stopOpacity: 1 }} />
            </linearGradient>
            <pattern id="leaf-veins-1" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="2" />
              <line x1="50" y1="20" x2="20" y2="35" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1" />
              <line x1="50" y1="40" x2="25" y2="50" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1" />
              <line x1="50" y1="60" x2="20" y2="70" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1" />
              <line x1="50" y1="80" x2="25" y2="88" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1" />
              <line x1="50" y1="20" x2="80" y2="35" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1" />
              <line x1="50" y1="40" x2="75" y2="50" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1" />
              <line x1="50" y1="60" x2="80" y2="70" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1" />
              <line x1="50" y1="80" x2="75" y2="88" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1" />
            </pattern>
          </defs>
          <g clipPath="url(#soil-clip)">
            <path d="M 55 6 C 28 8, 12 22, 7 48 L 5 110 C 4 145, 5 175, 6 215 C 8 245, 20 268, 45 273 L 255 274 C 278 271, 290 255, 294 230 L 296 170 C 297 135, 296 105, 294 65 C 291 35, 275 12, 250 7 Z" fill="url(#grad1)" />
            <path d="M 55 6 C 28 8, 12 22, 7 48 L 5 110 C 4 145, 5 175, 6 215 C 8 245, 20 268, 45 273 L 255 274 C 278 271, 290 255, 294 230 L 296 170 C 297 135, 296 105, 294 65 C 291 35, 275 12, 250 7 Z" fill="url(#leaf-veins-1)" opacity="0.6" />
          </g>
          <path d="M 55 6 C 28 8, 12 22, 7 48 L 5 110 C 4 145, 5 175, 6 215 C 8 245, 20 268, 45 273 L 255 274 C 278 271, 290 255, 294 230 L 296 170 C 297 135, 296 105, 294 65 C 291 35, 275 12, 250 7 Z" fill="none" stroke="rgba(15, 40, 100, 0.85)" strokeWidth="1.5" />
        </svg>
        <div className="relative p-8 md:p-10">
          <div className="flex items-center justify-center mb-6">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-blue-700/30 to-blue-900/30 border border-blue-800/40 flex items-center justify-center backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 md:w-8 md:h-8 text-blue-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
          </div>
          <div className="font-bold text-lg md:text-xl mb-3 text-center" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.6)", color: "#B8D4F0", fontFamily: "var(--font-merriweather), Merriweather, serif", fontWeight: 700 }}>
            Exploration Over Performance
          </div>
          <div className="mt-3 text-center text-slate-100 text-sm leading-relaxed" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
            Write to discover, not to impress. Your thoughts deserve space to breathe.
          </div>
        </div>
      </div>

      {/* Card 2: Structure for Overthinkers */}
      <div className="card-feature relative animate-fade-in-up animation-delay-300 overflow-hidden">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 300 280"
          preserveAspectRatio="none"
        >
          <defs>
            <clipPath id="leaf-clip">
              <path d="M 42 5 C 22 7, 9 20, 5 42 L 4 125 C 3 155, 4 185, 6 225 C 9 252, 22 272, 48 276 L 252 277 C 280 274, 293 258, 296 235 L 297 155 C 298 125, 297 95, 295 55 C 292 28, 278 8, 255 5 Z" />
            </clipPath>
            <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: "rgba(37, 99, 235, 0.12)", stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: "rgba(59, 130, 246, 0.1)", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "rgba(29, 78, 216, 0.08)", stopOpacity: 1 }} />
            </linearGradient>
            <pattern id="leaf-veins" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse" patternTransform="rotate(45 150 140)">
              <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="2" />
              <line x1="50" y1="20" x2="20" y2="35" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1" />
              <line x1="50" y1="40" x2="25" y2="50" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1" />
              <line x1="50" y1="60" x2="20" y2="70" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1" />
              <line x1="50" y1="80" x2="25" y2="88" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1" />
              <line x1="50" y1="20" x2="80" y2="35" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1" />
              <line x1="50" y1="40" x2="75" y2="50" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1" />
              <line x1="50" y1="60" x2="80" y2="70" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1" />
              <line x1="50" y1="80" x2="75" y2="88" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1" />
            </pattern>
          </defs>
          <g clipPath="url(#leaf-clip)">
            <path d="M 42 5 C 22 7, 9 20, 5 42 L 4 125 C 3 155, 4 185, 6 225 C 9 252, 22 272, 48 276 L 252 277 C 280 274, 293 258, 296 235 L 297 155 C 298 125, 297 95, 295 55 C 292 28, 278 8, 255 5 Z" fill="url(#grad2)" />
            <path d="M 42 5 C 22 7, 9 20, 5 42 L 4 125 C 3 155, 4 185, 6 225 C 9 252, 22 272, 48 276 L 252 277 C 280 274, 293 258, 296 235 L 297 155 C 298 125, 297 95, 295 55 C 292 28, 278 8, 255 5 Z" fill="url(#leaf-veins)" opacity="0.6" />
          </g>
          <path d="M 42 5 C 22 7, 9 20, 5 42 L 4 125 C 3 155, 4 185, 6 225 C 9 252, 22 272, 48 276 L 252 277 C 280 274, 293 258, 296 235 L 297 155 C 298 125, 297 95, 295 55 C 292 28, 278 8, 255 5 Z" fill="none" stroke="rgba(15, 40, 100, 0.85)" strokeWidth="1.5" />
        </svg>
        <div className="relative p-8 md:p-10">
          <div className="flex items-center justify-center mb-6">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-blue-700/30 to-blue-900/30 border border-blue-700/40 flex items-center justify-center backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 md:w-8 md:h-8 text-blue-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
              </svg>
            </div>
          </div>
          <div className="font-bold text-lg md:text-xl mb-3 text-center" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.6)", color: "#B8D4F0", fontFamily: "var(--font-merriweather), Merriweather, serif", fontWeight: 700 }}>
            Structure for Overthinkers
          </div>
          <div className="mt-3 text-center text-slate-100 text-sm leading-relaxed" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
            Organize your thoughts with categories, tags, and a system that works with your mind.
          </div>
        </div>
      </div>

      {/* Card 3: Reflection Through Writing */}
      <div className="card-feature relative animate-fade-in-up animation-delay-400 overflow-hidden">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 300 280"
          preserveAspectRatio="none"
        >
          <defs>
            <clipPath id="paper-clip">
              <path d="M 50 4 C 25 6, 10 18, 6 40 L 4 120 C 3 150, 4 180, 5 220 C 7 250, 18 270, 40 274 L 260 276 C 285 274, 294 262, 296 240 L 297 160 C 298 130, 297 100, 296 60 C 294 30, 282 10, 260 6 Z" />
            </clipPath>
            <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: "rgba(37, 99, 235, 0.12)", stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: "rgba(59, 130, 246, 0.1)", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "rgba(29, 78, 216, 0.08)", stopOpacity: 1 }} />
            </linearGradient>
            <pattern id="leaf-veins-3" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse" patternTransform="rotate(90 50 50)">
              <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="2" />
              <line x1="50" y1="20" x2="20" y2="35" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1" />
              <line x1="50" y1="40" x2="25" y2="50" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1" />
              <line x1="50" y1="60" x2="20" y2="70" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1" />
              <line x1="50" y1="80" x2="25" y2="88" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1" />
              <line x1="50" y1="20" x2="80" y2="35" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1" />
              <line x1="50" y1="40" x2="75" y2="50" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1" />
              <line x1="50" y1="60" x2="80" y2="70" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1" />
              <line x1="50" y1="80" x2="75" y2="88" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1" />
            </pattern>
          </defs>
          <g clipPath="url(#paper-clip)">
            <path d="M 50 4 C 25 6, 10 18, 6 40 L 4 120 C 3 150, 4 180, 5 220 C 7 250, 18 270, 40 274 L 260 276 C 285 274, 294 262, 296 240 L 297 160 C 298 130, 297 100, 296 60 C 294 30, 282 10, 260 6 Z" fill="url(#grad3)" />
            <path d="M 50 4 C 25 6, 10 18, 6 40 L 4 120 C 3 150, 4 180, 5 220 C 7 250, 18 270, 40 274 L 260 276 C 285 274, 294 262, 296 240 L 297 160 C 298 130, 297 100, 296 60 C 294 30, 282 10, 260 6 Z" fill="url(#leaf-veins-3)" opacity="0.6" />
          </g>
          <path d="M 50 4 C 25 6, 10 18, 6 40 L 4 120 C 3 150, 4 180, 5 220 C 7 250, 18 270, 40 274 L 260 276 C 285 274, 294 262, 296 240 L 297 160 C 298 130, 297 100, 296 60 C 294 30, 282 10, 260 6 Z" fill="none" stroke="rgba(15, 40, 100, 0.85)" strokeWidth="1.5" />
        </svg>
        <div className="relative p-8 md:p-10">
          <div className="flex items-center justify-center mb-6">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-blue-600/30 to-blue-800/30 border border-blue-700/40 flex items-center justify-center backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 md:w-8 md:h-8 text-blue-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
            </div>
          </div>
          <div className="font-bold text-lg md:text-xl mb-3 text-center" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.6)", color: "#B8D4F0", fontFamily: "var(--font-merriweather), Merriweather, serif", fontWeight: 700 }}>
            Reflection Through Writing
          </div>
          <div className="mt-3 text-center text-slate-100 text-sm leading-relaxed" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
            Track your progress, understand your patterns, and grow as a writer with built-in analytics.
          </div>
        </div>
      </div>

      </div>
    </div>
  );
}
