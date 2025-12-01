import React from 'react';
import { Calendar, TrendingUp } from 'lucide-react';

// =============================================================================
// FREQUENCY RETENTION CARD COMPONENT
// =============================================================================
// Shows the correlation between session frequency and client retention.
// Helps practice owners understand that weekly clients stay longer.
// =============================================================================

export interface FrequencyData {
  /** Frequency type */
  frequency: 'weekly' | 'biweekly' | 'monthly';
  /** Display label */
  label: string;
  /** Average sessions before churn for this frequency */
  avgSessions: number;
  /** Number of clients in this category */
  clientCount: number;
  /** Average tenure in months */
  avgTenureMonths: number;
}

export interface FrequencyRetentionCardProps {
  /** Frequency breakdown data */
  frequencyData: FrequencyData[];
  /** Benchmark range for comparison (e.g., "1.8-2.5x") */
  benchmarkRange?: string;
  /** Additional className */
  className?: string;
}

/**
 * FrequencyRetentionCard - Session frequency correlation insight
 *
 * @example
 * <FrequencyRetentionCard
 *   frequencyData={[
 *     { frequency: 'weekly', label: 'Weekly', avgSessions: 14.2, clientCount: 78, avgTenureMonths: 5.2 },
 *     { frequency: 'biweekly', label: 'Bi-weekly', avgSessions: 6.1, clientCount: 45, avgTenureMonths: 3.8 },
 *     { frequency: 'monthly', label: 'Monthly', avgSessions: 3.4, clientCount: 15, avgTenureMonths: 2.1 },
 *   ]}
 *   benchmarkRange="1.8-2.5x"
 * />
 */
export const FrequencyRetentionCard: React.FC<FrequencyRetentionCardProps> = ({
  frequencyData,
  benchmarkRange = '1.8-2.5x',
  className = '',
}) => {
  // Find the max for scaling bars
  const maxSessions = Math.max(...frequencyData.map((d) => d.avgSessions));

  // Calculate multiplier between weekly and bi-weekly
  const weeklyData = frequencyData.find((d) => d.frequency === 'weekly');
  const biweeklyData = frequencyData.find((d) => d.frequency === 'biweekly');
  const multiplier =
    weeklyData && biweeklyData && biweeklyData.avgSessions > 0
      ? weeklyData.avgSessions / biweeklyData.avgSessions
      : 0;

  const frequencyColors: Record<string, { bar: string; text: string; bg: string }> = {
    weekly: { bar: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
    biweekly: { bar: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' },
    monthly: { bar: 'bg-stone-400', text: 'text-stone-600', bg: 'bg-stone-100' },
  };

  return (
    <div
      className={`rounded-2xl xl:rounded-3xl p-6 sm:p-7 xl:p-8 relative overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
        boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-cyan-50">
            <Calendar size={20} className="text-cyan-600" />
          </div>
          <div>
            <h3
              className="text-stone-900 text-2xl sm:text-3xl xl:text-4xl font-bold tracking-tight"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              Frequency & Retention
            </h3>
            <p className="text-stone-500 text-base sm:text-lg xl:text-xl mt-2">
              How session frequency affects client tenure
            </p>
          </div>
        </div>
      </div>

      {/* Key insight callout */}
      <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-cyan-50 border border-emerald-100">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp size={16} className="text-emerald-600" />
          <span className="text-sm font-semibold text-emerald-700">Key Insight</span>
        </div>
        <p className="text-stone-700 text-sm">
          Weekly clients stay{' '}
          <span className="font-bold text-emerald-600">{multiplier.toFixed(1)}x longer</span> than
          bi-weekly clients
        </p>
        <p className="text-stone-500 text-xs mt-1">
          Similar practices see {benchmarkRange} difference
        </p>
      </div>

      {/* Frequency comparison bars */}
      <div className="space-y-4">
        {frequencyData.map((data) => {
          const colors = frequencyColors[data.frequency];
          const barWidth = (data.avgSessions / maxSessions) * 100;

          return (
            <div key={data.frequency} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-stone-700 font-medium text-sm">{data.label}</span>
                  <span className="text-stone-400 text-xs">({data.clientCount} clients)</span>
                </div>
                <div className={`px-2 py-0.5 rounded-md ${colors.bg}`}>
                  <span className={`text-sm font-semibold ${colors.text}`}>
                    {data.avgSessions.toFixed(1)} sessions
                  </span>
                </div>
              </div>

              {/* Bar */}
              <div className="h-3 rounded-full bg-stone-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${colors.bar} transition-all duration-500`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom insight */}
      <div className="mt-6 pt-4 border-t border-stone-100">
        <p className="text-stone-500 text-xs">
          Recommendation: Encourage new clients to start with weekly sessions for the first 2-3
          months to improve retention.
        </p>
      </div>
    </div>
  );
};

export default FrequencyRetentionCard;
