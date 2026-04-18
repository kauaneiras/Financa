import { Router } from 'express';

const router = Router();
export const transactionsMock: any[] = [];

router.post('/', (req, res) => {
  const { amount, category, date, accountId, description, type } = req.body; 
  const user = (req as any).user;
  
  if (!amount || !type || !category) return res.status(400).json({ error: 'Missing fundamental details' });

  const tx = { 
    id: Math.random().toString(), 
    amount: Number(amount), 
    category, 
    date: date || new Date().toISOString(), 
    accountId: accountId || null, 
    userId: user.id,
    description: description || '',
    type
  };
  transactionsMock.push(tx);
  res.status(201).json(tx);
});

router.get('/', (req, res) => {
  const user = (req as any).user;
  const userTxs = transactionsMock.filter(t => t.userId === user.id);
  res.json(userTxs);
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const user = (req as any).user;
  const txIndex = transactionsMock.findIndex(t => t.id === id && t.userId === user.id);
  if (txIndex === -1) return res.status(404).json({ error: 'Registro não encontrado' });
  transactionsMock[txIndex] = { ...transactionsMock[txIndex], ...req.body };
  res.json(transactionsMock[txIndex]);
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const user = (req as any).user;
  const idx = transactionsMock.findIndex(t => t.id === id && t.userId === user.id);
  if (idx !== -1) transactionsMock.splice(idx, 1);
  res.status(204).send();
});

router.post('/simulate-loan', (req, res) => {
  // Mocked for stability
  res.json({ type: req.body.type, principal: req.body.principal, schedule: [] });
});

export default router;
