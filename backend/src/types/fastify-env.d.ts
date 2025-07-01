import 'fastify';
import { Db, ObjectId } from 'mongodb';

declare module 'fastify' {
  interface FastifyInstance {
    config: {
      MONGO_URI: string;
      PORT: string;
    };
    mongo: {
      db: Db;
      ObjectId: typeof ObjectId;
    };
  }
}

