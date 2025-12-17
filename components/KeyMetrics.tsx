import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PracticeMetrics, MetricDetail } from '../types';
import { Info, ChevronRight, TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react';

// =============================================================================
// KEY METRICS - EDITORIAL FINANCIAL DASHBOARD
// =============================================================================
// A commanding, sophisticated metrics display inspired by:
// - Bloomberg Terminal's data precision
// - The Economist's editorial elegance
// - Luxury annual report typography
// - High-end watch design: precision, refinement, timelessness
//
// Design Principles:
// - Hero metrics (Revenue, Sessions) get premium visual treatment
// - Supporting metrics maintain hierarchy while staying refined
// - Status system uses sophisticated color with restraint
// - Every detail is intentional and polished
// =============================================================================

// -----------------------------------------------------------------------------
// TOOLTIP COMPONENT
// -----------------------------------------------------------------------------

const Tooltip: React.FC<{ title: string; description: string }> = ({ title, description }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let top = triggerRect.bottom + 12;
      let left = triggerRect.left - tooltipRect.width + triggerRect.width;

      if (left + tooltipRect.width > viewportWidth - 20) {
        left = viewportWidth - tooltipRect.width - 20;
      }
      if (left < 20) left = 20;
      if (top + tooltipRect.height > viewportHeight - 20) {
        top = triggerRect.top - tooltipRect.height - 12;
      }

      setPosition({ top, left });
    }
  }, [isVisible]);

  return (
    <div
      ref={triggerRef}
      className="relative"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-stone-100 cursor-help group">
        <Info
          size={18}
          className="text-stone-500 group-hover:text-stone-700 transition-colors duration-300"
          strokeWidth={1.5}
        />
      </div>
      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-[100000] w-80 animate-in fade-in slide-in-from-top-2 duration-200"
          style={{ top: position.top, left: position.left }}
        >
          <div
            className="rounded-2xl p-6 backdrop-blur-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(28, 25, 23, 0.95) 0%, rgba(41, 37, 36, 0.95) 100%)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            }}
          >
            <p
              className="text-white text-lg font-semibold mb-2"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              {title}
            </p>
            <p className="text-stone-300 leading-relaxed text-sm">{description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// -----------------------------------------------------------------------------
// METRIC TOOLTIPS
// -----------------------------------------------------------------------------

const getMetricTooltip = (label: string): { title: string; description: string } => {
  const tooltips: Record<string, { title: string; description: string }> = {
    'Revenue': {
      title: 'Revenue',
      description: 'Total money collected this month toward your monthly goal. Includes all payment types and adjustments.'
    },
    'Sessions': {
      title: 'Completed Sessions',
      description: 'Sessions completed this month. Utilization represents the percentage of your session goal achieved.'
    },
    'Clients': {
      title: 'Active Clients',
      description: 'Clients currently active in SimplePractice. Openings indicate capacity for new clients.'
    },
    'Attendance': {
      title: 'Rebook Rate',
      description: 'Percentage of active clients with their next session already scheduled. A key indicator of client engagement.'
    },
    'Outstanding Notes': {
      title: 'Outstanding Notes',
      description: 'Sessions with overdue clinical notes. Overdue notes delay billing and create compliance risk.'
    }
  };
  return tooltips[label] || { title: label, description: 'Practice metric' };
};

// -----------------------------------------------------------------------------
// STATUS CONFIGURATION
// -----------------------------------------------------------------------------

interface StatusConfig {
  label: string;
  gradient: string;
  glow: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  pulseColor: string;
}

const STATUS_CONFIG: Record<MetricDetail['status'], StatusConfig> = {
  'Healthy': {
    label: 'On Track',
    gradient: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)',
    glow: '0 0 20px rgba(16, 185, 129, 0.4)',
    textColor: '#047857',
    bgColor: 'rgba(236, 253, 245, 0.8)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
    pulseColor: 'rgba(16, 185, 129, 0.3)',
  },
  'Needs attention': {
    label: 'Monitor',
    gradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #fbbf24 100%)',
    glow: '0 0 20px rgba(245, 158, 11, 0.4)',
    textColor: '#b45309',
    bgColor: 'rgba(254, 243, 199, 0.8)',
    borderColor: 'rgba(245, 158, 11, 0.2)',
    pulseColor: 'rgba(245, 158, 11, 0.3)',
  },
  'Critical': {
    label: 'Action Needed',
    gradient: 'linear-gradient(135deg, #be123c 0%, #e11d48 50%, #f43f5e 100%)',
    glow: '0 0 20px rgba(225, 29, 72, 0.4)',
    textColor: '#be123c',
    bgColor: 'rgba(255, 241, 242, 0.8)',
    borderColor: 'rgba(225, 29, 72, 0.2)',
    pulseColor: 'rgba(225, 29, 72, 0.3)',
  },
};

// -----------------------------------------------------------------------------
// STATUS INDICATOR COMPONENT
// -----------------------------------------------------------------------------

const StatusIndicator: React.FC<{ status: MetricDetail['status']; compact?: boolean }> = ({
  status,
  compact = false
}) => {
  const config = STATUS_CONFIG[status];
  const isCritical = status === 'Critical';

  return (
    <div className="flex items-center gap-2.5">
      {/* Animated status orb */}
      <div className="relative">
        <div
          className="w-3 h-3 rounded-full transition-all duration-500"
          style={{
            background: config.gradient,
            boxShadow: config.glow,
          }}
        />
        {/* Pulse ring for critical status */}
        {isCritical && (
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{
              background: config.pulseColor,
              animationDuration: '2s',
            }}
          />
        )}
      </div>

      {!compact && (
        <span
          className="text-sm font-semibold tracking-wide"
          style={{ color: config.textColor }}
        >
          {config.label}
        </span>
      )}
    </div>
  );
};

// -----------------------------------------------------------------------------
// SPARKLINE COMPONENT - Mini trend visualization
// -----------------------------------------------------------------------------

const Sparkline: React.FC<{
  data: number[];
  color?: string;
  height?: number;
}> = ({ data, color = '#78716c', height = 24 }) => {
  if (!data || data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 60;
  const padding = 2;

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2);
    const y = padding + ((max - value) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  const trend = data[data.length - 1] > data[0] ? 'up' : data[data.length - 1] < data[0] ? 'down' : 'flat';
  const trendColor = trend === 'up' ? '#059669' : trend === 'down' ? '#e11d48' : color;

  return (
    <svg
      width={width}
      height={height}
      className="opacity-60 hover:opacity-100 transition-opacity duration-300"
    >
      <polyline
        points={points}
        fill="none"
        stroke={trendColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      <circle
        cx={padding + (width - padding * 2)}
        cy={padding + ((max - data[data.length - 1]) / range) * (height - padding * 2)}
        r="3"
        fill={trendColor}
      />
    </svg>
  );
};

// -----------------------------------------------------------------------------
// WEEKLY DATA FOR EXPANDABLE SECTIONS
// -----------------------------------------------------------------------------

const WEEKLY_REVENUE = [
  { week: 'Oct 28 – Nov 3', revenue: 38200 },
  { week: 'Nov 4 – Nov 10', revenue: 41500 },
  { week: 'Nov 11 – Nov 17', revenue: 36800 },
  { week: 'Nov 18 – Nov 24', revenue: 36900 },
];

const BOOKING_FORECAST = [
  { week: 'Week of Nov 25', booked: 42 },
  { week: 'Week of Dec 2', booked: 38 },
  { week: 'Week of Dec 9', booked: 29 },
  { week: 'Week of Dec 16', booked: 18 },
];

const formatCurrency = (amount: number) => {
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}k`;
  return `$${amount}`;
};

// -----------------------------------------------------------------------------
// HERO METRIC CARD - For Revenue & Sessions (Primary metrics)
// -----------------------------------------------------------------------------

interface HeroMetricCardProps {
  data: MetricDetail;
  type: 'revenue' | 'sessions';
  sparklineData?: number[];
}

const HeroMetricCard: React.FC<HeroMetricCardProps> = ({ data, type, sparklineData }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const tooltip = getMetricTooltip(data.label);
  const statusConfig = STATUS_CONFIG[data.status];

  const weeklyData = type === 'revenue' ? WEEKLY_REVENUE : BOOKING_FORECAST;
  const maxValue = type === 'revenue'
    ? Math.max(...WEEKLY_REVENUE.map(w => w.revenue))
    : Math.max(...BOOKING_FORECAST.map(w => w.booked));

  return (
    <div
      className="hero-metric-card relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Card */}
      <div
        className={`relative overflow-hidden transition-all duration-500 ease-out ${
          isExpanded ? 'rounded-t-[28px]' : 'rounded-[28px]'
        }`}
        style={{
          background: 'linear-gradient(145deg, #ffffff 0%, #fafaf9 100%)',
          boxShadow: isHovered
            ? `0 20px 40px -12px rgba(0, 0, 0, 0.15),
               0 8px 16px -8px rgba(0, 0, 0, 0.1),
               0 0 0 1px rgba(0, 0, 0, 0.04),
               inset 0 1px 0 rgba(255, 255, 255, 0.8)`
            : `0 8px 24px -8px rgba(0, 0, 0, 0.08),
               0 4px 8px -4px rgba(0, 0, 0, 0.04),
               0 0 0 1px rgba(0, 0, 0, 0.03),
               inset 0 1px 0 rgba(255, 255, 255, 0.6)`,
          transform: isHovered && !isExpanded ? 'translateY(-2px)' : 'translateY(0)',
        }}
      >
        {/* Subtle top accent line */}
        <div
          className="h-1 transition-all duration-500"
          style={{
            background: statusConfig.gradient,
            opacity: isHovered ? 1 : 0.8,
          }}
        />

        {/* Card Content */}
        <div className="p-6 sm:p-7 xl:p-8">
          {/* Header Row */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <span
                className="text-sm font-bold text-stone-600 uppercase tracking-[0.15em]"
              >
                {data.label}
              </span>
              {sparklineData && (
                <Sparkline data={sparklineData} />
              )}
            </div>
            <Tooltip title={tooltip.title} description={tooltip.description} />
          </div>

          {/* Hero Value */}
          <div className="mb-4">
            <div className="flex items-baseline gap-3">
              <span
                className="text-5xl sm:text-6xl xl:text-7xl text-stone-900 tracking-tight font-bold"
                style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  lineHeight: 1,
                }}
              >
                {data.value}
              </span>
              {data.valueLabel && (
                <span className="text-lg sm:text-xl text-stone-500 font-medium">
                  {data.valueLabel}
                </span>
              )}
            </div>
          </div>

          {/* Subtext */}
          <p className="text-base sm:text-lg text-stone-600 leading-relaxed mb-6">
            {data.subtext}
          </p>

          {/* Footer */}
          <div
            className="pt-5 border-t flex items-center justify-between"
            style={{ borderColor: 'rgba(0, 0, 0, 0.06)' }}
          >
            <StatusIndicator status={data.status} />

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="group flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300"
              style={{
                background: isExpanded
                  ? 'linear-gradient(135deg, #1c1917 0%, #292524 100%)'
                  : 'linear-gradient(135deg, #f5f5f4 0%, #e7e5e4 100%)',
                boxShadow: isExpanded
                  ? '0 4px 12px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  : '0 2px 6px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
              }}
            >
              <span
                className={`text-sm font-semibold transition-colors duration-300 ${
                  isExpanded ? 'text-white' : 'text-stone-600'
                }`}
              >
                {isExpanded ? 'Close' : type === 'revenue' ? 'Weekly Breakdown' : 'Upcoming'}
              </span>
              <ChevronRight
                size={16}
                className={`transition-all duration-300 ${
                  isExpanded ? 'text-white rotate-90' : 'text-stone-500'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Panel */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-out ${
          isExpanded ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div
          className="rounded-b-[28px] p-6 sm:p-7"
          style={{
            background: 'linear-gradient(180deg, #fafaf9 0%, #ffffff 100%)',
            boxShadow: `0 20px 40px -12px rgba(0, 0, 0, 0.1),
                        0 0 0 1px rgba(0, 0, 0, 0.03),
                        inset 0 1px 0 rgba(0, 0, 0, 0.02)`,
          }}
        >
          <div className="space-y-3">
            {weeklyData.map((week, index) => {
              const value = type === 'revenue'
                ? (week as typeof WEEKLY_REVENUE[0]).revenue
                : (week as typeof BOOKING_FORECAST[0]).booked;
              const barWidth = (value / maxValue) * 100;

              return (
                <div key={week.week} className="flex items-center gap-4">
                  <span className="text-sm text-stone-600 w-28 shrink-0 font-medium">
                    {week.week}
                  </span>
                  <div className="flex-1 h-10 bg-stone-100 rounded-xl overflow-hidden">
                    <div
                      className="h-full rounded-xl transition-all duration-700 ease-out"
                      style={{
                        width: isExpanded ? `${barWidth}%` : '0%',
                        background: 'linear-gradient(90deg, #44403c 0%, #57534e 100%)',
                        transitionDelay: `${index * 80}ms`,
                      }}
                    />
                  </div>
                  <span
                    className="text-sm font-bold text-stone-800 w-14 text-right"
                    style={{ fontFamily: "'DM Serif Display', Georgia, serif", lineHeight: 1 }}
                  >
                    {type === 'revenue' ? formatCurrency(value) : value}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div
            className="mt-5 pt-4 border-t"
            style={{ borderColor: 'rgba(0, 0, 0, 0.06)' }}
          >
            <p className="text-sm text-stone-600">
              <span
                className="font-bold text-stone-800"
                style={{ fontFamily: "'DM Serif Display', Georgia, serif", lineHeight: 1 }}
              >
                {type === 'revenue'
                  ? formatCurrency(WEEKLY_REVENUE.reduce((sum, w) => sum + w.revenue, 0))
                  : `${BOOKING_FORECAST.reduce((sum, w) => sum + w.booked, 0)} sessions`
                }
              </span>
              {type === 'revenue' ? ' collected this month' : ' booked ahead'}
            </p>
          </div>
        </div>
      </div>

      {/* Keyframe animations */}
      <style>{`
        .hero-metric-card {
          animation: heroCardFadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes heroCardFadeIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

// -----------------------------------------------------------------------------
// CLIENTS METRIC CARD - Expandable card for client growth data
// -----------------------------------------------------------------------------

interface ClientsMetricCardProps {
  data: MetricDetail;
  index: number;
}

// Helper to parse client numbers from subtext
const parseClientNumbers = (subtext: string): { newClients: number; churned: number; openings: string | null } => {
  // Patterns: "17 new, 5 discharged · 18 openings" or "+12 new · -4 discharged"
  const newMatch = subtext.match(/\+?(\d+)\s*new/i);
  const churnedMatch = subtext.match(/-?(\d+)\s*(?:discharged|churned)/i);
  const openingsMatch = subtext.match(/(\d+\s*openings)/i);

  return {
    newClients: newMatch ? parseInt(newMatch[1], 10) : 0,
    churned: churnedMatch ? parseInt(churnedMatch[1], 10) : 0,
    openings: openingsMatch ? openingsMatch[1] : null,
  };
};

const ClientsMetricCard: React.FC<ClientsMetricCardProps> = ({ data, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const tooltip = getMetricTooltip(data.label);
  const statusConfig = STATUS_CONFIG[data.status];

  const { newClients, churned, openings } = parseClientNumbers(data.subtext);

  return (
    <div
      className="clients-metric-card relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        animationDelay: `${(index + 2) * 100}ms`,
      }}
    >
      {/* Main Card */}
      <div
        className={`relative overflow-hidden transition-all duration-500 ease-out ${
          isExpanded ? 'rounded-t-[24px]' : 'rounded-[24px]'
        }`}
        style={{
          background: 'linear-gradient(145deg, #ffffff 0%, #fafaf9 100%)',
          boxShadow: isHovered
            ? `0 16px 32px -8px rgba(0, 0, 0, 0.12),
               0 4px 8px -4px rgba(0, 0, 0, 0.06),
               0 0 0 1px rgba(0, 0, 0, 0.04),
               inset 0 1px 0 rgba(255, 255, 255, 0.8)`
            : `0 6px 16px -6px rgba(0, 0, 0, 0.06),
               0 2px 4px -2px rgba(0, 0, 0, 0.03),
               0 0 0 1px rgba(0, 0, 0, 0.02),
               inset 0 1px 0 rgba(255, 255, 255, 0.6)`,
          transform: isHovered && !isExpanded ? 'translateY(-2px)' : 'translateY(0)',
        }}
      >
        {/* Accent line */}
        <div
          className="h-0.5 transition-all duration-400"
          style={{
            background: statusConfig.gradient,
            opacity: isHovered ? 1 : 0.7,
          }}
        />

        <div className="p-5 sm:p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <span className="text-xs font-bold text-stone-600 uppercase tracking-[0.12em]">
              {data.label}
            </span>
            <Tooltip title={tooltip.title} description={tooltip.description} />
          </div>

          {/* Value */}
          <div className="mb-3">
            <span
              className="text-3xl sm:text-4xl text-stone-900 tracking-tight font-bold"
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                lineHeight: 1,
              }}
            >
              {data.value}
            </span>
            {data.valueLabel && (
              <span className="text-base text-stone-500 ml-2 font-medium">
                {data.valueLabel}
              </span>
            )}
          </div>

          {/* Subtext - only show openings, not new/churned */}
          <p className="text-sm text-stone-600 leading-relaxed mb-4 min-h-[20px]">
            {openings || 'Client capacity available'}
          </p>

          {/* Footer with Status and Expand Button */}
          <div
            className="pt-4 border-t flex items-center justify-between"
            style={{ borderColor: 'rgba(0, 0, 0, 0.05)' }}
          >
            <StatusIndicator status={data.status} />

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="group flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300"
              style={{
                background: isExpanded
                  ? 'linear-gradient(135deg, #1c1917 0%, #292524 100%)'
                  : 'linear-gradient(135deg, #f5f5f4 0%, #e7e5e4 100%)',
                boxShadow: isExpanded
                  ? '0 4px 12px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  : '0 2px 6px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
              }}
            >
              <span
                className={`text-xs font-semibold transition-colors duration-300 ${
                  isExpanded ? 'text-white' : 'text-stone-600'
                }`}
              >
                {isExpanded ? 'Collapse' : 'Details'}
              </span>
              <ChevronRight
                size={14}
                className={`transition-all duration-300 ${
                  isExpanded ? 'text-white rotate-90' : 'text-stone-500'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Panel */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-out ${
          isExpanded ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div
          className="rounded-b-[24px] p-5 sm:p-6"
          style={{
            background: 'linear-gradient(180deg, #fafaf9 0%, #ffffff 100%)',
            boxShadow: `0 16px 32px -8px rgba(0, 0, 0, 0.08),
                        0 0 0 1px rgba(0, 0, 0, 0.02),
                        inset 0 1px 0 rgba(0, 0, 0, 0.02)`,
          }}
        >
          <div className="space-y-4">
            {/* New Clients */}
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                }}
              >
                <ArrowUpRight size={20} className="text-emerald-600" />
              </div>
              <div className="flex-1">
                <p
                  className="text-lg font-bold text-stone-900"
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  {newClients} New Clients This Month
                </p>
              </div>
            </div>

            {/* Churned Clients */}
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)',
                }}
              >
                <ArrowDownRight size={20} className="text-rose-600" />
              </div>
              <div className="flex-1">
                <p
                  className="text-lg font-bold text-stone-900"
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  {churned} Clients Churned This Month
                </p>
              </div>
            </div>

            {/* Net Change Summary */}
            <div
              className="pt-4 border-t"
              style={{ borderColor: 'rgba(0, 0, 0, 0.06)' }}
            >
              <p className="text-sm text-stone-600">
                <span
                  className={`font-bold ${newClients - churned >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  {newClients - churned >= 0 ? '+' : ''}{newClients - churned} net
                </span>
                {' client growth this month'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .clients-metric-card {
          animation: supportingCardFadeIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
      `}</style>
    </div>
  );
};

// -----------------------------------------------------------------------------
// SUPPORTING METRIC CARD - For Attendance, Compliance
// -----------------------------------------------------------------------------

interface SupportingMetricCardProps {
  data: MetricDetail;
  index: number;
  navigateTo?: {
    path: string;
    label: string;
  };
}

const SupportingMetricCard: React.FC<SupportingMetricCardProps> = ({ data, index, navigateTo }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const tooltip = getMetricTooltip(data.label);
  const statusConfig = STATUS_CONFIG[data.status];

  return (
    <div
      className="supporting-metric-card relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        animationDelay: `${(index + 2) * 100}ms`,
      }}
    >
      <div
        className="relative overflow-hidden rounded-[24px] h-full transition-all duration-400 ease-out"
        style={{
          background: 'linear-gradient(145deg, #ffffff 0%, #fafaf9 100%)',
          boxShadow: isHovered
            ? `0 16px 32px -8px rgba(0, 0, 0, 0.12),
               0 4px 8px -4px rgba(0, 0, 0, 0.06),
               0 0 0 1px rgba(0, 0, 0, 0.04),
               inset 0 1px 0 rgba(255, 255, 255, 0.8)`
            : `0 6px 16px -6px rgba(0, 0, 0, 0.06),
               0 2px 4px -2px rgba(0, 0, 0, 0.03),
               0 0 0 1px rgba(0, 0, 0, 0.02),
               inset 0 1px 0 rgba(255, 255, 255, 0.6)`,
          transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        }}
      >
        {/* Accent line */}
        <div
          className="h-0.5 transition-all duration-400"
          style={{
            background: statusConfig.gradient,
            opacity: isHovered ? 1 : 0.7,
          }}
        />

        <div className="p-5 sm:p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <span className="text-xs font-bold text-stone-600 uppercase tracking-[0.12em]">
              {data.label}
            </span>
            <Tooltip title={tooltip.title} description={tooltip.description} />
          </div>

          {/* Value */}
          <div className="mb-3">
            <span
              className="text-3xl sm:text-4xl text-stone-900 tracking-tight font-bold"
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                lineHeight: 1,
              }}
            >
              {data.value}
            </span>
            {data.valueLabel && (
              <span className="text-base text-stone-500 ml-2 font-medium">
                {data.valueLabel}
              </span>
            )}
          </div>

          {/* Subtext */}
          <p className="text-sm text-stone-600 leading-relaxed mb-4 min-h-[40px]">
            {data.subtext}
          </p>

          {/* Footer with Status and optional Navigation Button */}
          <div
            className="pt-4 border-t flex items-center justify-between"
            style={{ borderColor: 'rgba(0, 0, 0, 0.05)' }}
          >
            <StatusIndicator status={data.status} />

            {navigateTo && (
              <button
                onClick={() => navigate(navigateTo.path)}
                className="group flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #f5f5f4 0%, #e7e5e4 100%)',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
                }}
              >
                <span className="text-xs font-semibold text-stone-600 transition-colors duration-300 group-hover:text-stone-900">
                  {navigateTo.label}
                </span>
                <ChevronRight
                  size={14}
                  className="text-stone-500 transition-all duration-300 group-hover:text-stone-700 group-hover:translate-x-0.5"
                />
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .supporting-metric-card {
          animation: supportingCardFadeIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes supportingCardFadeIn {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

// -----------------------------------------------------------------------------
// KEY METRICS ROW - Main Export
// -----------------------------------------------------------------------------

export interface KeyMetricsProps {
  metrics: PracticeMetrics;
  isLive?: boolean;
}

export const KeyMetrics: React.FC<KeyMetricsProps> = ({ metrics, isLive = true }) => {
  // Sample sparkline data (would come from real data in production)
  const revenueSparkline = [138, 141, 139, 145, 143, 147, 144, 149, 142, 155, 148, 153];
  const sessionsSparkline = [628, 641, 635, 658, 651, 672, 665, 689, 645, 712, 683, 698];

  return (
    <div className="key-metrics-container">
      {/* Mobile/Tablet: Horizontal scroll */}
      <div
        className="lg:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 -mx-4 px-4"
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <div className="snap-start flex-shrink-0 w-[300px] sm:w-[340px]">
          <HeroMetricCard
            data={metrics.revenue}
            type="revenue"
            sparklineData={revenueSparkline}
          />
        </div>
        <div className="snap-start flex-shrink-0 w-[300px] sm:w-[340px]">
          <HeroMetricCard
            data={metrics.sessions}
            type="sessions"
            sparklineData={sessionsSparkline}
          />
        </div>
        <div className="snap-start flex-shrink-0 w-[280px] sm:w-[300px]">
          <ClientsMetricCard data={metrics.clientGrowth} index={0} />
        </div>
        <div className="snap-start flex-shrink-0 w-[280px] sm:w-[300px]">
          <SupportingMetricCard
            data={metrics.attendance}
            index={1}
            navigateTo={{
              path: '/clinician-overview?tab=ranking&metric=attendance',
              label: 'By Clinician',
            }}
          />
        </div>
        <div className="snap-start flex-shrink-0 w-[280px] sm:w-[300px]">
          <SupportingMetricCard
            data={metrics.compliance}
            index={2}
            navigateTo={{
              path: '/clinician-overview?tab=ranking&metric=documentation',
              label: 'By Clinician',
            }}
          />
        </div>
      </div>

      {/* Desktop: Masonry-inspired grid */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-5 xl:gap-6 items-start">
        {/* Hero Cards - Larger */}
        <div className="col-span-5 xl:col-span-4">
          <HeroMetricCard
            data={metrics.revenue}
            type="revenue"
            sparklineData={revenueSparkline}
          />
        </div>
        <div className="col-span-4 xl:col-span-4">
          <HeroMetricCard
            data={metrics.sessions}
            type="sessions"
            sparklineData={sessionsSparkline}
          />
        </div>

        {/* Supporting Cards - Stacked on right */}
        <div className="col-span-3 xl:col-span-4 flex flex-col gap-4 xl:gap-5">
          <ClientsMetricCard data={metrics.clientGrowth} index={0} />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-5">
            <SupportingMetricCard
              data={metrics.attendance}
              index={1}
              navigateTo={{
                path: '/clinician-overview?tab=ranking&metric=attendance',
                label: 'By Clinician',
              }}
            />
            <SupportingMetricCard
              data={metrics.compliance}
              index={2}
              navigateTo={{
                path: '/clinician-overview?tab=ranking&metric=documentation',
                label: 'By Clinician',
              }}
            />
          </div>
        </div>
      </div>

      <style>{`
        .key-metrics-container .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default KeyMetrics;
