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
// Pipeline Flow:
// 1. Booked: new, confirmed (pre-consult) - waiting for consultation
// 2. Post-Consult: consult_complete, no_show - consult happened, need to mark outcome or do recovery
// 3. Intake: intake_pending - attended but didn't book intake, need to convince them
// 4. Paperwork: intake_scheduled, paperwork_pending - intake booked, focus on paperwork
// 5. First Session: paperwork_complete - paperwork done, waiting for first session
// 6. Converted: converted - success!
// 7. Lost: lost - dropped off

const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: 'booked', title: 'Booked', stages: ['new', 'confirmed'] },
  { id: 'post-consult', title: 'Post-Consult', stages: ['consult_complete', 'no_show'] },
  { id: 'intake', title: 'Intake', stages: ['intake_pending'] },
  { id: 'paperwork', title: 'Paperwork', stages: ['intake_scheduled', 'paperwork_pending'] },
  { id: 'first-session', title: 'First Session', stages: ['paperwork_complete'] },
  { id: 'converted', title: 'Converted', stages: ['converted'], isTerminal: true, terminalType: 'success' },
  { id: 'lost', title: 'Lost', stages: ['lost'], isTerminal: true, terminalType: 'neutral' },
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

const getActionInfo = (consultation: Consultation): ActionInfo => {
  const { stage, followUpCount, datetime, lastFollowUpDate } = consultation;

  // Terminal states
  if (stage === 'converted') {
    return { priority: null, buttonLabel: '', statusLabel: 'Converted', colorScheme: 'emerald' };
  }
  if (stage === 'lost') {
    return { priority: null, buttonLabel: '', statusLabel: 'Lost', colorScheme: 'stone' };
  }

  // BOOKED COLUMN: new + confirmed (pre-consult)
  if (stage === 'new') {
    const hoursSinceCreated = (Date.now() - new Date(consultation.createdAt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreated >= 4) {
      return { priority: 'due', buttonLabel: 'Send Confirmation', statusLabel: 'Needs confirmation', colorScheme: 'cyan' };
    }
    return { priority: 'upcoming', buttonLabel: 'Send Confirmation', statusLabel: 'New booking', colorScheme: 'cyan' };
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
    // Pre-consult: waiting for consult, show Join button (handled separately in card)
    return { priority: null, buttonLabel: '', statusLabel: 'Scheduled', colorScheme: 'cyan' };
  }

  // POST-CONSULT COLUMN: consult_complete + no_show
  if (stage === 'consult_complete') {
    // This shouldn't happen often as consult_complete means we need to mark outcome
    // But if somehow here, prompt to send follow-up
    const daysSince = getDaysSince(datetime);
    if (daysSince >= 2) {
      return { priority: 'due', buttonLabel: 'Send Follow-up', statusLabel: 'Overdue', colorScheme: 'amber' };
    }
    return { priority: 'due', buttonLabel: 'Send Follow-up', statusLabel: 'Needs follow-up', colorScheme: 'amber' };
  }

  if (stage === 'no_show') {
    const consultDate = new Date(datetime);
    const now = new Date();
    const hoursSinceConsult = (now.getTime() - consultDate.getTime()) / (1000 * 60 * 60);
    let hoursSinceLastFollowUp = hoursSinceConsult;
    if (lastFollowUpDate) {
      hoursSinceLastFollowUp = (now.getTime() - new Date(lastFollowUpDate).getTime()) / (1000 * 60 * 60);
    }

    if (followUpCount === 0) {
      return { priority: 'due', buttonLabel: 'Send Recovery #1', statusLabel: 'No-show', colorScheme: 'rose' };
    }
    if (followUpCount === 1 && hoursSinceConsult >= 24 && hoursSinceLastFollowUp >= 20) {
      return { priority: hoursSinceLastFollowUp >= 24 ? 'due' : 'upcoming', buttonLabel: 'Send Recovery #2', statusLabel: '24hr check-in', colorScheme: 'rose' };
    }
    if (followUpCount === 2 && hoursSinceConsult >= 72 && hoursSinceLastFollowUp >= 44) {
      return { priority: hoursSinceLastFollowUp >= 48 ? 'due' : 'upcoming', buttonLabel: 'Send Recovery #3', statusLabel: '72hr check-in', colorScheme: 'rose' };
    }
    if (followUpCount >= 3) {
      return { priority: 'reactive', buttonLabel: 'Mark Lost', statusLabel: 'No response', colorScheme: 'rose' };
    }
    return { priority: null, buttonLabel: '', statusLabel: `${followUpCount}/3 sent`, colorScheme: 'rose' };
  }

  // INTAKE COLUMN: intake_pending
  if (stage === 'intake_pending') {
    const daysSince = getDaysSince(datetime);
    if (daysSince >= 7) {
      return { priority: 'due', buttonLabel: 'Send Reminder', statusLabel: 'No response', colorScheme: 'amber' };
    }
    if (daysSince >= 3) {
      return { priority: 'upcoming', buttonLabel: 'Send Reminder', statusLabel: 'Awaiting response', colorScheme: 'amber' };
    }
    return { priority: 'reactive', buttonLabel: 'Mark Scheduled', statusLabel: 'Awaiting response', colorScheme: 'amber' };
  }

  // PAPERWORK COLUMN: intake_scheduled + paperwork_pending
  if (stage === 'intake_scheduled') {
    if (!consultation.intakeScheduledDate) {
      return { priority: 'reactive', buttonLabel: 'Send Reminder', statusLabel: 'Scheduled', colorScheme: 'violet' };
    }
    const intakeTime = getTimeUntilConsult(consultation.intakeScheduledDate);
    const hoursUntil = intakeTime.minutes / 60;
    if (hoursUntil <= 24 && hoursUntil > 0) {
      return { priority: 'due', buttonLabel: 'Send Reminder', statusLabel: 'Paperwork due', colorScheme: 'violet' };
    }
    if (hoursUntil <= 72 && hoursUntil > 24) {
      return { priority: 'upcoming', buttonLabel: 'Send Reminder', statusLabel: 'Send reminder', colorScheme: 'violet' };
    }
    return { priority: null, buttonLabel: '', statusLabel: 'Awaiting paperwork', colorScheme: 'violet' };
  }

  if (stage === 'paperwork_pending') {
    if (!consultation.intakeScheduledDate) {
      return { priority: 'reactive', buttonLabel: 'Mark Complete', statusLabel: 'Pending', colorScheme: 'violet' };
    }
    const intakeTime = getTimeUntilConsult(consultation.intakeScheduledDate);
    if (intakeTime.level === 'past') {
      return { priority: 'due', buttonLabel: 'Mark Complete', statusLabel: 'Overdue', colorScheme: 'violet' };
    }
    if (intakeTime.level === 'imminent' || intakeTime.level === 'soon' || intakeTime.level === 'today') {
      return { priority: 'due', buttonLabel: 'Send Reminder', statusLabel: 'Urgent', colorScheme: 'violet' };
    }
    return { priority: 'reactive', buttonLabel: 'Mark Complete', statusLabel: 'Pending', colorScheme: 'violet' };
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
  const isImminent = isConfirmed && (timeInfo.level === 'imminent' || timeInfo.level === 'soon');
  const isTodayConsult = isConfirmed && timeInfo.level === 'today';
  const isConsultPast = isConfirmed && (timeInfo.level === 'past' || timeInfo.isActive);

  const hasVideoLink = consultation.meetingType === 'google_meet' || consultation.meetingType === 'zoom';
  const isPhoneCall = consultation.meetingType === 'phone';
  // Only show Join button if confirmed AND consult hasn't happened yet
  const showJoinButton = isConfirmed && !isConsultPast;
  const isJoinActive = isConfirmed && (isImminent || isTodayConsult || isConsultationToday(consultation.datetime));

  const actionInfo = getActionInfo(consultation);
  const { priority: actionPriority, buttonLabel, statusLabel, colorScheme } = actionInfo;
  const showActionButton = actionPriority !== null;

  const getDisplayInfo = () => {
    if (isConfirmed && !isConsultPast) return timeInfo.label;
    if (consultation.stage === 'no_show') return `${getDaysSince(consultation.datetime)}d ago`;
    if (consultation.stage === 'intake_scheduled' && consultation.intakeScheduledDate) {
      return formatConsultationDate(consultation.intakeScheduledDate).split(',')[0];
    }
    if (consultation.stage === 'paperwork_complete' && consultation.firstSessionDate) {
      return formatConsultationDate(consultation.firstSessionDate).split(',')[0];
    }
    return formatConsultationDate(consultation.datetime).split(',')[0];
  };

  // Card background based on colorScheme and priority
  const getCardBg = () => {
    if (isTerminal && terminalType === 'success') return 'bg-gradient-to-br from-emerald-50/80 to-teal-50/50';
    if (isTerminal) return 'bg-stone-50/80';
    if (isImminent) return 'bg-gradient-to-br from-amber-50 to-orange-50/50';
    if (actionPriority === 'due') {
      if (colorScheme === 'rose') return 'bg-gradient-to-br from-rose-50/60 to-pink-50/40';
      if (colorScheme === 'amber') return 'bg-gradient-to-br from-amber-50/60 to-orange-50/40';
      if (colorScheme === 'violet') return 'bg-gradient-to-br from-violet-50/60 to-purple-50/40';
      if (colorScheme === 'emerald') return 'bg-gradient-to-br from-emerald-50/60 to-teal-50/40';
      if (colorScheme === 'cyan') return 'bg-gradient-to-br from-cyan-50/60 to-sky-50/40';
    }
    return 'bg-white';
  };

  // Border color based on colorScheme
  const getBorderColor = () => {
    if (isTerminal && terminalType === 'success') return 'border-emerald-200/60';
    if (isTerminal) return 'border-stone-200/60';
    if (isImminent) return 'border-amber-200/80';
    if (actionPriority === 'due') {
      if (colorScheme === 'rose') return 'border-rose-200/60';
      if (colorScheme === 'amber') return 'border-amber-200/60';
      if (colorScheme === 'violet') return 'border-violet-200/60';
      if (colorScheme === 'emerald') return 'border-emerald-200/60';
      if (colorScheme === 'cyan') return 'border-cyan-200/60';
    }
    return 'border-stone-200/80';
  };

  // Get button styles based on colorScheme and priority
  const getButtonStyles = () => {
    if (actionPriority === 'due') {
      const schemes = {
        rose: 'bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600 shadow-sm shadow-rose-500/20',
        amber: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-sm shadow-amber-500/20',
        violet: 'bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:from-violet-600 hover:to-purple-600 shadow-sm shadow-violet-500/20',
        emerald: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-sm shadow-emerald-500/20',
        cyan: 'bg-gradient-to-r from-cyan-500 to-sky-500 text-white hover:from-cyan-600 hover:to-sky-600 shadow-sm shadow-cyan-500/20',
        stone: 'bg-stone-800 text-white hover:bg-stone-900',
      };
      return schemes[colorScheme] || schemes.stone;
    }
    if (actionPriority === 'upcoming') {
      const schemes = {
        rose: 'bg-rose-100 text-rose-700 hover:bg-rose-200',
        amber: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
        violet: 'bg-violet-100 text-violet-700 hover:bg-violet-200',
        emerald: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
        cyan: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200',
        stone: 'bg-stone-100 text-stone-700 hover:bg-stone-200',
      };
      return schemes[colorScheme] || schemes.stone;
    }
    // reactive
    return 'bg-stone-100 text-stone-700 hover:bg-stone-200';
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
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          {/* Avatar - uses colorScheme */}
          <div className={`
            w-11 h-11 rounded-xl flex items-center justify-center text-sm font-semibold flex-shrink-0 transition-colors
            ${isTerminal && terminalType === 'success'
              ? 'bg-emerald-100 text-emerald-700'
              : isTerminal
                ? 'bg-stone-200/80 text-stone-500'
                : isImminent
                  ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                  : actionPriority === 'due'
                    ? colorScheme === 'rose' ? 'bg-rose-100 text-rose-700'
                    : colorScheme === 'amber' ? 'bg-amber-100 text-amber-700'
                    : colorScheme === 'violet' ? 'bg-violet-100 text-violet-700'
                    : colorScheme === 'emerald' ? 'bg-emerald-100 text-emerald-700'
                    : colorScheme === 'cyan' ? 'bg-cyan-100 text-cyan-700'
                    : 'bg-rose-100 text-rose-700'
                    : 'bg-stone-100 text-stone-600'
            }
          `}>
            {getClientInitials(consultation.firstName, consultation.lastName)}
          </div>

          <div className="flex-1 min-w-0">
            {/* Name - Serif for editorial feel */}
            <h4
              className="text-base font-semibold text-stone-900 truncate leading-tight"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              {consultation.firstName} {consultation.lastName}
            </h4>
            <p className="text-sm text-stone-400 truncate mt-0.5">
              {consultation.clinicianName}
            </p>
          </div>

          {/* Time pill for confirmed (pre-consult only) */}
          {isConfirmed && !isConsultPast && (
            <span className={`
              flex-shrink-0 px-2.5 py-1 text-xs font-semibold rounded-full
              ${isImminent
                ? 'bg-amber-500 text-white'
                : isTodayConsult
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-cyan-100 text-cyan-700'
              }
            `}>
              {timeInfo.label}
            </span>
          )}
        </div>

        {/* Status line - uses colorScheme */}
        <div className="flex items-center justify-between mb-4">
          <p className={`text-sm font-medium ${
            actionPriority === 'due'
              ? colorScheme === 'rose' ? 'text-rose-700'
              : colorScheme === 'amber' ? 'text-amber-700'
              : colorScheme === 'violet' ? 'text-violet-700'
              : colorScheme === 'emerald' ? 'text-emerald-700'
              : colorScheme === 'cyan' ? 'text-cyan-700'
              : 'text-rose-700'
              : actionPriority === 'upcoming'
                ? colorScheme === 'rose' ? 'text-rose-600'
                : colorScheme === 'amber' ? 'text-amber-600'
                : colorScheme === 'violet' ? 'text-violet-600'
                : colorScheme === 'emerald' ? 'text-emerald-600'
                : colorScheme === 'cyan' ? 'text-cyan-600'
                : 'text-amber-600'
                : 'text-stone-500'
          }`}>
            {statusLabel || 'No action needed'}
          </p>

          {/* Time for non-confirmed or post-consult */}
          {(!isConfirmed || isConsultPast) && (
            <div className="flex items-center gap-1.5 text-xs text-stone-400">
              <Clock size={11} strokeWidth={1.5} />
              <span>{getDisplayInfo()}</span>
            </div>
          )}
        </div>

        {/* Transferred badge */}
        {consultation.wasTransferred && (
          <div className="mb-3">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
              Transferred
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Join button */}
          {showJoinButton && hasVideoLink && consultation.meetingLink && (
            <a
              href={isJoinActive ? consultation.meetingLink : undefined}
              target={isJoinActive ? "_blank" : undefined}
              rel={isJoinActive ? "noopener noreferrer" : undefined}
              onClick={(e) => { e.stopPropagation(); if (!isJoinActive) e.preventDefault(); }}
              className={`
                flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all
                ${isJoinActive
                  ? isImminent
                    ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm shadow-amber-500/20'
                    : 'bg-stone-900 text-white hover:bg-stone-800'
                  : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                }
              `}
            >
              <Video size={15} strokeWidth={1.5} />
              Join
            </a>
          )}

          {showJoinButton && isPhoneCall && consultation.meetingPhone && (
            <a
              href={isJoinActive ? `tel:${consultation.meetingPhone}` : undefined}
              onClick={(e) => { e.stopPropagation(); if (!isJoinActive) e.preventDefault(); }}
              className={`
                flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all
                ${isJoinActive
                  ? isImminent
                    ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm shadow-amber-500/20'
                    : 'bg-stone-900 text-white hover:bg-stone-800'
                  : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                }
              `}
            >
              <PhoneCall size={15} strokeWidth={1.5} />
              Call
            </a>
          )}

          {/* Action button - uses colorScheme */}
          {showActionButton && (
            <button
              onClick={(e) => { e.stopPropagation(); onTakeAction(); }}
              className={`
                flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-all
                ${getButtonStyles()}
              `}
            >
              {buttonLabel}
              <ChevronRight size={14} strokeWidth={2} />
            </button>
          )}

          {/* Terminal view button */}
          {isTerminal && (
            <button
              onClick={(e) => { e.stopPropagation(); onClick(); }}
              className={`
                flex-1 px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 transition-colors
                ${terminalType === 'success'
                  ? 'bg-emerald-100/80 text-emerald-700 hover:bg-emerald-100'
                  : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                }
              `}
            >
              View
              <ChevronRight size={14} />
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
}

const KanbanColumnComponent: React.FC<KanbanColumnComponentProps> = ({
  column,
  consultations,
  onTakeAction,
  onSelectConsultation,
}) => {
  const dueCount = consultations.filter(c => getActionInfo(c).priority === 'due').length;
  const upcomingCount = consultations.filter(c => getActionInfo(c).priority === 'upcoming').length;
  const actionCount = dueCount + upcomingCount;

  return (
    <div className={`
      flex flex-col h-full w-[340px] min-w-[340px] rounded-2xl overflow-hidden
      ${column.isTerminal
        ? column.terminalType === 'success'
          ? 'bg-gradient-to-b from-emerald-50/50 to-white/80'
          : 'bg-gradient-to-b from-stone-100/50 to-white/80'
        : 'bg-white/90'
      }
      border border-stone-200/60
      backdrop-blur-sm
    `}
    style={{ boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.06)' }}
    >
      {/* Header */}
      <div className={`
        px-5 py-4 border-b
        ${column.isTerminal && column.terminalType === 'success'
          ? 'border-emerald-100 bg-emerald-50/50'
          : column.isTerminal
            ? 'border-stone-200/60 bg-stone-50/50'
            : 'border-stone-100 bg-stone-50/30'
        }
      `}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3
              className={`text-lg font-semibold tracking-tight ${
                column.isTerminal && column.terminalType === 'success'
                  ? 'text-emerald-800'
                  : column.isTerminal
                    ? 'text-stone-500'
                    : 'text-stone-800'
              }`}
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              {column.title}
            </h3>

            {/* Count badge */}
            <span className={`
              px-2 py-0.5 text-sm font-semibold rounded-full tabular-nums
              ${column.isTerminal && column.terminalType === 'success'
                ? 'bg-emerald-100 text-emerald-700'
                : column.isTerminal
                  ? 'bg-stone-200/80 text-stone-500'
                  : 'bg-stone-100 text-stone-600'
              }
            `}>
              {consultations.length}
            </span>
          </div>

          {/* Action indicator */}
          {actionCount > 0 && !column.isTerminal && (
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
              <div className={`
                w-12 h-12 rounded-2xl flex items-center justify-center mb-3
                ${column.isTerminal && column.terminalType === 'success'
                  ? 'bg-emerald-100/80'
                  : 'bg-stone-100'
                }
              `}>
                <span className={`text-lg ${
                  column.isTerminal && column.terminalType === 'success'
                    ? 'text-emerald-400'
                    : 'text-stone-300'
                }`}>
                  ∅
                </span>
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
// MAIN COMPONENT
// -----------------------------------------------------------------------------

export const ConsultationsKanban: React.FC<ConsultationsKanbanProps> = ({
  consultations,
  onTakeAction,
  onSelectConsultation,
}) => {
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [selectedClinician, setSelectedClinician] = useState<string | null>(null);

  const clinicians = useMemo(() => {
    const names = new Set(consultations.map(c => c.clinicianName));
    return Array.from(names).sort();
  }, [consultations]);

  const filteredConsultations = useMemo(() => {
    let result = consultations;
    if (selectedClinician) result = result.filter(c => c.clinicianName === selectedClinician);
    if (filterMode === 'needs_action') result = result.filter(consultationNeedsAction);
    return result;
  }, [consultations, filterMode, selectedClinician]);

  const counts = useMemo(() => {
    let base = selectedClinician ? consultations.filter(c => c.clinicianName === selectedClinician) : consultations;
    return {
      all: base.length,
      needsAction: base.filter(consultationNeedsAction).length,
    };
  }, [consultations, selectedClinician]);

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
          const aInfo = getActionInfo(a);
          const bInfo = getActionInfo(b);
          const pOrder = { due: 0, upcoming: 1, reactive: 2, null: 3 };
          const aPriority = pOrder[aInfo.priority ?? 'null'];
          const bPriority = pOrder[bInfo.priority ?? 'null'];
          if (aPriority !== bPriority) return aPriority - bPriority;
          return new Date(a.datetime).getTime() - new Date(b.datetime).getTime();
        }),
    }));
  }, [filteredConsultations]);

  return (
    <div
      className="h-full flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #fafaf9 0%, #f5f5f4 100%)',
      }}
    >
      {/* Header */}
      <div className="px-6 py-5 border-b border-stone-200/80 bg-white/80 backdrop-blur-sm flex-shrink-0 relative z-50">
        <div className="flex items-center gap-5">
          <h2
            className="text-2xl font-semibold text-stone-900 tracking-tight"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
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
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 p-5 h-full min-w-max">
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
