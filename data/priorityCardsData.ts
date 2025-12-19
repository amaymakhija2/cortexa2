// Priority Cards Data
// All clinician names use short format from master list: data/clinicians.ts
// Clinicians: Sarah C (Chen), Maria R (Rodriguez), Priya P (Patel), James K (Kim), Michael J (Johnson)

export type CardStatus = "critical" | "warning" | "good" | "insight";
export type StatColor = "red" | "amber" | "emerald" | "white" | "blue";

export interface CardStat {
  value: number | string;
  label: string;
  color?: StatColor;
}

export interface PriorityCard {
  id: string;
  title: string;
  aiGuidance: string;
  action: string;
  status: CardStatus;
  stats: CardStat[];
  comparisonText?: string;
  category: "urgent" | "attention" | "opportunity" | "insight" | "periodic";
  isMonthlyReview?: boolean;
}

// ============================================
// 🔴 URGENT CARDS (Critical)
// ============================================

export const earlyEngagementWarning: PriorityCard = {
  id: "early-engagement-warning",
  title: "Early Engagement Warning",
  aiGuidance: "Priya P has lost 3 of their last 5 new clients before session 3. That's a 60% early drop-off rate — your practice average is 15%. This pattern suggests intake or early engagement issues worth investigating.",
  action: "Review Intake Process",
  status: "critical",
  stats: [
    { value: 5, label: "new clients", color: "white" },
    { value: 3, label: "lost", color: "red" },
    { value: "60%", label: "drop-off", color: "red" },
  ],
  comparisonText: "Practice average: 15%",
  category: "urgent",
};

export const burnoutSignal: PriorityCard = {
  id: "burnout-signal",
  title: "Burnout Signal",
  aiGuidance: "Maria R's patterns have changed significantly this month. Cancellations are up 4x, and she's had 3 same-day schedule changes. These combined signals often indicate burnout. A supportive check-in is recommended.",
  action: "Schedule Check-in",
  status: "critical",
  stats: [
    { value: "4x", label: "increase", color: "red" },
    { value: 3, label: "this month", color: "amber" },
    { value: 1, label: "baseline", color: "white" },
  ],
  comparisonText: "Baseline: 1 cancellation/month",
  category: "urgent",
};

export const lowConsultConversion: PriorityCard = {
  id: "low-consult-conversion",
  title: "Consultation Conversion Problem",
  aiGuidance: "James K has had 8 consultations in the last 60 days but only converted 2 — that's a 25% conversion rate. Your practice average is 65%. Worth reviewing his consultation approach.",
  action: "Review Consultations",
  status: "critical",
  stats: [
    { value: 8, label: "consults", color: "white" },
    { value: 2, label: "converted", color: "red" },
    { value: "25%", label: "rate", color: "red" },
  ],
  comparisonText: "Practice average: 65%",
  category: "urgent",
};

export const outstandingBalances: PriorityCard = {
  id: "outstanding-balances",
  title: "Outstanding Balances",
  aiGuidance: "You have $2,450 in outstanding balances across 4 clients. Jennifer M has the longest outstanding at 12 days ($650). Best practice is to follow up within 7 days.",
  action: "Send Reminders",
  status: "critical",
  stats: [
    { value: "$2.4k", label: "outstanding", color: "red" },
    { value: 4, label: "clients", color: "white" },
    { value: "12d", label: "oldest", color: "amber" },
  ],
  comparisonText: "Best practice: <7 days",
  category: "urgent",
};

export const notesDueSoon: PriorityCard = {
  id: "notes-due-soon",
  title: "Notes Due Soon",
  aiGuidance: "8 session notes are due within 3 days for insurance billing. Sarah C has the most with 4 notes. Late notes delay reimbursement and create audit risk.",
  action: "View Outstanding Notes",
  status: "critical",
  stats: [
    { value: 8, label: "notes", color: "red" },
    { value: "3d", label: "deadline", color: "amber" },
    { value: "Sarah C", label: "most (4)", color: "white" },
  ],
  comparisonText: "Billing deadline: 7 days",
  category: "urgent",
};

// ============================================
// 🟠 ATTENTION CARDS (Warning)
// ============================================

export const rebookNeeded: PriorityCard = {
  id: "rebook-needed",
  title: "Clients Need Rebooking",
  aiGuidance: "6 clients finished sessions recently with nothing scheduled. 2 are high risk (14+ days). Your average rebook time is 2 days — these clients are overdue.",
  action: "View Clients",
  status: "warning",
  stats: [
    { value: 6, label: "clients", color: "amber" },
    { value: 2, label: "high risk", color: "red" },
    { value: "2d", label: "typical", color: "white" },
  ],
  comparisonText: "Your average rebook time: 2 days",
  category: "attention",
};

export const firstSessionDropoff: PriorityCard = {
  id: "first-session-dropoff",
  title: "First Session Drop-off",
  aiGuidance: "28% of new clients this month didn't return after their first session. That's 4 potential long-term clients lost. Industry benchmark is 85% return rate. Review your intake experience.",
  action: "Review Intake Process",
  status: "warning",
  stats: [
    { value: "28%", label: "drop-off", color: "amber" },
    { value: 4, label: "clients", color: "white" },
    { value: "85%", label: "typical", color: "emerald" },
  ],
  comparisonText: "Industry benchmark: 85% return",
  category: "attention",
};

export const cancellationSpike: PriorityCard = {
  id: "cancellation-spike",
  title: "Cancellation Spike",
  aiGuidance: "Maria R had 9 cancellations this month — that's 4x their usual rate of 2. The practice average is 3 cancellations per clinician. Worth a conversation.",
  action: "Explore Data",
  status: "warning",
  stats: [
    { value: 9, label: "this month", color: "amber" },
    { value: 2, label: "typical", color: "white" },
    { value: "4x", label: "increase", color: "red" },
  ],
  comparisonText: "Practice average: 3/month",
  category: "attention",
};

export const revenueBehindPace: PriorityCard = {
  id: "revenue-behind-pace",
  title: "Revenue Behind Pace",
  aiGuidance: "You're $18k behind pace to hit your $100k goal. With 12 days left, you need $1.5k/day to catch up. That's 4 more sessions than your current daily average.",
  action: "View Revenue Details",
  status: "warning",
  stats: [
    { value: "$62k", label: "current", color: "white" },
    { value: "$100k", label: "goal", color: "amber" },
    { value: "$18k", label: "behind", color: "red" },
  ],
  comparisonText: "12 days left in month",
  category: "attention",
};

export const sessionsBehindPace: PriorityCard = {
  id: "sessions-behind-pace",
  title: "Sessions Behind Pace",
  aiGuidance: "You've completed 312 sessions with 10 days left. To hit your 475 goal, you need 163 more — that's 16/day vs your current pace of 12/day.",
  action: "View Sessions Details",
  status: "warning",
  stats: [
    { value: 312, label: "sessions", color: "white" },
    { value: 475, label: "goal", color: "amber" },
    { value: 163, label: "to go", color: "red" },
  ],
  comparisonText: "10 days left in month",
  category: "attention",
};

export const caseloadImbalance: PriorityCard = {
  id: "caseload-imbalance",
  title: "Caseload Imbalance",
  aiGuidance: "Sarah C is at 95% capacity while Michael J is at 38%. Consider rebalancing referrals. Sarah C may be at burnout risk; Michael J has room for 12 more clients.",
  action: "Rebalance Referrals",
  status: "warning",
  stats: [
    { value: "95%", label: "Sarah C", color: "red" },
    { value: "38%", label: "Michael J", color: "amber" },
    { value: "57%", label: "gap", color: "white" },
  ],
  comparisonText: "Michael J has 12 openings",
  category: "attention",
};

export const churnSpike: PriorityCard = {
  id: "churn-spike",
  title: "Higher Than Usual Churn",
  aiGuidance: "You lost 8 clients this month — that's 2x your usual rate of 4/month. Net growth is -3. Review the retention tab to understand patterns.",
  action: "View Retention Details",
  status: "warning",
  stats: [
    { value: 8, label: "clients", color: "red" },
    { value: 4, label: "typical", color: "white" },
    { value: -3, label: "net", color: "red" },
  ],
  comparisonText: "2x your usual churn rate",
  category: "attention",
};

export const rebookRateDropping: PriorityCard = {
  id: "rebook-rate-dropping",
  title: "Rebook Rate Trending Down",
  aiGuidance: "Your rebook rate has dropped from 88% to 79% over the last 3 months. That's 9 percentage points. Clients without next appointments are at risk of churning.",
  action: "View At-Risk Clients",
  status: "warning",
  stats: [
    { value: "79%", label: "current", color: "amber" },
    { value: "88%", label: "3mo ago", color: "white" },
    { value: "↓9", label: "points", color: "red" },
  ],
  comparisonText: "Goal: 85% rebook rate",
  category: "attention",
};

export const clinicianNeedsSupport: PriorityCard = {
  id: "clinician-needs-support",
  title: "Clinician Needs Support",
  aiGuidance: "Michael J is 35% below team average on completed sessions. Their 42 sessions compares to the team average of 65. Consider a supportive check-in or coaching session.",
  action: "Schedule Coaching",
  status: "warning",
  stats: [
    { value: 42, label: "sessions", color: "amber" },
    { value: 65, label: "avg", color: "white" },
    { value: "35%", label: "below", color: "red" },
  ],
  comparisonText: "Team average: 65 sessions",
  category: "attention",
};

export const highValueClientRisk: PriorityCard = {
  id: "high-value-client-risk",
  title: "Long-Term Client at Risk",
  aiGuidance: "Sarah J has been with the practice for 14 months and completed 48 sessions, but hasn't scheduled in 18 days. This is a high-value relationship worth protecting. Reach out personally.",
  action: "Reach Out",
  status: "warning",
  stats: [
    { value: "14mo", label: "tenure", color: "white" },
    { value: 48, label: "sessions", color: "emerald" },
    { value: "18d", label: "no appt", color: "red" },
  ],
  comparisonText: "High-value: 12+ sessions",
  category: "attention",
};

export const sessionFrequencyDropping: PriorityCard = {
  id: "session-frequency-dropping",
  title: "Session Frequency Dropping",
  aiGuidance: "David L has gone from weekly sessions to bi-weekly over the last 4 weeks. Frequency drops often precede churn. Their clinician (Sarah C) should check in about treatment goals.",
  action: "Notify Clinician",
  status: "warning",
  stats: [
    { value: "Weekly", label: "was", color: "white" },
    { value: "Bi-weekly", label: "now", color: "amber" },
    { value: "4wk", label: "trend", color: "red" },
  ],
  comparisonText: "Established client (10+ sessions)",
  category: "attention",
};

export const noShowSpike: PriorityCard = {
  id: "no-show-spike",
  title: "No-Show Spike",
  aiGuidance: "Maria R had 6 no-shows this month — that's 3x their usual rate. No-shows can't be backfilled and often signal client disengagement. Review their caseload for patterns.",
  action: "Review Clients",
  status: "warning",
  stats: [
    { value: 6, label: "no-shows", color: "amber" },
    { value: 2, label: "typical", color: "white" },
    { value: "~$900", label: "lost", color: "red" },
  ],
  comparisonText: "3x baseline rate",
  category: "attention",
};

// ============================================
// 🟢 OPPORTUNITY CARDS (Good)
// ============================================

export const openSlotsThisWeek: PriorityCard = {
  id: "open-slots-this-week",
  title: "Open Slots This Week",
  aiGuidance: "You have 34 open slots this week across 5 clinicians. Michael J has the most availability with 12 slots. Great time to activate your waitlist or increase marketing.",
  action: "Activate Waitlist",
  status: "good",
  stats: [
    { value: 34, label: "slots", color: "emerald" },
    { value: 5, label: "clinicians", color: "white" },
    { value: "Michael J", label: "most (12)", color: "white" },
  ],
  comparisonText: "Utilization: 72%",
  category: "opportunity",
};

export const caseloadOpenings: PriorityCard = {
  id: "caseload-openings",
  title: "Caseload Openings",
  aiGuidance: "Your team can take on 28 new clients. Michael J has the most room with 12 openings. Route new consultations to clinicians with capacity.",
  action: "Route New Clients",
  status: "good",
  stats: [
    { value: 28, label: "openings", color: "emerald" },
    { value: "Michael J", label: "most (12)", color: "white" },
    { value: "72%", label: "filled", color: "white" },
  ],
  comparisonText: "Team capacity: 72% filled",
  category: "opportunity",
};

export const aheadOfGoal: PriorityCard = {
  id: "ahead-of-goal",
  title: "Ahead of Goal",
  aiGuidance: "You're 12% ahead of your revenue goal! At this pace, you'll hit $112k by month end — $12k above target. Keep the momentum going.",
  action: "View Details",
  status: "good",
  stats: [
    { value: "$112k", label: "projected", color: "emerald" },
    { value: "$100k", label: "goal", color: "white" },
    { value: "+$12k", label: "ahead", color: "emerald" },
  ],
  comparisonText: "12% ahead of pace",
  category: "opportunity",
};

export const newClientMomentum: PriorityCard = {
  id: "new-client-momentum",
  title: "Strong Client Acquisition",
  aiGuidance: "You've added 12 new clients this month — your best in 6 months! Sarah C brought in 4. Your client base is growing faster than usual.",
  action: "View Client Details",
  status: "good",
  stats: [
    { value: 12, label: "clients", color: "emerald" },
    { value: 7, label: "avg", color: "white" },
    { value: "Sarah C", label: "top (4)", color: "white" },
  ],
  comparisonText: "Best in 6 months",
  category: "opportunity",
};

export const topPerformer: PriorityCard = {
  id: "top-performer",
  title: "Top Performer",
  aiGuidance: "Sarah C led the team in revenue this month with $32k. That's 28% above the team average. Consider recognition or sharing their approach with the team.",
  action: "View Team Rankings",
  status: "good",
  stats: [
    { value: "$32k", label: "Sarah C", color: "emerald" },
    { value: "$25k", label: "avg", color: "white" },
    { value: "+28%", label: "above", color: "emerald" },
  ],
  comparisonText: "28% above team average",
  category: "opportunity",
};

export const mostImproved: PriorityCard = {
  id: "most-improved",
  title: "Most Improved",
  aiGuidance: "James K improved their completed sessions by 35% this month — from 48 to 65. Great momentum worth acknowledging.",
  action: "View Performance",
  status: "good",
  stats: [
    { value: "+35%", label: "improved", color: "emerald" },
    { value: 65, label: "sessions", color: "white" },
    { value: 48, label: "last month", color: "white" },
  ],
  comparisonText: "Month-over-month improvement",
  category: "opportunity",
};

export const retentionWin: PriorityCard = {
  id: "retention-win",
  title: "Exceptional Retention",
  aiGuidance: "Sarah C has maintained 94% client retention over the last 6 months. Only 2 of their 32 clients churned. Their approach is worth studying.",
  action: "View Retention Details",
  status: "good",
  stats: [
    { value: "94%", label: "retention", color: "emerald" },
    { value: 30, label: "retained", color: "white" },
    { value: 2, label: "churned", color: "white" },
  ],
  comparisonText: "Over last 6 months",
  category: "opportunity",
};

// ============================================
// 📊 INSIGHT CARDS (Blue)
// ============================================

export const churnPattern: PriorityCard = {
  id: "churn-pattern",
  title: "Where Clients Leave",
  aiGuidance: "68% of your churn happens in the first 5 sessions — that's 12 clients. This suggests onboarding or fit issues. Focus your retention efforts on the first 3 sessions.",
  action: "View Retention Details",
  status: "insight",
  stats: [
    { value: "68%", label: "early (<5)", color: "blue" },
    { value: "22%", label: "mid (5-15)", color: "white" },
    { value: "10%", label: "late (15+)", color: "white" },
  ],
  comparisonText: "Focus on first 3 sessions",
  category: "insight",
};

export const revenueTrend: PriorityCard = {
  id: "revenue-trend",
  title: "Revenue Trending Down",
  aiGuidance: "Revenue has declined for 3 consecutive months — from $105k to $88k. That's a 16% drop. Worth investigating the cause.",
  action: "View Revenue Details",
  status: "insight",
  stats: [
    { value: "$88k", label: "current", color: "blue" },
    { value: "$105k", label: "3mo ago", color: "white" },
    { value: "↓16%", label: "drop", color: "amber" },
  ],
  comparisonText: "3 consecutive months",
  category: "insight",
};

export const sessionsTrend: PriorityCard = {
  id: "sessions-trend",
  title: "Sessions Trending Down",
  aiGuidance: "Completed sessions have declined for 3 consecutive months — from 520 to 445. This affects both revenue and clinician utilization.",
  action: "View Sessions Details",
  status: "insight",
  stats: [
    { value: 445, label: "current", color: "blue" },
    { value: 520, label: "3mo ago", color: "white" },
    { value: "↓14%", label: "drop", color: "amber" },
  ],
  comparisonText: "3 consecutive months",
  category: "insight",
};

export const clientQualityAlert: PriorityCard = {
  id: "client-quality-alert",
  title: "Client Quality Declining",
  aiGuidance: "Clients acquired this year have generated $1,200 on average — that's 25% less than last year's clients at this point ($1,600). Your newer clients aren't as engaged or staying as long.",
  action: "View LTV Analysis",
  status: "warning",
  stats: [
    { value: "$1.2k", label: "2025 LTV", color: "amber" },
    { value: "$1.6k", label: "2024 LTV", color: "white" },
    { value: "25%", label: "lower", color: "red" },
  ],
  comparisonText: "Same point in prior year",
  category: "insight",
};

export const marginShift: PriorityCard = {
  id: "margin-shift",
  title: "Margin Dropped",
  aiGuidance: "Your net margin dropped to 18% — down from 24% average. You're keeping $6k less per $100k in revenue. Review your cost structure.",
  action: "View Financials",
  status: "warning",
  stats: [
    { value: "18%", label: "current", color: "amber" },
    { value: "24%", label: "avg", color: "white" },
    { value: "-$6k", label: "per $100k", color: "red" },
  ],
  comparisonText: "vs 3-month average",
  category: "insight",
};

export const revenueConcentration: PriorityCard = {
  id: "revenue-concentration",
  title: "Revenue Concentration Risk",
  aiGuidance: "Sarah C generated 45% of your revenue this month ($42k). If they left or reduced hours, you'd lose nearly half your income. Consider diversifying your caseload distribution.",
  action: "View Team Distribution",
  status: "warning",
  stats: [
    { value: "45%", label: "share", color: "amber" },
    { value: "$42k", label: "Sarah C", color: "white" },
    { value: "$93k", label: "total", color: "white" },
  ],
  comparisonText: "Threshold: 40%",
  category: "insight",
};

export const seasonalHeadsUp: PriorityCard = {
  id: "seasonal-heads-up",
  title: "Seasonal Pattern Ahead",
  aiGuidance: "Historically, January sees a 15% drop in bookings. Last year you had 390 sessions vs your 460 average. Plan your marketing and scheduling accordingly.",
  action: "Plan Ahead",
  status: "insight",
  stats: [
    { value: "↓15%", label: "typical", color: "blue" },
    { value: 390, label: "sessions", color: "white" },
    { value: 460, label: "avg", color: "white" },
  ],
  comparisonText: "January historically",
  category: "insight",
};

export const slotDemandPattern: PriorityCard = {
  id: "slot-demand-pattern",
  title: "Slot Demand Insight",
  aiGuidance: "Evening slots fill 2.5x faster than morning slots. Consider expanding evening availability or offering incentives for morning bookings.",
  action: "View Calendar",
  status: "good",
  stats: [
    { value: "2.5x", label: "evening", color: "emerald" },
    { value: "1x", label: "morning", color: "white" },
    { value: 18, label: "slots", color: "white" },
  ],
  comparisonText: "Fill rate comparison",
  category: "insight",
};

// ============================================
// 📅 PERIODIC SUMMARY CARDS
// ============================================

export const weeklySnapshot: PriorityCard = {
  id: "weekly-snapshot",
  title: "Week of Dec 2",
  aiGuidance: "This week: 85 sessions booked, 22 slots open, 4 clients need rebooking. Following up on outstanding balances is your top priority.",
  action: "View Week",
  status: "insight",
  stats: [
    { value: 85, label: "sessions", color: "blue" },
    { value: 22, label: "slots", color: "white" },
    { value: 4, label: "rebook", color: "amber" },
  ],
  comparisonText: "Top priority for the week",
  category: "periodic",
};

// ============================================
// ALL CARDS EXPORT
// Ordered for optimal demo flow
// ============================================

export const allPriorityCards: PriorityCard[] = [
  // === THE DEMO 5 (first 5 cards they see) ===
  earlyEngagementWarning,   // 1. HOOK - "Priya P lost 60% of new clients" - shocking specificity
  lowConsultConversion,     // 2. MONEY WALKING OUT THE DOOR - "James K converting only 25%" - $12k lost
  burnoutSignal,            // 3. DIFFERENTIATION - "Maria R showing burnout" - no EHR does this
  outstandingBalances,      // 4. MONEY - "$2,450 outstanding" - direct ROI
  caseloadImbalance,        // 5. VALIDATION - "Sarah C 95%, Michael J 38%" - proves what they feel

  // === ACT 2: "My Practice is Leaking" ===
  churnPattern,             // 6. INTELLIGENCE - "68% churn in first 5 sessions" - strategic insight
  rebookNeeded,             // 7. Actionable today
  revenueBehindPace,        // 8. Stakes
  cancellationSpike,        // 8. Pattern detection
  firstSessionDropoff,      // 9. Industry benchmark
  notesDueSoon,             // 10. Compliance risk
  noShowSpike,              // 11. Behavior → dollars

  // === ACT 3: "The System Sees Trends" ===
  rebookRateDropping,       // 12. Trend they couldn't track
  churnSpike,               // 13. Context matters
  clinicianNeedsSupport,    // 14. Coaching opportunity
  highValueClientRisk,      // 15. Protect best clients
  sessionFrequencyDropping, // 16. Individual client insight
  revenueConcentration,     // 17. Risk they never think about
  clientQualityAlert,       // 18. Cohort analysis
  seasonalHeadsUp,          // 19. Predictive

  // === ACT 4: "Celebrate the Wins" ===
  topPerformer,             // 20. Recognition
  mostImproved,             // 21. Growth story
  retentionWin,             // 22. Excellence model
  newClientMomentum,        // 23. Momentum
  aheadOfGoal,              // 24. Win!

  // === ACT 5: "Here's What to Do" ===
  openSlotsThisWeek,        // 25. Fill them
  caseloadOpenings,         // 26. Growth capacity
  slotDemandPattern,        // 27. Optimization

  // === DEEPER ANALYSIS ===
  sessionsBehindPace,       // 28. Pace check
  revenueTrend,             // 29. Long-term view
  sessionsTrend,            // 30. Correlates
  marginShift,              // 31. Profitability

  // === WRAP UP ===
  weeklySnapshot,           // 32. Shows the rhythm
];

// Get cards by category
export const getCardsByCategory = (category: PriorityCard["category"]): PriorityCard[] => {
  return allPriorityCards.filter(card => card.category === category);
};

// Get cards by status
export const getCardsByStatus = (status: CardStatus): PriorityCard[] => {
  return allPriorityCards.filter(card => card.status === status);
};

// Demo priority cards for display (subset for dashboard)
export const demoPriorityCards: PriorityCard[] = [
  earlyEngagementWarning,
  cancellationSpike,
  outstandingBalances,
  openSlotsThisWeek,
  churnPattern,
];
