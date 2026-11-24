import type { Localized } from '../lib/types';

export interface HistoryMilestone {
  id: string;
  year: string;
  title: Localized;
  description: Localized;
  x: number;
  y: number;
  radius: number;
  branch: string;
}

// Owner-supplied chronology: illustration approval does not verify historical claims.
export const companyHistory = {
  approved: false,
  milestones: [
    {
      id: 'foundation',
      year: '1972',
      title: { en: 'The first spark', tr: 'İlk kıvılcım' },
      description: {
        en: 'Company founded, beginning with casting and moulding.',
        tr: 'Şirketin kuruluşu; döküm ve kalıp üretimiyle başlayan yolculuk.',
      },
      x: 650,
      y: 1010,
      radius: 240,
      branch: 'M650 1120 Q640 1060 650 1010',
    },
    {
      id: 'spare-parts',
      year: '1972–1992',
      title: { en: 'Building the foundations', tr: 'Temeller güçleniyor' },
      description: {
        en: 'Spare parts for pressure machinery during the early years, through 1992.',
        tr: 'İlk yıllardan 1992’ye kadar basınç makineleri için yedek parça üretimi.',
      },
      x: 300,
      y: 700,
      radius: 280,
      branch: 'M640 1010 Q560 760 300 730',
    },
    {
      id: 'compressors',
      year: '1992',
      title: { en: 'A new kind of pressure', tr: 'Basınçta yeni bir adım' },
      description: { en: 'Compressor production begins.', tr: 'Kompresör üretimi başlıyor.' },
      x: 1020,
      y: 690,
      radius: 275,
      branch: 'M650 930 Q800 690 1020 730',
    },
    {
      id: 'bulkers-lpg',
      year: '1996',
      title: { en: 'The next branch', tr: 'Yeni bir dal' },
      description: {
        en: 'Production expands to cement bulkers and LPG equipment.',
        tr: 'Üretim çimento silobaslarına ve LPG ekipmanlarına genişliyor.',
      },
      x: 330,
      y: 480,
      radius: 310,
      branch: 'M660 790 Q620 530 330 550',
    },
    {
      id: 'exports',
      year: '1999',
      title: { en: 'Beyond borders', tr: 'Sınırların ötesine' },
      description: {
        en: 'The first exports open a new chapter.',
        tr: 'İlk ihracatla yeni bir sayfa açılıyor.',
      },
      x: 1020,
      y: 450,
      radius: 280,
      branch: 'M670 720 Q860 540 1020 540',
    },
    {
      id: 'mixers',
      year: '2002',
      title: { en: 'Mixing new possibilities', tr: 'Yeni olanaklar şekilleniyor' },
      description: {
        en: 'Concrete mixers join the production range.',
        tr: 'Beton mikserleri üretim yelpazesine katılıyor.',
      },
      x: 460,
      y: 245,
      radius: 285,
      branch: 'M700 630 Q700 350 460 350',
    },
    {
      id: 'silos',
      year: '2006',
      title: { en: 'A growing horizon', tr: 'Büyüyen bir ufuk' },
      description: {
        en: 'Silo production adds another branch to the story.',
        tr: 'Silo üretimi bu yolculuğa yeni bir dal ekliyor.',
      },
      x: 1030,
      y: 145,
      radius: 330,
      branch: 'M720 530 Q850 300 1030 270',
    },
  ] satisfies HistoryMilestone[],
};

export function validateHistoryApproval(history = companyHistory) {
  if (!history.approved)
    throw new Error('Launch blocked: review and approve the company history before publication.');
}
