import prisma from '../prisma/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

function generateToken(userId) {
  const secret = 'secret'; 
  const expiresIn = '1h';

  return jwt.sign({ userId }, secret, { expiresIn });
}

async function getUserFromToken(req) {
  const token = req.headers.authorization.split(' ')[1];
  const decodedToken = jwt.verify(token, 'secret');

  const userId = decodedToken.userId;
  const user = await prisma.user.findUnique({ where: { id: userId } });

  return user;
}


async function getAllUsers(req, reply) {
  const users = await prisma.user.findMany();
  reply.send(users);
}

async function createUser(req, reply) {
  const { email, username, password } = req.body;

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username },
        ],
      },
    });

    if (existingUser) {
      reply.code(400).send({ error: 'Email ou username já estão em uso.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newuser = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
    });

    reply.code(201).send(newuser);
  } catch (error) {
    console.error(error);
    reply.code(500).send({ error: 'Erro ao criar usuário.' });
  }
}

async function loginUser(req, reply) {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      reply.code(401).send({ error: 'Credenciais inválidas.' });
      return;
    }
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      reply.code(401).send({ error: 'Credenciais inválidas.' });
      return;
    }
    const token = generateToken(user.id);

    reply.send({ user, token });
  } catch (error) {
    console.error(error);
    reply.code(500).send({ error: 'Erro ao fazer login.' });
  }
}
async function getUserInfo(req, reply) {
  try {
    const {id} = await getUserFromToken(req);
    // console.log(userId);

    const userInfo = await prisma.user.findUnique({
      where: { id: id }, 
    });

    if (!userInfo) {
      reply.code(404).send({ error: 'Usuário não encontrado.' });
      return;
    }

    reply.send({ userInfo });
  } catch (error) {
    console.error(error);
    reply.code(500).send({ error: 'Erro ao obter informações do usuário.' });
  }
}


async function editUser(req, reply) {
  const { username, password } = req.body;

  try {
    const user = await getUserFromToken(req);
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    if (username) {
      user.username = username;
    }
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { password: user.password, username: user.username },
    });

    reply.send({ user: updatedUser });
  } catch (error) {
    console.error(error);
    reply.code(500).send({ error: 'Erro ao editar usuário.' });
  }
}

export default function (fastify, opts, next) {
  fastify.get('/users', getAllUsers);
  fastify.post('/users', createUser);
  fastify.post('/login', loginUser); 
  fastify.put('/users', editUser);
  fastify.get('/user-info', getUserInfo);
  next();
}
