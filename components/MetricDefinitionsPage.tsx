import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

type ClientDefinitionType = 'status-based' | 'activity-based';

interface MetricDefinitions {
  clientDefinition: {
    type: ClientDefinitionType;
    activityDays: number;
  };
  atRiskThresholds: {
    lowRisk: { min: number; max: number };
    mediumRisk: { min: number; max: number };
    highRisk: { min: number };
  };
  churnTiming: {
    earlyChurn: number;
    lateChurn: number;
  };
  lateCancelWindow: number;
  noteDeadline: number;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const MetricDefinitionsPage: React.FC = () => {
  const navigate = useNavigate();

  const [definitions, setDefinitions] = useState<MetricDefinitions>({
    clientDefinition: { type: 'status-based', activityDays: 30 },
    atRiskThresholds: {
      lowRisk: { min: 7, max: 14 },
      mediumRisk: { min: 14, max: 21 },
      highRisk: { min: 21 },
    },
    churnTiming: { earlyChurn: 5, lateChurn: 15 },
    lateCancelWindow: 24,
    noteDeadline: 3,
  });

  const [hasChanges, setHasChanges] = useState(false);

  const update = (updates: Partial<MetricDefinitions>) => {
    setDefinitions((prev) => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const handleSave = () => {
    console.log('Saving:', definitions);
    setHasChanges(false);
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-32">
        {/* Header */}
        <button
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-700 mb-6"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Settings</span>
        </button>

        <h1 className="text-2xl font-bold text-stone-800 mb-1">Metric Definitions</h1>
        <p className="text-stone-500 mb-8">Customize how metrics are calculated</p>

        <div className="space-y-8">
          {/* Active & Churned Clients */}
          <section>
            <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-wide mb-4">
              Active & Churned Clients
            </h2>
            <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3">
              <p className="text-xs text-stone-500 mb-4">
                These definitions are linked—changing "active" updates "churned" automatically.
              </p>

              {/* Status-based option */}
              <button
                onClick={() => update({ clientDefinition: { ...definitions.clientDefinition, type: 'status-based' } })}
                className={`w-full p-4 rounded-xl text-left border-2 transition-colors ${
                  definitions.clientDefinition.type === 'status-based'
                    ? 'border-amber-400 bg-amber-50'
                    : 'border-stone-100 hover:border-stone-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                    definitions.clientDefinition.type === 'status-based' ? 'border-amber-500 bg-amber-500' : 'border-stone-300'
                  }`}>
                    {definitions.clientDefinition.type === 'status-based' && <Check size={10} className="text-white" />}
                  </div>
                  <div>
                    <p className="font-medium text-stone-800">SimplePractice Status</p>
                    <p className="text-xs text-stone-500 mt-1">
                      <span className="font-medium text-emerald-600">Active</span> = status is "Active" in SimplePractice
                    </p>
                    <p className="text-xs text-stone-500">
                      <span className="font-medium text-red-600">Churned</span> = status is "Inactive" with no future appointments
                    </p>
                  </div>
                </div>
              </button>

              {/* Activity-based option */}
              <button
                onClick={() => update({ clientDefinition: { ...definitions.clientDefinition, type: 'activity-based' } })}
                className={`w-full p-4 rounded-xl text-left border-2 transition-colors ${
                  definitions.clientDefinition.type === 'activity-based'
                    ? 'border-amber-400 bg-amber-50'
                    : 'border-stone-100 hover:border-stone-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                    definitions.clientDefinition.type === 'activity-based' ? 'border-amber-500 bg-amber-500' : 'border-stone-300'
                  }`}>
                    {definitions.clientDefinition.type === 'activity-based' && <Check size={10} className="text-white" />}
                  </div>
                  <div>
                    <p className="font-medium text-stone-800">Activity-Based</p>
                    <p className="text-xs text-stone-500 mt-1">
                      <span className="font-medium text-emerald-600">Active</span> = had an appointment within the threshold below
                    </p>
                    <p className="text-xs text-stone-500">
                      <span className="font-medium text-red-600">Churned</span> = no appointment within threshold AND none scheduled
                    </p>
                  </div>
                </div>
              </button>

              {definitions.clientDefinition.type === 'activity-based' && (
                <div className="flex items-center justify-between pt-2 pl-7">
                  <span className="text-sm text-stone-600">Activity threshold</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={definitions.clientDefinition.activityDays}
                      onChange={(e) => update({ clientDefinition: { ...definitions.clientDefinition, activityDays: Math.max(7, Math.min(90, parseInt(e.target.value) || 7)) } })}
                      className="w-16 px-2 py-1.5 rounded-lg bg-stone-100 border border-stone-200 text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    <span className="text-sm text-stone-500">days</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* At-Risk Thresholds */}
          <section>
            <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-wide mb-4">
              At-Risk Client Thresholds
            </h2>
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <p className="text-xs text-stone-500 mb-4">
                Days since last session for clients without upcoming appointments.
              </p>

              <div className="space-y-3">
                {[
                  { label: 'Low Risk', color: 'bg-yellow-400', key: 'lowRisk' as const },
                  { label: 'Medium Risk', color: 'bg-orange-500', key: 'mediumRisk' as const },
                ].map(({ label, color, key }) => (
                  <div key={key} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                      <span className="text-sm text-stone-700">{label}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <input
                        type="number"
                        value={definitions.atRiskThresholds[key].min}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          if (key === 'lowRisk') {
                            update({ atRiskThresholds: { ...definitions.atRiskThresholds, lowRisk: { ...definitions.atRiskThresholds.lowRisk, min: val } } });
                          } else {
                            update({ atRiskThresholds: { ...definitions.atRiskThresholds, lowRisk: { ...definitions.atRiskThresholds.lowRisk, max: val }, mediumRisk: { ...definitions.atRiskThresholds.mediumRisk, min: val } } });
                          }
                        }}
                        className="w-14 px-2 py-1 rounded bg-stone-100 border border-stone-200 text-center font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                      <span className="text-stone-400">–</span>
                      <input
                        type="number"
                        value={definitions.atRiskThresholds[key].max}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          if (key === 'lowRisk') {
                            update({ atRiskThresholds: { ...definitions.atRiskThresholds, lowRisk: { ...definitions.atRiskThresholds.lowRisk, max: val }, mediumRisk: { ...definitions.atRiskThresholds.mediumRisk, min: val } } });
                          } else {
                            update({ atRiskThresholds: { ...definitions.atRiskThresholds, mediumRisk: { ...definitions.atRiskThresholds.mediumRisk, max: val }, highRisk: { min: val } } });
                          }
                        }}
                        className="w-14 px-2 py-1 rounded bg-stone-100 border border-stone-200 text-center font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                      <span className="text-stone-500">days</span>
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="text-sm text-stone-700">High Risk</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <input
                      type="number"
                      value={definitions.atRiskThresholds.highRisk.min}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        update({ atRiskThresholds: { ...definitions.atRiskThresholds, mediumRisk: { ...definitions.atRiskThresholds.mediumRisk, max: val }, highRisk: { min: val } } });
                      }}
                      className="w-14 px-2 py-1 rounded bg-stone-100 border border-stone-200 text-center font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    <span className="text-stone-500">+ days</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Churn Timing */}
          <section>
            <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-wide mb-4">
              Churn Timing Categories
            </h2>
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <p className="text-xs text-stone-500 mb-4">
                Categorize churned clients by sessions completed before leaving.
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <span className="text-sm font-medium text-red-700">Early Churn</span>
                    <p className="text-xs text-stone-400">Engagement issues</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-stone-400">&lt;</span>
                    <input
                      type="number"
                      value={definitions.churnTiming.earlyChurn}
                      onChange={(e) => update({ churnTiming: { ...definitions.churnTiming, earlyChurn: Math.max(1, parseInt(e.target.value) || 1) } })}
                      className="w-14 px-2 py-1 rounded bg-stone-100 border border-stone-200 text-center font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    <span className="text-stone-500">sessions</span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <span className="text-sm font-medium text-amber-700">Medium Churn</span>
                    <p className="text-xs text-stone-400">Treatment plateau</p>
                  </div>
                  <span className="text-sm text-stone-500">
                    {definitions.churnTiming.earlyChurn} – {definitions.churnTiming.lateChurn} sessions
                  </span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <span className="text-sm font-medium text-emerald-700">Late Churn</span>
                    <p className="text-xs text-stone-400">Natural completion</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-stone-400">&gt;</span>
                    <input
                      type="number"
                      value={definitions.churnTiming.lateChurn}
                      onChange={(e) => update({ churnTiming: { ...definitions.churnTiming, lateChurn: Math.max(definitions.churnTiming.earlyChurn + 1, parseInt(e.target.value) || 1) } })}
                      className="w-14 px-2 py-1 rounded bg-stone-100 border border-stone-200 text-center font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    <span className="text-stone-500">sessions</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Other Settings */}
          <section>
            <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-wide mb-4">
              Other Settings
            </h2>
            <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-700">Late Cancel Window</p>
                  <p className="text-xs text-stone-400">Hours before appointment</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={definitions.lateCancelWindow}
                    onChange={(e) => update({ lateCancelWindow: Math.max(1, Math.min(72, parseInt(e.target.value) || 1)) })}
                    className="w-16 px-2 py-1.5 rounded bg-stone-100 border border-stone-200 text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <span className="text-sm text-stone-500">hours</span>
                </div>
              </div>

              <div className="border-t border-stone-100 pt-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-700">Note Deadline</p>
                  <p className="text-xs text-stone-400">Days after session</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={definitions.noteDeadline}
                    onChange={(e) => update({ noteDeadline: Math.max(1, Math.min(14, parseInt(e.target.value) || 1)) })}
                    className="w-16 px-2 py-1.5 rounded bg-stone-100 border border-stone-200 text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <span className="text-sm text-stone-500">days</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Save Button */}
        {hasChanges && (
          <div className="fixed bottom-20 lg:bottom-8 left-0 lg:left-[72px] right-0 px-4 sm:px-6 z-40">
            <div className="max-w-2xl mx-auto">
              <button
                onClick={handleSave}
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
