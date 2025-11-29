import React from 'react';

// =============================================================================
// SECTION HEADER COMPONENT
// =============================================================================
// Bold, editorial section headers that command attention.
// Features oversized numbers as visual anchors with generous typography.
// =============================================================================

export type SectionAccent = 'amber' | 'indigo' | 'rose' | 'emerald' | 'cyan' | 'stone';

const ACCENT_COLORS: Record<SectionAccent, {
  icon: string;
  number: string;
  numberBg: string;
  numberShadow: string;
  line: string;
}> = {
  amber: {
    icon: 'text-amber-600',
    number: 'text-amber-600',
    numberBg: 'bg-gradient-to-br from-amber-50 to-amber-100',
    numberShadow: '0 4px 12px -2px rgba(217, 119, 6, 0.2)',
    line: 'bg-amber-200',
  },
  indigo: {
    icon: 'text-indigo-600',
    number: 'text-indigo-600',
    numberBg: 'bg-gradient-to-br from-indigo-50 to-indigo-100',
    numberShadow: '0 4px 12px -2px rgba(99, 102, 241, 0.2)',
    line: 'bg-indigo-200',
  },
  rose: {
    icon: 'text-rose-600',
    number: 'text-rose-600',
    numberBg: 'bg-gradient-to-br from-rose-50 to-rose-100',
    numberShadow: '0 4px 12px -2px rgba(244, 63, 94, 0.2)',
    line: 'bg-rose-200',
  },
  emerald: {
    icon: 'text-emerald-600',
    number: 'text-emerald-600',
    numberBg: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
    numberShadow: '0 4px 12px -2px rgba(16, 185, 129, 0.2)',
    line: 'bg-emerald-200',
  },
  cyan: {
    icon: 'text-cyan-600',
    number: 'text-cyan-600',
    numberBg: 'bg-gradient-to-br from-cyan-50 to-cyan-100',
    numberShadow: '0 4px 12px -2px rgba(6, 182, 212, 0.2)',
    line: 'bg-cyan-200',
  },
  stone: {
    icon: 'text-stone-600',
    number: 'text-stone-600',
    numberBg: 'bg-gradient-to-br from-stone-100 to-stone-200',
    numberShadow: '0 4px 12px -2px rgba(120, 113, 108, 0.15)',
    line: 'bg-stone-300',
  },
};

export interface SectionHeaderProps {
  /** Section number for visual hierarchy */
  number?: number;
  /** The question this section answers */
  question: string;
  /** Optional description below the question */
  description?: string;
  /** Accent color for the section */
  accent?: SectionAccent;
  /** Optional icon component */
  icon?: React.ReactNode;
  /** Right-side actions */
  actions?: React.ReactNode;
  /** Additional className */
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  number,
  question,
  description,
  accent = 'stone',
  icon,
  actions,
  className = '',
}) => {
  const colors = ACCENT_COLORS[accent];

  return (
    <div className={`mb-8 xl:mb-10 ${className}`}>
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {/* Section number - BOLD anchor */}
          {number !== undefined && (
            <div
              className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center ${colors.numberBg}`}
              style={{ boxShadow: colors.numberShadow }}
            >
              <span
                className={`text-2xl font-bold ${colors.number}`}
                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
              >
                {number}
              </span>
            </div>
          )}

          {/* Icon (alternative to number) */}
          {!number && icon && (
            <div className={`flex-shrink-0 ${colors.icon}`}>
              {icon}
            </div>
          )}

          {/* Title and description */}
          <div>
            <h3
              className="text-2xl sm:text-3xl xl:text-4xl font-bold tracking-tight text-stone-900"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              {question}
            </h3>
            {description && (
              <p className="text-stone-500 text-base sm:text-lg mt-2 max-w-2xl">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-3 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* Accent line - solid, confident */}
      <div className={`h-1 mt-5 rounded-full ${colors.line}`} style={{ maxWidth: '120px' }} />
    </div>
  );
};

export default SectionHeader;
