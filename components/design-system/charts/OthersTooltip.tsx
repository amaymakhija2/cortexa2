import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { ClinicianData } from '../utils/clinicianColors';

// =============================================================================
// OTHERS TOOLTIP COMPONENT
// =============================================================================
// Displays the breakdown of clinicians aggregated in the "Others" segment.
// Shows ranked list with values and optional "swap" action.
// =============================================================================

export interface OthersTooltipProps {
  /** Clinicians in the "Others" group */
  clinicians: ClinicianData[];
  /** Label of the hovered data point (e.g., month) */
  dataPointLabel: string;
  /** Values for each clinician at this data point */
  dataPointValues: Record<string, number>;
  /** Total value of "Others" at this data point */
  totalValue: number;
  /** Callback when a clinician is clicked to swap into view */
  onSwap?: (clinicianKey: string) => void;
  /** Format function for values */
  formatValue?: (value: number) => string;
  /** Position offset */
  position?: { x: number; y: number };
  /** Additional className */
  className?: string;
}

export const OthersTooltip: React.FC<OthersTooltipProps> = ({
  clinicians,
  dataPointLabel,
  dataPointValues,
  totalValue,
  onSwap,
  formatValue = (v) => v.toLocaleString(),
  position,
  className = '',
}) => {
  // Sort by value at this data point (descending)
  const sortedClinicians = [...clinicians].sort((a, b) => {
    const valueA = dataPointValues[a.key] || 0;
    const valueB = dataPointValues[b.key] || 0;
    return valueB - valueA;
  });

  // Only show top 8 in tooltip, with "and X more" if needed
  const displayClinicians = sortedClinicians.slice(0, 8);
  const remainingCount = sortedClinicians.length - 8;

  return (
    <div
      className={`
        absolute z-50 min-w-[220px] max-w-[280px]
        bg-white/98 backdrop-blur-md
        rounded-xl border border-stone-200
        shadow-xl overflow-hidden
        ${className}
      `}
      style={{
        ...(position ? { left: position.x, top: position.y } : {}),
        animation: 'tooltipIn 0.15s ease-out',
      }}
    >
      {/* Header */}
      <div className="px-4 py-3 bg-stone-50 border-b border-stone-100">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-stone-900" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>
            Others
          </div>
          <div className="text-sm font-bold text-stone-600 tabular-nums">
            {formatValue(totalValue)}
          </div>
        </div>
        <div className="text-xs text-stone-500 mt-0.5">
          {clinicians.length} clinicians in {dataPointLabel}
        </div>
      </div>

      {/* Clinician List */}
      <div className="py-2 max-h-[280px] overflow-y-auto">
        {displayClinicians.map((clinician, index) => {
          const value = dataPointValues[clinician.key] || 0;
          const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;

          return (
            <div
              key={clinician.key}
              className={`
                group flex items-center gap-3 px-4 py-2
                transition-colors duration-150
                ${onSwap ? 'hover:bg-indigo-50 cursor-pointer' : ''}
              `}
              onClick={() => onSwap?.(clinician.key)}
            >
              {/* Rank */}
              <div className="w-5 text-center text-xs font-medium text-stone-400 tabular-nums">
                {index + 1}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-stone-800 truncate">
                  {clinician.label}
                </div>
              </div>

              {/* Value & Percentage */}
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-bold text-stone-900 tabular-nums">
                  {formatValue(value)}
                </div>
                <div className="text-xs text-stone-500 tabular-nums">
                  {percentage.toFixed(1)}%
                </div>
              </div>

              {/* Swap Icon (on hover) */}
              {onSwap && (
                <ArrowUpRight
                  size={14}
                  className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                />
              )}
            </div>
          );
        })}

        {/* "And X more" indicator */}
        {remainingCount > 0 && (
          <div className="px-4 py-2 text-xs text-stone-500 text-center">
            and {remainingCount} more...
          </div>
        )}
      </div>

      {/* Swap hint */}
      {onSwap && (
        <div className="px-4 py-2.5 bg-indigo-50 border-t border-indigo-100">
          <div className="text-xs text-indigo-600 text-center font-medium">
            Click a name to swap into view
          </div>
        </div>
      )}

      {/* Animation */}
      <style>{`
        @keyframes tooltipIn {
          from {
            opacity: 0;
            transform: translateY(4px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default OthersTooltip;
