import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middlewares/validate';
import { AuthRequest } from '../middlewares/auth';
import { IFriendDebtRepository } from '../repositories';

const createDebtSchema = z.object({
  friendName: z.string().min(1),
  amount: z.number({ coerce: true }).positive(),
  description: z.string().optional().default(''),
});

const updateDebtSchema = z.object({
  friendName: z.string().min(1).optional(),
  amount: z.number({ coerce: true }).positive().optional(),
  description: z.string().optional(),
});

export function createFriendsRouter(friendDebtRepo: IFriendDebtRepository) {
  const router = Router();

  router.get('/', (req: AuthRequest, res) => {
    const debts = friendDebtRepo.findByUserId(req.user!.id);
    res.json(debts);
  });

  router.post('/', validate(createDebtSchema), (req: AuthRequest, res) => {
    const debt = friendDebtRepo.create({
      id: crypto.randomUUID(),
      userId: req.user!.id,
      friendName: req.body.friendName,
      amount: req.body.amount,
      description: req.body.description || '',
      transactionId: null,
      paid: false,
      createdAt: new Date().toISOString(),
    });
    res.status(201).json(debt);
  });

  // Edit debt
  router.put('/:id', validate(updateDebtSchema), (req: AuthRequest, res) => {
    const updated = friendDebtRepo.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Dívida não encontrada' });
    res.json(updated);
  });

  // Mark as paid
  router.patch('/:id/pay', (req: AuthRequest, res) => {
    const updated = friendDebtRepo.update(req.params.id, { paid: true });
    if (!updated) return res.status(404).json({ error: 'Dívida não encontrada' });
    res.json(updated);
  });

  router.delete('/:id', (req: AuthRequest, res) => {
    friendDebtRepo.delete(req.params.id);
    res.status(204).end();
  });

  return router;
}
