import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronDown, Check, Calendar, X, TrendingUp, TrendingDown, Users, DollarSign, Activity, FileText, ArrowRight, ArrowLeft, Settings, Pencil, Sparkles, AlertTriangle, Target, Zap, Calculator, Search } from 'lucide-react';
import * as chrono from 'chrono-node';
import { formatFullName } from '../types/consultations';
import {
  SectionHeader,
  SectionContainer,
  Grid,
  ChartCard,
  BarChart,
  LineChart,
  GoalIndicator,
  ActionButton,
  MetricCard,
  AnimatedGrid,
  DonutChartCard,
  DivergingBarChart,
  GroupedBarChart,
  ToggleButton,
  ClientRosterCard,
  DataTableCard,
  StackedBarCard,
  ExpandedChartModal,
  ExpandedChartView,
  TimeSelector,
  PageHeader,
} from './design-system';
import { isYearOnly, isMonthYear, isAggregate } from './design-system';
import type { ClientData, HoverInfo, SegmentConfig, TimeSelectorValue, ClientBreakdownRow, DataTableColumn } from './design-system';

// =============================================================================
// CLINICIAN DETAILS TAB
// =============================================================================
// Deep-dive analytics for individual clinician performance.
// Features an innovative "Clinician Spotlight" header design.
//
// NOTE: Clinician base info (name, initials, color, title, role) comes from
// the master list at data/clinicians.ts. Extended mock data below adds
// component-specific metrics for demo purposes.
// =============================================================================

import { CLINICIANS as MASTER_CLINICIANS } from '../data/clinicians';
import {
  useSettings,
  getClinicianGoalsForDate,
  getGoalTypePeriods,
  generateGoalPeriodId,
  GoalType,
  SingleGoalPeriod,
  ClinicianGoalHistory,
} from '../context/SettingsContext';

// Health status type
type HealthStatus = 'healthy' | 'attention' | 'critical';

// Extended clinician data for this component (adds metrics on top of master list)
const MOCK_CLINICIANS = MASTER_CLINICIANS.map((clinician, index) => {
  // Mock metrics data for each clinician
  const mockMetricsData = [
    { // Sarah Chen - Clinical Director
      tenure: '4 years',
      supervisor: null,
      healthStatus: 'healthy' as HealthStatus,
      metrics: { revenue: 142500, revenueVsGoal: 112, sessions: 487, sessionsVsGoal: 108, rebookRate: 89, notesOverdue: 2 },
      insight: 'Exceptional quarter. Revenue up 12% with highest client retention on team.',
    },
    { // Maria Rodriguez - Senior Therapist
      tenure: '3 years',
      supervisor: 'Sarah Chen',
      healthStatus: 'healthy' as HealthStatus,
      metrics: { revenue: 128000, revenueVsGoal: 104, sessions: 412, sessionsVsGoal: 98, rebookRate: 85, notesOverdue: 4 },
      insight: 'Strong performer. Slight dip in session volume but quality metrics remain high.',
    },
    { // Priya Patel - Therapist
      tenure: '2 years',
      supervisor: 'Sarah Chen',
      healthStatus: 'attention' as HealthStatus,
      metrics: { revenue: 98000, revenueVsGoal: 89, sessions: 342, sessionsVsGoal: 82, rebookRate: 71, notesOverdue: 12 },
      insight: 'Rebook rate dropped 8% this month. 12 notes overdue—schedule a check-in.',
    },
    { // James Kim - Associate Therapist
      tenure: '1 year',
      supervisor: 'Maria Rodriguez',
      healthStatus: 'healthy' as HealthStatus,
      metrics: { revenue: 86000, revenueVsGoal: 102, sessions: 298, sessionsVsGoal: 106, rebookRate: 82, notesOverdue: 3 },
      insight: 'Ramping up nicely. Exceeding goals for tenure level. Strong client feedback.',
    },
    { // Michael Johnson - Associate Therapist
      tenure: '8 months',
      supervisor: 'Priya Patel',
      healthStatus: 'critical' as HealthStatus,
      metrics: { revenue: 52000, revenueVsGoal: 68, sessions: 186, sessionsVsGoal: 62, rebookRate: 64, notesOverdue: 18 },
      insight: 'Multiple red flags. 32% below revenue goal, 18 notes overdue. Urgent attention needed.',
    },
  ];

  const mockData = mockMetricsData[index] || mockMetricsData[0];

  return {
    id: parseInt(clinician.id),
    name: clinician.name,
    initials: clinician.initials,
    color: clinician.color,
    title: clinician.title,
    role: clinician.role,
    takeRate: clinician.takeRate,
    ...mockData,
  };
});

// Mock monthly revenue data for each clinician (12 months)
const CLINICIAN_FINANCIAL_DATA: Record<number, {
  monthlyRevenue: { month: string; value: number }[];
  revenueGoal: number;
  avgRevenuePerSession: number;
  teamAvgPerSession: number;
  practiceRevenueShare: number;
  totalSessions: number;
}> = {
  1: { // Sarah Chen - Clinical Director (high performer)
    monthlyRevenue: [
      { month: 'Jan', value: 11200 },
      { month: 'Feb', value: 12400 },
      { month: 'Mar', value: 11800 },
      { month: 'Apr', value: 13200 },
      { month: 'May', value: 12600 },
      { month: 'Jun', value: 11900 },
      { month: 'Jul', value: 10800 },
      { month: 'Aug', value: 12100 },
      { month: 'Sep', value: 13500 },
      { month: 'Oct', value: 12800 },
      { month: 'Nov', value: 11400 },
      { month: 'Dec', value: 8800 },
    ],
    revenueGoal: 11000,
    avgRevenuePerSession: 185,
    teamAvgPerSession: 168,
    practiceRevenueShare: 28,
    totalSessions: 487,
  },
  2: { // Maria Rodriguez - Senior Therapist
    monthlyRevenue: [
      { month: 'Jan', value: 10200 },
      { month: 'Feb', value: 11100 },
      { month: 'Mar', value: 10600 },
      { month: 'Apr', value: 11800 },
      { month: 'May', value: 10900 },
      { month: 'Jun', value: 10400 },
      { month: 'Jul', value: 9800 },
      { month: 'Aug', value: 10700 },
      { month: 'Sep', value: 11200 },
      { month: 'Oct', value: 10800 },
      { month: 'Nov', value: 10100 },
      { month: 'Dec', value: 10400 },
    ],
    revenueGoal: 10500,
    avgRevenuePerSession: 172,
    teamAvgPerSession: 168,
    practiceRevenueShare: 25,
    totalSessions: 412,
  },
  3: { // Priya Patel - Therapist (needs attention)
    monthlyRevenue: [
      { month: 'Jan', value: 8800 },
      { month: 'Feb', value: 9200 },
      { month: 'Mar', value: 8600 },
      { month: 'Apr', value: 9100 },
      { month: 'May', value: 8400 },
      { month: 'Jun', value: 7800 },
      { month: 'Jul', value: 7200 },
      { month: 'Aug', value: 8100 },
      { month: 'Sep', value: 7600 },
      { month: 'Oct', value: 7900 },
      { month: 'Nov', value: 7400 },
      { month: 'Dec', value: 7900 },
    ],
    revenueGoal: 9500,
    avgRevenuePerSession: 158,
    teamAvgPerSession: 168,
    practiceRevenueShare: 19,
    totalSessions: 342,
  },
  4: { // James Kim - Associate Therapist (ramping up)
    monthlyRevenue: [
      { month: 'Jan', value: 6200 },
      { month: 'Feb', value: 6800 },
      { month: 'Mar', value: 7100 },
      { month: 'Apr', value: 7400 },
      { month: 'May', value: 7800 },
      { month: 'Jun', value: 7200 },
      { month: 'Jul', value: 6900 },
      { month: 'Aug', value: 7600 },
      { month: 'Sep', value: 8100 },
      { month: 'Oct', value: 7500 },
      { month: 'Nov', value: 6800 },
      { month: 'Dec', value: 6600 },
    ],
    revenueGoal: 7000,
    avgRevenuePerSession: 165,
    teamAvgPerSession: 168,
    practiceRevenueShare: 17,
    totalSessions: 298,
  },
  5: { // Michael Johnson - Associate Therapist (critical)
    monthlyRevenue: [
      { month: 'Jan', value: 5200 },
      { month: 'Feb', value: 5600 },
      { month: 'Mar', value: 5100 },
      { month: 'Apr', value: 4800 },
      { month: 'May', value: 4400 },
      { month: 'Jun', value: 4100 },
      { month: 'Jul', value: 3800 },
      { month: 'Aug', value: 4200 },
      { month: 'Sep', value: 4600 },
      { month: 'Oct', value: 4100 },
      { month: 'Nov', value: 3900 },
      { month: 'Dec', value: 2200 },
    ],
    revenueGoal: 6500,
    avgRevenuePerSession: 142,
    teamAvgPerSession: 168,
    practiceRevenueShare: 11,
    totalSessions: 186,
  },
};

// Mock monthly session data for each clinician (12 months)
const CLINICIAN_SESSION_DATA: Record<number, {
  monthlySessions: {
    month: string;
    completed: number;
    booked: number;
    clientCancelled: number;
    clinicianCancelled: number;
    lateCancelled: number;
    noShow: number;
  }[];
  sessionGoal: number;
}> = {
  1: { // Sarah Chen - Clinical Director (high performer) - Excellent attendance, takes time off in July/Dec
    monthlySessions: [
      { month: 'Jan', completed: 42, booked: 46, clientCancelled: 2, clinicianCancelled: 1, lateCancelled: 1, noShow: 1 },
      { month: 'Feb', completed: 44, booked: 48, clientCancelled: 2, clinicianCancelled: 0, lateCancelled: 1, noShow: 0 },
      { month: 'Mar', completed: 40, booked: 44, clientCancelled: 2, clinicianCancelled: 1, lateCancelled: 1, noShow: 1 },
      { month: 'Apr', completed: 45, booked: 49, clientCancelled: 2, clinicianCancelled: 0, lateCancelled: 1, noShow: 1 },
      { month: 'May', completed: 43, booked: 47, clientCancelled: 2, clinicianCancelled: 1, lateCancelled: 0, noShow: 1 },
      { month: 'Jun', completed: 41, booked: 45, clientCancelled: 2, clinicianCancelled: 0, lateCancelled: 1, noShow: 1 },
      { month: 'Jul', completed: 38, booked: 46, clientCancelled: 2, clinicianCancelled: 5, lateCancelled: 0, noShow: 1 },
      { month: 'Aug', completed: 42, booked: 46, clientCancelled: 2, clinicianCancelled: 1, lateCancelled: 1, noShow: 1 },
      { month: 'Sep', completed: 46, booked: 50, clientCancelled: 2, clinicianCancelled: 0, lateCancelled: 1, noShow: 1 },
      { month: 'Oct', completed: 44, booked: 48, clientCancelled: 2, clinicianCancelled: 1, lateCancelled: 1, noShow: 0 },
      { month: 'Nov', completed: 39, booked: 43, clientCancelled: 2, clinicianCancelled: 0, lateCancelled: 1, noShow: 1 },
      { month: 'Dec', completed: 33, booked: 44, clientCancelled: 2, clinicianCancelled: 8, lateCancelled: 0, noShow: 1 },
    ],
    sessionGoal: 40,
  },
  2: { // Maria Rodriguez - Senior Therapist - Takes time off in Aug and around holidays
    monthlySessions: [
      { month: 'Jan', completed: 36, booked: 42, clientCancelled: 3, clinicianCancelled: 1, lateCancelled: 1, noShow: 1 },
      { month: 'Feb', completed: 38, booked: 45, clientCancelled: 4, clinicianCancelled: 1, lateCancelled: 1, noShow: 1 },
      { month: 'Mar', completed: 35, booked: 41, clientCancelled: 3, clinicianCancelled: 1, lateCancelled: 1, noShow: 1 },
      { month: 'Apr', completed: 39, booked: 46, clientCancelled: 4, clinicianCancelled: 1, lateCancelled: 1, noShow: 1 },
      { month: 'May', completed: 36, booked: 43, clientCancelled: 4, clinicianCancelled: 1, lateCancelled: 1, noShow: 1 },
      { month: 'Jun', completed: 34, booked: 40, clientCancelled: 3, clinicianCancelled: 1, lateCancelled: 1, noShow: 1 },
      { month: 'Jul', completed: 32, booked: 38, clientCancelled: 3, clinicianCancelled: 1, lateCancelled: 1, noShow: 1 },
      { month: 'Aug', completed: 28, booked: 42, clientCancelled: 4, clinicianCancelled: 8, lateCancelled: 1, noShow: 1 },
      { month: 'Sep', completed: 37, booked: 44, clientCancelled: 4, clinicianCancelled: 1, lateCancelled: 1, noShow: 1 },
      { month: 'Oct', completed: 36, booked: 43, clientCancelled: 4, clinicianCancelled: 1, lateCancelled: 1, noShow: 1 },
      { month: 'Nov', completed: 30, booked: 40, clientCancelled: 4, clinicianCancelled: 4, lateCancelled: 1, noShow: 1 },
      { month: 'Dec', completed: 28, booked: 42, clientCancelled: 4, clinicianCancelled: 8, lateCancelled: 1, noShow: 1 },
    ],
    sessionGoal: 35,
  },
  3: { // Priya Patel - Therapist (needs attention) - Frequent cancellations, peaks in spring and winter
    monthlySessions: [
      { month: 'Jan', completed: 32, booked: 44, clientCancelled: 6, clinicianCancelled: 2, lateCancelled: 2, noShow: 2 },
      { month: 'Feb', completed: 33, booked: 46, clientCancelled: 7, clinicianCancelled: 2, lateCancelled: 2, noShow: 2 },
      { month: 'Mar', completed: 26, booked: 43, clientCancelled: 7, clinicianCancelled: 6, lateCancelled: 2, noShow: 2 },
      { month: 'Apr', completed: 25, booked: 45, clientCancelled: 8, clinicianCancelled: 8, lateCancelled: 2, noShow: 2 },
      { month: 'May', completed: 29, booked: 43, clientCancelled: 8, clinicianCancelled: 2, lateCancelled: 2, noShow: 2 },
      { month: 'Jun', completed: 27, booked: 41, clientCancelled: 8, clinicianCancelled: 2, lateCancelled: 2, noShow: 2 },
      { month: 'Jul', completed: 25, booked: 39, clientCancelled: 8, clinicianCancelled: 2, lateCancelled: 2, noShow: 2 },
      { month: 'Aug', completed: 28, booked: 42, clientCancelled: 8, clinicianCancelled: 2, lateCancelled: 2, noShow: 2 },
      { month: 'Sep', completed: 26, booked: 40, clientCancelled: 8, clinicianCancelled: 2, lateCancelled: 2, noShow: 2 },
      { month: 'Oct', completed: 27, booked: 41, clientCancelled: 8, clinicianCancelled: 2, lateCancelled: 2, noShow: 2 },
      { month: 'Nov', completed: 22, booked: 39, clientCancelled: 8, clinicianCancelled: 5, lateCancelled: 2, noShow: 2 },
      { month: 'Dec', completed: 20, booked: 43, clientCancelled: 8, clinicianCancelled: 11, lateCancelled: 2, noShow: 2 },
    ],
    sessionGoal: 35,
  },
  4: { // James Kim - Associate Therapist (ramping up) - Very reliable, minimal cancellations
    monthlySessions: [
      { month: 'Jan', completed: 22, booked: 24, clientCancelled: 1, clinicianCancelled: 0, lateCancelled: 1, noShow: 0 },
      { month: 'Feb', completed: 24, booked: 26, clientCancelled: 1, clinicianCancelled: 0, lateCancelled: 1, noShow: 0 },
      { month: 'Mar', completed: 25, booked: 27, clientCancelled: 1, clinicianCancelled: 0, lateCancelled: 1, noShow: 0 },
      { month: 'Apr', completed: 26, booked: 28, clientCancelled: 1, clinicianCancelled: 0, lateCancelled: 1, noShow: 0 },
      { month: 'May', completed: 27, booked: 29, clientCancelled: 1, clinicianCancelled: 0, lateCancelled: 1, noShow: 0 },
      { month: 'Jun', completed: 25, booked: 27, clientCancelled: 1, clinicianCancelled: 0, lateCancelled: 1, noShow: 0 },
      { month: 'Jul', completed: 24, booked: 26, clientCancelled: 1, clinicianCancelled: 0, lateCancelled: 1, noShow: 0 },
      { month: 'Aug', completed: 26, booked: 28, clientCancelled: 1, clinicianCancelled: 0, lateCancelled: 1, noShow: 0 },
      { month: 'Sep', completed: 28, booked: 30, clientCancelled: 1, clinicianCancelled: 0, lateCancelled: 1, noShow: 0 },
      { month: 'Oct', completed: 26, booked: 28, clientCancelled: 1, clinicianCancelled: 0, lateCancelled: 1, noShow: 0 },
      { month: 'Nov', completed: 24, booked: 26, clientCancelled: 1, clinicianCancelled: 0, lateCancelled: 1, noShow: 0 },
      { month: 'Dec', completed: 20, booked: 26, clientCancelled: 1, clinicianCancelled: 4, lateCancelled: 1, noShow: 0 },
    ],
    sessionGoal: 25,
  },
  5: { // Michael Johnson - Associate Therapist (critical) - High cancellations throughout, spikes in summer
    monthlySessions: [
      { month: 'Jan', completed: 18, booked: 28, clientCancelled: 4, clinicianCancelled: 2, lateCancelled: 2, noShow: 2 },
      { month: 'Feb', completed: 19, booked: 30, clientCancelled: 5, clinicianCancelled: 2, lateCancelled: 2, noShow: 2 },
      { month: 'Mar', completed: 17, booked: 28, clientCancelled: 5, clinicianCancelled: 2, lateCancelled: 2, noShow: 2 },
      { month: 'Apr', completed: 16, booked: 28, clientCancelled: 6, clinicianCancelled: 2, lateCancelled: 2, noShow: 2 },
      { month: 'May', completed: 15, booked: 27, clientCancelled: 6, clinicianCancelled: 2, lateCancelled: 2, noShow: 2 },
      { month: 'Jun', completed: 12, booked: 28, clientCancelled: 6, clinicianCancelled: 6, lateCancelled: 2, noShow: 2 },
      { month: 'Jul', completed: 10, booked: 28, clientCancelled: 6, clinicianCancelled: 8, lateCancelled: 2, noShow: 2 },
      { month: 'Aug', completed: 11, booked: 29, clientCancelled: 6, clinicianCancelled: 8, lateCancelled: 2, noShow: 2 },
      { month: 'Sep', completed: 16, booked: 28, clientCancelled: 6, clinicianCancelled: 2, lateCancelled: 2, noShow: 2 },
      { month: 'Oct', completed: 14, booked: 26, clientCancelled: 6, clinicianCancelled: 2, lateCancelled: 2, noShow: 2 },
      { month: 'Nov', completed: 13, booked: 25, clientCancelled: 6, clinicianCancelled: 2, lateCancelled: 2, noShow: 2 },
      { month: 'Dec', completed: 5, booked: 25, clientCancelled: 6, clinicianCancelled: 10, lateCancelled: 2, noShow: 2 },
    ],
    sessionGoal: 25,
  },
};

// Mock caseload data for each clinician (12 months)
const CLINICIAN_CASELOAD_DATA: Record<number, {
  monthlyCaseload: {
    month: string;
    activeClients: number;
    capacity: number;
    newClients: number;
    churned: number;
  }[];
  atRiskClients: number;
  practiceAvgUtilization: number;
  // Session frequency breakdown of current active clients
  sessionFrequency: {
    weekly: number;      // 4+ sessions/month
    biweekly: number;    // 2-3 sessions/month
    monthly: number;     // 1 session/month
    inconsistent: number; // <1 session/month or irregular
  };
}> = {
  1: { // Sarah Chen - Clinical Director (high performer) - Strong growth, low churn
    monthlyCaseload: [
      { month: 'Jan', activeClients: 26, capacity: 30, newClients: 4, churned: 1 },
      { month: 'Feb', activeClients: 28, capacity: 30, newClients: 3, churned: 1 },
      { month: 'Mar', activeClients: 29, capacity: 30, newClients: 2, churned: 1 },
      { month: 'Apr', activeClients: 30, capacity: 30, newClients: 2, churned: 1 },
      { month: 'May', activeClients: 30, capacity: 30, newClients: 1, churned: 1 },
      { month: 'Jun', activeClients: 29, capacity: 30, newClients: 1, churned: 2 },
      { month: 'Jul', activeClients: 28, capacity: 30, newClients: 1, churned: 2 },
      { month: 'Aug', activeClients: 29, capacity: 30, newClients: 2, churned: 1 },
      { month: 'Sep', activeClients: 30, capacity: 30, newClients: 2, churned: 1 },
      { month: 'Oct', activeClients: 30, capacity: 30, newClients: 1, churned: 1 },
      { month: 'Nov', activeClients: 29, capacity: 30, newClients: 1, churned: 2 },
      { month: 'Dec', activeClients: 28, capacity: 30, newClients: 1, churned: 2 },
    ],
    atRiskClients: 2,
    practiceAvgUtilization: 78,
    sessionFrequency: {
      weekly: 18,      // Most clients are engaged weekly - excellent clinician
      biweekly: 7,
      monthly: 2,
      inconsistent: 1,
    },
  },
  2: { // Maria Rodriguez - Senior Therapist - Steady state, balanced
    monthlyCaseload: [
      { month: 'Jan', activeClients: 23, capacity: 28, newClients: 2, churned: 2 },
      { month: 'Feb', activeClients: 24, capacity: 28, newClients: 3, churned: 2 },
      { month: 'Mar', activeClients: 24, capacity: 28, newClients: 2, churned: 2 },
      { month: 'Apr', activeClients: 25, capacity: 28, newClients: 3, churned: 2 },
      { month: 'May', activeClients: 25, capacity: 28, newClients: 2, churned: 2 },
      { month: 'Jun', activeClients: 24, capacity: 28, newClients: 1, churned: 2 },
      { month: 'Jul', activeClients: 24, capacity: 28, newClients: 2, churned: 2 },
      { month: 'Aug', activeClients: 25, capacity: 28, newClients: 3, churned: 2 },
      { month: 'Sep', activeClients: 26, capacity: 28, newClients: 3, churned: 2 },
      { month: 'Oct', activeClients: 26, capacity: 28, newClients: 2, churned: 2 },
      { month: 'Nov', activeClients: 25, capacity: 28, newClients: 1, churned: 2 },
      { month: 'Dec', activeClients: 24, capacity: 28, newClients: 1, churned: 2 },
    ],
    atRiskClients: 3,
    practiceAvgUtilization: 78,
    sessionFrequency: {
      weekly: 12,
      biweekly: 8,
      monthly: 3,
      inconsistent: 1,
    },
  },
  3: { // Priya Patel - Therapist (slightly below avg) - Stable caseload, slight churn
    monthlyCaseload: [
      { month: 'Jan', activeClients: 24, capacity: 28, newClients: 2, churned: 1 },
      { month: 'Feb', activeClients: 24, capacity: 28, newClients: 1, churned: 1 },
      { month: 'Mar', activeClients: 23, capacity: 28, newClients: 1, churned: 2 },
      { month: 'Apr', activeClients: 23, capacity: 28, newClients: 1, churned: 1 },
      { month: 'May', activeClients: 23, capacity: 28, newClients: 1, churned: 1 },
      { month: 'Jun', activeClients: 23, capacity: 28, newClients: 1, churned: 1 },
      { month: 'Jul', activeClients: 22, capacity: 28, newClients: 1, churned: 2 },
      { month: 'Aug', activeClients: 22, capacity: 28, newClients: 1, churned: 1 },
      { month: 'Sep', activeClients: 23, capacity: 28, newClients: 2, churned: 1 },
      { month: 'Oct', activeClients: 23, capacity: 28, newClients: 1, churned: 1 },
      { month: 'Nov', activeClients: 23, capacity: 28, newClients: 1, churned: 1 },
      { month: 'Dec', activeClients: 23, capacity: 28, newClients: 1, churned: 1 },
    ],
    atRiskClients: 3,
    practiceAvgUtilization: 78,
    sessionFrequency: {
      weekly: 10,      // Decent weekly engagement
      biweekly: 8,
      monthly: 3,
      inconsistent: 2,
    },
  },
  4: { // James Kim - Associate Therapist (ramping up) - Great growth trajectory
    monthlyCaseload: [
      { month: 'Jan', activeClients: 8, capacity: 25, newClients: 4, churned: 0 },
      { month: 'Feb', activeClients: 11, capacity: 25, newClients: 4, churned: 1 },
      { month: 'Mar', activeClients: 14, capacity: 25, newClients: 4, churned: 1 },
      { month: 'Apr', activeClients: 16, capacity: 25, newClients: 3, churned: 1 },
      { month: 'May', activeClients: 17, capacity: 25, newClients: 2, churned: 1 },
      { month: 'Jun', activeClients: 18, capacity: 25, newClients: 2, churned: 1 },
      { month: 'Jul', activeClients: 18, capacity: 25, newClients: 1, churned: 1 },
      { month: 'Aug', activeClients: 19, capacity: 25, newClients: 2, churned: 1 },
      { month: 'Sep', activeClients: 20, capacity: 25, newClients: 2, churned: 1 },
      { month: 'Oct', activeClients: 21, capacity: 25, newClients: 2, churned: 1 },
      { month: 'Nov', activeClients: 21, capacity: 25, newClients: 1, churned: 1 },
      { month: 'Dec', activeClients: 20, capacity: 25, newClients: 1, churned: 2 },
    ],
    atRiskClients: 1,
    practiceAvgUtilization: 78,
    sessionFrequency: {
      weekly: 14,      // Good weekly engagement for ramping clinician
      biweekly: 4,
      monthly: 2,
      inconsistent: 0,
    },
  },
  5: { // Michael Johnson - Associate Therapist (needs coaching) - Below average but improving
    monthlyCaseload: [
      { month: 'Jan', activeClients: 18, capacity: 25, newClients: 2, churned: 1 },
      { month: 'Feb', activeClients: 18, capacity: 25, newClients: 1, churned: 1 },
      { month: 'Mar', activeClients: 17, capacity: 25, newClients: 1, churned: 2 },
      { month: 'Apr', activeClients: 17, capacity: 25, newClients: 1, churned: 1 },
      { month: 'May', activeClients: 18, capacity: 25, newClients: 2, churned: 1 },
      { month: 'Jun', activeClients: 18, capacity: 25, newClients: 1, churned: 1 },
      { month: 'Jul', activeClients: 17, capacity: 25, newClients: 1, churned: 2 },
      { month: 'Aug', activeClients: 18, capacity: 25, newClients: 2, churned: 1 },
      { month: 'Sep', activeClients: 18, capacity: 25, newClients: 1, churned: 1 },
      { month: 'Oct', activeClients: 19, capacity: 25, newClients: 2, churned: 1 },
      { month: 'Nov', activeClients: 19, capacity: 25, newClients: 1, churned: 1 },
      { month: 'Dec', activeClients: 19, capacity: 25, newClients: 1, churned: 1 },
    ],
    atRiskClients: 3,
    practiceAvgUtilization: 78,
    sessionFrequency: {
      weekly: 8,       // Lower weekly engagement than peers
      biweekly: 6,
      monthly: 3,
      inconsistent: 2,
    },
  },
};

// Mock acquisition data for each clinician (12 months of consults booked and clients converted)
const CLINICIAN_ACQUISITION_DATA: Record<number, {
  monthlyAcquisition: {
    month: string;
    consultsBooked: number;
    clientsConverted: number;
  }[];
}> = {
  1: { // Sarah Chen - Excellent converter (75%+ rate)
    monthlyAcquisition: [
      { month: 'Jan', consultsBooked: 5, clientsConverted: 4 },
      { month: 'Feb', consultsBooked: 4, clientsConverted: 3 },
      { month: 'Mar', consultsBooked: 3, clientsConverted: 2 },
      { month: 'Apr', consultsBooked: 4, clientsConverted: 3 },
      { month: 'May', consultsBooked: 5, clientsConverted: 4 },
      { month: 'Jun', consultsBooked: 3, clientsConverted: 3 },
      { month: 'Jul', consultsBooked: 4, clientsConverted: 3 },
      { month: 'Aug', consultsBooked: 6, clientsConverted: 5 },
      { month: 'Sep', consultsBooked: 5, clientsConverted: 4 },
      { month: 'Oct', consultsBooked: 4, clientsConverted: 3 },
      { month: 'Nov', consultsBooked: 5, clientsConverted: 4 },
      { month: 'Dec', consultsBooked: 4, clientsConverted: 3 },
    ],
  },
  2: { // Maria Rodriguez - Good converter (65-70% rate)
    monthlyAcquisition: [
      { month: 'Jan', consultsBooked: 4, clientsConverted: 2 },
      { month: 'Feb', consultsBooked: 5, clientsConverted: 3 },
      { month: 'Mar', consultsBooked: 3, clientsConverted: 2 },
      { month: 'Apr', consultsBooked: 4, clientsConverted: 3 },
      { month: 'May', consultsBooked: 3, clientsConverted: 2 },
      { month: 'Jun', consultsBooked: 4, clientsConverted: 3 },
      { month: 'Jul', consultsBooked: 5, clientsConverted: 3 },
      { month: 'Aug', consultsBooked: 4, clientsConverted: 3 },
      { month: 'Sep', consultsBooked: 3, clientsConverted: 2 },
      { month: 'Oct', consultsBooked: 4, clientsConverted: 3 },
      { month: 'Nov', consultsBooked: 5, clientsConverted: 3 },
      { month: 'Dec', consultsBooked: 3, clientsConverted: 2 },
    ],
  },
  3: { // Priya Patel - Struggling converter (35-40% rate)
    monthlyAcquisition: [
      { month: 'Jan', consultsBooked: 4, clientsConverted: 2 },
      { month: 'Feb', consultsBooked: 3, clientsConverted: 1 },
      { month: 'Mar', consultsBooked: 4, clientsConverted: 1 },
      { month: 'Apr', consultsBooked: 5, clientsConverted: 2 },
      { month: 'May', consultsBooked: 3, clientsConverted: 1 },
      { month: 'Jun', consultsBooked: 4, clientsConverted: 2 },
      { month: 'Jul', consultsBooked: 3, clientsConverted: 1 },
      { month: 'Aug', consultsBooked: 4, clientsConverted: 1 },
      { month: 'Sep', consultsBooked: 5, clientsConverted: 2 },
      { month: 'Oct', consultsBooked: 3, clientsConverted: 1 },
      { month: 'Nov', consultsBooked: 4, clientsConverted: 2 },
      { month: 'Dec', consultsBooked: 3, clientsConverted: 1 },
    ],
  },
  4: { // James Kim - Growing and improving (60-70% rate, increasing volume)
    monthlyAcquisition: [
      { month: 'Jan', consultsBooked: 5, clientsConverted: 4 },
      { month: 'Feb', consultsBooked: 6, clientsConverted: 4 },
      { month: 'Mar', consultsBooked: 5, clientsConverted: 4 },
      { month: 'Apr', consultsBooked: 6, clientsConverted: 4 },
      { month: 'May', consultsBooked: 7, clientsConverted: 5 },
      { month: 'Jun', consultsBooked: 6, clientsConverted: 4 },
      { month: 'Jul', consultsBooked: 7, clientsConverted: 5 },
      { month: 'Aug', consultsBooked: 6, clientsConverted: 4 },
      { month: 'Sep', consultsBooked: 8, clientsConverted: 5 },
      { month: 'Oct', consultsBooked: 7, clientsConverted: 5 },
      { month: 'Nov', consultsBooked: 8, clientsConverted: 5 },
      { month: 'Dec', consultsBooked: 6, clientsConverted: 4 },
    ],
  },
  5: { // Michael Johnson - Poor converter (25-35% rate)
    monthlyAcquisition: [
      { month: 'Jan', consultsBooked: 3, clientsConverted: 2 },
      { month: 'Feb', consultsBooked: 4, clientsConverted: 1 },
      { month: 'Mar', consultsBooked: 3, clientsConverted: 1 },
      { month: 'Apr', consultsBooked: 4, clientsConverted: 1 },
      { month: 'May', consultsBooked: 3, clientsConverted: 1 },
      { month: 'Jun', consultsBooked: 5, clientsConverted: 1 },
      { month: 'Jul', consultsBooked: 4, clientsConverted: 1 },
      { month: 'Aug', consultsBooked: 3, clientsConverted: 1 },
      { month: 'Sep', consultsBooked: 4, clientsConverted: 1 },
      { month: 'Oct', consultsBooked: 5, clientsConverted: 2 },
      { month: 'Nov', consultsBooked: 3, clientsConverted: 1 },
      { month: 'Dec', consultsBooked: 4, clientsConverted: 1 },
    ],
  },
};

// Client status types
type ClientStatus = 'healthy' | 'at-risk' | 'new' | 'milestone';

// Client data structure for roster
interface ClinicianClient {
  id: string;
  name: string;
  initials: string;
  totalSessions: number;
  lastSeenDays: number;
  nextAppointment: string | null;
  status: ClientStatus;
  milestone?: number;
}

// Mock client data per clinician
const CLINICIAN_CLIENTS: Record<number, ClinicianClient[]> = {
  1: [ // Sarah Chen
    { id: 'c1-1', name: 'Emma Thompson', initials: 'ET', totalSessions: 24, lastSeenDays: 3, nextAppointment: 'Dec 12', status: 'healthy' },
    { id: 'c1-2', name: 'Michael Davis', initials: 'MD', totalSessions: 18, lastSeenDays: 5, nextAppointment: 'Dec 14', status: 'healthy' },
    { id: 'c1-3', name: 'Sarah Mitchell', initials: 'SM', totalSessions: 12, lastSeenDays: 28, nextAppointment: null, status: 'at-risk' },
    { id: 'c1-4', name: 'Amanda Foster', initials: 'AF', totalSessions: 2, lastSeenDays: 5, nextAppointment: 'Dec 12', status: 'new' },
    { id: 'c1-5', name: 'Nicole Adams', initials: 'NA', totalSessions: 2, lastSeenDays: 5, nextAppointment: 'Dec 12', status: 'milestone', milestone: 3 },
    { id: 'c1-6', name: 'David Park', initials: 'DP', totalSessions: 22, lastSeenDays: 15, nextAppointment: null, status: 'at-risk' },
    { id: 'c1-7', name: 'Jennifer White', initials: 'JW', totalSessions: 31, lastSeenDays: 2, nextAppointment: 'Dec 10', status: 'healthy' },
    { id: 'c1-8', name: 'Robert Garcia', initials: 'RG', totalSessions: 15, lastSeenDays: 4, nextAppointment: 'Dec 11', status: 'healthy' },
  ],
  2: [ // Maria Rodriguez
    { id: 'c2-1', name: 'Jessica Brown', initials: 'JB', totalSessions: 19, lastSeenDays: 2, nextAppointment: 'Dec 9', status: 'healthy' },
    { id: 'c2-2', name: 'Christopher Lee', initials: 'CL', totalSessions: 14, lastSeenDays: 6, nextAppointment: 'Dec 13', status: 'healthy' },
    { id: 'c2-3', name: 'Daniel Williams', initials: 'DW', totalSessions: 1, lastSeenDays: 2, nextAppointment: 'Dec 9', status: 'new' },
    { id: 'c2-4', name: 'Oliver Scott', initials: 'OS', totalSessions: 4, lastSeenDays: 3, nextAppointment: 'Dec 10', status: 'milestone', milestone: 5 },
    { id: 'c2-5', name: 'Michael Chen', initials: 'MC', totalSessions: 6, lastSeenDays: 18, nextAppointment: null, status: 'at-risk' },
    { id: 'c2-6', name: 'Ashley Taylor', initials: 'AT', totalSessions: 27, lastSeenDays: 4, nextAppointment: 'Dec 11', status: 'healthy' },
    { id: 'c2-7', name: 'Brandon Moore', initials: 'BM', totalSessions: 11, lastSeenDays: 3, nextAppointment: 'Dec 10', status: 'healthy' },
  ],
  3: [ // Priya Patel
    { id: 'c3-1', name: 'James Rodriguez', initials: 'JR', totalSessions: 8, lastSeenDays: 24, nextAppointment: null, status: 'at-risk' },
    { id: 'c3-2', name: 'Emily Watson', initials: 'EW', totalSessions: 11, lastSeenDays: 7, nextAppointment: 'Dec 14', status: 'milestone', milestone: 12 },
    { id: 'c3-3', name: 'Patricia Moore', initials: 'PM', totalSessions: 4, lastSeenDays: 6, nextAppointment: 'Dec 13', status: 'milestone', milestone: 5 },
    { id: 'c3-4', name: 'Jennifer Lee', initials: 'JL', totalSessions: 9, lastSeenDays: 12, nextAppointment: null, status: 'at-risk' },
    { id: 'c3-5', name: 'Brian Martinez', initials: 'BM', totalSessions: 1, lastSeenDays: 3, nextAppointment: 'Dec 10', status: 'new' },
    { id: 'c3-6', name: 'Grace O\'Brien', initials: 'GO', totalSessions: 1, lastSeenDays: 1, nextAppointment: 'Dec 8', status: 'new' },
    { id: 'c3-7', name: 'Kevin Wilson', initials: 'KW', totalSessions: 16, lastSeenDays: 21, nextAppointment: null, status: 'at-risk' },
    { id: 'c3-8', name: 'Laura Harris', initials: 'LH', totalSessions: 23, lastSeenDays: 5, nextAppointment: 'Dec 12', status: 'healthy' },
  ],
  4: [ // James Kim
    { id: 'c4-1', name: 'Emily Watson', initials: 'EW', totalSessions: 15, lastSeenDays: 21, nextAppointment: null, status: 'at-risk' },
    { id: 'c4-2', name: 'Christina Liu', initials: 'CL', totalSessions: 2, lastSeenDays: 7, nextAppointment: 'Dec 14', status: 'new' },
    { id: 'c4-3', name: 'Henry Kim', initials: 'HK', totalSessions: 2, lastSeenDays: 5, nextAppointment: 'Dec 12', status: 'new' },
    { id: 'c4-4', name: 'Quinn Johnson', initials: 'QJ', totalSessions: 11, lastSeenDays: 4, nextAppointment: 'Dec 11', status: 'milestone', milestone: 12 },
    { id: 'c4-5', name: 'Steven Clark', initials: 'SC', totalSessions: 19, lastSeenDays: 3, nextAppointment: 'Dec 10', status: 'healthy' },
    { id: 'c4-6', name: 'Rachel Green', initials: 'RG', totalSessions: 8, lastSeenDays: 6, nextAppointment: 'Dec 13', status: 'healthy' },
  ],
  5: [ // Michael Johnson
    { id: 'c5-1', name: 'Lisa Thompson', initials: 'LT', totalSessions: 4, lastSeenDays: 16, nextAppointment: null, status: 'at-risk' },
    { id: 'c5-2', name: 'Elena Petrova', initials: 'EP', totalSessions: 3, lastSeenDays: 4, nextAppointment: 'Dec 11', status: 'new' },
    { id: 'c5-3', name: 'Jack Thompson', initials: 'JT', totalSessions: 3, lastSeenDays: 7, nextAppointment: 'Dec 15', status: 'new' },
    { id: 'c5-4', name: 'Rachel Green', initials: 'RG', totalSessions: 11, lastSeenDays: 7, nextAppointment: 'Dec 14', status: 'milestone', milestone: 12 },
    { id: 'c5-5', name: 'Thomas Anderson', initials: 'TA', totalSessions: 7, lastSeenDays: 25, nextAppointment: null, status: 'at-risk' },
    { id: 'c5-6', name: 'Maria Santos', initials: 'MS', totalSessions: 2, lastSeenDays: 30, nextAppointment: null, status: 'at-risk' },
  ],
};

// =============================================================================
// CLIENT-LEVEL BREAKDOWN DATA FOR EXPANDED CHART VIEW
// =============================================================================
// Client-level monthly data to power the split-view expanded charts.
// Each client has per-month data for revenue, sessions, and cancellations.
// =============================================================================

interface ClientMonthlyData {
  clientId: string;
  clientName: string;
  months: {
    [month: string]: {
      sessions: number;
      revenue: number;
      cancelled: number;
      cancelType: 'client' | 'clinician' | null;
      lateCancel: number;
      noShow: number;
      lastSeen: string | null;
      nextAppt: string | null;
      rebooked: boolean;
    };
  };
}

// Generate client monthly data from existing CLINICIAN_CLIENTS
const generateClientMonthlyData = (clinicianId: number): ClientMonthlyData[] => {
  const clients = CLINICIAN_CLIENTS[clinicianId] || [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const avgSessionRate = clinicianId === 1 ? 185 : clinicianId === 2 ? 172 : clinicianId === 3 ? 158 : clinicianId === 4 ? 165 : 142;

  return clients.map(client => {
    const baseSessionsPerMonth = client.status === 'healthy' ? 4 : client.status === 'at-risk' ? 2 : 3;
    const monthlyData: ClientMonthlyData['months'] = {};

    months.forEach((month, idx) => {
      // Vary sessions slightly by month
      const variance = Math.floor(Math.random() * 2) - 1;
      const sessions = Math.max(0, baseSessionsPerMonth + variance);
      const revenue = sessions * avgSessionRate;

      // Add some cancellations based on client status
      const hasCancellation = client.status === 'at-risk' && Math.random() > 0.6;
      const hasLateCancel = client.status === 'at-risk' && Math.random() > 0.8;
      const hasNoShow = client.status === 'at-risk' && Math.random() > 0.85;

      monthlyData[month] = {
        sessions,
        revenue,
        cancelled: hasCancellation ? 1 : 0,
        cancelType: hasCancellation ? (Math.random() > 0.5 ? 'client' : 'clinician') : null,
        lateCancel: hasLateCancel ? 1 : 0,
        noShow: hasNoShow ? 1 : 0,
        lastSeen: idx === 11 ? (client.nextAppointment ? `Dec ${10 + Math.floor(Math.random() * 10)}` : null) : null,
        nextAppt: idx === 11 ? client.nextAppointment : null,
        rebooked: client.nextAppointment !== null,
      };
    });

    return {
      clientId: client.id,
      clientName: client.name,
      months: monthlyData,
    };
  });
};

// Pre-generate client monthly data for all clinicians
const CLINICIAN_CLIENT_MONTHLY_DATA: Record<number, ClientMonthlyData[]> = {
  1: generateClientMonthlyData(1),
  2: generateClientMonthlyData(2),
  3: generateClientMonthlyData(3),
  4: generateClientMonthlyData(4),
  5: generateClientMonthlyData(5),
};

// Mock retention data for each clinician (12 months of rebook rates)
const CLINICIAN_RETENTION_DATA: Record<number, {
  monthlyRebookRate: { month: string; rate: number }[];
  currentRebookRate: number;
  practiceAvgRebookRate: number;
  avgSessionsBeforeChurn: number;
  practiceAvgSessionsBeforeChurn: number;
  // Return Rates - % of clients still active at each time milestone
  month3ReturnRate: number;          // % still active at 3 months
  practiceAvgMonth3Return: number;
  month6ReturnRate: number;          // % still active at 6 months
  practiceAvgMonth6Return: number;
  month9ReturnRate: number;          // % still active at 9 months
  practiceAvgMonth9Return: number;
  oneYearReturnRate: number;         // % still active at 1 year
  practiceAvgOneYearReturn: number;
  beyondOneYearReturnRate: number;   // % still active beyond 1 year
  practiceAvgBeyondOneYearReturn: number;
  topPerformerMonth3Return: number;  // Top performer benchmarks
  topPerformerMonth6Return: number;
  topPerformerMonth9Return: number;
  topPerformerOneYearReturn: number;
  churnTiming: { early: number; medium: number; late: number }; // <5, 5-15, >15 sessions
}> = {
  1: { // Sarah Chen - Clinical Director (high performer)
    monthlyRebookRate: [
      { month: 'Jan', rate: 91 },
      { month: 'Feb', rate: 90 },
      { month: 'Mar', rate: 92 },
      { month: 'Apr', rate: 91 },
      { month: 'May', rate: 90 },
      { month: 'Jun', rate: 91 },
      { month: 'Jul', rate: 89 },
      { month: 'Aug', rate: 90 },
      { month: 'Sep', rate: 92 },
      { month: 'Oct', rate: 91 },
      { month: 'Nov', rate: 90 },
      { month: 'Dec', rate: 91 },
    ],
    currentRebookRate: 91,
    practiceAvgRebookRate: 88,
    avgSessionsBeforeChurn: 18.5,
    practiceAvgSessionsBeforeChurn: 14.2,
    month3ReturnRate: 92,
    practiceAvgMonth3Return: 85,
    month6ReturnRate: 85,
    practiceAvgMonth6Return: 72,
    month9ReturnRate: 76,
    practiceAvgMonth9Return: 62,
    oneYearReturnRate: 68,
    practiceAvgOneYearReturn: 55,
    beyondOneYearReturnRate: 52,
    practiceAvgBeyondOneYearReturn: 42,
    topPerformerMonth3Return: 92,
    topPerformerMonth6Return: 85,
    topPerformerMonth9Return: 76,
    topPerformerOneYearReturn: 68,
    churnTiming: { early: 2, medium: 4, late: 6 }, // Most churn late = good retention
  },
  2: { // Maria Rodriguez - Senior Therapist
    monthlyRebookRate: [
      { month: 'Jan', rate: 89 },
      { month: 'Feb', rate: 88 },
      { month: 'Mar', rate: 90 },
      { month: 'Apr', rate: 88 },
      { month: 'May', rate: 89 },
      { month: 'Jun', rate: 88 },
      { month: 'Jul', rate: 87 },
      { month: 'Aug', rate: 89 },
      { month: 'Sep', rate: 90 },
      { month: 'Oct', rate: 89 },
      { month: 'Nov', rate: 88 },
      { month: 'Dec', rate: 89 },
    ],
    currentRebookRate: 89,
    practiceAvgRebookRate: 88,
    avgSessionsBeforeChurn: 15.2,
    practiceAvgSessionsBeforeChurn: 14.2,
    month3ReturnRate: 88,
    practiceAvgMonth3Return: 85,
    month6ReturnRate: 78,
    practiceAvgMonth6Return: 72,
    month9ReturnRate: 66,
    practiceAvgMonth9Return: 62,
    oneYearReturnRate: 58,
    practiceAvgOneYearReturn: 55,
    beyondOneYearReturnRate: 45,
    practiceAvgBeyondOneYearReturn: 42,
    topPerformerMonth3Return: 92,
    topPerformerMonth6Return: 85,
    topPerformerMonth9Return: 76,
    topPerformerOneYearReturn: 68,
    churnTiming: { early: 3, medium: 5, late: 5 }, // Balanced churn distribution
  },
  3: { // Priya Patel - Therapist (slightly below average - coaching opportunity)
    monthlyRebookRate: [
      { month: 'Jan', rate: 86 },
      { month: 'Feb', rate: 85 },
      { month: 'Mar', rate: 84 },
      { month: 'Apr', rate: 85 },
      { month: 'May', rate: 86 },
      { month: 'Jun', rate: 85 },
      { month: 'Jul', rate: 84 },
      { month: 'Aug', rate: 86 },
      { month: 'Sep', rate: 85 },
      { month: 'Oct', rate: 86 },
      { month: 'Nov', rate: 86 },
      { month: 'Dec', rate: 87 },
    ],
    currentRebookRate: 87,
    practiceAvgRebookRate: 88,
    avgSessionsBeforeChurn: 12.1,
    practiceAvgSessionsBeforeChurn: 14.2,
    month3ReturnRate: 82,
    practiceAvgMonth3Return: 85,
    month6ReturnRate: 68,
    practiceAvgMonth6Return: 72,
    month9ReturnRate: 58,
    practiceAvgMonth9Return: 62,
    oneYearReturnRate: 50,
    practiceAvgOneYearReturn: 55,
    beyondOneYearReturnRate: 38,
    practiceAvgBeyondOneYearReturn: 42,
    topPerformerMonth3Return: 92,
    topPerformerMonth6Return: 85,
    topPerformerMonth9Return: 76,
    topPerformerOneYearReturn: 68,
    churnTiming: { early: 4, medium: 4, late: 3 }, // Slightly higher early churn
  },
  4: { // James Kim - Associate Therapist (ramping up)
    monthlyRebookRate: [
      { month: 'Jan', rate: 86 },
      { month: 'Feb', rate: 87 },
      { month: 'Mar', rate: 87 },
      { month: 'Apr', rate: 88 },
      { month: 'May', rate: 88 },
      { month: 'Jun', rate: 87 },
      { month: 'Jul', rate: 86 },
      { month: 'Aug', rate: 88 },
      { month: 'Sep', rate: 89 },
      { month: 'Oct', rate: 88 },
      { month: 'Nov', rate: 87 },
      { month: 'Dec', rate: 88 },
    ],
    currentRebookRate: 88,
    practiceAvgRebookRate: 88,
    avgSessionsBeforeChurn: 13.5,
    practiceAvgSessionsBeforeChurn: 14.2,
    month3ReturnRate: 84,
    practiceAvgMonth3Return: 85,
    month6ReturnRate: 71,
    practiceAvgMonth6Return: 72,
    month9ReturnRate: 60,
    practiceAvgMonth9Return: 62,
    oneYearReturnRate: 52,
    practiceAvgOneYearReturn: 55,
    beyondOneYearReturnRate: 38,
    practiceAvgBeyondOneYearReturn: 42,
    topPerformerMonth3Return: 92,
    topPerformerMonth6Return: 85,
    topPerformerMonth9Return: 76,
    topPerformerOneYearReturn: 68,
    churnTiming: { early: 3, medium: 4, late: 4 }, // Improving, fewer early churns
  },
  5: { // Michael Johnson - Associate Therapist (needs coaching - slightly below avg)
    monthlyRebookRate: [
      { month: 'Jan', rate: 82 },
      { month: 'Feb', rate: 81 },
      { month: 'Mar', rate: 80 },
      { month: 'Apr', rate: 82 },
      { month: 'May', rate: 83 },
      { month: 'Jun', rate: 82 },
      { month: 'Jul', rate: 81 },
      { month: 'Aug', rate: 83 },
      { month: 'Sep', rate: 84 },
      { month: 'Oct', rate: 83 },
      { month: 'Nov', rate: 84 },
      { month: 'Dec', rate: 85 },
    ],
    currentRebookRate: 85,
    practiceAvgRebookRate: 88,
    avgSessionsBeforeChurn: 10.8,
    practiceAvgSessionsBeforeChurn: 14.2,
    month3ReturnRate: 78,
    practiceAvgMonth3Return: 85,
    month6ReturnRate: 62,
    practiceAvgMonth6Return: 72,
    month9ReturnRate: 52,
    practiceAvgMonth9Return: 62,
    oneYearReturnRate: 45,
    practiceAvgOneYearReturn: 55,
    beyondOneYearReturnRate: 32,
    practiceAvgBeyondOneYearReturn: 42,
    topPerformerMonth3Return: 92,
    topPerformerMonth6Return: 85,
    topPerformerMonth9Return: 76,
    topPerformerOneYearReturn: 68,
    churnTiming: { early: 5, medium: 4, late: 3 }, // Slightly higher early churn than peers
  },
};

// Mock compliance/notes data for each clinician
interface OverdueNote {
  id: string;
  clientName: string;
  clientInitials: string;
  sessionDate: string;
  daysOverdue: number;
  sessionType: string;
}

interface ComplianceData {
  outstandingNotes: number;      // Total notes not yet completed
  overdueNotes: number;          // Notes past the deadline
  dueWithin48h: number;          // Notes due soon (not yet overdue)
  practiceAvgOutstanding: number;
  avgCompletionTime: number;     // Hours to complete notes
  practiceAvgCompletionTime: number;
  overdueNotesList: OverdueNote[];
}

const CLINICIAN_COMPLIANCE_DATA: Record<number, ComplianceData> = {
  1: { // Sarah Chen - Excellent, minimal overdue
    outstandingNotes: 2,
    overdueNotes: 0,
    dueWithin48h: 2,
    practiceAvgOutstanding: 8,
    avgCompletionTime: 4,
    practiceAvgCompletionTime: 18,
    overdueNotesList: [],
  },
  2: { // Maria Rodriguez - Good, few overdue
    outstandingNotes: 4,
    overdueNotes: 1,
    dueWithin48h: 3,
    practiceAvgOutstanding: 8,
    avgCompletionTime: 12,
    practiceAvgCompletionTime: 18,
    overdueNotesList: [
      { id: 'n2-1', clientName: 'David Park', clientInitials: 'DP', sessionDate: 'Dec 8', daysOverdue: 3, sessionType: 'Individual' },
    ],
  },
  3: { // Priya Patel - Needs attention, several overdue
    outstandingNotes: 12,
    overdueNotes: 5,
    dueWithin48h: 7,
    practiceAvgOutstanding: 8,
    avgCompletionTime: 36,
    practiceAvgCompletionTime: 18,
    overdueNotesList: [
      { id: 'n3-1', clientName: 'Emily Watson', clientInitials: 'EW', sessionDate: 'Dec 2', daysOverdue: 9, sessionType: 'Individual' },
      { id: 'n3-2', clientName: 'Marcus Chen', clientInitials: 'MC', sessionDate: 'Dec 4', daysOverdue: 7, sessionType: 'Individual' },
      { id: 'n3-3', clientName: 'Sarah Miller', clientInitials: 'SM', sessionDate: 'Dec 6', daysOverdue: 5, sessionType: 'Couples' },
      { id: 'n3-4', clientName: 'James Liu', clientInitials: 'JL', sessionDate: 'Dec 8', daysOverdue: 3, sessionType: 'Individual' },
      { id: 'n3-5', clientName: 'Anna Brooks', clientInitials: 'AB', sessionDate: 'Dec 9', daysOverdue: 2, sessionType: 'Individual' },
    ],
  },
  4: { // James Kim - Good, few overdue
    outstandingNotes: 3,
    overdueNotes: 0,
    dueWithin48h: 3,
    practiceAvgOutstanding: 8,
    avgCompletionTime: 8,
    practiceAvgCompletionTime: 18,
    overdueNotesList: [],
  },
  5: { // Michael Johnson - Critical, many overdue
    outstandingNotes: 18,
    overdueNotes: 8,
    dueWithin48h: 10,
    practiceAvgOutstanding: 8,
    avgCompletionTime: 72,
    practiceAvgCompletionTime: 18,
    overdueNotesList: [
      { id: 'n5-1', clientName: 'Robert Kim', clientInitials: 'RK', sessionDate: 'Nov 25', daysOverdue: 16, sessionType: 'Individual' },
      { id: 'n5-2', clientName: 'Lisa Thompson', clientInitials: 'LT', sessionDate: 'Nov 28', daysOverdue: 13, sessionType: 'Individual' },
      { id: 'n5-3', clientName: 'Kevin Patel', clientInitials: 'KP', sessionDate: 'Dec 1', daysOverdue: 10, sessionType: 'Individual' },
      { id: 'n5-4', clientName: 'Maria Santos', clientInitials: 'MS', sessionDate: 'Dec 3', daysOverdue: 8, sessionType: 'Couples' },
      { id: 'n5-5', clientName: 'Thomas Anderson', clientInitials: 'TA', sessionDate: 'Dec 5', daysOverdue: 6, sessionType: 'Individual' },
      { id: 'n5-6', clientName: 'Jennifer Wu', clientInitials: 'JW', sessionDate: 'Dec 7', daysOverdue: 4, sessionType: 'Individual' },
      { id: 'n5-7', clientName: 'David Lee', clientInitials: 'DL', sessionDate: 'Dec 8', daysOverdue: 3, sessionType: 'Individual' },
      { id: 'n5-8', clientName: 'Emma Garcia', clientInitials: 'EG', sessionDate: 'Dec 9', daysOverdue: 2, sessionType: 'Individual' },
    ],
  },
};

// Mock client demographics data for each clinician
interface ClientDemographics {
  gender: { male: number; female: number; other: number };
  modality: { inPerson: number; telehealth: number };
  age: { age18to30: number; age31to45: number; age46to60: number; age60plus: number };
}

const CLINICIAN_DEMOGRAPHICS: Record<number, ClientDemographics> = {
  1: { // Sarah Chen - Balanced, slightly more female, mix of modalities
    gender: { male: 12, female: 15, other: 3 },
    modality: { inPerson: 18, telehealth: 12 },
    age: { age18to30: 8, age31to45: 12, age46to60: 7, age60plus: 3 },
  },
  2: { // Maria Rodriguez - More female clients, mostly in-person
    gender: { male: 8, female: 18, other: 2 },
    modality: { inPerson: 22, telehealth: 6 },
    age: { age18to30: 5, age31to45: 14, age46to60: 6, age60plus: 3 },
  },
  3: { // Priya Patel - Younger demographic, more telehealth
    gender: { male: 10, female: 12, other: 3 },
    modality: { inPerson: 10, telehealth: 15 },
    age: { age18to30: 12, age31to45: 8, age46to60: 4, age60plus: 1 },
  },
  4: { // James Kim - Couples focus (balanced gender), remote only
    gender: { male: 11, female: 10, other: 1 },
    modality: { inPerson: 0, telehealth: 22 },
    age: { age18to30: 6, age31to45: 10, age46to60: 5, age60plus: 1 },
  },
  5: { // Michael Johnson - Newer, smaller caseload
    gender: { male: 7, female: 11, other: 2 },
    modality: { inPerson: 12, telehealth: 8 },
    age: { age18to30: 9, age31to45: 6, age46to60: 4, age60plus: 1 },
  },
};

// Health status configuration
const HEALTH_CONFIG: Record<HealthStatus, { label: string; color: string; bg: string; glow: string; icon: string }> = {
  healthy: {
    label: 'Healthy',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.15)',
    glow: 'rgba(16, 185, 129, 0.4)',
    icon: '●',
  },
  attention: {
    label: 'Needs Attention',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.15)',
    glow: 'rgba(245, 158, 11, 0.4)',
    icon: '◐',
  },
  critical: {
    label: 'Critical',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.15)',
    glow: 'rgba(239, 68, 68, 0.4)',
    icon: '◉',
  },
};

// =============================================================================
// SMART DATE INPUT COMPONENT
// =============================================================================
// Accepts natural language date input like "jan 25 2025", "1/25/2025", "next monday"
// and converts it to a proper date. Premium editorial styling with refined feedback.

interface SmartDateInputProps {
  value: string; // ISO date string (YYYY-MM-DD) or empty
  onChange: (isoDate: string) => void;
  placeholder?: string;
  label?: string;
  hint?: string;
  allowEmpty?: boolean;
}

const SmartDateInput: React.FC<SmartDateInputProps> = ({
  value,
  onChange,
  placeholder = 'e.g., Jan 25 2025',
  label,
  hint,
  allowEmpty = false,
}) => {
  const [displayValue, setDisplayValue] = useState('');
  const [parsedDate, setParsedDate] = useState<Date | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isValid, setIsValid] = useState(true);

  const formatDisplayDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  useEffect(() => {
    if (value && !isFocused) {
      const date = new Date(value + 'T00:00:00');
      if (!isNaN(date.getTime())) {
        setDisplayValue(formatDisplayDate(date));
        setParsedDate(date);
        setIsValid(true);
      }
    } else if (!value && !isFocused) {
      setDisplayValue('');
      setParsedDate(null);
      setIsValid(true);
    }
  }, [value, isFocused]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setDisplayValue(input);

    if (!input.trim()) {
      setParsedDate(null);
      setIsValid(allowEmpty);
      if (allowEmpty) onChange('');
      return;
    }

    const parsed = chrono.parseDate(input);
    if (parsed) {
      setParsedDate(parsed);
      setIsValid(true);
      onChange(parsed.toISOString().split('T')[0]);
    } else {
      setParsedDate(null);
      setIsValid(false);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (parsedDate) {
      setDisplayValue(formatDisplayDate(parsedDate));
    } else if (!displayValue.trim() && allowEmpty) {
      setDisplayValue('');
    }
  };

  return (
    <div className="relative group">
      {label && (
        <label className="block text-[11px] font-medium text-stone-500 uppercase tracking-wider mb-1.5">
          {label}
          {hint && <span className="text-stone-400 normal-case tracking-normal font-normal"> {hint}</span>}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          style={{
            background: isFocused
              ? 'linear-gradient(180deg, #FFFBF5 0%, #FFF 100%)'
              : 'linear-gradient(180deg, #FAFAF9 0%, #FFF 100%)',
          }}
          className={`w-full pl-3 pr-9 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 outline-none ${
            !isValid && displayValue
              ? 'text-red-700 ring-1 ring-red-200 shadow-[0_0_0_3px_rgba(239,68,68,0.08)]'
              : isFocused
                ? 'text-stone-800 ring-1 ring-amber-300 shadow-[0_0_0_3px_rgba(251,191,36,0.12)]'
                : 'text-stone-700 ring-1 ring-stone-200 hover:ring-stone-300'
          }`}
        />
        {/* Status indicator with animation */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 transition-all duration-200">
          {displayValue && !isValid ? (
            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-red-500 text-xs font-bold">?</span>
            </div>
          ) : parsedDate ? (
            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center animate-[scale-in_0.15s_ease-out]">
              <Check size={12} className="text-emerald-600" strokeWidth={3} />
            </div>
          ) : (
            <Calendar size={15} className="text-stone-400 group-hover:text-stone-500 transition-colors" />
          )}
        </div>
      </div>
      {/* Floating preview tooltip */}
      {isFocused && parsedDate && displayValue !== formatDisplayDate(parsedDate) && (
        <div
          className="absolute left-0 right-0 z-20 mt-2 animate-[fade-slide-up_0.15s_ease-out]"
          style={{
            animation: 'fade-slide-up 0.15s ease-out',
          }}
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
            style={{
              background: 'linear-gradient(135deg, #1c1917 0%, #292524 100%)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.05) inset',
            }}
          >
            <span className="text-amber-400">→</span>
            <span className="text-white font-medium">{formatDisplayDate(parsedDate)}</span>
          </div>
        </div>
      )}
      {/* Error tooltip */}
      {isFocused && !isValid && displayValue && (
        <div className="absolute left-0 right-0 z-20 mt-2 animate-[fade-slide-up_0.15s_ease-out]">
          <div
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-red-50 border border-red-100"
            style={{ boxShadow: '0 4px 12px rgba(239,68,68,0.1)' }}
          >
            <span className="text-red-400 text-xs">✕</span>
            <span className="text-red-600">Try "Jan 25 2025" or "1/25/25"</span>
          </div>
        </div>
      )}
    </div>
  );
};

export const ClinicianDetailsTab: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { settings, updateSettings } = useSettings();
  const { clinicianGoalHistory } = settings;

  // Get clinician from URL if provided (for back navigation from session history)
  const clinicianIdFromUrl = searchParams.get('clinician');

  // State for selectors - null means no clinician selected yet
  const [selectedClinician, setSelectedClinician] = useState<typeof MOCK_CLINICIANS[0] | null>(() => {
    // Initialize from URL param if available
    if (clinicianIdFromUrl) {
      const found = MOCK_CLINICIANS.find(c => c.id === parseInt(clinicianIdFromUrl));
      return found || null;
    }
    return null;
  });
  const [timeSelection, setTimeSelection] = useState<TimeSelectorValue>('last-12-months');

  // Sync clinician selection with URL param when it changes
  useEffect(() => {
    if (clinicianIdFromUrl) {
      const found = MOCK_CLINICIANS.find(c => c.id === parseInt(clinicianIdFromUrl));
      if (found) {
        setSelectedClinician(found);
      }
    } else {
      // Clear selection when clinician param is removed (e.g., clicking "Details" in sidebar)
      setSelectedClinician(null);
    }
  }, [clinicianIdFromUrl]);

  // Dropdown states
  const [isClinicianDropdownOpen, setIsClinicianDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const clinicianDropdownMenuRef = useRef<HTMLDivElement>(null);
  const clinicianTriggerRef = useRef<HTMLButtonElement | null>(null);

  // Toggle dropdown and calculate position from the clicked button
  const handleClinicianDropdownToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Store ref to the clicked button for click-outside detection
    clinicianTriggerRef.current = event.currentTarget;

    if (isClinicianDropdownOpen) {
      setIsClinicianDropdownOpen(false);
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 12,
        left: rect.left,
      });
      setIsClinicianDropdownOpen(true);
    }
  };

  // Search states for clinician selection
  const [preSelectionSearch, setPreSelectionSearch] = useState('');
  const [dropdownSearch, setDropdownSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const preSelectionSearchRef = useRef<HTMLInputElement>(null);
  const dropdownSearchRef = useRef<HTMLInputElement>(null);

  // Expanded chart modal state
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Toggle for sessions view (monthly total vs weekly average)
  const [showWeeklyAvg, setShowWeeklyAvg] = useState(false);

  // Goal editor modal state - now handles one goal type at a time
  const [showGoalEditor, setShowGoalEditor] = useState(false);
  const [editingGoalType, setEditingGoalType] = useState<GoalType | null>(null);
  const [editingPeriodId, setEditingPeriodId] = useState<string | null>(null);
  const [goalFormData, setGoalFormData] = useState({
    startDate: '',
    endDate: '',
    value: '',
  });

  // AI Insight modal state
  const [showInsightModal, setShowInsightModal] = useState(false);

  // Goals Panel modal state
  const [showGoalsPanel, setShowGoalsPanel] = useState(false);
  const [goalsMode, setGoalsMode] = useState<'view' | 'helper'>('view');
  const [earningsGoalInput, setEarningsGoalInput] = useState('');

  // Track if we're in spotlight mode (clinician has been selected)
  const isSpotlightMode = selectedClinician !== null;

  // Close dropdown when clicking outside (matches TimeSelector pattern)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedMenu = clinicianDropdownMenuRef.current?.contains(target);
      const clickedTrigger = clinicianTriggerRef.current?.contains(target);

      // Only close if clicked outside BOTH the menu and the trigger
      // (clicking the trigger is handled by the toggle function)
      if (!clickedMenu && !clickedTrigger) {
        setIsClinicianDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle clinician selection - clean and immediate
  // The PageHeader component handles its own collapse/expand animations internally
  const handleClinicianSelect = (clinician: typeof MOCK_CLINICIANS[0]) => {
    // If clicking the already-selected clinician, just close the dropdown
    if (selectedClinician && clinician.id === selectedClinician.id) {
      setIsClinicianDropdownOpen(false);
      return;
    }

    // Update URL with clinician param
    const newParams = new URLSearchParams(searchParams);
    newParams.set('clinician', String(clinician.id));
    setSearchParams(newParams, { replace: true });

    // Close dropdown and clear search
    setIsClinicianDropdownOpen(false);
    setDropdownSearch('');

    // Set the selected clinician immediately
    // React will batch this update and the PageHeader will animate smoothly
    setSelectedClinician(clinician);
  };

  // Filter clinicians based on search query
  const filterClinicians = useCallback((query: string) => {
    if (!query.trim()) return MOCK_CLINICIANS;
    const searchTerms = query.toLowerCase().trim().split(/\s+/);
    return MOCK_CLINICIANS.filter(clinician => {
      const searchableText = `${clinician.name} ${clinician.role} ${clinician.title}`.toLowerCase();
      return searchTerms.every(term => searchableText.includes(term));
    });
  }, []);

  // Filtered clinicians for pre-selection view
  const filteredPreSelectionClinicians = useMemo(
    () => filterClinicians(preSelectionSearch),
    [preSelectionSearch, filterClinicians]
  );

  // Filtered clinicians for dropdown
  const filteredDropdownClinicians = useMemo(
    () => filterClinicians(dropdownSearch),
    [dropdownSearch, filterClinicians]
  );

  // Reset highlight when search changes or dropdown opens/closes
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [preSelectionSearch, dropdownSearch, isClinicianDropdownOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isClinicianDropdownOpen && dropdownSearchRef.current) {
      setTimeout(() => dropdownSearchRef.current?.focus(), 100);
    }
  }, [isClinicianDropdownOpen]);

  // Keyboard navigation for pre-selection search
  const handlePreSelectionKeyDown = useCallback((e: React.KeyboardEvent) => {
    const clinicians = filteredPreSelectionClinicians;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.min(prev + 1, clinicians.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && highlightedIndex >= 0 && highlightedIndex < clinicians.length) {
      e.preventDefault();
      handleClinicianSelect(clinicians[highlightedIndex]);
      setPreSelectionSearch('');
    } else if (e.key === 'Escape') {
      setPreSelectionSearch('');
      setHighlightedIndex(-1);
      preSelectionSearchRef.current?.blur();
    }
  }, [filteredPreSelectionClinicians, highlightedIndex, handleClinicianSelect]);

  // Keyboard navigation for dropdown search
  const handleDropdownKeyDown = useCallback((e: React.KeyboardEvent) => {
    const clinicians = filteredDropdownClinicians;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.min(prev + 1, clinicians.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && highlightedIndex >= 0 && highlightedIndex < clinicians.length) {
      e.preventDefault();
      handleClinicianSelect(clinicians[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setIsClinicianDropdownOpen(false);
      setDropdownSearch('');
    }
  }, [filteredDropdownClinicians, highlightedIndex, handleClinicianSelect]);

  // Highlight matching text in search results
  const highlightMatch = useCallback((text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.trim().split(/\s+/).join('|')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-amber-200/60 text-stone-900 rounded px-0.5">{part}</mark>
      ) : part
    );
  }, []);

  // Get the current period label for display in modals
  const getCurrentPeriodLabel = () => {
    const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    if (isAggregate(timeSelection)) {
      if (timeSelection === 'last-12-months') return 'Last 12 Months';
      if (timeSelection === 'last-6-months') return 'Last 6 Months';
      return 'Last 3 Months';
    }
    if (isMonthYear(timeSelection)) return `${MONTHS[timeSelection.month]} ${timeSelection.year}`;
    if (isYearOnly(timeSelection)) return `${timeSelection.year}`;
    return '';
  };

  // ==========================================================================
  // GOAL EDITOR HANDLERS (per-goal-type)
  // ==========================================================================

  // Goal type display names and units
  const goalTypeConfig: Record<GoalType, { label: string; unit: string; unitSuffix: string }> = {
    sessionGoal: { label: 'Session Goal', unit: 'sessions', unitSuffix: '/week' },
    clientGoal: { label: 'Caseload Goal', unit: 'clients', unitSuffix: '' },
    takeRate: { label: 'Take Rate', unit: '%', unitSuffix: '' },
  };

  // Get current value for a goal type
  const getCurrentGoalValue = (goalType: GoalType): number => {
    if (!masterClinicianData) return 0;
    switch (goalType) {
      case 'sessionGoal': return masterClinicianData.sessionGoal;
      case 'clientGoal': return masterClinicianData.clientGoal;
      case 'takeRate': return masterClinicianData.takeRate;
    }
  };

  // Get periods for a specific goal type
  const getPeriodsForGoalType = (goalType: GoalType): SingleGoalPeriod[] => {
    if (!masterClinicianData) return [];
    return getGoalTypePeriods(masterClinicianData.id, goalType, clinicianGoalHistory);
  };

  // Open goal editor for a specific goal type (new period)
  const openGoalEditor = (goalType: GoalType) => {
    if (!masterClinicianData) return;
    const today = new Date().toISOString().split('T')[0];
    setEditingGoalType(goalType);
    setEditingPeriodId(null);
    setGoalFormData({
      startDate: today,
      endDate: '',
      value: String(getCurrentGoalValue(goalType)),
    });
    setShowGoalEditor(true);
  };

  // Open goal editor to edit an existing period
  const openGoalEditorForEdit = (goalType: GoalType, period: SingleGoalPeriod) => {
    setEditingGoalType(goalType);
    setEditingPeriodId(period.id);
    setGoalFormData({
      startDate: period.startDate,
      endDate: period.endDate || '',
      value: String(period.value),
    });
    setShowGoalEditor(true);
  };

  // Save goal period (create new or update existing)
  const saveGoalPeriod = () => {
    if (!masterClinicianData || !editingGoalType) return;

    const value = editingGoalType === 'takeRate'
      ? parseFloat(goalFormData.value)
      : parseInt(goalFormData.value, 10);

    if (isNaN(value)) return;
    if (!goalFormData.startDate) return;

    const clinicianId = masterClinicianData.id;
    const clinicianHistory = clinicianGoalHistory[clinicianId] || {};
    const existingPeriods = clinicianHistory[editingGoalType] || [];

    const newPeriod: SingleGoalPeriod = {
      id: editingPeriodId || generateGoalPeriodId(),
      startDate: goalFormData.startDate,
      endDate: goalFormData.endDate || null,
      value,
    };

    let updatedPeriods: SingleGoalPeriod[];

    if (editingPeriodId) {
      // Update existing period
      updatedPeriods = existingPeriods.map(p =>
        p.id === editingPeriodId ? newPeriod : p
      );
    } else {
      // Adding new period - close the previous current period if exists
      updatedPeriods = existingPeriods.map(p => {
        if (p.endDate === null && newPeriod.endDate === null) {
          // Close the old current period at the day before new one starts
          const endDate = new Date(newPeriod.startDate);
          endDate.setDate(endDate.getDate() - 1);
          return { ...p, endDate: endDate.toISOString().split('T')[0] };
        }
        return p;
      });
      updatedPeriods.push(newPeriod);
    }

    // Sort by startDate descending
    updatedPeriods.sort((a, b) => b.startDate.localeCompare(a.startDate));

    const updatedHistory: ClinicianGoalHistory = {
      ...clinicianGoalHistory,
      [clinicianId]: {
        ...clinicianHistory,
        [editingGoalType]: updatedPeriods,
      },
    };

    updateSettings({ clinicianGoalHistory: updatedHistory });
    setShowGoalEditor(false);
    setEditingPeriodId(null);
    setEditingGoalType(null);
  };

  // Delete a goal period
  const deleteGoalPeriod = (goalType: GoalType, periodId: string) => {
    if (!masterClinicianData) return;

    const clinicianId = masterClinicianData.id;
    const clinicianHistory = clinicianGoalHistory[clinicianId] || {};
    const existingPeriods = clinicianHistory[goalType] || [];
    const updatedPeriods = existingPeriods.filter(p => p.id !== periodId);

    const updatedHistory: ClinicianGoalHistory = {
      ...clinicianGoalHistory,
      [clinicianId]: {
        ...clinicianHistory,
        [goalType]: updatedPeriods,
      },
    };

    updateSettings({ clinicianGoalHistory: updatedHistory });
  };

  // Close goal editor
  const closeGoalEditor = () => {
    setShowGoalEditor(false);
    setEditingPeriodId(null);
    setEditingGoalType(null);
  };

  // Format date for display
  const formatDateDisplay = (dateStr: string | null): string => {
    if (!dateStr) return 'Present';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Format value based on goal type
  const formatGoalValue = (goalType: GoalType, value: number): string => {
    const config = goalTypeConfig[goalType];
    if (goalType === 'takeRate') {
      return `${value}%`;
    }
    return `${value}${config.unitSuffix}`;
  };

  const healthConfig = selectedClinician ? HEALTH_CONFIG[selectedClinician.healthStatus] : null;

  // ==========================================================================
  // FORMAT HELPERS (defined first so they can be used in useMemo)
  // ==========================================================================

  const formatCurrencyShort = (value: number) => {
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
    return `$${value}`;
  };

  const formatCurrencyFull = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value}`;
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  // Format helpers that return value and suffix separately for better typography
  const formatCurrencyParts = (value: number): { value: string; suffix?: string } => {
    if (value >= 1000) return { value: `$${(value / 1000).toFixed(0)}`, suffix: 'K' };
    return { value: `$${value}` };
  };

  const formatSessionsParts = (sessionsPerMonth: number): { value: string; suffix: string } => {
    return { value: String(Math.round(sessionsPerMonth)), suffix: '/mo' };
  };

  const formatCaseloadParts = (active: number, capacity: number): { value: string; suffix: string } => {
    return { value: String(active), suffix: `/${capacity}` };
  };

  // ==========================================================================
  // FINANCIAL COMPUTED VALUES
  // ==========================================================================

  // Get financial data for selected clinician
  const financialData = selectedClinician ? CLINICIAN_FINANCIAL_DATA[selectedClinician.id] : null;

  // Bar chart data formatted for BarChart component
  const revenueBarData = useMemo(() => {
    if (!financialData) return [];
    return financialData.monthlyRevenue.map((item) => ({
      label: item.month,
      value: item.value,
    }));
  }, [financialData]);

  // Total revenue for the period
  const totalRevenue = useMemo(() => {
    if (!financialData) return 0;
    return financialData.monthlyRevenue.reduce((sum, item) => sum + item.value, 0);
  }, [financialData]);

  // Average monthly revenue
  const avgMonthlyRevenue = useMemo(() => {
    if (!financialData) return 0;
    return totalRevenue / financialData.monthlyRevenue.length;
  }, [financialData, totalRevenue]);

  // Months at or above goal
  const monthsAtGoal = useMemo(() => {
    if (!financialData) return 0;
    return financialData.monthlyRevenue.filter((item) => item.value >= financialData.revenueGoal).length;
  }, [financialData]);

  // Best month
  const bestMonth = useMemo(() => {
    if (!financialData || financialData.monthlyRevenue.length === 0) return { month: '-', value: 0 };
    return financialData.monthlyRevenue.reduce((best, item) =>
      item.value > best.value ? { month: item.month, value: item.value } : best,
      { month: financialData.monthlyRevenue[0].month, value: financialData.monthlyRevenue[0].value }
    );
  }, [financialData]);

  // Month-over-month change (last vs second to last)
  const momChange = useMemo(() => {
    if (!financialData || financialData.monthlyRevenue.length < 2) return 0;
    const lastMonth = financialData.monthlyRevenue[financialData.monthlyRevenue.length - 1].value;
    const prevMonth = financialData.monthlyRevenue[financialData.monthlyRevenue.length - 2].value;
    return prevMonth > 0 ? ((lastMonth - prevMonth) / prevMonth) * 100 : 0;
  }, [financialData]);

  // Revenue vs session comparison
  const revenuePerSessionDiff = useMemo(() => {
    if (!financialData) return 0;
    return financialData.avgRevenuePerSession - financialData.teamAvgPerSession;
  }, [financialData]);

  // Revenue insights for the chart
  const revenueInsights = useMemo(() => {
    if (!financialData) return [];
    return [
      {
        value: bestMonth.month,
        label: `Best (${formatCurrencyShort(bestMonth.value)})`,
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-600',
      },
      {
        value: `$${financialData.avgRevenuePerSession}`,
        label: `Per Session (${revenuePerSessionDiff >= 0 ? '+' : ''}$${revenuePerSessionDiff} vs avg)`,
        bgColor: 'bg-stone-100',
        textColor: 'text-stone-700',
      },
      {
        value: `${monthsAtGoal}/${financialData.monthlyRevenue.length}`,
        label: 'Hit Goal',
        bgColor: 'bg-stone-100',
        textColor: 'text-stone-700',
      },
    ];
  }, [financialData, bestMonth, monthsAtGoal, revenuePerSessionDiff]);

  // ==========================================================================
  // SESSION COMPUTED VALUES
  // ==========================================================================

  // Get session data for selected clinician
  const sessionData = selectedClinician ? CLINICIAN_SESSION_DATA[selectedClinician.id] : null;

  // Get master clinician data for goals (sessionGoal = weekly, clientGoal = caseload target)
  // Uses new goal history format with date ranges, falls back to defaults
  const masterClinicianData = useMemo(() => {
    if (!selectedClinician) return null;
    const master = MASTER_CLINICIANS.find(c => c.id === String(selectedClinician.id));
    if (!master) return null;
    // Get current goals (date = null means current)
    const goals = getClinicianGoalsForDate(
      master.id,
      null, // current
      { sessionGoal: master.sessionGoal, clientGoal: master.clientGoal, takeRate: master.takeRate },
      clinicianGoalHistory
    );
    return { ...master, ...goals };
  }, [selectedClinician, clinicianGoalHistory]);

  // Session bar chart data (monthly totals)
  const sessionBarData = useMemo(() => {
    if (!sessionData) return [];
    return sessionData.monthlySessions.map((item) => ({
      label: item.month,
      value: item.completed,
    }));
  }, [sessionData]);

  // Session bar chart data (weekly averages per month)
  const sessionWeeklyBarData = useMemo(() => {
    if (!sessionData) return [];
    return sessionData.monthlySessions.map((item) => ({
      label: item.month,
      value: Math.round(item.completed / 4.33),
    }));
  }, [sessionData]);

  // Weekly goal (monthly goal / 4.33 weeks)
  // Weekly session goal - use context override if available, otherwise fall back to sessionData
  const monthlySessionGoal = masterClinicianData?.sessionGoal ?? sessionData?.sessionGoal ?? 0;
  const weeklySessionGoal = useMemo(() => {
    return Math.round(monthlySessionGoal / 4.33);
  }, [monthlySessionGoal]);

  // Session totals
  const totalCompleted = useMemo(() => {
    if (!sessionData) return 0;
    return sessionData.monthlySessions.reduce((sum, item) => sum + item.completed, 0);
  }, [sessionData]);

  const totalBooked = useMemo(() => {
    if (!sessionData) return 0;
    return sessionData.monthlySessions.reduce((sum, item) => sum + item.booked, 0);
  }, [sessionData]);

  const totalClientCancelled = useMemo(() => {
    if (!sessionData) return 0;
    return sessionData.monthlySessions.reduce((sum, item) => sum + item.clientCancelled, 0);
  }, [sessionData]);

  const totalClinicianCancelled = useMemo(() => {
    if (!sessionData) return 0;
    return sessionData.monthlySessions.reduce((sum, item) => sum + item.clinicianCancelled, 0);
  }, [sessionData]);

  const totalLateCancelled = useMemo(() => {
    if (!sessionData) return 0;
    return sessionData.monthlySessions.reduce((sum, item) => sum + item.lateCancelled, 0);
  }, [sessionData]);

  const totalNoShow = useMemo(() => {
    if (!sessionData) return 0;
    return sessionData.monthlySessions.reduce((sum, item) => sum + item.noShow, 0);
  }, [sessionData]);

  // Show rate calculation
  const showRate = useMemo(() => {
    if (!totalBooked) return 0;
    return (totalCompleted / totalBooked) * 100;
  }, [totalCompleted, totalBooked]);

  // Months hitting session goal
  const sessionMonthsAtGoal = useMemo(() => {
    if (!sessionData) return 0;
    return sessionData.monthlySessions.filter((item) => item.completed >= monthlySessionGoal).length;
  }, [sessionData, monthlySessionGoal]);

  // Best session month
  const bestSessionMonth = useMemo(() => {
    if (!sessionData || sessionData.monthlySessions.length === 0) return { month: '-', value: 0 };
    return sessionData.monthlySessions.reduce((best, item) =>
      item.completed > best.value ? { month: item.month, value: item.completed } : best,
      { month: sessionData.monthlySessions[0].month, value: sessionData.monthlySessions[0].completed }
    );
  }, [sessionData]);

  // Attendance donut segments
  const attendanceSegments = useMemo(() => [
    { label: 'Attended', value: totalCompleted, color: '#10b981' },
    { label: 'Client Cancelled', value: totalClientCancelled, color: '#ef4444' },
    { label: 'Clinician Cancelled', value: totalClinicianCancelled, color: '#3b82f6' },
    { label: 'Late Cancelled', value: totalLateCancelled, color: '#f59e0b' },
    { label: 'No Show', value: totalNoShow, color: '#6b7280' },
  ], [totalCompleted, totalClientCancelled, totalClinicianCancelled, totalLateCancelled, totalNoShow]);

  // Clinician cancellations by month (bar chart data)
  const clinicianCancellationsBarData = useMemo(() => {
    if (!sessionData) return [];
    return sessionData.monthlySessions.map((item) => ({
      label: item.month,
      value: item.clinicianCancelled,
    }));
  }, [sessionData]);

  // Find the month with highest clinician cancellations
  const peakCancellationMonth = useMemo(() => {
    if (!sessionData || sessionData.monthlySessions.length === 0) return { month: '-', value: 0 };
    return sessionData.monthlySessions.reduce((peak, item) =>
      item.clinicianCancelled > peak.value ? { month: item.month, value: item.clinicianCancelled } : peak,
      { month: sessionData.monthlySessions[0].month, value: sessionData.monthlySessions[0].clinicianCancelled }
    );
  }, [sessionData]);

  // Cancellation breakdown stacked bar data (client + clinician cancellations)
  const cancellationBreakdownBarData = useMemo(() => {
    if (!sessionData) return [];
    return sessionData.monthlySessions.map((item) => ({
      label: item.month,
      clientCancelled: item.clientCancelled,
      clinicianCancelled: item.clinicianCancelled,
    }));
  }, [sessionData]);

  // Cancellation breakdown segments - premium gradients with warm/cool distinction
  const cancellationBreakdownSegments = useMemo(() => [
    { key: 'clientCancelled', label: 'Client', color: '#dc2626', gradient: 'linear-gradient(180deg, #fca5a5 0%, #dc2626 100%)' },
    { key: 'clinicianCancelled', label: 'Clinician', color: '#2563eb', gradient: 'linear-gradient(180deg, #93c5fd 0%, #2563eb 100%)' },
  ], []);

  const cancellationBreakdownStackOrder = useMemo(() => ['clinicianCancelled', 'clientCancelled'], []);

  // Total cancellations (client + clinician)
  const totalCancellations = useMemo(() => totalClientCancelled + totalClinicianCancelled, [totalClientCancelled, totalClinicianCancelled]);

  // Peak cancellation month (combined)
  const peakTotalCancellationMonth = useMemo(() => {
    if (!sessionData || sessionData.monthlySessions.length === 0) return { month: '-', value: 0 };
    return sessionData.monthlySessions.reduce((peak, item) => {
      const total = item.clientCancelled + item.clinicianCancelled;
      return total > peak.value ? { month: item.month, value: total } : peak;
    }, { month: sessionData.monthlySessions[0].month, value: sessionData.monthlySessions[0].clientCancelled + sessionData.monthlySessions[0].clinicianCancelled });
  }, [sessionData]);

  // Cancellation breakdown insights
  const cancellationBreakdownInsights = useMemo(() => {
    if (!sessionData) return [];
    const clientPercent = totalCancellations > 0 ? (totalClientCancelled / totalCancellations) * 100 : 0;
    return [
      {
        value: `${clientPercent.toFixed(0)}%`,
        label: 'Client Cancellations',
        bgColor: 'bg-rose-50',
        textColor: 'text-rose-600',
      },
      {
        value: peakTotalCancellationMonth.month,
        label: `Peak (${peakTotalCancellationMonth.value})`,
        bgColor: 'bg-stone-100',
        textColor: 'text-stone-700',
      },
      {
        value: totalCancellations.toString(),
        label: 'Total Cancelled',
        bgColor: 'bg-stone-100',
        textColor: 'text-stone-700',
      },
    ];
  }, [sessionData, totalClientCancelled, totalCancellations, peakTotalCancellationMonth]);

  // No-Show & Late Cancellation stacked bar data
  const noShowLateBarData = useMemo(() => {
    if (!sessionData) return [];
    return sessionData.monthlySessions.map((item) => ({
      label: item.month,
      lateCancelled: item.lateCancelled,
      noShow: item.noShow,
    }));
  }, [sessionData]);

  // No-Show & Late segments - amber for late, slate for no-show (distinct from cancellation colors)
  const noShowLateSegments = useMemo(() => [
    { key: 'lateCancelled', label: 'Late Cancel', color: '#d97706', gradient: 'linear-gradient(180deg, #fcd34d 0%, #d97706 100%)' },
    { key: 'noShow', label: 'No-Show', color: '#475569', gradient: 'linear-gradient(180deg, #94a3b8 0%, #475569 100%)' },
  ], []);

  const noShowLateStackOrder = useMemo(() => ['noShow', 'lateCancelled'], []);

  // Total no-shows + late cancellations
  const totalNoShowLate = useMemo(() => totalNoShow + totalLateCancelled, [totalNoShow, totalLateCancelled]);

  // Peak no-show/late month
  const peakNoShowLateMonth = useMemo(() => {
    if (!sessionData || sessionData.monthlySessions.length === 0) return { month: '-', value: 0 };
    return sessionData.monthlySessions.reduce((peak, item) => {
      const total = item.noShow + item.lateCancelled;
      return total > peak.value ? { month: item.month, value: total } : peak;
    }, { month: sessionData.monthlySessions[0].month, value: sessionData.monthlySessions[0].noShow + sessionData.monthlySessions[0].lateCancelled });
  }, [sessionData]);

  // No-Show & Late insights
  const noShowLateInsights = useMemo(() => {
    if (!sessionData) return [];
    const noShowPercent = totalNoShowLate > 0 ? (totalNoShow / totalNoShowLate) * 100 : 0;
    const noShowRate = totalBooked > 0 ? (totalNoShow / totalBooked) * 100 : 0;
    return [
      {
        value: `${noShowRate.toFixed(1)}%`,
        label: 'No-Show Rate',
        bgColor: noShowRate > 5 ? 'bg-rose-50' : 'bg-stone-100',
        textColor: noShowRate > 5 ? 'text-rose-600' : 'text-stone-700',
      },
      {
        value: peakNoShowLateMonth.month,
        label: `Peak (${peakNoShowLateMonth.value})`,
        bgColor: 'bg-stone-100',
        textColor: 'text-stone-700',
      },
      {
        value: totalNoShowLate.toString(),
        label: 'Total Lost',
        bgColor: 'bg-stone-100',
        textColor: 'text-stone-700',
      },
    ];
  }, [sessionData, totalNoShow, totalNoShowLate, totalBooked, peakNoShowLateMonth]);


  // Average weekly sessions
  const avgWeeklySessions = useMemo(() => {
    if (!sessionData) return 0;
    const avgMonthly = totalCompleted / sessionData.monthlySessions.length;
    return Math.round(avgMonthly / 4.33);
  }, [sessionData, totalCompleted]);

  // Session insights for chart
  const sessionInsights = useMemo(() => {
    if (!sessionData) return [];
    return [
      {
        value: bestSessionMonth.month,
        label: `Best (${bestSessionMonth.value})`,
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-600',
      },
      {
        value: `${avgWeeklySessions}/wk`,
        label: 'Avg Weekly',
        bgColor: 'bg-stone-100',
        textColor: 'text-stone-700',
      },
      {
        value: `${sessionMonthsAtGoal}/${sessionData.monthlySessions.length}`,
        label: 'Hit Goal',
        bgColor: 'bg-stone-100',
        textColor: 'text-stone-700',
      },
    ];
  }, [sessionData, bestSessionMonth, avgWeeklySessions, sessionMonthsAtGoal]);

  // ==========================================================================
  // CASELOAD COMPUTED VALUES
  // ==========================================================================

  // Get caseload data for selected clinician
  const caseloadData = selectedClinician ? CLINICIAN_CASELOAD_DATA[selectedClinician.id] : null;

  // Current caseload metrics (latest month)
  const currentActiveClients = useMemo(() => {
    if (!caseloadData) return 0;
    return caseloadData.monthlyCaseload[caseloadData.monthlyCaseload.length - 1]?.activeClients || 0;
  }, [caseloadData]);

  const currentCapacity = useMemo(() => {
    if (!caseloadData) return 0;
    return caseloadData.monthlyCaseload[caseloadData.monthlyCaseload.length - 1]?.capacity || 0;
  }, [caseloadData]);

  const caseloadUtilization = useMemo(() => {
    if (!currentCapacity) return 0;
    return (currentActiveClients / currentCapacity) * 100;
  }, [currentActiveClients, currentCapacity]);

  // Net client growth
  const totalNewClients = useMemo(() => {
    if (!caseloadData) return 0;
    return caseloadData.monthlyCaseload.reduce((sum, item) => sum + item.newClients, 0);
  }, [caseloadData]);

  const totalChurnedClients = useMemo(() => {
    if (!caseloadData) return 0;
    return caseloadData.monthlyCaseload.reduce((sum, item) => sum + item.churned, 0);
  }, [caseloadData]);

  const netClientGrowth = useMemo(() => totalNewClients - totalChurnedClients, [totalNewClients, totalChurnedClients]);

  // Client movement chart data for DivergingBarChart (kept for reference)
  const clientMovementData = useMemo(() => {
    if (!caseloadData) return [];
    return caseloadData.monthlyCaseload.map(item => ({
      label: item.month,
      positive: item.newClients,
      negative: item.churned,
    }));
  }, [caseloadData]);

  // Churned clients only - for DivergingBarChart (negative only)
  const churnedClientsData = useMemo(() => {
    if (!caseloadData) return [];
    return caseloadData.monthlyCaseload.map(item => ({
      label: item.month,
      positive: 0,
      negative: item.churned,
    }));
  }, [caseloadData]);

  // Get acquisition data for selected clinician
  const acquisitionData = selectedClinician ? CLINICIAN_ACQUISITION_DATA[selectedClinician.id] : null;

  // Acquisition chart data for GroupedBarChart
  const acquisitionChartData = useMemo(() => {
    if (!acquisitionData) return [];
    return acquisitionData.monthlyAcquisition.map(item => ({
      label: item.month,
      value1: item.consultsBooked,
      value2: item.clientsConverted,
    }));
  }, [acquisitionData]);

  // Acquisition metrics
  const totalConsultsBooked = useMemo(() => {
    if (!acquisitionData) return 0;
    return acquisitionData.monthlyAcquisition.reduce((sum, item) => sum + item.consultsBooked, 0);
  }, [acquisitionData]);

  const totalClientsConverted = useMemo(() => {
    if (!acquisitionData) return 0;
    return acquisitionData.monthlyAcquisition.reduce((sum, item) => sum + item.clientsConverted, 0);
  }, [acquisitionData]);

  const overallConversionRate = useMemo(() => {
    if (!totalConsultsBooked) return 0;
    return Math.round((totalClientsConverted / totalConsultsBooked) * 100);
  }, [totalConsultsBooked, totalClientsConverted]);

  // Conversion rate line chart data - clinician vs practice avg
  const conversionRateLineData = useMemo(() => {
    if (!acquisitionData) return [];
    // Practice average is ~60%
    const practiceAvg = 60;

    return acquisitionData.monthlyAcquisition.map(item => {
      const clinicianRate = item.consultsBooked > 0
        ? Math.round((item.clientsConverted / item.consultsBooked) * 100)
        : 0;
      return {
        month: item.month,
        clinician: clinicianRate,
        practice: practiceAvg,
      };
    });
  }, [acquisitionData]);

  // Toggle state for lost consults view (stage vs affordability)
  const [showLostByAffordability, setShowLostByAffordability] = useState(false);

  // Lost consults data - where in the pipeline are consults lost
  const lostConsultsData = useMemo(() => {
    if (!acquisitionData) return { byStage: [], byAffordability: [], totalLost: 0 };

    // Calculate total lost (consults - converted)
    const totalLost = totalConsultsBooked - totalClientsConverted;

    // Distribution by stage (mock data based on clinician performance)
    // Better converters lose fewer at each stage
    const conversionRate = overallConversionRate;
    const isHighPerformer = conversionRate >= 70;
    const isMidPerformer = conversionRate >= 50;

    const byStage = [
      {
        label: 'Pre-Consult',
        value: Math.round(totalLost * (isHighPerformer ? 0.15 : isMidPerformer ? 0.20 : 0.25)),
        color: '#f43f5e' // rose
      },
      {
        label: 'Pre-Intake',
        value: Math.round(totalLost * (isHighPerformer ? 0.25 : isMidPerformer ? 0.30 : 0.35)),
        color: '#f59e0b' // amber
      },
      {
        label: 'Pre-Paperwork',
        value: Math.round(totalLost * (isHighPerformer ? 0.35 : isMidPerformer ? 0.30 : 0.25)),
        color: '#8b5cf6' // violet
      },
      {
        label: 'No-Show Session',
        value: Math.round(totalLost * (isHighPerformer ? 0.25 : isMidPerformer ? 0.20 : 0.15)),
        color: '#64748b' // slate
      },
    ];

    // Distribution by affordability
    const byAffordability = [
      {
        label: 'Can Afford',
        value: Math.round(totalLost * (isHighPerformer ? 0.20 : isMidPerformer ? 0.25 : 0.30)),
        color: '#10b981' // emerald
      },
      {
        label: 'Maybe Can Pay',
        value: Math.round(totalLost * (isHighPerformer ? 0.45 : isMidPerformer ? 0.40 : 0.35)),
        color: '#f59e0b' // amber
      },
      {
        label: "Can't Afford",
        value: Math.round(totalLost * (isHighPerformer ? 0.35 : isMidPerformer ? 0.35 : 0.35)),
        color: '#ef4444' // red
      },
    ];

    return { byStage, byAffordability, totalLost };
  }, [acquisitionData, totalConsultsBooked, totalClientsConverted, overallConversionRate]);

  // Get clients for this clinician (typed to match ClientRosterCard)
  const clinicianClients: ClientData[] = selectedClinician ? CLINICIAN_CLIENTS[selectedClinician.id] || [] : [];

  // Get client monthly data for ExpandedChartView
  const clientMonthlyData = selectedClinician ? CLINICIAN_CLIENT_MONTHLY_DATA[selectedClinician.id] || [] : [];

  // Period options for dropdown (months)
  const periodOptions = useMemo(() => [
    { value: 'Jan', label: 'January' },
    { value: 'Feb', label: 'February' },
    { value: 'Mar', label: 'March' },
    { value: 'Apr', label: 'April' },
    { value: 'May', label: 'May' },
    { value: 'Jun', label: 'June' },
    { value: 'Jul', label: 'July' },
    { value: 'Aug', label: 'August' },
    { value: 'Sep', label: 'September' },
    { value: 'Oct', label: 'October' },
    { value: 'Nov', label: 'November' },
    { value: 'Dec', label: 'December' },
  ], []);

  // Revenue table columns
  const revenueTableColumns: DataTableColumn[] = useMemo(() => [
    { key: 'sessions', header: 'Sessions', align: 'right', sortable: true, format: (v) => String(v) },
    { key: 'revenue', header: 'Revenue', align: 'right', sortable: true, format: (v) => `$${Number(v).toLocaleString()}` },
    { key: 'avgPerSession', header: 'Avg/Session', align: 'right', sortable: true, format: (v) => `$${Number(v).toLocaleString()}` },
  ], []);

  // Get client revenue data for a specific month
  const getRevenueClientData = useCallback((month: string): { rows: ClientBreakdownRow[]; summary: Record<string, number>; summaryLabel: string } => {
    const rows: ClientBreakdownRow[] = clientMonthlyData
      .map(client => {
        const monthData = client.months[month];
        if (!monthData || monthData.sessions === 0) return null;
        const avgPerSession = monthData.sessions > 0 ? Math.round(monthData.revenue / monthData.sessions) : 0;
        return {
          id: client.clientId,
          name: client.clientName,
          values: {
            sessions: monthData.sessions,
            revenue: monthData.revenue,
            avgPerSession,
          },
        };
      })
      .filter((row): row is ClientBreakdownRow => row !== null)
      .sort((a, b) => (b.values.revenue as number) - (a.values.revenue as number));

    const totalSessions = rows.reduce((sum, r) => sum + (r.values.sessions as number), 0);
    const totalRevenue = rows.reduce((sum, r) => sum + (r.values.revenue as number), 0);
    const avgPerSession = totalSessions > 0 ? Math.round(totalRevenue / totalSessions) : 0;

    return {
      rows,
      summary: { sessions: totalSessions, revenue: totalRevenue, avgPerSession },
      summaryLabel: `Total: $${totalRevenue.toLocaleString()} from ${totalSessions} sessions`,
    };
  }, [clientMonthlyData]);

  // Sessions table columns
  const sessionsTableColumns: DataTableColumn[] = useMemo(() => [
    { key: 'sessions', header: 'Sessions', align: 'right', sortable: true, format: (v) => String(v) },
    { key: 'lastSeen', header: 'Last Seen', align: 'left', sortable: false },
    { key: 'nextAppt', header: 'Next Appt', align: 'left', sortable: false },
    { key: 'rebooked', header: 'Rebooked', align: 'center', sortable: true, format: (v) => v === 'Yes' ? '\u2713' : '\u26A0' },
  ], []);

  // Get client sessions data for a specific month
  const getSessionsClientData = useCallback((month: string): { rows: ClientBreakdownRow[]; summary: Record<string, string | number>; summaryLabel: string } => {
    const rows: ClientBreakdownRow[] = clientMonthlyData
      .map(client => {
        const monthData = client.months[month];
        if (!monthData || monthData.sessions === 0) return null;
        return {
          id: client.clientId,
          name: client.clientName,
          values: {
            sessions: monthData.sessions,
            lastSeen: monthData.lastSeen || '\u2014',
            nextAppt: monthData.nextAppt || '\u2014',
            rebooked: monthData.rebooked ? 'Yes' : 'No',
          },
          status: monthData.rebooked ? 'success' as const : 'warning' as const,
        };
      })
      .filter((row): row is ClientBreakdownRow => row !== null)
      .sort((a, b) => (b.values.sessions as number) - (a.values.sessions as number));

    const totalSessions = rows.reduce((sum, r) => sum + (r.values.sessions as number), 0);
    const rebookedCount = rows.filter(r => r.values.rebooked === 'Yes').length;

    return {
      rows,
      summary: { sessions: totalSessions, lastSeen: '', nextAppt: '', rebooked: `${rebookedCount}/${rows.length}` },
      summaryLabel: `Total: ${totalSessions} sessions \u00B7 ${rebookedCount} of ${rows.length} clients rebooked`,
    };
  }, [clientMonthlyData]);

  // Cancellations table columns
  const cancellationsTableColumns: DataTableColumn[] = useMemo(() => [
    { key: 'type', header: 'Type', align: 'left', sortable: true },
    { key: 'count', header: 'Count', align: 'right', sortable: true, format: (v) => String(v) },
  ], []);

  // Get client cancellation data for a specific month
  const getCancellationsClientData = useCallback((month: string): { rows: ClientBreakdownRow[]; summary: Record<string, string | number>; summaryLabel: string } => {
    // Get cancellation totals from sessionData for this month
    const monthData = sessionData?.monthlySessions.find(m => m.month === month);
    const clientCancelCount = monthData?.clientCancelled || 0;
    const clinicianCancelCount = monthData?.clinicianCancelled || 0;

    // Generate mock client names for cancellations
    const clientNames = [
      'Alex Thompson', 'Jordan Mitchell', 'Casey Williams', 'Morgan Davis', 'Riley Johnson',
      'Taylor Brown', 'Quinn Anderson', 'Avery Martinez', 'Cameron Wilson', 'Drew Taylor',
      'Jamie Parker', 'Reese Cooper', 'Skyler Reed', 'Dakota Price', 'Finley Hughes'
    ];

    const rows: ClientBreakdownRow[] = [];

    // Add client-initiated cancellations
    for (let i = 0; i < clientCancelCount; i++) {
      rows.push({
        id: `client-cancel-${month}-${i}`,
        name: clientNames[i % clientNames.length],
        values: {
          type: 'Client',
          count: 1,
        },
        status: 'warning' as const,
      });
    }

    // Add clinician-initiated cancellations
    for (let i = 0; i < clinicianCancelCount; i++) {
      rows.push({
        id: `clinician-cancel-${month}-${i}`,
        name: clientNames[(clientCancelCount + i) % clientNames.length],
        values: {
          type: 'Clinician',
          count: 1,
        },
        status: 'info' as const,
      });
    }

    const totalCancellations = clientCancelCount + clinicianCancelCount;

    return {
      rows,
      summary: { type: '', count: totalCancellations },
      summaryLabel: `Total: ${totalCancellations} cancellations (${clientCancelCount} client, ${clinicianCancelCount} clinician)`,
    };
  }, [sessionData]);

  // No-Show table columns
  const noShowTableColumns: DataTableColumn[] = useMemo(() => [
    { key: 'type', header: 'Type', align: 'left', sortable: true },
    { key: 'count', header: 'Count', align: 'right', sortable: true, format: (v) => String(v) },
  ], []);

  // Get no-show/late cancel data for a specific month
  const getNoShowClientData = useCallback((month: string): { rows: ClientBreakdownRow[]; summary: Record<string, string | number>; summaryLabel: string } => {
    // Get no-show/late cancel totals from sessionData for this month
    const monthData = sessionData?.monthlySessions.find(m => m.month === month);
    const lateCancelCount = monthData?.lateCancelled || 0;
    const noShowCount = monthData?.noShow || 0;

    // Generate mock client names
    const clientNames = [
      'Alex Thompson', 'Jordan Mitchell', 'Casey Williams', 'Morgan Davis', 'Riley Johnson',
      'Taylor Brown', 'Quinn Anderson', 'Avery Martinez', 'Cameron Wilson', 'Drew Taylor',
      'Jamie Parker', 'Reese Cooper', 'Skyler Reed', 'Dakota Price', 'Finley Hughes'
    ];

    const rows: ClientBreakdownRow[] = [];

    // Add late cancellations
    for (let i = 0; i < lateCancelCount; i++) {
      rows.push({
        id: `late-cancel-${month}-${i}`,
        name: clientNames[i % clientNames.length],
        values: {
          type: 'Late Cancel',
          count: 1,
        },
        status: 'warning' as const,
      });
    }

    // Add no-shows
    for (let i = 0; i < noShowCount; i++) {
      rows.push({
        id: `noshow-${month}-${i}`,
        name: clientNames[(lateCancelCount + i) % clientNames.length],
        values: {
          type: 'No-Show',
          count: 1,
        },
        status: 'error' as const,
      });
    }

    const totalMissed = lateCancelCount + noShowCount;
    const estimatedLost = totalMissed * (financialData?.avgRevenuePerSession || 150);

    return {
      rows,
      summary: { type: '', count: totalMissed },
      summaryLabel: `Total: ${totalMissed} missed · Est. $${estimatedLost.toLocaleString()} lost revenue`,
    };
  }, [sessionData, financialData]);

  // Attendance segment options for dropdown
  const attendanceSegmentOptions = useMemo(() => [
    { value: 'attended', label: 'Attended' },
    { value: 'client-cancelled', label: 'Client Cancelled' },
    { value: 'clinician-cancelled', label: 'Clinician Cancelled' },
    { value: 'late-cancel', label: 'Late Cancel' },
    { value: 'no-show', label: 'No-Show' },
  ], []);

  // Attendance table columns
  const attendanceTableColumns: DataTableColumn[] = useMemo(() => [
    { key: 'count', header: 'Count', align: 'right', sortable: true, format: (v) => String(v) },
    { key: 'total', header: 'Total Booked', align: 'right', sortable: true, format: (v) => String(v) },
    { key: 'rate', header: 'Rate', align: 'right', sortable: true, format: (v) => `${v}%` },
  ], []);

  // Get attendance client data for a specific segment
  const getAttendanceClientData = useCallback((segment: string): { rows: ClientBreakdownRow[]; summary: Record<string, string | number>; summaryLabel: string } => {
    // Get totals from attendanceSegments
    const segmentData = attendanceSegments.find(s => {
      const labelToValue: Record<string, string> = {
        'Attended': 'attended',
        'Client Cancelled': 'client-cancelled',
        'Clinician Cancelled': 'clinician-cancelled',
        'Late Cancelled': 'late-cancel',
        'No Show': 'no-show',
      };
      return labelToValue[s.label] === segment;
    });

    const segmentCount = segmentData?.value || 0;
    const totalBooked = attendanceSegments.reduce((sum, s) => sum + s.value, 0);

    // Generate mock client names
    const clientNames = [
      'Alex Thompson', 'Jordan Mitchell', 'Casey Williams', 'Morgan Davis', 'Riley Johnson',
      'Taylor Brown', 'Quinn Anderson', 'Avery Martinez', 'Cameron Wilson', 'Drew Taylor',
      'Jamie Parker', 'Reese Cooper', 'Skyler Reed', 'Dakota Price', 'Finley Hughes',
      'Robin Clarke', 'Sydney Wells', 'Blake Foster', 'Hayden Brooks', 'Peyton Murray'
    ];

    // Distribute the count among clients (some clients may have more than 1)
    const clientCounts: Record<string, number> = {};
    let remaining = segmentCount;
    let clientIndex = 0;

    while (remaining > 0 && clientIndex < clientNames.length) {
      const count = Math.min(remaining, Math.floor(Math.random() * 3) + 1);
      clientCounts[clientNames[clientIndex]] = count;
      remaining -= count;
      clientIndex++;
    }

    const rows: ClientBreakdownRow[] = Object.entries(clientCounts).map(([name, count], idx) => ({
      id: `${segment}-${idx}`,
      name,
      values: {
        count,
        total: Math.floor(count * (totalBooked / segmentCount) * (0.8 + Math.random() * 0.4)),
        rate: segment === 'attended' ? Math.floor(85 + Math.random() * 15) : Math.floor(5 + Math.random() * 20),
      },
      status: segment === 'attended' ? 'success' as const : segment === 'no-show' ? 'error' as const : 'warning' as const,
    })).sort((a, b) => (b.values.count as number) - (a.values.count as number));

    const avgRate = totalBooked > 0 ? Math.round((segmentCount / totalBooked) * 100) : 0;
    const segmentLabel = attendanceSegmentOptions.find(o => o.value === segment)?.label || segment;

    return {
      rows,
      summary: { count: segmentCount, total: totalBooked, rate: avgRate },
      summaryLabel: `Total: ${segmentCount} ${segmentLabel.toLowerCase()} (${avgRate}% of booked)`,
    };
  }, [attendanceSegments, attendanceSegmentOptions]);

  // ==========================================================================
  // CASELOAD/CAPACITY HELPERS (Post-MVP)
  // ==========================================================================

  // Caseload table columns
  const caseloadTableColumns: DataTableColumn[] = useMemo(() => [
    { key: 'status', header: 'Status', align: 'left', sortable: true },
    { key: 'frequency', header: 'Frequency', align: 'left', sortable: true },
    { key: 'totalSessions', header: 'Total Sessions', align: 'right', sortable: true, format: (v) => String(v) },
    { key: 'tenure', header: 'Client Since', align: 'right', sortable: true },
  ], []);

  // Get caseload client data for a specific month
  const getCaseloadClientData = useCallback((month: string): { rows: ClientBreakdownRow[]; summary: Record<string, string | number>; summaryLabel: string } => {
    // Get active clients for this month
    const rows: ClientBreakdownRow[] = clinicianClients
      .filter(client => client.status === 'active' || client.status === 'at-risk')
      .map(client => {
        const frequency = client.sessionsPerMonth >= 4 ? 'Weekly' :
                         client.sessionsPerMonth >= 2 ? 'Bi-weekly' :
                         client.sessionsPerMonth >= 1 ? 'Monthly' : 'Inconsistent';
        return {
          id: client.id,
          name: client.name,
          values: {
            status: client.status === 'at-risk' ? 'At Risk' : 'Active',
            frequency,
            totalSessions: client.totalSessions,
            tenure: client.tenure,
          },
          status: client.status === 'at-risk' ? 'warning' as const : 'success' as const,
        };
      })
      .sort((a, b) => (b.values.totalSessions as number) - (a.values.totalSessions as number));

    const activeCount = rows.filter(r => r.values.status === 'Active').length;
    const atRiskCount = rows.filter(r => r.values.status === 'At Risk').length;
    const monthData = caseloadData?.monthlyCaseload.find(m => m.month === month);
    const utilization = monthData && monthData.capacity > 0 ? Math.round((monthData.activeClients / monthData.capacity) * 100) : 0;

    return {
      rows,
      summary: { active: activeCount, atRisk: atRiskCount, utilization },
      summaryLabel: `${rows.length} clients · ${utilization}% utilization`,
    };
  }, [clinicianClients, caseloadData]);

  // ==========================================================================
  // CHURNED CLIENTS HELPERS (Post-MVP)
  // ==========================================================================

  // Churned table columns
  const churnedTableColumns: DataTableColumn[] = useMemo(() => [
    { key: 'lastSession', header: 'Last Session', align: 'left', sortable: true },
    { key: 'totalSessions', header: 'Total Sessions', align: 'right', sortable: true, format: (v) => String(v) },
    { key: 'tenure', header: 'Duration', align: 'right', sortable: true },
  ], []);

  // Get churned clients for a specific month
  const getChurnedClientData = useCallback((month: string): { rows: ClientBreakdownRow[]; summary: Record<string, string | number>; summaryLabel: string } => {
    // Generate churned client data based on monthly churn numbers
    const monthData = caseloadData?.monthlyCaseload.find(m => m.month === month);
    const churnCount = monthData?.churned || 0;

    // Create mock churned clients for this month
    const churnedNames = [
      'Alex Thompson', 'Jordan Mitchell', 'Casey Williams', 'Morgan Davis', 'Riley Johnson',
      'Taylor Brown', 'Quinn Anderson', 'Avery Martinez', 'Cameron Wilson', 'Drew Taylor'
    ];

    const rows: ClientBreakdownRow[] = Array.from({ length: churnCount }, (_, i) => ({
      id: `churned-${month}-${i}`,
      name: churnedNames[i % churnedNames.length],
      values: {
        lastSession: `${month} ${10 + i * 5}`,
        totalSessions: Math.floor(Math.random() * 20) + 3,
        tenure: `${Math.floor(Math.random() * 12) + 1} months`,
      },
      status: 'error' as const,
    }));

    return {
      rows,
      summary: { churned: churnCount },
      summaryLabel: `${churnCount} clients churned in ${month}`,
    };
  }, [caseloadData]);

  // ==========================================================================
  // SESSION FREQUENCY HELPERS (Post-MVP)
  // ==========================================================================

  // Frequency segment options for dropdown
  const frequencySegmentOptions = useMemo(() => [
    { value: 'weekly', label: 'Weekly (4+/mo)' },
    { value: 'biweekly', label: 'Bi-weekly (2-3/mo)' },
    { value: 'monthly', label: 'Monthly (1/mo)' },
    { value: 'inconsistent', label: 'Inconsistent' },
  ], []);

  // Frequency table columns
  const frequencyTableColumns: DataTableColumn[] = useMemo(() => [
    { key: 'sessionsPerMonth', header: 'Sessions/Mo', align: 'right', sortable: true, format: (v) => String(v) },
    { key: 'tenure', header: 'Duration', align: 'right', sortable: true },
    { key: 'revenuePerMonth', header: 'Revenue/Mo', align: 'right', sortable: true, format: (v) => `$${Number(v).toLocaleString()}` },
  ], []);

  // Get frequency client data
  const getFrequencyClientData = useCallback((frequency: string): { rows: ClientBreakdownRow[]; summary: Record<string, string | number>; summaryLabel: string } => {
    const frequencyRanges: Record<string, [number, number]> = {
      weekly: [4, Infinity],
      biweekly: [2, 3.99],
      monthly: [1, 1.99],
      inconsistent: [0, 0.99],
    };

    const [min, max] = frequencyRanges[frequency] || [0, Infinity];

    const rows: ClientBreakdownRow[] = clinicianClients
      .filter(client => client.sessionsPerMonth >= min && client.sessionsPerMonth <= max)
      .map(client => ({
        id: client.id,
        name: client.name,
        values: {
          sessionsPerMonth: client.sessionsPerMonth.toFixed(1),
          tenure: client.tenure,
          revenuePerMonth: client.sessionsPerMonth * 150, // Estimated revenue
        },
        status: frequency === 'weekly' ? 'success' as const :
               frequency === 'inconsistent' ? 'warning' as const : undefined,
      }))
      .sort((a, b) => Number(b.values.sessionsPerMonth) - Number(a.values.sessionsPerMonth));

    const totalRevenue = rows.reduce((sum, r) => sum + (r.values.revenuePerMonth as number), 0);
    const segmentLabel = frequencySegmentOptions.find(o => o.value === frequency)?.label || frequency;

    return {
      rows,
      summary: { clients: rows.length, totalRevenue },
      summaryLabel: `${rows.length} ${segmentLabel.toLowerCase()} clients · $${totalRevenue.toLocaleString()}/mo`,
    };
  }, [clinicianClients, frequencySegmentOptions]);

  // Client movement insights
  const clientMovementInsights = useMemo(() => {
    if (!caseloadData) return [];
    const avgNew = totalNewClients / caseloadData.monthlyCaseload.length;
    const avgChurn = totalChurnedClients / caseloadData.monthlyCaseload.length;
    return [
      {
        value: netClientGrowth >= 0 ? `+${netClientGrowth}` : `${netClientGrowth}`,
        label: 'Net Change',
        bgColor: netClientGrowth >= 0 ? 'bg-emerald-50' : 'bg-rose-50',
        textColor: netClientGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600',
      },
      {
        value: `+${avgNew.toFixed(1)}`,
        label: 'Avg New/mo',
        bgColor: 'bg-stone-100',
        textColor: 'text-stone-700',
      },
      {
        value: `-${avgChurn.toFixed(1)}`,
        label: 'Avg Churn/mo',
        bgColor: 'bg-stone-100',
        textColor: 'text-stone-700',
      },
    ];
  }, [caseloadData, netClientGrowth, totalNewClients, totalChurnedClients]);

  // Session frequency segments for donut chart
  const sessionFrequencySegments = useMemo(() => {
    if (!caseloadData?.sessionFrequency) return [];
    const { weekly, biweekly, monthly, inconsistent } = caseloadData.sessionFrequency;
    return [
      { label: 'Weekly', value: weekly, color: '#10b981' },      // Emerald - healthy
      { label: 'Bi-weekly', value: biweekly, color: '#3b82f6' }, // Blue - stable
      { label: 'Monthly', value: monthly, color: '#f59e0b' },    // Amber - lower engagement
      { label: 'Inconsistent', value: inconsistent, color: '#6b7280' }, // Gray - at risk
    ];
  }, [caseloadData]);

  // Total active clients from session frequency
  const totalSessionFrequencyClients = useMemo(() => {
    if (!caseloadData?.sessionFrequency) return 0;
    const { weekly, biweekly, monthly, inconsistent } = caseloadData.sessionFrequency;
    return weekly + biweekly + monthly + inconsistent;
  }, [caseloadData]);

  // Weekly engagement percentage
  const weeklyEngagementPercent = useMemo(() => {
    if (!caseloadData?.sessionFrequency || totalSessionFrequencyClients === 0) return 0;
    return Math.round((caseloadData.sessionFrequency.weekly / totalSessionFrequencyClients) * 100);
  }, [caseloadData, totalSessionFrequencyClients]);

  // Active clients bar chart data
  const activeClientsBarData = useMemo(() => {
    if (!caseloadData) return [];
    return caseloadData.monthlyCaseload.map(item => ({
      label: item.month,
      value: item.activeClients,
    }));
  }, [caseloadData]);

  // Capacity percentage bar chart data
  const capacityPercentageBarData = useMemo(() => {
    if (!caseloadData) return [];
    return caseloadData.monthlyCaseload.map(item => ({
      label: item.month,
      value: item.capacity > 0 ? Math.round((item.activeClients / item.capacity) * 100) : 0,
    }));
  }, [caseloadData]);

  // Toggle state for capacity chart view
  const [showCapacityPercentage, setShowCapacityPercentage] = useState(false);

  // Active clients insights
  const activeClientsInsights = useMemo(() => {
    if (!caseloadData) return [];
    const latestMonth = caseloadData.monthlyCaseload[caseloadData.monthlyCaseload.length - 1];
    const avgClients = Math.round(caseloadData.monthlyCaseload.reduce((sum, m) => sum + m.activeClients, 0) / caseloadData.monthlyCaseload.length);
    return [
      {
        value: latestMonth?.activeClients.toString() || '0',
        label: 'Current',
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-600',
      },
      {
        value: latestMonth?.capacity.toString() || '0',
        label: 'Capacity',
        bgColor: 'bg-stone-100',
        textColor: 'text-stone-700',
      },
      {
        value: avgClients.toString(),
        label: 'Avg/Month',
        bgColor: 'bg-stone-100',
        textColor: 'text-stone-700',
      },
    ];
  }, [caseloadData]);

  // Capacity percentage insights
  const capacityInsights = useMemo(() => {
    if (!caseloadData) return [];
    const avgCapacity = Math.round(caseloadData.monthlyCaseload.reduce((sum, m) =>
      sum + (m.capacity > 0 ? (m.activeClients / m.capacity) * 100 : 0), 0) / caseloadData.monthlyCaseload.length);
    return [
      {
        value: `${Math.round(caseloadUtilization)}%`,
        label: 'Current',
        bgColor: caseloadUtilization >= 90 ? 'bg-emerald-50' : caseloadUtilization >= 75 ? 'bg-amber-50' : 'bg-rose-50',
        textColor: caseloadUtilization >= 90 ? 'text-emerald-600' : caseloadUtilization >= 75 ? 'text-amber-600' : 'text-rose-600',
      },
      {
        value: `${avgCapacity}%`,
        label: 'Avg',
        bgColor: 'bg-stone-100',
        textColor: 'text-stone-700',
      },
      {
        value: `${caseloadData.practiceAvgUtilization}%`,
        label: 'Practice Avg',
        bgColor: 'bg-stone-100',
        textColor: 'text-stone-700',
      },
    ];
  }, [caseloadData, caseloadUtilization]);

  // ==========================================================================
  // RETENTION COMPUTED VALUES
  // ==========================================================================

  // Get retention data for selected clinician
  const retentionData = selectedClinician ? CLINICIAN_RETENTION_DATA[selectedClinician.id] : null;

  // Get compliance data for selected clinician
  const complianceData = selectedClinician ? CLINICIAN_COMPLIANCE_DATA[selectedClinician.id] : null;

  // Get demographics data for selected clinician
  const demographicsData = selectedClinician ? CLINICIAN_DEMOGRAPHICS[selectedClinician.id] : null;

  // ==========================================================================
  // CHURN TIMING HELPERS (Post-MVP)
  // ==========================================================================

  // Churn timing segment options
  const churnTimingSegmentOptions = useMemo(() => [
    { value: 'early', label: 'Early (<5 sessions)' },
    { value: 'medium', label: 'Medium (5-15 sessions)' },
    { value: 'late', label: 'Late (>15 sessions)' },
  ], []);

  // Churn timing table columns
  const churnTimingTableColumns: DataTableColumn[] = useMemo(() => [
    { key: 'totalSessions', header: 'Sessions', align: 'right', sortable: true, format: (v) => String(v) },
    { key: 'duration', header: 'Duration', align: 'right', sortable: true },
    { key: 'lastSeen', header: 'Last Seen', align: 'right', sortable: true },
  ], []);

  // Get churn timing client data
  const getChurnTimingClientData = useCallback((stage: string): { rows: ClientBreakdownRow[]; summary: Record<string, string | number>; summaryLabel: string } => {
    const stageCount = retentionData?.churnTiming?.[stage as keyof typeof retentionData.churnTiming] || 0;
    const sessionRanges: Record<string, [number, number]> = {
      early: [1, 4],
      medium: [5, 15],
      late: [16, 50],
    };

    const [min, max] = sessionRanges[stage] || [1, 50];
    const churnedNames = [
      'Sam Parker', 'Chris Lee', 'Jamie Chen', 'Pat Morgan', 'Kelly Adams',
      'Robin Clark', 'Dana White', 'Jesse Brown', 'Blake Davis', 'Reese Miller'
    ];

    const rows: ClientBreakdownRow[] = Array.from({ length: stageCount }, (_, i) => {
      const sessions = Math.floor(Math.random() * (max - min + 1)) + min;
      const durationMonths = stage === 'early' ? Math.floor(Math.random() * 2) + 1 :
                            stage === 'medium' ? Math.floor(Math.random() * 6) + 2 :
                            Math.floor(Math.random() * 12) + 6;
      return {
        id: `churn-${stage}-${i}`,
        name: churnedNames[i % churnedNames.length],
        values: {
          totalSessions: sessions,
          duration: `${durationMonths} months`,
          lastSeen: ['Oct 15', 'Nov 3', 'Nov 20', 'Dec 5', 'Dec 12'][i % 5],
        },
        status: stage === 'early' ? 'error' as const :
               stage === 'medium' ? 'warning' as const : undefined,
      };
    });

    const avgSessions = rows.length > 0
      ? Math.round(rows.reduce((sum, r) => sum + (r.values.totalSessions as number), 0) / rows.length)
      : 0;
    const segmentLabel = churnTimingSegmentOptions.find(o => o.value === stage)?.label || stage;

    return {
      rows,
      summary: { churned: stageCount, avgSessions },
      summaryLabel: `${stageCount} ${segmentLabel.toLowerCase()} churners · Avg ${avgSessions} sessions`,
    };
  }, [retentionData, churnTimingSegmentOptions]);

  // ==========================================================================
  // OUTSTANDING NOTES HELPERS (Post-MVP)
  // ==========================================================================

  // Notes status options
  const notesStatusOptions = useMemo(() => [
    { value: 'overdue', label: 'Overdue' },
    { value: 'due-soon', label: 'Due within 48h' },
  ], []);

  // Notes table columns
  const notesTableColumns: DataTableColumn[] = useMemo(() => [
    { key: 'sessionDate', header: 'Session Date', align: 'left', sortable: true },
    { key: 'sessionType', header: 'Type', align: 'left', sortable: true },
    { key: 'daysOverdue', header: 'Days Overdue', align: 'right', sortable: true, format: (v) => `${v}d` },
  ], []);

  // Get notes data by status
  const getNotesClientData = useCallback((status: string): { rows: ClientBreakdownRow[]; summary: Record<string, string | number>; summaryLabel: string } => {
    if (status === 'overdue') {
      const rows: ClientBreakdownRow[] = (complianceData?.overdueNotesList || []).map(note => ({
        id: note.id,
        name: note.clientName,
        values: {
          sessionDate: note.sessionDate,
          sessionType: note.sessionType,
          daysOverdue: note.daysOverdue,
        },
        status: note.daysOverdue >= 7 ? 'error' as const : 'warning' as const,
      }));

      return {
        rows,
        summary: { count: rows.length },
        summaryLabel: `${rows.length} overdue notes`,
      };
    } else {
      // Due soon - generate mock data based on dueWithin48h count
      const dueCount = complianceData?.dueWithin48h || 0;
      const clientNames = ['Alex Kim', 'Jordan Lee', 'Taylor Chen', 'Morgan Wu', 'Casey Park'];

      const rows: ClientBreakdownRow[] = Array.from({ length: dueCount }, (_, i) => ({
        id: `due-${i}`,
        name: clientNames[i % clientNames.length],
        values: {
          sessionDate: ['Dec 10', 'Dec 10', 'Dec 11', 'Dec 11', 'Dec 11'][i % 5],
          sessionType: ['Individual', 'Couples', 'Individual'][i % 3],
          daysOverdue: 0,
        },
        status: 'warning' as const,
      }));

      return {
        rows,
        summary: { count: rows.length },
        summaryLabel: `${rows.length} notes due within 48h`,
      };
    }
  }, [complianceData]);

  // ==========================================================================
  // RETURN RATE HELPERS (Post-MVP)
  // ==========================================================================

  // Return rate milestone options
  const returnRateMilestoneOptions = useMemo(() => [
    { value: 'mo3', label: '3 Month' },
    { value: 'mo6', label: '6 Month' },
    { value: 'mo9', label: '9 Month' },
    { value: 'mo12', label: '12 Month' },
  ], []);

  // Return rate table columns
  const returnRateTableColumns: DataTableColumn[] = useMemo(() => [
    { key: 'startDate', header: 'Started', align: 'left', sortable: true },
    { key: 'totalSessions', header: 'Sessions', align: 'right', sortable: true, format: (v) => String(v) },
    { key: 'stillActive', header: 'Status', align: 'right', sortable: true },
  ], []);

  // Get return rate data for a milestone
  const getReturnRateClientData = useCallback((milestone: string): { rows: ClientBreakdownRow[]; summary: Record<string, string | number>; summaryLabel: string } => {
    const milestoneRates: Record<string, number> = {
      mo3: retentionData?.month3ReturnRate || 0,
      mo6: retentionData?.month6ReturnRate || 0,
      mo9: retentionData?.month9ReturnRate || 0,
      mo12: retentionData?.oneYearReturnRate || 0,
    };

    const rate = milestoneRates[milestone] || 0;
    const totalClients = clinicianClients.length;
    const activeCount = Math.round((rate / 100) * totalClients);
    const churnedCount = totalClients - activeCount;

    // Show a mix of active and churned clients
    const clientNames = [
      'Emma Wilson', 'Liam Johnson', 'Olivia Brown', 'Noah Davis', 'Ava Miller',
      'Sophia Anderson', 'Jackson Taylor', 'Isabella Thomas', 'Lucas Garcia', 'Mia Martinez'
    ];

    const rows: ClientBreakdownRow[] = [
      ...Array.from({ length: Math.min(activeCount, 5) }, (_, i) => ({
        id: `active-${milestone}-${i}`,
        name: clientNames[i],
        values: {
          startDate: ['Jul 2023', 'Aug 2023', 'Sep 2023', 'Oct 2023', 'Nov 2023'][i],
          totalSessions: Math.floor(Math.random() * 30) + 10,
          stillActive: 'Active',
        },
        status: 'success' as const,
      })),
      ...Array.from({ length: Math.min(churnedCount, 3) }, (_, i) => ({
        id: `churned-${milestone}-${i}`,
        name: clientNames[5 + i],
        values: {
          startDate: ['Jul 2023', 'Aug 2023', 'Sep 2023'][i],
          totalSessions: Math.floor(Math.random() * 15) + 3,
          stillActive: 'Churned',
        },
        status: 'error' as const,
      })),
    ];

    const practiceRates: Record<string, number> = {
      mo3: retentionData?.practiceAvgMonth3Return || 0,
      mo6: retentionData?.practiceAvgMonth6Return || 0,
      mo9: retentionData?.practiceAvgMonth9Return || 0,
      mo12: retentionData?.practiceAvgOneYearReturn || 0,
    };

    const practiceRate = practiceRates[milestone] || 0;
    const diff = rate - practiceRate;
    const milestoneLabel = returnRateMilestoneOptions.find(o => o.value === milestone)?.label || milestone;

    return {
      rows,
      summary: { rate, practiceRate, diff },
      summaryLabel: `${rate}% retention at ${milestoneLabel} (${diff >= 0 ? '+' : ''}${diff}% vs practice)`,
    };
  }, [retentionData, clinicianClients, returnRateMilestoneOptions]);

  // Calculate churn timing totals for donut chart
  const churnTimingTotals = useMemo(() => {
    if (!retentionData?.churnTiming) return { early: 0, medium: 0, late: 0, total: 0 };
    const { early, medium, late } = retentionData.churnTiming;
    return { early, medium, late, total: early + medium + late };
  }, [retentionData]);

  // Retention comparison table columns and rows
  const retentionTableColumns = [
    { key: 'clinician', header: selectedClinician?.name.split(' ')[0] || 'Clinician', align: 'right' as const },
    { key: 'practice', header: 'Practice Avg', align: 'right' as const },
    { key: 'diff', header: 'Diff', align: 'right' as const, isTotals: true },
  ];

  const retentionTableRows = useMemo(() => {
    if (!retentionData) return [];
    const rebookDiff = retentionData.currentRebookRate - retentionData.practiceAvgRebookRate;
    const sessionsDiff = retentionData.avgSessionsBeforeChurn - retentionData.practiceAvgSessionsBeforeChurn;

    return [
      {
        id: 'rebook',
        label: 'Rebook Rate',
        values: {
          clinician: `${retentionData.currentRebookRate}%`,
          practice: `${retentionData.practiceAvgRebookRate}%`,
          diff: rebookDiff >= 0 ? `+${rebookDiff}%` : `${rebookDiff}%`,
        },
        valueColor: rebookDiff >= 0 ? 'text-emerald-600' : 'text-rose-600',
        indicator: { color: rebookDiff >= 0 ? '#10b981' : '#f43f5e' },
      },
      {
        id: 'sessions',
        label: 'Avg Sessions Before Churn',
        values: {
          clinician: retentionData.avgSessionsBeforeChurn.toFixed(1),
          practice: retentionData.practiceAvgSessionsBeforeChurn.toFixed(1),
          diff: sessionsDiff >= 0 ? `+${sessionsDiff.toFixed(1)}` : sessionsDiff.toFixed(1),
        },
        valueColor: sessionsDiff >= 0 ? 'text-emerald-600' : 'text-rose-600',
        indicator: { color: sessionsDiff >= 0 ? '#10b981' : '#f43f5e' },
      },
    ];
  }, [retentionData, selectedClinician]);

  // Retention curve data for line chart
  // Starts at Month 1 = 100% (all clients who had their first session)
  const retentionCurveData = useMemo(() => {
    if (!retentionData) return [];
    return [
      {
        month: 'Mo 1',
        clinician: 100,
        practice: 100,
        topPerformer: 100,
      },
      {
        month: 'Mo 3',
        clinician: retentionData.month3ReturnRate,
        practice: retentionData.practiceAvgMonth3Return,
        topPerformer: retentionData.topPerformerMonth3Return,
      },
      {
        month: 'Mo 6',
        clinician: retentionData.month6ReturnRate,
        practice: retentionData.practiceAvgMonth6Return,
        topPerformer: retentionData.topPerformerMonth6Return,
      },
      {
        month: 'Mo 9',
        clinician: retentionData.month9ReturnRate,
        practice: retentionData.practiceAvgMonth9Return,
        topPerformer: retentionData.topPerformerMonth9Return,
      },
      {
        month: 'Mo 12',
        clinician: retentionData.oneYearReturnRate,
        practice: retentionData.practiceAvgOneYearReturn,
        topPerformer: retentionData.topPerformerOneYearReturn,
      },
    ];
  }, [retentionData]);

  // ==========================================================================
  // DYNAMIC AI INSIGHT GENERATOR
  // ==========================================================================
  // Generates context-aware insights based on health status and specific metrics

  const dynamicInsight = useMemo(() => {
    if (!selectedClinician || !sessionData || !caseloadData || !retentionData || !complianceData) {
      return selectedClinician?.insight || '';
    }

    const healthStatus = selectedClinician.healthStatus;
    const issues: string[] = [];
    const strengths: string[] = [];

    // Analyze key metrics
    const rebookRate = retentionData.currentRebookRate;
    const practiceAvgRebook = retentionData.practiceAvgRebookRate;
    const overdueNotes = complianceData.overdueNotes;
    const avgWeekly = avgWeeklySessions;
    const goalWeekly = masterClinicianData?.sessionGoal ? Math.round(masterClinicianData.sessionGoal / 4.33) : 20;
    const sessionGoalPercent = goalWeekly > 0 ? Math.round((avgWeekly / goalWeekly) * 100) : 100;
    const clientGoal = masterClinicianData?.clientGoal || 30;
    const caseloadPercent = Math.round((currentActiveClients / clientGoal) * 100);
    const conversionRate = overallConversionRate;
    const practiceAvgConversion = 60; // Practice average
    const month3Retention = retentionData.month3ReturnRate;
    const practiceMonth3 = retentionData.practiceAvgMonth3Return;

    // Calculate trends (comparing last 3 months to previous 3)
    const recentSessions = sessionData.monthlySessions.slice(-3);
    const previousSessions = sessionData.monthlySessions.slice(-6, -3);
    const recentAvg = recentSessions.reduce((sum, m) => sum + m.completed, 0) / 3;
    const previousAvg = previousSessions.length > 0
      ? previousSessions.reduce((sum, m) => sum + m.completed, 0) / 3
      : recentAvg;
    const sessionTrend = previousAvg > 0 ? Math.round(((recentAvg - previousAvg) / previousAvg) * 100) : 0;

    // Identify issues (ordered by severity)
    if (overdueNotes >= 15) {
      issues.push(`${overdueNotes} notes overdue—compliance risk`);
    } else if (overdueNotes >= 8) {
      issues.push(`${overdueNotes} notes need attention`);
    }

    if (rebookRate < practiceAvgRebook - 10) {
      issues.push(`Rebook rate ${rebookRate}% is ${practiceAvgRebook - rebookRate}% below average`);
    } else if (rebookRate < practiceAvgRebook - 5) {
      issues.push(`Rebook rate slightly below practice average`);
    }

    if (sessionGoalPercent < 70) {
      issues.push(`Session volume at ${sessionGoalPercent}% of goal`);
    } else if (sessionGoalPercent < 85) {
      issues.push(`Sessions trending ${100 - sessionGoalPercent}% below target`);
    }

    if (caseloadPercent < 70) {
      issues.push(`Caseload at ${caseloadPercent}% capacity`);
    }

    if (conversionRate < practiceAvgConversion - 15) {
      issues.push(`Conversion rate ${conversionRate}% needs improvement`);
    }

    if (month3Retention < practiceMonth3 - 10) {
      issues.push(`Early retention dropping at month 3`);
    }

    if (sessionTrend < -15) {
      issues.push(`Session volume down ${Math.abs(sessionTrend)}% vs prior quarter`);
    }

    // Identify strengths
    if (rebookRate >= practiceAvgRebook + 5) {
      strengths.push(`Rebook rate ${rebookRate}% exceeds practice by ${rebookRate - practiceAvgRebook}%`);
    }

    if (sessionGoalPercent >= 105) {
      strengths.push(`Exceeding session goal by ${sessionGoalPercent - 100}%`);
    } else if (sessionGoalPercent >= 95) {
      strengths.push(`Consistently hitting session targets`);
    }

    if (caseloadPercent >= 95) {
      strengths.push(`Caseload at full capacity`);
    } else if (caseloadPercent >= 85) {
      strengths.push(`Strong caseload utilization`);
    }

    if (conversionRate >= practiceAvgConversion + 10) {
      strengths.push(`${conversionRate}% conversion rate—top performer`);
    }

    if (overdueNotes <= 2) {
      strengths.push(`Excellent note compliance`);
    }

    if (month3Retention >= practiceMonth3 + 8) {
      strengths.push(`Strong early client retention`);
    }

    if (sessionTrend > 10) {
      strengths.push(`Session volume up ${sessionTrend}% this quarter`);
    }

    // Generate verbose, narrative insight based on health status
    const clinicianFirstName = selectedClinician.name.split(' ')[0];

    if (healthStatus === 'critical') {
      // Critical: Urgent, detailed narrative about what's wrong and what to do
      if (issues.length >= 3) {
        return `${clinicianFirstName} requires immediate attention. Primary concerns include ${issues[0].toLowerCase()}, ${issues[1].toLowerCase()}, and ${issues[2].toLowerCase()}. This combination of factors suggests systemic challenges that need to be addressed through a structured improvement plan. Recommend scheduling a one-on-one within the next 48 hours to discuss workload, support needs, and establish clear milestones for the next 30 days.`;
      } else if (issues.length >= 2) {
        return `${clinicianFirstName}'s performance metrics indicate urgent intervention is needed. Specifically, ${issues[0].toLowerCase()} and ${issues[1].toLowerCase()}. These issues are compounding and affecting overall productivity. A direct conversation this week is essential to understand root causes and create an actionable recovery plan with weekly check-ins.`;
      } else if (issues.length === 1) {
        return `${clinicianFirstName} has a critical flag that needs immediate attention: ${issues[0].toLowerCase()}. While other metrics may be acceptable, this issue alone warrants a focused intervention. Schedule time this week to discuss barriers and develop a concrete plan to address this within the next two weeks.`;
      }
      return `${clinicianFirstName}'s overall performance has fallen below acceptable thresholds across multiple dimensions. A comprehensive review is recommended to identify systemic issues and create a structured improvement plan with clear milestones and regular accountability check-ins.`;
    }

    if (healthStatus === 'attention') {
      // Attention: Balanced narrative acknowledging concerns while noting positives
      const mainIssue = issues[0] || 'some metrics are trending below expectations';
      if (strengths.length > 0 && issues.length > 1) {
        return `${clinicianFirstName} shows mixed performance this period. On the concern side, ${mainIssue.toLowerCase()} and ${issues[1].toLowerCase()}. However, there are bright spots: ${strengths[0].toLowerCase()}. The recommended approach is to have a supportive check-in focused on understanding what's driving the dip and whether additional resources or schedule adjustments could help. Monitor weekly for the next month.`;
      } else if (strengths.length > 0) {
        return `${clinicianFirstName} has an area requiring attention: ${mainIssue.toLowerCase()}. That said, ${strengths[0].toLowerCase()}, which demonstrates underlying capability. This suggests the issue may be situational rather than systemic. A brief touchpoint to understand context and offer support would be valuable. Keep monitoring over the next 2-3 weeks.`;
      }
      return `${clinicianFirstName} needs monitoring. ${mainIssue.charAt(0).toUpperCase() + mainIssue.slice(1)}${issues[1] ? `, and ${issues[1].toLowerCase()}` : ''}. While not yet critical, these trends warrant attention before they escalate. Consider a casual check-in to assess workload and well-being, with follow-up in two weeks to review progress.`;
    }

    // Healthy: Celebratory, detailed narrative about what's going well
    if (strengths.length >= 3) {
      const watchNote = issues.length > 0 ? ` One minor area to keep an eye on: ${issues[0].toLowerCase()}.` : '';
      return `${clinicianFirstName} is performing exceptionally well. ${strengths[0]}, ${strengths[1].toLowerCase()}, and ${strengths[2].toLowerCase()}. This consistent excellence across multiple dimensions makes ${clinicianFirstName} a valuable team contributor and potential mentor for newer clinicians.${watchNote}`;
    } else if (strengths.length >= 2) {
      const watchNote = issues.length > 0 ? ` Minor watch item: ${issues[0].toLowerCase()}.` : '';
      return `${clinicianFirstName} continues to deliver strong results. Notably, ${strengths[0].toLowerCase()} and ${strengths[1].toLowerCase()}. This sustained performance reflects good clinical practices and client relationship management. Keep up the positive momentum.${watchNote}`;
    } else if (strengths.length === 1) {
      return `${clinicianFirstName} is performing well overall, with particular strength in: ${strengths[0].toLowerCase()}. All other metrics are within healthy ranges. Continue current approach and consider sharing successful strategies with the broader team.`;
    }

    return `${clinicianFirstName} is maintaining solid, consistent performance across all key metrics. No immediate concerns or interventions needed. Continue regular supervision cadence and acknowledge steady contribution to the practice.`;
  }, [
    selectedClinician, sessionData, caseloadData, retentionData, complianceData,
    avgWeeklySessions, masterClinicianData, currentActiveClients, overallConversionRate
  ]);

  return (
    <>
      {/* =================================================================
          HEADER - Using PageHeader with spotlight mode support
          ================================================================= */}
      <PageHeader
        accent="blue"
        showGridPattern
        size="hero"
        sticky={isSpotlightMode && !!selectedClinician}
        collapsible={isSpotlightMode && !!selectedClinician}
        collapseThreshold={80}
        glowColor={selectedClinician?.color}
        title={isSpotlightMode && selectedClinician ? '' : 'Clinician Details'}
        collapsedContent={isSpotlightMode && selectedClinician && healthConfig ? (
          /* ═══════════════════════════════════════════════════════════════════════
             COLLAPSED HEADER - Refined compact layout

             LEFT:  Avatar → Name (dropdown) → Time Selector
             RIGHT: Role → Title (LCSW) → Roster btn → Sessions btn
             ═══════════════════════════════════════════════════════════════════════ */
          <div className="flex items-center justify-between gap-4">

            {/* ─────────────────────────────────────────────────────────────────────
                LEFT SECTION: Avatar + Name + Time Selector
                ───────────────────────────────────────────────────────────────────── */}
            <div className="flex items-center gap-4 min-w-0">

              {/* 1. Avatar */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${selectedClinician.color} 0%, ${selectedClinician.color}cc 100%)`,
                  boxShadow: `0 4px 16px ${selectedClinician.color}40, inset 0 1px 0 rgba(255,255,255,0.15)`,
                }}
              >
                {selectedClinician.initials}
              </div>

              {/* 2. Name with dropdown */}
              <div className="relative z-[100]">
                <button
                  onClick={handleClinicianDropdownToggle}
                  className="group flex items-center gap-2.5 transition-all duration-200"
                >
                  <h2
                    className="text-xl sm:text-2xl text-white font-semibold tracking-tight"
                    style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                  >
                    {selectedClinician.name}
                  </h2>
                  {/* Circular dropdown indicator - matches TimeSelector header variant */}
                  <span
                    className={`
                      flex items-center justify-center flex-shrink-0
                      w-6 h-6 sm:w-7 sm:h-7 rounded-full
                      transition-all duration-300
                      ${isClinicianDropdownOpen
                        ? 'border'
                        : 'bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/20'
                      }
                    `}
                    style={isClinicianDropdownOpen ? {
                      background: `${selectedClinician.color}20`,
                      borderColor: `${selectedClinician.color}40`,
                    } : undefined}
                  >
                    <ChevronDown
                      size={14}
                      strokeWidth={2}
                      className={`
                        transition-all duration-300
                        ${isClinicianDropdownOpen
                          ? 'rotate-180'
                          : 'text-white/50 group-hover:text-white/70'
                        }
                      `}
                      style={isClinicianDropdownOpen ? { color: selectedClinician.color } : undefined}
                    />
                  </span>
                </button>
              </div>

              {/* 3. Time Selector - uses header variant styling, same dropdown */}
              <div className="hidden md:block">
                <TimeSelector
                  value={timeSelection}
                  onChange={setTimeSelection}
                  showAggregateOption={true}
                  variant="header"
                  className="[&_span]:!text-lg [&_span]:sm:!text-xl [&_button]:!gap-2"
                />
              </div>
            </div>

            {/* ─────────────────────────────────────────────────────────────────────
                RIGHT SECTION: Role + Title + Action Buttons
                ───────────────────────────────────────────────────────────────────── */}
            <div className="flex items-center gap-3 flex-shrink-0">

              {/* Role & Title badges */}
              <div className="hidden lg:flex items-center gap-2">
                {/* Role badge */}
                <div
                  className="px-3 py-1.5 rounded-lg"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <span className="text-xs font-medium text-white/70">
                    {selectedClinician.role}
                  </span>
                </div>

                {/* Title abbreviation badge */}
                <div
                  className="px-2.5 py-1.5 rounded-lg"
                  style={{
                    background: `${selectedClinician.color}20`,
                    border: `1px solid ${selectedClinician.color}30`,
                  }}
                >
                  <span
                    className="text-xs font-semibold tracking-wide"
                    style={{ color: selectedClinician.color }}
                  >
                    {selectedClinician.title
                      .replace('Licensed Clinical Social Worker', 'LCSW')
                      .replace('Licensed Clinical Psychologist', 'PsyD')
                      .replace('Licensed Professional Counselor', 'LPC')
                      .replace('Licensed Marriage & Family Therapist', 'LMFT')
                      .replace('Associate Professional Counselor', 'APC')
                      .replace('Licensed Mental Health Counselor', 'LMHC')
                    }
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="hidden lg:block w-px h-7 bg-white/10" />

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setExpandedCard('client-roster')}
                  className="group flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all duration-200 hover:bg-white/12 active:scale-[0.97]"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Users size={16} className="text-white/70 group-hover:text-white transition-colors" />
                  <span className="hidden sm:inline text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                    Roster
                  </span>
                </button>

                <button
                  onClick={() => navigate(`/clinician/${selectedClinician.id}/session-history`)}
                  className="group flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all duration-200 hover:bg-white/12 active:scale-[0.97]"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Calendar size={16} className="text-white/70 group-hover:text-white transition-colors" />
                  <span className="hidden sm:inline text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                    Sessions
                  </span>
                </button>
              </div>
            </div>
          </div>
        ) : undefined}
        titleAction={isSpotlightMode && selectedClinician ? (
          /* Name with dropdown trigger - positioned exactly where title would be */
          <div className="relative z-[100]">
            <button
              onClick={handleClinicianDropdownToggle}
              className="group flex items-center gap-3 transition-all duration-200"
            >
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight"
                style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
              >
                {selectedClinician.name}
              </h1>
              {/* Circular dropdown indicator - matches TimeSelector header variant */}
              <span
                className={`
                  flex items-center justify-center flex-shrink-0
                  w-8 h-8 sm:w-9 sm:h-9 rounded-full
                  transition-all duration-300
                  ${isClinicianDropdownOpen
                    ? 'border'
                    : 'bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/20'
                  }
                `}
                style={isClinicianDropdownOpen ? {
                  background: `${selectedClinician.color}20`,
                  borderColor: `${selectedClinician.color}40`,
                } : undefined}
              >
                <ChevronDown
                  size={18}
                  strokeWidth={2}
                  className={`
                    transition-all duration-300
                    ${isClinicianDropdownOpen
                      ? 'rotate-180'
                      : 'text-white/50 group-hover:text-white/70'
                    }
                  `}
                  style={isClinicianDropdownOpen ? { color: selectedClinician.color } : undefined}
                />
              </span>
            </button>
          </div>
        ) : undefined}
        timeSelector={
          <TimeSelector
            value={timeSelection}
            onChange={setTimeSelection}
            showAggregateOption={true}
            variant="header"
          />
        }
        actions={isSpotlightMode && selectedClinician && healthConfig ? (
          /* RIGHT SIDE: Metadata card + Action buttons - stacked vertically */
          <div className="flex flex-col items-end gap-3">
            {/* Metadata badge - elegant info display */}
            <div
              className="flex items-center gap-4 px-5 py-3 rounded-2xl"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              {/* Role & Title */}
              <div className="text-right">
                <p className="text-white/90 text-sm font-medium">{selectedClinician.role}</p>
                <p className="text-white/50 text-xs">{selectedClinician.title}</p>
              </div>

              {/* Divider */}
              <div className="w-px h-8 bg-white/10" />

              {/* Health Status */}
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    background: healthConfig.color,
                    boxShadow: `0 0 8px ${healthConfig.color}60`
                  }}
                />
                <span className="text-sm font-medium" style={{ color: healthConfig.color }}>
                  {healthConfig.label}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setExpandedCard('client-roster')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: 'rgba(255, 255, 255, 0.9)',
                }}
              >
                <Users size={16} />
                <span>Client Roster</span>
              </button>
              <button
                onClick={() => navigate(`/clinician/${selectedClinician.id}/session-history`)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: 'rgba(255, 255, 255, 0.9)',
                }}
              >
                <Calendar size={16} />
                <span>Session History</span>
              </button>
            </div>
          </div>
        ) : undefined}
      />

      {/* =================================================================
          CLINICIAN DROPDOWN PORTAL - Rendered at document body level
          to avoid being hidden by PageHeader collapse animation
          ================================================================= */}
      {isClinicianDropdownOpen && selectedClinician && createPortal(
        <div
          ref={clinicianDropdownMenuRef}
          className="fixed z-[100000] overflow-hidden"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            minWidth: '340px',
            background: 'rgba(255, 255, 255, 0.97)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            borderRadius: '20px',
            boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.3)',
            animation: 'dropdownReveal 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Back to all clinicians option */}
          <button
            onClick={() => {
              const newParams = new URLSearchParams(searchParams);
              newParams.delete('clinician');
              setSearchParams(newParams, { replace: true });
              setSelectedClinician(null);
              setPreSelectionSearch('');
              setIsClinicianDropdownOpen(false);
            }}
            className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-stone-50 transition-colors border-b border-stone-100"
          >
            <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center">
              <ArrowLeft size={18} className="text-stone-500" />
            </div>
            <div>
              <span className="text-sm font-semibold text-stone-700">All Clinicians</span>
              <span className="block text-xs text-stone-400">Back to selection</span>
            </div>
          </button>

          {/* Search */}
          <div className="p-3">
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-100">
              <Search size={15} className="text-stone-400" />
              <input
                ref={dropdownSearchRef}
                type="text"
                value={dropdownSearch}
                onChange={(e) => setDropdownSearch(e.target.value)}
                onKeyDown={handleDropdownKeyDown}
                placeholder="Search clinicians..."
                className="flex-1 bg-transparent outline-none text-sm text-stone-700 placeholder:text-stone-400"
              />
              {dropdownSearch && (
                <button
                  onClick={() => {
                    setDropdownSearch('');
                    setHighlightedIndex(-1);
                    dropdownSearchRef.current?.focus();
                  }}
                  className="p-1 hover:bg-stone-200 rounded-md transition-colors"
                >
                  <X size={14} className="text-stone-400" />
                </button>
              )}
            </div>
          </div>

          <div className="px-2 pb-2 max-h-[280px] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
              {dropdownSearch
                ? `${filteredDropdownClinicians.length} Result${filteredDropdownClinicians.length !== 1 ? 's' : ''}`
                : 'Switch to'
              }
            </div>

            {filteredDropdownClinicians.length === 0 ? (
              <div className="px-3 py-6 text-center">
                <p className="text-sm text-stone-400">No clinicians found</p>
              </div>
            ) : (
              filteredDropdownClinicians.map((clinician, index) => {
                const isSelectedClin = selectedClinician.id === clinician.id;
                const isHighlighted = index === highlightedIndex;
                const cHealth = HEALTH_CONFIG[clinician.healthStatus];
                return (
                  <button
                    key={clinician.id}
                    onClick={() => handleClinicianSelect(clinician)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-100 ${
                      isSelectedClin ? 'bg-blue-50' : isHighlighted ? 'bg-stone-50' : ''
                    }`}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold text-white flex-shrink-0"
                      style={{ background: clinician.color }}
                    >
                      {clinician.initials}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm truncate ${isSelectedClin ? 'font-semibold text-stone-900' : 'text-stone-700'}`}>
                          {highlightMatch(clinician.name, dropdownSearch)}
                        </span>
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cHealth.color }} />
                      </div>
                      <span className="text-xs text-stone-500">{highlightMatch(clinician.role, dropdownSearch)}</span>
                    </div>
                    {isSelectedClin && <Check size={16} className="text-blue-500 flex-shrink-0" />}
                  </button>
                );
              })
            )}
          </div>

          {/* Animation keyframes */}
          <style>{`
            @keyframes dropdownReveal {
              from { opacity: 0; transform: translateY(-8px) scale(0.96); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>
        </div>,
        document.body
      )}

      {/* =================================================================
          MAIN CONTENT - Light background with sections
          ================================================================= */}
      <div className="bg-gradient-to-b from-stone-100 to-stone-50 min-h-screen relative" style={{ zIndex: 0 }}>
        <div className="px-6 sm:px-8 lg:pl-[100px] lg:pr-12 py-8 lg:py-10 space-y-6">

          {/* ---------------------------------------------------------
              CLINICIAN SELECTOR - Searchable list for pre-selection
              --------------------------------------------------------- */}
          {!isSpotlightMode && (
            <div className="max-w-4xl mx-auto">
              {/* Search Input */}
              <div className="mb-4">
                <div
                  className="relative group"
                  style={{
                    background: 'linear-gradient(135deg, rgba(253, 252, 251, 0.95) 0%, rgba(250, 250, 249, 0.98) 100%)',
                    borderRadius: '16px',
                    border: '1px solid rgba(168, 154, 140, 0.2)',
                    boxShadow: '0 2px 12px -4px rgba(120, 100, 80, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.5)',
                  }}
                >
                  <div className="flex items-center px-4 py-3.5">
                    <Search
                      size={20}
                      className="text-stone-400 transition-colors duration-200 group-focus-within:text-amber-500"
                    />
                    <input
                      ref={preSelectionSearchRef}
                      type="text"
                      value={preSelectionSearch}
                      onChange={(e) => setPreSelectionSearch(e.target.value)}
                      onKeyDown={handlePreSelectionKeyDown}
                      placeholder="Search clinicians by name or role..."
                      className="flex-1 ml-3 bg-transparent outline-none text-stone-800 placeholder:text-stone-400 text-base"
                      style={{ fontFamily: "'Suisse Intl', sans-serif" }}
                    />
                    {preSelectionSearch && (
                      <button
                        onClick={() => {
                          setPreSelectionSearch('');
                          setHighlightedIndex(-1);
                        }}
                        className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors"
                      >
                        <X size={16} className="text-stone-400" />
                      </button>
                    )}
                  </div>
                  {/* Animated focus underline */}
                  <div
                    className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full transition-all duration-300 group-focus-within:opacity-100 opacity-0"
                    style={{
                      background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 50%, #f59e0b 100%)',
                    }}
                  />
                </div>
                {preSelectionSearch && (
                  <p className="mt-2 text-sm text-stone-500 px-1">
                    {filteredPreSelectionClinicians.length === 0
                      ? 'No clinicians found'
                      : `${filteredPreSelectionClinicians.length} clinician${filteredPreSelectionClinicians.length !== 1 ? 's' : ''} found`
                    }
                    {highlightedIndex >= 0 && ' · Use arrow keys to navigate, Enter to select'}
                  </p>
                )}
              </div>

              {/* Clinician List */}
              <div className="bg-white rounded-2xl border border-stone-200/60 overflow-hidden shadow-sm">
                {filteredPreSelectionClinicians.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-stone-100 flex items-center justify-center">
                      <Users size={28} className="text-stone-400" />
                    </div>
                    <p className="text-stone-600 font-medium">No clinicians match your search</p>
                    <p className="text-stone-400 text-sm mt-1">Try a different name or role</p>
                  </div>
                ) : (
                  filteredPreSelectionClinicians.map((clinician, index) => {
                    const cHealth = HEALTH_CONFIG[clinician.healthStatus];
                    const isLast = index === filteredPreSelectionClinicians.length - 1;
                    const isHighlighted = index === highlightedIndex;
                    return (
                      <button
                        key={clinician.id}
                        onClick={() => {
                          handleClinicianSelect(clinician);
                          setPreSelectionSearch('');
                        }}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        className={`w-full flex items-center gap-4 p-4 sm:p-5 text-left transition-all duration-150 ${
                          !isLast ? 'border-b border-stone-100' : ''
                        } ${isHighlighted ? 'bg-amber-50/70' : 'hover:bg-stone-50'}`}
                      >
                        {/* Avatar */}
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center text-base font-bold text-white flex-shrink-0 transition-transform duration-200 ${isHighlighted ? 'scale-105' : ''}`}
                          style={{ background: clinician.color }}
                        >
                          {clinician.initials}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3
                              className="text-lg font-semibold text-stone-800 truncate"
                              style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                            >
                              {highlightMatch(clinician.name, preSelectionSearch)}
                            </h3>
                            {/* Health dot */}
                            <div
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ background: cHealth.color }}
                              title={cHealth.label}
                            />
                          </div>
                          <p className="text-sm text-stone-500">
                            {highlightMatch(`${clinician.role} · ${clinician.title}`, preSelectionSearch)}
                          </p>
                        </div>

                        {/* Quick stats - hidden on mobile */}
                        <div className="hidden sm:flex items-center gap-6 text-right">
                          <div>
                            <p className="text-xs text-stone-400 uppercase tracking-wide">Revenue</p>
                            <p className="text-base font-semibold text-stone-700 tabular-nums">
                              ${(CLINICIAN_FINANCIAL_DATA[clinician.id]?.monthlyRevenue[CLINICIAN_FINANCIAL_DATA[clinician.id]?.monthlyRevenue.length - 1]?.value / 1000).toFixed(1)}k
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-stone-400 uppercase tracking-wide">Clients</p>
                            <p className="text-base font-semibold text-stone-700 tabular-nums">
                              {CLINICIAN_CASELOAD_DATA[clinician.id]?.monthlyCaseload[CLINICIAN_CASELOAD_DATA[clinician.id]?.monthlyCaseload.length - 1]?.activeClients || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-stone-400 uppercase tracking-wide">Sessions</p>
                            <p className="text-base font-semibold text-stone-700 tabular-nums">
                              {CLINICIAN_SESSION_DATA[clinician.id]?.monthlySessions[CLINICIAN_SESSION_DATA[clinician.id]?.monthlySessions.length - 1]?.completed || 0}
                            </p>
                          </div>
                        </div>

                        {/* Arrow with animation */}
                        <ArrowRight
                          size={18}
                          className={`text-stone-400 flex-shrink-0 transition-transform duration-200 ${isHighlighted ? 'translate-x-1 text-amber-500' : ''}`}
                        />
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------
              HERO STATS ROW - Key metrics at a glance
              --------------------------------------------------------- */}
          {isSpotlightMode && selectedClinician && (
            <AnimatedGrid cols={4} gap="md" staggerDelay={60}>
              <MetricCard
                label="Revenue"
                value={formatCurrencyParts(selectedClinician.metrics.revenue).value}
                valueSuffix={formatCurrencyParts(selectedClinician.metrics.revenue).suffix}
                subtext={`${selectedClinician.metrics.revenueVsGoal >= 100 ? '+' : ''}${selectedClinician.metrics.revenueVsGoal - 100}% vs goal · ${financialData?.practiceRevenueShare || 0}% of practice`}
                status={selectedClinician.metrics.revenueVsGoal >= 100 ? 'Healthy' : 'Needs attention'}
              />
              <MetricCard
                label="Sessions"
                value={sessionData ? formatSessionsParts(totalCompleted / sessionData.monthlySessions.length).value : '-'}
                valueSuffix={sessionData ? formatSessionsParts(totalCompleted / sessionData.monthlySessions.length).suffix : undefined}
                subtext={sessionData ? `~${Math.round(totalCompleted / sessionData.monthlySessions.length / 4.33)}/week · ${totalCompleted} total` : '-'}
                status={selectedClinician.metrics.sessionsVsGoal >= 100 ? 'Healthy' : 'Needs attention'}
              />
              <MetricCard
                label={`Caseload (${caseloadData?.monthlyCaseload[caseloadData.monthlyCaseload.length - 1]?.month || 'Current'})`}
                value={caseloadData ? formatCaseloadParts(currentActiveClients, currentCapacity).value : '-'}
                valueSuffix={caseloadData ? formatCaseloadParts(currentActiveClients, currentCapacity).suffix : undefined}
                subtext={caseloadData ? `${caseloadUtilization.toFixed(0)}% capacity · ${caseloadUtilization >= caseloadData.practiceAvgUtilization ? '+' : ''}${(caseloadUtilization - caseloadData.practiceAvgUtilization).toFixed(0)}% vs avg` : '-'}
                status={caseloadData && caseloadUtilization >= caseloadData.practiceAvgUtilization ? 'Healthy' : 'Needs attention'}
              />
              <MetricCard
                label="Notes Overdue"
                value={String(selectedClinician.metrics.notesOverdue)}
                subtext={selectedClinician.metrics.notesOverdue <= 5 ? 'On track' : selectedClinician.metrics.notesOverdue <= 10 ? 'Needs attention' : 'Critical backlog'}
                status={selectedClinician.metrics.notesOverdue <= 5 ? 'Healthy' : selectedClinician.metrics.notesOverdue <= 10 ? 'Needs attention' : 'Critical'}
              />
            </AnimatedGrid>
          )}

          {/* ---------------------------------------------------------
              SECTION 1: Financial Performance
              --------------------------------------------------------- */}
          {isSpotlightMode && selectedClinician && financialData && (
          <SectionContainer accent="emerald" index={0} isFirst>
            <SectionHeader
              number={1}
              question="How is their financial performance?"
              description="Revenue trends, averages, and contribution to practice"
              accent="emerald"
              showAccentLine={false}
              compact
            />
            {/* Monthly Gross Revenue Chart - Full Width */}
            <ChartCard
              title="Monthly Gross Revenue"
              subtitle={`How much ${selectedClinician.name.split(' ')[0]} is collecting each month`}
              headerControls={
                <GoalIndicator
                  value={formatCurrencyShort(financialData.revenueGoal)}
                  label="Goal"
                  color="amber"
                />
              }
              insights={revenueInsights}
              minHeight="420px"
              expandable
              onExpand={() => setExpandedCard('monthly-revenue')}
            >
              <BarChart
                data={revenueBarData}
                mode="single"
                goal={{ value: financialData.revenueGoal }}
                getBarColor={(value) =>
                  value >= financialData.revenueGoal
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
                height="280px"
              />
            </ChartCard>
          </SectionContainer>
          )}

          {/* ---------------------------------------------------------
              SECTION 2: Session Performance
              --------------------------------------------------------- */}
          {isSpotlightMode && selectedClinician && sessionData && (
          <SectionContainer accent="cyan" index={1}>
            <SectionHeader
              number={2}
              question="How are their sessions performing?"
              description="Session volume, attendance breakdown, and show rates"
              accent="cyan"
              showAccentLine={false}
              compact
            />
            <Grid cols={2}>
              {/* Completed Sessions Per Month Chart */}
              <ChartCard
                title="Monthly Sessions"
                subtitle={showWeeklyAvg ? `${selectedClinician.name.split(' ')[0]}'s average sessions per week` : `How many sessions ${selectedClinician.name.split(' ')[0]} completes each month`}
                headerControls={
                  <>
                    <ToggleButton
                      label="Weekly Avg"
                      active={showWeeklyAvg}
                      onToggle={() => setShowWeeklyAvg(!showWeeklyAvg)}
                    />
                    <GoalIndicator
                      value={showWeeklyAvg ? weeklySessionGoal : monthlySessionGoal}
                      label="Goal"
                      color="amber"
                    />
                  </>
                }
                insights={sessionInsights}
                minHeight="420px"
                expandable
                onExpand={() => setExpandedCard('monthly-sessions')}
              >
                <BarChart
                  data={showWeeklyAvg ? sessionWeeklyBarData : sessionBarData}
                  mode="single"
                  goal={{ value: showWeeklyAvg ? weeklySessionGoal : monthlySessionGoal }}
                  getBarColor={(value) => {
                    const goal = showWeeklyAvg ? weeklySessionGoal : monthlySessionGoal;
                    return value >= goal
                      ? {
                          gradient: 'linear-gradient(180deg, #34d399 0%, #059669 100%)',
                          shadow: '0 4px 12px -2px rgba(16, 185, 129, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
                          textColor: 'text-emerald-600',
                        }
                      : {
                          gradient: 'linear-gradient(180deg, #60a5fa 0%, #2563eb 100%)',
                          shadow: '0 4px 12px -2px rgba(37, 99, 235, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
                          textColor: 'text-blue-600',
                        };
                  }}
                  formatValue={(v) => v.toString()}
                  height="280px"
                />
              </ChartCard>

              {/* Attendance Breakdown Donut */}
              <DonutChartCard
                title="Attendance Breakdown"
                subtitle={`What happens to ${selectedClinician.name.split(' ')[0]}'s booked sessions`}
                segments={attendanceSegments}
                centerLabel="Show Rate"
                centerValue={`${showRate.toFixed(1)}%`}
                centerValueColor={showRate >= 87.5 ? 'text-emerald-600' : 'text-rose-600'}
                valueFormat="number"
                expandable
                onExpand={() => setExpandedCard('attendance-breakdown')}
              />

              {/* Cancellation Breakdown Chart - Stacked (Client + Clinician) */}
              <ChartCard
                title="Cancellation Breakdown"
                subtitle={`Who's cancelling ${selectedClinician.name.split(' ')[0]}'s sessions`}
                headerControls={
                  <div className="flex items-center gap-6 bg-stone-50 rounded-xl px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-md" style={{ background: 'linear-gradient(180deg, #fca5a5 0%, #dc2626 100%)' }} />
                      <span className="text-stone-700 text-sm font-semibold">Client</span>
                    </div>
                    <div className="w-px h-5 bg-stone-200" />
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-md" style={{ background: 'linear-gradient(180deg, #93c5fd 0%, #2563eb 100%)' }} />
                      <span className="text-stone-700 text-sm font-semibold">Clinician</span>
                    </div>
                  </div>
                }
                insights={cancellationBreakdownInsights}
                minHeight="420px"
                expandable
                onExpand={() => setExpandedCard('cancellation-breakdown')}
              >
                <BarChart
                  data={cancellationBreakdownBarData}
                  mode="stacked"
                  segments={cancellationBreakdownSegments as SegmentConfig[]}
                  stackOrder={cancellationBreakdownStackOrder}
                  formatValue={(v) => Math.round(v).toString()}
                  height="280px"
                />
              </ChartCard>

              {/* No-Show & Late Cancellations Chart */}
              <ChartCard
                title="Late Cancels & No-Shows"
                subtitle={`Lost sessions that can't be recovered`}
                headerControls={
                  <div className="flex items-center gap-6 bg-stone-50 rounded-xl px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-md" style={{ background: 'linear-gradient(180deg, #fcd34d 0%, #d97706 100%)' }} />
                      <span className="text-stone-700 text-sm font-semibold">Late Cancel</span>
                    </div>
                    <div className="w-px h-5 bg-stone-200" />
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-md" style={{ background: 'linear-gradient(180deg, #94a3b8 0%, #475569 100%)' }} />
                      <span className="text-stone-700 text-sm font-semibold">No-Show</span>
                    </div>
                  </div>
                }
                insights={noShowLateInsights}
                minHeight="420px"
                expandable
                onExpand={() => setExpandedCard('noshow-late')}
              >
                <BarChart
                  data={noShowLateBarData}
                  mode="stacked"
                  segments={noShowLateSegments as SegmentConfig[]}
                  stackOrder={noShowLateStackOrder}
                  formatValue={(v) => Math.round(v).toString()}
                  height="280px"
                />
              </ChartCard>
            </Grid>
          </SectionContainer>
          )}

          {/* ---------------------------------------------------------
              SECTION 3: Client & Caseload
              --------------------------------------------------------- */}
          {isSpotlightMode && selectedClinician && caseloadData && (
          <SectionContainer accent="amber" index={2}>
            <SectionHeader
              number={3}
              question="How is their caseload?"
              description="Client movement and current roster"
              accent="amber"
              showAccentLine={false}
              compact
            />
            <Grid cols={2}>
              {/* Active Clients & Caseload Capacity */}
              <ChartCard
                title="Active Clients & Caseload Capacity"
                subtitle={`How full ${selectedClinician.name.split(' ')[0]}'s caseload is each month`}
                headerControls={
                  <ToggleButton
                    label="Capacity %"
                    active={showCapacityPercentage}
                    onToggle={() => setShowCapacityPercentage(!showCapacityPercentage)}
                  />
                }
                insights={showCapacityPercentage ? capacityInsights : activeClientsInsights}
                minHeight="420px"
                expandable
                onExpand={() => setExpandedCard('caseload-capacity')}
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
                    height="280px"
                  />
                ) : (
                  <BarChart
                    data={activeClientsBarData}
                    mode="single"
                    goal={{ value: currentCapacity }}
                    getBarColor={() => ({
                      gradient: 'linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%)',
                      shadow: '0 4px 12px -2px rgba(245, 158, 11, 0.35)',
                      textColor: 'text-amber-600',
                    })}
                    formatValue={(v) => v.toString()}
                    height="280px"
                  />
                )}
              </ChartCard>

              {/* New and Churned Clients */}
              <ChartCard
                title="New and Churned Clients"
                subtitle={`${selectedClinician.name.split(' ')[0]}'s client movement each month`}
                headerControls={
                  <div className="flex items-center gap-6 bg-stone-50 rounded-xl px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-md" style={{ background: 'linear-gradient(180deg, #34d399 0%, #10b981 100%)' }} />
                      <span className="text-stone-700 text-sm font-semibold">New Clients</span>
                    </div>
                    <div className="w-px h-5 bg-stone-200" />
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-md" style={{ background: 'linear-gradient(180deg, #fb7185 0%, #f43f5e 100%)' }} />
                      <span className="text-stone-700 text-sm font-semibold">Churned</span>
                    </div>
                  </div>
                }
                insights={clientMovementInsights}
                minHeight="420px"
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
                  yDomain={[
                    -(Math.max(...clientMovementData.map(d => d.negative), 1) + 2),
                    Math.max(...clientMovementData.map(d => d.positive), 1) + 2
                  ]}
                />
              </ChartCard>

              {/* Client Session Frequency */}
              <DonutChartCard
                title="Client Session Frequency"
                subtitle={`How often ${selectedClinician.name.split(' ')[0]}'s clients come in`}
                segments={sessionFrequencySegments}
                centerLabel="Active"
                centerValue={totalSessionFrequencyClients.toString()}
                centerValueColor={weeklyEngagementPercent >= 50 ? 'text-emerald-600' : 'text-amber-600'}
                valueFormat="number"
                expandable
                onExpand={() => setExpandedCard('session-frequency')}
              />

              {/* Client Demographics - 3 stacked bar cards */}
              {demographicsData && (
                <div className="flex flex-col gap-4">
                  <StackedBarCard
                    title="Client Gender"
                    subtitle={`${selectedClinician.name.split(' ')[0]}'s current active clients`}
                    segments={[
                      { label: 'Male', value: demographicsData.gender.male, color: 'bg-blue-500' },
                      { label: 'Female', value: demographicsData.gender.female, color: 'bg-pink-500' },
                      { label: 'Other', value: demographicsData.gender.other, color: 'bg-purple-500' },
                    ]}
                  />
                  <StackedBarCard
                    title="Session Format"
                    subtitle={`${selectedClinician.name.split(' ')[0]}'s current active clients`}
                    segments={[
                      { label: 'In-Person', value: demographicsData.modality.inPerson, color: 'bg-amber-500' },
                      { label: 'Telehealth', value: demographicsData.modality.telehealth, color: 'bg-cyan-500' },
                    ]}
                  />
                  <StackedBarCard
                    title="Client Age"
                    subtitle={`${selectedClinician.name.split(' ')[0]}'s current active clients`}
                    segments={[
                      { label: '18-30', value: demographicsData.age.age18to30, color: 'bg-emerald-500' },
                      { label: '31-45', value: demographicsData.age.age31to45, color: 'bg-blue-500' },
                      { label: '46-60', value: demographicsData.age.age46to60, color: 'bg-amber-500' },
                      { label: '60+', value: demographicsData.age.age60plus, color: 'bg-rose-500' },
                    ]}
                  />
                </div>
              )}
            </Grid>
          </SectionContainer>
          )}

          {/* ---------------------------------------------------------
              SECTION 4: Retention
              --------------------------------------------------------- */}
          {isSpotlightMode && selectedClinician && retentionData && (
          <SectionContainer accent="rose" index={3}>
            <SectionHeader
              number={4}
              question="How well do they retain clients?"
              description="Rebook rates, churn patterns, and retention comparison"
              accent="rose"
              showAccentLine={false}
              compact
            />
            <Grid cols={2}>
              {/* Churned Clients Chart */}
              <ChartCard
                title="Churned Clients Per Month"
                subtitle={`How many clients ${selectedClinician.name.split(' ')[0]} is losing each month`}
                minHeight="420px"
                expandable
                onExpand={() => setExpandedCard('client-movement')}
              >
                <DivergingBarChart
                  data={churnedClientsData}
                  positiveConfig={{
                    label: '',
                    color: 'transparent',
                    colorEnd: 'transparent',
                  }}
                  negativeConfig={{
                    label: 'Churned',
                    color: '#fb7185',
                    colorEnd: '#f43f5e',
                  }}
                  height="100%"
                  yDomain={[-(Math.max(...churnedClientsData.map(d => d.negative)) + 3), 1]}
                  formatNegativeLabel={(value) => Math.abs(value).toString()}
                />
              </ChartCard>

              {/* Churn Timing - Donut Chart */}
              <DonutChartCard
                title="Churn Timing"
                subtitle={`How far ${selectedClinician.name.split(' ')[0]}'s clients get before leaving`}
                segments={[
                  { label: 'Early (<5 sessions)', value: churnTimingTotals.early, color: '#ef4444' },
                  { label: 'Medium (5-15)', value: churnTimingTotals.medium, color: '#f59e0b' },
                  { label: 'Late (>15)', value: churnTimingTotals.late, color: '#10b981' },
                ]}
                centerLabel="Total Churned"
                centerValue={churnTimingTotals.total.toString()}
                valueFormat="number"
                size="md"
                expandable
                onExpand={() => setExpandedCard('churn-timing')}
              />

              {/* Retention Comparison Table */}
              <DataTableCard
                title="Retention Comparison"
                subtitle={`How ${selectedClinician.name.split(' ')[0]}'s retention compares to the practice`}
                columns={retentionTableColumns}
                rows={retentionTableRows}
                minHeight="420px"
              />

              {/* Return Rate Chart */}
              <ChartCard
                title="Return Rate"
                subtitle={`% of clients still active at each milestone`}
                legend={[
                  { label: selectedClinician.name.split(' ')[0], color: 'bg-blue-500', type: 'box' },
                  { label: 'Practice Avg', color: 'bg-stone-400', type: 'box' },
                  { label: 'Top Performer', color: 'bg-emerald-500', type: 'box' },
                ]}
                minHeight="420px"
                expandable
                onExpand={() => setExpandedCard('return-rate')}
              >
                <LineChart
                  data={retentionCurveData}
                  xAxisKey="month"
                  lines={[
                    { dataKey: 'topPerformer', color: '#10b981', name: 'Top Performer' },
                    { dataKey: 'clinician', color: '#3b82f6', name: selectedClinician.name.split(' ')[0] },
                    { dataKey: 'practice', color: '#a8a29e', name: 'Practice Avg' },
                  ]}
                  yDomain={[0, 100]}
                  yTickFormatter={(v) => `${v}%`}
                  tooltipFormatter={(value, name) => [`${value}%`, name]}
                  height={280}
                />
              </ChartCard>
            </Grid>
          </SectionContainer>
          )}

          {/* ---------------------------------------------------------
              SECTION 5: Client Acquisition
              --------------------------------------------------------- */}
          {isSpotlightMode && selectedClinician && acquisitionData && settings.showConsultationMetrics && (
          <SectionContainer accent="cyan" index={4}>
            <SectionHeader
              number={5}
              question="How do they acquire clients?"
              description="Consultation pipeline and conversion performance"
              accent="cyan"
              showAccentLine={false}
              compact
            />
            {/* Full-width chart showing consults vs converted */}
            <ChartCard
              title="Consultation Pipeline"
              subtitle={`${totalConsultsBooked} consults booked · ${totalClientsConverted} clients converted · ${overallConversionRate}% conversion rate`}
              minHeight="380px"
            >
              <GroupedBarChart
                data={acquisitionChartData}
                bar1Config={{
                  label: 'Consults Booked',
                  color: '#22d3ee',
                  colorEnd: '#06b6d4',
                }}
                bar2Config={{
                  label: 'Clients Converted',
                  color: '#34d399',
                  colorEnd: '#10b981',
                }}
                height="300px"
              />
            </ChartCard>

            {/* Row 2: Conversion Rate Line Chart */}
            <Grid cols={2} className="mt-5 xl:mt-6 2xl:mt-8">
              <ChartCard
                title="Conversion Rate"
                subtitle="% of consultations that convert to clients"
                legend={[
                  { label: selectedClinician.name.split(' ')[0], color: 'bg-cyan-500', type: 'box' },
                  { label: 'Practice Avg', color: 'bg-stone-400', type: 'box' },
                ]}
                minHeight="420px"
              >
                <LineChart
                  data={conversionRateLineData}
                  xAxisKey="month"
                  lines={[
                    { dataKey: 'clinician', color: '#06b6d4', name: selectedClinician.name.split(' ')[0] },
                    { dataKey: 'practice', color: '#a8a29e', name: 'Practice Avg' },
                  ]}
                  yDomain={[0, 100]}
                  yTickFormatter={(v) => `${v}%`}
                  tooltipFormatter={(value, name) => [`${value}%`, name]}
                  height={280}
                />
              </ChartCard>

              {/* Lost Consults Donut Chart */}
              <DonutChartCard
                title="Where Consults Are Lost"
                subtitle={showLostByAffordability ? 'By affordability status' : 'By pipeline stage'}
                headerControls={
                  <ToggleButton
                    label="By Affordability"
                    active={showLostByAffordability}
                    onToggle={() => setShowLostByAffordability(!showLostByAffordability)}
                  />
                }
                segments={showLostByAffordability ? lostConsultsData.byAffordability : lostConsultsData.byStage}
                centerLabel="Total Lost"
                centerValue={lostConsultsData.totalLost.toString()}
                centerValueColor="text-rose-600"
                minHeight="420px"
              />
            </Grid>
          </SectionContainer>
          )}

          {/* ---------------------------------------------------------
              SECTION 6: Compliance
              --------------------------------------------------------- */}
          {isSpotlightMode && selectedClinician && complianceData && (
          <SectionContainer accent="stone" index={5} isLast>
            <SectionHeader
              number={6}
              question="Are they staying compliant?"
              description="Documentation status and overdue notes"
              accent="stone"
              showAccentLine={false}
              compact
            />
            <Grid cols={2}>
              {/* Outstanding Notes Donut Chart */}
              <DonutChartCard
                title="Outstanding Notes"
                subtitle={`How many notes ${selectedClinician.name.split(' ')[0]} needs to complete`}
                segments={[
                  { label: 'Overdue', value: complianceData.overdueNotes, color: '#ef4444' },
                  { label: 'Due within 48h', value: complianceData.dueWithin48h, color: '#f59e0b' },
                ]}
                centerLabel="Total"
                centerValue={complianceData.outstandingNotes.toString()}
                centerValueColor={
                  complianceData.overdueNotes === 0
                    ? 'text-emerald-600'
                    : complianceData.overdueNotes <= 3
                      ? 'text-amber-600'
                      : 'text-rose-600'
                }
                valueFormat="number"
                size="md"
                expandable
                onExpand={() => setExpandedCard('outstanding-notes')}
              />

              {/* Overdue Notes List - Using design system patterns */}
              <div
                className="rounded-2xl xl:rounded-3xl overflow-hidden"
                style={{
                  background: 'linear-gradient(145deg, #ffffff 0%, #fafaf9 100%)',
                  boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)',
                }}
              >
                {/* Header - matches ActionableClientListCard pattern */}
                <div className="p-6 sm:p-8 xl:p-10 border-b border-stone-100">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <h3
                        className="text-2xl sm:text-3xl xl:text-4xl text-stone-900 font-bold tracking-tight"
                        style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                      >
                        Overdue Notes
                      </h3>
                      <p className="text-stone-600 text-base sm:text-lg xl:text-xl mt-2">
                        {`Notes ${selectedClinician.name.split(' ')[0]} needs to catch up on`}
                      </p>
                    </div>

                    {/* Summary stat */}
                    <div className="text-right flex-shrink-0">
                      <div
                        className={`text-4xl sm:text-5xl xl:text-6xl font-bold ${
                          complianceData.overdueNotes === 0
                            ? 'text-emerald-600'
                            : complianceData.overdueNotes <= 3
                              ? 'text-amber-600'
                              : 'text-rose-600'
                        }`}
                        style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                      >
                        {complianceData.overdueNotes}
                      </div>
                      <div className="text-stone-600 text-base mt-1">overdue</div>
                    </div>
                  </div>
                </div>

                {/* Notes List */}
                {complianceData.overdueNotesList.length === 0 ? (
                  <div className="px-6 xl:px-8 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 mb-4">
                      <Check size={32} className="text-emerald-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-stone-900 mb-1">
                      All caught up!
                    </h4>
                    <p className="text-stone-600 text-sm">No overdue notes</p>
                  </div>
                ) : (
                  <div className="divide-y divide-stone-100">
                    {complianceData.overdueNotesList.slice(0, 5).map((note, index) => (
                      <div
                        key={note.id}
                        className="px-6 sm:px-8 xl:px-10 py-4 flex items-center gap-4 hover:bg-stone-50 transition-colors"
                      >
                        {/* Client Avatar */}
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, #78716c 0%, #57534e 100%)' }}
                        >
                          {note.clientInitials}
                        </div>

                        {/* Client Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-stone-900 font-semibold text-base truncate">{formatFullName(note.clientName)}</p>
                          <p className="text-stone-600 text-sm">{note.sessionDate} · {note.sessionType}</p>
                        </div>

                        {/* Days Overdue Badge */}
                        <div
                          className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex-shrink-0 ${
                            note.daysOverdue >= 7
                              ? 'bg-rose-50 text-rose-600 border border-rose-200'
                              : 'bg-amber-50 text-amber-600 border border-amber-200'
                          }`}
                        >
                          {note.daysOverdue}d overdue
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* View all footer */}
                {complianceData.overdueNotesList.length > 5 && (
                  <button
                    className="w-full px-6 xl:px-8 py-4 flex items-center justify-center gap-2 text-stone-600 font-semibold hover:bg-stone-50 transition-colors border-t border-stone-100"
                  >
                    <span>View all {complianceData.overdueNotesList.length} overdue notes</span>
                    <ArrowRight size={18} />
                  </button>
                )}
              </div>
            </Grid>
          </SectionContainer>
          )}

        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes dropdownReveal {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

      {/* ============================================
          EXPANDED CHART MODALS
          ============================================ */}

      {/* Monthly Revenue Expanded - Split View */}
      {selectedClinician && financialData && (
        <ExpandedChartView
          isOpen={expandedCard === 'monthly-revenue'}
          onClose={() => setExpandedCard(null)}
          title="Monthly Gross Revenue"
          subtitle={`How much ${selectedClinician.name.split(' ')[0]} is collecting each month`}
          periodOptions={periodOptions}
          initialPeriod="Dec"
          tableColumns={revenueTableColumns}
          getClientData={getRevenueClientData}
          renderChart={({ onBarClick, selectedPeriod }) => (
            <BarChart
              data={revenueBarData.map((d, idx) => ({
                ...d,
                // Add visual selection state
                _selected: d.label === selectedPeriod,
              }))}
              mode="single"
              goal={{ value: financialData.revenueGoal }}
              getBarColor={(value, index) => {
                const isSelected = revenueBarData[index]?.label === selectedPeriod;
                const meetsGoal = value >= financialData.revenueGoal;
                return {
                  gradient: meetsGoal
                    ? 'linear-gradient(180deg, #34d399 0%, #059669 100%)'
                    : 'linear-gradient(180deg, #60a5fa 0%, #2563eb 100%)',
                  shadow: isSelected
                    ? (meetsGoal
                        ? '0 8px 24px -4px rgba(16, 185, 129, 0.5), 0 0 0 3px rgba(16, 185, 129, 0.2)'
                        : '0 8px 24px -4px rgba(37, 99, 235, 0.5), 0 0 0 3px rgba(37, 99, 235, 0.2)')
                    : (meetsGoal
                        ? '0 4px 12px -2px rgba(16, 185, 129, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)'
                        : '0 4px 12px -2px rgba(37, 99, 235, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)'),
                  textColor: meetsGoal ? 'text-emerald-600' : 'text-blue-600',
                };
              }}
              formatValue={formatCurrencyShort}
              height="100%"
              size="lg"
              onBarClick={onBarClick}
            />
          )}
        />
      )}

      {/* Monthly Sessions Expanded - Split View */}
      {selectedClinician && sessionData && (
        <ExpandedChartView
          isOpen={expandedCard === 'monthly-sessions'}
          onClose={() => setExpandedCard(null)}
          title="Monthly Sessions"
          subtitle={`How many sessions ${selectedClinician.name.split(' ')[0]} completes each month`}
          periodOptions={periodOptions}
          initialPeriod="Dec"
          tableColumns={sessionsTableColumns}
          getClientData={getSessionsClientData}
          renderChart={({ onBarClick, selectedPeriod }) => (
            <BarChart
              data={sessionBarData}
              mode="single"
              goal={{ value: monthlySessionGoal }}
              onBarClick={onBarClick}
              getBarColor={(value, index) => {
                const isSelected = sessionBarData[index]?.label === selectedPeriod;
                const meetsGoal = value >= monthlySessionGoal;
                return {
                  gradient: meetsGoal
                    ? 'linear-gradient(180deg, #34d399 0%, #059669 100%)'
                    : 'linear-gradient(180deg, #60a5fa 0%, #2563eb 100%)',
                  shadow: isSelected
                    ? (meetsGoal
                        ? '0 8px 24px -4px rgba(16, 185, 129, 0.5), 0 0 0 3px rgba(16, 185, 129, 0.2)'
                        : '0 8px 24px -4px rgba(37, 99, 235, 0.5), 0 0 0 3px rgba(37, 99, 235, 0.2)')
                    : (meetsGoal
                        ? '0 4px 12px -2px rgba(16, 185, 129, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)'
                        : '0 4px 12px -2px rgba(37, 99, 235, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)'),
                  textColor: meetsGoal ? 'text-emerald-600' : 'text-blue-600',
                };
              }}
              formatValue={(v) => v.toString()}
              height="100%"
              size="lg"
            />
          )}
        />
      )}

      {/* Attendance Breakdown Expanded - Split View */}
      {selectedClinician && sessionData && (
        <ExpandedChartView
          isOpen={expandedCard === 'attendance-breakdown'}
          onClose={() => setExpandedCard(null)}
          title="Attendance Breakdown"
          subtitle={`What happens to ${selectedClinician.name.split(' ')[0]}'s booked sessions`}
          periodOptions={attendanceSegmentOptions}
          initialPeriod="attended"
          tableColumns={attendanceTableColumns}
          getClientData={getAttendanceClientData}
          renderChart={({ onBarClick, selectedPeriod }) => (
            <DonutChartCard
              title=""
              segments={attendanceSegments}
              centerLabel="Show Rate"
              centerValue={`${showRate.toFixed(1)}%`}
              centerValueColor={showRate >= 87.5 ? 'text-emerald-600' : 'text-rose-600'}
              valueFormat="number"
              size="lg"
              onSegmentClick={(segment) => {
                // Map segment labels to period values
                const labelToValue: Record<string, string> = {
                  'Attended': 'attended',
                  'Client Cancelled': 'client-cancelled',
                  'Clinician Cancelled': 'clinician-cancelled',
                  'Late Cancelled': 'late-cancel',
                  'No Show': 'no-show',
                };
                const periodValue = labelToValue[segment.label] || segment.label.toLowerCase();
                onBarClick(periodValue);
              }}
            />
          )}
        />
      )}

      {/* Cancellation Breakdown Expanded - Split View */}
      {selectedClinician && sessionData && (
        <ExpandedChartView
          isOpen={expandedCard === 'cancellation-breakdown'}
          onClose={() => setExpandedCard(null)}
          title="Cancellation Breakdown"
          subtitle={`Who's cancelling ${selectedClinician.name.split(' ')[0]}'s sessions`}
          periodOptions={periodOptions}
          initialPeriod="Dec"
          tableColumns={cancellationsTableColumns}
          getClientData={getCancellationsClientData}
          legend={
            <div className="flex items-center gap-6 bg-stone-50 rounded-xl px-5 py-3">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-md" style={{ background: 'linear-gradient(180deg, #fca5a5 0%, #dc2626 100%)' }} />
                <span className="text-stone-700 text-sm font-semibold">Client</span>
              </div>
              <div className="w-px h-5 bg-stone-200" />
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-md" style={{ background: 'linear-gradient(180deg, #93c5fd 0%, #2563eb 100%)' }} />
                <span className="text-stone-700 text-sm font-semibold">Clinician</span>
              </div>
            </div>
          }
          renderChart={({ onBarClick, selectedPeriod }) => (
            <BarChart
              data={cancellationBreakdownBarData}
              mode="stacked"
              segments={cancellationBreakdownSegments as SegmentConfig[]}
              stackOrder={cancellationBreakdownStackOrder}
              formatValue={(v) => Math.round(v).toString()}
              height="100%"
              size="lg"
              onBarClick={onBarClick}
            />
          )}
        />
      )}

      {/* No-Show & Late Cancellations Expanded - Split View */}
      {selectedClinician && sessionData && (
        <ExpandedChartView
          isOpen={expandedCard === 'noshow-late'}
          onClose={() => setExpandedCard(null)}
          title="Late Cancels & No-Shows"
          subtitle={`Lost sessions that can't be recovered`}
          periodOptions={periodOptions}
          initialPeriod="Dec"
          tableColumns={noShowTableColumns}
          getClientData={getNoShowClientData}
          legend={
            <div className="flex items-center gap-6 bg-stone-50 rounded-xl px-5 py-3">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-md" style={{ background: 'linear-gradient(180deg, #fcd34d 0%, #d97706 100%)' }} />
                <span className="text-stone-700 text-sm font-semibold">Late Cancel</span>
              </div>
              <div className="w-px h-5 bg-stone-200" />
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-md" style={{ background: 'linear-gradient(180deg, #94a3b8 0%, #475569 100%)' }} />
                <span className="text-stone-700 text-sm font-semibold">No-Show</span>
              </div>
            </div>
          }
          renderChart={({ onBarClick, selectedPeriod }) => (
            <BarChart
              data={noShowLateBarData}
              mode="stacked"
              segments={noShowLateSegments as SegmentConfig[]}
              stackOrder={noShowLateStackOrder}
              formatValue={(v) => Math.round(v).toString()}
              height="100%"
              size="lg"
              onBarClick={onBarClick}
            />
          )}
        />
      )}

      {/* Caseload Capacity Expanded - Split View */}
      {selectedClinician && caseloadData && (
        <ExpandedChartView
          isOpen={expandedCard === 'caseload-capacity'}
          onClose={() => setExpandedCard(null)}
          title="Active Clients & Caseload Capacity"
          subtitle={`How full ${selectedClinician.name.split(' ')[0]}'s caseload is each month`}
          periodOptions={periodOptions}
          initialPeriod="Dec"
          tableColumns={caseloadTableColumns}
          getClientData={getCaseloadClientData}
          legend={
            <div className="flex items-center gap-4 bg-stone-50 rounded-xl px-4 py-2.5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-stone-600 text-xs font-medium">Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-stone-600 text-xs font-medium">At Risk</span>
              </div>
            </div>
          }
          renderChart={({ onBarClick, selectedPeriod }) => (
            showCapacityPercentage ? (
              <BarChart
                data={capacityPercentageBarData}
                mode="single"
                getBarColor={(value, index) => {
                  const isSelected = capacityPercentageBarData[index]?.label === selectedPeriod;
                  return {
                    gradient: value >= 90
                      ? 'linear-gradient(180deg, #34d399 0%, #059669 100%)'
                      : value >= 75
                        ? 'linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%)'
                        : 'linear-gradient(180deg, #fb7185 0%, #f43f5e 100%)',
                    shadow: isSelected
                      ? '0 8px 24px -4px rgba(0, 0, 0, 0.3), 0 0 0 3px rgba(251, 191, 36, 0.3)'
                      : (value >= 90
                        ? '0 4px 12px -2px rgba(16, 185, 129, 0.35)'
                        : value >= 75
                          ? '0 4px 12px -2px rgba(245, 158, 11, 0.35)'
                          : '0 4px 12px -2px rgba(244, 63, 94, 0.35)'),
                    textColor: value >= 90
                      ? 'text-emerald-600'
                      : value >= 75
                        ? 'text-amber-600'
                        : 'text-rose-600',
                  };
                }}
                formatValue={(v) => `${v}%`}
                maxValue={100}
                height="100%"
                size="lg"
                onBarClick={onBarClick}
              />
            ) : (
              <BarChart
                data={activeClientsBarData}
                mode="single"
                goal={{ value: currentCapacity }}
                getBarColor={(value, index) => {
                  const isSelected = activeClientsBarData[index]?.label === selectedPeriod;
                  return {
                    gradient: 'linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%)',
                    shadow: isSelected
                      ? '0 8px 24px -4px rgba(245, 158, 11, 0.5), 0 0 0 3px rgba(245, 158, 11, 0.2)'
                      : '0 4px 12px -2px rgba(245, 158, 11, 0.35)',
                    textColor: 'text-amber-600',
                  };
                }}
                formatValue={(v) => v.toString()}
                height="100%"
                size="lg"
                onBarClick={onBarClick}
              />
            )
          )}
        />
      )}

      {/* Session Frequency Expanded - Split View */}
      {selectedClinician && caseloadData && (
        <ExpandedChartView
          isOpen={expandedCard === 'session-frequency'}
          onClose={() => setExpandedCard(null)}
          title="Client Session Frequency"
          subtitle={`How often ${selectedClinician.name.split(' ')[0]}'s clients come in`}
          periodOptions={frequencySegmentOptions}
          initialPeriod="weekly"
          tableColumns={frequencyTableColumns}
          getClientData={getFrequencyClientData}
          renderChart={({ onBarClick, selectedPeriod }) => (
            <DonutChartCard
              title=""
              segments={sessionFrequencySegments}
              centerLabel="Active"
              centerValue={totalSessionFrequencyClients.toString()}
              centerValueColor={weeklyEngagementPercent >= 50 ? 'text-emerald-600' : 'text-amber-600'}
              valueFormat="number"
              size="lg"
              onSegmentClick={(segment) => {
                // Map segment labels to period values
                const labelToValue: Record<string, string> = {
                  'Weekly': 'weekly',
                  'Bi-weekly': 'biweekly',
                  'Monthly': 'monthly',
                  'Inconsistent': 'inconsistent',
                };
                const periodValue = labelToValue[segment.label] || segment.label.toLowerCase();
                onBarClick(periodValue);
              }}
            />
          )}
        />
      )}

      {/* Client Roster Expanded */}
      {selectedClinician && (
        <ExpandedChartModal
          isOpen={expandedCard === 'client-roster'}
          onClose={() => setExpandedCard(null)}
          title="Client Roster"
          subtitle={`${selectedClinician.name.split(' ')[0]}'s ${clinicianClients.length} current active clients`}
        >
          <ClientRosterCard
            title=""
            clients={clinicianClients}
            size="lg"
          />
        </ExpandedChartModal>
      )}

      {/* Churned Clients Expanded - Split View */}
      {selectedClinician && caseloadData && (
        <ExpandedChartView
          isOpen={expandedCard === 'client-movement'}
          onClose={() => setExpandedCard(null)}
          title="Churned Clients Per Month"
          subtitle={`How many clients ${selectedClinician.name.split(' ')[0]} is losing each month`}
          periodOptions={periodOptions}
          initialPeriod="Dec"
          tableColumns={churnedTableColumns}
          getClientData={getChurnedClientData}
          renderChart={({ onBarClick, selectedPeriod }) => (
            <DivergingBarChart
              data={churnedClientsData}
              positiveConfig={{
                label: '',
                color: 'transparent',
                colorEnd: 'transparent',
              }}
              negativeConfig={{
                label: 'Churned',
                color: '#fb7185',
                colorEnd: '#f43f5e',
              }}
              height="100%"
              yDomain={[-(Math.max(...churnedClientsData.map(d => d.negative)) + 3), 1]}
              formatNegativeLabel={(value) => Math.abs(value).toString()}
            />
          )}
        />
      )}

      {/* Churn Timing Expanded - Split View */}
      {selectedClinician && retentionData && (
        <ExpandedChartView
          isOpen={expandedCard === 'churn-timing'}
          onClose={() => setExpandedCard(null)}
          title="Churn Timing"
          subtitle={`How far ${selectedClinician.name.split(' ')[0]}'s clients get before leaving`}
          periodOptions={churnTimingSegmentOptions}
          initialPeriod="early"
          tableColumns={churnTimingTableColumns}
          getClientData={getChurnTimingClientData}
          renderChart={({ onBarClick, selectedPeriod }) => (
            <DonutChartCard
              title=""
              segments={[
                { label: 'Early (<5 sessions)', value: churnTimingTotals.early, color: '#ef4444' },
                { label: 'Medium (5-15)', value: churnTimingTotals.medium, color: '#f59e0b' },
                { label: 'Late (>15)', value: churnTimingTotals.late, color: '#10b981' },
              ]}
              centerLabel="Total Churned"
              centerValue={churnTimingTotals.total.toString()}
              valueFormat="number"
              size="lg"
              onSegmentClick={(segment) => {
                // Map segment labels to period values
                const labelToValue: Record<string, string> = {
                  'Early (<5 sessions)': 'early',
                  'Medium (5-15)': 'medium',
                  'Late (>15)': 'late',
                };
                const periodValue = labelToValue[segment.label] || segment.label.toLowerCase();
                onBarClick(periodValue);
              }}
            />
          )}
        />
      )}

      {/* Return Rate Expanded - Split View */}
      {selectedClinician && retentionData && (
        <ExpandedChartView
          isOpen={expandedCard === 'return-rate'}
          onClose={() => setExpandedCard(null)}
          title="Return Rate Milestones"
          subtitle={`% of clients still active at each milestone`}
          periodOptions={returnRateMilestoneOptions}
          initialPeriod="mo6"
          tableColumns={returnRateTableColumns}
          getClientData={getReturnRateClientData}
          legend={
            <div className="flex items-center gap-4 bg-stone-50 rounded-xl px-4 py-2.5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: '#3b82f6' }} />
                <span className="text-stone-600 text-xs font-medium">{selectedClinician.name.split(' ')[0]}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: '#a8a29e' }} />
                <span className="text-stone-600 text-xs font-medium">Practice Avg</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: '#10b981' }} />
                <span className="text-stone-600 text-xs font-medium">Top Performer</span>
              </div>
            </div>
          }
          renderChart={({ onBarClick, selectedPeriod }) => (
            <LineChart
              data={retentionCurveData}
              xAxisKey="month"
              lines={[
                { dataKey: 'topPerformer', color: '#10b981', name: 'Top Performer' },
                { dataKey: 'clinician', color: '#3b82f6', name: selectedClinician.name.split(' ')[0] },
                { dataKey: 'practice', color: '#a8a29e', name: 'Practice Avg' },
              ]}
              yDomain={[0, 100]}
              yTickFormatter={(v) => `${v}%`}
              tooltipFormatter={(value, name) => [`${value}%`, name]}
              height={400}
            />
          )}
        />
      )}

      {/* Outstanding Notes Expanded - Split View */}
      {selectedClinician && complianceData && (
        <ExpandedChartView
          isOpen={expandedCard === 'outstanding-notes'}
          onClose={() => setExpandedCard(null)}
          title="Outstanding Notes"
          subtitle={`How many notes ${selectedClinician.name.split(' ')[0]} needs to complete`}
          periodOptions={notesStatusOptions}
          initialPeriod="overdue"
          tableColumns={notesTableColumns}
          getClientData={getNotesClientData}
          renderChart={({ onBarClick, selectedPeriod }) => (
            <DonutChartCard
              title=""
              segments={[
                { label: 'Overdue', value: complianceData.overdueNotes, color: '#ef4444' },
                { label: 'Due within 48h', value: complianceData.dueWithin48h, color: '#f59e0b' },
              ]}
              centerLabel="Total"
              centerValue={complianceData.outstandingNotes.toString()}
              centerValueColor={
                complianceData.overdueNotes === 0
                  ? 'text-emerald-600'
                  : complianceData.overdueNotes <= 3
                    ? 'text-amber-600'
                    : 'text-rose-600'
              }
              valueFormat="number"
              size="lg"
              onSegmentClick={(segment) => {
                // Map segment labels to period values
                const labelToValue: Record<string, string> = {
                  'Overdue': 'overdue',
                  'Due within 48h': 'due-soon',
                };
                const periodValue = labelToValue[segment.label] || segment.label.toLowerCase();
                onBarClick(periodValue);
              }}
            />
          )}
        />
      )}

      {/* AI Insight Modal - Dark Editorial Design */}
      {showInsightModal && selectedClinician && (
        <div
          className="fixed inset-0 z-[100000] flex items-center justify-center p-4 sm:p-6"
          style={{ animation: 'fade-in 0.2s ease-out' }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            onClick={() => setShowInsightModal(false)}
            style={{
              background: 'rgba(12, 10, 9, 0.9)',
              backdropFilter: 'blur(16px)',
            }}
          />

          {/* Modal */}
          <div
            className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
            style={{
              background: 'linear-gradient(180deg, #292524 0%, #1c1917 100%)',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255,255,255,0.05) inset',
              animation: 'scale-fade-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Ambient glow based on health status */}
            <div
              className="absolute top-0 left-0 w-64 h-64 opacity-30 pointer-events-none"
              style={{
                background: selectedClinician.healthStatus === 'critical'
                  ? 'radial-gradient(ellipse at 0% 0%, rgba(239,68,68,0.4) 0%, transparent 60%)'
                  : selectedClinician.healthStatus === 'attention'
                    ? 'radial-gradient(ellipse at 0% 0%, rgba(251,191,36,0.3) 0%, transparent 60%)'
                    : 'radial-gradient(ellipse at 0% 0%, rgba(16,185,129,0.3) 0%, transparent 60%)',
              }}
            />

            {/* Header */}
            <div className="relative px-6 sm:px-8 pt-6 pb-4 flex-shrink-0">
              <button
                onClick={() => setShowInsightModal(false)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 transition-all duration-200 group"
              >
                <X size={18} className="text-stone-500 group-hover:text-white transition-colors" />
              </button>

              {/* Status badge */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
                style={{
                  background: selectedClinician.healthStatus === 'critical'
                    ? 'rgba(239, 68, 68, 0.15)'
                    : selectedClinician.healthStatus === 'attention'
                      ? 'rgba(251, 191, 36, 0.15)'
                      : 'rgba(16, 185, 129, 0.15)',
                  boxShadow: `0 0 20px ${
                    selectedClinician.healthStatus === 'critical'
                      ? 'rgba(239,68,68,0.2)'
                      : selectedClinician.healthStatus === 'attention'
                        ? 'rgba(251,191,36,0.15)'
                        : 'rgba(16,185,129,0.15)'
                  }`,
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: selectedClinician.healthStatus === 'critical'
                      ? '#ef4444'
                      : selectedClinician.healthStatus === 'attention'
                        ? '#fbbf24'
                        : '#10b981',
                    boxShadow: `0 0 8px ${
                      selectedClinician.healthStatus === 'critical'
                        ? 'rgba(239,68,68,0.6)'
                        : selectedClinician.healthStatus === 'attention'
                          ? 'rgba(251,191,36,0.5)'
                          : 'rgba(16,185,129,0.5)'
                    }`,
                  }}
                />
                <span
                  className="text-[11px] font-semibold uppercase tracking-wider"
                  style={{
                    color: selectedClinician.healthStatus === 'critical'
                      ? '#fca5a5'
                      : selectedClinician.healthStatus === 'attention'
                        ? '#fcd34d'
                        : '#6ee7b7',
                  }}
                >
                  {selectedClinician.healthStatus === 'critical'
                    ? 'Action Required'
                    : selectedClinician.healthStatus === 'attention'
                      ? 'Needs Attention'
                      : 'Performing Well'}
                </span>
              </div>

              {/* Title */}
              <h2
                className="text-2xl sm:text-3xl text-white tracking-tight"
                style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
              >
                {selectedClinician.name.split(' ')[0]}'s Performance
              </h2>
              <p className="text-stone-500 text-sm mt-1">
                AI-generated analysis · {getCurrentPeriodLabel()}
              </p>
            </div>

            {/* Content - scrollable */}
            <div className="relative flex-1 overflow-y-auto px-6 sm:px-8 pb-6">
              {/* Main insight text */}
              <div
                className="rounded-2xl p-5 sm:p-6"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <p
                  className="text-stone-200 leading-[1.9] text-[16px] sm:text-[17px]"
                  style={{ letterSpacing: '0.015em' }}
                >
                  {dynamicInsight}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div
              className="px-6 sm:px-8 py-4 flex-shrink-0"
              style={{
                background: 'rgba(0, 0, 0, 0.2)',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <p className="text-stone-600 text-xs text-center">
                Analysis based on current period data
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Goals Panel Modal - Cortexa Design System Compliant */}
      {showGoalsPanel && selectedClinician && financialData && (
        <div
          className="fixed inset-0 z-[100000] flex items-center justify-center p-4"
          style={{ animation: 'fade-in 0.2s ease-out' }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            onClick={() => setShowGoalsPanel(false)}
            style={{
              background: 'rgba(28, 25, 23, 0.75)',
              backdropFilter: 'blur(8px)',
            }}
          />

          {/* Modal - Expanded width for better readability */}
          <div
            className="relative w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col bg-white"
            style={{
              borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              animation: 'scale-fade-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Amber accent bar - per design system */}
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{
                background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 50%, #f59e0b 100%)',
              }}
            />

            {/* Header */}
            <div className="relative px-8 pt-8 pb-5">
              <button
                onClick={() => setShowGoalsPanel(false)}
                className="absolute top-5 right-5 p-2.5 rounded-full hover:bg-stone-100 transition-all duration-200"
              >
                <X size={20} className="text-stone-400 hover:text-stone-600 transition-colors" />
              </button>

              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  boxShadow: '0 2px 8px rgba(251, 191, 36, 0.25)',
                }}
              >
                <Target size={24} className="text-amber-700" />
              </div>

              <h2
                className="text-3xl font-bold text-stone-900 tracking-tight"
                style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
              >
                Goals
              </h2>
              <p className="text-stone-500 text-base mt-1">{selectedClinician.name}</p>
            </div>

            {/* Mode Toggle - larger and more prominent */}
            <div className="px-8 pb-5">
              <div
                className="flex p-1.5 rounded-xl"
                style={{ background: 'rgba(0, 0, 0, 0.05)' }}
              >
                <button
                  onClick={() => setGoalsMode('view')}
                  className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    goalsMode === 'view'
                      ? 'bg-white text-stone-900 shadow-sm'
                      : 'text-stone-500 hover:text-stone-700'
                  }`}
                >
                  <Target size={16} />
                  Current Goals
                </button>
                <button
                  onClick={() => setGoalsMode('helper')}
                  className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    goalsMode === 'helper'
                      ? 'bg-white text-stone-900 shadow-sm'
                      : 'text-stone-500 hover:text-stone-700'
                  }`}
                >
                  <Calculator size={16} />
                  Goal Helper
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-8 pb-8">
              {goalsMode === 'view' ? (
                <div className="space-y-4">
                  {/* Sessions Goal - White card with blue accent */}
                  <button
                    onClick={() => {
                      setShowGoalsPanel(false);
                      openGoalEditor('sessionGoal');
                    }}
                    className="w-full group"
                  >
                    <div
                      className="relative p-5 rounded-2xl text-left transition-all duration-200 hover:shadow-lg hover:scale-[1.01] overflow-hidden"
                      style={{
                        background: 'white',
                        boxShadow: '0 2px 12px -2px rgba(0, 0, 0, 0.08)',
                        border: '1px solid rgba(0, 0, 0, 0.06)',
                      }}
                    >
                      {/* Left accent bar */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl"
                        style={{ background: '#3b82f6' }}
                      />
                      <div className="flex items-center justify-between pl-4">
                        <div className="flex items-center gap-5">
                          <div
                            className="w-14 h-14 rounded-xl flex items-center justify-center"
                            style={{ background: '#eff6ff' }}
                          >
                            <Activity size={24} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="text-stone-500 text-sm font-semibold uppercase tracking-wide mb-1">Sessions</p>
                            <div className="flex items-baseline gap-2">
                              <span
                                className="text-stone-900 text-3xl font-bold"
                                style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                              >
                                {masterClinicianData?.sessionGoal || '-'}
                              </span>
                              <span className="text-stone-500 text-base font-medium">per week</span>
                            </div>
                          </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Pencil size={18} className="text-stone-400" />
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Caseload Goal - White card with emerald accent */}
                  <button
                    onClick={() => {
                      setShowGoalsPanel(false);
                      openGoalEditor('clientGoal');
                    }}
                    className="w-full group"
                  >
                    <div
                      className="relative p-5 rounded-2xl text-left transition-all duration-200 hover:shadow-lg hover:scale-[1.01] overflow-hidden"
                      style={{
                        background: 'white',
                        boxShadow: '0 2px 12px -2px rgba(0, 0, 0, 0.08)',
                        border: '1px solid rgba(0, 0, 0, 0.06)',
                      }}
                    >
                      {/* Left accent bar */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl"
                        style={{ background: '#10b981' }}
                      />
                      <div className="flex items-center justify-between pl-4">
                        <div className="flex items-center gap-5">
                          <div
                            className="w-14 h-14 rounded-xl flex items-center justify-center"
                            style={{ background: '#ecfdf5' }}
                          >
                            <Users size={24} className="text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-stone-500 text-sm font-semibold uppercase tracking-wide mb-1">Caseload</p>
                            <div className="flex items-baseline gap-2">
                              <span
                                className="text-stone-900 text-3xl font-bold"
                                style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                              >
                                {masterClinicianData?.clientGoal || '-'}
                              </span>
                              <span className="text-stone-500 text-base font-medium">clients</span>
                            </div>
                          </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Pencil size={18} className="text-stone-400" />
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Take Rate - White card with violet accent */}
                  <button
                    onClick={() => {
                      setShowGoalsPanel(false);
                      openGoalEditor('takeRate');
                    }}
                    className="w-full group"
                  >
                    <div
                      className="relative p-5 rounded-2xl text-left transition-all duration-200 hover:shadow-lg hover:scale-[1.01] overflow-hidden"
                      style={{
                        background: 'white',
                        boxShadow: '0 2px 12px -2px rgba(0, 0, 0, 0.08)',
                        border: '1px solid rgba(0, 0, 0, 0.06)',
                      }}
                    >
                      {/* Left accent bar */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl"
                        style={{ background: '#8b5cf6' }}
                      />
                      <div className="flex items-center justify-between pl-4">
                        <div className="flex items-center gap-5">
                          <div
                            className="w-14 h-14 rounded-xl flex items-center justify-center"
                            style={{ background: '#f5f3ff' }}
                          >
                            <TrendingUp size={24} className="text-violet-600" />
                          </div>
                          <div>
                            <p className="text-stone-500 text-sm font-semibold uppercase tracking-wide mb-1">Take Rate</p>
                            <div className="flex items-baseline gap-2">
                              <span
                                className="text-stone-900 text-3xl font-bold"
                                style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                              >
                                {masterClinicianData?.takeRate || '-'}
                              </span>
                              <span className="text-stone-500 text-base font-medium">%</span>
                            </div>
                          </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Pencil size={18} className="text-stone-400" />
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Helper prompt - subtle stone background */}
                  <div
                    className="mt-5 p-5 rounded-xl text-center"
                    style={{
                      background: '#fafaf9',
                      border: '1px dashed #d6d3d1',
                    }}
                  >
                    <Zap size={24} className="text-amber-500 mx-auto mb-2" />
                    <p className="text-stone-600 text-base">
                      Want to calculate goals from an earnings target?
                    </p>
                    <button
                      onClick={() => setGoalsMode('helper')}
                      className="text-amber-600 text-base font-semibold mt-2 hover:text-amber-700 transition-colors inline-flex items-center gap-1.5"
                    >
                      Try the Goal Helper
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                /* HELPER MODE: Earnings-based goal calculator */
                <div>
                  {/* Reference Values - Clear pill badges */}
                  <div className="flex gap-3 mb-5">
                    <div
                      className="flex-1 px-4 py-3 rounded-xl"
                      style={{
                        background: 'white',
                        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.06)',
                        border: '1px solid rgba(0, 0, 0, 0.06)',
                      }}
                    >
                      <p className="text-stone-400 text-xs font-medium uppercase tracking-wide mb-1">Take Rate</p>
                      <p className="text-stone-900 text-xl font-bold">{masterClinicianData?.takeRate || 50}%</p>
                    </div>
                    <div
                      className="flex-1 px-4 py-3 rounded-xl"
                      style={{
                        background: 'white',
                        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.06)',
                        border: '1px solid rgba(0, 0, 0, 0.06)',
                      }}
                    >
                      <p className="text-stone-400 text-xs font-medium uppercase tracking-wide mb-1">Avg Session</p>
                      <p className="text-stone-900 text-xl font-bold">${financialData.avgRevenuePerSession}</p>
                    </div>
                  </div>

                  {/* Earnings Input Card - Warm amber tint */}
                  <div
                    className="p-6 rounded-2xl mb-6"
                    style={{
                      background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                      border: '1px solid #fde68a',
                    }}
                  >
                    <p className="text-amber-800 text-base font-semibold mb-4">
                      Monthly Earnings Target
                    </p>

                    <div className="flex items-baseline gap-2">
                      <span className="text-amber-600 text-3xl font-bold">$</span>
                      <input
                        type="number"
                        value={earningsGoalInput}
                        onChange={(e) => setEarningsGoalInput(e.target.value)}
                        placeholder="8,000"
                        className="flex-1 bg-transparent text-5xl font-bold text-stone-900 outline-none placeholder:text-amber-300/60 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                      />
                      <span className="text-amber-700 text-xl font-medium">/mo</span>
                    </div>
                  </div>

                  {/* Calculated Goals */}
                  {earningsGoalInput && parseFloat(earningsGoalInput) > 0 && (() => {
                    const earningsGoal = parseFloat(earningsGoalInput);
                    const takeRate = (masterClinicianData?.takeRate || 50) / 100;
                    const avgSessionValue = financialData.avgRevenuePerSession;
                    const avgSessionsPerClient = caseloadData?.sessionFrequency
                      ? (caseloadData.sessionFrequency.weekly * 4 + caseloadData.sessionFrequency.biweekly * 2 + caseloadData.sessionFrequency.monthly * 1) /
                        (caseloadData.sessionFrequency.weekly + caseloadData.sessionFrequency.biweekly + caseloadData.sessionFrequency.monthly + caseloadData.sessionFrequency.inconsistent || 1)
                      : 2.5;

                    const grossRevenue = earningsGoal / takeRate;
                    const sessionsPerMonth = Math.ceil(grossRevenue / avgSessionValue);
                    const sessionsPerWeek = Math.ceil(sessionsPerMonth / 4.33);
                    const clientsNeeded = Math.ceil(sessionsPerMonth / avgSessionsPerClient);

                    return (
                      <div className="space-y-4">
                        <p className="text-stone-500 text-sm font-semibold uppercase tracking-wide">Calculated Goals</p>

                        {/* Sessions per Week - Primary result with blue accent */}
                        <div
                          className="relative p-5 rounded-2xl flex items-center justify-between overflow-hidden"
                          style={{
                            background: 'white',
                            boxShadow: '0 2px 12px -2px rgba(0, 0, 0, 0.08)',
                            border: '1px solid rgba(0, 0, 0, 0.06)',
                          }}
                        >
                          <div
                            className="absolute left-0 top-0 bottom-0 w-1.5"
                            style={{ background: '#3b82f6' }}
                          />
                          <div className="flex items-center gap-4 pl-3">
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center"
                              style={{ background: '#eff6ff' }}
                            >
                              <Activity size={22} className="text-blue-600" />
                            </div>
                            <span className="text-stone-700 text-base font-medium">Sessions per Week</span>
                          </div>
                          <span
                            className="text-stone-900 text-3xl font-bold"
                            style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                          >
                            {sessionsPerWeek}
                          </span>
                        </div>

                        {/* Sessions per Month - Secondary */}
                        <div
                          className="relative p-5 rounded-2xl flex items-center justify-between overflow-hidden"
                          style={{
                            background: 'white',
                            boxShadow: '0 2px 12px -2px rgba(0, 0, 0, 0.08)',
                            border: '1px solid rgba(0, 0, 0, 0.06)',
                          }}
                        >
                          <div
                            className="absolute left-0 top-0 bottom-0 w-1.5"
                            style={{ background: '#3b82f6' }}
                          />
                          <div className="flex items-center gap-4 pl-3">
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center"
                              style={{ background: '#eff6ff' }}
                            >
                              <Activity size={22} className="text-blue-600" />
                            </div>
                            <span className="text-stone-700 text-base font-medium">Sessions per Month</span>
                          </div>
                          <span
                            className="text-stone-900 text-3xl font-bold"
                            style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                          >
                            {sessionsPerMonth}
                          </span>
                        </div>

                        {/* Clients Needed - Primary result with emerald accent */}
                        <div
                          className="relative p-5 rounded-2xl flex items-center justify-between overflow-hidden"
                          style={{
                            background: 'white',
                            boxShadow: '0 2px 12px -2px rgba(0, 0, 0, 0.08)',
                            border: '1px solid rgba(0, 0, 0, 0.06)',
                          }}
                        >
                          <div
                            className="absolute left-0 top-0 bottom-0 w-1.5"
                            style={{ background: '#10b981' }}
                          />
                          <div className="flex items-center gap-4 pl-3">
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center"
                              style={{ background: '#ecfdf5' }}
                            >
                              <Users size={22} className="text-emerald-600" />
                            </div>
                            <span className="text-stone-700 text-base font-medium">Minimum Clients</span>
                          </div>
                          <span
                            className="text-stone-900 text-3xl font-bold"
                            style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                          >
                            {clientsNeeded}
                          </span>
                        </div>

                        {/* Apply Button */}
                        <button
                          onClick={() => {
                            const clinicianId = selectedClinician.id.toString();
                            const todayStr = new Date().toISOString().split('T')[0];
                            const clinicianHistory = settings.clinicianGoalHistory[clinicianId] || {};

                            // Close any existing current periods (set endDate)
                            const existingSessionPeriods = (clinicianHistory.sessionGoal || []).map(p =>
                              p.endDate === null ? { ...p, endDate: todayStr } : p
                            );
                            const existingClientPeriods = (clinicianHistory.clientGoal || []).map(p =>
                              p.endDate === null ? { ...p, endDate: todayStr } : p
                            );

                            // Create new periods
                            const sessionGoalPeriod: SingleGoalPeriod = {
                              id: generateGoalPeriodId(),
                              startDate: todayStr,
                              endDate: null,
                              value: sessionsPerWeek,
                            };
                            const clientGoalPeriod: SingleGoalPeriod = {
                              id: generateGoalPeriodId(),
                              startDate: todayStr,
                              endDate: null,
                              value: clientsNeeded,
                            };

                            // Update settings
                            const updatedHistory: ClinicianGoalHistory = {
                              ...settings.clinicianGoalHistory,
                              [clinicianId]: {
                                ...clinicianHistory,
                                sessionGoal: [...existingSessionPeriods, sessionGoalPeriod],
                                clientGoal: [...existingClientPeriods, clientGoalPeriod],
                              },
                            };

                            updateSettings({ clinicianGoalHistory: updatedHistory });
                            setShowGoalsPanel(false);
                            setEarningsGoalInput('');
                          }}
                          className="w-full mt-5 py-4 rounded-xl font-semibold text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                          style={{
                            background: 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)',
                            color: 'white',
                            boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                          }}
                        >
                          Apply These Goals
                        </button>
                      </div>
                    );
                  })()}

                  {/* Empty state */}
                  {(!earningsGoalInput || parseFloat(earningsGoalInput) <= 0) && (
                    <div
                      className="py-16 px-6 rounded-2xl text-center"
                      style={{ background: '#fafaf9' }}
                    >
                      <Calculator size={40} className="text-stone-300 mx-auto mb-4" />
                      <p className="text-stone-500 text-base">
                        Enter an earnings target above to calculate goals
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Goal Editor Modal - Premium Editorial Design */}
      {showGoalEditor && editingGoalType && (
        <div
          className="fixed inset-0 z-[100000] flex items-center justify-center p-4"
          style={{ animation: 'fade-in 0.2s ease-out' }}
        >
          {/* Backdrop with subtle pattern */}
          <div
            className="absolute inset-0"
            onClick={closeGoalEditor}
            style={{
              background: 'rgba(12, 10, 9, 0.75)',
              backdropFilter: 'blur(8px)',
            }}
          />

          {/* Modal */}
          <div
            className="relative w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col"
            style={{
              background: 'linear-gradient(180deg, #FAFAF9 0%, #FFFFFF 100%)',
              borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0,0,0,0.05)',
              animation: 'scale-fade-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Decorative top accent */}
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{
                background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 50%, #f59e0b 100%)',
              }}
            />

            {/* Header */}
            <div className="relative px-6 pt-6 pb-4">
              <button
                onClick={closeGoalEditor}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 transition-all duration-200 group"
              >
                <X size={18} className="text-stone-400 group-hover:text-stone-600 transition-colors" />
              </button>

              {/* Goal type icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  boxShadow: '0 2px 8px rgba(251, 191, 36, 0.25)',
                }}
              >
                {editingGoalType === 'sessionGoal' && <Activity size={20} className="text-amber-700" />}
                {editingGoalType === 'clientGoal' && <Users size={20} className="text-amber-700" />}
                {editingGoalType === 'takeRate' && <TrendingUp size={20} className="text-amber-700" />}
              </div>

              <h2
                className="text-2xl font-bold text-stone-900 tracking-tight"
                style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
              >
                {goalTypeConfig[editingGoalType].label}
              </h2>
              <p className="text-stone-500 text-sm mt-0.5">
                {masterClinicianData?.name}
              </p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {/* Goal Input Card */}
              <div
                className="rounded-2xl p-5 mb-6"
                style={{
                  background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), 0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
                    {editingPeriodId ? 'Edit Period' : 'New Goal'}
                  </span>
                </div>

                {/* Big Value Input */}
                <div className="mb-5">
                  <div className="flex items-baseline gap-2">
                    <div className="relative inline-flex">
                      <span
                        className="invisible text-4xl font-bold px-1"
                        style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                      >
                        {goalFormData.value || '0'}
                      </span>
                      <input
                        type="number"
                        min={editingGoalType === 'takeRate' ? '0' : '1'}
                        max={editingGoalType === 'takeRate' ? '100' : undefined}
                        step={editingGoalType === 'takeRate' ? '0.1' : '1'}
                        value={goalFormData.value}
                        onChange={(e) => setGoalFormData({ ...goalFormData, value: e.target.value })}
                        placeholder="0"
                        className="absolute inset-0 w-full bg-transparent text-4xl font-bold text-stone-900 outline-none placeholder:text-stone-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                      />
                    </div>
                    <span className="text-lg text-amber-700/70 font-medium">
                      {editingGoalType === 'sessionGoal' && '/week'}
                      {editingGoalType === 'clientGoal' && 'clients'}
                      {editingGoalType === 'takeRate' && '%'}
                    </span>
                  </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-3">
                  <SmartDateInput
                    value={goalFormData.startDate}
                    onChange={(date) => setGoalFormData({ ...goalFormData, startDate: date })}
                    label="From"
                    placeholder="Jan 1, 2025"
                  />
                  <SmartDateInput
                    value={goalFormData.endDate}
                    onChange={(date) => setGoalFormData({ ...goalFormData, endDate: date })}
                    label="Until"
                    hint="(optional)"
                    placeholder="Ongoing"
                    allowEmpty
                  />
                </div>

                {/* Save Button */}
                <button
                  onClick={saveGoalPeriod}
                  className="w-full mt-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white',
                    boxShadow: '0 2px 8px rgba(217, 119, 6, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
                  }}
                >
                  {editingPeriodId ? 'Update Goal' : 'Save Goal'}
                </button>
              </div>

              {/* History Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">History</span>
                  <div className="flex-1 h-px bg-stone-200" />
                </div>

                {(() => {
                  const periods = getPeriodsForGoalType(editingGoalType);
                  if (periods.length === 0) {
                    return (
                      <div
                        className="py-8 px-4 rounded-xl text-center"
                        style={{ background: 'linear-gradient(180deg, #FAFAF9 0%, #F5F5F4 100%)' }}
                      >
                        <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center mx-auto mb-3">
                          <Calendar size={18} className="text-stone-400" />
                        </div>
                        <p className="text-stone-500 text-sm">No history yet</p>
                        <p className="text-stone-400 text-xs mt-1">Using default from profile</p>
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-2">
                      {periods.map((period, index) => (
                        <div
                          key={period.id}
                          className="group relative"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          {/* Connector line */}
                          {index < periods.length - 1 && (
                            <div
                              className="absolute left-[11px] top-8 bottom-0 w-0.5"
                              style={{ background: 'linear-gradient(180deg, #e7e5e4 0%, #d6d3d1 100%)' }}
                            />
                          )}

                          <div className="flex items-start gap-3">
                            {/* Timeline dot */}
                            <div
                              className={`relative z-10 mt-1.5 w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 ${
                                period.endDate === null
                                  ? 'bg-gradient-to-br from-amber-400 to-amber-500 shadow-[0_2px_8px_rgba(251,191,36,0.4)]'
                                  : 'bg-stone-200'
                              }`}
                            >
                              {period.endDate === null && (
                                <div className="w-2 h-2 rounded-full bg-white" />
                              )}
                            </div>

                            {/* Content card */}
                            <div
                              className={`flex-1 p-3 rounded-xl transition-all duration-200 ${
                                period.endDate === null
                                  ? 'bg-gradient-to-br from-amber-50 to-orange-50 ring-1 ring-amber-200/50'
                                  : 'bg-stone-50 ring-1 ring-stone-200/50 hover:ring-stone-300/50'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span
                                      className="text-xl font-bold text-stone-900"
                                      style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                                    >
                                      {formatGoalValue(editingGoalType, period.value)}
                                    </span>
                                    {period.endDate === null && (
                                      <span
                                        className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full"
                                        style={{
                                          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                          color: '#78350f',
                                        }}
                                      >
                                        Active
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-stone-500 mt-0.5">
                                    {formatDateDisplay(period.startDate)} → {formatDateDisplay(period.endDate)}
                                  </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => openGoalEditorForEdit(editingGoalType, period)}
                                    className="p-1.5 rounded-lg hover:bg-white/80 transition-colors"
                                  >
                                    <Pencil size={13} className="text-stone-400 hover:text-stone-600" />
                                  </button>
                                  <button
                                    onClick={() => deleteGoalPeriod(editingGoalType, period.id)}
                                    className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                  >
                                    <X size={13} className="text-stone-400 hover:text-red-500" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ClinicianDetailsTab;
