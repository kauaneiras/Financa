import { DebtEntry } from '../domain/entities';

// ─── Debt Simplification (Greedy Max-Heap approach) ───

export function simplifyDebts(debts: DebtEntry[]): DebtEntry[] {
  const balances: Record<string, number> = {};

  for (const d of debts) {
    balances[d.from] = (balances[d.from] || 0) - d.amount;
    balances[d.to] = (balances[d.to] || 0) + d.amount;
  }

  const creditors: { person: string; amount: number }[] = [];
  const debtors: { person: string; amount: number }[] = [];

  for (const [person, amount] of Object.entries(balances)) {
    if (amount > 0.01) creditors.push({ person, amount });
    else if (amount < -0.01) debtors.push({ person, amount: Math.abs(amount) });
  }

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const result: DebtEntry[] = [];
  let i = 0, j = 0;

  while (i < debtors.length && j < creditors.length) {
    const settled = Math.min(debtors[i].amount, creditors[j].amount);
    result.push({ from: debtors[i].person, to: creditors[j].person, amount: +settled.toFixed(2) });
    debtors[i].amount -= settled;
    creditors[j].amount -= settled;
    if (debtors[i].amount < 0.01) i++;
    if (creditors[j].amount < 0.01) j++;
  }

  return result;
}
