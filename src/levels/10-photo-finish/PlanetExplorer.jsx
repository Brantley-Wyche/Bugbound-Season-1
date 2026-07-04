import { useEffect, useState } from 'react';
import { PLANET_IDS, fetchPlanet } from './fakeApi.js';

export default function PlanetExplorer() {
  const [selectedId, setSelectedId] = useState('kepler');
  const [planet, setPlanet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchPlanet(selectedId).then((data) => {
      setPlanet(data);
      setLoading(false);
    });
  }, [selectedId]);

  return (
    <div className="lv-card">
      <h4 className="lv-heading">🪐 Planet Explorer</h4>
      <div className="lv-row">
        {PLANET_IDS.map((id) => (
          <button
            key={id}
            className={`lv-btn ${id === selectedId ? 'active' : ''}`}
            data-testid={`planet-${id}`}
            onClick={() => setSelectedId(id)}
          >
            {id}
          </button>
        ))}
      </div>
      {loading && <p className="lv-muted" data-testid="loading">Scanning deep space…</p>}
      {planet && (
        <div>
          <p className="lv-heading" data-testid="planet-name">{planet.name}</p>
          <p className="lv-muted">{planet.blurb}</p>
        </div>
      )}
    </div>
  );
}
