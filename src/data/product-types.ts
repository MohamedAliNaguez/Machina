import type { Category, Localized } from '../lib/types';

const t = <T>(tr: T, en: T): Localized<T> => ({ tr, en });

// The five approved product families, in the owner's requested order.
export const productTypes: Category[] = [
  {
    id: 'cement-bulker',
    slug: t('cimento-silobasi', 'cement-bulker'),
    name: t('Çimento silobası', 'Cement bulker'),
    description: t(
      'Dökme çimento taşıma ve boşaltma ekipmanı',
      'Bulk cement transport and discharge equipment',
    ),
    icon: 'cement-bulker',
    requirements: t(
      [
        'Taşınacak malzeme',
        'Gerekli kapasite',
        'Boşaltma sistemi',
        'Çalışma basıncı ve bağlantılar',
      ],
      [
        'Material to be transported',
        'Required capacity',
        'Discharge system',
        'Working pressure and connections',
      ],
    ),
  },
  {
    id: 'lpg-catalog',
    slug: t('lpg-katalogu', 'lpg-catalog'),
    name: t('LPG kataloğu', 'LPG catalog'),
    description: t(
      'LPG ürünleri ve uygulamaya uygun konfigürasyonlar',
      'LPG equipment and application-specific configurations',
    ),
    icon: 'lpg-catalog',
    requirements: t(
      ['Amaçlanan uygulama', 'Ürün konfigürasyonu', 'Gerekli kapasite', 'Onaylı teknik belgeler'],
      [
        'Intended application',
        'Product configuration',
        'Required capacity',
        'Approved technical documentation',
      ],
    ),
  },
  {
    id: 'compressors',
    slug: t('kompresorler', 'compressors'),
    name: t('Kompresörler', 'Compressors'),
    description: t(
      'Uygulamanız için basınçlı hava ekipmanı',
      'Compressed-air equipment for your application',
    ),
    icon: 'compressors',
    requirements: t(
      [
        'Gerekli çalışma basıncı',
        'Hava debisi ihtiyacı',
        'Tahrik sistemi',
        'Güç kaynağı ve kullanım koşulları',
      ],
      [
        'Required working pressure',
        'Air delivery requirements',
        'Drive system',
        'Power supply and operating conditions',
      ],
    ),
  },
  {
    id: 'mixers',
    slug: t('mikserler', 'mixers'),
    name: t('Mikserler', 'Mixers'),
    description: t(
      'Malzemeye ve prosese uygun karıştırma ekipmanı',
      'Mixing equipment matched to the material and process',
    ),
    icon: 'mixers',
    requirements: t(
      [
        'Karıştırılacak malzeme',
        'Gerekli karıştırma kapasitesi',
        'Karıştırma sistemi',
        'Tahrik ve kontrol gereksinimleri',
      ],
      [
        'Material to be mixed',
        'Required mixing capacity',
        'Mixing system',
        'Drive and control requirements',
      ],
    ),
  },
  {
    id: 'silos',
    slug: t('silolar', 'silos'),
    name: t('Silolar', 'Silos'),
    description: t(
      'Malzeme depolama, yükleme ve boşaltma ekipmanı',
      'Material storage, loading and discharge equipment',
    ),
    icon: 'silos',
    requirements: t(
      [
        'Depolanacak malzeme',
        'Gerekli depolama kapasitesi',
        'Yükleme ve boşaltma düzeni',
        'Kurulum alanı ve saha yerleşimi',
      ],
      [
        'Material to be stored',
        'Required storage capacity',
        'Loading and discharge arrangement',
        'Installation space and site layout',
      ],
    ),
  },
];

export const productTypeIds = productTypes.map((type) => type.id);
