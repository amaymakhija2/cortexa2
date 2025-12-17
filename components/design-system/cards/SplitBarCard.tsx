import React from 'react';
import { Maximize2 } from 'lucide-react';
import { Legend } from '../Legend';

// =============================================================================
// SPLIT BAR CARD COMPONENT
// =============================================================================
// A premium split bar visualization for comparing two values.
// Features gradient segments with icons, percentages, and legends.
// Now uses the unified Legend component for consistent styling.
// =============================================================================

export interface SplitBarSegment {
  /** Segment label */
  label: string;
  /** Segment value (raw number) */
  value: number;
  /** Primary gradient color (hex) */
  color: string;
  /** Secondary gradient color (hex, optional - defaults to darker shade) */
  colorEnd?: string;
  /** Icon to display inside the segment */
  icon?: React.ReactNode;
}

export interface SplitBarCardProps {
  /** Card title */
  title: string;
  /** Card subtitle */
  subtitle?: string;
  /** Left segment data */
  leftSegment: SplitBarSegment;
  /** Right segment data */
  rightSegment: SplitBarSegment;
  /** Bar height: 'sm' | 'md' | 'lg' */
  barHeight?: 'sm' | 'md' | 'lg';
  /** Show expand button */
  expandable?: boolean;
  /** Expand callback */
  onExpand?: () => void;
  /** Show pattern overlay on segments */
  showPattern?: boolean;
  /** Show shine effect on segments */
  showShine?: boolean;
  /** Additional className */
  className?: string;
}

// Height configurations
const heightConfig = {
  sm: 'h-10',
  md: 'h-14',
  lg: 'h-16',
};

/**
 * SplitBarCard - Premium split bar visualization for comparing two values
 *
 * @example
 * <SplitBarCard
 *   title="Session Modality"
 *   leftSegment={{
 *     label: 'Telehealth',
 *     value: 2400,
 *     color: '#0891b2',
 *     colorEnd: '#0e7490',
 *     icon: <VideoIcon />
 *   }}
 *   rightSegment={{
 *     label: 'In-Person',
 *     value: 1800,
 *     color: '#d97706',
 *     colorEnd: '#b45309',
 *     icon: <BuildingIcon />
 *   }}
 *   expandable
 *   onExpand={() => setExpandedCard('modality')}
 * />
 */
export const SplitBarCard: React.FC<SplitBarCardProps> = ({
  title,
  subtitle,
  leftSegment,
  rightSegment,
  barHeight = 'md',
  expandable = false,
  onExpand,
  showPattern = true,
  showShine = true,
  className = '',
}) => {
  const total = leftSegment.value + rightSegment.value;
  const leftPercent = ((leftSegment.value / total) * 100).toFixed(1);
  const rightPercent = ((rightSegment.value / total) * 100).toFixed(1);

  // Default colorEnd to a slightly darker shade if not provided
  const leftColorEnd = leftSegment.colorEnd || leftSegment.color;
  const rightColorEnd = rightSegment.colorEnd || rightSegment.color;

  // Pattern SVG for segment overlay
  const patternSvg = `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3C/g%3E%3C/svg%3E")`;

  return (
    <div
      className={`rounded-2xl sm:rounded-3xl p-4 sm:p-5 xl:p-6 relative overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
        boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)'
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3
            className="text-stone-900 text-2xl sm:text-3xl xl:text-4xl font-bold tracking-tight"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
          >
            {title}
          </h3>
          {subtitle && (
            <p className="text-stone-500 text-base sm:text-lg xl:text-xl mt-2">{subtitle}</p>
          )}
        </div>

        {expandable && (
          <button
            onClick={onExpand}
            className="p-2.5 rounded-xl bg-stone-100/80 hover:bg-stone-200 text-stone-500 hover:text-stone-700 transition-all duration-200 hover:scale-105 active:scale-95"
            title="Expand chart"
          >
            <Maximize2 size={18} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Split Bar Visualization */}
      <div className="relative">
        {/* The split bar */}
        <div
          className={`relative ${heightConfig[barHeight]} rounded-2xl overflow-hidden flex`}
          style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)' }}
        >
          {/* Left segment */}
          <div
            className="relative flex items-center justify-center transition-all duration-500 group cursor-default"
            style={{
              width: `${leftPercent}%`,
              background: `linear-gradient(135deg, ${leftSegment.color} 0%, ${leftColorEnd} 100%)`,
            }}
          >
            {/* Pattern overlay */}
            {showPattern && (
              <div
                className="absolute inset-0 opacity-10"
                style={{ backgroundImage: patternSvg }}
              />
            )}

            {/* Icon and percentage */}
            <div className="relative z-10 flex items-center gap-2">
              {leftSegment.icon && (
                <span className="text-white/90">{leftSegment.icon}</span>
              )}
              <span className="text-white font-bold text-lg tracking-tight">
                {leftPercent}%
              </span>
            </div>

            {/* Shine effect */}
            {showShine && (
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent h-1/2" />
            )}
          </div>

          {/* Divider line */}
          <div className="w-px bg-white/30 relative z-20" />

          {/* Right segment */}
          <div
            className="relative flex items-center justify-center transition-all duration-500 group cursor-default"
            style={{
              width: `${rightPercent}%`,
              background: `linear-gradient(135deg, ${rightSegment.color} 0%, ${rightColorEnd} 100%)`,
            }}
          >
            {/* Pattern overlay */}
            {showPattern && (
              <div
                className="absolute inset-0 opacity-10"
                style={{ backgroundImage: patternSvg }}
              />
            )}

            {/* Icon and percentage */}
            <div className="relative z-10 flex items-center gap-2">
              {rightSegment.icon && (
                <span className="text-white/90">{rightSegment.icon}</span>
              )}
              <span className="text-white font-bold text-lg tracking-tight">
                {rightPercent}%
              </span>
            </div>

            {/* Shine effect */}
            {showShine && (
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent h-1/2" />
            )}
          </div>
        </div>

        {/* Labels below - using unified Legend component */}
        <div className="flex justify-between mt-4">
          <Legend
            items={[
              {
                label: leftSegment.label,
                color: leftSegment.color,
                type: 'dot',
                value: leftSegment.value,
              },
            ]}
            variant="compact"
            size="md"
          />
          <Legend
            items={[
              {
                label: rightSegment.label,
                color: rightSegment.color,
                type: 'dot',
                value: rightSegment.value,
              },
            ]}
            variant="compact"
            size="md"
          />
        </div>
      </div>
    </div>
  );
};

export default SplitBarCard;
