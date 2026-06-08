import { useCallback, useState } from "react";

const LS_KEY = "gladius_tutorial_done";
const TOTAL_STEPS = 5;

export function useTutorial() {
  const [step, setStep] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(LS_KEY) ? null : 0;
  });

  const advance = useCallback(() => {
    setStep(prev => {
      if (prev === null) return null;
      const next = prev + 1;
      if (next >= TOTAL_STEPS) {
        localStorage.setItem(LS_KEY, "1");
        return null;
      }
      return next;
    });
  }, []);

  const skip = useCallback(() => {
    localStorage.setItem(LS_KEY, "1");
    setStep(null);
  }, []);

  const restart = useCallback(() => {
    localStorage.removeItem(LS_KEY);
    setStep(0);
  }, []);

  return { tutorialStep: step, advanceTutorial: advance, skipTutorial: skip, restartTutorial: restart };
}
