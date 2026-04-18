import { Router } from 'express';
import { z } from 'zod';
import { simplifyDebts } from '../usecases/debtSimplification';
import { validate } from '../middlewares/validate';

const simplifySchema = z.object({
  transactions: z.array(z.object({
    from: z.string(),
    to: z.string(),
    amount: z.number({ coerce: true }).positive(),
  })),
});

export function createSocialRouter() {
  const router = Router();

  router.post('/simplify', validate(simplifySchema), (req, res) => {
    const result = simplifyDebts(req.body.transactions);
    res.json({
      originalCount: req.body.transactions.length,
      optimizedCount: result.length,
      results: result,
    });
  });

  return router;
}
