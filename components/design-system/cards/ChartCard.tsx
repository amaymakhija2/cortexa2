import React, { useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

// =============================================================================
// CHART CARD COMPONENT
// =============================================================================
// Container for charts with header, legend, expand functionality, and insights.
// =============================================================================

export interface LegendItem {
  /** Legend label */
  label: string;
  /** Color indicator type */
  type: 'box' | 'line';
  /** Color value (tailwind class or hex) */
  color: string;
}

export interface InsightItem {
  /** Insight value */
  value: string | number;
  /** Insight label */
  label: string;
  /** Background color class */
  bgColor?: string;
  /** Text color class */
  textColor?: string;
}

export interface ChartCardProps {
  /** Card title */
  title: string;
  /** Subtitle/description */
  subtitle?: string;
  /** Legend items */
  legend?: LegendItem[];
  /** Show expand button */
  expandable?: boolean;
  /** Callback when expand is clicked */
  onExpand?: () => void;
  /** Insights row at bottom */
  insights?: InsightItem[];
  /** Value indicator box (right side of header) */
  valueIndicator?: {
    value: string | number;
    label: string;
    bgColor?: string;
    textColor?: string;
  };
  /** Custom controls in header (ToggleButton, GoalIndicator, ActionButton, etc.) */
  headerControls?: React.ReactNode;
  /** Minimum height for the card */
  minHeight?: string;
  /** Additional className */
  className?: string;
  /** Chart content */
  children: React.ReactNode;
}

/**
 * ChartCard - Container for charts with full features
 *
 * @example
 * <ChartCard
 *   title="Client Utilization"
 *   subtitle="Active clients & utilization rate over time"
 *   legend={[
 *     { label: 'Active Clients', type: 'box', color: 'bg-gradient-to-b from-amber-400 to-amber-500' },
 *     { label: 'Utilization %', type: 'line', color: 'bg-emerald-500' }
 *   ]}
 *   expandable
 *   onExpand={() => setExpanded('utilization')}
 *   insights={[
 *     { value: 148, label: 'Avg Clients', bgColor: 'bg-amber-50', textColor: 'text-amber-600' },
 *     { value: '84%', label: 'Avg Utilization', bgColor: 'bg-emerald-50', textColor: 'text-emerald-600' },
 *     { value: 'Jun', label: 'Peak (87%)', bgColor: 'bg-stone-100', textColor: 'text-stone-800' }
 *   ]}
 * >
 *   <YourChart data={data} />
 * </ChartCard>
 */
export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  legend,
  expandable = false,
  onExpand,
  insights,
  valueIndicator,
  headerControls,
  minHeight = '480px',
  className = '',
  children,
}) => {
  return (
    <div
      className={`rounded-2xl xl:rounded-3xl p-6 sm:p-8 xl:p-10 relative flex flex-col overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(145deg, #ffffff 0%, #fafaf9 100%)',
        boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)',
        minHeight,
      }}
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div className="flex-1 min-w-0">
          <h3
            className="text-stone-900 text-2xl sm:text-3xl xl:text-4xl font-bold mb-2 tracking-tight"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
          >
            {title}
          </h3>
          {subtitle && (
            <p className="text-stone-500 text-base sm:text-lg xl:text-xl">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Custom Header Controls (ToggleButton, GoalIndicator, ActionButton, etc.) */}
          {headerControls}

          {/* Value Indicator */}
          {valueIndicator && (
            <div className={`${valueIndicator.bgColor || 'bg-stone-50'} rounded-xl px-5 py-3 text-center`}>
              <div
                className={`${valueIndicator.textColor || 'text-stone-900'} text-2xl sm:text-3xl font-bold`}
                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
              >
                {valueIndicator.value}
              </div>
              <div className="text-stone-500 text-sm font-medium">{valueIndicator.label}</div>
            </div>
          )}

          {/* Legend */}
          {legend && legend.length > 0 && (
            <div className="flex items-center gap-6 bg-stone-50 rounded-xl px-5 py-3">
              {legend.map((item, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <div className="w-px h-6 bg-stone-200" />}
                  <div className="flex items-center gap-3">
                    {item.type === 'box' ? (
                      <div className={`w-5 h-5 rounded-md ${item.color} shadow-sm`}></div>
                    ) : (
                      <div className={`w-8 h-1 ${item.color} rounded-full`}></div>
                    )}
                    <span className="text-stone-700 text-base font-semibold">{item.label}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Expand Button */}
          {expandable && (
            <button
              onClick={onExpand}
              className="p-2.5 rounded-xl bg-stone-100/80 hover:bg-stone-200 text-stone-500 hover:text-stone-700 transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0"
              title="Expand chart"
            >
              <Maximize2 size={18} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 min-h-[280px]">
        {children}
      </div>

      {/* Insights Row */}
      {insights && insights.length > 0 && (
        <div className={`grid grid-cols-${insights.length} gap-4 pt-4 mt-2 border-t-2 border-stone-100`}>
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className={`${insight.bgColor || 'bg-stone-100'} rounded-xl p-4 text-center`}
            >
              <div
                className={`${insight.textColor || 'text-stone-800'} text-2xl sm:text-3xl font-bold`}
                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
              >
                {insight.value}
              </div>
              <div className="text-stone-600 text-sm sm:text-base font-medium mt-1">
                {insight.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// =============================================================================
// SIMPLE CHART CARD
// =============================================================================
// Simpler version without legend/insights for basic charts
// =============================================================================

export interface MetricIndicator {
  /** The metric value */
  value: string | number;
  /** Label for the metric */
  label: string;
  /** Background color (hex) */
  bgColor?: string;
  /** Text color (hex) */
  textColor?: string;
  /** Accent color for subtle left border (hex) */
  accentColor?: string;
  /** Whether this is the primary/highlighted metric */
  isPrimary?: boolean;
}

export interface SimpleChartCardProps {
  /** Card title */
  title: string;
  /** Subtitle/description */
  subtitle?: string;
  /** Metric indicators displayed as elegant boxes (e.g., Your Avg, Industry, Last Year) */
  metrics?: MetricIndicator[];
  /** Show expand button */
  expandable?: boolean;
  /** Callback when expand is clicked */
  onExpand?: () => void;
  /** Chart height */
  height?: string;
  /** Additional className */
  className?: string;
  /** Chart content */
  children: React.ReactNode;
}

/**
 * SimpleChartCard - Simpler chart container with maximum space utilization
 *
 * @example
 * <SimpleChartCard
 *   title="Session Utilization"
 *   subtitle="Percentage of session capacity utilized"
 *   valueIndicator={{ value: '85%', label: 'Average', bgColor: 'bg-blue-50', textColor: 'text-blue-600' }}
 *   expandable
 * >
 *   <LineChart ... />
 * </SimpleChartCard>
 */
export const SimpleChartCard: React.FC<SimpleChartCardProps> = ({
  title,
  subtitle,
  metrics,
  expandable = false,
  onExpand,
  height = '620px',
  className = '',
  children,
}) => {
  return (
    <div
      className={`rounded-2xl xl:rounded-3xl p-5 sm:p-6 xl:p-8 overflow-hidden flex flex-col ${className}`}
      style={{
        background: 'linear-gradient(145deg, #ffffff 0%, #fafaf9 100%)',
        boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)',
        minHeight: height,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4 flex-shrink-0">
        <div className="flex-1 min-w-0">
          <h3
            className="text-stone-900 text-2xl sm:text-3xl xl:text-4xl font-bold mb-2 tracking-tight"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
          >
            {title}
          </h3>
          {subtitle && (
            <p className="text-stone-500 text-base sm:text-lg xl:text-xl">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Metrics row - elegant comparison boxes */}
          {metrics && metrics.length > 0 && (
            <div className="flex items-stretch gap-2.5 sm:gap-3">
              {metrics.map((metric, idx) => (
                <div
                  key={idx}
                  className={`relative rounded-xl sm:rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3 text-center overflow-hidden transition-all duration-200 hover:scale-[1.02] ${
                    metric.isPrimary ? 'ring-1 ring-stone-200/60' : ''
                  }`}
                  style={{
                    background: metric.bgColor || '#f5f5f4',
                    minWidth: '90px',
                  }}
                >
                  {/* Subtle left accent bar for non-primary metrics */}
                  {metric.accentColor && !metric.isPrimary && (
                    <div
                      className="absolute left-0 top-3 bottom-3 w-1 rounded-full"
                      style={{
                        backgroundColor: metric.accentColor,
                        opacity: 0.8,
                      }}
                    />
                  )}

                  {/* Value */}
                  <div
                    className="text-xl sm:text-2xl xl:text-3xl font-bold leading-none"
                    style={{
                      fontFamily: "'DM Serif Display', Georgia, serif",
                      color: metric.textColor || '#44403c',
                    }}
                  >
                    {metric.value}
                  </div>

                  {/* Label */}
                  <div className="text-stone-500 text-sm sm:text-base font-medium mt-1.5">
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Expand button */}
          {expandable && (
            <button
              onClick={onExpand}
              className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-stone-100/80 hover:bg-stone-200 text-stone-500 hover:text-stone-700 transition-all duration-200 hover:scale-105 active:scale-95"
              title="Expand chart"
            >
              <Maximize2 size={16} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 min-h-[280px]">
        {children}
      </div>
    </div>
  );
};

// =============================================================================
// EXPANDED CHART MODAL
// =============================================================================
// Immersive fullscreen modal for expanded charts.
// Provides a centralized, consistent expanded experience for all chart components.
// =============================================================================

export interface ExpandedChartModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Close callback */
  onClose: () => void;
  /** Modal title */
  title: string;
  /** Subtitle */
  subtitle?: string;
  /** Legend items (displayed in header) */
  legend?: LegendItem[];
  /** Custom header controls (ToggleButton, GoalIndicator, ActionButton, etc.) */
  headerControls?: React.ReactNode;
  /** Insights row at the bottom (optional) */
  insights?: InsightItem[];
  /** Modal content */
  children: React.ReactNode;
}

/**
 * ExpandedChartModal - Immersive fullscreen modal for charts
 *
 * Features:
 * - 95vw x 90vh immersive viewport
 * - Blur backdrop with elegant shadows
 * - Large typography for titles/subtitles
 * - Support for header controls (toggles, buttons, indicators)
 * - Optional legend display
 * - Optional insights row at bottom
 *
 * @example Basic usage
 * ```tsx
 * <ExpandedChartModal
 *   isOpen={expanded === 'revenue'}
 *   onClose={() => setExpanded(null)}
 *   title="Revenue Performance"
 *   subtitle="Monthly breakdown with goal tracking"
 * >
 *   <BarChart data={data} size="lg" />
 * </ExpandedChartModal>
 * ```
 *
 * @example With header controls
 * ```tsx
 * <ExpandedChartModal
 *   isOpen={expanded === 'revenue'}
 *   onClose={() => setExpanded(null)}
 *   title="Revenue Performance"
 *   subtitle="Monthly breakdown"
 *   headerControls={
 *     <>
 *       <ToggleButton label="By Clinician" active={showBreakdown} onToggle={toggle} />
 *       <GoalIndicator value="$150k" label="Goal" color="amber" />
 *       <ActionButton label="Export" icon={<Download />} />
 *     </>
 *   }
 * >
 *   <BarChart data={data} size="lg" />
 * </ExpandedChartModal>
 * ```
 */
export const ExpandedChartModal: React.FC<ExpandedChartModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  legend,
  headerControls,
  insights,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-8"
      style={{
        backgroundColor: 'rgba(28, 25, 23, 0.6)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[95vw] h-[90vh] rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #ffffff 0%, #fafaf9 100%)',
          boxShadow: '0 50px 100px -20px rgba(0, 0, 0, 0.25), 0 30px 60px -30px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.05)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-800 transition-all duration-200 hover:scale-105 active:scale-95 group"
          title="Close"
        >
          <Minimize2 size={22} strokeWidth={2} className="group-hover:rotate-180 transition-transform duration-300" />
        </button>

        {/* Content */}
        <div className="p-8 sm:p-12 h-full flex flex-col">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8 flex-shrink-0">
            <div>
              <h3
                className="text-stone-900 text-3xl sm:text-4xl xl:text-5xl font-bold mb-3 tracking-tight"
                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
              >
                {title}
              </h3>
              {subtitle && (
                <p className="text-stone-500 text-lg sm:text-xl xl:text-2xl">{subtitle}</p>
              )}
            </div>

            {/* Right side: Controls and/or Legend */}
            <div className="flex items-center gap-4 flex-wrap">
              {/* Custom Header Controls */}
              {headerControls}

              {/* Legend */}
              {legend && legend.length > 0 && (
                <div className="flex items-center gap-8 bg-stone-50 rounded-2xl px-8 py-5">
                  {legend.map((item, idx) => (
                    <React.Fragment key={idx}>
                      {idx > 0 && <div className="w-px h-8 bg-stone-200" />}
                      <div className="flex items-center gap-4">
                        {item.type === 'box' ? (
                          <div className={`w-6 h-6 rounded-lg ${item.color} shadow-sm`}></div>
                        ) : (
                          <div className={`w-10 h-1.5 ${item.color} rounded-full`}></div>
                        )}
                        <span className="text-stone-700 text-lg font-semibold">{item.label}</span>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chart Content */}
          <div className="flex-1 min-h-0">
            {children}
          </div>

          {/* Insights Row (optional) */}
          {insights && insights.length > 0 && (
            <div className="grid gap-6 pt-6 mt-4 border-t-2 border-stone-100 flex-shrink-0" style={{ gridTemplateColumns: `repeat(${insights.length}, 1fr)` }}>
              {insights.map((insight, idx) => (
                <div
                  key={idx}
                  className={`${insight.bgColor || 'bg-stone-100'} rounded-2xl p-6 text-center`}
                >
                  <div
                    className={`${insight.textColor || 'text-stone-800'} text-3xl sm:text-4xl font-bold`}
                    style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                  >
                    {insight.value}
                  </div>
                  <div className="text-stone-600 text-base sm:text-lg font-medium mt-2">
                    {insight.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartCard;
