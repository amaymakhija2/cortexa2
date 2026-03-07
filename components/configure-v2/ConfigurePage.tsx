import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Shield, Target, Link2 } from 'lucide-react';
import { PageHeader, SegmentedControl } from '../design-system';
import type { SegmentedControlOption } from '../design-system/controls/SegmentedControl';
import { useSettings } from '../../context/SettingsContext';
import { FONT, INK, EASE } from './shared';
import type { Clinician, UserAccess } from './shared';
import { MOCK_CLINICIANS } from './shared';
import { CliniciansTab } from './CliniciansTab';
import { UsersAccessTab } from './UsersAccessTab';
import { PracticeTab } from './PracticeTab';
import { ConnectionsTab } from './ConnectionsTab';

// =============================================================================
// CONFIGURE PAGE V2 - The Practice Ledger
// =============================================================================
// A complete rebuild with 4 tabs, inline editing, and refined aesthetics.
// Clinicians | Users & Access | Practice | Connections
// =============================================================================

type ConfigTab = 'clinicians' | 'users' | 'practice' | 'connections';

const CONFIG_TABS: SegmentedControlOption<ConfigTab>[] = [
  { id: 'clinicians', label: 'Clinicians', icon: <Users size={16} /> },
  { id: 'users', label: 'Users & Access', icon: <Shield size={16} /> },
  { id: 'practice', label: 'Practice', icon: <Target size={16} /> },
  { id: 'connections', label: 'Connections', icon: <Link2 size={16} /> },
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const ConfigurePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as ConfigTab) || 'clinicians';

  const { settings, updateSettings } = useSettings();

  // Clinicians state (with goal overrides from context)
  const cliniciansWithOverrides: Clinician[] = MOCK_CLINICIANS.map((c) => ({
    ...c,
    sessionGoal: settings.clinicianGoals?.[c.id]?.sessionGoal ?? c.sessionGoal,
    clientGoal: settings.clinicianGoals?.[c.id]?.clientGoal ?? c.clientGoal,
    takeRate: settings.clinicianGoals?.[c.id]?.takeRate ?? c.takeRate,
  }));
  const [clinicians, setClinicians] = useState<Clinician[]>(cliniciansWithOverrides);

  // Users state
  const [users, setUsers] = useState<UserAccess[]>([]);

  // Handle clinician updates
  const handleUpdateClinicians = (updatedClinicians: Clinician[]) => {
    setClinicians(updatedClinicians);

    // Persist goal overrides to context
    const overrides: Record<string, { sessionGoal?: number; clientGoal?: number; takeRate?: number }> = {};
    updatedClinicians.forEach((c) => {
      const master = MOCK_CLINICIANS.find((m) => m.id === c.id);
      if (master) {
        const override: { sessionGoal?: number; clientGoal?: number; takeRate?: number } = {};
        if (c.sessionGoal !== master.sessionGoal) override.sessionGoal = c.sessionGoal;
        if (c.clientGoal !== master.clientGoal) override.clientGoal = c.clientGoal;
        if (c.takeRate !== master.takeRate) override.takeRate = c.takeRate;
        if (Object.keys(override).length > 0) {
          overrides[c.id] = override;
        }
      }
    });
    updateSettings({ clinicianGoals: overrides });
  };

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', tabId);
    setSearchParams(newParams);
  };

  // Handle EHR refresh
  const handleRefreshEHR = () => {
    // In real app, this would trigger an EHR sync
    console.log('Refreshing EHR connection...');
  };

  return (
    <div
      className="flex-1 flex flex-col h-[calc(100vh-80px)] overflow-y-auto"
      style={{
        background: `linear-gradient(180deg, ${INK.cream} 0%, ${INK.paper} 100%)`,
      }}
    >
      {/* Page Header with integrated navigation */}
      <PageHeader
        accent="violet"
        showGridPattern
        title="Configure"
        size="hero"
        timeSelector={
          <SegmentedControl<ConfigTab>
            options={CONFIG_TABS}
            value={activeTab}
            onChange={handleTabChange}
            size="md"
            ariaLabel="Configuration section"
          />
        }
      />

      {/* Content Area */}
      <div className="flex flex-col flex-1 min-h-0 min-w-0 px-6 sm:px-8 lg:pl-[100px] lg:pr-12 py-6 lg:py-8">
        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: EASE.out }}
            className="flex-1 min-h-0"
          >
            {activeTab === 'clinicians' && (
              <CliniciansTab
                clinicians={clinicians}
                onUpdate={handleUpdateClinicians}
              />
            )}

            {activeTab === 'users' && (
              <UsersAccessTab
                users={users}
                onUpdateUsers={setUsers}
                clinicians={clinicians}
              />
            )}

            {activeTab === 'practice' && (
              <PracticeTab clinicians={clinicians} />
            )}

            {activeTab === 'connections' && (
              <ConnectionsTab
                clinicians={clinicians}
                onUpdateClinicians={handleUpdateClinicians}
                onRefreshEHR={handleRefreshEHR}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ConfigurePage;
