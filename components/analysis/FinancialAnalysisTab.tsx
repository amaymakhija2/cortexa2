import React, { useState, useMemo } from 'react';
import { Users, ArrowRight } from 'lucide-react';
import {
  PageHeader,
  PageContent,
  Grid,
  Section,
  StatCard,
  ChartCard,
  SimpleChartCard,
  DonutChartCard,
  DataTableCard,
  ToggleButton,
  GoalIndicator,
  ActionButton,
  BarChart,
  LineChart,
  ExpandedChartModal,
  AnimatedGrid,
  AnimatedSection,
  ExecutiveSummary,
} from '../design-system';
import type { HoverInfo } from '../design-system';
import type { FinancialAnalysisTabProps } from './types';

// =============================================================================
// FINANCIAL ANALYSIS TAB
// =============================================================================
// Displays financial metrics including revenue performance, distribution,
// and detailed breakdown. Uses design system components throughout.
// =============================================================================

// Clinician segment configuration for BarChart
const CLINICIAN_SEGMENTS = [
  { key: 'Chen', label: 'Chen', color: '#7c3aed', gradient: 'linear-gradient(180deg, #a78bfa 0%, #7c3aed 100%)' },
  { key: 'Rodriguez', label: 'Rodriguez', color: '#0891b2', gradient: 'linear-gradient(180deg, #22d3ee 0%, #0891b2 100%)' },
  { key: 'Patel', label: 'Patel', color: '#d97706', gradient: 'linear-gradient(180deg, #fbbf24 0%, #d97706 100%)' },
  { key: 'Kim', label: 'Kim', color: '#db2777', gradient: 'linear-gradient(180deg, #f472b6 0%, #db2777 100%)' },
  { key: 'Johnson', label: 'Johnson', color: '#059669', gradient: 'linear-gradient(180deg, #34d399 0%, #059669 100%)' },
];

// Order for stacking (bottom to top)
const CLINICIAN_STACK_ORDER = ['Johnson', 'Kim', 'Patel', 'Rodriguez', 'Chen'];

const CLINICIAN_NAMES = ['Chen', 'Rodriguez', 'Patel', 'Kim', 'Johnson'] as const;

export const FinancialAnalysisTab: React.FC<FinancialAnalysisTabProps> = ({
  timePeriod,
  onTimePeriodChange,
  timePeriods,
  tabs,
  activeTab,
  onTabChange,
  getDateRangeLabel,
  revenueData,
  revenueBreakdownData,
  clinicianRevenueData,
  cohortLTVData,
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

  // Total gross revenue
  const totalGrossRevenue = useMemo(
    () => revenueData.reduce((sum, item) => sum + item.value, 0),
    [revenueData]
  );

  // Total net revenue
  const totalNetRevenue = useMemo(
    () => revenueBreakdownData.reduce((sum, item) => sum + item.netRevenue, 0),
    [revenueBreakdownData]
  );

  // Total costs breakdown
  const totalClinicianCosts = useMemo(
    () => revenueBreakdownData.reduce((sum, item) => sum + item.clinicianCosts, 0),
    [revenueBreakdownData]
  );

  const totalSupervisorCosts = useMemo(
    () => revenueBreakdownData.reduce((sum, item) => sum + item.supervisorCosts, 0),
    [revenueBreakdownData]
  );

  const totalCCFees = useMemo(
    () => revenueBreakdownData.reduce((sum, item) => sum + item.creditCardFees, 0),
    [revenueBreakdownData]
  );

  // Average margin percentage
  const avgMargin = useMemo(() => {
    const totalGross = revenueBreakdownData.reduce((sum, item) => sum + item.grossRevenue, 0);
    return totalGross > 0 ? (totalNetRevenue / totalGross) * 100 : 0;
  }, [revenueBreakdownData, totalNetRevenue]);

  // Months that hit the $150k goal
  const monthsAtGoal = useMemo(
    () => revenueData.filter((item) => item.value >= 150000).length,
    [revenueData]
  );

  // Average monthly revenue
  const avgMonthlyRevenue = useMemo(
    () => (revenueData.length > 0 ? totalGrossRevenue / revenueData.length : 0),
    [totalGrossRevenue, revenueData.length]
  );

  // Average weekly revenue
  const avgWeeklyRevenue = useMemo(
    () => avgMonthlyRevenue / 4.33,
    [avgMonthlyRevenue]
  );

  // Best month
  const bestMonth = useMemo(() => {
    if (revenueData.length === 0) return { month: '-', value: 0 };
    const max = revenueData.reduce((best, item) =>
      item.value > best.value ? item : best
    );
    return max;
  }, [revenueData]);

  // Month-over-month change
  const momChange = useMemo(() => {
    if (revenueData.length < 2) return 0;
    const lastMonth = revenueData[revenueData.length - 1].value;
    const prevMonth = revenueData[revenueData.length - 2].value;
    return prevMonth > 0 ? ((lastMonth - prevMonth) / prevMonth) * 100 : 0;
  }, [revenueData]);

  // Revenue range
  const revenueRange = useMemo(() => {
    if (revenueData.length === 0) return { min: 0, max: 0 };
    const values = revenueData.map((item) => item.value);
    return { min: Math.min(...values), max: Math.max(...values) };
  }, [revenueData]);

  // Net revenue margin data for line chart
  const marginChartData = useMemo(() => {
    return revenueBreakdownData.map((item) => ({
      month: item.month,
      margin: item.grossRevenue > 0 ? (item.netRevenue / item.grossRevenue) * 100 : 0,
    }));
  }, [revenueBreakdownData]);

  // Cost percentage data for line chart (clinician + supervisor as % of gross)
  const costPercentageData = useMemo(() => {
    return revenueBreakdownData.map((item) => ({
      month: item.month,
      clinicianPct: item.grossRevenue > 0 ? (item.clinicianCosts / item.grossRevenue) * 100 : 0,
      supervisorPct: item.grossRevenue > 0 ? (item.supervisorCosts / item.grossRevenue) * 100 : 0,
    }));
  }, [revenueBreakdownData]);

  // LTV chart data formatted for LineChart
  // Only include data points where current year has data (to avoid null rendering issues)
  const ltvChartData = useMemo(() => {
    if (!cohortLTVData) return [];
    return cohortLTVData.data
      .filter((item) => item.currentYear !== null)
      .map((item) => ({
        month: `M${item.month}`,
        currentYear: item.currentYear,
        priorYear: item.priorYear,
      }));
  }, [cohortLTVData]);

  // Average cost percentages for indicators
  const avgClinicianPct = useMemo(() => {
    return totalGrossRevenue > 0 ? (totalClinicianCosts / totalGrossRevenue) * 100 : 0;
  }, [totalClinicianCosts, totalGrossRevenue]);

  const avgSupervisorPct = useMemo(() => {
    return totalGrossRevenue > 0 ? (totalSupervisorCosts / totalGrossRevenue) * 100 : 0;
  }, [totalSupervisorCosts, totalGrossRevenue]);

  // =========================================================================
  // FORMATTERS
  // =========================================================================

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    return `$${(value / 1000).toFixed(0)}k`;
  };

  const formatCurrencyShort = (value: number) => {
    return `$${(value / 1000).toFixed(0)}k`;
  };

  // =========================================================================
  // CHART DATA (formatted for BarChart component)
  // =========================================================================

  // Prepare bar chart data for single mode (BarChart expects 'label' key)
  const barChartData = useMemo(() => {
    return revenueData.map((item) => ({
      label: item.month,
      value: item.value,
    }));
  }, [revenueData]);

  // Prepare stacked bar chart data for clinician breakdown
  const clinicianBarChartData = useMemo(() => {
    return clinicianRevenueData.map((item) => ({
      label: item.month,
      Chen: item.Chen,
      Rodriguez: item.Rodriguez,
      Patel: item.Patel,
      Kim: item.Kim,
      Johnson: item.Johnson,
    }));
  }, [clinicianRevenueData]);

  // =========================================================================
  // INSIGHTS
  // =========================================================================

  const revenueInsights = useMemo(() => [
    {
      value: bestMonth.month,
      label: `Best (${formatCurrencyShort(bestMonth.value)})`,
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
      value: `${formatCurrencyShort(revenueRange.min)}–${formatCurrencyShort(revenueRange.max)}`,
      label: 'Range',
      bgColor: 'bg-stone-100',
      textColor: 'text-stone-700',
    },
  ], [bestMonth, momChange, revenueRange]);

  const clinicianInsights = useMemo(() => {
    // Find top clinician by total revenue
    const clinicianTotals = CLINICIAN_NAMES.map((name) => ({
      name,
      total: clinicianRevenueData.reduce((sum, item) => sum + item[name], 0),
    }));
    const topClinician = clinicianTotals.reduce((best, curr) =>
      curr.total > best.total ? curr : best
    );

    return [
      {
        value: topClinician.name,
        label: `Top (${formatCurrencyShort(topClinician.total)})`,
        bgColor: 'bg-violet-50',
        textColor: 'text-violet-600',
      },
      {
        value: formatCurrencyShort(totalGrossRevenue),
        label: 'Team Total',
        bgColor: 'bg-indigo-50',
        textColor: 'text-indigo-600',
      },
      {
        value: '5',
        label: 'Clinicians',
        bgColor: 'bg-stone-100',
        textColor: 'text-stone-700',
      },
    ];
  }, [clinicianRevenueData, totalGrossRevenue]);

  // =========================================================================
  // TABLE DATA
  // =========================================================================

  const buildTableColumns = () => {
    const monthColumns = revenueBreakdownData.map((item) => ({
      key: item.month.toLowerCase(),
      header: item.month,
      align: 'right' as const,
    }));
    return [...monthColumns, { key: 'total', header: 'Total', align: 'right' as const, isTotals: true }];
  };

  const buildTableRows = () => {
    const buildRowValues = (field: keyof typeof revenueBreakdownData[0]) => {
      const values: Record<string, string> = {};
      let total = 0;
      revenueBreakdownData.forEach((item) => {
        const val = item[field] as number;
        values[item.month.toLowerCase()] = formatCurrencyShort(val);
        total += val;
      });
      values.total = formatCurrency(total);
      return values;
    };

    return [
      {
        id: 'gross',
        label: 'Gross Revenue',
        values: buildRowValues('grossRevenue'),
      },
      {
        id: 'clinician',
        label: 'Clinician Cost',
        indicator: { color: '#3b82f6' },
        values: buildRowValues('clinicianCosts'),
        valueColor: 'text-blue-600',
      },
      {
        id: 'supervisor',
        label: 'Supervisor Cost',
        indicator: { color: '#f59e0b' },
        values: buildRowValues('supervisorCosts'),
        valueColor: 'text-amber-600',
      },
      {
        id: 'fees',
        label: 'Credit Card Fees',
        indicator: { color: '#f43f5e' },
        values: buildRowValues('creditCardFees'),
        valueColor: 'text-rose-600',
      },
      {
        id: 'net',
        label: 'Net Revenue',
        indicator: { color: '#10b981' },
        values: buildRowValues('netRevenue'),
        valueColor: 'text-emerald-600',
        isHighlighted: true,
        highlightColor: 'emerald' as const,
      },
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
        title="Financial Performance"
        subtitle={getDateRangeLabel()}
        showTimePeriod
        timePeriod={timePeriod as any}
        onTimePeriodChange={onTimePeriodChange as any}
        timePeriods={timePeriods as any}
        tabs={tabs.map((t) => ({ id: t.id, label: t.shortLabel }))}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />

      <PageContent>
        {/* Executive Summary */}
        <Section spacing="md">
          <ExecutiveSummary
            summary="Placeholder summary text. Revenue is **up XX%** this month, exceeding the **$XXXk target** for the Xth consecutive month. However, **net margins are at XX%**, slightly below the industry average of XX%. Your top performer generated **$XXk** this period. Consider reviewing **clinician compensation costs** which represent XX% of gross revenue."
            accent="amber"
          />
        </Section>

        {/* Hero Stats Row */}
        <Section spacing="md">
          <AnimatedGrid cols={4} gap="md" staggerDelay={60}>
            <StatCard
              title="Total Gross Revenue"
              value={formatCurrency(totalGrossRevenue)}
              subtitle={`across ${revenueData.length} months`}
            />
            <StatCard
              title="Total Net Revenue"
              value={formatCurrency(totalNetRevenue)}
              subtitle={`${avgMargin.toFixed(1)}% avg margin`}
            />
            <StatCard
              title="Goal Achievement"
              value={`${monthsAtGoal}/${revenueData.length}`}
              subtitle="months hit $150k goal"
            />
            <StatCard
              title="Avg Revenue"
              value={`${formatCurrencyShort(avgMonthlyRevenue)}/mo`}
              subtitle={`${formatCurrencyShort(avgWeeklyRevenue)}/week`}
            />
          </AnimatedGrid>
        </Section>

        {/* Charts Row */}
        <AnimatedSection delay={280}>
          <Section spacing="md">
            <Grid cols={2} gap="lg">
            {/* Revenue Performance Chart */}
            <ChartCard
              title="Revenue Performance"
              subtitle="Monthly breakdown"
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
                    value="$150k"
                    label="Goal"
                    color="amber"
                    hidden={showClinicianBreakdown || !!hoveredClinicianBar}
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
                        {formatCurrencyShort(hoveredClinicianBar.value)}
                      </span>
                      <span className="text-stone-500 text-sm">
                        in {hoveredClinicianBar.label}
                      </span>
                    </div>
                  )}
                  <ActionButton
                    label="Revenue Report"
                    icon={<ArrowRight size={16} />}
                  />
                </>
              }
              expandable
              onExpand={() => setExpandedCard('revenue-performance')}
              insights={showClinicianBreakdown ? clinicianInsights : revenueInsights}
              minHeight="520px"
            >
              {/* Using the design system BarChart component */}
              {showClinicianBreakdown ? (
                <BarChart
                  data={clinicianBarChartData}
                  mode="stacked"
                  segments={CLINICIAN_SEGMENTS}
                  stackOrder={CLINICIAN_STACK_ORDER}
                  formatValue={formatCurrencyShort}
                  onHover={setHoveredClinicianBar}
                  showLegend
                  legendPosition="top-right"
                  height="380px"
                />
              ) : (
                <BarChart
                  data={barChartData}
                  mode="single"
                  goal={{ value: 150000 }}
                  getBarColor={(value) =>
                    value >= 150000
                      ? {
                          gradient: 'linear-gradient(180deg, #34d399 0%, #059669 100%)',
                          shadow: '0 4px 12px -2px rgba(16, 185, 129, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
                          textColor: 'text-emerald-600',
                        }
                      : {
                          gradient: 'linear-gradient(180deg, #60a5fa 0%, #2563eb 100%)',
                          shadow: '0 4px 12px -2px rgba(37, 99, 235, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
                          textColor: 'text-blue-600',
                        }
                  }
                  formatValue={formatCurrencyShort}
                  height="380px"
                />
              )}
            </ChartCard>

            {/* Revenue Distribution Donut Chart */}
            <DonutChartCard
              title="Revenue Distribution"
              subtitle={`Total across all ${revenueBreakdownData.length} months`}
              segments={[
                { label: 'Clinician Costs', value: totalClinicianCosts, color: '#3b82f6' },
                { label: 'Supervisor Costs', value: totalSupervisorCosts, color: '#f59e0b' },
                { label: 'CC Fees', value: totalCCFees, color: '#f43f5e' },
                { label: 'Net Revenue', value: totalNetRevenue, color: '#10b981' },
              ]}
              centerLabel="Gross Revenue"
              centerValue={formatCurrency(totalGrossRevenue)}
              valueFormat="currency"
              size="md"
              expandable
              onExpand={() => setExpandedCard('revenue-distribution')}
            />
            </Grid>
          </Section>
        </AnimatedSection>

        {/* Margin & Cost Trend Charts */}
        <AnimatedSection delay={380}>
          <Section spacing="md">
            <Grid cols={2} gap="lg">
              {/* Net Revenue Margin Chart */}
              <SimpleChartCard
              title="Net Revenue Margin"
              subtitle="Percentage of gross revenue retained"
              metrics={[
                {
                  value: `${Math.round(avgMargin)}%`,
                  label: 'Your Avg',
                  bgColor: '#ecfdf5',
                  textColor: '#059669',
                  isPrimary: true,
                },
                {
                  value: '18%',
                  label: 'Industry',
                  bgColor: '#eef2ff',
                  textColor: '#6366f1',
                  accentColor: '#6366f1',
                },
                {
                  value: '15%',
                  label: '2024',
                  bgColor: '#fefce8',
                  textColor: '#ca8a04',
                  accentColor: '#eab308',
                },
              ]}
            >
              <LineChart
                data={marginChartData}
                xAxisKey="month"
                lines={[{ dataKey: 'margin', color: '#10b981', activeColor: '#059669' }]}
                yDomain={[0, 30]}
                yTickFormatter={(v) => `${v}%`}
                tooltipFormatter={(value: number) => [`${value.toFixed(1)}%`, 'Margin']}
              />
            </SimpleChartCard>

            {/* Clinician & Supervisor Cost as % of Revenue */}
            <SimpleChartCard
              title="Cost as % of Revenue"
              subtitle="Clinician and supervisor costs"
              metrics={[
                {
                  value: `${Math.round(avgClinicianPct + avgSupervisorPct)}%`,
                  label: 'Total Avg',
                  bgColor: '#f5f5f4',
                  textColor: '#57534e',
                  isPrimary: true,
                },
                {
                  value: `${Math.round(avgClinicianPct)}%`,
                  label: 'Clinician',
                  bgColor: '#eff6ff',
                  textColor: '#2563eb',
                  accentColor: '#3b82f6',
                },
                {
                  value: `${Math.round(avgSupervisorPct)}%`,
                  label: 'Supervisor',
                  bgColor: '#fefce8',
                  textColor: '#ca8a04',
                  accentColor: '#f59e0b',
                },
              ]}
            >
              <LineChart
                data={costPercentageData}
                xAxisKey="month"
                lines={[
                  { dataKey: 'clinicianPct', color: '#3b82f6', activeColor: '#2563eb', name: 'Clinician' },
                  { dataKey: 'supervisorPct', color: '#f59e0b', activeColor: '#d97706', name: 'Supervisor' },
                ]}
                yDomain={[0, 80]}
                yTickFormatter={(v) => `${v}%`}
                tooltipFormatter={(value: number, name: string) => [
                  `${value.toFixed(1)}%`,
                  name === 'clinicianPct' ? 'Clinician' : 'Supervisor',
                ]}
              />
            </SimpleChartCard>
            </Grid>
          </Section>
        </AnimatedSection>

        {/* Client Lifetime Value Chart */}
        <AnimatedSection delay={430}>
          <Section spacing="md">
            <Grid cols={2} gap="lg">
              <SimpleChartCard
                title="Client Lifetime Value"
                subtitle="Average revenue per client by months since first session"
                metrics={[
                  {
                    value: '$3.6k',
                    label: '2025',
                    bgColor: '#ecfdf5',
                    textColor: '#059669',
                    isPrimary: true,
                  },
                  {
                    value: '$4.4k',
                    label: '2024',
                    bgColor: '#eff6ff',
                    textColor: '#2563eb',
                    accentColor: '#3b82f6',
                  },
                ]}
              >
                <LineChart
                  data={[
                    { month: 'M0', currentYear: 479, priorYear: 499 },
                    { month: 'M1', currentYear: 987, priorYear: 1046 },
                    { month: 'M2', currentYear: 1532, priorYear: 1587 },
                    { month: 'M3', currentYear: 2031, priorYear: 2084 },
                    { month: 'M4', currentYear: 2456, priorYear: 2531 },
                    { month: 'M5', currentYear: 2812, priorYear: 2789 },
                    { month: 'M6', currentYear: 3057, priorYear: 3067 },
                    { month: 'M7', currentYear: 3298, priorYear: 3312 },
                    { month: 'M8', currentYear: 3489, priorYear: 3556 },
                    { month: 'M9', currentYear: 3576, priorYear: 3800 },
                  ]}
                  xAxisKey="month"
                  lines={[
                    { dataKey: 'currentYear', color: '#10b981', activeColor: '#059669', name: '2025' },
                    { dataKey: 'priorYear', color: '#3b82f6', activeColor: '#2563eb', name: '2024' },
                  ]}
                  yDomain={[0, 5000]}
                  yTickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
                  tooltipFormatter={(value: number, name: string) => [
                    `$${value.toLocaleString()}`,
                    name,
                  ]}
                />
              </SimpleChartCard>
            </Grid>
          </Section>
        </AnimatedSection>

        {/* Breakdown Table */}
        <AnimatedSection delay={480}>
          <Section spacing="none">
            <DataTableCard
              title="Full Breakdown"
              subtitle="Monthly revenue, costs, and net revenue details"
              columns={buildTableColumns()}
              rows={buildTableRows()}
              expandable
              onExpand={() => setExpandedCard('breakdown-table')}
            />
          </Section>
        </AnimatedSection>
      </PageContent>

      {/* Expanded Modals using centralized ExpandedChartModal */}
      <ExpandedChartModal
        isOpen={expandedCard === 'revenue-performance'}
        onClose={() => setExpandedCard(null)}
        title="Revenue Performance"
        subtitle={showClinicianBreakdown ? 'Revenue by clinician breakdown' : 'Monthly revenue with $150k goal'}
        headerControls={
          <>
            <ToggleButton
              label="By Clinician"
              active={showClinicianBreakdown}
              onToggle={() => setShowClinicianBreakdown(!showClinicianBreakdown)}
              icon={<Users size={16} />}
            />
            <GoalIndicator
              value="$150k"
              label="Goal"
              color="amber"
              hidden={showClinicianBreakdown}
            />
            <ActionButton
              label="Revenue Report"
              icon={<ArrowRight size={16} />}
            />
          </>
        }
        insights={showClinicianBreakdown ? clinicianInsights : revenueInsights}
      >
        {showClinicianBreakdown ? (
          <BarChart
            data={clinicianBarChartData}
            mode="stacked"
            size="lg"
            segments={CLINICIAN_SEGMENTS}
            stackOrder={CLINICIAN_STACK_ORDER}
            formatValue={formatCurrencyShort}
            onHover={setHoveredClinicianBar}
            showLegend
            height="100%"
          />
        ) : (
          <BarChart
            data={barChartData}
            mode="single"
            size="lg"
            goal={{ value: 150000 }}
            getBarColor={(value) =>
              value >= 150000
                ? {
                    gradient: 'linear-gradient(180deg, #34d399 0%, #059669 100%)',
                    shadow: '0 6px 16px -2px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                    textColor: 'text-emerald-600',
                  }
                : {
                    gradient: 'linear-gradient(180deg, #60a5fa 0%, #2563eb 100%)',
                    shadow: '0 6px 16px -2px rgba(37, 99, 235, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                    textColor: 'text-blue-600',
                  }
            }
            formatValue={formatCurrencyShort}
            height="100%"
          />
        )}
      </ExpandedChartModal>

      <ExpandedChartModal
        isOpen={expandedCard === 'revenue-distribution'}
        onClose={() => setExpandedCard(null)}
        title="Revenue Distribution"
        subtitle={`Cost breakdown across ${revenueBreakdownData.length} months`}
      >
        <DonutChartCard
          title=""
          segments={[
            { label: 'Clinician Costs', value: totalClinicianCosts, color: '#3b82f6' },
            { label: 'Supervisor Costs', value: totalSupervisorCosts, color: '#f59e0b' },
            { label: 'CC Fees', value: totalCCFees, color: '#f43f5e' },
            { label: 'Net Revenue', value: totalNetRevenue, color: '#10b981' },
          ]}
          centerLabel="Gross Revenue"
          centerValue={formatCurrency(totalGrossRevenue)}
          valueFormat="currency"
          size="lg"
        />
      </ExpandedChartModal>

      <ExpandedChartModal
        isOpen={expandedCard === 'breakdown-table'}
        onClose={() => setExpandedCard(null)}
        title="Full Breakdown"
        subtitle="Monthly revenue, costs, and net revenue details"
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

export default FinancialAnalysisTab;
