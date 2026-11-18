import type { Article, Content, Localized, Machine } from '../lib/types';
import catalogueProducts from './catalogue-products.json';
import { productTypes } from './product-types';
import contact from './contact.json';
const t = <T>(tr: T, en: T): Localized<T> => ({ tr, en });

// Imported manufacturer references stay unverified until supply, facts and reuse rights are approved.
// These are source products, never represented as TECHNICSAN-manufactured equipment or confirmed stock.
const machines = catalogueProducts as Machine[];

const articles: Article[] = [
  {
    id: 'product-enquiry',
    slug: t('urun-talebinizi-hazirlayin', 'prepare-your-product-enquiry'),
    title: t('Ürün talebinizi hazırlayın', 'Prepare your product enquiry'),
    excerpt: t(
      'Uygulama, malzeme ve gerekli kapasiteyi ilk görüşmede netleştirin.',
      'Bring your application, material and required capacity to the first conversation.',
    ),
    tag: t('Satın alma notları', 'Buying notes'),
    image: '/images/products/cement-bulker-placeholder.svg',
    categoryId: 'cement-bulker',
    minutes: 3,
    sections: [
      {
        heading: t('Ürün grubuyla başlayın', 'Start with the product family'),
        text: t(
          'Çimento silobası, LPG kataloğu, kompresörler, mikserler veya silolar arasından ilgili grubu seçin. İhtiyaç duyduğunuz ekipmanın uygulamanızdaki rolünü kısaca anlatın.',
          'Choose Cement bulker, LPG catalog, Compressors, Mixers or Silos. Briefly describe how the equipment will fit into your application.',
        ),
      },
      {
        heading: t('Gereksinimleri paylaşın', 'Share the requirements'),
        text: t(
          'İşlenecek veya depolanacak malzemeyi, kapasite ihtiyacınızı ve varsa mevcut sistem bilgilerini paylaşın. İlgili olduğunda gerekli basınç koşullarını da görüşmeye ekleyin; bilinmeyen değerleri tahmin etmeyin.',
          'Describe the material, your capacity needs and any existing system interfaces. Include required pressure conditions where relevant; leave unknown values open for confirmation.',
        ),
      },
      {
        heading: t('Doğrulanmış ürün bilgilerini isteyin', 'Request verified product information'),
        text: t(
          'Teklif edilen modelin gerçek fotoğraflarını, güncel teknik belgelerini ve teklif kapsamını isteyin. Bu taslak, teknik seçim veya işletme talimatı değildir.',
          'Request actual photographs of the proposed model, current technical documentation and the scope of the quotation. This draft is a conversation guide, not a technical selection or operating instruction.',
        ),
      },
    ],
    sources: [],
    sample: true,
    published: ['tr', 'en'],
  },
  {
    id: 'compressor-brief',
    slug: t('kompresor-ihtiyacinizi-tanimlayin', 'define-your-compressor-requirements'),
    title: t('Kompresör ihtiyacınızı tanımlayın', 'Define your compressor requirements'),
    excerpt: t(
      'Gerekli çalışma basıncı, hava ihtiyacı ve güç kaynağını görüşmeye hazırlayın.',
      'Prepare your required working pressure, air demand and available power supply.',
    ),
    tag: t('Kompresörler', 'Compressors'),
    image: '/images/products/compressors-placeholder.svg',
    categoryId: 'compressors',
    minutes: 3,
    sections: [
      {
        heading: t('Uygulamanızı anlatın', 'Describe your application'),
        text: t(
          'Basınçlı havanın hangi süreçte kullanılacağını ve beklenen kullanım düzenini belirtin. Mevcut ekipman belgeleri, görüşmeye somut bir başlangıç sağlar.',
          'Explain where compressed air will be used and the expected usage pattern. Existing equipment documentation provides a concrete starting point for the discussion.',
        ),
      },
      {
        heading: t('Bilinen gereksinimleri bir araya getirin', 'Collect the known requirements'),
        text: t(
          'Varsa onaylı çalışma basıncı ve hava debisi gereksinimlerini, kullanılabilir güç kaynağını ve kurulum alanını paylaşın. Eksik bilgiler ürün değerlendirmesinde teyit edilmelidir.',
          'Share any approved working-pressure and air-delivery requirements, the available power supply and installation space. Missing information should be confirmed during the product assessment.',
        ),
      },
      {
        heading: t('Model belgeleriyle teyit edin', 'Confirm against model documentation'),
        text: t(
          'Ürünün uygunluğu, teklif edilen modelin belgeleri ve yetkin teknik değerlendirme ile teyit edilmelidir. Bu yazı, basınç ayarı veya işletme prosedürü sunmaz.',
          'Confirm suitability against the proposed model documentation and a qualified technical assessment. This article does not provide pressure settings or operating procedures.',
        ),
      },
    ],
    sources: [],
    sample: true,
    published: ['tr', 'en'],
  },
  {
    id: 'storage-mixing-brief',
    slug: t('depolama-ve-karistirma-ihtiyaclari', 'plan-storage-and-mixing-requirements'),
    title: t('Depolama ve karıştırma ihtiyaçları', 'Plan storage and mixing requirements'),
    excerpt: t(
      'Silo ve mikser görüşmesinde malzeme, kapasite ve saha düzenini birlikte ele alın.',
      'Discuss material, capacity and site layout when considering silos and mixers.',
    ),
    tag: t('Silolar ve mikserler', 'Silos & mixers'),
    image: '/images/products/silos-placeholder.svg',
    categoryId: 'silos',
    minutes: 3,
    sections: [
      {
        heading: t('Malzemeyi ve süreci tanımlayın', 'Describe the material and process'),
        text: t(
          'Depolanacak veya karıştırılacak malzemeyi ve ekipmanın süreçteki yerini açıklayın. Silolar ve mikserler ayrı ürün gruplarıdır; gereksinimleri kendi uygulamaları için değerlendirilmelidir.',
          'Describe the material to be stored or mixed and the role of the equipment in your process. Silos and mixers are separate product families; assess their requirements for their respective applications.',
        ),
      },
      {
        heading: t('Kapasite ve saha bilgilerini paylaşın', 'Share capacity and site information'),
        text: t(
          'İhtiyaç duyduğunuz kapasiteyi, yükleme ve boşaltma düzenini ve kurulum alanını görüşün. Kesin boyutlar ve bağlantılar, gerçek ürün bilgileri üzerinden teyit edilmelidir.',
          'Discuss required capacity, loading and discharge arrangements, and installation space. Confirm dimensions and interfaces using actual product information.',
        ),
      },
      {
        heading: t('Teklif kapsamını netleştirin', 'Clarify the quotation scope'),
        text: t(
          'Kontrol sistemi, bağlantılar, teslimat ve varsa destek kapsamını yazılı olarak teyit edin. Bu taslak teknik inceleme sonrasında yayımlanacaktır.',
          'Confirm controls, interfaces, delivery and any included support in writing. This draft requires technical review before publication.',
        ),
      },
    ],
    sources: [],
    sample: true,
    published: ['tr', 'en'],
  },
];

export const sampleContent: Content = {
  settings: {
    name: 'TECHNICSAN',
    identityVerified: false,
    city: 'Ankara',
    privacyReviewed: false,
    ...contact,
  },
  categories: productTypes,
  machines,
  articles,
  brands: [],
};
