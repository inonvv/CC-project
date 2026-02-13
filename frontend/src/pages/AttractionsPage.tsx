import { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { StepLayout } from '@/components/StepLayout';
import { AttractionCard } from '@/components/AttractionCard';
import { useTripStore } from '@/store/tripStore';
import api from '@/services/api';
import type { Attraction } from '@/types';

export default function AttractionsPage() {
  const navigate = useNavigate();
  const destinations = useTripStore((s) => s.destinations);
  const selectedAttractions = useTripStore((s) => s.selectedAttractions);
  const [attractionsByCity, setAttractionsByCity] = useState<Record<number, Attraction[]>>({});
  const [loading, setLoading] = useState(true);
  const fetchedForRef = useRef<string>('');

  // Stable key for destination IDs
  const destKey = useMemo(() => destinations.map((d) => d.id).join(','), [destinations]);

  useEffect(() => {
    if (destinations.length === 0) {
      setLoading(false);
      return;
    }
    // Skip if already fetched for the same destinations
    if (fetchedForRef.current === destKey && Object.keys(attractionsByCity).length > 0) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const fetchAttractions = async () => {
      const results: Record<number, Attraction[]> = {};
      await Promise.all(
        destinations.map(async (dest) => {
          const res = await api.get<Attraction[]>('/attractions', {
            params: { city_id: dest.id },
          });
          results[dest.id] = res.data;
        })
      );
      if (!cancelled) {
        setAttractionsByCity(results);
        fetchedForRef.current = destKey;
        setLoading(false);
      }
    };
    fetchAttractions();

    return () => { cancelled = true; };
  }, [destKey, destinations, attractionsByCity]);

  const allSelected = destinations.every((d) => selectedAttractions[d.id]);

  return (
    <StepLayout
      currentStep={4}
      onNext={() => navigate('/summary')}
      nextDisabled={!allSelected}
    >
      <h2 className="mb-6 text-2xl font-bold">Choose Your Attractions</h2>

      {loading ? (
        <p className="text-muted-foreground">Loading attractions...</p>
      ) : (
        <div className="space-y-8">
          {destinations.map((dest) => (
            <div key={dest.id}>
              <h3 className="mb-3 text-lg font-semibold">{dest.city}</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                {(attractionsByCity[dest.id] || []).map((attraction) => (
                  <AttractionCard
                    key={attraction.id}
                    attraction={attraction}
                    selected={selectedAttractions[dest.id]?.id === attraction.id}
                    cityId={dest.id}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!allSelected && !loading && (
        <p className="mt-4 text-sm text-muted-foreground">
          Select an attraction for every destination to continue.
        </p>
      )}
    </StepLayout>
  );
}
