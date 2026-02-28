import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Calendar, TrendingUp, FileText, Check } from 'lucide-react';
import { ConfigCard, SliderInput } from './shared';
import { Grid, AnimatedSection } from '../design-system';
import { PracticeGoals } from '../../context/SettingsContext';

export const PracticeGoalsTab: React.FC<{
  goals: PracticeGoals;
  onUpdate: (goals: PracticeGoals) => void;
}> = ({ goals, onUpdate }) => {
  const [localGoals, setLocalGoals] = useState(goals);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (key: keyof PracticeGoals, value: number) => {
    setLocalGoals(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdate(localGoals);
    setHasChanges(false);
  };

  return (
    <div>
      <AnimatedSection delay={0}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2
              className="text-3xl font-bold text-stone-800"
              style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
            >
              Practice Goals
            </h2>
            <p className="text-stone-500 text-lg mt-1">Set your practice-wide performance targets</p>
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

      <Grid cols={2}>
        {/* Revenue Goal */}
        <AnimatedSection delay={0.05}>
          <ConfigCard accent="linear-gradient(90deg, #10b981 0%, #34d399 100%)">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <DollarSign size={28} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-stone-800">Monthly Revenue</h3>
                  <p className="text-stone-500">Target gross revenue per month</p>
                </div>
              </div>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400 text-2xl font-medium">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={localGoals.monthlyRevenue || ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    handleChange('monthlyRevenue', val === '' ? 0 : parseInt(val, 10));
                  }}
                  className="w-full pl-12 pr-5 py-5 rounded-xl bg-stone-50 border-2 border-transparent text-4xl font-bold text-stone-800 focus:outline-none focus:border-emerald-300 focus:bg-white transition-all"
                  style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                />
              </div>
              <p className="text-stone-400 mt-4">
                That's ${Math.round(localGoals.monthlyRevenue * 12).toLocaleString()}/year
              </p>
            </div>
          </ConfigCard>
        </AnimatedSection>

        {/* Sessions Goal */}
        <AnimatedSection delay={0.1}>
          <ConfigCard accent="linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Calendar size={28} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-stone-800">Monthly Sessions</h3>
                  <p className="text-stone-500">Target completed sessions</p>
                </div>
              </div>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={localGoals.monthlySessions || ''}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  handleChange('monthlySessions', val === '' ? 0 : parseInt(val, 10));
                }}
                className="w-full px-5 py-5 rounded-xl bg-stone-50 border-2 border-transparent text-4xl font-bold text-stone-800 focus:outline-none focus:border-blue-300 focus:bg-white transition-all"
                style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
              />
              <p className="text-stone-400 mt-4">
                That's {Math.round(localGoals.monthlySessions / 4)} sessions/week
              </p>
            </div>
          </ConfigCard>
        </AnimatedSection>

        {/* Rebook Rate Goal */}
        <AnimatedSection delay={0.15}>
          <ConfigCard accent="linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-xl bg-amber-50 flex items-center justify-center">
                  <TrendingUp size={28} className="text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-stone-800">Target Rebook Rate</h3>
                  <p className="text-stone-500">Clients with next appointment scheduled</p>
                </div>
              </div>
              <SliderInput
                label=""
                value={localGoals.targetRebookRate}
                onChange={(v) => handleChange('targetRebookRate', v)}
                min={50}
                max={100}
                colorStart="#f59e0b"
                colorEnd="#10b981"
              />
              <p className="text-stone-400 mt-4">Industry average is 85%</p>
            </div>
          </ConfigCard>
        </AnimatedSection>

        {/* Note Deadline */}
        <AnimatedSection delay={0.2}>
          <ConfigCard accent="linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%)">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-xl bg-violet-50 flex items-center justify-center">
                  <FileText size={28} className="text-violet-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-stone-800">Note Deadline</h3>
                  <p className="text-stone-500">Hours after session for completion</p>
                </div>
              </div>
              <div className="flex gap-3">
                {[24, 48, 72, 96].map((hours) => (
                  <motion.button
                    key={hours}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleChange('noteDeadlineHours', hours)}
                    className={`
                      flex-1 py-5 rounded-xl font-bold text-2xl transition-all
                      ${localGoals.noteDeadlineHours === hours
                        ? 'bg-violet-500 text-white shadow-lg'
                        : 'bg-stone-50 text-stone-600 hover:bg-stone-100'}
                    `}
                    style={{
                      fontFamily: "'Tiempos Headline', Georgia, serif",
                      boxShadow: localGoals.noteDeadlineHours === hours ? '0 4px 16px rgba(139, 92, 246, 0.3)' : 'none',
                    }}
                  >
                    {hours}h
                  </motion.button>
                ))}
              </div>
              <p className="text-stone-400 mt-4">
                {localGoals.noteDeadlineHours <= 24 && 'Strict compliance standard'}
                {localGoals.noteDeadlineHours === 48 && 'Standard practice policy'}
                {localGoals.noteDeadlineHours === 72 && 'Common 3-day policy'}
                {localGoals.noteDeadlineHours >= 96 && 'Lenient 4-day policy'}
              </p>
            </div>
          </ConfigCard>
        </AnimatedSection>
      </Grid>
    </div>
  );
};
