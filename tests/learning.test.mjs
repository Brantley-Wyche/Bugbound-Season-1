import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { recordCheckRun, recordHintReveal, getLearningSnapshot, subscribeLearning, activityFor } from '../src/shell/learning.js';

let memory;
beforeEach(() => {
  memory = new Map();
  globalThis.localStorage = {
    getItem: key => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, String(value)),
    removeItem: key => memory.delete(key),
  };
});

const pass = [{ pass: true }, { pass: true }];
const fail = [{ pass: true }, { pass: false }];

test('a resolving run records when and on which run the incident was resolved', () => {
  recordCheckRun('one', fail);
  const activity = recordCheckRun('one', pass, { resolves: true });
  assert.equal(activity.checkRuns, 2);
  assert.equal(activity.resolvedRun, 2);
  assert.ok(Number.isFinite(Date.parse(activity.resolvedAt)));
});

test('later runs keep the original resolution record', () => {
  const first = recordCheckRun('one', pass, { resolves: true });
  const later = recordCheckRun('one', fail);
  const again = recordCheckRun('one', pass);
  assert.equal(later.resolvedRun, 1);
  assert.equal(again.resolvedAt, first.resolvedAt);
  assert.equal(again.resolvedRun, 1);
});

test('a failing run never records a resolution', () => {
  const activity = recordCheckRun('one', fail, { resolves: true });
  assert.equal(activity.resolvedAt, null);
  assert.equal(activity.resolvedRun, null);
});

test('malformed resolution fields are normalized', () => {
  memory.set('bugbound:learning:v1', JSON.stringify({ version: 1, levels: { one: { resolvedAt: 'soon', resolvedRun: -3 } } }));
  const activity = activityFor(getLearningSnapshot().levels, 'one');
  assert.equal(activity.resolvedAt, null);
  assert.equal(activity.resolvedRun, null);
});

test('unknown incidents read as empty activity', () => {
  const activity = activityFor(getLearningSnapshot().levels, 'missing');
  assert.equal(activity.checkRuns, 0);
  assert.deepEqual(activity.hintsRevealed, []);
});

test('the snapshot is stable until activity is recorded, and subscribers hear updates', () => {
  const before = getLearningSnapshot();
  assert.equal(getLearningSnapshot(), before);
  let heard = 0;
  const unsubscribe = subscribeLearning(() => { heard += 1; });
  recordHintReveal('one', 1);
  recordCheckRun('one', fail);
  unsubscribe();
  recordCheckRun('one', fail);
  assert.equal(heard, 2);
  assert.notEqual(getLearningSnapshot(), before);
  assert.equal(activityFor(getLearningSnapshot().levels, 'one').checkRuns, 2);
});

test('a failed telemetry write reports nothing and never throws', () => {
  localStorage.setItem = () => { throw new Error('storage blocked'); };
  let result;
  assert.doesNotThrow(() => { result = recordCheckRun('one', pass, { resolves: true }); });
  assert.equal(result, null);
});
