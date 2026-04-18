import { AmortizationRow, AmortizationType } from '../domain/entities';

// ─── Strategy Pattern: Amortization ───

export interface IAmortizationStrategy {
  calculate(principal: number, annualRate: number, months: number): AmortizationRow[];
}

export class PriceAmortization implements IAmortizationStrategy {
  calculate(principal: number, annualRate: number, months: number): AmortizationRow[] {
    const monthlyRate = annualRate / 12;
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    const rows: AmortizationRow[] = [];
    let balance = principal;

    for (let m = 1; m <= months; m++) {
      const interest = +(balance * monthlyRate).toFixed(2);
      const amortization = +(payment - interest).toFixed(2);
      balance = +(balance - amortization).toFixed(2);
      rows.push({ month: m, payment: +payment.toFixed(2), interest, amortization, balance: Math.max(balance, 0) });
    }
    return rows;
  }
}

export class SACAmortization implements IAmortizationStrategy {
  calculate(principal: number, annualRate: number, months: number): AmortizationRow[] {
    const monthlyRate = annualRate / 12;
    const constantAmortization = principal / months;
    const rows: AmortizationRow[] = [];
    let balance = principal;

    for (let m = 1; m <= months; m++) {
      const interest = +(balance * monthlyRate).toFixed(2);
      const payment = +(constantAmortization + interest).toFixed(2);
      balance = +(balance - constantAmortization).toFixed(2);
      rows.push({ month: m, payment, interest, amortization: +constantAmortization.toFixed(2), balance: Math.max(balance, 0) });
    }
    return rows;
  }
}

// ─── Context (Strategy selector) ───
export function getAmortizationStrategy(type: AmortizationType): IAmortizationStrategy {
  return type === 'SAC' ? new SACAmortization() : new PriceAmortization();
}
