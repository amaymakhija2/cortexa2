# Configure Page Revamp - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the Configure page from 7 tabs to 4 tabs with inline editing and refined "Ledger" aesthetic.

**Architecture:** New `configure-v2/` directory with fresh components. EditableRosterTable as core inline-editing primitive. Reuse existing OfficeMapping, ClinicianMapping, GoalHistory. Extend SettingsContext for new state (users, serviceMappings).

**Tech Stack:** React, TypeScript, Framer Motion, Tailwind CSS, Lucide icons. Tiempos Headline + Suisse Intl typography (already in RankingTable).

---

## Task 1: Create Directory Structure and Shared Module

**Files:**
- Create: `components/configure-v2/shared.tsx`
- Create: `components/configure-v2/index.ts`

**Step 1: Create the configure-v2 directory**

```bash
mkdir -p components/configure-v2
```

**Step 2: Create shared.tsx with types and constants**

```typescript
// components/configure-v2/shared.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

// =============================================================================
// TYPOGRAPHY & COLOR TOKENS (from RankingTable DNA)
// =============================================================================

export const FONT = {
  serif: "'Tiempos Headline', Georgia, serif",
  sans: "'Suisse Intl', sans-serif",
} as const;

export const COLOR = {
  ink: '#1c1917',
  dark: '#292524',
  body: '#44403c',
  muted: '#57534e',
  stone: '#78716c',
  faded: '#a8a29e',
  rule: '#e7e5e4',
  dashed: '#D6D3D1',
  white: '#ffffff',
} as const;

export const STATUS = {
  emerald: '#10b981',
  emeraldLight: '#d1fae5',
  amber: '#f59e0b',
  amberLight: '#fef3c7',
  rose: '#ef4444',
  roseLight: '#fee2e2',
  violet: '#8b5cf6',
  violetLight: '#ede9fe',
} as const;

// =============================================================================
// TYPES
// =============================================================================

// Re-export from original shared for compatibility
export type {
  LicenseType,
  ClinicianRole,
  Clinician,
  Location,
  EHRConnection,
  RawEHRClinician,
} from '../configure/shared';

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

// User access types (new)
export type UserRole = 'owner' | 'admin' | 'supervisor' | 'viewer';
export type UserStatus = 'active' | 'pending';

export interface UserAccess {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  revenueAccess: boolean;
  superviseeIds: string[]; // clinician IDs for supervisor role
  status: UserStatus;
}

// Service mapping types (new)
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
// INLINE EDITING PRIMITIVES
// =============================================================================

interface InlineInputProps {
  value: string | number;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  type?: 'text' | 'number';
  suffix?: string;
  placeholder?: string;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  autoFocus?: boolean;
}

export const InlineInput: React.FC<InlineInputProps> = ({
  value,
  onChange,
  onBlur,
  onKeyDown,
  type = 'text',
  suffix,
  placeholder,
  width = 80,
  align = 'center',
  autoFocus = false,
}) => (
  <div className="relative inline-flex items-center">
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      autoFocus={autoFocus}
      className="bg-transparent border border-transparent rounded-md px-2 py-1
        hover:border-stone-200 hover:bg-stone-50/50
        focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-100
        transition-all duration-150"
      style={{
        fontFamily: FONT.sans,
        fontSize: 14,
        fontWeight: 500,
        color: COLOR.ink,
        width,
        textAlign: align,
      }}
    />
    {suffix && (
      <span
        className="absolute right-2 pointer-events-none"
        style={{ fontFamily: FONT.sans, fontSize: 12, color: COLOR.faded }}
      >
        {suffix}
      </span>
    )}
  </div>
);

interface InlineSelectProps<T extends string> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  width?: number | string;
  variant?: 'default' | 'chip';
  chipColor?: 'emerald' | 'amber' | 'stone';
}

export function InlineSelect<T extends string>({
  value,
  options,
  onChange,
  width = 120,
  variant = 'default',
  chipColor = 'stone',
}: InlineSelectProps<T>) {
  const chipColors = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
    stone: 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100',
  };

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className={`appearance-none cursor-pointer rounded-md px-2 py-1 pr-6
        border transition-all duration-150
        focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-400
        ${variant === 'chip'
          ? chipColors[chipColor]
          : 'bg-transparent border-transparent hover:border-stone-200 hover:bg-stone-50/50'
        }`}
      style={{
        fontFamily: FONT.sans,
        fontSize: variant === 'chip' ? 12 : 14,
        fontWeight: variant === 'chip' ? 600 : 500,
        width,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2378716c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 6px center',
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

// Toggle pill for active/inactive
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
}) => (
  <button
    onClick={() => onChange(!active)}
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
      border transition-all duration-150 cursor-pointer
      ${active
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
        : 'bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200'
      }`}
    style={{ fontFamily: FONT.sans }}
  >
    <span
      className={`w-1.5 h-1.5 rounded-full transition-colors ${
        active ? 'bg-emerald-500' : 'bg-stone-400'
      }`}
    />
    {active ? activeLabel : inactiveLabel}
  </button>
);

// Save confirmation animation
export const SaveConfirmation: React.FC<{ show: boolean }> = ({ show }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: show ? 1 : 0, scale: show ? 1 : 0.8 }}
    className="absolute -right-1 -top-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center"
  >
    <Check size={10} className="text-white" strokeWidth={3} />
  </motion.div>
);

// =============================================================================
// SECTION COMPONENTS
// =============================================================================

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, actions }) => (
  <div className="flex items-center justify-between mb-6">
    <div>
      <h2
        className="text-xl font-bold"
        style={{ fontFamily: FONT.serif, color: COLOR.ink }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className="mt-1 text-sm"
          style={{ fontFamily: FONT.sans, color: COLOR.muted }}
        >
          {subtitle}
        </p>
      )}
    </div>
    {actions && <div className="flex items-center gap-3">{actions}</div>}
  </div>
);

interface SectionDividerProps {
  className?: string;
}

export const SectionDivider: React.FC<SectionDividerProps> = ({ className = '' }) => (
  <div
    className={`border-t my-8 ${className}`}
    style={{ borderColor: COLOR.rule }}
  />
);
```

**Step 3: Create barrel export**

```typescript
// components/configure-v2/index.ts
export * from './shared';
```

**Step 4: Verify compilation**

Run: `npm run build` or check for TypeScript errors in IDE.
Expected: No errors.

**Step 5: Commit**

```bash
git add components/configure-v2/
git commit -m "feat(configure-v2): add shared module with types and inline editing primitives"
```

---

## Task 2: Build EditableRosterTable - Core Structure

**Files:**
- Create: `components/configure-v2/EditableRosterTable.tsx`

**Step 1: Create the base table component with column definitions**

```typescript
// components/configure-v2/EditableRosterTable.tsx
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { FONT, COLOR, InlineInput, InlineSelect, TogglePill } from './shared';
import type { Clinician, LicenseType, ClinicianRole } from './shared';
import { LICENSE_TYPE_NAMES, ROLE_OPTIONS, canSupervise, LICENSES_REQUIRING_SUPERVISION } from './shared';

// =============================================================================
// TYPES
// =============================================================================

export interface RosterColumn {
  key: string;
  label: string;
  width: number | string;
  align?: 'left' | 'center' | 'right';
}

export interface EditableRosterTableProps {
  clinicians: Clinician[];
  onUpdate: (clinicians: Clinician[]) => void;
  onExpandRow?: (clinicianId: string) => void;
  expandedRowId?: string | null;
  renderExpandedContent?: (clinician: Clinician) => React.ReactNode;
}

// =============================================================================
// COLUMN DEFINITIONS
// =============================================================================

const COLUMNS: RosterColumn[] = [
  { key: 'rank', label: '#', width: 44, align: 'center' },
  { key: 'clinician', label: 'Clinician', width: 200, align: 'left' },
  { key: 'license', label: 'License', width: 100, align: 'center' },
  { key: 'role', label: 'Role', width: 160, align: 'center' },
  { key: 'supervision', label: 'Supervision', width: 150, align: 'center' },
  { key: 'sessions', label: 'Sessions', width: 100, align: 'center' },
  { key: 'clients', label: 'Clients', width: 80, align: 'center' },
  { key: 'status', label: 'Status', width: 90, align: 'center' },
  { key: 'actions', label: '', width: 44, align: 'center' },
];

// =============================================================================
// STYLES
// =============================================================================

const S = {
  headerCell: {
    fontFamily: FONT.sans,
    fontSize: 11,
    fontWeight: 600,
    color: COLOR.stone,
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
  },
  nameText: {
    fontFamily: FONT.serif,
    fontSize: 17,
    color: COLOR.ink,
    lineHeight: 1.25,
  },
  subtitle: {
    fontFamily: FONT.sans,
    fontSize: 11,
    color: COLOR.faded,
    letterSpacing: '0.04em',
    marginTop: 2,
  },
  rank: {
    fontFamily: FONT.sans,
    fontSize: 16,
    fontWeight: 600,
    color: COLOR.muted,
  },
} as const;

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const EditableRosterTable: React.FC<EditableRosterTableProps> = ({
  clinicians,
  onUpdate,
  onExpandRow,
  expandedRowId,
  renderExpandedContent,
}) => {
  // Sort: active first, then inactive (dimmed) at bottom
  const sortedClinicians = [...clinicians].sort((a, b) => {
    if (a.isActive === b.isActive) return 0;
    return a.isActive ? -1 : 1;
  });

  // Get supervisors for dropdown
  const supervisors = clinicians.filter((c) => canSupervise(c.role) && c.isActive);

  // Update a single clinician
  const updateClinician = useCallback(
    (id: string, updates: Partial<Clinician>) => {
      const updated = clinicians.map((c) => {
        if (c.id !== id) return c;
        const newClinician = { ...c, ...updates };

        // Smart behavior: License change affects supervision requirement
        if (updates.licenseType) {
          newClinician.requiresSupervision = LICENSES_REQUIRING_SUPERVISION.includes(updates.licenseType);
          if (!newClinician.requiresSupervision) {
            newClinician.supervisorId = null;
          }
        }

        return newClinician;
      });
      onUpdate(updated);
    },
    [clinicians, onUpdate]
  );

  // Grid template for columns
  const gridTemplate = COLUMNS.map((col) =>
    typeof col.width === 'number' ? `${col.width}px` : col.width
  ).join(' ');

  return (
    <div className="w-full">
      {/* Header Row */}
      <div
        className="grid items-end pb-3 mb-0 border-b-2"
        style={{
          gridTemplateColumns: gridTemplate,
          borderColor: COLOR.dark,
        }}
      >
        {COLUMNS.map((col) => (
          <div
            key={col.key}
            style={{ ...S.headerCell, textAlign: col.align }}
          >
            {col.label}
          </div>
        ))}
      </div>

      {/* Data Rows */}
      <div>
        {sortedClinicians.map((clinician, index) => (
          <RosterRow
            key={clinician.id}
            clinician={clinician}
            rank={index + 1}
            gridTemplate={gridTemplate}
            supervisors={supervisors}
            onUpdate={(updates) => updateClinician(clinician.id, updates)}
            isExpanded={expandedRowId === clinician.id}
            onToggleExpand={() => onExpandRow?.(clinician.id)}
            renderExpandedContent={renderExpandedContent}
          />
        ))}
      </div>
    </div>
  );
};

// =============================================================================
// ROW COMPONENT
// =============================================================================

interface RosterRowProps {
  clinician: Clinician;
  rank: number;
  gridTemplate: string;
  supervisors: Clinician[];
  onUpdate: (updates: Partial<Clinician>) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  renderExpandedContent?: (clinician: Clinician) => React.ReactNode;
}

const RosterRow: React.FC<RosterRowProps> = ({
  clinician,
  rank,
  gridTemplate,
  supervisors,
  onUpdate,
  isExpanded,
  onToggleExpand,
  renderExpandedContent,
}) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `Since ${date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
  };

  // License options
  const licenseOptions = Object.entries(LICENSE_TYPE_NAMES).map(([value, label]) => ({
    value: value as LicenseType,
    label: value, // Show abbreviation in dropdown
  }));

  // Role options
  const roleOptions = ROLE_OPTIONS.map((role) => ({
    value: role,
    label: role,
  }));

  // Supervision options
  const supervisionOptions = [
    { value: '', label: clinician.requiresSupervision ? 'Assign...' : 'Independent' },
    ...supervisors
      .filter((s) => s.id !== clinician.id)
      .map((s) => ({ value: s.id, label: s.name })),
  ];

  const needsSupervision = clinician.requiresSupervision && !clinician.supervisorId;

  return (
    <div
      className={`transition-opacity duration-200 ${
        clinician.isActive ? 'opacity-100' : 'opacity-40'
      }`}
    >
      {/* Main Row */}
      <div
        className="grid items-center py-4 border-b transition-colors hover:bg-stone-50/50"
        style={{
          gridTemplateColumns: gridTemplate,
          borderColor: COLOR.rule,
        }}
      >
        {/* Rank */}
        <div className="text-center" style={S.rank}>
          {rank}
        </div>

        {/* Clinician Name */}
        <div className="min-w-0 pl-1">
          <div className="truncate" style={S.nameText}>
            {clinician.name}
          </div>
          <div className="truncate" style={S.subtitle}>
            {formatDate(clinician.startDate)}
          </div>
        </div>

        {/* License */}
        <div className="flex justify-center">
          <InlineSelect
            value={clinician.licenseType}
            options={licenseOptions}
            onChange={(value) => onUpdate({ licenseType: value })}
            width={90}
          />
        </div>

        {/* Role */}
        <div className="flex justify-center">
          <InlineSelect
            value={clinician.role}
            options={roleOptions}
            onChange={(value) => onUpdate({ role: value })}
            width={150}
          />
        </div>

        {/* Supervision */}
        <div className="flex justify-center">
          <InlineSelect
            value={clinician.supervisorId || ''}
            options={supervisionOptions}
            onChange={(value) => onUpdate({ supervisorId: value || null })}
            width={140}
            variant="chip"
            chipColor={needsSupervision ? 'amber' : 'emerald'}
          />
        </div>

        {/* Sessions Goal */}
        <div className="flex justify-center">
          <InlineInput
            value={clinician.sessionGoal}
            onChange={(val) => onUpdate({ sessionGoal: parseInt(val) || 0 })}
            type="number"
            suffix="/wk"
            width={70}
            align="right"
          />
        </div>

        {/* Clients Goal */}
        <div className="flex justify-center">
          <InlineInput
            value={clinician.clientGoal}
            onChange={(val) => onUpdate({ clientGoal: parseInt(val) || 0 })}
            type="number"
            width={60}
            align="center"
          />
        </div>

        {/* Status */}
        <div className="flex justify-center">
          <TogglePill
            active={clinician.isActive}
            onChange={(active) => onUpdate({ isActive: active })}
          />
        </div>

        {/* Expand Button */}
        <div className="flex justify-center">
          <button
            onClick={onToggleExpand}
            className="p-1.5 rounded-md text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && renderExpandedContent && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden bg-stone-50/50 border-b"
            style={{ borderColor: COLOR.rule }}
          >
            <div className="py-4 px-6">
              {renderExpandedContent(clinician)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EditableRosterTable;
```

**Step 2: Add to barrel export**

```typescript
// components/configure-v2/index.ts
export * from './shared';
export * from './EditableRosterTable';
```

**Step 3: Verify compilation**

Run: `npm run build` or check for TypeScript errors.
Expected: No errors.

**Step 4: Commit**

```bash
git add components/configure-v2/
git commit -m "feat(configure-v2): add EditableRosterTable with inline editing"
```

---

## Task 3: Build CliniciansTab

**Files:**
- Create: `components/configure-v2/CliniciansTab.tsx`

**Step 1: Create CliniciansTab with roster table and goal history integration**

```typescript
// components/configure-v2/CliniciansTab.tsx
import React, { useState, useMemo } from 'react';
import { Link2 } from 'lucide-react';
import { EditableRosterTable } from './EditableRosterTable';
import { SectionHeader, StatusPill, FONT, COLOR } from './shared';
import type { Clinician } from './shared';
import { canSupervise, LICENSES_REQUIRING_SUPERVISION } from './shared';
import { GoalHistoryModal } from '../configure/GoalHistory';
import { useSettings } from '../../context/SettingsContext';

// =============================================================================
// TYPES
// =============================================================================

interface CliniciansTabProps {
  clinicians: Clinician[];
  onUpdate: (clinicians: Clinician[]) => void;
  onOpenMapping?: () => void;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const CliniciansTab: React.FC<CliniciansTabProps> = ({
  clinicians,
  onUpdate,
  onOpenMapping,
}) => {
  const { settings } = useSettings();
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [goalHistoryClinicianId, setGoalHistoryClinicianId] = useState<string | null>(null);

  // Compute supervision status
  const supervisionStatus = useMemo(() => {
    const needingSupervision = clinicians.filter(
      (c) => c.isActive && LICENSES_REQUIRING_SUPERVISION.includes(c.licenseType)
    );
    const assigned = needingSupervision.filter((c) => c.supervisorId !== null);
    return {
      assigned: assigned.length,
      total: needingSupervision.length,
    };
  }, [clinicians]);

  // Handle row expansion
  const handleExpandRow = (clinicianId: string) => {
    setExpandedRowId((prev) => (prev === clinicianId ? null : clinicianId));
  };

  // Render expanded content with goal history preview
  const renderExpandedContent = (clinician: Clinician) => {
    // Get goal history for this clinician
    const history = settings.clinicianGoalHistory[clinician.id];
    const hasHistory = history && (
      (history.sessionGoal?.length ?? 0) > 0 ||
      (history.clientGoal?.length ?? 0) > 0 ||
      (history.takeRate?.length ?? 0) > 0
    );

    return (
      <div className="flex items-center justify-between">
        <div>
          <p style={{ fontFamily: FONT.sans, fontSize: 13, color: COLOR.muted }}>
            {hasHistory
              ? 'Goal history available'
              : 'No goal history yet. Changes to goals will be tracked over time.'}
          </p>
        </div>
        <button
          onClick={() => setGoalHistoryClinicianId(clinician.id)}
          className="text-sm font-medium text-violet-600 hover:text-violet-700 hover:underline"
          style={{ fontFamily: FONT.sans }}
        >
          View Full History
        </button>
      </div>
    );
  };

  // Find clinician for goal history modal
  const goalHistoryClinician = clinicians.find((c) => c.id === goalHistoryClinicianId);

  return (
    <div>
      {/* Header */}
      <SectionHeader
        title="Clinicians"
        subtitle="Credentials, roles, supervision, and goals for your team"
        actions={
          <div className="flex items-center gap-3">
            <StatusPill
              assigned={supervisionStatus.assigned}
              total={supervisionStatus.total}
              completeLabel="All supervised"
              incompleteLabel={`${supervisionStatus.total - supervisionStatus.assigned} needs supervisor`}
            />
            {onOpenMapping && (
              <button
                onClick={onOpenMapping}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
                  bg-stone-100 text-stone-700 font-medium text-sm
                  hover:bg-stone-200 transition-colors"
                style={{ fontFamily: FONT.sans }}
              >
                <Link2 size={16} />
                Manage EHR Mapping
              </button>
            )}
          </div>
        }
      />

      {/* Roster Table */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100">
        <div className="p-6">
          <EditableRosterTable
            clinicians={clinicians}
            onUpdate={onUpdate}
            onExpandRow={handleExpandRow}
            expandedRowId={expandedRowId}
            renderExpandedContent={renderExpandedContent}
          />
        </div>
      </div>

      {/* Goal History Modal */}
      {goalHistoryClinician && (
        <GoalHistoryModal
          isOpen={!!goalHistoryClinicianId}
          onClose={() => setGoalHistoryClinicianId(null)}
          clinician={{
            id: goalHistoryClinician.id,
            name: goalHistoryClinician.name,
            color: goalHistoryClinician.color,
            sessionGoal: goalHistoryClinician.sessionGoal,
            clientGoal: goalHistoryClinician.clientGoal,
            takeRate: goalHistoryClinician.takeRate,
          }}
        />
      )}
    </div>
  );
};

export default CliniciansTab;
```

**Step 2: Add to barrel export**

```typescript
// components/configure-v2/index.ts
export * from './shared';
export * from './EditableRosterTable';
export * from './CliniciansTab';
```

**Step 3: Commit**

```bash
git add components/configure-v2/
git commit -m "feat(configure-v2): add CliniciansTab with roster and goal history"
```

---

## Task 4: Build UsersAccessTab

**Files:**
- Create: `components/configure-v2/UsersAccessTab.tsx`
- Create: `components/configure-v2/InviteUserSlideOver.tsx`

**Step 1: Create InviteUserSlideOver**

```typescript
// components/configure-v2/InviteUserSlideOver.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { FONT, COLOR, STATUS } from './shared';
import type { UserRole, UserAccess, Clinician } from './shared';

interface InviteUserSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (user: Omit<UserAccess, 'id'>) => void;
  clinicians: Clinician[];
  supervisorClinicians: Clinician[]; // clinicians who supervise others
}

const ROLE_OPTIONS: { value: UserRole; label: string; description: string }[] = [
  { value: 'admin', label: 'Admin', description: 'Full access, can configure settings' },
  { value: 'supervisor', label: 'Supervisor', description: 'See supervisees data + practice aggregates' },
  { value: 'viewer', label: 'Viewer', description: 'Read-only access to practice data' },
];

export const InviteUserSlideOver: React.FC<InviteUserSlideOverProps> = ({
  isOpen,
  onClose,
  onInvite,
  clinicians,
  supervisorClinicians,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('viewer');
  const [revenueAccess, setRevenueAccess] = useState(false);
  const [superviseeIds, setSuperviseeIds] = useState<string[]>([]);

  const handleSubmit = () => {
    if (!name || !email) return;
    onInvite({
      name,
      email,
      role,
      revenueAccess,
      superviseeIds: role === 'supervisor' ? superviseeIds : [],
      status: 'pending',
    });
    // Reset form
    setName('');
    setEmail('');
    setRole('viewer');
    setRevenueAccess(false);
    setSuperviseeIds([]);
    onClose();
  };

  // Get supervisees for the selected supervisor role
  const availableSupervisees = clinicians.filter((c) => c.isActive);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: COLOR.rule }}>
              <h2 style={{ fontFamily: FONT.serif, fontSize: 22, color: COLOR.ink }}>
                Invite User
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-stone-100 transition-colors"
              >
                <X size={20} className="text-stone-500" />
              </button>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-stone-600 mb-2" style={{ fontFamily: FONT.sans }}>
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="w-full px-4 py-3 rounded-xl bg-stone-50 border-2 border-transparent
                    focus:border-violet-300 focus:bg-white focus:outline-none transition-all"
                  style={{ fontFamily: FONT.sans, fontSize: 15 }}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-stone-600 mb-2" style={{ fontFamily: FONT.sans }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-stone-50 border-2 border-transparent
                    focus:border-violet-300 focus:bg-white focus:outline-none transition-all"
                  style={{ fontFamily: FONT.sans, fontSize: 15 }}
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-semibold text-stone-600 mb-3" style={{ fontFamily: FONT.sans }}>
                  Role
                </label>
                <div className="space-y-2">
                  {ROLE_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                        ${role === opt.value
                          ? 'border-violet-300 bg-violet-50/50'
                          : 'border-stone-100 hover:border-stone-200'
                        }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={opt.value}
                        checked={role === opt.value}
                        onChange={() => setRole(opt.value)}
                        className="mt-0.5 accent-violet-600"
                      />
                      <div>
                        <div className="font-semibold text-stone-800" style={{ fontFamily: FONT.sans, fontSize: 14 }}>
                          {opt.label}
                        </div>
                        <div className="text-sm text-stone-500 mt-0.5" style={{ fontFamily: FONT.sans }}>
                          {opt.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Supervisees (if supervisor role) */}
              {role === 'supervisor' && (
                <div>
                  <label className="block text-sm font-semibold text-stone-600 mb-3" style={{ fontFamily: FONT.sans }}>
                    This user will see data for:
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableSupervisees.map((c) => (
                      <label
                        key={c.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={superviseeIds.includes(c.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSuperviseeIds([...superviseeIds, c.id]);
                            } else {
                              setSuperviseeIds(superviseeIds.filter((id) => id !== c.id));
                            }
                          }}
                          className="accent-violet-600"
                        />
                        <span style={{ fontFamily: FONT.sans, fontSize: 14, color: COLOR.ink }}>
                          {c.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Revenue Access */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-stone-50">
                <div>
                  <div className="font-semibold text-stone-800" style={{ fontFamily: FONT.sans, fontSize: 14 }}>
                    Revenue Access
                  </div>
                  <div className="text-sm text-stone-500 mt-0.5" style={{ fontFamily: FONT.sans }}>
                    Can see dollar amounts across the platform
                  </div>
                </div>
                <button
                  onClick={() => setRevenueAccess(!revenueAccess)}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    revenueAccess ? 'bg-emerald-500' : 'bg-stone-300'
                  }`}
                >
                  <motion.div
                    className="absolute top-1 w-5 h-5 rounded-full bg-white shadow"
                    animate={{ left: revenueAccess ? 26 : 4 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-5 border-t" style={{ borderColor: COLOR.rule }}>
              <button
                onClick={handleSubmit}
                disabled={!name || !email}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                  bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold
                  hover:from-emerald-600 hover:to-emerald-700 transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: FONT.sans }}
              >
                <Send size={18} />
                Send Invite
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default InviteUserSlideOver;
```

**Step 2: Create UsersAccessTab**

```typescript
// components/configure-v2/UsersAccessTab.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Lock, Mail, RotateCcw } from 'lucide-react';
import { FONT, COLOR, STATUS, SectionHeader, InlineSelect, TogglePill } from './shared';
import type { UserAccess, UserRole, Clinician } from './shared';
import { canSupervise } from './shared';
import { InviteUserSlideOver } from './InviteUserSlideOver';

// =============================================================================
// TYPES
// =============================================================================

interface UsersAccessTabProps {
  users: UserAccess[];
  onUpdateUsers: (users: UserAccess[]) => void;
  clinicians: Clinician[];
}

// =============================================================================
// MOCK DATA (temporary - will come from settings context)
// =============================================================================

const MOCK_USERS: UserAccess[] = [
  {
    id: 'user-1',
    name: 'Practice Owner',
    email: 'owner@practice.com',
    role: 'owner',
    revenueAccess: true,
    superviseeIds: [],
    status: 'active',
  },
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const UsersAccessTab: React.FC<UsersAccessTabProps> = ({
  users: propUsers,
  onUpdateUsers,
  clinicians,
}) => {
  const users = propUsers.length > 0 ? propUsers : MOCK_USERS;
  const [showInvite, setShowInvite] = useState(false);

  // Role options (owner excluded - can't be assigned)
  const roleOptions: { value: UserRole; label: string }[] = [
    { value: 'admin', label: 'Admin' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'viewer', label: 'Viewer' },
  ];

  // Update a single user
  const updateUser = (id: string, updates: Partial<UserAccess>) => {
    const updated = users.map((u) => (u.id === id ? { ...u, ...updates } : u));
    onUpdateUsers(updated);
  };

  // Add new user from invite
  const handleInvite = (newUser: Omit<UserAccess, 'id'>) => {
    const user: UserAccess = {
      ...newUser,
      id: `user-${Date.now()}`,
    };
    onUpdateUsers([...users, user]);
  };

  // Get supervisees for supervisor role display
  const getSuperviseeNames = (superviseeIds: string[]) => {
    return superviseeIds
      .map((id) => clinicians.find((c) => c.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div>
      {/* Header */}
      <SectionHeader
        title="Users & Access"
        subtitle="Control who can access Cortexa and what they see"
        actions={
          <button
            onClick={() => setShowInvite(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl
              bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold text-sm
              hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-sm"
            style={{ fontFamily: FONT.sans }}
          >
            <Plus size={18} />
            Invite User
          </button>
        }
      />

      {/* Users Table */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100">
        {/* Table Header */}
        <div
          className="grid items-center px-6 py-3 border-b-2"
          style={{
            gridTemplateColumns: '200px 220px 130px 120px 1fr',
            borderColor: COLOR.dark,
          }}
        >
          {['User', 'Email', 'Role', 'Revenue', 'Group'].map((label) => (
            <div
              key={label}
              style={{
                fontFamily: FONT.sans,
                fontSize: 11,
                fontWeight: 600,
                color: COLOR.stone,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Table Rows */}
        <div>
          {users.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`grid items-center px-6 py-4 border-b transition-colors hover:bg-stone-50/50
                ${user.status === 'pending' ? 'bg-stone-50/30' : ''}`}
              style={{
                gridTemplateColumns: '200px 220px 130px 120px 1fr',
                borderColor: COLOR.rule,
              }}
            >
              {/* User */}
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                  style={{
                    backgroundColor: user.status === 'pending' ? COLOR.stone : STATUS.violet,
                    fontFamily: FONT.sans,
                  }}
                >
                  {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontFamily: FONT.serif, fontSize: 15, color: COLOR.ink }}>
                    {user.name}
                  </div>
                  {user.status === 'pending' && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium"
                      style={{ fontFamily: FONT.sans }}
                    >
                      Pending
                    </span>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-stone-400" />
                <span style={{ fontFamily: FONT.sans, fontSize: 13, color: COLOR.body }}>
                  {user.email}
                </span>
              </div>

              {/* Role */}
              <div className="flex items-center">
                {user.role === 'owner' ? (
                  <div className="flex items-center gap-1.5">
                    <Lock size={12} className="text-stone-400" />
                    <span style={{ fontFamily: FONT.sans, fontSize: 13, fontWeight: 600, color: COLOR.muted }}>
                      Owner
                    </span>
                  </div>
                ) : (
                  <InlineSelect
                    value={user.role}
                    options={roleOptions}
                    onChange={(value) => updateUser(user.id, { role: value })}
                    width={110}
                  />
                )}
              </div>

              {/* Revenue Access */}
              <div>
                {user.role === 'owner' ? (
                  <span style={{ fontFamily: FONT.sans, fontSize: 12, color: COLOR.faded }}>
                    Always
                  </span>
                ) : (
                  <TogglePill
                    active={user.revenueAccess}
                    onChange={(active) => updateUser(user.id, { revenueAccess: active })}
                    activeLabel="Yes"
                    inactiveLabel="No"
                  />
                )}
              </div>

              {/* Group */}
              <div className="flex items-center justify-between">
                <span style={{ fontFamily: FONT.sans, fontSize: 13, color: COLOR.muted }}>
                  {user.role === 'supervisor' && user.superviseeIds.length > 0
                    ? getSuperviseeNames(user.superviseeIds)
                    : user.role === 'owner' || user.role === 'admin'
                    ? 'All'
                    : '—'}
                </span>
                {user.status === 'pending' && (
                  <button
                    className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 font-medium"
                    style={{ fontFamily: FONT.sans }}
                  >
                    <RotateCcw size={12} />
                    Resend
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {users.length === 0 && (
          <div className="py-16 text-center">
            <p style={{ fontFamily: FONT.sans, fontSize: 15, color: COLOR.muted }}>
              No users yet. Invite your first team member to get started.
            </p>
          </div>
        )}
      </div>

      {/* Invite Slide Over */}
      <InviteUserSlideOver
        isOpen={showInvite}
        onClose={() => setShowInvite(false)}
        onInvite={handleInvite}
        clinicians={clinicians}
        supervisorClinicians={clinicians.filter((c) => canSupervise(c.role))}
      />
    </div>
  );
};

export default UsersAccessTab;
```

**Step 3: Add to barrel export**

```typescript
// components/configure-v2/index.ts
export * from './shared';
export * from './EditableRosterTable';
export * from './CliniciansTab';
export * from './InviteUserSlideOver';
export * from './UsersAccessTab';
```

**Step 4: Commit**

```bash
git add components/configure-v2/
git commit -m "feat(configure-v2): add UsersAccessTab with invite flow"
```

---

## Task 5: Build PracticeTab

**Files:**
- Create: `components/configure-v2/PracticeTab.tsx`

**Step 1: Create PracticeTab with all sections**

```typescript
// components/configure-v2/PracticeTab.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Calendar, Target, Clock, TrendingUp, AlertTriangle, Save } from 'lucide-react';
import { FONT, COLOR, STATUS, SectionHeader, SectionDivider, ConfigCard } from './shared';
import { useSettings, PracticeGoals, MetricThresholds } from '../../context/SettingsContext';

// =============================================================================
// TYPES
// =============================================================================

interface PracticeTabProps {
  clinicians: { sessionGoal: number }[];
}

// =============================================================================
// HELPERS
// =============================================================================

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

// Large goal input card
const GoalCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  onChange: (value: number) => void;
  format?: (v: number) => string;
  suffix?: string;
  subtext?: string;
}> = ({ icon, label, value, onChange, format, suffix, subtext }) => (
  <ConfigCard className="p-6">
    <div className="flex items-center gap-2 mb-4">
      <div className="p-2 rounded-lg bg-violet-50 text-violet-600">{icon}</div>
      <span style={{ fontFamily: FONT.sans, fontSize: 13, fontWeight: 600, color: COLOR.muted }}>
        {label}
      </span>
    </div>
    <div className="relative">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="w-full text-3xl font-bold bg-transparent border-b-2 border-transparent
          hover:border-stone-200 focus:border-violet-400 focus:outline-none
          transition-colors pb-2"
        style={{ fontFamily: FONT.serif, color: COLOR.ink }}
      />
      {suffix && (
        <span
          className="absolute right-0 bottom-2 text-lg"
          style={{ fontFamily: FONT.sans, color: COLOR.faded }}
        >
          {suffix}
        </span>
      )}
    </div>
    {subtext && (
      <p className="mt-2 text-sm" style={{ fontFamily: FONT.sans, color: COLOR.faded }}>
        {subtext}
      </p>
    )}
  </ConfigCard>
);

// Threshold card with color
const ThresholdCard: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  color: 'emerald' | 'amber' | 'rose';
  suffix?: string;
}> = ({ label, value, onChange, color, suffix = 'days' }) => {
  const colors = {
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
    rose: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700' },
  };
  const c = colors[color];

  return (
    <div className={`${c.bg} ${c.border} border rounded-xl p-4`}>
      <label
        className={`block text-xs font-semibold ${c.text} mb-2`}
        style={{ fontFamily: FONT.sans }}
      >
        {label}
      </label>
      <div className="flex items-baseline gap-2">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          className={`w-16 text-2xl font-bold bg-transparent ${c.text} focus:outline-none`}
          style={{ fontFamily: FONT.serif }}
        />
        <span className={`text-sm ${c.text}`} style={{ fontFamily: FONT.sans }}>
          {suffix}
        </span>
      </div>
    </div>
  );
};

// Button selector for note deadline
const ButtonSelector: React.FC<{
  options: number[];
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
}> = ({ options, value, onChange, suffix = 'h' }) => (
  <div className="flex gap-2">
    {options.map((opt) => (
      <button
        key={opt}
        onClick={() => onChange(opt)}
        className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all
          ${value === opt
            ? 'bg-violet-600 text-white shadow-sm'
            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        style={{ fontFamily: FONT.sans }}
      >
        {opt}{suffix}
      </button>
    ))}
  </div>
);

// Performance slider
const PerformanceSlider: React.FC<{
  label: string;
  healthyValue: number;
  criticalValue: number;
  onHealthyChange: (v: number) => void;
  onCriticalChange: (v: number) => void;
}> = ({ label, healthyValue, criticalValue, onHealthyChange, onCriticalChange }) => (
  <div className="p-5 rounded-xl bg-stone-50/50">
    <h4 className="text-sm font-semibold mb-4" style={{ fontFamily: FONT.sans, color: COLOR.ink }}>
      {label}
    </h4>
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-emerald-600 font-medium" style={{ fontFamily: FONT.sans }}>
          Healthy above
        </span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={healthyValue}
            onChange={(e) => onHealthyChange(parseInt(e.target.value) || 0)}
            className="w-16 px-2 py-1 rounded-lg bg-white border border-stone-200 text-center
              focus:border-emerald-400 focus:outline-none"
            style={{ fontFamily: FONT.sans, fontSize: 14 }}
          />
          <span className="text-sm text-stone-500">%</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-rose-600 font-medium" style={{ fontFamily: FONT.sans }}>
          Critical below
        </span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={criticalValue}
            onChange={(e) => onCriticalChange(parseInt(e.target.value) || 0)}
            className="w-16 px-2 py-1 rounded-lg bg-white border border-stone-200 text-center
              focus:border-rose-400 focus:outline-none"
            style={{ fontFamily: FONT.sans, fontSize: 14 }}
          />
          <span className="text-sm text-stone-500">%</span>
        </div>
      </div>
    </div>
  </div>
);

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const PracticeTab: React.FC<PracticeTabProps> = ({ clinicians }) => {
  const { settings, updateSettings } = useSettings();
  const [goals, setGoals] = useState<PracticeGoals>(settings.practiceGoals);
  const [thresholds, setThresholds] = useState<MetricThresholds>(settings.thresholds);
  const [isDirty, setIsDirty] = useState(false);

  // Track changes
  useEffect(() => {
    const goalsChanged = JSON.stringify(goals) !== JSON.stringify(settings.practiceGoals);
    const thresholdsChanged = JSON.stringify(thresholds) !== JSON.stringify(settings.thresholds);
    setIsDirty(goalsChanged || thresholdsChanged);
  }, [goals, thresholds, settings]);

  // Save changes
  const handleSave = () => {
    updateSettings({ practiceGoals: goals, thresholds });
    setIsDirty(false);
  };

  // Compute clinician totals
  const totalWeeklySessions = clinicians.reduce((sum, c) => sum + c.sessionGoal, 0);
  const monthlySessionsFromClinicians = totalWeeklySessions * 4;

  return (
    <div>
      {/* Header with Save Button */}
      <SectionHeader
        title="Practice Settings"
        subtitle="Goals, definitions, and how metrics are calculated"
        actions={
          isDirty && (
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold text-sm
                hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-sm"
              style={{ fontFamily: FONT.sans }}
            >
              <Save size={16} />
              Save Changes
            </motion.button>
          )
        }
      />

      {/* Section 1: Practice Goals */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 mb-8">
        <h3 className="text-lg font-bold mb-6" style={{ fontFamily: FONT.serif, color: COLOR.ink }}>
          Practice Goals
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <GoalCard
            icon={<DollarSign size={18} />}
            label="Monthly Revenue"
            value={goals.monthlyRevenue}
            onChange={(v) => setGoals({ ...goals, monthlyRevenue: v })}
            subtext={`${formatCurrency(goals.monthlyRevenue * 12)}/year`}
          />
          <GoalCard
            icon={<Calendar size={18} />}
            label="Monthly Sessions"
            value={goals.monthlySessions}
            onChange={(v) => setGoals({ ...goals, monthlySessions: v })}
            subtext={`${Math.round(goals.monthlySessions / 4)}/week • Clinicians: ${monthlySessionsFromClinicians}/mo`}
          />
          <GoalCard
            icon={<Target size={18} />}
            label="Target Rebook Rate"
            value={goals.targetRebookRate}
            onChange={(v) => setGoals({ ...goals, targetRebookRate: v })}
            suffix="%"
            subtext="Industry benchmark: 85%"
          />
        </div>
      </div>

      {/* Section 2: Client Definitions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 mb-8">
        <h3 className="text-lg font-bold mb-6" style={{ fontFamily: FONT.serif, color: COLOR.ink }}>
          Client Definitions
        </h3>

        {/* Active client definition */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-stone-600 mb-3" style={{ fontFamily: FONT.sans }}>
            How do you define an active client?
          </h4>
          <div className="space-y-2">
            <label
              className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                ${thresholds.clientDefinitionType === 'status-based'
                  ? 'border-violet-300 bg-violet-50/50'
                  : 'border-stone-100 hover:border-stone-200'
                }`}
            >
              <input
                type="radio"
                name="clientDef"
                checked={thresholds.clientDefinitionType === 'status-based'}
                onChange={() => setThresholds({ ...thresholds, clientDefinitionType: 'status-based' })}
                className="mt-0.5 accent-violet-600"
              />
              <div>
                <div className="font-semibold text-stone-800" style={{ fontFamily: FONT.sans, fontSize: 14 }}>
                  SimplePractice Status
                </div>
                <div className="text-sm text-stone-500" style={{ fontFamily: FONT.sans }}>
                  Active = "Active" status in SimplePractice
                </div>
              </div>
            </label>
            <label
              className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                ${thresholds.clientDefinitionType === 'activity-based'
                  ? 'border-violet-300 bg-violet-50/50'
                  : 'border-stone-100 hover:border-stone-200'
                }`}
            >
              <input
                type="radio"
                name="clientDef"
                checked={thresholds.clientDefinitionType === 'activity-based'}
                onChange={() => setThresholds({ ...thresholds, clientDefinitionType: 'activity-based' })}
                className="mt-0.5 accent-violet-600"
              />
              <div className="flex-1">
                <div className="font-semibold text-stone-800" style={{ fontFamily: FONT.sans, fontSize: 14 }}>
                  Activity-Based
                </div>
                <div className="text-sm text-stone-500" style={{ fontFamily: FONT.sans }}>
                  Active = had appointment within{' '}
                  <input
                    type="number"
                    value={thresholds.activityThresholdDays}
                    onChange={(e) => setThresholds({ ...thresholds, activityThresholdDays: parseInt(e.target.value) || 30 })}
                    className="w-12 px-2 py-0.5 mx-1 rounded border border-stone-200 text-center text-stone-800"
                    style={{ fontFamily: FONT.sans }}
                    onClick={(e) => e.stopPropagation()}
                  />{' '}
                  days
                </div>
              </div>
            </label>
          </div>
        </div>

        <SectionDivider className="!my-6" />

        {/* At-risk thresholds */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-stone-600 mb-3" style={{ fontFamily: FONT.sans }}>
            At-Risk Client Thresholds
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <ThresholdCard
              label="Low Risk"
              value={thresholds.atRiskLow}
              onChange={(v) => setThresholds({ ...thresholds, atRiskLow: v })}
              color="emerald"
            />
            <ThresholdCard
              label="Medium Risk"
              value={thresholds.atRiskMedium}
              onChange={(v) => setThresholds({ ...thresholds, atRiskMedium: v })}
              color="amber"
            />
            <ThresholdCard
              label="High Risk"
              value={thresholds.atRiskHigh}
              onChange={(v) => setThresholds({ ...thresholds, atRiskHigh: v })}
              color="rose"
            />
          </div>
        </div>

        <SectionDivider className="!my-6" />

        {/* Churn timing */}
        <div>
          <h4 className="text-sm font-semibold text-stone-600 mb-3" style={{ fontFamily: FONT.sans }}>
            Churn Timing
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <ThresholdCard
              label="Early Churn"
              value={thresholds.earlyChurnSessions}
              onChange={(v) => setThresholds({ ...thresholds, earlyChurnSessions: v })}
              color="rose"
              suffix="sessions"
            />
            <div className="flex items-center justify-center p-4 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-sm text-stone-500" style={{ fontFamily: FONT.sans }}>
                {thresholds.earlyChurnSessions + 1} – {thresholds.lateChurnSessions - 1} sessions
              </span>
            </div>
            <ThresholdCard
              label="Late Churn"
              value={thresholds.lateChurnSessions}
              onChange={(v) => setThresholds({ ...thresholds, lateChurnSessions: v })}
              color="amber"
              suffix="sessions"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Session & Compliance Rules */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 mb-8">
        <h3 className="text-lg font-bold mb-6" style={{ fontFamily: FONT.serif, color: COLOR.ink }}>
          Session & Compliance Rules
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold text-stone-600 mb-3" style={{ fontFamily: FONT.sans }}>
              Late Cancel Window
            </h4>
            <ButtonSelector
              options={[12, 24, 48]}
              value={thresholds.lateCancelHours}
              onChange={(v) => setThresholds({ ...thresholds, lateCancelHours: v })}
            />
            <p className="mt-2 text-sm text-stone-500" style={{ fontFamily: FONT.sans }}>
              Cancellations within this window count as late cancels
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-stone-600 mb-3" style={{ fontFamily: FONT.sans }}>
              Note Deadline
            </h4>
            <ButtonSelector
              options={[24, 48, 72, 96]}
              value={goals.noteDeadlineHours}
              onChange={(v) => setGoals({ ...goals, noteDeadlineHours: v })}
            />
            <p className="mt-2 text-sm text-stone-500" style={{ fontFamily: FONT.sans }}>
              Hours after session to complete notes
            </p>
          </div>
        </div>
      </div>

      {/* Section 4: Performance Bands */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 mb-8">
        <h3 className="text-lg font-bold mb-6" style={{ fontFamily: FONT.serif, color: COLOR.ink }}>
          Performance Bands
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <PerformanceSlider
            label="Revenue Status"
            healthyValue={thresholds.revenueHealthy}
            criticalValue={thresholds.revenueCritical}
            onHealthyChange={(v) => setThresholds({ ...thresholds, revenueHealthy: v })}
            onCriticalChange={(v) => setThresholds({ ...thresholds, revenueCritical: v })}
          />
          <PerformanceSlider
            label="Rebook Rate Status"
            healthyValue={thresholds.rebookHealthy}
            criticalValue={thresholds.rebookCritical}
            onHealthyChange={(v) => setThresholds({ ...thresholds, rebookHealthy: v })}
            onCriticalChange={(v) => setThresholds({ ...thresholds, rebookCritical: v })}
          />
        </div>
      </div>

      {/* Section 5: Calendar Settings */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
        <h3 className="text-lg font-bold mb-6" style={{ fontFamily: FONT.serif, color: COLOR.ink }}>
          Calendar Settings
        </h3>
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-stone-600" style={{ fontFamily: FONT.sans }}>
            Working weeks per year:
          </label>
          <input
            type="number"
            value={50}
            className="w-20 px-3 py-2 rounded-xl bg-stone-50 border-2 border-transparent
              focus:border-violet-300 focus:bg-white focus:outline-none text-center font-semibold"
            style={{ fontFamily: FONT.sans }}
          />
        </div>
        <p className="mt-3 text-sm text-stone-500" style={{ fontFamily: FONT.sans }}>
          Accounts for PTO. Utilization goals will scale accordingly.
        </p>
      </div>
    </div>
  );
};

export default PracticeTab;
```

**Step 2: Add to barrel export**

```typescript
// components/configure-v2/index.ts
export * from './shared';
export * from './EditableRosterTable';
export * from './CliniciansTab';
export * from './InviteUserSlideOver';
export * from './UsersAccessTab';
export * from './PracticeTab';
```

**Step 3: Commit**

```bash
git add components/configure-v2/
git commit -m "feat(configure-v2): add PracticeTab with goals, thresholds, and settings"
```

---

## Task 6: Build ConnectionsTab with Service Mapping

**Files:**
- Create: `components/configure-v2/ServiceMapping.tsx`
- Create: `components/configure-v2/ConnectionsTab.tsx`

**Step 1: Create ServiceMapping component**

```typescript
// components/configure-v2/ServiceMapping.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';
import { FONT, COLOR, STATUS, StatusPill } from './shared';
import type { ServiceMapping, ServiceBucket, ServiceCategory } from './shared';

// =============================================================================
// MOCK DATA
// =============================================================================

const MOCK_SERVICES: ServiceMapping[] = [
  { id: 's1', name: 'Psychotherapy, 60 min', code: '90837', bucket: 'sessions', category: 'session' },
  { id: 's2', name: 'Psychotherapy, 45 min', code: '90834', bucket: 'sessions', category: 'session' },
  { id: 's3', name: 'Psychotherapy, 30 min', code: '90832', bucket: 'sessions', category: 'session' },
  { id: 's4', name: 'Psychiatric Diagnostic Evaluation', code: '90791', bucket: 'sessions', category: 'intake' },
  { id: 's5', name: 'Family psychotherapy, conjoint', code: '90847', bucket: 'sessions', category: 'session' },
  { id: 's6', name: 'Supervision for LMSW/MHC-LP', code: 'S100', bucket: 'other', category: 'supervision' },
  { id: 's7', name: 'Training Session', code: 'T100', bucket: 'excluded' },
  { id: 's8', name: 'New Therapy Code', code: '99999', bucket: 'sessions' }, // uncategorized
];

// =============================================================================
// TYPES
// =============================================================================

interface ServiceMappingProps {
  services?: ServiceMapping[];
  onUpdate?: (services: ServiceMapping[]) => void;
}

interface BucketConfig {
  id: ServiceBucket;
  label: string;
  description: string;
  color: string;
}

const BUCKETS: BucketConfig[] = [
  { id: 'sessions', label: 'Sessions', description: 'Counts toward completed sessions and utilization goals', color: STATUS.emerald },
  { id: 'cancellations', label: 'Cancellations', description: 'These count toward cancel rate', color: STATUS.rose },
  { id: 'other', label: 'Other Activities', description: "Tracked but don't count toward session goals", color: STATUS.amber },
  { id: 'excluded', label: 'Excluded', description: 'Hidden from all reports', color: COLOR.stone },
];

const CATEGORY_OPTIONS: { value: ServiceCategory | ''; label: string }[] = [
  { value: 'session', label: 'Session' },
  { value: 'intake', label: 'Intake' },
  { value: 'supervision', label: 'Supervision' },
  { value: 'admin', label: 'Admin' },
  { value: 'group', label: 'Group' },
  { value: 'other', label: 'Other' },
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const ServiceMappingComponent: React.FC<ServiceMappingProps> = ({
  services: propServices,
  onUpdate,
}) => {
  const [services, setServices] = useState<ServiceMapping[]>(propServices || MOCK_SERVICES);
  const [expandedBuckets, setExpandedBuckets] = useState<Set<ServiceBucket>>(new Set(['sessions']));

  // Find uncategorized services (in sessions/other but no category)
  const uncategorized = services.filter(
    (s) => (s.bucket === 'sessions' || s.bucket === 'other') && !s.category
  );

  // Group services by bucket
  const servicesByBucket = BUCKETS.reduce((acc, bucket) => {
    acc[bucket.id] = services.filter((s) => s.bucket === bucket.id);
    return acc;
  }, {} as Record<ServiceBucket, ServiceMapping[]>);

  // Update service
  const updateService = (id: string, updates: Partial<ServiceMapping>) => {
    const updated = services.map((s) => (s.id === id ? { ...s, ...updates } : s));
    setServices(updated);
    onUpdate?.(updated);
  };

  // Quick assign for uncategorized
  const quickAssign = (id: string, bucket: ServiceBucket) => {
    updateService(id, { bucket, category: bucket === 'sessions' ? 'session' : undefined });
  };

  // Toggle bucket expansion
  const toggleBucket = (bucket: ServiceBucket) => {
    setExpandedBuckets((prev) => {
      const next = new Set(prev);
      if (next.has(bucket)) {
        next.delete(bucket);
      } else {
        next.add(bucket);
      }
      return next;
    });
  };

  // Compute status
  const categorizedCount = services.filter((s) => s.bucket === 'excluded' || s.category).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold" style={{ fontFamily: FONT.serif, color: COLOR.ink }}>
            Service Mapping
          </h3>
          <p className="text-sm mt-1" style={{ fontFamily: FONT.sans, color: COLOR.muted }}>
            Categorize your EHR appointment types so metrics are calculated correctly
          </p>
        </div>
        <StatusPill
          assigned={categorizedCount}
          total={services.length}
          completeLabel="All categorized"
          incompleteLabel={`${services.length - categorizedCount} uncategorized`}
        />
      </div>

      {/* Uncategorized Section */}
      {uncategorized.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={16} className="text-amber-600" />
            <span className="text-sm font-semibold text-amber-800" style={{ fontFamily: FONT.sans }}>
              Uncategorized ({uncategorized.length} services)
            </span>
          </div>
          <div className="space-y-2">
            {uncategorized.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between p-3 rounded-lg bg-white border border-amber-100"
              >
                <div>
                  <span style={{ fontFamily: FONT.sans, fontSize: 14, color: COLOR.ink }}>
                    {service.name}
                  </span>
                  <span
                    className="ml-2 text-xs px-1.5 py-0.5 rounded bg-stone-100"
                    style={{ fontFamily: FONT.sans, color: COLOR.muted }}
                  >
                    {service.code}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => quickAssign(service.id, 'sessions')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
                    style={{ fontFamily: FONT.sans }}
                  >
                    Sessions
                  </button>
                  <button
                    onClick={() => quickAssign(service.id, 'other')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors"
                    style={{ fontFamily: FONT.sans }}
                  >
                    Other
                  </button>
                  <button
                    onClick={() => quickAssign(service.id, 'excluded')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
                    style={{ fontFamily: FONT.sans }}
                  >
                    Exclude
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Buckets */}
      <div className="space-y-4">
        {BUCKETS.map((bucket) => {
          const bucketServices = servicesByBucket[bucket.id];
          const isExpanded = expandedBuckets.has(bucket.id);

          return (
            <div key={bucket.id} className="bg-white rounded-xl border border-stone-100 overflow-hidden">
              {/* Bucket Header */}
              <button
                onClick={() => toggleBucket(bucket.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown size={16} className="text-stone-400" />
                  ) : (
                    <ChevronRight size={16} className="text-stone-400" />
                  )}
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: bucket.color }}
                  />
                  <span className="font-semibold" style={{ fontFamily: FONT.sans, fontSize: 14, color: COLOR.ink }}>
                    {bucket.label}
                  </span>
                  <span className="text-sm" style={{ fontFamily: FONT.sans, color: COLOR.faded }}>
                    ({bucketServices.length} services)
                  </span>
                </div>
                <span className="text-xs" style={{ fontFamily: FONT.sans, color: COLOR.muted }}>
                  {bucket.description}
                </span>
              </button>

              {/* Bucket Content */}
              <AnimatePresence>
                {isExpanded && bucketServices.length > 0 && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t" style={{ borderColor: COLOR.rule }}>
                      {/* Table Header */}
                      <div
                        className="grid px-4 py-2 bg-stone-50"
                        style={{ gridTemplateColumns: '1fr 100px 120px' }}
                      >
                        <span style={{ ...headerStyle }}>Service</span>
                        <span style={{ ...headerStyle }}>Code</span>
                        {(bucket.id === 'sessions' || bucket.id === 'other') && (
                          <span style={{ ...headerStyle }}>Category</span>
                        )}
                      </div>

                      {/* Services */}
                      {bucketServices.map((service) => (
                        <div
                          key={service.id}
                          className="grid items-center px-4 py-3 border-t hover:bg-stone-50/50"
                          style={{ gridTemplateColumns: '1fr 100px 120px', borderColor: COLOR.rule }}
                        >
                          <span style={{ fontFamily: FONT.sans, fontSize: 14, color: COLOR.ink }}>
                            {service.name}
                          </span>
                          <span
                            className="text-xs px-2 py-1 rounded bg-stone-100 w-fit"
                            style={{ fontFamily: FONT.sans, color: COLOR.muted }}
                          >
                            {service.code}
                          </span>
                          {(bucket.id === 'sessions' || bucket.id === 'other') && (
                            <select
                              value={service.category || ''}
                              onChange={(e) => updateService(service.id, { category: e.target.value as ServiceCategory || undefined })}
                              className="text-sm px-2 py-1 rounded-lg border border-stone-200 bg-white
                                focus:border-violet-400 focus:outline-none cursor-pointer"
                              style={{ fontFamily: FONT.sans }}
                            >
                              <option value="">Select...</option>
                              {CATEGORY_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Empty State */}
              {isExpanded && bucketServices.length === 0 && (
                <div className="px-4 py-6 text-center border-t" style={{ borderColor: COLOR.rule }}>
                  <span className="text-sm" style={{ fontFamily: FONT.sans, color: COLOR.faded }}>
                    No services in this category
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const headerStyle = {
  fontFamily: FONT.sans,
  fontSize: 11,
  fontWeight: 600,
  color: COLOR.stone,
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
};

export default ServiceMappingComponent;
```

**Step 2: Create ConnectionsTab**

```typescript
// components/configure-v2/ConnectionsTab.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Check, Wifi } from 'lucide-react';
import { FONT, COLOR, STATUS, SectionHeader, SectionDivider, StatusPill, ConfigCard } from './shared';
import type { EHRConnection, Clinician } from './shared';
import { MOCK_EHR, MOCK_EHR_OFFICES, MOCK_LOCATION_GROUPS } from './shared';
import { OfficeMapping, type LocationGroup, type RawEHROffice } from '../OfficeMapping';
import { ClinicianMapping } from '../ClinicianMapping';
import { ServiceMappingComponent } from './ServiceMapping';

// =============================================================================
// TYPES
// =============================================================================

interface ConnectionsTabProps {
  ehr?: EHRConnection;
  clinicians: Clinician[];
  onUpdateClinicians: (clinicians: Clinician[]) => void;
  onRefreshEHR?: () => void;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const ConnectionsTab: React.FC<ConnectionsTabProps> = ({
  ehr = MOCK_EHR,
  clinicians,
  onUpdateClinicians,
  onRefreshEHR,
}) => {
  const [locationGroups, setLocationGroups] = useState<LocationGroup[]>(MOCK_LOCATION_GROUPS);
  const [ehrOffices] = useState<RawEHROffice[]>(MOCK_EHR_OFFICES);
  const [showClinicianMapping, setShowClinicianMapping] = useState(false);

  // Format last sync time
  const formatSyncTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Compute location mapping status
  const assignedOffices = locationGroups.reduce((sum, g) => sum + g.ehrOfficeIds.length, 0);
  const totalOffices = ehrOffices.length;

  // Compute clinician mapping status
  const mappedClinicians = clinicians.filter((c) => c.ehrClinicianIds.length > 0).length;

  if (showClinicianMapping) {
    return (
      <div>
        <SectionHeader
          title="Clinician Mapping"
          subtitle="Map EHR clinician records to your team members"
          actions={
            <button
              onClick={() => setShowClinicianMapping(false)}
              className="text-sm font-medium text-violet-600 hover:text-violet-700"
              style={{ fontFamily: FONT.sans }}
            >
              Back to Connections
            </button>
          }
        />
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
          <ClinicianMapping
            ehrClinicians={[]}
            clinicians={clinicians}
            onUpdateClinicians={onUpdateClinicians}
            onBack={() => setShowClinicianMapping(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader
        title="Connections"
        subtitle="EHR sync, location mapping, and service configuration"
      />

      {/* Section 1: EHR Connection */}
      <ConfigCard className="mb-8">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
                <Wifi size={24} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold" style={{ fontFamily: FONT.serif, color: COLOR.ink }}>
                    {ehr.provider}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                    <Check size={12} />
                    Connected
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm" style={{ fontFamily: FONT.sans, color: COLOR.muted }}>
                    Last sync: {formatSyncTime(ehr.lastSync)}
                  </span>
                  <span className="text-sm" style={{ fontFamily: FONT.sans, color: COLOR.faded }}>
                    •
                  </span>
                  <span className="text-sm" style={{ fontFamily: FONT.sans, color: COLOR.muted }}>
                    {ehr.totalClients} clients
                  </span>
                  <span className="text-sm" style={{ fontFamily: FONT.sans, color: COLOR.faded }}>
                    •
                  </span>
                  <span className="text-sm" style={{ fontFamily: FONT.sans, color: COLOR.muted }}>
                    {ehr.totalClinicians} clinicians
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onRefreshEHR}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
                bg-stone-100 text-stone-700 font-medium text-sm
                hover:bg-stone-200 transition-colors"
              style={{ fontFamily: FONT.sans }}
            >
              <RefreshCw size={16} />
              Refresh Now
            </button>
          </div>
        </div>
      </ConfigCard>

      {/* Section 2: Location Mapping */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 mb-8 overflow-hidden">
        <div className="p-6 border-b" style={{ borderColor: COLOR.rule }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold" style={{ fontFamily: FONT.serif, color: COLOR.ink }}>
                Location Mapping
              </h3>
              <p className="text-sm mt-1" style={{ fontFamily: FONT.sans, color: COLOR.muted }}>
                Assign EHR offices to your practice locations
              </p>
            </div>
            <StatusPill
              assigned={assignedOffices}
              total={totalOffices}
              completeLabel="All assigned"
            />
          </div>
        </div>
        <div className="p-6">
          <OfficeMapping
            ehrOffices={ehrOffices}
            locationGroups={locationGroups}
            onUpdate={setLocationGroups}
          />
        </div>
      </div>

      {/* Section 3: Clinician Mapping */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 mb-8">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold" style={{ fontFamily: FONT.serif, color: COLOR.ink }}>
                Clinician Mapping
              </h3>
              <p className="text-sm mt-1" style={{ fontFamily: FONT.sans, color: COLOR.muted }}>
                Map EHR clinician records to team members
              </p>
            </div>
            <div className="flex items-center gap-4">
              <StatusPill
                assigned={mappedClinicians}
                total={clinicians.length}
                completeLabel="All mapped"
              />
              <button
                onClick={() => setShowClinicianMapping(true)}
                className="text-sm font-medium text-violet-600 hover:text-violet-700"
                style={{ fontFamily: FONT.sans }}
              >
                Manage Mapping
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Service Mapping */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
        <ServiceMappingComponent />
      </div>
    </div>
  );
};

export default ConnectionsTab;
```

**Step 3: Add to barrel export**

```typescript
// components/configure-v2/index.ts
export * from './shared';
export * from './EditableRosterTable';
export * from './CliniciansTab';
export * from './InviteUserSlideOver';
export * from './UsersAccessTab';
export * from './PracticeTab';
export * from './ServiceMapping';
export * from './ConnectionsTab';
```

**Step 4: Commit**

```bash
git add components/configure-v2/
git commit -m "feat(configure-v2): add ConnectionsTab with service mapping"
```

---

## Task 7: Build Main ConfigurePage

**Files:**
- Create: `components/configure-v2/ConfigurePage.tsx`

**Step 1: Create the main ConfigurePage with 4-tab structure**

```typescript
// components/configure-v2/ConfigurePage.tsx
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Shield, Target, Link2 } from 'lucide-react';
import { PageHeader, SegmentedControl } from '../design-system';
import type { SegmentedControlOption } from '../design-system/controls/SegmentedControl';
import { useSettings } from '../../context/SettingsContext';
import type { Clinician, UserAccess } from './shared';
import { MOCK_CLINICIANS } from './shared';
import { CliniciansTab } from './CliniciansTab';
import { UsersAccessTab } from './UsersAccessTab';
import { PracticeTab } from './PracticeTab';
import { ConnectionsTab } from './ConnectionsTab';

// =============================================================================
// TYPES
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

  // Users state (would come from settings in real app)
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

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-80px)] overflow-y-auto bg-gradient-to-b from-stone-100 to-stone-50">
      {/* Page Header */}
      <PageHeader accent="violet" showGridPattern title="Configure" />

      {/* Content Area */}
      <div className="flex flex-col flex-1 min-h-0 min-w-0 px-6 sm:px-8 lg:pl-[100px] lg:pr-12 py-6 lg:py-8">
        {/* Tab Switcher */}
        <div className="flex items-center gap-4 mb-8">
          <SegmentedControl<ConfigTab>
            options={CONFIG_TABS}
            value={activeTab}
            onChange={handleTabChange}
            size="md"
            ariaLabel="Configuration section"
          />
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
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
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ConfigurePage;
```

**Step 2: Add to barrel export**

```typescript
// components/configure-v2/index.ts
export * from './shared';
export * from './EditableRosterTable';
export * from './CliniciansTab';
export * from './InviteUserSlideOver';
export * from './UsersAccessTab';
export * from './PracticeTab';
export * from './ServiceMapping';
export * from './ConnectionsTab';
export * from './ConfigurePage';
```

**Step 3: Commit**

```bash
git add components/configure-v2/
git commit -m "feat(configure-v2): add main ConfigurePage with 4-tab structure"
```

---

## Task 8: Wire Up Routes and Test

**Files:**
- Modify: `App.tsx` or routes file (find the routing)

**Step 1: Find the routing configuration**

```bash
grep -r "PracticeConfigurationPage" --include="*.tsx" -l
```

**Step 2: Update routing to use new ConfigurePage**

Replace the import and route for `PracticeConfigurationPage` with:

```typescript
import { ConfigurePage } from './components/configure-v2';
// ... in routes:
<Route path="/configure" element={<ConfigurePage />} />
```

**Step 3: Verify in browser**

Run: `npm run dev`
Navigate to `/configure`
Expected: New 4-tab Configure page renders

**Step 4: Test each tab**
- Clinicians: Inline editing works, goal history expands
- Users & Access: Invite flow opens, role dropdown works
- Practice: Settings save with button
- Connections: EHR status shows, service mapping works

**Step 5: Commit**

```bash
git add .
git commit -m "feat(configure-v2): wire up new Configure page to routes"
```

---

## Task 9: Cleanup Old Configure Files

**Files:**
- Delete or comment out old files

**Step 1: Move old configure files to archive (safe approach)**

```bash
mkdir -p components/configure-v1-archive
mv components/configure/TeamMembersTab.tsx components/configure-v1-archive/
mv components/configure/TeamStructureTab.tsx components/configure-v1-archive/
mv components/configure/PracticeGoalsTab.tsx components/configure-v1-archive/
mv components/configure/ThresholdsTab.tsx components/configure-v1-archive/
mv components/configure/LocationsTab.tsx components/configure-v1-archive/
mv components/PracticeConfigurationPage.tsx components/configure-v1-archive/
```

**Step 2: Keep these files (still used)**
- `components/configure/GoalHistory.tsx` - used by CliniciansTab
- `components/configure/shared.tsx` - types and helpers
- `components/configure/ConsultationFlowTab.tsx` - for future
- `components/configure/EHRConnectionTab.tsx` - parts used
- `components/OfficeMapping.tsx` - used by ConnectionsTab
- `components/ClinicianMapping.tsx` - used by ConnectionsTab

**Step 3: Update barrel export**

```typescript
// components/configure/index.ts
export * from './shared';
export * from './GoalHistory';
// Remove exports for deleted files
```

**Step 4: Verify build**

```bash
npm run build
```

**Step 5: Commit**

```bash
git add .
git commit -m "chore: archive old configure components, keep shared utilities"
```

---

## Task 10: Final Polish and Push

**Step 1: Run linter**

```bash
npm run lint
```
Fix any issues.

**Step 2: Run type check**

```bash
npm run typecheck
```
Fix any issues.

**Step 3: Visual review in browser**

- Check all 4 tabs
- Test inline editing
- Verify animations are smooth
- Check mobile responsiveness

**Step 4: Final commit**

```bash
git add .
git commit -m "chore: lint fixes and final polish for configure-v2"
```

**Step 5: Push to remote**

```bash
git push origin main
```

---

## Summary

| Task | Files | Description |
|------|-------|-------------|
| 1 | `configure-v2/shared.tsx`, `index.ts` | Shared types, tokens, inline primitives |
| 2 | `EditableRosterTable.tsx` | Core inline-editing table |
| 3 | `CliniciansTab.tsx` | Merged Members + Goals |
| 4 | `UsersAccessTab.tsx`, `InviteUserSlideOver.tsx` | New access control |
| 5 | `PracticeTab.tsx` | Merged goals + thresholds |
| 6 | `ServiceMapping.tsx`, `ConnectionsTab.tsx` | EHR + mappings unified |
| 7 | `ConfigurePage.tsx` | Main 4-tab page |
| 8 | Routes | Wire up new page |
| 9 | Archive old files | Cleanup |
| 10 | Lint, test, push | Final polish |

Total estimated time: 60-90 minutes of focused implementation.
