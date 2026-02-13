import { describe, it, expect, beforeEach } from 'vitest';
import { useTripStore } from '@/store/tripStore';

describe('Step navigation validation', () => {
  beforeEach(() => {
    useTripStore.getState().resetTrip();
  });

  it('cannot proceed to schedule without at least 2 destinations', () => {
    useTripStore.getState().addDestination({
      id: 1, country: 'Portugal', city: 'Lisbon', lat: 38.72, lng: -9.14,
    });
    expect(useTripStore.getState().destinations.length).toBeLessThan(2);
  });

  it('removing a city clears all its dependent state', () => {
    const store = useTripStore.getState();
    store.addDestination({ id: 1, country: 'Portugal', city: 'Lisbon', lat: 38.72, lng: -9.14 });
    store.addDestination({ id: 2, country: 'Austria', city: 'Vienna', lat: 48.21, lng: 16.37 });

    useTripStore.getState().setDuration(1, 3);
    useTripStore.getState().selectHotel(1, {
      id: 10, city_id: 1, name: 'Hotel', price_per_night: 100, rating: 4.0,
    });
    useTripStore.getState().selectAttraction(1, {
      id: 20, city_id: 1, name: 'Museum', category: 'Museum', price: 15,
    });
    useTripStore.getState().selectFlight('segment-0', { departure: '06:00', price: 200 });

    useTripStore.getState().removeDestination(1);

    const state = useTripStore.getState();
    expect(state.destinations).toHaveLength(1);
    expect(state.durations[1]).toBeUndefined();
    expect(state.selectedHotels[1]).toBeUndefined();
    expect(state.selectedAttractions[1]).toBeUndefined();
    expect(Object.keys(state.selectedFlights)).toHaveLength(0);
  });

  it('all flights are cleared when a destination is removed', () => {
    const store = useTripStore.getState();
    store.addDestination({ id: 1, country: 'Portugal', city: 'Lisbon', lat: 38.72, lng: -9.14 });
    store.addDestination({ id: 2, country: 'Austria', city: 'Vienna', lat: 48.21, lng: 16.37 });
    store.addDestination({ id: 3, country: 'France', city: 'Paris', lat: 48.86, lng: 2.35 });

    useTripStore.getState().selectFlight('segment-0', { departure: '06:00', price: 200 });
    useTripStore.getState().selectFlight('segment-1', { departure: '12:00', price: 250 });
    useTripStore.getState().selectFlight('segment-2', { departure: '21:00', price: 300 });
    useTripStore.getState().selectFlight('segment-3', { departure: '06:00', price: 180 });

    // Remove middle destination
    useTripStore.getState().removeDestination(2);

    expect(Object.keys(useTripStore.getState().selectedFlights)).toHaveLength(0);
  });
});
