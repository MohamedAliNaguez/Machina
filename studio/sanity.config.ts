import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './schema';
import { ContentPreview } from './ContentPreview';

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
if (!projectId)
  throw new Error(
    'Set SANITY_STUDIO_PROJECT_ID in studio/.env after creating your own free Sanity project. See README.md.',
  );
export default defineConfig({
  name: 'machinery',
  title: 'Machinery · Content studio',
  projectId,
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Company content')
          .items([
            S.listItem()
              .title('Company & launch settings')
              .id('siteSettings')
              .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
            ...S.documentTypeListItems().filter((item) => item.getId() !== 'siteSettings'),
          ]),
      defaultDocumentNode: (S) =>
        S.document().views([
          S.view.form(),
          S.view.component(ContentPreview).title('Bilingual preview'),
        ]),
    }),
  ],
  schema: { types: schemaTypes },
  document: {
    newDocumentOptions: (previous) => previous.filter((item) => item.templateId !== 'siteSettings'),
  },
});
