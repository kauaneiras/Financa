import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middlewares/validate';
import { AuthRequest } from '../middlewares/auth';
import { ITransactionRepository, IFriendDebtRepository, IAccountRepository } from '../repositories';
import { TransactionFactory } from '../usecases/transactionFactory';
import { IAmortizationStrategy, PriceAmortization, SACAmortization } from '../usecases/amortization';
import crypto from 'crypto';

const createTxSchema = z.object({
  amount: z.number({ coerce: true }).positive(),
  type: z.enum(['INCOME', 'EXPENSE', 'SUBSCRIPTION', 'INVESTMENT']),
  category: z.string().min(1),
  description: z.string().optional(),
  date: z.string().optional(),
  accountId: z.string().optional().nullable(),
  splits: z.array(z.object({
    friendName: z.string().min(1),
    amount: z.number({ coerce: true }).positive(),
  })).optional().default([]),
  isRecurring: z.boolean().optional().default(false),
  frequencyRule: z.string().optional().nullable(),
  investmentRate: z.number({ coerce: true }).optional().nullable(),
  installments: z.number({ coerce: true }).int().positive().optional().nullable(),
  installmentCurrent: z.number({ coerce: true }).int().positive().optional().nullable(),
  installmentStartDate: z.string().optional().nullable(),
});

const updateTxSchema = z.object({
  amount: z.number({ coerce: true }).positive().optional(),
  type: z.enum(['INCOME', 'EXPENSE', 'SUBSCRIPTION', 'INVESTMENT']).optional(),
  category: z.string().min(1).optional(),
  description: z.string().optional(),
  date: z.string().optional(),
  accountId: z.string().optional().nullable(),
  splits: z.array(z.object({
    friendName: z.string().min(1),
    amount: z.number({ coerce: true }).positive(),
  })).optional(),
  isRecurring: z.boolean().optional(),
  frequencyRule: z.string().optional().nullable(),
  investmentRate: z.number({ coerce: true }).optional().nullable(),
  installments: z.number({ coerce: true }).int().positive().optional().nullable(),
  installmentCurrent: z.number({ coerce: true }).int().positive().optional().nullable(),
  installmentStartDate: z.string().optional().nullable(),
});

const loanSimSchema = z.object({
  principal: z.number({ coerce: true }).positive(),
  annualRate: z.number({ coerce: true }).positive(),
  months: z.number({ coerce: true }).int().positive(),
  type: z.enum(['PRICE', 'SAC']),
});

export function createTransactionRouter(txRepo: ITransactionRepository, friendDebtRepo: IFriendDebtRepository, accountRepo: IAccountRepository) {
  const router = Router();

  router.get('/', (req: AuthRequest, res) => {
    res.json(txRepo.findByUserId(req.user!.id));
  });

  router.post('/', validate(createTxSchema), (req: AuthRequest, res) => {
    let tx = TransactionFactory.create({ userId: req.user!.id, ...req.body });

    const accounts = accountRepo.findByUserId(req.user!.id);
    const account = tx.accountId ? accounts.find(a => a.id === tx.accountId) : null;

    if (account) {
      if (tx.type === 'INVESTMENT' || (tx.type === 'EXPENSE' && account.type !== 'CREDIT_CARD')) {
        // Immediate deduction for investments and any non-credit expenses
        const newBalance = account.balance - tx.amount;
        accountRepo.update(account.id, { balance: newBalance });
        txRepo.create(tx);
      } 
      else if (tx.type === 'EXPENSE' && account.type === 'CREDIT_CARD' && tx.installments && tx.installments > 1) {
        // Brazilian Credit Card Splitting
        const txDate = new Date(tx.date || new Date().toISOString());
        let txDay = txDate.getDate();
        let closingDay = account.closingDay || 20;
        let dueDay = account.dueDay || 5;

        // Determine first due date
        let targetMonth = txDate.getMonth();
        let targetYear = txDate.getFullYear();
        
        if (txDay >= closingDay) targetMonth++;
        if (dueDay < closingDay) targetMonth++; 

        const installmentAmount = +(tx.amount / tx.installments).toFixed(2);
        const createdTxs = [];
        
        for (let i = 0; i < tx.installments; i++) {
           const nextDue = new Date(targetYear, targetMonth + i, dueDay);
           const newTx = TransactionFactory.create({
             ...req.body,
             userId: req.user!.id,
             amount: installmentAmount,
             date: nextDue.toISOString(),
             installments: tx.installments,
             installmentCurrent: i + 1,
             installmentStartDate: txDate.toISOString()
           });
           txRepo.create(newTx);
           createdTxs.push(newTx);
        }
        tx = createdTxs[0]; // For response and friend splitting
      } else {
        txRepo.create(tx);
      }
    } else {
      txRepo.create(tx);
    }

    // Auto-create friend debts from splits
    if (tx.splits && tx.splits.length > 0) {
      tx.splits.forEach(s => {
        friendDebtRepo.create({
          id: crypto.randomUUID(),
          userId: req.user!.id,
          friendName: s.friendName,
          amount: s.amount,
          description: `${tx.category} - ${tx.description || 'Sem descrição'}`,
          transactionId: tx.id,
          paid: false,
          createdAt: new Date().toISOString(),
        });
      });
    }

    res.status(201).json(tx);
  });

  router.put('/:id', validate(updateTxSchema), (req: AuthRequest, res) => {
    const updated = txRepo.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Transação não encontrada' });
    res.json(updated);
  });

  router.delete('/:id', (req: AuthRequest, res) => {
    txRepo.delete(req.params.id);
    res.status(204).end();
  });

  router.post('/simulate-loan', validate(loanSimSchema), (req: AuthRequest, res) => {
    const { principal, annualRate, months, type } = req.body;
    const strategy: IAmortizationStrategy = type === 'PRICE'
      ? new PriceAmortization() : new SACAmortization();
    const schedule = strategy.calculate(principal, annualRate, months);
    res.json({ schedule, type });
  });

  return router;
}
