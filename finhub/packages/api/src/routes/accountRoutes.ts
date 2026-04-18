import { Router } from 'express';

const router = Router();
export const accountsMock: any[] = [];

// Create Account/Card (Optional approach)
router.post('/', (req, res) => {
  const { name, bankName } = req.body;
  const user = (req as any).user;
  
  if (!name || !bankName) {
    return res.status(400).json({ error: 'Name and Bank Name are required explicitly' });
  }

  // Due Dates and Closing dates were removed as mandatory fields
  const account = { id: Math.random().toString(), name, bankName, userId: user.id };
  accountsMock.push(account);
  
  res.status(201).json(account);
});

router.get('/', (req, res) => {
  const user = (req as any).user;
  const userAccounts = accountsMock.filter(a => a.userId === user.id);
  res.json(userAccounts);
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const index = accountsMock.findIndex(a => a.id === id);
  if (index !== -1) accountsMock.splice(index, 1);
  res.status(204).send();
});

export default router;
