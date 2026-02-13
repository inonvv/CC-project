import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { useCapitals } from '@/hooks/useCapitals';
import { useTripStore } from '@/store/tripStore';

export function CitySearch() {
  const [query, setQuery] = useState('');
  const { capitals, loading } = useCapitals();
  const addDestination = useTripStore((s) => s.addDestination);
  const destinations = useTripStore((s) => s.destinations);

  const filtered = query.length > 0
    ? capitals.filter(
        (c) =>
          c.city.toLowerCase().includes(query.toLowerCase()) &&
          !destinations.some((d) => d.id === c.id)
      )
    : [];

  return (
    <div className="relative">
      <Input
        placeholder={loading ? 'Loading cities...' : 'Search European capitals...'}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={loading}
      />
      {filtered.length > 0 && (
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-border bg-white shadow-lg">
          {filtered.map((city) => (
            <button
              key={city.id}
              className="w-full px-4 py-2 text-left transition-colors hover:bg-accent"
              onClick={() => {
                addDestination(city);
                setQuery('');
              }}
            >
              <span className="font-medium">{city.city}</span>
              <span className="ml-2 text-sm text-muted-foreground">{city.country}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
