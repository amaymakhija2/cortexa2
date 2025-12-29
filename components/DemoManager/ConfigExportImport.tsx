// =============================================================================
// CONFIG EXPORT/IMPORT
// =============================================================================
// Allows users to export and import demo configurations as JSON files.
// Useful for sharing configurations between team members or saving presets.
// =============================================================================

import React, { useRef, useState } from 'react';
import { Download, Upload, Check, AlertCircle } from 'lucide-react';
import { useDemoContext } from '../../context/DemoContext';
import { validateAndApplyDefaults } from '../../data/generators/config/validators';
import type { DemoConfiguration } from '../../data/generators/types';

// =============================================================================
// TYPES
// =============================================================================

type Status = 'idle' | 'success' | 'error';

interface StatusMessage {
  status: Status;
  message: string;
}

// =============================================================================
// CONFIG EXPORT/IMPORT COMPONENT
// =============================================================================

export const ConfigExportImport: React.FC = () => {
  const { config, setConfig } = useDemoContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);

  // Clear status after 3 seconds
  const showStatus = (status: Status, message: string) => {
    setStatusMessage({ status, message });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // ---------------------------------------------------------------------------
  // Export Configuration
  // ---------------------------------------------------------------------------
  const handleExport = () => {
    try {
      // Create a clean export object
      const exportData = {
        ...config,
        exportedAt: new Date().toISOString(),
        version: '1.0',
      };

      // Create and download the file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cortexa-demo-${config.practice.shortName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showStatus('success', 'Configuration exported');
    } catch (error) {
      console.error('Export failed:', error);
      showStatus('error', 'Export failed');
    }
  };

  // ---------------------------------------------------------------------------
  // Import Configuration
  // ---------------------------------------------------------------------------
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const imported = JSON.parse(content);

        // Validate and apply defaults to handle partial configs
        const validatedConfig = validateAndApplyDefaults(imported);

        // Update the configuration
        setConfig(validatedConfig);
        showStatus('success', `Imported "${validatedConfig.name || 'config'}"`);
      } catch (error) {
        console.error('Import failed:', error);
        showStatus('error', 'Invalid configuration file');
      }
    };

    reader.onerror = () => {
      showStatus('error', 'Failed to read file');
    };

    reader.readAsText(file);

    // Reset the input so the same file can be imported again
    event.target.value = '';
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="flex items-center gap-2">
      {/* Status message */}
      {statusMessage && (
        <div
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium
            ${statusMessage.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}
        >
          {statusMessage.status === 'success' ? (
            <Check size={12} />
          ) : (
            <AlertCircle size={12} />
          )}
          {statusMessage.message}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />

      {/* Import button */}
      <button
        onClick={triggerFileInput}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
                   bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-800
                   text-xs font-medium transition-colors"
        title="Import configuration"
      >
        <Upload size={14} />
        Import
      </button>

      {/* Export button */}
      <button
        onClick={handleExport}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
                   bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-800
                   text-xs font-medium transition-colors"
        title="Export configuration"
      >
        <Download size={14} />
        Export
      </button>
    </div>
  );
};

export default ConfigExportImport;
