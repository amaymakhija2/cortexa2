import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronDown, Check, Calendar, ChevronLeft, ChevronRight, X, TrendingUp, TrendingDown, Users, DollarSign, Activity, FileText, ArrowRight, Settings, Pencil, Sparkles, AlertTriangle, Target, Zap, Calculator } from 'lucide-react';
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
  StatCard,
  AnimatedGrid,
  DonutChartCard,
  DivergingBarChart,
  GroupedBarChart,
  ToggleButton,
  ClientRosterCard,
  DataTableCard,
  StackedBarCard,
  ExpandedChartModal,
} from './design-system';
import type { ClientData } from './design-system';

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

type TimePeriod = 'last-12-months' | 'this-year' | 'this-quarter' | 'last-quarter' | 'this-month' | 'last-month' | 'custom';

const TIME_PERIODS: { id: TimePeriod; label: string }[] = [
  { id: 'last-12-months', label: 'Last 12 months' },
  { id: 'this-year', label: 'This Year' },
  { id: 'this-quarter', label: 'This Quarter' },
  { id: 'last-quarter', label: 'Last Quarter' },
  { id: 'this-month', label: 'This Month' },
  { id: 'last-month', label: 'Last Month' },
];

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
  const [searchParams] = useSearchParams();
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
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('last-12-months');

  // Sync clinician selection with URL param when it changes
  useEffect(() => {
    if (clinicianIdFromUrl) {
      const found = MOCK_CLINICIANS.find(c => c.id === parseInt(clinicianIdFromUrl));
      if (found && (!selectedClinician || selectedClinician.id !== found.id)) {
        setSelectedClinician(found);
      }
    }
  }, [clinicianIdFromUrl]);

  // Dropdown states
  const [isClinicianDropdownOpen, setIsClinicianDropdownOpen] = useState(false);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  // Animation state for clinician change
  const [isTransitioning, setIsTransitioning] = useState(false);

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

  // Custom date range state
  const [customStartMonth, setCustomStartMonth] = useState(0);
  const [customEndMonth, setCustomEndMonth] = useState(11);
  const [customYear, setCustomYear] = useState(new Date().getFullYear());

  // Refs for click outside
  const clinicianDropdownRef = useRef<HTMLDivElement>(null);
  const timeDropdownRef = useRef<HTMLDivElement>(null);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (clinicianDropdownRef.current && !clinicianDropdownRef.current.contains(event.target as Node)) {
        setIsClinicianDropdownOpen(false);
      }
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(event.target as Node)) {
        setIsTimeDropdownOpen(false);
        setShowCustomPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle clinician selection with transition
  const handleClinicianSelect = (clinician: typeof MOCK_CLINICIANS[0]) => {
    if (selectedClinician && clinician.id === selectedClinician.id) {
      setIsClinicianDropdownOpen(false);
      return;
    }

    // If first selection, just set it directly with a slight delay for animation
    if (!selectedClinician) {
      setIsClinicianDropdownOpen(false);
      setTimeout(() => {
        setSelectedClinician(clinician);
      }, 150);
      return;
    }

    // If switching clinicians, use transition animation
    setIsTransitioning(true);
    setIsClinicianDropdownOpen(false);
    setTimeout(() => {
      setSelectedClinician(clinician);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 200);
  };

  // Get the current period label
  const getCurrentPeriodLabel = () => {
    if (timePeriod === 'custom') return formatCustomRange();
    const period = TIME_PERIODS.find(p => p.id === timePeriod);
    return period?.label || 'Select period';
  };

  const formatCustomRange = () => {
    if (customStartMonth === customEndMonth) {
      return `${months[customStartMonth]} ${customYear}`;
    }
    return `${months[customStartMonth]} – ${months[customEndMonth]} ${customYear}`;
  };

  const applyCustomRange = () => {
    setTimePeriod('custom');
    setShowCustomPicker(false);
    setIsTimeDropdownOpen(false);
  };

  const handlePeriodSelect = (periodId: TimePeriod) => {
    setTimePeriod(periodId);
    setIsTimeDropdownOpen(false);
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
        bgColor: revenuePerSessionDiff >= 0 ? 'bg-emerald-50' : 'bg-rose-50',
        textColor: revenuePerSessionDiff >= 0 ? 'text-emerald-600' : 'text-rose-600',
      },
      {
        value: `${monthsAtGoal}/${financialData.monthlyRevenue.length}`,
        label: 'Hit Goal',
        bgColor: monthsAtGoal >= 6 ? 'bg-emerald-50' : 'bg-amber-50',
        textColor: monthsAtGoal >= 6 ? 'text-emerald-600' : 'text-amber-600',
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

  // Clinician cancellation insights
  const clinicianCancellationInsights = useMemo(() => {
    if (!sessionData) return [];
    const avgCancellations = totalClinicianCancelled / sessionData.monthlySessions.length;
    return [
      {
        icon: Calendar,
        label: 'Peak Month',
        value: peakCancellationMonth.month,
        detail: `${peakCancellationMonth.value} cancellations`,
      },
      {
        icon: Activity,
        label: 'Monthly Avg',
        value: avgCancellations.toFixed(1),
        detail: `${totalClinicianCancelled} total this year`,
      },
    ];
  }, [sessionData, totalClinicianCancelled, peakCancellationMonth]);

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
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-600',
      },
      {
        value: `${sessionMonthsAtGoal}/${sessionData.monthlySessions.length}`,
        label: 'Hit Goal',
        bgColor: sessionMonthsAtGoal >= 6 ? 'bg-emerald-50' : 'bg-amber-50',
        textColor: sessionMonthsAtGoal >= 6 ? 'text-emerald-600' : 'text-amber-600',
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
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-600',
      },
      {
        value: `-${avgChurn.toFixed(1)}`,
        label: 'Avg Churn/mo',
        bgColor: 'bg-rose-50',
        textColor: 'text-rose-600',
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
        textColor: 'text-stone-600',
      },
      {
        value: avgClients.toString(),
        label: 'Avg/Month',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-600',
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
        textColor: 'text-stone-600',
      },
      {
        value: `${caseloadData.practiceAvgUtilization}%`,
        label: 'Practice Avg',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-600',
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
          HEADER - Two modes: Default and Spotlight
          ================================================================= */}
      <div
        className="relative"
        style={{
          background: '#1a1816',
          minHeight: isSpotlightMode ? 'auto' : 'auto',
          transition: 'min-height 0.4s ease-out',
        }}
      >
        {/* Dynamic glow based on clinician's signature color - only in spotlight mode */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
          {isSpotlightMode && selectedClinician && healthConfig && (
            <>
              {/* Primary glow - clinician's color */}
              <div
                className="absolute top-0 left-0 w-[600px] h-[400px] rounded-full blur-[100px] transition-all duration-700"
                style={{
                  background: `radial-gradient(ellipse, ${selectedClinician.color}40 0%, transparent 70%)`,
                  opacity: isTransitioning ? 0 : 0.6,
                  transform: `translate(-20%, -40%)`,
                }}
              />
              {/* Secondary accent glow */}
              <div
                className="absolute bottom-0 right-0 w-[400px] h-[300px] rounded-full blur-[80px] transition-all duration-700"
                style={{
                  background: `radial-gradient(ellipse, ${healthConfig.color}30 0%, transparent 70%)`,
                  opacity: isTransitioning ? 0 : 0.4,
                  transform: `translate(20%, 40%)`,
                }}
              />
            </>
          )}
          {/* Default amber glow when no clinician selected */}
          {!isSpotlightMode && (
            <>
              <div
                className="absolute top-0 left-1/4 w-[500px] h-64 rounded-full opacity-[0.12] blur-3xl"
                style={{ background: 'radial-gradient(ellipse, #f59e0b 0%, transparent 70%)' }}
              />
              <div
                className="absolute bottom-0 right-1/3 w-80 h-48 rounded-full opacity-[0.08] blur-2xl"
                style={{ background: 'radial-gradient(ellipse, #fbbf24 0%, transparent 70%)' }}
              />
            </>
          )}
          {/* Subtle noise texture */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className={`relative px-6 sm:px-8 lg:px-12 ${isSpotlightMode ? 'py-10 lg:py-14' : 'py-8 lg:py-10'}`} style={{ zIndex: 1 }}>

          {/* =====================================================
              DEFAULT MODE - Simple header (clinician selector moved to main content)
              ===================================================== */}
          {!isSpotlightMode && (
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-amber-500/80 text-sm font-semibold tracking-widest uppercase mb-2">
                  Individual Performance
                </p>
                <h1
                  className="text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight"
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  Clinician Details
                </h1>
              </div>

              {/* Time Period Selector only in pre-selection mode */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Time Period Selector */}
                <div className="relative" ref={timeDropdownRef}>
                  <button
                    onClick={() => {
                      setIsTimeDropdownOpen(!isTimeDropdownOpen);
                      setIsClinicianDropdownOpen(false);
                      setShowCustomPicker(false);
                    }}
                    className="group flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-300"
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      boxShadow: isTimeDropdownOpen
                        ? '0 0 0 2px rgba(251, 191, 36, 0.3), 0 8px 32px rgba(0, 0, 0, 0.3)'
                        : '0 2px 8px rgba(0, 0, 0, 0.15)',
                    }}
                  >
                    <Calendar size={18} className="text-amber-400/80" strokeWidth={1.5} />
                    <span
                      className="text-white text-[15px] font-semibold tracking-[-0.01em]"
                      style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                    >
                      {getCurrentPeriodLabel()}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-stone-400 transition-transform duration-300 ${isTimeDropdownOpen ? 'rotate-180' : ''}`}
                      strokeWidth={2}
                    />
                  </button>

                  {/* Time Period Dropdown */}
                  {isTimeDropdownOpen && !showCustomPicker && (
                    <div
                      className="absolute top-full right-0 mt-2 z-[100000] overflow-hidden"
                      style={{
                        minWidth: '240px',
                        background: 'linear-gradient(135deg, #292524 0%, #1c1917 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '20px',
                        boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.5)',
                        animation: 'dropdownReveal 0.2s ease-out',
                      }}
                    >
                      <div
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 opacity-30 pointer-events-none"
                        style={{
                          background: 'radial-gradient(ellipse at center top, #f59e0b 0%, transparent 70%)',
                        }}
                      />
                      <div className="relative py-2">
                        {TIME_PERIODS.map((period) => {
                          const isSelected = timePeriod === period.id;
                          return (
                            <button
                              key={period.id}
                              onClick={() => handlePeriodSelect(period.id)}
                              className="w-full flex items-center justify-between px-5 py-3 transition-all duration-200 group/item"
                              style={{
                                background: isSelected ? 'linear-gradient(90deg, rgba(251, 191, 36, 0.15) 0%, transparent 100%)' : 'transparent',
                              }}
                            >
                              <span className={`text-[15px] font-medium ${isSelected ? 'text-amber-300' : 'text-stone-300 group-hover/item:text-white'}`}>
                                {period.label}
                              </span>
                              {isSelected && <Check size={16} className="text-amber-400" strokeWidth={2.5} />}
                            </button>
                          );
                        })}
                        <div className="mx-4 my-2 h-px bg-white/10" />
                        <button
                          onClick={() => setShowCustomPicker(true)}
                          className="w-full flex items-center gap-3 px-5 py-3 text-stone-300 hover:text-white transition-colors"
                        >
                          <Calendar size={16} className="text-stone-500" />
                          <span className="text-[15px] font-medium">Custom Range</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Custom Date Picker */}
                  {showCustomPicker && (
                    <div
                      className="absolute top-full right-0 mt-2 z-[100000] overflow-hidden"
                      style={{
                        width: '320px',
                        background: 'linear-gradient(135deg, #292524 0%, #1c1917 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '20px',
                        boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.5)',
                        animation: 'dropdownReveal 0.2s ease-out',
                      }}
                    >
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-4">
                          <button onClick={() => setShowCustomPicker(false)} className="flex items-center gap-1 text-stone-400 hover:text-white transition-colors text-sm">
                            <ChevronLeft size={16} />
                            Back
                          </button>
                          <span className="text-white font-semibold" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>Custom Range</span>
                          <button onClick={() => { setShowCustomPicker(false); setIsTimeDropdownOpen(false); }} className="text-stone-500 hover:text-white transition-colors">
                            <X size={16} />
                          </button>
                        </div>
                        <div className="flex items-center justify-center gap-4 mb-4 pb-4 border-b border-white/10">
                          <button onClick={() => setCustomYear(prev => prev - 1)} className="text-stone-400 hover:text-white"><ChevronLeft size={20} /></button>
                          <span className="text-white text-2xl font-bold w-20 text-center" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>{customYear}</span>
                          <button onClick={() => setCustomYear(prev => prev + 1)} className="text-stone-400 hover:text-white"><ChevronRight size={20} /></button>
                        </div>
                        <div className="grid grid-cols-4 gap-2 mb-4">
                          {months.map((month, idx) => {
                            const isStart = idx === customStartMonth;
                            const isEnd = idx === customEndMonth;
                            const isInRange = idx > customStartMonth && idx < customEndMonth;
                            const isSelectedMonth = isStart || isEnd;
                            return (
                              <button
                                key={month}
                                onClick={() => {
                                  if (customStartMonth === customEndMonth) {
                                    if (idx < customStartMonth) setCustomStartMonth(idx);
                                    else if (idx > customStartMonth) setCustomEndMonth(idx);
                                  } else {
                                    setCustomStartMonth(idx);
                                    setCustomEndMonth(idx);
                                  }
                                }}
                                className="h-10 rounded-lg text-sm font-medium transition-all"
                                style={{
                                  background: isSelectedMonth ? 'linear-gradient(135deg, #fef3c7, #fde68a)' : isInRange ? 'rgba(251, 191, 36, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                  color: isSelectedMonth ? '#1c1917' : isInRange ? '#fcd34d' : '#a8a29e',
                                }}
                              >
                                {month}
                              </button>
                            );
                          })}
                        </div>
                        <button
                          onClick={applyCustomRange}
                          className="w-full py-3 rounded-xl font-semibold transition-all"
                          style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)', color: '#1c1917' }}
                        >
                          Apply Range
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* =====================================================
              SPOTLIGHT MODE - Clinician profile header
              ===================================================== */}
          {isSpotlightMode && selectedClinician && healthConfig && (
            <>
              {/* Clinician Spotlight Content - Editorial Layout */}
              <div
                className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 transform translate-y-2' : 'opacity-100 transform translate-y-0'}`}
              >
                {/* Two-row layout for spacious organization */}

                {/* ROW 1: Identity + Controls */}
                <div className="flex items-start justify-between gap-8 mb-8">

                  {/* Left: Avatar + Name + Badge */}
                  <div className="flex items-center gap-6">
                    {/* Large Avatar with subtle glow */}
                    <div className="relative flex-shrink-0">
                      <div
                        className="absolute inset-0 rounded-2xl blur-2xl opacity-30"
                        style={{ background: selectedClinician.color }}
                      />
                      <div
                        className="relative w-24 h-24 lg:w-28 lg:h-28 rounded-2xl flex items-center justify-center text-3xl lg:text-4xl font-bold text-white"
                        style={{
                          background: `linear-gradient(145deg, ${selectedClinician.color} 0%, ${selectedClinician.color}dd 100%)`,
                          boxShadow: `0 12px 40px -8px ${selectedClinician.color}60`,
                        }}
                      >
                        {selectedClinician.initials}
                      </div>
                    </div>

                    {/* Name + Role/License + Health Badge */}
                    <div>
                      <h1
                        className="text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-none mb-1"
                        style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                      >
                        {selectedClinician.name}
                      </h1>
                      {/* Role & License subtitle */}
                      <p className="text-stone-400 text-base lg:text-lg mb-3">
                        {selectedClinician.role} · {selectedClinician.title}
                      </p>
                      {/* Health Status Badge */}
                      <div
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold"
                        style={{
                          background: healthConfig.bg,
                          color: healthConfig.color,
                          boxShadow: `0 0 24px ${healthConfig.glow}`,
                        }}
                      >
                        <span className="text-xs">{healthConfig.icon}</span>
                        {healthConfig.label}
                      </div>
                    </div>
                  </div>

                  {/* Right: Clinician Switcher + Time Period Selector */}
                  <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
                    {/* Clinician Switcher Dropdown */}
                    <div className="relative" ref={clinicianDropdownRef}>
                      <button
                        onClick={() => {
                          setIsClinicianDropdownOpen(!isClinicianDropdownOpen);
                          setIsTimeDropdownOpen(false);
                          setShowCustomPicker(false);
                        }}
                        className="group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300"
                        style={{
                          background: 'rgba(255, 255, 255, 0.08)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          boxShadow: isClinicianDropdownOpen
                            ? `0 0 0 2px ${selectedClinician.color}50, 0 8px 32px rgba(0, 0, 0, 0.3)`
                            : '0 2px 8px rgba(0, 0, 0, 0.15)',
                        }}
                      >
                        {/* Mini avatar */}
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                          style={{ background: selectedClinician.color }}
                        >
                          {selectedClinician.initials}
                        </div>
                        <span
                          className="text-white text-[15px] font-semibold tracking-[-0.01em] max-w-[120px] truncate"
                          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                        >
                          {selectedClinician.name.split(' ')[0]}
                        </span>
                        <ChevronDown
                          size={16}
                          className={`text-stone-400 transition-transform duration-300 ${isClinicianDropdownOpen ? 'rotate-180' : ''}`}
                          strokeWidth={2}
                        />
                      </button>

                      {/* Clinician Dropdown */}
                      {isClinicianDropdownOpen && (
                        <div
                          className="absolute top-full right-0 mt-2 z-[100000] overflow-hidden"
                          style={{
                            minWidth: '280px',
                            background: 'linear-gradient(135deg, #292524 0%, #1c1917 100%)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '20px',
                            boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.6)',
                            animation: 'dropdownReveal 0.25s ease-out',
                          }}
                        >
                          <div
                            className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 opacity-30 pointer-events-none"
                            style={{
                              background: `radial-gradient(ellipse at center top, ${selectedClinician.color} 0%, transparent 70%)`,
                            }}
                          />
                          <div className="relative p-2">
                            <div className="px-4 py-2 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                              Switch Clinician
                            </div>
                            {MOCK_CLINICIANS.map((clinician) => {
                              const isSelectedClin = selectedClinician.id === clinician.id;
                              const cHealth = HEALTH_CONFIG[clinician.healthStatus];
                              return (
                                <button
                                  key={clinician.id}
                                  onClick={() => handleClinicianSelect(clinician)}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group/item"
                                  style={{
                                    background: isSelectedClin ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                                  }}
                                >
                                  {/* Mini avatar */}
                                  <div
                                    className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                                    style={{ background: clinician.color }}
                                  >
                                    {clinician.initials}
                                  </div>
                                  {/* Info */}
                                  <div className="flex-1 text-left min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className={`font-semibold truncate ${isSelectedClin ? 'text-white' : 'text-stone-300 group-hover/item:text-white'}`}>
                                        {clinician.name}
                                      </span>
                                      {/* Health dot */}
                                      <div
                                        className="w-2 h-2 rounded-full flex-shrink-0"
                                        style={{ background: cHealth.color }}
                                      />
                                    </div>
                                    <span className="text-xs text-stone-500">{clinician.role}</span>
                                  </div>
                                  {isSelectedClin && <Check size={16} className="text-amber-400 flex-shrink-0" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Time Period Selector */}
                    <div className="relative" ref={timeDropdownRef}>
                      <button
                        onClick={() => {
                          setIsTimeDropdownOpen(!isTimeDropdownOpen);
                          setIsClinicianDropdownOpen(false);
                          setShowCustomPicker(false);
                        }}
                        className="group flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-300"
                        style={{
                          background: 'rgba(255, 255, 255, 0.08)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          boxShadow: isTimeDropdownOpen
                            ? '0 0 0 2px rgba(251, 191, 36, 0.3), 0 8px 32px rgba(0, 0, 0, 0.3)'
                            : '0 2px 8px rgba(0, 0, 0, 0.15)',
                        }}
                      >
                        <Calendar size={18} className="text-amber-400/80" strokeWidth={1.5} />
                        <span
                          className="text-white text-[15px] font-semibold tracking-[-0.01em]"
                          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                        >
                          {getCurrentPeriodLabel()}
                        </span>
                        <ChevronDown
                          size={16}
                          className={`text-stone-400 transition-transform duration-300 ${isTimeDropdownOpen ? 'rotate-180' : ''}`}
                          strokeWidth={2}
                        />
                      </button>

                      {/* Time Period Dropdown - Spotlight Mode */}
                      {isTimeDropdownOpen && !showCustomPicker && (
                        <div
                          className="absolute top-full right-0 mt-2 z-[100000] overflow-hidden"
                          style={{
                            minWidth: '240px',
                            background: 'linear-gradient(135deg, #292524 0%, #1c1917 100%)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '20px',
                            boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.5)',
                            animation: 'dropdownReveal 0.2s ease-out',
                          }}
                        >
                          <div
                            className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 opacity-30 pointer-events-none"
                            style={{
                              background: 'radial-gradient(ellipse at center top, #f59e0b 0%, transparent 70%)',
                            }}
                          />
                          <div className="relative py-2">
                            {TIME_PERIODS.map((period) => {
                              const isSelected = timePeriod === period.id;
                              return (
                                <button
                                  key={period.id}
                                  onClick={() => handlePeriodSelect(period.id)}
                                  className="w-full flex items-center justify-between px-5 py-3 transition-all duration-200 group/item"
                                  style={{
                                    background: isSelected ? 'linear-gradient(90deg, rgba(251, 191, 36, 0.15) 0%, transparent 100%)' : 'transparent',
                                  }}
                                >
                                  <span className={`text-[15px] font-medium ${isSelected ? 'text-amber-300' : 'text-stone-300 group-hover/item:text-white'}`}>
                                    {period.label}
                                  </span>
                                  {isSelected && <Check size={16} className="text-amber-400" strokeWidth={2.5} />}
                                </button>
                              );
                            })}
                            <div className="mx-4 my-2 h-px bg-white/10" />
                            <button
                              onClick={() => setShowCustomPicker(true)}
                              className="w-full flex items-center gap-3 px-5 py-3 text-stone-300 hover:text-white transition-colors"
                            >
                              <Calendar size={16} className="text-stone-500" />
                              <span className="text-[15px] font-medium">Custom Range</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Custom Date Picker - Spotlight Mode */}
                      {showCustomPicker && (
                        <div
                          className="absolute top-full right-0 mt-2 z-[100000] overflow-hidden"
                          style={{
                            width: '320px',
                            background: 'linear-gradient(135deg, #292524 0%, #1c1917 100%)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '20px',
                            boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.5)',
                            animation: 'dropdownReveal 0.2s ease-out',
                          }}
                        >
                          <div className="p-5">
                            <div className="flex items-center justify-between mb-4">
                              <button onClick={() => setShowCustomPicker(false)} className="flex items-center gap-1 text-stone-400 hover:text-white transition-colors text-sm">
                                <ChevronLeft size={16} />
                                Back
                              </button>
                              <span className="text-white font-semibold" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>Custom Range</span>
                              <button onClick={() => { setShowCustomPicker(false); setIsTimeDropdownOpen(false); }} className="text-stone-500 hover:text-white transition-colors">
                                <X size={16} />
                              </button>
                            </div>
                            <div className="flex items-center justify-center gap-4 mb-4 pb-4 border-b border-white/10">
                              <button onClick={() => setCustomYear(prev => prev - 1)} className="text-stone-400 hover:text-white"><ChevronLeft size={20} /></button>
                              <span className="text-white text-2xl font-bold w-20 text-center" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>{customYear}</span>
                              <button onClick={() => setCustomYear(prev => prev + 1)} className="text-stone-400 hover:text-white"><ChevronRight size={20} /></button>
                            </div>
                            <div className="grid grid-cols-4 gap-2 mb-4">
                              {months.map((month, idx) => {
                                const isStart = idx === customStartMonth;
                                const isEnd = idx === customEndMonth;
                                const isInRange = idx > customStartMonth && idx < customEndMonth;
                                const isSelectedMonth = isStart || isEnd;
                                return (
                                  <button
                                    key={month}
                                    onClick={() => {
                                      if (customStartMonth === customEndMonth) {
                                        if (idx < customStartMonth) setCustomStartMonth(idx);
                                        else if (idx > customStartMonth) setCustomEndMonth(idx);
                                      } else {
                                        setCustomStartMonth(idx);
                                        setCustomEndMonth(idx);
                                      }
                                    }}
                                    className="h-10 rounded-lg text-sm font-medium transition-all"
                                    style={{
                                      background: isSelectedMonth ? 'linear-gradient(135deg, #fef3c7, #fde68a)' : isInRange ? 'rgba(251, 191, 36, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                      color: isSelectedMonth ? '#1c1917' : isInRange ? '#fcd34d' : '#a8a29e',
                                    }}
                                  >
                                    {month}
                                  </button>
                                );
                              })}
                            </div>
                            <button
                              onClick={applyCustomRange}
                              className="w-full py-3 rounded-xl font-semibold transition-all"
                              style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)', color: '#1c1917' }}
                            >
                              Apply Range
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Goals Button */}
                    <button
                      onClick={() => {
                        setGoalsMode('view');
                        setShowGoalsPanel(true);
                      }}
                      className="group flex items-center gap-2.5 px-5 py-3 rounded-2xl transition-all duration-300 hover:scale-[1.02]"
                      style={{
                        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(251, 191, 36, 0.08) 100%)',
                        border: '1px solid rgba(251, 191, 36, 0.25)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
                      }}
                    >
                      <Target size={18} className="text-amber-400" strokeWidth={1.5} />
                      <span
                        className="text-amber-100 text-[15px] font-semibold tracking-[-0.01em]"
                        style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                      >
                        Goals
                      </span>
                    </button>
                  </div>
                </div>

              </div>
            </>
          )}
        </div>
      </div>

      {/* =================================================================
          MAIN CONTENT - Light background with sections
          ================================================================= */}
      <div className="bg-gradient-to-b from-stone-100 to-stone-50 min-h-screen relative" style={{ zIndex: 0 }}>
        <div className="px-6 sm:px-8 lg:px-12 py-8 lg:py-10 space-y-6">

          {/* ---------------------------------------------------------
              CLINICIAN SELECTOR - Interactive gallery for pre-selection
              --------------------------------------------------------- */}
          {!isSpotlightMode && (
            <div className="py-6">
              {/* Section intro */}
              <div className="text-center mb-12">
                <h2
                  className="text-4xl sm:text-5xl text-stone-800 mb-4"
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  Select a Clinician
                </h2>
                <p className="text-stone-600 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
                  Choose a team member to explore their detailed performance metrics, trends, and insights.
                </p>
              </div>

              {/* Clinician Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
                {MOCK_CLINICIANS.map((clinician, index) => {
                  const cHealth = HEALTH_CONFIG[clinician.healthStatus];
                  return (
                    <button
                      key={clinician.id}
                      onClick={() => handleClinicianSelect(clinician)}
                      className="group relative text-left rounded-3xl transition-all duration-300 overflow-hidden hover:scale-[1.02] hover:-translate-y-1"
                      style={{
                        background: 'white',
                        border: '1px solid rgba(0, 0, 0, 0.06)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04), 0 8px 24px rgba(0, 0, 0, 0.03)',
                        animationDelay: `${index * 60}ms`,
                      }}
                    >
                      {/* Hover glow effect */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{
                          background: `radial-gradient(ellipse at 30% 20%, ${clinician.color}12 0%, transparent 60%)`,
                        }}
                      />

                      {/* Card content */}
                      <div className="relative p-6 lg:p-7">
                        {/* Top row: Avatar + Health badge */}
                        <div className="flex items-start justify-between mb-5">
                          {/* Avatar with color ring */}
                          <div className="relative">
                            <div
                              className="absolute inset-0 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-300"
                              style={{ background: clinician.color }}
                            />
                            <div
                              className="relative w-16 h-16 lg:w-20 lg:h-20 rounded-2xl flex items-center justify-center text-xl lg:text-2xl font-bold text-white shadow-lg transition-transform duration-300 group-hover:scale-105"
                              style={{
                                background: `linear-gradient(135deg, ${clinician.color} 0%, ${clinician.color}dd 100%)`,
                              }}
                            >
                              {clinician.initials}
                            </div>
                          </div>

                          {/* Health status badge */}
                          <div
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold"
                            style={{
                              background: cHealth.bg,
                              color: cHealth.color,
                            }}
                          >
                            <span className="text-xs">{cHealth.icon}</span>
                            <span>{cHealth.label}</span>
                          </div>
                        </div>

                        {/* Name and title */}
                        <div className="mb-5">
                          <h3
                            className="text-2xl lg:text-[1.75rem] text-stone-800 mb-1 group-hover:text-stone-900 transition-colors leading-tight"
                            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                          >
                            {clinician.name}
                          </h3>
                          <p className="text-base text-stone-600">{clinician.role}</p>
                        </div>

                        {/* Quick metrics row */}
                        <div className="flex items-center gap-5 pt-4 border-t border-stone-200/60">
                          <div className="flex-1">
                            <p className="text-xs uppercase tracking-wider text-stone-500 mb-1">Last Month</p>
                            <p className="text-lg font-semibold text-stone-800">
                              ${(CLINICIAN_FINANCIAL_DATA[clinician.id]?.monthlyRevenue[CLINICIAN_FINANCIAL_DATA[clinician.id]?.monthlyRevenue.length - 1]?.value / 1000).toFixed(1)}k
                            </p>
                          </div>
                          <div className="w-px h-10 bg-stone-200/60" />
                          <div className="flex-1">
                            <p className="text-xs uppercase tracking-wider text-stone-500 mb-1">Clients</p>
                            <p className="text-lg font-semibold text-stone-800">
                              {CLINICIAN_CASELOAD_DATA[clinician.id]?.monthlyCaseload[CLINICIAN_CASELOAD_DATA[clinician.id]?.monthlyCaseload.length - 1]?.activeClients || 0}
                            </p>
                          </div>
                          <div className="w-px h-10 bg-stone-200/60" />
                          <div className="flex-1">
                            <p className="text-xs uppercase tracking-wider text-stone-500 mb-1">Completed Sessions</p>
                            <p className="text-lg font-semibold text-stone-800">
                              {CLINICIAN_SESSION_DATA[clinician.id]?.monthlySessions[CLINICIAN_SESSION_DATA[clinician.id]?.monthlySessions.length - 1]?.completed || 0}
                            </p>
                          </div>
                        </div>

                        {/* Hover arrow indicator */}
                        <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                          <ArrowRight size={22} className="text-stone-500" strokeWidth={1.5} />
                        </div>
                      </div>

                      {/* Bottom accent line on hover */}
                      <div
                        className="absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                        style={{ background: clinician.color }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------
              HERO STATS ROW - Key metrics at a glance
              --------------------------------------------------------- */}
          {isSpotlightMode && selectedClinician && (
            <AnimatedGrid cols={4} gap="md" staggerDelay={60}>
              <StatCard
                title="Revenue"
                value={formatCurrency(selectedClinician.metrics.revenue)}
                subtitle={`${selectedClinician.metrics.revenueVsGoal >= 100 ? '+' : ''}${selectedClinician.metrics.revenueVsGoal - 100}% vs goal · ${financialData?.practiceRevenueShare || 0}% of practice`}
                variant={selectedClinician.metrics.revenueVsGoal >= 100 ? 'positive' : 'negative'}
              />
              <StatCard
                title="Sessions"
                value={sessionData ? `${Math.round(totalCompleted / sessionData.monthlySessions.length)}/mo` : '-'}
                subtitle={sessionData ? `~${Math.round(totalCompleted / sessionData.monthlySessions.length / 4.33)}/week · ${totalCompleted} total` : '-'}
                variant={selectedClinician.metrics.sessionsVsGoal >= 100 ? 'positive' : 'negative'}
              />
              <StatCard
                title={`Caseload (${caseloadData?.monthlyCaseload[caseloadData.monthlyCaseload.length - 1]?.month || 'Current'})`}
                value={caseloadData ? `${currentActiveClients}/${currentCapacity}` : '-'}
                subtitle={caseloadData ? `${caseloadUtilization.toFixed(0)}% capacity · ${caseloadUtilization >= caseloadData.practiceAvgUtilization ? '+' : ''}${(caseloadUtilization - caseloadData.practiceAvgUtilization).toFixed(0)}% vs avg` : '-'}
                variant={caseloadData && caseloadUtilization >= caseloadData.practiceAvgUtilization ? 'positive' : 'negative'}
              />
              <StatCard
                title="Notes Overdue"
                value={selectedClinician.metrics.notesOverdue}
                subtitle={selectedClinician.metrics.notesOverdue <= 5 ? 'On track' : selectedClinician.metrics.notesOverdue <= 10 ? 'Needs attention' : 'Critical backlog'}
                variant={selectedClinician.metrics.notesOverdue <= 5 ? 'positive' : selectedClinician.metrics.notesOverdue <= 10 ? 'default' : 'negative'}
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

              {/* Clinician Cancellations Chart */}
              <ChartCard
                title="Clinician Cancellations"
                subtitle={`How often ${selectedClinician.name.split(' ')[0]} cancels sessions`}
                insights={clinicianCancellationInsights}
                minHeight="320px"
                expandable
                onExpand={() => setExpandedCard('clinician-cancellations')}
              >
                <BarChart
                  data={clinicianCancellationsBarData}
                  mode="single"
                  getBarColor={() => ({
                    gradient: 'linear-gradient(180deg, #f87171 0%, #dc2626 100%)',
                    shadow: '0 4px 12px -2px rgba(220, 38, 38, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
                    textColor: 'text-red-600',
                  })}
                  formatValue={(v) => Math.round(v).toString()}
                  yAxisLabels={(maxVal) => {
                    const max = Math.ceil(maxVal);
                    return [
                      max.toString(),
                      Math.round(max * 0.75).toString(),
                      Math.round(max * 0.5).toString(),
                      Math.round(max * 0.25).toString(),
                      '0',
                    ];
                  }}
                  height="220px"
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
              actions={
                <ActionButton
                  label="View Full Session History"
                  icon={<Calendar size={16} />}
                  onClick={() => navigate(`/clinician/${selectedClinician.id}/session-history`)}
                />
              }
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

              {/* Client Roster */}
              <ClientRosterCard
                title="Client Roster"
                subtitle={`${selectedClinician.name.split(' ')[0]}'s ${clinicianClients.length} current active clients`}
                clients={clinicianClients}
                onExpand={() => setExpandedCard('client-roster')}
              />

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
                    title="Client Modality"
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
                  height="280px"
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
          {isSpotlightMode && selectedClinician && acquisitionData && (
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
                        style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
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
                        style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
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

      {/* Monthly Revenue Expanded */}
      {selectedClinician && financialData && (
        <ExpandedChartModal
          isOpen={expandedCard === 'monthly-revenue'}
          onClose={() => setExpandedCard(null)}
          title="Monthly Gross Revenue"
          subtitle={`How much ${selectedClinician.name.split(' ')[0]} is collecting each month`}
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
            height="400px"
            size="lg"
          />
        </ExpandedChartModal>
      )}

      {/* Monthly Sessions Expanded */}
      {selectedClinician && sessionData && (
        <ExpandedChartModal
          isOpen={expandedCard === 'monthly-sessions'}
          onClose={() => setExpandedCard(null)}
          title="Monthly Sessions"
          subtitle={showWeeklyAvg ? `${selectedClinician.name.split(' ')[0]}'s average sessions per week` : `How many sessions ${selectedClinician.name.split(' ')[0]} completes each month`}
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
            height="400px"
            size="lg"
          />
        </ExpandedChartModal>
      )}

      {/* Attendance Breakdown Expanded */}
      {selectedClinician && sessionData && (
        <ExpandedChartModal
          isOpen={expandedCard === 'attendance-breakdown'}
          onClose={() => setExpandedCard(null)}
          title="Attendance Breakdown"
          subtitle={`What happens to ${selectedClinician.name.split(' ')[0]}'s booked sessions`}
        >
          <DonutChartCard
            title=""
            segments={attendanceSegments}
            centerLabel="Show Rate"
            centerValue={`${showRate.toFixed(1)}%`}
            centerValueColor={showRate >= 87.5 ? 'text-emerald-600' : 'text-rose-600'}
            valueFormat="number"
            size="lg"
          />
        </ExpandedChartModal>
      )}

      {/* Clinician Cancellations Expanded */}
      {selectedClinician && sessionData && (
        <ExpandedChartModal
          isOpen={expandedCard === 'clinician-cancellations'}
          onClose={() => setExpandedCard(null)}
          title="Clinician Cancellations"
          subtitle={`How often ${selectedClinician.name.split(' ')[0]} cancels sessions`}
        >
          <BarChart
            data={clinicianCancellationsBarData}
            mode="single"
            getBarColor={(value) => {
              const avg = totalClinicianCancelled / 12;
              return value > avg * 1.5
                ? {
                    gradient: 'linear-gradient(180deg, #f87171 0%, #dc2626 100%)',
                    shadow: '0 4px 12px -2px rgba(220, 38, 38, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
                    textColor: 'text-red-600',
                  }
                : {
                    gradient: 'linear-gradient(180deg, #60a5fa 0%, #2563eb 100%)',
                    shadow: '0 4px 12px -2px rgba(37, 99, 235, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
                    textColor: 'text-blue-600',
                  };
            }}
            formatValue={(v) => Math.round(v).toString()}
            height="400px"
            size="lg"
          />
        </ExpandedChartModal>
      )}

      {/* Caseload Capacity Expanded */}
      {selectedClinician && caseloadData && (
        <ExpandedChartModal
          isOpen={expandedCard === 'caseload-capacity'}
          onClose={() => setExpandedCard(null)}
          title="Active Clients & Caseload Capacity"
          subtitle={`How full ${selectedClinician.name.split(' ')[0]}'s caseload is each month`}
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
              height="400px"
              size="lg"
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
              height="400px"
              size="lg"
            />
          )}
        </ExpandedChartModal>
      )}

      {/* Session Frequency Expanded */}
      {selectedClinician && caseloadData && (
        <ExpandedChartModal
          isOpen={expandedCard === 'session-frequency'}
          onClose={() => setExpandedCard(null)}
          title="Client Session Frequency"
          subtitle={`How often ${selectedClinician.name.split(' ')[0]}'s clients come in`}
        >
          <DonutChartCard
            title=""
            segments={sessionFrequencySegments}
            centerLabel="Active"
            centerValue={totalSessionFrequencyClients.toString()}
            centerValueColor={weeklyEngagementPercent >= 50 ? 'text-emerald-600' : 'text-amber-600'}
            valueFormat="number"
            size="lg"
          />
        </ExpandedChartModal>
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

      {/* Client Movement Expanded */}
      {selectedClinician && caseloadData && (
        <ExpandedChartModal
          isOpen={expandedCard === 'client-movement'}
          onClose={() => setExpandedCard(null)}
          title="Churned Clients Per Month"
          subtitle={`How many clients ${selectedClinician.name.split(' ')[0]} is losing each month`}
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
            height="400px"
            yDomain={[-(Math.max(...churnedClientsData.map(d => d.negative)) + 3), 1]}
            formatNegativeLabel={(value) => Math.abs(value).toString()}
          />
        </ExpandedChartModal>
      )}

      {/* Churn Timing Expanded */}
      {selectedClinician && caseloadData && (
        <ExpandedChartModal
          isOpen={expandedCard === 'churn-timing'}
          onClose={() => setExpandedCard(null)}
          title="Churn Timing"
          subtitle={`How far ${selectedClinician.name.split(' ')[0]}'s clients get before leaving`}
        >
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
          />
        </ExpandedChartModal>
      )}

      {/* Return Rate Expanded */}
      {selectedClinician && retentionData && (
        <ExpandedChartModal
          isOpen={expandedCard === 'return-rate'}
          onClose={() => setExpandedCard(null)}
          title="Return Rate"
          subtitle={`% of clients still active at each milestone`}
          legend={[
            { label: selectedClinician.name.split(' ')[0], color: 'bg-blue-500', type: 'box' },
            { label: 'Practice Avg', color: 'bg-stone-400', type: 'box' },
            { label: 'Top Performer', color: 'bg-emerald-500', type: 'box' },
          ]}
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
            height={400}
          />
        </ExpandedChartModal>
      )}

      {/* Outstanding Notes Expanded */}
      {selectedClinician && complianceData && (
        <ExpandedChartModal
          isOpen={expandedCard === 'outstanding-notes'}
          onClose={() => setExpandedCard(null)}
          title="Outstanding Notes"
          subtitle={`How many notes ${selectedClinician.name.split(' ')[0]} needs to complete`}
        >
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
          />
        </ExpandedChartModal>
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
                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
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
                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
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
                                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
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
                                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
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
                                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
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
                        style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
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
                            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
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
                            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
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
                            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
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
                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
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
                        style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
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
                        style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
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
                                      style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
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
