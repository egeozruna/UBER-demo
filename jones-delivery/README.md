# Jones College delivery MVP

This version builds on the existing Rice campus prototype. It reuses the phone shell and base CSS, the ArcGIS campus layers and coordinate system, 2D/3D switching, and the existing map controls. The original River House and Anderson Hall versions are preserved at their original URLs.

Live URL after publication: https://egeozruna.github.io/UBER-demo/jones-delivery/

## Participant task

Act as an Uber Eats delivery driver. Begin at the meeting point in Academic Quad, walk to Jones College, identify the recommended entrance, and meet the customer at the outdoor drop-off marker D. Use the map and building views as a reference; the app does not track your location or advance directions automatically.

The facilitator should time the walk and verify the participant identifies the agreed physical drop-off point. The **Mark as delivered** button only changes the demo's on-screen state; it does not send an order or collect trial results. **Start next delivery** resets the app for another participant. Refreshing also clears completion state. Use the same confirmed start, outdoor destination, and instructions for the Google Maps comparison group.

## What works

- A draft walking route of approximately 470 m from Academic Quad to Jones, following mapped pedestrian ways.
- Five manual direction steps. The arrows focus the selected route segment; recenter shows the whole route again.
- Jones's actual published 3D geometry, with the north wing, south wing, and central/commons section labeled. A neutral material simplifies its appearance.
- Dragging, zoom, and **Approach / Courtyard / Overhead** camera presets.
- Entrance candidates **A, B, C**, with **A** marked recommended for this draft, plus a separate purple outdoor hand-off marker **D**. Selecting an alternative does not silently change the intended delivery destination.
- An editable drop-off photo placeholder and delivery completion/reset.

## Site visit: required before participant testing

The route, meeting point, entrances, and drop-off are a draft, not field-verified navigation. Keep the draft notice until the team has checked them in person.

1. Fix one exact meeting point in Academic Quad. The current start is a provisional point on a mapped path in the Quad.
2. Walk the full route and check crossings, barriers, construction, and access. The paths were derived from OpenStreetMap, not inspected on foot.
3. Identify the actual doors and decide which entrance should serve this test. A and B are mapped entrance candidates, not verified delivery access. C is an illustrative north-wing doorway placeholder.
4. Choose and photograph one exact outdoor customer hand-off spot. D currently sits beside A as an editable placeholder. Do not use the placeholder as an agreed physical destination without checking it.
5. Confirm current Jones access with campus staff as needed. Rice's [September 30, 2026 notice](https://emergency.rice.edu/incident/utility-outage-2026-09-30) reported Jones South closed after an electrical incident. That notice alone does not establish whether access has since changed.
6. Run a phone walkthrough with the final configuration before using it for the comparison.

## Update the route and placeholders

Edit **route-config.js**. All editable geographic coordinates use **[longitude, latitude]**, in that order. There are no API keys or build steps.

| Setting | What to edit |
| --- | --- |
| `start` | Meeting-point name, coordinates, and note |
| `destination` | Jones building-view camera target |
| `entrances` | Candidate coordinates, names, and instructions |
| `recommendedEntrance` | The confirmed entrance ID, currently A |
| `dropoff` | Exact outdoor spot, instructions, and optional photo path |
| `dropoff.photo` | Set to a relative image path such as `photos/dropoff.jpg`; leave empty until you have the real photograph |
| `route.coordinates` | The continuous pedestrian route; first point must equal `start.coordinates`, final point must equal `dropoff.coordinates` |
| `route.entranceIndex` | Index of the recommended entrance's route point; the final short connection to D is drawn purple |
| `steps` | Walking instructions and their inclusive `from` / `to` point indices |
| `sections`, `landmarks`, `views` | Building labels, nearby map labels, and camera angles |
| `verified` | Set to `true` only after the team has checked the route, all displayed pins, and the drop-off on site. Revise any text that still says placeholder or draft. |

If you choose a different recommended entrance, update the walking route and the step text too. The app intentionally uses one fixed study route; it does not recalculate routes dynamically. After a change, run `node verify-config.cjs` from this folder to catch mismatched endpoints, missing entrances, or invalid steps.

## Sources and limits

- [Rice's published 3D campus model](https://www.arcgis.com/home/item.html?id=9408406ac1d043f7a96336147b167124), streamed through ArcGIS Maps SDK for JavaScript 4.34. The same alignment and elevation correction as the earlier campus demo is retained. No 3D meshes are redistributed here.
- [Rice building footprints](https://services.arcgis.com/lqRTrQp2HrfnJt8U/arcgis/rest/services/General_Buildings_Rice/FeatureServer/0), lawns, roads, and open spaces from the earlier campus demo.
- [OpenStreetMap](https://www.openstreetmap.org/#map=18/29.7200/-95.3984) pedestrian ways, retrieved November 17, 2026 through the public map API. The draft route follows ways `1528606935`, `87452244`, `44896171`, `1051165099`, `255487614`, and `903142675`, followed by a short placeholder connection to D. Mapped entrance candidates: [A, node 8388294692](https://www.openstreetmap.org/node/8388294692) and [B, node 8388335033](https://www.openstreetmap.org/node/8388335033).
- Pedestrian data in `walking-paths.js` and the derived route coordinates are © OpenStreetMap contributors, available under the [Open Database License](https://www.openstreetmap.org/copyright). This repository exposes the derived coordinates. Editing steps and pins does not establish that they are physically accessible.
- Rice Facilities describes the [north, south, and central wings and commons](https://facilities.rice.edu/construction/the-first-100-years). The central / commons label groups the connected central section and its ground-level commons rather than claiming detailed interior mapping.
- [PGAL's project page and photographs](https://www.pgal.com/portfolio/rice-university-martel-jones-brown-colleges/) provide architectural context. No stock or generated photograph is substituted for the future field photograph of the actual drop-off.
- The Academic Quad [was redesigned in 2024](https://news.rice.edu/news/2024/rice-unveils-redesigned-academic-quad-1). Rice's older surface layers may not match its newer paths, so a current mapped pedestrian overlay is included. Still verify the selected start and route in person.

This is a mobile, buildless student prototype. Internet access and a WebGL-capable browser are required for the map. It has no GPS, live rerouting, detailed interiors, backend, accounts, analytics, or real delivery integration.
