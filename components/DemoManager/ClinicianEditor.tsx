// =============================================================================
// CLINICIAN EDITOR
// =============================================================================
// Editor for clinician list (names, credentials, performance profiles).
// =============================================================================

import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight, User } from 'lucide-react';
import { useDemoContext } from '../../context/DemoContext';
import type { ClinicianConfig, CredentialType, ClinicianRole, ClinicianPerformanceProfile } from '../../data/generators/types';

// =============================================================================
// OPTIONS
// =============================================================================

const CREDENTIAL_OPTIONS: { value: CredentialType; label: string }[] = [
  { value: 'PhD', label: 'PhD' },
  { value: 'PsyD', label: 'PsyD' },
  { value: 'LCSW', label: 'LCSW' },
  { value: 'LMHC', label: 'LMHC' },
  { value: 'LPC', label: 'LPC' },
  { value: 'LMFT', label: 'LMFT' },
  { value: 'APC', label: 'APC (Associate)' },
  { value: 'LAC', label: 'LAC (Associate)' },
];

const ROLE_OPTIONS: { value: ClinicianRole; label: string }[] = [
  { value: 'owner', label: 'Owner' },
  { value: 'senior', label: 'Senior Clinician' },
  { value: 'staff', label: 'Staff Clinician' },
  { value: 'associate', label: 'Associate' },
];

const PERFORMANCE_LEVELS = ['high', 'medium', 'low'] as const;
const RETENTION_LEVELS = ['strong', 'average', 'weak'] as const;
const COMPLIANCE_LEVELS = ['excellent', 'good', 'needs_work'] as const;

// =============================================================================
// CLINICIAN CARD
// =============================================================================

interface ClinicianCardProps {
  clinician: ClinicianConfig;
  isExpanded: boolean;
  onToggle: () => void;
  onChange: (updates: Partial<ClinicianConfig>) => void;
  onRemove: () => void;
  canRemove: boolean;
}

const ClinicianCard: React.FC<ClinicianCardProps> = ({
  clinician,
  isExpanded,
  onToggle,
  onChange,
  onRemove,
  canRemove,
}) => {
  return (
    <div className="border border-stone-200 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 bg-stone-50 hover:bg-stone-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: clinician.color }}
          >
            {clinician.firstName[0]}
          </div>
          <span className="font-medium text-stone-800 text-sm">
            {clinician.firstName} {clinician.lastName}
          </span>
          <span className="text-xs text-stone-500">
            {clinician.credential}
          </span>
        </div>
        <span className="text-stone-400">
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="p-3 space-y-3 bg-white">
          {/* Name fields */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">First Name</label>
              <input
                type="text"
                value={clinician.firstName}
                onChange={(e) => onChange({ firstName: e.target.value })}
                className="w-full px-2 py-1.5 border border-stone-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-stone-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Last Name</label>
              <input
                type="text"
                value={clinician.lastName}
                onChange={(e) => onChange({ lastName: e.target.value })}
                className="w-full px-2 py-1.5 border border-stone-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-stone-400"
              />
            </div>
          </div>

          {/* Credential and Role */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Credential</label>
              <select
                value={clinician.credential}
                onChange={(e) => onChange({ credential: e.target.value as CredentialType })}
                className="w-full px-2 py-1.5 border border-stone-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-stone-400 bg-white"
              >
                {CREDENTIAL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Role</label>
              <select
                value={clinician.role}
                onChange={(e) => onChange({ role: e.target.value as ClinicianRole })}
                className="w-full px-2 py-1.5 border border-stone-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-stone-400 bg-white"
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Color</label>
            <input
              type="color"
              value={clinician.color}
              onChange={(e) => onChange({ color: e.target.value })}
              className="w-full h-8 rounded cursor-pointer"
            />
          </div>

          {/* Caseload */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Target Clients</label>
              <input
                type="number"
                value={clinician.caseload.targetClients}
                onChange={(e) => onChange({
                  caseload: { ...clinician.caseload, targetClients: parseInt(e.target.value) || 30 }
                })}
                min={10}
                max={60}
                className="w-full px-2 py-1.5 border border-stone-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-stone-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Session Goal</label>
              <input
                type="number"
                value={clinician.caseload.sessionGoal}
                onChange={(e) => onChange({
                  caseload: { ...clinician.caseload, sessionGoal: parseInt(e.target.value) || 120 }
                })}
                min={60}
                max={200}
                className="w-full px-2 py-1.5 border border-stone-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-stone-400"
              />
            </div>
          </div>

          {/* Performance Profile */}
          <div className="pt-2 border-t border-stone-100">
            <label className="block text-xs font-medium text-stone-600 mb-2">Performance Profile</label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500">Revenue</span>
                <div className="flex gap-1">
                  {PERFORMANCE_LEVELS.map((level) => (
                    <button
                      key={level}
                      onClick={() => onChange({
                        performanceProfile: { ...clinician.performanceProfile, revenueLevel: level }
                      })}
                      className={`px-2 py-0.5 text-xs rounded ${
                        clinician.performanceProfile.revenueLevel === level
                          ? 'bg-stone-800 text-white'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500">Retention</span>
                <div className="flex gap-1">
                  {RETENTION_LEVELS.map((level) => (
                    <button
                      key={level}
                      onClick={() => onChange({
                        performanceProfile: { ...clinician.performanceProfile, retentionStrength: level }
                      })}
                      className={`px-2 py-0.5 text-xs rounded ${
                        clinician.performanceProfile.retentionStrength === level
                          ? 'bg-stone-800 text-white'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500">Notes</span>
                <div className="flex gap-1">
                  {COMPLIANCE_LEVELS.map((level) => (
                    <button
                      key={level}
                      onClick={() => onChange({
                        performanceProfile: { ...clinician.performanceProfile, notesCompliance: level }
                      })}
                      className={`px-2 py-0.5 text-xs rounded ${
                        clinician.performanceProfile.notesCompliance === level
                          ? 'bg-stone-800 text-white'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {level === 'needs_work' ? 'needs work' : level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Remove button */}
          {canRemove && (
            <button
              onClick={onRemove}
              className="w-full mt-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors flex items-center justify-center gap-1"
            >
              <Trash2 size={14} />
              Remove Clinician
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// =============================================================================
// CLINICIAN EDITOR COMPONENT
// =============================================================================

export const ClinicianEditor: React.FC = () => {
  const { config, updateClinicians } = useDemoContext();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleChange = (clinicianId: string, updates: Partial<ClinicianConfig>) => {
    const updated = config.clinicians.map((c) =>
      c.id === clinicianId ? { ...c, ...updates } : c
    );
    updateClinicians(updated);
  };

  const handleRemove = (clinicianId: string) => {
    const updated = config.clinicians.filter((c) => c.id !== clinicianId);
    updateClinicians(updated);
  };

  const handleAdd = () => {
    const newId = `clinician_${Date.now()}`;
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#84cc16', '#06b6d4'];
    const newClinician: ClinicianConfig = {
      id: newId,
      firstName: 'New',
      lastName: 'Clinician',
      credential: 'LCSW',
      title: 'Clinician',
      role: 'staff',
      color: colors[config.clinicians.length % colors.length],
      performanceProfile: {
        revenueLevel: 'medium',
        retentionStrength: 'average',
        consultationConversion: 'medium',
        notesCompliance: 'good',
      },
      caseload: {
        targetClients: 30,
        currentClients: 25,
        sessionGoal: 120,
        takeRate: 70,
      },
      startDate: new Date().toISOString().split('T')[0],
      isActive: true,
      location: 'Main Office',
    };
    updateClinicians([...config.clinicians, newClinician]);
    setExpandedId(newId);
  };

  return (
    <div className="space-y-3">
      {config.clinicians.map((clinician) => (
        <ClinicianCard
          key={clinician.id}
          clinician={clinician}
          isExpanded={expandedId === clinician.id}
          onToggle={() => setExpandedId(expandedId === clinician.id ? null : clinician.id)}
          onChange={(updates) => handleChange(clinician.id, updates)}
          onRemove={() => handleRemove(clinician.id)}
          canRemove={config.clinicians.length > 1}
        />
      ))}

      {/* Add button */}
      <button
        onClick={handleAdd}
        className="w-full px-3 py-2 border-2 border-dashed border-stone-200 rounded-lg
                   text-sm text-stone-500 hover:text-stone-700 hover:border-stone-300
                   transition-colors flex items-center justify-center gap-2"
      >
        <Plus size={16} />
        Add Clinician
      </button>
    </div>
  );
};

export default ClinicianEditor;
