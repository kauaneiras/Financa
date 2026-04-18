import { User, Transaction, Account, Schedule, Loan, FriendDebt, UserSettings, RecurringIncome } from '../domain/entities';
import bcrypt from 'bcryptjs';

// ─── Repository Interfaces (Ports) ───

export interface IUserRepository {
  findByEmail(email: string): User | undefined;
  findById(id: string): User | undefined;
  create(user: User): User;
}

export interface ITransactionRepository {
  findByUserId(userId: string): Transaction[];
  findById(id: string): Transaction | undefined;
  create(tx: Transaction): Transaction;
  update(id: string, data: Partial<Transaction>): Transaction | undefined;
  delete(id: string): boolean;
}

export interface IAccountRepository {
  findByUserId(userId: string): Account[];
  findById(id: string): Account | undefined;
  create(account: Account): Account;
  update(id: string, data: Partial<Account>): Account | undefined;
  delete(id: string): boolean;
}

export interface IScheduleRepository {
  findByUserId(userId: string): Schedule[];
  findById(id: string): Schedule | undefined;
  create(schedule: Schedule): Schedule;
  update(id: string, data: Partial<Schedule>): Schedule | undefined;
  delete(id: string): boolean;
}

export interface IFriendDebtRepository {
  findByUserId(userId: string): FriendDebt[];
  findById(id: string): FriendDebt | undefined;
  create(debt: FriendDebt): FriendDebt;
  update(id: string, data: Partial<FriendDebt>): FriendDebt | undefined;
  delete(id: string): boolean;
}

export interface ISettingsRepository {
  findByUserId(userId: string): UserSettings | undefined;
  upsert(settings: UserSettings): UserSettings;
}

export interface IRecurringIncomeRepository {
  findByUserId(userId: string): RecurringIncome[];
  findById(id: string): RecurringIncome | undefined;
  create(income: RecurringIncome): RecurringIncome;
  update(id: string, data: Partial<RecurringIncome>): RecurringIncome | undefined;
  delete(id: string): boolean;
}

// ─── In-Memory Implementations ───

export class InMemoryUserRepository implements IUserRepository {
  private users: User[] = [];

  constructor() {
    const hash = bcrypt.hashSync('123456', 10);
    this.users.push({
      id: 'seed-user-1',
      email: 'test@financa.com',
      name: 'Usuário Teste',
      passwordHash: hash,
      preferredCurrency: 'BRL',
      createdAt: new Date().toISOString(),
    });
  }

  findByEmail(email: string) { return this.users.find(u => u.email === email); }
  findById(id: string) { return this.users.find(u => u.id === id); }
  create(user: User) { this.users.push(user); return user; }
}

export class InMemoryTransactionRepository implements ITransactionRepository {
  private txs: Transaction[] = [];

  findByUserId(userId: string) { return this.txs.filter(t => t.userId === userId); }
  findById(id: string) { return this.txs.find(t => t.id === id); }
  create(tx: Transaction) { this.txs.push(tx); return tx; }
  update(id: string, data: Partial<Transaction>) {
    const idx = this.txs.findIndex(t => t.id === id);
    if (idx === -1) return undefined;
    this.txs[idx] = { ...this.txs[idx], ...data };
    return this.txs[idx];
  }
  delete(id: string) {
    const idx = this.txs.findIndex(t => t.id === id);
    if (idx === -1) return false;
    this.txs.splice(idx, 1);
    return true;
  }
}

export class InMemoryAccountRepository implements IAccountRepository {
  private accounts: Account[] = [];

  findByUserId(userId: string) { return this.accounts.filter(a => a.userId === userId); }
  findById(id: string) { return this.accounts.find(a => a.id === id); }
  create(account: Account) { this.accounts.push(account); return account; }
  update(id: string, data: Partial<Account>) {
    const idx = this.accounts.findIndex(a => a.id === id);
    if (idx === -1) return undefined;
    this.accounts[idx] = { ...this.accounts[idx], ...data };
    return this.accounts[idx];
  }
  delete(id: string) {
    const idx = this.accounts.findIndex(a => a.id === id);
    if (idx === -1) return false;
    this.accounts.splice(idx, 1);
    return true;
  }
}

export class InMemoryScheduleRepository implements IScheduleRepository {
  private schedules: Schedule[] = [];

  findByUserId(userId: string) { return this.schedules.filter(s => s.userId === userId); }
  findById(id: string) { return this.schedules.find(s => s.id === id); }
  create(schedule: Schedule) { this.schedules.push(schedule); return schedule; }
  update(id: string, data: Partial<Schedule>) {
    const idx = this.schedules.findIndex(s => s.id === id);
    if (idx === -1) return undefined;
    this.schedules[idx] = { ...this.schedules[idx], ...data };
    return this.schedules[idx];
  }
  delete(id: string) {
    const idx = this.schedules.findIndex(s => s.id === id);
    if (idx === -1) return false;
    this.schedules.splice(idx, 1);
    return true;
  }
}

export class InMemoryFriendDebtRepository implements IFriendDebtRepository {
  private debts: FriendDebt[] = [];

  findByUserId(userId: string) { return this.debts.filter(d => d.userId === userId); }
  findById(id: string) { return this.debts.find(d => d.id === id); }
  create(debt: FriendDebt) { this.debts.push(debt); return debt; }
  update(id: string, data: Partial<FriendDebt>) {
    const idx = this.debts.findIndex(d => d.id === id);
    if (idx === -1) return undefined;
    this.debts[idx] = { ...this.debts[idx], ...data };
    return this.debts[idx];
  }
  delete(id: string) {
    const idx = this.debts.findIndex(d => d.id === id);
    if (idx === -1) return false;
    this.debts.splice(idx, 1);
    return true;
  }
}

export class InMemorySettingsRepository implements ISettingsRepository {
  private settings: UserSettings[] = [];

  findByUserId(userId: string) { return this.settings.find(s => s.userId === userId); }
  upsert(data: UserSettings) {
    const idx = this.settings.findIndex(s => s.userId === data.userId);
    if (idx === -1) { this.settings.push(data); return data; }
    this.settings[idx] = { ...this.settings[idx], ...data };
    return this.settings[idx];
  }
}

export class InMemoryRecurringIncomeRepository implements IRecurringIncomeRepository {
  private incomes: RecurringIncome[] = [];

  findByUserId(userId: string) { return this.incomes.filter(i => i.userId === userId); }
  findById(id: string) { return this.incomes.find(i => i.id === id); }
  create(income: RecurringIncome) { this.incomes.push(income); return income; }
  update(id: string, data: Partial<RecurringIncome>) {
    const idx = this.incomes.findIndex(i => i.id === id);
    if (idx === -1) return undefined;
    this.incomes[idx] = { ...this.incomes[idx], ...data };
    return this.incomes[idx];
  }
  delete(id: string) {
    const idx = this.incomes.findIndex(i => i.id === id);
    if (idx === -1) return false;
    this.incomes.splice(idx, 1);
    return true;
  }
}
