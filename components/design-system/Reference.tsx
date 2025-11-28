import React, { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LabelList, ComposedChart, ReferenceLine } from 'recharts';
import { Users, DollarSign, Clock, TrendingUp, TrendingDown, Check, AlertCircle, Info, X as XIcon, ArrowRight, Target, FileText } from 'lucide-react';

// Import from design system (same folder)
import {
  PageHeader,
  Grid,
  Section,
  PageContent,
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
} from './';

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

export const Reference: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedChart, setExpandedChart] = useState<string | null>(null);
  const [toggleDemo, setToggleDemo] = useState(false);
  const [toggleDemo2, setToggleDemo2] = useState(true);

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
                <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
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
              <h2 className="text-2xl font-bold text-stone-900 mb-4" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
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
              </Grid>
            </Section>

            {/* Live Page Example */}
            <Section>
              <h2 className="text-2xl font-bold text-stone-900 mb-4" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                Live Example: Analysis Page Layout
              </h2>
              <div className="rounded-2xl overflow-hidden border border-stone-200">
                {/* Mini header preview */}
                <div className="bg-gradient-to-r from-stone-900 to-stone-800 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500 opacity-50"></div>
                    <span className="text-amber-500/80 text-xs font-semibold tracking-wider uppercase">Analysis</span>
                  </div>
                  <h3 className="text-white text-xl font-bold" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
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
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
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
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
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
            {/* StatCard */}
            <Section>
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                StatCard
              </h2>
              <p className="text-stone-500 mb-6">Hero metric cards for key statistics. Use in 4-column grid.</p>

              <Grid cols={4} gap="md">
                <StatCard title="Default" value="156" subtitle="of 180 capacity" />
                <StatCardWithBreakdown
                  title="With Breakdown"
                  value="+14"
                  variant="positive"
                  breakdown={[
                    { label: 'new', value: '+62', color: 'positive' },
                    { label: 'churned', value: '-48', color: 'negative' }
                  ]}
                />
                <StatCard title="Positive" value="+12%" variant="positive" subtitle="vs last month" />
                <StatCard title="Negative" value="-5%" variant="negative" subtitle="vs last month" />
              </Grid>

              <div className="mt-6 rounded-xl p-5 bg-stone-100">
                <h4 className="font-semibold text-stone-900 mb-3">Props Reference</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <code className="text-violet-600">title</code>
                    <span className="text-stone-500 ml-2">string - Card title</span>
                  </div>
                  <div>
                    <code className="text-violet-600">value</code>
                    <span className="text-stone-500 ml-2">string | number - Main value</span>
                  </div>
                  <div>
                    <code className="text-violet-600">subtitle</code>
                    <span className="text-stone-500 ml-2">string - Description below value</span>
                  </div>
                  <div>
                    <code className="text-violet-600">variant</code>
                    <span className="text-stone-500 ml-2">'default' | 'positive' | 'negative'</span>
                  </div>
                </div>
              </div>
            </Section>

            {/* ChartCard */}
            <Section>
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
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
                    { value: '84%', label: 'Utilization', bgColor: 'bg-emerald-50', textColor: 'text-emerald-600' },
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
                  valueIndicator={{ value: '85%', label: 'Average', bgColor: 'bg-blue-50', textColor: 'text-blue-600' }}
                  expandable
                  height="280px"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={SAMPLE_LINE_DATA} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                      <CartesianGrid strokeDasharray="4 4" stroke="#e7e5e4" vertical={false} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#57534e', fontSize: 14 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#3b82f6', fontSize: 12 }} domain={[70, 100]} tickFormatter={(v) => `${v}%`} />
                      <Line type="monotone" dataKey="percentage" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </SimpleChartCard>
              </Grid>
            </Section>

            {/* ChartCard with Controls */}
            <Section>
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
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
                        { value: 'Chen', label: 'Top (157)', bgColor: 'bg-violet-50', textColor: 'text-violet-600' },
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
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={SAMPLE_BAR_DATA} margin={{ top: 20, right: 20, bottom: 10, left: 20 }}>
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
                  </BarChart>
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
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
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
                      { label: 'Utilization', value: '87%' },
                      { label: 'Show Rate', value: '94%', valueColor: 'text-emerald-600' },
                      { label: 'Open Slots', value: '23', valueColor: 'text-amber-600' },
                      { label: 'Capacity', value: '180' }
                    ]}
                  />
                </Grid>
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
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
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
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
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
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
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

            {/* Usage with ChartCard */}
            <Section>
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
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
                        { value: 'Chen', label: 'Top (148)', bgColor: 'bg-indigo-50', textColor: 'text-indigo-600' },
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
                  <BarChart data={SAMPLE_BAR_DATA} margin={{ top: 20, right: 20, bottom: 10, left: 20 }}>
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
                  </BarChart>
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
        {/* SECTION: CHARTS - Chart Styling Reference                         */}
        {/* ================================================================= */}
        {activeSection === 'charts' && (
          <>
            <Section>
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                Chart Styling Reference
              </h2>
              <p className="text-stone-500 mb-6">Standard Recharts configuration for consistent chart appearance.</p>

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
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
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
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                Typography
              </h2>
              <p className="text-stone-500 mb-6">DM Serif Display for headings and large values, system font for body.</p>

              <div className="rounded-xl p-6 bg-white shadow-sm border border-stone-100">
                <div className="space-y-4">
                  <div className="flex items-baseline gap-4">
                    <span className="text-stone-400 text-sm w-24">Page title</span>
                    <h1 className="text-5xl text-stone-900" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>Page Title</h1>
                  </div>
                  <div className="flex items-baseline gap-4">
                    <span className="text-stone-400 text-sm w-24">Card title</span>
                    <h2 className="text-3xl text-stone-900" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>Card Title</h2>
                  </div>
                  <div className="flex items-baseline gap-4">
                    <span className="text-stone-400 text-sm w-24">Large value</span>
                    <span className="text-6xl font-bold text-stone-900" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>156</span>
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
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
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
              <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
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

        {/* Expanded Chart Modal */}
        <ExpandedChartModal
          isOpen={expandedChart === 'demo'}
          onClose={() => setExpandedChart(null)}
          title="Client Utilization"
          subtitle="Active clients & utilization rate over time"
          legend={[
            { label: 'Active Clients', type: 'box', color: 'bg-gradient-to-b from-amber-400 to-amber-500' },
            { label: 'Utilization %', type: 'line', color: 'bg-emerald-500' }
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
