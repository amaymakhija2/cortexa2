import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AppSettings {
  showNetRevenueData: boolean;
  anonymizeClinicianNames: boolean;
}

// Mapping of real clinician names to demo names
// Demographics: ~60% White, ~18% Hispanic, ~12% Black, ~6% Asian (US Census)
export const DEMO_NAMES: Record<string, string> = {
  // White/European American (~10)
  'Gaya K': 'Sarah M',
  'Rudhdi K': 'Emma T',
  'Alaina M': 'Rachel K',
  'Aditi R': 'Lauren C',
  'Tamanna A': 'Katie R',
  'Gajan G': 'Brian H',
  'Shivon R': 'Jennifer L',
  // Hispanic/Latino (~3)
  'Tanisha S': 'Maria G',
  'Mehar A': 'Sofia M',
  'Deepa S': 'Carlos R',
  // Black/African American (~2)
  'Rebecca S': 'Jasmine W',
  'Apeksha M': 'Marcus J',
  // Asian (~2)
  'Riddhi C': 'Priya S',
  'Ranya P': 'David K',
  // Additional White/European American
  'Vikramjit B': 'Michael B',
  'Paulomi M': 'Chris P',
  'Preeti R': 'Amanda H',
};

// Helper function to get display name based on settings
export const getDisplayName = (realName: string, anonymize: boolean): string => {
  if (!anonymize) return realName;
  return DEMO_NAMES[realName] || realName;
};

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

const SETTINGS_KEY = 'cortexa_settings';

const DEFAULT_SETTINGS: AppSettings = {
  showNetRevenueData: true,
  anonymizeClinicianNames: false,
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
