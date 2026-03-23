import { useState, useEffect, useRef } from 'react';

/**
 * useGameClock Hook
 * 1 Simulated Month = 10 Seconds of Real Time
 * Tick Rate: 100ms
 */
export const useGameClock = (isPaused, onMonthEnd) => {
  const [monthProgress, setMonthProgress] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setMonthProgress(prev => {
        if (prev >= 100) {
          onMonthEnd();
          return 0;
        }
        return prev + 1; // 1% every 100ms = 10s per month
      });
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, onMonthEnd]);

  return { monthProgress, setMonthProgress };
};
 
 
