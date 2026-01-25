import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  LabelList,
} from 'recharts';

// =============================================================================
// DIVERGING BAR CHART COMPONENT
// =============================================================================
// Design system component for diverging bar charts where bars extend both
// above and below a zero reference line. Perfect for showing flows like
// new vs churned, gains vs losses, positive vs negative changes.
// =============================================================================

export interface DivergingBarDataPoint {
  /** Label for this data point (e.g., month name) */
  label: string;
  /** Positive value (shown above zero line) */
  positive: number;
  /** Negative value (shown below zero line) - provide as positive number, will be negated */
  negative: number;
}

export interface DivergingBarConfig {
  /** Display label for legend/tooltip */
  label: string;
  /** Start color for gradient */
  color: string;
  /** End color for gradient (darker) */
  colorEnd: string;
}

export interface DivergingBarChartProps {
  /** Chart data points */
  data: DivergingBarDataPoint[];
  /** X-axis data key (defaults to 'label') */
  xAxisKey?: string;
  /** Configuration for positive bars */
  positiveConfig: DivergingBarConfig;
  /** Configuration for negative bars */
  negativeConfig: DivergingBarConfig;
  /** Chart height (defaults to '100%') */
  height?: string | number;
  /** Show labels on bars (defaults to true) */
  showLabels?: boolean;
  /** Format positive label (defaults to '+{value}') */
  formatPositiveLabel?: (value: number) => string;
  /** Format negative label (defaults to '-{value}') */
  formatNegativeLabel?: (value: number) => string;
  /** Format tooltip value */
  tooltipFormatter?: (value: number, name: string) => [string | number, string];
  /** Y-axis domain [min, max] - if not provided, auto-calculated */
  yDomain?: [number, number];
}

/**
 * DivergingBarChart - Design system diverging bar chart
 *
 * Features:
 * - Positive bars extend above zero line
 * - Negative bars extend below zero line
 * - Beautiful gradients and shadows
 * - Consistent dark tooltip styling
 * - Labels showing +X and -X values
 *
 * @example Basic usage (Client Movement)
 * ```tsx
 * <DivergingBarChart
 *   data={[
 *     { label: 'Jan', positive: 12, negative: 5 },
 *     { label: 'Feb', positive: 8, negative: 3 },
 *   ]}
 *   positiveConfig={{
 *     label: 'New Clients',
 *     color: '#34d399',
 *     colorEnd: '#10b981',
 *   }}
 *   negativeConfig={{
 *     label: 'Churned',
 *     color: '#fb7185',
 *     colorEnd: '#f43f5e',
 *   }}
 * />
 * ```
 */
export const DivergingBarChart: React.FC<DivergingBarChartProps> = ({
  data,
  xAxisKey = 'label',
  positiveConfig,
  negativeConfig,
  height = '100%',
  showLabels = true,
  formatPositiveLabel = (value) => `+${value}`,
  formatNegativeLabel = (value) => `-${Math.abs(value)}`,
  tooltipFormatter,
  yDomain,
}) => {
  // Transform data to have negative values for the negative bars
  const chartData = data.map((item) => ({
    ...item,
    negativeValue: -item.negative,
  }));

  // Generate unique IDs for gradients and filters
  const positiveGradientId = 'divergingPositiveGradient';
  const negativeGradientId = 'divergingNegativeGradient';
  const shadowFilterId = 'divergingBarShadow';

  // Default tooltip formatter
  const defaultTooltipFormatter = (value: number, name: string): [string | number, string] => {
    const absValue = Math.abs(value);
    if (name === 'positive') {
      return [absValue, positiveConfig.label];
    }
    return [absValue, negativeConfig.label];
  };

  const formatter = tooltipFormatter || defaultTooltipFormatter;

  return (
    <div style={{ width: '100%', height: typeof height === 'number' ? height : height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 10, bottom: 10, left: 0 }}
        >
        {/* Gradient and shadow definitions */}
        <defs>
          {/* Positive bar gradient (top to bottom) */}
          <linearGradient id={positiveGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={positiveConfig.color} stopOpacity={1} />
            <stop offset="100%" stopColor={positiveConfig.colorEnd} stopOpacity={1} />
          </linearGradient>

          {/* Negative bar gradient (top to bottom - lighter at top near zero, darker at tip) */}
          <linearGradient id={negativeGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={negativeConfig.color} stopOpacity={1} />
            <stop offset="100%" stopColor={negativeConfig.colorEnd} stopOpacity={1} />
          </linearGradient>

          {/* Shadow filter */}
          <filter id={shadowFilterId} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Grid lines */}
        <CartesianGrid strokeDasharray="4 4" stroke="#e7e5e4" vertical={false} />

        {/* X-axis */}
        <XAxis
          dataKey={xAxisKey}
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#57534e', fontSize: 15, fontWeight: 600 }}
          dy={8}
          height={30}
        />

        {/* Y-axis - shows absolute values */}
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#78716c', fontSize: 14, fontWeight: 600 }}
          tickFormatter={(value) => Math.abs(value).toString()}
          width={25}
          domain={yDomain}
        />

        {/* Zero reference line */}
        <ReferenceLine y={0} stroke="#78716c" strokeWidth={2} />

        {/* Tooltip */}
        <Tooltip
          contentStyle={{
            backgroundColor: '#1c1917',
            border: 'none',
            borderRadius: '16px',
            padding: '16px 20px',
            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.4)',
          }}
          labelStyle={{ color: '#a8a29e', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}
          itemStyle={{ color: '#fff', fontSize: '18px', fontWeight: 700, padding: '4px 0' }}
          formatter={formatter}
        />

        {/* Positive bars (above zero) */}
        <Bar
          dataKey="positive"
          fill={`url(#${positiveGradientId})`}
          radius={[8, 8, 0, 0]}
          maxBarSize={50}
          style={{ filter: `url(#${shadowFilterId})` }}
        >
          {showLabels && (
            <LabelList
              dataKey="positive"
              position="top"
              style={{ fill: positiveConfig.colorEnd, fontSize: '14px', fontWeight: 700 }}
              offset={10}
              formatter={formatPositiveLabel}
            />
          )}
        </Bar>

        {/* Negative bars (below zero) - position="bottom" places at bar tip, positive offset pushes further down */}
        <Bar
          dataKey="negativeValue"
          fill={`url(#${negativeGradientId})`}
          radius={[8, 8, 0, 0]}
          maxBarSize={50}
          style={{ filter: `url(#${shadowFilterId})` }}
        >
          {showLabels && (
            <LabelList
              dataKey="negativeValue"
              position="bottom"
              style={{ fill: negativeConfig.colorEnd, fontSize: '14px', fontWeight: 700 }}
              offset={10}
              formatter={formatNegativeLabel}
            />
          )}
        </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DivergingBarChart;
