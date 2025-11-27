
import React, { useState, useRef, useEffect } from 'react';
import { PracticeMetrics, MetricDetail } from '../types';
import { Info, ChevronRight, X } from 'lucide-react';

// Tooltip component that positions itself to stay in viewport
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

      let top = triggerRect.bottom + 8;
      let left = triggerRect.left - tooltipRect.width + triggerRect.width;

      // Adjust if tooltip goes off the right edge
      if (left + tooltipRect.width > viewportWidth - 16) {
        left = viewportWidth - tooltipRect.width - 16;
      }

      // Adjust if tooltip goes off the left edge
      if (left < 16) {
        left = 16;
      }

      // Adjust if tooltip goes off the bottom edge - show above instead
      if (top + tooltipRect.height > viewportHeight - 16) {
        top = triggerRect.top - tooltipRect.height - 8;
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
      <Info size={20} className="text-stone-300 hover:text-stone-500 cursor-help transition-colors" />
      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-[100000] w-80 animate-in fade-in duration-150"
          style={{
            top: position.top,
            left: position.left,
          }}
        >
          <div className="bg-stone-900 text-white rounded-xl p-5 shadow-2xl">
            <p className="font-bold text-base mb-2">{title}</p>
            <p className="text-stone-300 leading-relaxed text-sm">{description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const StatusIndicator: React.FC<{ status: MetricDetail['status'] }> = ({ status }) => {
  const configs = {
    'Healthy': { color: 'bg-emerald-500', label: 'On Track' },
    'Needs attention': { color: 'bg-amber-500', label: 'Monitor' },
    'Critical': { color: 'bg-rose-500', label: 'Action Needed' },
  };

  const config = configs[status];

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className={`w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full ${config.color}`} />
      <span className="text-sm sm:text-base lg:text-lg font-semibold text-stone-600">
        {config.label}
      </span>
    </div>
  );
};

const getMetricTooltip = (label: string): { title: string; description: string } => {
  const tooltips: Record<string, { title: string; description: string }> = {
    'Revenue': {
      title: 'Revenue',
      description: 'Total money collected this month toward your monthly goal.'
    },
    'Sessions': {
      title: 'Completed Sessions',
      description: 'Sessions completed this month. Utilization is the percentage of your session goal achieved.'
    },
    'Clients': {
      title: 'Active Clients',
      description: 'Clients active in SimplePractice. Discharged clients are no longer active. Openings shows how many new clients you can take on.'
    },
    'Attendance': {
      title: 'Rebook Rate',
      description: 'Percentage of active clients with their next session scheduled. Non-billable cancel rate is client and clinician cancellations combined.'
    },
    'Outstanding Notes': {
      title: 'Outstanding Notes',
      description: 'Sessions with overdue notes. Overdue notes delay billing and create compliance risk.'
    }
  };

  return tooltips[label] || { title: label, description: 'Practice metric overview' };
};

// 4-week booking forecast data
const BOOKING_FORECAST = [
  { week: 'Week of Nov 25', booked: 42 },
  { week: 'Week of Dec 2', booked: 38 },
  { week: 'Week of Dec 9', booked: 29 },
  { week: 'Week of Dec 16', booked: 18 },
];

// Weekly revenue data for current month
const WEEKLY_REVENUE = [
  { week: 'Oct 28 – Nov 3', revenue: 38200 },
  { week: 'Nov 4 – Nov 10', revenue: 41500 },
  { week: 'Nov 11 – Nov 17', revenue: 36800 },
  { week: 'Nov 18 – Nov 24', revenue: 36900 },
];

// Format currency
const formatCurrency = (amount: number) => {
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}k`;
  }
  return `$${amount}`;
};

// Revenue card with expandable weekly breakdown
const RevenueCard: React.FC<{ data: MetricDetail }> = ({ data }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const tooltip = getMetricTooltip(data.label);

  const statusColors = {
    'Healthy': 'bg-emerald-500',
    'Needs attention': 'bg-amber-500',
    'Critical': 'bg-rose-500'
  };

  const maxRevenue = Math.max(...WEEKLY_REVENUE.map(w => w.revenue));
  const totalRevenue = WEEKLY_REVENUE.reduce((sum, w) => sum + w.revenue, 0);

  return (
    <div className="relative">
      {/* Main Card */}
      <div
        className={`group relative bg-white rounded-2xl flex flex-col transition-all duration-300 hover:shadow-xl overflow-hidden ${isExpanded ? 'rounded-b-none' : ''}`}
        style={{
          boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)',
        }}
      >
        <div className={`h-1.5 ${statusColors[data.status]}`} />

        <div className="p-4 sm:p-5 xl:p-6 flex flex-col">
          <div className="flex items-center justify-between mb-3 xl:mb-4">
            <span className="text-sm sm:text-base lg:text-lg font-bold text-stone-700 uppercase tracking-wide">
              {data.label}
            </span>
            <Tooltip title={tooltip.title} description={tooltip.description} />
          </div>

          <div className="mb-2 xl:mb-3">
            <span className="text-3xl sm:text-4xl xl:text-5xl font-black text-stone-900 tracking-tight">
              {data.value}
            </span>
            {data.valueLabel && (
              <span className="text-base sm:text-lg xl:text-xl font-medium text-stone-400 ml-2">
                {data.valueLabel}
              </span>
            )}
          </div>

          <p className="text-sm sm:text-base lg:text-lg text-stone-500 leading-snug mb-4 xl:mb-5">
            {data.subtext}
          </p>

          <div className="pt-3 xl:pt-4 border-t border-stone-100 flex items-center justify-between">
            <StatusIndicator status={data.status} />
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                isExpanded
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <span className="hidden sm:inline">{isExpanded ? 'Close' : 'Weekly Breakdown'}</span>
              <span className="sm:hidden">{isExpanded ? 'Close' : 'Weekly'}</span>
              <ChevronRight
                size={14}
                className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Weekly Revenue Panel */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-out ${
          isExpanded ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div
          className="bg-white border-t border-stone-100 rounded-b-2xl p-4 sm:p-5"
          style={{
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          }}
        >
          {/* Simple bar chart */}
          <div className="space-y-3">
            {WEEKLY_REVENUE.map((week, index) => {
              const barWidth = (week.revenue / maxRevenue) * 100;

              return (
                <div key={week.week} className="flex items-center gap-3">
                  <span className="text-sm text-stone-500 w-28 shrink-0">{week.week}</span>
                  <div className="flex-1 h-8 bg-stone-100 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-stone-800 rounded-lg transition-all duration-700 ease-out"
                      style={{
                        width: isExpanded ? `${barWidth}%` : '0%',
                        transitionDelay: `${index * 100}ms`
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold text-stone-800 w-12 text-right">{formatCurrency(week.revenue)}</span>
                </div>
              );
            })}
          </div>

          {/* Total */}
          <div className="mt-4 pt-3 border-t border-stone-100">
            <p className="text-sm text-stone-500">
              <span className="font-bold text-stone-800">{formatCurrency(totalRevenue)}</span> total this month
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sessions card with expandable 4-week forecast
const SessionsCard: React.FC<{ data: MetricDetail }> = ({ data }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const tooltip = getMetricTooltip(data.label);

  const statusColors = {
    'Healthy': 'bg-emerald-500',
    'Needs attention': 'bg-amber-500',
    'Critical': 'bg-rose-500'
  };

  const maxBooked = Math.max(...BOOKING_FORECAST.map(w => w.booked));

  return (
    <div className="relative">
      {/* Main Card */}
      <div
        className={`group relative bg-white rounded-2xl flex flex-col transition-all duration-300 hover:shadow-xl overflow-hidden ${isExpanded ? 'rounded-b-none' : ''}`}
        style={{
          boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)',
        }}
      >
        <div className={`h-1.5 ${statusColors[data.status]}`} />

        <div className="p-4 sm:p-5 xl:p-6 flex flex-col">
          <div className="flex items-center justify-between mb-3 xl:mb-4">
            <span className="text-sm sm:text-base lg:text-lg font-bold text-stone-700 uppercase tracking-wide">
              {data.label}
            </span>
            <Tooltip title={tooltip.title} description={tooltip.description} />
          </div>

          <div className="mb-2 xl:mb-3">
            <span className="text-3xl sm:text-4xl xl:text-5xl font-black text-stone-900 tracking-tight">
              {data.value}
            </span>
            {data.valueLabel && (
              <span className="text-base sm:text-lg xl:text-xl font-medium text-stone-400 ml-2">
                {data.valueLabel}
              </span>
            )}
          </div>

          <p className="text-sm sm:text-base lg:text-lg text-stone-500 leading-snug mb-4 xl:mb-5">
            {data.subtext}
          </p>

          <div className="pt-3 xl:pt-4 border-t border-stone-100 flex items-center justify-between">
            <StatusIndicator status={data.status} />
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                isExpanded
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <span className="hidden sm:inline">{isExpanded ? 'Close' : 'Upcoming Bookings'}</span>
              <span className="sm:hidden">{isExpanded ? 'Close' : 'Bookings'}</span>
              <ChevronRight
                size={14}
                className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Forecast Panel */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-out ${
          isExpanded ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div
          className="bg-white border-t border-stone-100 rounded-b-2xl p-4 sm:p-5"
          style={{
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          }}
        >
          {/* Simple bar chart */}
          <div className="space-y-3">
            {BOOKING_FORECAST.map((week, index) => {
              const barWidth = (week.booked / maxBooked) * 100;

              return (
                <div key={week.week} className="flex items-center gap-3">
                  <span className="text-sm text-stone-500 w-28 shrink-0">{week.week}</span>
                  <div className="flex-1 h-8 bg-stone-100 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-stone-800 rounded-lg transition-all duration-700 ease-out"
                      style={{
                        width: isExpanded ? `${barWidth}%` : '0%',
                        transitionDelay: `${index * 100}ms`
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold text-stone-800 w-8 text-right">{week.booked}</span>
                </div>
              );
            })}
          </div>

          {/* Total */}
          <div className="mt-4 pt-3 border-t border-stone-100">
            <p className="text-sm text-stone-500">
              <span className="font-bold text-stone-800">127 sessions</span> booked total
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ data: MetricDetail; index: number }> = ({ data, index }) => {
  const tooltip = getMetricTooltip(data.label);

  const statusColors = {
    'Healthy': 'bg-emerald-500',
    'Needs attention': 'bg-amber-500',
    'Critical': 'bg-rose-500'
  };

  return (
    <div
      className="group relative bg-white rounded-2xl flex flex-col transition-all duration-300 hover:shadow-xl overflow-hidden"
      style={{
        boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)',
      }}
    >
      {/* Bold status bar at top */}
      <div className={`h-1.5 ${statusColors[data.status]}`} />

      {/* Content */}
      <div className="p-4 sm:p-5 xl:p-6 flex flex-col">

        {/* Label row */}
        <div className="flex items-center justify-between mb-3 xl:mb-4">
          <span className="text-sm sm:text-base lg:text-lg font-bold text-stone-700 uppercase tracking-wide">
            {data.label}
          </span>
          <Tooltip title={tooltip.title} description={tooltip.description} />
        </div>

        {/* Big value - the hero */}
        <div className="mb-2 xl:mb-3">
          <span className="text-3xl sm:text-4xl xl:text-5xl font-black text-stone-900 tracking-tight">
            {data.value}
          </span>
          {data.valueLabel && (
            <span className="text-base sm:text-lg xl:text-xl font-medium text-stone-400 ml-2">
              {data.valueLabel}
            </span>
          )}
        </div>

        {/* Subtext */}
        <p className="text-sm sm:text-base lg:text-lg text-stone-500 leading-snug mb-4 xl:mb-5">
          {data.subtext}
        </p>

        {/* Status footer */}
        <div className="pt-3 xl:pt-4 border-t border-stone-100">
          <StatusIndicator status={data.status} />
        </div>
      </div>
    </div>
  );
};

export const MetricsRow: React.FC<{ metrics: PracticeMetrics; isLive?: boolean }> = ({ metrics, isLive = true }) => {
  return (
    <>
      {/* Mobile/Tablet: Horizontal scroll (below lg/1024px) */}
      <div
        className="lg:hidden flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 -mx-4 sm:-mx-6 px-4 sm:px-6"
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        <div className="snap-start flex-shrink-0 w-[280px] sm:w-[320px] md:w-[340px]">
          {isLive ? <RevenueCard data={metrics.revenue} /> : <MetricCard data={metrics.revenue} index={0} />}
        </div>
        <div className="snap-start flex-shrink-0 w-[280px] sm:w-[320px] md:w-[340px]">
          {isLive ? <SessionsCard data={metrics.sessions} /> : <MetricCard data={metrics.sessions} index={1} />}
        </div>
        <div className="snap-start flex-shrink-0 w-[280px] sm:w-[320px] md:w-[340px]">
          <MetricCard data={metrics.clientGrowth} index={2} />
        </div>
        <div className="snap-start flex-shrink-0 w-[280px] sm:w-[320px] md:w-[340px]">
          <MetricCard data={metrics.attendance} index={3} />
        </div>
        <div className="snap-start flex-shrink-0 w-[280px] sm:w-[320px] md:w-[340px]">
          <MetricCard data={metrics.compliance} index={4} />
        </div>
      </div>

      {/* Desktop: Grid layout (lg/1024px and above) */}
      <div className="hidden lg:grid lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 lg:gap-4 xl:gap-5 items-start">
        {isLive ? (
          <RevenueCard data={metrics.revenue} />
        ) : (
          <MetricCard data={metrics.revenue} index={0} />
        )}
        {isLive ? (
          <SessionsCard data={metrics.sessions} />
        ) : (
          <MetricCard data={metrics.sessions} index={1} />
        )}
        <MetricCard data={metrics.clientGrowth} index={2} />
        <MetricCard data={metrics.attendance} index={3} />
        <MetricCard data={metrics.compliance} index={4} />
      </div>
    </>
  );
};
