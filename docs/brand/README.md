# TECHNICSAN identity

The owner supplied the TECHNICSAN logo on 17 November 2026. The fixed signature is **OUR PRESSURE. YOUR TREASURE.**. Full design rules and tokens are maintained in `DESIGN.md`.

- Forest green: `#003B27`
- Pressure lime: `#9BC900`
- White: `#FFFFFF`
- Pale steel: `#EDF1EE`
- Graphite: `#1E2D26`

`public/brand/technicsan.svg` preserves the supplied emblem and TECHNICSAN letterforms as traced vector paths, with the new approved slogan outlined below the wordmark. `technicsan-light.svg` is the reversed lockup for dark surfaces. `technicsan-wordmark-light.svg` isolates the lettering for the photographic opening animation. `technicsan-symbol.svg` and `public/favicon.svg` use the three-bar emblem. `technicsan-social.png` supplies a 1200 × 630 sharing image.

Use `src/components/Brand.astro` for the full lockup. Do not type the wordmark in a similar font, stretch it, or crop out part of the signature in the header. Keep the slogan in English in both website languages. The emblem's lime bar informs selected states and short diagonal rules; lime is not a body-text colour on white.

The official slogan is maintained in `src/data/brand.json` and stays in English on both language versions, including its two full stops. The slogan is outlined from Arial Bold for portable logo rendering; website display and body typography retain their existing fonts. Regenerate the outline with `scripts/prepare-slogan.ps1` on Windows after an approved wording change. Then regenerate both logo lockups, the standalone wordmark and the sharing image:

```sh
node scripts/prepare-brand.mjs path/to/approved-logo.jpg
```

This is a trace of the supplied raster, not a claim to be the original master artwork. A supplied official SVG can replace the matching exports in future. Rebranding leaves the inventory labelled as sample content and does not enable production indexing or verify company/legal details. Repository name and existing deployment URLs remain separate technical configuration.
