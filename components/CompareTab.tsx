import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, MapPin, Users, GraduationCap } from 'lucide-react';
import { PageHeader, DataTableCard, SegmentedControl } from './design-system';
import type { SegmentedControlOption } from './design-system/controls/SegmentedControl';
import { MonthPicker } from './MonthPicker';
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
// TABLE CONFIGURATION
// =============================================================================

// Columns for Last 12 Months (aggregate) view
const AGGREGATE_COLUMNS: TableColumn[] = [
  {
    key: 'revenue',
    header: 'Revenue',
    align: 'right',
    tooltip: 'Total revenue collected before any deductions.',
  },
  {
    key: 'consultationsBooked',
    header: 'Consults',
    align: 'right',
    tooltip: 'Total consultations booked during this time period.',
  },
  {
    key: 'newClients',
    header: 'New Clients',
    align: 'right',
    tooltip: 'Number of consultations that converted to new clients.',
  },
  {
    key: 'conversionRate',
    header: 'Conv %',
    align: 'right',
    tooltip: 'Percentage of consultations that converted to clients. Higher is better.',
  },
  {
    key: 'completedSessions',
    header: 'Sessions',
    align: 'right',
    tooltip: 'Total number of sessions completed during this time period.',
  },
  {
    key: 'avgWeeklySessions',
    header: 'Wkly Avg',
    align: 'right',
    tooltip: 'Average number of sessions completed per week during this time period.',
  },
  {
    key: 'sessionGoalPercent',
    header: 'Goal %',
    align: 'right',
    tooltip: 'Percentage of session goal achieved. Completed sessions ÷ session goal.',
  },
  {
    key: 'clientsSeen',
    header: 'Clients',
    align: 'right',
    tooltip: 'Number of unique clients who had at least one session during this time period.',
  },
  {
    key: 'churnRate',
    header: 'Churn',
    align: 'right',
    tooltip: 'Percentage of clients who churned (stopped coming). Lower is better.',
  },
  {
    key: 'cancelRate',
    header: 'Cancel',
    align: 'right',
    tooltip: 'Percentage of booked sessions that were canceled. Lower is better.',
  },
  {
    key: 'outstandingNotes',
    header: 'Notes',
    align: 'right',
    tooltip: 'Number of sessions with overdue notes. Lower is better.',
  },
];

// Columns for Live/Historical (point-in-time) view
const POINT_IN_TIME_COLUMNS: TableColumn[] = [
  {
    key: 'revenue',
    header: 'Revenue',
    align: 'right',
    tooltip: 'Total revenue collected before any deductions.',
  },
  {
    key: 'consultationsBooked',
    header: 'Consults',
    align: 'right',
    tooltip: 'Consultations booked this month.',
  },
  {
    key: 'newClients',
    header: 'New Clients',
    align: 'right',
    tooltip: 'Number of consultations that converted to new clients this month.',
  },
  {
    key: 'conversionRate',
    header: 'Conv %',
    align: 'right',
    tooltip: 'Percentage of consultations that converted to clients. Higher is better.',
  },
  {
    key: 'completedSessions',
    header: 'Sessions',
    align: 'right',
    tooltip: 'Total number of sessions completed during this month.',
  },
  {
    key: 'activeClients',
    header: 'Active',
    align: 'right',
    tooltip: 'Number of clients currently active (had a session in last 30 days).',
  },
  {
    key: 'caseloadCapacity',
    header: 'Capacity',
    align: 'right',
    tooltip: 'How full is the caseload? Active clients ÷ client goal. Lower means more room for new clients.',
  },
  {
    key: 'churnRate',
    header: 'Churn',
    align: 'right',
    tooltip: 'Percentage of clients who churned (stopped coming). Lower is better.',
  },
  {
    key: 'cancelRate',
    header: 'Cancel',
    align: 'right',
    tooltip: 'Percentage of booked sessions that were canceled. Lower is better.',
  },
  {
    key: 'outstandingNotes',
    header: 'Notes',
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

// Transform aggregate metrics (Last 12 Months) into table rows
function buildAggregateRows(groups: AggregateMetrics[]): TableRow[] {
  return groups.map((group, index) => ({
    id: group.id,
    label: group.label,
    indicator: {
      color: ROW_COLORS[index % ROW_COLORS.length],
    },
    values: {
      revenue: `$${(group.revenue / 1000).toFixed(0)}K`,
      consultationsBooked: group.consultationsBooked.toString(),
      newClients: group.newClients.toString(),
      conversionRate: `${group.conversionRate}%`,
      completedSessions: group.completedSessions.toLocaleString(),
      avgWeeklySessions: group.avgWeeklySessions.toLocaleString(),
      sessionGoalPercent: `${group.sessionGoalPercent}%`,
      clientsSeen: group.clientsSeen.toLocaleString(),
      churnRate: `${group.churnRate}%`,
      cancelRate: `${group.cancelRate}%`,
      outstandingNotes: group.outstandingNotes.toString(),
    },
  }));
}

// Transform point-in-time metrics (Live/Historical) into table rows
function buildPointInTimeRows(groups: PointInTimeMetrics[]): TableRow[] {
  return groups.map((group, index) => ({
    id: group.id,
    label: group.label,
    indicator: {
      color: ROW_COLORS[index % ROW_COLORS.length],
    },
    values: {
      revenue: `$${(group.revenue / 1000).toFixed(0)}K`,
      consultationsBooked: group.consultationsBooked.toString(),
      newClients: group.newClients.toString(),
      conversionRate: `${group.conversionRate}%`,
      completedSessions: group.completedSessions.toLocaleString(),
      activeClients: group.activeClients.toLocaleString(),
      caseloadCapacity: `${group.caseloadCapacity}%`,
      churnRate: `${group.churnRate}%`,
      cancelRate: `${group.cancelRate}%`,
      outstandingNotes: group.outstandingNotes.toString(),
    },
  }));
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const CompareTab: React.FC = () => {
  const [dimension, setDimension] = useState<CompareDimension>('location');
  const [viewMode, setViewMode] = useState<CompareViewMode>('last-12-months');
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  // Get data date range from API
  const { data: dataRange } = useDataDateRange();

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

  // Handle month selection
  const handleMonthSelect = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  // Get human-readable date range label
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

  // Get dimension display name
  const getDimensionLabel = (): string => {
    switch (dimension) {
      case 'location': return 'Location';
      case 'supervisor': return 'Supervisor';
      case 'credential': return 'License Type';
      default: return '';
    }
  };

  // Build table data based on view mode
  const tableRows = useMemo(() => {
    if (compareData.viewMode === 'last-12-months') {
      return buildAggregateRows(compareData.groups as AggregateMetrics[]);
    }
    return buildPointInTimeRows(compareData.groups as PointInTimeMetrics[]);
  }, [compareData]);

  // Get the appropriate columns based on view mode
  const tableColumns = viewMode === 'last-12-months' ? AGGREGATE_COLUMNS : POINT_IN_TIME_COLUMNS;

  if (availableDimensions.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto h-[calc(100vh-80px)] bg-gradient-to-b from-stone-100 to-stone-50">
        <div className="min-h-full">
          <PageHeader
            accent="violet"
            label="Practice Comparison"
            title="Compare Performance"
            subtitle="Last 12 months"
            showGridPattern
          />
          <div className="flex items-center justify-center py-24 px-6 sm:px-8 lg:px-12">
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
    <div className="flex-1 overflow-y-auto h-[calc(100vh-80px)] bg-gradient-to-b from-stone-100 to-stone-50">
      <div className="min-h-full">
        {/* Header with Time Controls */}
        <PageHeader
          accent="violet"
          label="Practice Comparison"
          title="Compare Performance"
          subtitle={getDateRangeLabel()}
          showGridPattern
          actions={
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
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
              {viewMode === 'historical' && dataRange && (
                <MonthPicker
                  selectedMonth={selectedMonth}
                  selectedYear={selectedYear}
                  onSelect={handleMonthSelect}
                  minYear={dataRange.earliest.getFullYear()}
                  maxYear={dataRange.latest.getFullYear()}
                  autoOpen={true}
                />
              )}
            </div>
          }
        >
          {/* Dimension Selector in Header */}
          <div className="mt-6">
            <p className="text-stone-300 text-sm font-medium mb-3 uppercase tracking-wider">
              Compare by
            </p>
            <DimensionSelector selected={dimension} onChange={setDimension} />
          </div>
        </PageHeader>

        {/* Table Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
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
            <DataTableCard
              title={`By ${getDimensionLabel()}`}
              subtitle={`${compareData.groups.length} ${dimension === 'location' ? 'locations' : dimension === 'supervisor' ? 'teams' : 'license types'} compared`}
              columns={tableColumns}
              rows={tableRows}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CompareTab;
