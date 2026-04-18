import { Router } from 'express';

const router = Router();
export const schedulesMock: any[] = [];

router.post('/', (req, res) => {
  const { frequencyRule, startDate, amount, category, name } = req.body;
  const user = (req as any).user;

  if (!frequencyRule || !startDate || !amount) return res.status(400).json({ error: 'Missing logic fields' });

  const schedule = {
    id: Math.random().toString(),
    userId: user.id,
    name: name || category,
    frequencyRule,
    startDate,
    amount: Number(amount),
    category,
    nextOccurrence: startDate
  };

  schedulesMock.push(schedule);
  res.status(201).json(schedule);
});

router.get('/', (req, res) => {
  const user = (req as any).user;
  res.json(schedulesMock.filter(s => s.userId === user.id));
});

// Update an existing schedule (e.g., Netflix price increased)
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const user = (req as any).user;

  const stIdx = schedulesMock.findIndex(s => s.id === id && s.userId === user.id);
  if (stIdx === -1) return res.status(404).json({ error: 'Assinatura não encontrada' });

  schedulesMock[stIdx] = { ...schedulesMock[stIdx], ...req.body };
  res.json(schedulesMock[stIdx]);
});

// Cancelar uma assinatura e deixar de contar para o próximo mês
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const user = (req as any).user;

  const stIdx = schedulesMock.findIndex(s => s.id === id && s.userId === user.id);
  if (stIdx !== -1) schedulesMock.splice(stIdx, 1);

  res.status(204).send();
});

export default router;
