import { response } from 'express';
import { truthy } from '../../../../app/helpers/truthy';
import { Category } from '../../../../app/models/categories/category.interface';
import { getCategoriesChunkFromWB, WBCategory } from '../../../../app/services/api/models/wb/categories/wb-category.interface';
import { caught } from '../../../helpers/caught/caught';
import { smartFetch } from '../../../helpers/smart-fetch';
import { CategoriesListResponse } from './models/categories-list-response.interface';
import { FlatCategory } from './models/flat-category.interface';

export const WB_CATALOG_URL = 'https://static-basket-01.wb.ru/vol0/data/main-menu-ru-ru-v2.json';

export async function getCategoriesList(extractSlugs: false): Promise<CategoriesListResponse<FlatCategory>>;
export async function getCategoriesList(extractSlugs: true): Promise<CategoriesListResponse<string>>;
export async function getCategoriesList(extractSlugs: boolean): Promise<CategoriesListResponse<string | FlatCategory>> {
  const categoriesResponse = await smartFetch(response, WB_CATALOG_URL);
  if (!categoriesResponse) {
    return {
      status: 200,
      result: [],
    };
  }
  const [jsonError, responseBody] = await caught(categoriesResponse.json());
  if (jsonError) {
    return {
      status: 500,
      error: jsonError,
    };
  }
  const categories = getCategoriesChunkFromWB(responseBody as WBCategory[]);
  if (extractSlugs) {
    const result = [...new Set(categories.items.flatMap((category: Category) => getSlugs(category)))];

    return {
      status: categoriesResponse.status,
      result,
    };
  } else {
    const tuples: [string, FlatCategory][] = categories.items.flatMap((item) => getCategories(item)).map((item) => [item.slug, item]);
    const result = Array.from(new Map<string, FlatCategory>(tuples).values());

    return {
      status: categoriesResponse.status,
      result,
    };
  }
}

function getCategories(category: Category): FlatCategory[] {
  return [
    !category.children.length ? { slug: `${category.slug}`, shard: category.shard, query: category.query } : null,
    ...category.children.flatMap((item) => getCategories(item))
  ].filter(truthy);
}

function getSlugs(category: Category): string[] {
  return [!category.children.length ? `${category.slug ?? ''}` : null, ...category.children.flatMap((item) => getSlugs(item))].filter(truthy);
}
