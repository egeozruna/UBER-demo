'use strict';

const toggle = document.getElementById('toggle-3d');
const controls = [...document.querySelectorAll('.mode-toggle, .map-control')];
const loading = document.getElementById('map-loading');
let is3D = false;
let pickupMap;
let busy = false;
const setText = (id, text) => { document.getElementById(id).textContent = text; };
const setBusy = value => { busy = value; controls.forEach(button => { button.disabled = value; }); };

function updateView(next) {
  is3D = next;
  toggle.setAttribute('aria-pressed', String(is3D));
  setText('toggle-label', is3D ? 'Back to 2D' : 'Switch to 3D');
  setText('map-mode', is3D ? '3D CAMPUS' : '2D MAP');
  setText('map-hint-heading', 'Anderson Hall is highlighted in green');
  setText('map-hint-copy', is3D ? 'Drag to rotate. Right-drag or two-finger drag to move.' : 'Tap Switch to 3D to explore the campus buildings.');
  setText('tip-heading', is3D ? 'Look around Anderson Hall.' : 'Explore your destination in 3D.');
  setText('tip-copy', is3D ? 'Drag to rotate · Right-drag to move · Pinch to zoom' : 'Drag to move the map. Use + and − to zoom.');
  setText('entrance-description', 'Anderson Hall is highlighted in green on the map.');
  document.querySelector('.map-panel').classList.toggle('is-3d', is3D);
}

function showError(error) {
  console.error('Rice campus map:', error);
  loading.replaceChildren();
  const title = document.createElement('strong');
  title.textContent = 'The campus map couldn’t load';
  const detail = document.createElement('span');
  detail.textContent = 'Check your internet connection and try again. This map needs WebGL and Rice’s public ArcGIS services.';
  const retry = document.createElement('button');
  retry.type = 'button'; retry.textContent = 'Try again';
  retry.addEventListener('click', () => location.reload());
  loading.append(title, detail, retry); loading.hidden = false;
}

async function run(action) {
  if (!pickupMap || busy) return;
  setBusy(true);
  try { await action(); }
  catch (error) {
    setText('tip-heading', 'The map couldn’t update.');
    setText('tip-copy', 'Check your connection, then try the control again.');
    console.error('Map control:', error);
  } finally { setBusy(false); }
}

toggle.addEventListener('click', () => run(() => pickupMap.set3D(!is3D)));
document.getElementById('zoom-in').addEventListener('click', () => run(() => pickupMap.zoomIn()));
document.getElementById('zoom-out').addEventListener('click', () => run(() => pickupMap.zoomOut()));
document.getElementById('reset-map').addEventListener('click', () => run(() => pickupMap.reset()));
setBusy(true);
updateView(false);
const timeout = setTimeout(() => {
  loading.querySelector('span:last-child').textContent = 'Rice’s map is taking longer to load. Please stay connected…';
}, 18000);
window.createRiceMap(document.getElementById('city-map'), updateView)
  .then(map => { pickupMap = map; loading.hidden = true; setBusy(false); })
  .catch(showError)
  .finally(() => clearTimeout(timeout));
