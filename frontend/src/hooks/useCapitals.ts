import { useEffect, useState } from 'react';
import api from '@/services/api';
import type { Capital } from '@/types';

export function useCapitals() {
  const [capitals, setCapitals] = useState<Capital[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Capital[]>('/capitals').then((res) => {
      setCapitals(res.data);
      setLoading(false);
    });
  }, []);

  return { capitals, loading };
}
