import { getCliClient } from 'sanity/cli';
import { mkdir, writeFile } from 'node:fs/promises';
async function main() {
  const client = getCliClient({ apiVersion: '2025-02-19' }).withConfig({ useCdn: false });
  const docs = await client.fetch<any[]>(
    '*[_id in ["siteSettings","drafts.siteSettings"]]',
    {},
    { perspective: 'raw' },
  );
  if (!docs.some((d) => d._id === 'siteSettings')) throw Error('Published settings missing.');
  for (const d of docs)
    if (
      d.name !== 'TECHNICSAN' ||
      d.email !== 'info@technicsan.com' ||
      d.phone?.replace(/\s/g, '') !== '+905327122417'
    )
      throw Error('Brand/contact details differ from the approved values; no update made.');
  await mkdir('../.local/sanity', { recursive: true });
  await writeFile(
    `../.local/sanity/brand-search-before-${Date.now()}.json`,
    JSON.stringify(docs, null, 2),
  );
  const home = {
    seoTitle: { en: 'Industrial Equipment Catalogue', tr: 'Endüstriyel Ekipman Kataloğu' },
    seoDescription: {
      en: 'Explore TECHNICSAN cement bulkers, LPG equipment, compressors, concrete mixers and silos. Contact our sales team in Ankara, Turkey about your requirements.',
      tr: 'TECHNICSAN çimento silobaslarını, LPG ekipmanlarını, kompresörlerini, beton mikserlerini ve silolarını inceleyin. İhtiyaçlarınız için Ankara’daki satış ekibiyle iletişime geçin.',
    },
    seoApproval: { en: 'approved', tr: 'approved' },
  };
  const contact = {
    seoTitle: {
      en: 'Contact Sales for Industrial Equipment',
      tr: 'Endüstriyel Ekipman için Satış İletişimi',
    },
    seoDescription: {
      en: 'Contact TECHNICSAN at info@technicsan.com or +90 532 712 24 17. Discuss cement bulkers, LPG equipment, compressors, mixers and silos with our Ankara sales team.',
      tr: 'TECHNICSAN ile info@technicsan.com veya +90 532 712 24 17 üzerinden iletişime geçin. Çimento silobası, LPG ekipmanları, kompresörler, mikserler ve silolar için Ankara satış ekibiyle görüşün.',
    },
    seoApproval: { en: 'approved', tr: 'approved' },
  };
  let tx = client.transaction();
  for (const doc of docs)
    tx = tx.patch(doc._id, (p) =>
      p
        .ifRevisionId(doc._rev)
        .set({ searchReleaseMode: 'brand-only', 'pageSeo.home': home, 'pageSeo.contact': contact }),
    );
  await tx.commit();
  console.log(
    'Approved bilingual Home and Contact metadata under brand-only scope. Legal identity, factory address, manufacturing, privacy review, history, product and guide approvals were not changed.',
  );
}
main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
