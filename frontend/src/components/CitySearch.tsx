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
    <div className="relative mx-auto max-w-md">
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <Input
          placeholder={loading ? 'Loading cities...' : 'Search European capitals...'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
          className="pl-9"
        />
      </div>
      {filtered.length > 0 && (
        <div className="absolute z-10 mt-1 max-h-52 w-full overflow-y-auto rounded-lg border border-border bg-card shadow-lg">
          {filtered.map((city) => (
            <button
              key={city.id}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left transition-colors hover:bg-primary/5"
              onClick={() => {
                addDestination(city);
                setQuery('');
              }}
            >
              <svg className="h-3.5 w-3.5 shrink-0 text-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <span className="font-medium">{city.city}</span>
              <span className="text-xs text-muted-foreground">{city.country}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
