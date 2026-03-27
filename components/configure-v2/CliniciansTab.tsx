import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, ChevronRight } from 'lucide-react';
import { EditableRosterTable } from './EditableRosterTable';
import { GoalEditorModal, type GoalMetric, type GoalPeriod } from './GoalEditorModal';
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
// FEATURE FLAGS - Phase 2 features (disabled for now)
// =============================================================================
// Set to true to enable supervision, goals columns, and practice totals
const ENABLE_PHASE_2_FEATURES = true;

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
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2
            style={{
              fontFamily: FONT.serif,
              fontSize: 24,
              fontWeight: 400,
              color: INK.black,
              letterSpacing: '-0.01em',
            }}
          >
            Clinicians
          </h2>
          <p
            style={{
              fontFamily: FONT.sans,
              fontSize: 13,
              color: INK.muted,
              marginTop: 4,
            }}
          >
            Set individual goals and manage your team
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
      <div>
        {/* Section label */}
        <div
          className="flex items-center gap-2 mb-2"
          style={{
            fontFamily: FONT.sans,
            fontSize: 10,
            fontWeight: 600,
            color: INK.ghost,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          <span>Practice Totals</span>
          <div className="flex-1 h-px" style={{ backgroundColor: INK.rule }} />
        </div>
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
      </div>
    </motion.div>
  );
};

// =============================================================================
// CHANGES BAR - Shows unsaved changes OR pending sync status
// =============================================================================

type ChangesBarMode = 'unsaved' | 'pending-sync';

interface ChangesBarProps {
  mode: ChangesBarMode;
  changeCount: number;
  onSave?: () => void;
  onDiscard?: () => void;
  isSaving?: boolean;
}

const ChangesBar: React.FC<ChangesBarProps> = ({
  mode,
  changeCount,
  onSave,
  onDiscard,
  isSaving = false,
}) => {
  const isUnsaved = mode === 'unsaved';

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: -8, height: 0 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="mb-4 overflow-hidden"
    >
      <div
        className="flex items-center justify-between px-5 py-3.5 rounded-lg"
        style={{
          backgroundColor: isUnsaved ? INK.amberLight : INK.cream,
          border: `1px solid ${isUnsaved ? INK.amber + '30' : INK.rule}`,
        }}
      >
        {/* Left: Status message */}
        <div className="flex items-center gap-3">
          {/* Dot */}
          <motion.div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: isUnsaved ? INK.amber : INK.gold }}
            animate={isUnsaved ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />

          <span
            style={{
              fontFamily: FONT.sans,
              fontSize: 14,
              fontWeight: 500,
              color: isUnsaved ? INK.amber : INK.muted,
            }}
          >
            {isUnsaved ? (
              <>
                <span style={{ fontWeight: 600 }}>{changeCount} unsaved {changeCount === 1 ? 'change' : 'changes'}</span>
              </>
            ) : (
              <>
                <span style={{ fontWeight: 600 }}>{changeCount} pending {changeCount === 1 ? 'change' : 'changes'}</span>
                <span style={{ color: INK.faded }}> — will apply after next sync</span>
              </>
            )}
          </span>
        </div>

        {/* Right: Actions (only for unsaved) */}
        {isUnsaved && (
          <div className="flex items-center gap-2">
            <motion.button
              onClick={onDiscard}
              className="px-3 py-1.5 rounded-md transition-colors"
              style={{
                fontFamily: FONT.sans,
                fontSize: 13,
                fontWeight: 500,
                color: INK.amber,
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
              whileHover={{ backgroundColor: `${INK.amber}15` }}
              whileTap={{ scale: 0.98 }}
            >
              Discard
            </motion.button>

            <motion.button
              onClick={onSave}
              disabled={isSaving}
              className="px-4 py-1.5 rounded-md transition-all"
              style={{
                fontFamily: FONT.sans,
                fontSize: 13,
                fontWeight: 600,
                color: 'white',
                backgroundColor: INK.amber,
                border: 'none',
                cursor: isSaving ? 'wait' : 'pointer',
                opacity: isSaving ? 0.7 : 1,
              }}
              whileHover={{ scale: isSaving ? 1 : 1.02 }}
              whileTap={{ scale: isSaving ? 1 : 0.98 }}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// =============================================================================
// ACCORDION SECTION - Matches Service Mapping style exactly
// =============================================================================

interface AccordionSectionProps {
  label: string;
  description: string;
  count: number;
  color: string;
  isLast?: boolean;
  children: React.ReactNode;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({
  label,
  description,
  count,
  color,
  isLast = false,
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      style={{
        borderBottom: isLast ? 'none' : `1px solid ${INK.rule}`,
      }}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-4 flex items-center justify-between transition-colors hover:bg-stone-50"
        style={{
          backgroundColor: isExpanded ? INK.cream : 'transparent',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.15 }}
          >
            <ChevronRight size={16} color={INK.faded} />
          </motion.div>
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <div className="flex items-center gap-2.5">
            <span
              style={{
                fontFamily: FONT.sans,
                fontSize: 15,
                fontWeight: 600,
                color: INK.body,
              }}
            >
              {label}
            </span>
            <span
              style={{
                fontFamily: FONT.sans,
                fontSize: 13,
                color: INK.muted,
              }}
            >
              — {description}
            </span>
          </div>
        </div>
        <span
          className="px-2.5 py-1 rounded-full"
          style={{
            fontFamily: FONT.mono,
            fontSize: 12,
            fontWeight: 600,
            color: INK.body,
            backgroundColor: INK.cream,
          }}
        >
          {count}
        </span>
      </button>

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// =============================================================================
// SIMPLE ROW COMPONENTS - For accordion content (flex rows, not table grid)
// =============================================================================

interface InactiveClinicianRowProps {
  clinician: Clinician;
  onReactivate: (id: string) => void;
  isLast: boolean;
}

const InactiveClinicianRow: React.FC<InactiveClinicianRowProps> = ({
  clinician,
  onReactivate,
  isLast,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `Since ${date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between py-3.5 group"
      style={{
        borderBottom: isLast ? 'none' : `1px solid ${INK.rule}`,
        backgroundColor: isHovered ? `${INK.cream}80` : 'transparent',
        transition: 'background-color 0.15s ease',
        marginLeft: -20,
        marginRight: -20,
        paddingLeft: 20,
        paddingRight: 20,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Clinician info */}
      <div className="flex items-center gap-4">
        <span
          style={{
            fontFamily: FONT.serif,
            fontSize: 16,
            color: INK.body,
          }}
        >
          {clinician.name}
        </span>
        <span
          className="px-2 py-0.5 rounded"
          style={{
            fontFamily: FONT.mono,
            fontSize: 11,
            fontWeight: 500,
            backgroundColor: INK.cream,
            color: INK.faded,
          }}
        >
          {clinician.licenseType}
        </span>
        <span
          style={{
            fontFamily: FONT.sans,
            fontSize: 12,
            color: INK.ghost,
          }}
        >
          {formatDate(clinician.startDate)}
        </span>
      </div>

      {/* Reactivate button */}
      <motion.button
        onClick={() => onReactivate(clinician.id)}
        className="px-3 py-1.5 rounded-md transition-all"
        style={{
          fontFamily: FONT.sans,
          fontSize: 12,
          fontWeight: 600,
          color: INK.emerald,
          backgroundColor: isHovered ? INK.emeraldLight : 'transparent',
          border: `1px solid ${isHovered ? INK.emerald + '40' : 'transparent'}`,
          cursor: 'pointer',
          opacity: isHovered ? 1 : 0,
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Reactivate
      </motion.button>
    </motion.div>
  );
};

// =============================================================================
// ACTIVE CLINICIAN SECTION - Accordion with full table inside
// =============================================================================

interface ActiveClinicianSectionProps {
  clinicians: Clinician[];
  onUpdate: (clinicians: Clinician[]) => void;
  onOpenGoalEditor: (clinicianId: string, metric: 'sessions' | 'clients') => void;
  showPhase2Columns: boolean;
  isLast?: boolean;
}

const ActiveClinicianSection: React.FC<ActiveClinicianSectionProps> = ({
  clinicians,
  onUpdate,
  onOpenGoalEditor,
  showPhase2Columns,
  isLast = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(true); // Expanded by default

  return (
    <div
      style={{
        borderBottom: isLast ? 'none' : `1px solid ${INK.rule}`,
      }}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-4 flex items-center justify-between transition-colors hover:bg-stone-50"
        style={{
          backgroundColor: isExpanded ? INK.cream : 'transparent',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.15 }}
          >
            <ChevronRight size={16} color={INK.faded} />
          </motion.div>
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: INK.emerald }}
          />
          <div className="flex items-center gap-2.5">
            <span
              style={{
                fontFamily: FONT.sans,
                fontSize: 15,
                fontWeight: 600,
                color: INK.body,
              }}
            >
              Active Clinicians
            </span>
            <span
              style={{
                fontFamily: FONT.sans,
                fontSize: 13,
                color: INK.muted,
              }}
            >
              — your clinical team
            </span>
          </div>
        </div>
        <span
          className="px-2.5 py-1 rounded-full"
          style={{
            fontFamily: FONT.mono,
            fontSize: 12,
            fontWeight: 600,
            color: INK.body,
            backgroundColor: INK.cream,
          }}
        >
          {clinicians.length}
        </span>
      </button>

      {/* Expanded content - the full table */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <EditableRosterTable
                clinicians={clinicians}
                onUpdate={onUpdate}
                onOpenGoalEditor={onOpenGoalEditor}
                showPhase2Columns={showPhase2Columns}
              />
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

  // Track original state for change detection
  const [originalClinicians, setOriginalClinicians] = useState<Clinician[]>(clinicians);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0); // Changes saved but not yet synced

  // Calculate unsaved changes (current vs last saved)
  const unsavedChanges = useMemo(() => {
    const changes: string[] = [];
    clinicians.forEach((c) => {
      const original = originalClinicians.find((o) => o.id === c.id);
      if (!original) return;

      // Check for meaningful changes
      if (c.isActive !== original.isActive) changes.push(c.id);
      else if (c.includeNotes !== original.includeNotes) changes.push(c.id);
      else if (c.licenseType !== original.licenseType) changes.push(c.id);
      else if (c.role !== original.role) changes.push(c.id);
      else if (c.supervisorId !== original.supervisorId) changes.push(c.id);
      else if (c.sessionGoal !== original.sessionGoal) changes.push(c.id);
      else if (c.clientGoal !== original.clientGoal) changes.push(c.id);
    });
    return [...new Set(changes)]; // Dedupe
  }, [clinicians, originalClinicians]);

  // Separate active and inactive clinicians
  const { activeClinicians, inactiveClinicians } = useMemo(() => {
    return {
      activeClinicians: clinicians.filter((c) => c.isActive),
      inactiveClinicians: clinicians.filter((c) => !c.isActive),
    };
  }, [clinicians]);

  // Handle save
  const handleSave = useCallback(() => {
    setIsSaving(true);
    const changeCount = unsavedChanges.length;
    // Simulate API call
    setTimeout(() => {
      setOriginalClinicians(clinicians);
      setPendingSyncCount((prev) => prev + changeCount); // Add to pending sync
      setIsSaving(false);
    }, 600);
  }, [clinicians, unsavedChanges.length]);

  // Handle discard
  const handleDiscard = useCallback(() => {
    onUpdate(originalClinicians);
  }, [originalClinicians, onUpdate]);

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
    const totalSessions = activeClinicians.reduce((sum, c) => sum + c.sessionGoal, 0);
    return {
      sessions: totalSessions,
      clients: activeClinicians.reduce((sum, c) => sum + c.clientGoal, 0),
      count: activeClinicians.length,
      estimatedRevenue: estimateAnnualRevenue(totalSessions),
    };
  }, [activeClinicians]);

  // Handle opening goal editor
  const handleOpenGoalEditor = useCallback((clinicianId: string, metric: GoalMetric) => {
    setGoalEditorState({ clinicianId, metric });
  }, []);

  // Handle saving goals from editor (period-based)
  const handleSaveGoals = useCallback((periods: GoalPeriod[]) => {
    if (!goalEditorState) return;

    const { clinicianId, metric } = goalEditorState;

    // The active period (endDate === null) determines the current goal
    const activePeriod = periods.find((p) => !p.endDate);
    if (!activePeriod) return;

    // Update the clinician's current goal value
    const goalField = metric === 'sessions' ? 'sessionGoal' : 'clientGoal';
    const updatedClinicians = clinicians.map((c) =>
      c.id === clinicianId ? { ...c, [goalField]: activePeriod.value } : c
    );
    onUpdate(updatedClinicians);

    // Persist goal periods to settings context
    const goalType = metric === 'sessions' ? 'sessionGoal' : 'clientGoal';
    updateSettings({
      clinicianGoalHistory: {
        ...settings.clinicianGoalHistory,
        [clinicianId]: {
          ...settings.clinicianGoalHistory?.[clinicianId],
          [goalType]: periods,
        },
      },
    });
  }, [goalEditorState, clinicians, onUpdate, settings, updateSettings]);

  // Handle reactivating a clinician
  const handleReactivate = useCallback((clinicianId: string) => {
    const updatedClinicians = clinicians.map((c) =>
      c.id === clinicianId ? { ...c, isActive: true } : c
    );
    onUpdate(updatedClinicians);
  }, [clinicians, onUpdate]);

  // Find clinician for goal editor
  const goalEditorClinician = goalEditorState
    ? clinicians.find((c) => c.id === goalEditorState.clinicianId)
    : null;

  // Get goal periods for the editor (from settings history, or create a default)
  const goalEditorPeriods = useMemo((): GoalPeriod[] => {
    if (!goalEditorState || !goalEditorClinician) return [];

    const { clinicianId, metric } = goalEditorState;
    const goalType = metric === 'sessions' ? 'sessionGoal' : 'clientGoal';
    const history = settings.clinicianGoalHistory?.[clinicianId];
    const existing = history?.[goalType] as GoalPeriod[] | undefined;

    if (existing && existing.length > 0) return existing;

    // Default: one period from clinician's start date to present
    return [{
      id: `gp_default_${clinicianId}_${goalType}`,
      startDate: goalEditorClinician.startDate,
      endDate: null,
      value: metric === 'sessions' ? goalEditorClinician.sessionGoal : goalEditorClinician.clientGoal,
    }];
  }, [goalEditorState, goalEditorClinician, settings.clinicianGoalHistory]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Summary Bar - Phase 2 feature */}
      {ENABLE_PHASE_2_FEATURES && (
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
      )}

      {/* Header - OUTSIDE the card */}
      <div className="mb-6">
        <h2
          style={{
            fontFamily: FONT.serif,
            fontSize: 24,
            fontWeight: 400,
            color: INK.black,
            letterSpacing: '-0.01em',
          }}
        >
          Clinicians
        </h2>
        <p
          style={{
            fontFamily: FONT.sans,
            fontSize: 14,
            color: INK.muted,
            marginTop: 6,
          }}
        >
          Set individual goals and manage your team
        </p>
      </div>

      {/* Changes Bar - unsaved or pending sync */}
      <AnimatePresence mode="wait">
        {unsavedChanges.length > 0 ? (
          <ChangesBar
            key="unsaved"
            mode="unsaved"
            changeCount={unsavedChanges.length}
            onSave={handleSave}
            onDiscard={handleDiscard}
            isSaving={isSaving}
          />
        ) : pendingSyncCount > 0 ? (
          <ChangesBar
            key="pending-sync"
            mode="pending-sync"
            changeCount={pendingSyncCount}
          />
        ) : null}
      </AnimatePresence>

      {/* All sections in one card - all accordions */}
      <LedgerCard>
        <div
          className="rounded-lg overflow-hidden"
          style={{ border: `1px solid ${INK.rule}` }}
        >
          {/* Active Clinicians - expanded by default, contains table */}
          <ActiveClinicianSection
            clinicians={activeClinicians}
            onUpdate={(updated) => {
              const allClinicians = [...updated, ...inactiveClinicians];
              onUpdate(allClinicians);
            }}
            onOpenGoalEditor={handleOpenGoalEditor}
            showPhase2Columns={ENABLE_PHASE_2_FEATURES}
            isLast={inactiveClinicians.length === 0}
          />

          {/* Inactive Clinicians */}
          {inactiveClinicians.length > 0 && (
            <AccordionSection
              label="Inactive Clinicians"
              description="former team members"
              count={inactiveClinicians.length}
              color={INK.faded}
              isLast
            >
              {inactiveClinicians.map((c, idx) => (
                <InactiveClinicianRow
                  key={c.id}
                  clinician={c}
                  onReactivate={handleReactivate}
                  isLast={idx === inactiveClinicians.length - 1}
                />
              ))}
            </AccordionSection>
          )}
        </div>
      </LedgerCard>

      {/* Goal Editor Modal */}
      <AnimatePresence>
        {goalEditorClinician && goalEditorState && (
          <GoalEditorModal
            clinician={goalEditorClinician}
            metric={goalEditorState.metric}
            periods={goalEditorPeriods}
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
