import { useEffect } from 'react';
import { DebtSimulation } from './DebtSimulation';
import { useFinancialStore } from '../store/useFinancialStore';

export function DebtSimulationTabs() {
  const debts = useFinancialStore((state) => state.debts);
  const selectedDebtId = useFinancialStore((state) => state.selectedDebtId);
  const selectDebt = useFinancialStore((state) => state.selectDebt);

  useEffect(() => {
    if (debts.length > 0 && !selectedDebtId) {
      selectDebt(debts[0].id);
    }
  }, [debts, selectedDebtId, selectDebt]);

  if (debts.length === 0) {
    return (
      <section className="card simulation-card">
        <header className="card-header">
          <h2>Debt Simulations</h2>
          <p>Add a debt to generate amortization schedules.</p>
        </header>
        <div className="card-content">
          <p>No debts configured yet.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="card simulation-card">
      <header className="card-header">
        <h2>Debt Simulations</h2>
        <p>Compare payoff projections across your tracked loans.</p>
      </header>
      <div className="card-content simulation-tabs">
        <div className="tab-list" role="tablist" aria-label="Debt simulations">
          {debts.map((debt) => (
            <button
              type="button"
              key={debt.id}
              role="tab"
              aria-selected={selectedDebtId === debt.id}
              className={`tab-button ${
                selectedDebtId === debt.id ? 'active' : ''
              }`}
              onClick={() => selectDebt(debt.id)}
            >
              {debt.loanName}
            </button>
          ))}
        </div>
        <div className="tab-panel" role="tabpanel">
          <DebtSimulation variant="embedded" />
        </div>
      </div>
    </section>
  );
}
