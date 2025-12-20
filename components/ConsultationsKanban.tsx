import React, { useMemo, useState, useRef, useEffect } from 'react';
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
          flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200
          ${selectedClinician
            ? 'bg-stone-800 text-white'
            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }
        `}
      >
        <User size={14} strokeWidth={2} />
        <span className="max-w-[120px] truncate">
          {selectedClinician || 'All Clinicians'}
        </span>
        <ChevronDown
          size={14}
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
            className="absolute top-full left-0 mt-2 z-50 min-w-[200px] max-w-[280px] rounded-xl border border-stone-200 bg-white overflow-hidden"
            style={{
              boxShadow: '0 12px 40px -8px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.03)',
            }}
          >
            <div className="p-1.5">
              {/* All Clinicians option */}
              <button
                onClick={() => {
                  onSelect(null);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors
                  ${!selectedClinician
                    ? 'bg-stone-100 text-stone-900'
                    : 'text-stone-600 hover:bg-stone-50'
                  }
                `}
              >
                <div className={`
                  w-7 h-7 rounded-lg flex items-center justify-center
                  ${!selectedClinician ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-500'}
                `}>
                  <Users size={14} strokeWidth={2} />
                </div>
                <span className="text-sm font-medium">All Clinicians</span>
                {!selectedClinician && (
                  <Check size={14} className="ml-auto text-stone-800" strokeWidth={2.5} />
                )}
              </button>

              {clinicians.length > 0 && (
                <div className="my-1.5 mx-2 h-px bg-stone-100" />
              )}

              {/* Individual clinicians */}
              <div className="max-h-[240px] overflow-y-auto">
                {clinicians.map((clinician) => (
                  <button
                    key={clinician}
                    onClick={() => {
                      onSelect(clinician);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors
                      ${selectedClinician === clinician
                        ? 'bg-stone-100 text-stone-900'
                        : 'text-stone-600 hover:bg-stone-50'
                      }
                    `}
                  >
                    <div className={`
                      w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold
                      ${selectedClinician === clinician
                        ? 'bg-stone-800 text-white'
                        : 'bg-stone-100 text-stone-600'
                      }
                    `}>
                      {clinician.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <span className="text-sm font-medium truncate">{clinician}</span>
                    {selectedClinician === clinician && (
                      <Check size={14} className="ml-auto text-stone-800 flex-shrink-0" strokeWidth={2.5} />
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
// KANBAN CARD COMPONENT
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
  const nextAction = getNextAction(consultation);
  const isPast = isConsultationPast(consultation.datetime);
  const isToday = isConsultationToday(consultation.datetime);

  // Meeting type helpers
  const hasVideoLink = consultation.meetingType === 'google_meet' || consultation.meetingType === 'zoom';
  const isPhoneCall = consultation.meetingType === 'phone';
  const showJoinButton = consultation.stage === 'confirmed' && (isToday || !isPast);

  // Determine if action is needed
  const needsAction = nextAction &&
    consultation.stage !== 'converted' &&
    consultation.stage !== 'lost' &&
    !showJoinButton &&
    (consultation.stage !== 'confirmed' || isPast);

  // Get display date
  const getDisplayDate = () => {
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
    if (needsAction) {
      return 'bg-white border-amber-200 ring-1 ring-amber-100';
    }
    return 'bg-white border-stone-200/80';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`
        group relative rounded-xl border cursor-pointer
        transition-shadow duration-200
        hover:shadow-md hover:shadow-stone-900/5
        ${getCardStyle()}
      `}
      onClick={onClick}
    >
      <div className="p-4">
        {/* Header: Name + Status indicator */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar */}
            <div
              className={`
                w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0
                ${isTerminal && terminalType === 'success'
                  ? 'bg-emerald-100 text-emerald-700'
                  : isTerminal && terminalType === 'neutral'
                    ? 'bg-stone-200 text-stone-500'
                    : consultation.stage === 'no_show'
                      ? 'bg-rose-50 text-rose-600'
                      : 'bg-stone-100 text-stone-600'
                }
              `}
            >
              {getClientInitials(consultation.firstName, consultation.lastName)}
            </div>

            <div className="min-w-0">
              {/* Name */}
              <h4
                className="text-[15px] font-semibold text-stone-900 truncate leading-tight"
                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
              >
                {consultation.firstName} {consultation.lastName}
              </h4>

              {/* Clinician */}
              <p className="text-xs text-stone-500 truncate">
                {consultation.clinicianName}
              </p>
            </div>
          </div>

          {/* Action indicator dot */}
          {needsAction && !isTerminal && (
            <div className="flex-shrink-0 mt-1">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-amber-100" />
            </div>
          )}

          {/* Today indicator */}
          {consultation.stage === 'confirmed' && isToday && !isPast && (
            <div className="flex-shrink-0">
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-emerald-100 text-emerald-700 rounded-full">
                Today
              </span>
            </div>
          )}
        </div>

        {/* Status text */}
        <p className={`text-xs mb-3 ${needsAction ? 'text-amber-700 font-medium' : 'text-stone-500'}`}>
          {getStageLabel(consultation.stage, consultation.followUpCount)}
        </p>

        {/* Date row */}
        <div className="flex items-center gap-4 text-xs text-stone-400 mb-4">
          <div className="flex items-center gap-1.5">
            <Clock size={11} strokeWidth={2} />
            <span>{getDisplayDate()}</span>
          </div>
          {consultation.wasTransferred && (
            <span className="text-amber-600 font-medium">Transferred</span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Join button for video calls */}
          {showJoinButton && hasVideoLink && consultation.meetingLink && (
            <a
              href={consultation.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 transition-colors flex items-center justify-center gap-1.5"
            >
              <Video size={13} strokeWidth={2} />
              Join Call
            </a>
          )}

          {/* Phone number for phone calls */}
          {showJoinButton && isPhoneCall && consultation.meetingPhone && (
            <div className="flex-1 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-stone-100 text-stone-600 text-xs">
              <Phone size={11} strokeWidth={2} />
              <span className="font-medium truncate">{consultation.meetingPhone}</span>
            </div>
          )}

          {/* Take Action button */}
          {needsAction && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTakeAction();
              }}
              className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-amber-500/20"
            >
              Take Action
              <ChevronRight size={12} strokeWidth={2.5} />
            </button>
          )}

          {/* View details for terminal states */}
          {isTerminal && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
              className="flex-1 px-3 py-2 rounded-lg text-xs font-medium bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-600 transition-colors flex items-center justify-center gap-1.5"
            >
              View Details
              <ChevronRight size={11} strokeWidth={2} />
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
        flex flex-col h-full min-w-[290px] w-[290px] rounded-2xl border overflow-hidden
        ${getColumnStyle()}
      `}
      style={{
        boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.06)',
      }}
    >
      {/* Column Header - Boxed and distinct */}
      <div className={`
        flex items-center justify-between px-4 py-3.5 border-b
        ${getHeaderStyle()}
      `}>
        <div className="flex items-center gap-3">
          <div className={`
            w-8 h-8 rounded-lg flex items-center justify-center
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
                text-[15px] font-semibold tracking-tight leading-tight
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
              <p className="text-[11px] text-amber-700 font-medium mt-0.5">
                {actionNeededCount} need{actionNeededCount === 1 ? 's' : ''} action
              </p>
            )}
          </div>
        </div>

        {/* Count badge */}
        <div className={`
          min-w-[28px] h-7 px-2 rounded-lg flex items-center justify-center text-sm font-bold tabular-nums
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
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <AnimatePresence mode="popLayout">
          {consultations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center mb-3
                ${column.isTerminal && column.terminalType === 'success'
                  ? 'bg-emerald-100 text-emerald-400'
                  : column.isTerminal
                    ? 'bg-stone-200 text-stone-400'
                    : 'bg-stone-100 text-stone-300'
                }
              `}>
                {column.icon}
              </div>
              <p className="text-xs text-stone-400 font-medium">No clients</p>
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
          // Sort by action needed first, then by date
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
      <div className="px-5 py-4 border-b border-stone-200/80 bg-white/90 backdrop-blur-sm flex-shrink-0 relative z-50">
        <div className="flex items-center gap-4">
          {/* Title */}
          <h2
            className="text-lg font-semibold text-stone-900 tracking-tight"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
          >
            Pipeline
          </h2>

          {/* Filter Toggle */}
          <div className="flex items-center p-1 bg-stone-100 rounded-xl">
            <button
              onClick={() => setFilterMode('all')}
              className={`
                flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                ${filterMode === 'all'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
                }
              `}
            >
              <span>All</span>
              <span className={`
                min-w-[20px] h-5 px-1.5 rounded-md text-xs font-bold tabular-nums flex items-center justify-center
                ${filterMode === 'all' ? 'bg-stone-100 text-stone-600' : 'bg-stone-200/60 text-stone-500'}
              `}>
                {counts.all}
              </span>
            </button>

            <button
              onClick={() => setFilterMode('needs_action')}
              className={`
                flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                ${filterMode === 'needs_action'
                  ? 'bg-white text-amber-700 shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
                }
              `}
            >
              <Zap size={13} strokeWidth={2.5} className={filterMode === 'needs_action' ? 'text-amber-500' : ''} />
              <span>Need Action</span>
              {counts.needsAction > 0 && (
                <span className={`
                  min-w-[20px] h-5 px-1.5 rounded-md text-xs font-bold tabular-nums flex items-center justify-center
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
          <div className="w-px h-6 bg-stone-200" />

          {/* Clinician Filter */}
          <ClinicianDropdown
            clinicians={clinicians}
            selectedClinician={selectedClinician}
            onSelect={setSelectedClinician}
          />
        </div>

        {/* Active filter indicator */}
        {(selectedClinician || filterMode === 'needs_action') && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-stone-100">
            <span className="text-xs text-stone-400">Showing:</span>
            <div className="flex items-center gap-2">
              {filterMode === 'needs_action' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-medium">
                  <Zap size={11} strokeWidth={2.5} />
                  Needs action
                  <button
                    onClick={() => setFilterMode('all')}
                    className="ml-1 hover:bg-amber-100 rounded p-0.5 transition-colors"
                  >
                    <X size={11} strokeWidth={2.5} />
                  </button>
                </span>
              )}
              {selectedClinician && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 text-xs font-medium">
                  <User size={11} strokeWidth={2} />
                  {selectedClinician}
                  <button
                    onClick={() => setSelectedClinician(null)}
                    className="ml-1 hover:bg-stone-200 rounded p-0.5 transition-colors"
                  >
                    <X size={11} strokeWidth={2.5} />
                  </button>
                </span>
              )}
            </div>
            <button
              onClick={() => {
                setFilterMode('all');
                setSelectedClinician(null);
              }}
              className="ml-auto text-xs text-stone-400 hover:text-stone-600 transition-colors"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Kanban Columns */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden relative z-0">
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
