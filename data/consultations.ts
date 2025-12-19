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

export const MOCK_CONSULTATIONS: Consultation[] = [
  // =================================
  // NEW - Needs confirmation email
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
    clinicianId: '1',
    clinicianName: 'Sarah Chen',
    calendarId: 1000000,
    wasTransferred: false,
    stage: 'new',
    followUpCount: 0,
    formResponses: [
      { fieldId: 1, fieldName: 'Reason for seeking therapy', value: 'Anxiety and work stress' },
      { fieldId: 2, fieldName: 'Insurance', value: 'Aetna' },
      { fieldId: 3, fieldName: 'State', value: 'New York' },
    ],
    createdAt: addHours(now, -2).toISOString(),
    updatedAt: addHours(now, -2).toISOString(),
  },
  {
    id: 'c2',
    firstName: 'David',
    lastName: 'Martinez',
    email: 'david.m@email.com',
    phone: '(718) 555-0202',
    appointmentId: 1002,
    appointmentTypeId: 1002,
    appointmentTypeName: 'New Client Consultation with Maria Rodriguez',
    datetime: setTime(addDays(today, 3), 14, 30).toISOString(),
    duration: 15,
    clinicianId: '2',
    clinicianName: 'Maria Rodriguez',
    calendarId: 2000000,
    wasTransferred: false,
    stage: 'new',
    followUpCount: 0,
    formResponses: [
      { fieldId: 1, fieldName: 'Reason for seeking therapy', value: 'Relationship issues' },
      { fieldId: 2, fieldName: 'Insurance', value: 'United Healthcare' },
    ],
    createdAt: addHours(now, -1).toISOString(),
    updatedAt: addHours(now, -1).toISOString(),
  },

  // =================================
  // CONFIRMED - Awaiting consultation
  // =================================
  {
    id: 'c3',
    firstName: 'Jessica',
    lastName: 'Williams',
    email: 'jessica.w@email.com',
    phone: '(917) 555-0303',
    appointmentId: 1003,
    appointmentTypeId: 1003,
    appointmentTypeName: 'New Client Consultation with Priya Patel',
    datetime: setTime(today, 11, 0).toISOString(), // Today
    duration: 15,
    clinicianId: '3',
    clinicianName: 'Priya Patel',
    calendarId: 3000000,
    wasTransferred: false,
    stage: 'confirmed',
    followUpCount: 0,
    formResponses: [
      { fieldId: 1, fieldName: 'Reason for seeking therapy', value: 'Depression and isolation' },
      { fieldId: 2, fieldName: 'Insurance', value: 'Cigna' },
    ],
    createdAt: addDays(today, -3).toISOString(),
    updatedAt: addDays(today, -2).toISOString(),
  },
  {
    id: 'c4',
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'michael.b@email.com',
    phone: '(646) 555-0404',
    appointmentId: 1004,
    appointmentTypeId: 1004,
    appointmentTypeName: 'New Client Consultation with James Kim',
    datetime: setTime(today, 15, 0).toISOString(), // Today
    duration: 15,
    clinicianId: '4',
    clinicianName: 'James Kim',
    calendarId: 4000000,
    wasTransferred: false,
    stage: 'confirmed',
    followUpCount: 0,
    createdAt: addDays(today, -2).toISOString(),
    updatedAt: addDays(today, -1).toISOString(),
  },
  {
    id: 'c5',
    firstName: 'Amanda',
    lastName: 'Davis',
    email: 'amanda.d@email.com',
    phone: '(929) 555-0505',
    appointmentId: 1005,
    appointmentTypeId: 1005,
    appointmentTypeName: 'New Client Consultation with Michael Johnson',
    datetime: setTime(addDays(today, 1), 9, 30).toISOString(), // Tomorrow
    duration: 15,
    clinicianId: '5',
    clinicianName: 'Michael Johnson',
    calendarId: 5000000,
    wasTransferred: false,
    stage: 'confirmed',
    followUpCount: 0,
    createdAt: addDays(today, -4).toISOString(),
    updatedAt: addDays(today, -3).toISOString(),
  },

  // =================================
  // CONSULT COMPLETE - Needs post-consult message
  // =================================
  {
    id: 'c6',
    firstName: 'Robert',
    lastName: 'Wilson',
    email: 'robert.w@email.com',
    phone: '(347) 555-0606',
    appointmentId: 1006,
    appointmentTypeId: 1001,
    appointmentTypeName: 'New Client Consultation with Sarah Chen',
    datetime: setTime(addDays(today, -1), 14, 0).toISOString(), // Yesterday
    duration: 15,
    clinicianId: '1',
    clinicianName: 'Sarah Chen',
    calendarId: 1000000,
    wasTransferred: false,
    stage: 'consult_complete',
    followUpCount: 0,
    formResponses: [
      { fieldId: 1, fieldName: 'Reason for seeking therapy', value: 'Career transitions and identity' },
    ],
    createdAt: addDays(today, -5).toISOString(),
    updatedAt: addDays(today, -1).toISOString(),
  },
  {
    id: 'c7',
    firstName: 'Jennifer',
    lastName: 'Garcia',
    email: 'jennifer.g@email.com',
    phone: '(516) 555-0707',
    appointmentId: 1007,
    appointmentTypeId: 1002,
    appointmentTypeName: 'New Client Consultation with Maria Rodriguez',
    datetime: setTime(addDays(today, -1), 10, 30).toISOString(), // Yesterday
    duration: 15,
    clinicianId: '2',
    clinicianName: 'Maria Rodriguez',
    calendarId: 2000000,
    wasTransferred: false,
    stage: 'consult_complete',
    followUpCount: 0,
    createdAt: addDays(today, -6).toISOString(),
    updatedAt: addDays(today, -1).toISOString(),
  },

  // =================================
  // NO-SHOW - Needs follow-up
  // =================================
  {
    id: 'c8',
    firstName: 'Christopher',
    lastName: 'Lee',
    email: 'chris.lee@email.com',
    phone: '(631) 555-0808',
    appointmentId: 1008,
    appointmentTypeId: 1003,
    appointmentTypeName: 'New Client Consultation with Priya Patel',
    datetime: setTime(addDays(today, -1), 16, 0).toISOString(), // Yesterday
    duration: 15,
    clinicianId: '3',
    clinicianName: 'Priya Patel',
    calendarId: 3000000,
    wasTransferred: false,
    stage: 'no_show',
    followUpCount: 0, // Immediate follow-up needed
    createdAt: addDays(today, -4).toISOString(),
    updatedAt: addDays(today, -1).toISOString(),
  },
  {
    id: 'c9',
    firstName: 'Sarah',
    lastName: 'Anderson',
    email: 'sarah.a@email.com',
    phone: '(908) 555-0909',
    appointmentId: 1009,
    appointmentTypeId: 1004,
    appointmentTypeName: 'New Client Consultation with James Kim',
    datetime: setTime(addDays(today, -2), 11, 0).toISOString(), // 2 days ago
    duration: 15,
    clinicianId: '4',
    clinicianName: 'James Kim',
    calendarId: 4000000,
    wasTransferred: false,
    stage: 'no_show',
    followUpCount: 1, // 24hr follow-up needed
    lastFollowUpDate: addDays(today, -2).toISOString(),
    createdAt: addDays(today, -7).toISOString(),
    updatedAt: addDays(today, -2).toISOString(),
  },

  // =================================
  // INTAKE PENDING - Waiting for scheduling
  // =================================
  {
    id: 'c10',
    firstName: 'Daniel',
    lastName: 'Taylor',
    email: 'daniel.t@email.com',
    phone: '(732) 555-1010',
    appointmentId: 1010,
    appointmentTypeId: 1005,
    appointmentTypeName: 'New Client Consultation with Michael Johnson',
    datetime: setTime(addDays(today, -3), 13, 0).toISOString(),
    duration: 15,
    clinicianId: '5',
    clinicianName: 'Michael Johnson',
    calendarId: 5000000,
    wasTransferred: false,
    stage: 'intake_pending',
    followUpCount: 0,
    createdAt: addDays(today, -10).toISOString(),
    updatedAt: addDays(today, -3).toISOString(),
  },
  {
    id: 'c11',
    firstName: 'Lisa',
    lastName: 'Moore',
    email: 'lisa.m@email.com',
    phone: '(973) 555-1111',
    appointmentId: 1011,
    appointmentTypeId: 1001,
    appointmentTypeName: 'New Client Consultation with Sarah Chen',
    datetime: setTime(addDays(today, -4), 9, 0).toISOString(),
    duration: 15,
    clinicianId: '1',
    clinicianName: 'Sarah Chen',
    calendarId: 1000000,
    wasTransferred: false,
    stage: 'intake_pending',
    followUpCount: 0,
    createdAt: addDays(today, -12).toISOString(),
    updatedAt: addDays(today, -4).toISOString(),
  },

  // =================================
  // INTAKE SCHEDULED - Waiting for paperwork
  // =================================
  {
    id: 'c12',
    firstName: 'Kevin',
    lastName: 'White',
    email: 'kevin.w@email.com',
    phone: '(201) 555-1212',
    appointmentId: 1012,
    appointmentTypeId: 1002,
    appointmentTypeName: 'New Client Consultation with Maria Rodriguez',
    datetime: setTime(addDays(today, -7), 15, 30).toISOString(),
    duration: 15,
    clinicianId: '2',
    clinicianName: 'Maria Rodriguez',
    calendarId: 2000000,
    wasTransferred: false,
    stage: 'intake_scheduled',
    followUpCount: 0,
    intakeScheduledDate: setTime(addDays(today, 3), 10, 0).toISOString(), // 3 days from now
    createdAt: addDays(today, -14).toISOString(),
    updatedAt: addDays(today, -5).toISOString(),
  },

  // =================================
  // PAPERWORK PENDING
  // =================================
  {
    id: 'c13',
    firstName: 'Michelle',
    lastName: 'Harris',
    email: 'michelle.h@email.com',
    phone: '(862) 555-1313',
    appointmentId: 1013,
    appointmentTypeId: 1003,
    appointmentTypeName: 'New Client Consultation with Priya Patel',
    datetime: setTime(addDays(today, -10), 11, 0).toISOString(),
    duration: 15,
    clinicianId: '3',
    clinicianName: 'Priya Patel',
    calendarId: 3000000,
    wasTransferred: false,
    stage: 'paperwork_pending',
    followUpCount: 0,
    intakeScheduledDate: setTime(addDays(today, 1), 14, 0).toISOString(), // Tomorrow
    createdAt: addDays(today, -18).toISOString(),
    updatedAt: addDays(today, -3).toISOString(),
  },

  // =================================
  // READY FOR SESSION
  // =================================
  {
    id: 'c14',
    firstName: 'Brian',
    lastName: 'Clark',
    email: 'brian.c@email.com',
    phone: '(609) 555-1414',
    appointmentId: 1014,
    appointmentTypeId: 1004,
    appointmentTypeName: 'New Client Consultation with James Kim',
    datetime: setTime(addDays(today, -14), 10, 0).toISOString(),
    duration: 15,
    clinicianId: '4',
    clinicianName: 'James Kim',
    calendarId: 4000000,
    wasTransferred: false,
    stage: 'ready_for_session',
    followUpCount: 0,
    intakeScheduledDate: setTime(addDays(today, -5), 10, 0).toISOString(),
    paperworkCompletedDate: addDays(today, -6).toISOString(),
    firstSessionDate: setTime(addDays(today, 2), 10, 0).toISOString(), // 2 days from now
    createdAt: addDays(today, -21).toISOString(),
    updatedAt: addDays(today, -2).toISOString(),
  },

  // =================================
  // CONVERTED - Success cases (Recent - December 2025)
  // =================================
  {
    id: 'c15',
    firstName: 'Rachel',
    lastName: 'Lewis',
    email: 'rachel.l@email.com',
    phone: '(551) 555-1515',
    appointmentId: 1015,
    appointmentTypeId: 1005,
    appointmentTypeName: 'New Client Consultation with Michael Johnson',
    datetime: setTime(addDays(today, -21), 14, 0).toISOString(),
    duration: 15,
    clinicianId: '5',
    clinicianName: 'Michael Johnson',
    calendarId: 5000000,
    wasTransferred: false,
    stage: 'converted',
    followUpCount: 0,
    intakeScheduledDate: setTime(addDays(today, -14), 11, 0).toISOString(),
    paperworkCompletedDate: addDays(today, -15).toISOString(),
    firstSessionDate: setTime(addDays(today, -7), 11, 0).toISOString(),
    convertedDate: addDays(today, -7).toISOString(),
    createdAt: addDays(today, -28).toISOString(),
    updatedAt: addDays(today, -7).toISOString(),
  },
  {
    id: 'c16',
    firstName: 'Steven',
    lastName: 'Walker',
    email: 'steven.w@email.com',
    phone: '(848) 555-1616',
    appointmentId: 1016,
    appointmentTypeId: 1001,
    appointmentTypeName: 'New Client Consultation with Sarah Chen',
    datetime: setTime(addDays(today, -18), 10, 30).toISOString(),
    duration: 15,
    clinicianId: '1',
    clinicianName: 'Sarah Chen',
    calendarId: 1000000,
    wasTransferred: false,
    stage: 'converted',
    followUpCount: 0,
    intakeScheduledDate: setTime(addDays(today, -12), 15, 0).toISOString(),
    paperworkCompletedDate: addDays(today, -13).toISOString(),
    firstSessionDate: setTime(addDays(today, -5), 15, 0).toISOString(),
    convertedDate: addDays(today, -5).toISOString(),
    createdAt: addDays(today, -25).toISOString(),
    updatedAt: addDays(today, -5).toISOString(),
  },
  {
    id: 'c20',
    firstName: 'Angela',
    lastName: 'Hall',
    email: 'angela.h@email.com',
    phone: '(212) 555-2020',
    appointmentId: 1020,
    appointmentTypeId: 1002,
    appointmentTypeName: 'New Client Consultation with Maria Rodriguez',
    datetime: setTime(addDays(today, -14), 9, 0).toISOString(),
    duration: 15,
    clinicianId: '2',
    clinicianName: 'Maria Rodriguez',
    calendarId: 2000000,
    wasTransferred: false,
    stage: 'converted',
    followUpCount: 0,
    convertedDate: addDays(today, -3).toISOString(),
    createdAt: addDays(today, -21).toISOString(),
    updatedAt: addDays(today, -3).toISOString(),
  },

  // =================================
  // CONVERTED - November 2025
  // =================================
  {
    id: 'c21',
    firstName: 'Mark',
    lastName: 'Young',
    email: 'mark.y@email.com',
    phone: '(718) 555-2121',
    appointmentId: 1021,
    appointmentTypeId: 1003,
    appointmentTypeName: 'New Client Consultation with Priya Patel',
    datetime: setTime(addDays(today, -35), 11, 0).toISOString(),
    duration: 15,
    clinicianId: '3',
    clinicianName: 'Priya Patel',
    calendarId: 3000000,
    wasTransferred: false,
    stage: 'converted',
    followUpCount: 0,
    convertedDate: addDays(today, -28).toISOString(),
    createdAt: addDays(today, -42).toISOString(),
    updatedAt: addDays(today, -28).toISOString(),
  },
  {
    id: 'c22',
    firstName: 'Laura',
    lastName: 'Allen',
    email: 'laura.a@email.com',
    phone: '(917) 555-2222',
    appointmentId: 1022,
    appointmentTypeId: 1004,
    appointmentTypeName: 'New Client Consultation with James Kim',
    datetime: setTime(addDays(today, -40), 14, 30).toISOString(),
    duration: 15,
    clinicianId: '4',
    clinicianName: 'James Kim',
    calendarId: 4000000,
    wasTransferred: false,
    stage: 'converted',
    followUpCount: 0,
    convertedDate: addDays(today, -32).toISOString(),
    createdAt: addDays(today, -47).toISOString(),
    updatedAt: addDays(today, -32).toISOString(),
  },
  {
    id: 'c23',
    firstName: 'Jason',
    lastName: 'King',
    email: 'jason.k@email.com',
    phone: '(646) 555-2323',
    appointmentId: 1023,
    appointmentTypeId: 1005,
    appointmentTypeName: 'New Client Consultation with Michael Johnson',
    datetime: setTime(addDays(today, -45), 10, 0).toISOString(),
    duration: 15,
    clinicianId: '5',
    clinicianName: 'Michael Johnson',
    calendarId: 5000000,
    wasTransferred: false,
    stage: 'converted',
    followUpCount: 0,
    convertedDate: addDays(today, -38).toISOString(),
    createdAt: addDays(today, -52).toISOString(),
    updatedAt: addDays(today, -38).toISOString(),
  },
  {
    id: 'c24',
    firstName: 'Nicole',
    lastName: 'Wright',
    email: 'nicole.w@email.com',
    phone: '(929) 555-2424',
    appointmentId: 1024,
    appointmentTypeId: 1001,
    appointmentTypeName: 'New Client Consultation with Sarah Chen',
    datetime: setTime(addDays(today, -50), 15, 0).toISOString(),
    duration: 15,
    clinicianId: '1',
    clinicianName: 'Sarah Chen',
    calendarId: 1000000,
    wasTransferred: false,
    stage: 'converted',
    followUpCount: 0,
    convertedDate: addDays(today, -42).toISOString(),
    createdAt: addDays(today, -57).toISOString(),
    updatedAt: addDays(today, -42).toISOString(),
  },

  // =================================
  // CONVERTED - October 2025
  // =================================
  {
    id: 'c25',
    firstName: 'Eric',
    lastName: 'Scott',
    email: 'eric.s@email.com',
    phone: '(347) 555-2525',
    appointmentId: 1025,
    appointmentTypeId: 1002,
    appointmentTypeName: 'New Client Consultation with Maria Rodriguez',
    datetime: setTime(addDays(today, -65), 9, 30).toISOString(),
    duration: 15,
    clinicianId: '2',
    clinicianName: 'Maria Rodriguez',
    calendarId: 2000000,
    wasTransferred: false,
    stage: 'converted',
    followUpCount: 0,
    convertedDate: addDays(today, -58).toISOString(),
    createdAt: addDays(today, -72).toISOString(),
    updatedAt: addDays(today, -58).toISOString(),
  },
  {
    id: 'c26',
    firstName: 'Stephanie',
    lastName: 'Green',
    email: 'stephanie.g@email.com',
    phone: '(516) 555-2626',
    appointmentId: 1026,
    appointmentTypeId: 1003,
    appointmentTypeName: 'New Client Consultation with Priya Patel',
    datetime: setTime(addDays(today, -70), 11, 0).toISOString(),
    duration: 15,
    clinicianId: '3',
    clinicianName: 'Priya Patel',
    calendarId: 3000000,
    wasTransferred: false,
    stage: 'converted',
    followUpCount: 0,
    convertedDate: addDays(today, -63).toISOString(),
    createdAt: addDays(today, -77).toISOString(),
    updatedAt: addDays(today, -63).toISOString(),
  },
  {
    id: 'c27',
    firstName: 'Andrew',
    lastName: 'Adams',
    email: 'andrew.a@email.com',
    phone: '(631) 555-2727',
    appointmentId: 1027,
    appointmentTypeId: 1004,
    appointmentTypeName: 'New Client Consultation with James Kim',
    datetime: setTime(addDays(today, -75), 14, 0).toISOString(),
    duration: 15,
    clinicianId: '4',
    clinicianName: 'James Kim',
    calendarId: 4000000,
    wasTransferred: false,
    stage: 'converted',
    followUpCount: 0,
    convertedDate: addDays(today, -68).toISOString(),
    createdAt: addDays(today, -82).toISOString(),
    updatedAt: addDays(today, -68).toISOString(),
  },

  // =================================
  // CONVERTED - September 2025 (older, outside 90 days)
  // =================================
  {
    id: 'c28',
    firstName: 'Melissa',
    lastName: 'Baker',
    email: 'melissa.b@email.com',
    phone: '(908) 555-2828',
    appointmentId: 1028,
    appointmentTypeId: 1005,
    appointmentTypeName: 'New Client Consultation with Michael Johnson',
    datetime: setTime(addDays(today, -100), 10, 0).toISOString(),
    duration: 15,
    clinicianId: '5',
    clinicianName: 'Michael Johnson',
    calendarId: 5000000,
    wasTransferred: false,
    stage: 'converted',
    followUpCount: 0,
    convertedDate: addDays(today, -93).toISOString(),
    createdAt: addDays(today, -107).toISOString(),
    updatedAt: addDays(today, -93).toISOString(),
  },
  {
    id: 'c29',
    firstName: 'Ryan',
    lastName: 'Nelson',
    email: 'ryan.n@email.com',
    phone: '(732) 555-2929',
    appointmentId: 1029,
    appointmentTypeId: 1001,
    appointmentTypeName: 'New Client Consultation with Sarah Chen',
    datetime: setTime(addDays(today, -110), 13, 0).toISOString(),
    duration: 15,
    clinicianId: '1',
    clinicianName: 'Sarah Chen',
    calendarId: 1000000,
    wasTransferred: false,
    stage: 'converted',
    followUpCount: 0,
    convertedDate: addDays(today, -103).toISOString(),
    createdAt: addDays(today, -117).toISOString(),
    updatedAt: addDays(today, -103).toISOString(),
  },

  // =================================
  // LOST - Did not convert (Recent - December 2025)
  // =================================
  {
    id: 'c17',
    firstName: 'Timothy',
    lastName: 'Carter',
    email: 'timothy.c@email.com',
    phone: '(732) 555-1717',
    appointmentId: 1017,
    appointmentTypeId: 1002,
    appointmentTypeName: 'New Client Consultation with Maria Rodriguez',
    datetime: setTime(addDays(today, -25), 13, 0).toISOString(),
    duration: 15,
    clinicianId: '2',
    clinicianName: 'Maria Rodriguez',
    calendarId: 2000000,
    wasTransferred: false,
    stage: 'lost',
    lostStage: 'pre_consult',
    lostDate: addDays(today, -22).toISOString(),
    lostReason: 'No response after 3 follow-ups',
    followUpCount: 3,
    createdAt: addDays(today, -30).toISOString(),
    updatedAt: addDays(today, -22).toISOString(),
  },
  {
    id: 'c18',
    firstName: 'Christina',
    lastName: 'Mitchell',
    email: 'christina.m@email.com',
    phone: '(201) 555-1818',
    appointmentId: 1018,
    appointmentTypeId: 1003,
    appointmentTypeName: 'New Client Consultation with Priya Patel',
    datetime: setTime(addDays(today, -20), 9, 0).toISOString(),
    duration: 15,
    clinicianId: '3',
    clinicianName: 'Priya Patel',
    calendarId: 3000000,
    wasTransferred: false,
    stage: 'lost',
    lostStage: 'pre_intake',
    lostDate: addDays(today, -13).toISOString(),
    lostReason: 'Client decided to go with another practice',
    followUpCount: 0,
    createdAt: addDays(today, -27).toISOString(),
    updatedAt: addDays(today, -13).toISOString(),
  },

  // =================================
  // LOST - November 2025
  // =================================
  {
    id: 'c30',
    firstName: 'Patrick',
    lastName: 'Roberts',
    email: 'patrick.r@email.com',
    phone: '(973) 555-3030',
    appointmentId: 1030,
    appointmentTypeId: 1004,
    appointmentTypeName: 'New Client Consultation with James Kim',
    datetime: setTime(addDays(today, -45), 10, 30).toISOString(),
    duration: 15,
    clinicianId: '4',
    clinicianName: 'James Kim',
    calendarId: 4000000,
    wasTransferred: false,
    stage: 'lost',
    lostStage: 'pre_paperwork',
    lostDate: addDays(today, -35).toISOString(),
    lostReason: 'Insurance not accepted',
    followUpCount: 0,
    createdAt: addDays(today, -52).toISOString(),
    updatedAt: addDays(today, -35).toISOString(),
  },
  {
    id: 'c31',
    firstName: 'Samantha',
    lastName: 'Turner',
    email: 'samantha.t@email.com',
    phone: '(201) 555-3131',
    appointmentId: 1031,
    appointmentTypeId: 1005,
    appointmentTypeName: 'New Client Consultation with Michael Johnson',
    datetime: setTime(addDays(today, -50), 14, 0).toISOString(),
    duration: 15,
    clinicianId: '5',
    clinicianName: 'Michael Johnson',
    calendarId: 5000000,
    wasTransferred: false,
    stage: 'lost',
    lostStage: 'pre_first_session',
    lostDate: addDays(today, -40).toISOString(),
    lostReason: 'Scheduling conflicts',
    followUpCount: 0,
    createdAt: addDays(today, -57).toISOString(),
    updatedAt: addDays(today, -40).toISOString(),
  },

  // =================================
  // LOST - October 2025
  // =================================
  {
    id: 'c32',
    firstName: 'Gregory',
    lastName: 'Phillips',
    email: 'gregory.p@email.com',
    phone: '(862) 555-3232',
    appointmentId: 1032,
    appointmentTypeId: 1001,
    appointmentTypeName: 'New Client Consultation with Sarah Chen',
    datetime: setTime(addDays(today, -70), 11, 0).toISOString(),
    duration: 15,
    clinicianId: '1',
    clinicianName: 'Sarah Chen',
    calendarId: 1000000,
    wasTransferred: false,
    stage: 'lost',
    lostStage: 'pre_consult',
    lostDate: addDays(today, -67).toISOString(),
    lostReason: 'No-show, no response to follow-ups',
    followUpCount: 3,
    createdAt: addDays(today, -77).toISOString(),
    updatedAt: addDays(today, -67).toISOString(),
  },

  // =================================
  // LOST - September 2025 (older, outside 90 days)
  // =================================
  {
    id: 'c33',
    firstName: 'Katherine',
    lastName: 'Campbell',
    email: 'katherine.c@email.com',
    phone: '(609) 555-3333',
    appointmentId: 1033,
    appointmentTypeId: 1002,
    appointmentTypeName: 'New Client Consultation with Maria Rodriguez',
    datetime: setTime(addDays(today, -100), 9, 0).toISOString(),
    duration: 15,
    clinicianId: '2',
    clinicianName: 'Maria Rodriguez',
    calendarId: 2000000,
    wasTransferred: false,
    stage: 'lost',
    lostStage: 'pre_intake',
    lostDate: addDays(today, -95).toISOString(),
    lostReason: 'Found another therapist',
    followUpCount: 0,
    createdAt: addDays(today, -107).toISOString(),
    updatedAt: addDays(today, -95).toISOString(),
  },

  // =================================
  // TRANSFERRED CASE
  // =================================
  {
    id: 'c19',
    firstName: 'Jonathan',
    lastName: 'Evans',
    email: 'jonathan.e@email.com',
    phone: '(973) 555-1919',
    appointmentId: 1019,
    appointmentTypeId: 1003,
    appointmentTypeName: 'New Client Consultation with Priya Patel',
    datetime: setTime(addDays(today, -5), 11, 30).toISOString(),
    duration: 15,
    clinicianId: '4', // Transferred to James Kim
    clinicianName: 'James Kim',
    calendarId: 4000000,
    wasTransferred: true,
    originalClinicianId: '3',
    originalClinicianName: 'Priya Patel',
    stage: 'intake_pending',
    followUpCount: 0,
    createdAt: addDays(today, -12).toISOString(),
    updatedAt: addDays(today, -4).toISOString(),
  },
];

// -----------------------------------------------------------------------------
// HELPER FUNCTIONS
// -----------------------------------------------------------------------------

export function getConsultationsBySegment(segment: string): Consultation[] {
  switch (segment) {
    case 'action_needed':
      return MOCK_CONSULTATIONS.filter(c =>
        ['new', 'consult_complete', 'no_show', 'intake_pending', 'intake_scheduled', 'paperwork_pending', 'ready_for_session'].includes(c.stage)
      );
    case 'upcoming':
      return MOCK_CONSULTATIONS.filter(c => c.stage === 'confirmed');
    case 'in_progress':
      return MOCK_CONSULTATIONS.filter(c =>
        ['consult_complete', 'intake_pending', 'intake_scheduled', 'paperwork_pending', 'ready_for_session'].includes(c.stage)
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
    ['new', 'consult_complete', 'no_show', 'intake_pending', 'intake_scheduled', 'paperwork_pending', 'ready_for_session'].includes(c.stage)
  ).length;
}
