import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import {
  SingleGoalPeriod,
  ClinicianGoalHistory,
  GoalType,
  getGoalTypePeriods,
} from '../../context/SettingsContext';
import { ChartCard, LineChart } from '../design-system';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const SERIF = "'Tiempos Headline', Georgia, serif";

// ---------------------------------------------------------------------------
// Goal Section Config
// ---------------------------------------------------------------------------

interface GoalSectionConfig {
  type: GoalType;
  dataKey: string;
  title: string;
  color: string;
  unit: string;
}

const SESSIONS_COLOR = '#C24D38';
const CLIENTS_COLOR = '#1A7A6D';

const GOAL_SECTIONS: GoalSectionConfig[] = [
  {
    type: 'sessionGoal',
    dataKey: 'sessions',
    title: 'Weekly Sessions Goal',
    color: SESSIONS_COLOR,
    unit: '/wk',
  },
  {
    type: 'clientGoal',
    dataKey: 'clients',
    title: 'Active Clients Goal',
    color: CLIENTS_COLOR,
    unit: '',
  },
];

// ---------------------------------------------------------------------------
// Helpers — convert goal periods into chart-friendly data
// ---------------------------------------------------------------------------

function fmtMonth(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Convert goal periods into transition-point data for LineChart.
 * Instead of one point per month (which creates dot overload),
 * we create points only at boundaries where the goal changes,
 * plus the current month. This gives a clean step-line appearance.
 */
function periodsToChartData(
  periods: SingleGoalPeriod[],
  dataKey: string
): Record<string, any>[] {
  if (periods.length === 0) return [];

  const sorted = [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const data: Record<string, any>[] = [];
  const now = new Date();
  const nowISO = toISO(now);

  sorted.forEach((period, i) => {
    const startLabel = fmtMonth(period.startDate);

    // Start of this period
    data.push({ month: startLabel, [dataKey]: period.value });

    // End of this period (or current month if ongoing)
    const endISO = period.endDate ?? nowISO;
    const endLabel = fmtMonth(endISO);

    // Only add end point if it's a different month than start
    if (endLabel !== startLabel) {
      // If there's a next period, add a point just before the transition
      // at the old value to create a step effect
      if (i < sorted.length - 1) {
        data.push({ month: endLabel, [dataKey]: period.value });
      } else {
        // Current/last period — extend to now
        data.push({ month: endLabel, [dataKey]: period.value });
      }
    }
  });

  return data;
}

// ---------------------------------------------------------------------------
// GoalHistoryModal
// ---------------------------------------------------------------------------

interface GoalHistoryModalProps {
  clinician: {
    id: string;
    name: string;
    initials: string;
    color: string;
    role: string;
    startDate: string;
  };
  goalHistory: ClinicianGoalHistory;
  onClose: () => void;
}

export const GoalHistoryModal: React.FC<GoalHistoryModalProps> = ({
  clinician,
  goalHistory,
  onClose,
}) => {
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
          background: 'rgba(28, 25, 23, 0.5)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="fixed inset-0 z-[10000] flex items-center justify-center p-6 lg:pl-[100px]"
        style={{ pointerEvents: 'none' }}
      >
        <div
          className="relative w-full max-w-[94vw] max-h-[92vh] overflow-y-auto rounded-3xl"
          style={{
            pointerEvents: 'auto',
            background: 'linear-gradient(145deg, #ffffff 0%, #fafaf9 100%)',
            boxShadow: '0 50px 100px -20px rgba(0,0,0,0.25), 0 30px 60px -30px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.05)',
          }}
        >
          {/* Header */}
          <div
            className="sticky top-0 z-10 flex items-start justify-between px-10 pt-8 pb-6"
            style={{
              background: 'linear-gradient(180deg, #ffffff 85%, rgba(255,255,255,0))',
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${clinician.color} 0%, ${clinician.color}cc 100%)`,
                }}
              >
                {clinician.initials}
              </div>
              <div>
                <h2
                  className="text-stone-900 text-3xl font-bold tracking-tight"
                  style={{ fontFamily: SERIF }}
                >
                  Goal History
                </h2>
                <p className="text-stone-500 text-base mt-0.5">
                  {clinician.name} &middot;{' '}
                  <span className="text-stone-400">{clinician.role}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-3 rounded-xl bg-stone-100/80 hover:bg-stone-200 text-stone-500 hover:text-stone-700 transition-all hover:scale-105 active:scale-95"
            >
              <X size={18} strokeWidth={2} />
            </button>
          </div>

          {/* Body — two chart cards side by side */}
          <div className="px-10 pb-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {GOAL_SECTIONS.map(section => (
                <GoalChartSection
                  key={section.type}
                  clinicianId={clinician.id}
                  clinicianStartDate={clinician.startDate}
                  goalHistory={goalHistory}
                  config={section}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

// ---------------------------------------------------------------------------
// GoalChartSection — one ChartCard + LineChart per metric
// ---------------------------------------------------------------------------

const GoalChartSection: React.FC<{
  clinicianId: string;
  clinicianStartDate: string;
  goalHistory: ClinicianGoalHistory;
  config: GoalSectionConfig;
}> = ({ clinicianId, clinicianStartDate, goalHistory, config }) => {

  const periods = useMemo(
    () => getGoalTypePeriods(clinicianId, config.type, goalHistory),
    [clinicianId, config.type, goalHistory]
  );

  const chartData = useMemo(
    () => periodsToChartData(periods, config.dataKey),
    [periods, config.dataKey]
  );

  const allValues = periods.map(p => p.value);
  const maxValue = allValues.length > 0 ? Math.max(...allValues) : 0;
  const minValue = allValues.length > 0 ? Math.min(...allValues) : 0;

  // Y domain — give 20% padding
  const yMin = Math.max(0, minValue - Math.ceil(minValue * 0.2));
  const yMax = maxValue + Math.ceil(maxValue * 0.2);

  if (chartData.length === 0) {
    return (
      <ChartCard
        title={config.title}
        minHeight="360px"
      >
        <div className="flex items-center justify-center h-full">
          <p className="text-stone-400 text-base italic">
            No goal history recorded
          </p>
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title={config.title}
      minHeight="420px"
    >
      <LineChart
        data={chartData}
        xAxisKey="month"
        lines={[
          {
            dataKey: config.dataKey,
            color: config.color,
            name: config.title,
          },
        ]}
        yDomain={[yMin, yMax]}
        showAreaFill
        height={280}
        tooltipFormatter={(value, name) => [`${value}${config.unit}`, name]}
      />
    </ChartCard>
  );
};

export default GoalHistoryModal;
