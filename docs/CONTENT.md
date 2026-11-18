# Content and launch requirements

## Approved product scope

TECHNICSAN has exactly five product types, in this order:

| Stable ID     | English       | Turkish          | English product route       |
| ------------- | ------------- | ---------------- | --------------------------- |
| cement-bulker | Cement bulker | Çimento silobası | /en/products/cement-bulker/ |
| lpg-catalog   | LPG catalog   | LPG kataloğu     | /en/products/lpg-catalog/   |
| compressors   | Compressors   | Kompresörler     | /en/products/compressors/   |
| mixers        | Mixers        | Mikserler        | /en/products/mixers/        |
| silos         | Silos         | Silolar          | /en/products/silos/         |

`src/data/product-types.ts` owns these types and their buyer-requirement prompts. Content validation rejects a sixth or missing type. Sanity's category picker uses the same approved IDs. The reference catalogue contains 155 imported entries in `src/data/catalogue-products.json`. Original source publishers, URLs, retrieval dates and image credits are retained privately under `.local/catalogue-provenance/`. The public catalogue uses neutral product URLs and image filenames. These are manufacturer-reference entries, not confirmed TECHNICSAN stock listings. See REFERENCE-IMPORT.md for import coverage and exceptions. The English label **LPG catalog** is retained exactly as requested by the owner.

## Approve imported products and replace source photographs

For each actual product, supply its approved bilingual name, genuine model reference, one of the five category references, current model photographs, bilingual image descriptions, private source reference, applications, verified specifications and a brochure if approved for public use. Document image rights and whether a photograph shows the exact product or an illustrative configuration.

Replace `images` with the approved files or Sanity image assets. Set `placeholder: false`; set `illustrative: false` only for genuine approved product photography. Product galleries render from the image array. Do not substitute old excavator/loader images or generated product renderings for real photos.

Only publish technical details supported by the actual model documentation. Relevant fields can include pressure, capacity, dimensions, material, drive and interfaces, depending on the product. Do not assume every mixer or silo is pressurised. The requirement prompts are enquiry questions, not specifications or engineering instructions. Leave specifications empty in labelled previews rather than inventing numbers. Verified product records must include real specifications.

Product and category pages use `/en/products/`, `/tr/urunler/`, `/en/categories/` and `/tr/kategoriler/`. General catalogue filters use product type and text search. The former construction categories and new/used split are retired. Do not redirect former excavator pages to unrelated pressure products.

## Ownership and editorial review

The TECHNICSAN name/logo, Ankara location and five product types were supplied by the owner. The owner also supplied **+90 532 712 24 17** for phone/WhatsApp and **info@technicsan.com** for email on 18 November 2026. These public contact references live in `src/data/contact.json` and populate the preview settings. Shared contact links appear on every page and on the contact screen; product-page email and WhatsApp links include the translated product name and its page URL. When using Sanity content, enter the same references in Company & launch settings. This does not configure email delivery or enable the hosted preview form.

Legal company details, exact address, represented brands, certifications, history, customer names and business claims remain unverified. Do not infer these from reference sites.

The three buyer guides are labelled drafts about preparing enquiries, compressor requirements, and storage/mixing requirements. They do not contain operating pressures, safety procedures or technical settings. Before publication, add the actual author/reviewer, review date and sources supporting any technical claims. Review Turkish and English terminology and image rights. Do not invent reviews, prices or endorsements.

## Search and publishing

Keep both language journeys complete, with reciprocal alternates, truthful descriptions, internal links and canonical URLs. Category pages own product-family intent; actual model pages own model intent. Filter combinations remain `noindex`. Unverified reference pages do not emit Product schema or prices; genuine verified products may emit truthful Product metadata.

The pressure-centred brand hero uses abstract artwork, not a product photograph or a technical instrument reading. Public launch requires verified identity/contact/privacy copy, actual product content and photographs, working enquiry storage/notifications, challenge keys and the approved production domain. `noindex` is not access control. Authentication is required for private editorial drafts.

The existing enquiry storage/API field `machineId` remains a compatibility detail. Visitor links use the `product` query parameter; legacy `machine` parameters are accepted. Never send personal form values to analytics.

# Temporary original-source review

During local development, each imported product detail page has an **Open original source page** link (Turkish: **Orijinal kaynak sayfasını aç**). It opens a new tab and shows the original model/part label, plus the catalogue entry number when available. Some parts and capacity groups share a source page; use that label to locate the matching entry.

`src/lib/source-review.ts` joins the neutral product ID to the original source using the ignored `.local/catalogue-provenance/presentation-map.json` and `reference-products.json` records. All 155 imported products have saved links. This is an editorial aid only: it does not modify source information or grant image-reuse rights.

The panel is automatically excluded from every production build (`import.meta.env.DEV`), including GitHub Pages. Source URLs and private provenance are not copied back into the public content dataset. Missing private files simply hide the local panel. Remove the ProductDetail panel and `getSourceReview` call when the review is finished.
