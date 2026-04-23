import {
  Account,
  DashboardSummary,
  ForecastMonth,
  PeriodSummary,
  RecurringIncome,
  RecurringIncomeProjection,
  Transaction,
  VoucherBalance,
} from '../domain/entities';
import {
  IAccountRepository,
  IRecurringIncomeRepository,
  IScheduleRepository,
  ITransactionRepository,
} from '../repositories';

const DAY_MS = 24 * 60 * 60 * 1000;
const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });

function startOfDay(input: Date) {
  const date = new Date(input);
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfDay(input: Date) {
  const date = new Date(input);
  date.setHours(23, 59, 59, 999);
  return date;
}

function addDays(input: Date, amount: number) {
  const date = new Date(input);
  date.setDate(date.getDate() + amount);
  return date;
}

function addMonths(input: Date, amount: number) {
  const date = new Date(input);
  date.setMonth(date.getMonth() + amount, 1);
  return date;
}

function startOfMonth(input: Date) {
  return new Date(input.getFullYear(), input.getMonth(), 1);
}

function endOfMonth(input: Date) {
  return new Date(input.getFullYear(), input.getMonth() + 1, 0, 23, 59, 59, 999);
}

function monthKey(input: Date) {
  return input.toISOString().slice(0, 7);
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function clampDay(year: number, monthIndex: number, dayOfMonth: number) {
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  return Math.min(dayOfMonth, lastDay);
}

function recurringOccurrenceForMonth(recurring: RecurringIncome, year: number, monthIndex: number) {
  return startOfDay(new Date(year, monthIndex, clampDay(year, monthIndex, recurring.dayOfMonth)));
}

function sameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function isCashRecurring(recurring: RecurringIncome) {
  return recurring.type === 'SALARY' || recurring.type === 'OTHER';
}

function sortByDateAsc<T extends { date: string }>(items: T[]) {
  return [...items].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function sortByDateDesc<T extends { date: string }>(items: T[]) {
  return [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function findRecurringOccurrences(recurring: RecurringIncome, from: Date, to: Date) {
  const results: Date[] = [];
  const recurringStart = startOfDay(new Date(recurring.startDate || recurring.createdAt));
  let cursor = startOfMonth(new Date(Math.max(from.getTime(), recurringStart.getTime())));

  while (cursor <= to) {
    const occurrence = recurringOccurrenceForMonth(recurring, cursor.getFullYear(), cursor.getMonth());
    if (occurrence >= recurringStart && occurrence >= from && occurrence <= to) {
      results.push(occurrence);
    }
    cursor = addMonths(cursor, 1);
  }

  return results;
}

function nextRecurringOccurrence(recurring: RecurringIncome, after: Date) {
  const recurringStart = startOfDay(new Date(recurring.startDate || recurring.createdAt));
  let cursor = startOfMonth(new Date(Math.max(after.getTime(), recurringStart.getTime())));

  for (let index = 0; index < 24; index += 1) {
    const occurrence = recurringOccurrenceForMonth(recurring, cursor.getFullYear(), cursor.getMonth());
    if (occurrence >= recurringStart && occurrence > after) {
      return occurrence.toISOString();
    }
    cursor = addMonths(cursor, 1);
  }

  return null;
}

function buildRecurringProjection(
  recurring: RecurringIncome,
  from: Date,
  to: Date,
  confirmationEnd: Date,
  incomeTransactions: Transaction[],
  usedManualIncomeIds: Set<string>,
) {
  const occurrences = findRecurringOccurrences(recurring, from, to);
  const matches = occurrences.map((occurrence) => {
    const manualMatch = incomeTransactions.find((transaction) => {
      if (usedManualIncomeIds.has(transaction.id)) {
        return false;
      }

      const transactionDate = new Date(transaction.date);
      const sameValue = Math.abs(transaction.amount - recurring.amount) < 0.01;
      const sameWindow = sameMonth(transactionDate, occurrence)
        || Math.abs(transactionDate.getTime() - occurrence.getTime()) <= 7 * DAY_MS;
      const text = `${transaction.category} ${transaction.description}`.toLowerCase();
      const recurringText = `${recurring.name} ${recurring.category}`.toLowerCase();
      const sameSource = text.includes(recurring.name.toLowerCase())
        || text.includes(recurring.category.toLowerCase())
        || recurringText.includes(transaction.category.toLowerCase());

      return sameValue && sameWindow && sameSource;
    });

    if (manualMatch) {
      usedManualIncomeIds.add(manualMatch.id);
    }

    return {
      occurrence,
      manualMatch,
      confirmed: Boolean(manualMatch) || occurrence <= confirmationEnd,
    };
  });

  const projectedAmount = matches.reduce((sum, entry) => sum + entry.occurrence.getTime(), 0);
  void projectedAmount;

  const projected = matches.reduce((sum) => sum + recurring.amount, 0);
  const confirmed = matches.reduce((sum, entry) => (
    entry.confirmed ? sum + recurring.amount : sum
  ), 0);
  const lastOccurrence = matches.length > 0 ? matches[matches.length - 1].occurrence.toISOString() : null;

  const summary: RecurringIncomeProjection = {
    id: recurring.id,
    name: recurring.name,
    category: recurring.category,
    amount: recurring.amount,
    type: recurring.type,
    dayOfMonth: recurring.dayOfMonth,
    active: recurring.active,
    startDate: recurring.startDate,
    projectedAmount: +projected.toFixed(2),
    confirmedAmount: +confirmed.toFixed(2),
    dayPassed: matches.some((entry) => entry.occurrence <= confirmationEnd),
    confirmed: projected > 0 && confirmed >= projected,
    lastOccurrence,
    nextOccurrence: nextRecurringOccurrence(recurring, to),
  };

  return summary;
}

function createTimeline(transactions: Transaction[]) {
  const timelineMap: Record<string, { income: number; expense: number }> = {};

  transactions.forEach((transaction) => {
    const key = transaction.date.substring(0, 7);
    if (!timelineMap[key]) {
      timelineMap[key] = { income: 0, expense: 0 };
    }

    if (transaction.type === 'INCOME') {
      timelineMap[key].income += transaction.amount;
    } else {
      timelineMap[key].expense += transaction.amount;
    }
  });

  return Object.entries(timelineMap)
    .map(([date, value]) => ({
      date,
      income: +value.income.toFixed(2),
      expense: +value.expense.toFixed(2),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function buildForecast(
  transactions: Transaction[],
  recurrings: RecurringIncome[],
  referenceDate: Date,
) {
  const recurringSubscriptions = transactions.filter((transaction) => (
    transaction.type === 'SUBSCRIPTION' && transaction.isRecurring
  ));

  const forecast: ForecastMonth[] = [];

  for (let offset = 1; offset <= 6; offset += 1) {
    const monthStart = startOfMonth(addMonths(referenceDate, offset));
    const monthEnd = endOfMonth(monthStart);
    const cashIncome = recurrings.reduce((sum, recurring) => {
      if (!recurring.active || !isCashRecurring(recurring)) {
        return sum;
      }

      const recurringStart = startOfDay(new Date(recurring.startDate || recurring.createdAt));
      const occurrence = recurringOccurrenceForMonth(recurring, monthStart.getFullYear(), monthStart.getMonth());
      if (occurrence < recurringStart || occurrence > monthEnd) {
        return sum;
      }

      return sum + recurring.amount;
    }, 0);

    const subscriptionsTotal = recurringSubscriptions.reduce((sum, transaction) => {
      const transactionDate = startOfDay(new Date(transaction.date));
      if (transactionDate > monthEnd) {
        return sum;
      }
      return sum + transaction.amount;
    }, 0);

    const installmentsTotal = transactions.reduce((sum, transaction) => {
      if (transaction.type !== 'EXPENSE' || !transaction.installments || transaction.installments <= 1) {
        return sum;
      }

      const transactionDate = new Date(transaction.date);
      if (!sameMonth(transactionDate, monthStart)) {
        return sum;
      }

      return sum + transaction.amount;
    }, 0);

    const projectedExpense = subscriptionsTotal + installmentsTotal;

    forecast.push({
      label: capitalize(monthFormatter.format(monthStart)),
      month: monthKey(monthStart),
      projectedIncome: +cashIncome.toFixed(2),
      projectedExpense: +projectedExpense.toFixed(2),
      projectedBalance: +(cashIncome - projectedExpense).toFixed(2),
      subscriptionsTotal: +subscriptionsTotal.toFixed(2),
      installmentsTotal: +installmentsTotal.toFixed(2),
    });
  }

  return forecast;
}

export class DashboardUseCase {
  constructor(
    private txRepo: ITransactionRepository,
    private scheduleRepo: IScheduleRepository,
    private accountRepo: IAccountRepository,
    private recurringRepo: IRecurringIncomeRepository,
  ) {}

  execute(userId: string, input?: { from?: string; to?: string }): DashboardSummary {
    void this.scheduleRepo;

    const today = endOfDay(new Date());
    const periodTo = input?.to ? endOfDay(new Date(input.to)) : today;
    const periodFrom = input?.from ? startOfDay(new Date(input.from)) : startOfDay(addDays(periodTo, -29));
    const confirmationEnd = new Date(Math.min(today.getTime(), periodTo.getTime()));

    const transactions = this.txRepo.findByUserId(userId);
    const accounts = this.accountRepo.findByUserId(userId);
    const recurrings = this.recurringRepo.findByUserId(userId);
    const periodTransactions = sortByDateDesc(
      transactions.filter((transaction) => {
        const date = new Date(transaction.date);
        return date >= periodFrom && date <= periodTo;
      }),
    );

    const incomeTransactions = sortByDateAsc(
      periodTransactions.filter((transaction) => transaction.type === 'INCOME'),
    );
    const manualIncomeTotal = incomeTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    const usedManualIncomeIds = new Set<string>();

    const recurringIncomes = recurrings
      .filter((recurring) => recurring.active)
      .map((recurring) => buildRecurringProjection(
        recurring,
        periodFrom,
        periodTo,
        confirmationEnd,
        incomeTransactions,
        usedManualIncomeIds,
      ))
      .filter((recurring) => recurring.projectedAmount > 0)
      .sort((a, b) => a.dayOfMonth - b.dayOfMonth);

    const recurringProjectedCash = recurringIncomes.reduce((sum, recurring) => (
      isCashRecurring(recurring as unknown as RecurringIncome) ? sum + recurring.projectedAmount : sum
    ), 0);
    const recurringConfirmedCash = recurringIncomes.reduce((sum, recurring) => (
      (recurring.type === 'SALARY' || recurring.type === 'OTHER') ? sum + recurring.confirmedAmount : sum
    ), 0);

    const periodExpenses = periodTransactions.filter((transaction) => (
      transaction.type === 'EXPENSE' || transaction.type === 'SUBSCRIPTION'
    ));
    const totalExpense = periodExpenses.reduce((sum, transaction) => sum + transaction.amount, 0);
    const totalInvestments = periodTransactions
      .filter((transaction) => transaction.type === 'INVESTMENT')
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const categoryMap: Record<string, number> = {};
    periodExpenses.forEach((transaction) => {
      categoryMap[transaction.category] = (categoryMap[transaction.category] || 0) + transaction.amount;
    });

    const categoryBreakdown = Object.entries(categoryMap)
      .map(([category, total]) => ({ category, total: +total.toFixed(2) }))
      .sort((a, b) => b.total - a.total);

    const installments = periodTransactions
      .filter((transaction) => (
        transaction.type === 'EXPENSE'
        && Boolean(transaction.installments)
        && (transaction.installments || 0) > 1
      ))
      .map((transaction) => ({
        id: transaction.id,
        description: transaction.description || transaction.category,
        category: transaction.category,
        amount: +transaction.amount.toFixed(2),
        date: transaction.date,
        installmentCurrent: transaction.installmentCurrent || 1,
        installments: transaction.installments || 1,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const voucherBalances: VoucherBalance[] = accounts
      .filter((account): account is Account & { type: 'VA' | 'VR' } => account.type === 'VA' || account.type === 'VR')
      .map((account) => ({
        accountId: account.id,
        name: account.name,
        type: account.type,
        balance: +account.balance.toFixed(2),
      }));

    const cashProjectedIncome = manualIncomeTotal + recurringProjectedCash;
    const cashConfirmedIncome = manualIncomeTotal + recurringConfirmedCash;
    const balance = cashConfirmedIncome - totalExpense - totalInvestments;
    const activeSubscriptionsTotal = transactions
      .filter((transaction) => transaction.type === 'SUBSCRIPTION' && transaction.isRecurring)
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const friendMap: Record<string, number> = {};
    transactions.forEach((transaction) => {
      (transaction.splits || []).forEach((split) => {
        friendMap[split.friendName] = (friendMap[split.friendName] || 0) + split.amount;
      });
    });

    const balanceBreakdown = accounts.map((account: Account) => ({
      accountName: account.name,
      type: account.type,
      balance: +account.balance.toFixed(2),
    }));

    const periodSummary: PeriodSummary = {
      from: periodFrom.toISOString(),
      to: periodTo.toISOString(),
      projectedIncome: +cashProjectedIncome.toFixed(2),
      confirmedIncome: +cashConfirmedIncome.toFixed(2),
      totalExpense: +totalExpense.toFixed(2),
      totalInvestments: +totalInvestments.toFixed(2),
      balance: +balance.toFixed(2),
      recurringIncomes,
      categoryBreakdown,
      voucherBalances,
      installments,
    };

    return {
      totalIncome: periodSummary.confirmedIncome,
      totalExpense: periodSummary.totalExpense,
      currentBalance: periodSummary.balance,
      activeSubscriptionsTotal: +activeSubscriptionsTotal.toFixed(2),
      predictedRemainingBalance: periodSummary.balance,
      totalInvestments: periodSummary.totalInvestments,
      byCategory: categoryBreakdown,
      friendDebts: Object.entries(friendMap).map(([name, amount]) => ({
        name,
        amount: +amount.toFixed(2),
      })),
      timeline: createTimeline(transactions),
      balanceBreakdown,
      periodSummary,
      forecast: buildForecast(transactions, recurrings.filter((recurring) => recurring.active), periodTo),
      transactions: periodTransactions,
      accounts,
      recurrings,
      subscriptions: sortByDateDesc(
        transactions.filter((transaction) => (
          transaction.type === 'SUBSCRIPTION' && transaction.isRecurring
        )),
      ),
    };
  }
}
