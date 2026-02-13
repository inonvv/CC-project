import { useEffect } from 'react';
import { useTripStore } from '@/store/tripStore';

export function useGeolocation() {
  const origin = useTripStore((s) => s.origin);
  const setOrigin = useTripStore((s) => s.setOrigin);

  useEffect(() => {
    if (origin) return;

    if (!navigator.geolocation) {
      setOrigin({ city: 'Tel Aviv', lat: 32.08, lng: 34.78 });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setOrigin({
          city: 'Your Location',
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        setOrigin({ city: 'Tel Aviv', lat: 32.08, lng: 34.78 });
      }
    );
  }, [origin, setOrigin]);
}
