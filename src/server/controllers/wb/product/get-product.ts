import { caught } from '../../../helpers/caught/caught';
import { smartFetch } from '../../../helpers/smart-fetch';
import { WBProductResult } from './models/product-result.interface';

export async function getWBProduct(id: string): Promise<WBProductResult> {
  const volume = id.substring(0, 3);
  const part = id.substring(0, 5);
  const shard = getShard(+volume);
  const url = `https://basket-${shard}.wb.ru/vol${volume}/part${part}/${id}/info/ru/card.json`;
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

function getShard(volume: number): string {
  if (volume >= 0 && volume <= 143) {
    return '01';
  }
  if (volume >= 144 && volume <= 287) {
    return '02';
  }
  if (volume >= 288 && volume <= 431) {
    return '03';
  }
  if (volume >= 432 && volume <= 719) {
    return '04';
  }
  if (volume >= 720 && volume <= 1007) {
    return '05';
  }
  if (volume >= 1008 && volume <= 1061) {
    return '06';
  }
  if (volume >= 1062 && volume <= 1115) {
    return '07';
  }
  if (volume >= 1116 && volume <= 1169) {
    return '08';
  }
  if (volume >= 1170 && volume <= 1313) {
    return '09';
  }
  if (volume >= 1314 && volume <= 1601) {
    return '10';
  }
  if (volume >= 1602 && volume <= 1655) {
    return '11';
  }
  if (volume >= 1656 && volume <= 1919) {
    return '12';
  }
  return '13';
}
