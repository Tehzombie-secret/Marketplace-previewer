import { Request, Response } from 'express';
import { URLSearchParams } from 'url';
import { treeFind } from '../../app/helpers/tree-find';
import { WBCategory } from '../../app/services/api/models/wb/categories/wb-category.interface';
import { caught } from '../helpers/caught/caught';
import { Caught } from '../helpers/caught/models/caught.type';
import { emitRequestLog } from '../helpers/emit-request-log';
import { smartFetch } from '../helpers/smart-fetch';
import { WB_CATALOG_URL } from './wb-categories.controller';

export async function WBCatalogController(request: Request, response: Response): Promise<void> {
  emitRequestLog(request, response);

  const id = request.params['id'];
  if (!id) {
    response.sendStatus(400);

    return;
  }

  // Get menu
  const menuResponse = await smartFetch(response, WB_CATALOG_URL);
  if (!menuResponse) {

    return;
  }
  const [menuJsonError, menu]: Caught<WBCategory[]> = await caught(menuResponse?.json());
  if (menuJsonError) {

    response.status(500).send(menuJsonError);
  }
  const category = treeFind(menu, (item: WBCategory) => item.childs, (item: WBCategory) => `${item.id}` === id);
  if (!category) {
    response.sendStatus(404);

    return;
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

    return;
  }
  const [catalogJsonError, catalog] = await caught(catalogResponse?.json());
  if (catalogJsonError) {
    response.status(500).send(catalogJsonError);

    return;
  }
  response.send(catalog);
}

