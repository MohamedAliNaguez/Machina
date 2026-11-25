import type { Article, Localized } from '../lib/types';
const bi = (en: string, tr: string): Localized => ({ en, tr });
const configs: Record<
  string,
  {
    title: Localized;
    answer: Localized;
    heading: Localized;
    rows: Localized[][];
    items: Localized[];
    products: string[];
  }
> = {
  'cement-bulker': {
    title: bi(
      'What to prepare before requesting a cement bulker quotation',
      'Çimento silobası teklifi istemeden önce neler hazırlanmalı?',
    ),
    answer: bi(
      'Prepare a project brief covering the material, target payload, tractor, route and receiving site. Separate confirmed requirements from open questions so proposals can be compared on the same basis.',
      'Malzeme, hedef taşıma yükü, çekici, güzergâh ve alıcı sahayı içeren bir proje özeti hazırlayın. Teklifleri aynı temelde karşılaştırmak için kesin gereksinimleri açık sorulardan ayırın.',
    ),
    heading: bi(
      'Turn a short request into a useful project brief',
      'Kısa bir talebi yararlı bir proje özetine dönüştürün',
    ),
    rows: [
      [
        bi('Material', 'Malzeme'),
        bi(
          'Identify the actual material; do not describe every powder as cement.',
          'Gerçek malzemeyi belirtin; her tozu çimento olarak tanımlamayın.',
        ),
      ],
      [
        bi('Vehicle and route', 'Araç ve güzergâh'),
        bi(
          'Share tractor details, intended destination and relevant route restrictions.',
          'Çekici bilgilerini, hedef ülkeyi ve ilgili güzergâh kısıtlarını paylaşın.',
        ),
      ],
      [
        bi('Receiving installation', 'Alıcı tesis'),
        bi(
          'Provide connection details, available drawings and site access information.',
          'Bağlantı bilgilerini, mevcut çizimleri ve saha erişim bilgilerini sunun.',
        ),
      ],
      [
        bi('Quotation scope', 'Teklif kapsamı'),
        bi(
          'Ask which compressor, hoses, documents and auxiliary equipment are included.',
          'Kompresör, hortum, belge ve yardımcı ekipman kapsamını sorun.',
        ),
      ],
    ],
    items: [
      bi('Material and target payload or volume', 'Malzeme ve hedef yük veya hacim'),
      bi('Tractor information and destination', 'Çekici bilgileri ve hedef ülke'),
      bi('Loading and receiving connection drawings', 'Dolum ve alıcı bağlantı çizimleri'),
      bi(
        'Included equipment and exclusions to confirm',
        'Teyit edilecek ekipman ve kapsam dışı kalemler',
      ),
    ],
    products: ['v-type-silobas'],
  },
  'lpg-catalog': {
    title: bi(
      'Which LPG equipment fits your application?',
      'Uygulamanıza hangi LPG ekipmanı uygun?',
    ),
    answer: bi(
      'Begin with the intended duty: moving LPG, storing it, filling vehicles or cylinders, or supplying vapour. These are different project needs; a similar-looking tank does not establish that two systems are interchangeable.',
      'Önce kullanım amacını belirleyin: LPG taşıma, depolama, araç veya tüp dolumu ya da buhar besleme. Bunlar farklı proje ihtiyaçlarıdır; benzer görünen tanklar sistemlerin birbirinin yerine kullanılabileceğini göstermez.',
    ),
    heading: bi('Compare the seven LPG product types', 'Yedi LPG ürün tipini karşılaştırın'),
    rows: [
      [
        bi('Semi-trailer', 'Yarı römork'),
        bi(
          'Transport project: discuss tractor, route, capacity and transfer equipment.',
          'Taşıma projesi: çekici, güzergâh, kapasite ve transfer ekipmanını görüşün.',
        ),
      ],
      [
        bi('Bobtail', 'Bobtail'),
        bi(
          'Vehicle-mounted distribution: establish chassis and delivery requirements.',
          'Araç üstü dağıtım: şasi ve teslimat gereksinimlerini belirleyin.',
        ),
      ],
      [
        bi('Dispenser skid', 'Dispenser skid'),
        bi(
          'Discuss dispensing duty and the tank, pump, metering and control scope.',
          'Dolum amacı ile tank, pompa, ölçüm ve kontrol kapsamını görüşün.',
        ),
      ],
      [
        bi('Scale skid', 'Terazili skid'),
        bi(
          'Describe cylinder-filling and weighing requirements.',
          'Tüp dolum ve tartım gereksinimlerini tanımlayın.',
        ),
      ],
      [
        bi('Bulk storage tank', 'Dökme depolama tankı'),
        bi(
          'Describe storage needs, installation location and site interfaces.',
          'Depolama ihtiyacını, kurulum yerini ve saha bağlantılarını açıklayın.',
        ),
      ],
      [
        bi('Domestic tank', 'Küçük hacimli tank'),
        bi(
          'Discuss the required storage duty and available installation space.',
          'Depolama amacını ve kullanılabilir kurulum alanını görüşün.',
        ),
      ],
      [
        bi('Vaporiser', 'Buharlaştırıcı'),
        bi(
          'Specify vapour demand and energy availability; vessel volume is not a throughput figure.',
          'Buhar ihtiyacını ve enerji kaynağını belirtin; tank hacmi bir debi değeri değildir.',
        ),
      ],
    ],
    items: [
      bi('Intended duty and destination country', 'Kullanım amacı ve hedef ülke'),
      bi(
        'Required storage volume or transfer/vapour demand, with units',
        'Birimleriyle depolama hacmi veya transfer/buhar ihtiyacı',
      ),
      bi(
        'Site or vehicle interfaces and available drawings',
        'Saha veya araç bağlantıları ve mevcut çizimler',
      ),
      bi(
        'Project-specific technical and documentation review',
        'Projeye özel teknik ve belge incelemesi',
      ),
    ],
    products: [
      'lpg-semi-trailer',
      'lpg-bobtail',
      'lpg-dispenser-skid-system',
      'lpg-scale-skid-system',
      'lpg-bulk-storage-tank',
      'lpg-domestic-tank',
      'lpg-vaporiser',
    ],
  },
  compressors: {
    title: bi(
      'Electric or diesel compressor: what should you compare?',
      'Elektrikli veya dizel kompresör: neleri karşılaştırmalısınız?',
    ),
    answer: bi(
      'Compare the required air supply, operating pattern, available energy and installation conditions before choosing a drive. Neither drive type is automatically the best choice for every application.',
      'Tahrik seçmeden önce hava ihtiyacını, çalışma düzenini, mevcut enerji kaynağını ve kurulum koşullarını karşılaştırın. Hiçbir tahrik tipi her uygulama için kendiliğinden en iyi seçenek değildir.',
    ),
    heading: bi(
      'Compare requirements before comparing models',
      'Modellerden önce gereksinimleri karşılaştırın',
    ),
    rows: [
      [
        bi('Air demand', 'Hava ihtiyacı'),
        bi(
          'Provide flow and pressure at stated operating conditions.',
          'Belirtilen çalışma koşullarında debi ve basıncı sunun.',
        ),
      ],
      [
        bi('Electric proposal', 'Elektrikli teklif'),
        bi(
          'Confirm supply, connection and installation constraints.',
          'Besleme, bağlantı ve kurulum kısıtlarını teyit edin.',
        ),
      ],
      [
        bi('Diesel proposal', 'Dizel teklif'),
        bi(
          'Describe mobility, fuel arrangements and site restrictions.',
          'Hareketlilik, yakıt düzeni ve saha kısıtlarını açıklayın.',
        ),
      ],
      [
        bi('Operation', 'İşletme'),
        bi(
          'Compare maintenance access and included equipment for the actual duty.',
          'Gerçek kullanım için bakım erişimini ve ekipman kapsamını karşılaştırın.',
        ),
      ],
    ],
    items: [
      bi('Connected equipment and simultaneous users', 'Bağlı ekipman ve eşzamanlı kullanıcılar'),
      bi('Flow, pressure and required air quality', 'Debi, basınç ve gerekli hava kalitesi'),
      bi('Energy supply and installation location', 'Enerji kaynağı ve kurulum yeri'),
      bi('Operating schedule and maintenance access', 'Çalışma programı ve bakım erişimi'),
    ],
    products: ['bnb-72-e', 'bnb-72-d'],
  },
  mixers: {
    title: bi(
      'Matching a concrete mixer to your chassis and operating needs',
      'Beton mikserini şasi ve çalışma ihtiyaçlarıyla eşleştirme',
    ),
    answer: bi(
      'Treat the mixer and vehicle as a complete arrangement. Share chassis information and the delivery task, then ask for written confirmation of working capacity, mounting and the proposed equipment scope.',
      'Mikser ve aracı bütün bir düzen olarak değerlendirin. Şasi bilgileri ile sevkiyat işini paylaşın; çalışma kapasitesi, montaj ve ekipman kapsamını yazılı teyit ettirin.',
    ),
    heading: bi('Build a chassis and application brief', 'Şasi ve uygulama özeti hazırlayın'),
    rows: [
      [
        bi('Chassis', 'Şasi'),
        bi(
          'Provide the actual chassis specification or drawing.',
          'Gerçek şasi özelliklerini veya çizimini sunun.',
        ),
      ],
      [
        bi('Capacity', 'Kapasite'),
        bi(
          'Distinguish required working capacity from a quoted nominal volume.',
          'Gerekli çalışma kapasitesini teklif edilen nominal hacimden ayırın.',
        ),
      ],
      [
        bi('Delivery conditions', 'Sevkiyat koşulları'),
        bi(
          'Describe routes, access, typical delivery pattern and site conditions.',
          'Güzergâhı, erişimi, sevkiyat düzenini ve saha koşullarını açıklayın.',
        ),
      ],
      [
        bi('Scope', 'Kapsam'),
        bi(
          'Clarify mixer equipment, chassis responsibilities and documentation.',
          'Mikser ekipmanını, şasi sorumluluklarını ve belgeleri netleştirin.',
        ),
      ],
    ],
    items: [
      bi('Chassis make/model and drawing', 'Şasi marka/modeli ve çizimi'),
      bi('Required working capacity', 'Gerekli çalışma kapasitesi'),
      bi('Operating location and delivery pattern', 'Çalışma yeri ve sevkiyat düzeni'),
      bi('Mounting and documentation responsibilities', 'Montaj ve belge sorumlulukları'),
    ],
    products: ['wet-system', 'lightweight'],
  },
  silos: {
    title: bi(
      'Planning a cement silo enquiry: capacity, site and filling arrangements',
      'Çimento silosu talebi: kapasite, saha ve dolum düzeni',
    ),
    answer: bi(
      'Start with the stored material, required capacity and how the silo connects to the site. Capacity alone does not define the foundation, filling, discharge or access requirements.',
      'Depolanacak malzeme, gerekli kapasite ve silonun saha bağlantılarıyla başlayın. Yalnızca kapasite bilgisi temel, dolum, boşaltma veya erişim gereksinimlerini tanımlamaz.',
    ),
    heading: bi(
      'Prepare the site information before selection',
      'Seçimden önce saha bilgilerini hazırlayın',
    ),
    rows: [
      [
        bi('Material and capacity', 'Malzeme ve kapasite'),
        bi(
          'State the material and explain the storage requirement with units.',
          'Malzemeyi belirtin ve depolama ihtiyacını birimleriyle açıklayın.',
        ),
      ],
      [
        bi('Site layout', 'Saha düzeni'),
        bi(
          'Provide available space, access and connection drawings.',
          'Mevcut alanı, erişimi ve bağlantı çizimlerini sunun.',
        ),
      ],
      [
        bi('Filling and discharge', 'Dolum ve boşaltma'),
        bi(
          'Describe the delivery vehicle and receiving equipment interfaces.',
          'Sevkiyat aracı ve alıcı ekipman bağlantılarını tanımlayın.',
        ),
      ],
      [
        bi('Engineering responsibilities', 'Mühendislik sorumlulukları'),
        bi(
          'Identify who reviews civil works, installation and project documentation.',
          'İnşaat işleri, kurulum ve proje belgelerini kimin inceleyeceğini belirleyin.',
        ),
      ],
    ],
    items: [
      bi('Material and target storage capacity', 'Malzeme ve hedef depolama kapasitesi'),
      bi('Site plan and access restrictions', 'Saha planı ve erişim kısıtları'),
      bi('Filling and discharge interfaces', 'Dolum ve boşaltma bağlantıları'),
      bi(
        'Responsible project engineer and documentation needs',
        'Sorumlu proje mühendisi ve belge ihtiyaçları',
      ),
    ],
    products: ['silos-25-30-50'],
  },
};
export function enhanceGuideDraft(article: Article): Article {
  const c = configs[article.categoryId];
  if (!c) return article;
  const text = bi(
    'Use this guide to prepare questions, not as an installation or operating procedure. Have equipment selection, site engineering and safety requirements reviewed by the specialists responsible for the project. Ask for uncertainties, inclusions and exclusions to be recorded in the written proposal.',
    'Bu rehberi kurulum veya işletme talimatı olarak değil, soru hazırlamak için kullanın. Ekipman seçimi, saha mühendisliği ve güvenlik gereksinimlerini projeden sorumlu uzmanlara inceletin. Belirsizlik, dahil edilenler ve kapsam dışı kalemlerin yazılı teklifte belirtilmesini isteyin.',
  );
  return {
    ...article,
    title: c.title,
    excerpt: c.answer,
    seoTitle: c.title,
    seoDescription: c.answer,
    relatedProductIds: c.products,
    sections: [
      {
        heading: c.heading,
        text: c.answer,
        blocks: [
          {
            kind: 'table',
            columns: [
              bi('Decision area', 'Karar alanı'),
              bi('Information to prepare', 'Hazırlanacak bilgiler'),
            ],
            rows: c.rows.map((cells) => ({ cells })),
          },
        ],
      },
      ...article.sections.slice(1, 3),
      {
        heading: bi('Information to prepare', 'Hazırlanacak bilgiler'),
        text: bi(c.items.map((i) => i.en).join('\n'), c.items.map((i) => i.tr).join('\n')),
        blocks: [{ kind: 'checklist', items: c.items }],
      },
      {
        heading: bi('Confirm the project-specific proposal', 'Projeye özel teklifi teyit edin'),
        text,
        blocks: [{ kind: 'paragraph', text }],
      },
    ],
  };
}
