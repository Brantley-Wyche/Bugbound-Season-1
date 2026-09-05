import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeCompleted } from '../src/shell/progress.js';

test('completed progress keeps only levels in the active cartridge', () => {
  const completed = sanitizeCompleted(
    ['01-broken-badge', '16-generated-level', 'deleted-level'],
    ['01-broken-badge', '16-generated-level'],
  );

  assert.deepEqual([...completed], ['01-broken-badge', '16-generated-level']);
});

test('completed progress remains compatible when no cartridge is supplied', () => {
  const completed = sanitizeCompleted(['01-broken-badge'], []);
  assert.deepEqual([...completed], ['01-broken-badge']);
});
