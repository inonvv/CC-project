import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState, useCallback } from 'react';
import { StepLayout } from '@/components/StepLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTripStore } from '@/store/tripStore';
import api from '@/services/api';
import type { Segment } from '@/types';
import planeGif from '@/assets/plane.gif';

export default function SchedulePage() {
  const navigate = useNavigate();
  const destinations = useTripStore((s) => s.destinations);
  const origin = useTripStore((s) => s.origin);
  const startDate = useTripStore((s) => s.startDate);
  const durations = useTripStore((s) => s.durations);
  const selectedFlights = useTripStore((s) => s.selectedFlights);
  const setStartDate = useTripStore((s) => s.setStartDate);
  const setDuration = useTripStore((s) => s.setDuration);
  const selectFlight = useTripStore((s) => s.selectFlight);

  const [segments, setSegments] = useState<Segment[]>([]);
  const [openFlight, setOpenFlight] = useState<number | null>(null);

  // Fetch flight segments
  useEffect(() => {
    if (!origin || destinations.length === 0) return;
    api
      .post('/compute-route', {
        origin: { city: origin.city, lat: origin.lat, lng: origin.lng },
        destinations: destinations.map((d) => ({
          city_id: d.id, city: d.city, lat: d.lat, lng: d.lng,
        })),
      })
      .then((res) => setSegments(res.data.segments));
  }, [origin, destinations]);

  const schema = z.object({
    startDate: z.string().min(1, 'Start date is required'),
    durations: z.record(
      z.string(),
      z.number({ invalid_type_error: 'Must be a number' })
        .int('Must be a whole number')
        .positive('Must be at least 1 day')
    ),
  });

  type FormData = z.infer<typeof schema>;

  const defaultDurations: Record<string, number> = {};
  destinations.forEach((d) => {
    const days = durations[d.id] || 1;
    defaultDurations[String(d.id)] = days;
    if (!durations[d.id]) setDuration(d.id, 1);
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      startDate: startDate || '',
      durations: defaultDurations,
    },
  });

  const watchedStartDate = watch('startDate');
  const watchedDurations = watch('durations');

  useEffect(() => {
    if (watchedStartDate) setStartDate(watchedStartDate);
  }, [watchedStartDate, setStartDate]);

  useEffect(() => {
    if (watchedDurations) {
      Object.entries(watchedDurations).forEach(([cityId, days]) => {
        if (typeof days === 'number' && days > 0) {
          setDuration(Number(cityId), days);
        }
      });
    }
  }, [watchedDurations, setDuration]);

  // Toggle flight panel on card click
  const toggleFlight = useCallback((segmentIndex: number) => {
    setOpenFlight((prev) => (prev === segmentIndex ? null : segmentIndex));
  }, []);

  const allFlightsSelected = segments.length > 0 && segments.every((_, i) => selectedFlights[`segment-${i}`]);

  const onSubmit = (_data: FormData) => {
    navigate('/hotels');
  };

  const canProceed = isValid && allFlightsSelected;

  return (
    <StepLayout
      currentStep={3}
      onNext={handleSubmit(onSubmit)}
      nextDisabled={!canProceed}
    >
      <h2 className="mb-6 text-2xl font-bold">Set Your Schedule</h2>

      {/* Start date */}
      <div className="mb-8">
        <Label htmlFor="startDate" className="text-base font-semibold">Start Date</Label>
        <Input
          id="startDate"
          type="date"
          className="mt-2 max-w-xs"
          {...register('startDate')}
        />
        {errors.startDate && (
          <p className="mt-1 text-sm text-destructive">{errors.startDate.message}</p>
        )}
      </div>

      {/* Destination cards with days + flight picker */}
      <div className="space-y-4">
        {destinations.map((dest, destIndex) => {
          // Each destination has an outbound segment (destIndex) and
          // the last destination also has the return segment
          const segmentIndex = destIndex; // outbound to this city: segment destIndex
          // Actually the segments are: 0 = origin→dest1, 1 = dest1→dest2, etc.
          // So for dest at index i, the inbound segment is i, outbound is i+1
          // We show the outbound FROM this city segment
          const outboundIdx = destIndex + 1; // segment leaving this city
          const inboundIdx = destIndex; // segment arriving at this city

          return (
            <div
              key={dest.id}
              className="rounded-xl border border-border bg-card shadow-sm"
            >
              {/* Top row: clickable to toggle flights */}
              <div
                className="flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-muted/40"
                onClick={() => toggleFlight(inboundIdx)}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {destIndex + 1}
                  </span>
                  <span className="text-lg font-semibold">{dest.city}</span>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Input
                    type="number"
                    min={1}
                    step={1}
                    className="w-20 text-center"
                    {...register(`durations.${dest.id}`, { valueAsNumber: true })}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setValue(`durations.${dest.id}`, isNaN(val) ? (0 as unknown as number) : val, {
                        shouldValidate: true,
                      });
                    }}
                  />
                  <span className="text-sm font-medium text-muted-foreground">days</span>
                </div>
              </div>

              {errors.durations?.[String(dest.id) as keyof typeof errors.durations] && (
                <p className="px-4 pb-2 text-sm text-destructive">Invalid number of days</p>
              )}

              {/* Inbound flight picker — arriving at this city */}
              {segments[inboundIdx] && (
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFlight === inboundIdx ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="border-t border-border px-4 pb-4 pt-3">
                    <p className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <img src={planeGif} alt="" className="plane-gif h-4 w-4" />
                      {segments[inboundIdx].from} → {segments[inboundIdx].to}
                    </p>
                    <div className="flex gap-2 overflow-x-auto py-1">
                      {segments[inboundIdx].options.map((opt) => (
                        <button
                          key={opt.departure}
                          type="button"
                          onClick={() => selectFlight(`segment-${inboundIdx}`, opt)}
                          className={`shrink-0 rounded-lg border px-4 py-2 text-center transition-all duration-200 hover:scale-[1.02] ${
                            selectedFlights[`segment-${inboundIdx}`]?.departure === opt.departure
                              ? 'border-primary bg-primary/5 ring-2 ring-primary'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <span className="text-sm font-semibold">{opt.departure}</span>
                          <span className="ml-2 text-sm font-bold text-primary">${opt.price}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Return flight — last segment */}
        {segments.length > 0 && (
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div
              className="flex cursor-pointer items-center gap-3 p-4 transition-colors hover:bg-muted/40"
              onClick={() => toggleFlight(segments.length - 1)}
            >
              <img src={planeGif} alt="" className="plane-gif h-8 w-8" />
              <span className="text-lg font-semibold text-muted-foreground">Return Home</span>
            </div>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                openFlight === segments.length - 1 ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="border-t border-border px-4 pb-4 pt-3">
                <p className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <img src={planeGif} alt="" className="plane-gif h-4 w-4" />
                  {segments[segments.length - 1].from} → {segments[segments.length - 1].to}
                </p>
                <div className="flex gap-2 overflow-x-auto py-1">
                  {segments[segments.length - 1].options.map((opt) => (
                    <button
                      key={opt.departure}
                      type="button"
                      onClick={() => selectFlight(`segment-${segments.length - 1}`, opt)}
                      className={`shrink-0 rounded-lg border px-4 py-2 text-center transition-all duration-200 hover:scale-[1.02] ${
                        selectedFlights[`segment-${segments.length - 1}`]?.departure === opt.departure
                          ? 'border-primary bg-primary/5 ring-2 ring-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <span className="text-sm font-semibold">{opt.departure}</span>
                      <span className="ml-2 text-sm font-bold text-primary">${opt.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {segments.length === 0 && destinations.length > 0 && (
        <div className="mt-6 flex flex-col items-center py-8">
          <img src={planeGif} alt="Loading" className="plane-gif mb-3 h-12 w-12" />
          <p className="text-sm text-muted-foreground">Computing flight routes...</p>
        </div>
      )}

      {!allFlightsSelected && segments.length > 0 && (
        <p className="mt-4 text-sm text-muted-foreground">
          Select a flight for every segment to continue. Click a city card to reveal flight options.
        </p>
      )}
    </StepLayout>
  );
}
