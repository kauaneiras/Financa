import crypto from 'crypto';
import { Router } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { IRecurringIncomeRepository } from '../repositories';

const createSchema = z.object({
  name: z.string().min(1),
  amount: z.number({ coerce: true }).positive(),
  category: z.string().min(1),
  dayOfMonth: z.number({ coerce: true }).min(1).max(31),
  type: z.enum(['SALARY', 'VA', 'VR', 'OTHER']),
  startDate: z.string().optional().nullable(),
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  amount: z.number({ coerce: true }).positive().optional(),
  category: z.string().min(1).optional(),
  dayOfMonth: z.number({ coerce: true }).min(1).max(31).optional(),
  type: z.enum(['SALARY', 'VA', 'VR', 'OTHER']).optional(),
  active: z.boolean().optional(),
  startDate: z.string().optional().nullable(),
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
      startDate: req.body.startDate || new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
    res.status(201).json(income);
  });

  router.put('/:id', validate(updateSchema), (req: AuthRequest, res) => {
    const current = repo.findById(req.params.id);
    if (!current || current.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Renda recorrente nao encontrada' });
    }

    const updated = repo.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Renda recorrente nao encontrada' });
    }
    res.json(updated);
  });

  router.delete('/:id', (req: AuthRequest, res) => {
    const current = repo.findById(req.params.id);
    if (!current || current.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Renda recorrente nao encontrada' });
    }

    repo.delete(req.params.id);
    res.status(204).end();
  });

  return router;
}
