import React, { useState } from 'react';

// =============================================================================
// ACTION BUTTON COMPONENT
// =============================================================================
// A premium CTA button with dark gradient styling, elevated shadows,
// and refined micro-interactions. Perfect for "View Report" style actions.
// =============================================================================

export type ActionButtonVariant = 'dark' | 'outline' | 'subtle';

export interface ActionButtonProps {
  /** Button label text */
  label: string;
  /** Click handler */
  onClick?: () => void;
  /** Icon to display (rendered after label by default) */
  icon?: React.ReactNode;
  /** Icon position */
  iconPosition?: 'left' | 'right';
  /** Visual variant */
  variant?: ActionButtonVariant;
  /** Disable the button */
  disabled?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * ActionButton - Premium CTA button for chart card actions
 *
 * @example
 * <ActionButton
 *   label="Sessions Report"
 *   onClick={() => navigate('/reports')}
 *   icon={<ArrowRight size={16} />}
 * />
 *
 * @example
 * <ActionButton label="Export" variant="outline" icon={<Download size={16} />} />
 */
export const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  onClick,
  icon,
  iconPosition = 'right',
  variant = 'dark',
  disabled = false,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Variant-specific styles
  const variantStyles = {
    dark: {
      base: {
        background: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #1c1917 100%)',
        color: '#fafaf9',
        boxShadow: '0 8px 20px -6px rgba(28, 25, 23, 0.4), 0 4px 8px -4px rgba(28, 25, 23, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
      },
      hover: {
        boxShadow: '0 12px 28px -6px rgba(28, 25, 23, 0.5), 0 6px 12px -4px rgba(28, 25, 23, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.15)',
      },
    },
    outline: {
      base: {
        background: 'transparent',
        color: '#44403c',
        boxShadow: 'inset 0 0 0 2px #d6d3d1',
      },
      hover: {
        background: 'rgba(245, 245, 244, 0.8)',
        boxShadow: 'inset 0 0 0 2px #a8a29e, 0 4px 12px -4px rgba(0, 0, 0, 0.1)',
      },
    },
    subtle: {
      base: {
        background: 'linear-gradient(135deg, #f5f5f4 0%, #e7e5e4 100%)',
        color: '#44403c',
        boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
      },
      hover: {
        background: 'linear-gradient(135deg, #e7e5e4 0%, #d6d3d1 100%)',
        boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
      },
    },
  };

  const currentVariant = variantStyles[variant];
  const currentStyle = isHovered ? { ...currentVariant.base, ...currentVariant.hover } : currentVariant.base;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        group relative px-5 py-2.5 rounded-full
        text-sm font-bold tracking-wide
        transition-all duration-300 ease-out
        transform hover:scale-[1.03] active:scale-[0.98]
        focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${className}
      `}
      style={{
        ...currentStyle,
        letterSpacing: '0.02em',
      }}
    >
      {/* Content wrapper */}
      <span className="relative z-10 flex items-center gap-2">
        {/* Left icon */}
        {icon && iconPosition === 'left' && (
          <span
            className={`
              flex-shrink-0 transition-transform duration-300
              ${variant === 'dark' ? 'group-hover:-translate-x-0.5' : ''}
            `}
          >
            {icon}
          </span>
        )}

        {/* Label */}
        <span>{label}</span>

        {/* Right icon */}
        {icon && iconPosition === 'right' && (
          <span
            className={`
              flex-shrink-0 transition-transform duration-300
              ${variant === 'dark' ? 'group-hover:translate-x-1' : ''}
            `}
          >
            {icon}
          </span>
        )}
      </span>

      {/* Shine overlay for dark variant */}
      {variant === 'dark' && (
        <div
          className="absolute inset-0 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 40%, transparent 100%)',
          }}
        />
      )}
    </button>
  );
};

export default ActionButton;
