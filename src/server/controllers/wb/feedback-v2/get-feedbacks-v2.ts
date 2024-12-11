import { mapProductFromWB } from '../../../../app/models/product/product.interface';
import { WBFeedbacksV2 } from '../../../../app/services/api/models/wb/feedback/v2/wb-feedbacks-v2.interface';
import { caught } from '../../../helpers/caught/caught';
import { smartFetch } from '../../../helpers/smart-fetch';
import { FeedbacksSchema } from '../../../services/mongodb/models/collection-schemas/feedbacks-schema.interface';
import { MongoDBCollection } from '../../../services/mongodb/models/mongo-db-collection.enum';
import { MongoDBService } from '../../../services/mongodb/mongodb.service';
import { getWBProduct } from '../product/get-product';
import { FeedbacksV2Response } from './models/feedbacks-v2-response.interface';

export async function getFeedbackV2(
  imtId?: string | number | null,
  nmId?: string | number | null,
  mongoDB?: MongoDBService
): Promise<FeedbacksV2Response> {
  const checksum = crc16(+(imtId || 0)) % 100 >= 50 ? '2' : '1';
  const [error, feedbacksResponse] = await smartFetch(`https://feedbacks${checksum}.wb.ru/feedbacks/v1/${imtId}`, {
    headers: {
      'content-type': 'application/json',
    },
    cache: 'no-cache',
    method: 'GET',
  });
  if (error) {
    return {
      status: 500,
      hasError: true,
      error,
    };
  }
  if (!feedbacksResponse) {

    return { status: 500, hasError: true };
  }
  const [jsonError, responseBody] = await caught(feedbacksResponse?.json?.());
  if (jsonError) {

    return { status: 500, hasError: true, error: jsonError };
  }

  if (mongoDB) {
    new Promise(async () => {
      if (!nmId) {
        return;
      }
      const productDTO = await getWBProduct(`${nmId}`);
      if (!productDTO?.result?.imt_id) {
        return;
      }
      const product = mapProductFromWB(productDTO.result);
      const dbFeedbacks = ((responseBody as WBFeedbacksV2)?.feedbacks ?? [])
        .filter((item) => (item.photo?.length ?? 0) > 0  || item.video)
        .map((item) => {
          const result: FeedbacksSchema = {
            id: item.id,
            uId: item.globalUserId || null,
            uWId: item.wbUserId ? `${item.wbUserId}` : null,
            un: item.wbUserDetails.name,
            d: item.createdDate,
            t: item.text,
            b: product.brand || '',
            n: product.title || '',
            pId: `${product.id}`,
            ppId: product.parentId ? `${product.parentId}` : null,
            p: item.photo || [],
            vi: item.video?.id,
          };

          return result;
        });
      await mongoDB.set(MongoDBCollection.FEEDBACKS, dbFeedbacks, 'id');
    });
  }

  return {
    status: feedbacksResponse.status,
    response: responseBody,
  }
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
