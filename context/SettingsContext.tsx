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

// Goal types that can be tracked independently
export type GoalType = 'sessionGoal' | 'clientGoal' | 'takeRate';

// A single value period for one goal type
// endDate of null means "current" (ongoing)
export interface SingleGoalPeriod {
  id: string;           // Unique ID for this period
  startDate: string;    // ISO date string (YYYY-MM-DD)
  endDate: string | null; // ISO date string or null for current/ongoing
  value: number;        // The goal value
}

// Per-clinician goal history for each goal type
// Each goal type has its own independent history
export interface ClinicianGoalHistory {
  [clinicianId: string]: {
    sessionGoal?: SingleGoalPeriod[];  // Sessions per week history
    clientGoal?: SingleGoalPeriod[];   // Target active clients history
    takeRate?: SingleGoalPeriod[];     // Take rate percentage history
  };
}

// Legacy combined period (kept for reference but not used in new code)
export interface GoalPeriod {
  id: string;
  startDate: string;
  endDate: string | null;
  sessionGoal: number;
  clientGoal: number;
  takeRate: number;
}

// Legacy format for backward compatibility
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

// Icon style for sidebar navigation
export type IconStyle = 'illustrated' | 'phosphor';

interface AppSettings {
  showNetRevenueData: boolean;
  anonymizeClinicianNames: boolean;
  hideAIInsights: boolean;
  showConsultationMetrics: boolean;
  showPriorityTasksEmptyState: boolean; // Preview empty state for priority tasks
  iconStyle: IconStyle; // Sidebar icon style
  practiceGoals: PracticeGoals;
  thresholds: MetricThresholds;
  clinicianGoals: ClinicianGoalOverrides; // Legacy, kept for backward compatibility
  clinicianGoalHistory: ClinicianGoalHistory; // New date-ranged goals
  consultationPipeline: ConsultationPipelineConfig;
}

// NOTE: Data now uses synthetic clinician names directly from data/clinicians.ts
// The anonymizeClinicianNames setting is kept for backward compatibility but
// the getDisplayName function just returns the name as-is since all data is synthetic.

// Helper function to get display name (no-op since data is already synthetic)
export const getDisplayName = (name: string, _anonymize: boolean): string => {
  return name;
};

// Helper to get clinician goals with overrides applied (legacy - uses simple overrides)
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

// Generate a unique ID for a goal period
export const generateGoalPeriodId = (): string => {
  return `gp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// =============================================================================
// NEW GOAL HISTORY HELPERS (per-goal-type)
// =============================================================================

// Get all periods for a specific goal type, sorted by startDate descending
export const getGoalTypePeriods = (
  clinicianId: string,
  goalType: GoalType,
  goalHistory: ClinicianGoalHistory
): SingleGoalPeriod[] => {
  const clinicianHistory = goalHistory[clinicianId];
  if (!clinicianHistory) return [];
  const periods = clinicianHistory[goalType];
  if (!periods) return [];
  return [...periods].sort((a, b) => b.startDate.localeCompare(a.startDate));
};

// Get the current period for a specific goal type (endDate = null)
export const getCurrentGoalTypePeriod = (
  clinicianId: string,
  goalType: GoalType,
  goalHistory: ClinicianGoalHistory
): SingleGoalPeriod | null => {
  const periods = getGoalTypePeriods(clinicianId, goalType, goalHistory);
  return periods.find(p => p.endDate === null) || null;
};

// Get the value for a specific goal type at a specific date
export const getGoalTypeValueForDate = (
  clinicianId: string,
  goalType: GoalType,
  date: Date | null, // null means current
  goalHistory: ClinicianGoalHistory,
  defaultValue: number
): number => {
  const periods = getGoalTypePeriods(clinicianId, goalType, goalHistory);
  if (periods.length === 0) return defaultValue;

  if (date === null) {
    // Get current value
    const current = periods.find(p => p.endDate === null);
    return current?.value ?? defaultValue;
  }

  const dateStr = date.toISOString().split('T')[0];

  // Find the period that contains this date
  const period = periods.find(p => {
    const afterStart = dateStr >= p.startDate;
    const beforeEnd = p.endDate === null || dateStr <= p.endDate;
    return afterStart && beforeEnd;
  });

  return period?.value ?? defaultValue;
};

// Get all current goal values for a clinician
export const getClinicianGoalsForDate = (
  clinicianId: string,
  date: Date | null, // null means "current"
  defaults: { sessionGoal: number; clientGoal: number; takeRate: number },
  goalHistory?: ClinicianGoalHistory
): { sessionGoal: number; clientGoal: number; takeRate: number } => {
  if (!goalHistory) return defaults;

  return {
    sessionGoal: getGoalTypeValueForDate(clinicianId, 'sessionGoal', date, goalHistory, defaults.sessionGoal),
    clientGoal: getGoalTypeValueForDate(clinicianId, 'clientGoal', date, goalHistory, defaults.clientGoal),
    takeRate: getGoalTypeValueForDate(clinicianId, 'takeRate', date, goalHistory, defaults.takeRate),
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
  hideAIInsights: true,
  showConsultationMetrics: false,
  showPriorityTasksEmptyState: true, // Default to empty state preview
  iconStyle: 'illustrated', // Default to illustrated icons
  practiceGoals: DEFAULT_PRACTICE_GOALS,
  thresholds: DEFAULT_THRESHOLDS,
  clinicianGoals: {}, // Legacy, kept for backward compatibility
  clinicianGoalHistory: {}, // New date-ranged goals
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
          clinicianGoalHistory: parsed.clinicianGoalHistory || {},
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
