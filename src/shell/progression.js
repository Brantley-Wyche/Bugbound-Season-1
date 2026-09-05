// Pure cartridge rules: callers supply the registry without loading the app.
export function isUnlocked(level, completed, levels) {
  if (level.number === 1) return true;
  const previous = levels.find((item) => item.number === level.number - 1);
  return previous ? completed.has(previous.id) : false;
}
