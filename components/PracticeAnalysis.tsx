import React, { useState, useMemo } from 'react';
import { MetricChart } from './MetricChart';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, LabelList, Legend, CartesianGrid, ReferenceLine } from 'recharts';
import { Info, Calendar, X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

type TabType = 'financial' | 'sessions' | 'capacity-client' | 'retention' | 'admin';

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
  { month: 'Jan', completed: 628, booked: 658, clients: 142, cancelled: 113, clinicianCancelled: 23, lateCancelled: 24, noShow: 7, show: 493 },
  { month: 'Feb', completed: 641, booked: 672, clients: 145, cancelled: 115, clinicianCancelled: 23, lateCancelled: 25, noShow: 8, show: 501 },
  { month: 'Mar', completed: 635, booked: 668, clients: 143, cancelled: 115, clinicianCancelled: 23, lateCancelled: 24, noShow: 8, show: 498 },
  { month: 'Apr', completed: 658, booked: 695, clients: 148, cancelled: 119, clinicianCancelled: 24, lateCancelled: 25, noShow: 8, show: 519 },
  { month: 'May', completed: 651, booked: 685, clients: 146, cancelled: 117, clinicianCancelled: 24, lateCancelled: 25, noShow: 8, show: 511 },
  { month: 'Jun', completed: 672, booked: 708, clients: 151, cancelled: 121, clinicianCancelled: 25, lateCancelled: 26, noShow: 8, show: 528 },
  { month: 'Jul', completed: 665, booked: 698, clients: 149, cancelled: 120, clinicianCancelled: 24, lateCancelled: 25, noShow: 8, show: 521 },
  { month: 'Aug', completed: 689, booked: 725, clients: 154, cancelled: 124, clinicianCancelled: 25, lateCancelled: 27, noShow: 8, show: 541 },
  { month: 'Sep', completed: 645, booked: 678, clients: 147, cancelled: 116, clinicianCancelled: 23, lateCancelled: 24, noShow: 8, show: 507 },
  { month: 'Oct', completed: 712, booked: 748, clients: 158, cancelled: 128, clinicianCancelled: 26, lateCancelled: 27, noShow: 8, show: 559 },
  { month: 'Nov', completed: 683, booked: 718, clients: 152, cancelled: 123, clinicianCancelled: 25, lateCancelled: 26, noShow: 8, show: 536 },
  { month: 'Dec', completed: 698, booked: 732, clients: 155, cancelled: 125, clinicianCancelled: 25, lateCancelled: 26, noShow: 8, show: 548 }
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

// Client growth data - active clients with breakdown of retained vs new, plus capacity
const ALL_CLIENT_GROWTH_DATA = [
  { month: 'Jan', activeClients: 142, capacity: 175, retained: 135, new: 7, churned: 5, withNextAppt: 128 },
  { month: 'Feb', activeClients: 145, capacity: 175, retained: 140, new: 5, churned: 3, withNextAppt: 131 },
  { month: 'Mar', activeClients: 143, capacity: 175, retained: 138, new: 5, churned: 7, withNextAppt: 129 },
  { month: 'Apr', activeClients: 148, capacity: 180, retained: 140, new: 8, churned: 3, withNextAppt: 134 },
  { month: 'May', activeClients: 146, capacity: 180, retained: 143, new: 3, churned: 5, withNextAppt: 132 },
  { month: 'Jun', activeClients: 151, capacity: 180, retained: 143, new: 8, churned: 3, withNextAppt: 137 },
  { month: 'Jul', activeClients: 149, capacity: 180, retained: 146, new: 3, churned: 5, withNextAppt: 135 },
  { month: 'Aug', activeClients: 154, capacity: 180, retained: 147, new: 7, churned: 2, withNextAppt: 140 },
  { month: 'Sep', activeClients: 147, capacity: 180, retained: 143, new: 4, churned: 11, withNextAppt: 133 },
  { month: 'Oct', activeClients: 158, capacity: 180, retained: 145, new: 13, churned: 2, withNextAppt: 143 },
  { month: 'Nov', activeClients: 152, capacity: 180, retained: 150, new: 2, churned: 8, withNextAppt: 138 },
  { month: 'Dec', activeClients: 156, capacity: 180, retained: 149, new: 7, churned: 3, withNextAppt: 142 }
];

// Churn by clinician data - shows which clinicians are losing clients each month
const ALL_CHURN_BY_CLINICIAN_DATA = [
  { month: 'Jan', Chen: 2, Rodriguez: 1, Patel: 1, Kim: 0, Johnson: 1, total: 5 },
  { month: 'Feb', Chen: 1, Rodriguez: 0, Patel: 1, Kim: 0, Johnson: 1, total: 3 },
  { month: 'Mar', Chen: 2, Rodriguez: 1, Patel: 2, Kim: 1, Johnson: 1, total: 7 },
  { month: 'Apr', Chen: 1, Rodriguez: 0, Patel: 1, Kim: 0, Johnson: 1, total: 3 },
  { month: 'May', Chen: 2, Rodriguez: 1, Patel: 1, Kim: 0, Johnson: 1, total: 5 },
  { month: 'Jun', Chen: 1, Rodriguez: 0, Patel: 1, Kim: 0, Johnson: 1, total: 3 },
  { month: 'Jul', Chen: 2, Rodriguez: 1, Patel: 1, Kim: 0, Johnson: 1, total: 5 },
  { month: 'Aug', Chen: 0, Rodriguez: 0, Patel: 1, Kim: 0, Johnson: 1, total: 2 },
  { month: 'Sep', Chen: 3, Rodriguez: 2, Patel: 3, Kim: 2, Johnson: 1, total: 11 }, // High churn month
  { month: 'Oct', Chen: 1, Rodriguez: 0, Patel: 0, Kim: 0, Johnson: 1, total: 2 },
  { month: 'Nov', Chen: 2, Rodriguez: 2, Patel: 2, Kim: 1, Johnson: 1, total: 8 },
  { month: 'Dec', Chen: 1, Rodriguez: 0, Patel: 1, Kim: 0, Johnson: 1, total: 3 }
];

// Churn timing breakdown data (early churn = 0-3 months, medium = 4-8 months, late = 9+ months)
const ALL_CHURN_TIMING_DATA = [
  { month: 'Jan', earlyChurn: 2, mediumChurn: 2, lateChurn: 1 },
  { month: 'Feb', earlyChurn: 1, mediumChurn: 1, lateChurn: 1 },
  { month: 'Mar', earlyChurn: 3, mediumChurn: 2, lateChurn: 2 },
  { month: 'Apr', earlyChurn: 1, mediumChurn: 1, lateChurn: 1 },
  { month: 'May', earlyChurn: 2, mediumChurn: 2, lateChurn: 1 },
  { month: 'Jun', earlyChurn: 1, mediumChurn: 1, lateChurn: 1 },
  { month: 'Jul', earlyChurn: 2, mediumChurn: 2, lateChurn: 1 },
  { month: 'Aug', earlyChurn: 1, mediumChurn: 1, lateChurn: 0 },
  { month: 'Sep', earlyChurn: 5, mediumChurn: 4, lateChurn: 2 },
  { month: 'Oct', earlyChurn: 1, mediumChurn: 1, lateChurn: 0 },
  { month: 'Nov', earlyChurn: 3, mediumChurn: 3, lateChurn: 2 },
  { month: 'Dec', earlyChurn: 1, mediumChurn: 1, lateChurn: 1 }
];

type TimePeriod = 'last-4-months' | 'last-6-months' | 'last-12-months' | 'ytd' | 'custom';

// Month name to index mapping for date comparison
const MONTH_MAP: { [key: string]: number } = {
  'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
  'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
};

export const PracticeAnalysis: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('financial');
  const [hoveredSessionValue, setHoveredSessionValue] = useState<number | null>(null);
  const [hoveredYTDValue, setHoveredYTDValue] = useState<number | null>(null);
  const [hoveredWeeklySessions, setHoveredWeeklySessions] = useState<number | null>(null);
  const [hoveredAvgSessionsPerClient, setHoveredAvgSessionsPerClient] = useState<number | null>(null);
  const [hoveredUtilization, setHoveredUtilization] = useState<number | null>(null);
  const [hoveredOpenSlots, setHoveredOpenSlots] = useState<number | null>(null);
  const [hoveredHoursUtilization, setHoveredHoursUtilization] = useState<number | null>(null);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('last-4-months');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date | null>(new Date(2025, 0, 1)); // Jan 1, 2025
  const [customEndDate, setCustomEndDate] = useState<Date | null>(new Date(2025, 11, 31)); // Dec 31, 2025
  const [showClientBreakdown, setShowClientBreakdown] = useState(false);

  const tabs: { id: TabType; label: string; shortLabel: string }[] = [
    { id: 'financial', label: 'Financial Analysis', shortLabel: 'Financial' },
    { id: 'sessions', label: 'Sessions Analysis', shortLabel: 'Sessions' },
    { id: 'capacity-client', label: 'Capacity & Client Analysis', shortLabel: 'Capacity & Client' },
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
  const getDataForPeriod = <T extends { month: string }>(data: T[], period: TimePeriod): T[] => {
    switch (period) {
      case 'last-4-months':
        return data.slice(-4);
      case 'last-6-months':
        return data.slice(-6);
      case 'last-12-months':
        return data.slice(-12);
      case 'ytd':
        return data; // Full year data
      case 'custom':
        if (!customStartDate || !customEndDate) return data;
        // For now, since we only have 2025 data, we'll filter by month
        const startMonth = customStartDate.getMonth();
        const endMonth = customEndDate.getMonth();
        return data.filter((item) => {
          const itemIndex = MONTH_MAP[item.month];
          return itemIndex >= startMonth && itemIndex <= endMonth;
        });
      default:
        return data.slice(-4);
    }
  };

  const applyCustomRange = () => {
    setTimePeriod('custom');
    setShowDatePicker(false);
  };

  const formatDateRange = () => {
    if (!customStartDate || !customEndDate) return 'Custom Range';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[customStartDate.getMonth()]} ${customStartDate.getFullYear()} - ${months[customEndDate.getMonth()]} ${customEndDate.getFullYear()}`;
  };

  // Memoized filtered data
  const REVENUE_DATA = useMemo(() => getDataForPeriod(ALL_REVENUE_DATA, timePeriod), [timePeriod, customStartDate, customEndDate]);
  const SESSIONS_DATA = useMemo(() => getDataForPeriod(ALL_SESSIONS_DATA, timePeriod), [timePeriod, customStartDate, customEndDate]);
  const CLINICIAN_REVENUE_DATA = useMemo(() => getDataForPeriod(ALL_CLINICIAN_REVENUE_DATA, timePeriod), [timePeriod, customStartDate, customEndDate]);
  const REVENUE_BREAKDOWN_DATA = useMemo(() => getDataForPeriod(ALL_REVENUE_BREAKDOWN_DATA, timePeriod), [timePeriod, customStartDate, customEndDate]);
  const CLIENT_GROWTH_DATA = useMemo(() => getDataForPeriod(ALL_CLIENT_GROWTH_DATA, timePeriod), [timePeriod, customStartDate, customEndDate]);
  const CHURN_BY_CLINICIAN_DATA = useMemo(() => getDataForPeriod(ALL_CHURN_BY_CLINICIAN_DATA, timePeriod), [timePeriod, customStartDate, customEndDate]);
  const CHURN_TIMING_DATA = useMemo(() => getDataForPeriod(ALL_CHURN_TIMING_DATA, timePeriod), [timePeriod, customStartDate, customEndDate]);

  // Calculate session value and cumulative revenue for charts
  const SESSION_VALUE_DATA = useMemo(() =>
    REVENUE_DATA.map((rev, idx) => ({
      month: rev.month,
      value: parseFloat((rev.value / SESSIONS_DATA[idx].completed).toFixed(2))
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

  // Calculate weekly sessions and clients data for sessions tab
  const AVG_WEEKLY_SESSIONS_DATA = useMemo(() =>
    SESSIONS_DATA.map((item) => ({
      month: item.month,
      value: parseFloat((item.completed / 4.33).toFixed(1)) // Average weeks per month
    })),
    [SESSIONS_DATA]
  );

  const AVG_SESSIONS_PER_CLIENT_DATA = useMemo(() =>
    SESSIONS_DATA.map((item) => ({
      month: item.month,
      value: parseFloat((item.completed / item.clients).toFixed(2))
    })),
    [SESSIONS_DATA]
  );

  // Calculate practice utilization percentage (completed / booked * 100)
  const UTILIZATION_DATA = useMemo(() =>
    SESSIONS_DATA.map((item) => ({
      month: item.month,
      value: parseFloat(((item.completed / item.booked) * 100).toFixed(1))
    })),
    [SESSIONS_DATA]
  );

  // Calculate open slots (booked - completed = cancelled/no-show slots that could be filled)
  const OPEN_SLOTS_DATA = useMemo(() =>
    SESSIONS_DATA.map((item) => ({
      month: item.month,
      value: item.booked - item.completed
    })),
    [SESSIONS_DATA]
  );

  // Calculate hours utilization (assuming 1 hour per session, 160 available hours per month per clinician, 5 clinicians)
  // Total available hours = 160 * 5 = 800 hours/month
  const HOURS_UTILIZATION_DATA = useMemo(() =>
    SESSIONS_DATA.map((item) => ({
      month: item.month,
      utilized: item.completed, // Assuming 1 hour per session
      available: 800, // 160 hours/clinician * 5 clinicians
      percentage: parseFloat(((item.completed / 800) * 100).toFixed(1))
    })),
    [SESSIONS_DATA]
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
      <div className="mb-6 flex items-center gap-3 relative">
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

          {/* Custom Date Range Button */}
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
              timePeriod === 'custom'
                ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white shadow-xl'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            style={timePeriod === 'custom' ? {
              boxShadow: '0 8px 30px -8px rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)'
            } : undefined}
          >
            <Calendar size={16} />
            {timePeriod === 'custom' ? formatDateRange() : 'Custom Range'}
          </button>
        </div>

        {/* Custom Date Picker Modal */}
        {showDatePicker && (
          <div className="absolute top-14 left-28 z-[100000] bg-white rounded-2xl shadow-2xl border-2 border-[#2d6e7e] p-6"
            style={{
              boxShadow: '0 20px 60px -10px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.02)'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Select Date Range</h4>
              <button
                onClick={() => setShowDatePicker(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Start Date</label>
                <DatePicker
                  selected={customStartDate}
                  onChange={(date) => setCustomStartDate(date)}
                  selectsStart
                  startDate={customStartDate}
                  endDate={customEndDate}
                  dateFormat="MMM yyyy"
                  showMonthYearPicker
                  inline
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">End Date</label>
                <DatePicker
                  selected={customEndDate}
                  onChange={(date) => setCustomEndDate(date)}
                  selectsEnd
                  startDate={customStartDate}
                  endDate={customEndDate}
                  minDate={customStartDate}
                  dateFormat="MMM yyyy"
                  showMonthYearPicker
                  inline
                />
              </div>
            </div>

            <button
              onClick={applyCustomRange}
              className="w-full px-5 py-3 bg-gradient-to-br from-[#2d6e7e] to-[#245563] text-white rounded-lg font-semibold shadow-md hover:shadow-xl transition-all duration-200"
              style={{
                boxShadow: '0 8px 30px -8px rgba(45, 110, 126, 0.4)'
              }}
            >
              Apply Range
            </button>
          </div>
        )}
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

                <div className="relative px-5 pt-5 pb-2">
                  <div className="text-gray-500 text-[10px] font-semibold uppercase tracking-widest mb-2">ANALYTICS</div>
                  <h3 className="text-gray-900 text-lg font-semibold mb-2 flex items-center gap-2">
                    Avg Session Value
                    <div className="group/info relative z-[100000]">
                      <Info size={14} className="text-[#2d6e7e] cursor-help" />
                      <div className="absolute left-0 top-6 invisible group-hover/info:visible opacity-0 group-hover/info:opacity-100 transition-all duration-200 w-64 z-[100000]">
                        <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
                          <p className="font-medium mb-1">Average Session Value</p>
                          <p className="text-gray-300">Shows the average revenue generated per completed session. This helps you understand your pricing effectiveness and revenue per appointment over time.</p>
                          <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                        </div>
                      </div>
                    </div>
                  </h3>
                  <div className="text-2xl font-bold text-gray-900 tracking-tight transition-all duration-200">
                    ${hoveredSessionValue !== null
                      ? hoveredSessionValue.toFixed(2)
                      : ((REVENUE_DATA.reduce((sum, item) => sum + item.value, 0) / SESSIONS_DATA.reduce((sum, item) => sum + item.completed, 0)).toFixed(2))
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

                <div className="relative px-5 pt-5 pb-2">
                  <div className="text-gray-500 text-[10px] font-semibold uppercase tracking-widest mb-2">ANALYTICS</div>
                  <h3 className="text-gray-900 text-lg font-semibold mb-2 flex items-center gap-2">
                    YTD Revenue
                    <div className="group/info relative z-[100000]">
                      <Info size={14} className="text-[#2d6e7e] cursor-help" />
                      <div className="absolute left-0 top-6 invisible group-hover/info:visible opacity-0 group-hover/info:opacity-100 transition-all duration-200 w-64 z-[100000]">
                        <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
                          <p className="font-medium mb-1">Year-to-Date Revenue</p>
                          <p className="text-gray-300">Displays your cumulative revenue from the beginning of the year. Track your progress toward annual revenue goals and see growth trends month by month.</p>
                          <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                        </div>
                      </div>
                    </div>
                  </h3>
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

              <div className="relative px-6 pt-6 pb-4 flex-shrink-0">
                <div className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-2">ANALYTICS</div>
                <h3 className="text-gray-900 text-2xl font-semibold mb-4 flex items-center gap-2">
                  Revenue Margins
                  <div className="group/info relative z-[100000]">
                    <Info size={18} className="text-[#2d6e7e] cursor-help" />
                    <div className="absolute left-0 top-8 invisible group-hover/info:visible opacity-0 group-hover/info:opacity-100 transition-all duration-200 w-80 z-[100000]">
                      <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
                        <p className="font-medium mb-1">Revenue Margins Breakdown</p>
                        <p className="text-gray-300">See what percentage of your gross revenue goes to different expenses. Track your net margin (profit you keep), clinician costs, supervisor costs, and credit card processing fees over time to identify cost optimization opportunities.</p>
                        <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                      </div>
                    </div>
                  </div>
                </h3>

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
          <div className="bg-gradient-to-br from-white via-white to-slate-50/20 rounded-[24px] shadow-2xl border-2 border-[#2d6e7e] relative overflow-hidden group hover:shadow-[0_20px_70px_-10px_rgba(45,110,126,0.3)] transition-all duration-300 w-[55%]"
            style={{
              boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

            <div className="relative px-6 pt-6 pb-6">
              <div className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-2">FINANCIAL BREAKDOWN</div>
              <h3 className="text-gray-900 text-2xl font-semibold mb-4 flex items-center gap-2">
                Revenue Allocation
                <div className="group/info relative z-[100000]">
                  <Info size={18} className="text-[#2d6e7e] cursor-help" />
                  <div className="absolute left-0 top-8 invisible group-hover/info:visible opacity-0 group-hover/info:opacity-100 transition-all duration-200 w-80 z-[100000]">
                    <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
                      <p className="font-medium mb-1">Revenue Allocation Table</p>
                      <p className="text-gray-300">Detailed monthly breakdown showing where your gross revenue goes. View exact dollar amounts for clinician costs, supervisor costs, credit card fees, and your net revenue (what you keep after expenses).</p>
                      <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                    </div>
                  </div>
                </div>
              </h3>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-5 px-2 text-xs font-bold text-gray-500 uppercase tracking-wider"></th>
                      {REVENUE_BREAKDOWN_DATA.map((item) => (
                        <th key={item.month} className="text-right py-5 px-2 text-xs font-bold text-gray-500 uppercase tracking-wider">{item.month}</th>
                      ))}
                      <th className="text-right py-5 px-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                      <td className="py-5 px-2 text-sm font-semibold text-gray-900">Gross Revenue</td>
                      {REVENUE_BREAKDOWN_DATA.map((item) => (
                        <td key={item.month} className="py-5 px-2 text-sm font-semibold text-gray-900 text-right">${(item.grossRevenue / 1000).toFixed(1)}k</td>
                      ))}
                      <td className="py-5 px-2 text-sm font-bold text-gray-900 text-right">
                        ${(REVENUE_BREAKDOWN_DATA.reduce((sum, item) => sum + item.grossRevenue, 0) / 1000).toFixed(1)}k
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                      <td className="py-5 px-2 text-sm font-semibold text-gray-900">Clinician Cost</td>
                      {REVENUE_BREAKDOWN_DATA.map((item) => (
                        <td key={item.month} className="py-5 px-2 text-sm text-blue-600 text-right">${(item.clinicianCosts / 1000).toFixed(1)}k</td>
                      ))}
                      <td className="py-5 px-2 text-sm font-bold text-blue-600 text-right">
                        ${(REVENUE_BREAKDOWN_DATA.reduce((sum, item) => sum + item.clinicianCosts, 0) / 1000).toFixed(1)}k
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                      <td className="py-5 px-2 text-sm font-semibold text-gray-900">Supervisor Cost</td>
                      {REVENUE_BREAKDOWN_DATA.map((item) => (
                        <td key={item.month} className="py-5 px-2 text-sm text-amber-600 text-right">${(item.supervisorCosts / 1000).toFixed(1)}k</td>
                      ))}
                      <td className="py-5 px-2 text-sm font-bold text-amber-600 text-right">
                        ${(REVENUE_BREAKDOWN_DATA.reduce((sum, item) => sum + item.supervisorCosts, 0) / 1000).toFixed(1)}k
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                      <td className="py-5 px-2 text-sm font-semibold text-gray-900">Credit Card Fees</td>
                      {REVENUE_BREAKDOWN_DATA.map((item) => (
                        <td key={item.month} className="py-5 px-2 text-sm text-red-600 text-right">${(item.creditCardFees / 1000).toFixed(1)}k</td>
                      ))}
                      <td className="py-5 px-2 text-sm font-bold text-red-600 text-right">
                        ${(REVENUE_BREAKDOWN_DATA.reduce((sum, item) => sum + item.creditCardFees, 0) / 1000).toFixed(1)}k
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-5 px-2 text-sm font-semibold text-green-700">Net Revenue</td>
                      {REVENUE_BREAKDOWN_DATA.map((item) => (
                        <td key={item.month} className="py-5 px-2 text-sm font-bold text-green-700 text-right">${(item.netRevenue / 1000).toFixed(1)}k</td>
                      ))}
                      <td className="py-5 px-2 text-sm font-bold text-green-700 text-right">
                        ${(REVENUE_BREAKDOWN_DATA.reduce((sum, item) => sum + item.netRevenue, 0) / 1000).toFixed(1)}k
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="flex flex-col gap-6 overflow-y-auto">
          {/* Top Row - Charts */}
          <div className="flex gap-6 flex-shrink-0" style={{ height: 'calc(100vh - 400px)' }}>
            <div className="w-[55%]" style={{ height: '100%' }}>
            <div className="bg-gradient-to-br from-white via-white to-slate-50/20 rounded-[24px] h-full flex flex-col shadow-2xl border-2 border-[#2d6e7e] relative overflow-hidden group hover:shadow-[0_20px_70px_-10px_rgba(45,110,126,0.3)] transition-all duration-300"
              style={{
                boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

              <div className="relative px-6 pt-6 pb-4 flex-shrink-0">
                <div className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-2">ANALYTICS</div>
                <h3 className="text-gray-900 text-2xl font-semibold mb-4 flex items-center gap-2">
                  Session Volume
                  <div className="group/info relative z-[100000]">
                    <Info size={18} className="text-[#2d6e7e] cursor-help" />
                    <div className="absolute left-0 top-8 invisible group-hover/info:visible opacity-0 group-hover/info:opacity-100 transition-all duration-200 w-80 z-[100000]">
                      <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
                        <p className="font-medium mb-1">Session Volume Tracking</p>
                        <p className="text-gray-300">Compare booked appointments versus completed sessions each month. The drop-off percentage above each bar pair shows your no-show and cancellation rate, helping you identify scheduling issues and improve attendance.</p>
                        <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                      </div>
                    </div>
                  </div>
                </h3>

                {/* Legend */}
                <div className="flex gap-4 mb-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#2d6e7e]"></div>
                    <span className="text-xs font-medium text-gray-700">Booked Sessions</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#10b981]"></div>
                    <span className="text-xs font-medium text-gray-700">Completed Sessions</span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 px-4 pb-4 flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={SESSIONS_DATA.map((item, index) => ({
                      ...item,
                      dataIndex: index
                    }))}
                    margin={{ top: 50, right: 20, bottom: 5, left: 20 }}
                    barGap={8}
                    barCategoryGap="20%"
                  >
                    <defs>
                      <linearGradient id="bookedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2d6e7e" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#1d4e5e" stopOpacity={1}/>
                      </linearGradient>
                      <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#059669" stopOpacity={1}/>
                      </linearGradient>
                      <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="1.5"/>
                        <feOffset dx="0" dy="2" result="offsetblur"/>
                        <feComponentTransfer>
                          <feFuncA type="linear" slope="0.15"/>
                        </feComponentTransfer>
                        <feMerge>
                          <feMergeNode/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                      dy={8}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 600 }}
                      domain={[0, 800]}
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
                      formatter={(value: number, name: string, props: any) => {
                        const dropOff = ((props.payload.booked - props.payload.completed) / props.payload.booked * 100).toFixed(1);
                        const completion = ((props.payload.completed / props.payload.booked) * 100).toFixed(1);
                        return [value, name === 'booked' ? `Booked (${completion}% completed)` : `Completed (${dropOff}% no-show)`];
                      }}
                    />
                    <Bar dataKey="booked" fill="url(#bookedGradient)" radius={[8, 8, 0, 0]} name="Booked" maxBarSize={60}>
                      <LabelList dataKey="booked" position="top" style={{ fill: '#1f2937', fontSize: '11px', fontWeight: 700 }} offset={8} />
                      <LabelList
                        content={(props: any) => {
                          const { x, y, width, height, index, value } = props;
                          if (index === undefined || !SESSIONS_DATA[index]) return null;

                          const item = SESSIONS_DATA[index];
                          const dropOff = ((item.booked - item.completed) / item.booked * 100).toFixed(1);
                          const numDropOff = parseFloat(dropOff);

                          // Position in the center of the bar group (accounting for gap between bars)
                          const barGap = 8; // matches barGap prop
                          const centerX = x + width + barGap / 2; // Center between the two bars
                          const topY = y - 20; // Position above the bar

                          return (
                            <g>
                              {/* Pill background */}
                              <rect
                                x={centerX - 30}
                                y={topY - 50}
                                width={60}
                                height={24}
                                rx={12}
                                ry={12}
                                fill="white"
                                stroke={numDropOff > 5 ? '#ef4444' : numDropOff > 3 ? '#f59e0b' : '#10b981'}
                                strokeWidth={2}
                                filter="url(#softShadow)"
                              />
                              {/* Percentage text */}
                              <text
                                x={centerX}
                                y={topY - 35}
                                fill={numDropOff > 5 ? '#dc2626' : numDropOff > 3 ? '#d97706' : '#059669'}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize={12}
                                fontWeight={700}
                                letterSpacing={0.2}
                              >
                                -{dropOff}%
                              </text>
                            </g>
                          );
                        }}
                      />
                    </Bar>
                    <Bar dataKey="completed" fill="url(#completedGradient)" radius={[8, 8, 0, 0]} name="Completed" maxBarSize={60}>
                      <LabelList dataKey="completed" position="top" style={{ fill: '#1f2937', fontSize: '11px', fontWeight: 700 }} offset={8} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            </div>

            {/* Right Side Metrics - Similar to Financial Analysis */}
            <div className="flex flex-col gap-6 w-[45%]" style={{ height: '100%' }}>
              <div className="flex gap-4 flex-shrink-0">
                {/* Average Weekly Sessions - Compact */}
                <div className="bg-gradient-to-br from-white via-white to-slate-50/20 rounded-[20px] flex flex-col shadow-2xl border-2 border-[#2d6e7e] relative overflow-hidden group hover:shadow-[0_20px_70px_-10px_rgba(45,110,126,0.3)] transition-all duration-300 flex-1"
                  style={{
                    boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                  <div className="relative px-5 pt-5 pb-2">
                    <div className="text-gray-500 text-[10px] font-semibold uppercase tracking-widest mb-2">ANALYTICS</div>
                    <h3 className="text-gray-900 text-lg font-semibold mb-2 flex items-center gap-2">
                      Avg Weekly Sessions
                      <div className="group/info relative z-[100000]">
                        <Info size={14} className="text-[#2d6e7e] cursor-help" />
                        <div className="absolute left-0 top-6 invisible group-hover/info:visible opacity-0 group-hover/info:opacity-100 transition-all duration-200 w-64 z-[100000]">
                          <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
                            <p className="font-medium mb-1">Average Weekly Sessions</p>
                            <p className="text-gray-300">Shows the average number of completed sessions per week (monthly sessions divided by 4.33 weeks). Use this to track weekly productivity and identify capacity trends.</p>
                            <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                          </div>
                        </div>
                      </div>
                    </h3>
                    <div className="text-2xl font-bold text-gray-900 tracking-tight transition-all duration-200">
                      {hoveredWeeklySessions !== null
                        ? hoveredWeeklySessions.toFixed(1)
                        : (SESSIONS_DATA.reduce((sum, item) => sum + item.completed, 0) / SESSIONS_DATA.length / 4.33).toFixed(1)
                      }
                    </div>
                  </div>

                  <div className="relative z-10 px-3 pb-2" style={{ height: '110px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={AVG_WEEKLY_SESSIONS_DATA}
                        margin={{ top: 20, right: 10, bottom: 5, left: 5 }}
                        onMouseMove={(e: any) => {
                          if (e.activePayload && e.activePayload[0]) {
                            setHoveredWeeklySessions(e.activePayload[0].value);
                          }
                        }}
                        onMouseLeave={() => setHoveredWeeklySessions(null)}
                      >
                        <defs>
                          <linearGradient id="weeklySessionsGradient" x1="0" y1="0" x2="0" y2="1">
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
                          formatter={(value: number) => [value.toFixed(1), 'Weekly Avg']}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#2d6e7e"
                          strokeWidth={2.5}
                          dot={{ fill: '#2d6e7e', strokeWidth: 2, stroke: '#fff', r: 3 }}
                          activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                          fill="url(#weeklySessionsGradient)"
                        >
                          <LabelList
                            dataKey="value"
                            position="top"
                            formatter={(value: number) => value.toFixed(0)}
                            style={{ fill: '#1f2937', fontSize: '10px', fontWeight: 700 }}
                          />
                        </Line>
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Avg Sessions per Client - Compact */}
                <div className="bg-gradient-to-br from-white via-white to-slate-50/20 rounded-[20px] flex flex-col shadow-2xl border-2 border-[#2d6e7e] relative overflow-hidden group hover:shadow-[0_20px_70px_-10px_rgba(45,110,126,0.3)] transition-all duration-300 flex-1"
                  style={{
                    boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                  <div className="relative px-5 pt-5 pb-2">
                    <div className="text-gray-500 text-[10px] font-semibold uppercase tracking-widest mb-2">ANALYTICS</div>
                    <h3 className="text-gray-900 text-lg font-semibold mb-2 flex items-center gap-2">
                      Sessions per Client Monthly
                      <div className="group/info relative z-[100000]">
                        <Info size={14} className="text-[#2d6e7e] cursor-help" />
                        <div className="absolute left-0 top-6 invisible group-hover/info:visible opacity-0 group-hover/info:opacity-100 transition-all duration-200 w-64 z-[100000]">
                          <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
                            <p className="font-medium mb-1">Average Sessions per Client per Month</p>
                            <p className="text-gray-300">Shows the average number of sessions each active client completes per month. This metric helps you understand monthly client engagement frequency and identify trends in session utilization patterns.</p>
                            <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                          </div>
                        </div>
                      </div>
                    </h3>
                    <div className="text-2xl font-bold text-gray-900 tracking-tight transition-all duration-200">
                      {hoveredAvgSessionsPerClient !== null
                        ? hoveredAvgSessionsPerClient.toFixed(2)
                        : (SESSIONS_DATA.reduce((sum, item) => sum + item.completed, 0) / SESSIONS_DATA.reduce((sum, item) => sum + item.clients, 0)).toFixed(2)
                      }
                    </div>
                  </div>

                  <div className="relative z-10 px-3 pb-2" style={{ height: '110px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={AVG_SESSIONS_PER_CLIENT_DATA}
                        margin={{ top: 20, right: 10, bottom: 5, left: 5 }}
                        onMouseMove={(e: any) => {
                          if (e.activePayload && e.activePayload[0]) {
                            setHoveredAvgSessionsPerClient(e.activePayload[0].value);
                          }
                        }}
                        onMouseLeave={() => setHoveredAvgSessionsPerClient(null)}
                      >
                        <defs>
                          <linearGradient id="avgSessionsPerClientGradient" x1="0" y1="0" x2="0" y2="1">
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
                        <YAxis hide domain={['dataMin - 0.5', 'dataMax + 0.5']} />
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
                          formatter={(value: number) => [value.toFixed(2), 'Avg Sessions']}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#2d6e7e"
                          strokeWidth={2.5}
                          dot={{ fill: '#2d6e7e', strokeWidth: 2, stroke: '#fff', r: 3 }}
                          activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                          fill="url(#avgSessionsPerClientGradient)"
                        >
                          <LabelList
                            dataKey="value"
                            position="top"
                            formatter={(value: number) => value.toFixed(1)}
                            style={{ fill: '#1f2937', fontSize: '10px', fontWeight: 700 }}
                          />
                        </Line>
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Attendance Donut Chart */}
              <div className="bg-gradient-to-br from-white via-white to-slate-50/20 rounded-[24px] flex flex-col flex-1 shadow-2xl border-2 border-[#2d6e7e] relative overflow-hidden group hover:shadow-[0_20px_70px_-10px_rgba(45,110,126,0.3)] transition-all duration-300"
                style={{
                  boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                <div className="relative px-6 pt-6 pb-4 flex-shrink-0">
                  <div className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-2">ANALYTICS</div>
                  <h3 className="text-gray-900 text-2xl font-semibold mb-4 flex items-center gap-2">
                    Attendance Breakdown
                    <div className="group/info relative z-[100000]">
                      <Info size={18} className="text-[#2d6e7e] cursor-help" />
                      <div className="absolute left-0 top-8 invisible group-hover/info:visible opacity-0 group-hover/info:opacity-100 transition-all duration-200 w-80 z-[100000]">
                        <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
                          <p className="font-medium mb-1">Attendance Breakdown</p>
                          <p className="text-gray-300">Visualizes the distribution of all session outcomes: shows (attended), cancellations, clinician cancellations, late cancellations, and no-shows. The center shows your overall show rate, while the non-billable cancel rate highlights revenue loss from non-client-initiated cancellations.</p>
                          <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                        </div>
                      </div>
                    </div>
                  </h3>

                  {/* Legend */}
                  <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#10b981]"></div>
                      <span className="text-xs font-medium text-gray-700">Show</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
                      <span className="text-xs font-medium text-gray-700">Canceled</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div>
                      <span className="text-xs font-medium text-gray-700">Clinician canceled</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
                      <span className="text-xs font-medium text-gray-700">Late canceled</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#6b7280]"></div>
                      <span className="text-xs font-medium text-gray-700">No show</span>
                    </div>
                  </div>

                  {/* Non-Billable Cancel Rate */}
                  <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-red-900 uppercase tracking-wider">Non-Billable Cancel Rate</span>
                      <span className="text-lg font-bold text-red-700">
                        {(
                          ((SESSIONS_DATA.reduce((sum, item) => sum + item.clinicianCancelled + item.cancelled, 0)) /
                          SESSIONS_DATA.reduce((sum, item) =>
                            sum + item.show + item.cancelled + item.clinicianCancelled + item.lateCancelled + item.noShow, 0
                          )) * 100
                        ).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 px-4 pb-4 flex-1 min-h-0 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <defs>
                        <filter id="donutShadow" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                          <feOffset dx="0" dy="2" result="offsetblur"/>
                          <feComponentTransfer>
                            <feFuncA type="linear" slope="0.2"/>
                          </feComponentTransfer>
                          <feMerge>
                            <feMergeNode/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      <Pie
                        data={[
                          {
                            name: 'Show',
                            value: SESSIONS_DATA.reduce((sum, item) => sum + item.show, 0),
                            color: '#10b981'
                          },
                          {
                            name: 'Canceled',
                            value: SESSIONS_DATA.reduce((sum, item) => sum + item.cancelled, 0),
                            color: '#ef4444'
                          },
                          {
                            name: 'Clinician canceled',
                            value: SESSIONS_DATA.reduce((sum, item) => sum + item.clinicianCancelled, 0),
                            color: '#3b82f6'
                          },
                          {
                            name: 'Late canceled',
                            value: SESSIONS_DATA.reduce((sum, item) => sum + item.lateCancelled, 0),
                            color: '#f59e0b'
                          },
                          {
                            name: 'No show',
                            value: SESSIONS_DATA.reduce((sum, item) => sum + item.noShow, 0),
                            color: '#6b7280'
                          }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius="60%"
                        outerRadius="85%"
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {[
                          { name: 'Show', value: SESSIONS_DATA.reduce((sum, item) => sum + item.show, 0), color: '#10b981' },
                          { name: 'Canceled', value: SESSIONS_DATA.reduce((sum, item) => sum + item.cancelled, 0), color: '#ef4444' },
                          { name: 'Clinician canceled', value: SESSIONS_DATA.reduce((sum, item) => sum + item.clinicianCancelled, 0), color: '#3b82f6' },
                          { name: 'Late canceled', value: SESSIONS_DATA.reduce((sum, item) => sum + item.lateCancelled, 0), color: '#f59e0b' },
                          { name: 'No show', value: SESSIONS_DATA.reduce((sum, item) => sum + item.noShow, 0), color: '#6b7280' }
                        ].map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            filter="url(#donutShadow)"
                          />
                        ))}
                        <LabelList
                          dataKey="value"
                          position="outside"
                          formatter={(value: number) => {
                            const total = SESSIONS_DATA.reduce((sum, item) =>
                              sum + item.show + item.cancelled + item.clinicianCancelled + item.lateCancelled + item.noShow, 0
                            );
                            return `${((value / total) * 100).toFixed(1)}%`;
                          }}
                          style={{ fill: '#1f2937', fontSize: '11px', fontWeight: 700 }}
                        />
                      </Pie>
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
                        formatter={(value: number) => {
                          const total = SESSIONS_DATA.reduce((sum, item) =>
                            sum + item.show + item.cancelled + item.clinicianCancelled + item.lateCancelled + item.noShow, 0
                          );
                          return [`${value} (${((value / total) * 100).toFixed(1)}%)`, ''];
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">
                        {(
                          (SESSIONS_DATA.reduce((sum, item) => sum + item.show, 0) /
                          SESSIONS_DATA.reduce((sum, item) =>
                            sum + item.show + item.cancelled + item.clinicianCancelled + item.lateCancelled + item.noShow, 0
                          )) * 100
                        ).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Show Rate</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'capacity-client' && (
        <div className="flex flex-col gap-6 overflow-y-auto">
          {/* Top Row - Main Chart */}
          <div className="flex gap-6 flex-shrink-0" style={{ height: 'calc(100vh - 400px)' }}>
            <div className="w-[55%]" style={{ height: '100%' }}>
            <div className="bg-gradient-to-br from-white via-white to-slate-50/20 rounded-[24px] h-full flex flex-col shadow-2xl border-2 border-[#2d6e7e] relative overflow-hidden group hover:shadow-[0_20px_70px_-10px_rgba(45,110,126,0.3)] transition-all duration-300"
              style={{
                boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

              <div className="relative px-6 pt-6 pb-4 flex-shrink-0">
                <div className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-2">ANALYTICS</div>
                <h3 className="text-gray-900 text-2xl font-semibold mb-4 flex items-center gap-2">
                  Client Capacity
                  <div className="group/info relative z-[100000]">
                    <Info size={18} className="text-[#2d6e7e] cursor-help" />
                    <div className="absolute left-0 top-8 invisible group-hover/info:visible opacity-0 group-hover/info:opacity-100 transition-all duration-200 w-80 z-[100000]">
                      <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
                        <p className="font-medium mb-1">Client Capacity Tracking</p>
                        <p className="text-gray-300">Compare your active client count versus your practice capacity. The percentage above shows how much of your capacity is being utilized. Higher utilization means you're closer to your practice limits.</p>
                        <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                      </div>
                    </div>
                  </div>
                </h3>

                {/* Legend */}
                <div className="flex gap-4 mb-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#9ca3af]"></div>
                    <span className="text-xs font-medium text-gray-700">Client Capacity</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#2d6e7e]"></div>
                    <span className="text-xs font-medium text-gray-700">Active Clients</span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 px-4 pb-4 flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={CLIENT_GROWTH_DATA.map((item, index) => ({
                      ...item,
                      dataIndex: index
                    }))}
                    margin={{ top: 50, right: 20, bottom: 5, left: 20 }}
                    barGap={8}
                    barCategoryGap="20%"
                  >
                    <defs>
                      <linearGradient id="capacityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#9ca3af" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#6b7280" stopOpacity={1}/>
                      </linearGradient>
                      <linearGradient id="activeClientsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2d6e7e" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#1d4e5e" stopOpacity={1}/>
                      </linearGradient>
                      <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="1.5"/>
                        <feOffset dx="0" dy="2" result="offsetblur"/>
                        <feComponentTransfer>
                          <feFuncA type="linear" slope="0.15"/>
                        </feComponentTransfer>
                        <feMerge>
                          <feMergeNode/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                      dy={8}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 600 }}
                      domain={[0, 200]}
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
                      formatter={(value: number, name: string, props: any) => {
                        const utilized = ((props.payload.activeClients / props.payload.capacity) * 100).toFixed(1);
                        return [value, name === 'capacity' ? `Capacity (${utilized}% utilized)` : `Active Clients`];
                      }}
                    />
                    <Bar dataKey="capacity" fill="url(#capacityGradient)" radius={[8, 8, 0, 0]} name="Capacity" maxBarSize={60}>
                      <LabelList dataKey="capacity" position="top" style={{ fill: '#1f2937', fontSize: '11px', fontWeight: 700 }} offset={8} />
                      <LabelList
                        content={(props: any) => {
                          const { x, y, width, height, index, value } = props;
                          if (index === undefined || !CLIENT_GROWTH_DATA[index]) return null;

                          const item = CLIENT_GROWTH_DATA[index];
                          const utilized = ((item.activeClients / item.capacity) * 100).toFixed(1);
                          const numUtilized = parseFloat(utilized);

                          // Position in the center of the bar group (accounting for gap between bars)
                          const barGap = 8; // matches barGap prop
                          const centerX = x + width + barGap / 2; // Center between the two bars
                          const topY = y - 20; // Position above the bar

                          return (
                            <g>
                              {/* Pill background */}
                              <rect
                                x={centerX - 30}
                                y={topY - 50}
                                width={60}
                                height={24}
                                rx={12}
                                ry={12}
                                fill="white"
                                stroke={numUtilized > 85 ? '#ef4444' : numUtilized > 70 ? '#f59e0b' : '#10b981'}
                                strokeWidth={2}
                                filter="url(#softShadow)"
                              />
                              {/* Percentage text */}
                              <text
                                x={centerX}
                                y={topY - 35}
                                fill={numUtilized > 85 ? '#dc2626' : numUtilized > 70 ? '#d97706' : '#059669'}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize={12}
                                fontWeight={700}
                                letterSpacing={0.2}
                              >
                                {utilized}%
                              </text>
                            </g>
                          );
                        }}
                      />
                    </Bar>
                    <Bar dataKey="activeClients" fill="url(#activeClientsGradient)" radius={[8, 8, 0, 0]} name="Active Clients" maxBarSize={60}>
                      <LabelList dataKey="activeClients" position="top" style={{ fill: '#1f2937', fontSize: '11px', fontWeight: 700 }} offset={8} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            </div>

            {/* Right Side - Hours Utilization */}
            <div className="flex flex-col gap-6 w-[45%]" style={{ height: '100%' }}>
              <div className="flex gap-4 flex-shrink-0">
                {/* Hours Utilization - Compact */}
                <div className="bg-gradient-to-br from-white via-white to-slate-50/20 rounded-[20px] flex flex-col shadow-2xl border-2 border-[#2d6e7e] relative overflow-hidden group hover:shadow-[0_20px_70px_-10px_rgba(45,110,126,0.3)] transition-all duration-300 flex-1"
                  style={{
                    boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                  <div className="relative px-5 pt-5 pb-2">
                    <div className="text-gray-500 text-[10px] font-semibold uppercase tracking-widest mb-2">ANALYTICS</div>
                    <h3 className="text-gray-900 text-lg font-semibold mb-2 flex items-center gap-2">
                      Hours Utilization
                      <div className="group/info relative z-[100000]">
                        <Info size={14} className="text-[#2d6e7e] cursor-help" />
                        <div className="absolute left-0 top-6 invisible group-hover/info:visible opacity-0 group-hover/info:opacity-100 transition-all duration-200 w-64 z-[100000]">
                          <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
                            <p className="font-medium mb-1">Practice Hours Utilization</p>
                            <p className="text-gray-300">Shows the percentage of billable hours utilized across the practice over time (based on 800 hrs/month = 5 clinicians × 160 hrs). Higher percentage indicates better capacity usage.</p>
                            <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                          </div>
                        </div>
                      </div>
                    </h3>
                    <div className="text-2xl font-bold text-gray-900 tracking-tight transition-all duration-200">
                      {hoveredHoursUtilization !== null
                        ? `${hoveredHoursUtilization.toFixed(1)}%`
                        : `${(HOURS_UTILIZATION_DATA.reduce((sum, item) => sum + item.percentage, 0) / HOURS_UTILIZATION_DATA.length).toFixed(1)}%`
                      }
                    </div>
                  </div>

                  <div className="relative z-10 px-3 pb-2" style={{ height: '110px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={HOURS_UTILIZATION_DATA}
                        margin={{ top: 20, right: 10, bottom: 5, left: 5 }}
                        onMouseMove={(e: any) => {
                          if (e.activePayload && e.activePayload[0]) {
                            setHoveredHoursUtilization(e.activePayload[0].value);
                          }
                        }}
                        onMouseLeave={() => setHoveredHoursUtilization(null)}
                      >
                        <defs>
                          <linearGradient id="hoursUtilizationGradient" x1="0" y1="0" x2="0" y2="1">
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
                        <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
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
                          formatter={(value: number) => [`${value.toFixed(1)}%`, 'Utilization']}
                        />
                        <Line
                          type="monotone"
                          dataKey="percentage"
                          stroke="#2d6e7e"
                          strokeWidth={2.5}
                          dot={{ fill: '#2d6e7e', strokeWidth: 2, stroke: '#fff', r: 3 }}
                          activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                          fill="url(#hoursUtilizationGradient)"
                        >
                          <LabelList
                            dataKey="percentage"
                            position="top"
                            style={{ fill: '#1f2937', fontSize: '10px', fontWeight: 700 }}
                            offset={8}
                            formatter={(value: number) => `${value.toFixed(1)}%`}
                          />
                        </Line>
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Open Slots - Compact */}
                <div className="bg-gradient-to-br from-white via-white to-slate-50/20 rounded-[20px] flex flex-col shadow-2xl border-2 border-[#2d6e7e] relative overflow-hidden group hover:shadow-[0_20px_70px_-10px_rgba(45,110,126,0.3)] transition-all duration-300 flex-1"
                  style={{
                    boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                  <div className="relative px-5 pt-5 pb-2">
                    <div className="text-gray-500 text-[10px] font-semibold uppercase tracking-widest mb-2">ANALYTICS</div>
                    <h3 className="text-gray-900 text-lg font-semibold mb-2 flex items-center gap-2">
                      Open Slots
                      <div className="group/info relative z-[100000]">
                        <Info size={14} className="text-[#2d6e7e] cursor-help" />
                        <div className="absolute left-0 top-6 invisible group-hover/info:visible opacity-0 group-hover/info:opacity-100 transition-all duration-200 w-64 z-[100000]">
                          <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
                            <p className="font-medium mb-1">Open Slots Available</p>
                            <p className="text-gray-300">Shows the number of unfilled appointment slots available each month across the practice (booked minus completed sessions). Lower numbers indicate better utilization and fewer cancellations/no-shows.</p>
                            <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                          </div>
                        </div>
                      </div>
                    </h3>
                    <div className="text-2xl font-bold text-gray-900 tracking-tight transition-all duration-200">
                      {hoveredOpenSlots !== null
                        ? hoveredOpenSlots
                        : Math.round(OPEN_SLOTS_DATA.reduce((sum, item) => sum + item.value, 0) / OPEN_SLOTS_DATA.length)
                      }
                    </div>
                  </div>

                  <div className="relative z-10 px-3 pb-2" style={{ height: '110px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={OPEN_SLOTS_DATA}
                        margin={{ top: 20, right: 10, bottom: 5, left: 5 }}
                        onMouseMove={(e: any) => {
                          if (e.activePayload && e.activePayload[0]) {
                            setHoveredOpenSlots(e.activePayload[0].value);
                          }
                        }}
                        onMouseLeave={() => setHoveredOpenSlots(null)}
                      >
                        <defs>
                          <linearGradient id="openSlotsGradientClient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.2}/>
                            <stop offset="100%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="month"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 600 }}
                          dy={3}
                        />
                        <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
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
                          formatter={(value: number) => [value, 'Open Slots']}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#ef4444"
                          strokeWidth={2.5}
                          dot={{ fill: '#ef4444', strokeWidth: 2, stroke: '#fff', r: 3 }}
                          activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                          fill="url(#openSlotsGradientClient)"
                        >
                          <LabelList
                            dataKey="value"
                            position="top"
                            style={{ fill: '#1f2937', fontSize: '10px', fontWeight: 700 }}
                            offset={8}
                          />
                        </Line>
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Client Movement Chart - Diverging Bar Chart */}
              <div className="bg-gradient-to-br from-white via-white to-slate-50/20 rounded-[24px] flex flex-col flex-1 shadow-2xl border-2 border-[#2d6e7e] relative overflow-hidden group hover:shadow-[0_20px_70px_-10px_rgba(45,110,126,0.3)] transition-all duration-300"
                style={{
                  boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                <div className="relative px-6 pt-6 pb-4 flex-shrink-0">
                  <div className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-2">ANALYTICS</div>
                  <h3 className="text-gray-900 text-2xl font-semibold mb-4 flex items-center gap-2">
                    Client Movement
                    <div className="group/info relative z-[100000]">
                      <Info size={18} className="text-[#2d6e7e] cursor-help" />
                      <div className="absolute left-0 top-8 invisible group-hover/info:visible opacity-0 group-hover/info:opacity-100 transition-all duration-200 w-80 z-[100000]">
                        <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
                          <p className="font-medium mb-1">Client Movement Analysis</p>
                          <p className="text-gray-300">Visualizes the flow of clients in and out of your practice. New clients appear as positive bars (green) above the center line, while churned clients appear as negative bars (red) below. This helps you understand client retention and growth patterns.</p>
                          <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                        </div>
                      </div>
                    </div>
                  </h3>

                  {/* Legend */}
                  <div className="flex items-center gap-6 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
                      <span className="text-sm font-medium text-gray-700">New Clients</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
                      <span className="text-sm font-medium text-gray-700">Churned Clients</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 px-6 pb-6 relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={CLIENT_GROWTH_DATA.map(item => ({
                        month: item.month,
                        new: item.new,
                        churned: -item.churned // Negative for diverging effect
                      }))}
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                      <defs>
                        <linearGradient id="newClientsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0.6}/>
                        </linearGradient>
                        <linearGradient id="churnedClientsGradient" x1="0" y1="1" x2="0" y2="0">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8}/>
                          <stop offset="100%" stopColor="#ef4444" stopOpacity={0.6}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#4b5563', fontSize: 14, fontWeight: 600 }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                        tickFormatter={(value) => Math.abs(value).toString()}
                      />
                      <ReferenceLine y={0} stroke="#9ca3af" strokeWidth={2} />
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
                        formatter={(value: number, name: string) => {
                          const absValue = Math.abs(value);
                          const label = name === 'new' ? 'New Clients' : 'Churned Clients';
                          return [absValue, label];
                        }}
                      />
                      <Bar dataKey="new" fill="url(#newClientsGradient)" radius={[6, 6, 0, 0]} maxBarSize={80}>
                        <LabelList
                          dataKey="new"
                          position="top"
                          style={{ fill: '#1f2937', fontSize: '12px', fontWeight: 700 }}
                          offset={8}
                        />
                      </Bar>
                      <Bar dataKey="churned" fill="url(#churnedClientsGradient)" radius={[0, 0, 6, 6]} maxBarSize={80}>
                        <LabelList
                          dataKey="churned"
                          position="bottom"
                          style={{ fill: '#1f2937', fontSize: '12px', fontWeight: 700 }}
                          offset={8}
                          formatter={(value: number) => Math.abs(value).toString()}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'capacity' && (
        <div className="flex flex-col gap-6 overflow-y-auto">
          {/* Top Row - Capacity Charts */}
          <div className="flex gap-6 flex-shrink-0">
            <div className="flex gap-4 w-full flex-shrink-0">
              {/* Practice Utilization - Compact */}
                <div className="bg-gradient-to-br from-white via-white to-slate-50/20 rounded-[20px] flex flex-col shadow-2xl border-2 border-[#2d6e7e] relative overflow-hidden group hover:shadow-[0_20px_70px_-10px_rgba(45,110,126,0.3)] transition-all duration-300 flex-1"
                  style={{
                    boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                  <div className="relative px-5 pt-5 pb-2">
                    <div className="text-gray-500 text-[10px] font-semibold uppercase tracking-widest mb-2">ANALYTICS</div>
                    <h3 className="text-gray-900 text-lg font-semibold mb-2 flex items-center gap-2">
                      Practice Utilization
                      <div className="group/info relative z-[100000]">
                        <Info size={14} className="text-[#2d6e7e] cursor-help" />
                        <div className="absolute left-0 top-6 invisible group-hover/info:visible opacity-0 group-hover/info:opacity-100 transition-all duration-200 w-64 z-[100000]">
                          <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
                            <p className="font-medium mb-1">Practice Utilization</p>
                            <p className="text-gray-300">Shows the percentage of booked sessions that were completed. Higher utilization indicates fewer cancellations and no-shows, reflecting better attendance and schedule efficiency.</p>
                            <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                          </div>
                        </div>
                      </div>
                    </h3>
                    <div className="text-2xl font-bold text-gray-900 tracking-tight transition-all duration-200">
                      {hoveredUtilization !== null
                        ? `${hoveredUtilization.toFixed(1)}%`
                        : `${(UTILIZATION_DATA.reduce((sum, item) => sum + item.value, 0) / UTILIZATION_DATA.length).toFixed(1)}%`
                      }
                    </div>
                  </div>

                  <div className="relative z-10 px-3 pb-2" style={{ height: '110px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={UTILIZATION_DATA}
                        margin={{ top: 20, right: 10, bottom: 5, left: 5 }}
                        onMouseMove={(e: any) => {
                          if (e.activePayload && e.activePayload[0]) {
                            setHoveredUtilization(e.activePayload[0].value);
                          }
                        }}
                        onMouseLeave={() => setHoveredUtilization(null)}
                      >
                        <defs>
                          <linearGradient id="utilizationGradient" x1="0" y1="0" x2="0" y2="1">
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
                        <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
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
                          formatter={(value: number) => [`${value.toFixed(1)}%`, 'Utilization']}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#2d6e7e"
                          strokeWidth={2.5}
                          dot={{ fill: '#2d6e7e', strokeWidth: 2, stroke: '#fff', r: 3 }}
                          activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                          fill="url(#utilizationGradient)"
                        >
                          <LabelList
                            dataKey="value"
                            position="top"
                            style={{ fill: '#1f2937', fontSize: '10px', fontWeight: 700 }}
                            offset={8}
                            formatter={(value: number) => `${value.toFixed(1)}%`}
                          />
                        </Line>
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Open Slots per Month - Compact */}
                <div className="bg-gradient-to-br from-white via-white to-slate-50/20 rounded-[20px] flex flex-col shadow-2xl border-2 border-[#2d6e7e] relative overflow-hidden group hover:shadow-[0_20px_70px_-10px_rgba(45,110,126,0.3)] transition-all duration-300 flex-1"
                  style={{
                    boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                  <div className="relative px-5 pt-5 pb-2">
                    <div className="text-gray-500 text-[10px] font-semibold uppercase tracking-widest mb-2">ANALYTICS</div>
                    <h3 className="text-gray-900 text-lg font-semibold mb-2 flex items-center gap-2">
                      Open Slots per Month
                      <div className="group/info relative z-[100000]">
                        <Info size={14} className="text-[#2d6e7e] cursor-help" />
                        <div className="absolute left-0 top-6 invisible group-hover/info:visible opacity-0 group-hover/info:opacity-100 transition-all duration-200 w-64 z-[100000]">
                          <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
                            <p className="font-medium mb-1">Open Slots per Month</p>
                            <p className="text-gray-300">Shows the number of unfilled appointment slots each month (booked minus completed sessions). Lower numbers indicate better utilization. These represent opportunities to reduce cancellations and no-shows.</p>
                            <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                          </div>
                        </div>
                      </div>
                    </h3>
                    <div className="text-2xl font-bold text-gray-900 tracking-tight transition-all duration-200">
                      {hoveredOpenSlots !== null
                        ? hoveredOpenSlots
                        : Math.round(OPEN_SLOTS_DATA.reduce((sum, item) => sum + item.value, 0) / OPEN_SLOTS_DATA.length)
                      }
                    </div>
                  </div>

                  <div className="relative z-10 px-3 pb-2" style={{ height: '110px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={OPEN_SLOTS_DATA}
                        margin={{ top: 20, right: 10, bottom: 5, left: 5 }}
                        onMouseMove={(e: any) => {
                          if (e.activePayload && e.activePayload[0]) {
                            setHoveredOpenSlots(e.activePayload[0].value);
                          }
                        }}
                        onMouseLeave={() => setHoveredOpenSlots(null)}
                      >
                        <defs>
                          <linearGradient id="openSlotsGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.2}/>
                            <stop offset="100%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="month"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 600 }}
                          dy={3}
                        />
                        <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
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
                          formatter={(value: number) => [value, 'Open Slots']}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#ef4444"
                          strokeWidth={2.5}
                          dot={{ fill: '#ef4444', strokeWidth: 2, stroke: '#fff', r: 3 }}
                          activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                          fill="url(#openSlotsGradient)"
                        >
                          <LabelList
                            dataKey="value"
                            position="top"
                            style={{ fill: '#1f2937', fontSize: '10px', fontWeight: 700 }}
                            offset={8}
                          />
                        </Line>
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
        </div>
      )}

      {activeTab === 'retention' && (
            <div className="flex flex-col gap-6 overflow-y-auto">
              {/* Churn Analysis Chart */}
              <div className="flex gap-6 flex-shrink-0" style={{ height: 'calc(100vh - 400px)' }}>
                <div className="w-[55%]" style={{ height: '100%' }}>
                  <div className="bg-gradient-to-br from-white via-white to-slate-50/20 rounded-[24px] h-full flex flex-col shadow-2xl border-2 border-[#2d6e7e] relative overflow-hidden group hover:shadow-[0_20px_70px_-10px_rgba(45,110,126,0.3)] transition-all duration-300"
                    style={{
                      boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                    <div className="relative px-6 pt-6 pb-4 flex-shrink-0">
                      <div className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-2">ANALYTICS</div>
                      <h3 className="text-gray-900 text-2xl font-semibold mb-4 flex items-center gap-2">
                        Churn Analysis by Clinician
                        <div className="group/info relative z-[100000]">
                          <Info size={18} className="text-[#2d6e7e] cursor-help" />
                          <div className="absolute left-0 top-8 invisible group-hover/info:visible opacity-0 group-hover/info:opacity-100 transition-all duration-200 w-80 z-[100000]">
                            <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
                              <p className="font-medium mb-1">Client Churn by Clinician</p>
                              <p className="text-gray-300">Shows the breakdown of churned clients each month by clinician. Stacked bars reveal which clinicians are experiencing client loss and help identify retention issues that may require intervention.</p>
                              <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                            </div>
                          </div>
                        </div>
                      </h3>

                      {/* Legend */}
                      <div className="flex gap-4 mb-4 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#2d6e7e' }}></div>
                          <span className="text-xs font-medium text-gray-700">Chen</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3d8a9e' }}></div>
                          <span className="text-xs font-medium text-gray-700">Rodriguez</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#4da6be' }}></div>
                          <span className="text-xs font-medium text-gray-700">Patel</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#6bc2d8' }}></div>
                          <span className="text-xs font-medium text-gray-700">Kim</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#89d4e8' }}></div>
                          <span className="text-xs font-medium text-gray-700">Johnson</span>
                        </div>
                      </div>
                    </div>

                    <div className="relative z-10 px-4 pb-4 flex-1 min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={CHURN_BY_CLINICIAN_DATA}
                          margin={{ top: 40, right: 20, bottom: 20, left: 20 }}
                        >
                          <defs>
                            <linearGradient id="chenChurnGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#2d6e7e" stopOpacity={1}/>
                              <stop offset="100%" stopColor="#1d4e5e" stopOpacity={1}/>
                            </linearGradient>
                            <linearGradient id="rodriguezChurnGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#3d8a9e" stopOpacity={1}/>
                              <stop offset="100%" stopColor="#2d6a7e" stopOpacity={1}/>
                            </linearGradient>
                            <linearGradient id="patelChurnGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#4da6be" stopOpacity={1}/>
                              <stop offset="100%" stopColor="#3d869e" stopOpacity={1}/>
                            </linearGradient>
                            <linearGradient id="kimChurnGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#6bc2d8" stopOpacity={1}/>
                              <stop offset="100%" stopColor="#4da2be" stopOpacity={1}/>
                            </linearGradient>
                            <linearGradient id="johnsonChurnGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#89d4e8" stopOpacity={1}/>
                              <stop offset="100%" stopColor="#6bc2d8" stopOpacity={1}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                          <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#4b5563', fontSize: 14, fontWeight: 600 }}
                            dy={10}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                            label={{ value: 'Churned Clients', angle: -90, position: 'insideLeft', style: { fill: '#6b7280', fontSize: 12, fontWeight: 600 } }}
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
                            formatter={(value: number, name: string) => {
                              return [value, name];
                            }}
                          />
                          <Bar dataKey="Chen" stackId="a" fill="url(#chenChurnGradient)" radius={[0, 0, 0, 0]} maxBarSize={80} />
                          <Bar dataKey="Rodriguez" stackId="a" fill="url(#rodriguezChurnGradient)" radius={[0, 0, 0, 0]} maxBarSize={80} />
                          <Bar dataKey="Patel" stackId="a" fill="url(#patelChurnGradient)" radius={[0, 0, 0, 0]} maxBarSize={80} />
                          <Bar dataKey="Kim" stackId="a" fill="url(#kimChurnGradient)" radius={[0, 0, 0, 0]} maxBarSize={80} />
                          <Bar dataKey="Johnson" stackId="a" fill="url(#johnsonChurnGradient)" radius={[8, 8, 0, 0]} maxBarSize={80}>
                            <LabelList
                              content={(props: any) => {
                                const { x, y, width, index } = props;
                                if (index === undefined || !CHURN_BY_CLINICIAN_DATA[index]) return null;
                                const total = CHURN_BY_CLINICIAN_DATA[index].total;
                                return (
                                  <text
                                    x={x + width / 2}
                                    y={y - 10}
                                    fill="#1f2937"
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fontSize={14}
                                    fontWeight={700}
                                  >
                                    {total}
                                  </text>
                                );
                              }}
                            />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Right Side - Small Charts and Medium Chart */}
                <div className="flex flex-col gap-6 w-[45%]" style={{ height: '100%' }}>
                  <div className="flex gap-4 flex-shrink-0">
                    {/* Churn Timing - Small Chart 1 */}
                    <div className="bg-gradient-to-br from-white via-white to-slate-50/20 rounded-[20px] flex flex-col shadow-2xl border-2 border-[#2d6e7e] relative overflow-hidden group hover:shadow-[0_20px_70px_-10px_rgba(45,110,126,0.3)] transition-all duration-300 flex-1"
                      style={{
                        boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)'
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                      <div className="relative px-5 pt-5 pb-2">
                        <div className="text-gray-500 text-[10px] font-semibold uppercase tracking-widest mb-2">ANALYTICS</div>
                        <h3 className="text-gray-900 text-lg font-semibold mb-2 flex items-center gap-2">
                          Churn Timing
                          <div className="group/info relative z-[100000]">
                            <Info size={14} className="text-[#2d6e7e] cursor-help" />
                            <div className="absolute left-0 top-6 invisible group-hover/info:visible opacity-0 group-hover/info:opacity-100 transition-all duration-200 w-64 z-[100000]">
                              <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
                                <p className="font-medium mb-1">Client Churn Timing</p>
                                <p className="text-gray-300">Early (0-3mo), Medium (4-8mo), Late (9+mo)</p>
                                <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                              </div>
                            </div>
                          </div>
                        </h3>
                      </div>

                      <div className="relative z-10 px-1 pb-2" style={{ height: '130px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                            <Pie
                              data={[
                                {
                                  name: 'Early (0-3mo)',
                                  value: CHURN_TIMING_DATA.reduce((sum, item) => sum + item.earlyChurn, 0),
                                  color: '#ef4444'
                                },
                                {
                                  name: 'Medium (4-8mo)',
                                  value: CHURN_TIMING_DATA.reduce((sum, item) => sum + item.mediumChurn, 0),
                                  color: '#f59e0b'
                                },
                                {
                                  name: 'Late (9+mo)',
                                  value: CHURN_TIMING_DATA.reduce((sum, item) => sum + item.lateChurn, 0),
                                  color: '#10b981'
                                }
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius="42%"
                              outerRadius="72%"
                              paddingAngle={2}
                              dataKey="value"
                              label={(entry) => {
                                const total = CHURN_TIMING_DATA.reduce((sum, item) =>
                                  sum + item.earlyChurn + item.mediumChurn + item.lateChurn, 0
                                );
                                const percentage = ((entry.value / total) * 100).toFixed(0);
                                const shortName = entry.name.split(' ')[0];
                                return `${shortName} ${percentage}%`;
                              }}
                              labelLine={true}
                              style={{ fontSize: '11px', fontWeight: 600 }}
                            >
                              {[
                                { name: 'Early (0-3mo)', value: CHURN_TIMING_DATA.reduce((sum, item) => sum + item.earlyChurn, 0), color: '#ef4444' },
                                { name: 'Medium (4-8mo)', value: CHURN_TIMING_DATA.reduce((sum, item) => sum + item.mediumChurn, 0), color: '#f59e0b' },
                                { name: 'Late (9+mo)', value: CHURN_TIMING_DATA.reduce((sum, item) => sum + item.lateChurn, 0), color: '#10b981' }
                              ].map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.color}
                                />
                              ))}
                            </Pie>
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
                              formatter={(value: number) => {
                                const total = CHURN_TIMING_DATA.reduce((sum, item) =>
                                  sum + item.earlyChurn + item.mediumChurn + item.lateChurn, 0
                                );
                                return [`${value} (${((value / total) * 100).toFixed(1)}%)`, ''];
                              }}
                            />
                            <text
                              x="50%"
                              y="50%"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              className="font-bold text-gray-900"
                              style={{ fontSize: '24px' }}
                            >
                              {CHURN_TIMING_DATA.reduce((sum, item) =>
                                sum + item.earlyChurn + item.mediumChurn + item.lateChurn, 0
                              )}
                            </text>
                            <text
                              x="50%"
                              y="50%"
                              dy="16"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              className="text-gray-500"
                              style={{ fontSize: '9px', fontWeight: 600 }}
                            >
                              Total
                            </text>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Rebook Rate - Small Chart 2 */}
                    <div className="bg-gradient-to-br from-white via-white to-slate-50/20 rounded-[20px] flex flex-col shadow-2xl border-2 border-[#2d6e7e] relative overflow-hidden group hover:shadow-[0_20px_70px_-10px_rgba(45,110,126,0.3)] transition-all duration-300 flex-1"
                      style={{
                        boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)'
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                      <div className="relative px-5 pt-5 pb-2">
                        <div className="text-gray-500 text-[10px] font-semibold uppercase tracking-widest mb-2">ANALYTICS</div>
                        <h3 className="text-gray-900 text-lg font-semibold mb-2 flex items-center gap-2">
                          Rebook Rate
                          <div className="group/info relative z-[100000]">
                            <Info size={14} className="text-[#2d6e7e] cursor-help" />
                            <div className="absolute left-0 top-6 invisible group-hover/info:visible opacity-0 group-hover/info:opacity-100 transition-all duration-200 w-64 z-[100000]">
                              <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
                                <p className="font-medium mb-1">Rebook Rate</p>
                                <p className="text-gray-300">Of the active clients, this is the percentage that have their next appointment scheduled</p>
                                <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                              </div>
                            </div>
                          </div>
                        </h3>
                        <div className="text-2xl font-bold text-gray-900 tracking-tight">
                          {CLIENT_GROWTH_DATA.length > 0
                            ? `${((CLIENT_GROWTH_DATA.reduce((sum, item) => sum + (item.withNextAppt / item.activeClients), 0) / CLIENT_GROWTH_DATA.length) * 100).toFixed(1)}%`
                            : '0.0%'}
                        </div>
                      </div>

                      <div className="relative z-10 px-3 pb-2" style={{ height: '110px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={CLIENT_GROWTH_DATA.map(item => ({
                              month: item.month,
                              rebookRate: (item.withNextAppt / item.activeClients) * 100
                            }))}
                            margin={{ top: 20, right: 10, bottom: 5, left: 5 }}
                          >
                            <defs>
                              <linearGradient id="rebookGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10b981" stopOpacity={0.2}/>
                                <stop offset="100%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <XAxis
                              dataKey="month"
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 600 }}
                              dy={3}
                            />
                            <YAxis hide domain={[85, 100]} />
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
                              formatter={(value: number) => [`${value.toFixed(1)}%`, 'Rebook Rate']}
                            />
                            <Line
                              type="monotone"
                              dataKey="rebookRate"
                              stroke="#10b981"
                              strokeWidth={2.5}
                              dot={{ fill: '#10b981', strokeWidth: 2, stroke: '#fff', r: 3 }}
                              activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                              fill="url(#rebookGradient)"
                            >
                              <LabelList
                                dataKey="rebookRate"
                                position="top"
                                style={{ fill: '#1f2937', fontSize: '10px', fontWeight: 700 }}
                                offset={8}
                                formatter={(value: number) => `${value.toFixed(1)}%`}
                              />
                            </Line>
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Churn Segment Analysis - Where Clients Drop Off */}
                  <div className="bg-gradient-to-br from-white via-white to-slate-50/20 rounded-[24px] flex flex-col flex-1 shadow-2xl border-2 border-[#2d6e7e] relative overflow-hidden group hover:shadow-[0_20px_70px_-10px_rgba(45,110,126,0.3)] transition-all duration-300"
                    style={{
                      boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                    <div className="relative px-6 pt-6 pb-4 flex-shrink-0">
                      <div className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-2">CHURN ANALYSIS</div>
                      <h3 className="text-gray-900 text-2xl font-semibold mb-4 flex items-center gap-2">
                        Average Churn Point by Segment
                        <div className="group/info relative z-[100000]">
                          <Info size={18} className="text-[#2d6e7e] cursor-help" />
                          <div className="absolute left-0 top-8 invisible group-hover/info:visible opacity-0 group-hover/info:opacity-100 transition-all duration-200 w-80 z-[100000]">
                            <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
                              <p className="font-medium mb-1">Where Clients Drop Off</p>
                              <p className="text-gray-300">Shows the average session count at which clients churn within each segment: Early (&lt;5 sessions), Mid (5-25 sessions), and Late (&gt;25 sessions). Helps identify critical intervention points.</p>
                              <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                            </div>
                          </div>
                        </div>
                      </h3>

                      {/* Segment Legend */}
                      <div className="flex gap-6 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-gradient-to-br from-[#ef4444] to-[#dc2626]"></div>
                          <span className="text-xs font-semibold text-gray-700">Early Churn (&lt;5 sessions)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-gradient-to-br from-[#f59e0b] to-[#d97706]"></div>
                          <span className="text-xs font-semibold text-gray-700">Mid Churn (5-25 sessions)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-gradient-to-br from-[#10b981] to-[#059669]"></div>
                          <span className="text-xs font-semibold text-gray-700">Late Churn (&gt;25 sessions)</span>
                        </div>
                      </div>
                    </div>

                    <div className="relative z-10 px-8 pb-8 flex-1 min-h-0 flex items-center justify-center">
                      <div className="flex gap-12 items-end w-full justify-center">
                        {/* Early Churn */}
                        <div className="flex flex-col items-center">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Early Churn</div>
                          <div className="relative">
                            {/* Bar */}
                            <div
                              className="w-32 bg-gradient-to-t from-[#ef4444] to-[#dc2626] rounded-t-xl shadow-lg"
                              style={{ height: '140px' }}
                            >
                              {/* Marker line at 3.5 sessions */}
                              <div className="absolute top-0 left-0 right-0 flex items-center justify-center" style={{ top: 'calc(100% - 70%)' }}>
                                <div className="absolute w-full h-0.5 bg-white/60"></div>
                                <div className="absolute -right-12 bg-white px-2 py-1 rounded shadow-md border border-gray-200">
                                  <span className="text-xs font-bold text-gray-900">3.5</span>
                                </div>
                              </div>
                            </div>
                            {/* Base label */}
                            <div className="text-center mt-3">
                              <div className="text-2xl font-bold text-[#ef4444]">3.5</div>
                              <div className="text-xs text-gray-500 font-medium">sessions</div>
                            </div>
                          </div>
                          <div className="mt-4 text-center">
                            <div className="text-xs text-gray-600 font-medium">Range: 1-4 sessions</div>
                          </div>
                        </div>

                        {/* Mid Churn */}
                        <div className="flex flex-col items-center">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Mid Churn</div>
                          <div className="relative">
                            {/* Bar */}
                            <div
                              className="w-32 bg-gradient-to-t from-[#f59e0b] to-[#d97706] rounded-t-xl shadow-lg"
                              style={{ height: '200px' }}
                            >
                              {/* Marker line at 8 sessions */}
                              <div className="absolute top-0 left-0 right-0 flex items-center justify-center" style={{ top: 'calc(100% - 40%)' }}>
                                <div className="absolute w-full h-0.5 bg-white/60"></div>
                                <div className="absolute -right-12 bg-white px-2 py-1 rounded shadow-md border border-gray-200">
                                  <span className="text-xs font-bold text-gray-900">8</span>
                                </div>
                              </div>
                            </div>
                            {/* Base label */}
                            <div className="text-center mt-3">
                              <div className="text-2xl font-bold text-[#f59e0b]">8</div>
                              <div className="text-xs text-gray-500 font-medium">sessions</div>
                            </div>
                          </div>
                          <div className="mt-4 text-center">
                            <div className="text-xs text-gray-600 font-medium">Range: 5-25 sessions</div>
                          </div>
                        </div>

                        {/* Late Churn */}
                        <div className="flex flex-col items-center">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Late Churn</div>
                          <div className="relative">
                            {/* Bar */}
                            <div
                              className="w-32 bg-gradient-to-t from-[#10b981] to-[#059669] rounded-t-xl shadow-lg"
                              style={{ height: '280px' }}
                            >
                              {/* Marker line at 30 sessions */}
                              <div className="absolute top-0 left-0 right-0 flex items-center justify-center" style={{ top: 'calc(100% - 50%)' }}>
                                <div className="absolute w-full h-0.5 bg-white/60"></div>
                                <div className="absolute -right-12 bg-white px-2 py-1 rounded shadow-md border border-gray-200">
                                  <span className="text-xs font-bold text-gray-900">30</span>
                                </div>
                              </div>
                            </div>
                            {/* Base label */}
                            <div className="text-center mt-3">
                              <div className="text-2xl font-bold text-[#10b981]">30</div>
                              <div className="text-xs text-gray-500 font-medium">sessions</div>
                            </div>
                          </div>
                          <div className="mt-4 text-center">
                            <div className="text-xs text-gray-600 font-medium">Range: 25+ sessions</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
      )}

      {activeTab === 'admin' && (
        <div className="flex flex-col gap-6 overflow-y-auto">
          {/* Top Row - Main Layout */}
          <div className="flex gap-6 flex-shrink-0" style={{ height: 'calc(100vh - 400px)' }}>
            {/* Left Side - Big Chart */}
            <div className="w-[55%]" style={{ height: '100%' }}>
              <div className="bg-gradient-to-br from-white via-white to-slate-50/20 rounded-[24px] h-full flex flex-col shadow-2xl border-2 border-[#2d6e7e] relative overflow-hidden group hover:shadow-[0_20px_70px_-10px_rgba(45,110,126,0.3)] transition-all duration-300"
                style={{
                  boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                <div className="relative px-6 pt-6 pb-4 flex-shrink-0">
                  <div className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-2">ANALYTICS</div>
                  <h3 className="text-gray-900 text-2xl font-semibold mb-4 flex items-center gap-2">
                    Admin Overview
                    <div className="group/info relative z-[100000]">
                      <Info size={18} className="text-[#2d6e7e] cursor-help" />
                      <div className="absolute left-0 top-8 invisible group-hover/info:visible opacity-0 group-hover/info:opacity-100 transition-all duration-200 w-80 z-[100000]">
                        <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
                          <p className="font-medium mb-1">Administrative Metrics</p>
                          <p className="text-gray-300">Placeholder for administrative analytics and insights.</p>
                          <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                        </div>
                      </div>
                    </div>
                  </h3>
                </div>

                <div className="relative z-10 px-4 pb-4 flex-1 min-h-0 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <p className="text-lg font-semibold">Admin Chart Placeholder</p>
                    <p className="text-sm mt-2">Content coming soon</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Small Charts and Medium Chart */}
            <div className="flex flex-col gap-6 w-[45%]" style={{ height: '100%' }}>
              <div className="flex gap-4 flex-shrink-0">
                {/* Small Chart 1 */}
                <div className="bg-gradient-to-br from-white via-white to-slate-50/20 rounded-[20px] flex flex-col shadow-2xl border-2 border-[#2d6e7e] relative overflow-hidden group hover:shadow-[0_20px_70px_-10px_rgba(45,110,126,0.3)] transition-all duration-300 flex-1"
                  style={{
                    boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                  <div className="relative px-5 pt-5 pb-2">
                    <div className="text-gray-500 text-[10px] font-semibold uppercase tracking-widest mb-2">ANALYTICS</div>
                    <h3 className="text-gray-900 text-lg font-semibold mb-2 flex items-center gap-2">
                      Metric 1
                      <div className="group/info relative z-[100000]">
                        <Info size={14} className="text-[#2d6e7e] cursor-help" />
                        <div className="absolute left-0 top-6 invisible group-hover/info:visible opacity-0 group-hover/info:opacity-100 transition-all duration-200 w-64 z-[100000]">
                          <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
                            <p className="font-medium mb-1">Admin Metric 1</p>
                            <p className="text-gray-300">Placeholder metric description.</p>
                            <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                          </div>
                        </div>
                      </div>
                    </h3>
                    <div className="text-2xl font-bold text-gray-900 tracking-tight">--</div>
                  </div>

                  <div className="relative z-10 px-3 pb-2" style={{ height: '110px' }}>
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                      Placeholder
                    </div>
                  </div>
                </div>

                {/* Small Chart 2 */}
                <div className="bg-gradient-to-br from-white via-white to-slate-50/20 rounded-[20px] flex flex-col shadow-2xl border-2 border-[#2d6e7e] relative overflow-hidden group hover:shadow-[0_20px_70px_-10px_rgba(45,110,126,0.3)] transition-all duration-300 flex-1"
                  style={{
                    boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                  <div className="relative px-5 pt-5 pb-2">
                    <div className="text-gray-500 text-[10px] font-semibold uppercase tracking-widest mb-2">ANALYTICS</div>
                    <h3 className="text-gray-900 text-lg font-semibold mb-2 flex items-center gap-2">
                      Metric 2
                      <div className="group/info relative z-[100000]">
                        <Info size={14} className="text-[#2d6e7e] cursor-help" />
                        <div className="absolute left-0 top-6 invisible group-hover/info:visible opacity-0 group-hover/info:opacity-100 transition-all duration-200 w-64 z-[100000]">
                          <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
                            <p className="font-medium mb-1">Admin Metric 2</p>
                            <p className="text-gray-300">Placeholder metric description.</p>
                            <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                          </div>
                        </div>
                      </div>
                    </h3>
                    <div className="text-2xl font-bold text-gray-900 tracking-tight">--</div>
                  </div>

                  <div className="relative z-10 px-3 pb-2" style={{ height: '110px' }}>
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                      Placeholder
                    </div>
                  </div>
                </div>
              </div>

              {/* Medium Chart */}
              <div className="bg-gradient-to-br from-white via-white to-slate-50/20 rounded-[24px] flex flex-col flex-1 shadow-2xl border-2 border-[#2d6e7e] relative overflow-hidden group hover:shadow-[0_20px_70px_-10px_rgba(45,110,126,0.3)] transition-all duration-300"
                style={{
                  boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                <div className="relative px-6 pt-6 pb-4 flex-shrink-0">
                  <div className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-2">ANALYTICS</div>
                  <h3 className="text-gray-900 text-2xl font-semibold mb-4 flex items-center gap-2">
                    Admin Details
                    <div className="group/info relative z-[100000]">
                      <Info size={18} className="text-[#2d6e7e] cursor-help" />
                      <div className="absolute left-0 top-8 invisible group-hover/info:visible opacity-0 group-hover/info:opacity-100 transition-all duration-200 w-80 z-[100000]">
                        <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
                          <p className="font-medium mb-1">Administrative Details</p>
                          <p className="text-gray-300">Placeholder for detailed administrative metrics.</p>
                          <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                        </div>
                      </div>
                    </div>
                  </h3>
                </div>

                <div className="relative z-10 px-4 pb-4 flex-1 min-h-0 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <p className="text-lg font-semibold">Medium Chart Placeholder</p>
                    <p className="text-sm mt-2">Content coming soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};