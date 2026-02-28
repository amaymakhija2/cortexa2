import React from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import { AnimatedSection } from '../design-system';
import { Clinician } from './shared';

interface TeamStructureTabProps {
  clinicians: Clinician[];
  onUpdate: (clinicians: Clinician[]) => void;
}

export const TeamStructureTab: React.FC<TeamStructureTabProps> = ({ clinicians, onUpdate }) => {
  // Clinicians who CAN supervise (don't need supervision themselves)
  const canSupervise = clinicians.filter(c => c.isActive && !c.requiresSupervision);

  // Clinicians who NEED a supervisor assigned
  const needsSupervision = clinicians.filter(c => c.isActive && c.requiresSupervision);

  const handleUpdateSupervisor = (clinicianId: string, newSupervisorId: string | null) => {
    onUpdate(clinicians.map(c =>
      c.id === clinicianId ? { ...c, supervisorId: newSupervisorId } : c
    ));
  };

  // Count assigned vs unassigned
  const assignedCount = needsSupervision.filter(c => c.supervisorId).length;
  const unassignedCount = needsSupervision.length - assignedCount;

  return (
    <div>
      <AnimatedSection delay={0}>
        <div className="mb-8">
          <h2
            className="text-3xl font-bold text-stone-800"
            style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
          >
            Team Structure
          </h2>
          <p className="text-stone-500 text-lg mt-1">Assign supervisors to clinicians who need supervision</p>
        </div>
      </AnimatedSection>

      {/* Status Summary */}
      {needsSupervision.length > 0 && (
        <AnimatedSection delay={0.05}>
          <div className="mb-6 flex items-center gap-4">
            <div className={`flex-1 p-4 rounded-xl ${unassignedCount > 0 ? 'bg-amber-50 border-2 border-amber-200' : 'bg-emerald-50 border-2 border-emerald-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {unassignedCount > 0 ? (
                    <AlertTriangle size={20} className="text-amber-600" />
                  ) : (
                    <Check size={20} className="text-emerald-600" />
                  )}
                  <span className={`font-semibold ${unassignedCount > 0 ? 'text-amber-800' : 'text-emerald-800'}`}>
                    {unassignedCount > 0
                      ? `${unassignedCount} clinician${unassignedCount > 1 ? 's' : ''} need${unassignedCount === 1 ? 's' : ''} a supervisor`
                      : 'All clinicians have supervisors assigned'}
                  </span>
                </div>
                <span className="text-sm text-stone-500">
                  {assignedCount} of {needsSupervision.length} assigned
                </span>
              </div>
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* Simple table for those needing supervision */}
      {needsSupervision.length > 0 ? (
        <>
          {/* Table Header */}
          <AnimatedSection delay={0.1}>
            <div className="grid grid-cols-12 gap-4 px-5 py-3 text-xs font-bold text-stone-400 uppercase tracking-wide border-b border-stone-200">
              <div className="col-span-5">Clinician</div>
              <div className="col-span-3">License & Role</div>
              <div className="col-span-4">Supervisor</div>
            </div>
          </AnimatedSection>

          <div className="divide-y divide-stone-100">
            {needsSupervision.map((clinician, index) => {
              const currentSupervisor = canSupervise.find(s => s.id === clinician.supervisorId);
              const isUnassigned = !clinician.supervisorId;

              return (
                <AnimatedSection key={clinician.id} delay={index * 0.03 + 0.15}>
                  <div
                    className={`grid grid-cols-12 gap-4 px-5 py-4 items-center transition-colors ${
                      isUnassigned ? 'bg-amber-50/50' : 'hover:bg-stone-50'
                    }`}
                  >
                    {/* Clinician */}
                    <div className="col-span-5 flex items-center gap-4">
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
                        {isUnassigned && (
                          <p className="text-xs text-amber-600 font-medium">Needs supervisor</p>
                        )}
                      </div>
                    </div>

                    {/* License & Role */}
                    <div className="col-span-3">
                      <p className="text-stone-600 text-sm font-medium">{clinician.licenseType}</p>
                      <p className="text-stone-400 text-xs">{clinician.role}</p>
                    </div>

                    {/* Supervisor Dropdown */}
                    <div className="col-span-4">
                      <select
                        value={clinician.supervisorId || ''}
                        onChange={(e) => handleUpdateSupervisor(clinician.id, e.target.value || null)}
                        className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-300 cursor-pointer transition-colors ${
                          isUnassigned
                            ? 'bg-white border-2 border-amber-300 text-amber-700'
                            : 'bg-stone-100 border-0 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        <option value="">{isUnassigned ? 'Select supervisor...' : 'No supervisor'}</option>
                        {canSupervise.map(s => (
                          <option key={s.id} value={s.id}>{s.name} ({s.licenseType})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>

          {/* Available Supervisors Reference */}
          <AnimatedSection delay={needsSupervision.length * 0.03 + 0.2}>
            <div className="mt-8 p-5 rounded-xl bg-stone-100">
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-3">Available Supervisors</p>
              <div className="flex flex-wrap gap-2">
                {canSupervise.map(s => (
                  <div
                    key={s.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white"
                  >
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: s.color }}
                    >
                      {s.initials}
                    </div>
                    <span className="text-sm text-stone-700 font-medium">{s.name}</span>
                    <span className="text-xs text-stone-400">{s.licenseType}</span>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </>
      ) : (
        /* Empty State */
        <AnimatedSection delay={0.1}>
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <Check size={36} className="text-emerald-500" />
            </div>
            <h3
              className="text-xl font-bold text-stone-700 mb-2"
              style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
            >
              No supervision assignments needed
            </h3>
            <p className="text-stone-400">
              All active clinicians are marked as independent in Team Members
            </p>
          </div>
        </AnimatedSection>
      )}
    </div>
  );
};
