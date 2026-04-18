import { Router } from 'express';
// Removed external dependencies
const router = Router();
export const loansMock: any[] = [];

router.post('/simulate', (req, res) => {
  res.json({ type: req.body.type, principal: req.body.principal, schedule: [] });
});

router.post('/', (req, res) => {
  const { principal, annualRate, months, type, destinationAccountId } = req.body;
  const user = (req as any).user;
  const loan = { 
    id: Math.random().toString(), 
    principal, 
    userId: user.id,
    destinationAccountId,
    status: 'ACTIVE',
    createdAt: new Date().toISOString()
  };
  loansMock.push(loan);
  res.status(201).json(loan);
});

router.get('/', (req, res) => {
  const user = (req as any).user;
  res.json(loansMock.filter(l => l.userId === user.id));
});

export default router;
