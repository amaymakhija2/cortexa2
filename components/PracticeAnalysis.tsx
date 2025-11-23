import React, { useState, useMemo } from 'react';
import { MetricChart } from './MetricChart';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, LabelList } from 'recharts';

type TabType = 'financial' | 'sessions' | 'client-growth' | 'retention' | 'admin';

// Full data set for all time periods
const ALL_REVENUE_DATA = [
  { month: 'Jan', value: 138000 },
  { month: 'Feb', value: 141500 },
  { month: 'Mar', value: 139800 },
  { month: 'Apr', value: 145200 },
  { month: 'May', value: 143600 },
  { month: 'Jun', value: 147800 },
  { month: 'Jul', value: 144200 },
  { month: 'Aug', value: 149500 },
  { month: 'Sep', value: 142500 },
  { month: 'Oct', value: 155200 },
  { month: 'Nov', value: 148900 },
  { month: 'Dec', value: 153400 }
];

const ALL_SESSIONS_DATA = [
  { month: 'Jan', value: 628 },
  { month: 'Feb', value: 641 },
  { month: 'Mar', value: 635 },
  { month: 'Apr', value: 658 },
  { month: 'May', value: 651 },
  { month: 'Jun', value: 672 },
  { month: 'Jul', value: 665 },
  { month: 'Aug', value: 689 },
  { month: 'Sep', value: 645 },
  { month: 'Oct', value: 712 },
  { month: 'Nov', value: 683 },
  { month: 'Dec', value: 698 }
];

// Full clinician breakdown data
const ALL_CLINICIAN_REVENUE_DATA = [
  { month: 'Jan', Chen: 33000, Rodriguez: 30500, Patel: 27000, Kim: 24000, Johnson: 23500 },
  { month: 'Feb', Chen: 34000, Rodriguez: 31000, Patel: 27500, Kim: 24500, Johnson: 24500 },
  { month: 'Mar', Chen: 33500, Rodriguez: 30800, Patel: 27200, Kim: 24300, Johnson: 24000 },
  { month: 'Apr', Chen: 35000, Rodriguez: 32000, Patel: 28000, Kim: 25200, Johnson: 25000 },
  { month: 'May', Chen: 34500, Rodriguez: 31500, Patel: 27800, Kim: 25000, Johnson: 24800 },
  { month: 'Jun', Chen: 36000, Rodriguez: 32500, Patel: 28500, Kim: 25500, Johnson: 25300 },
  { month: 'Jul', Chen: 35000, Rodriguez: 32000, Patel: 28000, Kim: 25000, Johnson: 24200 },
  { month: 'Aug', Chen: 36500, Rodriguez: 33000, Patel: 29000, Kim: 26000, Johnson: 25000 },
  { month: 'Sep', Chen: 35000, Rodriguez: 32000, Patel: 28500, Kim: 25000, Johnson: 22000 },
  { month: 'Oct', Chen: 38000, Rodriguez: 35200, Patel: 30000, Kim: 27000, Johnson: 25000 },
  { month: 'Nov', Chen: 36500, Rodriguez: 33900, Patel: 29000, Kim: 26000, Johnson: 23500 },
  { month: 'Dec', Chen: 37500, Rodriguez: 34900, Patel: 30000, Kim: 27000, Johnson: 24000 }
];

// Revenue breakdown data - where the money goes (with more variability for interesting trends)
const ALL_REVENUE_BREAKDOWN_DATA = [
  { month: 'Jan', grossRevenue: 138000, clinicianCosts: 103500, supervisorCosts: 11040, creditCardFees: 4140, netRevenue: 19320 }, // 14% net, 75% clinician
  { month: 'Feb', grossRevenue: 141500, clinicianCosts: 98045, supervisorCosts: 15695, creditCardFees: 4245, netRevenue: 23515 }, // 16.6% net, 69.3% clinician (supervisor cost spike)
  { month: 'Mar', grossRevenue: 139800, clinicianCosts: 97860, supervisorCosts: 13980, creditCardFees: 5592, netRevenue: 22368 }, // 16% net, 70% clinician (CC fee spike)
  { month: 'Apr', grossRevenue: 145200, clinicianCosts: 108900, supervisorCosts: 13068, creditCardFees: 4356, netRevenue: 18876 }, // 13% net, 75% clinician (clinician cost spike)
  { month: 'May', grossRevenue: 143600, clinicianCosts: 100520, supervisorCosts: 12888, creditCardFees: 4308, netRevenue: 25884 }, // 18% net, 70% clinician (good margin!)
  { month: 'Jun', grossRevenue: 147800, clinicianCosts: 106928, supervisorCosts: 11824, creditCardFees: 4434, netRevenue: 24614 }, // 16.7% net, 72.4% clinician
  { month: 'Jul', grossRevenue: 144200, clinicianCosts: 101276, supervisorCosts: 17304, creditCardFees: 4326, netRevenue: 21294 }, // 14.8% net, 70.2% clinician (supervisor spike)
  { month: 'Aug', grossRevenue: 149500, clinicianCosts: 104650, supervisorCosts: 13455, creditCardFees: 5980, netRevenue: 25415 }, // 17% net, 70% clinician (CC fees up)
  { month: 'Sep', grossRevenue: 142500, clinicianCosts: 99750, supervisorCosts: 14250, creditCardFees: 4275, netRevenue: 24225 }, // 17% net, 70% clinician
  { month: 'Oct', grossRevenue: 155200, clinicianCosts: 117152, supervisorCosts: 13968, creditCardFees: 4656, netRevenue: 19424 }, // 12.5% net, 75.5% clinician (clinician costs high)
  { month: 'Nov', grossRevenue: 148900, clinicianCosts: 101693, supervisorCosts: 16379, creditCardFees: 4467, netRevenue: 26361 }, // 17.7% net, 68.3% clinician (great margin!)
  { month: 'Dec', grossRevenue: 153400, clinicianCosts: 104312, supervisorCosts: 15340, creditCardFees: 6136, netRevenue: 27612 }  // 18% net, 68% clinician (best month!)
];

type TimePeriod = 'last-4-months' | 'last-6-months' | 'last-12-months' | 'ytd';

export const PracticeAnalysis: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('financial');
  const [hoveredSessionValue, setHoveredSessionValue] = useState<number | null>(null);
  const [hoveredYTDValue, setHoveredYTDValue] = useState<number | null>(null);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('last-4-months');

  const tabs: { id: TabType; label: string; shortLabel: string }[] = [
    { id: 'financial', label: 'Financial Analysis', shortLabel: 'Financial' },
    { id: 'sessions', label: 'Sessions Analysis', shortLabel: 'Sessions' },
    { id: 'client-growth', label: 'Client Growth Analysis', shortLabel: 'Client Growth' },
    { id: 'retention', label: 'Retention Analysis', shortLabel: 'Retention' },
    { id: 'admin', label: 'Admin Analysis', shortLabel: 'Admin' }
  ];

  const timePeriods: { id: TimePeriod; label: string }[] = [
    { id: 'last-4-months', label: 'Last 4 months' },
    { id: 'last-6-months', label: 'Last 6 months' },
    { id: 'last-12-months', label: 'Last 12 months' },
    { id: 'ytd', label: 'Year to date' }
  ];

  // Filter data based on selected time period
  const getDataForPeriod = <T,>(data: T[], period: TimePeriod): T[] => {
    switch (period) {
      case 'last-4-months':
        return data.slice(-4);
      case 'last-6-months':
        return data.slice(-6);
      case 'last-12-months':
        return data.slice(-12);
      case 'ytd':
        return data; // Full year data
      default:
        return data.slice(-4);
    }
  };

  // Memoized filtered data
  const REVENUE_DATA = useMemo(() => getDataForPeriod(ALL_REVENUE_DATA, timePeriod), [timePeriod]);
  const SESSIONS_DATA = useMemo(() => getDataForPeriod(ALL_SESSIONS_DATA, timePeriod), [timePeriod]);
  const CLINICIAN_REVENUE_DATA = useMemo(() => getDataForPeriod(ALL_CLINICIAN_REVENUE_DATA, timePeriod), [timePeriod]);
  const REVENUE_BREAKDOWN_DATA = useMemo(() => getDataForPeriod(ALL_REVENUE_BREAKDOWN_DATA, timePeriod), [timePeriod]);

  // Calculate session value and cumulative revenue for charts
  const SESSION_VALUE_DATA = useMemo(() =>
    REVENUE_DATA.map((rev, idx) => ({
      month: rev.month,
      value: parseFloat((rev.value / SESSIONS_DATA[idx].value).toFixed(2))
    })),
    [REVENUE_DATA, SESSIONS_DATA]
  );

  const YTD_REVENUE_DATA = useMemo(() =>
    REVENUE_DATA.map((_, idx) => ({
      month: REVENUE_DATA[idx].month,
      value: REVENUE_DATA.slice(0, idx + 1).reduce((sum, item) => sum + item.value, 0)
    })),
    [REVENUE_DATA]
  );

  const formatCurrency = (value: number) => `$${(value / 1000).toFixed(1)}k`;

  return (
    <div className="flex-1 p-8 pt-2 overflow-y-auto h-[calc(100vh-80px)]">

      {/* Title Section */}
      <div className="mb-6">
        <h2 className="text-gray-500 text-sm font-medium mb-1">DETAILED INSIGHTS</h2>
        <h1 className="text-4xl font-normal text-gray-900 tracking-tight">Practice Detailed Analysis</h1>
      </div>

      {/* Time Period Selector */}
      <div className="mb-6 flex items-center gap-3">
        <span className="text-sm font-medium text-gray-600">Time Period:</span>
        <div
          className="inline-flex items-center gap-1 bg-gradient-to-b from-white via-white to-white/95 rounded-full p-1.5 shadow-lg ring-1 ring-slate-200/50"
          style={{
            boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 0 rgba(255, 255, 255, 0.8)'
          }}
        >
          {timePeriods.map((period) => (
            <button
              key={period.id}
              onClick={() => setTimePeriod(period.id)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                timePeriod === period.id
                  ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white shadow-xl'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              style={timePeriod === period.id ? {
                boxShadow: '0 8px 30px -8px rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)'
              } : undefined}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-6 py-3 rounded-full text-base font-medium transition-all
              ${activeTab === tab.id
                ? 'bg-black text-white'
                : 'bg-black text-white opacity-50 hover:opacity-70'
              }
            `}
          >
            {activeTab === tab.id ? tab.label : tab.shortLabel}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'financial' && (
        <div className="flex flex-col gap-6 overflow-y-auto">
          {/* Top Row - Charts - Full viewport height */}
          <div className="flex gap-6 flex-shrink-0" style={{ height: 'calc(100vh - 400px)' }}>
            <div className="w-[55%]" style={{ height: '100%' }}>
              <MetricChart
                title="Gross Revenue"
                data={REVENUE_DATA}
                valueFormatter={formatCurrency}
                goal={150000}
                clinicianData={CLINICIAN_REVENUE_DATA}
                breakdownData={REVENUE_BREAKDOWN_DATA}
                timePeriod={timePeriod}
              />
            </div>

            {/* Right Side Metrics */}
            <div className="flex flex-col gap-6 w-[45%]" style={{ height: '100%' }}>
            <div className="flex gap-4 flex-shrink-0">
              {/* Average Session Value - Compact */}
              <div className="bg-gradient-to-br from-white via-white to-slate-50/20 rounded-[20px] flex flex-col shadow-2xl border-2 border-[#2d6e7e] relative overflow-hidden group hover:shadow-[0_20px_70px_-10px_rgba(45,110,126,0.3)] transition-all duration-300 flex-1"
                style={{
                  boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                <div className="relative z-10 px-5 pt-5 pb-2">
                  <div className="text-gray-500 text-[10px] font-semibold uppercase tracking-widest mb-2">ANALYTICS</div>
                  <h3 className="text-gray-900 text-lg font-semibold mb-2">Avg Session Value</h3>
                  <div className="text-2xl font-bold text-gray-900 tracking-tight transition-all duration-200">
                    ${hoveredSessionValue !== null
                      ? hoveredSessionValue.toFixed(2)
                      : ((REVENUE_DATA.reduce((sum, item) => sum + item.value, 0) / SESSIONS_DATA.reduce((sum, item) => sum + item.value, 0)).toFixed(2))
                    }
                  </div>
                </div>

                <div className="relative z-10 px-3 pb-2" style={{ height: '110px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={SESSION_VALUE_DATA}
                      margin={{ top: 20, right: 10, bottom: 5, left: 5 }}
                      onMouseMove={(e: any) => {
                        if (e.activePayload && e.activePayload[0]) {
                          setHoveredSessionValue(e.activePayload[0].value);
                        }
                      }}
                      onMouseLeave={() => setHoveredSessionValue(null)}
                    >
                      <defs>
                        <linearGradient id="sessionValueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2d6e7e" stopOpacity={0.2}/>
                          <stop offset="100%" stopColor="#2d6e7e" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 600 }}
                        dy={3}
                      />
                      <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '10px 14px',
                          boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.3)'
                        }}
                        labelStyle={{ color: '#9ca3af', fontSize: '11px', fontWeight: 600, marginBottom: '3px' }}
                        itemStyle={{ color: '#fff', fontSize: '14px', fontWeight: 700 }}
                        formatter={(value: number) => [`$${value.toFixed(2)}`, 'Value']}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#2d6e7e"
                        strokeWidth={2.5}
                        dot={{ fill: '#2d6e7e', strokeWidth: 2, stroke: '#fff', r: 3 }}
                        activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                        fill="url(#sessionValueGradient)"
                      >
                        <LabelList
                          dataKey="value"
                          position="top"
                          formatter={(value: number) => `$${value.toFixed(0)}`}
                          style={{ fill: '#1f2937', fontSize: '10px', fontWeight: 700 }}
                        />
                      </Line>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* YTD Revenue - Compact */}
              <div className="bg-gradient-to-br from-white via-white to-slate-50/20 rounded-[20px] flex flex-col shadow-2xl border-2 border-[#2d6e7e] relative overflow-hidden group hover:shadow-[0_20px_70px_-10px_rgba(45,110,126,0.3)] transition-all duration-300 flex-1"
                style={{
                  boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                <div className="relative z-10 px-5 pt-5 pb-2">
                  <div className="text-gray-500 text-[10px] font-semibold uppercase tracking-widest mb-2">ANALYTICS</div>
                  <h3 className="text-gray-900 text-lg font-semibold mb-2">YTD Revenue</h3>
                  <div className="text-2xl font-bold text-gray-900 tracking-tight transition-all duration-200">
                    ${hoveredYTDValue !== null
                      ? (hoveredYTDValue / 1000).toFixed(0)
                      : ((REVENUE_DATA.reduce((sum, item) => sum + item.value, 0)) / 1000).toFixed(0)
                    }k
                  </div>
                </div>

                <div className="relative z-10 px-3 pb-2" style={{ height: '110px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={YTD_REVENUE_DATA}
                      margin={{ top: 20, right: 10, bottom: 5, left: 5 }}
                      onMouseMove={(e: any) => {
                        if (e.activePayload && e.activePayload[0]) {
                          setHoveredYTDValue(e.activePayload[0].value);
                        }
                      }}
                      onMouseLeave={() => setHoveredYTDValue(null)}
                    >
                      <defs>
                        <linearGradient id="ytdRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2d6e7e" stopOpacity={0.2}/>
                          <stop offset="100%" stopColor="#2d6e7e" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 600 }}
                        dy={3}
                      />
                      <YAxis hide domain={['dataMin - 50000', 'dataMax + 50000']} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '10px 14px',
                          boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.3)'
                        }}
                        labelStyle={{ color: '#9ca3af', fontSize: '11px', fontWeight: 600, marginBottom: '3px' }}
                        itemStyle={{ color: '#fff', fontSize: '14px', fontWeight: 700 }}
                        formatter={(value: number) => [`$${(value / 1000).toFixed(0)}k`, 'YTD']}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#2d6e7e"
                        strokeWidth={2.5}
                        dot={{ fill: '#2d6e7e', strokeWidth: 2, stroke: '#fff', r: 3 }}
                        activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                        fill="url(#ytdRevenueGradient)"
                      >
                        <LabelList
                          dataKey="value"
                          position="top"
                          formatter={(value: number) => `$${(value / 1000).toFixed(0)}k`}
                          style={{ fill: '#1f2937', fontSize: '10px', fontWeight: 700 }}
                        />
                      </Line>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Margins Chart */}
            <div className="bg-gradient-to-br from-white via-white to-slate-50/20 rounded-[24px] flex flex-col flex-1 shadow-2xl border-2 border-[#2d6e7e] relative overflow-hidden group hover:shadow-[0_20px_70px_-10px_rgba(45,110,126,0.3)] transition-all duration-300"
              style={{
                boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

              <div className="relative z-10 px-6 pt-6 pb-4 flex-shrink-0">
                <div className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-2">ANALYTICS</div>
                <h3 className="text-gray-900 text-2xl font-semibold mb-4">Revenue Margins</h3>

                {/* Legend */}
                <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#10b981]"></div>
                    <span className="text-xs font-medium text-gray-700">Net Margin</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div>
                    <span className="text-xs font-medium text-gray-700">Clinician</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
                    <span className="text-xs font-medium text-gray-700">Supervisor</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
                    <span className="text-xs font-medium text-gray-700">Credit Card</span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 px-4 pb-4 flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={REVENUE_BREAKDOWN_DATA.map(item => ({
                      month: item.month,
                      netMargin: ((item.netRevenue / item.grossRevenue) * 100),
                      clinicianMargin: ((item.clinicianCosts / item.grossRevenue) * 100),
                      supervisorMargin: ((item.supervisorCosts / item.grossRevenue) * 100),
                      creditCardMargin: ((item.creditCardFees / item.grossRevenue) * 100)
                    }))}
                    margin={{ top: 10, right: 20, bottom: 5, left: 0 }}
                  >
                    <defs>
                      <linearGradient id="netMarginGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="clinicianMarginGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2}/>
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="supervisorMarginGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.2}/>
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="creditCardMarginGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.2}/>
                        <stop offset="100%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                      dy={5}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 600 }}
                      tickFormatter={(value) => `${value}%`}
                      domain={[0, 100]}
                      ticks={[0, 25, 50, 75, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.3)'
                      }}
                      labelStyle={{ color: '#9ca3af', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}
                      itemStyle={{ color: '#fff', fontSize: '14px', fontWeight: 700 }}
                      formatter={(value: number) => `${value.toFixed(1)}%`}
                    />
                    <Line
                      type="monotone"
                      dataKey="netMargin"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={{ fill: '#10b981', strokeWidth: 2, stroke: '#fff', r: 4 }}
                      activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                      name="Net Margin"
                    />
                    <Line
                      type="monotone"
                      dataKey="clinicianMargin"
                      stroke="#3b82f6"
                      strokeWidth={2.5}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, stroke: '#fff', r: 4 }}
                      activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                      name="Clinician Costs"
                    />
                    <Line
                      type="monotone"
                      dataKey="supervisorMargin"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      dot={{ fill: '#f59e0b', strokeWidth: 2, stroke: '#fff', r: 4 }}
                      activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                      name="Supervisor Costs"
                    />
                    <Line
                      type="monotone"
                      dataKey="creditCardMargin"
                      stroke="#ef4444"
                      strokeWidth={2.5}
                      dot={{ fill: '#ef4444', strokeWidth: 2, stroke: '#fff', r: 4 }}
                      activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                      name="Credit Card Fees"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            </div>
          </div>

          {/* Revenue Breakdown Table - Below the fold */}
          <div className="bg-gradient-to-br from-white via-white to-slate-50/20 rounded-[24px] shadow-2xl border-2 border-[#2d6e7e] relative overflow-hidden group hover:shadow-[0_20px_70px_-10px_rgba(45,110,126,0.3)] transition-all duration-300"
            style={{
              boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

            <div className="relative z-10 px-6 pt-6 pb-6">
              <div className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-2">FINANCIAL BREAKDOWN</div>
              <h3 className="text-gray-900 text-2xl font-semibold mb-4">Revenue Allocation</h3>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Month</th>
                      <th className="text-right py-3 px-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Gross Revenue</th>
                      <th className="text-right py-3 px-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Clinician Cost</th>
                      <th className="text-right py-3 px-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Supervisor Cost</th>
                      <th className="text-right py-3 px-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Credit Card Fees</th>
                      <th className="text-right py-3 px-2 text-xs font-bold text-green-700 uppercase tracking-wider">Net Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {REVENUE_BREAKDOWN_DATA.map((item, idx) => (
                      <tr key={item.month} className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${idx === REVENUE_BREAKDOWN_DATA.length - 1 ? 'border-b-0' : ''}`}>
                        <td className="py-3 px-2 text-sm font-semibold text-gray-900">{item.month}</td>
                        <td className="py-3 px-2 text-sm font-semibold text-gray-900 text-right">${(item.grossRevenue / 1000).toFixed(1)}k</td>
                        <td className="py-3 px-2 text-sm text-blue-600 text-right">${(item.clinicianCosts / 1000).toFixed(1)}k</td>
                        <td className="py-3 px-2 text-sm text-amber-600 text-right">${(item.supervisorCosts / 1000).toFixed(1)}k</td>
                        <td className="py-3 px-2 text-sm text-red-600 text-right">${(item.creditCardFees / 1000).toFixed(1)}k</td>
                        <td className="py-3 px-2 text-sm font-bold text-green-700 text-right">${(item.netRevenue / 1000).toFixed(1)}k</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-200 bg-gray-50/30">
                      <td className="py-3 px-2 text-sm font-bold text-gray-900">Total</td>
                      <td className="py-3 px-2 text-sm font-bold text-gray-900 text-right">
                        ${(REVENUE_BREAKDOWN_DATA.reduce((sum, item) => sum + item.grossRevenue, 0) / 1000).toFixed(1)}k
                      </td>
                      <td className="py-3 px-2 text-sm font-bold text-blue-600 text-right">
                        ${(REVENUE_BREAKDOWN_DATA.reduce((sum, item) => sum + item.clinicianCosts, 0) / 1000).toFixed(1)}k
                      </td>
                      <td className="py-3 px-2 text-sm font-bold text-amber-600 text-right">
                        ${(REVENUE_BREAKDOWN_DATA.reduce((sum, item) => sum + item.supervisorCosts, 0) / 1000).toFixed(1)}k
                      </td>
                      <td className="py-3 px-2 text-sm font-bold text-red-600 text-right">
                        ${(REVENUE_BREAKDOWN_DATA.reduce((sum, item) => sum + item.creditCardFees, 0) / 1000).toFixed(1)}k
                      </td>
                      <td className="py-3 px-2 text-sm font-bold text-green-700 text-right">
                        ${(REVENUE_BREAKDOWN_DATA.reduce((sum, item) => sum + item.netRevenue, 0) / 1000).toFixed(1)}k
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="flex flex-col gap-6 h-[calc(100%-240px)]">
          <div className="w-1/2 h-full">
            <MetricChart
              title="Total Sessions"
              data={SESSIONS_DATA}
              goal={700}
              timePeriod={timePeriod}
            />
          </div>
        </div>
      )}

      {activeTab !== 'financial' && activeTab !== 'sessions' && (
        <div className="bg-white rounded-3xl p-8 shadow-sm min-h-[500px]">
          {activeTab === 'client-growth' && (
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Client Growth</h3>
              <p className="text-gray-600">Client growth analysis content goes here...</p>
            </div>
          )}

          {activeTab === 'retention' && (
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Retention</h3>
              <p className="text-gray-600">Retention analysis content goes here...</p>
            </div>
          )}

          {activeTab === 'admin' && (
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Admin</h3>
              <p className="text-gray-600">Admin analysis content goes here...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};