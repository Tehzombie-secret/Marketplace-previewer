import { Request, Response } from 'express';
import { caught } from '../helpers/caught/caught';
import { emitRequestLog } from '../helpers/emit-request-log';
import { smartFetch } from '../helpers/smart-fetch';

export async function WBFeedbackControllerV2(request: Request, response: Response): Promise<void> {
  emitRequestLog(request, response);

  const id = request.params['id'];
  if (!id) {
    response.sendStatus(400);

    return;
  }
  const checksum = crc16(+id) % 100 >= 50 ? '2' : '1';
  const feedbacksResponse = await smartFetch(response, `https://feedbacks${checksum}.wb.ru/feedbacks/v1/${id}`, {
    headers: {
      'content-type': 'application/json',
    },
    cache: 'no-cache',
    method: 'GET',
  });
  if (!feedbacksResponse) {

    return;
  }
  const [jsonError, responseBody] = await caught(feedbacksResponse.json());
  if (jsonError) {
    response.status(500).send(jsonError);

    return;
  }
  console.log(feedbacksResponse.headers, responseBody);
  response.status(feedbacksResponse.status).send(responseBody);
}

function crc16(input: number): number {
    const t = toUintArray(input);
    let result = 0;
    for (let r = 0; r < t.length; r++) {
      result ^= t[r];
      for (let r = 0; r < 8; r++) {
        if ((1 & result) > 0) {
          result = result >> 1 ^ 40961
        } else {
          result >>= 1;
        }
      }
    }
    return result;
}

function toUintArray(input: number): Uint8Array {
  const result = new Uint8Array(8);
  for (let n = 0; n < 8; n++) {
    result[n] = input % 256;
    input = Math.floor(input / 256);
  }
  return result;
}
