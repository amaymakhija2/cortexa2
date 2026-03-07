# Configure Page Revamp - Design Document

**Date:** 2026-03-07
**Status:** Approved

## Overview

Complete rebuild of the Configure page from 7 tabs to 4 tabs, with inline editing and a refined "Ledger" aesthetic. The goal is to create a configuration experience that feels like editing a beautifully designed financial ledger - every detail intentional, nothing wasted.

## Design Direction: "The Ledger"

Editorial refinement meets modern data density. Key principles:
- Typography hierarchy from RankingTable DNA (Tiempos Headline serif for names, Suisse Intl sans for data)
- Inline editing that feels native, not bolted-on
- Visual states that communicate clearly (hover, focus, saved)
- Warm stone palette with purposeful accent colors (violet primary, amber for attention, emerald for success)

## Architecture

### Tab Structure

| Tab | Content | Source |
|-----|---------|--------|
| Clinicians | Roster table with inline editing for license, role, supervision, goals | Merge: Members + Clinician Goals |
| Users & Access | Access control, invite flow, revenue permissions | New |
| Practice | Goals + definitions + thresholds in stacked sections | Merge: Practice Goals + Thresholds |
| Connections | EHR status + Location mapping + Service mapping | Merge: EHR + Locations + new Service Mapping |

### Component Hierarchy

```
ConfigurePage.tsx (new)
├── PageHeader (existing, accent="violet")
├── SegmentedControl (4 tabs)
└── Tab Content
    ├── CliniciansTab.tsx (new)
    │   ├── Header with StatusPill + "Manage EHR Mapping" button
    │   └── EditableRosterTable.tsx (new core component)
    │       ├── Inline dropdowns (License, Role, Supervisor)
    │       ├── Inline number inputs (Sessions Goal, Clients Goal)
    │       ├── Status toggle (Active/Inactive)
    │       └── Row expansion for Goal History
    │
    ├── UsersAccessTab.tsx (new)
    │   ├── Header with "Invite User" button
    │   ├── UserTable (similar structure to roster)
    │   └── InviteUserSlideOver (new)
    │
    ├── PracticeTab.tsx (new)
    │   ├── Section 1: Practice Goals (3 ConfigCards in a row)
    │   ├── Section 2: Client Definitions (radio + threshold inputs)
    │   ├── Section 3: Session & Compliance Rules
    │   ├── Section 4: Performance Bands (sliders)
    │   └── Section 5: Calendar Settings
    │
    └── ConnectionsTab.tsx (new)
        ├── Section 1: EHR Connection (single status card)
        ├── Section 2: Location Mapping (existing OfficeMapping)
        ├── Section 3: Clinician Mapping (existing, inline)
        └── Section 4: Service Mapping (new, 4-bucket system)
```

## Core Component: EditableRosterTable

The heart of the Clinicians tab. A table that supports inline editing while maintaining the editorial aesthetic.

### Features

1. **Inline Editing**
   - Click any editable cell to activate edit mode
   - Dropdowns for: License, Role, Supervisor
   - Number inputs for: Sessions Goal, Clients Goal
   - Toggle for: Active/Inactive status
   - Blur or Enter to save, Escape to cancel

2. **Visual States**
   - Default: Data displayed cleanly
   - Hover: Subtle border appears, cursor changes to indicate editability
   - Focus: Clear input boundary, accent color ring
   - Saving: Brief pulse animation
   - Saved: Emerald checkmark flash (200ms)

3. **Smart Behaviors**
   - License change to LMSW/MHC-LP auto-flags supervision requirement
   - Role change to Supervisor makes person available in others' supervisor dropdowns
   - Inactive clinicians dim (35% opacity) and sink to bottom
   - Keyboard navigation: Tab through cells

4. **Row Actions**
   - Chevron to expand inline goal history
   - Full GoalHistoryModal accessible from expanded view

### Column Definitions

| Column | Type | Width | Behavior |
|--------|------|-------|----------|
| # | Static | 44px | Rank number (from RankingTable) |
| Clinician | Static | 200px | Name + "Since {date}" subtitle |
| License | Dropdown | 100px | LCSW, LMSW, LMHC, MHC-LP, etc. |
| Role | Dropdown | 140px | Clinician Only, Clinician and Supervisor, Supervisor Only |
| Supervision | Dropdown/Chip | 150px | "Independent" or supervisor name, amber "Assign" if needed |
| Sessions Goal | Number Input | 100px | Value + "/wk" suffix, shows delta on hover |
| Clients Goal | Number Input | 80px | Just the number |
| Status | Toggle | 80px | Active/Inactive pill |
| Actions | Icon | 44px | Chevron for expand |

## Typography & Styling

### Font Stack (from RankingTable)
```typescript
const FONT = {
  serif: "'Tiempos Headline', Georgia, serif",  // Names, section titles
  sans: "'Suisse Intl', sans-serif",            // Data, labels, UI
};
```

### Color Palette (from design system)
```typescript
const COLOR = {
  ink: '#1c1917',      // Primary text
  dark: '#292524',     // Headers, borders
  body: '#44403c',     // Body text
  muted: '#57534e',    // Secondary text
  stone: '#78716c',    // Tertiary text
  faded: '#a8a29e',    // Disabled, hints
  rule: '#e7e5e4',     // Borders, dividers
  dashed: '#D6D3D1',   // Dashed lines
};

const STATUS = {
  emerald: '#10b981',  // Success, independent, healthy
  amber: '#f59e0b',    // Warning, needs attention
  rose: '#ef4444',     // Error, critical
  violet: '#8b5cf6',   // Configure accent
};
```

### Input Styles
```css
/* Inline input - blends with table until focused */
.inline-input {
  background: transparent;
  border: 1px solid transparent;
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--color-ink);
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 150ms;
}

.inline-input:hover {
  border-color: var(--color-rule);
  background: rgba(0, 0, 0, 0.02);
}

.inline-input:focus {
  border-color: var(--color-violet);
  background: white;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  outline: none;
}
```

## Files to Create

| File | Purpose |
|------|---------|
| `components/configure-v2/ConfigurePage.tsx` | Main page with 4-tab structure |
| `components/configure-v2/CliniciansTab.tsx` | Merged clinician roster |
| `components/configure-v2/UsersAccessTab.tsx` | Access control |
| `components/configure-v2/PracticeTab.tsx` | Merged practice settings |
| `components/configure-v2/ConnectionsTab.tsx` | EHR + mappings |
| `components/configure-v2/EditableRosterTable.tsx` | Core inline-editing table |
| `components/configure-v2/InviteUserSlideOver.tsx` | User invite flow |
| `components/configure-v2/ServiceMapping.tsx` | 4-bucket service categorization |
| `components/configure-v2/shared.tsx` | Shared types, constants, utilities |
| `components/configure-v2/index.ts` | Barrel export |

## Files to Delete (after migration)

| File | Reason |
|------|--------|
| `components/configure/TeamMembersTab.tsx` | Absorbed into CliniciansTab |
| `components/configure/TeamStructureTab.tsx` | Supervision now inline |
| `components/configure/PracticeGoalsTab.tsx` | Absorbed into PracticeTab |
| `components/configure/ThresholdsTab.tsx` | Absorbed into PracticeTab |
| `components/configure/LocationsTab.tsx` | Absorbed into ConnectionsTab |
| `components/PracticeConfigurationPage.tsx` | Replaced by configure-v2/ConfigurePage |

## Files to Keep/Modify

| File | Action |
|------|--------|
| `components/configure/GoalHistory.tsx` | Keep - used by CliniciansTab |
| `components/configure/ConsultationFlowTab.tsx` | Comment out - not ready |
| `components/configure/EHRConnectionTab.tsx` | Simplify and embed in ConnectionsTab |
| `components/OfficeMapping.tsx` | Keep - embed in ConnectionsTab |
| `components/ClinicianMapping.tsx` | Keep - embed in ConnectionsTab |
| `components/design-system/RankingTable.tsx` | Keep unchanged - used elsewhere |

## State Management

### Settings Context Extensions

```typescript
// Add to SettingsContext
interface UserAccess {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'supervisor' | 'viewer';
  revenueAccess: boolean;
  supervisees?: string[]; // clinician IDs for supervisor role
  status: 'active' | 'pending';
}

interface ServiceMapping {
  serviceId: string;
  name: string;
  code: string;
  bucket: 'sessions' | 'cancellations' | 'other' | 'excluded';
  category?: 'session' | 'intake' | 'supervision' | 'admin' | 'group' | 'other';
}

interface Settings {
  // ... existing
  users: UserAccess[];
  serviceMappings: ServiceMapping[];
  calendarSettings: {
    workingWeeksPerYear: number;
  };
}
```

## Smart Behaviors

1. **Clinicians <-> Supervision**
   - License change to LMSW/MHC-LP: Supervision chip switches to amber "Assign supervisor"
   - Role change to include Supervisor: Person appears in others' supervisor dropdowns

2. **Clinicians <-> Users & Access**
   - Setting role to "Clinician and Supervisor" suggests updating User role if they have an account

3. **Practice <-> Clinicians**
   - Practice session goals show computed hint: "Your 5 clinicians have combined weekly goals of 160 sessions"

4. **Connections -> Everything**
   - Service mapping determines which appointments count as "sessions"
   - Info tooltip explains impact on metrics

## Animation Principles

- **Transitions:** 150ms for micro-interactions, 300ms for state changes
- **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)` for smooth deceleration
- **Hover:** Subtle border/background reveal
- **Focus:** Ring with accent color
- **Save confirmation:** Brief emerald pulse, then fade
- **Row expand:** Smooth height animation with content fade-in

## Accessibility

- Full keyboard navigation (Tab, Enter, Escape, Arrow keys in dropdowns)
- ARIA labels on all interactive elements
- Focus visible states
- Screen reader announcements for save confirmations
- Sufficient color contrast (WCAG AA)

## Success Criteria

1. All 4 tabs functional with inline editing
2. Settings persist to localStorage via SettingsContext
3. Smart behaviors work as specified
4. Keyboard navigation complete
5. Mobile-responsive (table scrolls horizontally on small screens)
6. No visual regressions to existing design system
7. RankingTable remains unchanged for use in ClinicianOverview
