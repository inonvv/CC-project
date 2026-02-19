import { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { StepLayout } from '@/components/StepLayout';
import { AttractionCard } from '@/components/AttractionCard';
import { useTripStore } from '@/store/tripStore';
import api from '@/services/api';
import type { Attraction } from '@/types';
import planeGif from '@/assets/plane.gif';

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

  return (
    <StepLayout
      currentStep={5}
      onNext={() => navigate('/summary')}
      nextDisabled={false}
    >
      <h2 className="mb-6 text-2xl font-bold">Choose Your Attractions</h2>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <img src={planeGif} alt="Loading" className="plane-gif mb-3 h-16 w-16" />
          <p className="text-sm text-muted-foreground">Discovering top attractions...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {destinations.map((dest) => (
            <div key={dest.id}>
              <h3 className="mb-3 text-lg font-semibold">
                {dest.city}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({(selectedAttractions[dest.id]?.length || 0)} selected)
                </span>
              </h3>
              <div className="grid gap-4 sm:grid-cols-3">
                {(attractionsByCity[dest.id] || []).map((attraction) => (
                  <AttractionCard
                    key={attraction.id}
                    attraction={attraction}
                    selected={selectedAttractions[dest.id]?.some((a) => a.id === attraction.id) ?? false}
                    cityId={dest.id}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

    </StepLayout>
  );
}
