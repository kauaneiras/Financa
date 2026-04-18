import { Router } from 'express';
import { DashboardUseCase } from '../usecases/dashboard';
import { ITransactionRepository, IScheduleRepository, IAccountRepository } from '../repositories';
import { AuthRequest } from '../middlewares/auth';

export function createDashboardRouter(txRepo: ITransactionRepository, scheduleRepo: IScheduleRepository, accountRepo: IAccountRepository) {
  const router = Router();
  const usecase = new DashboardUseCase(txRepo, scheduleRepo, accountRepo);

  router.get('/', (req: AuthRequest, res) => {
    try {
      const summary = usecase.execute(req.user!.id);
      res.json(summary);
    } catch (err) {
      console.error('Dashboard error:', err);
      res.status(500).json({ error: 'Erro ao gerar dashboard' });
    }
  });

  return router;
}
