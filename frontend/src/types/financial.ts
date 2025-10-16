export type RiskProfile = 'conservative' | 'moderate' | 'aggressive';

export interface UserProfile {
  id: string;
  name: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  riskProfile: RiskProfile;
  updatedAt: string;
}

export interface Debt {
  id: string;
  loanName: string;
  originalAmount: number;
  currentBalance: number;
  interestRateAnnual: number;
  monthlyPayment: number;
  insuranceCost: number;
  monthsRemaining: number;
  createdAt: string;
  updatedAt: string;
}

export interface AmortizationRow {
  monthNumber: number;
  paymentDateISO: string;
  principalPaid: number;
  interestPaid: number;
  insurancePaid: number;
  totalPayment: number;
  remainingBalance: number;
}

export interface AmortizationSummary {
  totalPrincipal: number;
  totalInterest: number;
  totalInsurance: number;
  totalPaid: number;
  months: number;
  payoffDateISO: string;
}
