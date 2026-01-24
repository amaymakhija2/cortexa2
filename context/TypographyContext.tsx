import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// =============================================================================
// TYPOGRAPHY CONTEXT
// =============================================================================
// Global typography mode control for A/B/C testing different font treatments.
// Persists to localStorage and applies CSS overrides across the entire app.
//
// Modes:
// - hybrid: Titles = serif (Tiempos Headline), Values = sans (Suisse Intl)
// - sans: Everything uses Suisse Intl
// - serif: Everything uses Tiempos Headline
// =============================================================================

export type TypographyMode = 'hybrid' | 'sans' | 'serif';

interface TypographyContextValue {
  mode: TypographyMode;
  setMode: (mode: TypographyMode) => void;
}

const TypographyContext = createContext<TypographyContextValue | undefined>(undefined);

const STORAGE_KEY = 'cortexa-typography-mode';

export const TypographyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<TypographyMode>(() => {
    // Initialize from localStorage, default to 'hybrid'
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'hybrid' || stored === 'sans' || stored === 'serif') {
        return stored;
      }
    }
    return 'hybrid';
  });

  const setMode = (newMode: TypographyMode) => {
    setModeState(newMode);
    localStorage.setItem(STORAGE_KEY, newMode);
  };

  // Apply data attribute to document for CSS targeting
  useEffect(() => {
    document.documentElement.setAttribute('data-typography', mode);
  }, [mode]);

  return (
    <TypographyContext.Provider value={{ mode, setMode }}>
      {children}
    </TypographyContext.Provider>
  );
};

export const useTypography = (): TypographyContextValue => {
  const context = useContext(TypographyContext);
  if (!context) {
    throw new Error('useTypography must be used within a TypographyProvider');
  }
  return context;
};

// =============================================================================
// GLOBAL TYPOGRAPHY STYLES COMPONENT
// =============================================================================
// Injects CSS overrides based on the current typography mode.
// Should be rendered once at the app root level.
// =============================================================================

export const TypographyStyles: React.FC = () => {
  return (
    <style>{`
      /* ===== ALL SANS MODE ===== */
      [data-typography="sans"] [style*="Tiempos"],
      [data-typography="sans"] [style*="Georgia"],
      [data-typography="sans"] [style*="serif"] {
        font-family: 'Suisse Intl', system-ui, sans-serif !important;
      }
      [data-typography="sans"] h1,
      [data-typography="sans"] h2,
      [data-typography="sans"] h3,
      [data-typography="sans"] h4 {
        font-family: 'Suisse Intl', system-ui, sans-serif !important;
      }

      /* ===== ALL SERIF MODE ===== */
      [data-typography="serif"] h1,
      [data-typography="serif"] h2,
      [data-typography="serif"] h3,
      [data-typography="serif"] h4,
      [data-typography="serif"] span,
      [data-typography="serif"] p,
      [data-typography="serif"] div {
        font-family: 'Tiempos Headline', Georgia, serif !important;
      }

      /* ===== HYBRID MODE ===== */
      /* Titles stay serif (h2, h3), but value spans become sans */
      /* Target value spans by their large text size classes */
      [data-typography="hybrid"] span.text-3xl,
      [data-typography="hybrid"] span.text-4xl,
      [data-typography="hybrid"] span.text-5xl,
      [data-typography="hybrid"] span.text-6xl,
      [data-typography="hybrid"] span.xl\\:text-4xl,
      [data-typography="hybrid"] span.xl\\:text-5xl,
      [data-typography="hybrid"] span.xl\\:text-6xl,
      [data-typography="hybrid"] span.sm\\:text-4xl,
      [data-typography="hybrid"] span.sm\\:text-5xl {
        font-family: 'Suisse Intl', system-ui, sans-serif !important;
      }
      /* Keep h2, h3 titles in serif */
      [data-typography="hybrid"] h2,
      [data-typography="hybrid"] h3 {
        font-family: 'Tiempos Headline', Georgia, serif !important;
      }
    `}</style>
  );
};

export default TypographyContext;
