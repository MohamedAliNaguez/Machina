import { defineType, defineField, defineArrayMember } from 'sanity';
const required = (rule: any) => rule.required();
const localeFields = (type: string) =>
  ['tr', 'en'].map((code) =>
    defineField({
      name: code,
      title: code === 'tr' ? 'Türkçe' : 'English',
      type,
      validation: required,
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
  title: 'Machine photograph',
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
      title: 'Illustrative image (not the actual unit)',
      initialValue: true,
      validation: required,
    }),
  ],
});
const machineFields = (used: boolean) => [
  id(),
  slug(),
  defineField({ name: 'name', type: 'localeString', validation: required }),
  defineField({ name: 'model', type: 'string', validation: required }),
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
    validation: (rule) => rule.required().min(1),
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
    title: 'Public source / manufacturer reference',
    description: 'Shown on the website. Never enter private notes or personal information.',
    type: 'string',
    validation: required,
  }),
  sample(),
  published(),
];
const preview = { select: { title: 'name.en', subtitle: 'model', media: 'images.0' } };
const newModel = defineType({
  name: 'newModel',
  title: 'New machine models',
  type: 'document',
  fields: machineFields(false),
  preview,
});
const usedMachine = defineType({
  name: 'usedMachine',
  title: 'Used machine listings',
  type: 'document',
  fields: machineFields(true),
  preview,
});
const category = defineType({
  name: 'category',
  title: 'Categories',
  type: 'document',
  fields: [
    id(),
    slug(),
    defineField({ name: 'name', type: 'localeString', validation: required }),
    defineField({ name: 'description', type: 'localeText', validation: required }),
    defineField({
      name: 'icon',
      type: 'string',
      options: { list: ['excavator', 'loader', 'roller', 'crane', 'bucket'] },
      initialValue: 'excavator',
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
const article = defineType({
  name: 'article',
  title: 'Guides & articles',
  type: 'document',
  fields: [
    id(),
    slug(),
    defineField({ name: 'title', type: 'localeString', validation: required }),
    defineField({ name: 'excerpt', type: 'localeText', validation: required }),
    defineField({ name: 'tag', type: 'localeString', validation: required }),
    defineField({ name: 'image', type: 'image', validation: required }),
    defineField({
      name: 'category',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: required,
    }),
    defineField({
      name: 'minutes',
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
            defineField({ name: 'text', type: 'localeText', validation: required }),
          ],
        }),
      ],
      validation: (rule) => rule.required().min(1),
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
      description: 'Actual author or reviewer. Required by the live build.',
    }),
    defineField({ name: 'reviewedAt', type: 'datetime' }),
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
    defineField({ name: 'name', title: 'Display name', type: 'string', validation: required }),
    defineField({ name: 'legalName', title: 'Verified company name', type: 'string' }),
    defineField({ name: 'about', title: 'Approved company description', type: 'localeText' }),
    defineField({ name: 'privacyNotice', title: 'Approved privacy notice', type: 'localeText' }),
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
  localeString,
  localeText,
  localeSlug,
  localizedList,
  spec,
  machineImage,
  siteSettings,
  category,
  brand,
  newModel,
  usedMachine,
  article,
];
