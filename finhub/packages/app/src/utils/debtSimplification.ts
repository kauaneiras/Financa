export interface Balance {
  userId: string;
  amount: number;
}

export interface TransactionRule {
  from: string;
  to: string;
  amount: number;
}

/**
 * Simplifies a list of debts between people.
 * Uses a greedy approach to match the largest debtor with the largest creditor.
 */
export function simplifyDebts(transactions: TransactionRule[]): TransactionRule[] {
  const balances: Record<string, number> = {};

  // Calculate net balances
  for (const t of transactions) {
    balances[t.from] = (balances[t.from] || 0) - t.amount;
    balances[t.to] = (balances[t.to] || 0) + t.amount;
  }

  const debtors: Balance[] = [];
  const creditors: Balance[] = [];

  for (const [userId, amount] of Object.entries(balances)) {
    if (amount < -0.01) debtors.push({ userId, amount: -amount });
    if (amount > 0.01) creditors.push({ userId, amount });
  }

  // Sort them so we pop the largest ones from the end
  debtors.sort((a, b) => a.amount - b.amount);
  creditors.sort((a, b) => a.amount - b.amount);

  const results: TransactionRule[] = [];

  while (debtors.length > 0 && creditors.length > 0) {
    const debtor = debtors.pop()!;
    const creditor = creditors.pop()!;

    const settledAmount = Math.min(debtor.amount, creditor.amount);

    results.push({
      from: debtor.userId,
      to: creditor.userId,
      amount: Math.round(settledAmount * 100) / 100,
    });

    debtor.amount -= settledAmount;
    creditor.amount -= settledAmount;

    // Push back if there's still a remaining balance (above precision threshold)
    if (debtor.amount > 0.01) {
      debtors.push(debtor);
      debtors.sort((a, b) => a.amount - b.amount);
    }
    if (creditor.amount > 0.01) {
      creditors.push(creditor);
      creditors.sort((a, b) => a.amount - b.amount);
    }
  }

  return results;
}
