# Zone Predictor 1.2

A complete browser website that automatically constructs a Fortnite zone prediction when a map screenshot is uploaded, dropped, or pasted. Includes a generated transparent logo and full source. All screenshot analysis happens locally in the browser. No API key or Python required.

## Railway / GitHub

1. Extract this package and upload the CONTENTS of the Zone-Predictor folder to your GitHub repository. `package.json`, `server.js`, and `dist/` should be at the repository root.
2. Connect that repository to Railway.
3. Use `npm start` as the Start Command. Clear an old custom command containing `python3` if one was set.
4. Deploy, then generate a Railway domain for the service.

The app uses the built-in Node HTTP server and binds to `0.0.0.0` on `process.env.PORT` (8080 for local use). The package requires Node 20 or newer and has zero external dependencies. No build command is necessary. If keeping the files inside a repository subfolder, set Railway's Root Directory to that folder.

The `npm warn config production` notice is not the crash. The old start command called Python in a container that did not include Python; version 1.1 replaces it with `node server.js`.

## Run locally

```sh
npm start
```

Open http://localhost:8080. Alternatively double-click the included `Zone-Predictor.html`, a self-contained version requiring no installation. The portable version runs analysis in-page; the hosted modular version uses a background worker.

## Interface

The app opens empty with a single upload area. No example image is included or loaded. Results and optional adjustments appear after an image is uploaded.

## Automatic workflow

Copy an actual image/screenshot and press Ctrl+V (Cmd+V on Mac), drop it on the map, or upload a PNG, JPG, WebP, or BMP. Copying a file name or an image URL is not the same as copying its image bytes.

The app automatically detects the white zone, looks for the surrounding storm-circle alignment, chooses the ocean-facing end of the diameter, and draws the red prediction. Optional correction controls remain collapsed under Fine-tune if needed. Download prediction exports the original-resolution screenshot with its red outline. Guides can be toggled into the export; editor handles never appear in it.

No fabricated prediction is shown after failed automatic analysis. The interface explains the failure and opens the optional controls. Blurry-but-usable boundaries are labeled as estimated. Automatic screenshot interpretation can need a correction; the geometry itself is deterministic.

## Exact method

For white circle center C and radius R, u is a unit vector pointing toward the chosen ocean side. The marks are A=C+(R/4)u and B=C-(R/4)u. The red prediction is centered at A with radius R/2, so B lies exactly on its edge. The diameter is C-Ru to C+Ru.

## Image analysis

This version uses local computer vision, not a cloud language model. Circle detection fits neutral bright and line-contrast pixels with seeded RANSAC and checks perimeter coverage. Storm segmentation fits the surrounding zone where visible, providing a natural diagonal axis. Broad-water segmentation then chooses the ocean-facing end; when storm alignment is unavailable, nearby ocean pixels supply the direction. Narrow rivers and enclosed lakes are filtered where possible.

No screenshot is uploaded to a server. No account, API subscription, or API key is required for this analysis. Fortnite's actual next zone remains uncertain.

## Source

- `server.js`: dependency-free Node HTTP server compatible with Railway
- `dist/index.html`, `dist/styles.css`: responsive interface
- `dist/app.js`: automatic pipeline, uploads, clipboard, optional editing, export
- `dist/geometry.js`: exact construction
- `dist/detection.js`: circle, storm, and ocean image analysis
- `dist/worker.js`: background analysis
- `dist/assets/`: logo and favicon

## Verification

The Node server was started with an assigned PORT and checked for HTML, JavaScript modules, logo, HEAD, missing files, and unsupported methods. Automatic analysis was checked with three supplied screenshots, including a blurry example. The edge/center geometric relationship and JavaScript syntax were checked. Native WebMCP/browser UI validation was unavailable; its optional integration is feature-detected and does not affect ordinary browsers.

Independent tool; not affiliated with Epic Games.
