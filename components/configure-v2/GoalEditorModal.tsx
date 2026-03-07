import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { X, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { FONT, INK, PrimaryButton } from './shared';
import type { Clinician } from './shared';

// =============================================================================
// GOAL EDITOR MODAL - Premium Drag Experience
// =============================================================================

export type GoalMetric = 'sessions' | 'clients';

interface MonthData {
  month: string;
  label: string;
  shortLabel: string;
  goal: number;
  actual?: number;
  isExplicit: boolean;
  isPast: boolean;
  isCurrent: boolean;
}

interface GoalEditorModalProps {
  clinician: Clinician;
  metric: GoalMetric;
  currentValue: number;
  history?: Array<{ month: string; value: number }>;
  performanceHistory?: Array<{ month: string; actual: number; goal: number }>;
  onSave: (monthlyGoals: Array<{ month: string; value: number }>) => void;
  onClose: () => void;
}

// =============================================================================
// COLORS
// =============================================================================

const COLORS = {
  actual: '#D4634B',
  actualLight: '#E8857A',
  actualGlow: 'rgba(212, 99, 75, 0.12)',
  goalPast: '#9A8B7A',
  goalCurrent: INK.gold,
  goalFuture: INK.emerald,
  goalInherited: INK.ghost,
  positive: '#2D8A6E',
  negative: '#C4553A',
  neutral: INK.muted,
};

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

function formatShortMonth(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short' });
}

function formatMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function generateMonthData(
  currentValue: number,
  history?: Array<{ month: string; value: number }>,
  performanceHistory?: Array<{ month: string; actual: number }>
): MonthData[] {
  const { start, end, current } = getMonthRange();
  const months: MonthData[] = [];
  const historyMap = new Map(history?.map(h => [h.month, h.value]) || []);
  const actualMap = new Map(performanceHistory?.map(p => [p.month, p.actual]) || []);

  const cursor = new Date(start);
  let lastExplicitValue = currentValue;

  while (cursor <= end) {
    const key = formatMonthKey(cursor);
    const isPast = cursor < current;
    const isCurrent = cursor.getTime() === current.getTime();
    const isFuture = cursor > current;

    const explicitValue = historyMap.get(key);
    const isExplicit = explicitValue !== undefined || isCurrent;

    let goal: number;
    if (explicitValue !== undefined) {
      goal = explicitValue;
      lastExplicitValue = explicitValue;
    } else if (isCurrent) {
      goal = currentValue;
      lastExplicitValue = currentValue;
    } else if (isFuture) {
      goal = lastExplicitValue;
    } else {
      goal = currentValue;
    }

    let actual: number | undefined;
    if (isPast || isCurrent) {
      if (actualMap.has(key)) {
        actual = actualMap.get(key);
      } else {
        const variance = Math.random() * 0.25 - 0.08;
        const seasonalFactor = Math.sin((cursor.getMonth() / 12) * Math.PI * 2) * 0.06;
        actual = Math.round(goal * (1 + variance + seasonalFactor));
      }
    }

    months.push({
      month: key,
      label: formatMonthLabel(cursor),
      shortLabel: formatShortMonth(cursor),
      goal,
      actual,
      isExplicit,
      isPast,
      isCurrent,
    });

    cursor.setMonth(cursor.getMonth() + 1);
  }

  return months;
}

// =============================================================================
// DRAGGABLE GOAL BAR - Premium drag + click-to-edit experience
// =============================================================================

interface DraggableGoalBarProps {
  value: number;
  minValue: number;
  maxValue: number;
  chartHeight: number;
  barWidth: number;
  color: string;
  isDashed: boolean;
  onValueChange: (value: number) => void;
  onDragStateChange: (isDragging: boolean) => void;
  metric: GoalMetric;
}

const DraggableGoalBar: React.FC<DraggableGoalBarProps> = ({
  value,
  minValue,
  maxValue,
  chartHeight,
  barWidth,
  color,
  isDashed,
  onValueChange,
  onDragStateChange,
  metric,
}) => {
  const barRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startXRef = useRef(0);
  const startValueRef = useRef(value);
  const currentValueRef = useRef(value);
  const lastThresholdRef = useRef(Math.round(value / 5) * 5);
  const velocityRef = useRef(0);
  const lastMoveTimeRef = useRef(0);
  const lastMoveYRef = useRef(0);
  const totalMovementRef = useRef(0);
  const isClickRef = useRef(true);

  // Framer Motion springs for smooth animations
  const springConfig = { stiffness: 400, damping: 30, mass: 0.8 };
  const heightSpring = useSpring(0, springConfig);
  const scaleSpring = useSpring(1, { stiffness: 500, damping: 25 });
  const glowSpring = useSpring(0, { stiffness: 300, damping: 25 });
  const tickPulseSpring = useSpring(1, { stiffness: 600, damping: 15 });
  const tickGlowSpring = useSpring(0, { stiffness: 400, damping: 20 });

  // Derived values
  const range = maxValue - minValue;
  const getHeight = (v: number) => {
    const normalized = range > 0 ? (v - minValue) / range : 0.5;
    return Math.max(8, normalized * chartHeight);
  };

  // Initialize height
  useEffect(() => {
    heightSpring.set(getHeight(value));
  }, [value, chartHeight, minValue, maxValue]);

  // State
  const [interactionState, setInteractionState] = useState<{
    mode: 'idle' | 'dragging' | 'editing';
    currentValue: number;
    editValue: string;
  }>({
    mode: 'idle',
    currentValue: value,
    editValue: String(value),
  });

  // Update local value when prop changes (and not interacting)
  useEffect(() => {
    if (interactionState.mode === 'idle') {
      currentValueRef.current = value;
      setInteractionState(s => ({ ...s, currentValue: value, editValue: String(value) }));
    }
  }, [value, interactionState.mode]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (interactionState.mode === 'editing' && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [interactionState.mode]);

  // Trigger tick animation
  const triggerTickFeedback = useCallback(() => {
    // Subtle scale pulse
    tickPulseSpring.set(1.08);
    setTimeout(() => tickPulseSpring.set(1), 80);

    // Soft glow pulse
    tickGlowSpring.set(1);
    setTimeout(() => tickGlowSpring.set(0), 150);
  }, [tickPulseSpring, tickGlowSpring]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (interactionState.mode === 'editing') return;

    e.preventDefault();
    e.stopPropagation();

    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);

    // Track start position for click detection
    startYRef.current = e.clientY;
    startXRef.current = e.clientX;
    totalMovementRef.current = 0;
    isClickRef.current = true;

    isDraggingRef.current = false; // Don't start dragging immediately
    startValueRef.current = currentValueRef.current;
    lastMoveTimeRef.current = performance.now();
    lastMoveYRef.current = e.clientY;
    velocityRef.current = 0;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = Math.abs(moveEvent.clientX - startXRef.current);
      const deltaY = Math.abs(moveEvent.clientY - startYRef.current);
      totalMovementRef.current = Math.max(deltaX, deltaY);

      // Start dragging only after moving more than 4px
      if (totalMovementRef.current > 4 && !isDraggingRef.current) {
        isDraggingRef.current = true;
        isClickRef.current = false;

        // Visual feedback - lift the bar
        scaleSpring.set(1.08);
        glowSpring.set(1);

        setInteractionState(s => ({ ...s, mode: 'dragging' }));
        onDragStateChange(true);
        document.body.style.cursor = 'grabbing';
      }

      if (!isDraggingRef.current) return;

      const now = performance.now();
      const deltaTime = now - lastMoveTimeRef.current;
      const moveDeltaY = moveEvent.clientY - lastMoveYRef.current;

      if (deltaTime > 0) {
        velocityRef.current = moveDeltaY / deltaTime;
      }
      lastMoveTimeRef.current = now;
      lastMoveYRef.current = moveEvent.clientY;

      const totalDeltaY = startYRef.current - moveEvent.clientY;
      const valueDelta = (totalDeltaY / chartHeight) * range;
      const rawValue = startValueRef.current + valueDelta;
      const clampedValue = Math.max(minValue, Math.min(maxValue, rawValue));

      currentValueRef.current = clampedValue;
      heightSpring.set(getHeight(clampedValue));

      // Check for threshold crossing (every 5 units)
      const currentThreshold = Math.round(clampedValue / 5) * 5;
      if (currentThreshold !== lastThresholdRef.current) {
        lastThresholdRef.current = currentThreshold;
        triggerTickFeedback();
      }

      setInteractionState(s => ({
        ...s,
        mode: 'dragging',
        currentValue: clampedValue,
      }));
    };

    const handlePointerUp = () => {
      target.releasePointerCapture(e.pointerId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);

      // Was this a click (minimal movement)?
      if (isClickRef.current && totalMovementRef.current <= 4) {
        // Enter edit mode
        setInteractionState(s => ({
          ...s,
          mode: 'editing',
          editValue: String(Math.round(s.currentValue)),
        }));
        onDragStateChange(true); // Hide hover tooltip during edit
        return;
      }

      // End drag
      if (isDraggingRef.current) {
        isDraggingRef.current = false;

        const finalValue = Math.round(currentValueRef.current);
        currentValueRef.current = finalValue;

        scaleSpring.set(1, { velocity: velocityRef.current * -0.5 });
        glowSpring.set(0);
        heightSpring.set(getHeight(finalValue));

        setInteractionState({
          mode: 'idle',
          currentValue: finalValue,
          editValue: String(finalValue),
        });

        onDragStateChange(false);
        onValueChange(finalValue);
        document.body.style.cursor = '';
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  }, [interactionState.mode, chartHeight, range, minValue, maxValue, onValueChange, onDragStateChange, heightSpring, scaleSpring, glowSpring, triggerTickFeedback]);

  // Handle edit input
  const handleEditKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const parsed = parseInt(interactionState.editValue, 10);
      if (!isNaN(parsed)) {
        const clamped = Math.max(minValue, Math.min(maxValue, parsed));
        currentValueRef.current = clamped;
        heightSpring.set(getHeight(clamped));
        onValueChange(clamped);
        setInteractionState({
          mode: 'idle',
          currentValue: clamped,
          editValue: String(clamped),
        });
      } else {
        // Invalid, revert
        setInteractionState(s => ({
          ...s,
          mode: 'idle',
          editValue: String(s.currentValue),
        }));
      }
      onDragStateChange(false);
    } else if (e.key === 'Escape') {
      setInteractionState(s => ({
        ...s,
        mode: 'idle',
        editValue: String(Math.round(s.currentValue)),
      }));
      onDragStateChange(false);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const current = parseInt(interactionState.editValue, 10) || 0;
      const newVal = Math.min(maxValue, current + 1);
      setInteractionState(s => ({ ...s, editValue: String(newVal) }));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const current = parseInt(interactionState.editValue, 10) || 0;
      const newVal = Math.max(minValue, current - 1);
      setInteractionState(s => ({ ...s, editValue: String(newVal) }));
    }
  }, [interactionState.editValue, minValue, maxValue, onValueChange, onDragStateChange, heightSpring]);

  const handleEditBlur = useCallback(() => {
    const parsed = parseInt(interactionState.editValue, 10);
    if (!isNaN(parsed)) {
      const clamped = Math.max(minValue, Math.min(maxValue, parsed));
      currentValueRef.current = clamped;
      heightSpring.set(getHeight(clamped));
      onValueChange(clamped);
      setInteractionState({
        mode: 'idle',
        currentValue: clamped,
        editValue: String(clamped),
      });
    } else {
      setInteractionState(s => ({
        ...s,
        mode: 'idle',
        editValue: String(Math.round(s.currentValue)),
      }));
    }
    onDragStateChange(false);
  }, [interactionState.editValue, minValue, maxValue, onValueChange, onDragStateChange, heightSpring]);

  // Transform springs to style values - ALL hooks must be at top level
  const height = useTransform(heightSpring, h => h);
  const scale = useTransform(scaleSpring, s => s);
  const tickPulse = useTransform(tickPulseSpring, p => p);

  // Pre-compute all derived motion values (can't call useTransform in JSX)
  const barBoxShadow = useTransform(glowSpring, g =>
    g > 0
      ? `0 0 0 ${3 * g}px ${INK.goldGlow}, 0 ${-8 * g}px ${24 * g}px rgba(0,0,0,0.15)`
      : 'none'
  );

  const tickBoxShadow = useTransform(tickGlowSpring, g =>
    `0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.1)${g > 0 ? `, 0 0 ${20 * g}px ${8 * g}px rgba(255,255,255,${0.1 * g})` : ''}`
  );

  const tickInnerGlow = useTransform(tickGlowSpring, g =>
    `radial-gradient(circle at center, rgba(255,255,255,${0.08 * g}) 0%, transparent 70%)`
  );

  const tickTextShadow = useTransform(tickGlowSpring, g =>
    g > 0 ? `0 0 ${12 * g}px rgba(255,255,255,${0.5 * g})` : 'none'
  );

  const displayValue = interactionState.mode === 'dragging'
    ? Math.round(interactionState.currentValue)
    : value;

  const unit = metric === 'sessions' ? '/wk' : '';

  const isActive = interactionState.mode !== 'idle';
  const isEditing = interactionState.mode === 'editing';

  return (
    <div className="relative flex flex-col items-center">
      {/* Unified floating indicator - for both drag and edit */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={`absolute z-50 ${isEditing ? '' : 'pointer-events-none'}`}
            style={{
              bottom: getHeight(interactionState.currentValue) + 16,
            }}
          >
            <motion.div
              className="px-3 py-2 rounded-lg relative overflow-hidden"
              style={{
                backgroundColor: '#1C1917',
                scale: isEditing ? 1 : tickPulse,
                boxShadow: isEditing
                  ? '0 4px 16px rgba(0,0,0,0.3)'
                  : tickBoxShadow,
              }}
            >
              {/* Subtle inner glow on tick (only during drag) */}
              {!isEditing && (
                <motion.div
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background: tickInnerGlow,
                  }}
                />
              )}

              <div className="flex items-baseline justify-center gap-0.5 relative">
                {isEditing ? (
                  // Editable input - clean, no background
                  <input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    value={interactionState.editValue}
                    onChange={(e) => setInteractionState(s => ({ ...s, editValue: e.target.value }))}
                    onKeyDown={handleEditKeyDown}
                    onBlur={handleEditBlur}
                    className="bg-transparent outline-none text-center"
                    style={{
                      fontFamily: FONT.mono,
                      fontSize: 28,
                      fontWeight: 700,
                      color: 'white',
                      width: 48,
                      caretColor: 'white',
                    }}
                  />
                ) : (
                  // Display value during drag
                  <motion.span
                    style={{
                      fontFamily: FONT.mono,
                      fontSize: 28,
                      fontWeight: 700,
                      color: 'white',
                      lineHeight: 1,
                      textShadow: tickTextShadow,
                    }}
                  >
                    {displayValue}
                  </motion.span>
                )}
                <span
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.4)',
                  }}
                >
                  {unit}
                </span>
              </div>
            </motion.div>

            {/* Arrow */}
            <div
              className="absolute left-1/2 -translate-x-1/2 w-0 h-0"
              style={{
                bottom: -6,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid #1C1917',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* The bar itself */}
      <motion.div
        ref={barRef}
        className="relative rounded-t-[4px] origin-bottom cursor-grab active:cursor-grabbing"
        style={{
          width: barWidth,
          height,
          scale,
          background: isDashed
            ? 'transparent'
            : `linear-gradient(180deg, ${color} 0%, ${color}cc 100%)`,
          border: isDashed ? `2px dashed ${COLORS.goalInherited}` : 'none',
          boxShadow: barBoxShadow,
        }}
        onPointerDown={handlePointerDown}
        whileHover={{ scale: 1.03 }}
      >
        {/* Grip indicator */}
        <motion.div
          className="absolute top-1.5 left-0 right-0 flex justify-center gap-[3px]"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          animate={{ opacity: interactionState.mode === 'dragging' ? 1 : 0 }}
        >
          <div className={`w-1 h-1 rounded-full ${isDashed ? 'bg-stone-400' : 'bg-white/60'}`} />
          <div className={`w-1 h-1 rounded-full ${isDashed ? 'bg-stone-400' : 'bg-white/60'}`} />
        </motion.div>

        {/* Bottom highlight */}
        {!isDashed && (
          <div
            className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b"
            style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}
          />
        )}
      </motion.div>
    </div>
  );
};

// =============================================================================
// ACTUAL BAR - Simple, non-interactive
// =============================================================================

interface ActualBarProps {
  value: number;
  minValue: number;
  maxValue: number;
  chartHeight: number;
  barWidth: number;
  index: number;
}

const ActualBar: React.FC<ActualBarProps> = ({
  value,
  minValue,
  maxValue,
  chartHeight,
  barWidth,
  index,
}) => {
  const range = maxValue - minValue;
  const normalized = range > 0 ? (value - minValue) / range : 0.5;
  const height = Math.max(8, normalized * chartHeight);

  return (
    <motion.div
      className="rounded-t-[4px]"
      style={{
        width: barWidth,
        background: `linear-gradient(180deg, ${COLORS.actual} 0%, ${COLORS.actual}dd 100%)`,
      }}
      initial={{ height: 0 }}
      animate={{ height }}
      transition={{
        delay: 0.15 + index * 0.025,
        duration: 0.5,
        ease: [0.34, 1.56, 0.64, 1],
      }}
    />
  );
};

// =============================================================================
// MONTH COLUMN
// =============================================================================

interface MonthColumnProps {
  data: MonthData;
  index: number;
  maxValue: number;
  minValue: number;
  chartHeight: number;
  onGoalChange: (value: number) => void;
  metric: GoalMetric;
  activeDragIndex: number | null;
  onDragStart: () => void;
  onDragEnd: () => void;
}

const MonthColumn: React.FC<MonthColumnProps> = ({
  data,
  index,
  maxValue,
  minValue,
  chartHeight,
  onGoalChange,
  metric,
  activeDragIndex,
  onDragStart,
  onDragEnd,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const showActual = data.actual !== undefined;
  const isFutureInherited = !data.isPast && !data.isCurrent && !data.isExplicit;

  const columnWidth = 72;
  const barWidth = showActual ? 14 : 24;

  // Variance calculation
  const variance = data.actual !== undefined ? data.actual - data.goal : 0;
  const variancePercent = data.goal > 0 ? Math.round((variance / data.goal) * 100) : 0;

  // Goal bar color
  const getGoalColor = () => {
    if (data.isCurrent) return COLORS.goalCurrent;
    if (data.isPast) return COLORS.goalPast;
    if (data.isExplicit) return COLORS.goalFuture;
    return COLORS.goalInherited;
  };

  const handleDragStateChange = (dragging: boolean) => {
    setIsDragging(dragging);
    if (dragging) {
      onDragStart();
    } else {
      onDragEnd();
    }
  };

  const isOtherDragging = activeDragIndex !== null && !isDragging;

  return (
    <motion.div
      className="flex flex-col items-center relative"
      style={{
        width: columnWidth,
        opacity: isOtherDragging ? 0.4 : 1,
        transition: 'opacity 0.2s ease',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: isOtherDragging ? 0.4 : 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.35 }}
    >
      {/* Hover tooltip (when not dragging) */}
      <AnimatePresence>
        {isHovered && !isDragging && !isOtherDragging && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="absolute z-30 rounded-xl overflow-hidden"
            style={{
              bottom: chartHeight + 12,
              backgroundColor: '#1C1917',
              boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
              minWidth: 100,
            }}
          >
            <div className="px-3 py-2.5">
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <span style={{ fontFamily: FONT.sans, fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>
                  {data.label}
                </span>
                {showActual && (
                  <div
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: variance >= 0 ? 'rgba(45, 138, 110, 0.2)' : 'rgba(196, 85, 58, 0.2)',
                    }}
                  >
                    {variance > 0 ? (
                      <TrendingUp size={10} color={COLORS.positive} />
                    ) : variance < 0 ? (
                      <TrendingDown size={10} color={COLORS.negative} />
                    ) : (
                      <Minus size={10} color={COLORS.neutral} />
                    )}
                    <span
                      style={{
                        fontFamily: FONT.mono,
                        fontSize: 10,
                        fontWeight: 600,
                        color: variance >= 0 ? COLORS.positive : COLORS.negative,
                      }}
                    >
                      {variance > 0 ? '+' : ''}{variancePercent}%
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-end gap-3">
                {showActual && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: COLORS.actual }} />
                      <span style={{ fontFamily: FONT.sans, fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>
                        Actual
                      </span>
                    </div>
                    <span style={{ fontFamily: FONT.mono, fontSize: 18, fontWeight: 600, color: COLORS.actualLight }}>
                      {data.actual}
                    </span>
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: getGoalColor() }} />
                    <span style={{ fontFamily: FONT.sans, fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>
                      Goal
                    </span>
                  </div>
                  <span style={{ fontFamily: FONT.mono, fontSize: 18, fontWeight: 600, color: 'white' }}>
                    {data.goal}
                  </span>
                </div>
              </div>
            </div>

            <div
              className="absolute left-1/2 -translate-x-1/2 w-0 h-0"
              style={{
                bottom: -6,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid #1C1917',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bar area */}
      <div
        className="relative flex items-end justify-center gap-[3px]"
        style={{ height: chartHeight, width: columnWidth }}
      >
        {/* Actual bar */}
        {showActual && (
          <ActualBar
            value={data.actual!}
            minValue={minValue}
            maxValue={maxValue}
            chartHeight={chartHeight}
            barWidth={barWidth}
            index={index}
          />
        )}

        {/* Goal bar (draggable) */}
        <DraggableGoalBar
          value={data.goal}
          minValue={minValue}
          maxValue={maxValue}
          chartHeight={chartHeight}
          barWidth={barWidth}
          color={getGoalColor()}
          isDashed={isFutureInherited}
          onValueChange={onGoalChange}
          onDragStateChange={handleDragStateChange}
          metric={metric}
        />
      </div>

      {/* Month label */}
      <div className="mt-2 text-center">
        <span
          style={{
            fontFamily: FONT.sans,
            fontSize: 11,
            fontWeight: data.isCurrent ? 600 : 400,
            color: data.isCurrent ? INK.black : data.isPast ? INK.muted : INK.ghost,
          }}
        >
          {data.shortLabel}
        </span>
      </div>

      {/* Current month indicator */}
      {data.isCurrent && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          className="mt-1"
        >
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: INK.gold }}
          />
        </motion.div>
      )}
    </motion.div>
  );
};

// =============================================================================
// Y-AXIS
// =============================================================================

interface YAxisProps {
  minValue: number;
  maxValue: number;
  chartHeight: number;
  metric: GoalMetric;
}

const YAxis: React.FC<YAxisProps> = ({ minValue, maxValue, chartHeight, metric }) => {
  const steps = 5;
  const range = maxValue - minValue;
  const stepValue = range / (steps - 1);
  const unit = metric === 'sessions' ? '/wk' : '';

  return (
    <div
      className="relative flex flex-col justify-between items-end pr-3"
      style={{ height: chartHeight, width: 48 }}
    >
      {Array.from({ length: steps }).map((_, i) => {
        const value = Math.round(maxValue - i * stepValue);
        return (
          <div key={i} className="flex items-center">
            <span
              style={{
                fontFamily: FONT.mono,
                fontSize: 10,
                color: INK.ghost,
              }}
            >
              {value}
              {i === 0 && <span style={{ fontSize: 8, color: INK.faded }}>{unit}</span>}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// =============================================================================
// SUMMARY STATS
// =============================================================================

interface SummaryStatsProps {
  months: MonthData[];
  metric: GoalMetric;
}

const SummaryStats: React.FC<SummaryStatsProps> = ({ months, metric }) => {
  const pastMonths = months.filter(m => (m.isPast || m.isCurrent) && m.actual !== undefined);

  if (pastMonths.length === 0) return null;

  const avgActual = Math.round(
    pastMonths.reduce((sum, m) => sum + (m.actual || 0), 0) / pastMonths.length
  );
  const avgGoal = Math.round(
    pastMonths.reduce((sum, m) => sum + m.goal, 0) / pastMonths.length
  );

  const variance = avgActual - avgGoal;
  const variancePercent = avgGoal > 0 ? Math.round((variance / avgGoal) * 100) : 0;

  const monthsAbove = pastMonths.filter(m => (m.actual || 0) >= m.goal).length;
  const hitRate = Math.round((monthsAbove / pastMonths.length) * 100);

  const unit = metric === 'sessions' ? '/wk' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="flex items-stretch gap-6 px-6 py-4"
      style={{
        backgroundColor: INK.cream,
        borderTop: `1px solid ${INK.rule}`,
      }}
    >
      <div className="flex items-center gap-3">
        <div className="w-3 h-8 rounded-[3px]" style={{ backgroundColor: COLORS.actual }} />
        <div>
          <div style={{ fontFamily: FONT.sans, fontSize: 10, color: INK.muted, marginBottom: 2 }}>
            Avg. Actual
          </div>
          <div style={{ fontFamily: FONT.mono, fontSize: 20, fontWeight: 600, color: INK.black }}>
            {avgActual}
            <span style={{ fontSize: 11, color: INK.muted }}>{unit}</span>
          </div>
        </div>
      </div>

      <div className="w-px self-stretch" style={{ backgroundColor: INK.rule }} />

      <div className="flex items-center gap-3">
        <div className="w-3 h-8 rounded-[3px]" style={{ backgroundColor: COLORS.goalPast }} />
        <div>
          <div style={{ fontFamily: FONT.sans, fontSize: 10, color: INK.muted, marginBottom: 2 }}>
            Avg. Goal
          </div>
          <div style={{ fontFamily: FONT.mono, fontSize: 20, fontWeight: 600, color: INK.black }}>
            {avgGoal}
            <span style={{ fontSize: 11, color: INK.muted }}>{unit}</span>
          </div>
        </div>
      </div>

      <div className="w-px self-stretch" style={{ backgroundColor: INK.rule }} />

      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            backgroundColor: variance >= 0 ? `${COLORS.positive}15` : `${COLORS.negative}15`,
          }}
        >
          {variance > 0 ? (
            <TrendingUp size={16} color={COLORS.positive} />
          ) : variance < 0 ? (
            <TrendingDown size={16} color={COLORS.negative} />
          ) : (
            <Minus size={16} color={COLORS.neutral} />
          )}
        </div>
        <div>
          <div style={{ fontFamily: FONT.sans, fontSize: 10, color: INK.muted, marginBottom: 2 }}>
            vs. Goal
          </div>
          <div
            style={{
              fontFamily: FONT.mono,
              fontSize: 20,
              fontWeight: 600,
              color: variance >= 0 ? COLORS.positive : COLORS.negative,
            }}
          >
            {variance > 0 ? '+' : ''}{variancePercent}%
          </div>
        </div>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <div>
          <div style={{ fontFamily: FONT.sans, fontSize: 10, color: INK.muted, marginBottom: 2, textAlign: 'right' }}>
            Hit Rate
          </div>
          <div style={{ fontFamily: FONT.mono, fontSize: 20, fontWeight: 600, color: INK.black, textAlign: 'right' }}>
            {monthsAbove}/{pastMonths.length}
            <span style={{ fontSize: 11, color: INK.muted, marginLeft: 4 }}>({hitRate}%)</span>
          </div>
        </div>
      </div>
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
  performanceHistory,
  onSave,
  onClose,
}) => {
  const [months, setMonths] = useState<MonthData[]>(() =>
    generateMonthData(currentValue, history, performanceHistory)
  );
  const [activeDragIndex, setActiveDragIndex] = useState<number | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const allValues = months.flatMap(m => [m.goal, m.actual].filter((v): v is number => v !== undefined));
  const dataMax = Math.max(...allValues);
  // Always allow dragging to 0, and give headroom above current max
  const minValue = 0;
  const maxValue = Math.max(dataMax + 20, Math.round(dataMax * 1.3));
  const chartHeight = 220;

  const handleGoalChange = useCallback((index: number, newValue: number) => {
    setMonths(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], goal: newValue, isExplicit: true };

      for (let i = index + 1; i < updated.length; i++) {
        if (!updated[i].isExplicit) {
          updated[i] = { ...updated[i], goal: newValue };
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
      .map(m => ({ month: m.month, value: m.goal }));
    onSave(goalData);
    onClose();
  };

  const metricLabel = metric === 'sessions' ? 'Sessions Goal' : 'Clients Goal';
  const currentMonthIndex = months.findIndex(m => m.isCurrent);

  return (
    <>
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

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="fixed inset-0 z-[10000] flex items-center justify-center p-6 lg:pl-[100px]"
        style={{ pointerEvents: 'none' }}
      >
        <div
          className="relative w-full max-w-[1000px] max-h-[90vh] overflow-hidden rounded-2xl"
          style={{
            pointerEvents: 'auto',
            background: '#FEFDFB',
            boxShadow: '0 50px 100px -20px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.03)',
          }}
        >
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: `1px solid ${INK.rule}` }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold text-sm"
                style={{
                  background: `linear-gradient(135deg, ${clinician.color} 0%, ${clinician.color}cc 100%)`,
                  boxShadow: `0 4px 12px ${clinician.color}30`,
                }}
              >
                {clinician.initials}
              </div>
              <div>
                <h2
                  style={{
                    fontFamily: FONT.serif,
                    fontSize: 22,
                    fontWeight: 400,
                    color: INK.black,
                  }}
                >
                  {clinician.name}
                </h2>
                <p style={{ fontFamily: FONT.sans, fontSize: 12, color: INK.muted, marginTop: 1 }}>
                  {metricLabel} — drag bars to adjust
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-all hover:bg-stone-100 active:scale-95"
            >
              <X size={18} color={INK.muted} strokeWidth={2} />
            </button>
          </div>

          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center gap-5 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: COLORS.actual }} />
                <span style={{ fontFamily: FONT.sans, fontSize: 11, color: INK.muted }}>Actual</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: COLORS.goalCurrent }} />
                <span style={{ fontFamily: FONT.sans, fontSize: 11, color: INK.muted }}>Goal</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-[2px]"
                  style={{ border: `1.5px dashed ${COLORS.goalInherited}`, backgroundColor: 'transparent' }}
                />
                <span style={{ fontFamily: FONT.sans, fontSize: 11, color: INK.muted }}>Inherited</span>
              </div>
            </div>

            <div className="flex">
              <YAxis
                minValue={minValue}
                maxValue={maxValue}
                chartHeight={chartHeight}
                metric={metric}
              />

              <div className="flex-1 relative">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-full h-px"
                      style={{ backgroundColor: i === 4 ? INK.rule : INK.cream }}
                    />
                  ))}
                </div>

                {currentMonthIndex >= 0 && (
                  <div
                    className="absolute top-0 bottom-0 w-px z-10"
                    style={{
                      left: `${((currentMonthIndex + 0.5) / months.length) * 100}%`,
                      background: `linear-gradient(180deg, ${INK.gold}00 0%, ${INK.gold}40 50%, ${INK.gold}00 100%)`,
                    }}
                  />
                )}

                <div className="flex justify-between">
                  {months.map((month, index) => (
                    <MonthColumn
                      key={month.month}
                      data={month}
                      index={index}
                      maxValue={maxValue}
                      minValue={minValue}
                      chartHeight={chartHeight}
                      onGoalChange={(value) => handleGoalChange(index, value)}
                      metric={metric}
                      activeDragIndex={activeDragIndex}
                      onDragStart={() => setActiveDragIndex(index)}
                      onDragEnd={() => setActiveDragIndex(null)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <SummaryStats months={months} metric={metric} />

          <div
            className="flex items-center justify-between px-6 py-3"
            style={{
              borderTop: `1px solid ${INK.rule}`,
              backgroundColor: INK.paper,
            }}
          >
            <span style={{ fontFamily: FONT.sans, fontSize: 11, color: INK.ghost }}>
              Future months inherit the last explicitly set goal
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg transition-colors hover:bg-stone-100"
                style={{
                  fontFamily: FONT.sans,
                  fontSize: 13,
                  fontWeight: 500,
                  color: INK.muted,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                }}
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
        </div>
      </motion.div>
    </>
  );
};

export default GoalEditorModal;
