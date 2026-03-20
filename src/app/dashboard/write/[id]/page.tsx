"use client";

import { use, useEffect, useState } from "react";
import ArticleEditor from "../../../../components/ArticleEditor";
import BreathingExercise from "../../../../components/BreathingExercise";

const KEY_BREATHING_TIMESTAMP = "ws_breathing_timestamp";
const BREATHING_COOLDOWN = 60 * 60 * 1000;

export default function WriteByIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [showBreathing, setShowBreathing] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const timestamp = localStorage.getItem(KEY_BREATHING_TIMESTAMP);
      if (timestamp) {
        const lastTime = parseInt(timestamp, 10);
        if (Date.now() - lastTime < BREATHING_COOLDOWN) {
          setShowBreathing(false);
          return;
        }
      }
    } catch {}
    setShowBreathing(true);
  }, []);

  const handleBreathingComplete = () => {
    try {
      localStorage.setItem(KEY_BREATHING_TIMESTAMP, Date.now().toString());
    } catch {}
    setShowBreathing(false);
  };

  // Still checking — render nothing to avoid flash
  if (showBreathing === null) return null;

  if (showBreathing) {
    return <BreathingExercise onComplete={handleBreathingComplete} />;
  }

  return <ArticleEditor articleId={id} />;
}
