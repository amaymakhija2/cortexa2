import React, { useState, useMemo } from 'react';
import { MetricChart } from './MetricChart';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, LabelList, Legend, CartesianGrid, ReferenceLine, ComposedChart } from 'recharts';
import { Info, X, ArrowRight, Calendar, ChevronLeft, ChevronRight, Maximize2, Minimize2, Users } from 'lucide-react';
import { useIsMobile } from '../hooks/useIsMobile';
import { ToggleButton, GoalIndicator, ActionButton } from './design-system';
import { FinancialAnalysisTab, SessionsAnalysisTab, CapacityClientTab, RetentionTab, InsuranceTab, AdminTab } from './analysis';

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

// Retention cohort options - for cohort-first analysis
// Summary data: clientsAcquired, clientsChurned, activeClients, avgSessionsPerClient (ALL clients)
const RETENTION_COHORTS = [
  {
    id: 'all-time',
    label: 'All Time',
    sublabel: 'Since practice opened',
    clientCount: 847,
    maturity: 'mature' as const,
    recommended: true,
    summary: { clientsAcquired: 847, clientsChurned: 691, activeClients: 156, avgSessionsPerClient: 14.3 }
  },
  {
    id: 'ytd-2024',
    label: '2024 YTD',
    sublabel: 'Jan - Nov 2024',
    clientCount: 312,
    maturity: 'mature' as const,
    summary: { clientsAcquired: 312, clientsChurned: 198, activeClients: 114, avgSessionsPerClient: 11.8 }
  },
  {
    id: 'q3-2024',
    label: 'Q3 2024',
    sublabel: 'Jul - Sep',
    clientCount: 142,
    maturity: 'mature' as const,
    summary: { clientsAcquired: 142, clientsChurned: 67, activeClients: 75, avgSessionsPerClient: 9.2 }
  },
  {
    id: 'q4-2024',
    label: 'Q4 2024',
    sublabel: 'Oct - Dec',
    clientCount: 89,
    maturity: 'partial' as const,
    summary: { clientsAcquired: 89, clientsChurned: 18, activeClients: 71, avgSessionsPerClient: 5.4 }
  },
  {
    id: 'nov-2024',
    label: 'Nov 2024',
    sublabel: '23 clients',
    clientCount: 23,
    maturity: 'immature' as const,
    availableDate: 'Jan 15, 2025',
    summary: { clientsAcquired: 23, clientsChurned: 2, activeClients: 21, avgSessionsPerClient: 2.8 }
  },
];

// Retention funnel data - client journey visualization
const RETENTION_FUNNEL_DATA = {
  sessionsFunnel: [
    { label: 'Started', count: 847, percentage: 100 },
    { label: 'Session 2', count: 652, percentage: 77 },
    { label: 'Session 5', count: 644, percentage: 76 },
    { label: 'Session 12', count: 440, percentage: 52 },
    { label: 'Session 24', count: 263, percentage: 31 },
  ],
  timeFunnel: [
    { label: 'Started', count: 847, percentage: 100 },
    { label: '1 Month', count: 695, percentage: 82 },
    { label: '3 Months', count: 525, percentage: 62 },
    { label: '6 Months', count: 347, percentage: 41 },
  ],
};

// At-risk clients - no upcoming appointment scheduled
const AT_RISK_CLIENTS = [
  { id: 'c1', name: 'Sarah Mitchell', daysSinceLastSession: 28, totalSessions: 12, clinician: 'Dr. Chen', riskLevel: 'high' as const },
  { id: 'c2', name: 'James Rodriguez', daysSinceLastSession: 24, totalSessions: 8, clinician: 'Dr. Patel', riskLevel: 'high' as const },
  { id: 'c3', name: 'Emily Watson', daysSinceLastSession: 21, totalSessions: 15, clinician: 'Dr. Kim', riskLevel: 'high' as const },
  { id: 'c4', name: 'Michael Chen', daysSinceLastSession: 18, totalSessions: 6, clinician: 'Dr. Rodriguez', riskLevel: 'medium' as const },
  { id: 'c5', name: 'Lisa Thompson', daysSinceLastSession: 16, totalSessions: 4, clinician: 'Dr. Johnson', riskLevel: 'medium' as const },
  { id: 'c6', name: 'David Park', daysSinceLastSession: 15, totalSessions: 22, clinician: 'Dr. Chen', riskLevel: 'medium' as const },
  { id: 'c7', name: 'Jennifer Lee', daysSinceLastSession: 12, totalSessions: 9, clinician: 'Dr. Patel', riskLevel: 'low' as const },
  { id: 'c8', name: 'Robert Garcia', daysSinceLastSession: 10, totalSessions: 3, clinician: 'Dr. Kim', riskLevel: 'low' as const },
];

// Clients approaching session 5 milestone
const APPROACHING_SESSION_5 = [
  { id: 'a1', name: 'Amanda Foster', currentSessions: 4, targetMilestone: 5, sessionsToGo: 1, nextAppointment: 'Dec 3', clinician: 'Dr. Chen' },
  { id: 'a2', name: 'Brian Martinez', currentSessions: 4, targetMilestone: 5, sessionsToGo: 1, nextAppointment: 'Dec 5', clinician: 'Dr. Patel' },
  { id: 'a3', name: 'Christina Liu', currentSessions: 4, targetMilestone: 5, sessionsToGo: 1, nextAppointment: 'Dec 4', clinician: 'Dr. Kim' },
  { id: 'a4', name: 'Daniel Williams', currentSessions: 3, targetMilestone: 5, sessionsToGo: 2, nextAppointment: 'Dec 6', clinician: 'Dr. Rodriguez' },
  { id: 'a5', name: 'Elena Petrova', currentSessions: 3, targetMilestone: 5, sessionsToGo: 2, nextAppointment: 'Dec 7', clinician: 'Dr. Johnson' },
  { id: 'a6', name: 'Frank Nakamura', currentSessions: 2, targetMilestone: 5, sessionsToGo: 3, nextAppointment: 'Dec 8', clinician: 'Dr. Chen' },
  { id: 'a7', name: 'Grace O\'Brien', currentSessions: 2, targetMilestone: 5, sessionsToGo: 3, clinician: 'Dr. Patel' },
];

// Rebook rate trend data
const REBOOK_RATE_DATA = [
  { month: 'Jan', rate: 90.1 },
  { month: 'Feb', rate: 90.3 },
  { month: 'Mar', rate: 90.2 },
  { month: 'Apr', rate: 90.5 },
  { month: 'May', rate: 90.4 },
  { month: 'Jun', rate: 90.7 },
  { month: 'Jul', rate: 90.6 },
  { month: 'Aug', rate: 90.9 },
  { month: 'Sep', rate: 90.5 },
  { month: 'Oct', rate: 90.5 },
  { month: 'Nov', rate: 90.8 },
  { month: 'Dec', rate: 91.0 },
];

// Current health data aggregation
const CURRENT_HEALTH_DATA = {
  atRiskClients: AT_RISK_CLIENTS,
  approachingSession5: APPROACHING_SESSION_5,
  rebookRateData: REBOOK_RATE_DATA,
  avgRebookRate: 90.5,
  totalActiveClients: 156,
};

// First Session Drop-off data (Session 1 → Session 2 transition)
const FIRST_SESSION_DROPOFF_DATA = {
  session1Count: 847,
  session2Count: 652, // 77% return rate
  benchmarkPercentage: 82, // Industry average
};

// Frequency and Retention correlation data
const FREQUENCY_RETENTION_DATA = [
  { frequency: 'weekly' as const, label: 'Weekly', avgSessions: 14.2, clientCount: 198, avgTenureMonths: 5.2 },
  { frequency: 'biweekly' as const, label: 'Bi-weekly', avgSessions: 6.1, clientCount: 156, avgTenureMonths: 3.8 },
  { frequency: 'monthly' as const, label: 'Monthly', avgSessions: 3.4, clientCount: 32, avgTenureMonths: 2.1 },
];

// Retention benchmarks for comparison
const RETENTION_BENCHMARKS = {
  avgChurnRate: 24, // Industry average churn rate
  avgClientTenure: 11.5, // Industry average sessions per client
  avgSession5Retention: 80, // Industry average % reaching session 5
  frequencyMultiplierRange: '1.8-2.5x', // Typical range for weekly vs bi-weekly
};

// Churn distribution by gender (for comparison with client distribution)
// Client distribution: Male 33%, Female 62%, Other 5%
// Churn shows Males slightly over-represented in churn
const CHURN_BY_GENDER_DATA = {
  male: 48,    // 38% of churn vs 33% of clients (+5%)
  female: 72,  // 57% of churn vs 62% of clients (-5%)
  other: 6,    // 5% of churn vs 5% of clients (=)
  total: 126
};

// Churn distribution by frequency (for comparison with client distribution)
// Client distribution: Weekly 51%, Bi-weekly 40%, Monthly 8%
// Churn shows Monthly clients massively over-represented
const CHURN_BY_FREQUENCY_DATA = {
  weekly: 25,    // 20% of churn vs 51% of clients (-31%) - weekly clients stay!
  biweekly: 57,  // 45% of churn vs 40% of clients (+5%)
  monthly: 44,   // 35% of churn vs 8% of clients (+27%) - monthly clients leave!
  total: 126
};

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

  // Render tabs with new design system
  const isFinancialTab = activeTab === 'financial';
  const isSessionsTab = activeTab === 'sessions';
  const isCapacityClientTab = activeTab === 'capacity-client';
  const isRetentionTab = activeTab === 'retention';
  const isInsuranceTab = activeTab === 'insurance';
  const isAdminTab = activeTab === 'admin';

  // All tabs now use the design system
  const usesDesignSystem = isFinancialTab || isSessionsTab || isCapacityClientTab || isRetentionTab || isInsuranceTab || isAdminTab;

  return (
    <div
      className={`flex-1 overflow-y-auto h-[calc(100vh-80px)] ${usesDesignSystem ? 'bg-gradient-to-b from-stone-100 to-stone-50' : 'p-8 pt-2'}`}
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
        <RetentionTab
          cohorts={RETENTION_COHORTS}
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId as TabType)}
          churnByClinicianData={CHURN_BY_CLINICIAN_DATA}
          churnTimingData={CHURN_TIMING_DATA}
          retentionFunnelData={RETENTION_FUNNEL_DATA}
          currentHealthData={CURRENT_HEALTH_DATA}
          firstSessionDropoffData={FIRST_SESSION_DROPOFF_DATA}
          benchmarks={RETENTION_BENCHMARKS}
          clientGenderData={CLIENT_GENDER_DATA}
          churnByGenderData={CHURN_BY_GENDER_DATA}
          clientFrequencyData={SESSION_FREQUENCY_DATA}
          churnByFrequencyData={CHURN_BY_FREQUENCY_DATA}
        />
      )}

      {isInsuranceTab && (
        <InsuranceTab
          timePeriod={timePeriod}
          onTimePeriodChange={setTimePeriod}
          timePeriods={timePeriods}
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId as TabType)}
          getDateRangeLabel={getDateRangeLabel}
        />
      )}

      {isAdminTab && (
        <AdminTab
          timePeriod={timePeriod}
          onTimePeriodChange={setTimePeriod}
          timePeriods={timePeriods}
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId as TabType)}
          getDateRangeLabel={getDateRangeLabel}
        />
      )}
    </div>
  );
};