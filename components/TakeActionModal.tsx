import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Check,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  CalendarCheck,
  CalendarX,
  MessageSquare,
  UserX,
  UserPlus,
  FileText,
  ArrowRight,
  AlertTriangle,
  Phone,
  Mail,
  Sparkles,
  ChevronRight,
  Undo2,
  PartyPopper,
  Bell,
  Send,
} from 'lucide-react';
import type {
  Consultation,
  ConsultationStage,
  ActionType,
  LostStage,
} from '../types/consultations';
import {
  formatConsultationDate,
  isConsultationPast,
  getClientInitials,
} from '../types/consultations';

// =============================================================================
// TAKE ACTION MODAL
// =============================================================================
// A decision-focused modal that shows the client journey and presents
// contextual next steps. Designed for time-starved practice owners who
// need clarity, not complexity.
// =============================================================================

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

interface TakeActionModalProps {
  consultation: Consultation;
  onClose: () => void;
  onAction: (consultationId: string, action: ActionType, metadata?: ActionMetadata) => void;
  onTransfer: (consultationId: string) => void;
}

interface ActionMetadata {
  lostStage?: LostStage;
  notes?: string;
  intakeDate?: string;
  intakeScheduled?: boolean;
}

interface SuccessState {
  action: ActionType;
  actionLabel: string;
  fromStage: ConsultationStage;
  toStage: ConsultationStage;
  toStageLabel: string;
  nextSteps: string[];
  isConversion?: boolean;
  isLost?: boolean;
}

interface DecisionOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: 'green' | 'amber' | 'red' | 'blue' | 'stone';
  action?: ActionType;
  subOptions?: DecisionOption[];
  isDefault?: boolean;
  metadata?: ActionMetadata;
}

interface JourneyStep {
  id: ConsultationStage | 'scheduled';
  label: string;
  shortLabel: string;
  date?: string;
  status: 'completed' | 'current' | 'upcoming' | 'skipped';
}

// -----------------------------------------------------------------------------
// STAGE CONFIGURATION
// -----------------------------------------------------------------------------

const STAGE_QUESTIONS: Record<ConsultationStage, string> = {
  new: 'Ready to confirm this consultation?',
  confirmed: 'How did the consultation go?',
  consult_complete: 'What happened after the consultation?',
  no_show: 'Any update on this no-show?',
  intake_pending: 'Did they schedule their intake?',
  intake_scheduled: 'How is the paperwork coming along?',
  paperwork_pending: 'Is the paperwork complete?',
  paperwork_complete: 'How did the first session go?',
  converted: 'This client has been converted!',
  lost: 'This case has been marked as lost.',
};

// Color mapping for option cards
const OPTION_COLORS = {
  green: {
    bg: 'bg-gradient-to-br from-emerald-50 to-teal-50',
    border: 'border-emerald-200 hover:border-emerald-400',
    activeBorder: 'border-emerald-500',
    icon: 'text-emerald-600',
    text: 'text-emerald-900',
    subtext: 'text-emerald-700',
  },
  amber: {
    bg: 'bg-gradient-to-br from-amber-50 to-orange-50',
    border: 'border-amber-200 hover:border-amber-400',
    activeBorder: 'border-amber-500',
    icon: 'text-amber-600',
    text: 'text-amber-900',
    subtext: 'text-amber-700',
  },
  red: {
    bg: 'bg-gradient-to-br from-rose-50 to-red-50',
    border: 'border-rose-200 hover:border-rose-400',
    activeBorder: 'border-rose-500',
    icon: 'text-rose-600',
    text: 'text-rose-900',
    subtext: 'text-rose-700',
  },
  blue: {
    bg: 'bg-gradient-to-br from-sky-50 to-blue-50',
    border: 'border-sky-200 hover:border-sky-400',
    activeBorder: 'border-sky-500',
    icon: 'text-sky-600',
    text: 'text-sky-900',
    subtext: 'text-sky-700',
  },
  stone: {
    bg: 'bg-gradient-to-br from-stone-50 to-stone-100',
    border: 'border-stone-200 hover:border-stone-400',
    activeBorder: 'border-stone-500',
    icon: 'text-stone-600',
    text: 'text-stone-900',
    subtext: 'text-stone-600',
  },
};

// -----------------------------------------------------------------------------
// JOURNEY TIMELINE COMPONENT
// -----------------------------------------------------------------------------
// A warm, human-centered timeline that shows progress at a glance.
// Design: Soft rounded pill segments connected by a flowing line.
// -----------------------------------------------------------------------------

const JourneyTimeline: React.FC<{ steps: JourneyStep[] }> = ({ steps }) => {
  const currentIndex = steps.findIndex(s => s.status === 'current');

  return (
    <div className="py-2">
      {/* Horizontal scroll wrapper for mobile */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-1 min-w-max px-2 py-3">
          {steps.map((step, index) => {
            const isCompleted = step.status === 'completed';
            const isCurrent = step.status === 'current';
            const isUpcoming = step.status === 'upcoming';
            const isSkipped = step.status === 'skipped';
            const isLast = index === steps.length - 1;

            return (
              <React.Fragment key={step.id}>
                {/* Step pill */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.06, duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className={`
                    relative flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300
                    ${isCompleted ? 'bg-emerald-100' : ''}
                    ${isCurrent ? 'bg-gradient-to-r from-amber-100 via-orange-50 to-amber-100 ring-2 ring-amber-300/50 shadow-sm' : ''}
                    ${isUpcoming ? 'bg-stone-100' : ''}
                    ${isSkipped ? 'bg-rose-50 ring-1 ring-rose-200 ring-dashed' : ''}
                  `}
                >
                  {/* Icon */}
                  <div className={`
                    flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center
                    ${isCompleted ? 'bg-emerald-500 text-white' : ''}
                    ${isCurrent ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' : ''}
                    ${isUpcoming ? 'bg-stone-300 text-stone-500' : ''}
                    ${isSkipped ? 'bg-rose-300 text-rose-600' : ''}
                  `}>
                    {isCompleted && <Check size={11} strokeWidth={3} />}
                    {isCurrent && (
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                      >
                        <Sparkles size={11} strokeWidth={2.5} />
                      </motion.div>
                    )}
                    {isUpcoming && <Circle size={8} strokeWidth={2.5} />}
                    {isSkipped && <X size={10} strokeWidth={2.5} />}
                  </div>

                  {/* Label */}
                  <span className={`
                    text-[11px] font-semibold tracking-wide whitespace-nowrap
                    ${isCompleted ? 'text-emerald-700' : ''}
                    ${isCurrent ? 'text-amber-800' : ''}
                    ${isUpcoming ? 'text-stone-400' : ''}
                    ${isSkipped ? 'text-rose-500' : ''}
                  `}>
                    {step.shortLabel}
                  </span>

                  {/* Date badge for current */}
                  {isCurrent && step.date && (
                    <span className="text-[9px] font-medium text-amber-600 bg-amber-200/50 px-1.5 py-0.5 rounded-full">
                      {step.date}
                    </span>
                  )}
                </motion.div>

                {/* Connector line */}
                {!isLast && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: index * 0.06 + 0.1, duration: 0.2 }}
                    className={`
                      w-4 h-0.5 origin-left flex-shrink-0
                      ${index < currentIndex ? 'bg-emerald-300' : 'bg-stone-200'}
                    `}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Subtle gradient fade on edges for scroll hint */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

// -----------------------------------------------------------------------------
// DECISION CARD COMPONENT
// -----------------------------------------------------------------------------

interface DecisionCardProps {
  option: DecisionOption;
  isSelected: boolean;
  onSelect: () => void;
  isExpanded?: boolean;
  onSubSelect?: (subOption: DecisionOption) => void;
  selectedSubOption?: DecisionOption | null;
}

const DecisionCard: React.FC<DecisionCardProps> = ({
  option,
  isSelected,
  onSelect,
  isExpanded,
  onSubSelect,
  selectedSubOption,
}) => {
  const colors = OPTION_COLORS[option.color];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <button
        onClick={onSelect}
        className={`
          w-full text-left p-5 rounded-2xl border-2 transition-all duration-200
          ${colors.bg} ${isSelected ? colors.activeBorder : colors.border}
          ${isSelected ? 'ring-4 ring-opacity-20' : ''}
          ${option.color === 'green' && isSelected ? 'ring-emerald-500' : ''}
          ${option.color === 'amber' && isSelected ? 'ring-amber-500' : ''}
          ${option.color === 'red' && isSelected ? 'ring-rose-500' : ''}
          ${option.color === 'blue' && isSelected ? 'ring-sky-500' : ''}
          ${option.isDefault ? 'shadow-md' : ''}
        `}
      >
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
            option.color === 'green' ? 'bg-emerald-100' :
            option.color === 'amber' ? 'bg-amber-100' :
            option.color === 'red' ? 'bg-rose-100' :
            option.color === 'blue' ? 'bg-sky-100' :
            'bg-stone-200'
          }`}>
            <div className={colors.icon}>
              {option.icon}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className={`text-lg font-bold ${colors.text}`} style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                {option.label}
              </h4>
              {option.isDefault && (
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-200 text-emerald-800 rounded-full">
                  Recommended
                </span>
              )}
            </div>
            <p className={`text-sm mt-1 ${colors.subtext}`}>
              {option.description}
            </p>
          </div>

          {option.subOptions && option.subOptions.length > 0 && (
            <ChevronRight
              size={20}
              className={`flex-shrink-0 transition-transform duration-200 ${colors.icon} ${isExpanded ? 'rotate-90' : ''}`}
            />
          )}

          {!option.subOptions && isSelected && (
            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
              option.color === 'green' ? 'bg-emerald-500' :
              option.color === 'amber' ? 'bg-amber-500' :
              option.color === 'red' ? 'bg-rose-500' :
              option.color === 'blue' ? 'bg-sky-500' :
              'bg-stone-500'
            } text-white`}>
              <Check size={14} strokeWidth={3} />
            </div>
          )}
        </div>
      </button>

      {/* Sub-options */}
      <AnimatePresence>
        {isExpanded && option.subOptions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="ml-8 mt-3 space-y-2 overflow-hidden"
          >
            {option.subOptions.map((subOption) => (
              <button
                key={subOption.id}
                onClick={() => onSubSelect?.(subOption)}
                className={`
                  w-full text-left p-4 rounded-xl border-2 transition-all duration-200
                  ${OPTION_COLORS[subOption.color].bg}
                  ${selectedSubOption?.id === subOption.id
                    ? OPTION_COLORS[subOption.color].activeBorder
                    : OPTION_COLORS[subOption.color].border
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    subOption.color === 'green' ? 'bg-emerald-100' :
                    subOption.color === 'amber' ? 'bg-amber-100' :
                    subOption.color === 'red' ? 'bg-rose-100' :
                    subOption.color === 'blue' ? 'bg-sky-100' :
                    'bg-stone-200'
                  }`}>
                    <div className={OPTION_COLORS[subOption.color].icon}>
                      {subOption.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold ${OPTION_COLORS[subOption.color].text}`}>
                      {subOption.label}
                    </p>
                    <p className={`text-xs ${OPTION_COLORS[subOption.color].subtext}`}>
                      {subOption.description}
                    </p>
                  </div>
                  {selectedSubOption?.id === subOption.id && (
                    <Check size={18} className={OPTION_COLORS[subOption.color].icon} strokeWidth={3} />
                  )}
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// -----------------------------------------------------------------------------
// FOLLOW-UP SEQUENCE VISUALIZATION
// -----------------------------------------------------------------------------

interface FollowUpSequenceProps {
  currentCount: number;
  onContinue: () => void;
  onMarkLost: () => void;
}

const FollowUpSequence: React.FC<FollowUpSequenceProps> = ({
  currentCount,
  onContinue,
  onMarkLost,
}) => {
  const steps = [
    { label: 'Immediate', sublabel: 'Today', done: currentCount >= 1 },
    { label: '24 Hours', sublabel: 'Tomorrow', done: currentCount >= 2 },
    { label: '72 Hours', sublabel: 'Day 3', done: currentCount >= 3 },
    { label: 'Mark Lost', sublabel: 'Final', done: false, isLast: true },
  ];

  const currentStepIndex = currentCount;

  return (
    <div className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-2xl p-6 border-2 border-rose-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
          <Clock size={20} className="text-rose-600" />
        </div>
        <div>
          <h4 className="font-bold text-rose-900" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
            Follow-Up Sequence
          </h4>
          <p className="text-sm text-rose-700">
            {currentCount === 0 ? 'Starting the sequence...' : `${currentCount} of 3 follow-ups sent`}
          </p>
        </div>
      </div>

      {/* Sequence visualization */}
      <div className="relative py-4">
        <div className="absolute top-1/2 left-4 right-4 h-1 -translate-y-1/2 bg-rose-200 rounded-full" />
        <div
          className="absolute top-1/2 left-4 h-1 -translate-y-1/2 bg-rose-400 rounded-full transition-all duration-500"
          style={{ width: `${(currentCount / 3) * 100}%`, maxWidth: 'calc(100% - 32px)' }}
        />

        <div className="relative flex justify-between">
          {steps.map((step, index) => (
            <div key={step.label} className="flex flex-col items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center z-10
                ${step.done ? 'bg-rose-500 text-white' :
                  index === currentStepIndex ? 'bg-amber-500 text-white ring-4 ring-amber-200' :
                  'bg-rose-200 text-rose-400'}
              `}>
                {step.done ? <Check size={14} strokeWidth={3} /> :
                 step.isLast ? <AlertTriangle size={14} /> :
                 <span className="text-xs font-bold">{index + 1}</span>}
              </div>
              <p className={`text-xs font-semibold mt-2 ${
                step.done ? 'text-rose-600' :
                index === currentStepIndex ? 'text-amber-700' :
                'text-rose-400'
              }`}>
                {step.label}
              </p>
              <p className="text-[10px] text-rose-400">{step.sublabel}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-4">
        {currentCount < 3 ? (
          <>
            <button
              onClick={onContinue}
              className="flex-1 px-4 py-3 rounded-xl bg-rose-500 text-white font-semibold hover:bg-rose-600 transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare size={18} />
              Send Follow-Up #{currentCount + 1}
            </button>
            <button
              onClick={onMarkLost}
              className="px-4 py-3 rounded-xl bg-white text-rose-600 font-semibold border border-rose-200 hover:bg-rose-50 transition-colors"
            >
              Give Up
            </button>
          </>
        ) : (
          <button
            onClick={onMarkLost}
            className="flex-1 px-4 py-3 rounded-xl bg-stone-700 text-white font-semibold hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
          >
            <AlertTriangle size={18} />
            Mark as Lost
          </button>
        )}
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// LOST STAGE SELECTOR
// -----------------------------------------------------------------------------

interface LostStageSelectorProps {
  suggestedStage: LostStage;
  onSelect: (stage: LostStage) => void;
  onCancel: () => void;
}

const LostStageSelector: React.FC<LostStageSelectorProps> = ({
  suggestedStage,
  onSelect,
  onCancel,
}) => {
  const [selected, setSelected] = useState<LostStage>(suggestedStage);

  const stages: { id: LostStage; label: string; description: string }[] = [
    { id: 'pre_consult', label: 'Pre-Consult', description: 'Never made it to consultation' },
    { id: 'pre_intake', label: 'Pre-Intake', description: 'Consulted but never booked intake' },
    { id: 'pre_paperwork', label: 'Pre-Paperwork', description: 'Booked intake but never finished forms' },
    { id: 'pre_first_session', label: 'Pre-First Session', description: 'Completed forms but never attended' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-gradient-to-br from-stone-50 to-stone-100 rounded-2xl p-6 border-2 border-stone-300"
    >
      <h4 className="font-bold text-stone-900 mb-4" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
        Where was this client lost?
      </h4>

      <div className="space-y-2">
        {stages.map((stage) => (
          <button
            key={stage.id}
            onClick={() => setSelected(stage.id)}
            className={`
              w-full text-left p-4 rounded-xl border-2 transition-all
              ${selected === stage.id
                ? 'bg-stone-800 border-stone-800 text-white'
                : 'bg-white border-stone-200 hover:border-stone-400'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selected === stage.id ? 'border-white bg-white' : 'border-stone-300'
              }`}>
                {selected === stage.id && <div className="w-2.5 h-2.5 rounded-full bg-stone-800" />}
              </div>
              <div>
                <p className="font-semibold">{stage.label}</p>
                <p className={`text-sm ${selected === stage.id ? 'text-stone-300' : 'text-stone-500'}`}>
                  {stage.description}
                </p>
              </div>
              {stage.id === suggestedStage && (
                <span className="ml-auto px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-800 rounded-full">
                  Auto-detected
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-3 mt-5">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-3 rounded-xl bg-white text-stone-600 font-semibold border border-stone-200 hover:bg-stone-50 transition-colors"
        >
          Go Back
        </button>
        <button
          onClick={() => onSelect(selected)}
          className="flex-1 px-4 py-3 rounded-xl bg-stone-800 text-white font-semibold hover:bg-stone-900 transition-colors"
        >
          Confirm Lost
        </button>
      </div>
    </motion.div>
  );
};

// -----------------------------------------------------------------------------
// SUCCESS CONFIRMATION COMPONENT
// -----------------------------------------------------------------------------

interface SuccessConfirmationProps {
  success: SuccessState;
  clientName: string;
  onClose: () => void;
}

const SuccessConfirmation: React.FC<SuccessConfirmationProps> = ({
  success,
  clientName,
  onClose,
}) => {
  // Auto-close after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className="relative flex flex-col items-center text-center py-8 px-6"
    >
      {/* Success icon with celebration animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', damping: 12, stiffness: 200 }}
        className={`
          relative w-20 h-20 rounded-full flex items-center justify-center mb-6
          ${success.isConversion
            ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
            : success.isLost
              ? 'bg-gradient-to-br from-stone-400 to-stone-500'
              : 'bg-gradient-to-br from-amber-400 to-orange-500'
          }
        `}
      >
        {success.isConversion ? (
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <PartyPopper size={36} className="text-white" />
          </motion.div>
        ) : success.isLost ? (
          <UserX size={36} className="text-white" />
        ) : (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', damping: 10 }}
          >
            <Check size={36} className="text-white" strokeWidth={3} />
          </motion.div>
        )}

        {/* Celebration particles for conversion */}
        {success.isConversion && (
          <>
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  x: Math.cos((i * Math.PI * 2) / 8) * 60,
                  y: Math.sin((i * Math.PI * 2) / 8) * 60,
                }}
                transition={{ delay: 0.3 + i * 0.05, duration: 0.8 }}
                className="absolute w-2 h-2 rounded-full bg-amber-400"
              />
            ))}
          </>
        )}
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`text-2xl font-bold mb-2 ${
          success.isConversion ? 'text-emerald-800' : success.isLost ? 'text-stone-700' : 'text-stone-900'
        }`}
        style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
      >
        {success.isConversion
          ? 'Client Converted!'
          : success.isLost
            ? 'Case Closed'
            : 'Action Complete'}
      </motion.h3>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="text-stone-600 mb-6"
      >
        {success.actionLabel}
      </motion.p>

      {/* Movement visualization */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-sm bg-stone-50 rounded-2xl p-4 mb-6"
      >
        <div className="flex items-center justify-between gap-3">
          {/* From stage */}
          <div className="flex-1 text-center">
            <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center mx-auto mb-2">
              <Check size={16} className="text-stone-500" />
            </div>
            <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">From</p>
            <p className="text-sm font-semibold text-stone-700">{success.fromStage.replace('_', ' ')}</p>
          </div>

          {/* Arrow */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="flex-shrink-0"
          >
            <ArrowRight size={24} className="text-stone-300" />
          </motion.div>

          {/* To stage */}
          <div className="flex-1 text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${
                success.isConversion
                  ? 'bg-emerald-500'
                  : success.isLost
                    ? 'bg-stone-400'
                    : 'bg-amber-500'
              }`}
            >
              {success.isConversion ? (
                <Sparkles size={16} className="text-white" />
              ) : success.isLost ? (
                <X size={16} className="text-white" />
              ) : (
                <ArrowRight size={16} className="text-white" />
              )}
            </motion.div>
            <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">Now</p>
            <p className={`text-sm font-semibold ${
              success.isConversion ? 'text-emerald-700' : success.isLost ? 'text-stone-600' : 'text-amber-700'
            }`}>
              {success.toStageLabel}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Next steps */}
      {success.nextSteps.length > 0 && !success.isLost && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-sm"
        >
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">
            What happens next
          </p>
          <div className="space-y-2">
            {success.nextSteps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="flex items-center gap-3 p-3 bg-white rounded-xl border border-stone-200"
              >
                <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0">
                  {idx === 0 ? <Bell size={12} className="text-stone-500" /> : <Send size={12} className="text-stone-500" />}
                </div>
                <p className="text-sm text-stone-700">{step}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Progress bar auto-close indicator */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 3.5, ease: 'linear' }}
        className={`absolute bottom-0 left-0 right-0 h-1 origin-left ${
          success.isConversion ? 'bg-emerald-400' : success.isLost ? 'bg-stone-300' : 'bg-amber-400'
        }`}
      />
    </motion.div>
  );
};

// -----------------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------------

export const TakeActionModal: React.FC<TakeActionModalProps> = ({
  consultation,
  onClose,
  onAction,
  onTransfer,
}) => {
  const [selectedOption, setSelectedOption] = useState<DecisionOption | null>(null);
  const [selectedSubOption, setSelectedSubOption] = useState<DecisionOption | null>(null);
  const [showLostSelector, setShowLostSelector] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successState, setSuccessState] = useState<SuccessState | null>(null);

  const isPast = isConsultationPast(consultation.datetime);

  // Build the journey steps based on current stage
  const journeySteps: JourneyStep[] = useMemo(() => {
    const stages: ConsultationStage[] = ['new', 'confirmed', 'consult_complete', 'intake_pending', 'intake_scheduled', 'paperwork_pending', 'paperwork_complete', 'converted'];
    const currentIndex = stages.indexOf(consultation.stage);

    // Simplified journey for display
    const displaySteps: { stage: ConsultationStage | 'scheduled'; label: string; shortLabel: string }[] = [
      { stage: 'new', label: 'Scheduled', shortLabel: 'Booked' },
      { stage: 'confirmed', label: 'Confirmed', shortLabel: 'Confirmed' },
      { stage: 'consult_complete', label: 'Consultation', shortLabel: 'Consult' },
      { stage: 'intake_pending', label: 'Intake Pending', shortLabel: 'Follow-Up' },
      { stage: 'intake_scheduled', label: 'Intake Scheduled', shortLabel: 'Intake' },
      { stage: 'paperwork_complete', label: 'Ready', shortLabel: 'Paperwork' },
      { stage: 'converted', label: 'Converted', shortLabel: 'Converted' },
    ];

    // For no-show, we show a different path
    if (consultation.stage === 'no_show') {
      return [
        { id: 'new' as ConsultationStage, label: 'Scheduled', shortLabel: 'Booked', status: 'completed' as const },
        { id: 'confirmed' as ConsultationStage, label: 'Confirmed', shortLabel: 'Confirmed', status: 'completed' as const },
        { id: 'no_show' as ConsultationStage, label: 'No-Show', shortLabel: 'No-Show', status: 'current' as const },
        { id: 'converted' as ConsultationStage, label: 'Recovered?', shortLabel: 'Recovered?', status: 'upcoming' as const },
      ];
    }

    // For lost, show where they dropped
    if (consultation.stage === 'lost') {
      const lostIndex = consultation.lostStage === 'pre_consult' ? 1 :
                        consultation.lostStage === 'pre_intake' ? 3 :
                        consultation.lostStage === 'pre_paperwork' ? 4 : 5;
      return displaySteps.slice(0, Math.min(lostIndex + 1, displaySteps.length)).map((step, idx) => ({
        id: step.stage,
        label: step.label,
        shortLabel: step.shortLabel,
        status: idx < lostIndex ? 'completed' as const : 'skipped' as const,
      }));
    }

    // Normal path
    const stageMapping: Record<ConsultationStage, number> = {
      new: 0,
      confirmed: 1,
      consult_complete: 2,
      no_show: 2,
      intake_pending: 3,
      intake_scheduled: 4,
      paperwork_pending: 5,
      paperwork_complete: 5,
      converted: 6,
      lost: 6,
    };

    const currentDisplayIndex = stageMapping[consultation.stage];

    return displaySteps.map((step, idx) => ({
      id: step.stage,
      label: step.label,
      shortLabel: step.shortLabel,
      status: idx < currentDisplayIndex ? 'completed' as const :
              idx === currentDisplayIndex ? 'current' as const :
              'upcoming' as const,
      date: idx === 0 ? formatConsultationDate(consultation.datetime).split(',')[0] : undefined,
    }));
  }, [consultation]);

  // Build decision options based on current stage
  const decisionOptions: DecisionOption[] = useMemo(() => {
    switch (consultation.stage) {
      case 'new':
        return [
          {
            id: 'confirm',
            label: 'Send Confirmation Email',
            description: 'Confirm this consultation is on the calendar',
            icon: <Mail size={22} />,
            color: 'green',
            action: 'send_confirmation',
            isDefault: true,
          },
          {
            id: 'transfer',
            label: 'Transfer to Another Clinician',
            description: 'Reassign this client before the consultation',
            icon: <UserPlus size={22} />,
            color: 'blue',
          },
          {
            id: 'lost',
            label: 'Client Cancelled',
            description: 'Mark as lost before consultation',
            icon: <UserX size={22} />,
            color: 'red',
            action: 'mark_lost',
            metadata: { lostStage: 'pre_consult' },
          },
        ];

      case 'confirmed':
        if (!isPast) {
          // Future consultation - no action needed yet
          return [
            {
              id: 'waiting',
              label: 'Consultation Upcoming',
              description: `Scheduled for ${formatConsultationDate(consultation.datetime)}`,
              icon: <Calendar size={22} />,
              color: 'blue',
            },
            {
              id: 'transfer',
              label: 'Transfer to Another Clinician',
              description: 'Reassign this client to someone else',
              icon: <UserPlus size={22} />,
              color: 'stone',
            },
          ];
        }
        // Past consultation - need to record outcome
        return [
          {
            id: 'attended',
            label: 'Went Well',
            description: 'Client attended and is interested in moving forward',
            icon: <CheckCircle2 size={22} />,
            color: 'green',
            isDefault: true,
            subOptions: [
              {
                id: 'intake_scheduled',
                label: 'They Scheduled Intake',
                description: 'Intake appointment is already on the books',
                icon: <CalendarCheck size={18} />,
                color: 'green',
                action: 'send_post_consult',
                metadata: { intakeScheduled: true },
              },
              {
                id: 'intake_pending',
                label: 'Needs to Schedule',
                description: "We'll send reminders to book intake",
                icon: <Clock size={18} />,
                color: 'amber',
                action: 'send_post_consult',
                metadata: { intakeScheduled: false },
              },
            ],
          },
          {
            id: 'no_show',
            label: "Didn't Show Up",
            description: "Client missed the consultation — we'll start follow-up",
            icon: <CalendarX size={22} />,
            color: 'red',
            action: 'mark_no_show',
          },
          {
            id: 'declined',
            label: 'Client Declined',
            description: 'They attended but decided not to proceed',
            icon: <UserX size={22} />,
            color: 'stone',
            action: 'mark_lost',
            metadata: { lostStage: 'pre_intake' },
          },
          {
            id: 'transfer',
            label: 'Transfer to Another Clinician',
            description: 'Client wants to work with someone else',
            icon: <UserPlus size={22} />,
            color: 'blue',
          },
        ];

      case 'consult_complete':
        return [
          {
            id: 'send_followup',
            label: 'Send Post-Consult Message',
            description: 'Follow up to help them schedule their intake',
            icon: <MessageSquare size={22} />,
            color: 'green',
            action: 'send_post_consult',
            isDefault: true,
          },
          {
            id: 'lost',
            label: 'Client Not Interested',
            description: "They've decided not to proceed",
            icon: <UserX size={22} />,
            color: 'red',
            action: 'mark_lost',
            metadata: { lostStage: 'pre_intake' },
          },
        ];

      case 'intake_pending':
        return [
          {
            id: 'scheduled',
            label: 'Intake Scheduled',
            description: 'Client has booked their intake appointment',
            icon: <CalendarCheck size={22} />,
            color: 'green',
            action: 'mark_intake_scheduled',
            isDefault: true,
          },
          {
            id: 'still_waiting',
            label: 'Still Waiting',
            description: 'Send another reminder to schedule',
            icon: <Clock size={22} />,
            color: 'amber',
          },
          {
            id: 'lost',
            label: 'Client Unresponsive',
            description: 'Mark as lost after multiple attempts',
            icon: <UserX size={22} />,
            color: 'red',
            action: 'mark_lost',
            metadata: { lostStage: 'pre_intake' },
          },
        ];

      case 'intake_scheduled':
        return [
          {
            id: 'paperwork_done',
            label: 'Paperwork Complete',
            description: 'All forms have been submitted',
            icon: <FileText size={22} />,
            color: 'green',
            action: 'mark_paperwork_complete',
            isDefault: true,
          },
          {
            id: 'send_reminder',
            label: 'Send Reminder',
            description: 'Nudge them to complete their paperwork',
            icon: <MessageSquare size={22} />,
            color: 'amber',
            action: 'send_paperwork_reminder',
          },
          {
            id: 'lost',
            label: 'Client Not Responding',
            description: 'Mark as lost',
            icon: <UserX size={22} />,
            color: 'red',
            action: 'mark_lost',
            metadata: { lostStage: 'pre_paperwork' },
          },
        ];

      case 'paperwork_pending':
        return [
          {
            id: 'paperwork_done',
            label: 'Paperwork Complete',
            description: 'All forms have been submitted',
            icon: <FileText size={22} />,
            color: 'green',
            action: 'mark_paperwork_complete',
            isDefault: true,
          },
          {
            id: 'send_reminder',
            label: 'Send Another Reminder',
            description: 'Nudge them to complete their paperwork',
            icon: <MessageSquare size={22} />,
            color: 'amber',
            action: 'send_paperwork_reminder',
          },
          {
            id: 'lost',
            label: 'Client Unresponsive',
            description: 'Mark as lost',
            icon: <UserX size={22} />,
            color: 'red',
            action: 'mark_lost',
            metadata: { lostStage: 'pre_paperwork' },
          },
        ];

      case 'paperwork_complete':
        return [
          {
            id: 'session_done',
            label: 'First Session Complete',
            description: 'Client has completed their first therapy session',
            icon: <Sparkles size={22} />,
            color: 'green',
            action: 'mark_first_session_done',
            isDefault: true,
          },
          {
            id: 'no_show',
            label: "Didn't Show Up",
            description: 'Client missed their first session',
            icon: <CalendarX size={22} />,
            color: 'red',
          },
          {
            id: 'lost',
            label: 'Client Cancelled',
            description: 'They decided not to proceed',
            icon: <UserX size={22} />,
            color: 'stone',
            action: 'mark_lost',
            metadata: { lostStage: 'pre_first_session' },
          },
        ];

      default:
        return [];
    }
  }, [consultation.stage, isPast, consultation.datetime]);

  // Handle option selection
  const handleOptionSelect = (option: DecisionOption) => {
    if (option.id === 'transfer') {
      onTransfer(consultation.id);
      return;
    }

    if (option.subOptions && option.subOptions.length > 0) {
      setSelectedOption(selectedOption?.id === option.id ? null : option);
      setSelectedSubOption(null);
    } else {
      setSelectedOption(option);
      setSelectedSubOption(null);
    }
  };

  // Handle sub-option selection
  const handleSubOptionSelect = (subOption: DecisionOption) => {
    setSelectedSubOption(subOption);
  };

  // Generate success state based on action
  const generateSuccessState = (action: ActionType, actionLabel: string, metadata?: ActionMetadata): SuccessState => {
    const fromStage = consultation.stage;
    let toStage: ConsultationStage;
    let toStageLabel: string;
    let nextSteps: string[] = [];
    let isConversion = false;
    let isLost = false;

    switch (action) {
      case 'send_confirmation':
        toStage = 'confirmed';
        toStageLabel = 'Confirmed';
        nextSteps = ['Client will receive confirmation email', 'Reminder sent 24hrs before consultation'];
        break;
      case 'send_post_consult':
        if (metadata?.intakeScheduled) {
          toStage = 'intake_scheduled';
          toStageLabel = 'Intake Scheduled';
          nextSteps = ['Client will receive intake reminder', 'Paperwork reminder sent 72hrs before'];
        } else {
          toStage = 'intake_pending';
          toStageLabel = 'Awaiting Intake';
          nextSteps = ['Follow-up sent to schedule intake', 'Reminders at 24hr, 72hr, and 1 week'];
        }
        break;
      case 'mark_no_show':
        toStage = 'no_show';
        toStageLabel = 'No-Show Follow-Up';
        nextSteps = ['Follow-up sequence started', 'Client will receive 3 reminders'];
        break;
      case 'mark_intake_scheduled':
        toStage = 'intake_scheduled';
        toStageLabel = 'Intake Scheduled';
        nextSteps = ['Paperwork reminder will be sent', 'Follow-up 24hrs before intake'];
        break;
      case 'send_paperwork_reminder':
        toStage = 'paperwork_pending';
        toStageLabel = 'Paperwork Pending';
        nextSteps = ['Reminder sent to complete forms', 'Another reminder in 24hrs if needed'];
        break;
      case 'mark_paperwork_complete':
        toStage = 'paperwork_complete';
        toStageLabel = 'Ready for Session';
        nextSteps = ['Client is all set for first session', 'Confirmation sent for appointment'];
        break;
      case 'mark_first_session_done':
        toStage = 'converted';
        toStageLabel = 'Converted!';
        nextSteps = [];
        isConversion = true;
        break;
      case 'mark_lost':
        toStage = 'lost';
        toStageLabel = `Lost (${metadata?.lostStage?.replace('_', ' ') || 'unknown'})`;
        nextSteps = [];
        isLost = true;
        break;
      case 'send_followup_1':
      case 'send_followup_2':
      case 'send_followup_3':
        toStage = 'no_show';
        toStageLabel = 'No-Show Follow-Up';
        const followUpNum = action === 'send_followup_1' ? 1 : action === 'send_followup_2' ? 2 : 3;
        if (followUpNum < 3) {
          nextSteps = [`Follow-up #${followUpNum} sent`, `Next follow-up in ${followUpNum === 1 ? '24 hours' : '72 hours'}`];
        } else {
          nextSteps = ['Final follow-up sent', 'Consider marking as lost if no response'];
        }
        break;
      default:
        toStage = consultation.stage;
        toStageLabel = consultation.stage.replace('_', ' ');
        nextSteps = [];
    }

    return {
      action,
      actionLabel,
      fromStage,
      toStage,
      toStageLabel,
      nextSteps,
      isConversion,
      isLost,
    };
  };

  // Handle confirm action
  const handleConfirm = async () => {
    const actionOption = selectedSubOption || selectedOption;
    if (!actionOption || !actionOption.action) return;

    // Check if we need to show lost stage selector
    if (actionOption.action === 'mark_lost' && !showLostSelector) {
      setShowLostSelector(true);
      return;
    }

    setIsProcessing(true);

    // Small delay for UX
    await new Promise(resolve => setTimeout(resolve, 300));

    // Execute the action
    onAction(consultation.id, actionOption.action, actionOption.metadata);

    // Generate and show success state
    const success = generateSuccessState(actionOption.action, actionOption.label, actionOption.metadata);
    setSuccessState(success);
    setIsProcessing(false);
  };

  // Handle lost stage confirmation
  const handleLostStageConfirm = (stage: LostStage) => {
    setIsProcessing(true);
    onAction(consultation.id, 'mark_lost', { lostStage: stage });

    // Generate and show success state
    const success = generateSuccessState('mark_lost', 'Client marked as lost', { lostStage: stage });
    setSuccessState(success);
    setIsProcessing(false);
  };

  // Get suggested lost stage based on current stage
  const getSuggestedLostStage = (): LostStage => {
    switch (consultation.stage) {
      case 'new':
      case 'confirmed':
      case 'no_show':
        return 'pre_consult';
      case 'consult_complete':
      case 'intake_pending':
        return 'pre_intake';
      case 'intake_scheduled':
      case 'paperwork_pending':
        return 'pre_paperwork';
      case 'paperwork_complete':
        return 'pre_first_session';
      default:
        return 'pre_consult';
    }
  };

  // Determine if we can confirm
  const canConfirm = (selectedSubOption || selectedOption) &&
                     (selectedSubOption?.action || selectedOption?.action) &&
                     !selectedOption?.subOptions;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        {/* Header */}
        <div
          className="relative px-6 sm:px-8 pt-6 pb-8 border-b border-stone-100"
          style={{
            background: 'linear-gradient(180deg, #fafaf9 0%, #ffffff 100%)',
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-all"
          >
            <X size={20} />
          </button>

          {/* Client info */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-amber-700 font-bold text-lg">
              {getClientInitials(consultation.firstName, consultation.lastName)}
            </div>
            <div>
              <h2
                className="text-2xl font-bold text-stone-900"
                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
              >
                {consultation.firstName} {consultation.lastName}
              </h2>
              <p className="text-stone-500 text-sm">
                with {consultation.clinicianName}
                {consultation.wasTransferred && (
                  <span className="text-amber-600 ml-1">(transferred)</span>
                )}
              </p>
            </div>
          </div>

          {/* Journey Timeline */}
          <JourneyTimeline steps={journeySteps} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6">
          <AnimatePresence mode="wait">
            {/* Success confirmation */}
            {successState ? (
              <SuccessConfirmation
                key="success"
                success={successState}
                clientName={`${consultation.firstName} ${consultation.lastName}`}
                onClose={onClose}
              />
            ) : consultation.stage === 'no_show' && !showLostSelector ? (
              /* No-show follow-up sequence */
              <motion.div
                key="noshow"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <FollowUpSequence
                  currentCount={consultation.followUpCount}
                  onContinue={() => {
                    const action = consultation.followUpCount === 0 ? 'send_followup_1' :
                                   consultation.followUpCount === 1 ? 'send_followup_2' :
                                   'send_followup_3';
                    onAction(consultation.id, action);
                    // Show success for follow-up
                    const success = generateSuccessState(action, `Follow-up #${consultation.followUpCount + 1} sent`);
                    setSuccessState(success);
                  }}
                  onMarkLost={() => setShowLostSelector(true)}
                />
              </motion.div>
            ) : showLostSelector ? (
              <motion.div
                key="lost-selector"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <LostStageSelector
                  suggestedStage={getSuggestedLostStage()}
                  onSelect={handleLostStageConfirm}
                  onCancel={() => setShowLostSelector(false)}
                />
              </motion.div>
            ) : (
              <motion.div
                key="options"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {/* Question */}
                <h3
                  className="text-xl font-bold text-stone-900 mb-6"
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  {STAGE_QUESTIONS[consultation.stage]}
                </h3>

                {/* Decision cards */}
                <div className="space-y-3">
                  {decisionOptions.map((option) => (
                    <DecisionCard
                      key={option.id}
                      option={option}
                      isSelected={selectedOption?.id === option.id}
                      onSelect={() => handleOptionSelect(option)}
                      isExpanded={selectedOption?.id === option.id && !!option.subOptions}
                      onSubSelect={handleSubOptionSelect}
                      selectedSubOption={selectedSubOption}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer - hide when showing success state */}
        {consultation.stage !== 'no_show' && !showLostSelector && !successState && (
          <div className="px-6 sm:px-8 py-5 border-t border-stone-100 bg-stone-50 flex items-center justify-between gap-4">
            <button
              onClick={onClose}
              className="px-5 py-3 rounded-xl font-semibold text-stone-600 hover:bg-stone-100 transition-colors flex items-center gap-2"
            >
              <Undo2 size={18} />
              Cancel
            </button>

            <button
              onClick={handleConfirm}
              disabled={!canConfirm || isProcessing}
              className={`
                px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2
                ${canConfirm && !isProcessing
                  ? 'bg-stone-900 text-white hover:bg-stone-800 shadow-lg'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }
              `}
            >
              {isProcessing ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  >
                    <Clock size={18} />
                  </motion.div>
                  Processing...
                </>
              ) : (
                <>
                  <ArrowRight size={18} />
                  Confirm
                </>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default TakeActionModal;
