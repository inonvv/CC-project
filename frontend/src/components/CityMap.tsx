import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvents, CircleMarker, Tooltip } from 'react-leaflet';
import { useTripStore } from '@/store/tripStore';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { Capital } from '@/types';

// Fix default marker icons
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

function MapUpdater() {
  const map = useMap();
  const destinations = useTripStore((s) => s.destinations);

  useEffect(() => {
    if (destinations.length > 0) {
      const bounds = L.latLngBounds(destinations.map((d) => [d.lat, d.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 6 });
    }
  }, [destinations, map]);

  return null;
}

function ClickToSelect({ capitals }: { capitals: Capital[] }) {
  const addDestination = useTripStore((s) => s.addDestination);
  const destinations = useTripStore((s) => s.destinations);

  useMapEvents({
    click(e) {
      if (capitals.length === 0) return;

      const clickedLatLng = e.latlng;
      let closest: Capital | null = null;
      let minDist = Infinity;

      for (const cap of capitals) {
        if (destinations.some((d) => d.id === cap.id)) continue;
        const dist = clickedLatLng.distanceTo(L.latLng(cap.lat, cap.lng));
        if (dist < minDist) {
          minDist = dist;
          closest = cap;
        }
      }

      if (closest) {
        addDestination(closest);
      }
    },
  });

  return null;
}

interface CityMapProps {
  capitals: Capital[];
}

export function CityMap({ capitals }: CityMapProps) {
  const destinations = useTripStore((s) => s.destinations);
  const addDestination = useTripStore((s) => s.addDestination);
  const clearDestinations = useTripStore((s) => s.clearDestinations);
  const positions = destinations.map((d) => [d.lat, d.lng] as [number, number]);
  const selectedIds = new Set(destinations.map((d) => d.id));

  return (
    <div className="relative z-0 h-[400px] overflow-hidden rounded-lg border border-border">
      <MapContainer
        center={[50, 15]}
        zoom={4}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {capitals
          .filter((c) => !selectedIds.has(c.id))
          .map((cap) => (
            <CircleMarker
              key={cap.id}
              center={[cap.lat, cap.lng]}
              radius={5}
              pathOptions={{ color: '#06B6D4', fillColor: '#06B6D4', fillOpacity: 0.4, weight: 1 }}
              eventHandlers={{ click: () => addDestination(cap) }}
            >
              <Tooltip>{cap.city}</Tooltip>
            </CircleMarker>
          ))}

        {destinations.map((dest) => (
          <Marker key={dest.id} position={[dest.lat, dest.lng]} />
        ))}

        {positions.length > 1 && (
          <Polyline positions={positions} color="#06B6D4" weight={2} />
        )}

        <ClickToSelect capitals={capitals} />
        <MapUpdater />
      </MapContainer>

      {/* Clear button — bottom-left corner */}
      {destinations.length > 0 && (
        <button
          onClick={clearDestinations}
          className="absolute bottom-3 left-3 z-[1000] rounded bg-card px-3 py-1.5 text-xs font-medium text-destructive shadow-md border border-border transition-transform duration-200 hover:scale-105"
        >
          Clear All
        </button>
      )}
    </div>
  );
}
