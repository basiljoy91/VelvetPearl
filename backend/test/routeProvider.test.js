const test = require('node:test');
const assert = require('node:assert/strict');
const { getFallbackEstimate } = require('../services/routeProviderService');

test('fallback route estimate returns usable distance, duration, and geometry', () => {
  const estimate = getFallbackEstimate(
    { latitude: 13.0827, longitude: 80.2707 },
    { latitude: 11.9416, longitude: 79.8083 }
  );

  assert.ok(estimate.distanceKm > 0);
  assert.ok(estimate.durationMinutes > 0);
  assert.equal(estimate.provider, 'fallback');
  assert.deepEqual(estimate.geometry.type, 'LineString');
  assert.equal(estimate.geometry.coordinates.length, 2);
});
