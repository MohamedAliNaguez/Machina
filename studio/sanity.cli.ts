import { defineCliConfig } from 'sanity/cli';
import config from '../src/data/sanity.json';
export default defineCliConfig({
  deployment: { appId: 's3ywv6nf7opejwis09g4b4su' },
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || config.projectId,
    dataset: process.env.SANITY_STUDIO_DATASET || config.dataset,
  },
});
