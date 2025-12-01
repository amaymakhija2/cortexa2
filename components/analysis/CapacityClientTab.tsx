import React, { useState, useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from 'recharts';
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
  DivergingBarChart,
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

  // =========================================================================
  // COMPUTED VALUES
  // =========================================================================

  // Active clients (latest)
  const currentActiveClients = useMemo(
    () => clientGrowthData[clientGrowthData.length - 1]?.activeClients || 0,
    [clientGrowthData]
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

  // Peak utilization
  const peakUtilization = useMemo(() => {
    if (clientGrowthData.length === 0) return { month: '', value: 0 };
    const values = clientGrowthData.map(item => ({
      month: item.month,
      value: (item.activeClients / item.capacity) * 100,
    }));
    return values.reduce((best, item) => item.value > best.value ? item : best, { month: '', value: 0 });
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

  // Client Utilization combo chart data
  const clientUtilizationChartData = useMemo(() => {
    return clientGrowthData.map(item => ({
      ...item,
      utilizationRate: parseFloat(((item.activeClients / item.capacity) * 100).toFixed(1)),
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

  const clientUtilizationInsights = useMemo(() => [
    {
      value: avgActiveClients.toFixed(0),
      label: 'Avg Clients',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
    {
      value: `${avgUtilization.toFixed(0)}%`,
      label: 'Avg Utilization',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      value: peakUtilization.month,
      label: `Peak (${peakUtilization.value.toFixed(0)}%)`,
      bgColor: 'bg-stone-100',
      textColor: 'text-stone-700',
    },
  ], [avgActiveClients, avgUtilization, peakUtilization]);

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
        timePeriods={timePeriods}
        onTimePeriodChange={onTimePeriodChange}
        tabs={tabs.map((t) => ({ id: t.id, label: t.shortLabel }))}
        activeTab={activeTab}
        onTabChange={onTabChange}
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
              subtitle={`of ${currentCapacity} capacity`}
            />
            <StatCard
              title="Net Growth"
              value={netGrowth >= 0 ? `+${netGrowth}` : `${netGrowth}`}
              subtitle={`+${totalNew} new, -${totalChurned} churned`}
            />
            <StatCard
              title="Client Utilization"
              value={`${clientUtilization.toFixed(0)}%`}
              subtitle="of client capacity filled"
            />
            <StatCard
              title="Session Utilization"
              value={`${avgSessionUtilization.toFixed(0)}%`}
              subtitle={`avg across ${hoursUtilizationData.length} months`}
            />
          </AnimatedGrid>
        </Section>

        {/* Main Charts Row */}
        <AnimatedSection delay={280}>
          <Section spacing="md">
            <Grid cols={2} gap="lg">
            {/* Client Utilization - Combo Chart */}
            <ChartCard
              title="Client Utilization"
              subtitle="Active clients & utilization rate over time"
              headerControls={
                <>
                  <div className="flex items-center gap-6 bg-stone-50 rounded-xl px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-md bg-gradient-to-b from-amber-400 to-amber-500 shadow-sm"></div>
                      <span className="text-stone-700 text-base font-semibold">Active Clients</span>
                    </div>
                    <div className="w-px h-6 bg-stone-200" />
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-1 bg-emerald-500 rounded-full"></div>
                      <span className="text-stone-700 text-base font-semibold">Utilization %</span>
                    </div>
                  </div>
                  <ActionButton label="View Report" icon={<ArrowRight size={16} />} />
                </>
              }
              expandable
              onExpand={() => setExpandedCard('client-utilization')}
              insights={clientUtilizationInsights}
              minHeight="520px"
            >
              <div style={{ width: '100%', height: '350px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={clientUtilizationChartData}
                    margin={{ top: 30, right: 80, bottom: 10, left: 20 }}
                  >
                    <defs>
                      <linearGradient id="activeClientsBarGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#fbbf24" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity={1}/>
                      </linearGradient>
                      <filter id="barShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15"/>
                      </filter>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="#e7e5e4" vertical={false} />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#57534e', fontSize: 15, fontWeight: 600 }}
                      dy={8}
                      height={30}
                    />
                    <YAxis
                      yAxisId="left"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#78716c', fontSize: 14, fontWeight: 600 }}
                      domain={[0, 200]}
                      width={50}
                      tickCount={5}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#059669', fontSize: 14, fontWeight: 700 }}
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                      width={60}
                      tickCount={5}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1c1917',
                        border: 'none',
                        borderRadius: '16px',
                        padding: '16px 20px',
                        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.4)'
                      }}
                      labelStyle={{ color: '#a8a29e', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}
                      itemStyle={{ color: '#fff', fontSize: '18px', fontWeight: 700, padding: '4px 0' }}
                      formatter={(value: number, name: string) => {
                        if (name === 'utilizationRate') return [`${value}%`, 'Utilization Rate'];
                        return [value, 'Active Clients'];
                      }}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="activeClients"
                      fill="url(#activeClientsBarGradient)"
                      radius={[8, 8, 0, 0]}
                      name="Active Clients"
                      maxBarSize={56}
                      style={{ filter: 'url(#barShadow)' }}
                      isAnimationActive={true}
                      animationDuration={800}
                      animationBegin={0}
                      animationEasing="ease-out"
                    >
                      <LabelList
                        dataKey="activeClients"
                        position="insideTop"
                        style={{ fill: '#ffffff', fontSize: '15px', fontWeight: 800, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                        offset={8}
                      />
                    </Bar>
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="utilizationRate"
                      stroke="#059669"
                      strokeWidth={4}
                      dot={{ fill: '#059669', strokeWidth: 4, stroke: '#fff', r: 7 }}
                      activeDot={{ r: 10, strokeWidth: 4, stroke: '#fff', fill: '#059669' }}
                      name="Utilization Rate"
                      isAnimationActive={true}
                      animationDuration={800}
                      animationBegin={0}
                      animationEasing="ease-out"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* Client Movement - Diverging Bar Chart */}
            <ChartCard
              title="Client Movement"
              subtitle="New acquisitions vs churned clients"
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
                  <ActionButton label="View Report" icon={<ArrowRight size={16} />} />
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

        {/* Session Utilization & Open Slots Row */}
        <AnimatedSection delay={480}>
          <Section spacing="none">
            <Grid cols={2} gap="lg">
              {/* Session Utilization Trend */}
              <SimpleChartCard
                title="Session Utilization"
                subtitle="Percentage of session capacity utilized"
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
                  tooltipFormatter={(value: number) => [`${value.toFixed(1)}%`, 'Utilization']}
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

      {/* Client Utilization Expanded */}
      <ExpandedChartModal
        isOpen={expandedCard === 'client-utilization'}
        onClose={() => setExpandedCard(null)}
        title="Client Utilization"
        subtitle="Active clients & utilization rate over time"
        headerControls={
          <>
            <div className="flex items-center gap-6 bg-stone-50 rounded-xl px-5 py-3">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-md bg-gradient-to-b from-amber-400 to-amber-500 shadow-sm"></div>
                <span className="text-stone-700 text-base font-semibold">Active Clients</span>
              </div>
              <div className="w-px h-6 bg-stone-200" />
              <div className="flex items-center gap-3">
                <div className="w-8 h-1 bg-emerald-500 rounded-full"></div>
                <span className="text-stone-700 text-base font-semibold">Utilization %</span>
              </div>
            </div>
            <ActionButton label="View Report" icon={<ArrowRight size={16} />} />
          </>
        }
        insights={clientUtilizationInsights}
      >
        <div style={{ width: '100%', height: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={clientUtilizationChartData}
              margin={{ top: 30, right: 80, bottom: 30, left: 40 }}
            >
              <defs>
                <linearGradient id="activeClientsBarGradientExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="#e7e5e4" vertical={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#57534e', fontSize: 18, fontWeight: 600 }}
                dy={12}
                height={50}
              />
              <YAxis
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#78716c', fontSize: 16, fontWeight: 600 }}
                domain={[0, 200]}
                width={60}
                tickCount={5}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#059669', fontSize: 16, fontWeight: 700 }}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                width={70}
                tickCount={5}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1c1917',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '20px 28px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}
                labelStyle={{ color: '#a8a29e', fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}
                itemStyle={{ color: '#fff', fontSize: '22px', fontWeight: 700 }}
                formatter={(value: number, name: string) => {
                  if (name === 'utilizationRate') return [`${value}%`, 'Utilization Rate'];
                  return [value, 'Active Clients'];
                }}
              />
              <Bar
                yAxisId="left"
                dataKey="activeClients"
                fill="url(#activeClientsBarGradientExp)"
                radius={[10, 10, 0, 0]}
                name="Active Clients"
                maxBarSize={80}
              >
                <LabelList
                  dataKey="activeClients"
                  position="insideTop"
                  style={{ fill: '#ffffff', fontSize: '18px', fontWeight: 800, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                  offset={10}
                />
              </Bar>
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="utilizationRate"
                stroke="#059669"
                strokeWidth={5}
                dot={{ fill: '#059669', strokeWidth: 5, stroke: '#fff', r: 10 }}
                activeDot={{ r: 14, strokeWidth: 5, stroke: '#fff', fill: '#059669' }}
                name="Utilization Rate"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </ExpandedChartModal>

      {/* Client Movement Expanded */}
      <ExpandedChartModal
        isOpen={expandedCard === 'client-movement'}
        onClose={() => setExpandedCard(null)}
        title="Client Movement"
        subtitle="New acquisitions vs churned clients"
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

      {/* Session Utilization Expanded */}
      <ExpandedChartModal
        isOpen={expandedCard === 'session-utilization'}
        onClose={() => setExpandedCard(null)}
        title="Session Utilization"
        subtitle="Percentage of session capacity utilized"
      >
        <LineChart
          data={sessionUtilizationChartData}
          xAxisKey="month"
          lines={[{ dataKey: 'percentage', color: '#3b82f6', activeColor: '#2563eb' }]}
          yDomain={[70, 100]}
          yTickFormatter={(v) => `${v}%`}
          tooltipFormatter={(value: number) => [`${value.toFixed(1)}%`, 'Utilization']}
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
