const KEY = 'bugbound:learning:v1';

function emptyStore() {
  return { version: 1, levels: {} };
}

const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const counter = value => Number.isSafeInteger(value) && value >= 0 ? value : 0;
function normalizeActivity(value) {
  const activity = isRecord(value) ? value : {};
  return {
    checkRuns: counter(activity.checkRuns),
    passedRuns: counter(activity.passedRuns),
    failedRuns: counter(activity.failedRuns),
    hintsRevealed: [...new Set(Array.isArray(activity.hintsRevealed)
      ? activity.hintsRevealed.filter(tier => Number.isInteger(tier) && tier >= 1 && tier <= 3) : [])].sort(),
    lastPracticedAt: typeof activity.lastPracticedAt === 'string' && Number.isFinite(Date.parse(activity.lastPracticedAt))
      ? activity.lastPracticedAt : null,
  };
}

function loadStore() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY));
    if (parsed?.version !== 1 || !isRecord(parsed.levels)) return emptyStore();
    return { version: 1, levels: Object.fromEntries(Object.entries(parsed.levels).map(([id, value]) => [id, normalizeActivity(value)])) };
  } catch {
    return emptyStore();
  }
}

function updateLevel(levelId, updater) {
  try {
    const store = loadStore();
    const current = normalizeActivity(Object.hasOwn(store.levels, levelId) ? store.levels[levelId] : null);

    store.levels[levelId] = {
      ...updater(current),
      lastPracticedAt: new Date().toISOString(),
    };
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    // Learning telemetry should never interrupt the practice loop.
  }
}

export function recordCheckRun(levelId, results) {
  const passed = results.length > 0 && results.every((result) => result.pass);
  updateLevel(levelId, (current) => ({
    ...current,
    checkRuns: current.checkRuns + 1,
    passedRuns: current.passedRuns + (passed ? 1 : 0),
    failedRuns: current.failedRuns + (passed ? 0 : 1),
  }));
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
      };
    }),
  };
}
