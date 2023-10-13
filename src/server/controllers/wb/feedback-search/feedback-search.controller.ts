import { Request, Response } from 'express';
import { MongoDBService } from '../../../services/mongodb/mongodb.service';
import { searchWBFeedbacks } from './search-feedbacks';

export async function WBFeedbackSearchController(request: Request, response: Response, mongoDB: MongoDBService): Promise<void> {
  const query = request.query['query'];
  if (!query || typeof query !== 'string') {
    response.status(400).send({ error: 'Query should be present' });

    return;
  }
  const page = request.query['page'];
  const result = await searchWBFeedbacks(mongoDB, query, typeof page === 'string' ? page : 1);
  response.status(result.status).send(result.error || result.result);
}
