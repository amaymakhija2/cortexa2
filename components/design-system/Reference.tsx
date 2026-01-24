import React, { useState } from 'react';
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LabelList, ComposedChart, ReferenceLine } from 'recharts';
import { Users, DollarSign, Clock, TrendingUp, TrendingDown, Check, AlertCircle, Info, X as XIcon, ArrowRight, Target, FileText, MapPin, Grid3X3, List } from 'lucide-react';
import { useTypography, TypographyMode } from '../../context/TypographyContext';

// Import from design system (same folder)
import {
  PageHeader,
  Grid,
  Section,
  PageContent,
  SectionHeader,
  StatCard,
  StatCardWithBreakdown,
  ChartCard,
  SimpleChartCard,
  ExpandedChartModal,
  StackedBarCard,
  MetricListCard,
  ToggleButton,
  GoalIndicator,
  ActionButton,
  SegmentedControl,
  DonutChartCard,
  DataTableCard,
  BarChart,
  LineChart,
  SplitBarCard,
  DivergingBarChart,
  RetentionFunnelCard,
  CohortSelector,
  AtRiskClientsCard,
  MilestoneOpportunityCard,
  MetricCard,
  ExpandableBarChart,
  Legend,
  HoverInfoDisplay,
  ActionableClientListCard,
  ClientRosterCard,
  InsightCard,
  ExecutiveSummary,
  ComingSoonCard,
  DefinitionsBar,
  AnimatedSection,
  AnimatedGrid,
  AnimatedPageContent,
} from './';
import type { HoverInfo } from './charts';

// =============================================================================
// CORTEXA DESIGN SYSTEM - COMPONENTS REFERENCE
// =============================================================================
//
// This file serves as the complete reference for building pages in Cortexa.
// It documents all reusable components, patterns, and guidelines.
//
// QUICK START FOR AI:
// 1. Import components from './design-system'
// 2. Use PageHeader for the dark header section
// 3. Wrap content in PageContent for proper spacing
// 4. Use Grid with cols={4} for hero stats, cols={2} for charts
// 5. Use Section to add vertical spacing between grids
//
// FILE STRUCTURE:
// components/
// └── design-system/
//     ├── layout/
//     │   ├── PageHeader.tsx    - Dark header with accent glow
//     │   └── Grid.tsx          - Grid, Section, PageContent
//     ├── cards/
//     │   ├── StatCard.tsx      - Hero stat cards
//     │   ├── MetricCard.tsx    - Key metric cards with status & expandable content
//     │   ├── ChartCard.tsx     - Chart containers (with headerControls prop)
//     │   └── CompactCard.tsx   - Smaller cards
//     ├── controls/
//     │   ├── ToggleButton.tsx  - Toggle for switching views
//     │   ├── GoalIndicator.tsx - Goal/target badge
//     │   └── ActionButton.tsx  - CTA buttons
//     ├── index.ts              - All exports
//     └── Reference.tsx         - This reference file
//
// =============================================================================

// Sample data for demonstrations
const SAMPLE_BAR_DATA = [
  { month: 'Jan', value: 142 },
  { month: 'Feb', value: 145 },
  { month: 'Mar', value: 148 },
  { month: 'Apr', value: 151 },
  { month: 'May', value: 149 },
  { month: 'Jun', value: 156 },
];

const SAMPLE_COMBO_DATA = [
  { month: 'Jan', clients: 142, rate: 81.1 },
  { month: 'Feb', clients: 145, rate: 82.9 },
  { month: 'Mar', clients: 143, rate: 81.7 },
  { month: 'Apr', clients: 148, rate: 82.2 },
  { month: 'May', clients: 146, rate: 81.1 },
  { month: 'Jun', clients: 151, rate: 83.9 },
];

const SAMPLE_LINE_DATA = [
  { month: 'Jan', percentage: 82.5 },
  { month: 'Feb', percentage: 84.2 },
  { month: 'Mar', percentage: 86.1 },
  { month: 'Apr', percentage: 83.8 },
  { month: 'May', percentage: 87.5 },
  { month: 'Jun', percentage: 89.2 },
];

const SAMPLE_SESSIONS_DATA = [
  { month: 'Jan', value: 628 },
  { month: 'Feb', value: 641 },
  { month: 'Mar', value: 635 },
  { month: 'Apr', value: 658 },
  { month: 'May', value: 651 },
  { month: 'Jun', value: 672 },
  { month: 'Jul', value: 665 },
  { month: 'Aug', value: 689 },
  { month: 'Sep', value: 645 },
  { month: 'Oct', value: 712 },
  { month: 'Nov', value: 683 },
  { month: 'Dec', value: 698 },
];

// Sample data for BarChart component demos
const SAMPLE_REVENUE_DATA = [
  { label: 'Jan', value: 142000 },
  { label: 'Feb', value: 156000 },
  { label: 'Mar', value: 148000 },
  { label: 'Apr', value: 163000 },
  { label: 'May', value: 145000 },
  { label: 'Jun', value: 172000 },
];

const SAMPLE_CLINICIAN_REVENUE_DATA = [
  { label: 'Jan', Chen: 28000, Rodriguez: 32000, Patel: 24000, Kim: 30000, Johnson: 28000 },
  { label: 'Feb', Chen: 31000, Rodriguez: 35000, Patel: 26000, Kim: 32000, Johnson: 32000 },
  { label: 'Mar', Chen: 29000, Rodriguez: 33000, Patel: 25000, Kim: 31000, Johnson: 30000 },
  { label: 'Apr', Chen: 33000, Rodriguez: 36000, Patel: 27000, Kim: 34000, Johnson: 33000 },
  { label: 'May', Chen: 28000, Rodriguez: 32000, Patel: 24000, Kim: 30000, Johnson: 31000 },
  { label: 'Jun', Chen: 35000, Rodriguez: 38000, Patel: 29000, Kim: 36000, Johnson: 34000 },
];

const CLINICIAN_SEGMENTS = [
  { key: 'Chen', label: 'S Chen', color: '#7c3aed', gradient: 'linear-gradient(180deg, #a78bfa 0%, #7c3aed 100%)' },
  { key: 'Rodriguez', label: 'M Rodriguez', color: '#0891b2', gradient: 'linear-gradient(180deg, #22d3ee 0%, #0891b2 100%)' },
  { key: 'Patel', label: 'A Patel', color: '#d97706', gradient: 'linear-gradient(180deg, #fbbf24 0%, #d97706 100%)' },
  { key: 'Kim', label: 'J Kim', color: '#db2777', gradient: 'linear-gradient(180deg, #f472b6 0%, #db2777 100%)' },
  { key: 'Johnson', label: 'M Johnson', color: '#059669', gradient: 'linear-gradient(180deg, #34d399 0%, #059669 100%)' },
];

// Sample data for DivergingBarChart (Client Movement)
const SAMPLE_CLIENT_MOVEMENT_DATA = [
  { label: 'Jan', positive: 12, negative: 5 },
  { label: 'Feb', positive: 8, negative: 3 },
  { label: 'Mar', positive: 15, negative: 7 },
  { label: 'Apr', positive: 10, negative: 4 },
  { label: 'May', positive: 14, negative: 6 },
  { label: 'Jun', positive: 11, negative: 8 },
];

// Sample data for RetentionFunnelCard
const SAMPLE_SESSIONS_FUNNEL = [
  { label: 'Started', count: 100, percentage: 100 },
  { label: 'Session 5', count: 76, percentage: 76 },
  { label: 'Session 12', count: 52, percentage: 52 },
  { label: 'Session 24', count: 31, percentage: 31 },
];

const SAMPLE_TIME_FUNNEL = [
  { label: 'Started', count: 100, percentage: 100 },
  { label: '1 Month', count: 82, percentage: 82 },
  { label: '3 Months', count: 62, percentage: 62 },
  { label: '6 Months', count: 41, percentage: 41 },
];

// Sample data for CohortSelector
const SAMPLE_COHORTS = [
  { id: 'all-time', label: 'All Time', sublabel: 'Since practice opened', clientCount: 847, maturity: 'mature' as const, recommended: true },
  { id: 'ytd-2024', label: '2024 YTD', sublabel: 'Jan - Nov 2024', clientCount: 312, maturity: 'mature' as const },
  { id: 'q3-2024', label: 'Q3 2024', sublabel: 'Jul - Sep', clientCount: 142, maturity: 'mature' as const },
  { id: 'q4-2024', label: 'Q4 2024', sublabel: 'Oct - Dec', clientCount: 89, maturity: 'partial' as const },
  { id: 'nov-2024', label: 'Nov 2024', sublabel: '23 clients', clientCount: 23, maturity: 'immature' as const, availableDate: 'Jan 15, 2025' },
];

// Sample data for AtRiskClientsCard
const SAMPLE_AT_RISK_CLIENTS = [
  { id: '1', name: 'Sarah Mitchell', daysSinceLastSession: 28, totalSessions: 12, clinician: 'Dr. Chen', riskLevel: 'high' as const },
  { id: '2', name: 'James Rodriguez', daysSinceLastSession: 21, totalSessions: 8, clinician: 'Dr. Patel', riskLevel: 'high' as const },
  { id: '3', name: 'Emily Chen', daysSinceLastSession: 16, totalSessions: 4, clinician: 'Dr. Kim', riskLevel: 'medium' as const },
  { id: '4', name: 'Michael Brown', daysSinceLastSession: 14, totalSessions: 6, clinician: 'Dr. Johnson', riskLevel: 'medium' as const },
  { id: '5', name: 'Lisa Wang', daysSinceLastSession: 10, totalSessions: 3, clinician: 'Dr. Chen', riskLevel: 'low' as const },
];

// Sample data for MilestoneOpportunityCard
const SAMPLE_APPROACHING_CLIENTS = [
  { id: '1', name: 'Alex Thompson', currentSessions: 4, targetMilestone: 5, sessionsToGo: 1, nextAppointment: 'Tomorrow', clinician: 'Dr. Chen' },
  { id: '2', name: 'Jordan Lee', currentSessions: 4, targetMilestone: 5, sessionsToGo: 1, nextAppointment: 'Dec 5', clinician: 'Dr. Patel' },
  { id: '3', name: 'Casey Morgan', currentSessions: 3, targetMilestone: 5, sessionsToGo: 2, nextAppointment: 'Dec 3', clinician: 'Dr. Kim' },
  { id: '4', name: 'Taylor Swift', currentSessions: 3, targetMilestone: 5, sessionsToGo: 2, clinician: 'Dr. Johnson' },
  { id: '5', name: 'Morgan Freeman', currentSessions: 2, targetMilestone: 5, sessionsToGo: 3, nextAppointment: 'Dec 8', clinician: 'Dr. Chen' },
];

// Sample data for ClientRosterCard
const SAMPLE_CLIENT_ROSTER = [
  { id: '1', name: 'Sarah Mitchell', initials: 'SM', totalSessions: 12, lastSeenDays: 3, nextAppointment: 'Dec 5', status: 'healthy' as const },
  { id: '2', name: 'James Rodriguez', initials: 'JR', totalSessions: 8, lastSeenDays: 21, nextAppointment: null, status: 'at-risk' as const },
  { id: '3', name: 'Emily Chen', initials: 'EC', totalSessions: 2, lastSeenDays: 1, nextAppointment: 'Dec 3', status: 'new' as const },
  { id: '4', name: 'Michael Brown', initials: 'MB', totalSessions: 4, lastSeenDays: 5, nextAppointment: 'Dec 8', status: 'milestone' as const, milestone: 5 },
  { id: '5', name: 'Lisa Wang', initials: 'LW', totalSessions: 15, lastSeenDays: 7, nextAppointment: 'Dec 10', status: 'healthy' as const },
  { id: '6', name: 'David Kim', initials: 'DK', totalSessions: 6, lastSeenDays: 14, nextAppointment: null, status: 'at-risk' as const },
];

// Sample data for LineChart component
const SAMPLE_RETURN_RATE_DATA = [
  { month: 'Jan', clinician: 82, practice: 78 },
  { month: 'Feb', clinician: 85, practice: 79 },
  { month: 'Mar', clinician: 81, practice: 77 },
  { month: 'Apr', clinician: 88, practice: 80 },
  { month: 'May', clinician: 86, practice: 79 },
  { month: 'Jun', clinician: 90, practice: 81 },
];

// Sample data for Legend component
const SAMPLE_LEGEND_ITEMS = [
  { label: 'Revenue', color: '#10b981', type: 'dot' as const },
  { label: 'Goal', color: '#f59e0b', type: 'line' as const },
  { label: 'Last Year', color: '#a8a29e', type: 'line' as const },
];

export const Reference: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedChart, setExpandedChart] = useState<string | null>(null);
  const [toggleDemo, setToggleDemo] = useState(false);
  const [toggleDemo2, setToggleDemo2] = useState(true);
  const [barChartMode, setBarChartMode] = useState<'single' | 'stacked'>('single');
  const [hoveredSegment, setHoveredSegment] = useState<HoverInfo | null>(null);
  const [segmentedControlValue, setSegmentedControlValue] = useState('location');
  const [viewModeValue, setViewModeValue] = useState('grid');
  const [legendHoveredItem, setLegendHoveredItem] = useState<string | null>(null);

  // Global typography mode (persisted to localStorage, applies app-wide)
  const { mode: typographyMode, setMode: setTypographyMode } = useTypography();

  // =========================================================================
  // PAGE STRUCTURE TEMPLATE (Copy this for new pages)
  // =========================================================================
  //
  // import { PageHeader, PageContent, Grid, Section, StatCard, ChartCard } from './design-system';
  //
  // export const MyAnalysisPage: React.FC = () => {
  //   return (
  //     <div className="min-h-full">
  //       <PageHeader
  //         accent="amber"           // amber | cyan | emerald | rose | violet | blue
  //         label="Detailed Analysis"
  //         title="My Analysis"
  //         subtitle="Jan 2024 – Dec 2024"
  //         showTimePeriod
  //         timePeriod={timePeriod}
  //         onTimePeriodChange={setTimePeriod}
  //         tabs={[
  //           { id: 'tab1', label: 'Tab 1' },
  //           { id: 'tab2', label: 'Tab 2' },
  //         ]}
  //         activeTab={activeTab}
  //         onTabChange={setActiveTab}
  //       />
  //
  //       <PageContent>
  //         {/* Hero Stats - 4 columns */}
  //         <Section>
  //           <Grid cols={4}>
  //             <StatCard title="Metric 1" value={156} subtitle="description" />
  //             <StatCard title="Metric 2" value="+14" variant="positive" />
  //             <StatCard title="Metric 3" value="87%" />
  //             <StatCard title="Metric 4" value="84%" />
  //           </Grid>
  //         </Section>
  //
  //         {/* Charts - 2 columns */}
  //         <Section>
  //           <Grid cols={2} gap="lg">
  //             <ChartCard title="Chart 1" ...>
  //               <YourChart />
  //             </ChartCard>
  //             <ChartCard title="Chart 2" ...>
  //               <YourChart />
  //             </ChartCard>
  //           </Grid>
  //         </Section>
  //
  //         {/* Compact cards - 2 columns */}
  //         <Section>
  //           <Grid cols={2}>
  //             <StackedBarCard title="Demographics" segments={[...]} />
  //             <StackedBarCard title="Breakdown" segments={[...]} />
  //           </Grid>
  //         </Section>
  //       </PageContent>
  //     </div>
  //   );
  // };
  //
  // =========================================================================

  return (
    <div className="min-h-full">
      {/* Page Header */}
      <PageHeader
        accent="violet"
        label="Design System"
        title="Components"
        subtitle="Complete reference for building Cortexa pages"
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'layout', label: 'Layout' },
          { id: 'cards', label: 'Cards' },
          { id: 'controls', label: 'Controls' },
          { id: 'charts', label: 'Charts' },
          { id: 'styles', label: 'Styles' },
          { id: 'roadmap', label: 'Roadmap' },
        ]}
        activeTab={activeSection}
        onTabChange={setActiveSection}
      />

      <PageContent>
        {/* ================================================================= */}
        {/* SECTION: OVERVIEW - Quick Reference                               */}
        {/* ================================================================= */}
        {activeSection === 'overview' && (
          <>
            {/* Quick Start Guide */}
            <Section>
              <div
                className="rounded-2xl p-6 sm:p-8"
                style={{
                  background: 'linear-gradient(135deg, #1c1917 0%, #292524 100%)',
                  boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.2)'
                }}
              >
                <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>
                  Quick Start Guide
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="text-amber-400 text-sm font-semibold mb-2">1. IMPORT</div>
                    <code className="text-white/80 text-sm">
                      {`import { PageHeader, Grid, StatCard } from './design-system'`}
                    </code>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="text-amber-400 text-sm font-semibold mb-2">2. HEADER</div>
                    <code className="text-white/80 text-sm">
                      {`<PageHeader accent="amber" title="My Page" />`}
                    </code>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="text-amber-400 text-sm font-semibold mb-2">3. CONTENT</div>
                    <code className="text-white/80 text-sm">
                      {`<PageContent>...</PageContent>`}
                    </code>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="text-amber-400 text-sm font-semibold mb-2">4. GRID</div>
                    <code className="text-white/80 text-sm">
                      {`<Grid cols={4}><StatCard .../></Grid>`}
                    </code>
                  </div>
                </div>
              </div>
            </Section>

            {/* Component Overview Cards */}
            <Section>
              <h2 className="text-2xl font-bold text-stone-900 mb-4" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>
                Available Components
              </h2>
              <Grid cols={3} gap="md">
                <div className="rounded-xl p-5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
                  <h3 className="font-bold text-stone-900 mb-2">PageHeader</h3>
                  <p className="text-sm text-stone-600 mb-3">Dark header with accent glow, title, time picker, tabs</p>
                  <code className="text-xs bg-amber-100 px-2 py-1 rounded text-amber-800">layout/PageHeader.tsx</code>
                </div>
                <div className="rounded-xl p-5 bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200">
                  <h3 className="font-bold text-stone-900 mb-2">Grid / Section</h3>
                  <p className="text-sm text-stone-600 mb-3">Responsive grid (1-4 cols) with consistent gaps</p>
                  <code className="text-xs bg-cyan-100 px-2 py-1 rounded text-cyan-800">layout/Grid.tsx</code>
                </div>
                <div className="rounded-xl p-5 bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200">
                  <h3 className="font-bold text-stone-900 mb-2">PageContent</h3>
                  <p className="text-sm text-stone-600 mb-3">Content wrapper with proper padding</p>
                  <code className="text-xs bg-emerald-100 px-2 py-1 rounded text-emerald-800">layout/Grid.tsx</code>
                </div>
                <div className="rounded-xl p-5 bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200">
                  <h3 className="font-bold text-stone-900 mb-2">StatCard</h3>
                  <p className="text-sm text-stone-600 mb-3">Hero stat cards for key metrics</p>
                  <code className="text-xs bg-rose-100 px-2 py-1 rounded text-rose-800">cards/StatCard.tsx</code>
                </div>
                <div className="rounded-xl p-5 bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200">
                  <h3 className="font-bold text-stone-900 mb-2">ChartCard</h3>
                  <p className="text-sm text-stone-600 mb-3">Chart container with header, legend, insights</p>
                  <code className="text-xs bg-violet-100 px-2 py-1 rounded text-violet-800">cards/ChartCard.tsx</code>
                </div>
                <div className="rounded-xl p-5 bg-gradient-to-br from-stone-50 to-gray-50 border border-stone-200">
                  <h3 className="font-bold text-stone-900 mb-2">CompactCard</h3>
                  <p className="text-sm text-stone-600 mb-3">Smaller cards for demographics, lists</p>
                  <code className="text-xs bg-stone-200 px-2 py-1 rounded text-stone-800">cards/CompactCard.tsx</code>
                </div>
                <div className="rounded-xl p-5 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200">
                  <h3 className="font-bold text-stone-900 mb-2">SegmentedControl</h3>
                  <p className="text-sm text-stone-600 mb-3">Premium segmented button group with sliding indicator</p>
                  <code className="text-xs bg-indigo-100 px-2 py-1 rounded text-indigo-800">controls/SegmentedControl.tsx</code>
                </div>
                <div className="rounded-xl p-5 bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-200">
                  <h3 className="font-bold text-stone-900 mb-2">LineChart</h3>
                  <p className="text-sm text-stone-600 mb-3">Thick line charts with multiple series support</p>
                  <code className="text-xs bg-blue-100 px-2 py-1 rounded text-blue-800">charts/LineChart.tsx</code>
                </div>
                <div className="rounded-xl p-5 bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200">
                  <h3 className="font-bold text-stone-900 mb-2">Legend</h3>
                  <p className="text-sm text-stone-600 mb-3">Unified legend system with multiple variants</p>
                  <code className="text-xs bg-teal-100 px-2 py-1 rounded text-teal-800">Legend.tsx</code>
                </div>
                <div className="rounded-xl p-5 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200">
                  <h3 className="font-bold text-stone-900 mb-2">InsightCard</h3>
                  <p className="text-sm text-stone-600 mb-3">Insight-first cards with sentiment indicators</p>
                  <code className="text-xs bg-orange-100 px-2 py-1 rounded text-orange-800">cards/InsightCard.tsx</code>
                </div>
                <div className="rounded-xl p-5 bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200">
                  <h3 className="font-bold text-stone-900 mb-2">ExecutiveSummary</h3>
                  <p className="text-sm text-stone-600 mb-3">Editorial-style expandable summary card</p>
                  <code className="text-xs bg-yellow-100 px-2 py-1 rounded text-yellow-800">cards/ExecutiveSummary.tsx</code>
                </div>
                <div className="rounded-xl p-5 bg-gradient-to-br from-fuchsia-50 to-pink-50 border border-fuchsia-200">
                  <h3 className="font-bold text-stone-900 mb-2">ClientRosterCard</h3>
                  <p className="text-sm text-stone-600 mb-3">Filterable client list with status indicators</p>
                  <code className="text-xs bg-fuchsia-100 px-2 py-1 rounded text-fuchsia-800">cards/ClientRosterCard.tsx</code>
                </div>
                <div className="rounded-xl p-5 bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200">
                  <h3 className="font-bold text-stone-900 mb-2">AnimatedGrid</h3>
                  <p className="text-sm text-stone-600 mb-3">Grid with staggered entrance animations</p>
                  <code className="text-xs bg-purple-100 px-2 py-1 rounded text-purple-800">layout/AnimatedSection.tsx</code>
                </div>
                <div className="rounded-xl p-5 bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200">
                  <h3 className="font-bold text-stone-900 mb-2">ComingSoonCard</h3>
                  <p className="text-sm text-stone-600 mb-3">Atmospheric placeholder for features in development</p>
                  <code className="text-xs bg-slate-200 px-2 py-1 rounded text-slate-800">cards/ComingSoonCard.tsx</code>
                </div>
              </Grid>
            </Section>

            {/* Live Page Example */}
            <Section>
              <h2 className="text-2xl font-bold text-stone-900 mb-4" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>
                Live Example: Analysis Page Layout
              </h2>
              <div className="rounded-2xl overflow-hidden border border-stone-200">
                {/* Mini header preview */}
                <div className="bg-gradient-to-r from-stone-900 to-stone-800 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500 opacity-50"></div>
                    <span className="text-amber-500/80 text-xs font-semibold tracking-wider uppercase">Analysis</span>
                  </div>
                  <h3 className="text-white text-xl font-bold" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>
                    Page Title Here
                  </h3>
                </div>

                {/* Content preview */}
                <div className="p-4 bg-gradient-to-b from-stone-100 to-stone-50">
                  {/* Hero stats preview */}
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-white rounded-xl p-3 shadow-sm">
                        <div className="text-xs text-stone-500 mb-1">Stat {i}</div>
                        <div className="text-lg font-bold text-stone-900">{100 + i * 10}</div>
                      </div>
                    ))}
                  </div>

                  {/* Charts preview */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white rounded-xl p-3 shadow-sm h-32 flex items-center justify-center text-stone-400">
                      Chart 1
                    </div>
                    <div className="bg-white rounded-xl p-3 shadow-sm h-32 flex items-center justify-center text-stone-400">
                      Chart 2
                    </div>
                  </div>

                  {/* Compact cards preview */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-xl p-3 shadow-sm h-16 flex items-center justify-center text-stone-400">
                      Compact Card 1
                    </div>
                    <div className="bg-white rounded-xl p-3 shadow-sm h-16 flex items-center justify-center text-stone-400">
                      Compact Card 2
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-stone-500 mt-3">
                Grid structure: 4-column hero stats → 2-column charts → 2-column compact cards
              </p>
            </Section>
          </>
        )}

        {/* ================================================================= */}
        {/* SECTION: LAYOUT - Grid, Section, PageContent                      */}
        {/* ================================================================= */}
        {activeSection === 'layout' && (
          <>
            {/* Grid System */}
            <Section>
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>
                Grid System
              </h2>
              <p className="text-stone-500 mb-6">Responsive grids with consistent gaps. Always 1 column on mobile.</p>

              {/* 4-column example */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-semibold">cols={4}</span>
                  <span className="text-stone-500 text-sm">Hero stats row</span>
                </div>
                <Grid cols={4} gap="md">
                  <StatCard title="Metric 1" value="156" subtitle="description" />
                  <StatCard title="Metric 2" value="+14" variant="positive" />
                  <StatCard title="Metric 3" value="87%" />
                  <StatCard title="Metric 4" value="$153K" />
                </Grid>
              </div>

              {/* 2-column example */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-sm font-semibold">cols={2}</span>
                  <span className="text-stone-500 text-sm">Charts row</span>
                </div>
                <Grid cols={2} gap="lg">
                  <div className="rounded-2xl bg-white p-6 shadow-sm border border-stone-100 h-48 flex items-center justify-center text-stone-400">
                    Chart Card 1
                  </div>
                  <div className="rounded-2xl bg-white p-6 shadow-sm border border-stone-100 h-48 flex items-center justify-center text-stone-400">
                    Chart Card 2
                  </div>
                </Grid>
              </div>

              {/* Gap options */}
              <div
                className="rounded-xl p-5 bg-stone-100"
              >
                <h4 className="font-semibold text-stone-900 mb-3">Gap Options</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <code className="bg-white px-2 py-1 rounded text-stone-700">gap="sm"</code>
                    <p className="text-stone-500 mt-1">gap-4 xl:gap-5</p>
                  </div>
                  <div>
                    <code className="bg-white px-2 py-1 rounded text-stone-700">gap="md"</code>
                    <p className="text-stone-500 mt-1">gap-5 xl:gap-6 (default)</p>
                  </div>
                  <div>
                    <code className="bg-white px-2 py-1 rounded text-stone-700">gap="lg"</code>
                    <p className="text-stone-500 mt-1">gap-6 xl:gap-8</p>
                  </div>
                </div>
              </div>
            </Section>

            {/* Section Spacing */}
            <Section>
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>
                Section Spacing
              </h2>
              <p className="text-stone-500 mb-6">Wrap grids in Section for vertical spacing between them.</p>

              <div className="rounded-xl p-5 bg-stone-100">
                <pre className="text-sm text-stone-700 overflow-x-auto">
{`<PageContent>
  <Section spacing="md">   {/* mb-6 xl:mb-8 */}
    <Grid cols={4}>...</Grid>
  </Section>

  <Section spacing="lg">   {/* mb-8 xl:mb-10 */}
    <Grid cols={2}>...</Grid>
  </Section>

  <Section spacing="none"> {/* no margin */}
    <Grid cols={2}>...</Grid>
  </Section>
</PageContent>`}
                </pre>
              </div>
            </Section>
          </>
        )}

        {/* ================================================================= */}
        {/* SECTION: CARDS - StatCard, ChartCard, CompactCard                 */}
        {/* ================================================================= */}
        {activeSection === 'cards' && (
          <>
            {/* Global Typography Mode Toggle */}
            <div className="mb-8 p-4 rounded-xl bg-stone-100 border border-stone-200">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="font-semibold text-stone-900">Typography Mode (Global)</h3>
                  <p className="text-sm text-stone-500">Changes apply across the entire application</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`
                    inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium
                    ${typographyMode === 'sans' ? 'bg-blue-100 text-blue-700' : ''}
                    ${typographyMode === 'serif' ? 'bg-amber-100 text-amber-700' : ''}
                    ${typographyMode === 'hybrid' ? 'bg-stone-200 text-stone-700' : ''}
                  `}>
                    {typographyMode === 'sans' && 'Sans-Serif Mode'}
                    {typographyMode === 'serif' && 'Serif Mode'}
                    {typographyMode === 'hybrid' && 'Hybrid Mode (Default)'}
                  </div>
                  <SegmentedControl
                    options={[
                      { id: 'hybrid', label: 'Hybrid' },
                      { id: 'sans', label: 'All Sans' },
                      { id: 'serif', label: 'All Serif' },
                    ]}
                    value={typographyMode}
                    onChange={(v) => setTypographyMode(v as TypographyMode)}
                  />
                </div>
              </div>
            </div>

            {/* StatCard */}
            <Section>
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>
                StatCard
              </h2>
              <p className="text-stone-500 mb-6">Hero metric cards for key statistics. Use in 4-column grid at page top.</p>

              {/* Basic Variants */}
              <h3 className="text-lg font-semibold text-stone-800 mb-4">Basic Variants</h3>
              <Grid cols={4} gap="md">
                <StatCard title="Default" value="156" subtitle="of 180 capacity" />
                <StatCard title="Positive" value="+12%" variant="positive" subtitle="vs last month" />
                <StatCard title="Negative" value="-5%" variant="negative" subtitle="vs last month" />
                <StatCard title="Percentage" value="87%" variant="percentage" subtitle="capacity used" />
              </Grid>

              {/* With Value Label */}
              <h3 className="text-lg font-semibold text-stone-800 mb-4 mt-8">With Value Label</h3>
              <Grid cols={4} gap="md">
                <StatCard title="Active Clients" value={156} valueLabel="right now" subtitle="+14 in Jan–Dec 2024" />
                <StatCard title="Sessions" value={698} valueLabel="completed" subtitle="82% of goal" />
                <StatCard title="Show Rate" value="94%" valueLabel="average" variant="positive" subtitle="+2% vs last month" />
                <StatCard title="Avg Revenue" value="$185" valueLabel="per session" subtitle="above benchmark" />
              </Grid>

              {/* With Breakdown */}
              <h3 className="text-lg font-semibold text-stone-800 mb-4 mt-8">StatCardWithBreakdown</h3>
              <Grid cols={4} gap="md">
                <StatCardWithBreakdown
                  title="Net Client Growth"
                  value="+14"
                  variant="positive"
                  breakdown={[
                    { label: 'new', value: '+62', color: 'positive' },
                    { label: 'churned', value: '-48', color: 'negative' }
                  ]}
                />
                <StatCardWithBreakdown
                  title="Session Mix"
                  value="698"
                  breakdown={[
                    { label: 'telehealth', value: '412', color: 'positive' },
                    { label: 'in-person', value: '286', color: 'neutral' }
                  ]}
                />
                <StatCardWithBreakdown
                  title="Attendance"
                  value="94%"
                  variant="positive"
                  breakdown={[
                    { label: 'showed', value: '656', color: 'positive' },
                    { label: 'no-shows', value: '42', color: 'negative' }
                  ]}
                />
                <StatCardWithBreakdown
                  title="Notes Status"
                  value="12"
                  variant="negative"
                  breakdown={[
                    { label: 'overdue', value: '8', color: 'negative' },
                    { label: 'pending', value: '4', color: 'neutral' }
                  ]}
                />
              </Grid>

              <div className="mt-6 rounded-xl p-5 bg-stone-100">
                <h4 className="font-semibold text-stone-900 mb-3">StatCard Props</h4>
                <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                  <div>
                    <code className="text-violet-600">title</code>
                    <span className="text-stone-500 ml-2">string - Card title</span>
                  </div>
                  <div>
                    <code className="text-violet-600">value</code>
                    <span className="text-stone-500 ml-2">string | number - Main value</span>
                  </div>
                  <div>
                    <code className="text-violet-600">valueLabel</code>
                    <span className="text-stone-500 ml-2">string - Label next to value (e.g., "right now")</span>
                  </div>
                  <div>
                    <code className="text-violet-600">subtitle</code>
                    <span className="text-stone-500 ml-2">string - Description below value</span>
                  </div>
                  <div>
                    <code className="text-violet-600">variant</code>
                    <span className="text-stone-500 ml-2">'default' | 'positive' | 'negative' | 'percentage'</span>
                  </div>
                  <div>
                    <code className="text-violet-600">valueColor</code>
                    <span className="text-stone-500 ml-2">string - Custom color (overrides variant)</span>
                  </div>
                </div>

                <h4 className="font-semibold text-stone-900 mb-3">StatCardWithBreakdown Props</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <code className="text-violet-600">breakdown</code>
                    <span className="text-stone-500 ml-2">{'{ label, value, color }[]'} - Breakdown items</span>
                  </div>
                  <div>
                    <code className="text-violet-600">color</code>
                    <span className="text-stone-500 ml-2">'positive' | 'negative' | 'neutral'</span>
                  </div>
                </div>
              </div>
            </Section>

            {/* MetricCard */}
            <Section>
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>
                MetricCard
              </h2>
              <p className="text-stone-500 mb-6">Key metric card with status indicator and optional expandable content. Used in Practice Overview dashboard.</p>

              <Grid cols={4} gap="md">
                <MetricCard
                  label="Revenue"
                  value="$153.4k"
                  subtext="Goal: $160k · $6.6k left"
                  status="Needs attention"
                  tooltip={{ title: 'Revenue', description: 'Total money collected this month.' }}
                  expandableContent={
                    <ExpandableBarChart
                      data={[
                        { label: 'Week 1', value: 38200, displayValue: '$38.2k' },
                        { label: 'Week 2', value: 41500, displayValue: '$41.5k' },
                        { label: 'Week 3', value: 36800, displayValue: '$36.8k' },
                        { label: 'Week 4', value: 36900, displayValue: '$36.9k' },
                      ]}
                      totalLabel="total this month"
                    />
                  }
                  expandButtonLabel="Weekly Breakdown"
                  expandButtonLabelMobile="Weekly"
                />
                <MetricCard
                  label="Sessions"
                  value="698"
                  valueLabel="completed"
                  subtext="82% of goal"
                  status="Healthy"
                  tooltip={{ title: 'Sessions', description: 'Sessions completed this month.' }}
                />
                <MetricCard
                  label="Clients"
                  value="156"
                  valueLabel="active"
                  subtext="17 new, 5 discharged"
                  status="Healthy"
                  tooltip={{ title: 'Clients', description: 'Active clients in the practice.' }}
                />
                <MetricCard
                  label="Outstanding Notes"
                  value="12"
                  valueLabel="overdue"
                  subtext="3 clinicians with overdue notes"
                  status="Critical"
                  tooltip={{ title: 'Notes', description: 'Sessions with overdue notes.' }}
                />
              </Grid>

              <div className="mt-6 rounded-xl p-5 bg-stone-100">
                <h4 className="font-semibold text-stone-900 mb-3">Props Reference</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <code className="text-violet-600">label</code>
                    <span className="text-stone-500 ml-2">string - Card label/title</span>
                  </div>
                  <div>
                    <code className="text-violet-600">value</code>
                    <span className="text-stone-500 ml-2">string - Main metric value</span>
                  </div>
                  <div>
                    <code className="text-violet-600">valueLabel</code>
                    <span className="text-stone-500 ml-2">string - Label after value (optional)</span>
                  </div>
                  <div>
                    <code className="text-violet-600">subtext</code>
                    <span className="text-stone-500 ml-2">string - Description text</span>
                  </div>
                  <div>
                    <code className="text-violet-600">status</code>
                    <span className="text-stone-500 ml-2">'Healthy' | 'Needs attention' | 'Critical'</span>
                  </div>
                  <div>
                    <code className="text-violet-600">tooltip</code>
                    <span className="text-stone-500 ml-2">{`{ title, description }`} - Info tooltip</span>
                  </div>
                  <div>
                    <code className="text-violet-600">expandableContent</code>
                    <span className="text-stone-500 ml-2">ReactNode - Expandable panel content</span>
                  </div>
                  <div>
                    <code className="text-violet-600">expandButtonLabel</code>
                    <span className="text-stone-500 ml-2">string - Expand button text</span>
                  </div>
                </div>
              </div>
            </Section>

            {/* ChartCard */}
            <Section>
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>
                ChartCard
              </h2>
              <p className="text-stone-500 mb-6">Full-featured chart container with header, legend, expand, insights.</p>

              <Grid cols={2} gap="lg">
                <ChartCard
                  title="Full ChartCard"
                  subtitle="With legend and insights"
                  legend={[
                    { label: 'Clients', type: 'box', color: 'bg-gradient-to-b from-amber-400 to-amber-500' },
                    { label: 'Rate', type: 'line', color: 'bg-emerald-500' }
                  ]}
                  expandable
                  onExpand={() => setExpandedChart('demo')}
                  insights={[
                    { value: 148, label: 'Average', bgColor: 'bg-amber-50', textColor: 'text-amber-600' },
                    { value: '84%', label: 'Capacity', bgColor: 'bg-emerald-50', textColor: 'text-emerald-600' },
                    { value: 'Jun', label: 'Peak', bgColor: 'bg-stone-100', textColor: 'text-stone-800' }
                  ]}
                  minHeight="400px"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={SAMPLE_COMBO_DATA} margin={{ top: 20, right: 60, bottom: 10, left: 20 }}>
                      <defs>
                        <linearGradient id="demoBarGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#fbbf24" stopOpacity={1}/>
                          <stop offset="100%" stopColor="#f59e0b" stopOpacity={1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="4 4" stroke="#e7e5e4" vertical={false} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#57534e', fontSize: 14 }} />
                      <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#78716c', fontSize: 12 }} domain={[0, 200]} />
                      <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#059669', fontSize: 12 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                      <Bar yAxisId="left" dataKey="clients" fill="url(#demoBarGradient)" radius={[6, 6, 0, 0]} maxBarSize={40} />
                      <Line yAxisId="right" type="monotone" dataKey="rate" stroke="#059669" strokeWidth={3} dot={{ fill: '#059669', r: 5 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </ChartCard>

                <SimpleChartCard
                  title="SimpleChartCard"
                  subtitle="Lighter version without insights"
                  metrics={[
                    { value: '85%', label: 'Average', bgColor: '#eff6ff', textColor: '#2563eb', isPrimary: true },
                  ]}
                  expandable
                  height="280px"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={SAMPLE_LINE_DATA} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                      <CartesianGrid strokeDasharray="4 4" stroke="#e7e5e4" vertical={false} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#57534e', fontSize: 14 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#3b82f6', fontSize: 12 }} domain={[70, 100]} tickFormatter={(v) => `${v}%`} />
                      <Line type="monotone" dataKey="percentage" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 5 }} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </SimpleChartCard>
              </Grid>
            </Section>

            {/* ChartCard with Controls */}
            <Section>
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>
                ChartCard with Controls
              </h2>
              <p className="text-stone-500 mb-6">Interactive chart card with toggle, goal indicator, and action button. Click "By Clinician" to see breakdown view.</p>

              <ChartCard
                title="Completed Sessions"
                subtitle="Monthly performance with breakdown toggle"
                headerControls={
                  <>
                    <ToggleButton
                      label="By Clinician"
                      active={toggleDemo}
                      onToggle={() => setToggleDemo(!toggleDemo)}
                      icon={<Users size={16} />}
                    />
                    <GoalIndicator
                      value={700}
                      label="Goal"
                      color="amber"
                      hidden={toggleDemo}
                    />
                    <ActionButton
                      label="Sessions Report"
                      icon={<ArrowRight size={16} />}
                    />
                  </>
                }
                expandable
                onExpand={() => setExpandedChart('sessions')}
                insights={
                  toggleDemo
                    ? [
                        { value: 'S Chen', label: 'Top (157)', bgColor: 'bg-violet-50', textColor: 'text-violet-600' },
                        { value: '698', label: 'Team Total', bgColor: 'bg-indigo-50', textColor: 'text-indigo-600' },
                        { value: '5', label: 'Clinicians', bgColor: 'bg-stone-100', textColor: 'text-stone-700' }
                      ]
                    : [
                        { value: 'Oct', label: 'Best (712)', bgColor: 'bg-emerald-50', textColor: 'text-emerald-600' },
                        { value: '+2.2%', label: 'MoM Trend', bgColor: 'bg-emerald-50', textColor: 'text-emerald-600' },
                        { value: '628–712', label: 'Range', bgColor: 'bg-stone-100', textColor: 'text-stone-700' }
                      ]
                }
                minHeight="480px"
              >
                <ResponsiveContainer width="100%" height={350}>
                  <RechartsBarChart data={SAMPLE_SESSIONS_DATA} margin={{ top: 20, right: 20, bottom: 10, left: 20 }}>
                    <defs>
                      <linearGradient id="sessionsBarGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={toggleDemo ? '#a78bfa' : '#34d399'} stopOpacity={1}/>
                        <stop offset="100%" stopColor={toggleDemo ? '#7c3aed' : '#059669'} stopOpacity={1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="#e7e5e4" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#57534e', fontSize: 14 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#78716c', fontSize: 12 }} domain={[0, 800]} />
                    {!toggleDemo && (
                      <ReferenceLine y={700} stroke="#f59e0b" strokeDasharray="8 4" strokeWidth={2} />
                    )}
                    <Bar dataKey="value" fill="url(#sessionsBarGradient)" radius={[8, 8, 0, 0]} maxBarSize={50} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </ChartCard>

              <div className="mt-6 rounded-xl p-5 bg-stone-100">
                <h4 className="font-semibold text-stone-900 mb-3">Usage Pattern</h4>
                <pre className="text-sm text-stone-700 overflow-x-auto">
{`<ChartCard
  title="Completed Sessions"
  subtitle="Monthly performance"
  headerControls={
    <>
      <ToggleButton
        label="By Clinician"
        active={showBreakdown}
        onToggle={() => setShowBreakdown(!showBreakdown)}
        icon={<Users size={16} />}
      />
      <GoalIndicator value={700} label="Goal" hidden={showBreakdown} />
      <ActionButton label="Sessions Report" icon={<ArrowRight size={16} />} />
    </>
  }
  insights={showBreakdown ? clinicianInsights : totalInsights}
  expandable
>
  <YourChart data={showBreakdown ? clinicianData : totalData} />
</ChartCard>`}
                </pre>
              </div>
            </Section>

            {/* CompactCard */}
            <Section>
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>
                Compact Cards
              </h2>
              <p className="text-stone-500 mb-6">Smaller cards for demographics, breakdowns, and lists.</p>

              <Grid cols={2} gap="md">
                <StackedBarCard
                  title="Client Gender"
                  segments={[
                    { label: 'Male', value: 52, color: 'bg-blue-500' },
                    { label: 'Female', value: 78, color: 'bg-pink-500' },
                    { label: 'Other', value: 8, color: 'bg-purple-500' }
                  ]}
                />
                <StackedBarCard
                  title="Session Frequency"
                  displayAs="count"
                  segments={[
                    { label: 'Weekly', value: 78, color: 'bg-emerald-500' },
                    { label: 'Bi-weekly', value: 45, color: 'bg-amber-500' },
                    { label: 'Monthly', value: 15, color: 'bg-stone-400' }
                  ]}
                />
              </Grid>

              <div className="mt-6">
                <Grid cols={2} gap="md">
                  <MetricListCard
                    title="Quick Stats"
                    metrics={[
                      { label: 'Active Clients', value: 156 },
                      { label: 'This Month', value: '+12', valueColor: 'text-emerald-600' },
                      { label: 'Churn Rate', value: '3.2%', valueColor: 'text-rose-600' },
                      { label: 'Avg Sessions', value: '4.2/week' }
                    ]}
                  />
                  <MetricListCard
                    title="Performance"
                    metrics={[
                      { label: 'Caseload', value: '87%' },
                      { label: 'Show Rate', value: '94%', valueColor: 'text-emerald-600' },
                      { label: 'Open Slots', value: '23', valueColor: 'text-amber-600' },
                      { label: 'Capacity', value: '180' }
                    ]}
                  />
                </Grid>
              </div>
            </Section>

            {/* DonutChartCard */}
            <Section>
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>
                DonutChartCard
              </h2>
              <p className="text-stone-500 mb-6">Premium donut/pie chart with animated segments, center content, and adaptive layout. Auto-detects container width.</p>

              {/* Adaptive Layout Info */}
              <div className="mb-6 rounded-xl p-5 bg-indigo-50 border border-indigo-200">
                <h4 className="font-semibold text-indigo-800 mb-3">Adaptive Layout Modes</h4>
                <ul className="text-sm text-indigo-700 space-y-1">
                  <li><strong>Wide (≥650px):</strong> Horizontal - donut left, detailed legend cards right</li>
                  <li><strong>Medium (450-649px):</strong> Vertical - centered donut, 2-column legend grid below</li>
                  <li><strong>Compact (&lt;450px):</strong> Vertical - smaller donut, simple inline legend below</li>
                </ul>
              </div>

              <Grid cols={2} gap="lg">
                <DonutChartCard
                  title="Revenue Distribution"
                  subtitle="Total across 12 months"
                  segments={[
                    { label: 'Clinician Costs', value: 756000, color: '#3b82f6' },
                    { label: 'Supervisor Costs', value: 168000, color: '#f59e0b' },
                    { label: 'CC Fees', value: 52000, color: '#f43f5e' },
                    { label: 'Net Revenue', value: 754000, color: '#10b981' }
                  ]}
                  centerLabel="Gross Revenue"
                  centerValue="$1.73M"
                  valueFormat="currency"
                  expandable
                />

                <DonutChartCard
                  title="Attendance Breakdown"
                  subtitle="Session outcomes"
                  segments={[
                    { label: 'Attended', value: 6262, color: '#10b981' },
                    { label: 'Client Cancelled', value: 1416, color: '#ef4444' },
                    { label: 'Clinician Cancelled', value: 286, color: '#3b82f6' },
                    { label: 'Late Cancelled', value: 299, color: '#f59e0b' },
                    { label: 'No Show', value: 95, color: '#6b7280' }
                  ]}
                  centerLabel="Show Rate"
                  centerValue="75.0%"
                  centerValueColor="text-emerald-600"
                  valueFormat="number"
                  expandable
                />
              </Grid>

              <div className="mt-6 rounded-xl p-5 bg-stone-100">
                <h4 className="font-semibold text-stone-900 mb-3">Props Reference</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <code className="text-violet-600">segments</code>
                    <span className="text-stone-500 ml-2">{'{ label, value, color }[]'}</span>
                  </div>
                  <div>
                    <code className="text-violet-600">centerLabel</code>
                    <span className="text-stone-500 ml-2">string - Label in center</span>
                  </div>
                  <div>
                    <code className="text-violet-600">centerValue</code>
                    <span className="text-stone-500 ml-2">string | number - Value in center</span>
                  </div>
                  <div>
                    <code className="text-violet-600">centerValueColor</code>
                    <span className="text-stone-500 ml-2">string - Tailwind color class</span>
                  </div>
                  <div>
                    <code className="text-violet-600">valueFormat</code>
                    <span className="text-stone-500 ml-2">'number' | 'currency' | 'percentage' | 'compact'</span>
                  </div>
                  <div>
                    <code className="text-violet-600">currencySymbol</code>
                    <span className="text-stone-500 ml-2">string - Currency prefix (default: $)</span>
                  </div>
                  <div>
                    <code className="text-violet-600">expandable</code>
                    <span className="text-stone-500 ml-2">boolean - Show expand button</span>
                  </div>
                  <div>
                    <code className="text-violet-600">onSegmentHover</code>
                    <span className="text-stone-500 ml-2">(segment, percent) =&gt; void</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-xl p-5 bg-stone-100">
                <h4 className="font-semibold text-stone-900 mb-3">Usage Example</h4>
                <pre className="text-sm text-stone-700 overflow-x-auto">
{`<DonutChartCard
  title="Revenue Distribution"
  subtitle="Total across all months"
  segments={[
    { label: 'Clinician Costs', value: 756000, color: '#3b82f6' },
    { label: 'Net Revenue', value: 754000, color: '#10b981' },
  ]}
  centerLabel="Gross Revenue"
  centerValue="$1.73M"
  valueFormat="currency"
  expandable
/>`}
                </pre>
              </div>
            </Section>

            {/* DataTableCard */}
            <Section>
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>
                DataTableCard
              </h2>
              <p className="text-stone-500 mb-6">Premium data table with responsive card view for mobile. Supports row indicators, hover states, and highlighted summary rows.</p>

              <DataTableCard
                title="Revenue Breakdown"
                subtitle="Monthly financial summary"
                columns={[
                  { key: 'jan', header: 'Jan', align: 'right' },
                  { key: 'feb', header: 'Feb', align: 'right' },
                  { key: 'mar', header: 'Mar', align: 'right' },
                  { key: 'total', header: 'Total', align: 'right', isTotals: true },
                ]}
                rows={[
                  {
                    id: 'gross',
                    label: 'Gross Revenue',
                    values: { jan: '$142.5k', feb: '$156.2k', mar: '$148.8k', total: '$447.5k' },
                  },
                  {
                    id: 'clinician',
                    label: 'Clinician Cost',
                    indicator: { color: '#3b82f6' },
                    values: { jan: '$63.0k', feb: '$69.2k', mar: '$65.8k', total: '$198.0k' },
                    valueColor: 'text-blue-600',
                  },
                  {
                    id: 'supervisor',
                    label: 'Supervisor Cost',
                    indicator: { color: '#f59e0b' },
                    values: { jan: '$14.0k', feb: '$15.4k', mar: '$14.6k', total: '$44.0k' },
                    valueColor: 'text-amber-600',
                  },
                  {
                    id: 'fees',
                    label: 'Credit Card Fees',
                    indicator: { color: '#f43f5e' },
                    values: { jan: '$4.3k', feb: '$4.7k', mar: '$4.5k', total: '$13.5k' },
                    valueColor: 'text-rose-600',
                  },
                  {
                    id: 'net',
                    label: 'Net Revenue',
                    indicator: { color: '#10b981' },
                    values: { jan: '$61.2k', feb: '$66.9k', mar: '$63.9k', total: '$192.0k' },
                    valueColor: 'text-emerald-600',
                    isHighlighted: true,
                    highlightColor: 'emerald',
                  },
                ]}
                expandable
              />

              <div className="mt-6 rounded-xl p-5 bg-stone-100">
                <h4 className="font-semibold text-stone-900 mb-3">Props Reference</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <code className="text-violet-600">columns</code>
                    <span className="text-stone-500 ml-2">{'{ key, header, align?, isTotals? }[]'}</span>
                  </div>
                  <div>
                    <code className="text-violet-600">rows</code>
                    <span className="text-stone-500 ml-2">{'{ id, label, indicator?, values, valueColor?, isHighlighted?, highlightColor? }[]'}</span>
                  </div>
                  <div>
                    <code className="text-violet-600">indicator</code>
                    <span className="text-stone-500 ml-2">{'{ color: string }'} - Colored dot</span>
                  </div>
                  <div>
                    <code className="text-violet-600">isHighlighted</code>
                    <span className="text-stone-500 ml-2">boolean - Highlight row bg</span>
                  </div>
                  <div>
                    <code className="text-violet-600">forceMobileView</code>
                    <span className="text-stone-500 ml-2">boolean - Force card layout</span>
                  </div>
                  <div>
                    <code className="text-violet-600">expandable</code>
                    <span className="text-stone-500 ml-2">boolean - Show expand button</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-xl p-5 bg-stone-100">
                <h4 className="font-semibold text-stone-900 mb-3">Usage Example</h4>
                <pre className="text-sm text-stone-700 overflow-x-auto">
{`<DataTableCard
  title="Revenue Breakdown"
  columns={[
    { key: 'jan', header: 'Jan', align: 'right' },
    { key: 'total', header: 'Total', align: 'right', isTotals: true },
  ]}
  rows={[
    {
      id: 'gross',
      label: 'Gross Revenue',
      values: { jan: '$142k', total: '$447k' },
    },
    {
      id: 'net',
      label: 'Net Revenue',
      indicator: { color: '#10b981' },
      values: { jan: '$61k', total: '$192k' },
      valueColor: 'text-emerald-600',
      isHighlighted: true,
      highlightColor: 'emerald',
    },
  ]}
  expandable
/>`}
                </pre>
              </div>
            </Section>

            {/* SplitBarCard */}
            <Section>
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>
                SplitBarCard
              </h2>
              <p className="text-stone-500 mb-6">Premium split bar visualization for comparing two values. Features gradient segments with icons, percentages displayed inside, and a legend below.</p>

              <Grid cols={2} gap="lg">
                <SplitBarCard
                  title="Session Modality"
                  leftSegment={{
                    label: 'Telehealth',
                    value: 2400,
                    color: '#0891b2',
                    colorEnd: '#0e7490',
                    icon: (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )
                  }}
                  rightSegment={{
                    label: 'In-Person',
                    value: 1800,
                    color: '#d97706',
                    colorEnd: '#b45309',
                    icon: (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    )
                  }}
                  expandable
                />

                <SplitBarCard
                  title="Payment Methods"
                  subtitle="Client payment preferences"
                  leftSegment={{
                    label: 'Insurance',
                    value: 3200,
                    color: '#3b82f6',
                    colorEnd: '#2563eb',
                  }}
                  rightSegment={{
                    label: 'Self-Pay',
                    value: 800,
                    color: '#10b981',
                    colorEnd: '#059669',
                  }}
                  barHeight="lg"
                  showPattern={false}
                />
              </Grid>

              <div className="mt-6 rounded-xl p-5 bg-stone-100">
                <h4 className="font-semibold text-stone-900 mb-3">Props Reference</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <code className="text-violet-600">leftSegment / rightSegment</code>
                    <span className="text-stone-500 ml-2">{'{ label, value, color, colorEnd?, icon? }'}</span>
                  </div>
                  <div>
                    <code className="text-violet-600">barHeight</code>
                    <span className="text-stone-500 ml-2">'sm' | 'md' | 'lg'</span>
                  </div>
                  <div>
                    <code className="text-violet-600">showPattern</code>
                    <span className="text-stone-500 ml-2">boolean - Dot pattern overlay</span>
                  </div>
                  <div>
                    <code className="text-violet-600">showShine</code>
                    <span className="text-stone-500 ml-2">boolean - Top shine effect</span>
                  </div>
                  <div>
                    <code className="text-violet-600">expandable</code>
                    <span className="text-stone-500 ml-2">boolean - Show expand button</span>
                  </div>
                  <div>
                    <code className="text-violet-600">onExpand</code>
                    <span className="text-stone-500 ml-2">() =&gt; void - Expand handler</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-xl p-5 bg-stone-100">
                <h4 className="font-semibold text-stone-900 mb-3">Usage Example</h4>
                <pre className="text-sm text-stone-700 overflow-x-auto">
{`<SplitBarCard
  title="Session Modality"
  leftSegment={{
    label: 'Telehealth',
    value: 2400,
    color: '#0891b2',
    colorEnd: '#0e7490',
    icon: <VideoIcon className="w-5 h-5" />
  }}
  rightSegment={{
    label: 'In-Person',
    value: 1800,
    color: '#d97706',
    colorEnd: '#b45309',
    icon: <BuildingIcon className="w-5 h-5" />
  }}
  expandable
  onExpand={() => setExpandedCard('modality')}
/>`}
                </pre>
              </div>
            </Section>

          </>
        )}

        {/* ================================================================= */}
        {/* SECTION: CONTROLS - Interactive Controls                          */}
        {/* ================================================================= */}
        {activeSection === 'controls' && (
          <>
            {/* Toggle Button */}
            <Section>
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>
                ToggleButton
              </h2>
              <p className="text-stone-500 mb-6">Premium toggle for switching between chart views. Use in ChartCard headerControls.</p>

              <div className="rounded-2xl p-6 bg-white shadow-sm border border-stone-100 mb-6">
                <div className="flex items-center gap-4 flex-wrap">
                  <ToggleButton
                    label="By Clinician"
                    active={toggleDemo}
                    onToggle={() => setToggleDemo(!toggleDemo)}
                    icon={<Users size={16} />}
                  />
                  <ToggleButton
                    label="Show Details"
                    active={toggleDemo2}
                    onToggle={() => setToggleDemo2(!toggleDemo2)}
                    icon={<Target size={16} />}
                  />
                  <ToggleButton
                    label="No Icon"
                    active={false}
                    onToggle={() => {}}
                  />
                </div>
              </div>

              <div className="rounded-xl p-5 bg-stone-100">
                <h4 className="font-semibold text-stone-900 mb-3">Props Reference</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <code className="text-violet-600">label</code>
                    <span className="text-stone-500 ml-2">string - Button label</span>
                  </div>
                  <div>
                    <code className="text-violet-600">active</code>
                    <span className="text-stone-500 ml-2">boolean - Toggle state</span>
                  </div>
                  <div>
                    <code className="text-violet-600">onToggle</code>
                    <span className="text-stone-500 ml-2">() =&gt; void - Click handler</span>
                  </div>
                  <div>
                    <code className="text-violet-600">icon</code>
                    <span className="text-stone-500 ml-2">ReactNode - Optional icon</span>
                  </div>
                </div>
              </div>
            </Section>

            {/* Goal Indicator */}
            <Section>
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>
                GoalIndicator
              </h2>
              <p className="text-stone-500 mb-6">Visual badge showing goal/target value with line preview. Multiple color variants.</p>

              <div className="rounded-2xl p-6 bg-white shadow-sm border border-stone-100 mb-6">
                <div className="flex items-center gap-4 flex-wrap">
                  <GoalIndicator value={700} label="Goal" color="amber" />
                  <GoalIndicator value="$150k" label="Target" color="emerald" />
                  <GoalIndicator value={85} label="Min %" color="cyan" />
                  <GoalIndicator value={50} label="Threshold" color="rose" />
                  <GoalIndicator value={100} label="Max" color="violet" lineStyle="solid" />
                  <GoalIndicator value={25} label="Limit" color="blue" lineStyle="dotted" />
                </div>
              </div>

              <div className="rounded-xl p-5 bg-stone-100">
                <h4 className="font-semibold text-stone-900 mb-3">Props Reference</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <code className="text-violet-600">value</code>
                    <span className="text-stone-500 ml-2">string | number - Goal value</span>
                  </div>
                  <div>
                    <code className="text-violet-600">label</code>
                    <span className="text-stone-500 ml-2">string - Label (default: "Goal")</span>
                  </div>
                  <div>
                    <code className="text-violet-600">color</code>
                    <span className="text-stone-500 ml-2">'amber' | 'emerald' | 'cyan' | 'rose' | 'violet' | 'blue'</span>
                  </div>
                  <div>
                    <code className="text-violet-600">lineStyle</code>
                    <span className="text-stone-500 ml-2">'dashed' | 'solid' | 'dotted'</span>
                  </div>
                </div>
              </div>
            </Section>

            {/* Action Button */}
            <Section>
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>
                ActionButton
              </h2>
              <p className="text-stone-500 mb-6">Premium CTA button for card actions like "View Report". Multiple variants.</p>

              <div className="rounded-2xl p-6 bg-white shadow-sm border border-stone-100 mb-6">
                <div className="flex items-center gap-4 flex-wrap">
                  <ActionButton
                    label="Sessions Report"
                    icon={<ArrowRight size={16} />}
                    variant="dark"
                  />
                  <ActionButton
                    label="Export Data"
                    icon={<FileText size={16} />}
                    iconPosition="left"
                    variant="outline"
                  />
                  <ActionButton
                    label="View Details"
                    variant="subtle"
                  />
                </div>
              </div>

              <div className="rounded-xl p-5 bg-stone-100">
                <h4 className="font-semibold text-stone-900 mb-3">Props Reference</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <code className="text-violet-600">label</code>
                    <span className="text-stone-500 ml-2">string - Button label</span>
                  </div>
                  <div>
                    <code className="text-violet-600">onClick</code>
                    <span className="text-stone-500 ml-2">() =&gt; void - Click handler</span>
                  </div>
                  <div>
                    <code className="text-violet-600">icon</code>
                    <span className="text-stone-500 ml-2">ReactNode - Optional icon</span>
                  </div>
                  <div>
                    <code className="text-violet-600">variant</code>
                    <span className="text-stone-500 ml-2">'dark' | 'outline' | 'subtle'</span>
                  </div>
                </div>
              </div>
            </Section>

            {/* Segmented Control */}
            <Section>
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>
                SegmentedControl
              </h2>
              <p className="text-stone-500 mb-6">Premium segmented control for mutually exclusive option selection. Features sliding indicator, refined gradients, and smooth transitions.</p>

              <div className="rounded-2xl p-6 bg-white shadow-sm border border-stone-100 mb-6">
                <div className="flex flex-col gap-6">
                  {/* Basic Example */}
                  <div>
                    <p className="text-sm text-stone-500 mb-3">Default variant:</p>
                    <SegmentedControl
                      options={[
                        { id: 'location', label: 'Location' },
                        { id: 'supervisor', label: 'Supervisor' },
                        { id: 'license', label: 'License Type' },
                      ]}
                      value={segmentedControlValue}
                      onChange={setSegmentedControlValue}
                    />
                  </div>

                  {/* With Icons */}
                  <div>
                    <p className="text-sm text-stone-500 mb-3">With icons (size sm):</p>
                    <SegmentedControl
                      options={[
                        { id: 'grid', label: 'Grid', icon: <Grid3X3 size={16} /> },
                        { id: 'list', label: 'List', icon: <List size={16} /> },
                      ]}
                      value={viewModeValue}
                      onChange={setViewModeValue}
                      size="sm"
                    />
                  </div>

                  {/* Subtle Variant */}
                  <div>
                    <p className="text-sm text-stone-500 mb-3">Subtle variant (size lg):</p>
                    <SegmentedControl
                      options={[
                        { id: 'location', label: 'By Location' },
                        { id: 'supervisor', label: 'By Supervisor' },
                        { id: 'license', label: 'By License' },
                      ]}
                      value={segmentedControlValue}
                      onChange={setSegmentedControlValue}
                      size="lg"
                      variant="subtle"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl p-5 bg-stone-100">
                <h4 className="font-semibold text-stone-900 mb-3">Props Reference</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <code className="text-violet-600">options</code>
                    <span className="text-stone-500 ml-2">{'{ id, label, icon?, disabled? }[]'}</span>
                  </div>
                  <div>
                    <code className="text-violet-600">value</code>
                    <span className="text-stone-500 ml-2">string - Selected option id</span>
                  </div>
                  <div>
                    <code className="text-violet-600">onChange</code>
                    <span className="text-stone-500 ml-2">(value: string) =&gt; void</span>
                  </div>
                  <div>
                    <code className="text-violet-600">size</code>
                    <span className="text-stone-500 ml-2">'sm' | 'md' | 'lg' (default: md)</span>
                  </div>
                  <div>
                    <code className="text-violet-600">variant</code>
                    <span className="text-stone-500 ml-2">'default' | 'subtle'</span>
                  </div>
                  <div>
                    <code className="text-violet-600">ariaLabel</code>
                    <span className="text-stone-500 ml-2">string - Accessible label</span>
                  </div>
                </div>
              </div>
            </Section>

            {/* Usage with ChartCard */}
            <Section>
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>
                Using with ChartCard
              </h2>
              <p className="text-stone-500 mb-6">Compose controls in the headerControls prop for interactive charts.</p>

              <ChartCard
                title="Interactive Chart Example"
                subtitle="With toggle, goal indicator, and action button"
                headerControls={
                  <>
                    <ToggleButton
                      label="By Clinician"
                      active={toggleDemo}
                      onToggle={() => setToggleDemo(!toggleDemo)}
                      icon={<Users size={16} />}
                    />
                    <GoalIndicator value={700} hidden={toggleDemo} />
                    <ActionButton
                      label="View Report"
                      icon={<ArrowRight size={16} />}
                    />
                  </>
                }
                insights={
                  toggleDemo
                    ? [
                        { value: 'S Chen', label: 'Top (148)', bgColor: 'bg-indigo-50', textColor: 'text-indigo-600' },
                        { value: '125', label: 'Average', bgColor: 'bg-stone-100', textColor: 'text-stone-700' },
                        { value: '5', label: 'Clinicians', bgColor: 'bg-stone-100', textColor: 'text-stone-700' }
                      ]
                    : [
                        { value: '665', label: 'Monthly Avg', bgColor: 'bg-emerald-50', textColor: 'text-emerald-600' },
                        { value: '3/12', label: 'Hit Goal', bgColor: 'bg-amber-50', textColor: 'text-amber-600' },
                        { value: 'Oct', label: 'Peak Month', bgColor: 'bg-stone-100', textColor: 'text-stone-700' }
                      ]
                }
                minHeight="400px"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={SAMPLE_BAR_DATA} margin={{ top: 20, right: 20, bottom: 10, left: 20 }}>
                    <defs>
                      <linearGradient id="controlsDemoGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={toggleDemo ? '#a78bfa' : '#34d399'} stopOpacity={1}/>
                        <stop offset="100%" stopColor={toggleDemo ? '#7c3aed' : '#10b981'} stopOpacity={1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="#e7e5e4" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#57534e', fontSize: 14 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#78716c', fontSize: 12 }} />
                    <Bar dataKey="value" fill="url(#controlsDemoGradient)" radius={[6, 6, 0, 0]} maxBarSize={40} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </ChartCard>

              <div className="mt-6 rounded-xl p-5 bg-stone-100">
                <h4 className="font-semibold text-stone-900 mb-3">Code Example</h4>
                <pre className="text-sm text-stone-700 overflow-x-auto">
{`<ChartCard
  title="Completed Sessions"
  headerControls={
    <>
      <ToggleButton
        label="By Clinician"
        active={showBreakdown}
        onToggle={() => setShowBreakdown(!showBreakdown)}
        icon={<Users size={16} />}
      />
      <GoalIndicator value={700} hidden={showBreakdown} />
      <ActionButton
        label="Sessions Report"
        onClick={() => navigate('/reports')}
        icon={<ArrowRight size={16} />}
      />
    </>
  }
  insights={showBreakdown ? clinicianInsights : totalInsights}
>
  {showBreakdown ? <ClinicianChart /> : <TotalChart />}
</ChartCard>`}
                </pre>
              </div>
            </Section>
          </>
        )}

        {/* ================================================================= */}
        {/* SECTION: CHARTS - Chart Components & Styling Reference            */}
        {/* ================================================================= */}
        {activeSection === 'charts' && (
          <>
            {/* BarChart Component */}
            <Section>
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>
                BarChart Component
              </h2>
              <p className="text-stone-500 mb-6">Premium custom bar chart with single and stacked modes, goal lines, and hover interactions. No Recharts dependency.</p>

              {/* Interactive Demo */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <ToggleButton
                    label="Single Bars"
                    active={barChartMode === 'single'}
                    onToggle={() => setBarChartMode('single')}
                  />
                  <ToggleButton
                    label="Stacked Bars"
                    active={barChartMode === 'stacked'}
                    onToggle={() => setBarChartMode('stacked')}
                    icon={<Users size={16} />}
                  />
                  {hoveredSegment && (
                    <div
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg ml-auto"
                      style={{ backgroundColor: `${hoveredSegment.color}15` }}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: hoveredSegment.color }}
                      />
                      <span className="text-stone-700 font-semibold text-sm">{hoveredSegment.segmentLabel}</span>
                      <span className="font-bold text-sm" style={{ color: hoveredSegment.color }}>
                        ${(hoveredSegment.value / 1000).toFixed(0)}k
                      </span>
                      <span className="text-stone-500 text-xs">in {hoveredSegment.label}</span>
                    </div>
                  )}
                </div>

                <ChartCard
                  title="Revenue Performance"
                  subtitle="Monthly breakdown with goal tracking"
                  headerControls={
                    <>
                      <GoalIndicator value="$150k" label="Goal" color="amber" hidden={barChartMode === 'stacked'} />
                      <ActionButton label="View Report" icon={<ArrowRight size={16} />} />
                    </>
                  }
                  insights={
                    barChartMode === 'stacked'
                      ? [
                          { value: 'S Chen', label: 'Top ($35k)', bgColor: 'bg-violet-50', textColor: 'text-violet-600' },
                          { value: '$172k', label: 'Best Month', bgColor: 'bg-indigo-50', textColor: 'text-indigo-600' },
                          { value: '5', label: 'Clinicians', bgColor: 'bg-stone-100', textColor: 'text-stone-700' }
                        ]
                      : [
                          { value: 'Jun', label: 'Best ($172k)', bgColor: 'bg-emerald-50', textColor: 'text-emerald-600' },
                          { value: '4/6', label: 'Hit Goal', bgColor: 'bg-amber-50', textColor: 'text-amber-600' },
                          { value: '$142k–$172k', label: 'Range', bgColor: 'bg-stone-100', textColor: 'text-stone-700' }
                        ]
                  }
                  expandable
                  onExpand={() => setExpandedChart('barchart')}
                  minHeight="480px"
                >
                  {barChartMode === 'single' ? (
                    <BarChart
                      data={SAMPLE_REVENUE_DATA}
                      mode="single"
                      goal={{ value: 150000 }}
                      getBarColor={(value) =>
                        value >= 150000
                          ? {
                              gradient: 'linear-gradient(180deg, #34d399 0%, #059669 100%)',
                              shadow: '0 4px 12px -2px rgba(16, 185, 129, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
                              textColor: 'text-emerald-600',
                            }
                          : {
                              gradient: 'linear-gradient(180deg, #60a5fa 0%, #2563eb 100%)',
                              shadow: '0 4px 12px -2px rgba(37, 99, 235, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
                              textColor: 'text-blue-600',
                            }
                      }
                      formatValue={(v) => `$${(v / 1000).toFixed(0)}k`}
                      height="340px"
                    />
                  ) : (
                    <BarChart
                      data={SAMPLE_CLINICIAN_REVENUE_DATA}
                      mode="stacked"
                      segments={CLINICIAN_SEGMENTS}
                      stackOrder={['Johnson', 'Kim', 'Patel', 'Rodriguez', 'Chen']}
                      formatValue={(v) => `$${(v / 1000).toFixed(0)}k`}
                      onHover={setHoveredSegment}
                      showLegend
                      height="340px"
                    />
                  )}
                </ChartCard>
              </div>

              {/* Props Reference */}
              <div className="rounded-xl p-5 bg-stone-100 mb-6">
                <h4 className="font-semibold text-stone-900 mb-3">Props Reference</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <code className="text-violet-600">data</code>
                    <span className="text-stone-500 ml-2">BarChartDataPoint[] - Chart data</span>
                  </div>
                  <div>
                    <code className="text-violet-600">mode</code>
                    <span className="text-stone-500 ml-2">'single' | 'stacked'</span>
                  </div>
                  <div>
                    <code className="text-violet-600">getBarColor</code>
                    <span className="text-stone-500 ml-2">(value, idx) =&gt; BarColorConfig</span>
                  </div>
                  <div>
                    <code className="text-violet-600">segments</code>
                    <span className="text-stone-500 ml-2">SegmentConfig[] - For stacked mode</span>
                  </div>
                  <div>
                    <code className="text-violet-600">goal</code>
                    <span className="text-stone-500 ml-2">{'{ value, show? }'} - Goal line</span>
                  </div>
                  <div>
                    <code className="text-violet-600">formatValue</code>
                    <span className="text-stone-500 ml-2">(v) =&gt; string - Label formatter</span>
                  </div>
                  <div>
                    <code className="text-violet-600">onHover</code>
                    <span className="text-stone-500 ml-2">(HoverInfo | null) =&gt; void</span>
                  </div>
                  <div>
                    <code className="text-violet-600">showLegend</code>
                    <span className="text-stone-500 ml-2">boolean - Show legend row</span>
                  </div>
                </div>
              </div>

              {/* Code Examples */}
              <Grid cols={2} gap="md">
                <div className="rounded-xl p-5 bg-stone-100">
                  <h4 className="font-semibold text-stone-900 mb-3">Single Bar Mode</h4>
                  <pre className="text-sm text-stone-700 overflow-x-auto">
{`<BarChart
  data={[
    { label: 'Jan', value: 142000 },
    { label: 'Feb', value: 156000 },
  ]}
  mode="single"
  goal={{ value: 150000 }}
  getBarColor={(value) =>
    value >= 150000
      ? { gradient: '...', shadow: '...', textColor: 'text-emerald-600' }
      : { gradient: '...', shadow: '...', textColor: 'text-blue-600' }
  }
  formatValue={(v) => \`$\${(v/1000).toFixed(0)}k\`}
/>`}
                  </pre>
                </div>
                <div className="rounded-xl p-5 bg-stone-100">
                  <h4 className="font-semibold text-stone-900 mb-3">Stacked Bar Mode</h4>
                  <pre className="text-sm text-stone-700 overflow-x-auto">
{`<BarChart
  data={[
    { label: 'Jan', Chen: 28000, Rodriguez: 32000 },
    { label: 'Feb', Chen: 31000, Rodriguez: 35000 },
  ]}
  mode="stacked"
  segments={[
    { key: 'Chen', label: 'Chen', color: '#7c3aed', gradient: '...' },
    { key: 'Rodriguez', label: 'Rodriguez', color: '#0891b2', gradient: '...' },
  ]}
  stackOrder={['Rodriguez', 'Chen']}
  onHover={setHoveredSegment}
  showLegend
/>`}
                  </pre>
                </div>
              </Grid>
            </Section>

            {/* DivergingBarChart Component */}
            <Section>
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>
                DivergingBarChart Component
              </h2>
              <p className="text-stone-500 mb-6">For visualizing flows with positive and negative values (e.g., new vs churned clients, gains vs losses). Bars extend above and below a zero reference line.</p>

              {/* Interactive Demo */}
              <div className="mb-8">
                <ChartCard
                  title="New and Churned Clients Per Month"
                  subtitle="Net client growth over time"
                  headerControls={
                    <>
                      <div className="flex items-center gap-6 bg-stone-50 rounded-xl px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-md bg-gradient-to-b from-emerald-400 to-emerald-500 shadow-sm"></div>
                          <span className="text-stone-700 text-base font-semibold">New Clients</span>
                        </div>
                        <div className="w-px h-6 bg-stone-200" />
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-md bg-gradient-to-b from-rose-400 to-rose-500 shadow-sm"></div>
                          <span className="text-stone-700 text-base font-semibold">Churned</span>
                        </div>
                      </div>
                    </>
                  }
                  insights={[
                    { value: '+70', label: 'Total New', bgColor: 'bg-emerald-50', textColor: 'text-emerald-600' },
                    { value: '-33', label: 'Total Churned', bgColor: 'bg-rose-50', textColor: 'text-rose-600' },
                    { value: '+37', label: 'Net Growth', bgColor: 'bg-stone-100', textColor: 'text-stone-700' },
                  ]}
                  expandable
                  onExpand={() => setExpandedChart('diverging')}
                  minHeight="480px"
                >
                  <DivergingBarChart
                    data={SAMPLE_CLIENT_MOVEMENT_DATA}
                    positiveConfig={{
                      label: 'New Clients',
                      color: '#34d399',
                      colorEnd: '#10b981',
                    }}
                    negativeConfig={{
                      label: 'Churned',
                      color: '#fb7185',
                      colorEnd: '#f43f5e',
                    }}
                    height="340px"
                  />
                </ChartCard>
              </div>

              {/* Props Reference */}
              <div className="rounded-xl p-5 bg-stone-100 mb-6">
                <h4 className="font-semibold text-stone-900 mb-3">Props Reference</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <code className="text-violet-600">data</code>
                    <span className="text-stone-500 ml-2">DivergingBarDataPoint[] - {'{label, positive, negative}'}</span>
                  </div>
                  <div>
                    <code className="text-violet-600">positiveConfig</code>
                    <span className="text-stone-500 ml-2">{'{label, color, colorEnd}'} - Above zero</span>
                  </div>
                  <div>
                    <code className="text-violet-600">negativeConfig</code>
                    <span className="text-stone-500 ml-2">{'{label, color, colorEnd}'} - Below zero</span>
                  </div>
                  <div>
                    <code className="text-violet-600">showLabels</code>
                    <span className="text-stone-500 ml-2">boolean - Show +X/-X labels (default: true)</span>
                  </div>
                  <div>
                    <code className="text-violet-600">formatPositiveLabel</code>
                    <span className="text-stone-500 ml-2">(v) =&gt; string - Format +X label</span>
                  </div>
                  <div>
                    <code className="text-violet-600">formatNegativeLabel</code>
                    <span className="text-stone-500 ml-2">(v) =&gt; string - Format -X label</span>
                  </div>
                </div>
              </div>

              {/* Code Example */}
              <div className="rounded-xl p-5 bg-stone-100">
                <h4 className="font-semibold text-stone-900 mb-3">Usage Example</h4>
                <pre className="text-sm text-stone-700 overflow-x-auto">
{`<DivergingBarChart
  data={[
    { label: 'Jan', positive: 12, negative: 5 },
    { label: 'Feb', positive: 8, negative: 3 },
    { label: 'Mar', positive: 15, negative: 7 },
  ]}
  positiveConfig={{
    label: 'New Clients',
    color: '#34d399',      // emerald-400
    colorEnd: '#10b981',   // emerald-500
  }}
  negativeConfig={{
    label: 'Churned',
    color: '#fb7185',      // rose-400
    colorEnd: '#f43f5e',   // rose-500
  }}
  height="340px"
/>`}
                </pre>
              </div>
            </Section>

            {/* RetentionFunnelCard Component */}
            <Section>
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>
                RetentionFunnelCard Component
              </h2>
              <p className="text-stone-500 mb-6">For visualizing client retention through session milestones or time periods. Shows tapering bars with values outside for clarity.</p>

              {/* Interactive Demo */}
              <div className="mb-8">
                <Grid cols={2} gap="lg">
                  <RetentionFunnelCard
                    stages={SAMPLE_SESSIONS_FUNNEL}
                    title="Retention by Sessions"
                    subtitle="Client milestones reached"
                    variant="sessions"
                    insights={[
                      { value: 100, label: 'Started', bgColor: 'bg-amber-50', textColor: 'text-amber-700' },
                      { value: '31%', label: 'Final Retention', bgColor: 'bg-amber-50', textColor: 'text-amber-700' },
                      { value: '69%', label: 'Drop-off', bgColor: 'bg-stone-100', textColor: 'text-stone-700' },
                    ]}
                  />
                  <RetentionFunnelCard
                    stages={SAMPLE_TIME_FUNNEL}
                    title="Retention by Time"
                    subtitle="Duration with practice"
                    variant="time"
                    insights={[
                      { value: 100, label: 'Started', bgColor: 'bg-indigo-50', textColor: 'text-indigo-700' },
                      { value: '41%', label: 'Final Retention', bgColor: 'bg-indigo-50', textColor: 'text-indigo-700' },
                      { value: '59%', label: 'Drop-off', bgColor: 'bg-stone-100', textColor: 'text-stone-700' },
                    ]}
                  />
                </Grid>
              </div>

              {/* Props Reference */}
              <div className="rounded-xl p-5 bg-stone-100 mb-6">
                <h4 className="font-semibold text-stone-900 mb-3">Props Reference</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <code className="text-violet-600">stages</code>
                    <span className="text-stone-500 ml-2">FunnelStage[] - {'{label, count, percentage}'}</span>
                  </div>
                  <div>
                    <code className="text-violet-600">title</code>
                    <span className="text-stone-500 ml-2">string - Card title</span>
                  </div>
                  <div>
                    <code className="text-violet-600">subtitle</code>
                    <span className="text-stone-500 ml-2">string - Card subtitle</span>
                  </div>
                  <div>
                    <code className="text-violet-600">variant</code>
                    <span className="text-stone-500 ml-2">'sessions' | 'time' - Color theme</span>
                  </div>
                  <div>
                    <code className="text-violet-600">insights</code>
                    <span className="text-stone-500 ml-2">FunnelInsight[] - Bottom values (3 recommended)</span>
                  </div>
                  <div>
                    <code className="text-violet-600">expandable</code>
                    <span className="text-stone-500 ml-2">boolean - Show expand button</span>
                  </div>
                  <div>
                    <code className="text-violet-600">size</code>
                    <span className="text-stone-500 ml-2">'md' | 'lg' - Size variant</span>
                  </div>
                </div>
              </div>

              {/* Code Example */}
              <div className="rounded-xl p-5 bg-stone-100">
                <h4 className="font-semibold text-stone-900 mb-3">Usage Example</h4>
                <pre className="text-sm text-stone-700 overflow-x-auto">
{`<RetentionFunnelCard
  stages={[
    { label: 'Started', count: 100, percentage: 100 },
    { label: 'Session 5', count: 76, percentage: 76 },
    { label: 'Session 12', count: 52, percentage: 52 },
    { label: 'Session 24', count: 31, percentage: 31 },
  ]}
  title="Retention by Sessions"
  subtitle="Client milestones reached"
  variant="sessions"
  insights={[
    { value: 100, label: 'Started', bgColor: 'bg-amber-50', textColor: 'text-amber-700' },
    { value: '31%', label: 'Final Retention', bgColor: 'bg-amber-50', textColor: 'text-amber-700' },
    { value: '69%', label: 'Drop-off', bgColor: 'bg-stone-100', textColor: 'text-stone-700' },
  ]}
  expandable
  onExpand={() => setExpanded('funnel')}
/>`}
                </pre>
              </div>
            </Section>

            {/* LineChart Component */}
            <Section>
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>
                LineChart Component
              </h2>
              <p className="text-stone-500 mb-6">Design system wrapper for Recharts LineChart with consistent thick styling. Features thick lines (strokeWidth: 4), large dots, and reference line support.</p>

              {/* Interactive Demo */}
              <div className="mb-8">
                <ChartCard
                  title="Return Rate Over Time"
                  subtitle="6-month return rate comparison"
                  headerControls={
                    <GoalIndicator value="85%" label="Target" color="emerald" />
                  }
                  insights={[
                    { value: '86.5%', label: 'Clinician Avg', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
                    { value: '79%', label: 'Practice Avg', bgColor: 'bg-amber-50', textColor: 'text-amber-600' },
                  ]}
                  minHeight="400px"
                >
                  <LineChart
                    data={SAMPLE_RETURN_RATE_DATA}
                    xAxisKey="month"
                    lines={[
                      { dataKey: 'clinician', color: '#3b82f6', name: 'Clinician' },
                      { dataKey: 'practice', color: '#f59e0b', name: 'Practice' },
                    ]}
                    yDomain={[70, 100]}
                    yTickFormatter={(v) => `${v}%`}
                    showLegend
                    referenceLines={[
                      { value: 85, label: 'Target', color: '#10b981', dashed: true },
                    ]}
                  />
                </ChartCard>
              </div>

              {/* Props Reference */}
              <div className="rounded-xl p-5 bg-stone-100 mb-6">
                <h4 className="font-semibold text-stone-900 mb-3">Props Reference</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <code className="text-violet-600">data</code>
                    <span className="text-stone-500 ml-2">Record&lt;string, any&gt;[] - Chart data</span>
                  </div>
                  <div>
                    <code className="text-violet-600">xAxisKey</code>
                    <span className="text-stone-500 ml-2">string - X-axis data key</span>
                  </div>
                  <div>
                    <code className="text-violet-600">lines</code>
                    <span className="text-stone-500 ml-2">{'{ dataKey, color, name? }[]'}</span>
                  </div>
                  <div>
                    <code className="text-violet-600">yDomain</code>
                    <span className="text-stone-500 ml-2">[min, max] - Y-axis range</span>
                  </div>
                  <div>
                    <code className="text-violet-600">showLegend</code>
                    <span className="text-stone-500 ml-2">boolean - Show legend row</span>
                  </div>
                  <div>
                    <code className="text-violet-600">referenceLines</code>
                    <span className="text-stone-500 ml-2">{'{ value, label, color?, dashed? }[]'}</span>
                  </div>
                  <div>
                    <code className="text-violet-600">showAreaFill</code>
                    <span className="text-stone-500 ml-2">boolean - Fill under line</span>
                  </div>
                  <div>
                    <code className="text-violet-600">animateOnce</code>
                    <span className="text-stone-500 ml-2">boolean - Animate only on mount</span>
                  </div>
                </div>
              </div>

              {/* Code Example */}
              <div className="rounded-xl p-5 bg-stone-100">
                <h4 className="font-semibold text-stone-900 mb-3">Usage Example</h4>
                <pre className="text-sm text-stone-700 overflow-x-auto">
{`<LineChart
  data={[
    { month: 'Jan', clinician: 82, practice: 78 },
    { month: 'Feb', clinician: 85, practice: 79 },
  ]}
  xAxisKey="month"
  lines={[
    { dataKey: 'clinician', color: '#3b82f6', name: 'Clinician' },
    { dataKey: 'practice', color: '#f59e0b', name: 'Practice' },
  ]}
  yDomain={[70, 100]}
  yTickFormatter={(v) => \`\${v}%\`}
  showLegend
  referenceLines={[
    { value: 85, label: 'Target', color: '#10b981' },
  ]}
/>`}
                </pre>
              </div>
            </Section>

            {/* Legend Component */}
            <Section>
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>
                Legend Component
              </h2>
              <p className="text-stone-500 mb-6">Unified legend system for consistent styling across all chart components. Multiple variants for different contexts.</p>

              {/* Interactive Demo */}
              <div className="mb-8 space-y-8">
                {/* Inline Variant */}
                <div>
                  <p className="text-sm text-stone-500 mb-3 font-semibold">Inline variant (for ChartCard headers):</p>
                  <Legend
                    items={SAMPLE_LEGEND_ITEMS}
                    variant="inline"
                    size="md"
                  />
                </div>

                {/* Floating Variant */}
                <div>
                  <p className="text-sm text-stone-500 mb-3 font-semibold">Floating variant (for BarChart overlay):</p>
                  <Legend
                    items={SAMPLE_LEGEND_ITEMS}
                    variant="floating"
                    interactive
                    hoveredItem={legendHoveredItem}
                    onItemHover={(item) => setLegendHoveredItem(item?.label || null)}
                  />
                </div>

                {/* Compact Variant */}
                <div>
                  <p className="text-sm text-stone-500 mb-3 font-semibold">Compact variant (simple horizontal wrap):</p>
                  <Legend
                    items={[
                      { label: 'Telehealth', color: '#0891b2', value: 2400 },
                      { label: 'In-Person', color: '#d97706', value: 1800 },
                    ]}
                    variant="compact"
                    size="md"
                  />
                </div>

                {/* Chart Variant */}
                <div>
                  <p className="text-sm text-stone-500 mb-3 font-semibold">Chart variant (inside chart area):</p>
                  <Legend
                    items={SAMPLE_LEGEND_ITEMS}
                    variant="chart"
                    size="md"
                  />
                </div>
              </div>

              {/* Props Reference */}
              <div className="rounded-xl p-5 bg-stone-100 mb-6">
                <h4 className="font-semibold text-stone-900 mb-3">Props Reference</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <code className="text-violet-600">items</code>
                    <span className="text-stone-500 ml-2">{'{ label, color, type?, value?, percent? }[]'}</span>
                  </div>
                  <div>
                    <code className="text-violet-600">variant</code>
                    <span className="text-stone-500 ml-2">'inline' | 'floating' | 'stacked' | 'grid' | 'compact' | 'chart'</span>
                  </div>
                  <div>
                    <code className="text-violet-600">size</code>
                    <span className="text-stone-500 ml-2">'sm' | 'md' | 'lg'</span>
                  </div>
                  <div>
                    <code className="text-violet-600">interactive</code>
                    <span className="text-stone-500 ml-2">boolean - Enable hover states</span>
                  </div>
                  <div>
                    <code className="text-violet-600">hoveredItem</code>
                    <span className="text-stone-500 ml-2">string | null - Currently hovered label</span>
                  </div>
                  <div>
                    <code className="text-violet-600">onItemHover</code>
                    <span className="text-stone-500 ml-2">(item | null) =&gt; void</span>
                  </div>
                </div>
              </div>

              {/* Variant Descriptions */}
              <div className="rounded-xl p-5 bg-indigo-50 border border-indigo-200">
                <h4 className="font-semibold text-indigo-800 mb-3">Variant Guide</h4>
                <ul className="text-sm text-indigo-700 space-y-1">
                  <li><strong>inline:</strong> Horizontal row in card headers with dividers</li>
                  <li><strong>floating:</strong> Overlay with backdrop blur for chart overlays</li>
                  <li><strong>stacked:</strong> Vertical list with values (DonutChartCard wide)</li>
                  <li><strong>grid:</strong> 2-column grid (DonutChartCard medium)</li>
                  <li><strong>compact:</strong> Simple horizontal wrap (SplitBarCard)</li>
                  <li><strong>chart:</strong> Inside chart area (Recharts replacement)</li>
                </ul>
              </div>
            </Section>

            {/* SectionHeader Component */}
            <Section>
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>
                SectionHeader Component
              </h2>
              <p className="text-stone-500 mb-6">For organizing page content into numbered sections with questions. Used in Retention tab for section-based layout.</p>

              {/* Interactive Demo */}
              <div className="mb-8 space-y-4">
                <SectionHeader
                  number={1}
                  question="How far do clients get?"
                  description="Session milestones show how clients progress through therapy"
                  accent="amber"
                />
                <SectionHeader
                  number={2}
                  question="How long do clients stay?"
                  description="Time-based retention milestones"
                  accent="indigo"
                />
                <SectionHeader
                  number={3}
                  question="When and why do clients leave?"
                  accent="rose"
                />
              </div>

              {/* Props Reference */}
              <div className="rounded-xl p-5 bg-stone-100 mb-6">
                <h4 className="font-semibold text-stone-900 mb-3">Props Reference</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <code className="text-violet-600">number</code>
                    <span className="text-stone-500 ml-2">number - Section number (optional)</span>
                  </div>
                  <div>
                    <code className="text-violet-600">question</code>
                    <span className="text-stone-500 ml-2">string - Main question/title</span>
                  </div>
                  <div>
                    <code className="text-violet-600">description</code>
                    <span className="text-stone-500 ml-2">string - Subtitle (optional)</span>
                  </div>
                  <div>
                    <code className="text-violet-600">accent</code>
                    <span className="text-stone-500 ml-2">'amber' | 'indigo' | 'rose' | 'emerald' | 'stone'</span>
                  </div>
                  <div>
                    <code className="text-violet-600">icon</code>
                    <span className="text-stone-500 ml-2">ReactNode - Custom icon (optional)</span>
                  </div>
                  <div>
                    <code className="text-violet-600">actions</code>
                    <span className="text-stone-500 ml-2">ReactNode - Right-side actions (optional)</span>
                  </div>
                </div>
              </div>
            </Section>

            {/* CohortSelector Component */}
            <Section>
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>
                CohortSelector Component
              </h2>
              <p className="text-stone-500 mb-6">For cohort-first retention analysis. Features hero-sized typography, expanded/collapsed states, and maturity indicators.</p>

              {/* Interactive Demo */}
              <div className="mb-8">
                <CohortSelector
                  cohorts={SAMPLE_COHORTS}
                  selectedCohort={null}
                  onSelect={() => {}}
                  title="Which clients do you want to analyze?"
                  subtitle="Select a time period to see retention data"
                />
              </div>

              {/* Props Reference */}
              <div className="rounded-xl p-5 bg-stone-100 mb-6">
                <h4 className="font-semibold text-stone-900 mb-3">Props Reference</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <code className="text-violet-600">cohorts</code>
                    <span className="text-stone-500 ml-2">CohortOption[] - Available cohorts</span>
                  </div>
                  <div>
                    <code className="text-violet-600">selectedCohort</code>
                    <span className="text-stone-500 ml-2">string | null - Selected cohort ID</span>
                  </div>
                  <div>
                    <code className="text-violet-600">onSelect</code>
                    <span className="text-stone-500 ml-2">(id: string) =&gt; void - Selection callback</span>
                  </div>
                  <div>
                    <code className="text-violet-600">title</code>
                    <span className="text-stone-500 ml-2">string - Header title (optional)</span>
                  </div>
                </div>
              </div>

              {/* CohortOption Interface */}
              <div className="rounded-xl p-5 bg-stone-100 mb-6">
                <h4 className="font-semibold text-stone-900 mb-3">CohortOption Interface</h4>
                <pre className="text-sm text-stone-700 overflow-x-auto">
{`interface CohortOption {
  id: string;
  label: string;           // "All Time", "Q3 2024"
  sublabel?: string;       // "Since practice opened"
  clientCount: number;     // Hero number displayed
  maturity: 'mature' | 'partial' | 'immature';
  availableDate?: string;  // For immature cohorts
  recommended?: boolean;   // Shows "Recommended" badge
}`}
                </pre>
              </div>

              {/* Design Features */}
              <div className="rounded-xl p-5 bg-amber-50 border border-amber-200">
                <h4 className="font-semibold text-amber-800 mb-3">Design Features</h4>
                <ul className="text-sm text-amber-700 space-y-2">
                  <li><strong>Expanded State:</strong> Hero-sized typography (text-5xl client count), luxury card styling</li>
                  <li><strong>Collapsed State:</strong> Compact bar (~60px) with amber accent, "Change" button</li>
                  <li><strong>Auto-collapse:</strong> Collapses 400ms after selection</li>
                  <li><strong>Maturity badges:</strong> Emerald (complete), Amber (partial), Stone (immature/disabled)</li>
                </ul>
              </div>
            </Section>

            {/* AtRiskClientsCard Component */}
            <Section>
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>
                AtRiskClientsCard Component
              </h2>
              <p className="text-stone-500 mb-6">Shows clients without upcoming appointments, sorted by risk level. Part of the Current Health section in Retention tab.</p>

              {/* Interactive Demo */}
              <div className="mb-8">
                <AtRiskClientsCard
                  clients={SAMPLE_AT_RISK_CLIENTS}
                  totalActiveClients={156}
                />
              </div>

              {/* Props Reference */}
              <div className="rounded-xl p-5 bg-stone-100 mb-6">
                <h4 className="font-semibold text-stone-900 mb-3">Props Reference</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <code className="text-violet-600">clients</code>
                    <span className="text-stone-500 ml-2">AtRiskClient[] - At-risk client list</span>
                  </div>
                  <div>
                    <code className="text-violet-600">totalActiveClients</code>
                    <span className="text-stone-500 ml-2">number - For percentage calculation</span>
                  </div>
                  <div>
                    <code className="text-violet-600">onViewAll</code>
                    <span className="text-stone-500 ml-2">() =&gt; void - View all callback</span>
                  </div>
                  <div>
                    <code className="text-violet-600">onClientClick</code>
                    <span className="text-stone-500 ml-2">(id: string) =&gt; void - Client click</span>
                  </div>
                </div>
              </div>

              {/* Risk Levels */}
              <div className="rounded-xl p-5 bg-rose-50 border border-rose-200">
                <h4 className="font-semibold text-rose-800 mb-3">Risk Level Thresholds</h4>
                <ul className="text-sm text-rose-700 space-y-1">
                  <li><strong>High (rose):</strong> 21+ days since last session</li>
                  <li><strong>Medium (amber):</strong> 14-21 days since last session</li>
                  <li><strong>Low (stone):</strong> 7-14 days since last session</li>
                </ul>
              </div>
            </Section>

            {/* MilestoneOpportunityCard Component */}
            <Section>
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>
                MilestoneOpportunityCard Component
              </h2>
              <p className="text-stone-500 mb-6">Shows clients approaching a key retention milestone (e.g., Session 5). Opportunities for proactive intervention.</p>

              {/* Interactive Demo */}
              <div className="mb-8">
                <MilestoneOpportunityCard
                  milestone={5}
                  clients={SAMPLE_APPROACHING_CLIENTS}
                  successRate={76}
                />
              </div>

              {/* Props Reference */}
              <div className="rounded-xl p-5 bg-stone-100 mb-6">
                <h4 className="font-semibold text-stone-900 mb-3">Props Reference</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <code className="text-violet-600">milestone</code>
                    <span className="text-stone-500 ml-2">number - Target milestone (e.g., 5)</span>
                  </div>
                  <div>
                    <code className="text-violet-600">clients</code>
                    <span className="text-stone-500 ml-2">ApproachingClient[] - Clients list</span>
                  </div>
                  <div>
                    <code className="text-violet-600">successRate</code>
                    <span className="text-stone-500 ml-2">number - Historical % reaching milestone</span>
                  </div>
                  <div>
                    <code className="text-violet-600">maxPreview</code>
                    <span className="text-stone-500 ml-2">number - Max clients to show (default 5)</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="rounded-xl p-5 bg-emerald-50 border border-emerald-200">
                <h4 className="font-semibold text-emerald-800 mb-3">Features</h4>
                <ul className="text-sm text-emerald-700 space-y-1">
                  <li><strong>Progress breakdown:</strong> Shows clients 1, 2, or 3+ sessions away</li>
                  <li><strong>Progress indicator:</strong> Visual current/target (e.g., "4/5")</li>
                  <li><strong>Next appointment:</strong> Shows scheduled date if available</li>
                  <li><strong>"1 to go!" badge:</strong> Highlights clients one session away</li>
                </ul>
              </div>
            </Section>

            {/* ClientRosterCard Component */}
            <Section>
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>
                ClientRosterCard
              </h2>
              <p className="text-stone-500 mb-6">Filterable client list card with status filters. Used for displaying client rosters with health status indicators.</p>

              {/* Interactive Demo */}
              <div className="mb-8">
                <ClientRosterCard
                  title="Client Roster"
                  subtitle={`${SAMPLE_CLIENT_ROSTER.length} active clients`}
                  clients={SAMPLE_CLIENT_ROSTER}
                  maxVisible={4}
                />
              </div>

              {/* Props Reference */}
              <div className="rounded-xl p-5 bg-stone-100">
                <h4 className="font-semibold text-stone-900 mb-3">Props Reference</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <code className="text-violet-600">title</code>
                    <span className="text-stone-500 ml-2">string - Card title</span>
                  </div>
                  <div>
                    <code className="text-violet-600">subtitle</code>
                    <span className="text-stone-500 ml-2">string - Card subtitle</span>
                  </div>
                  <div>
                    <code className="text-violet-600">clients</code>
                    <span className="text-stone-500 ml-2">ClientData[] - Client list</span>
                  </div>
                  <div>
                    <code className="text-violet-600">maxVisible</code>
                    <span className="text-stone-500 ml-2">number - Max visible rows (default 4.5)</span>
                  </div>
                  <div>
                    <code className="text-violet-600">size</code>
                    <span className="text-stone-500 ml-2">'default' | 'lg' - Size variant</span>
                  </div>
                  <div>
                    <code className="text-violet-600">onExpand</code>
                    <span className="text-stone-500 ml-2">() =&gt; void - Expand handler</span>
                  </div>
                </div>
              </div>
            </Section>

            {/* InsightCard Component */}
            <Section>
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>
                InsightCard
              </h2>
              <p className="text-stone-500 mb-6">Insight-first cards that lead with the finding, not labels. The statement IS the content. Clean hierarchy, excellent readability.</p>

              {/* Interactive Demo */}
              <div className="mb-8">
                <Grid cols={2}>
                  <InsightCard
                    statement="Monthly clients are 35% of churn but only 20% of your client base"
                    emphasis="35% of churn"
                    metric="1.8×"
                    metricLabel="overrepresented"
                    sentiment="negative"
                    category="Session Frequency"
                  />
                  <InsightCard
                    statement="Weekly clients have the highest retention rate at 92%"
                    emphasis="92%"
                    metric="+15%"
                    metricLabel="vs average"
                    sentiment="positive"
                    category="Retention"
                  />
                </Grid>
              </div>

              {/* Props Reference */}
              <div className="rounded-xl p-5 bg-stone-100">
                <h4 className="font-semibold text-stone-900 mb-3">Props Reference</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <code className="text-violet-600">statement</code>
                    <span className="text-stone-500 ml-2">string - The main insight (headline)</span>
                  </div>
                  <div>
                    <code className="text-violet-600">emphasis</code>
                    <span className="text-stone-500 ml-2">string - Part to highlight</span>
                  </div>
                  <div>
                    <code className="text-violet-600">metric</code>
                    <span className="text-stone-500 ml-2">string - Metric value (e.g., "1.8×")</span>
                  </div>
                  <div>
                    <code className="text-violet-600">metricLabel</code>
                    <span className="text-stone-500 ml-2">string - Metric description</span>
                  </div>
                  <div>
                    <code className="text-violet-600">sentiment</code>
                    <span className="text-stone-500 ml-2">'positive' | 'negative' | 'neutral'</span>
                  </div>
                  <div>
                    <code className="text-violet-600">category</code>
                    <span className="text-stone-500 ml-2">string - Category label</span>
                  </div>
                </div>
              </div>
            </Section>

            {/* ExecutiveSummary Component */}
            <Section>
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>
                ExecutiveSummary
              </h2>
              <p className="text-stone-500 mb-6">Editorial-style summary card for maximum impact. Inspired by premium financial publications - expandable with bold typography.</p>

              {/* Interactive Demo */}
              <div className="mb-8">
                <ExecutiveSummary
                  headline="Practice revenue is up 12% this quarter"
                  summary="Your practice has shown **strong performance** across key metrics. Client retention improved by **8 percentage points** while new client acquisition remained steady. The **highest performing clinicians** have maintained show rates above 95%."
                  accent="emerald"
                />
              </div>

              {/* Props Reference */}
              <div className="rounded-xl p-5 bg-stone-100">
                <h4 className="font-semibold text-stone-900 mb-3">Props Reference</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <code className="text-violet-600">headline</code>
                    <span className="text-stone-500 ml-2">string - Main headline statement</span>
                  </div>
                  <div>
                    <code className="text-violet-600">summary</code>
                    <span className="text-stone-500 ml-2">string - Summary text (supports **bold**)</span>
                  </div>
                  <div>
                    <code className="text-violet-600">defaultExpanded</code>
                    <span className="text-stone-500 ml-2">boolean - Start expanded</span>
                  </div>
                  <div>
                    <code className="text-violet-600">accent</code>
                    <span className="text-stone-500 ml-2">'amber' | 'emerald' | 'rose' | 'indigo' | 'cyan'</span>
                  </div>
                </div>
              </div>
            </Section>

            {/* ComingSoonCard Component */}
            <Section>
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>
                ComingSoonCard
              </h2>
              <p className="text-stone-500 mb-6">Elegant placeholder for features in development. Features floating orbs, subtle animations, and premium typography.</p>

              {/* Interactive Demo */}
              <div className="mb-8 rounded-2xl overflow-hidden border border-stone-200" style={{ maxHeight: '400px' }}>
                <ComingSoonCard
                  accent="violet"
                  title="Advanced Analytics"
                  description="We're crafting powerful new insights for your practice."
                  features={['Predictive Churn', 'Revenue Forecasting', 'Custom Reports']}
                  className="!min-h-[350px]"
                />
              </div>

              {/* Props Reference */}
              <div className="rounded-xl p-5 bg-stone-100">
                <h4 className="font-semibold text-stone-900 mb-3">Props Reference</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <code className="text-violet-600">title</code>
                    <span className="text-stone-500 ml-2">string - Headline (default: "Coming Soon")</span>
                  </div>
                  <div>
                    <code className="text-violet-600">description</code>
                    <span className="text-stone-500 ml-2">string - Supporting description</span>
                  </div>
                  <div>
                    <code className="text-violet-600">features</code>
                    <span className="text-stone-500 ml-2">string[] - Feature pills to display</span>
                  </div>
                  <div>
                    <code className="text-violet-600">accent</code>
                    <span className="text-stone-500 ml-2">'violet' | 'blue' | 'emerald' | 'amber' | 'rose' | 'cyan'</span>
                  </div>
                </div>
              </div>
            </Section>

            {/* DefinitionsBar Component */}
            <Section>
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>
                DefinitionsBar
              </h2>
              <p className="text-stone-500 mb-6">Compact horizontal bar for displaying key term definitions. Used to clarify terminology in analysis sections.</p>

              {/* Interactive Demo */}
              <div className="mb-8">
                <DefinitionsBar
                  definitions={[
                    { term: 'Churned', definition: 'No appointment in 30+ days and none scheduled' },
                    { term: 'Retained', definition: 'Active or scheduled within 30 days' },
                  ]}
                />
              </div>

              {/* Props Reference */}
              <div className="rounded-xl p-5 bg-stone-100">
                <h4 className="font-semibold text-stone-900 mb-3">Props Reference</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <code className="text-violet-600">definitions</code>
                    <span className="text-stone-500 ml-2">{'{ term: string, definition: string }[]'}</span>
                  </div>
                </div>
              </div>
            </Section>

            {/* AnimatedSection & AnimatedGrid Components */}
            <Section>
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>
                Animation Components
              </h2>
              <p className="text-stone-500 mb-6">CSS-only entrance animations with staggered reveals. No library dependencies - pure CSS for performance.</p>

              {/* Component Descriptions */}
              <div className="mb-8 space-y-6">
                <div className="rounded-2xl p-6 bg-white shadow-sm border border-stone-100">
                  <h3 className="text-lg font-semibold text-stone-900 mb-2">AnimatedSection</h3>
                  <p className="text-stone-500 mb-4">Entrance animation wrapper with fade-in + slide-up. Use delay prop for staggered reveals.</p>
                  <pre className="text-sm text-stone-700 bg-stone-100 p-4 rounded-xl overflow-x-auto">
{`<AnimatedSection delay={0}>
  <Grid cols={4}>...</Grid>
</AnimatedSection>
<AnimatedSection delay={100}>
  <ChartCard>...</ChartCard>
</AnimatedSection>`}
                  </pre>
                </div>

                <div className="rounded-2xl p-6 bg-white shadow-sm border border-stone-100">
                  <h3 className="text-lg font-semibold text-stone-900 mb-2">AnimatedGrid</h3>
                  <p className="text-stone-500 mb-4">Grid with automatic staggered animations for each child. Each child gets delayed animation.</p>
                  <pre className="text-sm text-stone-700 bg-stone-100 p-4 rounded-xl overflow-x-auto">
{`<AnimatedGrid cols={4} staggerDelay={50}>
  <StatCard ... />
  <StatCard ... />
  <StatCard ... />
  <StatCard ... />
</AnimatedGrid>`}
                  </pre>
                </div>

                <div className="rounded-2xl p-6 bg-white shadow-sm border border-stone-100">
                  <h3 className="text-lg font-semibold text-stone-900 mb-2">AnimatedPageContent</h3>
                  <p className="text-stone-500 mb-4">Page content wrapper with entrance animation. Use with nested AnimatedSection/AnimatedGrid for full page animations.</p>
                  <pre className="text-sm text-stone-700 bg-stone-100 p-4 rounded-xl overflow-x-auto">
{`<AnimatedPageContent baseDelay={50}>
  <AnimatedGrid cols={4}>...</AnimatedGrid>
  <AnimatedSection delay={200}>...</AnimatedSection>
</AnimatedPageContent>`}
                  </pre>
                </div>
              </div>

              {/* Props Reference */}
              <div className="rounded-xl p-5 bg-stone-100">
                <h4 className="font-semibold text-stone-900 mb-3">AnimatedSection Props</h4>
                <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                  <div>
                    <code className="text-violet-600">delay</code>
                    <span className="text-stone-500 ml-2">number - Animation delay (ms)</span>
                  </div>
                  <div>
                    <code className="text-violet-600">duration</code>
                    <span className="text-stone-500 ml-2">number - Duration (default: 500ms)</span>
                  </div>
                  <div>
                    <code className="text-violet-600">animate</code>
                    <span className="text-stone-500 ml-2">boolean - Enable animation</span>
                  </div>
                </div>

                <h4 className="font-semibold text-stone-900 mb-3">AnimatedGrid Props</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <code className="text-violet-600">cols</code>
                    <span className="text-stone-500 ml-2">1 | 2 | 3 | 4 | 5</span>
                  </div>
                  <div>
                    <code className="text-violet-600">gap</code>
                    <span className="text-stone-500 ml-2">'sm' | 'md' | 'lg'</span>
                  </div>
                  <div>
                    <code className="text-violet-600">baseDelay</code>
                    <span className="text-stone-500 ml-2">number - Delay before first item</span>
                  </div>
                  <div>
                    <code className="text-violet-600">staggerDelay</code>
                    <span className="text-stone-500 ml-2">number - Delay between items (default: 60ms)</span>
                  </div>
                </div>
              </div>
            </Section>

            {/* Recharts Styling Reference */}
            <Section>
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>
                Recharts Styling Reference
              </h2>
              <p className="text-stone-500 mb-6">Standard Recharts configuration for consistent chart appearance (for line charts, composed charts, etc.).</p>

              {/* Tooltip Config */}
              <div className="rounded-xl p-5 bg-stone-100 mb-6">
                <h4 className="font-semibold text-stone-900 mb-3">Standard Tooltip Style</h4>
                <pre className="text-sm text-stone-700 overflow-x-auto">
{`<Tooltip
  contentStyle={{
    backgroundColor: '#1c1917',
    border: 'none',
    borderRadius: '16px',
    padding: '16px 20px',
    boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.4)'
  }}
  labelStyle={{ color: '#a8a29e', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}
  itemStyle={{ color: '#fff', fontSize: '18px', fontWeight: 700, padding: '4px 0' }}
/>`}
                </pre>
              </div>

              {/* Axis Config */}
              <div className="rounded-xl p-5 bg-stone-100 mb-6">
                <h4 className="font-semibold text-stone-900 mb-3">Standard Axis Style</h4>
                <pre className="text-sm text-stone-700 overflow-x-auto">
{`<XAxis
  dataKey="month"
  axisLine={false}
  tickLine={false}
  tick={{ fill: '#57534e', fontSize: 15, fontWeight: 600 }}
  dy={8}
/>

<YAxis
  axisLine={false}
  tickLine={false}
  tick={{ fill: '#78716c', fontSize: 14, fontWeight: 600 }}
  width={40}
/>`}
                </pre>
              </div>

              {/* Gradient Definitions */}
              <div className="rounded-xl p-5 bg-stone-100 mb-6">
                <h4 className="font-semibold text-stone-900 mb-3">Bar Gradient Pattern</h4>
                <pre className="text-sm text-stone-700 overflow-x-auto">
{`<defs>
  {/* Amber gradient (Capacity) */}
  <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stopColor="#fbbf24" stopOpacity={1}/>
    <stop offset="100%" stopColor="#f59e0b" stopOpacity={1}/>
  </linearGradient>

  {/* Emerald gradient (Growth/Positive) */}
  <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stopColor="#34d399" stopOpacity={1}/>
    <stop offset="100%" stopColor="#10b981" stopOpacity={1}/>
  </linearGradient>

  {/* Rose gradient (Churn/Negative) */}
  <linearGradient id="roseGradient" x1="0" y1="1" x2="0" y2="0">
    <stop offset="0%" stopColor="#fb7185" stopOpacity={1}/>
    <stop offset="100%" stopColor="#f43f5e" stopOpacity={1}/>
  </linearGradient>

  {/* Line fill gradient */}
  <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25}/>
    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02}/>
  </linearGradient>
</defs>`}
                </pre>
              </div>

              {/* Bar and Line Config */}
              <div className="grid grid-cols-2 gap-6">
                <div className="rounded-xl p-5 bg-stone-100">
                  <h4 className="font-semibold text-stone-900 mb-3">Bar Configuration</h4>
                  <pre className="text-sm text-stone-700 overflow-x-auto">
{`<Bar
  dataKey="value"
  fill="url(#amberGradient)"
  radius={[8, 8, 0, 0]}
  maxBarSize={56}
>
  <LabelList
    dataKey="value"
    position="insideTop"
    style={{
      fill: '#ffffff',
      fontSize: '15px',
      fontWeight: 800
    }}
    offset={8}
  />
</Bar>`}
                  </pre>
                </div>
                <div className="rounded-xl p-5 bg-stone-100">
                  <h4 className="font-semibold text-stone-900 mb-3">Line Configuration</h4>
                  <pre className="text-sm text-stone-700 overflow-x-auto">
{`<Line
  type="monotone"
  dataKey="percentage"
  stroke="#3b82f6"
  strokeWidth={4}
  dot={{
    fill: '#3b82f6',
    strokeWidth: 4,
    stroke: '#fff',
    r: 7
  }}
  activeDot={{
    r: 10,
    strokeWidth: 4,
    stroke: '#fff'
  }}
  fill="url(#lineFill)"
/>`}
                  </pre>
                </div>
              </div>
            </Section>
          </>
        )}

        {/* ================================================================= */}
        {/* SECTION: STYLES - Colors, Typography, Spacing                     */}
        {/* ================================================================= */}
        {activeSection === 'styles' && (
          <>
            {/* Accent Colors */}
            <Section>
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>
                Accent Colors
              </h2>
              <p className="text-stone-500 mb-6">Each analysis tab uses a different accent color.</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { name: 'amber', hex: '#f59e0b', use: 'Capacity' },
                  { name: 'cyan', hex: '#06b6d4', use: 'Sessions' },
                  { name: 'emerald', hex: '#10b981', use: 'Financial' },
                  { name: 'rose', hex: '#f43f5e', use: 'Retention' },
                  { name: 'violet', hex: '#8b5cf6', use: 'Insurance' },
                  { name: 'blue', hex: '#3b82f6', use: 'Admin' },
                ].map((color) => (
                  <div key={color.name}>
                    <div className="w-full h-16 rounded-xl mb-2" style={{ backgroundColor: color.hex }}></div>
                    <p className="text-sm font-semibold text-stone-700">{color.name}</p>
                    <p className="text-xs text-stone-400">{color.use}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* Typography */}
            <Section>
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>
                Typography
              </h2>
              <p className="text-stone-500 mb-6">Tiempos Headline for headings and large values, Suisse Intl for body.</p>

              <div className="rounded-xl p-6 bg-white shadow-sm border border-stone-100">
                <div className="space-y-4">
                  <div className="flex items-baseline gap-4">
                    <span className="text-stone-400 text-sm w-24">Page title</span>
                    <h1 className="text-5xl text-stone-900" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>Page Title</h1>
                  </div>
                  <div className="flex items-baseline gap-4">
                    <span className="text-stone-400 text-sm w-24">Card title</span>
                    <h2 className="text-3xl text-stone-900" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>Card Title</h2>
                  </div>
                  <div className="flex items-baseline gap-4">
                    <span className="text-stone-400 text-sm w-24">Large value</span>
                    <span className="text-6xl font-bold text-stone-900" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>156</span>
                  </div>
                  <div className="flex items-baseline gap-4">
                    <span className="text-stone-400 text-sm w-24">Subtitle</span>
                    <p className="text-lg text-stone-500">Description text goes here</p>
                  </div>
                </div>
              </div>
            </Section>

            {/* Shadows */}
            <Section>
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>
                Shadows
              </h2>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div
                    className="w-full h-24 bg-white rounded-2xl mb-3"
                    style={{ boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)' }}
                  ></div>
                  <p className="text-sm font-semibold text-stone-700">Card Shadow</p>
                  <p className="text-xs text-stone-400">Standard cards</p>
                </div>
                <div>
                  <div
                    className="w-full h-24 bg-stone-900 rounded-2xl mb-3"
                    style={{ boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.4)' }}
                  ></div>
                  <p className="text-sm font-semibold text-stone-700">Tooltip Shadow</p>
                  <p className="text-xs text-stone-400">Dark tooltips</p>
                </div>
                <div>
                  <div
                    className="w-full h-24 bg-white rounded-2xl mb-3"
                    style={{ boxShadow: '0 50px 100px -20px rgba(0, 0, 0, 0.25)' }}
                  ></div>
                  <p className="text-sm font-semibold text-stone-700">Modal Shadow</p>
                  <p className="text-xs text-stone-400">Expanded views</p>
                </div>
              </div>
            </Section>

            {/* Status Colors */}
            <Section spacing="none">
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>
                Status Indicators
              </h2>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold flex items-center gap-1.5">
                  <Check size={14} /> Positive / Success
                </span>
                <span className="px-3 py-1.5 rounded-full bg-rose-100 text-rose-700 text-sm font-semibold flex items-center gap-1.5">
                  <XIcon size={14} /> Negative / Error
                </span>
                <span className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-sm font-semibold flex items-center gap-1.5">
                  <AlertCircle size={14} /> Warning
                </span>
                <span className="px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold flex items-center gap-1.5">
                  <Info size={14} /> Info
                </span>
              </div>
            </Section>
          </>
        )}

        {/* ================================================================= */}
        {/* SECTION: ROADMAP - Patterns not yet in design system            */}
        {/* ================================================================= */}
        {activeSection === 'roadmap' && (
          <>
            <Section>
              <h2 className="text-3xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>
                Design System Roadmap
              </h2>
              <p className="text-stone-500 mb-8 text-lg">
                Patterns used in the app that could be standardized in the design system.
              </p>

              {/* High Priority */}
              <div className="mb-10">
                <h3 className="text-xl font-bold text-rose-600 mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                  High Priority
                </h3>
                <Grid cols={2} gap="md">
                  <div className="rounded-2xl p-6 bg-white shadow-sm border border-stone-100">
                    <h4 className="font-bold text-stone-900 mb-2">Modal / Dialog</h4>
                    <p className="text-sm text-stone-500 mb-3">Generic overlay modal with backdrop blur, animations, and optional tabs. Currently custom-built in ReferralModal.</p>
                    <code className="text-xs bg-rose-50 px-2 py-1 rounded text-rose-700">referral/ReferralModal.tsx</code>
                  </div>
                  <div className="rounded-2xl p-6 bg-white shadow-sm border border-stone-100">
                    <h4 className="font-bold text-stone-900 mb-2">Form Inputs</h4>
                    <p className="text-sm text-stone-500 mb-3">TextInput, EmailInput, PasswordInput with validation states, error messages, and light/dark variants.</p>
                    <code className="text-xs bg-rose-50 px-2 py-1 rounded text-rose-700">OnboardingFlow.tsx, LoginPage.tsx</code>
                  </div>
                  <div className="rounded-2xl p-6 bg-white shadow-sm border border-stone-100">
                    <h4 className="font-bold text-stone-900 mb-2">Dropdown / Select</h4>
                    <p className="text-sm text-stone-500 mb-3">Generic dropdown selector with search, multi-select support, and consistent styling.</p>
                    <code className="text-xs bg-rose-50 px-2 py-1 rounded text-rose-700">PracticeConfigurationPage.tsx</code>
                  </div>
                  <div className="rounded-2xl p-6 bg-white shadow-sm border border-stone-100">
                    <h4 className="font-bold text-stone-900 mb-2">Toast / Notification</h4>
                    <p className="text-sm text-stone-500 mb-3">Transient notifications for success/error feedback with auto-dismiss and action buttons.</p>
                    <code className="text-xs bg-rose-50 px-2 py-1 rounded text-rose-700">Not yet implemented</code>
                  </div>
                </Grid>
              </div>

              {/* Medium Priority */}
              <div className="mb-10">
                <h3 className="text-xl font-bold text-amber-600 mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                  Medium Priority
                </h3>
                <Grid cols={3} gap="md">
                  <div className="rounded-2xl p-5 bg-white shadow-sm border border-stone-100">
                    <h4 className="font-bold text-stone-900 mb-2">Toggle Switch</h4>
                    <p className="text-sm text-stone-500 mb-2">Animated on/off toggle (different from ToggleButton). Used in settings.</p>
                    <code className="text-xs bg-amber-50 px-2 py-1 rounded text-amber-700">SettingsPage.tsx</code>
                  </div>
                  <div className="rounded-2xl p-5 bg-white shadow-sm border border-stone-100">
                    <h4 className="font-bold text-stone-900 mb-2">Month Picker</h4>
                    <p className="text-sm text-stone-500 mb-2">Calendar-style month selector with year navigation.</p>
                    <code className="text-xs bg-amber-50 px-2 py-1 rounded text-amber-700">MonthPicker.tsx</code>
                  </div>
                  <div className="rounded-2xl p-5 bg-white shadow-sm border border-stone-100">
                    <h4 className="font-bold text-stone-900 mb-2">Badge / Chip</h4>
                    <p className="text-sm text-stone-500 mb-2">Standalone badge component with status variants and animations.</p>
                    <code className="text-xs bg-amber-50 px-2 py-1 rounded text-amber-700">ReferralBadge.tsx</code>
                  </div>
                  <div className="rounded-2xl p-5 bg-white shadow-sm border border-stone-100">
                    <h4 className="font-bold text-stone-900 mb-2">Tab Group</h4>
                    <p className="text-sm text-stone-500 mb-2">Reusable tab navigation component for content switching.</p>
                    <code className="text-xs bg-amber-50 px-2 py-1 rounded text-amber-700">Multiple pages</code>
                  </div>
                  <div className="rounded-2xl p-5 bg-white shadow-sm border border-stone-100">
                    <h4 className="font-bold text-stone-900 mb-2">Setting Row</h4>
                    <p className="text-sm text-stone-500 mb-2">Configuration item with icon, label, description, and control slot.</p>
                    <code className="text-xs bg-amber-50 px-2 py-1 rounded text-amber-700">SettingsPage.tsx</code>
                  </div>
                  <div className="rounded-2xl p-5 bg-white shadow-sm border border-stone-100">
                    <h4 className="font-bold text-stone-900 mb-2">Tooltip</h4>
                    <p className="text-sm text-stone-500 mb-2">Hover-triggered info display with positioning and delay.</p>
                    <code className="text-xs bg-amber-50 px-2 py-1 rounded text-amber-700">Various</code>
                  </div>
                </Grid>
              </div>

              {/* Low Priority */}
              <div className="mb-10">
                <h3 className="text-xl font-bold text-stone-500 mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-stone-400"></span>
                  Low Priority / Future
                </h3>
                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-2 rounded-full bg-stone-100 text-stone-600 text-sm font-medium">Skeleton Loaders</span>
                  <span className="px-4 py-2 rounded-full bg-stone-100 text-stone-600 text-sm font-medium">Empty States</span>
                  <span className="px-4 py-2 rounded-full bg-stone-100 text-stone-600 text-sm font-medium">Breadcrumbs</span>
                  <span className="px-4 py-2 rounded-full bg-stone-100 text-stone-600 text-sm font-medium">Pagination</span>
                  <span className="px-4 py-2 rounded-full bg-stone-100 text-stone-600 text-sm font-medium">Search Input</span>
                  <span className="px-4 py-2 rounded-full bg-stone-100 text-stone-600 text-sm font-medium">Slider / Range</span>
                  <span className="px-4 py-2 rounded-full bg-stone-100 text-stone-600 text-sm font-medium">Checkbox / Radio</span>
                  <span className="px-4 py-2 rounded-full bg-stone-100 text-stone-600 text-sm font-medium">Drawer / Sidebar</span>
                  <span className="px-4 py-2 rounded-full bg-stone-100 text-stone-600 text-sm font-medium">Copy Button</span>
                  <span className="px-4 py-2 rounded-full bg-stone-100 text-stone-600 text-sm font-medium">Comparison Widget</span>
                </div>
              </div>

              {/* What's Covered */}
              <div className="rounded-2xl p-6 bg-emerald-50 border border-emerald-200">
                <h3 className="text-xl font-bold text-emerald-800 mb-4 flex items-center gap-2">
                  <Check size={20} />
                  Currently in Design System
                </h3>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-emerald-700 mb-2">Layout</h4>
                    <ul className="text-emerald-600 space-y-1">
                      <li>PageHeader</li>
                      <li>Grid / Section</li>
                      <li>PageContent</li>
                      <li>SectionHeader</li>
                      <li>AnimatedSection</li>
                      <li>AnimatedGrid</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-emerald-700 mb-2">Cards (20+)</h4>
                    <ul className="text-emerald-600 space-y-1">
                      <li>StatCard</li>
                      <li>MetricCard</li>
                      <li>ChartCard</li>
                      <li>DonutChartCard</li>
                      <li>DataTableCard</li>
                      <li>ClientRosterCard</li>
                      <li>InsightCard</li>
                      <li>+ many more...</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-emerald-700 mb-2">Controls</h4>
                    <ul className="text-emerald-600 space-y-1">
                      <li>ActionButton (3 variants)</li>
                      <li>ToggleButton</li>
                      <li>GoalIndicator (6 colors)</li>
                      <li>SegmentedControl</li>
                      <li>CohortSelector</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-emerald-700 mb-2">Charts</h4>
                    <ul className="text-emerald-600 space-y-1">
                      <li>BarChart</li>
                      <li>LineChart</li>
                      <li>DivergingBarChart</li>
                      <li>RetentionFunnelChart</li>
                      <li>Legend (6 variants)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Section>
          </>
        )}

        {/* Expanded Chart Modal */}
        <ExpandedChartModal
          isOpen={expandedChart === 'demo'}
          onClose={() => setExpandedChart(null)}
          title="Caseload Capacity"
          subtitle="Active clients & capacity rate over time"
          legend={[
            { label: 'Active Clients', type: 'box', color: 'bg-gradient-to-b from-amber-400 to-amber-500' },
            { label: 'Capacity %', type: 'line', color: 'bg-emerald-500' }
          ]}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={SAMPLE_COMBO_DATA} margin={{ top: 40, right: 100, bottom: 40, left: 40 }}>
              <defs>
                <linearGradient id="expandedBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="#e7e5e4" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#57534e', fontSize: 18, fontWeight: 600 }} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#78716c', fontSize: 16 }} domain={[0, 200]} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#059669', fontSize: 16 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Bar yAxisId="left" dataKey="clients" fill="url(#expandedBarGradient)" radius={[10, 10, 0, 0]} maxBarSize={80}>
                <LabelList dataKey="clients" position="insideTop" style={{ fill: '#fff', fontSize: '18px', fontWeight: 800 }} offset={12} />
              </Bar>
              <Line yAxisId="right" type="monotone" dataKey="rate" stroke="#059669" strokeWidth={5} dot={{ fill: '#059669', strokeWidth: 5, stroke: '#fff', r: 10 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </ExpandedChartModal>
      </PageContent>
    </div>
  );
};

export default Reference;
