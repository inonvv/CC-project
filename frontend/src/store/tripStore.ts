import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Capital, Hotel, Attraction, FlightOption, Origin, RouteSuggestion } from '@/types';

interface TripStore {
  origin: Origin | null;
  destinations: Capital[];
  startDate: string | null;
  durations: Record<number, number>;
  selectedFlights: Record<string, FlightOption>;
  selectedHotels: Record<number, Hotel>;
  selectedAttractions: Record<number, Attraction[]>;
  previewMode: boolean;

  setOrigin: (origin: Origin) => void;
  addDestination: (city: Capital) => void;
  removeDestination: (cityId: number) => void;
  reorderDestinations: (newOrder: Capital[]) => void;
  setStartDate: (date: string) => void;
  setDuration: (cityId: number, days: number) => void;
  selectFlight: (segmentKey: string, option: FlightOption) => void;
  selectHotel: (cityId: number, hotel: Hotel) => void;
  selectAttraction: (cityId: number, attraction: Attraction) => void;
  applySuggestion: (suggestion: RouteSuggestion) => void;
  resetTrip: () => void;
  setPreviewMode: (enabled: boolean) => void;
  clearDestinations: () => void;
  getTotalPrice: () => number;
}

const initialState = {
  origin: null,
  destinations: [] as Capital[],
  startDate: null,
  durations: {} as Record<number, number>,
  selectedFlights: {} as Record<string, FlightOption>,
  selectedHotels: {} as Record<number, Hotel>,
  selectedAttractions: {} as Record<number, Attraction[]>,
  previewMode: false,
};

export const useTripStore = create<TripStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setOrigin: (origin) => set({ origin }),

      addDestination: (city) =>
        set((state) => {
          if (state.destinations.some((d) => d.id === city.id)) return state;
          return { destinations: [...state.destinations, city] };
        }),

      removeDestination: (cityId) =>
        set((state) => {
          const destinations = state.destinations.filter((d) => d.id !== cityId);
          const durations = { ...state.durations };
          delete durations[cityId];
          const selectedHotels = { ...state.selectedHotels };
          delete selectedHotels[cityId];
          const selectedAttractions = { ...state.selectedAttractions };
          delete selectedAttractions[cityId];
          return {
            destinations,
            durations,
            selectedHotels,
            selectedAttractions,
            selectedFlights: {},
          };
        }),

      reorderDestinations: (newOrder) =>
        set({
          destinations: newOrder,
          selectedFlights: {},
        }),

      setStartDate: (date) => set({ startDate: date }),

      setDuration: (cityId, days) =>
        set((state) => ({
          durations: { ...state.durations, [cityId]: days },
        })),

      selectFlight: (segmentKey, option) =>
        set((state) => ({
          selectedFlights: { ...state.selectedFlights, [segmentKey]: option },
        })),

      selectHotel: (cityId, hotel) =>
        set((state) => ({
          selectedHotels: { ...state.selectedHotels, [cityId]: hotel },
        })),

      selectAttraction: (cityId, attraction) =>
        set((state) => {
          const current = state.selectedAttractions[cityId] || [];
          const exists = current.some((a) => a.id === attraction.id);
          return {
            selectedAttractions: {
              ...state.selectedAttractions,
              [cityId]: exists
                ? current.filter((a) => a.id !== attraction.id)
                : [...current, attraction],
            },
          };
        }),

      applySuggestion: (suggestion) =>
        set({
          startDate: suggestion.startDate,
          durations: suggestion.durations,
          selectedFlights: suggestion.selectedFlights,
          selectedHotels: suggestion.selectedHotels,
          selectedAttractions: suggestion.selectedAttractions,
        }),

      resetTrip: () => set(initialState),

      setPreviewMode: (enabled) => set({ previewMode: enabled }),

      clearDestinations: () =>
        set({
          destinations: [],
          durations: {},
          selectedFlights: {},
          selectedHotels: {},
          selectedAttractions: {},
        }),

      getTotalPrice: () => {
        const state = get();
        const flightTotal = Object.values(state.selectedFlights).reduce(
          (sum, f) => sum + f.price,
          0
        );
        const hotelTotal = Object.entries(state.selectedHotels).reduce(
          (sum, [cityId, hotel]) => {
            const days = state.durations[Number(cityId)] || 0;
            return sum + hotel.price_per_night * days;
          },
          0
        );
        const attractionTotal = Object.values(state.selectedAttractions)
          .flat()
          .reduce((sum, a) => sum + a.price, 0);
        return flightTotal + hotelTotal + attractionTotal;
      },
    }),
    {
      name: 'fly-travel-trip',
    }
  )
);
