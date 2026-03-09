import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import {
  FONT,
  INK,
  SHADOW,
  EASE,
  InlineInput,
  InlineSelect,
  TogglePill,
  estimateAnnualRevenue,
  formatRevenue,
} from './shared';
import type { Clinician, LicenseType, ClinicianRole } from './shared';
import {
  LICENSE_TYPE_NAMES,
  ROLE_OPTIONS,
  canSupervise,
  LICENSES_REQUIRING_SUPERVISION,
} from './shared';

// =============================================================================
// THE ROSTER LEDGER
// =============================================================================
// A table that feels like a hand-written ledger. Each row is a page.
// Edits feel like writing with a fountain pen. The accent bar on each row
// is like a bookmark ribbon - identifying, colorful, personal.
// =============================================================================

// =============================================================================
// TYPES
// =============================================================================

export interface EditableRosterTableProps {
  clinicians: Clinician[];
  onUpdate: (clinicians: Clinician[]) => void;
  onOpenGoalEditor?: (clinicianId: string, metric: 'sessions' | 'clients') => void;
}

// =============================================================================
// COLUMN STRUCTURE
// =============================================================================

interface ColumnDef {
  key: string;
  label: string;
  width: string;
  align: 'left' | 'center' | 'right';
}

const COLUMNS: ColumnDef[] = [
  { key: 'rank', label: '#', width: '44px', align: 'center' },
  { key: 'clinician', label: 'Clinician', width: '1fr', align: 'left' },
  { key: 'license', label: 'License', width: '110px', align: 'center' },
  { key: 'role', label: 'Role', width: '180px', align: 'center' },
  { key: 'supervision', label: 'Supervision', width: '160px', align: 'center' },
  { key: 'sessions', label: 'Sessions Goal', width: '120px', align: 'center' },
  { key: 'clients', label: 'Caseload Goal', width: '120px', align: 'center' },
  { key: 'status', label: 'Status', width: '90px', align: 'center' },
];

const gridTemplate = COLUMNS.map(c => c.width).join(' ');

// =============================================================================
// HEADER ROW
// =============================================================================

const HeaderRow: React.FC = () => (
  <div
    className="grid items-end pb-4"
    style={{
      gridTemplateColumns: gridTemplate,
      borderBottom: `2px solid ${INK.dark}`,
    }}
  >
    {COLUMNS.map((col) => (
      <div
        key={col.key}
        className={col.key === 'clinician' ? 'pl-3' : ''}
        style={{
          fontFamily: FONT.sans,
          fontSize: 10,
          fontWeight: 700,
          color: INK.faded,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          textAlign: col.align,
        }}
      >
        {col.label}
      </div>
    ))}
  </div>
);

// =============================================================================
// CLINICIAN ROW
// =============================================================================

interface ClinicianRowProps {
  clinician: Clinician;
  rank: number;
  index: number;
  supervisors: Clinician[];
  onUpdate: (updates: Partial<Clinician>) => void;
  onOpenGoalEditor?: (metric: 'sessions' | 'clients') => void;
}

const ClinicianRow: React.FC<ClinicianRowProps> = ({
  clinician,
  rank,
  index,
  supervisors,
  onUpdate,
  onOpenGoalEditor,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [recentlySaved, setRecentlySaved] = useState(false);

  // Format start date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `Since ${date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
  };

  // Handle save with visual feedback
  const handleSave = () => {
    setRecentlySaved(true);
    setTimeout(() => setRecentlySaved(false), 800);
  };

  // License options
  const licenseOptions = Object.entries(LICENSE_TYPE_NAMES).map(([value]) => ({
    value: value as LicenseType,
    label: value,
  }));

  // Role options
  const roleOptions = ROLE_OPTIONS.map((role) => ({
    value: role,
    label: role.replace(' and ', ' & '),
  }));

  // Supervision options
  const needsSupervision = LICENSES_REQUIRING_SUPERVISION.includes(clinician.licenseType);
  const hasNoSupervisor = needsSupervision && !clinician.supervisorId;

  const supervisionOptions = [
    {
      value: '',
      label: needsSupervision ? (hasNoSupervisor ? 'Assign...' : 'Clear') : 'Independent',
    },
    ...supervisors
      .filter((s) => s.id !== clinician.id)
      .map((s) => ({ value: s.id, label: s.name.split(' ')[0] })), // First name only
  ];

  // Determine chip color for supervision
  const supervisionChipColor = hasNoSupervisor ? 'amber' : needsSupervision ? 'emerald' : 'stone';

  // Row animation variants
  const rowVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
      opacity: clinician.isActive ? 1 : 0.4,
      y: 0,
      transition: {
        delay: i * 0.03,
        duration: 0.4,
        ease: EASE.out,
      },
    }),
  };

  return (
    <>
      <motion.div
        className="grid items-center relative"
        style={{
          gridTemplateColumns: gridTemplate,
          borderBottom: `1px solid ${INK.rule}`,
          minHeight: 64,
          backgroundColor: isHovered ? INK.cream : 'transparent',
          transition: 'background-color 0.15s ease',
        }}
        custom={index}
        initial="hidden"
        animate="visible"
        variants={rowVariants}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Save confirmation glow */}
        <AnimatePresence>
          {recentlySaved && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                background: `linear-gradient(90deg, ${INK.emeraldLight} 0%, transparent 30%)`,
                borderRadius: 4,
              }}
            />
          )}
        </AnimatePresence>

        {/* Rank */}
        <div
          className="flex items-center justify-center"
          style={{
            fontFamily: FONT.serif,
            fontSize: 18,
            fontWeight: 400,
            color: rank === 1 ? INK.gold : INK.faded,
          }}
        >
          {rank}
        </div>

        {/* Clinician Name */}
        <div className="min-w-0 pl-3">
          <motion.div
            className="truncate"
            style={{
              fontFamily: FONT.serif,
              fontSize: 17,
              color: INK.black,
              lineHeight: 1.3,
            }}
          >
            {clinician.name}
          </motion.div>
          <div
            className="truncate mt-0.5"
            style={{
              fontFamily: FONT.sans,
              fontSize: 11,
              color: INK.ghost,
              letterSpacing: '0.02em',
            }}
          >
            {formatDate(clinician.startDate)}
          </div>
        </div>

        {/* License */}
        <div className="flex justify-center" >
          <InlineSelect
            value={clinician.licenseType}
            options={licenseOptions}
            onChange={(value) => {
              const newRequiresSupervision = LICENSES_REQUIRING_SUPERVISION.includes(value);
              onUpdate({
                licenseType: value,
                requiresSupervision: newRequiresSupervision,
                supervisorId: newRequiresSupervision ? clinician.supervisorId : null,
              });
              handleSave();
            }}
            width={85}
          />
        </div>

        {/* Role */}
        <div className="flex justify-center" >
          <InlineSelect
            value={clinician.role}
            options={roleOptions}
            onChange={(value) => {
              onUpdate({ role: value });
              handleSave();
            }}
            width={155}
          />
        </div>

        {/* Supervision */}
        <div className="flex justify-center items-center gap-1" >
          {hasNoSupervisor && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <AlertCircle size={14} color={INK.amber} />
            </motion.div>
          )}
          <InlineSelect
            value={clinician.supervisorId || ''}
            options={supervisionOptions}
            onChange={(value) => {
              onUpdate({ supervisorId: value || null });
              handleSave();
            }}
            width={hasNoSupervisor ? 110 : 140}
            variant="chip"
            chipColor={supervisionChipColor}
          />
        </div>

        {/* Sessions Goal - Clickable to open editor */}
        <div
          className="flex justify-center"
          onClick={() => onOpenGoalEditor?.('sessions')}
        >
          <motion.button
            className="flex flex-col items-center px-3 py-1 rounded-lg transition-colors"
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
            whileHover={{ backgroundColor: INK.goldGlow }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Primary: Sessions per week */}
            <div className="flex items-center gap-1">
              <span
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 15,
                  fontWeight: 500,
                  color: INK.black,
                }}
              >
                {clinician.sessionGoal}
              </span>
              <span
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 11,
                  color: INK.ghost,
                }}
              >
                /wk
              </span>
            </div>
            {/* Secondary: Estimated annual revenue */}
            <span
              style={{
                fontFamily: FONT.mono,
                fontSize: 10,
                fontWeight: 500,
                color: INK.faded,
                letterSpacing: '0.01em',
                marginTop: 1,
              }}
            >
              {formatRevenue(estimateAnnualRevenue(clinician.sessionGoal))}/yr
            </span>
          </motion.button>
        </div>

        {/* Clients Goal - Clickable to open editor */}
        <div
          className="flex justify-center"
          onClick={() => onOpenGoalEditor?.('clients')}
        >
          <motion.button
            className="flex items-center justify-center px-3 py-1.5 rounded-lg transition-colors"
            style={{
              fontFamily: FONT.mono,
              fontSize: 15,
              fontWeight: 500,
              color: INK.black,
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
            whileHover={{ backgroundColor: INK.goldGlow }}
            whileTap={{ scale: 0.98 }}
          >
            {clinician.clientGoal}
          </motion.button>
        </div>

        {/* Status */}
        <div className="flex justify-center">
          <TogglePill
            active={clinician.isActive}
            onChange={(active) => {
              onUpdate({ isActive: active });
              handleSave();
            }}
          />
        </div>
      </motion.div>
    </>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const EditableRosterTable: React.FC<EditableRosterTableProps> = ({
  clinicians,
  onUpdate,
  onOpenGoalEditor,
}) => {
  // Sort: active clinicians first, then inactive at bottom
  const sortedClinicians = useMemo(() => {
    return [...clinicians].sort((a, b) => {
      if (a.isActive === b.isActive) return 0;
      return a.isActive ? -1 : 1;
    });
  }, [clinicians]);

  // Get available supervisors
  const supervisors = useMemo(() => {
    return clinicians.filter((c) => canSupervise(c.role) && c.isActive);
  }, [clinicians]);

  // Update a single clinician
  const updateClinician = useCallback(
    (id: string, updates: Partial<Clinician>) => {
      const updated = clinicians.map((c) => (c.id === id ? { ...c, ...updates } : c));
      onUpdate(updated);
    },
    [clinicians, onUpdate]
  );

  // Count active vs inactive
  const activeCount = sortedClinicians.filter((c) => c.isActive).length;

  return (
    <div className="w-full">
      {/* Header */}
      <HeaderRow />

      {/* Rows */}
      <div>
        {sortedClinicians.map((clinician, index) => (
          <ClinicianRow
            key={clinician.id}
            clinician={clinician}
            rank={index + 1}
            index={index}
            supervisors={supervisors}
            onUpdate={(updates) => updateClinician(clinician.id, updates)}
            onOpenGoalEditor={onOpenGoalEditor ? (metric) => onOpenGoalEditor(clinician.id, metric) : undefined}
          />
        ))}
      </div>

      {/* Footer summary */}
      <motion.div
        className="mt-6 pt-4 flex items-center gap-6"
        style={{ borderTop: `1px dashed ${INK.rule}` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: sortedClinicians.length * 0.03 + 0.2 }}
      >
        <div
          style={{
            fontFamily: FONT.sans,
            fontSize: 12,
            color: INK.faded,
          }}
        >
          <span style={{ color: INK.muted, fontWeight: 600 }}>{activeCount}</span> active
        </div>
        {sortedClinicians.length - activeCount > 0 && (
          <div
            style={{
              fontFamily: FONT.sans,
              fontSize: 12,
              color: INK.ghost,
            }}
          >
            <span style={{ fontWeight: 500 }}>{sortedClinicians.length - activeCount}</span> inactive
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default EditableRosterTable;
