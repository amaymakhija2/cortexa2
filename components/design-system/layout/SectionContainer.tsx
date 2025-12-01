import React from 'react';

// =============================================================================
// SECTION CONTAINER COMPONENT
// =============================================================================
// "Paper & Ink" aesthetic - invisible infrastructure that lets content shine.
// Inspired by premium financial publications where containers recede and
// data takes center stage. Separation through space, shadow, and subtle rules.
// =============================================================================

export type SectionAccent = 'amber' | 'indigo' | 'rose' | 'emerald' | 'cyan' | 'stone';

// Minimal accent config - just for the thin rule between sections
const ACCENT_RULES: Record<SectionAccent, string> = {
  rose: 'rgba(225, 29, 72, 0.15)',
  amber: 'rgba(217, 119, 6, 0.15)',
  cyan: 'rgba(8, 145, 178, 0.15)',
  emerald: 'rgba(5, 150, 105, 0.15)',
  indigo: 'rgba(79, 70, 229, 0.15)',
  stone: 'rgba(120, 113, 108, 0.12)',
};

export interface SectionContainerProps {
  /** Accent color - used only for subtle divider tint */
  accent?: SectionAccent;
  /** Section number for staggered animation delay */
  index?: number;
  /** Whether this is the first visible section (no top divider) */
  isFirst?: boolean;
  /** Whether this is the last section (no bottom spacing) */
  isLast?: boolean;
  /** Additional className */
  className?: string;
  /** Section content */
  children: React.ReactNode;
}

/**
 * SectionContainer - Invisible Infrastructure
 *
 * Creates clear visual separation WITHOUT competing with content:
 * - Pure white elevated card (depth through shadow, not color)
 * - Generous padding and breathing room
 * - Hairline divider between sections with subtle accent tint
 * - Refined entrance animation
 *
 * The container should be INVISIBLE - all visual attention goes to:
 * 1. Section header (colored number badge)
 * 2. Charts and data (the actual content)
 *
 * @example
 * <SectionContainer accent="rose" index={1}>
 *   <SectionHeader number={1} question="When do clients leave?" accent="rose" />
 *   <Grid cols={2}>...</Grid>
 * </SectionContainer>
 */
export const SectionContainer: React.FC<SectionContainerProps> = ({
  accent = 'stone',
  index = 0,
  isFirst = false,
  isLast = false,
  className = '',
  children,
}) => {
  const ruleColor = ACCENT_RULES[accent];
  const animationDelay = index * 0.08;

  return (
    <div
      className={`section-container-wrapper ${className}`}
      style={{
        animation: `sectionFadeIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${animationDelay}s both`,
      }}
    >
      {/* Hairline divider - elegant separation */}
      {!isFirst && (
        <div
          className="section-divider"
          style={{
            height: '1px',
            background: `linear-gradient(90deg, transparent 0%, ${ruleColor} 20%, ${ruleColor} 80%, transparent 100%)`,
            marginBottom: '2.5rem',
          }}
        />
      )}

      {/* Main section container - pure white, elevated */}
      <div
        className="section-container"
        style={{
          background: 'white',
          borderRadius: '24px',
          padding: '2.5rem',
          // Layered shadow for depth - like floating paper
          boxShadow: `
            0 1px 2px rgba(0, 0, 0, 0.04),
            0 2px 4px rgba(0, 0, 0, 0.03),
            0 4px 8px rgba(0, 0, 0, 0.02),
            0 8px 16px rgba(0, 0, 0, 0.01),
            0 0 0 1px rgba(0, 0, 0, 0.03)
          `,
        }}
      >
        {children}
      </div>

      {/* Bottom breathing room */}
      {!isLast && (
        <div style={{ height: '2rem' }} />
      )}

      <style>{`
        @keyframes sectionFadeIn {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

// =============================================================================
// SECTION DIVIDER COMPONENT
// =============================================================================
// Standalone divider - minimal, refined
// =============================================================================

export interface SectionDividerProps {
  /** Accent color for subtle tint */
  accent?: SectionAccent;
  /** Additional className */
  className?: string;
}

/**
 * SectionDivider - Hairline rule with centered dot
 */
export const SectionDivider: React.FC<SectionDividerProps> = ({
  accent = 'stone',
  className = '',
}) => {
  const ruleColor = ACCENT_RULES[accent];

  return (
    <div className={`section-divider py-10 xl:py-14 ${className}`}>
      <div className="flex items-center justify-center gap-6">
        {/* Left line */}
        <div
          className="flex-1 h-px max-w-[240px]"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${ruleColor} 100%)`,
          }}
        />

        {/* Center dot - subtle */}
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: ruleColor }}
        />

        {/* Right line */}
        <div
          className="flex-1 h-px max-w-[240px]"
          style={{
            background: `linear-gradient(90deg, ${ruleColor} 0%, transparent 100%)`,
          }}
        />
      </div>
    </div>
  );
};

export default SectionContainer;
