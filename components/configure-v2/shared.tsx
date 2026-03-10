import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

// =============================================================================
// THE ACCOUNTANT'S LEDGER - Design System
// =============================================================================
// Editorial precision meets analog warmth. Every interaction feels like writing
// with a fountain pen - smooth, intentional, permanent. The serif typography
// gives gravitas. The gold accents whisper luxury without shouting.
// =============================================================================

// =============================================================================
// TYPOGRAPHY - The Soul of the Ledger
// =============================================================================
// Tiempos Headline: Distinguished serif for names and titles
// Suisse Intl: Clean Swiss precision for UI and labels
// JetBrains Mono: Technical clarity for numbers (optional enhancement)

export const FONT = {
  serif: "'Tiempos Headline', 'Freight Display', Georgia, serif",
  sans: "'Suisse Intl', 'Söhne', -apple-system, sans-serif",
  mono: "'JetBrains Mono', 'SF Mono', 'Consolas', monospace",
} as const;

// =============================================================================
// COLOR PALETTE - Ink, Paper, and Gold Leaf
// =============================================================================
// Not generic grays - warm, intentional tones that feel like a real ledger

export const INK = {
  // Primary ink tones - warm blacks and charcoals
  black: '#1a1815',      // Deep ink black, warmer than pure black
  dark: '#2d2a26',       // Dark charcoal for headers
  body: '#3d3a35',       // Body text - readable, warm
  muted: '#5c5850',      // Secondary text
  faded: '#8a8579',      // Tertiary, hints
  ghost: '#b5b0a6',      // Disabled states

  // Paper tones - subtle warmth
  rule: '#e8e5df',       // Divider lines (like ruled paper)
  cream: '#f7f5f2',      // Subtle backgrounds
  paper: '#fdfcfa',      // Pure paper white

  // The gold leaf - luxury accent
  gold: '#c9a227',       // Primary gold (focus, important)
  goldMuted: '#d4b85c',  // Lighter gold
  goldGlow: 'rgba(201, 162, 39, 0.15)', // Gold halo

  // Banker's ink - status colors
  emerald: '#047857',    // Success, confirmed (like green ink)
  emeraldLight: '#d1fae5',
  amber: '#b45309',      // Warning, needs attention
  amberLight: '#fef3c7',
  rose: '#be123c',       // Error, critical
  roseLight: '#ffe4e6',

  // Accent (for header glow)
  violet: '#7c3aed',
  violetGlow: 'rgba(124, 58, 237, 0.12)',
} as const;

// =============================================================================
// SHADOWS - Paper Lift Effects
// =============================================================================
// Shadows that make elements feel like they're lifting off the page

export const SHADOW = {
  // Subtle lift for hover states
  lift: `
    0 1px 2px rgba(26, 24, 21, 0.04),
    0 4px 8px rgba(26, 24, 21, 0.04),
    0 8px 16px rgba(26, 24, 21, 0.02)
  `,
  // More dramatic lift for focus
  raised: `
    0 2px 4px rgba(26, 24, 21, 0.06),
    0 8px 16px rgba(26, 24, 21, 0.06),
    0 16px 32px rgba(26, 24, 21, 0.04)
  `,
  // Gold glow for active editing
  goldFocus: `
    0 0 0 3px ${INK.goldGlow},
    0 2px 8px rgba(201, 162, 39, 0.2)
  `,
  // Emerald confirmation glow
  confirm: `
    0 0 0 2px rgba(4, 120, 87, 0.2),
    0 0 12px rgba(4, 120, 87, 0.15)
  `,
} as const;

// =============================================================================
// ANIMATION CURVES - Ink Flow
// =============================================================================
// Movements that feel organic, like ink spreading on paper

export const EASE = {
  // Standard easing - smooth deceleration
  out: [0.16, 1, 0.3, 1],
  // Bouncy entrance
  spring: { type: 'spring', stiffness: 400, damping: 30 },
  // Gentle settle
  settle: { type: 'spring', stiffness: 300, damping: 25 },
} as const;

// =============================================================================
// REVENUE ASSUMPTIONS - Shared calculation constants
// =============================================================================
// These are the defaults used to derive revenue estimates from session goals.
// In production, these would come from practice settings/historical data.

export const REVENUE_DEFAULTS = {
  avgRatePerSession: 185,    // $185 average per session
  workingWeeksPerYear: 48,   // 48 working weeks (accounting for PTO)
} as const;

// Revenue calculation helper
export function estimateAnnualRevenue(
  sessionsPerWeek: number,
  avgRate: number = REVENUE_DEFAULTS.avgRatePerSession,
  weeksPerYear: number = REVENUE_DEFAULTS.workingWeeksPerYear
): number {
  return sessionsPerWeek * weeksPerYear * avgRate;
}

// Format revenue for display (compact K/M notation)
export function formatRevenue(amount: number, compact: boolean = true): string {
  if (compact) {
    if (amount >= 1_000_000) {
      return `$${(amount / 1_000_000).toFixed(1)}M`;
    }
    if (amount >= 1_000) {
      return `$${Math.round(amount / 1_000)}K`;
    }
    return `$${Math.round(amount)}`;
  }
  return `$${amount.toLocaleString()}`;
}

// =============================================================================
// RE-EXPORTS from original shared for compatibility
// =============================================================================

// Import types we need to use in this file
import type {
  LicenseType as LicenseTypeImport,
  ClinicianRole as ClinicianRoleImport,
  Clinician as ClinicianImport,
  Location as LocationImport,
  EHRConnection as EHRConnectionImport,
  RawEHRClinician as RawEHRClinicianImport,
} from '../configure/shared';

// Re-export for external use
export type LicenseType = LicenseTypeImport;
export type ClinicianRole = ClinicianRoleImport;
export type Clinician = ClinicianImport;
export type Location = LocationImport;
export type EHRConnection = EHRConnectionImport;
export type RawEHRClinician = RawEHRClinicianImport;

export {
  LICENSE_TYPE_NAMES,
  LICENSES_REQUIRING_SUPERVISION,
  ROLE_OPTIONS,
  canSupervise,
  seesClients,
  MOCK_CLINICIANS,
  MOCK_EHR,
  MOCK_EHR_CLINICIANS,
  MOCK_EHR_OFFICES,
  MOCK_LOCATION_GROUPS,
  MOCK_LOCATIONS,
  StatusPill,
  ConfigCard,
} from '../configure/shared';

// New types for Users & Access
export type UserType = 'clinician' | 'staff';
export type AccessScope = 'fullPractice' | 'theirTeam' | 'custom' | 'selfOnly';
export type UserStatus = 'active' | 'pending';

export interface UserAccess {
  id: string;
  name: string;
  email: string;
  type: UserType;                    // Clinician or Staff
  scope: AccessScope;                // Who they can see
  revenueAccess: boolean;            // Can see $ amounts
  clientDetailsAccess: boolean;      // Can see client names/PHI
  clinicianId?: string;              // Links to Clinician record (only for type='clinician')
  customClinicianIds?: string[];     // For scope='custom' - which clinicians they can see
  customGroupIds?: string[];         // For scope='custom' - which supervisor groups/teams they can see
  staffRole?: string;                // For staff: "Office Manager", "Biller", etc.
  status: UserStatus;
  lastActive?: string;               // ISO date string or null for pending users
  invitedAt?: string;                // ISO date string for pending users
  joinedAt?: string;                 // ISO date string for when user joined
  isOwner?: boolean;                 // Special flag for practice owner
}

// Helper to derive supervisees from clinician relationships
export function deriveSuperviseesForUser(
  user: UserAccess,
  clinicians: ClinicianImport[]
): ClinicianImport[] {
  // Only clinician-type users with a linked clinician can have supervisees
  if (!user.clinicianId) return [];

  // Find all clinicians where this user's linked clinician is their supervisor
  return clinicians.filter(c => c.supervisorId === user.clinicianId && c.isActive);
}

// Service mapping types
export type ServiceBucket = 'sessions' | 'cancellations' | 'other' | 'excluded';
export type ServiceCategory = 'session' | 'intake' | 'supervision' | 'admin' | 'group' | 'other';

export interface ServiceMapping {
  id: string;
  name: string;
  code: string;
  bucket: ServiceBucket;
  category?: ServiceCategory;
}

// =============================================================================
// INLINE INPUT - The Fountain Pen
// =============================================================================
// Editing should feel like writing - fluid, precise, permanent.
// The gold focus ring is like the glint of a pen nib.

interface InlineInputProps {
  value: string | number;
  onChange: (value: string) => void;
  onSave?: () => void;
  type?: 'text' | 'number';
  suffix?: string;
  prefix?: string;
  placeholder?: string;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  numeric?: boolean; // Use mono font for numbers
}

export const InlineInput: React.FC<InlineInputProps> = ({
  value,
  onChange,
  onSave,
  type = 'text',
  suffix,
  prefix,
  placeholder,
  width = 80,
  align = 'center',
  numeric = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleBlur = () => {
    setIsFocused(false);
    if (onSave) {
      onSave();
      // Show confirmation
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 600);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
    if (e.key === 'Escape') {
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative inline-flex items-center group">
      {prefix && (
        <span
          className="mr-1 transition-colors duration-200"
          style={{
            fontFamily: FONT.sans,
            fontSize: 13,
            color: isFocused ? INK.gold : INK.ghost,
          }}
        >
          {prefix}
        </span>
      )}

      <motion.div
        className="relative"
        animate={{
          y: isFocused ? -1 : 0,
        }}
        transition={{ duration: 0.15 }}
      >
        <input
          ref={inputRef}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="transition-all duration-200 outline-none"
          style={{
            fontFamily: numeric ? FONT.mono : FONT.sans,
            fontSize: 15,
            fontWeight: 500,
            color: INK.black,
            width,
            textAlign: align,
            padding: '6px 10px',
            paddingRight: suffix ? 32 : 10,
            borderRadius: 8,
            border: `1.5px solid ${isFocused ? INK.gold : 'transparent'}`,
            backgroundColor: isFocused ? INK.paper : 'transparent',
            boxShadow: isFocused ? SHADOW.goldFocus : 'none',
          }}
        />

        {/* Hover underline - like ruled paper */}
        <motion.div
          className="absolute bottom-1 left-2 right-2 h-px"
          style={{ backgroundColor: INK.rule }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isFocused ? 0 : 1 }}
          whileHover={{ scaleX: 1, backgroundColor: INK.gold }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>

      {suffix && (
        <span
          className="absolute right-2 pointer-events-none transition-colors duration-200"
          style={{
            fontFamily: FONT.sans,
            fontSize: 12,
            fontWeight: 500,
            color: isFocused ? INK.muted : INK.ghost,
          }}
        >
          {suffix}
        </span>
      )}

      {/* Save confirmation - emerald ink stamp */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, x: 8 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
            className="absolute -right-6 w-5 h-5 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: INK.emerald,
              boxShadow: SHADOW.confirm,
            }}
          >
            <Check size={11} color="white" strokeWidth={3} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// =============================================================================
// INLINE SELECT - The Dropdown Ledger
// =============================================================================
// Dropdowns that feel integrated, not bolted on.

interface InlineSelectProps<T extends string> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  width?: number | string;
  variant?: 'default' | 'chip';
  chipColor?: 'emerald' | 'amber' | 'gold' | 'stone';
}

export function InlineSelect<T extends string>({
  value,
  options,
  onChange,
  width = 120,
  variant = 'default',
  chipColor = 'stone',
}: InlineSelectProps<T>) {
  const [isFocused, setIsFocused] = useState(false);

  const chipStyles: Record<string, { bg: string; text: string; border: string }> = {
    emerald: { bg: INK.emeraldLight, text: INK.emerald, border: INK.emerald + '40' },
    amber: { bg: INK.amberLight, text: INK.amber, border: INK.amber + '40' },
    gold: { bg: INK.goldGlow, text: INK.gold, border: INK.gold + '40' },
    stone: { bg: INK.cream, text: INK.muted, border: INK.rule },
  };

  const chip = chipStyles[chipColor];

  // Custom dropdown arrow SVG
  const arrowSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23${INK.faded.slice(1)}' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`;

  return (
    <motion.select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      animate={{
        y: isFocused ? -1 : 0,
      }}
      transition={{ duration: 0.15 }}
      className="appearance-none cursor-pointer outline-none transition-all duration-200"
      style={{
        fontFamily: FONT.sans,
        fontSize: variant === 'chip' ? 12 : 14,
        fontWeight: variant === 'chip' ? 600 : 500,
        color: variant === 'chip' ? chip.text : INK.body,
        width,
        padding: variant === 'chip' ? '5px 24px 5px 10px' : '6px 28px 6px 10px',
        borderRadius: variant === 'chip' ? 20 : 8,
        border: `1.5px solid ${isFocused ? INK.gold : variant === 'chip' ? chip.border : 'transparent'}`,
        backgroundColor: variant === 'chip' ? chip.bg : isFocused ? INK.paper : 'transparent',
        boxShadow: isFocused ? SHADOW.goldFocus : 'none',
        backgroundImage: arrowSvg,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 8px center',
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </motion.select>
  );
}

// =============================================================================
// TOGGLE PILL - The Status Stamp
// =============================================================================
// Like a rubber stamp: clear, decisive, final.

interface TogglePillProps {
  active: boolean;
  onChange: (active: boolean) => void;
  activeLabel?: string;
  inactiveLabel?: string;
}

export const TogglePill: React.FC<TogglePillProps> = ({
  active,
  onChange,
  activeLabel = 'Active',
  inactiveLabel = 'Inactive',
}) => {
  return (
    <motion.button
      onClick={() => onChange(!active)}
      className="relative overflow-hidden"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        fontFamily: FONT.sans,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.02em',
        padding: '5px 12px 5px 22px',
        borderRadius: 20,
        border: 'none',
        cursor: 'pointer',
        backgroundColor: active ? INK.emeraldLight : INK.cream,
        color: active ? INK.emerald : INK.faded,
        transition: 'background-color 0.2s, color 0.2s',
      }}
    >
      {/* Status dot */}
      <motion.span
        className="absolute left-2.5 top-1/2 w-2 h-2 rounded-full"
        style={{
          backgroundColor: active ? INK.emerald : INK.ghost,
        }}
        initial={false}
        animate={{
          scale: active ? [1, 1.3, 1] : 1,
          y: '-50%',
        }}
        transition={{ duration: 0.3 }}
      />

      {active ? activeLabel : inactiveLabel}
    </motion.button>
  );
};

// =============================================================================
// SECTION HEADER - Chapter Title
// =============================================================================
// Like a chapter heading in a beautiful book.

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, actions }) => (
  <motion.div
    className="flex items-start justify-between mb-8"
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: EASE.out }}
  >
    <div>
      <h2
        style={{
          fontFamily: FONT.serif,
          fontSize: 28,
          fontWeight: 400,
          color: INK.black,
          letterSpacing: '-0.01em',
          lineHeight: 1.2,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className="mt-2"
          style={{
            fontFamily: FONT.sans,
            fontSize: 14,
            color: INK.muted,
            lineHeight: 1.5,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
    {actions && (
      <motion.div
        className="flex items-center gap-3"
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: EASE.out }}
      >
        {actions}
      </motion.div>
    )}
  </motion.div>
);

// =============================================================================
// SECTION DIVIDER - Ruled Line
// =============================================================================
// Like the ruled lines in a ledger - subtle but essential.

interface SectionDividerProps {
  className?: string;
  ornament?: boolean; // Add a small decorative element
}

export const SectionDivider: React.FC<SectionDividerProps> = ({
  className = '',
  ornament = false
}) => (
  <div className={`relative my-10 ${className}`}>
    <div
      className="h-px w-full"
      style={{ backgroundColor: INK.rule }}
    />
    {ornament && (
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rotate-45"
        style={{ backgroundColor: INK.cream, border: `1px solid ${INK.rule}` }}
      />
    )}
  </div>
);

// =============================================================================
// LEDGER CARD - The Page
// =============================================================================
// A card that feels like a page torn from a fine ledger.

interface LedgerCardProps {
  children: React.ReactNode;
  className?: string;
  accent?: 'gold' | 'emerald' | 'amber' | 'violet' | 'none';
  hover?: boolean;
}

export const LedgerCard: React.FC<LedgerCardProps> = ({
  children,
  className = '',
  accent = 'none',
  hover = false,
}) => {
  const accentColors: Record<string, string> = {
    gold: `linear-gradient(90deg, ${INK.gold} 0%, ${INK.goldMuted} 100%)`,
    emerald: INK.emerald,
    amber: INK.amber,
    violet: INK.violet,
    none: 'transparent',
  };

  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE.out }}
      whileHover={hover ? { y: -2, boxShadow: SHADOW.raised } : undefined}
      style={{
        backgroundColor: INK.paper,
        borderRadius: 16,
        boxShadow: `
          0 1px 2px rgba(26, 24, 21, 0.03),
          0 4px 12px rgba(26, 24, 21, 0.04),
          0 0 0 1px rgba(26, 24, 21, 0.04)
        `,
      }}
    >
      {/* Accent ribbon at top */}
      {accent !== 'none' && (
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ background: accentColors[accent] }}
        />
      )}
      {children}
    </motion.div>
  );
};

// =============================================================================
// PRIMARY BUTTON - The Seal
// =============================================================================
// Like pressing a seal into hot wax - decisive and final.

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: React.ReactNode;
  variant?: 'emerald' | 'gold' | 'stone';
  disabled?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  onClick,
  icon,
  variant = 'emerald',
  disabled = false,
}) => {
  const variants = {
    emerald: {
      bg: `linear-gradient(135deg, ${INK.emerald} 0%, #065f46 100%)`,
      shadow: '0 4px 12px rgba(4, 120, 87, 0.3)',
      hoverShadow: '0 6px 20px rgba(4, 120, 87, 0.4)',
    },
    gold: {
      bg: `linear-gradient(135deg, ${INK.gold} 0%, #a78419 100%)`,
      shadow: '0 4px 12px rgba(201, 162, 39, 0.3)',
      hoverShadow: '0 6px 20px rgba(201, 162, 39, 0.4)',
    },
    stone: {
      bg: INK.cream,
      shadow: '0 2px 8px rgba(26, 24, 21, 0.08)',
      hoverShadow: '0 4px 12px rgba(26, 24, 21, 0.12)',
    },
  };

  const v = variants[variant];

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -1 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className="inline-flex items-center gap-2 transition-shadow duration-200"
      style={{
        fontFamily: FONT.sans,
        fontSize: 14,
        fontWeight: 600,
        color: variant === 'stone' ? INK.body : 'white',
        padding: '10px 20px',
        borderRadius: 12,
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: v.bg,
        boxShadow: v.shadow,
        opacity: disabled ? 0.5 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.boxShadow = v.hoverShadow;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = v.shadow;
      }}
    >
      {icon}
      {children}
    </motion.button>
  );
};

// =============================================================================
// CHART TOOLTIP - Refined Data Presentation
// =============================================================================
// A sophisticated tooltip for bar charts that presents data with clarity.
// Warm paper background with editorial typography and generous spacing.
// Positioned above bars with smart overflow handling.

export interface ChartTooltipValue {
  label: string;
  value: string | number;
  color: string;
  isPrimary?: boolean;
}

export interface ChartTooltipProps {
  title: string;
  values: ChartTooltipValue[];
  variance?: {
    value: number;
    percent: number;
  };
  hint?: string;
  position?: 'above' | 'below';
}

export const ChartTooltip: React.FC<ChartTooltipProps> = ({
  title,
  values,
  variance,
  hint,
  position = 'above',
}) => {
  const isPositive = variance ? variance.value >= 0 : false;
  const arrowPosition = position === 'above' ? 'bottom' : 'top';
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  // Calculate fixed position based on parent element (bar area)
  // Find the actual bars to position tooltip just above them
  useEffect(() => {
    if (tooltipRef.current) {
      const parent = tooltipRef.current.parentElement;
      if (parent) {
        const rect = parent.getBoundingClientRect();
        const tooltipHeight = tooltipRef.current.offsetHeight;

        // Find the tallest bar in this column to position above it
        const bars = parent.querySelectorAll('[data-bar]');
        let highestBarTop = rect.bottom; // Start at bottom
        bars.forEach(bar => {
          const barRect = bar.getBoundingClientRect();
          if (barRect.top < highestBarTop) {
            highestBarTop = barRect.top;
          }
        });

        // If no bars found, use a reasonable offset from center
        if (bars.length === 0) {
          highestBarTop = rect.top + rect.height * 0.3;
        }

        setCoords({
          top: position === 'above' ? highestBarTop - tooltipHeight - 10 : rect.bottom + 10,
          left: rect.left + rect.width / 2,
        });
      }
    }
  }, [position]);

  return (
    <motion.div
      ref={tooltipRef}
      initial={{ opacity: 0, y: position === 'above' ? 6 : -6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: position === 'above' ? 6 : -6, scale: 0.96 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="pointer-events-none"
      style={{
        position: 'fixed',
        top: coords?.top ?? 0,
        left: coords?.left ?? 0,
        transform: 'translateX(-50%)',
        zIndex: 10001, // Above modal backdrop
        visibility: coords ? 'visible' : 'hidden',
      }}
    >
      {/* Tooltip card */}
      <div
        style={{
          background: INK.paper,
          border: `1px solid ${INK.rule}`,
          borderRadius: 12,
          boxShadow: `
            0 4px 16px rgba(26, 24, 21, 0.12),
            0 8px 32px rgba(26, 24, 21, 0.08)
          `,
          minWidth: 160,
          overflow: 'hidden',
        }}
      >
        {/* Header with title and variance */}
        <div
          style={{
            padding: '10px 14px 8px',
            borderBottom: `1px solid ${INK.rule}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <span
            style={{
              fontFamily: FONT.serif,
              fontSize: 14,
              fontWeight: 500,
              color: INK.black,
              letterSpacing: '-0.01em',
            }}
          >
            {title}
          </span>

          {variance && variance.value !== 0 && (
            <span
              style={{
                fontFamily: FONT.mono,
                fontSize: 11,
                fontWeight: 600,
                color: isPositive ? INK.emerald : INK.rose,
                backgroundColor: isPositive ? INK.emeraldLight : INK.roseLight,
                padding: '2px 6px',
                borderRadius: 4,
              }}
            >
              {isPositive ? '+' : ''}{variance.percent}%
            </span>
          )}
        </div>

        {/* Values section */}
        <div style={{ padding: '10px 14px 12px' }}>
          <div style={{ display: 'flex', gap: 16 }}>
            {values.map((v, i) => (
              <div key={i} style={{ flex: v.isPrimary ? 1 : 'none' }}>
                {/* Label with color indicator */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginBottom: 4,
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      backgroundColor: v.color,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: FONT.sans,
                      fontSize: 10,
                      fontWeight: 500,
                      color: INK.muted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {v.label}
                  </span>
                </div>

                {/* Value */}
                <span
                  style={{
                    fontFamily: FONT.mono,
                    fontSize: 18,
                    fontWeight: 600,
                    color: INK.black,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {v.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Hint footer */}
        {hint && (
          <div
            style={{
              padding: '8px 14px',
              borderTop: `1px solid ${INK.rule}`,
              backgroundColor: INK.cream,
            }}
          >
            <span
              style={{
                fontFamily: FONT.sans,
                fontSize: 10,
                color: INK.ghost,
                fontStyle: 'italic',
              }}
            >
              {hint}
            </span>
          </div>
        )}
      </div>

      {/* Arrow */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          [arrowPosition]: -6,
          width: 12,
          height: 12,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            backgroundColor: arrowPosition === 'bottom' ? INK.paper : (hint ? INK.cream : INK.paper),
            border: `1px solid ${INK.rule}`,
            borderRadius: 2,
            transform: `translateY(${arrowPosition === 'bottom' ? -6 : 6}px) rotate(45deg)`,
            marginLeft: 1,
          }}
        />
      </div>
    </motion.div>
  );
};
