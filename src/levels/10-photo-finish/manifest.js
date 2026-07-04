import Component from './PlanetExplorer.jsx';

export default {
  id: '10-photo-finish',
  number: 10,
  title: 'Photo Finish',
  concept: 'Async & Race Conditions',
  severity: 'Critical',
  Component,
  files: ['src/levels/10-photo-finish/PlanetExplorer.jsx'],
  symptom:
    'While the first (slow) planet is still loading, click a different planet. The right one appears for a moment… then the panel flips back to the planet you DIDN’T ask for. The wrong response wins the race.',
  lesson: [
    'Network responses don’t arrive in the order you sent them. Ask for planet A (slow server), then planet B (fast cache): B lands first and renders, then A lands late and overwrites it. The UI now shows A while the selection says B — a race condition.',
    'The effect that started a request can’t un-send it, but it CAN refuse the answer. The standard pattern uses cleanup: set a flag like `let stale = false` inside the effect, check it in the `.then`, and flip it in the cleanup `return () => { stale = true; }`. When the selection changes, React runs the old effect’s cleanup first — marking its in-flight response as stale before the new request even starts.',
    'With real `fetch` you’d reach for `AbortController` to cancel the request outright, but the stale-flag pattern is the concept underneath: every async result must prove it’s still relevant before it touches state.',
  ],
  checks: [
    {
      name: 'The initial planet loads',
      run: async (h) => {
        await h.pause(450);
        const name = h.text('[data-testid="planet-name"]');
        h.ok(name === 'Kepler-442b', `Expected Kepler-442b on load, got "${name}".`);
      },
    },
    {
      name: 'Switching during a slow load shows the planet you picked last',
      run: async (h) => {
        await h.click('[data-testid="planet-vega"]');
        await h.pause(500);
        const name = h.text('[data-testid="planet-name"]');
        h.ok(
          name === 'Vega Prime',
          `Picked Vega while Kepler was loading, but the late response overwrote it — panel shows "${name}".`,
        );
      },
    },
  ],
};
