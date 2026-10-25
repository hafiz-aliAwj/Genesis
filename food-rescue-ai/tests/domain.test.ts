import { test } from "node:test";
import assert from "node:assert/strict";
import {
  demoData,
  urgency,
  distance,
  donationPoints,
  impact,
  match,
  badge,
} from "../src/lib/domain";
test("urgency boundaries use expiry and never label expired as fresh", () => {
  const n = Date.now();
  assert.equal(urgency(new Date(n - 1).toISOString(), n), "Expired");
  assert.equal(urgency(new Date(n + 2 * 3600000).toISOString(), n), "High");
  assert.equal(urgency(new Date(n + 6 * 3600000).toISOString(), n), "Medium");
  assert.equal(urgency(new Date(n + 7 * 3600000).toISOString(), n), "Low");
});
test("distance is symmetric and zero at same location", () => {
  const a = { lat: 24.8, lng: 67 },
    b = { lat: 24.85, lng: 67.05 };
  assert.equal(distance(a, a), 0);
  assert.equal(distance(a, b), distance(b, a));
  assert.ok(distance(a, b) > 7 && distance(a, b) < 8);
});
test("donation reward thresholds", () => {
  assert.equal(donationPoints(9), 10);
  assert.equal(donationPoints(10), 25);
  assert.equal(donationPoints(29), 25);
  assert.equal(donationPoints(30), 50);
});
test("impact excludes all uncompleted donations", () => {
  const data = demoData();
  const result = impact(data.donations);
  assert.equal(result.meals, 42);
  assert.equal(result.kg, 16.8);
  assert.equal(result.co2, 42);
  assert.equal(
    impact(data.donations.filter((d) => d.status !== "completed")).meals,
    0,
  );
});
test("matching is explainable and bounded", () => {
  const { donations, users } = demoData();
  const m = match(donations[0], users[1]);
  assert.ok(m.score >= 0 && m.score <= 100);
  assert.equal(
    m.score,
    Math.round(
      (m.distanceScore * 0.5 + m.quantityScore * 0.3 + m.urgencyScore * 0.2) *
        100,
    ),
  );
});
test("badges follow defined thresholds", () => {
  assert.equal(badge("restaurant", 500), "Platinum Donor");
  assert.equal(badge("volunteer", 100), "Rescuer");
  assert.equal(badge("restaurant", 0), "New partner");
  assert.equal(badge("ngo", 0), "Community partner");
});
