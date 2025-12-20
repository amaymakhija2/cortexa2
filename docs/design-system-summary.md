# Cortexa Design System - AI Reference Summary

## Visual Hierarchy: Dark Header / Light Body Pattern

The application uses a consistent **dark-over-light** visual pattern where:
- **Header Zone**: Dark stone/charcoal gradient with accent glow
- **Body Zone**: Light stone gradient background

---

## 1. PAGE HEADER (Dark Zone)

### Background
```css
background: linear-gradient(135deg, #1c1917 0%, #292524 50%, #1c1917 100%)
```
This is `stone-900` to `stone-800` - a warm charcoal, NOT pure black.

### Accent Glow System
Each page has an accent color that creates a subtle radial glow:
| Accent | Glow Color | Usage |
|--------|------------|-------|
| amber | `#f59e0b` | Clinician Spotlight, Revenue |
| violet | `#8b5cf6` | Compare, Design System |
| cyan | `#06b6d4` | Growth, Pipeline |
| emerald | `#10b981` | Retention, Engagement |
| rose | `#f43f5e` | Alerts, At-Risk |
| blue | `#3b82f6` | Sessions, Scheduling |

### Text Colors in Header
- **Title**: `text-white` with DM Serif Display font
- **Label**: `text-{accent}-500/80` (e.g., `text-amber-500/80`)
- **Subtitle**: `text-stone-400`
- **Tab inactive**: `text-stone-400` with `border-stone-600`
- **Tab active**: `bg-white text-stone-900`

### Grid Pattern (Optional)
When `showGridPattern={true}`, displays:
```css
backgroundImage: linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
                 linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)
backgroundSize: 32px 32px
```

---

## 2. PAGE CONTENT (Light Zone)

### Background
```css
bg-gradient-to-b from-stone-100 to-stone-50
```
This is a subtle vertical gradient from slightly darker cream to near-white.

### Container Padding
```
px-6 sm:px-8 lg:px-12 py-6 lg:py-8
```

---

## 3. CARDS (White on Light Body)

### Standard Card
```css
background: white
border-radius: rounded-xl (12px) or rounded-2xl (16px)
box-shadow: 0 2px 12px -2px rgba(0, 0, 0, 0.08)
```

### Highlighted/Top Performer Card
```css
accent bar: h-0.5 with gradient
box-shadow: 0 4px 24px -4px rgba(16, 185, 129, 0.25)  /* emerald glow */
```

### Status Colors
| Status | Accent Color | Text Color |
|--------|--------------|------------|
| Top performer | emerald `#10b981` | `#059669` |
| Needs attention | rose `#ef4444` | `#dc2626` |
| Neutral | stone `#78716c` | `#44403c` |

---

## 4. TYPOGRAPHY

### Font Family
- **Display headings**: `'DM Serif Display', Georgia, serif`
- **Body text**: System sans-serif (default)

### Text Scale
| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Page title | `text-4xl sm:text-5xl lg:text-6xl` | normal | `text-white` |
| Section title | `text-2xl` | bold | `text-stone-900` |
| Card title | `text-base` | bold | `text-stone-900` |
| Card value | `text-xl` | black | `text-{status}` |
| Subtitle/meta | `text-xs` or `text-sm` | normal | `text-stone-600` |

---

## 5. GRID SYSTEM

### Standard Layouts
```jsx
<Grid cols={4}>  // Hero stats row
<Grid cols={3}>  // Component cards
<Grid cols={2}>  // Charts side by side
```

### Gap Sizes
- `gap="sm"` → 12px
- `gap="md"` → 16px (default)
- `gap="lg"` → 24px

---

## 6. CONTROL STYLES (In Header - Dark Theme)

### Toggle Button Group
```css
container: bg-white/10 backdrop-blur-sm rounded-xl p-1
active: bg-white text-stone-900 shadow-lg
inactive: text-white/70 hover:text-white hover:bg-white/10
```

### Accent-colored Active State
```css
active: bg-amber-500 text-white shadow-lg
```

---

## 7. KEY COMPONENT PATTERNS

### PageHeader Usage
```jsx
<PageHeader
  accent="amber"                    // glow color
  label="Team Performance"          // small uppercase
  title="Clinician Spotlight"       // large DM Serif
  subtitle="Jan 2024 – Dec 2024"    // stone-400
  showGridPattern                   // optional grid overlay
  actions={<YourControls />}        // right-side controls
  tabs={[...]}                      // optional tab navigation
  activeTab={tab}
  onTabChange={setTab}
>
  {/* Content in header area */}
</PageHeader>
```

### Page Structure
```jsx
<div className="min-h-full">
  <PageHeader accent="amber" ... />

  <PageContent>
    <Section>
      <Grid cols={4}>
        <StatCard ... />
      </Grid>
    </Section>

    <Section>
      <Grid cols={2}>
        <ChartCard ... />
      </Grid>
    </Section>
  </PageContent>
</div>
```

---

## 8. SEMANTIC COLOR USAGE

### Data Visualization Palette
```javascript
const CLINICIAN_COLORS = [
  { color: '#7c3aed', gradient: 'linear-gradient(180deg, #a78bfa 0%, #7c3aed 100%)' }, // violet
  { color: '#0891b2', gradient: 'linear-gradient(180deg, #22d3ee 0%, #0891b2 100%)' }, // cyan
  { color: '#d97706', gradient: 'linear-gradient(180deg, #fbbf24 0%, #d97706 100%)' }, // amber
  { color: '#db2777', gradient: 'linear-gradient(180deg, #f472b6 0%, #db2777 100%)' }, // pink
  { color: '#059669', gradient: 'linear-gradient(180deg, #34d399 0%, #059669 100%)' }, // emerald
];
```

### Status Indicators
- **Positive/Good**: emerald `#10b981` → `#059669`
- **Warning**: amber `#f59e0b` → `#d97706`
- **Negative/Bad**: rose `#f43f5e` → `#e11d48`
- **Neutral**: stone `#78716c` → `#57534e`

---

## 9. ANIMATION PRINCIPLES

### Transitions
```css
transition-all duration-300    /* standard */
transition-all duration-200    /* fast */
```

### Hover States
```css
hover:scale-[1.01]            /* subtle lift */
hover:scale-[1.02]            /* emphasized lift */
```

### Active States
```css
active:scale-[0.98]           /* click feedback */
```

---

## 10. QUICK REFERENCE: Import Path

```jsx
import {
  PageHeader,
  Grid,
  Section,
  PageContent,
  StatCard,
  ChartCard,
  SegmentedControl,
  DataTableCard,
  // ... etc
} from './design-system';
```

---

## Summary: The Cortexa Look

1. **Dark header** (`stone-900` gradient) with colored accent glow
2. **Light body** (`stone-100` → `stone-50` gradient)
3. **White cards** with subtle shadows
4. **DM Serif Display** for display text, system sans for body
5. **Stone palette** for neutrals (warm gray, not cool gray)
6. **Accent colors** for status/category differentiation
7. **Smooth 300ms transitions** with subtle scale effects
