import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  X,
  ArrowLeft,
  ArrowRight,
  Wifi,
  User,
  Plus,
  Trash2,
} from 'lucide-react';
import { AnimatedSection } from './design-system';
import type { Clinician, RawEHRClinician, LicenseType } from './configure/shared';
import { LICENSE_TYPE_NAMES } from './configure/shared';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface ClinicianMappingProps {
  ehrClinicians: RawEHRClinician[];
  clinicians: Clinician[];
  onUpdateClinicians: (clinicians: Clinician[]) => void;
  onBack: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// CLINICIAN MAPPING COMPONENT
// Row-aligned layout: each clinician is a row with their linked SP accounts
// shown right beside them. Unassigned accounts float at the top.
//
// Color language (from design system):
//   stone     — all neutrals, backgrounds, borders, text
//   emerald   — positive status (all mapped, linked check)
//   rose      — warnings (unlinked count badge)
//   stone-800 — selected/active chip (dark pill pattern)
// ─────────────────────────────────────────────────────────────────────────────

export const ClinicianMapping: React.FC<ClinicianMappingProps> = ({
  ehrClinicians,
  clinicians,
  onUpdateClinicians,
  onBack,
}) => {
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLicense, setNewLicense] = useState<LicenseType>('Other');

  // Computed
  const assignedRecordIds = new Set(clinicians.flatMap(c => c.ehrClinicianIds));
  const unassignedRecords = ehrClinicians.filter(r => !assignedRecordIds.has(r.id));
  const allMapped = unassignedRecords.length === 0;
  const isAssignMode = selectedRecordId !== null;

  const activeClinicians = clinicians.filter(c => c.isActive);

  // Assign an EHR record to a clinician (removes from any other first)
  const handleAssignToClinician = (recordId: string, clinicianId: string) => {
    onUpdateClinicians(clinicians.map(c => ({
      ...c,
      ehrClinicianIds: c.id === clinicianId
        ? [...c.ehrClinicianIds.filter(id => id !== recordId), recordId]
        : c.ehrClinicianIds.filter(id => id !== recordId),
    })));
    setSelectedRecordId(null);
  };

  // Remove an EHR record from its clinician (moves to unassigned)
  const handleRemoveFromClinician = (recordId: string) => {
    onUpdateClinicians(clinicians.map(c => ({
      ...c,
      ehrClinicianIds: c.ehrClinicianIds.filter(id => id !== recordId),
    })));
  };

  // Add a new team member
  const handleAddClinician = () => {
    if (!newName.trim()) return;
    const name = newName.trim();
    const parts = name.split(' ');
    const initials = parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();
    // Pick a color from the palette that isn't already used
    const PALETTE = ['#a855f7', '#06b6d4', '#f59e0b', '#ec4899', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6'];
    const usedColors = new Set(clinicians.map(c => c.color));
    const color = PALETTE.find(c => !usedColors.has(c)) || PALETTE[Math.floor(Math.random() * PALETTE.length)];

    const newClinician: Clinician = {
      id: `new-${Date.now()}`,
      name,
      initials,
      color,
      role: 'Clinician Only',
      licenseType: newLicense,
      licenseTitle: LICENSE_TYPE_NAMES[newLicense],
      supervisorId: null,
      requiresSupervision: false,
      isActive: true,
      includeNotes: true,
      startDate: new Date().toISOString().split('T')[0],
      sessionGoal: 30,
      clientGoal: 25,
      takeRate: 50,
      ehrClinicianIds: [],
    };
    onUpdateClinicians([...clinicians, newClinician]);
    setNewName('');
    setNewLicense('Other');
    setShowAddForm(false);
  };

  // Remove a team member (their EHR accounts become unassigned)
  const handleRemoveClinician = (clinicianId: string) => {
    onUpdateClinicians(clinicians.filter(c => c.id !== clinicianId));
  };

  return (
    <div>
      {/* Unified Header */}
      <AnimatedSection delay={0}>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-700 transition-colors flex-shrink-0"
            >
              <ArrowLeft size={18} />
            </motion.button>
            <div>
              <h2
                className="text-2xl font-bold text-stone-800"
                style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
              >
                EHR Account Mapping
              </h2>
              <p className="text-stone-400 text-sm mt-0.5">
                Link SimplePractice accounts to your team members
              </p>
            </div>
          </div>
          {/* Inline status indicator */}
          {allMapped ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center">
                <Check size={14} className="text-white" strokeWidth={3} />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-800">All mapped</p>
                <p className="text-xs text-emerald-600">
                  {ehrClinicians.length} account{ehrClinicians.length !== 1 ? 's' : ''} linked
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-stone-100 border border-stone-200">
              <div className="w-7 h-7 rounded-full bg-stone-800 flex items-center justify-center">
                <span className="text-xs font-bold text-white">{unassignedRecords.length}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-700">
                  {unassignedRecords.length} unlinked
                </p>
                <p className="text-xs text-stone-400">
                  Select account, then click a row
                </p>
              </div>
            </div>
          )}
        </div>
      </AnimatedSection>

      {/* ═══════════════════════════════════════════════════════════════════════
          UNASSIGNED ACCOUNTS — floating shelf
      ═══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {unassignedRecords.length > 0 && (
          <AnimatedSection delay={0.04}>
            <motion.div
              layout
              className="mb-6 rounded-2xl border border-stone-200 bg-white overflow-hidden"
              style={{
                boxShadow: '0 2px 12px -2px rgba(0, 0, 0, 0.08)',
              }}
            >
              <div className="px-5 py-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <Wifi size={14} className="text-stone-400" />
                  <span className="text-sm font-semibold text-stone-600">
                    Unlinked EHR Accounts
                  </span>
                  <span className="text-xs text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full font-semibold">
                    {unassignedRecords.length}
                  </span>
                </div>
              </div>
              <div className="px-5 py-4 flex flex-wrap gap-2.5">
                {unassignedRecords.map((record) => {
                  const isSelected = selectedRecordId === record.id;
                  return (
                    <motion.button
                      key={record.id}
                      layout
                      onClick={() => setSelectedRecordId(isSelected ? null : record.id)}
                      className={`
                        flex items-center gap-2.5 pl-2.5 pr-4 py-2 rounded-xl text-left transition-all duration-200
                        ${isSelected
                          ? 'bg-stone-800 text-white shadow-lg'
                          : 'bg-stone-50 border border-stone-200 text-stone-700 hover:border-stone-300 hover:bg-stone-100'
                        }
                      `}
                      whileTap={{ scale: 0.97 }}
                    >
                      <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                        ${isSelected ? 'bg-stone-700' : 'bg-stone-200'}
                      `}>
                        <User size={14} className={isSelected ? 'text-stone-300' : 'text-stone-500'} />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-medium truncate ${isSelected ? 'text-white' : 'text-stone-800'}`}>
                          {record.rawName}
                        </p>
                        <p className={`text-xs truncate ${isSelected ? 'text-stone-400' : 'text-stone-500'}`}>
                          {record.rawRole}
                        </p>
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-1"
                        >
                          <ArrowRight size={14} className="text-stone-400" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatedSection>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════════════
          MAPPING TABLE — each row: clinician ←→ linked accounts
      ═══════════════════════════════════════════════════════════════════════ */}
      <AnimatedSection delay={0.06}>
        <div
          className="rounded-2xl border border-stone-200 bg-white overflow-hidden"
          style={{
            boxShadow: '0 2px 12px -2px rgba(0, 0, 0, 0.08)',
          }}
        >
          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-stone-200 items-center">
            <div className="col-span-4 text-xs font-bold text-stone-400 uppercase tracking-wide">
              Team Member
            </div>
            <div className="col-span-6 text-xs font-bold text-stone-400 uppercase tracking-wide">
              Linked EHR Accounts
            </div>
            <div className="col-span-2 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
              >
                <Plus size={14} />
                Add Member
              </motion.button>
            </div>
          </div>

          {/* Add member form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-b border-stone-200"
              >
                <div className="px-6 py-4 bg-stone-50 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-stone-200 flex items-center justify-center flex-shrink-0">
                    <User size={18} className="text-stone-400" />
                  </div>
                  <input
                    autoFocus
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newName.trim()) handleAddClinician();
                      if (e.key === 'Escape') { setShowAddForm(false); setNewName(''); setNewLicense('Other'); }
                    }}
                    placeholder="Full name (e.g., Jane Smith)"
                    className="flex-1 px-3 py-2.5 rounded-lg text-sm text-stone-800 bg-white border border-stone-200 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-stone-300"
                  />
                  <select
                    value={newLicense}
                    onChange={(e) => setNewLicense(e.target.value as LicenseType)}
                    className="px-3 py-2.5 rounded-lg text-sm font-medium text-stone-700 bg-white border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-stone-300 cursor-pointer"
                  >
                    {(Object.keys(LICENSE_TYPE_NAMES) as LicenseType[]).map(license => (
                      <option key={license} value={license}>{license}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddClinician}
                    disabled={!newName.trim()}
                    className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-stone-800 hover:bg-stone-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => { setShowAddForm(false); setNewName(''); setNewLicense('Other'); }}
                    className="p-2 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-200 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Rows */}
          <div className="divide-y divide-stone-100">
            {activeClinicians.map((clinician, index) => {
              const linkedRecords = ehrClinicians.filter(r => clinician.ehrClinicianIds.includes(r.id));
              const hasMultiple = linkedRecords.length > 1;

              return (
                <AnimatedSection key={clinician.id} delay={index * 0.03 + 0.08}>
                  <motion.div
                    onClick={() => {
                      if (isAssignMode && selectedRecordId) {
                        handleAssignToClinician(selectedRecordId, clinician.id);
                      }
                    }}
                    className={`
                      grid grid-cols-12 gap-4 px-6 py-4 items-center transition-all duration-200 group/row
                      ${isAssignMode
                        ? 'cursor-pointer hover:bg-stone-50'
                        : ''
                      }
                    `}
                  >
                    {/* Team member */}
                    <div className="col-span-4 flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${clinician.color} 0%, ${clinician.color}dd 100%)`,
                        }}
                      >
                        {clinician.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className="font-semibold text-stone-800 truncate"
                          style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                        >
                          {clinician.name}
                        </p>
                        <p className="text-xs text-stone-500">{clinician.licenseType}</p>
                      </div>
                      {/* Connector icon */}
                      <div className={`
                        w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200
                        ${isAssignMode
                          ? 'bg-stone-800 border border-stone-700'
                          : linkedRecords.length > 0
                            ? 'bg-emerald-50 border border-emerald-200'
                            : 'bg-stone-100 border border-stone-200'
                        }
                      `}>
                        {isAssignMode ? (
                          <span className="text-xs font-bold text-white">+</span>
                        ) : linkedRecords.length > 0 ? (
                          <Check size={10} className="text-emerald-600" strokeWidth={3} />
                        ) : (
                          <X size={10} className="text-stone-400" strokeWidth={2} />
                        )}
                      </div>
                    </div>

                    {/* Linked EHR accounts */}
                    <div className="col-span-6 flex items-center gap-2 flex-wrap min-h-[44px]">
                      {linkedRecords.length > 0 ? (
                        <>
                          {linkedRecords.map(record => (
                            <div
                              key={record.id}
                              className="flex items-center gap-2 pl-2.5 pr-2 py-1.5 rounded-lg bg-stone-50 border border-stone-200 group transition-all hover:border-stone-300"
                            >
                              <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 bg-stone-200">
                                <User size={12} className="text-stone-500" />
                              </div>
                              <span className="text-sm font-medium text-stone-700 truncate max-w-[180px]">
                                {record.rawName}
                              </span>
                              <span className="text-xs text-stone-400 flex-shrink-0">
                                {record.rawRole}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveFromClinician(record.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-rose-50 text-stone-300 hover:text-rose-500 transition-all flex-shrink-0"
                                title="Unlink this account"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                          {hasMultiple && (
                            <span className="text-xs font-medium text-stone-500 bg-stone-100 px-2 py-1 rounded-md">
                              {linkedRecords.length} accounts
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-sm text-stone-400 italic">
                          No accounts linked
                        </span>
                      )}
                    </div>

                    {/* Remove team member */}
                    <div className="col-span-2 flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveClinician(clinician.id);
                        }}
                        className="opacity-0 group-hover/row:opacity-100 p-2 rounded-lg hover:bg-rose-50 text-stone-300 hover:text-rose-500 transition-all flex-shrink-0"
                        title="Remove team member"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
};

export default ClinicianMapping;
