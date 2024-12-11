import { getHostV2 } from '../../../../app/helpers/wb/get-wb-image';
import { caught } from '../../../helpers/caught/caught';
import { smartFetch } from '../../../helpers/smart-fetch';
import { WBProductResult } from './models/product-result.interface';

export async function getWBProduct(id: string): Promise<WBProductResult> {
  const volume = ~~(+id / 1e5);
  const part = ~~(+id / 1e3);
  const shard = getHostV2(+volume);
  const url = `https://${shard}.wbbasket.ru/vol${volume}/part${part}/${id}/info/ru/card.json`;
  const [error, response] = await smartFetch(url, {
    headers: {
      useragent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    }
  });
  if (error) {
    return {
      errorStatus: 500,
      error,
    };
  }
  if (!response) {
    return {
      errorStatus: 500,
      error: {
        error: 'Empty response',
      },
    };
  }
  if (!response?.ok) {
    const [parseError, errorBody] = await caught(response?.json?.());
    return {
      errorStatus: response?.status ?? 500,
      error: {
        error: 'Response error',
        body: errorBody ?? parseError,
        response: JSON.stringify(response),
      }
    };
  } else {
    const [parseError, result] = await caught(response?.json?.());
    if (parseError) {
      return {
        errorStatus: 500,
        error: {
          error: 'Parse error',
          body: parseError,
        }
      };
    }
    return {
      result: result,
    };
  }
}
