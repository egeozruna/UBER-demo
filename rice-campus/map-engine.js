'use strict';

// Rice GIS supplies the real campus polygons and 3D meshes. No API key is embedded.
// Keep the scene in the source's Texas South Central (US feet) coordinate system.
window.createRiceMap = function createRiceMap(container, onModeChange) {
  return new Promise((resolve, reject) => {
    if (typeof window.require !== 'function') {
      reject(new Error('The ArcGIS library could not load. Check your connection.'));
      return;
    }
    window.require([
      'esri/Map', 'esri/views/SceneView', 'esri/layers/FeatureLayer',
      'esri/layers/SceneLayer', 'esri/geometry/Point', 'esri/core/reactiveUtils',
      'esri/widgets/NavigationToggle/NavigationToggleViewModel'
    ], async (Map, SceneView, FeatureLayer, SceneLayer, Point, reactiveUtils, NavigationToggleViewModel) => {
      let view;
      try {
        const service = 'https://services.arcgis.com/lqRTrQp2HrfnJt8U/arcgis/rest/services/';
        const history = 'https://gis.spatialstudieslab.org/server/rest/services/Hosted/Rice_Institute_GDB/FeatureServer/';
        const spatialReference = { wkid: 2278 };
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
            uniqueValueInfos: [{ value: 'Anderson Hall', symbol: fill('#38ad83', '#007951', 1.5) }]
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
          visible: false, popupEnabled: false, outFields: ['name'],
          // The same elevation correction is used in Rice's public campus WebScene.
          elevationInfo: { mode: 'absolute-height', offset: -14.5, unit: 'meters' },
          renderer: {
            type: 'unique-value', field: 'name',
            defaultSymbol: meshSymbol('#dddcd7', '#9eaaa4'),
            uniqueValueInfos: [{ value: 'Anderson Hall', symbol: meshSymbol('#30af80', '#006c48') }]
          }
        });
        const map = new Map({
          basemap: null, ground: { surfaceColor: '#e9e9e5', opacity: 1 },
          layers: [lawns, openSpaces, roads, trees, footprints, buildings]
        });
        view = new SceneView({
          container, map, spatialReference, viewingMode: 'local', qualityProfile: 'medium',
          ui: { components: ['attribution'] }, popupEnabled: false,
          environment: {
            background: { type: 'color', color: '#e9e9e5' },
            atmosphereEnabled: false, starsEnabled: false,
            lighting: { type: 'virtual', directShadowsEnabled: true }
          },
          constraints: { altitude: { min: 65, max: 18000 }, tilt: { max: 82 } },
          camera: {
            position: { x: 3111081.23, y: 13826505.42, z: 1800, spatialReference },
            heading: 0, tilt: 0
          }
        });

        // Query the actual named feature instead of guessing a pin from a street address.
        // Anderson Hall is distinct from M.D. Anderson Biology and Anderson-Clarke Center.
        await Promise.all([view.when(), footprints.load(), buildings.load()]);
        const result = await footprints.queryFeatures({
          where: "LONGNAME = 'Anderson Hall'", outFields: ['LONGNAME'],
          returnGeometry: true, outSpatialReference: spatialReference
        });
        if (result.features.length !== 1) throw new Error('Anderson Hall could not be located in the campus map.');
        const destination = result.features[0].geometry.extent.center;
        destination.z = 0;
        let is3D = false;
        const navigation = new NavigationToggleViewModel({ view, navigationMode: 'pan' });
        const marker = document.getElementById('destination-marker');
        const showMarker = () => {
          const anchor = new Point({ x: destination.x, y: destination.y, z: is3D ? 80 : 3, spatialReference });
          const point = view.toScreen(anchor);
          const visible = point && point.x > 0 && point.y > 0 && point.x < view.width && point.y < view.height;
          marker.hidden = !visible;
          if (visible) { marker.style.left = `${point.x}px`; marker.style.top = `${point.y}px`; }
        };
        const watch = reactiveUtils.watch(() => [view.camera, view.width, view.height], showMarker);
        const animate = target => view.goTo(target, {
          animate: !window.matchMedia('(prefers-reduced-motion: reduce)').matches, duration: 850
        }).catch(error => { if (error.name !== 'AbortError') throw error; });
        const home = () => animate({ target: destination, scale: is3D ? 1450 : 2400, heading: is3D ? 210 : 0, tilt: is3D ? 62 : 0 });
        await home();
        await view.whenLayerView(footprints);
        showMarker();

        // Also support recovery if the browser temporarily loses its WebGL context.
        reactiveUtils.watch(() => view.fatalError, error => { if (error) view.tryFatalErrorRecovery(); });
        resolve({
          async set3D(next) {
            if (next === is3D) return;
            if (next) {
              buildings.visible = true;
              try { await view.whenLayerView(buildings); }
              catch (error) { buildings.visible = false; throw error; }
            }
            is3D = next;
            buildings.visible = is3D;
            footprints.visible = !is3D;
            navigation.navigationMode = is3D ? 'rotate' : 'pan';
            onModeChange(is3D);
            await home();
            if (is3D) {
              const layerView = await view.whenLayerView(buildings);
              await reactiveUtils.whenOnce(() => !layerView.updating);
            }
            showMarker();
          },
          zoomIn: () => animate({ scale: Math.max(350, view.scale / 1.45) }),
          zoomOut: () => animate({ scale: Math.min(16000, view.scale * 1.45) }),
          reset: home,
          destroy() { watch.remove(); navigation.destroy(); view.destroy(); }
        });
      } catch (error) {
        if (view) view.destroy();
        reject(error);
      }
    }, reject);
  });
};
