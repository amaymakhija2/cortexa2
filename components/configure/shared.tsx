import React from 'react';
import { motion } from 'framer-motion';
import { CLINICIANS as MASTER_CLINICIANS } from '../../data/clinicians';
import type { RawEHROffice, LocationGroup } from '../OfficeMapping';

// =============================================================================
// SHARED TYPES
// =============================================================================

export interface Location {
  id: string;
  name: string;
  address: string;
  isPrimary: boolean;
}

// License types for mental health professionals
export type LicenseType =
  | 'LCSW'      // Licensed Clinical Social Worker
  | 'LMSW'      // Licensed Master Social Worker
  | 'LMHC'      // Licensed Mental Health Counselor
  | 'MHC-LP'    // Mental Health Counselor - Limited Permit
  | 'LPC'       // Licensed Professional Counselor
  | 'LMFT'      // Licensed Marriage & Family Therapist
  | 'PhD'       // Doctor of Philosophy (Psychology)
  | 'PsyD'      // Doctor of Psychology
  | 'MD'        // Medical Doctor (Psychiatrist)
  | 'NP'        // Nurse Practitioner
  | 'Other';

// Role types within the practice
export type ClinicianRole =
  | 'Clinical Director'
  | 'Supervisor'
  | 'Senior Therapist'
  | 'Therapist'
  | 'Associate';

// Follow-up attempt count options
export type FollowUpAttempts = 2 | 3 | 4;

export interface Clinician {
  id: string;
  name: string;
  initials: string;
  color: string;
  role: ClinicianRole;
  licenseType: LicenseType;
  licenseTitle: string;  // Full license name for display
  supervisorId: string | null;
  requiresSupervision: boolean;
  isActive: boolean;
  startDate: string;
  sessionGoal: number;
  clientGoal: number;
  takeRate: number;
}

export interface EHRConnection {
  provider: string;
  status: 'connected' | 'disconnected' | 'syncing';
  lastSync: string;
  nextSyncAvailable: string;
  totalClients: number;
  totalClinicians: number;
}

// =============================================================================
// CONSTANTS
// =============================================================================

// License type display names
export const LICENSE_TYPE_NAMES: Record<LicenseType, string> = {
  'LCSW': 'Licensed Clinical Social Worker',
  'LMSW': 'Licensed Master Social Worker',
  'LMHC': 'Licensed Mental Health Counselor',
  'MHC-LP': 'Mental Health Counselor - Limited Permit',
  'LPC': 'Licensed Professional Counselor',
  'LMFT': 'Licensed Marriage & Family Therapist',
  'PhD': 'Doctor of Philosophy (Psychology)',
  'PsyD': 'Doctor of Psychology',
  'MD': 'Medical Doctor (Psychiatrist)',
  'NP': 'Nurse Practitioner',
  'Other': 'Other',
};

// License types that typically require supervision
export const LICENSES_REQUIRING_SUPERVISION: LicenseType[] = ['LMSW', 'MHC-LP'];

// Role options for dropdown
export const ROLE_OPTIONS: ClinicianRole[] = [
  'Clinical Director',
  'Supervisor',
  'Senior Therapist',
  'Therapist',
  'Associate',
];

// Telehealth keywords for auto-classification
export const TELEHEALTH_KEYWORDS = ['video', 'telehealth', 'virtual', 'remote', 'zoom', 'doxy', 'google meet'];

export const classifyOffice = (name: string): 'in-person' | 'telehealth' => {
  const lower = name.toLowerCase();
  return TELEHEALTH_KEYWORDS.some(kw => lower.includes(kw)) ? 'telehealth' : 'in-person';
};

// =============================================================================
// MOCK DATA
// =============================================================================

// Mock raw EHR offices — simulating what comes from SimplePractice
export const MOCK_EHR_OFFICES: RawEHROffice[] = [
  { id: 'ehr-1', rawName: 'Video Office', classification: classifyOffice('Video Office') },
  { id: 'ehr-2', rawName: 'Google Meet', classification: classifyOffice('Google Meet') },
  { id: 'ehr-3', rawName: 'Physical Office Space Grand Central #1108', classification: classifyOffice('Physical Office Space Grand Central #1108') },
  { id: 'ehr-4', rawName: 'Physical Office Space Grand Central #708', classification: classifyOffice('Physical Office Space Grand Central #708') },
  { id: 'ehr-5', rawName: 'Physical Office Space Nomad', classification: classifyOffice('Physical Office Space Nomad') },
];

// Auto-create a "Virtual Office" group with all telehealth-classified EHR offices
const AUTO_VIRTUAL_OFFICE_IDS = MOCK_EHR_OFFICES
  .filter(o => o.classification === 'telehealth')
  .map(o => o.id);

export const MOCK_LOCATION_GROUPS: LocationGroup[] = AUTO_VIRTUAL_OFFICE_IDS.length > 0
  ? [{
      id: 'loc-auto-virtual',
      name: 'Virtual Office',
      type: 'telehealth' as const,
      address: '',
      isPrimary: false,
      ehrOfficeIds: AUTO_VIRTUAL_OFFICE_IDS,
    }]
  : [];

export const MOCK_LOCATIONS: Location[] = [
  { id: '1', name: 'Manhattan', address: '350 Fifth Avenue, Suite 4200, New York, NY 10118', isPrimary: true },
  { id: '2', name: 'Brooklyn', address: '180 Montague Street, Brooklyn, NY 11201', isPrimary: false },
];

// Helper to infer license type from title string
export const inferLicenseType = (title: string): LicenseType => {
  if (title.includes('Clinical Social Worker')) return 'LCSW';
  if (title.includes('Master Social Worker')) return 'LMSW';
  if (title.includes('Mental Health Counselor')) return 'LMHC';
  if (title.includes('Professional Counselor')) return 'LPC';
  if (title.includes('Marriage & Family')) return 'LMFT';
  if (title.includes('Psychologist') || title.includes('PhD')) return 'PhD';
  if (title.includes('PsyD')) return 'PsyD';
  return 'Other';
};

// Helper to infer role from role string
export const inferRole = (role: string): ClinicianRole => {
  if (role.includes('Director')) return 'Clinical Director';
  if (role.includes('Supervisor')) return 'Supervisor';
  if (role.includes('Senior')) return 'Senior Therapist';
  if (role.includes('Associate')) return 'Associate';
  return 'Therapist';
};

// Map master clinicians to the local interface with additional fields
export const MOCK_CLINICIANS: Clinician[] = MASTER_CLINICIANS.map(c => {
  const licenseType = inferLicenseType(c.title);
  const role = inferRole(c.role);
  // Only require supervision if license type requires it OR role is Associate
  const needsSupervision = LICENSES_REQUIRING_SUPERVISION.includes(licenseType) || role === 'Associate';
  return {
    id: c.id,
    name: c.name,
    initials: c.initials,
    color: c.color,
    role: role,
    licenseType: licenseType,
    licenseTitle: c.title,
    // Only keep supervisorId if they actually need supervision
    supervisorId: needsSupervision ? c.supervisorId : null,
    requiresSupervision: needsSupervision,
    isActive: c.isActive,
    startDate: c.startDate,
    sessionGoal: c.sessionGoal,
    clientGoal: c.clientGoal,
    takeRate: c.takeRate,
  };
});

export const MOCK_EHR: EHRConnection = {
  provider: 'SimplePractice',
  status: 'connected',
  lastSync: '2024-12-12T06:00:00Z',
  nextSyncAvailable: '2024-12-13T06:00:00Z',
  totalClients: 156,
  totalClinicians: 5,
};

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

// Config Card - elegant card wrapper
export const ConfigCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  accent?: string;
}> = ({ children, className = '', accent }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className={`relative bg-white rounded-2xl overflow-hidden ${className}`}
    style={{
      boxShadow: `
        0 1px 3px rgba(0, 0, 0, 0.04),
        0 4px 12px rgba(0, 0, 0, 0.03),
        0 0 0 1px rgba(0, 0, 0, 0.03)
      `,
    }}
  >
    {accent && (
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: accent }}
      />
    )}
    {children}
  </motion.div>
);

// Input Field
export const InputField: React.FC<{
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: 'text' | 'number';
  prefix?: string;
  suffix?: string;
  placeholder?: string;
}> = ({ label, value, onChange, type = 'text', prefix, suffix, placeholder }) => (
  <div className="space-y-2">
    <label className="text-sm font-semibold text-stone-600">{label}</label>
    <div className="relative">
      {prefix && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-medium">
          {prefix}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`
          w-full px-4 py-3.5 rounded-xl
          bg-stone-50 border-2 border-transparent
          text-stone-800 font-medium
          placeholder:text-stone-300
          focus:outline-none focus:border-amber-300 focus:bg-white
          transition-all duration-200
          ${prefix ? 'pl-8' : ''}
          ${suffix ? 'pr-12' : ''}
        `}
        style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
      />
      {suffix && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 font-medium">
          {suffix}
        </span>
      )}
    </div>
  </div>
);

// Slider Input
export const SliderInput: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  suffix?: string;
  colorStart?: string;
  colorEnd?: string;
}> = ({ label, value, onChange, min, max, suffix = '%', colorStart = '#10b981', colorEnd = '#ef4444' }) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-stone-600">{label}</label>
        <span
          className="text-lg font-bold"
          style={{
            fontFamily: "'Tiempos Headline', Georgia, serif",
            color: `color-mix(in srgb, ${colorStart} ${100 - percentage}%, ${colorEnd})`,
          }}
        >
          {value}{suffix}
        </span>
      </div>
      <div className="relative h-3 bg-stone-100 rounded-full overflow-hidden">
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${colorStart} 0%, ${colorEnd} 100%)`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3 }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-lg border-2 border-stone-200"
          style={{ left: `calc(${percentage}% - 10px)` }}
          whileHover={{ scale: 1.2 }}
        />
      </div>
    </div>
  );
};
