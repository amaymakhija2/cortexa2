import React, { useState, useMemo } from 'react';
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
  ExpandedChartModal,
  RetentionFunnelCard,
  CohortSelector,
} from '../design-system';
import type { HoverInfo } from '../design-system';
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
  // LOCAL STATE
  // =========================================================================

  const [selectedCohort, setSelectedCohort] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [showClinicianBreakdown, setShowClinicianBreakdown] = useState(false);
  const [hoveredClinicianBar, setHoveredClinicianBar] = useState<HoverInfo | null>(null);

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
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
    {
      value: highestChurnMonth.month,
      label: `Peak (${highestChurnMonth.value})`,
      bgColor: 'bg-stone-100',
      textColor: 'text-stone-700',
    },
  ], [totalChurn, avgMonthlyChurn, highestChurnMonth]);

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="min-h-full">
      {/* Page Header */}
      <PageHeader
        accent="rose"
        label="Detailed Analysis"
        title="Retention"
        subtitle="Understand how clients progress through their journey with your practice"
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
            onSelect={setSelectedCohort}
            title=""
            subtitle=""
          />
        </SectionContainer>

        {/* Only show data sections if a cohort is selected */}
        {selectedCohort && selectedCohortData && (
          <>
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
                    value={`${selectedCohortData.summary.avgSessionsPerClient.toFixed(1)}`}
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
                SECTION: RETENTION JOURNEY
                ================================================================ */}
            <SectionContainer accent="amber" index={2} isLast>
              <SectionHeader
                number={2}
                question="How far do clients get?"
                description="Session milestones and time-based retention"
                accent="amber"
                showAccentLine={false}
                compact
              />

              {/* Both funnels side by side */}
              <Grid cols={2} gap="lg">
                <RetentionFunnelCard
                  stages={retentionFunnelData.sessionsFunnel}
                  title="Retention by Sessions"
                  subtitle={`${selectedCohortData.clientCount.toLocaleString()} clients (${selectedCohortData.label})`}
                  variant="sessions"
                  expandable
                  onExpand={() => setExpandedCard('sessions-funnel')}
                  insights={[
                    { value: retentionFunnelData.sessionsFunnel[0]?.count || 0, label: 'Started', bgColor: 'bg-amber-50', textColor: 'text-amber-700' },
                    { value: `${retentionFunnelData.sessionsFunnel[retentionFunnelData.sessionsFunnel.length - 1]?.percentage || 0}%`, label: 'Final Retention', bgColor: 'bg-amber-50', textColor: 'text-amber-700' },
                    { value: `${100 - (retentionFunnelData.sessionsFunnel[retentionFunnelData.sessionsFunnel.length - 1]?.percentage || 0)}%`, label: 'Drop-off', bgColor: 'bg-stone-100', textColor: 'text-stone-700' },
                  ]}
                />
                <RetentionFunnelCard
                  stages={retentionFunnelData.timeFunnel}
                  title="Retention by Time"
                  subtitle={`${selectedCohortData.clientCount.toLocaleString()} clients (${selectedCohortData.label})`}
                  variant="time"
                  expandable
                  onExpand={() => setExpandedCard('time-funnel')}
                  insights={[
                    { value: retentionFunnelData.timeFunnel[0]?.count || 0, label: 'Started', bgColor: 'bg-indigo-50', textColor: 'text-indigo-700' },
                    { value: `${retentionFunnelData.timeFunnel[retentionFunnelData.timeFunnel.length - 1]?.percentage || 0}%`, label: 'Final Retention', bgColor: 'bg-indigo-50', textColor: 'text-indigo-700' },
                    { value: `${100 - (retentionFunnelData.timeFunnel[retentionFunnelData.timeFunnel.length - 1]?.percentage || 0)}%`, label: 'Drop-off', bgColor: 'bg-stone-100', textColor: 'text-stone-700' },
                  ]}
                />
              </Grid>
            </SectionContainer>
          </>
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

      {/* Sessions Funnel Expanded */}
      <ExpandedChartModal
        isOpen={expandedCard === 'sessions-funnel'}
        onClose={() => setExpandedCard(null)}
        title="Retention by Sessions"
        subtitle="Client milestones reached"
      >
        <RetentionFunnelCard
          stages={retentionFunnelData.sessionsFunnel}
          title=""
          subtitle=""
          variant="sessions"
          size="lg"
          insights={[
            { value: retentionFunnelData.sessionsFunnel[0]?.count || 0, label: 'Started', bgColor: 'bg-amber-50', textColor: 'text-amber-700' },
            { value: `${retentionFunnelData.sessionsFunnel[retentionFunnelData.sessionsFunnel.length - 1]?.percentage || 0}%`, label: 'Final Retention', bgColor: 'bg-amber-50', textColor: 'text-amber-700' },
            { value: `${100 - (retentionFunnelData.sessionsFunnel[retentionFunnelData.sessionsFunnel.length - 1]?.percentage || 0)}%`, label: 'Drop-off', bgColor: 'bg-stone-100', textColor: 'text-stone-700' },
          ]}
        />
      </ExpandedChartModal>

      {/* Time Funnel Expanded */}
      <ExpandedChartModal
        isOpen={expandedCard === 'time-funnel'}
        onClose={() => setExpandedCard(null)}
        title="Retention by Time"
        subtitle="Duration with practice"
      >
        <RetentionFunnelCard
          stages={retentionFunnelData.timeFunnel}
          title=""
          subtitle=""
          variant="time"
          size="lg"
          insights={[
            { value: retentionFunnelData.timeFunnel[0]?.count || 0, label: 'Started', bgColor: 'bg-indigo-50', textColor: 'text-indigo-700' },
            { value: `${retentionFunnelData.timeFunnel[retentionFunnelData.timeFunnel.length - 1]?.percentage || 0}%`, label: 'Final Retention', bgColor: 'bg-indigo-50', textColor: 'text-indigo-700' },
            { value: `${100 - (retentionFunnelData.timeFunnel[retentionFunnelData.timeFunnel.length - 1]?.percentage || 0)}%`, label: 'Drop-off', bgColor: 'bg-stone-100', textColor: 'text-stone-700' },
          ]}
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
