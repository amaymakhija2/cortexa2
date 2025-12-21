import React, { useRef } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { PracticeMetrics } from '../types';
import { MetricCard, ExpandableBarChart } from './design-system/cards/MetricCard';

// =============================================================================
// CLIENT GROWTH EXPANDABLE CONTENT
// =============================================================================

interface ClientGrowthContentProps {
  newClients: number;
  churned: number;
}

const ClientGrowthContent: React.FC<ClientGrowthContentProps> = ({ newClients, churned }) => {
  const netChange = newClients - churned;

  return (
    <div className="space-y-4">
      {/* New Clients */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50">
          <ArrowUpRight size={20} className="text-emerald-600" />
        </div>
        <p className="text-lg font-bold text-stone-900">
          {newClients} New Clients This Month
        </p>
      </div>

      {/* Churned Clients */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-rose-50">
          <ArrowDownRight size={20} className="text-rose-600" />
        </div>
        <p className="text-lg font-bold text-stone-900">
          {churned} Clients Churned This Month
        </p>
      </div>

      {/* Net Change Summary */}
      <div className="pt-4 border-t border-stone-100">
        <p className="text-sm text-stone-500">
          <span className={`font-bold ${netChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {netChange >= 0 ? '+' : ''}{netChange} net
          </span>
          {' client growth this month'}
        </p>
      </div>
    </div>
  );
};

// Helper to parse client numbers from subtext
const parseClientNumbers = (subtext: string): { newClients: number; churned: number; openings: number | null } => {
  // Patterns: "17 new, 5 discharged · 18 openings" or "+12 new · -4 discharged"
  const newMatch = subtext.match(/\+?(\d+)\s*new/i);
  const churnedMatch = subtext.match(/-?(\d+)\s*(?:discharged|churned)/i);
  const openingsMatch = subtext.match(/(\d+)\s*openings/i);

  return {
    newClients: newMatch ? parseInt(newMatch[1], 10) : 0,
    churned: churnedMatch ? parseInt(churnedMatch[1], 10) : 0,
    openings: openingsMatch ? parseInt(openingsMatch[1], 10) : null,
  };
};

// =============================================================================
// METRIC TOOLTIPS
// =============================================================================

const METRIC_TOOLTIPS: Record<string, { title: string; description: string }> = {
  'Revenue': {
    title: 'Revenue',
    description: 'Total payments collected for the selected time period toward your monthly revenue goal.'
  },
  'Sessions': {
    title: 'Completed Sessions',
    description: 'Number of sessions completed for the selected time period. Session Goal % shows completed sessions as a percentage of your session goal.'
  },
  'Consultations': {
    title: 'Consultations',
    description: 'New client consultations booked this month. Track your pipeline from initial consultation through conversion to active client.'
  },
  'Clients': {
    title: 'Active Clients',
    description: 'Clients with active status (not discharged). Client Openings shows capacity for new clients.'
  },
  'Attendance': {
    title: 'Rebook Rate',
    description: 'Percentage of active clients who have their next appointment scheduled. A leading indicator of retention.'
  },
  'Outstanding Notes': {
    title: 'Outstanding Notes',
    description: 'Total notes that need to be completed. Includes overdue notes (past deadline) and notes due soon (within 48 hours).'
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

  // Parse client growth data and build expandable content
  const clientData = parseClientNumbers(metrics.clientGrowth.subtext);
  const clientsExpandableContent = (
    <ClientGrowthContent
      newClients={clientData.newClients}
      churned={clientData.churned}
    />
  );

  // Simplified subtext for clients card (only show openings)
  const clientsSubtext = clientData.openings !== null
    ? `${clientData.openings} Client Openings Available`
    : 'Client capacity available';

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
      key="consultations"
      label={metrics.consultations.label}
      value={metrics.consultations.value}
      valueLabel={metrics.consultations.valueLabel}
      subtext={metrics.consultations.subtext}
      status={metrics.consultations.status}
      tooltip={METRIC_TOOLTIPS['Consultations']}
      navigateTo={{
        path: '/clinician-overview?tab=ranking&metric=growth',
        label: 'By Clinician',
        labelMobile: 'Clinicians',
      }}
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
      subtext={clientsSubtext}
      status={metrics.clientGrowth.status}
      tooltip={METRIC_TOOLTIPS['Clients']}
      expandableContent={clientsExpandableContent}
      expandButtonLabel="Client Details"
      expandButtonLabelMobile="Details"
    />,
    <MetricCard
      key="attendance"
      label={metrics.attendance.label}
      value={metrics.attendance.value}
      valueLabel={metrics.attendance.valueLabel}
      subtext={metrics.attendance.subtext}
      status={metrics.attendance.status}
      tooltip={METRIC_TOOLTIPS['Attendance']}
      navigateTo={{
        path: '/clinician-overview?tab=ranking&metric=attendance',
        label: 'By Clinician',
        labelMobile: 'Clinicians',
      }}
    />,
    <MetricCard
      key="compliance"
      label={metrics.compliance.label}
      value={metrics.compliance.value}
      valueLabel={metrics.compliance.valueLabel}
      subtext={metrics.compliance.subtext}
      status={metrics.compliance.status}
      tooltip={METRIC_TOOLTIPS['Outstanding Notes']}
      navigateTo={{
        path: '/clinician-overview?tab=ranking&metric=documentation',
        label: 'By Clinician',
        labelMobile: 'Clinicians',
      }}
    />,
  ];

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Card width: show ~3.5 cards on large screens to indicate scrollability
  const cardStyle = {
    width: 'clamp(280px, 26vw, 480px)',
  };

  return (
    // Container extends to right edge only (like Priority Tasks)
    <div className="relative min-h-[240px] -mr-6 sm:-mr-8 lg:-mr-12">
      {/* Scroll Container - absolute positioning for width constraint */}
      <div
        ref={scrollContainerRef}
        className="absolute inset-0 flex gap-4 overflow-x-auto snap-x snap-mandatory py-2 pr-6 sm:pr-8 lg:pr-12"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {cards.map((card, index) => (
          <div
            key={index}
            className="snap-start flex-shrink-0"
            style={cardStyle}
          >
            {card}
          </div>
        ))}
      </div>

      <style>{`
        .overflow-x-auto::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default MetricsRow;
