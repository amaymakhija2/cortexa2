# Demo Data Generator System

The demo data generator creates realistic, internally consistent data for Cortexa demo environments. It enables sales and customer success teams to quickly configure demo scenarios that showcase the platform's capabilities.

## Architecture Overview

```
data/generators/
├── config/
│   ├── defaultConfig.ts    # Default configuration values
│   ├── presets.ts          # Built-in preset configurations
│   └── validators.ts       # Configuration validation & merging
├── generators/
│   ├── orchestrator.ts     # Main orchestrator - coordinates all generators
│   ├── clinicianGenerator.ts
│   ├── clientGenerator.ts
│   ├── clientRosterGenerator.ts
│   ├── sessionGenerator.ts
│   ├── paymentGenerator.ts
│   ├── revenueGenerator.ts
│   ├── consultationGenerator.ts
│   ├── retentionGenerator.ts
│   ├── analysisGenerator.ts
│   ├── adminGenerator.ts
│   └── priorityCardGenerator.ts
├── utils/
│   ├── random.ts           # Seeded random number generation
│   ├── dateUtils.ts        # Date manipulation utilities
│   └── nameGenerator.ts    # Realistic name generation
├── types.ts                # All TypeScript type definitions
└── index.ts                # Module exports
```

## Quick Start

### Using the Context (Recommended)

The easiest way to use the demo system is through the React context:

```tsx
import { useDemoData, useDemoStatus } from './context/DemoContext';

function MyComponent() {
  const demoData = useDemoData();
  const { isLoading, error } = useDemoStatus();

  if (isLoading) return <Loading />;
  if (!demoData) return null;

  return <div>{demoData.clinicians.length} clinicians</div>;
}
```

### Direct Generator Usage

For testing or server-side usage:

```typescript
import { generateDemoData } from './data/generators';
import { DEFAULT_CONFIG } from './data/generators/config/defaultConfig';
import { validateAndApplyDefaults } from './data/generators/config/validators';

// Generate with default config
const data = generateDemoData(DEFAULT_CONFIG);

// Generate with custom config
const customConfig = validateAndApplyDefaults({
  practice: { name: 'My Practice' },
  performance: { narrative: 'thriving' },
});
const customData = generateDemoData(customConfig);
```

## Configuration

### DemoConfiguration Structure

```typescript
interface DemoConfiguration {
  id: string;
  name: string;
  description: string;

  practice: PracticeIdentity;     // Practice name, location, specialty
  clinicians: ClinicianConfig[];  // Staff configuration
  financial: FinancialConfig;     // Revenue targets, rates, payer mix
  performance: PerformanceStory;  // Metrics and trends

  dataRange: DataRange;           // Date range for generated data
  randomSeed?: number;            // For reproducible generation
  features: FeatureFlags;         // Feature toggles
}
```

### Practice Identity

```typescript
interface PracticeIdentity {
  name: string;           // "Clarity Counseling Center"
  shortName: string;      // "Clarity"
  location: {
    city: string;
    state: string;
    region: string;       // Northeast, Southeast, Midwest, etc.
  };
  specialty: PracticeSpecialty;  // general, anxiety, couples, etc.
  yearEstablished: number;
}
```

### Clinician Configuration

Each clinician has a performance profile that affects their generated metrics:

```typescript
interface ClinicianConfig {
  id: string;
  firstName: string;
  lastName: string;
  credential: CredentialType;  // PhD, LCSW, LPC, etc.
  title: string;
  role: ClinicianRole;         // owner, senior, staff, associate

  performanceProfile: {
    revenueLevel: 'high' | 'medium' | 'low';
    retentionStrength: 'strong' | 'average' | 'weak';
    consultationConversion: 'high' | 'medium' | 'low';
    notesCompliance: 'excellent' | 'good' | 'needs_work';
  };

  caseload: {
    targetClients: number;
    currentClients: number;
    sessionGoal: number;
    takeRate: number;
  };

  supervisorId?: string;  // For associates
  startDate: string;
  isActive: boolean;
  location: string;
}
```

### Performance Story

The narrative drives the overall metrics and trends:

```typescript
type PerformanceNarrative =
  | 'thriving'      // Everything going well
  | 'growth_phase'  // Expanding with growing pains
  | 'stable'        // Steady state
  | 'struggling'    // Retention/revenue challenges
  | 'turnaround'    // Was struggling, now improving
  | 'seasonal_dip'; // Temporary slow period

interface PerformanceStory {
  narrative: PerformanceNarrative;
  metrics: PerformanceMetrics;
  seasonality: Seasonality;
  trend: 'improving' | 'stable' | 'declining';
}
```

## Built-in Presets

Six presets are available out of the box:

| Preset | Description | Key Characteristics |
|--------|-------------|---------------------|
| `default` | Stable medium practice | Brooklyn, 5 clinicians, balanced metrics |
| `thriving` | High-performing practice | San Francisco, excellent retention, high conversion |
| `growing` | Rapidly expanding | Austin, high volume, admin backlog |
| `struggling` | Facing challenges | Cleveland, high churn, low conversion |
| `solo` | Single practitioner | Denver, trauma specialty, focused metrics |
| `turnaround` | Recovering practice | Portland, improving trends |

### Loading a Preset

Via URL parameter:
```
https://app.cortexa.com?demo=thriving
```

Via the context:
```typescript
const { loadPreset } = useDemoContext();
loadPreset('struggling');
```

## Generated Data Structure

The `DemoData` output includes:

```typescript
interface DemoData {
  config: DemoConfiguration;
  generatedAt: string;

  // Core entities
  clinicians: Clinician[];
  clinicianSyntheticMetrics: Record<string, ClinicianSyntheticMetrics>;

  // Financial data
  paymentData: PaymentRecord[];
  practiceSettings: PracticeSettings;

  // Monthly aggregations
  monthlyData: {
    revenue: MonthlyRevenueData[];
    revenueBreakdown: MonthlyRevenueBreakdownData[];
    sessions: MonthlySessionsData[];
    clinicianSessions: ClinicianSessionsData[];
    clinicianRevenue: ClinicianRevenueData[];
    clientGrowth: MonthlyClientGrowthData[];
    consultations: MonthlyConsultationsData[];
    consultationsByClinician: MonthlyConsultationsByClinicianData[];
    churn: MonthlyChurnData[];
    churnByClinician: MonthlyChurnByClinicianData[];
    notesStatus: NotesStatusData[];
    claimsStatus: ClaimsStatusData[];
    arAging: ARAgingData[];
    reminderDelivery: ReminderDeliveryData[];
  };

  // Client data
  clients: {
    roster: ClientRosterEntry[];
    atRisk: AtRiskClient[];
    approachingMilestone: MilestoneClient[];
    recentlyChurned: ClientRosterEntry[];
    demographics: {...};
  };

  // Consultation CRM
  consultations: {
    pipeline: Consultation[];
    sources: ConsultationSource[];
    funnel: ConsultationFunnel;
    pipelineStatus: ConsultationPipeline;
  };

  // Retention analytics
  retention: {
    cohorts: RetentionCohort[];
    funnels: RetentionFunnelData;
    benchmarks: RetentionBenchmarks;
    frequencyCorrelation: FrequencyRetentionData[];
    cohortLTV: CohortLTVData;
  };

  // Admin health
  admin: {
    complianceRisks: ComplianceRisk[];
    topPastDue: TopPastDueClient[];
    outstandingClaims: {...}[];
  };

  // Priority insights
  priorityCards: PriorityCard[];

  // Session timing heatmap
  sessionTiming: SessionTimingData[];
}
```

## Demo Manager Panel

Access the Demo Manager panel with `Ctrl+Shift+D` (or via the UI).

Features:
- **Quick Presets**: One-click loading of built-in scenarios
- **Practice Editor**: Customize practice name, location, specialty
- **Clinician Editor**: Add/remove/edit clinicians with performance profiles
- **Financial Editor**: Adjust revenue targets, rates, payer mix
- **Performance Editor**: Set narrative, trend, and key metrics
- **Export/Import**: Save and share configurations as JSON files

## Extending the System

### Adding a New Preset

Add to `data/generators/config/presets.ts`:

```typescript
const MY_PRESET_CONFIG: Partial<DemoConfiguration> = {
  name: 'My Custom Preset',
  practice: { ... },
  clinicians: [ ... ],
  financial: { ... },
  performance: { ... },
};

// Add to BUILT_IN_PRESETS array
{
  id: 'my-preset',
  name: 'My Preset',
  description: 'Description here',
  config: MY_PRESET_CONFIG,
  isBuiltIn: true,
}
```

Then update `PresetSelector.tsx` with matching icon/colors.

### Adding a New Generator

1. Create the generator in `generators/`:
```typescript
// generators/myGenerator.ts
import type { DemoConfiguration, MyDataType } from '../types';
import { SeededRandom } from '../utils/random';

export function generateMyData(
  config: DemoConfiguration,
  random: SeededRandom
): MyDataType[] {
  // Generation logic
}
```

2. Add types to `types.ts`

3. Call from orchestrator and add to `DemoData` interface

### Reproducible Generation

Use the `randomSeed` config option for reproducible output:

```typescript
const config = validateAndApplyDefaults({
  randomSeed: 12345,
});
// Will generate identical data each time
```

## Performance

- Generation typically completes in 50-150ms
- DemoManagerPanel is lazy-loaded (29 kB separate chunk)
- Data is memoized and only regenerates on config changes

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+D` | Toggle Demo Manager panel |
