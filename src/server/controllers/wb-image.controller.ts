import { Request, Response } from 'express';
import { emitRequestLog } from '../helpers/emit-request-log';
import { retryable } from '../helpers/retryable';
import { ImageSize } from '../models/image-size.enum';

const WB_SIZE_TO_PREFIX_STRATEGY: Record<ImageSize, string> = {
  [ImageSize.BIG]: 'big',
  [ImageSize.SMALL]: 'c246x328',
};

export async function WBImageController(request: Request, response: Response): Promise<void> {
  emitRequestLog(request, response);

  // Examples:
  // basket01.wb.ru/vol79/part7908/7908072/images/c246x328/1.jpg
  // basket01.wb.ru/vol79/part7908/7908072/images/big/1.jpg
  const size = WB_SIZE_TO_PREFIX_STRATEGY[request.params['size'] as ImageSize ?? ImageSize.BIG];
  const id = +(request.params['id'] ?? 0);
  const volume = ~~(+(id ?? 0) / 1e5);
  const name = request.params['name'];
  const url = `https://basket${getHost(volume)}.wb.ru/vol${volume}/part${~~(id / 1e3)}/${id}/images/${size}/${name}`;
  const [error, imageResponse] = await retryable(fetch(url));
  if (error) {
    response.status(500).send(error);

    return;
  }
  if (!imageResponse) {
    response.status(500).send('Empty response');

    return;
  }
  const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
  const headers: Record<string, string> = {};
  imageResponse.headers.forEach((value: string, key: string) => headers[key] = value);
  response.set(headers);
  response.status(imageResponse.status).send(imageBuffer);
}

function getHost(volume: number): string {
  if (volume >= 0 && volume <= 287) {

    return '01';
  } else if (volume >= 288 && volume <= 575) {

    return '02';
  } else if (volume >= 576 && volume <= 863) {

    return '03';
  } else if (volume >= 864 && volume <= 1007) {

    return '04';
  } else if (volume >= 1008 && volume <= 1061) {

    return '05';
  } else if (volume >= 1062 && volume <= 1115) {

    return '06';
  } else if (volume >= 1116 && volume <= 1169) {

    return '07';
  } else {

    return '08';
  }
}
