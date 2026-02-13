# Fly&Travel — Build Summary

## Status: All 14 build steps + 9 todo-list features complete

---

## Session 1 — Initial Build (14 steps)

| # | Step | Status |
|---|------|--------|
| 1 | Docker + Postgres | DONE |
| 2 | Backend Models (Capital, Hotel, Attraction, Trip) | DONE |
| 3 | Seed 45 European capitals + 135 hotels + 135 attractions | DONE |
| 4 | API Routes + Mock Flight Engine | DONE |
| 5 | Frontend Scaffold (Vite + React + TS + Tailwind v4 + shadcn) | DONE |
| 6 | Zustand Store with cascade cleanup | DONE |
| 7 | Destination Page (search + map + list) | DONE |
| 8 | Schedule Page (date + days per city) | DONE |
| 9 | Flight Results Page | DONE (later merged into Schedule) |
| 10 | Hotels Page | DONE |
| 11 | Attractions Page | DONE |
| 12 | Summary Page | DONE |
| 13 | Tests (11 Vitest + 3 Playwright + 4 Pytest) | DONE |
| 14 | UI Polish (design system, hover, transitions) | DONE |

## Session 1 — Hot Fixes

| Fix | Details |
|-----|---------|
| Map click-to-add | CircleMarker dots + ClickToSelect for nearest capital |
| Persist on refresh | `zustand/middleware persist` → localStorage |
| Onboarding step guide | 5-step staggered fade-in card showcase |
| Preview mode | Clickable step indicator, banner, "Preview Steps" from Summary |
| Map clear button | "Clear All" bottom-left corner of map |
| Summary scroll + fade | `overflow-y-auto` + staggered `fadeUp` per card |

## Session 2 — Todo List Features

| # | Feature | Status |
|---|---------|--------|
| 1 | Review recent changes | DONE |
| 2 | Draggable destination reorder (drag-and-drop swap) | DONE |
| 3 | Onboarding showcase updated for merged flow | DONE |
| 4 | Allow 1-city trips (was 2 minimum) | DONE |
| 5 | Schedule card alignment fix (centered days input) | DONE |
| 6 | Flights merged into Schedule (inline expandable picker with debounce) | DONE |
| 7 | Hotel + attraction cards with photos (picsum.photos seeded images) | DONE |
| 8 | Hotel page: guest count, room count, room type (Queen/King/Twin/Suite) | DONE |
| 9 | Attraction cards: street address + estimated travel time from hotel | DONE |

## Architecture After Changes

**Flow (6 steps, was 7):**
`Onboarding → Destinations → Schedule & Flights → Hotels → Attractions → Summary`

**Key decisions:**
- Flights merged into Schedule to reduce friction — expandable inline panel per destination
- Photos via `picsum.photos` (seeded, deterministic per hotel/attraction)
- Drag-to-reorder uses native HTML drag (no extra lib)
- Room options are local UI state (not persisted to backend)
- Travel time estimate is computed mock (~10-25 min, deterministic per attraction ID)

## What's Working

- `docker-compose up -d` → postgres + backend running
- `npx vite --host` → frontend on localhost:5173
- `tsc --noEmit` → 0 errors
- `npm test` → 11/11 Vitest pass
- Full user flow end-to-end with all features

## Remaining / Not Done

| Item | Note |
|------|------|
| Backend pytest | Run via `docker-compose exec backend pytest` (no local Python) |
| Playwright E2E | Specs written, need `npx playwright install` to run |
| Reverse geocoding | Origin falls back to "Your Location" or "Tel Aviv" |
| Real hotel/attraction photos | Using picsum.photos placeholder — swap for Unsplash API if needed |
| Room pricing multiplier | Guest/room count is UI-only, doesn't affect total price yet |

## How to Run

```bash
docker-compose up -d                          # Start postgres + backend
cd frontend && npx vite --host                # Start frontend
cd frontend && npm test                       # Run unit tests
docker-compose exec backend pytest            # Run backend tests
cd frontend && npx playwright install && npx playwright test  # E2E
```
