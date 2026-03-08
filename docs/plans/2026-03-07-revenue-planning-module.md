# Revenue Planning Module — Product Spec

**Date:** 2026-03-07
**Status:** Draft

## Overview

A live planning spreadsheet that answers: "I want to make $X. What does that require?"

Practice owners work backwards from a revenue goal to an action plan — adjusting existing clinician capacity AND planning new hires simultaneously. Changes cascade instantly. It feels like Excel, but polished.

---

## The Mental Model

It's a **live financial model** — like the Excel they already know, but:
- Polished, not cluttered
- Calculations happen automatically
- Changes cascade instantly
- No formulas to write

---

## The Core Math (Working Backwards)

```
Revenue Goal: $1.5M/year
        ÷ Avg Rate ($185)
Sessions Needed: 8,108/year -> 169/week
        ÷ Avg Sessions per Client (3.2/mo)
Active Clients Needed: 211 at any given time
        + Churn Replacement (3%/mo = 76 clients/year)
New Clients to Acquire: 76/year -> 6-7/month

Who delivers 169 sessions/week?
        |
        v
Current Team Capacity + New Hires = Total Planned
        |
        v
Surplus or Gap vs Goal
```

---

## The Layout

```
+-----------------------------------------------------------------------------------------+
|  Revenue Planning                                                                       |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|  +---------------------------------------------------------------------------------+   |
|  |  ANNUAL GOAL        $[ 1,500,000 ]     Gap: +$180K from current pace            |   |
|  +---------------------------------------------------------------------------------+   |
|                                                                                         |
|  ASSUMPTIONS                                                                            |
|  +--------------------+--------------------+--------------------+------------------+   |
|  | Avg Rate/Session   | Sessions/Client/Mo | Monthly Churn      | Working Wks/Yr   |   |
|  | $[ 185 ]           | [ 3.2 ]            | [ 3.0 ]%           | [ 48 ]           |   |
|  +--------------------+--------------------+--------------------+------------------+   |
|                                                                                         |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|  TEAM CAPACITY                                                                          |
|  +--------------------------------------------------------------------------------------+
|  |                          CURRENT    PLANNED     MAX        SESSIONS   REVENUE    |  |
|  |  CLINICIAN               GOAL       GOAL        CAPACITY   /YEAR      /YEAR      |  |
|  +--------------------------------------------------------------------------------------+
|  |  Sarah Chen              32/wk    > [ 36 ]/wk   40/wk      1,728      $319,680   |  |
|  |  [==================================........]                                    |  |
|  |                                                                                  |  |
|  |  Maria Rodriguez         35/wk    > [ 36 ]/wk   38/wk      1,728      $319,680   |  |
|  |  [======================================...]                                     |  |
|  |                                                                                  |  |
|  |  Priya Patel             32/wk    > [ 34 ]/wk   36/wk      1,632      $301,920   |  |
|  |  [==================================......]                                      |  |
|  |                                                                                  |  |
|  |  James Kim               28/wk    > [ 32 ]/wk   35/wk      1,536      $284,160   |  |
|  |  [==============================............]                                    |  |
|  |                                                                                  |  |
|  |  Michael Johnson         24/wk    > [ 28 ]/wk   32/wk      1,344      $248,640   |  |
|  |  [========================................]                                      |  |
|  +--------------------------------------------------------------------------------------+
|  |  EXISTING TEAM TOTAL    151/wk   > 166/wk                  7,968     $1,474,080  |  |
|  +--------------------------------------------------------------------------------------+
|                                                                                         |
|  + ADD NEW HIRE                                                                         |
|  +--------------------------------------------------------------------------------------+
|  |                          START      RAMP        TARGET     SESSIONS   REVENUE    |  |
|  |  NEW HIRE                DATE       (MONTHS)    GOAL       /YEAR      /YEAR      |  |
|  +--------------------------------------------------------------------------------------+
|  |  New Clinician 1         [ Jun ]    [ 3 ]       [ 32 ]/wk    896*     $165,760   |  |
|  |                          2026                               *partial year        |  |
|  |                                                                                  |  |
|  |  [ + Add Another Hire ]                                                          |  |
|  +--------------------------------------------------------------------------------------+
|  |  NEW HIRES TOTAL                                              896      $165,760  |  |
|  +--------------------------------------------------------------------------------------+
|                                                                                         |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|  +--------------------------------------------------------------------------------------+
|  |  TOTAL PLANNED                        169/wk       8,864      $1,639,840         |  |
|  |  vs GOAL                                                      $1,500,000         |  |
|  |                                                               ----------         |  |
|  |  SURPLUS / (GAP)                                              +$139,840  check   |  |
|  +--------------------------------------------------------------------------------------+
|                                                                                         |
|  CLIENT REQUIREMENTS                                                                    |
|  +--------------------------------------------------------------------------------------+
|  |  To sustain 169 sessions/week:                                                   |  |
|  |                                                                                  |  |
|  |  Active clients needed          [ 220 ]    (169 x 4 / 3.2)                       |  |
|  |  Current active clients           185                                            |  |
|  |  Growth needed                    +35                                            |  |
|  |  + Annual churn replacement       +79      (3% x 220 x 12)                       |  |
|  |  -----------------------------------------                                       |  |
|  |  New clients to acquire           114      > ~10/month                           |  |
|  |                                                                                  |  |
|  +--------------------------------------------------------------------------------------+
|                                                                                         |
|                                                    [ Apply Goals ]  [ Export ]         |
|                                                                                         |
+-----------------------------------------------------------------------------------------+
```

---

## Key Interactions

### Every Bracketed Value is Editable
- `$[ 1,500,000 ]` — type a new goal
- `[ 36 ]/wk` — adjust a clinician's planned goal
- `[ Jun ]` — pick a start month for new hire
- `[ 3 ]` — change ramp period

### Changes Cascade Instantly
Change Sarah's planned goal from 36 > 40:
- Her sessions/year updates: 1,728 > 1,920
- Her revenue/year updates: $319K > $355K
- Existing team total updates
- Total planned updates
- Surplus/gap updates
- Client requirements update

**No save button for the model itself** — it's always live. "Apply Goals" pushes the planned values to actual clinician goals.

### Visual Capacity Bars
Each clinician row shows a simple bar:
```
[==================================........]
       Current goal (32)          Max (40)
```
Filled = planned goal, empty = remaining capacity.

If they set a goal ABOVE max, it turns amber/red as a warning.

---

## Column Definitions

| Column | What It Shows | Editable? |
|--------|---------------|-----------|
| Clinician | Name | No |
| Current Goal | What's set today | No (display only) |
| Planned Goal | What you're modeling | **Yes** |
| Max Capacity | Their ceiling | Yes (set once) |
| Sessions/Year | Planned x working weeks | Auto-calc |
| Revenue/Year | Sessions x avg rate | Auto-calc |

---

## New Hire Section

When they click **[+ Add Another Hire]**:

```
+--------------------------------------------------------------------------------------+
|                          START      RAMP        TARGET     SESSIONS   REVENUE    |
|  NEW HIRE                DATE       (MONTHS)    GOAL       /YEAR      /YEAR      |
+--------------------------------------------------------------------------------------+
|  New Clinician 1         [ Jun v]   [ 3 ]       [ 32 ]/wk    896      $165,760   |
|  New Clinician 2         [ Sep v]   [ 3 ]       [ 30 ]/wk    360      $66,600    |
|  [ + Add Another Hire ]                                                          |
|  [ x ] to remove a row                                                           |
+--------------------------------------------------------------------------------------+
|  NEW HIRES TOTAL                                            1,256     $232,360   |
+--------------------------------------------------------------------------------------+
```

**Ramp logic:** If ramp = 3 months and target = 32/wk:
- Month 1: 16/wk (50%)
- Month 2: 24/wk (75%)
- Month 3: 32/wk (100%)

Sessions/year is computed accounting for partial year + ramp.

---

## The Summary Row

Always visible, always updating:

```
+--------------------------------------------------------------------------------------+
|  TOTAL PLANNED              169/wk       8,864 sessions    $1,639,840            |
|  vs GOAL                                                   $1,500,000            |
|                                                            ----------            |
|  SURPLUS / (GAP)                                           +$139,840  [check]    |
+--------------------------------------------------------------------------------------+
```

- **Green checkmark** when surplus (you're on track or ahead)
- **Red/amber** when gap exists (you need more capacity)

---

## Client Math Section

Updates automatically based on session totals:

```
+--------------------------------------------------------------------------------------+
|  To sustain 169 sessions/week @ 3.2 sessions/client/month:                       |
|                                                                                  |
|  Active clients needed          220                                              |
|  Current active clients         185                                              |
|  -----------------------------------------                                       |
|  Net growth needed              +35                                              |
|                                                                                  |
|  Annual churn (3%/mo)           -79 clients lost                                 |
|  -----------------------------------------                                       |
|  Total acquisition needed       114 new clients > 9-10/month                     |
|                                                                                  |
+--------------------------------------------------------------------------------------+
```

This shows the **client acquisition target** they need to plan for.

---

## Key Assumptions (Configurable)

| Assumption | Default Source | User Can Override? |
|------------|----------------|-------------------|
| Avg rate per session | Historical (trailing 90d) | Yes |
| Avg sessions per client per month | Historical | Yes |
| Monthly client churn rate | Historical | Yes |
| Clinician max capacity | Manual input or inferred from peaks | Yes |
| New clinician ramp time | 3 months default | Yes |
| New clinician target sessions | 32/wk default | Yes |
| Working weeks per year | 48 default | Yes |

---

## Actions

### [Apply Goals]
Pushes all "Planned Goal" values to actual clinician goals in Configure.

Shows confirmation:
> "Update goals for 5 clinicians? This will change their targets in Configure > Clinicians."

### [Export]
PDF or Excel of the plan — for board meetings, investors, or just their records.

---

## Design Notes

### Spreadsheet Feel, Not Spreadsheet Complexity
- Clean grid lines, but generous spacing
- Editable cells have subtle hover states (like a modern spreadsheet)
- No formula bar, no cell references — just the values
- Tiempos Headline for headers, Suisse Intl for data (consistent with rest of app)
- Numbers right-aligned, text left-aligned

### Responsive Behavior
On smaller screens, the table scrolls horizontally — they're used to this from Excel.

### Auto-Save
The model state persists (localStorage or server). They can come back and pick up where they left off. But actual clinician goals only change when they explicitly hit "Apply Goals."

---

## What This Replaces

| Before | After |
|--------|-------|
| Practice Goals (aspirational number) | Revenue Goal (top of this sheet) |
| Clinician Goals (disconnected) | Planned Goal column (feeds the total) |
| No hiring planning | New Hire rows with ramp modeling |
| No client math | Client Requirements section |
| Excel side-models | This one integrated view |

---

## Phase Plan

### Phase 1: Core Planning Grid
- Revenue goal input at top
- Existing clinicians table with current/planned/max columns
- Auto-calculating totals
- Surplus/gap indicator

### Phase 2: New Hire Planning
- Add/remove new hire rows
- Start date and ramp period inputs
- Partial year session calculations

### Phase 3: Client Requirements
- Auto-calculated client math section
- Shows acquisition targets based on churn + growth

### Phase 4: Actions & Export
- "Apply Goals" button to push to Configure
- PDF/Excel export for external sharing

---

## Open Questions

1. **Where does "max capacity" come from?**
   - Option A: User sets it manually per clinician (in Configure)
   - Option B: Inferred from historical peak performance
   - Option C: Default (e.g., 38/wk) with manual override

2. **Should new hire rows persist after they're hired?**
   - Once a hire starts, they become a real clinician in the system
   - The planning row should probably convert or disappear

3. **Integration with Configure?**
   - Should this live inside Configure as a tab?
   - Or standalone module in main nav?

4. **Scenario support?**
   - Save multiple plans? ("Conservative" vs "Aggressive")
   - Or just one working plan at a time?
