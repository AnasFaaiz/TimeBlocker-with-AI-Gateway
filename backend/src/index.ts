import Fastify from 'fastify';
import envPlugin from './plugins/env';
import fastifyMongo from '@fastify/mongodb';

const app = Fastify({ logger: true });

await app.register(envPlugin);

app.register(fastifyMongo, {
  forceClose: true,
  url: app.config.MONGO_URI,
  database: 'timeblocker',
});

// Example route
app.get('/ping-db', async () => {
  const names = await app.mongo.db.listCollections().toArray();
  return { collections: names };
});

const start = async () => {
  try {
    await app.listen({ port: +app.config.PORT, host: '0.0.0.0' });
    app.log.info(`Server running on port ${app.config.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

