export type Locale = 'en' | 'tr';
export type Localized<T = string> = Record<Locale, T>;
export type Status = 'available' | 'reserved' | 'sold';
export interface Category {
  id: string;
  slug: Localized;
  name: Localized;
  description: Localized;
  icon: string;
}
export interface Brand {
  id: string;
  name: string;
  verified: boolean;
  description: Localized;
}
export interface Machine {
  id: string;
  slug: Localized;
  name: Localized;
  model: string;
  brandId?: string;
  categoryId: string;
  kind: 'new' | 'used';
  status: Status;
  year?: number;
  hours?: number;
  summary: Localized;
  description: Localized;
  condition?: Localized;
  applications: Localized<string[]>;
  specs: { label: Localized; value: string }[];
  images: { src: string; alt: Localized; illustrative: boolean }[];
  brochure?: { url: string; label: Localized };
  source: string;
  sample: boolean;
  published: Locale[];
}
export interface Article {
  id: string;
  slug: Localized;
  title: Localized;
  excerpt: Localized;
  tag: Localized;
  image: string;
  categoryId: string;
  minutes: number;
  sections: { heading: Localized; text: Localized }[];
  sources: { title: string; url: string }[];
  author?: string;
  reviewedAt?: string;
  sample: boolean;
  published: Locale[];
}
export interface Settings {
  name: string;
  legalName?: string;
  identityVerified: boolean;
  city: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  turnstileSiteKey?: string;
  privacyReviewed: boolean;
  about?: Localized;
  privacyNotice?: Localized;
  heroImage?: { src: string; alt: Localized; illustrative: boolean };
}
export interface Content {
  settings: Settings;
  categories: Category[];
  brands: Brand[];
  machines: Machine[];
  articles: Article[];
}
