import React from 'react';
import { Check } from 'lucide-react';

// =============================================================================
// COHORT SELECTOR COMPONENT - SIMPLIFIED
// =============================================================================
// Ultra-simple time period selector for practice owners who struggle with data.
// Just 3 big, clear buttons: All Time, This Year, Last Year
// No jargon, no maturity states, no complexity.
// Typography and spacing follows design system patterns from StatCard/ChartCard.
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

export const CohortSelector: React.FC<CohortSelectorProps> = ({
  cohorts,
  selectedCohort,
  onSelect,
  className = '',
}) => {
  return (
    <div className={`${className}`}>
      {/* Simple 3-button row - follows design system spacing */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {cohorts.map((cohort) => {
          const isSelected = selectedCohort === cohort.id;

          return (
            <button
              key={cohort.id}
              onClick={() => onSelect(cohort.id)}
              className={`
                relative rounded-2xl xl:rounded-3xl p-6 sm:p-7 xl:p-8 text-left transition-all duration-200
                ${isSelected
                  ? 'ring-2 ring-amber-500'
                  : 'ring-1 ring-stone-200 hover:ring-stone-300'
                }
              `}
              style={{
                background: isSelected
                  ? 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)'
                  : 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
                boxShadow: isSelected
                  ? '0 4px 24px -4px rgba(217, 119, 6, 0.2), 0 0 0 1px rgba(217, 119, 6, 0.1)'
                  : '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)',
              }}
            >
              {/* Selected checkmark */}
              {isSelected && (
                <div
                  className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    boxShadow: '0 2px 8px -2px rgba(217, 119, 6, 0.4)'
                  }}
                >
                  <Check size={18} className="text-white" strokeWidth={3} />
                </div>
              )}

              {/* Label - matches StatCard title sizing */}
              <h3
                className={`text-2xl sm:text-3xl xl:text-4xl font-bold mb-2 tracking-tight ${
                  isSelected ? 'text-amber-900' : 'text-stone-900'
                }`}
                style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
              >
                {cohort.label}
              </h3>

              {/* Subtitle - matches StatCard subtitle sizing */}
              {cohort.sublabel && (
                <p className={`text-base sm:text-lg xl:text-xl font-medium ${
                  isSelected ? 'text-amber-700' : 'text-stone-500'
                }`}>
                  {cohort.sublabel}
                </p>
              )}

              {/* Client count - hero value styling */}
              <p
                className={`text-4xl sm:text-5xl xl:text-6xl font-bold mt-4 xl:mt-5 ${
                  isSelected ? 'text-amber-600' : 'text-stone-900'
                }`}
                style={{ fontFamily: "'Tiempos Headline', Georgia, serif", lineHeight: 1 }}
              >
                {cohort.clientCount.toLocaleString()}
              </p>
              <p className={`text-base sm:text-lg xl:text-xl font-medium mt-1 ${
                isSelected ? 'text-amber-600' : 'text-stone-500'
              }`}>
                clients
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CohortSelector;
