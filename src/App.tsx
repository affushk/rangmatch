import { useEffect, useRef, useState } from 'react';
import maplibregl, { type Map } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { geocoder, type Place } from './domain/providers';

const DEFAULT_CENTER: [number, number] = [72.8311, 21.1702];

const rasterStyle: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm', minzoom: 0, maxzoom: 19 }],
};

function App() {
  const mapNode = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const searchAbort = useRef<AbortController | null>(null);
  const [query, setQuery] = useState('');
  const [dark, setDark] = useState(false);
  const [locating, setLocating] = useState(false);
  const [notice, setNotice] = useState('');
  const [results, setResults] = useState<Place[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<Place | null>(null);

  useEffect(() => {
    if (!mapNode.current) return;
    const map = new maplibregl.Map({
      container: mapNode.current,
      style: rasterStyle,
      center: DEFAULT_CENTER,
      zoom: 11.4,
      pitch: 0,
      attributionControl: false,
      maxZoom: 20,
      minZoom: 3,
      cooperativeGestures: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showZoom: false, showCompass: false }), 'bottom-right');
    mapRef.current = map;

    return () => {
      searchAbort.current?.abort();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2200);
  };

  const runSearch = async (value = query) => {
    const text = value.trim();
    if (!text) return;
    searchAbort.current?.abort();
    const controller = new AbortController();
    searchAbort.current = controller;
    setSearching(true);
    setSelected(null);

    try {
      const places = await geocoder.search(text, controller.signal);
      setResults(places);
      if (!places.length) showNotice('No places found');
    } catch (error) {
      if ((error as DOMException).name !== 'AbortError') showNotice('Search is unavailable right now');
    } finally {
      if (!controller.signal.aborted) setSearching(false);
    }
  };

  const selectPlace = (place: Place) => {
    setSelected(place);
    setResults([]);
    mapRef.current?.flyTo({
      center: [place.coordinate.longitude, place.coordinate.latitude],
      zoom: 16,
      speed: 1.25,
      curve: 1.35,
      essential: true,
    });
  };

  const locate = () => {
    if (!navigator.geolocation) {
      showNotice('Location is not supported by this browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        mapRef.current?.flyTo({
          center: [coords.longitude, coords.latitude],
          zoom: 15.5,
          speed: 1.5,
          curve: 1.4,
          essential: true,
        });
        setLocating(false);
        showNotice('Centered on your location');
      },
      () => {
        setLocating(false);
        showNotice('Location permission was not available.');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 },
    );
  };

  const submitSearch = (value = query) => {
    const text = value.trim();
    if (!text) return;
    void runSearch(text);
  };

  return (
    <main className={dark ? 'app dark' : 'app'}>
      <div ref={mapNode} className="map" />
      <div className="map-wash" aria-hidden="true" />

      <header className="topbar">
        <div className="brand-pill" aria-label="RangMatch Maps">
          <span className="brand-mark">R</span>
          <span>RangMatch</span>
        </div>
        <button className="profile-button" aria-label="Profile">◎</button>
      </header>

      <section className="search-stack" aria-label="Map search">
        <form className="search-card" onSubmit={(event) => { event.preventDefault(); submitSearch(); }}>
          <span className="search-icon">⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search places, streets, categories…"
            aria-label="Search places"
          />
          {query && <button type="button" className="clear" onClick={() => { setQuery(''); setResults([]); }} aria-label="Clear search">×</button>}
          <button className="search-action" type="submit" aria-label="Search">↵</button>
        </form>

        <div className="quick-row">
          {['☕ Cafés', '⛽ Petrol', '🍽 Food', '🏥 Hospitals'].map((item) => (
            <button key={item} className="quick-chip" onClick={() => { const text = item.slice(2); setQuery(text); submitSearch(text); }}>{item}</button>
          ))}
        </div>

        {(searching || results.length > 0) && (
          <div className="results-card" aria-live="polite">
            {searching && <div className="result-state">Searching places…</div>}
            {!searching && results.map((place) => (
              <button key={place.id} className="result-item" onClick={() => selectPlace(place)}>
                <span className="result-icon">⌖</span>
                <span className="result-copy">
                  <strong>{place.name}</strong>
                  <small>{place.address}</small>
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      <div className="map-actions">
        <button className="round-button" onClick={() => setDark((value) => !value)} aria-label="Toggle map theme">{dark ? '☀' : '☾'}</button>
        <button className="round-button" onClick={() => showNotice('Map layers coming next')} aria-label="Map layers">◈</button>
        <button className={locating ? 'round-button locating' : 'round-button'} onClick={locate} aria-label="Find my location">⌖</button>
      </div>

      {selected ? (
        <section className="place-card">
          <button className="place-close" onClick={() => setSelected(null)} aria-label="Close place">×</button>
          <span className="eyebrow">PLACE</span>
          <h2>{selected.name}</h2>
          <p>{selected.address}</p>
          <div className="place-actions">
            <button className="primary-button" onClick={() => showNotice('Routing foundation is ready for the next milestone')}>Directions</button>
            <button className="secondary-button" onClick={() => showNotice('Saved places are coming next')}>Save</button>
          </div>
        </section>
      ) : (
        <section className="bottom-card">
          <div className="sheet-handle" />
          <div className="sheet-heading">
            <div>
              <span className="eyebrow">EXPLORE</span>
              <h1>Where do you want to go?</h1>
            </div>
            <button className="ghost-button" onClick={() => showNotice('Saved places will appear here')}>Saved</button>
          </div>
          <div className="mode-row">
            <button className="mode active">⌁ Explore</button>
            <button className="mode" onClick={() => showNotice('Directions mode ready for routing provider')}>↗ Directions</button>
            <button className="mode" onClick={() => showNotice('Offline regions are planned for the next milestone')}>⇩ Offline</button>
          </div>
        </section>
      )}

      {notice && <div className="toast" role="status">{notice}</div>}
    </main>
  );
}

export default App;
