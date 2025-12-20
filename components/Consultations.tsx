import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  ChevronRight,
  ChevronDown,
  Clock,
  Calendar,
  Phone,
  Mail,
  User,
  AlertCircle,
  ArrowRight,
  X,
  MessageSquare,
  UserCheck,
  UserPlus,
  FileText,
  RefreshCw,
  Search,
  Filter,
  Video,
  ExternalLink,
  Zap,
  LayoutGrid,
  List,
} from 'lucide-react';
import { PageHeader } from './design-system';
import {
  MOCK_CONSULTATIONS,
  CONSULTATION_CLINICIANS,
  getConsultationsBySegment,
  getActionNeededCount,
  getTodaysConsultations,
  getUpcomingConsultations,
} from '../data/consultations';
import type {
  Consultation,
  ConsultationStage,
  ConsultationSegment,
  ActionType,
  Clinician,
  LostStage,
} from '../types/consultations';
import { TakeActionModal } from './TakeActionModal';
import { ConsultationsKanban } from './ConsultationsKanban';
import {
  SEGMENT_CONFIGS,
  getStageConfig,
  getNextAction,
  getActionLabel,
  formatConsultationDate,
  getClientInitials,
  isConsultationPast,
  isConsultationToday,
  getDaysSince,
} from '../types/consultations';

// =============================================================================
// CONSULTATIONS CRM
// =============================================================================
// A simple CRM for managing the consultation-to-conversion pipeline.
// Syncs with Acuity Scheduling for automatic data ingestion.
// Designed for practice owners who are time-starved and need clear actions.
// =============================================================================

// Stage colors matching the design system
const STAGE_COLORS: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  new: { bg: 'bg-cyan-50', text: 'text-cyan-700', dot: 'bg-cyan-500', border: 'border-cyan-200' },
  confirmed: { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500', border: 'border-indigo-200' },
  consult_complete: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
  no_show: { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500', border: 'border-rose-200' },
  intake_pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-200' },
  intake_scheduled: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-200' },
  paperwork_pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-200' },
  paperwork_complete: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
  converted: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
  lost: { bg: 'bg-stone-100', text: 'text-stone-600', dot: 'bg-stone-400', border: 'border-stone-200' },
};

// =============================================================================
// CONSULTATION DETAIL PANEL
// =============================================================================

interface ConsultationDetailProps {
  consultation: Consultation;
  onClose: () => void;
  onTakeAction: () => void;
}

const ConsultationDetail: React.FC<ConsultationDetailProps> = ({
  consultation,
  onClose,
  onTakeAction,
}) => {
  const stageConfig = getStageConfig(consultation.stage);
  const stageColors = STAGE_COLORS[consultation.stage];
  const nextAction = getNextAction(consultation);
  const isPast = isConsultationPast(consultation.datetime);

  // Build timeline items
  const timelineItems: { label: string; date?: string; status: 'done' | 'current' | 'pending' }[] = [
    {
      label: 'Consultation scheduled',
      date: formatConsultationDate(consultation.datetime),
      status: 'done',
    },
  ];

  if (consultation.stage === 'new') {
    timelineItems.push({ label: 'Send confirmation email', status: 'current' });
    timelineItems.push({ label: 'Consultation', status: 'pending' });
  } else if (consultation.stage === 'confirmed') {
    timelineItems.push({ label: 'Confirmation sent', status: 'done' });
    timelineItems.push({ label: 'Consultation', status: isPast ? 'current' : 'pending' });
  } else if (consultation.stage === 'consult_complete') {
    timelineItems.push({ label: 'Confirmation sent', status: 'done' });
    timelineItems.push({ label: 'Consultation complete', status: 'done' });
    timelineItems.push({ label: 'Send post-consult message', status: 'current' });
  } else if (consultation.stage === 'no_show') {
    timelineItems.push({ label: 'Confirmation sent', status: 'done' });
    timelineItems.push({ label: 'No-show', status: 'done' });
    const followUpLabel = consultation.followUpCount === 0
      ? 'Send follow-up #1'
      : consultation.followUpCount === 1
        ? 'Send follow-up #2 (24hr)'
        : consultation.followUpCount === 2
          ? 'Send follow-up #3 (72hr)'
          : 'Mark as lost';
    timelineItems.push({ label: followUpLabel, status: 'current' });
  } else if (consultation.stage === 'intake_pending') {
    timelineItems.push({ label: 'Post-consult sent', status: 'done' });
    timelineItems.push({ label: 'Confirm intake scheduled', status: 'current' });
  } else if (consultation.stage === 'intake_scheduled') {
    timelineItems.push({ label: 'Intake scheduled', date: consultation.intakeScheduledDate ? formatConsultationDate(consultation.intakeScheduledDate) : undefined, status: 'done' });
    timelineItems.push({ label: 'Paperwork completion', status: 'current' });
  } else if (consultation.stage === 'paperwork_pending') {
    timelineItems.push({ label: 'Intake scheduled', status: 'done' });
    timelineItems.push({ label: 'Send paperwork reminder', status: 'current' });
  } else if (consultation.stage === 'paperwork_complete') {
    timelineItems.push({ label: 'Paperwork complete', status: 'done' });
    timelineItems.push({ label: 'First session', date: consultation.firstSessionDate ? formatConsultationDate(consultation.firstSessionDate) : undefined, status: 'current' });
  } else if (consultation.stage === 'converted') {
    timelineItems.push({ label: 'Paperwork complete', status: 'done' });
    timelineItems.push({ label: 'First session complete', date: consultation.convertedDate ? formatConsultationDate(consultation.convertedDate) : undefined, status: 'done' });
    timelineItems.push({ label: 'Converted!', status: 'done' });
  } else if (consultation.stage === 'lost') {
    timelineItems.push({ label: `Lost: ${consultation.lostStage?.replace('_', ' ')}`, date: consultation.lostDate ? formatConsultationDate(consultation.lostDate) : undefined, status: 'done' });
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-white z-50 overflow-y-auto"
      style={{
        boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.12)',
      }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-6 py-5 border-b border-stone-200"
        style={{ background: 'linear-gradient(180deg, #ffffff 0%, #fafaf9 100%)' }}
      >
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-all"
          >
            <X size={20} />
          </button>
          <div className={`px-3 py-1.5 rounded-full text-sm font-semibold ${stageColors.bg} ${stageColors.text}`}>
            {stageConfig.label}
          </div>
        </div>

        <div className="mt-4">
          <h2
            className="text-3xl font-bold text-stone-900"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
          >
            {consultation.firstName} {consultation.lastName}
          </h2>
          <p className="text-stone-500 mt-1">
            with {consultation.clinicianName}
            {consultation.wasTransferred && (
              <span className="text-amber-600 ml-2">(transferred from {consultation.originalClinicianName})</span>
            )}
          </p>
        </div>
      </div>

      {/* Next Action Card */}
      {nextAction && consultation.stage !== 'converted' && consultation.stage !== 'lost' && (
        <div className="px-6 py-5">
          <div
            className="p-5 rounded-2xl border-2"
            style={{
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              borderColor: '#fbbf24',
            }}
          >
            <p className="text-amber-800 text-sm font-semibold uppercase tracking-wider mb-2">
              Needs Attention
            </p>
            <p className="text-stone-900 text-lg font-bold mb-4">
              {getActionLabel(nextAction)}
            </p>
            <button
              onClick={onTakeAction}
              className="w-full px-5 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Zap size={18} />
              Take Action
            </button>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="px-6 py-5 border-t border-stone-100">
        <h3 className="text-lg font-bold text-stone-900 mb-4" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
          Timeline
        </h3>
        <div className="space-y-0">
          {timelineItems.map((item, idx) => (
            <div key={idx} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    item.status === 'done' ? 'bg-emerald-500' :
                    item.status === 'current' ? 'bg-amber-500' : 'bg-stone-300'
                  }`}
                />
                {idx < timelineItems.length - 1 && (
                  <div className={`w-0.5 h-8 ${
                    item.status === 'done' ? 'bg-emerald-200' : 'bg-stone-200'
                  }`} />
                )}
              </div>
              <div className="pb-4">
                <p className={`font-medium ${
                  item.status === 'done' ? 'text-stone-600' :
                  item.status === 'current' ? 'text-stone-900' : 'text-stone-400'
                }`}>
                  {item.label}
                </p>
                {item.date && (
                  <p className="text-stone-400 text-sm mt-0.5">{item.date}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Client Info */}
      <div className="px-6 py-5 border-t border-stone-100">
        <h3 className="text-lg font-bold text-stone-900 mb-4" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
          Client Info
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-stone-600">
            <Mail size={18} className="text-stone-400" />
            <a href={`mailto:${consultation.email}`} className="hover:text-stone-900 transition-colors">
              {consultation.email}
            </a>
          </div>
          {consultation.phone && (
            <div className="flex items-center gap-3 text-stone-600">
              <Phone size={18} className="text-stone-400" />
              <a href={`tel:${consultation.phone}`} className="hover:text-stone-900 transition-colors">
                {consultation.phone}
              </a>
            </div>
          )}
          <div className="flex items-center gap-3 text-stone-600">
            <Calendar size={18} className="text-stone-400" />
            <span>{formatConsultationDate(consultation.datetime)}</span>
          </div>
        </div>
      </div>

      {/* Form Responses */}
      {consultation.formResponses && consultation.formResponses.length > 0 && (
        <div className="px-6 py-5 border-t border-stone-100">
          <h3 className="text-lg font-bold text-stone-900 mb-4" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
            Intake Form
          </h3>
          <div className="space-y-4">
            {consultation.formResponses.map((response, idx) => (
              <div key={idx}>
                <p className="text-stone-500 text-sm font-medium">{response.fieldName}</p>
                <p className="text-stone-900 mt-1">{response.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions - only show for terminal states or if no action needed */}
      {(consultation.stage === 'lost' || consultation.stage === 'converted') && (
        <div className="px-6 py-5 border-t border-stone-100">
          <div className={`p-4 rounded-xl ${consultation.stage === 'converted' ? 'bg-emerald-50 border border-emerald-200' : 'bg-stone-100 border border-stone-200'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${consultation.stage === 'converted' ? 'bg-emerald-500' : 'bg-stone-400'} text-white`}>
                <Check size={18} />
              </div>
              <div>
                <p className={`font-semibold ${consultation.stage === 'converted' ? 'text-emerald-800' : 'text-stone-700'}`}>
                  {consultation.stage === 'converted' ? 'Successfully Converted' : 'Case Closed'}
                </p>
                <p className={`text-sm ${consultation.stage === 'converted' ? 'text-emerald-600' : 'text-stone-500'}`}>
                  {consultation.stage === 'converted'
                    ? 'This client is now an active patient'
                    : `Lost at ${consultation.lostStage?.replace('_', ' ') || 'unknown stage'}`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// =============================================================================
// TRANSFER CLINICIAN MODAL
// =============================================================================

interface TransferClinicianModalProps {
  consultation: Consultation;
  onClose: () => void;
  onTransfer: (consultationId: string, newClinicianId: string) => void;
}

const TransferClinicianModal: React.FC<TransferClinicianModalProps> = ({
  consultation,
  onClose,
  onTransfer,
}) => {
  const [selectedClinicianId, setSelectedClinicianId] = useState<string | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);

  // Filter out current clinician from the list
  const availableClinicians = CONSULTATION_CLINICIANS.filter(
    c => c.id !== consultation.clinicianId
  );

  const handleTransfer = async () => {
    if (!selectedClinicianId) return;

    setIsTransferring(true);
    // Simulate a brief delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));
    onTransfer(consultation.id, selectedClinicianId);
    setIsTransferring(false);
  };

  const selectedClinician = availableClinicians.find(c => c.id === selectedClinicianId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-200 bg-gradient-to-b from-white to-stone-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <UserPlus size={20} className="text-amber-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-stone-900" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                  Transfer Client
                </h2>
                <p className="text-stone-500 text-sm">
                  {consultation.firstName} {consultation.lastName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Current clinician */}
        <div className="px-6 py-4 border-b border-stone-100">
          <p className="text-sm font-medium text-stone-500 mb-2">Currently assigned to</p>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-100">
            <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 font-bold text-sm">
              {consultation.clinicianName.split(' ').map(n => n[0]).join('')}
            </div>
            <span className="font-semibold text-stone-900">{consultation.clinicianName}</span>
          </div>
        </div>

        {/* Clinician selection */}
        <div className="px-6 py-4 max-h-[300px] overflow-y-auto">
          <p className="text-sm font-medium text-stone-500 mb-3">Select new clinician</p>
          <div className="space-y-2">
            {availableClinicians.map(clinician => {
              const isSelected = selectedClinicianId === clinician.id;
              const initials = clinician.name.split(' ').map(n => n[0]).join('');

              return (
                <button
                  key={clinician.id}
                  onClick={() => setSelectedClinicianId(clinician.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? 'border-amber-400 bg-amber-50'
                      : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    isSelected ? 'bg-amber-200 text-amber-800' : 'bg-stone-200 text-stone-600'
                  }`}>
                    {initials}
                  </div>
                  <span className={`font-semibold ${isSelected ? 'text-amber-900' : 'text-stone-900'}`}>
                    {clinician.name}
                  </span>
                  {isSelected && (
                    <Check size={18} className="ml-auto text-amber-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-5 border-t border-stone-200 bg-stone-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-5 py-3 rounded-xl font-semibold text-stone-600 bg-white border border-stone-200 hover:bg-stone-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleTransfer}
            disabled={!selectedClinicianId || isTransferring}
            className={`flex-1 px-5 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              selectedClinicianId && !isTransferring
                ? 'bg-amber-500 text-white hover:bg-amber-600'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            {isTransferring ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                Transferring...
              </>
            ) : (
              <>
                <ArrowRight size={18} />
                {selectedClinician ? `Transfer to ${selectedClinician.name.split(' ')[0]}` : 'Select Clinician'}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// =============================================================================
// CONSULTATION ROW
// =============================================================================

interface ConsultationRowProps {
  consultation: Consultation;
  onClick: () => void;
  onTakeAction: () => void;
}

const ConsultationRow: React.FC<ConsultationRowProps> = ({
  consultation,
  onClick,
  onTakeAction,
}) => {
  const stageConfig = getStageConfig(consultation.stage);
  const stageColors = STAGE_COLORS[consultation.stage];
  const nextAction = getNextAction(consultation);
  const isPast = isConsultationPast(consultation.datetime);
  const isToday = isConsultationToday(consultation.datetime);

  // Meeting type helpers
  const hasVideoLink = consultation.meetingType === 'google_meet' || consultation.meetingType === 'zoom';
  const isPhoneCall = consultation.meetingType === 'phone';
  // Show join for today's consultations (even if time passed - people join late) and future ones
  const showJoinButton = consultation.stage === 'confirmed' && (isToday || !isPast);

  // Determine what to show in the "when" column
  const getWhenDisplay = () => {
    if (consultation.stage === 'confirmed') {
      return {
        primary: formatConsultationDate(consultation.datetime),
        secondary: isToday ? 'Today' : isPast ? 'Consultation passed' : null,
        highlight: isToday,
      };
    }
    if (consultation.stage === 'no_show') {
      const daysSince = getDaysSince(consultation.datetime);
      return {
        primary: `${daysSince} day${daysSince !== 1 ? 's' : ''} ago`,
        secondary: `Follow-up ${consultation.followUpCount + 1} needed`,
        highlight: true,
      };
    }
    if (consultation.stage === 'intake_scheduled' && consultation.intakeScheduledDate) {
      return {
        primary: formatConsultationDate(consultation.intakeScheduledDate),
        secondary: 'Intake scheduled',
        highlight: false,
      };
    }
    if (consultation.stage === 'paperwork_complete' && consultation.firstSessionDate) {
      return {
        primary: formatConsultationDate(consultation.firstSessionDate),
        secondary: 'First session',
        highlight: false,
      };
    }
    return {
      primary: formatConsultationDate(consultation.datetime),
      secondary: null,
      highlight: false,
    };
  };

  const whenDisplay = getWhenDisplay();

  return (
    <div
      className="group bg-white rounded-xl lg:rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.005] cursor-pointer"
      style={{ boxShadow: '0 2px 12px -2px rgba(0, 0, 0, 0.08)' }}
      onClick={onClick}
    >
      {/* Accent bar */}
      <div className={`h-1 ${stageColors.dot}`} />

      <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-5">
        {/* Mobile layout */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Avatar */}
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${stageColors.bg} ${stageColors.text}`}
              >
                {getClientInitials(consultation.firstName, consultation.lastName)}
              </div>
              {/* Name & clinician */}
              <div className="min-w-0">
                <h3 className="text-base text-stone-900 font-bold truncate" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                  {consultation.firstName} {consultation.lastName}
                </h3>
                <p className="text-stone-500 text-xs truncate">{consultation.clinicianName}</p>
              </div>
            </div>
            {/* Stage badge */}
            <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${stageColors.bg} ${stageColors.text}`}>
              {stageConfig.label}
            </div>
          </div>
          {/* Action row */}
          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-stone-500 text-sm">
              <Clock size={14} />
              <span>{whenDisplay.primary}</span>
            </div>
            <div className="flex items-center gap-2">
              {/* Join button for confirmed consultations */}
              {showJoinButton && hasVideoLink && consultation.meetingLink && (
                <a
                  href={consultation.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors flex items-center gap-1.5"
                >
                  <Video size={14} />
                  Join
                </a>
              )}
              {showJoinButton && isPhoneCall && consultation.meetingPhone && (
                <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-stone-100 text-stone-600 text-sm">
                  <Phone size={14} />
                  <span className="font-medium">{consultation.meetingPhone}</span>
                </div>
              )}
              {nextAction && consultation.stage !== 'converted' && consultation.stage !== 'lost' && !showJoinButton && (
                <button
                  onClick={(e) => { e.stopPropagation(); onTakeAction(); }}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Zap size={14} />
                  Action
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Desktop layout */}
        <div className="hidden lg:grid gap-4 items-center"
          style={{ gridTemplateColumns: '2fr 1.2fr 1.5fr 1fr 160px' }}
        >
          {/* Client */}
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold flex-shrink-0 ${stageColors.bg} ${stageColors.text}`}
            >
              {getClientInitials(consultation.firstName, consultation.lastName)}
            </div>
            <div className="min-w-0">
              <h3 className="text-lg text-stone-900 font-bold truncate" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                {consultation.firstName} {consultation.lastName}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <div className={`w-2.5 h-2.5 rounded-full ${stageColors.dot}`} />
                <span className="text-stone-500 text-sm">{stageConfig.label}</span>
                {consultation.wasTransferred && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                    Transferred
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Clinician */}
          <div className="text-stone-700 text-base font-medium truncate">
            {consultation.clinicianName}
          </div>

          {/* When */}
          <div>
            <div className={`text-base ${whenDisplay.highlight ? 'text-amber-600 font-semibold' : 'text-stone-600'}`}>
              {whenDisplay.primary}
            </div>
            {whenDisplay.secondary && (
              <p className="text-stone-400 text-sm mt-0.5">{whenDisplay.secondary}</p>
            )}
          </div>

          {/* Next Action */}
          <div className="text-stone-500 text-sm">
            {nextAction ? getActionLabel(nextAction) : '—'}
          </div>

          {/* Action button */}
          <div className="flex justify-end">
            {/* Join button for confirmed upcoming consultations */}
            {showJoinButton && hasVideoLink && consultation.meetingLink ? (
              <a
                href={consultation.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-base font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-all"
              >
                <Video size={18} />
                Join
              </a>
            ) : showJoinButton && isPhoneCall && consultation.meetingPhone ? (
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 text-stone-700 whitespace-nowrap">
                <Phone size={18} className="text-stone-500 flex-shrink-0" />
                <span className="font-semibold">{consultation.meetingPhone}</span>
              </div>
            ) : nextAction && consultation.stage !== 'converted' && consultation.stage !== 'lost' ? (
              <button
                onClick={(e) => { e.stopPropagation(); onTakeAction(); }}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-base font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-md hover:shadow-lg transition-all"
              >
                <Zap size={18} />
                Take Action
              </button>
            ) : consultation.stage === 'converted' ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-100 text-emerald-700 font-semibold text-sm">
                <Check size={16} />
                Converted
              </span>
            ) : consultation.stage === 'lost' ? (
              <span className="text-stone-400 text-sm">Lost</span>
            ) : (
              <ChevronRight size={20} className="text-stone-300" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// HELPER: Group consultations by month
// =============================================================================

interface MonthGroup {
  key: string;
  label: string;
  consultations: Consultation[];
}

function groupByMonth(consultations: Consultation[], dateField: 'convertedDate' | 'lostDate' | 'datetime'): MonthGroup[] {
  const groups: Record<string, Consultation[]> = {};

  consultations.forEach(c => {
    const dateStr = c[dateField] || c.datetime;
    const date = new Date(dateStr);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(c);
  });

  // Sort by date descending (newest first)
  const sortedKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  return sortedKeys.map(key => {
    const [year, month] = key.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    return {
      key,
      label,
      consultations: groups[key].sort((a, b) => {
        const dateA = new Date(a[dateField] || a.datetime);
        const dateB = new Date(b[dateField] || b.datetime);
        return dateB.getTime() - dateA.getTime();
      }),
    };
  });
}

// =============================================================================
// MONTH GROUP COMPONENT
// =============================================================================

interface MonthGroupSectionProps {
  group: MonthGroup;
  onSelectConsultation: (c: Consultation) => void;
  onTakeAction: (c: Consultation) => void;
  defaultExpanded?: boolean;
}

const MonthGroupSection: React.FC<MonthGroupSectionProps> = ({
  group,
  onSelectConsultation,
  onTakeAction,
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 transition-colors mb-3"
      >
        <div className="flex items-center gap-3">
          <ChevronDown
            size={18}
            className={`text-stone-500 transition-transform duration-200 ${isExpanded ? '' : '-rotate-90'}`}
          />
          <span className="text-base font-bold text-stone-800" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
            {group.label}
          </span>
        </div>
        <span className="text-sm font-medium text-stone-500 bg-stone-200 px-3 py-1 rounded-full">
          {group.consultations.length}
        </span>
      </button>

      {isExpanded && (
        <div className="space-y-2">
          {group.consultations.map(consultation => (
            <ConsultationRow
              key={consultation.id}
              consultation={consultation}
              onClick={() => onSelectConsultation(consultation)}
              onTakeAction={() => onTakeAction(consultation)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// =============================================================================
// MAIN CONSULTATIONS COMPONENT
// =============================================================================

// View mode type
type ViewMode = 'kanban' | 'upcoming' | 'list';

export const Consultations: React.FC = () => {
  const [selectedSegment, setSelectedSegment] = useState<ConsultationSegment>('action_needed');
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [consultations, setConsultations] = useState(MOCK_CONSULTATIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllTime, setShowAllTime] = useState(false);
  const [transferModalConsultation, setTransferModalConsultation] = useState<Consultation | null>(null);
  const [takeActionConsultation, setTakeActionConsultation] = useState<Consultation | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');

  // Check if current segment is historical (converted/lost)
  const isHistoricalSegment = selectedSegment === 'converted' || selectedSegment === 'lost';

  // Filter consultations by segment
  const filteredConsultations = useMemo(() => {
    const segmentConfig = SEGMENT_CONFIGS.find(s => s.id === selectedSegment);
    if (!segmentConfig) return consultations;

    let filtered = consultations.filter(c => segmentConfig.stages.includes(c.stage));

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.firstName.toLowerCase().includes(query) ||
        c.lastName.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.clinicianName.toLowerCase().includes(query)
      );
    }

    // Apply time filter for historical segments (unless showing all time)
    if (isHistoricalSegment && !showAllTime && !searchQuery.trim()) {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      filtered = filtered.filter(c => {
        const dateField = selectedSegment === 'converted' ? c.convertedDate : c.lostDate;
        const date = new Date(dateField || c.datetime);
        return date >= ninetyDaysAgo;
      });
    }

    return filtered;
  }, [selectedSegment, consultations, searchQuery, showAllTime, isHistoricalSegment]);

  // Group by month for historical segments
  const monthGroups = useMemo(() => {
    if (!isHistoricalSegment) return null;
    const dateField = selectedSegment === 'converted' ? 'convertedDate' : 'lostDate';
    return groupByMonth(filteredConsultations, dateField as 'convertedDate' | 'lostDate');
  }, [filteredConsultations, isHistoricalSegment, selectedSegment]);

  // Total counts (including filtered out)
  const totalHistoricalCount = useMemo(() => {
    if (!isHistoricalSegment) return 0;
    const segmentConfig = SEGMENT_CONFIGS.find(s => s.id === selectedSegment);
    if (!segmentConfig) return 0;
    return consultations.filter(c => segmentConfig.stages.includes(c.stage)).length;
  }, [consultations, isHistoricalSegment, selectedSegment]);

  // Segment counts
  const segmentCounts = useMemo(() => {
    const counts: Record<ConsultationSegment, number> = {
      action_needed: 0,
      upcoming: 0,
      in_progress: 0,
      converted: 0,
      lost: 0,
    };
    SEGMENT_CONFIGS.forEach(segment => {
      counts[segment.id] = consultations.filter(c => segment.stages.includes(c.stage)).length;
    });
    return counts;
  }, [consultations]);

  // Handle action on consultation
  const handleAction = (consultationId: string, action: ActionType, metadata?: { lostStage?: LostStage; notes?: string; intakeScheduled?: boolean }) => {
    // Special case: transfer_clinician opens a modal instead of directly updating
    if (action === 'transfer_clinician') {
      const consultation = consultations.find(c => c.id === consultationId);
      if (consultation) {
        setTransferModalConsultation(consultation);
      }
      return;
    }

    setConsultations(prev => prev.map(c => {
      if (c.id !== consultationId) return c;

      // Update stage based on action
      switch (action) {
        case 'send_confirmation':
          return { ...c, stage: 'confirmed' as ConsultationStage, updatedAt: new Date().toISOString() };
        case 'mark_attended':
        case 'send_post_consult':
          // If intake was already scheduled, go to intake_scheduled, otherwise intake_pending
          if (metadata?.intakeScheduled) {
            return { ...c, stage: 'intake_scheduled' as ConsultationStage, intakeScheduledDate: new Date().toISOString(), updatedAt: new Date().toISOString() };
          }
          return { ...c, stage: 'intake_pending' as ConsultationStage, updatedAt: new Date().toISOString() };
        case 'mark_no_show':
          return { ...c, stage: 'no_show' as ConsultationStage, followUpCount: 0, updatedAt: new Date().toISOString() };
        case 'send_followup_1':
        case 'send_followup_2':
          return { ...c, followUpCount: c.followUpCount + 1, lastFollowUpDate: new Date().toISOString(), updatedAt: new Date().toISOString() };
        case 'send_followup_3':
          return { ...c, followUpCount: 3, lastFollowUpDate: new Date().toISOString(), updatedAt: new Date().toISOString() };
        case 'mark_intake_scheduled':
          return { ...c, stage: 'intake_scheduled' as ConsultationStage, intakeScheduledDate: new Date().toISOString(), updatedAt: new Date().toISOString() };
        case 'send_paperwork_reminder':
          return { ...c, stage: 'paperwork_pending' as ConsultationStage, updatedAt: new Date().toISOString() };
        case 'mark_paperwork_complete':
          return { ...c, stage: 'paperwork_complete' as ConsultationStage, paperworkCompletedDate: new Date().toISOString(), updatedAt: new Date().toISOString() };
        case 'mark_first_session_done':
          return { ...c, stage: 'converted' as ConsultationStage, convertedDate: new Date().toISOString(), updatedAt: new Date().toISOString() };
        case 'mark_lost':
          return {
            ...c,
            stage: 'lost' as ConsultationStage,
            lostDate: new Date().toISOString(),
            lostStage: metadata?.lostStage,
            updatedAt: new Date().toISOString()
          };
        default:
          return c;
      }
    }));

    // Update selected consultation if it was modified
    if (selectedConsultation?.id === consultationId) {
      setSelectedConsultation(prev => {
        if (!prev) return null;
        const updated = consultations.find(c => c.id === consultationId);
        return updated || prev;
      });
    }
  };

  // Handle clinician transfer
  const handleTransfer = (consultationId: string, newClinicianId: string) => {
    const newClinician = CONSULTATION_CLINICIANS.find(c => c.id === newClinicianId);
    if (!newClinician) return;

    setConsultations(prev => prev.map(c => {
      if (c.id !== consultationId) return c;

      return {
        ...c,
        wasTransferred: true,
        originalClinicianId: c.wasTransferred ? c.originalClinicianId : c.clinicianId,
        originalClinicianName: c.wasTransferred ? c.originalClinicianName : c.clinicianName,
        clinicianId: newClinician.id,
        clinicianName: newClinician.name,
        calendarId: newClinician.calendarId,
        updatedAt: new Date().toISOString(),
      };
    }));

    // Update selected consultation if it was the one transferred
    if (selectedConsultation?.id === consultationId) {
      setSelectedConsultation(prev => {
        if (!prev) return null;
        return {
          ...prev,
          wasTransferred: true,
          originalClinicianId: prev.wasTransferred ? prev.originalClinicianId : prev.clinicianId,
          originalClinicianName: prev.wasTransferred ? prev.originalClinicianName : prev.clinicianName,
          clinicianId: newClinician.id,
          clinicianName: newClinician.name,
          calendarId: newClinician.calendarId,
          updatedAt: new Date().toISOString(),
        };
      });
    }

    // Close the transfer modal
    setTransferModalConsultation(null);
  };

  // Today's consultations (max 5 for display)
  const todaysConsultations = useMemo(() =>
    consultations
      .filter(c => isConsultationToday(c.datetime) && c.stage === 'confirmed')
      .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()),
    [consultations]
  );

  // Upcoming consultations (confirmed, not past)
  const upcomingConsultations = useMemo(() =>
    consultations
      .filter(c => (c.stage === 'new' || c.stage === 'confirmed') && !isConsultationPast(c.datetime))
      .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()),
    [consultations]
  );

  // Total upcoming count (for "View all X upcoming" link)
  const totalUpcomingCount = useMemo(() =>
    consultations.filter(c => c.stage === 'confirmed').length,
    [consultations]
  );

  // Monthly stats for header
  const monthlyStats = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const isThisMonth = (dateStr: string | undefined) => {
      if (!dateStr) return false;
      const date = new Date(dateStr);
      return date >= startOfMonth;
    };

    return {
      booked: consultations.filter(c => isThisMonth(c.createdAt)).length,
      converted: consultations.filter(c => c.stage === 'converted' && isThisMonth(c.convertedDate)).length,
      lost: consultations.filter(c => c.stage === 'lost' && isThisMonth(c.lostDate)).length,
      inProgress: consultations.filter(c =>
        ['consult_complete', 'intake_pending', 'intake_scheduled', 'paperwork_pending', 'paperwork_complete'].includes(c.stage)
      ).length,
    };
  }, [consultations]);

  return (
    <div className="flex-1 overflow-y-auto h-[calc(100vh-80px)] bg-gradient-to-b from-stone-100 to-stone-50">
      <div className="min-h-full">
        {/* =============================================
            HERO SECTION - SEGMENT SELECTOR
            ============================================= */}
        <PageHeader
          accent="cyan"
          label="Client Pipeline"
          title="Consultations"
          subtitle={`${segmentCounts.action_needed} consultation${segmentCounts.action_needed !== 1 ? 's' : ''} need attention`}
          showGridPattern
          actions={
            <div className="flex flex-col items-end gap-3">
              <p className="text-stone-400 text-sm uppercase tracking-wider font-semibold">This Month</p>
              <div className="flex items-center gap-5 sm:gap-6">
                <div className="text-right">
                  <p className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                    {monthlyStats.booked}
                  </p>
                  <p className="text-stone-400 text-sm font-medium">Booked</p>
                </div>
                <div className="w-px h-10 bg-white/15" />
                <div className="text-right">
                  <p className="text-2xl sm:text-3xl font-bold text-amber-400" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                    {monthlyStats.inProgress}
                  </p>
                  <p className="text-stone-400 text-sm font-medium">Active</p>
                </div>
                <div className="w-px h-10 bg-white/15" />
                <div className="text-right">
                  <p className="text-2xl sm:text-3xl font-bold text-emerald-400" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                    {monthlyStats.converted}
                  </p>
                  <p className="text-stone-400 text-sm font-medium">Converted</p>
                </div>
                <div className="w-px h-10 bg-white/15" />
                <div className="text-right">
                  <p className="text-2xl sm:text-3xl font-bold text-rose-400" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                    {monthlyStats.lost}
                  </p>
                  <p className="text-stone-400 text-sm font-medium">Lost</p>
                </div>
              </div>
            </div>
          }
        >
          {/* View selector and segment tabs */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Segment tabs - simplified for Kanban */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedSegment('action_needed');
                  setViewMode('kanban');
                }}
                className={`px-5 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  viewMode === 'kanban'
                    ? 'bg-white text-stone-900 shadow-lg'
                    : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  <LayoutGrid size={18} />
                  Pipeline Board
                </span>
              </button>
              <button
                onClick={() => {
                  setSelectedSegment('upcoming');
                  setViewMode('upcoming');
                }}
                className={`px-5 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  viewMode === 'upcoming'
                    ? 'bg-white text-stone-900 shadow-lg'
                    : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Calendar size={18} />
                  Upcoming
                  <span className={`${viewMode === 'upcoming' ? 'text-cyan-600' : 'text-cyan-400'}`}>
                    {upcomingConsultations.length}
                  </span>
                </span>
              </button>
              <button
                onClick={() => {
                  setSelectedSegment('converted');
                  setViewMode('list');
                }}
                className={`px-5 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  selectedSegment === 'converted'
                    ? 'bg-white text-stone-900 shadow-lg'
                    : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
                }`}
              >
                <span className="text-base">
                  Converted
                  <span className={`ml-2 ${selectedSegment === 'converted' ? 'text-emerald-600' : 'text-emerald-400'}`}>
                    {segmentCounts.converted}
                  </span>
                </span>
              </button>
              <button
                onClick={() => {
                  setSelectedSegment('lost');
                  setViewMode('list');
                }}
                className={`px-5 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  selectedSegment === 'lost'
                    ? 'bg-white text-stone-900 shadow-lg'
                    : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
                }`}
              >
                <span className="text-base">
                  Lost
                  <span className={`ml-2 ${selectedSegment === 'lost' ? 'text-stone-600' : 'text-stone-400'}`}>
                    {segmentCounts.lost}
                  </span>
                </span>
              </button>
            </div>
          </div>
        </PageHeader>

        {/* =============================================
            MAIN CONTENT AREA
            ============================================= */}

        {/* KANBAN VIEW - for active pipeline */}
        {viewMode === 'kanban' && (
          <div className="h-[calc(100vh-280px)]">
            <ConsultationsKanban
              consultations={consultations.filter(c => !['converted', 'lost'].includes(c.stage))}
              onTakeAction={setTakeActionConsultation}
              onSelectConsultation={setSelectedConsultation}
            />
          </div>
        )}

        {/* UPCOMING VIEW - clean table of upcoming consultations */}
        {viewMode === 'upcoming' && (
          <div className="px-6 sm:px-8 lg:px-12 py-6 lg:py-8">
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, #ffffff 0%, #fafaf9 100%)',
                boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)',
              }}
            >
              {/* Table Header */}
              <div className="px-6 py-5 border-b border-stone-200/80 bg-stone-50/50">
                <h3
                  className="text-xl font-bold text-stone-900"
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  Upcoming Consultations
                </h3>
                <p className="text-stone-500 text-sm mt-1">
                  {upcomingConsultations.length} consultation{upcomingConsultations.length !== 1 ? 's' : ''} scheduled
                </p>
              </div>

              {/* Table */}
              {upcomingConsultations.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-stone-200/60 bg-stone-50/30">
                        <th className="text-left px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                          Client
                        </th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                          Clinician
                        </th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="text-right px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcomingConsultations.map((consultation, idx) => {
                        const isToday = isConsultationToday(consultation.datetime);
                        const stageColors = STAGE_COLORS[consultation.stage];
                        const stageConfig = getStageConfig(consultation.stage);
                        const hasVideoLink = consultation.meetingType === 'google_meet' || consultation.meetingType === 'zoom';
                        const isPhoneCall = consultation.meetingType === 'phone';

                        return (
                          <tr
                            key={consultation.id}
                            className={`
                              border-b border-stone-100 last:border-0 transition-colors cursor-pointer
                              ${isToday ? 'bg-amber-50/40' : 'hover:bg-stone-50/80'}
                            `}
                            onClick={() => setSelectedConsultation(consultation)}
                          >
                            {/* Client */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${stageColors.bg} ${stageColors.text}`}
                                >
                                  {getClientInitials(consultation.firstName, consultation.lastName)}
                                </div>
                                <div>
                                  <p
                                    className="font-semibold text-stone-900"
                                    style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                                  >
                                    {consultation.firstName} {consultation.lastName}
                                  </p>
                                  <p className="text-stone-500 text-sm">{consultation.email}</p>
                                </div>
                              </div>
                            </td>

                            {/* Date & Time */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {isToday && (
                                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700 rounded-full">
                                    Today
                                  </span>
                                )}
                                <span className={`font-medium ${isToday ? 'text-amber-700' : 'text-stone-700'}`}>
                                  {formatConsultationDate(consultation.datetime)}
                                </span>
                              </div>
                            </td>

                            {/* Clinician */}
                            <td className="px-6 py-4">
                              <span className="text-stone-700 font-medium">{consultation.clinicianName}</span>
                            </td>

                            {/* Status */}
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${stageColors.bg} ${stageColors.text}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${stageColors.dot}`} />
                                {stageConfig.label}
                              </span>
                            </td>

                            {/* Action */}
                            <td className="px-6 py-4 text-right">
                              {isToday && hasVideoLink && consultation.meetingLink ? (
                                <a
                                  href={consultation.meetingLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                                >
                                  <Video size={14} />
                                  Join
                                </a>
                              ) : isToday && isPhoneCall && consultation.meetingPhone ? (
                                <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 text-stone-700 text-sm">
                                  <Phone size={14} />
                                  <span className="font-medium">{consultation.meetingPhone}</span>
                                </div>
                              ) : consultation.stage === 'new' ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setTakeActionConsultation(consultation);
                                  }}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                                >
                                  <Zap size={14} />
                                  Confirm
                                </button>
                              ) : (
                                <ChevronRight size={18} className="text-stone-300 inline" />
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-stone-100 mb-4">
                    <Calendar size={32} className="text-stone-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-stone-900 mb-1">No upcoming consultations</h4>
                  <p className="text-stone-500 text-sm">New consultations will appear here when booked</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* LIST VIEW - for historical segments (converted/lost) */}
        {isHistoricalSegment && (
          <div className="px-6 sm:px-8 lg:px-12 py-6 lg:py-8">
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, #ffffff 0%, #fafaf9 100%)',
                boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)',
              }}
            >
              {/* Table Header */}
              <div className="px-6 py-5 border-b border-stone-200/80 bg-stone-50/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3
                      className="text-xl font-bold text-stone-900"
                      style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                    >
                      {selectedSegment === 'converted' ? 'Converted Clients' : 'Lost Cases'}
                    </h3>
                    <p className="text-stone-500 text-sm mt-1">
                      {filteredConsultations.length} {selectedSegment === 'converted' ? 'conversion' : 'case'}{filteredConsultations.length !== 1 ? 's' : ''}
                      {!showAllTime && ' in last 90 days'}
                    </p>
                  </div>

                  {/* Search and Filters */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-48 pl-9 pr-3 py-2 rounded-lg bg-white border border-stone-200 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200 focus:border-stone-300 transition-all"
                      />
                    </div>
                    <button
                      onClick={() => setShowAllTime(!showAllTime)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        showAllTime
                          ? 'bg-stone-800 text-white'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {showAllTime ? 'All Time' : 'Last 90 Days'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Table */}
              {filteredConsultations.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-stone-200/60 bg-stone-50/30">
                        <th className="text-left px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                          Client
                        </th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                          {selectedSegment === 'converted' ? 'Converted' : 'Lost'}
                        </th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                          Clinician
                        </th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                          {selectedSegment === 'converted' ? 'Journey' : 'Lost At'}
                        </th>
                        <th className="text-right px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                          Details
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredConsultations.map((consultation) => {
                        const isConverted = selectedSegment === 'converted';
                        const dateField = isConverted ? consultation.convertedDate : consultation.lostDate;
                        const formattedDate = dateField ? formatConsultationDate(dateField) : '—';

                        // Calculate days from consultation to outcome
                        const consultDate = new Date(consultation.datetime);
                        const outcomeDate = dateField ? new Date(dateField) : null;
                        const daysDiff = outcomeDate
                          ? Math.round((outcomeDate.getTime() - consultDate.getTime()) / (1000 * 60 * 60 * 24))
                          : null;

                        return (
                          <tr
                            key={consultation.id}
                            className="border-b border-stone-100 last:border-0 transition-colors cursor-pointer hover:bg-stone-50/80"
                            onClick={() => setSelectedConsultation(consultation)}
                          >
                            {/* Client */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                                    isConverted
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : 'bg-stone-100 text-stone-500'
                                  }`}
                                >
                                  {getClientInitials(consultation.firstName, consultation.lastName)}
                                </div>
                                <div>
                                  <p
                                    className="font-semibold text-stone-900"
                                    style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                                  >
                                    {consultation.firstName} {consultation.lastName}
                                  </p>
                                  <p className="text-stone-500 text-sm">{consultation.email}</p>
                                </div>
                              </div>
                            </td>

                            {/* Date */}
                            <td className="px-6 py-4">
                              <span className="font-medium text-stone-700">{formattedDate}</span>
                            </td>

                            {/* Clinician */}
                            <td className="px-6 py-4">
                              <span className="text-stone-700 font-medium">{consultation.clinicianName}</span>
                            </td>

                            {/* Journey / Lost At */}
                            <td className="px-6 py-4">
                              {isConverted ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700">
                                  <Check size={12} />
                                  {daysDiff !== null ? `${daysDiff} days` : '—'}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-100 text-stone-600">
                                  {consultation.lostStage?.replace('_', ' ') || 'Unknown'}
                                </span>
                              )}
                            </td>

                            {/* Details */}
                            <td className="px-6 py-4 text-right">
                              <ChevronRight size={18} className="text-stone-300 inline" />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-stone-100 mb-4">
                    {selectedSegment === 'converted' ? (
                      <Check size={32} className="text-stone-400" />
                    ) : (
                      <User size={32} className="text-stone-400" />
                    )}
                  </div>
                  <h4 className="text-lg font-semibold text-stone-900 mb-1">
                    {searchQuery ? 'No matches found' : `No ${selectedSegment} consultations`}
                  </h4>
                  <p className="text-stone-500 text-sm">
                    {searchQuery
                      ? 'Try a different search term'
                      : selectedSegment === 'converted'
                        ? 'Converted clients will appear here'
                        : 'Lost cases will appear here'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Detail Panel Overlay */}
      <AnimatePresence>
        {selectedConsultation && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setSelectedConsultation(null)}
            />
            {/* Detail Panel */}
            <ConsultationDetail
              consultation={selectedConsultation}
              onClose={() => setSelectedConsultation(null)}
              onTakeAction={() => {
                setTakeActionConsultation(selectedConsultation);
              }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Transfer Clinician Modal */}
      <AnimatePresence>
        {transferModalConsultation && (
          <TransferClinicianModal
            consultation={transferModalConsultation}
            onClose={() => setTransferModalConsultation(null)}
            onTransfer={handleTransfer}
          />
        )}
      </AnimatePresence>

      {/* Take Action Modal */}
      <AnimatePresence>
        {takeActionConsultation && (
          <TakeActionModal
            consultation={takeActionConsultation}
            onClose={() => setTakeActionConsultation(null)}
            onAction={handleAction}
            onTransfer={(consultationId) => {
              const consultation = consultations.find(c => c.id === consultationId);
              if (consultation) {
                setTakeActionConsultation(null);
                setTransferModalConsultation(consultation);
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Consultations;
