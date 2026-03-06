import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight,
  ArrowDownRight,
  X,
  Clock,
  CalendarRange,
  Calendar,
  History,
  Crosshair,
  Users,
} from 'lucide-react';
import { Clinician } from './shared';
import {
  useSettings,
  ClinicianGoalHistory,
  GoalType,
  generateGoalPeriodId,
  getGoalTypePeriods,
  getCurrentGoalTypePeriod,
} from '../../context/SettingsContext';
import { GoalHistoryModal } from './GoalHistory';

// =============================================================================
// DESIGN TOKENS — Ink & Ledger
// =============================================================================

const SERIF = "'Tiempos Headline', Georgia, serif";
const SANS = "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif";

const INK = '#0F0F0F';
const PAPER = '#FAF9F6';
const RULE = '#E8E5DF';
const FADED = '#A8A29E';
const BODY = '#6B6560';

const SESSIONS = {
  accent: '#C24D38',
  bg: '#C24D380D',
  goalType: 'sessionGoal' as GoalType,
  label: 'Sessions',
  fullLabel: 'Sessions per Week',
  unit: '/wk',
};

const CLIENTS = {
  accent: '#1A7A6D',
  bg: '#1A7A6D0D',
  goalType: 'clientGoal' as GoalType,
  label: 'Clients',
  fullLabel: 'Active Clients',
  unit: '',
};

type MetricKey = 'sessions' | 'clients';
const METRICS: Record<MetricKey, typeof SESSIONS> = { sessions: SESSIONS, clients: CLIENTS };

// =============================================================================
// DATE UTILS
// =============================================================================

const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const fmtMonth = (s: string) =>
  new Date(s + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

const firstOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);

const prevMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() - 1, 1);

// =============================================================================
// SET GOAL PANEL — Full right slide-over, 2-step flow
// =============================================================================

const SetGoalPanel: React.FC<{
  clinician: Clinician;
  getCurrentGoal: (id: string, type: GoalType) => number;
  onSave: (clinicianId: string, metric: MetricKey, value: number, date: string) => void;
  onClose: () => void;
}> = ({ clinician, getCurrentGoal, onSave, onClose }) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey | null>(null);
  const [value, setValue] = useState('');
  const [dateMode, setDateMode] = useState<'this' | 'last' | 'custom'>('this');
  const [customMonth, setCustomMonth] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const today = new Date();
  const metric = selectedMetric ? METRICS[selectedMetric] : null;
  const currentValue = selectedMetric
    ? getCurrentGoal(clinician.id, METRICS[selectedMetric].goalType)
    : 0;

  useEffect(() => {
    if (selectedMetric) {
      setValue(String(currentValue));
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 200);
    }
  }, [selectedMetric, currentValue]);

  const effectiveDate =
    dateMode === 'this' ? toISO(firstOf(today))
    : dateMode === 'last' ? toISO(prevMonth(today))
    : customMonth ? `${customMonth}-01`
    : toISO(firstOf(today));

  const parsed = parseInt(value, 10);
  const isValid = !isNaN(parsed) && parsed > 0 && parsed !== currentValue;
  const delta = parsed - currentValue;

  const dateOptions: { key: typeof dateMode; label: string; sub: string; icon: React.ReactNode }[] = [
    { key: 'this', label: 'This month', sub: fmtMonth(toISO(firstOf(today))), icon: <CalendarRange size={15} /> },
    { key: 'last', label: 'Last month', sub: fmtMonth(toISO(prevMonth(today))), icon: <Clock size={15} /> },
    { key: 'custom', label: 'Pick a month', sub: customMonth ? fmtMonth(`${customMonth}-01`) : 'Backdate further', icon: <Calendar size={15} /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex justify-end"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(15, 15, 15, 0.25)', backdropFilter: 'blur(3px)' }}
      />

      {/* Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-md h-full overflow-y-auto"
        style={{
          backgroundColor: '#FFFFFF',
          boxShadow: '-24px 0 80px rgba(0,0,0,0.12)',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-7 right-7 p-2 rounded-lg transition-colors"
          style={{ color: FADED }}
          onMouseEnter={e => (e.currentTarget.style.color = INK)}
          onMouseLeave={e => (e.currentTarget.style.color = FADED)}
        >
          <X size={18} />
        </button>

        <div className="px-10 pt-14 pb-10">
          {/* Panel title */}
          <div className="mb-10">
            <p style={{ fontFamily: SANS, fontSize: 11, color: FADED, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
              {clinician.name}
            </p>
            <h2 style={{ fontFamily: SERIF, fontSize: 30, color: INK, lineHeight: 1.15, marginTop: 6 }}>
              Set New Goal
            </h2>
          </div>

          {/* STEP 1: Choose metric */}
          <div className="mb-10">
            <p style={{ fontFamily: SANS, fontSize: 11, color: FADED, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>
              Which goal?
            </p>
            <div className="space-y-2">
              {(['sessions', 'clients'] as MetricKey[]).map(key => {
                const m = METRICS[key];
                const active = selectedMetric === key;
                const cur = getCurrentGoal(clinician.id, m.goalType);
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedMetric(key)}
                    className="w-full flex items-center justify-between px-5 py-4 rounded-xl transition-all text-left"
                    style={{
                      backgroundColor: active ? INK : '#FAFAF9',
                      border: active ? 'none' : `1px solid ${RULE}`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: active ? m.accent : RULE }}
                      />
                      <div>
                        <span style={{
                          fontFamily: SANS,
                          fontSize: 14,
                          fontWeight: 600,
                          color: active ? '#FFFFFF' : INK,
                          display: 'block',
                        }}>
                          {m.fullLabel}
                        </span>
                        <span style={{
                          fontFamily: SANS,
                          fontSize: 11,
                          color: active ? FADED : BODY,
                        }}>
                          Currently {cur}{m.unit}
                        </span>
                      </div>
                    </div>
                    {active && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: m.accent }}
                      >
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </motion.div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: Set value + date (only if metric selected) */}
          <AnimatePresence>
            {selectedMetric && metric && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.3 }}
              >
                {/* Value input */}
                <div className="mb-10">
                  <p style={{ fontFamily: SANS, fontSize: 11, color: FADED, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>
                    New Target
                  </p>
                  <div
                    className="flex items-baseline gap-3 pb-3"
                    style={{ borderBottom: `2.5px solid ${metric.accent}` }}
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      inputMode="numeric"
                      value={value}
                      onChange={e => setValue(e.target.value.replace(/[^0-9]/g, ''))}
                      className="bg-transparent focus:outline-none"
                      style={{
                        fontFamily: SERIF,
                        fontSize: 52,
                        color: INK,
                        width: '4ch',
                        lineHeight: 1,
                      }}
                    />
                    {metric.unit && (
                      <span style={{ fontFamily: SANS, fontSize: 16, color: FADED }}>
                        {metric.unit}
                      </span>
                    )}
                  </div>
                  {isValid && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-1.5 mt-3"
                    >
                      {delta > 0
                        ? <ArrowUpRight size={14} style={{ color: CLIENTS.accent }} />
                        : <ArrowDownRight size={14} style={{ color: SESSIONS.accent }} />
                      }
                      <span style={{
                        fontFamily: SANS,
                        fontSize: 13,
                        fontWeight: 600,
                        color: delta > 0 ? CLIENTS.accent : SESSIONS.accent,
                      }}>
                        {delta > 0 ? '+' : ''}{delta} from {currentValue}
                      </span>
                    </motion.div>
                  )}
                </div>

                {/* Effective date */}
                <div className="mb-12">
                  <p style={{ fontFamily: SANS, fontSize: 11, color: FADED, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>
                    Effective From
                  </p>
                  <div className="space-y-2">
                    {dateOptions.map(opt => {
                      const active = dateMode === opt.key;
                      return (
                        <button
                          key={opt.key}
                          onClick={() => setDateMode(opt.key)}
                          className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all text-left"
                          style={{
                            backgroundColor: active ? INK : 'transparent',
                            border: active ? 'none' : `1px solid ${RULE}`,
                          }}
                        >
                          <span style={{ color: active ? '#FAFAF7' : FADED }}>{opt.icon}</span>
                          <div className="flex-1">
                            <span style={{
                              fontFamily: SANS, fontSize: 14, fontWeight: 600,
                              color: active ? '#FAFAF7' : INK, display: 'block',
                            }}>
                              {opt.label}
                            </span>
                            <span style={{
                              fontFamily: SANS, fontSize: 11,
                              color: active ? FADED : BODY,
                            }}>
                              {opt.sub}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <AnimatePresence>
                    {dateMode === 'custom' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <input
                          type="month"
                          value={customMonth}
                          max={`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`}
                          onChange={e => setCustomMonth(e.target.value)}
                          className="mt-3 w-full px-4 py-3 rounded-xl focus:outline-none"
                          style={{
                            fontFamily: SANS, fontSize: 14, color: INK,
                            border: `1px solid ${RULE}`, backgroundColor: '#FAFAF9',
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Summary + save */}
                {isValid && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-xl mb-8"
                    style={{ backgroundColor: `${metric.accent}08`, border: `1px solid ${metric.accent}15` }}
                  >
                    <p style={{ fontFamily: SANS, fontSize: 11, color: FADED, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                      Summary
                    </p>
                    <p style={{ fontFamily: SANS, fontSize: 14, color: INK, lineHeight: 1.6 }}>
                      <strong>{clinician.name}</strong>'s {metric.label.toLowerCase()} goal changes from{' '}
                      <strong>{currentValue}</strong> to <strong>{parsed}</strong>{metric.unit},{' '}
                      effective <strong>{fmtMonth(effectiveDate)}</strong>.
                    </p>
                  </motion.div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 py-4 rounded-xl transition-colors"
                    style={{
                      fontFamily: SANS, fontSize: 14, fontWeight: 600, color: BODY,
                      border: `1px solid ${RULE}`,
                    }}
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={isValid ? { scale: 1.01 } : {}}
                    whileTap={isValid ? { scale: 0.98 } : {}}
                    onClick={() => isValid && selectedMetric && onSave(clinician.id, selectedMetric, parsed, effectiveDate)}
                    disabled={!isValid}
                    className="flex-[2] py-4 rounded-xl transition-all"
                    style={{
                      fontFamily: SANS, fontSize: 14, fontWeight: 700,
                      color: isValid ? '#FFFFFF' : '#C8C4BC',
                      backgroundColor: isValid ? INK : '#F0EEEB',
                      letterSpacing: '0.02em',
                    }}
                  >
                    Save Goal
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

// =============================================================================
// CLINICIAN ROW — single ledger row with clear visual hierarchy
// =============================================================================

const ClinicianRow: React.FC<{
  clinician: Clinician;
  sessionGoal: number;
  clientGoal: number;
  onSetGoal: () => void;
  onViewHistory: () => void;
  index: number;
}> = ({ clinician, sessionGoal, clientGoal, onSetGoal, onViewHistory, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="group"
      style={{ borderBottom: `1px solid ${RULE}` }}
    >
      <div className="flex items-center py-6 gap-6">
        {/* Color bar */}
        <div
          className="w-1 self-stretch rounded-full flex-shrink-0"
          style={{ backgroundColor: clinician.color, minHeight: 48 }}
        />

        {/* Name block */}
        <div className="flex-1 min-w-0">
          <h3 style={{
            fontFamily: SERIF,
            fontSize: 22,
            color: INK,
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
          }}>
            {clinician.name}
          </h3>
          <p style={{
            fontFamily: SANS,
            fontSize: 11,
            color: FADED,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontWeight: 500,
            marginTop: 2,
          }}>
            {clinician.role}
          </p>
        </div>

        {/* Goal numbers */}
        <div className="flex items-center gap-8">
          {/* Sessions */}
          <div className="text-right min-w-[80px]">
            <p style={{
              fontFamily: SANS, fontSize: 10, fontWeight: 600,
              color: SESSIONS.accent, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 1,
            }}>
              Sessions
            </p>
            <div className="flex items-baseline justify-end gap-1">
              <span style={{ fontFamily: SERIF, fontSize: 32, color: INK, lineHeight: 1 }}>
                {sessionGoal}
              </span>
              <span style={{ fontFamily: SANS, fontSize: 12, color: FADED }}>/wk</span>
            </div>
          </div>

          {/* Clients */}
          <div className="text-right min-w-[80px]">
            <p style={{
              fontFamily: SANS, fontSize: 10, fontWeight: 600,
              color: CLIENTS.accent, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 1,
            }}>
              Clients
            </p>
            <span style={{ fontFamily: SERIF, fontSize: 32, color: INK, lineHeight: 1 }}>
              {clientGoal}
            </span>
          </div>
        </div>

        {/* Action buttons — appear on hover, always accessible */}
        <div className="flex items-center gap-2 ml-4">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onSetGoal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all"
            style={{
              fontFamily: SANS,
              fontSize: 12,
              fontWeight: 700,
              color: '#FFFFFF',
              backgroundColor: INK,
              letterSpacing: '0.02em',
            }}
          >
            <Crosshair size={13} />
            Set Goal
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onViewHistory}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all"
            style={{
              fontFamily: SANS,
              fontSize: 12,
              fontWeight: 600,
              color: BODY,
              backgroundColor: '#F5F3F0',
              letterSpacing: '0.02em',
            }}
          >
            <History size={13} />
            History
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const ClinicianGoalsTab: React.FC<{
  clinicians: Clinician[];
  onUpdate: (clinicians: Clinician[]) => void;
}> = ({ clinicians, onUpdate }) => {
  const { settings, updateSettings } = useSettings();
  const goalHistory = settings.clinicianGoalHistory || {};

  const [goalPanel, setGoalPanel] = useState<string | null>(null); // clinician ID
  const [historyModal, setHistoryModal] = useState<string | null>(null); // clinician ID

  const active = useMemo(() => clinicians.filter(c => c.isActive), [clinicians]);

  const getCurrentGoal = useCallback(
    (clinicianId: string, goalType: GoalType): number => {
      const period = getCurrentGoalTypePeriod(clinicianId, goalType, goalHistory);
      if (period) return period.value;
      const c = clinicians.find(cl => cl.id === clinicianId);
      if (!c) return 0;
      if (goalType === 'sessionGoal') return c.sessionGoal;
      if (goalType === 'clientGoal') return c.clientGoal;
      return 0;
    },
    [goalHistory, clinicians]
  );

  const totals = useMemo(() => active.reduce(
    (acc, c) => ({
      sessions: acc.sessions + getCurrentGoal(c.id, 'sessionGoal'),
      clients: acc.clients + getCurrentGoal(c.id, 'clientGoal'),
    }),
    { sessions: 0, clients: 0 }
  ), [active, getCurrentGoal]);

  // Initialize goal history from defaults when opening history or setting goals
  const ensureHistory = useCallback((clinicianId: string) => {
    const c = clinicians.find(cl => cl.id === clinicianId);
    if (!c) return;
    const h = { ...goalHistory };
    let changed = false;
    for (const key of ['sessionGoal', 'clientGoal'] as GoalType[]) {
      if (getGoalTypePeriods(clinicianId, key, goalHistory).length === 0) {
        if (!h[clinicianId]) h[clinicianId] = {};
        h[clinicianId][key] = [{
          id: generateGoalPeriodId(),
          startDate: c.startDate,
          endDate: null,
          value: key === 'sessionGoal' ? c.sessionGoal : c.clientGoal,
        }];
        changed = true;
      }
    }
    if (changed) updateSettings({ clinicianGoalHistory: h });
  }, [goalHistory, clinicians, updateSettings]);

  const handleSaveGoal = useCallback(
    (clinicianId: string, metric: MetricKey, value: number, effectiveDate: string) => {
      const goalType = METRICS[metric].goalType;
      const h = { ...goalHistory };
      if (!h[clinicianId]) h[clinicianId] = {};
      const existing = [...(h[clinicianId][goalType] || [])];

      // Close current open period
      const currentIdx = existing.findIndex(p => p.endDate === null);
      if (currentIdx >= 0) {
        const endDate = new Date(effectiveDate + 'T00:00:00');
        endDate.setDate(endDate.getDate() - 1);
        existing[currentIdx] = { ...existing[currentIdx], endDate: toISO(endDate) };
      }

      existing.push({ id: generateGoalPeriodId(), startDate: effectiveDate, endDate: null, value });
      h[clinicianId] = { ...h[clinicianId], [goalType]: existing };
      updateSettings({ clinicianGoalHistory: h });

      // Sync flat model
      const prop = metric === 'sessions' ? 'sessionGoal' : 'clientGoal';
      onUpdate(clinicians.map(c => c.id === clinicianId ? { ...c, [prop]: value } : c));
      setGoalPanel(null);
    },
    [goalHistory, clinicians, onUpdate, updateSettings]
  );

  const panelClinician = goalPanel ? clinicians.find(c => c.id === goalPanel) : null;
  const historyClinician = historyModal ? clinicians.find(c => c.id === historyModal) : null;

  return (
    <div style={{ backgroundColor: PAPER, minHeight: '100%' }}>
      {/* Spacer for top alignment */}
      <div className="mb-2" />

      {/* Totals strip */}
      {active.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex items-baseline gap-8 pt-6 pb-8 mb-2"
          style={{ borderBottom: `1.5px solid ${INK}` }}
        >
          <div className="flex items-baseline gap-2.5">
            <span style={{ fontFamily: SERIF, fontSize: 36, color: INK, lineHeight: 1 }}>
              {totals.sessions}
            </span>
            <span style={{ fontFamily: SANS, fontSize: 13, color: SESSIONS.accent, fontWeight: 600 }}>
              sessions/wk
            </span>
          </div>
          <div style={{ width: 1, height: 28, backgroundColor: RULE, alignSelf: 'center' }} />
          <div className="flex items-baseline gap-2.5">
            <span style={{ fontFamily: SERIF, fontSize: 36, color: INK, lineHeight: 1 }}>
              {totals.clients}
            </span>
            <span style={{ fontFamily: SANS, fontSize: 13, color: CLIENTS.accent, fontWeight: 600 }}>
              clients
            </span>
          </div>
          <span style={{ fontFamily: SANS, fontSize: 12, color: FADED, marginLeft: 'auto' }}>
            {active.length} active clinician{active.length !== 1 ? 's' : ''}
          </span>
        </motion.div>
      )}

      {/* Clinician ledger */}
      <div>
        {active.map((c, i) => (
          <ClinicianRow
            key={c.id}
            clinician={c}
            sessionGoal={getCurrentGoal(c.id, 'sessionGoal')}
            clientGoal={getCurrentGoal(c.id, 'clientGoal')}
            onSetGoal={() => {
              ensureHistory(c.id);
              setGoalPanel(c.id);
            }}
            onViewHistory={() => {
              ensureHistory(c.id);
              setHistoryModal(c.id);
            }}
            index={i}
          />
        ))}

        {active.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-24 text-center"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ backgroundColor: '#F0EEEB' }}
            >
              <Users size={28} style={{ color: FADED }} />
            </div>
            <p style={{ fontFamily: SERIF, fontSize: 22, color: '#D6D3D1' }}>
              No active clinicians
            </p>
            <p style={{ fontFamily: SANS, fontSize: 13, color: FADED, marginTop: 6 }}>
              Add team members in the Members tab
            </p>
          </motion.div>
        )}
      </div>

      {/* Set Goal Panel */}
      <AnimatePresence>
        {goalPanel && panelClinician && (
          <SetGoalPanel
            clinician={panelClinician}
            getCurrentGoal={getCurrentGoal}
            onSave={handleSaveGoal}
            onClose={() => setGoalPanel(null)}
          />
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {historyModal && historyClinician && (
          <GoalHistoryModal
            clinician={historyClinician}
            goalHistory={goalHistory}
            onClose={() => setHistoryModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
