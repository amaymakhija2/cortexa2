import React, { useState, useMemo, useRef } from 'react';
import { Users, ArrowRight } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
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
  ClinicianFilter,
  OthersTooltip,
  useClinicianFilter,
} from '../design-system';
import type { HoverInfo, SegmentConfig, ClinicianFilterOption } from '../design-system';
import { TimeSelector } from '../design-system/controls/TimeSelector';
import type { SessionsAnalysisTabProps } from './types';

// =============================================================================
// CONSTANTS
// =============================================================================

// Clinician display labels
const CLINICIAN_LABELS: Record<string, string> = {
  Chen: 'S Chen',
  Rodriguez: 'M Rodriguez',
  Patel: 'A Patel',
  Kim: 'J Kim',
  Johnson: 'M Johnson',
};

// All clinician keys in the data
const CLINICIAN_KEYS = ['Chen', 'Rodriguez', 'Patel', 'Kim', 'Johnson'];

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
  timeSelection,
  onTimeSelectionChange,
  sessionsData,
  clinicianSessionsData,
}) => {
  // =========================================================================
  // LOCAL STATE & SETTINGS
  // =========================================================================

  const { settings } = useSettings();
  const sessionsGoal = settings.practiceGoals.monthlySessions;

  const [showClinicianBreakdown, setShowClinicianBreakdown] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Reference for tooltip positioning
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // ==========================================================================
  // CLINICIAN FILTER HOOK (Top N + Others pattern)
  // ==========================================================================

  const clinicianFilter = useClinicianFilter({
    data: clinicianSessionsData,
    clinicianKeys: CLINICIAN_KEYS,
    clinicianLabels: CLINICIAN_LABELS,
    initialFilter: 'top5',
  });

  // Get user-friendly period label (e.g., "last 12 months" instead of "Jan–Dec 2024")
  const periodLabel = useMemo(() => {
    const period = timePeriods.find(p => p.id === timePeriod);
    return period?.label.toLowerCase() || 'this period';
  }, [timePeriod, timePeriods]);

  // Capitalized period label for subtitles (e.g., "Last 12 Months")
  const periodLabelCapitalized = useMemo(() => {
    const period = timePeriods.find(p => p.id === timePeriod);
    return period?.label || 'This Period';
  }, [timePeriod, timePeriods]);

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
    () => sessionsData.filter(item => item.completed >= sessionsGoal).length,
    [sessionsData, sessionsGoal]
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

  // Client cancel rate (client cancellations only)
  const clientCancelRate = useMemo(() => {
    const totalOutcomes = totalShow + totalCancelled + totalClinicianCancelled + totalLateCancelled + totalNoShow;
    return totalOutcomes > 0 ? (totalCancelled / totalOutcomes) * 100 : 0;
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

  // Stacked bar chart data for clinician breakdown (with Others aggregation)
  const clinicianBarChartData = useMemo(() => {
    return clinicianFilter.transformedData.map((item) => ({
      label: item.month,
      ...CLINICIAN_KEYS.reduce((acc, key) => ({ ...acc, [key]: item[key] }), {}),
      __others__: item.__others__ || 0,
    }));
  }, [clinicianFilter.transformedData]);

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
      value: `${monthsAtGoal}/${sessionsData.length}`,
      label: 'Goal Achievement',
      bgColor: 'bg-stone-100',
      textColor: 'text-stone-700',
    },
    {
      value: `${sessionsRange.min}–${sessionsRange.max}`,
      label: 'Range',
      bgColor: 'bg-stone-100',
      textColor: 'text-stone-700',
    },
  ], [bestMonth, monthsAtGoal, sessionsData.length, sessionsRange]);

  const clinicianInsights = useMemo(() => {
    const { topClinician, avgPerClinician, grandTotal, colorConfig } = clinicianFilter;
    const othersCount = colorConfig.othersClinicians.length;

    return [
      {
        value: topClinician?.label || '-',
        label: `Top (${topClinician?.totalValue || 0})`,
        bgColor: 'bg-violet-50',
        textColor: 'text-violet-600',
      },
      {
        value: Math.round(avgPerClinician).toString(),
        label: 'Avg/Clinician',
        bgColor: 'bg-stone-100',
        textColor: 'text-stone-700',
      },
      {
        value: grandTotal.toString(),
        label: othersCount > 0 ? `Total (${othersCount} in Others)` : 'Total',
        bgColor: 'bg-stone-100',
        textColor: 'text-stone-700',
      },
    ];
  }, [clinicianFilter]);

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
        title="Sessions Performance"
        timeSelector={
          <TimeSelector
            value={timeSelection}
            onChange={onTimeSelectionChange}
            showAggregateOption={true}
            aggregateOnly={true}
            variant="header"
          />
        }
      />

      <PageContent>
        {/* Executive Summary */}
        {!settings.hideAIInsights && (
          <Section spacing="md">
            <ExecutiveSummary
              headline="Sessions On Track, Monitor Cancellations"
              summary={`Your practice completed **${totalCompleted.toLocaleString()} sessions** this period with a **${showRate.toFixed(1)}% show rate**. You hit the ${sessionsGoal}-session goal in **${monthsAtGoal} of ${sessionsData.length} months**. The client cancellation rate stands at **${clientCancelRate.toFixed(1)}%**—${clientCancelRate <= 15 ? 'within acceptable range' : 'consider reviewing scheduling practices to reduce lost revenue'}.`}
              accent="indigo"
            />
          </Section>
        )}

        {/* Hero Stats Row */}
        <Section spacing="md">
          <AnimatedGrid cols={4} gap="md" staggerDelay={60}>
            <StatCard
              title="Sessions Completed"
              value={totalCompleted.toLocaleString()}
              valueLabel="total"
              subtitle={periodLabel}
            />
            <StatCard
              title="Sessions Booked"
              value={totalBooked.toLocaleString()}
              valueLabel="total"
              subtitle={periodLabel}
            />
            <StatCard
              title="Weekly Sessions"
              value={avgWeeklyCompleted.toString()}
              valueLabel="average"
              subtitle={periodLabel}
            />
            <StatCard
              title="Cancel Rate"
              value={clientCancelRate.toFixed(1)}
              valueSuffix="%"
              valueLabel="average"
              subtitle={periodLabel}
            />
          </AnimatedGrid>
        </Section>

        {/* Main Charts Row */}
        <AnimatedSection delay={280}>
          <Section spacing="md">
            <Grid cols={2} gap="lg">
            {/* Completed Sessions Chart */}
            <ChartCard
              title="Completed Sessions Per Month"
              subtitle="How many sessions you're completing each month"
              headerControls={
                <>
                  <ToggleButton
                    label="By Clinician"
                    active={showClinicianBreakdown}
                    onToggle={() => setShowClinicianBreakdown(!showClinicianBreakdown)}
                    icon={<Users size={16} />}
                    hidden={!!clinicianFilter.hoverInfo}
                  />
                  {showClinicianBreakdown && !clinicianFilter.hoverInfo && (
                    <ClinicianFilter
                      value={clinicianFilter.filterMode}
                      onChange={clinicianFilter.setFilterMode}
                      customSelection={clinicianFilter.customSelection}
                      onCustomSelectionChange={clinicianFilter.setCustomSelection}
                      clinicians={clinicianFilter.allClinicians}
                      size="sm"
                    />
                  )}
                  <GoalIndicator
                    value={sessionsGoal}
                    label="Goal"
                    color="amber"
                    hidden={showClinicianBreakdown || !!clinicianFilter.hoverInfo}
                  />
                  {clinicianFilter.hoverInfo && !clinicianFilter.isOthersHovered && (
                    <div
                      className="flex items-center gap-3 px-4 py-2 rounded-xl"
                      style={{ backgroundColor: `${clinicianFilter.hoverInfo.color}15` }}
                    >
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: clinicianFilter.hoverInfo.color }} />
                      <span className="text-stone-700 font-semibold">{clinicianFilter.hoverInfo.segmentLabel}</span>
                      <span className="font-bold" style={{ color: clinicianFilter.hoverInfo.color }}>
                        {clinicianFilter.hoverInfo.value}
                      </span>
                      <span className="text-stone-500 text-sm">in {clinicianFilter.hoverInfo.label}</span>
                    </div>
                  )}
                  {clinicianFilter.isOthersHovered && (
                    <div
                      className="flex items-center gap-3 px-4 py-2 rounded-xl bg-stone-100"
                    >
                      <div className="w-3 h-3 rounded-full bg-stone-500" />
                      <span className="text-stone-700 font-semibold">Others</span>
                      <span className="font-bold text-stone-600">
                        {clinicianFilter.hoverInfo?.value}
                      </span>
                      <span className="text-stone-500 text-sm">
                        ({clinicianFilter.colorConfig.othersClinicians.length} clinicians)
                      </span>
                    </div>
                  )}
                </>
              }
              expandable
              onExpand={() => setExpandedCard('session-performance')}
              insights={showClinicianBreakdown ? clinicianInsights : sessionsInsights}
              minHeight="520px"
            >
              {showClinicianBreakdown ? (
                <div ref={chartContainerRef} className="relative h-full">
                  <BarChart
                    data={clinicianBarChartData}
                    mode="stacked"
                    segments={clinicianFilter.segments}
                    stackOrder={clinicianFilter.stackOrder}
                    formatValue={(v) => v.toString()}
                    onHover={clinicianFilter.handleSegmentHover}
                    showLegend
                    legendPosition="top-right"
                    maxValue={900}
                    height="380px"
                  />
                  {/* Others Tooltip */}
                  {clinicianFilter.isOthersHovered && clinicianFilter.hoveredDataPoint && (
                    <OthersTooltip
                      clinicians={clinicianFilter.colorConfig.othersClinicians}
                      dataPointLabel={clinicianFilter.hoverInfo?.label || ''}
                      dataPointValues={clinicianFilter.hoveredDataPoint as Record<string, number>}
                      totalValue={clinicianFilter.hoverInfo?.value || 0}
                      onSwap={clinicianFilter.swapClinicianIntoView}
                      formatValue={(v) => v.toString()}
                      className="right-4 top-16"
                    />
                  )}
                </div>
              ) : (
                <BarChart
                  data={barChartData}
                  mode="single"
                  goal={{ value: sessionsGoal }}
                  maxValue={900}
                  getBarColor={(value) =>
                    value >= sessionsGoal
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
              subtitle={`What happens to your booked sessions (${periodLabelCapitalized})`}
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
            <AnimatedGrid cols={2} gap="md" staggerDelay={60}>
              <StatCard
                title="Sessions per Client per Month"
                value={avgSessionsPerClient.toFixed(1)}
                valueLabel="average"
                subtitle={periodLabel}
              />
              <SplitBarCard
                title="Session Modality"
                subtitle={periodLabel}
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
        title="Completed Sessions Per Month"
        subtitle="How many sessions you're completing each month"
        headerControls={
          <>
            <ToggleButton
              label="By Clinician"
              active={showClinicianBreakdown}
              onToggle={() => setShowClinicianBreakdown(!showClinicianBreakdown)}
              icon={<Users size={16} />}
            />
            {showClinicianBreakdown && (
              <ClinicianFilter
                value={clinicianFilter.filterMode}
                onChange={clinicianFilter.setFilterMode}
                customSelection={clinicianFilter.customSelection}
                onCustomSelectionChange={clinicianFilter.setCustomSelection}
                clinicians={clinicianFilter.allClinicians}
              />
            )}
            <GoalIndicator value={sessionsGoal} label="Goal" color="amber" hidden={showClinicianBreakdown} />
          </>
        }
        insights={showClinicianBreakdown ? clinicianInsights : sessionsInsights}
      >
        {showClinicianBreakdown ? (
          <div className="relative h-full">
            <BarChart
              data={clinicianBarChartData}
              mode="stacked"
              segments={clinicianFilter.segments}
              stackOrder={clinicianFilter.stackOrder}
              formatValue={(v) => v.toString()}
              onHover={clinicianFilter.handleSegmentHover}
              showLegend
              legendPosition="top-right"
              maxValue={900}
              size="lg"
              height="100%"
            />
            {/* Others Tooltip */}
            {clinicianFilter.isOthersHovered && clinicianFilter.hoveredDataPoint && (
              <OthersTooltip
                clinicians={clinicianFilter.colorConfig.othersClinicians}
                dataPointLabel={clinicianFilter.hoverInfo?.label || ''}
                dataPointValues={clinicianFilter.hoveredDataPoint as Record<string, number>}
                totalValue={clinicianFilter.hoverInfo?.value || 0}
                onSwap={clinicianFilter.swapClinicianIntoView}
                formatValue={(v) => v.toString()}
                className="right-4 top-20"
              />
            )}
          </div>
        ) : (
          <BarChart
            data={barChartData}
            mode="single"
            maxValue={900}
            goal={{ value: sessionsGoal }}
            getBarColor={(value) =>
              value >= sessionsGoal
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
        subtitle={`What happens to your booked sessions (${periodLabelCapitalized})`}
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
        subtitle={periodLabel}
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
