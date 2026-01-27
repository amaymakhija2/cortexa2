import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { PracticeMetrics } from '../types';
import { MetricCard, ExpandableBarChart } from './design-system/cards/MetricCard';

// =============================================================================
// DRAG TO SCROLL HOOK (Performance optimized with refs)
// =============================================================================

const useDragToScroll = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [, forceUpdate] = useState(0);

  // Callback ref to detect when element mounts
  const setRef = useCallback((node: HTMLDivElement | null) => {
    containerRef.current = node;
    forceUpdate(n => n + 1);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseDown = (e: MouseEvent) => {
      // Don't initiate drag if clicking on interactive elements
      const target = e.target as HTMLElement;
      if (target.closest('button, a, [role="button"], input, select, textarea')) {
        return;
      }
      isDraggingRef.current = true;
      startXRef.current = e.pageX - container.offsetLeft;
      scrollLeftRef.current = container.scrollLeft;
      setIsDragging(true);
      container.style.scrollSnapType = 'none';
      container.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startXRef.current) * 1.2;
      container.scrollLeft = scrollLeftRef.current - walk;
    };

    const handleMouseUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      setIsDragging(false);
      container.style.scrollSnapType = '';
      container.style.cursor = '';
    };

    const handleMouseLeave = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      setIsDragging(false);
      container.style.scrollSnapType = '';
      container.style.cursor = '';
    };

    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [containerRef.current]);

  return { ref: setRef, isDragging };
};

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
  showConsultations?: boolean;
}

export const MetricsRow: React.FC<MetricsRowProps> = ({ metrics, isLive = true, showConsultations = true }) => {
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
      valueSuffix={metrics.revenue.valueSuffix}
      valueLabel={metrics.revenue.valueLabel}
      subtext={metrics.revenue.subtext}
      status={metrics.revenue.status}
      tooltip={METRIC_TOOLTIPS['Revenue']}
      expandableContent={revenueExpandableContent}
      expandButtonLabel="Weekly Breakdown"
      expandButtonLabelMobile="Weekly"
    />,
    ...(showConsultations ? [
      <MetricCard
        key="consultations"
        label={metrics.consultations.label}
        value={metrics.consultations.value}
        valueSuffix={metrics.consultations.valueSuffix}
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
    ] : []),
    <MetricCard
      key="sessions"
      label={metrics.sessions.label}
      value={metrics.sessions.value}
      valueSuffix={metrics.sessions.valueSuffix}
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
      valueSuffix={metrics.clientGrowth.valueSuffix}
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
      valueSuffix={metrics.attendance.valueSuffix}
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
      valueSuffix={metrics.compliance.valueSuffix}
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

  const { ref: dragScrollRef, isDragging } = useDragToScroll();

  // Card width: minimum 260px for readability, scales up to 400px on large screens
  // Shows ~3.5 cards on large screens to indicate scrollability
  const cardStyle = {
    width: 'clamp(260px, 28vw, 400px)',
  };

  return (
    // Container extends to right edge only (like Priority Tasks)
    <div className="relative min-h-[240px] -mr-6 sm:-mr-8 lg:-mr-12">
      {/* Scroll Container - absolute positioning for width constraint */}
      <div
        ref={dragScrollRef}
        className={`absolute inset-0 flex gap-4 overflow-x-auto snap-x snap-mandatory py-2 pr-6 sm:pr-8 lg:pr-12 cursor-grab ${
          isDragging ? 'select-none' : ''
        }`}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {cards.map((card, index) => (
          <div
            key={index}
            className="snap-start flex-shrink-0 h-full"
            style={{
              ...cardStyle,
              pointerEvents: isDragging ? 'none' : 'auto', // Prevent clicks while dragging
            }}
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
