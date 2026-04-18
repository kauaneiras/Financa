import { Transaction, TransactionType } from '../domain/entities';
import crypto from 'crypto';

export class TransactionFactory {
  static create(params: {
    userId: string;
    amount: number;
    type: TransactionType;
    category: string;
    description?: string;
    date?: string;
    accountId?: string | null;
    splits?: { friendName: string; amount: number }[];
    isRecurring?: boolean;
    frequencyRule?: string | null;
    investmentRate?: number | null;
    installments?: number | null;
    installmentCurrent?: number | null;
    installmentStartDate?: string | null;
  }): Transaction {
    return {
      id: crypto.randomUUID(),
      userId: params.userId,
      amount: params.amount,
      type: params.type,
      category: params.category,
      description: params.description || '',
      date: params.date || new Date().toISOString(),
      accountId: params.accountId || null,
      splits: params.splits || [],
      isRecurring: params.isRecurring || false,
      frequencyRule: params.frequencyRule || null,
      investmentRate: params.investmentRate || null,
      installments: params.installments || null,
      installmentCurrent: params.installmentCurrent || 1,
      installmentStartDate: params.installmentStartDate || null,
      createdAt: new Date().toISOString(),
    };
  }
}
