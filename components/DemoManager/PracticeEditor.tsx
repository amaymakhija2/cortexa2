// =============================================================================
// PRACTICE EDITOR
// =============================================================================
// Editor for practice identity (name, location, specialty).
// =============================================================================

import React from 'react';
import { useDemoContext } from '../../context/DemoContext';
import type { PracticeSpecialty, PracticeLocation } from '../../data/generators/types';

// =============================================================================
// SPECIALTY OPTIONS
// =============================================================================

const SPECIALTY_OPTIONS: { value: PracticeSpecialty; label: string }[] = [
  { value: 'general', label: 'General Outpatient' },
  { value: 'anxiety', label: 'Anxiety & Depression' },
  { value: 'couples', label: 'Couples & Family' },
  { value: 'child', label: 'Child & Adolescent' },
  { value: 'trauma', label: 'Trauma & PTSD' },
  { value: 'eating_disorders', label: 'Eating Disorders' },
  { value: 'addiction', label: 'Addiction & Substance Abuse' },
];

const REGION_OPTIONS: PracticeLocation['region'][] = [
  'Northeast',
  'Southeast',
  'Midwest',
  'Southwest',
  'West',
  'Pacific',
];

// =============================================================================
// INPUT COMPONENTS
// =============================================================================

interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const TextInput: React.FC<InputProps> = ({ label, value, onChange, placeholder }) => (
  <div>
    <label className="block text-xs font-medium text-stone-600 mb-1">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm
                 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent
                 placeholder:text-stone-400"
    />
  </div>
);

interface SelectProps<T extends string> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}

function SelectInput<T extends string>({ label, value, onChange, options }: SelectProps<T>) {
  return (
    <div>
      <label className="block text-xs font-medium text-stone-600 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm
                   focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent
                   bg-white appearance-none cursor-pointer"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: 'right 0.5rem center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '1.5em 1.5em',
          paddingRight: '2.5rem',
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// =============================================================================
// PRACTICE EDITOR COMPONENT
// =============================================================================

export const PracticeEditor: React.FC = () => {
  const { config, updatePractice } = useDemoContext();
  const { practice } = config;

  return (
    <div className="space-y-4">
      {/* Practice Name */}
      <TextInput
        label="Practice Name"
        value={practice.name}
        onChange={(name) => updatePractice({ name })}
        placeholder="Serenity Counseling"
      />

      {/* Short Name */}
      <TextInput
        label="Short Name"
        value={practice.shortName}
        onChange={(shortName) => updatePractice({ shortName })}
        placeholder="Serenity"
      />

      {/* Location */}
      <div className="grid grid-cols-2 gap-3">
        <TextInput
          label="City"
          value={practice.location.city}
          onChange={(city) => updatePractice({
            location: { ...practice.location, city }
          })}
          placeholder="Austin"
        />
        <TextInput
          label="State"
          value={practice.location.state}
          onChange={(state) => updatePractice({
            location: { ...practice.location, state }
          })}
          placeholder="TX"
        />
      </div>

      {/* Region */}
      <SelectInput
        label="Region"
        value={practice.location.region}
        onChange={(region) => updatePractice({
          location: { ...practice.location, region }
        })}
        options={REGION_OPTIONS.map(r => ({ value: r, label: r }))}
      />

      {/* Specialty */}
      <SelectInput
        label="Specialty"
        value={practice.specialty}
        onChange={(specialty) => updatePractice({ specialty })}
        options={SPECIALTY_OPTIONS}
      />

      {/* Year Established */}
      <div>
        <label className="block text-xs font-medium text-stone-600 mb-1">Year Established</label>
        <input
          type="number"
          value={practice.yearEstablished}
          onChange={(e) => updatePractice({ yearEstablished: parseInt(e.target.value) || 2020 })}
          min={1990}
          max={new Date().getFullYear()}
          className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent"
        />
      </div>
    </div>
  );
};

export default PracticeEditor;
