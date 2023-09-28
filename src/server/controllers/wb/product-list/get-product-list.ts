import { response } from 'express';
import { treeFind } from '../../../../app/helpers/tree-find';
import { WBCategory } from '../../../../app/services/api/models/wb/categories/wb-category.interface';
import { caught } from '../../../helpers/caught/caught';
import { Caught } from '../../../helpers/caught/models/caught.type';
import { smartFetch } from '../../../helpers/smart-fetch';
import { WB_CATALOG_URL } from '../categories-list/get-categories-list';
import { ProductListResponse } from './models/product-list-response.interface';

export async function getProductList(id: string, page: string): Promise<ProductListResponse> {
  // Get menu
  const menuResponse = await smartFetch(response, WB_CATALOG_URL);
  if (!menuResponse) {

    return {
      status: 500,
      error: {
        body: 'No response from menu',
      },
    };
  }
  const [menuJsonError, menu]: Caught<WBCategory[]> = await caught(menuResponse?.json());
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
    spp: '32',
    appType: '1',
    curr: 'rub',
    dest: '-1181032',
    regions: '80,38,83,4,64,33,68,70,30,40,86,69,1,31,66,48,22,114',
    sort: 'popular',
    uclusters: '1'
  });
  const url = `https://catalog.wb.ru/catalog/${category.shard}/catalog?${[params, category.query].join('&')}`;
  const catalogResponse = await smartFetch(response, url);
  if (!catalogResponse) {

    return {
      status: 500,
      error: {
        body: 'No response from catalog',
      }
    };
  }
  console.log(catalogResponse.status, url);
  const [catalogJsonError, catalog] = await caught(catalogResponse?.json());
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
