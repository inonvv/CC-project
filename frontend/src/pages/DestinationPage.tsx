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
      onNext={() => navigate('/schedule')}
      nextDisabled={destinations.length < 1}
    >
      <h2 className="mb-6 text-2xl font-bold">Choose Your Destinations</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Search below or click anywhere on the map to add the nearest capital.
      </p>
      <div className="mb-6">
        <CitySearch />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <SelectedCitiesList />
        <CityMap capitals={capitals} />
      </div>
      {destinations.length === 0 && (
        <p className="mt-4 text-sm text-muted-foreground">
          Select at least 1 destination to continue.
        </p>
      )}
    </StepLayout>
  );
}
