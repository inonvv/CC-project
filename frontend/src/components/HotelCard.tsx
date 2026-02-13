import { Card, CardContent } from '@/components/ui/card';
import { useTripStore } from '@/store/tripStore';
import type { Hotel } from '@/types';

interface HotelCardProps {
  hotel: Hotel;
  selected: boolean;
  cityId: number;
}

export function HotelCard({ hotel, selected, cityId }: HotelCardProps) {
  const selectHotel = useTripStore((s) => s.selectHotel);

  return (
    <Card
      className={`cursor-pointer overflow-hidden transition-all duration-200 hover:scale-[1.02] ${
        selected ? 'border-primary ring-2 ring-primary' : 'border-border hover:border-primary/50'
      }`}
      onClick={() => selectHotel(cityId, hotel)}
    >
      {hotel.image_url && (
        <img
          src={hotel.image_url}
          alt={hotel.name}
          className="h-36 w-full object-cover"
          loading="lazy"
        />
      )}
      <CardContent className="p-4">
        <h4 className="mb-2 font-semibold">{hotel.name}</h4>
        <p className="text-2xl font-bold text-primary">
          ${hotel.price_per_night}
          <span className="text-sm font-normal text-muted-foreground">/night</span>
        </p>
        <p className="mt-1 text-sm text-muted-foreground">Rating: {hotel.rating}/5</p>
      </CardContent>
    </Card>
  );
}
