import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { Debt, UserProfile } from '../types/financial';

export class FinancialDB extends Dexie {
  profiles!: Table<UserProfile, string>;
  debts!: Table<Debt, string>;

  constructor() {
    super('financialAdvisorDB');
    this.version(1).stores({
      profiles: '&id',
      debts: '&id, loanName',
    });
  }
}

export const db = new FinancialDB();
