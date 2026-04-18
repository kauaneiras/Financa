import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middlewares/validate';
import { AuthRequest } from '../middlewares/auth';
import { IAccountRepository } from '../repositories';

const createAccountSchema = z.object({
  name: z.string().min(1),
  bankName: z.string().min(1),
  type: z.enum(['CREDIT_CARD', 'DEBIT', 'CASH', 'PIX', 'VA', 'VR']).default('DEBIT'),
  closingDay: z.number({ coerce: true }).min(1).max(31).optional().nullable(),
  dueDay: z.number({ coerce: true }).min(1).max(31).optional().nullable(),
  balance: z.number({ coerce: true }).optional().default(0),
});

const updateAccountSchema = z.object({
  name: z.string().min(1).optional(),
  bankName: z.string().min(1).optional(),
  type: z.enum(['CREDIT_CARD', 'DEBIT', 'CASH', 'PIX', 'VA', 'VR']).optional(),
  closingDay: z.number({ coerce: true }).min(1).max(31).optional().nullable(),
  dueDay: z.number({ coerce: true }).min(1).max(31).optional().nullable(),
  balance: z.number({ coerce: true }).optional(),
});

export function createAccountRouter(accountRepo: IAccountRepository) {
  const router = Router();

  router.get('/', (req: AuthRequest, res) => {
    res.json(accountRepo.findByUserId(req.user!.id));
  });

  router.post('/', validate(createAccountSchema), (req: AuthRequest, res) => {
    const account = accountRepo.create({
      id: crypto.randomUUID(),
      userId: req.user!.id,
      name: req.body.name,
      bankName: req.body.bankName,
      type: req.body.type || 'DEBIT',
      closingDay: req.body.closingDay || null,
      dueDay: req.body.dueDay || null,
      balance: req.body.balance || 0,
      createdAt: new Date().toISOString(),
    });
    res.status(201).json(account);
  });

  router.put('/:id', validate(updateAccountSchema), (req: AuthRequest, res) => {
    const updated = accountRepo.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Conta não encontrada' });
    res.json(updated);
  });

  router.delete('/:id', (req: AuthRequest, res) => {
    accountRepo.delete(req.params.id);
    res.status(204).end();
  });

  router.patch('/:id/bonus', validate(z.object({ amount: z.number({ coerce: true }).positive() })), (req: AuthRequest, res) => {
    const rawAccounts = accountRepo.findByUserId(req.user!.id);
    const account = rawAccounts.find(a => a.id === req.params.id);
    if (!account) return res.status(404).json({ error: 'Conta não encontrada' });
    
    if (account.type !== 'VA' && account.type !== 'VR') {
      return res.status(400).json({ error: 'Apenas contas do tipo Vale Alimentação ou Refeição aceitam bônus manual.' });
    }

    const newBalance = account.balance + req.body.amount;
    const updated = accountRepo.update(account.id, { balance: newBalance });
    res.json(updated);
  });

  return router;
}
