import { readFileSync } from 'node:fs';
import type { Article, Localized } from '../lib/types';
import type { GuideBlock } from '../lib/guides';

const en = (text: string): Localized => ({ en: text, tr: '' });
const clean = (text: string) =>
  text
    .replace(/\*\*/g, '')
    .replace(/^\*|\*$/g, '')
    .trim();
export const unloadingFigures = [
  {
    file: 'pneumatic-unloading-system',
    alt: 'Conceptual system connecting a compressor, tanker air distribution, discharge pipeline and receiving silo with separate ventilation and protection.',
    caption:
      'Figure 1 — Pneumatic cement unloading system. Conceptual, not to scale; not an operating or installation drawing. Components and protection arrangements require project-specific verification.',
  },
  {
    file: 'discharge-rate-turnaround',
    alt: 'For a 25-tonne payload plus 15 minutes handling, discharge rates of 25, 40, 60 and 80 tonnes per hour yield total turnaround times of 75, 52.5, 40 and 33.75 minutes.',
    caption:
      'Figure 2 — Discharge rate versus total turnaround time. Mathematical scenarios for a 25-tonne payload and 15 minutes additional handling; not guaranteed equipment performance.',
  },
  {
    file: 'annual-fleet-time',
    alt: 'Five vehicles making 300 deliveries each use 1,875 annual vehicle-hours at 75 minutes turnaround, compared with 1,125 hours at 45 minutes, releasing 750 vehicle-hours.',
    caption:
      'Figure 3 — Annual fleet time released. Five vehicles, 300 deliveries per vehicle, and turnaround reduced from 75 to 45 minutes release 750 vehicle-hours. Released time does not automatically produce cash savings.',
  },
];

/** Import the supplied editorial manuscript without inferring missing technical information. */
export function cementUnloadingGuide(): Article {
  const source = readFileSync(
    new URL('./articles/cement-bulker-unloading.en.md', import.meta.url),
    'utf8',
  );
  const lines = source.split(/\r?\n/);
  const title = lines[0].replace(/^# /, '');
  const firstSection = lines.findIndex((line) => line.startsWith('## 01.'));
  const intro = lines
    .slice(1, firstSection)
    .join('\n')
    .trim()
    .split(/\n\s*\n/);
  const sections: Article['sections'] = [];
  let current: Article['sections'][number] | undefined;
  let references = false;
  for (let i = firstSection; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (line.startsWith('## ')) {
      current = { heading: en(line.replace(/^## (?:\d+\. )?/, '')), text: en(''), blocks: [] };
      sections.push(current);
      continue;
    }
    if (!current) throw new Error('Content encountered before section heading.');
    const blocks = current.blocks!;
    if (line === '### Technical references') {
      references = true;
      continue;
    }
    if (references && line.startsWith('- ')) continue;
    if (line.startsWith('### ')) {
      blocks.push({ kind: 'heading', text: en(clean(line.slice(4))) });
      continue;
    }
    const figure = line.match(/\[Figure ([123]) /);
    if (figure) {
      const asset = unloadingFigures[Number(figure[1]) - 1];
      blocks.push({
        kind: 'figure',
        image: { src: `/images/guides/${asset.file}.webp`, alt: en(asset.alt) },
        caption: en(asset.caption),
      });
      continue;
    }
    if (line.includes('[Interactive tool')) {
      current.tool = 'unloading';
      continue;
    }
    if (line.startsWith('**Explore cement bulkers |')) {
      blocks.push({
        kind: 'links',
        links: [
          { label: en('Explore cement bulkers'), href: '/en/categories/cement-bulker/' },
          { label: en('Explore compressors'), href: '/en/categories/compressors/' },
          { label: en('Explore silos'), href: '/en/categories/silos/' },
          { label: en('Request a quotation'), href: '/en/contact/?family=cement-bulker' },
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
      if (!/^\s*\|[\s:|-]+\|\s*$/.test(lines[++i])) throw new Error('Missing table delimiter.');
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
    ...intro.map((text): GuideBlock => ({ kind: 'paragraph', text: en(text) })),
  );
  sections[7].tool = 'fleet';
  return {
    id: 'guide-cement-bulker-unloading',
    slug: {
      en: 'cement-bulker-unloading-compressor-selection',
      tr: 'cimento-silobasi-bosaltma-kompresor-secimi',
    },
    title: en(title),
    excerpt: en(
      'Understand pneumatic cement unloading, compare compressor duty points and assess how discharge performance affects fleet time and operating costs.',
    ),
    tag: en('Engineering & fleet performance'),
    categoryId: 'cement-bulker',
    image: '/images/products/cement-bulker-placeholder.svg',
    imageAlt: en('Cement bulker equipment'),
    minutes: 15,
    sections,
    sources: [
      {
        title: 'Gardner Denver Transport Solutions — XK Series dry bulk compressors',
        url: 'https://www.gdtransportsolutions.com/en/products/truck-mounted-compressors/xk-12-18/',
      },
      {
        title: 'Gardner Denver Transport Solutions — TR20 oil-free screw compressor',
        url: 'https://www.gdtransportsolutions.com/en/truck-mounted-compressors/tr20/',
      },
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
    seoTitle: en('Cement Bulker Unloading & Compressor Selection | TECHNICSAN'),
    seoDescription: en(
      'Compare compressor configurations, evaluate cement unloading performance and calculate illustrative turnaround time and annual fleet time value.',
    ),
    seoApproval: { en: 'pending', tr: 'pending' },
    sample: true,
    published: ['en'],
  };
}
