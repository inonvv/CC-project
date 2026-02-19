import { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { StepLayout } from '@/components/StepLayout';
import { HotelCard } from '@/components/HotelCard';
import { useTripStore } from '@/store/tripStore';
import api from '@/services/api';
import type { Hotel } from '@/types';
import planeGif from '@/assets/plane.gif';

const ROOM_TYPES = ['Queen', 'King', 'Twin', 'Suite'] as const;

export default function HotelsPage() {
  const navigate = useNavigate();
  const destinations = useTripStore((s) => s.destinations);
  const selectedHotels = useTripStore((s) => s.selectedHotels);
  const [hotelsByCity, setHotelsByCity] = useState<Record<number, Hotel[]>>({});
  const [loading, setLoading] = useState(true);
  const [guests, setGuests] = useState<Record<number, number>>({});
  const [rooms, setRooms] = useState<Record<number, number>>({});
  const [roomType, setRoomType] = useState<Record<number, string>>({});
  const fetchedForRef = useRef<string>('');

  // Stable key for destination IDs
  const destKey = useMemo(() => destinations.map((d) => d.id).join(','), [destinations]);

  useEffect(() => {
    if (destinations.length === 0) {
      setLoading(false);
      return;
    }
    // Skip if already fetched for the same destinations
    if (fetchedForRef.current === destKey && Object.keys(hotelsByCity).length > 0) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const fetchHotels = async () => {
      const results: Record<number, Hotel[]> = {};
      await Promise.all(
        destinations.map(async (dest) => {
          const res = await api.get<Hotel[]>('/hotels', { params: { city_id: dest.id } });
          results[dest.id] = res.data;
        })
      );
      if (!cancelled) {
        setHotelsByCity(results);
        fetchedForRef.current = destKey;
        setLoading(false);
      }
    };
    fetchHotels();

    return () => { cancelled = true; };
  }, [destKey, destinations, hotelsByCity]);

  // Init room defaults once
  useEffect(() => {
    const g: Record<number, number> = {};
    const r: Record<number, number> = {};
    const t: Record<number, string> = {};
    destinations.forEach((d) => {
      g[d.id] = guests[d.id] || 1;
      r[d.id] = rooms[d.id] || 1;
      t[d.id] = roomType[d.id] || 'Queen';
    });
    setGuests(g);
    setRooms(r);
    setRoomType(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destKey]);

  const allSelected = destinations.every((d) => selectedHotels[d.id]);

  return (
    <StepLayout
      currentStep={4}
      onNext={() => navigate('/attractions')}
      nextDisabled={!allSelected}
    >
      <h2 className="mb-6 text-2xl font-bold">Choose Your Hotels</h2>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <img src={planeGif} alt="Loading" className="plane-gif mb-3 h-16 w-16" />
          <p className="text-sm text-muted-foreground">Finding the best hotels...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {destinations.map((dest) => (
            <div key={dest.id}>
              <div className="mb-3 flex flex-wrap items-center gap-4">
                <h3 className="text-lg font-semibold">{dest.city}</h3>

                <div className="flex items-center gap-1.5">
                  <label className="text-xs text-muted-foreground">Guests</label>
                  <select
                    value={guests[dest.id] || 1}
                    onChange={(e) => setGuests({ ...guests, [dest.id]: Number(e.target.value) })}
                    className="rounded border border-border px-2 py-1 text-sm"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <label className="text-xs text-muted-foreground">Rooms</label>
                  <select
                    value={rooms[dest.id] || 1}
                    onChange={(e) => setRooms({ ...rooms, [dest.id]: Number(e.target.value) })}
                    className="rounded border border-border px-2 py-1 text-sm"
                  >
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <label className="text-xs text-muted-foreground">Type</label>
                  <select
                    value={roomType[dest.id] || 'Queen'}
                    onChange={(e) => setRoomType({ ...roomType, [dest.id]: e.target.value })}
                    className="rounded border border-border px-2 py-1 text-sm"
                  >
                    {ROOM_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {(hotelsByCity[dest.id] || []).map((hotel) => (
                  <HotelCard
                    key={hotel.id}
                    hotel={hotel}
                    selected={selectedHotels[dest.id]?.id === hotel.id}
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
          Select a hotel for every destination to continue.
        </p>
      )}
    </StepLayout>
  );
}
