import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Check,
  Clock,
  Phone,
  Video,
  ChevronRight,
  Sparkles,
  X,
  ArrowRight,
  ChevronDown,
  User,
  Users,
  Zap,
  PhoneCall,
} from 'lucide-react';
import type {
  Consultation,
  ConsultationStage,
} from '../types/consultations';
import {
  formatConsultationDate,
  getNextAction,
  getClientInitials,
  isConsultationPast,
  isConsultationToday,
  getDaysSince,
} from '../types/consultations';

// -----------------------------------------------------------------------------
// URGENCY HELPERS - Time-based visual states for confirmed consults
// -----------------------------------------------------------------------------

type UrgencyLevel = 'imminent' | 'soon' | 'today' | 'tomorrow' | 'future' | 'past';

interface TimeUntilConsult {
  level: UrgencyLevel;
  label: string;
  minutes: number;
  isActive: boolean; // Whether the consult window is currently active
}

const getTimeUntilConsult = (datetime: string, duration: number = 15): TimeUntilConsult => {
  const now = new Date();
  const consultTime = new Date(datetime);
  const consultEndTime = new Date(consultTime.getTime() + duration * 60 * 1000);
  const diffMs = consultTime.getTime() - now.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  // Check if consult is currently happening
  if (now >= consultTime && now <= consultEndTime) {
    return {
      level: 'imminent',
      label: 'Happening now',
      minutes: 0,
      isActive: true,
    };
  }

  // Past consult
  if (diffMs < 0) {
    return {
      level: 'past',
      label: 'Past',
      minutes: diffMinutes,
      isActive: false,
    };
  }

  // Within 15 minutes - imminent
  if (diffMinutes <= 15) {
    return {
      level: 'imminent',
      label: diffMinutes <= 1 ? 'Starting now' : `In ${diffMinutes} min`,
      minutes: diffMinutes,
      isActive: false,
    };
  }

  // Within 1 hour - soon
  if (diffMinutes <= 60) {
    return {
      level: 'soon',
      label: `In ${diffMinutes} min`,
      minutes: diffMinutes,
      isActive: false,
    };
  }

  // Within 4 hours - today (urgent-ish)
  if (diffMinutes <= 240) {
    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    return {
      level: 'today',
      label: mins > 0 ? `In ${hours}h ${mins}m` : `In ${hours}h`,
      minutes: diffMinutes,
      isActive: false,
    };
  }

  // Later today
  const isToday = consultTime.toDateString() === now.toDateString();
  if (isToday) {
    const timeStr = consultTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    return {
      level: 'today',
      label: `Today, ${timeStr}`,
      minutes: diffMinutes,
      isActive: false,
    };
  }

  // Tomorrow
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = consultTime.toDateString() === tomorrow.toDateString();
  if (isTomorrow) {
    const timeStr = consultTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    return {
      level: 'tomorrow',
      label: `Tomorrow, ${timeStr}`,
      minutes: diffMinutes,
      isActive: false,
    };
  }

  // Future
  return {
    level: 'future',
    label: formatConsultationDate(datetime),
    minutes: diffMinutes,
    isActive: false,
  };
};

// =============================================================================
// CONSULTATIONS KANBAN BOARD
// =============================================================================
// A refined, editorial Kanban for the consultation pipeline.
//
// Design Philosophy: Clean Editorial Minimalism
// - Restrained color palette: stone neutrals + amber accent for actions
// - Typography-forward: DM Serif Display for hierarchy
// - Generous whitespace, cards that breathe
// - Single accent color (amber) to highlight what needs attention
// - No visual clutter - every element earns its place
// =============================================================================

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

export interface KanbanColumn {
  id: string;
  title: string;
  stages: ConsultationStage[];
  icon: React.ReactNode;
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
// COLUMN CONFIGURATION - Simplified
// -----------------------------------------------------------------------------

const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: 'booked',
    title: 'Booked',
    stages: ['new', 'confirmed'],
    icon: <Calendar size={18} strokeWidth={1.5} />,
  },
  {
    id: 'complete',
    title: 'Consult Done',
    stages: ['consult_complete', 'no_show'],
    icon: <Check size={18} strokeWidth={1.5} />,
  },
  {
    id: 'intake',
    title: 'Intake',
    stages: ['intake_pending', 'intake_scheduled'],
    icon: <Clock size={18} strokeWidth={1.5} />,
  },
  {
    id: 'paperwork',
    title: 'Paperwork',
    stages: ['paperwork_pending', 'ready_for_session'],
    icon: <ArrowRight size={18} strokeWidth={1.5} />,
  },
  {
    id: 'converted',
    title: 'Converted',
    stages: ['converted'],
    icon: <Sparkles size={18} strokeWidth={1.5} />,
    isTerminal: true,
    terminalType: 'success',
  },
  {
    id: 'lost',
    title: 'Lost',
    stages: ['lost'],
    icon: <X size={18} strokeWidth={1.5} />,
    isTerminal: true,
    terminalType: 'neutral',
  },
];

// -----------------------------------------------------------------------------
// STAGE LABEL - Simple text label for current status
// -----------------------------------------------------------------------------

const getStageLabel = (stage: ConsultationStage, followUpCount?: number): string => {
  const labels: Record<string, string> = {
    new: 'Needs confirmation',
    confirmed: 'Confirmed',
    consult_complete: 'Follow-up needed',
    no_show: `No-show · Follow-up ${(followUpCount || 0) + 1}/3`,
    intake_pending: 'Schedule intake',
    intake_scheduled: 'Intake scheduled',
    paperwork_pending: 'Paperwork pending',
    ready_for_session: 'Ready for first session',
    converted: 'Converted',
    lost: 'Lost',
  };
  return labels[stage] || stage;
};

// Helper to check if a consultation needs action
// Note: This is used for filtering - actual priority is determined by getActionInfo
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
// CLINICIAN DROPDOWN COMPONENT
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
          flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-base font-medium transition-all duration-200
          ${selectedClinician
            ? 'bg-stone-800 text-white'
            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }
        `}
      >
        <User size={16} strokeWidth={2} />
        <span className="max-w-[140px] truncate">
          {selectedClinician || 'All Clinicians'}
        </span>
        <ChevronDown
          size={16}
          strokeWidth={2}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full left-0 mt-2 z-50 min-w-[220px] max-w-[300px] rounded-xl border border-stone-200 bg-white overflow-hidden"
            style={{
              boxShadow: '0 12px 40px -8px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.03)',
            }}
          >
            <div className="p-2">
              {/* All Clinicians option */}
              <button
                onClick={() => {
                  onSelect(null);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-left transition-colors
                  ${!selectedClinician
                    ? 'bg-stone-100 text-stone-900'
                    : 'text-stone-600 hover:bg-stone-50'
                  }
                `}
              >
                <div className={`
                  w-9 h-9 rounded-lg flex items-center justify-center
                  ${!selectedClinician ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-500'}
                `}>
                  <Users size={16} strokeWidth={2} />
                </div>
                <span className="text-base font-medium">All Clinicians</span>
                {!selectedClinician && (
                  <Check size={16} className="ml-auto text-stone-800" strokeWidth={2.5} />
                )}
              </button>

              {clinicians.length > 0 && (
                <div className="my-2 mx-2 h-px bg-stone-100" />
              )}

              {/* Individual clinicians */}
              <div className="max-h-[280px] overflow-y-auto">
                {clinicians.map((clinician) => (
                  <button
                    key={clinician}
                    onClick={() => {
                      onSelect(clinician);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-left transition-colors
                      ${selectedClinician === clinician
                        ? 'bg-stone-100 text-stone-900'
                        : 'text-stone-600 hover:bg-stone-50'
                      }
                    `}
                  >
                    <div className={`
                      w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold
                      ${selectedClinician === clinician
                        ? 'bg-stone-800 text-white'
                        : 'bg-stone-100 text-stone-600'
                      }
                    `}>
                      {clinician.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <span className="text-base font-medium truncate">{clinician}</span>
                    {selectedClinician === clinician && (
                      <Check size={16} className="ml-auto text-stone-800 flex-shrink-0" strokeWidth={2.5} />
                    )}
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
// PULSING DOT COMPONENT - For imminent consults
// -----------------------------------------------------------------------------

const PulsingDot: React.FC<{ color?: 'red' | 'amber' | 'emerald' }> = ({ color = 'red' }) => {
  const colors = {
    red: 'bg-red-500',
    amber: 'bg-amber-500',
    emerald: 'bg-emerald-500',
  };

  const ringColors = {
    red: 'bg-red-400',
    amber: 'bg-amber-400',
    emerald: 'bg-emerald-400',
  };

  return (
    <span className="relative flex h-3 w-3">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${ringColors[color]} opacity-75`} />
      <span className={`relative inline-flex rounded-full h-3 w-3 ${colors[color]}`} />
    </span>
  );
};

// -----------------------------------------------------------------------------
// ACTION PRIORITY SYSTEM
// -----------------------------------------------------------------------------
// Priority is based on whether YOU need to do something NOW.
//
// Two types of actions:
// 1. PROACTIVE (deadline-based) - You must send/do something by a deadline
// 2. REACTIVE (client responded) - You're recording an update, not urgent
//
// CRITICAL (Red): Deadline is NOW or overdue
// URGENT (Amber): Deadline within 24-48 hours
// WAITING (null): No action needed, waiting on client
// REACTIVE (Stone): Client responded, just recording update - "Update" button
// -----------------------------------------------------------------------------

type ActionPriority = 'critical' | 'urgent' | 'reactive' | null;

interface ActionInfo {
  priority: ActionPriority;
  buttonLabel: string;
  statusLabel: string;
}

const getActionInfo = (consultation: Consultation): ActionInfo => {
  const { stage, followUpCount, datetime, lastFollowUpDate } = consultation;

  // Terminal states - no action
  if (stage === 'converted' || stage === 'lost') {
    return { priority: null, buttonLabel: '', statusLabel: stage === 'converted' ? 'Converted' : 'Lost' };
  }

  // =========================================================================
  // CONFIRMED - Check if consult time has passed
  // =========================================================================
  if (stage === 'confirmed') {
    const timeInfo = getTimeUntilConsult(datetime, consultation.duration);

    if (timeInfo.isActive) {
      // Consult is happening RIGHT NOW
      return { priority: 'critical', buttonLabel: 'Mark Outcome', statusLabel: 'Happening now' };
    }

    if (timeInfo.level === 'past') {
      // Consult ended - MUST mark outcome
      return { priority: 'critical', buttonLabel: 'Mark Outcome', statusLabel: 'Mark attendance' };
    }

    // Future consult - no action, just waiting
    return { priority: null, buttonLabel: '', statusLabel: 'Confirmed' };
  }

  // =========================================================================
  // NEW - Send confirmation email (deadline: immediately)
  // =========================================================================
  if (stage === 'new') {
    // New bookings should be confirmed ASAP
    const hoursSinceCreated = (Date.now() - new Date(consultation.createdAt).getTime()) / (1000 * 60 * 60);

    if (hoursSinceCreated >= 4) {
      return { priority: 'critical', buttonLabel: 'Send Confirmation', statusLabel: 'Confirmation overdue' };
    }
    if (hoursSinceCreated >= 1) {
      return { priority: 'urgent', buttonLabel: 'Send Confirmation', statusLabel: 'Send confirmation' };
    }
    return { priority: 'urgent', buttonLabel: 'Send Confirmation', statusLabel: 'Send confirmation' };
  }

  // =========================================================================
  // CONSULT COMPLETE - Send post-consult message (deadline: same day ideally)
  // =========================================================================
  if (stage === 'consult_complete') {
    const daysSince = getDaysSince(datetime);

    if (daysSince >= 2) {
      return { priority: 'critical', buttonLabel: 'Send Follow-up', statusLabel: 'Follow-up overdue' };
    }
    if (daysSince >= 1) {
      return { priority: 'urgent', buttonLabel: 'Send Follow-up', statusLabel: 'Send follow-up' };
    }
    // Same day
    return { priority: 'critical', buttonLabel: 'Send Follow-up', statusLabel: 'Send follow-up today' };
  }

  // =========================================================================
  // NO-SHOW - Follow-up sequence with specific deadlines
  // =========================================================================
  if (stage === 'no_show') {
    const consultDate = new Date(datetime);
    const now = new Date();
    const hoursSinceConsult = (now.getTime() - consultDate.getTime()) / (1000 * 60 * 60);

    // Calculate hours since last follow-up (if any)
    let hoursSinceLastFollowUp = hoursSinceConsult;
    if (lastFollowUpDate) {
      hoursSinceLastFollowUp = (now.getTime() - new Date(lastFollowUpDate).getTime()) / (1000 * 60 * 60);
    }

    if (followUpCount === 0) {
      // Follow-up #1: Due immediately after no-show
      if (hoursSinceConsult >= 2) {
        return { priority: 'critical', buttonLabel: 'Send Follow-up #1', statusLabel: 'Immediate follow-up overdue' };
      }
      return { priority: 'critical', buttonLabel: 'Send Follow-up #1', statusLabel: 'Send immediate follow-up' };
    }

    if (followUpCount === 1) {
      // Follow-up #2: Due 24 hours after no-show
      if (hoursSinceConsult >= 24) {
        if (hoursSinceLastFollowUp >= 24) {
          return { priority: 'critical', buttonLabel: 'Send Follow-up #2', statusLabel: '24hr follow-up due' };
        }
        if (hoursSinceLastFollowUp >= 20) {
          return { priority: 'urgent', buttonLabel: 'Send Follow-up #2', statusLabel: '24hr follow-up soon' };
        }
      }
      // Still waiting for 24hr mark
      return { priority: null, buttonLabel: '', statusLabel: 'Waiting for 24hr mark' };
    }

    if (followUpCount === 2) {
      // Follow-up #3: Due 72 hours after no-show
      if (hoursSinceConsult >= 72) {
        if (hoursSinceLastFollowUp >= 48) {
          return { priority: 'critical', buttonLabel: 'Send Follow-up #3', statusLabel: '72hr follow-up due' };
        }
        if (hoursSinceLastFollowUp >= 44) {
          return { priority: 'urgent', buttonLabel: 'Send Follow-up #3', statusLabel: '72hr follow-up soon' };
        }
      }
      // Still waiting for 72hr mark
      return { priority: null, buttonLabel: '', statusLabel: 'Waiting for 72hr mark' };
    }

    if (followUpCount >= 3) {
      // All follow-ups sent, should mark as lost
      return { priority: 'reactive', buttonLabel: 'Mark Lost', statusLabel: 'No response - close case' };
    }
  }

  // =========================================================================
  // INTAKE PENDING - Waiting for client to schedule, REACTIVE when they do
  // =========================================================================
  if (stage === 'intake_pending') {
    // This is a WAITING state - client needs to respond
    // When they DO schedule, user updates reactively
    const daysSince = getDaysSince(datetime);

    if (daysSince >= 7) {
      // Been waiting too long - maybe send a nudge? This could be a proactive reminder
      return { priority: 'urgent', buttonLabel: 'Send Reminder', statusLabel: 'No intake scheduled (1 week)' };
    }
    if (daysSince >= 3) {
      return { priority: 'reactive', buttonLabel: 'Send Reminder', statusLabel: 'Waiting for intake scheduling' };
    }
    // Recently sent post-consult, just waiting
    return { priority: null, buttonLabel: '', statusLabel: 'Waiting for client to schedule' };
  }

  // =========================================================================
  // INTAKE SCHEDULED - Proactive paperwork reminders based on intake date
  // =========================================================================
  if (stage === 'intake_scheduled') {
    if (!consultation.intakeScheduledDate) {
      return { priority: 'reactive', buttonLabel: 'Update', statusLabel: 'Intake scheduled' };
    }

    const intakeTime = getTimeUntilConsult(consultation.intakeScheduledDate);
    const hoursUntilIntake = intakeTime.minutes / 60;

    // T-24 hours: Send urgent paperwork reminder
    if (hoursUntilIntake <= 24 && hoursUntilIntake > 0) {
      return { priority: 'critical', buttonLabel: 'Send Reminder', statusLabel: 'Paperwork reminder (T-24hr)' };
    }

    // T-72 hours: Send first paperwork reminder
    if (hoursUntilIntake <= 72 && hoursUntilIntake > 24) {
      return { priority: 'urgent', buttonLabel: 'Send Reminder', statusLabel: 'Paperwork reminder (T-72hr)' };
    }

    // More than 72 hours out - just waiting
    return { priority: null, buttonLabel: '', statusLabel: 'Waiting for paperwork' };
  }

  // =========================================================================
  // PAPERWORK PENDING - Similar to above, but paperwork reminder already sent
  // =========================================================================
  if (stage === 'paperwork_pending') {
    // Client needs to complete paperwork - this is reactive when they do
    if (!consultation.intakeScheduledDate) {
      return { priority: 'reactive', buttonLabel: 'Mark Complete', statusLabel: 'Awaiting paperwork' };
    }

    const intakeTime = getTimeUntilConsult(consultation.intakeScheduledDate);

    if (intakeTime.level === 'past') {
      // Intake passed without paperwork - critical issue
      return { priority: 'critical', buttonLabel: 'Update Status', statusLabel: 'Intake passed - no paperwork' };
    }

    if (intakeTime.level === 'imminent' || intakeTime.level === 'soon') {
      // Intake very soon, still no paperwork
      return { priority: 'critical', buttonLabel: 'Send Urgent Reminder', statusLabel: 'Intake soon - no paperwork!' };
    }

    if (intakeTime.level === 'today') {
      return { priority: 'urgent', buttonLabel: 'Send Reminder', statusLabel: 'Intake today - paperwork pending' };
    }

    // Waiting on client
    return { priority: null, buttonLabel: '', statusLabel: 'Waiting for paperwork' };
  }

  // =========================================================================
  // READY FOR SESSION - Reactive, just confirming when session happens
  // =========================================================================
  if (stage === 'ready_for_session') {
    // This is purely reactive - confirm when first session is done
    if (consultation.firstSessionDate) {
      const sessionTime = getTimeUntilConsult(consultation.firstSessionDate);
      if (sessionTime.level === 'past') {
        return { priority: 'reactive', buttonLabel: 'Mark Complete', statusLabel: 'Confirm first session done' };
      }
    }
    return { priority: null, buttonLabel: '', statusLabel: 'Ready for first session' };
  }

  return { priority: null, buttonLabel: '', statusLabel: '' };
};

// -----------------------------------------------------------------------------
// KANBAN CARD COMPONENT - With urgency awareness
// -----------------------------------------------------------------------------

interface KanbanCardProps {
  consultation: Consultation;
  onTakeAction: () => void;
  onClick: () => void;
  isTerminal?: boolean;
  terminalType?: 'success' | 'neutral';
}

const KanbanCard: React.FC<KanbanCardProps> = ({
  consultation,
  onTakeAction,
  onClick,
  isTerminal,
  terminalType,
}) => {
  // Live countdown state for confirmed consults
  const [timeInfo, setTimeInfo] = useState<TimeUntilConsult>(() =>
    getTimeUntilConsult(consultation.datetime, consultation.duration)
  );

  // Update countdown every 30 seconds for confirmed consults
  useEffect(() => {
    if (consultation.stage !== 'confirmed') return;

    const updateTime = () => {
      setTimeInfo(getTimeUntilConsult(consultation.datetime, consultation.duration));
    };

    // Update immediately
    updateTime();

    // For imminent consults, update every 10 seconds for more responsive countdown
    const interval = timeInfo.level === 'imminent' || timeInfo.level === 'soon'
      ? 10000
      : 30000;

    const timer = setInterval(updateTime, interval);
    return () => clearInterval(timer);
  }, [consultation.datetime, consultation.duration, consultation.stage, timeInfo.level]);

  const isPast = isConsultationPast(consultation.datetime);
  const isToday = isConsultationToday(consultation.datetime);

  // For confirmed consults, use the live timeInfo
  const isConfirmed = consultation.stage === 'confirmed';
  const urgencyLevel = isConfirmed ? timeInfo.level : null;
  const isImminent = urgencyLevel === 'imminent';
  const isSoon = urgencyLevel === 'soon';
  const isTodayUrgent = urgencyLevel === 'today';
  const isConsultPast = urgencyLevel === 'past';

  // Meeting type helpers
  const hasVideoLink = consultation.meetingType === 'google_meet' || consultation.meetingType === 'zoom';
  const isPhoneCall = consultation.meetingType === 'phone';

  // Show join button for confirmed consults (active when today or imminent)
  const showJoinButton = isConfirmed && !isConsultPast;
  const isJoinButtonActive = isConfirmed && (isImminent || isSoon || isTodayUrgent || (isToday && !isPast));

  // Get action info (priority, button label, status)
  const actionInfo = getActionInfo(consultation);
  const { priority: actionPriority, buttonLabel, statusLabel } = actionInfo;

  // Determine if action button should show
  const showActionButton = actionPriority !== null;

  // Get display date/time
  const getDisplayInfo = () => {
    if (isConfirmed && !isConsultPast) {
      return timeInfo.label;
    }
    if (consultation.stage === 'no_show') {
      const daysSince = getDaysSince(consultation.datetime);
      return `${daysSince}d ago`;
    }
    if (consultation.stage === 'intake_scheduled' && consultation.intakeScheduledDate) {
      return formatConsultationDate(consultation.intakeScheduledDate).split(',')[0];
    }
    if (consultation.stage === 'ready_for_session' && consultation.firstSessionDate) {
      return formatConsultationDate(consultation.firstSessionDate).split(',')[0];
    }
    return formatConsultationDate(consultation.datetime).split(',')[0];
  };

  // Card styling based on state
  const getCardStyle = () => {
    if (isTerminal && terminalType === 'success') {
      return 'bg-emerald-50/60 border-emerald-200/60';
    }
    if (isTerminal && terminalType === 'neutral') {
      return 'bg-stone-50/80 border-stone-200/60';
    }

    // Confirmed consults - style by time urgency
    if (isConfirmed && !isConsultPast) {
      if (isImminent) {
        return 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200 ring-1 ring-red-100';
      }
      if (isSoon) {
        return 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 ring-1 ring-amber-100';
      }
      if (isTodayUrgent) {
        return 'bg-gradient-to-br from-emerald-50/50 to-teal-50/30 border-emerald-200/80';
      }
      // Future consults - neutral
      return 'bg-white border-stone-200/80';
    }

    // Non-confirmed stages - style by action priority
    if (actionPriority === 'critical') {
      return 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200 ring-1 ring-red-100';
    }
    if (actionPriority === 'urgent') {
      return 'bg-white border-amber-200 ring-1 ring-amber-100';
    }
    if (actionPriority === 'reactive') {
      return 'bg-white border-stone-200/80';
    }

    return 'bg-white border-stone-200/80';
  };

  // Avatar styling based on urgency
  const getAvatarStyle = () => {
    if (isTerminal && terminalType === 'success') {
      return 'bg-emerald-100 text-emerald-700';
    }
    if (isTerminal && terminalType === 'neutral') {
      return 'bg-stone-200 text-stone-500';
    }

    // Confirmed consults - style by time
    if (isConfirmed && !isConsultPast) {
      if (isImminent) return 'bg-red-100 text-red-700';
      if (isSoon) return 'bg-amber-100 text-amber-700';
      if (isTodayUrgent) return 'bg-emerald-100 text-emerald-700';
      return 'bg-stone-100 text-stone-600';
    }

    // Non-confirmed - style by action priority
    if (actionPriority === 'critical') {
      return 'bg-red-100 text-red-700';
    }
    if (actionPriority === 'urgent') {
      return 'bg-amber-100 text-amber-700';
    }

    return 'bg-stone-100 text-stone-600';
  };

  // Get urgency badge for confirmed consults
  const getUrgencyBadge = () => {
    if (!isConfirmed || isConsultPast) return null;

    if (isImminent && timeInfo.isActive) {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 border border-red-200">
          <PulsingDot color="red" />
          <span className="text-xs font-bold uppercase tracking-wide text-red-700">Live</span>
        </div>
      );
    }

    if (isImminent) {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 border border-red-200">
          <PulsingDot color="red" />
          <span className="text-xs font-bold uppercase tracking-wide text-red-700">Soon</span>
        </div>
      );
    }

    if (isSoon) {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 border border-amber-200">
          <PulsingDot color="amber" />
          <span className="text-xs font-bold uppercase tracking-wide text-amber-700">{timeInfo.label}</span>
        </div>
      );
    }

    if (isTodayUrgent) {
      return (
        <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wide bg-emerald-100 text-emerald-700 rounded-full border border-emerald-200">
          Today
        </span>
      );
    }

    if (urgencyLevel === 'tomorrow') {
      return (
        <span className="px-2.5 py-1 text-xs font-medium text-stone-500 bg-stone-100 rounded-full">
          Tomorrow
        </span>
      );
    }

    return null;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`
        group relative rounded-2xl border cursor-pointer
        transition-all duration-200
        hover:shadow-lg hover:shadow-stone-900/8
        ${getCardStyle()}
      `}
      onClick={onClick}
    >
      <div className="p-5">
        {/* Header: Name + Urgency badge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-4 min-w-0">
            {/* Avatar */}
            <div
              className={`
                w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0
                transition-colors duration-200
                ${getAvatarStyle()}
              `}
            >
              {getClientInitials(consultation.firstName, consultation.lastName)}
            </div>

            <div className="min-w-0">
              {/* Name */}
              <h4
                className="text-lg font-semibold text-stone-900 truncate leading-tight"
                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
              >
                {consultation.firstName} {consultation.lastName}
              </h4>

              {/* Clinician */}
              <p className="text-sm text-stone-500 truncate">
                {consultation.clinicianName}
              </p>
            </div>
          </div>

          {/* Urgency badge or action indicator */}
          <div className="flex-shrink-0">
            {getUrgencyBadge()}
            {/* Action priority indicator for non-confirmed stages */}
            {!isConfirmed && !isTerminal && actionPriority === 'critical' && (
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-100 border border-red-200">
                <PulsingDot color="red" />
              </div>
            )}
            {!isConfirmed && !isTerminal && actionPriority === 'urgent' && (
              <div className="w-3 h-3 rounded-full bg-amber-400 ring-2 ring-amber-100 mt-1" />
            )}
          </div>
        </div>

        {/* Status/Time display */}
        <div className="mb-4">
          {isConfirmed && !isConsultPast ? (
            // Countdown display for confirmed consults
            <div className={`
              flex items-center gap-2 text-sm font-medium
              ${isImminent ? 'text-red-700' : isSoon ? 'text-amber-700' : isTodayUrgent ? 'text-emerald-700' : 'text-stone-500'}
            `}>
              <Clock size={14} strokeWidth={2} />
              <span>{timeInfo.label}</span>
            </div>
          ) : (
            // Status text from action info
            <p className={`text-sm ${
              actionPriority === 'critical' ? 'text-red-700 font-medium' :
              actionPriority === 'urgent' ? 'text-amber-700 font-medium' :
              'text-stone-500'
            }`}>
              {statusLabel || getStageLabel(consultation.stage, consultation.followUpCount)}
            </p>
          )}
        </div>

        {/* Date row for non-confirmed or past consults */}
        {(!isConfirmed || isConsultPast) && (
          <div className="flex items-center gap-4 text-sm text-stone-400 mb-5">
            <div className="flex items-center gap-2">
              <Clock size={14} strokeWidth={2} />
              <span>{getDisplayInfo()}</span>
            </div>
            {consultation.wasTransferred && (
              <span className="text-amber-600 font-medium">Transferred</span>
            )}
          </div>
        )}

        {/* Transfer badge for confirmed consults */}
        {isConfirmed && !isConsultPast && consultation.wasTransferred && (
          <div className="mb-5">
            <span className="text-xs text-amber-600 font-medium">Transferred from {consultation.originalClinicianName}</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          {/* Join/Call buttons for confirmed consults */}
          {showJoinButton && hasVideoLink && consultation.meetingLink && (
            <a
              href={isJoinButtonActive ? consultation.meetingLink : undefined}
              target={isJoinButtonActive ? "_blank" : undefined}
              rel={isJoinButtonActive ? "noopener noreferrer" : undefined}
              onClick={(e) => {
                e.stopPropagation();
                if (!isJoinButtonActive) e.preventDefault();
              }}
              className={`
                flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold
                flex items-center justify-center gap-2 transition-all duration-200
                ${isJoinButtonActive
                  ? isImminent
                    ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-500/20'
                    : 'bg-stone-900 text-white hover:bg-stone-800'
                  : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                }
              `}
            >
              <Video size={16} strokeWidth={2} />
              {isJoinButtonActive ? 'Join Call' : 'Join Call'}
            </a>
          )}

          {/* Phone call button */}
          {showJoinButton && isPhoneCall && consultation.meetingPhone && (
            <a
              href={isJoinButtonActive ? `tel:${consultation.meetingPhone}` : undefined}
              onClick={(e) => {
                e.stopPropagation();
                if (!isJoinButtonActive) e.preventDefault();
              }}
              className={`
                flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold
                flex items-center justify-center gap-2 transition-all duration-200
                ${isJoinButtonActive
                  ? isImminent
                    ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-500/20'
                    : 'bg-stone-900 text-white hover:bg-stone-800'
                  : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                }
              `}
            >
              <PhoneCall size={16} strokeWidth={2} />
              {isJoinButtonActive ? 'Call Client' : 'Call Client'}
            </a>
          )}

          {/* Phone number display when not active */}
          {showJoinButton && isPhoneCall && consultation.meetingPhone && !isJoinButtonActive && (
            <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-50 text-stone-400 text-sm border border-stone-100">
              <Phone size={14} strokeWidth={2} />
              <span className="font-medium truncate">{consultation.meetingPhone}</span>
            </div>
          )}

          {/* Action button - styled by priority */}
          {showActionButton && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTakeAction();
              }}
              className={`
                flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold
                flex items-center justify-center gap-2 transition-colors
                ${actionPriority === 'critical'
                  ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-500/20'
                  : actionPriority === 'urgent'
                    ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm shadow-amber-500/20'
                    : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                }
              `}
            >
              {buttonLabel}
              <ChevronRight size={16} strokeWidth={2.5} />
            </button>
          )}

          {/* View details for terminal states */}
          {isTerminal && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-600 transition-colors flex items-center justify-center gap-2"
            >
              View Details
              <ChevronRight size={14} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// -----------------------------------------------------------------------------
// KANBAN COLUMN COMPONENT
// -----------------------------------------------------------------------------

interface KanbanColumnComponentProps {
  column: KanbanColumn;
  consultations: Consultation[];
  onTakeAction: (consultation: Consultation) => void;
  onSelectConsultation: (consultation: Consultation) => void;
}

const KanbanColumnComponent: React.FC<KanbanColumnComponentProps> = ({
  column,
  consultations,
  onTakeAction,
  onSelectConsultation,
}) => {
  // Count action needed
  const actionNeededCount = consultations.filter(c => {
    if (c.stage === 'converted' || c.stage === 'lost') return false;
    if (c.stage === 'confirmed' && !isConsultationPast(c.datetime)) return false;
    return getNextAction(c) !== null;
  }).length;

  // Get column container styling
  const getColumnStyle = () => {
    if (column.isTerminal && column.terminalType === 'success') {
      return 'bg-emerald-50/40 border-emerald-200/50';
    }
    if (column.isTerminal && column.terminalType === 'neutral') {
      return 'bg-stone-100/50 border-stone-200/50';
    }
    return 'bg-white/70 border-stone-200/60';
  };

  // Get header styling
  const getHeaderStyle = () => {
    if (column.isTerminal && column.terminalType === 'success') {
      return 'bg-emerald-100/80 border-emerald-200/60';
    }
    if (column.isTerminal && column.terminalType === 'neutral') {
      return 'bg-stone-200/60 border-stone-300/50';
    }
    if (actionNeededCount > 0) {
      return 'bg-gradient-to-r from-amber-50 to-amber-100/50 border-amber-200/60';
    }
    return 'bg-stone-100/80 border-stone-200/60';
  };

  return (
    <div
      className={`
        flex flex-col h-full min-w-[340px] w-[340px] rounded-2xl border overflow-hidden
        ${getColumnStyle()}
      `}
      style={{
        boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.06)',
      }}
    >
      {/* Column Header - Boxed and distinct */}
      <div className={`
        flex items-center justify-between px-5 py-4 border-b
        ${getHeaderStyle()}
      `}>
        <div className="flex items-center gap-4">
          <div className={`
            w-10 h-10 rounded-xl flex items-center justify-center
            ${column.isTerminal && column.terminalType === 'success'
              ? 'bg-emerald-200/80 text-emerald-700'
              : column.isTerminal
                ? 'bg-stone-300/60 text-stone-500'
                : actionNeededCount > 0
                  ? 'bg-amber-200/80 text-amber-700'
                  : 'bg-stone-200/80 text-stone-600'
            }
          `}>
            {column.icon}
          </div>
          <div>
            <h3
              className={`
                text-xl font-semibold tracking-tight leading-tight
                ${column.isTerminal && column.terminalType === 'success'
                  ? 'text-emerald-800'
                  : column.isTerminal
                    ? 'text-stone-600'
                    : 'text-stone-800'
                }
              `}
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              {column.title}
            </h3>
            {actionNeededCount > 0 && !column.isTerminal && (
              <p className="text-sm text-amber-700 font-medium mt-0.5">
                {actionNeededCount} need{actionNeededCount === 1 ? 's' : ''} action
              </p>
            )}
          </div>
        </div>

        {/* Count badge */}
        <div className={`
          min-w-[32px] h-8 px-2.5 rounded-lg flex items-center justify-center text-base font-bold tabular-nums
          ${column.isTerminal && column.terminalType === 'success'
            ? 'bg-emerald-200/80 text-emerald-800'
            : column.isTerminal
              ? 'bg-stone-300/60 text-stone-600'
              : actionNeededCount > 0
                ? 'bg-amber-200/80 text-amber-800'
                : 'bg-stone-200/80 text-stone-700'
          }
        `}>
          {consultations.length}
        </div>
      </div>

      {/* Cards container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {consultations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className={`
                w-14 h-14 rounded-xl flex items-center justify-center mb-4
                ${column.isTerminal && column.terminalType === 'success'
                  ? 'bg-emerald-100 text-emerald-400'
                  : column.isTerminal
                    ? 'bg-stone-200 text-stone-400'
                    : 'bg-stone-100 text-stone-300'
                }
              `}>
                {column.icon}
              </div>
              <p className="text-sm text-stone-400 font-medium">No clients</p>
            </motion.div>
          ) : (
            consultations.map((consultation) => (
              <KanbanCard
                key={consultation.id}
                consultation={consultation}
                onTakeAction={() => onTakeAction(consultation)}
                onClick={() => onSelectConsultation(consultation)}
                isTerminal={column.isTerminal}
                terminalType={column.terminalType}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// MAIN KANBAN COMPONENT
// -----------------------------------------------------------------------------

export const ConsultationsKanban: React.FC<ConsultationsKanbanProps> = ({
  consultations,
  onTakeAction,
  onSelectConsultation,
}) => {
  // Filter state
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [selectedClinician, setSelectedClinician] = useState<string | null>(null);

  // Extract unique clinicians from consultations
  const clinicians = useMemo(() => {
    const names = new Set(consultations.map(c => c.clinicianName));
    return Array.from(names).sort();
  }, [consultations]);

  // Apply filters to consultations
  const filteredConsultations = useMemo(() => {
    let result = consultations;

    // Apply clinician filter
    if (selectedClinician) {
      result = result.filter(c => c.clinicianName === selectedClinician);
    }

    // Apply action filter
    if (filterMode === 'needs_action') {
      result = result.filter(consultationNeedsAction);
    }

    return result;
  }, [consultations, filterMode, selectedClinician]);

  // Calculate counts for filter badges
  const counts = useMemo(() => {
    let baseConsultations = consultations;
    if (selectedClinician) {
      baseConsultations = consultations.filter(c => c.clinicianName === selectedClinician);
    }

    return {
      all: baseConsultations.length,
      needsAction: baseConsultations.filter(consultationNeedsAction).length,
    };
  }, [consultations, selectedClinician]);

  // Group consultations by column
  const columnData = useMemo(() => {
    return KANBAN_COLUMNS.map(column => ({
      ...column,
      consultations: filteredConsultations
        .filter(c => column.stages.includes(c.stage))
        .sort((a, b) => {
          // For confirmed consults, sort by urgency (imminent first)
          if (a.stage === 'confirmed' && b.stage === 'confirmed') {
            const aTime = getTimeUntilConsult(a.datetime, a.duration);
            const bTime = getTimeUntilConsult(b.datetime, b.duration);

            // Urgency priority: imminent > soon > today > tomorrow > future > past
            const urgencyOrder: Record<UrgencyLevel, number> = {
              imminent: 0,
              soon: 1,
              today: 2,
              tomorrow: 3,
              future: 4,
              past: 5,
            };

            const aUrgency = urgencyOrder[aTime.level];
            const bUrgency = urgencyOrder[bTime.level];

            if (aUrgency !== bUrgency) return aUrgency - bUrgency;

            // Within same urgency level, sort by time
            return aTime.minutes - bTime.minutes;
          }

          // For other stages, sort by action needed first, then by date
          const aHasAction = getNextAction(a) !== null;
          const bHasAction = getNextAction(b) !== null;
          if (aHasAction && !bHasAction) return -1;
          if (!aHasAction && bHasAction) return 1;
          return new Date(a.datetime).getTime() - new Date(b.datetime).getTime();
        }),
    }));
  }, [filteredConsultations]);

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-stone-100 to-stone-50">
      {/* Board Header - Filter Bar */}
      <div className="px-6 py-5 border-b border-stone-200/80 bg-white/90 backdrop-blur-sm flex-shrink-0 relative z-50">
        <div className="flex items-center gap-5">
          {/* Title */}
          <h2
            className="text-2xl font-semibold text-stone-900 tracking-tight"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
          >
            Pipeline
          </h2>

          {/* Filter Toggle */}
          <div className="flex items-center p-1.5 bg-stone-100 rounded-xl">
            <button
              onClick={() => setFilterMode('all')}
              className={`
                flex items-center gap-2.5 px-4 py-2 rounded-lg text-base font-medium transition-all duration-200
                ${filterMode === 'all'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
                }
              `}
            >
              <span>All</span>
              <span className={`
                min-w-[24px] h-6 px-2 rounded-md text-sm font-bold tabular-nums flex items-center justify-center
                ${filterMode === 'all' ? 'bg-stone-100 text-stone-600' : 'bg-stone-200/60 text-stone-500'}
              `}>
                {counts.all}
              </span>
            </button>

            <button
              onClick={() => setFilterMode('needs_action')}
              className={`
                flex items-center gap-2.5 px-4 py-2 rounded-lg text-base font-medium transition-all duration-200
                ${filterMode === 'needs_action'
                  ? 'bg-white text-amber-700 shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
                }
              `}
            >
              <Zap size={16} strokeWidth={2.5} className={filterMode === 'needs_action' ? 'text-amber-500' : ''} />
              <span>Need Action</span>
              {counts.needsAction > 0 && (
                <span className={`
                  min-w-[24px] h-6 px-2 rounded-md text-sm font-bold tabular-nums flex items-center justify-center
                  ${filterMode === 'needs_action'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-amber-100 text-amber-600'
                  }
                `}>
                  {counts.needsAction}
                </span>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-stone-200" />

          {/* Clinician Filter */}
          <ClinicianDropdown
            clinicians={clinicians}
            selectedClinician={selectedClinician}
            onSelect={setSelectedClinician}
          />
        </div>

        {/* Active filter indicator */}
        {(selectedClinician || filterMode === 'needs_action') && (
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-stone-100">
            <span className="text-sm text-stone-400">Showing:</span>
            <div className="flex items-center gap-2">
              {filterMode === 'needs_action' && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-sm font-medium">
                  <Zap size={14} strokeWidth={2.5} />
                  Needs action
                  <button
                    onClick={() => setFilterMode('all')}
                    className="ml-1 hover:bg-amber-100 rounded p-0.5 transition-colors"
                  >
                    <X size={14} strokeWidth={2.5} />
                  </button>
                </span>
              )}
              {selectedClinician && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-100 text-stone-700 text-sm font-medium">
                  <User size={14} strokeWidth={2} />
                  {selectedClinician}
                  <button
                    onClick={() => setSelectedClinician(null)}
                    className="ml-1 hover:bg-stone-200 rounded p-0.5 transition-colors"
                  >
                    <X size={14} strokeWidth={2.5} />
                  </button>
                </span>
              )}
            </div>
            <button
              onClick={() => {
                setFilterMode('all');
                setSelectedClinician(null);
              }}
              className="ml-auto text-sm text-stone-400 hover:text-stone-600 transition-colors"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Kanban Columns */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden relative z-0">
        <div className="flex gap-5 p-6 h-full min-w-max">
          {columnData.map((column) => (
            <KanbanColumnComponent
              key={column.id}
              column={column}
              consultations={column.consultations}
              onTakeAction={onTakeAction}
              onSelectConsultation={onSelectConsultation}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConsultationsKanban;
export { KANBAN_COLUMNS };
