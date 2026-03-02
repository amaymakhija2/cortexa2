import React from 'react';
import { motion } from 'framer-motion';
import { AnimatedSection } from '../design-system';
import {
  Clinician,
  LicenseType,
  ClinicianRole,
  LICENSE_TYPE_NAMES,
  LICENSES_REQUIRING_SUPERVISION,
} from './shared';

interface TeamMembersTabProps {
  clinicians: Clinician[];
  onUpdate: (clinicians: Clinician[]) => void;
}

// =============================================================================
// ROLE PICKER COMPONENT
// =============================================================================
// Full-width segmented control. Each row independently tracks its own selection
// via simple conditional styling — no shared layout animations across rows.
// Selected = dark pill with white text. Unselected = receded text on light bg.
// =============================================================================

interface RolePickerProps {
  value: ClinicianRole;
  onChange: (role: ClinicianRole) => void;
}

const ROLE_OPTIONS: { role: ClinicianRole; label: string }[] = [
  { role: 'Clinician Only', label: 'Clinician' },
  { role: 'Clinician and Supervisor', label: 'Both' },
  { role: 'Supervisor Only', label: 'Supervisor' },
];

const RolePicker: React.FC<RolePickerProps> = ({ value, onChange }) => {
  return (
    <div className="flex items-center rounded-lg p-1 w-full bg-stone-100">
      {ROLE_OPTIONS.map((opt) => {
        const isSelected = value === opt.role;
        return (
          <button
            key={opt.role}
            onClick={() => onChange(opt.role)}
            className={`
              relative flex-1 py-2 rounded-md text-sm font-medium
              transition-all duration-200
              focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-1
              ${isSelected
                ? 'bg-stone-800 text-white font-semibold shadow-sm'
                : 'text-stone-400 hover:text-stone-600'}
            `}
            title={opt.role}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

// =============================================================================
// TEAM MEMBERS TAB
// =============================================================================

export const TeamMembersTab: React.FC<TeamMembersTabProps> = ({ clinicians, onUpdate }) => {
  const handleUpdateClinician = (id: string, updates: Partial<Clinician>) => {
    onUpdate(clinicians.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handleLicenseChange = (id: string, licenseType: LicenseType) => {
    const requiresSupervision = LICENSES_REQUIRING_SUPERVISION.includes(licenseType);
    handleUpdateClinician(id, {
      licenseType,
      licenseTitle: LICENSE_TYPE_NAMES[licenseType],
      requiresSupervision,
    });
  };

  const handleRoleChange = (id: string, role: ClinicianRole) => {
    handleUpdateClinician(id, { role });
  };

  return (
    <div>
      <AnimatedSection delay={0}>
        <div className="mb-8">
          <h2
            className="text-3xl font-bold text-stone-800"
            style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
          >
            Team Members
          </h2>
          <p className="text-stone-500 text-lg mt-1">Configure credentials and roles for each clinician</p>
        </div>
      </AnimatedSection>

      {/* Table Header */}
      <AnimatedSection delay={0.05}>
        <div className="grid grid-cols-12 gap-4 px-5 py-3 text-xs font-bold text-stone-400 uppercase tracking-wide border-b border-stone-200">
          <div className="col-span-3">Clinician</div>
          <div className="col-span-2">License</div>
          <div className="col-span-5">Role</div>
          <div className="col-span-2 text-center">Status</div>
        </div>
      </AnimatedSection>

      <div className="divide-y divide-stone-100">
        {clinicians.map((clinician, index) => (
          <AnimatedSection key={clinician.id} delay={index * 0.03 + 0.1}>
            <div
              className={`grid grid-cols-12 gap-4 px-5 py-4 items-center ${
                !clinician.isActive ? 'opacity-50' : ''
              }`}
            >
              {/* Clinician Info */}
              <div className="col-span-3 flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold"
                  style={{
                    background: `linear-gradient(135deg, ${clinician.color} 0%, ${clinician.color}dd 100%)`,
                  }}
                >
                  {clinician.initials}
                </div>
                <div>
                  <p
                    className="font-semibold text-stone-800"
                    style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                  >
                    {clinician.name}
                  </p>
                  <p className="text-xs text-stone-400">
                    Since {new Date(clinician.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* License */}
              <div className="col-span-2">
                <select
                  value={clinician.licenseType}
                  onChange={(e) => handleLicenseChange(clinician.id, e.target.value as LicenseType)}
                  className="w-full px-3 py-2.5 rounded-lg bg-stone-100 text-stone-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-300 cursor-pointer hover:bg-stone-200 transition-colors"
                >
                  {(Object.keys(LICENSE_TYPE_NAMES) as LicenseType[]).map(license => (
                    <option key={license} value={license}>{license}</option>
                  ))}
                </select>
              </div>

              {/* Role - Using RolePicker */}
              <div className="col-span-5">
                <RolePicker
                  value={clinician.role}
                  onChange={(role) => handleRoleChange(clinician.id, role)}
                />
              </div>

              {/* Active Status Toggle */}
              <div className="col-span-2 flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleUpdateClinician(clinician.id, { isActive: !clinician.isActive })}
                  className={`
                    px-4 py-1.5 rounded-full text-sm font-medium transition-all
                    ${clinician.isActive
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-stone-100 text-stone-400'}
                  `}
                >
                  {clinician.isActive ? 'Active' : 'Inactive'}
                </motion.button>
              </div>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </div>
  );
};
