import React from 'react';
import { TrendingUp, TrendingDown, Minus, Target, Trophy } from 'lucide-react';
import type { MetricDefinition } from './metricConfig';

// =============================================================================
// METRIC EXPLANATION COMPONENT - Premium Data Display
// =============================================================================

export interface MetricExplanationProps {
  metric: MetricDefinition;
  value: number;
  practiceAvg: number;
  topPerformer: number;
  isTeamAverage?: boolean;
  numerator?: number;
  denominator?: number;
}

export const MetricExplanation: React.FC<MetricExplanationProps> = ({
  metric,
  value,
  practiceAvg,
  topPerformer,
  isTeamAverage = false,
  numerator,
  denominator,
}) => {
  const diffFromAvg = value - practiceAvg;
  const diffPercent = practiceAvg !== 0 ? ((value - practiceAvg) / practiceAvg) * 100 : 0;
  const isGood = metric.higherIsBetter ? diffFromAvg >= 0 : diffFromAvg <= 0;
  const isNeutral = Math.abs(diffPercent) < 5;

  const formatCalculation = () => {
    let calc = metric.calculation;
    calc = calc.replace('${value}', metric.format(value));
    if (numerator !== undefined) {
      calc = calc.replace('${numerator}', numerator.toString());
    }
    if (denominator !== undefined) {
      calc = calc.replace('${denominator}', denominator.toString());
    }
    return calc;
  };

  return (
    <div className="px-8 py-6">
      {/* Hero Metric Value */}
      <div className="mb-6">
        <div className="flex items-end gap-4 mb-4">
          <span
            className="text-5xl font-black tracking-tight text-stone-900"
            style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
          >
            {metric.format(value)}
          </span>
          {!isTeamAverage && (
            <div className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold mb-1
              ${isNeutral
                ? 'bg-stone-100 text-stone-600'
                : isGood
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }
            `}>
              {isNeutral ? (
                <Minus size={14} />
              ) : isGood ? (
                <TrendingUp size={14} />
              ) : (
                <TrendingDown size={14} />
              )}
              <span>
                {diffFromAvg >= 0 ? '+' : ''}{metric.format(diffFromAvg)}
              </span>
            </div>
          )}
        </div>

        {/* Comparison Cards */}
        {!isTeamAverage && (
          <div className="grid grid-cols-2 gap-3">
            <div
              className="rounded-xl px-4 py-3"
              style={{
                background: 'linear-gradient(145deg, #fafaf9 0%, #f5f5f4 100%)',
                border: '1px solid rgba(0,0,0,0.04)',
              }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Target size={14} className="text-stone-400" />
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Practice Avg
                </span>
              </div>
              <span className="text-lg font-bold text-stone-700">
                {metric.format(practiceAvg)}
              </span>
            </div>

            <div
              className="rounded-xl px-4 py-3"
              style={{
                background: 'linear-gradient(145deg, #fffbeb 0%, #fef3c7 100%)',
                border: '1px solid rgba(245, 158, 11, 0.15)',
              }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Trophy size={14} className="text-amber-500" />
                <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                  Top Performer
                </span>
              </div>
              <span className="text-lg font-bold text-amber-800">
                {metric.format(topPerformer)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent mb-6" />

      {/* Definition & Calculation - Refined Cards */}
      <div className="space-y-4">
        {/* What This Means */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <h4
              className="text-xs font-bold text-stone-500 uppercase tracking-widest"
              style={{ letterSpacing: '0.1em' }}
            >
              What this means
            </h4>
          </div>
          <p className="text-sm text-stone-600 leading-relaxed pl-3.5">
            {metric.definition}
          </p>
        </div>

        {/* How It's Calculated */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-stone-400" />
            <h4
              className="text-xs font-bold text-stone-500 uppercase tracking-widest"
              style={{ letterSpacing: '0.1em' }}
            >
              Calculation
            </h4>
          </div>
          <div
            className="ml-3.5 px-4 py-3 rounded-xl text-sm"
            style={{
              background: 'linear-gradient(145deg, #292524 0%, #1c1917 100%)',
              color: '#a8a29e',
              fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
            }}
          >
            <code className="text-stone-300">{formatCalculation()}</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricExplanation;
