import { response } from 'express';
import { treeFind } from '../../../../app/helpers/tree-find';
import { WBCategory } from '../../../../app/services/api/models/wb/categories/wb-category.interface';
import { caught } from '../../../helpers/caught/caught';
import { Caught } from '../../../helpers/caught/models/caught.type';
import { smartFetch } from '../../../helpers/smart-fetch';
import { WB_CATALOG_URL } from '../categories-list/get-categories-list';
import { ProductListResponse } from './models/product-list-response.interface';

export async function getProductList(id: string, page?: number | null): Promise<ProductListResponse> {
  // Get menu
  const [menuError, menuResponse] = await smartFetch(WB_CATALOG_URL);
  if (menuError) {
    return {
      status: 500,
      error: {
        body: 'Menu fetch error',
        error: menuError,
      },
    };
  }
  if (!menuResponse) {

    return {
      status: 500,
      error: {
        body: 'No response from menu',
      },
    };
  }
  const [menuJsonError, menu]: Caught<WBCategory[]> = await caught(menuResponse?.json?.());
  if (menuJsonError) {

    return {
      status: menuResponse.status,
      error: {
        body: 'Menu json parse error',
        error: menuJsonError,
      }
    };
  }
  const category = treeFind(menu, (item: WBCategory) => item.childs, (item: WBCategory) => `${item.id}` === id);
  if (!category) {
    response.sendStatus(404);

    return {
      status: 404,
    };
  }

  // Get items
  const params = new URLSearchParams({
    ab_testing: 'false',
    appType: '1',
    curr: 'rub',
    dest: '-1181033',
    hide_dtype: '10',
    lang: 'ru',
    sort: 'popular',
    spp: '30',
    uclusters: '2',
    ...((page ?? 0) > 1 ? { page: `${page ?? 0}` } : {}),
  });
  const url = `https://catalog.wb.ru/catalog/${category.shard}/v2/catalog?${[params, category.query].join('&')}`;
  const [catalogError, catalogResponse] = await smartFetch(url);
  if (catalogError) {

    return {
      status: 500,
      error: {
        body: 'Catalog fetch error',
        error: catalogError,
      },
    };
  }
  if (!catalogResponse) {

    return {
      status: 500,
      error: {
        body: 'No response from catalog',
      }
    };
  }
  const [catalogJsonError, catalog] = await caught(catalogResponse?.json?.());
  if (catalogJsonError) {

    return {
      status: catalogResponse.status,
      error: {
        body: 'Catalog json parse error',
        error: catalogJsonError,
      }
    };
  }

  return {
    status: catalogResponse.status,
    items: catalog,
  };
}
