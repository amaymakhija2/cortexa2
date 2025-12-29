// =============================================================================
// FINANCIAL EDITOR
// =============================================================================
// Editor for financial settings (practice size, revenue, rates).
// =============================================================================

import React from 'react';
import { useDemoContext } from '../../context/DemoContext';
import type { PracticeSize } from '../../data/generators/types';

// =============================================================================
// PRACTICE SIZE PRESETS
// =============================================================================

const PRACTICE_SIZE_OPTIONS: { value: PracticeSize; label: string; description: string }[] = [
  { value: 'solo', label: 'Solo', description: '1 clinician, $8-15K/mo' },
  { value: 'small', label: 'Small', description: '2-3 clinicians, $25-50K/mo' },
  { value: 'medium', label: 'Medium', description: '4-7 clinicians, $80-150K/mo' },
  { value: 'large', label: 'Large', description: '8+ clinicians, $200K+/mo' },
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
}

const Slider: React.FC<SliderProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  format = (v) => String(v),
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-medium text-stone-600">{label}</label>
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
      <div className="flex justify-between text-xs text-stone-400 mt-1">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
};

// =============================================================================
// FINANCIAL EDITOR COMPONENT
// =============================================================================

export const FinancialEditor: React.FC = () => {
  const { config, updateFinancial } = useDemoContext();
  const { financial } = config;

  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  const formatPercent = (value: number) => `${value}%`;

  return (
    <div className="space-y-5">
      {/* Practice Size Selector */}
      <div>
        <label className="block text-xs font-medium text-stone-600 mb-2">Practice Size</label>
        <div className="grid grid-cols-2 gap-2">
          {PRACTICE_SIZE_OPTIONS.map((size) => (
            <button
              key={size.value}
              onClick={() => updateFinancial({ practiceSize: size.value })}
              className={`px-3 py-2 rounded-lg text-left transition-all ${
                financial.practiceSize === size.value
                  ? 'bg-stone-800 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <div className="font-medium text-sm">{size.label}</div>
              <div className={`text-xs ${financial.practiceSize === size.value ? 'text-stone-300' : 'text-stone-500'}`}>
                {size.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Revenue Range */}
      <div className="space-y-3">
        <Slider
          label="Monthly Revenue (Min)"
          value={financial.monthlyRevenueRange.min}
          onChange={(min) => updateFinancial({
            monthlyRevenueRange: { ...financial.monthlyRevenueRange, min }
          })}
          min={5000}
          max={financial.monthlyRevenueRange.max - 10000}
          step={5000}
          format={formatCurrency}
        />
        <Slider
          label="Monthly Revenue (Max)"
          value={financial.monthlyRevenueRange.max}
          onChange={(max) => updateFinancial({
            monthlyRevenueRange: { ...financial.monthlyRevenueRange, max }
          })}
          min={financial.monthlyRevenueRange.min + 10000}
          max={500000}
          step={5000}
          format={formatCurrency}
        />
      </div>

      {/* Session Rate */}
      <Slider
        label="Average Session Rate"
        value={financial.averageSessionRate}
        onChange={(averageSessionRate) => updateFinancial({ averageSessionRate })}
        min={100}
        max={300}
        step={10}
        format={formatCurrency}
      />

      {/* Goals */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Revenue Goal</label>
          <input
            type="number"
            value={financial.revenueGoal}
            onChange={(e) => updateFinancial({ revenueGoal: parseInt(e.target.value) || 0 })}
            step={5000}
            className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Session Goal</label>
          <input
            type="number"
            value={financial.sessionGoal}
            onChange={(e) => updateFinancial({ sessionGoal: parseInt(e.target.value) || 0 })}
            step={50}
            className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent"
          />
        </div>
      </div>

      {/* Payer Mix */}
      <div className="pt-3 border-t border-stone-100">
        <label className="block text-xs font-medium text-stone-600 mb-3">Payer Mix</label>
        <div className="space-y-3">
          <Slider
            label="Self Pay"
            value={financial.payerMix.selfPay}
            onChange={(selfPay) => {
              const remaining = 100 - selfPay;
              const ratio = financial.payerMix.insurance / (financial.payerMix.insurance + financial.payerMix.slidingScale || 1);
              updateFinancial({
                payerMix: {
                  selfPay,
                  insurance: Math.round(remaining * ratio),
                  slidingScale: Math.round(remaining * (1 - ratio)),
                }
              });
            }}
            min={0}
            max={100}
            format={formatPercent}
          />
          <Slider
            label="Insurance"
            value={financial.payerMix.insurance}
            onChange={(insurance) => {
              const remaining = 100 - insurance;
              const ratio = financial.payerMix.selfPay / (financial.payerMix.selfPay + financial.payerMix.slidingScale || 1);
              updateFinancial({
                payerMix: {
                  selfPay: Math.round(remaining * ratio),
                  insurance,
                  slidingScale: Math.round(remaining * (1 - ratio)),
                }
              });
            }}
            min={0}
            max={100}
            format={formatPercent}
          />
          <Slider
            label="Sliding Scale"
            value={financial.payerMix.slidingScale}
            onChange={(slidingScale) => {
              const remaining = 100 - slidingScale;
              const ratio = financial.payerMix.selfPay / (financial.payerMix.selfPay + financial.payerMix.insurance || 1);
              updateFinancial({
                payerMix: {
                  selfPay: Math.round(remaining * ratio),
                  insurance: Math.round(remaining * (1 - ratio)),
                  slidingScale,
                }
              });
            }}
            min={0}
            max={100}
            format={formatPercent}
          />
        </div>
      </div>

      {/* Cost Rates */}
      <div className="pt-3 border-t border-stone-100">
        <label className="block text-xs font-medium text-stone-600 mb-3">Cost Rates</label>
        <div className="space-y-3">
          <Slider
            label="Clinician Take Rate"
            value={financial.clinicianTakeRate}
            onChange={(clinicianTakeRate) => updateFinancial({ clinicianTakeRate })}
            min={50}
            max={85}
            format={formatPercent}
          />
          <Slider
            label="Supervisor Cost Rate"
            value={financial.supervisorCostRate}
            onChange={(supervisorCostRate) => updateFinancial({ supervisorCostRate })}
            min={0}
            max={20}
            format={formatPercent}
          />
          <Slider
            label="Credit Card Fee Rate"
            value={financial.creditCardFeeRate}
            onChange={(creditCardFeeRate) => updateFinancial({ creditCardFeeRate })}
            min={0}
            max={5}
            step={0.1}
            format={(v) => `${v.toFixed(1)}%`}
          />
        </div>
      </div>
    </div>
  );
};

export default FinancialEditor;
