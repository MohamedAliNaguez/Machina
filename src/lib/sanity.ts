import config from '../data/sanity.json';

export const sanityConfig = config;
export const sanityContentQuery = `{
  "settings": *[_id == "siteSettings"][0]{..., "featuredGuideId": featuredGuide->id, "heroImage": heroImage{..., "src": asset->url}},
  "categories": *[_type == "category"],
  "brands": *[_type == "brand"],
  "machines": *[_type in ["newModel", "usedMachine"]]{..., "kind": select(_type == "newModel" => "new", "used"), "categoryId": category->id, "brandId": brand->id, "images": images[]{..., "src": asset->url}, "brochure": brochure{..., "url": asset->url}},
  "articles": *[_type == "article"]{..., "relatedProductIds": relatedProducts[]->id, "relatedGuideIds": relatedGuides[]->id, "sections": sections[]{..., "blocks": blocks[]{..., "image": image{..., "src": asset->url}}}, "categoryId": category->id, "imageAlt": image.alt, "image": image.asset->url}
}`;
