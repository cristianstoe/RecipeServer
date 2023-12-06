import fastify from 'fastify';
import cors from '@fastify/cors'; // Atualizado para a nova versão
import userRoutes from './routes/users.js';
import recipeRoutes from './routes/recipes.js';

const app = fastify();

// Registre o plugin cors com as configurações padrão
app.register(cors); // Sem mudanças aqui, mas agora está usando o novo pacote

app.register(userRoutes);
app.register(recipeRoutes);

const PORT = process.env.PORT || 7600;

// Atualizado para a nova assinatura do método listen
app.listen({ port: PORT, host: '0.0.0.0' }).then((address) => {
  console.log(`Server listening on ${address}`);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
