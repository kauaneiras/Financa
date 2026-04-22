// ─── Domain Entities (Pure, no dependencies) ───

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  preferredCurrency: string;
  createdAt: string;
}

export interface UserSettings {
  userId: string;
  monthStartDay: number;  // 1-31, when the financial month resets
  salaryDay: number;      // day of month salary arrives
  theme: 'light' | 'dark' | 'system';
  accentColor: string;    // hex color
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  bankName: string;
  type: 'CREDIT_CARD' | 'DEBIT' | 'CASH' | 'PIX' | 'VA' | 'VR';
  closingDay: number | null;
  dueDay: number | null;
  balance: number;         // current balance for VA/VR
  createdAt: string;
}

export type TransactionType = 'INCOME' | 'EXPENSE' | 'SUBSCRIPTION' | 'INVESTMENT';

export interface SplitEntry {
  friendName: string;
  amount: number;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  category: string;
  description: string;
  date: string;
  accountId: string | null;
  splits: SplitEntry[];
  // Subscription-specific
  isRecurring: boolean;
  frequencyRule: string | null;  // 'MONTHLY' | 'WEEKLY' | 'YEARLY'
  // Investment-specific
  investmentRate: number | null; // annual yield %
  // Installment-specific
  installments: number | null;        // total number of installments
  installmentCurrent: number | null;   // current installment (1-based)
  installmentStartDate: string | null; // when installments begin
  createdAt: string;
}

export interface FriendDebt {
  id: string;
  userId: string;
  friendName: string;
  amount: number;
  description: string;
  transactionId: string | null;
  paid: boolean;
  createdAt: string;
}

export interface RecurringIncome {
  id: string;
  userId: string;
  name: string;
  amount: number;
  category: string;
  dayOfMonth: number;         // day of month it arrives
  type: 'SALARY' | 'VA' | 'VR' | 'OTHER';
  active: boolean;
  startDate: string;
  createdAt: string;
}

export interface Schedule {
  id: string;
  userId: string;
  name: string;
  amount: number;
  category: string;
  frequencyRule: string;
  startDate: string;
  nextOccurrence: string;
  active: boolean;
  createdAt: string;
}

export type AmortizationType = 'PRICE' | 'SAC';

export interface Loan {
  id: string;
  userId: string;
  principal: number;
  annualRate: number;
  months: number;
  type: AmortizationType;
  status: 'ACTIVE' | 'PAID';
  createdAt: string;
}

export interface AmortizationRow {
  month: number;
  payment: number;
  interest: number;
  amortization: number;
  balance: number;
}

export interface DebtEntry {
  from: string;
  to: string;
  amount: number;
}

export interface BalanceBreakdown {
  accountName: string;
  type: string;
  balance: number;
}

export interface RecurringIncomeProjection {
  id: string;
  name: string;
  category: string;
  amount: number;
  type: 'SALARY' | 'VA' | 'VR' | 'OTHER';
  dayOfMonth: number;
  active: boolean;
  startDate: string;
  projectedAmount: number;
  confirmedAmount: number;
  dayPassed: boolean;
  confirmed: boolean;
  lastOccurrence: string | null;
  nextOccurrence: string | null;
}

export interface VoucherBalance {
  accountId: string;
  name: string;
  type: 'VA' | 'VR';
  balance: number;
}

export interface InstallmentPreview {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  installmentCurrent: number;
  installments: number;
}

export interface ForecastMonth {
  label: string;
  month: string;
  projectedIncome: number;
  projectedExpense: number;
  projectedBalance: number;
  subscriptionsTotal: number;
  installmentsTotal: number;
}

export interface PeriodSummary {
  from: string;
  to: string;
  projectedIncome: number;
  confirmedIncome: number;
  totalExpense: number;
  totalInvestments: number;
  balance: number;
  recurringIncomes: RecurringIncomeProjection[];
  categoryBreakdown: { category: string; total: number }[];
  voucherBalances: VoucherBalance[];
  installments: InstallmentPreview[];
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpense: number;
  currentBalance: number;
  activeSubscriptionsTotal: number;
  predictedRemainingBalance: number;
  totalInvestments: number;
  byCategory: { category: string; total: number }[];
  friendDebts: { name: string; amount: number }[];
  timeline: { date: string; income: number; expense: number }[];
  balanceBreakdown: BalanceBreakdown[];
  periodSummary: PeriodSummary;
  forecast: ForecastMonth[];
  transactions: Transaction[];
  accounts: Account[];
  recurrings: RecurringIncome[];
  subscriptions: Transaction[];
}
