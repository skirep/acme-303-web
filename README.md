# 303 / ACME — Web reconstruction

**Live:** https://skirep.github.io/acme-303-web/

A native, real-time **Three.js / WebGL 2** reconstruction of **303 by ACME (1997)**. No recorded demo video is used as the renderer.

## Run

Run `npm run dev` (Python 3 required), then open http://localhost:8000. No npm dependencies or build step. A low-resolution Canvas 2D fallback is available when WebGL cannot initialize, including software projection of the Three.js meshes. All runtime assets, including Three.js 0.180.0, are local. GitHub Pages serves the repository root from `main`.

Press **Iniciar demo** to unlock browser audio. Space pauses; left/right seek five seconds; M mutes; F enters fullscreen. Chapters allow seeking. Resolution can be changed while running. Mobile touch controls are provided below the 4:3 canvas.

## What is reconstructed

Seventeen scheduled sections covering the 244.97-second timeline: tunnel, kaleidoscope, stripe distortion, window warp, radial feedback, line effect, credits, portraits, grid zoom, type collage, textured tunnel, shaded spiked mesh, marching-cubes metaballs, portrait reprise and finale. GLSL shaders calculate texture-coordinate distortion each frame; Three.js animates geometry and lighting; the audio playhead is the master clock, keeping pause and seek synchronized.

Original indexed images were extracted from `MUSTARD.PAK` using the supplied MSB-first LZW decoder, then converted to PNG. The original `GARLIC.PAK` PTM tracker, with restored MPEG vocal samples from `KETCHUP.PAK`, was rendered with FFmpeg/libopenmpt to Ogg Vorbis. No new music was substituted.

## Fidelity and limitations

This is an **unofficial reconstruction, not a frame-exact port**. Scene timings, camera paths, geometry and transitions are approximations. All four original custom compressed clips (HARL, VS, ALEX, PARANOID) are decoded by executing the isolated original image codec with Unicorn, then transcoded to browser-compatible H.264. HARL runs at 70/6 fps; the other clips at 70/8 fps. Video playback follows the audio clock, including pause and seeking. The overall visual scene schedule remains a reconstruction. The MPEG vocal stream is decoded to signed 8-bit PCM, partitioned into the original 43 PTM sample slots (48–90), delta-encoded, and rendered with the tracker. Vocal notes, volumes and timing therefore follow the module rather than a guessed offset. There is no original source tree in the distribution. These limitations are visible in the app credits, not hidden behind a claim of an exact remake.

## Credits and rights

Original production: **ACME**, X'97 PC demo. **Statix** (code), **Aap** (design/graphics), **Vic** (music), **Harlequin** (breakdance), with further contributors in `reference/303.NFO`. Original imagery and music remain their authors' work; no ownership or permissive license for these assets is claimed. Three.js is MIT; see `vendor/THREE-LICENSE.txt`. This repository does not relicense the original production.

- [User's video reference](https://youtu.be/DPxsUberSwc)
- [Original distribution at scene.org](https://files.scene.org/view/demos/groups/acme/demos/acme_303.zip)
- [Production record](https://demozoo.org/productions/62/)

## Development

`npm test` checks complete timeline coverage and every seek boundary. `npm run check` checks JavaScript syntax. `tools/extract.py MUSTARD.PAK output-directory` reproduces raw resource extraction. `tools/prepare_assets.py original-directory assets` converts palette images and renders the tracker (requires Pillow and FFmpeg with libopenmpt). `tools/restore_audio.py original-directory assets` restores the complete sung soundtrack; `tools/restore_video.py original-directory assets` recovers the four video streams (requires Unicorn, numpy, Pillow and FFmpeg). `tools/decoder303.py` loads and relocates the original 32-bit LE image and executes only its image conversion routines with stubbed allocation and no operating-system access. The original archive is retained under `reference` for provenance.
