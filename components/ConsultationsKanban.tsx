import React, { useMemo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Clock,
  Phone,
  Video,
  ChevronRight,
  X,
  ChevronDown,
  User,
  Users,
  PhoneCall,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import type {
  Consultation,
  ConsultationStage,
} from '../types/consultations';
import {
  formatConsultationDate,
  getNextAction,
  getClientInitials,
  formatClientName,
  isConsultationPast,
  isConsultationToday,
  getDaysSince,
  getNextFollowUpDue,
  getFollowUpLabel,
} from '../types/consultations';
import {
  useSettings,
  getFollowUpIntervals,
  ConsultationPipelineConfig,
} from '../context/SettingsContext';

// =============================================================================
// CONSULTATIONS KANBAN BOARD
// =============================================================================
// Design Philosophy: Warm Editorial Sophistication
//
// Inspired by high-end magazine layouts (Kinfolk, Cereal, The New Yorker)
// - Warm cream/ivory base palette
// - Single refined accent: terracotta/sienna for actions
// - Sage green for success states
// - Elegant serif typography for names
// - Generous whitespace, sophisticated restraint
// - Color is purposeful, not decorative
// =============================================================================

// -----------------------------------------------------------------------------
// URGENCY HELPERS
// -----------------------------------------------------------------------------

type UrgencyLevel = 'imminent' | 'soon' | 'today' | 'tomorrow' | 'future' | 'past';

interface TimeUntilConsult {
  level: UrgencyLevel;
  label: string;
  minutes: number;
  isActive: boolean;
}

const getTimeUntilConsult = (datetime: string, duration: number = 15): TimeUntilConsult => {
  const now = new Date();
  const consultTime = new Date(datetime);
  const consultEndTime = new Date(consultTime.getTime() + duration * 60 * 1000);
  const diffMs = consultTime.getTime() - now.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (now >= consultTime && now <= consultEndTime) {
    return { level: 'imminent', label: 'Happening now', minutes: 0, isActive: true };
  }
  if (diffMs < 0) {
    return { level: 'past', label: 'Past', minutes: diffMinutes, isActive: false };
  }
  if (diffMinutes <= 15) {
    return { level: 'imminent', label: diffMinutes <= 1 ? 'Now' : `${diffMinutes}m`, minutes: diffMinutes, isActive: false };
  }
  if (diffMinutes <= 60) {
    return { level: 'soon', label: `${diffMinutes}m`, minutes: diffMinutes, isActive: false };
  }
  if (diffMinutes <= 240) {
    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    return { level: 'today', label: mins > 0 ? `${hours}h ${mins}m` : `${hours}h`, minutes: diffMinutes, isActive: false };
  }

  const isToday = consultTime.toDateString() === now.toDateString();
  if (isToday) {
    const timeStr = consultTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return { level: 'today', label: timeStr, minutes: diffMinutes, isActive: false };
  }

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (consultTime.toDateString() === tomorrow.toDateString()) {
    const timeStr = consultTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return { level: 'tomorrow', label: `Tom ${timeStr}`, minutes: diffMinutes, isActive: false };
  }

  return { level: 'future', label: formatConsultationDate(datetime), minutes: diffMinutes, isActive: false };
};

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

export interface KanbanColumn {
  id: string;
  title: string;
  stages: ConsultationStage[];
  isTerminal?: boolean;
  terminalType?: 'success' | 'neutral';
}

interface ConsultationsKanbanProps {
  consultations: Consultation[];
  onTakeAction: (consultation: Consultation) => void;
  onSelectConsultation: (consultation: Consultation) => void;
  onDragEnd?: (consultationId: string, newStage: ConsultationStage) => void;
}

// -----------------------------------------------------------------------------
// COLUMN CONFIGURATION
// -----------------------------------------------------------------------------
// Pipeline Flow (5 active columns):
// 1. Booked: new, confirmed (pre-consult) - waiting for consultation
// 2. Post-Consult: consult_complete, no_show - consult happened, need to mark outcome or do recovery
// 3. Intake: intake_pending - attended but didn't book intake, need to convince them
// 4. Paperwork: intake_scheduled, paperwork_pending - intake booked, focus on paperwork
// 5. First Session: paperwork_complete - paperwork done, waiting for first session
// Note: converted and lost stages are filtered out of the Kanban (they're done)

const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: 'booked', title: 'Booked', stages: ['new', 'confirmed'] },
  { id: 'post-consult', title: 'Post-Consult', stages: ['consult_complete', 'no_show'] },
  { id: 'intake', title: 'Intake', stages: ['intake_pending'] },
  { id: 'paperwork', title: 'Paperwork', stages: ['intake_scheduled', 'paperwork_pending'] },
  { id: 'first-session', title: 'First Session', stages: ['paperwork_complete'] },
];

// -----------------------------------------------------------------------------
// ACTION SYSTEM
// -----------------------------------------------------------------------------
// Refined action logic matching the Practice Config flow:
//
// BOOKED COLUMN:
//   - new: "Send Confirmation" (cyan)
//   - confirmed (pre-consult): "Join Consult" (cyan, amber when imminent)
//
// POST-CONSULT COLUMN:
//   - consult_complete: "Mark Outcome" - need to record attended/no-show (amber)
//   - no_show: "Send Recovery #N" / "Mark Rescheduled" / "Mark Lost" (rose)
//
// INTAKE COLUMN:
//   - intake_pending: "Send Reminder" / "Mark Scheduled" / "Mark Lost" (amber)
//
// PAPERWORK COLUMN:
//   - intake_scheduled: "Send Paperwork Reminder" (violet)
//   - paperwork_pending: "Send Reminder" / "Mark Complete" (violet)
//
// FIRST SESSION COLUMN:
//   - paperwork_complete: "Mark Converted" (emerald)

type ActionPriority = 'due' | 'upcoming' | 'reactive' | null;

interface ActionInfo {
  priority: ActionPriority;
  buttonLabel: string;
  statusLabel: string;
  colorScheme: 'cyan' | 'amber' | 'rose' | 'violet' | 'emerald' | 'stone';
}

const getActionInfo = (consultation: Consultation, pipelineConfig: ConsultationPipelineConfig): ActionInfo => {
  const { stage, followUpCount, datetime, lastFollowUpDate } = consultation;

  // Terminal states
  if (stage === 'converted') {
    return { priority: null, buttonLabel: '', statusLabel: 'Converted', colorScheme: 'emerald' };
  }
  if (stage === 'lost') {
    return { priority: null, buttonLabel: '', statusLabel: 'Lost', colorScheme: 'stone' };
  }

  // BOOKED COLUMN: new + confirmed (pre-consult)
  // Using amber for new bookings to create a warm, inviting feel that matches the Take Action modal
  if (stage === 'new') {
    const hoursSinceCreated = (Date.now() - new Date(consultation.createdAt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreated >= 4) {
      return { priority: 'due', buttonLabel: 'Send Confirmation', statusLabel: 'Awaiting confirmation', colorScheme: 'amber' };
    }
    return { priority: 'upcoming', buttonLabel: 'Send Confirmation', statusLabel: 'New booking', colorScheme: 'amber' };
  }

  if (stage === 'confirmed') {
    const timeInfo = getTimeUntilConsult(datetime, consultation.duration);
    // Post-consult: time has passed, needs Mark Outcome
    if (timeInfo.level === 'past') {
      return { priority: 'due', buttonLabel: 'Mark Outcome', statusLabel: 'Consult ended', colorScheme: 'amber' };
    }
    // Currently in session
    if (timeInfo.isActive) {
      return { priority: 'due', buttonLabel: 'Mark Outcome', statusLabel: 'In session', colorScheme: 'amber' };
    }
    // Pre-consult: confirmed and waiting for consultation - use upcoming priority for consistent styling
    return { priority: 'upcoming', buttonLabel: 'Manage', statusLabel: 'Confirmed', colorScheme: 'amber' };
  }

  // POST-CONSULT COLUMN: consult_complete + no_show
  if (stage === 'consult_complete') {
    // Consult time has passed - clinician needs to record did they show up or not
    const daysSince = getDaysSince(datetime);
    if (daysSince >= 2) {
      return { priority: 'due', buttonLabel: 'Mark Outcome', statusLabel: 'Overdue', colorScheme: 'amber' };
    }
    return { priority: 'due', buttonLabel: 'Mark Outcome', statusLabel: 'Consult ended', colorScheme: 'amber' };
  }

  if (stage === 'no_show') {
    // Use config-based intervals from settings
    const intervals = getFollowUpIntervals('no_show', pipelineConfig);
    const dueInfo = getNextFollowUpDue(intervals, followUpCount, lastFollowUpDate, consultation.stageEnteredAt);
    const totalFollowUps = intervals.length;

    if (followUpCount >= totalFollowUps) {
      // All follow-ups exhausted
      return { priority: 'due', buttonLabel: 'Manage', statusLabel: 'All sent', colorScheme: 'amber' };
    }

    if (!dueInfo) {
      return { priority: 'reactive', buttonLabel: 'Manage', statusLabel: `${followUpCount}/${totalFollowUps} sent`, colorScheme: 'amber' };
    }

    // Determine priority based on due date
    const priority = dueInfo.isOverdue ? 'due' : (dueInfo.hoursUntilDue < 4 ? 'due' : 'upcoming');
    const absHours = Math.abs(dueInfo.hoursUntilDue);
    const roundedAbsHours = Math.round(absHours);

    // If within ~30 min of due time, show "Due now" regardless of slight over/under
    const statusLabel = roundedAbsHours < 1
      ? 'Due now'
      : dueInfo.isOverdue
        ? 'Update overdue'
        : `Due in ${roundedAbsHours}h`;

    return { priority, buttonLabel: 'Manage', statusLabel, colorScheme: 'amber' };
  }

  // INTAKE COLUMN: intake_pending
  // Use config-based intervals from settings
  if (stage === 'intake_pending') {
    const intervals = getFollowUpIntervals('intake_pending', pipelineConfig);
    const dueInfo = getNextFollowUpDue(intervals, followUpCount, lastFollowUpDate, consultation.stageEnteredAt);
    const totalFollowUps = intervals.length;

    if (followUpCount >= totalFollowUps) {
      // All follow-ups exhausted
      return { priority: 'due', buttonLabel: 'Manage', statusLabel: 'All sent', colorScheme: 'amber' };
    }

    if (!dueInfo) {
      return { priority: 'reactive', buttonLabel: 'Manage', statusLabel: `${followUpCount}/${totalFollowUps} sent`, colorScheme: 'amber' };
    }

    // Determine priority based on due date
    const priority = dueInfo.isOverdue ? 'due' : (dueInfo.hoursUntilDue < 4 ? 'due' : 'upcoming');
    const absHours = Math.abs(dueInfo.hoursUntilDue);
    const roundedAbsHours = Math.round(absHours);

    // If within ~30 min of due time, show "Due now" regardless of slight over/under
    const statusLabel = roundedAbsHours < 1
      ? 'Due now'
      : dueInfo.isOverdue
        ? 'Update overdue'
        : absHours < 24
          ? `Due in ${roundedAbsHours}h`
          : `Due in ${Math.round(absHours / 24)}d`;

    return { priority, buttonLabel: 'Manage', statusLabel, colorScheme: 'amber' };
  }

  // PAPERWORK COLUMN: intake_scheduled + paperwork_pending
  // Paperwork reminders are relative to intake date (T-72hr, T-24hr, etc.)
  // These intervals count DOWN to intake, not up from stage entry
  if (stage === 'intake_scheduled' || stage === 'paperwork_pending') {
    if (!consultation.intakeScheduledDate) {
      return { priority: 'reactive', buttonLabel: 'Manage', statusLabel: 'Scheduled', colorScheme: 'amber' };
    }

    const intervals = getFollowUpIntervals('paperwork', pipelineConfig);
    const totalReminders = intervals.length;
    const intakeDate = new Date(consultation.intakeScheduledDate);
    const now = new Date();
    const hoursUntilIntake = (intakeDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Intake already passed
    if (hoursUntilIntake <= 0) {
      return { priority: 'due', buttonLabel: 'Manage', statusLabel: 'Intake completed', colorScheme: 'amber' };
    }

    // All reminders sent - just waiting
    if (followUpCount >= totalReminders) {
      return { priority: 'reactive', buttonLabel: 'Manage', statusLabel: 'All reminders sent', colorScheme: 'amber' };
    }

    // Find the next reminder threshold (e.g., 72hr, then 24hr before intake)
    const nextReminderThreshold = intervals[followUpCount]; // hours before intake

    // Is this reminder due? (current time is past the threshold)
    if (hoursUntilIntake <= nextReminderThreshold) {
      return { priority: 'due', buttonLabel: 'Manage', statusLabel: 'Due now', colorScheme: 'amber' };
    }

    // Upcoming - next reminder is within 12 hours of being due
    const hoursUntilReminderDue = hoursUntilIntake - nextReminderThreshold;
    if (hoursUntilReminderDue <= 12) {
      return { priority: 'upcoming', buttonLabel: 'Manage', statusLabel: `Due in ${Math.round(hoursUntilReminderDue)}h`, colorScheme: 'amber' };
    }

    return { priority: 'reactive', buttonLabel: 'Manage', statusLabel: 'Awaiting paperwork', colorScheme: 'amber' };
  }

  // FIRST SESSION COLUMN: paperwork_complete
  if (stage === 'paperwork_complete') {
    if (consultation.firstSessionDate) {
      const sessionTime = getTimeUntilConsult(consultation.firstSessionDate);
      if (sessionTime.level === 'past') {
        return { priority: 'due', buttonLabel: 'Mark Converted', statusLabel: 'Session completed', colorScheme: 'emerald' };
      }
      return { priority: null, buttonLabel: '', statusLabel: 'Session upcoming', colorScheme: 'emerald' };
    }
    return { priority: 'reactive', buttonLabel: 'Mark Converted', statusLabel: 'Ready for session', colorScheme: 'emerald' };
  }

  return { priority: null, buttonLabel: '', statusLabel: '', colorScheme: 'stone' };
};

const consultationNeedsAction = (c: Consultation): boolean => {
  if (c.stage === 'converted' || c.stage === 'lost') return false;
  if (c.stage === 'confirmed' && !isConsultationPast(c.datetime)) return false;
  return getNextAction(c) !== null;
};

// -----------------------------------------------------------------------------
// FILTER TYPES
// -----------------------------------------------------------------------------

type FilterMode = 'all' | 'needs_action';

// -----------------------------------------------------------------------------
// CLINICIAN DROPDOWN
// -----------------------------------------------------------------------------

interface ClinicianDropdownProps {
  clinicians: string[];
  selectedClinician: string | null;
  onSelect: (clinician: string | null) => void;
}

const ClinicianDropdown: React.FC<ClinicianDropdownProps> = ({
  clinicians,
  selectedClinician,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium transition-all
          ${selectedClinician
            ? 'bg-stone-800 text-white'
            : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
          }
        `}
      >
        <User size={14} strokeWidth={1.5} />
        <span className="max-w-[100px] truncate">
          {selectedClinician || 'All'}
        </span>
        <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
            className="absolute top-full left-0 mt-2 z-50 min-w-[220px] rounded-2xl border border-stone-200/80 bg-white overflow-hidden"
            style={{ boxShadow: '0 20px 40px -12px rgba(0,0,0,0.15)' }}
          >
            <div className="p-2">
              <button
                onClick={() => { onSelect(null); setIsOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-colors
                  ${!selectedClinician ? 'bg-amber-50 text-stone-900' : 'text-stone-600 hover:bg-stone-50'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${!selectedClinician ? 'bg-amber-100' : 'bg-stone-100'}`}>
                  <Users size={14} className={!selectedClinician ? 'text-amber-700' : 'text-stone-500'} />
                </div>
                <span className="font-medium">All Clinicians</span>
                {!selectedClinician && <Check size={14} className="ml-auto text-amber-600" />}
              </button>

              {clinicians.length > 0 && <div className="my-2 mx-3 h-px bg-stone-100" />}

              <div className="max-h-[240px] overflow-y-auto">
                {clinicians.map((clinician) => (
                  <button
                    key={clinician}
                    onClick={() => { onSelect(clinician); setIsOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-colors
                      ${selectedClinician === clinician ? 'bg-amber-50 text-stone-900' : 'text-stone-600 hover:bg-stone-50'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold
                      ${selectedClinician === clinician ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-600'}`}>
                      {clinician.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <span className="font-medium truncate">{clinician}</span>
                    {selectedClinician === clinician && <Check size={14} className="ml-auto text-amber-600" />}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// -----------------------------------------------------------------------------
// KANBAN CARD
// -----------------------------------------------------------------------------
// Redesigned with consistent date/time display:
// - Always shows a "Context Row" with relevant date info in the same location
// - Larger, more informative cards
// - Clear visual hierarchy: Name → Clinician → Date/Context → Status → Action

interface KanbanCardProps {
  consultation: Consultation;
  onTakeAction: () => void;
  onClick: () => void;
  pipelineConfig: ConsultationPipelineConfig;
}

// Helper to get consistent date context for each stage
// Shows WHEN THE TASK IS DUE, not historical info
interface DateContext {
  icon: 'calendar' | 'clock';
  label: string;
  sublabel?: string;
  urgency: 'imminent' | 'urgent' | 'normal' | 'past';
}

const getDateContext = (consultation: Consultation, timeInfo: TimeUntilConsult, pipelineConfig: ConsultationPipelineConfig): DateContext => {
  const { stage, datetime, intakeScheduledDate, intakeHasTime, firstSessionDate, followUpCount, lastFollowUpDate } = consultation;
  const consultDate = new Date(datetime);
  const now = new Date();

  // Format helpers
  const formatDate = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const formatTime = (d: Date) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Helper to format time until a due date
  const formatDueIn = (dueDate: Date): { label: string; urgency: 'imminent' | 'urgent' | 'normal' } => {
    const diffMs = dueDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffMs <= 0) {
      return { label: 'Due now', urgency: 'imminent' };
    }
    if (diffHours < 1) {
      const mins = Math.round(diffMs / (1000 * 60));
      return { label: `Due in ${mins}m`, urgency: 'imminent' };
    }
    if (diffHours < 24) {
      const hours = Math.round(diffHours);
      return { label: `Due in ${hours}h`, urgency: 'urgent' };
    }
    const days = Math.round(diffHours / 24);
    return { label: `Due in ${days}d`, urgency: 'normal' };
  };

  // BOOKED COLUMN: new - Shows consultation scheduled date with "Consult:" prefix
  if (stage === 'new') {
    const isToday = consultDate.toDateString() === now.toDateString();
    const isTomorrow = consultDate.toDateString() === tomorrow.toDateString();

    if (isToday) {
      return { icon: 'calendar', label: 'Consult today', sublabel: formatTime(consultDate), urgency: 'urgent' };
    }
    if (isTomorrow) {
      return { icon: 'calendar', label: 'Consult tomorrow', sublabel: formatTime(consultDate), urgency: 'normal' };
    }
    return { icon: 'calendar', label: `Consult ${formatDate(consultDate)}`, sublabel: formatTime(consultDate), urgency: 'normal' };
  }

  // BOOKED COLUMN: confirmed (pre-consult) - Shows the consultation date/time
  if (stage === 'confirmed' && timeInfo.level !== 'past' && !timeInfo.isActive) {
    const isToday = consultDate.toDateString() === now.toDateString();
    const isTomorrow = consultDate.toDateString() === tomorrow.toDateString();

    if (timeInfo.isActive) {
      return { icon: 'clock', label: 'Happening now', urgency: 'imminent' };
    }
    if (timeInfo.level === 'imminent') {
      return { icon: 'clock', label: `Starting in ${timeInfo.label}`, urgency: 'imminent' };
    }
    if (timeInfo.level === 'soon') {
      return { icon: 'clock', label: `In ${timeInfo.label}`, sublabel: formatTime(consultDate), urgency: 'urgent' };
    }
    if (isToday) {
      return { icon: 'calendar', label: 'Today', sublabel: formatTime(consultDate), urgency: 'urgent' };
    }
    if (isTomorrow) {
      return { icon: 'calendar', label: 'Tomorrow', sublabel: formatTime(consultDate), urgency: 'normal' };
    }
    return { icon: 'calendar', label: formatDate(consultDate), sublabel: formatTime(consultDate), urgency: 'normal' };
  }

  // POST-CONSULT: confirmed (past) - Mark Outcome is due now
  if (stage === 'confirmed' && (timeInfo.level === 'past' || timeInfo.isActive)) {
    return { icon: 'clock', label: 'Due now', urgency: 'imminent' };
  }

  // POST-CONSULT: consult_complete - Follow-up is due now
  if (stage === 'consult_complete') {
    return { icon: 'clock', label: 'Due now', urgency: 'imminent' };
  }

  // POST-CONSULT: no_show - Use config-based recovery schedule
  if (stage === 'no_show') {
    const intervals = getFollowUpIntervals('no_show', pipelineConfig);
    const dueInfo = getNextFollowUpDue(intervals, followUpCount, lastFollowUpDate, consultation.stageEnteredAt);
    const totalRecovery = intervals.length;

    if (followUpCount >= totalRecovery) {
      // All recovery attempts exhausted - decision time
      return { icon: 'clock', label: 'Decision needed', sublabel: 'All recovery sent', urgency: 'imminent' };
    }

    if (!dueInfo) {
      return { icon: 'clock', label: 'Recovery pending', urgency: 'normal' };
    }

    const recoveryNumber = followUpCount + 1;
    const sublabel = `Recovery ${recoveryNumber} of ${totalRecovery}`;
    const absHours = Math.abs(dueInfo.hoursUntilDue);
    const roundedAbsHours = Math.round(absHours);

    // If within ~30 min of due time, show "Due now" regardless of slight over/under
    if (roundedAbsHours < 1) {
      return { icon: 'clock', label: 'Due now', sublabel, urgency: 'imminent' };
    }
    if (dueInfo.isOverdue) {
      return { icon: 'clock', label: 'Update overdue', sublabel, urgency: 'imminent' };
    }
    if (absHours < 24) {
      return { icon: 'clock', label: `Due in ${roundedAbsHours}h`, sublabel, urgency: 'urgent' };
    }
    return { icon: 'clock', label: `Due in ${Math.round(absHours / 24)}d`, sublabel, urgency: 'normal' };
  }

  // INTAKE COLUMN: intake_pending
  // Use config-based follow-up schedule
  if (stage === 'intake_pending') {
    const intervals = getFollowUpIntervals('intake_pending', pipelineConfig);
    const dueInfo = getNextFollowUpDue(intervals, followUpCount, lastFollowUpDate, consultation.stageEnteredAt);
    const totalFollowUps = intervals.length;

    if (followUpCount >= totalFollowUps) {
      // All follow-ups exhausted - decision time
      return { icon: 'clock', label: 'Decision needed', sublabel: 'All reminders sent', urgency: 'imminent' };
    }

    if (!dueInfo) {
      return { icon: 'clock', label: 'Follow up pending', urgency: 'normal' };
    }

    const followUpNumber = followUpCount + 1;
    const sublabel = `Follow-up ${followUpNumber} of ${totalFollowUps}`;
    const absHours = Math.abs(dueInfo.hoursUntilDue);
    const roundedAbsHours = Math.round(absHours);

    // If within ~30 min of due time, show "Due now" regardless of slight over/under
    if (roundedAbsHours < 1) {
      return { icon: 'clock', label: 'Due now', sublabel, urgency: 'imminent' };
    }
    if (dueInfo.isOverdue) {
      return { icon: 'clock', label: 'Update overdue', sublabel, urgency: 'imminent' };
    }
    if (absHours < 24) {
      return { icon: 'clock', label: `Due in ${roundedAbsHours}h`, sublabel, urgency: 'urgent' };
    }
    return { icon: 'clock', label: `Due in ${Math.round(absHours / 24)}d`, sublabel, urgency: 'normal' };
  }

  // PAPERWORK COLUMN: intake_scheduled, paperwork_pending
  // Paperwork reminders count DOWN to intake (T-72hr, T-24hr, etc.)
  if (stage === 'intake_scheduled' || stage === 'paperwork_pending') {
    if (!intakeScheduledDate) {
      return { icon: 'calendar', label: 'Intake scheduled', sublabel: 'Date pending', urgency: 'normal' };
    }

    const intervals = getFollowUpIntervals('paperwork', pipelineConfig);
    const totalReminders = intervals.length;
    const intakeDate = new Date(intakeScheduledDate);
    const hoursUntilIntake = (intakeDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Intake already passed
    if (hoursUntilIntake <= 0) {
      return { icon: 'clock', label: 'Intake completed', sublabel: 'Mark paperwork done', urgency: 'imminent' };
    }

    // All reminders sent
    if (followUpCount >= totalReminders) {
      const intakeIsToday = intakeDate.toDateString() === now.toDateString();
      const intakeIsTomorrow = intakeDate.toDateString() === tomorrow.toDateString();
      if (intakeIsToday) {
        return { icon: 'calendar', label: 'Intake today', sublabel: intakeHasTime ? formatTime(intakeDate) : 'Time TBD', urgency: 'imminent' };
      }
      if (intakeIsTomorrow) {
        return { icon: 'calendar', label: 'Intake tomorrow', sublabel: intakeHasTime ? formatTime(intakeDate) : 'Time TBD', urgency: 'urgent' };
      }
      return { icon: 'calendar', label: `Intake ${formatDate(intakeDate)}`, sublabel: 'All reminders sent', urgency: 'normal' };
    }

    // Check if current reminder is due
    const nextReminderThreshold = intervals[followUpCount];
    const sublabel = `Follow-up ${followUpCount + 1} of ${totalReminders}`;

    if (hoursUntilIntake <= nextReminderThreshold) {
      // Reminder is due now
      return { icon: 'clock', label: 'Due now', sublabel, urgency: 'imminent' };
    }

    // Show time until reminder is due
    const hoursUntilReminderDue = hoursUntilIntake - nextReminderThreshold;
    if (hoursUntilReminderDue < 1) {
      return { icon: 'clock', label: 'Due now', sublabel, urgency: 'imminent' };
    }
    if (hoursUntilReminderDue < 24) {
      return { icon: 'clock', label: `Due in ${Math.round(hoursUntilReminderDue)}h`, sublabel, urgency: 'urgent' };
    }
    return { icon: 'clock', label: `Due in ${Math.round(hoursUntilReminderDue / 24)}d`, sublabel, urgency: 'normal' };
  }

  // FIRST SESSION COLUMN: paperwork_complete
  // Show the first session date/time
  if (stage === 'paperwork_complete') {
    if (firstSessionDate) {
      const sessionDate = new Date(firstSessionDate);
      const sessionIsToday = sessionDate.toDateString() === now.toDateString();
      const sessionIsTomorrow = sessionDate.toDateString() === tomorrow.toDateString();
      const sessionTimeInfo = getTimeUntilConsult(firstSessionDate);

      if (sessionTimeInfo.level === 'past') {
        return { icon: 'clock', label: 'Due now', sublabel: 'Session completed', urgency: 'imminent' };
      }
      if (sessionIsToday) {
        return { icon: 'calendar', label: 'Session today', sublabel: formatTime(sessionDate), urgency: 'imminent' };
      }
      if (sessionIsTomorrow) {
        return { icon: 'calendar', label: 'Session tomorrow', sublabel: formatTime(sessionDate), urgency: 'normal' };
      }
      return { icon: 'calendar', label: `Session ${formatDate(sessionDate)}`, sublabel: formatTime(sessionDate), urgency: 'normal' };
    }
    return { icon: 'calendar', label: 'Awaiting session', sublabel: 'Paperwork complete', urgency: 'normal' };
  }

  return { icon: 'calendar', label: formatDate(consultDate), urgency: 'normal' };
};

const KanbanCard: React.FC<KanbanCardProps> = ({
  consultation,
  onTakeAction,
  onClick,
  pipelineConfig,
}) => {
  const [timeInfo, setTimeInfo] = useState<TimeUntilConsult>(() =>
    getTimeUntilConsult(consultation.datetime, consultation.duration)
  );

  useEffect(() => {
    if (consultation.stage !== 'confirmed') return;
    const updateTime = () => setTimeInfo(getTimeUntilConsult(consultation.datetime, consultation.duration));
    updateTime();
    const interval = timeInfo.level === 'imminent' || timeInfo.level === 'soon' ? 10000 : 30000;
    const timer = setInterval(updateTime, interval);
    return () => clearInterval(timer);
  }, [consultation.datetime, consultation.duration, consultation.stage, timeInfo.level]);

  const isConfirmed = consultation.stage === 'confirmed';
  const isNewBooking = consultation.stage === 'new';
  const isPreConsult = isConfirmed || isNewBooking;
  const isImminent = isConfirmed && (timeInfo.level === 'imminent' || timeInfo.level === 'soon');
  const isConsultPast = isConfirmed && (timeInfo.level === 'past' || timeInfo.isActive);

  const hasVideoLink = consultation.meetingType === 'google_meet' || consultation.meetingType === 'zoom';
  const isPhoneCall = consultation.meetingType === 'phone';
  // Show join button for confirmed consultations that haven't passed
  const showJoinButton = isConfirmed && !isConsultPast;
  // Join is always active now - let users access the link anytime
  const isJoinActive = true;

  const actionInfo = getActionInfo(consultation, pipelineConfig);
  const { priority: actionPriority, buttonLabel, statusLabel, colorScheme } = actionInfo;
  const showActionButton = actionPriority !== null;

  const dateContext = getDateContext(consultation, timeInfo, pipelineConfig);

  // Card background - clean white for all cards
  const getCardBg = () => 'bg-white';

  // Border color - neutral for all cards
  const getBorderColor = () => 'border-stone-200/80';

  // Get button styles based on colorScheme and priority
  // Primary action uses dark stone gradient (design system standard)
  const getButtonStyles = () => {
    if (actionPriority === 'due') {
      const schemes: Record<string, string> = {
        rose: 'bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600 shadow-sm shadow-rose-500/20',
        amber: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-sm shadow-amber-500/20',
        violet: 'bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:from-violet-600 hover:to-purple-600 shadow-sm shadow-violet-500/20',
        emerald: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-sm shadow-emerald-500/20',
        cyan: 'bg-gradient-to-r from-cyan-500 to-sky-500 text-white hover:from-cyan-600 hover:to-sky-600 shadow-sm shadow-cyan-500/20',
        stone: 'bg-stone-900 text-white hover:bg-stone-800',
      };
      return schemes[colorScheme] || schemes.stone;
    }
    if (actionPriority === 'upcoming') {
      const schemes: Record<string, string> = {
        rose: 'bg-rose-100 text-rose-700 hover:bg-rose-200',
        amber: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
        violet: 'bg-violet-100 text-violet-700 hover:bg-violet-200',
        emerald: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
        cyan: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200',
        stone: 'bg-stone-900 text-white hover:bg-stone-800',
      };
      return schemes[colorScheme] || schemes.stone;
    }
    // Reactive priority - use dark design system style for primary CTA
    return 'bg-stone-900 text-white hover:bg-stone-800';
  };

  // Get avatar styles - consistent neutral styling
  const getAvatarStyles = () => 'bg-stone-100 text-stone-600';

  // Get date context row styles
  const getDateContextStyles = () => {
    if (dateContext.urgency === 'imminent') return 'bg-amber-100/80 text-amber-800 border-amber-200/60';
    if (dateContext.urgency === 'urgent') return 'bg-stone-100 text-stone-700 border-stone-200/60';
    if (dateContext.urgency === 'past') return 'bg-stone-50 text-stone-500 border-stone-100';
    return 'bg-stone-50/80 text-stone-600 border-stone-100';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4, scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      onClick={onClick}
      className={`
        group relative rounded-2xl border cursor-pointer transition-all duration-200
        hover:shadow-lg hover:shadow-stone-900/5 hover:-translate-y-0.5
        ${getCardBg()} ${getBorderColor()}
      `}
    >
      <div className="p-5">
        {/* Header: Avatar + Name + Clinician */}
        <div className="flex items-start gap-3.5 mb-4">
          <div className={`
            w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors
            ${getAvatarStyles()}
          `}>
            {getClientInitials(consultation.firstName, consultation.lastName)}
          </div>

          <div className="flex-1 min-w-0">
            <h4
              className="text-lg font-semibold text-stone-900 truncate leading-tight"
              style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
            >
              {formatClientName(consultation.firstName, consultation.lastName)}
            </h4>
            <p className="text-sm text-stone-500 truncate mt-0.5">
              {consultation.clinicianName}
            </p>
          </div>

          {/* Transferred badge - moved to header */}
          {consultation.wasTransferred && (
            <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
              Transferred
            </span>
          )}
        </div>

        {/* Date Context Row - CONSISTENT across all stages */}
        <div className={`
          flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl mb-4 border
          ${getDateContextStyles()}
        `}>
          {dateContext.icon === 'calendar' ? (
            <Calendar size={15} strokeWidth={1.5} className="flex-shrink-0 opacity-70" />
          ) : (
            <Clock size={15} strokeWidth={1.5} className="flex-shrink-0 opacity-70" />
          )}
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium">{dateContext.label}</span>
            {dateContext.sublabel && (
              <span className="text-sm opacity-70 ml-1.5">· {dateContext.sublabel}</span>
            )}
          </div>
        </div>

        {/* Status Row */}
        <div className="mb-4">
          <p className={`text-sm font-medium ${
            actionPriority === 'due'
              ? colorScheme === 'rose' ? 'text-rose-700'
              : colorScheme === 'amber' ? 'text-amber-700'
              : colorScheme === 'violet' ? 'text-violet-700'
              : colorScheme === 'emerald' ? 'text-emerald-700'
              : colorScheme === 'cyan' ? 'text-cyan-700'
              : 'text-rose-700'
              : actionPriority === 'upcoming'
                ? 'text-amber-600'
                : 'text-stone-500'
          }`}>
            {statusLabel || 'No action needed'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Join button for pre-consult - always clickable */}
          {showJoinButton && hasVideoLink && consultation.meetingLink && (
            <a
              href={consultation.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all border-2 border-stone-300 text-stone-600 hover:border-stone-400 hover:bg-stone-50"
            >
              <Video size={16} strokeWidth={1.5} />
              Join Consult
            </a>
          )}

          {showJoinButton && isPhoneCall && consultation.meetingPhone && (
            <a
              href={`tel:${consultation.meetingPhone}`}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all border-2 border-stone-300 text-stone-600 hover:border-stone-400 hover:bg-stone-50"
            >
              <PhoneCall size={16} strokeWidth={1.5} />
              Call Client
            </a>
          )}

          {/* Action button */}
          {showActionButton && (
            <button
              onClick={(e) => { e.stopPropagation(); onTakeAction(); }}
              className={`
                flex-1 px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all
                ${getButtonStyles()}
              `}
            >
              {buttonLabel}
              <ArrowRight size={15} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// -----------------------------------------------------------------------------
// KANBAN COLUMN
// -----------------------------------------------------------------------------

interface KanbanColumnComponentProps {
  column: KanbanColumn;
  consultations: Consultation[];
  onTakeAction: (consultation: Consultation) => void;
  onSelectConsultation: (consultation: Consultation) => void;
  pipelineConfig: ConsultationPipelineConfig;
}

const KanbanColumnComponent: React.FC<KanbanColumnComponentProps> = ({
  column,
  consultations,
  onTakeAction,
  onSelectConsultation,
  pipelineConfig,
}) => {
  const dueCount = consultations.filter(c => getActionInfo(c, pipelineConfig).priority === 'due').length;
  const upcomingCount = consultations.filter(c => getActionInfo(c, pipelineConfig).priority === 'upcoming').length;
  const actionCount = dueCount + upcomingCount;

  return (
    <div
      className="flex flex-col h-full flex-1 min-w-[340px] rounded-2xl overflow-hidden bg-white/90 border border-stone-200/60 backdrop-blur-sm"
      style={{ boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.06)' }}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-stone-100 bg-stone-50/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3
              className="text-lg font-semibold tracking-tight text-stone-800"
              style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
            >
              {column.title}
            </h3>

            {/* Count badge */}
            <span className="px-2 py-0.5 text-sm font-semibold rounded-full tabular-nums bg-stone-100 text-stone-600">
              {consultations.length}
            </span>
          </div>

          {/* Action indicator */}
          {actionCount > 0 && (
            <div className="flex items-center gap-1.5">
              {dueCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-400" />
              )}
              {dueCount === 0 && upcomingCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              )}
              <span className="text-xs font-medium text-stone-500">{actionCount} pending</span>
            </div>
          )}
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <AnimatePresence mode="popLayout">
          {consultations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 bg-stone-100">
                <span className="text-lg text-stone-300">∅</span>
              </div>
              <p className="text-sm text-stone-400">No clients</p>
            </motion.div>
          ) : (
            consultations.map((consultation) => (
              <KanbanCard
                key={consultation.id}
                consultation={consultation}
                onTakeAction={() => onTakeAction(consultation)}
                onClick={() => onSelectConsultation(consultation)}
                pipelineConfig={pipelineConfig}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------------

export const ConsultationsKanban: React.FC<ConsultationsKanbanProps> = ({
  consultations,
  onTakeAction,
  onSelectConsultation,
}) => {
  const { settings } = useSettings();
  const pipelineConfig = settings.consultationPipeline;

  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [selectedClinician, setSelectedClinician] = useState<string | null>(null);

  const clinicians = useMemo(() => {
    const names = new Set(consultations.map(c => c.clinicianName));
    return Array.from(names).sort();
  }, [consultations]);

  // Filter out converted and lost consultations - they're done and shouldn't appear in the pipeline
  const activeConsultations = useMemo(() => {
    return consultations.filter(c => c.stage !== 'converted' && c.stage !== 'lost');
  }, [consultations]);

  const filteredConsultations = useMemo(() => {
    let result = activeConsultations;
    if (selectedClinician) result = result.filter(c => c.clinicianName === selectedClinician);
    if (filterMode === 'needs_action') result = result.filter(consultationNeedsAction);
    return result;
  }, [activeConsultations, filterMode, selectedClinician]);

  const counts = useMemo(() => {
    let base = selectedClinician ? activeConsultations.filter(c => c.clinicianName === selectedClinician) : activeConsultations;
    return {
      all: base.length,
      needsAction: base.filter(consultationNeedsAction).length,
    };
  }, [activeConsultations, selectedClinician]);

  // Helper to determine effective column for a consultation
  // Key logic: confirmed consultations that are past their time go to post-consult
  const getEffectiveColumn = (c: Consultation): string => {
    if (c.stage === 'confirmed') {
      const timeInfo = getTimeUntilConsult(c.datetime, c.duration);
      // If consult time has passed or is active, it belongs in post-consult
      if (timeInfo.level === 'past' || timeInfo.isActive) {
        return 'post-consult';
      }
      return 'booked';
    }
    // For all other stages, find the column that contains the stage
    const column = KANBAN_COLUMNS.find(col => col.stages.includes(c.stage));
    return column?.id || 'booked';
  };

  const columnData = useMemo(() => {
    return KANBAN_COLUMNS.map(column => ({
      ...column,
      consultations: filteredConsultations
        .filter(c => getEffectiveColumn(c) === column.id)
        .sort((a, b) => {
          // For pre-consult confirmed, sort by urgency
          if (a.stage === 'confirmed' && b.stage === 'confirmed') {
            const aTime = getTimeUntilConsult(a.datetime, a.duration);
            const bTime = getTimeUntilConsult(b.datetime, b.duration);
            const order: Record<UrgencyLevel, number> = { imminent: 0, soon: 1, today: 2, tomorrow: 3, future: 4, past: 5 };
            if (order[aTime.level] !== order[bTime.level]) return order[aTime.level] - order[bTime.level];
            return aTime.minutes - bTime.minutes;
          }
          // For all others, sort by action priority
          const aInfo = getActionInfo(a, pipelineConfig);
          const bInfo = getActionInfo(b, pipelineConfig);
          const pOrder = { due: 0, upcoming: 1, reactive: 2, null: 3 };
          const aPriority = pOrder[aInfo.priority ?? 'null'];
          const bPriority = pOrder[bInfo.priority ?? 'null'];
          if (aPriority !== bPriority) return aPriority - bPriority;
          return new Date(a.datetime).getTime() - new Date(b.datetime).getTime();
        }),
    }));
  }, [filteredConsultations, pipelineConfig]);

  return (
    <div
      className="h-full flex flex-col min-w-fit"
      style={{
        background: 'linear-gradient(180deg, #fafaf9 0%, #f5f5f4 100%)',
      }}
    >
      {/* Header */}
      <div className="px-6 py-5 border-b border-stone-200/80 bg-white/80 backdrop-blur-sm flex-shrink-0 relative z-50">
        <div className="flex items-center gap-5">
          <h2
            className="text-2xl font-semibold text-stone-900 tracking-tight"
            style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
          >
            Pipeline
          </h2>

          <div className="w-px h-6 bg-stone-200" />

          {/* Filter pills */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterMode('all')}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all
                ${filterMode === 'all'
                  ? 'bg-stone-900 text-white'
                  : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
                }
              `}
            >
              All
              <span className={`ml-2 ${filterMode === 'all' ? 'text-stone-400' : 'text-stone-400'}`}>
                {counts.all}
              </span>
            </button>
            <button
              onClick={() => setFilterMode('needs_action')}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all
                ${filterMode === 'needs_action'
                  ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-sm shadow-rose-500/20'
                  : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
                }
              `}
            >
              Needs action
              {counts.needsAction > 0 && (
                <span className={`ml-2 ${filterMode === 'needs_action' ? 'text-white/80' : 'text-rose-500 font-semibold'}`}>
                  {counts.needsAction}
                </span>
              )}
            </button>
          </div>

          <div className="w-px h-6 bg-stone-200" />

          <ClinicianDropdown
            clinicians={clinicians}
            selectedClinician={selectedClinician}
            onSelect={setSelectedClinician}
          />
        </div>

        {/* Active filters */}
        {(selectedClinician || filterMode === 'needs_action') && (
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-stone-100">
            <span className="text-xs text-stone-400 uppercase tracking-wide">Showing</span>
            <div className="flex items-center gap-2">
              {filterMode === 'needs_action' && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 text-sm font-medium">
                  Needs action
                  <button
                    onClick={() => setFilterMode('all')}
                    className="hover:bg-rose-100 rounded-full p-0.5 transition-colors"
                  >
                    <X size={12} strokeWidth={2.5} />
                  </button>
                </span>
              )}
              {selectedClinician && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 text-stone-700 text-sm font-medium">
                  {selectedClinician}
                  <button
                    onClick={() => setSelectedClinician(null)}
                    className="hover:bg-stone-200 rounded-full p-0.5 transition-colors"
                  >
                    <X size={12} strokeWidth={2.5} />
                  </button>
                </span>
              )}
            </div>
            <button
              onClick={() => { setFilterMode('all'); setSelectedClinician(null); }}
              className="ml-auto text-sm text-stone-400 hover:text-stone-600 transition-colors"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Columns */}
      <div className="flex-1 overflow-y-hidden">
        <div className="flex gap-4 p-5 h-full min-w-[1800px]">
          {columnData.map((column) => (
            <KanbanColumnComponent
              key={column.id}
              column={column}
              consultations={column.consultations}
              onTakeAction={onTakeAction}
              onSelectConsultation={onSelectConsultation}
              pipelineConfig={pipelineConfig}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConsultationsKanban;
export { KANBAN_COLUMNS };
