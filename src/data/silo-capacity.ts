import { readFileSync } from 'node:fs';
import type { Article, Localized } from '../lib/types';
import type { GuideBlock } from '../lib/guides';

const en = (text: string): Localized => ({ en: text, tr: '' });
const clean = (text: string) =>
  text
    .replace(/\*\*/g, '')
    .replace(/^\*|\*$/g, '')
    .trim();
export const siloFigures = [
  {
    file: 'silo-usable-inventory',
    alt: 'An illustrative 80 cubic metre silo at 1.20 tonnes per cubic metre has 96 tonnes theoretical full-volume mass, 86.4 tonnes at an assumed 90 percent fill, and 82.4 tonnes usable after a 4 tonne unavailable allowance.',
    caption:
      'Figure 1 — Nominal volume versus usable inventory. The 80 m³, 1.20 t/m³, 90% fill and 4 t allowance are illustrative inputs, not permitted filling or structural loading limits.',
  },
  {
    file: 'silo-demand-delivery',
    alt: 'Daily demand of 32 tonnes gives a 16 tonne half-day reserve and 48 tonne reorder point at one operating day lead time. Adding a 28 tonne delivery gives a conservative 76 tonne working inventory target.',
    caption:
      'Figure 2 — Capacity planning: demand and delivery. The conservative scenario assumes a full delivery can arrive at the reorder point. It is not an inventory simulation or proof of safe receiving capacity.',
  },
  {
    file: 'silo-density-sensitivity',
    alt: 'With 80 cubic metres, 90 percent assumed filling and 4 tonnes unavailable, usable inventory rises from 68 to 96.8 tonnes as hypothetical bulk density increases from 1.00 to 1.40 tonnes per cubic metre.',
    caption:
      'Figure 3 — Bulk density sensitivity. Hypothetical density scenarios for an 80 m³ silo, 90% assumed fill and 4 t unavailable allowance. Actual material data and approved stored-mass limits must be verified.',
  },
];

export function siloCapacityGuide(): Article {
  const lines = readFileSync(
    new URL('./articles/cement-silo-capacity.en.md', import.meta.url),
    'utf8',
  ).split(/\r?\n/);
  const first = lines.findIndex((line) => line.startsWith('## 01.'));
  if (first < 1) throw Error('Complete numbered silo manuscript required.');
  const sections: Article['sections'] = [];
  let section: Article['sections'][number] | undefined;
  for (let i = first; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (line.startsWith('## ')) {
      section = { heading: en(line.replace(/^## (?:\d+\. )?/, '')), text: en(''), blocks: [] };
      sections.push(section);
      continue;
    }
    if (!section) throw Error('Missing article section.');
    const blocks = section.blocks!;
    if (line.startsWith('### ')) {
      blocks.push({ kind: 'heading', text: en(clean(line.slice(4))) });
      continue;
    }
    const figure = line.match(/\[Figure ([123]) /);
    if (figure) {
      const asset = siloFigures[Number(figure[1]) - 1];
      blocks.push({
        kind: 'figure',
        image: { src: `/images/guides/${asset.file}.webp`, alt: en(asset.alt) },
        caption: en(asset.caption),
      });
      continue;
    }
    if (line.includes('[Insert TECHNICSAN Cement Silo Capacity & Inventory Planner]')) {
      section.tool = 'silo';
      continue;
    }
    if (line.startsWith('**Explore cement silos |')) {
      blocks.push({
        kind: 'links',
        links: [
          { label: en('Explore cement silos'), href: '/en/categories/silos/' },
          { label: en('Explore cement bulkers'), href: '/en/categories/cement-bulker/' },
          { label: en('Explore compressors'), href: '/en/categories/compressors/' },
          { label: en('Request a quotation'), href: '/en/contact/?family=silos' },
        ],
      });
      continue;
    }
    if (line.startsWith('|')) {
      const cells = (row: string) =>
        row
          .split('|')
          .slice(1, -1)
          .map((cell) => en(clean(cell)));
      const table: GuideBlock = { kind: 'table', columns: cells(line), rows: [] };
      if (!/^\s*\|[\s:|-]+\|\s*$/.test(lines[++i])) throw Error('Missing table delimiter.');
      while (i + 1 < lines.length && lines[i + 1].trim().startsWith('|'))
        table.rows!.push({ cells: cells(lines[++i]) });
      blocks.push(table);
      continue;
    }
    if (line.startsWith('- ')) {
      const items = [en(clean(line.slice(2)))];
      while (i + 1 < lines.length && lines[i + 1].startsWith('- '))
        items.push(en(clean(lines[++i].slice(2))));
      blocks.push({ kind: 'list', items });
      continue;
    }
    const paragraph = [line];
    while (i + 1 < lines.length && lines[i + 1].trim() && !/^(#|- |\|)/.test(lines[i + 1]))
      paragraph.push(lines[++i].trim());
    blocks.push({ kind: 'paragraph', text: en(clean(paragraph.join(' '))) });
  }
  sections[0].blocks!.unshift(
    ...lines
      .slice(1, first)
      .join('\n')
      .trim()
      .split(/\n\s*\n/)
      .map((text): GuideBlock => ({ kind: 'paragraph', text: en(text) })),
  );
  return {
    id: 'guide-cement-silo-capacity',
    slug: {
      en: 'cement-silo-capacity-selection-guide',
      tr: 'cimento-silosu-kapasite-secim-rehberi',
    },
    title: en(lines[0].replace(/^# /, '')),
    excerpt: en(
      'Calculate cement demand, plan replenishment and compare silo configurations, usable inventory and installation requirements for your concrete batching plant.',
    ),
    tag: en('Bulk storage & production planning'),
    categoryId: 'silos',
    minutes: 15,
    image: '/images/history/silos.webp',
    imageAlt: en('Conceptual cement storage silos'),
    sections,
    relatedGuideIds: ['guide-cement-bulker-enquiry', 'guide-cement-bulker-unloading'],
    sources: [
      {
        title:
          'Mineral Products Association — Prevention of silo over-pressurisation during road tanker deliveries',
        url: 'https://www.mineralproducts.org/MPA/media/root/Publications/2022/MPA_Guidance_for_Prevention_of_Silo_Over-Pressurisation.pdf',
      },
      {
        title: 'Resources Safety & Health Queensland — Pressure build-up in silos',
        url: 'https://www.rshq.qld.gov.au/safety-and-health-alerts/mines/pressure-build-up-in-silos',
      },
    ],
    seoTitle: en('Cement Silo Capacity & Selection Guide | TECHNICSAN'),
    seoDescription: en(
      'Estimate cement silo volume, usable inventory, reorder points and autonomy. Compare storage configurations and prepare a complete silo quotation enquiry.',
    ),
    seoApproval: { en: 'pending', tr: 'pending' },
    sample: true,
    published: ['en'],
  };
}
