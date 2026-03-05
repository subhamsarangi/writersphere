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
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-purple-950 animate-gradient-shift" />
        
        {/* Glass morphism overlay */}
        <div className="absolute inset-0 backdrop-blur-3xl bg-slate-950/40" />
        
        {/* Content */}
        <div className="relative max-w-md w-full mx-4 p-8 rounded-2xl bg-slate-900/30 backdrop-blur-xl border border-slate-700/50 shadow-2xl">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-blue-500/20 flex items-center justify-center backdrop-blur-sm border border-blue-400/30">
              <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold text-slate-50 mb-2">
                Take a Breath
              </h2>
              <p className="text-sm text-slate-300">
                Before you begin writing, let&apos;s take a moment to center yourself with a breathing exercise.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setDuration(30)}
                className="w-full px-6 py-4 rounded-xl bg-blue-600/80 hover:bg-blue-600 backdrop-blur-sm text-white font-medium transition-all hover:scale-[1.02] active:scale-[0.98] border border-blue-400/30"
              >
                30 seconds
              </button>
              <button
                onClick={() => setDuration(60)}
                className="w-full px-6 py-4 rounded-xl bg-slate-700/80 hover:bg-slate-700 backdrop-blur-sm text-slate-100 font-medium transition-all hover:scale-[1.02] active:scale-[0.98] border border-slate-600/30"
              >
                60 seconds
              </button>
            </div>

            <p className="text-xs text-slate-400">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      {/* Animated gradient background with phase colors */}
      <div 
        className={`absolute inset-0 transition-all duration-[4000ms] ease-in-out ${
          phase === "inhale"
            ? "bg-gradient-to-br from-slate-900 via-blue-950 to-cyan-950"
            : phase === "hold"
            ? "bg-gradient-to-br from-slate-900 via-purple-950 to-pink-950"
            : "bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950"
        }`}
      />
      
      {/* Floating orbs for depth */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 transition-all duration-[4000ms] ${
            phase === "inhale"
              ? "bg-blue-500"
              : phase === "hold"
              ? "bg-purple-500"
              : "bg-emerald-500"
          }`}
        />
        <div 
          className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 transition-all duration-[4000ms] ${
            phase === "inhale"
              ? "bg-cyan-500"
              : phase === "hold"
              ? "bg-pink-500"
              : "bg-teal-500"
          }`}
        />
      </div>
      
      {/* Glass morphism overlay */}
      <div className="absolute inset-0 backdrop-blur-3xl bg-slate-950/30" />
      
      {/* Content */}
      <div className="relative text-center space-y-12 px-4">
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
            className={`absolute inset-4 rounded-full backdrop-blur-sm transition-all duration-[4000ms] ease-in-out ${
              phase === "inhale"
                ? "bg-blue-500/20 scale-100 border border-blue-400/30"
                : phase === "hold"
                ? "bg-purple-500/20 scale-100 border border-purple-400/30"
                : "bg-emerald-500/20 scale-75 border border-emerald-400/30"
            }`}
          />
          
          {/* Inner circle */}
          <div
            className={`absolute inset-12 rounded-full backdrop-blur-md transition-all duration-[4000ms] ease-in-out ${
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
                  ? "bg-blue-300 shadow-lg shadow-blue-500/50"
                  : phase === "hold"
                  ? "bg-purple-300 shadow-lg shadow-purple-500/50"
                  : "bg-emerald-300 shadow-lg shadow-emerald-500/50"
              }`}
            />
          </div>
        </div>

        {/* Phase text */}
        <div className="space-y-4">
          <h2
            className={`text-3xl font-light tracking-wide transition-colors duration-1000 drop-shadow-lg ${
              phase === "inhale"
                ? "text-blue-200"
                : phase === "hold"
                ? "text-purple-200"
                : "text-emerald-200"
            }`}
          >
            {phaseText[phase]}
          </h2>

          <p className="text-slate-200 text-base font-light max-w-md mx-auto drop-shadow">
            {phase === "inhale" && "Breathe in slowly through your nose"}
            {phase === "hold" && "Hold your breath gently"}
            {phase === "exhale" && "Breathe out slowly through your mouth"}
          </p>
        </div>

        {/* Time remaining */}
        <div className="space-y-3">
          <p className="text-slate-300 text-sm font-light drop-shadow">
            {timeLeft} {timeLeft === 1 ? "second" : "seconds"} remaining
          </p>

          {/* Progress bar */}
          <div className="w-80 mx-auto">
            <div className="h-1 bg-slate-800/30 backdrop-blur-sm rounded-full overflow-hidden border border-slate-700/30">
              <div
                className={`h-full transition-all duration-1000 ease-linear ${
                  phase === "inhale"
                    ? "bg-blue-400/80 shadow-lg shadow-blue-500/50"
                    : phase === "hold"
                    ? "bg-purple-400/80 shadow-lg shadow-purple-500/50"
                    : "bg-emerald-400/80 shadow-lg shadow-emerald-500/50"
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
