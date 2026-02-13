import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SchedulePage from '@/pages/SchedulePage';
import { useTripStore } from '@/store/tripStore';

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('SchedulePage', () => {
  beforeEach(() => {
    useTripStore.getState().resetTrip();
    useTripStore.getState().addDestination({
      id: 1, country: 'Portugal', city: 'Lisbon', lat: 38.72, lng: -9.14,
    });
    useTripStore.getState().addDestination({
      id: 2, country: 'Austria', city: 'Vienna', lat: 48.21, lng: 16.37,
    });
  });

  it('renders destination names', () => {
    renderWithRouter(<SchedulePage />);
    expect(screen.getByText('Lisbon')).toBeInTheDocument();
    expect(screen.getByText('Vienna')).toBeInTheDocument();
  });

  it('renders start date input', () => {
    renderWithRouter(<SchedulePage />);
    expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
  });

  it('has Next button initially disabled when start date missing', () => {
    renderWithRouter(<SchedulePage />);
    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeDisabled();
  });
});
