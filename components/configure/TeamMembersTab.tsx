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

const ROLE_OPTIONS: ClinicianRole[] = [
  'Clinician Only',
  'Clinician and Supervisor',
  'Supervisor Only',
];

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
          <div className="col-span-3">Role</div>
          <div className="col-span-2 text-center">Needs Supervision</div>
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

              {/* Role */}
              <div className="col-span-3">
                <select
                  value={clinician.role}
                  onChange={(e) => handleRoleChange(clinician.id, e.target.value as ClinicianRole)}
                  className="w-full px-3 py-2.5 rounded-lg bg-stone-100 text-stone-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-300 cursor-pointer hover:bg-stone-200 transition-colors"
                >
                  {ROLE_OPTIONS.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              {/* Needs Supervision Toggle */}
              <div className="col-span-2 flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (clinician.requiresSupervision) {
                      handleUpdateClinician(clinician.id, { requiresSupervision: false, supervisorId: null });
                    } else {
                      handleUpdateClinician(clinician.id, { requiresSupervision: true });
                    }
                  }}
                  className={`
                    w-14 h-8 rounded-full transition-all relative
                    ${clinician.requiresSupervision
                      ? 'bg-violet-500'
                      : 'bg-stone-200'}
                  `}
                >
                  <motion.div
                    className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm"
                    animate={{ left: clinician.requiresSupervision ? 'calc(100% - 28px)' : '4px' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </motion.button>
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
