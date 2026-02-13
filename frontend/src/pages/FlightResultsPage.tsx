import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StepLayout } from '@/components/StepLayout';
import { FlightSegment } from '@/components/FlightSegment';
import { useTripStore } from '@/store/tripStore';
import api from '@/services/api';
import type { Segment } from '@/types';

export default function FlightResultsPage() {
  const navigate = useNavigate();
  const origin = useTripStore((s) => s.origin);
  const destinations = useTripStore((s) => s.destinations);
  const selectedFlights = useTripStore((s) => s.selectedFlights);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!origin || destinations.length === 0) return;

    api
      .post('/compute-route', {
        origin: { city: origin.city, lat: origin.lat, lng: origin.lng },
        destinations: destinations.map((d) => ({
          city_id: d.id,
          city: d.city,
          lat: d.lat,
          lng: d.lng,
        })),
      })
      .then((res) => {
        setSegments(res.data.segments);
        setLoading(false);
      });
  }, [origin, destinations]);

  const allSelected = segments.length > 0 && segments.every((_, i) => selectedFlights[`segment-${i}`]);

  return (
    <StepLayout
      currentStep={3}
      onNext={() => navigate('/hotels')}
      nextDisabled={!allSelected}
    >
      <h2 className="mb-6 text-2xl font-bold">Select Your Flights</h2>

      {loading ? (
        <p className="text-muted-foreground">Loading flight options...</p>
      ) : (
        <div className="space-y-6">
          {segments.map((segment, i) => (
            <FlightSegment
              key={`${segment.from}-${segment.to}`}
              segment={segment}
              segmentKey={`segment-${i}`}
            />
          ))}
        </div>
      )}

      {!allSelected && !loading && (
        <p className="mt-4 text-sm text-muted-foreground">
          Select a flight for every segment to continue.
        </p>
      )}
    </StepLayout>
  );
}
