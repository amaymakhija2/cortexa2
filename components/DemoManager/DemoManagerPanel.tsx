// =============================================================================
// DEMO MANAGER PANEL
// =============================================================================
// Slide-out panel for managing demo configuration during sales calls.
// Provides quick access to presets and configuration editing.
// =============================================================================

import React, { useState } from 'react';
import { X, Settings, Zap, Users, DollarSign, TrendingUp, RefreshCw, ChevronDown, ChevronRight, Building2 } from 'lucide-react';
import { useDemoContext } from '../../context/DemoContext';
import { PresetSelector } from './PresetSelector';
import { PracticeEditor } from './PracticeEditor';
import { ClinicianEditor } from './ClinicianEditor';
import { FinancialEditor } from './FinancialEditor';
import { PerformanceEditor } from './PerformanceEditor';
import { ConfigExportImport } from './ConfigExportImport';

// =============================================================================
// TYPES
// =============================================================================

type EditorSection = 'presets' | 'practice' | 'clinicians' | 'financial' | 'performance' | null;

interface CollapsibleSectionProps {
  id: EditorSection;
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: (id: EditorSection) => void;
  children: React.ReactNode;
  badge?: string;
}

// =============================================================================
// COLLAPSIBLE SECTION
// =============================================================================

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  id,
  title,
  icon,
  isOpen,
  onToggle,
  children,
  badge,
}) => {
  return (
    <div className="border-b border-stone-200 last:border-b-0">
      <button
        onClick={() => onToggle(isOpen ? null : id)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-stone-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-stone-500">{icon}</span>
          <span className="font-medium text-stone-800">{title}</span>
          {badge && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-stone-100 text-stone-600">
              {badge}
            </span>
          )}
        </div>
        <span className="text-stone-400">
          {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </span>
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-1">
          {children}
        </div>
      )}
    </div>
  );
};

// =============================================================================
// DEMO MANAGER PANEL
// =============================================================================

export const DemoManagerPanel: React.FC = () => {
  const {
    config,
    data,
    isLoading,
    error,
    isPanelOpen,
    closePanel,
    regenerate,
    activePresetId,
  } = useDemoContext();

  const [openSection, setOpenSection] = useState<EditorSection>('presets');

  if (!isPanelOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
        onClick={closePanel}
      />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50
                   transform transition-transform duration-300 ease-out
                   flex flex-col"
        style={{
          boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.12)',
        }}
      >
        {/* Header */}
        <div className="flex-shrink-0 px-4 py-4 border-b border-stone-200 bg-gradient-to-r from-stone-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-stone-800 to-stone-900 flex items-center justify-center shadow-lg">
                <Settings size={20} className="text-white" />
              </div>
              <div>
                <h2 className="font-bold text-stone-900">Demo Manager</h2>
                <p className="text-xs text-stone-500">Configure your demo environment</p>
              </div>
            </div>
            <button
              onClick={closePanel}
              className="p-2 rounded-lg hover:bg-stone-100 transition-colors text-stone-500 hover:text-stone-700"
            >
              <X size={20} />
            </button>
          </div>

          {/* Status bar */}
          <div className="mt-3 flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-400 animate-pulse' : error ? 'bg-red-400' : 'bg-emerald-400'}`} />
              <span className="text-stone-600">
                {isLoading ? 'Generating...' : error ? 'Error' : 'Ready'}
              </span>
            </div>
            {activePresetId && (
              <div className="px-2 py-0.5 rounded bg-stone-100 text-stone-600 text-xs font-medium">
                {activePresetId}
              </div>
            )}
          </div>
        </div>

        {/* Regenerate button */}
        <div className="flex-shrink-0 px-4 py-3 border-b border-stone-100 bg-stone-50/50">
          <button
            onClick={regenerate}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5
                       bg-stone-800 hover:bg-stone-700 disabled:bg-stone-400
                       text-white font-medium rounded-lg
                       transition-all duration-200 shadow-sm hover:shadow-md
                       disabled:cursor-not-allowed"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            {isLoading ? 'Regenerating Data...' : 'Regenerate All Data'}
          </button>
        </div>

        {/* Error display */}
        {error && (
          <div className="flex-shrink-0 mx-4 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Presets Section */}
          <CollapsibleSection
            id="presets"
            title="Quick Presets"
            icon={<Zap size={18} />}
            isOpen={openSection === 'presets'}
            onToggle={setOpenSection}
          >
            <PresetSelector />
          </CollapsibleSection>

          {/* Practice Section */}
          <CollapsibleSection
            id="practice"
            title="Practice Identity"
            icon={<Building2 size={18} />}
            isOpen={openSection === 'practice'}
            onToggle={setOpenSection}
            badge={config.practice.name}
          >
            <PracticeEditor />
          </CollapsibleSection>

          {/* Clinicians Section */}
          <CollapsibleSection
            id="clinicians"
            title="Clinicians"
            icon={<Users size={18} />}
            isOpen={openSection === 'clinicians'}
            onToggle={setOpenSection}
            badge={`${config.clinicians.length}`}
          >
            <ClinicianEditor />
          </CollapsibleSection>

          {/* Financial Section */}
          <CollapsibleSection
            id="financial"
            title="Financial Settings"
            icon={<DollarSign size={18} />}
            isOpen={openSection === 'financial'}
            onToggle={setOpenSection}
            badge={config.financial.practiceSize}
          >
            <FinancialEditor />
          </CollapsibleSection>

          {/* Performance Section */}
          <CollapsibleSection
            id="performance"
            title="Performance Story"
            icon={<TrendingUp size={18} />}
            isOpen={openSection === 'performance'}
            onToggle={setOpenSection}
            badge={config.performance.narrative}
          >
            <PerformanceEditor />
          </CollapsibleSection>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-4 py-3 border-t border-stone-200 bg-stone-50">
          <div className="flex items-center justify-between">
            <div className="text-xs text-stone-500">
              <span>Press <kbd className="px-1.5 py-0.5 bg-stone-200 rounded text-stone-700 font-mono">Ctrl+Shift+D</kbd> to toggle</span>
              {data && (
                <span className="ml-3">Generated: {new Date(data.generatedAt).toLocaleTimeString()}</span>
              )}
            </div>
            <ConfigExportImport />
          </div>
        </div>
      </div>
    </>
  );
};

export default DemoManagerPanel;
