import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Calendar, Target, Clock, Save, Check } from 'lucide-react';
import {
  FONT,
  INK,
  EASE,
  SectionHeader,
  SectionDivider,
  LedgerCard,
} from './shared';
import { useSettings, PracticeGoals, MetricThresholds } from '../../context/SettingsContext';

// =============================================================================
// PRACTICE TAB - The Accounting Ledger
// =============================================================================
// How your practice measures success. Goals, definitions, thresholds.
// Each section is a chapter. Large serif numbers for the goals.
// Color-coded cards for risk thresholds. Everything saves in one action.
// =============================================================================

interface PracticeTabProps {
  clinicians: { sessionGoal: number }[];
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

// Large goal input with serif typography
const GoalInput: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  hint?: string;
}> = ({ icon, label, value, onChange, prefix, suffix, hint }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className="p-6 rounded-2xl transition-all duration-200"
      style={{
        backgroundColor: isFocused ? INK.paper : INK.cream,
        border: `1.5px solid ${isFocused ? INK.gold : 'transparent'}`,
        boxShadow: isFocused ? `0 0 0 3px ${INK.goldGlow}` : 'none',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: INK.goldGlow, color: INK.gold }}
        >
          {icon}
        </div>
        <span
          style={{
            fontFamily: FONT.sans,
            fontSize: 12,
            fontWeight: 600,
            color: INK.muted,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </span>
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1">
        {prefix && (
          <span
            style={{
              fontFamily: FONT.serif,
              fontSize: 24,
              color: INK.faded,
            }}
          >
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="bg-transparent border-none outline-none w-full"
          style={{
            fontFamily: FONT.serif,
            fontSize: 36,
            fontWeight: 400,
            color: INK.black,
            lineHeight: 1.2,
          }}
        />
        {suffix && (
          <span
            style={{
              fontFamily: FONT.sans,
              fontSize: 16,
              color: INK.faded,
              fontWeight: 500,
            }}
          >
            {suffix}
          </span>
        )}
      </div>

      {/* Hint */}
      {hint && (
        <p
          className="mt-3"
          style={{
            fontFamily: FONT.sans,
            fontSize: 12,
            color: INK.ghost,
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

// Colored threshold card
const ThresholdCard: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  color: 'emerald' | 'amber' | 'rose';
  suffix?: string;
}> = ({ label, value, onChange, color, suffix = 'days' }) => {
  const colors = {
    emerald: { bg: INK.emeraldLight, text: INK.emerald, border: INK.emerald + '30' },
    amber: { bg: INK.amberLight, text: INK.amber, border: INK.amber + '30' },
    rose: { bg: INK.roseLight, text: INK.rose, border: INK.rose + '30' },
  };
  const c = colors[color];

  return (
    <div
      className="p-5 rounded-xl"
      style={{
        backgroundColor: c.bg,
        border: `1px solid ${c.border}`,
      }}
    >
      <label
        className="block mb-2"
        style={{
          fontFamily: FONT.sans,
          fontSize: 11,
          fontWeight: 700,
          color: c.text,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </label>
      <div className="flex items-baseline gap-2">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          className="bg-transparent border-none outline-none w-16"
          style={{
            fontFamily: FONT.serif,
            fontSize: 28,
            fontWeight: 400,
            color: c.text,
          }}
        />
        <span
          style={{
            fontFamily: FONT.sans,
            fontSize: 13,
            color: c.text,
            opacity: 0.7,
          }}
        >
          {suffix}
        </span>
      </div>
    </div>
  );
};

// Button selector for presets
const ButtonSelector: React.FC<{
  options: number[];
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
}> = ({ options, value, onChange, suffix = 'h' }) => (
  <div className="flex gap-2">
    {options.map((opt) => {
      const isSelected = value === opt;
      return (
        <motion.button
          key={opt}
          onClick={() => onChange(opt)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-5 py-3 rounded-xl font-semibold transition-all duration-200"
          style={{
            fontFamily: FONT.sans,
            fontSize: 14,
            color: isSelected ? 'white' : INK.muted,
            backgroundColor: isSelected ? INK.gold : INK.cream,
            border: 'none',
            cursor: 'pointer',
            boxShadow: isSelected ? `0 4px 12px ${INK.gold}40` : 'none',
          }}
        >
          {opt}{suffix}
        </motion.button>
      );
    })}
  </div>
);

// Radio option for definitions
const RadioOption: React.FC<{
  selected: boolean;
  onSelect: () => void;
  title: string;
  description: React.ReactNode;
}> = ({ selected, onSelect, title, description }) => (
  <motion.label
    whileHover={{ scale: 1.005 }}
    whileTap={{ scale: 0.995 }}
    className="flex items-start gap-4 p-5 rounded-xl cursor-pointer transition-all duration-200"
    style={{
      border: `2px solid ${selected ? INK.gold : INK.rule}`,
      backgroundColor: selected ? INK.goldGlow : 'transparent',
    }}
  >
    <input
      type="radio"
      checked={selected}
      onChange={onSelect}
      className="sr-only"
    />
    <div
      className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200"
      style={{
        borderColor: selected ? INK.gold : INK.rule,
        backgroundColor: selected ? INK.gold : 'transparent',
      }}
    >
      {selected && <Check size={12} color="white" strokeWidth={3} />}
    </div>
    <div>
      <div
        style={{
          fontFamily: FONT.sans,
          fontSize: 15,
          fontWeight: 600,
          color: INK.black,
        }}
      >
        {title}
      </div>
      <div
        className="mt-1"
        style={{
          fontFamily: FONT.sans,
          fontSize: 13,
          color: INK.muted,
        }}
      >
        {description}
      </div>
    </div>
  </motion.label>
);

// Performance slider
const PerformanceSlider: React.FC<{
  label: string;
  healthyValue: number;
  criticalValue: number;
  onHealthyChange: (v: number) => void;
  onCriticalChange: (v: number) => void;
}> = ({ label, healthyValue, criticalValue, onHealthyChange, onCriticalChange }) => (
  <div
    className="p-5 rounded-xl"
    style={{ backgroundColor: INK.cream }}
  >
    <h4
      className="mb-5"
      style={{
        fontFamily: FONT.sans,
        fontSize: 13,
        fontWeight: 600,
        color: INK.body,
      }}
    >
      {label}
    </h4>
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span
          style={{
            fontFamily: FONT.sans,
            fontSize: 13,
            color: INK.emerald,
            fontWeight: 500,
          }}
        >
          Healthy above
        </span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={healthyValue}
            onChange={(e) => onHealthyChange(parseInt(e.target.value) || 0)}
            className="w-16 px-3 py-1.5 rounded-lg bg-white border outline-none text-center transition-all"
            style={{
              fontFamily: FONT.mono,
              fontSize: 14,
              color: INK.emerald,
              borderColor: INK.rule,
            }}
            onFocus={(e) => (e.target.style.borderColor = INK.emerald)}
            onBlur={(e) => (e.target.style.borderColor = INK.rule)}
          />
          <span style={{ fontFamily: FONT.sans, fontSize: 13, color: INK.muted }}>%</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span
          style={{
            fontFamily: FONT.sans,
            fontSize: 13,
            color: INK.rose,
            fontWeight: 500,
          }}
        >
          Critical below
        </span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={criticalValue}
            onChange={(e) => onCriticalChange(parseInt(e.target.value) || 0)}
            className="w-16 px-3 py-1.5 rounded-lg bg-white border outline-none text-center transition-all"
            style={{
              fontFamily: FONT.mono,
              fontSize: 14,
              color: INK.rose,
              borderColor: INK.rule,
            }}
            onFocus={(e) => (e.target.style.borderColor = INK.rose)}
            onBlur={(e) => (e.target.style.borderColor = INK.rule)}
          />
          <span style={{ fontFamily: FONT.sans, fontSize: 13, color: INK.muted }}>%</span>
        </div>
      </div>
    </div>
  </div>
);

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const PracticeTab: React.FC<PracticeTabProps> = ({ clinicians }) => {
  const { settings, updateSettings } = useSettings();
  const [goals, setGoals] = useState<PracticeGoals>(settings.practiceGoals);
  const [thresholds, setThresholds] = useState<MetricThresholds>(settings.thresholds);
  const [isDirty, setIsDirty] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  // Track changes
  useEffect(() => {
    const goalsChanged = JSON.stringify(goals) !== JSON.stringify(settings.practiceGoals);
    const thresholdsChanged = JSON.stringify(thresholds) !== JSON.stringify(settings.thresholds);
    setIsDirty(goalsChanged || thresholdsChanged);
  }, [goals, thresholds, settings]);

  // Save changes
  const handleSave = () => {
    updateSettings({ practiceGoals: goals, thresholds });
    setIsDirty(false);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  // Compute clinician totals
  const totalWeeklySessions = clinicians.reduce((sum, c) => sum + c.sessionGoal, 0);

  // Format currency
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header with Save Button */}
      <SectionHeader
        title="Practice Settings"
        subtitle="Goals, definitions, and how your metrics are calculated"
        actions={
          <AnimatePresence mode="wait">
            {isDirty && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -4 }}
                onClick={handleSave}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2"
                style={{
                  fontFamily: FONT.sans,
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: 12,
                  border: 'none',
                  cursor: 'pointer',
                  background: `linear-gradient(135deg, ${INK.emerald} 0%, #065f46 100%)`,
                  boxShadow: '0 4px 16px rgba(4, 120, 87, 0.3)',
                }}
              >
                <Save size={16} />
                Save Changes
              </motion.button>
            )}
            {justSaved && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                style={{
                  backgroundColor: INK.emeraldLight,
                  color: INK.emerald,
                  fontFamily: FONT.sans,
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                <Check size={16} />
                Saved
              </motion.div>
            )}
          </AnimatePresence>
        }
      />

      {/* Section 1: Practice Goals */}
      <LedgerCard className="mb-8">
        <div className="p-8">
          <h3
            className="mb-6"
            style={{
              fontFamily: FONT.serif,
              fontSize: 20,
              color: INK.black,
            }}
          >
            Practice Goals
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <GoalInput
              icon={<DollarSign size={16} />}
              label="Monthly Revenue"
              value={goals.monthlyRevenue}
              onChange={(v) => setGoals({ ...goals, monthlyRevenue: v })}
              prefix="$"
              hint={`${formatCurrency(goals.monthlyRevenue * 12)} annually`}
            />
            <GoalInput
              icon={<Calendar size={16} />}
              label="Monthly Sessions"
              value={goals.monthlySessions}
              onChange={(v) => setGoals({ ...goals, monthlySessions: v })}
              hint={`${Math.round(goals.monthlySessions / 4)}/wk · Team: ${totalWeeklySessions * 4}/mo`}
            />
            <GoalInput
              icon={<Target size={16} />}
              label="Target Rebook Rate"
              value={goals.targetRebookRate}
              onChange={(v) => setGoals({ ...goals, targetRebookRate: v })}
              suffix="%"
              hint="Industry benchmark: 85%"
            />
          </div>
        </div>
      </LedgerCard>

      {/* Section 2: Client Definitions */}
      <LedgerCard className="mb-8">
        <div className="p-8">
          <h3
            className="mb-6"
            style={{
              fontFamily: FONT.serif,
              fontSize: 20,
              color: INK.black,
            }}
          >
            Client Definitions
          </h3>

          {/* Active client definition */}
          <div className="mb-8">
            <h4
              className="mb-4"
              style={{
                fontFamily: FONT.sans,
                fontSize: 13,
                fontWeight: 600,
                color: INK.muted,
              }}
            >
              How do you define an active client?
            </h4>
            <div className="space-y-3">
              <RadioOption
                selected={thresholds.clientDefinitionType === 'status-based'}
                onSelect={() => setThresholds({ ...thresholds, clientDefinitionType: 'status-based' })}
                title="SimplePractice Status"
                description='Active = "Active" status in SimplePractice'
              />
              <RadioOption
                selected={thresholds.clientDefinitionType === 'activity-based'}
                onSelect={() => setThresholds({ ...thresholds, clientDefinitionType: 'activity-based' })}
                title="Activity-Based"
                description={
                  <span>
                    Active = had appointment within{' '}
                    <input
                      type="number"
                      value={thresholds.activityThresholdDays}
                      onChange={(e) => setThresholds({ ...thresholds, activityThresholdDays: parseInt(e.target.value) || 30 })}
                      onClick={(e) => e.stopPropagation()}
                      className="w-12 px-2 py-0.5 mx-1 rounded border text-center"
                      style={{
                        fontFamily: FONT.mono,
                        fontSize: 13,
                        color: INK.black,
                        borderColor: INK.rule,
                      }}
                    />{' '}
                    days
                  </span>
                }
              />
            </div>
          </div>

          <SectionDivider />

          {/* At-risk thresholds */}
          <div className="mb-8">
            <h4
              className="mb-4"
              style={{
                fontFamily: FONT.sans,
                fontSize: 13,
                fontWeight: 600,
                color: INK.muted,
              }}
            >
              At-Risk Client Thresholds
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <ThresholdCard
                label="Low Risk"
                value={thresholds.atRiskLow}
                onChange={(v) => setThresholds({ ...thresholds, atRiskLow: v })}
                color="emerald"
              />
              <ThresholdCard
                label="Medium Risk"
                value={thresholds.atRiskMedium}
                onChange={(v) => setThresholds({ ...thresholds, atRiskMedium: v })}
                color="amber"
              />
              <ThresholdCard
                label="High Risk"
                value={thresholds.atRiskHigh}
                onChange={(v) => setThresholds({ ...thresholds, atRiskHigh: v })}
                color="rose"
              />
            </div>
          </div>

          <SectionDivider />

          {/* Churn timing */}
          <div>
            <h4
              className="mb-4"
              style={{
                fontFamily: FONT.sans,
                fontSize: 13,
                fontWeight: 600,
                color: INK.muted,
              }}
            >
              Churn Timing (by session count)
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <ThresholdCard
                label="Early Churn"
                value={thresholds.earlyChurnSessions}
                onChange={(v) => setThresholds({ ...thresholds, earlyChurnSessions: v })}
                color="rose"
                suffix="sessions"
              />
              <div
                className="flex items-center justify-center p-5 rounded-xl"
                style={{
                  backgroundColor: INK.cream,
                  border: `1px solid ${INK.rule}`,
                }}
              >
                <span
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 13,
                    color: INK.faded,
                  }}
                >
                  {thresholds.earlyChurnSessions + 1} – {thresholds.lateChurnSessions - 1} sessions
                </span>
              </div>
              <ThresholdCard
                label="Late Churn"
                value={thresholds.lateChurnSessions}
                onChange={(v) => setThresholds({ ...thresholds, lateChurnSessions: v })}
                color="amber"
                suffix="sessions"
              />
            </div>
          </div>
        </div>
      </LedgerCard>

      {/* Section 3: Session & Compliance Rules */}
      <LedgerCard className="mb-8">
        <div className="p-8">
          <h3
            className="mb-6"
            style={{
              fontFamily: FONT.serif,
              fontSize: 20,
              color: INK.black,
            }}
          >
            Session & Compliance Rules
          </h3>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4
                className="mb-4"
                style={{
                  fontFamily: FONT.sans,
                  fontSize: 13,
                  fontWeight: 600,
                  color: INK.muted,
                }}
              >
                Late Cancel Window
              </h4>
              <ButtonSelector
                options={[12, 24, 48]}
                value={thresholds.lateCancelHours}
                onChange={(v) => setThresholds({ ...thresholds, lateCancelHours: v })}
              />
              <p
                className="mt-3"
                style={{
                  fontFamily: FONT.sans,
                  fontSize: 12,
                  color: INK.ghost,
                }}
              >
                Cancellations within this window count as late cancels
              </p>
            </div>
            <div>
              <h4
                className="mb-4"
                style={{
                  fontFamily: FONT.sans,
                  fontSize: 13,
                  fontWeight: 600,
                  color: INK.muted,
                }}
              >
                Note Deadline
              </h4>
              <ButtonSelector
                options={[24, 48, 72, 96]}
                value={goals.noteDeadlineHours}
                onChange={(v) => setGoals({ ...goals, noteDeadlineHours: v })}
              />
              <p
                className="mt-3"
                style={{
                  fontFamily: FONT.sans,
                  fontSize: 12,
                  color: INK.ghost,
                }}
              >
                Hours after session to complete notes
              </p>
            </div>
          </div>
        </div>
      </LedgerCard>

      {/* Section 4: Performance Bands */}
      <LedgerCard className="mb-8">
        <div className="p-8">
          <h3
            className="mb-6"
            style={{
              fontFamily: FONT.serif,
              fontSize: 20,
              color: INK.black,
            }}
          >
            Performance Bands
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <PerformanceSlider
              label="Revenue Status"
              healthyValue={thresholds.revenueHealthy}
              criticalValue={thresholds.revenueCritical}
              onHealthyChange={(v) => setThresholds({ ...thresholds, revenueHealthy: v })}
              onCriticalChange={(v) => setThresholds({ ...thresholds, revenueCritical: v })}
            />
            <PerformanceSlider
              label="Rebook Rate Status"
              healthyValue={thresholds.rebookHealthy}
              criticalValue={thresholds.rebookCritical}
              onHealthyChange={(v) => setThresholds({ ...thresholds, rebookHealthy: v })}
              onCriticalChange={(v) => setThresholds({ ...thresholds, rebookCritical: v })}
            />
          </div>
        </div>
      </LedgerCard>

      {/* Section 5: Calendar Settings */}
      <LedgerCard>
        <div className="p-8">
          <h3
            className="mb-6"
            style={{
              fontFamily: FONT.serif,
              fontSize: 20,
              color: INK.black,
            }}
          >
            Calendar Settings
          </h3>
          <div className="flex items-center gap-4">
            <span
              style={{
                fontFamily: FONT.sans,
                fontSize: 14,
                color: INK.body,
              }}
            >
              Working weeks per year:
            </span>
            <input
              type="number"
              defaultValue={50}
              className="w-20 px-4 py-2.5 rounded-xl bg-transparent border outline-none text-center transition-all"
              style={{
                fontFamily: FONT.serif,
                fontSize: 18,
                color: INK.black,
                borderColor: INK.rule,
              }}
              onFocus={(e) => (e.target.style.borderColor = INK.gold)}
              onBlur={(e) => (e.target.style.borderColor = INK.rule)}
            />
          </div>
          <p
            className="mt-3"
            style={{
              fontFamily: FONT.sans,
              fontSize: 12,
              color: INK.ghost,
            }}
          >
            Accounts for PTO. Utilization goals will scale accordingly.
          </p>
        </div>
      </LedgerCard>
    </motion.div>
  );
};

export default PracticeTab;
