import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check, GripVertical, Info } from 'lucide-react';
import { FONT, INK, SHADOW, EASE, LedgerCard, SectionDivider, MOCK_EHR_OFFICES, MOCK_LOCATION_GROUPS } from './shared';
import { useSettings, MetricThresholds } from '../../context/SettingsContext';
import type { ServiceMapping, ServiceBucket, ServiceCategory } from './shared';
import { OfficeMapping, type LocationGroup, type RawEHROffice } from '../OfficeMapping';

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
// SETTING ROW CHURN - Draggable churn slider in table row
// =============================================================================

interface SettingRowChurnProps {
  early: number;
  late: number;
  onEarlyChange: (v: number) => void;
  onLateChange: (v: number) => void;
  description: string;
}

const SettingRowChurn: React.FC<SettingRowChurnProps> = ({
  early,
  late,
  onEarlyChange,
  onLateChange,
  description,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<'early' | 'late' | null>(null);
  const [, forceRender] = useState(0);
  const maxValue = 30;

  // Use refs to avoid stale closures in event handlers
  const earlyRef = useRef(early);
  const lateRef = useRef(late);
  earlyRef.current = early;
  lateRef.current = late;

  const getPositionFromValue = (val: number) => (val / maxValue) * 100;
  const getValueFromPosition = (clientX: number) => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    return Math.round((percent / 100) * maxValue);
  };

  const handleMouseDown = (handle: 'early' | 'late') => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    draggingRef.current = handle;
    forceRender((n) => n + 1);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!draggingRef.current) return;
      const newValue = getValueFromPosition(moveEvent.clientX);

      if (draggingRef.current === 'early') {
        const clamped = Math.max(1, Math.min(lateRef.current - 1, newValue));
        onEarlyChange(clamped);
      } else {
        const clamped = Math.max(earlyRef.current + 1, Math.min(maxValue, newValue));
        onLateChange(clamped);
      }
    };

    const handleMouseUp = () => {
      draggingRef.current = null;
      forceRender((n) => n + 1);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const earlyPos = getPositionFromValue(early);
  const latePos = getPositionFromValue(late);
  const isDraggingEarly = draggingRef.current === 'early';
  const isDraggingLate = draggingRef.current === 'late';

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
          Churn Classification
        </span>
      </td>

      {/* Draggable slider */}
      <td className="py-4 pr-4">
        <div className="relative" style={{ width: 280 }}>
          {/* Value labels row - separated above */}
          <div className="flex justify-between mb-3" style={{ paddingLeft: 8, paddingRight: 8 }}>
            <div
              className="px-2 py-0.5 rounded"
              style={{
                backgroundColor: INK.rose,
                marginLeft: `calc(${earlyPos}% - 20px)`,
              }}
            >
              <span style={{ fontFamily: FONT.mono, fontSize: 10, fontWeight: 700, color: 'white' }}>
                &lt;{early}
              </span>
            </div>
            <div
              className="px-2 py-0.5 rounded"
              style={{
                backgroundColor: INK.emerald,
                marginRight: `calc(${100 - latePos}% - 20px)`,
              }}
            >
              <span style={{ fontFamily: FONT.mono, fontSize: 10, fontWeight: 700, color: 'white' }}>
                &gt;{late}
              </span>
            </div>
          </div>

          {/* Track with handles */}
          <div className="relative" style={{ height: 24 }}>
            {/* Track */}
            <div
              ref={trackRef}
              className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-2.5 rounded-full overflow-hidden"
              style={{ backgroundColor: INK.cream }}
            >
              {/* Early segment (rose) */}
              <div
                className="absolute top-0 bottom-0 left-0 rounded-l-full"
                style={{
                  width: `${earlyPos}%`,
                  background: `linear-gradient(90deg, ${INK.roseLight} 0%, ${INK.rose}90 100%)`,
                }}
              />

              {/* Mid segment (amber) */}
              <div
                className="absolute top-0 bottom-0"
                style={{
                  left: `${earlyPos}%`,
                  width: `${latePos - earlyPos}%`,
                  background: `linear-gradient(90deg, ${INK.amberLight} 0%, ${INK.amber}90 100%)`,
                }}
              />

              {/* Late segment (emerald) */}
              <div
                className="absolute top-0 bottom-0 right-0 rounded-r-full"
                style={{
                  left: `${latePos}%`,
                  background: `linear-gradient(90deg, ${INK.emeraldLight} 0%, ${INK.emerald}90 100%)`,
                }}
              />
            </div>

            {/* Early handle */}
            <motion.div
              className="absolute top-1/2 cursor-grab active:cursor-grabbing select-none z-10"
              style={{ left: `${earlyPos}%`, transform: 'translate(-50%, -50%)' }}
              onMouseDown={handleMouseDown('early')}
              whileHover={{ scale: 1.1 }}
              animate={{ scale: isDraggingEarly ? 1.15 : 1 }}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: INK.rose,
                  boxShadow: isDraggingEarly
                    ? `0 0 0 3px ${INK.rose}30, 0 2px 6px ${INK.rose}40`
                    : `0 1px 4px ${INK.rose}30`,
                }}
              >
                <GripVertical size={10} color="white" />
              </div>
            </motion.div>

            {/* Late handle */}
            <motion.div
              className="absolute top-1/2 cursor-grab active:cursor-grabbing select-none z-10"
              style={{ left: `${latePos}%`, transform: 'translate(-50%, -50%)' }}
              onMouseDown={handleMouseDown('late')}
              whileHover={{ scale: 1.1 }}
              animate={{ scale: isDraggingLate ? 1.15 : 1 }}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: INK.emerald,
                  boxShadow: isDraggingLate
                    ? `0 0 0 3px ${INK.emerald}30, 0 2px 6px ${INK.emerald}40`
                    : `0 1px 4px ${INK.emerald}30`,
                }}
              >
                <GripVertical size={10} color="white" />
              </div>
            </motion.div>
          </div>

          {/* Segment labels below track */}
          <div className="flex mt-2">
            <div className="text-center" style={{ width: `${earlyPos}%` }}>
              <span style={{ fontFamily: FONT.sans, fontSize: 9, fontWeight: 600, color: INK.rose, letterSpacing: '0.05em' }}>
                EARLY
              </span>
            </div>
            <div className="text-center" style={{ width: `${latePos - earlyPos}%` }}>
              <span style={{ fontFamily: FONT.sans, fontSize: 9, fontWeight: 600, color: INK.amber, letterSpacing: '0.05em' }}>
                MID
              </span>
            </div>
            <div className="text-center" style={{ flex: 1 }}>
              <span style={{ fontFamily: FONT.sans, fontSize: 9, fontWeight: 600, color: INK.emerald, letterSpacing: '0.05em' }}>
                LATE
              </span>
            </div>
          </div>
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
  // Unassigned examples - newly synced from EHR
  { id: 's11', name: 'Telehealth Session', code: '90837-95', bucket: 'unassigned' },
  { id: 's12', name: 'Crisis Intervention', code: '90839', bucket: 'unassigned' },
  { id: 's13', name: 'Medication Mgmt', code: '99213', bucket: 'unassigned' },
];

const BUCKETS: { id: ServiceBucket; label: string; color: string; description?: string }[] = [
  { id: 'unassigned', label: 'Needs Review', color: INK.rose, description: 'New services synced from your EHR' },
  { id: 'sessions', label: 'Sessions', color: INK.emerald, description: 'Count toward session goals' },
  { id: 'other', label: 'Other Work', color: INK.amber, description: 'Tracked but not session goals' },
  { id: 'excluded', label: 'Excluded', color: INK.faded, description: 'Ignored in all metrics' },
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
  // All sections expanded by default
  const [expanded, setExpanded] = useState<Set<ServiceBucket>>(
    new Set(BUCKETS.map((b) => b.id))
  );

  const toggleExpanded = (bucketId: ServiceBucket) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(bucketId)) {
        next.delete(bucketId);
      } else {
        next.add(bucketId);
      }
      return next;
    });
  };

  const byBucket = useMemo(() => {
    return BUCKETS.reduce((acc, b) => {
      acc[b.id] = services.filter((s) => s.bucket === b.id);
      return acc;
    }, {} as Record<ServiceBucket, ServiceMapping[]>);
  }, [services]);

  const updateService = (id: string, updates: Partial<ServiceMapping>) => {
    onUpdate(services.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const unassignedCount = byBucket['unassigned']?.length || 0;

  return (
    <LedgerCard>
      <div className="p-8">
        {/* Section header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2
              style={{
                fontFamily: FONT.serif,
                fontSize: 24,
                fontWeight: 400,
                color: INK.black,
                letterSpacing: '-0.01em',
              }}
            >
              Service Mapping
            </h2>
            <p
              style={{
                fontFamily: FONT.sans,
                fontSize: 14,
                color: INK.muted,
                marginTop: 6,
              }}
            >
              Categorize appointment types to determine what counts toward goals
            </p>
          </div>
          <div className="flex items-center gap-5">
            {BUCKETS.map((b) => (
              <div key={b.id} className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: b.color }}
                />
                <span
                  style={{
                    fontFamily: FONT.mono,
                    fontSize: 13,
                    color: b.id === 'unassigned' && byBucket[b.id]?.length > 0 ? INK.rose : INK.muted,
                    fontWeight: b.id === 'unassigned' && byBucket[b.id]?.length > 0 ? 600 : 500,
                  }}
                >
                  {byBucket[b.id]?.length || 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Buckets */}
        <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${INK.rule}` }}>
          {BUCKETS.map((bucket, idx) => {
            const items = byBucket[bucket.id] || [];
            const isExpanded = expanded.has(bucket.id);
            const isLast = idx === BUCKETS.length - 1;
            const isUnassigned = bucket.id === 'unassigned';
            const hasUnassigned = isUnassigned && items.length > 0;

            return (
              <div
                key={bucket.id}
                style={{
                  borderBottom: isLast ? 'none' : `1px solid ${INK.rule}`,
                  backgroundColor: hasUnassigned ? `${INK.rose}08` : 'transparent',
                }}
              >
                {/* Bucket header */}
                <button
                  onClick={() => toggleExpanded(bucket.id)}
                  className="w-full px-5 py-4 flex items-center justify-between transition-colors hover:bg-stone-50"
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
                      <ChevronRight size={16} color={INK.faded} />
                    </motion.div>
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: bucket.color }}
                    />
                    <div className="flex items-center gap-2.5">
                      <span
                        style={{
                          fontFamily: FONT.sans,
                          fontSize: 15,
                          fontWeight: 600,
                          color: hasUnassigned ? INK.rose : INK.body,
                        }}
                      >
                        {bucket.label}
                      </span>
                      {bucket.description && (
                        <span
                          style={{
                            fontFamily: FONT.sans,
                            fontSize: 13,
                            color: INK.muted,
                          }}
                        >
                          — {bucket.description}
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className="px-2.5 py-1 rounded-full"
                    style={{
                      fontFamily: FONT.mono,
                      fontSize: 12,
                      fontWeight: 600,
                      color: hasUnassigned ? 'white' : INK.body,
                      backgroundColor: hasUnassigned ? INK.rose : INK.cream,
                    }}
                  >
                    {items.length}
                  </span>
                </button>

                {/* Expanded content */}
                <AnimatePresence initial={false}>
                  {isExpanded && items.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4">
                        <AnimatePresence mode="popLayout">
                          {items.map((service, serviceIdx) => (
                            <motion.div
                              key={service.id}
                              layout
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10, transition: { duration: 0.15 } }}
                              transition={{ duration: 0.2, delay: serviceIdx * 0.02 }}
                              className="flex items-center justify-between py-3.5 group"
                              style={{
                                borderBottom: serviceIdx < items.length - 1 ? `1px solid ${INK.rule}` : 'none',
                              }}
                            >
                              {/* Service info */}
                              <div className="flex items-center gap-4">
                                <span
                                  className="px-2 py-1 rounded"
                                  style={{
                                    fontFamily: FONT.mono,
                                    fontSize: 11,
                                    fontWeight: 500,
                                    backgroundColor: INK.cream,
                                    color: INK.faded,
                                  }}
                                >
                                  {service.code}
                                </span>
                                <span
                                  style={{
                                    fontFamily: FONT.sans,
                                    fontSize: 14,
                                    color: INK.body,
                                  }}
                                >
                                  {service.name}
                                </span>
                              </div>

                              {/* Controls */}
                              <div className="flex items-center gap-3">
                                {/* Category dropdown (not for excluded/unassigned) */}
                                {bucket.id !== 'excluded' && bucket.id !== 'unassigned' && (
                                  <select
                                    value={service.category || ''}
                                    onChange={(e) =>
                                      updateService(service.id, {
                                        category: (e.target.value as ServiceCategory) || undefined,
                                      })
                                    }
                                    className="px-3 py-1.5 rounded-md border bg-white outline-none"
                                    style={{
                                      fontFamily: FONT.sans,
                                      fontSize: 13,
                                      color: service.category ? INK.body : INK.ghost,
                                      borderColor: INK.rule,
                                    }}
                                  >
                                    <option value="">Category...</option>
                                    {CATEGORIES.map((c) => (
                                      <option key={c.value} value={c.value}>
                                        {c.label}
                                      </option>
                                    ))}
                                  </select>
                                )}

                                {/* Bucket dropdown - move to different section */}
                                <select
                                  value={bucket.id}
                                  onChange={(e) => {
                                    const newBucket = e.target.value as ServiceBucket;
                                    if (newBucket === 'unassigned') return; // Can't move back to unassigned
                                    // Clear category if moving to excluded
                                    const updates: Partial<ServiceMapping> = {
                                      bucket: newBucket as ServiceBucket,
                                    };
                                    if (newBucket === 'excluded') {
                                      updates.category = undefined;
                                    }
                                    updateService(service.id, updates);
                                  }}
                                  className="px-3 py-1.5 rounded-md border outline-none transition-colors"
                                  style={{
                                    fontFamily: FONT.sans,
                                    fontSize: 13,
                                    fontWeight: 500,
                                    color: bucket.color,
                                    borderColor: `${bucket.color}40`,
                                    backgroundColor: `${bucket.color}08`,
                                  }}
                                >
                                  {/* Show current unassigned state if applicable */}
                                  {isUnassigned && (
                                    <option value="unassigned">Unassigned</option>
                                  )}
                                  {BUCKETS.filter((b) => b.id !== 'unassigned').map((b) => (
                                    <option key={b.id} value={b.id}>
                                      {isUnassigned ? `→ ${b.label}` : b.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Empty state for expanded sections */}
                {isExpanded && items.length === 0 && (
                  <div className="px-5 pb-5">
                    <div
                      className="py-8 text-center rounded-lg"
                      style={{ backgroundColor: INK.cream }}
                    >
                      <span
                        style={{
                          fontFamily: FONT.sans,
                          fontSize: 13,
                          color: INK.muted,
                        }}
                      >
                        {isUnassigned ? 'All services have been categorized' : 'No services in this category'}
                      </span>
                    </div>
                  </div>
                )}
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
  const [locationGroups, setLocationGroups] = useState<LocationGroup[]>(MOCK_LOCATION_GROUPS);
  const [ehrOffices] = useState<RawEHROffice[]>(MOCK_EHR_OFFICES);

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
      {/* Settings Card */}
      <LedgerCard>
        <div className="p-8">
          {/* Header inside card - matches Clinicians tab style */}
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

              {/* Churn Classification */}
              <SettingRowChurn
                early={thresholds.earlyChurnSessions}
                late={thresholds.lateChurnSessions}
                onEarlyChange={(v) => setThresholds({ ...thresholds, earlyChurnSessions: v })}
                onLateChange={(v) => setThresholds({ ...thresholds, lateChurnSessions: v })}
                description="When a client leaves, classify by total sessions attended. Early churn signals intake issues; late churn suggests treatment completion or life changes."
              />

            </tbody>
          </table>
        </div>
      </LedgerCard>

      {/* Location Mapping */}
      <LedgerCard className="mt-6">
        <div className="p-6">
          <OfficeMapping
            ehrOffices={ehrOffices}
            locationGroups={locationGroups}
            onUpdateGroups={setLocationGroups}
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
