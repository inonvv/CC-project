import { useRef, useState } from 'react';
import { useTripStore } from '@/store/tripStore';
import type { Capital } from '@/types';

export function SelectedCitiesList() {
  const destinations = useTripStore((s) => s.destinations);
  const removeDestination = useTripStore((s) => s.removeDestination);
  const reorderDestinations = useTripStore((s) => s.reorderDestinations);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  if (destinations.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border-2 border-dashed border-border/60 p-10">
        <div className="text-center">
          <svg className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          <p className="text-sm text-muted-foreground">No destinations yet</p>
          <p className="mt-1 text-xs text-muted-foreground/70">Search or click the map to add cities</p>
        </div>
      </div>
    );
  }

  const handleDragStart = (index: number) => {
    dragItem.current = index;
    setDragIndex(index);
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) {
      setDragIndex(null);
      return;
    }
    if (dragItem.current !== dragOverItem.current) {
      const items: Capital[] = [...destinations];
      const draggedItem = items[dragItem.current];
      items.splice(dragItem.current, 1);
      items.splice(dragOverItem.current, 0, draggedItem);
      reorderDestinations(items);
    }
    dragItem.current = null;
    dragOverItem.current = null;
    setDragIndex(null);
  };

  return (
    <div className="flex flex-col">
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Your route ({destinations.length} {destinations.length === 1 ? 'city' : 'cities'})
        </span>
        <span className="text-[10px] text-muted-foreground/60">Drag to reorder</span>
      </div>

      <div className="hide-scrollbar max-h-[340px] space-y-1.5 overflow-y-auto pr-1" style={{ scrollbarWidth: 'none' }}>
        {destinations.map((dest, index) => (
          <div
            key={dest.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragEnter={() => handleDragEnter(index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
            className={`group flex cursor-grab items-center gap-3 rounded-lg border bg-card px-3 py-2.5 transition-all duration-150 active:cursor-grabbing ${
              dragIndex === index
                ? 'scale-[1.03] border-primary/40 shadow-md'
                : 'border-border/60 shadow-sm hover:border-primary/30 hover:shadow'
            }`}
          >
            {/* Drag handle */}
            <svg className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="5" cy="3" r="1.2" />
              <circle cx="11" cy="3" r="1.2" />
              <circle cx="5" cy="8" r="1.2" />
              <circle cx="11" cy="8" r="1.2" />
              <circle cx="5" cy="13" r="1.2" />
              <circle cx="11" cy="13" r="1.2" />
            </svg>

            {/* Number badge */}
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
              {index + 1}
            </span>

            {/* City info */}
            <div className="min-w-0 flex-1">
              <span className="font-medium leading-tight">{dest.city}</span>
              <span className="ml-1.5 text-xs text-muted-foreground">{dest.country}</span>
            </div>

            {/* Remove button */}
            <button
              aria-label="Remove"
              onClick={() => removeDestination(dest.id)}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground/40 transition-all hover:bg-destructive/10 hover:text-destructive"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Route connector line (visual) */}
      {destinations.length > 1 && (
        <div className="mt-3 flex items-center gap-1.5 px-1">
          <div className="h-[2px] flex-1 rounded-full bg-gradient-to-r from-primary/60 to-primary/20" />
          <span className="text-[10px] font-medium text-primary/50">
            {destinations.length} stops
          </span>
        </div>
      )}
    </div>
  );
}
