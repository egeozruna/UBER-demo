'use strict';

// All geometry is local. No map API key, location permission, or account is needed.
const mapElement = document.getElementById('city-map');
const pickupMap = window.createDemoMap(mapElement);
const toggle = document.getElementById('toggle-3d');
let is3D = false;

function updateView() {
  pickupMap.set3D(is3D);
  toggle.setAttribute('aria-pressed', String(is3D));
  document.getElementById('toggle-label').textContent = is3D ? 'Back to 2D' : 'Switch to 3D';
  document.getElementById('map-mode').textContent = is3D ? '3D MAP' : '2D MAP';
  document.getElementById('map-hint-heading').textContent = is3D ? 'There’s your entrance.' : 'Find the door, before you go.';
  document.getElementById('map-hint-copy').textContent = is3D ? 'The green doorway marks your street-level pickup.' : 'Switch to 3D to see buildings, the bridge, and your entrance.';
  document.getElementById('tip-heading').textContent = is3D ? 'The right side. The right door.' : 'A new perspective, one tap away.';
  document.getElementById('tip-copy').textContent = is3D ? 'Find the green doorway on the south side of River House.' : 'Tap “Switch to 3D” to see building heights and your pickup entrance.';
  document.getElementById('entrance-description').textContent = is3D ? 'Look for the green doorway on the south side of River House. Meet your ride at street level.' : 'Your pickup is on the south side of River House, facing Riverside Drive.';
  document.querySelector('.map-panel').classList.toggle('is-3d', is3D);
}

toggle.addEventListener('click', () => { is3D = !is3D; updateView(); });
document.getElementById('zoom-in').addEventListener('click', () => pickupMap.zoomIn());
document.getElementById('zoom-out').addEventListener('click', () => pickupMap.zoomOut());
document.getElementById('reset-map').addEventListener('click', () => pickupMap.reset());
updateView();
