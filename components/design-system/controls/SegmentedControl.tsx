import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';

// =============================================================================
// SEGMENTED CONTROL COMPONENT
// =============================================================================
// A premium segmented control for mutually exclusive option selection.
// Features a sliding indicator, refined gradients, and smooth transitions
// that match the design system's elevated aesthetic.
// =============================================================================

export interface SegmentedControlOption<T extends string = string> {
  /** Unique identifier for the option */
  id: T;
  /** Display label */
  label: string;
  /** Optional icon (React node, rendered before label) */
  icon?: React.ReactNode;
  /** Whether this option is disabled */
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string = string> {
  /** Available options */
  options: SegmentedControlOption<T>[];
  /** Currently selected option id */
  value: T;
  /** Callback when selection changes */
  onChange: (value: T) => void;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Visual variant */
  variant?: 'default' | 'subtle';
  /** Additional className for the container */
  className?: string;
  /** Accessible label for the control group */
  ariaLabel?: string;
}

/**
 * SegmentedControl - Premium segmented button group for mutually exclusive selection
 *
 * @example Basic usage
 * ```tsx
 * <SegmentedControl
 *   options={[
 *     { id: 'location', label: 'Location' },
 *     { id: 'supervisor', label: 'Supervisor' },
 *     { id: 'license', label: 'License Type' },
 *   ]}
 *   value={selected}
 *   onChange={setSelected}
 * />
 * ```
 *
 * @example With icons
 * ```tsx
 * <SegmentedControl
 *   options={[
 *     { id: 'grid', label: 'Grid', icon: <Grid size={16} /> },
 *     { id: 'list', label: 'List', icon: <List size={16} /> },
 *   ]}
 *   value={viewMode}
 *   onChange={setViewMode}
 *   size="sm"
 * />
 * ```
 */
export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  size = 'md',
  variant = 'default',
  className = '',
  ariaLabel = 'Selection options',
}: SegmentedControlProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({
    opacity: 0,
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Size configurations
  const sizeConfig = {
    sm: {
      padding: 4,
      button: 'px-3 py-1.5 text-sm gap-1.5',
      radius: 'rounded-lg',
    },
    md: {
      padding: 6,
      button: 'px-4 py-2.5 text-sm gap-2',
      radius: 'rounded-xl',
    },
    lg: {
      padding: 8,
      button: 'px-5 py-3 text-base gap-2.5',
      radius: 'rounded-xl',
    },
  };

  const config = sizeConfig[size];

  // Update sliding indicator position
  useLayoutEffect(() => {
    const updateIndicator = () => {
      const selectedButton = optionRefs.current.get(value);
      const container = containerRef.current;

      if (selectedButton && container) {
        const containerRect = container.getBoundingClientRect();
        const buttonRect = selectedButton.getBoundingClientRect();

        const left = buttonRect.left - containerRect.left;
        const top = buttonRect.top - containerRect.top;

        setIndicatorStyle({
          width: buttonRect.width,
          height: buttonRect.height,
          left,
          top,
          opacity: 1,
        });

        // Enable transitions after initial position is set
        if (!isInitialized) {
          requestAnimationFrame(() => setIsInitialized(true));
        }
      }
    };

    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [value, options, size, isInitialized]);

  // Variant styles
  const variantStyles = {
    default: {
      container: {
        background: 'linear-gradient(145deg, #f5f5f4 0%, #e7e5e4 100%)',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), inset 0 1px 2px rgba(0,0,0,0.04)',
      },
      indicator: {
        background: 'linear-gradient(145deg, #ffffff 0%, #fafaf9 100%)',
        boxShadow: '0 2px 8px -2px rgba(0,0,0,0.15), 0 1px 3px -1px rgba(0,0,0,0.1)',
      },
    },
    subtle: {
      container: {
        background: 'linear-gradient(145deg, #fafaf9 0%, #f5f5f4 100%)',
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)',
      },
      indicator: {
        background: 'linear-gradient(145deg, #ffffff 0%, #fafaf9 100%)',
        boxShadow: '0 1px 4px -1px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.06)',
      },
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-label={ariaLabel}
      className={`
        relative inline-flex items-center rounded-2xl overflow-hidden
        ${className}
      `}
      style={{
        ...styles.container,
        padding: config.padding,
        gap: config.padding / 2,
      }}
    >
      {/* Sliding indicator */}
      <div
        className={`
          absolute pointer-events-none
          ${config.radius}
          ${isInitialized ? 'transition-all duration-300 ease-out' : ''}
        `}
        style={{
          ...styles.indicator,
          ...indicatorStyle,
        }}
      />

      {/* Options */}
      {options.map((option) => {
        const isSelected = value === option.id;
        const isDisabled = option.disabled;

        return (
          <button
            key={option.id}
            ref={(el) => {
              if (el) optionRefs.current.set(option.id, el);
            }}
            role="radio"
            aria-checked={isSelected}
            aria-disabled={isDisabled}
            disabled={isDisabled}
            onClick={() => !isDisabled && onChange(option.id)}
            className={`
              relative z-10 flex items-center justify-center font-semibold
              transition-colors duration-200 ease-out
              focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-1
              ${config.button}
              ${config.radius}
              ${isDisabled
                ? 'cursor-not-allowed opacity-40'
                : 'cursor-pointer'
              }
              ${isSelected
                ? 'text-stone-900'
                : isDisabled
                  ? 'text-stone-400'
                  : 'text-stone-500 hover:text-stone-700'
              }
            `}
          >
            {/* Icon */}
            {option.icon && (
              <span
                className={`
                  flex-shrink-0 transition-colors duration-200
                  ${isSelected ? 'text-stone-700' : 'text-stone-400'}
                `}
              >
                {option.icon}
              </span>
            )}

            {/* Label */}
            <span className="whitespace-nowrap">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedControl;
