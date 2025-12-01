import React from 'react';

// =============================================================================
// COMPACT CARD COMPONENT
// =============================================================================
// Smaller cards for demographics, ratios, and secondary metrics.
// =============================================================================

export interface CompactCardProps {
  /** Card title */
  title: string;
  /** Additional className */
  className?: string;
  /** Card content */
  children: React.ReactNode;
}

/**
 * CompactCard - Base compact card container
 *
 * @example
 * <CompactCard title="Client Gender">
 *   <StackedBar ... />
 * </CompactCard>
 */
export const CompactCard: React.FC<CompactCardProps> = ({
  title,
  className = '',
  children,
}) => {
  return (
    <div
      className={`rounded-2xl xl:rounded-3xl p-6 sm:p-7 xl:p-8 relative overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
        boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)'
      }}
    >
      <h3
        className="text-stone-900 text-2xl sm:text-3xl xl:text-4xl font-bold mb-2 tracking-tight"
        style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
};

// =============================================================================
// STACKED BAR CARD
// =============================================================================
// Horizontal stacked bar visualization with legend
// =============================================================================

export interface StackedBarSegment {
  /** Segment label */
  label: string;
  /** Segment value */
  value: number;
  /** Segment color (tailwind bg class) */
  color: string;
}

export interface StackedBarCardProps {
  /** Card title */
  title: string;
  /** Bar segments */
  segments: StackedBarSegment[];
  /** Total value for percentage calculation (optional, defaults to sum) */
  total?: number;
  /** Show values as count or percentage */
  displayAs?: 'count' | 'percentage';
  /** Additional className */
  className?: string;
}

/**
 * StackedBarCard - Compact card with horizontal stacked bar
 *
 * @example
 * <StackedBarCard
 *   title="Client Gender"
 *   segments={[
 *     { label: 'Male', value: 52, color: 'bg-blue-500' },
 *     { label: 'Female', value: 78, color: 'bg-pink-500' },
 *     { label: 'Other', value: 8, color: 'bg-purple-500' }
 *   ]}
 * />
 *
 * @example
 * <StackedBarCard
 *   title="Session Frequency"
 *   displayAs="count"
 *   segments={[
 *     { label: 'Weekly', value: 78, color: 'bg-emerald-500' },
 *     { label: 'Bi-weekly', value: 45, color: 'bg-amber-500' },
 *     { label: 'Monthly', value: 15, color: 'bg-stone-400' }
 *   ]}
 * />
 */
export const StackedBarCard: React.FC<StackedBarCardProps> = ({
  title,
  segments,
  total: customTotal,
  displayAs = 'percentage',
  className = '',
}) => {
  const total = customTotal || segments.reduce((sum, seg) => sum + seg.value, 0);

  return (
    <div
      className={`rounded-2xl xl:rounded-3xl p-6 sm:p-7 xl:p-8 relative overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
        boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)'
      }}
    >
      <h3
        className="text-stone-900 text-2xl sm:text-3xl xl:text-4xl font-bold mb-2 tracking-tight"
        style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
      >
        {title}
      </h3>

      {/* Stacked bar */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 h-4 rounded-full overflow-hidden flex">
          {segments.map((segment, idx) => (
            <div
              key={idx}
              className={`h-full ${segment.color}`}
              style={{ width: `${(segment.value / total) * 100}%` }}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-sm sm:text-base">
        {segments.map((segment, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${segment.color}`} />
            <span className="text-stone-600">{segment.label}</span>
            <span className="font-semibold text-stone-900">
              {displayAs === 'percentage'
                ? `${((segment.value / total) * 100).toFixed(0)}%`
                : segment.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// =============================================================================
// METRIC LIST CARD
// =============================================================================
// Card with a list of metric items
// =============================================================================

export interface MetricItem {
  /** Metric label */
  label: string;
  /** Metric value */
  value: string | number;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Value color */
  valueColor?: string;
}

export interface MetricListCardProps {
  /** Card title */
  title: string;
  /** Metrics to display */
  metrics: MetricItem[];
  /** Additional className */
  className?: string;
}

/**
 * MetricListCard - Compact card with list of metrics
 *
 * @example
 * <MetricListCard
 *   title="Quick Stats"
 *   metrics={[
 *     { label: 'Active Clients', value: 156 },
 *     { label: 'This Month', value: '+12', valueColor: 'text-emerald-600' },
 *     { label: 'Caseload', value: '87%' }
 *   ]}
 * />
 */
export const MetricListCard: React.FC<MetricListCardProps> = ({
  title,
  metrics,
  className = '',
}) => {
  return (
    <div
      className={`rounded-2xl xl:rounded-3xl p-6 sm:p-7 xl:p-8 relative overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
        boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)'
      }}
    >
      <h3
        className="text-stone-900 text-2xl sm:text-3xl xl:text-4xl font-bold mb-2 tracking-tight"
        style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
      >
        {title}
      </h3>

      <div className="space-y-3">
        {metrics.map((metric, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {metric.icon && <span className="text-stone-400">{metric.icon}</span>}
              <span className="text-stone-600">{metric.label}</span>
            </div>
            <span className={`font-semibold ${metric.valueColor || 'text-stone-900'}`}>
              {metric.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompactCard;
