// =============================================================================
// DEMO DATA GENERATOR - TYPE DEFINITIONS
// =============================================================================
// All TypeScript types for the demo configuration and generated data.
// =============================================================================

// =============================================================================
// PRACTICE IDENTITY
// =============================================================================

export type PracticeSpecialty =
  | 'general'           // General outpatient therapy
  | 'anxiety'           // Anxiety & depression focus
  | 'couples'           // Couples & family therapy
  | 'child'             // Child & adolescent
  | 'trauma'            // Trauma & PTSD specialty
  | 'eating_disorders'  // Eating disorders
  | 'addiction';        // Substance abuse & addiction

export interface PracticeLocation {
  city: string;
  state: string;
  region: 'Northeast' | 'Southeast' | 'Midwest' | 'Southwest' | 'West' | 'Pacific';
}

export interface PracticeIdentity {
  name: string;
  shortName: string;
  location: PracticeLocation;
  specialty: PracticeSpecialty;
  yearEstablished: number;
  logo?: string;
}

// =============================================================================
// CLINICIAN CONFIGURATION
// =============================================================================

export type CredentialType =
  | 'PhD'
  | 'PsyD'
  | 'LCSW'
  | 'LMHC'
  | 'LPC'
  | 'LMFT'
  | 'APC'
  | 'LAC'
  | 'LCPC'
  | 'LLP';

export type ClinicianRole = 'owner' | 'senior' | 'staff' | 'associate';

export interface ClinicianPerformanceProfile {
  revenueLevel: 'high' | 'medium' | 'low';
  retentionStrength: 'strong' | 'average' | 'weak';
  consultationConversion: 'high' | 'medium' | 'low';
  notesCompliance: 'excellent' | 'good' | 'needs_work';
}

export interface ClinicianCaseload {
  targetClients: number;
  currentClients: number;
  sessionGoal: number;
  takeRate: number;
}

export interface ClinicianConfig {
  id: string;
  firstName: string;
  lastName: string;
  credential: CredentialType;
  title: string;
  role: ClinicianRole;
  color: string;
  performanceProfile: ClinicianPerformanceProfile;
  caseload: ClinicianCaseload;
  supervisorId?: string;
  startDate: string;
  isActive: boolean;
  location: string;
}

// =============================================================================
// FINANCIAL CONFIGURATION
// =============================================================================

export type PracticeSize = 'solo' | 'small' | 'medium' | 'large';

export interface PayerMix {
  selfPay: number;      // Percentage 0-100
  insurance: number;
  slidingScale: number;
}

export interface FinancialConfig {
  practiceSize: PracticeSize;
  monthlyRevenueRange: {
    min: number;
    max: number;
  };
  averageSessionRate: number;
  clinicianTakeRate: number;
  supervisorCostRate: number;
  creditCardFeeRate: number;
  revenueGoal: number;
  sessionGoal: number;
  payerMix: PayerMix;
}

// =============================================================================
// PERFORMANCE STORY
// =============================================================================

export type PerformanceNarrative =
  | 'thriving'        // Everything going well, minor optimizations
  | 'growth_phase'    // Expanding, hiring, some growing pains
  | 'stable'          // Steady state, looking to optimize
  | 'struggling'      // Challenges with retention, revenue, or admin
  | 'turnaround'      // Was struggling, now improving
  | 'seasonal_dip';   // In a temporary slow period

export type PerformanceTrend = 'improving' | 'stable' | 'declining';

export interface SessionRetentionMilestones {
  session2: number;   // % reaching session 2
  session5: number;   // % reaching session 5
  session12: number;  // % reaching session 12
  session24: number;  // % reaching session 24
}

export interface PerformanceMetrics {
  // Attendance & Engagement
  showRate: number;
  rebookRate: number;
  cancelRate: number;
  noShowRate: number;

  // Retention
  monthlyChurnRate: number;
  sessionRetention: SessionRetentionMilestones;

  // Consultations
  monthlyConsultations: number;
  consultConversionRate: number;
  daysToFirstSession: number;

  // Admin Health
  notesCompletionRate: number;
  notesOverdueRate: number;

  // Growth
  monthOverMonthGrowth: number;
  newClientsPerMonth: number;
}

export interface Seasonality {
  q1Modifier: number;
  q2Modifier: number;
  q3Modifier: number;
  q4Modifier: number;
}

export interface PerformanceStory {
  narrative: PerformanceNarrative;
  metrics: PerformanceMetrics;
  seasonality: Seasonality;
  trend: PerformanceTrend;
}

// =============================================================================
// DEMO CONFIGURATION (Main Input)
// =============================================================================

export interface DataRange {
  startDate: string;  // ISO date string
  endDate: string;    // ISO date string
}

export interface FeatureFlags {
  showNetRevenue: boolean;
  showInsuranceTab: boolean;
  showAdminTab: boolean;
  enableConsultationsCRM: boolean;
}

export interface DemoConfiguration {
  id: string;
  name: string;
  description: string;

  practice: PracticeIdentity;
  clinicians: ClinicianConfig[];
  financial: FinancialConfig;
  performance: PerformanceStory;

  dataRange: DataRange;
  randomSeed?: number;
  features: FeatureFlags;

  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// GENERATED DATA TYPES (Output)
// =============================================================================

// --- Clinician Output ---

export interface Clinician {
  id: string;
  name: string;
  shortName: string;
  lastName: string;
  initials: string;
  color: string;
  title: string;
  role: ClinicianRole;
  credential: CredentialType;
  supervisorId: string | null;
  takeRate: number;
  sessionGoal: number;
  clientGoal: number;
  startDate: string;
  isActive: boolean;
  location: string;
}

export interface ClinicianSyntheticMetrics {
  showRate: number;
  cancelRates: {
    client: number;
    lateCancellation: number;
    clinician: number;
  };
  noShowRate: number;
  rebookRate: number;
  avgSessionsPerClient: number;
  churnRate: number;
  atRiskClients: number;
  sessionRetention: SessionRetentionMilestones;
  outstandingNotes: number;
  overdueNotes: number;
  notesDueWithin48h: number;
  newClients: number;
  consultationsBooked: number;
  consultationsConverted: number;
}

// --- Payment Data ---

export interface PaymentRecord {
  clinicianId: string;
  clinician: string;
  datePaid: string;
  appointmentDate: string;
  cptCode: string;
  clientId: string;
  amount: number;
}

export interface PracticeSettings {
  capacity: number;
  currentOpenings: number;
  attendance: {
    showRate: number;
    clientCancelled: number;
    lateCancelled: number;
    clinicianCancelled: number;
    rebookRate: number;
  };
  outstandingNotesPercent: number;
  churnWindowDays: number;
}

// --- Monthly Aggregated Data ---

export interface MonthlyRevenueData {
  month: string;
  value: number;
}

export interface MonthlyRevenueBreakdownData {
  month: string;
  grossRevenue: number;
  clinicianCosts: number;
  supervisorCosts: number;
  creditCardFees: number;
  netRevenue: number;
}

export interface MonthlySessionsData {
  month: string;
  completed: number;
  booked: number;
  clients: number;
  cancelled: number;
  clinicianCancelled: number;
  lateCancelled: number;
  noShow: number;
  show: number;
  telehealth: number;
  inPerson: number;
}

export interface MonthlyClientGrowthData {
  month: string;
  activeClients: number;
  capacity: number;
  retained: number;
  new: number;
  churned: number;
  withNextAppt: number;
}

export interface MonthlyChurnData {
  month: string;
  earlyChurn: number;
  mediumChurn: number;
  lateChurn: number;
}

export interface MonthlyChurnByClinicianData {
  month: string;
  [clinicianLastName: string]: number | string;
}

export interface MonthlyConsultationsData {
  month: string;
  consultations: number;
  converted: number;
  totalDaysToFirstSession: number;
  conversionsWithFirstSession: number;
}

export interface MonthlyConsultationsByClinicianData {
  month: string;
  [clinicianLastName: string]: number | string;
}

// --- Clinician Breakdown Data ---

export interface ClinicianRevenueData {
  month: string;
  [clinicianLastName: string]: number | string;
}

export interface ClinicianSessionsData {
  month: string;
  [clinicianLastName: string]: number | string;
}

// --- Client Data ---

export type ClientStatus = 'healthy' | 'at-risk' | 'new' | 'milestone' | 'churned';

export interface ClientRosterEntry {
  id: string;
  name: string;
  initials: string;
  clinicianId: string;
  clinicianName: string;
  clinicianShort: string;
  totalSessions: number;
  lastSeenDays: number;
  nextAppointment: string | null;
  status: ClientStatus;
  milestone?: number;
  churnedDate?: string;
}

export interface AtRiskClient {
  id: string;
  name: string;
  daysSinceLastSession: number;
  totalSessions: number;
  clinician: string;
  riskLevel: 'high' | 'medium' | 'low';
}

export interface MilestoneClient {
  id: string;
  name: string;
  currentSessions: number;
  targetMilestone: number;
  sessionsToGo: number;
  nextAppointment?: string;
  clinician: string;
}

// --- Consultation Data ---

export type ConsultationStage =
  | 'new'
  | 'confirmed'
  | 'consult_complete'
  | 'no_show'
  | 'intake_pending'
  | 'intake_scheduled'
  | 'paperwork_pending'
  | 'paperwork_complete'
  | 'converted'
  | 'lost';

export interface FormResponse {
  fieldId: number;
  fieldName: string;
  value: string;
}

export interface Consultation {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  appointmentId: number;
  appointmentTypeId: number;
  appointmentTypeName: string;
  datetime: string;
  duration: number;
  meetingType: 'google_meet' | 'zoom' | 'phone' | 'in_person';
  meetingLink?: string;
  clinicianId: string;
  clinicianName: string;
  calendarId: number;
  wasTransferred: boolean;
  stage: ConsultationStage;
  followUpCount: number;
  formResponses: FormResponse[];
  createdAt: string;
  updatedAt: string;
  convertedDate?: string;
  lostDate?: string;
  lostReason?: string;
}

export interface ConsultationSource {
  source: string;
  consultations: number;
  converted: number;
  conversionRate: number;
}

export interface ConsultationFunnel {
  booked: number;
  attended: number;
  bookedIntake: number;
  completedPaperwork: number;
  firstSession: number;
}

export interface ConsultationPipelineStage {
  stage: string;
  count: number;
  avgDaysInStage: number;
}

export interface ConsultationPipeline {
  activePipeline: number;
  byStage: ConsultationPipelineStage[];
}

// --- Retention Data ---

export interface RetentionCohort {
  id: string;
  label: string;
  sublabel: string;
  clientCount: number;
  maturity: 'immature' | 'maturing' | 'mature';
  recommended?: boolean;
  summary: {
    clientsAcquired: number;
    clientsChurned: number;
    activeClients: number;
    avgSessionsPerClient: number;
  };
}

export interface RetentionFunnelPoint {
  label: string;
  count: number;
  percentage: number;
  industryAvg: number;
}

export interface RetentionFunnelData {
  sessionsFunnel: RetentionFunnelPoint[];
  timeFunnel: RetentionFunnelPoint[];
}

export interface RetentionBenchmarks {
  avgChurnRate: number;
  avgClientTenure: number;
  avgSession5Retention: number;
  frequencyMultiplierRange: string;
}

export interface FrequencyRetentionData {
  frequency: 'weekly' | 'biweekly' | 'monthly';
  label: string;
  avgSessions: number;
  clientCount: number;
  avgTenureMonths: number;
}

// --- Admin Data ---

export interface NotesStatusData {
  month: string;
  noNote: number;
  unlocked: number;
  locked: number;
}

export interface ClaimsStatusData {
  month: string;
  paid: number;
  rejected: number;
  denied: number;
  deductible: number;
}

export interface ARAgingData {
  month: string;
  current: number;
  days1_30: number;
  days31_60: number;
  days61_plus: number;
}

export interface ReminderDeliveryData {
  month: string;
  sent: number;
  failed: number;
}

export interface ComplianceRisk {
  date: string;
  clientInitials: string;
  clinician: string;
}

export interface TopPastDueClient {
  name: string;
  balance: number;
  worstBucket: string;
}

// --- Priority Cards ---

export type PriorityCardStatus = 'critical' | 'warning' | 'good' | 'info';
export type PriorityCardCategory = 'urgent' | 'attention' | 'opportunity' | 'insight';

export interface PriorityCardStat {
  value: string | number;
  label: string;
  color?: string;
}

export interface PriorityCard {
  id: string;
  title: string;
  aiGuidance: string;
  action: string;
  status: PriorityCardStatus;
  stats: PriorityCardStat[];
  comparisonText?: string;
  category: PriorityCardCategory;
}

// --- Session Timing ---

export interface SessionTimingData {
  day: string;
  hour: number;
  sessions: number;
}

// --- Demographics ---

export interface GenderBreakdown {
  male: number;
  female: number;
  other: number;
  total: number;
}

export interface FrequencyBreakdown {
  weekly: number;
  biweekly: number;
  monthly: number;
  total: number;
}

// --- LTV Data ---

export interface CohortLTVPoint {
  month: number;
  currentYear: number | null;
  priorYear: number | null;
}

export interface CohortLTVData {
  currentYearLabel: string;
  priorYearLabel: string;
  currentYearAvgLTV: number;
  priorYearAvgLTV: number;
  data: CohortLTVPoint[];
}

// =============================================================================
// DEMO DATA (Complete Output)
// =============================================================================

export interface DemoData {
  // Configuration used to generate
  config: DemoConfiguration;
  generatedAt: string;

  // Clinician data
  clinicians: Clinician[];
  clinicianSyntheticMetrics: Record<string, ClinicianSyntheticMetrics>;

  // Payment & Session data
  paymentData: PaymentRecord[];
  practiceSettings: PracticeSettings;

  // Monthly aggregated data
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

  // Session timing heatmap
  sessionTiming: SessionTimingData[];

  // Client data
  clients: {
    roster: ClientRosterEntry[];
    atRisk: AtRiskClient[];
    approachingMilestone: MilestoneClient[];
    recentlyChurned: ClientRosterEntry[];
    demographics: {
      gender: GenderBreakdown;
      frequency: FrequencyBreakdown;
      churnByGender: GenderBreakdown;
      churnByFrequency: FrequencyBreakdown;
    };
  };

  // Consultation CRM
  consultations: {
    pipeline: Consultation[];
    sources: ConsultationSource[];
    funnel: ConsultationFunnel;
    pipelineStatus: ConsultationPipeline;
  };

  // Retention & Cohorts
  retention: {
    cohorts: RetentionCohort[];
    funnels: RetentionFunnelData;
    benchmarks: RetentionBenchmarks;
    frequencyCorrelation: FrequencyRetentionData[];
    cohortLTV: CohortLTVData;
  };

  // Admin data
  admin: {
    complianceRisks: ComplianceRisk[];
    topPastDue: TopPastDueClient[];
    outstandingClaims: { category: string; amount: number }[];
  };

  // Priority insights
  priorityCards: PriorityCard[];
}

// =============================================================================
// PRESET TYPE
// =============================================================================

export interface DemoPreset {
  id: string;
  name: string;
  description: string;
  config: Partial<DemoConfiguration>;
  isBuiltIn: boolean;
}

// =============================================================================
// ANALYSIS DATA TYPES
// =============================================================================

export interface FirstSessionDropoffData {
  session1Count: number;
  session2Count: number;
  benchmarkPercentage: number;
}

export interface RebookRateData {
  month: string;
  rate: number;
}

export interface CurrentHealthData {
  rebookRateData: RebookRateData[];
  avgRebookRate: number;
  totalActiveClients: number;
}

// Alias types for consistency (use existing GenderBreakdown/FrequencyBreakdown)
export type ChurnByGenderData = GenderBreakdown;
export type ChurnByFrequencyData = FrequencyBreakdown;
