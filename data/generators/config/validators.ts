// =============================================================================
// CONFIGURATION VALIDATORS
// =============================================================================
// Validates demo configuration and applies defaults for missing fields.
// =============================================================================

import type {
  DemoConfiguration,
  PracticeIdentity,
  ClinicianConfig,
  FinancialConfig,
  PerformanceStory,
  PerformanceMetrics,
  FeatureFlags,
  DataRange,
} from '../types';

import {
  DEFAULT_CONFIG,
  DEFAULT_PRACTICE,
  DEFAULT_CLINICIANS,
  DEFAULT_FINANCIAL,
  DEFAULT_PERFORMANCE,
  DEFAULT_PERFORMANCE_METRICS,
  DEFAULT_SEASONALITY,
  DEFAULT_DATA_RANGE,
  DEFAULT_FEATURES,
  CLINICIAN_COLORS,
} from './defaultConfig';

// =============================================================================
// VALIDATION RESULT TYPES
// =============================================================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// =============================================================================
// INDIVIDUAL VALIDATORS
// =============================================================================

/**
 * Validates practice identity configuration
 */
export function validatePractice(practice: Partial<PracticeIdentity>): ValidationResult {
  const errors: ValidationError[] = [];

  if (practice.name !== undefined && practice.name.trim().length === 0) {
    errors.push({ field: 'practice.name', message: 'Practice name cannot be empty' });
  }

  if (practice.yearEstablished !== undefined) {
    const currentYear = new Date().getFullYear();
    if (practice.yearEstablished < 1900 || practice.yearEstablished > currentYear) {
      errors.push({
        field: 'practice.yearEstablished',
        message: `Year must be between 1900 and ${currentYear}`,
      });
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates a single clinician configuration
 */
export function validateClinician(clinician: Partial<ClinicianConfig>, index: number): ValidationResult {
  const errors: ValidationError[] = [];
  const prefix = `clinicians[${index}]`;

  if (clinician.id !== undefined && clinician.id.trim().length === 0) {
    errors.push({ field: `${prefix}.id`, message: 'Clinician ID cannot be empty' });
  }

  if (clinician.firstName !== undefined && clinician.firstName.trim().length === 0) {
    errors.push({ field: `${prefix}.firstName`, message: 'First name cannot be empty' });
  }

  if (clinician.lastName !== undefined && clinician.lastName.trim().length === 0) {
    errors.push({ field: `${prefix}.lastName`, message: 'Last name cannot be empty' });
  }

  if (clinician.caseload) {
    if (clinician.caseload.takeRate !== undefined) {
      if (clinician.caseload.takeRate < 0 || clinician.caseload.takeRate > 1) {
        errors.push({
          field: `${prefix}.caseload.takeRate`,
          message: 'Take rate must be between 0 and 1',
        });
      }
    }

    if (clinician.caseload.targetClients !== undefined && clinician.caseload.targetClients < 0) {
      errors.push({
        field: `${prefix}.caseload.targetClients`,
        message: 'Target clients cannot be negative',
      });
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates clinician array (checks for duplicate IDs)
 */
export function validateClinicians(clinicians: Partial<ClinicianConfig>[]): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate each clinician
  clinicians.forEach((clinician, index) => {
    const result = validateClinician(clinician, index);
    errors.push(...result.errors);
  });

  // Check for duplicate IDs
  const ids = clinicians.map(c => c.id).filter(Boolean);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length > 0) {
    errors.push({
      field: 'clinicians',
      message: `Duplicate clinician IDs found: ${[...new Set(duplicates)].join(', ')}`,
    });
  }

  // Check supervisor references
  clinicians.forEach((clinician, index) => {
    if (clinician.supervisorId) {
      const supervisorExists = clinicians.some(c => c.id === clinician.supervisorId);
      if (!supervisorExists) {
        errors.push({
          field: `clinicians[${index}].supervisorId`,
          message: `Supervisor ID "${clinician.supervisorId}" does not match any clinician`,
        });
      }
    }
  });

  return { valid: errors.length === 0, errors };
}

/**
 * Validates financial configuration
 */
export function validateFinancial(financial: Partial<FinancialConfig>): ValidationResult {
  const errors: ValidationError[] = [];

  if (financial.monthlyRevenueRange) {
    const { min, max } = financial.monthlyRevenueRange;
    if (min !== undefined && max !== undefined && min > max) {
      errors.push({
        field: 'financial.monthlyRevenueRange',
        message: 'Minimum revenue cannot be greater than maximum',
      });
    }
    if (min !== undefined && min < 0) {
      errors.push({
        field: 'financial.monthlyRevenueRange.min',
        message: 'Minimum revenue cannot be negative',
      });
    }
  }

  if (financial.averageSessionRate !== undefined && financial.averageSessionRate <= 0) {
    errors.push({
      field: 'financial.averageSessionRate',
      message: 'Session rate must be positive',
    });
  }

  if (financial.clinicianTakeRate !== undefined) {
    if (financial.clinicianTakeRate < 0 || financial.clinicianTakeRate > 1) {
      errors.push({
        field: 'financial.clinicianTakeRate',
        message: 'Clinician take rate must be between 0 and 1',
      });
    }
  }

  if (financial.payerMix) {
    const total =
      (financial.payerMix.selfPay || 0) +
      (financial.payerMix.insurance || 0) +
      (financial.payerMix.slidingScale || 0);
    if (total !== 100) {
      errors.push({
        field: 'financial.payerMix',
        message: `Payer mix percentages must sum to 100 (currently ${total})`,
      });
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates performance metrics
 */
export function validatePerformanceMetrics(metrics: Partial<PerformanceMetrics>): ValidationResult {
  const errors: ValidationError[] = [];

  const rateFields: (keyof PerformanceMetrics)[] = [
    'showRate',
    'rebookRate',
    'cancelRate',
    'noShowRate',
    'monthlyChurnRate',
    'consultConversionRate',
    'notesCompletionRate',
    'notesOverdueRate',
  ];

  rateFields.forEach(field => {
    const value = metrics[field];
    if (value !== undefined && typeof value === 'number') {
      if (value < 0 || value > 1) {
        errors.push({
          field: `performance.metrics.${field}`,
          message: `${field} must be between 0 and 1`,
        });
      }
    }
  });

  // Validate attendance adds up
  if (metrics.showRate && metrics.cancelRate && metrics.noShowRate) {
    const total = metrics.showRate + metrics.cancelRate + metrics.noShowRate;
    if (Math.abs(total - 1) > 0.01) {
      errors.push({
        field: 'performance.metrics',
        message: 'showRate + cancelRate + noShowRate should approximately equal 1',
      });
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates the complete demo configuration
 */
export function validateConfig(config: Partial<DemoConfiguration>): ValidationResult {
  const errors: ValidationError[] = [];

  if (config.practice) {
    const result = validatePractice(config.practice);
    errors.push(...result.errors);
  }

  if (config.clinicians) {
    const result = validateClinicians(config.clinicians);
    errors.push(...result.errors);
  }

  if (config.financial) {
    const result = validateFinancial(config.financial);
    errors.push(...result.errors);
  }

  if (config.performance?.metrics) {
    const result = validatePerformanceMetrics(config.performance.metrics);
    errors.push(...result.errors);
  }

  if (config.dataRange) {
    const start = new Date(config.dataRange.startDate);
    const end = new Date(config.dataRange.endDate);
    if (start >= end) {
      errors.push({
        field: 'dataRange',
        message: 'Start date must be before end date',
      });
    }
  }

  return { valid: errors.length === 0, errors };
}

// =============================================================================
// DEFAULT APPLICATORS
// =============================================================================

/**
 * Applies defaults to practice identity
 */
export function applyPracticeDefaults(
  practice?: Partial<PracticeIdentity>
): PracticeIdentity {
  return {
    ...DEFAULT_PRACTICE,
    ...practice,
    location: {
      ...DEFAULT_PRACTICE.location,
      ...practice?.location,
    },
  };
}

/**
 * Applies defaults to a single clinician
 */
export function applyClinicianDefaults(
  clinician: Partial<ClinicianConfig>,
  index: number
): ClinicianConfig {
  const defaultClinician = DEFAULT_CLINICIANS[index] || DEFAULT_CLINICIANS[0];

  // Ensure we always have a valid startDate
  const startDate = clinician.startDate || defaultClinician.startDate || '2022-01-01';

  return {
    ...defaultClinician,
    ...clinician,
    id: clinician.id || defaultClinician.id || String(index + 1),
    startDate,
    isActive: clinician.isActive ?? defaultClinician.isActive ?? true,
    location: clinician.location || defaultClinician.location || 'Office',
    color: clinician.color || CLINICIAN_COLORS[index % CLINICIAN_COLORS.length],
    performanceProfile: {
      ...defaultClinician.performanceProfile,
      ...clinician.performanceProfile,
    },
    caseload: {
      ...defaultClinician.caseload,
      ...clinician.caseload,
    },
  };
}

/**
 * Applies defaults to clinician array
 */
export function applyCliniciansDefaults(
  clinicians?: Partial<ClinicianConfig>[]
): ClinicianConfig[] {
  if (!clinicians || clinicians.length === 0) {
    return DEFAULT_CLINICIANS;
  }

  return clinicians.map((clinician, index) =>
    applyClinicianDefaults(clinician, index)
  );
}

/**
 * Applies defaults to financial configuration
 */
export function applyFinancialDefaults(
  financial?: Partial<FinancialConfig>
): FinancialConfig {
  return {
    ...DEFAULT_FINANCIAL,
    ...financial,
    monthlyRevenueRange: {
      ...DEFAULT_FINANCIAL.monthlyRevenueRange,
      ...financial?.monthlyRevenueRange,
    },
    payerMix: {
      ...DEFAULT_FINANCIAL.payerMix,
      ...financial?.payerMix,
    },
  };
}

/**
 * Applies defaults to performance metrics
 */
export function applyPerformanceMetricsDefaults(
  metrics?: Partial<PerformanceMetrics>
): PerformanceMetrics {
  return {
    ...DEFAULT_PERFORMANCE_METRICS,
    ...metrics,
    sessionRetention: {
      ...DEFAULT_PERFORMANCE_METRICS.sessionRetention,
      ...metrics?.sessionRetention,
    },
  };
}

/**
 * Applies defaults to performance story
 */
export function applyPerformanceDefaults(
  performance?: Partial<PerformanceStory>
): PerformanceStory {
  return {
    ...DEFAULT_PERFORMANCE,
    ...performance,
    metrics: applyPerformanceMetricsDefaults(performance?.metrics),
    seasonality: {
      ...DEFAULT_SEASONALITY,
      ...performance?.seasonality,
    },
  };
}

/**
 * Applies defaults to feature flags
 */
export function applyFeatureDefaults(
  features?: Partial<FeatureFlags>
): FeatureFlags {
  return {
    ...DEFAULT_FEATURES,
    ...features,
  };
}

/**
 * Applies defaults to data range
 */
export function applyDataRangeDefaults(
  dataRange?: Partial<DataRange>
): DataRange {
  return {
    ...DEFAULT_DATA_RANGE,
    ...dataRange,
  };
}

/**
 * Applies all defaults to a partial configuration
 * Returns a complete, valid DemoConfiguration
 */
export function applyDefaults(
  partial?: Partial<DemoConfiguration>
): DemoConfiguration {
  const now = new Date().toISOString();

  return {
    id: partial?.id || `demo-${Date.now()}`,
    name: partial?.name || DEFAULT_CONFIG.name,
    description: partial?.description || DEFAULT_CONFIG.description,

    practice: applyPracticeDefaults(partial?.practice),
    clinicians: applyCliniciansDefaults(partial?.clinicians),
    financial: applyFinancialDefaults(partial?.financial),
    performance: applyPerformanceDefaults(partial?.performance),

    dataRange: applyDataRangeDefaults(partial?.dataRange),
    randomSeed: partial?.randomSeed ?? DEFAULT_CONFIG.randomSeed,
    features: applyFeatureDefaults(partial?.features),

    createdAt: partial?.createdAt || now,
    updatedAt: now,
  };
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Validates and applies defaults in one step
 * Throws if validation fails
 */
export function validateAndApplyDefaults(
  partial?: Partial<DemoConfiguration>
): DemoConfiguration {
  const validation = validateConfig(partial || {});

  if (!validation.valid) {
    const errorMessages = validation.errors.map(e => `${e.field}: ${e.message}`);
    throw new Error(`Invalid configuration:\n${errorMessages.join('\n')}`);
  }

  return applyDefaults(partial);
}

/**
 * Merges a partial config with existing config
 */
export function mergeConfig(
  existing: DemoConfiguration,
  updates: Partial<DemoConfiguration>
): DemoConfiguration {
  return applyDefaults({
    ...existing,
    ...updates,
    practice: {
      ...existing.practice,
      ...updates.practice,
    },
    financial: {
      ...existing.financial,
      ...updates.financial,
    },
    performance: {
      ...existing.performance,
      ...updates.performance,
    },
    features: {
      ...existing.features,
      ...updates.features,
    },
    // Don't merge arrays - replace them
    clinicians: updates.clinicians || existing.clinicians,
    updatedAt: new Date().toISOString(),
  });
}
