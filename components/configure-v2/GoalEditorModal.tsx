import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2 } from 'lucide-react';
import { FONT, INK, SHADOW, EASE, PrimaryButton, estimateAnnualRevenue, formatRevenue, ChartTooltip } from './shared';
import type { Clinician } from './shared';

// =============================================================================
// GOAL EDITOR MODAL - Period-Based Goal Management
// =============================================================================
// A clinician's goal is a timeline of contiguous periods. The chart visualizes
// the goal over time (read-only). The period ledger below is where editing
// happens. Each period's start = previous period's end + 1. The last period
// always runs to "present."
// =============================================================================

export type GoalMetric = 'sessions' | 'clients';

export interface GoalPeriod {
  id: string;
  startDate: string;       // YYYY-MM-DD
  endDate: string | null;  // null = present/ongoing
  value: number;           // sessions/wk or active clients
  reason?: string;         // Optional label (maternity, ramp-up, etc.)
}

interface GoalEditorModalProps {
  clinician: Clinician;
  metric: GoalMetric;
  periods: GoalPeriod[];
  onSave: (periods: GoalPeriod[]) => void;
  onClose: () => void;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const REASON_PRESETS = [
  'Maternity leave',
  'Paternity leave',
  'Medical leave',
  'Ramp-up',
  'Ramp-down',
  'Reduced hours',
  'Seasonal adjustment',
];

const COLORS = {
  goalPast: '#9A8B7A',
  goalCurrent: INK.gold,
  goalFuture: INK.emerald,
};

const CHART_HEIGHT = 200;

// =============================================================================
// HELPERS
// =============================================================================

function generateId(): string {
  return `gp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function parseDate(str: string): Date {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(str: string, n: number): string {
  const d = parseDate(str);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

function formatDateDisplay(str: string): string {
  return parseDate(str).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// =============================================================================
// WEEK GENERATION
// =============================================================================

interface WeekData {
  start: Date;
  key: string;
  goal: number;
  isPast: boolean;
  isCurrent: boolean;
  monthLabel?: string;
  isPeriodBoundary: boolean;
}

function generateWeeks(
  periods: GoalPeriod[],
  monthsBack = 6,
  monthsForward = 3
): WeekData[] {
  const now = new Date();
  const currentWeek = getMonday(now);

  const rangeStart = new Date(currentWeek);
  rangeStart.setMonth(rangeStart.getMonth() - monthsBack);
  const firstWeek = getMonday(rangeStart);

  const rangeEnd = new Date(currentWeek);
  rangeEnd.setMonth(rangeEnd.getMonth() + monthsForward);

  // Collect period start dates for boundary markers
  const periodStartDates = periods.slice(1).map((p) => parseDate(p.startDate).getTime());

  const weeks: WeekData[] = [];
  const cursor = new Date(firstWeek);
  let lastMonth = -1;

  while (cursor <= rangeEnd) {
    const weekStart = new Date(cursor);
    const weekKey = toISO(weekStart);
    const isPast = weekStart < currentWeek;
    const isCurrent = weekStart.getTime() === currentWeek.getTime();

    // Find goal value from periods
    let goal = 0;
    for (const p of periods) {
      const ps = parseDate(p.startDate);
      const pe = p.endDate ? parseDate(p.endDate) : new Date(9999, 11, 31);
      if (weekStart >= ps && weekStart <= pe) {
        goal = p.value;
        break;
      }
    }

    // Month label on first week of each month
    let monthLabel: string | undefined;
    if (weekStart.getMonth() !== lastMonth) {
      monthLabel = weekStart.toLocaleDateString('en-US', { month: 'short' });
      if (weekStart.getMonth() === 0) {
        monthLabel += ` '${String(weekStart.getFullYear()).slice(2)}`;
      }
      lastMonth = weekStart.getMonth();
    }

    // Period boundary: a period starts within this week
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const isPeriodBoundary = periodStartDates.some(
      (ts) => ts >= weekStart.getTime() && ts <= weekEnd.getTime()
    );

    weeks.push({
      start: weekStart,
      key: weekKey,
      goal,
      isPast,
      isCurrent,
      monthLabel,
      isPeriodBoundary,
    });
    cursor.setDate(cursor.getDate() + 7);
  }

  return weeks;
}

// =============================================================================
// READ-ONLY BAR
// =============================================================================

const ReadOnlyBar: React.FC<{
  value: number;
  maxValue: number;
  chartHeight: number;
  barWidth: number;
  color: string;
  index: number;
  isFuture?: boolean;
}> = ({ value, maxValue, chartHeight, barWidth, color, index, isFuture }) => {
  const height =
    maxValue > 0 ? Math.max(value > 0 ? 4 : 0, (value / maxValue) * chartHeight) : 0;

  return (
    <motion.div
      data-bar
      className="rounded-t-[3px]"
      style={{
        width: barWidth,
        background: isFuture
          ? 'transparent'
          : value > 0
            ? `linear-gradient(180deg, ${color} 0%, ${color}cc 100%)`
            : 'transparent',
        border: isFuture && value > 0
          ? `1.5px dashed ${INK.ghost}`
          : 'none',
        borderBottom: isFuture ? 'none' : undefined,
      }}
      initial={{ height: 0 }}
      animate={{ height }}
      transition={{
        delay: 0.08 + index * 0.01,
        duration: 0.4,
        ease: [0.34, 1.56, 0.64, 1],
      }}
    />
  );
};

// =============================================================================
// Y-AXIS
// =============================================================================

const YAxis: React.FC<{
  maxValue: number;
  chartHeight: number;
  metric: GoalMetric;
}> = ({ maxValue, chartHeight, metric }) => {
  const steps = 5;
  const stepValue = maxValue / (steps - 1);
  const unit = metric === 'sessions' ? '/wk' : '';

  return (
    <div
      className="relative flex flex-col justify-between items-end pr-4"
      style={{ height: chartHeight, width: 52 }}
    >
      {Array.from({ length: steps }).map((_, i) => (
        <div key={i} className="flex items-center">
          <span style={{ fontFamily: FONT.mono, fontSize: 12, color: INK.muted, fontWeight: 500 }}>
            {Math.round(maxValue - i * stepValue)}
            {i === 0 && (
              <span style={{ fontSize: 10, color: INK.muted, marginLeft: 1 }}>{unit}</span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
};

// =============================================================================
// WEEK COLUMN
// =============================================================================

const WeekColumn: React.FC<{
  data: WeekData;
  index: number;
  maxValue: number;
  chartHeight: number;
  columnWidth: number;
  barWidth: number;
  metric: GoalMetric;
}> = ({ data, index, maxValue, chartHeight, columnWidth, barWidth, metric }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getColor = () => {
    if (data.isCurrent) return COLORS.goalCurrent;
    if (data.isPast) return COLORS.goalPast;
    return COLORS.goalFuture;
  };

  const unit = metric === 'sessions' ? '/wk' : '';

  return (
    <div
      className="flex flex-col items-center relative"
      style={{ width: columnWidth, flexShrink: 0 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Period boundary marker */}
      {data.isPeriodBoundary && (
        <div
          className="absolute left-0 z-10 pointer-events-none"
          style={{
            top: 0,
            height: chartHeight,
            width: 1,
            background: `linear-gradient(180deg, ${INK.gold}00 0%, ${INK.gold}60 30%, ${INK.gold}60 70%, ${INK.gold}00 100%)`,
          }}
        />
      )}

      {/* Bar area */}
      <div
        className="relative flex items-end justify-center"
        style={{ height: chartHeight }}
      >
        {/* Hover tooltip */}
        <AnimatePresence>
          {isHovered && (
            <ChartTooltip
              title={`Week of ${data.start.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}`}
              values={[
                {
                  label: 'Goal',
                  value: `${data.goal}${unit}`,
                  color: getColor(),
                  isPrimary: true,
                },
              ]}
              position="above"
            />
          )}
        </AnimatePresence>

        <ReadOnlyBar
          value={data.goal}
          maxValue={maxValue}
          chartHeight={chartHeight}
          barWidth={barWidth}
          color={getColor()}
          index={index}
          isFuture={!data.isPast && !data.isCurrent}
        />
      </div>

      {/* Month label (first week of each month only) */}
      {data.monthLabel ? (
        <div className="mt-2 text-center" style={{ minHeight: 18 }}>
          <span
            style={{
              fontFamily: FONT.sans,
              fontSize: 11,
              fontWeight: data.isCurrent ? 700 : 500,
              color: data.isCurrent ? INK.black : INK.body,
            }}
          >
            {data.monthLabel}
          </span>
        </div>
      ) : (
        <div className="mt-2" style={{ minHeight: data.isCurrent ? 30 : 18 }} />
      )}

      {/* Current week dot */}
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
    </div>
  );
};

// =============================================================================
// GOAL PERIOD ROW - Ledger Entry
// =============================================================================

const GoalPeriodRow: React.FC<{
  period: GoalPeriod;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  metric: GoalMetric;
  minStartDate?: string;
  maxStartDate?: string;
  minEndDate?: string;
  maxEndDate?: string;
  onUpdateValue: (value: number) => void;
  onUpdateStartDate: (date: string) => void;
  onUpdateEndDate: (date: string | null) => void;
  onUpdateReason: (reason: string | undefined) => void;
  onDelete: () => void;
}> = ({
  period,
  index,
  isFirst,
  isLast,
  metric,
  minStartDate,
  maxStartDate,
  minEndDate,
  maxEndDate,
  onUpdateValue,
  onUpdateStartDate,
  onUpdateEndDate,
  onUpdateReason,
  onDelete,
}) => {
  const [editingValue, setEditingValue] = useState(false);
  const [valueStr, setValueStr] = useState(String(period.value));
  const [editingEndDate, setEditingEndDate] = useState(false);
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelStr, setLabelStr] = useState(period.reason || '');
  const valueInputRef = useRef<HTMLInputElement>(null);
  const labelInputRef = useRef<HTMLInputElement>(null);

  const unit = metric === 'sessions' ? '/wk' : 'active';

  // Default label for first period
  const defaultLabel = isFirst ? 'Baseline' : `Period ${index + 1}`;
  const displayLabel = period.reason || defaultLabel;
  const isDefaultLabel = !period.reason;

  // Sync state
  useEffect(() => { setValueStr(String(period.value)); }, [period.value]);
  useEffect(() => { setLabelStr(period.reason || ''); }, [period.reason]);
  useEffect(() => {
    if (editingValue && valueInputRef.current) {
      valueInputRef.current.focus();
      valueInputRef.current.select();
    }
  }, [editingValue]);
  useEffect(() => {
    if (editingLabel && labelInputRef.current) {
      labelInputRef.current.focus();
      if (isDefaultLabel) labelInputRef.current.select();
    }
  }, [editingLabel]);

  const handleValueSave = () => {
    const parsed = parseInt(valueStr, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdateValue(parsed);
    } else {
      setValueStr(String(period.value));
    }
    setEditingValue(false);
  };

  const handleValueKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleValueSave();
    if (e.key === 'Escape') {
      setValueStr(String(period.value));
      setEditingValue(false);
    }
  };

  const handleLabelSave = () => {
    const trimmed = labelStr.trim();
    onUpdateReason(trimmed || undefined);
    setEditingLabel(false);
  };

  const handleLabelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLabelSave();
    if (e.key === 'Escape') {
      setLabelStr(period.reason || '');
      setEditingLabel(false);
    }
  };

  // Shared date input styling
  const dateInputStyle: React.CSSProperties = {
    fontFamily: FONT.mono,
    fontSize: 15,
    color: INK.black,
    letterSpacing: '-0.01em',
    padding: '4px 8px',
    border: '1.5px solid transparent',
  };

  const handleDateFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = INK.gold;
    e.currentTarget.style.boxShadow = SHADOW.goldFocus;
    e.currentTarget.style.backgroundColor = INK.paper;
  };

  const handleDateBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'transparent';
    e.currentTarget.style.boxShadow = 'none';
    e.currentTarget.style.backgroundColor = 'transparent';
  };

  const handleDateHoverEnter = (e: React.MouseEvent<HTMLInputElement>) => {
    if (document.activeElement !== e.currentTarget) {
      e.currentTarget.style.backgroundColor = INK.cream;
    }
  };

  const handleDateHoverLeave = (e: React.MouseEvent<HTMLInputElement>) => {
    if (document.activeElement !== e.currentTarget) {
      e.currentTarget.style.backgroundColor = 'transparent';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, height: 0 }}
      transition={{ duration: 0.25, ease: EASE.out }}
      layout
    >
      <div
        className="group"
        style={{
          padding: '16px 20px',
          borderBottom: isLast ? 'none' : `1px solid ${INK.rule}`,
        }}
      >
        <div className="flex items-start gap-3">
          {/* Period number */}
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{
              backgroundColor: INK.cream,
              border: `1px solid ${INK.rule}`,
            }}
          >
            <span
              style={{
                fontFamily: FONT.mono,
                fontSize: 12,
                fontWeight: 600,
                color: INK.body,
              }}
            >
              {index + 1}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Row 1: Label/title + value + delete */}
            <div className="flex items-center justify-between gap-3">
              {/* Label — the period's name */}
              <div className="flex-1 min-w-0">
                {editingLabel ? (
                  <input
                    ref={labelInputRef}
                    type="text"
                    value={labelStr}
                    onChange={(e) => setLabelStr(e.target.value)}
                    onBlur={handleLabelSave}
                    onKeyDown={handleLabelKeyDown}
                    placeholder="Name this period..."
                    list="reason-suggestions"
                    className="w-full outline-none"
                    style={{
                      fontFamily: FONT.serif,
                      fontSize: 17,
                      fontWeight: 400,
                      color: INK.black,
                      padding: '2px 6px',
                      borderRadius: 6,
                      border: `1.5px solid ${INK.gold}`,
                      backgroundColor: INK.paper,
                      boxShadow: SHADOW.goldFocus,
                      letterSpacing: '-0.01em',
                    }}
                  />
                ) : (
                  <button
                    onClick={() => setEditingLabel(true)}
                    className="text-left cursor-pointer transition-all duration-150 w-full"
                    style={{
                      fontFamily: FONT.serif,
                      fontSize: 17,
                      fontWeight: 400,
                      color: isDefaultLabel ? INK.faded : INK.black,
                      fontStyle: isDefaultLabel ? 'italic' : 'normal',
                      background: 'none',
                      border: 'none',
                      padding: '2px 6px',
                      borderRadius: 6,
                      cursor: 'pointer',
                      letterSpacing: '-0.01em',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = INK.cream;
                      if (isDefaultLabel) e.currentTarget.style.color = INK.muted;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      if (isDefaultLabel) e.currentTarget.style.color = INK.faded;
                    }}
                  >
                    {displayLabel}
                  </button>
                )}
                {/* Datalist for suggestions */}
                <datalist id="reason-suggestions">
                  {REASON_PRESETS.map((r) => (
                    <option key={r} value={r} />
                  ))}
                </datalist>
              </div>

              {/* Goal value */}
              <div className="flex items-baseline gap-1 flex-shrink-0">
                {editingValue ? (
                  <input
                    ref={valueInputRef}
                    type="text"
                    inputMode="numeric"
                    value={valueStr}
                    onChange={(e) => setValueStr(e.target.value)}
                    onBlur={handleValueSave}
                    onKeyDown={handleValueKeyDown}
                    className="outline-none text-right"
                    style={{
                      fontFamily: FONT.mono,
                      fontSize: 22,
                      fontWeight: 600,
                      color: INK.black,
                      width: 56,
                      padding: '2px 6px',
                      borderRadius: 6,
                      border: `1.5px solid ${INK.gold}`,
                      backgroundColor: INK.paper,
                      boxShadow: SHADOW.goldFocus,
                    }}
                  />
                ) : (
                  <motion.button
                    onClick={() => setEditingValue(true)}
                    className="cursor-pointer transition-all duration-150"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    style={{
                      fontFamily: FONT.mono,
                      fontSize: 22,
                      fontWeight: 600,
                      color: INK.black,
                      background: 'none',
                      border: 'none',
                      padding: '2px 6px',
                      borderRadius: 6,
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = INK.cream;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {period.value}
                  </motion.button>
                )}
                <span
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 13,
                    color: INK.muted,
                    fontWeight: 500,
                  }}
                >
                  {unit}
                </span>
              </div>

              {/* Delete button */}
              {!isFirst ? (
                <motion.button
                  onClick={onDelete}
                  className="flex-shrink-0 transition-all duration-200 p-1.5 rounded-lg cursor-pointer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    color: INK.faded,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = INK.rose;
                    e.currentTarget.style.backgroundColor = INK.roseLight;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = INK.faded;
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Trash2 size={15} />
                </motion.button>
              ) : (
                <div style={{ width: 27 }} />
              )}
            </div>

            {/* Row 2: Date range */}
            <div
              className="flex items-center gap-2 mt-1"
              style={{ paddingLeft: 6 }}
            >
              {/* Start date */}
              {isFirst ? (
                <div className="flex items-center gap-2">
                  <span
                    style={{
                      fontFamily: FONT.mono,
                      fontSize: 15,
                      color: INK.black,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {formatDateDisplay(period.startDate)}
                  </span>
                  <span
                    style={{
                      fontFamily: FONT.sans,
                      fontSize: 10,
                      fontWeight: 600,
                      color: INK.faded,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      backgroundColor: INK.cream,
                      padding: '2px 6px',
                      borderRadius: 4,
                    }}
                  >
                    Start
                  </span>
                </div>
              ) : (
                <input
                  type="date"
                  value={period.startDate}
                  min={minStartDate}
                  max={maxStartDate}
                  onChange={(e) => {
                    if (e.target.value) onUpdateStartDate(e.target.value);
                  }}
                  className="appearance-none bg-transparent outline-none cursor-pointer transition-all duration-200 rounded-lg"
                  style={dateInputStyle}
                  onFocus={handleDateFocus}
                  onBlur={handleDateBlur}
                  onMouseEnter={handleDateHoverEnter}
                  onMouseLeave={handleDateHoverLeave}
                />
              )}

              {/* Arrow */}
              <span
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 15,
                  color: INK.muted,
                  flexShrink: 0,
                }}
              >
                →
              </span>

              {/* End date */}
              {period.endDate ? (
                <input
                  type="date"
                  value={period.endDate}
                  min={minEndDate}
                  max={maxEndDate}
                  onChange={(e) => {
                    if (e.target.value) onUpdateEndDate(e.target.value);
                  }}
                  className="appearance-none bg-transparent outline-none cursor-pointer transition-all duration-200 rounded-lg"
                  style={dateInputStyle}
                  onFocus={handleDateFocus}
                  onBlur={handleDateBlur}
                  onMouseEnter={handleDateHoverEnter}
                  onMouseLeave={handleDateHoverLeave}
                />
              ) : editingEndDate ? (
                <input
                  type="date"
                  autoFocus
                  min={addDays(period.startDate, 1)}
                  onChange={(e) => {
                    if (e.target.value) {
                      onUpdateEndDate(e.target.value);
                      setEditingEndDate(false);
                    }
                  }}
                  onBlur={() => setEditingEndDate(false)}
                  className="appearance-none bg-transparent outline-none cursor-pointer transition-all duration-200 rounded-lg"
                  style={{
                    ...dateInputStyle,
                    borderColor: INK.gold,
                    boxShadow: SHADOW.goldFocus,
                    backgroundColor: INK.paper,
                  }}
                />
              ) : (
                <button
                  onClick={() => setEditingEndDate(true)}
                  className="cursor-pointer transition-all duration-150"
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 15,
                    color: INK.gold,
                    fontWeight: 600,
                    fontStyle: 'italic',
                    background: 'none',
                    border: 'none',
                    padding: '3px 6px',
                    borderRadius: 6,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = INK.goldGlow;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  present
                </button>
              )}
            </div>
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
  periods: initialPeriods,
  onSave,
  onClose,
}) => {
  const [periods, setPeriods] = useState<GoalPeriod[]>(initialPeriods);
  const [hasChanges, setHasChanges] = useState(false);

  // Generate weeks from current periods
  const weeks = useMemo(() => generateWeeks(periods), [periods]);

  // Chart scale
  const maxGoal = Math.max(...periods.map((p) => p.value), 1);
  const maxValue = Math.max(maxGoal + 10, Math.round(maxGoal * 1.25));

  // Dynamic sizing based on week count
  const columnWidth = Math.max(16, Math.min(24, 900 / weeks.length));
  const barWidth = Math.max(8, columnWidth - 6);

  // Current week index for the vertical gold line
  const currentWeekIndex = weeks.findIndex((w) => w.isCurrent);

  // Estimated annual revenue (sessions only)
  const currentPeriod = periods.find((p) => !p.endDate);
  const currentGoal = currentPeriod?.value ?? 0;
  const estimatedRevenue =
    metric === 'sessions' ? estimateAnnualRevenue(currentGoal) : null;

  const metricLabel =
    metric === 'sessions' ? 'Sessions Goal' : 'Clients Goal';

  // =========================================================================
  // PERIOD MUTATIONS
  // =========================================================================

  const updatePeriod = useCallback(
    (id: string, updates: Partial<GoalPeriod>) => {
      setPeriods((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
      setHasChanges(true);
    },
    []
  );

  const updateStartDate = useCallback((id: string, newStartDate: string) => {
    setPeriods((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx <= 0) return prev;

      const updated = [...prev];
      updated[idx] = { ...updated[idx], startDate: newStartDate };
      updated[idx - 1] = {
        ...updated[idx - 1],
        endDate: addDays(newStartDate, -1),
      };
      return updated;
    });
    setHasChanges(true);
  }, []);

  const updateEndDate = useCallback((id: string, newEndDate: string | null) => {
    setPeriods((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx < 0) return prev;

      const updated = [...prev];
      updated[idx] = { ...updated[idx], endDate: newEndDate };
      // If there's a next period, auto-adjust its start date
      if (newEndDate && idx < updated.length - 1) {
        updated[idx + 1] = {
          ...updated[idx + 1],
          startDate: addDays(newEndDate, 1),
        };
      }
      return updated;
    });
    setHasChanges(true);
  }, []);

  const addPeriod = useCallback(() => {
    const lastPeriod = periods[periods.length - 1];
    // If last period has an explicit end date, start the new one the day after
    const newStart = lastPeriod.endDate
      ? addDays(lastPeriod.endDate, 1)
      : toISO(new Date());

    const newPeriod: GoalPeriod = {
      id: generateId(),
      startDate: newStart,
      endDate: null,
      value: lastPeriod.value,
    };

    setPeriods((prev) => {
      const updated = [...prev];
      // Only set end date on previous period if it doesn't already have one
      if (!updated[updated.length - 1].endDate) {
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          endDate: addDays(newStart, -1),
        };
      }
      return [...updated, newPeriod];
    });
    setHasChanges(true);
  }, [periods]);

  const deletePeriod = useCallback((id: string) => {
    setPeriods((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx <= 0) return prev;

      const updated = [...prev];
      const deleted = updated[idx];
      // Previous period inherits deleted period's end date
      updated[idx - 1] = { ...updated[idx - 1], endDate: deleted.endDate };
      updated.splice(idx, 1);
      return updated;
    });
    setHasChanges(true);
  }, []);

  const handleSave = () => {
    onSave(periods);
    onClose();
  };

  // =========================================================================
  // RENDER
  // =========================================================================

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
          className="relative w-full max-w-[1000px] max-h-[90vh] overflow-hidden rounded-2xl flex flex-col"
          style={{
            pointerEvents: 'auto',
            background: '#FEFDFB',
            boxShadow:
              '0 50px 100px -20px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.03)',
          }}
        >
          {/* ─── Header ─── */}
          <div
            className="flex items-center justify-between px-6 py-4 flex-shrink-0"
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
                <p
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 12,
                    color: INK.muted,
                    marginTop: 1,
                  }}
                >
                  {metricLabel}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Estimated Revenue (sessions only) */}
              {estimatedRevenue !== null && (
                <motion.div
                  key={currentGoal}
                  initial={{ opacity: 0.5, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col items-end"
                >
                  <span
                    style={{
                      fontFamily: FONT.sans,
                      fontSize: 10,
                      color: INK.faded,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Est. Revenue
                  </span>
                  <span
                    style={{
                      fontFamily: FONT.mono,
                      fontSize: 18,
                      fontWeight: 600,
                      color: INK.emerald,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {formatRevenue(estimatedRevenue)}/yr
                  </span>
                </motion.div>
              )}

              <button
                onClick={onClose}
                className="p-2 rounded-lg transition-all hover:bg-stone-100 active:scale-95"
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                }}
              >
                <X size={18} color={INK.muted} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* ─── Scrollable Content ─── */}
          <div className="overflow-y-auto flex-1 min-h-0">
            {/* Chart Area */}
            <div className="px-6 pt-6 pb-4">
              <div className="flex">
                <YAxis
                  maxValue={maxValue}
                  chartHeight={CHART_HEIGHT}
                  metric={metric}
                />

                <div className="flex-1 relative overflow-hidden">
                  {/* Horizontal gridlines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-full h-px"
                        style={{
                          backgroundColor:
                            i === 4 ? INK.rule : INK.cream,
                        }}
                      />
                    ))}
                  </div>

                  {/* Current week vertical line */}
                  {currentWeekIndex >= 0 && (
                    <div
                      className="absolute top-0 bottom-0 w-px z-10"
                      style={{
                        left: `${((currentWeekIndex + 0.5) / weeks.length) * 100}%`,
                        background: `linear-gradient(180deg, ${INK.gold}00 0%, ${INK.gold}40 50%, ${INK.gold}00 100%)`,
                      }}
                    />
                  )}

                  {/* Weekly bars */}
                  <div className="flex justify-between">
                    {weeks.map((week, i) => (
                      <WeekColumn
                        key={week.key}
                        data={week}
                        index={i}
                        maxValue={maxValue}
                        chartHeight={CHART_HEIGHT}
                        columnWidth={columnWidth}
                        barWidth={barWidth}
                        metric={metric}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Divider ─── */}
            <div className="px-6">
              <div className="relative">
                <div
                  className="h-px w-full"
                  style={{ backgroundColor: INK.rule }}
                />
                <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rotate-45"
                  style={{
                    backgroundColor: INK.cream,
                    border: `1px solid ${INK.rule}`,
                  }}
                />
              </div>
            </div>

            {/* ─── Goal Periods Ledger ─── */}
            <div className="px-6 py-5">
              <div className="flex items-center justify-between mb-3">
                <h3
                  style={{
                    fontFamily: FONT.serif,
                    fontSize: 17,
                    fontWeight: 400,
                    color: INK.black,
                  }}
                >
                  Goal Periods
                </h3>
                <span
                  style={{
                    fontFamily: FONT.mono,
                    fontSize: 11,
                    color: INK.ghost,
                  }}
                >
                  {periods.length}{' '}
                  {periods.length === 1 ? 'period' : 'periods'}
                </span>
              </div>

              {/* Add Period button */}
              <motion.button
                onClick={addPeriod}
                className="w-full mb-3 py-3 rounded-xl transition-all duration-200 cursor-pointer"
                whileHover={{ scale: 1.005 }}
                whileTap={{ scale: 0.995 }}
                style={{
                  fontFamily: FONT.sans,
                  fontSize: 13,
                  fontWeight: 500,
                  color: INK.muted,
                  backgroundColor: 'transparent',
                  border: `1.5px dashed ${INK.rule}`,
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = INK.gold;
                  e.currentTarget.style.color = INK.gold;
                  e.currentTarget.style.backgroundColor = INK.goldGlow;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = INK.rule;
                  e.currentTarget.style.color = INK.muted;
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Plus
                  size={14}
                  className="inline mr-1.5"
                  style={{ verticalAlign: -2 }}
                />
                Add Goal Period
              </motion.button>

              <div
                style={{
                  backgroundColor: INK.paper,
                  borderRadius: 12,
                  border: `1px solid ${INK.rule}`,
                  overflow: 'hidden',
                }}
              >
                <AnimatePresence mode="popLayout">
                  {[...periods].reverse().map((period) => {
                    const i = periods.indexOf(period);
                    const isFirstInData = i === 0;
                    const isLastDisplay = i === 0;
                    return (
                      <GoalPeriodRow
                        key={period.id}
                        period={period}
                        index={i}
                        isFirst={isFirstInData}
                        isLast={isLastDisplay}
                        metric={metric}
                        minStartDate={
                          i > 0
                            ? addDays(periods[i - 1].startDate, 1)
                            : undefined
                        }
                        maxStartDate={
                          period.endDate
                            ? addDays(period.endDate, -1)
                            : undefined
                        }
                        minEndDate={addDays(period.startDate, 1)}
                        maxEndDate={
                          i < periods.length - 1
                            ? addDays(periods[i + 1].endDate || periods[i + 1].startDate, -1)
                            : undefined
                        }
                        onUpdateValue={(v) =>
                          updatePeriod(period.id, { value: v })
                        }
                        onUpdateStartDate={(d) =>
                          updateStartDate(period.id, d)
                        }
                        onUpdateEndDate={(d) =>
                          updateEndDate(period.id, d)
                        }
                        onUpdateReason={(r) =>
                          updatePeriod(period.id, { reason: r })
                        }
                        onDelete={() => deletePeriod(period.id)}
                      />
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* ─── Footer ─── */}
          <div
            className="flex items-center justify-between px-6 py-3 flex-shrink-0"
            style={{
              borderTop: `1px solid ${INK.rule}`,
              backgroundColor: INK.paper,
            }}
          >
            <span
              style={{
                fontFamily: FONT.sans,
                fontSize: 11,
                color: INK.ghost,
              }}
            >
              Click a goal value to edit · Add periods for schedule changes
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
