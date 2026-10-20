# Preview image sources

All equipment images are illustrative. None represents verified stock, a supplied product or a dealership relationship. Replace them with approved photographs before launch.

- `excavator.jpg`: Unsplash photograph, https://images.unsplash.com/photo-1580901368919-7738efb0f87e. Used under the Unsplash license: https://unsplash.com/license.
- `loader.jpg`: Pexels, Heavy Duty Wheel Loader at Construction Site: https://www.pexels.com/photo/heavy-duty-wheel-loader-at-construction-site-28753112/. Pexels license: https://www.pexels.com/license/.
- `lifting.jpg`: Frames For Your Heart, Unsplash: https://unsplash.com/photos/yellow-crane-near-building-during-daytime-VoI2jd75M6Q. Unsplash license.
- `site.jpg`: Unsplash, https://images.unsplash.com/photo-1504307651254-35680f356dfd. Unsplash license.
- `road.svg`, `attachment.svg`: original technical illustrations for this project, explicitly labelled illustrations.

Fonts are self-hosted via Fontsource with their package license files. No external font request is made by visitors.

## Machine Theatre homepage artwork

The user selected the second generated homepage proposal on 2026-10-20. `public/images/theatre/*.webp` are original illustrative assets created using the built-in ImageGen tool and optimized locally for delivery. They depict no verified stock or dealership relationship. The stage and category images are decorative; the visible caption and preview notice identify illustrative equipment. None supplies technical product facts.

Prompt set (reference: the selected second homepage mockup):

- `stage`: unbranded yellow tracked excavator and wheel loader on folded steel plinths, dark graphite studio, vertical steel blades, theatrical lighting, dark upper/left negative space, no text/logos/arrows
- `stage-mobile`: the same steel-stage scene recomposed vertically, both machines visible, empty dark upper area, no text/logos/arrows
- `category-excavators`, `category-loaders`, `category-road`, `category-lifting`, `category-attachments`: separate three-quarter white-studio product shots of a tracked excavator, wheel loader, tandem roller, telescopic handler and hydraulic grapple; full objects, warm yellow paint and graphite mechanics, natural contact shadows, no text/logos/UI
- `detail-new`: sunlit yellow excavator boom pivot, polished hydraulic ram and hoses, blue sky, tight crop
- `detail-used`: dusty loader tyre, rugged tread, worn yellow hub and fender, dramatic natural light

Original PNG copies are retained in `.local/theatre-originals/` during development; optimized WebP files are the maintained website assets. Replace or approve illustrative artwork before public launch. Company-supplied hero photography in site settings takes precedence over the generated stage.

### Title fidelity correction

- `title-metal.webp`: built-in ImageGen material map matching the prototype headline, with fine brushed silver grain and a soft vertical falloff; no letters or UI in the asset. It is clipped into actual Anton HTML text. Prompt: flat face-on brushed silver metal, softly luminous upper edge, middle silver, graphite-silver lower region, restrained grain and micro-pitting, no seams, objects, lettering, hard glints or large scratches.
- `stage-foreground-v2.webp`: original scene RGB combined with a cleaned alpha mask extracted using built-in ImageGen. Prompt: remove only the empty dark backdrop, retain exactly positioned machines, steel plinths, floor and vertical blades, genuine transparency, clean antialiased silhouettes, no recomposition or new objects. Using original RGB prevents coloured extraction halos. The title is a separate HTML layer behind this foreground.
- Anton is self-hosted from `@fontsource/anton`, including Latin and Latin Extended, under its OFL-1.1 licence. It is used by the homepage and approved interior display typography. Font source: https://fontsource.org/fonts/anton.

## Steel interior implementation

`public/images/steel/*.webp` were generated with the built-in ImageGen tool from the approved screen references. They are illustrative, unbranded machinery and architectural steel; no generated image establishes stock, manufacturer specifications or a company claim. Image generation was used only for artwork. All text, controls, tables and navigation are native HTML.

- `header-bucket`, `header-contact`: photographic yellow excavator bucket/coupler against folded steel, dark negative space at left for the native title; no text, logos, controls or arrows
- `header-hydraulics`: close yellow excavator hydraulic ram and hoses, dark left negative space
- `header-panels`: diagonal brushed steel panels, subdued directional light, no machine or text
- `product-stage`, `not-found-stage`: angular steel plinths and vertical blades in a graphite studio; the recovery stage includes a yellow bucket at right and free left space
- `new-excavator`, `used-loader`, `category-excavator`: separate yellow machines on a steel plinth with genuine alpha, matched views for product/category composition
- `catalogue-excavator`, `catalogue-loader`, `catalogue-road`, `catalogue-lifting`, `catalogue-attachments`: matching industrial-yard photographs of the relevant machine category
- `guide-tracks`, `guide-engine`, `guide-attachments`: editorial closeups of tracks/bucket, engine and compatible attachment subjects
- `callout-tracks`, `callout-bucket`: wide steel/track and bucket photography with dark text space at left

Optimized WebP assets are maintained in public. Larger original PNGs are retained privately under `.local/steel-originals/`, outside the shipped site. The two catalogue control icons come from `@phosphor-icons/core` (regular magnifying-glass and faders-horizontal); their MIT license is included at `public/licenses/phosphor-icons.txt`. No icon font or external font service is loaded.
