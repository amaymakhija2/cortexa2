# Cortexa MVP Action Plan

> **Synthesized from**: gap-analysis-to-production.md review comments
> **Date**: December 2024
> **Scope**: What's actually needed for MVP launch

---

## Key Decisions from Review

| Topic | Decision |
|-------|----------|
| **App Type** | Read-only analytics dashboard (no actions on clients/clinicians) |
| **Target User** | Practice owners and staff (NO client access ever) |
| **EHR Integration** | Already handled in onboarding; user selects EHR |
| **Actions** | Not required for MVP - informative only |
| **Consultations/Accounting/Payroll** | Not required for MVP |
| **Insurance/Admin tabs** | Not required for MVP |
| **Notifications** | Not required for MVP |
| **Exports** | Not required for MVP |
| **Mobile native** | Not required for MVP |
| **Multi-location** | Not required for MVP |
| **Time filtering** | Already implemented |
| **User access** | Multi-user YES, but no role-based permissions (all or nothing) |
| **Help & Support** | Required for MVP |
| **Billing** | Required for MVP (Stripe integration) |

---

## MVP Action Items

### 1. Settings Page Expansion (HIGH PRIORITY)

The Settings page needs to become a proper **Practice Configuration Hub**. Currently too basic.

#### 1.1 Practice Configuration Section
- [ ] **Locations Management**
  - Add/edit/remove practice locations
  - Set primary location

- [ ] **Team Structure**
  - Define supervisors
  - Set supervisor-clinician relationships (supervisees)
  - Mark clinicians as active/inactive

- [ ] **Clinician Configuration** (per clinician)
  - Session goal (weekly/monthly target)
  - Client goal (caseload target)
  - Take rate / compensation %
  - Supervisor assignment
  - License type and credentials
  - Start date (tenure)

- [ ] **Practice Goals**
  - Revenue goals (monthly target)
  - Session goals (practice-wide)
  - Attendance goals (target rebook rate)
  - Compliance goals (note deadline: 24h/48h/72h)

- [ ] **Metric Thresholds**
  - Healthy/Attention/Critical thresholds for each metric
  - At-risk client definitions (days since last session)
  - Churn definition (days without appointment)

#### 1.2 EHR Integration Section
- [ ] Show connected EHR name and status
- [ ] Display last sync timestamp
- [ ] Show next available refresh window
- [ ] "Request Refresh" button (with cooldown/countdown)
- [ ] Sync history log (last 5-10 syncs with status)

#### 1.3 Billing Section
- [ ] Link to Stripe Customer Portal
- [ ] Show current plan/subscription status
- [ ] Show billing cycle and next payment date
- [ ] Payment method on file indicator

#### 1.4 User Management Section
- [ ] List of users with access to this practice
- [ ] Invite new user (email invite flow)
- [ ] Remove user access
- [ ] Show who is practice owner vs invited user
- [ ] *No role-based permissions for MVP* - everyone sees everything

---

### 2. Data Sync Status in Sidebar (HIGH PRIORITY)

Add to sidebar (collapsed and expanded states):

- [ ] **Last Refresh Timestamp**
  - "Last synced: 2 hours ago" or "Dec 12, 6:00 AM"

- [ ] **Next Refresh Indicator**
  - "Next refresh available in 4h" or countdown
  - Or "Refresh available now" with button

- [ ] **Refresh Button**
  - Click to request manual refresh
  - Shows loading state during sync
  - Disabled with countdown if on cooldown
  - Smart logic: daily refresh default, but some flexibility

---

### 3. Help & Support System (REQUIRED)

#### 3.1 Contextual Help
- [ ] Add "?" tooltip icons next to every metric
- [ ] Tooltips pull from metric-definitions.md content
- [ ] Consistent placement across all pages

#### 3.2 Onboarding Tour
- [ ] First-time user walkthrough
- [ ] Highlight key areas of dashboard
- [ ] Can be dismissed and re-accessed from settings

#### 3.3 Help Resources
- [ ] Help link in sidebar or settings
- [ ] Links to knowledge base / documentation
- [ ] Contact support option (email or chat widget)

---

### 4. Billing & Subscription (REQUIRED)

#### 4.1 Trial / Paywall Logic
- [ ] 24-hour free access after signup (or alternative trial period TBD)
- [ ] After trial: require payment to continue
- [ ] Paywall screen if subscription lapses

#### 4.2 Stripe Integration
- [ ] Connect Stripe for payment processing
- [ ] Stripe Customer Portal for:
  - Update payment method
  - View invoices
  - Cancel subscription
- [ ] Webhook handling for subscription status changes

#### 4.3 Billing UI in Settings
- [ ] Current plan display
- [ ] "Manage Billing" button → Stripe Portal
- [ ] Subscription status indicator

---

### 5. User Invitation Flow (REQUIRED)

- [ ] Invite user by email
- [ ] Email contains magic link or signup flow
- [ ] Invited user creates password
- [ ] Invited user gets full access (same as owner for MVP)
- [ ] Owner can revoke access
- [ ] Show list of invited users in settings

---

### 6. Password Reset Flow (REQUIRED)

- [ ] "Forgot Password" link on login page
- [ ] Email-based password reset
- [ ] Reset token with expiration
- [ ] New password entry screen

---

### 7. Clinician Details Tab - Complete Sections (MEDIUM PRIORITY)

The Clinician Details tab has placeholder sections. Need to complete:

- [ ] Section 5: Retention (Rebook Rate Trend, Retention Comparison)
- [ ] Section 6: Compliance (Notes Status Card, Overdue Notes List)
- [ ] Section 7: Trends & Team Comparison (Multi-Metric Sparklines, Team Ranking)

---

## Out of Scope for MVP (Confirmed)

These are explicitly NOT needed based on your feedback:

- ❌ Client actions (contact, schedule, discharge)
- ❌ Clinician actions (send summary, schedule 1:1)
- ❌ Practice-level actions (export, share, reminders)
- ❌ Consultations / Lead Pipeline tab
- ❌ Accounting tab
- ❌ Payroll tab
- ❌ Insurance tab (keep as placeholder)
- ❌ Admin tab (keep as placeholder)
- ❌ Notifications system
- ❌ Report builder / scheduled reports
- ❌ CSV/PDF exports
- ❌ Multi-location filtering
- ❌ Role-based permissions
- ❌ Client portal
- ❌ Native mobile app
- ❌ Advanced referral tracking

---

## Summary: MVP Checklist

### Must Build

| # | Item | Effort | Notes |
|---|------|--------|-------|
| 1 | Settings Page - Practice Configuration | Large | Locations, team structure, clinician config, goals, thresholds |
| 2 | Settings Page - EHR Status | Small | Show connected EHR, last sync, refresh button |
| 3 | Settings Page - Billing | Medium | Stripe portal link, subscription status |
| 4 | Settings Page - User Management | Medium | Invite users, list users, remove access |
| 5 | Sidebar - Sync Status | Small | Last refresh, next refresh, refresh button |
| 6 | Password Reset Flow | Small | Forgot password → email → reset |
| 7 | User Invitation Flow | Medium | Email invite → signup → access |
| 8 | Trial/Paywall Logic | Medium | 24h free then require payment |
| 9 | Stripe Integration | Medium | Checkout, portal, webhooks |
| 10 | Help Tooltips | Medium | "?" on every metric with definitions |
| 11 | Onboarding Tour | Small | First-time walkthrough |
| 12 | Clinician Details - Complete Sections | Medium | Finish sections 5, 6, 7 |

### Keep As-Is

- ✅ Dashboard
- ✅ Clinician Ranking
- ✅ Financial Tab
- ✅ Sessions Tab
- ✅ Capacity Tab
- ✅ Retention Tab
- ✅ Client Roster (view-only is fine)
- ✅ Time period filtering (already works)
- ✅ Referral modal (basic version is fine)

### Keep as Placeholder

- Insurance Tab → "Coming Soon"
- Admin Tab → "Coming Soon"
- Consultations → Keep in sidebar as "Coming Soon"
- Accounting → Keep in sidebar as "Coming Soon"
- Payroll → Keep in sidebar as "Coming Soon"

---

## Recommended Build Order

### Phase 1: Core Infrastructure
1. Password reset flow
2. Stripe integration + billing UI
3. Trial/paywall logic

### Phase 2: Settings Expansion
4. Settings page restructure (sections)
5. Practice configuration (locations, team structure)
6. Clinician configuration (goals, thresholds)
7. EHR status display + refresh button
8. User management + invitation flow

### Phase 3: Polish
9. Sidebar sync status indicator
10. Help tooltips across all pages
11. Onboarding tour
12. Complete Clinician Details sections 5-7

---

## Open Items to Decide

1. **Trial Period**: Is 24 hours enough? Or should it be 7 days / 14 days?

2. **Pricing Model**: Per-practice flat fee? Per-clinician? Tiered?

3. **Refresh Limits**: How often can users manually refresh? Once per day? Twice?

4. **Invite Limits**: Max users per practice? Or unlimited?

---

*Action plan created: December 2024*
