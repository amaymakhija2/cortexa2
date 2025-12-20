import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Check,
  CheckCircle2,
  Clock,
  Calendar,
  CalendarCheck,
  CalendarX,
  MessageSquare,
  UserX,
  UserPlus,
  FileText,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Phone,
  Mail,
  Sparkles,
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
  getClientInitials,
} from '../types/consultations';

// =============================================================================
// TAKE ACTION MODAL - REDESIGNED
// =============================================================================
// Editorial aesthetic: Clean, typographically focused, restrained color.
// The modal guides clinicians through decisions like a conversation.
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

interface ActionOption {
  id: string;
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
  action?: ActionType;
  metadata?: ActionMetadata;
  variant?: 'primary' | 'secondary' | 'destructive' | 'muted';
}

// -----------------------------------------------------------------------------
// STAGE CONFIGURATION
// -----------------------------------------------------------------------------

const STAGE_CONFIG: Record<ConsultationStage, { question: string; context?: string }> = {
  new: { question: 'Ready to confirm?', context: 'Send confirmation to finalize the booking' },
  confirmed: { question: 'Did they show up?', context: 'Record the consultation outcome' },
  consult_complete: { question: 'How did it go?', context: 'Follow up to schedule intake' },
  no_show: { question: 'Any update?', context: 'Continue follow-up sequence' },
  intake_pending: { question: 'Intake scheduled?', context: 'Help them book their intake' },
  intake_scheduled: { question: 'Paperwork status?', context: 'Ensure forms are complete' },
  paperwork_pending: { question: 'Forms complete?', context: 'Ready for first session' },
  paperwork_complete: { question: 'Session complete?', context: 'Mark as converted' },
  converted: { question: 'Converted!', context: 'This client is active' },
  lost: { question: 'Case closed', context: 'This client was lost' },
};

// Human-readable labels for each stage (used in success animation)
const STAGE_LABELS: Record<ConsultationStage, string> = {
  new: 'New Booking',
  confirmed: 'Confirmed',
  consult_complete: 'Consult Complete',
  no_show: 'No-Show',
  intake_pending: 'Awaiting Intake',
  intake_scheduled: 'Intake Scheduled',
  paperwork_pending: 'Paperwork Pending',
  paperwork_complete: 'Paperwork Complete',
  converted: 'Converted',
  lost: 'Lost',
};

// -----------------------------------------------------------------------------
// PROGRESS TIMELINE WITH LABELS
// -----------------------------------------------------------------------------

const ProgressTimeline: React.FC<{
  stages: { key: string; label: string; shortLabel: string }[];
  currentIndex: number;
}> = ({ stages, currentIndex }) => (
  <div className="relative">
    {/* Connection line */}
    <div className="absolute top-3 left-0 right-0 h-0.5 bg-stone-200" />
    <div
      className="absolute top-3 left-0 h-0.5 bg-stone-800 transition-all duration-500"
      style={{ width: `${(currentIndex / (stages.length - 1)) * 100}%` }}
    />

    {/* Stage nodes */}
    <div className="relative flex justify-between">
      {stages.map((stage, idx) => {
        const isComplete = idx < currentIndex;
        const isCurrent = idx === currentIndex;
        const isNext = idx === currentIndex + 1;

        return (
          <motion.div
            key={stage.key}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex flex-col items-center"
          >
            {/* Node */}
            <div className={`
              relative w-6 h-6 rounded-full flex items-center justify-center
              transition-all duration-300 z-10
              ${isComplete ? 'bg-stone-800' : ''}
              ${isCurrent ? 'bg-amber-500 ring-4 ring-amber-100' : ''}
              ${isNext ? 'bg-white border-2 border-stone-300' : ''}
              ${!isComplete && !isCurrent && !isNext ? 'bg-stone-200' : ''}
            `}>
              {isComplete && <Check size={12} className="text-white" strokeWidth={3} />}
              {isCurrent && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-white"
                />
              )}
            </div>

            {/* Label */}
            <span className={`
              mt-2 text-xs font-medium text-center max-w-[60px] leading-tight
              ${isCurrent ? 'text-amber-700 font-semibold' : ''}
              ${isComplete ? 'text-stone-600' : ''}
              ${isNext ? 'text-stone-500' : ''}
              ${!isComplete && !isCurrent && !isNext ? 'text-stone-400' : ''}
            `}>
              {stage.shortLabel}
            </span>
          </motion.div>
        );
      })}
    </div>
  </div>
);

// -----------------------------------------------------------------------------
// ACTION OPTION COMPONENT
// -----------------------------------------------------------------------------
// Uses outline style by default - feels inviting, not pre-selected
// Primary gets a warm amber accent to stand out as recommended
// -----------------------------------------------------------------------------

const ActionOptionButton: React.FC<{
  option: ActionOption;
  onSelect: () => void;
  index: number;
}> = ({ option, onSelect, index }) => {
  // Refined variant styles - outline-first approach
  const getVariantClasses = () => {
    switch (option.variant) {
      case 'primary':
        // Warm accent - stands out but not "selected"
        return {
          container: 'bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-100/50',
          text: 'text-stone-900',
          sublabel: 'text-amber-700/70',
          iconBg: 'bg-amber-500',
          iconColor: 'text-white',
          arrow: 'text-amber-500 group-hover:text-amber-600',
          badge: true,
        };
      case 'secondary':
        return {
          container: 'bg-white border-2 border-stone-200 hover:border-stone-400 hover:bg-stone-50',
          text: 'text-stone-900',
          sublabel: 'text-stone-500',
          iconBg: 'bg-stone-800',
          iconColor: 'text-white',
          arrow: 'text-stone-400 group-hover:text-stone-600',
          badge: false,
        };
      case 'destructive':
        return {
          container: 'bg-white border-2 border-stone-200 hover:border-rose-300 hover:bg-rose-50/50',
          text: 'text-stone-700 group-hover:text-rose-700',
          sublabel: 'text-stone-500 group-hover:text-rose-600/70',
          iconBg: 'bg-rose-100 group-hover:bg-rose-500',
          iconColor: 'text-rose-600 group-hover:text-white',
          arrow: 'text-stone-400 group-hover:text-rose-500',
          badge: false,
        };
      case 'muted':
      default:
        return {
          container: 'bg-stone-50/50 border-2 border-stone-200/70 hover:border-stone-300 hover:bg-stone-100/50',
          text: 'text-stone-600',
          sublabel: 'text-stone-400',
          iconBg: 'bg-stone-200',
          iconColor: 'text-stone-500',
          arrow: 'text-stone-300 group-hover:text-stone-500',
          badge: false,
        };
    }
  };

  const v = getVariantClasses();

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      onClick={onSelect}
      className={`
        group w-full text-left p-5 rounded-2xl transition-all duration-300 ease-out
        transform hover:scale-[1.01] active:scale-[0.99]
        ${v.container}
      `}
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className={`
          flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center
          transition-all duration-300 ${v.iconBg}
        `}>
          <span className={`transition-colors duration-300 ${v.iconColor}`}>
            {option.icon}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={`font-semibold text-base leading-tight transition-colors ${v.text}`}>
              {option.label}
            </p>
            {v.badge && (
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-800 rounded-full">
                Next
              </span>
            )}
          </div>
          {option.sublabel && (
            <p className={`text-sm mt-1 transition-colors ${v.sublabel}`}>
              {option.sublabel}
            </p>
          )}
        </div>

        {/* Arrow */}
        <ArrowRight
          size={20}
          className={`
            flex-shrink-0 transition-all duration-300
            group-hover:translate-x-1.5
            ${v.arrow}
          `}
        />
      </div>
    </motion.button>
  );
};

// -----------------------------------------------------------------------------
// OUTCOME OPTIONS (Step 2 after "They Showed Up")
// -----------------------------------------------------------------------------

const OutcomeOptions: React.FC<{
  onSelect: (option: ActionOption) => void;
  onBack: () => void;
}> = ({ onSelect, onBack }) => {
  const options: ActionOption[] = [
    {
      id: 'intake_scheduled',
      label: 'Confirmed Intake Date',
      sublabel: 'They booked their intake appointment',
      icon: <CalendarCheck size={22} />,
      action: 'send_post_consult',
      metadata: { intakeScheduled: true },
      variant: 'primary',
    },
    {
      id: 'intake_pending',
      label: "Wants to Proceed",
      sublabel: "Hasn't confirmed intake yet — we'll follow up",
      icon: <Clock size={22} />,
      action: 'send_post_consult',
      metadata: { intakeScheduled: false },
      variant: 'secondary',
    },
    {
      id: 'declined',
      label: 'Client Declined',
      sublabel: 'They decided not to continue',
      icon: <UserX size={22} />,
      action: 'mark_lost',
      metadata: { lostStage: 'pre_intake' },
      variant: 'muted',
    },
    {
      id: 'transfer',
      label: 'Transfer to Another Clinician',
      sublabel: 'Client prefers someone else',
      icon: <UserPlus size={22} />,
      variant: 'muted',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
    >
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-stone-500 hover:text-stone-800 mb-6 transition-colors group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* Context */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
            <Check size={14} className="text-white" strokeWidth={3} />
          </div>
          <span className="text-sm font-semibold text-emerald-700">They showed up</span>
        </div>
        <h3 className="text-3xl font-bold text-stone-900" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
          What was the outcome?
        </h3>
        <p className="text-stone-500 mt-2">Select what happened during the consultation</p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {options.map((option, idx) => (
          <ActionOptionButton
            key={option.id}
            option={option}
            onSelect={() => onSelect(option)}
            index={idx}
          />
        ))}
      </div>
    </motion.div>
  );
};

// -----------------------------------------------------------------------------
// FOLLOW-UP SEQUENCE (No-Show)
// -----------------------------------------------------------------------------

const FollowUpSequence: React.FC<{
  currentCount: number;
  onContinue: () => void;
  onMarkLost: () => void;
}> = ({ currentCount, onContinue, onMarkLost }) => {
  const steps = ['Immediate', '24 Hours', '72 Hours'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-stone-900 mb-1" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
          Follow-Up Sequence
        </h3>
        <p className="text-stone-500">
          {currentCount === 0 ? 'Start the recovery sequence' : `${currentCount} of 3 follow-ups sent`}
        </p>
      </div>

      {/* Progress */}
      <div className="bg-stone-50 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, idx) => (
            <div key={step} className="flex flex-col items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-2
                ${idx < currentCount ? 'bg-stone-900 text-white' :
                  idx === currentCount ? 'bg-amber-500 text-white ring-4 ring-amber-100' :
                  'bg-stone-200 text-stone-500'}
              `}>
                {idx < currentCount ? <Check size={16} /> : idx + 1}
              </div>
              <span className={`text-xs font-medium ${idx <= currentCount ? 'text-stone-900' : 'text-stone-400'}`}>
                {step}
              </span>
            </div>
          ))}
        </div>
        <div className="h-1 bg-stone-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(currentCount / 3) * 100}%` }}
            className="h-full bg-stone-900 rounded-full"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        {currentCount < 3 ? (
          <>
            <button
              onClick={onContinue}
              className="w-full p-4 rounded-2xl bg-stone-900 text-white font-semibold flex items-center justify-center gap-3 hover:bg-stone-800 transition-colors"
            >
              <MessageSquare size={18} />
              Send Follow-Up #{currentCount + 1}
            </button>
            <button
              onClick={onMarkLost}
              className="w-full p-4 rounded-2xl bg-white border border-stone-200 text-stone-600 font-semibold hover:bg-stone-50 transition-colors"
            >
              Give Up & Mark Lost
            </button>
          </>
        ) : (
          <button
            onClick={onMarkLost}
            className="w-full p-4 rounded-2xl bg-stone-900 text-white font-semibold flex items-center justify-center gap-3 hover:bg-stone-800 transition-colors"
          >
            <AlertTriangle size={18} />
            Mark as Lost
          </button>
        )}
      </div>
    </motion.div>
  );
};

// -----------------------------------------------------------------------------
// LOST STAGE SELECTOR
// -----------------------------------------------------------------------------

const LostStageSelector: React.FC<{
  suggestedStage: LostStage;
  onSelect: (stage: LostStage) => void;
  onCancel: () => void;
}> = ({ suggestedStage, onSelect, onCancel }) => {
  const [selected, setSelected] = useState<LostStage>(suggestedStage);

  const stages: { id: LostStage; label: string; description: string }[] = [
    { id: 'pre_consult', label: 'Before Consultation', description: 'Never made it to the consult' },
    { id: 'pre_intake', label: 'Before Intake', description: 'Consulted but didn\'t book intake' },
    { id: 'pre_paperwork', label: 'Before Paperwork', description: 'Booked but didn\'t complete forms' },
    { id: 'pre_first_session', label: 'Before First Session', description: 'Forms done but didn\'t attend' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
    >
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-stone-900 mb-1" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
          Where did they drop off?
        </h3>
        <p className="text-stone-500">This helps us understand conversion patterns</p>
      </div>

      <div className="space-y-2 mb-6">
        {stages.map((stage) => (
          <button
            key={stage.id}
            onClick={() => setSelected(stage.id)}
            className={`
              w-full text-left p-4 rounded-2xl border-2 transition-all duration-200
              ${selected === stage.id
                ? 'bg-stone-900 border-stone-900 text-white'
                : 'bg-white border-stone-200 hover:border-stone-300'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <div className={`
                w-5 h-5 rounded-full border-2 flex items-center justify-center
                ${selected === stage.id ? 'border-white' : 'border-stone-300'}
              `}>
                {selected === stage.id && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{stage.label}</p>
                <p className={`text-sm ${selected === stage.id ? 'text-stone-300' : 'text-stone-500'}`}>
                  {stage.description}
                </p>
              </div>
              {stage.id === suggestedStage && (
                <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  selected === stage.id ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'
                }`}>
                  Suggested
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 p-4 rounded-2xl bg-white border border-stone-200 text-stone-600 font-semibold hover:bg-stone-50 transition-colors"
        >
          Go Back
        </button>
        <button
          onClick={() => onSelect(selected)}
          className="flex-1 p-4 rounded-2xl bg-stone-900 text-white font-semibold hover:bg-stone-800 transition-colors"
        >
          Confirm
        </button>
      </div>
    </motion.div>
  );
};

// -----------------------------------------------------------------------------
// SUCCESS CONFIRMATION
// -----------------------------------------------------------------------------

const SuccessConfirmation: React.FC<{
  success: SuccessState;
  clientName: string;
  onClose: () => void;
}> = ({ success, clientName, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col items-center text-center py-8"
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 12 }}
        className={`
          w-16 h-16 rounded-full flex items-center justify-center mb-6
          ${success.isConversion ? 'bg-emerald-500' : success.isLost ? 'bg-stone-400' : 'bg-stone-900'}
        `}
      >
        {success.isConversion ? (
          <PartyPopper size={28} className="text-white" />
        ) : success.isLost ? (
          <UserX size={28} className="text-white" />
        ) : (
          <Check size={28} className="text-white" strokeWidth={3} />
        )}
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-2xl font-bold text-stone-900 mb-2"
        style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
      >
        {success.isConversion ? 'Converted!' : success.isLost ? 'Case Closed' : 'Done'}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-stone-500 mb-6"
      >
        {success.actionLabel}
      </motion.p>

      {/* Stage transition */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-4 bg-stone-50 rounded-2xl px-6 py-4"
      >
        <div className="text-center">
          <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">From</p>
          <p className="font-semibold text-stone-600 text-sm">{STAGE_LABELS[success.fromStage]}</p>
        </div>
        <ArrowRight size={20} className="text-stone-300" />
        <div className="text-center">
          <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Now</p>
          <p className={`font-semibold text-sm ${
            success.isConversion ? 'text-emerald-600' : success.isLost ? 'text-stone-500' : 'text-stone-900'
          }`}>
            {success.toStageLabel}
          </p>
        </div>
      </motion.div>

      {/* Auto-close progress */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 3, ease: 'linear' }}
        className={`absolute bottom-0 left-0 right-0 h-1 origin-left ${
          success.isConversion ? 'bg-emerald-400' : 'bg-stone-300'
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
  const [step, setStep] = useState<'main' | 'outcome' | 'lost'>('main');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successState, setSuccessState] = useState<SuccessState | null>(null);

  // Progress stages with labels
  const progressStages = [
    { key: 'booked', label: 'Booking Received', shortLabel: 'Booked' },
    { key: 'confirmed', label: 'Confirmation Sent', shortLabel: 'Confirmed' },
    { key: 'consult', label: 'Consultation', shortLabel: 'Consult' },
    { key: 'intake', label: 'Intake Scheduled', shortLabel: 'Intake' },
    { key: 'ready', label: 'Paperwork Complete', shortLabel: 'Ready' },
    { key: 'converted', label: 'First Session Done', shortLabel: 'Converted' },
  ];

  const stageToIndex: Record<ConsultationStage, number> = {
    new: 0,
    confirmed: 1,
    consult_complete: 2,
    no_show: 2,
    intake_pending: 2,
    intake_scheduled: 3,
    paperwork_pending: 4,
    paperwork_complete: 4,
    converted: 5,
    lost: -1,
  };

  const currentIndex = stageToIndex[consultation.stage] || 0;
  const config = STAGE_CONFIG[consultation.stage];

  // Generate success state
  const generateSuccessState = (action: ActionType, label: string, metadata?: ActionMetadata): SuccessState => {
    const fromStage = consultation.stage;
    let toStage: ConsultationStage = consultation.stage;
    let toStageLabel = '';
    let nextSteps: string[] = [];
    let isConversion = false;
    let isLost = false;

    switch (action) {
      case 'send_confirmation':
        toStage = 'confirmed';
        toStageLabel = 'Confirmed';
        break;
      case 'send_post_consult':
        toStage = metadata?.intakeScheduled ? 'intake_scheduled' : 'intake_pending';
        toStageLabel = metadata?.intakeScheduled ? 'Intake Scheduled' : 'Awaiting Intake';
        break;
      case 'mark_no_show':
        toStage = 'no_show';
        toStageLabel = 'No-Show';
        break;
      case 'send_followup_1':
      case 'send_followup_2':
      case 'send_followup_3':
        toStage = 'no_show';
        toStageLabel = 'No-Show (Follow-Up Sent)';
        break;
      case 'mark_intake_scheduled':
        toStage = 'intake_scheduled';
        toStageLabel = 'Intake Scheduled';
        break;
      case 'mark_paperwork_complete':
        toStage = 'paperwork_complete';
        toStageLabel = 'Paperwork Complete';
        break;
      case 'send_paperwork_reminder':
        toStage = 'paperwork_pending';
        toStageLabel = 'Paperwork Pending';
        break;
      case 'mark_lost':
        toStage = 'lost';
        toStageLabel = 'Lost';
        isLost = true;
        break;
      case 'mark_first_session_done':
        toStage = 'converted';
        toStageLabel = 'Converted';
        isConversion = true;
        break;
      default:
        // Fallback to proper label from STAGE_LABELS
        toStageLabel = STAGE_LABELS[toStage] || toStage.replace('_', ' ');
    }

    return { action, actionLabel: label, fromStage, toStage, toStageLabel, nextSteps, isConversion, isLost };
  };

  // Handle action
  const handleAction = async (option: ActionOption) => {
    if (option.id === 'transfer') {
      onTransfer(consultation.id);
      return;
    }

    if (option.action === 'mark_lost' && step !== 'lost') {
      setStep('lost');
      return;
    }

    if (!option.action) return;

    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 200));

    onAction(consultation.id, option.action, option.metadata);
    setSuccessState(generateSuccessState(option.action, option.label, option.metadata));
    setIsProcessing(false);
  };

  // Handle lost stage confirm
  const handleLostStageConfirm = (stage: LostStage) => {
    setIsProcessing(true);
    onAction(consultation.id, 'mark_lost', { lostStage: stage });
    setSuccessState(generateSuccessState('mark_lost', 'Marked as lost', { lostStage: stage }));
    setIsProcessing(false);
  };

  // Get suggested lost stage
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
      default:
        return 'pre_first_session';
    }
  };

  // Build main options based on stage
  const mainOptions = useMemo((): ActionOption[] => {
    switch (consultation.stage) {
      case 'new':
        return [
          {
            id: 'confirm',
            label: 'Send Confirmation',
            sublabel: 'Email client to confirm the booking',
            icon: <Mail size={22} />,
            action: 'send_confirmation',
            variant: 'primary',
          },
          {
            id: 'transfer',
            label: 'Transfer Clinician',
            sublabel: 'Reassign to someone else',
            icon: <UserPlus size={22} />,
            variant: 'muted',
          },
          {
            id: 'lost',
            label: 'Client Cancelled',
            sublabel: 'Mark as lost',
            icon: <UserX size={22} />,
            action: 'mark_lost',
            metadata: { lostStage: 'pre_consult' },
            variant: 'destructive',
          },
        ];

      case 'confirmed':
        return [
          {
            id: 'showed_up',
            label: 'They Showed Up',
            sublabel: 'Client attended the consultation',
            icon: <CheckCircle2 size={22} />,
            variant: 'primary',
          },
          {
            id: 'no_show',
            label: "Didn't Show Up",
            sublabel: 'Start follow-up sequence',
            icon: <CalendarX size={22} />,
            action: 'mark_no_show',
            variant: 'destructive',
          },
        ];

      case 'consult_complete':
        return [
          {
            id: 'send_followup',
            label: 'Send Post-Consult Message',
            sublabel: 'Follow up to schedule intake',
            icon: <MessageSquare size={22} />,
            action: 'send_post_consult',
            variant: 'primary',
          },
          {
            id: 'lost',
            label: 'Client Not Interested',
            sublabel: 'Mark as lost',
            icon: <UserX size={22} />,
            action: 'mark_lost',
            metadata: { lostStage: 'pre_intake' },
            variant: 'destructive',
          },
        ];

      case 'intake_pending':
        return [
          {
            id: 'scheduled',
            label: 'Intake Scheduled',
            sublabel: 'Client has booked',
            icon: <CalendarCheck size={22} />,
            action: 'mark_intake_scheduled',
            variant: 'primary',
          },
          {
            id: 'still_waiting',
            label: 'Send Reminder',
            sublabel: 'Another nudge to schedule',
            icon: <Clock size={22} />,
            variant: 'secondary',
          },
          {
            id: 'lost',
            label: 'Client Unresponsive',
            sublabel: 'Mark as lost',
            icon: <UserX size={22} />,
            action: 'mark_lost',
            metadata: { lostStage: 'pre_intake' },
            variant: 'destructive',
          },
        ];

      case 'intake_scheduled':
      case 'paperwork_pending':
        return [
          {
            id: 'paperwork_done',
            label: 'Paperwork Complete',
            sublabel: 'All forms submitted',
            icon: <FileText size={22} />,
            action: 'mark_paperwork_complete',
            variant: 'primary',
          },
          {
            id: 'send_reminder',
            label: 'Send Reminder',
            sublabel: 'Nudge to complete forms',
            icon: <MessageSquare size={22} />,
            action: 'send_paperwork_reminder',
            variant: 'secondary',
          },
          {
            id: 'lost',
            label: 'Client Not Responding',
            sublabel: 'Mark as lost',
            icon: <UserX size={22} />,
            action: 'mark_lost',
            metadata: { lostStage: 'pre_paperwork' },
            variant: 'destructive',
          },
        ];

      case 'paperwork_complete':
        return [
          {
            id: 'session_done',
            label: 'First Session Complete',
            sublabel: 'Mark as converted',
            icon: <Sparkles size={22} />,
            action: 'mark_first_session_done',
            variant: 'primary',
          },
          {
            id: 'lost',
            label: 'Client Cancelled',
            sublabel: 'Mark as lost',
            icon: <UserX size={22} />,
            action: 'mark_lost',
            metadata: { lostStage: 'pre_first_session' },
            variant: 'destructive',
          },
        ];

      default:
        return [];
    }
  }, [consultation.stage]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-6"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal - Larger size */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-stone-100 bg-gradient-to-b from-stone-50/50 to-white">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-all"
          >
            <X size={20} />
          </button>

          {/* Client */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-stone-900 flex items-center justify-center text-white font-bold text-base">
              {getClientInitials(consultation.firstName, consultation.lastName)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                {consultation.firstName} {consultation.lastName}
              </h2>
              <p className="text-sm text-stone-500 mt-0.5">with {consultation.clinicianName}</p>
            </div>
          </div>

          {/* Progress Timeline */}
          {consultation.stage !== 'lost' && consultation.stage !== 'converted' && (
            <ProgressTimeline
              stages={progressStages}
              currentIndex={currentIndex}
            />
          )}
        </div>

        {/* Content - More spacious */}
        <div className="px-8 py-8 min-h-[360px] relative overflow-hidden">
          <AnimatePresence mode="wait">
            {successState ? (
              <SuccessConfirmation
                key="success"
                success={successState}
                clientName={`${consultation.firstName} ${consultation.lastName}`}
                onClose={onClose}
              />
            ) : consultation.stage === 'no_show' && step === 'main' ? (
              <FollowUpSequence
                key="followup"
                currentCount={consultation.followUpCount}
                onContinue={() => {
                  const action = consultation.followUpCount === 0 ? 'send_followup_1' :
                                 consultation.followUpCount === 1 ? 'send_followup_2' : 'send_followup_3';
                  onAction(consultation.id, action);
                  setSuccessState(generateSuccessState(action, `Follow-up #${consultation.followUpCount + 1} sent`));
                }}
                onMarkLost={() => setStep('lost')}
              />
            ) : step === 'lost' ? (
              <LostStageSelector
                key="lost"
                suggestedStage={getSuggestedLostStage()}
                onSelect={handleLostStageConfirm}
                onCancel={() => setStep('main')}
              />
            ) : step === 'outcome' ? (
              <OutcomeOptions
                key="outcome"
                onSelect={handleAction}
                onBack={() => setStep('main')}
              />
            ) : (
              <motion.div
                key="main"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              >
                {/* Question */}
                <div className="mb-8">
                  <h3 className="text-3xl font-bold text-stone-900" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                    {config.question}
                  </h3>
                  {config.context && (
                    <p className="text-stone-500 mt-2 text-base">{config.context}</p>
                  )}
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {mainOptions.map((option, idx) => (
                    <ActionOptionButton
                      key={option.id}
                      option={option}
                      onSelect={() => {
                        if (option.id === 'showed_up') {
                          setStep('outcome');
                        } else {
                          handleAction(option);
                        }
                      }}
                      index={idx}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TakeActionModal;
