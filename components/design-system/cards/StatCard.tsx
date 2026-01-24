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
      className={`rounded-2xl xl:rounded-3xl p-5 sm:p-6 xl:p-7 2xl:p-8 relative overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
        boxShadow: 'var(--shadow-card)'
      }}
    >
      {/* Optional decorative accent */}
      {icon && (
        <div className="absolute top-4 right-4 opacity-10">
          {icon}
        </div>
      )}

      {/* Title - refined sizing */}
      <h3
        className="text-stone-800 text-lg sm:text-xl xl:text-2xl font-semibold mb-3 sm:mb-4 tracking-tight"
        style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
      >
        {title}
      </h3>

      {/* Value + Label Group */}
      <div className="flex flex-col">
        <div className="flex items-baseline gap-2 sm:gap-2.5">
          <span
            className={`${colorClass} font-bold text-3xl sm:text-4xl xl:text-5xl 2xl:text-6xl tracking-tight`}
            style={{ lineHeight: 1.1, fontFamily: "'Tiempos Headline', Georgia, serif" }}
          >
            {value}
          </span>
          {valueLabel && (
            <span
              className="text-stone-400 text-sm sm:text-base xl:text-lg font-normal tracking-wide"
              style={{
                fontFamily: "'Suisse Intl', system-ui, sans-serif",
                letterSpacing: '0.02em'
              }}
            >
              {valueLabel}
            </span>
          )}
        </div>
      </div>

      {/* Subtitle - refined spacing and style */}
      {subtitle && (
        <p
          className="text-stone-500 text-sm sm:text-base xl:text-lg mt-2.5 sm:mt-3 font-normal leading-snug"
          style={{ fontFamily: "'Suisse Intl', system-ui, sans-serif" }}
        >
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
      className={`rounded-2xl xl:rounded-3xl p-5 sm:p-6 xl:p-7 2xl:p-8 relative overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
        boxShadow: 'var(--shadow-card)'
      }}
    >
      {icon && (
        <div className="absolute top-4 right-4 opacity-10">
          {icon}
        </div>
      )}

      {/* Title - refined sizing */}
      <h3
        className="text-stone-800 text-lg sm:text-xl xl:text-2xl font-semibold mb-3 sm:mb-4 tracking-tight"
        style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
      >
        {title}
      </h3>

      {/* Value */}
      <span
        className={`${colorClass} font-bold block text-3xl sm:text-4xl xl:text-5xl 2xl:text-6xl tracking-tight`}
        style={{ lineHeight: 1.1, fontFamily: "'Tiempos Headline', Georgia, serif" }}
      >
        {value}
      </span>

      {/* Breakdown items */}
      {breakdown.length > 0 && (
        <p
          className="text-stone-500 text-sm sm:text-base xl:text-lg mt-2.5 sm:mt-3 font-normal leading-snug"
          style={{ fontFamily: "'Suisse Intl', system-ui, sans-serif" }}
        >
          {breakdown.map((item, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && (
                <span className="text-stone-300 mx-1.5">·</span>
              )}
              <span className={`${breakdownColors[item.color || 'neutral']} font-medium`}>
                {item.value}
              </span>
              <span className="text-stone-400 ml-1">{item.label}</span>
            </React.Fragment>
          ))}
        </p>
      )}
    </div>
  );
};

export default StatCard;
