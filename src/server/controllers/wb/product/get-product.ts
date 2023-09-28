import { getHostV2 } from '../../../../app/helpers/wb/get-wb-image';
import { caught } from '../../../helpers/caught/caught';
import { smartFetch } from '../../../helpers/smart-fetch';
import { WBProductResult } from './models/product-result.interface';

export async function getWBProduct(id: string): Promise<WBProductResult> {
  const volume = id.substring(0, 4);
  const part = id.substring(0, 6);
  const shard = getHostV2(+volume);
  const url = `https://${shard}.wb.ru/vol${volume}/part${part}/${id}/info/ru/card.json`;
  console.log(url);
  const response = await smartFetch(null, url);
  if (!response?.ok) {
    const [parseError, errorBody] = await caught(response?.json());
    return {
      errorStatus: response?.status ?? 500,
      error: errorBody ?? parseError,
    };
  } else {
    const [parseError, result] = await caught(response?.json());
    if (parseError) {
      return {
        errorStatus: 500,
        error: parseError,
      };
    }
    return {
      result: result,
    };
  }
}
