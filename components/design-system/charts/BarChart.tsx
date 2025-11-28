import React from 'react';

// =============================================================================
// BAR CHART COMPONENT
// =============================================================================
// Premium custom bar chart with support for single bars, stacked bars,
// goal lines, hover interactions, and beautiful gradients.
// =============================================================================

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

export interface BarChartDataPoint {
  /** Label for this data point (e.g., month name) */
  label: string;
  /** Value for single-bar mode */
  value?: number;
  /** Values for stacked-bar mode, keyed by segment key */
  [key: string]: string | number | undefined;
}

export interface SegmentConfig {
  /** Unique key matching data point keys */
  key: string;
  /** Display label for legend */
  label: string;
  /** Solid color (hex) */
  color: string;
  /** CSS gradient string */
  gradient: string;
}

export interface BarColorConfig {
  /** CSS gradient for bar fill */
  gradient: string;
  /** CSS box-shadow */
  shadow: string;
  /** Tailwind text color class for value label */
  textColor: string;
}

export interface HoverInfo {
  /** Data point label (e.g., month) */
  label: string;
  /** Segment key (for stacked mode) */
  segment: string;
  /** Segment display name */
  segmentLabel: string;
  /** Value of the hovered segment */
  value: number;
  /** Color of the segment */
  color: string;
}

/** Size variant for different contexts */
export type BarChartSize = 'default' | 'lg';

export interface BarChartProps {
  /** Chart data points */
  data: BarChartDataPoint[];

  /** Display mode: 'single' for regular bars, 'stacked' for stacked bars */
  mode?: 'single' | 'stacked';

  /**
   * Size variant - 'default' for cards, 'lg' for expanded/fullscreen views
   * Controls font sizes, bar widths, and spacing
   */
  size?: BarChartSize;

  /**
   * For single mode: function to determine bar styling based on value
   * @param value - The bar value
   * @param index - The bar index
   * @returns BarColorConfig with gradient, shadow, and textColor
   */
  getBarColor?: (value: number, index: number) => BarColorConfig;

  /**
   * For stacked mode: segment configuration
   * Defines the segments that make up each stacked bar
   */
  segments?: SegmentConfig[];

  /**
   * For stacked mode: order of segments from bottom to top
   * Array of segment keys
   */
  stackOrder?: string[];

  /** Goal line configuration */
  goal?: {
    /** Goal value */
    value: number;
    /** Whether to show the goal line (default: true when goal is provided) */
    show?: boolean;
  };

  /**
   * Maximum Y-axis value
   * If not provided, auto-calculated from data
   */
  maxValue?: number;

  /**
   * Y-axis label configuration
   * - If array of strings: use these labels directly
   * - If function: called with maxValue to generate labels
   * - If not provided: auto-generate 5 labels from 0 to max
   */
  yAxisLabels?: string[] | ((maxValue: number) => string[]);

  /**
   * Format function for value labels above bars
   * @param value - The value to format
   * @returns Formatted string
   */
  formatValue?: (value: number) => string;

  /**
   * Callback when a bar segment is hovered
   * @param info - Hover info or null when hover ends
   */
  onHover?: (info: HoverInfo | null) => void;

  /** Chart height (CSS value) */
  height?: string;

  /** Whether to show the legend below the chart (stacked mode only) */
  showLegend?: boolean;

  /** Additional className for the container */
  className?: string;
}

// -----------------------------------------------------------------------------
// DEFAULT CONFIGURATIONS
// -----------------------------------------------------------------------------

const DEFAULT_SINGLE_BAR_COLOR: BarColorConfig = {
  gradient: 'linear-gradient(180deg, #60a5fa 0%, #2563eb 100%)',
  shadow: '0 4px 12px -2px rgba(37, 99, 235, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
  textColor: 'text-blue-600',
};

const DEFAULT_FORMAT_VALUE = (value: number) => value.toLocaleString();

// Size-based styling configurations
const SIZE_CONFIG = {
  default: {
    // Value labels above bars
    valueLabelClass: 'text-sm font-bold mb-1.5',
    // Stacked bar total label
    stackedTotalClass: 'text-sm font-bold text-indigo-600',
    // Y-axis labels
    yAxisClass: 'text-sm text-stone-500 font-semibold pr-4 py-1',
    // X-axis labels
    xAxisClass: 'text-sm font-semibold',
    xAxisCurrentClass: 'text-stone-900 bg-stone-900/5 px-3 py-1 rounded-full',
    // Bar dimensions
    singleBarMaxWidth: 'clamp(48px, 6vw, 80px)',
    singleBarWidth: '65%',
    stackedBarMaxWidth: '50px',
    stackedBarInnerWidth: '36px',
    // Container padding
    chartPadding: 'px-2',
    stackedChartPadding: 'px-4',
    xAxisPadding: 'pl-12',
    // Legend
    legendDotSize: 'w-4 h-4',
    legendTextClass: 'text-stone-600 text-base font-medium',
    // Goal line
    goalLineWidth: 'border-t-2',
    // Shadows
    singleBarShadowScale: 1,
    stackedBarShadowScale: 1,
  },
  lg: {
    // Value labels above bars - larger for expanded view
    valueLabelClass: 'text-lg sm:text-xl font-bold mb-2',
    // Stacked bar total label
    stackedTotalClass: 'text-lg sm:text-xl font-bold text-indigo-600',
    // Y-axis labels
    yAxisClass: 'text-base sm:text-lg text-stone-500 font-semibold pr-6 py-2',
    // X-axis labels
    xAxisClass: 'text-base sm:text-lg font-semibold',
    xAxisCurrentClass: 'text-stone-900 bg-stone-900/5 px-4 py-1.5 rounded-full',
    // Bar dimensions - wider for expanded view
    singleBarMaxWidth: 'clamp(60px, 8vw, 120px)',
    singleBarWidth: '70%',
    stackedBarMaxWidth: 'clamp(50px, 7vw, 90px)',
    stackedBarInnerWidth: '60px',
    // Container padding
    chartPadding: 'px-4',
    stackedChartPadding: 'px-6',
    xAxisPadding: 'pl-16',
    // Legend
    legendDotSize: 'w-5 h-5',
    legendTextClass: 'text-stone-600 text-lg font-medium',
    // Goal line
    goalLineWidth: 'border-t-[3px]',
    // Shadows - more prominent
    singleBarShadowScale: 1.3,
    stackedBarShadowScale: 1.2,
  },
} as const;

// -----------------------------------------------------------------------------
// COMPONENT
// -----------------------------------------------------------------------------

/**
 * BarChart - Premium custom bar chart component
 *
 * @example Single bar chart with goal line
 * ```tsx
 * <BarChart
 *   data={[
 *     { label: 'Jan', value: 142000 },
 *     { label: 'Feb', value: 156000 },
 *     { label: 'Mar', value: 148000 },
 *   ]}
 *   mode="single"
 *   goal={{ value: 150000 }}
 *   getBarColor={(value) => value >= 150000
 *     ? { gradient: 'linear-gradient(180deg, #34d399 0%, #059669 100%)', shadow: '...', textColor: 'text-emerald-600' }
 *     : { gradient: 'linear-gradient(180deg, #60a5fa 0%, #2563eb 100%)', shadow: '...', textColor: 'text-blue-600' }
 *   }
 *   formatValue={(v) => `$${(v/1000).toFixed(0)}k`}
 * />
 * ```
 *
 * @example Stacked bar chart
 * ```tsx
 * <BarChart
 *   data={[
 *     { label: 'Jan', Chen: 28000, Rodriguez: 32000, Patel: 24000 },
 *     { label: 'Feb', Chen: 30000, Rodriguez: 35000, Patel: 26000 },
 *   ]}
 *   mode="stacked"
 *   segments={[
 *     { key: 'Chen', label: 'Chen', color: '#7c3aed', gradient: 'linear-gradient(180deg, #a78bfa 0%, #7c3aed 100%)' },
 *     { key: 'Rodriguez', label: 'Rodriguez', color: '#0891b2', gradient: 'linear-gradient(180deg, #22d3ee 0%, #0891b2 100%)' },
 *     { key: 'Patel', label: 'Patel', color: '#d97706', gradient: 'linear-gradient(180deg, #fbbf24 0%, #d97706 100%)' },
 *   ]}
 *   stackOrder={['Patel', 'Rodriguez', 'Chen']}
 *   formatValue={(v) => `$${(v/1000).toFixed(0)}k`}
 *   showLegend
 * />
 * ```
 */
export const BarChart: React.FC<BarChartProps> = ({
  data,
  mode = 'single',
  size = 'default',
  getBarColor,
  segments = [],
  stackOrder,
  goal,
  maxValue: maxValueProp,
  yAxisLabels,
  formatValue = DEFAULT_FORMAT_VALUE,
  onHover,
  height = '320px',
  showLegend = false,
  className = '',
}) => {
  // Get size configuration
  const sizeConfig = SIZE_CONFIG[size];
  // ---------------------------------------------------------------------------
  // COMPUTED VALUES
  // ---------------------------------------------------------------------------

  // Calculate max value for scaling
  const maxValue = React.useMemo(() => {
    if (maxValueProp) return maxValueProp;

    let dataMax = 0;
    if (mode === 'single') {
      dataMax = Math.max(...data.map((d) => d.value || 0));
    } else {
      // Stacked mode: sum all segment values per data point
      const segmentKeys = stackOrder || segments.map((s) => s.key);
      dataMax = Math.max(
        ...data.map((d) =>
          segmentKeys.reduce((sum, key) => sum + ((d[key] as number) || 0), 0)
        )
      );
    }

    // Include goal in max calculation if present
    if (goal?.value) {
      dataMax = Math.max(dataMax, goal.value);
    }

    // Round up to nice number with buffer
    const magnitude = Math.pow(10, Math.floor(Math.log10(dataMax)));
    const rounded = Math.ceil(dataMax / magnitude) * magnitude;
    return rounded + magnitude * 0.2; // 20% buffer
  }, [data, mode, segments, stackOrder, goal, maxValueProp]);

  // Generate Y-axis labels
  const yLabels = React.useMemo(() => {
    if (Array.isArray(yAxisLabels)) return yAxisLabels;
    if (typeof yAxisLabels === 'function') return yAxisLabels(maxValue);

    // Default: 5 evenly spaced labels
    return [
      formatValue(maxValue),
      formatValue(maxValue * 0.75),
      formatValue(maxValue * 0.5),
      formatValue(maxValue * 0.25),
      formatValue(0),
    ];
  }, [yAxisLabels, maxValue, formatValue]);

  // Effective stack order
  const effectiveStackOrder = stackOrder || segments.map((s) => s.key);

  // Segment lookup map
  const segmentMap = React.useMemo(() => {
    const map: Record<string, SegmentConfig> = {};
    segments.forEach((s) => {
      map[s.key] = s;
    });
    return map;
  }, [segments]);

  // ---------------------------------------------------------------------------
  // RENDER HELPERS
  // ---------------------------------------------------------------------------

  const renderSingleBars = () => (
    <div className={`absolute inset-0 flex items-end justify-around ${sizeConfig.chartPadding}`}>
      {data.map((item, idx) => {
        const value = item.value || 0;
        const heightPercent = (value / maxValue) * 100;
        const isCurrentItem = idx === data.length - 1;
        const colorConfig = getBarColor
          ? getBarColor(value, idx)
          : DEFAULT_SINGLE_BAR_COLOR;

        return (
          <div
            key={item.label}
            className="group relative flex flex-col items-center justify-end h-full"
            style={{ flex: '1', maxWidth: sizeConfig.singleBarMaxWidth }}
          >
            <div className="flex items-end w-full justify-center h-full">
              <div
                className="relative flex flex-col items-center justify-end h-full"
                style={{ width: sizeConfig.singleBarWidth }}
              >
                {/* Value label */}
                <span
                  className={`${sizeConfig.valueLabelClass} ${colorConfig.textColor}`}
                >
                  {formatValue(value)}
                </span>
                {/* Bar */}
                <div
                  className={`w-full rounded-t-xl transition-all duration-300 cursor-pointer relative overflow-hidden ${
                    isCurrentItem
                      ? 'ring-2 ring-offset-2 ring-current/40'
                      : 'hover:brightness-110'
                  }`}
                  style={{
                    height: `${heightPercent}%`,
                    background: colorConfig.gradient,
                    boxShadow: colorConfig.shadow,
                  }}
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderStackedBars = () => (
    <div className={`absolute inset-0 flex items-end justify-around gap-1 ${sizeConfig.stackedChartPadding}`}>
      {data.map((item, idx) => {
        // Calculate total for this bar
        const total = effectiveStackOrder.reduce(
          (sum, key) => sum + ((item[key] as number) || 0),
          0
        );
        const totalHeightPercent = (total / maxValue) * 100;
        const isCurrentItem = idx === data.length - 1;

        return (
          <div
            key={item.label}
            className="group relative flex-1 flex flex-col items-center justify-end h-full"
            style={{ maxWidth: sizeConfig.stackedBarMaxWidth }}
          >
            {/* Total value label */}
            <div className="mb-2 z-20">
              <span className={sizeConfig.stackedTotalClass}>
                {formatValue(total)}
              </span>
            </div>
            {/* Stacked Bar */}
            <div
              className="relative rounded-t-md overflow-hidden transition-all duration-300 w-full"
              style={{
                height: `${totalHeightPercent}%`,
                maxWidth: sizeConfig.stackedBarInnerWidth,
                boxShadow: isCurrentItem
                  ? `0 ${4 * sizeConfig.stackedBarShadowScale}px ${12 * sizeConfig.stackedBarShadowScale}px -2px rgba(124, 58, 237, 0.3)`
                  : `0 ${2 * sizeConfig.stackedBarShadowScale}px ${8 * sizeConfig.stackedBarShadowScale}px -2px rgba(0,0,0,0.1)`,
              }}
            >
              {effectiveStackOrder.map((segmentKey) => {
                const value = (item[segmentKey] as number) || 0;
                const segmentHeightPercent =
                  total > 0 ? (value / total) * 100 : 0;
                const segment = segmentMap[segmentKey];

                if (!segment) return null;

                return (
                  <div
                    key={segmentKey}
                    className="w-full cursor-pointer transition-all duration-200 hover:brightness-110"
                    style={{
                      height: `${segmentHeightPercent}%`,
                      background: segment.gradient,
                      borderBottom: '1px solid rgba(255,255,255,0.2)',
                    }}
                    onMouseEnter={() =>
                      onHover?.({
                        label: item.label,
                        segment: segmentKey,
                        segmentLabel: segment.label,
                        value,
                        color: segment.color,
                      })
                    }
                    onMouseLeave={() => onHover?.(null)}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  return (
    <div className={`flex flex-col ${className}`} style={{ height }}>
      <div className="flex flex-1 min-h-0">
        {/* Y-axis labels */}
        <div className={`flex flex-col justify-between ${sizeConfig.yAxisClass}`}>
          {yLabels.map((label, idx) => (
            <span key={idx}>{label}</span>
          ))}
        </div>

        {/* Chart area */}
        <div className="flex-1 relative">
          {/* Background grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {yLabels.map((_, i) => (
              <div key={i} className="border-t border-stone-200/60 w-full" />
            ))}
          </div>

          {/* Goal line */}
          {goal?.value && goal.show !== false && mode === 'single' && (
            <div
              className="absolute left-0 right-0 z-10 pointer-events-none flex items-center"
              style={{
                top: `${((maxValue - goal.value) / maxValue) * 100}%`,
              }}
            >
              <div className={`flex-1 ${sizeConfig.goalLineWidth} border-dashed border-amber-400`} />
            </div>
          )}

          {/* Bars */}
          {mode === 'single' ? renderSingleBars() : renderStackedBars()}
        </div>
      </div>

      {/* X-axis labels */}
      <div className={`flex mt-4 ${sizeConfig.xAxisPadding} flex-shrink-0`}>
        <div className={`flex-1 flex justify-around ${sizeConfig.chartPadding}`}>
          {data.map((item, idx) => {
            const isCurrentItem = idx === data.length - 1;
            return (
              <div
                key={item.label}
                className="text-center"
                style={{ flex: '1', maxWidth: sizeConfig.singleBarMaxWidth }}
              >
                <span
                  className={`${sizeConfig.xAxisClass} ${
                    isCurrentItem
                      ? sizeConfig.xAxisCurrentClass
                      : 'text-stone-500'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend (stacked mode only) */}
      {showLegend && mode === 'stacked' && segments.length > 0 && (
        <div className="flex items-center gap-5 mt-4 pt-3 border-t border-stone-100 flex-wrap justify-center">
          {segments.map((segment) => (
            <div key={segment.key} className="flex items-center gap-2">
              <div
                className={`${sizeConfig.legendDotSize} rounded-full`}
                style={{ backgroundColor: segment.color }}
              />
              <span className={sizeConfig.legendTextClass}>
                {segment.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BarChart;
