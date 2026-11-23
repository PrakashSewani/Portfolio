/**
 * The cold-start readout reports real browser timings or nothing. These pin the mapping and the
 * formatting, so the hero can never show a number the browser did not give it.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bootSteps, formatMs } from '../src/lib/boot.ts';

test('maps navigation and paint timing to the four steps, in order', () => {
  const steps = bootSteps(
    { responseStart: 84.2, domContentLoadedEventEnd: 290.7, loadEventEnd: 400 },
    [
      { name: 'first-paint', startTime: 300 },
      { name: 'first-contentful-paint', startTime: 312.4 },
    ],
    402.9,
  );
  assert.deepEqual(
    steps.map((s) => [s.id, s.ms]),
    [
      ['response', 84.2],
      ['paint', 312.4],
      ['dom', 290.7],
      ['interactive', 402.9],
    ],
  );
});

test('falls back to first-paint only when there is no contentful paint', () => {
  const steps = bootSteps({}, [{ name: 'first-paint', startTime: 120 }], null);
  assert.equal(steps.find((s) => s.id === 'paint').ms, 120);
});

test('missing, zero, negative or non-finite values are reported as unknown, never guessed', () => {
  const steps = bootSteps({ responseStart: 0, domContentLoadedEventEnd: Number.NaN }, [], -5);
  for (const step of steps) assert.equal(step.ms, null, `${step.id} should be unknown`);
  assert.deepEqual(bootSteps(undefined, [], null).map((s) => s.ms), [null, null, null, null]);
});

test('formats milliseconds and seconds, and an em dash for unknown', () => {
  assert.equal(formatMs(null), '—');
  assert.equal(formatMs(83.6), '84 ms');
  assert.equal(formatMs(999.4), '999 ms');
  assert.equal(formatMs(1240), '1.24 s');
  assert.equal(formatMs(12_345), '12.3 s');
});
