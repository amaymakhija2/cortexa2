// =============================================================================
// CONSULTATION GENERATOR
// =============================================================================
// Generates consultation pipeline data including leads, conversions, and sources.
// =============================================================================

import type {
  DemoConfiguration,
  Consultation,
  ConsultationStage,
  ConsultationSource,
  ConsultationFunnel,
  ConsultationPipeline,
  ConsultationPipelineStage,
  MonthlyConsultationsData,
  MonthlyConsultationsByClinicianData,
  Clinician,
  FormResponse,
} from '../types';

import {
  RandomFn,
  randomInt,
  randomChoice,
  weightedChoice,
  chance,
  randomUUID,
} from '../utils/random';

import {
  generateClientName,
  generateEmail,
  generatePhone,
  parseName,
} from '../utils/nameGenerator';

import {
  addDays,
  addMonths,
  formatDate,
  getMonthRange,
  fromISO,
  startOfMonth,
  getDaysBetween,
} from '../utils/dateUtils';

// =============================================================================
// CONSULTATION SOURCES
// =============================================================================

interface SourceConfig {
  source: string;
  weight: number;
  conversionMultiplier: number; // Higher = better conversion
}

const CONSULTATION_SOURCES: SourceConfig[] = [
  { source: 'Psychology Today', weight: 35, conversionMultiplier: 1.0 },
  { source: 'Google Search', weight: 20, conversionMultiplier: 0.9 },
  { source: 'Referral - Client', weight: 15, conversionMultiplier: 1.3 },
  { source: 'Referral - Provider', weight: 10, conversionMultiplier: 1.2 },
  { source: 'Insurance Directory', weight: 10, conversionMultiplier: 0.8 },
  { source: 'Website', weight: 5, conversionMultiplier: 0.95 },
  { source: 'Social Media', weight: 3, conversionMultiplier: 0.7 },
  { source: 'Other', weight: 2, conversionMultiplier: 0.85 },
];

function getRandomSource(random: RandomFn): SourceConfig {
  const options = CONSULTATION_SOURCES.map(s => ({
    value: s,
    weight: s.weight,
  }));
  return weightedChoice(options, random);
}

// =============================================================================
// MEETING TYPES
// =============================================================================

const MEETING_TYPES: Array<{ type: 'google_meet' | 'zoom' | 'phone' | 'in_person'; weight: number }> = [
  { type: 'google_meet', weight: 40 },
  { type: 'zoom', weight: 30 },
  { type: 'phone', weight: 20 },
  { type: 'in_person', weight: 10 },
];

function getRandomMeetingType(random: RandomFn): 'google_meet' | 'zoom' | 'phone' | 'in_person' {
  const options = MEETING_TYPES.map(m => ({ value: m.type, weight: m.weight }));
  return weightedChoice(options, random);
}

// =============================================================================
// STAGE TRANSITIONS
// =============================================================================

interface StageTransition {
  nextStage: ConsultationStage;
  probability: number;
  daysToTransition: { min: number; max: number };
}

// Probability of transitioning to each next stage from current stage
const STAGE_TRANSITIONS: Record<ConsultationStage, StageTransition[]> = {
  new: [
    { nextStage: 'confirmed', probability: 0.85, daysToTransition: { min: 0, max: 2 } },
    { nextStage: 'lost', probability: 0.15, daysToTransition: { min: 1, max: 7 } },
  ],
  confirmed: [
    { nextStage: 'consult_complete', probability: 0.80, daysToTransition: { min: 1, max: 14 } },
    { nextStage: 'no_show', probability: 0.15, daysToTransition: { min: 1, max: 14 } },
    { nextStage: 'lost', probability: 0.05, daysToTransition: { min: 1, max: 7 } },
  ],
  consult_complete: [
    { nextStage: 'intake_pending', probability: 0.75, daysToTransition: { min: 0, max: 1 } },
    { nextStage: 'lost', probability: 0.25, daysToTransition: { min: 1, max: 14 } },
  ],
  no_show: [
    { nextStage: 'confirmed', probability: 0.40, daysToTransition: { min: 1, max: 7 } }, // Rescheduled
    { nextStage: 'lost', probability: 0.60, daysToTransition: { min: 3, max: 14 } },
  ],
  intake_pending: [
    { nextStage: 'intake_scheduled', probability: 0.85, daysToTransition: { min: 1, max: 7 } },
    { nextStage: 'lost', probability: 0.15, daysToTransition: { min: 7, max: 21 } },
  ],
  intake_scheduled: [
    { nextStage: 'paperwork_pending', probability: 0.90, daysToTransition: { min: 0, max: 3 } },
    { nextStage: 'lost', probability: 0.10, daysToTransition: { min: 1, max: 7 } },
  ],
  paperwork_pending: [
    { nextStage: 'paperwork_complete', probability: 0.85, daysToTransition: { min: 1, max: 7 } },
    { nextStage: 'lost', probability: 0.15, daysToTransition: { min: 7, max: 14 } },
  ],
  paperwork_complete: [
    { nextStage: 'converted', probability: 0.95, daysToTransition: { min: 1, max: 14 } },
    { nextStage: 'lost', probability: 0.05, daysToTransition: { min: 1, max: 7 } },
  ],
  converted: [], // Terminal state
  lost: [], // Terminal state
};

const LOST_REASONS = [
  'No response to follow-up',
  'Found another provider',
  'Insurance not accepted',
  'Schedule conflict',
  'Changed mind about therapy',
  'Cost concerns',
  'Not a good fit',
  'Moved out of area',
];

// =============================================================================
// FORM RESPONSES
// =============================================================================

function generateFormResponses(random: RandomFn): FormResponse[] {
  const concerns = [
    'Anxiety', 'Depression', 'Relationship issues', 'Work stress',
    'Grief/loss', 'Life transitions', 'Self-esteem', 'Trauma',
  ];

  const preferredTimes = [
    'Mornings', 'Afternoons', 'Evenings', 'Weekends only', 'Flexible',
  ];

  return [
    {
      fieldId: 1,
      fieldName: 'Primary concerns',
      value: randomChoice(concerns, random),
    },
    {
      fieldId: 2,
      fieldName: 'Preferred appointment times',
      value: randomChoice(preferredTimes, random),
    },
    {
      fieldId: 3,
      fieldName: 'Previous therapy experience',
      value: chance(0.6, random) ? 'Yes' : 'No',
    },
  ];
}

// =============================================================================
// CONSULTATION GENERATION
// =============================================================================

/**
 * Generates a single consultation with its lifecycle
 */
function generateConsultation(
  clinician: Clinician,
  consultDate: Date,
  config: DemoConfiguration,
  sourceConfig: SourceConfig,
  random: RandomFn
): Consultation {
  const name = generateClientName(random);
  const { firstName, lastName } = parseName(name);
  const baseConversionRate = config.performance.metrics.consultConversionRate;
  const adjustedConversionRate = baseConversionRate * sourceConfig.conversionMultiplier;

  // Generate meeting details
  const meetingType = getRandomMeetingType(random);
  const duration = randomChoice([15, 20, 30], random);

  // Start at 'new' stage and simulate progression
  let currentStage: ConsultationStage = 'new';
  let currentDate = new Date(consultDate);
  let followUpCount = 0;
  let convertedDate: string | undefined;
  let lostDate: string | undefined;
  let lostReason: string | undefined;

  const dataEnd = fromISO(config.dataRange.endDate);

  // Simulate stage transitions
  while (STAGE_TRANSITIONS[currentStage].length > 0 && currentDate <= dataEnd) {
    const transitions = STAGE_TRANSITIONS[currentStage];

    // Adjust probabilities based on conversion rate
    let roll = random();

    // For stages leading to conversion, use the adjusted rate
    if (currentStage === 'paperwork_complete') {
      if (roll < adjustedConversionRate) {
        currentStage = 'converted';
      } else {
        currentStage = 'lost';
      }
    } else {
      // Normal transition logic
      let cumulative = 0;
      for (const transition of transitions) {
        cumulative += transition.probability;
        if (roll < cumulative) {
          const days = randomInt(
            transition.daysToTransition.min,
            transition.daysToTransition.max,
            random
          );
          currentDate = addDays(currentDate, days);
          currentStage = transition.nextStage;

          // Track follow-ups for recovery stages
          if (transition.nextStage === 'confirmed' && currentStage === 'no_show') {
            followUpCount++;
          }
          break;
        }
      }
    }

    // Record terminal state dates
    if (currentStage === 'converted') {
      convertedDate = formatDate(currentDate, 'YYYY-MM-DD');
    } else if (currentStage === 'lost') {
      lostDate = formatDate(currentDate, 'YYYY-MM-DD');
      lostReason = randomChoice(LOST_REASONS, random);
    }
  }

  // If still in progress and past data end, keep current stage
  const id = randomUUID(random);

  return {
    id,
    firstName,
    lastName,
    email: generateEmail(firstName, lastName, random),
    phone: generatePhone(random),
    appointmentId: randomInt(10000, 99999, random),
    appointmentTypeId: 1,
    appointmentTypeName: 'Free Consultation',
    datetime: formatDate(consultDate, 'YYYY-MM-DD') + 'T' +
      String(randomInt(9, 17, random)).padStart(2, '0') + ':00:00',
    duration,
    meetingType,
    meetingLink: meetingType === 'google_meet' || meetingType === 'zoom'
      ? `https://meet.example.com/${id.slice(0, 8)}`
      : undefined,
    clinicianId: clinician.id,
    clinicianName: clinician.name,
    calendarId: parseInt(clinician.id) * 100,
    wasTransferred: chance(0.05, random), // 5% are transferred between clinicians
    stage: currentStage,
    followUpCount,
    formResponses: generateFormResponses(random),
    createdAt: formatDate(consultDate, 'YYYY-MM-DD') + 'T00:00:00Z',
    updatedAt: formatDate(currentDate, 'YYYY-MM-DD') + 'T00:00:00Z',
    convertedDate,
    lostDate,
    lostReason,
  };
}

/**
 * Generates all consultations for the data range
 */
export function generateConsultations(
  clinicians: Clinician[],
  config: DemoConfiguration,
  random: RandomFn
): Consultation[] {
  const consultations: Consultation[] = [];
  const dataStart = fromISO(config.dataRange.startDate);
  const dataEnd = fromISO(config.dataRange.endDate);
  const months = getMonthRange(dataStart, dataEnd);

  const monthlyConsultTarget = config.performance.metrics.monthlyConsultations;

  for (const month of months) {
    const monthStart = startOfMonth(month);
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    // Vary monthly consultations
    const consultsThisMonth = Math.round(monthlyConsultTarget * (0.7 + random() * 0.6));

    for (let i = 0; i < consultsThisMonth; i++) {
      // Random day in month
      const day = randomInt(1, Math.min(28, monthEnd.getDate()), random);
      const consultDate = new Date(month.getFullYear(), month.getMonth(), day);

      // Skip if before data start
      if (consultDate < dataStart) continue;

      // Assign to a clinician (weighted by their consultation booking rate)
      const clinician = randomChoice(clinicians.filter(c => c.isActive), random);
      const sourceConfig = getRandomSource(random);

      const consultation = generateConsultation(
        clinician,
        consultDate,
        config,
        sourceConfig,
        random
      );

      consultations.push(consultation);
    }
  }

  // Sort by datetime
  consultations.sort((a, b) => a.datetime.localeCompare(b.datetime));

  return consultations;
}

// =============================================================================
// CONSULTATION AGGREGATIONS
// =============================================================================

/**
 * Generates monthly consultation data
 */
export function generateMonthlyConsultationsData(
  consultations: Consultation[],
  config: DemoConfiguration
): MonthlyConsultationsData[] {
  const dataStart = fromISO(config.dataRange.startDate);
  const dataEnd = fromISO(config.dataRange.endDate);
  const months = getMonthRange(dataStart, dataEnd);

  return months.map(month => {
    const monthKey = formatDate(month, 'Mon YYYY');
    const monthStart = startOfMonth(month);
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    // Filter consultations created this month
    const monthConsults = consultations.filter(c => {
      const created = new Date(c.createdAt);
      return created >= monthStart && created <= monthEnd;
    });

    const converted = monthConsults.filter(c => c.stage === 'converted');

    // Calculate days to first session for converted
    let totalDays = 0;
    let conversionsWithSession = 0;
    for (const c of converted) {
      if (c.convertedDate) {
        const consultDate = new Date(c.datetime);
        const convertDate = new Date(c.convertedDate);
        const days = getDaysBetween(consultDate, convertDate);
        if (days > 0 && days < 60) { // Reasonable range
          totalDays += days;
          conversionsWithSession++;
        }
      }
    }

    return {
      month: monthKey,
      consultations: monthConsults.length,
      converted: converted.length,
      totalDaysToFirstSession: totalDays,
      conversionsWithFirstSession: conversionsWithSession,
    };
  });
}

/**
 * Generates consultations by clinician per month
 */
export function generateMonthlyConsultationsByClinician(
  consultations: Consultation[],
  clinicians: Clinician[],
  config: DemoConfiguration
): MonthlyConsultationsByClinicianData[] {
  const dataStart = fromISO(config.dataRange.startDate);
  const dataEnd = fromISO(config.dataRange.endDate);
  const months = getMonthRange(dataStart, dataEnd);

  return months.map(month => {
    const monthKey = formatDate(month, 'Mon YYYY');
    const monthStart = startOfMonth(month);
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    const record: MonthlyConsultationsByClinicianData = { month: monthKey };

    for (const clinician of clinicians) {
      const count = consultations.filter(c => {
        const created = new Date(c.createdAt);
        return c.clinicianId === clinician.id &&
          created >= monthStart && created <= monthEnd;
      }).length;
      record[clinician.lastName] = count;
    }

    return record;
  });
}

/**
 * Generates consultation source breakdown
 */
export function generateConsultationSources(
  consultations: Consultation[]
): ConsultationSource[] {
  // We need to track sources - for now, distribute based on weights
  // In a real implementation, we'd store the source on each consultation

  const sourceMap = new Map<string, { total: number; converted: number }>();

  // Initialize all sources
  for (const source of CONSULTATION_SOURCES) {
    sourceMap.set(source.source, { total: 0, converted: 0 });
  }

  // Distribute consultations across sources based on weights
  // This is a simplification - ideally we'd track source per consultation
  const totalWeight = CONSULTATION_SOURCES.reduce((sum, s) => sum + s.weight, 0);

  for (const source of CONSULTATION_SOURCES) {
    const proportion = source.weight / totalWeight;
    const total = Math.round(consultations.length * proportion);
    const convertedCount = consultations.filter(c => c.stage === 'converted').length;
    const converted = Math.round(convertedCount * proportion * source.conversionMultiplier);

    sourceMap.set(source.source, {
      total,
      converted: Math.min(converted, total),
    });
  }

  return Array.from(sourceMap.entries()).map(([source, data]) => ({
    source,
    consultations: data.total,
    converted: data.converted,
    conversionRate: data.total > 0 ? Math.round((data.converted / data.total) * 100) : 0,
  }));
}

/**
 * Generates consultation funnel
 */
export function generateConsultationFunnel(
  consultations: Consultation[]
): ConsultationFunnel {
  const booked = consultations.length;

  // Count by stage progression
  const attendedStages: ConsultationStage[] = [
    'consult_complete', 'intake_pending', 'intake_scheduled',
    'paperwork_pending', 'paperwork_complete', 'converted',
  ];
  const intakeStages: ConsultationStage[] = [
    'intake_scheduled', 'paperwork_pending', 'paperwork_complete', 'converted',
  ];
  const paperworkStages: ConsultationStage[] = [
    'paperwork_complete', 'converted',
  ];

  const attended = consultations.filter(c => attendedStages.includes(c.stage)).length;
  const bookedIntake = consultations.filter(c => intakeStages.includes(c.stage)).length;
  const completedPaperwork = consultations.filter(c => paperworkStages.includes(c.stage)).length;
  const firstSession = consultations.filter(c => c.stage === 'converted').length;

  return {
    booked,
    attended,
    bookedIntake,
    completedPaperwork,
    firstSession,
  };
}

/**
 * Generates pipeline status with stage breakdown
 */
export function generatePipelineStatus(
  consultations: Consultation[]
): ConsultationPipeline {
  // Active pipeline = not converted and not lost
  const activeConsults = consultations.filter(c =>
    c.stage !== 'converted' && c.stage !== 'lost'
  );

  // Group by stage
  const stageGroups = new Map<ConsultationStage, Consultation[]>();
  for (const c of activeConsults) {
    const list = stageGroups.get(c.stage) || [];
    list.push(c);
    stageGroups.set(c.stage, list);
  }

  const byStage: ConsultationPipelineStage[] = [];
  const stageOrder: ConsultationStage[] = [
    'new', 'confirmed', 'consult_complete', 'no_show',
    'intake_pending', 'intake_scheduled', 'paperwork_pending', 'paperwork_complete',
  ];

  for (const stage of stageOrder) {
    const consults = stageGroups.get(stage) || [];
    if (consults.length > 0) {
      // Calculate average days in stage
      const now = new Date();
      let totalDays = 0;
      for (const c of consults) {
        const updated = new Date(c.updatedAt);
        totalDays += getDaysBetween(updated, now);
      }

      byStage.push({
        stage: formatStageName(stage),
        count: consults.length,
        avgDaysInStage: Math.round(totalDays / consults.length),
      });
    }
  }

  return {
    activePipeline: activeConsults.length,
    byStage,
  };
}

function formatStageName(stage: ConsultationStage): string {
  const names: Record<ConsultationStage, string> = {
    new: 'New Lead',
    confirmed: 'Confirmed',
    consult_complete: 'Consult Complete',
    no_show: 'No Show',
    intake_pending: 'Intake Pending',
    intake_scheduled: 'Intake Scheduled',
    paperwork_pending: 'Paperwork Pending',
    paperwork_complete: 'Paperwork Complete',
    converted: 'Converted',
    lost: 'Lost',
  };
  return names[stage] || stage;
}
