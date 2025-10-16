import { z } from 'zod';
import type { RiskProfile } from '../types/financial';

export const riskProfiles: RiskProfile[] = [
  'conservative',
  'moderate',
  'aggressive',
];

export const profileInputSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  monthlyIncome: z.coerce.number().min(0, 'Monthly income cannot be negative'),
  monthlyExpenses: z.coerce
    .number()
    .min(0, 'Monthly expenses cannot be negative'),
  riskProfile: z.enum(riskProfiles),
});

export type ProfileInput = z.infer<typeof profileInputSchema>;

export const debtInputSchema = z.object({
  loanName: z.string().min(1, 'Loan name is required'),
  originalAmount: z.coerce
    .number()
    .min(0, 'Original amount cannot be negative'),
  currentBalance: z.coerce
    .number()
    .min(0, 'Current balance cannot be negative'),
  interestRateAnnual: z.coerce
    .number()
    .min(0, 'Interest rate cannot be negative'),
  monthlyPayment: z.coerce
    .number()
    .positive('Monthly payment must be greater than zero'),
  insuranceCost: z.coerce
    .number()
    .min(0, 'Insurance cost cannot be negative'),
  monthsRemaining: z.coerce
    .number()
    .int('Months remaining must be an integer')
    .positive('Months remaining must be greater than zero'),
});

export type DebtInput = z.infer<typeof debtInputSchema>;
