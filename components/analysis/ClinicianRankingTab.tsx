import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  Users,
  DollarSign,
  Target,
  CalendarX,
  Heart,
  UserMinus,
  FileText,
  AlertTriangle,
  Check
} from 'lucide-react';
import {
  PageHeader,
  PageContent,
  SectionContainer,
} from '../design-system';
import type {
  ClinicianRankingTabProps,
  RankingMetric,
  ClinicianData,
  MetricGroupId,
  MetricGroupConfig,
  MetricConfig
} from './types';

// =============================================================================
// CLINICIAN RANKING TAB COMPONENT
// =============================================================================
// Simplified approach: 6 "questions" practice managers ask, each showing
// a primary metric for ranking + supporting metrics for context.
// =============================================================================

// Icon components map
const ICONS = {
  DollarSign,
  Target,
  CalendarX,
  Heart,
  UserMinus,
  FileText,
};

// =============================================================================
// METRIC GROUP CONFIGURATIONS
// =============================================================================
// Each group represents a question practice managers ask

const METRIC_GROUPS: MetricGroupConfig[] = [
  {
    id: 'revenue',
    question: 'Who\'s generating the most revenue?',
    shortLabel: 'Revenue',
    description: 'Revenue performance and efficiency',
    icon: 'DollarSign',
    color: '#f59e0b', // amber
    primary: {
      key: 'revenue',
      label: 'Gross Revenue',
      shortLabel: 'Revenue',
      format: (v) => `$${(v / 1000).toFixed(1)}k`,
      higherIsBetter: true,
    },
    supporting: [
      {
        key: 'completedSessions',
        label: 'Sessions',
        shortLabel: 'Sessions',
        format: (v) => v.toLocaleString(),
        higherIsBetter: true,
      },
      {
        key: 'revenuePerSession',
        label: 'Per Session',
        shortLabel: '$/Session',
        format: (v) => `$${v.toFixed(0)}`,
        higherIsBetter: true,
      },
    ],
  },
  {
    id: 'goals',
    question: 'Who\'s meeting their goals?',
    shortLabel: 'Goals',
    description: 'Session goal achievement',
    icon: 'Target',
    color: '#6366f1', // indigo
    primary: {
      key: 'sessionGoalPercent',
      label: 'Session Goal %',
      shortLabel: 'Goal %',
      format: (v) => `${v.toFixed(0)}%`,
      higherIsBetter: true,
    },
    supporting: [
      {
        key: 'completedSessions',
        label: 'Completed',
        shortLabel: 'Sessions',
        format: (v) => v.toLocaleString(),
        higherIsBetter: true,
      },
      {
        key: 'utilizationRate',
        label: 'Capacity',
        shortLabel: 'Capacity',
        format: (v) => `${v.toFixed(0)}%`,
        higherIsBetter: true,
      },
    ],
  },
  {
    id: 'attendance',
    question: 'Who\'s losing appointments?',
    shortLabel: 'Attendance',
    description: 'Cancellations and no-shows',
    icon: 'CalendarX',
    color: '#ef4444', // red
    primary: {
      key: 'nonBillableCancelRate',
      label: 'Non-Billable Cancel Rate',
      shortLabel: 'Cancel Rate',
      format: (v) => `${v.toFixed(1)}%`,
      higherIsBetter: false,
    },
    supporting: [
      {
        key: 'clientCancelRate',
        label: 'Client Cancels',
        shortLabel: 'Client',
        format: (v) => `${v.toFixed(1)}%`,
        higherIsBetter: false,
      },
      {
        key: 'noShowRate',
        label: 'No-Shows',
        shortLabel: 'No-Show',
        format: (v) => `${v.toFixed(1)}%`,
        higherIsBetter: false,
      },
    ],
  },
  {
    id: 'engagement',
    question: 'Who\'s keeping clients engaged?',
    shortLabel: 'Engagement',
    description: 'Rebooking and session depth',
    icon: 'Heart',
    color: '#10b981', // emerald
    primary: {
      key: 'rebookRate',
      label: 'Rebook Rate',
      shortLabel: 'Rebook',
      format: (v) => `${v.toFixed(0)}%`,
      higherIsBetter: true,
    },
    supporting: [
      {
        key: 'atRiskClients',
        label: 'At-Risk',
        shortLabel: 'At-Risk',
        format: (v) => v.toString(),
        higherIsBetter: false,
      },
      {
        key: 'avgSessionsPerClient',
        label: 'Avg Sessions',
        shortLabel: 'Avg Sess',
        format: (v) => v.toFixed(1),
        higherIsBetter: true,
      },
    ],
  },
  {
    id: 'retention',
    question: 'Who\'s losing clients?',
    shortLabel: 'Retention',
    description: 'Churn and drop-off patterns',
    icon: 'UserMinus',
    color: '#f43f5e', // rose
    primary: {
      key: 'churnRate',
      label: 'Churn Rate',
      shortLabel: 'Churn',
      format: (v) => `${v.toFixed(1)}%`,
      higherIsBetter: false,
    },
    supporting: [
      {
        key: 'clientsChurned',
        label: 'Clients Lost',
        shortLabel: 'Lost',
        format: (v) => v.toString(),
        higherIsBetter: false,
      },
      {
        key: 'session1to2Dropoff',
        label: '1→2 Drop-off',
        shortLabel: '1→2 Drop',
        format: (v) => `${v.toFixed(0)}%`,
        higherIsBetter: false,
      },
    ],
  },
  {
    id: 'documentation',
    question: 'Who needs to catch up on notes?',
    shortLabel: 'Notes',
    description: 'Documentation compliance',
    icon: 'FileText',
    color: '#8b5cf6', // violet
    primary: {
      key: 'outstandingNotes',
      label: 'Outstanding Notes',
      shortLabel: 'Notes Due',
      format: (v) => v.toString(),
      higherIsBetter: false,
    },
    supporting: [], // No supporting metrics for this one
  },
];

// Clinician avatar colors
const CLINICIAN_COLORS: Record<string, string> = {
  Chen: '#7c3aed',
  Rodriguez: '#0891b2',
  Patel: '#d97706',
  Kim: '#db2777',
  Johnson: '#059669',
};

// =============================================================================
// MOCK DATA - Extended with new metrics
// =============================================================================
const MOCK_CLINICIANS: ClinicianData[] = [
  {
    id: '1',
    name: 'Chen',
    metrics: {
      revenue: 33000,
      revenuePerSession: 232,
      completedSessions: 142,
      sessionGoalPercent: 95,
      showRate: 96,
      nonBillableCancelRate: 6.2,
      clientCancelRate: 4.1,
      clinicianCancelRate: 0.9,
      noShowRate: 1.2,
      utilizationRate: 92,
      activeClients: 34,
      newClients: 8,
      rebookRate: 94,
      atRiskClients: 2,
      avgSessionsPerClient: 4.2,
      churnRate: 3.2,
      clientsChurned: 1,
      session1to2Dropoff: 8,
      earlyChurnPercent: 25,
      outstandingNotes: 0,
    },
    trends: {
      revenue: 5.2,
      revenuePerSession: 1.1,
      completedSessions: 4.8,
      sessionGoalPercent: 3.2,
      showRate: 0.5,
      nonBillableCancelRate: -1.2,
      clientCancelRate: -0.8,
      clinicianCancelRate: -0.2,
      noShowRate: -0.3,
      utilizationRate: 2.1,
      activeClients: 3.0,
      newClients: 12.5,
      rebookRate: 1.5,
      atRiskClients: -15,
      avgSessionsPerClient: 2.3,
      churnRate: -0.8,
      clientsChurned: -25,
      session1to2Dropoff: -2.1,
      earlyChurnPercent: -5,
      outstandingNotes: 0,
    },
  },
  {
    id: '2',
    name: 'Rodriguez',
    metrics: {
      revenue: 30500,
      revenuePerSession: 235,
      completedSessions: 130,
      sessionGoalPercent: 87,
      showRate: 94,
      nonBillableCancelRate: 7.8,
      clientCancelRate: 5.3,
      clinicianCancelRate: 0.7,
      noShowRate: 1.8,
      utilizationRate: 89,
      activeClients: 32,
      newClients: 6,
      rebookRate: 91,
      atRiskClients: 3,
      avgSessionsPerClient: 4.1,
      churnRate: 4.5,
      clientsChurned: 2,
      session1to2Dropoff: 12,
      earlyChurnPercent: 30,
      outstandingNotes: 2,
    },
    trends: {
      revenue: 3.1,
      revenuePerSession: 0.8,
      completedSessions: 2.4,
      sessionGoalPercent: 1.5,
      showRate: -0.3,
      nonBillableCancelRate: 0.5,
      clientCancelRate: 0.3,
      clinicianCancelRate: 0.1,
      noShowRate: 0.2,
      utilizationRate: 1.2,
      activeClients: 2.0,
      newClients: 8.3,
      rebookRate: 0.8,
      atRiskClients: 5,
      avgSessionsPerClient: 1.2,
      churnRate: 0.3,
      clientsChurned: 10,
      session1to2Dropoff: 1.5,
      earlyChurnPercent: 2,
      outstandingNotes: 50,
    },
  },
  {
    id: '3',
    name: 'Patel',
    metrics: {
      revenue: 27000,
      revenuePerSession: 235,
      completedSessions: 115,
      sessionGoalPercent: 77,
      showRate: 91,
      nonBillableCancelRate: 11.3,
      clientCancelRate: 7.2,
      clinicianCancelRate: 0.6,
      noShowRate: 3.5,
      utilizationRate: 85,
      activeClients: 30,
      newClients: 5,
      rebookRate: 82,
      atRiskClients: 6,
      avgSessionsPerClient: 3.8,
      churnRate: 8.2,
      clientsChurned: 4,
      session1to2Dropoff: 22,
      earlyChurnPercent: 45,
      outstandingNotes: 5,
    },
    trends: {
      revenue: -2.1,
      revenuePerSession: 0.2,
      completedSessions: -1.8,
      sessionGoalPercent: -3.5,
      showRate: -1.2,
      nonBillableCancelRate: 2.8,
      clientCancelRate: 1.9,
      clinicianCancelRate: 0.1,
      noShowRate: 1.1,
      utilizationRate: -1.5,
      activeClients: -2.0,
      newClients: -5.2,
      rebookRate: -2.3,
      atRiskClients: 25,
      avgSessionsPerClient: -0.5,
      churnRate: 1.8,
      clientsChurned: 33,
      session1to2Dropoff: 4.2,
      earlyChurnPercent: 8,
      outstandingNotes: 25,
    },
  },
  {
    id: '4',
    name: 'Kim',
    metrics: {
      revenue: 28500,
      revenuePerSession: 228,
      completedSessions: 125,
      sessionGoalPercent: 83,
      showRate: 93,
      nonBillableCancelRate: 8.5,
      clientCancelRate: 6.1,
      clinicianCancelRate: 0.3,
      noShowRate: 2.1,
      utilizationRate: 88,
      activeClients: 31,
      newClients: 7,
      rebookRate: 88,
      atRiskClients: 4,
      avgSessionsPerClient: 4.0,
      churnRate: 5.1,
      clientsChurned: 2,
      session1to2Dropoff: 15,
      earlyChurnPercent: 35,
      outstandingNotes: 1,
    },
    trends: {
      revenue: 4.5,
      revenuePerSession: 1.5,
      completedSessions: 3.2,
      sessionGoalPercent: 2.8,
      showRate: 0.8,
      nonBillableCancelRate: -0.6,
      clientCancelRate: -0.4,
      clinicianCancelRate: -0.1,
      noShowRate: -0.2,
      utilizationRate: 1.8,
      activeClients: 2.5,
      newClients: 10.1,
      rebookRate: 1.2,
      atRiskClients: -10,
      avgSessionsPerClient: 1.8,
      churnRate: -0.5,
      clientsChurned: -15,
      session1to2Dropoff: -1.8,
      earlyChurnPercent: -3,
      outstandingNotes: -50,
    },
  },
  {
    id: '5',
    name: 'Johnson',
    metrics: {
      revenue: 23500,
      revenuePerSession: 218,
      completedSessions: 108,
      sessionGoalPercent: 72,
      showRate: 89,
      nonBillableCancelRate: 12.1,
      clientCancelRate: 8.4,
      clinicianCancelRate: 0.5,
      noShowRate: 3.2,
      utilizationRate: 83,
      activeClients: 29,
      newClients: 4,
      rebookRate: 79,
      atRiskClients: 7,
      avgSessionsPerClient: 3.7,
      churnRate: 9.8,
      clientsChurned: 5,
      session1to2Dropoff: 28,
      earlyChurnPercent: 52,
      outstandingNotes: 4,
    },
    trends: {
      revenue: -1.5,
      revenuePerSession: -0.3,
      completedSessions: -2.1,
      sessionGoalPercent: -4.2,
      showRate: -1.5,
      nonBillableCancelRate: 3.2,
      clientCancelRate: 2.1,
      clinicianCancelRate: 0.2,
      noShowRate: 1.4,
      utilizationRate: -2.3,
      activeClients: -2.5,
      newClients: -8.5,
      rebookRate: -3.1,
      atRiskClients: 35,
      avgSessionsPerClient: -0.8,
      churnRate: 2.5,
      clientsChurned: 45,
      session1to2Dropoff: 5.8,
      earlyChurnPercent: 12,
      outstandingNotes: 100,
    },
  },
];

/**
 * ClinicianRankingTab - Simplified clinician comparison using 6 metric groups
 */
export const ClinicianRankingTab: React.FC<ClinicianRankingTabProps> = ({
  clinicians: _clinicians, // We'll use mock data for now
  tabs,
  activeTab,
  onTabChange,
}) => {
  // Use mock data until real data is wired up
  const clinicians = MOCK_CLINICIANS;

  const [selectedGroupId, setSelectedGroupId] = useState<MetricGroupId>('revenue');
  const [isGroupSelectorOpen, setIsGroupSelectorOpen] = useState(false);

  const selectedGroup = METRIC_GROUPS.find(g => g.id === selectedGroupId)!;
  const IconComponent = ICONS[selectedGroup.icon as keyof typeof ICONS];

  // Calculate team average for primary metric
  const teamAverage = useMemo(() => {
    const values = clinicians.map(c => c.metrics[selectedGroup.primary.key]);
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }, [clinicians, selectedGroup]);

  // Sort clinicians by primary metric
  const rankedClinicians = useMemo(() => {
    const sorted = [...clinicians].sort((a, b) => {
      const aVal = a.metrics[selectedGroup.primary.key];
      const bVal = b.metrics[selectedGroup.primary.key];
      return selectedGroup.primary.higherIsBetter ? bVal - aVal : aVal - bVal;
    });

    // Find where team average would rank
    let avgRankIndex = sorted.findIndex(c => {
      const val = c.metrics[selectedGroup.primary.key];
      return selectedGroup.primary.higherIsBetter ? val < teamAverage : val > teamAverage;
    });
    if (avgRankIndex === -1) avgRankIndex = sorted.length;

    return { sorted, avgRankIndex };
  }, [clinicians, selectedGroup, teamAverage]);

  // Get trend display
  const getTrendDisplay = (trend: number, higherIsBetter: boolean) => {
    const isPositive = higherIsBetter ? trend > 0 : trend < 0;
    const isNegative = higherIsBetter ? trend < 0 : trend > 0;

    let icon = <Minus className="w-3.5 h-3.5" />;
    let colorClass = 'text-stone-500 bg-stone-100';

    if (Math.abs(trend) > 1) {
      if (isPositive) {
        icon = <TrendingUp className="w-3.5 h-3.5" />;
        colorClass = 'text-emerald-600 bg-emerald-50';
      } else if (isNegative) {
        icon = <TrendingDown className="w-3.5 h-3.5" />;
        colorClass = 'text-rose-600 bg-rose-50';
      }
    }

    return { icon, colorClass };
  };

  // Get rank badge style
  const getRankStyle = (rank: number, isTop: boolean, isBottom: boolean) => {
    if (isTop) return {
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      accent: '#10b981'
    };
    if (isBottom) return {
      bg: 'bg-rose-100',
      text: 'text-rose-700',
      border: 'border-rose-200',
      accent: '#f43f5e'
    };
    return {
      bg: 'bg-stone-100',
      text: 'text-stone-600',
      border: 'border-stone-200',
      accent: '#78716c'
    };
  };

  // Check if value is above/below average
  const getPerformanceVsAvg = (value: number) => {
    const diff = value - teamAverage;
    const percentDiff = teamAverage !== 0 ? (diff / teamAverage) * 100 : 0;
    const isAbove = selectedGroup.primary.higherIsBetter ? diff > 0 : diff < 0;
    return { isAbove, percentDiff: Math.abs(percentDiff) };
  };

  return (
    <div className="min-h-full">
      {/* Page Header */}
      <PageHeader
        accent="violet"
        label="Team Performance"
        title="Clinician Rankings"
        subtitle="Compare your team across key performance areas"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />

      <PageContent>
        <SectionContainer accent="indigo" index={0} isFirst>
          {/* Question Selector */}
          <div className="mb-8">
            <div className="flex flex-col gap-4 mb-6">
              <div>
                <p className="text-stone-500 text-sm font-medium mb-2 uppercase tracking-wider">
                  What do you want to know?
                </p>
              </div>

              {/* Question Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsGroupSelectorOpen(!isGroupSelectorOpen)}
                  className="w-full sm:w-auto flex items-center gap-4 px-5 py-4 rounded-2xl bg-white border border-stone-200 hover:border-stone-300 transition-all duration-200 shadow-sm hover:shadow-md text-left"
                  style={{
                    boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${selectedGroup.color}15` }}
                  >
                    <IconComponent
                      className="w-6 h-6"
                      style={{ color: selectedGroup.color }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-stone-900 text-xl sm:text-2xl font-bold truncate"
                      style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                    >
                      {selectedGroup.question}
                    </p>
                    <p className="text-stone-500 text-sm mt-0.5">
                      Ranked by {selectedGroup.primary.label.toLowerCase()}
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-stone-400 transition-transform duration-200 flex-shrink-0 ${
                      isGroupSelectorOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isGroupSelectorOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsGroupSelectorOpen(false)}
                    />
                    <div
                      className="absolute top-full left-0 right-0 sm:right-auto mt-2 z-50 rounded-2xl bg-white border border-stone-200 overflow-hidden sm:min-w-[400px]"
                      style={{
                        boxShadow: '0 20px 40px -8px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                      }}
                    >
                      {METRIC_GROUPS.map((group) => {
                        const GroupIcon = ICONS[group.icon as keyof typeof ICONS];
                        const isSelected = selectedGroupId === group.id;

                        return (
                          <button
                            key={group.id}
                            onClick={() => {
                              setSelectedGroupId(group.id);
                              setIsGroupSelectorOpen(false);
                            }}
                            className={`w-full px-4 py-4 text-left hover:bg-stone-50 transition-colors flex items-center gap-4 border-b border-stone-100 last:border-b-0 ${
                              isSelected ? 'bg-violet-50' : ''
                            }`}
                          >
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: `${group.color}15` }}
                            >
                              <GroupIcon
                                className="w-5 h-5"
                                style={{ color: group.color }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`font-semibold text-base ${
                                  isSelected ? 'text-violet-700' : 'text-stone-900'
                                }`}
                              >
                                {group.question}
                              </p>
                              <p className="text-stone-500 text-sm">
                                {group.description}
                              </p>
                            </div>
                            {isSelected && (
                              <Check className="w-5 h-5 text-violet-600 flex-shrink-0" />
                            )}
                          </button>
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
                backgroundColor: selectedGroup.primary.higherIsBetter ? '#ecfdf5' : '#fef2f2',
              }}
            >
              {selectedGroup.primary.higherIsBetter ? (
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-rose-600" />
              )}
              <span
                className={`text-sm font-medium ${
                  selectedGroup.primary.higherIsBetter ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {selectedGroup.primary.higherIsBetter ? 'Higher is better' : 'Lower is better'}
              </span>
            </div>
          </div>

          {/* Ranking Table */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'white',
              boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)',
            }}
          >
            {/* Header Row */}
            <div
              className={`grid gap-4 px-4 sm:px-6 py-4 border-b border-stone-100 ${
                selectedGroup.supporting.length === 2
                  ? 'grid-cols-[50px_1fr_100px_80px_80px_90px]'
                  : selectedGroup.supporting.length === 1
                    ? 'grid-cols-[50px_1fr_100px_80px_90px]'
                    : 'grid-cols-[50px_1fr_100px_90px]'
              }`}
              style={{ backgroundColor: '#fafaf9' }}
            >
              <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Rank
              </div>
              <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Clinician
              </div>
              <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider text-right">
                {selectedGroup.primary.shortLabel}
              </div>
              {selectedGroup.supporting.map((metric) => (
                <div
                  key={metric.key}
                  className="text-xs font-semibold text-stone-400 uppercase tracking-wider text-right hidden sm:block"
                >
                  {metric.shortLabel}
                </div>
              ))}
              <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider text-right">
                Trend
              </div>
            </div>

            {/* Clinician Rows */}
            {rankedClinicians.sorted.map((clinician, index) => {
              const rank = index + 1;
              const primaryValue = clinician.metrics[selectedGroup.primary.key];
              const primaryTrend = clinician.trends[selectedGroup.primary.key];
              const isTop = index === 0;
              const isBottom = index === rankedClinicians.sorted.length - 1;
              const rankStyle = getRankStyle(rank, isTop, isBottom);
              const { isAbove, percentDiff } = getPerformanceVsAvg(primaryValue);
              const { icon: trendIcon, colorClass: trendColorClass } = getTrendDisplay(
                primaryTrend,
                selectedGroup.primary.higherIsBetter
              );

              // Check if team average row should appear
              const showAverageBefore = index === rankedClinicians.avgRankIndex;
              const isLastItem = index === rankedClinicians.sorted.length - 1;
              const showAverageAfter = isLastItem && rankedClinicians.avgRankIndex === rankedClinicians.sorted.length;

              // Team Average Row Component
              const TeamAverageRow = () => (
                <div
                  className={`grid gap-4 px-4 sm:px-6 py-4 items-center ${
                    selectedGroup.supporting.length === 2
                      ? 'grid-cols-[50px_1fr_100px_80px_80px_90px]'
                      : selectedGroup.supporting.length === 1
                        ? 'grid-cols-[50px_1fr_100px_80px_90px]'
                        : 'grid-cols-[50px_1fr_100px_90px]'
                  }`}
                  style={{
                    background: 'linear-gradient(90deg, #f5f5f4 0%, #fafaf9 50%, #f5f5f4 100%)',
                    borderTop: '2px dashed #d6d3d1',
                    borderBottom: '2px dashed #d6d3d1',
                  }}
                >
                  <div className="flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center">
                      <Users className="w-4 h-4 text-stone-500" />
                    </div>
                  </div>
                  <div>
                    <p
                      className="text-stone-600 font-semibold text-base"
                      style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                    >
                      Team Average
                    </p>
                    <p className="text-stone-500 text-xs">
                      {clinicians.length} clinicians
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-stone-600 font-bold text-lg"
                      style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                    >
                      {selectedGroup.primary.format(teamAverage)}
                    </p>
                  </div>
                  {selectedGroup.supporting.map((metric) => {
                    const avgValue = clinicians.reduce((sum, c) => sum + c.metrics[metric.key], 0) / clinicians.length;
                    return (
                      <div key={metric.key} className="text-right hidden sm:block">
                        <p className="text-stone-500 text-sm font-medium">
                          {metric.format(avgValue)}
                        </p>
                      </div>
                    );
                  })}
                  <div className="text-right">
                    <span className="text-stone-400 text-sm">—</span>
                  </div>
                </div>
              );

              return (
                <React.Fragment key={clinician.id}>
                  {showAverageBefore && <TeamAverageRow />}

                  <div
                    className={`grid gap-4 px-4 sm:px-6 py-4 items-center transition-all duration-200 hover:bg-stone-50 cursor-pointer ${
                      selectedGroup.supporting.length === 2
                        ? 'grid-cols-[50px_1fr_100px_80px_80px_90px]'
                        : selectedGroup.supporting.length === 1
                          ? 'grid-cols-[50px_1fr_100px_80px_90px]'
                          : 'grid-cols-[50px_1fr_100px_90px]'
                    } ${!isLastItem && !showAverageAfter ? 'border-b border-stone-100' : ''}`}
                  >
                    {/* Rank */}
                    <div className="flex items-center justify-center">
                      <div
                        className={`w-8 h-8 rounded-full ${rankStyle.bg} ${rankStyle.border} border flex items-center justify-center`}
                      >
                        <span
                          className={`${rankStyle.text} font-bold text-sm`}
                          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                        >
                          {rank}
                        </span>
                      </div>
                    </div>

                    {/* Clinician */}
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                        style={{
                          backgroundColor: CLINICIAN_COLORS[clinician.name] || '#6b7280',
                          fontFamily: "'DM Serif Display', Georgia, serif",
                        }}
                      >
                        {clinician.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p
                          className="text-stone-900 font-semibold text-base truncate"
                          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                        >
                          {clinician.name}
                        </p>
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

                    {/* Primary Metric */}
                    <div className="text-right">
                      <p
                        className={`font-bold text-xl ${
                          isTop ? 'text-emerald-700' : isBottom ? 'text-rose-700' : 'text-stone-900'
                        }`}
                        style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                      >
                        {selectedGroup.primary.format(primaryValue)}
                      </p>
                    </div>

                    {/* Supporting Metrics */}
                    {selectedGroup.supporting.map((metric) => {
                      const value = clinician.metrics[metric.key];
                      return (
                        <div key={metric.key} className="text-right hidden sm:block">
                          <p className="text-stone-600 text-sm font-medium">
                            {metric.format(value)}
                          </p>
                        </div>
                      );
                    })}

                    {/* Trend */}
                    <div className="flex justify-end">
                      <div
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full ${trendColorClass}`}
                      >
                        {trendIcon}
                        <span className="text-xs font-semibold">
                          {primaryTrend > 0 ? '+' : ''}{primaryTrend.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {showAverageAfter && <TeamAverageRow />}
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
                background: 'linear-gradient(135deg, #d1fae5 0%, #ecfdf5 100%)',
                boxShadow: '0 2px 12px -2px rgba(16, 185, 129, 0.15)',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <span className="text-emerald-700 text-sm font-semibold uppercase tracking-wider">
                  Top Performer
                </span>
              </div>
              <p
                className="text-emerald-900 text-xl sm:text-2xl font-bold"
                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
              >
                {rankedClinicians.sorted[0]?.name}
              </p>
              <p className="text-emerald-700 text-base mt-1">
                {selectedGroup.primary.format(rankedClinicians.sorted[0]?.metrics[selectedGroup.primary.key] || 0)}
              </p>
            </div>

            {/* Most Improved */}
            <div
              className="rounded-2xl p-5 sm:p-6"
              style={{
                background: 'linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%)',
                boxShadow: '0 2px 12px -2px rgba(245, 158, 11, 0.15)',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-amber-600" />
                <span className="text-amber-700 text-sm font-semibold uppercase tracking-wider">
                  Most Improved
                </span>
              </div>
              {(() => {
                const mostImproved = [...clinicians].sort((a, b) => {
                  const aTrend = selectedGroup.primary.higherIsBetter
                    ? a.trends[selectedGroup.primary.key]
                    : -a.trends[selectedGroup.primary.key];
                  const bTrend = selectedGroup.primary.higherIsBetter
                    ? b.trends[selectedGroup.primary.key]
                    : -b.trends[selectedGroup.primary.key];
                  return bTrend - aTrend;
                })[0];
                const trend = mostImproved?.trends[selectedGroup.primary.key] || 0;
                return (
                  <>
                    <p
                      className="text-amber-900 text-xl sm:text-2xl font-bold"
                      style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                    >
                      {mostImproved?.name}
                    </p>
                    <p className="text-amber-700 text-base mt-1">
                      {trend > 0 ? '+' : ''}{trend.toFixed(0)}% this period
                    </p>
                  </>
                );
              })()}
            </div>

            {/* Needs Support */}
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
                const { percentDiff } = getPerformanceVsAvg(needsSupport?.metrics[selectedGroup.primary.key] || 0);
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
