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
  document.getElementById('map-mode').textContent = is3D ? 'DRIVER’S VIEW' : '2D MAP';
  document.getElementById('map-hint-heading').textContent = is3D ? 'Your pickup from the driver’s view' : 'Find your pickup entrance';
  document.getElementById('map-hint-copy').textContent = is3D ? 'River House · Main entrance · Street level' : 'Tap Switch to 3D to see the entrance from the car.';
  document.getElementById('tip-heading').textContent = is3D ? 'At eye level, from the car.' : 'See what your driver sees.';
  document.getElementById('tip-copy').textContent = is3D ? 'The camera looks from the pickup car toward the building’s main entrance.' : 'Switch to a street-level view to find the right entrance.';
  document.getElementById('entrance-description').textContent = is3D ? 'The marked doorway is your pickup entrance, seen from the driver’s seat on Riverside Drive.' : 'Your pickup is on the south side of River House, facing Riverside Drive.';
  document.querySelector('.map-panel').classList.toggle('is-3d', is3D);
}

toggle.addEventListener('click', () => { is3D = !is3D; updateView(); });
document.getElementById('zoom-in').addEventListener('click', () => pickupMap.zoomIn());
document.getElementById('zoom-out').addEventListener('click', () => pickupMap.zoomOut());
document.getElementById('reset-map').addEventListener('click', () => pickupMap.reset());
updateView();
