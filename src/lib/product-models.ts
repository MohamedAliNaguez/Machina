import type { Localized } from './types';

export interface ApprovedProductModel {
  approved: true;
  src: string;
  hotspots?: { position: string; normal: string; title: Localized; description: Localized }[];
}

// Add only reviewed, exportable GLB assets in public/models. The rejected trial is never used.
const models: Record<string, ApprovedProductModel> = {};

export function getProductModel(id: string): ApprovedProductModel | undefined {
  const model = models[id];
  return model?.approved && /^\/models\/[a-z\d/_-]+\.glb$/i.test(model.src) ? model : undefined;
}
