import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AppSettings {
  showNetRevenueData: boolean;
  anonymizeClinicianNames: boolean;
}

// Mapping of real clinician names to demo names
export const DEMO_NAMES: Record<string, string> = {
  'Ajita Reddy': 'Maya Patel',
  'Brittany Derhammer': 'Emma Thompson',
  'Kaitlyn Gibson': 'Olivia Martinez',
  'Emily Eckhardt': 'Sophie Chen',
  'Simran Marwaha': 'Priya Sharma',
  'Danielle Benson': 'Ava Wilson',
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
