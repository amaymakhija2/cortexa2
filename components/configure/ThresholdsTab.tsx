import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfigCard, SliderInput } from './shared';
import { Grid, AnimatedSection } from '../design-system';
import type { MetricThresholds } from '../../context/SettingsContext';
import { UserCircle, Clock, AlertTriangle, X, FileText, DollarSign, TrendingUp, Check } from 'lucide-react';

export const ThresholdsTab: React.FC<{
  thresholds: MetricThresholds;
  onUpdate: (thresholds: MetricThresholds) => void;
}> = ({ thresholds, onUpdate }) => {
  const [localThresholds, setLocalThresholds] = useState(thresholds);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = <K extends keyof MetricThresholds>(key: K, value: MetricThresholds[K]) => {
    setLocalThresholds(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdate(localThresholds);
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
              Metric Definitions
            </h2>
            <p className="text-stone-500 text-lg mt-1">Customize how metrics are calculated and displayed</p>
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

      <div className="space-y-6">
        {/* Active & Churned Client Definition */}
        <AnimatedSection delay={0.05}>
          <ConfigCard>
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <UserCircle size={24} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-stone-800">Active & Churned Clients</h3>
                  <p className="text-stone-500">How to determine if a client is active or has churned</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Status-based option */}
                <motion.button
                  whileHover={{ scale: 1.005 }}
                  whileTap={{ scale: 0.995 }}
                  onClick={() => handleChange('clientDefinitionType', 'status-based')}
                  className={`w-full p-5 rounded-xl text-left border-2 transition-all ${
                    localThresholds.clientDefinitionType === 'status-based'
                      ? 'border-amber-400 bg-amber-50'
                      : 'border-stone-100 hover:border-stone-200 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                      localThresholds.clientDefinitionType === 'status-based' ? 'border-amber-500 bg-amber-500' : 'border-stone-300'
                    }`}>
                      {localThresholds.clientDefinitionType === 'status-based' && <Check size={12} className="text-white" />}
                    </div>
                    <div>
                      <p className="font-semibold text-stone-800 text-lg">SimplePractice Status</p>
                      <p className="text-sm text-stone-500 mt-1">
                        <span className="font-medium text-emerald-600">Active</span> = status is "Active" in SimplePractice
                      </p>
                      <p className="text-sm text-stone-500">
                        <span className="font-medium text-rose-600">Churned</span> = status is "Inactive" with no future appointments
                      </p>
                    </div>
                  </div>
                </motion.button>

                {/* Activity-based option */}
                <motion.button
                  whileHover={{ scale: 1.005 }}
                  whileTap={{ scale: 0.995 }}
                  onClick={() => handleChange('clientDefinitionType', 'activity-based')}
                  className={`w-full p-5 rounded-xl text-left border-2 transition-all ${
                    localThresholds.clientDefinitionType === 'activity-based'
                      ? 'border-amber-400 bg-amber-50'
                      : 'border-stone-100 hover:border-stone-200 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                      localThresholds.clientDefinitionType === 'activity-based' ? 'border-amber-500 bg-amber-500' : 'border-stone-300'
                    }`}>
                      {localThresholds.clientDefinitionType === 'activity-based' && <Check size={12} className="text-white" />}
                    </div>
                    <div>
                      <p className="font-semibold text-stone-800 text-lg">Activity-Based</p>
                      <p className="text-sm text-stone-500 mt-1">
                        <span className="font-medium text-emerald-600">Active</span> = had an appointment within the threshold below
                      </p>
                      <p className="text-sm text-stone-500">
                        <span className="font-medium text-rose-600">Churned</span> = no appointment within threshold AND none scheduled
                      </p>
                    </div>
                  </div>
                </motion.button>

                {/* Activity threshold input */}
                {localThresholds.clientDefinitionType === 'activity-based' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center justify-between pl-10 pt-2"
                  >
                    <span className="text-stone-600 font-medium">Activity threshold</span>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={localThresholds.activityThresholdDays}
                        onChange={(e) => handleChange('activityThresholdDays', Math.max(7, Math.min(90, Number(e.target.value))))}
                        className="w-20 px-3 py-2.5 rounded-xl bg-stone-50 border-2 border-transparent text-center text-lg font-bold text-stone-800 focus:outline-none focus:border-amber-300 focus:bg-white transition-all"
                        style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                      />
                      <span className="text-stone-500 font-medium">days</span>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </ConfigCard>
        </AnimatedSection>

        {/* At-Risk Thresholds */}
        <AnimatedSection delay={0.1}>
          <ConfigCard>
            <div className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Clock size={24} className="text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-stone-800">At-Risk Client Thresholds</h3>
                  <p className="text-stone-500">Days since last session for clients without upcoming appointments</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-100">
                  <p className="text-sm font-bold text-emerald-700 mb-3 uppercase tracking-wide">Low Risk</p>
                  <div className="flex items-baseline gap-2">
                    <input
                      type="number"
                      value={localThresholds.atRiskLow}
                      onChange={(e) => handleChange('atRiskLow', Number(e.target.value))}
                      className="w-20 bg-white rounded-xl px-4 py-3 text-3xl font-bold text-emerald-700 border-0 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                      style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                    />
                    <span className="text-emerald-600 font-medium">days</span>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-amber-50 border-2 border-amber-100">
                  <p className="text-sm font-bold text-amber-700 mb-3 uppercase tracking-wide">Medium Risk</p>
                  <div className="flex items-baseline gap-2">
                    <input
                      type="number"
                      value={localThresholds.atRiskMedium}
                      onChange={(e) => handleChange('atRiskMedium', Number(e.target.value))}
                      className="w-20 bg-white rounded-xl px-4 py-3 text-3xl font-bold text-amber-700 border-0 focus:outline-none focus:ring-2 focus:ring-amber-300"
                      style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                    />
                    <span className="text-amber-600 font-medium">days</span>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-rose-50 border-2 border-rose-100">
                  <p className="text-sm font-bold text-rose-700 mb-3 uppercase tracking-wide">High Risk</p>
                  <div className="flex items-baseline gap-2">
                    <input
                      type="number"
                      value={localThresholds.atRiskHigh}
                      onChange={(e) => handleChange('atRiskHigh', Number(e.target.value))}
                      className="w-20 bg-white rounded-xl px-4 py-3 text-3xl font-bold text-rose-700 border-0 focus:outline-none focus:ring-2 focus:ring-rose-300"
                      style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                    />
                    <span className="text-rose-600 font-medium">days</span>
                  </div>
                </div>
              </div>
            </div>
          </ConfigCard>
        </AnimatedSection>

        {/* Churn Timing Categories */}
        <AnimatedSection delay={0.15}>
          <ConfigCard>
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center">
                  <AlertTriangle size={24} className="text-violet-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-stone-800">Churn Timing Categories</h3>
                  <p className="text-stone-500">Categorize churned clients by sessions completed before leaving</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="p-5 rounded-xl bg-rose-50 border-2 border-rose-100">
                  <p className="text-sm font-bold text-rose-700 mb-1 uppercase tracking-wide">Early Churn</p>
                  <p className="text-xs text-rose-500 mb-3">Engagement issues</p>
                  <div className="flex items-center gap-2">
                    <span className="text-rose-400">&lt;</span>
                    <input
                      type="number"
                      value={localThresholds.earlyChurnSessions}
                      onChange={(e) => handleChange('earlyChurnSessions', Math.max(1, Number(e.target.value)))}
                      className="w-16 bg-white rounded-lg px-3 py-2 text-xl font-bold text-rose-700 border-0 focus:outline-none focus:ring-2 focus:ring-rose-300 text-center"
                      style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                    />
                    <span className="text-rose-500 text-sm">sessions</span>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-amber-50 border-2 border-amber-100">
                  <p className="text-sm font-bold text-amber-700 mb-1 uppercase tracking-wide">Medium Churn</p>
                  <p className="text-xs text-amber-500 mb-3">Treatment plateau</p>
                  <p className="text-xl font-bold text-amber-700" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>
                    {localThresholds.earlyChurnSessions} – {localThresholds.lateChurnSessions}
                  </p>
                  <span className="text-amber-500 text-sm">sessions</span>
                </div>

                <div className="p-5 rounded-xl bg-emerald-50 border-2 border-emerald-100">
                  <p className="text-sm font-bold text-emerald-700 mb-1 uppercase tracking-wide">Late Churn</p>
                  <p className="text-xs text-emerald-500 mb-3">Natural completion</p>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">&gt;</span>
                    <input
                      type="number"
                      value={localThresholds.lateChurnSessions}
                      onChange={(e) => handleChange('lateChurnSessions', Math.max(localThresholds.earlyChurnSessions + 1, Number(e.target.value)))}
                      className="w-16 bg-white rounded-lg px-3 py-2 text-xl font-bold text-emerald-700 border-0 focus:outline-none focus:ring-2 focus:ring-emerald-300 text-center"
                      style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                    />
                    <span className="text-emerald-500 text-sm">sessions</span>
                  </div>
                </div>
              </div>
            </div>
          </ConfigCard>
        </AnimatedSection>

        {/* Other Settings - Late Cancel & Note Deadline */}
        <Grid cols={2}>
          <AnimatedSection delay={0.2}>
            <ConfigCard>
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                    <X size={24} className="text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-stone-800">Late Cancel Window</h3>
                    <p className="text-stone-500">Hours before appointment to count as late</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    value={localThresholds.lateCancelHours}
                    onChange={(e) => handleChange('lateCancelHours', Math.max(1, Math.min(72, Number(e.target.value))))}
                    className="w-24 bg-stone-50 rounded-xl px-4 py-4 text-3xl font-bold text-stone-800 border-2 border-transparent focus:outline-none focus:border-amber-300 focus:bg-white transition-all text-center"
                    style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                  />
                  <span className="text-stone-500 font-medium text-lg">hours before</span>
                </div>
              </div>
            </ConfigCard>
          </AnimatedSection>

          <AnimatedSection delay={0.25}>
            <ConfigCard>
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                    <FileText size={24} className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-stone-800">Note Deadline</h3>
                    <p className="text-stone-500">Days after session for note completion</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    value={localThresholds.noteDeadlineDays}
                    onChange={(e) => handleChange('noteDeadlineDays', Math.max(1, Math.min(14, Number(e.target.value))))}
                    className="w-24 bg-stone-50 rounded-xl px-4 py-4 text-3xl font-bold text-stone-800 border-2 border-transparent focus:outline-none focus:border-amber-300 focus:bg-white transition-all text-center"
                    style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                  />
                  <span className="text-stone-500 font-medium text-lg">days after session</span>
                </div>
              </div>
            </ConfigCard>
          </AnimatedSection>
        </Grid>

        {/* Revenue & Rebook Thresholds */}
        <Grid cols={2}>
          <AnimatedSection delay={0.3}>
            <ConfigCard>
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <DollarSign size={24} className="text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-800">Revenue Status</h3>
                </div>
                <div className="space-y-6">
                  <SliderInput
                    label="Healthy above"
                    value={localThresholds.revenueHealthy}
                    onChange={(v) => handleChange('revenueHealthy', v)}
                    min={50}
                    max={100}
                    suffix="% of goal"
                    colorStart="#10b981"
                    colorEnd="#10b981"
                  />
                  <SliderInput
                    label="Critical below"
                    value={localThresholds.revenueCritical}
                    onChange={(v) => handleChange('revenueCritical', v)}
                    min={50}
                    max={100}
                    suffix="% of goal"
                    colorStart="#ef4444"
                    colorEnd="#ef4444"
                  />
                </div>
              </div>
            </ConfigCard>
          </AnimatedSection>

          <AnimatedSection delay={0.35}>
            <ConfigCard>
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <TrendingUp size={24} className="text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-800">Rebook Rate Status</h3>
                </div>
                <div className="space-y-6">
                  <SliderInput
                    label="Healthy above"
                    value={localThresholds.rebookHealthy}
                    onChange={(v) => handleChange('rebookHealthy', v)}
                    min={50}
                    max={100}
                    colorStart="#10b981"
                    colorEnd="#10b981"
                  />
                  <SliderInput
                    label="Critical below"
                    value={localThresholds.rebookCritical}
                    onChange={(v) => handleChange('rebookCritical', v)}
                    min={50}
                    max={100}
                    colorStart="#ef4444"
                    colorEnd="#ef4444"
                  />
                </div>
              </div>
            </ConfigCard>
          </AnimatedSection>
        </Grid>
      </div>
    </div>
  );
};
