import React, { useState, useMemo } from 'react';
import { MetricChart } from './MetricChart';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, LabelList, Legend, CartesianGrid, ReferenceLine, ComposedChart } from 'recharts';
import { Info, X, ArrowRight, Calendar, ChevronLeft, ChevronRight, Maximize2, Minimize2, Users } from 'lucide-react';
import { useIsMobile } from '../hooks/useIsMobile';
import { ToggleButton, GoalIndicator, ActionButton } from './design-system';
import { FinancialAnalysisTab, SessionsAnalysisTab, CapacityClientTab } from './analysis';

type TabType = 'financial' | 'sessions' | 'capacity-client' | 'retention' | 'insurance' | 'admin' | 'team-comparison';

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

// Session timing heatmap data - sessions per hour slot per day of week
// Realistic therapy practice patterns: peaks at lunch (12-1pm) and after work (5-7pm)
// Lower on weekends, Monday mornings slow, Thursday/Friday evenings busy
const SESSION_TIMING_DATA = [
  // Format: { day, hour, sessions } - hour is 0-23, sessions is count
  // Monday - slow morning, picks up afternoon
  { day: 'Mon', hour: 8, sessions: 12 }, { day: 'Mon', hour: 9, sessions: 18 }, { day: 'Mon', hour: 10, sessions: 24 },
  { day: 'Mon', hour: 11, sessions: 28 }, { day: 'Mon', hour: 12, sessions: 32 }, { day: 'Mon', hour: 13, sessions: 26 },
  { day: 'Mon', hour: 14, sessions: 30 }, { day: 'Mon', hour: 15, sessions: 34 }, { day: 'Mon', hour: 16, sessions: 38 },
  { day: 'Mon', hour: 17, sessions: 42 }, { day: 'Mon', hour: 18, sessions: 36 }, { day: 'Mon', hour: 19, sessions: 22 },
  // Tuesday - solid throughout
  { day: 'Tue', hour: 8, sessions: 16 }, { day: 'Tue', hour: 9, sessions: 28 }, { day: 'Tue', hour: 10, sessions: 32 },
  { day: 'Tue', hour: 11, sessions: 36 }, { day: 'Tue', hour: 12, sessions: 38 }, { day: 'Tue', hour: 13, sessions: 30 },
  { day: 'Tue', hour: 14, sessions: 34 }, { day: 'Tue', hour: 15, sessions: 40 }, { day: 'Tue', hour: 16, sessions: 44 },
  { day: 'Tue', hour: 17, sessions: 48 }, { day: 'Tue', hour: 18, sessions: 42 }, { day: 'Tue', hour: 19, sessions: 28 },
  // Wednesday - midweek peak
  { day: 'Wed', hour: 8, sessions: 18 }, { day: 'Wed', hour: 9, sessions: 30 }, { day: 'Wed', hour: 10, sessions: 36 },
  { day: 'Wed', hour: 11, sessions: 40 }, { day: 'Wed', hour: 12, sessions: 44 }, { day: 'Wed', hour: 13, sessions: 34 },
  { day: 'Wed', hour: 14, sessions: 38 }, { day: 'Wed', hour: 15, sessions: 42 }, { day: 'Wed', hour: 16, sessions: 46 },
  { day: 'Wed', hour: 17, sessions: 52 }, { day: 'Wed', hour: 18, sessions: 48 }, { day: 'Wed', hour: 19, sessions: 32 },
  // Thursday - busiest day, especially evenings
  { day: 'Thu', hour: 8, sessions: 20 }, { day: 'Thu', hour: 9, sessions: 32 }, { day: 'Thu', hour: 10, sessions: 38 },
  { day: 'Thu', hour: 11, sessions: 44 }, { day: 'Thu', hour: 12, sessions: 48 }, { day: 'Thu', hour: 13, sessions: 36 },
  { day: 'Thu', hour: 14, sessions: 42 }, { day: 'Thu', hour: 15, sessions: 46 }, { day: 'Thu', hour: 16, sessions: 52 },
  { day: 'Thu', hour: 17, sessions: 58 }, { day: 'Thu', hour: 18, sessions: 54 }, { day: 'Thu', hour: 19, sessions: 38 },
  // Friday - morning rush, tapers off
  { day: 'Fri', hour: 8, sessions: 22 }, { day: 'Fri', hour: 9, sessions: 34 }, { day: 'Fri', hour: 10, sessions: 40 },
  { day: 'Fri', hour: 11, sessions: 38 }, { day: 'Fri', hour: 12, sessions: 42 }, { day: 'Fri', hour: 13, sessions: 32 },
  { day: 'Fri', hour: 14, sessions: 28 }, { day: 'Fri', hour: 15, sessions: 24 }, { day: 'Fri', hour: 16, sessions: 20 },
  { day: 'Fri', hour: 17, sessions: 16 }, { day: 'Fri', hour: 18, sessions: 10 }, { day: 'Fri', hour: 19, sessions: 6 },
  // Saturday - limited hours, some availability
  { day: 'Sat', hour: 8, sessions: 4 }, { day: 'Sat', hour: 9, sessions: 12 }, { day: 'Sat', hour: 10, sessions: 18 },
  { day: 'Sat', hour: 11, sessions: 16 }, { day: 'Sat', hour: 12, sessions: 14 }, { day: 'Sat', hour: 13, sessions: 8 },
  { day: 'Sat', hour: 14, sessions: 4 }, { day: 'Sat', hour: 15, sessions: 2 }, { day: 'Sat', hour: 16, sessions: 0 },
  { day: 'Sat', hour: 17, sessions: 0 }, { day: 'Sat', hour: 18, sessions: 0 }, { day: 'Sat', hour: 19, sessions: 0 },
  // Sunday - minimal
  { day: 'Sun', hour: 8, sessions: 0 }, { day: 'Sun', hour: 9, sessions: 2 }, { day: 'Sun', hour: 10, sessions: 6 },
  { day: 'Sun', hour: 11, sessions: 8 }, { day: 'Sun', hour: 12, sessions: 6 }, { day: 'Sun', hour: 13, sessions: 4 },
  { day: 'Sun', hour: 14, sessions: 2 }, { day: 'Sun', hour: 15, sessions: 0 }, { day: 'Sun', hour: 16, sessions: 0 },
  { day: 'Sun', hour: 17, sessions: 0 }, { day: 'Sun', hour: 18, sessions: 0 }, { day: 'Sun', hour: 19, sessions: 0 },
];

const ALL_SESSIONS_DATA = [
  { month: 'Jan', completed: 628, booked: 658, clients: 142, cancelled: 113, clinicianCancelled: 23, lateCancelled: 24, noShow: 7, show: 493, telehealth: 245, inPerson: 383 },
  { month: 'Feb', completed: 641, booked: 672, clients: 145, cancelled: 115, clinicianCancelled: 23, lateCancelled: 25, noShow: 8, show: 501, telehealth: 256, inPerson: 385 },
  { month: 'Mar', completed: 635, booked: 668, clients: 143, cancelled: 115, clinicianCancelled: 23, lateCancelled: 24, noShow: 8, show: 498, telehealth: 260, inPerson: 375 },
  { month: 'Apr', completed: 658, booked: 695, clients: 148, cancelled: 119, clinicianCancelled: 24, lateCancelled: 25, noShow: 8, show: 519, telehealth: 276, inPerson: 382 },
  { month: 'May', completed: 651, booked: 685, clients: 146, cancelled: 117, clinicianCancelled: 24, lateCancelled: 25, noShow: 8, show: 511, telehealth: 280, inPerson: 371 },
  { month: 'Jun', completed: 672, booked: 708, clients: 151, cancelled: 121, clinicianCancelled: 25, lateCancelled: 26, noShow: 8, show: 528, telehealth: 295, inPerson: 377 },
  { month: 'Jul', completed: 665, booked: 698, clients: 149, cancelled: 120, clinicianCancelled: 24, lateCancelled: 25, noShow: 8, show: 521, telehealth: 299, inPerson: 366 },
  { month: 'Aug', completed: 689, booked: 725, clients: 154, cancelled: 124, clinicianCancelled: 25, lateCancelled: 27, noShow: 8, show: 541, telehealth: 317, inPerson: 372 },
  { month: 'Sep', completed: 645, booked: 678, clients: 147, cancelled: 116, clinicianCancelled: 23, lateCancelled: 24, noShow: 8, show: 507, telehealth: 303, inPerson: 342 },
  { month: 'Oct', completed: 712, booked: 748, clients: 158, cancelled: 128, clinicianCancelled: 26, lateCancelled: 27, noShow: 8, show: 559, telehealth: 342, inPerson: 370 },
  { month: 'Nov', completed: 683, booked: 718, clients: 152, cancelled: 123, clinicianCancelled: 25, lateCancelled: 26, noShow: 8, show: 536, telehealth: 335, inPerson: 348 },
  { month: 'Dec', completed: 698, booked: 732, clients: 155, cancelled: 125, clinicianCancelled: 25, lateCancelled: 26, noShow: 8, show: 548, telehealth: 349, inPerson: 349 }
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

// Team Comparison Data - By Location
type LocationData = {
  location: string;
  avgWeeklySessions: number | string;
  completedSessions: number;
  utilizationPercent: number;
  clientsSeen: number;
  cancelRate: number;
  churnRate: number;
  retentionRate: number;
  outstandingNotes: number;
};

const LOCATION_DATA: LocationData[] = [
  { location: 'Durham', avgWeeklySessions: 51.4, completedSessions: 2547, utilizationPercent: 96, clientsSeen: 173, cancelRate: 18, churnRate: 17, retentionRate: 76, outstandingNotes: 3 },
  { location: 'Chapel Hill', avgWeeklySessions: '31.1 / 37', completedSessions: 1542, utilizationPercent: 84, clientsSeen: 84, cancelRate: 24, churnRate: 11, retentionRate: 74, outstandingNotes: 5 },
  { location: 'Remote', avgWeeklySessions: 35.7, completedSessions: 1768, utilizationPercent: 79, clientsSeen: 108, cancelRate: 21, churnRate: 16, retentionRate: 72, outstandingNotes: 2 },
  { location: 'Chicago', avgWeeklySessions: '15.6 / 16', completedSessions: 637, utilizationPercent: 97, clientsSeen: 53, cancelRate: 27, churnRate: 25, retentionRate: 40, outstandingNotes: 4 }
];

// Team Comparison Data - By Supervisor
type SupervisorData = {
  supervisor: string;
  avgWeeklySessions: number;
  completedSessions: number;
  utilizationPercent: number;
  clientsSeen: number;
  cancelRate: number;
  churnRate: number;
  retentionRate: number;
  outstandingNotes: number;
};

const SUPERVISOR_DATA: SupervisorData[] = [
  { supervisor: 'Barbara Downs', avgWeeklySessions: 48.5, completedSessions: 2404, utilizationPercent: 96, clientsSeen: 142, cancelRate: 22, churnRate: 19, retentionRate: 75, outstandingNotes: 4 },
  { supervisor: 'Eugene Miller', avgWeeklySessions: 45.4, completedSessions: 2249, utilizationPercent: 78, clientsSeen: 146, cancelRate: 20, churnRate: 14, retentionRate: 70, outstandingNotes: 6 }
];

// Team Comparison Data - By Clinician (detailed view)
type ClinicianComparisonData = {
  clinician: string;
  location: string;
  supervisor: string;
  avgWeeklySessions: number;
  completedSessions: number;
  utilizationPercent: number;
  clientsSeen: number;
  cancelRate: number;
  churnRate: number;
  retentionRate: number;
  outstandingNotes: number;
};

const CLINICIAN_COMPARISON_DATA: ClinicianComparisonData[] = [
  { clinician: 'Dr. Sarah Chen', location: 'Durham', supervisor: 'Barbara Downs', avgWeeklySessions: 38.2, completedSessions: 1854, utilizationPercent: 98, clientsSeen: 45, cancelRate: 15, churnRate: 12, retentionRate: 82, outstandingNotes: 0 },
  { clinician: 'Dr. Maria Rodriguez', location: 'Durham', supervisor: 'Barbara Downs', avgWeeklySessions: 35.8, completedSessions: 1693, utilizationPercent: 94, clientsSeen: 42, cancelRate: 19, churnRate: 15, retentionRate: 78, outstandingNotes: 1 },
  { clinician: 'Dr. Raj Patel', location: 'Chapel Hill', supervisor: 'Eugene Miller', avgWeeklySessions: 31.1, completedSessions: 1542, utilizationPercent: 84, clientsSeen: 38, cancelRate: 24, churnRate: 11, retentionRate: 74, outstandingNotes: 2 },
  { clinician: 'Dr. Jessica Kim', location: 'Remote', supervisor: 'Eugene Miller', avgWeeklySessions: 35.7, completedSessions: 1768, utilizationPercent: 79, clientsSeen: 52, cancelRate: 21, churnRate: 16, retentionRate: 72, outstandingNotes: 1 },
  { clinician: 'Dr. Michael Johnson', location: 'Chicago', supervisor: 'Barbara Downs', avgWeeklySessions: 15.6, completedSessions: 637, utilizationPercent: 97, clientsSeen: 28, cancelRate: 27, churnRate: 25, retentionRate: 40, outstandingNotes: 3 }
];

// Month name to index mapping for date comparison
const MONTH_MAP: { [key: string]: number } = {
  'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
  'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
};

export const PracticeAnalysis: React.FC = () => {
  const isMobile = useIsMobile(1024);
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
  const [teamPerformanceView, setTeamPerformanceView] = useState<'sessions' | 'attendance'>('sessions');
  const [capacityTeamView, setCapacityTeamView] = useState<'activeClients' | 'clientUtil' | 'openSlots' | 'sessionUtil'>('activeClients');
  const [showClientBreakdown, setShowClientBreakdown] = useState(false);

  // Team Comparison tab state
  const [locationSortColumn, setLocationSortColumn] = useState<string | null>(null);
  const [locationSortDirection, setLocationSortDirection] = useState<'asc' | 'desc'>('desc');
  const [supervisorSortColumn, setSupervisorSortColumn] = useState<string | null>(null);
  const [supervisorSortDirection, setSupervisorSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showClinicianDetails, setShowClinicianDetails] = useState<string | null>(null);

  // Expanded chart card state
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

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
    { id: 'admin', label: 'Admin Analysis', shortLabel: 'Admin' },
    { id: 'team-comparison', label: 'Team Comparison', shortLabel: 'Team' }
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

  // Client demographics - Gender breakdown
  const CLIENT_GENDER_DATA = {
    male: 127,
    female: 241,
    other: 18,
    total: 386
  };

  // Session frequency breakdown
  const SESSION_FREQUENCY_DATA = {
    weekly: 198,
    biweekly: 156,
    monthly: 32,
    total: 386
  };

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
  const isTeamComparisonTab = activeTab === 'team-comparison';
  const isCapacityClientTab = activeTab === 'capacity-client';

  return (
    <div
      className={`flex-1 overflow-y-auto h-[calc(100vh-80px)] ${(isFinancialTab || isSessionsTab || isTeamComparisonTab || isCapacityClientTab) ? 'bg-gradient-to-b from-stone-100 to-stone-50' : 'p-8 pt-2'}`}
    >
      {/* Financial Tab - Using Design System */}
      {isFinancialTab && (
        <FinancialAnalysisTab
          timePeriod={timePeriod}
          onTimePeriodChange={setTimePeriod}
          timePeriods={timePeriods}
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId as TabType)}
          getDateRangeLabel={getDateRangeLabel}
          revenueData={REVENUE_DATA}
          revenueBreakdownData={REVENUE_BREAKDOWN_DATA}
          clinicianRevenueData={CLINICIAN_REVENUE_DATA}
        />
      )}


      {/* Sessions Tab - Using Design System */}
      {isSessionsTab && (
        <SessionsAnalysisTab
          timePeriod={timePeriod}
          onTimePeriodChange={setTimePeriod}
          timePeriods={timePeriods}
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId as TabType)}
          getDateRangeLabel={getDateRangeLabel}
          sessionsData={SESSIONS_DATA}
          clinicianSessionsData={CLINICIAN_SESSIONS_DATA}
        />
      )}

      {activeTab === 'capacity-client' && (
        <CapacityClientTab
          timePeriod={timePeriod}
          onTimePeriodChange={setTimePeriod}
          timePeriods={timePeriods}
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId as TabType)}
          getDateRangeLabel={getDateRangeLabel}
          clientGrowthData={CLIENT_GROWTH_DATA}
          genderData={CLIENT_GENDER_DATA}
          sessionFrequencyData={SESSION_FREQUENCY_DATA}
          openSlotsData={OPEN_SLOTS_DATA}
          hoursUtilizationData={HOURS_UTILIZATION_DATA}
        />
      )}


      {activeTab === 'retention' && (
            <div className="flex flex-col gap-6 overflow-y-auto">
              {/* Churn Analysis Chart */}
              <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-shrink-0 min-h-[300px] lg:min-h-[400px]" style={{ height: 'clamp(300px, calc(100dvh - 300px), 600px)' }}>
                <div className="w-full lg:w-[55%] h-auto lg:h-full">
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
                <div className="flex flex-col gap-4 lg:gap-6 w-full lg:w-[45%] h-auto lg:h-full">
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

                      <div className="relative z-10 px-1 pb-2" style={{ height: 'clamp(90px, 14vw, 130px)' }}>
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

                      <div className="relative z-10 px-3 pb-2" style={{ height: 'clamp(80px, 15vw, 120px)' }}>
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
                              className="w-24 lg:w-32 bg-gradient-to-t from-[#ef4444] to-[#dc2626] rounded-t-xl shadow-lg"
                              style={{ height: 'clamp(100px, 15vw, 140px)' }}
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
                              className="w-24 lg:w-32 bg-gradient-to-t from-[#f59e0b] to-[#d97706] rounded-t-xl shadow-lg"
                              style={{ height: 'clamp(140px, 20vw, 200px)' }}
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
                              className="w-24 lg:w-32 bg-gradient-to-t from-[#10b981] to-[#059669] rounded-t-xl shadow-lg"
                              style={{ height: 'clamp(180px, 28vw, 280px)' }}
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

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-6">
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

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-6">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-shrink-0">
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

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-6">
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

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-6">
                {/* Notes Status Tiles */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Current Period Status</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      {/* Team Comparison Tab - Premium Dark Header Design */}
      {isTeamComparisonTab && (
        <div className="min-h-full relative">
          {/* Dark Header with Team accent */}
          <div
            className="relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #1c1917 100%)'
            }}
          >
            {/* Subtle grid pattern */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
                                 linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)`,
                backgroundSize: '32px 32px'
              }}
            />
            {/* Indigo glow accent for Team */}
            <div
              className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
              style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }}
            />
            <div
              className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full opacity-15 blur-2xl"
              style={{ background: 'radial-gradient(circle, #818cf8 0%, transparent 70%)' }}
            />

            {/* Header content */}
            <div className="relative z-10 px-4 sm:px-6 lg:px-8 xl:px-10 pt-6 sm:pt-8 pb-6">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 lg:gap-0">
                {/* Title & Breadcrumb */}
                <div>
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <span className="text-stone-500 text-xs sm:text-sm font-medium uppercase tracking-widest">Detailed Analysis</span>
                    <span className="text-stone-600">/</span>
                    <span className="text-indigo-400 text-xs sm:text-sm font-bold uppercase tracking-widest">Team</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
                    <h1
                      className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl text-white font-bold tracking-tight"
                      style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                    >
                      Team Comparison
                    </h1>
                    <span className="text-stone-400 text-sm sm:text-base font-medium">
                      {getDateRangeLabel()}
                    </span>
                  </div>
                </div>

              {/* Time Period Selector - Dark Theme */}
              <div className="flex items-center gap-2 sm:gap-4 relative">
                {/* Mobile: Select dropdown */}
                <select
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value as any)}
                  className="md:hidden px-3 py-2 rounded-xl border border-stone-600 bg-stone-800 text-sm font-medium text-white"
                >
                  {timePeriods.map((period) => (
                    <option key={period.id} value={period.id}>{period.label}</option>
                  ))}
                  <option value="custom">Custom Range</option>
                </select>

                {/* Desktop: Button group */}
                <div
                  className="hidden md:flex items-center gap-1 p-1 lg:p-1.5 rounded-xl lg:rounded-2xl bg-stone-800/60 backdrop-blur-sm"
                  style={{
                    boxShadow: '0 4px 20px -4px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                  }}
                >
                  {timePeriods.map((period) => (
                    <button
                      key={period.id}
                      onClick={() => setTimePeriod(period.id)}
                      className={`px-3 lg:px-5 py-2 lg:py-2.5 rounded-lg lg:rounded-xl text-xs lg:text-sm font-semibold transition-all duration-300 ${
                        timePeriod === period.id
                          ? 'bg-white text-stone-900 shadow-lg'
                          : 'text-stone-400 hover:text-white hover:bg-stone-700/50'
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                  {/* Custom Range Button */}
                  <button
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className={`group px-3 lg:px-5 py-2 lg:py-2.5 rounded-lg lg:rounded-xl text-xs lg:text-sm font-semibold transition-all duration-500 flex items-center gap-1.5 lg:gap-2.5 relative overflow-hidden ${
                      timePeriod === 'custom'
                        ? 'bg-white text-stone-900 shadow-lg'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    <Calendar
                      size={16}
                      className={`transition-transform duration-500 ${showDatePicker ? 'rotate-12' : 'group-hover:rotate-6'}`}
                    />
                    <span className="hidden lg:inline">{timePeriod === 'custom' ? formatCustomRange() : 'Custom'}</span>
                    <span className="lg:hidden">{timePeriod === 'custom' ? 'Custom' : 'Custom'}</span>
                  </button>
                </div>

                {/* Date Picker Dropdown */}
                {showDatePicker && (
                  <div
                    className="absolute top-full right-0 mt-3 z-[100000] rounded-2xl bg-white p-4 sm:p-6"
                    style={{
                      width: 'min(340px, 90vw)',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                      animation: 'fadeIn 0.2s ease-out'
                    }}
                  >
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

                    {/* Month Grid */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4 sm:mb-5">
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, idx) => {
                        const isStart = idx === customStartMonth;
                        const isEnd = idx === customEndMonth;
                        const isInRange = idx > customStartMonth && idx < customEndMonth;
                        const isSelected = isStart || isEnd;

                        return (
                          <button
                            key={month}
                            onClick={() => {
                              if (customStartMonth === customEndMonth) {
                                if (idx < customStartMonth) {
                                  setCustomStartMonth(idx);
                                } else if (idx > customStartMonth) {
                                  setCustomEndMonth(idx);
                                }
                              } else {
                                setCustomStartMonth(idx);
                                setCustomEndMonth(idx);
                              }
                            }}
                            className={`py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                              isSelected
                                ? 'bg-stone-900 text-white shadow-md'
                                : isInRange
                                  ? 'bg-stone-200 text-stone-700'
                                  : 'text-stone-600 hover:bg-stone-100'
                            }`}
                          >
                            {month}
                          </button>
                        );
                      })}
                    </div>

                    {/* Apply Button */}
                    <button
                      onClick={() => {
                        setTimePeriod('custom');
                        setShowDatePicker(false);
                      }}
                      className="w-full py-3 rounded-xl bg-white text-stone-900 font-semibold transition-all hover:bg-stone-100 active:scale-[0.98]"
                    >
                      Apply Range
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Tab Navigation - Dark theme pills */}
            <div className="flex items-center gap-2 sm:gap-3 mt-6 overflow-x-auto scrollbar-hide pb-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-white text-stone-900 shadow-lg'
                      : 'text-stone-400 hover:text-white border border-stone-600 hover:border-stone-500 bg-transparent'
                  }`}
                >
                  {tab.shortLabel}
                </button>
              ))}
            </div>
          </div>
        </div>

          {/* Main Content */}
          <div className="px-4 sm:px-6 lg:px-8 xl:px-10 py-6 xl:py-10 space-y-6 xl:space-y-8">
            {/* Summary Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-6">
              {/* Total Clinicians */}
              <div
                className="rounded-2xl sm:rounded-3xl p-4 sm:p-5 xl:p-6 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
                  boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)'
                }}
              >
                <h3
                  className="text-stone-800 text-lg sm:text-xl xl:text-2xl font-semibold mb-2 sm:mb-3 xl:mb-4"
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  Total Clinicians
                </h3>
                <span
                  className="text-stone-900 font-bold block text-2xl sm:text-3xl xl:text-[2.5rem]"
                  style={{ lineHeight: 1, fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  {CLINICIAN_COMPARISON_DATA.length}
                </span>
                <p className="text-stone-500 text-sm sm:text-base xl:text-lg mt-2 sm:mt-3">
                  across {LOCATION_DATA.length} locations
                </p>
              </div>

              {/* Total Sessions */}
              <div
                className="rounded-2xl sm:rounded-3xl p-4 sm:p-5 xl:p-6 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
                  boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)'
                }}
              >
                <h3
                  className="text-stone-800 text-lg sm:text-xl xl:text-2xl font-semibold mb-2 sm:mb-3 xl:mb-4"
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  Total Sessions
                </h3>
                <span
                  className="text-stone-900 font-bold block text-2xl sm:text-3xl xl:text-[2.5rem]"
                  style={{ lineHeight: 1, fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  {LOCATION_DATA.reduce((sum, loc) => sum + loc.completedSessions, 0).toLocaleString()}
                </span>
                <p className="text-stone-500 text-sm sm:text-base xl:text-lg mt-2 sm:mt-3">
                  completed this period
                </p>
              </div>

              {/* Avg Utilization */}
              <div
                className="rounded-2xl sm:rounded-3xl p-4 sm:p-5 xl:p-6 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
                  boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)'
                }}
              >
                <h3
                  className="text-stone-800 text-lg sm:text-xl xl:text-2xl font-semibold mb-2 sm:mb-3 xl:mb-4"
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  Avg Utilization
                </h3>
                <span
                  className="text-stone-900 font-bold block text-2xl sm:text-3xl xl:text-[2.5rem]"
                  style={{ lineHeight: 1, fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  {(LOCATION_DATA.reduce((sum, loc) => sum + loc.utilizationPercent, 0) / LOCATION_DATA.length).toFixed(0)}%
                </span>
                <p className="text-stone-500 text-sm sm:text-base xl:text-lg mt-2 sm:mt-3">
                  of goal achieved
                </p>
              </div>

              {/* Avg Retention */}
              <div
                className="rounded-2xl sm:rounded-3xl p-4 sm:p-5 xl:p-6 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
                  boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)'
                }}
              >
                <h3
                  className="text-stone-800 text-lg sm:text-xl xl:text-2xl font-semibold mb-2 sm:mb-3 xl:mb-4"
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  Avg Retention
                </h3>
                <span
                  className="text-stone-900 font-bold block"
                  className="text-2xl sm:text-3xl xl:text-[2.5rem]" style={{ lineHeight: 1, fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  {(LOCATION_DATA.reduce((sum, loc) => sum + loc.retentionRate, 0) / LOCATION_DATA.length).toFixed(0)}%
                </span>
                <p className="text-stone-500 text-sm sm:text-base xl:text-lg mt-2 sm:mt-3">
                  client retention rate
                </p>
              </div>
            </div>

            {/* Group by Primary Location Table */}
            <div
              className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 xl:p-8"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
                boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)'
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-stone-800 text-2xl font-semibold" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                  Group by Primary Location
                </h3>
                <button
                  className="text-indigo-600 text-sm font-semibold hover:text-indigo-800 transition-colors flex items-center gap-2"
                  onClick={() => setShowClinicianDetails(showClinicianDetails === 'location' ? null : 'location')}
                >
                  See Clinicians by Primary Location
                  <ArrowRight size={16} />
                </button>
              </div>

              {isMobile ? (
                /* Mobile: Card view */
                <div className="space-y-3">
                  {[...LOCATION_DATA].sort((a, b) => {
                    if (!locationSortColumn) return 0;
                    const aVal = a[locationSortColumn as keyof LocationData];
                    const bVal = b[locationSortColumn as keyof LocationData];
                    const aNum = typeof aVal === 'string' ? parseFloat(aVal.split('/')[0]) : aVal;
                    const bNum = typeof bVal === 'string' ? parseFloat(bVal.split('/')[0]) : bVal;
                    return locationSortDirection === 'asc' ? (aNum as number) - (bNum as number) : (bNum as number) - (aNum as number);
                  }).map((row) => (
                    <div key={row.location} className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm">
                      <div className="font-semibold text-stone-800 uppercase tracking-wide mb-3">{row.location}</div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-stone-500">Avg Weekly:</span>
                          <span className="font-medium text-stone-900 ml-1">{row.avgWeeklySessions}</span>
                        </div>
                        <div>
                          <span className="text-stone-500">Completed:</span>
                          <span className="font-medium text-stone-900 ml-1">{row.completedSessions.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${row.utilizationPercent >= 90 ? 'bg-emerald-500' : row.utilizationPercent >= 80 ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                          <span className="text-stone-500">Utilization:</span>
                          <span className="font-medium text-stone-900">{row.utilizationPercent}%</span>
                        </div>
                        <div>
                          <span className="text-stone-500">Clients:</span>
                          <span className="font-medium text-stone-900 ml-1">{row.clientsSeen}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${row.cancelRate <= 20 ? 'bg-emerald-500' : row.cancelRate <= 25 ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                          <span className="text-stone-500">Cancel:</span>
                          <span className="font-medium text-stone-900">{row.cancelRate}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${row.churnRate <= 15 ? 'bg-emerald-500' : row.churnRate <= 20 ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                          <span className="text-stone-500">Churn:</span>
                          <span className="font-medium text-stone-900">{row.churnRate}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${row.retentionRate >= 75 ? 'bg-emerald-500' : row.retentionRate >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                          <span className="text-stone-500">Retention:</span>
                          <span className="font-medium text-stone-900">{row.retentionRate}%</span>
                        </div>
                        <div>
                          <span className="text-stone-500">Notes:</span>
                          <span className="font-medium text-stone-900 ml-1">{row.outstandingNotes}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Desktop: Table view */
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-stone-200">
                        <th className="text-left py-5 px-4 text-sm font-bold text-stone-500 uppercase tracking-wider">
                          <button
                            className="flex items-center gap-2 hover:text-stone-900 transition-colors"
                            onClick={() => {
                              if (locationSortColumn === 'location') {
                                setLocationSortDirection(locationSortDirection === 'asc' ? 'desc' : 'asc');
                              } else {
                                setLocationSortColumn('location');
                                setLocationSortDirection('asc');
                              }
                            }}
                          >
                            Group by Primary Location
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                          </button>
                        </th>
                        {['Avg Weekly Sessions', 'Completed Sessions', 'Utilization (% of Goal)', 'Clients Seen', 'Cancel Rate', 'Churn Rate', 'Retention Rate', 'Outstanding Notes'].map((header, idx) => (
                          <th key={header} className="text-center py-5 px-4 text-sm font-bold text-stone-500 uppercase tracking-wider">
                            <button
                              className="flex items-center justify-center gap-1 hover:text-stone-900 transition-colors w-full"
                              onClick={() => {
                                const columnKey = ['avgWeeklySessions', 'completedSessions', 'utilizationPercent', 'clientsSeen', 'cancelRate', 'churnRate', 'retentionRate', 'outstandingNotes'][idx];
                                if (locationSortColumn === columnKey) {
                                  setLocationSortDirection(locationSortDirection === 'asc' ? 'desc' : 'asc');
                                } else {
                                  setLocationSortColumn(columnKey);
                                  setLocationSortDirection('desc');
                                }
                              }}
                            >
                              {header}
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                              </svg>
                            </button>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...LOCATION_DATA].sort((a, b) => {
                        if (!locationSortColumn) return 0;
                        const aVal = a[locationSortColumn as keyof LocationData];
                        const bVal = b[locationSortColumn as keyof LocationData];
                        const aNum = typeof aVal === 'string' ? parseFloat(aVal.split('/')[0]) : aVal;
                        const bNum = typeof bVal === 'string' ? parseFloat(bVal.split('/')[0]) : bVal;
                        return locationSortDirection === 'asc' ? (aNum as number) - (bNum as number) : (bNum as number) - (aNum as number);
                      }).map((row, idx) => (
                        <tr key={row.location} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                          <td className="py-5 px-4 text-base font-semibold text-stone-900 uppercase tracking-wide">{row.location}</td>
                          <td className="py-5 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <span className={`w-2.5 h-2.5 rounded-full ${typeof row.avgWeeklySessions === 'string' ? 'bg-amber-500' : 'bg-transparent'}`}></span>
                              <span className="text-base text-stone-700 font-medium">{row.avgWeeklySessions}</span>
                            </div>
                          </td>
                          <td className="py-5 px-4 text-base text-stone-700 text-center font-medium">{row.completedSessions.toLocaleString()}</td>
                          <td className="py-5 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <span className={`w-2.5 h-2.5 rounded-full ${row.utilizationPercent >= 90 ? 'bg-emerald-500' : row.utilizationPercent >= 80 ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                              <span className="text-base text-stone-700 font-medium">{row.utilizationPercent}%</span>
                            </div>
                          </td>
                          <td className="py-5 px-4 text-base text-stone-700 text-center font-medium">{row.clientsSeen}</td>
                          <td className="py-5 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <span className={`w-2.5 h-2.5 rounded-full ${row.cancelRate <= 20 ? 'bg-emerald-500' : row.cancelRate <= 25 ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                              <span className="text-base text-stone-700 font-medium">{row.cancelRate}%</span>
                            </div>
                          </td>
                          <td className="py-5 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <span className={`w-2.5 h-2.5 rounded-full ${row.churnRate <= 15 ? 'bg-emerald-500' : row.churnRate <= 20 ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                              <span className="text-base text-stone-700 font-medium">{row.churnRate}%</span>
                            </div>
                          </td>
                          <td className="py-5 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <span className={`w-2.5 h-2.5 rounded-full ${row.retentionRate >= 75 ? 'bg-emerald-500' : row.retentionRate >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                              <span className="text-base text-stone-700 font-medium">{row.retentionRate}%</span>
                            </div>
                          </td>
                          <td className="py-5 px-4 text-base text-stone-700 text-center font-medium">{row.outstandingNotes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Group by Supervisor Table */}
            <div
              className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 xl:p-8"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
                boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)'
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-stone-800 text-2xl font-semibold" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                  Group by Supervisor
                </h3>
                <button
                  className="text-indigo-600 text-sm font-semibold hover:text-indigo-800 transition-colors flex items-center gap-2"
                  onClick={() => setShowClinicianDetails(showClinicianDetails === 'supervisor' ? null : 'supervisor')}
                >
                  See Clinicians by Supervisor
                  <ArrowRight size={16} />
                </button>
              </div>

              {isMobile ? (
                /* Mobile: Card view */
                <div className="space-y-3">
                  {[...SUPERVISOR_DATA].sort((a, b) => {
                    if (!supervisorSortColumn) return 0;
                    const aVal = a[supervisorSortColumn as keyof SupervisorData];
                    const bVal = b[supervisorSortColumn as keyof SupervisorData];
                    if (typeof aVal === 'string' && typeof bVal === 'string') {
                      return supervisorSortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
                    }
                    return supervisorSortDirection === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
                  }).map((row) => (
                    <div key={row.supervisor} className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm">
                      <div className="font-semibold text-stone-800 uppercase tracking-wide mb-3">{row.supervisor}</div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-stone-500">Avg Weekly:</span>
                          <span className="font-medium text-stone-900 ml-1">{row.avgWeeklySessions}</span>
                        </div>
                        <div>
                          <span className="text-stone-500">Completed:</span>
                          <span className="font-medium text-stone-900 ml-1">{row.completedSessions.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${row.utilizationPercent >= 90 ? 'bg-emerald-500' : row.utilizationPercent >= 80 ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                          <span className="text-stone-500">Utilization:</span>
                          <span className="font-medium text-stone-900">{row.utilizationPercent}%</span>
                        </div>
                        <div>
                          <span className="text-stone-500">Clients:</span>
                          <span className="font-medium text-stone-900 ml-1">{row.clientsSeen}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${row.cancelRate <= 20 ? 'bg-emerald-500' : row.cancelRate <= 25 ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                          <span className="text-stone-500">Cancel:</span>
                          <span className="font-medium text-stone-900">{row.cancelRate}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${row.churnRate <= 15 ? 'bg-emerald-500' : row.churnRate <= 20 ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                          <span className="text-stone-500">Churn:</span>
                          <span className="font-medium text-stone-900">{row.churnRate}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${row.retentionRate >= 75 ? 'bg-emerald-500' : row.retentionRate >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                          <span className="text-stone-500">Retention:</span>
                          <span className="font-medium text-stone-900">{row.retentionRate}%</span>
                        </div>
                        <div>
                          <span className="text-stone-500">Notes:</span>
                          <span className="font-medium text-stone-900 ml-1">{row.outstandingNotes}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Desktop: Table view */
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-stone-200">
                        <th className="text-left py-5 px-4 text-sm font-bold text-stone-500 uppercase tracking-wider">
                          <button
                            className="flex items-center gap-2 hover:text-stone-900 transition-colors"
                            onClick={() => {
                              if (supervisorSortColumn === 'supervisor') {
                                setSupervisorSortDirection(supervisorSortDirection === 'asc' ? 'desc' : 'asc');
                              } else {
                                setSupervisorSortColumn('supervisor');
                                setSupervisorSortDirection('asc');
                              }
                            }}
                          >
                            Group by Supervisor
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                          </button>
                        </th>
                        {['Avg Weekly Sessions', 'Completed Sessions', 'Utilization (% of Goal)', 'Clients Seen', 'Cancel Rate', 'Churn Rate', 'Retention Rate', 'Outstanding Notes'].map((header, idx) => (
                          <th key={header} className="text-center py-5 px-4 text-sm font-bold text-stone-500 uppercase tracking-wider">
                            <button
                              className="flex items-center justify-center gap-1 hover:text-stone-900 transition-colors w-full"
                              onClick={() => {
                                const columnKey = ['avgWeeklySessions', 'completedSessions', 'utilizationPercent', 'clientsSeen', 'cancelRate', 'churnRate', 'retentionRate', 'outstandingNotes'][idx];
                                if (supervisorSortColumn === columnKey) {
                                  setSupervisorSortDirection(supervisorSortDirection === 'asc' ? 'desc' : 'asc');
                                } else {
                                  setSupervisorSortColumn(columnKey);
                                  setSupervisorSortDirection('desc');
                                }
                              }}
                            >
                              {header}
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                              </svg>
                            </button>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...SUPERVISOR_DATA].sort((a, b) => {
                        if (!supervisorSortColumn) return 0;
                        const aVal = a[supervisorSortColumn as keyof SupervisorData];
                        const bVal = b[supervisorSortColumn as keyof SupervisorData];
                        if (typeof aVal === 'string' && typeof bVal === 'string') {
                          return supervisorSortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
                        }
                        return supervisorSortDirection === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
                      }).map((row, idx) => (
                        <tr key={row.supervisor} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                          <td className="py-5 px-4 text-base font-semibold text-stone-900 uppercase tracking-wide">{row.supervisor}</td>
                          <td className="py-5 px-4 text-base text-stone-700 text-center font-medium">{row.avgWeeklySessions}</td>
                          <td className="py-5 px-4 text-base text-stone-700 text-center font-medium">{row.completedSessions.toLocaleString()}</td>
                          <td className="py-5 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <span className={`w-2.5 h-2.5 rounded-full ${row.utilizationPercent >= 90 ? 'bg-emerald-500' : row.utilizationPercent >= 80 ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                              <span className="text-base text-stone-700 font-medium">{row.utilizationPercent}%</span>
                            </div>
                          </td>
                          <td className="py-5 px-4 text-base text-stone-700 text-center font-medium">{row.clientsSeen}</td>
                          <td className="py-5 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <span className={`w-2.5 h-2.5 rounded-full ${row.cancelRate <= 20 ? 'bg-emerald-500' : row.cancelRate <= 25 ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                              <span className="text-base text-stone-700 font-medium">{row.cancelRate}%</span>
                            </div>
                          </td>
                          <td className="py-5 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <span className={`w-2.5 h-2.5 rounded-full ${row.churnRate <= 15 ? 'bg-emerald-500' : row.churnRate <= 20 ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                              <span className="text-base text-stone-700 font-medium">{row.churnRate}%</span>
                            </div>
                          </td>
                          <td className="py-5 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <span className={`w-2.5 h-2.5 rounded-full ${row.retentionRate >= 75 ? 'bg-emerald-500' : row.retentionRate >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                              <span className="text-base text-stone-700 font-medium">{row.retentionRate}%</span>
                            </div>
                          </td>
                          <td className="py-5 px-4 text-base text-stone-700 text-center font-medium">{row.outstandingNotes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Clinician Details Table - Expandable */}
            {showClinicianDetails && (
              <div
                className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 xl:p-8"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
                  boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)',
                  borderLeft: '4px solid #6366f1'
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-stone-800 text-2xl font-semibold" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                    Clinicians by {showClinicianDetails === 'location' ? 'Primary Location' : 'Supervisor'}
                  </h3>
                  <button
                    onClick={() => setShowClinicianDetails(null)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {isMobile ? (
                  /* Mobile: Card view */
                  <div className="space-y-3">
                    {[...CLINICIAN_COMPARISON_DATA]
                      .sort((a, b) => showClinicianDetails === 'location'
                        ? a.location.localeCompare(b.location)
                        : a.supervisor.localeCompare(b.supervisor)
                      )
                      .map((row) => (
                      <div key={row.clinician} className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm">
                        <div className="font-semibold text-stone-800 mb-1">{row.clinician}</div>
                        <div className="text-sm text-stone-500 mb-3">
                          {showClinicianDetails === 'location' ? row.location : row.supervisor}
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-stone-500">Avg Weekly:</span>
                            <span className="font-medium text-stone-900 ml-1">{row.avgWeeklySessions}</span>
                          </div>
                          <div>
                            <span className="text-stone-500">Completed:</span>
                            <span className="font-medium text-stone-900 ml-1">{row.completedSessions.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${row.utilizationPercent >= 90 ? 'bg-emerald-500' : row.utilizationPercent >= 80 ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                            <span className="text-stone-500">Utilization:</span>
                            <span className="font-medium text-stone-900">{row.utilizationPercent}%</span>
                          </div>
                          <div>
                            <span className="text-stone-500">Clients:</span>
                            <span className="font-medium text-stone-900 ml-1">{row.clientsSeen}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${row.cancelRate <= 20 ? 'bg-emerald-500' : row.cancelRate <= 25 ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                            <span className="text-stone-500">Cancel:</span>
                            <span className="font-medium text-stone-900">{row.cancelRate}%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${row.churnRate <= 15 ? 'bg-emerald-500' : row.churnRate <= 20 ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                            <span className="text-stone-500">Churn:</span>
                            <span className="font-medium text-stone-900">{row.churnRate}%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${row.retentionRate >= 75 ? 'bg-emerald-500' : row.retentionRate >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                            <span className="text-stone-500">Retention:</span>
                            <span className="font-medium text-stone-900">{row.retentionRate}%</span>
                          </div>
                          <div>
                            <span className="text-stone-500">Notes:</span>
                            <span className="font-medium text-stone-900 ml-1">{row.outstandingNotes}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Desktop: Table view */
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-stone-200">
                          <th className="text-left py-5 px-4 text-sm font-bold text-stone-500 uppercase tracking-wider">Clinician</th>
                          <th className="text-left py-5 px-4 text-sm font-bold text-stone-500 uppercase tracking-wider">{showClinicianDetails === 'location' ? 'Location' : 'Supervisor'}</th>
                          <th className="text-center py-5 px-4 text-sm font-bold text-stone-500 uppercase tracking-wider">Avg Weekly Sessions</th>
                          <th className="text-center py-5 px-4 text-sm font-bold text-stone-500 uppercase tracking-wider">Completed Sessions</th>
                          <th className="text-center py-5 px-4 text-sm font-bold text-stone-500 uppercase tracking-wider">Utilization</th>
                          <th className="text-center py-5 px-4 text-sm font-bold text-stone-500 uppercase tracking-wider">Clients Seen</th>
                          <th className="text-center py-5 px-4 text-sm font-bold text-stone-500 uppercase tracking-wider">Cancel Rate</th>
                          <th className="text-center py-5 px-4 text-sm font-bold text-stone-500 uppercase tracking-wider">Churn Rate</th>
                          <th className="text-center py-5 px-4 text-sm font-bold text-stone-500 uppercase tracking-wider">Retention Rate</th>
                          <th className="text-center py-5 px-4 text-sm font-bold text-stone-500 uppercase tracking-wider">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...CLINICIAN_COMPARISON_DATA]
                          .sort((a, b) => showClinicianDetails === 'location'
                            ? a.location.localeCompare(b.location)
                            : a.supervisor.localeCompare(b.supervisor)
                          )
                          .map((row) => (
                          <tr key={row.clinician} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                            <td className="py-5 px-4 text-base font-semibold text-stone-900">{row.clinician}</td>
                            <td className="py-5 px-4 text-base text-stone-600">{showClinicianDetails === 'location' ? row.location : row.supervisor}</td>
                            <td className="py-5 px-4 text-base text-stone-700 text-center font-medium">{row.avgWeeklySessions}</td>
                            <td className="py-5 px-4 text-base text-stone-700 text-center font-medium">{row.completedSessions.toLocaleString()}</td>
                            <td className="py-5 px-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${row.utilizationPercent >= 90 ? 'bg-emerald-500' : row.utilizationPercent >= 80 ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                                <span className="text-base text-stone-700 font-medium">{row.utilizationPercent}%</span>
                              </div>
                            </td>
                            <td className="py-5 px-4 text-base text-stone-700 text-center font-medium">{row.clientsSeen}</td>
                            <td className="py-5 px-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${row.cancelRate <= 20 ? 'bg-emerald-500' : row.cancelRate <= 25 ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                                <span className="text-base text-stone-700 font-medium">{row.cancelRate}%</span>
                              </div>
                            </td>
                            <td className="py-5 px-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${row.churnRate <= 15 ? 'bg-emerald-500' : row.churnRate <= 20 ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                                <span className="text-base text-stone-700 font-medium">{row.churnRate}%</span>
                              </div>
                            </td>
                            <td className="py-5 px-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${row.retentionRate >= 75 ? 'bg-emerald-500' : row.retentionRate >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                                <span className="text-base text-stone-700 font-medium">{row.retentionRate}%</span>
                              </div>
                            </td>
                            <td className="py-5 px-4 text-base text-stone-700 text-center font-medium">{row.outstandingNotes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global Fullscreen Modal for Expanded Charts (Financial & Sessions) */}
      {expandedCard && (expandedCard === 'revenue-performance' || expandedCard === 'revenue-distribution' || expandedCard === 'session-performance' || expandedCard === 'session-modality' || expandedCard === 'attendance-breakdown') && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-8"
          style={{
            backgroundColor: 'rgba(28, 25, 23, 0.6)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
          onClick={() => setExpandedCard(null)}
        >
          <div
            className="relative w-full max-w-[95vw] h-[90vh] rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #ffffff 0%, #fafaf9 100%)',
              boxShadow: '0 50px 100px -20px rgba(0, 0, 0, 0.25), 0 30px 60px -30px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.05)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setExpandedCard(null)}
              className="absolute top-6 right-6 z-10 p-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-800 transition-all duration-200 hover:scale-105 active:scale-95 group"
              title="Close"
            >
              <Minimize2 size={22} strokeWidth={2} className="group-hover:rotate-180 transition-transform duration-300" />
            </button>

            {/* Expanded Chart Content */}
            <div className="p-8 sm:p-12 h-full flex flex-col">
              {/* Revenue Performance Expanded */}
              {expandedCard === 'revenue-performance' && (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
                    <div>
                      <h3
                        className="text-stone-900 text-3xl sm:text-4xl xl:text-5xl font-bold mb-3 tracking-tight"
                        style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                      >
                        Revenue Performance
                      </h3>
                      <p className="text-stone-500 text-lg sm:text-xl xl:text-2xl">Monthly revenue breakdown</p>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-end">
                      {/* Hover tooltip for clinician breakdown */}
                      {hoveredClinicianBar && (
                        <div
                          className="px-4 py-2.5 rounded-xl shadow-xl pointer-events-none animate-pulse"
                          style={{
                            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: hoveredClinicianBar.color }} />
                            <span className="text-white font-semibold text-lg">{hoveredClinicianBar.clinician}</span>
                            <span className="text-indigo-300">•</span>
                            <span className="text-white font-bold text-lg">${(hoveredClinicianBar.value / 1000).toFixed(1)}k</span>
                            <span className="text-indigo-300">({hoveredClinicianBar.month})</span>
                          </div>
                        </div>
                      )}
                      {/* By Clinician Toggle */}
                      {!hoveredClinicianBar && (
                        <button
                          onClick={() => setShowClinicianBreakdown(!showClinicianBreakdown)}
                          className="relative flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300"
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
                            className={`w-5 h-5 transition-colors duration-300 ${showClinicianBreakdown ? 'text-indigo-300' : 'text-stone-500'}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className={`text-base font-semibold transition-colors duration-300 ${showClinicianBreakdown ? 'text-white' : 'text-stone-600'}`}>
                            By Clinician
                          </span>
                          <div
                            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${showClinicianBreakdown ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' : 'bg-stone-400'}`}
                          />
                        </button>
                      )}
                      {/* Goal Indicator */}
                      {!showClinicianBreakdown && !hoveredClinicianBar && (
                        <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-amber-500/10 border border-amber-300/50">
                          <div className="w-5 h-0.5 bg-amber-500" style={{ borderTop: '2px dashed #f59e0b' }} />
                          <span className="text-amber-700 text-base font-semibold">$150k Goal</span>
                        </div>
                      )}
                      {/* Revenue Report Button */}
                      <button
                        className="group relative px-7 py-3 rounded-full text-base font-bold tracking-wide transition-all duration-300 ease-out transform hover:scale-[1.03] active:scale-[0.98]"
                        style={{
                          background: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #1c1917 100%)',
                          boxShadow: '0 8px 20px -6px rgba(28, 25, 23, 0.4), 0 4px 8px -4px rgba(28, 25, 23, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
                          color: '#fafaf9',
                          letterSpacing: '0.02em'
                        }}
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          Revenue Report
                          <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.5} />
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Custom Bar Chart - Expanded */}
                  <div className="flex flex-1 min-h-0">
                    {/* Y-axis labels */}
                    <div className="flex flex-col justify-between text-base sm:text-lg text-stone-500 font-semibold pr-6 py-2">
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
                          <div key={i} className="border-t border-stone-200 w-full" />
                        ))}
                      </div>

                      {/* Goal line - horizontal (only in total view) */}
                      {!showClinicianBreakdown && (
                        <div
                          className="absolute left-0 right-0 border-t-[3px] border-dashed border-amber-400 z-10 pointer-events-none"
                          style={{ top: `${((160000 - 150000) / 160000) * 100}%` }}
                        />
                      )}

                      {/* Bars - Total View */}
                      {!showClinicianBreakdown && (
                        <div className="absolute inset-0 flex items-end justify-around px-4">
                          {REVENUE_DATA.map((item, idx) => {
                            const heightPercent = (item.value / 160000) * 100;
                            const isAboveGoal = item.value >= 150000;
                            const isCurrentMonth = idx === REVENUE_DATA.length - 1;

                            return (
                              <div
                                key={item.month}
                                className="group relative flex flex-col items-center justify-end h-full"
                                style={{ flex: '1', maxWidth: 'clamp(60px, 8vw, 120px)' }}
                              >
                                <div className="flex items-end w-full justify-center h-full">
                                  <div className="relative flex flex-col items-end justify-end h-full" style={{ width: '70%' }}>
                                    <span className={`text-lg sm:text-xl font-bold mb-2 ${isAboveGoal ? 'text-emerald-600' : 'text-blue-600'}`}>
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
                                          ? '0 6px 16px -2px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                                          : '0 6px 16px -2px rgba(37, 99, 235, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                                      }}
                                    >
                                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    {/* Month label */}
                                    <span className="text-stone-600 font-semibold text-base sm:text-lg mt-3">{item.month}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Bars - Clinician Breakdown (Stacked) */}
                      {showClinicianBreakdown && (
                        <div className="absolute inset-0 flex items-end justify-around gap-2 px-6">
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
                              const totalHeightPercent = (total / 160000) * 100;
                              const isCurrentMonth = idx === CLINICIAN_REVENUE_DATA.length - 1;

                              return (
                                <div
                                  key={item.month}
                                  className="group relative flex-1 flex flex-col items-center justify-end h-full"
                                  style={{ maxWidth: 'clamp(50px, 7vw, 90px)' }}
                                >
                                  {/* Total value label */}
                                  <div className="mb-2 z-20">
                                    <span className="text-lg sm:text-xl font-bold text-indigo-600">
                                      ${(total / 1000).toFixed(0)}k
                                    </span>
                                  </div>
                                  {/* Stacked Bar */}
                                  <div
                                    className="relative rounded-t-lg overflow-hidden transition-all duration-300 w-full"
                                    style={{
                                      height: `${totalHeightPercent}%`,
                                      maxWidth: '60px',
                                      boxShadow: isCurrentMonth ? '0 6px 16px -2px rgba(124, 58, 237, 0.35)' : '0 3px 10px -2px rgba(0,0,0,0.12)'
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
                                  {/* Month label */}
                                  <span className="text-stone-600 font-semibold text-base sm:text-lg mt-3">{item.month}</span>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Clinician Legend - shown when in clinician view */}
                  {showClinicianBreakdown && (
                    <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-stone-100">
                      {[
                        { name: 'Chen', color: '#7c3aed' },
                        { name: 'Rodriguez', color: '#0891b2' },
                        { name: 'Patel', color: '#d97706' },
                        { name: 'Kim', color: '#db2777' },
                        { name: 'Johnson', color: '#059669' }
                      ].map((c) => (
                        <div key={c.name} className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c.color }} />
                          <span className="text-stone-600 font-medium text-base">{c.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Revenue Distribution Expanded */}
              {expandedCard === 'revenue-distribution' && (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
                    <div>
                      <h3
                        className="text-stone-900 text-3xl sm:text-4xl xl:text-5xl font-bold mb-3 tracking-tight"
                        style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                      >
                        Revenue Distribution
                      </h3>
                      <p className="text-stone-500 text-lg sm:text-xl xl:text-2xl">Total across all {REVENUE_BREAKDOWN_DATA.length} selected month{REVENUE_BREAKDOWN_DATA.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="flex-1 min-h-0 flex items-center justify-center">
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

                      // SVG donut chart calculations using arc paths - larger size for expanded view
                      const size = 450;
                      const outerRadius = 200;
                      const innerRadius = 130;
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
                        <div className="flex items-center justify-center gap-12 lg:gap-20 w-full max-w-5xl px-8">
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
                                    className="cursor-pointer transition-all duration-300"
                                    style={{
                                      filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15))',
                                      transformOrigin: `${centerX}px ${centerY}px`,
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.transform = 'scale(1.05)';
                                      e.currentTarget.style.filter = 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.25))';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.transform = 'scale(1)';
                                      e.currentTarget.style.filter = 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15))';
                                    }}
                                  />
                                );
                              })}
                            </svg>

                            {/* Center content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                              <span className="text-stone-500 text-xl font-medium mb-2">Gross Revenue</span>
                              <span
                                className="text-stone-900 font-bold text-5xl lg:text-6xl"
                                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                              >
                                {gross >= 1000000 ? `$${(gross / 1000000).toFixed(2)}M` : `$${(gross / 1000).toFixed(0)}k`}
                              </span>
                            </div>
                          </div>

                          {/* Legend - Vertical stack on the right */}
                          <div className="flex flex-col gap-6 flex-1 max-w-[380px]">
                            {segments.map((segment) => {
                              const percent = ((segment.value / total) * 100).toFixed(1);
                              return (
                                <div
                                  key={segment.label}
                                  className="flex items-center gap-5 py-4 px-6 rounded-2xl transition-all duration-200 hover:bg-stone-50 hover:scale-[1.02] cursor-default"
                                >
                                  {/* Color indicator with glow */}
                                  <div
                                    className="w-8 h-8 rounded-full flex-shrink-0"
                                    style={{
                                      backgroundColor: segment.color,
                                      boxShadow: `0 0 16px ${segment.color}50`
                                    }}
                                  />

                                  {/* Label and stats */}
                                  <div className="flex-1 flex items-center justify-between gap-4">
                                    <span
                                      className="text-stone-700 font-semibold text-xl lg:text-2xl"
                                      style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                                    >
                                      {segment.label}
                                    </span>

                                    <div className="flex items-baseline gap-3">
                                      <span
                                        className="text-stone-900 font-bold text-2xl lg:text-3xl tabular-nums"
                                        style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                                      >
                                        {segment.value >= 1000000 ? `$${(segment.value / 1000000).toFixed(2)}M` : `$${(segment.value / 1000).toFixed(1)}k`}
                                      </span>
                                      <span className="text-stone-400 font-semibold text-lg tabular-nums">
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
                </>
              )}

              {/* Session Performance Expanded */}
              {expandedCard === 'session-performance' && (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
                    <div>
                      <h3
                        className="text-stone-900 text-3xl sm:text-4xl xl:text-5xl font-bold mb-3 tracking-tight"
                        style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                      >
                        Completed Sessions
                      </h3>
                      <p className="text-stone-500 text-lg sm:text-xl xl:text-2xl">Monthly performance</p>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-end">
                      {/* Hover tooltip for clinician breakdown */}
                      {hoveredSessionsClinicianBar && (
                        <div
                          className="px-4 py-2.5 rounded-xl shadow-xl pointer-events-none animate-pulse"
                          style={{
                            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: hoveredSessionsClinicianBar.color }} />
                            <span className="text-white font-semibold text-lg">{hoveredSessionsClinicianBar.clinician}</span>
                            <span className="text-indigo-300">•</span>
                            <span className="text-white font-bold text-lg">{hoveredSessionsClinicianBar.value}</span>
                            <span className="text-indigo-300">({hoveredSessionsClinicianBar.month})</span>
                          </div>
                        </div>
                      )}
                      {/* By Clinician Toggle */}
                      {!hoveredSessionsClinicianBar && (
                        <button
                          onClick={() => setShowSessionsClinicianBreakdown(!showSessionsClinicianBreakdown)}
                          className="relative flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300"
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
                            className={`w-5 h-5 transition-colors duration-300 ${showSessionsClinicianBreakdown ? 'text-indigo-300' : 'text-stone-500'}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className={`text-base font-semibold transition-colors duration-300 ${showSessionsClinicianBreakdown ? 'text-white' : 'text-stone-600'}`}>
                            By Clinician
                          </span>
                          <div
                            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${showSessionsClinicianBreakdown ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' : 'bg-stone-400'}`}
                          />
                        </button>
                      )}
                      {/* Goal Indicator */}
                      {!showSessionsClinicianBreakdown && !hoveredSessionsClinicianBar && (
                        <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-amber-500/10 border border-amber-300/50">
                          <div className="w-5 h-0.5 bg-amber-500" style={{ borderTop: '2px dashed #f59e0b' }} />
                          <span className="text-amber-700 text-base font-semibold">700 Goal</span>
                        </div>
                      )}
                      {/* Sessions Report Button */}
                      <button
                        className="group relative px-7 py-3 rounded-full text-base font-bold tracking-wide transition-all duration-300 ease-out transform hover:scale-[1.03] active:scale-[0.98]"
                        style={{
                          background: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #1c1917 100%)',
                          boxShadow: '0 8px 20px -6px rgba(28, 25, 23, 0.4), 0 4px 8px -4px rgba(28, 25, 23, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
                          color: '#fafaf9',
                          letterSpacing: '0.02em'
                        }}
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          Sessions Report
                          <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.5} />
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Custom Bar Chart - Expanded */}
                  <div className="flex flex-1 min-h-0">
                    {/* Y-axis labels */}
                    <div className="flex flex-col justify-between text-base sm:text-lg text-stone-500 font-semibold pr-6 py-2">
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
                          <div key={i} className="border-t border-stone-200 w-full" />
                        ))}
                      </div>

                      {/* Goal line - horizontal (only in total view) */}
                      {!showSessionsClinicianBreakdown && (
                        <div
                          className="absolute left-0 right-0 border-t-[3px] border-dashed border-amber-400 z-10 pointer-events-none"
                          style={{ top: `${((800 - 700) / 800) * 100}%` }}
                        />
                      )}

                      {/* Bars - Total View */}
                      {!showSessionsClinicianBreakdown && (
                        <div className="absolute inset-0 flex items-end justify-around px-4">
                          {SESSIONS_DATA.map((item, idx) => {
                            const heightPercent = (item.completed / 800) * 100;
                            const isAboveGoal = item.completed >= 700;
                            const isCurrentMonth = idx === SESSIONS_DATA.length - 1;

                            return (
                              <div
                                key={item.month}
                                className="group relative flex flex-col items-center justify-end h-full"
                                style={{ flex: '1', maxWidth: 'clamp(60px, 8vw, 120px)' }}
                              >
                                <div className="flex items-end w-full justify-center h-full">
                                  <div className="relative flex flex-col items-end justify-end h-full" style={{ width: '70%' }}>
                                    <span className={`text-lg sm:text-xl font-bold mb-2 ${isAboveGoal ? 'text-emerald-600' : 'text-blue-600'}`}>
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
                                        height: `${heightPercent}%`,
                                        background: isAboveGoal
                                          ? 'linear-gradient(180deg, #34d399 0%, #059669 100%)'
                                          : 'linear-gradient(180deg, #60a5fa 0%, #2563eb 100%)',
                                        boxShadow: isAboveGoal
                                          ? '0 6px 16px -2px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                                          : '0 6px 16px -2px rgba(37, 99, 235, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                                      }}
                                    >
                                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    {/* Month label */}
                                    <span className="text-stone-600 font-semibold text-base sm:text-lg mt-3">{item.month}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Bars - Clinician Breakdown (Stacked) */}
                      {showSessionsClinicianBreakdown && (
                        <div className="absolute inset-0 flex items-end justify-around gap-2 px-6">
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
                                  style={{ maxWidth: 'clamp(50px, 7vw, 90px)' }}
                                >
                                  {/* Total value label */}
                                  <div className="mb-2 z-20">
                                    <span className="text-lg sm:text-xl font-bold text-indigo-600">
                                      {total}
                                    </span>
                                  </div>
                                  {/* Stacked Bar */}
                                  <div
                                    className="relative rounded-t-lg overflow-hidden transition-all duration-300 w-full"
                                    style={{
                                      height: `${totalHeightPercent}%`,
                                      maxWidth: '60px',
                                      boxShadow: isCurrentMonth ? '0 6px 16px -2px rgba(124, 58, 237, 0.35)' : '0 3px 10px -2px rgba(0,0,0,0.12)'
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
                                  {/* Month label */}
                                  <span className="text-stone-600 font-semibold text-base sm:text-lg mt-3">{item.month}</span>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Clinician Legend - shown when in clinician view */}
                  {showSessionsClinicianBreakdown && (
                    <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-stone-100">
                      {[
                        { name: 'Chen', color: '#7c3aed' },
                        { name: 'Rodriguez', color: '#0891b2' },
                        { name: 'Patel', color: '#d97706' },
                        { name: 'Kim', color: '#db2777' },
                        { name: 'Johnson', color: '#059669' }
                      ].map((c) => (
                        <div key={c.name} className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c.color }} />
                          <span className="text-stone-600 font-medium text-base">{c.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Session Modality Expanded */}
              {expandedCard === 'session-modality' && (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
                    <div>
                      <h3
                        className="text-stone-900 text-3xl sm:text-4xl xl:text-5xl font-bold mb-3 tracking-tight"
                        style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                      >
                        Session Modality
                      </h3>
                      <p className="text-stone-500 text-lg sm:text-xl xl:text-2xl">Telehealth vs In-Person breakdown</p>
                    </div>
                  </div>
                  <div className="flex-1 min-h-0 flex items-center justify-center">
                    {(() => {
                      const totalTelehealth = SESSIONS_DATA.reduce((sum, item) => sum + item.telehealth, 0);
                      const totalInPerson = SESSIONS_DATA.reduce((sum, item) => sum + item.inPerson, 0);
                      const total = totalTelehealth + totalInPerson;
                      const telehealthPercent = ((totalTelehealth / total) * 100).toFixed(1);
                      const inPersonPercent = ((totalInPerson / total) * 100).toFixed(1);

                      return (
                        <div className="w-full max-w-5xl px-4">
                          {/* Large Split Bar with Icons */}
                          <div className="relative h-40 rounded-3xl overflow-hidden flex mb-12" style={{ boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.1)' }}>
                            {/* Telehealth segment */}
                            <div
                              className="relative flex items-center justify-center transition-all duration-500 group cursor-default"
                              style={{ width: `${telehealthPercent}%`, background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)' }}
                            >
                              {/* Pattern overlay */}
                              <div
                                className="absolute inset-0 opacity-10"
                                style={{
                                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
                                }}
                              />
                              {/* Icon and label */}
                              <div className="relative z-10 flex items-center gap-4">
                                <svg className="w-10 h-10 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <div className="text-white text-center">
                                  <div className="text-5xl font-bold tracking-tight" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>{telehealthPercent}%</div>
                                  <div className="text-xl opacity-90 mt-1 font-medium">Telehealth</div>
                                </div>
                              </div>
                              {/* Shine effect */}
                              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent h-1/2" />
                            </div>

                            {/* Divider line */}
                            <div className="w-1 bg-white/30 relative z-20" />

                            {/* In-Person segment */}
                            <div
                              className="relative flex items-center justify-center transition-all duration-500 group cursor-default"
                              style={{ width: `${inPersonPercent}%`, background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' }}
                            >
                              {/* Pattern overlay */}
                              <div
                                className="absolute inset-0 opacity-10"
                                style={{
                                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
                                }}
                              />
                              {/* Icon and label */}
                              <div className="relative z-10 flex items-center gap-4">
                                <svg className="w-10 h-10 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <div className="text-white text-center">
                                  <div className="text-5xl font-bold tracking-tight" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>{inPersonPercent}%</div>
                                  <div className="text-xl opacity-90 mt-1 font-medium">In-Person</div>
                                </div>
                              </div>
                              {/* Shine effect */}
                              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent h-1/2" />
                            </div>
                          </div>

                          {/* Labels below */}
                          <div className="flex justify-between mb-10 px-4">
                            <div className="flex items-center gap-4">
                              <div className="w-5 h-5 rounded-full" style={{ background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)', boxShadow: '0 3px 6px rgba(8, 145, 178, 0.35)' }} />
                              <span className="text-stone-700 font-semibold text-xl">Telehealth</span>
                              <span className="text-stone-400 text-lg">({totalTelehealth.toLocaleString()} sessions)</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="w-5 h-5 rounded-full" style={{ background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', boxShadow: '0 3px 6px rgba(217, 119, 6, 0.35)' }} />
                              <span className="text-stone-700 font-semibold text-xl">In-Person</span>
                              <span className="text-stone-400 text-lg">({totalInPerson.toLocaleString()} sessions)</span>
                            </div>
                          </div>

                          {/* Stats Cards */}
                          <div className="grid grid-cols-2 gap-8">
                            <div className="p-10 rounded-3xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300" style={{ background: 'linear-gradient(135deg, rgba(8, 145, 178, 0.1) 0%, rgba(14, 116, 144, 0.05) 100%)' }}>
                              <div className="absolute top-6 right-6">
                                <svg className="w-12 h-12 text-cyan-500/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div className="text-cyan-600 text-6xl font-bold mb-3" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                                {totalTelehealth.toLocaleString()}
                              </div>
                              <div className="text-stone-600 text-2xl font-medium">Telehealth Sessions</div>
                              <div className="text-stone-400 text-lg mt-2">across {SESSIONS_DATA.length} months</div>
                            </div>
                            <div className="p-10 rounded-3xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300" style={{ background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.1) 0%, rgba(180, 83, 9, 0.05) 100%)' }}>
                              <div className="absolute top-6 right-6">
                                <svg className="w-12 h-12 text-amber-500/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                              </div>
                              <div className="text-amber-600 text-6xl font-bold mb-3" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                                {totalInPerson.toLocaleString()}
                              </div>
                              <div className="text-stone-600 text-2xl font-medium">In-Person Sessions</div>
                              <div className="text-stone-400 text-lg mt-2">across {SESSIONS_DATA.length} months</div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </>
              )}

              {/* Attendance Breakdown Expanded */}
              {expandedCard === 'attendance-breakdown' && (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
                    <div>
                      <h3
                        className="text-stone-900 text-3xl sm:text-4xl xl:text-5xl font-bold mb-3 tracking-tight"
                        style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                      >
                        Attendance Breakdown
                      </h3>
                      <p className="text-stone-500 text-lg sm:text-xl xl:text-2xl">Session outcomes across {SESSIONS_DATA.length} months</p>
                    </div>
                  </div>
                  <div className="flex-1 min-h-0 flex items-center justify-center">
                    {(() => {
                      const segments = [
                        { label: 'Attended', value: SESSIONS_DATA.reduce((sum, item) => sum + item.show, 0), color: '#10b981' },
                        { label: 'Client Cancelled', value: SESSIONS_DATA.reduce((sum, item) => sum + item.cancelled, 0), color: '#ef4444' },
                        { label: 'Clinician Cancelled', value: SESSIONS_DATA.reduce((sum, item) => sum + item.clinicianCancelled, 0), color: '#3b82f6' },
                        { label: 'Late Cancelled', value: SESSIONS_DATA.reduce((sum, item) => sum + item.lateCancelled, 0), color: '#f59e0b' },
                        { label: 'No Show', value: SESSIONS_DATA.reduce((sum, item) => sum + item.noShow, 0), color: '#6b7280' }
                      ];

                      const total = segments.reduce((sum, s) => sum + s.value, 0);

                      // SVG donut chart calculations - larger size for expanded view
                      const size = 450;
                      const outerRadius = 200;
                      const innerRadius = 130;
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
                        <div className="flex items-center justify-center gap-12 lg:gap-20 w-full max-w-5xl px-8">
                          {/* SVG Donut */}
                          <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
                            <svg width={size} height={size} className="overflow-visible">
                              {segments.map((segment, idx) => {
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
                                    className="cursor-pointer transition-all duration-300"
                                    style={{
                                      filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15))',
                                      transformOrigin: `${centerX}px ${centerY}px`,
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.transform = 'scale(1.05)';
                                      e.currentTarget.style.filter = 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.25))';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.transform = 'scale(1)';
                                      e.currentTarget.style.filter = 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15))';
                                    }}
                                  />
                                );
                              })}
                            </svg>

                            {/* Center content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                              <span className="text-stone-500 text-xl font-medium mb-2">Show Rate</span>
                              <span
                                className="text-emerald-600 font-bold text-5xl lg:text-6xl"
                                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                              >
                                {((segments[0].value / total) * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>

                          {/* Legend - Vertical stack on the right */}
                          <div className="flex flex-col gap-6 flex-1 max-w-[380px]">
                            {segments.map((segment) => {
                              const percent = ((segment.value / total) * 100).toFixed(1);
                              return (
                                <div
                                  key={segment.label}
                                  className="flex items-center gap-5 py-4 px-6 rounded-2xl transition-all duration-200 hover:bg-stone-50 hover:scale-[1.02] cursor-default"
                                >
                                  {/* Color indicator with glow */}
                                  <div
                                    className="w-8 h-8 rounded-full flex-shrink-0"
                                    style={{
                                      backgroundColor: segment.color,
                                      boxShadow: `0 0 16px ${segment.color}50`
                                    }}
                                  />

                                  {/* Label and stats */}
                                  <div className="flex-1 flex items-center justify-between gap-4">
                                    <span
                                      className="text-stone-700 font-semibold text-xl lg:text-2xl"
                                      style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                                    >
                                      {segment.label}
                                    </span>

                                    <div className="flex items-baseline gap-3">
                                      <span
                                        className="text-stone-900 font-bold text-2xl lg:text-3xl tabular-nums"
                                        style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                                      >
                                        {segment.value.toLocaleString()}
                                      </span>
                                      <span className="text-stone-400 font-semibold text-lg tabular-nums">
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
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};