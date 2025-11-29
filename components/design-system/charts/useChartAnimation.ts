import { useState, useEffect } from 'react';

// =============================================================================
// CHART ANIMATION HOOK
// =============================================================================
// Provides consistent mount animations for all chart components.
// Bars grow from 0, donuts fill from 0, lines draw themselves.
// =============================================================================

export interface ChartAnimationOptions {
  /** Delay before animation starts (ms) */
  delay?: number;
  /** Animation duration (ms) */
  duration?: number;
  /** Whether animation is enabled */
  enabled?: boolean;
}

export interface ChartAnimationResult {
  /** Whether the chart should be in animated (final) state */
  isAnimated: boolean;
  /** CSS transition string for the animation */
  transition: string;
  /** Get staggered delay for indexed items (e.g., bars) */
  getStaggerDelay: (index: number) => number;
  /** CSS styles for animating height-based elements (bars) */
  getBarStyle: (targetHeight: number, index: number) => React.CSSProperties;
  /** CSS styles for animating donut segments */
  getDonutStyle: (targetPercentage: number, index: number) => React.CSSProperties;
  /** Animation keyframes CSS (inject once per component) */
  keyframesCSS: string;
}

const DEFAULT_OPTIONS: Required<ChartAnimationOptions> = {
  delay: 50,
  duration: 600,
  enabled: true,
};

/**
 * useChartAnimation - Hook for consistent chart mount animations
 *
 * @example
 * ```tsx
 * const { isAnimated, getBarStyle } = useChartAnimation();
 *
 * return (
 *   <div style={getBarStyle(heightPercent, index)}>
 *     {content}
 *   </div>
 * );
 * ```
 */
export function useChartAnimation(options: ChartAnimationOptions = {}): ChartAnimationResult {
  const { delay, duration, enabled } = { ...DEFAULT_OPTIONS, ...options };
  const [isAnimated, setIsAnimated] = useState(!enabled);

  useEffect(() => {
    if (!enabled) {
      setIsAnimated(true);
      return;
    }

    const timer = setTimeout(() => setIsAnimated(true), delay);
    return () => clearTimeout(timer);
  }, [delay, enabled]);

  const staggerInterval = 40; // ms between each item

  const getStaggerDelay = (index: number): number => {
    return index * staggerInterval;
  };

  const transition = `all ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;

  const getBarStyle = (targetHeight: number, index: number): React.CSSProperties => ({
    height: isAnimated ? `${targetHeight}%` : '0%',
    opacity: isAnimated ? 1 : 0,
    transition: `height ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1) ${getStaggerDelay(index)}ms, opacity ${duration * 0.5}ms ease ${getStaggerDelay(index)}ms`,
  });

  const getDonutStyle = (targetPercentage: number, index: number): React.CSSProperties => ({
    // For conic-gradient based donuts, we animate via CSS custom properties
    '--segment-end': isAnimated ? `${targetPercentage}%` : '0%',
    transition: `all ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${getStaggerDelay(index)}ms`,
  } as React.CSSProperties);

  const keyframesCSS = `
    @keyframes chartBarGrow {
      0% {
        transform: scaleY(0);
        opacity: 0;
      }
      60% {
        opacity: 1;
      }
      100% {
        transform: scaleY(1);
        opacity: 1;
      }
    }

    @keyframes chartFadeSlideUp {
      0% {
        transform: translateY(10px);
        opacity: 0;
      }
      100% {
        transform: translateY(0);
        opacity: 1;
      }
    }

    @keyframes chartDonutFill {
      0% {
        stroke-dashoffset: var(--circumference);
      }
      100% {
        stroke-dashoffset: var(--target-offset);
      }
    }

    @keyframes chartValueCount {
      0% {
        opacity: 0;
        transform: scale(0.8);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }
  `;

  return {
    isAnimated,
    transition,
    getStaggerDelay,
    getBarStyle,
    getDonutStyle,
    keyframesCSS,
  };
}

export default useChartAnimation;
