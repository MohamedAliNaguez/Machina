# Local 3D product trial

The owner supplied two branded cement-bulker references. One Meshy image-to-3D trial was generated from the three-quarter view after the owner chose the existing plugin connection instead of the separate two-photo sign-in.

- Resource: `image-to-3d`
- Task: `01a1f38c-3835-7308-be31-3969c17ac464`
- Status: succeeded; an in-app Meshy 3D preview and rendered thumbnail are available.
- Model export: the connection returned no downloadable formats for this specific result. No GLB has been downloaded. Do not treat the encrypted Meshy preview as a GLB or try to convert it.
- Credit estimate: 30. The observed account balance changed from 100 to 75; the tool did not expose an itemised `consumed_credits` charge.

The local files, reference copies and nonsecret task trail live in the ignored `meshy_output/cement-bulker/` directory. This folder must stay out of the public repository and build. No generated product geometry is approved for publication.

## Independently authored alternative

The owner confirmed that no Meshy download or manufacturer 3D model was available. `scripts/build-bulker-prototype.mjs` therefore builds a separate, procedural approximation from the supplied photographs using Three.js geometry and the approved logo SVG. It does not extract, decrypt, convert or reuse Meshy's model or preview data. No further Meshy credits are used.

The resulting `meshy_output/cement-bulker/technicsan-cement-bulker.glb` is a locally authored visual prototype. Its arbitrary modelling units are not measured dimensions. Tank form, chassis, axles, hoses and fittings require product review. It is independent of the Meshy task record above.

**Review outcome:** the owner rejected this procedural prototype because its realism does not serve the catalogue. It was removed from the active viewer and preserved as `rejected-authored-prototype.glb`. Do not re-enable or publish it. A realistic asset or a properly captured photographic rotation is required; no further Meshy generation has been authorised.

## Viewer preparation

Run the local development server and open `/design/product-3d/`. The local trial uses `Product3DViewer.astro` and Google's `@google/model-viewer`. With the independently authored GLB present, **Explore in 3D** activates the model. Without it, the reference photo remains and **3D model file required** is shown.

Once an approved, exportable model is available, place it at `meshy_output/cement-bulker/technicsan-cement-bulker.glb` and reload the local trial. The component loads its viewer library and model only after **Explore in 3D** is pressed. Controls provide orbit/zoom, reset, optional rotation, light/dark backgrounds and fullscreen. The reset stops automatic rotation. Failed loading retains the reference image and offers a retry.

The Vite development middleware serves only three allowlisted files at `/__product-3d/`; it cannot read arbitrary paths or task metadata. The dynamic design page has no production paths, and the middleware applies only to the development server. The normal site and product catalogue are unchanged.

## Review before catalogue integration

The generated render broadly resembles the tank, three-axle chassis, blue hose and branded livery. Fine equipment details and lettering are soft; the render cannot verify hidden surfaces, accurate dimensions, topology or actual face count. Review the exported model against real product photographs or supplier CAD. Preserve the approved vector identity for any final logo/decal work, and confirm the model's licence before publishing it.

After review, an approved GLB can be integrated into the actual cement-bulker product page with a photograph fallback. A manufacturer-provided CAD-derived model is preferable where dimensional and equipment accuracy matter. Meshy does not provide a verified engineering model from these photos.
