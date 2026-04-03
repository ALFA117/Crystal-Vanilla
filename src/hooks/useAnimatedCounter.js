import { useEffect, useRef, useState } from 'react';

/**
 * Animates a number from 0 to `target` over `duration` ms.
 * Resets and re-runs whenever `target` changes.
 */
export function useAnimatedCounter(target, duration = 800) {
  const [display, setDisplay] = useState(0);
  const rafRef  = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    if (target == null || target === 0) {
      setDisplay(0);
      return;
    }

    // Cancel any running animation
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startRef.current = null;

    const animate = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setDisplay(target);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return display;
}
