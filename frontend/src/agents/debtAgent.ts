import { debtInputSchema, type DebtInput } from './schemas';
import { db } from './database';
import type {
  AmortizationRow,
  AmortizationSummary,
  Debt,
} from '../types/financial';

type DebtUpsertInput = DebtInput & { id?: string };

function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `debt-${Math.random().toString(36).slice(2, 11)}`;
}

export async function listDebts(): Promise<Debt[]> {
  return db.debts.toArray();
}

export async function saveDebt(input: DebtUpsertInput): Promise<Debt> {
  const parsed = debtInputSchema.parse(input);
  const id = input.id ?? generateId();
  const existing = input.id ? await db.debts.get(id) : null;

  const debt: Debt = {
    id,
    ...parsed,
    originalAmount: Number(parsed.originalAmount),
    currentBalance: Number(parsed.currentBalance),
    interestRateAnnual: Number(parsed.interestRateAnnual),
    monthlyPayment: Number(parsed.monthlyPayment),
    insuranceCost: Number(parsed.insuranceCost),
    monthsRemaining: Number(parsed.monthsRemaining),
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.debts.put(debt);
  return debt;
}

export async function removeDebt(id: string): Promise<void> {
  await db.debts.delete(id);
}

export interface AmortizationResult {
  schedule: AmortizationRow[];
  summary: AmortizationSummary;
}

export function calculateAmortization(debt: Debt): AmortizationResult {
  const monthlyRate = debt.interestRateAnnual / 100 / 12;
  const schedule: AmortizationRow[] = [];

  let balance = debt.currentBalance;
  let monthIndex = 0;
  let totalPrincipal = 0;
  let totalInterest = 0;
  let totalInsurance = 0;
  const maxIterations = Math.max(debt.monthsRemaining, 1) + 120;
  const paymentDate = new Date();

  while (
    balance > 0.01 &&
    monthIndex < maxIterations &&
    monthIndex < 1200
  ) {
    monthIndex += 1;
    if (monthIndex > 1) {
      paymentDate.setMonth(paymentDate.getMonth() + 1);
    }
    const interestPaid = monthlyRate > 0 ? balance * monthlyRate : 0;
    const insurancePaid = debt.insuranceCost;
    const totalPayment = debt.monthlyPayment;
    const principalPaidRaw = totalPayment - interestPaid - insurancePaid;
    const principalPaid =
      principalPaidRaw > balance ? balance : Math.max(principalPaidRaw, 0);

    if (principalPaid <= 0 && balance > 0.01 && monthlyRate > 0) {
      throw new Error(
        `Monthly payment ${totalPayment.toFixed(
          2,
        )} is too low to cover interest and insurance`,
      );
    }

    balance = Math.max(balance - principalPaid, 0);

    totalPrincipal += principalPaid;
    totalInterest += interestPaid;
    totalInsurance += insurancePaid;

    schedule.push({
      monthNumber: monthIndex,
      paymentDateISO: new Date(paymentDate).toISOString(),
      principalPaid: Number(principalPaid.toFixed(2)),
      interestPaid: Number(interestPaid.toFixed(2)),
      insurancePaid: Number(insurancePaid.toFixed(2)),
      totalPayment: Number(totalPayment.toFixed(2)),
      remainingBalance: Number(balance.toFixed(2)),
    });
  }

  const payoffDateISO =
    schedule.length > 0
      ? schedule[schedule.length - 1].paymentDateISO
      : new Date().toISOString();

  const summary: AmortizationSummary = {
    totalPrincipal: Number(totalPrincipal.toFixed(2)),
    totalInterest: Number(totalInterest.toFixed(2)),
    totalInsurance: Number(totalInsurance.toFixed(2)),
    totalPaid: Number((totalPrincipal + totalInterest + totalInsurance).toFixed(2)),
    months: schedule.length,
    payoffDateISO,
  };

  return { schedule, summary };
}
