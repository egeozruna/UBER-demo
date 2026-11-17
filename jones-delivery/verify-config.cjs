// Validate the study route after editing pins or directions. Run: node verify-config.cjs
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(`${__dirname}/route-config.js`, 'utf8'), sandbox);
const c = sandbox.window.JONES_DELIVERY;
const same = (a, b) => a.length === b.length && a.every((v, i) => Math.abs(v - b[i]) < 1e-7);
const coordinate = p => assert(p.length === 2 && p.every(Number.isFinite) && p[0] > -95.42 && p[0] < -95.38 && p[1] > 29.70 && p[1] < 29.74, 'Coordinates must be [longitude, latitude] near Rice');
[c.start, c.destination, c.dropoff, ...c.entrances, ...c.sections, ...c.landmarks].forEach(p => coordinate(p.coordinates));
c.route.coordinates.forEach(coordinate);
assert.equal(new Set(c.entrances.map(p => p.id)).size, c.entrances.length, 'Entrance IDs must be unique');
const entrance = c.entrances.find(p => p.id === c.recommendedEntrance);
assert(entrance, 'Recommended entrance must exist');
assert(same(c.route.coordinates[0], c.start.coordinates), 'Route must start at the meeting point');
assert(same(c.route.coordinates.at(-1), c.dropoff.coordinates), 'Route must end at the drop-off');
assert(same(c.route.coordinates[c.route.entranceIndex], entrance.coordinates), 'Route must pass the recommended entrance before D');
assert.equal(c.steps[0].from, 0);
assert.equal(c.steps.at(-1).to, c.route.coordinates.length - 1);
c.steps.forEach((s, i) => {
  assert(Number.isInteger(s.from) && Number.isInteger(s.to) && s.from >= 0 && s.to > s.from && s.to < c.route.coordinates.length, 'Invalid step range');
  if (i) assert.equal(s.from, c.steps[i - 1].to, 'Walking steps must be continuous');
  assert(s.title && s.instruction);
});
assert(c.views.length >= 3 && c.views.every(v => Number.isFinite(v.heading) && v.tilt >= 0 && v.tilt < 90 && v.scale > 0));
console.log('Route checks passed: meeting point, recommended entrance, drop-off, continuous directions, and camera presets.');
