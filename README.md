# Zone Predictor

A complete, dependency-free browser website for Liam's Fortnite zone construction method. Includes the original example map, generated transparent logo, and source code. Processing stays in the browser; there is no account, backend, paid API, or API key required by the app.

## Open without installing anything

Double-click `Zone-Predictor.html` in this download. It is a self-contained copy of the app with its logo and example embedded. Automatic analysis runs in-page in this version; all editing and PNG export features remain available.

## Run the modular source locally

Requires Python 3 (or any static web server):

```sh
cd zone-predictor
python3 -m http.server 8080 --directory dist
```

Open http://localhost:8080. Do not open index.html with file:// because browser security can block ES modules and the analysis worker. Alternatively run `npm start` if Node and Python are installed.

## Use

1. Upload a PNG, JPG, WebP, or BMP screenshot, drag it into the map, or paste an image from your clipboard.
2. The app attempts to detect the white second-zone circle and estimate the ocean direction. Always verify the result. Drag the cyan center or edge handles, or enter the circle coordinates.
3. Choose a compass direction, adjust the angle, or choose Pick ocean on map and click toward the coast.
4. Download prediction exports a full-resolution PNG. Toggle Guides before export to include or omit construction lines. Editor handles never appear in exports.

The included example opens with the same center (421,467), white radius 244px, and northwest angle 225° used in the chat example.

## Exact geometry

For white circle center C and radius R, let u be a unit vector pointing toward the chosen ocean side. The two marks are A=C+(R/4)u and B=C-(R/4)u. The prediction is centered at A with radius R/2, so B lies exactly on its edge. The diameter extends from C-Ru to C+Ru. This is deterministic geometry, not access to Fortnite's internal zone randomization.

## Automatic analysis

`detection.js` uses neutral bright pixels and a seeded RANSAC circle fit scored across 144 perimeter samples. It processes a reduced-resolution copy of the screenshot. Ocean estimation filters narrow rivers, excludes enclosed lakes where possible, and scores nearby connected blue/cyan water around the white circle. Labels, snow, overlays, cropped circles, unusual colors, or many other white shapes can confuse either estimate. Manual handles and direction controls remain available, and unclear detections show an actionable message. The analysis runs in `worker.js` when supported, with an in-page fallback.

## Files

- `dist/index.html`: full accessible interface
- `dist/styles.css`: responsive theme
- `dist/app.js`: uploads, state, map editing, export, clipboard, and optional WebMCP tool
- `dist/geometry.js`: pure construction geometry
- `dist/detection.js`: image-based circle/ocean analysis
- `dist/worker.js`: background analysis
- `dist/assets/`: example map, logo PNG, and favicon SVG

## Hosting

Serve `dist/` using any static host. All files use relative URLs. No install or build is needed. PNG exports preserve the input image's pixel dimensions. Uploaded images are held only in memory and are not sent to a server.

This is an independent geometric tool and is not affiliated with Epic Games. Predictions are estimates; next-zone placement is not guaranteed.

## Verification

The included example circle fit was checked against its known center and radius (within about 2 pixels). The prediction geometry was verified across compass directions and a custom angle, including the inland-edge constraint. JavaScript syntax and local asset references were checked. Interactive browser QA and validation in a native WebMCP browser were unavailable in this build environment; the optional browser-agent integration is feature-detected and does not affect the app in ordinary browsers.
