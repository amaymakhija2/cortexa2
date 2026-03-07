import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lightbulb } from 'lucide-react';
import { FONT, INK, SHADOW, EASE, PrimaryButton } from './shared';
import type { Clinician } from './shared';

// =============================================================================
// GOAL EDITOR MODAL - The Visual Timeline (Refined)
// =============================================================================
// A unified interface for viewing history AND setting future goals.
// Each month is a bar anchored to a baseline. Drag the TOP of any bar to
// adjust its value. Past months are sepia-toned, current is gold,
// future months are emerald (if set) or dashed (if inherited).
// =============================================================================

export type GoalMetric = 'sessions' | 'clients';

interface MonthGoal {
  month: string;
  label: string;
  value: number;
  isExplicit: boolean;
  isPast: boolean;
  isCurrent: boolean;
}

interface GoalEditorModalProps {
  clinician: Clinician;
  metric: GoalMetric;
  currentValue: number;
  history?: Array<{ month: string; value: number }>;
  actualAverage?: number;
  onSave: (monthlyGoals: Array<{ month: string; value: number }>) => void;
  onClose: () => void;
}

// =============================================================================
// HELPERS
// =============================================================================

function getMonthRange(): { start: Date; end: Date; current: Date } {
  const now = new Date();
  const current = new Date(now.getFullYear(), now.getMonth(), 1);
  const start = new Date(current);
  start.setMonth(start.getMonth() - 6);
  const end = new Date(current);
  end.setMonth(end.getMonth() + 5);
  return { start, end, current };
}

function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

function formatMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function generateMonths(
  currentValue: number,
  history?: Array<{ month: string; value: number }>
): MonthGoal[] {
  const { start, end, current } = getMonthRange();
  const months: MonthGoal[] = [];
  const historyMap = new Map(history?.map(h => [h.month, h.value]) || []);

  const cursor = new Date(start);
  let lastExplicitValue = currentValue;

  while (cursor <= end) {
    const key = formatMonthKey(cursor);
    const isPast = cursor < current;
    const isCurrent = cursor.getTime() === current.getTime();
    const isFuture = cursor > current;

    const explicitValue = historyMap.get(key);
    const isExplicit = explicitValue !== undefined || isCurrent;

    let value: number;
    if (explicitValue !== undefined) {
      value = explicitValue;
      lastExplicitValue = explicitValue;
    } else if (isCurrent) {
      value = currentValue;
      lastExplicitValue = currentValue;
    } else if (isFuture) {
      value = lastExplicitValue;
    } else {
      value = currentValue;
    }

    months.push({
      month: key,
      label: formatMonthLabel(cursor),
      value,
      isExplicit,
      isPast,
      isCurrent,
    });

    cursor.setMonth(cursor.getMonth() + 1);
  }

  return months;
}

// =============================================================================
// SINGLE MONTH BAR - Baseline-Anchored with Drag Handle
// =============================================================================

interface MonthBarProps {
  data: MonthGoal;
  index: number;
  maxValue: number;
  minValue: number;
  chartHeight: number;
  onChange: (value: number) => void;
  metric: GoalMetric;
  activeDragIndex: number | null;
  onDragStart: (index: number) => void;
  onDragEnd: () => void;
}

const MonthBar: React.FC<MonthBarProps> = ({
  data,
  index,
  maxValue,
  minValue,
  chartHeight,
  onChange,
  metric,
  activeDragIndex,
  onDragStart,
  onDragEnd,
}) => {
  const barRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [localValue, setLocalValue] = useState(data.value);
  const isDragging = activeDragIndex === index;

  // Sync local value with prop
  useEffect(() => {
    if (!isDragging) {
      setLocalValue(data.value);
    }
  }, [data.value, isDragging]);

  // Calculate bar height as proportion of chart height
  const range = maxValue - minValue;
  const valueNormalized = range > 0 ? (localValue - minValue) / range : 0.5;
  const barHeight = Math.max(16, valueNormalized * chartHeight);

  // Handle pointer down on drag handle
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
    onDragStart(index);

    const startY = e.clientY;
    const startValue = localValue;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaY = startY - moveEvent.clientY; // Up = positive delta
      const valueDelta = (deltaY / chartHeight) * range;
      const newValue = Math.round(
        Math.max(minValue, Math.min(maxValue, startValue + valueDelta))
      );
      setLocalValue(newValue);
    };

    const handlePointerUp = () => {
      target.releasePointerCapture(e.pointerId);
      onChange(localValue);
      onDragEnd();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  }, [index, localValue, chartHeight, range, minValue, maxValue, onChange, onDragStart, onDragEnd]);

  // Commit value when drag ends
  useEffect(() => {
    if (activeDragIndex !== index && localValue !== data.value) {
      // Not dragging this bar anymore, ensure value is committed
    }
  }, [activeDragIndex, index, localValue, data.value]);

  // Bar appearance based on state
  const getBarStyle = () => {
    if (data.isCurrent) {
      return {
        background: `linear-gradient(180deg, ${INK.gold} 0%, #b8941f 100%)`,
        borderColor: INK.gold,
        isDashed: false,
      };
    }
    if (data.isPast) {
      return {
        background: `linear-gradient(180deg, #a09080 0%, #8a7a6a 100%)`,
        borderColor: '#8a7a6a',
        isDashed: false,
      };
    }
    // Future
    if (data.isExplicit) {
      return {
        background: `linear-gradient(180deg, ${INK.emerald} 0%, #047857 100%)`,
        borderColor: INK.emerald,
        isDashed: false,
      };
    }
    // Future inherited (dashed outline)
    return {
      background: 'transparent',
      borderColor: INK.ghost,
      isDashed: true,
    };
  };

  const barStyle = getBarStyle();
  const displayValue = isDragging ? localValue : data.value;

  return (
    <div
      className="flex flex-col items-center"
      style={{ width: 72 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Value label - positioned above */}
      <motion.div
        className="h-8 flex items-end justify-center pb-1"
        animate={{
          scale: isDragging ? 1.1 : 1,
        }}
        transition={{ duration: 0.1 }}
      >
        <span
          style={{
            fontFamily: FONT.serif,
            fontSize: isDragging ? 22 : 18,
            fontWeight: 500,
            color: isDragging ? INK.gold : data.isCurrent ? INK.black : INK.body,
            transition: 'font-size 0.1s ease-out',
          }}
        >
          {displayValue}
        </span>
        {metric === 'sessions' && (
          <span
            style={{
              fontFamily: FONT.sans,
              fontSize: 10,
              color: INK.ghost,
              marginLeft: 2,
              marginBottom: 2,
            }}
          >
            /wk
          </span>
        )}
      </motion.div>

      {/* Bar container - fixed height, bars grow from bottom */}
      <div
        ref={barRef}
        className="relative w-full flex justify-center"
        style={{ height: chartHeight }}
      >
        {/* Baseline */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{ backgroundColor: INK.rule }}
        />

        {/* The bar itself - anchored to bottom */}
        <motion.div
          className="absolute bottom-0 rounded-t-lg overflow-hidden"
          style={{
            width: 32,
            background: barStyle.background,
            border: barStyle.isDashed
              ? `2px dashed ${barStyle.borderColor}`
              : 'none',
            boxShadow: isDragging
              ? `0 0 0 3px ${INK.goldGlow}, 0 -4px 20px rgba(0,0,0,0.15)`
              : isHovered
                ? '0 -2px 12px rgba(0,0,0,0.08)'
                : 'none',
          }}
          initial={false}
          animate={{ height: barHeight }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 40,
            mass: 0.5,
          }}
        >
          {/* Drag handle at top of bar */}
          <div
            className="absolute top-0 left-0 right-0 h-6 cursor-ns-resize flex items-center justify-center"
            style={{
              background: isDragging
                ? 'rgba(255,255,255,0.2)'
                : isHovered
                  ? 'rgba(255,255,255,0.1)'
                  : 'transparent',
              transition: 'background 0.15s',
            }}
            onPointerDown={handlePointerDown}
          >
            {/* Grip dots - visible on hover or drag */}
            <motion.div
              className="flex flex-col gap-0.5"
              animate={{ opacity: isHovered || isDragging ? 1 : 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-white/70" />
                <div className="w-1 h-1 rounded-full bg-white/70" />
              </div>
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-white/70" />
                <div className="w-1 h-1 rounded-full bg-white/70" />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Month label */}
      <div
        className="mt-2 text-center"
        style={{
          fontFamily: FONT.sans,
          fontSize: 11,
          fontWeight: data.isCurrent ? 600 : 400,
          color: data.isCurrent ? INK.black : data.isPast ? INK.faded : INK.muted,
        }}
      >
        {data.label}
      </div>

      {/* Current month badge */}
      {data.isCurrent && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + index * 0.02 }}
          className="mt-1"
        >
          <div
            className="px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: INK.goldGlow,
              border: `1px solid ${INK.gold}40`,
            }}
          >
            <span
              style={{
                fontFamily: FONT.sans,
                fontSize: 8,
                fontWeight: 600,
                color: INK.gold,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Today
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// =============================================================================
// SMART SUGGESTION BANNER
// =============================================================================

interface SuggestionBannerProps {
  clinicianName: string;
  actualAverage?: number;
  currentGoal: number;
  metric: GoalMetric;
}

const SuggestionBanner: React.FC<SuggestionBannerProps> = ({
  clinicianName,
  actualAverage,
  currentGoal,
  metric,
}) => {
  if (actualAverage === undefined) return null;

  const diff = actualAverage - currentGoal;
  const firstName = clinicianName.split(' ')[0];
  const unit = metric === 'sessions' ? '/wk' : '';

  let suggestion: string;
  if (Math.abs(diff) < 2) {
    suggestion = `${firstName} averages ${actualAverage}${unit} — right on target.`;
  } else if (diff > 0) {
    suggestion = `${firstName} averages ${actualAverage}${unit} — consider raising to ${Math.round(actualAverage)}.`;
  } else {
    suggestion = `${firstName} averages ${actualAverage}${unit} — current goal may be ambitious.`;
  }

  return (
    <motion.div
      className="flex items-start gap-3 p-4 rounded-xl"
      style={{
        backgroundColor: INK.cream,
        border: `1px solid ${INK.rule}`,
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.3 }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: INK.goldGlow }}
      >
        <Lightbulb size={16} color={INK.gold} />
      </div>
      <p
        style={{
          fontFamily: FONT.sans,
          fontSize: 14,
          color: INK.body,
          lineHeight: 1.5,
        }}
      >
        {suggestion}
      </p>
    </motion.div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const GoalEditorModal: React.FC<GoalEditorModalProps> = ({
  clinician,
  metric,
  currentValue,
  history,
  actualAverage,
  onSave,
  onClose,
}) => {
  const [months, setMonths] = useState<MonthGoal[]>(() =>
    generateMonths(currentValue, history)
  );
  const [activeDragIndex, setActiveDragIndex] = useState<number | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Calculate value range with padding
  const allValues = months.map(m => m.value);
  const dataMin = Math.min(...allValues);
  const dataMax = Math.max(...allValues);
  const padding = Math.max(10, Math.round((dataMax - dataMin) * 0.2));
  const minValue = Math.max(0, dataMin - padding);
  const maxValue = dataMax + padding;
  const chartHeight = 160;

  const handleValueChange = useCallback((index: number, newValue: number) => {
    setMonths(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], value: newValue, isExplicit: true };

      // Propagate to future non-explicit months
      for (let i = index + 1; i < updated.length; i++) {
        if (!updated[i].isExplicit) {
          updated[i] = { ...updated[i], value: newValue };
        } else {
          break;
        }
      }

      return updated;
    });
    setHasChanges(true);
  }, []);

  const handleSave = () => {
    const goalData = months
      .filter(m => m.isExplicit)
      .map(m => ({ month: m.month, value: m.value }));
    onSave(goalData);
    onClose();
  };

  const metricLabel = metric === 'sessions' ? 'Sessions Goal' : 'Clients Goal';

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 z-[9999]"
        style={{
          background: 'rgba(28, 25, 23, 0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="fixed inset-0 z-[10000] flex items-center justify-center p-6 lg:pl-[100px]"
        style={{ pointerEvents: 'none' }}
      >
        <div
          className="relative w-full max-w-5xl overflow-hidden rounded-3xl"
          style={{
            pointerEvents: 'auto',
            background: 'linear-gradient(145deg, #ffffff 0%, #fdfcfa 100%)',
            boxShadow: `
              0 50px 100px -20px rgba(0,0,0,0.25),
              0 30px 60px -30px rgba(0,0,0,0.3),
              0 0 0 1px rgba(0,0,0,0.05)
            `,
          }}
        >
          {/* Gold accent bar */}
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{
              background: `linear-gradient(90deg, ${INK.gold} 0%, ${INK.goldMuted} 100%)`,
            }}
          />

          {/* Header */}
          <div className="flex items-start justify-between px-10 pt-8 pb-4">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${clinician.color} 0%, ${clinician.color}cc 100%)`,
                  boxShadow: `0 4px 12px ${clinician.color}40`,
                }}
              >
                {clinician.initials}
              </div>
              <div>
                <h2
                  style={{
                    fontFamily: FONT.serif,
                    fontSize: 28,
                    fontWeight: 400,
                    color: INK.black,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {metricLabel}
                </h2>
                <p
                  className="mt-1"
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 14,
                    color: INK.muted,
                  }}
                >
                  {clinician.name} — Drag the top of any bar to adjust
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-3 rounded-xl transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: INK.cream }}
            >
              <X size={18} color={INK.muted} strokeWidth={2} />
            </button>
          </div>

          {/* Timeline chart */}
          <div className="px-10 pb-6">
            <div
              className="relative p-6 pt-4 rounded-2xl"
              style={{
                backgroundColor: INK.cream,
                border: `1px solid ${INK.rule}`,
              }}
            >
              {/* Section labels */}
              <div className="flex justify-between mb-2 px-4">
                <span
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 10,
                    fontWeight: 600,
                    color: INK.faded,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Past
                </span>
                <span
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 10,
                    fontWeight: 600,
                    color: INK.faded,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Future
                </span>
              </div>

              {/* Bars grid */}
              <div className="flex justify-between px-2">
                {months.map((month, index) => (
                  <motion.div
                    key={month.month}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.025, duration: 0.3 }}
                  >
                    <MonthBar
                      data={month}
                      index={index}
                      maxValue={maxValue}
                      minValue={minValue}
                      chartHeight={chartHeight}
                      onChange={(value) => handleValueChange(index, value)}
                      metric={metric}
                      activeDragIndex={activeDragIndex}
                      onDragStart={setActiveDragIndex}
                      onDragEnd={() => setActiveDragIndex(null)}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Helper text */}
              <div
                className="text-center mt-4 pt-3"
                style={{ borderTop: `1px dashed ${INK.rule}` }}
              >
                <span
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 12,
                    color: INK.ghost,
                  }}
                >
                  Future months without explicit values inherit from the last set goal
                </span>
              </div>
            </div>
          </div>

          {/* Suggestion banner */}
          <div className="px-10 pb-6">
            <SuggestionBanner
              clinicianName={clinician.name}
              actualAverage={actualAverage}
              currentGoal={currentValue}
              metric={metric}
            />
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-end gap-3 px-10 py-5"
            style={{
              borderTop: `1px solid ${INK.rule}`,
              backgroundColor: INK.paper,
            }}
          >
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl transition-colors"
              style={{
                fontFamily: FONT.sans,
                fontSize: 14,
                fontWeight: 500,
                color: INK.muted,
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = INK.black)}
              onMouseLeave={(e) => (e.currentTarget.style.color = INK.muted)}
            >
              Cancel
            </button>

            <PrimaryButton
              onClick={handleSave}
              variant={hasChanges ? 'emerald' : 'stone'}
              disabled={!hasChanges}
            >
              Save Changes
            </PrimaryButton>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default GoalEditorModal;
