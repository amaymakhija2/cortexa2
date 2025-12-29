// =============================================================================
// DEMO CONTEXT
// =============================================================================
// Provides demo configuration and generated data to all components.
// Handles URL parameter detection, config persistence, and data generation.
// =============================================================================

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';

import type {
  DemoConfiguration,
  DemoData,
  DemoPreset,
  ClinicianConfig,
  FinancialConfig,
  PerformanceStory,
  PracticeIdentity,
} from '../data/generators/types';

import { DEFAULT_CONFIG } from '../data/generators/config/defaultConfig';
import { BUILT_IN_PRESETS } from '../data/generators/config/presets';
import { validateAndApplyDefaults, mergeConfig } from '../data/generators/config/validators';
import { generateDemoData } from '../data/generators/generators/orchestrator';

// =============================================================================
// CONTEXT TYPES
// =============================================================================

export interface DemoContextValue {
  // Current configuration
  config: DemoConfiguration;

  // Generated data (null while generating)
  data: DemoData | null;

  // Loading state
  isLoading: boolean;

  // Error state
  error: string | null;

  // Demo management
  setConfig: (config: Partial<DemoConfiguration>) => void;
  updatePractice: (practice: Partial<PracticeIdentity>) => void;
  updateClinicians: (clinicians: ClinicianConfig[]) => void;
  updateFinancial: (financial: Partial<FinancialConfig>) => void;
  updatePerformance: (performance: Partial<PerformanceStory>) => void;

  // Preset management
  loadPreset: (presetId: string) => void;
  availablePresets: DemoPreset[];
  activePresetId: string | null;

  // Data regeneration
  regenerate: () => void;

  // Demo panel visibility
  isPanelOpen: boolean;
  togglePanel: () => void;
  openPanel: () => void;
  closePanel: () => void;
}

// =============================================================================
// DEFAULT VALUES
// =============================================================================

const STORAGE_KEY = 'cortexa_demo_config';
const URL_PARAM = 'demo';

// Note: BUILT_IN_PRESETS is imported from presets.ts
// Note: generateDemoData is imported from the orchestrator above

// =============================================================================
// CONTEXT CREATION
// =============================================================================

const DemoContext = createContext<DemoContextValue | null>(null);

// =============================================================================
// PROVIDER COMPONENT
// =============================================================================

interface DemoProviderProps {
  children: ReactNode;
}

export const DemoProvider: React.FC<DemoProviderProps> = ({ children }) => {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  const [config, setConfigState] = useState<DemoConfiguration>(() => {
    // Check URL parameter first
    const urlParams = new URLSearchParams(window.location.search);
    const demoParam = urlParams.get(URL_PARAM);

    if (demoParam) {
      // Find matching preset
      const preset = BUILT_IN_PRESETS.find(p => p.id === demoParam);
      if (preset) {
        return validateAndApplyDefaults(preset.config);
      }
    }

    // Check localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return validateAndApplyDefaults(parsed);
      } catch (e) {
        // Invalid stored config, clear it and use default
        console.warn('[DemoContext] Invalid stored config, clearing localStorage:', e);
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    return DEFAULT_CONFIG;
  });

  const [data, setData] = useState<DemoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string | null>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(URL_PARAM) || null;
  });

  // ---------------------------------------------------------------------------
  // Data Generation
  // ---------------------------------------------------------------------------

  const regenerate = useCallback(() => {
    setIsLoading(true);
    setError(null);

    // Use setTimeout to allow UI to show loading state before heavy computation
    setTimeout(() => {
      try {
        const startTime = performance.now();
        const generatedData = generateDemoData(config);
        const endTime = performance.now();

        // Log generation time in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`[DemoContext] Data generation completed in ${(endTime - startTime).toFixed(1)}ms`);
        }

        setData(generatedData);
        setError(null);
      } catch (err) {
        console.error('Demo data generation failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate demo data');
      } finally {
        setIsLoading(false);
      }
    }, 0);
  }, [config]);

  // Generate data on config change
  useEffect(() => {
    regenerate();
  }, [regenerate]);

  // Persist config to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  // ---------------------------------------------------------------------------
  // Config Update Functions
  // ---------------------------------------------------------------------------

  const setConfig = useCallback((updates: Partial<DemoConfiguration>) => {
    setConfigState(prev => mergeConfig(prev, updates));
    setActivePresetId(null); // Clear preset when manually editing
  }, []);

  const updatePractice = useCallback((practice: Partial<PracticeIdentity>) => {
    setConfigState(prev => mergeConfig(prev, { practice: { ...prev.practice, ...practice } }));
    setActivePresetId(null);
  }, []);

  const updateClinicians = useCallback((clinicians: ClinicianConfig[]) => {
    setConfigState(prev => mergeConfig(prev, { clinicians }));
    setActivePresetId(null);
  }, []);

  const updateFinancial = useCallback((financial: Partial<FinancialConfig>) => {
    setConfigState(prev => mergeConfig(prev, { financial: { ...prev.financial, ...financial } }));
    setActivePresetId(null);
  }, []);

  const updatePerformance = useCallback((performance: Partial<PerformanceStory>) => {
    setConfigState(prev => mergeConfig(prev, { performance: { ...prev.performance, ...performance } }));
    setActivePresetId(null);
  }, []);

  // ---------------------------------------------------------------------------
  // Preset Functions
  // ---------------------------------------------------------------------------

  const loadPreset = useCallback((presetId: string) => {
    const preset = BUILT_IN_PRESETS.find(p => p.id === presetId);
    if (!preset) {
      setError(`Preset "${presetId}" not found`);
      return;
    }

    const newConfig = validateAndApplyDefaults(preset.config);
    setConfigState(newConfig);
    setActivePresetId(presetId);

    // Update URL parameter
    const url = new URL(window.location.href);
    url.searchParams.set(URL_PARAM, presetId);
    window.history.replaceState({}, '', url.toString());
  }, []);

  // ---------------------------------------------------------------------------
  // Panel Functions
  // ---------------------------------------------------------------------------

  const togglePanel = useCallback(() => {
    setIsPanelOpen(prev => !prev);
  }, []);

  const openPanel = useCallback(() => {
    setIsPanelOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

  // ---------------------------------------------------------------------------
  // Keyboard Shortcut: Ctrl+Shift+D to toggle panel
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        togglePanel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePanel]);

  // ---------------------------------------------------------------------------
  // Context Value
  // ---------------------------------------------------------------------------

  const contextValue = useMemo<DemoContextValue>(() => ({
    config,
    data,
    isLoading,
    error,
    setConfig,
    updatePractice,
    updateClinicians,
    updateFinancial,
    updatePerformance,
    loadPreset,
    availablePresets: BUILT_IN_PRESETS,
    activePresetId,
    regenerate,
    isPanelOpen,
    togglePanel,
    openPanel,
    closePanel,
  }), [
    config,
    data,
    isLoading,
    error,
    setConfig,
    updatePractice,
    updateClinicians,
    updateFinancial,
    updatePerformance,
    loadPreset,
    activePresetId,
    regenerate,
    isPanelOpen,
    togglePanel,
    openPanel,
    closePanel,
  ]);

  return (
    <DemoContext.Provider value={contextValue}>
      {children}
    </DemoContext.Provider>
  );
};

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Get the full demo context
 * Throws if used outside DemoProvider
 */
export function useDemoContext(): DemoContextValue {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemoContext must be used within a DemoProvider');
  }
  return context;
}

/**
 * Get just the generated demo data
 * Returns null while loading
 */
export function useDemoData(): DemoData | null {
  const { data } = useDemoContext();
  return data;
}

/**
 * Get just the demo configuration
 */
export function useDemoConfig(): DemoConfiguration {
  const { config } = useDemoContext();
  return config;
}

/**
 * Get loading and error state
 */
export function useDemoStatus(): { isLoading: boolean; error: string | null } {
  const { isLoading, error } = useDemoContext();
  return { isLoading, error };
}

/**
 * Get preset management functions
 */
export function useDemoPresets() {
  const { loadPreset, availablePresets, activePresetId } = useDemoContext();
  return { loadPreset, availablePresets, activePresetId };
}

/**
 * Get panel visibility controls
 */
export function useDemoPanel() {
  const { isPanelOpen, togglePanel, openPanel, closePanel } = useDemoContext();
  return { isPanelOpen, togglePanel, openPanel, closePanel };
}

// =============================================================================
// EXPORTS
// =============================================================================

export { DemoContext };
export type { DemoConfiguration, DemoData };
