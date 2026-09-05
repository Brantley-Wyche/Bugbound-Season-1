import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import * as progress from '../src/shell/progress.js';
import { recordCheckRun, recordHintReveal, createLearningProfile } from '../src/shell/learning.js';

const ids = ['one', 'two', 'three'];
let memory;
beforeEach(() => {
  memory = new Map();
  globalThis.localStorage = {
    getItem: key => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, String(value)),
    removeItem: key => memory.delete(key),
  };
});
const snapshot = () => progress.loadProgress?.(ids) ?? { completed: progress.loadCompleted(ids), generation: 'initial' };
const save = (values, generation = snapshot().generation) => progress.saveCompleted(new Set(values), { generation, validIds: ids });

test('stale tabs add completion without deleting another tab achievements', () => {
  const first = snapshot(), second = snapshot();
  save(['one', 'two'], first.generation);
  save(['one', 'three'], second.generation);
  assert.deepEqual([...progress.loadCompleted(ids)].sort(), [...ids].sort());
});

test('reset rejects completion from a run started before reset', () => {
  const before = snapshot();
  save(['one'], before.generation);
  progress.clearProgress(ids);
  save(['one', 'two'], before.generation);
  assert.equal(progress.loadCompleted(ids).size, 0);
});

test('legacy completion is readable but cannot reappear after reset', () => {
  memory.set('bugbound:progress:v1', JSON.stringify(['one', 'obsolete']));
  assert.deepEqual([...progress.loadCompleted(ids)], ['one']);
  progress.clearProgress(ids);
  assert.equal(progress.loadCompleted(ids).size, 0);
  save(['two']);
  assert.deepEqual([...progress.loadCompleted(ids)], ['two']);
});

test('a reset during a completion write wins', () => {
  const before = snapshot();
  const original = localStorage.setItem;
  let reset = false;
  localStorage.setItem = (key, value) => {
    original(key, value);
    if (!reset) { reset = true; progress.clearProgress(ids); }
  };
  save(['one', 'two'], before.generation);
  assert.equal(progress.loadCompleted(ids).size, 0);
});

test('failed writes return an error without pretending completion was saved', () => {
  localStorage.setItem = () => { throw new Error('storage blocked'); };
  let result;
  assert.doesNotThrow(() => { result = save(['one']); });
  assert.equal(result.status, 'error');
  assert.equal(progress.loadCompleted(ids).size, 0);
});

test('failed reset retains saved completion and reports failure', () => {
  save(['one']);
  localStorage.setItem = localStorage.removeItem = () => { throw new Error('storage blocked'); };
  let result;
  assert.doesNotThrow(() => { result = progress.clearProgress(ids); });
  assert.equal(result.status, 'error');
  assert.deepEqual([...progress.loadCompleted(ids)], ['one']);
});

test('a committed reset succeeds even when subsequent storage reads fail', () => {
  save(['one']);
  localStorage.getItem = () => { throw new Error('reads blocked'); };
  const result = progress.clearProgress(ids);
  assert.equal(result.status, 'saved');
  assert.equal(result.progress.completed.size, 0);
  assert.equal(result.progress.savedCompleted.size, 0);
  assert.equal(result.progress.generation, memory.get('bugbound:progress:v2:generation'));
});

test('array-shaped telemetry is repaired before activity is recorded', () => {
  memory.set('bugbound:learning:v1', JSON.stringify({ version: 1, levels: [] }));
  recordCheckRun('one', [{ pass: true }]);
  const profile = createLearningProfile([{ id: 'one' }], new Set());
  assert.equal(profile.levels[0].checkRuns, 1);
});

test('invalid counters and hint tiers are normalized', () => {
  memory.set('bugbound:learning:v1', JSON.stringify({ version: 1, levels: { one: {
    checkRuns: '9', passedRuns: -2, failedRuns: null, hintsRevealed: [1, 1, 0, 9, '2'], lastPracticedAt: 7,
  } } }));
  recordCheckRun('one', [{ pass: false }]);
  recordHintReveal('one', 2);
  const profile = createLearningProfile([{ id: 'one' }], new Set());
  assert.equal(profile.levels[0].checkRuns, 1);
  assert.equal(profile.levels[0].failedRuns, 1);
  assert.deepEqual(profile.levels[0].hintsRevealed, [1, 2]);
});
