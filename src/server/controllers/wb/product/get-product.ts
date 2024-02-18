import { getHostV2 } from '../../../../app/helpers/wb/get-wb-image';
import { caught } from '../../../helpers/caught/caught';
import { smartFetch } from '../../../helpers/smart-fetch';
import { WBProductResult } from './models/product-result.interface';

export async function getWBProduct(id: string): Promise<WBProductResult> {
  const volume = ~~(+id / 1e5);
  const part = ~~(+id / 1e3);
  const shard = getHostV2(+volume);
  const url = `https://${shard}.wb.ru/vol${volume}/part${part}/${id}/info/ru/card.json`;
  return {
    errorStatus: 500,
    error: 'test',
  };
  const response = await smartFetch(null, url);
  if (!response) {
    return {
      errorStatus: 500,
      error: {
        error: 'Empty response',
      },
    };
  }
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
