import fastify from 'fastify';
import userRoutes from './routes/users.js';
import recipeRoutes from './routes/recipes.js';

const app = fastify();

app.register(userRoutes);
app.register(recipeRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening on http://localhost:${PORT}`);
});
