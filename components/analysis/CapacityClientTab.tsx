import React, { useState, useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import {
  PageHeader,
  PageContent,
  Grid,
  Section,
  StatCard,
  ChartCard,
  SimpleChartCard,
  StackedBarCard,
  ActionButton,
  ToggleButton,
  DivergingBarChart,
  BarChart,
  LineChart,
  ExpandedChartModal,
  AnimatedGrid,
  AnimatedSection,
  ExecutiveSummary,
} from '../design-system';
import type { CapacityClientTabProps } from './types';

// =============================================================================
// CAPACITY & CLIENT TAB COMPONENT
// =============================================================================

export const CapacityClientTab: React.FC<CapacityClientTabProps> = ({
  timePeriod,
  onTimePeriodChange,
  timePeriods,
  tabs,
  activeTab,
  onTabChange,
  getDateRangeLabel,
  clientGrowthData,
  genderData,
  sessionFrequencyData,
  openSlotsData,
  hoursUtilizationData,
}) => {
  // =========================================================================
  // LOCAL STATE
  // =========================================================================

  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [showCapacityPercentage, setShowCapacityPercentage] = useState(false);

  // Get user-friendly period label (e.g., "last 12 months" instead of "Jan–Dec 2024")
  const periodLabel = useMemo(() => {
    const period = timePeriods.find(p => p.id === timePeriod);
    return period?.label.toLowerCase() || 'this period';
  }, [timePeriod, timePeriods]);

  // =========================================================================
  // COMPUTED VALUES
  // =========================================================================

  // Active clients (latest)
  const currentActiveClients = useMemo(
    () => clientGrowthData[clientGrowthData.length - 1]?.activeClients || 0,
    [clientGrowthData]
  );

  // Active clients at start of period (for trend comparison)
  const startingActiveClients = useMemo(
    () => clientGrowthData[0]?.activeClients || 0,
    [clientGrowthData]
  );

  // Change in active clients over the period
  const activeClientsChange = useMemo(
    () => currentActiveClients - startingActiveClients,
    [currentActiveClients, startingActiveClients]
  );

  const currentCapacity = useMemo(
    () => clientGrowthData[clientGrowthData.length - 1]?.capacity || 0,
    [clientGrowthData]
  );

  // Net growth
  const totalNew = useMemo(
    () => clientGrowthData.reduce((sum, item) => sum + item.new, 0),
    [clientGrowthData]
  );

  const totalChurned = useMemo(
    () => clientGrowthData.reduce((sum, item) => sum + item.churned, 0),
    [clientGrowthData]
  );

  const netGrowth = useMemo(() => totalNew - totalChurned, [totalNew, totalChurned]);

  // Client utilization
  const clientUtilization = useMemo(
    () => currentCapacity > 0 ? (currentActiveClients / currentCapacity) * 100 : 0,
    [currentActiveClients, currentCapacity]
  );

  // Session utilization average
  const avgSessionUtilization = useMemo(
    () => hoursUtilizationData.length > 0
      ? hoursUtilizationData.reduce((sum, item) => sum + item.percentage, 0) / hoursUtilizationData.length
      : 0,
    [hoursUtilizationData]
  );

  // Average clients
  const avgActiveClients = useMemo(
    () => clientGrowthData.length > 0
      ? clientGrowthData.reduce((sum, item) => sum + item.activeClients, 0) / clientGrowthData.length
      : 0,
    [clientGrowthData]
  );

  // Average utilization
  const avgUtilization = useMemo(() => {
    if (clientGrowthData.length === 0) return 0;
    const values = clientGrowthData.map(item => (item.activeClients / item.capacity) * 100);
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }, [clientGrowthData]);

  // Peak caseload capacity
  const peakCaseloadCapacity = useMemo(() => {
    if (clientGrowthData.length === 0) return { month: '', value: 0 };
    const values = clientGrowthData.map(item => ({
      month: item.month,
      value: (item.activeClients / item.capacity) * 100,
    }));
    return values.reduce((best, item) => item.value > best.value ? item : best, { month: '', value: 0 });
  }, [clientGrowthData]);

  // Best month for active clients
  const bestActiveClientsMonth = useMemo(() => {
    if (clientGrowthData.length === 0) return { month: '', value: 0 };
    return clientGrowthData.reduce((best, item) =>
      item.activeClients > best.value ? { month: item.month, value: item.activeClients } : best,
      { month: '', value: 0 }
    );
  }, [clientGrowthData]);

  // Active clients range
  const activeClientsRange = useMemo(() => {
    if (clientGrowthData.length === 0) return { min: 0, max: 0 };
    const values = clientGrowthData.map(item => item.activeClients);
    return { min: Math.min(...values), max: Math.max(...values) };
  }, [clientGrowthData]);

  // Caseload capacity range
  const caseloadCapacityRange = useMemo(() => {
    if (clientGrowthData.length === 0) return { min: 0, max: 0 };
    const values = clientGrowthData.map(item => (item.activeClients / item.capacity) * 100);
    return { min: Math.min(...values), max: Math.max(...values) };
  }, [clientGrowthData]);

  // Monthly averages for client movement
  const avgMonthlyNew = useMemo(
    () => clientGrowthData.length > 0 ? totalNew / clientGrowthData.length : 0,
    [totalNew, clientGrowthData.length]
  );

  const avgMonthlyChurn = useMemo(
    () => clientGrowthData.length > 0 ? totalChurned / clientGrowthData.length : 0,
    [totalChurned, clientGrowthData.length]
  );

  // Open slots average
  const avgOpenSlots = useMemo(
    () => openSlotsData.length > 0
      ? Math.round(openSlotsData.reduce((sum, item) => sum + item.value, 0) / openSlotsData.length)
      : 0,
    [openSlotsData]
  );

  // =========================================================================
  // CHART DATA
  // =========================================================================

  // Caseload Capacity combo chart data
  const clientUtilizationChartData = useMemo(() => {
    return clientGrowthData.map(item => ({
      ...item,
      utilizationRate: parseFloat(((item.activeClients / item.capacity) * 100).toFixed(1)),
    }));
  }, [clientGrowthData]);

  // Active clients bar chart data
  const activeClientsBarData = useMemo(() => {
    return clientGrowthData.map(item => ({
      label: item.month,
      value: item.activeClients,
    }));
  }, [clientGrowthData]);

  // Capacity percentage bar chart data
  const capacityPercentageBarData = useMemo(() => {
    return clientGrowthData.map(item => ({
      label: item.month,
      value: parseFloat(((item.activeClients / item.capacity) * 100).toFixed(1)),
    }));
  }, [clientGrowthData]);

  // Client movement data for DivergingBarChart
  const clientMovementData = useMemo(() => {
    return clientGrowthData.map(item => ({
      label: item.month,
      positive: item.new,
      negative: item.churned,
    }));
  }, [clientGrowthData]);

  // Session utilization line chart data
  const sessionUtilizationChartData = useMemo(() => {
    return hoursUtilizationData.map(item => ({
      month: item.month,
      percentage: item.percentage,
    }));
  }, [hoursUtilizationData]);

  // Open slots line chart data
  const openSlotsChartData = useMemo(() => {
    return openSlotsData.map(item => ({
      month: item.month,
      value: item.value,
    }));
  }, [openSlotsData]);

  // =========================================================================
  // INSIGHTS
  // =========================================================================

  // Insights for Active Clients view
  const activeClientsInsights = useMemo(() => [
    {
      value: bestActiveClientsMonth.month,
      label: `Best (${bestActiveClientsMonth.value})`,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      value: avgActiveClients.toFixed(0),
      label: 'Average',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
    {
      value: `${activeClientsRange.min}–${activeClientsRange.max}`,
      label: 'Range',
      bgColor: 'bg-stone-100',
      textColor: 'text-stone-700',
    },
  ], [bestActiveClientsMonth, avgActiveClients, activeClientsRange]);

  // Insights for Caseload Capacity view
  const caseloadCapacityInsights = useMemo(() => [
    {
      value: peakCaseloadCapacity.month,
      label: `Peak (${peakCaseloadCapacity.value.toFixed(0)}%)`,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      value: `${avgUtilization.toFixed(0)}%`,
      label: 'Average',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
    {
      value: `${caseloadCapacityRange.min.toFixed(0)}%–${caseloadCapacityRange.max.toFixed(0)}%`,
      label: 'Range',
      bgColor: 'bg-stone-100',
      textColor: 'text-stone-700',
    },
  ], [peakCaseloadCapacity, avgUtilization, caseloadCapacityRange]);

  const clientMovementInsights = useMemo(() => [
    {
      value: netGrowth >= 0 ? `+${netGrowth}` : `${netGrowth}`,
      label: 'Net Change',
      bgColor: netGrowth >= 0 ? 'bg-emerald-50' : 'bg-rose-50',
      textColor: netGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600',
    },
    {
      value: `+${avgMonthlyNew.toFixed(1)}`,
      label: 'Avg New/mo',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      value: `-${avgMonthlyChurn.toFixed(1)}`,
      label: 'Avg Churn/mo',
      bgColor: 'bg-rose-50',
      textColor: 'text-rose-600',
    },
  ], [netGrowth, avgMonthlyNew, avgMonthlyChurn]);

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="min-h-full">
      {/* Page Header */}
      <PageHeader
        accent="amber"
        label="Detailed Analysis"
        title="Client & Capacity"
        subtitle={getDateRangeLabel()}
        showTimePeriod
        timePeriod={timePeriod}
        onTimePeriodChange={onTimePeriodChange}
        timePeriods={timePeriods}
      />

      <PageContent>
        {/* Executive Summary */}
        <Section spacing="md">
          <ExecutiveSummary
            headline="Capacity Healthy, Room to Grow"
            summary={`You currently have **${currentActiveClients} active clients** out of **${currentCapacity} capacity** (**${clientUtilization.toFixed(0)}% utilization**). Net growth this period is **${netGrowth >= 0 ? '+' : ''}${netGrowth} clients** (+${totalNew} new, -${totalChurned} churned). Session utilization averages **${avgSessionUtilization.toFixed(0)}%**—${avgSessionUtilization >= 85 ? 'excellent efficiency' : avgSessionUtilization >= 75 ? 'healthy levels with room for optimization' : 'consider strategies to improve slot fill rates'}.`}
            accent="cyan"
          />
        </Section>

        {/* Hero Stats Row */}
        <Section spacing="md">
          <AnimatedGrid cols={4} gap="md" staggerDelay={60}>
            <StatCard
              title="Active Clients"
              value={currentActiveClients.toLocaleString()}
              valueLabel="right now"
              subtitle={periodLabel}
            />
            <StatCard
              title="Net Growth"
              value={netGrowth >= 0 ? `+${netGrowth}` : `${netGrowth}`}
              valueLabel="total"
              subtitle={periodLabel}
            />
            <StatCard
              title="Caseload Capacity"
              value={`${avgUtilization.toFixed(0)}%`}
              valueLabel="average"
              subtitle={periodLabel}
            />
            <StatCard
              title="Session Goal %"
              value={`${avgSessionUtilization.toFixed(0)}%`}
              valueLabel="average"
              subtitle={periodLabel}
            />
          </AnimatedGrid>
        </Section>

        {/* Main Charts Row */}
        <AnimatedSection delay={280}>
          <Section spacing="md">
            <Grid cols={2} gap="lg">
            {/* Caseload Capacity - Toggle between Active Clients and Capacity % */}
            <ChartCard
              title="Active Clients & Caseload Capacity"
              subtitle="How full your practice is each month"
              headerControls={
                <>
                  <ToggleButton
                    label="Caseload Capacity"
                    active={showCapacityPercentage}
                    onToggle={() => setShowCapacityPercentage(!showCapacityPercentage)}
                  />
{/* Report button hidden for now
                  <ActionButton label="View Report" icon={<ArrowRight size={16} />} />
*/}
                </>
              }
              expandable
              onExpand={() => setExpandedCard('client-utilization')}
              insights={showCapacityPercentage ? caseloadCapacityInsights : activeClientsInsights}
              minHeight="520px"
            >
              {showCapacityPercentage ? (
                <BarChart
                  data={capacityPercentageBarData}
                  mode="single"
                  getBarColor={(value) => ({
                    gradient: value >= 90
                      ? 'linear-gradient(180deg, #34d399 0%, #059669 100%)'
                      : value >= 75
                        ? 'linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%)'
                        : 'linear-gradient(180deg, #fb7185 0%, #f43f5e 100%)',
                    shadow: value >= 90
                      ? '0 4px 12px -2px rgba(16, 185, 129, 0.35)'
                      : value >= 75
                        ? '0 4px 12px -2px rgba(245, 158, 11, 0.35)'
                        : '0 4px 12px -2px rgba(244, 63, 94, 0.35)',
                    textColor: value >= 90
                      ? 'text-emerald-600'
                      : value >= 75
                        ? 'text-amber-600'
                        : 'text-rose-600',
                  })}
                  formatValue={(v) => `${v}%`}
                  maxValue={100}
                  height="380px"
                />
              ) : (
                <BarChart
                  data={activeClientsBarData}
                  mode="single"
                  getBarColor={() => ({
                    gradient: 'linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%)',
                    shadow: '0 4px 12px -2px rgba(245, 158, 11, 0.35)',
                    textColor: 'text-amber-600',
                  })}
                  formatValue={(v) => v.toString()}
                  height="380px"
                />
              )}
            </ChartCard>

            {/* New and Churned Clients - Diverging Bar Chart */}
            <ChartCard
              title="New and Churned Clients Per Month"
              subtitle="How your client base is changing"
              headerControls={
                <>
                  <div className="flex items-center gap-6 bg-stone-50 rounded-xl px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-md bg-gradient-to-b from-emerald-400 to-emerald-500 shadow-sm"></div>
                      <span className="text-stone-700 text-base font-semibold">New Clients</span>
                    </div>
                    <div className="w-px h-6 bg-stone-200" />
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-md bg-gradient-to-b from-rose-400 to-rose-500 shadow-sm"></div>
                      <span className="text-stone-700 text-base font-semibold">Churned</span>
                    </div>
                  </div>
{/* Report button hidden for now
                  <ActionButton label="View Report" icon={<ArrowRight size={16} />} />
*/}
                </>
              }
              expandable
              onExpand={() => setExpandedCard('client-movement')}
              insights={clientMovementInsights}
              minHeight="520px"
            >
              <DivergingBarChart
                data={clientMovementData}
                positiveConfig={{
                  label: 'New Clients',
                  color: '#34d399',
                  colorEnd: '#10b981',
                }}
                negativeConfig={{
                  label: 'Churned',
                  color: '#fb7185',
                  colorEnd: '#f43f5e',
                }}
                height="350px"
              />
            </ChartCard>
            </Grid>
          </Section>
        </AnimatedSection>

        {/* Client Demographics Row */}
        <AnimatedSection delay={380}>
          <Section spacing="md">
            <Grid cols={2} gap="md">
            {/* Client Gender */}
            <StackedBarCard
              title="Client Gender"
              subtitle="current active clients"
              segments={[
                {
                  label: 'Male',
                  value: genderData.male,
                  color: 'bg-blue-500',
                },
                {
                  label: 'Female',
                  value: genderData.female,
                  color: 'bg-pink-500',
                },
                {
                  label: 'Other',
                  value: genderData.other,
                  color: 'bg-violet-500',
                },
              ]}
            />

            {/* Session Frequency */}
            <StackedBarCard
              title="Client Session Frequency"
              subtitle="current active clients"
              segments={[
                {
                  label: 'Weekly',
                  value: sessionFrequencyData.weekly,
                  color: 'bg-emerald-500',
                },
                {
                  label: 'Bi-weekly',
                  value: sessionFrequencyData.biweekly,
                  color: 'bg-amber-500',
                },
                {
                  label: 'Monthly',
                  value: sessionFrequencyData.monthly,
                  color: 'bg-stone-400',
                },
              ]}
              />
            </Grid>
          </Section>
        </AnimatedSection>

        {/* Session Goal % & Open Slots Row */}
        <AnimatedSection delay={480}>
          <Section spacing="none">
            <Grid cols={2} gap="lg">
              {/* Session Goal % Trend */}
              <SimpleChartCard
                title="Session Goal %"
                subtitle="Percentage of session goal achieved"
                metrics={[
                  {
                    value: `${Math.round(avgSessionUtilization)}%`,
                    label: 'Average',
                    bgColor: '#eff6ff',
                    textColor: '#2563eb',
                    isPrimary: true,
                  },
                ]}
                expandable
                onExpand={() => setExpandedCard('session-utilization')}
              >
                <LineChart
                  data={sessionUtilizationChartData}
                  xAxisKey="month"
                  lines={[{ dataKey: 'percentage', color: '#3b82f6', activeColor: '#2563eb' }]}
                  yDomain={[70, 100]}
                  yTickFormatter={(v) => `${v}%`}
                  tooltipFormatter={(value: number) => [`${value.toFixed(1)}%`, 'Goal Progress']}
                  showAreaFill
                />
              </SimpleChartCard>

              {/* Open Slots Trend */}
              <SimpleChartCard
                title="Open Slots"
                subtitle="Unfilled appointment slots per month"
                metrics={[
                  {
                    value: avgOpenSlots.toString(),
                    label: 'Average',
                    bgColor: '#fff1f2',
                    textColor: '#e11d48',
                    isPrimary: true,
                  },
                ]}
                expandable
                onExpand={() => setExpandedCard('open-slots')}
              >
                <LineChart
                  data={openSlotsChartData}
                  xAxisKey="month"
                  lines={[{ dataKey: 'value', color: '#f43f5e', activeColor: '#e11d48' }]}
                  tooltipFormatter={(value: number) => [String(value), 'Open Slots']}
                  showAreaFill
                />
              </SimpleChartCard>
            </Grid>
          </Section>
        </AnimatedSection>
      </PageContent>

      {/* =====================================================================
          EXPANDED MODALS
          ===================================================================== */}

      {/* Caseload Capacity Expanded */}
      <ExpandedChartModal
        isOpen={expandedCard === 'client-utilization'}
        onClose={() => setExpandedCard(null)}
        title="Active Clients & Caseload Capacity"
        subtitle="How full your practice is each month"
        headerControls={
          <>
            <ToggleButton
              label="Caseload Capacity"
              active={showCapacityPercentage}
              onToggle={() => setShowCapacityPercentage(!showCapacityPercentage)}
            />
{/* Report button hidden for now
            <ActionButton label="View Report" icon={<ArrowRight size={16} />} />
*/}
          </>
        }
        insights={showCapacityPercentage ? caseloadCapacityInsights : activeClientsInsights}
      >
        {showCapacityPercentage ? (
          <BarChart
            data={capacityPercentageBarData}
            mode="single"
            size="lg"
            getBarColor={(value) => ({
              gradient: value >= 90
                ? 'linear-gradient(180deg, #34d399 0%, #059669 100%)'
                : value >= 75
                  ? 'linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%)'
                  : 'linear-gradient(180deg, #fb7185 0%, #f43f5e 100%)',
              shadow: value >= 90
                ? '0 4px 12px -2px rgba(16, 185, 129, 0.35)'
                : value >= 75
                  ? '0 4px 12px -2px rgba(245, 158, 11, 0.35)'
                  : '0 4px 12px -2px rgba(244, 63, 94, 0.35)',
              textColor: value >= 90
                ? 'text-emerald-600'
                : value >= 75
                  ? 'text-amber-600'
                  : 'text-rose-600',
            })}
            formatValue={(v) => `${v}%`}
            maxValue={100}
            height="100%"
          />
        ) : (
          <BarChart
            data={activeClientsBarData}
            mode="single"
            size="lg"
            getBarColor={() => ({
              gradient: 'linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%)',
              shadow: '0 4px 12px -2px rgba(245, 158, 11, 0.35)',
              textColor: 'text-amber-600',
            })}
            formatValue={(v) => v.toString()}
            height="100%"
          />
        )}
      </ExpandedChartModal>

      {/* New and Churned Clients Expanded */}
      <ExpandedChartModal
        isOpen={expandedCard === 'client-movement'}
        onClose={() => setExpandedCard(null)}
        title="New and Churned Clients Per Month"
        subtitle="How your client base is changing"
        headerControls={
          <>
            <div className="flex items-center gap-6 bg-stone-50 rounded-xl px-5 py-3">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-md bg-gradient-to-b from-emerald-400 to-emerald-500 shadow-sm"></div>
                <span className="text-stone-700 text-base font-semibold">New Clients</span>
              </div>
              <div className="w-px h-6 bg-stone-200" />
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-md bg-gradient-to-b from-rose-400 to-rose-500 shadow-sm"></div>
                <span className="text-stone-700 text-base font-semibold">Churned</span>
              </div>
            </div>
          </>
        }
        insights={clientMovementInsights}
      >
        <DivergingBarChart
          data={clientMovementData}
          positiveConfig={{
            label: 'New Clients',
            color: '#34d399',
            colorEnd: '#10b981',
          }}
          negativeConfig={{
            label: 'Churned',
            color: '#fb7185',
            colorEnd: '#f43f5e',
          }}
          height="100%"
        />
      </ExpandedChartModal>

      {/* Session Goal % Expanded */}
      <ExpandedChartModal
        isOpen={expandedCard === 'session-utilization'}
        onClose={() => setExpandedCard(null)}
        title="Session Goal %"
        subtitle="Percentage of session goal achieved"
      >
        <LineChart
          data={sessionUtilizationChartData}
          xAxisKey="month"
          lines={[{ dataKey: 'percentage', color: '#3b82f6', activeColor: '#2563eb' }]}
          yDomain={[70, 100]}
          yTickFormatter={(v) => `${v}%`}
          tooltipFormatter={(value: number) => [`${value.toFixed(1)}%`, 'Goal Progress']}
          showAreaFill
          height="100%"
        />
      </ExpandedChartModal>

      {/* Open Slots Expanded */}
      <ExpandedChartModal
        isOpen={expandedCard === 'open-slots'}
        onClose={() => setExpandedCard(null)}
        title="Open Slots"
        subtitle="Unfilled appointment slots per month"
      >
        <LineChart
          data={openSlotsChartData}
          xAxisKey="month"
          lines={[{ dataKey: 'value', color: '#f43f5e', activeColor: '#e11d48' }]}
          tooltipFormatter={(value: number) => [String(value), 'Open Slots']}
          showAreaFill
          height="100%"
        />
      </ExpandedChartModal>
    </div>
  );
};

export default CapacityClientTab;
