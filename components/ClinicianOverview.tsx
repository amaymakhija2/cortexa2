import React, { useState } from 'react';
import { TrendingUp, TrendingDown, ChevronRight } from 'lucide-react';

type TimePeriod = 'last-12-months' | 'this-year' | 'this-quarter' | 'last-quarter' | 'this-month' | 'last-month';

const TIME_PERIODS: { id: TimePeriod; label: string }[] = [
  { id: 'last-12-months', label: 'Last 12 months' },
  { id: 'this-year', label: 'This Year' },
  { id: 'this-quarter', label: 'This Quarter' },
  { id: 'last-quarter', label: 'Last Quarter' },
  { id: 'this-month', label: 'This Month' },
  { id: 'last-month', label: 'Last Month' },
];

// Clinician data
const CLINICIANS_DATA = [
  {
    id: 1,
    name: 'Dr. Sarah Chen',
    shortName: 'S Chen',
    role: 'Clinical Director',
    avatar: 'SC',
    metrics: {
      revenue: 33000,
      sessions: 142,
      utilization: 92,
      showRate: 96,
      cancelRate: 6.2,
      retention: 94,
      clients: 34,
      newClients: 8
    },
    trend: 'up' as const,
    trendValue: 3.2
  },
  {
    id: 2,
    name: 'Dr. Maria Rodriguez',
    shortName: 'M Rodriguez',
    role: 'Senior Therapist',
    avatar: 'MR',
    metrics: {
      revenue: 30500,
      sessions: 130,
      utilization: 89,
      showRate: 94,
      cancelRate: 7.8,
      retention: 91,
      clients: 32,
      newClients: 6
    },
    trend: 'up' as const,
    trendValue: 1.8
  },
  {
    id: 3,
    name: 'Dr. Anil Patel',
    shortName: 'A Patel',
    role: 'Therapist',
    avatar: 'AP',
    metrics: {
      revenue: 27000,
      sessions: 115,
      utilization: 85,
      showRate: 91,
      cancelRate: 11.3,
      retention: 88,
      clients: 30,
      newClients: 5
    },
    trend: 'down' as const,
    trendValue: 2.1
  },
  {
    id: 4,
    name: 'Dr. Jennifer Kim',
    shortName: 'J Kim',
    role: 'Therapist',
    avatar: 'JK',
    metrics: {
      revenue: 24000,
      sessions: 125,
      utilization: 88,
      showRate: 93,
      cancelRate: 8.5,
      retention: 90,
      clients: 31,
      newClients: 7
    },
    trend: 'up' as const,
    trendValue: 2.5
  },
  {
    id: 5,
    name: 'Dr. Michael Johnson',
    shortName: 'M Johnson',
    role: 'Associate Therapist',
    avatar: 'MJ',
    metrics: {
      revenue: 23500,
      sessions: 108,
      utilization: 83,
      showRate: 89,
      cancelRate: 12.1,
      retention: 86,
      clients: 29,
      newClients: 4
    },
    trend: 'down' as const,
    trendValue: 1.5
  }
];

// Metric configurations
const METRICS = {
  revenue: {
    key: 'revenue',
    label: 'Revenue',
    format: (v: number) => `$${(v / 1000).toFixed(1)}K`,
    higherIsBetter: true
  },
  sessions: {
    key: 'sessions',
    label: 'Sessions',
    format: (v: number) => v.toString(),
    higherIsBetter: true
  },
  utilization: {
    key: 'utilization',
    label: 'Utilization',
    format: (v: number) => `${v}%`,
    higherIsBetter: true
  },
  showRate: {
    key: 'showRate',
    label: 'Show Rate',
    format: (v: number) => `${v}%`,
    higherIsBetter: true
  },
  cancelRate: {
    key: 'cancelRate',
    label: 'Cancel Rate',
    format: (v: number) => `${v.toFixed(1)}%`,
    higherIsBetter: false
  },
  retention: {
    key: 'retention',
    label: 'Retention',
    format: (v: number) => `${v}%`,
    higherIsBetter: true
  },
  clients: {
    key: 'clients',
    label: 'Caseload',
    format: (v: number) => v.toString(),
    higherIsBetter: true
  },
  newClients: {
    key: 'newClients',
    label: 'New Clients',
    format: (v: number) => v.toString(),
    higherIsBetter: true
  }
} as const;

type MetricKey = keyof typeof METRICS;

export const ClinicianOverview: React.FC = () => {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('utilization');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('last-12-months');

  const metric = METRICS[selectedMetric];

  // Sort clinicians
  const sortedClinicians = [...CLINICIANS_DATA].sort((a, b) => {
    const aVal = a.metrics[selectedMetric];
    const bVal = b.metrics[selectedMetric];
    return metric.higherIsBetter ? bVal - aVal : aVal - bVal;
  });

  // Calculate bar widths
  const maxVal = Math.max(...sortedClinicians.map(c => c.metrics[selectedMetric]));
  const minVal = Math.min(...sortedClinicians.map(c => c.metrics[selectedMetric]));

  const getBarWidth = (value: number) => {
    if (metric.higherIsBetter) {
      return (value / maxVal) * 100;
    } else {
      const range = maxVal - minVal;
      if (range === 0) return 100;
      return ((maxVal - value) / range) * 80 + 20;
    }
  };

  const teamAvg = Math.round(
    CLINICIANS_DATA.reduce((sum, c) => sum + c.metrics[selectedMetric], 0) / CLINICIANS_DATA.length
  );

  return (
    <div className="flex-1 overflow-y-auto h-[calc(100vh-80px)] bg-gradient-to-b from-stone-100 to-stone-50">
      <div className="min-h-full">

        {/* =============================================
            PART 1: METRIC SELECTOR - THE HERO SECTION
            ============================================= */}
        <div
          className="relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #1c1917 100%)'
          }}
        >
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)`,
              backgroundSize: '32px 32px'
            }}
          />

          {/* Warm glow accent */}
          <div
            className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
            style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }}
          />

          <div className="relative px-6 sm:px-8 lg:px-12 py-8 lg:py-10">
            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <p className="text-amber-500/80 text-sm font-semibold tracking-widest uppercase mb-2">
                  Team Performance
                </p>
                <h1
                  className="text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight"
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  Clinician Rankings
                </h1>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Time Period Selector */}
                <div className="relative">
                  {/* Mobile: Select dropdown */}
                  <select
                    value={timePeriod}
                    onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
                    className="lg:hidden px-3 py-2 rounded-xl border border-white/20 bg-white/10 text-sm font-medium text-white"
                  >
                    {TIME_PERIODS.map((period) => (
                      <option key={period.id} value={period.id} className="text-stone-900">{period.label}</option>
                    ))}
                  </select>

                  {/* Desktop: Button group */}
                  <div className="hidden lg:flex items-center gap-1 p-1 rounded-xl bg-white/10 backdrop-blur-sm">
                    {TIME_PERIODS.map((period) => (
                      <button
                        key={period.id}
                        onClick={() => setTimePeriod(period.id)}
                        className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                          timePeriod === period.id
                            ? 'bg-white text-stone-900 shadow-lg'
                            : 'text-white/70 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {period.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Team Average */}
                <div className="flex items-center gap-3 text-stone-400">
                  <span className="text-sm">Team Average:</span>
                  <span
                    className="text-2xl sm:text-3xl text-white font-bold"
                    style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                  >
                    {metric.format(teamAvg)}
                  </span>
                </div>
              </div>
            </div>

            {/* Metric selector label */}
            <p className="text-stone-500 text-sm font-medium mb-4 uppercase tracking-wider">
              Select metric to rank by
              {!metric.higherIsBetter && (
                <span className="ml-3 text-amber-500">· Lower values rank higher</span>
              )}
            </p>

            {/* Metric buttons - LARGE and PROMINENT */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {(Object.keys(METRICS) as MetricKey[]).map((key) => {
                const m = METRICS[key];
                const isSelected = selectedMetric === key;

                return (
                  <button
                    key={key}
                    onClick={() => setSelectedMetric(key)}
                    className={`
                      relative px-4 py-4 rounded-xl text-left
                      transition-all duration-300 ease-out
                      ${isSelected
                        ? 'bg-white shadow-2xl shadow-white/20 scale-[1.02]'
                        : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20'
                      }
                    `}
                  >
                    {/* Active indicator */}
                    {isSelected && (
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-amber-500 rounded-full" />
                    )}

                    <span
                      className={`block text-lg font-bold tracking-tight ${
                        isSelected ? 'text-stone-900' : 'text-white'
                      }`}
                    >
                      {m.label}
                    </span>

                    {!m.higherIsBetter && (
                      <span
                        className={`text-xs mt-1 block ${
                          isSelected ? 'text-amber-600' : 'text-amber-500/70'
                        }`}
                      >
                        Lower is better
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* =============================================
            PART 2: RANKING LIST - COMPACT & EFFICIENT
            ============================================= */}
        <div className="px-6 sm:px-8 lg:px-12 py-6 lg:py-8">

          {/* Column headers */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-3 text-xs font-bold text-stone-400 uppercase tracking-wider border-b border-stone-200 mb-2">
            <div className="col-span-1">Rank</div>
            <div className="col-span-3">Clinician</div>
            <div className="col-span-5">Performance</div>
            <div className="col-span-2 text-right">{metric.label}</div>
            <div className="col-span-1 text-right">Trend</div>
          </div>

          {/* Ranking rows */}
          <div className="space-y-2">
            {sortedClinicians.map((clinician, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === sortedClinicians.length - 1;
              const rank = idx + 1;
              const value = clinician.metrics[selectedMetric];
              const barWidth = getBarWidth(value);

              // Color theming
              const getTheme = () => {
                if (isFirst) return {
                  accent: '#10b981',
                  accentLight: '#ecfdf5',
                  bar: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
                  text: '#059669',
                  shadow: '0 4px 24px -4px rgba(16, 185, 129, 0.25)'
                };
                if (isLast) return {
                  accent: '#ef4444',
                  accentLight: '#fef2f2',
                  bar: 'linear-gradient(90deg, #ef4444 0%, #f87171 100%)',
                  text: '#dc2626',
                  shadow: '0 4px 24px -4px rgba(239, 68, 68, 0.15)'
                };
                return {
                  accent: '#78716c',
                  accentLight: '#f5f5f4',
                  bar: 'linear-gradient(90deg, #78716c 0%, #a8a29e 100%)',
                  text: '#44403c',
                  shadow: '0 2px 12px -2px rgba(0, 0, 0, 0.08)'
                };
              };

              const theme = getTheme();

              return (
                <div
                  key={clinician.id}
                  className="group bg-white rounded-xl lg:rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.01] cursor-pointer"
                  style={{ boxShadow: theme.shadow }}
                >
                  {/* Accent bar - thin and elegant */}
                  <div className="h-0.5" style={{ background: theme.bar }} />

                  <div className="px-4 sm:px-6 py-4 lg:py-5">
                    <div className="grid grid-cols-12 gap-3 lg:gap-4 items-center">

                      {/* RANK */}
                      <div className="col-span-2 lg:col-span-1">
                        <span
                          className="text-3xl lg:text-4xl font-black"
                          style={{
                            fontFamily: "'DM Serif Display', Georgia, serif",
                            color: theme.text
                          }}
                        >
                          {rank}
                        </span>
                      </div>

                      {/* CLINICIAN */}
                      <div className="col-span-6 lg:col-span-3 flex items-center gap-3">
                        <div
                          className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center text-sm lg:text-base font-bold text-white flex-shrink-0"
                          style={{
                            background: isFirst
                              ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                              : isLast
                                ? 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)'
                                : 'linear-gradient(135deg, #57534e 0%, #78716c 100%)'
                          }}
                        >
                          {clinician.avatar}
                        </div>
                        <div className="min-w-0">
                          <h3
                            className="text-base lg:text-lg text-stone-900 font-bold truncate"
                            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                          >
                            {clinician.shortName}
                          </h3>
                          <p className="text-stone-500 text-xs lg:text-sm truncate">
                            {clinician.role}
                          </p>
                        </div>
                      </div>

                      {/* BAR - Desktop only */}
                      <div className="hidden lg:block lg:col-span-5">
                        <div className="h-6 bg-stone-100 rounded-lg overflow-hidden">
                          <div
                            className="h-full rounded-lg transition-all duration-500 ease-out"
                            style={{
                              width: `${barWidth}%`,
                              background: theme.bar
                            }}
                          />
                        </div>
                      </div>

                      {/* VALUE */}
                      <div className="col-span-3 lg:col-span-2 text-right">
                        <span
                          className="text-xl lg:text-2xl font-black"
                          style={{
                            fontFamily: "'DM Serif Display', Georgia, serif",
                            color: theme.text
                          }}
                        >
                          {metric.format(value)}
                        </span>
                      </div>

                      {/* TREND */}
                      <div className="col-span-1 flex items-center justify-end gap-1">
                        {clinician.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-rose-500" />
                        )}
                        <span
                          className={`text-sm font-bold hidden sm:inline ${
                            clinician.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {clinician.trendValue}%
                        </span>
                      </div>
                    </div>

                    {/* Mobile bar */}
                    <div className="lg:hidden mt-3">
                      <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${barWidth}%`,
                            background: theme.bar
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-6 border-t border-stone-200 flex flex-wrap items-center gap-6 text-sm text-stone-500">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>Top performer</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <span>Needs attention</span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>Improving</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-500" />
              <span>Declining</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
