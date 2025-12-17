import React, { useState, useEffect } from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Legend } from '../Legend';

// =============================================================================
// LINE CHART COMPONENT
// =============================================================================
// Design system wrapper for Recharts LineChart with consistent thick styling.
// Now uses the unified Legend component for consistent styling across charts.
// =============================================================================

export interface LineConfig {
  /** Data key for this line */
  dataKey: string;
  /** Line color */
  color: string;
  /** Active/hover color (defaults to slightly darker) */
  activeColor?: string;
  /** Display name for legend/tooltip */
  name?: string;
}

export interface ReferenceLineConfig {
  /** Y-axis value for the reference line */
  value: number;
  /** Label to display (used for accessibility, not shown on chart) */
  label: string;
  /** Line color (defaults to stone-400) */
  color?: string;
  /** Whether to use dashed line (defaults to true) */
  dashed?: boolean;
}

export interface LineChartProps {
  /** Chart data */
  data: Record<string, any>[];
  /** X-axis data key */
  xAxisKey: string;
  /** Line configurations */
  lines: LineConfig[];
  /** Y-axis domain [min, max] */
  yDomain?: [number, number];
  /** Format Y-axis ticks */
  yTickFormatter?: (value: number) => string;
  /** Format tooltip values */
  tooltipFormatter?: (value: number, name: string) => [string, string];
  /** Show legend */
  showLegend?: boolean;
  /** Chart height */
  height?: number | `${number}%`;
  /** Show area fill under line */
  showAreaFill?: boolean;
  /** Area fill gradient ID (for custom gradients) */
  areaFillId?: string;
  /** Reference lines (horizontal lines, e.g., industry average, last year) */
  referenceLines?: ReferenceLineConfig[];
  /** Whether to show reference lines on the chart (defaults to true) */
  showReferenceLines?: boolean;
  /** Whether to animate only on initial mount (defaults to true to prevent re-animation on parent re-renders) */
  animateOnce?: boolean;
}

/**
 * LineChart - Design system line chart with consistent thick styling
 *
 * Features:
 * - Thick lines (strokeWidth: 4)
 * - Large dots (r: 7) with white stroke
 * - Large active dots (r: 10)
 * - Consistent tooltip styling
 * - Support for multiple lines
 *
 * @example Single line
 * ```tsx
 * <LineChart
 *   data={data}
 *   xAxisKey="month"
 *   lines={[{ dataKey: 'value', color: '#10b981' }]}
 *   yDomain={[0, 100]}
 *   yTickFormatter={(v) => `${v}%`}
 * />
 * ```
 *
 * @example Multiple lines
 * ```tsx
 * <LineChart
 *   data={data}
 *   xAxisKey="month"
 *   lines={[
 *     { dataKey: 'clinician', color: '#3b82f6', name: 'Clinician' },
 *     { dataKey: 'supervisor', color: '#f59e0b', name: 'Supervisor' },
 *   ]}
 *   showLegend
 * />
 * ```
 */
export const LineChart: React.FC<LineChartProps> = ({
  data,
  xAxisKey,
  lines,
  yDomain,
  yTickFormatter,
  tooltipFormatter,
  showLegend = false,
  height = '100%' as const,
  showAreaFill = false,
  areaFillId,
  referenceLines = [],
  showReferenceLines = true,
  animateOnce = true,
}) => {
  // Track if initial animation has completed to prevent re-animation on re-renders
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (animateOnce && !hasAnimated) {
      // Mark animation as complete after the animation duration
      const timer = setTimeout(() => setHasAnimated(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [animateOnce, hasAnimated]);

  // Only animate on first render if animateOnce is true
  const shouldAnimate = animateOnce ? !hasAnimated : true;

  // Build legend items from line configs
  const legendItems = lines.map((line) => ({
    label: line.name || line.dataKey,
    color: line.color,
    type: 'line' as const,
  }));

  return (
    <div className="flex flex-col h-full w-full">
      {/* Legend - positioned above chart using unified Legend component */}
      {showLegend && (
        <div className="flex justify-end mb-2 flex-shrink-0">
          <Legend
            items={legendItems}
            variant="chart"
            size="md"
          />
        </div>
      )}

      {/* Chart */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart data={data} margin={{ top: 10, right: 10, bottom: 5, left: 0 }}>
        {/* Area fill gradient definitions */}
        {showAreaFill && (
          <defs>
            {lines.map((line) => (
              <linearGradient
                key={`gradient-${line.dataKey}`}
                id={areaFillId || `lineGradient-${line.dataKey}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={line.color} stopOpacity={0.25} />
                <stop offset="100%" stopColor={line.color} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
        )}

        <CartesianGrid strokeDasharray="4 4" stroke="#e7e5e4" vertical={false} />

        {/* Clean reference lines without labels (legend shown in card header) */}
        {showReferenceLines && referenceLines.map((refLine, idx) => {
          const color = refLine.color || '#a8a29e';
          return (
            <ReferenceLine
              key={`ref-${idx}`}
              y={refLine.value}
              stroke={color}
              strokeWidth={2}
              strokeDasharray={refLine.dashed !== false ? '8 5' : undefined}
              strokeOpacity={0.8}
            />
          );
        })}

        <XAxis
          dataKey={xAxisKey}
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#57534e', fontSize: 14, fontWeight: 600 }}
          dy={8}
          height={40}
        />

        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: lines[0]?.color || '#57534e', fontSize: 13, fontWeight: 700 }}
          domain={yDomain}
          tickFormatter={yTickFormatter}
          width={45}
        />

        <Tooltip
          contentStyle={{
            backgroundColor: '#1c1917',
            border: 'none',
            borderRadius: '16px',
            padding: '16px 20px',
            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.4)',
          }}
          labelStyle={{ color: '#a8a29e', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}
          itemStyle={{ color: '#fff', fontSize: '20px', fontWeight: 700 }}
          formatter={tooltipFormatter}
        />

        {lines.map((line, idx) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            name={line.name || line.dataKey}
            stroke={line.color}
            strokeWidth={4}
            dot={{ fill: line.color, r: 7, strokeWidth: 4, stroke: '#fff' }}
            activeDot={{ r: 10, strokeWidth: 4, stroke: '#fff', fill: line.activeColor || line.color }}
            fill={showAreaFill ? `url(#${areaFillId || `lineGradient-${line.dataKey}`})` : undefined}
            isAnimationActive={shouldAnimate}
            animationDuration={800}
            animationBegin={idx * 150}
            animationEasing="ease-out"
          />
        ))}
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LineChart;
