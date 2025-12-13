import { useState, useEffect, useCallback } from 'react';
import { getDataDateRange } from '../data/metricsCalculator';

export interface DataDateRange {
  earliest: Date;
  latest: Date;
}

export interface UseDataDateRangeResult {
  data: DataDateRange | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to get the date range of available data
 * Uses local synthetic data
 */
export function useDataDateRange(): UseDataDateRangeResult {
  const [data, setData] = useState<DataDateRange | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);

    try {
      const localData = getDataDateRange();
      setData(localData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to get data range'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export default useDataDateRange;
