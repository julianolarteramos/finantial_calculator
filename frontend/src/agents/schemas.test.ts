import { describe, expect, it } from 'vitest';
import { debtInputSchema, profileInputSchema } from './schemas.ts';

describe('profileInputSchema', () => {
  it('validates a correct profile payload', () => {
    const result = profileInputSchema.safeParse({
      name: 'Alex',
      monthlyIncome: '5200',
      monthlyExpenses: '3100',
      riskProfile: 'moderate',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.monthlyIncome).toBe(5200);
      expect(result.data.monthlyExpenses).toBe(3100);
    }
  });

  it('rejects negative income', () => {
    const result = profileInputSchema.safeParse({
      name: 'Alex',
      monthlyIncome: '-1',
      monthlyExpenses: '0',
      riskProfile: 'moderate',
    });

    expect(result.success).toBe(false);
  });
});

describe('debtInputSchema', () => {
  it('requires positive months remaining', () => {
    const result = debtInputSchema.safeParse({
      loanName: 'Loan',
      originalAmount: '1000',
      currentBalance: '800',
      interestRateAnnual: '8',
      monthlyPayment: '120',
      insuranceCost: '15',
      monthsRemaining: '0',
    });

    expect(result.success).toBe(false);
  });

  it('normalizes number inputs', () => {
    const parsed = debtInputSchema.parse({
      loanName: 'Loan',
      originalAmount: '1000.50',
      currentBalance: '800.25',
      interestRateAnnual: '8.5',
      monthlyPayment: '120.75',
      insuranceCost: '15.25',
      monthsRemaining: '12',
    });

    expect(parsed.originalAmount).toBeCloseTo(1000.5);
    expect(parsed.monthsRemaining).toBe(12);
  });
});
