# Configure Page Revamp - Complete Spec

## Navigation

4 tabs in a `SegmentedControl`: **Clinicians** | **Users & Access** | **Practice** | **Connections**

Accent: `violet` (keeps current). Tab icons: `Users` | `Shield` | `Target` | `Link2`

---

## Tab 1: Clinicians

**Mental model:** "My clinical team - who they are, what they're working toward"

This merges the current Members + Clinician Goals tabs. The key insight for our audience: they think about *people*, not *settings categories*. "I want to set up Sarah" shouldn't mean visiting two tabs.

### Layout

**Header area:**
- Title: "Clinicians"
- Subtitle: "Credentials, roles, supervision, and goals for your team"
- Right side: `StatusPill` showing supervision assignment status (e.g., "1 needs supervisor - 4/5") + "Manage EHR Mapping" button

**Main content: The Roster Table**

A single table where each row is a clinician. Columns:

| Clinician | License | Role | Supervision | Sessions Goal | Clients Goal | Status |
|-----------|---------|------|-------------|--------------|-------------|--------|

- **Clinician** - avatar + name + "Since Mar 2023" subtext
- **License** - dropdown (LCSW, LMSW, LMHC, etc.) - changing to LMSW/MHC-LP auto-flags supervision requirement
- **Role** - dropdown (Clinician Only / Clinician and Supervisor / Supervisor Only)
- **Supervision** - the existing `SupervisionChip` component (shows "Independent", "Assign supervisor", or the assigned supervisor with dropdown)
- **Sessions Goal** - inline-editable number with `/wk` suffix. Click to edit, blur to save. Shows previous value on hover with subtle delta indicator (e.g., "up from 28")
- **Clients Goal** - same pattern, no suffix
- **Status** - Active/Inactive toggle pill

### Row Action: Goal History

Each row has a `ChevronRight` or subtle "History" link that opens the existing `GoalHistoryModal`. This is the detailed timeline view of how goals have changed - it's already built and works well.

### The Flow

```
Owner opens Clinicians tab
  -> Sees full team at a glance
  -> Spots amber "Assign supervisor" chip on James Kim
  -> Clicks it -> dropdown -> assigns Sarah Chen -> done
  -> Notices Michael's session goal seems low
  -> Clicks the "28" -> types "32" -> tabs out -> saved
  -> Wants to see Sarah's goal trajectory
  -> Clicks chevron on Sarah's row -> GoalHistoryModal opens
```

**Why this is better:** One screen, zero navigation. The practice owner scans their team, spots issues (amber chips, low goals), and fixes them inline. No "save changes" button for individual fields - each edit auto-persists. The whole experience feels like editing a spreadsheet, which is *exactly what these users already know* from their Excel workflows.

### Smart Behaviors

- When license changes to LMSW/MHC-LP -> supervision chip auto-switches from "Independent" to "Assign supervisor" with amber pulse
- When role changes to include "Supervisor" -> that person becomes available in other clinicians' supervisor dropdowns instantly
- Inactive clinicians dim to 35% opacity and sink to bottom of list
- If all supervision assignments are complete, the `StatusPill` turns emerald "All assigned"

---

## Tab 2: Users & Access

**Mental model:** "Who can log into Cortexa and what can they see"

This is net-new. Critical for multi-location practices - practice owners are paranoid about clinicians seeing revenue data, and supervisors should only see their supervisees.

### Layout

**Header area:**
- Title: "Users & Access"
- Subtitle: "Control who can access Cortexa and what they see"
- Right side: "Invite User" button (emerald gradient)

**Main content: User Table**

| User | Email | Role | Revenue Access | Group |
|------|-------|------|---------------|-------|

- **User** - avatar + name
- **Email** - their login email
- **Role** - dropdown with 4 options:
  - `Owner` - full access to everything (only 1, cannot be changed)
  - `Admin` - full access, can configure settings
  - `Supervisor` - sees their supervisees' data + practice-level aggregates
  - `Viewer` - read-only access to practice-level data
- **Revenue Access** - toggle (yes/no). When off, all dollar amounts are hidden across the platform. This is per-user, regardless of role.
- **Group** - for Supervisor role: auto-populated with their supervisees' names. For others: "All" or blank.

### The Invite Flow

```
Owner clicks "Invite User"
  -> Slide-over panel appears from right
  -> Fields: Name, Email, Role (dropdown), Revenue Access (toggle)
  -> If role = Supervisor, additional step: "This user will see data for:"
    -> Auto-shows the clinicians they supervise (pulled from Clinicians tab)
    -> Can manually add/remove clinicians to their view
  -> Click "Send Invite" -> invitation email sent -> user appears in table as "Pending"
```

### Smart Behaviors

- Owner role is locked - shows a lock icon with tooltip "Practice owner cannot be changed"
- Supervisor role auto-links to the supervision relationships from the Clinicians tab. If Sarah supervises James and Michael, her "Group" automatically shows "James Kim, Michael Johnson"
- Removing someone's Supervisor role shows a confirmation: "Sarah will lose access to individual clinician data for her supervisees. Continue?"
- Pending invites show as a subtle stone-toned row with "Pending" badge and "Resend" action

### What we're NOT building (simplification vs competitor)

- No custom permission groups - just the 4 roles. Keeps it dead simple.
- No per-metric permissions - just the revenue toggle. Our audience doesn't need granular "can see rebook rate but not cancel rate."
- No organizational hierarchy beyond supervisor groups - one level is enough for 5-20 person practices.

---

## Tab 3: Practice

**Mental model:** "How my practice measures success"

This merges Practice Goals + Thresholds, deduplicates the note deadline conflict, and organizes everything by *what you're measuring* rather than *goal vs threshold* (a distinction our audience doesn't care about).

### Layout

**Header area:**
- Title: "Practice Settings"
- Subtitle: "Goals, definitions, and how metrics are calculated"
- Right side: "Save Changes" button (appears only when dirty, emerald gradient with check icon)

**Main content: Stacked sections, not a grid of cards**

The current Practice Goals uses a 2x2 card grid, and Thresholds uses another set of cards. This creates a lot of visual noise. Instead: clean stacked sections with clear dividers.

#### Section 1: Practice Goals

A clean row of 3 goal inputs, side by side:

```
+--------------------+  +--------------------+  +--------------------+
|  Monthly Revenue   |  |  Monthly Sessions  |  |  Target Rebook     |
|     $125,000       |  |       520          |  |       90%          |
|  $1.5M/year        |  |  130/week          |  |  Industry: 85%     |
+--------------------+  +--------------------+  +--------------------+
```

Each is a `ConfigCard` with:
- Icon + label at top
- Large inline-editable value (Tiempos Headline serif, big)
- Contextual subtext (annual projection, weekly breakdown, industry benchmark)

This is simpler than the current implementation - no color accent bars, no slider for rebook rate (just a number input with % suffix). Clean.

#### Section 2: Client Definitions

**"How do you define an active client?"**

Two radio-style options (keep the current design - it works well):
- **SimplePractice Status** - active = "Active" in SP
- **Activity-Based** - active = had appointment within X days (expandable input)

**"At-Risk Client Thresholds"**

Three inline inputs in a row: Low Risk (X days), Medium Risk (X days), High Risk (X days). Color-coded emerald/amber/rose. Keep current design - the colored cards with big number inputs are excellent and match the audience's need for visual clarity.

**"Churn Timing"**

Three inline inputs: Early Churn (<X sessions), Medium Churn (auto-range), Late Churn (>X sessions). Keep current design.

#### Section 3: Session & Compliance Rules

A simpler section with just 2 settings in a horizontal row:

```
+--------------------+  +--------------------+
|  Late Cancel       |  |  Note Deadline     |
|  Window            |  |                    |
|    24 hours        |  |    48 hours        |
|  before appt       |  |  after session     |
+--------------------+  +--------------------+
```

**Note deadline is ONE setting** - currently it exists in both Practice Goals (as hours with button selector) and Thresholds (as days with number input). We pick one: **hours, with the button selector** (24h / 48h / 72h / 96h). The button selector is more friendly for our audience than a freeform number input.

#### Section 4: Performance Bands

**"When is performance healthy vs concerning?"**

Two side-by-side cards for Revenue Status and Rebook Rate Status, each with two sliders: "Healthy above X%" and "Critical below X%". Keep the current slider design - it's visual and intuitive.

#### Section 5: Calendar Settings (NEW)

A simple section:

```
+------------------------------------------+
|  Calendar Year                            |
|  Working weeks per year: [50]             |
|  "Accounts for 2 weeks PTO. Utilization   |
|   goals will scale accordingly."          |
+------------------------------------------+
```

One input. That's it. The competitor makes this confusing with pay periods and complex PTO math. We just ask: "How many weeks does your practice work per year?" and we do the math.

### The Flow

```
Owner opens Practice tab
  -> Sees their 3 goals at the top - quick gut check
  -> Scrolls to Client Definitions - "oh, we're using SP status, that's right"
  -> Notices note deadline is 72h, wants to tighten to 48h
  -> Clicks 48h button -> button highlights -> "Save Changes" appears top-right
  -> Clicks Save -> done
  -> Scrolls to Performance Bands -> adjusts rebook "healthy" from 85% to 90%
  -> Save -> done
```

**Why this is better:** Everything about "how the practice works" is on one scrollable page. No tab-switching between "goals" and "thresholds." The vertical scroll is natural and the sections are visually distinct. The owner can do a full practice settings audit in one pass.

---

## Tab 4: Connections

**Mental model:** "How Cortexa gets its data and how that data is interpreted"

This merges EHR + Locations + adds Service Mapping. Organized as a vertical flow: connect -> map locations -> map clinicians -> map services. This mirrors the actual data pipeline.

### Layout

**Header area:**
- Title: "Connections"
- Subtitle: "EHR sync, location mapping, and service configuration"

**Main content: Vertically stacked sections with completion indicators**

Each section has a `StatusPill` in its header showing mapping progress.

#### Section 1: EHR Connection

Simplified to a single horizontal card:

```
+-------------------------------------------------------------+
| SimplePractice  Connected                                    |
| Last sync: Dec 12, 2024  -  156 clients  -  5 clinicians    |
|                                              [Refresh Now]   |
+-------------------------------------------------------------+
```

One card. Not three. Our audience doesn't need a separate card for "next sync countdown" - that's information they'll never act on.

#### Section 2: Location Mapping

Keep the existing `OfficeMapping` component - it's already well-designed with the drag-and-drop assignment of EHR offices to logical locations.

Header shows: `StatusPill` - "2 unassigned - 3/5" or "All assigned - 5/5"

#### Section 3: Clinician Mapping

The existing `ClinicianMapping` component, but embedded inline instead of as a separate navigation flow. Shows which EHR clinician records map to which Cortexa clinicians.

Header shows: `StatusPill` - "All mapped - 5/5" or "2 unassigned"

This is important for practices where one person has multiple EHR accounts (e.g., "Sarah Chen" and "Sarah Chen - Supervision" both map to the same clinician).

#### Section 4: Service Mapping (NEW)

**Header:**
- "Service Mapping"
- Subtitle: "Categorize your EHR appointment types so metrics are calculated correctly"
- `StatusPill` - "3 uncategorized - 12/15"

**The 4-Bucket Layout:**

4 collapsible sections, each a bucket, with a simple dropdown on each service to move it between buckets.

```
v Sessions (8 services)                              All categorized
  Counts toward completed sessions and utilization goals

  +-------------------------------------------------------------+
  | Service                              | Code    | Category    |
  |------------------------------------------------------+------|
  | Psychotherapy, 60 min                | 90837   | Session   v |
  | Psychotherapy, 45 min                | 90834   | Session   v |
  | Psychotherapy, 30 min                | 90832   | Session   v |
  | Psychiatric Diagnostic Evaluation    | 90791   | Intake    v |
  | Family psychotherapy, conjoint       | 90847   | Session   v |
  | ...                                                          |
  +-------------------------------------------------------------+

v Cancellations (0 services)
  These count toward cancel rate

  (empty - cancellations are detected by attendance status)

v Other Activities (2 services)
  Tracked but don't count toward session goals

  +-------------------------------------------------------------+
  | Supervision for LMSW/MHC-LP          | S100    | Supervision |
  | Session too short to bill             | **Time**| Other       |
  +-------------------------------------------------------------+

v Excluded (2 services)
  Hidden from all reports

  +-------------------------------------------------------------+
  | Training Session                      | T100    |     -       |
  | Initial Consultation - No Charge      | 00000   |     -       |
  +-------------------------------------------------------------+
```

**Moving a service between buckets:** Each service row has a small menu or "Move to..." dropdown. Click -> select destination bucket -> service animates out and into the new bucket.

**Category dropdown** (within Sessions and Other Activities): "Session", "Intake", "Supervision", "Admin", "Group", "Other". This sub-categorization matters for reporting breakdowns.

**Uncategorized services** appear at the very top in an amber-highlighted "Needs Attention" section with quick-assign buttons right in the row - one click to categorize:

```
! Uncategorized (3 services)                    Assign these to a bucket
  +-------------------------------------------------------------+
  | New Service From EHR     | 99999   | [Sessions] [Other] [Exclude] |
  +-------------------------------------------------------------+
```

**Auto-categorization on first sync (differentiator):**

When the EHR first syncs, we auto-assign based on CPT code ranges:
- `90832-90840` -> Sessions (Session)
- `90791` -> Sessions (Intake)
- `90846-90847` -> Sessions (Session)
- Known supervision codes -> Other Activities (Supervision)

The owner sees their services pre-categorized with a banner: "We auto-categorized 12 of 15 services based on CPT codes. Review and adjust below." This saves them 90% of the setup work - massive win for time-starved users.

### The Flow

```
Owner opens Connections tab for the first time
  -> Sees EHR connected
  -> Locations: "2 unassigned" - clicks to expand, drags offices to locations
  -> Clinicians: "All mapped" - auto-mapped, nothing to do
  -> Services: "3 uncategorized" - amber banner at top
    -> Sees auto-categorized services already sorted into buckets
    -> 3 new/unusual services in the "Uncategorized" section
    -> Clicks [Exclude] on "Training Session" -> it slides to Excluded
    -> Clicks [Sessions] on "New Therapy Code" -> it slides to Sessions
    -> Clicks [Other] on "Admin Block" -> slides to Other Activities
    -> StatusPill turns emerald "All categorized - 15/15"
  -> Done. Full data pipeline configured.
```

---

## Cross-Tab Smart Connections

These are the moments that make the configuration feel *intelligent* rather than like a dumb form:

1. **Clinicians <-> Users & Access:** When you set someone's role to "Clinician and Supervisor" in the Clinicians tab, and that person has a User account, their User role auto-suggests "Supervisor" with their supervisees pre-populated in their group.

2. **Clinicians <-> Connections:** The Clinician Mapping section in Connections references the same clinician list. Adding a clinician in the Clinicians tab creates a new mapping slot in Connections.

3. **Practice <-> Clinicians:** Practice-level session goals show a computed hint: "Your 5 clinicians have combined weekly goals of 160 sessions. That's ~640/month." - directly connected to the per-clinician goals in the Clinicians tab.

4. **Connections -> Everything:** Service mapping determines which appointments count as "sessions." This flows into session counts, utilization, rebook rate - everything. A small info tooltip on the Service Mapping header explains this: "This determines how every metric in Cortexa is calculated."

---

## What We're Cutting

| Current | Action | Why |
|---------|--------|-----|
| Pipeline/Consultation Flow tab | Comment out | Not ready yet |
| TeamStructureTab component | Delete | Supervision lives in Clinicians tab |
| Duplicate note deadline (Thresholds) | Remove | One setting in Practice tab |
| 3-card EHR layout | Simplify to 1 card | Over-designed for the info shown |
| Separate Clinician Goals tab | Merge into Clinicians | One place for people |
| Separate "Manage EHR Mapping" flow | Inline in Connections | No navigation jumps |
