import React, { useState, useMemo } from 'react';
import { Users } from 'lucide-react';
import { getClinicianMetricsForPeriod, getClinicianMetricsForMonth, getDataDateRange, ClinicianMetricsCalculated } from '../data/metricsCalculator';
import { PRACTICE_SETTINGS } from '../data/paymentData';
import { MonthPicker } from './MonthPicker';

// =============================================================================
// CLINICIAN OVERVIEW COMPONENT
// =============================================================================
// Simplified approach: 6 "questions" practice managers ask, each showing
// a primary metric for ranking + supporting metrics for context.
// Uses the original card-based UI with horizontal bars.
// =============================================================================

type ViewMode = 'last-12-months' | 'live' | 'historical';

// Get data date range for month picker bounds
const DATA_RANGE = getDataDateRange();

// Metric group IDs - the 6 "questions" practice managers ask
type MetricGroupId = 'revenue' | 'caseload' | 'growth' | 'sessions' | 'attendance' | 'engagement' | 'retention' | 'documentation';

// Metric configuration
interface MetricConfig {
  key: string;
  label: string;
  shortLabel: string;
  format: (value: number) => string;
  higherIsBetter: boolean;
}

interface MetricGroupConfig {
  id: MetricGroupId;
  label: string;
  description: string;
  primary: MetricConfig;
  supporting: MetricConfig[];
}

// =============================================================================
// METRIC GROUP CONFIGURATIONS
// =============================================================================

const METRIC_GROUPS: MetricGroupConfig[] = [
  {
    id: 'revenue',
    label: 'Revenue',
    description: 'Who\'s generating the most revenue?',
    primary: {
      key: 'revenue',
      label: 'Gross Revenue',
      shortLabel: 'Revenue',
      format: (v) => `$${(v / 1000).toFixed(1)}K`,
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
        label: 'Avg Revenue/Session',
        shortLabel: 'Avg $/Sess',
        format: (v) => `$${v.toFixed(0)}`,
        higherIsBetter: true,
      },
    ],
  },
  {
    id: 'caseload',
    label: 'Caseload',
    description: 'Who has capacity for new clients?',
    primary: {
      key: 'caseloadPercent',
      label: 'Caseload %',
      shortLabel: 'Caseload %',
      format: (v) => `${v.toFixed(0)}%`,
      higherIsBetter: true,
    },
    supporting: [
      {
        key: 'activeClients',
        label: 'Active Clients',
        shortLabel: 'Active',
        format: (v) => v.toLocaleString(),
        higherIsBetter: true,
      },
      {
        key: 'caseloadCapacity',
        label: 'Client Goal',
        shortLabel: 'Goal',
        format: (v) => v.toLocaleString(),
        higherIsBetter: true,
      },
    ],
  },
  {
    id: 'growth',
    label: 'Growth',
    description: 'Who\'s bringing in new clients?',
    primary: {
      key: 'newClients',
      label: 'New Clients',
      shortLabel: 'New Clients',
      format: (v) => v.toLocaleString(),
      higherIsBetter: true,
    },
    supporting: [],
  },
  {
    id: 'sessions',
    label: 'Sessions',
    description: 'Who\'s meeting session goals?',
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
        label: 'Completed Sessions',
        shortLabel: 'Sessions',
        format: (v) => v.toLocaleString(),
        higherIsBetter: true,
      },
      {
        key: 'weeklySessionGoal',
        label: 'Session Goal',
        shortLabel: 'Goal',
        format: (v) => v.toLocaleString(),
        higherIsBetter: true,
      },
    ],
  },
  {
    id: 'attendance',
    label: 'Attendance',
    description: 'Who\'s losing appointments?',
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
        key: 'clinicianCancelRate',
        label: 'Clinician Cancels',
        shortLabel: 'Clinician',
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
    label: 'Engagement',
    description: 'Who\'s keeping clients engaged?',
    primary: {
      key: 'rebookRate',
      label: 'Rebook Rate',
      shortLabel: 'Rebook',
      format: (v) => `${v.toFixed(0)}%`,
      higherIsBetter: true,
    },
    supporting: [
      {
        key: 'avgSessionsPerClient',
        label: 'Avg Sessions Per Client Per Month',
        shortLabel: 'Avg/Client/Mo',
        format: (v) => v.toFixed(1),
        higherIsBetter: true,
      },
    ],
  },
  {
    id: 'retention',
    label: 'Retention',
    description: 'Who\'s losing clients?',
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
        key: 'atRiskClients',
        label: 'Clients at Churn Risk',
        shortLabel: 'At Risk',
        format: (v) => v.toString(),
        higherIsBetter: false,
      },
      {
        key: 'session1to2Retention',
        label: 'Session 1→2 Retention',
        shortLabel: '1→2 Ret.',
        format: (v) => `${v.toFixed(0)}%`,
        higherIsBetter: true,
      },
      {
        key: 'session5Retention',
        label: 'Session 5 Retention',
        shortLabel: 'Sess 5',
        format: (v) => `${v.toFixed(0)}%`,
        higherIsBetter: true,
      },
      {
        key: 'session12Retention',
        label: 'Session 12 Retention',
        shortLabel: 'Sess 12',
        format: (v) => `${v.toFixed(0)}%`,
        higherIsBetter: true,
      },
    ],
  },
  {
    id: 'documentation',
    label: 'Notes',
    description: 'Who needs to catch up on notes?',
    primary: {
      key: 'outstandingNotes',
      label: 'Outstanding Notes',
      shortLabel: 'Notes Due',
      format: (v) => v.toString(),
      higherIsBetter: false,
    },
    supporting: [],
  },
];

// Clinician data structure
interface ClinicianMetrics {
  revenue: number;
  revenuePerSession: number;
  completedSessions: number;
  weeklySessionGoal: number;
  sessionGoalPercent: number;
  caseloadCapacity: number;
  caseloadPercent: number;
  weeklyClients: number;
  biweeklyClients: number;
  monthlyClients: number;
  showRate: number;
  nonBillableCancelRate: number;
  clientCancelRate: number;
  clinicianCancelRate: number;
  noShowRate: number;
  utilizationRate: number;
  activeClients: number;
  newClients: number;
  rebookRate: number;
  atRiskClients: number;
  newClientRevenue: number;
  avgSessionsPerClient: number;
  churnRate: number;
  clientsChurned: number;
  session1to2Retention: number;
  session5Retention: number;
  session12Retention: number;
  earlyChurnPercent: number;
  outstandingNotes: number;
  [key: string]: number;
}

interface ClinicianData {
  id: number;
  name: string;
  shortName: string;
  role: string;
  avatar: string;
  metrics: ClinicianMetrics;
}

// Build clinician data from real calculated metrics
function buildClinicianData(calculated: ClinicianMetricsCalculated[], periodId: string): ClinicianData[] {
  // Sort by revenue to assign roles
  const sorted = [...calculated].sort((a, b) => b.revenue - a.revenue);

  return sorted.map((calc, index) => {
    // Generate initials for avatar
    const nameParts = calc.clinicianName.split(' ');
    const avatar = nameParts.length >= 2
      ? `${nameParts[0][0]}${nameParts[1][0]}`
      : calc.clinicianName.substring(0, 2).toUpperCase();

    // Assign roles based on revenue ranking
    const roles = ['Senior Therapist', 'Therapist', 'Therapist', 'Associate Therapist', 'Associate Therapist'];
    const role = index === 0 ? 'Clinical Director' : roles[Math.min(index - 1, roles.length - 1)];

    // Calculate derived metrics
    const sessions = calc.completedSessions;
    const activeClients = calc.activeClients;

    // Estimate weekly values based on period (assume 4 weeks in month, 12 in quarter, 52 in year)
    const weeksInPeriod = periodId === 'this-month' || periodId === 'last-month' ? 4
      : periodId === 'this-quarter' || periodId === 'last-quarter' ? 13
      : periodId === 'this-year' ? 52
      : 52; // last-12-months

    const weeklySessionGoal = 25; // Default goal
    const sessionsPerWeek = sessions / weeksInPeriod;
    const sessionGoalPercent = (sessionsPerWeek / weeklySessionGoal) * 100;

    // Caseload calculations
    const caseloadCapacity = 35; // Default capacity
    const caseloadPercent = (activeClients / caseloadCapacity) * 100;

    // Estimate client frequency distribution (rough estimates)
    const weeklyClients = Math.round(activeClients * 0.6);
    const biweeklyClients = Math.round(activeClients * 0.25);
    const monthlyClients = Math.round(activeClients * 0.15);

    // Use practice-wide attendance settings (can't calculate per-clinician from payment data)
    const showRate = PRACTICE_SETTINGS.attendance.showRate * 100;
    const clientCancelRate = PRACTICE_SETTINGS.attendance.clientCancelled * 100;
    const clinicianCancelRate = PRACTICE_SETTINGS.attendance.clinicianCancelled * 100;
    const lateCancelRate = PRACTICE_SETTINGS.attendance.lateCancelled * 100;
    const noShowRate = 100 - showRate - clientCancelRate - clinicianCancelRate - lateCancelRate;
    const nonBillableCancelRate = clientCancelRate + lateCancelRate + noShowRate;
    const rebookRate = PRACTICE_SETTINGS.attendance.rebookRate * 100;

    // Utilization based on sessions vs capacity
    const utilizationRate = Math.min(100, (sessionsPerWeek / weeklySessionGoal) * 100);

    // At-risk clients (estimate based on churn rate)
    const atRiskClients = Math.round(activeClients * (calc.churnRate / 100) * 0.5);

    // New client revenue (estimate based on proportion of new clients)
    const newClientRevenue = activeClients > 0
      ? (calc.newClients / activeClients) * calc.revenue
      : 0;

    // Retention estimates (decreasing funnel)
    const baseRetention = 100 - calc.churnRate;
    const session1to2Retention = Math.min(95, baseRetention + 10);
    const session5Retention = Math.min(85, baseRetention);
    const session12Retention = Math.min(70, baseRetention - 15);
    const earlyChurnPercent = Math.max(15, calc.churnRate * 1.5);

    // Outstanding notes (estimate based on sessions and practice-wide rate)
    const outstandingNotes = Math.round(sessions * PRACTICE_SETTINGS.outstandingNotesPercent * 0.1);

    return {
      id: index + 1,
      name: calc.clinicianName,
      shortName: calc.clinicianName,
      role,
      avatar,
      metrics: {
        revenue: calc.revenue,
        revenuePerSession: calc.revenuePerSession,
        completedSessions: sessions,
        weeklySessionGoal,
        sessionGoalPercent: Math.round(sessionGoalPercent),
        caseloadCapacity,
        caseloadPercent: Math.round(caseloadPercent),
        weeklyClients,
        biweeklyClients,
        monthlyClients,
        showRate: Math.round(showRate),
        nonBillableCancelRate: Math.round(nonBillableCancelRate * 10) / 10,
        clientCancelRate: Math.round(clientCancelRate * 10) / 10,
        clinicianCancelRate: Math.round(clinicianCancelRate * 10) / 10,
        noShowRate: Math.round(noShowRate * 10) / 10,
        utilizationRate: Math.round(utilizationRate),
        activeClients,
        newClients: calc.newClients,
        rebookRate: Math.round(rebookRate),
        atRiskClients,
        newClientRevenue: Math.round(newClientRevenue),
        avgSessionsPerClient: Math.round(calc.avgSessionsPerClient * 10) / 10,
        churnRate: Math.round(calc.churnRate * 10) / 10,
        clientsChurned: calc.clientsChurned,
        session1to2Retention: Math.round(session1to2Retention),
        session5Retention: Math.round(session5Retention),
        session12Retention: Math.round(session12Retention),
        earlyChurnPercent: Math.round(earlyChurnPercent),
        outstandingNotes,
      },
    };
  });
}


type SessionGoalView = 'weekly' | 'monthly';

// Default view modes per metric group
const DEFAULT_VIEW_MODES: Record<MetricGroupId, ViewMode> = {
  revenue: 'live',
  caseload: 'live',
  growth: 'live',
  sessions: 'live',
  attendance: 'live',
  engagement: 'live',
  retention: 'last-12-months',
  documentation: 'live', // Notes is always current month
};

export const ClinicianOverview: React.FC = () => {
  const [selectedGroupId, setSelectedGroupId] = useState<MetricGroupId>('revenue');
  const [viewMode, setViewMode] = useState<ViewMode>('live');
  const [sessionGoalView, setSessionGoalView] = useState<SessionGoalView>('weekly');

  // For historical view - month/year selection
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  // Handle month selection from picker
  const handleMonthSelect = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  // Build clinician data from real calculated metrics based on view mode
  const CLINICIANS_DATA = useMemo(() => {
    let calculatedMetrics: ClinicianMetricsCalculated[];
    let periodId: string;

    if (viewMode === 'last-12-months') {
      calculatedMetrics = getClinicianMetricsForPeriod('last-12-months');
      periodId = 'last-12-months';
    } else if (viewMode === 'live') {
      calculatedMetrics = getClinicianMetricsForMonth(now.getMonth(), now.getFullYear());
      periodId = 'this-month';
    } else {
      // historical
      calculatedMetrics = getClinicianMetricsForMonth(selectedMonth, selectedYear);
      periodId = 'this-month';
    }

    return buildClinicianData(calculatedMetrics, periodId);
  }, [viewMode, selectedMonth, selectedYear]);

  // Update view mode when switching tabs to use sensible defaults
  const handleGroupChange = (groupId: MetricGroupId) => {
    setSelectedGroupId(groupId);
    setViewMode(DEFAULT_VIEW_MODES[groupId]);
  };

  const selectedGroup = METRIC_GROUPS.find(g => g.id === selectedGroupId)!;

  // Get human-readable date range label for the selected view mode
  const getDateRangeLabel = (): string => {
    const currentMonth = now.getMonth();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentYear = now.getFullYear();

    switch (viewMode) {
      case 'last-12-months': {
        const startMonth = (currentMonth + 1) % 12;
        const startYear = startMonth > currentMonth ? currentYear - 1 : currentYear;
        return `${months[startMonth]} ${startYear} – ${months[currentMonth]} ${currentYear}`;
      }
      case 'live':
        return `${fullMonths[currentMonth]} ${currentYear}`;
      case 'historical':
        return `${fullMonths[selectedMonth]} ${selectedYear}`;
      default:
        return '';
    }
  };

  // For sessions tab, dynamically adjust labels based on weekly/monthly toggle
  // Shows average weekly or monthly performance across the selected time period
  const getSessionsGroup = (): MetricGroupConfig => {
    if (selectedGroupId !== 'sessions') return selectedGroup;

    const isMonthly = sessionGoalView === 'monthly';

    // Calculate how many weeks/months in the selected period
    const getPeriodsInRange = () => {
      switch (viewMode) {
        case 'live':
        case 'historical':
          return { weeks: 4, months: 1 };
        case 'last-12-months':
        default:
          return { weeks: 52, months: 12 };
      }
    };

    const periods = getPeriodsInRange();
    const divisor = isMonthly ? periods.months : periods.weeks;

    return {
      ...selectedGroup,
      primary: {
        ...selectedGroup.primary,
        label: isMonthly ? 'Avg Monthly Goal %' : 'Avg Weekly Goal %',
        shortLabel: 'Goal %',
      },
      supporting: [
        {
          ...selectedGroup.supporting[0],
          label: isMonthly ? 'Avg Monthly Sessions' : 'Avg Weekly Sessions',
          shortLabel: 'Avg Sessions',
          format: (v) => Math.round(v / divisor).toLocaleString(),
        },
        {
          ...selectedGroup.supporting[1],
          label: isMonthly ? 'Monthly Goal' : 'Weekly Goal',
          shortLabel: 'Goal',
          format: (v) => (isMonthly ? v * 4 : v).toLocaleString(),
        },
      ],
    };
  };

  const displayGroup = getSessionsGroup();
  const metric = displayGroup.primary;

  // Calculate team average
  const teamAvg = useMemo(() => {
    if (CLINICIANS_DATA.length === 0) return 0;
    return CLINICIANS_DATA.reduce((sum, c) => sum + c.metrics[metric.key], 0) / CLINICIANS_DATA.length;
  }, [metric.key, CLINICIANS_DATA]);

  // Sort clinicians and find where team average belongs
  const { sortedClinicians, avgRankIndex } = useMemo(() => {
    const sorted = [...CLINICIANS_DATA].sort((a, b) => {
      const aVal = a.metrics[metric.key];
      const bVal = b.metrics[metric.key];
      return metric.higherIsBetter ? bVal - aVal : aVal - bVal;
    });

    // Find where team average would rank
    let avgIndex = sorted.findIndex(c => {
      const val = c.metrics[metric.key];
      return metric.higherIsBetter ? val < teamAvg : val > teamAvg;
    });
    if (avgIndex === -1) avgIndex = sorted.length;

    return { sortedClinicians: sorted, avgRankIndex: avgIndex };
  }, [metric.key, metric.higherIsBetter, teamAvg]);

  // Calculate bar widths
  const maxVal = Math.max(...sortedClinicians.map(c => c.metrics[metric.key]));
  const minVal = Math.min(...sortedClinicians.map(c => c.metrics[metric.key]));

  const getBarWidth = (value: number) => {
    if (metric.higherIsBetter) {
      return (value / maxVal) * 100;
    } else {
      const range = maxVal - minVal;
      if (range === 0) return 100;
      return ((maxVal - value) / range) * 80 + 20;
    }
  };

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
                <p className="text-stone-400 text-base sm:text-lg mt-2">{getDateRangeLabel()}</p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Sessions: Weekly/Monthly Toggle */}
                {selectedGroupId === 'sessions' && (
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-white/10 backdrop-blur-sm">
                    <button
                      onClick={() => setSessionGoalView('weekly')}
                      className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                        sessionGoalView === 'weekly'
                          ? 'bg-amber-500 text-white shadow-lg'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      Weekly
                    </button>
                    <button
                      onClick={() => setSessionGoalView('monthly')}
                      className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                        sessionGoalView === 'monthly'
                          ? 'bg-amber-500 text-white shadow-lg'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      Monthly
                    </button>
                  </div>
                )}

                {/* Time Period Selector */}
                <div className="flex items-center gap-3">
                  {selectedGroupId === 'documentation' ? (
                    /* Documentation: Show disabled "Current Month" only (point-in-time metric) */
                    <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5">
                      <div className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-white/10 text-white/50 cursor-not-allowed">
                        Current Month
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* View Mode Toggle: Last 12 Months / Live / Historical */}
                      <div className="flex items-center gap-1 p-1 rounded-xl bg-white/10 backdrop-blur-sm">
                        <button
                          onClick={() => setViewMode('last-12-months')}
                          className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                            viewMode === 'last-12-months'
                              ? 'bg-white text-stone-900 shadow-lg'
                              : 'text-white/70 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          Last 12 Months
                        </button>
                        <button
                          onClick={() => setViewMode('live')}
                          className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                            viewMode === 'live'
                              ? 'bg-white text-stone-900 shadow-lg'
                              : 'text-white/70 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          Live
                        </button>
                        <button
                          onClick={() => setViewMode('historical')}
                          className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                            viewMode === 'historical'
                              ? 'bg-white text-stone-900 shadow-lg'
                              : 'text-white/70 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          Historical
                        </button>
                      </div>

                      {/* Month Picker - only shown in Historical mode */}
                      {viewMode === 'historical' && (
                        <MonthPicker
                          selectedMonth={selectedMonth}
                          selectedYear={selectedYear}
                          onSelect={handleMonthSelect}
                          minYear={DATA_RANGE.earliest.getFullYear()}
                          maxYear={DATA_RANGE.latest.getFullYear()}
                          autoOpen={true}
                        />
                      )}
                    </>
                  )}
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

            {/* Metric buttons - 6 metric groups */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {METRIC_GROUPS.map((group) => {
                const isSelected = selectedGroupId === group.id;

                return (
                  <button
                    key={group.id}
                    onClick={() => handleGroupChange(group.id)}
                    className={`relative px-4 py-4 rounded-xl font-semibold text-sm transition-all duration-300 text-left ${
                      isSelected
                        ? 'bg-white text-stone-900 shadow-xl scale-[1.02]'
                        : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    <span className="block text-base font-bold">{group.label}</span>
                    <span className={`block text-xs mt-1 ${isSelected ? 'text-stone-500' : 'text-white/50'}`}>
                      {group.description}
                    </span>
                    {isSelected && (
                      <div
                        className="absolute bottom-0 left-4 right-4 h-1 rounded-full"
                        style={{ background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)' }}
                      />
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
          <div className="hidden lg:grid gap-4 py-4 text-sm font-bold text-stone-700 uppercase tracking-wide border-b-2 border-stone-300 mb-3"
            style={{
              gridTemplateColumns: displayGroup.supporting.length === 6
                ? '60px 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr'
                : displayGroup.supporting.length === 5
                  ? '60px 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr'
                  : displayGroup.supporting.length === 4
                    ? '60px 1fr 1fr 1fr 1fr 1fr 1fr 1fr'
                    : displayGroup.supporting.length === 3
                      ? '60px 1fr 1fr 1fr 1fr 1fr 1fr'
                      : displayGroup.supporting.length === 2
                        ? '60px 1fr 1fr 1fr 1fr 1fr'
                        : displayGroup.supporting.length === 1
                          ? '60px 1.5fr 1fr 1fr 1fr'
                          : '60px 2fr 1fr 1fr'
            }}
          >
            <div>Rank</div>
            <div>Clinician</div>
            <div>{metric.label}</div>
            <div className="text-right">{metric.label}</div>
            {displayGroup.supporting.map((s) => (
              <div key={s.key} className="text-right text-stone-500">
                {s.label}
              </div>
            ))}
          </div>

          {/* Ranking rows */}
          <div className="space-y-2">
            {sortedClinicians.map((clinician, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === sortedClinicians.length - 1;
              const rank = idx + 1;
              const value = clinician.metrics[metric.key];

              // Determine if team average row should appear before this clinician
              const showAverageBefore = idx === avgRankIndex;
              const showAverageAfter = isLast && avgRankIndex === sortedClinicians.length;

              // Team Average Row Component
              const TeamAverageRow = () => (
                <div
                  className="bg-stone-100 rounded-xl lg:rounded-2xl overflow-hidden"
                  style={{
                    border: '2px dashed #d6d3d1',
                  }}
                >
                  <div className="px-4 sm:px-6 py-4 lg:py-5">
                    {/* Mobile layout */}
                    <div className="lg:hidden grid grid-cols-12 gap-3 items-center">
                      <div className="col-span-2 flex justify-center">
                        <div className="w-10 h-10 rounded-full bg-stone-300 flex items-center justify-center">
                          <Users className="w-5 h-5 text-stone-600" />
                        </div>
                      </div>
                      <div className="col-span-6">
                        <h3 className="text-base text-stone-700 font-bold" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                          Team Average
                        </h3>
                        <p className="text-stone-500 text-xs">{CLINICIANS_DATA.length} clinicians</p>
                      </div>
                      <div className="col-span-4 text-right">
                        <span className="text-xl font-black text-stone-600" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                          {metric.format(Math.round(teamAvg))}
                        </span>
                      </div>
                    </div>

                    {/* Desktop layout */}
                    <div className="hidden lg:grid gap-4 items-center"
                      style={{
                        gridTemplateColumns: displayGroup.supporting.length === 6
                          ? '60px 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr'
                          : displayGroup.supporting.length === 5
                            ? '60px 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr'
                            : displayGroup.supporting.length === 4
                              ? '60px 1fr 1fr 1fr 1fr 1fr 1fr 1fr'
                              : displayGroup.supporting.length === 3
                                ? '60px 1fr 1fr 1fr 1fr 1fr 1fr'
                                : displayGroup.supporting.length === 2
                                  ? '60px 1fr 1fr 1fr 1fr 1fr'
                                  : displayGroup.supporting.length === 1
                                    ? '60px 1.5fr 1fr 1fr 1fr'
                                    : '60px 2fr 1fr 1fr'
                      }}
                    >
                      {/* Icon instead of rank */}
                      <div className="flex justify-center">
                        <div className="w-10 h-10 rounded-full bg-stone-300 flex items-center justify-center">
                          <Users className="w-5 h-5 text-stone-600" />
                        </div>
                      </div>

                      {/* Label */}
                      <div>
                        <h3 className="text-base text-stone-700 font-bold" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                          Team Average
                        </h3>
                        <p className="text-stone-500 text-xs">{CLINICIANS_DATA.length} clinicians</p>
                      </div>

                      {/* Bar space */}
                      <div className="flex items-center">
                        <div className="h-4 bg-stone-200 rounded-full w-full" />
                      </div>

                      {/* Primary Value */}
                      <div className="text-right">
                        <span className="text-xl font-black text-stone-600" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                          {metric.format(Math.round(teamAvg))}
                        </span>
                      </div>

                      {/* Supporting metrics - each in own column */}
                      {displayGroup.supporting.map((s) => {
                        const avg = CLINICIANS_DATA.reduce((sum, c) => sum + c.metrics[s.key], 0) / CLINICIANS_DATA.length;
                        return (
                          <div key={s.key} className="text-right">
                            <span className="text-lg font-semibold text-stone-500">
                              {s.format(avg)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );

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
                <React.Fragment key={clinician.id}>
                  {/* Team Average Row - shown before this clinician if appropriate */}
                  {showAverageBefore && <TeamAverageRow />}

                  <div
                    className="group bg-white rounded-xl lg:rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.01] cursor-pointer"
                    style={{ boxShadow: theme.shadow }}
                  >
                    {/* Accent bar - thin and elegant */}
                    <div className="h-0.5" style={{ background: theme.bar }} />

                    <div className="px-4 sm:px-6 py-4 lg:py-5">
                      {/* Mobile layout */}
                      <div className="lg:hidden">
                        <div className="grid grid-cols-12 gap-3 items-center">
                          <div className="col-span-2">
                            <span className="text-3xl font-black" style={{ fontFamily: "'DM Serif Display', Georgia, serif", color: theme.text }}>
                              {rank}
                            </span>
                          </div>
                          <div className="col-span-6 flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
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
                              <h3 className="text-base text-stone-900 font-bold truncate" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                                {clinician.shortName}
                              </h3>
                              <p className="text-stone-500 text-xs truncate">{clinician.role}</p>
                            </div>
                          </div>
                          <div className="col-span-4 text-right">
                            <span className="text-xl font-black" style={{ fontFamily: "'DM Serif Display', Georgia, serif", color: theme.text }}>
                              {metric.format(value)}
                            </span>
                          </div>
                        </div>
                        {/* Mobile: Supporting metrics */}
                        {displayGroup.supporting.length > 0 && (
                          <div className="mt-2 flex gap-4 text-xs text-stone-500">
                            {displayGroup.supporting.map((s) => (
                              <span key={s.key}>
                                {s.label}: {s.format(clinician.metrics[s.key])}
                              </span>
                            ))}
                          </div>
                        )}
                        {/* Mobile bar */}
                        <div className="mt-3">
                          <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${barWidth}%`, background: theme.bar }} />
                          </div>
                        </div>
                      </div>

                      {/* Desktop layout */}
                      <div className="hidden lg:grid gap-4 items-center"
                        style={{
                          gridTemplateColumns: displayGroup.supporting.length === 6
                            ? '60px 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr'
                            : displayGroup.supporting.length === 5
                              ? '60px 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr'
                              : displayGroup.supporting.length === 4
                                ? '60px 1fr 1fr 1fr 1fr 1fr 1fr 1fr'
                                : displayGroup.supporting.length === 3
                                  ? '60px 1fr 1fr 1fr 1fr 1fr 1fr'
                                  : displayGroup.supporting.length === 2
                                    ? '60px 1fr 1fr 1fr 1fr 1fr'
                                    : displayGroup.supporting.length === 1
                                      ? '60px 1.5fr 1fr 1fr 1fr'
                                      : '60px 2fr 1fr 1fr'
                        }}
                      >
                        {/* RANK */}
                        <div className="flex justify-center">
                          <span
                            className="text-3xl font-black"
                            style={{
                              fontFamily: "'DM Serif Display', Georgia, serif",
                              color: theme.text
                            }}
                          >
                            {rank}
                          </span>
                        </div>

                        {/* CLINICIAN */}
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
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
                              className="text-base text-stone-900 font-bold truncate"
                              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                            >
                              {clinician.shortName}
                            </h3>
                            <p className="text-stone-500 text-xs truncate">
                              {clinician.role}
                            </p>
                          </div>
                        </div>

                        {/* BAR */}
                        <div className="flex items-center">
                          <div className="h-4 bg-stone-100 rounded-full overflow-hidden w-full">
                            <div
                              className="h-full rounded-full transition-all duration-500 ease-out"
                              style={{
                                width: `${barWidth}%`,
                                background: theme.bar
                              }}
                            />
                          </div>
                        </div>

                        {/* PRIMARY VALUE */}
                        <div className="text-right">
                          <span
                            className="text-xl font-black"
                            style={{
                              fontFamily: "'DM Serif Display', Georgia, serif",
                              color: theme.text
                            }}
                          >
                            {metric.format(value)}
                          </span>
                        </div>

                        {/* SUPPORTING METRICS - each in own column */}
                        {displayGroup.supporting.map((s) => (
                          <div key={s.key} className="text-right">
                            <span className="text-lg font-semibold text-stone-600">
                              {s.format(clinician.metrics[s.key])}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Team Average Row - shown after last clinician if all are above average */}
                  {showAverageAfter && <TeamAverageRow />}
                </React.Fragment>
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
          </div>
        </div>
      </div>
    </div>
  );
};
