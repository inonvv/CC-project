import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import SuggestionsPage from '@/pages/SuggestionsPage';
import { useTripStore } from '@/store/tripStore';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockHotels = [
  { id: 1, city_id: 1, name: 'Budget Inn', price_per_night: 50, rating: 3 },
  { id: 2, city_id: 1, name: 'Grand Hotel', price_per_night: 200, rating: 5 },
  { id: 3, city_id: 1, name: 'Mid Hotel', price_per_night: 100, rating: 4 },
];

const mockAttractions = [
  { id: 1, city_id: 1, name: 'Free Park', category: 'Nature', price: 0 },
  { id: 2, city_id: 1, name: 'Museum', category: 'Culture', price: 25 },
  { id: 3, city_id: 1, name: 'VIP Tour', category: 'Tour', price: 100 },
];

const mockSegments = {
  segments: [
    { from: 'Home', to: 'Lisbon', options: [{ departure: '08:00', price: 50 }, { departure: '12:00', price: 100 }, { departure: '18:00', price: 150 }] },
    { from: 'Lisbon', to: 'Home', options: [{ departure: '08:00', price: 50 }, { departure: '12:00', price: 100 }, { departure: '18:00', price: 150 }] },
  ],
};

vi.mock('@/services/api', () => ({
  default: {
    post: vi.fn(() => Promise.resolve({ data: mockSegments })),
    get: vi.fn((url: string) => {
      if (url === '/hotels') return Promise.resolve({ data: mockHotels });
      if (url === '/attractions') return Promise.resolve({ data: mockAttractions });
      return Promise.resolve({ data: [] });
    }),
  },
}));

function renderPage() {
  return render(<BrowserRouter><SuggestionsPage /></BrowserRouter>);
}

describe('SuggestionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTripStore.getState().resetTrip();
    useTripStore.getState().setOrigin({ city: 'Home', lat: 0, lng: 0 });
    useTripStore.getState().addDestination({
      id: 1, country: 'Portugal', city: 'Lisbon', lat: 38.72, lng: -9.14,
    });
  });

  it('shows loading state initially', () => {
    renderPage();
    expect(screen.getByText('Building suggestions...')).toBeInTheDocument();
  });

  it('renders all 3 suggestion cards after loading', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Budget')).toBeInTheDocument();
    });
    expect(screen.getByText('Comfort')).toBeInTheDocument();
    expect(screen.getByText('Premium')).toBeInTheDocument();
    expect(screen.getAllByText('Choose')).toHaveLength(3);
    expect(screen.getByText('Customize Manually')).toBeInTheDocument();
  });

  it('navigates to /schedule when "Customize Manually" is clicked', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Customize Manually')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText('Customize Manually'));
    expect(mockNavigate).toHaveBeenCalledWith('/schedule');
  });

  it('applies suggestion and navigates to /schedule when first "Choose" is clicked', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByText('Choose')).toHaveLength(3);
    });
    await userEvent.click(screen.getAllByText('Choose')[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/schedule');
    const state = useTripStore.getState();
    expect(state.startDate).toBeTruthy();
    expect(Object.keys(state.selectedHotels)).toHaveLength(1);
    expect(Object.keys(state.selectedAttractions)).toHaveLength(1);
    // Each value should be an array of attractions
    expect(Array.isArray(Object.values(state.selectedAttractions)[0])).toBe(true);
    expect(Object.values(state.selectedAttractions)[0]).toHaveLength(1);
  });
});
