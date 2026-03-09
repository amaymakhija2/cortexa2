import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2 } from 'lucide-react';
import { EditableRosterTable } from './EditableRosterTable';
import { GoalEditorModal, type GoalMetric } from './GoalEditorModal';
import { PracticeInsightsModal, Sparkline, type PracticeMetric } from './PracticeInsightsModal';
import { LedgerCard, PrimaryButton, FONT, INK, EASE, estimateAnnualRevenue, formatRevenue, REVENUE_DEFAULTS } from './shared';
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
// METRIC PILL - Clickable stat with sparkline
// =============================================================================
// A refined pill showing a key metric with trend visualization.
// Clicking opens the full insights modal.

interface MetricPillProps {
  label: string;
  value: string;
  subtext?: string;
  sparklineData: number[];
  onClick: () => void;
  accentColor?: string;
}

const MetricPill: React.FC<MetricPillProps> = ({
  label,
  value,
  subtext,
  sparklineData,
  onClick,
  accentColor = INK.emerald,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer border-0"
      style={{
        backgroundColor: isHovered ? INK.cream : INK.paper,
        border: `1px solid ${isHovered ? INK.gold + '50' : INK.rule}`,
        outline: 'none',
        boxShadow: isHovered
          ? `0 4px 12px ${INK.goldGlow}`
          : '0 1px 3px rgba(0,0,0,0.04)',
      }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Sparkline */}
      <div className="flex-shrink-0">
        <Sparkline
          data={sparklineData}
          width={48}
          height={20}
          color={accentColor}
        />
      </div>

      {/* Value and label */}
      <div className="flex flex-col items-start">
        <div className="flex items-baseline gap-1.5">
          <span
            style={{
              fontFamily: FONT.mono,
              fontSize: 18,
              fontWeight: 700,
              color: INK.black,
              letterSpacing: '-0.02em',
            }}
          >
            {value}
          </span>
          {subtext && (
            <span
              style={{
                fontFamily: FONT.sans,
                fontSize: 11,
                color: INK.ghost,
              }}
            >
              {subtext}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span
            style={{
              fontFamily: FONT.sans,
              fontSize: 10,
              color: INK.muted,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {label}
          </span>
          {/* Always-visible "view" indicator */}
          <span
            style={{
              fontFamily: FONT.sans,
              fontSize: 9,
              color: isHovered ? INK.gold : INK.ghost,
              transition: 'color 0.15s ease',
            }}
          >
            · View
          </span>
        </div>
      </div>

      {/* Chevron indicator */}
      <motion.div
        className="ml-1"
        animate={{
          x: isHovered ? 2 : 0,
          opacity: isHovered ? 1 : 0.4,
        }}
        transition={{ duration: 0.15 }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M5 3.5L8.5 7L5 10.5"
            stroke={isHovered ? INK.gold : INK.ghost}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
    </motion.button>
  );
};

// =============================================================================
// PRACTICE SUMMARY BAR
// =============================================================================
// Shows team totals computed from individual clinician goals.
// Each metric is clickable to reveal detailed insights.

interface PracticeSummaryBarProps {
  totalSessions: number;
  totalClients: number;
  clinicianCount: number;
  estimatedRevenue: number;
  supervisionStatus?: { assigned: number; total: number };
  onOpenMapping?: () => void;
  onMetricClick: (metric: PracticeMetric) => void;
  clinicians: Clinician[];
}

// Generate mock sparkline data for display
function generateSparklineData(baseValue: number, months: number = 12): number[] {
  const data: number[] = [];
  let current = baseValue * 0.85; // Start lower

  for (let i = 0; i < months; i++) {
    // Add some variance with upward trend
    const variance = (Math.random() - 0.4) * baseValue * 0.1;
    const trend = (i / months) * baseValue * 0.2;
    current = current + variance + (trend / months);
    data.push(Math.max(0, Math.round(current)));
  }

  return data;
}

const PracticeSummaryBar: React.FC<PracticeSummaryBarProps> = ({
  totalSessions,
  totalClients,
  clinicianCount,
  estimatedRevenue,
  supervisionStatus,
  onOpenMapping,
  onMetricClick,
  clinicians,
}) => {
  // Generate sparkline data (memoized in real app with actual historical data)
  const monthlyRevenue = Math.round(estimatedRevenue / 12);
  const monthlySessions = Math.round(totalSessions * 4.33);

  const revenueSparkline = useMemo(() => generateSparklineData(monthlyRevenue), [monthlyRevenue]);
  const sessionsSparkline = useMemo(() => generateSparklineData(monthlySessions), [monthlySessions]);
  const clientsSparkline = useMemo(() => generateSparklineData(totalClients), [totalClients]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE.out }}
      className="mb-6"
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2
            style={{
              fontFamily: FONT.serif,
              fontSize: 20,
              fontWeight: 400,
              color: INK.black,
              marginBottom: 2,
            }}
          >
            Practice Total Goals
          </h2>
          <p
            style={{
              fontFamily: FONT.sans,
              fontSize: 13,
              color: INK.muted,
            }}
          >
            Combined goals from {clinicianCount} clinicians
          </p>
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
      </div>

      {/* Metric pills row */}
      <div className="flex items-center gap-1">
        <MetricPill
          label="Monthly Revenue Goal"
          value={formatRevenue(monthlyRevenue)}
          subtext="/mo"
          sparklineData={revenueSparkline}
          onClick={() => onMetricClick('revenue')}
          accentColor={INK.emerald}
        />

        <div className="w-px h-8 mx-1" style={{ backgroundColor: INK.rule }} />

        <MetricPill
          label="Monthly Sessions Goal"
          value={String(totalSessions)}
          subtext="/wk"
          sparklineData={sessionsSparkline}
          onClick={() => onMetricClick('sessions')}
          accentColor={INK.gold}
        />

        <div className="w-px h-8 mx-1" style={{ backgroundColor: INK.rule }} />

        <MetricPill
          label="Monthly Client Goal"
          value={String(totalClients)}
          sparklineData={clientsSparkline}
          onClick={() => onMetricClick('clients')}
          accentColor="#7c3aed"
        />
      </div>
    </motion.div>
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
  const { settings, updateSettings } = useSettings();
  const [goalEditorState, setGoalEditorState] = useState<{
    clinicianId: string;
    metric: GoalMetric;
  } | null>(null);
  const [practiceInsightsMetric, setPracticeInsightsMetric] = useState<PracticeMetric | null>(null);

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

  // Compute team totals including estimated revenue
  const teamTotals = useMemo(() => {
    const activeClinicians = clinicians.filter((c) => c.isActive);
    const totalSessions = activeClinicians.reduce((sum, c) => sum + c.sessionGoal, 0);
    return {
      sessions: totalSessions,
      clients: activeClinicians.reduce((sum, c) => sum + c.clientGoal, 0),
      count: activeClinicians.length,
      estimatedRevenue: estimateAnnualRevenue(totalSessions),
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
        estimatedRevenue={teamTotals.estimatedRevenue}
        supervisionStatus={supervisionStatus}
        onOpenMapping={onOpenMapping}
        onMetricClick={setPracticeInsightsMetric}
        clinicians={clinicians}
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
            onSave={handleSaveGoals}
            onClose={() => setGoalEditorState(null)}
          />
        )}
      </AnimatePresence>

      {/* Practice Insights Modal */}
      <AnimatePresence>
        {practiceInsightsMetric && (
          <PracticeInsightsModal
            metric={practiceInsightsMetric}
            clinicians={clinicians}
            onClose={() => setPracticeInsightsMetric(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CliniciansTab;
