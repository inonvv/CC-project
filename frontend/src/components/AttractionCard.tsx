import { Card, CardContent } from '@/components/ui/card';
import { useTripStore } from '@/store/tripStore';
import type { Attraction } from '@/types';

interface AttractionCardProps {
  attraction: Attraction;
  selected: boolean;
  cityId: number;
}

export function AttractionCard({ attraction, selected, cityId }: AttractionCardProps) {
  const selectAttraction = useTripStore((s) => s.selectAttraction);
  // Rough travel estimate: 10–25 min from hotel (mock)
  const travelMin = 10 + ((attraction.id * 7) % 16);

  return (
    <Card
      className={`cursor-pointer overflow-hidden transition-all duration-200 hover:scale-[1.02] ${
        selected ? 'border-primary ring-2 ring-primary' : 'border-border hover:border-primary/50'
      }`}
      onClick={() => selectAttraction(cityId, attraction)}
    >
      {attraction.image_url && (
        <img
          src={attraction.image_url}
          alt={attraction.name}
          className="h-36 w-full object-cover"
          loading="lazy"
        />
      )}
      <CardContent className="p-4">
        <h4 className="mb-0.5 font-semibold">{attraction.name}</h4>
        {attraction.address && (
          <p className="mb-1 text-xs text-muted-foreground">{attraction.address}</p>
        )}
        <p className="mb-2 text-sm text-muted-foreground">{attraction.category}</p>
        <p className="text-2xl font-bold text-primary">
          {attraction.price === 0 ? 'Free' : `$${attraction.price}`}
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          ~{travelMin} min from hotel
        </p>
      </CardContent>
    </Card>
  );
}
