// =============================================================================
// CONSULTATIONS CRM - TYPE DEFINITIONS
// =============================================================================
// Types for managing the consultation-to-conversion pipeline.
// Syncs with Acuity Scheduling API for automatic data ingestion.
// =============================================================================

// -----------------------------------------------------------------------------
// CONSULTATION STAGES
// -----------------------------------------------------------------------------
// The lifecycle stages a consultation moves through

export type ConsultationStage =
  | 'new'                    // Just booked, needs confirmation email
  | 'confirmed'              // Confirmation sent, awaiting consult (moves to post-consult after consult time passes)
  | 'consult_complete'       // Attended, needs to mark outcome (attended/no-show)
  | 'no_show'                // Didn't attend, needs follow-up recovery sequence
  | 'intake_pending'         // Attended but didn't book intake during consult - need to convince them
  | 'intake_scheduled'       // Intake booked - now focus on paperwork
  | 'paperwork_pending'      // Awaiting paperwork completion
  | 'paperwork_complete'     // Paperwork done, waiting for first session
  | 'converted'              // First session completed - SUCCESS
  | 'lost';                  // Dropped off somewhere in the funnel

// Where the case was lost (for analytics)
export type LostStage =
  | 'pre_consult'            // Never made it to consultation
  | 'pre_intake'             // Never booked intake
  | 'pre_paperwork'          // Booked intake but never finished paperwork
  | 'pre_first_session';     // Completed above but never did first session

// -----------------------------------------------------------------------------
// ACTION TYPES
// -----------------------------------------------------------------------------
// Actions the user can take at each stage

export type ActionType =
  | 'send_confirmation'      // Send consultation confirmation email
  | 'mark_attended'          // Mark that they showed up
  | 'mark_no_show'           // Mark as no-show
  | 'send_post_consult'      // Send post-consultation message
  | 'send_followup_1'        // First follow-up (immediate after no-show)
  | 'send_followup_2'        // Second follow-up (24hr)
  | 'send_followup_3'        // Third follow-up (72hr)
  | 'mark_intake_scheduled'  // Confirm intake was scheduled
  | 'send_paperwork_reminder'// Remind to complete paperwork
  | 'mark_paperwork_complete'// Confirm paperwork is done
  | 'mark_first_session_done'// Confirm first therapy session completed
  | 'mark_lost'              // Mark as lost
  | 'transfer_clinician';    // Transfer to different clinician

// -----------------------------------------------------------------------------
// CLINICIAN
// -----------------------------------------------------------------------------

export interface Clinician {
  id: string;
  name: string;
  calendarId: number;        // Acuity calendar ID
  email?: string;
}

// -----------------------------------------------------------------------------
// CONSULTATION
// -----------------------------------------------------------------------------

export interface Consultation {
  id: string;

  // Client info (from Acuity form)
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;

  // Appointment details
  appointmentId: number;     // Acuity appointment ID
  appointmentTypeId: number; // Acuity appointment type ID
  appointmentTypeName: string;
  datetime: string;          // ISO 8601 format
  duration: number;          // minutes

  // Meeting details
  meetingType?: 'google_meet' | 'zoom' | 'phone';  // Type of consultation meeting
  meetingLink?: string;      // Video call link (for Google Meet/Zoom)
  meetingPhone?: string;     // Phone number to call (for phone consultations)

  // Clinician
  clinicianId: string;
  clinicianName: string;
  calendarId: number;

  // Transfer tracking
  wasTransferred: boolean;
  originalClinicianId?: string;
  originalClinicianName?: string;

  // Stage & status
  stage: ConsultationStage;
  lostStage?: LostStage;
  lostDate?: string;
  lostReason?: string;

  // Action tracking
  pendingAction?: ActionType;
  actionDueDate?: string;    // When the action should be taken

  // Follow-up tracking (for no-shows)
  followUpCount: number;     // 0, 1, 2, or 3
  lastFollowUpDate?: string;

  // Intake & conversion tracking
  intakeScheduledDate?: string;
  paperworkCompletedDate?: string;
  firstSessionDate?: string;
  convertedDate?: string;

  // Form data from Acuity
  formResponses?: FormResponse[];

  // Notes
  notes?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Sync metadata
  acuitySyncedAt?: string;
  ehrSyncedAt?: string;
}

// -----------------------------------------------------------------------------
// FORM RESPONSES
// -----------------------------------------------------------------------------

export interface FormResponse {
  fieldId: number;
  fieldName: string;
  value: string;
}

// -----------------------------------------------------------------------------
// ACTION HISTORY
// -----------------------------------------------------------------------------

export interface ActionHistoryItem {
  id: string;
  consultationId: string;
  action: ActionType;
  performedAt: string;
  performedBy?: string;      // User who performed the action
  notes?: string;
}

// -----------------------------------------------------------------------------
// STAGE CONFIGURATION
// -----------------------------------------------------------------------------
// Defines what action is needed at each stage

export interface StageConfig {
  stage: ConsultationStage;
  label: string;
  description: string;
  color: 'cyan' | 'amber' | 'emerald' | 'rose' | 'stone' | 'indigo';
  pendingAction?: ActionType;
  actionLabel?: string;
  actionActiveLabel?: string; // Present continuous form
}

export const STAGE_CONFIGS: StageConfig[] = [
  {
    stage: 'new',
    label: 'New Booking',
    description: 'Awaiting confirmation',
    color: 'cyan',
    pendingAction: 'send_confirmation',
    actionLabel: 'Send confirmation email',
    actionActiveLabel: 'Sending confirmation email',
  },
  {
    stage: 'confirmed',
    label: 'Confirmed',
    description: 'Awaiting consultation',
    color: 'indigo',
  },
  {
    stage: 'consult_complete',
    label: 'Consult Complete',
    description: 'Needs post-consult message',
    color: 'emerald',
    pendingAction: 'send_post_consult',
    actionLabel: 'Send post-consult message',
    actionActiveLabel: 'Sending post-consult message',
  },
  {
    stage: 'no_show',
    label: 'No-Show',
    description: 'Needs follow-up',
    color: 'rose',
    pendingAction: 'send_followup_1',
    actionLabel: 'Send follow-up',
    actionActiveLabel: 'Sending follow-up',
  },
  {
    stage: 'intake_pending',
    label: 'Intake Pending',
    description: 'Waiting for intake scheduling',
    color: 'amber',
    pendingAction: 'mark_intake_scheduled',
    actionLabel: 'Confirm intake scheduled',
    actionActiveLabel: 'Confirming intake scheduled',
  },
  {
    stage: 'intake_scheduled',
    label: 'Intake Scheduled',
    description: 'Waiting for paperwork',
    color: 'amber',
    pendingAction: 'send_paperwork_reminder',
    actionLabel: 'Send paperwork reminder',
    actionActiveLabel: 'Sending paperwork reminder',
  },
  {
    stage: 'paperwork_pending',
    label: 'Paperwork Pending',
    description: 'Awaiting paperwork completion',
    color: 'amber',
    pendingAction: 'mark_paperwork_complete',
    actionLabel: 'Confirm paperwork complete',
    actionActiveLabel: 'Confirming paperwork complete',
  },
  {
    stage: 'paperwork_complete',
    label: 'Ready',
    description: 'Ready for first session',
    color: 'emerald',
    pendingAction: 'mark_first_session_done',
    actionLabel: 'Confirm first session done',
    actionActiveLabel: 'Confirming first session done',
  },
  {
    stage: 'converted',
    label: 'Converted',
    description: 'Successfully onboarded',
    color: 'emerald',
  },
  {
    stage: 'lost',
    label: 'Lost',
    description: 'Did not convert',
    color: 'stone',
  },
];

// -----------------------------------------------------------------------------
// FILTER SEGMENTS
// -----------------------------------------------------------------------------

export type ConsultationSegment =
  | 'action_needed'  // All consultations needing action
  | 'upcoming'       // Confirmed, consultation hasn't happened yet
  | 'in_progress'    // Post-consultation, working toward conversion
  | 'converted'      // Successfully converted
  | 'lost';          // Lost cases

export interface SegmentConfig {
  id: ConsultationSegment;
  label: string;
  description: string;
  stages: ConsultationStage[];
}

export const SEGMENT_CONFIGS: SegmentConfig[] = [
  {
    id: 'action_needed',
    label: 'Action Needed',
    description: 'Consultations requiring your attention',
    stages: ['new', 'consult_complete', 'no_show', 'intake_pending', 'intake_scheduled', 'paperwork_pending', 'paperwork_complete'],
  },
  {
    id: 'upcoming',
    label: 'Upcoming',
    description: 'Scheduled consultations',
    stages: ['confirmed'],
  },
  {
    id: 'in_progress',
    label: 'In Progress',
    description: 'Post-consultation, pre-conversion',
    stages: ['consult_complete', 'intake_pending', 'intake_scheduled', 'paperwork_pending', 'paperwork_complete'],
  },
  {
    id: 'converted',
    label: 'Converted',
    description: 'Successfully onboarded clients',
    stages: ['converted'],
  },
  {
    id: 'lost',
    label: 'Lost',
    description: 'Cases that did not convert',
    stages: ['lost'],
  },
];

// -----------------------------------------------------------------------------
// HELPER FUNCTIONS
// -----------------------------------------------------------------------------

export function getStageConfig(stage: ConsultationStage): StageConfig {
  return STAGE_CONFIGS.find(s => s.stage === stage) || STAGE_CONFIGS[0];
}

export function getNextAction(consultation: Consultation): ActionType | null {
  const config = getStageConfig(consultation.stage);

  // Special case for no-show follow-ups
  if (consultation.stage === 'no_show') {
    if (consultation.followUpCount === 0) return 'send_followup_1';
    if (consultation.followUpCount === 1) return 'send_followup_2';
    if (consultation.followUpCount === 2) return 'send_followup_3';
    return 'mark_lost'; // After 3 follow-ups
  }

  return config.pendingAction || null;
}

export function getActionLabel(action: ActionType): string {
  const labels: Record<ActionType, string> = {
    send_confirmation: 'Send confirmation email',
    mark_attended: 'Mark as attended',
    mark_no_show: 'Mark as no-show',
    send_post_consult: 'Send post-consult message',
    send_followup_1: 'Send follow-up #1',
    send_followup_2: 'Send follow-up #2 (24hr)',
    send_followup_3: 'Send follow-up #3 (72hr)',
    mark_intake_scheduled: 'Confirm intake scheduled',
    send_paperwork_reminder: 'Send paperwork reminder',
    mark_paperwork_complete: 'Confirm paperwork complete',
    mark_first_session_done: 'Confirm first session done',
    mark_lost: 'Mark as lost',
    transfer_clinician: 'Transfer to another clinician',
  };
  return labels[action];
}

export function formatConsultationDate(datetime: string): string {
  const date = new Date(datetime);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  if (isToday) return `Today, ${timeStr}`;
  if (isTomorrow) return `Tomorrow, ${timeStr}`;

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function getClientInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function isConsultationPast(datetime: string): boolean {
  return new Date(datetime) < new Date();
}

export function isConsultationToday(datetime: string): boolean {
  const date = new Date(datetime);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

export function getDaysSince(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}
