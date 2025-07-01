import fp from 'fastify-plugin';
import fastifyEnv from '@fastify/env';

const schema = {
  type: 'object',
  required: ['MONGO_URI', 'PORT'],
  properties: {
    MONGO_URI: { type: 'string' },
    PORT: { type: 'string', default: '3000' }
  }
};

const options = {
  confKey: 'config',
  schema,
  dotenv: true,
  data: process.env
};

export default fp(async (app) => {
  app.register(fastifyEnv, options);
  await app.after(); // ensure env is loaded and available
});

