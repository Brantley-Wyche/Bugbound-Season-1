// A render crash fails every check that follows it with the same cause. The
// log shows that cause once; later rows point back to it instead of repeating it.
const CRASH = 'crashed while rendering: ';

const failureCause = (message = '') => {
  const at = message.indexOf(CRASH);
  return at === -1 ? message : message.slice(at + CRASH.length);
};

export function markRepeatedFailures(results) {
  const seen = new Set();
  return results.map((result) => {
    if (result.pending || result.pass) return result;
    const cause = failureCause(result.message);
    const repeated = seen.has(cause);
    seen.add(cause);
    return repeated ? { ...result, repeatsFailure: true } : result;
  });
}
