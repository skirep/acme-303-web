# 303 / ACME — Web reconstruction

**Live:** https://skirep.github.io/acme-303-web/

A native, real-time **Three.js / WebGL 2** reconstruction of **303 by ACME (1997)**. No recorded demo video is used as the renderer.

## Run

Run `npm run dev` (Python 3 required), then open http://localhost:8000. No npm dependencies or build step. A low-resolution Canvas 2D fallback is available when WebGL cannot initialize, including software projection of the Three.js meshes. All runtime assets, including Three.js 0.180.0, are local. GitHub Pages serves the repository root from `main`.

Press **Iniciar demo** to unlock browser audio. Space pauses; left/right seek five seconds; M mutes; F enters fullscreen. Chapters allow seeking. Resolution can be changed while running. Mobile touch controls are provided below the 4:3 canvas.

## What is reconstructed

Fifteen scheduled sections covering the 244.87-second tracker: tunnel, kaleidoscope, stripe distortion, window warp, radial feedback, line effect, credits, portraits, grid zoom, type collage, textured tunnel, shaded spiked mesh, marching-cubes metaballs, portrait reprise and finale. GLSL shaders calculate texture-coordinate distortion each frame; Three.js animates geometry and lighting; the audio playhead is the master clock, keeping pause and seek synchronized.

Original indexed images were extracted from `MUSTARD.PAK` using the supplied MSB-first LZW decoder, then converted to PNG. The original `GARLIC.PAK` PTM tracker was rendered with FFmpeg/libopenmpt to Ogg Vorbis. No new music was substituted.

## Fidelity and limitations

This is an **unofficial reconstruction, not a frame-exact port**. Scene timings, camera paths, geometry and transitions are approximations. The original custom compressed moving footage is not decoded: portrait and collage sections substitute still original graphics. The tracker plays instrumentally; the separate MPEG vocal stream is not synchronized or played. There is no original source tree in the distribution. These limitations are visible in the app credits, not hidden behind a claim of an exact remake.

## Credits and rights

Original production: **ACME**, X'97 PC demo. **Statix** (code), **Aap** (design/graphics), **Vic** (music), **Harlequin** (breakdance), with further contributors in `reference/303.NFO`. Original imagery and music remain their authors' work; no ownership or permissive license for these assets is claimed. Three.js is MIT; see `vendor/THREE-LICENSE.txt`. This repository does not relicense the original production.

- [User's video reference](https://youtu.be/DPxsUberSwc)
- [Original distribution at scene.org](https://files.scene.org/view/demos/groups/acme/demos/acme_303.zip)
- [Production record](https://demozoo.org/productions/62/)

## Development

`npm test` checks complete timeline coverage and every seek boundary. `npm run check` checks JavaScript syntax. `tools/extract.py MUSTARD.PAK output-directory` reproduces raw resource extraction. `tools/prepare_assets.py original-directory assets` converts palette images and renders the tracker (requires Pillow and FFmpeg with libopenmpt). The original archive is retained under `reference` for provenance.
