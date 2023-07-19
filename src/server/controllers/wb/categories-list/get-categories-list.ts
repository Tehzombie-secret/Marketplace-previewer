import { response } from 'express';
import { truthy } from '../../../../app/helpers/truthy';
import { Category } from '../../../../app/models/categories/category.interface';
import { getCategoriesChunkFromWB, WBCategory } from '../../../../app/services/api/models/wb/categories/wb-category.interface';
import { caught } from '../../../helpers/caught/caught';
import { smartFetch } from '../../../helpers/smart-fetch';
import { CategoriesListResponse } from './models/categories-list-response.interface';

export const WB_CATALOG_URL = 'https://www.wildberries.ru/webapi/menu/main-menu-ru-ru.json';

export async function getCategoriesList(): Promise<CategoriesListResponse> {
  const categoriesResponse = await smartFetch(response, WB_CATALOG_URL);
  if (!categoriesResponse) {
    return {
      status: 200,
      slugs: [],
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
  const slugs = [...new Set(categories.items.flatMap((category: Category) => getSlugs(category)))];
  return {
    status: categoriesResponse.status,
    slugs,
  }
}

function getSlugs(category: Category): string[] {
  return [!category.children.length ? `${category.slug ?? ''}` : null, ...category.children.flatMap((item) => getSlugs(item))].filter(truthy);
}
