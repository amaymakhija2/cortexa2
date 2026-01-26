import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Users } from 'lucide-react';
import {
  PageHeader,
  PageContent,
  Grid,
  Section,
  SectionHeader,
  SectionContainer,
  ChartCard,
  DonutChartCard,
  StatCard,
  ToggleButton,
  BarChart,
  LineChart,
  ExpandedChartModal,
  CohortSelector,
} from '../design-system';
import type { HoverInfo } from '../design-system';
import { TimeSelector } from '../design-system/controls/TimeSelector';
import type { RetentionTabProps } from './types';

// =============================================================================
// RETENTION TAB COMPONENT
// =============================================================================
// Two clear sections:
//   1. Track Current Retention - Real-time actionable items
//   2. Cohort Analysis - Historical cohort exploration
// =============================================================================

// Clinician colors for churn chart (teal shades)
const CLINICIAN_SEGMENTS = [
  { key: 'Chen', label: 'S Chen', color: '#0891b2', gradient: 'linear-gradient(180deg, #22d3ee 0%, #0891b2 100%)' },
  { key: 'Rodriguez', label: 'M Rodriguez', color: '#0d9488', gradient: 'linear-gradient(180deg, #2dd4bf 0%, #0d9488 100%)' },
  { key: 'Patel', label: 'A Patel', color: '#0284c7', gradient: 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)' },
  { key: 'Kim', label: 'J Kim', color: '#7c3aed', gradient: 'linear-gradient(180deg, #a78bfa 0%, #7c3aed 100%)' },
  { key: 'Johnson', label: 'M Johnson', color: '#db2777', gradient: 'linear-gradient(180deg, #f472b6 0%, #db2777 100%)' },
];

const CLINICIAN_STACK_ORDER = ['Johnson', 'Kim', 'Patel', 'Rodriguez', 'Chen'];

export const RetentionTab: React.FC<RetentionTabProps> = ({
  cohorts,
  tabs,
  activeTab,
  onTabChange,
  timeSelection,
  onTimeSelectionChange,
  churnByClinicianData,
  churnTimingData,
  retentionFunnelData,
  currentHealthData,
  firstSessionDropoffData,
  benchmarks,
  clientGenderData,
  churnByGenderData,
  clientFrequencyData,
  churnByFrequencyData,
}) => {
  // =========================================================================
  // LOCAL STATE & REFS
  // =========================================================================

  const [selectedCohort, setSelectedCohort] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [showClinicianBreakdown, setShowClinicianBreakdown] = useState(false);
  const [hoveredClinicianBar, setHoveredClinicianBar] = useState<HoverInfo | null>(null);

  // Ref for the data section to scroll into view
  const dataSectionRef = useRef<HTMLDivElement>(null);
  const previousCohort = useRef<string | null>(null);

  // =========================================================================
  // SCROLL INTO VIEW ON COHORT SELECTION
  // =========================================================================

  const handleCohortSelect = useCallback((cohortId: string | null) => {
    const wasNull = previousCohort.current === null;
    previousCohort.current = cohortId;
    setSelectedCohort(cohortId);

    // Scroll when selecting a cohort for the first time (from no selection)
    if (cohortId && wasNull) {
      // Wait for the content to render and animate in
      setTimeout(() => {
        if (dataSectionRef.current) {
          // Find the scrollable parent container
          const scrollableParent = dataSectionRef.current.closest('.overflow-y-auto');
          if (scrollableParent) {
            // Calculate scroll position to show data with some context above
            const containerRect = scrollableParent.getBoundingClientRect();
            const elementRect = dataSectionRef.current.getBoundingClientRect();
            const currentScroll = scrollableParent.scrollTop;

            // Scroll to show the data section with ~80px padding from top
            // This keeps some of the cohort selector visible for context
            const targetScroll = currentScroll + (elementRect.top - containerRect.top) - 80;

            scrollableParent.scrollTo({
              top: targetScroll,
              behavior: 'smooth',
            });
          }
        }
      }, 250); // Delay to let the reveal animation start first
    }
  }, []);

  // =========================================================================
  // COMPUTED VALUES
  // =========================================================================

  const selectedCohortData = useMemo(
    () => cohorts.find((c) => c.id === selectedCohort),
    [cohorts, selectedCohort]
  );

  // Total churn
  const totalChurn = useMemo(
    () => churnByClinicianData.reduce((sum, item) => sum + item.total, 0),
    [churnByClinicianData]
  );

  // Average monthly churn
  const avgMonthlyChurn = useMemo(
    () => churnByClinicianData.length > 0 ? totalChurn / churnByClinicianData.length : 0,
    [totalChurn, churnByClinicianData.length]
  );

  // Highest churn month
  const highestChurnMonth = useMemo(() => {
    if (churnByClinicianData.length === 0) return { month: '-', value: 0 };
    const max = churnByClinicianData.reduce((best, item) =>
      item.total > best.total ? item : best
    );
    return { month: max.month, value: max.total };
  }, [churnByClinicianData]);

  // Bar chart data for single bars (total churn)
  const totalChurnBarData = useMemo(
    () => churnByClinicianData.map((item) => ({
      label: item.month,
      value: item.total,
    })),
    [churnByClinicianData]
  );

  // Bar chart data for stacked bars (by clinician)
  const clinicianChurnBarData = useMemo(
    () => churnByClinicianData.map((item) => ({
      label: item.month,
      Chen: item.Chen,
      Rodriguez: item.Rodriguez,
      Patel: item.Patel,
      Kim: item.Kim,
      Johnson: item.Johnson,
    })),
    [churnByClinicianData]
  );

  // Churn timing totals
  const churnTimingTotals = useMemo(() => {
    const early = churnTimingData.reduce((sum, item) => sum + item.earlyChurn, 0);
    const medium = churnTimingData.reduce((sum, item) => sum + item.mediumChurn, 0);
    const late = churnTimingData.reduce((sum, item) => sum + item.lateChurn, 0);
    return { early, medium, late, total: early + medium + late };
  }, [churnTimingData]);

  // =========================================================================
  // INSIGHTS
  // =========================================================================

  const churnInsights = useMemo(() => [
    {
      value: totalChurn.toString(),
      label: 'Total Churned',
      bgColor: 'bg-rose-50',
      textColor: 'text-rose-600',
    },
    {
      value: avgMonthlyChurn.toFixed(1),
      label: 'Avg/month',
      bgColor: 'bg-stone-100',
      textColor: 'text-stone-700',
    },
    {
      value: highestChurnMonth.month,
      label: `Peak (${highestChurnMonth.value})`,
      bgColor: 'bg-stone-100',
      textColor: 'text-stone-700',
    },
  ], [totalChurn, avgMonthlyChurn, highestChurnMonth]);

  // Line chart data for retention curves
  const sessionsRetentionLineData = useMemo(() => {
    return retentionFunnelData.sessionsFunnel.map((stage) => ({
      label: stage.label,
      practice: stage.percentage,
      industry: (stage as any).industryAvg ?? stage.percentage,
    }));
  }, [retentionFunnelData.sessionsFunnel]);

  const timeRetentionLineData = useMemo(() => {
    return retentionFunnelData.timeFunnel.map((stage) => ({
      label: stage.label,
      practice: stage.percentage,
      industry: (stage as any).industryAvg ?? stage.percentage,
    }));
  }, [retentionFunnelData.timeFunnel]);

  // Retention insights
  const sessionsRetentionInsights = useMemo(() => {
    const finalStage = retentionFunnelData.sessionsFunnel[retentionFunnelData.sessionsFunnel.length - 1];
    const industryFinal = (finalStage as any).industryAvg ?? 28;
    const diff = finalStage.percentage - industryFinal;
    return [
      { value: `${finalStage.percentage}%`, label: 'Final Retention', bgColor: 'bg-amber-50', textColor: 'text-amber-700' },
      { value: `${diff >= 0 ? '+' : ''}${diff}%`, label: 'vs Industry', bgColor: 'bg-stone-100', textColor: 'text-stone-700' },
    ];
  }, [retentionFunnelData.sessionsFunnel]);

  const timeRetentionInsights = useMemo(() => {
    const finalStage = retentionFunnelData.timeFunnel[retentionFunnelData.timeFunnel.length - 1];
    const industryFinal = (finalStage as any).industryAvg ?? 38;
    const diff = finalStage.percentage - industryFinal;
    return [
      { value: `${finalStage.percentage}%`, label: 'Final Retention', bgColor: 'bg-indigo-50', textColor: 'text-indigo-700' },
      { value: `${diff >= 0 ? '+' : ''}${diff}%`, label: 'vs Industry', bgColor: 'bg-stone-100', textColor: 'text-stone-700' },
    ];
  }, [retentionFunnelData.timeFunnel]);

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="min-h-full">
      {/* Page Header */}
      <PageHeader
        accent="rose"
        title="Retention"
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
      {/* Note: Retention tab uses cohort-based analysis rather than time period filtering */}

      <PageContent>
        {/* ================================================================
            SECTION 1: COHORT ANALYSIS
            ================================================================ */}
        <SectionContainer accent="indigo" index={0} isFirst>
          <SectionHeader
            number={1}
            question="Which clients do you want to look at?"
            description="Pick a time period"
            accent="indigo"
            showAccentLine={false}
            compact
          />

          {/* Cohort Selector */}
          <CohortSelector
            cohorts={cohorts.map((c) => ({
              id: c.id,
              label: c.label,
              sublabel: c.sublabel,
              clientCount: c.clientCount,
              maturity: c.maturity,
              availableDate: c.availableDate,
              recommended: c.recommended,
            }))}
            selectedCohort={selectedCohort}
            onSelect={handleCohortSelect}
            title=""
            subtitle=""
          />
        </SectionContainer>

        {/* Only show data sections if a cohort is selected */}
        {selectedCohort && selectedCohortData && (
          <div
            ref={dataSectionRef}
            style={{
              animation: 'cohortReveal 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
            }}
          >
            {/* ================================================================
                COHORT SUMMARY - HERO STATS WITH BENCHMARKS
                ================================================================ */}
            {selectedCohortData.summary && (
              <Section spacing="lg">
                <Grid cols={4} gap="lg">
                  <StatCard
                    title="Clients Acquired"
                    value={selectedCohortData.summary.clientsAcquired.toLocaleString()}
                    subtitle={
                      selectedCohort === 'all-time' ? 'since you opened' :
                      selectedCohort === 'this-year' ? 'in 2025' :
                      selectedCohort === 'last-year' ? 'in 2024' : ''
                    }
                  />
                  <StatCard
                    title="Clients Churned"
                    value={selectedCohortData.summary.clientsChurned.toLocaleString()}
                    subtitle={`${((selectedCohortData.summary.clientsChurned / selectedCohortData.summary.clientsAcquired) * 100).toFixed(0)}% of cohort`}
                    variant="negative"
                  />
                  <StatCard
                    title="Active Clients"
                    value={selectedCohortData.summary.activeClients.toLocaleString()}
                    subtitle={`${((selectedCohortData.summary.activeClients / selectedCohortData.summary.clientsAcquired) * 100).toFixed(0)}% still active`}
                    variant="positive"
                  />
                  <StatCard
                    title="Avg Sessions Completed"
                    value={selectedCohortData.summary.avgSessionsPerClient.toFixed(1)}
                    subtitle="sessions per client"
                  />
                </Grid>
              </Section>
            )}

            {/* ================================================================
                SECTION: CHURN PATTERNS
                ================================================================ */}
            <SectionContainer accent="rose" index={1}>
              <SectionHeader
                number={1}
                question="When do clients leave?"
                description="Monthly churn trends and timing breakdown"
                accent="rose"
                showAccentLine={false}
                compact
              />
              <Grid cols={2} gap="lg">
                {/* Clients Churned - Bar Chart with Clinician Toggle */}
                <ChartCard
                  title="Clients Churned"
                  subtitle="Monthly churn breakdown"
                  headerControls={
                    <>
                      <ToggleButton
                        label="By Clinician"
                        active={showClinicianBreakdown}
                        onToggle={() => setShowClinicianBreakdown(!showClinicianBreakdown)}
                        icon={<Users size={16} />}
                        hidden={!!hoveredClinicianBar}
                      />
                      {hoveredClinicianBar && (
                        <div
                          className="flex items-center gap-3 px-4 py-2 rounded-xl"
                          style={{ backgroundColor: `${hoveredClinicianBar.color}15` }}
                        >
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: hoveredClinicianBar.color }}
                          />
                          <span className="text-stone-700 font-semibold">
                            {hoveredClinicianBar.segmentLabel}
                          </span>
                          <span
                            className="font-bold"
                            style={{ color: hoveredClinicianBar.color }}
                          >
                            {hoveredClinicianBar.value}
                          </span>
                          <span className="text-stone-500 text-sm">
                            in {hoveredClinicianBar.label}
                          </span>
                        </div>
                      )}
{/* Report button hidden for now
                      <ActionButton
                        label="Retention Report"
                        icon={<ArrowRight size={16} />}
                      />
*/}
                    </>
                  }
                  expandable
                  onExpand={() => setExpandedCard('churn-by-clinician')}
                  insights={churnInsights}
                  minHeight="520px"
                >
                  {showClinicianBreakdown ? (
                    <BarChart
                      data={clinicianChurnBarData}
                      mode="stacked"
                      segments={CLINICIAN_SEGMENTS}
                      stackOrder={CLINICIAN_STACK_ORDER}
                      maxValue={15}
                      formatValue={(v) => v.toString()}
                      onHover={setHoveredClinicianBar}
                      showLegend
                      legendPosition="top-right"
                      height="380px"
                    />
                  ) : (
                    <BarChart
                      data={totalChurnBarData}
                      mode="single"
                      maxValue={15}
                      getBarColor={() => ({
                        gradient: 'linear-gradient(180deg, #fb7185 0%, #e11d48 100%)',
                        shadow: '0 4px 12px -2px rgba(225, 29, 72, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
                        textColor: 'text-rose-600',
                      })}
                      formatValue={(v) => v.toString()}
                      height="380px"
                    />
                  )}
                </ChartCard>

                {/* Churn Timing - Donut Chart */}
                <DonutChartCard
                  title="Churn Timing"
                  subtitle="When clients leave by session count"
                  segments={[
                    { label: 'Early (<5 sessions)', value: churnTimingTotals.early, color: '#ef4444' },
                    { label: 'Medium (5-15)', value: churnTimingTotals.medium, color: '#f59e0b' },
                    { label: 'Late (>15)', value: churnTimingTotals.late, color: '#10b981' },
                  ]}
                  centerLabel="Total Churned"
                  centerValue={churnTimingTotals.total.toString()}
                  valueFormat="number"
                  size="md"
                  expandable
                  onExpand={() => setExpandedCard('churn-timing')}
                />
              </Grid>
            </SectionContainer>

            {/* ================================================================
                SECTION: RETURN RATE
                ================================================================ */}
            <SectionContainer accent="amber" index={2} isLast>
              <SectionHeader
                number={2}
                question="How far do clients get?"
                description="Session milestones and time-based return rates"
                accent="amber"
                showAccentLine={false}
                compact
              />

              {/* Both return rate curves side by side */}
              <Grid cols={2} gap="lg">
                <ChartCard
                  title="Return Rate by Session"
                  subtitle={`% of clients still active at each session milestone`}
                  legend={[
                    { label: 'Your Practice', color: '#f59e0b', type: 'line' },
                    { label: 'Industry Avg', color: '#a8a29e', type: 'line' },
                  ]}
                  expandable
                  onExpand={() => setExpandedCard('sessions-funnel')}
                  insights={sessionsRetentionInsights}
                  minHeight="520px"
                >
                  <LineChart
                    data={sessionsRetentionLineData}
                    xAxisKey="label"
                    lines={[
                      { dataKey: 'practice', color: '#f59e0b', name: 'Your Practice' },
                      { dataKey: 'industry', color: '#a8a29e', name: 'Industry Avg' },
                    ]}
                    yDomain={[0, 100]}
                    yTickFormatter={(v) => `${v}%`}
                    tooltipFormatter={(value, name) => [`${value}%`, name]}
                    height="100%"
                  />
                </ChartCard>
                <ChartCard
                  title="Return Rate by Time"
                  subtitle={`% of clients still active at each time milestone`}
                  legend={[
                    { label: 'Your Practice', color: '#6366f1', type: 'line' },
                    { label: 'Industry Avg', color: '#a8a29e', type: 'line' },
                  ]}
                  expandable
                  onExpand={() => setExpandedCard('time-funnel')}
                  insights={timeRetentionInsights}
                  minHeight="520px"
                >
                  <LineChart
                    data={timeRetentionLineData}
                    xAxisKey="label"
                    lines={[
                      { dataKey: 'practice', color: '#6366f1', name: 'Your Practice' },
                      { dataKey: 'industry', color: '#a8a29e', name: 'Industry Avg' },
                    ]}
                    yDomain={[0, 100]}
                    yTickFormatter={(v) => `${v}%`}
                    tooltipFormatter={(value, name) => [`${value}%`, name]}
                    height="100%"
                  />
                </ChartCard>
              </Grid>
            </SectionContainer>
          </div>
        )}
      </PageContent>

      {/* =====================================================================
          EXPANDED MODALS
          ===================================================================== */}

      {/* Churn by Clinician Expanded */}
      <ExpandedChartModal
        isOpen={expandedCard === 'churn-by-clinician'}
        onClose={() => setExpandedCard(null)}
        title="Clients Churned"
        subtitle="Monthly churn breakdown"
        headerControls={
          <>
            <ToggleButton
              label="By Clinician"
              active={showClinicianBreakdown}
              onToggle={() => setShowClinicianBreakdown(!showClinicianBreakdown)}
              icon={<Users size={16} />}
            />
{/* Report button hidden for now
            <ActionButton label="Retention Report" icon={<ArrowRight size={16} />} />
*/}
          </>
        }
        insights={churnInsights}
      >
        {showClinicianBreakdown ? (
          <BarChart
            data={clinicianChurnBarData}
            mode="stacked"
            size="lg"
            segments={CLINICIAN_SEGMENTS}
            stackOrder={CLINICIAN_STACK_ORDER}
            maxValue={15}
            formatValue={(v) => v.toString()}
            onHover={setHoveredClinicianBar}
            showLegend
            legendPosition="top-right"
            height="100%"
          />
        ) : (
          <BarChart
            data={totalChurnBarData}
            mode="single"
            size="lg"
            maxValue={15}
            getBarColor={() => ({
              gradient: 'linear-gradient(180deg, #fb7185 0%, #e11d48 100%)',
              shadow: '0 4px 12px -2px rgba(225, 29, 72, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
              textColor: 'text-rose-600',
            })}
            formatValue={(v) => v.toString()}
            height="100%"
          />
        )}
      </ExpandedChartModal>

      {/* Return Rate by Session Expanded */}
      <ExpandedChartModal
        isOpen={expandedCard === 'sessions-funnel'}
        onClose={() => setExpandedCard(null)}
        title="Return Rate by Session"
        subtitle="% of clients still active at each session milestone"
        legend={[
          { label: 'Your Practice', color: '#f59e0b', type: 'line' },
          { label: 'Industry Avg', color: '#a8a29e', type: 'line' },
        ]}
        insights={sessionsRetentionInsights}
      >
        <LineChart
          data={sessionsRetentionLineData}
          xAxisKey="label"
          lines={[
            { dataKey: 'practice', color: '#f59e0b', name: 'Your Practice' },
            { dataKey: 'industry', color: '#a8a29e', name: 'Industry Avg' },
          ]}
          yDomain={[0, 100]}
          yTickFormatter={(v) => `${v}%`}
          tooltipFormatter={(value, name) => [`${value}%`, name]}
          height="100%"
        />
      </ExpandedChartModal>

      {/* Return Rate by Time Expanded */}
      <ExpandedChartModal
        isOpen={expandedCard === 'time-funnel'}
        onClose={() => setExpandedCard(null)}
        title="Return Rate by Time"
        subtitle="% of clients still active at each time milestone"
        legend={[
          { label: 'Your Practice', color: '#6366f1', type: 'line' },
          { label: 'Industry Avg', color: '#a8a29e', type: 'line' },
        ]}
        insights={timeRetentionInsights}
      >
        <LineChart
          data={timeRetentionLineData}
          xAxisKey="label"
          lines={[
            { dataKey: 'practice', color: '#6366f1', name: 'Your Practice' },
            { dataKey: 'industry', color: '#a8a29e', name: 'Industry Avg' },
          ]}
          yDomain={[0, 100]}
          yTickFormatter={(v) => `${v}%`}
          tooltipFormatter={(value, name) => [`${value}%`, name]}
          height="100%"
        />
      </ExpandedChartModal>

      {/* Churn Timing Expanded */}
      <ExpandedChartModal
        isOpen={expandedCard === 'churn-timing'}
        onClose={() => setExpandedCard(null)}
        title="Churn Timing"
        subtitle="When clients leave by session count"
      >
        <DonutChartCard
          title=""
          segments={[
            { label: 'Early (<5 sessions)', value: churnTimingTotals.early, color: '#ef4444' },
            { label: 'Medium (5-15)', value: churnTimingTotals.medium, color: '#f59e0b' },
            { label: 'Late (>15)', value: churnTimingTotals.late, color: '#10b981' },
          ]}
          centerLabel="Total Churned"
          centerValue={churnTimingTotals.total.toString()}
          valueFormat="number"
          size="lg"
        />
      </ExpandedChartModal>

    </div>
  );
};

export default RetentionTab;
