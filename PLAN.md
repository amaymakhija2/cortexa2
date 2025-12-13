# Plan: Centralize Clinician Names

## Problem
Clinician names are scattered across 7+ files with inconsistent formats:
- Some use 5 clinicians, some use 17
- Formats vary: "Sarah Chen" vs "Sarah M" vs "Dr. Sarah Chen" vs "Chen"
- No single source of truth

## Solution: Create a Master Clinicians File

### Step 1: Create `/data/clinicians.ts` - The Single Source of Truth

```typescript
// Master clinician list - ALL other files import from here
export interface Clinician {
  id: string;
  name: string;           // Full name: "Sarah Chen"
  shortName: string;      // First + Initial: "Sarah C"
  lastName: string;       // Just last name: "Chen"
  initials: string;       // "SC"
  color: string;          // Brand color for charts
  title: string;          // "Licensed Clinical Psychologist"
  role: string;           // "Clinical Director"
}

export const CLINICIANS: Clinician[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    shortName: 'Sarah C',
    lastName: 'Chen',
    initials: 'SC',
    color: '#a855f7',
    title: 'Licensed Clinical Psychologist',
    role: 'Clinical Director',
  },
  {
    id: '2',
    name: 'Maria Rodriguez',
    shortName: 'Maria R',
    lastName: 'Rodriguez',
    initials: 'MR',
    color: '#06b6d4',
    title: 'Licensed Clinical Social Worker',
    role: 'Senior Therapist',
  },
  // ... etc for all clinicians
];

// Helper functions
export const getClinicianById = (id: string) => CLINICIANS.find(c => c.id === id);
export const getClinicianByName = (name: string) => CLINICIANS.find(c => c.name === name || c.shortName === name);
```

### Step 2: Decide on Clinician Count

**Option A: Keep 5 clinicians** (simpler, matches current UI mock data)
- Sarah Chen
- Maria Rodriguez
- Priya Patel
- James Kim
- Michael Johnson

**Option B: Expand to 17 clinicians** (matches payment data volume)
- Would need to add 12 more clinicians to all UI components

**Recommendation: Option A (5 clinicians)** - Regenerate payment data to only use these 5.

### Step 3: Files to Update

| File | Change |
|------|--------|
| `data/clinicians.ts` | CREATE - master list |
| `data/paymentData.ts` | Regenerate with 5 clinicians from master |
| `data/priorityCardsData.ts` | Import names from master, update all hardcoded names |
| `context/SettingsContext.tsx` | Remove DEMO_NAMES mapping (no longer needed) |
| `components/ClinicianDetailsTab.tsx` | Import from master, delete MOCK_CLINICIANS |
| `components/PracticeConfigurationPage.tsx` | Import from master, delete MOCK_CLINICIANS |
| `components/ClientRoster.tsx` | Import from master, delete local CLINICIANS |
| `components/PracticeAnalysis.tsx` | Import from master, use lastName for charts |

### Step 4: Update Synthetic Data Generator

Modify `scripts/generateSyntheticData.cjs` to:
1. Import the 5 clinicians from master list
2. Distribute payment records across only these 5 clinicians
3. Keep same total record count (~11,331) but reassign clinician IDs

### Step 5: Fix Priority Cards

Update `data/priorityCardsData.ts` to use consistent names:
- Replace "Rachel K" → use actual clinician from master
- Replace "Maria G" → "Maria R" (Maria Rodriguez)
- Replace "Jasmine W" → use actual clinician
- etc.

## Execution Order

1. Create `data/clinicians.ts` with 5 clinicians
2. Update `generateSyntheticData.cjs` to use master list
3. Regenerate `paymentData.ts`
4. Update `priorityCardsData.ts` to use master names
5. Update `ClinicianDetailsTab.tsx` to import from master
6. Update `PracticeConfigurationPage.tsx` to import from master
7. Update `ClientRoster.tsx` to import from master
8. Update `PracticeAnalysis.tsx` to import from master
9. Remove/simplify `SettingsContext.tsx` DEMO_NAMES
10. Test the app
