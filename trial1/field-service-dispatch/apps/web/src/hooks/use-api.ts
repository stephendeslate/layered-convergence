'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

interface UseApiOptions<T> {
  initialData?: T;
  skip?: boolean;
}

export function useApi<T>(path: string, options: UseApiOptions<T> = {}) {
  const [data, setData] = useState<T | undefined>(options.initialData);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!options.skip);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.get<T>(path);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [path]);

  useEffect(() => {
    if (!options.skip) {
      fetchData();
    }
  }, [fetchData, options.skip]);

  return { data, error, isLoading, refetch: fetchData, setData };
}

export function useMutation<TData = unknown, TVariables = unknown>(
  method: 'post' | 'patch' | 'put' | 'delete',
  path: string,
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (variables?: TVariables): Promise<TData> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await (api[method] as Function)(path, variables) as TData;
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'An error occurred';
        setError(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [method, path],
  );

  return { mutate, isLoading, error };
}
