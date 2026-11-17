'use strict';

// Rice GIS supplies the real campus polygons and 3D meshes. No API key is embedded.
// Keep the scene in the source's Texas South Central (US feet) coordinate system.
window.createJonesMap = function createJonesMap(container, config, callbacks) {
  return new Promise((resolve, reject) => {
    if (typeof window.require !== 'function') {
      reject(new Error('The ArcGIS library could not load. Check your connection.'));
      return;
    }
    window.require([
      'esri/Map', 'esri/views/SceneView', 'esri/layers/FeatureLayer',
      'esri/layers/SceneLayer', 'esri/geometry/Point', 'esri/core/reactiveUtils',
      'esri/widgets/NavigationToggle/NavigationToggleViewModel',
      'esri/Graphic', 'esri/layers/GraphicsLayer', 'esri/geometry/Polyline',
      'esri/geometry/Extent', 'esri/geometry/projection'
    ], async (Map, SceneView, FeatureLayer, SceneLayer, Point, reactiveUtils, NavigationToggleViewModel, Graphic, GraphicsLayer, Polyline, Extent, projection) => {
      let view;
      try {
        const service = 'https://services.arcgis.com/lqRTrQp2HrfnJt8U/arcgis/rest/services/';
        const history = 'https://gis.spatialstudieslab.org/server/rest/services/Hosted/Rice_Institute_GDB/FeatureServer/';
        const spatialReference = { wkid: 2278 };
        await projection.load();
        const point = (coordinates, z = 0) => {
          const p = projection.project(new Point({ longitude: coordinates[0], latitude: coordinates[1] }), spatialReference);
          p.z = z;
          return p;
        };
        const nativeRoute = config.route.coordinates.map(c => point(c));
        const line = coordinates => new Polyline({ spatialReference, paths: [coordinates.map(p => [p.x, p.y])] });
        const routeGeometry = line(nativeRoute);
        const paths = new GraphicsLayer({ title: 'OpenStreetMap pedestrian paths', elevationInfo: { mode: 'on-the-ground' } });
        for (const path of window.JONES_WALKING_PATHS || []) paths.add(new Graphic({
          geometry: line(path.map(c => point(c))), symbol: { type: 'simple-line', color: '#fff', width: 1.7 }
        }));
        const route = new GraphicsLayer({ title: 'Draft walking route', elevationInfo: { mode: 'relative-to-ground', offset: 0.2 } });
        const walking = line(nativeRoute.slice(0, config.route.entranceIndex + 1));
        route.addMany([
          new Graphic({ geometry: walking, symbol: { type: 'simple-line', color: '#008c59', width: 5 } }),
          new Graphic({ geometry: line(nativeRoute.slice(config.route.entranceIndex)), symbol: { type: 'simple-line', color: '#6742b9', width: 4, style: 'short-dash' } })
        ]);
        const currentStep = new GraphicsLayer({ title: 'Selected walking instruction', elevationInfo: { mode: 'relative-to-ground', offset: 0.25 } });
        const fill = (color, outline = '#ffffff', width = 0.5) => ({
          type: 'simple-fill', color, outline: { color: outline, width }
        });
        const layer = (url, title, color, extras = {}) => new FeatureLayer({
          url, title, popupEnabled: false, elevationInfo: { mode: 'on-the-ground' },
          renderer: { type: 'simple', symbol: fill(color) }, ...extras
        });
        const lawns = layer(service + 'ParcelsPoly/FeatureServer/0', 'Campus lawns', '#dce7d6');
        const openSpaces = layer(history + '5', 'Campus paths and open spaces', '#f1f0e9', {
          definitionExpression: 'lastyear = 8888 OR lastyear IS NULL',
          renderer: {
            type: 'unique-value', field: 'type', defaultSymbol: fill('#eeeae3'),
            uniqueValueInfos: [
              { value: 'Paved Surface', symbol: fill('#f4f3ee') },
              { value: 'Parking Lots', symbol: fill('#e2e2de') },
              { value: 'Fields and Courts', symbol: fill('#d6e2cb') },
              { value: 'Bushes', symbol: fill('#cbdcc2') }
            ]
          }
        });
        const roads = layer(history + '12', 'Campus roads', '#ffffff', {
          definitionExpression: 'lastyear = 8888 OR lastyear IS NULL'
        });
        const footprints = layer(service + 'General_Buildings_Rice/FeatureServer/0', 'Campus buildings', '#d1d3d2', {
          outFields: ['LONGNAME'],
          renderer: {
            type: 'unique-value', field: 'LONGNAME', defaultSymbol: fill('#d1d3d2', '#bfc3c1', 0.6),
            uniqueValueInfos: [{ value: 'Jones College', symbol: fill('#38ad83', '#007951', 1.5) }]
          }
        });
        const trees = new FeatureLayer({
          url: service + 'TreesPoint/FeatureServer/0', title: 'Campus trees',
          popupEnabled: false, minScale: 5500, elevationInfo: { mode: 'on-the-ground' },
          renderer: { type: 'simple', symbol: { type: 'simple-marker', color: [126, 157, 119, 0.45], size: 3, outline: null } }
        });
        const meshSymbol = (color, edgeColor) => ({
          type: 'mesh-3d', symbolLayers: [{ type: 'fill',
            material: { color, colorMixMode: 'replace' },
            edges: { type: 'solid', color: edgeColor, size: 0.5 }
          }]
        });
        const buildings = new SceneLayer({
          url: service + 'Rice_University_Campus/SceneServer/layers/0', title: 'Rice campus 3D buildings',
          visible: false, popupEnabled: false, outFields: ['name'], definitionExpression: "name = 'Jones College'",
          // The same elevation correction is used in Rice's public campus WebScene.
          elevationInfo: { mode: 'absolute-height', offset: -14.5, unit: 'meters' },
          renderer: {
            type: 'unique-value', field: 'name',
            defaultSymbol: meshSymbol('#dddcd7', '#9eaaa4'),
            uniqueValueInfos: [{ value: 'Jones College', symbol: meshSymbol('#b4d1c1', '#688d7a') }]
          }
        });
        const map = new Map({
          basemap: null, ground: { surfaceColor: '#e9e9e5', opacity: 1 },
          layers: [lawns, openSpaces, roads, paths, trees, footprints, buildings, route, currentStep]
        });
        view = new SceneView({
          container, map, spatialReference, viewingMode: 'local', qualityProfile: 'medium',
          ui: { components: [] }, popupEnabled: false,
          padding: { top: 70, right: 42, bottom: 58, left: 22 },
          environment: {
            background: { type: 'color', color: '#e9e9e5' },
            atmosphereEnabled: false, starsEnabled: false,
            lighting: { type: 'virtual', directShadowsEnabled: true }
          },
          constraints: { altitude: { min: 65, max: 18000 }, tilt: { max: 82 } },
          camera: {
            position: { x: 3111600, y: 13827000, z: 3500, spatialReference },
            heading: 0, tilt: 0
          }
        });

        await Promise.all([view.when(), footprints.load()]);
        let is3D = false;
        let viewId = config.views[0].id;
        const destination = point(config.destination.coordinates);
        const navigation = new NavigationToggleViewModel({ view, navigationMode: 'pan' });
        const markerRoot = document.getElementById('map-markers');
        const leaders = document.getElementById('marker-leaders');
        const markers = [];
        const addMarker = ({ id, label, coordinates, heightFeet = 1, kind, offset = [0, -15] }) => {
          const element = document.createElement(kind === 'section' || kind === 'landmark' || id === 'start' ? 'span' : 'button');
          element.className = kind === 'section' || kind === 'landmark' ? 'section-label' : `map-pin ${kind || ''}`;
          if (kind === 'section' || kind === 'landmark') element.textContent = label;
          else {
            element.type = 'button';
            element.setAttribute('aria-label', id === 'start' ? 'Academic Quad starting point' : `${label}, ${config.verified ? 'delivery marker' : 'unconfirmed draft marker'}`);
            const content = document.createElement('span'); content.textContent = label; element.append(content);
            if (id !== 'start') element.addEventListener('click', () => callbacks.onPin(id));
          }
          const leader = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          leader.setAttribute('stroke', kind === 'dropoff' ? '#6742b9' : '#526a5d');
          leader.setAttribute('stroke-width', '1.5'); leaders.append(leader);
          const dot = document.createElement('span'); dot.className = `geo-dot ${kind || ''}`; dot.setAttribute('aria-hidden', 'true');
          if (kind !== 'section' && kind !== 'landmark') markerRoot.append(dot);
          markerRoot.append(element);
          markers.push({ id, kind, element, leader, dot, coordinates, heightFeet, offset });
        };
        addMarker({ id: 'start', label: 'Start · Academic Quad', coordinates: config.start.coordinates, kind: 'start', offset: [0, 38] });
        for (const entrance of config.entrances) addMarker({
          ...entrance, label: entrance.id === config.recommendedEntrance ? `${entrance.id} · Entrance` : entrance.id,
          kind: entrance.id === config.recommendedEntrance ? 'recommended' : 'alternative',
          offset: entrance.id === config.recommendedEntrance ? [-70, -10] : entrance.id === 'C' ? [-110, 15] : [70, 5]
        });
        addMarker({ ...config.dropoff, label: 'D · Drop-off', kind: 'dropoff', offset: [58, 20] });
        for (const section of config.sections) addMarker({ ...section, id: section.name, label: section.name, kind: 'section', offset: [0, -4] });
        for (const landmark of config.landmarks || []) addMarker({ ...landmark, id: landmark.name, label: landmark.name, kind: 'landmark', offset: [0, -2] });
        const updateMarkers = () => {
          for (const m of markers) {
            const enabled = is3D ? m.id !== 'start' && m.kind !== 'landmark' : m.kind === 'dropoff' || m.id === 'start' || m.kind === 'landmark';
            const p = enabled && view.toScreen(point(m.coordinates, is3D ? m.heightFeet : 1));
            const visible = p && p.x > 0 && p.y > 58 && p.x < view.width && p.y < view.height - 20;
            m.element.hidden = !visible; m.leader.style.display = visible && m.kind !== 'section' && m.kind !== 'landmark' ? '' : 'none'; m.dot.hidden = !visible;
            if (!visible) continue;
            if (m.kind === 'dropoff') m.element.querySelector('span').textContent = is3D ? 'D · Drop-off' : 'Jones · Drop-off D';
            const offset = !is3D && m.kind === 'dropoff' ? [0, -12] : m.offset;
            const x = Math.max(48, Math.min(view.width - 48, p.x + offset[0]));
            const y = Math.max(102, Math.min(view.height - 32, p.y + offset[1]));
            m.element.style.left = `${x}px`; m.element.style.top = `${y}px`;
            m.dot.style.left = `${p.x}px`; m.dot.style.top = `${p.y}px`;
            m.leader.setAttribute('x1', p.x); m.leader.setAttribute('y1', p.y);
            m.leader.setAttribute('x2', x); m.leader.setAttribute('y2', y - 9);
          }
        };
        const watch = reactiveUtils.watch(() => [view.camera, view.width, view.height], updateMarkers);
        const animate = target => view.goTo(target, {
          animate: !window.matchMedia('(prefers-reduced-motion: reduce)').matches, duration: 650
        }).catch(error => { if (error.name !== 'AbortError') throw error; });
        const angle = () => {
          const preset = config.views.find(v => v.id === viewId) || config.views[0];
          return animate({ target: destination, ...preset });
        };
        const home = () => is3D ? angle() : animate({ target: routeGeometry.extent.expand(1.15), heading: 0, tilt: 0 });
        await home();
        await view.whenLayerView(footprints);
        updateMarkers();
        reactiveUtils.watch(() => view.fatalError, error => { if (error) view.tryFatalErrorRecovery(); });
        const lengthMeters = nativeRoute.slice(1).reduce((sum, p, i) => sum + Math.hypot(p.x - nativeRoute[i].x, p.y - nativeRoute[i].y) * 0.304800609601, 0);
        resolve({
          lengthMeters,
          async set3D(next) {
            if (next === is3D) return;
            if (next) {
              try { await buildings.load(); buildings.visible = true; await view.whenLayerView(buildings); }
              catch (error) { buildings.visible = false; throw error; }
            }
            is3D = next; buildings.visible = is3D;
            currentStep.visible = !is3D;
            navigation.navigationMode = is3D ? 'rotate' : 'pan';
            callbacks.onMode(is3D);
            await home(); updateMarkers();
          },
          async setAngle(id) {
            if (!config.views.some(v => v.id === id)) return;
            viewId = id; await angle();
          },
          async showStep(index) {
            currentStep.removeAll();
            const step = config.steps[index];
            const geometry = line(nativeRoute.slice(step.from, step.to + 1));
            currentStep.add(new Graphic({ geometry, symbol: { type: 'simple-line', color: '#004c35', width: 7 } }));
            if (!is3D) await animate({ target: geometry.extent.expand(1.7), tilt: 0, heading: 0, scale: Math.max(1700, Math.min(3800, geometry.extent.height * 3.7)) });
          },
          selectPin(id) { for (const m of markers) if (m.element.tagName === 'BUTTON') m.element.setAttribute('aria-pressed', String(m.id === id)); },
          zoomIn: () => animate({ scale: Math.max(400, view.scale / 1.4) }),
          zoomOut: () => animate({ scale: Math.min(13000, view.scale * 1.4) }),
          reset(resetAngle = false) { if (resetAngle) viewId = config.views[0].id; currentStep.removeAll(); return home(); },
          destroy() { watch.remove(); navigation.destroy(); view.destroy(); markerRoot.replaceChildren(); leaders.replaceChildren(); }
        });
      } catch (error) {
        if (view) view.destroy();
        reject(error);
      }
    }, reject);
  });
};
