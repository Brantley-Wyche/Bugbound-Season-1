import test from 'node:test';
import assert from 'node:assert/strict';
import { markRepeatedFailures } from '../src/shell/check-results.js';

const crash = 'The `style` prop expects an object.';

test('later checks blocked by the same crash are marked as repeats', () => {
  const marked = markRepeatedFailures([
    { name: 'a', pass: false, message: `The component crashed while rendering: ${crash}` },
    { name: 'b', pass: false, message: `Could not find [data-testid="x"] — the component crashed while rendering: ${crash}` },
    { name: 'c', pass: false, message: `Could not find [data-testid="y"] — the component crashed while rendering: ${crash}` },
  ]);
  assert.deepEqual(marked.map((result) => Boolean(result.repeatsFailure)), [false, true, true]);
});

test('distinct failures, passes, and pending rows are left alone', () => {
  const results = [
    { name: 'a', pass: true },
    { name: 'b', pass: false, message: 'Expected one thing.' },
    { name: 'c', pass: false, message: 'Expected another thing.' },
    { name: 'd', pending: true },
  ];
  assert.deepEqual(markRepeatedFailures(results), results);
});

test('identical non-crash messages also collapse after the first', () => {
  const marked = markRepeatedFailures([
    { name: 'a', pass: false, message: 'This check timed out.' },
    { name: 'b', pass: false, message: 'This check timed out.' },
  ]);
  assert.deepEqual(marked.map((result) => Boolean(result.repeatsFailure)), [false, true]);
});

test('different crashes are each shown in full', () => {
  const marked = markRepeatedFailures([
    { name: 'a', pass: false, message: 'The component crashed while rendering: first' },
    { name: 'b', pass: false, message: 'Could not find x — the component crashed while rendering: second' },
  ]);
  assert.deepEqual(marked.map((result) => Boolean(result.repeatsFailure)), [false, false]);
});
