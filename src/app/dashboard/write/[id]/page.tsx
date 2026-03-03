"use client";

import { use, useEffect, useState } from "react";
import ArticleEditor from "../../../../components/ArticleEditor";
import BreathingExercise from "../../../../components/BreathingExercise";

const KEY_BREATHING_TIMESTAMP = "ws_breathing_timestamp";
const BREATHING_COOLDOWN = 60 * 60 * 1000; // 60 minutes in milliseconds

export default function WriteByIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [showBreathing, setShowBreathing] = useState(true);

  // Check if breathing exercise was done recently (within 60 minutes)
  useEffect(() => {
    try {
      const timestamp = sessionStorage.getItem(KEY_BREATHING_TIMESTAMP);
      if (timestamp) {
        const lastTime = parseInt(timestamp, 10);
        const now = Date.now();
        if (now - lastTime < BREATHING_COOLDOWN) {
          setShowBreathing(false);
        }
      }
    } catch {
      // If sessionStorage fails, show breathing exercise
    }
  }, []);

  const handleBreathingComplete = () => {
    try {
      sessionStorage.setItem(KEY_BREATHING_TIMESTAMP, Date.now().toString());
    } catch {
      // Ignore storage errors
    }
    setShowBreathing(false);
  };

  if (showBreathing) {
    return <BreathingExercise onComplete={handleBreathingComplete} />;
  }

  return <ArticleEditor articleId={id} />;
}
