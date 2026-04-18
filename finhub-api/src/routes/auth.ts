import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import crypto from 'crypto';
import { config } from '../config/env';
import { IUserRepository } from '../repositories';
import { validate } from '../middlewares/validate';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(2, 'Nome muito curto'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
});

export function createAuthRouter(userRepo: IUserRepository) {
  const router = Router();

  router.post('/register', validate(registerSchema), async (req, res) => {
    const { email, name, password } = req.body;

    if (userRepo.findByEmail(email)) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = userRepo.create({
      id: crypto.randomUUID(),
      email,
      name,
      passwordHash: hash,
      preferredCurrency: 'BRL',
      createdAt: new Date().toISOString(),
    });

    const token = jwt.sign({ id: user.id, email: user.email }, config.jwtSecret, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
  });

  router.post('/login', validate(loginSchema), async (req, res) => {
    const { email, password } = req.body;
    const user = userRepo.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, config.jwtSecret, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  });

  // OAuth stubs (Ready for real integration)
  router.post('/login/google', (req, res) => {
    const token = jwt.sign({ id: 'google-1', email: 'google@user.com' }, config.jwtSecret, { expiresIn: '7d' });
    res.json({ token, user: { id: 'google-1', email: 'google@user.com', name: 'Google User' } });
  });

  router.post('/login/microsoft', (req, res) => {
    const token = jwt.sign({ id: 'ms-1', email: 'ms@user.com' }, config.jwtSecret, { expiresIn: '7d' });
    res.json({ token, user: { id: 'ms-1', email: 'ms@user.com', name: 'Microsoft User' } });
  });

  return router;
}
