import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTripStore } from '@/store/tripStore';
import type { Segment, FlightOption } from '@/types';

interface FlightSegmentProps {
  segment: Segment;
  segmentKey: string;
}

export function FlightSegment({ segment, segmentKey }: FlightSegmentProps) {
  const selectFlight = useTripStore((s) => s.selectFlight);
  const selectedFlights = useTripStore((s) => s.selectedFlights);
  const selected = selectedFlights[segmentKey];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {segment.from} → {segment.to}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-3">
          {segment.options.map((option: FlightOption) => (
            <button
              key={option.departure}
              onClick={() => selectFlight(segmentKey, option)}
              className={`rounded-lg border p-4 text-center transition-all duration-200 hover:scale-[1.02] ${
                selected?.departure === option.departure
                  ? 'border-primary bg-primary/5 ring-2 ring-primary'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <p className="text-lg font-semibold">{option.departure}</p>
              <p className="text-2xl font-bold text-primary">${option.price}</p>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
