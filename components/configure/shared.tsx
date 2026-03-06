import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
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
  | 'Clinician Only'
  | 'Clinician and Supervisor'
  | 'Supervisor Only';

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
  ehrClinicianIds: string[];  // SP clinician record IDs mapped to this person
}

// Raw clinician record synced from EHR (e.g. SimplePractice)
export interface RawEHRClinician {
  id: string;
  rawName: string;
  rawRole: string;
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

// Role options
export const ROLE_OPTIONS: ClinicianRole[] = [
  'Clinician Only',
  'Clinician and Supervisor',
  'Supervisor Only',
];

// Helper to check if a role can supervise others
export const canSupervise = (role: ClinicianRole): boolean =>
  role === 'Clinician and Supervisor' || role === 'Supervisor Only';

// Helper to check if a role sees clients
export const seesClients = (role: ClinicianRole): boolean =>
  role === 'Clinician Only' || role === 'Clinician and Supervisor';

// Telehealth keywords for auto-classification
export const TELEHEALTH_KEYWORDS = ['video', 'telehealth', 'virtual', 'remote', 'zoom', 'doxy', 'google meet'];

export const classifyOffice = (name: string): 'in-person' | 'telehealth' => {
  const lower = name.toLowerCase();
  return TELEHEALTH_KEYWORDS.some(kw => lower.includes(kw)) ? 'telehealth' : 'in-person';
};

// =============================================================================
// MOCK DATA
// =============================================================================

// Mock raw EHR clinicians — simulating what comes from SimplePractice
// 7 SP records for 5 actual people (Sarah has a supervision account, Michael has an intern account)
export const MOCK_EHR_CLINICIANS: RawEHRClinician[] = [
  { id: 'sp-clin-1', rawName: 'Sarah Chen', rawRole: 'Clinical Director' },
  { id: 'sp-clin-1b', rawName: 'Sarah Chen - Supervision', rawRole: 'Supervisor' },
  { id: 'sp-clin-2', rawName: 'Maria Rodriguez', rawRole: 'Senior Therapist' },
  { id: 'sp-clin-3', rawName: 'Priya Patel', rawRole: 'Therapist' },
  { id: 'sp-clin-4', rawName: 'James Kim', rawRole: 'Associate Therapist' },
  { id: 'sp-clin-5', rawName: 'Michael Johnson', rawRole: 'Associate Therapist' },
  { id: 'sp-clin-5b', rawName: 'M. Johnson - Intern', rawRole: 'Intern' },
];

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
  const lower = role.toLowerCase();
  if (lower.includes('supervisor') && (lower.includes('therapist') || lower.includes('clinician') || lower.includes('director'))) {
    return 'Clinician and Supervisor';
  }
  if (lower.includes('supervisor') || lower.includes('director')) {
    return 'Supervisor Only';
  }
  return 'Clinician Only';
};

// Default 1:1 EHR mapping — keyed by master clinician ID → SP record IDs
// The duplicate accounts (sp-clin-1b, sp-clin-5b) start unassigned to demonstrate the mapping UI
const DEFAULT_EHR_CLINICIAN_MAP: Record<string, string[]> = {
  '1': ['sp-clin-1'],       // Sarah Chen — 'sp-clin-1b' (supervision) is unassigned
  '2': ['sp-clin-2'],       // Maria Rodriguez
  '3': ['sp-clin-3'],       // Priya Patel
  '4': ['sp-clin-4'],       // James Kim
  '5': ['sp-clin-5'],       // Michael Johnson — 'sp-clin-5b' (intern) is unassigned
};

// Map master clinicians to the local interface with additional fields
export const MOCK_CLINICIANS: Clinician[] = MASTER_CLINICIANS.map(c => {
  const licenseType = inferLicenseType(c.title);
  const role = inferRole(c.role);
  // Only require supervision if license type requires it
  const needsSupervision = LICENSES_REQUIRING_SUPERVISION.includes(licenseType);
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
    ehrClinicianIds: DEFAULT_EHR_CLINICIAN_MAP[c.id] || [],
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

// Status Pill - compact progress indicator for headers
export const StatusPill: React.FC<{
  assigned: number;
  total: number;
  completeLabel?: string;
  incompleteLabel?: string;
}> = ({ assigned, total, completeLabel = 'All assigned', incompleteLabel }) => {
  const unassigned = total - assigned;
  const isComplete = unassigned === 0;
  const progress = total > 0 ? assigned / total : 0;
  const radius = 8.5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);
  const defaultIncompleteLabel = `${unassigned} unassigned`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-colors ${
        isComplete
          ? 'bg-emerald-50/80 border-emerald-200'
          : 'bg-amber-50/80 border-amber-200'
      }`}
    >
      <div className="relative w-6 h-6 flex items-center justify-center flex-shrink-0">
        <svg width="22" height="22" viewBox="0 0 22 22" className="absolute -rotate-90">
          <circle
            cx="11" cy="11" r={radius}
            fill="none"
            stroke={isComplete ? '#d1fae5' : '#fde68a'}
            strokeWidth="2"
          />
          <motion.circle
            cx="11" cy="11" r={radius}
            fill="none"
            stroke={isComplete ? '#10b981' : '#f59e0b'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </svg>
        {isComplete ? (
          <Check size={10} className="text-emerald-600 relative z-10" strokeWidth={3} />
        ) : (
          <span className="text-[9px] font-bold relative z-10 text-amber-700">
            {assigned}
          </span>
        )}
      </div>
      <span className={`text-sm font-semibold ${
        isComplete ? 'text-emerald-800' : 'text-amber-800'
      }`}>
        {isComplete ? completeLabel : (incompleteLabel || defaultIncompleteLabel)}
      </span>
      <span className={`text-xs font-medium ${
        isComplete ? 'text-emerald-600/70' : 'text-amber-600/60'
      }`}>
        {assigned}/{total}
      </span>
    </motion.div>
  );
};

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
