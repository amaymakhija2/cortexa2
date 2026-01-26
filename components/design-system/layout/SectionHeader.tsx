import React from 'react';

// =============================================================================
// SECTION HEADER COMPONENT
// =============================================================================
// Refined editorial section headers with sophisticated typography.
// Works beautifully standalone or within SectionContainer.
// Features oversized numbers with gradient fills and elegant spacing.
// =============================================================================

export type SectionAccent = 'amber' | 'indigo' | 'rose' | 'emerald' | 'cyan' | 'stone';

const ACCENT_COLORS: Record<SectionAccent, {
  icon: string;
  number: string;
  numberBg: string;
  numberGradient: string;
  numberShadow: string;
  line: string;
  lineGradient: string;
  labelBg: string;
  labelText: string;
}> = {
  amber: {
    icon: 'text-amber-600',
    number: 'text-amber-600',
    numberBg: 'bg-gradient-to-br from-amber-50 via-amber-100 to-amber-50',
    numberGradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
    numberShadow: '0 4px 16px -4px rgba(217, 119, 6, 0.25), 0 0 0 1px rgba(217, 119, 6, 0.08)',
    line: 'bg-amber-200',
    lineGradient: 'linear-gradient(90deg, #fbbf24 0%, #d97706 50%, transparent 100%)',
    labelBg: 'bg-amber-50',
    labelText: 'text-amber-700',
  },
  indigo: {
    icon: 'text-indigo-600',
    number: 'text-indigo-600',
    numberBg: 'bg-gradient-to-br from-indigo-50 via-indigo-100 to-indigo-50',
    numberGradient: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
    numberShadow: '0 4px 16px -4px rgba(79, 70, 229, 0.25), 0 0 0 1px rgba(79, 70, 229, 0.08)',
    line: 'bg-indigo-200',
    lineGradient: 'linear-gradient(90deg, #818cf8 0%, #4f46e5 50%, transparent 100%)',
    labelBg: 'bg-indigo-50',
    labelText: 'text-indigo-700',
  },
  rose: {
    icon: 'text-rose-600',
    number: 'text-rose-600',
    numberBg: 'bg-gradient-to-br from-rose-50 via-rose-100 to-rose-50',
    numberGradient: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
    numberShadow: '0 4px 16px -4px rgba(225, 29, 72, 0.25), 0 0 0 1px rgba(225, 29, 72, 0.08)',
    line: 'bg-rose-200',
    lineGradient: 'linear-gradient(90deg, #fb7185 0%, #e11d48 50%, transparent 100%)',
    labelBg: 'bg-rose-50',
    labelText: 'text-rose-700',
  },
  emerald: {
    icon: 'text-emerald-600',
    number: 'text-emerald-600',
    numberBg: 'bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-50',
    numberGradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    numberShadow: '0 4px 16px -4px rgba(5, 150, 105, 0.25), 0 0 0 1px rgba(5, 150, 105, 0.08)',
    line: 'bg-emerald-200',
    lineGradient: 'linear-gradient(90deg, #34d399 0%, #059669 50%, transparent 100%)',
    labelBg: 'bg-emerald-50',
    labelText: 'text-emerald-700',
  },
  cyan: {
    icon: 'text-cyan-600',
    number: 'text-cyan-600',
    numberBg: 'bg-gradient-to-br from-cyan-50 via-cyan-100 to-cyan-50',
    numberGradient: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
    numberShadow: '0 4px 16px -4px rgba(8, 145, 178, 0.25), 0 0 0 1px rgba(8, 145, 178, 0.08)',
    line: 'bg-cyan-200',
    lineGradient: 'linear-gradient(90deg, #22d3ee 0%, #0891b2 50%, transparent 100%)',
    labelBg: 'bg-cyan-50',
    labelText: 'text-cyan-700',
  },
  stone: {
    icon: 'text-stone-600',
    number: 'text-stone-600',
    numberBg: 'bg-gradient-to-br from-stone-100 via-stone-150 to-stone-100',
    numberGradient: 'linear-gradient(135deg, #57534e 0%, #44403c 100%)',
    numberShadow: '0 4px 16px -4px rgba(87, 83, 78, 0.2), 0 0 0 1px rgba(87, 83, 78, 0.06)',
    line: 'bg-stone-300',
    lineGradient: 'linear-gradient(90deg, #a8a29e 0%, #78716c 50%, transparent 100%)',
    labelBg: 'bg-stone-100',
    labelText: 'text-stone-700',
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
  /** Whether to show the accent line (default: true, set false when inside SectionContainer) */
  showAccentLine?: boolean;
  /** Compact mode - less bottom margin (for use in containers) */
  compact?: boolean;
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
  showAccentLine = true,
  compact = false,
  className = '',
}) => {
  const colors = ACCENT_COLORS[accent];

  return (
    <div className={`${compact ? 'mb-4 xl:mb-5' : 'mb-6 xl:mb-8'} ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Section number - refined with gradient text option */}
          {number !== undefined && (
            <div
              className={`flex-shrink-0 w-11 h-11 xl:w-12 xl:h-12 rounded-xl flex items-center justify-center ${colors.numberBg} relative overflow-hidden`}
              style={{ boxShadow: colors.numberShadow }}
            >
              {/* Subtle inner glow */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  background: `radial-gradient(circle at 30% 30%, white 0%, transparent 60%)`,
                }}
              />
              <span
                className={`text-xl xl:text-2xl font-bold relative z-10 ${colors.number}`}
                style={{
                  fontFamily: "'Tiempos Headline', Georgia, serif",
                }}
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
          <div className="pt-0.5">
            <h3
              className="text-xl sm:text-2xl xl:text-[1.75rem] font-bold tracking-tight text-stone-900 leading-tight"
              style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
            >
              {question}
            </h3>
            {description && (
              <p className="text-stone-600 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-3 flex-shrink-0 pt-1">
            {actions}
          </div>
        )}
      </div>

      {/* Accent line - gradient with taper */}
      {showAccentLine && (
        <div
          className="h-0.5 mt-4 rounded-full"
          style={{
            maxWidth: '100px',
            background: colors.lineGradient,
          }}
        />
      )}
    </div>
  );
};

export default SectionHeader;
