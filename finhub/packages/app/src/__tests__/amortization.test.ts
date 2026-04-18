import { calculatePriceTable, calculateSACTable } from '../utils/amortization';

describe('Amortization Calculators', () => {
  describe('Price Table', () => {
    it('should calculate fixed installments correctly', () => {
      // 1000 principal, 12% annual (1% monthly), 3 months
      const result = calculatePriceTable(1000, 0.12, 3);
      
      expect(result).toHaveLength(3);
      // Installment = 1000 * (0.01 * 1.01^3) / (1.01^3 - 1) = 340.02
      expect(result[0].payment).toBeCloseTo(340.02, 1);
      expect(result[1].payment).toBeCloseTo(340.02, 1);
      expect(result[2].payment).toBeCloseTo(340.02, 1);
      
      // The last balance should be 0
      expect(result[2].balance).toBe(0);
    });
  });

  describe('SAC Table', () => {
    it('should calculate constant principal amortization correctly', () => {
      // 1000 principal, 12% annual (1% monthly), 4 months
      // Principal per month = 250
      const result = calculateSACTable(1000, 0.12, 4);
      
      expect(result).toHaveLength(4);
      
      // Amortized principal should stay fixed at 250
      expect(result[0].principal).toBe(250);
      expect(result[1].principal).toBe(250);
      expect(result[2].principal).toBe(250);
      expect(result[3].principal).toBe(250);

      // Period 1 interest = 1000 * 0.01 = 10 => payment = 260
      // Period 2 interest = 750 * 0.01 = 7.5 => payment = 257.5
      // Period 3 interest = 500 * 0.01 = 5 => payment = 255
      // Period 4 interest = 250 * 0.01 = 2.5 => payment = 252.5
      
      expect(result[0].payment).toBe(260);
      expect(result[1].payment).toBe(257.5);
      expect(result[2].payment).toBe(255);
      expect(result[3].payment).toBe(252.5);
      
      // The last balance should be 0
      expect(result[3].balance).toBe(0);
    });
  });
});
