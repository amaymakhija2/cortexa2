import React from 'react';

// =============================================================================
// TOGGLE BUTTON COMPONENT
// =============================================================================
// A refined pill-shaped toggle for switching between chart views.
// Features gradient backgrounds, status indicator dot, and smooth transitions.
// =============================================================================

export interface ToggleButtonProps {
  /** Button label text */
  label: string;
  /** Whether the toggle is currently active */
  active: boolean;
  /** Callback when toggle is clicked */
  onToggle: () => void;
  /** Optional icon (React node, rendered before label) */
  icon?: React.ReactNode;
  /** Hide the toggle (useful for conditional visibility) */
  hidden?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * ToggleButton - Premium toggle for switching chart views
 *
 * @example
 * <ToggleButton
 *   label="By Clinician"
 *   active={showBreakdown}
 *   onToggle={() => setShowBreakdown(!showBreakdown)}
 *   icon={<Users size={16} />}
 * />
 */
export const ToggleButton: React.FC<ToggleButtonProps> = ({
  label,
  active,
  onToggle,
  icon,
  hidden = false,
  className = '',
}) => {
  if (hidden) return null;

  return (
    <button
      onClick={onToggle}
      className={`
        relative flex items-center gap-2.5 px-4 py-2.5 rounded-full
        transition-all duration-300 ease-out
        transform hover:scale-[1.02] active:scale-[0.98]
        focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2
        ${className}
      `}
      style={{
        background: active
          ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)'
          : 'linear-gradient(135deg, #fafaf9 0%, #f5f5f4 50%, #e7e5e4 100%)',
        boxShadow: active
          ? '0 4px 14px -2px rgba(30, 27, 75, 0.45), 0 2px 6px -2px rgba(30, 27, 75, 0.25), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.1)'
          : '0 2px 8px -2px rgba(0,0,0,0.12), 0 1px 3px -1px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.05)',
      }}
    >
      {/* Icon */}
      {icon && (
        <span
          className={`
            flex-shrink-0 transition-colors duration-300
            ${active ? 'text-indigo-300' : 'text-stone-500'}
          `}
        >
          {icon}
        </span>
      )}

      {/* Label */}
      <span
        className={`
          text-sm font-semibold tracking-wide transition-colors duration-300
          ${active ? 'text-white' : 'text-stone-600'}
        `}
      >
        {label}
      </span>

      {/* Status Indicator Dot */}
      <div
        className={`
          w-2 h-2 rounded-full transition-all duration-300
          ${active
            ? 'bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.5)]'
            : 'bg-stone-400'
          }
        `}
      />

      {/* Subtle shine overlay on active */}
      {active && (
        <div
          className="absolute inset-0 rounded-full pointer-events-none opacity-30"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, transparent 100%)',
          }}
        />
      )}
    </button>
  );
};

export default ToggleButton;
