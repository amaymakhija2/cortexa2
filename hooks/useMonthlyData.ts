import { useState, useEffect, useCallback } from 'react';
import { getMonthlyData } from '../data/metricsCalculator';

export interface MonthlyDataPoint {
  month: string;
  year: number;
  monthNum: number;
  revenue: number;
  sessions: number;
  activeClients: number;
  newClients: number;
  churnedClients: number;
}

export interface UseMonthlyDataResult {
  data: MonthlyDataPoint[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to get monthly data for charts and comparisons
 * Uses local synthetic data
 *
 * @param numMonths - Number of recent months to return (default: 12)
 */
export function useMonthlyData(numMonths: number = 12): UseMonthlyDataResult {
  const [data, setData] = useState<MonthlyDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);

    try {
      const localData = getMonthlyData(numMonths);
      setData(localData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to get monthly data'));
    } finally {
      setLoading(false);
    }
  }, [numMonths]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export default useMonthlyData;
