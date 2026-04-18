import { Router } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import { IScheduleRepository } from '../repositories';
import { AuthRequest } from '../middlewares/auth';
import { validate } from '../middlewares/validate';

const createScheduleSchema = z.object({
  name: z.string().min(1),
  amount: z.number({ coerce: true }).positive(),
  category: z.string().min(1),
  frequencyRule: z.enum(['MONTHLY', 'WEEKLY', 'YEARLY']),
  startDate: z.string(),
});

export function createScheduleRouter(scheduleRepo: IScheduleRepository) {
  const router = Router();

  router.post('/', validate(createScheduleSchema), (req: AuthRequest, res) => {
    const schedule = scheduleRepo.create({
      id: crypto.randomUUID(),
      userId: req.user!.id,
      name: req.body.name,
      amount: req.body.amount,
      category: req.body.category,
      frequencyRule: req.body.frequencyRule,
      startDate: req.body.startDate,
      nextOccurrence: req.body.startDate,
      active: true,
      createdAt: new Date().toISOString(),
    });
    res.status(201).json(schedule);
  });

  router.get('/', (req: AuthRequest, res) => {
    res.json(scheduleRepo.findByUserId(req.user!.id));
  });

  router.put('/:id', (req: AuthRequest, res) => {
    const s = scheduleRepo.findById(req.params.id);
    if (!s || s.userId !== req.user!.id) return res.status(404).json({ error: 'Não encontrado' });
    const updated = scheduleRepo.update(req.params.id, req.body);
    res.json(updated);
  });

  router.delete('/:id', (req: AuthRequest, res) => {
    const s = scheduleRepo.findById(req.params.id);
    if (!s || s.userId !== req.user!.id) return res.status(404).json({ error: 'Não encontrado' });
    scheduleRepo.delete(req.params.id);
    res.status(204).send();
  });

  return router;
}
