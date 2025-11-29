import React from 'react';

// =============================================================================
// SECTION HEADER COMPONENT
// =============================================================================
// A clear, distinctive section header for organizing page content into
// question-based sections. Each section answers a specific question.
// =============================================================================

export type SectionAccent = 'amber' | 'indigo' | 'rose' | 'emerald' | 'cyan' | 'stone';

const ACCENT_COLORS: Record<SectionAccent, {
  icon: string;
  title: string;
  line: string;
  number: string;
  numberBg: string;
}> = {
  amber: {
    icon: 'text-amber-600',
    title: 'text-stone-900',
    line: 'bg-gradient-to-r from-amber-300 via-amber-200 to-transparent',
    number: 'text-amber-700',
    numberBg: 'bg-amber-100',
  },
  indigo: {
    icon: 'text-indigo-600',
    title: 'text-stone-900',
    line: 'bg-gradient-to-r from-indigo-300 via-indigo-200 to-transparent',
    number: 'text-indigo-700',
    numberBg: 'bg-indigo-100',
  },
  rose: {
    icon: 'text-rose-600',
    title: 'text-stone-900',
    line: 'bg-gradient-to-r from-rose-300 via-rose-200 to-transparent',
    number: 'text-rose-700',
    numberBg: 'bg-rose-100',
  },
  emerald: {
    icon: 'text-emerald-600',
    title: 'text-stone-900',
    line: 'bg-gradient-to-r from-emerald-300 via-emerald-200 to-transparent',
    number: 'text-emerald-700',
    numberBg: 'bg-emerald-100',
  },
  cyan: {
    icon: 'text-cyan-600',
    title: 'text-stone-900',
    line: 'bg-gradient-to-r from-cyan-300 via-cyan-200 to-transparent',
    number: 'text-cyan-700',
    numberBg: 'bg-cyan-100',
  },
  stone: {
    icon: 'text-stone-600',
    title: 'text-stone-900',
    line: 'bg-gradient-to-r from-stone-300 via-stone-200 to-transparent',
    number: 'text-stone-700',
    numberBg: 'bg-stone-200',
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
    <div className={`mb-6 xl:mb-8 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Section number */}
          {number !== undefined && (
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${colors.numberBg}`}
            >
              <span
                className={`text-lg font-bold ${colors.number}`}
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
              className={`text-xl sm:text-2xl font-bold tracking-tight ${colors.title}`}
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              {question}
            </h3>
            {description && (
              <p className="text-stone-500 text-sm mt-1 max-w-xl">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* Decorative line */}
      <div className={`h-0.5 mt-4 rounded-full ${colors.line}`} />
    </div>
  );
};

export default SectionHeader;
