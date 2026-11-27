# Cement bulker unloading guide

The English guide is published in Sanity as `article-guide-cement-bulker-unloading` at `/en/guides/cement-bulker-unloading-compressor-selection/`. It uses the same ArticleDetail template and shared design as the existing buying guide.

- The supplied manuscript is preserved in `src/data/articles/cement-bulker-unloading.en.md`.
- All 13 numbered topics, the closing enquiry section, nine tables, eight FAQs and technical references are included.
- Three original figures are in `public/images/guides/`, with editable SVG, 2400 × 1600 PNG and optimized WebP versions. Published figure assets are also stored in Sanity.
- Regenerate the figures with `python scripts/draw-unloading-figures.py` in an environment containing matplotlib and Pillow. This does not update the published Sanity assets automatically.
- `src/data/cement-unloading.ts` converts the supplied manuscript into editable Sanity blocks. The restricted importer recognizes paragraphs, subheadings, lists, tables and the three figure markers; it is not a general Markdown renderer.
- `studio/unloading-guide-publish.ts` performs a one-time guarded publication. It refuses to overwrite an existing guide and saves a private backup before publication. Subsequent editorial changes belong in Sanity, rather than rerunning this importer.
- Heading and internal resource-link blocks, captions, sources and calculator selection are editable in Studio. The new fleet calculator is also available in the section tool menu.
- Shared category membership and explicit related-guide references connect relevant guides through “Continue reading”, including the silo capacity guide. Neither existing guide's original body is overwritten.

The new guide is English only. Its reserved Turkish slug is not published and does not appear as a translation alternate. No author, technical reviewer or review date was inferred. The actual first publication date is recorded, while SEO approval remains pending. The current brand-only release still indexes only Home and Contact in English and Turkish.

Examples are scenarios, not equipment guarantees. The fleet calculator distinguishes time-related value from recoverable benefit, handles zero benefit without an invented payback, and excludes financing, additional maintenance, energy differences and taxes. Calculator inputs stay in the browser and are not sent to analytics or the sales inbox.

Verification: unit tests cover manuscript completeness, scenario arithmetic and invalid inputs; browser tests cover figure delivery, navigation, reciprocal related-guide links, calculator interaction, mobile overflow and automated accessibility. Existing procurement-tool browser tests also run to check shared behavior.
