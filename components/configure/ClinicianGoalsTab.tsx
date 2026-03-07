import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight,
  ArrowDownRight,
  X,
  Check,
  Plus,
  Trash2,
  ChevronRight,
  Crosshair,
  Users,
  BarChart3,
} from 'lucide-react';
import { Clinician } from './shared';
import {
  useSettings,
  GoalType,
  SingleGoalPeriod,
  ClinicianGoalHistory,
  generateGoalPeriodId,
  getGoalTypePeriods,
  getCurrentGoalTypePeriod,
} from '../../context/SettingsContext';
import { GoalHistoryModal } from './GoalHistory';
import { RankingTable, RankingRow, RankingColumn } from '../design-system/RankingTable';

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
  new Date(s + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

const fmtMonthLong = (s: string) =>
  new Date(s + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

const firstOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);

const nextMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 1);

const prevMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() - 1, 1);

const lastDayOf = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

// =============================================================================
// GOAL MANAGER MODAL — Elegant period-based goal management
// =============================================================================

interface GoalManagerModalProps {
  clinician: Clinician;
  goalHistory: ClinicianGoalHistory;
  onUpdateHistory: (history: ClinicianGoalHistory) => void;
  onSyncClinician: (clinicianId: string, sessionGoal: number, clientGoal: number) => void;
  onClose: () => void;
}

const GoalManagerModal: React.FC<GoalManagerModalProps> = ({
  clinician,
  goalHistory,
  onUpdateHistory,
  onSyncClinician,
  onClose,
}) => {
  // Stage: 'select-metric' -> 'manage'
  const [stage, setStage] = useState<'select-metric' | 'manage'>('select-metric');
  const [activeMetric, setActiveMetric] = useState<MetricKey | null>(null);
  const [editingPeriodId, setEditingPeriodId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);

  // New period form state
  const [newValue, setNewValue] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState<string>(''); // empty = Present

  const metric = activeMetric ? METRICS[activeMetric] : null;
  const goalType = metric?.goalType;

  // Get periods for current metric, sorted by startDate descending (newest first)
  const periods = useMemo(() => {
    if (!goalType) return [];
    const p = getGoalTypePeriods(clinician.id, goalType, goalHistory);
    return [...p].sort((a, b) => b.startDate.localeCompare(a.startDate));
  }, [clinician.id, goalType, goalHistory]);

  const currentPeriod = periods.find(p => p.endDate === null);
  const pastPeriods = periods.filter(p => p.endDate !== null);

  // Handle metric selection
  const handleSelectMetric = (key: MetricKey) => {
    setActiveMetric(key);
    setStage('manage');
    setEditingPeriodId(null);
    setAddingNew(false);
  };

  // Go back to metric selection
  const handleBackToSelect = () => {
    setStage('select-metric');
    setActiveMetric(null);
    setEditingPeriodId(null);
    setAddingNew(false);
  };

  // Close on escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (editingPeriodId || addingNew) {
          setEditingPeriodId(null);
          setAddingNew(false);
        } else if (stage === 'manage') {
          handleBackToSelect();
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose, editingPeriodId, addingNew, stage]);

  // Initialize new period form
  const handleStartAddNew = () => {
    setAddingNew(true);
    setNewValue('');
    setNewStartDate(toISO(firstOf(new Date()))); // Default to this month
    setNewEndDate(''); // Empty = Present
  };

  // Save new period
  const handleSaveNew = () => {
    if (!goalType || !activeMetric) return;
    const value = parseInt(newValue, 10);
    if (isNaN(value) || value <= 0 || !newStartDate) return;

    const h = { ...goalHistory };
    if (!h[clinician.id]) h[clinician.id] = {};
    const existing = [...(h[clinician.id][goalType] || [])];

    const isNewCurrent = !newEndDate; // Empty endDate = this becomes the current period

    if (isNewCurrent) {
      // Close current period if it exists (this new one becomes current)
      const currentIdx = existing.findIndex(p => p.endDate === null);
      if (currentIdx >= 0) {
        const endDate = new Date(newStartDate + 'T00:00:00');
        endDate.setDate(endDate.getDate() - 1);
        existing[currentIdx] = { ...existing[currentIdx], endDate: toISO(endDate) };
      }
    }

    // Add new period
    existing.push({
      id: generateGoalPeriodId(),
      startDate: newStartDate,
      endDate: newEndDate || null, // null = Present
      value,
    });

    h[clinician.id] = { ...h[clinician.id], [goalType]: existing };
    onUpdateHistory(h);

    // Sync to clinician model only if this is the new current period
    if (isNewCurrent) {
      const otherMetric = activeMetric === 'sessions' ? 'clients' : 'sessions';
      const otherGoalType = METRICS[otherMetric].goalType;
      const otherCurrent = getGoalTypePeriods(clinician.id, otherGoalType, h).find(p => p.endDate === null);
      const otherValue = otherCurrent?.value ?? (otherMetric === 'sessions' ? clinician.sessionGoal : clinician.clientGoal);

      if (activeMetric === 'sessions') {
        onSyncClinician(clinician.id, value, otherValue);
      } else {
        onSyncClinician(clinician.id, otherValue, value);
      }
    }

    setAddingNew(false);
    setNewValue('');
    setNewStartDate('');
    setNewEndDate('');
  };

  // Update existing period
  const handleUpdatePeriod = (periodId: string, updates: Partial<SingleGoalPeriod>) => {
    if (!goalType || !activeMetric) return;
    const h = { ...goalHistory };
    if (!h[clinician.id]?.[goalType]) return;

    const existing = [...h[clinician.id][goalType]!];
    const idx = existing.findIndex(p => p.id === periodId);
    if (idx < 0) return;

    existing[idx] = { ...existing[idx], ...updates };
    h[clinician.id] = { ...h[clinician.id], [goalType]: existing };
    onUpdateHistory(h);

    // If updating current period, sync to clinician model
    if (existing[idx].endDate === null && updates.value !== undefined) {
      const otherMetric = activeMetric === 'sessions' ? 'clients' : 'sessions';
      const otherGoalType = METRICS[otherMetric].goalType;
      const otherCurrent = getGoalTypePeriods(clinician.id, otherGoalType, h).find(p => p.endDate === null);
      const otherValue = otherCurrent?.value ?? (otherMetric === 'sessions' ? clinician.sessionGoal : clinician.clientGoal);

      if (activeMetric === 'sessions') {
        onSyncClinician(clinician.id, updates.value, otherValue);
      } else {
        onSyncClinician(clinician.id, otherValue, updates.value);
      }
    }

    setEditingPeriodId(null);
  };

  // Delete period (only allowed if not the only one)
  const handleDeletePeriod = (periodId: string) => {
    if (!goalType || !activeMetric) return;
    if (periods.length <= 1) return;

    const h = { ...goalHistory };
    if (!h[clinician.id]?.[goalType]) return;

    const existing = h[clinician.id][goalType]!.filter(p => p.id !== periodId);

    // If we deleted the current period, make the most recent past period current
    const hasCurrentPeriod = existing.some(p => p.endDate === null);
    if (!hasCurrentPeriod && existing.length > 0) {
      const sorted = [...existing].sort((a, b) => b.startDate.localeCompare(a.startDate));
      sorted[0] = { ...sorted[0], endDate: null };
      h[clinician.id] = { ...h[clinician.id], [goalType]: sorted };
    } else {
      h[clinician.id] = { ...h[clinician.id], [goalType]: existing };
    }

    onUpdateHistory(h);

    // Sync to clinician model
    const newCurrent = (h[clinician.id][goalType] || []).find(p => p.endDate === null);
    if (newCurrent) {
      const otherMetric = activeMetric === 'sessions' ? 'clients' : 'sessions';
      const otherGoalType = METRICS[otherMetric].goalType;
      const otherCurrent = getGoalTypePeriods(clinician.id, otherGoalType, h).find(p => p.endDate === null);
      const otherValue = otherCurrent?.value ?? (otherMetric === 'sessions' ? clinician.sessionGoal : clinician.clientGoal);

      if (activeMetric === 'sessions') {
        onSyncClinician(clinician.id, newCurrent.value, otherValue);
      } else {
        onSyncClinician(clinician.id, otherValue, newCurrent.value);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10020] flex items-center justify-center p-4 sm:p-6 lg:pl-[100px]"
      onClick={onClose}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(17, 14, 12, 0.5)', backdropFilter: 'blur(8px)' }}
      />

      {/* Modal */}
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`Manage goals for ${clinician.name}`}
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-[680px] rounded-[28px] overflow-hidden"
        style={{
          background: PAPER,
          boxShadow: '0 40px 100px -20px rgba(15,14,12,0.4)',
        }}
      >
        {/* Header */}
        <div
          className="px-8 pt-7 pb-6"
          style={{
            background: 'linear-gradient(180deg, #FFFFFF 0%, #FAF9F6 100%)',
            borderBottom: `1px solid ${RULE}`,
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {stage === 'manage' && (
                <button
                  onClick={handleBackToSelect}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:bg-stone-100 mr-1"
                  style={{ border: `1px solid ${RULE}`, color: BODY }}
                >
                  <ChevronRight size={18} className="rotate-180" />
                </button>
              )}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: `linear-gradient(145deg, ${clinician.color} 0%, ${clinician.color}dd 100%)`,
                  boxShadow: `0 10px 24px ${clinician.color}40`,
                }}
              >
                <span style={{ fontFamily: SANS, fontSize: 16, fontWeight: 700, color: '#FFF' }}>
                  {clinician.initials}
                </span>
              </div>
              <div>
                <h2 style={{ fontFamily: SERIF, fontSize: 30, lineHeight: 1.1, color: INK }}>
                  {clinician.name}
                </h2>
                <p style={{ fontFamily: SANS, fontSize: 14, color: FADED, marginTop: 3 }}>
                  {stage === 'select-metric' ? 'Choose a metric to manage' : `${metric?.fullLabel}`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:bg-stone-100"
              style={{ border: `1px solid ${RULE}`, color: BODY }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Stage 1: Metric Selection */}
        {stage === 'select-metric' && (
          <div className="px-8 py-8">
            <div className="grid grid-cols-2 gap-5">
              {(['sessions', 'clients'] as MetricKey[]).map((key) => {
                const m = METRICS[key];
                const currentVal = getGoalTypePeriods(clinician.id, m.goalType, goalHistory)
                  .find(p => p.endDate === null)?.value ?? 0;
                return (
                  <motion.button
                    key={key}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectMetric(key)}
                    className="text-left rounded-2xl p-6 transition-all"
                    style={{
                      background: `linear-gradient(160deg, ${m.bg} 0%, #FFFFFF 100%)`,
                      border: `2px solid ${m.accent}40`,
                      boxShadow: `0 12px 32px ${m.accent}15`,
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${m.accent}20` }}
                    >
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.accent }} />
                    </div>
                    <p style={{
                      fontFamily: SANS,
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: m.accent,
                      marginBottom: 8,
                    }}>
                      {m.fullLabel}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span style={{ fontFamily: SERIF, fontSize: 42, color: INK, lineHeight: 1 }}>
                        {currentVal}
                      </span>
                      {m.unit && (
                        <span style={{ fontFamily: SANS, fontSize: 16, color: BODY, fontWeight: 500 }}>
                          {m.unit}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <span style={{ fontFamily: SANS, fontSize: 13, color: BODY }}>
                        Manage goal
                      </span>
                      <ChevronRight size={16} style={{ color: m.accent }} />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* Stage 2: Period Management */}
        {stage === 'manage' && metric && (
          <div className="px-8 py-6" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
            {/* Current Period - Hero Card */}
            {currentPeriod && !addingNew && (
              <CurrentPeriodCard
                period={currentPeriod}
                metric={metric}
                isEditing={editingPeriodId === currentPeriod.id}
                onStartEdit={() => setEditingPeriodId(currentPeriod.id)}
                onCancelEdit={() => setEditingPeriodId(null)}
                onSave={(value, startDate) => handleUpdatePeriod(currentPeriod.id, { value, startDate })}
                canDelete={periods.length > 1}
                onDelete={() => handleDeletePeriod(currentPeriod.id)}
              />
            )}

            {/* Add New Period Form */}
            <AnimatePresence>
              {addingNew && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="mb-6"
                >
                  <div
                    className="rounded-2xl overflow-hidden"
                    style={{
                      background: '#FFFFFF',
                      border: `1px solid ${RULE}`,
                      boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                    }}
                  >
                    {/* Accent bar */}
                    <div className="h-1" style={{ background: metric.accent }} />

                    <div className="p-6">
                      {/* Target Value - Hero Input */}
                      <div className="text-center mb-8">
                        <p style={{
                          fontFamily: SANS,
                          fontSize: 11,
                          fontWeight: 600,
                          color: FADED,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          marginBottom: 12,
                        }}>
                          {metric.fullLabel}
                        </p>
                        <div className="flex items-baseline justify-center gap-3">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={newValue}
                            onChange={e => setNewValue(e.target.value.replace(/[^0-9]/g, ''))}
                            placeholder="0"
                            autoFocus
                            className="bg-transparent text-center focus:outline-none"
                            style={{
                              fontFamily: SERIF,
                              fontSize: 72,
                              color: INK,
                              width: `${Math.max(2, newValue.length || 1) + 0.5}ch`,
                              lineHeight: 1,
                              caretColor: metric.accent,
                            }}
                          />
                          {metric.unit && (
                            <span style={{
                              fontFamily: SANS,
                              fontSize: 20,
                              color: FADED,
                              fontWeight: 500,
                              marginBottom: 8,
                            }}>
                              {metric.unit}
                            </span>
                          )}
                        </div>
                        <div
                          className="mx-auto mt-2"
                          style={{
                            width: 80,
                            height: 2,
                            background: `linear-gradient(90deg, transparent, ${metric.accent}, transparent)`,
                            borderRadius: 1,
                          }}
                        />
                      </div>

                      {/* Date Range */}
                      <div
                        className="rounded-xl p-4 mb-6"
                        style={{ backgroundColor: '#FAFAF9', border: `1px solid ${RULE}` }}
                      >
                        <p style={{
                          fontFamily: SANS,
                          fontSize: 10,
                          fontWeight: 700,
                          color: FADED,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          marginBottom: 12,
                        }}>
                          Effective Period
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <input
                              type="month"
                              value={newStartDate.slice(0, 7)}
                              onChange={e => setNewStartDate(e.target.value ? `${e.target.value}-01` : '')}
                              className="w-full bg-white rounded-lg px-3 py-2.5 focus:outline-none"
                              style={{
                                fontFamily: SANS,
                                fontSize: 14,
                                color: INK,
                                border: `1px solid ${RULE}`,
                              }}
                            />
                          </div>
                          <span style={{ fontFamily: SANS, fontSize: 13, color: FADED }}>to</span>
                          <div className="flex-1">
                            {newEndDate ? (
                              <input
                                type="month"
                                value={newEndDate.slice(0, 7)}
                                onChange={e => setNewEndDate(e.target.value ? `${e.target.value}-01` : '')}
                                className="w-full bg-white rounded-lg px-3 py-2.5 focus:outline-none"
                                style={{
                                  fontFamily: SANS,
                                  fontSize: 14,
                                  color: INK,
                                  border: `1px solid ${RULE}`,
                                }}
                              />
                            ) : (
                              <button
                                onClick={() => setNewEndDate(toISO(new Date()))}
                                className="w-full rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-white"
                                style={{
                                  fontFamily: SANS,
                                  fontSize: 14,
                                  fontWeight: 600,
                                  color: metric.accent,
                                  border: `1px dashed ${metric.accent}60`,
                                  backgroundColor: `${metric.accent}08`,
                                }}
                              >
                                Present
                              </button>
                            )}
                          </div>
                          {newEndDate && (
                            <button
                              onClick={() => setNewEndDate('')}
                              className="px-2 py-1 rounded text-xs font-medium transition-colors hover:bg-stone-100"
                              style={{ color: FADED }}
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setAddingNew(false)}
                          className="flex-1 px-4 py-3 rounded-xl transition-colors hover:bg-stone-50"
                          style={{
                            fontFamily: SANS,
                            fontSize: 13,
                            fontWeight: 600,
                            color: BODY,
                            border: `1px solid ${RULE}`,
                            backgroundColor: '#FFF',
                          }}
                        >
                          Cancel
                        </button>
                        <motion.button
                          whileHover={newValue && parseInt(newValue, 10) > 0 && newStartDate ? { scale: 1.02 } : {}}
                          whileTap={newValue && parseInt(newValue, 10) > 0 && newStartDate ? { scale: 0.98 } : {}}
                          onClick={handleSaveNew}
                          disabled={!newValue || parseInt(newValue, 10) <= 0 || !newStartDate}
                          className="flex-1 px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                          style={{
                            fontFamily: SANS,
                            fontSize: 13,
                            fontWeight: 700,
                            color: newValue && parseInt(newValue, 10) > 0 && newStartDate ? '#FFF' : '#B8B4AE',
                            background: newValue && parseInt(newValue, 10) > 0 && newStartDate
                              ? metric.accent
                              : '#EDEBE8',
                            boxShadow: newValue && parseInt(newValue, 10) > 0 && newStartDate
                              ? `0 4px 12px ${metric.accent}50`
                              : 'none',
                          }}
                        >
                          <Check size={16} strokeWidth={2.5} />
                          Save Goal
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          {/* Add New Button */}
          {!addingNew && (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleStartAddNew}
              className="w-full rounded-xl px-4 py-3.5 flex items-center justify-center gap-2 transition-all mb-4"
              style={{
                fontFamily: SANS,
                fontSize: 13,
                fontWeight: 600,
                color: metric.accent,
                background: `${metric.bg}`,
                border: `1.5px dashed ${metric.accent}60`,
              }}
            >
              <Plus size={16} />
              Set New Goal
            </motion.button>
          )}

          {/* Past Periods Timeline */}
          {pastPeriods.length > 0 && (
            <div className="mt-2">
              <p style={{
                fontFamily: SANS,
                fontSize: 11,
                fontWeight: 700,
                color: FADED,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 12,
              }}>
                History
              </p>
              <div className="space-y-2">
                {pastPeriods.map((period, idx) => (
                  <PastPeriodRow
                    key={period.id}
                    period={period}
                    metric={metric}
                    isEditing={editingPeriodId === period.id}
                    onStartEdit={() => setEditingPeriodId(period.id)}
                    onCancelEdit={() => setEditingPeriodId(null)}
                    onSave={(value, startDate, endDate) =>
                      handleUpdatePeriod(period.id, { value, startDate, endDate })
                    }
                    canDelete={periods.length > 1}
                    onDelete={() => handleDeletePeriod(period.id)}
                    isLast={idx === pastPeriods.length - 1}
                  />
                ))}
              </div>
            </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

// =============================================================================
// CURRENT PERIOD CARD — Hero display for active goal
// =============================================================================

const CurrentPeriodCard: React.FC<{
  period: SingleGoalPeriod;
  metric: typeof SESSIONS;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: (value: number, startDate: string) => void;
  canDelete: boolean;
  onDelete: () => void;
}> = ({ period, metric, isEditing, onStartEdit, onCancelEdit, onSave, canDelete, onDelete }) => {
  const [editValue, setEditValue] = useState(String(period.value));
  const [editStartDate, setEditStartDate] = useState(period.startDate);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      setEditValue(String(period.value));
      setEditStartDate(period.startDate);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isEditing, period.value, period.startDate]);

  const handleSave = () => {
    const value = parseInt(editValue, 10);
    if (isNaN(value) || value <= 0) return;
    onSave(value, editStartDate);
  };

  if (isEditing) {
    return (
      <div
        className="rounded-2xl overflow-hidden mb-6"
        style={{
          background: '#FFFFFF',
          border: `1px solid ${RULE}`,
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        }}
      >
        <div className="h-1" style={{ background: metric.accent }} />
        <div className="p-6">
          {/* Target Value - Hero Input */}
          <div className="text-center mb-8">
            <p style={{
              fontFamily: SANS,
              fontSize: 11,
              fontWeight: 600,
              color: FADED,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 12,
            }}>
              {metric.fullLabel}
            </p>
            <div className="flex items-baseline justify-center gap-3">
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                value={editValue}
                onChange={e => setEditValue(e.target.value.replace(/[^0-9]/g, ''))}
                className="bg-transparent text-center focus:outline-none"
                style={{
                  fontFamily: SERIF,
                  fontSize: 72,
                  color: INK,
                  width: `${Math.max(2, editValue.length || 1) + 0.5}ch`,
                  lineHeight: 1,
                  caretColor: metric.accent,
                }}
              />
              {metric.unit && (
                <span style={{
                  fontFamily: SANS,
                  fontSize: 20,
                  color: FADED,
                  fontWeight: 500,
                  marginBottom: 8,
                }}>
                  {metric.unit}
                </span>
              )}
            </div>
            <div
              className="mx-auto mt-2"
              style={{
                width: 80,
                height: 2,
                background: `linear-gradient(90deg, transparent, ${metric.accent}, transparent)`,
                borderRadius: 1,
              }}
            />
          </div>

          {/* Start Date */}
          <div
            className="rounded-xl p-4 mb-6"
            style={{ backgroundColor: '#FAFAF9', border: `1px solid ${RULE}` }}
          >
            <p style={{
              fontFamily: SANS,
              fontSize: 10,
              fontWeight: 700,
              color: FADED,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 12,
            }}>
              Effective Since
            </p>
            <input
              type="month"
              value={editStartDate.slice(0, 7)}
              onChange={e => setEditStartDate(e.target.value ? `${e.target.value}-01` : editStartDate)}
              className="w-full bg-white rounded-lg px-3 py-2.5 focus:outline-none"
              style={{
                fontFamily: SANS,
                fontSize: 14,
                color: INK,
                border: `1px solid ${RULE}`,
              }}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {canDelete && (
              <button
                onClick={onDelete}
                className="p-3 rounded-xl transition-colors hover:bg-red-50"
                style={{ color: '#DC2626', border: `1px solid #FEE2E2` }}
              >
                <Trash2 size={18} />
              </button>
            )}
            <div className="flex-1" />
            <button
              onClick={onCancelEdit}
              className="px-5 py-3 rounded-xl transition-colors hover:bg-stone-50"
              style={{
                fontFamily: SANS,
                fontSize: 13,
                fontWeight: 600,
                color: BODY,
                border: `1px solid ${RULE}`,
                backgroundColor: '#FFF',
              }}
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              className="px-5 py-3 rounded-xl transition-all flex items-center gap-2"
              style={{
                fontFamily: SANS,
                fontSize: 13,
                fontWeight: 700,
                color: '#FFF',
                background: metric.accent,
                boxShadow: `0 4px 12px ${metric.accent}50`,
              }}
            >
              <Check size={16} strokeWidth={2.5} />
              Save
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  // Non-editing view
  return (
    <motion.button
      whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
      whileTap={{ scale: 0.99 }}
      onClick={onStartEdit}
      className="w-full text-left rounded-2xl overflow-hidden mb-6 transition-all"
      style={{
        background: '#FFFFFF',
        border: `1px solid ${RULE}`,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}
    >
      <div className="h-1" style={{ background: metric.accent }} />
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p style={{
            fontFamily: SANS,
            fontSize: 10,
            fontWeight: 700,
            color: FADED,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>
            Current Goal
          </p>
          <div
            className="px-2.5 py-1 rounded-full"
            style={{ backgroundColor: `${metric.accent}15` }}
          >
            <span style={{
              fontFamily: SANS,
              fontSize: 11,
              fontWeight: 600,
              color: metric.accent,
            }}>
              Since {fmtMonth(period.startDate)}
            </span>
          </div>
        </div>
        <div className="flex items-baseline gap-3">
          <span style={{ fontFamily: SERIF, fontSize: 56, color: INK, lineHeight: 1 }}>
            {period.value}
          </span>
          {metric.unit && (
            <span style={{ fontFamily: SANS, fontSize: 18, color: FADED, fontWeight: 500 }}>
              {metric.unit}
            </span>
          )}
        </div>
        <p style={{
          fontFamily: SANS,
          fontSize: 12,
          color: FADED,
          marginTop: 12,
        }}>
          Click to edit
        </p>
      </div>
    </motion.button>
  );
};

// =============================================================================
// PAST PERIOD ROW — Compact history entry
// =============================================================================

const PastPeriodRow: React.FC<{
  period: SingleGoalPeriod;
  metric: typeof SESSIONS;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: (value: number, startDate: string, endDate: string | null) => void;
  canDelete: boolean;
  onDelete: () => void;
  isLast: boolean;
}> = ({ period, metric, isEditing, onStartEdit, onCancelEdit, onSave, canDelete, onDelete, isLast }) => {
  const [editValue, setEditValue] = useState(String(period.value));
  const [editStartDate, setEditStartDate] = useState(period.startDate);
  const [editEndDate, setEditEndDate] = useState(period.endDate || '');

  useEffect(() => {
    if (isEditing) {
      setEditValue(String(period.value));
      setEditStartDate(period.startDate);
      setEditEndDate(period.endDate || '');
    }
  }, [isEditing, period]);

  const handleSave = () => {
    const value = parseInt(editValue, 10);
    if (isNaN(value) || value <= 0) return;
    onSave(value, editStartDate, editEndDate || null);
  };

  if (isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="rounded-xl p-4 overflow-hidden"
        style={{
          backgroundColor: '#FFFFFF',
          border: `1.5px solid ${metric.accent}`,
        }}
      >
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div>
            <label style={{ fontFamily: SANS, fontSize: 10, color: FADED, display: 'block', marginBottom: 4 }}>
              Target
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={editValue}
              onChange={e => setEditValue(e.target.value.replace(/[^0-9]/g, ''))}
              autoFocus
              className="w-full bg-stone-50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
              style={{ fontFamily: SERIF, fontSize: 18, color: INK, border: `1px solid ${RULE}` }}
            />
          </div>
          <div>
            <label style={{ fontFamily: SANS, fontSize: 10, color: FADED, display: 'block', marginBottom: 4 }}>
              From
            </label>
            <input
              type="month"
              value={editStartDate.slice(0, 7)}
              onChange={e => setEditStartDate(e.target.value ? `${e.target.value}-01` : editStartDate)}
              className="w-full bg-stone-50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
              style={{ fontFamily: SANS, fontSize: 12, color: INK, border: `1px solid ${RULE}` }}
            />
          </div>
          <div>
            <label style={{ fontFamily: SANS, fontSize: 10, color: FADED, display: 'block', marginBottom: 4 }}>
              To
            </label>
            <input
              type="month"
              value={editEndDate.slice(0, 7)}
              onChange={e => setEditEndDate(e.target.value ? `${e.target.value}-01` : '')}
              className="w-full bg-stone-50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
              style={{ fontFamily: SANS, fontSize: 12, color: INK, border: `1px solid ${RULE}` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canDelete && (
            <button
              onClick={onDelete}
              className="p-2 rounded-lg transition-colors hover:bg-red-50"
              style={{ color: '#DC2626' }}
            >
              <Trash2 size={14} />
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={onCancelEdit}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{ color: BODY, backgroundColor: '#F5F5F4' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
            style={{ color: '#FFF', backgroundColor: metric.accent }}
          >
            <Check size={12} />
            Save
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.button
      whileHover={{ backgroundColor: '#FAFAF9' }}
      onClick={onStartEdit}
      className="w-full text-left rounded-xl px-4 py-3 flex items-center gap-4 transition-all"
      style={{
        backgroundColor: '#FFFFFF',
        border: `1px solid ${RULE}`,
      }}
    >
      {/* Timeline dot */}
      <div className="flex flex-col items-center self-stretch py-1">
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: FADED }}
        />
        {!isLast && (
          <div className="flex-1 w-px mt-1" style={{ backgroundColor: RULE }} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span style={{ fontFamily: SERIF, fontSize: 22, color: INK }}>
            {period.value}
          </span>
          {metric.unit && (
            <span style={{ fontFamily: SANS, fontSize: 12, color: FADED }}>{metric.unit}</span>
          )}
        </div>
        <p style={{ fontFamily: SANS, fontSize: 12, color: FADED, marginTop: 2 }}>
          {fmtMonth(period.startDate)} — {period.endDate ? fmtMonth(period.endDate) : 'Present'}
        </p>
      </div>

      <ChevronRight size={16} style={{ color: FADED }} />
    </motion.button>
  );
};

// =============================================================================
// RANKING TABLE COLUMNS
// =============================================================================

const sessionsColumn: RankingColumn = {
  key: 'sessions',
  label: 'Sessions/wk',
  format: (v: number) => `${v}/wk`,
  isPrimary: true,
};

const clientsColumn: RankingColumn = {
  key: 'clients',
  label: 'Active Clients',
  format: (v: number) => String(v),
  isPrimary: true,
  matchPrimaryValueStyle: true,
};

const GOALS_THEME = {
  first: { text: '#44403c' },
  last: { text: '#44403c' },
  default: { text: '#44403c' },
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

  const [goalPanel, setGoalPanel] = useState<string | null>(null);
  const [historyModal, setHistoryModal] = useState<string | null>(null);

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

  // Initialize goal history from defaults when opening modal
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

  // Sync clinician flat model when goals change
  const handleSyncClinician = useCallback(
    (clinicianId: string, sessionGoal: number, clientGoal: number) => {
      onUpdate(clinicians.map(c =>
        c.id === clinicianId ? { ...c, sessionGoal, clientGoal } : c
      ));
    },
    [clinicians, onUpdate]
  );

  const panelClinician = goalPanel ? clinicians.find(c => c.id === goalPanel) : null;
  const historyClinician = historyModal ? clinicians.find(c => c.id === historyModal) : null;

  // Build RankingTable rows sorted by sessions goal descending
  const rankingRows: RankingRow[] = useMemo(() =>
    [...active]
      .sort((a, b) => getCurrentGoal(b.id, 'sessionGoal') - getCurrentGoal(a.id, 'sessionGoal'))
      .map(c => ({
        id: c.id,
        name: c.name,
        subtitle: c.role,
        accentColor: c.color,
        values: {
          sessions: getCurrentGoal(c.id, 'sessionGoal'),
          clients: getCurrentGoal(c.id, 'clientGoal'),
        },
      })),
    [active, getCurrentGoal]
  );

  const handleRowClick = useCallback((id: string | number | null) => {
    if (id === null) return;
    const clinicianId = String(id);
    ensureHistory(clinicianId);
    setGoalPanel(clinicianId);
  }, [ensureHistory]);

  return (
    <div style={{ backgroundColor: PAPER, minHeight: '100%' }}>
      {/* Practice goal summary */}
      {active.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="pt-8 pb-12"
        >
          <h2 style={{
            fontFamily: SERIF, fontSize: 26, fontWeight: 400,
            color: INK, lineHeight: 1.2, marginBottom: 6,
          }}>
            Practice Targets
          </h2>
          <p style={{
            fontFamily: SANS, fontSize: 14, fontWeight: 500,
            color: FADED, marginBottom: 24,
          }}>
            Combined goals across {active.length} active clinician{active.length !== 1 ? 's' : ''}
          </p>
          <div className="flex gap-5">
            <div
              className="flex-1 px-6 py-6 rounded-xl"
              style={{ backgroundColor: SESSIONS.bg, border: `1px solid ${SESSIONS.accent}18` }}
            >
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SESSIONS.accent }} />
                <p style={{
                  fontFamily: SANS, fontSize: 14, fontWeight: 600,
                  color: BODY, lineHeight: 1.2,
                }}>
                  Sessions per week
                </p>
              </div>
              <span style={{ fontFamily: SERIF, fontSize: 42, color: INK, lineHeight: 1 }}>
                {totals.sessions}
              </span>
            </div>
            <div
              className="flex-1 px-6 py-6 rounded-xl"
              style={{ backgroundColor: CLIENTS.bg, border: `1px solid ${CLIENTS.accent}18` }}
            >
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CLIENTS.accent }} />
                <p style={{
                  fontFamily: SANS, fontSize: 14, fontWeight: 600,
                  color: BODY, lineHeight: 1.2,
                }}>
                  Active clients
                </p>
              </div>
              <span style={{ fontFamily: SERIF, fontSize: 42, color: INK, lineHeight: 1 }}>
                {totals.clients}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Clinician goals table */}
      <div>
        {active.length > 0 ? (
          <RankingTable
            rows={rankingRows}
            primaryColumn={sessionsColumn}
            supportingColumns={[clientsColumn]}
            onRowClick={handleRowClick}
            rowActions={(row) => (
              <>
                <motion.button
                  whileHover={{
                    scale: 1.02,
                    y: -1,
                    filter: 'brightness(1.09) saturate(1.08)',
                    boxShadow: '0 14px 26px rgba(23,20,18,0.3), inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -1px 0 rgba(0,0,0,0.4)',
                    borderColor: 'rgba(255,255,255,0.24)',
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 360, damping: 24 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    const id = String(row.id);
                    ensureHistory(id);
                    setGoalPanel(id);
                  }}
                  className="inline-flex justify-self-center items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-all"
                  style={{
                    fontFamily: SANS,
                    fontSize: 11,
                    fontWeight: 800,
                    color: '#FBFAF8',
                    background: 'linear-gradient(160deg, #2B2621 0%, #171412 55%, #100E0D 100%)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    boxShadow: '0 10px 22px rgba(23,20,18,0.24), inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(0,0,0,0.35)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  <Crosshair size={12} />
                  Manage
                </motion.button>
                <motion.button
                  whileHover={{
                    scale: 1.02,
                    y: -1,
                    filter: 'brightness(1.03)',
                    boxShadow: '0 12px 22px rgba(120,113,108,0.18), inset 0 1px 0 rgba(255,255,255,0.96)',
                    borderColor: 'rgba(186,176,163,0.95)',
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 360, damping: 24 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    const id = String(row.id);
                    ensureHistory(id);
                    setHistoryModal(id);
                  }}
                  className="inline-flex justify-self-center items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-all"
                  style={{
                    fontFamily: SANS,
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#3F3A35',
                    background: 'linear-gradient(170deg, #FFFFFF 0%, #F7F4EF 70%, #F1ECE4 100%)',
                    border: '1px solid rgba(201,193,182,0.82)',
                    boxShadow: '0 8px 16px rgba(120,113,108,0.12), inset 0 1px 0 rgba(255,255,255,0.92)',
                    letterSpacing: '0.055em',
                    textTransform: 'uppercase',
                  }}
                >
                  <BarChart3 size={12} />
                  History
                </motion.button>
              </>
            )}
            theme={GOALS_THEME}
          />
        ) : (
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

      {/* Goal Manager Modal */}
      <AnimatePresence>
        {goalPanel && panelClinician && (
          <GoalManagerModal
            clinician={panelClinician}
            goalHistory={goalHistory}
            onUpdateHistory={(h) => updateSettings({ clinicianGoalHistory: h })}
            onSyncClinician={handleSyncClinician}
            onClose={() => setGoalPanel(null)}
          />
        )}
      </AnimatePresence>

      {/* History Visualization Modal */}
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
