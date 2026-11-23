/**
 * The hero's signal source — a deterministic, replay-safe simulation of a sensor feed behind a
 * flaky link. Everything here is a pure function of (sample index, time), which is what makes the
 * hero's claim honest: the "sensor" keeps sampling while the link is down, and on reconnect the
 * screen back-fills the gap from the sensor's buffer, sample for sample. No sample is ever lost,
 * and a test pins that.
 *
 * Erasable TypeScript only (no enums, no parameter properties) so `node --test` can import it.
 */

export const SAMPLE_RATE = 60; // samples per second, per channel

/** One cycle of the demo: link up, link down (sensor buffers), reconnect and back-fill. */
export const LIVE_S = 8;
export const DOWN_S = 3;
export const SYNC_S = 1.4;
export const CYCLE_S = LIVE_S + DOWN_S + SYNC_S;

export type ChannelId = 'temp' | 'press' | 'vib' | 'state';

export interface Channel {
  id: ChannelId;
  label: string;
  unit: string;
}

export const CHANNELS: readonly Channel[] = [
  { id: 'temp', label: 'TEMP', unit: '°C' },
  { id: 'press', label: 'PRESS', unit: 'kPa' },
  { id: 'vib', label: 'VIB', unit: 'mm/s' },
  { id: 'state', label: 'RUN', unit: 'bool' },
];

/** Integer hash → [-1, 1]. Stateless, so any sample can be recomputed from its index alone. */
export function noise(seed: number): number {
  let x = seed | 0;
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
  x ^= x >>> 16;
  return ((x >>> 0) / 4294967295) * 2 - 1;
}

const TAU = Math.PI * 2;

/** The raw reading for a channel at sample index `i`, normalised to [-1, 1]. */
export function sample(channel: ChannelId, i: number): number {
  const t = i / SAMPLE_RATE;
  let v: number;
  switch (channel) {
    case 'temp':
      v = 0.55 * Math.sin((TAU * t) / 9) + 0.18 * Math.sin((TAU * t) / 2.3 + 1.1) + 0.05 * noise(i);
      break;
    case 'press':
      v = 0.62 * Math.tanh(2.4 * Math.sin((TAU * t) / 5.2)) + 0.04 * noise(i + 7919);
      break;
    case 'vib':
      v = Math.sin(TAU * t * 3.1) * (0.32 + 0.28 * Math.sin((TAU * t) / 7.3)) + 0.16 * noise(i + 104729);
      break;
    case 'state':
      v = noise(Math.floor(t / 1.7) + 31) > 0 ? 0.55 : -0.55;
      break;
  }
  return Math.max(-1, Math.min(1, v));
}

export type LinkState = 'live' | 'down' | 'sync';

/*
 * Cycle arithmetic is done in whole samples, not float seconds: a sample either is or is not inside
 * an outage, with no rounding at the boundaries. (A float version dropped one sample per cycle.)
 */
const CYCLE_N = Math.round(CYCLE_S * SAMPLE_RATE);
const LIVE_N = Math.round(LIVE_S * SAMPLE_RATE);
const DOWN_N = Math.round(DOWN_S * SAMPLE_RATE);

function position(sampleTime: number): { cycle: number; at: number } {
  const i = Math.round(sampleTime * SAMPLE_RATE);
  const cycle = Math.floor(i / CYCLE_N);
  return { cycle, at: i - cycle * CYCLE_N };
}

export interface LinkPhase {
  state: LinkState;
  cycle: number;
  /** Seconds into the current cycle. */
  at: number;
  /** 0..1 progress through the current state. */
  progress: number;
}

export function linkAt(now: number): LinkPhase {
  const cycle = Math.floor((now * SAMPLE_RATE) / CYCLE_N);
  const at = now - cycle * CYCLE_S;
  if (at < LIVE_S) return { state: 'live', cycle, at, progress: at / LIVE_S };
  if (at < LIVE_S + DOWN_S) return { state: 'down', cycle, at, progress: (at - LIVE_S) / DOWN_S };
  return { state: 'sync', cycle, at, progress: (at - LIVE_S - DOWN_S) / SYNC_S };
}

/** True when the sample taken at `sampleTime` fell inside an outage (back-filled yet or not). */
export function inOutage(sampleTime: number): boolean {
  const { at } = position(sampleTime);
  return at >= LIVE_N && at < LIVE_N + DOWN_N;
}

/** When the sample taken at `sampleTime` reached the screen (equal to `sampleTime` outside an outage). */
export function deliveredAt(sampleTime: number): number {
  const { cycle, at } = position(sampleTime);
  if (at < LIVE_N || at >= LIVE_N + DOWN_N) return sampleTime;
  const downEnd = (cycle * CYCLE_N + LIVE_N + DOWN_N) / SAMPLE_RATE;
  // Inside the outage the sample is back-filled, in order, over the SYNC window after reconnect.
  return downEnd + ((at - LIVE_N) / DOWN_N) * SYNC_S;
}

/** Is the sample taken at `sampleTime` on the screen yet, at wall-clock `now`? */
export function isDelivered(sampleTime: number, now: number): boolean {
  if (sampleTime > now) return false;
  return now >= deliveredAt(sampleTime);
}

export interface LinkStats {
  /** Samples taken so far, per channel. */
  taken: number;
  /** Samples on screen. */
  delivered: number;
  /** Samples the sensor is holding because the link is down (or still back-filling). */
  buffered: number;
  /** Samples that will never arrive. By construction this is always 0 — see `deliveredAt`. */
  lost: number;
}

/**
 * Counts for the HUD, computed by walking the same `isDelivered` the renderer uses, so the readout
 * and the picture cannot disagree. `lost` is "taken, outside any outage window still pending, yet
 * not delivered": the invariant the tests hold at zero.
 */
export function statsAt(now: number): LinkStats {
  const taken = Math.max(0, Math.floor(now * SAMPLE_RATE) + 1);
  const { cycle } = linkAt(now);
  // Only the current cycle can have undelivered samples; earlier cycles are fully back-filled.
  const from = Math.max(0, cycle * CYCLE_N);
  let pending = 0;
  let lost = 0;
  for (let i = from; i < taken; i += 1) {
    const ts = i / SAMPLE_RATE;
    if (isDelivered(ts, now)) continue;
    if (inOutage(ts)) pending += 1;
    else lost += 1;
  }
  return { taken, delivered: taken - pending - lost, buffered: pending, lost };
}
