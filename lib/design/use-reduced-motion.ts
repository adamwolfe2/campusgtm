/**
 * Hook for detecting user's reduced motion preference
 * Respects prefers-reduced-motion media query
 */

import { useEffect, useState } from 'react';

export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return prefersReducedMotion;
}

/**
 * Get animation props based on reduced motion preference
 * Returns empty object if user prefers reduced motion
 */
export function useAnimationProps<T extends Record<string, unknown>>(
  animationProps: T
): T | Record<string, never> {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return {};
  }

  return animationProps;
}

/**
 * Get transition duration based on reduced motion preference
 * Returns very short duration (0.01ms) if user prefers reduced motion
 */
export function useTransitionDuration(duration: number): number {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return 0.01; // 10ms - just enough to trigger but not noticeable
  }

  return duration;
}
