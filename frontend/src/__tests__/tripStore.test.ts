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
    expect(state.selectedAttractions[2]).toBeUndefined(); // array deleted for removed city
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

    // flights: 200 + 300 = 500, hotel: 100*3 = 300, attraction: [15] = total 815
    expect(useTripStore.getState().getTotalPrice()).toBe(815);
  });

  it('selectAttraction toggles: add then remove same attraction', () => {
    const store = useTripStore.getState();
    store.addDestination(lisbon);

    const museum = { id: 20, city_id: 1, name: 'Museum', category: 'Museum', price: 15 };

    // First call adds to array
    store.selectAttraction(1, museum);
    expect(useTripStore.getState().selectedAttractions[1]).toHaveLength(1);
    expect(useTripStore.getState().selectedAttractions[1][0].id).toBe(20);

    // Second call with same id removes
    store.selectAttraction(1, museum);
    expect(useTripStore.getState().selectedAttractions[1]).toHaveLength(0);
  });

  it('selectAttraction accumulates different attractions', () => {
    const store = useTripStore.getState();
    store.addDestination(lisbon);

    const museum = { id: 20, city_id: 1, name: 'Museum', category: 'Museum', price: 15 };
    const park = { id: 21, city_id: 1, name: 'Park', category: 'Nature', price: 0 };
    const tour = { id: 22, city_id: 1, name: 'Tour', category: 'Tour', price: 50 };

    store.selectAttraction(1, museum);
    store.selectAttraction(1, park);
    store.selectAttraction(1, tour);

    const attractions = useTripStore.getState().selectedAttractions[1];
    expect(attractions).toHaveLength(3);
    expect(attractions.map((a) => a.id)).toEqual([20, 21, 22]);
  });

  it('getTotalPrice sums all attractions across all cities (flat-map)', () => {
    const store = useTripStore.getState();
    store.addDestination(lisbon);
    store.addDestination(vienna);
    store.setDuration(1, 2);
    store.setDuration(2, 2);
    store.selectFlight('segment-0', { departure: '06:00', price: 100 });

    store.selectHotel(1, { id: 10, city_id: 1, name: 'Hotel', price_per_night: 50, rating: 4 });
    store.selectHotel(2, { id: 11, city_id: 2, name: 'Hotel', price_per_night: 50, rating: 4 });

    // Multiple attractions per city
    store.selectAttraction(1, { id: 20, city_id: 1, name: 'Museum', category: 'Museum', price: 15 });
    store.selectAttraction(1, { id: 21, city_id: 1, name: 'Park', category: 'Nature', price: 10 });
    store.selectAttraction(2, { id: 30, city_id: 2, name: 'Palace', category: 'Culture', price: 25 });

    // flights: 100, hotels: 50*2 + 50*2 = 200, attractions: 15+10+25 = 50 → total 350
    expect(useTripStore.getState().getTotalPrice()).toBe(350);
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
