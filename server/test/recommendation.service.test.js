import test from "node:test";
import assert from "node:assert/strict";

import { buildRecommendations } from "../src/services/recommendation.service.js";

test("buildRecommendations returns a high CPU alert", () => {
  const recommendations = buildRecommendations({
    cpuForecast: 84,
    memoryForecast: 52
  });

  assert.equal(recommendations[0].title, "High CPU forecast");
  assert.equal(recommendations[0].severity, "high");
});

test("buildRecommendations returns a healthy summary when pressure is low", () => {
  const recommendations = buildRecommendations({
    cpuForecast: 25,
    memoryForecast: 32
  });

  assert.equal(recommendations.length, 1);
  assert.equal(recommendations[0].severity, "low");
});

test("buildRecommendations can emit multiple suggestions", () => {
  const recommendations = buildRecommendations({
    cpuForecast: 84,
    memoryForecast: 82
  });

  assert.equal(recommendations.length, 2);
});
