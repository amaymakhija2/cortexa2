import React, { useState, useEffect, useMemo } from 'react';
import { Maximize2 } from 'lucide-react';

// =============================================================================
// RETENTION FUNNEL CHART COMPONENT
// =============================================================================
// A refined funnel visualization showing client retention milestones.
// Split into two separate card components for sessions and time views.
//
// Color Philosophy: As clients progress through milestones, they become MORE
// valuable to the practice. Colors get richer and deeper to celebrate this -
// from fresh spring tones to deep, established jewel tones.
// =============================================================================

export interface FunnelStage {
  /** Label for this stage (e.g., "Session 5", "3 Months") */
  label: string;
  /** Number of clients at this stage */
  count: number;
  /** Percentage retained (calculated from initial) */
  percentage: number;
}

export interface RetentionFunnelData {
  /** Sessions-based funnel stages */
  sessionsFunnel: FunnelStage[];
  /** Time-based funnel stages */
  timeFunnel: FunnelStage[];
}

export interface FunnelInsight {
  /** Insight value */
  value: string | number;
  /** Insight label */
  label: string;
  /** Background color class */
  bgColor?: string;
  /** Text color class */
  textColor?: string;
}

export interface RetentionFunnelCardProps {
  /** Funnel stages data */
  stages: FunnelStage[];
  /** Card title */
  title: string;
  /** Card subtitle */
  subtitle: string;
  /** Icon to display */
  variant: 'sessions' | 'time';
  /** Whether the card is expandable */
  expandable?: boolean;
  /** Callback when expand is clicked */
  onExpand?: () => void;
  /** Insights row at bottom (3 values) */
  insights?: FunnelInsight[];
  /** Size variant */
  size?: 'md' | 'lg';
  /** Additional className */
  className?: string;
}

// =============================================================================
// COLOR SYSTEM
// =============================================================================
// Single solid color per funnel type
// Sessions: Amber (warm, energetic)
// Time: Indigo (calm, enduring)

const FUNNEL_COLORS = {
  sessions: {
    bar: '#d97706', // Amber-600
    glow: 'rgba(217, 119, 6, 0.3)',
    text: '#fffbeb', // Amber-50
    accent: '#b45309', // Amber-700
    accentBg: '#fffbeb', // Amber-50
  },
  time: {
    bar: '#4f46e5', // Indigo-600
    glow: 'rgba(79, 70, 229, 0.3)',
    text: '#eef2ff', // Indigo-50
    accent: '#4338ca', // Indigo-700
    accentBg: '#eef2ff', // Indigo-50
  },
};

// =============================================================================
// SINGLE FUNNEL CARD
// =============================================================================

export const RetentionFunnelCard: React.FC<RetentionFunnelCardProps> = ({
  stages,
  title,
  subtitle,
  variant,
  expandable = false,
  onExpand,
  insights,
  size = 'md',
  className = '',
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const colors = FUNNEL_COLORS[variant];
  const isLarge = size === 'lg';

  // Calculate widths - minimum 25% to keep readable
  const stageWidths = useMemo(() => {
    return stages.map((stage) => Math.max(25, stage.percentage));
  }, [stages]);

  return (
    <div
      className={`rounded-2xl xl:rounded-3xl p-6 sm:p-8 xl:p-10 relative overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(145deg, #ffffff 0%, #fafaf9 100%)',
        boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)',
      }}
    >
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(${colors.accent} 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Header - matches ChartCard design system */}
      <div className="relative flex items-start justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h3
            className={`text-stone-900 font-bold tracking-tight ${
              isLarge ? 'text-3xl sm:text-4xl xl:text-5xl' : 'text-2xl sm:text-3xl xl:text-4xl'
            }`}
            style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
          >
            {title}
          </h3>
          {subtitle && (
            <p
              className={`text-stone-500 mt-2 ${isLarge ? 'text-lg sm:text-xl' : 'text-base sm:text-lg xl:text-xl'}`}
              style={{ fontFamily: "'Suisse Intl', system-ui, sans-serif" }}
            >
              {subtitle}
            </p>
          )}
        </div>

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

      {/* Funnel Stages */}
      <div className={`space-y-4 ${isLarge ? 'space-y-5' : ''}`}>
        {stages.map((stage, index) => {
          const width = stageWidths[index];
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={stage.label}
              className="relative flex items-center gap-4"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Stage Bar */}
              <div
                className={`relative overflow-hidden transition-all duration-500 ease-out cursor-pointer ${
                  isLarge ? 'h-14 rounded-xl' : 'h-12 rounded-lg'
                }`}
                style={{
                  width: isVisible ? `${width}%` : '0%',
                  transitionDelay: `${index * 100}ms`,
                  background: colors.bar,
                  boxShadow: isHovered
                    ? `0 8px 24px -4px ${colors.glow}, inset 0 1px 0 rgba(255,255,255,0.15)`
                    : `0 2px 12px -4px ${colors.glow}, inset 0 1px 0 rgba(255,255,255,0.1)`,
                  transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                }}
              >
                {/* Top highlight */}
                <div
                  className="absolute inset-x-0 top-0 h-1/2 opacity-15"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 100%)'
                  }}
                />

                {/* Label inside bar */}
                <div className={`relative h-full flex items-center ${isLarge ? 'px-5' : 'px-4'}`}>
                  <span
                    className={`font-bold ${isLarge ? 'text-lg' : 'text-base'}`}
                    style={{
                      color: colors.text,
                      textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      fontFamily: "'Tiempos Headline', Georgia, serif"
                    }}
                  >
                    {stage.label}
                  </span>
                </div>
              </div>

              {/* Values outside bar */}
              <div
                className="flex items-center gap-3 flex-shrink-0"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateX(0)' : 'translateX(-10px)',
                  transition: 'all 0.4s ease-out',
                  transitionDelay: `${index * 100 + 200}ms`
                }}
              >
                <span
                  className={`text-stone-600 font-medium ${isLarge ? 'text-lg' : 'text-base'}`}
                  style={{ fontFamily: "'Suisse Intl', system-ui, sans-serif" }}
                >
                  {stage.count.toLocaleString()} clients
                </span>
                <div
                  className={`rounded-lg font-bold ${
                    isLarge ? 'px-3 py-1.5 text-xl' : 'px-2.5 py-1 text-lg'
                  }`}
                  style={{
                    background: colors.accentBg,
                    color: colors.accent,
                    fontFamily: "'Suisse Intl', system-ui, sans-serif",
                  }}
                >
                  {stage.percentage}%
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Insights Row - matches ChartCard styling */}
      {insights && insights.length > 0 && (
        <div
          className={`grid gap-4 pt-3 border-t-2 border-stone-100 ${isLarge ? 'mt-6' : 'mt-4'}`}
          style={{
            gridTemplateColumns: `repeat(${insights.length}, 1fr)`,
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(8px)',
            transition: 'all 0.4s ease-out',
            transitionDelay: `${stages.length * 100 + 100}ms`
          }}
        >
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className={`${insight.bgColor || 'bg-stone-100'} rounded-xl p-4 text-center`}
            >
              <div
                className={`${insight.textColor || 'text-stone-800'} text-2xl sm:text-3xl font-bold`}
                style={{ fontFamily: "'Suisse Intl', system-ui, sans-serif" }}
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
// LEGACY COMBINED COMPONENT (for backwards compatibility)
// =============================================================================

export interface RetentionFunnelChartProps {
  /** Funnel data for both views */
  data: RetentionFunnelData;
  /** Whether the card is expandable */
  expandable?: boolean;
  /** Callback when expand is clicked */
  onExpand?: () => void;
  /** Size variant */
  size?: 'md' | 'lg';
  /** Additional className */
  className?: string;
}

export const RetentionFunnelChart: React.FC<RetentionFunnelChartProps> = ({
  data,
  expandable = false,
  onExpand,
  size = 'md',
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
      <RetentionFunnelCard
        stages={data.sessionsFunnel}
        title="Retention by Sessions"
        subtitle="Client milestones reached"
        variant="sessions"
        expandable={expandable}
        onExpand={onExpand}
        size={size}
      />
      <RetentionFunnelCard
        stages={data.timeFunnel}
        title="Retention by Time"
        subtitle="Duration with practice"
        variant="time"
        expandable={expandable}
        onExpand={onExpand}
        size={size}
      />
    </div>
  );
};

export default RetentionFunnelChart;
