import { enhanceGuideDraft } from './guide-drafts';
import type { Article, Category, Localized, SeoFields } from '../lib/types';

const bi = (en: string, tr: string): Localized => ({ en, tr });
const section = (en: string, tr: string, bodyEn: string, bodyTr: string) => ({
  heading: bi(en, tr),
  text: bi(bodyEn, bodyTr),
});
const question = (en: string, tr: string, answerEn: string, answerTr: string) => ({
  question: bi(en, tr),
  answer: bi(answerEn, answerTr),
});
// Original editorial preparation. These are review drafts, never evidence of factory capabilities.
export const categoryEditorialDrafts: Record<string, NonNullable<Category['editorial']>> = {
  'cement-bulker': {
    heading: bi(
      'Cement bulkers and bulk cement tanker trailers',
      'Çimento silobasları ve dökme çimento tankerleri',
    ),
    overview: bi(
      'Start a cement bulker enquiry with the material, required payload and unloading location. Capacity alone does not define a suitable trailer: the vehicle arrangement, loading method and receiving installation also need to be discussed.',
      'Çimento silobası talebine taşınacak malzeme, hedef taşıma yükü ve boşaltma noktasıyla başlayın. Yalnızca kapasite bilgisi yeterli değildir; araç düzeni, dolum yöntemi ve alıcı tesis de görüşülmelidir.',
    ),
    sections: [
      section(
        'Application and vehicle requirements',
        'Uygulama ve araç gereksinimleri',
        'Describe the cement being transported, the proposed route and the receiving site. Share tractor and coupling information, axle requirements and destination-country vehicle documentation needs. Ask the sales team to confirm the proposed configuration in writing.',
        'Taşınacak çimentoyu, planlanan güzergâhı ve alıcı tesisi tanımlayın. Çekici ve bağlantı bilgilerini, dingil gereksinimlerini ve hedef ülkenin araç belgesi ihtiyaçlarını paylaşın. Önerilen konfigürasyonu satış ekibinden yazılı olarak teyit edin.',
      ),
      section(
        'Loading, discharge and quotation scope',
        'Dolum, boşaltma ve teklif kapsamı',
        'Share available loading and discharge arrangements, hose routing and the receiving connection details. Request a clear list of included equipment, optional items, documentation and exclusions. Confirm compressor and auxiliary power requirements against the actual installation rather than assuming compatibility.',
        'Mevcut dolum ve boşaltma düzenini, hortum güzergâhını ve alıcı bağlantılarını paylaşın. Dahil edilen ekipman, seçenekler, belgeler ve kapsam dışı kalemlerin açık listesini isteyin. Kompresör ve yardımcı güç gereksinimlerini gerçek kurulum için teyit edin.',
      ),
    ],
    questions: [
      question(
        'What information helps prepare a quotation?',
        'Teklif için hangi bilgiler gereklidir?',
        'Material, target payload or volume, tractor details, destination, loading and discharge arrangements, and the required quotation scope.',
        'Malzeme, hedef yük veya hacim, çekici bilgileri, hedef ülke, dolum ve boşaltma düzeni ile teklif kapsamı.',
      ),
    ],
  },
  'lpg-catalog': {
    heading: bi(
      'LPG tanks, transport equipment and skid systems',
      'LPG tankları, taşıma ekipmanları ve skid sistemleri',
    ),
    overview: bi(
      'An LPG enquiry should first distinguish storage, transport and filling duties. These lead to different equipment layouts and documentation needs. Our LPG catalog brings the product records together so you can discuss the intended duty before requesting a detailed proposal.',
      'LPG talebinde önce depolama, taşıma ve dolum ihtiyaçlarını ayırın. Bunlar farklı ekipman düzenleri ve belge gereksinimleri doğurur. LPG kataloğu, ayrıntılı teklif öncesinde kullanım amacını görüşebilmeniz için ürün kayıtlarını bir araya getirir.',
    ),
    sections: [
      section(
        'Define the intended duty',
        'Kullanım amacını tanımlayın',
        'State whether you need a transport unit, a stationary installation or a filling skid. Share the destination, intended product and required capacity or throughput. Include existing interface drawings when available. Site-specific engineering and applicable requirements must be confirmed by qualified specialists.',
        'Taşıma ünitesi, sabit kurulum veya dolum skidi ihtiyacını belirtin. Hedef ülkeyi, kullanılacak ürünü ve istenen kapasite veya debiyi paylaşın. Mevcutsa bağlantı çizimlerini ekleyin. Sahaya özel mühendislik ve geçerli gereklilikler yetkin uzmanlarca teyit edilmelidir.',
      ),
      section(
        'Compare the complete system scope',
        'Sistemin kapsamını karşılaştırın',
        'Ask which tank, pump, metering, filling and control items are included in the proposed system. Identify utility requirements, site works, commissioning, inspection and documentation responsibilities explicitly. A product photograph is not proof of a particular approval or certification.',
        'Teklif edilen sistemde hangi tank, pompa, ölçüm, dolum ve kontrol ekipmanlarının bulunduğunu sorun. Enerji ihtiyacı, saha işleri, devreye alma, muayene ve belge sorumluluklarını açıkça belirtin. Bir ürün fotoğrafı belirli bir onay veya sertifikanın kanıtı değildir.',
      ),
    ],
    questions: [
      question(
        'Can the same proposal cover every LPG application?',
        'Tek teklif her LPG uygulamasını kapsar mı?',
        'The intended duty, destination requirements and interfaces must be checked for each project. Request a project-specific scope and supporting documents.',
        'Kullanım amacı, hedef ülke gereklilikleri ve bağlantılar her proje için kontrol edilmelidir. Projeye özel kapsam ve destekleyici belgeler isteyin.',
      ),
    ],
  },
  compressors: {
    heading: bi(
      'Electric and diesel compressors for your application',
      'Uygulamanız için elektrikli ve dizel kompresörler',
    ),
    overview: bi(
      'Compressor selection starts with the equipment that needs compressed air. Share the required flow and working pressure, the duty pattern and the available power supply. Electric or diesel drive is one part of the decision, alongside installation conditions and support requirements.',
      'Kompresör seçimi, basınçlı hava kullanacak ekipmanla başlar. İstenen debi ve çalışma basıncını, çalışma düzenini ve mevcut enerji kaynağını paylaşın. Elektrikli veya dizel tahrik; kurulum koşulları ve destek gereksinimleriyle birlikte değerlendirilir.',
    ),
    sections: [
      section(
        'Confirm demand before choosing a drive',
        'Tahrik seçmeden önce ihtiyacı doğrulayın',
        'Provide the connected equipment specifications and say which users run simultaneously. Identify the required air quality and any existing receiver, treatment or distribution equipment. Ask for performance information at the stated operating conditions, with units and reference conditions made clear.',
        'Bağlı ekipmanların özelliklerini ve hangilerinin aynı anda çalıştığını bildirin. Hava kalitesi ihtiyacını ve mevcut tank, şartlandırma veya dağıtım ekipmanını tanımlayın. Belirtilen çalışma koşullarında performans verisini, birimleri ve referans koşullarını açıkça isteyin.',
      ),
      section(
        'Installation and running requirements',
        'Kurulum ve işletme gereksinimleri',
        'For an electric unit, share the available electrical supply and installation location. For a diesel proposal, describe mobility, fuel and site restrictions. For either option, request the maintenance scope, access requirements and the equipment included in the quotation.',
        'Elektrikli ünite için mevcut elektrik beslemesini ve kurulum yerini paylaşın. Dizel teklif için hareketlilik, yakıt ve saha kısıtlarını açıklayın. Her iki seçenek için bakım kapsamını, erişim gereksinimlerini ve teklife dahil ekipmanı isteyin.',
      ),
    ],
    questions: [
      question(
        'Is motor power enough to select a compressor?',
        'Motor gücü kompresör seçmek için yeterli mi?',
        'No. The required flow, pressure, duty and operating conditions need to be considered together. Request a documented selection for the intended application.',
        'Hayır. İstenen debi, basınç, çalışma düzeni ve koşullar birlikte değerlendirilmelidir. Kullanım amacına uygun belgeli bir seçim isteyin.',
      ),
    ],
  },
  mixers: {
    heading: bi(
      'Concrete truck mixers and transit mixer configurations',
      'Beton transmikserleri ve araç üstü mikser konfigürasyonları',
    ),
    overview: bi(
      'A concrete mixer proposal should match both the concrete delivery task and the vehicle. Share the intended working capacity, chassis information and delivery conditions. Confirm the complete mixer and chassis arrangement before comparing quotations by nominal capacity.',
      'Beton mikseri teklifi hem beton sevkiyatına hem araca uygun olmalıdır. Hedef çalışma kapasitesini, şasi bilgilerini ve teslimat koşullarını paylaşın. Teklifleri nominal kapasiteye göre karşılaştırmadan önce mikser ve şasi düzenini teyit edin.',
    ),
    sections: [
      section(
        'Chassis and capacity',
        'Şasi ve kapasite',
        'Provide the chassis make, model, wheelbase, axle arrangement and available technical drawings. Ask the supplier to distinguish working capacity from geometric volume and to document the proposed installation and weight assumptions.',
        'Şasi markası, modeli, dingil mesafesi, dingil düzeni ve mevcut teknik çizimleri sağlayın. Çalışma kapasitesi ile geometrik hacmin ayrılmasını; önerilen montaj ve ağırlık varsayımlarının belgelenmesini isteyin.',
      ),
      section(
        'Delivery task and included equipment',
        'Sevkiyat işi ve dahil edilen ekipman',
        'Describe typical delivery distances and site access. Confirm the proposed drive, water arrangement, controls and discharge equipment, as well as responsibility for chassis integration. Request operating and maintenance documentation for the actual supplied configuration.',
        'Tipik sevkiyat mesafelerini ve saha erişimini açıklayın. Önerilen tahriki, su düzenini, kumandaları ve boşaltma ekipmanını; şasi entegrasyonunun sorumluluğuyla birlikte teyit edin. Sağlanacak gerçek konfigürasyona ait kullanım ve bakım belgelerini isteyin.',
      ),
    ],
    questions: [
      question(
        'Should the chassis be confirmed before ordering?',
        'Sipariş öncesinde şasi teyit edilmeli mi?',
        'Yes. Share the actual chassis details and request confirmation of the complete arrangement, including mounting and destination requirements.',
        'Evet. Gerçek şasi bilgilerini paylaşın; montaj ve hedef ülke gereklilikleri dahil bütün düzenin teyidini isteyin.',
      ),
    ],
  },
  silos: {
    heading: bi(
      'Cement storage silos and bulk material handling',
      'Çimento depolama siloları ve dökme malzeme aktarımı',
    ),
    overview: bi(
      'Plan cement silo storage around the material, delivery pattern and receiving process. Required usable storage, site space and filling arrangements should be discussed together. This catalogue concerns cement and confirmed bulk material applications; suitability for another material needs a separate review.',
      'Çimento silosu depolamasını malzeme, teslimat düzeni ve alıcı proses etrafında planlayın. Gerekli kullanılabilir depolama, saha alanı ve dolum düzeni birlikte görüşülmelidir. Katalog, çimento ve teyit edilmiş dökme malzeme uygulamalarına yöneliktir; başka malzemelere uygunluk ayrıca incelenmelidir.',
    ),
    sections: [
      section(
        'Capacity and filling arrangements',
        'Kapasite ve dolum düzeni',
        'State the material and its relevant supplier data, target usable storage and expected deliveries. Share how material will enter and leave the silo, including receiving connections and downstream equipment. Ask what capacity definition and assumptions are used in the proposal.',
        'Malzemeyi ve ilgili tedarikçi verilerini, hedef kullanılabilir depolamayı ve beklenen teslimatları belirtin. Alıcı bağlantılar ve sonraki ekipman dahil malzemenin siloya giriş ve çıkışını paylaşın. Teklifte kullanılan kapasite tanımını ve varsayımları sorun.',
      ),
      section(
        'Site and project responsibilities',
        'Saha ve proje sorumlulukları',
        'Provide the site location, available footprint, height restrictions and access for delivery and installation. Foundations, structural design, instrumentation and filling safeguards require project-specific engineering. Ask who supplies each item, supporting calculations, installation and inspection.',
        'Saha konumunu, mevcut yerleşim alanını, yükseklik kısıtlarını ve nakliye ile montaj erişimini bildirin. Temeller, yapısal tasarım, ölçüm ve dolum korumaları projeye özel mühendislik gerektirir. Her kalemi, hesapları, montajı ve muayeneyi kimin sağlayacağını sorun.',
      ),
    ],
    questions: [
      question(
        'Is nominal storage capacity the only requirement?',
        'Tek gereksinim nominal depolama kapasitesi mi?',
        'No. Confirm the material, usable storage definition, filling and discharge interfaces, site conditions and engineering responsibilities.',
        'Hayır. Malzeme, kullanılabilir depolama tanımı, dolum ve boşaltma bağlantıları, saha koşulları ve mühendislik sorumlulukları teyit edilmelidir.',
      ),
    ],
  },
};

export const homeSeoDraft: SeoFields = {
  seoTitle: bi(
    'Industrial Equipment Manufacturer in Turkey',
    'Türkiye’de Endüstriyel Ekipman Üreticisi',
  ),
  seoDescription: bi(
    'Explore TECHNICSAN cement bulkers, LPG equipment, compressors, concrete mixers and silos. Discuss your application and request a project-specific quotation.',
    'TECHNICSAN çimento silobaslarını, LPG ekipmanlarını, kompresörlerini, beton mikserlerini ve silolarını inceleyin. Uygulamanıza özel teklif isteyin.',
  ),
  seoApproval: { en: 'pending', tr: 'pending' },
};
const guideNames = [
  [
    'cement-bulker',
    'cement-bulker-quotation-checklist',
    'cimento-silobasi-teklif-bilgileri',
    'Information needed for a cement bulker quotation',
    'Çimento silobası teklifi için gerekli bilgiler',
  ],
  [
    'lpg-catalog',
    'preparing-lpg-equipment-enquiry',
    'lpg-ekipman-talebi-hazirlama',
    'Preparing an LPG equipment enquiry',
    'LPG ekipman talebi hazırlama',
  ],
  [
    'compressors',
    'electric-or-diesel-compressor-selection',
    'elektrikli-dizel-kompresor-secimi',
    'Electric or diesel: information needed to select a compressor',
    'Elektrikli veya dizel: kompresör seçimi için gerekli bilgiler',
  ],
  [
    'mixers',
    'matching-concrete-mixer-chassis-capacity',
    'beton-mikseri-sasi-kapasite-eslestirme',
    'Matching a concrete mixer to chassis and capacity requirements',
    'Beton mikserini şasi ve kapasite gereksinimleriyle eşleştirme',
  ],
  [
    'silos',
    'planning-cement-silo-storage-site',
    'cimento-silosu-kapasite-saha-planlama',
    'Planning silo capacity, filling arrangements and site requirements',
    'Silo kapasitesi, dolum düzeni ve saha gereksinimlerini planlama',
  ],
];
export const initialGuideDrafts: Article[] = guideNames
  .map<Article>(([categoryId, en, tr, titleEn, titleTr]) => {
    const e = categoryEditorialDrafts[categoryId];
    return {
      id: `guide-${categoryId}-enquiry`,
      slug: bi(en, tr),
      title: bi(titleEn, titleTr),
      excerpt: bi(
        `Prepare a useful enquiry before comparing proposals. ${e.overview.en.split('. ')[0]}.`,
        `Teklifleri karşılaştırmadan önce ihtiyacınızı netleştirin. ${e.overview.tr.split('. ')[0]}.`,
      ),
      tag: bi('Buying guide', 'Satın alma rehberi'),
      image: '/images/attachment.svg',
      categoryId,
      minutes: 4,
      sections: [
        section(
          'Begin with a short project brief',
          'Kısa bir proje özetiyle başlayın',
          e.overview.en +
            ' Record what is known, what needs a supplier confirmation and who will review the proposal. Keep these separate in your enquiry.',
          e.overview.tr +
            ' Bilinenleri, tedarikçiden teyit bekleyenleri ve teklifi kimin inceleyeceğini kaydedin. Talebinizde bunları ayrı belirtin.',
        ),
        ...e.sections,
        section(
          'Compare written proposals on the same basis',
          'Yazılı teklifleri aynı temelde karşılaştırın',
          'Use a checklist for the proposed configuration, verified performance data, drawings, included equipment and exclusions. Request the applicable documentation and identify installation and commissioning responsibilities. Prices and delivery dates should be confirmed in the actual quotation; a catalogue entry does not establish either.',
          'Önerilen konfigürasyon, doğrulanmış performans verileri, çizimler, dahil edilen ekipman ve kapsam dışı kalemler için kontrol listesi kullanın. Geçerli belgeleri isteyin; montaj ve devreye alma sorumluluklarını belirleyin. Fiyat ve teslim tarihleri gerçek teklifte teyit edilmelidir; katalog kaydı bunları belirlemez.',
        ),
        section(
          'Send the information for review',
          'Bilgileri inceleme için gönderin',
          'Include the destination country, project stage, relevant drawings and a contact for technical questions. Ask for missing information to be listed explicitly. Have the final equipment selection and any technical or safety requirements reviewed by the people responsible for the project.',
          'Hedef ülkeyi, proje aşamasını, ilgili çizimleri ve teknik sorular için irtibat kişisini ekleyin. Eksik bilgilerin açıkça listelenmesini isteyin. Nihai ekipman seçimini, teknik ve güvenlik gereksinimlerini projenin sorumlularına inceletin.',
        ),
      ],
      sources: [],
      sample: true,
      published: ['en', 'tr'],
      seoTitle: bi(titleEn, titleTr),
      seoDescription: bi(
        `A practical checklist for your ${categoryId.replaceAll('-', ' ')} enquiry: application, configuration, supporting documents and quotation scope.`,
        'Uygulama, konfigürasyon, destekleyici belgeler ve teklif kapsamı için pratik kontrol listesi.',
      ),
      seoApproval: { en: 'pending', tr: 'pending' },
    };
  })
  .map(enhanceGuideDraft);
