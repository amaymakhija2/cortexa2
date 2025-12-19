import { useMemo } from 'react';
import {
  CLINICIANS,
  CLINICIAN_SYNTHETIC_METRICS,
  CREDENTIAL_LABELS,
  getSupervisors,
  CredentialType,
  Clinician,
} from '../data/clinicians';
import { MOCK_CONSULTATIONS } from '../data/consultations';
import { useClinicianMetricsForPeriod, useClinicianMetricsForMonth, ClinicianMetricsCalculated } from './useClinicianMetrics';

// =============================================================================
// CONSULTATION METRICS HELPERS
// =============================================================================

// Get consultation metrics for a clinician in a given month
function getClinicianConsultationMetrics(clinicianId: string, month: number, year: number) {
  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);

  const isInMonth = (dateStr: string | undefined) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    return date >= startOfMonth && date <= endOfMonth;
  };

  // Filter consultations for this clinician
  const clinicianConsults = MOCK_CONSULTATIONS.filter(c => c.clinicianId === clinicianId);

  // Booked this month
  const booked = clinicianConsults.filter(c => isInMonth(c.createdAt)).length;

  // Converted this month
  const converted = clinicianConsults.filter(c =>
    c.stage === 'converted' && isInMonth(c.convertedDate)
  ).length;

  // Lost this month
  const lost = clinicianConsults.filter(c =>
    c.stage === 'lost' && isInMonth(c.lostDate)
  ).length;

  // Conversion rate (of closed consultations)
  const closed = converted + lost;
  const conversionRate = closed > 0 ? (converted / closed) * 100 : 0;

  return { booked, converted, lost, conversionRate };
}

// Get consultation metrics for a clinician over last 12 months
function getClinicianConsultationMetricsLast12Months(clinicianId: string) {
  const now = new Date();
  let totalBooked = 0;
  let totalConverted = 0;
  let totalLost = 0;

  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const metrics = getClinicianConsultationMetrics(clinicianId, date.getMonth(), date.getFullYear());
    totalBooked += metrics.booked;
    totalConverted += metrics.converted;
    totalLost += metrics.lost;
  }

  const totalClosed = totalConverted + totalLost;
  const conversionRate = totalClosed > 0 ? (totalConverted / totalClosed) * 100 : 0;

  return { booked: totalBooked, converted: totalConverted, lost: totalLost, conversionRate };
}

// =============================================================================
// TYPES
// =============================================================================

export type CompareDimension = 'location' | 'supervisor' | 'credential';
export type CompareViewMode = 'last-12-months' | 'live' | 'historical';

// Metrics for Last 12 Months (aggregate)
export interface AggregateMetrics {
  id: string;
  label: string;
  clinicianCount: number;
  clinicianIds: string[];
  revenue: number;
  completedSessions: number;
  avgWeeklySessions: number;
  sessionGoalPercent: number;
  clientsSeen: number;
  churnRate: number;
  cancelRate: number;
  outstandingNotes: number;
  // Consultation metrics
  consultationsBooked: number;
  newClients: number;
  conversionRate: number;
}

// Metrics for Live/Historical (point-in-time)
export interface PointInTimeMetrics {
  id: string;
  label: string;
  clinicianCount: number;
  clinicianIds: string[];
  revenue: number;
  completedSessions: number;
  activeClients: number;
  caseloadCapacity: number;
  churnRate: number;
  cancelRate: number;
  outstandingNotes: number;
  // Consultation metrics
  consultationsBooked: number;
  newClients: number;
  conversionRate: number;
}

export interface CompareDataAggregate {
  viewMode: 'last-12-months';
  dimension: CompareDimension;
  groups: AggregateMetrics[];
  loading: boolean;
  error: Error | null;
}

export interface CompareDataPointInTime {
  viewMode: 'live' | 'historical';
  dimension: CompareDimension;
  groups: PointInTimeMetrics[];
  loading: boolean;
  error: Error | null;
}

export type CompareData = CompareDataAggregate | CompareDataPointInTime;

// =============================================================================
// AGGREGATION LOGIC
// =============================================================================

function getClinicianGroup(clinician: Clinician, dimension: CompareDimension): string | null {
  switch (dimension) {
    case 'location':
      return clinician.location;
    case 'supervisor':
      return clinician.supervisorId || clinician.id;
    case 'credential':
      return clinician.credentialType;
    default:
      return null;
  }
}

function getGroupLabel(groupId: string, dimension: CompareDimension): string {
  switch (dimension) {
    case 'location':
      return groupId;
    case 'supervisor': {
      const supervisor = CLINICIANS.find(c => c.id === groupId);
      return supervisor ? `${supervisor.shortName}'s Team` : 'Unknown Team';
    }
    case 'credential':
      return CREDENTIAL_LABELS[groupId as CredentialType] || groupId;
    default:
      return groupId;
  }
}

// Aggregate metrics for Last 12 Months view
function aggregateMetricsForPeriod(
  clinicians: Clinician[],
  calculatedMetrics: ClinicianMetricsCalculated[],
  dimension: CompareDimension
): AggregateMetrics[] {
  const groups = new Map<string, Clinician[]>();

  for (const clinician of clinicians) {
    if (!clinician.isActive) continue;
    const groupId = getClinicianGroup(clinician, dimension);
    if (!groupId) continue;
    if (!groups.has(groupId)) groups.set(groupId, []);
    groups.get(groupId)!.push(clinician);
  }

  const result: AggregateMetrics[] = [];

  for (const [groupId, groupClinicians] of groups) {
    const clinicianIds = groupClinicians.map(c => c.id);
    const groupCalcMetrics = calculatedMetrics.filter(m => clinicianIds.includes(m.clinicianId));

    const totalRevenue = groupCalcMetrics.reduce((sum, m) => sum + m.revenue, 0);
    const totalSessions = groupCalcMetrics.reduce((sum, m) => sum + m.completedSessions, 0);
    const totalClientsSeen = groupCalcMetrics.reduce((sum, m) => sum + m.activeClients, 0);

    // Average weekly sessions (52 weeks in a year)
    const avgWeeklySessions = totalSessions / 52;

    // Session goal % = completed sessions / (sum of monthly goals * 12)
    const totalMonthlySessionGoal = groupClinicians.reduce((sum, c) => sum + c.sessionGoal, 0);
    const totalAnnualSessionGoal = totalMonthlySessionGoal * 12;
    const sessionGoalPercent = totalAnnualSessionGoal > 0
      ? (totalSessions / totalAnnualSessionGoal) * 100
      : 0;

    // Get synthetic metrics for churn and cancel rates
    let totalCancelRate = 0;
    let totalChurnRate = 0;
    let totalOutstandingNotes = 0;
    let countWithMetrics = 0;

    for (const clinician of groupClinicians) {
      const syntheticMetrics = CLINICIAN_SYNTHETIC_METRICS[clinician.id];
      if (syntheticMetrics) {
        totalCancelRate += syntheticMetrics.clientCancelRate + syntheticMetrics.clinicianCancelRate;
        totalChurnRate += syntheticMetrics.churnRate;
        totalOutstandingNotes += syntheticMetrics.outstandingNotes;
        countWithMetrics++;
      }
    }

    const avgCancelRate = countWithMetrics > 0 ? totalCancelRate / countWithMetrics : 0;
    const avgChurnRate = countWithMetrics > 0 ? totalChurnRate / countWithMetrics : 0;

    // Aggregate consultation metrics for all clinicians in the group
    let totalConsultationsBooked = 0;
    let totalNewClients = 0;
    let totalConvertedConsults = 0;
    let totalLostConsults = 0;

    for (const clinician of groupClinicians) {
      const consultMetrics = getClinicianConsultationMetricsLast12Months(clinician.id);
      totalConsultationsBooked += consultMetrics.booked;
      totalNewClients += consultMetrics.converted; // New clients = converted consultations
      totalConvertedConsults += consultMetrics.converted;
      totalLostConsults += consultMetrics.lost;
    }

    const totalClosedConsults = totalConvertedConsults + totalLostConsults;
    const groupConversionRate = totalClosedConsults > 0
      ? (totalConvertedConsults / totalClosedConsults) * 100
      : 0;

    result.push({
      id: groupId,
      label: getGroupLabel(groupId, dimension),
      clinicianCount: groupClinicians.length,
      clinicianIds,
      revenue: totalRevenue,
      completedSessions: totalSessions,
      avgWeeklySessions: Math.round(avgWeeklySessions * 10) / 10,
      sessionGoalPercent: Math.round(sessionGoalPercent),
      clientsSeen: totalClientsSeen,
      churnRate: Math.round(avgChurnRate * 10) / 10,
      cancelRate: Math.round(avgCancelRate),
      outstandingNotes: totalOutstandingNotes,
      consultationsBooked: totalConsultationsBooked,
      newClients: totalNewClients,
      conversionRate: Math.round(groupConversionRate),
    });
  }

  return result;
}

// Point-in-time metrics for Live/Historical view
function aggregateMetricsForMonth(
  clinicians: Clinician[],
  calculatedMetrics: ClinicianMetricsCalculated[],
  dimension: CompareDimension,
  month: number,
  year: number
): PointInTimeMetrics[] {
  const groups = new Map<string, Clinician[]>();

  for (const clinician of clinicians) {
    if (!clinician.isActive) continue;
    const groupId = getClinicianGroup(clinician, dimension);
    if (!groupId) continue;
    if (!groups.has(groupId)) groups.set(groupId, []);
    groups.get(groupId)!.push(clinician);
  }

  const result: PointInTimeMetrics[] = [];

  for (const [groupId, groupClinicians] of groups) {
    const clinicianIds = groupClinicians.map(c => c.id);
    const groupCalcMetrics = calculatedMetrics.filter(m => clinicianIds.includes(m.clinicianId));

    const totalRevenue = groupCalcMetrics.reduce((sum, m) => sum + m.revenue, 0);
    const totalSessions = groupCalcMetrics.reduce((sum, m) => sum + m.completedSessions, 0);
    const totalActiveClients = groupCalcMetrics.reduce((sum, m) => sum + m.activeClients, 0);

    // Caseload capacity: active clients / client goal
    const totalClientGoal = groupClinicians.reduce((sum, c) => sum + c.clientGoal, 0);
    const caseloadCapacity = totalClientGoal > 0
      ? (totalActiveClients / totalClientGoal) * 100
      : 0;

    // Get synthetic metrics
    let totalCancelRate = 0;
    let totalChurnRate = 0;
    let totalOutstandingNotes = 0;
    let countWithMetrics = 0;

    for (const clinician of groupClinicians) {
      const syntheticMetrics = CLINICIAN_SYNTHETIC_METRICS[clinician.id];
      if (syntheticMetrics) {
        totalCancelRate += syntheticMetrics.clientCancelRate + syntheticMetrics.clinicianCancelRate;
        totalChurnRate += syntheticMetrics.churnRate;
        totalOutstandingNotes += syntheticMetrics.outstandingNotes;
        countWithMetrics++;
      }
    }

    const avgCancelRate = countWithMetrics > 0 ? totalCancelRate / countWithMetrics : 0;
    const avgChurnRate = countWithMetrics > 0 ? totalChurnRate / countWithMetrics : 0;

    // Aggregate consultation metrics for all clinicians in the group for this month
    let totalConsultationsBooked = 0;
    let totalNewClients = 0;
    let totalConvertedConsults = 0;
    let totalLostConsults = 0;

    for (const clinician of groupClinicians) {
      const consultMetrics = getClinicianConsultationMetrics(clinician.id, month, year);
      totalConsultationsBooked += consultMetrics.booked;
      totalNewClients += consultMetrics.converted;
      totalConvertedConsults += consultMetrics.converted;
      totalLostConsults += consultMetrics.lost;
    }

    const totalClosedConsults = totalConvertedConsults + totalLostConsults;
    const groupConversionRate = totalClosedConsults > 0
      ? (totalConvertedConsults / totalClosedConsults) * 100
      : 0;

    result.push({
      id: groupId,
      label: getGroupLabel(groupId, dimension),
      clinicianCount: groupClinicians.length,
      clinicianIds,
      revenue: totalRevenue,
      completedSessions: totalSessions,
      activeClients: totalActiveClients,
      caseloadCapacity: Math.round(caseloadCapacity),
      churnRate: Math.round(avgChurnRate * 10) / 10,
      cancelRate: Math.round(avgCancelRate),
      outstandingNotes: totalOutstandingNotes,
      consultationsBooked: totalConsultationsBooked,
      newClients: totalNewClients,
      conversionRate: Math.round(groupConversionRate),
    });
  }

  return result;
}

// =============================================================================
// HOOKS
// =============================================================================

// Hook for Last 12 Months (aggregate) view
export function useCompareMetricsAggregate(dimension: CompareDimension): CompareDataAggregate {
  const { data: clinicianMetrics, loading, error } = useClinicianMetricsForPeriod('last-12-months');

  const groups = useMemo(() => {
    if (!clinicianMetrics || clinicianMetrics.length === 0) return [];
    return aggregateMetricsForPeriod(CLINICIANS, clinicianMetrics, dimension);
  }, [clinicianMetrics, dimension]);

  return {
    viewMode: 'last-12-months',
    dimension,
    groups,
    loading,
    error,
  };
}

// Hook for Live/Historical (point-in-time) view
export function useCompareMetricsPointInTime(
  dimension: CompareDimension,
  month: number,
  year: number,
  isLive: boolean
): CompareDataPointInTime {
  const { data: clinicianMetrics, loading, error } = useClinicianMetricsForMonth(month, year);

  const groups = useMemo(() => {
    if (!clinicianMetrics || clinicianMetrics.length === 0) return [];
    return aggregateMetricsForMonth(CLINICIANS, clinicianMetrics, dimension, month, year);
  }, [clinicianMetrics, dimension, month, year]);

  return {
    viewMode: isLive ? 'live' : 'historical',
    dimension,
    groups,
    loading,
    error,
  };
}

// Combined hook that returns the right data based on view mode
export function useCompareMetrics(
  dimension: CompareDimension,
  viewMode: CompareViewMode,
  month?: number,
  year?: number
): CompareData {
  const now = new Date();
  const activeMonth = month ?? now.getMonth();
  const activeYear = year ?? now.getFullYear();

  // Fetch both - only one will be used based on viewMode
  const aggregateData = useCompareMetricsAggregate(dimension);
  const pointInTimeData = useCompareMetricsPointInTime(
    dimension,
    activeMonth,
    activeYear,
    viewMode === 'live'
  );

  if (viewMode === 'last-12-months') {
    return aggregateData;
  }
  return pointInTimeData;
}

// =============================================================================
// DIMENSION HELPERS
// =============================================================================

export function getDimensionOptions(): { id: CompareDimension; label: string; available: boolean }[] {
  const activeClinicians = CLINICIANS.filter(c => c.isActive);

  const locations = new Set(activeClinicians.map(c => c.location));
  const hasMultipleLocations = locations.size > 1;

  const supervisors = getSupervisors();
  const hasSupervisors = supervisors.length > 0;

  const credentials = new Set(activeClinicians.map(c => c.credentialType));
  const hasMultipleCredentials = credentials.size > 1;

  return [
    { id: 'location', label: 'Location', available: hasMultipleLocations },
    { id: 'supervisor', label: 'Supervisor', available: hasSupervisors },
    { id: 'credential', label: 'License Type', available: hasMultipleCredentials },
  ];
}

export default useCompareMetrics;
