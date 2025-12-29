// =============================================================================
// PRESET SELECTOR
// =============================================================================
// Grid of preset cards for quick demo switching.
// =============================================================================

import React from 'react';
import { Check, Sparkles, TrendingUp, TrendingDown, Activity, User, RotateCcw } from 'lucide-react';
import { useDemoContext } from '../../context/DemoContext';

// =============================================================================
// PRESET ICONS & COLORS
// =============================================================================

const presetIcons: Record<string, React.ReactNode> = {
  default: <Activity size={20} />,
  thriving: <Sparkles size={20} />,
  growing: <TrendingUp size={20} />,
  struggling: <TrendingDown size={20} />,
  solo: <User size={20} />,
  turnaround: <RotateCcw size={20} />,
};

const presetColors: Record<string, { bg: string; border: string; icon: string }> = {
  default: {
    bg: 'bg-stone-50',
    border: 'border-stone-200 hover:border-stone-300',
    icon: 'text-stone-600',
  },
  thriving: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200 hover:border-emerald-300',
    icon: 'text-emerald-600',
  },
  growing: {
    bg: 'bg-blue-50',
    border: 'border-blue-200 hover:border-blue-300',
    icon: 'text-blue-600',
  },
  struggling: {
    bg: 'bg-red-50',
    border: 'border-red-200 hover:border-red-300',
    icon: 'text-red-600',
  },
  solo: {
    bg: 'bg-violet-50',
    border: 'border-violet-200 hover:border-violet-300',
    icon: 'text-violet-600',
  },
  turnaround: {
    bg: 'bg-amber-50',
    border: 'border-amber-200 hover:border-amber-300',
    icon: 'text-amber-600',
  },
};

// =============================================================================
// PRESET SELECTOR COMPONENT
// =============================================================================

export const PresetSelector: React.FC = () => {
  const { availablePresets, activePresetId, loadPreset, isLoading } = useDemoContext();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {availablePresets.map((preset) => {
        const isActive = preset.id === activePresetId;
        const colors = presetColors[preset.id] || presetColors.default;
        const icon = presetIcons[preset.id] || presetIcons.default;

        return (
          <button
            key={preset.id}
            onClick={() => loadPreset(preset.id)}
            disabled={isLoading || isActive}
            className={`
              relative p-4 rounded-xl border-2 text-left
              transition-all duration-200
              ${colors.bg} ${colors.border}
              ${isActive
                ? 'ring-2 ring-offset-2 ring-stone-400 border-stone-400'
                : 'hover:shadow-md'
              }
              disabled:opacity-60 disabled:cursor-not-allowed
            `}
          >
            {/* Active indicator */}
            {isActive && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-stone-800 flex items-center justify-center">
                <Check size={12} className="text-white" />
              </div>
            )}

            {/* Icon */}
            <div className={`mb-2 ${colors.icon}`}>
              {icon}
            </div>

            {/* Content */}
            <h3 className="font-semibold text-stone-800 text-sm">
              {preset.name}
            </h3>
            <p className="text-xs text-stone-500 mt-1 line-clamp-2">
              {preset.description}
            </p>
          </button>
        );
      })}
    </div>
  );
};

export default PresetSelector;
