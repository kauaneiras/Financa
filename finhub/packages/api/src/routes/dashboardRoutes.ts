import { Router } from 'express';
import { transactionsMock } from './transactionRoutes';
import { schedulesMock } from './scheduleRoutes';
import { loansMock } from './loanRoutes';

const router = Router();

router.get('/', (req, res) => {
  const user = (req as any).user;

  // Filtrar dados reais do usuário
  const userTxs = transactionsMock.filter(t => t.userId === user.id);
  const userSchedules = schedulesMock.filter(s => s.userId === user.id);

  // Somatórias Reais (Correntes)
  const totalIncome = userTxs.filter(t => t.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = userTxs.filter(t => t.type === 'EXPENSE').reduce((acc, curr) => acc + curr.amount, 0);
  
  // Saldo Atual Real
  const currentBalance = totalIncome - totalExpense;

  // Calculando Projeções Financeiras Inteligentes (Assinaturas e coisas futuras)
  // Assumimos que schedules ainda vão cobrar no vencimento do mes, subtraimos do que 'vai sobrar'
  const futureScheduleTax = userSchedules.reduce((acc, curr) => acc + curr.amount, 0);
  const predictedRemainingBalance = currentBalance - futureScheduleTax;

  res.json({
    currentBalance,
    predictedRemainingBalance,
    totalIncome,
    totalExpense,
    activeSubscriptionsTotal: futureScheduleTax
  });
});

export default router;
