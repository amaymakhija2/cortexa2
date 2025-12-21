// =============================================================================
// CONSULTATIONS MOCK DATA
// =============================================================================
// Mock data for the Consultations CRM module.
// This will be replaced with real Acuity API data in production.
// =============================================================================

import type { Consultation, Clinician } from '../types/consultations';
import { CLINICIANS } from './clinicians';

// -----------------------------------------------------------------------------
// CLINICIANS FOR CONSULTATIONS
// -----------------------------------------------------------------------------
// Maps the standard app clinicians to the Clinician type used by consultations.
// Includes placeholder calendarId for future Acuity integration.
// -----------------------------------------------------------------------------

export const CONSULTATION_CLINICIANS: Clinician[] = CLINICIANS.map(c => ({
  id: c.id,
  name: c.name,
  calendarId: parseInt(c.id) * 1000000, // Placeholder calendar ID
}));

// Helper to get a random clinician
const getRandomClinician = () => CONSULTATION_CLINICIANS[Math.floor(Math.random() * CONSULTATION_CLINICIANS.length)];

// Helper to generate dates
const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const addHours = (date: Date, hours: number): Date => {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
};

const setTime = (date: Date, hours: number, minutes: number): Date => {
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
};

// -----------------------------------------------------------------------------
// MOCK CONSULTATIONS
// -----------------------------------------------------------------------------
// Single client for tracking the full flow from start to finish

export const MOCK_CONSULTATIONS: Consultation[] = [
  // =================================
  // CONFIRMED - Confirmation sent, awaiting consultation
  // =================================
  {
    id: 'c1',
    firstName: 'Emily',
    lastName: 'Thompson',
    email: 'emily.thompson@email.com',
    phone: '(212) 555-0101',
    appointmentId: 1001,
    appointmentTypeId: 1001,
    appointmentTypeName: 'New Client Consultation with Sarah Chen',
    datetime: setTime(addDays(today, 2), 10, 0).toISOString(),
    duration: 15,
    meetingType: 'google_meet',
    meetingLink: 'https://meet.google.com/xyz-abcd-efg',
    clinicianId: '1',
    clinicianName: 'Sarah Chen',
    calendarId: 1000000,
    wasTransferred: false,
    stage: 'new', // TESTING: Change this to test different stages: 'new' | 'confirmed' | 'consult_complete' | 'no_show' | 'intake_pending' | 'intake_scheduled' | 'paperwork_pending' | 'paperwork_complete' | 'converted' | 'lost'
    followUpCount: 0,
    formResponses: [
      { fieldId: 1, fieldName: 'Reason for seeking therapy', value: 'Anxiety and work stress' },
      { fieldId: 2, fieldName: 'Insurance', value: 'Aetna' },
      { fieldId: 3, fieldName: 'State', value: 'New York' },
    ],
    createdAt: addHours(now, -26).toISOString(),
    updatedAt: addHours(now, -2).toISOString(),
  },
];

// -----------------------------------------------------------------------------
// HELPER FUNCTIONS
// -----------------------------------------------------------------------------

export function getConsultationsBySegment(segment: string): Consultation[] {
  switch (segment) {
    case 'action_needed':
      return MOCK_CONSULTATIONS.filter(c =>
        ['new', 'consult_complete', 'no_show', 'intake_pending', 'intake_scheduled', 'paperwork_pending', 'paperwork_complete'].includes(c.stage)
      );
    case 'upcoming':
      return MOCK_CONSULTATIONS.filter(c => c.stage === 'confirmed');
    case 'in_progress':
      return MOCK_CONSULTATIONS.filter(c =>
        ['consult_complete', 'intake_pending', 'intake_scheduled', 'paperwork_pending', 'paperwork_complete'].includes(c.stage)
      );
    case 'converted':
      return MOCK_CONSULTATIONS.filter(c => c.stage === 'converted');
    case 'lost':
      return MOCK_CONSULTATIONS.filter(c => c.stage === 'lost');
    default:
      return MOCK_CONSULTATIONS;
  }
}

export function getConsultationsByStage(stage: string): Consultation[] {
  return MOCK_CONSULTATIONS.filter(c => c.stage === stage);
}

export function getUpcomingConsultations(): Consultation[] {
  const now = new Date();
  return MOCK_CONSULTATIONS
    .filter(c => new Date(c.datetime) > now && c.stage === 'confirmed')
    .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
}

export function getTodaysConsultations(): Consultation[] {
  const today = new Date();
  return MOCK_CONSULTATIONS
    .filter(c => {
      const consultDate = new Date(c.datetime);
      return consultDate.toDateString() === today.toDateString() && c.stage === 'confirmed';
    })
    .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
}

export function getActionNeededCount(): number {
  return MOCK_CONSULTATIONS.filter(c =>
    ['new', 'consult_complete', 'no_show', 'intake_pending', 'intake_scheduled', 'paperwork_pending', 'paperwork_complete'].includes(c.stage)
  ).length;
}
