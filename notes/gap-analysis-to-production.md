# Cortexa: Gap Analysis & Feature Roadmap to Production

> **Document Purpose**: Complete analysis of features and pages required to take Cortexa from current prototype to production-ready application.
>
> **Date**: December 2024
>
> **Status**: Draft - Awaiting Review

---

## How to Use This Document

Add your feedback, questions, or decisions in the **Response Sections** marked with `> **[YOUR NAME]:**` throughout the document. You can also add comments inline using this format:

```
<!-- COMMENT: Your comment here -->
```

---

## Current State Summary

The app today is a **read-only analytics dashboard** with:
- Practice-level KPIs and alerts
- Clinician rankings and individual performance views
- Financial, sessions, capacity, and retention analytics
- Client roster viewing
- Basic settings (anonymization, net revenue toggle)

> **[REVIEW NEEDED]:** Is this an accurate summary of current state? Anything missing?
>
> _Your response here..._

---

## Critical Gaps to Production-Ready

### 1. Data Input & Configuration (Currently Missing Entirely)

The app assumes data exists but has no way to:

#### 1.1 Practice Onboarding & Setup
- **Practice Profile Setup**: Name, address, NPI, tax ID, timezone, business hours
- **EHR Integration Flow**: Connect to SimplePractice (primary), TherapyNotes, Jane App
  - OAuth connection flow
  - Data sync status and history
  - Field mapping configuration
  - Sync frequency settings
- **Initial Data Import**: Historical data backfill wizard
- **Team Structure Setup**:
  - Define locations (Durham, Chapel Hill, etc.)
  - Define supervisors and reporting lines
  - Set clinician-supervisor relationships

> **[REVIEW NEEDED]:** Which EHRs should we prioritize for launch? SimplePractice only, or others?
>
> _Your response here: On the signup/onboarding flow, the user already selects which EHR they wish to use. From that point on there really shouldn't be much else apart from perhaps in the settings page we should have some information to tell them about the EHR etc.

I do agree that on the sidebar potentially we should be showing the last refresh time stamp and some way for you to experience in the refresh times. We would request a refresh and we could do a countdown or something like that or when we can do the next refresh window. Something smart that will allow us to also give them some flexibility while also pretty much keeping it to a daily refresh most of the time 

I also think we need to add the ability to define the locations, supervisors, supervisees, which clinicians are active in the settings page maybe something a little bit better like structured in the settings page where it's like configuration of your practice or configure all these critical data points that you need to set up your Cortexa system




#### 1.2 Clinician Configuration
- **Add/Edit/Archive Clinician** flow
- **Per-clinician settings**:
  - Session goal (weekly/monthly)
  - Client goal (caseload target)
  - Take rate / compensation %
  - Supervisor assignment
  - License type and credentials
  - Start date (for tenure calculation)
  - Working hours / availability
- **Clinician onboarding checklist** (for new hires)

> **[REVIEW NEEDED]:** What's the minimum clinician configuration needed at launch?
>
> _Your response here I agree we need to be able to set these things up somewhere perhaps in a settings page or configuration page, like I wrote above. Let's think about this carefully..._

#### 1.3 Practice Goals Configuration
- **Revenue goals**: Monthly/quarterly/annual targets
- **Session goals**: Practice-wide and per-clinician
- **Client goals**: Target active client count
- **Attendance goals**: Target rebook rate, max cancel rate
- **Compliance goals**: Note completion deadline (24h, 48h, 72h, etc.)

> **[REVIEW NEEDED]:** Are there other goal types practices care about?
>
> _Your response here: same answer as above..._

#### 1.4 Metric Thresholds Configuration
The app shows "Healthy/Attention/Critical" but no way to customize thresholds:
- Revenue: What % of goal = healthy vs critical?
- Rebook rate: What % = healthy?
- Notes overdue: What count = critical?
- At-risk client definitions (currently hardcoded 7/14/21 days)
- Churn definition (currently hardcoded 30 days)

> **[REVIEW NEEDED]:** Should thresholds be customizable by practice, or should we have smart defaults?
>
> _Your response here: same answer as above..._

---

### 2. Actionable Features (Dashboard Shows Problems, Can't Fix Them)

Currently the app says "Client X is at-risk" but provides no actions.

#### 2.1 Client Actions
- **Contact client**: Send SMS/email reminder from within app
- **Schedule appointment**: Direct booking link or calendar integration
- **Add note/flag**: Internal notes about client status
- **Mark as intentionally inactive**: "Client on vacation" vs truly at-risk
- **Transfer client**: Reassign to different clinician
- **Discharge client**: Formal discharge workflow

> **[REVIEW NEEDED]:** Which client actions are must-have vs nice-to-have for launch?
>
> _Your response here: for the MVP there will be no action ability in the app; it's just informative..._

#### 2.2 Clinician Actions
- **Send performance summary**: Email clinician their metrics
- **Schedule 1:1 review**: Calendar integration for supervision
- **Set performance improvement plan**: Flag clinician, set goals, track progress
- **Assign training/resources**: Link to relevant materials

> **[REVIEW NEEDED]:** Do practice owners actually want to take actions on clinicians from this tool?
>
> _Your response here: nothing of this is required for the MVP..._

#### 2.3 Practice-Level Actions
- **Export reports**: PDF/CSV export for board meetings, accountants
- **Share dashboard**: Read-only link for stakeholders
- **Set reminders**: "Remind me to check X metric weekly"

> **[REVIEW NEEDED]:** Priority of these features?
>
> _Your response here: nothing is required from this for the MVP..._

---

### 3. Missing Analytics Pages

#### 3.1 Consultations / Lead Pipeline (Listed as "Coming Soon")
- **Lead Sources**: Where are new clients coming from?
- **Consultation Funnel**:
  - Inquiry → Consultation scheduled → Consultation completed → Converted to client
  - Drop-off rates at each stage
- **Consultation Scheduler**: Who handles intake calls, availability
- **Waitlist Management**: Clients waiting for openings
- **Lead Attribution**: Which marketing channels work?

> **[REVIEW NEEDED]:** How important is the lead pipeline for launch? Is this a V2 feature?
>
> _Your response here: these modules are not required for the MVP..._

#### 3.2 Accounting Tab (Listed as "Coming Soon")
- **Invoicing Overview**: Outstanding invoices, payment status
- **Accounts Receivable Aging**: 30/60/90+ days overdue
- **Payment Methods**: Credit card vs insurance vs self-pay breakdown
- **Revenue Recognition**: When revenue is earned vs collected
- **Expense Tracking**: (or integration with QuickBooks/Xero)

> **[REVIEW NEEDED]:** Does this overlap with EHR capabilities? What's unique value here?
>
> _Your response here: these modules are not required for the MVP..._

#### 3.3 Payroll Tab (Listed as "Coming Soon")
- **Clinician Compensation Calculator**: Based on sessions × rate
- **Pay Period Summary**: Current period earnings per clinician
- **Historical Payroll**: Past pay periods
- **Contractor vs Employee View**: Different payment structures
- **Tax Document Prep**: 1099 data aggregation

> **[REVIEW NEEDED]:** Is payroll a core feature or a nice-to-have?
>
> _Your response here: these modules are not required for the MVP..._

#### 3.4 Insurance Analytics (Currently Placeholder)
- **Payer Mix Analysis**: Which insurance companies, what % of revenue
- **Claim Status Tracking**: Submitted → Processing → Paid/Denied
- **Denial Management**: Common denial reasons, appeal success rates
- **Credentialing Status**: Which clinicians credentialed with which payers
- **Reimbursement Rate Comparison**: Which payers pay best?
- **Authorization Tracking**: Sessions remaining per client

> **[REVIEW NEEDED]:** How much insurance data is available from SimplePractice API?
>
> _Your response here: these modules are not required for the MVP..._

#### 3.5 Admin Analytics (Currently Placeholder)
- **Note Completion Dashboard**: Not just overdue, but completion trends
- **Audit Log**: Who changed what, when (for compliance)
- **Reminder Delivery Tracking**: SMS/email delivery success rates
- **Form Completion**: Intake forms, consent forms status
- **Compliance Certifications**: Training due dates, license renewals

> **[REVIEW NEEDED]:** Which admin features are table stakes?
>
> _Your response here: these modules are not required for the MVP..._

---

### 4. Missing Core Features

#### 4.1 Notifications & Alerts System
- **In-app notifications**: Bell icon with unread count
- **Email digests**: Daily/weekly summary emails
- **Alert configuration**: Which alerts matter to this user?
- **Escalation rules**: "If X isn't addressed in 3 days, notify Y"
- **Push notifications**: Mobile alerts for critical issues

> **[REVIEW NEEDED]:** What notification channels are must-have?
>
> _Your response here: I don't think notifications are required for the MVP..._

#### 4.2 User Management & Permissions
- **Multiple user accounts**: Currently single login
- **Role-based access**:
  - Practice Owner: Full access
  - Clinical Director: All except financials (or with financials)
  - Office Manager: Admin + scheduling, no clinical
  - Individual Clinician: Own data only
- **User invitation flow**: Email invite, set password
- **Audit trail**: Who viewed what, when

> **[REVIEW NEEDED]:** Is multi-user a launch requirement or can we launch with single-user?
>
> _Your response here: yes I do think you should be able to invite other co-workers but for the MVP there will not be any different tiering. So it's not like you're a clinician so you're going to get access to xyz pages and if you're a practice owner you get access to xyz pages. Like a different set of pages. I think that we should just have the ability to give people access they can see everything or they can't get access at all for the MVP. We can add role-based limitations later..._

#### 4.3 Multi-Location Support
- **Location-level dashboards**: Filter everything by location
- **Location comparison**: Which office performs best?
- **Location-specific goals**: Different targets per location
- **Cross-location clinicians**: Clinicians working multiple sites

> **[REVIEW NEEDED]:** What % of target customers have multiple locations?
>
> _Your response here I don't think this is required. I will add a page later about office-located stuff. I don't think it's priority right now..._

#### 4.4 Time Period & Filtering
- **Date range picker**: Custom date ranges (not just presets)
- **Comparison periods**: "This month vs last month" toggle
- **Year-over-year view**: Compare to same period last year
- **Rolling periods**: Last 30/60/90 days (not just calendar months)

> **[REVIEW NEEDED]:** Current filtering seems adequate. Is this a priority?
>
> _Your response here: from my perspective this is already implemented. I don't understand why you're saying that this is not implemented. Every page already has date selection, time selection, etc..._

---

### 5. Client-Facing / External Features

#### 5.1 Client Portal (Major Feature)
- **Client login**: Secure access for clients
- **Upcoming appointments**: View and request changes
- **Balance & payments**: See balance, make payments
- **Forms**: Complete intake forms, assessments
- **Secure messaging**: HIPAA-compliant communication

> **[REVIEW NEEDED]:** Is client portal in scope at all? This seems like a different product.
>
> _Your response here we are not doing any client access at all. This is an internal app only for therapists..._

#### 5.2 Referral Program (Partially Built)
Current: Basic referral modal with code
Missing:
- **Referral tracking**: Which referrals converted?
- **Payout processing**: Actually pay referrers
- **Referral source attribution**: Track where referred clients come from
- **Custom referral links**: Unique URLs per referrer

> **[REVIEW NEEDED]:** Is the referral system for Cortexa users referring other practices, or for practices referring clients?
>
> _Your response here this is not important. We're not doing any of this. The referral program is for one clinician to refer another practice and get $200 to start using Cortexa, not for client acquisition or any of this..._

---

### 6. Reporting & Exports

#### 6.1 Scheduled Reports
- **Report builder**: Select metrics, time period, recipients
- **Automated delivery**: Weekly/monthly email reports
- **Board report template**: Pre-built executive summary
- **Clinician scorecards**: Individual performance PDFs

> **[REVIEW NEEDED]:** How important are scheduled reports vs on-demand exports?
>
> _Your response here not required for MVP..._

#### 6.2 Data Exports
- **CSV/Excel export**: For external analysis
- **PDF reports**: Formatted for printing/sharing
- **API access**: For practices with their own systems
- **Data backup**: Download all practice data

> **[REVIEW NEEDED]:** CSV export seems like a must-have. Others?
>
> _Your response here not required for MVP..._

---

### 7. Mobile Experience

Current: Responsive design exists but limited
Missing:
- **Mobile-optimized flows**: Touch-friendly interactions
- **Offline capability**: View cached data without connection
- **Native app features**: Push notifications, biometric login
- **Quick actions**: Fast paths to common tasks

> **[REVIEW NEEDED]:** Is mobile web sufficient or do we need native apps?
>
> _Your response here not required for MVP..._

---

### 8. Help & Support

- **Contextual help**: "?" icons explaining each metric
- **Onboarding tour**: First-time user walkthrough
- **Knowledge base**: Searchable help articles
- **In-app chat support**: Talk to Cortexa team
- **Feature request submission**: User feedback loop

> **[REVIEW NEEDED]:** Minimum help features for launch?
>
> _Your response here yes this is required...._

---

### 9. Billing & Subscription (Business Model)

- **Plan selection**: Free trial, pricing tiers
- **Payment method**: Credit card entry, invoicing for larger practices
- **Usage tracking**: If priced by clinician count
- **Upgrade/downgrade flows**: Change plans
- **Cancellation flow**: Offboarding, data export

> **[REVIEW NEEDED]:** What's the monetization model? Per-seat? Flat fee? Usage-based?
>
> _Your response here yes this is important: we won't be giving access to this for free. We will just give you access for 24 hours for free and then after that you'll have to pay.

Or maybe something a bit more sophisticated than that. Perhaps we'll think about it. But yes I think in the settings page there should be a billing profile review which should be connected to your Stripe account and everything should be managed just directly through the Stripe portal..._

---

## Page-by-Page Gap Summary

| Page | Current State | Missing to Production |
|------|---------------|----------------------|
| **Login** | ✅ Basic auth | Password reset, MFA, SSO options |
| **Onboarding** | ⚠️ Exists but minimal | EHR connection, practice setup wizard, data import |
| **Dashboard** | ✅ Strong | Action buttons on alerts, notification center |
| **Clinician Ranking** | ✅ Strong | Export rankings, set goals from here |
| **Clinician Details** | ⚠️ Sections placeholder | Complete all 7 sections, add action buttons |
| **Client Roster** | ⚠️ View only | Client actions (contact, schedule, discharge) |
| **Financial Tab** | ✅ Good analytics | Export, goal setting, invoice drill-down |
| **Sessions Tab** | ✅ Good | Schedule optimization suggestions |
| **Capacity Tab** | ✅ Good | Waitlist integration, availability management |
| **Retention Tab** | ✅ Strong | Automated outreach to at-risk clients |
| **Insurance Tab** | ❌ Placeholder | Full claims tracking, payer analytics |
| **Admin Tab** | ❌ Placeholder | Compliance dashboard, audit logs |
| **Consultations** | ❌ Not built | Full lead/intake CRM |
| **Accounting** | ❌ Not built | AR aging, payment tracking |
| **Payroll** | ❌ Not built | Compensation calculator, pay periods |
| **Settings** | ⚠️ Basic | Full practice config, user management, integrations |
| **Notifications** | ❌ Not built | Alert center, email digests |
| **Reports** | ❌ Not built | Report builder, scheduled exports |
| **Help** | ❌ Not built | Knowledge base, support chat |
| **Billing** | ❌ Not built | Subscription management |

> **[REVIEW NEEDED]:** Does this assessment match your view of current state?
>
> _Your response here..._

---

## Recommended Priority for MVP Launch

### P0 - Must Have for Launch
1. EHR integration flow (the app is useless without real data)
2. Practice & clinician goal configuration
3. Basic user management (at least owner + limited access)
4. Password reset flow
5. Data export (CSV at minimum)
6. Help tooltips on every metric

> **[REVIEW NEEDED]:** Agree with P0 list? Anything to add or remove?
>
> _Your response here..._

### P1 - Expected at Launch
1. Client actions (contact, schedule from roster)
2. Insurance tab (basic claims visibility)
3. Admin tab (notes compliance dashboard)
4. Email notifications for critical alerts
5. Report export (PDF practice summary)

> **[REVIEW NEEDED]:** Agree with P1 list?
>
> _Your response here..._

### P2 - Fast Follow (Weeks After Launch)
1. Consultations/lead pipeline
2. Accounting basics
3. Payroll calculator
4. Scheduled reports
5. Multi-location support

> **[REVIEW NEEDED]:** Agree with P2 list?
>
> _Your response here..._

### P3 - Future Releases
1. Client portal
2. Native mobile app
3. Advanced referral tracking
4. API access
5. Benchmarking vs industry

> **[REVIEW NEEDED]:** Anything in P3 that should be higher priority?
>
> _Your response here..._

---

## New Pages/Flows to Design

1. **Practice Setup Wizard** (multi-step onboarding)
2. **EHR Connection Flow** (OAuth + sync status)
3. **Goals Configuration Page** (practice + per-clinician)
4. **User Management Page** (invite, roles, permissions)
5. **Notifications Center** (bell icon → page)
6. **Report Builder** (select metrics → export)
7. **Consultations Dashboard** (lead pipeline)
8. **Accounting Dashboard** (AR, payments)
9. **Payroll Dashboard** (compensation, pay periods)
10. **Help Center** (knowledge base)
11. **Subscription/Billing Page**
12. **Password Reset Flow**
13. **Client Action Modal** (contact/schedule/discharge)
14. **Clinician Edit Modal** (goals, settings)

> **[REVIEW NEEDED]:** Which of these should we design first?
>
> _Your response here..._

---

## Open Questions for Discussion

1. **Data Source**: Is SimplePractice the only EHR we support at launch, or do we need others?

2. **User Model**: Single-user per practice, or multi-user with roles from day 1?

3. **Actions vs Analytics**: How much of the app should be "do things" vs "see things"?

4. **Scope of Insurance/Admin**: Are these core differentiators or table stakes?

5. **Mobile Strategy**: Responsive web only, or native apps needed?

6. **Monetization**: What's the pricing model and when does it kick in?

> **[REVIEW NEEDED]:** Add any other open questions here.
>
> _Your response here..._

---

## Next Steps

- [ ] Review this document and add responses to all `[REVIEW NEEDED]` sections
- [ ] Schedule sync to discuss priorities and open questions
- [ ] Finalize P0 scope for MVP
- [ ] Begin design work on highest-priority new pages

---

*Document created: December 2024*
*Last updated: December 2024*
