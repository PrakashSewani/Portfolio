/**
 * The hero's honesty guarantee, as tests: the simulated sensor is deterministic, an outage hides
 * exactly the samples taken during it, and every one of them is back-filled — none is ever lost.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CHANNELS,
  CYCLE_S,
  DOWN_S,
  LIVE_S,
  SAMPLE_RATE,
  SYNC_S,
  deliveredAt,
  inOutage,
  isDelivered,
  linkAt,
  sample,
  statsAt,
} from '../src/lib/telemetry.ts';

test('samples are deterministic and bounded', () => {
  for (const { id } of CHANNELS) {
    for (let i = 0; i < 5000; i += 7) {
      const v = sample(id, i);
      assert.equal(v, sample(id, i), `${id}[${i}] must be a pure function of its index`);
      assert.ok(v >= -1 && v <= 1, `${id}[${i}] = ${v} is out of range`);
    }
  }
});

test('the link cycles live → down → sync with the documented durations', () => {
  assert.equal(linkAt(0).state, 'live');
  assert.equal(linkAt(LIVE_S - 0.01).state, 'live');
  assert.equal(linkAt(LIVE_S).state, 'down');
  assert.equal(linkAt(LIVE_S + DOWN_S - 0.01).state, 'down');
  assert.equal(linkAt(LIVE_S + DOWN_S).state, 'sync');
  assert.equal(linkAt(CYCLE_S - 0.01).state, 'sync');
  assert.equal(linkAt(CYCLE_S).state, 'live');
  assert.equal(linkAt(CYCLE_S).cycle, 1);
});

test('during an outage the samples taken in it are not on screen', () => {
  const now = LIVE_S + DOWN_S * 0.8;
  const inside = LIVE_S + DOWN_S * 0.4;
  assert.ok(inOutage(inside));
  assert.equal(isDelivered(inside, now), false);
  assert.equal(isDelivered(LIVE_S - 0.5, now), true, 'samples from before the outage stay on screen');
  assert.equal(isDelivered(now + 1, now), false, 'a sample cannot be delivered before it is taken');
});

test('every outage sample is back-filled, in order, by the end of the sync window', () => {
  for (let cycle = 0; cycle < 6; cycle += 1) {
    const base = cycle * CYCLE_S;
    const settled = base + CYCLE_S + 0.001;
    let previous = -Infinity;
    for (let i = Math.ceil((base + LIVE_S) * SAMPLE_RATE); i < (base + LIVE_S + DOWN_S) * SAMPLE_RATE; i += 1) {
      const ts = i / SAMPLE_RATE;
      assert.ok(inOutage(ts));
      assert.ok(isDelivered(ts, settled), `sample ${i} was never back-filled`);
      const at = deliveredAt(ts);
      assert.ok(at >= base + LIVE_S + DOWN_S && at <= base + LIVE_S + DOWN_S + SYNC_S, 'back-fill happens inside the sync window');
      assert.ok(at >= previous, 'back-fill is in sample order');
      previous = at;
    }
  }
});

test('lost is zero at every instant across many cycles, and buffered is only ever outage samples', () => {
  let sawBuffered = false;
  for (let now = 0.5; now < CYCLE_S * 4; now += 0.37) {
    const s = statsAt(now);
    assert.equal(s.lost, 0, `samples lost at t=${now.toFixed(2)}`);
    assert.equal(s.taken, s.delivered + s.buffered + s.lost, 'the counts must add up');
    if (s.buffered > 0) sawBuffered = true;
  }
  assert.ok(sawBuffered, 'the demo must actually show an outage');
});

test('a fully settled stream has nothing buffered', () => {
  const s = statsAt(CYCLE_S * 3 + 3);
  assert.equal(s.buffered, 0);
  assert.equal(s.lost, 0);
});
