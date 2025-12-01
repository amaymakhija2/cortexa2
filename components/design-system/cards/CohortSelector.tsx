import React, { useState, useEffect } from 'react';
import { Users, Check, Clock, AlertCircle, Sparkles, ChevronDown, Pencil } from 'lucide-react';

// =============================================================================
// COHORT SELECTOR COMPONENT
// =============================================================================
// A distinctive cohort selection interface for retention analysis.
// Features two states:
// - EXPANDED: Sophisticated card grid with hero-sized typography
// - COLLAPSED: Compact summary bar after selection
//
// Design Philosophy: Make selection prominent initially with luxury-level
// typography and spacing, then collapse to let users focus on data.
// =============================================================================

export type CohortMaturity = 'mature' | 'partial' | 'immature';

export interface CohortOption {
  id: string;
  label: string;
  sublabel?: string;
  clientCount: number;
  maturity: CohortMaturity;
  availableDate?: string;
  recommended?: boolean;
}

export interface CohortSelectorProps {
  cohorts: CohortOption[];
  selectedCohort: string | null;
  onSelect: (cohortId: string) => void;
  title?: string;
  subtitle?: string;
  className?: string;
}

// Maturity badge configurations
const MATURITY_CONFIG: Record<CohortMaturity, {
  label: string;
  icon: React.ElementType;
  bgColor: string;
  textColor: string;
  borderColor: string;
  glowColor: string;
}> = {
  mature: {
    label: 'Complete Data',
    icon: Check,
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    glowColor: 'rgba(16, 185, 129, 0.15)',
  },
  partial: {
    label: 'Partial Data',
    icon: Clock,
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    glowColor: 'rgba(245, 158, 11, 0.15)',
  },
  immature: {
    label: 'Too Recent',
    icon: AlertCircle,
    bgColor: 'bg-stone-100',
    textColor: 'text-stone-500',
    borderColor: 'border-stone-300',
    glowColor: 'rgba(120, 113, 108, 0.1)',
  },
};

export const CohortSelector: React.FC<CohortSelectorProps> = ({
  cohorts,
  selectedCohort,
  onSelect,
  title = 'Which clients do you want to analyze?',
  subtitle = 'Select a time period to see retention data for clients who started during that window',
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(!selectedCohort);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Auto-collapse when a cohort is selected
  useEffect(() => {
    if (selectedCohort && isExpanded) {
      const timer = setTimeout(() => setIsExpanded(false), 300);
      return () => clearTimeout(timer);
    }
  }, [selectedCohort]);

  const selectedCohortData = cohorts.find(c => c.id === selectedCohort);

  const handleSelect = (cohortId: string) => {
    onSelect(cohortId);
  };

  const handleExpand = () => {
    setIsExpanded(true);
  };

  const showCollapsed = selectedCohort && selectedCohortData && !isExpanded;

  // Get maturity config for collapsed state
  const collapsedMaturityConfig = selectedCohortData ? MATURITY_CONFIG[selectedCohortData.maturity] : null;
  const CollapsedMaturityIcon = collapsedMaturityConfig?.icon;

  return (
    <div className={`relative ${className}`}>
      {/* =========================================================================
          COLLAPSED STATE - Bold summary bar
          ========================================================================= */}
      <div
        className="relative rounded-2xl xl:rounded-3xl"
        style={{
          background: 'linear-gradient(145deg, #fffbeb 0%, #fef3c7 100%)',
          boxShadow: showCollapsed
            ? '0 4px 20px -4px rgba(217, 119, 6, 0.15), 0 0 0 1px rgba(217, 119, 6, 0.2)'
            : 'none',
          opacity: showCollapsed ? 1 : 0,
          maxHeight: showCollapsed ? '200px' : '0px',
          padding: showCollapsed ? undefined : 0,
          marginBottom: showCollapsed ? 0 : '-8px',
          transform: showCollapsed ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.98)',
          transition: 'opacity 0.4s ease-out, transform 0.4s ease-out, max-height 0.4s ease-out, margin-bottom 0.3s ease-out',
          pointerEvents: showCollapsed ? 'auto' : 'none',
          overflow: 'hidden',
          zIndex: showCollapsed ? 2 : 0,
        }}
      >
        {/* Bold amber accent bar on left */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1.5"
          style={{
            background: 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)',
            boxShadow: '2px 0 8px -2px rgba(217, 119, 6, 0.3)',
          }}
        />

        {selectedCohortData && collapsedMaturityConfig && CollapsedMaturityIcon && (
          <div className="flex items-center justify-between gap-6 px-7 py-5 sm:py-6 pl-8">
            <div className="flex items-center gap-5 min-w-0">
              {/* Bold icon badge */}
              <div
                className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  boxShadow: '0 4px 12px -2px rgba(217, 119, 6, 0.25), inset 0 1px 0 rgba(255,255,255,0.8)'
                }}
              >
                <Users size={24} className="text-amber-600" />
              </div>

              <div className="min-w-0">
                {/* Prominent cohort label */}
                <div className="flex items-center gap-4">
                  <h3
                    className="text-xl sm:text-2xl xl:text-3xl font-bold text-stone-900 truncate"
                    style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                  >
                    {selectedCohortData.label}
                  </h3>
                  {selectedCohortData.sublabel && (
                    <span className="text-stone-500 text-base hidden sm:inline">
                      {selectedCohortData.sublabel}
                    </span>
                  )}
                </div>
                {/* Clear metadata row */}
                <div className="flex items-center gap-4 mt-1.5">
                  <span className="text-amber-700 text-base sm:text-lg font-semibold">
                    {selectedCohortData.clientCount.toLocaleString()} clients
                  </span>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-medium ${collapsedMaturityConfig.bgColor} ${collapsedMaturityConfig.textColor}`}>
                    <CollapsedMaturityIcon size={14} />
                    <span>{collapsedMaturityConfig.label}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Prominent change button */}
            <button
              onClick={handleExpand}
              className="flex-shrink-0 flex items-center gap-2.5 px-5 py-3 rounded-xl bg-white text-amber-700 hover:bg-amber-50 transition-all duration-200 group"
              style={{
                boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(217, 119, 6, 0.2)',
              }}
            >
              <Pencil size={16} className="group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-base font-semibold">Change</span>
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          EXPANDED STATE - Sophisticated card grid with hero typography
          ========================================================================= */}
      <div
        className="relative overflow-hidden rounded-2xl xl:rounded-3xl"
        style={{
          background: 'linear-gradient(145deg, #fafaf9 0%, #f5f5f4 100%)',
          boxShadow: !showCollapsed
            ? '0 4px 24px -4px rgba(0, 0, 0, 0.06), inset 0 0 0 1px rgba(0, 0, 0, 0.03)'
            : 'none',
          opacity: !showCollapsed ? 1 : 0,
          maxHeight: !showCollapsed ? '2000px' : '0px',
          transform: !showCollapsed ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.98)',
          transition: 'opacity 0.4s ease-out, transform 0.4s ease-out, max-height 0.5s ease-out',
          pointerEvents: !showCollapsed ? 'auto' : 'none',
          zIndex: !showCollapsed ? 1 : 0,
        }}
      >
        {/* Decorative background pattern */}
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #78716c 0.5px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Warm gradient accent */}
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] opacity-25 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at top right, #f59e0b 0%, transparent 50%)',
            filter: 'blur(80px)',
          }}
        />

        {/* Secondary accent */}
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] opacity-10 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at bottom left, #d97706 0%, transparent 50%)',
            filter: 'blur(60px)',
          }}
        />

        <div className="relative p-8 sm:p-10 xl:p-14">
          {/* Header - only show if title or subtitle are provided */}
          {(title || subtitle || (selectedCohort && selectedCohortData)) && (
            <div
              className={title || subtitle ? "mb-10 xl:mb-14" : "mb-6 flex justify-end"}
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(-10px)',
                transition: 'all 0.5s ease-out',
              }}
            >
              <div className="flex items-start justify-between gap-6 w-full">
                {(title || subtitle) && (
                  <div className="max-w-3xl">
                    {title && (
                      <h2
                        className="text-3xl sm:text-4xl xl:text-5xl text-stone-900 tracking-tight mb-4"
                        style={{ fontFamily: "'DM Serif Display', Georgia, serif", lineHeight: 1.1 }}
                      >
                        {title}
                      </h2>
                    )}
                    {subtitle && (
                      <p className="text-stone-500 text-lg xl:text-xl leading-relaxed">
                        {subtitle}
                      </p>
                    )}
                  </div>
                )}

                {/* Collapse button if a cohort was previously selected */}
                {selectedCohort && selectedCohortData && (
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-stone-500 hover:text-stone-700 hover:bg-stone-100 transition-all duration-200 ml-auto"
                  >
                    <ChevronDown size={18} className="rotate-180" />
                    <span className="text-sm font-semibold">Collapse</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Cohort Cards Grid - Sophisticated hero-sized cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 xl:gap-6">
            {cohorts.map((cohort, index) => {
              const maturityConfig = MATURITY_CONFIG[cohort.maturity];
              const MaturityIcon = maturityConfig.icon;
              const isSelected = selectedCohort === cohort.id;
              const isHovered = hoveredId === cohort.id;
              const isDisabled = cohort.maturity === 'immature';

              return (
                <button
                  key={cohort.id}
                  onClick={() => !isDisabled && handleSelect(cohort.id)}
                  onMouseEnter={() => setHoveredId(cohort.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  disabled={isDisabled}
                  className={`relative group text-left rounded-2xl xl:rounded-3xl transition-all duration-300 ${
                    isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
                  }`}
                  style={{
                    opacity: isVisible ? (isDisabled ? 0.5 : 1) : 0,
                    transform: isVisible
                      ? isSelected
                        ? 'translateY(-4px) scale(1.02)'
                        : isHovered && !isDisabled
                          ? 'translateY(-4px)'
                          : 'translateY(0)'
                      : 'translateY(20px)',
                    transition: `all 0.4s cubic-bezier(0.4, 0, 0.2, 1)`,
                    transitionDelay: `${index * 60}ms`,
                  }}
                >
                  {/* Card container with refined shadow and border */}
                  <div
                    className="relative rounded-2xl xl:rounded-3xl p-6 sm:p-7 xl:p-8"
                    style={{
                      background: isSelected
                        ? 'linear-gradient(145deg, #fffbeb 0%, #fef3c7 100%)'
                        : 'linear-gradient(145deg, #ffffff 0%, #fafaf9 100%)',
                      boxShadow: isSelected
                        ? '0 12px 40px -8px rgba(217, 119, 6, 0.35), 0 0 0 2px #d97706, inset 0 1px 0 rgba(255,255,255,0.8)'
                        : isHovered && !isDisabled
                          ? '0 8px 32px -6px rgba(0, 0, 0, 0.12), inset 0 0 0 1px rgba(0, 0, 0, 0.06)'
                          : '0 4px 16px -4px rgba(0, 0, 0, 0.06), inset 0 0 0 1px rgba(0, 0, 0, 0.04)',
                    }}
                  >
                    {/* Recommended badge - positioned inside card bounds */}
                    {cohort.recommended && !isSelected && (
                      <div
                        className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-sm font-bold shadow-lg"
                        style={{
                          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                          transform: isHovered ? 'scale(1.05) rotate(-2deg)' : 'scale(1) rotate(0deg)',
                          transition: 'transform 0.3s ease-out',
                        }}
                      >
                        <Sparkles size={14} />
                        <span>Recommended</span>
                      </div>
                    )}

                    {/* Selected indicator */}
                    {isSelected && (
                      <div
                        className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                        style={{
                          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                          animation: 'cohortPulse 2s ease-in-out infinite',
                        }}
                      >
                        <Check size={18} className="text-white" strokeWidth={3} />
                      </div>
                    )}

                    {/* Decorative corner accent for selected */}
                    {isSelected && (
                      <div
                        className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
                        style={{
                          background: 'radial-gradient(circle at top right, rgba(217, 119, 6, 0.15) 0%, transparent 70%)',
                        }}
                      />
                    )}

                    {/* Content with generous spacing */}
                    <div className="relative space-y-5">
                      {/* Cohort Label - Hero typography */}
                      <div>
                        <h3
                          className={`text-2xl sm:text-3xl xl:text-3xl font-bold tracking-tight ${
                            isSelected ? 'text-amber-800' : 'text-stone-900'
                          }`}
                          style={{ fontFamily: "'DM Serif Display', Georgia, serif", lineHeight: 1.1 }}
                        >
                          {cohort.label}
                        </h3>
                        {cohort.sublabel && (
                          <p className={`text-base xl:text-lg mt-1.5 ${
                            isSelected ? 'text-amber-700/70' : 'text-stone-500'
                          }`}>
                            {cohort.sublabel}
                          </p>
                        )}
                      </div>

                      {/* Client count - The HERO number */}
                      <div className="flex items-baseline gap-3">
                        <span
                          className={`text-4xl sm:text-5xl xl:text-5xl font-bold ${
                            isSelected ? 'text-amber-700' : 'text-stone-800'
                          }`}
                          style={{ fontFamily: "'DM Serif Display', Georgia, serif", lineHeight: 1 }}
                        >
                          {cohort.clientCount.toLocaleString()}
                        </span>
                        <span className={`text-lg xl:text-xl font-medium ${
                          isSelected ? 'text-amber-600/80' : 'text-stone-500'
                        }`}>
                          clients
                        </span>
                      </div>

                      {/* Availability message for immature cohorts */}
                      {cohort.maturity === 'immature' && cohort.availableDate && (
                        <p className="text-stone-400 text-sm font-medium">
                          Data available {cohort.availableDate}
                        </p>
                      )}
                    </div>

                    {/* Hover overlay effect */}
                    {!isDisabled && !isSelected && (
                      <div
                        className="absolute inset-0 rounded-2xl xl:rounded-3xl pointer-events-none"
                        style={{
                          background: isHovered
                            ? 'linear-gradient(145deg, rgba(245, 158, 11, 0.03) 0%, rgba(217, 119, 6, 0.06) 100%)'
                            : 'transparent',
                          transition: 'background 0.3s ease-out',
                        }}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes cohortPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(217, 119, 6, 0.5); }
          50% { box-shadow: 0 0 0 10px rgba(217, 119, 6, 0); }
        }
      `}</style>
    </div>
  );
};

export default CohortSelector;
