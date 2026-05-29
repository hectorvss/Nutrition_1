import type { CategoryId, ResourceArticle } from './types';
import { guides } from './guides.content';
import { articles } from './articles.content';
import { stories } from './stories.content';
import { docs } from './docs.content';

export type { CategoryId, ResourceArticle, Block } from './types';

export const ALL_ARTICLES: ResourceArticle[] = [...guides, ...articles, ...stories, ...docs];

export const articlesByCategory = (cat: CategoryId): ResourceArticle[] =>
  ALL_ARTICLES.filter((a) => a.category === cat);

export const findArticle = (id: string): ResourceArticle | undefined =>
  ALL_ARTICLES.find((a) => a.id === id);
