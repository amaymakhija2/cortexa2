import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, MapPin, Users, GraduationCap } from 'lucide-react';
import { PageHeader, DataTableCard, SegmentedControl, SectionContainer, SectionHeader, Grid } from './design-system';
import type { SegmentedControlOption } from './design-system/controls/SegmentedControl';
import { TimeSelector, TimeSelectorValue } from './design-system/controls/TimeSelector';
import {
  useCompareMetrics,
  getDimensionOptions,
  CompareDimension,
  CompareViewMode,
  AggregateMetrics,
  PointInTimeMetrics,
  useDataDateRange,
} from '../hooks';
import type { TableColumn, TableRow } from './design-system/cards/DataTableCard';

// =============================================================================
// COMPARE TAB - Practice-Level Comparison View
// =============================================================================
// Allows practice owners to compare metrics across:
// - Locations (Durham, Chapel Hill, Remote)
// - Supervisors (Sarah's Team, Maria's Team, etc.)
// - License Types (PhD, LCSW, LPC, etc.)
//
// Uses DataTableCard for a clean, scannable table format
// =============================================================================

// =============================================================================
// DIMENSION CONFIG
// =============================================================================

const DIMENSION_ICONS: Record<CompareDimension, React.ReactNode> = {
  location: <MapPin size={16} />,
  supervisor: <Users size={16} />,
  credential: <GraduationCap size={16} />,
};

// =============================================================================
// DIMENSION SELECTOR - Uses design system SegmentedControl
// =============================================================================

interface DimensionSelectorProps {
  selected: CompareDimension;
  onChange: (dimension: CompareDimension) => void;
}

const DimensionSelector: React.FC<DimensionSelectorProps> = ({ selected, onChange }) => {
  const rawOptions = getDimensionOptions().filter(opt => opt.available);

  // Transform to SegmentedControl options format with icons
  const options: SegmentedControlOption<CompareDimension>[] = rawOptions.map((opt) => ({
    id: opt.id,
    label: opt.label,
    icon: DIMENSION_ICONS[opt.id],
  }));

  return (
    <SegmentedControl<CompareDimension>
      options={options}
      value={selected}
      onChange={onChange}
      size="md"
      ariaLabel="Compare by dimension"
    />
  );
};

// =============================================================================
// TABLE CONFIGURATION - Organized by Section
// =============================================================================

// Overview: 8 key metrics that tell the complete story
// Flow: Money → Activity → Efficiency → Growth/Retention → Compliance
const OVERVIEW_AGGREGATE_COLUMNS: TableColumn[] = [
  { key: 'grossRevenue', header: 'Revenue', align: 'right', tooltip: 'Total revenue collected before any deductions.' },
  { key: 'revenueGoalPercent', header: 'Rev Goal %', align: 'right', tooltip: 'Percentage of revenue goal achieved.' },
  { key: 'completedSessions', header: 'Sessions', align: 'right', tooltip: 'Total number of sessions completed.' },
  { key: 'sessionGoalPercent', header: 'Sess Goal %', align: 'right', tooltip: 'Percentage of session goal achieved.' },
  { key: 'showRate', header: 'Show Rate', align: 'right', tooltip: 'Percentage of booked sessions completed. Higher is better.' },
  { key: 'newClients', header: 'New Clients', align: 'right', tooltip: 'Number of new clients acquired.' },
  { key: 'churnRate', header: 'Churn', align: 'right', tooltip: 'Percentage of clients who churned. Lower is better.' },
  { key: 'outstandingNotes', header: 'Outstanding Notes', align: 'right', tooltip: 'Notes overdue. Blocks billing if not completed.' },
];

const OVERVIEW_POINT_IN_TIME_COLUMNS: TableColumn[] = [
  { key: 'grossRevenue', header: 'Revenue', align: 'right', tooltip: 'Total revenue collected before any deductions.' },
  { key: 'revenueGoalPercent', header: 'Rev Goal %', align: 'right', tooltip: 'Percentage of revenue goal achieved.' },
  { key: 'completedSessions', header: 'Sessions', align: 'right', tooltip: 'Total number of sessions completed.' },
  { key: 'sessionGoalPercent', header: 'Sess Goal %', align: 'right', tooltip: 'Percentage of session goal achieved.' },
  { key: 'showRate', header: 'Show Rate', align: 'right', tooltip: 'Percentage of booked sessions completed. Higher is better.' },
  { key: 'newClients', header: 'New Clients', align: 'right', tooltip: 'Number of new clients acquired.' },
  { key: 'churnRate', header: 'Churn', align: 'right', tooltip: 'Percentage of clients who churned. Lower is better.' },
  { key: 'outstandingNotes', header: 'Outstanding Notes', align: 'right', tooltip: 'Notes overdue. Blocks billing if not completed.' },
];

// Section 1: Revenue - Aggregate view
const REVENUE_AGGREGATE_COLUMNS: TableColumn[] = [
  {
    key: 'grossRevenue',
    header: 'Gross Revenue',
    align: 'right',
    tooltip: 'Total revenue collected before any deductions.',
  },
  {
    key: 'revenuePercent',
    header: '% of Total',
    align: 'right',
    tooltip: 'This group\'s share of total practice revenue.',
  },
  {
    key: 'avgRevenuePerSession',
    header: 'Per Session',
    align: 'right',
    tooltip: 'Average revenue earned per completed session.',
  },
  {
    key: 'avgMonthlyRevenue',
    header: 'Monthly Avg',
    align: 'right',
    tooltip: 'Average revenue per month over the time period.',
  },
  {
    key: 'avgWeeklyRevenue',
    header: 'Weekly Avg',
    align: 'right',
    tooltip: 'Average revenue per week over the time period.',
  },
  {
    key: 'revenueGoal',
    header: 'Revenue Goal',
    align: 'right',
    tooltip: 'Proportional revenue goal based on session capacity.',
  },
  {
    key: 'revenueGoalPercent',
    header: 'Goal %',
    align: 'right',
    tooltip: 'Percentage of revenue goal achieved.',
  },
];

// Section 1: Revenue - Point-in-time view
const REVENUE_POINT_IN_TIME_COLUMNS: TableColumn[] = [
  {
    key: 'grossRevenue',
    header: 'Gross Revenue',
    align: 'right',
    tooltip: 'Total revenue collected before any deductions.',
  },
  {
    key: 'revenuePercent',
    header: '% of Total',
    align: 'right',
    tooltip: 'This group\'s share of total practice revenue.',
  },
  {
    key: 'avgRevenuePerSession',
    header: 'Per Session',
    align: 'right',
    tooltip: 'Average revenue earned per completed session.',
  },
  {
    key: 'avgWeeklyRevenue',
    header: 'Weekly Avg',
    align: 'right',
    tooltip: 'Average revenue per week this month.',
  },
  {
    key: 'revenueGoal',
    header: 'Revenue Goal',
    align: 'right',
    tooltip: 'Proportional revenue goal based on session capacity.',
  },
  {
    key: 'revenueGoalPercent',
    header: 'Goal %',
    align: 'right',
    tooltip: 'Percentage of revenue goal achieved.',
  },
];

// Section 2: Sessions - Aggregate view
const SESSIONS_AGGREGATE_COLUMNS: TableColumn[] = [
  {
    key: 'completedSessions',
    header: 'Completed Sessions',
    align: 'right',
    tooltip: 'Total number of sessions completed during this time period.',
  },
  {
    key: 'sessionsPercent',
    header: '% of Total',
    align: 'right',
    tooltip: 'This group\'s share of total practice sessions.',
  },
  {
    key: 'showRate',
    header: 'Show Rate',
    align: 'right',
    tooltip: 'Percentage of booked sessions that were completed. Higher is better.',
  },
  {
    key: 'avgMonthlySessions',
    header: 'Monthly Avg',
    align: 'right',
    tooltip: 'Average number of sessions completed per month.',
  },
  {
    key: 'avgWeeklySessions',
    header: 'Weekly Avg',
    align: 'right',
    tooltip: 'Average number of sessions completed per week.',
  },
  {
    key: 'sessionGoal',
    header: 'Session Goal',
    align: 'right',
    tooltip: 'Total session goal for the time period.',
  },
  {
    key: 'sessionGoalPercent',
    header: 'Goal %',
    align: 'right',
    tooltip: 'Percentage of session goal achieved.',
  },
];

// Section 2: Sessions - Point-in-time view
const SESSIONS_POINT_IN_TIME_COLUMNS: TableColumn[] = [
  {
    key: 'completedSessions',
    header: 'Completed Sessions',
    align: 'right',
    tooltip: 'Total number of sessions completed during this month.',
  },
  {
    key: 'sessionsPercent',
    header: '% of Total',
    align: 'right',
    tooltip: 'This group\'s share of total practice sessions.',
  },
  {
    key: 'showRate',
    header: 'Show Rate',
    align: 'right',
    tooltip: 'Percentage of booked sessions that were completed. Higher is better.',
  },
  {
    key: 'avgWeeklySessions',
    header: 'Weekly Avg',
    align: 'right',
    tooltip: 'Average number of sessions completed per week this month.',
  },
  {
    key: 'sessionGoal',
    header: 'Session Goal',
    align: 'right',
    tooltip: 'Monthly session goal for this group.',
  },
  {
    key: 'sessionGoalPercent',
    header: 'Goal %',
    align: 'right',
    tooltip: 'Percentage of session goal achieved.',
  },
  {
    key: 'caseloadCapacity',
    header: 'Capacity %',
    align: 'right',
    tooltip: 'How full is the caseload? Active clients ÷ client goal. Lower means more room for new clients.',
  },
];

// Section 3: Clients - Aggregate view
const CLIENTS_AGGREGATE_COLUMNS: TableColumn[] = [
  {
    key: 'clientsSeen',
    header: 'Clients Seen',
    align: 'right',
    tooltip: 'Number of unique clients who had at least one session during this time period.',
  },
  {
    key: 'newClients',
    header: 'New Clients',
    align: 'right',
    tooltip: 'Number of consultations that converted to new clients.',
  },
  {
    key: 'activeClients',
    header: 'Active Clients',
    align: 'right',
    tooltip: 'Number of clients currently active (had a session in last 30 days).',
  },
  {
    key: 'churnRate',
    header: 'Churn Rate',
    align: 'right',
    tooltip: 'Percentage of clients who churned (stopped coming). Lower is better.',
  },
];

// Section 3: Clients - Point-in-time view
const CLIENTS_POINT_IN_TIME_COLUMNS: TableColumn[] = [
  {
    key: 'clientsSeen',
    header: 'Clients Seen',
    align: 'right',
    tooltip: 'Number of unique clients seen this month.',
  },
  {
    key: 'newClients',
    header: 'New Clients',
    align: 'right',
    tooltip: 'Number of consultations that converted to new clients this month.',
  },
  {
    key: 'activeClients',
    header: 'Active Clients',
    align: 'right',
    tooltip: 'Number of clients currently active (had a session in last 30 days).',
  },
  {
    key: 'churnRate',
    header: 'Churn Rate',
    align: 'right',
    tooltip: 'Percentage of clients who churned (stopped coming). Lower is better.',
  },
];

// Section 4: Clinician Comparison
const CLINICIAN_AGGREGATE_COLUMNS: TableColumn[] = [
  {
    key: 'clinicianCount',
    header: 'Clinicians',
    align: 'right',
    tooltip: 'Number of clinicians in this group.',
  },
  {
    key: 'avgSessionsPerClinicianMonth',
    header: 'Avg Sessions/Clinician/Mo',
    align: 'right',
    tooltip: 'Average sessions per clinician per month.',
  },
  {
    key: 'notesComplianceRate',
    header: 'Notes Compliance',
    align: 'right',
    tooltip: 'Percentage of notes completed on time. Higher is better.',
  },
  {
    key: 'outstandingNotes',
    header: 'Outstanding Notes',
    align: 'right',
    tooltip: 'Number of sessions with overdue notes. Lower is better.',
  },
];

const CLINICIAN_POINT_IN_TIME_COLUMNS: TableColumn[] = [
  {
    key: 'clinicianCount',
    header: 'Clinicians',
    align: 'right',
    tooltip: 'Number of clinicians in this group.',
  },
  {
    key: 'avgSessionsPerClinician',
    header: 'Avg Sessions/Clinician',
    align: 'right',
    tooltip: 'Average sessions per clinician this month.',
  },
  {
    key: 'notesComplianceRate',
    header: 'Notes Compliance',
    align: 'right',
    tooltip: 'Percentage of notes completed on time. Higher is better.',
  },
  {
    key: 'outstandingNotes',
    header: 'Outstanding Notes',
    align: 'right',
    tooltip: 'Number of sessions with overdue notes. Lower is better.',
  },
];

// Color palette for row indicators (matching clinician colors)
const ROW_COLORS = [
  '#a855f7', // Purple
  '#06b6d4', // Cyan
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#6366f1', // Indigo
];

// Helper to format currency
function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

// Transform aggregate metrics (Last 12 Months) into table rows
function buildAggregateRows(groups: AggregateMetrics[]): TableRow[] {
  // Calculate totals for percentages
  const totalRevenue = groups.reduce((sum, g) => sum + g.revenue, 0);
  const totalSessions = groups.reduce((sum, g) => sum + g.completedSessions, 0);

  return groups.map((group, index) => {
    // Calculate derived revenue metrics
    const revenuePercent = totalRevenue > 0 ? (group.revenue / totalRevenue) * 100 : 0;
    const avgRevenuePerSession = group.completedSessions > 0 ? group.revenue / group.completedSessions : 0;
    const avgMonthlyRevenue = group.revenue / 12; // Last 12 months
    const avgWeeklyRevenue = group.revenue / 52; // ~52 weeks in a year

    // Calculate derived session metrics
    const sessionsPercent = totalSessions > 0 ? (group.completedSessions / totalSessions) * 100 : 0;
    const avgMonthlySessions = group.completedSessions / 12;

    // Calculate clinician metrics
    const avgSessionsPerClinicianMonth = group.clinicianCount > 0
      ? (group.completedSessions / 12) / group.clinicianCount
      : 0;
    // Notes compliance = sessions with on-time notes / total sessions (estimate based on outstanding)
    // Assuming ~40 sessions/month avg, 12 months = ~480 sessions per clinician baseline
    const estimatedTotalSessions = group.completedSessions;
    const notesComplianceRate = estimatedTotalSessions > 0
      ? Math.max(0, 100 - (group.outstandingNotes / estimatedTotalSessions) * 100)
      : 100;

    return {
      id: group.id,
      label: group.label,
      indicator: {
        color: ROW_COLORS[index % ROW_COLORS.length],
      },
      values: {
        revenue: formatCurrency(group.revenue),
        // Revenue section fields
        grossRevenue: formatCurrency(group.revenue),
        revenuePercent: `${revenuePercent.toFixed(1)}%`,
        avgRevenuePerSession: formatCurrency(avgRevenuePerSession),
        avgMonthlyRevenue: formatCurrency(avgMonthlyRevenue),
        avgWeeklyRevenue: formatCurrency(avgWeeklyRevenue),
        revenueGoal: formatCurrency(group.revenueGoal),
        revenueGoalPercent: `${group.revenueGoalPercent}%`,
        // Session section fields
        completedSessions: group.completedSessions.toLocaleString(),
        sessionsPercent: `${sessionsPercent.toFixed(1)}%`,
        showRate: `${group.showRate}%`,
        avgMonthlySessions: Math.round(avgMonthlySessions).toLocaleString(),
        avgWeeklySessions: group.avgWeeklySessions.toLocaleString(),
        sessionGoal: group.sessionGoal.toLocaleString(),
        sessionGoalPercent: `${group.sessionGoalPercent}%`,
        // Client section fields
        clientsSeen: group.clientsSeen.toLocaleString(),
        newClients: group.newClients.toString(),
        activeClients: group.activeClients.toLocaleString(),
        churnRate: `${group.churnRate}%`,
        // Clinician section fields
        clinicianCount: group.clinicianCount.toString(),
        avgSessionsPerClinicianMonth: Math.round(avgSessionsPerClinicianMonth).toLocaleString(),
        notesComplianceRate: `${Math.round(notesComplianceRate)}%`,
        outstandingNotes: group.outstandingNotes.toString(),
        // Other fields
        consultationsBooked: group.consultationsBooked.toString(),
        conversionRate: `${group.conversionRate}%`,
        cancelRate: `${group.cancelRate}%`,
      },
    };
  });
}

// Transform point-in-time metrics (Live/Historical) into table rows
function buildPointInTimeRows(groups: PointInTimeMetrics[]): TableRow[] {
  // Calculate totals for percentages
  const totalRevenue = groups.reduce((sum, g) => sum + g.revenue, 0);
  const totalSessions = groups.reduce((sum, g) => sum + g.completedSessions, 0);

  return groups.map((group, index) => {
    // Calculate derived revenue metrics
    const revenuePercent = totalRevenue > 0 ? (group.revenue / totalRevenue) * 100 : 0;
    const avgRevenuePerSession = group.completedSessions > 0 ? group.revenue / group.completedSessions : 0;
    const avgWeeklyRevenue = group.revenue / 4; // ~4 weeks in a month

    // Calculate derived session metrics
    const sessionsPercent = totalSessions > 0 ? (group.completedSessions / totalSessions) * 100 : 0;
    const avgWeeklySessions = group.completedSessions / 4; // ~4 weeks in a month

    // Calculate clinician metrics
    const avgSessionsPerClinician = group.clinicianCount > 0
      ? group.completedSessions / group.clinicianCount
      : 0;
    // Notes compliance estimate
    const estimatedTotalSessions = group.completedSessions;
    const notesComplianceRate = estimatedTotalSessions > 0
      ? Math.max(0, 100 - (group.outstandingNotes / estimatedTotalSessions) * 100)
      : 100;

    return {
      id: group.id,
      label: group.label,
      indicator: {
        color: ROW_COLORS[index % ROW_COLORS.length],
      },
      values: {
        revenue: formatCurrency(group.revenue),
        // Revenue section fields
        grossRevenue: formatCurrency(group.revenue),
        revenuePercent: `${revenuePercent.toFixed(1)}%`,
        avgRevenuePerSession: formatCurrency(avgRevenuePerSession),
        avgWeeklyRevenue: formatCurrency(avgWeeklyRevenue),
        revenueGoal: formatCurrency(group.revenueGoal),
        revenueGoalPercent: `${group.revenueGoalPercent}%`,
        // Session section fields
        completedSessions: group.completedSessions.toLocaleString(),
        sessionsPercent: `${sessionsPercent.toFixed(1)}%`,
        showRate: `${group.showRate}%`,
        avgWeeklySessions: Math.round(avgWeeklySessions * 10) / 10,
        sessionGoal: group.sessionGoal.toLocaleString(),
        sessionGoalPercent: `${group.sessionGoalPercent}%`,
        // Client section fields
        clientsSeen: group.clientsSeen.toLocaleString(),
        newClients: group.newClients.toString(),
        activeClients: group.activeClients.toLocaleString(),
        churnRate: `${group.churnRate}%`,
        // Clinician section fields
        clinicianCount: group.clinicianCount.toString(),
        avgSessionsPerClinician: Math.round(avgSessionsPerClinician).toLocaleString(),
        notesComplianceRate: `${Math.round(notesComplianceRate)}%`,
        outstandingNotes: group.outstandingNotes.toString(),
        // Other fields
        consultationsBooked: group.consultationsBooked.toString(),
        conversionRate: `${group.conversionRate}%`,
        caseloadCapacity: `${group.caseloadCapacity}%`,
        cancelRate: `${group.cancelRate}%`,
      },
    };
  });
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const CompareTab: React.FC = () => {
  const [dimension, setDimension] = useState<CompareDimension>('location');
  const now = new Date();
  // Compare tab defaults to Last 12 Months aggregate view
  const [timeSelection, setTimeSelection] = useState<TimeSelectorValue>('last-12-months');

  // Get data date range from API
  const { data: dataRange } = useDataDateRange();

  // Derive viewMode and month/year for the hook
  const isAggregateView = typeof timeSelection === 'string';
  const viewMode: CompareViewMode = isAggregateView ? 'last-12-months' : 'historical';
  const selectedMonth = isAggregateView ? now.getMonth() : timeSelection.month;
  const selectedYear = isAggregateView ? now.getFullYear() : timeSelection.year;

  // Get metrics based on view mode
  const compareData = useCompareMetrics(dimension, viewMode, selectedMonth, selectedYear);

  // Get available dimensions
  const availableDimensions = getDimensionOptions().filter(opt => opt.available);

  // If selected dimension isn't available, switch to first available
  React.useEffect(() => {
    if (availableDimensions.length > 0 && !availableDimensions.find(d => d.id === dimension)) {
      setDimension(availableDimensions[0].id);
    }
  }, [availableDimensions, dimension]);

  // Build table data based on view mode
  const tableRows = useMemo(() => {
    if (compareData.viewMode === 'last-12-months') {
      return buildAggregateRows(compareData.groups as AggregateMetrics[]);
    }
    return buildPointInTimeRows(compareData.groups as PointInTimeMetrics[]);
  }, [compareData]);

  // Get the appropriate columns based on view mode for each section
  const overviewColumns = isAggregateView ? OVERVIEW_AGGREGATE_COLUMNS : OVERVIEW_POINT_IN_TIME_COLUMNS;
  const revenueColumns = isAggregateView ? REVENUE_AGGREGATE_COLUMNS : REVENUE_POINT_IN_TIME_COLUMNS;
  const sessionsColumns = isAggregateView ? SESSIONS_AGGREGATE_COLUMNS : SESSIONS_POINT_IN_TIME_COLUMNS;
  const clientsColumns = isAggregateView ? CLIENTS_AGGREGATE_COLUMNS : CLIENTS_POINT_IN_TIME_COLUMNS;
  const clinicianColumns = isAggregateView ? CLINICIAN_AGGREGATE_COLUMNS : CLINICIAN_POINT_IN_TIME_COLUMNS;

  if (availableDimensions.length === 0) {
    return (
      <div className="flex-1 flex flex-col h-[calc(100vh-80px)] overflow-y-auto bg-gradient-to-b from-stone-100 to-stone-50">
        <div className="min-h-full flex flex-col">
          <PageHeader
            accent="rose"
            title="Compare Performance"
            showGridPattern
          />
          <div className="flex items-center justify-center py-24 px-6 sm:px-8 lg:pl-[100px] lg:pr-12">
            <div className="text-center max-w-md">
              <p className="text-stone-600 text-lg mb-2">No comparison data available</p>
              <p className="text-stone-500 text-sm">
                Comparison requires multiple locations, supervisors, or credential types.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-80px)] overflow-y-auto bg-gradient-to-b from-stone-100 to-stone-50">
      <div className="min-h-full flex flex-col">
        {/* Header with Time Controls */}
        <PageHeader
          accent="rose"
          title="Compare Performance"
          showGridPattern
          timeSelector={
            <TimeSelector
              value={timeSelection}
              onChange={setTimeSelection}
              showAggregateOption={true}
              variant="header"
              minYear={dataRange?.earliest.getFullYear()}
              maxYear={dataRange?.latest.getFullYear()}
            />
          }
        />

        {/* Content Area */}
        <div className="flex flex-col flex-1 min-h-0 min-w-0 px-6 sm:px-8 lg:pl-[100px] lg:pr-12 py-6 lg:py-8 overflow-x-auto">
          {/* Dimension Filter Bar */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-medium text-stone-500">Compare by</span>
            <DimensionSelector selected={dimension} onChange={setDimension} />
          </div>
          {compareData.loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-4">
                <Loader2 size={32} className="animate-spin text-stone-500" />
                <p className="text-stone-600 text-lg">Loading comparison data...</p>
              </div>
            </div>
          ) : compareData.error ? (
            <div className="flex items-center justify-center py-24">
              <div className="text-center">
                <p className="text-stone-600 text-lg mb-2">Unable to load comparison data</p>
                <p className="text-stone-500 text-sm">{compareData.error.message}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Overview: Quick Compare */}
              <SectionContainer accent="indigo" index={0} isFirst>
                <SectionHeader
                  question="Quick Compare"
                  description="Key metrics at a glance across all dimensions"
                  accent="indigo"
                  showAccentLine={false}
                  compact
                />
                <DataTableCard
                  title="Overview"
                  columns={overviewColumns}
                  rows={tableRows}
                />
              </SectionContainer>

              {/* Section 1: Revenue */}
              <SectionContainer accent="emerald" index={1}>
                <SectionHeader
                  number={1}
                  question="How does revenue compare?"
                  description="Total revenue collected before any deductions"
                  accent="emerald"
                  showAccentLine={false}
                  compact
                />
                <DataTableCard
                  title="Revenue Comparison"
                  columns={revenueColumns}
                  rows={tableRows}
                />
              </SectionContainer>

              {/* Section 2: Sessions */}
              <SectionContainer accent="cyan" index={2}>
                <SectionHeader
                  number={2}
                  question="How do sessions compare?"
                  description="Session volume, weekly averages, and goal progress"
                  accent="cyan"
                  showAccentLine={false}
                  compact
                />
                <DataTableCard
                  title="Session Comparison"
                  columns={sessionsColumns}
                  rows={tableRows}
                />
              </SectionContainer>

              {/* Section 3: Clients */}
              <SectionContainer accent="amber" index={3}>
                <SectionHeader
                  number={3}
                  question="How does client acquisition compare?"
                  description="Consultations, new clients, and conversion rates"
                  accent="amber"
                  showAccentLine={false}
                  compact
                />
                <DataTableCard
                  title="Client Comparison"
                  columns={clientsColumns}
                  rows={tableRows}
                />
              </SectionContainer>

              {/* Section 4: Clinician */}
              <SectionContainer accent="stone" index={4} isLast>
                <SectionHeader
                  number={4}
                  question="How do clinicians compare?"
                  description="Clinician productivity and notes compliance"
                  accent="stone"
                  showAccentLine={false}
                  compact
                />
                <DataTableCard
                  title="Clinician Comparison"
                  columns={clinicianColumns}
                  rows={tableRows}
                />
              </SectionContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompareTab;
