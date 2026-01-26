import React, { useState, useMemo } from 'react';
import { Users } from 'lucide-react';
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
  BarChart,
  LineChart,
  ExpandedChartModal,
  AnimatedGrid,
  AnimatedSection,
  ExecutiveSummary,
} from '../design-system';
import type { HoverInfo, SegmentConfig } from '../design-system';
import { TimeSelector } from '../design-system/controls/TimeSelector';
import type { ConsultationsAnalysisTabProps } from './types';

// =============================================================================
// CONSULTATIONS ANALYSIS TAB
// =============================================================================
// Displays consultation metrics including volume, conversion rates,
// and pipeline health. Uses design system components throughout.
// Follows the same layout pattern as SessionsAnalysisTab.
// =============================================================================

// Clinician segment configuration for BarChart
const CLINICIAN_SEGMENTS: SegmentConfig[] = [
  { key: 'Chen', label: 'S Chen', color: '#7c3aed', gradient: 'linear-gradient(180deg, #a78bfa 0%, #7c3aed 100%)' },
  { key: 'Rodriguez', label: 'M Rodriguez', color: '#0891b2', gradient: 'linear-gradient(180deg, #22d3ee 0%, #0891b2 100%)' },
  { key: 'Patel', label: 'A Patel', color: '#d97706', gradient: 'linear-gradient(180deg, #fbbf24 0%, #d97706 100%)' },
  { key: 'Kim', label: 'J Kim', color: '#db2777', gradient: 'linear-gradient(180deg, #f472b6 0%, #db2777 100%)' },
  { key: 'Johnson', label: 'M Johnson', color: '#059669', gradient: 'linear-gradient(180deg, #34d399 0%, #059669 100%)' },
];

const CLINICIAN_STACK_ORDER = ['Johnson', 'Kim', 'Patel', 'Rodriguez', 'Chen'];

export const ConsultationsAnalysisTab: React.FC<ConsultationsAnalysisTabProps> = ({
  timePeriod,
  onTimePeriodChange,
  timePeriods,
  tabs,
  activeTab,
  onTabChange,
  getDateRangeLabel,
  timeSelection,
  onTimeSelectionChange,
  consultationsData,
  consultationsByClinicianData,
  sourceData,
  pipelineData,
  funnelData,
}) => {
  // =========================================================================
  // LOCAL STATE & SETTINGS
  // =========================================================================

  const { settings } = useSettings();
  const [showClinicianBreakdown, setShowClinicianBreakdown] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [hoveredClinicianBar, setHoveredClinicianBar] = useState<HoverInfo | null>(null);

  // =========================================================================
  // COMPUTED VALUES - HERO STATS
  // =========================================================================

  // Get user-friendly period label
  const periodLabel = useMemo(() => {
    const period = timePeriods.find(p => p.id === timePeriod);
    return period?.label.toLowerCase() || 'this period';
  }, [timePeriod, timePeriods]);

  // Capitalized period label for subtitles
  const periodLabelCapitalized = useMemo(() => {
    const period = timePeriods.find(p => p.id === timePeriod);
    return period?.label || 'This Period';
  }, [timePeriod, timePeriods]);

  // Total consultations in period
  const totalConsultations = useMemo(
    () => consultationsData.reduce((sum, item) => sum + item.consultations, 0),
    [consultationsData]
  );

  // Total new clients (converted)
  const totalNewClients = useMemo(
    () => consultationsData.reduce((sum, item) => sum + item.converted, 0),
    [consultationsData]
  );

  // Non-converted (total - converted)
  const totalNotConverted = useMemo(
    () => totalConsultations - totalNewClients,
    [totalConsultations, totalNewClients]
  );

  // Conversion rate
  const conversionRate = useMemo(
    () => totalConsultations > 0 ? (totalNewClients / totalConsultations) * 100 : 0,
    [totalNewClients, totalConsultations]
  );

  // Average days to first session
  const avgDaysToFirstSession = useMemo(() => {
    const totalDays = consultationsData.reduce((sum, item) => sum + item.totalDaysToFirstSession, 0);
    const totalConversions = consultationsData.reduce((sum, item) => sum + item.conversionsWithFirstSession, 0);
    return totalConversions > 0 ? totalDays / totalConversions : 0;
  }, [consultationsData]);

  // Average monthly consultations
  const avgMonthlyConsultations = useMemo(
    () => consultationsData.length > 0 ? Math.round(totalConsultations / consultationsData.length) : 0,
    [totalConsultations, consultationsData.length]
  );

  // Best month
  const bestMonth = useMemo(() => {
    if (consultationsData.length === 0) return { month: '', consultations: 0 };
    return consultationsData.reduce((best, item) =>
      item.consultations > best.consultations ? { month: item.month, consultations: item.consultations } : best,
      { month: '', consultations: 0 }
    );
  }, [consultationsData]);

  // Consultations range
  const consultationsRange = useMemo(() => {
    if (consultationsData.length === 0) return { min: 0, max: 0 };
    const values = consultationsData.map((item) => item.consultations);
    return { min: Math.min(...values), max: Math.max(...values) };
  }, [consultationsData]);

  // =========================================================================
  // CHART DATA
  // =========================================================================

  // Bar chart data for single mode
  const barChartData = useMemo(() => {
    return consultationsData.map((item) => ({
      label: item.month,
      value: item.consultations,
    }));
  }, [consultationsData]);

  // Stacked bar chart data for clinician breakdown
  const clinicianBarChartData = useMemo(() => {
    return consultationsByClinicianData.map((item) => ({
      label: item.month,
      Chen: item.Chen,
      Rodriguez: item.Rodriguez,
      Patel: item.Patel,
      Kim: item.Kim,
      Johnson: item.Johnson,
    }));
  }, [consultationsByClinicianData]);

  // Line chart data for conversion rate trend
  const conversionRateChartData = useMemo(() => {
    return consultationsData.map((item) => ({
      month: item.month,
      conversionRate: item.consultations > 0
        ? Math.round((item.converted / item.consultations) * 100)
        : 0,
    }));
  }, [consultationsData]);

  // Memoized line chart configuration
  const conversionRateLines = useMemo(() => [
    { dataKey: 'conversionRate', color: '#10b981', activeColor: '#059669', name: 'Conversion Rate' },
  ], []);

  // Memoized formatters for line chart
  const conversionYTickFormatter = useMemo(() => (v: number) => `${v}%`, []);
  const conversionTooltipFormatter = useMemo(() => (value: number): [string, string] => [
    `${value}%`,
    'Conversion Rate',
  ], []);

  // Funnel donut chart - shows where people drop off
  // We show the DROP-OFFS at each stage, not the cumulative numbers
  const funnelSegments = useMemo(() => {
    const noShows = funnelData.booked - funnelData.attended;
    const didntBookIntake = funnelData.attended - funnelData.bookedIntake;
    const didntCompletePaperwork = funnelData.bookedIntake - funnelData.completedPaperwork;
    const didntShowFirstSession = funnelData.completedPaperwork - funnelData.firstSession;
    const converted = funnelData.firstSession;

    return [
      { label: 'Converted', value: converted, color: '#10b981' },
      { label: 'No-Show', value: noShows, color: '#ef4444' },
      { label: 'No Intake Booked', value: didntBookIntake, color: '#f97316' },
      { label: 'Paperwork Incomplete', value: didntCompletePaperwork, color: '#eab308' },
      { label: 'Missed First Session', value: didntShowFirstSession, color: '#a855f7' },
    ].filter(s => s.value > 0); // Only show segments with values
  }, [funnelData]);

  // Source donut chart - where consultations come from
  const sourceSegments = useMemo(() => {
    const colors = ['#7c3aed', '#0891b2', '#10b981', '#f59e0b', '#78716c'];
    return sourceData.map((item, index) => ({
      label: item.source,
      value: item.consultations,
      color: colors[index % colors.length],
    }));
  }, [sourceData]);

  // Total consultations from source data for center value
  const totalFromSources = useMemo(
    () => sourceData.reduce((sum, s) => sum + s.consultations, 0),
    [sourceData]
  );

  // =========================================================================
  // INSIGHTS
  // =========================================================================

  const consultationsInsights = useMemo(() => [
    {
      value: bestMonth.month,
      label: `Best (${bestMonth.consultations})`,
      bgColor: 'bg-cyan-50',
      textColor: 'text-cyan-600',
    },
    {
      value: `${conversionRate.toFixed(0)}%`,
      label: 'Conversion Rate',
      bgColor: 'bg-stone-100',
      textColor: 'text-stone-700',
    },
    {
      value: `${consultationsRange.min}–${consultationsRange.max}`,
      label: 'Range',
      bgColor: 'bg-stone-100',
      textColor: 'text-stone-700',
    },
  ], [bestMonth, conversionRate, consultationsRange]);

  const clinicianInsights = useMemo(() => {
    // Calculate totals per clinician
    const totals = consultationsByClinicianData.reduce((acc, item) => ({
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
      { value: totalAll.toString(), label: 'Total', bgColor: 'bg-stone-100', textColor: 'text-stone-700' },
    ];
  }, [consultationsByClinicianData]);

  // =========================================================================
  // TABLE DATA BUILDERS
  // =========================================================================

  const buildTableColumns = () => {
    const monthColumns = consultationsData.map((item) => ({
      key: item.month.toLowerCase(),
      header: item.month,
      align: 'right' as const,
    }));
    return [...monthColumns, { key: 'total', header: 'Total', align: 'right' as const, isTotals: true }];
  };

  const buildTableRows = () => {
    const buildRowValues = (getValue: (item: typeof consultationsData[0]) => number) => {
      const values: Record<string, string> = {};
      let total = 0;
      consultationsData.forEach((item) => {
        const val = getValue(item);
        values[item.month.toLowerCase()] = val.toLocaleString();
        total += val;
      });
      values.total = total.toLocaleString();
      return values;
    };

    return [
      { id: 'consultations', label: 'Consultations', indicator: { color: '#06b6d4' }, values: buildRowValues((item) => item.consultations), isHighlighted: true, highlightColor: 'cyan' as const },
      { id: 'converted', label: 'Converted', indicator: { color: '#10b981' }, values: buildRowValues((item) => item.converted), valueColor: 'text-emerald-600' },
      { id: 'notConverted', label: 'Not Converted', indicator: { color: '#ef4444' }, values: buildRowValues((item) => item.consultations - item.converted), valueColor: 'text-rose-600' },
    ];
  };

  // =========================================================================
  // EXECUTIVE SUMMARY
  // =========================================================================

  const executiveSummary = useMemo(() => {
    const conversionQuality = conversionRate >= 70 ? 'excellent' : conversionRate >= 50 ? 'solid' : 'room for improvement';
    const speedQuality = avgDaysToFirstSession <= 7 ? 'quickly' : avgDaysToFirstSession <= 14 ? 'at a reasonable pace' : 'slowly';

    return `You received **${totalConsultations} consultations** over ${periodLabel}, averaging **${avgMonthlyConsultations} per month**. Your conversion rate of **${conversionRate.toFixed(1)}%** is ${conversionQuality}, converting **${totalNewClients} new clients**. New clients are getting to their first session ${speedQuality}, averaging **${avgDaysToFirstSession.toFixed(1)} days** from consultation to first appointment.`;
  }, [totalConsultations, totalNewClients, conversionRate, avgDaysToFirstSession, periodLabel, avgMonthlyConsultations]);

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="min-h-full">
      {/* Page Header */}
      <PageHeader
        accent="amber"
        title="Consultations"
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
              headline="Your Consultation Pipeline"
              summary={executiveSummary}
              accent="cyan"
            />
          </Section>
        )}

        {/* Hero Stats Row */}
        <Section spacing="md">
          <AnimatedGrid cols={4} gap="md" staggerDelay={60}>
            <StatCard
              title="Consultations"
              value={totalConsultations.toLocaleString()}
              valueLabel="total"
              subtitle={periodLabel}
            />
            <StatCard
              title="New Clients"
              value={totalNewClients.toLocaleString()}
              valueLabel="converted"
              subtitle={periodLabel}
            />
            <StatCard
              title="Conversion Rate"
              value={conversionRate.toFixed(1)}
              valueSuffix="%"
              valueLabel="average"
              subtitle={periodLabel}
            />
            <StatCard
              title="Days to First Session"
              value={avgDaysToFirstSession.toFixed(1)}
              valueLabel="average"
              subtitle={periodLabel}
            />
          </AnimatedGrid>
        </Section>

        {/* Main Charts Row */}
        <AnimatedSection delay={280}>
          <Section spacing="md">
            <Grid cols={2} gap="lg">
              {/* Consultations Per Month Chart */}
              <ChartCard
                title="Consultations Per Month"
                subtitle="How many consultation inquiries you're receiving each month"
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
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: hoveredClinicianBar.color }} />
                        <span className="text-stone-700 font-semibold">{hoveredClinicianBar.segmentLabel}</span>
                        <span className="font-bold" style={{ color: hoveredClinicianBar.color }}>
                          {hoveredClinicianBar.value}
                        </span>
                        <span className="text-stone-500 text-sm">in {hoveredClinicianBar.label}</span>
                      </div>
                    )}
                  </>
                }
                expandable
                onExpand={() => setExpandedCard('consultation-performance')}
                insights={showClinicianBreakdown ? clinicianInsights : consultationsInsights}
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
                    maxValue={25}
                    height="380px"
                  />
                ) : (
                  <BarChart
                    data={barChartData}
                    mode="single"
                    maxValue={25}
                    getBarColor={() => ({
                      gradient: 'linear-gradient(180deg, #22d3ee 0%, #0891b2 100%)',
                      shadow: '0 4px 12px -2px rgba(6, 182, 212, 0.35)',
                      textColor: 'text-cyan-600',
                    })}
                    formatValue={(v) => v.toString()}
                    height="380px"
                  />
                )}
              </ChartCard>

              {/* Conversion Rate Trend Line Chart */}
              <SimpleChartCard
                title="Conversion Rate Trend"
                subtitle="Monthly conversion rate over time"
                metrics={[
                  {
                    value: `${conversionRate.toFixed(0)}%`,
                    label: 'Avg Rate',
                    bgColor: '#ecfdf5',
                    textColor: '#059669',
                    isPrimary: true,
                  },
                  {
                    value: '65%',
                    label: 'Industry Avg',
                    bgColor: '#f5f5f4',
                    textColor: '#57534e',
                    accentColor: '#78716c',
                  },
                ]}
                expandable
                onExpand={() => setExpandedCard('conversion-breakdown')}
              >
                <LineChart
                  data={conversionRateChartData}
                  xAxisKey="month"
                  lines={conversionRateLines}
                  yDomain={[0, 100]}
                  yTickFormatter={conversionYTickFormatter}
                  tooltipFormatter={conversionTooltipFormatter}
                />
              </SimpleChartCard>
            </Grid>
          </Section>
        </AnimatedSection>

        {/* Funnel & Source Charts Row */}
        <AnimatedSection delay={380}>
          <Section spacing="md">
            <Grid cols={2} gap="lg">
              {/* Conversion Funnel Donut */}
              <DonutChartCard
                title="Conversion Funnel"
                subtitle="Where prospects drop off in the conversion process"
                segments={funnelSegments}
                centerLabel="Converted"
                centerValue={`${Math.round((funnelData.firstSession / funnelData.booked) * 100)}%`}
                valueFormat="number"
                expandable
                onExpand={() => setExpandedCard('funnel')}
              />

              {/* Source Breakdown Donut */}
              <DonutChartCard
                title="Consultation Sources"
                subtitle="Where your consultations are coming from"
                segments={sourceSegments}
                centerLabel="Total"
                centerValue={totalFromSources.toString()}
                valueFormat="number"
                expandable
                onExpand={() => setExpandedCard('sources')}
              />
            </Grid>
          </Section>
        </AnimatedSection>

        {/* Monthly Breakdown Table */}
        <AnimatedSection delay={480}>
          <Section spacing="none">
            <DataTableCard
              title="Monthly Breakdown"
              subtitle="Detailed consultation metrics by month"
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

      {/* Consultation Performance Expanded */}
      <ExpandedChartModal
        isOpen={expandedCard === 'consultation-performance'}
        onClose={() => setExpandedCard(null)}
        title="Consultations Per Month"
        subtitle="How many consultation inquiries you're receiving each month"
        headerControls={
          <>
            <ToggleButton
              label="By Clinician"
              active={showClinicianBreakdown}
              onToggle={() => setShowClinicianBreakdown(!showClinicianBreakdown)}
              icon={<Users size={16} />}
            />
          </>
        }
        insights={showClinicianBreakdown ? clinicianInsights : consultationsInsights}
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
            maxValue={25}
            size="lg"
            height="100%"
          />
        ) : (
          <BarChart
            data={barChartData}
            mode="single"
            maxValue={25}
            getBarColor={() => ({
              gradient: 'linear-gradient(180deg, #22d3ee 0%, #0891b2 100%)',
              shadow: '0 4px 12px -2px rgba(6, 182, 212, 0.35)',
              textColor: 'text-cyan-600',
            })}
            formatValue={(v) => v.toString()}
            size="lg"
            height="100%"
          />
        )}
      </ExpandedChartModal>

      {/* Conversion Rate Trend Expanded */}
      <ExpandedChartModal
        isOpen={expandedCard === 'conversion-breakdown'}
        onClose={() => setExpandedCard(null)}
        title="Conversion Rate Trend"
        subtitle="Monthly conversion rate over time"
      >
        <SimpleChartCard
          title=""
          metrics={[
            {
              value: `${conversionRate.toFixed(0)}%`,
              label: 'Avg Rate',
              bgColor: '#ecfdf5',
              textColor: '#059669',
              isPrimary: true,
            },
            {
              value: '65%',
              label: 'Industry Avg',
              bgColor: '#f5f5f4',
              textColor: '#57534e',
              accentColor: '#78716c',
            },
          ]}
        >
          <LineChart
            data={conversionRateChartData}
            xAxisKey="month"
            lines={conversionRateLines}
            yDomain={[0, 100]}
            yTickFormatter={conversionYTickFormatter}
            tooltipFormatter={conversionTooltipFormatter}
          />
        </SimpleChartCard>
      </ExpandedChartModal>

      {/* Monthly Breakdown Expanded */}
      <ExpandedChartModal
        isOpen={expandedCard === 'monthly-breakdown'}
        onClose={() => setExpandedCard(null)}
        title="Monthly Breakdown"
        subtitle="Detailed consultation metrics by month"
      >
        <DataTableCard
          title=""
          columns={buildTableColumns()}
          rows={buildTableRows()}
          size="lg"
        />
      </ExpandedChartModal>

      {/* Funnel Expanded */}
      <ExpandedChartModal
        isOpen={expandedCard === 'funnel'}
        onClose={() => setExpandedCard(null)}
        title="Conversion Funnel"
        subtitle="Where prospects drop off in the conversion process"
      >
        <DonutChartCard
          title=""
          segments={funnelSegments}
          centerLabel="Converted"
          centerValue={`${Math.round((funnelData.firstSession / funnelData.booked) * 100)}%`}
          valueFormat="number"
          size="lg"
        />
      </ExpandedChartModal>

      {/* Sources Expanded */}
      <ExpandedChartModal
        isOpen={expandedCard === 'sources'}
        onClose={() => setExpandedCard(null)}
        title="Consultation Sources"
        subtitle="Where your consultations are coming from"
      >
        <DonutChartCard
          title=""
          segments={sourceSegments}
          centerLabel="Total"
          centerValue={totalFromSources.toString()}
          valueFormat="number"
          size="lg"
        />
      </ExpandedChartModal>
    </div>
  );
};

export default ConsultationsAnalysisTab;
