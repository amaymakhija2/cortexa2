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
      className={`rounded-2xl px-6 py-4 flex items-center gap-8 ${className}`}
      style={{
        background: 'linear-gradient(135deg, #f5f5f4 0%, #fafaf9 100%)',
        boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div className="flex items-center gap-2.5 text-stone-400 flex-shrink-0">
        <Info size={18} />
        <span className="text-sm font-semibold uppercase tracking-wide">Definitions</span>
      </div>

      <div className="flex items-center gap-8 flex-wrap">
        {definitions.map((def, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="font-bold text-stone-700 text-base">{def.term}:</span>
            <span className="text-stone-500 text-base">{def.definition}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DefinitionsBar;
