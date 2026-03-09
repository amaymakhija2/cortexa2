import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, TrendingDown, Minus, DollarSign, Calendar, Users } from 'lucide-react';
import { FONT, INK, EASE, formatRevenue, REVENUE_DEFAULTS, ChartTooltip } from './shared';
import type { Clinician } from './shared';

// =============================================================================
// PRACTICE INSIGHTS MODAL - The Executive Summary
// =============================================================================
// A read-only view of practice-level aggregates over time. Same visual language
// as GoalEditorModal but without the drag functionality. Shows the big picture:
// where we've been, where we are, and where the current goals will take us.
// =============================================================================

// =============================================================================
// TYPES
// =============================================================================

export type PracticeMetric = 'revenue' | 'sessions' | 'clients';

interface MonthData {
  month: string;
  label: string;
  shortLabel: string;
  goal: number;
  actual?: number;
  isPast: boolean;
  isCurrent: boolean;
}

interface ClinicianContribution {
  id: string;
  name: string;
  initials: string;
  color: string;
  value: number;
  percentage: number;
}

interface PracticeInsightsModalProps {
  metric: PracticeMetric;
  clinicians: Clinician[];
  onClose: () => void;
}

// =============================================================================
// COLORS
// =============================================================================

const COLORS = {
  actual: '#D4634B',
  actualLight: '#E8857A',
  goalPast: '#9A8B7A',
  goalCurrent: INK.gold,
  goalFuture: INK.emerald,
  positive: '#2D8A6E',
  negative: '#C4553A',
  neutral: INK.muted,
};

// =============================================================================
// HELPERS
// =============================================================================

function getMonthRange(): { start: Date; end: Date; current: Date } {
  const now = new Date();
  const current = new Date(now.getFullYear(), now.getMonth(), 1);
  const start = new Date(current);
  start.setMonth(start.getMonth() - 6);
  const end = new Date(current);
  end.setMonth(end.getMonth() + 5);
  return { start, end, current };
}

function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

function formatShortMonth(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short' });
}

function formatMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function generatePracticeMonthData(
  clinicians: Clinician[],
  metric: PracticeMetric
): MonthData[] {
  const { start, end, current } = getMonthRange();
  const months: MonthData[] = [];
  const activeClinicians = clinicians.filter(c => c.isActive);

  // Calculate current totals
  const currentSessionsGoal = activeClinicians.reduce((sum, c) => sum + c.sessionGoal, 0);
  const currentClientsGoal = activeClinicians.reduce((sum, c) => sum + c.clientGoal, 0);

  // Convert to monthly values based on metric
  const getMonthlyGoal = (): number => {
    switch (metric) {
      case 'revenue':
        // sessions/week * 4.33 weeks/month * avg rate
        return currentSessionsGoal * 4.33 * REVENUE_DEFAULTS.avgRatePerSession;
      case 'sessions':
        // sessions/week * 4.33 weeks/month
        return Math.round(currentSessionsGoal * 4.33);
      case 'clients':
        return currentClientsGoal;
    }
  };

  const monthlyGoal = getMonthlyGoal();

  const cursor = new Date(start);
  while (cursor <= end) {
    const key = formatMonthKey(cursor);
    const isPast = cursor < current;
    const isCurrent = cursor.getTime() === current.getTime();

    // Generate realistic mock data for past months
    let actual: number | undefined;
    if (isPast || isCurrent) {
      // Simulate some variance and seasonality
      const variance = Math.random() * 0.2 - 0.05;
      const seasonalFactor = Math.sin((cursor.getMonth() / 12) * Math.PI * 2) * 0.08;
      const growthTrend = (cursor.getMonth() - start.getMonth()) * 0.015; // Slight upward trend
      actual = Math.round(monthlyGoal * (0.92 + variance + seasonalFactor + growthTrend));
    }

    months.push({
      month: key,
      label: formatMonthLabel(cursor),
      shortLabel: formatShortMonth(cursor),
      goal: Math.round(monthlyGoal),
      actual,
      isPast,
      isCurrent,
    });

    cursor.setMonth(cursor.getMonth() + 1);
  }

  return months;
}

function computeContributions(
  clinicians: Clinician[],
  metric: PracticeMetric,
  maxToShow: number = 6
): { top: ClinicianContribution[]; other: { count: number; value: number; percentage: number } | null; total: number } {
  const activeClinicians = clinicians.filter(c => c.isActive);

  // Calculate value per clinician
  const withValues = activeClinicians.map(c => {
    let value: number;
    switch (metric) {
      case 'revenue':
        // Monthly revenue
        value = c.sessionGoal * 4.33 * REVENUE_DEFAULTS.avgRatePerSession;
        break;
      case 'sessions':
        // Monthly sessions
        value = Math.round(c.sessionGoal * 4.33);
        break;
      case 'clients':
        value = c.clientGoal;
        break;
    }
    return { ...c, contributionValue: value };
  });

  // Sort by contribution (highest first)
  withValues.sort((a, b) => b.contributionValue - a.contributionValue);

  // Calculate total
  const total = withValues.reduce((sum, c) => sum + c.contributionValue, 0);

  // Take top N
  const top = withValues.slice(0, maxToShow).map(c => ({
    id: c.id,
    name: c.name,
    initials: c.initials,
    color: c.color,
    value: Math.round(c.contributionValue),
    percentage: total > 0 ? Math.round((c.contributionValue / total) * 100) : 0,
  }));

  // Roll up the rest
  const remaining = withValues.slice(maxToShow);
  const other = remaining.length > 0
    ? {
        count: remaining.length,
        value: Math.round(remaining.reduce((sum, c) => sum + c.contributionValue, 0)),
        percentage: total > 0
          ? Math.round((remaining.reduce((sum, c) => sum + c.contributionValue, 0) / total) * 100)
          : 0,
      }
    : null;

  return { top, other, total: Math.round(total) };
}

// =============================================================================
// SPARKLINE - Elegant mini chart
// =============================================================================

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showArea?: boolean;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  width = 64,
  height = 24,
  color = INK.emerald,
  showArea = true,
}) => {
  if (data.length < 2) return null;

  const padding = 2;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Generate path
  const points = data.map((value, i) => {
    const x = padding + (i / (data.length - 1)) * chartWidth;
    const y = padding + (1 - (value - min) / range) * chartHeight;
    return { x, y };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(' ');

  const areaPath = showArea
    ? `${linePath} L ${points[points.length - 1].x.toFixed(2)} ${height - padding} L ${padding} ${height - padding} Z`
    : '';

  // Determine trend
  const trend = data[data.length - 1] > data[0] ? 'up' : data[data.length - 1] < data[0] ? 'down' : 'flat';
  const trendColor = trend === 'up' ? COLORS.positive : trend === 'down' ? COLORS.negative : COLORS.neutral;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
    >
      {/* Area fill */}
      {showArea && (
        <motion.path
          d={areaPath}
          fill={`url(#sparkline-gradient-${color.replace('#', '')})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}

      {/* Line */}
      <motion.path
        d={linePath}
        fill="none"
        stroke={trendColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />

      {/* End dot */}
      <motion.circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r={2.5}
        fill={trendColor}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 300 }}
      />

      {/* Gradient definition */}
      <defs>
        <linearGradient
          id={`sparkline-gradient-${color.replace('#', '')}`}
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <stop offset="0%" stopColor={trendColor} stopOpacity={0.15} />
          <stop offset="100%" stopColor={trendColor} stopOpacity={0.02} />
        </linearGradient>
      </defs>
    </svg>
  );
};

// =============================================================================
// STATIC BAR - Non-interactive bar for read-only view
// =============================================================================

interface StaticBarProps {
  value: number;
  minValue: number;
  maxValue: number;
  chartHeight: number;
  barWidth: number;
  color: string;
  index: number;
  isProjected?: boolean;
}

const StaticBar: React.FC<StaticBarProps> = ({
  value,
  minValue,
  maxValue,
  chartHeight,
  barWidth,
  color,
  index,
  isProjected = false,
}) => {
  const range = maxValue - minValue;
  const normalized = range > 0 ? (value - minValue) / range : 0.5;
  const height = Math.max(4, normalized * chartHeight);

  return (
    <motion.div
      data-bar
      className="rounded-t-[3px]"
      style={{
        width: barWidth,
        background: isProjected
          ? `repeating-linear-gradient(
              -45deg,
              ${color}40,
              ${color}40 2px,
              transparent 2px,
              transparent 4px
            )`
          : `linear-gradient(180deg, ${color} 0%, ${color}cc 100%)`,
        border: isProjected ? `1px dashed ${color}80` : 'none',
      }}
      initial={{ height: 0 }}
      animate={{ height }}
      transition={{
        delay: 0.1 + index * 0.02,
        duration: 0.5,
        ease: [0.34, 1.56, 0.64, 1],
      }}
    />
  );
};

// =============================================================================
// MONTH COLUMN - Read-only version
// =============================================================================

interface ReadOnlyMonthColumnProps {
  data: MonthData;
  index: number;
  maxValue: number;
  minValue: number;
  chartHeight: number;
  metric: PracticeMetric;
  formatValue: (v: number) => string;
  isSelected: boolean;
  onSelect: () => void;
}

const ReadOnlyMonthColumn: React.FC<ReadOnlyMonthColumnProps> = ({
  data,
  index,
  maxValue,
  minValue,
  chartHeight,
  metric,
  formatValue,
  isSelected,
  onSelect,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const showActual = data.actual !== undefined;
  const isProjected = !data.isPast && !data.isCurrent;

  const columnWidth = 72;
  const barWidth = showActual ? 14 : 20;

  // Variance calculation
  const variance = data.actual !== undefined ? data.actual - data.goal : 0;
  const variancePercent = data.goal > 0 ? Math.round((variance / data.goal) * 100) : 0;

  // Bar color
  const getGoalColor = () => {
    if (data.isCurrent) return COLORS.goalCurrent;
    if (data.isPast) return COLORS.goalPast;
    return COLORS.goalFuture;
  };

  // Accent color for selection/hover - different for each month type
  const getAccentColor = () => {
    if (data.isPast) return COLORS.actual; // Past months use actual color
    if (data.isCurrent) return INK.gold;
    return COLORS.goalFuture;
  };
  const accentColor = getAccentColor();

  // Build tooltip values
  const tooltipValues = [];
  if (showActual) {
    tooltipValues.push({
      label: 'Actual',
      value: formatValue(data.actual!),
      color: COLORS.actual,
      isPrimary: true,
    });
  }
  tooltipValues.push({
    label: data.isPast ? 'Goal' : (data.isCurrent ? 'Goal' : 'Projected'),
    value: formatValue(data.goal),
    color: getGoalColor(),
    isPrimary: !showActual,
  });

  return (
    <motion.div
      className="flex flex-col items-center relative cursor-pointer"
      style={{ width: columnWidth }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.35 }}
    >
      {/* Bar area with tooltip positioned above */}
      <div
        className="relative flex items-end justify-center gap-[3px]"
        style={{ height: chartHeight, width: columnWidth }}
      >
        {/* Tooltip - positioned above bars */}
        <AnimatePresence>
          {isHovered && (
            <ChartTooltip
              title={data.label}
              values={tooltipValues}
              variance={showActual ? { value: variance, percent: variancePercent } : undefined}
              hint="Click for breakdown"
              position="above"
            />
          )}
        </AnimatePresence>

        {/* Actual bar */}
        {showActual && (
          <StaticBar
            value={data.actual!}
            minValue={minValue}
            maxValue={maxValue}
            chartHeight={chartHeight}
            barWidth={barWidth}
            color={COLORS.actual}
            index={index}
          />
        )}

        {/* Goal/Projected bar */}
        <StaticBar
          value={data.goal}
          minValue={minValue}
          maxValue={maxValue}
          chartHeight={chartHeight}
          barWidth={barWidth}
          color={getGoalColor()}
          index={index}
          isProjected={isProjected}
        />
      </div>

      {/* Month label and indicator - unified design */}
      <div className="mt-3 flex flex-col items-center">
        <span
          style={{
            fontFamily: FONT.sans,
            fontSize: 11,
            fontWeight: isSelected || data.isCurrent ? 600 : 400,
            color: isSelected ? accentColor : data.isCurrent ? INK.black : data.isPast ? INK.muted : INK.faded,
            transition: 'color 0.15s ease',
          }}
        >
          {data.shortLabel}
        </span>

        {/* Indicator line - shows for all months */}
        <motion.div
          className="mt-1.5 rounded-full"
          style={{
            backgroundColor: isSelected ? accentColor : (isHovered ? accentColor : INK.rule),
            height: isSelected ? 3 : 2,
            width: isSelected ? 24 : 16,
          }}
          animate={{
            width: isSelected ? 24 : (isHovered ? 20 : 16),
            opacity: 1,
          }}
          transition={{ duration: 0.15 }}
        />
      </div>
    </motion.div>
  );
};

// =============================================================================
// Y-AXIS
// =============================================================================

interface YAxisProps {
  minValue: number;
  maxValue: number;
  chartHeight: number;
  metric: PracticeMetric;
  formatValue: (v: number) => string;
}

const YAxis: React.FC<YAxisProps> = ({ minValue, maxValue, chartHeight, metric, formatValue }) => {
  const steps = 5;
  const range = maxValue - minValue;
  const stepValue = range / (steps - 1);

  return (
    <div
      className="relative flex flex-col justify-between items-end pr-3"
      style={{ height: chartHeight, width: 64 }}
    >
      {Array.from({ length: steps }).map((_, i) => {
        const value = maxValue - i * stepValue;
        return (
          <div key={i} className="flex items-center">
            <span
              style={{
                fontFamily: FONT.mono,
                fontSize: 10,
                color: INK.ghost,
              }}
            >
              {formatValue(value)}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// =============================================================================
// CONTRIBUTION BAR - Horizontal bar showing clinician contribution
// =============================================================================

interface ContributionBarProps {
  contribution: ClinicianContribution;
  maxValue: number;
  formatValue: (v: number) => string;
  index: number;
}

const ContributionBar: React.FC<ContributionBarProps> = ({
  contribution,
  maxValue,
  formatValue,
  index,
}) => {
  const percentage = maxValue > 0 ? (contribution.value / maxValue) * 100 : 0;

  return (
    <motion.div
      className="flex items-center gap-3"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.05, duration: 0.4 }}
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
        style={{
          background: `linear-gradient(135deg, ${contribution.color} 0%, ${contribution.color}cc 100%)`,
        }}
      >
        {contribution.initials}
      </div>

      {/* Name */}
      <div className="w-32 flex-shrink-0">
        <span
          style={{
            fontFamily: FONT.sans,
            fontSize: 13,
            fontWeight: 500,
            color: INK.body,
          }}
        >
          {contribution.name}
        </span>
      </div>

      {/* Bar */}
      <div className="flex-1 h-6 rounded-lg overflow-hidden" style={{ backgroundColor: INK.cream }}>
        <motion.div
          className="h-full rounded-lg"
          style={{
            background: `linear-gradient(90deg, ${contribution.color}40 0%, ${contribution.color}20 100%)`,
            borderLeft: `3px solid ${contribution.color}`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ delay: 0.4 + index * 0.05, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        />
      </div>

      {/* Value */}
      <div className="w-20 text-right flex-shrink-0">
        <span
          style={{
            fontFamily: FONT.mono,
            fontSize: 14,
            fontWeight: 600,
            color: INK.black,
          }}
        >
          {formatValue(contribution.value)}
        </span>
      </div>

      {/* Percentage */}
      <div className="w-12 text-right flex-shrink-0">
        <span
          style={{
            fontFamily: FONT.mono,
            fontSize: 12,
            color: INK.muted,
          }}
        >
          {contribution.percentage}%
        </span>
      </div>
    </motion.div>
  );
};

// =============================================================================
// OTHER ROLLUP - The "and N others" row
// =============================================================================

interface OtherRollupProps {
  count: number;
  value: number;
  percentage: number;
  maxValue: number;
  formatValue: (v: number) => string;
  topCount: number;
}

const OtherRollup: React.FC<OtherRollupProps> = ({
  count,
  value,
  percentage,
  maxValue,
  formatValue,
  topCount,
}) => {
  const barPercentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

  return (
    <motion.div
      className="flex items-center gap-3"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + topCount * 0.05, duration: 0.4 }}
    >
      {/* Icon placeholder */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: INK.cream, border: `1px dashed ${INK.rule}` }}
      >
        <Users size={14} color={INK.ghost} />
      </div>

      {/* Name */}
      <div className="w-32 flex-shrink-0">
        <span
          style={{
            fontFamily: FONT.sans,
            fontSize: 13,
            fontWeight: 500,
            color: INK.muted,
            fontStyle: 'italic',
          }}
        >
          +{count} others
        </span>
      </div>

      {/* Bar */}
      <div className="flex-1 h-6 rounded-lg overflow-hidden" style={{ backgroundColor: INK.cream }}>
        <motion.div
          className="h-full rounded-lg"
          style={{
            background: `repeating-linear-gradient(
              -45deg,
              ${INK.ghost}30,
              ${INK.ghost}30 2px,
              transparent 2px,
              transparent 4px
            )`,
            borderLeft: `3px solid ${INK.ghost}`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${barPercentage}%` }}
          transition={{ delay: 0.4 + topCount * 0.05, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        />
      </div>

      {/* Value */}
      <div className="w-20 text-right flex-shrink-0">
        <span
          style={{
            fontFamily: FONT.mono,
            fontSize: 14,
            fontWeight: 600,
            color: INK.muted,
          }}
        >
          {formatValue(value)}
        </span>
      </div>

      {/* Percentage */}
      <div className="w-12 text-right flex-shrink-0">
        <span
          style={{
            fontFamily: FONT.mono,
            fontSize: 12,
            color: INK.ghost,
          }}
        >
          {percentage}%
        </span>
      </div>
    </motion.div>
  );
};

// =============================================================================
// SUMMARY STATS - Bottom stats row
// =============================================================================

interface PracticeSummaryStatsProps {
  months: MonthData[];
  metric: PracticeMetric;
  formatValue: (v: number) => string;
}

const PracticeSummaryStats: React.FC<PracticeSummaryStatsProps> = ({ months, metric, formatValue }) => {
  const pastMonths = months.filter(m => (m.isPast || m.isCurrent) && m.actual !== undefined);
  const futureMonths = months.filter(m => !m.isPast && !m.isCurrent);

  if (pastMonths.length === 0) return null;

  const avgActual = Math.round(
    pastMonths.reduce((sum, m) => sum + (m.actual || 0), 0) / pastMonths.length
  );
  const avgGoal = Math.round(
    pastMonths.reduce((sum, m) => sum + m.goal, 0) / pastMonths.length
  );
  const futureAvg = futureMonths.length > 0
    ? Math.round(futureMonths.reduce((sum, m) => sum + m.goal, 0) / futureMonths.length)
    : avgGoal;

  const variance = avgActual - avgGoal;
  const variancePercent = avgGoal > 0 ? Math.round((variance / avgGoal) * 100) : 0;

  const monthsAbove = pastMonths.filter(m => (m.actual || 0) >= m.goal).length;
  const hitRate = Math.round((monthsAbove / pastMonths.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="flex items-stretch gap-6 px-6 py-4"
      style={{
        backgroundColor: INK.cream,
        borderTop: `1px solid ${INK.rule}`,
      }}
    >
      <div className="flex items-center gap-3">
        <div className="w-3 h-8 rounded-[3px]" style={{ backgroundColor: COLORS.actual }} />
        <div>
          <div style={{ fontFamily: FONT.sans, fontSize: 10, color: INK.muted, marginBottom: 2 }}>
            Avg. Actual
          </div>
          <div style={{ fontFamily: FONT.mono, fontSize: 18, fontWeight: 600, color: INK.black }}>
            {formatValue(avgActual)}
          </div>
        </div>
      </div>

      <div className="w-px self-stretch" style={{ backgroundColor: INK.rule }} />

      <div className="flex items-center gap-3">
        <div className="w-3 h-8 rounded-[3px]" style={{ backgroundColor: COLORS.goalPast }} />
        <div>
          <div style={{ fontFamily: FONT.sans, fontSize: 10, color: INK.muted, marginBottom: 2 }}>
            Avg. Goal
          </div>
          <div style={{ fontFamily: FONT.mono, fontSize: 18, fontWeight: 600, color: INK.black }}>
            {formatValue(avgGoal)}
          </div>
        </div>
      </div>

      <div className="w-px self-stretch" style={{ backgroundColor: INK.rule }} />

      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            backgroundColor: variance >= 0 ? `${COLORS.positive}15` : `${COLORS.negative}15`,
          }}
        >
          {variance > 0 ? (
            <TrendingUp size={16} color={COLORS.positive} />
          ) : variance < 0 ? (
            <TrendingDown size={16} color={COLORS.negative} />
          ) : (
            <Minus size={16} color={COLORS.neutral} />
          )}
        </div>
        <div>
          <div style={{ fontFamily: FONT.sans, fontSize: 10, color: INK.muted, marginBottom: 2 }}>
            vs. Goal
          </div>
          <div
            style={{
              fontFamily: FONT.mono,
              fontSize: 18,
              fontWeight: 600,
              color: variance >= 0 ? COLORS.positive : COLORS.negative,
            }}
          >
            {variance > 0 ? '+' : ''}{variancePercent}%
          </div>
        </div>
      </div>

      <div className="w-px self-stretch" style={{ backgroundColor: INK.rule }} />

      <div className="flex items-center gap-3">
        <div className="w-3 h-8 rounded-[3px]" style={{ backgroundColor: COLORS.goalFuture }} />
        <div>
          <div style={{ fontFamily: FONT.sans, fontSize: 10, color: INK.muted, marginBottom: 2 }}>
            Projected
          </div>
          <div style={{ fontFamily: FONT.mono, fontSize: 18, fontWeight: 600, color: COLORS.goalFuture }}>
            {formatValue(futureAvg)}
          </div>
        </div>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <div>
          <div style={{ fontFamily: FONT.sans, fontSize: 10, color: INK.muted, marginBottom: 2, textAlign: 'right' }}>
            Hit Rate
          </div>
          <div style={{ fontFamily: FONT.mono, fontSize: 18, fontWeight: 600, color: INK.black, textAlign: 'right' }}>
            {monthsAbove}/{pastMonths.length}
            <span style={{ fontSize: 11, color: INK.muted, marginLeft: 4 }}>({hitRate}%)</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const PracticeInsightsModal: React.FC<PracticeInsightsModalProps> = ({
  metric,
  clinicians,
  onClose,
}) => {
  const [selectedMonthIndex, setSelectedMonthIndex] = React.useState<number | null>(null);

  const months = useMemo(() => generatePracticeMonthData(clinicians, metric), [clinicians, metric]);
  const contributions = useMemo(() => computeContributions(clinicians, metric, 6), [clinicians, metric]);

  // Get selected month data
  const selectedMonth = selectedMonthIndex !== null ? months[selectedMonthIndex] : null;

  const allValues = months.flatMap(m => [m.goal, m.actual].filter((v): v is number => v !== undefined));
  const dataMax = Math.max(...allValues);
  const minValue = 0;
  const maxValue = Math.ceil(dataMax * 1.2); // 20% headroom, proportional
  const chartHeight = 200;

  // Metric-specific formatting
  const formatValue = (v: number): string => {
    switch (metric) {
      case 'revenue':
        return formatRevenue(v);
      case 'sessions':
        return String(Math.round(v));
      case 'clients':
        return String(Math.round(v));
    }
  };

  const metricConfig = {
    revenue: {
      title: 'Practice Revenue',
      subtitle: 'Monthly revenue based on clinician session goals',
      icon: DollarSign,
      iconBg: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    },
    sessions: {
      title: 'Practice Sessions',
      subtitle: 'Monthly sessions across all clinicians',
      icon: Calendar,
      iconBg: 'linear-gradient(135deg, #c9a227 0%, #a78419 100%)',
    },
    clients: {
      title: 'Active Clients',
      subtitle: 'Total client load across the practice',
      icon: Users,
      iconBg: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
    },
  };

  const config = metricConfig[metric];
  const Icon = config.icon;

  const currentMonthIndex = months.findIndex(m => m.isCurrent);

  // Get max contribution for bar scaling
  const maxContribution = contributions.top.length > 0
    ? Math.max(...contributions.top.map(c => c.value), contributions.other?.value || 0)
    : 1;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 z-[9999]"
        style={{
          background: 'rgba(28, 25, 23, 0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="fixed inset-0 z-[10000] flex items-center justify-center p-6 lg:pl-[100px]"
        style={{ pointerEvents: 'none' }}
      >
        <div
          className="relative w-full max-w-[1100px] max-h-[90vh] overflow-hidden rounded-2xl flex flex-col"
          style={{
            pointerEvents: 'auto',
            background: '#FEFDFB',
            boxShadow: '0 50px 100px -20px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.03)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4 flex-shrink-0"
            style={{ borderBottom: `1px solid ${INK.rule}` }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: config.iconBg,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
              >
                <Icon size={20} color="white" strokeWidth={2} />
              </div>
              <div>
                <h2
                  style={{
                    fontFamily: FONT.serif,
                    fontSize: 22,
                    fontWeight: 400,
                    color: INK.black,
                  }}
                >
                  {config.title}
                </h2>
                <p style={{ fontFamily: FONT.sans, fontSize: 12, color: INK.muted, marginTop: 1 }}>
                  {config.subtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Current total */}
              <div className="flex flex-col items-end">
                <span
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 10,
                    color: INK.faded,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Current Monthly Goal
                </span>
                <span
                  style={{
                    fontFamily: FONT.mono,
                    fontSize: 20,
                    fontWeight: 600,
                    color: INK.gold,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {formatValue(contributions.total)}
                </span>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-lg transition-all hover:bg-stone-100 active:scale-95"
              >
                <X size={18} color={INK.muted} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            {/* Chart section */}
            <div className="px-6 pt-6 pb-4 overflow-visible">
              {/* Legend */}
              <div className="flex items-center gap-5 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: COLORS.actual }} />
                  <span style={{ fontFamily: FONT.sans, fontSize: 11, color: INK.muted }}>Actual</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: COLORS.goalCurrent }} />
                  <span style={{ fontFamily: FONT.sans, fontSize: 11, color: INK.muted }}>Goal</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-[2px]"
                    style={{
                      background: `repeating-linear-gradient(
                        -45deg,
                        ${COLORS.goalFuture}60,
                        ${COLORS.goalFuture}60 1px,
                        transparent 1px,
                        transparent 2px
                      )`,
                      border: `1px dashed ${COLORS.goalFuture}`,
                    }}
                  />
                  <span style={{ fontFamily: FONT.sans, fontSize: 11, color: INK.muted }}>Projected</span>
                </div>
              </div>

              {/* Chart */}
              <div className="flex">
                <YAxis
                  minValue={minValue}
                  maxValue={maxValue}
                  chartHeight={chartHeight}
                  metric={metric}
                  formatValue={formatValue}
                />

                <div className="flex-1 relative overflow-visible">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-full h-px"
                        style={{ backgroundColor: i === 4 ? INK.rule : INK.cream }}
                      />
                    ))}
                  </div>

                  {/* Current month indicator line */}
                  {currentMonthIndex >= 0 && (
                    <div
                      className="absolute top-0 bottom-0 w-px z-10"
                      style={{
                        left: `${((currentMonthIndex + 0.5) / months.length) * 100}%`,
                        background: `linear-gradient(180deg, ${INK.gold}00 0%, ${INK.gold}40 50%, ${INK.gold}00 100%)`,
                      }}
                    />
                  )}

                  {/* Month columns */}
                  <div className="flex justify-between">
                    {months.map((month, index) => (
                      <ReadOnlyMonthColumn
                        key={month.month}
                        data={month}
                        index={index}
                        maxValue={maxValue}
                        minValue={minValue}
                        chartHeight={chartHeight}
                        metric={metric}
                        formatValue={formatValue}
                        isSelected={selectedMonthIndex === index}
                        onSelect={() => setSelectedMonthIndex(selectedMonthIndex === index ? null : index)}
                      />
                    ))}
                  </div>

                </div>
              </div>
            </div>

            {/* Summary stats */}
            <PracticeSummaryStats months={months} metric={metric} formatValue={formatValue} />

            {/* Breakdown section - only when a month is selected */}
            <AnimatePresence>
              {selectedMonth && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-6 py-5" style={{ borderTop: `1px solid ${INK.rule}` }}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <h3
                          style={{
                            fontFamily: FONT.serif,
                            fontSize: 16,
                            fontWeight: 400,
                            color: INK.black,
                          }}
                        >
                          {selectedMonth.label} Breakdown
                        </h3>
                        {/* Badge(s) showing values - different layout for past months */}
                        {selectedMonth.isPast && selectedMonth.actual !== undefined ? (
                          <div className="flex items-center gap-2">
                            <span
                              className="px-2 py-0.5 rounded-md"
                              style={{
                                fontFamily: FONT.mono,
                                fontSize: 12,
                                fontWeight: 600,
                                color: COLORS.actual,
                                backgroundColor: `${COLORS.actual}15`,
                              }}
                            >
                              {formatValue(selectedMonth.actual)}
                            </span>
                            <span style={{ fontFamily: FONT.sans, fontSize: 10, color: INK.ghost }}>vs</span>
                            <span
                              className="px-2 py-0.5 rounded-md"
                              style={{
                                fontFamily: FONT.mono,
                                fontSize: 12,
                                fontWeight: 600,
                                color: COLORS.goalPast,
                                backgroundColor: `${COLORS.goalPast}15`,
                              }}
                            >
                              {formatValue(selectedMonth.goal)}
                            </span>
                          </div>
                        ) : (
                          <span
                            className="px-2 py-0.5 rounded-md"
                            style={{
                              fontFamily: FONT.mono,
                              fontSize: 12,
                              fontWeight: 600,
                              color: selectedMonth.isCurrent ? INK.gold : COLORS.goalFuture,
                              backgroundColor: selectedMonth.isCurrent ? INK.goldGlow : `${COLORS.goalFuture}15`,
                            }}
                          >
                            {formatValue(selectedMonth.goal)}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => setSelectedMonthIndex(null)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg transition-colors hover:bg-stone-100"
                        style={{
                          fontFamily: FONT.sans,
                          fontSize: 11,
                          color: INK.ghost,
                          border: 'none',
                          cursor: 'pointer',
                          backgroundColor: 'transparent',
                        }}
                      >
                        <X size={12} />
                        Close
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {contributions.top.map((contribution, index) => (
                        <ContributionBar
                          key={contribution.id}
                          contribution={contribution}
                          maxValue={maxContribution}
                          formatValue={formatValue}
                          index={index}
                        />
                      ))}

                      {contributions.other && (
                        <OtherRollup
                          count={contributions.other.count}
                          value={contributions.other.value}
                          percentage={contributions.other.percentage}
                          maxValue={maxContribution}
                          formatValue={formatValue}
                          topCount={contributions.top.length}
                        />
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between px-6 py-3 flex-shrink-0"
            style={{
              borderTop: `1px solid ${INK.rule}`,
              backgroundColor: INK.paper,
            }}
          >
            <span style={{ fontFamily: FONT.sans, fontSize: 11, color: INK.ghost }}>
              Projections based on current clinician goals. Adjust individual goals to see updated practice totals.
            </span>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg transition-all hover:bg-stone-100 active:scale-98"
              style={{
                fontFamily: FONT.sans,
                fontSize: 13,
                fontWeight: 500,
                color: INK.body,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: INK.cream,
              }}
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default PracticeInsightsModal;
