const PLANETS = {
  kepler: {
    name: 'Kepler-442b',
    blurb: 'A super-Earth 1,200 light-years away. The archive server that hosts it is… not fast.',
    delay: 320,
  },
  vega: {
    name: 'Vega Prime',
    blurb: 'Cached on the edge network — loads almost instantly.',
    delay: 40,
  },
  orion: {
    name: 'Orion IV',
    blurb: 'Also cached. Snappy little planet.',
    delay: 40,
  },
};

export const PLANET_IDS = Object.keys(PLANETS);

// Simulated network request with realistic, uneven latency — this file is bug-free.
export function fetchPlanet(id) {
  const planet = PLANETS[id];
  return new Promise((resolve) => setTimeout(() => resolve(planet), planet.delay));
}
