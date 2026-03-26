import test from "node:test";
import assert from "node:assert/strict";

import {
  clampPercentage,
  movingAverage,
  simpleTrend
} from "../src/utils/forecast.js";

test("movingAverage returns null for empty input", () => {
  assert.equal(movingAverage([]), null);
});

test("movingAverage uses the most recent sample window", () => {
  assert.equal(movingAverage([20, 30, 40, 50, 60, 70], 3), 60);
});

test("simpleTrend falls back when there are not enough samples", () => {
  assert.equal(simpleTrend([42], 50), 50);
});

test("simpleTrend projects the next value from recent deltas", () => {
  assert.equal(simpleTrend([20, 30, 40, 50, 60]), 70);
});

test("clampPercentage keeps values inside 0 to 100", () => {
  assert.equal(clampPercentage(-10), 0);
  assert.equal(clampPercentage(120), 100);
  assert.equal(clampPercentage(54.3), 54);
});

test("clampPercentage returns null for invalid values", () => {
  assert.equal(clampPercentage(null), null);
  assert.equal(clampPercentage(undefined), null);
  assert.equal(clampPercentage(Number.NaN), null);
});
