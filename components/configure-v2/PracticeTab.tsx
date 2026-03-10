import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check, GripVertical, Info } from 'lucide-react';
import { FONT, INK, SHADOW, EASE, LedgerCard, SectionDivider } from './shared';
import { useSettings, MetricThresholds } from '../../context/SettingsContext';
import type { ServiceMapping, ServiceBucket, ServiceCategory } from './shared';

// =============================================================================
// PRACTICE DEFINITIONS - The Accountant's Ledger
// =============================================================================
// Practice-wide settings that define how metrics are calculated.
// Clean, purposeful layout with clear explanations.
// =============================================================================

interface PracticeTabProps {
  clinicians: { sessionGoal: number }[];
}

// =============================================================================
// SETTING ROW - Inline editable table row
// =============================================================================

interface SettingRowProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix: string;
  description: string;
  min?: number;
  max?: number;
  color?: string;
}

const SettingRow: React.FC<SettingRowProps> = ({
  label,
  value,
  onChange,
  suffix,
  description,
  min = 1,
  max = 365,
  color,
}) => {
  const [localValue, setLocalValue] = useState(value.toString());
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setLocalValue(value.toString());
  }, [value]);

  const handleBlur = () => {
    setIsFocused(false);
    const num = Math.max(min, Math.min(max, parseInt(localValue) || min));
    onChange(num);
    setLocalValue(num.toString());
  };

  return (
    <tr style={{ borderBottom: `1px solid ${INK.rule}` }}>
      {/* Label */}
      <td className="py-4 pr-4">
        <div className="flex items-center gap-2">
          {color && (
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: color }}
            />
          )}
          <span
            style={{
              fontFamily: FONT.sans,
              fontSize: 14,
              fontWeight: 500,
              color: INK.body,
            }}
          >
            {label}
          </span>
        </div>
      </td>

      {/* Value */}
      <td className="py-4 pr-4">
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            className="outline-none transition-all duration-150"
            style={{
              fontFamily: FONT.mono,
              fontSize: 16,
              fontWeight: 600,
              color: color || INK.black,
              width: 60,
              textAlign: 'right',
              padding: '4px 8px',
              borderRadius: 6,
              border: `1.5px solid ${isFocused ? INK.gold : 'transparent'}`,
              backgroundColor: isFocused ? INK.paper : 'transparent',
              boxShadow: isFocused ? SHADOW.goldFocus : 'none',
            }}
          />
          <span
            style={{
              fontFamily: FONT.sans,
              fontSize: 13,
              color: INK.ghost,
            }}
          >
            {suffix}
          </span>
        </div>
      </td>

      {/* Description */}
      <td className="py-4">
        <span
          style={{
            fontFamily: FONT.sans,
            fontSize: 13,
            color: INK.muted,
            lineHeight: 1.4,
          }}
        >
          {description}
        </span>
      </td>
    </tr>
  );
};

// =============================================================================
// SETTING ROW PILLS - Pill selector in table row
// =============================================================================

interface SettingRowPillsProps {
  label: string;
  value: number;
  options: number[];
  onChange: (v: number) => void;
  suffix: string;
  description: string;
}

const SettingRowPills: React.FC<SettingRowPillsProps> = ({
  label,
  value,
  options,
  onChange,
  suffix,
  description,
}) => {
  return (
    <tr style={{ borderBottom: `1px solid ${INK.rule}` }}>
      {/* Label */}
      <td className="py-4 pr-4">
        <span
          style={{
            fontFamily: FONT.sans,
            fontSize: 14,
            fontWeight: 500,
            color: INK.body,
          }}
        >
          {label}
        </span>
      </td>

      {/* Pills */}
      <td className="py-4 pr-4">
        <div
          className="inline-flex items-center gap-0.5 p-0.5 rounded-lg"
          style={{ backgroundColor: INK.cream }}
        >
          {options.map((opt) => {
            const isSelected = value === opt;
            return (
              <motion.button
                key={opt}
                onClick={() => onChange(opt)}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1.5 rounded-md"
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 13,
                  fontWeight: 600,
                  color: isSelected ? 'white' : INK.faded,
                  backgroundColor: isSelected ? INK.gold : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {opt}{suffix}
              </motion.button>
            );
          })}
        </div>
      </td>

      {/* Description */}
      <td className="py-4">
        <span
          style={{
            fontFamily: FONT.sans,
            fontSize: 13,
            color: INK.muted,
            lineHeight: 1.4,
          }}
        >
          {description}
        </span>
      </td>
    </tr>
  );
};

// =============================================================================
// CHURN SLIDER - Draggable dual-handle range
// =============================================================================

interface ChurnSliderProps {
  early: number;
  late: number;
  onEarlyChange: (v: number) => void;
  onLateChange: (v: number) => void;
}

const ChurnSlider: React.FC<ChurnSliderProps> = ({
  early,
  late,
  onEarlyChange,
  onLateChange,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<'early' | 'late' | null>(null);
  const maxValue = 30;

  const getPositionFromValue = (val: number) => (val / maxValue) * 100;
  const getValueFromPosition = (clientX: number) => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    return Math.round((percent / 100) * maxValue);
  };

  const handleMouseDown = (handle: 'early' | 'late') => (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(handle);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragging) return;
      const newValue = getValueFromPosition(e.clientX);

      if (dragging === 'early') {
        const clamped = Math.max(1, Math.min(late - 1, newValue));
        onEarlyChange(clamped);
      } else {
        const clamped = Math.max(early + 1, Math.min(maxValue, newValue));
        onLateChange(clamped);
      }
    },
    [dragging, early, late, onEarlyChange, onLateChange]
  );

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragging, handleMouseMove, handleMouseUp]);

  const earlyPos = getPositionFromValue(early);
  const latePos = getPositionFromValue(late);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE.out }}
    >
      {/* Track container */}
      <div className="relative pt-8 pb-10">
        {/* Track */}
        <div
          ref={trackRef}
          className="relative h-3 rounded-full overflow-hidden"
          style={{ backgroundColor: INK.rule }}
        >
          {/* Early segment (rose) */}
          <div
            className="absolute top-0 bottom-0 left-0 rounded-l-full"
            style={{
              width: `${earlyPos}%`,
              background: `linear-gradient(90deg, ${INK.roseLight} 0%, ${INK.rose}40 100%)`,
            }}
          />

          {/* Mid segment (amber) */}
          <div
            className="absolute top-0 bottom-0"
            style={{
              left: `${earlyPos}%`,
              width: `${latePos - earlyPos}%`,
              background: `linear-gradient(90deg, ${INK.amberLight} 0%, ${INK.amber}40 100%)`,
            }}
          />

          {/* Late segment (emerald) */}
          <div
            className="absolute top-0 bottom-0 right-0 rounded-r-full"
            style={{
              left: `${latePos}%`,
              background: `linear-gradient(90deg, ${INK.emeraldLight} 0%, ${INK.emerald}40 100%)`,
            }}
          />
        </div>

        {/* Early handle */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
          style={{ left: `${earlyPos}%`, transform: 'translate(-50%, -50%)', marginTop: 4 }}
          onMouseDown={handleMouseDown('early')}
          whileHover={{ scale: 1.1 }}
          animate={{ scale: dragging === 'early' ? 1.15 : 1 }}
        >
          {/* Value label */}
          <div
            className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg"
            style={{
              backgroundColor: INK.rose,
              opacity: dragging === 'early' ? 1 : 0.9,
              transition: 'opacity 0.15s',
            }}
          >
            <span
              style={{
                fontFamily: FONT.mono,
                fontSize: 13,
                fontWeight: 700,
                color: 'white',
              }}
            >
              {early}
            </span>
          </div>

          {/* Handle */}
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: INK.rose,
              boxShadow: dragging === 'early'
                ? `0 0 0 4px ${INK.rose}30, 0 4px 12px ${INK.rose}40`
                : `0 2px 8px ${INK.rose}30`,
              transition: 'box-shadow 0.15s',
            }}
          >
            <GripVertical size={12} color="white" />
          </div>
        </motion.div>

        {/* Late handle */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
          style={{ left: `${latePos}%`, transform: 'translate(-50%, -50%)', marginTop: 4 }}
          onMouseDown={handleMouseDown('late')}
          whileHover={{ scale: 1.1 }}
          animate={{ scale: dragging === 'late' ? 1.15 : 1 }}
        >
          {/* Value label */}
          <div
            className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg"
            style={{
              backgroundColor: INK.emerald,
              opacity: dragging === 'late' ? 1 : 0.9,
              transition: 'opacity 0.15s',
            }}
          >
            <span
              style={{
                fontFamily: FONT.mono,
                fontSize: 13,
                fontWeight: 700,
                color: 'white',
              }}
            >
              {late}
            </span>
          </div>

          {/* Handle */}
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: INK.emerald,
              boxShadow: dragging === 'late'
                ? `0 0 0 4px ${INK.emerald}30, 0 4px 12px ${INK.emerald}40`
                : `0 2px 8px ${INK.emerald}30`,
              transition: 'box-shadow 0.15s',
            }}
          >
            <GripVertical size={12} color="white" />
          </div>
        </motion.div>

        {/* Segment labels */}
        <div className="absolute -bottom-2 left-0 right-0 flex">
          <div
            className="text-center"
            style={{ width: `${earlyPos}%` }}
          >
            <span
              style={{
                fontFamily: FONT.sans,
                fontSize: 10,
                fontWeight: 600,
                color: INK.rose,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Early
            </span>
          </div>
          <div
            className="text-center"
            style={{ width: `${latePos - earlyPos}%` }}
          >
            <span
              style={{
                fontFamily: FONT.sans,
                fontSize: 10,
                fontWeight: 600,
                color: INK.amber,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Mid
            </span>
          </div>
          <div
            className="text-center flex-1"
          >
            <span
              style={{
                fontFamily: FONT.sans,
                fontSize: 10,
                fontWeight: 600,
                color: INK.emerald,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Late
            </span>
          </div>
        </div>
      </div>

    </motion.div>
  );
};

// =============================================================================
// SERVICE MAPPING - Compact accordion
// =============================================================================

const MOCK_SERVICES: ServiceMapping[] = [
  { id: 's1', name: 'Psychotherapy 60min', code: '90837', bucket: 'sessions', category: 'session' },
  { id: 's2', name: 'Psychotherapy 45min', code: '90834', bucket: 'sessions', category: 'session' },
  { id: 's3', name: 'Psychotherapy 30min', code: '90832', bucket: 'sessions', category: 'session' },
  { id: 's4', name: 'Diagnostic Eval', code: '90791', bucket: 'sessions', category: 'intake' },
  { id: 's5', name: 'Family Therapy', code: '90847', bucket: 'sessions', category: 'session' },
  { id: 's6', name: 'Group Therapy', code: '90853', bucket: 'sessions', category: 'group' },
  { id: 's7', name: 'Supervision', code: 'S100', bucket: 'other', category: 'supervision' },
  { id: 's8', name: 'Admin Block', code: 'ADMIN', bucket: 'other', category: 'admin' },
  { id: 's9', name: 'Training', code: 'T100', bucket: 'excluded' },
  { id: 's10', name: 'Free Consult', code: '00000', bucket: 'excluded' },
];

const BUCKETS: { id: ServiceBucket; label: string; color: string }[] = [
  { id: 'sessions', label: 'Sessions', color: INK.emerald },
  { id: 'other', label: 'Other', color: INK.amber },
  { id: 'excluded', label: 'Excluded', color: INK.faded },
];

const CATEGORIES: { value: ServiceCategory; label: string }[] = [
  { value: 'session', label: 'Session' },
  { value: 'intake', label: 'Intake' },
  { value: 'group', label: 'Group' },
  { value: 'supervision', label: 'Supervision' },
  { value: 'admin', label: 'Admin' },
  { value: 'other', label: 'Other' },
];

interface ServiceMappingProps {
  services: ServiceMapping[];
  onUpdate: (services: ServiceMapping[]) => void;
}

const ServiceMappingSection: React.FC<ServiceMappingProps> = ({ services, onUpdate }) => {
  const [expanded, setExpanded] = useState<ServiceBucket | null>(null);

  const byBucket = useMemo(() => {
    return BUCKETS.reduce((acc, b) => {
      acc[b.id] = services.filter((s) => s.bucket === b.id);
      return acc;
    }, {} as Record<ServiceBucket, ServiceMapping[]>);
  }, [services]);

  const updateService = (id: string, updates: Partial<ServiceMapping>) => {
    onUpdate(services.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  return (
    <LedgerCard>
      <div className="p-6">
        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div
              className="flex items-center gap-2 mb-1"
              style={{
                fontFamily: FONT.sans,
                fontSize: 10,
                fontWeight: 600,
                color: INK.ghost,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              <span>Service Mapping</span>
              <div className="flex-1 h-px" style={{ backgroundColor: INK.rule }} />
            </div>
            <p
              style={{
                fontFamily: FONT.sans,
                fontSize: 13,
                color: INK.muted,
                marginTop: 4,
              }}
            >
              Categorize appointment types to determine what counts toward goals
            </p>
          </div>
          <div className="flex items-center gap-4">
            {BUCKETS.map((b) => (
              <div key={b.id} className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: b.color }}
                />
                <span
                  style={{
                    fontFamily: FONT.mono,
                    fontSize: 12,
                    color: INK.muted,
                  }}
                >
                  {byBucket[b.id].length}
                </span>
              </div>
            ))}
          </div>
        </div>

      {/* Buckets */}
      <div className="mt-4 rounded-lg overflow-hidden" style={{ border: `1px solid ${INK.rule}` }}>
      {BUCKETS.map((bucket, idx) => {
        const items = byBucket[bucket.id];
        const isExpanded = expanded === bucket.id;
        const isLast = idx === BUCKETS.length - 1;

        return (
          <div key={bucket.id} style={{ borderBottom: isLast ? 'none' : `1px solid ${INK.rule}` }}>
            {/* Bucket row */}
            <button
              onClick={() => setExpanded(isExpanded ? null : bucket.id)}
              className="w-full px-4 py-3 flex items-center justify-between transition-colors"
              style={{
                backgroundColor: isExpanded ? INK.cream : 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <ChevronRight size={14} color={INK.faded} />
                </motion.div>
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: bucket.color }}
                />
                <span
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 13,
                    fontWeight: 500,
                    color: INK.body,
                  }}
                >
                  {bucket.label}
                </span>
              </div>
              <span
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 12,
                  color: INK.ghost,
                }}
              >
                {items.length}
              </span>
            </button>

            {/* Expanded content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-3">
                    {items.map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between py-2"
                        style={{ borderBottom: `1px solid ${INK.rule}` }}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="px-1.5 py-0.5 rounded"
                            style={{
                              fontFamily: FONT.mono,
                              fontSize: 10,
                              backgroundColor: INK.cream,
                              color: INK.faded,
                            }}
                          >
                            {service.code}
                          </span>
                          <span
                            style={{
                              fontFamily: FONT.sans,
                              fontSize: 13,
                              color: INK.body,
                            }}
                          >
                            {service.name}
                          </span>
                        </div>
                        {bucket.id !== 'excluded' && (
                          <select
                            value={service.category || ''}
                            onChange={(e) =>
                              updateService(service.id, {
                                category: (e.target.value as ServiceCategory) || undefined,
                              })
                            }
                            className="px-2 py-1 rounded border bg-white outline-none"
                            style={{
                              fontFamily: FONT.sans,
                              fontSize: 11,
                              color: service.category ? INK.body : INK.ghost,
                              borderColor: INK.rule,
                            }}
                          >
                            <option value="">—</option>
                            {CATEGORIES.map((c) => (
                              <option key={c.value} value={c.value}>
                                {c.label}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
      </div>
      </div>
    </LedgerCard>
  );
};

// =============================================================================
// MAIN
// =============================================================================

export const PracticeTab: React.FC<PracticeTabProps> = () => {
  const { settings, updateSettings } = useSettings();
  const [thresholds, setThresholds] = useState<MetricThresholds>(settings.thresholds);
  const [noteDeadline, setNoteDeadline] = useState(settings.practiceGoals.noteDeadlineHours);
  const [services, setServices] = useState<ServiceMapping[]>(MOCK_SERVICES);

  // Persist
  useEffect(() => {
    const t = setTimeout(() => {
      if (JSON.stringify(thresholds) !== JSON.stringify(settings.thresholds)) {
        updateSettings({ thresholds });
      }
    }, 300);
    return () => clearTimeout(t);
  }, [thresholds]);

  useEffect(() => {
    if (noteDeadline !== settings.practiceGoals.noteDeadlineHours) {
      updateSettings({
        practiceGoals: { ...settings.practiceGoals, noteDeadlineHours: noteDeadline },
      });
    }
  }, [noteDeadline]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header - matches CliniciansTab */}
      <div className="mb-6">
        <h2
          style={{
            fontFamily: FONT.serif,
            fontSize: 24,
            fontWeight: 400,
            color: INK.black,
            letterSpacing: '-0.01em',
          }}
        >
          Practice Definitions
        </h2>
        <p
          style={{
            fontFamily: FONT.sans,
            fontSize: 13,
            color: INK.muted,
            marginTop: 4,
          }}
        >
          Settings that define how metrics are calculated across your practice
        </p>
      </div>

      {/* Settings Card - single card like Clinicians roster */}
      <LedgerCard>
        <div className="p-8">
          {/* Thresholds Table */}
          <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${INK.dark}` }}>
                <th
                  className="text-left pb-3"
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 10,
                    fontWeight: 600,
                    color: INK.muted,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  Setting
                </th>
                <th
                  className="text-left pb-3"
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 10,
                    fontWeight: 600,
                    color: INK.muted,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  Value
                </th>
                <th
                  className="text-left pb-3"
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 10,
                    fontWeight: 600,
                    color: INK.muted,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    width: '40%',
                  }}
                >
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Active Client */}
              <SettingRow
                label="Active Client Window"
                value={thresholds.activityThresholdDays}
                onChange={(v) => setThresholds({ ...thresholds, activityThresholdDays: v })}
                suffix="days"
                description="Clients with a session in this window count as active"
                min={7}
                max={90}
              />

              {/* Note Deadline */}
              <SettingRowPills
                label="Note Deadline"
                value={noteDeadline}
                options={[24, 48, 72, 96]}
                onChange={setNoteDeadline}
                suffix="h"
                description="Time clinicians have to complete session notes after appointment"
              />

            </tbody>
          </table>
        </div>
      </LedgerCard>

      {/* Churn Classification - Visual slider */}
      <LedgerCard className="mt-6">
        <div className="p-8">
          {/* Section header */}
          <div className="mb-4">
            <h3
              style={{
                fontFamily: FONT.sans,
                fontSize: 14,
                fontWeight: 600,
                color: INK.body,
              }}
            >
              Churn Classification
            </h3>
            <p
              style={{
                fontFamily: FONT.sans,
                fontSize: 13,
                color: INK.muted,
                marginTop: 4,
              }}
            >
              When a client stops treatment, classify their departure by session count
            </p>
          </div>

          <ChurnSlider
            early={thresholds.earlyChurnSessions}
            late={thresholds.lateChurnSessions}
            onEarlyChange={(v) => setThresholds({ ...thresholds, earlyChurnSessions: v })}
            onLateChange={(v) => setThresholds({ ...thresholds, lateChurnSessions: v })}
          />
        </div>
      </LedgerCard>

      {/* Service Mapping */}
      <div className="mt-6">
        <ServiceMappingSection services={services} onUpdate={setServices} />
      </div>
    </motion.div>
  );
};

export default PracticeTab;
