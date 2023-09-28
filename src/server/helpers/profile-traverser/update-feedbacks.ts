import { WBFeedback } from '../../../app/services/api/models/wb/feedback/v1/wb-feedback.interface';
import { WBPhoto } from '../../../app/services/api/models/wb/feedback/v1/wb-photo.interface';
import { getFeedbackV2 } from '../../controllers/wb/feedback-v2/get-feedbacks-v2';
import { FeedbacksSchema } from '../../services/mongodb/models/collection-schemas/feedbacks-schema.interface';
import { ProductsSchema } from '../../services/mongodb/models/collection-schemas/products-schema.interface';
import { MongoDBCollection } from '../../services/mongodb/models/mongo-db-collection.enum';
import { TraverseStatus } from '../../services/mongodb/models/traverse-status.enum';
import { MongoDBService } from '../../services/mongodb/mongodb.service';
import { updateStatus } from './update-status';

export async function updateFeedbacks(mongoDB: MongoDBService): Promise<boolean> {
  let product: string | undefined;
  do {
    const [productError, productResponse] = await mongoDB.readFirst(MongoDBCollection.PRODUCTS);
    if (productError) {
      return false;
    }
    console.log('requested product', productResponse?.slug);
    if (!productResponse?.slug) {
      break;
    }
    const feedbackList = await getFeedbackV2(productResponse.slug);
    if (feedbackList.hasError) {
      return false;
    } else {
      const list = feedbackList.response?.feedbacks?.filter((item) => item.photos.length) ?? [];
      const result = await mongoDB.set(
        MongoDBCollection.FEEDBACKS,
        list.map((item: WBFeedback) => mapProductFromFeedback(productResponse, item)),
        'id'
      );
      if (result) {
        await mongoDB.delete(MongoDBCollection.PRODUCTS, 'slug', productResponse.slug);
      }
    }
  } while (product);
  console.log('update status to DONE');
  const statusChangeResult = updateStatus(mongoDB, TraverseStatus.DONE);
  return statusChangeResult;
}

function mapProductFromFeedback(product: ProductsSchema, feedback: WBFeedback): FeedbacksSchema {
  return {
    id: feedback.id,
    b: product.brand,
    n: product.name,
    pId: product.slug,
    ppId: product.parentId,
    pp: product.photo,
    t: feedback.text,
    uId: feedback.wbUserId,
    d: feedback.createdDate,
    o: feedback.isObscene,
    ps: feedback.photos.map((photo: WBPhoto) => photo.minSizeUri),
    pl: feedback.photos.map((photo: WBPhoto) => photo.fullSizeUri),
  };
}
