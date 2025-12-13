import { useState, useEffect, useCallback } from 'react';
import { getClinicianMetricsForPeriod, getClinicianMetricsForMonth } from '../data/metricsCalculator';

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

/**
 * Hook to get clinician metrics for a time period
 * Uses local synthetic data
 */
export function useClinicianMetricsForPeriod(periodId: PeriodId): UseClinicianMetricsResult {
  const [data, setData] = useState<ClinicianMetricsCalculated[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);

    try {
      const localData = getClinicianMetricsForPeriod(periodId);
      setData(localData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to get clinician metrics'));
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
 * Hook to get clinician metrics for a specific month
 * Uses local synthetic data
 */
export function useClinicianMetricsForMonth(month: number, year: number): UseClinicianMetricsResult {
  const [data, setData] = useState<ClinicianMetricsCalculated[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);

    try {
      const localData = getClinicianMetricsForMonth(month, year);
      setData(localData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to get clinician metrics'));
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export default useClinicianMetricsForPeriod;
