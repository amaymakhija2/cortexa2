import React, { useState, useMemo } from 'react';
import { Users, ArrowRight } from 'lucide-react';
import {
  PageHeader,
  PageContent,
  Grid,
  Section,
  StatCard,
  ChartCard,
  DonutChartCard,
  DataTableCard,
  SplitBarCard,
  ToggleButton,
  GoalIndicator,
  ActionButton,
  BarChart,
  ExpandedChartModal,
  AnimatedGrid,
  AnimatedSection,
  ExecutiveSummary,
} from '../design-system';
import type { HoverInfo, SegmentConfig } from '../design-system';
import type { SessionsAnalysisTabProps } from './types';

// =============================================================================
// CONSTANTS
// =============================================================================

const CLINICIAN_SEGMENTS: SegmentConfig[] = [
  { key: 'Chen', label: 'S Chen', color: '#7c3aed', gradient: 'linear-gradient(180deg, #a78bfa 0%, #7c3aed 100%)' },
  { key: 'Rodriguez', label: 'M Rodriguez', color: '#0891b2', gradient: 'linear-gradient(180deg, #22d3ee 0%, #0891b2 100%)' },
  { key: 'Patel', label: 'A Patel', color: '#d97706', gradient: 'linear-gradient(180deg, #fbbf24 0%, #d97706 100%)' },
  { key: 'Kim', label: 'J Kim', color: '#db2777', gradient: 'linear-gradient(180deg, #f472b6 0%, #db2777 100%)' },
  { key: 'Johnson', label: 'M Johnson', color: '#059669', gradient: 'linear-gradient(180deg, #34d399 0%, #059669 100%)' },
];

const CLINICIAN_STACK_ORDER = ['Johnson', 'Kim', 'Patel', 'Rodriguez', 'Chen'];

// =============================================================================
// SESSIONS ANALYSIS TAB COMPONENT
// =============================================================================

export const SessionsAnalysisTab: React.FC<SessionsAnalysisTabProps> = ({
  timePeriod,
  onTimePeriodChange,
  timePeriods,
  tabs,
  activeTab,
  onTabChange,
  getDateRangeLabel,
  sessionsData,
  clinicianSessionsData,
}) => {
  // =========================================================================
  // LOCAL STATE
  // =========================================================================

  const [showClinicianBreakdown, setShowClinicianBreakdown] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [hoveredClinicianBar, setHoveredClinicianBar] = useState<HoverInfo | null>(null);

  // =========================================================================
  // COMPUTED VALUES
  // =========================================================================

  const totalCompleted = useMemo(
    () => sessionsData.reduce((sum, item) => sum + item.completed, 0),
    [sessionsData]
  );

  const totalBooked = useMemo(
    () => sessionsData.reduce((sum, item) => sum + item.booked, 0),
    [sessionsData]
  );

  const totalShow = useMemo(
    () => sessionsData.reduce((sum, item) => sum + item.show, 0),
    [sessionsData]
  );

  const showRate = useMemo(
    () => totalBooked > 0 ? (totalShow / totalBooked) * 100 : 0,
    [totalShow, totalBooked]
  );

  const monthsAtGoal = useMemo(
    () => sessionsData.filter(item => item.completed >= 700).length,
    [sessionsData]
  );

  const totalCancelled = useMemo(
    () => sessionsData.reduce((sum, item) => sum + item.cancelled, 0),
    [sessionsData]
  );

  const totalClinicianCancelled = useMemo(
    () => sessionsData.reduce((sum, item) => sum + item.clinicianCancelled, 0),
    [sessionsData]
  );

  const totalLateCancelled = useMemo(
    () => sessionsData.reduce((sum, item) => sum + item.lateCancelled, 0),
    [sessionsData]
  );

  const totalNoShow = useMemo(
    () => sessionsData.reduce((sum, item) => sum + item.noShow, 0),
    [sessionsData]
  );

  // Non-billable cancel rate (client cancellations + clinician cancellations)
  const nonBillableCancelRate = useMemo(() => {
    const totalNonBillable = totalCancelled + totalClinicianCancelled;
    const totalOutcomes = totalShow + totalCancelled + totalClinicianCancelled + totalLateCancelled + totalNoShow;
    return totalOutcomes > 0 ? (totalNonBillable / totalOutcomes) * 100 : 0;
  }, [totalShow, totalCancelled, totalClinicianCancelled, totalLateCancelled, totalNoShow]);

  // Secondary metrics
  const totalClients = useMemo(
    () => sessionsData.reduce((sum, item) => sum + item.clients, 0),
    [sessionsData]
  );

  const avgSessionsPerClient = useMemo(
    () => totalClients > 0 ? totalCompleted / totalClients : 0,
    [totalCompleted, totalClients]
  );

  const avgMonthlyCompleted = useMemo(
    () => sessionsData.length > 0 ? Math.round(totalCompleted / sessionsData.length) : 0,
    [totalCompleted, sessionsData.length]
  );

  const avgWeeklyCompleted = useMemo(
    () => Math.round(avgMonthlyCompleted / 4.33),
    [avgMonthlyCompleted]
  );

  // Modality data
  const totalTelehealth = useMemo(
    () => sessionsData.reduce((sum, item) => sum + item.telehealth, 0),
    [sessionsData]
  );

  const totalInPerson = useMemo(
    () => sessionsData.reduce((sum, item) => sum + item.inPerson, 0),
    [sessionsData]
  );

  // Best month and MoM trend
  const bestMonth = useMemo(() => {
    if (sessionsData.length === 0) return { month: '', completed: 0 };
    return sessionsData.reduce((best, item) =>
      item.completed > best.completed ? { month: item.month, completed: item.completed } : best,
      { month: '', completed: 0 }
    );
  }, [sessionsData]);

  const momChange = useMemo(() => {
    if (sessionsData.length < 2) return 0;
    const lastMonth = sessionsData[sessionsData.length - 1]?.completed || 0;
    const prevMonth = sessionsData[sessionsData.length - 2]?.completed || 0;
    return prevMonth > 0 ? ((lastMonth - prevMonth) / prevMonth) * 100 : 0;
  }, [sessionsData]);

  const sessionsRange = useMemo(() => {
    if (sessionsData.length === 0) return { min: 0, max: 0 };
    const values = sessionsData.map((item) => item.completed);
    return { min: Math.min(...values), max: Math.max(...values) };
  }, [sessionsData]);

  // =========================================================================
  // CHART DATA
  // =========================================================================

  // Bar chart data for single mode
  const barChartData = useMemo(() => {
    return sessionsData.map((item) => ({
      label: item.month,
      value: item.completed,
    }));
  }, [sessionsData]);

  // Stacked bar chart data for clinician breakdown
  const clinicianBarChartData = useMemo(() => {
    return clinicianSessionsData.map((item) => ({
      label: item.month,
      Chen: item.Chen,
      Rodriguez: item.Rodriguez,
      Patel: item.Patel,
      Kim: item.Kim,
      Johnson: item.Johnson,
    }));
  }, [clinicianSessionsData]);

  // Donut chart segments for attendance breakdown
  const attendanceSegments = useMemo(() => [
    { label: 'Attended', value: totalShow, color: '#10b981' },
    { label: 'Client Cancelled', value: totalCancelled, color: '#ef4444' },
    { label: 'Clinician Cancelled', value: totalClinicianCancelled, color: '#3b82f6' },
    { label: 'Late Cancelled', value: totalLateCancelled, color: '#f59e0b' },
    { label: 'No Show', value: totalNoShow, color: '#6b7280' },
  ], [totalShow, totalCancelled, totalClinicianCancelled, totalLateCancelled, totalNoShow]);

  // =========================================================================
  // INSIGHTS
  // =========================================================================

  const sessionsInsights = useMemo(() => [
    {
      value: bestMonth.month,
      label: `Best (${bestMonth.completed})`,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      value: `${momChange >= 0 ? '+' : ''}${momChange.toFixed(1)}%`,
      label: 'MoM Trend',
      bgColor: momChange >= 0 ? 'bg-emerald-50' : 'bg-rose-50',
      textColor: momChange >= 0 ? 'text-emerald-600' : 'text-rose-600',
    },
    {
      value: `${sessionsRange.min}–${sessionsRange.max}`,
      label: 'Range',
      bgColor: 'bg-stone-100',
      textColor: 'text-stone-700',
    },
  ], [bestMonth, momChange, sessionsRange]);

  const clinicianInsights = useMemo(() => {
    // Calculate totals per clinician
    const totals = clinicianSessionsData.reduce((acc, item) => ({
      Chen: acc.Chen + item.Chen,
      Rodriguez: acc.Rodriguez + item.Rodriguez,
      Patel: acc.Patel + item.Patel,
      Kim: acc.Kim + item.Kim,
      Johnson: acc.Johnson + item.Johnson,
    }), { Chen: 0, Rodriguez: 0, Patel: 0, Kim: 0, Johnson: 0 });

    const entries = Object.entries(totals) as [string, number][];
    const sorted = entries.sort((a, b) => b[1] - a[1]);
    const [topName, topValue] = sorted[0];
    const totalAll = entries.reduce((sum, [, v]) => sum + v, 0);
    const avgPerClinician = Math.round(totalAll / 5);

    return [
      { value: topName, label: `Top (${topValue})`, bgColor: 'bg-violet-50', textColor: 'text-violet-600' },
      { value: avgPerClinician.toString(), label: 'Avg/Clinician', bgColor: 'bg-stone-100', textColor: 'text-stone-700' },
      { value: totalAll.toString(), label: 'Total', bgColor: 'bg-cyan-50', textColor: 'text-cyan-600' },
    ];
  }, [clinicianSessionsData]);

  // =========================================================================
  // TABLE DATA BUILDERS
  // =========================================================================

  const buildTableColumns = () => {
    const monthColumns = sessionsData.map((item) => ({
      key: item.month.toLowerCase(),
      header: item.month,
      align: 'right' as const,
    }));
    return [...monthColumns, { key: 'total', header: 'Total', align: 'right' as const, isTotals: true }];
  };

  const buildTableRows = () => {
    const buildRowValues = (field: keyof typeof sessionsData[0]) => {
      const values: Record<string, string> = {};
      let total = 0;
      sessionsData.forEach((item) => {
        const val = item[field] as number;
        values[item.month.toLowerCase()] = val.toLocaleString();
        total += val;
      });
      values.total = total.toLocaleString();
      return values;
    };

    return [
      { id: 'booked', label: 'Booked', indicator: { color: '#06b6d4' }, values: buildRowValues('booked') },
      { id: 'completed', label: 'Completed', indicator: { color: '#10b981' }, values: buildRowValues('completed'), valueColor: 'text-emerald-600', isHighlighted: true, highlightColor: 'emerald' as const },
      { id: 'cancelled', label: 'Client Cancelled', indicator: { color: '#ef4444' }, values: buildRowValues('cancelled'), valueColor: 'text-rose-600' },
      { id: 'clinicianCancelled', label: 'Clinician Cancelled', indicator: { color: '#3b82f6' }, values: buildRowValues('clinicianCancelled'), valueColor: 'text-blue-600' },
      { id: 'lateCancelled', label: 'Late Cancelled', indicator: { color: '#f59e0b' }, values: buildRowValues('lateCancelled'), valueColor: 'text-amber-600' },
      { id: 'noShow', label: 'No Show', indicator: { color: '#6b7280' }, values: buildRowValues('noShow'), valueColor: 'text-stone-600' },
    ];
  };

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="min-h-full">
      {/* Page Header */}
      <PageHeader
        accent="amber"
        label="Detailed Analysis"
        title="Sessions Performance"
        subtitle={getDateRangeLabel()}
        showTimePeriod
        timePeriod={timePeriod}
        timePeriods={timePeriods}
        onTimePeriodChange={onTimePeriodChange}
      />

      <PageContent>
        {/* Executive Summary */}
        <Section spacing="md">
          <ExecutiveSummary
            headline="Sessions On Track, Monitor Cancellations"
            summary={`Your practice completed **${totalCompleted.toLocaleString()} sessions** this period with a **${showRate.toFixed(1)}% show rate**. You hit the 700-session goal in **${monthsAtGoal} of ${sessionsData.length} months**. The non-billable cancellation rate stands at **${nonBillableCancelRate.toFixed(1)}%**—${nonBillableCancelRate <= 10 ? 'well within healthy range' : 'consider reviewing scheduling practices to reduce lost revenue'}.`}
            accent="indigo"
          />
        </Section>

        {/* Hero Stats Row */}
        <Section spacing="md">
          <AnimatedGrid cols={4} gap="md" staggerDelay={60}>
            <StatCard
              title="Total Completed"
              value={totalCompleted.toLocaleString()}
              subtitle={`across ${sessionsData.length} months`}
            />
            <StatCard
              title="Total Booked"
              value={totalBooked.toLocaleString()}
              subtitle={`${showRate.toFixed(1)}% show rate`}
            />
            <StatCard
              title="Goal Achievement"
              value={`${monthsAtGoal}/${sessionsData.length}`}
              subtitle="months hit 700 goal"
            />
            <StatCard
              title="Avg Non-Billable Cancel Rate"
              value={`${nonBillableCancelRate.toFixed(1)}%`}
              subtitle="Client + Clinician Cancellations"
            />
          </AnimatedGrid>
        </Section>

        {/* Main Charts Row */}
        <AnimatedSection delay={280}>
          <Section spacing="md">
            <Grid cols={2} gap="lg">
            {/* Completed Sessions Chart */}
            <ChartCard
              title="Completed Sessions"
              subtitle="Monthly performance"
              headerControls={
                <>
                  <ToggleButton
                    label="By Clinician"
                    active={showClinicianBreakdown}
                    onToggle={() => setShowClinicianBreakdown(!showClinicianBreakdown)}
                    icon={<Users size={16} />}
                    hidden={!!hoveredClinicianBar}
                  />
                  <GoalIndicator
                    value={700}
                    label="Goal"
                    color="amber"
                    hidden={showClinicianBreakdown || !!hoveredClinicianBar}
                  />
                  {hoveredClinicianBar && (
                    <div
                      className="flex items-center gap-3 px-4 py-2 rounded-xl"
                      style={{ backgroundColor: `${hoveredClinicianBar.color}15` }}
                    >
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: hoveredClinicianBar.color }} />
                      <span className="text-stone-700 font-semibold">{hoveredClinicianBar.segmentLabel}</span>
                      <span className="font-bold" style={{ color: hoveredClinicianBar.color }}>
                        {hoveredClinicianBar.value}
                      </span>
                      <span className="text-stone-500 text-sm">in {hoveredClinicianBar.label}</span>
                    </div>
                  )}
                  <ActionButton label="Sessions Report" icon={<ArrowRight size={16} />} />
                </>
              }
              expandable
              onExpand={() => setExpandedCard('session-performance')}
              insights={showClinicianBreakdown ? clinicianInsights : sessionsInsights}
              minHeight="520px"
            >
              {showClinicianBreakdown ? (
                <BarChart
                  data={clinicianBarChartData}
                  mode="stacked"
                  segments={CLINICIAN_SEGMENTS}
                  stackOrder={CLINICIAN_STACK_ORDER}
                  formatValue={(v) => v.toString()}
                  onHover={setHoveredClinicianBar}
                  showLegend
                  legendPosition="top-right"
                  maxValue={900}
                  height="380px"
                />
              ) : (
                <BarChart
                  data={barChartData}
                  mode="single"
                  goal={{ value: 700 }}
                  maxValue={900}
                  getBarColor={(value) =>
                    value >= 700
                      ? {
                          gradient: 'linear-gradient(180deg, #34d399 0%, #059669 100%)',
                          shadow: '0 4px 12px -2px rgba(16, 185, 129, 0.35)',
                          textColor: 'text-emerald-600',
                        }
                      : {
                          gradient: 'linear-gradient(180deg, #60a5fa 0%, #2563eb 100%)',
                          shadow: '0 4px 12px -2px rgba(37, 99, 235, 0.35)',
                          textColor: 'text-blue-600',
                        }
                  }
                  formatValue={(v) => v.toString()}
                  height="380px"
                />
              )}
            </ChartCard>

            {/* Attendance Breakdown Donut */}
            <DonutChartCard
              title="Attendance Breakdown"
              subtitle="Session outcomes"
              segments={attendanceSegments}
              centerLabel="Show Rate"
              centerValue={`${showRate.toFixed(1)}%`}
              valueFormat="number"
              expandable
              onExpand={() => setExpandedCard('attendance-breakdown')}
            />
            </Grid>
          </Section>
        </AnimatedSection>

        {/* Secondary Metrics Row */}
        <AnimatedSection delay={380}>
          <Section spacing="md">
            <AnimatedGrid cols={3} gap="md" staggerDelay={60}>
              <StatCard
                title="Avg Sessions per Client per Month"
                value={avgSessionsPerClient.toFixed(1)}
                subtitle="sessions per active client per month"
              />
              <StatCard
                title="Avg Sessions"
                value={`${avgMonthlyCompleted.toLocaleString()}/mo`}
                subtitle={`${avgWeeklyCompleted}/week`}
              />
              <SplitBarCard
                title="Session Modality"
                leftSegment={{
                  label: 'Telehealth',
                  value: totalTelehealth,
                  color: '#0891b2',
                  colorEnd: '#0e7490',
                }}
                rightSegment={{
                  label: 'In-Person',
                  value: totalInPerson,
                  color: '#d97706',
                  colorEnd: '#b45309',
                }}
                expandable
                onExpand={() => setExpandedCard('session-modality')}
              />
            </AnimatedGrid>
          </Section>
        </AnimatedSection>

        {/* Monthly Breakdown Table */}
        <AnimatedSection delay={480}>
          <Section spacing="none">
            <DataTableCard
              title="Monthly Breakdown"
              subtitle="Detailed session metrics by month"
              columns={buildTableColumns()}
              rows={buildTableRows()}
              expandable
              onExpand={() => setExpandedCard('monthly-breakdown')}
            />
          </Section>
        </AnimatedSection>
      </PageContent>

      {/* =====================================================================
          EXPANDED MODALS
          ===================================================================== */}

      {/* Session Performance Expanded */}
      <ExpandedChartModal
        isOpen={expandedCard === 'session-performance'}
        onClose={() => setExpandedCard(null)}
        title="Completed Sessions"
        subtitle={showClinicianBreakdown ? 'Sessions by clinician breakdown' : 'Monthly performance with 700 goal'}
        headerControls={
          <>
            <ToggleButton
              label="By Clinician"
              active={showClinicianBreakdown}
              onToggle={() => setShowClinicianBreakdown(!showClinicianBreakdown)}
              icon={<Users size={16} />}
            />
            <GoalIndicator value={700} label="Goal" color="amber" hidden={showClinicianBreakdown} />
            <ActionButton label="Sessions Report" icon={<ArrowRight size={16} />} />
          </>
        }
        insights={showClinicianBreakdown ? clinicianInsights : sessionsInsights}
      >
        {showClinicianBreakdown ? (
          <BarChart
            data={clinicianBarChartData}
            mode="stacked"
            segments={CLINICIAN_SEGMENTS}
            stackOrder={CLINICIAN_STACK_ORDER}
            formatValue={(v) => v.toString()}
            onHover={setHoveredClinicianBar}
            showLegend
            legendPosition="top-right"
            maxValue={900}
            size="lg"
            height="100%"
          />
        ) : (
          <BarChart
            data={barChartData}
            mode="single"
            maxValue={900}
            goal={{ value: 700 }}
            getBarColor={(value) =>
              value >= 700
                ? {
                    gradient: 'linear-gradient(180deg, #34d399 0%, #059669 100%)',
                    shadow: '0 4px 12px -2px rgba(16, 185, 129, 0.35)',
                    textColor: 'text-emerald-600',
                  }
                : {
                    gradient: 'linear-gradient(180deg, #60a5fa 0%, #2563eb 100%)',
                    shadow: '0 4px 12px -2px rgba(37, 99, 235, 0.35)',
                    textColor: 'text-blue-600',
                  }
            }
            formatValue={(v) => v.toString()}
            size="lg"
            height="100%"
          />
        )}
      </ExpandedChartModal>

      {/* Attendance Breakdown Expanded */}
      <ExpandedChartModal
        isOpen={expandedCard === 'attendance-breakdown'}
        onClose={() => setExpandedCard(null)}
        title="Attendance Breakdown"
        subtitle="Session outcomes distribution"
      >
        <DonutChartCard
          title=""
          segments={attendanceSegments}
          centerLabel="Show Rate"
          centerValue={`${showRate.toFixed(1)}%`}
          valueFormat="number"
          size="lg"
        />
      </ExpandedChartModal>

      {/* Session Modality Expanded */}
      <ExpandedChartModal
        isOpen={expandedCard === 'session-modality'}
        onClose={() => setExpandedCard(null)}
        title="Session Modality"
        subtitle="Telehealth vs In-Person distribution"
      >
        <SplitBarCard
          title=""
          leftSegment={{
            label: 'Telehealth',
            value: totalTelehealth,
            color: '#0891b2',
            colorEnd: '#0e7490',
          }}
          rightSegment={{
            label: 'In-Person',
            value: totalInPerson,
            color: '#d97706',
            colorEnd: '#b45309',
          }}
        />
      </ExpandedChartModal>

      {/* Monthly Breakdown Expanded */}
      <ExpandedChartModal
        isOpen={expandedCard === 'monthly-breakdown'}
        onClose={() => setExpandedCard(null)}
        title="Monthly Breakdown"
        subtitle="Detailed session metrics by month"
      >
        <DataTableCard
          title=""
          columns={buildTableColumns()}
          rows={buildTableRows()}
          size="lg"
        />
      </ExpandedChartModal>
    </div>
  );
};

export default SessionsAnalysisTab;
