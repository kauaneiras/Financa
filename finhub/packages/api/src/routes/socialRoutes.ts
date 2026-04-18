import { Router } from 'express';

const router = Router();

router.post('/simplify', (req, res) => {
  // Mocked for stability
  res.json({
    originalCount: req.body.transactions?.length || 0,
    optimizedCount: 0,
    results: []
  });
});

export default router;
