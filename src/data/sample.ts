import type { Article, Category, Content, Machine, Localized } from '../lib/types';
const t = <T>(tr: T, en: T): Localized<T> => ({ tr, en });
const categories: Category[] = [
  {
    id: 'excavators',
    slug: t('ekskavatorler', 'excavators'),
    name: t('Ekskavatörler', 'Excavators'),
    description: t(
      'Kazı, hafriyat ve saha hazırlığı',
      'Excavation, groundwork and site preparation',
    ),
    icon: 'excavator',
  },
  {
    id: 'loaders',
    slug: t('yukleyiciler', 'loaders'),
    name: t('Yükleyiciler', 'Loaders'),
    description: t('Agrega ve dökme malzeme yükleme', 'Aggregate and bulk material handling'),
    icon: 'loader',
  },
  {
    id: 'road',
    slug: t('yol-ekipmanlari', 'road-equipment'),
    name: t('Yol ekipmanları', 'Road equipment'),
    description: t('Zemin hazırlığı ve sıkıştırma', 'Ground preparation and compaction'),
    icon: 'road',
  },
  {
    id: 'lifting',
    slug: t('kaldirma', 'lifting'),
    name: t('Kaldırma', 'Lifting'),
    description: t('Sahada kaldırma ve malzeme erişimi', 'On-site lifting and material access'),
    icon: 'lifting',
  },
  {
    id: 'attachments',
    slug: t('atasmanlar', 'attachments'),
    name: t('Ataşmanlar', 'Attachments'),
    description: t(
      'İşe ve taşıyıcı makineye uygun ekipman',
      'Equipment matched to the job and carrier',
    ),
    icon: 'attachment',
  },
];
const rows = [
  ['ex210', 'excavators', 'EX 210', 'new', 'available', 0, 0, '21 t', 'excavator'],
  ['wl180', 'loaders', 'WL 180', 'used', 'available', 2021, 3840, '18 t', 'loader'],
  ['ex140', 'excavators', 'EX 140', 'used', 'available', 2020, 5260, '14 t', 'excavator'],
  ['wl150', 'loaders', 'WL 150', 'new', 'available', 0, 0, '15 t', 'loader'],
  ['rc120', 'road', 'RC 120', 'new', 'available', 0, 0, '12 t', 'road'],
  ['th140', 'lifting', 'TH 140', 'used', 'reserved', 2022, 2140, '4 t', 'lifting'],
  ['ex080', 'excavators', 'EX 080', 'new', 'available', 0, 0, '8 t', 'excavator'],
  ['wl200', 'loaders', 'WL 200', 'used', 'sold', 2019, 6850, '20 t', 'loader'],
  ['rc100', 'road', 'RC 100', 'used', 'available', 2021, 2970, '10 t', 'road'],
  ['th170', 'lifting', 'TH 170', 'new', 'available', 0, 0, '4 t', 'lifting'],
  ['hb150', 'attachments', 'HB 150', 'new', 'available', 0, 0, '1.5 t', 'attachment'],
  ['sb090', 'attachments', 'SB 090', 'used', 'available', 2023, 410, '0.9 t', 'attachment'],
] as const;
const descriptions = {
  excavators: t(
    'Kazı ve saha hazırlığı için paletli ekskavatör.',
    'A tracked excavator for excavation and site preparation.',
  ),
  loaders: t(
    'Agrega ve dökme malzeme yükleme için lastikli yükleyici.',
    'A wheel loader for handling aggregate and bulk materials.',
  ),
  road: t(
    'Zemin hazırlığı ve sıkıştırma işleri için yol ekipmanı.',
    'Road equipment for ground preparation and compaction.',
  ),
  lifting: t(
    'Saha içi malzeme erişimi için kaldırma ekipmanı.',
    'Lifting equipment for on-site material access.',
  ),
  attachments: t(
    'Taşıyıcı makine uyumluluğu teyit edilerek seçilecek ataşman.',
    'An attachment selected after confirming carrier compatibility.',
  ),
};
const machines: Machine[] = rows.map(
  ([id, categoryId, model, kind, status, year, hours, weight, image]) => ({
    id,
    model,
    categoryId,
    kind,
    status,
    slug: t(id, id),
    name: t(
      `${model} ${categories.find((c) => c.id === categoryId)!.name.tr}`,
      `${model} ${categories.find((c) => c.id === categoryId)!.name.en}`,
    ),
    year: year || undefined,
    hours: kind === 'used' ? hours : undefined,
    summary: descriptions[categoryId],
    description: t(
      'Bu sayfa, gerçek makine bilgileri eklenmeden önce katalog yapısını göstermek için hazırlanmıştır. Model adları ve teknik değerler örnektir. Fotoğraflar ilandaki gerçek bir makineyi temsil etmez.',
      'This page demonstrates the catalogue before actual equipment information is supplied. Model names and technical figures are examples. Photographs do not represent an actual machine offered for sale.',
    ),
    condition:
      kind === 'used'
        ? t(
            'Örnek kondisyon alanı. Gerçek makinenin kontrol raporu ve bakım geçmişi eklenmelidir.',
            'Example condition field. Add the actual inspection report and service history.',
          )
        : undefined,
    applications: t(
      [
        'Saha koşulları ve iş gereksinimleri teyit edilmelidir.',
        'Uyumlu ekipman ve konfigürasyon satış ekibiyle görüşülmelidir.',
      ],
      [
        'Confirm site conditions and job requirements.',
        'Discuss compatible equipment and configurations with sales.',
      ],
    ),
    specs: [
      { label: t('Örnek çalışma ağırlığı', 'Example operating weight'), value: weight },
      { label: t('Model referansı', 'Model reference'), value: model },
      { label: t('Bilgi durumu', 'Information status'), value: 'DEMO' },
    ],
    images: [
      {
        src:
          '/images/steel/catalogue-' +
          (image === 'excavator'
            ? 'excavator'
            : image === 'loader'
              ? 'loader'
              : image === 'lifting'
                ? 'lifting'
                : image === 'attachment'
                  ? 'attachments'
                  : 'road') +
          '.webp',
        alt: t(
          'Katalog tasarımı için temsili makine görseli',
          'Illustrative machinery image for the catalogue design',
        ),
        illustrative: true,
      },
    ],
    source: 'Internal demonstration dataset. All technical values are illustrative.',
    sample: true,
    published: ['tr', 'en'],
  }),
);
const articles: Article[] = [
  {
    id: 'choosing',
    slug: t('isinize-uygun-ekskavator', 'choosing-an-excavator'),
    title: t('İşinize uygun ekskavatörü nasıl seçersiniz?', 'Choosing an excavator for your work'),
    excerpt: t(
      'Makine boyutundan saha erişimine: ilk görüşmeden önce netleştirilecek sorular.',
      'From machine size to site access: the questions to clarify before your first enquiry.',
    ),
    tag: t('Satın alma rehberi', 'Buying guide'),
    image: '/images/steel/guide-tracks.webp',
    categoryId: 'excavators',
    minutes: 4,
    sections: [
      {
        heading: t('Önce yapılacak işi tanımlayın', 'Start with the job'),
        text: t(
          'Kazılacak malzemeyi, saha erişimini, çalışma alanını ve günlük hedefi not edin. Bu bilgiler, yalnızca model adına bakmaktan daha yararlı bir başlangıç sağlar.',
          'Begin by listing the tasks the machine will perform. Consider the type of material, the working environment and how the excavator fits into the wider work sequence.\n\nDiscuss your requirements with a supplier to understand which configurations are suitable for your application and how different options can support your work.',
        ),
      },
      {
        heading: t('Saha erişimini kontrol edin', 'Check site access'),
        text: t(
          'Sahaya ulaşım yolunu, çalışma alanını ve zemin koşullarını değerlendirin. Erişim kısıtlamaları, üst açıklıklar ve engebeli zemin uygun makine boyutunu ve konfigürasyonu etkileyebilir.',
          'Assess the route to the site, working area and ground conditions. Access constraints, overhead clearances and uneven ground can affect the machine size and configuration that will work best for your project.',
        ),
      },
      {
        heading: t('Ataşmanı işe göre seçin', 'Match the attachment'),
        text: t(
          'Ataşman ve taşıyıcı makine uyumluluğunu üretici belgeleriyle teyit edin. İşin türünü ve saha gereksinimlerini satış ekibiyle paylaşın. Bu örnek yazı teknik inceleme gerektirir.',
          'Confirm attachment and carrier compatibility against manufacturer documentation. Share your work and site requirements with sales. This example article requires technical review before publication.',
        ),
      },
    ],
    sources: [],
    sample: true,
    published: ['tr', 'en'],
  },
  {
    id: 'inspection',
    slug: t('ikinci-el-makine-sorulari', 'used-machine-enquiry-checklist'),
    title: t('İkinci el makine için sorulacak sorular', 'What to inspect on a used machine'),
    excerpt: t(
      'Çalışma saati, bakım kayıtları ve mevcut kondisyon hakkında bir görüşme çerçevesi.',
      'A practical conversation about operating hours, records and current condition.',
    ),
    tag: t('İkinci el ekipman', 'Used equipment'),
    image: '/images/steel/guide-engine.webp',
    categoryId: 'loaders',
    minutes: 5,
    sections: [
      {
        heading: t('Kayıtları birlikte değerlendirin', 'Review the records together'),
        text: t(
          'Model, üretim yılı, seri referansı ve çalışma saati bilgisini isteyin. Varsa bakım kayıtlarını ve son kontrol tarihini de sorun.',
          'Request the model, manufacturing year, unit reference and operating hours. Ask about available service records and the date of the latest inspection.',
        ),
      },
      {
        heading: t(
          'Güncel fotoğraf ve kontrol isteyin',
          'Request current photographs and an inspection',
        ),
        text: t(
          'Genel görseller yerine teklif edilen makinenin güncel fotoğraflarını isteyin. Nihai satın alma kararından önce nitelikli bir uzmanın kontrolünü planlayın.',
          'Ask for recent photographs of the specific unit rather than general product images. Arrange an assessment by a qualified professional before making a purchase decision.',
        ),
      },
      {
        heading: t('Teklif kapsamını netleştirin', 'Clarify what is included'),
        text: t(
          'Ataşmanları, teslimat düzenlemelerini ve varsa satış sonrası desteği yazılı olarak teyit edin. Bu yazı bir örnektir; teknik inceleme yerine geçmez.',
          'Confirm attachments, delivery arrangements and any aftersales support in writing. This sample article does not replace a technical inspection.',
        ),
      },
    ],
    sources: [],
    sample: true,
    published: ['tr', 'en'],
  },
  {
    id: 'new-used',
    slug: t('atasman-ve-makine-uyumu', 'attachments-and-carrier-compatibility'),
    title: t('Ataşman ve taşıyıcı makine uyumu', 'Attachments and carrier compatibility'),
    excerpt: t(
      'Bağlantı sistemi, hidrolik gereksinimler ve taşıyıcı sınırlarını birlikte teyit edin.',
      'Confirm mounting systems, hydraulic requirements and carrier limits together.',
    ),
    tag: t('Ataşman rehberi', 'Attachment guide'),
    image: '/images/steel/guide-attachments.webp',
    categoryId: 'excavators',
    minutes: 3,
    sections: [
      {
        heading: t(
          'Makine ve ataşman bilgilerini eşleştirin',
          'Match the machine and attachment information',
        ),
        text: t(
          'Taşıyıcı makinenin modelini, bağlantı sistemini ve ataşmanın amaçlanan kullanımını kaydedin. Uyum değerlendirmesinde her iki ürünün üretici belgelerini birlikte inceleyin.',
          'Record the carrier model, mounting system and intended attachment use. Review the manufacturer documentation for both products when assessing compatibility.',
        ),
      },
      {
        heading: t(
          'Hidrolik ve ağırlık sınırlarını teyit edin',
          'Confirm hydraulic and weight limits',
        ),
        text: t(
          'Gerekli debi ve basıncı, bağlantıları, ataşman ağırlığını ve taşıyıcının izin verilen sınırlarını tedarikçiyle teyit edin. Bu taslak, üretici onayı veya teknik değerlendirme yerine geçmez.',
          'Confirm required flow and pressure, connections, attachment weight and permitted carrier limits with the supplier. This draft does not replace manufacturer approval or a technical assessment.',
        ),
      },
    ],
    sources: [],
    sample: true,
    published: ['tr', 'en'],
  },
];
export const sampleContent: Content = {
  settings: { name: 'MACHINA', identityVerified: false, city: 'Ankara', privacyReviewed: false },
  categories,
  machines,
  articles,
  brands: [],
};
