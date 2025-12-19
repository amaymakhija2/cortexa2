import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LabelList,
} from 'recharts';

// =============================================================================
// GROUPED BAR CHART COMPONENT
// =============================================================================
// Design system component for grouped bar charts where multiple bars are shown
// side by side for each category. Perfect for comparing two related metrics
// like consultations booked vs clients converted.
// =============================================================================

export interface GroupedBarDataPoint {
  /** Label for this data point (e.g., month name) */
  label: string;
  /** First bar value */
  value1: number;
  /** Second bar value */
  value2: number;
}

export interface GroupedBarConfig {
  /** Display label for legend/tooltip */
  label: string;
  /** Start color for gradient */
  color: string;
  /** End color for gradient (darker) */
  colorEnd: string;
}

export interface GroupedBarChartProps {
  /** Chart data points */
  data: GroupedBarDataPoint[];
  /** X-axis data key (defaults to 'label') */
  xAxisKey?: string;
  /** Configuration for first bar series */
  bar1Config: GroupedBarConfig;
  /** Configuration for second bar series */
  bar2Config: GroupedBarConfig;
  /** Chart height (defaults to '100%') */
  height?: string | number;
  /** Show labels on bars (defaults to true) */
  showLabels?: boolean;
  /** Show legend (defaults to true) */
  showLegend?: boolean;
  /** Format tooltip value */
  tooltipFormatter?: (value: number, name: string) => [string | number, string];
  /** Y-axis domain [min, max] - if not provided, auto-calculated */
  yDomain?: [number, number];
}

/**
 * GroupedBarChart - Design system grouped bar chart
 *
 * Features:
 * - Two bars side by side for each category
 * - Beautiful gradients and shadows
 * - Consistent dark tooltip styling
 * - Legend showing both series
 *
 * @example Basic usage (Consultation Pipeline)
 * ```tsx
 * <GroupedBarChart
 *   data={[
 *     { label: 'Jan', value1: 5, value2: 3 },
 *     { label: 'Feb', value1: 6, value2: 4 },
 *   ]}
 *   bar1Config={{
 *     label: 'Consults Booked',
 *     color: '#22d3ee',
 *     colorEnd: '#06b6d4',
 *   }}
 *   bar2Config={{
 *     label: 'Clients Converted',
 *     color: '#34d399',
 *     colorEnd: '#10b981',
 *   }}
 * />
 * ```
 */
export const GroupedBarChart: React.FC<GroupedBarChartProps> = ({
  data,
  xAxisKey = 'label',
  bar1Config,
  bar2Config,
  height = '100%',
  showLabels = true,
  showLegend = true,
  tooltipFormatter,
  yDomain,
}) => {
  // Generate unique IDs for gradients and filters
  const bar1GradientId = 'groupedBar1Gradient';
  const bar2GradientId = 'groupedBar2Gradient';
  const shadowFilterId = 'groupedBarShadow';

  // Default tooltip formatter
  const defaultTooltipFormatter = (value: number, name: string): [string | number, string] => {
    if (name === 'value1') {
      return [value, bar1Config.label];
    }
    return [value, bar2Config.label];
  };

  const formatter = tooltipFormatter || defaultTooltipFormatter;

  // Custom legend renderer
  const renderLegend = () => {
    return (
      <div className="flex items-center justify-center gap-6 mt-2">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ background: `linear-gradient(180deg, ${bar1Config.color}, ${bar1Config.colorEnd})` }}
          />
          <span className="text-sm font-medium text-stone-600">{bar1Config.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ background: `linear-gradient(180deg, ${bar2Config.color}, ${bar2Config.colorEnd})` }}
          />
          <span className="text-sm font-medium text-stone-600">{bar2Config.label}</span>
        </div>
      </div>
    );
  };

  return (
    <div style={{ width: '100%', height: typeof height === 'number' ? height : height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, bottom: showLegend ? 10 : 10, left: 30 }}
          barCategoryGap="20%"
        >
          {/* Gradient and shadow definitions */}
          <defs>
            {/* First bar gradient */}
            <linearGradient id={bar1GradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={bar1Config.color} stopOpacity={1} />
              <stop offset="100%" stopColor={bar1Config.colorEnd} stopOpacity={1} />
            </linearGradient>

            {/* Second bar gradient */}
            <linearGradient id={bar2GradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={bar2Config.color} stopOpacity={1} />
              <stop offset="100%" stopColor={bar2Config.colorEnd} stopOpacity={1} />
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
            tick={{ fill: '#57534e', fontSize: 13, fontWeight: 600 }}
            dy={8}
            height={30}
          />

          {/* Y-axis */}
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#78716c', fontSize: 12, fontWeight: 600 }}
            width={30}
            domain={yDomain}
          />

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
            itemStyle={{ color: '#fff', fontSize: '16px', fontWeight: 700, padding: '4px 0' }}
            formatter={formatter}
          />

          {/* Legend */}
          {showLegend && <Legend content={renderLegend} />}

          {/* First bar series */}
          <Bar
            dataKey="value1"
            fill={`url(#${bar1GradientId})`}
            radius={[6, 6, 0, 0]}
            maxBarSize={35}
            style={{ filter: `url(#${shadowFilterId})` }}
          >
            {showLabels && (
              <LabelList
                dataKey="value1"
                position="top"
                style={{ fill: bar1Config.colorEnd, fontSize: '12px', fontWeight: 700 }}
                offset={6}
              />
            )}
          </Bar>

          {/* Second bar series */}
          <Bar
            dataKey="value2"
            fill={`url(#${bar2GradientId})`}
            radius={[6, 6, 0, 0]}
            maxBarSize={35}
            style={{ filter: `url(#${shadowFilterId})` }}
          >
            {showLabels && (
              <LabelList
                dataKey="value2"
                position="top"
                style={{ fill: bar2Config.colorEnd, fontSize: '12px', fontWeight: 700 }}
                offset={6}
              />
            )}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GroupedBarChart;
