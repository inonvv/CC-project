import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { StepLayout } from '@/components/StepLayout';
import { Button } from '@/components/ui/button';
import { useTripStore } from '@/store/tripStore';
import api from '@/services/api';
import type { Segment, Hotel, Attraction, RouteSuggestion } from '@/types';
import planeGif from '@/assets/plane.gif';

const CARD_THEME: Record<string, { border: string; badge: string; accent: string; destBg: string }> = {
  budget:  { border: 'border-green-200 hover:border-green-400', badge: 'bg-green-100 text-green-700', accent: 'text-green-600', destBg: 'bg-green-50/50' },
  comfort: { border: 'border-cyan-200 hover:border-cyan-400',   badge: 'bg-cyan-100 text-cyan-700',   accent: 'text-cyan-600',  destBg: 'bg-cyan-50/50' },
  premium: { border: 'border-amber-200 hover:border-amber-400', badge: 'bg-amber-100 text-amber-700', accent: 'text-amber-600', destBg: 'bg-amber-50/50' },
};

export default function SuggestionsPage() {
  const navigate = useNavigate();
  const destinations = useTripStore((s) => s.destinations);
  const origin = useTripStore((s) => s.origin);
  const storeStartDate = useTripStore((s) => s.startDate);
  const applySuggestion = useTripStore((s) => s.applySuggestion);

  const [segments, setSegments] = useState<Segment[]>([]);
  const [hotelsByCity, setHotelsByCity] = useState<Record<number, Hotel[]>>({});
  const [attractionsByCity, setAttractionsByCity] = useState<Record<number, Attraction[]>>({});
  const [loading, setLoading] = useState(true);
  const fetchedForRef = useRef<string>('');

  const destKey = useMemo(() => destinations.map((d) => d.id).join(','), [destinations]);

  useEffect(() => {
    if (destinations.length === 0 || !origin) {
      setLoading(false);
      return;
    }
    if (fetchedForRef.current === destKey && segments.length > 0) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const fetchAll = async () => {
      const [flightsRes, ...rest] = await Promise.all([
        api.post('/compute-route', {
          origin: { city: origin.city, lat: origin.lat, lng: origin.lng },
          destinations: destinations.map((d) => ({
            city_id: d.id, city: d.city, lat: d.lat, lng: d.lng,
          })),
        }),
        ...destinations.flatMap((dest) => [
          api.get<Hotel[]>('/hotels', { params: { city_id: dest.id } }),
          api.get<Attraction[]>('/attractions', { params: { city_id: dest.id } }),
        ]),
      ]);

      if (cancelled) return;

      setSegments(flightsRes.data.segments);

      const hotels: Record<number, Hotel[]> = {};
      const attractions: Record<number, Attraction[]> = {};
      destinations.forEach((dest, i) => {
        hotels[dest.id] = (rest[i * 2] as { data: Hotel[] }).data;
        attractions[dest.id] = (rest[i * 2 + 1] as { data: Attraction[] }).data;
      });
      setHotelsByCity(hotels);
      setAttractionsByCity(attractions);
      fetchedForRef.current = destKey;
      setLoading(false);
    };

    fetchAll();
    return () => { cancelled = true; };
  }, [destKey, destinations, origin, segments.length]);

  // ── Build base suggestions via memo ──
  const baseSuggestions = useMemo<RouteSuggestion[]>(() => {
    if (segments.length === 0 || Object.keys(hotelsByCity).length === 0) return [];

    const defaultStartDate = storeStartDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    const durations: Record<number, number> = {};
    destinations.forEach((d) => { durations[d.id] = 2; });

    const pickFlight = (seg: Segment, strategy: 'cheapest' | 'midday' | 'expensive') => {
      const opts = [...seg.options];
      if (strategy === 'cheapest') return opts.sort((a, b) => a.price - b.price)[0];
      if (strategy === 'expensive') return opts.sort((a, b) => b.price - a.price)[0];
      return opts.sort((a, b) => {
        const aMin = Math.abs(parseTime(a.departure) - 720);
        const bMin = Math.abs(parseTime(b.departure) - 720);
        return aMin - bMin;
      })[0];
    };

    const pickHotel = (cityId: number, strategy: 'cheapest' | 'rated' | 'expensive') => {
      const list = [...(hotelsByCity[cityId] || [])];
      if (list.length === 0) return undefined;
      if (strategy === 'cheapest') return list.sort((a, b) => a.price_per_night - b.price_per_night)[0];
      if (strategy === 'expensive') return list.sort((a, b) => b.price_per_night - a.price_per_night)[0];
      return list.sort((a, b) => b.rating - a.rating)[0];
    };

    const pickAttractions = (cityId: number, strategy: 'cheapest' | 'mid' | 'expensive'): Attraction[] => {
      const list = [...(attractionsByCity[cityId] || [])];
      if (list.length === 0) return [];
      const sorted = list.sort((a, b) => a.price - b.price);
      if (strategy === 'cheapest') return [sorted[0]];
      if (strategy === 'expensive') return sorted;
      const mid = sorted[Math.floor(sorted.length / 2)];
      const picks = [sorted[0]];
      if (mid.id !== sorted[0].id) picks.push(mid);
      return picks;
    };

    const buildSuggestion = (
      id: RouteSuggestion['id'],
      label: string,
      description: string,
      flightStrategy: 'cheapest' | 'midday' | 'expensive',
      hotelStrategy: 'cheapest' | 'rated' | 'expensive',
      attractionStrategy: 'cheapest' | 'mid' | 'expensive',
    ): RouteSuggestion => {
      const selectedFlights: Record<string, { departure: string; price: number }> = {};
      segments.forEach((seg, i) => {
        selectedFlights[`segment-${i}`] = pickFlight(seg, flightStrategy);
      });

      const selectedHotels: Record<number, Hotel> = {};
      const selectedAttractions: Record<number, Attraction[]> = {};
      destinations.forEach((d) => {
        const h = pickHotel(d.id, hotelStrategy);
        if (h) selectedHotels[d.id] = h;
        const attrs = pickAttractions(d.id, attractionStrategy);
        if (attrs.length > 0) selectedAttractions[d.id] = attrs;
      });

      const flightTotal = Object.values(selectedFlights).reduce((s, f) => s + f.price, 0);
      const hotelTotal = Object.entries(selectedHotels).reduce(
        (s, [cityId, h]) => s + h.price_per_night * (durations[Number(cityId)] || 2), 0
      );
      const attractionTotal = Object.values(selectedAttractions).flat().reduce((s, a) => s + a.price, 0);

      return {
        id, label, description, startDate: defaultStartDate, durations,
        selectedFlights, selectedHotels, selectedAttractions,
        totalPrice: flightTotal + hotelTotal + attractionTotal,
      };
    };

    return [
      buildSuggestion('budget', 'Budget', 'Best prices, no compromises on fun', 'cheapest', 'cheapest', 'cheapest'),
      buildSuggestion('comfort', 'Comfort', 'Great balance of quality and value', 'midday', 'rated', 'mid'),
      buildSuggestion('premium', 'Premium', 'Top-tier everything for the best experience', 'expensive', 'expensive', 'expensive'),
    ];
  }, [segments, hotelsByCity, attractionsByCity, destinations, storeStartDate]);

  // ── Mutable suggestions so users can toggle activities ──
  const [suggestions, setSuggestions] = useState<RouteSuggestion[]>([]);
  useEffect(() => {
    if (baseSuggestions.length > 0) setSuggestions(baseSuggestions);
  }, [baseSuggestions]);

  // ── Hover popup state ──
  const [activePopup, setActivePopup] = useState<{ suggestionId: string; cityId: number } | null>(null);
  const popupTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openPopup = useCallback((suggestionId: string, cityId: number) => {
    if (popupTimeout.current) clearTimeout(popupTimeout.current);
    setActivePopup({ suggestionId, cityId });
  }, []);

  const scheduleClose = useCallback(() => {
    popupTimeout.current = setTimeout(() => setActivePopup(null), 200);
  }, []);

  const cancelClose = useCallback(() => {
    if (popupTimeout.current) clearTimeout(popupTimeout.current);
  }, []);

  // ── Toggle an attraction inside a suggestion, recalculate price ──
  const toggleAttractionInSuggestion = useCallback(
    (suggestionId: string, cityId: number, attraction: Attraction) => {
      setSuggestions((prev) =>
        prev.map((s) => {
          if (s.id !== suggestionId) return s;
          const current = s.selectedAttractions[cityId] || [];
          const exists = current.some((a) => a.id === attraction.id);
          const updated = exists
            ? current.filter((a) => a.id !== attraction.id)
            : [...current, attraction];
          const newAttractions = { ...s.selectedAttractions, [cityId]: updated };
          const attractionTotal = Object.values(newAttractions).flat().reduce((sum, a) => sum + a.price, 0);
          const flightTotal = Object.values(s.selectedFlights).reduce((sum, f) => sum + f.price, 0);
          const hotelTotal = Object.entries(s.selectedHotels).reduce(
            (sum, [cId, h]) => sum + h.price_per_night * (s.durations[Number(cId)] || 2), 0
          );
          return {
            ...s,
            selectedAttractions: newAttractions,
            totalPrice: flightTotal + hotelTotal + attractionTotal,
          };
        })
      );
    },
    []
  );

  const handleChoose = (suggestion: RouteSuggestion) => {
    applySuggestion(suggestion);
    navigate('/schedule');
  };

  return (
    <StepLayout currentStep={2}>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="mb-1 text-2xl font-bold">Suggested Routes</h2>
          <p className="text-sm text-muted-foreground">
            Pick a pre-built plan or customize everything yourself.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 mt-1"
          onClick={() => navigate('/schedule')}
        >
          Customize Manually
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <img src={planeGif} alt="Loading" className="plane-gif mb-3 h-16 w-16" />
          <p className="text-sm text-muted-foreground">Building suggestions...</p>
        </div>
      ) : suggestions.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-muted-foreground">No suggestions available.</p>
          <Button className="mt-4" onClick={() => navigate('/schedule')}>Continue to Schedule</Button>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {suggestions.map((s, idx) => {
              const theme = CARD_THEME[s.id];
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.3 }}
                  className={`rounded-xl border-2 bg-card shadow-sm transition-all duration-200 hover:shadow-md ${theme.border}`}
                >
                  {/* ── Header: badge + description ── price + CTA ── */}
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-6 py-4">
                    <span className={`shrink-0 rounded-full px-3 py-0.5 text-xs font-bold ${theme.badge}`}>
                      {s.label}
                    </span>
                    <span className="text-xs text-muted-foreground">{s.description}</span>
                    <div className="ml-auto flex items-center gap-5">
                      <span className={`text-lg font-bold ${theme.accent}`}>
                        ${s.totalPrice.toFixed(0)}
                      </span>
                      <Button size="sm" className="h-7 px-4 text-xs" onClick={() => handleChoose(s)}>
                        Choose
                      </Button>
                    </div>
                  </div>

                  {/* ── Destination cards ── */}
                  <div className="mx-auto w-full max-w-3xl space-y-4 px-6 pb-6 pt-2">
                    {destinations.map((d, dIdx) => {
                      const hotel = s.selectedHotels[d.id];
                      const attractions = s.selectedAttractions[d.id] || [];
                      const inboundSeg = segments[dIdx];
                      const inboundFlight = s.selectedFlights[`segment-${dIdx}`];
                      const allCityAttractions = attractionsByCity[d.id] || [];
                      const isPopupOpen = activePopup?.suggestionId === s.id && activePopup?.cityId === d.id;

                      return (
                        <div
                          key={d.id}
                          className={`rounded-xl border border-border shadow-sm ${theme.destBg}`}
                        >
                          {/* City header */}
                          <div className="flex items-center gap-3 border-b border-border/60 px-5 py-3">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
                              {dIdx + 1}
                            </span>
                            <span className="text-sm font-semibold">{d.city}</span>
                            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                              {s.durations[d.id]} {s.durations[d.id] === 1 ? 'day' : 'days'}
                            </span>
                          </div>

                          {/* Info rows */}
                          <div className="divide-y divide-border/40 px-5">
                            {inboundSeg && inboundFlight && (
                              <div className="grid grid-cols-[5rem_1fr_auto] items-center gap-x-6 py-3">
                                <span className="text-xs font-medium text-muted-foreground">Flight</span>
                                <span className="text-xs">{inboundSeg.from} → {inboundSeg.to} at {inboundFlight.departure}</span>
                                <span className="text-right text-xs font-semibold text-primary">${inboundFlight.price}</span>
                              </div>
                            )}
                            {hotel && (
                              <div className="grid grid-cols-[5rem_1fr_auto] items-center gap-x-6 py-3">
                                <span className="text-xs font-medium text-muted-foreground">Hotel</span>
                                <span className="text-xs">{hotel.name}</span>
                                <span className="text-right text-xs font-semibold text-primary">${hotel.price_per_night}/night</span>
                              </div>
                            )}

                            {/* ── Activity row with hover popup ── */}
                            <div
                              className="relative"
                              onMouseEnter={() => openPopup(s.id, d.id)}
                              onMouseLeave={scheduleClose}
                            >
                              <div className="grid cursor-pointer grid-cols-[5rem_1fr_auto] items-center gap-x-6 py-3">
                                <span className="text-xs font-medium text-muted-foreground">Activity</span>
                                <span className="text-xs">
                                  {attractions.length === 0
                                    ? <span className="italic text-muted-foreground">None selected — hover to pick</span>
                                    : attractions.map((a) => a.name).join(', ')}
                                </span>
                                <span className="text-right text-xs font-semibold text-primary">
                                  ${attractions.reduce((sum, a) => sum + a.price, 0)}
                                </span>
                              </div>

                              {/* ── Hover popup ── */}
                              <AnimatePresence>
                                {isPopupOpen && allCityAttractions.length > 0 && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    transition={{ duration: 0.15 }}
                                    onMouseEnter={cancelClose}
                                    onMouseLeave={scheduleClose}
                                    className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-border bg-card p-2 shadow-lg"
                                  >
                                    <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                      Toggle activities
                                    </p>
                                    <div className="max-h-48 space-y-0.5 overflow-y-auto">
                                      {allCityAttractions.map((attr) => {
                                        const isSelected = attractions.some((a) => a.id === attr.id);
                                        return (
                                          <button
                                            key={attr.id}
                                            type="button"
                                            onClick={() => toggleAttractionInSuggestion(s.id, d.id, attr)}
                                            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors duration-100 ${
                                              isSelected
                                                ? 'bg-primary/10 font-medium text-primary'
                                                : 'text-foreground hover:bg-muted'
                                            }`}
                                          >
                                            <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] ${
                                              isSelected
                                                ? 'border-primary bg-primary text-white'
                                                : 'border-border'
                                            }`}>
                                              {isSelected && '\u2713'}
                                            </span>
                                            <span className="flex-1 truncate">{attr.name}</span>
                                            <span className="shrink-0 tabular-nums text-muted-foreground">
                                              {attr.price === 0 ? 'Free' : `$${attr.price}`}
                                            </span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Return flight card */}
                    {segments.length > 0 && (() => {
                      const returnSeg = segments[segments.length - 1];
                      const returnFlight = s.selectedFlights[`segment-${segments.length - 1}`];
                      return returnSeg && returnFlight ? (
                        <div className={`rounded-xl border border-border shadow-sm ${theme.destBg}`}>
                          <div className="grid grid-cols-[5rem_1fr_auto] items-center gap-x-6 px-5 py-3">
                            <span className="text-xs font-medium text-muted-foreground">Return</span>
                            <span className="text-xs">{returnSeg.from} → {returnSeg.to} at {returnFlight.departure}</span>
                            <span className="text-right text-xs font-semibold text-primary">${returnFlight.price}</span>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </motion.div>
              );
            })}
          </div>

        </>
      )}
    </StepLayout>
  );
}

function parseTime(departure: string): number {
  const [h, m] = departure.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}
