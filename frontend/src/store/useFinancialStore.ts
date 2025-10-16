import { create } from 'zustand';
import type { Debt, UserProfile } from '../types/financial';
import type { ProfileInput, DebtInput } from '../agents/schemas';
import {
  loadProfile as loadProfileAgent,
  saveProfile as saveProfileAgent,
} from '../agents/profileAgent';
import {
  listDebts,
  saveDebt as saveDebtAgent,
  removeDebt as removeDebtAgent,
  calculateAmortization,
  type AmortizationResult,
} from '../agents/debtAgent';

interface FinancialState {
  initialized: boolean;
  loading: boolean;
  error: string | null;
  profile: UserProfile | null;
  debts: Debt[];
  simulations: Record<string, AmortizationResult>;
  selectedDebtId: string | null;
  init: () => Promise<void>;
  saveProfile: (input: ProfileInput) => Promise<void>;
  saveDebt: (input: DebtInput & { id?: string }) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
  selectDebt: (id: string | null) => void;
}

const computeSimulations = (debts: Debt[]): Record<string, AmortizationResult> =>
  debts.reduce<Record<string, AmortizationResult>>((acc, debt) => {
    acc[debt.id] = calculateAmortization(debt);
    return acc;
  }, {});

export const useFinancialStore = create<FinancialState>((set, get) => ({
  initialized: false,
  loading: false,
  error: null,
  profile: null,
  debts: [],
  simulations: {},
  selectedDebtId: null,
  init: async () => {
    if (get().loading) {
      return;
    }
    set({ loading: true, error: null });
    try {
      const [profile, debts] = await Promise.all([
        loadProfileAgent(),
        listDebts(),
      ]);
      const simulations = computeSimulations(debts);
      set({
        profile,
        debts,
        simulations,
        selectedDebtId: debts[0]?.id ?? null,
        loading: false,
        initialized: true,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to initialize',
        loading: false,
      });
    }
  },
  saveProfile: async (input) => {
    set({ loading: true, error: null });
    try {
      const profile = await saveProfileAgent(input);
      set({ profile, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to save profile',
        loading: false,
      });
      throw error;
    }
  },
  saveDebt: async (input) => {
    set({ loading: true, error: null });
    try {
      const saved = await saveDebtAgent(input);
      const debts = await listDebts();
      const simulations = computeSimulations(debts);
      const selectedDebtId =
        get().selectedDebtId && debts.some((d) => d.id === get().selectedDebtId)
          ? get().selectedDebtId
          : saved.id;
      set({
        debts,
        simulations,
        selectedDebtId,
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to save debt',
        loading: false,
      });
      throw error;
    }
  },
  deleteDebt: async (id) => {
    set({ loading: true, error: null });
    try {
      await removeDebtAgent(id);
      const debts = await listDebts();
      const simulations = computeSimulations(debts);
      const selectedDebtId =
        get().selectedDebtId === id ? debts[0]?.id ?? null : get().selectedDebtId;
      set({
        debts,
        simulations,
        selectedDebtId,
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete debt',
        loading: false,
      });
      throw error;
    }
  },
  selectDebt: (id) => {
    set({ selectedDebtId: id });
  },
}));
