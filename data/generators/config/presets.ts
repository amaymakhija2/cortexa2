// =============================================================================
// DEMO PRESETS - Complete Preset Configurations
// =============================================================================
// Full configurations for each demo scenario. These provide realistic,
// internally consistent data for different practice situations.
// =============================================================================

import type {
  DemoPreset,
  DemoConfiguration,
  ClinicianConfig,
  FinancialConfig,
  PerformanceStory,
  PerformanceMetrics,
  PracticeIdentity,
  Seasonality,
} from '../types';

import { CLINICIAN_COLORS } from './defaultConfig';

// =============================================================================
// HELPER: Generate session retention based on churn rate
// =============================================================================

function generateRetention(baseChurn: number): {
  session2: number;
  session5: number;
  session12: number;
  session24: number;
} {
  // Lower churn = better retention at each milestone
  const churnFactor = 1 - baseChurn;
  return {
    session2: Math.round(95 * churnFactor * 100) / 100,
    session5: Math.round(82 * churnFactor * 100) / 100,
    session12: Math.round(68 * churnFactor * 100) / 100,
    session24: Math.round(52 * churnFactor * 100) / 100,
  };
}

// =============================================================================
// PRESET: DEFAULT (Stable Medium Practice)
// =============================================================================

const DEFAULT_PRESET_CONFIG: Partial<DemoConfiguration> = {};

// =============================================================================
// PRESET: THRIVING PRACTICE
// =============================================================================
// A well-run practice with excellent metrics across the board.
// High show rates, strong retention, excellent admin compliance.
// =============================================================================

const THRIVING_CLINICIANS: ClinicianConfig[] = [
  {
    id: '1',
    firstName: 'Elena',
    lastName: 'Martinez',
    credential: 'PhD',
    title: 'Clinical Director',
    role: 'owner',
    color: CLINICIAN_COLORS[0],
    performanceProfile: {
      revenueLevel: 'high',
      retentionStrength: 'strong',
      consultationConversion: 'high',
      notesCompliance: 'excellent',
    },
    caseload: {
      targetClients: 32,
      currentClients: 31,
      sessionGoal: 130,
      takeRate: 0.55,
    },
    startDate: '2019-03-01',
    isActive: true,
    location: 'Main Office',
  },
  {
    id: '2',
    firstName: 'David',
    lastName: 'Thompson',
    credential: 'LCSW',
    title: 'Senior Therapist',
    role: 'senior',
    color: CLINICIAN_COLORS[1],
    performanceProfile: {
      revenueLevel: 'high',
      retentionStrength: 'strong',
      consultationConversion: 'high',
      notesCompliance: 'excellent',
    },
    caseload: {
      targetClients: 30,
      currentClients: 29,
      sessionGoal: 120,
      takeRate: 0.50,
    },
    startDate: '2019-06-15',
    isActive: true,
    location: 'Main Office',
  },
  {
    id: '3',
    firstName: 'Rachel',
    lastName: 'Cohen',
    credential: 'LPC',
    title: 'Senior Therapist',
    role: 'senior',
    color: CLINICIAN_COLORS[2],
    performanceProfile: {
      revenueLevel: 'high',
      retentionStrength: 'strong',
      consultationConversion: 'medium',
      notesCompliance: 'excellent',
    },
    caseload: {
      targetClients: 28,
      currentClients: 27,
      sessionGoal: 115,
      takeRate: 0.48,
    },
    startDate: '2020-01-10',
    isActive: true,
    location: 'Downtown',
  },
  {
    id: '4',
    firstName: 'Marcus',
    lastName: 'Williams',
    credential: 'LMFT',
    title: 'Staff Therapist',
    role: 'staff',
    color: CLINICIAN_COLORS[3],
    performanceProfile: {
      revenueLevel: 'medium',
      retentionStrength: 'strong',
      consultationConversion: 'high',
      notesCompliance: 'good',
    },
    caseload: {
      targetClients: 26,
      currentClients: 25,
      sessionGoal: 105,
      takeRate: 0.45,
    },
    startDate: '2021-09-01',
    isActive: true,
    location: 'Main Office',
  },
  {
    id: '5',
    firstName: 'Lisa',
    lastName: 'Park',
    credential: 'LMHC',
    title: 'Staff Therapist',
    role: 'staff',
    color: CLINICIAN_COLORS[4],
    performanceProfile: {
      revenueLevel: 'medium',
      retentionStrength: 'average',
      consultationConversion: 'medium',
      notesCompliance: 'good',
    },
    caseload: {
      targetClients: 25,
      currentClients: 24,
      sessionGoal: 100,
      takeRate: 0.45,
    },
    startDate: '2022-03-15',
    isActive: true,
    location: 'Remote',
  },
  {
    id: '6',
    firstName: 'Alex',
    lastName: 'Rivera',
    credential: 'APC',
    title: 'Associate Therapist',
    role: 'associate',
    color: CLINICIAN_COLORS[5],
    performanceProfile: {
      revenueLevel: 'medium',
      retentionStrength: 'average',
      consultationConversion: 'medium',
      notesCompliance: 'good',
    },
    caseload: {
      targetClients: 22,
      currentClients: 20,
      sessionGoal: 85,
      takeRate: 0.40,
    },
    supervisorId: '1',
    startDate: '2023-06-01',
    isActive: true,
    location: 'Main Office',
  },
];

const THRIVING_PRACTICE: PracticeIdentity = {
  name: 'Mindful Horizons Therapy',
  shortName: 'Mindful Horizons',
  location: {
    city: 'San Francisco',
    state: 'CA',
    region: 'West',
  },
  specialty: 'anxiety',
  yearEstablished: 2019,
};

const THRIVING_FINANCIAL: FinancialConfig = {
  practiceSize: 'medium',
  monthlyRevenueRange: {
    min: 180000,
    max: 220000,
  },
  averageSessionRate: 225,
  clinicianTakeRate: 0.47,
  supervisorCostRate: 0.10,
  creditCardFeeRate: 0.025,
  revenueGoal: 200000,
  sessionGoal: 900,
  payerMix: {
    selfPay: 50,
    insurance: 45,
    slidingScale: 5,
  },
};

const THRIVING_METRICS: PerformanceMetrics = {
  showRate: 0.94,
  rebookRate: 0.93,
  cancelRate: 0.04,
  noShowRate: 0.02,
  monthlyChurnRate: 0.018,
  sessionRetention: generateRetention(0.018),
  monthlyConsultations: 18,
  consultConversionRate: 0.78,
  daysToFirstSession: 5,
  notesCompletionRate: 0.98,
  notesOverdueRate: 0.01,
  monthOverMonthGrowth: 0.025,
  newClientsPerMonth: 12,
};

const THRIVING_PERFORMANCE: PerformanceStory = {
  narrative: 'thriving',
  metrics: THRIVING_METRICS,
  seasonality: {
    q1Modifier: 0.98,
    q2Modifier: 1.03,
    q3Modifier: 0.95,
    q4Modifier: 1.04,
  },
  trend: 'improving',
};

const THRIVING_PRESET_CONFIG: Partial<DemoConfiguration> = {
  name: 'Thriving Practice Demo',
  description: 'A high-performing anxiety specialty practice in San Francisco with excellent metrics',
  practice: THRIVING_PRACTICE,
  clinicians: THRIVING_CLINICIANS,
  financial: THRIVING_FINANCIAL,
  performance: THRIVING_PERFORMANCE,
};

// =============================================================================
// PRESET: GROWING PRACTICE
// =============================================================================
// A rapidly expanding practice. Good fundamentals but showing strain.
// High new client volume, some admin backlog, hiring challenges.
// =============================================================================

const GROWING_CLINICIANS: ClinicianConfig[] = [
  {
    id: '1',
    firstName: 'Jennifer',
    lastName: 'Okonkwo',
    credential: 'PsyD',
    title: 'Founder & Clinical Director',
    role: 'owner',
    color: CLINICIAN_COLORS[0],
    performanceProfile: {
      revenueLevel: 'high',
      retentionStrength: 'strong',
      consultationConversion: 'high',
      notesCompliance: 'good', // Busy with admin
    },
    caseload: {
      targetClients: 28,
      currentClients: 32, // Over capacity
      sessionGoal: 115,
      takeRate: 0.55,
    },
    startDate: '2021-06-01',
    isActive: true,
    location: 'Austin HQ',
  },
  {
    id: '2',
    firstName: 'Kevin',
    lastName: 'Nguyen',
    credential: 'LCSW',
    title: 'Lead Therapist',
    role: 'senior',
    color: CLINICIAN_COLORS[1],
    performanceProfile: {
      revenueLevel: 'high',
      retentionStrength: 'average',
      consultationConversion: 'medium',
      notesCompliance: 'good',
    },
    caseload: {
      targetClients: 26,
      currentClients: 29, // Over capacity
      sessionGoal: 105,
      takeRate: 0.48,
    },
    startDate: '2022-01-15',
    isActive: true,
    location: 'Austin HQ',
  },
  {
    id: '3',
    firstName: 'Amanda',
    lastName: 'Foster',
    credential: 'LPC',
    title: 'Staff Therapist',
    role: 'staff',
    color: CLINICIAN_COLORS[2],
    performanceProfile: {
      revenueLevel: 'medium',
      retentionStrength: 'average',
      consultationConversion: 'medium',
      notesCompliance: 'needs_work', // New and learning
    },
    caseload: {
      targetClients: 24,
      currentClients: 26,
      sessionGoal: 95,
      takeRate: 0.45,
    },
    startDate: '2023-03-01',
    isActive: true,
    location: 'Remote',
  },
  {
    id: '4',
    firstName: 'Carlos',
    lastName: 'Mendez',
    credential: 'LMFT',
    title: 'Staff Therapist',
    role: 'staff',
    color: CLINICIAN_COLORS[3],
    performanceProfile: {
      revenueLevel: 'medium',
      retentionStrength: 'average',
      consultationConversion: 'low', // Still building skills
      notesCompliance: 'good',
    },
    caseload: {
      targetClients: 22,
      currentClients: 24,
      sessionGoal: 90,
      takeRate: 0.45,
    },
    startDate: '2023-08-15',
    isActive: true,
    location: 'Austin HQ',
  },
  {
    id: '5',
    firstName: 'Taylor',
    lastName: 'Brooks',
    credential: 'APC',
    title: 'Associate Therapist',
    role: 'associate',
    color: CLINICIAN_COLORS[4],
    performanceProfile: {
      revenueLevel: 'low',
      retentionStrength: 'weak',
      consultationConversion: 'low',
      notesCompliance: 'needs_work',
    },
    caseload: {
      targetClients: 18,
      currentClients: 20,
      sessionGoal: 75,
      takeRate: 0.38,
    },
    supervisorId: '1',
    startDate: '2024-02-01',
    isActive: true,
    location: 'Remote',
  },
];

const GROWING_PRACTICE: PracticeIdentity = {
  name: 'Thrive Therapy Collective',
  shortName: 'Thrive',
  location: {
    city: 'Austin',
    state: 'TX',
    region: 'Southwest',
  },
  specialty: 'general',
  yearEstablished: 2021,
};

const GROWING_FINANCIAL: FinancialConfig = {
  practiceSize: 'small',
  monthlyRevenueRange: {
    min: 110000,
    max: 150000,
  },
  averageSessionRate: 195,
  clinicianTakeRate: 0.45,
  supervisorCostRate: 0.12,
  creditCardFeeRate: 0.03,
  revenueGoal: 140000,
  sessionGoal: 700,
  payerMix: {
    selfPay: 35,
    insurance: 58,
    slidingScale: 7,
  },
};

const GROWING_METRICS: PerformanceMetrics = {
  showRate: 0.87,
  rebookRate: 0.84,
  cancelRate: 0.10,
  noShowRate: 0.03,
  monthlyChurnRate: 0.038,
  sessionRetention: generateRetention(0.038),
  monthlyConsultations: 22, // High demand
  consultConversionRate: 0.68,
  daysToFirstSession: 10, // Longer wait times
  notesCompletionRate: 0.85,
  notesOverdueRate: 0.10,
  monthOverMonthGrowth: 0.065, // Rapid growth
  newClientsPerMonth: 15,
};

const GROWING_PERFORMANCE: PerformanceStory = {
  narrative: 'growth_phase',
  metrics: GROWING_METRICS,
  seasonality: {
    q1Modifier: 1.02,
    q2Modifier: 1.05,
    q3Modifier: 0.92,
    q4Modifier: 1.01,
  },
  trend: 'improving',
};

const GROWING_PRESET_CONFIG: Partial<DemoConfiguration> = {
  name: 'Growing Practice Demo',
  description: 'A rapidly expanding practice in Austin with high demand and growing pains',
  practice: GROWING_PRACTICE,
  clinicians: GROWING_CLINICIANS,
  financial: GROWING_FINANCIAL,
  performance: GROWING_PERFORMANCE,
};

// =============================================================================
// PRESET: STRUGGLING PRACTICE
// =============================================================================
// A practice facing significant challenges. High churn, low conversion,
// admin issues. Needs intervention to turn around.
// =============================================================================

const STRUGGLING_CLINICIANS: ClinicianConfig[] = [
  {
    id: '1',
    firstName: 'Robert',
    lastName: 'Anderson',
    credential: 'LCSW',
    title: 'Practice Owner',
    role: 'owner',
    color: CLINICIAN_COLORS[0],
    performanceProfile: {
      revenueLevel: 'medium',
      retentionStrength: 'average',
      consultationConversion: 'medium',
      notesCompliance: 'good',
    },
    caseload: {
      targetClients: 28,
      currentClients: 22, // Under capacity
      sessionGoal: 110,
      takeRate: 0.55,
    },
    startDate: '2018-04-01',
    isActive: true,
    location: 'Office',
  },
  {
    id: '2',
    firstName: 'Michelle',
    lastName: 'Wright',
    credential: 'LPC',
    title: 'Staff Therapist',
    role: 'staff',
    color: CLINICIAN_COLORS[1],
    performanceProfile: {
      revenueLevel: 'low',
      retentionStrength: 'weak',
      consultationConversion: 'low',
      notesCompliance: 'needs_work',
    },
    caseload: {
      targetClients: 24,
      currentClients: 16, // Significantly under
      sessionGoal: 95,
      takeRate: 0.45,
    },
    startDate: '2021-09-01',
    isActive: true,
    location: 'Office',
  },
  {
    id: '3',
    firstName: 'Brian',
    lastName: 'Taylor',
    credential: 'LMFT',
    title: 'Staff Therapist',
    role: 'staff',
    color: CLINICIAN_COLORS[2],
    performanceProfile: {
      revenueLevel: 'low',
      retentionStrength: 'weak',
      consultationConversion: 'low',
      notesCompliance: 'needs_work',
    },
    caseload: {
      targetClients: 22,
      currentClients: 14,
      sessionGoal: 85,
      takeRate: 0.45,
    },
    startDate: '2022-06-15',
    isActive: true,
    location: 'Remote',
  },
  {
    id: '4',
    firstName: 'Susan',
    lastName: 'Davis',
    credential: 'APC',
    title: 'Associate Therapist',
    role: 'associate',
    color: CLINICIAN_COLORS[3],
    performanceProfile: {
      revenueLevel: 'low',
      retentionStrength: 'weak',
      consultationConversion: 'low',
      notesCompliance: 'needs_work',
    },
    caseload: {
      targetClients: 18,
      currentClients: 10,
      sessionGoal: 70,
      takeRate: 0.38,
    },
    supervisorId: '1',
    startDate: '2023-11-01',
    isActive: true,
    location: 'Office',
  },
];

const STRUGGLING_PRACTICE: PracticeIdentity = {
  name: 'Peaceful Minds Counseling',
  shortName: 'Peaceful Minds',
  location: {
    city: 'Cleveland',
    state: 'OH',
    region: 'Midwest',
  },
  specialty: 'general',
  yearEstablished: 2018,
};

const STRUGGLING_FINANCIAL: FinancialConfig = {
  practiceSize: 'small',
  monthlyRevenueRange: {
    min: 55000,
    max: 75000,
  },
  averageSessionRate: 165,
  clinicianTakeRate: 0.48,
  supervisorCostRate: 0.12,
  creditCardFeeRate: 0.03,
  revenueGoal: 90000, // Missing goal
  sessionGoal: 500,
  payerMix: {
    selfPay: 25,
    insurance: 65,
    slidingScale: 10,
  },
};

const STRUGGLING_METRICS: PerformanceMetrics = {
  showRate: 0.76,
  rebookRate: 0.72,
  cancelRate: 0.16,
  noShowRate: 0.08,
  monthlyChurnRate: 0.075,
  sessionRetention: generateRetention(0.075),
  monthlyConsultations: 6, // Low referrals
  consultConversionRate: 0.42,
  daysToFirstSession: 14,
  notesCompletionRate: 0.70,
  notesOverdueRate: 0.20,
  monthOverMonthGrowth: -0.035, // Declining
  newClientsPerMonth: 4,
};

const STRUGGLING_PERFORMANCE: PerformanceStory = {
  narrative: 'struggling',
  metrics: STRUGGLING_METRICS,
  seasonality: {
    q1Modifier: 0.90,
    q2Modifier: 1.02,
    q3Modifier: 0.85,
    q4Modifier: 1.08,
  },
  trend: 'declining',
};

const STRUGGLING_PRESET_CONFIG: Partial<DemoConfiguration> = {
  name: 'Struggling Practice Demo',
  description: 'A practice facing challenges with retention, revenue, and administrative compliance',
  practice: STRUGGLING_PRACTICE,
  clinicians: STRUGGLING_CLINICIANS,
  financial: STRUGGLING_FINANCIAL,
  performance: STRUGGLING_PERFORMANCE,
};

// =============================================================================
// PRESET: SOLO PRACTITIONER
// =============================================================================
// Single clinician practice. Simple operations, focused metrics.
// Good example of what one person can achieve.
// =============================================================================

const SOLO_CLINICIANS: ClinicianConfig[] = [
  {
    id: '1',
    firstName: 'Katherine',
    lastName: 'Mitchell',
    credential: 'PhD',
    title: 'Licensed Psychologist',
    role: 'owner',
    color: CLINICIAN_COLORS[0],
    performanceProfile: {
      revenueLevel: 'high',
      retentionStrength: 'strong',
      consultationConversion: 'high',
      notesCompliance: 'excellent',
    },
    caseload: {
      targetClients: 28,
      currentClients: 26,
      sessionGoal: 100,
      takeRate: 1.0, // Solo takes all
    },
    startDate: '2020-01-15',
    isActive: true,
    location: 'Private Office',
  },
];

const SOLO_PRACTICE: PracticeIdentity = {
  name: 'Katherine Mitchell, PhD',
  shortName: 'Dr. Mitchell',
  location: {
    city: 'Denver',
    state: 'CO',
    region: 'West',
  },
  specialty: 'trauma',
  yearEstablished: 2020,
};

const SOLO_FINANCIAL: FinancialConfig = {
  practiceSize: 'solo',
  monthlyRevenueRange: {
    min: 18000,
    max: 26000,
  },
  averageSessionRate: 200,
  clinicianTakeRate: 1.0, // No split
  supervisorCostRate: 0,
  creditCardFeeRate: 0.028,
  revenueGoal: 22000,
  sessionGoal: 100,
  payerMix: {
    selfPay: 70,
    insurance: 25,
    slidingScale: 5,
  },
};

const SOLO_METRICS: PerformanceMetrics = {
  showRate: 0.92,
  rebookRate: 0.90,
  cancelRate: 0.06,
  noShowRate: 0.02,
  monthlyChurnRate: 0.025,
  sessionRetention: generateRetention(0.025),
  monthlyConsultations: 5,
  consultConversionRate: 0.72,
  daysToFirstSession: 6,
  notesCompletionRate: 0.96,
  notesOverdueRate: 0.02,
  monthOverMonthGrowth: 0.01,
  newClientsPerMonth: 3,
};

const SOLO_PERFORMANCE: PerformanceStory = {
  narrative: 'stable',
  metrics: SOLO_METRICS,
  seasonality: {
    q1Modifier: 0.95,
    q2Modifier: 1.05,
    q3Modifier: 0.88, // Vacation time
    q4Modifier: 1.08,
  },
  trend: 'stable',
};

const SOLO_PRESET_CONFIG: Partial<DemoConfiguration> = {
  name: 'Solo Practitioner Demo',
  description: 'A successful solo trauma specialist practice in Denver',
  practice: SOLO_PRACTICE,
  clinicians: SOLO_CLINICIANS,
  financial: SOLO_FINANCIAL,
  performance: SOLO_PERFORMANCE,
};

// =============================================================================
// PRESET: TURNAROUND PRACTICE
// =============================================================================
// Was struggling, now implementing improvements. Mixed metrics showing
// early signs of recovery.
// =============================================================================

const TURNAROUND_CLINICIANS: ClinicianConfig[] = [
  {
    id: '1',
    firstName: 'Patricia',
    lastName: 'Chen',
    credential: 'LCSW',
    title: 'Clinical Director',
    role: 'owner',
    color: CLINICIAN_COLORS[0],
    performanceProfile: {
      revenueLevel: 'medium',
      retentionStrength: 'average',
      consultationConversion: 'medium',
      notesCompliance: 'good',
    },
    caseload: {
      targetClients: 26,
      currentClients: 23,
      sessionGoal: 105,
      takeRate: 0.52,
    },
    startDate: '2019-08-01',
    isActive: true,
    location: 'Main Office',
  },
  {
    id: '2',
    firstName: 'James',
    lastName: 'Morrison',
    credential: 'LPC',
    title: 'Senior Therapist',
    role: 'senior',
    color: CLINICIAN_COLORS[1],
    performanceProfile: {
      revenueLevel: 'medium',
      retentionStrength: 'strong', // Improving
      consultationConversion: 'medium',
      notesCompliance: 'good',
    },
    caseload: {
      targetClients: 24,
      currentClients: 21,
      sessionGoal: 95,
      takeRate: 0.48,
    },
    startDate: '2020-11-15',
    isActive: true,
    location: 'Main Office',
  },
  {
    id: '3',
    firstName: 'Angela',
    lastName: 'Brooks',
    credential: 'LMHC',
    title: 'Staff Therapist',
    role: 'staff',
    color: CLINICIAN_COLORS[2],
    performanceProfile: {
      revenueLevel: 'medium',
      retentionStrength: 'average',
      consultationConversion: 'medium',
      notesCompliance: 'good', // Recently improved
    },
    caseload: {
      targetClients: 22,
      currentClients: 19,
      sessionGoal: 88,
      takeRate: 0.45,
    },
    startDate: '2022-04-01',
    isActive: true,
    location: 'Remote',
  },
];

const TURNAROUND_PRACTICE: PracticeIdentity = {
  name: 'New Beginnings Therapy',
  shortName: 'New Beginnings',
  location: {
    city: 'Portland',
    state: 'OR',
    region: 'Pacific',
  },
  specialty: 'general',
  yearEstablished: 2019,
};

const TURNAROUND_FINANCIAL: FinancialConfig = {
  practiceSize: 'small',
  monthlyRevenueRange: {
    min: 75000,
    max: 95000,
  },
  averageSessionRate: 180,
  clinicianTakeRate: 0.46,
  supervisorCostRate: 0,
  creditCardFeeRate: 0.03,
  revenueGoal: 100000,
  sessionGoal: 500,
  payerMix: {
    selfPay: 35,
    insurance: 55,
    slidingScale: 10,
  },
};

const TURNAROUND_METRICS: PerformanceMetrics = {
  showRate: 0.84,
  rebookRate: 0.81,
  cancelRate: 0.11,
  noShowRate: 0.05,
  monthlyChurnRate: 0.045,
  sessionRetention: generateRetention(0.045),
  monthlyConsultations: 10,
  consultConversionRate: 0.58,
  daysToFirstSession: 9,
  notesCompletionRate: 0.84,
  notesOverdueRate: 0.09,
  monthOverMonthGrowth: 0.04, // Recovering
  newClientsPerMonth: 7,
};

const TURNAROUND_PERFORMANCE: PerformanceStory = {
  narrative: 'turnaround',
  metrics: TURNAROUND_METRICS,
  seasonality: {
    q1Modifier: 0.94,
    q2Modifier: 1.04,
    q3Modifier: 0.90,
    q4Modifier: 1.08,
  },
  trend: 'improving',
};

const TURNAROUND_PRESET_CONFIG: Partial<DemoConfiguration> = {
  name: 'Turnaround Practice Demo',
  description: 'A practice recovering from challenges with improving metrics',
  practice: TURNAROUND_PRACTICE,
  clinicians: TURNAROUND_CLINICIANS,
  financial: TURNAROUND_FINANCIAL,
  performance: TURNAROUND_PERFORMANCE,
};

// =============================================================================
// BUILT-IN PRESETS EXPORT
// =============================================================================

export const BUILT_IN_PRESETS: DemoPreset[] = [
  {
    id: 'default',
    name: 'Default Demo',
    description: 'A stable medium-sized therapy practice in Brooklyn',
    config: DEFAULT_PRESET_CONFIG,
    isBuiltIn: true,
  },
  {
    id: 'thriving',
    name: 'Thriving Practice',
    description: 'High-performing anxiety specialty practice with excellent metrics',
    config: THRIVING_PRESET_CONFIG,
    isBuiltIn: true,
  },
  {
    id: 'growing',
    name: 'Growing Practice',
    description: 'Rapidly expanding practice with high demand and growing pains',
    config: GROWING_PRESET_CONFIG,
    isBuiltIn: true,
  },
  {
    id: 'struggling',
    name: 'Struggling Practice',
    description: 'Practice facing retention, revenue, and admin challenges',
    config: STRUGGLING_PRESET_CONFIG,
    isBuiltIn: true,
  },
  {
    id: 'solo',
    name: 'Solo Practitioner',
    description: 'Successful single-clinician trauma specialty practice',
    config: SOLO_PRESET_CONFIG,
    isBuiltIn: true,
  },
  {
    id: 'turnaround',
    name: 'Turnaround Practice',
    description: 'Practice recovering from challenges with improving metrics',
    config: TURNAROUND_PRESET_CONFIG,
    isBuiltIn: true,
  },
];

// Export individual configs for testing
export {
  THRIVING_PRESET_CONFIG,
  GROWING_PRESET_CONFIG,
  STRUGGLING_PRESET_CONFIG,
  SOLO_PRESET_CONFIG,
  TURNAROUND_PRESET_CONFIG,
};
