import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link2, History, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { EditableRosterTable } from './EditableRosterTable';
import { SectionHeader, LedgerCard, PrimaryButton, FONT, INK, EASE } from './shared';
import type { Clinician } from './shared';
import { LICENSES_REQUIRING_SUPERVISION } from './shared';
import { GoalHistoryModal } from '../configure/GoalHistory';
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
// EXPANDED ROW CONTENT - Goal History Preview
// =============================================================================

interface ExpandedContentProps {
  clinician: Clinician;
  onViewFullHistory: () => void;
}

const ExpandedContent: React.FC<ExpandedContentProps> = ({ clinician, onViewFullHistory }) => {
  const { settings } = useSettings();
  const history = settings.clinicianGoalHistory[clinician.id];

  // Get recent goal changes
  const getRecentChanges = () => {
    const changes: { type: string; value: number; date: string; direction: 'up' | 'down' | 'same' }[] = [];

    if (history?.sessionGoal && history.sessionGoal.length > 1) {
      const current = history.sessionGoal.find(p => p.endDate === null);
      const previous = history.sessionGoal.find(p => p.endDate !== null);
      if (current && previous) {
        changes.push({
          type: 'Sessions',
          value: current.value,
          date: current.startDate,
          direction: current.value > previous.value ? 'up' : current.value < previous.value ? 'down' : 'same',
        });
      }
    }

    if (history?.clientGoal && history.clientGoal.length > 1) {
      const current = history.clientGoal.find(p => p.endDate === null);
      const previous = history.clientGoal.find(p => p.endDate !== null);
      if (current && previous) {
        changes.push({
          type: 'Clients',
          value: current.value,
          date: current.startDate,
          direction: current.value > previous.value ? 'up' : current.value < previous.value ? 'down' : 'same',
        });
      }
    }

    return changes;
  };

  const recentChanges = getRecentChanges();
  const hasHistory = recentChanges.length > 0;

  const DirectionIcon = ({ direction }: { direction: 'up' | 'down' | 'same' }) => {
    if (direction === 'up') return <TrendingUp size={12} color={INK.emerald} />;
    if (direction === 'down') return <TrendingDown size={12} color={INK.amber} />;
    return <Minus size={12} color={INK.faded} />;
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-6">
        {hasHistory ? (
          recentChanges.map((change, i) => (
            <div key={i} className="flex items-center gap-2">
              <DirectionIcon direction={change.direction} />
              <span style={{ fontFamily: FONT.sans, fontSize: 13, color: INK.muted }}>
                {change.type}: <strong style={{ color: INK.body }}>{change.value}</strong>
              </span>
              <span style={{ fontFamily: FONT.sans, fontSize: 11, color: INK.ghost }}>
                since {new Date(change.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
              </span>
            </div>
          ))
        ) : (
          <span style={{ fontFamily: FONT.sans, fontSize: 13, color: INK.faded }}>
            No goal history yet. Changes will be tracked over time.
          </span>
        )}
      </div>

      <button
        onClick={onViewFullHistory}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors"
        style={{
          fontFamily: FONT.sans,
          fontSize: 12,
          fontWeight: 600,
          color: INK.gold,
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = INK.goldGlow)}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        <History size={14} />
        View Full History
      </button>
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const CliniciansTab: React.FC<CliniciansTabProps> = ({
  clinicians,
  onUpdate,
  onOpenMapping,
}) => {
  const { settings } = useSettings();
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [goalHistoryClinicianId, setGoalHistoryClinicianId] = useState<string | null>(null);

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

  // Handle row expansion
  const handleExpandRow = (clinicianId: string | null) => {
    setExpandedRowId(clinicianId);
  };

  // Render expanded content with goal history preview
  const renderExpandedContent = (clinician: Clinician) => (
    <ExpandedContent
      clinician={clinician}
      onViewFullHistory={() => setGoalHistoryClinicianId(clinician.id)}
    />
  );

  // Find clinician for goal history modal
  const goalHistoryClinician = clinicians.find((c) => c.id === goalHistoryClinicianId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <SectionHeader
        title="Clinicians"
        subtitle="Credentials, roles, supervision, and goals for your clinical team"
        actions={
          <div className="flex items-center gap-4">
            {supervisionStatus.total > 0 && (
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
        }
      />

      {/* Roster Card */}
      <LedgerCard accent="gold">
        <div className="p-8">
          <EditableRosterTable
            clinicians={clinicians}
            onUpdate={onUpdate}
            onExpandRow={handleExpandRow}
            expandedRowId={expandedRowId}
            renderExpandedContent={renderExpandedContent}
          />
        </div>
      </LedgerCard>

      {/* Goal History Modal */}
      {goalHistoryClinician && (
        <GoalHistoryModal
          onClose={() => setGoalHistoryClinicianId(null)}
          clinician={{
            id: goalHistoryClinician.id,
            name: goalHistoryClinician.name,
            initials: goalHistoryClinician.initials,
            color: goalHistoryClinician.color,
            role: goalHistoryClinician.role,
            startDate: goalHistoryClinician.startDate,
          }}
          goalHistory={settings.clinicianGoalHistory}
        />
      )}
    </motion.div>
  );
};

export default CliniciansTab;
