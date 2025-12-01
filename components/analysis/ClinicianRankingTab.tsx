import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, ChevronDown, Users, DollarSign, Calendar, UserCheck, AlertTriangle, Clock, FileText } from 'lucide-react';
import {
  PageHeader,
  PageContent,
  SectionHeader,
  SectionContainer,
} from '../design-system';
import type { ClinicianRankingTabProps, RankingMetric, ClinicianData } from './types';

// =============================================================================
// CLINICIAN RANKING TAB COMPONENT
// =============================================================================
// Allows practice owners to select a metric and see clinicians ranked by it.
// Team average is displayed as a row in the ranking for easy comparison.
// =============================================================================

// Metric category configuration
const METRIC_CATEGORIES = {
  financial: {
    label: 'Financial',
    icon: DollarSign,
    color: '#f59e0b',
  },
  sessions: {
    label: 'Sessions',
    icon: Calendar,
    color: '#6366f1',
  },
  clients: {
    label: 'Clients',
    icon: Users,
    color: '#06b6d4',
  },
  retention: {
    label: 'Retention',
    icon: UserCheck,
    color: '#10b981',
  },
  compliance: {
    label: 'Compliance',
    icon: FileText,
    color: '#8b5cf6',
  },
};

// Metric definitions with formatting and direction
const METRIC_CONFIG: Record<RankingMetric, {
  label: string;
  shortLabel: string;
  category: keyof typeof METRIC_CATEGORIES;
  format: (value: number) => string;
  higherIsBetter: boolean;
  description: string;
}> = {
  revenue: {
    label: 'Revenue Generated',
    shortLabel: 'Revenue',
    category: 'financial',
    format: (v) => `$${(v / 1000).toFixed(1)}k`,
    higherIsBetter: true,
    description: 'Total revenue generated this period',
  },
  completedSessions: {
    label: 'Completed Sessions',
    shortLabel: 'Sessions',
    category: 'sessions',
    format: (v) => v.toLocaleString(),
    higherIsBetter: true,
    description: 'Number of sessions completed',
  },
  utilizationRate: {
    label: 'Utilization Rate',
    shortLabel: 'Utilization',
    category: 'clients',
    format: (v) => `${v.toFixed(0)}%`,
    higherIsBetter: true,
    description: 'Percentage of client capacity filled',
  },
  retentionRate: {
    label: 'Retention Rate',
    shortLabel: 'Retention',
    category: 'retention',
    format: (v) => `${v.toFixed(0)}%`,
    higherIsBetter: true,
    description: 'Percentage of clients retained',
  },
  cancellationRate: {
    label: 'Cancellation Rate',
    shortLabel: 'Cancellations',
    category: 'sessions',
    format: (v) => `${v.toFixed(1)}%`,
    higherIsBetter: false,
    description: 'Rate of client cancellations',
  },
  rebookRate: {
    label: 'Rebook Rate',
    shortLabel: 'Rebook',
    category: 'retention',
    format: (v) => `${v.toFixed(0)}%`,
    higherIsBetter: true,
    description: 'Clients with next appointment scheduled',
  },
  newClients: {
    label: 'New Clients Acquired',
    shortLabel: 'New Clients',
    category: 'clients',
    format: (v) => `+${v}`,
    higherIsBetter: true,
    description: 'New clients acquired this period',
  },
  churnRate: {
    label: 'Churn Rate',
    shortLabel: 'Churn',
    category: 'retention',
    format: (v) => `${v.toFixed(1)}%`,
    higherIsBetter: false,
    description: 'Percentage of clients lost',
  },
  outstandingNotes: {
    label: 'Outstanding Notes',
    shortLabel: 'Notes Due',
    category: 'compliance',
    format: (v) => v.toString(),
    higherIsBetter: false,
    description: 'Overdue documentation',
  },
  showRate: {
    label: 'Show Rate',
    shortLabel: 'Show Rate',
    category: 'sessions',
    format: (v) => `${v.toFixed(0)}%`,
    higherIsBetter: true,
    description: 'Percentage of booked sessions attended',
  },
  activeClients: {
    label: 'Active Clients',
    shortLabel: 'Active',
    category: 'clients',
    format: (v) => v.toString(),
    higherIsBetter: true,
    description: 'Current active caseload',
  },
  avgSessionsPerClient: {
    label: 'Avg Sessions/Client',
    shortLabel: 'Avg Sessions',
    category: 'retention',
    format: (v) => v.toFixed(1),
    higherIsBetter: true,
    description: 'Average sessions per client',
  },
};

// Clinician avatar colors
const CLINICIAN_COLORS: Record<string, string> = {
  Chen: '#7c3aed',
  Rodriguez: '#0891b2',
  Patel: '#d97706',
  Kim: '#db2777',
  Johnson: '#059669',
};

/**
 * ClinicianRankingTab - Clinician performance ranking by selected metric
 */
export const ClinicianRankingTab: React.FC<ClinicianRankingTabProps> = ({
  clinicians,
  tabs,
  activeTab,
  onTabChange,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<RankingMetric>('revenue');
  const [isMetricSelectorOpen, setIsMetricSelectorOpen] = useState(false);

  const metricConfig = METRIC_CONFIG[selectedMetric];
  const categoryConfig = METRIC_CATEGORIES[metricConfig.category];

  // Calculate team average
  const teamAverage = useMemo(() => {
    const values = clinicians.map(c => c.metrics[selectedMetric]);
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }, [clinicians, selectedMetric]);

  // Sort clinicians by selected metric
  const rankedClinicians = useMemo(() => {
    const sorted = [...clinicians].sort((a, b) => {
      const aVal = a.metrics[selectedMetric];
      const bVal = b.metrics[selectedMetric];
      return metricConfig.higherIsBetter ? bVal - aVal : aVal - bVal;
    });

    // Find where team average would rank
    let avgRankIndex = sorted.findIndex(c => {
      const val = c.metrics[selectedMetric];
      return metricConfig.higherIsBetter ? val < teamAverage : val > teamAverage;
    });
    if (avgRankIndex === -1) avgRankIndex = sorted.length;

    return { sorted, avgRankIndex };
  }, [clinicians, selectedMetric, teamAverage, metricConfig.higherIsBetter]);

  // Get trend icon
  const getTrendIcon = (trend: number) => {
    if (trend > 2) return <TrendingUp className="w-4 h-4" />;
    if (trend < -2) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  // Get trend color
  const getTrendColor = (trend: number, higherIsBetter: boolean) => {
    const isPositive = higherIsBetter ? trend > 0 : trend < 0;
    const isNegative = higherIsBetter ? trend < 0 : trend > 0;
    if (isPositive) return 'text-emerald-600 bg-emerald-50';
    if (isNegative) return 'text-rose-600 bg-rose-50';
    return 'text-stone-500 bg-stone-100';
  };

  // Get rank badge style
  const getRankBadgeStyle = (rank: number) => {
    if (rank === 1) return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' };
    if (rank === 2) return { bg: 'bg-stone-200', text: 'text-stone-700', border: 'border-stone-300' };
    if (rank === 3) return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' };
    return { bg: 'bg-stone-100', text: 'text-stone-600', border: 'border-stone-200' };
  };

  // Check if value is above/below average
  const getPerformanceStatus = (value: number) => {
    const diff = value - teamAverage;
    const percentDiff = (diff / teamAverage) * 100;
    const isAbove = metricConfig.higherIsBetter ? diff > 0 : diff < 0;
    return { isAbove, percentDiff: Math.abs(percentDiff) };
  };

  return (
    <div className="min-h-full">
      {/* Page Header */}
      <PageHeader
        accent="violet"
        label="Team Performance"
        title="Clinician Rankings"
        subtitle="Compare clinician performance across key metrics"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />

      <PageContent>
        <SectionContainer accent="indigo" index={0} isFirst>
          {/* Metric Selector */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2
                  className="text-2xl sm:text-3xl text-stone-900 mb-1"
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  Rank by Metric
                </h2>
                <p className="text-stone-500 text-base">
                  Select a metric to see how your team compares
                </p>
              </div>

              {/* Metric Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsMetricSelectorOpen(!isMetricSelectorOpen)}
                  className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white border border-stone-200 hover:border-stone-300 transition-all duration-200 shadow-sm hover:shadow-md min-w-[240px]"
                  style={{
                    boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${categoryConfig.color}15` }}
                  >
                    <categoryConfig.icon
                      className="w-5 h-5"
                      style={{ color: categoryConfig.color }}
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-stone-900 font-semibold text-base">
                      {metricConfig.label}
                    </p>
                    <p className="text-stone-500 text-sm">
                      {categoryConfig.label}
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-stone-400 transition-transform duration-200 ${
                      isMetricSelectorOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isMetricSelectorOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsMetricSelectorOpen(false)}
                    />
                    <div
                      className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl bg-white border border-stone-200 overflow-hidden"
                      style={{
                        boxShadow: '0 20px 40px -8px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                        maxHeight: '400px',
                        overflowY: 'auto',
                      }}
                    >
                      {Object.entries(METRIC_CATEGORIES).map(([catKey, catConfig]) => {
                        const metrics = Object.entries(METRIC_CONFIG).filter(
                          ([, config]) => config.category === catKey
                        );
                        if (metrics.length === 0) return null;

                        return (
                          <div key={catKey}>
                            <div
                              className="px-4 py-2.5 bg-stone-50 border-b border-stone-100 flex items-center gap-2"
                            >
                              <catConfig.icon
                                className="w-4 h-4"
                                style={{ color: catConfig.color }}
                              />
                              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                                {catConfig.label}
                              </span>
                            </div>
                            {metrics.map(([metricKey, config]) => (
                              <button
                                key={metricKey}
                                onClick={() => {
                                  setSelectedMetric(metricKey as RankingMetric);
                                  setIsMetricSelectorOpen(false);
                                }}
                                className={`w-full px-4 py-3 text-left hover:bg-stone-50 transition-colors flex items-center justify-between ${
                                  selectedMetric === metricKey ? 'bg-violet-50' : ''
                                }`}
                              >
                                <div>
                                  <p
                                    className={`font-medium ${
                                      selectedMetric === metricKey
                                        ? 'text-violet-700'
                                        : 'text-stone-900'
                                    }`}
                                  >
                                    {config.label}
                                  </p>
                                  <p className="text-stone-500 text-sm">
                                    {config.description}
                                  </p>
                                </div>
                                {!config.higherIsBetter && (
                                  <span className="text-xs px-2 py-1 rounded-full bg-stone-100 text-stone-500">
                                    Lower is better
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Direction Indicator */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl"
              style={{
                backgroundColor: metricConfig.higherIsBetter ? '#ecfdf5' : '#fef2f2',
              }}
            >
              {metricConfig.higherIsBetter ? (
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-rose-600" />
              )}
              <span
                className={`text-sm font-medium ${
                  metricConfig.higherIsBetter ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {metricConfig.higherIsBetter ? 'Higher is better' : 'Lower is better'}
              </span>
            </div>
          </div>

          {/* Ranking List */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'white',
              boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)',
            }}
          >
            {/* Header Row */}
            <div
              className="grid grid-cols-[60px_1fr_140px_100px] sm:grid-cols-[80px_1fr_160px_120px] gap-4 px-4 sm:px-6 py-4 border-b border-stone-100"
              style={{ backgroundColor: '#fafaf9' }}
            >
              <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Rank
              </div>
              <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Clinician
              </div>
              <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider text-right">
                {metricConfig.shortLabel}
              </div>
              <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider text-right">
                Trend
              </div>
            </div>

            {/* Clinician Rows */}
            {rankedClinicians.sorted.map((clinician, index) => {
              const rank = index + 1;
              const value = clinician.metrics[selectedMetric];
              const trend = clinician.trends[selectedMetric];
              const rankStyle = getRankBadgeStyle(rank);
              const { isAbove, percentDiff } = getPerformanceStatus(value);

              // Insert team average row at the right position
              const showAverageBefore = index === rankedClinicians.avgRankIndex;
              const showAverageAfter = index === rankedClinicians.sorted.length - 1 && rankedClinicians.avgRankIndex === rankedClinicians.sorted.length;

              return (
                <React.Fragment key={clinician.id}>
                  {/* Team Average Row (before) */}
                  {showAverageBefore && (
                    <div
                      className="grid grid-cols-[60px_1fr_140px_100px] sm:grid-cols-[80px_1fr_160px_120px] gap-4 px-4 sm:px-6 py-4 items-center"
                      style={{
                        background: 'linear-gradient(90deg, #f5f5f4 0%, #fafaf9 50%, #f5f5f4 100%)',
                        borderTop: '2px dashed #d6d3d1',
                        borderBottom: '2px dashed #d6d3d1',
                      }}
                    >
                      <div className="flex items-center justify-center">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-stone-200 flex items-center justify-center">
                          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-stone-500" />
                        </div>
                      </div>
                      <div>
                        <p
                          className="text-stone-600 font-semibold text-base sm:text-lg"
                          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                        >
                          Team Average
                        </p>
                        <p className="text-stone-500 text-sm">
                          {clinicians.length} clinicians
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className="text-stone-700 font-bold text-xl sm:text-2xl"
                          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                        >
                          {metricConfig.format(teamAverage)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-stone-400 text-sm">—</span>
                      </div>
                    </div>
                  )}

                  {/* Clinician Row */}
                  <div
                    className={`grid grid-cols-[60px_1fr_140px_100px] sm:grid-cols-[80px_1fr_160px_120px] gap-4 px-4 sm:px-6 py-4 items-center transition-all duration-200 hover:bg-stone-50 cursor-pointer ${
                      index < rankedClinicians.sorted.length - 1 ? 'border-b border-stone-100' : ''
                    }`}
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    {/* Rank Badge */}
                    <div className="flex items-center justify-center">
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${rankStyle.bg} ${rankStyle.border} border-2 flex items-center justify-center`}
                      >
                        <span
                          className={`${rankStyle.text} font-bold text-sm sm:text-base`}
                          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                        >
                          {rank}
                        </span>
                      </div>
                    </div>

                    {/* Clinician Info */}
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg sm:text-xl flex-shrink-0"
                        style={{
                          backgroundColor: CLINICIAN_COLORS[clinician.name] || '#6b7280',
                          fontFamily: "'DM Serif Display', Georgia, serif",
                        }}
                      >
                        {clinician.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p
                          className="text-stone-900 font-semibold text-base sm:text-lg truncate"
                          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                        >
                          {clinician.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              isAbove
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {isAbove ? '+' : '-'}{percentDiff.toFixed(0)}% vs avg
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Metric Value */}
                    <div className="text-right">
                      <p
                        className={`font-bold text-xl sm:text-2xl ${
                          isAbove ? 'text-stone-900' : 'text-stone-600'
                        }`}
                        style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                      >
                        {metricConfig.format(value)}
                      </p>
                    </div>

                    {/* Trend */}
                    <div className="flex justify-end">
                      <div
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${getTrendColor(
                          trend,
                          metricConfig.higherIsBetter
                        )}`}
                      >
                        {getTrendIcon(trend)}
                        <span className="text-sm font-semibold">
                          {trend > 0 ? '+' : ''}{trend.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Team Average Row (after last item if avg is lowest) */}
                  {showAverageAfter && (
                    <div
                      className="grid grid-cols-[60px_1fr_140px_100px] sm:grid-cols-[80px_1fr_160px_120px] gap-4 px-4 sm:px-6 py-4 items-center"
                      style={{
                        background: 'linear-gradient(90deg, #f5f5f4 0%, #fafaf9 50%, #f5f5f4 100%)',
                        borderTop: '2px dashed #d6d3d1',
                      }}
                    >
                      <div className="flex items-center justify-center">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-stone-200 flex items-center justify-center">
                          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-stone-500" />
                        </div>
                      </div>
                      <div>
                        <p
                          className="text-stone-600 font-semibold text-base sm:text-lg"
                          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                        >
                          Team Average
                        </p>
                        <p className="text-stone-500 text-sm">
                          {clinicians.length} clinicians
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className="text-stone-700 font-bold text-xl sm:text-2xl"
                          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                        >
                          {metricConfig.format(teamAverage)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-stone-400 text-sm">—</span>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Quick Stats Summary */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Top Performer */}
            <div
              className="rounded-2xl p-5 sm:p-6"
              style={{
                background: 'linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%)',
                boxShadow: '0 2px 12px -2px rgba(245, 158, 11, 0.15)',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <span className="text-amber-700 text-sm font-semibold uppercase tracking-wider">
                  Top Performer
                </span>
              </div>
              <p
                className="text-amber-900 text-xl sm:text-2xl font-bold"
                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
              >
                {rankedClinicians.sorted[0]?.name}
              </p>
              <p className="text-amber-700 text-base mt-1">
                {metricConfig.format(rankedClinicians.sorted[0]?.metrics[selectedMetric] || 0)}
              </p>
            </div>

            {/* Biggest Improvement */}
            <div
              className="rounded-2xl p-5 sm:p-6"
              style={{
                background: 'linear-gradient(135deg, #d1fae5 0%, #ecfdf5 100%)',
                boxShadow: '0 2px 12px -2px rgba(16, 185, 129, 0.15)',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <span className="text-emerald-700 text-sm font-semibold uppercase tracking-wider">
                  Most Improved
                </span>
              </div>
              {(() => {
                const mostImproved = [...clinicians].sort((a, b) => {
                  const aTrend = metricConfig.higherIsBetter ? a.trends[selectedMetric] : -a.trends[selectedMetric];
                  const bTrend = metricConfig.higherIsBetter ? b.trends[selectedMetric] : -b.trends[selectedMetric];
                  return bTrend - aTrend;
                })[0];
                return (
                  <>
                    <p
                      className="text-emerald-900 text-xl sm:text-2xl font-bold"
                      style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                    >
                      {mostImproved?.name}
                    </p>
                    <p className="text-emerald-700 text-base mt-1">
                      {mostImproved?.trends[selectedMetric] > 0 ? '+' : ''}
                      {mostImproved?.trends[selectedMetric].toFixed(0)}% this period
                    </p>
                  </>
                );
              })()}
            </div>

            {/* Needs Attention */}
            <div
              className="rounded-2xl p-5 sm:p-6"
              style={{
                background: 'linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%)',
                boxShadow: '0 2px 12px -2px rgba(239, 68, 68, 0.15)',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span className="text-rose-700 text-sm font-semibold uppercase tracking-wider">
                  Needs Support
                </span>
              </div>
              {(() => {
                const needsSupport = rankedClinicians.sorted[rankedClinicians.sorted.length - 1];
                const { percentDiff } = getPerformanceStatus(needsSupport?.metrics[selectedMetric] || 0);
                return (
                  <>
                    <p
                      className="text-rose-900 text-xl sm:text-2xl font-bold"
                      style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                    >
                      {needsSupport?.name}
                    </p>
                    <p className="text-rose-700 text-base mt-1">
                      {percentDiff.toFixed(0)}% below average
                    </p>
                  </>
                );
              })()}
            </div>
          </div>
        </SectionContainer>
      </PageContent>
    </div>
  );
};

export default ClinicianRankingTab;
