// =============================================================================
// CLINICIAN GENERATOR
// =============================================================================
// Generates full Clinician objects and synthetic metrics from ClinicianConfig.
// =============================================================================

import type {
  DemoConfiguration,
  ClinicianConfig,
  Clinician,
  ClinicianSyntheticMetrics,
  PerformanceMetrics,
  SessionRetentionMilestones,
} from '../types';

import { RandomFn, varyValue, clampedGaussian } from '../utils/random';
import { generateShortName, generateInitials } from '../utils/nameGenerator';

// =============================================================================
// CLINICIAN GENERATION
// =============================================================================

/**
 * Generates a full Clinician object from a ClinicianConfig
 */
export function generateClinician(config: ClinicianConfig): Clinician {
  const fullName = `${config.firstName} ${config.lastName}`;

  return {
    id: config.id,
    name: fullName,
    shortName: generateShortName(config.firstName, config.lastName),
    lastName: config.lastName,
    initials: generateInitials(fullName),
    color: config.color,
    title: getTitle(config.credential),
    role: config.role,
    credential: config.credential,
    supervisorId: config.supervisorId || null,
    takeRate: config.caseload.takeRate,
    sessionGoal: config.caseload.sessionGoal,
    clientGoal: config.caseload.targetClients,
    startDate: config.startDate,
    isActive: config.isActive,
    location: config.location,
  };
}

/**
 * Generate title from credential type
 */
function getTitle(credential: string): string {
  const titles: Record<string, string> = {
    'PhD': 'Licensed Clinical Psychologist',
    'PsyD': 'Licensed Clinical Psychologist',
    'LCSW': 'Licensed Clinical Social Worker',
    'LMHC': 'Licensed Mental Health Counselor',
    'LPC': 'Licensed Professional Counselor',
    'LMFT': 'Licensed Marriage & Family Therapist',
    'APC': 'Associate Professional Counselor',
    'LAC': 'Licensed Associate Counselor',
    'LCPC': 'Licensed Clinical Professional Counselor',
    'LLP': 'Limited License Psychologist',
  };
  return titles[credential] || 'Therapist';
}

/**
 * Generates all clinicians from configuration
 */
export function generateClinicians(config: DemoConfiguration): Clinician[] {
  return config.clinicians.map(generateClinician);
}

// =============================================================================
// SYNTHETIC METRICS GENERATION
// =============================================================================

/**
 * Performance profile modifiers
 * These multiply the base metrics to create variance between clinicians
 */
const PERFORMANCE_MODIFIERS = {
  revenueLevel: {
    high: { sessionMultiplier: 1.15, rateMultiplier: 1.1 },
    medium: { sessionMultiplier: 1.0, rateMultiplier: 1.0 },
    low: { sessionMultiplier: 0.85, rateMultiplier: 0.9 },
  },
  retentionStrength: {
    strong: { showRate: 1.05, rebookRate: 1.08, churnRate: 0.7 },
    average: { showRate: 1.0, rebookRate: 1.0, churnRate: 1.0 },
    weak: { showRate: 0.88, rebookRate: 0.85, churnRate: 1.5 },
  },
  consultationConversion: {
    high: { conversionRate: 1.2, newClients: 1.3 },
    medium: { conversionRate: 1.0, newClients: 1.0 },
    low: { conversionRate: 0.7, newClients: 0.7 },
  },
  notesCompliance: {
    excellent: { completionRate: 1.05, overdueRate: 0.3 },
    good: { completionRate: 1.0, overdueRate: 1.0 },
    needs_work: { completionRate: 0.85, overdueRate: 2.5 },
  },
};

/**
 * Generates synthetic metrics for a clinician based on their performance profile
 * and the practice's overall performance story
 */
export function generateClinicianSyntheticMetrics(
  clinician: ClinicianConfig,
  practiceMetrics: PerformanceMetrics,
  random: RandomFn
): ClinicianSyntheticMetrics {
  const profile = clinician.performanceProfile;

  // Get modifiers for this clinician's profile
  const retentionMod = PERFORMANCE_MODIFIERS.retentionStrength[profile.retentionStrength];
  const consultMod = PERFORMANCE_MODIFIERS.consultationConversion[profile.consultationConversion];
  const notesMod = PERFORMANCE_MODIFIERS.notesCompliance[profile.notesCompliance];

  // Base metrics from practice performance, modified by clinician profile
  const showRate = clampedGaussian(
    practiceMetrics.showRate * retentionMod.showRate * 100,
    5,
    50,
    100,
    random
  );

  const rebookRate = clampedGaussian(
    practiceMetrics.rebookRate * retentionMod.rebookRate * 100,
    5,
    40,
    100,
    random
  );

  const churnRate = clampedGaussian(
    practiceMetrics.monthlyChurnRate * retentionMod.churnRate * 100,
    2,
    0,
    50,
    random
  );

  // Cancel rates should add up with show rate and no-show rate to ~100%
  const noShowRate = clampedGaussian(
    practiceMetrics.noShowRate * 100,
    2,
    0,
    20,
    random
  );

  const totalCancelRate = 100 - showRate - noShowRate;
  const clientCancelRate = totalCancelRate * 0.7; // 70% of cancels are by client
  const clinicianCancelRate = totalCancelRate * 0.2; // 20% by clinician
  const lateCancelRate = totalCancelRate * 0.1; // 10% are late cancels

  // Retention milestones based on profile
  const sessionRetention = generateSessionRetention(
    practiceMetrics.sessionRetention,
    profile.retentionStrength,
    random
  );

  // Notes metrics
  const baseOutstandingNotes = Math.round(clinician.caseload.currentClients * 0.15);
  const outstandingNotes = Math.round(
    varyValue(baseOutstandingNotes / notesMod.completionRate, 0.3, random)
  );
  const overdueNotes = Math.round(
    outstandingNotes * practiceMetrics.notesOverdueRate * notesMod.overdueRate
  );
  const notesDueWithin48h = Math.max(0, outstandingNotes - overdueNotes);

  // Consultation/new client metrics
  const monthlyConsults = Math.round(
    varyValue(practiceMetrics.monthlyConsultations / 5, 0.4, random) * consultMod.newClients
  );
  const newClients = Math.round(
    monthlyConsults * practiceMetrics.consultConversionRate * consultMod.conversionRate
  );

  // At-risk clients based on caseload and churn
  const atRiskClients = Math.round(
    clinician.caseload.currentClients * (churnRate / 100) * 1.5
  );

  // Average sessions per client
  const avgSessionsPerClient = clampedGaussian(
    3.2 * retentionMod.rebookRate,
    0.5,
    1.5,
    5,
    random
  );

  return {
    showRate: Math.round(showRate),
    cancelRates: {
      client: Math.round(clientCancelRate * 10) / 10,
      lateCancellation: Math.round(lateCancelRate * 10) / 10,
      clinician: Math.round(clinicianCancelRate * 10) / 10,
    },
    noShowRate: Math.round(noShowRate),
    rebookRate: Math.round(rebookRate),
    avgSessionsPerClient: Math.round(avgSessionsPerClient * 10) / 10,
    churnRate: Math.round(churnRate * 10) / 10,
    atRiskClients,
    sessionRetention,
    outstandingNotes,
    overdueNotes,
    notesDueWithin48h,
    newClients,
    consultationsBooked: monthlyConsults,
    consultationsConverted: newClients,
  };
}

/**
 * Generates session retention milestones based on practice metrics and clinician profile
 */
function generateSessionRetention(
  baseRetention: SessionRetentionMilestones,
  strength: 'strong' | 'average' | 'weak',
  random: RandomFn
): SessionRetentionMilestones {
  const multipliers = {
    strong: 1.08,
    average: 1.0,
    weak: 0.85,
  };

  const mult = multipliers[strength];

  return {
    session2: Math.round(clampedGaussian(baseRetention.session2 * mult, 3, 50, 100, random)),
    session5: Math.round(clampedGaussian(baseRetention.session5 * mult, 4, 30, 100, random)),
    session12: Math.round(clampedGaussian(baseRetention.session12 * mult, 5, 20, 95, random)),
    session24: Math.round(clampedGaussian(baseRetention.session24 * mult, 5, 10, 85, random)),
  };
}

/**
 * Generates synthetic metrics for all clinicians
 */
export function generateAllClinicianMetrics(
  config: DemoConfiguration,
  random: RandomFn
): Record<string, ClinicianSyntheticMetrics> {
  const metrics: Record<string, ClinicianSyntheticMetrics> = {};

  for (const clinician of config.clinicians) {
    metrics[clinician.id] = generateClinicianSyntheticMetrics(
      clinician,
      config.performance.metrics,
      random
    );
  }

  return metrics;
}
