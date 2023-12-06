import fastify from 'fastify';
import cors from '@fastify/cors';
import userRoutes from './routes/users.js';
import recipeRoutes from './routes/recipes.js';

const app = fastify();

app.register(cors);

app.register(userRoutes);
app.register(recipeRoutes);

const PORT = process.env.PORT || 7600;

app.listen({ port: PORT, host: '0.0.0.0' }).then((address) => {
  console.log(`Server listening on ${address}`);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
