import { sectionComplete } from '../src/lib/guides';
import { defineType, defineField, defineArrayMember } from 'sanity';
import { productTypes } from '../src/data/product-types';
const required = (rule: any) => rule.required();
const localeFields = (type: string) =>
  ['tr', 'en'].map((code) =>
    defineField({
      name: code,
      title: code === 'tr' ? 'Türkçe' : 'English',
      type,
    }),
  );
const localeString = defineType({
  name: 'localeString',
  title: 'Bilingual text',
  type: 'object',
  fields: localeFields('string'),
});
const localeText = defineType({
  name: 'localeText',
  title: 'Bilingual description',
  type: 'object',
  fields: localeFields('text'),
});
const companyCopy = defineType({
  name: 'companyCopy',
  title: 'Company copy awaiting approval',
  type: 'object',
  fields: ['tr', 'en'].map((name) =>
    defineField({ name, title: name === 'tr' ? 'Türkçe' : 'English', type: 'text' }),
  ),
});
const localeSlug = defineType({
  name: 'localeSlug',
  title: 'URLs',
  type: 'object',
  fields: ['tr', 'en'].map((name) =>
    defineField({
      name,
      type: 'string',
      title: name.toUpperCase(),
      description: 'Lowercase ASCII letters, digits and hyphens. Keep stable after publishing.',
      validation: (rule) => rule.required().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    }),
  ),
});
const localizedList = defineType({
  name: 'localizedList',
  title: 'Bilingual list',
  type: 'object',
  fields: ['tr', 'en'].map((name) =>
    defineField({ name, type: 'array', of: [{ type: 'string' }], validation: required }),
  ),
});
const id = () =>
  defineField({
    name: 'id',
    title: 'Stable internal reference',
    type: 'string',
    description: 'Unique across content types. Do not change after launch.',
    initialValue: () => crypto.randomUUID(),
    validation: (rule) => rule.required().regex(/^[a-zA-Z0-9_-]+$/),
  });
const slug = () => defineField({ name: 'slug', type: 'localeSlug', validation: required });
const published = () =>
  defineField({
    name: 'published',
    title: 'Publish these languages',
    type: 'array',
    of: [{ type: 'string' }],
    options: {
      list: [
        { title: 'Türkçe', value: 'tr' },
        { title: 'English', value: 'en' },
      ],
    },
    initialValue: ['tr', 'en'],
    validation: (rule) => rule.required().min(1).unique(),
  });
const sample = () =>
  defineField({
    name: 'sample',
    title: 'Sample / unverified content',
    type: 'boolean',
    initialValue: true,
    description: 'Only switch off after verifying facts, rights and company approval.',
    validation: required,
  });
const spec = defineType({
  name: 'spec',
  title: 'Specification',
  type: 'object',
  fields: [
    defineField({ name: 'label', type: 'localeString', validation: required }),
    defineField({ name: 'value', type: 'string', validation: required }),
  ],
});
const machineImage = defineType({
  name: 'machineImage',
  title: 'Product photograph',
  type: 'image',
  options: { hotspot: true },
  fields: [
    defineField({
      name: 'alt',
      title: 'Image description',
      type: 'localeString',
      validation: required,
    }),
    defineField({
      name: 'illustrative',
      type: 'boolean',
      title: 'Illustrative or placeholder image',
      initialValue: true,
      validation: required,
    }),
    defineField({
      name: 'placeholder',
      title: 'Temporary photography placeholder',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({ name: 'sourceUrl', title: 'Original photograph URL', type: 'url' }),
    defineField({ name: 'credit', title: 'Photograph credit', type: 'string' }),
    defineField({
      name: 'rightsStatus',
      title: 'Photograph reuse permission',
      type: 'string',
      options: { list: ['pending', 'approved'] },
      initialValue: 'pending',
    }),
  ],
});
const seoApproval = defineType({
  name: 'seoApproval',
  title: 'Search approval by language',
  type: 'object',
  fields: ['en', 'tr'].map((name) =>
    defineField({
      name,
      title: name.toUpperCase(),
      type: 'string',
      options: { list: ['pending', 'approved'] },
      initialValue: 'pending',
    }),
  ),
});
const seoFields = () => [
  defineField({
    name: 'seoTitle',
    title: 'Search title (without TECHNICSAN suffix)',
    type: 'companyCopy',
  }),
  defineField({ name: 'seoDescription', title: 'Search description', type: 'companyCopy' }),
  defineField({
    name: 'seoApproval',
    type: 'seoApproval',
    initialValue: { en: 'pending', tr: 'pending' },
    description:
      'Publishing is separate from search approval. Use the Search readiness tab. Missing evidence always keeps a page noindex.',
  }),
];
const pageSeo = defineType({
  name: 'pageSeo',
  title: 'Page search settings',
  type: 'object',
  fields: seoFields(),
});
const editorialSection = {
  type: 'object',
  fields: [
    defineField({ name: 'heading', type: 'localeString' }),
    defineField({ name: 'text', type: 'localeText' }),
  ],
};
const machineFields = (used: boolean) => [
  ...seoFields(),
  id(),
  slug(),
  defineField({ name: 'name', type: 'localeString', validation: required }),
  defineField({ name: 'model', type: 'string', validation: required }),
  defineField({
    name: 'catalogueOrder',
    title: 'Catalogue display order',
    type: 'number',
    validation: (rule) => rule.integer().min(1),
  }),
  defineField({
    name: 'modelVerified',
    title: 'Real TECHNICSAN model identifier verified',
    type: 'boolean',
    initialValue: false,
  }),
  defineField({
    name: 'sku',
    title: 'Actual company SKU (optional)',
    type: 'string',
    description:
      'Leave blank if no genuine company identifier exists. Never use an imported supplier code or internal CMS ID.',
  }),
  defineField({
    name: 'category',
    type: 'reference',
    to: [{ type: 'category' }],
    validation: required,
  }),
  defineField({ name: 'brand', type: 'reference', to: [{ type: 'brand' }] }),
  defineField({
    name: 'status',
    type: 'string',
    options: { list: ['available', 'reserved', 'sold'] },
    initialValue: 'available',
    validation: required,
  }),
  ...(used
    ? [
        defineField({
          name: 'year',
          type: 'number',
          validation: (rule) =>
            rule
              .required()
              .integer()
              .min(1950)
              .max(new Date().getFullYear() + 1),
        }),
        defineField({
          name: 'hours',
          type: 'number',
          validation: (rule) => rule.required().min(0),
        }),
        defineField({ name: 'condition', type: 'localeText', validation: required }),
      ]
    : []),
  defineField({ name: 'summary', type: 'localeText', validation: required }),
  defineField({ name: 'description', type: 'localeText', validation: required }),
  defineField({ name: 'applications', type: 'localizedList', validation: required }),
  defineField({
    name: 'specs',
    type: 'array',
    of: [{ type: 'spec' }],
    validation: (rule) =>
      rule
        .required()
        .custom((items, context) =>
          context.document?.sample || (Array.isArray(items) && items.length > 0)
            ? true
            : 'Add verified product specifications before publishing',
        ),
  }),
  defineField({
    name: 'images',
    type: 'array',
    of: [{ type: 'machineImage' }],
    validation: (rule) => rule.required().min(1),
  }),
  defineField({
    name: 'brochure',
    type: 'file',
    fields: [defineField({ name: 'label', type: 'localeString', validation: required })],
    options: { accept: '.pdf' },
  }),
  defineField({
    name: 'source',
    title: 'Public technical reference note',
    description:
      'The free dataset is public. Use a neutral note here; keep confidential documentation and supplier provenance outside Sanity.',
    type: 'string',
    validation: required,
  }),
  defineField({
    name: 'reference',
    title: 'Manufacturer source and review',
    type: 'object',
    fields: [
      defineField({ name: 'publisher', type: 'string', validation: required }),
      defineField({ name: 'url', type: 'url', validation: required }),
      defineField({ name: 'retrievedAt', type: 'date', validation: required }),
      defineField({
        name: 'reviewStatus',
        type: 'string',
        options: { list: ['pending', 'approved'] },
        initialValue: 'pending',
        validation: required,
      }),
      defineField({ name: 'notes', type: 'localeText' }),
      defineField({ name: 'section', title: 'Source catalogue row', type: 'string' }),
      defineField({ name: 'originalLabel', title: 'Original source label', type: 'string' }),
    ],
  }),
  defineField({
    name: 'specificationTable',
    title: 'Configuration comparison table',
    type: 'object',
    fields: [
      defineField({
        name: 'columns',
        type: 'array',
        of: [{ type: 'string' }],
        validation: (rule) => rule.required().min(1),
      }),
      defineField({
        name: 'rows',
        type: 'array',
        of: [
          {
            type: 'object',
            fields: [
              defineField({ name: 'label', type: 'localeString', validation: required }),
              defineField({
                name: 'values',
                type: 'array',
                of: [{ type: 'string' }],
                validation: required,
              }),
            ],
          },
        ],
        validation: (rule) => rule.required().min(1),
      }),
    ],
  }),
  sample(),
  defineField({
    name: 'technicalReview',
    title: 'Technical review',
    type: 'string',
    options: { list: ['pending', 'approved'] },
    initialValue: 'pending',
  }),
  published(),
];
const translatedDocument = (rule: any) =>
  rule.custom((doc: any) => {
    if (!doc) return true;
    for (const locale of doc.published || ['en', 'tr']) {
      const required =
        doc._type === 'article'
          ? ['title', 'excerpt', 'tag']
          : doc._type === 'category'
            ? ['name', 'description']
            : ['name', 'summary', 'description'];
      if (required.some((field) => !doc[field]?.[locale]?.trim()))
        return `Complete required ${locale} text or remove that language from publication.`;
      if (doc._type === 'article' && doc.sections?.some((s: any) => !sectionComplete(s, locale)))
        return `Complete ${locale} article sections.`;
      if (
        ['newModel', 'usedMachine'].includes(doc._type) &&
        (doc.images?.some((i: any) => !i.alt?.[locale]) ||
          doc.specs?.some((s: any) => !s.label?.[locale]) ||
          !doc.applications?.[locale]?.length)
      )
        return `Complete ${locale} image descriptions, specification labels and applications.`;
    }
    return true;
  });
const preview = { select: { title: 'name.en', subtitle: 'model', media: 'images.0' } };
const newModel = defineType({
  name: 'newModel',
  title: 'Products',
  type: 'document',
  fields: machineFields(false),
  validation: translatedDocument,
  preview,
});
const usedMachine = defineType({
  name: 'usedMachine',
  title: 'Legacy used-product records',
  type: 'document',
  fields: machineFields(true),
  validation: translatedDocument,
  preview,
});
const category = defineType({
  name: 'category',
  title: 'Product types (fixed five)',
  validation: translatedDocument,
  type: 'document',
  fields: [
    ...seoFields(),
    published(),
    defineField({
      name: 'editorial',
      title: 'Category landing page',
      type: 'object',
      fields: [
        defineField({ name: 'heading', title: 'Descriptive page heading', type: 'localeString' }),
        defineField({ name: 'overview', type: 'localeText' }),
        defineField({ name: 'sections', type: 'array', of: [editorialSection] }),
        defineField({
          name: 'questions',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                defineField({ name: 'question', type: 'localeString' }),
                defineField({ name: 'answer', type: 'localeText' }),
              ],
            },
          ],
        }),
        defineField({
          name: 'evidence',
          title: 'Reviewed production evidence',
          type: 'companyCopy',
          description:
            'Only original, verifiable manufacturing information for this family. Do not infer capabilities from imported catalogue entries. Required for search approval.',
        }),
      ],
    }),
    defineField({
      name: 'id',
      title: 'Approved product type',
      type: 'string',
      options: { list: productTypes.map((type) => ({ title: type.name.en, value: type.id })) },
      validation: (rule) =>
        rule
          .required()
          .regex(new RegExp('^(' + productTypes.map((type) => type.id).join('|') + ')$')),
    }),
    slug(),
    defineField({ name: 'name', type: 'localeString', validation: required }),
    defineField({ name: 'description', type: 'localeText', validation: required }),
    defineField({
      name: 'requirements',
      title: 'Information to discuss with the buyer',
      type: 'localizedList',
    }),
    defineField({
      name: 'icon',
      type: 'string',
      options: { list: productTypes.map((type) => type.id) },
      initialValue: 'cement-bulker',
      validation: required,
    }),
  ],
  preview: { select: { title: 'name.en' } },
});
const brand = defineType({
  name: 'brand',
  title: 'Brands',
  type: 'document',
  fields: [
    id(),
    defineField({ name: 'name', type: 'string', validation: required }),
    defineField({ name: 'description', type: 'localeText', validation: required }),
    defineField({
      name: 'verified',
      title: 'Brand information verified',
      type: 'boolean',
      initialValue: false,
    }),
  ],
});
const guideBlock = defineType({
  name: 'guideBlock',
  title: 'Guide content block',
  type: 'object',
  fields: [
    defineField({
      name: 'kind',
      type: 'string',
      options: { list: ['paragraph', 'list', 'table', 'figure', 'checklist'] },
      validation: required,
    }),
    defineField({
      name: 'text',
      type: 'localeText',
      hidden: ({ parent }: any) => parent?.kind !== 'paragraph',
    }),
    defineField({
      name: 'items',
      type: 'array',
      of: [{ type: 'localeString' }],
      hidden: ({ parent }: any) => !['list', 'checklist'].includes(parent?.kind),
    }),
    defineField({
      name: 'columns',
      type: 'array',
      of: [{ type: 'localeString' }],
      hidden: ({ parent }: any) => parent?.kind !== 'table',
    }),
    defineField({
      name: 'rows',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [defineField({ name: 'cells', type: 'array', of: [{ type: 'localeText' }] })],
        },
      ],
      hidden: ({ parent }: any) => parent?.kind !== 'table',
    }),
    defineField({
      name: 'image',
      type: 'image',
      fields: [defineField({ name: 'alt', type: 'localeString' })],
      hidden: ({ parent }: any) => parent?.kind !== 'figure',
    }),
    defineField({
      name: 'caption',
      type: 'localeText',
      hidden: ({ parent }: any) => parent?.kind !== 'figure',
    }),
  ],
  preview: { select: { title: 'kind', subtitle: 'text.en', media: 'image' } },
});
const article = defineType({
  name: 'article',
  title: 'Guides & articles',
  validation: translatedDocument,
  type: 'document',
  fields: [
    ...seoFields(),
    defineField({
      name: 'publishedAt',
      title: 'Actual publication date',
      type: 'datetime',
      description: 'Record the first public release date; do not backdate a draft.',
    }),
    id(),
    slug(),
    defineField({ name: 'title', type: 'localeString', validation: required }),
    defineField({ name: 'excerpt', type: 'localeText', validation: required }),
    defineField({ name: 'tag', type: 'localeString', validation: required }),
    defineField({
      name: 'image',
      type: 'image',
      fields: [defineField({ name: 'alt', title: 'Image description', type: 'localeString' })],
      validation: required,
    }),
    defineField({
      name: 'category',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: required,
    }),
    defineField({
      name: 'minutes',
      title: 'Legacy reading time (website calculates automatically)',
      hidden: true,
      type: 'number',
      initialValue: 4,
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'sections',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'heading', type: 'localeString', validation: required }),
            defineField({
              name: 'text',
              title: 'Legacy text (used when blocks are empty)',
              type: 'localeText',
            }),
            defineField({ name: 'blocks', type: 'array', of: [{ type: 'guideBlock' }] }),
            defineField({
              name: 'tool',
              title: 'Cement bulker buyer tool',
              type: 'string',
              description:
                'Optional cement bulker procurement tool, shown after this section’s text.',
              validation: (rule) =>
                rule.custom(
                  (value, context) =>
                    !value ||
                    (context.document?.category as any)?._ref === 'category-cement-bulker' ||
                    'These tools currently support the cement bulker category only.',
                ),
              options: {
                list: [
                  { title: 'Payload estimator', value: 'payload' },
                  { title: 'Equipment diagram', value: 'components' },
                  { title: 'Unloading time estimator', value: 'unloading' },
                  { title: 'Quotation comparison', value: 'comparison' },
                  { title: 'RFQ builder and sales form', value: 'rfq' },
                ],
              },
            }),
          ],
        }),
      ],
      validation: (rule) =>
        rule
          .required()
          .min(1)
          .custom((sections: any) => {
            const tools = (sections || []).map((s: any) => s.tool).filter(Boolean);
            return (
              new Set(tools).size === tools.length ||
              'Use each interactive tool only once per guide.'
            );
          }),
    }),
    defineField({
      name: 'sources',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'title', type: 'string', validation: required }),
            defineField({
              name: 'url',
              type: 'url',
              validation: (rule) => rule.required().uri({ scheme: ['https'] }),
            }),
          ],
        },
      ],
      initialValue: [],
    }),
    defineField({
      name: 'author',
      type: 'string',
      description: 'Actual author. Required by the live build.',
      validation: (rule) =>
        rule.custom((value, context) =>
          context.document?.sample || value?.trim()
            ? true
            : 'Add the actual author before publishing reviewed content.',
        ),
    }),
    defineField({
      name: 'reviewer',
      type: 'string',
      description: 'Actual reviewer. Required by the live build.',
      validation: (rule) =>
        rule.custom((value, context) =>
          context.document?.sample || value?.trim()
            ? true
            : 'Add the actual reviewer before publishing reviewed content.',
        ),
    }),
    defineField({
      name: 'reviewedAt',
      type: 'datetime',
      validation: (rule) =>
        rule.custom((value, context) =>
          context.document?.sample || (value && Number.isFinite(Date.parse(value)))
            ? true
            : 'Record the review date before publishing reviewed content.',
        ),
    }),
    sample(),
    published(),
  ],
  preview: { select: { title: 'title.en', media: 'image' } },
});
const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Company & launch settings',
  type: 'document',
  fields: [
    defineField({
      name: 'searchReleaseMode',
      title: 'Search release scope',
      type: 'string',
      initialValue: 'company',
      options: {
        list: [
          { title: 'Brand presence — Home and Contact only', value: 'brand-only' },
          {
            title: 'Company release — full evidence and page approvals required',
            value: 'company',
          },
        ],
      },
      description:
        'Brand presence uses confirmed brand/contact facts only. It does not verify legal identity, manufacturing, privacy review, products, guides or history.',
    }),

    defineField({
      name: 'featuredGuide',
      title: 'Featured guide',
      type: 'reference',
      to: [{ type: 'article' }],
    }),
    defineField({
      name: 'pageSeo',
      title: 'Home, About and Contact search approval',
      type: 'object',
      fields: ['home', 'about', 'contact'].map((name) => defineField({ name, type: 'pageSeo' })),
    }),
    defineField({
      name: 'manufacturerVerified',
      title: 'Manufacturing role verified against company evidence',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'historyApproved',
      title: 'Visible company history reviewed and approved',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'name',
      title: 'Display name',
      type: 'string',
      initialValue: 'TECHNICSAN',
      validation: required,
    }),
    defineField({ name: 'legalName', title: 'Verified company name', type: 'string' }),
    defineField({
      name: 'about',
      title: 'Approved company description',
      type: 'companyCopy',
      validation: (rule) =>
        rule.custom((value, context) => {
          const copy = value as { tr?: string; en?: string } | undefined;
          return !context.document?.identityVerified || copy?.tr?.trim() || copy?.en?.trim()
            ? true
            : 'Add approved company copy. Each language is released separately.';
        }),
    }),
    defineField({
      name: 'privacyNotice',
      title: 'Approved privacy notice',
      type: 'companyCopy',
      validation: (rule) =>
        rule.custom((value, context) => {
          const copy = value as { tr?: string; en?: string } | undefined;
          return !context.document?.privacyReviewed || copy?.tr?.trim() || copy?.en?.trim()
            ? true
            : 'Add the reviewed notice. Each searchable language needs its own approved notice.';
        }),
    }),
    defineField({ name: 'heroImage', title: 'Approved homepage photograph', type: 'machineImage' }),
    defineField({ name: 'identityVerified', type: 'boolean', initialValue: false }),
    defineField({ name: 'city', type: 'string', initialValue: 'Ankara', validation: required }),
    defineField({ name: 'address', type: 'text' }),
    defineField({ name: 'phone', type: 'string' }),
    defineField({
      name: 'whatsapp',
      type: 'string',
      description: 'International number, e.g. +90 followed by the number.',
    }),
    defineField({ name: 'email', type: 'string', validation: (rule) => rule.email() }),
    defineField({
      name: 'turnstileSiteKey',
      type: 'string',
      description: 'Public key only. The secret belongs in Cloudflare.',
    }),
    defineField({
      name: 'privacyReviewed',
      title: 'Company privacy review complete',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: { select: { title: 'name' } },
});
export const schemaTypes = [
  seoApproval,
  pageSeo,
  localeString,
  localeText,
  companyCopy,
  localeSlug,
  localizedList,
  spec,
  machineImage,
  siteSettings,
  category,
  brand,
  newModel,
  usedMachine,
  guideBlock,
  article,
];
