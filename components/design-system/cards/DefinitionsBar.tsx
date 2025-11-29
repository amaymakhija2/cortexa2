import React from 'react';
import { Info } from 'lucide-react';

// =============================================================================
// DEFINITIONS BAR COMPONENT
// =============================================================================
// A subtle horizontal bar that displays key term definitions.
// Used in the Retention tab to clarify what "Churned" and "Retained" mean.
// =============================================================================

export interface Definition {
  /** Term being defined */
  term: string;
  /** Definition text */
  definition: string;
}

export interface DefinitionsBarProps {
  /** Definitions to display */
  definitions: Definition[];
  /** Additional className */
  className?: string;
}

/**
 * DefinitionsBar - Compact definitions display
 *
 * @example
 * <DefinitionsBar
 *   definitions={[
 *     { term: 'Churned', definition: 'No appointment in 30+ days and none scheduled' },
 *     { term: 'Retained', definition: 'Active or scheduled within 30 days' }
 *   ]}
 * />
 */
export const DefinitionsBar: React.FC<DefinitionsBarProps> = ({
  definitions,
  className = '',
}) => {
  return (
    <div
      className={`rounded-xl px-5 py-3.5 flex items-center gap-6 ${className}`}
      style={{
        background: 'linear-gradient(135deg, #f5f5f4 0%, #fafaf9 100%)',
        boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div className="flex items-center gap-2 text-stone-400">
        <Info size={16} />
        <span className="text-sm font-medium">Definitions</span>
      </div>

      <div className="flex items-center gap-6 flex-wrap">
        {definitions.map((def, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-stone-700">{def.term}:</span>
            <span className="text-stone-500">{def.definition}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DefinitionsBar;
