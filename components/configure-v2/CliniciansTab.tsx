import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2 } from 'lucide-react';
import { EditableRosterTable } from './EditableRosterTable';
import { GoalEditorModal, type GoalMetric } from './GoalEditorModal';
import { LedgerCard, PrimaryButton, FONT, INK, EASE } from './shared';
import type { Clinician } from './shared';
import { LICENSES_REQUIRING_SUPERVISION } from './shared';
import { useSettings } from '../../context/SettingsContext';

// =============================================================================
// CLINICIANS TAB - The Team Roster
// =============================================================================
// One place to manage your entire clinical team. Credentials, roles,
// supervision, and goals - all visible at a glance, all editable inline.
// The StatusPill shows supervision health. The roster is the heart.
// =============================================================================

// =============================================================================
// TYPES
// =============================================================================

interface CliniciansTabProps {
  clinicians: Clinician[];
  onUpdate: (clinicians: Clinician[]) => void;
  onOpenMapping?: () => void;
}

// =============================================================================
// STATUS PILL - Supervision Health
// =============================================================================
// A compact indicator showing supervision assignment status.
// Gold progress ring, emerald when complete, amber when work to do.

interface SupervisionStatusProps {
  assigned: number;
  total: number;
}

const SupervisionStatus: React.FC<SupervisionStatusProps> = ({ assigned, total }) => {
  const unassigned = total - assigned;
  const isComplete = unassigned === 0;
  const progress = total > 0 ? assigned / total : 1;

  // SVG ring calculations
  const radius = 9;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl"
      style={{
        backgroundColor: isComplete ? INK.emeraldLight : INK.amberLight,
        border: `1px solid ${isComplete ? INK.emerald + '30' : INK.amber + '30'}`,
      }}
    >
      {/* Progress ring */}
      <div className="relative w-6 h-6 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" className="absolute -rotate-90">
          {/* Background ring */}
          <circle
            cx="12"
            cy="12"
            r={radius}
            fill="none"
            stroke={isComplete ? INK.emerald + '30' : INK.amber + '30'}
            strokeWidth="2.5"
          />
          {/* Progress ring */}
          <motion.circle
            cx="12"
            cy="12"
            r={radius}
            fill="none"
            stroke={isComplete ? INK.emerald : INK.gold}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </svg>
        {/* Center text */}
        <span
          className="relative z-10"
          style={{
            fontFamily: FONT.mono,
            fontSize: 9,
            fontWeight: 700,
            color: isComplete ? INK.emerald : INK.amber,
          }}
        >
          {isComplete ? '✓' : assigned}
        </span>
      </div>

      {/* Label */}
      <span
        style={{
          fontFamily: FONT.sans,
          fontSize: 13,
          fontWeight: 600,
          color: isComplete ? INK.emerald : INK.amber,
        }}
      >
        {isComplete ? 'All supervised' : `${unassigned} needs supervisor`}
      </span>

      {/* Fraction */}
      <span
        style={{
          fontFamily: FONT.mono,
          fontSize: 11,
          color: isComplete ? INK.emerald + '80' : INK.amber + '80',
        }}
      >
        {assigned}/{total}
      </span>
    </motion.div>
  );
};

// =============================================================================
// PRACTICE SUMMARY BAR
// =============================================================================
// Shows team totals computed from individual clinician goals.

interface PracticeSummaryBarProps {
  totalSessions: number;
  totalClients: number;
  clinicianCount: number;
  supervisionStatus?: { assigned: number; total: number };
  onOpenMapping?: () => void;
}

const PracticeSummaryBar: React.FC<PracticeSummaryBarProps> = ({
  totalSessions,
  totalClients,
  clinicianCount,
  supervisionStatus,
  onOpenMapping,
}) => (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: EASE.out }}
    className="flex items-center justify-between mb-6"
  >
    {/* Left: Stats as text */}
    <div
      className="flex items-center gap-2"
      style={{
        fontFamily: FONT.sans,
        fontSize: 14,
        color: INK.muted,
      }}
    >
      <span style={{ fontWeight: 600, color: INK.body }}>{totalSessions}</span>
      <span>sessions/wk</span>
      <span style={{ color: INK.rule, margin: '0 4px' }}>•</span>
      <span style={{ fontWeight: 600, color: INK.body }}>{totalClients}</span>
      <span>active clients</span>
      <span style={{ color: INK.rule, margin: '0 4px' }}>•</span>
      <span style={{ fontWeight: 600, color: INK.body }}>{clinicianCount}</span>
      <span>clinicians</span>
    </div>

    {/* Right: Supervision status + EHR mapping */}
    <div className="flex items-center gap-3">
      {supervisionStatus && supervisionStatus.total > 0 && (
        <SupervisionStatus
          assigned={supervisionStatus.assigned}
          total={supervisionStatus.total}
        />
      )}
      {onOpenMapping && (
        <PrimaryButton
          onClick={onOpenMapping}
          icon={<Link2 size={16} />}
          variant="stone"
        >
          Manage EHR Mapping
        </PrimaryButton>
      )}
    </div>
  </motion.div>
);

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const CliniciansTab: React.FC<CliniciansTabProps> = ({
  clinicians,
  onUpdate,
  onOpenMapping,
}) => {
  const { settings, updateSettings } = useSettings();
  const [goalEditorState, setGoalEditorState] = useState<{
    clinicianId: string;
    metric: GoalMetric;
  } | null>(null);

  // Compute supervision status
  const supervisionStatus = useMemo(() => {
    const needingSupervision = clinicians.filter(
      (c) => c.isActive && LICENSES_REQUIRING_SUPERVISION.includes(c.licenseType)
    );
    const assigned = needingSupervision.filter((c) => c.supervisorId !== null);
    return {
      assigned: assigned.length,
      total: needingSupervision.length,
    };
  }, [clinicians]);

  // Compute team totals
  const teamTotals = useMemo(() => {
    const activeClinicians = clinicians.filter((c) => c.isActive);
    return {
      sessions: activeClinicians.reduce((sum, c) => sum + c.sessionGoal, 0),
      clients: activeClinicians.reduce((sum, c) => sum + c.clientGoal, 0),
      count: activeClinicians.length,
    };
  }, [clinicians]);

  // Handle opening goal editor
  const handleOpenGoalEditor = useCallback((clinicianId: string, metric: GoalMetric) => {
    setGoalEditorState({ clinicianId, metric });
  }, []);

  // Handle saving goals from editor
  const handleSaveGoals = useCallback((monthlyGoals: Array<{ month: string; value: number }>) => {
    if (!goalEditorState) return;

    const { clinicianId, metric } = goalEditorState;
    const clinician = clinicians.find((c) => c.id === clinicianId);
    if (!clinician) return;

    // Get the current month's goal (or the latest set value)
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const currentGoal = monthlyGoals.find((g) => g.month === currentMonth);

    if (currentGoal) {
      // Update the clinician's current goal
      const updatedClinicians = clinicians.map((c) =>
        c.id === clinicianId
          ? { ...c, [metric === 'sessions' ? 'sessionGoal' : 'clientGoal']: currentGoal.value }
          : c
      );
      onUpdate(updatedClinicians);
    }

    // Also save to goal history in settings
    // TODO: Implement full goal history persistence when backend is ready
  }, [goalEditorState, clinicians, onUpdate]);

  // Find clinician for goal editor
  const goalEditorClinician = goalEditorState
    ? clinicians.find((c) => c.id === goalEditorState.clinicianId)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Summary Bar - replaces redundant header */}
      <PracticeSummaryBar
        totalSessions={teamTotals.sessions}
        totalClients={teamTotals.clients}
        clinicianCount={teamTotals.count}
        supervisionStatus={supervisionStatus}
        onOpenMapping={onOpenMapping}
      />

      {/* Roster Card */}
      <LedgerCard>
        <div className="p-8">
          <EditableRosterTable
            clinicians={clinicians}
            onUpdate={onUpdate}
            onOpenGoalEditor={handleOpenGoalEditor}
          />
        </div>
      </LedgerCard>

      {/* Goal Editor Modal */}
      <AnimatePresence>
        {goalEditorClinician && goalEditorState && (
          <GoalEditorModal
            clinician={goalEditorClinician}
            metric={goalEditorState.metric}
            currentValue={
              goalEditorState.metric === 'sessions'
                ? goalEditorClinician.sessionGoal
                : goalEditorClinician.clientGoal
            }
            actualAverage={
              // TODO: Pass actual average from analytics when available
              goalEditorState.metric === 'sessions'
                ? Math.round(goalEditorClinician.sessionGoal * 0.95)
                : undefined
            }
            onSave={handleSaveGoals}
            onClose={() => setGoalEditorState(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CliniciansTab;
