# RangMatch Maps — Master Build Prompt

Build a production-grade, original map and navigation product called **RangMatch Maps**. The product should feel as polished, fluid and information-dense as leading Chinese map applications, while using original UX, branding and legally licensed map/data providers.

## Product goals
1. Make panning, pinch zoom, rotation and pitch feel extremely smooth.
2. Make search feel instant and useful even with incomplete queries.
3. Make route planning visually clear, fast and resilient.
4. Keep the architecture provider-agnostic so map tiles, geocoding, routing, traffic and POI providers can be changed without rewriting the UI.
5. Build Android-first, with a path to iOS.
6. Never hard-code API keys or secrets.
7. Respect OpenStreetMap/provider attribution, licenses, rate limits and terms.

## Recommended technical direction
- React Native + TypeScript
- MapLibre Native for map rendering
- Zustand or equivalent small state layer
- TanStack Query for server state/cache
- React Navigation
- Type-safe API/domain models
- Feature-based folder architecture
- Native performance where camera/gesture work is latency-sensitive

## Core screens
- Map home
- Search overlay
- Search results
- Place details
- Route preview
- Active navigation
- Saved places
- Recent searches/trips
- Settings
- Map layers/theme selector
- Offline region manager

## Map UX
- Floating translucent controls with strong hierarchy
- Bottom sheets with spring animations
- Smooth camera transitions
- Dynamic POI visibility by zoom level
- Selected-place halo and animated marker
- Route line with clear active/inactive alternatives
- Dark and light cartographic themes
- Compass, locate-me and layer controls
- Gesture-safe UI zones

## Navigation features
- Driving, walking and cycling
- Multiple route alternatives
- ETA, distance and arrival time
- Rerouting architecture
- Voice instruction architecture
- Lane guidance data model
- Speed/traffic-ready data model
- Background navigation architecture

## Search
Support names, addresses, categories and natural-language intent. Examples:
- "petrol pump near me"
- "quiet cafe"
- "hospital"
- "best family restaurant"
- "show saved places"

Search should debounce, cancel stale requests, cache useful results and gracefully handle offline mode.

## Data architecture
Define interfaces for:
- Map tile/style provider
- Geocoder/search provider
- Routing provider
- Traffic provider
- Places/POI provider
- Elevation provider
- Offline tile provider

The UI must not depend directly on a specific vendor.

## Performance requirements
- Avoid unnecessary React renders.
- Keep map camera updates off the main JS render path where practical.
- Memoize expensive marker/POI components.
- Use viewport-aware data loading.
- Cancel stale network requests.
- Keep animations at native/UI-thread performance where supported.
- Do not render thousands of React markers when a vector/data layer can do the job.

## Security
- `.env` files must never be committed.
- Commit only `.env.example`.
- Validate all external responses.
- Do not log user location or API secrets.
- Make analytics opt-in/transparent where applicable.

## Quality bar
Every feature must have:
- TypeScript types
- Loading/empty/error states
- Accessibility labels
- Offline/error fallback where relevant
- Unit tests for domain logic
- Clear README documentation

## Development sequence
### Phase 1 — Foundation
Project shell, theme system, navigation, map screen, provider interfaces, environment configuration.

### Phase 2 — Search + POI
Search UI, geocoding, result ranking, place details, categories, saved places.

### Phase 3 — Routing
Route preview, alternatives, navigation state machine, rerouting, ETA.

### Phase 4 — Premium interaction
Bottom sheets, gesture polish, camera choreography, haptics, micro-animations.

### Phase 5 — Offline + resilience
Offline regions, cached search, network recovery, provider fallbacks.

### Phase 6 — Traffic + advanced navigation
Traffic overlays, incidents, lane guidance, voice navigation and background navigation.

### Phase 7 — QA + release
Performance profiling, accessibility, crash handling, Android release build, store-ready assets.

## Definition of done
Do not call a feature complete merely because a screen exists. It is complete when the happy path, loading state, error state, empty state, navigation/back behavior, accessibility, type safety and tests are handled.
