# Uber 3D Pickup — customer concept

A small student prototype exploring a 3D map feature for Uber customers. The goal is to make the correct building entrance easier to find before meeting a ride.

## Try it

Open `index.html` in a browser. No installation, API key, sign-in, or location access is needed.

1. The page starts with a flat, top-down map of a fictional riverfront district.
2. Select **Switch to 3D**. Buildings rise, the camera tilts, and the bridge gains visible height and depth.
3. Find the green entrance on the south side of **River House**, beside Riverside Drive. The green path connects the entrance to the pickup car.
4. Select **Back to 2D** to return to the original view.
5. Use **+**, **−**, and the recenter control to adjust the view.

The main button also works with Enter or Space. People who prefer reduced motion get an immediate view change.

## What this demo includes

- A responsive customer interface inspired by Uber.
- An animated 2D/3D toggle with projected building geometry, windows, a bridge, trees, and a marked entrance.
- A local illustrative map with no outside services or dependencies.

This is a fictional map and an unofficial student concept. It does not use real navigation data, book rides, or connect to Uber.

## Files

- `index.html`: customer interface and controls
- `styles.css`: desktop and mobile layout
- `app.js`: button behavior and UI updates
- `map-engine.js`: neighborhood geometry, projection, and animation

## Publish with GitHub Pages

In this repository, open **Settings → Pages**, choose **Deploy from a branch**, select **main** and **/(root)**, then save. Once deployment completes, use the published URL shown in Pages settings.

## Assignment checkpoints

The history preserves separate commits for the original flat-map version, the interactive 3D button change, and this documentation. The original repository setup commit is also retained.

For submission, include the public repository URL, the verified live website URL, and a share link to the AI chat transcript(s) used to build the page.

## AI assistance

Developed with assistance from OpenAI Codex. Add the conversation share link to the assignment submission once this build conversation is complete.
