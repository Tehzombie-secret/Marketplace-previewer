import { getWBImage } from '../../../app/helpers/wb/get-wb-image';
import { WBSimilarProduct } from '../../../app/services/api/models/wb/similar/wb-similar-product.interface';
import { getProductList } from '../../controllers/wb/product-list/get-product-list';
import { ImageSize } from '../../models/image-size.enum';
import { ProductsSchema } from '../../services/mongodb/models/collection-schemas/products-schema.interface';
import { MongoDBCollection } from '../../services/mongodb/models/mongo-db-collection.enum';
import { TraverseStatus } from '../../services/mongodb/models/traverse-status.enum';
import { MongoDBService } from '../../services/mongodb/mongodb.service';
import { timeout } from '../timeout';
import { updateStatus } from './update-status';

export async function updateProducts(mongoDB: MongoDBService): Promise<boolean> {
  let category: string | undefined;
  do {
    const [categoryError, categoryResponse] = await mongoDB.readFirst(MongoDBCollection.CATEGORIES, 'slug', category);
    const size = await mongoDB.size(MongoDBCollection.CATEGORIES);
    if (categoryError) {
      return false;
    }
    category = categoryResponse?.slug;
    if (!category) {
      break;
    }
    console.log('looking on category', category, size, 'left');
    let hasItems = true;
    let page = 0;
    let delayIncrease = 0;
    while (hasItems) {
      const productList = await getProductList(category, page);

      // Process delay
      if (productList.status === 429) {
        const delay = 3000 * (delayIncrease + 1);
        console.log('got timeout, waiting ', delay)
        await timeout(delay);
        delayIncrease++;

        if (delayIncrease < 7) {
          continue;
        } else {
          hasItems = false;
        }
      }
      delayIncrease = 0;

      // Process errors
      if (productList.error && hasItems) {
        return false;
      } else if (!productList.items?.data?.products?.length) {
        hasItems = false;
      } else {

        // Add new products
        const products = (productList.items?.data?.products ?? [])
          .filter((item: WBSimilarProduct) => item.feedbacks > 0)
          .map((item: WBSimilarProduct) => mapProductToSchema(item));
        const result = await mongoDB.set(MongoDBCollection.PRODUCTS, products, 'slug');
        console.log('added', products.length, 'products, page', page);
        if (result) {
          page++;
        }
      }

      // Delay before next fetch
      const timeoutMs = Math.ceil(Math.random() * 300 + page * 10);
      console.log('delaying', timeoutMs);
      await timeout(timeoutMs);
    }
    await mongoDB.delete(MongoDBCollection.CATEGORIES, 'slug', category);
  } while (category);
  const statusChangeResult = updateStatus(mongoDB, TraverseStatus.FEEDBACKS);
  return statusChangeResult;
}

function mapProductToSchema(product: WBSimilarProduct): ProductsSchema {
  return {
    slug: product.id,
    parentId: product.root,
    brand: product.brand,
    name: product.name,
    photo: getWBImage(product.id, 1, ImageSize.SMALL),
  }
}
