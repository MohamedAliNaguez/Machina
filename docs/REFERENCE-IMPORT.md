# Catalogue presentation and private source archive

The website presents TECHNICSAN exclusively. Company labels, supplier credits, external supplier links, manufacturer brochures and the public source panel have been removed. Product references and technical values remain factual; the site does not claim TECHNICSAN manufactured the listed equipment.

The 155 product entries remain in exactly five categories: 1 Cement bulker, 136 LPG catalogue systems/components, 4 compressors, 6 mixer families and 8 silo listings.

## Public content

- Edit `src/data/catalogue-products.json` for the current repository catalogue. Maintain stable neutral IDs, bilingual slugs, genuine model references and category IDs.
- 80 inspected images are retained without altering their pixels. Images with visible supplier/manufacturer branding or uncertain markings are withheld; 76 entries use labelled TECHNICSAN photography placeholders. Both drawing images are marked illustrative.
- Neutral image paths live under `public/images/products/catalogue/`. Company names are absent from public product text, descriptions, alternative text, search attributes, metadata, brochure destinations and current product URLs.
- `src/data/catalogue-redirects.json` holds technical aliases for previous URLs. These issue permanent redirects to the matching neutral product pages. Old supplier identifiers are not displayed on current pages or exposed in current enquiry selections.
- Technical review and image-reuse approvals remain pending. Removal of displayed credits does not grant reuse rights or validate specifications. The existing production checks still block unapproved material.

## Private preservation

Original records, source documents, photo credits, external brochure links and the presentation mapping are retained under `.local/catalogue-provenance/`. Original image pixels are preserved there. This ignored directory is excluded from version control and the static website output. Keep a separate private backup before moving the project to another machine.

The earlier import notes and exception log are also archived there, including source-data inconsistencies and missing source images. The public presentation no longer depends on these private records to build.

Replace placeholders with approved unbranded photographs of the exact product. Do not reuse a photograph of another model or add claims of TECHNICSAN manufacture. Verify technical facts, permissions, configuration and supply before changing `sample`, `technicalReview` or image `rightsStatus` to an approved state.

`node scripts/prepare-reference-images.mjs` rebuilds optimized originals into the private archive only. It never publishes supplier-branded source artwork to the public image directory.
