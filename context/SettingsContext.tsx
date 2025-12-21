import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// =============================================================================
// CONSULTATION PIPELINE CONFIGURATION
// =============================================================================
// Controls timing for follow-ups, no-show recovery, and paperwork reminders.
// Each preset defines both the number of attempts AND the timing intervals.

export type FollowUpPreset = 'aggressive' | 'standard' | 'relaxed';

export interface ConsultationPipelineConfig {
  // Pre-consultation settings
  requireConfirmation: boolean;      // Manual confirmation step before consult
  enableSecondConsult: boolean;      // Allow second consult before intake
  confirmationOverdueHours: number;  // Hours until confirmation is considered overdue

  // Follow-up presets
  noShowPreset: FollowUpPreset;
  intakePreset: FollowUpPreset;
  paperworkPreset: FollowUpPreset;
}

// Preset definitions with intervals in hours
export interface PresetDetails {
  label: string;
  description: string;
  sequence: string[];        // Human-readable labels
  intervalsHours: number[];  // Actual intervals in hours
}

// No-Show Recovery Presets
export const NO_SHOW_PRESETS: Record<FollowUpPreset, PresetDetails> = {
  aggressive: {
    label: 'Aggressive',
    description: '4 quick follow-ups',
    sequence: ['Immediate', '6 hours', '12 hours', '24 hours'],
    intervalsHours: [0, 6, 12, 24],
  },
  standard: {
    label: 'Standard',
    description: '3 balanced follow-ups',
    sequence: ['Immediate', '24 hours', '72 hours'],
    intervalsHours: [0, 24, 72],
  },
  relaxed: {
    label: 'Relaxed',
    description: '2 gentle follow-ups',
    sequence: ['24 hours', '1 week'],
    intervalsHours: [24, 168],
  },
};

// Intake Scheduling Presets
export const INTAKE_PRESETS: Record<FollowUpPreset, PresetDetails> = {
  aggressive: {
    label: 'Aggressive',
    description: '4 quick reminders',
    sequence: ['12 hours', '24 hours', '48 hours', '72 hours'],
    intervalsHours: [12, 24, 48, 72],
  },
  standard: {
    label: 'Standard',
    description: '3 balanced reminders',
    sequence: ['24 hours', '72 hours', '1 week'],
    intervalsHours: [24, 72, 168],
  },
  relaxed: {
    label: 'Relaxed',
    description: '2 gentle reminders',
    sequence: ['48 hours', '1 week'],
    intervalsHours: [48, 168],
  },
};

// Paperwork Reminder Presets (relative to intake date, so negative = before)
export const PAPERWORK_PRESETS: Record<FollowUpPreset, PresetDetails> = {
  aggressive: {
    label: 'Aggressive',
    description: '3 reminders close to intake',
    sequence: ['T-48hr', 'T-24hr', 'T-12hr'],
    intervalsHours: [48, 24, 12], // Hours before intake
  },
  standard: {
    label: 'Standard',
    description: '2 balanced reminders',
    sequence: ['T-72hr', 'T-24hr'],
    intervalsHours: [72, 24],
  },
  relaxed: {
    label: 'Relaxed',
    description: '2 early reminders',
    sequence: ['T-1 week', 'T-48hr'],
    intervalsHours: [168, 48],
  },
};

export const DEFAULT_CONSULTATION_PIPELINE: ConsultationPipelineConfig = {
  requireConfirmation: true,
  enableSecondConsult: false,
  confirmationOverdueHours: 4,
  noShowPreset: 'standard',
  intakePreset: 'standard',
  paperworkPreset: 'standard',
};

// Helper to get intervals for a given stage and config
export function getFollowUpIntervals(
  stage: 'no_show' | 'intake_pending' | 'paperwork',
  config: ConsultationPipelineConfig
): number[] {
  switch (stage) {
    case 'no_show':
      return NO_SHOW_PRESETS[config.noShowPreset].intervalsHours;
    case 'intake_pending':
      return INTAKE_PRESETS[config.intakePreset].intervalsHours;
    case 'paperwork':
      return PAPERWORK_PRESETS[config.paperworkPreset].intervalsHours;
  }
}

// Helper to get follow-up count for a given stage and config
export function getFollowUpCount(
  stage: 'no_show' | 'intake_pending' | 'paperwork',
  config: ConsultationPipelineConfig
): number {
  return getFollowUpIntervals(stage, config).length;
}

// =============================================================================
// PRACTICE GOALS
// =============================================================================

// Practice-wide goal settings
export interface PracticeGoals {
  monthlyRevenue: number;
  monthlySessions: number;
  targetRebookRate: number;
  noteDeadlineHours: number;
}

// Per-clinician goal overrides (keyed by clinician ID)
export interface ClinicianGoalOverrides {
  [clinicianId: string]: {
    sessionGoal?: number;
    clientGoal?: number;
    takeRate?: number;
  };
}

// Metric threshold settings
export interface MetricThresholds {
  // Client status definition
  clientDefinitionType: 'status-based' | 'activity-based';
  activityThresholdDays: number;
  // At-risk thresholds
  atRiskLow: number;
  atRiskMedium: number;
  atRiskHigh: number;
  // Churn definition
  churnDays: number;
  // Churn timing (by session count)
  earlyChurnSessions: number;
  lateChurnSessions: number;
  // Late cancel window
  lateCancelHours: number;
  // Note deadline
  noteDeadlineDays: number;
  // Performance thresholds
  revenueHealthy: number;
  revenueCritical: number;
  rebookHealthy: number;
  rebookCritical: number;
}

interface AppSettings {
  showNetRevenueData: boolean;
  anonymizeClinicianNames: boolean;
  practiceGoals: PracticeGoals;
  thresholds: MetricThresholds;
  clinicianGoals: ClinicianGoalOverrides;
  consultationPipeline: ConsultationPipelineConfig;
}

// NOTE: Data now uses synthetic clinician names directly from data/clinicians.ts
// The anonymizeClinicianNames setting is kept for backward compatibility but
// the getDisplayName function just returns the name as-is since all data is synthetic.

// Helper function to get display name (no-op since data is already synthetic)
export const getDisplayName = (name: string, _anonymize: boolean): string => {
  return name;
};

// Helper to get clinician goals with overrides applied
export const getClinicianGoals = (
  clinicianId: string,
  defaults: { sessionGoal: number; clientGoal: number; takeRate: number },
  overrides?: ClinicianGoalOverrides
): { sessionGoal: number; clientGoal: number; takeRate: number } => {
  const override = overrides?.[clinicianId];
  return {
    sessionGoal: override?.sessionGoal ?? defaults.sessionGoal,
    clientGoal: override?.clientGoal ?? defaults.clientGoal,
    takeRate: override?.takeRate ?? defaults.takeRate,
  };
};

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

const SETTINGS_KEY = 'cortexa_settings';

const DEFAULT_PRACTICE_GOALS: PracticeGoals = {
  monthlyRevenue: 150000,
  monthlySessions: 700,
  targetRebookRate: 85,
  noteDeadlineHours: 72,
};

const DEFAULT_THRESHOLDS: MetricThresholds = {
  // Client status definition
  clientDefinitionType: 'status-based',
  activityThresholdDays: 30,
  // At-risk thresholds
  atRiskLow: 7,
  atRiskMedium: 14,
  atRiskHigh: 21,
  // Churn definition
  churnDays: 30,
  // Churn timing (by session count)
  earlyChurnSessions: 5,
  lateChurnSessions: 15,
  // Late cancel window
  lateCancelHours: 24,
  // Note deadline
  noteDeadlineDays: 3,
  // Performance thresholds
  revenueHealthy: 95,
  revenueCritical: 80,
  rebookHealthy: 85,
  rebookCritical: 75,
};

const DEFAULT_SETTINGS: AppSettings = {
  showNetRevenueData: true,
  anonymizeClinicianNames: false,
  practiceGoals: DEFAULT_PRACTICE_GOALS,
  thresholds: DEFAULT_THRESHOLDS,
  clinicianGoals: {}, // Empty = use defaults from data/clinicians.ts
  consultationPipeline: DEFAULT_CONSULTATION_PIPELINE,
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Deep merge to ensure new settings fields have defaults
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          // Ensure nested objects have defaults for new fields
          practiceGoals: { ...DEFAULT_PRACTICE_GOALS, ...parsed.practiceGoals },
          thresholds: { ...DEFAULT_THRESHOLDS, ...parsed.thresholds },
          consultationPipeline: { ...DEFAULT_CONSULTATION_PIPELINE, ...parsed.consultationPipeline },
        };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
