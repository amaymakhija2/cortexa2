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
  ClinicianFilter,
  OthersTooltip,
  useClinicianFilter,
} from '../design-system';
import type { HoverInfo, ClinicianFilterOption } from '../design-system';
import { TimeSelector } from '../design-system/controls/TimeSelector';
import type { FinancialAnalysisTabProps } from './types';

// =============================================================================
// FINANCIAL ANALYSIS TAB
// =============================================================================
// Displays financial metrics including revenue performance, distribution,
// and detailed breakdown. Uses design system components throughout.
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

export const FinancialAnalysisTab: React.FC<FinancialAnalysisTabProps> = ({
  timePeriod,
  onTimePeriodChange,
  timePeriods,
  tabs,
  activeTab,
  onTabChange,
  getDateRangeLabel,
  timeSelection,
  onTimeSelectionChange,
  revenueData,
  revenueBreakdownData,
  clinicianRevenueData,
  cohortLTVData,
  sessionsData,
}) => {
  // =========================================================================
  // LOCAL STATE & SETTINGS
  // =========================================================================
  const { settings } = useSettings();
  const revenueGoal = settings.practiceGoals.monthlyRevenue;
  const revenueGoalDisplay = `$${Math.round(revenueGoal / 1000)}k`; // e.g., "$150k"
  const [showClinicianBreakdown, setShowClinicianBreakdown] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Reference for tooltip positioning
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // ==========================================================================
  // CLINICIAN FILTER HOOK (Top N + Others pattern)
  // ==========================================================================

  const clinicianFilter = useClinicianFilter({
    data: clinicianRevenueData,
    clinicianKeys: CLINICIAN_KEYS,
    clinicianLabels: CLINICIAN_LABELS,
    initialFilter: 'top5',
  });

  // Get user-friendly period label (e.g., "last 12 months" instead of "Jan–Dec 2024")
  const periodLabel = useMemo(() => {
    const period = timePeriods.find(p => p.id === timePeriod);
    return period?.label.toLowerCase() || 'this period';
  }, [timePeriod, timePeriods]);

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

  // Months that hit the revenue goal
  const monthsAtGoal = useMemo(
    () => revenueData.filter((item) => item.value >= revenueGoal).length,
    [revenueData, revenueGoal]
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

  // Total completed sessions
  const totalCompletedSessions = useMemo(
    () => sessionsData?.reduce((sum, item) => sum + item.completed, 0) ?? 0,
    [sessionsData]
  );

  // Average revenue per session
  const avgRevenuePerSession = useMemo(
    () => totalCompletedSessions > 0 ? totalGrossRevenue / totalCompletedSessions : 0,
    [totalGrossRevenue, totalCompletedSessions]
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

  // Hardcoded LTV chart data (memoized to prevent re-renders)
  const hardcodedLtvData = useMemo(() => [
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
  ], []);

  // LTV chart line configuration (memoized)
  const ltvLines = useMemo(() => [
    { dataKey: 'currentYear', color: '#10b981', activeColor: '#059669', name: '2025' },
    { dataKey: 'priorYear', color: '#3b82f6', activeColor: '#2563eb', name: '2024' },
  ], []);

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

  // Format helpers that return value and suffix separately for better typography
  const formatCurrencyParts = (value: number): { value: string; suffix: string } => {
    if (value >= 1000000) {
      return { value: `$${(value / 1000000).toFixed(2)}`, suffix: 'M' };
    }
    return { value: `$${(value / 1000).toFixed(0)}`, suffix: 'k' };
  };

  // Memoized formatter functions for charts (to prevent re-renders)
  const ltvYTickFormatter = useMemo(() => (v: number) => `$${(v / 1000).toFixed(1)}k`, []);
  const ltvTooltipFormatter = useMemo(() => (value: number, name: string): [string, string] => [
    `$${value.toLocaleString()}`,
    name,
  ], []);

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

  // Prepare stacked bar chart data for clinician breakdown (with Others aggregation)
  const clinicianBarChartData = useMemo(() => {
    return clinicianFilter.transformedData.map((item) => ({
      label: item.month,
      ...CLINICIAN_KEYS.reduce((acc, key) => ({ ...acc, [key]: item[key] }), {}),
      __others__: item.__others__ || 0,
    }));
  }, [clinicianFilter.transformedData]);

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
      value: `${monthsAtGoal}/${revenueData.length}`,
      label: 'Goal Achievement',
      bgColor: 'bg-stone-100',
      textColor: 'text-stone-700',
    },
    {
      value: `${formatCurrencyShort(revenueRange.min)}–${formatCurrencyShort(revenueRange.max)}`,
      label: 'Range',
      bgColor: 'bg-stone-100',
      textColor: 'text-stone-700',
    },
  ], [bestMonth, monthsAtGoal, revenueData.length, revenueRange]);

  const clinicianInsights = useMemo(() => {
    const { topClinician, grandTotal, colorConfig, allClinicians } = clinicianFilter;
    const othersCount = colorConfig.othersClinicians.length;

    return [
      {
        value: topClinician?.label || '-',
        label: `Top (${formatCurrencyShort(topClinician?.totalValue || 0)})`,
        bgColor: 'bg-violet-50',
        textColor: 'text-violet-600',
      },
      {
        value: formatCurrencyShort(grandTotal),
        label: 'Team Total',
        bgColor: 'bg-stone-100',
        textColor: 'text-stone-700',
      },
      {
        value: allClinicians.length.toString(),
        label: othersCount > 0 ? `Clinicians (${othersCount} in Others)` : 'Clinicians',
        bgColor: 'bg-stone-100',
        textColor: 'text-stone-700',
      },
    ];
  }, [clinicianFilter]);

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
        title="Financial Performance"
        timeSelector={
          <TimeSelector
            value={timeSelection}
            onChange={onTimeSelectionChange}
            showAggregateOption={true}
            variant="header"
          />
        }
      />

      <PageContent>
        {/* Executive Summary */}
        {!settings.hideAIInsights && (
          <Section spacing="md">
            <ExecutiveSummary
              headline="Strong Revenue, Watch Your Margins"
              summary={`Revenue is **${momChange >= 0 ? 'up' : 'down'} ${Math.abs(momChange).toFixed(1)}%** this month, with **${monthsAtGoal} of ${revenueData.length} months** exceeding the **${revenueGoalDisplay} target**. Your net margin stands at **${avgMargin.toFixed(1)}%**, ${avgMargin >= 18 ? 'meeting' : 'slightly below'} the industry average of 18%. Clinician compensation costs represent **${avgClinicianPct.toFixed(0)}%** of gross revenue—consider reviewing if margins need improvement.`}
              accent="amber"
            />
          </Section>
        )}

        {/* Hero Stats Row */}
        <Section spacing="md">
          <AnimatedGrid cols={settings.showNetRevenueData ? 3 : 2} gap="md" staggerDelay={60}>
            <StatCard
              title="Gross Revenue"
              value={formatCurrencyParts(totalGrossRevenue).value}
              valueSuffix={formatCurrencyParts(totalGrossRevenue).suffix}
              subtitle={periodLabel}
            />
            {settings.showNetRevenueData && (
              <StatCard
                title="Net Revenue"
                value={formatCurrencyParts(totalNetRevenue).value}
                valueSuffix={formatCurrencyParts(totalNetRevenue).suffix}
                subtitle={periodLabel}
              />
            )}
            <StatCard
              title="Revenue Per Completed Session"
              value={`$${Math.round(avgRevenuePerSession)}`}
              valueLabel="average"
              subtitle={periodLabel}
            />
          </AnimatedGrid>
        </Section>

        {/* Charts Row */}
        <AnimatedSection delay={280}>
          <Section spacing="md">
            <Grid cols={2} gap="lg">
            {/* Monthly Gross Revenue Chart */}
            <ChartCard
              title="Monthly Gross Revenue"
              subtitle="How much you're collecting each month"
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
                  {!showClinicianBreakdown && (
                    <GoalIndicator
                      value={revenueGoalDisplay}
                      label="Goal"
                      color="amber"
                    />
                  )}
                  {clinicianFilter.hoverInfo && !clinicianFilter.isOthersHovered && (
                    <div
                      className="flex items-center gap-3 px-4 py-2 rounded-xl"
                      style={{ backgroundColor: `${clinicianFilter.hoverInfo.color}15` }}
                    >
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: clinicianFilter.hoverInfo.color }} />
                      <span className="text-stone-700 font-semibold">{clinicianFilter.hoverInfo.segmentLabel}</span>
                      <span className="font-bold" style={{ color: clinicianFilter.hoverInfo.color }}>
                        {formatCurrencyShort(clinicianFilter.hoverInfo.value)}
                      </span>
                      <span className="text-stone-500 text-sm">in {clinicianFilter.hoverInfo.label}</span>
                    </div>
                  )}
                  {clinicianFilter.isOthersHovered && (
                    <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-stone-100">
                      <div className="w-3 h-3 rounded-full bg-stone-500" />
                      <span className="text-stone-700 font-semibold">Others</span>
                      <span className="font-bold text-stone-600">
                        {formatCurrencyShort(clinicianFilter.hoverInfo?.value || 0)}
                      </span>
                      <span className="text-stone-500 text-sm">
                        ({clinicianFilter.colorConfig.othersClinicians.length} clinicians)
                      </span>
                    </div>
                  )}
                </>
              }
              expandable
              onExpand={() => setExpandedCard('revenue-performance')}
              insights={showClinicianBreakdown ? clinicianInsights : revenueInsights}
              minHeight="520px"
            >
              {/* Using the design system BarChart component */}
              {showClinicianBreakdown ? (
                <div ref={chartContainerRef} className="relative h-full">
                  <BarChart
                    data={clinicianBarChartData}
                    mode="stacked"
                    segments={clinicianFilter.segments}
                    stackOrder={clinicianFilter.stackOrder}
                    formatValue={formatCurrencyShort}
                    onHover={clinicianFilter.handleSegmentHover}
                    hoverInfo={clinicianFilter.hoverInfo}
                    formatHoverValue={formatCurrencyShort}
                    showLegend
                    legendPosition="top-right"
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
                      formatValue={formatCurrencyShort}
                      className="right-4 top-16"
                    />
                  )}
                </div>
              ) : (
                <BarChart
                  data={barChartData}
                  mode="single"
                  goal={{ value: revenueGoal }}
                  getBarColor={(value) =>
                    value >= revenueGoal
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

            {/* Revenue Distribution Donut Chart (when net revenue enabled) */}
            {settings.showNetRevenueData && (
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
            )}

            {/* Client Lifetime Value Chart (when net revenue disabled - shown alongside Revenue Performance) */}
            {!settings.showNetRevenueData && (
              <SimpleChartCard
                title="Client Lifetime Value"
                subtitle="What an average client brings in gross revenue over time"
                insights={[
                  { value: '$3.6k', label: '2025', bgColor: 'bg-emerald-50', textColor: 'text-emerald-600' },
                  { value: '$4.4k', label: '2024', bgColor: 'bg-stone-100', textColor: 'text-stone-700' },
                ]}
              >
                <LineChart
                  data={hardcodedLtvData}
                  xAxisKey="month"
                  lines={ltvLines}
                  yDomain={[0, 5000]}
                  yTickFormatter={ltvYTickFormatter}
                  tooltipFormatter={ltvTooltipFormatter}
                />
              </SimpleChartCard>
            )}
            </Grid>
          </Section>
        </AnimatedSection>

        {/* Margin & Cost Trend Charts */}
        {settings.showNetRevenueData && (
        <AnimatedSection delay={380}>
          <Section spacing="md">
            <Grid cols={2} gap="lg">
              {/* Net Revenue Margin Chart */}
              <SimpleChartCard
                title="Net Revenue Margin"
                subtitle="Percentage of gross revenue retained"
                insights={[
                  { value: `${Math.round(avgMargin)}%`, label: 'Your Avg', bgColor: 'bg-emerald-50', textColor: 'text-emerald-600' },
                  { value: '18%', label: 'Industry', bgColor: 'bg-stone-100', textColor: 'text-stone-700' },
                  { value: '15%', label: '2024', bgColor: 'bg-stone-100', textColor: 'text-stone-700' },
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
                insights={[
                  { value: `${Math.round(avgClinicianPct + avgSupervisorPct)}%`, label: 'Total Avg', bgColor: 'bg-amber-50', textColor: 'text-amber-600' },
                  { value: `${Math.round(avgClinicianPct)}%`, label: 'Clinician', bgColor: 'bg-stone-100', textColor: 'text-stone-700' },
                  { value: `${Math.round(avgSupervisorPct)}%`, label: 'Supervisor', bgColor: 'bg-stone-100', textColor: 'text-stone-700' },
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
        )}

        {/* Client Lifetime Value Chart (when net revenue enabled - shown in its own row) */}
        {settings.showNetRevenueData && (
        <AnimatedSection delay={430}>
          <Section spacing="md">
            <Grid cols={2} gap="lg">
              <SimpleChartCard
                title="Client Lifetime Value"
                subtitle="What an average client brings in gross revenue over time"
                insights={[
                  { value: '$3.6k', label: '2025', bgColor: 'bg-emerald-50', textColor: 'text-emerald-600' },
                  { value: '$4.4k', label: '2024', bgColor: 'bg-stone-100', textColor: 'text-stone-700' },
                ]}
              >
                <LineChart
                  data={hardcodedLtvData}
                  xAxisKey="month"
                  lines={ltvLines}
                  yDomain={[0, 5000]}
                  yTickFormatter={ltvYTickFormatter}
                  tooltipFormatter={ltvTooltipFormatter}
                />
              </SimpleChartCard>
            </Grid>
          </Section>
        </AnimatedSection>
        )}

        {/* Breakdown Table */}
        {settings.showNetRevenueData && (
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
        )}
      </PageContent>

      {/* Expanded Modals using centralized ExpandedChartModal */}
      <ExpandedChartModal
        isOpen={expandedCard === 'revenue-performance'}
        onClose={() => setExpandedCard(null)}
        title="Monthly Gross Revenue"
        subtitle="How much you're collecting each month"
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
            <GoalIndicator
              value={revenueGoalDisplay}
              label="Goal"
              color="amber"
              hidden={showClinicianBreakdown}
            />
          </>
        }
        insights={showClinicianBreakdown ? clinicianInsights : revenueInsights}
      >
        {showClinicianBreakdown ? (
          <div className="relative h-full">
            <BarChart
              data={clinicianBarChartData}
              mode="stacked"
              size="lg"
              segments={clinicianFilter.segments}
              stackOrder={clinicianFilter.stackOrder}
              formatValue={formatCurrencyShort}
              onHover={clinicianFilter.handleSegmentHover}
              showLegend
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
                formatValue={formatCurrencyShort}
                className="right-4 top-20"
              />
            )}
          </div>
        ) : (
          <BarChart
            data={barChartData}
            mode="single"
            size="lg"
            goal={{ value: revenueGoal }}
            getBarColor={(value) =>
              value >= revenueGoal
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

      {settings.showNetRevenueData && (
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
      )}

      {settings.showNetRevenueData && (
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
      )}
    </div>
  );
};

export default FinancialAnalysisTab;
