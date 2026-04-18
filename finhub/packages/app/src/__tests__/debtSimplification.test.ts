import { simplifyDebts, TransactionRule } from '../utils/debtSimplification';

describe('Debt Simplification Algorithm', () => {
  it('should simplify a simple circular debt', () => {
    const transactions: TransactionRule[] = [
      { from: 'A', to: 'B', amount: 10 },
      { from: 'B', to: 'C', amount: 10 },
      { from: 'C', to: 'A', amount: 10 },
    ];
    
    const result = simplifyDebts(transactions);
    expect(result).toHaveLength(0); // Everything cancels out
  });

  it('should consolidate multiple lines of debt', () => {
    const transactions: TransactionRule[] = [
      { from: 'A', to: 'B', amount: 50 },
      { from: 'B', to: 'C', amount: 30 },
      { from: 'A', to: 'C', amount: 20 },
    ];
    
    // Net: 
    // A: -70 (50 to B, 20 to C)
    // B: +20 (receives 50 from A, pays 30 to C)
    // C: +50 (receives 30 from B, 20 from A)
    // A owes 70 in total. C should receive 50, B should receive 20.
    
    const result = simplifyDebts(transactions);
    
    // Results should be A -> C (50) and A -> B (20)
    expect(result).toHaveLength(2);
    
    // A owes C 50 because C has highest credit (50), A has highest debt (70)
    expect(result).toContainEqual(expect.objectContaining({ from: 'A', to: 'C', amount: 50 }));
    // A owes remaining 20 to B
    expect(result).toContainEqual(expect.objectContaining({ from: 'A', to: 'B', amount: 20 }));
  });
});
