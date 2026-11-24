import type { Content, Machine, Article, Settings } from '../lib/types';
import products from './catalogue-products.json';
import settings from './repository-settings.json';
import articles from './repository-articles.json';
import contact from './contact.json';
import { productTypes } from './product-types';

export const repositoryContent: Content = {
  settings: { ...settings, ...contact } as Settings,
  categories: productTypes,
  machines: products as Machine[],
  articles: articles as Article[],
  brands: [],
};
