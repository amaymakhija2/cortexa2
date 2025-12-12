import { useState, useEffect, useCallback } from 'react';
import {
  fetchMonthMetrics,
  fetchAllMetrics,
  MonthlyMetrics,
  ClinicianMetrics as ApiClinicianMetrics,
  AuthenticationError,
} from '../lib/apiClient';

// Only use fallback in development (tree-shaken in production build)
const isDev = import.meta.env.DEV;

// ClinicianMetricsCalculated - matches what ClinicianOverview expects
export interface ClinicianMetricsCalculated {
  clinicianId: string;
  clinicianName: string;
  revenue: number;
  completedSessions: number;
  revenuePerSession: number;
  activeClients: number;
  newClients: number;
  clientsChurned: number;
  avgSessionsPerClient: number;
  churnRate: number;
}

export interface UseClinicianMetricsResult {
  data: ClinicianMetricsCalculated[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

type PeriodId = 'this-month' | 'last-month' | 'this-quarter' | 'last-quarter' | 'this-year' | 'last-12-months';

// Transform API clinician data to ClinicianMetricsCalculated format
function transformClinicianData(
  clinicians: Record<string, ApiClinicianMetrics>,
  monthlyChurned: number,
  totalActiveClients: number
): ClinicianMetricsCalculated[] {
  return Object.entries(clinicians).map(([name, data]) => {
    const revenuePerSession = data.sessions > 0 ? data.revenue / data.sessions : 0;
    const avgSessionsPerClient = data.clients > 0 ? data.sessions / data.clients : 0;

    // Estimate churn rate proportionally based on client count
    const clinicianChurnShare = totalActiveClients > 0
      ? (data.clients / totalActiveClients) * monthlyChurned
      : 0;
    const churnRate = data.clients > 0
      ? (clinicianChurnShare / data.clients) * 100
      : 0;

    return {
      clinicianId: name, // Using name as ID since API doesn't have separate IDs
      clinicianName: name,
      revenue: data.revenue,
      completedSessions: data.sessions,
      revenuePerSession,
      activeClients: data.clients,
      newClients: 0, // Will be calculated from monthly data if available
      clientsChurned: Math.round(clinicianChurnShare),
      avgSessionsPerClient,
      churnRate,
    };
  });
}

// Aggregate clinician data across multiple months
function aggregateClinicianData(
  monthsData: Record<string, MonthlyMetrics>
): ClinicianMetricsCalculated[] {
  const monthCount = Object.keys(monthsData).length;
  if (monthCount === 0) return [];

  const aggregated: Record<string, {
    revenue: number;
    sessions: number;
    maxClients: number; // Track max clients seen in any month
    totalClientsAcrossMonths: number; // For averaging
    monthsWithData: number;
    newClients: number;
  }> = {};

  // Track monthly churn rates to average them
  let totalMonthlyChurnRates = 0;
  let monthsWithChurnData = 0;

  Object.values(monthsData).forEach(monthData => {
    // Calculate this month's churn rate (churned / active * 100)
    if (monthData.activeClients > 0) {
      const monthChurnRate = (monthData.churnedClients / monthData.activeClients) * 100;
      totalMonthlyChurnRates += monthChurnRate;
      monthsWithChurnData++;
    }

    Object.entries(monthData.clinicians).forEach(([name, data]) => {
      if (!aggregated[name]) {
        aggregated[name] = {
          revenue: 0,
          sessions: 0,
          maxClients: 0,
          totalClientsAcrossMonths: 0,
          monthsWithData: 0,
          newClients: 0,
        };
      }
      aggregated[name].revenue += data.revenue;
      aggregated[name].sessions += data.sessions;
      aggregated[name].maxClients = Math.max(aggregated[name].maxClients, data.clients);
      aggregated[name].totalClientsAcrossMonths += data.clients;
      aggregated[name].monthsWithData++;
    });
  });

  // Calculate average monthly churn rate for the practice
  const avgPracticeChurnRate = monthsWithChurnData > 0
    ? totalMonthlyChurnRates / monthsWithChurnData
    : 0;

  return Object.entries(aggregated).map(([name, data]) => {
    const avgClients = data.monthsWithData > 0
      ? Math.round(data.totalClientsAcrossMonths / data.monthsWithData)
      : 0;
    const revenuePerSession = data.sessions > 0 ? data.revenue / data.sessions : 0;
    const avgSessionsPerClient = avgClients > 0 ? data.sessions / avgClients : 0;

    // Estimate this clinician's churn rate proportionally to practice average
    // Clinicians with more clients relative to practice will have proportionally similar churn
    const churnRate = avgPracticeChurnRate; // Use practice average as baseline

    // Estimate churned clients for this clinician over the period
    const clinicianChurnedEstimate = avgClients > 0
      ? Math.round((churnRate / 100) * avgClients * monthCount)
      : 0;

    return {
      clinicianId: name,
      clinicianName: name,
      revenue: data.revenue,
      completedSessions: data.sessions,
      revenuePerSession,
      activeClients: avgClients,
      newClients: data.newClients,
      clientsChurned: clinicianChurnedEstimate,
      avgSessionsPerClient,
      churnRate: Math.round(churnRate * 10) / 10, // Round to 1 decimal
    };
  });
}

// Get months for a period
function getMonthsForPeriod(periodId: PeriodId): string[] {
  const now = new Date();
  const months: string[] = [];

  switch (periodId) {
    case 'this-month': {
      const m = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      months.push(m);
      break;
    }
    case 'last-month': {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const m = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
      months.push(m);
      break;
    }
    case 'this-quarter': {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const startMonth = currentQuarter * 3;
      for (let i = startMonth; i <= now.getMonth(); i++) {
        months.push(`${now.getFullYear()}-${String(i + 1).padStart(2, '0')}`);
      }
      break;
    }
    case 'last-quarter': {
      const lastQuarter = Math.floor(now.getMonth() / 3) - 1;
      const year = lastQuarter < 0 ? now.getFullYear() - 1 : now.getFullYear();
      const adjustedQuarter = lastQuarter < 0 ? 3 : lastQuarter;
      const startMonth = adjustedQuarter * 3;
      for (let i = 0; i < 3; i++) {
        months.push(`${year}-${String(startMonth + i + 1).padStart(2, '0')}`);
      }
      break;
    }
    case 'this-year': {
      for (let i = 0; i <= now.getMonth(); i++) {
        months.push(`${now.getFullYear()}-${String(i + 1).padStart(2, '0')}`);
      }
      break;
    }
    case 'last-12-months':
    default: {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
      }
      break;
    }
  }

  return months;
}

/**
 * Hook to fetch clinician metrics for a time period
 * Replaces: getClinicianMetricsForPeriod(periodId)
 */
export function useClinicianMetricsForPeriod(periodId: PeriodId): UseClinicianMetricsResult {
  const [data, setData] = useState<ClinicianMetricsCalculated[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // For periods spanning multiple months, fetch all data and filter
      const response = await fetchAllMetrics();
      const allMetrics = response.metrics as Record<string, MonthlyMetrics>;

      // Get relevant months for this period
      const relevantMonths = getMonthsForPeriod(periodId);

      // Filter to only include relevant months
      const filteredMetrics: Record<string, MonthlyMetrics> = {};
      relevantMonths.forEach(month => {
        if (allMetrics[month]) {
          filteredMetrics[month] = allMetrics[month];
        }
      });

      // Aggregate across months
      const transformed = aggregateClinicianData(filteredMetrics);
      setData(transformed);
    } catch (err) {
      if (err instanceof AuthenticationError) {
        setError(err);
      } else if (isDev) {
        // API not available (dev mode only) - fall back to local calculation
        console.warn('API unavailable, using local data fallback for period');
        try {
          const { getClinicianMetricsForPeriod } = await import('../data/metricsCalculator');
          const localData = getClinicianMetricsForPeriod(periodId);
          setData(localData);
        } catch (localErr) {
          setError(err instanceof Error ? err : new Error('Failed to fetch clinician metrics'));
        }
      } else {
        setError(err instanceof Error ? err : new Error('Failed to fetch clinician metrics'));
      }
    } finally {
      setLoading(false);
    }
  }, [periodId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to fetch clinician metrics for a specific month
 * Replaces: getClinicianMetricsForMonth(month, year)
 */
export function useClinicianMetricsForMonth(month: number, year: number): UseClinicianMetricsResult {
  const [data, setData] = useState<ClinicianMetricsCalculated[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchMonthMetrics(monthStr);
      const monthData = response.metrics as MonthlyMetrics;

      const transformed = transformClinicianData(
        monthData.clinicians,
        monthData.churnedClients,
        monthData.activeClients
      );

      setData(transformed);
    } catch (err) {
      if (err instanceof AuthenticationError) {
        setError(err);
      } else if (isDev) {
        // API not available (dev mode only) - fall back to local calculation
        console.warn('API unavailable, using local data fallback for month');
        try {
          const { getClinicianMetricsForMonth } = await import('../data/metricsCalculator');
          const localData = getClinicianMetricsForMonth(month, year);
          setData(localData);
        } catch (localErr) {
          setError(err instanceof Error ? err : new Error('Failed to fetch clinician metrics'));
        }
      } else {
        setError(err instanceof Error ? err : new Error('Failed to fetch clinician metrics'));
      }
    } finally {
      setLoading(false);
    }
  }, [monthStr, month, year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export default useClinicianMetricsForPeriod;
