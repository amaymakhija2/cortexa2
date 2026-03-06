import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, Link2, Shield, X } from 'lucide-react';
import { AnimatedSection } from '../design-system';
import {
  Clinician,
  LicenseType,
  ClinicianRole,
  LICENSE_TYPE_NAMES,
  LICENSES_REQUIRING_SUPERVISION,
  canSupervise,
} from './shared';

const serifFont = "'Tiempos Headline', Georgia, serif";

// Grid template shared between header and rows — single source of truth
const TABLE_GRID = 'flex items-center justify-between';
const SELECT_CLASSES = `w-full px-2.5 py-2 rounded-lg bg-stone-50 text-stone-700 text-sm font-medium
  border border-stone-200/60 focus:outline-none focus:ring-2 focus:ring-amber-300/50 focus:border-amber-300
  cursor-pointer hover:bg-stone-100 hover:border-stone-300 transition-all appearance-none
  bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2378716c%22%20stroke-width%3D%222.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')]
  bg-[length:12px] bg-[right_8px_center] bg-no-repeat pr-7`;

// =============================================================================
// SUPERVISION CHIP
// =============================================================================

interface SupervisionChipProps {
  clinician: Clinician;
  availableSupervisors: Clinician[];
  onToggleSupervision: () => void;
  onAssignSupervisor: (supervisorId: string | null) => void;
  onOpenChange?: (open: boolean) => void;
}

const SupervisionChip: React.FC<SupervisionChipProps> = ({
  clinician,
  availableSupervisors,
  onToggleSupervision,
  onAssignSupervisor,
  onOpenChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openAbove, setOpenAbove] = useState(false);
  const toggle = (open: boolean) => {
    if (open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenAbove(spaceBelow < 370);
    }
    setIsOpen(open);
    onOpenChange?.(open);
  };
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) toggle(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const supervisor = availableSupervisors.find(s => s.id === clinician.supervisorId);
  const isAutoSupervision = LICENSES_REQUIRING_SUPERVISION.includes(clinician.licenseType);

  // Independent — no supervision
  if (!clinician.requiresSupervision) {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onToggleSupervision}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
          bg-stone-100 text-stone-400 hover:text-stone-500 border border-stone-200/60 transition-all cursor-pointer"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-stone-300" />
        Independent
      </motion.button>
    );
  }

  // Needs supervision — unassigned or assigned
  const isUnassigned = !clinician.supervisorId;

  return (
    <div ref={ref} className="relative">
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => toggle(!isOpen)}
        className={`
          inline-flex items-center gap-2 pl-2.5 pr-2 py-1.5 rounded-lg text-xs font-semibold
          border transition-all cursor-pointer max-w-full
          ${isUnassigned
            ? 'bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-300'
            : 'bg-violet-50 text-violet-700 border-violet-200 hover:border-violet-300'
          }
        `}
      >
        {isUnassigned ? (
          <>
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
            <span className="truncate">Assign supervisor</span>
          </>
        ) : (
          <>
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
              style={{ background: supervisor?.color || '#8b5cf6' }}
            >
              {supervisor?.initials || '?'}
            </div>
            <span className="truncate">{supervisor?.name || 'Unknown'}</span>
          </>
        )}
        <ChevronDown
          size={12}
          className={`flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} opacity-50`}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: openAbove ? 4 : -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: openAbove ? 4 : -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 left-0 w-[260px] bg-white rounded-xl border border-stone-200 overflow-hidden ${
              openAbove ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
            }`}
            style={{ boxShadow: '0 12px 40px -8px rgba(28,25,23,0.18), 0 4px 12px -4px rgba(28,25,23,0.08)' }}
          >
            {/* Section label */}
            <div className="px-3 pt-2 pb-1">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.06em]">Assign to</p>
            </div>

            {/* Supervisor options */}
            <div className="max-h-[220px] overflow-y-auto overscroll-contain">
              {availableSupervisors.length === 0 ? (
                <div className="px-3 py-5 text-center">
                  <p className="text-xs text-stone-500 font-medium">No supervisors available</p>
                  <p className="text-[11px] text-stone-400 mt-1.5 leading-relaxed">
                    Set a team member's role to<br />"Clinician and Supervisor" or "Supervisor Only"
                  </p>
                </div>
              ) : (
                availableSupervisors.map(s => {
                  const isSelected = s.id === clinician.supervisorId;
                  return (
                    <button
                      key={s.id}
                      onClick={() => { onAssignSupervisor(s.id); toggle(false); }}
                      className={`w-full text-left px-3 py-2.5 flex items-center gap-2.5 transition-colors ${
                        isSelected ? 'bg-violet-50' : 'hover:bg-stone-50'
                      }`}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                        style={{ background: s.color }}
                      >
                        {s.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] truncate leading-tight ${isSelected ? 'font-semibold text-violet-800' : 'font-medium text-stone-700'}`}>
                          {s.name}
                        </p>
                        <p className="text-[11px] text-stone-400 mt-0.5">{s.licenseType}</p>
                      </div>
                      {isSelected && <Check size={14} className="text-violet-500 flex-shrink-0" strokeWidth={2.5} />}
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer actions */}
            <div className="border-t border-stone-150 mt-1 pt-1 pb-0.5">
              {!isAutoSupervision && (
                <button
                  onClick={() => { onToggleSupervision(); toggle(false); }}
                  className="w-full text-left px-3 py-2.5 flex items-center gap-2.5 text-[13px] font-medium text-stone-500 hover:text-stone-700 hover:bg-stone-50 rounded-lg mx-0 transition-colors"
                >
                  <X size={13} className="text-stone-400" />
                  Mark as independent
                </button>
              )}
              {isAutoSupervision && clinician.supervisorId && (
                <button
                  onClick={() => { onAssignSupervisor(null); toggle(false); }}
                  className="w-full text-left px-3 py-2.5 flex items-center gap-2.5 text-[13px] font-medium text-stone-500 hover:text-stone-700 hover:bg-stone-50 rounded-lg mx-0 transition-colors"
                >
                  <X size={13} className="text-stone-400" />
                  Unassign supervisor
                </button>
              )}
              {isAutoSupervision && (
                <div className="px-3 py-2 flex items-center gap-2">
                  <Shield size={11} className="text-violet-400" />
                  <span className="text-[11px] text-violet-400 font-medium">Required by {clinician.licenseType} license</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface TeamMembersTabProps {
  clinicians: Clinician[];
  onUpdate: (clinicians: Clinician[]) => void;
  onOpenMapping?: () => void;
}

const ROLE_OPTIONS: ClinicianRole[] = [
  'Clinician Only',
  'Clinician and Supervisor',
  'Supervisor Only',
];

export const TeamMembersTab: React.FC<TeamMembersTabProps> = ({ clinicians, onUpdate, onOpenMapping }) => {
  const handleUpdateClinician = (id: string, updates: Partial<Clinician>) => {
    onUpdate(clinicians.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handleLicenseChange = (id: string, licenseType: LicenseType) => {
    const requiresSupervision = LICENSES_REQUIRING_SUPERVISION.includes(licenseType);
    handleUpdateClinician(id, {
      licenseType,
      licenseTitle: LICENSE_TYPE_NAMES[licenseType],
      requiresSupervision,
      ...(!requiresSupervision ? { supervisorId: null } : {}),
    });
  };

  const handleRoleChange = (id: string, role: ClinicianRole) => {
    handleUpdateClinician(id, { role });
  };

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const activeSupervisors = clinicians.filter(c => c.isActive && canSupervise(c.role));
  const needsSupervision = clinicians.filter(c => c.isActive && c.requiresSupervision);
  const unassignedCount = needsSupervision.filter(c => !c.supervisorId).length;

  return (
    <div>
      {/* Header */}
      <AnimatedSection delay={0}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-stone-800" style={{ fontFamily: serifFont }}>
              Team Members
            </h2>
            <p className="text-stone-400 text-sm mt-0.5">
              Configure credentials, roles, and supervision for each clinician
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Inline supervision status with progress ring */}
            {needsSupervision.length > 0 && (() => {
              const assignedCount = needsSupervision.length - unassignedCount;
              const total = needsSupervision.length;
              const progress = total > 0 ? assignedCount / total : 0;
              const isComplete = unassignedCount === 0;
              const radius = 8.5;
              const circumference = 2 * Math.PI * radius;
              const strokeDashoffset = circumference * (1 - progress);

              return (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-colors ${
                    isComplete
                      ? 'bg-emerald-50/80 border-emerald-200'
                      : 'bg-amber-50/80 border-amber-200'
                  }`}
                >
                  {/* Progress ring */}
                  <div className="relative w-6 h-6 flex items-center justify-center flex-shrink-0">
                    <svg width="22" height="22" viewBox="0 0 22 22" className="absolute -rotate-90">
                      <circle
                        cx="11" cy="11" r={radius}
                        fill="none"
                        stroke={isComplete ? '#d1fae5' : '#fde68a'}
                        strokeWidth="2"
                      />
                      <motion.circle
                        cx="11" cy="11" r={radius}
                        fill="none"
                        stroke={isComplete ? '#10b981' : '#f59e0b'}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      />
                    </svg>
                    {isComplete ? (
                      <Check size={10} className="text-emerald-600 relative z-10" strokeWidth={3} />
                    ) : (
                      <span className={`text-[9px] font-bold relative z-10 text-amber-700`}>
                        {assignedCount}
                      </span>
                    )}
                  </div>
                  <span className={`text-sm font-semibold ${
                    isComplete ? 'text-emerald-800' : 'text-amber-800'
                  }`}>
                    {isComplete ? 'All assigned' : `${unassignedCount} need${unassignedCount === 1 ? 's' : ''} supervisor`}
                  </span>
                  <span className={`text-xs font-medium ${
                    isComplete ? 'text-emerald-600/70' : 'text-amber-600/60'
                  }`}>
                    {assignedCount}/{total}
                  </span>
                </motion.div>
              );
            })()}
            {onOpenMapping && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenMapping}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
              >
                <Link2 size={16} />
                Manage EHR Mapping
              </motion.button>
            )}
          </div>
        </div>
      </AnimatedSection>

      {/* Table */}
      <div>
        {/* Column headers */}
        <AnimatedSection delay={0.05}>
          <div className={`${TABLE_GRID} px-5 py-3 border-b border-stone-200`}>
            <div className="w-[180px] text-[10px] font-bold text-stone-400 uppercase tracking-[0.08em]">Clinician</div>
            <div className="w-[100px] text-[10px] font-bold text-stone-400 uppercase tracking-[0.08em] text-center">License</div>
            <div className="w-[175px] text-[10px] font-bold text-stone-400 uppercase tracking-[0.08em] text-center">Role</div>
            <div className="w-[175px] text-[10px] font-bold text-stone-400 uppercase tracking-[0.08em] text-center">Needs Supervision</div>
            <div className="w-[80px] text-[10px] font-bold text-stone-400 uppercase tracking-[0.08em] text-center">Status</div>
          </div>
        </AnimatedSection>

        {/* Rows */}
        <div className="divide-y divide-stone-100/80">
          {clinicians.map((clinician, index) => {
            const isUnassigned = clinician.requiresSupervision && !clinician.supervisorId && clinician.isActive;
            const availableSupervisors = activeSupervisors.filter(s => s.id !== clinician.id);
            const isDropdownOpen = openDropdownId === clinician.id;

            return (
              <AnimatedSection
                key={clinician.id}
                delay={index * 0.03 + 0.1}
                className={isDropdownOpen ? 'relative z-40' : 'relative'}
              >
                <div
                  className={`${TABLE_GRID} px-5 py-3.5 transition-all duration-200 ${
                    !clinician.isActive ? 'opacity-35' : ''
                  } ${isUnassigned ? 'bg-amber-50/30' : 'hover:bg-stone-50/40'}`}
                >
                  {/* Clinician */}
                  <div className="w-[180px] flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${clinician.color}, ${clinician.color}cc)` }}
                    >
                      {clinician.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-stone-800 text-sm truncate leading-tight" style={{ fontFamily: serifFont }}>
                        {clinician.name}
                      </p>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        Since {new Date(clinician.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* License */}
                  <div className="w-[100px]">
                    <select
                      value={clinician.licenseType}
                      onChange={(e) => handleLicenseChange(clinician.id, e.target.value as LicenseType)}
                      className={SELECT_CLASSES}
                    >
                      {(Object.keys(LICENSE_TYPE_NAMES) as LicenseType[]).map(license => (
                        <option key={license} value={license}>{license}</option>
                      ))}
                    </select>
                  </div>

                  {/* Role */}
                  <div className="w-[175px]">
                    <select
                      value={clinician.role}
                      onChange={(e) => handleRoleChange(clinician.id, e.target.value as ClinicianRole)}
                      className={SELECT_CLASSES}
                    >
                      {ROLE_OPTIONS.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>

                  {/* Supervision */}
                  <div className="w-[175px] flex justify-center">
                    <SupervisionChip
                      clinician={clinician}
                      availableSupervisors={availableSupervisors}
                      onOpenChange={(open) => setOpenDropdownId(open ? clinician.id : null)}
                      onToggleSupervision={() => {
                        if (clinician.requiresSupervision) {
                          handleUpdateClinician(clinician.id, { requiresSupervision: false, supervisorId: null });
                        } else {
                          handleUpdateClinician(clinician.id, { requiresSupervision: true });
                        }
                      }}
                      onAssignSupervisor={(supervisorId) => {
                        handleUpdateClinician(clinician.id, { supervisorId });
                      }}
                    />
                  </div>

                  {/* Status */}
                  <div className="w-[80px] flex justify-center">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleUpdateClinician(clinician.id, { isActive: !clinician.isActive })}
                      className={`
                        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
                        border transition-all cursor-pointer select-none
                        ${clinician.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 hover:bg-emerald-100'
                          : 'bg-stone-50 text-stone-400 border-stone-200/60 hover:bg-stone-100'
                        }
                      `}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        clinician.isActive ? 'bg-emerald-500' : 'bg-stone-300'
                      }`} />
                      {clinician.isActive ? 'Active' : 'Inactive'}
                    </motion.button>
                  </div>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </div>
  );
};
