import type { Article, Localized } from '../lib/types';
import type { GuideBlock } from '../lib/guides';
const bi = (en: string, tr: string): Localized => ({ en, tr });
const paragraph = (en: string, tr: string): GuideBlock => ({ kind: 'paragraph', text: bi(en, tr) });
const list = (items: [string, string][], kind: 'list' | 'checklist' = 'list'): GuideBlock => ({
  kind,
  items: items.map(([en, tr]) => bi(en, tr)),
});
const table = (columns: [string, string][], rows: [string, string][][]): GuideBlock => ({
  kind: 'table',
  columns: columns.map(([en, tr]) => bi(en, tr)),
  rows: rows.map((row) => ({ cells: row.map(([en, tr]) => bi(en, tr)) })),
});
const section = (
  en: string,
  tr: string,
  blocks: GuideBlock[],
  tool?: Article['sections'][number]['tool'],
): Article['sections'][number] => ({
  heading: bi(en, tr),
  text: bi('', ''),
  blocks,
  ...(tool ? { tool } : {}),
});
/** Original procurement draft. Examples describe assumptions, never approved equipment ratings. */
export function cementProcurementGuide(article: Article): Article {
  return {
    ...article,
    title: bi(
      'Cement bulker buying guide & quotation checklist',
      'Çimento silobası satın alma ve teklif rehberi',
    ),
    seoTitle: bi(
      'Cement Bulker Buying Guide & RFQ Checklist | TECHNICSAN',
      'Çimento Silobası Satın Alma ve Teklif Rehberi | TECHNICSAN',
    ),
    excerpt: bi(
      'Define your operating requirements, explore the equipment, estimate payload and prepare a clearer request for quotation. A practical resource for fleet operators, procurement teams and distributors.',
      'Çalışma gereksinimlerinizi tanımlayın, ekipmanı inceleyin, yük tahmini yapın ve daha net bir teklif talebi hazırlayın. Filo işletmecileri, satın alma ekipleri ve distribütörler için pratik bir kaynak.',
    ),
    seoDescription: bi(
      'Plan a cement bulker purchase with payload and unloading estimators, a component diagram, quotation comparison worksheet and a structured RFQ builder.',
      'Yük ve boşaltma tahmin araçları, bileşen şeması, teklif karşılaştırma tablosu ve yapılandırılmış teklif talebi ile çimento silobası alımını planlayın.',
    ),
    sections: [
      section(
        'Start with the job, not the tank size',
        'Tank hacminden önce kullanım amacını belirleyin',
        [
          paragraph(
            'A useful enquiry describes the transport operation before choosing a tank. Begin with the exact powder, where it is loaded, the receiving installation and the destination country. Ask the supplier to confirm suitability for that material and duty in writing. A photograph or a nominal volume does not establish compatibility.',
            'Yararlı bir talep, tank seçilmeden önce taşıma işini tanımlar. Gerçek tozu, yükleme yerini, alıcı tesisi ve hedef ülkeyi belirtin. Malzeme ve kullanım uygunluğunu tedarikçiden yazılı olarak isteyin. Fotoğraf veya nominal hacim uyumluluğu kanıtlamaz.',
          ),
          list([
            [
              'Identify the material and obtain its data sheet, actual loose bulk density and handling requirements. Do not use one cement density for every powder.',
              'Malzemeyi tanımlayın; veri föyünü, gerçek gevşek yığın yoğunluğunu ve elleçleme gereksinimlerini edinin. Her toz için tek bir çimento yoğunluğu kullanmayın.',
            ],
            [
              'Record the target load per trip, trips per day, route conditions and seasonal use. Separate a firm requirement from an early estimate.',
              'Sefer başına hedef yükü, günlük sefer sayısını, yol koşullarını ve mevsimsel kullanımı kaydedin. Kesin gereksinimi ilk tahminden ayırın.',
            ],
            [
              'Share the tractor information and receiving-site drawings. List any details that are still unknown instead of guessing.',
              'Çekici bilgilerini ve alıcı saha çizimlerini paylaşın. Tahmin etmek yerine bilinmeyen ayrıntıları listeleyin.',
            ],
          ]),
          paragraph(
            'Buyer’s decision: agree the operating brief first. It becomes the reference for evaluating every proposed configuration and for asking suppliers the same questions.',
            'Satın alma kararı: önce çalışma özetinde anlaşın. Bu özet, önerilen tüm konfigürasyonları değerlendirmek ve tedarikçilere aynı soruları sormak için temel oluşturur.',
          ),
        ],
      ),
      section(
        'Separate volume from payload',
        'Hacim ile taşıma yükünü ayırın',
        [
          paragraph(
            'Cubic metres describe volume; tonnes describe mass. A volume-based estimate multiplies the assumed usable volume by the actual bulk density. A separate gross-weight estimate subtracts the complete operating tare of the tractor and trailer from the combination limit you provide. Use consistent units and include fuel, driver, accessories and other operating loads in the relevant weights.',
            'Metreküp hacmi, ton ise kütleyi ifade eder. Hacme dayalı tahmin, varsayılan kullanılabilir hacmi gerçek yığın yoğunluğuyla çarpar. Ayrı bir brüt ağırlık tahmini, çekici ve römorkun tam çalışma darasını belirttiğiniz katar sınırından çıkarır. Tutarlı birimler kullanın; yakıtı, sürücüyü, aksesuarları ve diğer çalışma yüklerini ilgili ağırlıklara dahil edin.',
          ),
          paragraph(
            'Neither calculation checks axle distribution, coupling ratings, structural ratings, route restrictions or the approved filling level. The smaller result is only a screening ceiling based on your inputs. A competent vehicle specialist must establish the permitted payload for the actual combination and jurisdiction.',
            'Bu hesaplamalar aks dağılımını, kaplin değerlerini, yapısal sınırları, güzergâh kısıtlarını veya onaylı dolum seviyesini kontrol etmez. Küçük sonuç, yalnızca girdilerinize dayalı bir ön değerlendirme tavanıdır. Gerçek katar ve mevzuat için izin verilen yükü yetkin bir araç uzmanı belirlemelidir.',
          ),
        ],
        'payload',
      ),
      section(
        'Understand what the quotation includes',
        'Teklifin hangi bileşenleri kapsadığını anlayın',
        [
          paragraph(
            'Treat the trailer, pneumatic equipment and receiving installation as connected parts of one project. Use the conceptual diagram to identify the questions to ask. The positions are schematic and do not represent a certified TECHNICSAN design.',
            'Römorku, pnömatik ekipmanı ve alıcı tesisi aynı projenin bağlantılı parçaları olarak ele alın. Sorulacak soruları belirlemek için kavramsal şemayı kullanın. Konumlar şematiktir ve onaylı bir TECHNICSAN tasarımını temsil etmez.',
          ),
        ],
        'components',
      ),
      section('Compare construction on the same basis', 'Yapıyı aynı temelde karşılaştırın', [
        paragraph(
          'Ask each supplier for the proposed vessel arrangement, construction material, empty operating weight, dimensional drawing and included equipment. Do not infer engineering quality from wall thickness alone or assume that an aluminium or steel option is available for every model.',
          'Her tedarikçiden önerilen tank düzenini, yapı malzemesini, boş çalışma ağırlığını, ölçülü çizimi ve dahil ekipmanı isteyin. Mühendislik kalitesini yalnızca et kalınlığından çıkarmayın; her modelde alüminyum veya çelik seçenek bulunduğunu varsaymayın.',
        ),
        table(
          [
            ['Compare', 'Karşılaştırın'],
            ['Ask for evidence', 'Kanıt isteyin'],
          ],
          [
            [
              ['Weight and dimensions', 'Ağırlık ve ölçüler'],
              [
                'A configuration-specific weight breakdown and drawing, including the equipment in the quotation.',
                'Teklifteki ekipman dahil, konfigürasyona özel ağırlık dökümü ve çizim.',
              ],
            ],
            [
              ['Maintenance access', 'Bakım erişimi'],
              [
                'Access arrangements, replacement parts information and qualified service options for your market.',
                'Pazarınız için erişim düzeni, yedek parça bilgileri ve yetkin servis seçenekleri.',
              ],
            ],
            [
              ['Materials and finish', 'Malzeme ve kaplama'],
              [
                'Specified material grades, protection system and relevant inspection documents.',
                'Belirtilen malzeme sınıfları, koruma sistemi ve ilgili muayene belgeleri.',
              ],
            ],
          ],
        ),
        paragraph(
          'Buyer’s decision: compare complete configurations. A lighter bare trailer and a heavier fully equipped trailer are not equivalent quotations. Ask what changes when options are added.',
          'Satın alma kararı: tam konfigürasyonları karşılaştırın. Daha hafif çıplak bir römork ile daha ağır tam donanımlı bir römork eşdeğer teklifler değildir. Seçenekler eklendiğinde neyin değiştiğini sorun.',
        ),
      ]),
      section(
        'Match the air supply to the receiving site',
        'Hava beslemesini alıcı sahaya uyarlayın',
        [
          paragraph(
            'Pneumatic conveying depends on the material, air supply and conveying route. Ask for compressor performance at the proposed operating conditions, alongside the hose diameter, horizontal distance, vertical lift and receiving-silo ventilation information. A motor power figure alone is not a complete selection basis.',
            'Pnömatik taşıma; malzemeye, hava beslemesine ve taşıma güzergâhına bağlıdır. Hortum çapı, yatay mesafe, düşey yükseklik ve alıcı silo havalandırması bilgileriyle birlikte önerilen çalışma koşullarındaki kompresör performansını isteyin. Tek başına motor gücü eksiksiz bir seçim temeli değildir.',
          ),
          table(
            [
              ['Power arrangement', 'Güç düzeni'],
              ['Questions to resolve', 'Çözülecek sorular'],
            ],
            [
              [
                ['Independent engine', 'Bağımsız motor'],
                [
                  'What fuel, maintenance, mounting and noise arrangements are proposed?',
                  'Hangi yakıt, bakım, montaj ve gürültü düzeni öneriliyor?',
                ],
              ],
              [
                ['Tractor power take-off', 'Çekici güç çıkışı'],
                [
                  'Is the actual tractor drivetrain, power availability and installation compatible?',
                  'Gerçek çekicinin aktarma sistemi, mevcut gücü ve kurulumu uyumlu mu?',
                ],
              ],
              [
                ['Electric or site supply', 'Elektrik veya saha beslemesi'],
                [
                  'Are voltage, power availability and connection arrangements confirmed?',
                  'Gerilim, mevcut güç ve bağlantı düzeni teyit edildi mi?',
                ],
              ],
            ],
          ),
          paragraph(
            'The time tool below converts an assumed delivery rate into minutes. It does not predict a compressor’s performance. Request a project-specific rate and define the material, load, conveying route and acceptance conditions before treating a time target as contractual.',
            'Aşağıdaki süre aracı, varsayılan bir debiyi dakikaya çevirir. Kompresör performansını tahmin etmez. Projeye özel debi isteyin; bir süre hedefini sözleşmeye bağlamadan önce malzemeyi, yükü, taşıma güzergâhını ve kabul koşullarını tanımlayın.',
          ),
        ],
        'unloading',
      ),
      section(
        'Confirm vehicle and destination requirements',
        'Araç ve hedef ülke gereksinimlerini teyit edin',
        [
          paragraph(
            'Provide the tractor specification and ask for written compatibility confirmation. Destination requirements must be checked by an appropriate local specialist; a configuration sold in one country is not automatically suitable for another.',
            'Çekici teknik bilgilerini sunun ve yazılı uyumluluk teyidi isteyin. Hedef ülke gereksinimlerini uygun bir yerel uzman kontrol etmelidir; bir ülkede satılan konfigürasyon diğerine otomatik olarak uygun değildir.',
          ),
          list([
            [
              'Coupling height and ratings, kingpin, axle loads and weight distribution.',
              'Bağlantı yüksekliği ve sınırları, kingpin, aks yükleri ve ağırlık dağılımı.',
            ],
            [
              'Braking and electrical interfaces, lighting, tyres and suspension.',
              'Fren ve elektrik bağlantıları, aydınlatma, lastikler ve süspansiyon.',
            ],
            [
              'Overall dimensions, route restrictions, registration documents and any local inspection process.',
              'Toplam ölçüler, güzergâh kısıtları, tescil belgeleri ve yerel muayene süreci.',
            ],
          ]),
        ],
      ),
      section('Put inspection and handover in writing', 'Muayene ve teslimi yazılı hale getirin', [
        paragraph(
          'Before ordering, agree the applicable design basis, inspection scope, document package and acceptance process. Ask which documents will identify your actual unit and who is responsible for local approvals. Avoid vague statements such as “all certificates included”.',
          'Siparişten önce geçerli tasarım esasını, muayene kapsamını, belge paketini ve kabul sürecini kararlaştırın. Hangi belgelerin gerçek ünitenizi tanımlayacağını ve yerel onaylardan kimin sorumlu olduğunu sorun. “Tüm sertifikalar dahil” gibi belirsiz ifadelerden kaçının.',
        ),
        list(
          [
            [
              'Configuration drawing, agreed specification and serial/unit identification.',
              'Konfigürasyon çizimi, kararlaştırılan teknik bilgiler ve seri/ünite kimliği.',
            ],
            [
              'Applicable test and inspection records, rated protection-device information and operating/maintenance manuals.',
              'Geçerli test ve muayene kayıtları, koruma cihazlarının anma bilgileri ve işletme/bakım kılavuzları.',
            ],
            [
              'Pre-delivery inspection, warranty scope, exclusions, spare-parts arrangements and handover responsibilities.',
              'Teslim öncesi muayene, garanti kapsamı, istisnalar, yedek parça düzeni ve teslim sorumlulukları.',
            ],
          ],
          'checklist',
        ),
        paragraph(
          'This guide is for purchase preparation. It is not an operating procedure and does not provide pressure settings, commissioning instructions or approval of a particular installation.',
          'Bu rehber satın alma hazırlığı içindir. İşletme prosedürü değildir; basınç ayarı, devreye alma talimatı veya belirli bir kurulum için onay sunmaz.',
        ),
      ]),
      section(
        'Compare landed cost and quotation scope',
        'Toplam teslim maliyetini ve teklif kapsamını karşılaştırın',
        [
          paragraph(
            'Record the currency, quotation validity, delivery basis and named place. Establish who pays for transport, insurance, clearance, duties and destination services. Confirm the required trade documents with your customs or logistics adviser; do not assume that a trailer price is the total cost of bringing it into service.',
            'Para birimini, teklif geçerliliğini, teslim esasını ve belirtilen yeri kaydedin. Nakliye, sigorta, gümrükleme, vergiler ve hedef ülke hizmetlerini kimin ödeyeceğini belirleyin. Gerekli ticari belgeleri gümrük veya lojistik danışmanınızla teyit edin; römork fiyatını hizmete alma toplam maliyeti olarak görmeyin.',
          ),
          paragraph(
            'For ownership cost, list energy, routine maintenance, tyres, inspections, downtime and financing separately. Use your fleet’s own values. The worksheet records coverage and open questions; it does not score quality, verify documents or recommend a supplier.',
            'Sahip olma maliyeti için enerji, rutin bakım, lastik, muayene, duruş ve finansmanı ayrı listeleyin. Kendi filonuzun değerlerini kullanın. Çalışma tablosu kapsamı ve açık soruları kaydeder; kalite puanı vermez, belgeleri doğrulamaz veya tedarikçi önermez.',
          ),
        ],
        'comparison',
      ),
      section(
        'Prepare one brief that every supplier can answer',
        'Her tedarikçinin yanıtlayabileceği tek bir özet hazırlayın',
        [
          paragraph(
            'Use the builder to assemble the known facts and the questions still to resolve. Leave unavailable details blank. You can download the brief for your own records or place it in the enquiry form below, review it and submit it to TECHNICSAN. Nothing is sent until you submit the sales form.',
            'Bilinen bilgileri ve çözülecek soruları birleştirmek için oluşturucuyu kullanın. Mevcut olmayan bilgileri boş bırakın. Özeti kayıtlarınız için indirebilir veya aşağıdaki talep formuna aktarabilir, inceleyip TECHNICSAN’a gönderebilirsiniz. Satış formunu göndermeden hiçbir şey iletilmez.',
          ),
        ],
        'rfq',
      ),
      section('Questions to settle before an order', 'Siparişten önce yanıtlanacak sorular', [
        table(
          [
            ['Buyer’s question', 'Alıcının sorusu'],
            ['What a useful answer contains', 'Yararlı bir yanıtın içeriği'],
          ],
          [
            [
              [
                'Does a larger tank mean a larger legal load?',
                'Daha büyük tank daha fazla yasal yük demek mi?',
              ],
              [
                'Not necessarily. Confirm the actual operating weights, axle distribution, vehicle ratings and local limits.',
                'Her zaman değil. Gerçek çalışma ağırlıklarını, aks dağılımını, araç sınırlarını ve yerel limitleri teyit edin.',
              ],
            ],
            [
              ['Can the unloading time be guaranteed?', 'Boşaltma süresi garanti edilebilir mi?'],
              [
                'Only assess a proposed commitment against defined material, load, site conditions and acceptance criteria.',
                'Önerilen taahhüdü yalnızca tanımlı malzeme, yük, saha koşulları ve kabul ölçütlerine göre değerlendirin.',
              ],
            ],
            [
              ['What should the final quotation identify?', 'Son teklif neleri tanımlamalı?'],
              [
                'The exact configuration, included equipment, documents, exclusions, delivery responsibilities and acceptance terms.',
                'Kesin konfigürasyon, dahil ekipman, belgeler, istisnalar, teslim sorumlulukları ve kabul koşulları.',
              ],
            ],
          ],
        ),
      ]),
    ],
    sources: [
      {
        title: 'Technical reference: cement pneumatic conveying',
        url: 'https://www.atlascopco.com/en-uk/compressors/industry-solutions/pneumatic-conveying-systems/cement',
      },
      {
        title: 'Technical reference: dry bulk air-supply selection',
        url: 'https://www.gardnerdenver.com/en-us/mobile/dry-bulk/dry-bulk-conveying-solutions-for-pneumatic-transport/',
      },
      {
        title: 'Trade reference: total landed cost',
        url: 'https://www.trade.gov/determine-total-export-price',
      },
      {
        title: 'Trade reference: delivery responsibilities and named places',
        url: 'https://academy.iccwbo.org/incoterms/article/place-of-delivery-risk-transfer-global-trade-contracts/',
      },
      {
        title: 'Weight terminology example: UK guidance (not global limits)',
        url: 'https://www.gov.uk/vehicle-weights-explained',
      },
    ],
  };
}
