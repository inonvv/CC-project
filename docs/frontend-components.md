# Frontend Components Documentation

## Architecture Overview

```
App (BrowserRouter)
 ├── OnboardingPage          ← standalone, no StepLayout
 ├── DestinationPage         ← StepLayout step 1
 │    ├── CitySearch
 │    ├── SelectedCitiesList
 │    └── CityMap
 ├── SuggestionsPage         ← StepLayout step 2
 ├── SchedulePage            ← StepLayout step 3
 ├── HotelsPage              ← StepLayout step 4
 │    └── HotelCard (×N)
 ├── AttractionsPage         ← StepLayout step 5
 │    └── AttractionCard (×N)
 └── SummaryPage             ← StepLayout step 6
```

---

## Types — `src/types/index.ts`

| Interface | Fields |
|-----------|--------|
| `Capital` | `id`, `country`, `city`, `lat`, `lng` |
| `Hotel` | `id`, `city_id`, `name`, `price_per_night`, `rating`, `image_url?` |
| `Attraction` | `id`, `city_id`, `name`, `category`, `price`, `image_url?`, `address?` |
| `FlightOption` | `departure`, `price` |
| `Segment` | `from`, `to`, `options: FlightOption[]` |
| `Origin` | `city`, `lat`, `lng` |
| `RouteSuggestion` | `id` (`'budget'|'comfort'|'premium'`), `label`, `description`, `startDate`, `durations`, `selectedFlights`, `selectedHotels`, `selectedAttractions`, `totalPrice` |
| `TripState` | `origin`, `destinations`, `startDate`, `durations`, `selectedFlights`, `selectedHotels`, `selectedAttractions` |

---

## Store — `src/store/tripStore.ts`

Zustand store with `persist` middleware (localStorage key: `fly-travel-trip`).

### State

| Field | Type | Default |
|-------|------|---------|
| `origin` | `Origin \| null` | `null` |
| `destinations` | `Capital[]` | `[]` |
| `startDate` | `string \| null` | `null` |
| `durations` | `Record<number, number>` | `{}` |
| `selectedFlights` | `Record<string, FlightOption>` | `{}` |
| `selectedHotels` | `Record<number, Hotel>` | `{}` |
| `selectedAttractions` | `Record<number, Attraction>` | `{}` |
| `previewMode` | `boolean` | `false` |

### Actions

| Action | Signature | Notes |
|--------|-----------|-------|
| `setOrigin` | `(origin: Origin) => void` | |
| `addDestination` | `(city: Capital) => void` | Deduplicates by `id` |
| `removeDestination` | `(cityId: number) => void` | Cascade-deletes durations, hotels, attractions for that city; resets all flights |
| `reorderDestinations` | `(newOrder: Capital[]) => void` | Resets all flights (order determines segments) |
| `setStartDate` | `(date: string) => void` | |
| `setDuration` | `(cityId: number, days: number) => void` | |
| `selectFlight` | `(segmentKey: string, option: FlightOption) => void` | |
| `selectHotel` | `(cityId: number, hotel: Hotel) => void` | |
| `selectAttraction` | `(cityId: number, attraction: Attraction) => void` | |
| `applySuggestion` | `(suggestion: RouteSuggestion) => void` | Bulk-sets startDate, durations, flights, hotels, attractions |
| `resetTrip` | `() => void` | Restores all state to defaults |
| `setPreviewMode` | `(enabled: boolean) => void` | |
| `clearDestinations` | `() => void` | Clears destinations + all dependent data (keeps origin) |
| `getTotalPrice` | `() => number` | Computed: flights + (hotel × days) + attractions |

---

## Services — `src/services/api.ts`

Axios instance with `baseURL: 'http://localhost:8000'`. No interceptors or auth.

---

## Hooks

### `useCapitals` — `src/hooks/useCapitals.ts`

**Returns:** `{ capitals: Capital[], loading: boolean }`

Fetches `GET /capitals` on mount. No caching — re-fetches each mount.

### `useGeolocation` — `src/hooks/useGeolocation.ts`

**Returns:** nothing (side-effect only)

Sets `origin` in store via browser geolocation API. Falls back to Tel Aviv (`32.08, 34.78`) if geolocation is unavailable or denied. Skips entirely if origin is already set.

---

## UI Components — `src/components/ui/`

### Button — `ui/button.tsx`

| Prop | Type | Default |
|------|------|---------|
| `variant` | `'default' \| 'destructive' \| 'outline' \| 'secondary' \| 'ghost' \| 'link'` | `'default'` |
| `size` | `'default' \| 'xs' \| 'sm' \| 'lg' \| 'icon' \| 'icon-xs' \| 'icon-sm' \| 'icon-lg'` | `'default'` |
| `asChild` | `boolean` | `false` |

Styled via CVA. When `asChild=true`, renders via Radix `Slot` (polymorphic).

### Card — `ui/card.tsx`

Exports: `Card`, `CardHeader`, `CardFooter`, `CardTitle`, `CardAction`, `CardDescription`, `CardContent`

All accept standard `div` props + `className`. Pure layout wrappers with `data-slot` attributes.

### Input — `ui/input.tsx`

Standard styled `<input>`. Accepts all native input props. Focus ring + aria-invalid styling.

### Label — `ui/label.tsx`

Wraps Radix `Label.Root`. Handles disabled/peer-disabled states.

---

## Custom Components — `src/components/`

### StepLayout — `components/StepLayout.tsx`

The shared page wrapper for all wizard steps (steps 1–6).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `currentStep` | `number` | required | 0-based index into STEPS array |
| `children` | `ReactNode` | required | Page content |
| `onNext` | `() => void` | `undefined` | If omitted, no Next button is rendered |
| `nextDisabled` | `boolean` | `false` | Disables the Next button |
| `nextLabel` | `string` | `'Next'` | Custom Next button text |
| `hideNav` | `boolean` | `false` | Hides both Back and Next buttons |

**Steps array (7 steps):**

| Index | Path | Label |
|-------|------|-------|
| 0 | `/` | Start |
| 1 | `/destinations` | Destinations |
| 2 | `/suggestions` | Suggestions |
| 3 | `/schedule` | Schedule & Flights |
| 4 | `/hotels` | Hotels |
| 5 | `/attractions` | Attractions |
| 6 | `/summary` | Summary |

**Renders:**
- Plane fly-across transition overlay (700ms, on Next click)
- Reset confirmation modal ("Start over?")
- Preview mode banner (when `previewMode=true`)
- 7-step flight-path indicator (plane GIF on current, checkmarks on completed)
- Content area with fade-in-up animation
- Fixed bottom nav: Back, Start Over, Next (conditional)

**Store usage:** `previewMode`, `resetTrip`, `setPreviewMode`

---

### CitySearch — `components/CitySearch.tsx`

No props. Renders a search input with dropdown.

- Filters `capitals` (via `useCapitals` hook) by city name substring match
- Excludes already-selected destinations
- On selection: calls `addDestination(city)`, clears query

**Store usage:** `addDestination`, `destinations`

---

### CityMap — `components/CityMap.tsx`

| Prop | Type | Description |
|------|------|-------------|
| `capitals` | `Capital[]` | All available capitals to render on map |

Leaflet map centered on Europe (lat 50, lng 15, zoom 4).

- Unselected capitals: cyan `CircleMarker` (clickable → `addDestination`)
- Selected destinations: standard `Marker`
- `Polyline` connecting selected destinations (2+ only)
- "Clear All" button overlay (bottom-left)
- Click-on-map: finds nearest unselected capital, adds it

**Internal sub-components:**
- `MapUpdater`: fits map bounds to destinations on change
- `ClickToSelect`: handles map click → nearest capital logic

**Store usage:** `destinations`, `addDestination`, `clearDestinations`

---

### SelectedCitiesList — `components/SelectedCitiesList.tsx`

No props. Renders the selected destinations as a draggable list.

- Empty state: dashed border placeholder
- Each row: drag handle, numbered circle, city + country, remove (X) button
- Native HTML5 drag-and-drop for reorder (no library)
- On reorder: calls `reorderDestinations()` (resets flights in store)

**Store usage:** `destinations`, `removeDestination`, `reorderDestinations`

---

### HotelCard — `components/HotelCard.tsx`

| Prop | Type | Description |
|------|------|-------------|
| `hotel` | `Hotel` | Hotel data |
| `selected` | `boolean` | Whether this hotel is currently selected |
| `cityId` | `number` | Which city this hotel belongs to |

Renders a clickable card with hotel image, name, price/night, rating (/5). Selected state: primary border + ring. `hover:scale-[1.02]` transition. Calls `selectHotel(cityId, hotel)` on click.

---

### AttractionCard — `components/AttractionCard.tsx`

| Prop | Type | Description |
|------|------|-------------|
| `attraction` | `Attraction` | Attraction data |
| `selected` | `boolean` | Whether this attraction is currently selected |
| `cityId` | `number` | Which city this attraction belongs to |

Renders a clickable card with attraction image, name, address, category, price ("Free" if 0), and mock travel time (`10 + ((id * 7) % 16)` minutes). Same selection styling as HotelCard. Calls `selectAttraction(cityId, attraction)` on click.

---

### FlightSegment — `components/FlightSegment.tsx`

| Prop | Type | Description |
|------|------|-------------|
| `segment` | `Segment` | Flight segment data (from/to + options) |
| `segmentKey` | `string` | Store key for this segment (e.g. `'segment-0'`) |

Card-based flight picker with 3-column grid of options. Used by `FlightResultsPage` (legacy). **Not used** by `SchedulePage` which has its own inline picker.

**Store usage:** `selectFlight`, `selectedFlights`

---

## Pages — `src/pages/`

### OnboardingPage — step 0

Standalone full-page modal (does NOT use StepLayout). 5-slide carousel introducing the app flow. Dot indicators, Back/Skip/Next navigation. "Let's Go" on last slide → `/destinations`. Calls `useGeolocation()` to set origin.

---

### DestinationPage — step 1

| | |
|-|-|
| **StepLayout** | step 1, next → `/suggestions` |
| **Validation** | min 1 destination |
| **Components** | `CitySearch`, `SelectedCitiesList`, `CityMap` |
| **API** | `GET /capitals` (via `useCapitals`) |

---

### SuggestionsPage — step 2

| | |
|-|-|
| **StepLayout** | step 2, no `onNext` (buttons are inside cards) |
| **API** | `POST /compute-route`, `GET /hotels`, `GET /attractions` (all parallel) |
| **Caching** | `fetchedForRef` + `destKey` pattern |

Builds 3 pre-filled route suggestions:

| Suggestion | Flights | Hotels | Attractions |
|------------|---------|--------|-------------|
| Budget | Cheapest | Cheapest | Cheapest |
| Comfort | Midday (closest to 12:00) | Highest rated | Mid-priced |
| Premium | Most expensive | Most expensive | Most expensive |

Default: 2 days/city, start date = store value or today + 7 days.

Three vertically stacked cards, each with a horizontally scrollable detail strip showing per-city hotel/attraction info and flight segments. "Choose" button calls `applySuggestion()` → `/schedule`. "Customize Manually" → `/schedule` without modifying store.

---

### SchedulePage — step 3

| | |
|-|-|
| **StepLayout** | step 3, next → `/hotels` |
| **Validation** | start date required + all durations positive integers + all flights selected |
| **Form** | `react-hook-form` + `zod` schema, `onChange` mode |
| **API** | `POST /compute-route` |

Start date input + per-destination cards with days input and expandable flight picker. Return-home segment card at bottom. Form values synced to store on change.

---

### HotelsPage — step 4

| | |
|-|-|
| **StepLayout** | step 4, next → `/attractions` |
| **Validation** | one hotel selected per destination |
| **API** | `GET /hotels?city_id={id}` per destination (parallel) |
| **Caching** | `fetchedForRef` + `destKey` pattern |

Per-destination section with Guests/Rooms/RoomType dropdowns (UI-only, not persisted) and 3-column grid of `HotelCard`s.

---

### AttractionsPage — step 5

| | |
|-|-|
| **StepLayout** | step 5, next → `/summary` |
| **Validation** | one attraction selected per destination |
| **API** | `GET /attractions?city_id={id}` per destination (parallel) |
| **Caching** | `fetchedForRef` + `destKey` pattern |

Per-destination section with 3-column grid of `AttractionCard`s.

---

### SummaryPage — step 6

| | |
|-|-|
| **StepLayout** | step 6, `hideNav=true` |
| **API** | `POST /trips` on confirm |

Two modes:
1. **Pre-confirm:** Itinerary/Flights/Hotels/Attractions summary cards with staggered fade-in. Total price box. "Preview Steps" button enters preview mode. "Fly Me A Travel" confirm button.
2. **Post-confirm:** "Trip Confirmed!" screen with total price and "Review My Trip" button.

---

### FlightResultsPage (legacy)

Card-based flight picker using `FlightSegment` component. Step 3 with next → `/hotels`. **Not in active routing** — superseded by `SchedulePage`.

---

## Data Flow Patterns

### Fetch + Cache Pattern

Used by `SuggestionsPage`, `HotelsPage`, `AttractionsPage`:

```ts
const fetchedForRef = useRef<string>('');
const destKey = useMemo(() => destinations.map(d => d.id).join(','), [destinations]);

useEffect(() => {
  if (fetchedForRef.current === destKey && data exists) return; // skip re-fetch
  // ... fetch ...
  fetchedForRef.current = destKey;
}, [destKey, destinations]);
```

Prevents redundant API calls on back-navigation when destinations haven't changed.

### Cascade Cleanup

When a destination is removed (`removeDestination`), all dependent data is cleaned up:
- `durations[cityId]` deleted
- `selectedHotels[cityId]` deleted
- `selectedAttractions[cityId]` deleted
- `selectedFlights` entirely reset (segment order depends on destination order)

Same flight reset happens on `reorderDestinations`.

### Preview Mode

Activated from SummaryPage. Allows clicking any step in StepLayout indicator to review selections. "Back to Summary" banner persists across all steps. Disabled on return to summary.
