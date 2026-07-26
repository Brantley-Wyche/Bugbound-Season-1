const KEY = 'bugbound:learning:v1';

function emptyStore() {
  return { version: 1, levels: {} };
}

function loadStore() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY));
    return parsed?.version === 1 && parsed.levels ? parsed : emptyStore();
  } catch {
    return emptyStore();
  }
}

function updateLevel(levelId, updater) {
  try {
    const store = loadStore();
    const current = store.levels[levelId] || {
      checkRuns: 0,
      passedRuns: 0,
      failedRuns: 0,
      hintsRevealed: [],
    };

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
