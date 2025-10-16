import { describe, expect, it } from 'vitest';
import { calculateAmortization } from './debtAgent.ts';
import type { Debt } from '../types/financial';

const baseDebt: Debt = {
  id: 'test-debt',
  loanName: 'Sample Loan',
  originalAmount: 10000,
  currentBalance: 10000,
  interestRateAnnual: 12,
  monthlyPayment: 900,
  insuranceCost: 40,
  monthsRemaining: 18,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('calculateAmortization', () => {
  it('produces a schedule that fully amortizes the balance', () => {
    const result = calculateAmortization(baseDebt);

    const lastRow = result.schedule.at(-1);
    expect(lastRow?.remainingBalance ?? 1).toBeCloseTo(0, 2);
    expect(result.summary.totalPrincipal).toBeGreaterThan(0);
    expect(result.summary.totalPaid).toBeCloseTo(
      result.summary.totalPrincipal +
        result.summary.totalInterest +
        result.summary.totalInsurance,
      6,
    );

    const aggregated = result.schedule.reduce(
      (acc, row) => {
        acc.principal += row.principalPaid;
        acc.interest += row.interestPaid;
        acc.insurance += row.insurancePaid;
        acc.total += row.principalPaid + row.interestPaid + row.insurancePaid;
        return acc;
      },
      { principal: 0, interest: 0, insurance: 0, total: 0 },
    );

    expect(aggregated.principal).toBeCloseTo(
      result.summary.totalPrincipal,
      1,
    );
    expect(aggregated.interest).toBeCloseTo(result.summary.totalInterest, 1);
    expect(aggregated.insurance).toBeCloseTo(
      result.summary.totalInsurance,
      1,
    );
    expect(aggregated.total).toBeCloseTo(result.summary.totalPaid, 1);
  });

  it('throws when the fixed payment cannot cover interest and insurance', () => {
    const insufficientPayment: Debt = {
      ...baseDebt,
      id: 'insufficient',
      currentBalance: 5000,
      monthlyPayment: 20,
      insuranceCost: 20,
      interestRateAnnual: 24,
    };

    expect(() => calculateAmortization(insufficientPayment)).toThrow(
      /too low to cover interest/,
    );
  });
});
