# Cortexa Design System

## Philosophy

Cortexa has two related but distinct design directions that coexist in the application.

---

### Direction 1: "Monocle Magazine meets Editorial Data Journalism"

**Used in:** Analysis pages, dashboards, charts, client rosters

Draws from premium financial publications — The Economist, Bloomberg, luxury annual reports. The interface feels like a beautifully designed magazine spread presenting practice insights.

**Characteristics:**
- **Dark header / light body** — Magazine cover over article content
- **Insight-first hierarchy** — Findings lead, not labels
- **Accent glow system** — Colored radial glows (amber, emerald, cyan) create ambient depth
- **Editorial confidence** — Bold headlines, purposeful whitespace
- **Amber as primary accent** — Energetic, modern warmth

**Key components:** PageHeader, StatCard, ChartCard, InsightCard, ExecutiveSummary, RankingTable

---

### Direction 2: "The Accountant's Ledger"

**Used in:** Configure pages, inline editing, data entry, settings

**Defined in:** `components/configure-v2/shared.tsx`

Editorial precision meets analog warmth. Every interaction feels like writing with a fountain pen — smooth, intentional, permanent. The serif typography gives gravitas. The gold accents whisper luxury without shouting.

**Characteristics:**
- **Ink, Paper, and Gold Leaf** — Not generic grays, but warm tones that feel like a real ledger
- **The Fountain Pen** — Editing should feel fluid, precise, permanent
- **Gold as primary accent** — Muted, antiquarian luxury (not bright amber)
- **Ruled lines** — Dividers feel like ruled ledger paper
- **Rubber stamps** — Status toggles are clear, decisive, final
- **Paper lift** — Shadows make elements feel like they're lifting off the page
- **Ink flow** — Animations feel organic, like ink spreading on paper

**Key components:** LedgerTable, LedgerCard, InlineInput, InlineSelect, TogglePill, SectionHeader

---

### Shared Foundation

Both directions share:
- **Typography:** Tiempos Headline (serif) + Suisse Intl (sans)
- **Warm color temperature:** Stone/ink tones, never clinical grays
- **PageHeader component:** Dark headers provide visual continuity across all pages

---

## Typography

The type system uses three font families:

| Role | Font | Usage |
|------|------|-------|
| **Display** | `'Tiempos Headline', Georgia, serif` | Page titles, card headlines, names, key metrics |
| **UI** | `'Suisse Intl', system-ui, sans-serif` | Labels, body text, buttons, navigation |
| **Mono** | `'Suisse Intl Mono', 'SF Mono', monospace` | Numbers in tables, data values, code |

### Type Scale

| Element | Size | Weight | Font |
|---------|------|--------|------|
| Page title | `clamp(1.75rem, 4vw, 2.5rem)` | 400 | Tiempos |
| Section header | 28px | 400 | Tiempos |
| Card headline | 18px | 400 | Tiempos |
| Table name | 17-18px | 400 | Tiempos |
| Body text | 14px | 400-500 | Suisse |
| Labels | 11-12px | 500-600 | Suisse |
| Micro labels | 10px | 600-700 | Suisse, uppercase |

---

## Color System

The palette is built around **warm ink tones** — deliberately warmer than standard gray scales.

### Ink Palette (Text & Borders)

| Token | Hex | Usage |
|-------|-----|-------|
| `ink` / `black` | `#1a1815` – `#1c1917` | Darkest text, primary headlines |
| `dark` | `#292524` – `#2d2a26` | Dark backgrounds, headers |
| `body` | `#3d3a35` – `#44403c` | Body text |
| `muted` | `#57534e` – `#5c5850` | Secondary text |
| `stone` | `#78716c` | Tertiary text |
| `faded` / `ghost` | `#8a8579` – `#b5b0a6` | Disabled, hints |
| `rule` | `#e7e5e4` – `#e8e5df` | Dividers, borders |
| `cream` | `#f7f5f2` | Subtle backgrounds |
| `paper` | `#fdfcfa` | Card backgrounds |

### Accent Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Amber** | `#f59e0b` | Primary accent (analysis pages), active states, energy |
| **Gold** | `#c9a227` | Configure accent, focus rings, "gold leaf" luxury feel |
| **Emerald** | `#047857` | Success, positive trends, confirmations |
| **Rose** | `#be123c` | Errors, negative trends, at-risk |
| **Violet** | `#7c3aed` | Configure header, comparison views |
| **Cyan** | `#0891b2` | Growth, pipeline |

### Status Colors

| Status | Primary | Light Background |
|--------|---------|------------------|
| Positive | `#047857` (emerald) | `#d1fae5` |
| Warning | `#b45309` (amber) | `#fef3c7` |
| Negative | `#be123c` (rose) | `#ffe4e6` |
| Neutral | `#78716c` (stone) | `#f5f5f4` |

### Data Visualization Palette

For charts with multiple clinicians or data series:

```javascript
const CLINICIAN_COLORS = [
  { color: '#7c3aed', gradient: 'linear-gradient(180deg, #a78bfa 0%, #7c3aed 100%)' }, // violet
  { color: '#0891b2', gradient: 'linear-gradient(180deg, #22d3ee 0%, #0891b2 100%)' }, // cyan
  { color: '#d97706', gradient: 'linear-gradient(180deg, #fbbf24 0%, #d97706 100%)' }, // amber
  { color: '#db2777', gradient: 'linear-gradient(180deg, #f472b6 0%, #db2777 100%)' }, // pink
  { color: '#059669', gradient: 'linear-gradient(180deg, #34d399 0%, #059669 100%)' }, // emerald
];
```

---

## Layout Pattern

### Dark Header / Light Body

Every page follows a consistent vertical structure:

```
┌─────────────────────────────────────────┐
│  DARK HEADER (stone-900 gradient)       │
│  - Accent glow (radial, 8% opacity)     │
│  - Optional grid pattern overlay        │
│  - Page title (Tiempos, white)          │
│  - Navigation tabs                      │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  LIGHT BODY (cream → paper gradient)    │
│  - White cards with subtle shadows      │
│  - Content sections                     │
│                                         │
└─────────────────────────────────────────┘
```

### Header Background
```css
background: linear-gradient(135deg, #1c1917 0%, #292524 50%, #1c1917 100%);
```

### Body Background
```css
background: linear-gradient(180deg, #f7f5f2 0%, #fdfcfa 100%);
```

### Accent Glow
Each page has a colored radial glow in the header:
```css
background: radial-gradient(
  ellipse 80% 50% at 50% 100%,
  rgba({accent}, 0.08) 0%,
  transparent 70%
);
```

### Grid Pattern Overlay
Optional subtle grid texture on dark headers:
```css
background-image:
  linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
  linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px);
background-size: 32px 32px;
```

### Container Padding
```css
padding: 1.5rem;                    /* px-6 */
padding: 2rem;                      /* sm:px-8 */
padding-left: 100px;                /* lg:pl-[100px] - accounts for sidebar */
padding-right: 3rem;                /* lg:pr-12 */
padding-top: 1.5rem;                /* py-6 */
padding-bottom: 2rem;               /* lg:py-8 */
```

---

## Grid System

### Column Layouts
```jsx
<Grid cols={4}>  {/* Hero stats row */}
<Grid cols={3}>  {/* Component cards */}
<Grid cols={2}>  {/* Charts side by side */}
```

### Gap Sizes
| Prop | Size |
|------|------|
| `gap="sm"` | 12px |
| `gap="md"` | 16px (default) |
| `gap="lg"` | 24px |

---

## Components

### Cards

**Standard Card**
```css
background: #ffffff;
border-radius: 16px;
box-shadow:
  0 1px 2px rgba(26, 24, 21, 0.03),
  0 4px 12px rgba(26, 24, 21, 0.04),
  0 0 0 1px rgba(26, 24, 21, 0.04);
```

**Accent Ribbon**
Cards can have a 4px accent bar at top:
```css
background: linear-gradient(90deg, {accent} 0%, {accentLight} 100%);
```

### Tables (Ledger Style)

Tables follow the "ledger" aesthetic:
- **Header row**: 2px solid bottom border, uppercase labels
- **Data rows**: 1px ruled lines, 64px min-height
- **Rank column**: Serif numbers, gold highlight for #1
- **Hover state**: Cream background (`#f7f5f2`)
- **Footer**: Dashed top border, count summaries

### Inputs (Fountain Pen Style)

Inline editing should feel like writing:
- **Resting state**: Transparent background, subtle underline on hover
- **Focus state**: Paper white background, gold border, lifted shadow
- **Confirmation**: Emerald checkmark stamp animation

```css
/* Focus state */
border: 1.5px solid #c9a227;
background: #fdfcfa;
box-shadow:
  0 0 0 3px rgba(201, 162, 39, 0.15),
  0 2px 8px rgba(201, 162, 39, 0.2);
```

### Buttons

**Primary (Emerald)**
```css
background: linear-gradient(135deg, #047857 0%, #065f46 100%);
box-shadow: 0 4px 12px rgba(4, 120, 87, 0.3);
```

**Secondary (Stone)**
```css
background: #f7f5f2;
box-shadow: 0 2px 8px rgba(26, 24, 21, 0.08);
```

### Status Pills

Small rounded indicators:
```css
font-size: 11px;
font-weight: 600;
padding: 5px 12px;
border-radius: 20px;
```

---

## Shadows

| Name | CSS | Usage |
|------|-----|-------|
| **Lift** | `0 1px 2px rgba(26,24,21,0.04), 0 4px 8px rgba(26,24,21,0.04), 0 8px 16px rgba(26,24,21,0.02)` | Hover states |
| **Raised** | `0 2px 4px rgba(26,24,21,0.06), 0 8px 16px rgba(26,24,21,0.06), 0 16px 32px rgba(26,24,21,0.04)` | Focus, modals |
| **Gold Focus** | `0 0 0 3px rgba(201,162,39,0.15), 0 2px 8px rgba(201,162,39,0.2)` | Active editing |
| **Confirm** | `0 0 0 2px rgba(4,120,87,0.2), 0 0 12px rgba(4,120,87,0.15)` | Success states |

---

## Animation

### Timing
- **Standard**: 300ms
- **Fast**: 150-200ms
- **Slow**: 500-700ms (page transitions, reveals)

### Easing
```javascript
ease: [0.16, 1, 0.3, 1]  // Smooth deceleration
spring: { stiffness: 400, damping: 30 }  // Bouncy entrance
settle: { stiffness: 300, damping: 25 }  // Gentle settle
```

### Patterns
- **Hover lift**: `transform: translateY(-1px)` or `scale(1.01)`
- **Click feedback**: `scale(0.98)`
- **Staggered reveals**: 30ms delay per item
- **Confirmation stamps**: Scale in with spring, fade out

---

## Token Reference

### Defined in `configure-v2/shared.tsx`
```typescript
export const FONT = {
  serif: "'Tiempos Headline', 'Freight Display', Georgia, serif",
  sans: "'Suisse Intl', 'Söhne', -apple-system, sans-serif",
  mono: "'Suisse Intl Mono', 'SF Mono', 'Consolas', monospace",
};

export const INK = {
  black: '#1a1815',
  dark: '#2d2a26',
  body: '#3d3a35',
  muted: '#5c5850',
  faded: '#8a8579',
  ghost: '#b5b0a6',
  rule: '#e8e5df',
  cream: '#f7f5f2',
  paper: '#fdfcfa',
  gold: '#c9a227',
  goldMuted: '#d4b85c',
  goldGlow: 'rgba(201, 162, 39, 0.15)',
  emerald: '#047857',
  emeraldLight: '#d1fae5',
  amber: '#b45309',
  amberLight: '#fef3c7',
  rose: '#be123c',
  roseLight: '#ffe4e6',
  violet: '#7c3aed',
  violetGlow: 'rgba(124, 58, 237, 0.12)',
};

export const SHADOW = {
  lift: '0 1px 2px rgba(26,24,21,0.04), 0 4px 8px rgba(26,24,21,0.04), 0 8px 16px rgba(26,24,21,0.02)',
  raised: '0 2px 4px rgba(26,24,21,0.06), 0 8px 16px rgba(26,24,21,0.06), 0 16px 32px rgba(26,24,21,0.04)',
  goldFocus: '0 0 0 3px rgba(201,162,39,0.15), 0 2px 8px rgba(201,162,39,0.2)',
  confirm: '0 0 0 2px rgba(4,120,87,0.2), 0 0 12px rgba(4,120,87,0.15)',
};

export const EASE = {
  out: [0.16, 1, 0.3, 1],
  spring: { type: 'spring', stiffness: 400, damping: 30 },
  settle: { type: 'spring', stiffness: 300, damping: 25 },
};
```

### Defined in `design-system/RankingTable.tsx`
```typescript
const FONT = {
  serif: "'Tiempos Headline', Georgia, serif",
  sans: "'Suisse Intl', sans-serif",
};

const COLOR = {
  ink: '#1c1917',
  dark: '#292524',
  body: '#44403c',
  muted: '#57534e',
  stone: '#78716c',
  faded: '#a8a29e',
  rule: '#e7e5e4',
  dashed: '#D6D3D1',
};
```

---

## Usage Examples

### PageHeader Component
```jsx
<PageHeader
  accent="amber"                    // glow color
  size="hero"                       // compact | standard | hero | spotlight
  label="Team Performance"          // small uppercase label
  title="Clinician Spotlight"       // large Tiempos headline
  subtitle="Jan 2024 – Dec 2024"    // stone-400 text
  showGridPattern                   // optional grid overlay
  actions={<YourControls />}        // right-side controls
  tabs={[
    { id: 'overview', label: 'Overview' },
    { id: 'details', label: 'Details' },
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
>
  {/* Optional content rendered in header area */}
</PageHeader>
```

### Page Structure
```jsx
import {
  PageHeader,
  PageContent,
  Section,
  Grid,
  StatCard,
  ChartCard,
} from './design-system';

const MyPage = () => (
  <div className="min-h-full">
    <PageHeader
      accent="amber"
      title="Dashboard"
      showGridPattern
    />

    <PageContent>
      {/* Hero stats row */}
      <Section>
        <Grid cols={4}>
          <StatCard title="Active Clients" value={156} />
          <StatCard title="Revenue" value="$143K" />
          <StatCard title="Sessions" value={41} valueSuffix="/wk" />
          <StatCard title="Retention" value="87%" variant="positive" />
        </Grid>
      </Section>

      {/* Charts */}
      <Section>
        <Grid cols={2}>
          <ChartCard title="Revenue Trend">
            {/* Chart content */}
          </ChartCard>
          <ChartCard title="Session Distribution">
            {/* Chart content */}
          </ChartCard>
        </Grid>
      </Section>
    </PageContent>
  </div>
);
```

### Import Reference
```jsx
import {
  PageHeader,
  PageContent,
  Section,
  Grid,
  StatCard,
  ChartCard,
  SegmentedControl,
  DataTableCard,
  DonutChartCard,
  InsightCard,
  ExecutiveSummary,
  // ... etc
} from './design-system';
```

---

## Notes

1. **Two token systems exist** — `COLOR` (in RankingTable) and `INK` (in configure-v2/shared) define similar but not identical values. Both are in active use.

2. **Amber vs Gold** — Analysis pages use amber (`#f59e0b`) as the primary accent. Configure pages use gold (`#c9a227`). Both are warm tones but gold is more muted/antiquarian.

3. **PageHeader is shared** — The dark header component is used across all pages, providing visual continuity.

4. **`design-system-summary.md` is deprecated** — it now redirects to this document.
