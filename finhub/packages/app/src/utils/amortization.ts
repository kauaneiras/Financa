export interface Installment {
  period: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

/**
 * Calculates amortization using the Price Table (fixed installments)
 */
export function calculatePriceTable(principal: number, annualInterestRate: number, months: number): Installment[] {
  if (months <= 0) return [];
  const monthlyRate = Math.pow(1 + annualInterestRate, 1 / 12) - 1; // Effective monthly rate or you could just divide by 12 depending on the country standards
  // Usually in Brazil, for Price table: i = annual / 12 for nominal rates, but let's use the explicit conversion or standard usage. Let's use nominal/12 to keep it simple.
  const i = annualInterestRate / 12;

  const installmentPayment = principal * (i * Math.pow(1 + i, months)) / (Math.pow(1 + i, months) - 1);
  
  let balance = principal;
  const schedule: Installment[] = [];

  for (let period = 1; period <= months; period++) {
    const interest = balance * i;
    const amortizedPrincipal = installmentPayment - interest;
    balance -= amortizedPrincipal;

    schedule.push({
      period,
      payment: Number(installmentPayment.toFixed(2)),
      principal: Number(amortizedPrincipal.toFixed(2)),
      interest: Number(interest.toFixed(2)),
      balance: Math.max(0, Number(balance.toFixed(2)))
    });
  }

  return schedule;
}

/**
 * Calculates amortization using the SAC Table (constant amortization)
 */
export function calculateSACTable(principal: number, annualInterestRate: number, months: number): Installment[] {
  if (months <= 0) return [];
  const i = annualInterestRate / 12;
  const amortizedPrincipal = principal / months;

  let balance = principal;
  const schedule: Installment[] = [];

  for (let period = 1; period <= months; period++) {
    const interest = balance * i;
    const payment = amortizedPrincipal + interest;
    balance -= amortizedPrincipal;

    schedule.push({
      period,
      payment: Number(payment.toFixed(2)),
      principal: Number(amortizedPrincipal.toFixed(2)),
      interest: Number(interest.toFixed(2)),
      balance: Math.max(0, Number(balance.toFixed(2)))
    });
  }

  return schedule;
}
