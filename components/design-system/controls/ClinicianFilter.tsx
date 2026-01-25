import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Users, X } from 'lucide-react';
import type { ClinicianData, ClinicianFilterOption } from '../utils/clinicianColors';

// =============================================================================
// CLINICIAN FILTER COMPONENT
// =============================================================================
// Dropdown for selecting how many clinicians to display in stacked charts.
// Supports preset options (Top 5, Top 7, etc.) and custom selection.
// =============================================================================

export interface ClinicianFilterProps {
  /** Current filter mode */
  value: ClinicianFilterOption;
  /** Callback when filter changes */
  onChange: (value: ClinicianFilterOption) => void;
  /** Custom selected clinicians (when value is 'custom') */
  customSelection?: string[];
  /** Callback when custom selection changes */
  onCustomSelectionChange?: (clinicians: string[]) => void;
  /** All available clinicians */
  clinicians: ClinicianData[];
  /** Maximum number of custom selections (default: 10) */
  maxCustomSelections?: number;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Additional className */
  className?: string;
}

const FILTER_OPTIONS: { value: ClinicianFilterOption; label: string; description: string }[] = [
  { value: 'top5', label: 'Top 5', description: 'Show top 5 performers' },
  { value: 'top7', label: 'Top 7', description: 'Show top 7 performers' },
  { value: 'top10', label: 'Top 10', description: 'Show top 10 performers' },
  { value: 'all', label: 'All', description: 'Show all clinicians' },
  { value: 'custom', label: 'Custom', description: 'Choose specific clinicians' },
];

export const ClinicianFilter: React.FC<ClinicianFilterProps> = ({
  value,
  onChange,
  customSelection = [],
  onCustomSelectionChange,
  clinicians,
  maxCustomSelections = 10,
  size = 'md',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsCustomMode(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentOption = FILTER_OPTIONS.find(opt => opt.value === value);
  const displayLabel = value === 'custom' && customSelection.length > 0
    ? `${customSelection.length} selected`
    : currentOption?.label || 'Top 5';

  const handleOptionSelect = (option: ClinicianFilterOption) => {
    if (option === 'custom') {
      setIsCustomMode(true);
    } else {
      onChange(option);
      setIsOpen(false);
      setIsCustomMode(false);
    }
  };

  const handleClinicianToggle = (clinicianKey: string) => {
    if (!onCustomSelectionChange) return;

    const isSelected = customSelection.includes(clinicianKey);
    if (isSelected) {
      onCustomSelectionChange(customSelection.filter(k => k !== clinicianKey));
    } else if (customSelection.length < maxCustomSelections) {
      onCustomSelectionChange([...customSelection, clinicianKey]);
    }
  };

  const handleApplyCustom = () => {
    if (customSelection.length > 0) {
      onChange('custom');
    }
    setIsOpen(false);
    setIsCustomMode(false);
  };

  // Size variants
  const sizeStyles = size === 'sm' ? {
    button: 'px-3 py-1.5 text-sm gap-1.5',
    dropdown: 'min-w-[200px]',
    icon: 14,
  } : {
    button: 'px-4 py-2 text-sm gap-2',
    dropdown: 'min-w-[240px]',
    icon: 16,
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center ${sizeStyles.button}
          bg-stone-50 hover:bg-stone-100
          border border-stone-200
          rounded-xl font-medium text-stone-700
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400
        `}
        style={{
          boxShadow: isOpen
            ? '0 2px 8px -2px rgba(0, 0, 0, 0.12), inset 0 1px 2px rgba(0, 0, 0, 0.04)'
            : 'inset 0 1px 2px rgba(0, 0, 0, 0.04)',
        }}
      >
        <Users size={sizeStyles.icon} className="text-stone-500" />
        <span>{displayLabel}</span>
        <ChevronDown
          size={sizeStyles.icon}
          className={`text-stone-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className={`
            absolute top-full right-0 mt-2 ${sizeStyles.dropdown}
            bg-white rounded-xl border border-stone-200
            shadow-lg z-50 overflow-hidden
          `}
          style={{
            animation: 'dropdownIn 0.2s ease-out',
          }}
        >
          {!isCustomMode ? (
            // Standard Options
            <div className="py-1">
              {FILTER_OPTIONS.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleOptionSelect(option.value)}
                  className={`
                    w-full flex items-center justify-between px-4 py-2.5
                    text-left transition-colors duration-150
                    ${value === option.value ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-stone-50 text-stone-700'}
                  `}
                >
                  <div>
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-stone-500">{option.description}</div>
                  </div>
                  {value === option.value && (
                    <Check size={16} className="text-indigo-600 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            // Custom Selection Mode
            <div>
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
                <div>
                  <div className="font-semibold text-sm text-stone-900">Select Clinicians</div>
                  <div className="text-xs text-stone-500">
                    {customSelection.length}/{maxCustomSelections} selected
                  </div>
                </div>
                <button
                  onClick={() => setIsCustomMode(false)}
                  className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  <X size={14} className="text-stone-400" />
                </button>
              </div>

              {/* Clinician List */}
              <div className="max-h-[280px] overflow-y-auto py-1">
                {clinicians.map(clinician => {
                  const isSelected = customSelection.includes(clinician.key);
                  const isDisabled = !isSelected && customSelection.length >= maxCustomSelections;

                  return (
                    <button
                      key={clinician.key}
                      onClick={() => handleClinicianToggle(clinician.key)}
                      disabled={isDisabled}
                      className={`
                        w-full flex items-center gap-3 px-4 py-2.5
                        text-left transition-colors duration-150
                        ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-stone-50'}
                        ${isSelected ? 'bg-indigo-50' : ''}
                      `}
                    >
                      {/* Checkbox */}
                      <div
                        className={`
                          w-4 h-4 rounded border-2 flex items-center justify-center
                          transition-all duration-150
                          ${isSelected
                            ? 'bg-indigo-600 border-indigo-600'
                            : 'border-stone-300'
                          }
                        `}
                      >
                        {isSelected && <Check size={10} className="text-white" strokeWidth={3} />}
                      </div>

                      {/* Clinician Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-stone-900 truncate">
                          {clinician.label}
                        </div>
                      </div>

                      {/* Value */}
                      <div className="text-sm font-semibold text-stone-600 tabular-nums">
                        {clinician.totalValue.toLocaleString()}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Apply Button */}
              <div className="px-4 py-3 border-t border-stone-100 bg-stone-50">
                <button
                  onClick={handleApplyCustom}
                  disabled={customSelection.length === 0}
                  className={`
                    w-full py-2 rounded-lg font-semibold text-sm
                    transition-all duration-200
                    ${customSelection.length > 0
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]'
                      : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    }
                  `}
                >
                  Apply Selection
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Animation Keyframes */}
      <style>{`
        @keyframes dropdownIn {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default ClinicianFilter;
