import { describe, it, expect, beforeEach } from 'vitest';
import { useTripStore } from '@/store/tripStore';
import type { Capital } from '@/types';

const lisbon: Capital = { id: 1, country: 'Portugal', city: 'Lisbon', lat: 38.72, lng: -9.14 };
const vienna: Capital = { id: 2, country: 'Austria', city: 'Vienna', lat: 48.21, lng: 16.37 };
const paris: Capital = { id: 3, country: 'France', city: 'Paris', lat: 48.86, lng: 2.35 };

describe('tripStore', () => {
  beforeEach(() => {
    useTripStore.getState().resetTrip();
  });

  it('adds a destination', () => {
    useTripStore.getState().addDestination(lisbon);
    expect(useTripStore.getState().destinations).toHaveLength(1);
    expect(useTripStore.getState().destinations[0].city).toBe('Lisbon');
  });

  it('does not add duplicate destination', () => {
    useTripStore.getState().addDestination(lisbon);
    useTripStore.getState().addDestination(lisbon);
    expect(useTripStore.getState().destinations).toHaveLength(1);
  });

  it('removes a destination and cascades state cleanup', () => {
    const store = useTripStore.getState();
    store.addDestination(lisbon);
    store.addDestination(vienna);
    store.addDestination(paris);

    // Set dependent state
    useTripStore.getState().setDuration(2, 3);
    useTripStore.getState().selectHotel(2, {
      id: 10,
      city_id: 2,
      name: 'Hotel Vienna',
      price_per_night: 150,
      rating: 4.5,
    });
    useTripStore.getState().selectAttraction(2, {
      id: 20,
      city_id: 2,
      name: 'Museum',
      category: 'Museum',
      price: 15,
    });
    useTripStore.getState().selectFlight('segment-0', { departure: '06:00', price: 200 });

    // Remove Vienna
    useTripStore.getState().removeDestination(2);

    const state = useTripStore.getState();
    expect(state.destinations).toHaveLength(2);
    expect(state.destinations.find((d) => d.id === 2)).toBeUndefined();
    expect(state.durations[2]).toBeUndefined();
    expect(state.selectedHotels[2]).toBeUndefined();
    expect(state.selectedAttractions[2]).toBeUndefined();
    // Flights should be cleared entirely since route changed
    expect(Object.keys(state.selectedFlights)).toHaveLength(0);
  });

  it('calculates total price correctly', () => {
    const store = useTripStore.getState();
    store.addDestination(lisbon);
    store.setDuration(1, 3);
    store.selectFlight('segment-0', { departure: '06:00', price: 200 });
    store.selectFlight('segment-1', { departure: '12:00', price: 300 });
    store.selectHotel(1, {
      id: 10,
      city_id: 1,
      name: 'Hotel',
      price_per_night: 100,
      rating: 4.0,
    });
    store.selectAttraction(1, {
      id: 20,
      city_id: 1,
      name: 'Museum',
      category: 'Museum',
      price: 15,
    });

    // flights: 200 + 300 = 500, hotel: 100*3 = 300, attraction: 15 = total 815
    expect(useTripStore.getState().getTotalPrice()).toBe(815);
  });

  it('clears flights on reorder', () => {
    const store = useTripStore.getState();
    store.addDestination(lisbon);
    store.addDestination(vienna);
    store.selectFlight('segment-0', { departure: '06:00', price: 200 });

    store.reorderDestinations([vienna, lisbon]);

    expect(Object.keys(useTripStore.getState().selectedFlights)).toHaveLength(0);
    expect(useTripStore.getState().destinations[0].city).toBe('Vienna');
  });
});
