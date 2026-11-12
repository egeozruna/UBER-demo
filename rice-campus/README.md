# Rice campus version

An additional version of the Uber-inspired customer prototype. The original River House demo at the repository root remains unchanged.

## Open it

Open `rice-campus/index.html` in a modern browser with WebGL, or serve the repository with any static web server. The map needs an internet connection to load the ArcGIS SDK and Rice's public GIS services. No API key, login, or location permission is required.

On GitHub Pages, append `/rice-campus/` to the original website URL:

`https://egeozruna.github.io/UBER-demo/rice-campus/`

## Use the map

- The page starts with a top-down map of Rice University. **Anderson Hall**, home to the School of Architecture, is the green destination.
- **Switch to 3D** loads the actual campus building meshes, including their modeled roofs and facades.
- In 2D, drag to pan. In 3D, drag to rotate around the scene; right-drag to pan. On a touchscreen, use two fingers to move around and pinch to zoom.
- **+ / −** zoom. The **recenter** control returns to Anderson Hall. **Back to 2D** restores the flat campus view.

The original phone frame, header, control positions, and pickup sheet layout are retained. Only the map, destination text, and map attribution differ. The 3D camera is freely movable and begins at a tilted view aimed at Anderson Hall.

## Data and accuracy

The application reads public Rice GIS services directly at runtime, rather than drawing invented buildings:

- [Rice University Campus 3D model](https://www.arcgis.com/home/item.html?id=9408406ac1d043f7a96336147b167124), published by `ug2_ricegis`.
- [Building footprints](https://services.arcgis.com/lqRTrQp2HrfnJt8U/arcgis/rest/services/General_Buildings_Rice/FeatureServer/0): the destination is queried by the exact name `Anderson Hall`, distinct from M.D. Anderson Biology and Anderson-Clarke Center.
- [Campus lawns](https://services.arcgis.com/lqRTrQp2HrfnJt8U/arcgis/rest/services/ParcelsPoly/FeatureServer/0) and [trees](https://services.arcgis.com/lqRTrQp2HrfnJt8U/arcgis/rest/services/TreesPoint/FeatureServer/0).
- [Campus open spaces](https://gis.spatialstudieslab.org/server/rest/services/Hosted/Rice_Institute_GDB/FeatureServer/5) and [roads](https://gis.spatialstudieslab.org/server/rest/services/Hosted/Rice_Institute_GDB/FeatureServer/12), filtered to current or undated records.
- [Rice's public campus WebScene](https://www.arcgis.com/home/item.html?id=badb6d9533d24e63bb862920619dbdf1) supplies the model's elevation alignment convention.

Rendering uses Esri's ArcGIS Maps SDK for JavaScript 4.34. A local scene preserves the source's NAD83 / Texas South Central (US feet), EPSG:2278, coordinates. The 3D mesh is streamed from Rice's service; it is not redistributed in this repository.

This is a campus model, not live navigation or a survey. Source geometry may predate campus construction or renovations. The destination marker identifies the building, not a verified doorway or accessible pickup location. No ride is booked.
