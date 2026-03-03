"use client";

import { useEffect, useState } from "react";

type BreathingExerciseProps = {
  onComplete: () => void;
};

export default function BreathingExercise({ onComplete }: BreathingExerciseProps) {
  const [duration, setDuration] = useState<30 | 60 | null>(null);
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (duration === null) return;

    const cycleTime = 12; // 4s inhale + 4s hold + 4s exhale
    let elapsed = 0;

    const interval = setInterval(() => {
      elapsed++;
      
      const cycleProgress = elapsed % cycleTime;
      
      // Determine phase based on position in cycle
      if (cycleProgress < 4) {
        setPhase("inhale");
      } else if (cycleProgress < 8) {
        setPhase("hold");
      } else {
        setPhase("exhale");
      }
      
      setTimeLeft(duration - elapsed);
      
      // Complete when time is up
      if (elapsed >= duration) {
        clearInterval(interval);
        onComplete();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  if (duration === null) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-sm">
        <div className="max-w-md w-full mx-4 p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-blue-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold text-slate-50 mb-2">
                Take a Breath
              </h2>
              <p className="text-sm text-slate-400">
                Before you begin writing, let&apos;s take a moment to center yourself with a breathing exercise.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setDuration(30)}
                className="w-full px-6 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                30 seconds
              </button>
              <button
                onClick={() => setDuration(60)}
                className="w-full px-6 py-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-100 font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                60 seconds
              </button>
            </div>

            <p className="text-xs text-slate-500">
              This helps improve focus and creativity
            </p>
          </div>
        </div>
      </div>
    );
  }

  const phaseText = {
    inhale: "Breathe In",
    hold: "Hold",
    exhale: "Breathe Out",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-sm">
      <div className="text-center space-y-12 px-4">
        {/* Breathing circle - simplified and elegant */}
        <div className="relative w-48 h-48 mx-auto">
          {/* Outer glow ring */}
          <div
            className={`absolute inset-0 rounded-full border-2 transition-all duration-[4000ms] ease-in-out ${
              phase === "inhale"
                ? "border-blue-400/40 scale-110"
                : phase === "hold"
                ? "border-purple-400/40 scale-110"
                : "border-emerald-400/40 scale-90"
            }`}
          />
          
          {/* Main circle */}
          <div
            className={`absolute inset-4 rounded-full transition-all duration-[4000ms] ease-in-out ${
              phase === "inhale"
                ? "bg-blue-500/20 scale-100"
                : phase === "hold"
                ? "bg-purple-500/20 scale-100"
                : "bg-emerald-500/20 scale-75"
            }`}
          />
          
          {/* Inner circle */}
          <div
            className={`absolute inset-12 rounded-full transition-all duration-[4000ms] ease-in-out ${
              phase === "inhale"
                ? "bg-blue-400/30"
                : phase === "hold"
                ? "bg-purple-400/30"
                : "bg-emerald-400/30"
            }`}
          />
          
          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={`w-3 h-3 rounded-full transition-all duration-[4000ms] ease-in-out ${
                phase === "inhale"
                  ? "bg-blue-300"
                  : phase === "hold"
                  ? "bg-purple-300"
                  : "bg-emerald-300"
              }`}
            />
          </div>
        </div>

        {/* Phase text */}
        <div className="space-y-4">
          <h2
            className={`text-3xl font-light tracking-wide transition-colors duration-1000 ${
              phase === "inhale"
                ? "text-blue-300"
                : phase === "hold"
                ? "text-purple-300"
                : "text-emerald-300"
            }`}
          >
            {phaseText[phase]}
          </h2>

          <p className="text-slate-400 text-base font-light max-w-md mx-auto">
            {phase === "inhale" && "Breathe in slowly through your nose"}
            {phase === "hold" && "Hold your breath gently"}
            {phase === "exhale" && "Breathe out slowly through your mouth"}
          </p>
        </div>

        {/* Time remaining */}
        <div className="space-y-3">
          <p className="text-slate-500 text-sm font-light">
            {timeLeft} {timeLeft === 1 ? "second" : "seconds"} remaining
          </p>

          {/* Progress bar */}
          <div className="w-80 mx-auto">
            <div className="h-1 bg-slate-800/50 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ease-linear ${
                  phase === "inhale"
                    ? "bg-blue-400/60"
                    : phase === "hold"
                    ? "bg-purple-400/60"
                    : "bg-emerald-400/60"
                }`}
                style={{ 
                  width: duration ? `${((duration - timeLeft) / duration) * 100}%` : '0%' 
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
