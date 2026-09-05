import test from 'node:test';
import assert from 'node:assert/strict';
import { isUnlocked } from '../src/shell/progression.js';

const levels = [{ id: 'first', number: 1 }, { id: 'second', number: 2 }, { id: 'third', number: 3 }];

test('the first lesson is available with no saved completion', () => {
  assert.equal(isUnlocked(levels[0], new Set(), levels), true);
});

test('a lesson unlocks when its immediate predecessor is complete', () => {
  assert.equal(isUnlocked(levels[1], new Set(['first']), levels), true);
  assert.equal(isUnlocked(levels[2], new Set(['second']), levels), true);
});

test('unrelated or obsolete completion cannot unlock a lesson', () => {
  assert.equal(isUnlocked(levels[2], new Set(['first', 'obsolete']), levels), false);
  assert.equal(isUnlocked(levels[1], new Set(), levels), false);
});

test('a missing predecessor keeps a later lesson locked', () => {
  assert.equal(isUnlocked({ id: 'fourth', number: 4 }, new Set(['second']), levels.slice(0, 2)), false);
});
