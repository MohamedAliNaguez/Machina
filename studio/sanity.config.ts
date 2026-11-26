import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './schema';
import { ContentPreview } from './ContentPreview';
import { SearchReadiness } from './SearchReadiness';
import config from '../src/data/sanity.json';
import { productTypes } from '../src/data/product-types';
import { WebsiteStatusTool } from './WebsiteStatusTool';

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || config.projectId;
if (!projectId)
  throw new Error(
    'Set SANITY_STUDIO_PROJECT_ID in studio/.env after creating your own free Sanity project. See README.md.',
  );
export default defineConfig({
  name: 'machinery',
  title: 'TECHNICSAN · Content studio',
  projectId,
  dataset: process.env.SANITY_STUDIO_DATASET || config.dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('TECHNICSAN content')
          .items([
            S.listItem()
              .title('Company & launch settings')
              .id('siteSettings')
              .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
            S.documentTypeListItem('newModel').title('Products'),
            S.documentTypeListItem('article').title('Guides & articles'),
            S.listItem()
              .title('Five product families')
              .id('families')
              .child(
                S.list()
                  .title('Product families')
                  .items(
                    productTypes.map((type) =>
                      S.listItem()
                        .title(type.name.en)
                        .id(type.id)
                        .child(
                          S.document().schemaType('category').documentId(`category-${type.id}`),
                        ),
                    ),
                  ),
              ),
          ]),
      defaultDocumentNode: (S) =>
        S.document().views([
          S.view.form(),
          S.view.component(ContentPreview).title('Bilingual preview'),
          S.view.component(SearchReadiness).title('Search readiness'),
        ]),
    }),
  ],
  schema: { types: schemaTypes },
  tools: [{ name: 'website-status', title: 'Website status', component: WebsiteStatusTool }],
  document: {
    actions: (previous, context) =>
      context.schemaType === 'websiteAvailability'
        ? []
        : ['siteSettings', 'category'].includes(context.schemaType)
          ? previous.filter(
              (action) => !['delete', 'duplicate', 'unpublish'].includes(action.action || ''),
            )
          : previous,
    newDocumentOptions: (previous) =>
      previous.filter(
        (item) =>
          !['websiteAvailability', 'siteSettings', 'usedMachine', 'category', 'brand'].includes(
            item.templateId,
          ),
      ),
  },
});
