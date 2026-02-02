import React, { useRef, useEffect, useState } from 'react';
import type { MetricDefinition } from './metricConfig';

// =============================================================================
// METRIC TABS COMPONENT - Refined Pill Navigation
// =============================================================================

export interface MetricTabsProps {
  metrics: MetricDefinition[];
  selectedMetricId: string;
  onSelect: (metricId: string) => void;
}

export const MetricTabs: React.FC<MetricTabsProps> = ({
  metrics,
  selectedMetricId,
  onSelect,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  // Update sliding indicator position
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const selectedButton = container.querySelector(`[data-metric-id="${selectedMetricId}"]`) as HTMLElement;
    if (selectedButton) {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = selectedButton.getBoundingClientRect();
      setIndicatorStyle({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
      });
    }
  }, [selectedMetricId, metrics]);

  return (
    <div className="relative bg-stone-50/80 border-b border-stone-200/60">
      {/* Container with horizontal scroll for many tabs */}
      <div
        ref={containerRef}
        className="relative flex items-center gap-1 px-6 py-3 overflow-x-auto scrollbar-hide"
      >
        {/* Sliding indicator background */}
        <div
          className="absolute top-3 bottom-3 rounded-xl transition-all duration-300 ease-out pointer-events-none"
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
            background: 'linear-gradient(145deg, #1c1917 0%, #292524 100%)',
            boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
          }}
        />

        {/* Tab buttons */}
        {metrics.map((metric) => {
          const isSelected = metric.id === selectedMetricId;

          return (
            <button
              key={metric.id}
              data-metric-id={metric.id}
              onClick={() => onSelect(metric.id)}
              className={`
                relative px-4 py-2.5 rounded-xl text-sm font-semibold
                transition-all duration-300 whitespace-nowrap
                ${isSelected
                  ? 'text-white'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/80'
                }
              `}
            >
              {metric.label}
            </button>
          );
        })}
      </div>

      {/* Fade edges for scroll indication */}
      <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-stone-50 to-transparent pointer-events-none opacity-0" />
      <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-stone-50 to-transparent pointer-events-none opacity-0" />
    </div>
  );
};

export default MetricTabs;
