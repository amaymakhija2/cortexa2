// =============================================================================
// PERFORMANCE EDITOR
// =============================================================================
// Editor for performance story (narrative, trend, metrics).
// =============================================================================

import React from 'react';
import { Sparkles, TrendingUp, TrendingDown, Activity, Zap, Sun, RefreshCw } from 'lucide-react';
import { useDemoContext } from '../../context/DemoContext';
import type { PerformanceNarrative, PerformanceTrend } from '../../data/generators/types';

// =============================================================================
// NARRATIVE OPTIONS
// =============================================================================

const NARRATIVE_OPTIONS: {
  value: PerformanceNarrative;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    value: 'thriving',
    label: 'Thriving',
    description: 'Everything going well, minor optimizations',
    icon: <Sparkles size={16} />,
    color: 'emerald',
  },
  {
    value: 'growth_phase',
    label: 'Growth Phase',
    description: 'Expanding, hiring, growing pains',
    icon: <TrendingUp size={16} />,
    color: 'blue',
  },
  {
    value: 'stable',
    label: 'Stable',
    description: 'Steady state, looking to optimize',
    icon: <Activity size={16} />,
    color: 'stone',
  },
  {
    value: 'struggling',
    label: 'Struggling',
    description: 'Challenges with retention or revenue',
    icon: <TrendingDown size={16} />,
    color: 'red',
  },
  {
    value: 'turnaround',
    label: 'Turnaround',
    description: 'Was struggling, now improving',
    icon: <RefreshCw size={16} />,
    color: 'amber',
  },
  {
    value: 'seasonal_dip',
    label: 'Seasonal Dip',
    description: 'In a temporary slow period',
    icon: <Sun size={16} />,
    color: 'orange',
  },
];

const TREND_OPTIONS: { value: PerformanceTrend; label: string }[] = [
  { value: 'improving', label: 'Improving' },
  { value: 'stable', label: 'Stable' },
  { value: 'declining', label: 'Declining' },
];

// =============================================================================
// SLIDER COMPONENT
// =============================================================================

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  format?: (value: number) => string;
  description?: string;
}

const Slider: React.FC<SliderProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  format = (v) => String(v),
  description,
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div>
          <label className="text-xs font-medium text-stone-600">{label}</label>
          {description && <span className="text-xs text-stone-400 ml-1">({description})</span>}
        </div>
        <span className="text-sm font-semibold text-stone-800">{format(value)}</span>
      </div>
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #1c1917 0%, #1c1917 ${percentage}%, #e7e5e4 ${percentage}%, #e7e5e4 100%)`,
        }}
      />
    </div>
  );
};

// =============================================================================
// PERFORMANCE EDITOR COMPONENT
// =============================================================================

export const PerformanceEditor: React.FC = () => {
  const { config, updatePerformance } = useDemoContext();
  const { performance } = config;

  const formatPercent = (value: number) => `${value}%`;
  const formatRate = (value: number) => `${(value * 100).toFixed(1)}%`;

  const narrativeColors: Record<string, { bg: string; border: string; active: string }> = {
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', active: 'bg-emerald-600' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', active: 'bg-blue-600' },
    stone: { bg: 'bg-stone-50', border: 'border-stone-200', active: 'bg-stone-600' },
    red: { bg: 'bg-red-50', border: 'border-red-200', active: 'bg-red-600' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', active: 'bg-amber-600' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', active: 'bg-orange-600' },
  };

  return (
    <div className="space-y-5">
      {/* Narrative Selector */}
      <div>
        <label className="block text-xs font-medium text-stone-600 mb-2">Performance Narrative</label>
        <div className="grid grid-cols-2 gap-2">
          {NARRATIVE_OPTIONS.map((opt) => {
            const isActive = performance.narrative === opt.value;
            const colors = narrativeColors[opt.color];
            return (
              <button
                key={opt.value}
                onClick={() => updatePerformance({ narrative: opt.value })}
                className={`px-3 py-2 rounded-lg text-left transition-all border ${
                  isActive
                    ? `${colors.active} text-white border-transparent`
                    : `${colors.bg} ${colors.border} text-stone-700 hover:opacity-80`
                }`}
              >
                <div className="flex items-center gap-2">
                  {opt.icon}
                  <span className="font-medium text-sm">{opt.label}</span>
                </div>
                <div className={`text-xs mt-0.5 ${isActive ? 'text-white/80' : 'text-stone-500'}`}>
                  {opt.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Trend Selector */}
      <div>
        <label className="block text-xs font-medium text-stone-600 mb-2">Performance Trend</label>
        <div className="flex gap-2">
          {TREND_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updatePerformance({ trend: opt.value })}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                performance.trend === opt.value
                  ? 'bg-stone-800 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Fine-Tuning */}
      <div className="pt-3 border-t border-stone-100">
        <label className="block text-xs font-medium text-stone-600 mb-3">Attendance & Engagement</label>
        <div className="space-y-4">
          <Slider
            label="Show Rate"
            value={performance.metrics.showRate}
            onChange={(showRate) => updatePerformance({
              metrics: { ...performance.metrics, showRate }
            })}
            min={70}
            max={98}
            format={formatPercent}
          />
          <Slider
            label="Rebook Rate"
            value={performance.metrics.rebookRate}
            onChange={(rebookRate) => updatePerformance({
              metrics: { ...performance.metrics, rebookRate }
            })}
            min={70}
            max={98}
            format={formatPercent}
          />
          <Slider
            label="Cancel Rate"
            value={performance.metrics.cancelRate}
            onChange={(cancelRate) => updatePerformance({
              metrics: { ...performance.metrics, cancelRate }
            })}
            min={5}
            max={25}
            format={formatPercent}
          />
        </div>
      </div>

      {/* Retention Metrics */}
      <div className="pt-3 border-t border-stone-100">
        <label className="block text-xs font-medium text-stone-600 mb-3">Retention</label>
        <div className="space-y-4">
          <Slider
            label="Monthly Churn Rate"
            value={performance.metrics.monthlyChurnRate * 100}
            onChange={(value) => updatePerformance({
              metrics: { ...performance.metrics, monthlyChurnRate: value / 100 }
            })}
            min={1}
            max={15}
            step={0.5}
            format={formatPercent}
          />
          <Slider
            label="Session 5 Retention"
            value={performance.metrics.sessionRetention.session5}
            onChange={(session5) => updatePerformance({
              metrics: {
                ...performance.metrics,
                sessionRetention: { ...performance.metrics.sessionRetention, session5 }
              }
            })}
            min={50}
            max={95}
            format={formatPercent}
          />
          <Slider
            label="Session 12 Retention"
            value={performance.metrics.sessionRetention.session12}
            onChange={(session12) => updatePerformance({
              metrics: {
                ...performance.metrics,
                sessionRetention: { ...performance.metrics.sessionRetention, session12 }
              }
            })}
            min={30}
            max={80}
            format={formatPercent}
          />
        </div>
      </div>

      {/* Consultations */}
      <div className="pt-3 border-t border-stone-100">
        <label className="block text-xs font-medium text-stone-600 mb-3">Consultations</label>
        <div className="space-y-4">
          <Slider
            label="Monthly Consultations"
            value={performance.metrics.monthlyConsultations}
            onChange={(monthlyConsultations) => updatePerformance({
              metrics: { ...performance.metrics, monthlyConsultations }
            })}
            min={5}
            max={50}
            format={(v) => String(Math.round(v))}
          />
          <Slider
            label="Conversion Rate"
            value={performance.metrics.consultConversionRate}
            onChange={(consultConversionRate) => updatePerformance({
              metrics: { ...performance.metrics, consultConversionRate }
            })}
            min={40}
            max={90}
            format={formatPercent}
          />
          <Slider
            label="Days to First Session"
            value={performance.metrics.daysToFirstSession}
            onChange={(daysToFirstSession) => updatePerformance({
              metrics: { ...performance.metrics, daysToFirstSession }
            })}
            min={3}
            max={21}
            format={(v) => `${Math.round(v)} days`}
          />
        </div>
      </div>

      {/* Admin Health */}
      <div className="pt-3 border-t border-stone-100">
        <label className="block text-xs font-medium text-stone-600 mb-3">Admin Health</label>
        <div className="space-y-4">
          <Slider
            label="Notes Completion Rate"
            value={performance.metrics.notesCompletionRate * 100}
            onChange={(value) => updatePerformance({
              metrics: { ...performance.metrics, notesCompletionRate: value / 100 }
            })}
            min={70}
            max={100}
            format={formatPercent}
          />
          <Slider
            label="Notes Overdue Rate"
            value={performance.metrics.notesOverdueRate * 100}
            onChange={(value) => updatePerformance({
              metrics: { ...performance.metrics, notesOverdueRate: value / 100 }
            })}
            min={0}
            max={20}
            step={0.5}
            format={formatPercent}
          />
        </div>
      </div>

      {/* Seasonality */}
      <div className="pt-3 border-t border-stone-100">
        <label className="block text-xs font-medium text-stone-600 mb-3">Seasonality Modifiers</label>
        <div className="grid grid-cols-2 gap-3">
          {(['q1', 'q2', 'q3', 'q4'] as const).map((quarter) => {
            const key = `${quarter}Modifier` as keyof typeof performance.seasonality;
            const labels = { q1: 'Q1 (Jan-Mar)', q2: 'Q2 (Apr-Jun)', q3: 'Q3 (Jul-Sep)', q4: 'Q4 (Oct-Dec)' };
            return (
              <div key={quarter}>
                <label className="block text-xs text-stone-500 mb-1">{labels[quarter]}</label>
                <input
                  type="number"
                  value={performance.seasonality[key]}
                  onChange={(e) => updatePerformance({
                    seasonality: {
                      ...performance.seasonality,
                      [key]: parseFloat(e.target.value) || 1.0
                    }
                  })}
                  step={0.05}
                  min={0.5}
                  max={1.5}
                  className="w-full px-2 py-1.5 border border-stone-200 rounded text-sm text-center
                             focus:outline-none focus:ring-1 focus:ring-stone-400"
                />
              </div>
            );
          })}
        </div>
        <p className="text-xs text-stone-400 mt-2">
          1.0 = normal, &lt;1.0 = slower, &gt;1.0 = busier
        </p>
      </div>
    </div>
  );
};

export default PerformanceEditor;
