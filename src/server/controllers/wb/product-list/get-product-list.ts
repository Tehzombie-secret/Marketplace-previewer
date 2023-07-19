import { response } from 'express';
import { treeFind } from '../../../../app/helpers/tree-find';
import { WBCategory } from '../../../../app/services/api/models/wb/categories/wb-category.interface';
import { caught } from '../../../helpers/caught/caught';
import { Caught } from '../../../helpers/caught/models/caught.type';
import { smartFetch } from '../../../helpers/smart-fetch';
import { ProductListResponse } from './models/product-list-response.interface';

export const WB_CATALOG_URL = 'https://www.wildberries.ru/webapi/menu/main-menu-ru-ru.json';

export async function getProductList(id: string): Promise<ProductListResponse> {
  // Get menu
  const menuResponse = await smartFetch(response, WB_CATALOG_URL);
  if (!menuResponse) {

    return {
      hasError: true,
    };
  }
  const [menuJsonError, menu]: Caught<WBCategory[]> = await caught(menuResponse?.json());
  if (menuJsonError) {

    return {
      hasError: true,
      error: menuJsonError,
    };
  }
  const category = treeFind(menu, (item: WBCategory) => item.childs, (item: WBCategory) => `${item.id}` === id);
  if (!category) {
    response.sendStatus(404);

    return {
      notFound: true,
    };
  }

  // Get items
  const params = new URLSearchParams({
    spp: '19',
    pricemarginCoeff: '1.0',
    reg: '0',
    appType: '1',
    emp: '0',
    locale: 'ru',
    lang: 'ru',
    curr: 'rub',
    dest: '-1216601,-337422,-1114354,-1181032',
  });
  const url = `https://catalog.wb.ru/catalog/${category.shard}/catalog?${[params, category.query].join('&')}`;
  const catalogResponse = await smartFetch(response, url);
  if (!catalogResponse) {

    return {
      hasError: true,
    };
  }
  const [catalogJsonError, catalog] = await caught(catalogResponse?.json());
  if (catalogJsonError) {

    return {
      hasError: true,
      error: catalogJsonError,
    };
  }

  return {
    items: catalog,
  };
}
