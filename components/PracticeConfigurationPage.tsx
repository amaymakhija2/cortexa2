import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Users,
  Target,
  Sliders,
  TrendingUp,
  ArrowRight,
  Link2,
} from 'lucide-react';
import { PageHeader, SegmentedControl, SectionContainer } from './design-system';
import type { SegmentedControlOption } from './design-system/controls/SegmentedControl';
import { OfficeMapping, type RawEHROffice, type LocationGroup } from './OfficeMapping';
import {
  useSettings,
  PracticeGoals,
  MetricThresholds,
  ClinicianGoalOverrides,
} from '../context/SettingsContext';

// Import shared types and data
import {
  Clinician,
  Location,
  EHRConnection,
  RawEHRClinician,
  MOCK_LOCATIONS,
  MOCK_EHR_OFFICES,
  MOCK_LOCATION_GROUPS,
  MOCK_CLINICIANS,
  MOCK_EHR,
  MOCK_EHR_CLINICIANS,
} from './configure/shared';
import { ClinicianMapping } from './ClinicianMapping';

// Import tab components
import { LocationsTab } from './configure/LocationsTab';
import { TeamMembersTab } from './configure/TeamMembersTab';
import { ClinicianGoalsTab } from './configure/ClinicianGoalsTab';
import { PracticeGoalsTab } from './configure/PracticeGoalsTab';
import { ThresholdsTab } from './configure/ThresholdsTab';
import { ConsultationFlowTab } from './configure/ConsultationFlowTab';
import { EHRConnectionTab } from './configure/EHRConnectionTab';

// =============================================================================
// PRACTICE CONFIGURATION PAGE
// =============================================================================
// Full-page configuration experience for practice owners.
// Manages locations, team structure, clinician settings, goals, thresholds, and EHR.
// Follows the same structure as Practice Analysis with tabbed navigation.
// Uses master clinician list from data/clinicians.ts
// =============================================================================

// Tab types matching URL params
type ConfigTab = 'locations' | 'members' | 'clinician-goals' | 'goals' | 'thresholds' | 'consultation-flow' | 'ehr';

const CONFIG_TABS: SegmentedControlOption<ConfigTab>[] = [
  { id: 'locations', label: 'Locations', icon: <MapPin size={16} /> },
  { id: 'members', label: 'Members', icon: <Users size={16} /> },
  { id: 'clinician-goals', label: 'Clinician Goals', icon: <Target size={16} /> },
  { id: 'goals', label: 'Practice Goals', icon: <TrendingUp size={16} /> },
  { id: 'thresholds', label: 'Thresholds', icon: <Sliders size={16} /> },
  { id: 'consultation-flow', label: 'Pipeline', icon: <ArrowRight size={16} /> },
  { id: 'ehr', label: 'EHR', icon: <Link2 size={16} /> },
];

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================
export const PracticeConfigurationPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as ConfigTab) || 'locations';

  // Get settings from context (persisted to localStorage)
  const { settings, updateSettings } = useSettings();
  const { practiceGoals, thresholds, clinicianGoals } = settings;

  // Local state for non-persisted data
  const [locations, setLocations] = useState<Location[]>(MOCK_LOCATIONS);
  const [ehrOffices] = useState<RawEHROffice[]>(MOCK_EHR_OFFICES);
  const [ehrClinicians] = useState<RawEHRClinician[]>(MOCK_EHR_CLINICIANS);
  const [locationGroups, setLocationGroups] = useState<LocationGroup[]>(MOCK_LOCATION_GROUPS);
  const [ehr, setEHR] = useState<EHRConnection>(MOCK_EHR);
  const [showClinicianMapping, setShowClinicianMapping] = useState(false);

  // Merge clinician data from master list with saved overrides from context
  const cliniciansWithOverrides: Clinician[] = MOCK_CLINICIANS.map(c => ({
    ...c,
    sessionGoal: clinicianGoals?.[c.id]?.sessionGoal ?? c.sessionGoal,
    clientGoal: clinicianGoals?.[c.id]?.clientGoal ?? c.clientGoal,
    takeRate: clinicianGoals?.[c.id]?.takeRate ?? c.takeRate,
  }));
  const [clinicians, setClinicians] = useState<Clinician[]>(cliniciansWithOverrides);

  // Update practice goals in context (persists to localStorage)
  const handleUpdatePracticeGoals = (newGoals: PracticeGoals) => {
    updateSettings({ practiceGoals: newGoals });
  };

  // Update thresholds in context (persists to localStorage)
  const handleUpdateThresholds = (newThresholds: MetricThresholds) => {
    updateSettings({ thresholds: newThresholds });
  };

  // Update clinician goals in context (persists to localStorage)
  const handleUpdateClinicianGoals = (updatedClinicians: Clinician[]) => {
    setClinicians(updatedClinicians);
    // Extract only the goal overrides to save to context
    const newOverrides: ClinicianGoalOverrides = {};
    updatedClinicians.forEach(c => {
      const master = MOCK_CLINICIANS.find(m => m.id === c.id);
      if (master) {
        // Only save if different from master defaults
        const override: { sessionGoal?: number; clientGoal?: number; takeRate?: number } = {};
        if (c.sessionGoal !== master.sessionGoal) override.sessionGoal = c.sessionGoal;
        if (c.clientGoal !== master.clientGoal) override.clientGoal = c.clientGoal;
        if (c.takeRate !== master.takeRate) override.takeRate = c.takeRate;
        if (Object.keys(override).length > 0) {
          newOverrides[c.id] = override;
        }
      }
    });
    updateSettings({ clinicianGoals: newOverrides });
  };

  const handleTabChange = (tabId: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', tabId);
    setSearchParams(newParams);
  };

  const handleEHRRefresh = () => {
    setEHR(prev => ({
      ...prev,
      lastSync: new Date().toISOString(),
      nextSyncAvailable: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }));
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-80px)] overflow-y-auto bg-gradient-to-b from-stone-100 to-stone-50">
      {/* Page Header - clean, no tabs */}
      <PageHeader
        accent="violet"
        showGridPattern
        title="Configure"
      />

      {/* Content Area */}
      <div className="flex flex-col flex-1 min-h-0 min-w-0 px-6 sm:px-8 lg:pl-[100px] lg:pr-12 py-6 lg:py-8">
        {/* Section Switcher */}
        <div className="flex items-center gap-4 mb-6 overflow-x-auto scrollbar-hide">
          <SegmentedControl<ConfigTab>
            options={CONFIG_TABS}
            value={activeTab}
            onChange={(tabId) => handleTabChange(tabId)}
            size="md"
            ariaLabel="Configuration section"
          />
        </div>

        {/* Tab Content — Locations breaks free, others get SectionContainer */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="flex-1 min-h-0">
            {activeTab === 'members' && showClinicianMapping ? (
              <SectionContainer accent="stone" index={0} isFirst isLast>
                <ClinicianMapping
                  ehrClinicians={ehrClinicians}
                  clinicians={clinicians}
                  onUpdateClinicians={setClinicians}
                  onBack={() => setShowClinicianMapping(false)}
                />
              </SectionContainer>
            ) : activeTab === 'clinician-goals' ? (
              <ClinicianGoalsTab clinicians={clinicians} onUpdate={handleUpdateClinicianGoals} />
            ) : (
              <SectionContainer accent="stone" index={0} isFirst isLast>
                {activeTab === 'locations' && (
                  <LocationsTab ehrOffices={ehrOffices} locationGroups={locationGroups} onUpdateGroups={setLocationGroups} />
                )}
                {activeTab === 'members' && (
                  <TeamMembersTab clinicians={clinicians} onUpdate={setClinicians} onOpenMapping={() => setShowClinicianMapping(true)} />
                )}
                {activeTab === 'goals' && (
                  <PracticeGoalsTab goals={practiceGoals} onUpdate={handleUpdatePracticeGoals} />
                )}
                {activeTab === 'thresholds' && (
                  <ThresholdsTab thresholds={thresholds} onUpdate={handleUpdateThresholds} />
                )}
                {activeTab === 'consultation-flow' && (
                  <ConsultationFlowTab />
                )}
                {activeTab === 'ehr' && (
                  <EHRConnectionTab ehr={ehr} onRefresh={handleEHRRefresh} />
                )}
              </SectionContainer>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PracticeConfigurationPage;
