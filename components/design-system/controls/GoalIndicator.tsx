import React from 'react';

// =============================================================================
// GOAL INDICATOR COMPONENT
// =============================================================================
// A refined badge showing a goal/target value with a visual line preview.
// Supports multiple color variants to match different chart accents.
// =============================================================================

export type GoalIndicatorColor = 'amber' | 'emerald' | 'cyan' | 'rose' | 'violet' | 'blue';

export interface GoalIndicatorProps {
  /** Goal value to display */
  value: string | number;
  /** Label text (defaults to "Goal") */
  label?: string;
  /** Color scheme */
  color?: GoalIndicatorColor;
  /** Line style preview */
  lineStyle?: 'dashed' | 'solid' | 'dotted';
  /** Hide the indicator */
  hidden?: boolean;
  /** Additional className */
  className?: string;
}

// Color definitions for each variant
const GOAL_COLORS: Record<GoalIndicatorColor, {
  bg: string;
  border: string;
  text: string;
  line: string;
}> = {
  amber: {
    bg: 'rgba(245, 158, 11, 0.1)',
    border: 'rgba(252, 211, 77, 0.5)',
    text: '#b45309',
    line: '#f59e0b',
  },
  emerald: {
    bg: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(110, 231, 183, 0.5)',
    text: '#047857',
    line: '#10b981',
  },
  cyan: {
    bg: 'rgba(6, 182, 212, 0.1)',
    border: 'rgba(103, 232, 249, 0.5)',
    text: '#0e7490',
    line: '#06b6d4',
  },
  rose: {
    bg: 'rgba(244, 63, 94, 0.1)',
    border: 'rgba(251, 113, 133, 0.5)',
    text: '#be123c',
    line: '#f43f5e',
  },
  violet: {
    bg: 'rgba(139, 92, 246, 0.1)',
    border: 'rgba(167, 139, 250, 0.5)',
    text: '#6d28d9',
    line: '#8b5cf6',
  },
  blue: {
    bg: 'rgba(59, 130, 246, 0.1)',
    border: 'rgba(147, 197, 253, 0.5)',
    text: '#1d4ed8',
    line: '#3b82f6',
  },
};

const LINE_STYLES: Record<'dashed' | 'solid' | 'dotted', string> = {
  dashed: 'dashed',
  solid: 'solid',
  dotted: 'dotted',
};

/**
 * GoalIndicator - Visual badge showing goal/target value
 *
 * @example
 * <GoalIndicator value={700} label="Goal" color="amber" />
 *
 * @example
 * <GoalIndicator value="$150k" label="Target" color="emerald" lineStyle="solid" />
 */
export const GoalIndicator: React.FC<GoalIndicatorProps> = ({
  value,
  label = 'Goal',
  color = 'amber',
  lineStyle = 'dashed',
  hidden = false,
  className = '',
}) => {
  if (hidden) return null;

  const colors = GOAL_COLORS[color];
  const borderStyle = LINE_STYLES[lineStyle];

  return (
    <div
      className={`
        inline-flex items-center gap-2.5 px-4 py-2 rounded-full
        transition-all duration-300 ease-out
        hover:scale-[1.02]
        ${className}
      `}
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        boxShadow: `0 2px 8px -2px ${colors.bg}`,
      }}
    >
      {/* Line Preview */}
      <div
        className="w-5 h-0"
        style={{
          borderTop: `2.5px ${borderStyle} ${colors.line}`,
        }}
      />

      {/* Value and Label */}
      <span
        className="text-sm font-bold tracking-wide"
        style={{ color: colors.text }}
      >
        {value} {label}
      </span>
    </div>
  );
};

export default GoalIndicator;
