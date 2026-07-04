const KEY = 'bugbound:progress:v1';

export function loadCompleted() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    return new Set(Array.isArray(raw) ? raw : []);
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
