import React, { useState, useMemo } from 'react';
import { MetricChart } from './MetricChart';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, LabelList, Legend, CartesianGrid, ReferenceLine } from 'recharts';
import { Info, X, ArrowRight, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

type TabType = 'financial' | 'sessions' | 'capacity-client' | 'retention' | 'insurance' | 'admin';

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

// Full clinician sessions breakdown data
const ALL_CLINICIAN_SESSIONS_DATA = [
  { month: 'Jan', Chen: 138, Rodriguez: 128, Patel: 115, Kim: 125, Johnson: 122 },
  { month: 'Feb', Chen: 142, Rodriguez: 130, Patel: 118, Kim: 128, Johnson: 123 },
  { month: 'Mar', Chen: 140, Rodriguez: 129, Patel: 116, Kim: 127, Johnson: 123 },
  { month: 'Apr', Chen: 145, Rodriguez: 134, Patel: 120, Kim: 132, Johnson: 127 },
  { month: 'May', Chen: 144, Rodriguez: 132, Patel: 119, Kim: 130, Johnson: 126 },
  { month: 'Jun', Chen: 148, Rodriguez: 137, Patel: 123, Kim: 135, Johnson: 129 },
  { month: 'Jul', Chen: 146, Rodriguez: 135, Patel: 122, Kim: 133, Johnson: 129 },
  { month: 'Aug', Chen: 152, Rodriguez: 140, Patel: 126, Kim: 138, Johnson: 133 },
  { month: 'Sep', Chen: 142, Rodriguez: 131, Patel: 118, Kim: 129, Johnson: 125 },
  { month: 'Oct', Chen: 157, Rodriguez: 145, Patel: 130, Kim: 143, Johnson: 137 },
  { month: 'Nov', Chen: 150, Rodriguez: 139, Patel: 125, Kim: 137, Johnson: 132 },
  { month: 'Dec', Chen: 154, Rodriguez: 142, Patel: 128, Kim: 140, Johnson: 134 }
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

// Admin Analytics Data

// Client Balance Aging data
const ALL_CLIENT_BALANCE_AGING_DATA = [
  { month: 'Jan', current: 12500, days1_30: 8200, days31_60: 4100, days61_plus: 2800 },
  { month: 'Feb', current: 11800, days1_30: 7900, days31_60: 3900, days61_plus: 3200 },
  { month: 'Mar', current: 13200, days1_30: 8500, days31_60: 4300, days61_plus: 2900 },
  { month: 'Apr', current: 12900, days1_30: 8100, days31_60: 4200, days61_plus: 3100 },
  { month: 'May', current: 11500, days1_30: 7600, days31_60: 3800, days61_plus: 2700 },
  { month: 'Jun', current: 13500, days1_30: 8800, days31_60: 4500, days61_plus: 3000 },
  { month: 'Jul', current: 12200, days1_30: 7800, days31_60: 4000, days61_plus: 2900 },
  { month: 'Aug', current: 13800, days1_30: 9100, days31_60: 4600, days61_plus: 3200 },
  { month: 'Sep', current: 11900, days1_30: 7700, days31_60: 3900, days61_plus: 2800 },
  { month: 'Oct', current: 14200, days1_30: 9400, days31_60: 4800, days61_plus: 3400 },
  { month: 'Nov', current: 13100, days1_30: 8600, days31_60: 4400, days61_plus: 3100 },
  { month: 'Dec', current: 13600, days1_30: 8900, days31_60: 4500, days61_plus: 3000 }
];

// Top 5 Clients by Past-Due Balance (December data)
const TOP_CLIENTS_PAST_DUE = [
  { name: 'Client A', balance: 2850, worstBucket: '61+ days' },
  { name: 'Client B', balance: 2200, worstBucket: '31-60 days' },
  { name: 'Client C', balance: 1950, worstBucket: '61+ days' },
  { name: 'Client D', balance: 1680, worstBucket: '1-30 days' },
  { name: 'Client E', balance: 1520, worstBucket: '31-60 days' }
];

// Claims Status data
const ALL_CLAIMS_STATUS_DATA = [
  { month: 'Jan', paid: 118, rejected: 8, denied: 4, deductible: 14 },
  { month: 'Feb', paid: 122, rejected: 7, denied: 3, deductible: 15 },
  { month: 'Mar', paid: 120, rejected: 9, denied: 4, deductible: 13 },
  { month: 'Apr', paid: 128, rejected: 6, denied: 3, deductible: 16 },
  { month: 'May', paid: 125, rejected: 8, denied: 4, deductible: 14 },
  { month: 'Jun', paid: 132, rejected: 7, denied: 3, deductible: 17 },
  { month: 'Jul', paid: 127, rejected: 9, denied: 5, deductible: 15 },
  { month: 'Aug', paid: 135, rejected: 6, denied: 3, deductible: 18 },
  { month: 'Sep', paid: 121, rejected: 10, denied: 6, deductible: 13 },
  { month: 'Oct', paid: 142, rejected: 7, denied: 4, deductible: 19 },
  { month: 'Nov', paid: 136, rejected: 8, denied: 4, deductible: 17 },
  { month: 'Dec', paid: 139, rejected: 7, denied: 3, deductible: 18 }
];

// Outstanding Claims by Aging
const OUTSTANDING_CLAIMS_AGING = [
  { category: 'Unbilled', amount: 8500 },
  { category: 'Due 30', amount: 12300 },
  { category: 'Due 60', amount: 6700 },
  { category: 'Due 90+', amount: 4200 }
];

// Notes Status data
const ALL_NOTES_STATUS_DATA = [
  { month: 'Jan', noNote: 15, unlocked: 28, locked: 585 },
  { month: 'Feb', noNote: 12, unlocked: 25, locked: 604 },
  { month: 'Mar', noNote: 18, unlocked: 31, locked: 586 },
  { month: 'Apr', noNote: 14, unlocked: 27, locked: 617 },
  { month: 'May', noNote: 16, unlocked: 29, locked: 606 },
  { month: 'Jun', noNote: 11, unlocked: 24, locked: 637 },
  { month: 'Jul', noNote: 19, unlocked: 33, locked: 613 },
  { month: 'Aug', noNote: 13, unlocked: 26, locked: 650 },
  { month: 'Sep', noNote: 21, unlocked: 35, locked: 589 },
  { month: 'Oct', noNote: 10, unlocked: 22, locked: 680 },
  { month: 'Nov', noNote: 17, unlocked: 30, locked: 636 },
  { month: 'Dec', noNote: 14, unlocked: 28, locked: 656 }
];

// At-Risk Compliance List (oldest appointments without notes)
const AT_RISK_COMPLIANCE = [
  { date: '2025-11-15', clientInitials: 'J.D.', clinician: 'Chen' },
  { date: '2025-11-18', clientInitials: 'M.S.', clinician: 'Rodriguez' },
  { date: '2025-11-20', clientInitials: 'A.K.', clinician: 'Patel' },
  { date: '2025-11-22', clientInitials: 'L.B.', clinician: 'Kim' },
  { date: '2025-11-25', clientInitials: 'R.T.', clinician: 'Johnson' }
];

// Reminder Delivery data
const ALL_REMINDER_DELIVERY_DATA = [
  { month: 'Jan', sent: 1245, failed: 18 },
  { month: 'Feb', sent: 1289, failed: 22 },
  { month: 'Mar', sent: 1267, failed: 15 },
  { month: 'Apr', sent: 1324, failed: 19 },
  { month: 'May', sent: 1301, failed: 21 },
  { month: 'Jun', sent: 1358, failed: 17 },
  { month: 'Jul', sent: 1312, failed: 23 },
  { month: 'Aug', sent: 1389, failed: 16 },
  { month: 'Sep', sent: 1278, failed: 25 },
  { month: 'Oct', sent: 1456, failed: 18 },
  { month: 'Nov', sent: 1398, failed: 20 },
  { month: 'Dec', sent: 1423, failed: 19 }
];

type TimePeriod = 'last-12-months' | 'this-year' | 'this-quarter' | 'last-quarter' | 'this-month' | 'last-month' | '2024' | '2023' | 'custom';

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
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('last-12-months');
  const [hoveredDonutSegment, setHoveredDonutSegment] = useState<{ label: string; value: number; percent: number; color: string } | null>(null);
  const [showClinicianBreakdown, setShowClinicianBreakdown] = useState(false);
  const [showSessionsClinicianBreakdown, setShowSessionsClinicianBreakdown] = useState(false);
  const [hoveredClinicianBar, setHoveredClinicianBar] = useState<{ month: string; clinician: string; value: number; color: string } | null>(null);
  const [hoveredSessionsClinicianBar, setHoveredSessionsClinicianBar] = useState<{ month: string; clinician: string; value: number; color: string } | null>(null);
  const [showClientBreakdown, setShowClientBreakdown] = useState(false);

  // Custom Date Picker State - Simplified
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customStartMonth, setCustomStartMonth] = useState<number>(0);
  const [customEndMonth, setCustomEndMonth] = useState<number>(11);
  const [customYear, setCustomYear] = useState<number>(2024);
  const [customStartYear] = useState<number>(2024); // For compatibility
  const [customEndYear] = useState<number>(2024); // For compatibility

  const tabs: { id: TabType; label: string; shortLabel: string }[] = [
    { id: 'financial', label: 'Financial Analysis', shortLabel: 'Financial' },
    { id: 'sessions', label: 'Sessions Analysis', shortLabel: 'Sessions' },
    { id: 'capacity-client', label: 'Capacity & Client Analysis', shortLabel: 'Capacity & Client' },
    { id: 'retention', label: 'Retention Analysis', shortLabel: 'Retention' },
    { id: 'insurance', label: 'Insurance Analysis', shortLabel: 'Insurance' },
    { id: 'admin', label: 'Admin Analysis', shortLabel: 'Admin' }
  ];

  const timePeriods: { id: TimePeriod; label: string }[] = [
    { id: 'last-12-months', label: 'Last 12 months' },
    { id: 'this-year', label: 'This Year' },
    { id: 'this-quarter', label: 'This Quarter' },
    { id: 'last-quarter', label: 'Last Quarter' },
    { id: 'this-month', label: 'This Month' },
    { id: 'last-month', label: 'Last Month' },
    { id: '2024', label: '2024' },
    { id: '2023', label: '2023' }
  ];

  // Get current date info for period calculations
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-11
  const currentQuarter = Math.floor(currentMonth / 3); // 0-3

  // Filter data based on selected time period
  const getDataForPeriod = <T extends { month: string }>(data: T[], period: TimePeriod): T[] => {
    switch (period) {
      case 'last-12-months':
        return data.slice(-12);
      case 'this-year':
        // All data for current year (assuming data is 2025)
        return data.slice(0, currentMonth + 1);
      case 'this-quarter': {
        const quarterStart = currentQuarter * 3;
        return data.filter((_, idx) => idx >= quarterStart && idx <= currentMonth);
      }
      case 'last-quarter': {
        const lastQuarter = currentQuarter === 0 ? 3 : currentQuarter - 1;
        const lastQuarterStart = lastQuarter * 3;
        const lastQuarterEnd = lastQuarterStart + 2;
        return data.filter((_, idx) => idx >= lastQuarterStart && idx <= lastQuarterEnd);
      }
      case 'this-month':
        return data.filter((_, idx) => idx === currentMonth);
      case 'last-month': {
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        return data.filter((_, idx) => idx === lastMonth);
      }
      case '2024':
        // For demo purposes, return all 12 months as "2024 data"
        return data;
      case '2023':
        // For demo, return same data as placeholder for 2023
        return data;
      case 'custom':
        // Filter based on custom start/end months
        return data.filter((item) => {
          const itemIndex = MONTH_MAP[item.month];
          // For simplicity, just filter by month index within the same year
          return itemIndex >= customStartMonth && itemIndex <= customEndMonth;
        });
      default:
        return data.slice(-12);
    }
  };

  // Get human-readable date range label for the selected period
  const getDateRangeLabel = (): string => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    switch (timePeriod) {
      case 'last-12-months': {
        const startMonth = (currentMonth + 1) % 12;
        return `${months[startMonth]} 2024 – ${months[currentMonth]} 2025`;
      }
      case 'this-year':
        return `Jan – ${months[currentMonth]} 2025`;
      case 'this-quarter': {
        const quarterStart = currentQuarter * 3;
        return `${months[quarterStart]} – ${months[currentMonth]} 2025`;
      }
      case 'last-quarter': {
        const lastQuarter = currentQuarter === 0 ? 3 : currentQuarter - 1;
        const lastQuarterStart = lastQuarter * 3;
        const lastQuarterEnd = lastQuarterStart + 2;
        const year = currentQuarter === 0 ? 2024 : 2025;
        return `${months[lastQuarterStart]} – ${months[lastQuarterEnd]} ${year}`;
      }
      case 'this-month':
        return `${fullMonths[currentMonth]} 2025`;
      case 'last-month': {
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const year = currentMonth === 0 ? 2024 : 2025;
        return `${fullMonths[lastMonth]} ${year}`;
      }
      case '2024':
        return 'Jan – Dec 2024';
      case '2023':
        return 'Jan – Dec 2023';
      case 'custom':
        return `${months[customStartMonth]} ${customStartYear} – ${months[customEndMonth]} ${customEndYear}`;
      default:
        return '';
    }
  };

  // Format custom date range for display
  const formatCustomRange = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (customStartMonth === customEndMonth) {
      return `${months[customStartMonth]} ${customYear}`;
    }
    return `${months[customStartMonth]} – ${months[customEndMonth]} ${customYear}`;
  };

  // Apply custom range
  const applyCustomRange = () => {
    setTimePeriod('custom');
    setShowDatePicker(false);
  };

  // Memoized filtered data
  const REVENUE_DATA = useMemo(() => getDataForPeriod(ALL_REVENUE_DATA, timePeriod), [timePeriod, customStartMonth, customEndMonth, customStartYear, customEndYear]);
  const SESSIONS_DATA = useMemo(() => getDataForPeriod(ALL_SESSIONS_DATA, timePeriod), [timePeriod, customStartMonth, customEndMonth, customStartYear, customEndYear]);
  const CLINICIAN_REVENUE_DATA = useMemo(() => getDataForPeriod(ALL_CLINICIAN_REVENUE_DATA, timePeriod), [timePeriod, customStartMonth, customEndMonth, customStartYear, customEndYear]);
  const CLINICIAN_SESSIONS_DATA = useMemo(() => getDataForPeriod(ALL_CLINICIAN_SESSIONS_DATA, timePeriod), [timePeriod, customStartMonth, customEndMonth, customStartYear, customEndYear]);
  const REVENUE_BREAKDOWN_DATA = useMemo(() => getDataForPeriod(ALL_REVENUE_BREAKDOWN_DATA, timePeriod), [timePeriod, customStartMonth, customEndMonth, customStartYear, customEndYear]);
  const CLIENT_GROWTH_DATA = useMemo(() => getDataForPeriod(ALL_CLIENT_GROWTH_DATA, timePeriod), [timePeriod, customStartMonth, customEndMonth, customStartYear, customEndYear]);
  const CHURN_BY_CLINICIAN_DATA = useMemo(() => getDataForPeriod(ALL_CHURN_BY_CLINICIAN_DATA, timePeriod), [timePeriod, customStartMonth, customEndMonth, customStartYear, customEndYear]);
  const CHURN_TIMING_DATA = useMemo(() => getDataForPeriod(ALL_CHURN_TIMING_DATA, timePeriod), [timePeriod, customStartMonth, customEndMonth, customStartYear, customEndYear]);

  // Admin Analytics memoized data
  const CLIENT_BALANCE_AGING_DATA = useMemo(() => getDataForPeriod(ALL_CLIENT_BALANCE_AGING_DATA, timePeriod), [timePeriod, customStartMonth, customEndMonth, customStartYear, customEndYear]);
  const CLAIMS_STATUS_DATA = useMemo(() => getDataForPeriod(ALL_CLAIMS_STATUS_DATA, timePeriod), [timePeriod, customStartMonth, customEndMonth, customStartYear, customEndYear]);
  const NOTES_STATUS_DATA = useMemo(() => getDataForPeriod(ALL_NOTES_STATUS_DATA, timePeriod), [timePeriod, customStartMonth, customEndMonth, customStartYear, customEndYear]);
  const REMINDER_DELIVERY_DATA = useMemo(() => getDataForPeriod(ALL_REMINDER_DELIVERY_DATA, timePeriod), [timePeriod, customStartMonth, customEndMonth, customStartYear, customEndYear]);

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

  // Render Financial and Sessions tabs with new design
  const isFinancialTab = activeTab === 'financial';
  const isSessionsTab = activeTab === 'sessions';

  return (
    <div
      className={`flex-1 overflow-y-auto h-[calc(100vh-80px)] ${(isFinancialTab || isSessionsTab) ? 'bg-gradient-to-br from-stone-50 via-orange-50/20 to-stone-100/50' : 'p-8 pt-2'}`}
    >
      {/* Warm gradient overlay - same as Practice Overview */}
      {(isFinancialTab || isSessionsTab) && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at top, rgba(251, 191, 36, 0.03) 0%, transparent 50%)',
          }}
        />
      )}

      {/* Financial Tab - Fully Redesigned */}
      {isFinancialTab && (
        <div className="min-h-full relative">
          {/* Integrated Header */}
          <div className="sticky top-0 z-50 px-10 pt-8 pb-6" style={{ background: 'linear-gradient(180deg, rgba(250,250,249,0.97) 0%, rgba(250,250,249,0.95) 80%, transparent 100%)' }}>
            <div className="flex items-end justify-between">
              {/* Title & Breadcrumb */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-stone-400 text-sm font-medium uppercase tracking-widest">Detailed Analysis</span>
                  <span className="text-stone-300">/</span>
                  <span className="text-emerald-600 text-sm font-bold uppercase tracking-widest">Financial</span>
                </div>
                <div className="flex items-baseline gap-4">
                  <h1
                    className="text-5xl text-stone-900 font-bold tracking-tight"
                    style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                  >
                    Financial Performance
                  </h1>
                  <span className="text-stone-400 text-base font-medium">
                    {getDateRangeLabel()}
                  </span>
                </div>
              </div>

              {/* Time Period Selector - Redesigned */}
              <div className="flex items-center gap-4 relative">
                <div
                  className="flex items-center gap-1 p-1.5 rounded-2xl bg-white/80 backdrop-blur-sm"
                  style={{
                    boxShadow: '0 4px 20px -4px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.03)'
                  }}
                >
                  {timePeriods.map((period) => (
                    <button
                      key={period.id}
                      onClick={() => setTimePeriod(period.id)}
                      className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                        timePeriod === period.id
                          ? 'bg-stone-900 text-white shadow-lg'
                          : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                  {/* Custom Range Button */}
                  <button
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className={`group px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-500 flex items-center gap-2.5 relative overflow-hidden ${
                      timePeriod === 'custom'
                        ? 'text-white shadow-lg'
                        : 'text-stone-500 hover:text-stone-900'
                    }`}
                    style={{
                      background: timePeriod === 'custom'
                        ? 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #1c1917 100%)'
                        : 'transparent'
                    }}
                  >
                    <Calendar
                      size={16}
                      className={`transition-transform duration-500 ${showDatePicker ? 'rotate-12' : 'group-hover:rotate-6'}`}
                    />
                    <span>{timePeriod === 'custom' ? formatCustomRange() : 'Custom'}</span>
                  </button>
                </div>

                {/* Simple & Elegant Date Picker */}
                {showDatePicker && (
                  <div
                    className="absolute top-full right-0 mt-3 z-[100000] rounded-2xl bg-white p-6"
                    style={{
                      width: '340px',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                      animation: 'fadeIn 0.2s ease-out'
                    }}
                  >
                    <style>{`
                      @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(-8px); }
                        to { opacity: 1; transform: translateY(0); }
                      }
                    `}</style>

                    {/* Header */}
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-stone-900 text-lg font-semibold">Custom Range</h3>
                      <button
                        onClick={() => setShowDatePicker(false)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {/* Year Selector */}
                    <div className="flex items-center justify-center gap-4 mb-5 pb-5 border-b border-stone-100">
                      <button
                        onClick={() => setCustomYear(prev => prev - 1)}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-all"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <span
                        className="text-stone-900 text-2xl font-bold tabular-nums w-20 text-center"
                        style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                      >
                        {customYear}
                      </span>
                      <button
                        onClick={() => setCustomYear(prev => prev + 1)}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-all"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>

                    {/* Month Grid - Click to set start, click again to set end */}
                    <div className="grid grid-cols-4 gap-2 mb-5">
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, idx) => {
                        const isStart = idx === customStartMonth;
                        const isEnd = idx === customEndMonth;
                        const isInRange = idx > customStartMonth && idx < customEndMonth;
                        const isSelected = isStart || isEnd;

                        return (
                          <button
                            key={month}
                            onClick={() => {
                              // Intuitive: clicking any month sets it as start, then click another for end
                              if (customStartMonth === customEndMonth) {
                                // Currently single month selected - extend range
                                if (idx < customStartMonth) {
                                  setCustomStartMonth(idx);
                                } else if (idx > customStartMonth) {
                                  setCustomEndMonth(idx);
                                }
                              } else {
                                // Range exists - clicking resets to single month
                                setCustomStartMonth(idx);
                                setCustomEndMonth(idx);
                              }
                            }}
                            className={`h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
                              isSelected
                                ? 'bg-stone-900 text-white'
                                : isInRange
                                  ? 'bg-stone-100 text-stone-700'
                                  : 'text-stone-600 hover:bg-stone-50'
                            }`}
                          >
                            {month}
                          </button>
                        );
                      })}
                    </div>

                    {/* Selected Range Display */}
                    <div className="flex items-center justify-center gap-3 mb-5 py-3 px-4 rounded-xl bg-stone-50">
                      <span className="text-stone-900 font-semibold">
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][customStartMonth]}
                      </span>
                      {customStartMonth !== customEndMonth && (
                        <>
                          <span className="text-stone-400">→</span>
                          <span className="text-stone-900 font-semibold">
                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][customEndMonth]}
                          </span>
                        </>
                      )}
                      <span className="text-stone-500">{customYear}</span>
                    </div>

                    {/* Apply Button */}
                    <button
                      onClick={applyCustomRange}
                      className="w-full py-3 rounded-xl bg-stone-900 text-white font-semibold transition-all hover:bg-stone-800 active:scale-[0.98]"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Tab Navigation - Minimal Pills */}
            <div className="flex items-center gap-3 mt-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-full text-base font-semibold transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-stone-900 text-white shadow-md'
                      : 'text-stone-500 hover:text-stone-800 border border-stone-300 hover:border-stone-400 bg-white/50'
                  }`}
                >
                  {tab.shortLabel}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="px-10 pb-10 space-y-8">

            {/* Hero Stats Row */}
            <div className="grid grid-cols-4 gap-6">
              {/* Total Gross Revenue Card */}
              <div
                className="rounded-3xl p-6 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
                  boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)'
                }}
              >
                <h3
                  className="text-stone-800 text-2xl font-semibold mb-4"
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  Total Gross Revenue
                </h3>
                <span
                  className="text-stone-900 font-bold block"
                  style={{ fontSize: '2.5rem', lineHeight: 1, fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  ${(REVENUE_DATA.reduce((sum, item) => sum + item.value, 0) / 1000000).toFixed(2)}M
                </span>
                <p className="text-stone-500 text-lg mt-3">
                  across {REVENUE_DATA.length} months
                </p>
              </div>

              {/* Total Net Revenue Card */}
              <div
                className="rounded-3xl p-6 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
                  boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)'
                }}
              >
                <h3
                  className="text-stone-800 text-2xl font-semibold mb-4"
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  Total Net Revenue
                </h3>
                <span
                  className="text-stone-900 font-bold block"
                  style={{ fontSize: '2.5rem', lineHeight: 1, fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  ${(REVENUE_BREAKDOWN_DATA.reduce((sum, item) => sum + item.netRevenue, 0) / 1000).toFixed(0)}k
                </span>
                <p className="text-stone-500 text-lg mt-3">
                  {((REVENUE_BREAKDOWN_DATA.reduce((sum, item) => sum + item.netRevenue, 0) / REVENUE_BREAKDOWN_DATA.reduce((sum, item) => sum + item.grossRevenue, 0)) * 100).toFixed(1)}% avg margin
                </p>
              </div>

              {/* Goal Achievement Card */}
              <div
                className="rounded-3xl p-6 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
                  boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)'
                }}
              >
                <h3
                  className="text-stone-800 text-2xl font-semibold mb-4"
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  Goal Achievement
                </h3>
                {(() => {
                  const MONTHLY_GOAL = 150000;
                  const monthsMet = REVENUE_DATA.filter(item => item.value >= MONTHLY_GOAL).length;
                  return (
                    <>
                      <span
                        className="text-stone-900 font-bold block"
                        style={{ fontSize: '2.5rem', lineHeight: 1, fontFamily: "'DM Serif Display', Georgia, serif" }}
                      >
                        {monthsMet}/{REVENUE_DATA.length}
                      </span>
                      <p className="text-stone-500 text-lg mt-3">
                        months hit $150k goal
                      </p>
                    </>
                  );
                })()}
              </div>

              {/* Avg Revenue Card - Monthly & Weekly in one line */}
              <div
                className="rounded-3xl p-6 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
                  boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)'
                }}
              >
                <h3
                  className="text-stone-800 text-2xl font-semibold mb-4"
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  Avg Revenue
                </h3>
                <span
                  className="text-stone-900 font-bold block"
                  style={{ fontSize: '2.5rem', lineHeight: 1, fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  ${(REVENUE_DATA.reduce((sum, item) => sum + item.value, 0) / REVENUE_DATA.length / 1000).toFixed(0)}k
                  <span className="text-stone-400 text-xl font-medium" style={{ fontFamily: "system-ui, sans-serif" }}>/mo</span>
                </span>
                <p className="text-stone-500 text-lg mt-3">
                  ${(REVENUE_DATA.reduce((sum, item) => sum + item.value, 0) / REVENUE_DATA.length / 4.33 / 1000).toFixed(1)}k/week
                </p>
              </div>
            </div>

            {/* Revenue Performance & Cost Breakdown - Side by Side */}
            <div className="grid grid-cols-2 gap-6">
              {/* Revenue Performance - Vertical Bar Chart */}
              <div
                className="rounded-2xl p-8 relative flex flex-col overflow-hidden"
                style={{
                  background: '#ffffff',
                  height: '750px',
                  border: '2px solid #d6d3d1',
                  borderLeft: '4px solid #059669'
                }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-stone-800 text-2xl font-semibold mb-2" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                      Revenue Performance
                    </h3>
                    <p className="text-stone-500 text-lg">Monthly breakdown</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Hover tooltip for clinician breakdown - positioned within header area */}
                    {hoveredClinicianBar && (
                      <div
                        className="px-3 py-2 rounded-lg shadow-xl pointer-events-none animate-pulse"
                        style={{
                          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: hoveredClinicianBar.color }} />
                          <span className="text-white font-semibold">{hoveredClinicianBar.clinician}</span>
                          <span className="text-indigo-300">•</span>
                          <span className="text-white font-bold">${(hoveredClinicianBar.value / 1000).toFixed(1)}k</span>
                          <span className="text-indigo-300 text-sm">({hoveredClinicianBar.month})</span>
                        </div>
                      </div>
                    )}
                    {/* Toggle Button */}
                    {!hoveredClinicianBar && (
                      <button
                        onClick={() => setShowClinicianBreakdown(!showClinicianBreakdown)}
                        className="relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300"
                        style={{
                          background: showClinicianBreakdown
                            ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)'
                            : 'linear-gradient(135deg, #f5f5f4 0%, #e7e5e4 100%)',
                          boxShadow: showClinicianBreakdown
                            ? '0 4px 12px -2px rgba(30, 27, 75, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
                            : '0 2px 8px -2px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)'
                        }}
                      >
                        <svg
                          className={`w-4 h-4 transition-colors duration-300 ${showClinicianBreakdown ? 'text-indigo-300' : 'text-stone-500'}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className={`text-sm font-semibold transition-colors duration-300 ${showClinicianBreakdown ? 'text-white' : 'text-stone-600'}`}>
                          By Clinician
                        </span>
                        <div
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${showClinicianBreakdown ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' : 'bg-stone-400'}`}
                        />
                      </button>
                    )}
                    {/* Goal indicator */}
                    {!showClinicianBreakdown && !hoveredClinicianBar && (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-300/50">
                        <div className="w-4 h-0.5 bg-amber-500" style={{ borderTop: '2px dashed #f59e0b' }} />
                        <span className="text-amber-700 text-sm font-semibold">$150k Goal</span>
                      </div>
                    )}
                    {/* Revenue Report Button */}
                    <button
                      className="group relative px-6 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 ease-out transform hover:scale-[1.03] active:scale-[0.98]"
                      style={{
                        background: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #1c1917 100%)',
                        boxShadow: '0 8px 20px -6px rgba(28, 25, 23, 0.4), 0 4px 8px -4px rgba(28, 25, 23, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
                        color: '#fafaf9',
                        letterSpacing: '0.02em'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 12px 24px -6px rgba(28, 25, 23, 0.5), 0 6px 12px -4px rgba(28, 25, 23, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 8px 20px -6px rgba(28, 25, 23, 0.4), 0 4px 8px -4px rgba(28, 25, 23, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)';
                      }}
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        Revenue Report
                        <ArrowRight
                          size={16}
                          className="transition-transform duration-300 group-hover:translate-x-1"
                          strokeWidth={2.5}
                        />
                      </span>
                    </button>
                  </div>
                </div>

                {/* Vertical Bar Chart */}
                <div className="flex flex-1 min-h-0">
                  {/* Y-axis labels */}
                  <div className="flex flex-col justify-between text-sm text-stone-500 font-semibold pr-4 py-1">
                    <span>$160k</span>
                    <span>$120k</span>
                    <span>$80k</span>
                    <span>$40k</span>
                    <span>$0</span>
                  </div>

                  {/* Chart area */}
                  <div className="flex-1 relative">
                    {/* Background grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div key={i} className="border-t border-stone-100 w-full" />
                      ))}
                    </div>

                    {/* Goal line - horizontal (only in total view) */}
                    {!showClinicianBreakdown && (
                      <div
                        className="absolute left-0 right-0 border-t-2 border-dashed border-amber-400 z-10 pointer-events-none"
                        style={{ top: `${((160000 - 150000) / 160000) * 100}%` }}
                      />
                    )}

                    {/* Bars - Total View */}
                    {!showClinicianBreakdown && (
                      <div className="absolute inset-0 flex items-end justify-around px-2">
                        {REVENUE_DATA.map((item, idx) => {
                          const heightPercent = (item.value / 160000) * 100;
                          const isAboveGoal = item.value >= 150000;
                          const isCurrentMonth = idx === REVENUE_DATA.length - 1;

                          return (
                            <div
                              key={item.month}
                              className="group relative flex flex-col items-center justify-end h-full"
                              style={{ flex: '1', maxWidth: '72px' }}
                            >
                              {/* Single bar container */}
                              <div className="flex items-end w-full justify-center h-full">
                                <div className="relative flex flex-col items-end justify-end h-full" style={{ width: '65%' }}>
                                  <span className={`text-sm font-bold mb-1.5 ${isAboveGoal ? 'text-emerald-600' : 'text-blue-600'}`}>
                                    ${(item.value / 1000).toFixed(0)}k
                                  </span>
                                  <div
                                    className={`w-full rounded-t-xl transition-all duration-300 cursor-pointer relative overflow-hidden ${
                                      isCurrentMonth
                                        ? isAboveGoal
                                          ? 'ring-2 ring-emerald-400/40 ring-offset-2'
                                          : 'ring-2 ring-blue-400/40 ring-offset-2'
                                        : 'hover:brightness-110'
                                    }`}
                                    style={{
                                      height: `${heightPercent}%`,
                                      background: isAboveGoal
                                        ? 'linear-gradient(180deg, #34d399 0%, #059669 100%)'
                                        : 'linear-gradient(180deg, #60a5fa 0%, #2563eb 100%)',
                                      boxShadow: isAboveGoal
                                        ? '0 4px 12px -2px rgba(16, 185, 129, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)'
                                        : '0 4px 12px -2px rgba(37, 99, 235, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)'
                                    }}
                                  >
                                    {/* Shine effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Bars - Clinician Breakdown (Stacked) */}
                    {showClinicianBreakdown && (
                      <div className="absolute inset-0 flex items-end justify-around gap-1 px-4">
                        {(() => {
                          const clinicianColors = {
                            Chen: { color: '#7c3aed', gradient: 'linear-gradient(180deg, #a78bfa 0%, #7c3aed 100%)' },
                            Rodriguez: { color: '#0891b2', gradient: 'linear-gradient(180deg, #22d3ee 0%, #0891b2 100%)' },
                            Patel: { color: '#d97706', gradient: 'linear-gradient(180deg, #fbbf24 0%, #d97706 100%)' },
                            Kim: { color: '#db2777', gradient: 'linear-gradient(180deg, #f472b6 0%, #db2777 100%)' },
                            Johnson: { color: '#059669', gradient: 'linear-gradient(180deg, #34d399 0%, #059669 100%)' }
                          };
                          const clinicianOrder = ['Johnson', 'Kim', 'Patel', 'Rodriguez', 'Chen'];

                          return CLINICIAN_REVENUE_DATA.map((item, idx) => {
                            const total = (item.Chen || 0) + (item.Rodriguez || 0) + (item.Patel || 0) + (item.Kim || 0) + (item.Johnson || 0);
                            const totalHeightPx = (total / 160000) * 320;
                            const isCurrentMonth = idx === CLINICIAN_REVENUE_DATA.length - 1;

                            return (
                              <div
                                key={item.month}
                                className="group relative flex-1 flex flex-col items-center justify-end"
                                style={{ maxWidth: '50px' }}
                              >
                                {/* Total value label */}
                                <div className="mb-2 z-20">
                                  <span className="text-sm font-bold text-indigo-600">
                                    ${(total / 1000).toFixed(0)}k
                                  </span>
                                </div>
                                {/* Stacked Bar */}
                                <div
                                  className="relative rounded-t-md overflow-hidden transition-all duration-300"
                                  style={{
                                    height: `${totalHeightPx}px`,
                                    width: '100%',
                                    maxWidth: '36px',
                                    boxShadow: isCurrentMonth ? '0 4px 12px -2px rgba(124, 58, 237, 0.3)' : '0 2px 8px -2px rgba(0,0,0,0.1)'
                                  }}
                                >
                                  {clinicianOrder.map((clinician) => {
                                    const value = item[clinician as keyof typeof item] as number || 0;
                                    const segmentHeightPercent = (value / total) * 100;
                                    const colorData = clinicianColors[clinician as keyof typeof clinicianColors];

                                    return (
                                      <div
                                        key={clinician}
                                        className="w-full cursor-pointer transition-all duration-200 hover:brightness-110"
                                        style={{
                                          height: `${segmentHeightPercent}%`,
                                          background: colorData.gradient,
                                          borderBottom: '1px solid rgba(255,255,255,0.2)'
                                        }}
                                        onMouseEnter={() => setHoveredClinicianBar({
                                          month: item.month,
                                          clinician,
                                          value,
                                          color: colorData.color
                                        })}
                                        onMouseLeave={() => setHoveredClinicianBar(null)}
                                      />
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Month labels */}
                <div className="flex mt-4 pl-12 flex-shrink-0">
                  <div className="flex-1 flex justify-around px-2">
                    {(showClinicianBreakdown ? CLINICIAN_REVENUE_DATA : REVENUE_DATA).map((item, idx) => {
                      const isCurrentMonth = idx === (showClinicianBreakdown ? CLINICIAN_REVENUE_DATA : REVENUE_DATA).length - 1;
                      return (
                        <div
                          key={item.month}
                          className="text-center"
                          style={{ flex: '1', maxWidth: '72px' }}
                        >
                          <span className={`text-sm font-semibold ${
                            isCurrentMonth
                              ? 'text-stone-900 bg-stone-900/5 px-3 py-1 rounded-full'
                              : 'text-stone-500'
                          }`}>
                            {item.month}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Insights Row */}
                <div className="flex items-center justify-between pt-5 border-t border-stone-200/60 flex-shrink-0 mt-4">
                  {showClinicianBreakdown ? (
                    <div className="flex items-center gap-5 w-full flex-wrap">
                      {[
                        { name: 'Chen', color: '#7c3aed' },
                        { name: 'Rodriguez', color: '#0891b2' },
                        { name: 'Patel', color: '#d97706' },
                        { name: 'Kim', color: '#db2777' },
                        { name: 'Johnson', color: '#059669' }
                      ].map((clinician) => (
                        <div key={clinician.name} className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: clinician.color }}
                          />
                          <span className="text-stone-600 text-base font-medium">{clinician.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    (() => {
                      const revenueValues = REVENUE_DATA.map(item => item.value);
                      const maxRevenue = Math.max(...revenueValues);
                      const minRevenue = Math.min(...revenueValues);
                      const bestMonth = REVENUE_DATA.find(item => item.value === maxRevenue)?.month || '';
                      const lowestMonth = REVENUE_DATA.find(item => item.value === minRevenue)?.month || '';

                      // Calculate month-over-month trend (comparing last month to previous)
                      const lastMonth = REVENUE_DATA[REVENUE_DATA.length - 1]?.value || 0;
                      const prevMonth = REVENUE_DATA[REVENUE_DATA.length - 2]?.value || 0;
                      const momChange = prevMonth > 0 ? ((lastMonth - prevMonth) / prevMonth * 100) : 0;

                      return (
                        <div className="flex items-center gap-8 w-full">
                          <div className="flex items-center gap-2">
                            <span className="text-stone-500 text-base">Best Month:</span>
                            <span className="text-emerald-600 font-bold text-base">
                              {bestMonth} (${(maxRevenue / 1000).toFixed(0)}k)
                            </span>
                          </div>
                          <div className="w-px h-5 bg-stone-200" />
                          <div className="flex items-center gap-2">
                            <span className="text-stone-500 text-base">MoM Trend:</span>
                            <span className={`font-bold text-base ${momChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {momChange >= 0 ? '+' : ''}{momChange.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-px h-5 bg-stone-200" />
                          <div className="flex items-center gap-2">
                            <span className="text-stone-500 text-base">Range:</span>
                            <span className="text-stone-700 font-bold text-base">
                              ${(minRevenue / 1000).toFixed(0)}k – ${(maxRevenue / 1000).toFixed(0)}k
                            </span>
                          </div>
                        </div>
                      );
                    })()
                  )}
                </div>
              </div>

              {/* Revenue Distribution - Donut Chart */}
              <div
                className="rounded-3xl p-8 overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
                  boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)',
                  height: '750px'
                }}
              >
                <div className="mb-6">
                  <h3 className="text-stone-800 text-2xl font-semibold mb-2" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                    Revenue Distribution
                  </h3>
                  <p className="text-stone-500 text-lg">Total across all {REVENUE_BREAKDOWN_DATA.length} selected month{REVENUE_BREAKDOWN_DATA.length !== 1 ? 's' : ''}</p>
                </div>

                {/* Donut Chart */}
                {(() => {
                  // Sum all months in the selected period
                  const gross = REVENUE_BREAKDOWN_DATA.reduce((sum, item) => sum + item.grossRevenue, 0) || 1;
                  const segments = [
                    { label: 'Clinician Costs', value: REVENUE_BREAKDOWN_DATA.reduce((sum, item) => sum + item.clinicianCosts, 0), color: '#3b82f6' },
                    { label: 'Supervisor Costs', value: REVENUE_BREAKDOWN_DATA.reduce((sum, item) => sum + item.supervisorCosts, 0), color: '#f59e0b' },
                    { label: 'CC Fees', value: REVENUE_BREAKDOWN_DATA.reduce((sum, item) => sum + item.creditCardFees, 0), color: '#f43f5e' },
                    { label: 'Net Revenue', value: REVENUE_BREAKDOWN_DATA.reduce((sum, item) => sum + item.netRevenue, 0), color: '#10b981' }
                  ];

                  const total = segments.reduce((sum, s) => sum + s.value, 0);

                  // SVG donut chart calculations using arc paths
                  const size = 520;
                  const outerRadius = 240;
                  const innerRadius = 155;
                  const centerX = size / 2;
                  const centerY = size / 2;

                  // Calculate arc paths
                  const createArcPath = (startAngle: number, endAngle: number, outerR: number, innerR: number) => {
                    const startOuterX = centerX + outerR * Math.cos(startAngle);
                    const startOuterY = centerY + outerR * Math.sin(startAngle);
                    const endOuterX = centerX + outerR * Math.cos(endAngle);
                    const endOuterY = centerY + outerR * Math.sin(endAngle);
                    const startInnerX = centerX + innerR * Math.cos(endAngle);
                    const startInnerY = centerY + innerR * Math.sin(endAngle);
                    const endInnerX = centerX + innerR * Math.cos(startAngle);
                    const endInnerY = centerY + innerR * Math.sin(startAngle);

                    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

                    return `M ${startOuterX} ${startOuterY}
                            A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${endOuterX} ${endOuterY}
                            L ${startInnerX} ${startInnerY}
                            A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${endInnerX} ${endInnerY}
                            Z`;
                  };

                  let currentAngle = -Math.PI / 2; // Start from top

                  return (
                    <div className="flex items-center justify-center gap-12 h-full">
                      {/* SVG Donut */}
                      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
                        <svg width={size} height={size} className="overflow-visible">
                          {segments.map((segment) => {
                            const percent = segment.value / total;
                            const angleSize = percent * 2 * Math.PI;
                            const startAngle = currentAngle;
                            const endAngle = currentAngle + angleSize - 0.02;
                            currentAngle += angleSize;

                            const path = createArcPath(startAngle, endAngle, outerRadius, innerRadius);

                            return (
                              <path
                                key={segment.label}
                                d={path}
                                fill={segment.color}
                                className="cursor-pointer transition-all duration-200 hover:brightness-110"
                                style={{
                                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
                                }}
                              />
                            );
                          })}
                        </svg>

                        {/* Center content */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-stone-500 text-xl font-medium mb-2">Gross Revenue</span>
                          <span
                            className="text-stone-900 font-bold"
                            style={{ fontSize: '4.5rem', fontFamily: "'DM Serif Display', Georgia, serif" }}
                          >
                            {gross >= 1000000 ? `$${(gross / 1000000).toFixed(2)}M` : `$${(gross / 1000).toFixed(0)}k`}
                          </span>
                        </div>
                      </div>

                      {/* Legend - Vertical stack on the right */}
                      <div className="flex flex-col gap-6">
                        {segments.map((segment) => {
                          const percent = ((segment.value / total) * 100).toFixed(1);
                          return (
                            <div
                              key={segment.label}
                              className="flex items-center gap-5 py-4 px-5 rounded-2xl transition-all duration-200 hover:bg-stone-50"
                              style={{ minWidth: '340px' }}
                            >
                              {/* Color indicator with glow */}
                              <div
                                className="w-7 h-7 rounded-full flex-shrink-0"
                                style={{
                                  backgroundColor: segment.color,
                                  boxShadow: `0 0 16px ${segment.color}50`
                                }}
                              />

                              {/* Label and stats */}
                              <div className="flex-1 flex items-center justify-between gap-8">
                                <span
                                  className="text-stone-700 font-semibold text-xl"
                                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                                >
                                  {segment.label}
                                </span>

                                <div className="flex items-baseline gap-4">
                                  <span
                                    className="text-stone-900 font-bold text-3xl tabular-nums"
                                    style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                                  >
                                    {segment.value >= 1000000 ? `$${(segment.value / 1000000).toFixed(2)}M` : `$${(segment.value / 1000).toFixed(1)}k`}
                                  </span>
                                  <span
                                    className="text-stone-400 font-semibold text-lg tabular-nums"
                                    style={{ minWidth: '60px', textAlign: 'right' }}
                                  >
                                    {percent}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Team Performance */}
            <div
              className="rounded-3xl p-8"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
                boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)'
              }}
            >
              <div className="mb-6">
                <h3 className="text-stone-800 text-2xl font-semibold mb-2" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                  Team Performance
                </h3>
                <p className="text-stone-500 text-lg">Total across all {CLINICIAN_REVENUE_DATA.length} selected month{CLINICIAN_REVENUE_DATA.length !== 1 ? 's' : ''}</p>
              </div>

              <div className="grid grid-cols-5 gap-4">
                {(() => {
                  // Sum all months in the selected period
                  const totalRevenue = REVENUE_DATA.reduce((sum, item) => sum + item.value, 0);
                  const clinicians = [
                    { name: 'Chen', value: CLINICIAN_REVENUE_DATA.reduce((sum, item) => sum + (item.Chen || 0), 0), color: '#7c3aed' },
                    { name: 'Rodriguez', value: CLINICIAN_REVENUE_DATA.reduce((sum, item) => sum + (item.Rodriguez || 0), 0), color: '#0891b2' },
                    { name: 'Patel', value: CLINICIAN_REVENUE_DATA.reduce((sum, item) => sum + (item.Patel || 0), 0), color: '#d97706' },
                    { name: 'Kim', value: CLINICIAN_REVENUE_DATA.reduce((sum, item) => sum + (item.Kim || 0), 0), color: '#db2777' },
                    { name: 'Johnson', value: CLINICIAN_REVENUE_DATA.reduce((sum, item) => sum + (item.Johnson || 0), 0), color: '#059669' }
                  ].sort((a, b) => b.value - a.value);

                  const maxValue = Math.max(...clinicians.map(c => c.value));

                  return clinicians.map((clinician, idx) => (
                    <div
                      key={clinician.name}
                      className="rounded-2xl p-5 relative transition-all duration-300 hover:scale-[1.02]"
                      style={{
                        background: idx === 0 ? `linear-gradient(135deg, ${clinician.color}15 0%, ${clinician.color}08 100%)` : '#fafaf9',
                        border: idx === 0 ? `1px solid ${clinician.color}40` : '1px solid #e7e5e4',
                        boxShadow: idx === 0 ? `0 4px 16px -4px ${clinician.color}30` : 'none'
                      }}
                    >
                      {idx === 0 && (
                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded text-xs font-bold uppercase" style={{ background: clinician.color, color: 'white' }}>
                          Top
                        </div>
                      )}
                      <p className="text-stone-500 text-sm font-bold uppercase tracking-wide mb-1">#{idx + 1}</p>
                      <h4 className="text-stone-900 text-xl font-bold mb-3">{clinician.name}</h4>
                      <div className="text-2xl font-bold mb-3" style={{ color: clinician.color, fontFamily: "'DM Serif Display', Georgia, serif" }}>
                        {clinician.value >= 1000000 ? `$${(clinician.value / 1000000).toFixed(2)}M` : `$${(clinician.value / 1000).toFixed(1)}k`}
                      </div>
                      <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${(clinician.value / maxValue) * 100}%`, background: clinician.color }}
                        />
                      </div>
                      <p className="text-stone-600 text-sm font-medium mt-3">
                        {((clinician.value / (totalRevenue || 1)) * 100).toFixed(0)}% of total
                      </p>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Detailed Table */}
            <div
              className="rounded-3xl p-8"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
                boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)'
              }}
            >
              <h3 className="text-stone-800 text-2xl font-semibold mb-6" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                Full Breakdown
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-stone-200">
                      <th className="text-left py-5 px-4 text-sm font-bold text-stone-500 uppercase tracking-wider"></th>
                      {REVENUE_BREAKDOWN_DATA.map((item) => (
                        <th key={item.month} className="text-right py-5 px-4 text-sm font-bold text-stone-500 uppercase tracking-wider">{item.month}</th>
                      ))}
                      <th className="text-right py-5 px-4 text-sm font-bold text-stone-900 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                      <td className="py-5 px-4 text-base font-semibold text-stone-900">Gross Revenue</td>
                      {REVENUE_BREAKDOWN_DATA.map((item) => (
                        <td key={item.month} className="py-5 px-4 text-base text-stone-600 text-right">${(item.grossRevenue / 1000).toFixed(1)}k</td>
                      ))}
                      <td className="py-5 px-4 text-base font-bold text-stone-900 text-right">
                        {REVENUE_BREAKDOWN_DATA.reduce((sum, item) => sum + item.grossRevenue, 0) >= 1000000 ? `$${(REVENUE_BREAKDOWN_DATA.reduce((sum, item) => sum + item.grossRevenue, 0) / 1000000).toFixed(2)}M` : `$${(REVENUE_BREAKDOWN_DATA.reduce((sum, item) => sum + item.grossRevenue, 0) / 1000).toFixed(1)}k`}
                      </td>
                    </tr>
                    <tr className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                      <td className="py-5 px-4 text-base font-semibold text-stone-900 flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        Clinician Cost
                      </td>
                      {REVENUE_BREAKDOWN_DATA.map((item) => (
                        <td key={item.month} className="py-5 px-4 text-base text-blue-600 text-right">${(item.clinicianCosts / 1000).toFixed(1)}k</td>
                      ))}
                      <td className="py-5 px-4 text-base font-bold text-blue-600 text-right">
                        {REVENUE_BREAKDOWN_DATA.reduce((sum, item) => sum + item.clinicianCosts, 0) >= 1000000 ? `$${(REVENUE_BREAKDOWN_DATA.reduce((sum, item) => sum + item.clinicianCosts, 0) / 1000000).toFixed(2)}M` : `$${(REVENUE_BREAKDOWN_DATA.reduce((sum, item) => sum + item.clinicianCosts, 0) / 1000).toFixed(1)}k`}
                      </td>
                    </tr>
                    <tr className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                      <td className="py-5 px-4 text-base font-semibold text-stone-900 flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                        Supervisor Cost
                      </td>
                      {REVENUE_BREAKDOWN_DATA.map((item) => (
                        <td key={item.month} className="py-5 px-4 text-base text-amber-600 text-right">${(item.supervisorCosts / 1000).toFixed(1)}k</td>
                      ))}
                      <td className="py-5 px-4 text-base font-bold text-amber-600 text-right">
                        {REVENUE_BREAKDOWN_DATA.reduce((sum, item) => sum + item.supervisorCosts, 0) >= 1000000 ? `$${(REVENUE_BREAKDOWN_DATA.reduce((sum, item) => sum + item.supervisorCosts, 0) / 1000000).toFixed(2)}M` : `$${(REVENUE_BREAKDOWN_DATA.reduce((sum, item) => sum + item.supervisorCosts, 0) / 1000).toFixed(1)}k`}
                      </td>
                    </tr>
                    <tr className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                      <td className="py-5 px-4 text-base font-semibold text-stone-900 flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-rose-500" />
                        Credit Card Fees
                      </td>
                      {REVENUE_BREAKDOWN_DATA.map((item) => (
                        <td key={item.month} className="py-5 px-4 text-base text-rose-600 text-right">${(item.creditCardFees / 1000).toFixed(1)}k</td>
                      ))}
                      <td className="py-5 px-4 text-base font-bold text-rose-600 text-right">
                        {REVENUE_BREAKDOWN_DATA.reduce((sum, item) => sum + item.creditCardFees, 0) >= 1000000 ? `$${(REVENUE_BREAKDOWN_DATA.reduce((sum, item) => sum + item.creditCardFees, 0) / 1000000).toFixed(2)}M` : `$${(REVENUE_BREAKDOWN_DATA.reduce((sum, item) => sum + item.creditCardFees, 0) / 1000).toFixed(1)}k`}
                      </td>
                    </tr>
                    <tr className="hover:bg-emerald-50 transition-colors">
                      <td className="py-5 px-4 text-base font-bold text-emerald-700 flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        Net Revenue
                      </td>
                      {REVENUE_BREAKDOWN_DATA.map((item) => (
                        <td key={item.month} className="py-5 px-4 text-base font-bold text-emerald-600 text-right">${(item.netRevenue / 1000).toFixed(1)}k</td>
                      ))}
                      <td className="py-5 px-4 text-lg font-bold text-emerald-700 text-right">
                        {REVENUE_BREAKDOWN_DATA.reduce((sum, item) => sum + item.netRevenue, 0) >= 1000000 ? `$${(REVENUE_BREAKDOWN_DATA.reduce((sum, item) => sum + item.netRevenue, 0) / 1000000).toFixed(2)}M` : `$${(REVENUE_BREAKDOWN_DATA.reduce((sum, item) => sum + item.netRevenue, 0) / 1000).toFixed(1)}k`}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Original Header for other tabs (not Financial or Sessions) */}
      {!isFinancialTab && !isSessionsTab && (
        <>
          <div className="mb-6">
            <h2 className="text-gray-500 text-sm font-medium mb-1">DETAILED INSIGHTS</h2>
            <h1 className="text-4xl font-normal text-gray-900 tracking-tight">Practice Detailed Analysis</h1>
          </div>

          {/* Original Time Period Selector for other tabs */}
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
              {/* Custom Range Button */}
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
                {timePeriod === 'custom' ? formatCustomRange() : 'Custom'}
              </button>
            </div>
          </div>

          {/* Original Tabs for other tabs */}
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
        </>
      )}

      {/* Sessions Tab - Fully Redesigned */}
      {isSessionsTab && (
        <div className="min-h-full relative">
          {/* Integrated Header */}
          <div className="sticky top-0 z-50 px-10 pt-8 pb-6" style={{ background: 'linear-gradient(180deg, rgba(250,250,249,0.97) 0%, rgba(250,250,249,0.95) 80%, transparent 100%)' }}>
            <div className="flex items-end justify-between">
              {/* Title & Breadcrumb */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-stone-400 text-sm font-medium uppercase tracking-widest">Detailed Analysis</span>
                  <span className="text-stone-300">/</span>
                  <span className="text-cyan-600 text-sm font-bold uppercase tracking-widest">Sessions</span>
                </div>
                <div className="flex items-baseline gap-4">
                  <h1
                    className="text-5xl text-stone-900 font-bold tracking-tight"
                    style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                  >
                    Sessions Performance
                  </h1>
                  <span className="text-stone-400 text-base font-medium">
                    {getDateRangeLabel()}
                  </span>
                </div>
              </div>

              {/* Time Period Selector - Redesigned */}
              <div className="flex items-center gap-4 relative">
                <div
                  className="flex items-center gap-1 p-1.5 rounded-2xl bg-white/80 backdrop-blur-sm"
                  style={{
                    boxShadow: '0 4px 20px -4px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.03)'
                  }}
                >
                  {timePeriods.map((period) => (
                    <button
                      key={period.id}
                      onClick={() => setTimePeriod(period.id)}
                      className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                        timePeriod === period.id
                          ? 'bg-stone-900 text-white shadow-lg'
                          : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                  {/* Custom Range Button */}
                  <button
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className={`group px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-500 flex items-center gap-2.5 relative overflow-hidden ${
                      timePeriod === 'custom'
                        ? 'text-white shadow-lg'
                        : 'text-stone-500 hover:text-stone-900'
                    }`}
                    style={{
                      background: timePeriod === 'custom'
                        ? 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #1c1917 100%)'
                        : 'transparent'
                    }}
                  >
                    <Calendar
                      size={16}
                      className={`transition-transform duration-500 ${showDatePicker ? 'rotate-12' : 'group-hover:rotate-6'}`}
                    />
                    <span>{timePeriod === 'custom' ? formatCustomRange() : 'Custom'}</span>
                  </button>
                </div>

                {/* Simple & Elegant Date Picker */}
                {showDatePicker && (
                  <div
                    className="absolute top-full right-0 mt-3 z-[100000] rounded-2xl bg-white p-6"
                    style={{
                      width: '340px',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                      animation: 'fadeIn 0.2s ease-out'
                    }}
                  >
                    <style>{`
                      @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(-8px); }
                        to { opacity: 1; transform: translateY(0); }
                      }
                    `}</style>

                    {/* Header */}
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-stone-900 text-lg font-semibold">Custom Range</h3>
                      <button
                        onClick={() => setShowDatePicker(false)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {/* Year Selector */}
                    <div className="flex items-center justify-center gap-4 mb-5 pb-5 border-b border-stone-100">
                      <button
                        onClick={() => setCustomYear(prev => prev - 1)}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-all"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <span
                        className="text-stone-900 text-2xl font-bold tabular-nums w-20 text-center"
                        style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                      >
                        {customYear}
                      </span>
                      <button
                        onClick={() => setCustomYear(prev => prev + 1)}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-all"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>

                    {/* Month Grid - Click to set start, click again to set end */}
                    <div className="grid grid-cols-4 gap-2 mb-5">
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, idx) => {
                        const isStart = idx === customStartMonth;
                        const isEnd = idx === customEndMonth;
                        const isInRange = idx > customStartMonth && idx < customEndMonth;
                        const isSelected = isStart || isEnd;

                        return (
                          <button
                            key={month}
                            onClick={() => {
                              // Intuitive: clicking any month sets it as start, then click another for end
                              if (customStartMonth === customEndMonth) {
                                // Currently single month selected - extend range
                                if (idx < customStartMonth) {
                                  setCustomStartMonth(idx);
                                } else if (idx > customStartMonth) {
                                  setCustomEndMonth(idx);
                                }
                              } else {
                                // Range exists - clicking resets to single month
                                setCustomStartMonth(idx);
                                setCustomEndMonth(idx);
                              }
                            }}
                            className={`h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
                              isSelected
                                ? 'bg-stone-900 text-white'
                                : isInRange
                                  ? 'bg-stone-100 text-stone-700'
                                  : 'text-stone-600 hover:bg-stone-50'
                            }`}
                          >
                            {month}
                          </button>
                        );
                      })}
                    </div>

                    {/* Selected Range Display */}
                    <div className="flex items-center justify-center gap-3 mb-5 py-3 px-4 rounded-xl bg-stone-50">
                      <span className="text-stone-900 font-semibold">
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][customStartMonth]}
                      </span>
                      {customStartMonth !== customEndMonth && (
                        <>
                          <span className="text-stone-400">→</span>
                          <span className="text-stone-900 font-semibold">
                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][customEndMonth]}
                          </span>
                        </>
                      )}
                      <span className="text-stone-500">{customYear}</span>
                    </div>

                    {/* Apply Button */}
                    <button
                      onClick={applyCustomRange}
                      className="w-full py-3 rounded-xl bg-stone-900 text-white font-semibold transition-all hover:bg-stone-800 active:scale-[0.98]"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Tab Navigation - Minimal Pills */}
            <div className="flex items-center gap-3 mt-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-full text-base font-semibold transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-stone-900 text-white shadow-md'
                      : 'text-stone-500 hover:text-stone-800 border border-stone-300 hover:border-stone-400 bg-white/50'
                  }`}
                >
                  {tab.shortLabel}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="px-10 pb-10 space-y-8">

            {/* Hero Stats Row */}
            <div className="grid grid-cols-4 gap-6">
              {/* Total Completed Sessions */}
              <div
                className="rounded-3xl p-6 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
                  boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)'
                }}
              >
                <h3
                  className="text-stone-800 text-2xl font-semibold mb-4"
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  Total Completed
                </h3>
                <span
                  className="text-stone-900 font-bold block"
                  style={{ fontSize: '2.5rem', lineHeight: 1, fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  {SESSIONS_DATA.reduce((sum, item) => sum + item.completed, 0).toLocaleString()}
                </span>
                <p className="text-stone-500 text-lg mt-3">
                  across {SESSIONS_DATA.length} months
                </p>
              </div>

              {/* Total Booked Sessions */}
              <div
                className="rounded-3xl p-6 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
                  boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)'
                }}
              >
                <h3
                  className="text-stone-800 text-2xl font-semibold mb-4"
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  Total Booked
                </h3>
                <span
                  className="text-stone-900 font-bold block"
                  style={{ fontSize: '2.5rem', lineHeight: 1, fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  {SESSIONS_DATA.reduce((sum, item) => sum + item.booked, 0).toLocaleString()}
                </span>
                <p className="text-stone-500 text-lg mt-3">
                  {((SESSIONS_DATA.reduce((sum, item) => sum + item.show, 0) / SESSIONS_DATA.reduce((sum, item) => sum + item.booked, 0)) * 100).toFixed(1)}% show rate
                </p>
              </div>

              {/* Goal Achievement */}
              <div
                className="rounded-3xl p-6 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
                  boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)'
                }}
              >
                <h3
                  className="text-stone-800 text-2xl font-semibold mb-4"
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  Goal Achievement
                </h3>
                <span
                  className="text-stone-900 font-bold block"
                  style={{ fontSize: '2.5rem', lineHeight: 1, fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  {SESSIONS_DATA.filter(item => item.completed >= 700).length}/{SESSIONS_DATA.length}
                </span>
                <p className="text-stone-500 text-lg mt-3">
                  months hit 700 goal
                </p>
              </div>

              {/* Avg Non-Billable Cancel Rate */}
              <div
                className="rounded-3xl p-6 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
                  boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)'
                }}
              >
                <h3
                  className="text-stone-800 text-2xl font-semibold mb-4"
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  Avg Non-Billable Cancel Rate
                </h3>
                <span
                  className="text-stone-900 font-bold block"
                  style={{ fontSize: '2.5rem', lineHeight: 1, fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  {(
                    ((SESSIONS_DATA.reduce((sum, item) => sum + item.clinicianCancelled + item.cancelled, 0)) /
                    SESSIONS_DATA.reduce((sum, item) =>
                      sum + item.show + item.cancelled + item.clinicianCancelled + item.lateCancelled + item.noShow, 0
                    )) * 100
                  ).toFixed(1)}%
                </span>
                <p className="text-stone-500 text-lg mt-3">Client Cancellations + Clinician Cancellations</p>
              </div>
            </div>

            {/* Session Volume & Attendance Breakdown - Side by Side */}
            <div className="grid grid-cols-2 gap-6">
              {/* Session Volume - Single Bar Chart */}
              <div
                className="rounded-2xl p-8 relative overflow-hidden flex flex-col"
                style={{
                  background: '#ffffff',
                  height: '750px',
                  border: '2px solid #d6d3d1',
                  borderLeft: '4px solid #059669'
                }}
              >

                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-stone-800 text-2xl font-semibold mb-2" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                      Completed Sessions
                    </h3>
                    <p className="text-stone-500 text-lg">Monthly performance</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Hover tooltip for clinician breakdown */}
                    {hoveredSessionsClinicianBar && (
                      <div
                        className="px-3 py-2 rounded-lg shadow-xl pointer-events-none animate-pulse"
                        style={{
                          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: hoveredSessionsClinicianBar.color }} />
                          <span className="text-white font-semibold">{hoveredSessionsClinicianBar.clinician}</span>
                          <span className="text-indigo-300">•</span>
                          <span className="text-white font-bold">{hoveredSessionsClinicianBar.value}</span>
                          <span className="text-indigo-300 text-sm">({hoveredSessionsClinicianBar.month})</span>
                        </div>
                      </div>
                    )}
                    {/* Toggle Button */}
                    {!hoveredSessionsClinicianBar && (
                      <button
                        onClick={() => setShowSessionsClinicianBreakdown(!showSessionsClinicianBreakdown)}
                        className="relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300"
                        style={{
                          background: showSessionsClinicianBreakdown
                            ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)'
                            : 'linear-gradient(135deg, #f5f5f4 0%, #e7e5e4 100%)',
                          boxShadow: showSessionsClinicianBreakdown
                            ? '0 4px 12px -2px rgba(30, 27, 75, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
                            : '0 2px 8px -2px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)'
                        }}
                      >
                        <svg
                          className={`w-4 h-4 transition-colors duration-300 ${showSessionsClinicianBreakdown ? 'text-indigo-300' : 'text-stone-500'}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className={`text-sm font-semibold transition-colors duration-300 ${showSessionsClinicianBreakdown ? 'text-white' : 'text-stone-600'}`}>
                          By Clinician
                        </span>
                        <div
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${showSessionsClinicianBreakdown ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' : 'bg-stone-400'}`}
                        />
                      </button>
                    )}
                    {/* Goal indicator */}
                    {!showSessionsClinicianBreakdown && !hoveredSessionsClinicianBar && (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-300/50">
                        <div className="w-4 h-0.5 bg-amber-500" style={{ borderTop: '2px dashed #f59e0b' }} />
                        <span className="text-amber-700 text-sm font-semibold">700 Goal</span>
                      </div>
                    )}
                    {/* Sessions Report Button */}
                    <button
                      className="group relative px-6 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 ease-out transform hover:scale-[1.03] active:scale-[0.98]"
                      style={{
                        background: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #1c1917 100%)',
                        boxShadow: '0 8px 20px -6px rgba(28, 25, 23, 0.4), 0 4px 8px -4px rgba(28, 25, 23, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
                        color: '#fafaf9',
                        letterSpacing: '0.02em'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 12px 24px -6px rgba(28, 25, 23, 0.5), 0 6px 12px -4px rgba(28, 25, 23, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 8px 20px -6px rgba(28, 25, 23, 0.4), 0 4px 8px -4px rgba(28, 25, 23, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)';
                      }}
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        Sessions Report
                        <ArrowRight
                          size={16}
                          className="transition-transform duration-300 group-hover:translate-x-1"
                          strokeWidth={2.5}
                        />
                      </span>
                    </button>
                  </div>
                </div>

                {/* Single Bar Chart - Completed Sessions Only */}
                <div className="flex flex-1 min-h-0">
                  {/* Y-axis labels */}
                  <div className="flex flex-col justify-between text-sm text-stone-500 font-semibold pr-4 py-1">
                    <span>800</span>
                    <span>600</span>
                    <span>400</span>
                    <span>200</span>
                    <span>0</span>
                  </div>

                  {/* Chart area */}
                  <div className="flex-1 relative">
                    {/* Background grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div key={i} className="border-t border-stone-200/60 w-full" />
                      ))}
                    </div>

                    {/* Goal line - horizontal at 700 completed sessions (only in total view) */}
                    {!showSessionsClinicianBreakdown && (
                      <div
                        className="absolute left-0 right-0 z-10 pointer-events-none flex items-center"
                        style={{ top: `${((800 - 700) / 800) * 100}%` }}
                      >
                        <div className="flex-1 border-t-2 border-dashed border-amber-400" />
                      </div>
                    )}

                    {/* Completed Sessions Bars - Total View */}
                    {!showSessionsClinicianBreakdown && (
                      <div className="absolute inset-0 flex items-end justify-around px-2">
                        {SESSIONS_DATA.map((item, idx) => {
                          const completedHeightPercent = (item.completed / 800) * 100;
                          const isAboveGoal = item.completed >= 700;
                          const isCurrentMonth = idx === SESSIONS_DATA.length - 1;

                          return (
                            <div
                              key={item.month}
                              className="group relative flex flex-col items-center justify-end h-full"
                              style={{ flex: '1', maxWidth: '72px' }}
                            >
                              {/* Single bar container */}
                              <div className="flex items-end w-full justify-center h-full">
                                {/* Completed bar */}
                                <div className="relative flex flex-col items-end justify-end h-full" style={{ width: '65%' }}>
                                  <span className={`text-sm font-bold mb-1.5 ${isAboveGoal ? 'text-emerald-600' : 'text-blue-600'}`}>
                                    {item.completed}
                                  </span>
                                  <div
                                    className={`w-full rounded-t-xl transition-all duration-300 cursor-pointer relative overflow-hidden ${
                                      isCurrentMonth
                                        ? isAboveGoal
                                          ? 'ring-2 ring-emerald-400/40 ring-offset-2'
                                          : 'ring-2 ring-blue-400/40 ring-offset-2'
                                        : 'hover:brightness-110'
                                    }`}
                                    style={{
                                      height: `${completedHeightPercent}%`,
                                      background: isAboveGoal
                                        ? 'linear-gradient(180deg, #34d399 0%, #059669 100%)'
                                        : 'linear-gradient(180deg, #60a5fa 0%, #2563eb 100%)',
                                      boxShadow: isAboveGoal
                                        ? '0 4px 12px -2px rgba(16, 185, 129, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)'
                                        : '0 4px 12px -2px rgba(37, 99, 235, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)'
                                    }}
                                  >
                                    {/* Shine effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Bars - Clinician Breakdown (Stacked) */}
                    {showSessionsClinicianBreakdown && (
                      <div className="absolute inset-0 flex items-end justify-around gap-1 px-4">
                        {(() => {
                          const clinicianColors = {
                            Chen: { color: '#7c3aed', gradient: 'linear-gradient(180deg, #a78bfa 0%, #7c3aed 100%)' },
                            Rodriguez: { color: '#0891b2', gradient: 'linear-gradient(180deg, #22d3ee 0%, #0891b2 100%)' },
                            Patel: { color: '#d97706', gradient: 'linear-gradient(180deg, #fbbf24 0%, #d97706 100%)' },
                            Kim: { color: '#db2777', gradient: 'linear-gradient(180deg, #f472b6 0%, #db2777 100%)' },
                            Johnson: { color: '#059669', gradient: 'linear-gradient(180deg, #34d399 0%, #059669 100%)' }
                          };
                          const clinicianOrder = ['Johnson', 'Kim', 'Patel', 'Rodriguez', 'Chen'];

                          return CLINICIAN_SESSIONS_DATA.map((item, idx) => {
                            const total = (item.Chen || 0) + (item.Rodriguez || 0) + (item.Patel || 0) + (item.Kim || 0) + (item.Johnson || 0);
                            const totalHeightPercent = (total / 800) * 100;
                            const isCurrentMonth = idx === CLINICIAN_SESSIONS_DATA.length - 1;

                            return (
                              <div
                                key={item.month}
                                className="group relative flex-1 flex flex-col items-center justify-end h-full"
                                style={{ maxWidth: '50px' }}
                              >
                                {/* Total value label */}
                                <div className="mb-2 z-20">
                                  <span className="text-sm font-bold text-indigo-600">
                                    {total}
                                  </span>
                                </div>
                                {/* Stacked Bar */}
                                <div
                                  className="relative rounded-t-md overflow-hidden transition-all duration-300"
                                  style={{
                                    height: `${totalHeightPercent}%`,
                                    width: '100%',
                                    maxWidth: '36px',
                                    boxShadow: isCurrentMonth ? '0 4px 12px -2px rgba(124, 58, 237, 0.3)' : '0 2px 8px -2px rgba(0,0,0,0.1)'
                                  }}
                                >
                                  {clinicianOrder.map((clinician) => {
                                    const value = item[clinician as keyof typeof item] as number || 0;
                                    const segmentHeightPercent = (value / total) * 100;
                                    const colorData = clinicianColors[clinician as keyof typeof clinicianColors];

                                    return (
                                      <div
                                        key={clinician}
                                        className="w-full cursor-pointer transition-all duration-200 hover:brightness-110"
                                        style={{
                                          height: `${segmentHeightPercent}%`,
                                          background: colorData.gradient,
                                          borderBottom: '1px solid rgba(255,255,255,0.2)'
                                        }}
                                        onMouseEnter={() => setHoveredSessionsClinicianBar({
                                          month: item.month,
                                          clinician,
                                          value,
                                          color: colorData.color
                                        })}
                                        onMouseLeave={() => setHoveredSessionsClinicianBar(null)}
                                      />
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Month labels */}
                <div className="flex mt-4 pl-12 flex-shrink-0">
                  <div className="flex-1 flex justify-around px-2">
                    {(showSessionsClinicianBreakdown ? CLINICIAN_SESSIONS_DATA : SESSIONS_DATA).map((item, idx) => {
                      const isCurrentMonth = idx === (showSessionsClinicianBreakdown ? CLINICIAN_SESSIONS_DATA : SESSIONS_DATA).length - 1;
                      return (
                        <div
                          key={item.month}
                          className="text-center"
                          style={{ flex: '1', maxWidth: '72px' }}
                        >
                          <span className={`text-sm font-semibold ${
                            isCurrentMonth
                              ? 'text-stone-900 bg-stone-900/5 px-3 py-1 rounded-full'
                              : 'text-stone-500'
                          }`}>
                            {item.month}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Insights Row */}
                <div className="flex items-center justify-between pt-5 border-t border-stone-200/60 flex-shrink-0 mt-4">
                  {showSessionsClinicianBreakdown ? (
                    <div className="flex items-center gap-5 w-full flex-wrap">
                      {[
                        { name: 'Chen', color: '#7c3aed' },
                        { name: 'Rodriguez', color: '#0891b2' },
                        { name: 'Patel', color: '#d97706' },
                        { name: 'Kim', color: '#db2777' },
                        { name: 'Johnson', color: '#059669' }
                      ].map((clinician) => (
                        <div key={clinician.name} className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: clinician.color }}
                          />
                          <span className="text-stone-600 text-base font-medium">{clinician.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    (() => {
                      const completedValues = SESSIONS_DATA.map(item => item.completed);
                      const maxCompleted = Math.max(...completedValues);
                      const minCompleted = Math.min(...completedValues);
                      const bestMonth = SESSIONS_DATA.find(item => item.completed === maxCompleted)?.month || '';

                      // Calculate month-over-month trend (comparing last month to previous)
                      const lastMonth = SESSIONS_DATA[SESSIONS_DATA.length - 1]?.completed || 0;
                      const prevMonth = SESSIONS_DATA[SESSIONS_DATA.length - 2]?.completed || 0;
                      const momChange = prevMonth > 0 ? ((lastMonth - prevMonth) / prevMonth * 100) : 0;

                      return (
                        <div className="flex items-center gap-8 w-full">
                          <div className="flex items-center gap-2">
                            <span className="text-stone-500 text-base">Best Month:</span>
                            <span className="text-emerald-600 font-bold text-base">
                              {bestMonth} ({maxCompleted})
                            </span>
                          </div>
                          <div className="w-px h-5 bg-stone-200" />
                          <div className="flex items-center gap-2">
                            <span className="text-stone-500 text-base">MoM Trend:</span>
                            <span className={`font-bold text-base ${momChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {momChange >= 0 ? '+' : ''}{momChange.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-px h-5 bg-stone-200" />
                          <div className="flex items-center gap-2">
                            <span className="text-stone-500 text-base">Range:</span>
                            <span className="text-stone-700 font-bold text-base">
                              {minCompleted} – {maxCompleted}
                            </span>
                          </div>
                        </div>
                      );
                    })()
                  )}
                </div>
              </div>

              {/* Attendance Breakdown - Donut Chart */}
              <div
                className="rounded-3xl p-8 overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
                  boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)',
                  height: '750px'
                }}
              >
                <div className="mb-6">
                  <h3 className="text-stone-800 text-2xl font-semibold mb-2" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                    Attendance Breakdown
                  </h3>
                  <p className="text-stone-500 text-lg">Session outcomes</p>
                </div>

                {/* Donut Chart */}
                {(() => {
                  const segments = [
                    { label: 'Attended', value: SESSIONS_DATA.reduce((sum, item) => sum + item.show, 0), color: '#10b981' },
                    { label: 'Client Cancelled', value: SESSIONS_DATA.reduce((sum, item) => sum + item.cancelled, 0), color: '#ef4444' },
                    { label: 'Clinician Cancelled', value: SESSIONS_DATA.reduce((sum, item) => sum + item.clinicianCancelled, 0), color: '#3b82f6' },
                    { label: 'Late Cancelled', value: SESSIONS_DATA.reduce((sum, item) => sum + item.lateCancelled, 0), color: '#f59e0b' },
                    { label: 'No Show', value: SESSIONS_DATA.reduce((sum, item) => sum + item.noShow, 0), color: '#6b7280' }
                  ];

                  const total = segments.reduce((sum, s) => sum + s.value, 0);

                  // SVG donut chart calculations using arc paths
                  const size = 520;
                  const outerRadius = 240;
                  const innerRadius = 155;
                  const centerX = size / 2;
                  const centerY = size / 2;

                  // Calculate arc paths
                  const createArcPath = (startAngle: number, endAngle: number, outerR: number, innerR: number) => {
                    const startOuterX = centerX + outerR * Math.cos(startAngle);
                    const startOuterY = centerY + outerR * Math.sin(startAngle);
                    const endOuterX = centerX + outerR * Math.cos(endAngle);
                    const endOuterY = centerY + outerR * Math.sin(endAngle);
                    const startInnerX = centerX + innerR * Math.cos(endAngle);
                    const startInnerY = centerY + innerR * Math.sin(endAngle);
                    const endInnerX = centerX + innerR * Math.cos(startAngle);
                    const endInnerY = centerY + innerR * Math.sin(startAngle);

                    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

                    return `M ${startOuterX} ${startOuterY}
                            A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${endOuterX} ${endOuterY}
                            L ${startInnerX} ${startInnerY}
                            A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${endInnerX} ${endInnerY}
                            Z`;
                  };

                  let currentAngle = -Math.PI / 2; // Start from top

                  return (
                    <div className="flex items-center justify-center gap-12 h-full">
                      {/* SVG Donut */}
                      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
                        <svg width={size} height={size} className="overflow-visible">
                          {segments.map((segment) => {
                            const percent = segment.value / total;
                            const angleSize = percent * 2 * Math.PI;
                            const startAngle = currentAngle;
                            const endAngle = currentAngle + angleSize - 0.02;
                            currentAngle += angleSize;

                            const path = createArcPath(startAngle, endAngle, outerRadius, innerRadius);

                            return (
                              <path
                                key={segment.label}
                                d={path}
                                fill={segment.color}
                                className="cursor-pointer transition-all duration-200 hover:brightness-110"
                                style={{
                                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
                                }}
                              />
                            );
                          })}
                        </svg>

                        {/* Center content */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-stone-500 text-xl font-medium mb-2">Show Rate</span>
                          <span
                            className="text-emerald-600 font-bold"
                            style={{ fontSize: '4.5rem', fontFamily: "'DM Serif Display', Georgia, serif" }}
                          >
                            {((segments[0].value / total) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      {/* Legend - Vertical stack on the right */}
                      <div className="flex flex-col gap-6">
                        {segments.map((segment) => {
                          const percent = ((segment.value / total) * 100).toFixed(1);
                          return (
                            <div
                              key={segment.label}
                              className="flex items-center gap-5 py-4 px-5 rounded-2xl transition-all duration-200 hover:bg-stone-50"
                              style={{ minWidth: '340px' }}
                            >
                              {/* Color indicator with glow */}
                              <div
                                className="w-7 h-7 rounded-full flex-shrink-0"
                                style={{
                                  backgroundColor: segment.color,
                                  boxShadow: `0 0 16px ${segment.color}50`
                                }}
                              />

                              {/* Label and stats */}
                              <div className="flex-1 flex items-center justify-between gap-8">
                                <span
                                  className="text-stone-700 font-semibold text-xl"
                                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                                >
                                  {segment.label}
                                </span>

                                <div className="flex items-baseline gap-4">
                                  <span
                                    className="text-stone-900 font-bold text-3xl tabular-nums"
                                    style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                                  >
                                    {segment.value.toLocaleString()}
                                  </span>
                                  <span
                                    className="text-stone-400 font-semibold text-lg tabular-nums"
                                    style={{ minWidth: '60px', textAlign: 'right' }}
                                  >
                                    {percent}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Secondary Metrics Row */}
            <div className="grid grid-cols-2 gap-6">
              {/* Sessions per Client */}
              <div
                className="rounded-3xl p-6 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
                  boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)'
                }}
              >
                <h3
                  className="text-stone-800 text-2xl font-semibold mb-4"
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  Avg Sessions per Client
                </h3>
                <span
                  className="text-stone-900 font-bold block"
                  style={{ fontSize: '2.5rem', lineHeight: 1, fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  {(SESSIONS_DATA.reduce((sum, item) => sum + item.completed, 0) / SESSIONS_DATA.reduce((sum, item) => sum + item.clients, 0)).toFixed(1)}
                </span>
                <p className="text-stone-500 text-lg mt-3">
                  sessions per active client
                </p>
              </div>

              {/* Avg Sessions */}
              <div
                className="rounded-3xl p-6 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
                  boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)'
                }}
              >
                <h3
                  className="text-stone-800 text-2xl font-semibold mb-4"
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  Avg Sessions
                </h3>
                <span
                  className="text-stone-900 font-bold block"
                  style={{ fontSize: '2.5rem', lineHeight: 1, fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  {Math.round(SESSIONS_DATA.reduce((sum, item) => sum + item.completed, 0) / SESSIONS_DATA.length).toLocaleString()}
                  <span className="text-stone-400 text-xl font-medium" style={{ fontFamily: "system-ui, sans-serif" }}>/mo</span>
                </span>
                <p className="text-stone-500 text-lg mt-3">
                  {Math.round(SESSIONS_DATA.reduce((sum, item) => sum + item.completed, 0) / SESSIONS_DATA.length / 4.33)}/week
                </p>
              </div>
            </div>

            {/* Detailed Table */}
            <div
              className="rounded-3xl p-8"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
                boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)'
              }}
            >
              <h3
                className="text-stone-800 text-2xl font-semibold mb-6"
                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
              >
                Monthly Breakdown
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-stone-200">
                      <th className="text-left py-5 px-4 text-sm font-bold text-stone-500 uppercase tracking-wider"></th>
                      {SESSIONS_DATA.map((item) => (
                        <th key={item.month} className="text-right py-5 px-4 text-sm font-bold text-stone-500 uppercase tracking-wider">{item.month}</th>
                      ))}
                      <th className="text-right py-5 px-4 text-sm font-bold text-stone-900 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                      <td className="py-5 px-4 text-base font-semibold text-stone-900 flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-cyan-500" />
                        Booked
                      </td>
                      {SESSIONS_DATA.map((item) => (
                        <td key={item.month} className="py-5 px-4 text-base text-stone-600 text-right">{item.booked}</td>
                      ))}
                      <td className="py-5 px-4 text-base font-bold text-stone-900 text-right">
                        {SESSIONS_DATA.reduce((sum, item) => sum + item.booked, 0).toLocaleString()}
                      </td>
                    </tr>
                    <tr className="border-b border-stone-100 hover:bg-emerald-50 transition-colors">
                      <td className="py-5 px-4 text-base font-semibold text-emerald-700 flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        Completed
                      </td>
                      {SESSIONS_DATA.map((item) => (
                        <td key={item.month} className="py-5 px-4 text-base font-bold text-emerald-600 text-right">{item.completed}</td>
                      ))}
                      <td className="py-5 px-4 text-lg font-bold text-emerald-700 text-right">
                        {SESSIONS_DATA.reduce((sum, item) => sum + item.completed, 0).toLocaleString()}
                      </td>
                    </tr>
                    <tr className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                      <td className="py-5 px-4 text-base font-semibold text-stone-900 flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-rose-500" />
                        Cancelled
                      </td>
                      {SESSIONS_DATA.map((item) => (
                        <td key={item.month} className="py-5 px-4 text-base text-rose-600 text-right">{item.cancelled}</td>
                      ))}
                      <td className="py-5 px-4 text-base font-bold text-rose-600 text-right">
                        {SESSIONS_DATA.reduce((sum, item) => sum + item.cancelled, 0).toLocaleString()}
                      </td>
                    </tr>
                    <tr className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                      <td className="py-5 px-4 text-base font-semibold text-stone-900 flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        Clinician Cancelled
                      </td>
                      {SESSIONS_DATA.map((item) => (
                        <td key={item.month} className="py-5 px-4 text-base text-blue-600 text-right">{item.clinicianCancelled}</td>
                      ))}
                      <td className="py-5 px-4 text-base font-bold text-blue-600 text-right">
                        {SESSIONS_DATA.reduce((sum, item) => sum + item.clinicianCancelled, 0).toLocaleString()}
                      </td>
                    </tr>
                    <tr className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                      <td className="py-5 px-4 text-base font-semibold text-stone-900 flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                        Late Cancelled
                      </td>
                      {SESSIONS_DATA.map((item) => (
                        <td key={item.month} className="py-5 px-4 text-base text-amber-600 text-right">{item.lateCancelled}</td>
                      ))}
                      <td className="py-5 px-4 text-base font-bold text-amber-600 text-right">
                        {SESSIONS_DATA.reduce((sum, item) => sum + item.lateCancelled, 0).toLocaleString()}
                      </td>
                    </tr>
                    <tr className="hover:bg-stone-50 transition-colors">
                      <td className="py-5 px-4 text-base font-semibold text-stone-900 flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-stone-500" />
                        No Show
                      </td>
                      {SESSIONS_DATA.map((item) => (
                        <td key={item.month} className="py-5 px-4 text-base text-stone-600 text-right">{item.noShow}</td>
                      ))}
                      <td className="py-5 px-4 text-base font-bold text-stone-600 text-right">
                        {SESSIONS_DATA.reduce((sum, item) => sum + item.noShow, 0).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
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

      {activeTab === 'insurance' && (
        <div className="flex flex-col gap-6 overflow-y-auto pb-6">
          {/* Top Row - 2 Insurance Health Tiles */}
          <div className="grid grid-cols-2 gap-4 flex-shrink-0">
            {/* Tile 1: Total Insurance Balance Owed */}
            {(() => {
              const totalInsuranceBalance = OUTSTANDING_CLAIMS_AGING.reduce((sum, item) => sum + item.amount, 0);
              return (
                <div className="bg-gradient-to-br from-white via-white to-slate-50/20 rounded-[20px] p-5 shadow-2xl border-2 border-[#2d6e7e] relative overflow-hidden group hover:shadow-[0_20px_70px_-10px_rgba(45,110,126,0.3)] transition-all duration-300"
                  style={{
                    boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)'
                  }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  <div className="relative z-10">
                    <div className="text-gray-500 text-[10px] font-semibold uppercase tracking-widest mb-2">OUTSTANDING INSURANCE</div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">${(totalInsuranceBalance / 1000).toFixed(1)}K</div>
                    <div className="text-xs text-gray-600">Unpaid by insurance payers</div>
                  </div>
                </div>
              );
            })()}

            {/* Tile 2: Claims Needing Attention */}
            {(() => {
              const latestClaims = CLAIMS_STATUS_DATA[CLAIMS_STATUS_DATA.length - 1];
              const needsAttention = latestClaims.rejected + latestClaims.denied;
              return (
                <div className="bg-gradient-to-br from-white via-white to-slate-50/20 rounded-[20px] p-5 shadow-2xl border-2 border-[#2d6e7e] relative overflow-hidden group hover:shadow-[0_20px_70px_-10px_rgba(45,110,126,0.3)] transition-all duration-300"
                  style={{
                    boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)'
                  }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  <div className="relative z-10">
                    <div className="text-gray-500 text-[10px] font-semibold uppercase tracking-widest mb-2">NEEDS ATTENTION</div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{needsAttention}</div>
                    <div className="text-xs text-gray-600">Rejected ({latestClaims.rejected}) + Denied ({latestClaims.denied}) claims</div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Section 1: Claims Status & Outstanding */}
          <div className="bg-gradient-to-br from-white via-white to-slate-50/20 rounded-[24px] p-6 shadow-2xl border-2 border-[#2d6e7e] relative overflow-hidden group hover:shadow-[0_20px_70px_-10px_rgba(45,110,126,0.3)] transition-all duration-300"
            style={{
              boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)'
            }}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-2">CLAIMS STATUS</div>
              <h3 className="text-gray-900 text-xl font-semibold mb-6">Last 30 Days Claims Activity</h3>

              <div className="grid grid-cols-2 gap-6">
                {/* Claims Status Tiles */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Claims Breakdown</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {(() => {
                      const latestClaims = CLAIMS_STATUS_DATA[CLAIMS_STATUS_DATA.length - 1];
                      return (
                        <>
                          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="text-3xl font-bold text-green-700">{latestClaims.paid}</div>
                            <div className="text-xs text-green-600 mt-1">Paid claims</div>
                          </div>
                          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                            <div className="text-3xl font-bold text-red-700">{latestClaims.rejected}</div>
                            <div className="text-xs text-red-600 mt-1">Rejected</div>
                          </div>
                          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                            <div className="text-3xl font-bold text-orange-700">{latestClaims.denied}</div>
                            <div className="text-xs text-orange-600 mt-1">Denied</div>
                          </div>
                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="text-3xl font-bold text-blue-700">{latestClaims.deductible}</div>
                            <div className="text-xs text-blue-600 mt-1">Deductible</div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Claims Status Over Time Chart */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Claims Trend</h4>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={CLAIMS_STATUS_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '11px' }} />
                      <YAxis stroke="#6b7280" style={{ fontSize: '11px' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="paid" stroke="#10b981" strokeWidth={2} name="Paid" />
                      <Line type="monotone" dataKey="rejected" stroke="#ef4444" strokeWidth={2} name="Rejected" />
                      <Line type="monotone" dataKey="denied" stroke="#f97316" strokeWidth={2} name="Denied" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Outstanding Claims by Aging */}
          <div className="bg-gradient-to-br from-white via-white to-slate-50/20 rounded-[24px] p-6 shadow-2xl border-2 border-[#2d6e7e] relative overflow-hidden group hover:shadow-[0_20px_70px_-10px_rgba(45,110,126,0.3)] transition-all duration-300"
            style={{
              boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)'
            }}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-2">OUTSTANDING CLAIMS</div>
              <h3 className="text-gray-900 text-xl font-semibold mb-6">Claims Aging Analysis</h3>

              <div className="grid grid-cols-2 gap-6">
                {/* Outstanding Claims Bar Chart */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Outstanding by Age</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={OUTSTANDING_CLAIMS_AGING}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="category" stroke="#6b7280" style={{ fontSize: '11px' }} />
                      <YAxis stroke="#6b7280" style={{ fontSize: '11px' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        formatter={(value) => `$${value.toLocaleString()}`}
                      />
                      <Bar dataKey="amount" fill="#3b82f6">
                        {OUTSTANDING_CLAIMS_AGING.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#10b981', '#f59e0b', '#f97316', '#ef4444'][index]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Outstanding Claims Summary */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Aging Breakdown</h4>
                  <div className="space-y-3">
                    {OUTSTANDING_CLAIMS_AGING.map((item, idx) => {
                      const colors = [
                        { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
                        { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
                        { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
                        { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' }
                      ];
                      const color = colors[idx];
                      return (
                        <div key={idx} className={`flex items-center justify-between p-3 ${color.bg} rounded-lg border ${color.border}`}>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{item.category}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {idx === 0 && 'Not yet billed to insurance'}
                              {idx === 1 && 'Claims due in 30 days'}
                              {idx === 2 && 'Claims due in 60 days'}
                              {idx === 3 && 'Claims overdue 90+ days'}
                            </div>
                          </div>
                          <div className={`text-lg font-bold ${color.text}`}>${(item.amount / 1000).toFixed(1)}K</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'admin' && (
        <div className="flex flex-col gap-6 overflow-y-auto pb-6">
          {/* Top Row - 3 Admin Health Tiles */}
          <div className="grid grid-cols-3 gap-4 flex-shrink-0">
            {/* Tile 1: Total Client Balance Owed */}
            {(() => {
              const latestData = CLIENT_BALANCE_AGING_DATA[CLIENT_BALANCE_AGING_DATA.length - 1];
              const totalClientBalance = latestData.current + latestData.days1_30 + latestData.days31_60 + latestData.days61_plus;
              return (
                <div className="bg-gradient-to-br from-white via-white to-slate-50/20 rounded-[20px] p-5 shadow-2xl border-2 border-[#2d6e7e] relative overflow-hidden group hover:shadow-[0_20px_70px_-10px_rgba(45,110,126,0.3)] transition-all duration-300"
                  style={{
                    boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)'
                  }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  <div className="relative z-10">
                    <div className="text-gray-500 text-[10px] font-semibold uppercase tracking-widest mb-2">BILLING</div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">${(totalClientBalance / 1000).toFixed(1)}K</div>
                    <div className="text-xs text-gray-600">Clients still owe after invoices</div>
                  </div>
                </div>
              );
            })()}

            {/* Tile 2: Past-Due Invoices */}
            {(() => {
              const latestData = CLIENT_BALANCE_AGING_DATA[CLIENT_BALANCE_AGING_DATA.length - 1];
              const pastDueTotal = latestData.days1_30 + latestData.days31_60 + latestData.days61_plus;
              return (
                <div className="bg-gradient-to-br from-white via-white to-slate-50/20 rounded-[20px] p-5 shadow-2xl border-2 border-[#2d6e7e] relative overflow-hidden group hover:shadow-[0_20px_70px_-10px_rgba(45,110,126,0.3)] transition-all duration-300"
                  style={{
                    boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)'
                  }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  <div className="relative z-10">
                    <div className="text-gray-500 text-[10px] font-semibold uppercase tracking-widest mb-2">AGING</div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">${(pastDueTotal / 1000).toFixed(1)}K</div>
                    <div className="text-xs text-gray-600">1-30: ${(latestData.days1_30/1000).toFixed(1)}K · 31-60: ${(latestData.days31_60/1000).toFixed(1)}K · 61+: ${(latestData.days61_plus/1000).toFixed(1)}K</div>
                  </div>
                </div>
              );
            })()}

            {/* Tile 3: Unsigned/Missing Notes */}
            {(() => {
              const latestData = NOTES_STATUS_DATA[NOTES_STATUS_DATA.length - 1];
              const missingNotes = latestData.noNote;
              return (
                <div className="bg-gradient-to-br from-white via-white to-slate-50/20 rounded-[20px] p-5 shadow-2xl border-2 border-[#2d6e7e] relative overflow-hidden group hover:shadow-[0_20px_70px_-10px_rgba(45,110,126,0.3)] transition-all duration-300"
                  style={{
                    boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)'
                  }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  <div className="relative z-10">
                    <div className="text-gray-500 text-[10px] font-semibold uppercase tracking-widest mb-2">COMPLIANCE</div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{missingNotes}</div>
                    <div className="text-xs text-gray-600">Appointments without notes</div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Section 1: Billing Health */}
          <div className="bg-gradient-to-br from-white via-white to-slate-50/20 rounded-[24px] p-6 shadow-2xl border-2 border-[#2d6e7e] relative overflow-hidden group hover:shadow-[0_20px_70px_-10px_rgba(45,110,126,0.3)] transition-all duration-300"
            style={{
              boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)'
            }}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-2">BILLING HEALTH</div>
              <h3 className="text-gray-900 text-xl font-semibold mb-6">Client Balance Aging</h3>

              <div className="grid grid-cols-2 gap-6">
                {/* Chart: Client Balance Aging Bars */}
                <div>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[CLIENT_BALANCE_AGING_DATA[CLIENT_BALANCE_AGING_DATA.length - 1]]} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis type="number" stroke="#6b7280" style={{ fontSize: '12px' }} />
                      <YAxis dataKey="name" type="category" hide />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        formatter={(value) => `$${value.toLocaleString()}`}
                      />
                      <Bar dataKey="current" stackId="a" fill="#10b981" name="Current" />
                      <Bar dataKey="days1_30" stackId="a" fill="#f59e0b" name="1-30 days" />
                      <Bar dataKey="days31_60" stackId="a" fill="#f97316" name="31-60 days" />
                      <Bar dataKey="days61_plus" stackId="a" fill="#ef4444" name="61+ days" />
                      <Legend />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* List: Top 5 Clients by Past-Due Balance */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Top 5 Clients by Past-Due Balance</h4>
                  <div className="space-y-2">
                    {TOP_CLIENTS_PAST_DUE.map((client, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{client.name}</div>
                          <div className="text-xs text-gray-500">{client.worstBucket}</div>
                        </div>
                        <div className="text-sm font-bold text-gray-900">${client.balance.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Documentation & Notes */}
          <div className="bg-gradient-to-br from-white via-white to-slate-50/20 rounded-[24px] p-6 shadow-2xl border-2 border-[#2d6e7e] relative overflow-hidden group hover:shadow-[0_20px_70px_-10px_rgba(45,110,126,0.3)] transition-all duration-300"
            style={{
              boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)'
            }}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-2">DOCUMENTATION & NOTES</div>
              <h3 className="text-gray-900 text-xl font-semibold mb-6">Notes Status & Compliance</h3>

              <div className="grid grid-cols-2 gap-6">
                {/* Notes Status Tiles */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Current Period Status</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {(() => {
                      const latestNotes = NOTES_STATUS_DATA[NOTES_STATUS_DATA.length - 1];
                      return (
                        <>
                          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                            <div className="text-2xl font-bold text-red-700">{latestNotes.noNote}</div>
                            <div className="text-xs text-red-600">No note</div>
                          </div>
                          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div className="text-2xl font-bold text-yellow-700">{latestNotes.unlocked}</div>
                            <div className="text-xs text-yellow-600">Unlocked</div>
                          </div>
                          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="text-2xl font-bold text-green-700">{latestNotes.locked}</div>
                            <div className="text-xs text-green-600">Locked</div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* At-Risk Compliance List */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">5 Oldest Appointments Without Notes</h4>
                  <div className="space-y-2">
                    {AT_RISK_COMPLIANCE.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-red-50 rounded-lg border border-red-100">
                        <div className="flex items-center gap-3">
                          <div className="text-xs font-medium text-gray-900">{item.date}</div>
                          <div className="text-xs text-gray-600">{item.clientInitials}</div>
                        </div>
                        <div className="text-xs font-medium text-gray-700">{item.clinician}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Reminders & Email Health */}
          <div className="bg-gradient-to-br from-white via-white to-slate-50/20 rounded-[24px] p-6 shadow-2xl border-2 border-[#2d6e7e] relative overflow-hidden group hover:shadow-[0_20px_70px_-10px_rgba(45,110,126,0.3)] transition-all duration-300"
            style={{
              boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)'
            }}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-2">REMINDERS & EMAIL HEALTH</div>
              <h3 className="text-gray-900 text-xl font-semibold mb-6">Reminder Delivery Status</h3>

              {(() => {
                const latestReminders = REMINDER_DELIVERY_DATA[REMINDER_DELIVERY_DATA.length - 1];
                const successRate = ((latestReminders.sent - latestReminders.failed) / latestReminders.sent * 100).toFixed(1);
                return (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-3xl font-bold text-blue-700">{latestReminders.sent}</div>
                      <div className="text-xs text-blue-600">Reminders sent (last 30 days)</div>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="text-3xl font-bold text-red-700">{latestReminders.failed}</div>
                      <div className="text-xs text-red-600">Failed / not delivered</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-3xl font-bold text-green-700">{successRate}%</div>
                      <div className="text-xs text-green-600">Reminder success rate</div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};