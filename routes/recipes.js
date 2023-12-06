import prisma from '../prisma/index.js';
import jwt from 'jsonwebtoken';

function getUserIdFromToken(req) {
  const token = req.headers.authorization.split(' ')[1];
  const decodedToken = jwt.verify(token, 'secret');
  return decodedToken.userId;
}

async function createRecipe(req, reply) {
  const userId = getUserIdFromToken(req);
  const { title, ingredients, description } = req.body;

  try {
    const newRecipe = await prisma.recipes.create({
      data: {
        title,
        ingredients,
        description,
        user: {
          connect: { id: userId },
        },
      },
    });

    reply.code(201).send({ recipe: newRecipe });
  } catch (error) {
    console.error(error);
    reply.code(500).send({ error: 'Erro ao criar receita.' });
  }
}

async function getAllRecipes(req, reply) {
  try {
    const recipes = await prisma.recipes.findMany();
    reply.send(recipes);
  } catch (error) {
    console.error(error);
    reply.code(500).send({ error: 'Erro ao obter receitas.' });
  }
}

async function getRecipe(req, reply) {
  const recipeId = parseInt(req.params.id, 10);

  try {
    const recipe = await prisma.recipes.findUnique({
      where: { id: recipeId },
    });

    if (!recipe) {
      reply.code(404).send({ error: 'Receita não encontrada.' });
      return;
    }

    reply.send(recipe);
  } catch (error) {
    console.error(error);
    reply.code(500).send({ error: 'Erro ao obter receita.' });
  }
}

async function updateRecipe(req, reply) {
  const userId = getUserIdFromToken(req);
  const recipeId = parseInt(req.params.id, 10);
  const { title, ingredients, description } = req.body;

  try {
    const recipe = await prisma.recipes.findUnique({
      where: { id: recipeId },
    });

    if (!recipe) {
      reply.code(404).send({ error: 'Receita não encontrada.' });
      return;
    }

    if (recipe.userId !== userId) {
      reply.code(403).send({ error: 'Você não tem permissão para editar esta receita.' });
      return;
    }

    const updatedRecipe = await prisma.recipes.update({
      where: { id: recipeId },
      data: {
        title,
        ingredients,
        description,
      },
    });

    reply.send({ recipe: updatedRecipe });
  } catch (error) {
    console.error(error);
    reply.code(500).send({ error: 'Erro ao editar receita.' });
  }
}

async function getUserRecipes(req, reply) {
  const userId = getUserIdFromToken(req);

  try {
    const userRecipes = await prisma.recipes.findMany({
      where: { userId },
    });

    reply.send(userRecipes);
  } catch (error) {
    console.error(error);
    reply.code(500).send({ error: 'Erro ao obter receitas do usuário.' });
  }
}



async function deleteRecipe(req, reply) {
  const userId = getUserIdFromToken(req);
  const recipeId = parseInt(req.params.id, 10);

  try {
    const recipe = await prisma.recipes.findUnique({
      where: { id: recipeId },
    });

    if (!recipe) {
      reply.code(404).send({ error: 'Receita não encontrada.' });
      return;
    }

    if (recipe.userId !== userId) {
      reply.code(403).send({ error: 'Você não tem permissão para excluir esta receita.' });
      return;
    }

    await prisma.recipes.delete({
      where: { id: recipeId },
    });

    reply.send({ message: 'Receita excluída com sucesso.' });
  } catch (error) {
    console.error(error);
    reply.code(500).send({ error: 'Erro ao excluir receita.' });
  }
}

export default function (fastify, opts, next) {
  fastify.post('/recipes', createRecipe);
  fastify.get('/recipes', getAllRecipes);
  fastify.get('/recipes/:id', getRecipe); 
  fastify.put('/recipes/:id', updateRecipe);
  fastify.delete('/recipes/:id', deleteRecipe);
  fastify.get('/user-recipes', getUserRecipes);
  next();
}
