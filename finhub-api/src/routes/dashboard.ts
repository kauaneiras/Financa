import { Router } from 'express';
import { DashboardUseCase } from '../usecases/dashboard';
import {
  IAccountRepository,
  IRecurringIncomeRepository,
  IScheduleRepository,
  ITransactionRepository,
} from '../repositories';
import { AuthRequest } from '../middlewares/auth';

export function createDashboardRouter(
  txRepo: ITransactionRepository,
  scheduleRepo: IScheduleRepository,
  accountRepo: IAccountRepository,
  recurringRepo: IRecurringIncomeRepository,
) {
  const router = Router();
  const usecase = new DashboardUseCase(txRepo, scheduleRepo, accountRepo, recurringRepo);

  router.get('/', (req: AuthRequest, res) => {
    try {
      const summary = usecase.execute(req.user!.id, {
        from: typeof req.query.from === 'string' ? req.query.from : undefined,
        to: typeof req.query.to === 'string' ? req.query.to : undefined,
      });
      res.json(summary);
    } catch (err) {
      console.error('Dashboard error:', err);
      res.status(500).json({ error: 'Erro ao gerar dashboard' });
    }
  });

  return router;
}
