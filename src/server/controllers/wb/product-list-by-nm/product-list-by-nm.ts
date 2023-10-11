import { WBSimilar } from '../../../../app/services/api/models/wb/similar/wb-similar.interface';
import { caught } from '../../../helpers/caught/caught';
import { smartFetch } from '../../../helpers/smart-fetch';

export async function getWBProductListByNM(ids: string[]): Promise<WBSimilar> {
  const paramsList = new URLSearchParams({
    appType: '1',
    curr: 'rub',
    dest: '-1181032',
    regions: '80,83,38,4,64,33,68,70,30,40,86,69,1,66,22,48,31,112,114',
    spp: '29',
    nm: ids.join(';'),
  });
  const params = decodeURIComponent(`${paramsList}`);
  const productsResponse = await smartFetch(null, `https://card.wb.ru/cards/list?${params}`);
  if (!productsResponse) {

    return {
      data: {
        products: [],
      },
      state: 0,
    };
  }
  const [productJsonError, products] = await caught(productsResponse?.json());
  if (productJsonError) {

    return {
      data: {
        products: [],
      },
      state: 0,
    };
  }
  return products;
}
