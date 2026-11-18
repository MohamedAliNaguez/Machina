# TECHNICSAN identity

The owner approved the refined vector redraw on 18 November 2026 as the identity reference for the whole project. **`docs/brand/technicsan-master.svg` is the authoritative editable master.** The fixed signature is **OUR PRESSURE. YOUR TREASURE.**

- Forest green: `#003B27`
- Lime: `#9BC900`
- White: `#FFFFFF`
- Light logo: `#F2F5F0`

The master contains editable emblem and custom wordmark layers, individual letter paths and the approved outlined slogan. Use the exact geometry; do not substitute a similar font, retrace the old JPEG or apply automatic smoothing.

`Brand.astro` uses the generated full and light lockups in `public/brand/`. Compact and standalone wordmark variants, the favicon, social image and `src/data/brand-symbol.json` all derive from the same master. The pressure-ring motif uses that shared emblem geometry. Website crops preserve component dimensions; the master includes clear space.

After approved edits in the master, run:

```sh
node scripts/prepare-brand.mjs
```

Raster arguments are rejected. The old JPEG, tracing exports and slogan-preparation workflow are historical references. Slogan changes require updating the master and `src/data/brand.json` together. Keep the English slogan in both language versions and preserve its punctuation. Use the light lockup on dark surfaces, and compact/emblem variants where the slogan cannot remain legible.

The refined export pack in `output/technicsan-logo-refined/` is a delivery copy. The tracked master above is the project source of truth. Website typefaces and the artistic PRESSURE headline remain separate from the custom logo lettering.

This identity update does not approve product data, company/contact details or public indexing. See `DESIGN.md` for site design rules.
