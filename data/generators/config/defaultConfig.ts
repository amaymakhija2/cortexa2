// =============================================================================
// DEFAULT DEMO CONFIGURATION
// =============================================================================
// Default values for all demo configuration options.
// This serves as the baseline that presets and custom configs build upon.
// =============================================================================

import type {
  DemoConfiguration,
  PracticeIdentity,
  ClinicianConfig,
  FinancialConfig,
  PerformanceStory,
  PerformanceMetrics,
  Seasonality,
  FeatureFlags,
  DataRange,
} from '../types';

// =============================================================================
// DEFAULT PRACTICE IDENTITY
// =============================================================================

export const DEFAULT_PRACTICE: PracticeIdentity = {
  name: 'Clarity Counseling Center',
  shortName: 'Clarity',
  location: {
    city: 'Brooklyn',
    state: 'NY',
    region: 'Northeast',
  },
  specialty: 'general',
  yearEstablished: 2021,
};

// =============================================================================
// DEFAULT CLINICIANS (5 clinicians for a medium practice)
// =============================================================================

export const DEFAULT_CLINICIANS: ClinicianConfig[] = [
  {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Chen',
    credential: 'PhD',
    title: 'Clinical Director',
    role: 'owner',
    color: '#6366f1', // Indigo
    performanceProfile: {
      revenueLevel: 'high',
      retentionStrength: 'strong',
      consultationConversion: 'high',
      notesCompliance: 'excellent',
    },
    caseload: {
      targetClients: 30,
      currentClients: 28,
      sessionGoal: 120,
      takeRate: 0.55,
    },
    startDate: '2021-01-15',
    isActive: true,
    location: 'Manhattan',
  },
  {
    id: '2',
    firstName: 'Maria',
    lastName: 'Rodriguez',
    credential: 'LCSW',
    title: 'Senior Therapist',
    role: 'senior',
    color: '#f59e0b', // Amber
    performanceProfile: {
      revenueLevel: 'high',
      retentionStrength: 'strong',
      consultationConversion: 'medium',
      notesCompliance: 'good',
    },
    caseload: {
      targetClients: 28,
      currentClients: 26,
      sessionGoal: 110,
      takeRate: 0.50,
    },
    startDate: '2021-03-01',
    isActive: true,
    location: 'Brooklyn',
  },
  {
    id: '3',
    firstName: 'Priya',
    lastName: 'Patel',
    credential: 'LPC',
    title: 'Staff Therapist',
    role: 'staff',
    color: '#10b981', // Emerald
    performanceProfile: {
      revenueLevel: 'medium',
      retentionStrength: 'average',
      consultationConversion: 'medium',
      notesCompliance: 'good',
    },
    caseload: {
      targetClients: 25,
      currentClients: 23,
      sessionGoal: 100,
      takeRate: 0.45,
    },
    startDate: '2022-06-15',
    isActive: true,
    location: 'Brooklyn',
  },
  {
    id: '4',
    firstName: 'James',
    lastName: 'Kim',
    credential: 'LMFT',
    title: 'Staff Therapist',
    role: 'staff',
    color: '#8b5cf6', // Violet
    performanceProfile: {
      revenueLevel: 'medium',
      retentionStrength: 'average',
      consultationConversion: 'medium',
      notesCompliance: 'good',
    },
    caseload: {
      targetClients: 24,
      currentClients: 22,
      sessionGoal: 95,
      takeRate: 0.45,
    },
    startDate: '2022-09-01',
    isActive: true,
    location: 'Remote',
  },
  {
    id: '5',
    firstName: 'Michael',
    lastName: 'Johnson',
    credential: 'APC',
    title: 'Associate Therapist',
    role: 'associate',
    color: '#ec4899', // Pink
    performanceProfile: {
      revenueLevel: 'low',
      retentionStrength: 'weak',
      consultationConversion: 'low',
      notesCompliance: 'needs_work',
    },
    caseload: {
      targetClients: 20,
      currentClients: 18,
      sessionGoal: 80,
      takeRate: 0.40,
    },
    supervisorId: '1',
    startDate: '2024-01-15',
    isActive: true,
    location: 'Brooklyn',
  },
];

// =============================================================================
// DEFAULT FINANCIAL CONFIGURATION
// =============================================================================

export const DEFAULT_FINANCIAL: FinancialConfig = {
  practiceSize: 'medium',
  monthlyRevenueRange: {
    min: 140000,
    max: 160000,
  },
  averageSessionRate: 200,
  clinicianTakeRate: 0.47,
  supervisorCostRate: 0.10,
  creditCardFeeRate: 0.03,
  revenueGoal: 150000,
  sessionGoal: 750,
  payerMix: {
    selfPay: 40,
    insurance: 55,
    slidingScale: 5,
  },
};

// =============================================================================
// DEFAULT PERFORMANCE METRICS
// =============================================================================

export const DEFAULT_PERFORMANCE_METRICS: PerformanceMetrics = {
  // Attendance & Engagement
  showRate: 0.90,
  rebookRate: 0.88,
  cancelRate: 0.08,
  noShowRate: 0.02,

  // Retention
  monthlyChurnRate: 0.03,
  sessionRetention: {
    session2: 88,
    session5: 76,
    session12: 60,
    session24: 43,
  },

  // Consultations
  monthlyConsultations: 12,
  consultConversionRate: 0.65,
  daysToFirstSession: 7,

  // Admin Health
  notesCompletionRate: 0.92,
  notesOverdueRate: 0.05,

  // Growth
  monthOverMonthGrowth: 0.02,
  newClientsPerMonth: 8,
};

// =============================================================================
// DEFAULT SEASONALITY
// =============================================================================

export const DEFAULT_SEASONALITY: Seasonality = {
  q1Modifier: 0.95,  // January slow, February picks up
  q2Modifier: 1.05,  // Spring is busy
  q3Modifier: 0.90,  // Summer slump
  q4Modifier: 1.10,  // Fall is busiest
};

// =============================================================================
// DEFAULT PERFORMANCE STORY
// =============================================================================

export const DEFAULT_PERFORMANCE: PerformanceStory = {
  narrative: 'stable',
  metrics: DEFAULT_PERFORMANCE_METRICS,
  seasonality: DEFAULT_SEASONALITY,
  trend: 'stable',
};

// =============================================================================
// DEFAULT DATA RANGE
// =============================================================================

export const DEFAULT_DATA_RANGE: DataRange = {
  startDate: '2023-02-01',
  endDate: '2025-12-31',
};

// =============================================================================
// DEFAULT FEATURE FLAGS
// =============================================================================

export const DEFAULT_FEATURES: FeatureFlags = {
  showNetRevenue: true,
  showInsuranceTab: true,
  showAdminTab: true,
  enableConsultationsCRM: true,
};

// =============================================================================
// COMPLETE DEFAULT CONFIGURATION
// =============================================================================

export const DEFAULT_CONFIG: DemoConfiguration = {
  id: 'default',
  name: 'Default Demo',
  description: 'A stable medium-sized therapy practice in Brooklyn',

  practice: DEFAULT_PRACTICE,
  clinicians: DEFAULT_CLINICIANS,
  financial: DEFAULT_FINANCIAL,
  performance: DEFAULT_PERFORMANCE,

  dataRange: DEFAULT_DATA_RANGE,
  randomSeed: 42,
  features: DEFAULT_FEATURES,

  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// =============================================================================
// NARRATIVE PRESET METRICS
// =============================================================================
// Pre-defined metric adjustments for each performance narrative

export const NARRATIVE_METRICS: Record<string, Partial<PerformanceMetrics>> = {
  thriving: {
    showRate: 0.93,
    rebookRate: 0.92,
    cancelRate: 0.05,
    noShowRate: 0.02,
    monthlyChurnRate: 0.02,
    consultConversionRate: 0.75,
    notesCompletionRate: 0.97,
    notesOverdueRate: 0.02,
    monthOverMonthGrowth: 0.03,
  },
  growth_phase: {
    showRate: 0.88,
    rebookRate: 0.86,
    cancelRate: 0.09,
    noShowRate: 0.03,
    monthlyChurnRate: 0.035,
    consultConversionRate: 0.70,
    notesCompletionRate: 0.88,
    notesOverdueRate: 0.08,
    monthOverMonthGrowth: 0.06,
  },
  stable: {
    showRate: 0.90,
    rebookRate: 0.88,
    cancelRate: 0.08,
    noShowRate: 0.02,
    monthlyChurnRate: 0.03,
    consultConversionRate: 0.65,
    notesCompletionRate: 0.92,
    notesOverdueRate: 0.05,
    monthOverMonthGrowth: 0.01,
  },
  struggling: {
    showRate: 0.78,
    rebookRate: 0.74,
    cancelRate: 0.15,
    noShowRate: 0.07,
    monthlyChurnRate: 0.07,
    consultConversionRate: 0.45,
    notesCompletionRate: 0.72,
    notesOverdueRate: 0.18,
    monthOverMonthGrowth: -0.03,
  },
  turnaround: {
    showRate: 0.84,
    rebookRate: 0.82,
    cancelRate: 0.11,
    noShowRate: 0.05,
    monthlyChurnRate: 0.045,
    consultConversionRate: 0.58,
    notesCompletionRate: 0.84,
    notesOverdueRate: 0.10,
    monthOverMonthGrowth: 0.04,
  },
  seasonal_dip: {
    showRate: 0.85,
    rebookRate: 0.83,
    cancelRate: 0.10,
    noShowRate: 0.05,
    monthlyChurnRate: 0.05,
    consultConversionRate: 0.55,
    notesCompletionRate: 0.88,
    notesOverdueRate: 0.08,
    monthOverMonthGrowth: -0.02,
  },
};

// =============================================================================
// PRACTICE SIZE PRESETS
// =============================================================================

export const PRACTICE_SIZE_PRESETS: Record<string, Partial<FinancialConfig>> = {
  solo: {
    practiceSize: 'solo',
    monthlyRevenueRange: { min: 15000, max: 25000 },
    averageSessionRate: 175,
    revenueGoal: 20000,
    sessionGoal: 100,
  },
  small: {
    practiceSize: 'small',
    monthlyRevenueRange: { min: 80000, max: 120000 },
    averageSessionRate: 185,
    revenueGoal: 100000,
    sessionGoal: 500,
  },
  medium: {
    practiceSize: 'medium',
    monthlyRevenueRange: { min: 140000, max: 180000 },
    averageSessionRate: 200,
    revenueGoal: 160000,
    sessionGoal: 800,
  },
  large: {
    practiceSize: 'large',
    monthlyRevenueRange: { min: 280000, max: 400000 },
    averageSessionRate: 220,
    revenueGoal: 350000,
    sessionGoal: 1600,
  },
};

// =============================================================================
// CLINICIAN COLOR PALETTE
// =============================================================================
// Pre-defined colors for clinicians that work well together

export const CLINICIAN_COLORS = [
  '#6366f1', // Indigo
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#06b6d4', // Cyan
  '#a855f7', // Purple
  '#84cc16', // Lime
];
