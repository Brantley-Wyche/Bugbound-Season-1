import test from 'node:test';
import assert from 'node:assert/strict';
import { runIsolatedCheck } from '../src/shell/exercise-frame.js';

const level = { id: 'fixture', checks: [{ name: 'Synthetic check' }] };
function frameDocument(run) {
  const frames = [];
  globalThis.document = {
    baseURI: 'http://localhost/',
    createElement: () => {
      const listeners = {};
      const frame = { style: {}, contentWindow: { __bugboundCheck: run },
        addEventListener: (type, callback) => { listeners[type] = callback; },
        setAttribute() {}, remove() { this.removed = true; }, listeners };
      frames.push(frame); return frame;
    },
    body: { appendChild: frame => queueMicrotask(() => frame.listeners.load()) },
  };
  return frames;
}
test('each check gets a new frame which is disposed after completion', async () => {
  const frames = frameDocument(async () => ({ name: 'Synthetic check', pass: true }));
  assert.equal((await runIsolatedCheck(level, 0)).pass, true);
  assert.equal((await runIsolatedCheck(level, 0)).pass, true);
  assert.equal(frames.length, 2);
  assert.ok(frames.every(frame => frame.removed));
});
test('aborting a pending check disposes its frame and rejects with AbortError', async () => {
  const frames = frameDocument(() => new Promise(() => {}));
  const controller = new AbortController();
  const result = runIsolatedCheck(level, 0, { signal: controller.signal });
  controller.abort();
  await assert.rejects(result, error => error.name === 'AbortError');
  assert.equal(frames[0].removed, true);
});
test('a check that never settles produces a bounded failure and disposes its frame', async () => {
  const frames = frameDocument(() => new Promise(() => {}));
  const result = await runIsolatedCheck(level, 0, { timeoutMs: 15 });
  assert.equal(result.pass, false);
  assert.match(result.message, /timed out/i);
  assert.equal(frames[0].removed, true);
});
