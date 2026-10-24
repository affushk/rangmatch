import { useEffect, useRef, useState } from 'react';
import maplibregl, { type Map } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

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
  const [query, setQuery] = useState('');
  const [dark, setDark] = useState(false);
  const [locating, setLocating] = useState(false);
  const [notice, setNotice] = useState('');

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
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const locate = () => {
    if (!navigator.geolocation) {
      setNotice('Location is not supported by this browser.');
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
        setNotice('Centered on your location');
        window.setTimeout(() => setNotice(''), 1800);
      },
      () => {
        setLocating(false);
        setNotice('Location permission was not available.');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 },
    );
  };

  const submitSearch = (value = query) => {
    const text = value.trim();
    if (!text) return;
    setNotice(`Search ready: ${text}`);
    window.setTimeout(() => setNotice(''), 2200);
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
          {query && <button type="button" className="clear" onClick={() => setQuery('')} aria-label="Clear search">×</button>}
          <button className="search-action" type="submit" aria-label="Search">↵</button>
        </form>

        <div className="quick-row">
          {['☕ Cafés', '⛽ Petrol', '🍽 Food', '🏥 Hospitals'].map((item) => (
            <button key={item} className="quick-chip" onClick={() => submitSearch(item.slice(2))}>{item}</button>
          ))}
        </div>
      </section>

      <div className="map-actions">
        <button className="round-button" onClick={() => setDark((value) => !value)} aria-label="Toggle map theme">{dark ? '☀' : '☾'}</button>
        <button className="round-button" onClick={() => setNotice('Map layers coming next')} aria-label="Map layers">◈</button>
        <button className={locating ? 'round-button locating' : 'round-button'} onClick={locate} aria-label="Find my location">⌖</button>
      </div>

      <section className="bottom-card">
        <div className="sheet-handle" />
        <div className="sheet-heading">
          <div>
            <span className="eyebrow">EXPLORE</span>
            <h1>Where do you want to go?</h1>
          </div>
          <button className="ghost-button" onClick={() => setNotice('Saved places will appear here')}>Saved</button>
        </div>
        <div className="mode-row">
          <button className="mode active">⌁ Explore</button>
          <button className="mode" onClick={() => setNotice('Directions mode ready for routing provider')}>↗ Directions</button>
          <button className="mode" onClick={() => setNotice('Offline regions are planned for the next milestone')}>⇩ Offline</button>
        </div>
      </section>

      {notice && <div className="toast" role="status">{notice}</div>}
    </main>
  );
}

export default App;
