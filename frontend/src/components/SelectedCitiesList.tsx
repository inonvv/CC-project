import { useRef } from 'react';
import { useTripStore } from '@/store/tripStore';
import { Button } from '@/components/ui/button';
import type { Capital } from '@/types';

export function SelectedCitiesList() {
  const destinations = useTripStore((s) => s.destinations);
  const removeDestination = useTripStore((s) => s.removeDestination);
  const reorderDestinations = useTripStore((s) => s.reorderDestinations);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  if (destinations.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
        No destinations selected yet. Search and add cities above.
      </div>
    );
  }

  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) {
      dragItem.current = null;
      dragOverItem.current = null;
      return;
    }

    const items: Capital[] = [...destinations];
    const draggedItem = items[dragItem.current];
    items.splice(dragItem.current, 1);
    items.splice(dragOverItem.current, 0, draggedItem);

    reorderDestinations(items);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  return (
    <div className="space-y-2">
      {destinations.map((dest, index) => (
        <div
          key={dest.id}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragEnter={() => handleDragEnter(index)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => e.preventDefault()}
          className="flex cursor-grab items-center justify-between rounded-lg border border-border bg-white p-3 shadow-sm transition-transform duration-200 hover:scale-[1.02] active:cursor-grabbing"
        >
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground select-none">&#x2630;</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
              {index + 1}
            </span>
            <div>
              <span className="font-medium">{dest.city}</span>
              <span className="ml-2 text-sm text-muted-foreground">{dest.country}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeDestination(dest.id)}
            className="text-muted-foreground hover:text-destructive"
          >
            X
          </Button>
        </div>
      ))}
      <p className="text-xs text-muted-foreground">Drag to reorder destinations</p>
    </div>
  );
}
