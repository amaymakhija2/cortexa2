import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Check, Calendar, ChevronLeft, ChevronRight, X, TrendingUp, TrendingDown, Users, DollarSign, Activity, FileText, ArrowRight, Settings } from 'lucide-react';
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
  ToggleButton,
  ClientRosterCard,
  DataTableCard,
  StackedBarCard,
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
import { useSettings, getClinicianGoals } from '../context/SettingsContext';

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
  3: { // Priya Patel - Therapist (needs attention) - Declining caseload, high churn
    monthlyCaseload: [
      { month: 'Jan', activeClients: 24, capacity: 28, newClients: 1, churned: 3 },
      { month: 'Feb', activeClients: 22, capacity: 28, newClients: 1, churned: 3 },
      { month: 'Mar', activeClients: 21, capacity: 28, newClients: 2, churned: 3 },
      { month: 'Apr', activeClients: 20, capacity: 28, newClients: 1, churned: 2 },
      { month: 'May', activeClients: 19, capacity: 28, newClients: 1, churned: 2 },
      { month: 'Jun', activeClients: 18, capacity: 28, newClients: 1, churned: 2 },
      { month: 'Jul', activeClients: 17, capacity: 28, newClients: 1, churned: 2 },
      { month: 'Aug', activeClients: 17, capacity: 28, newClients: 2, churned: 2 },
      { month: 'Sep', activeClients: 17, capacity: 28, newClients: 2, churned: 2 },
      { month: 'Oct', activeClients: 17, capacity: 28, newClients: 2, churned: 2 },
      { month: 'Nov', activeClients: 17, capacity: 28, newClients: 2, churned: 2 },
      { month: 'Dec', activeClients: 18, capacity: 28, newClients: 3, churned: 2 },
    ],
    atRiskClients: 5,
    practiceAvgUtilization: 78,
    sessionFrequency: {
      weekly: 6,       // Low weekly engagement - concerning
      biweekly: 5,
      monthly: 4,
      inconsistent: 3, // High inconsistent - needs attention
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
  5: { // Michael Johnson - Associate Therapist (critical) - Hemorrhaging clients
    monthlyCaseload: [
      { month: 'Jan', activeClients: 16, capacity: 25, newClients: 1, churned: 3 },
      { month: 'Feb', activeClients: 14, capacity: 25, newClients: 1, churned: 3 },
      { month: 'Mar', activeClients: 13, capacity: 25, newClients: 2, churned: 3 },
      { month: 'Apr', activeClients: 12, capacity: 25, newClients: 1, churned: 2 },
      { month: 'May', activeClients: 11, capacity: 25, newClients: 1, churned: 2 },
      { month: 'Jun', activeClients: 10, capacity: 25, newClients: 1, churned: 2 },
      { month: 'Jul', activeClients: 9, capacity: 25, newClients: 1, churned: 2 },
      { month: 'Aug', activeClients: 9, capacity: 25, newClients: 2, churned: 2 },
      { month: 'Sep', activeClients: 9, capacity: 25, newClients: 2, churned: 2 },
      { month: 'Oct', activeClients: 8, capacity: 25, newClients: 1, churned: 2 },
      { month: 'Nov', activeClients: 7, capacity: 25, newClients: 1, churned: 2 },
      { month: 'Dec', activeClients: 6, capacity: 25, newClients: 1, churned: 2 },
    ],
    atRiskClients: 4,
    practiceAvgUtilization: 78,
    sessionFrequency: {
      weekly: 2,       // Very low weekly - critical issue
      biweekly: 1,
      monthly: 1,
      inconsistent: 2, // High inconsistent ratio for small caseload
    },
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
  oneYearReturnRate: number;         // % still active at 1 year
  practiceAvgOneYearReturn: number;
  beyondOneYearReturnRate: number;   // % still active beyond 1 year
  practiceAvgBeyondOneYearReturn: number;
  churnTiming: { early: number; medium: number; late: number }; // <5, 5-15, >15 sessions
}> = {
  1: { // Sarah Chen - Clinical Director (high performer)
    monthlyRebookRate: [
      { month: 'Jan', rate: 91 },
      { month: 'Feb', rate: 89 },
      { month: 'Mar', rate: 92 },
      { month: 'Apr', rate: 88 },
      { month: 'May', rate: 90 },
      { month: 'Jun', rate: 91 },
      { month: 'Jul', rate: 87 },
      { month: 'Aug', rate: 89 },
      { month: 'Sep', rate: 93 },
      { month: 'Oct', rate: 90 },
      { month: 'Nov', rate: 88 },
      { month: 'Dec', rate: 89 },
    ],
    currentRebookRate: 89,
    practiceAvgRebookRate: 78,
    avgSessionsBeforeChurn: 18.5,
    practiceAvgSessionsBeforeChurn: 12.3,
    month3ReturnRate: 92,
    practiceAvgMonth3Return: 75,
    month6ReturnRate: 88,
    practiceAvgMonth6Return: 62,
    oneYearReturnRate: 74,
    practiceAvgOneYearReturn: 45,
    beyondOneYearReturnRate: 58,
    practiceAvgBeyondOneYearReturn: 32,
    churnTiming: { early: 3, medium: 5, late: 8 }, // Most churn late = good retention
  },
  2: { // Maria Rodriguez - Senior Therapist
    monthlyRebookRate: [
      { month: 'Jan', rate: 87 },
      { month: 'Feb', rate: 85 },
      { month: 'Mar', rate: 88 },
      { month: 'Apr', rate: 84 },
      { month: 'May', rate: 86 },
      { month: 'Jun', rate: 85 },
      { month: 'Jul', rate: 83 },
      { month: 'Aug', rate: 85 },
      { month: 'Sep', rate: 87 },
      { month: 'Oct', rate: 86 },
      { month: 'Nov', rate: 84 },
      { month: 'Dec', rate: 85 },
    ],
    currentRebookRate: 85,
    practiceAvgRebookRate: 78,
    avgSessionsBeforeChurn: 15.2,
    practiceAvgSessionsBeforeChurn: 12.3,
    month3ReturnRate: 85,
    practiceAvgMonth3Return: 75,
    month6ReturnRate: 78,
    practiceAvgMonth6Return: 62,
    oneYearReturnRate: 52,
    practiceAvgOneYearReturn: 45,
    beyondOneYearReturnRate: 38,
    practiceAvgBeyondOneYearReturn: 32,
    churnTiming: { early: 4, medium: 7, late: 6 }, // Balanced churn distribution
  },
  3: { // Priya Patel - Therapist (needs attention)
    monthlyRebookRate: [
      { month: 'Jan', rate: 78 },
      { month: 'Feb', rate: 76 },
      { month: 'Mar', rate: 74 },
      { month: 'Apr', rate: 73 },
      { month: 'May', rate: 72 },
      { month: 'Jun', rate: 70 },
      { month: 'Jul', rate: 68 },
      { month: 'Aug', rate: 70 },
      { month: 'Sep', rate: 69 },
      { month: 'Oct', rate: 71 },
      { month: 'Nov', rate: 70 },
      { month: 'Dec', rate: 71 },
    ],
    currentRebookRate: 71,
    practiceAvgRebookRate: 78,
    avgSessionsBeforeChurn: 8.4,
    practiceAvgSessionsBeforeChurn: 12.3,
    month3ReturnRate: 62,
    practiceAvgMonth3Return: 75,
    month6ReturnRate: 45,
    practiceAvgMonth6Return: 62,
    oneYearReturnRate: 22,
    practiceAvgOneYearReturn: 45,
    beyondOneYearReturnRate: 12,
    practiceAvgBeyondOneYearReturn: 32,
    churnTiming: { early: 12, medium: 6, late: 2 }, // High early churn = concerning
  },
  4: { // James Kim - Associate Therapist (ramping up)
    monthlyRebookRate: [
      { month: 'Jan', rate: 79 },
      { month: 'Feb', rate: 80 },
      { month: 'Mar', rate: 81 },
      { month: 'Apr', rate: 82 },
      { month: 'May', rate: 83 },
      { month: 'Jun', rate: 81 },
      { month: 'Jul', rate: 80 },
      { month: 'Aug', rate: 82 },
      { month: 'Sep', rate: 84 },
      { month: 'Oct', rate: 83 },
      { month: 'Nov', rate: 81 },
      { month: 'Dec', rate: 82 },
    ],
    currentRebookRate: 82,
    practiceAvgRebookRate: 78,
    avgSessionsBeforeChurn: 11.8,
    practiceAvgSessionsBeforeChurn: 12.3,
    month3ReturnRate: 80,
    practiceAvgMonth3Return: 75,
    month6ReturnRate: 68,
    practiceAvgMonth6Return: 62,
    oneYearReturnRate: 42,
    practiceAvgOneYearReturn: 45,
    beyondOneYearReturnRate: 28,
    practiceAvgBeyondOneYearReturn: 32,
    churnTiming: { early: 5, medium: 4, late: 3 }, // Improving, fewer early churns
  },
  5: { // Michael Johnson - Associate Therapist (critical)
    monthlyRebookRate: [
      { month: 'Jan', rate: 72 },
      { month: 'Feb', rate: 70 },
      { month: 'Mar', rate: 68 },
      { month: 'Apr', rate: 66 },
      { month: 'May', rate: 64 },
      { month: 'Jun', rate: 62 },
      { month: 'Jul', rate: 60 },
      { month: 'Aug', rate: 62 },
      { month: 'Sep', rate: 65 },
      { month: 'Oct', rate: 63 },
      { month: 'Nov', rate: 62 },
      { month: 'Dec', rate: 64 },
    ],
    currentRebookRate: 64,
    practiceAvgRebookRate: 78,
    avgSessionsBeforeChurn: 6.2,
    practiceAvgSessionsBeforeChurn: 12.3,
    month3ReturnRate: 48,
    practiceAvgMonth3Return: 75,
    month6ReturnRate: 32,
    practiceAvgMonth6Return: 62,
    oneYearReturnRate: 15,
    practiceAvgOneYearReturn: 45,
    beyondOneYearReturnRate: 8,
    practiceAvgBeyondOneYearReturn: 32,
    churnTiming: { early: 18, medium: 8, late: 2 }, // Very high early churn = critical
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

export const ClinicianDetailsTab: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { clinicianGoals } = settings;

  // State for selectors - null means no clinician selected yet
  const [selectedClinician, setSelectedClinician] = useState<typeof MOCK_CLINICIANS[0] | null>(null);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('last-12-months');

  // Dropdown states
  const [isClinicianDropdownOpen, setIsClinicianDropdownOpen] = useState(false);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  // Animation state for clinician change
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Toggle for sessions view (monthly total vs weekly average)
  const [showWeeklyAvg, setShowWeeklyAvg] = useState(false);

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
  // Merge with any overrides from settings context
  const masterClinicianData = useMemo(() => {
    if (!selectedClinician) return null;
    const master = MASTER_CLINICIANS.find(c => c.id === String(selectedClinician.id));
    if (!master) return null;
    const goals = getClinicianGoals(
      master.id,
      { sessionGoal: master.sessionGoal, clientGoal: master.clientGoal, takeRate: master.takeRate },
      clinicianGoals
    );
    return { ...master, ...goals };
  }, [selectedClinician, clinicianGoals]);

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

  // Client movement chart data for DivergingBarChart
  const clientMovementData = useMemo(() => {
    if (!caseloadData) return [];
    return caseloadData.monthlyCaseload.map(item => ({
      label: item.month,
      positive: item.newClients,
      negative: item.churned,
    }));
  }, [caseloadData]);

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
    const month3Diff = retentionData.month3ReturnRate - retentionData.practiceAvgMonth3Return;
    const month6Diff = retentionData.month6ReturnRate - retentionData.practiceAvgMonth6Return;
    const oneYearDiff = retentionData.oneYearReturnRate - retentionData.practiceAvgOneYearReturn;
    const beyondOneYearDiff = retentionData.beyondOneYearReturnRate - retentionData.practiceAvgBeyondOneYearReturn;

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
      {
        id: 'month3',
        label: 'Month 3 Return Rate',
        values: {
          clinician: `${retentionData.month3ReturnRate}%`,
          practice: `${retentionData.practiceAvgMonth3Return}%`,
          diff: month3Diff >= 0 ? `+${month3Diff}%` : `${month3Diff}%`,
        },
        valueColor: month3Diff >= 0 ? 'text-emerald-600' : 'text-rose-600',
        indicator: { color: month3Diff >= 0 ? '#10b981' : '#f43f5e' },
      },
      {
        id: 'month6',
        label: 'Month 6 Return Rate',
        values: {
          clinician: `${retentionData.month6ReturnRate}%`,
          practice: `${retentionData.practiceAvgMonth6Return}%`,
          diff: month6Diff >= 0 ? `+${month6Diff}%` : `${month6Diff}%`,
        },
        valueColor: month6Diff >= 0 ? 'text-emerald-600' : 'text-rose-600',
        indicator: { color: month6Diff >= 0 ? '#10b981' : '#f43f5e' },
      },
      {
        id: 'oneYear',
        label: '1-Year Return Rate',
        values: {
          clinician: `${retentionData.oneYearReturnRate}%`,
          practice: `${retentionData.practiceAvgOneYearReturn}%`,
          diff: oneYearDiff >= 0 ? `+${oneYearDiff}%` : `${oneYearDiff}%`,
        },
        valueColor: oneYearDiff >= 0 ? 'text-emerald-600' : 'text-rose-600',
        indicator: { color: oneYearDiff >= 0 ? '#10b981' : '#f43f5e' },
      },
      {
        id: 'beyondOneYear',
        label: 'Beyond 1-Year Return Rate',
        values: {
          clinician: `${retentionData.beyondOneYearReturnRate}%`,
          practice: `${retentionData.practiceAvgBeyondOneYearReturn}%`,
          diff: beyondOneYearDiff >= 0 ? `+${beyondOneYearDiff}%` : `${beyondOneYearDiff}%`,
        },
        valueColor: beyondOneYearDiff >= 0 ? 'text-emerald-600' : 'text-rose-600',
        indicator: { color: beyondOneYearDiff >= 0 ? '#10b981' : '#f43f5e' },
      },
    ];
  }, [retentionData, selectedClinician]);

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
                  </div>
                </div>

                {/* ROW 2: Metadata Cards + AI Insight */}
                <div className="flex flex-col lg:flex-row items-stretch gap-6 lg:gap-8">

                  {/* Metadata Cards - Clean grid layout (4 items) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
                    {/* Tenure */}
                    <div
                      className="px-5 py-4 rounded-2xl"
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      <p className="text-stone-500 text-xs uppercase tracking-wider mb-1">Tenure</p>
                      <p className="text-white text-base lg:text-lg font-medium">{selectedClinician.tenure}</p>
                    </div>

                    {/* Take Rate */}
                    <div
                      className="px-5 py-4 rounded-2xl"
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      <p className="text-stone-500 text-xs uppercase tracking-wider mb-1">Take Rate</p>
                      <p className="text-white text-base lg:text-lg font-medium">{selectedClinician.takeRate}%</p>
                    </div>

                    {/* Session Goal - Clickable */}
                    <button
                      onClick={() => navigate('/configure?tab=clinician-goals')}
                      className="px-5 py-4 rounded-2xl text-left transition-all duration-200 hover:scale-[1.02] group"
                      style={{
                        background: 'rgba(251, 191, 36, 0.1)',
                        border: '1px solid rgba(251, 191, 36, 0.2)',
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-amber-400/80 text-xs uppercase tracking-wider">Session Goal</p>
                        <Settings size={12} className="text-amber-400/60 group-hover:text-amber-400 transition-colors" />
                      </div>
                      <p className="text-amber-100 text-base lg:text-lg font-medium">
                        {masterClinicianData?.sessionGoal || '-'}/week
                      </p>
                    </button>

                    {/* Caseload Goal - Clickable */}
                    <button
                      onClick={() => navigate('/configure?tab=clinician-goals')}
                      className="px-5 py-4 rounded-2xl text-left transition-all duration-200 hover:scale-[1.02] group"
                      style={{
                        background: 'rgba(251, 191, 36, 0.1)',
                        border: '1px solid rgba(251, 191, 36, 0.2)',
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-amber-400/80 text-xs uppercase tracking-wider">Caseload Goal</p>
                        <Settings size={12} className="text-amber-400/60 group-hover:text-amber-400 transition-colors" />
                      </div>
                      <p className="text-amber-100 text-base lg:text-lg font-medium">
                        {masterClinicianData?.clientGoal || '-'} clients
                      </p>
                    </button>
                  </div>

                  {/* AI Insight - Editorial quote style */}
                  <div
                    className="flex-1 px-6 py-5 rounded-2xl relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, rgba(251, 191, 36, 0.03) 100%)',
                      border: '1px solid rgba(251, 191, 36, 0.15)',
                    }}
                  >
                    {/* Decorative quote mark */}
                    <div
                      className="absolute -top-2 left-4 text-7xl leading-none opacity-20 pointer-events-none"
                      style={{ fontFamily: "'DM Serif Display', Georgia, serif", color: '#f59e0b' }}
                    >
                      "
                    </div>
                    <div className="relative">
                      <p className="text-amber-100/60 text-xs uppercase tracking-wider mb-2">AI Insight</p>
                      <p
                        className="text-stone-200 text-lg lg:text-xl leading-relaxed"
                        style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                      >
                        {selectedClinician.insight}
                      </p>
                    </div>
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
                <p className="text-stone-500 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
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
                          <p className="text-base text-stone-500">{clinician.role}</p>
                        </div>

                        {/* Quick metrics row */}
                        <div className="flex items-center gap-5 pt-4 border-t border-stone-200/60">
                          <div className="flex-1">
                            <p className="text-xs uppercase tracking-wider text-stone-400 mb-1">Last Month</p>
                            <p className="text-lg font-semibold text-stone-800">
                              ${(CLINICIAN_FINANCIAL_DATA[clinician.id]?.monthlyRevenue[CLINICIAN_FINANCIAL_DATA[clinician.id]?.monthlyRevenue.length - 1]?.value / 1000).toFixed(1)}k
                            </p>
                          </div>
                          <div className="w-px h-10 bg-stone-200/60" />
                          <div className="flex-1">
                            <p className="text-xs uppercase tracking-wider text-stone-400 mb-1">Clients</p>
                            <p className="text-lg font-semibold text-stone-800">
                              {CLINICIAN_CASELOAD_DATA[clinician.id]?.monthlyCaseload[CLINICIAN_CASELOAD_DATA[clinician.id]?.monthlyCaseload.length - 1]?.activeClients || 0}
                            </p>
                          </div>
                          <div className="w-px h-10 bg-stone-200/60" />
                          <div className="flex-1">
                            <p className="text-xs uppercase tracking-wider text-stone-400 mb-1">Completed Sessions</p>
                            <p className="text-lg font-semibold text-stone-800">
                              {CLINICIAN_SESSION_DATA[clinician.id]?.monthlySessions[CLINICIAN_SESSION_DATA[clinician.id]?.monthlySessions.length - 1]?.completed || 0}
                            </p>
                          </div>
                        </div>

                        {/* Hover arrow indicator */}
                        <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                          <ArrowRight size={22} className="text-stone-400" strokeWidth={1.5} />
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
                title="Completed Sessions"
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
                title="Completed Sessions Per Month"
                subtitle={showWeeklyAvg ? `${selectedClinician.name.split(' ')[0]}'s average sessions per week` : `How many sessions ${selectedClinician.name.split(' ')[0]} is completing each month`}
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
              />

              {/* Clinician Cancellations Chart */}
              <ChartCard
                title="Clinician Cancellations"
                subtitle={`How often ${selectedClinician.name.split(' ')[0]} cancels sessions`}
                insights={clinicianCancellationInsights}
                minHeight="320px"
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
              {/* New and Churned Clients Chart */}
              <ChartCard
                title="New and Churned Clients Per Month"
                subtitle={`How ${selectedClinician.name.split(' ')[0]}'s client base is changing`}
                headerControls={
                  <div className="flex items-center gap-5 bg-stone-50 rounded-xl px-5 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-md bg-gradient-to-b from-emerald-400 to-emerald-500"></div>
                      <span className="text-stone-700 text-base font-semibold">New</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-md bg-gradient-to-b from-rose-400 to-rose-500"></div>
                      <span className="text-stone-700 text-base font-semibold">Churned</span>
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
                  height="280px"
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
              />

              {/* Retention Comparison Table */}
              <DataTableCard
                title="Retention Comparison"
                subtitle={`How ${selectedClinician.name.split(' ')[0]}'s retention compares to the practice`}
                columns={retentionTableColumns}
                rows={retentionTableRows}
              />
            </Grid>
          </SectionContainer>
          )}

          {/* ---------------------------------------------------------
              SECTION 5: Compliance
              --------------------------------------------------------- */}
          {isSpotlightMode && selectedClinician && complianceData && (
          <SectionContainer accent="stone" index={4} isLast>
            <SectionHeader
              number={5}
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
                      <p className="text-stone-500 text-base sm:text-lg xl:text-xl mt-2">
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
                      <div className="text-stone-500 text-base mt-1">overdue</div>
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
                    <p className="text-stone-500 text-sm">No overdue notes</p>
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
                          <p className="text-stone-900 font-semibold text-base truncate">{note.clientName}</p>
                          <p className="text-stone-500 text-sm">{note.sessionDate} · {note.sessionType}</p>
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
    </>
  );
};

export default ClinicianDetailsTab;
