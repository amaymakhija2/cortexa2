import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import {
  FONT,
  INK,
  InlineSelect,
  TogglePill,
  estimateAnnualRevenue,
  formatRevenue,
} from './shared';
import type { Clinician, LicenseType } from './shared';
import {
  LICENSE_TYPE_NAMES,
  ROLE_OPTIONS,
  canSupervise,
  LICENSES_REQUIRING_SUPERVISION,
} from './shared';
import { LedgerTable, type ColumnDef } from './LedgerTable';

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
// COLUMN STRUCTURE (without rank - LedgerTable adds it automatically)
// =============================================================================

const COLUMNS: ColumnDef[] = [
  { key: 'clinician', label: 'Clinician', width: 'minmax(140px, 180px)', align: 'left' },
  { key: 'license', label: 'License', width: '100px', align: 'center' },
  { key: 'role', label: 'Role', width: '1fr', align: 'center' },
  { key: 'supervision', label: 'Supervised By', width: '1fr', align: 'center' },
  { key: 'sessions', label: 'Sessions Goal', width: '1fr', align: 'center' },
  { key: 'clients', label: 'Caseload Goal', width: '1fr', align: 'center' },
  { key: 'status', label: 'Status', width: '90px', align: 'center' },
];

// =============================================================================
// CLINICIAN ROW CELL RENDERER
// =============================================================================
// Renders the cells for a clinician row. This is a pure function that returns
// an array of React nodes - one per column (excluding rank, which LedgerTable adds).
// =============================================================================

interface RenderClinicianCellsProps {
  clinician: Clinician;
  supervisors: Clinician[];
  onUpdate: (updates: Partial<Clinician>) => void;
  onOpenGoalEditor?: (metric: 'sessions' | 'clients') => void;
  recentlySaved: boolean;
  onSave: () => void;
}

function renderClinicianCells({
  clinician,
  supervisors,
  onUpdate,
  onOpenGoalEditor,
  recentlySaved,
  onSave,
}: RenderClinicianCellsProps): React.ReactNode[] {
  // Format start date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `Since ${date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
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
      label: needsSupervision ? (hasNoSupervisor ? 'Assign...' : 'Clear') : 'No Supervisor',
    },
    ...supervisors
      .filter((s) => s.id !== clinician.id)
      .map((s) => ({ value: s.id, label: s.name })),
  ];

  return [
    // Clinician Name
    <div key="name" className="min-w-0 pl-3 relative">
      {/* Save confirmation glow - positioned relative to name cell but spans full row visually */}
      <AnimatePresence>
        {recentlySaved && (
          <motion.div
            className="absolute pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              left: -60,
              top: -20,
              bottom: -20,
              right: -400,
              background: `linear-gradient(90deg, ${INK.emeraldLight} 0%, transparent 30%)`,
              borderRadius: 4,
            }}
          />
        )}
      </AnimatePresence>
      <motion.div
        className="truncate relative z-10"
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
        className="truncate mt-0.5 relative z-10"
        style={{
          fontFamily: FONT.sans,
          fontSize: 11,
          color: INK.ghost,
          letterSpacing: '0.02em',
        }}
      >
        {formatDate(clinician.startDate)}
      </div>
    </div>,

    // License
    <div key="license" className="flex justify-center">
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
          onSave();
        }}
        width={85}
      />
    </div>,

    // Role
    <div key="role" className="flex justify-center">
      <InlineSelect
        value={clinician.role}
        options={roleOptions}
        onChange={(value) => {
          onUpdate({ role: value });
          onSave();
        }}
        width={155}
      />
    </div>,

    // Supervision
    <div key="supervision" className="flex justify-center items-center gap-1">
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
          onSave();
        }}
        width={155}
      />
    </div>,

    // Sessions Goal - Clickable to open editor
    <div
      key="sessions"
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
    </div>,

    // Clients Goal - Clickable to open editor
    <div
      key="clients"
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
    </div>,

    // Status
    <div key="status" className="flex justify-center">
      <TogglePill
        active={clinician.isActive}
        onChange={(active) => {
          onUpdate({ isActive: active });
          onSave();
        }}
      />
    </div>,
  ];
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const EditableRosterTable: React.FC<EditableRosterTableProps> = ({
  clinicians,
  onUpdate,
  onOpenGoalEditor,
}) => {
  // Track recently saved clinicians for animation
  const [recentlySavedMap, setRecentlySavedMap] = useState<Record<string, boolean>>({});

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

  // Handle save with visual feedback per clinician
  const handleSave = useCallback((clinicianId: string) => {
    setRecentlySavedMap((prev) => ({ ...prev, [clinicianId]: true }));
    setTimeout(() => {
      setRecentlySavedMap((prev) => ({ ...prev, [clinicianId]: false }));
    }, 800);
  }, []);

  // Count active vs inactive
  const activeCount = sortedClinicians.filter((c) => c.isActive).length;
  const inactiveCount = sortedClinicians.length - activeCount;

  // Render row cells for LedgerTable
  const renderRow = useCallback(
    (clinician: Clinician, _index: number, _isHovered: boolean): React.ReactNode[] => {
      const recentlySaved = recentlySavedMap[clinician.id] || false;
      return renderClinicianCells({
        clinician,
        supervisors,
        onUpdate: (updates) => updateClinician(clinician.id, updates),
        onOpenGoalEditor: onOpenGoalEditor ? (metric) => onOpenGoalEditor(clinician.id, metric) : undefined,
        recentlySaved,
        onSave: () => handleSave(clinician.id),
      });
    },
    [supervisors, updateClinician, onOpenGoalEditor, recentlySavedMap, handleSave]
  );

  return (
    <LedgerTable
      columns={COLUMNS}
      data={sortedClinicians}
      keyExtractor={(clinician) => clinician.id}
      renderRow={renderRow}
      rowOpacity={(clinician) => (clinician.isActive ? 1 : 0.4)}
      footer={{
        activeCount,
        activeLabel: 'active',
        inactiveCount,
        inactiveLabel: 'inactive',
      }}
      emptyMessage="No clinicians added yet."
    />
  );
};

export default EditableRosterTable;
