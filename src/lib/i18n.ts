import type { Locale } from './types';
import { withBase } from './paths';
export const locales: Locale[] = ['tr', 'en'];
export const otherLocale = (locale: Locale): Locale => (locale === 'tr' ? 'en' : 'tr');
export const l = <T>(locale: Locale, tr: T, en: T): T => (locale === 'tr' ? tr : en);
export const paths = {
  machines: { tr: 'urunler', en: 'products' },
  categories: { tr: 'kategoriler', en: 'categories' },
  brands: { tr: 'markalar', en: 'brands' },
  guides: { tr: 'rehberler', en: 'guides' },
  about: { tr: 'hakkimizda', en: 'about' },
  contact: { tr: 'iletisim', en: 'contact' },
  privacy: { tr: 'gizlilik', en: 'privacy' },
} as const;
export type Section = keyof typeof paths;
export function url(locale: Locale, section?: Section, slug?: string) {
  return withBase(
    `/${locale}/${section ? `${paths[section][locale]}/` : ''}${slug ? `${slug}/` : ''}`,
  );
}
export const formatNumber = (value: number, locale: Locale) =>
  new Intl.NumberFormat(locale === 'tr' ? 'tr-TR' : 'en-GB').format(value);
export const labels = (locale: Locale) => ({
  machines: l(locale, 'Ürünler', 'Products'),
  brands: l(locale, 'Markalar', 'Brands'),
  guides: l(locale, 'Rehberler', 'Guides'),
  about: l(locale, 'Hakkımızda', 'About'),
  contact: l(locale, 'İletişim', 'Contact'),
  quote: l(locale, 'Teklif isteyin', 'Request a quote'),
  explore: l(locale, 'Ürünleri keşfedin', 'Explore products'),
  new: l(locale, 'Ürün', 'Product'),
  used: l(locale, 'İkinci el ürün', 'Used product'),
  available: l(locale, 'Satışa açık', 'Available'),
  reserved: l(locale, 'Rezerve', 'Reserved'),
  sold: l(locale, 'Satıldı', 'Sold'),
  sample: l(locale, 'İçerik önizlemesi', 'Content preview'),
  details: l(locale, 'Ürünü inceleyin', 'View product'),
  all: l(locale, 'Tüm ürünler', 'All products'),
  home: l(locale, 'Ana sayfa', 'Home'),
});
