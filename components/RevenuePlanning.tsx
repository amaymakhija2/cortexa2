import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  X,
  Check,
  Download,
  ArrowRight,
  TrendUp,
  Users,
  Target,
  Calculator,
  Sparkle,
  CaretDown,
  Warning,
  CheckCircle,
} from '@phosphor-icons/react';
import { PageHeader } from './design-system/layout/PageHeader';
import { FONT, INK, SHADOW, EASE, LedgerCard, PrimaryButton } from './configure-v2/shared';

// =============================================================================
// REVENUE PLANNING MODULE
// =============================================================================
// A live financial model that answers: "I want to make $X. What does that require?"
// Practice owners work backwards from revenue goal to action plan.
// Feels like Excel, but polished. Changes cascade instantly.
// =============================================================================

// Types
interface Clinician {
  id: string;
  name: string;
  currentGoal: number; // sessions/week
  maxCapacity: number;
  avatarUrl?: string;
  color: string;
}

interface NewHire {
  id: string;
  name: string;
  startMonth: number; // 0-11
  startYear: number;
  rampMonths: number;
  targetGoal: number; // sessions/week
}

interface Assumptions {
  avgRate: number;
  sessionsPerClientPerMonth: number;
  monthlyChurnRate: number;
  workingWeeksPerYear: number;
}

// Mock data
const MOCK_CLINICIANS: Clinician[] = [
  { id: '1', name: 'Sarah Chen', currentGoal: 32, maxCapacity: 40, color: '#7c3aed' },
  { id: '2', name: 'Maria Rodriguez', currentGoal: 35, maxCapacity: 38, color: '#0891b2' },
  { id: '3', name: 'Priya Patel', currentGoal: 32, maxCapacity: 36, color: '#d97706' },
  { id: '4', name: 'James Kim', currentGoal: 28, maxCapacity: 35, color: '#db2777' },
  { id: '5', name: 'Michael Johnson', currentGoal: 24, maxCapacity: 32, color: '#059669' },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// =============================================================================
// EDITABLE CELL - The Heart of the Spreadsheet Feel
// =============================================================================

interface EditableCellProps {
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  format?: 'currency' | 'number' | 'percent';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  align?: 'left' | 'center' | 'right';
  highlight?: boolean;
}

const EditableCell: React.FC<EditableCellProps> = ({
  value,
  onChange,
  prefix = '',
  suffix = '',
  min = 0,
  max = 999999,
  step = 1,
  format = 'number',
  size = 'md',
  align = 'right',
  highlight = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value.toString());
  const [showConfirm, setShowConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalValue(value.toString());
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.select();
    }
  }, [isEditing]);

  const formatDisplay = (val: number): string => {
    if (format === 'currency') {
      if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
      if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
      return val.toLocaleString();
    }
    if (format === 'percent') return val.toFixed(1);
    return val.toLocaleString();
  };

  const handleBlur = () => {
    setIsEditing(false);
    const numVal = parseFloat(localValue.replace(/[^0-9.-]/g, '')) || 0;
    const clampedVal = Math.max(min, Math.min(max, numVal));
    if (clampedVal !== value) {
      onChange(clampedVal);
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 800);
    }
    setLocalValue(clampedVal.toString());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') inputRef.current?.blur();
    if (e.key === 'Escape') {
      setLocalValue(value.toString());
      setIsEditing(false);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newVal = Math.min(max, value + step);
      onChange(newVal);
      setLocalValue(newVal.toString());
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newVal = Math.max(min, value - step);
      onChange(newVal);
      setLocalValue(newVal.toString());
    }
  };

  const sizeStyles = {
    sm: { fontSize: 13, padding: '4px 8px', height: 28 },
    md: { fontSize: 15, padding: '6px 12px', height: 36 },
    lg: { fontSize: 18, padding: '8px 14px', height: 44 },
    xl: { fontSize: 32, padding: '12px 20px', height: 64 },
  };

  const style = sizeStyles[size];

  return (
    <div className="relative inline-flex items-center group">
      <motion.div
        className="relative cursor-text"
        whileHover={{ scale: isEditing ? 1 : 1.01 }}
        onClick={() => setIsEditing(true)}
      >
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="outline-none transition-all duration-200"
            style={{
              fontFamily: FONT.mono,
              fontSize: style.fontSize,
              fontWeight: 600,
              color: INK.black,
              textAlign: align,
              padding: style.padding,
              height: style.height,
              width: size === 'xl' ? 200 : size === 'lg' ? 100 : 80,
              borderRadius: 10,
              border: `2px solid ${INK.gold}`,
              backgroundColor: INK.paper,
              boxShadow: SHADOW.goldFocus,
            }}
          />
        ) : (
          <div
            className="transition-all duration-200"
            style={{
              fontFamily: FONT.mono,
              fontSize: style.fontSize,
              fontWeight: 600,
              color: highlight ? INK.gold : INK.black,
              textAlign: align,
              padding: style.padding,
              height: style.height,
              minWidth: size === 'xl' ? 200 : size === 'lg' ? 100 : 80,
              borderRadius: 10,
              border: `1.5px solid transparent`,
              backgroundColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start',
            }}
          >
            <span className="opacity-60">{prefix}</span>
            <span>{formatDisplay(value)}</span>
            <span className="opacity-60 ml-0.5">{suffix}</span>

            {/* Hover underline */}
            <motion.div
              className="absolute bottom-1 left-3 right-3 h-px"
              style={{ backgroundColor: INK.gold }}
              initial={{ scaleX: 0, opacity: 0 }}
              whileHover={{ scaleX: 1, opacity: 0.5 }}
              transition={{ duration: 0.2 }}
            />
          </div>
        )}
      </motion.div>

      {/* Save confirmation */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, x: -8 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute -right-7 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: INK.emerald, boxShadow: SHADOW.confirm }}
          >
            <Check size={11} color="white" weight="bold" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// =============================================================================
// CAPACITY BAR - Visual Session Goal Indicator
// =============================================================================

interface CapacityBarProps {
  current: number;
  planned: number;
  max: number;
  color: string;
}

const CapacityBar: React.FC<CapacityBarProps> = ({ current, planned, max, color }) => {
  const currentPercent = (current / max) * 100;
  const plannedPercent = (planned / max) * 100;
  const isOverCapacity = planned > max;

  return (
    <div className="relative h-2 rounded-full overflow-hidden" style={{ backgroundColor: INK.rule }}>
      {/* Current goal (lighter) */}
      <motion.div
        className="absolute left-0 top-0 h-full rounded-full"
        style={{ backgroundColor: color, opacity: 0.3 }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(currentPercent, 100)}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />

      {/* Planned goal (solid) */}
      <motion.div
        className="absolute left-0 top-0 h-full rounded-full"
        style={{
          backgroundColor: isOverCapacity ? INK.amber : color,
          boxShadow: isOverCapacity ? `0 0 8px ${INK.amber}` : 'none',
        }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(plannedPercent, 100)}%` }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
      />

      {/* Max capacity marker */}
      <div
        className="absolute top-0 h-full w-0.5"
        style={{ left: '100%', transform: 'translateX(-2px)', backgroundColor: INK.ghost }}
      />
    </div>
  );
};

// =============================================================================
// MONTH SELECTOR DROPDOWN
// =============================================================================

interface MonthSelectorProps {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({ month, year, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200"
        style={{
          fontFamily: FONT.sans,
          fontSize: 13,
          fontWeight: 500,
          color: INK.body,
          backgroundColor: isOpen ? INK.cream : 'transparent',
          border: `1px solid ${isOpen ? INK.gold : INK.rule}`,
        }}
      >
        {MONTHS[month]} {year}
        <CaretDown size={12} weight="bold" style={{ color: INK.muted }} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1 z-50 p-3 rounded-xl"
            style={{
              backgroundColor: INK.paper,
              border: `1px solid ${INK.rule}`,
              boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
              minWidth: 200,
            }}
          >
            {/* Year selector */}
            <div className="flex items-center justify-between mb-3 pb-2" style={{ borderBottom: `1px solid ${INK.rule}` }}>
              <button
                onClick={() => onChange(month, year - 1)}
                className="p-1 rounded hover:bg-stone-100"
              >
                <CaretDown size={14} className="rotate-90" style={{ color: INK.muted }} />
              </button>
              <span style={{ fontFamily: FONT.mono, fontSize: 14, fontWeight: 600, color: INK.black }}>
                {year}
              </span>
              <button
                onClick={() => onChange(month, year + 1)}
                className="p-1 rounded hover:bg-stone-100"
              >
                <CaretDown size={14} className="-rotate-90" style={{ color: INK.muted }} />
              </button>
            </div>

            {/* Month grid */}
            <div className="grid grid-cols-3 gap-1">
              {MONTHS.map((m, idx) => (
                <button
                  key={m}
                  onClick={() => {
                    onChange(idx, year);
                    setIsOpen(false);
                  }}
                  className="px-2 py-1.5 rounded-md text-center transition-all duration-150"
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 12,
                    fontWeight: idx === month ? 600 : 400,
                    color: idx === month ? INK.gold : INK.body,
                    backgroundColor: idx === month ? INK.goldGlow : 'transparent',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// =============================================================================
// CLINICIAN ROW
// =============================================================================

interface ClinicianRowProps {
  clinician: Clinician;
  plannedGoal: number;
  onPlannedGoalChange: (goal: number) => void;
  assumptions: Assumptions;
  index: number;
}

const ClinicianRow: React.FC<ClinicianRowProps> = ({
  clinician,
  plannedGoal,
  onPlannedGoalChange,
  assumptions,
  index,
}) => {
  const sessionsPerYear = plannedGoal * assumptions.workingWeeksPerYear;
  const revenuePerYear = sessionsPerYear * assumptions.avgRate;
  const isOverCapacity = plannedGoal > clinician.maxCapacity;

  return (
    <motion.tr
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group"
      style={{ borderBottom: `1px solid ${INK.rule}` }}
    >
      {/* Clinician name */}
      <td className="py-4 pr-4">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
            style={{ backgroundColor: clinician.color }}
          >
            {clinician.name.split(' ').map(n => n[0]).join('')}
          </div>
          <span style={{ fontFamily: FONT.sans, fontSize: 14, fontWeight: 500, color: INK.black }}>
            {clinician.name}
          </span>
        </div>
      </td>

      {/* Current goal */}
      <td className="py-4 px-3 text-right">
        <span style={{ fontFamily: FONT.mono, fontSize: 13, color: INK.muted }}>
          {clinician.currentGoal}/wk
        </span>
      </td>

      {/* Planned goal (editable) */}
      <td className="py-4 px-3">
        <div className="flex items-center justify-end gap-2">
          <ArrowRight size={14} style={{ color: INK.ghost }} />
          <EditableCell
            value={plannedGoal}
            onChange={onPlannedGoalChange}
            suffix="/wk"
            min={0}
            max={50}
            size="sm"
            highlight={isOverCapacity}
          />
          {isOverCapacity && (
            <Warning size={14} weight="fill" style={{ color: INK.amber }} />
          )}
        </div>
      </td>

      {/* Max capacity */}
      <td className="py-4 px-3 text-right">
        <span style={{ fontFamily: FONT.mono, fontSize: 13, color: INK.faded }}>
          {clinician.maxCapacity}/wk
        </span>
      </td>

      {/* Capacity bar */}
      <td className="py-4 px-4 w-32">
        <CapacityBar
          current={clinician.currentGoal}
          planned={plannedGoal}
          max={clinician.maxCapacity}
          color={clinician.color}
        />
      </td>

      {/* Sessions/year */}
      <td className="py-4 px-3 text-right">
        <span style={{ fontFamily: FONT.mono, fontSize: 13, color: INK.body }}>
          {sessionsPerYear.toLocaleString()}
        </span>
      </td>

      {/* Revenue/year */}
      <td className="py-4 pl-3 text-right">
        <span style={{ fontFamily: FONT.mono, fontSize: 13, fontWeight: 600, color: INK.black }}>
          ${(revenuePerYear / 1000).toFixed(0)}K
        </span>
      </td>
    </motion.tr>
  );
};

// =============================================================================
// NEW HIRE ROW
// =============================================================================

interface NewHireRowProps {
  hire: NewHire;
  onUpdate: (hire: NewHire) => void;
  onRemove: () => void;
  assumptions: Assumptions;
  index: number;
}

const NewHireRow: React.FC<NewHireRowProps> = ({
  hire,
  onUpdate,
  onRemove,
  assumptions,
  index,
}) => {
  // Calculate partial year + ramp sessions
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const startDate = new Date(hire.startYear, hire.startMonth, 1);
  const monthsRemaining = (12 - hire.startMonth) + (hire.startYear > currentYear ? 12 : 0);

  // Ramp calculation: Month 1 = 50%, Month 2 = 75%, Month 3+ = 100%
  let totalSessions = 0;
  for (let m = 0; m < Math.min(monthsRemaining, 12); m++) {
    let rampFactor = 1;
    if (m < hire.rampMonths) {
      if (m === 0) rampFactor = 0.5;
      else if (m === 1) rampFactor = 0.75;
      else rampFactor = 0.5 + (0.5 * (m + 1) / hire.rampMonths);
    }
    totalSessions += hire.targetGoal * (assumptions.workingWeeksPerYear / 12) * rampFactor;
  }

  const revenuePerYear = totalSessions * assumptions.avgRate;

  return (
    <motion.tr
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group"
      style={{ borderBottom: `1px solid ${INK.rule}` }}
    >
      {/* Name */}
      <td className="py-4 pr-4">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-dashed"
            style={{ borderColor: INK.gold, color: INK.gold }}
          >
            <Plus size={14} weight="bold" />
          </div>
          <input
            type="text"
            value={hire.name}
            onChange={(e) => onUpdate({ ...hire, name: e.target.value })}
            placeholder="New Clinician"
            className="bg-transparent outline-none"
            style={{ fontFamily: FONT.sans, fontSize: 14, fontWeight: 500, color: INK.black }}
          />
        </div>
      </td>

      {/* Start date */}
      <td className="py-4 px-3" colSpan={2}>
        <MonthSelector
          month={hire.startMonth}
          year={hire.startYear}
          onChange={(m, y) => onUpdate({ ...hire, startMonth: m, startYear: y })}
        />
      </td>

      {/* Ramp period */}
      <td className="py-4 px-3">
        <EditableCell
          value={hire.rampMonths}
          onChange={(v) => onUpdate({ ...hire, rampMonths: v })}
          suffix=" mo"
          min={1}
          max={6}
          size="sm"
        />
      </td>

      {/* Target goal */}
      <td className="py-4 px-3">
        <EditableCell
          value={hire.targetGoal}
          onChange={(v) => onUpdate({ ...hire, targetGoal: v })}
          suffix="/wk"
          min={10}
          max={45}
          size="sm"
        />
      </td>

      {/* Sessions/year (partial) */}
      <td className="py-4 px-3 text-right">
        <div>
          <span style={{ fontFamily: FONT.mono, fontSize: 13, color: INK.body }}>
            {Math.round(totalSessions).toLocaleString()}
          </span>
          <span style={{ fontFamily: FONT.sans, fontSize: 10, color: INK.faded, marginLeft: 4 }}>
            *partial
          </span>
        </div>
      </td>

      {/* Revenue/year */}
      <td className="py-4 pl-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <span style={{ fontFamily: FONT.mono, fontSize: 13, fontWeight: 600, color: INK.black }}>
            ${(revenuePerYear / 1000).toFixed(0)}K
          </span>
          <button
            onClick={onRemove}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-50 transition-all duration-150"
          >
            <X size={14} style={{ color: INK.rose }} />
          </button>
        </div>
      </td>
    </motion.tr>
  );
};

// =============================================================================
// SUMMARY FOOTER
// =============================================================================

interface SummaryFooterProps {
  totalSessionsPerWeek: number;
  totalSessionsPerYear: number;
  totalRevenue: number;
  goalRevenue: number;
}

const SummaryFooter: React.FC<SummaryFooterProps> = ({
  totalSessionsPerWeek,
  totalSessionsPerYear,
  totalRevenue,
  goalRevenue,
}) => {
  const difference = totalRevenue - goalRevenue;
  const isOnTrack = difference >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-2xl p-6 mt-6"
      style={{
        background: isOnTrack
          ? `linear-gradient(135deg, ${INK.emeraldLight} 0%, #ecfdf5 100%)`
          : `linear-gradient(135deg, ${INK.amberLight} 0%, #fffbeb 100%)`,
        border: `1px solid ${isOnTrack ? INK.emerald + '30' : INK.amber + '30'}`,
      }}
    >
      <div className="flex items-center justify-between">
        {/* Total stats */}
        <div className="flex items-center gap-8">
          <div>
            <p style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 600, color: INK.muted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Total Planned
            </p>
            <p style={{ fontFamily: FONT.mono, fontSize: 24, fontWeight: 700, color: INK.black, marginTop: 4 }}>
              {totalSessionsPerWeek}/wk
            </p>
          </div>
          <div style={{ width: 1, height: 40, backgroundColor: INK.rule }} />
          <div>
            <p style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 600, color: INK.muted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Sessions/Year
            </p>
            <p style={{ fontFamily: FONT.mono, fontSize: 24, fontWeight: 700, color: INK.black, marginTop: 4 }}>
              {totalSessionsPerYear.toLocaleString()}
            </p>
          </div>
          <div style={{ width: 1, height: 40, backgroundColor: INK.rule }} />
          <div>
            <p style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 600, color: INK.muted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Projected Revenue
            </p>
            <p style={{ fontFamily: FONT.mono, fontSize: 24, fontWeight: 700, color: INK.black, marginTop: 4 }}>
              ${(totalRevenue / 1000000).toFixed(2)}M
            </p>
          </div>
        </div>

        {/* Surplus/Gap */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 600, color: INK.muted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              vs Goal
            </p>
            <p style={{ fontFamily: FONT.mono, fontSize: 14, color: INK.muted, marginTop: 2 }}>
              ${(goalRevenue / 1000000).toFixed(2)}M
            </p>
          </div>
          <div
            className="px-5 py-3 rounded-xl flex items-center gap-2"
            style={{
              backgroundColor: isOnTrack ? INK.emerald : INK.amber,
              boxShadow: `0 4px 16px ${isOnTrack ? 'rgba(4, 120, 87, 0.3)' : 'rgba(180, 83, 9, 0.3)'}`,
            }}
          >
            {isOnTrack ? (
              <CheckCircle size={18} weight="fill" color="white" />
            ) : (
              <Warning size={18} weight="fill" color="white" />
            )}
            <span style={{ fontFamily: FONT.mono, fontSize: 18, fontWeight: 700, color: 'white' }}>
              {isOnTrack ? '+' : ''}{difference >= 0 ? '+' : ''}${Math.abs(difference / 1000).toFixed(0)}K
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// =============================================================================
// CLIENT REQUIREMENTS CARD
// =============================================================================

interface ClientRequirementsProps {
  sessionsPerWeek: number;
  assumptions: Assumptions;
  currentActiveClients: number;
}

const ClientRequirements: React.FC<ClientRequirementsProps> = ({
  sessionsPerWeek,
  assumptions,
  currentActiveClients,
}) => {
  // Weekly sessions -> monthly sessions -> clients needed
  const monthlySessionsPerClient = assumptions.sessionsPerClientPerMonth;
  const weeksPerMonth = assumptions.workingWeeksPerYear / 12;
  const monthlySessionsTotal = sessionsPerWeek * weeksPerMonth;
  const clientsNeeded = Math.ceil(monthlySessionsTotal / monthlySessionsPerClient);

  const growthNeeded = clientsNeeded - currentActiveClients;
  const annualChurn = Math.ceil(clientsNeeded * assumptions.monthlyChurnRate * 12);
  const totalAcquisitionNeeded = Math.max(0, growthNeeded) + annualChurn;
  const monthlyAcquisition = Math.ceil(totalAcquisitionNeeded / 12);

  return (
    <LedgerCard className="mt-6">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: INK.goldGlow }}
          >
            <Users size={20} weight="fill" style={{ color: INK.gold }} />
          </div>
          <div>
            <h3 style={{ fontFamily: FONT.serif, fontSize: 18, fontWeight: 500, color: INK.black }}>
              Client Requirements
            </h3>
            <p style={{ fontFamily: FONT.sans, fontSize: 12, color: INK.muted }}>
              To sustain {sessionsPerWeek} sessions/week
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {/* Active clients needed */}
          <div>
            <p style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 600, color: INK.muted, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8 }}>
              Active Clients Needed
            </p>
            <p style={{ fontFamily: FONT.mono, fontSize: 28, fontWeight: 700, color: INK.black }}>
              {clientsNeeded}
            </p>
          </div>

          {/* Current */}
          <div>
            <p style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 600, color: INK.muted, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8 }}>
              Current Active
            </p>
            <p style={{ fontFamily: FONT.mono, fontSize: 28, fontWeight: 700, color: INK.body }}>
              {currentActiveClients}
            </p>
          </div>

          {/* Annual churn replacement */}
          <div>
            <p style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 600, color: INK.muted, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8 }}>
              Churn Replacement
            </p>
            <p style={{ fontFamily: FONT.mono, fontSize: 28, fontWeight: 700, color: INK.rose }}>
              +{annualChurn}/yr
            </p>
          </div>

          {/* Total acquisition needed */}
          <div
            className="p-4 rounded-xl -m-4"
            style={{ backgroundColor: INK.goldGlow }}
          >
            <p style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 600, color: INK.gold, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8 }}>
              Acquire This Year
            </p>
            <div className="flex items-baseline gap-2">
              <p style={{ fontFamily: FONT.mono, fontSize: 28, fontWeight: 700, color: INK.gold }}>
                {totalAcquisitionNeeded}
              </p>
              <p style={{ fontFamily: FONT.sans, fontSize: 13, color: INK.muted }}>
                ~{monthlyAcquisition}/mo
              </p>
            </div>
          </div>
        </div>
      </div>
    </LedgerCard>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const RevenuePlanning: React.FC = () => {
  // State
  const [revenueGoal, setRevenueGoal] = useState(1500000);
  const [assumptions, setAssumptions] = useState<Assumptions>({
    avgRate: 185,
    sessionsPerClientPerMonth: 3.2,
    monthlyChurnRate: 0.03,
    workingWeeksPerYear: 48,
  });
  const [plannedGoals, setPlannedGoals] = useState<Record<string, number>>(
    Object.fromEntries(MOCK_CLINICIANS.map(c => [c.id, c.currentGoal + 4])) // Default to slightly above current
  );
  const [newHires, setNewHires] = useState<NewHire[]>([]);
  const [showApplyConfirm, setShowApplyConfirm] = useState(false);

  // Calculations
  const existingTeamStats = useMemo(() => {
    let totalSessions = 0;
    let totalRevenue = 0;
    MOCK_CLINICIANS.forEach(c => {
      const planned = plannedGoals[c.id] || c.currentGoal;
      const sessions = planned * assumptions.workingWeeksPerYear;
      totalSessions += sessions;
      totalRevenue += sessions * assumptions.avgRate;
    });
    return {
      sessionsPerWeek: Object.values(plannedGoals).reduce((a, b) => a + b, 0),
      sessionsPerYear: totalSessions,
      revenue: totalRevenue,
    };
  }, [plannedGoals, assumptions]);

  const newHireStats = useMemo(() => {
    let totalSessions = 0;
    let totalRevenue = 0;

    newHires.forEach(hire => {
      const monthsRemaining = 12 - hire.startMonth;
      for (let m = 0; m < monthsRemaining; m++) {
        let rampFactor = 1;
        if (m < hire.rampMonths) {
          if (m === 0) rampFactor = 0.5;
          else if (m === 1) rampFactor = 0.75;
          else rampFactor = 0.5 + (0.5 * (m + 1) / hire.rampMonths);
        }
        totalSessions += hire.targetGoal * (assumptions.workingWeeksPerYear / 12) * rampFactor;
      }
    });

    totalRevenue = totalSessions * assumptions.avgRate;
    return { sessionsPerYear: Math.round(totalSessions), revenue: totalRevenue };
  }, [newHires, assumptions]);

  const totals = useMemo(() => ({
    sessionsPerWeek: existingTeamStats.sessionsPerWeek + newHires.reduce((a, h) => a + h.targetGoal, 0),
    sessionsPerYear: existingTeamStats.sessionsPerYear + newHireStats.sessionsPerYear,
    revenue: existingTeamStats.revenue + newHireStats.revenue,
  }), [existingTeamStats, newHireStats, newHires]);

  // Handlers
  const handleAddHire = useCallback(() => {
    const now = new Date();
    const nextMonth = (now.getMonth() + 2) % 12;
    const year = nextMonth < now.getMonth() ? now.getFullYear() + 1 : now.getFullYear();

    setNewHires(prev => [...prev, {
      id: `hire-${Date.now()}`,
      name: `New Clinician ${prev.length + 1}`,
      startMonth: nextMonth,
      startYear: year,
      rampMonths: 3,
      targetGoal: 32,
    }]);
  }, []);

  const handleApplyGoals = useCallback(() => {
    setShowApplyConfirm(true);
    // In real app, this would push to the Configure > Clinicians tab
    setTimeout(() => setShowApplyConfirm(false), 2000);
  }, []);

  return (
    <div
      className="flex-1 flex flex-col h-[calc(100vh-80px)] overflow-y-auto"
      style={{ background: `linear-gradient(180deg, ${INK.cream} 0%, ${INK.paper} 100%)` }}
    >
      {/* Header */}
      <PageHeader
        accent="amber"
        showGridPattern
        title="Revenue Planning"
        label="Financial Model"
        size="hero"
        subtitle="Work backwards from your goal to build your action plan"
      />

      {/* Content */}
      <div className="flex-1 px-6 sm:px-8 lg:pl-[100px] lg:pr-12 py-6 lg:py-8">
        {/* Revenue Goal Card */}
        <LedgerCard accent="gold" className="mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${INK.gold} 0%, ${INK.goldMuted} 100%)`,
                    boxShadow: `0 8px 24px ${INK.goldGlow}`,
                  }}
                >
                  <Target size={28} weight="fill" color="white" />
                </div>
                <div>
                  <p style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 600, color: INK.muted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Annual Revenue Goal
                  </p>
                  <EditableCell
                    value={revenueGoal}
                    onChange={setRevenueGoal}
                    prefix="$"
                    format="currency"
                    size="xl"
                    min={100000}
                    max={10000000}
                    step={50000}
                  />
                </div>
              </div>

              {/* Gap indicator */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p style={{ fontFamily: FONT.sans, fontSize: 11, color: INK.muted }}>
                    Current Pace
                  </p>
                  <p style={{ fontFamily: FONT.mono, fontSize: 16, fontWeight: 600, color: INK.body }}>
                    ${((MOCK_CLINICIANS.reduce((a, c) => a + c.currentGoal, 0) * assumptions.workingWeeksPerYear * assumptions.avgRate) / 1000000).toFixed(2)}M
                  </p>
                </div>
                <ArrowRight size={20} style={{ color: INK.gold }} />
                <div
                  className="px-4 py-2 rounded-xl"
                  style={{ backgroundColor: INK.goldGlow }}
                >
                  <p style={{ fontFamily: FONT.sans, fontSize: 11, color: INK.gold }}>
                    Gap to Fill
                  </p>
                  <p style={{ fontFamily: FONT.mono, fontSize: 16, fontWeight: 700, color: INK.gold }}>
                    +${((revenueGoal - (MOCK_CLINICIANS.reduce((a, c) => a + c.currentGoal, 0) * assumptions.workingWeeksPerYear * assumptions.avgRate)) / 1000).toFixed(0)}K
                  </p>
                </div>
              </div>
            </div>
          </div>
        </LedgerCard>

        {/* Assumptions Bar */}
        <LedgerCard className="mb-6">
          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <Calculator size={16} style={{ color: INK.muted }} />
              <span style={{ fontFamily: FONT.sans, fontSize: 12, fontWeight: 600, color: INK.muted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Assumptions
              </span>
            </div>
            <div className="grid grid-cols-4 gap-6">
              <div>
                <p style={{ fontFamily: FONT.sans, fontSize: 11, color: INK.faded, marginBottom: 4 }}>
                  Avg Rate/Session
                </p>
                <EditableCell
                  value={assumptions.avgRate}
                  onChange={(v) => setAssumptions(a => ({ ...a, avgRate: v }))}
                  prefix="$"
                  min={50}
                  max={500}
                  size="md"
                  align="left"
                />
              </div>
              <div>
                <p style={{ fontFamily: FONT.sans, fontSize: 11, color: INK.faded, marginBottom: 4 }}>
                  Sessions/Client/Mo
                </p>
                <EditableCell
                  value={assumptions.sessionsPerClientPerMonth}
                  onChange={(v) => setAssumptions(a => ({ ...a, sessionsPerClientPerMonth: v }))}
                  min={1}
                  max={8}
                  step={0.1}
                  size="md"
                  align="left"
                />
              </div>
              <div>
                <p style={{ fontFamily: FONT.sans, fontSize: 11, color: INK.faded, marginBottom: 4 }}>
                  Monthly Churn
                </p>
                <EditableCell
                  value={assumptions.monthlyChurnRate * 100}
                  onChange={(v) => setAssumptions(a => ({ ...a, monthlyChurnRate: v / 100 }))}
                  suffix="%"
                  min={0}
                  max={20}
                  step={0.5}
                  format="percent"
                  size="md"
                  align="left"
                />
              </div>
              <div>
                <p style={{ fontFamily: FONT.sans, fontSize: 11, color: INK.faded, marginBottom: 4 }}>
                  Working Wks/Yr
                </p>
                <EditableCell
                  value={assumptions.workingWeeksPerYear}
                  onChange={(v) => setAssumptions(a => ({ ...a, workingWeeksPerYear: v }))}
                  min={40}
                  max={52}
                  size="md"
                  align="left"
                />
              </div>
            </div>
          </div>
        </LedgerCard>

        {/* Team Capacity Table */}
        <LedgerCard className="mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <Users size={18} style={{ color: INK.body }} />
                <h3 style={{ fontFamily: FONT.serif, fontSize: 18, fontWeight: 500, color: INK.black }}>
                  Team Capacity
                </h3>
              </div>
              <div style={{ fontFamily: FONT.sans, fontSize: 13, color: INK.muted }}>
                {MOCK_CLINICIANS.length} clinicians
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full" style={{ minWidth: 700 }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${INK.rule}` }}>
                    <th className="py-3 pr-4 text-left" style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 600, color: INK.faded, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      Clinician
                    </th>
                    <th className="py-3 px-3 text-right" style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 600, color: INK.faded, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      Current
                    </th>
                    <th className="py-3 px-3 text-right" style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 600, color: INK.faded, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      Planned
                    </th>
                    <th className="py-3 px-3 text-right" style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 600, color: INK.faded, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      Max
                    </th>
                    <th className="py-3 px-4 text-center" style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 600, color: INK.faded, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      Capacity
                    </th>
                    <th className="py-3 px-3 text-right" style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 600, color: INK.faded, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      Sessions/Yr
                    </th>
                    <th className="py-3 pl-3 text-right" style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 600, color: INK.faded, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      Revenue/Yr
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_CLINICIANS.map((clinician, idx) => (
                    <ClinicianRow
                      key={clinician.id}
                      clinician={clinician}
                      plannedGoal={plannedGoals[clinician.id] || clinician.currentGoal}
                      onPlannedGoalChange={(goal) => setPlannedGoals(prev => ({ ...prev, [clinician.id]: goal }))}
                      assumptions={assumptions}
                      index={idx}
                    />
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ backgroundColor: INK.cream }}>
                    <td className="py-4 pr-4" style={{ fontFamily: FONT.sans, fontSize: 13, fontWeight: 600, color: INK.black }}>
                      Existing Team Total
                    </td>
                    <td className="py-4 px-3 text-right" style={{ fontFamily: FONT.mono, fontSize: 13, color: INK.muted }}>
                      {MOCK_CLINICIANS.reduce((a, c) => a + c.currentGoal, 0)}/wk
                    </td>
                    <td className="py-4 px-3 text-right" style={{ fontFamily: FONT.mono, fontSize: 13, fontWeight: 600, color: INK.black }}>
                      {existingTeamStats.sessionsPerWeek}/wk
                    </td>
                    <td colSpan={2} />
                    <td className="py-4 px-3 text-right" style={{ fontFamily: FONT.mono, fontSize: 13, fontWeight: 600, color: INK.black }}>
                      {existingTeamStats.sessionsPerYear.toLocaleString()}
                    </td>
                    <td className="py-4 pl-3 text-right" style={{ fontFamily: FONT.mono, fontSize: 14, fontWeight: 700, color: INK.black }}>
                      ${(existingTeamStats.revenue / 1000).toFixed(0)}K
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </LedgerCard>

        {/* New Hires Section */}
        <LedgerCard className="mb-6" accent="gold">
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <Sparkle size={18} weight="fill" style={{ color: INK.gold }} />
                <h3 style={{ fontFamily: FONT.serif, fontSize: 18, fontWeight: 500, color: INK.black }}>
                  New Hires
                </h3>
              </div>
              <button
                onClick={handleAddHire}
                className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 hover:scale-[1.02]"
                style={{
                  backgroundColor: INK.goldGlow,
                  border: `1px solid ${INK.gold}40`,
                  fontFamily: FONT.sans,
                  fontSize: 13,
                  fontWeight: 600,
                  color: INK.gold,
                }}
              >
                <Plus size={16} weight="bold" />
                Add Hire
              </button>
            </div>

            {newHires.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full" style={{ minWidth: 700 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${INK.rule}` }}>
                      <th className="py-3 pr-4 text-left" style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 600, color: INK.faded, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        New Hire
                      </th>
                      <th className="py-3 px-3 text-left" colSpan={2} style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 600, color: INK.faded, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        Start Date
                      </th>
                      <th className="py-3 px-3 text-right" style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 600, color: INK.faded, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        Ramp
                      </th>
                      <th className="py-3 px-3 text-right" style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 600, color: INK.faded, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        Target
                      </th>
                      <th className="py-3 px-3 text-right" style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 600, color: INK.faded, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        Sessions/Yr
                      </th>
                      <th className="py-3 pl-3 text-right" style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 600, color: INK.faded, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        Revenue/Yr
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence mode="popLayout">
                      {newHires.map((hire, idx) => (
                        <NewHireRow
                          key={hire.id}
                          hire={hire}
                          onUpdate={(updated) => setNewHires(prev => prev.map(h => h.id === updated.id ? updated : h))}
                          onRemove={() => setNewHires(prev => prev.filter(h => h.id !== hire.id))}
                          assumptions={assumptions}
                          index={idx}
                        />
                      ))}
                    </AnimatePresence>
                  </tbody>
                  <tfoot>
                    <tr style={{ backgroundColor: INK.goldGlow }}>
                      <td className="py-4 pr-4" style={{ fontFamily: FONT.sans, fontSize: 13, fontWeight: 600, color: INK.gold }}>
                        New Hires Total
                      </td>
                      <td colSpan={4} />
                      <td className="py-4 px-3 text-right" style={{ fontFamily: FONT.mono, fontSize: 13, fontWeight: 600, color: INK.gold }}>
                        {newHireStats.sessionsPerYear.toLocaleString()}
                      </td>
                      <td className="py-4 pl-3 text-right" style={{ fontFamily: FONT.mono, fontSize: 14, fontWeight: 700, color: INK.gold }}>
                        ${(newHireStats.revenue / 1000).toFixed(0)}K
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-10"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: INK.cream }}
                >
                  <Users size={28} style={{ color: INK.ghost }} />
                </div>
                <p style={{ fontFamily: FONT.sans, fontSize: 14, color: INK.muted, textAlign: 'center' }}>
                  No new hires planned yet.
                  <br />
                  <span style={{ color: INK.faded }}>Add hires to model their contribution to your goal.</span>
                </p>
              </motion.div>
            )}
          </div>
        </LedgerCard>

        {/* Summary Footer */}
        <SummaryFooter
          totalSessionsPerWeek={totals.sessionsPerWeek}
          totalSessionsPerYear={totals.sessionsPerYear}
          totalRevenue={totals.revenue}
          goalRevenue={revenueGoal}
        />

        {/* Client Requirements */}
        <ClientRequirements
          sessionsPerWeek={totals.sessionsPerWeek}
          assumptions={assumptions}
          currentActiveClients={185}
        />

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 mt-8 pb-8">
          <PrimaryButton onClick={() => {}} icon={<Download size={16} />} variant="stone">
            Export
          </PrimaryButton>
          <PrimaryButton onClick={handleApplyGoals} icon={<Check size={16} />} variant="emerald">
            Apply Goals
          </PrimaryButton>
        </div>
      </div>

      {/* Apply Confirmation Toast */}
      <AnimatePresence>
        {showApplyConfirm && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl"
            style={{
              backgroundColor: INK.emerald,
              boxShadow: '0 12px 40px rgba(4, 120, 87, 0.4)',
            }}
          >
            <CheckCircle size={22} weight="fill" color="white" />
            <span style={{ fontFamily: FONT.sans, fontSize: 15, fontWeight: 600, color: 'white' }}>
              Goals applied to {MOCK_CLINICIANS.length} clinicians
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RevenuePlanning;
