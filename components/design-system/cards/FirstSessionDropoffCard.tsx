import React from 'react';
import { AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';

// =============================================================================
// FIRST SESSION DROPOFF CARD COMPONENT
// =============================================================================
// Highlights the critical Session 1 → Session 2 transition.
// This is often the steepest cliff in client retention.
// =============================================================================

export interface FirstSessionDropoffCardProps {
  /** Number of clients who had session 1 */
  session1Count: number;
  /** Number of clients who returned for session 2 */
  session2Count: number;
  /** Industry benchmark percentage (e.g., 82 for 82%) */
  benchmarkPercentage?: number;
  /** Additional className */
  className?: string;
}

/**
 * FirstSessionDropoffCard - Session 1→2 retention callout
 *
 * @example
 * <FirstSessionDropoffCard
 *   session1Count={100}
 *   session2Count={77}
 *   benchmarkPercentage={82}
 * />
 */
export const FirstSessionDropoffCard: React.FC<FirstSessionDropoffCardProps> = ({
  session1Count,
  session2Count,
  benchmarkPercentage = 82,
  className = '',
}) => {
  const returnRate = session1Count > 0 ? (session2Count / session1Count) * 100 : 0;
  const dropoffRate = 100 - returnRate;
  const dropoffCount = session1Count - session2Count;

  const isBelowBenchmark = returnRate < benchmarkPercentage;
  const benchmarkDiff = Math.abs(returnRate - benchmarkPercentage);
  const StatusIcon = isBelowBenchmark ? TrendingDown : TrendingUp;

  return (
    <div
      className={`rounded-2xl xl:rounded-3xl p-6 sm:p-7 relative overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
        boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3
            className="text-stone-900 text-2xl sm:text-3xl xl:text-4xl font-bold tracking-tight"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
          >
            First Session Drop-off
          </h3>
          <p className="text-stone-500 text-base sm:text-lg xl:text-xl mt-2">
            Clients who don&apos;t return after session 1
          </p>
        </div>

        {/* Alert indicator if below benchmark */}
        {isBelowBenchmark && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50">
            <AlertTriangle size={14} className="text-rose-500" />
            <span className="text-xs font-medium text-rose-600">Below avg</span>
          </div>
        )}
      </div>

      {/* Visual funnel representation */}
      <div className="space-y-3 mb-5">
        {/* Session 1 bar (full width) */}
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-11 rounded-lg bg-amber-100 relative overflow-hidden">
              <div
                className="absolute inset-0 bg-amber-500"
                style={{ width: '100%' }}
              />
              <div className="absolute inset-0 flex items-center px-4">
                <span className="text-white font-semibold text-sm">Session 1</span>
              </div>
            </div>
            <span className="text-stone-700 font-semibold text-sm w-20 text-right">
              {session1Count.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Arrow showing drop */}
        <div className="flex items-center gap-3 pl-4">
          <div className="flex items-center gap-2 text-stone-400">
            <div className="w-px h-4 bg-stone-300" />
            <span className="text-xs font-medium text-rose-500">
              −{dropoffCount} ({dropoffRate.toFixed(0)}% drop)
            </span>
          </div>
        </div>

        {/* Session 2 bar (proportional width) */}
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-11 rounded-lg bg-stone-100 relative overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-emerald-500 rounded-lg"
                style={{ width: `${returnRate}%` }}
              />
              <div className="absolute inset-0 flex items-center px-4">
                <span className="text-white font-semibold text-sm">Session 2</span>
              </div>
            </div>
            <span className="text-stone-700 font-semibold text-sm w-20 text-right">
              {session2Count.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Key metric and benchmark */}
      <div className="flex items-center justify-between pt-4 border-t border-stone-100">
        <div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold ${isBelowBenchmark ? 'text-rose-600' : 'text-emerald-600'}`}
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              {returnRate.toFixed(0)}%
            </span>
            <span className="text-stone-500 text-sm">return rate</span>
          </div>
        </div>

        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${isBelowBenchmark ? 'bg-rose-50' : 'bg-emerald-50'}`}>
          <StatusIcon size={14} className={isBelowBenchmark ? 'text-rose-500' : 'text-emerald-500'} />
          <span className={`text-xs font-medium ${isBelowBenchmark ? 'text-rose-600' : 'text-emerald-600'}`}>
            {isBelowBenchmark ? `${benchmarkDiff.toFixed(0)}% below` : `${benchmarkDiff.toFixed(0)}% above`} industry avg ({benchmarkPercentage}%)
          </span>
        </div>
      </div>
    </div>
  );
};

export default FirstSessionDropoffCard;
