export function exerciseURL(levelId, mode) {
  const url = new URL(`${import.meta.env?.BASE_URL ?? '/'}exercise.html`, document.baseURI);
  url.searchParams.set('level', levelId);
  url.searchParams.set('mode', mode);
  return url.href;
}

export function runIsolatedCheck(level, index, { signal, timeoutMs = 15000 } = {}) {
  if (signal?.aborted) return Promise.reject(new DOMException('Check cancelled', 'AbortError'));
  return new Promise((resolve, reject) => {
    const frame = document.createElement('iframe');
    frame.title = `Checking ${level.checks[index].name}`;
    frame.tabIndex = -1;
    frame.setAttribute('aria-hidden', 'true');
    frame.style.cssText = 'position:fixed;left:-10000px;top:0;width:900px;height:600px;border:0';
    let finished = false;
    const settle = (result, error) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      signal?.removeEventListener('abort', cancel);
      frame.remove();
      if (error) reject(error); else resolve(result);
    };
    const fail = message => settle({ name: level.checks[index].name, pass: false, message });
    const cancel = () => settle(null, new DOMException('Check cancelled', 'AbortError'));
    const timer = setTimeout(() => fail('This check timed out. Check your source for unfinished asynchronous work, then re-run.'), timeoutMs);
    signal?.addEventListener('abort', cancel, { once: true });
    frame.addEventListener('load', async () => {
      if (finished) return;
      try {
        const run = frame.contentWindow?.__bugboundCheck;
        if (typeof run !== 'function') throw new Error('The exercise could not start. Check the terminal for compilation errors, then re-run.');
        settle(await run(index));
      } catch (error) {
        fail(String(error?.message || error));
      }
    }, { once: true });
    frame.addEventListener('error', () => fail('The exercise could not load. Check your dev server, then re-run.'), { once: true });
    frame.src = exerciseURL(level.id, 'check');
    document.body.appendChild(frame);
  });
}
