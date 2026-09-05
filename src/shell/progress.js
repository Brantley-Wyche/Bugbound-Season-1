const KEY = 'bugbound:progress:v1';
const PREFIX = 'bugbound:progress:v2:';
const GENERATION = `${PREFIX}generation`;
const STORAGE_ERROR = 'Progress could not be saved. You can keep practicing in this tab, then retry saving before you close it.';

export function sanitizeCompleted(values, validIds = []) {
  const saved = Array.isArray(values) ? values : [];
  if (!validIds.length) return new Set(saved);

  const valid = new Set(validIds);
  return new Set(saved.filter((id) => valid.has(id)));
}

export function loadCompleted(validIds = []) {
  return loadProgress(validIds).completed;
}

function readProgress(validIds) {
  const generation = localStorage.getItem(GENERATION) || 'initial';
  let legacy = [];
  if (generation === 'initial') {
    try { legacy = JSON.parse(localStorage.getItem(KEY)); } catch (error) {
      if (!(error instanceof SyntaxError)) throw error;
    }
  }
  const completed = sanitizeCompleted(legacy, validIds);
  for (const id of validIds) {
    if (localStorage.getItem(`${PREFIX}${generation}:${id}`) === '1') completed.add(id);
  }
  return { completed, savedCompleted: new Set(completed), generation, error: null };
}

export function loadProgress(validIds = []) {
  try {
    return readProgress(validIds);
  } catch {
    return { completed: new Set(), savedCompleted: new Set(), generation: 'initial', error: STORAGE_ERROR };
  }
}

// Additive keys avoid read/modify/write races between tabs. A reset switches
// generations; an old run can only write obsolete keys, never undo the reset.
export function saveCompleted(completedSet, { generation, validIds = [] } = {}) {
  try {
    const current = readProgress(validIds);
    if (generation !== current.generation) return { status: 'stale', progress: current };
    for (const id of sanitizeCompleted([...completedSet], validIds)) {
      localStorage.setItem(`${PREFIX}${generation}:${id}`, '1');
    }
    const next = readProgress(validIds);
    return { status: next.generation === generation ? 'saved' : 'stale', progress: next };
  } catch {
    return { status: 'error', error: STORAGE_ERROR };
  }
}

export function clearProgress() {
  try {
    const generation = crypto.randomUUID();
    localStorage.setItem(GENERATION, generation);
    return { status: 'saved', progress: { completed: new Set(), savedCompleted: new Set(), generation, error: null } };
  } catch {
    return { status: 'error', error: 'Progress could not be reset. Your current progress is still shown; retry when browser storage is available.' };
  }
}

export function isProgressStorageKey(key) {
  return key === null || key === KEY || key.startsWith(PREFIX);
}
