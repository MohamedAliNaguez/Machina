export type Locale = 'en' | 'tr';
export type Localized<T = string> = Record<Locale, T>;
export type Status = 'available' | 'reserved' | 'sold';
export interface SeoFields {
  seoTitle?: Partial<Localized>;
  seoDescription?: Partial<Localized>;
  seoApproval?: Partial<Localized<'pending' | 'approved'>>;
}
export interface EditorialSection {
  heading: Localized;
  text: Localized;
}
export interface Category extends SeoFields {
  id: string;
  slug: Localized;
  name: Localized;
  description: Localized;
  icon: string;
  requirements?: Localized<string[]>;
  published?: Locale[];
  editorial?: {
    heading: Localized;
    overview: Localized;
    sections: EditorialSection[];
    questions: { question: Localized; answer: Localized }[];
    evidence?: Partial<Localized>;
  };
}
export interface Brand {
  id: string;
  name: string;
  verified: boolean;
  description: Localized;
}
export interface Machine extends SeoFields {
  catalogueOrder?: number;
  id: string;
  slug: Localized;
  name: Localized;
  model: string;
  modelVerified?: boolean;
  sku?: string;
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
  images: {
    src: string;
    alt: Localized;
    illustrative: boolean;
    placeholder?: boolean;
    sourceUrl?: string;
    credit?: string;
    rightsStatus?: 'pending' | 'approved';
  }[];
  reference?: {
    publisher: string;
    url: string;
    retrievedAt: string;
    reviewStatus: 'pending' | 'approved';
    notes?: Localized;
    section?: string;
    originalLabel?: string;
  };
  specificationTable?: {
    columns: string[];
    rows: { label: Localized; values: string[] }[];
  };
  brochure?: { url: string; label: Localized };
  source: string;
  sample: boolean;
  technicalReview?: 'pending' | 'approved';
  published: Locale[];
}
export interface Article extends SeoFields {
  relatedProductIds?: string[];
  id: string;
  slug: Localized;
  title: Localized;
  excerpt: Localized;
  tag: Localized;
  image: string;
  imageAlt?: Partial<Localized>;
  categoryId: string;
  minutes: number;
  sections: {
    heading: Localized;
    text: Localized;
    blocks?: import('./guides').GuideBlock[];
    tool?: import('./procurement').GuideTool;
  }[];
  sources: { title: string; url: string }[];
  author?: string;
  reviewer?: string;
  reviewedAt?: string;
  publishedAt?: string;
  sample: boolean;
  published: Locale[];
}
export interface Settings {
  searchReleaseMode?: 'brand-only' | 'company';
  featuredGuideId?: string;
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
  manufacturerVerified?: boolean;
  historyApproved?: boolean;
  pageSeo?: Partial<Record<'home' | 'about' | 'contact', SeoFields>>;
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
