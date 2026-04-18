import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middlewares/validate';
import { AuthRequest } from '../middlewares/auth';
import { ISettingsRepository } from '../repositories';

const upsertSchema = z.object({
  monthStartDay: z.number({ coerce: true }).min(1).max(31).optional(),
  salaryDay: z.number({ coerce: true }).min(1).max(31).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  accentColor: z.string().optional(),
});

export function createSettingsRouter(settingsRepo: ISettingsRepository) {
  const router = Router();

  router.get('/', (req: AuthRequest, res) => {
    const settings = settingsRepo.findByUserId(req.user!.id);
    res.json(settings || { userId: req.user!.id, monthStartDay: 1, salaryDay: 5, theme: 'system', accentColor: '#21CD7A' });
  });

  router.put('/', validate(upsertSchema), (req: AuthRequest, res) => {
    const existing = settingsRepo.findByUserId(req.user!.id);
    const settings = settingsRepo.upsert({
      userId: req.user!.id,
      monthStartDay: req.body.monthStartDay ?? existing?.monthStartDay ?? 1,
      salaryDay: req.body.salaryDay ?? existing?.salaryDay ?? 5,
      theme: req.body.theme ?? existing?.theme ?? 'system',
      accentColor: req.body.accentColor ?? existing?.accentColor ?? '#21CD7A',
    });
    res.json(settings);
  });

  return router;
}
