import { productTypeIds } from '../data/product-types';
export type Interaction =
  | 'enquiry_success'
  | 'phone_click'
  | 'whatsapp_click'
  | 'email_click'
  | 'brochure_click'
  | 'page_view';
export function measurementPayload(language: string, path: string, family?: string) {
  return {
    language: language === 'tr' ? 'tr' : 'en',
    page_path: path.split(/[?#]/)[0],
    ...(family && productTypeIds.includes(family) ? { product_family: family } : {}),
  };
}
