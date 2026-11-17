'use strict';

const config = window.JONES_DELIVERY;
const $ = id => document.getElementById(id);
const toggle = $('toggle-3d');
let map;
let is3D = false;
let busy = false;
let step = 0;
let selectedPin = config.recommendedEntrance;
const controls = () => document.querySelectorAll('.mode-toggle, .map-control, .angle-controls button, .map-pin, #previous-step, #next-step');

function updateControls() {
  controls().forEach(button => { button.disabled = busy || !map; });
  $('previous-step').disabled = busy || !map || step === 0;
  $('next-step').disabled = busy || !map || step === config.steps.length - 1;
  $('deliver-order').disabled = !map || busy;
}
function status(text) { $('app-status').textContent = text; }
function updateMode(next) {
  is3D = next;
  toggle.setAttribute('aria-pressed', String(is3D));
  $('toggle-label').textContent = is3D ? 'Walking route' : 'Jones in 3D';
  $('map-place').textContent = is3D ? 'Jones College' : 'Academic Quad → Jones';
  $('map-mode').textContent = is3D ? 'ENTRANCES & DROP-OFF' : 'WALKING · NO LIVE GPS';
  $('angle-controls').hidden = !is3D;
  $('route-details').hidden = is3D;
  $('building-details').hidden = !is3D;
  document.querySelector('.map-panel').classList.toggle('is-3d', is3D);
  status(is3D ? 'Drag to explore, or choose a viewing angle above.' : 'Use the map as a walking reference. No live GPS.');
}
function updateStep() {
  const current = config.steps[step];
  $('step-number').textContent = step + 1;
  $('step-title').textContent = current.title;
  $('step-instruction').textContent = current.instruction;
  $('step-count').textContent = `Step ${step + 1} of ${config.steps.length} · manual steps`;
  updateControls();
}
function selectPin(id) {
  selectedPin = id;
  const pin = id === 'D' ? config.dropoff : config.entrances.find(p => p.id === id);
  if (!pin) return;
  const kind = id === 'D' ? 'Drop-off' : id === config.recommendedEntrance ? 'Recommended entrance' : 'Alternative entrance';
  $('pin-title').textContent = `${id} · ${kind}${config.verified ? '' : ' (draft)'}`;
  $('pin-description').textContent = pin.note;
  document.querySelectorAll('.entrance-options button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.pin === id)));
  if (map) map.selectPin(id);
  if (id === 'D' && !is3D) run(() => map.set3D(true));
}
async function run(action) {
  if (!map || busy) return;
  busy = true; updateControls();
  try { await action(); }
  catch (error) { console.error('Delivery map:', error); status('That view could not load. Check your connection and try again.'); }
  finally { busy = false; updateControls(); }
}

// Keep site-visit edits in one data file, without changing the UI or map code.
for (const preset of config.views) {
  const button = document.createElement('button');
  button.type = 'button'; button.textContent = preset.label; button.dataset.angle = preset.id;
  button.setAttribute('aria-pressed', String(preset === config.views[0]));
  button.addEventListener('click', () => run(async () => {
    await map.setAngle(preset.id);
    document.querySelectorAll('[data-angle]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  }));
  $('angle-controls').append(button);
}
for (const pin of [...config.entrances, config.dropoff]) {
  const button = document.createElement('button');
  button.type = 'button'; button.dataset.pin = pin.id;
  button.textContent = pin.id === 'D' ? 'D · Drop-off' : pin.id === config.recommendedEntrance ? `${pin.id} · Use this` : `${pin.id} · Other`;
  button.addEventListener('click', () => selectPin(pin.id));
  document.querySelector('.entrance-options').append(button);
}
for (const entry of config.steps) {
  const li = document.createElement('li');
  const title = document.createElement('strong'); title.textContent = `${entry.title}. `;
  li.append(title, document.createTextNode(entry.instruction)); $('directions-list').append(li);
}
if (config.dropoff.photo) {
  const photo = document.createElement('img');
  photo.src = config.dropoff.photo; photo.alt = config.dropoff.photoAlt;
  photo.addEventListener('error', () => { $('photo-content').textContent = 'The drop-off photo could not load. Use marker D and the written instructions.'; });
  $('photo-content').append(photo);
} else {
  const placeholder = document.createElement('div');
  placeholder.className = 'photo-placeholder';
  placeholder.textContent = 'Drop-off photo to be added after the site visit. D is an editable outdoor placeholder beside entrance A.';
  $('photo-content').append(placeholder);
}
if (config.verified) {
  $('draft-note').textContent = 'Field-checked route and delivery markers';
  $('draft-note').style.background = '#e5f2e9';
}

toggle.addEventListener('click', () => run(() => map.set3D(!is3D)));
$('zoom-in').addEventListener('click', () => run(() => map.zoomIn()));
$('zoom-out').addEventListener('click', () => run(() => map.zoomOut()));
$('reset-map').addEventListener('click', () => run(() => map.reset()));
$('previous-step').addEventListener('click', () => run(async () => { step = Math.max(0, step - 1); updateStep(); await map.showStep(step); }));
$('next-step').addEventListener('click', () => run(async () => { step = Math.min(config.steps.length - 1, step + 1); updateStep(); await map.showStep(step); }));
$('deliver-order').addEventListener('click', () => {
  $('delivery-active').hidden = true; $('delivery-complete').hidden = false;
  status('Demo only. No real order was changed.'); $('reset-delivery').focus();
});
$('reset-delivery').addEventListener('click', () => run(async () => {
  step = 0; selectedPin = config.recommendedEntrance;
  $('delivery-active').hidden = false; $('delivery-complete').hidden = true;
  document.querySelectorAll('.delivery-panel details').forEach(d => { d.open = false; });
  updateStep(); selectPin(selectedPin);
  await map.set3D(false); await map.reset(true); updateMode(false);
  document.querySelectorAll('[data-angle]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.angle === config.views[0].id)));
  document.querySelector('.delivery-panel').scrollTop = 0;
}));

function showError(error) {
  console.error('Campus map:', error);
  const box = $('map-loading'); box.replaceChildren();
  const title = document.createElement('strong'); title.textContent = 'The campus map couldn’t load';
  const message = document.createElement('span'); message.textContent = 'Reconnect to the internet and try again. Walking directions remain available below.';
  const retry = document.createElement('button'); retry.type = 'button'; retry.textContent = 'Try again';
  retry.addEventListener('click', () => location.reload()); box.append(title, message, retry);
  status('Map unavailable. Read all walking directions below.');
}

updateMode(false); updateStep(); selectPin(selectedPin);
const loadingTimeout = setTimeout(() => {
  $('loading-detail').textContent = 'Still loading Rice’s campus data…';
}, 18000);
window.createJonesMap($('city-map'), config, { onMode: updateMode, onPin: selectPin })
  .then(result => {
    map = result; $('map-loading').hidden = true;
    $('route-distance').textContent = `~${Math.round(map.lengthMeters / 10) * 10} m`;
    selectPin(selectedPin); updateControls();
  })
  .catch(showError)
  .finally(() => clearTimeout(loadingTimeout));
