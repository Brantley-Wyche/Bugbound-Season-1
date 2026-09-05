import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { levels } = await server.ssrLoadModule('/src/levels/index.js');
  const hints = JSON.parse(readFileSync('src/levels/hints.json', 'utf8'));
  assert.equal(new Set(levels.map(level => level.id)).size, levels.length, 'Level IDs must be unique');
  assert.deepEqual(levels.map(level => level.number), Array.from({ length: levels.length }, (_, index) => index + 1), 'Level numbers must be consecutive');
  for (const level of levels) {
    for (const field of ['id', 'title', 'concept', 'severity', 'symptom']) assert.ok(typeof level[field] === 'string' && level[field].length, `Missing ${field}`);
    assert.equal(typeof level.Component, 'function', `Missing component for ${level.id}`);
    assert.ok(level.files.length && level.files.every(existsSync), `Invalid file reference in ${level.id}`);
    assert.ok(level.lesson.length && level.lesson.every(text => typeof text === 'string'), `Invalid lesson in ${level.id}`);
    assert.ok(level.checks.length && level.checks.every(check => check.name && typeof check.run === 'function'), `Invalid checks in ${level.id}`);
    assert.equal(new Set(level.checks.map(check => check.name)).size, level.checks.length, `Duplicate check names in ${level.id}`);
    assert.equal(hints[level.id]?.length, 3, `Expected three hints for ${level.id}`);
    assert.ok(hints[level.id].every(text => typeof text === 'string' && /^[A-Za-z0-9+/]+={0,2}$/.test(text)), `Invalid hint encoding in ${level.id}`);
  }
  assert.deepEqual(Object.keys(hints).sort(), levels.map(level => level.id).sort(), 'Hint IDs must match the curriculum');
  console.log(`Validated ${levels.length} lessons, ${levels.reduce((total, level) => total + level.checks.length, 0)} checks, and ${levels.length * 3} encoded hints. No solutions or hints decoded.`);
} finally {
  await server.close();
}
