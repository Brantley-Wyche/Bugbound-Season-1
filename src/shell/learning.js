const KEY = 'bugbound:learning:v1';

export const HINT_TIERS = ['Gentle nudge', 'Closer look', 'Basically the answer'];

function emptyStore() {
  return { version: 1, levels: {} };
}

const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const counter = value => Number.isSafeInteger(value) && value >= 0 ? value : 0;
const timestamp = value => typeof value === 'string' && Number.isFinite(Date.parse(value)) ? value : null;
function normalizeActivity(value) {
  const activity = isRecord(value) ? value : {};
  return {
    checkRuns: counter(activity.checkRuns),
    passedRuns: counter(activity.passedRuns),
    failedRuns: counter(activity.failedRuns),
    hintsRevealed: [...new Set(Array.isArray(activity.hintsRevealed)
      ? activity.hintsRevealed.filter(tier => Number.isInteger(tier) && tier >= 1 && tier <= 3) : [])].sort(),
    lastPracticedAt: timestamp(activity.lastPracticedAt),
    resolvedAt: timestamp(activity.resolvedAt),
    resolvedRun: Number.isSafeInteger(activity.resolvedRun) && activity.resolvedRun > 0 ? activity.resolvedRun : null,
  };
}

export const activityFor = (levels, levelId) => normalizeActivity(Object.hasOwn(levels, levelId) ? levels[levelId] : null);

function loadStore() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY));
    if (parsed?.version !== 1 || !isRecord(parsed.levels)) return emptyStore();
    return { version: 1, levels: Object.fromEntries(Object.entries(parsed.levels).map(([id, value]) => [id, normalizeActivity(value)])) };
  } catch {
    return emptyStore();
  }
}

// Components read the store through useSyncExternalStore: the snapshot stays
// the same object until activity is recorded here or in another tab.
let snapshot = null;
const listeners = new Set();
const notify = () => {
  snapshot = null;
  listeners.forEach((listener) => listener());
};
const onStorage = (event) => { if (event.key === KEY || event.key === null) notify(); };

export function getLearningSnapshot() {
  snapshot ??= loadStore();
  return snapshot;
}

export function subscribeLearning(listener) {
  if (!listeners.size && typeof window !== 'undefined') window.addEventListener('storage', onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (!listeners.size && typeof window !== 'undefined') window.removeEventListener('storage', onStorage);
  };
}

function updateLevel(levelId, updater) {
  try {
    const store = loadStore();
    const next = {
      ...updater(activityFor(store.levels, levelId)),
      lastPracticedAt: new Date().toISOString(),
    };
    store.levels[levelId] = next;
    localStorage.setItem(KEY, JSON.stringify(store));
    notify();
    return next;
  } catch {
    // Learning telemetry should never interrupt the practice loop.
    return null;
  }
}

/** Returns the updated activity, or null when telemetry could not be saved.
 *  `resolves` marks the run that first completes the incident. */
export function recordCheckRun(levelId, results, { resolves = false } = {}) {
  const passed = results.length > 0 && results.every((result) => result.pass);
  return updateLevel(levelId, (current) => {
    const checkRuns = current.checkRuns + 1;
    const resolution = passed && resolves ? { resolvedAt: new Date().toISOString(), resolvedRun: checkRuns } : {};
    return {
      ...current,
      checkRuns,
      passedRuns: current.passedRuns + (passed ? 1 : 0),
      failedRuns: current.failedRuns + (passed ? 0 : 1),
      ...resolution,
    };
  });
}

export function recordHintReveal(levelId, tier) {
  if (!Number.isInteger(tier) || tier < 1 || tier > 3) return;
  updateLevel(levelId, (current) => ({
    ...current,
    hintsRevealed: [...new Set([...current.hintsRevealed, tier])].sort(),
  }));
}

export function createLearningProfile(levels, completed) {
  const telemetry = loadStore();
  return {
    format: 'bugbound-learning-profile',
    version: 1,
    exportedAt: new Date().toISOString(),
    summary: {
      completed: levels.filter((level) => completed.has(level.id)).length,
      available: levels.length,
    },
    levels: levels.map((level) => {
      const activity = telemetry.levels[level.id] || {};
      return {
        id: level.id,
        number: level.number,
        title: level.title,
        concept: level.concept,
        completed: completed.has(level.id),
        checkRuns: activity.checkRuns || 0,
        failedRuns: activity.failedRuns || 0,
        hintsRevealed: activity.hintsRevealed || [],
        lastPracticedAt: activity.lastPracticedAt || null,
        resolvedAt: activity.resolvedAt || null,
      };
    }),
  };
}
