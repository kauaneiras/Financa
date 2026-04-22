import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import { authMiddleware } from './middlewares/auth';

// Repositories (in-memory — swap for Prisma later)
import {
  InMemoryUserRepository,
  InMemoryTransactionRepository,
  InMemoryAccountRepository,
  InMemoryScheduleRepository,
  InMemoryFriendDebtRepository,
  InMemorySettingsRepository,
  InMemoryRecurringIncomeRepository,
} from './repositories';

// Route factories (Dependency Injection)
import { createAuthRouter } from './routes/auth';
import { createTransactionRouter } from './routes/transactions';
import { createAccountRouter } from './routes/accounts';
import { createScheduleRouter } from './routes/schedules';
import { createDashboardRouter } from './routes/dashboard';
import { createSocialRouter } from './routes/social';
import { createFriendsRouter } from './routes/friends';
import { createSettingsRouter } from './routes/settings';
import { createRecurringRouter } from './routes/recurring';

// ─── Bootstrap Repositories ───
const userRepo = new InMemoryUserRepository();
const txRepo = new InMemoryTransactionRepository();
const accountRepo = new InMemoryAccountRepository();
const scheduleRepo = new InMemoryScheduleRepository();
const friendDebtRepo = new InMemoryFriendDebtRepository();
const settingsRepo = new InMemorySettingsRepository();
const recurringIncomeRepo = new InMemoryRecurringIncomeRepository();

// ─── Express App ───
const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'financa-api', timestamp: new Date().toISOString() });
});

// Public
app.use('/api/auth', createAuthRouter(userRepo));

// Protected
app.use('/api/transactions', authMiddleware, createTransactionRouter(txRepo, friendDebtRepo, accountRepo));
app.use('/api/accounts', authMiddleware, createAccountRouter(accountRepo));
app.use('/api/schedules', authMiddleware, createScheduleRouter(scheduleRepo));
app.use('/api/dashboard', authMiddleware, createDashboardRouter(txRepo, scheduleRepo, accountRepo, recurringIncomeRepo));
app.use('/api/social', authMiddleware, createSocialRouter());
app.use('/api/friends', authMiddleware, createFriendsRouter(friendDebtRepo));
app.use('/api/settings', authMiddleware, createSettingsRouter(settingsRepo));
app.use('/api/recurring', authMiddleware, createRecurringRouter(recurringIncomeRepo));

// ─── Start ───
export const server = app.listen(config.port, () => {
  console.log(`🚀 Financa API running on http://localhost:${config.port}`);
  console.log(`👤 Seed user: test@financa.com / 123456`);
});

export default app;
