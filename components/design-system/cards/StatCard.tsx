import React from 'react';

// =============================================================================
// STAT CARD COMPONENT
// =============================================================================
// Hero stat card for displaying key metrics.
// Used in the top row of analysis pages.
// =============================================================================

export type StatVariant = 'default' | 'positive' | 'negative' | 'percentage';

export interface StatCardProps {
  /** Card title */
  title: string;
  /** Main value to display */
  value: string | number;
  /** Label displayed next to the value (e.g., "right now") */
  valueLabel?: string;
  /** Subtitle/description below value */
  subtitle?: string;
  /** Visual variant affecting value color */
  variant?: StatVariant;
  /** Custom value color (overrides variant) */
  valueColor?: string;
  /** Additional className */
  className?: string;
  /** Icon to display (optional) */
  icon?: React.ReactNode;
}

const VALUE_COLORS: Record<StatVariant, string> = {
  default: 'text-stone-900',
  positive: 'text-emerald-600',
  negative: 'text-rose-600',
  percentage: 'text-stone-900',
};

/**
 * StatCard - Hero metric card
 *
 * @example
 * // Basic stat
 * <StatCard title="Active Clients" value={156} subtitle="of 180 capacity" />
 *
 * @example
 * // Stat with value label
 * <StatCard title="Active Clients" value={156} valueLabel="right now" subtitle="+14 in Jan–Dec 2024" />
 *
 * @example
 * // Positive growth stat
 * <StatCard title="Net Growth" value="+14" variant="positive" subtitle="+62 new, -48 churned" />
 *
 * @example
 * // Percentage stat
 * <StatCard title="Caseload Capacity" value="87%" subtitle="of client capacity" />
 */
export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  valueLabel,
  subtitle,
  variant = 'default',
  valueColor,
  className = '',
  icon,
}) => {
  const colorClass = valueColor || VALUE_COLORS[variant];

  return (
    <div
      className={`rounded-2xl xl:rounded-3xl p-6 sm:p-7 xl:p-8 2xl:p-10 relative overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
        boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)'
      }}
    >
      {/* Optional decorative accent */}
      {icon && (
        <div className="absolute top-4 right-4 opacity-10">
          {icon}
        </div>
      )}

      <h3
        className="text-stone-900 text-2xl sm:text-3xl xl:text-4xl 2xl:text-5xl font-bold mb-2 tracking-tight min-h-[3.5rem] sm:min-h-[4rem] xl:min-h-[5rem] 2xl:min-h-[6rem] flex items-end"
        style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
      >
        {title}
      </h3>

      <div className="flex items-baseline gap-2 sm:gap-3 2xl:gap-4">
        <span
          className={`${colorClass} font-bold text-4xl sm:text-5xl xl:text-6xl 2xl:text-7xl`}
          style={{ lineHeight: 1, fontFamily: "'DM Serif Display', Georgia, serif" }}
        >
          {value}
        </span>
        {valueLabel && (
          <span className="text-stone-400 text-lg sm:text-xl xl:text-2xl 2xl:text-3xl font-medium">
            {valueLabel}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-stone-500 text-base sm:text-lg xl:text-xl 2xl:text-2xl mt-3 xl:mt-4 2xl:mt-5 font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
};

// =============================================================================
// STAT CARD WITH BREAKDOWN
// =============================================================================
// Variant with colored breakdown values in subtitle
// =============================================================================

export interface StatCardWithBreakdownProps extends Omit<StatCardProps, 'subtitle'> {
  /** Breakdown items to show */
  breakdown?: { label: string; value: string | number; color?: 'positive' | 'negative' | 'neutral' }[];
}

/**
 * StatCardWithBreakdown - Stat card with colored breakdown values
 *
 * @example
 * <StatCardWithBreakdown
 *   title="Net Growth"
 *   value="+14"
 *   variant="positive"
 *   breakdown={[
 *     { label: 'new', value: '+62', color: 'positive' },
 *     { label: 'churned', value: '-48', color: 'negative' }
 *   ]}
 * />
 */
export const StatCardWithBreakdown: React.FC<StatCardWithBreakdownProps> = ({
  title,
  value,
  variant = 'default',
  valueColor,
  className = '',
  icon,
  breakdown = [],
}) => {
  const colorClass = valueColor || VALUE_COLORS[variant];

  const breakdownColors = {
    positive: 'text-emerald-600',
    negative: 'text-rose-500',
    neutral: 'text-stone-600',
  };

  return (
    <div
      className={`rounded-2xl xl:rounded-3xl p-6 sm:p-7 xl:p-8 2xl:p-10 relative overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
        boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)'
      }}
    >
      {icon && (
        <div className="absolute top-4 right-4 opacity-10">
          {icon}
        </div>
      )}

      <h3
        className="text-stone-900 text-2xl sm:text-3xl xl:text-4xl 2xl:text-5xl font-bold mb-2 tracking-tight min-h-[3.5rem] sm:min-h-[4rem] xl:min-h-[5rem] 2xl:min-h-[6rem] flex items-end"
        style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
      >
        {title}
      </h3>

      <span
        className={`${colorClass} font-bold block text-4xl sm:text-5xl xl:text-6xl 2xl:text-7xl`}
        style={{ lineHeight: 1, fontFamily: "'DM Serif Display', Georgia, serif" }}
      >
        {value}
      </span>

      {breakdown.length > 0 && (
        <p className="text-stone-500 text-base sm:text-lg xl:text-xl 2xl:text-2xl mt-3 xl:mt-4 2xl:mt-5 font-medium">
          {breakdown.map((item, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && ', '}
              <span className={breakdownColors[item.color || 'neutral']}>{item.value}</span>
              {' '}{item.label}
            </React.Fragment>
          ))}
        </p>
      )}
    </div>
  );
};

export default StatCard;
