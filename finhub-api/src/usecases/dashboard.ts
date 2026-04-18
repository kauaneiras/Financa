import { ITransactionRepository, IScheduleRepository, IAccountRepository } from '../repositories';
import { DashboardSummary } from '../domain/entities';

export class DashboardUseCase {
  constructor(
    private txRepo: ITransactionRepository,
    private scheduleRepo: IScheduleRepository,
    private accountRepo?: IAccountRepository,
  ) {}

  execute(userId: string): DashboardSummary {
    const txs = this.txRepo.findByUserId(userId);
    const schedules = this.scheduleRepo.findByUserId(userId);

    const totalIncome = txs.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
    const totalExpense = txs.filter(t => t.type === 'EXPENSE' || t.type === 'SUBSCRIPTION').reduce((s, t) => s + t.amount, 0);
    const totalInvestments = txs.filter(t => t.type === 'INVESTMENT').reduce((s, t) => s + t.amount, 0);
    const currentBalance = totalIncome - totalExpense - totalInvestments;

    const activeSubscriptionsTotal = txs
      .filter(t => t.type === 'SUBSCRIPTION' && t.isRecurring)
      .reduce((s, t) => s + t.amount, 0);

    const predictedRemainingBalance = currentBalance - activeSubscriptionsTotal;

    // By category for pie chart
    const catMap: Record<string, number> = {};
    txs.filter(t => t.type === 'EXPENSE' || t.type === 'SUBSCRIPTION').forEach(t => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });
    const byCategory = Object.entries(catMap).map(([category, total]) => ({ category, total: +total.toFixed(2) }));

    // Friend debts from splits (unpaid only)
    const friendMap: Record<string, number> = {};
    txs.forEach(t => {
      (t.splits || []).forEach(s => {
        friendMap[s.friendName] = (friendMap[s.friendName] || 0) + s.amount;
      });
    });
    const friendDebts = Object.entries(friendMap).map(([name, amount]) => ({ name, amount: +amount.toFixed(2) }));

    // Timeline: aggregate by month
    const timelineMap: Record<string, { income: number; expense: number }> = {};
    txs.forEach(t => {
      const month = t.date.substring(0, 7); // YYYY-MM
      if (!timelineMap[month]) timelineMap[month] = { income: 0, expense: 0 };
      if (t.type === 'INCOME') timelineMap[month].income += t.amount;
      else timelineMap[month].expense += t.amount;
    });
    const timeline = Object.entries(timelineMap)
      .map(([date, v]) => ({ date, income: +v.income.toFixed(2), expense: +v.expense.toFixed(2) }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Balance breakdown by account
    const balanceBreakdown: { accountName: string; type: string; balance: number }[] = [];
    if (this.accountRepo) {
      const accounts = this.accountRepo.findByUserId(userId);
      accounts.forEach(acc => {
        balanceBreakdown.push({
          accountName: acc.name,
          type: acc.type,
          balance: +acc.balance.toFixed(2),
        });
      });
    }
    // Add "Principal" entry (unallocated balance)
    const allocatedBalance = balanceBreakdown.reduce((s, b) => s + b.balance, 0);
    balanceBreakdown.unshift({
      accountName: 'Conta Principal',
      type: 'MAIN',
      balance: +(predictedRemainingBalance - allocatedBalance).toFixed(2),
    });

    return {
      totalIncome: +totalIncome.toFixed(2),
      totalExpense: +totalExpense.toFixed(2),
      currentBalance: +currentBalance.toFixed(2),
      activeSubscriptionsTotal: +activeSubscriptionsTotal.toFixed(2),
      predictedRemainingBalance: +predictedRemainingBalance.toFixed(2),
      totalInvestments: +totalInvestments.toFixed(2),
      byCategory,
      friendDebts,
      timeline,
      balanceBreakdown,
    };
  }
}
