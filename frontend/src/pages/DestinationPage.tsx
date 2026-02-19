import { useNavigate } from 'react-router-dom';
import { StepLayout } from '@/components/StepLayout';
import { CitySearch } from '@/components/CitySearch';
import { CityMap } from '@/components/CityMap';
import { SelectedCitiesList } from '@/components/SelectedCitiesList';
import { useTripStore } from '@/store/tripStore';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useCapitals } from '@/hooks/useCapitals';

export default function DestinationPage() {
  const navigate = useNavigate();
  const destinations = useTripStore((s) => s.destinations);
  const { capitals } = useCapitals();
  useGeolocation();

  return (
    <StepLayout
      currentStep={1}
      onNext={() => navigate('/suggestions')}
      nextDisabled={destinations.length < 1}
    >
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold">Choose Your Destinations</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Search or click anywhere on the map to add a capital
        </p>
      </div>

      <div className="mb-8">
        <CitySearch />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <SelectedCitiesList />
        <CityMap capitals={capitals} />
      </div>

      {destinations.length === 0 && (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Select at least 1 destination to continue.
        </p>
      )}
    </StepLayout>
  );
}
