import React from 'react';
import { PracticeMetrics } from '../types';
import { MetricCard, ExpandableBarChart } from './design-system/cards/MetricCard';

// =============================================================================
// METRIC TOOLTIPS
// =============================================================================

const METRIC_TOOLTIPS: Record<string, { title: string; description: string }> = {
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

// =============================================================================
// EXPANDABLE CONTENT DATA
// =============================================================================

const WEEKLY_REVENUE = [
  { label: 'Oct 28 – Nov 3', value: 38200, displayValue: '$38.2k' },
  { label: 'Nov 4 – Nov 10', value: 41500, displayValue: '$41.5k' },
  { label: 'Nov 11 – Nov 17', value: 36800, displayValue: '$36.8k' },
  { label: 'Nov 18 – Nov 24', value: 36900, displayValue: '$36.9k' },
];

const BOOKING_FORECAST = [
  { label: 'Week of Nov 25', value: 42, displayValue: '42' },
  { label: 'Week of Dec 2', value: 38, displayValue: '38' },
  { label: 'Week of Dec 9', value: 29, displayValue: '29' },
  { label: 'Week of Dec 16', value: 18, displayValue: '18' },
];

// =============================================================================
// METRICS ROW COMPONENT
// =============================================================================

export interface MetricsRowProps {
  metrics: PracticeMetrics;
  isLive?: boolean;
}

export const MetricsRow: React.FC<MetricsRowProps> = ({ metrics, isLive = true }) => {
  // Build the expandable content for Revenue card
  const revenueExpandableContent = isLive ? (
    <ExpandableBarChart
      data={WEEKLY_REVENUE}
      totalLabel="total this month"
    />
  ) : undefined;

  // Build the expandable content for Sessions card
  const sessionsExpandableContent = isLive ? (
    <ExpandableBarChart
      data={BOOKING_FORECAST}
      totalLabel="booked total"
    />
  ) : undefined;

  const cards = [
    <MetricCard
      key="revenue"
      label={metrics.revenue.label}
      value={metrics.revenue.value}
      valueLabel={metrics.revenue.valueLabel}
      subtext={metrics.revenue.subtext}
      status={metrics.revenue.status}
      tooltip={METRIC_TOOLTIPS['Revenue']}
      expandableContent={revenueExpandableContent}
      expandButtonLabel="Weekly Breakdown"
      expandButtonLabelMobile="Weekly"
    />,
    <MetricCard
      key="sessions"
      label={metrics.sessions.label}
      value={metrics.sessions.value}
      valueLabel={metrics.sessions.valueLabel}
      subtext={metrics.sessions.subtext}
      status={metrics.sessions.status}
      tooltip={METRIC_TOOLTIPS['Sessions']}
      expandableContent={sessionsExpandableContent}
      expandButtonLabel="Upcoming Bookings"
      expandButtonLabelMobile="Bookings"
    />,
    <MetricCard
      key="clients"
      label={metrics.clientGrowth.label}
      value={metrics.clientGrowth.value}
      valueLabel={metrics.clientGrowth.valueLabel}
      subtext={metrics.clientGrowth.subtext}
      status={metrics.clientGrowth.status}
      tooltip={METRIC_TOOLTIPS['Clients']}
    />,
    <MetricCard
      key="attendance"
      label={metrics.attendance.label}
      value={metrics.attendance.value}
      valueLabel={metrics.attendance.valueLabel}
      subtext={metrics.attendance.subtext}
      status={metrics.attendance.status}
      tooltip={METRIC_TOOLTIPS['Attendance']}
    />,
    <MetricCard
      key="compliance"
      label={metrics.compliance.label}
      value={metrics.compliance.value}
      valueLabel={metrics.compliance.valueLabel}
      subtext={metrics.compliance.subtext}
      status={metrics.compliance.status}
      tooltip={METRIC_TOOLTIPS['Outstanding Notes']}
    />,
  ];

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
        {cards.map((card, index) => (
          <div key={index} className="snap-start flex-shrink-0 w-[280px] sm:w-[320px] md:w-[340px]">
            {card}
          </div>
        ))}
      </div>

      {/* Desktop: Grid layout (lg/1024px and above) */}
      <div className="hidden lg:grid lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 lg:gap-4 xl:gap-5 items-stretch">
        {cards}
      </div>
    </>
  );
};

export default MetricsRow;
