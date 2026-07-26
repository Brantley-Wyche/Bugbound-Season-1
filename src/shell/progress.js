const KEY = 'bugbound:progress:v1';

export function sanitizeCompleted(values, validIds = []) {
  const saved = Array.isArray(values) ? values : [];
  if (!validIds.length) return new Set(saved);

  const valid = new Set(validIds);
  return new Set(saved.filter((id) => valid.has(id)));
}

export function loadCompleted(validIds = []) {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    return sanitizeCompleted(raw, validIds);
  } catch {
    return new Set();
  }
}

export function saveCompleted(completedSet) {
  localStorage.setItem(KEY, JSON.stringify([...completedSet]));
}

export function clearProgress() {
  localStorage.removeItem(KEY);
}
