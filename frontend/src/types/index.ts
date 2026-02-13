export interface Capital {
  id: number;
  country: string;
  city: string;
  lat: number;
  lng: number;
}

export interface Hotel {
  id: number;
  city_id: number;
  name: string;
  price_per_night: number;
  rating: number;
  image_url?: string;
}

export interface Attraction {
  id: number;
  city_id: number;
  name: string;
  category: string;
  price: number;
  image_url?: string;
  address?: string;
}

export interface FlightOption {
  departure: string;
  price: number;
}

export interface Segment {
  from: string;
  to: string;
  options: FlightOption[];
}

export interface Origin {
  city: string;
  lat: number;
  lng: number;
}

export interface TripState {
  origin: Origin | null;
  destinations: Capital[];
  startDate: string | null;
  durations: Record<number, number>;
  selectedFlights: Record<string, FlightOption>;
  selectedHotels: Record<number, Hotel>;
  selectedAttractions: Record<number, Attraction>;
}
