import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, DollarSign, Check } from 'lucide-react';
import { Clinician, ConfigCard } from './shared';
import { AnimatedSection } from '../design-system';

export const ClinicianGoalsTab: React.FC<{
  clinicians: Clinician[];
  onUpdate: (clinicians: Clinician[]) => void;
}> = ({ clinicians, onUpdate }) => {
  // Local state for editing - only save when user clicks Save
  const [localClinicians, setLocalClinicians] = useState(clinicians);
  const [hasChanges, setHasChanges] = useState(false);

  const handleUpdateClinician = (id: string, updates: Partial<Clinician>) => {
    setLocalClinicians(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdate(localClinicians);
    setHasChanges(false);
  };

  // Only show active clinicians
  const activeClinicians = localClinicians.filter(c => c.isActive);

  // Calculate practice totals
  const totalSessionGoal = activeClinicians.reduce((sum, c) => sum + c.sessionGoal, 0);
  const totalClientGoal = activeClinicians.reduce((sum, c) => sum + c.clientGoal, 0);
  const avgTakeRate = activeClinicians.length > 0
    ? Math.round(activeClinicians.reduce((sum, c) => sum + c.takeRate, 0) / activeClinicians.length)
    : 0;

  return (
    <div>
      <AnimatedSection delay={0}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2
              className="text-3xl font-bold text-stone-800"
              style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
            >
              Clinician Goals
            </h2>
            <p className="text-stone-500 text-lg mt-1">Set individual performance targets and compensation</p>
          </div>
          <AnimatePresence>
            {hasChanges && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                className="px-6 py-3.5 rounded-xl font-semibold text-white text-lg flex items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                }}
              >
                <Check size={20} />
                Save Changes
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </AnimatedSection>

      {/* Summary Bar */}
      {activeClinicians.length > 0 && (
        <AnimatedSection delay={0.05}>
          <div className="mb-6 p-4 rounded-xl bg-stone-800 text-white flex items-center justify-between">
            <span className="font-medium text-stone-300">Practice Totals</span>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-blue-400" />
                <span className="font-bold">{totalSessionGoal}</span>
                <span className="text-stone-400 text-sm">sessions/wk</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-emerald-400" />
                <span className="font-bold">{totalClientGoal}</span>
                <span className="text-stone-400 text-sm">clients</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-amber-400" />
                <span className="font-bold">{avgTakeRate}%</span>
                <span className="text-stone-400 text-sm">avg take</span>
              </div>
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* Clinician List */}
      <div className="space-y-3">
        {activeClinicians.map((clinician, index) => (
          <AnimatedSection key={clinician.id} delay={index * 0.04 + 0.1}>
            <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
              <ConfigCard>
                <div className="p-5">
                  <div className="flex items-center gap-5">
                    {/* Avatar */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${clinician.color} 0%, ${clinician.color}dd 100%)`,
                        boxShadow: `0 3px 10px ${clinician.color}30`,
                      }}
                    >
                      {clinician.initials}
                    </div>

                    {/* Name & Role */}
                    <div className="flex-1 min-w-0">
                      <h3
                        className="text-lg font-bold text-stone-800"
                        style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                      >
                        {clinician.name}
                      </h3>
                      <p className="text-stone-400 text-sm">{clinician.role}</p>
                    </div>

                    {/* Inline Goal Inputs */}
                    <div className="flex items-center gap-4">
                      {/* Session Goal */}
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50">
                        <Calendar size={16} className="text-blue-500" />
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={clinician.sessionGoal || ''}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            handleUpdateClinician(clinician.id, { sessionGoal: val === '' ? 0 : parseInt(val, 10) });
                          }}
                          className="w-12 bg-transparent text-blue-700 font-bold text-lg text-center focus:outline-none"
                          style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                        />
                        <span className="text-blue-400 text-xs font-medium">/wk</span>
                      </div>

                      {/* Client Goal */}
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50">
                        <Users size={16} className="text-emerald-500" />
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={clinician.clientGoal || ''}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            handleUpdateClinician(clinician.id, { clientGoal: val === '' ? 0 : parseInt(val, 10) });
                          }}
                          className="w-12 bg-transparent text-emerald-700 font-bold text-lg text-center focus:outline-none"
                          style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                        />
                        <span className="text-emerald-400 text-xs font-medium">clients</span>
                      </div>

                      {/* Take Rate */}
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50">
                        <DollarSign size={16} className="text-amber-500" />
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={clinician.takeRate || ''}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            const num = val === '' ? 0 : Math.min(100, parseInt(val, 10));
                            handleUpdateClinician(clinician.id, { takeRate: num });
                          }}
                          className="w-12 bg-transparent text-amber-700 font-bold text-lg text-center focus:outline-none"
                          style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                        />
                        <span className="text-amber-400 text-xs font-medium">%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </ConfigCard>
            </motion.div>
          </AnimatedSection>
        ))}

        {/* Empty state for no active clinicians */}
        {activeClinicians.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-stone-100 flex items-center justify-center">
              <Users size={40} className="text-stone-300" />
            </div>
            <h3
              className="text-2xl font-bold text-stone-600 mb-2"
              style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
            >
              No active clinicians
            </h3>
            <p className="text-stone-400 text-lg">Activate team members in the Team Members tab first</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};
