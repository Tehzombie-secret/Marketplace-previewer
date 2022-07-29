import { Request, Response } from 'express';
import { URLSearchParams } from 'url';
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
  const category = (menu || [])
    .flatMap((item: WBCategory) => (item.childs || []).concat(item))
    .find((item: WBCategory) => `${item.id}` === id);
  if (!category) {
    response.sendStatus(404);

    return;
  }

  // Get items
  const categoryParams = (category.query || '').split('&').map((item: string) => item.split('='));
  const params = new URLSearchParams({
    spp: '0',
    pricemarginCoeff: '1.0',
    reg: '0',
    appType: '1',
    emp: '0',
    locale: 'ru',
    lang: 'ru',
    curr: 'rub',
    ...Object.fromEntries(categoryParams),
  });
  const catalogResponse = await smartFetch(response, `https://card.wb.ru/cards/list?${params}`);
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
