import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useSettings,
  FollowUpPreset,
  ConsultationPipelineConfig,
  PresetDetails,
  NO_SHOW_PRESETS,
  INTAKE_PRESETS,
  PAPERWORK_PRESETS,
} from '../../context/SettingsContext';
import {
  Check,
  ArrowRight,
  ArrowDown,
  Sliders,
  Calendar,
  CalendarCheck,
  Clock,
  FileText,
  UserX,
  Mail,
  Users,
  MessageSquare,
  GitBranch,
  Send,
  PartyPopper,
  XCircle,
  RefreshCw,
} from 'lucide-react';

// =============================================================================
// CONSULTATION FLOW TAB
// =============================================================================
// Configurable consultation pipeline with visual flow preview.
// Allows practices to customize their workflow timing and follow-up sequences.
// Uses SettingsContext for persistence.
// =============================================================================

// Toggle Switch Component - defined outside to prevent re-creation
const ConsultToggleSwitch: React.FC<{
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label: string;
  description?: string;
}> = ({ enabled, onChange, label, description }) => (
  <div className="flex items-start justify-between gap-4">
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-base text-stone-800">{label}</p>
      {description && <p className="text-sm text-stone-500 mt-1 leading-relaxed">{description}</p>}
    </div>
    <button
      onClick={() => onChange(!enabled)}
      className={`
        relative w-16 h-9 rounded-full transition-colors duration-200 flex-shrink-0 mt-0.5
        ${enabled
          ? 'bg-gradient-to-r from-cyan-500 to-teal-500'
          : 'bg-stone-200'
        }
      `}
    >
      <div
        className={`
          absolute top-1.5 w-6 h-6 rounded-full bg-white shadow-md
          transition-transform duration-200 ease-out
          ${enabled ? 'translate-x-8' : 'translate-x-1.5'}
        `}
      />
    </button>
  </div>
);

// Unified Preset Selector - shows label, description, and sequence in one component
const ConsultPresetSelector: React.FC<{
  value: FollowUpPreset;
  onChange: (value: FollowUpPreset) => void;
  presets: Record<FollowUpPreset, PresetDetails>;
}> = ({ value, onChange, presets }) => (
  <div className="space-y-3">
    {(['aggressive', 'standard', 'relaxed'] as FollowUpPreset[]).map((preset) => {
      const details = presets[preset];
      const isSelected = value === preset;
      return (
        <button
          key={preset}
          onClick={() => onChange(preset)}
          className={`
            w-full p-4 rounded-xl text-left transition-all duration-200
            ${isSelected
              ? 'bg-white text-stone-900 shadow-lg ring-2 ring-stone-900 ring-offset-2'
              : 'bg-stone-50 hover:bg-stone-100 border border-stone-200'
            }
          `}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`font-bold text-base ${isSelected ? 'text-stone-900' : 'text-stone-800'}`}>
              {details.label}
            </span>
            <span className={`text-sm ${isSelected ? 'text-stone-600' : 'text-stone-500'}`}>
              {details.description}
            </span>
          </div>
          {/* Timing sequence */}
          <div className="flex items-center gap-2 flex-wrap">
            {details.sequence.map((timing, idx, arr) => (
              <React.Fragment key={idx}>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-stone-900' : 'bg-cyan-500'}`} />
                  <span className={`text-sm font-medium ${isSelected ? 'text-stone-700' : 'text-stone-600'}`}>
                    {timing}
                  </span>
                </div>
                {idx < arr.length - 1 && (
                  <ArrowRight size={14} className={isSelected ? 'text-stone-400' : 'text-stone-400'} />
                )}
              </React.Fragment>
            ))}
          </div>
        </button>
      );
    })}
  </div>
);

// Configuration Card Component - consistent height design system card
const ConsultConfigCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: string;
  children: React.ReactNode;
}> = ({ icon, title, subtitle, color, children }) => (
  <div className="h-full bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col">
    {/* Accent bar */}
    <div className="h-1" style={{ background: color }} />
    <div className="p-6 flex-1 flex flex-col">
      <div className="flex items-start gap-4 mb-5">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}15`, color }}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3
            className="text-lg font-bold text-stone-800"
            style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
          >
            {title}
          </h3>
          <p className="text-sm text-stone-500">{subtitle}</p>
        </div>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  </div>
);

export const ConsultationFlowTab: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const savedConfig = settings.consultationPipeline;
  const [config, setConfig] = useState<ConsultationPipelineConfig>(savedConfig);
  const [activeView, setActiveView] = useState<'configure' | 'preview'>('configure');

  // Check if current config differs from saved config
  const hasChanges = JSON.stringify(config) !== JSON.stringify(savedConfig);

  const updateConfig = useCallback(<K extends keyof ConsultationPipelineConfig>(key: K, value: ConsultationPipelineConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = () => {
    // Persist to SettingsContext (which saves to localStorage)
    updateSettings({ consultationPipeline: config });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2
              className="text-3xl font-bold text-stone-800"
              style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
            >
              Consultation Pipeline
            </h2>
            <p className="text-stone-500 text-lg mt-1">
              Configure how clients flow from booking to conversion
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Save Button */}
            <AnimatePresence>
              {hasChanges && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  className="px-6 py-2.5 rounded-xl font-semibold text-white flex items-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <Check size={18} />
                  Save Changes
                </motion.button>
              )}
            </AnimatePresence>
            {/* View Toggle */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-stone-100">
              <button
                onClick={() => setActiveView('configure')}
                className={`
                  px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-200
                  ${activeView === 'configure'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-700'
                  }
                `}
              >
                <span className="flex items-center gap-2">
                  <Sliders size={16} />
                  Configure
                </span>
              </button>
              <button
                onClick={() => setActiveView('preview')}
                className={`
                  px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-200
                  ${activeView === 'preview'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-700'
                  }
                `}
              >
                <span className="flex items-center gap-2">
                  <ArrowRight size={16} />
                  Preview Flow
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content - no AnimatePresence to prevent reload effect */}
      <div className={activeView === 'configure' ? 'block' : 'hidden'}>
        {/* Configuration Grid - 2x2 equal height cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 auto-rows-fr">
          {/* Pre-Consultation Settings */}
          <ConsultConfigCard
            icon={<CalendarCheck size={24} />}
            title="Pre-Consultation"
            subtitle="Settings before the consultation happens"
            color="#06b6d4"
          >
            <div className="space-y-6">
              <ConsultToggleSwitch
                enabled={config.requireConfirmation}
                onChange={(v) => updateConfig('requireConfirmation', v)}
                label="Require Manual Confirmation"
                description="Clinician manually confirms each booking. Disable if Acuity auto-confirms."
              />
              <div className="border-t border-stone-100 pt-6">
                <ConsultToggleSwitch
                  enabled={config.enableSecondConsult}
                  onChange={(v) => updateConfig('enableSecondConsult', v)}
                  label="Enable Second Consult Option"
                  description="Allow clients to request a second consultation before intake."
                />
              </div>
            </div>
          </ConsultConfigCard>

          {/* No-Show Recovery */}
          <ConsultConfigCard
            icon={<UserX size={24} />}
            title="No-Show Recovery"
            subtitle="When clients miss their consultation"
            color="#f43f5e"
          >
            <ConsultPresetSelector
              value={config.noShowPreset}
              onChange={(v) => updateConfig('noShowPreset', v)}
              presets={NO_SHOW_PRESETS}
            />
          </ConsultConfigCard>

          {/* Intake Scheduling */}
          <ConsultConfigCard
            icon={<Clock size={24} />}
            title="Intake Scheduling"
            subtitle="When intake isn't booked during consult"
            color="#f59e0b"
          >
            <ConsultPresetSelector
              value={config.intakePreset}
              onChange={(v) => updateConfig('intakePreset', v)}
              presets={INTAKE_PRESETS}
            />
          </ConsultConfigCard>

          {/* Paperwork Reminders */}
          <ConsultConfigCard
            icon={<FileText size={24} />}
            title="Paperwork Reminders"
            subtitle="Reminders before intake appointment"
            color="#8b5cf6"
          >
            <div>
              <ConsultPresetSelector
                value={config.paperworkPreset}
                onChange={(v) => updateConfig('paperworkPreset', v)}
                presets={PAPERWORK_PRESETS}
              />
              <p className="text-sm text-stone-500 mt-4">
                T-72hr means 72 hours before the scheduled intake
              </p>
            </div>
          </ConsultConfigCard>
        </div>

        {/* Summary Card */}
        <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-stone-800 to-stone-900 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <Check size={24} className="text-emerald-400" />
            </div>
            <div className="flex-1">
              <h3
                className="text-xl font-bold mb-2"
                style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
              >
                Your Pipeline Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="p-3 rounded-xl bg-white/5">
                  <p className="text-xs text-stone-400 uppercase tracking-wider">Confirmation</p>
                  <p className="text-lg font-semibold mt-1">
                    {config.requireConfirmation ? 'Manual' : 'Auto'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/5">
                  <p className="text-xs text-stone-400 uppercase tracking-wider">No-Show Recovery</p>
                  <p className="text-lg font-semibold mt-1">
                    {NO_SHOW_PRESETS[config.noShowPreset].label}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {NO_SHOW_PRESETS[config.noShowPreset].sequence.length} follow-ups
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/5">
                  <p className="text-xs text-stone-400 uppercase tracking-wider">Intake Follow-ups</p>
                  <p className="text-lg font-semibold mt-1">
                    {INTAKE_PRESETS[config.intakePreset].label}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {INTAKE_PRESETS[config.intakePreset].sequence.length} reminders
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/5">
                  <p className="text-xs text-stone-400 uppercase tracking-wider">Paperwork</p>
                  <p className="text-lg font-semibold mt-1">
                    {PAPERWORK_PRESETS[config.paperworkPreset].label}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {PAPERWORK_PRESETS[config.paperworkPreset].sequence.length} reminders
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Flow View */}
      <div className={activeView === 'preview' ? 'block' : 'hidden'}>
        {/* Visual Flow Preview - Design System Aligned */}
        <div className="space-y-8">

          {/* ═══════════════════════════════════════════════════════════════════
              PHASE 1: PRE-CONSULTATION JOURNEY
              White card with horizontal flow, matching design system
          ═══════════════════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
            {/* Cyan accent bar */}
            <div className="h-1 bg-gradient-to-r from-cyan-500 to-teal-500" />

            <div className="p-8 lg:p-10">
              {/* Section Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-100 to-cyan-50 flex items-center justify-center">
                  <span className="text-cyan-600 font-black text-xl">1</span>
                </div>
                <div>
                  <h3
                    className="text-2xl font-bold text-stone-800"
                    style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                  >
                    Pre-Consultation
                  </h3>
                  <p className="text-stone-500 text-base">From booking to consultation day</p>
                </div>
              </div>

              {/* Horizontal Flow */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                {/* Step 1: Client Books */}
                <div className="w-full sm:w-auto">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-sky-50 to-white border-2 border-sky-200 text-center min-w-[160px]">
                    <div className="w-14 h-14 rounded-2xl bg-sky-100 flex items-center justify-center mx-auto mb-3">
                      <Calendar size={28} className="text-sky-600" />
                    </div>
                    <p className="text-stone-800 font-bold text-lg">Client Books</p>
                    <p className="text-sky-600 text-sm font-medium mt-1">via Acuity</p>
                    <span className="inline-block mt-3 px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-bold uppercase tracking-wider">
                      Automatic
                    </span>
                  </div>
                </div>

                <ArrowRight size={28} className="text-stone-300 hidden sm:block flex-shrink-0" />
                <ArrowDown size={28} className="text-stone-300 sm:hidden flex-shrink-0" />

                {/* Step 2: Confirmation (conditional) */}
                {config.requireConfirmation && (
                  <>
                    <div className="w-full sm:w-auto">
                      <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-50 to-white border-2 border-cyan-200 text-center min-w-[160px]">
                        <div className="w-14 h-14 rounded-2xl bg-cyan-100 flex items-center justify-center mx-auto mb-3">
                          <Mail size={28} className="text-cyan-600" />
                        </div>
                        <p className="text-stone-800 font-bold text-lg">Send Confirmation</p>
                        <p className="text-cyan-600 text-sm font-medium mt-1">Email to client</p>
                        <span className="inline-block mt-3 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider">
                          Manual
                        </span>
                      </div>
                    </div>
                    <ArrowRight size={28} className="text-stone-300 hidden sm:block flex-shrink-0" />
                    <ArrowDown size={28} className="text-stone-300 sm:hidden flex-shrink-0" />
                  </>
                )}

                {/* Step 3: Confirmed / Waiting */}
                <div className="w-full sm:w-auto">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-white border-2 border-indigo-200 text-center min-w-[160px]">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-3">
                      <CalendarCheck size={28} className="text-indigo-600" />
                    </div>
                    <p className="text-stone-800 font-bold text-lg">Confirmed</p>
                    <p className="text-indigo-600 text-sm font-medium mt-1">Awaiting consult</p>
                    <span className="inline-block mt-3 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                      Waiting
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              DECISION POINT: CONSULTATION OCCURS
          ═══════════════════════════════════════════════════════════════════ */}
          <div className="relative py-4">
            <div className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-stone-300 to-transparent" />
            <div className="relative flex justify-center">
              <div className="px-8 py-4 rounded-2xl bg-gradient-to-br from-stone-800 to-stone-900 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Users size={22} className="text-white" />
                  </div>
                  <span className="text-white font-bold text-lg">Consultation</span>
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              PHASE 2: TWO OUTCOME TRACKS
              Side by side cards - Attended vs No-Show
          ═══════════════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* ─────────────────────────────────────────────────────────────────
                LEFT TRACK: ATTENDED (Success Path)
            ───────────────────────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
              {/* Emerald accent bar */}
              <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />

              <div className="p-8">
                {/* Track Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
                    <Check size={24} className="text-emerald-600" />
                  </div>
                  <div>
                    <h4
                      className="text-xl font-bold text-stone-800"
                      style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                    >
                      Client Attended
                    </h4>
                    <p className="text-emerald-600 text-sm font-medium">Happy path to conversion</p>
                  </div>
                </div>

                {/* Step: Mark Outcome */}
                <div className="mb-6 p-5 rounded-xl bg-stone-50 border border-stone-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <MessageSquare size={22} className="text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-stone-800 font-bold text-base">Mark Outcome & Follow Up</p>
                      <p className="text-stone-500 text-sm">Record consultation result, send next steps</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase">
                      Manual
                    </span>
                  </div>
                </div>

                {/* Decision: Did they book intake? */}
                <div className="p-5 rounded-xl bg-gradient-to-br from-stone-50 to-white border border-stone-200">
                  <p className="text-stone-600 font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                    <GitBranch size={16} />
                    Did they book intake during consult?
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* YES Branch */}
                    <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-50 to-white border-2 border-emerald-200">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                          <Check size={18} className="text-white" />
                        </div>
                        <span className="text-emerald-700 font-bold text-base">Yes</span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <FileText size={18} className="text-violet-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-stone-700 font-semibold text-sm">Paperwork Reminders</p>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {PAPERWORK_PRESETS[config.paperworkPreset].sequence.map((t, i) => (
                                <span key={i} className="px-2 py-1 rounded-lg bg-violet-100 text-violet-700 text-xs font-bold">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-emerald-200 flex items-center gap-2">
                          <PartyPopper size={18} className="text-emerald-500" />
                          <span className="text-emerald-700 font-bold text-sm">Converted!</span>
                        </div>
                      </div>
                    </div>

                    {/* NO Branch */}
                    <div className="p-5 rounded-xl bg-gradient-to-br from-amber-50 to-white border-2 border-amber-200">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
                          <Clock size={18} className="text-white" />
                        </div>
                        <span className="text-amber-700 font-bold text-base">Not Yet</span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Send size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-stone-700 font-semibold text-sm">Scheduling Follow-ups</p>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {INTAKE_PRESETS[config.intakePreset].sequence.map((t, i) => (
                                <span key={i} className="px-2 py-1 rounded-lg bg-amber-100 text-amber-700 text-xs font-bold">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-amber-200 space-y-2">
                          <div className="flex items-center gap-2">
                            <Check size={18} className="text-emerald-500" />
                            <span className="text-stone-700 text-sm font-medium">Books → Paperwork flow</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <XCircle size={18} className="text-stone-400" />
                            <span className="text-stone-600 text-sm font-medium">No response → Lost</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ─────────────────────────────────────────────────────────────────
                RIGHT TRACK: NO-SHOW (Recovery Path)
            ───────────────────────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
              {/* Rose accent bar */}
              <div className="h-1 bg-gradient-to-r from-rose-500 to-pink-500" />

              <div className="p-8">
                {/* Track Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center">
                    <UserX size={24} className="text-rose-600" />
                  </div>
                  <div>
                    <h4
                      className="text-xl font-bold text-stone-800"
                      style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                    >
                      Client No-Show
                    </h4>
                    <p className="text-rose-600 text-sm font-medium">Recovery sequence activated</p>
                  </div>
                </div>

                {/* Recovery Attempts */}
                <div className="mb-6 p-5 rounded-xl bg-stone-50 border border-stone-200">
                  <p className="text-stone-600 font-bold text-sm uppercase tracking-wider mb-4">
                    Follow-up Attempts ({NO_SHOW_PRESETS[config.noShowPreset].sequence.length})
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    {NO_SHOW_PRESETS[config.noShowPreset].sequence.map((timing, idx, arr) => (
                      <React.Fragment key={idx}>
                        <div className="flex-shrink-0">
                          <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-white border-2 border-orange-200 text-center min-w-[100px]">
                            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center mx-auto mb-2">
                              <Send size={20} className="text-orange-600" />
                            </div>
                            <p className="text-stone-800 font-bold text-base">#{idx + 1}</p>
                            <p className="text-orange-600 text-sm font-medium mt-0.5">{timing}</p>
                          </div>
                        </div>
                        {idx < arr.length - 1 && (
                          <ArrowRight size={24} className="text-stone-300 flex-shrink-0 hidden sm:block" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Outcomes */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-50 to-white border-2 border-emerald-200 text-center">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                      <RefreshCw size={22} className="text-emerald-600" />
                    </div>
                    <p className="text-stone-800 font-bold text-base">Reschedules</p>
                    <p className="text-emerald-600 text-sm mt-1">→ Back to Confirmed</p>
                  </div>

                  <div className="p-5 rounded-xl bg-gradient-to-br from-stone-100 to-white border-2 border-stone-200 text-center">
                    <div className="w-12 h-12 rounded-xl bg-stone-200 flex items-center justify-center mx-auto mb-3">
                      <XCircle size={22} className="text-stone-500" />
                    </div>
                    <p className="text-stone-800 font-bold text-base">No Response</p>
                    <p className="text-stone-500 text-sm mt-1">→ Marked as Lost</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              TERMINAL STATES
          ═══════════════════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              {/* Converted */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 border-2 border-emerald-200 flex items-center justify-center">
                  <PartyPopper size={32} className="text-emerald-600" />
                </div>
                <div>
                  <p
                    className="text-xl font-bold text-emerald-600"
                    style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                  >
                    Converted
                  </p>
                  <p className="text-stone-500 text-sm">First session completed</p>
                </div>
              </div>

              <div className="w-px h-16 bg-stone-200 hidden sm:block" />
              <div className="w-full h-px bg-stone-200 sm:hidden" />

              {/* Lost */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-stone-100 to-stone-50 border-2 border-stone-200 flex items-center justify-center">
                  <XCircle size={32} className="text-stone-400" />
                </div>
                <div>
                  <p
                    className="text-xl font-bold text-stone-500"
                    style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                  >
                    Lost
                  </p>
                  <p className="text-stone-400 text-sm">Dropped off pipeline</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
