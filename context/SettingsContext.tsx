import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
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
