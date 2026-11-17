# Approved Lime Signature homepage artwork

The owner selected the Lime Signature refinement on 17 November 2026: graphite silo P, mixer R and compressor U combined with lime conventional letters. Keep the equipment-letter designs and colour balance faithful to that approved artwork. It is an imaginative brand illustration, not a photograph of offered equipment.

The selected full artwork is preserved at `output/product-alphabet-refinements/04-lime-signature.png`. Optimized 800px, 1400px and 1774px WebP versions live in `public/images/brand/pressure-lime-*.webp`. They retain the original composition and colour, with no generative reconstruction of the lettering. The 1774px version is approximately 83 KB.

The original includes a concept label above the word and a raster slogan below. `Home.astro` and `.pressure-heading-art` frame only the word using an aspect ratio of 1774/550 and a vertical offset of -155/550. A narrow edge mask blends the original dark background with the hero, without obscuring the letters. Never crop any machine detail or the final E. Keep these framing rules proportional at every viewport.

The visible slogan remains normal HTML, from `src/data/brand.json`, with no duplicate raster slogan. The semantic H1 is localized PRESSURE / BASINÇ, while the approved English artwork stays identical in both locales. The image has an empty alternative because the containing heading already supplies its meaning. Forced-colours mode replaces the illustration with visible localized heading text. No JavaScript is needed to show it.

The large circular emblem is removed from the homepage hero to give the alphabet full width. The existing vector motif remains in the intro. Other page templates retain their existing titles.

## Mechanical entrance

`PressureWordmark.astro` retains the same base image and adds a decorative SVG overlay. Source-image patches animate the compressor heads inside their openings, inset vanes suggest the mixer turning, and a short lime pressure trace and discharge pulse connect the motif. The complete word compresses slightly before releasing and settling; a masked highlight passes once over the bright letter surfaces. No real pressure reading or functional engineering sequence is implied.

`pressure-motion.ts` uses a finite 3.8-second native animation, starting only after the intro is hidden, the image decoded and the illustration visible. Replay is explicit through the bilingual button. Leaving view, switching away, enabling reduced motion or restoring browser history cancels motion and restores the exact still. Reduced motion and high contrast suppress playback; no JavaScript still shows the base artwork. The replay control has reserved space so initialization does not move the controls. No additional raster downloads, videos, services or animation dependencies are introduced.

The image-generation skill was used to explore and refine the artwork. A transparent extraction was evaluated but not adopted; web assets are optimized from the approved original to preserve its edge quality and letterforms. Prompt sets for the chosen image remain in `output/product-alphabet-refinements/PROMPTS.md`.

Recreate the responsive encodings with `node scripts/prepare-pressure-artwork.mjs "path/to/approved.png"`. The script checks the original dimensions, changes encoding and size only, and adds no dependency to the regular build. Keep the ignored `output/` design archive separately backed up; only the three approved WebP encodings ship with the website.
