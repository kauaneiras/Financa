import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middlewares/validate';
import { AuthRequest } from '../middlewares/auth';
import { IRecurringIncomeRepository } from '../repositories';
import crypto from 'crypto';

const createSchema = z.object({
  name: z.string().min(1),
  amount: z.number({ coerce: true }).positive(),
  category: z.string().min(1),
  dayOfMonth: z.number({ coerce: true }).min(1).max(31),
  type: z.enum(['SALARY', 'VA', 'VR', 'OTHER']),
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  amount: z.number({ coerce: true }).positive().optional(),
  category: z.string().min(1).optional(),
  dayOfMonth: z.number({ coerce: true }).min(1).max(31).optional(),
  type: z.enum(['SALARY', 'VA', 'VR', 'OTHER']).optional(),
  active: z.boolean().optional(),
});

export function createRecurringRouter(repo: IRecurringIncomeRepository) {
  const router = Router();

  router.get('/', (req: AuthRequest, res) => {
    res.json(repo.findByUserId(req.user!.id));
  });

  router.post('/', validate(createSchema), (req: AuthRequest, res) => {
    const income = repo.create({
      id: crypto.randomUUID(),
      userId: req.user!.id,
      name: req.body.name,
      amount: req.body.amount,
      category: req.body.category,
      dayOfMonth: req.body.dayOfMonth,
      type: req.body.type,
      active: true,
      createdAt: new Date().toISOString(),
    });
    res.status(201).json(income);
  });

  router.put('/:id', validate(updateSchema), (req: AuthRequest, res) => {
    const updated = repo.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Renda recorrente não encontrada' });
    res.json(updated);
  });

  router.delete('/:id', (req: AuthRequest, res) => {
    repo.delete(req.params.id);
    res.status(204).end();
  });

  return router;
}
