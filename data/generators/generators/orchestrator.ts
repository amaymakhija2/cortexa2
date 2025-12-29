// =============================================================================
// DATA GENERATION ORCHESTRATOR
// =============================================================================
// Main entry point that coordinates all generators to produce complete DemoData.
// =============================================================================

import type {
  DemoConfiguration,
  DemoData,
  MonthlyClientGrowthData,
  MonthlyChurnData,
  MonthlyChurnByClinicianData,
  GenderBreakdown,
  FrequencyBreakdown,
} from '../types';

import { createSeededRandom } from '../utils/random';
import { formatDate, getMonthRange, fromISO, startOfMonth } from '../utils/dateUtils';

// Import generators
import {
  generateClinicians,
  generateAllClinicianMetrics,
} from './clinicianGenerator';

import {
  generateAllClients,
  getAllClientsFlat,
  getActiveClientsOnDate,
  calculateClientStats,
  type ClientModel,
} from './clientGenerator';

import {
  generateAllSessions,
  generatePaymentRecords,
  addProductSales,
  type SessionRecord,
} from './paymentGenerator';

import {
  generateMonthlySessionsData,
  generateClinicianSessionsData,
  generateSessionTimingData,
} from './sessionGenerator';

import {
  generateMonthlyRevenueData,
  generateMonthlyRevenueBreakdown,
  generateClinicianRevenueData,
  generatePracticeSettings,
  generateCohortLTVData,
} from './revenueGenerator';

// Phase 3 generators
import {
  generateConsultations,
  generateMonthlyConsultationsData,
  generateMonthlyConsultationsByClinician,
  generateConsultationSources,
  generateConsultationFunnel,
  generatePipelineStatus,
} from './consultationGenerator';

import {
  generateClientRoster,
  generateAtRiskClients,
  generateMilestoneClients,
  getRecentlyChurnedClients,
} from './clientRosterGenerator';

import {
  generateRetentionCohorts,
  generateRetentionFunnels,
  generateRetentionBenchmarks,
  generateFrequencyCorrelation,
} from './retentionGenerator';

import {
  generateNotesStatusData,
  generateClaimsStatusData,
  generateARAgingData,
  generateReminderDeliveryData,
  generateComplianceRisks,
  generateTopPastDueClients,
  generateOutstandingClaims,
} from './adminGenerator';

import { generatePriorityCards } from './priorityCardGenerator';

import {
  generateSessionTimingData as generateSessionTimingHeatmap,
  generateRebookRateTrend,
} from './analysisGenerator';

// =============================================================================
// MAIN ORCHESTRATOR
// =============================================================================

/**
 * Generates complete demo data from configuration
 */
export function generateDemoData(config: DemoConfiguration): DemoData {
  // Create seeded random for reproducibility
  const seed = config.randomSeed ?? Date.now();
  const random = createSeededRandom(seed);

  // ==========================================================================
  // PHASE 1: Generate base entities
  // ==========================================================================

  // Generate clinician objects from config
  const clinicians = generateClinicians(config);

  // Generate synthetic metrics for each clinician
  const clinicianSyntheticMetrics = generateAllClinicianMetrics(config, random);

  // ==========================================================================
  // PHASE 2: Generate clients with lifecycles
  // ==========================================================================

  const clientsByClinicianId = generateAllClients(config, random);
  const allClients = getAllClientsFlat(clientsByClinicianId);

  // ==========================================================================
  // PHASE 3: Generate sessions and payments
  // ==========================================================================

  const allSessions = generateAllSessions(
    clientsByClinicianId,
    clinicians,
    config,
    random
  );

  let paymentData = generatePaymentRecords(allSessions, clinicians);
  paymentData = addProductSales(
    paymentData,
    clientsByClinicianId,
    clinicians,
    config,
    random
  );

  // ==========================================================================
  // PHASE 4: Generate aggregated data
  // ==========================================================================

  // Sessions
  const monthlySessions = generateMonthlySessionsData(allSessions, allClients, config);
  const clinicianSessions = generateClinicianSessionsData(allSessions, clinicians, config);
  const sessionTiming = generateSessionTimingData(allSessions, random);

  // Revenue
  const monthlyRevenue = generateMonthlyRevenueData(paymentData, config);
  const revenueBreakdown = generateMonthlyRevenueBreakdown(paymentData, clinicians, config);
  const clinicianRevenue = generateClinicianRevenueData(paymentData, clinicians, config);

  // Practice settings
  const practiceSettings = generatePracticeSettings(allSessions, allClients, config);

  // Client growth
  const clientGrowth = generateClientGrowthData(allClients, config);

  // Churn data
  const churnData = generateChurnData(allClients, allSessions, config);
  const churnByClinician = generateChurnByClinicianData(allClients, clinicians, config);

  // Demographics
  const demographics = generateDemographicsData(allClients, config);

  // LTV
  const cohortLTV = generateCohortLTVData(allClients, allSessions, config);

  // ==========================================================================
  // PHASE 4B: Generate Phase 3 data
  // ==========================================================================

  // Consultations
  const consultationPipeline = generateConsultations(clinicians, config, random);
  const monthlyConsultations = generateMonthlyConsultationsData(consultationPipeline, config);
  const consultationsByClinician = generateMonthlyConsultationsByClinician(consultationPipeline, clinicians, config);
  const consultationSources = generateConsultationSources(consultationPipeline);
  const consultationFunnel = generateConsultationFunnel(consultationPipeline);
  const pipelineStatus = generatePipelineStatus(consultationPipeline, config);

  // Client roster
  const clientRoster = generateClientRoster(allClients, allSessions, clinicians, config, random);
  const atRiskClients = generateAtRiskClients(clientRoster, clinicians);
  const milestoneClients = generateMilestoneClients(clientRoster, clinicians);
  const recentlyChurned = getRecentlyChurnedClients(clientRoster, config);

  // Retention
  const retentionCohorts = generateRetentionCohorts(allClients, allSessions, config);
  const retentionFunnels = generateRetentionFunnels(allClients, allSessions, config);
  const retentionBenchmarks = generateRetentionBenchmarks(allClients, allSessions, config);
  const frequencyCorrelation = generateFrequencyCorrelation(allClients, allSessions, config);

  // Admin data
  const notesStatus = generateNotesStatusData(allSessions, config, random);
  const claimsStatus = generateClaimsStatusData(allSessions, config, random);
  const arAging = generateARAgingData(allSessions, config, random);
  const reminderDelivery = generateReminderDeliveryData(allSessions, config, random);
  const complianceRisks = generateComplianceRisks(allSessions, allClients, clinicians, config, random);
  const topPastDue = generateTopPastDueClients(allClients, config, random);
  const outstandingClaims = generateOutstandingClaims(allSessions, config, random);

  // ==========================================================================
  // PHASE 5: Assemble DemoData
  // ==========================================================================

  // Build partial DemoData for priority card generation
  const partialDemoData = {
    config,
    generatedAt: new Date().toISOString(),
    clinicians,
    clinicianSyntheticMetrics,
    paymentData,
    practiceSettings,
    monthlyData: {
      revenue: monthlyRevenue,
      revenueBreakdown,
      sessions: monthlySessions,
      clinicianSessions,
      clinicianRevenue,
      clientGrowth,
      consultations: monthlyConsultations,
      consultationsByClinician,
      churn: churnData,
      churnByClinician,
      notesStatus,
      claimsStatus,
      arAging,
      reminderDelivery,
    },
    sessionTiming,
    clients: {
      roster: clientRoster,
      atRisk: atRiskClients,
      approachingMilestone: milestoneClients,
      recentlyChurned,
      demographics,
    },
    consultations: {
      pipeline: consultationPipeline,
      sources: consultationSources,
      funnel: consultationFunnel,
      pipelineStatus,
    },
    retention: {
      cohorts: retentionCohorts,
      funnels: retentionFunnels,
      benchmarks: retentionBenchmarks,
      frequencyCorrelation,
      cohortLTV,
    },
    admin: {
      complianceRisks,
      topPastDue,
      outstandingClaims,
    },
    priorityCards: [],
  };

  // Generate priority cards using complete data
  const priorityCards = generatePriorityCards(partialDemoData as DemoData);

  return {
    ...partialDemoData,
    priorityCards,
  };
}

// =============================================================================
// CLIENT GROWTH DATA
// =============================================================================

function generateClientGrowthData(
  clients: ClientModel[],
  config: DemoConfiguration
): MonthlyClientGrowthData[] {
  const dataStart = fromISO(config.dataRange.startDate);
  const dataEnd = fromISO(config.dataRange.endDate);
  const months = getMonthRange(dataStart, dataEnd);

  const totalCapacity = config.clinicians.reduce(
    (sum, c) => sum + c.caseload.targetClients,
    0
  );

  const growthData: MonthlyClientGrowthData[] = [];
  let previousActive = new Set<string>();

  for (const month of months) {
    const monthKey = formatDate(month, 'Mon YYYY');
    const monthStart = startOfMonth(month);
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    // Get active clients this month
    const activeThisMonth = clients.filter(c => {
      if (!c || !c.startDate) return false;
      if (c.startDate > monthEnd) return false;
      if (c.endDate && c.endDate < monthStart) return false;
      return true;
    });

    const activeIds = new Set(activeThisMonth.map(c => c.id));

    // New clients (started this month)
    const newClients = clients.filter(c =>
      c && c.startDate && c.startDate >= monthStart && c.startDate <= monthEnd
    );

    // Churned clients (ended this month)
    const churnedClients = clients.filter(c =>
      c && c.endDate && c.endDate >= monthStart && c.endDate <= monthEnd
    );

    // Retained (was active last month and still active)
    const retained = [...previousActive].filter(id => activeIds.has(id)).length;

    // Clients with next appointment (simple estimate: 85% of active)
    const withNextAppt = Math.round(activeThisMonth.length * 0.85);

    growthData.push({
      month: monthKey,
      activeClients: activeThisMonth.length,
      capacity: totalCapacity,
      retained,
      new: newClients.length,
      churned: churnedClients.length,
      withNextAppt,
    });

    previousActive = activeIds;
  }

  return growthData;
}

// =============================================================================
// CHURN DATA
// =============================================================================

function generateChurnData(
  clients: ClientModel[],
  sessions: SessionRecord[],
  config: DemoConfiguration
): MonthlyChurnData[] {
  const dataStart = fromISO(config.dataRange.startDate);
  const dataEnd = fromISO(config.dataRange.endDate);
  const months = getMonthRange(dataStart, dataEnd);

  // Build session count per client
  const clientSessionCounts = new Map<string, number>();
  for (const session of sessions) {
    if (session.attended) {
      const count = clientSessionCounts.get(session.clientId) || 0;
      clientSessionCounts.set(session.clientId, count + 1);
    }
  }

  const churnData: MonthlyChurnData[] = [];

  for (const month of months) {
    const monthKey = formatDate(month, 'Mon YYYY');
    const monthStart = startOfMonth(month);
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    // Get clients who churned this month
    const churnedThisMonth = clients.filter(c =>
      c.endDate && c.endDate >= monthStart && c.endDate <= monthEnd
    );

    let early = 0;
    let medium = 0;
    let late = 0;

    for (const client of churnedThisMonth) {
      const sessionCount = clientSessionCounts.get(client.id) || 0;

      if (sessionCount <= 3) {
        early++;
      } else if (sessionCount <= 12) {
        medium++;
      } else {
        late++;
      }
    }

    churnData.push({
      month: monthKey,
      earlyChurn: early,
      mediumChurn: medium,
      lateChurn: late,
    });
  }

  return churnData;
}

function generateChurnByClinicianData(
  clients: ClientModel[],
  clinicians: { id: string; lastName: string }[],
  config: DemoConfiguration
): MonthlyChurnByClinicianData[] {
  const dataStart = fromISO(config.dataRange.startDate);
  const dataEnd = fromISO(config.dataRange.endDate);
  const months = getMonthRange(dataStart, dataEnd);

  const churnData: MonthlyChurnByClinicianData[] = [];

  for (const month of months) {
    const monthKey = formatDate(month, 'Mon YYYY');
    const monthStart = startOfMonth(month);
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    const record: MonthlyChurnByClinicianData = { month: monthKey };

    for (const clinician of clinicians) {
      const churned = clients.filter(c =>
        c.clinicianId === clinician.id &&
        c.endDate &&
        c.endDate >= monthStart &&
        c.endDate <= monthEnd
      );
      record[clinician.lastName] = churned.length;
    }

    churnData.push(record);
  }

  return churnData;
}

// =============================================================================
// DEMOGRAPHICS DATA
// =============================================================================

function generateDemographicsData(
  clients: ClientModel[],
  config: DemoConfiguration
): {
  gender: GenderBreakdown;
  frequency: FrequencyBreakdown;
  churnByGender: GenderBreakdown;
  churnByFrequency: FrequencyBreakdown;
} {
  const dataEnd = fromISO(config.dataRange.endDate);

  // Active clients
  const active = clients.filter(c => {
    if (!c || !c.startDate) return false;
    if (c.startDate > dataEnd) return false;
    if (c.endDate && c.endDate <= dataEnd) return false;
    return true;
  });

  // Churned clients
  const churned = clients.filter(c => c && c.endDate && c.endDate <= dataEnd);

  return {
    gender: {
      male: active.filter(c => c.gender === 'male').length,
      female: active.filter(c => c.gender === 'female').length,
      other: active.filter(c => c.gender === 'other').length,
      total: active.length,
    },
    frequency: {
      weekly: active.filter(c => c.frequency === 'weekly').length,
      biweekly: active.filter(c => c.frequency === 'biweekly').length,
      monthly: active.filter(c => c.frequency === 'monthly').length,
      total: active.length,
    },
    churnByGender: {
      male: churned.filter(c => c.gender === 'male').length,
      female: churned.filter(c => c.gender === 'female').length,
      other: churned.filter(c => c.gender === 'other').length,
      total: churned.length,
    },
    churnByFrequency: {
      weekly: churned.filter(c => c.frequency === 'weekly').length,
      biweekly: churned.filter(c => c.frequency === 'biweekly').length,
      monthly: churned.filter(c => c.frequency === 'monthly').length,
      total: churned.length,
    },
  };
}
