import React, { useState, useMemo } from 'react';
import { ArrowRight, Users } from 'lucide-react';
import {
  PageHeader,
  PageContent,
  Grid,
  Section,
  StatCard,
  ChartCard,
  SimpleChartCard,
  DonutChartCard,
  ActionButton,
  ToggleButton,
  BarChart,
  LineChart,
  ExpandedChartModal,
  RetentionFunnelCard,
} from '../design-system';
import type { HoverInfo } from '../design-system';
import type { RetentionTabProps } from './types';

// =============================================================================
// RETENTION TAB COMPONENT
// =============================================================================

// Clinician colors for churn chart (teal shades)
const CLINICIAN_SEGMENTS = [
  { key: 'Chen', label: 'Chen', color: '#0891b2', gradient: 'linear-gradient(180deg, #22d3ee 0%, #0891b2 100%)' },
  { key: 'Rodriguez', label: 'Rodriguez', color: '#0d9488', gradient: 'linear-gradient(180deg, #2dd4bf 0%, #0d9488 100%)' },
  { key: 'Patel', label: 'Patel', color: '#0284c7', gradient: 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)' },
  { key: 'Kim', label: 'Kim', color: '#7c3aed', gradient: 'linear-gradient(180deg, #a78bfa 0%, #7c3aed 100%)' },
  { key: 'Johnson', label: 'Johnson', color: '#db2777', gradient: 'linear-gradient(180deg, #f472b6 0%, #db2777 100%)' },
];

const CLINICIAN_STACK_ORDER = ['Johnson', 'Kim', 'Patel', 'Rodriguez', 'Chen'];

export const RetentionTab: React.FC<RetentionTabProps> = ({
  timePeriod,
  onTimePeriodChange,
  timePeriods,
  tabs,
  activeTab,
  onTabChange,
  getDateRangeLabel,
  churnByClinicianData,
  churnTimingData,
  clientGrowthData,
  retentionMetrics,
  retentionFunnelData,
}) => {
  // =========================================================================
  // LOCAL STATE
  // =========================================================================

  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [showClinicianBreakdown, setShowClinicianBreakdown] = useState(false);
  const [hoveredClinicianBar, setHoveredClinicianBar] = useState<HoverInfo | null>(null);

  // =========================================================================
  // COMPUTED VALUES
  // =========================================================================

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

  // Average rebook rate
  const avgRebookRate = useMemo(() => {
    if (clientGrowthData.length === 0) return 0;
    const totalRate = clientGrowthData.reduce(
      (sum, item) => sum + (item.withNextAppt / item.activeClients),
      0
    );
    return (totalRate / clientGrowthData.length) * 100;
  }, [clientGrowthData]);

  // Rebook rate chart data
  const rebookRateChartData = useMemo(
    () => clientGrowthData.map((item) => ({
      month: item.month,
      rate: parseFloat(((item.withNextAppt / item.activeClients) * 100).toFixed(1)),
    })),
    [clientGrowthData]
  );

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
      <PageHeader
        accent="rose"
        label="Detailed Analysis"
        title="Retention"
        subtitle={getDateRangeLabel()}
        showTimePeriod
        timePeriod={timePeriod as any}
        timePeriods={timePeriods as any}
        onTimePeriodChange={onTimePeriodChange as any}
        tabs={tabs.map((t) => ({ id: t.id, label: t.shortLabel }))}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />

      <PageContent>
        {/* Hero Stats Row */}
        <Section spacing="md">
          <Grid cols={4} gap="md">
            <StatCard
              title="Avg Client Tenure"
              value={`${retentionMetrics.avgTenureMonths.toFixed(1)} months`}
              subtitle={`across ${retentionMetrics.totalDischargedClients} discharged clients`}
            />
            <StatCard
              title="Avg Sessions per Client"
              value={retentionMetrics.avgSessionsPerClient.toFixed(1)}
              subtitle="before discharge"
            />
            <StatCard
              title="Session 5 Retention"
              value={`${retentionMetrics.session5RetentionRate.toFixed(0)}%`}
              subtitle="of new clients reach session 5"
            />
            <StatCard
              title="3-Month Retention"
              value={`${retentionMetrics.threeMonthRetentionRate.toFixed(0)}%`}
              subtitle="of new clients stay 3+ months"
            />
          </Grid>
        </Section>

        {/* Retention Funnel Visualizations */}
        <Section spacing="md">
          <Grid cols={2} gap="lg">
            <RetentionFunnelCard
              stages={retentionFunnelData.sessionsFunnel}
              title="Retention by Sessions"
              subtitle="Client milestones reached"
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
              subtitle="Duration with practice"
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
        </Section>

        {/* Main Charts Row */}
        <Section spacing="md">
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
                  {/* Hover tooltip for clinician segment */}
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
                  <ActionButton
                    label="Retention Report"
                    icon={<ArrowRight size={16} />}
                  />
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
        </Section>

        {/* Rebook Rate */}
        <Section spacing="md">
          <Grid cols={2} gap="lg">
            <SimpleChartCard
              title="Rebook Rate"
              subtitle="% of clients with next appointment scheduled"
              valueIndicator={{
                value: `${avgRebookRate.toFixed(1)}%`,
                label: 'Average',
                bgColor: 'bg-emerald-50',
                textColor: 'text-emerald-600',
              }}
              height="320px"
              expandable
              onExpand={() => setExpandedCard('rebook-rate')}
            >
              <LineChart
                data={rebookRateChartData}
                xAxisKey="month"
                lines={[{ dataKey: 'rate', color: '#10b981', activeColor: '#059669' }]}
                yDomain={[80, 100]}
                yTickFormatter={(v) => `${v}%`}
                tooltipFormatter={(value: number) => [`${value.toFixed(1)}%`, 'Rebook Rate']}
                showAreaFill
              />
            </SimpleChartCard>
          </Grid>
        </Section>
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
            <ActionButton label="Retention Report" icon={<ArrowRight size={16} />} />
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

      {/* Rebook Rate Expanded */}
      <ExpandedChartModal
        isOpen={expandedCard === 'rebook-rate'}
        onClose={() => setExpandedCard(null)}
        title="Rebook Rate"
        subtitle="% of clients with next appointment scheduled"
      >
        <LineChart
          data={rebookRateChartData}
          xAxisKey="month"
          lines={[{ dataKey: 'rate', color: '#10b981', activeColor: '#059669' }]}
          yDomain={[80, 100]}
          yTickFormatter={(v) => `${v}%`}
          tooltipFormatter={(value: number) => [`${value.toFixed(1)}%`, 'Rebook Rate']}
          showAreaFill
          height="100%"
        />
      </ExpandedChartModal>
    </div>
  );
};

export default RetentionTab;
