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
  const timelineItems: { label: string; date?: string; status: 'done' | 'current' | 'next' | 'pending' }[] = [
    {
      label: 'Consultation scheduled',
      date: formatConsultationDate(consultation.datetime),
      status: 'done',
    },
  ];

  if (consultation.stage === 'new') {
    timelineItems.push({ label: 'Send confirmation email', status: 'current' });
    timelineItems.push({ label: 'Consultation upcoming', date: formatConsultationDate(consultation.datetime), status: 'next' });
  } else if (consultation.stage === 'confirmed') {
    timelineItems.push({ label: 'Confirmation sent', status: 'done' });
    timelineItems.push({ label: 'Mark consultation outcome', status: 'current' });
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
                {item.status === 'next' ? (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="w-3 h-3 rounded-full flex-shrink-0 bg-cyan-500"
                  />
                ) : (
                  <div
                    className={`w-3 h-3 rounded-full flex-shrink-0 ${
                      item.status === 'done' ? 'bg-emerald-500' :
                      item.status === 'current' ? 'bg-amber-500' : 'bg-stone-300'
                    }`}
                  />
                )}
                {idx < timelineItems.length - 1 && (
                  <div className={`w-0.5 h-8 ${
                    item.status === 'done' ? 'bg-emerald-200' :
                    item.status === 'next' ? 'bg-cyan-200' : 'bg-stone-200'
                  }`} />
                )}
              </div>
              <div className="pb-4">
                <p className={`font-medium ${
                  item.status === 'done' ? 'text-stone-600' :
                  item.status === 'current' ? 'text-stone-900' :
                  item.status === 'next' ? 'text-cyan-700' : 'text-stone-400'
                }`}>
                  {item.label}
                </p>
                {item.date && (
                  <p className={`text-sm mt-0.5 ${item.status === 'next' ? 'text-cyan-600' : 'text-stone-400'}`}>
                    {item.date}
                  </p>
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

// =============================================================================
// DEV TESTING PANEL
// =============================================================================
// Floating panel for testing different consultation stages and timing scenarios
//
// STAGE TIMING LOGIC:
// -------------------
// 1. intake_pending: Follow-up intervals 24h → 72h → 168h from stageEnteredAt/lastFollowUpDate
// 2. no_show: Recovery intervals 0h → 24h → 72h from stageEnteredAt/lastFollowUpDate
// 3. new: Based on createdAt (>4h = overdue)
// 4. confirmed: Based on consultation datetime
// 5. consult_complete: Always due now
// 6. intake_scheduled/paperwork_pending: Based on intakeScheduledDate
// 7. paperwork_complete: Based on firstSessionDate

const ALL_STAGES: ConsultationStage[] = [
  'new',
  'confirmed',
  'consult_complete',
  'no_show',
  'intake_pending',
  'intake_scheduled',
  'paperwork_pending',
  'paperwork_complete',
  'converted',
  'lost',
];

// =============================================================================
// FULL KANBAN MOCK DATA GENERATOR
// =============================================================================
// Generates one client per stage, spread across clinicians for realistic testing

const FULL_KANBAN_CLIENT_NAMES = [
  { firstName: 'Emily', lastName: 'Thompson' },
  { firstName: 'Marcus', lastName: 'Williams' },
  { firstName: 'Sophia', lastName: 'Garcia' },
  { firstName: 'David', lastName: 'Lee' },
  { firstName: 'Olivia', lastName: 'Martinez' },
  { firstName: 'Ethan', lastName: 'Brown' },
  { firstName: 'Ava', lastName: 'Davis' },
  { firstName: 'Noah', lastName: 'Wilson' },
  { firstName: 'Isabella', lastName: 'Taylor' },
  { firstName: 'Liam', lastName: 'Anderson' },
];

function generateFullKanbanData(): Consultation[] {
  const now = Date.now();
  const clinicians = CONSULTATION_CLINICIANS;

  // Define representative scenarios for each stage
  const stageScenarios: { stage: ConsultationStage; setup: (id: number, clinician: typeof clinicians[0]) => Partial<Consultation> }[] = [
    // New booking - needs confirmation
    {
      stage: 'new',
      setup: (id, clinician) => ({
        stage: 'new',
        datetime: new Date(now + 48 * 60 * 60 * 1000).toISOString(), // In 2 days
        createdAt: new Date(now - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        followUpCount: 0,
      }),
    },
    // Confirmed - awaiting consultation
    {
      stage: 'confirmed',
      setup: (id, clinician) => ({
        stage: 'confirmed',
        datetime: new Date(now + 4 * 60 * 60 * 1000).toISOString(), // In 4 hours
        followUpCount: 0,
      }),
    },
    // Consult complete - needs post-consult message
    {
      stage: 'consult_complete',
      setup: (id, clinician) => ({
        stage: 'consult_complete',
        datetime: new Date(now - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        followUpCount: 0,
      }),
    },
    // No-show - recovery follow-up #2 due
    {
      stage: 'no_show',
      setup: (id, clinician) => ({
        stage: 'no_show',
        datetime: new Date(now - 26 * 60 * 60 * 1000).toISOString(), // 26 hours ago
        followUpCount: 1,
        stageEnteredAt: new Date(now - 26 * 60 * 60 * 1000).toISOString(),
        lastFollowUpDate: new Date(now - 25 * 60 * 60 * 1000).toISOString(), // 25h ago
      }),
    },
    // Intake pending - follow-up #1 due
    {
      stage: 'intake_pending',
      setup: (id, clinician) => ({
        stage: 'intake_pending',
        datetime: new Date(now - 48 * 60 * 60 * 1000).toISOString(), // 48 hours ago
        followUpCount: 0,
        stageEnteredAt: new Date(now - 26 * 60 * 60 * 1000).toISOString(), // 26h ago
      }),
    },
    // Intake scheduled - paperwork reminder due (T-72h)
    {
      stage: 'intake_scheduled',
      setup: (id, clinician) => ({
        stage: 'intake_scheduled',
        datetime: new Date(now - 72 * 60 * 60 * 1000).toISOString(),
        intakeScheduledDate: new Date(now + 70 * 60 * 60 * 1000).toISOString(), // Intake in ~3 days
        intakeHasTime: true,
        followUpCount: 0,
      }),
    },
    // Paperwork pending - follow-up #2 due (T-24h)
    {
      stage: 'paperwork_pending',
      setup: (id, clinician) => ({
        stage: 'paperwork_pending',
        datetime: new Date(now - 120 * 60 * 60 * 1000).toISOString(),
        intakeScheduledDate: new Date(now + 22 * 60 * 60 * 1000).toISOString(), // Intake in ~1 day
        intakeHasTime: true,
        followUpCount: 1,
      }),
    },
    // Paperwork complete - ready for first session
    {
      stage: 'paperwork_complete',
      setup: (id, clinician) => ({
        stage: 'paperwork_complete',
        datetime: new Date(now - 168 * 60 * 60 * 1000).toISOString(),
        paperworkCompletedDate: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
        firstSessionDate: new Date(now + 48 * 60 * 60 * 1000).toISOString(),
        followUpCount: 0,
      }),
    },
    // Converted - success
    {
      stage: 'converted',
      setup: (id, clinician) => ({
        stage: 'converted',
        datetime: new Date(now - 336 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
        convertedDate: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
        followUpCount: 0,
      }),
    },
    // Lost - did not convert
    {
      stage: 'lost',
      setup: (id, clinician) => ({
        stage: 'lost',
        datetime: new Date(now - 168 * 60 * 60 * 1000).toISOString(), // 1 week ago
        lostStage: 'pre_intake',
        lostDate: new Date(now - 48 * 60 * 60 * 1000).toISOString(),
        lostReason: 'No response',
        followUpCount: 3,
      }),
    },
  ];

  return stageScenarios.map((scenario, index) => {
    const clientName = FULL_KANBAN_CLIENT_NAMES[index % FULL_KANBAN_CLIENT_NAMES.length];
    const clinician = clinicians[index % clinicians.length];
    const setup = scenario.setup(index, clinician);

    return {
      id: `fk-${index + 1}`,
      firstName: clientName.firstName,
      lastName: clientName.lastName,
      email: `${clientName.firstName.toLowerCase()}.${clientName.lastName.toLowerCase()}@email.com`,
      phone: `(212) 555-${String(index + 100).padStart(4, '0')}`,
      appointmentId: 2000 + index,
      appointmentTypeId: 1001,
      appointmentTypeName: `New Client Consultation with ${clinician.name}`,
      datetime: setup.datetime || new Date(now + 48 * 60 * 60 * 1000).toISOString(),
      duration: 15,
      meetingType: 'google_meet' as const,
      meetingLink: `https://meet.google.com/fk-${index}-test`,
      clinicianId: clinician.id,
      clinicianName: clinician.name,
      calendarId: clinician.calendarId,
      wasTransferred: false,
      stage: scenario.stage,
      followUpCount: setup.followUpCount || 0,
      stageEnteredAt: setup.stageEnteredAt,
      lastFollowUpDate: setup.lastFollowUpDate,
      intakeScheduledDate: setup.intakeScheduledDate,
      intakeHasTime: setup.intakeHasTime,
      paperworkCompletedDate: setup.paperworkCompletedDate,
      firstSessionDate: setup.firstSessionDate,
      convertedDate: setup.convertedDate,
      lostStage: setup.lostStage as LostStage | undefined,
      lostDate: setup.lostDate,
      lostReason: setup.lostReason,
      formResponses: [
        { fieldId: 1, fieldName: 'Reason for seeking therapy', value: 'Anxiety and stress management' },
        { fieldId: 2, fieldName: 'Insurance', value: 'Aetna' },
      ],
      createdAt: setup.createdAt || new Date(now - 72 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });
}

const STAGE_LABELS_DEV: Record<ConsultationStage, string> = {
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

// Stage-specific scenarios with all the data they need to set
interface DevScenario {
  id: string;
  label: string;
  description: string;
  urgency: 'overdue' | 'due' | 'upcoming' | 'normal';
  // What to set
  stage: ConsultationStage;
  followUpCount?: number;
  stageEnteredAtHoursAgo?: number;
  lastFollowUpHoursAgo?: number;
  consultHoursFromNow?: number; // positive = future, negative = past
  intakeDateHoursFromNow?: number;
  createdAtHoursAgo?: number;
}

// Organized by stage with all possible scenarios
const STAGE_SCENARIOS: Record<ConsultationStage, DevScenario[]> = {
  new: [
    { id: 'new_fresh', label: 'Just booked', description: 'New booking, no urgency yet', urgency: 'normal', stage: 'new', createdAtHoursAgo: 1, consultHoursFromNow: 48 },
    { id: 'new_needs_confirm', label: 'Needs confirmation', description: '4+ hours, should confirm', urgency: 'due', stage: 'new', createdAtHoursAgo: 5, consultHoursFromNow: 48 },
    { id: 'new_overdue', label: 'Overdue confirmation', description: '24h+ no confirmation', urgency: 'overdue', stage: 'new', createdAtHoursAgo: 25, consultHoursFromNow: 24 },
  ],
  confirmed: [
    { id: 'confirmed_future', label: 'Future consult', description: 'Consult in 3 days', urgency: 'normal', stage: 'confirmed', consultHoursFromNow: 72 },
    { id: 'confirmed_tomorrow', label: 'Tomorrow', description: 'Consult tomorrow', urgency: 'upcoming', stage: 'confirmed', consultHoursFromNow: 24 },
    { id: 'confirmed_today', label: 'Today', description: 'Consult in 4 hours', urgency: 'due', stage: 'confirmed', consultHoursFromNow: 4 },
    { id: 'confirmed_imminent', label: 'Starting soon', description: 'Consult in 15 mins', urgency: 'due', stage: 'confirmed', consultHoursFromNow: 0.25 },
    { id: 'confirmed_past', label: 'Consult ended', description: 'Time passed, need outcome', urgency: 'overdue', stage: 'confirmed', consultHoursFromNow: -1 },
  ],
  consult_complete: [
    { id: 'consult_complete_now', label: 'Just completed', description: 'Need to record outcome', urgency: 'due', stage: 'consult_complete', consultHoursFromNow: -0.5 },
    { id: 'consult_complete_overdue', label: 'Overdue outcome', description: '2 days no outcome recorded', urgency: 'overdue', stage: 'consult_complete', consultHoursFromNow: -48 },
  ],
  no_show: [
    // Recovery sequence: Immediate → 24h → 72h
    { id: 'noshow_1_due', label: 'Recovery #1 due', description: 'Just marked no-show', urgency: 'due', stage: 'no_show', followUpCount: 0, stageEnteredAtHoursAgo: 0 },
    { id: 'noshow_1_overdue', label: 'Recovery #1 overdue', description: '2h since no-show', urgency: 'overdue', stage: 'no_show', followUpCount: 0, stageEnteredAtHoursAgo: 2 },
    { id: 'noshow_2_upcoming', label: 'Recovery #2 upcoming', description: '#1 sent, #2 in 12h', urgency: 'upcoming', stage: 'no_show', followUpCount: 1, lastFollowUpHoursAgo: 12 },
    { id: 'noshow_2_due', label: 'Recovery #2 due', description: '#1 sent 24h ago', urgency: 'due', stage: 'no_show', followUpCount: 1, lastFollowUpHoursAgo: 24 },
    { id: 'noshow_2_overdue', label: 'Recovery #2 overdue', description: '#1 sent 30h ago', urgency: 'overdue', stage: 'no_show', followUpCount: 1, lastFollowUpHoursAgo: 30 },
    { id: 'noshow_3_upcoming', label: 'Recovery #3 upcoming', description: '#2 sent, #3 in 24h', urgency: 'upcoming', stage: 'no_show', followUpCount: 2, lastFollowUpHoursAgo: 48 },
    { id: 'noshow_3_due', label: 'Recovery #3 due', description: '#2 sent 72h ago', urgency: 'due', stage: 'no_show', followUpCount: 2, lastFollowUpHoursAgo: 72 },
    { id: 'noshow_3_overdue', label: 'Recovery #3 overdue', description: '#2 sent 96h ago', urgency: 'overdue', stage: 'no_show', followUpCount: 2, lastFollowUpHoursAgo: 96 },
    { id: 'noshow_exhausted', label: 'All sent - decide', description: 'All 3 sent, need decision', urgency: 'overdue', stage: 'no_show', followUpCount: 3, lastFollowUpHoursAgo: 24 },
  ],
  intake_pending: [
    // Follow-up sequence: 24h → 72h → 168h
    { id: 'intake_1_upcoming', label: 'Follow-up #1 upcoming', description: 'Just entered, due in 24h', urgency: 'upcoming', stage: 'intake_pending', followUpCount: 0, stageEnteredAtHoursAgo: 0 },
    { id: 'intake_1_soon', label: 'Follow-up #1 soon', description: 'Due in 4h', urgency: 'due', stage: 'intake_pending', followUpCount: 0, stageEnteredAtHoursAgo: 20 },
    { id: 'intake_1_due', label: 'Follow-up #1 due', description: '24h passed', urgency: 'due', stage: 'intake_pending', followUpCount: 0, stageEnteredAtHoursAgo: 24 },
    { id: 'intake_1_overdue', label: 'Follow-up #1 overdue', description: '30h passed', urgency: 'overdue', stage: 'intake_pending', followUpCount: 0, stageEnteredAtHoursAgo: 30 },
    { id: 'intake_2_upcoming', label: 'Follow-up #2 upcoming', description: '#1 sent, #2 in 48h', urgency: 'upcoming', stage: 'intake_pending', followUpCount: 1, lastFollowUpHoursAgo: 24 },
    { id: 'intake_2_due', label: 'Follow-up #2 due', description: '#1 sent 72h ago', urgency: 'due', stage: 'intake_pending', followUpCount: 1, lastFollowUpHoursAgo: 72 },
    { id: 'intake_2_overdue', label: 'Follow-up #2 overdue', description: '#1 sent 96h ago', urgency: 'overdue', stage: 'intake_pending', followUpCount: 1, lastFollowUpHoursAgo: 96 },
    { id: 'intake_3_upcoming', label: 'Follow-up #3 upcoming', description: '#2 sent, #3 in 4d', urgency: 'upcoming', stage: 'intake_pending', followUpCount: 2, lastFollowUpHoursAgo: 72 },
    { id: 'intake_3_due', label: 'Follow-up #3 due', description: '#2 sent 168h ago', urgency: 'due', stage: 'intake_pending', followUpCount: 2, lastFollowUpHoursAgo: 168 },
    { id: 'intake_3_overdue', label: 'Follow-up #3 overdue', description: '#2 sent 192h ago', urgency: 'overdue', stage: 'intake_pending', followUpCount: 2, lastFollowUpHoursAgo: 192 },
    { id: 'intake_exhausted', label: 'All sent - decide', description: 'All 3 sent, need decision', urgency: 'overdue', stage: 'intake_pending', followUpCount: 3, lastFollowUpHoursAgo: 24 },
  ],
  intake_scheduled: [
    // Paperwork reminders relative to intake date: T-72h, T-24h (standard preset)
    // Follow-up 1 is due when intake is 72h away, Follow-up 2 when 24h away
    { id: 'intake_sched_far', label: 'Intake far away', description: 'Intake in 1 week, no follow-up due yet', urgency: 'normal', stage: 'intake_scheduled', intakeDateHoursFromNow: 168, followUpCount: 0 },
    { id: 'intake_sched_fu1_upcoming', label: 'Follow-up #1 upcoming', description: 'Intake in 80h, due in 8h', urgency: 'upcoming', stage: 'intake_scheduled', intakeDateHoursFromNow: 80, followUpCount: 0 },
    { id: 'intake_sched_fu1_due', label: 'Follow-up #1 due', description: 'Intake in 72h (T-72h)', urgency: 'due', stage: 'intake_scheduled', intakeDateHoursFromNow: 72, followUpCount: 0 },
    { id: 'intake_sched_fu1_overdue', label: 'Follow-up #1 overdue', description: 'Intake in 48h, should have sent at T-72h', urgency: 'overdue', stage: 'intake_scheduled', intakeDateHoursFromNow: 48, followUpCount: 0 },
    { id: 'intake_sched_fu2_upcoming', label: 'Follow-up #2 upcoming', description: '#1 sent, intake in 30h', urgency: 'upcoming', stage: 'intake_scheduled', intakeDateHoursFromNow: 30, followUpCount: 1 },
    { id: 'intake_sched_fu2_due', label: 'Follow-up #2 due', description: '#1 sent, intake in 24h (T-24h)', urgency: 'due', stage: 'intake_scheduled', intakeDateHoursFromNow: 24, followUpCount: 1 },
    { id: 'intake_sched_fu2_overdue', label: 'Follow-up #2 overdue', description: '#1 sent, intake in 12h', urgency: 'overdue', stage: 'intake_scheduled', intakeDateHoursFromNow: 12, followUpCount: 1 },
    { id: 'intake_sched_all_sent', label: 'All sent - waiting', description: 'Both sent, intake in 4h', urgency: 'due', stage: 'intake_scheduled', intakeDateHoursFromNow: 4, followUpCount: 2 },
    { id: 'intake_sched_passed', label: 'Intake completed', description: 'Intake was 2h ago', urgency: 'overdue', stage: 'intake_scheduled', intakeDateHoursFromNow: -2, followUpCount: 2 },
  ],
  paperwork_pending: [
    // Same logic as intake_scheduled - uses T-72h, T-24h reminders
    { id: 'paperwork_far', label: 'Intake far away', description: 'Intake in 1 week', urgency: 'normal', stage: 'paperwork_pending', intakeDateHoursFromNow: 168, followUpCount: 0 },
    { id: 'paperwork_fu1_due', label: 'Follow-up #1 due', description: 'Intake in 72h (T-72h)', urgency: 'due', stage: 'paperwork_pending', intakeDateHoursFromNow: 72, followUpCount: 0 },
    { id: 'paperwork_fu2_due', label: 'Follow-up #2 due', description: '#1 sent, intake in 24h', urgency: 'due', stage: 'paperwork_pending', intakeDateHoursFromNow: 24, followUpCount: 1 },
    { id: 'paperwork_all_sent', label: 'All sent - waiting', description: 'Both sent, intake in 4h', urgency: 'due', stage: 'paperwork_pending', intakeDateHoursFromNow: 4, followUpCount: 2 },
    { id: 'paperwork_past', label: 'Intake completed', description: 'Intake was yesterday', urgency: 'overdue', stage: 'paperwork_pending', intakeDateHoursFromNow: -24, followUpCount: 2 },
  ],
  paperwork_complete: [
    { id: 'ready_no_session', label: 'Ready, no session', description: 'Awaiting first session', urgency: 'normal', stage: 'paperwork_complete' },
    { id: 'session_upcoming', label: 'Session upcoming', description: 'First session in 2 days', urgency: 'upcoming', stage: 'paperwork_complete', intakeDateHoursFromNow: 48 },
    { id: 'session_today', label: 'Session today', description: 'First session in 4h', urgency: 'due', stage: 'paperwork_complete', intakeDateHoursFromNow: 4 },
    { id: 'session_done', label: 'Session completed', description: 'Ready to mark converted', urgency: 'overdue', stage: 'paperwork_complete', intakeDateHoursFromNow: -2 },
  ],
  converted: [
    { id: 'converted', label: 'Converted', description: 'Successfully converted', urgency: 'normal', stage: 'converted' },
  ],
  lost: [
    { id: 'lost', label: 'Lost', description: 'Did not convert', urgency: 'normal', stage: 'lost' },
  ],
};

type DevTestMode = 'single' | 'full';

interface DevTestingPanelProps {
  currentStage: ConsultationStage;
  followUpCount: number;
  stageEnteredAt: string | undefined;
  lastFollowUpDate: string | undefined;
  testMode: DevTestMode;
  onApplyScenario: (scenario: DevScenario) => void;
  onReset: () => void;
  onToggleMode: (mode: DevTestMode) => void;
}

const DevTestingPanel: React.FC<DevTestingPanelProps> = ({
  currentStage,
  followUpCount,
  stageEnteredAt,
  lastFollowUpDate,
  testMode,
  onApplyScenario,
  onReset,
  onToggleMode,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<ConsultationStage>(currentStage);

  // Get scenarios for selected stage
  const scenarios = STAGE_SCENARIOS[selectedStage] || [];

  // Calculate current timing display
  const getTimingDisplay = () => {
    const baseDate = lastFollowUpDate || stageEnteredAt;
    if (!baseDate) return 'Not set';
    const hoursAgo = Math.round((Date.now() - new Date(baseDate).getTime()) / (1000 * 60 * 60));
    if (hoursAgo < 0) return `In ${Math.abs(hoursAgo)}h`;
    if (hoursAgo < 1) return 'Just now';
    if (hoursAgo < 24) return `${hoursAgo}h ago`;
    return `${Math.round(hoursAgo / 24)}d ago`;
  };

  const getUrgencyColor = (urgency: DevScenario['urgency']) => {
    switch (urgency) {
      case 'overdue': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'due': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'upcoming': return 'bg-sky-100 text-sky-700 border-sky-200';
      default: return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-16 right-0 w-96 bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden"
          >
            <div className="px-4 py-3 bg-stone-900 text-white">
              <h4 className="font-bold text-sm">Dev Testing Panel</h4>
              <p className="text-xs text-stone-400 mt-0.5">
                {testMode === 'single' ? 'Test individual scenarios' : 'Full Kanban view'}
              </p>
            </div>

            {/* Mode Toggle */}
            <div className="px-4 py-3 bg-stone-800 border-b border-stone-700">
              <div className="flex gap-2">
                <button
                  onClick={() => onToggleMode('single')}
                  className={`
                    flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all
                    ${testMode === 'single'
                      ? 'bg-amber-500 text-white'
                      : 'bg-stone-700 text-stone-300 hover:bg-stone-600'
                    }
                  `}
                >
                  Single Client
                </button>
                <button
                  onClick={() => onToggleMode('full')}
                  className={`
                    flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all
                    ${testMode === 'full'
                      ? 'bg-amber-500 text-white'
                      : 'bg-stone-700 text-stone-300 hover:bg-stone-600'
                    }
                  `}
                >
                  Full Kanban
                </button>
              </div>
            </div>

            {testMode === 'single' ? (
              <>
                {/* Current State Display */}
                <div className="px-4 py-3 bg-stone-50 border-b border-stone-200">
                  <div className="text-xs text-stone-500 uppercase tracking-wide mb-1">Current State</div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-semibold text-stone-900">{STAGE_LABELS_DEV[currentStage]}</span>
                    <span className="text-stone-400">|</span>
                    <span className="text-stone-600">Follow-ups: {followUpCount}/3</span>
                    <span className="text-stone-400">|</span>
                    <span className="text-stone-600">{getTimingDisplay()}</span>
                  </div>
                </div>

                {/* Stage Selector */}
                <div className="px-4 py-3 border-b border-stone-200">
                  <div className="text-xs text-stone-500 uppercase tracking-wide mb-2">Select Stage</div>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_STAGES.map((stage) => (
                      <button
                        key={stage}
                        onClick={() => setSelectedStage(stage)}
                        className={`
                          px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all
                          ${selectedStage === stage
                            ? 'bg-amber-500 text-white'
                            : currentStage === stage
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                          }
                        `}
                      >
                        {STAGE_LABELS_DEV[stage]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scenarios for Selected Stage */}
                <div className="p-3 max-h-[350px] overflow-y-auto">
                  <div className="text-xs text-stone-500 uppercase tracking-wide mb-2">
                    {STAGE_LABELS_DEV[selectedStage]} Scenarios
                  </div>
                  <div className="space-y-1.5">
                    {scenarios.map((scenario) => (
                      <button
                        key={scenario.id}
                        onClick={() => {
                          onApplyScenario(scenario);
                        }}
                        className={`
                          w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all border
                          ${getUrgencyColor(scenario.urgency)} hover:opacity-80
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{scenario.label}</span>
                          <span className={`text-[10px] uppercase tracking-wide font-bold px-1.5 py-0.5 rounded ${
                            scenario.urgency === 'overdue' ? 'bg-rose-200 text-rose-800' :
                            scenario.urgency === 'due' ? 'bg-amber-200 text-amber-800' :
                            scenario.urgency === 'upcoming' ? 'bg-sky-200 text-sky-800' :
                            'bg-stone-200 text-stone-600'
                          }`}>
                            {scenario.urgency}
                          </span>
                        </div>
                        <p className="text-xs opacity-75 mt-0.5">{scenario.description}</p>
                      </button>
                    ))}
                  </div>

                  {/* Reset Button */}
                  <div className="mt-4 pt-3 border-t border-stone-200">
                    <button
                      onClick={() => {
                        onReset();
                        setSelectedStage('new');
                      }}
                      className="w-full px-3 py-2.5 rounded-xl text-sm font-semibold bg-rose-100 text-rose-700 hover:bg-rose-200 transition-all"
                    >
                      Reset to New Booking
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Full Kanban Mode */
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                    <LayoutGrid size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-stone-900">Full Kanban Active</p>
                    <p className="text-xs text-stone-500">10 clients across all stages</p>
                  </div>
                </div>
                <p className="text-sm text-stone-600 mb-4">
                  Showing one client per stage, spread across all 5 clinicians. Interact with cards normally.
                </p>
                <div className="bg-stone-50 rounded-xl p-3 border border-stone-200">
                  <p className="text-xs text-stone-500 uppercase tracking-wide mb-2">Stages covered</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_STAGES.map((stage) => (
                      <span
                        key={stage}
                        className="px-2 py-1 rounded-md text-xs font-medium bg-stone-200 text-stone-700"
                      >
                        {STAGE_LABELS_DEV[stage]}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl
          transition-all hover:scale-105 active:scale-95
          ${isOpen ? 'bg-stone-900 text-white' : 'bg-amber-500 text-white'}
        `}
      >
        {isOpen ? '×' : '🧪'}
      </button>
    </div>
  );
};

export const Consultations: React.FC = () => {
  const [selectedSegment, setSelectedSegment] = useState<ConsultationSegment>('action_needed');
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [consultations, setConsultations] = useState(MOCK_CONSULTATIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllTime, setShowAllTime] = useState(false);
  const [transferModalConsultation, setTransferModalConsultation] = useState<Consultation | null>(null);
  const [takeActionConsultation, setTakeActionConsultation] = useState<Consultation | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [devTestMode, setDevTestMode] = useState<DevTestMode>('single');

  // Dev testing: Get Emily's current state (only relevant for single client mode)
  const emilyConsultation = consultations.find(c => c.id === 'c1');
  const currentDevStage = emilyConsultation?.stage || 'new';
  const currentDevFollowUpCount = emilyConsultation?.followUpCount || 0;
  const currentDevStageEnteredAt = emilyConsultation?.stageEnteredAt;
  const currentDevLastFollowUpDate = emilyConsultation?.lastFollowUpDate;

  // Handle dev test mode toggle
  const handleDevModeToggle = (mode: DevTestMode) => {
    setDevTestMode(mode);
    if (mode === 'full') {
      // Switch to full Kanban data
      setConsultations(generateFullKanbanData());
    } else {
      // Switch back to single client
      setConsultations(MOCK_CONSULTATIONS);
    }
  };

  // Dev testing: Apply a complete scenario
  const handleDevApplyScenario = (scenario: typeof STAGE_SCENARIOS[ConsultationStage][number]) => {
    const now = Date.now();

    setConsultations(prev => prev.map(c => {
      if (c.id !== 'c1') return c;

      const updates: Partial<Consultation> = {
        stage: scenario.stage,
        updatedAt: new Date().toISOString(),
      };

      // Set follow-up count if specified
      if (scenario.followUpCount !== undefined) {
        updates.followUpCount = scenario.followUpCount;
      } else {
        updates.followUpCount = 0;
      }

      // Set stageEnteredAt if specified
      if (scenario.stageEnteredAtHoursAgo !== undefined) {
        updates.stageEnteredAt = new Date(now - scenario.stageEnteredAtHoursAgo * 60 * 60 * 1000).toISOString();
      } else {
        updates.stageEnteredAt = new Date().toISOString();
      }

      // Set lastFollowUpDate if specified
      if (scenario.lastFollowUpHoursAgo !== undefined) {
        updates.lastFollowUpDate = new Date(now - scenario.lastFollowUpHoursAgo * 60 * 60 * 1000).toISOString();
      } else {
        updates.lastFollowUpDate = undefined;
      }

      // Set consultation datetime if specified
      if (scenario.consultHoursFromNow !== undefined) {
        updates.datetime = new Date(now + scenario.consultHoursFromNow * 60 * 60 * 1000).toISOString();
      }

      // Set intake date if specified (for intake_scheduled, paperwork_pending, paperwork_complete)
      if (scenario.intakeDateHoursFromNow !== undefined) {
        const intakeDate = new Date(now + scenario.intakeDateHoursFromNow * 60 * 60 * 1000).toISOString();
        // For paperwork_complete, this is the first session date
        if (scenario.stage === 'paperwork_complete') {
          updates.firstSessionDate = intakeDate;
        } else {
          updates.intakeScheduledDate = intakeDate;
          updates.intakeHasTime = true;
        }
      }

      // Set createdAt if specified (for new stage)
      if (scenario.createdAtHoursAgo !== undefined) {
        updates.createdAt = new Date(now - scenario.createdAtHoursAgo * 60 * 60 * 1000).toISOString();
      }

      return { ...c, ...updates };
    }));
  };

  // Dev testing: Reset to new
  const handleDevReset = () => {
    const now = new Date();
    const twoDaysFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    setConsultations(prev => prev.map(c => {
      if (c.id !== 'c1') return c;
      return {
        ...c,
        stage: 'new' as ConsultationStage,
        followUpCount: 0,
        stageEnteredAt: undefined,
        lastFollowUpDate: undefined,
        intakeScheduledDate: undefined,
        intakeHasTime: undefined,
        firstSessionDate: undefined,
        datetime: twoDaysFromNow.toISOString(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      };
    }));
  };

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
  const handleAction = (consultationId: string, action: ActionType, metadata?: { lostStage?: LostStage; notes?: string; intakeScheduled?: boolean; intakeDate?: string; intakeHasTime?: boolean }) => {
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
            // Use the selected intake date, or fall back to now if not provided
            const intakeDate = metadata.intakeDate || new Date().toISOString();
            return {
              ...c,
              stage: 'intake_scheduled' as ConsultationStage,
              intakeScheduledDate: intakeDate,
              intakeHasTime: metadata.intakeHasTime ?? false,
              updatedAt: new Date().toISOString()
            };
          }
          return {
            ...c,
            stage: 'intake_pending' as ConsultationStage,
            followUpCount: 0,
            stageEnteredAt: new Date().toISOString(),
            lastFollowUpDate: undefined,
            updatedAt: new Date().toISOString()
          };
        case 'mark_no_show':
          // Enter no-show stage, reset follow-up count, record when stage was entered
          return {
            ...c,
            stage: 'no_show' as ConsultationStage,
            followUpCount: 0,
            stageEnteredAt: new Date().toISOString(),
            lastFollowUpDate: undefined,
            updatedAt: new Date().toISOString()
          };
        case 'report_recovery_sent':
          // Log that a recovery attempt was made
          return {
            ...c,
            followUpCount: c.followUpCount + 1,
            lastFollowUpDate: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        case 'mark_rescheduled':
          // Client rescheduled - move back to confirmed
          return {
            ...c,
            stage: 'confirmed' as ConsultationStage,
            followUpCount: 0,
            stageEnteredAt: undefined,
            lastFollowUpDate: undefined,
            updatedAt: new Date().toISOString()
          };
        case 'report_intake_reminder':
          // Log that a reminder was sent for intake scheduling
          return {
            ...c,
            followUpCount: c.followUpCount + 1,
            lastFollowUpDate: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        case 'mark_intake_scheduled':
          // Intake was scheduled - need to pick date via modal, so this might need metadata
          return {
            ...c,
            stage: 'intake_scheduled' as ConsultationStage,
            followUpCount: 0,
            stageEnteredAt: new Date().toISOString(),
            intakeScheduledDate: metadata?.intakeDate || new Date().toISOString(),
            intakeHasTime: metadata?.intakeHasTime ?? false,
            updatedAt: new Date().toISOString()
          };
        case 'report_paperwork_reminder':
          // Log that a paperwork reminder was sent
          return {
            ...c,
            followUpCount: c.followUpCount + 1,
            lastFollowUpDate: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
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

      {/* Dev Testing Panel */}
      <DevTestingPanel
        currentStage={currentDevStage}
        followUpCount={currentDevFollowUpCount}
        stageEnteredAt={currentDevStageEnteredAt}
        lastFollowUpDate={currentDevLastFollowUpDate}
        testMode={devTestMode}
        onApplyScenario={handleDevApplyScenario}
        onReset={handleDevReset}
        onToggleMode={handleDevModeToggle}
      />
    </div>
  );
};

export default Consultations;
