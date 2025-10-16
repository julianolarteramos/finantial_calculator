import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { ProfileForm } from './components/ProfileForm';
import { DebtSettings } from './components/DebtSettings';
import { DebtSimulationTabs } from './components/DebtSimulationTabs';
import { useFinancialStore } from './store/useFinancialStore';

type ViewKey = 'profile' | 'addDebt' | 'debts';

function App() {
  const init = useFinancialStore((state) => state.init);
  const initialized = useFinancialStore((state) => state.initialized);
  const loading = useFinancialStore((state) => state.loading);
  const error = useFinancialStore((state) => state.error);
  const debts = useFinancialStore((state) => state.debts);
  const selectDebt = useFinancialStore((state) => state.selectDebt);
  const selectedDebtId = useFinancialStore((state) => state.selectedDebtId);

  const [activeView, setActiveView] = useState<ViewKey>('profile');

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (debts.length > 0 && !selectedDebtId) {
      selectDebt(debts[0].id);
    }
  }, [debts, selectedDebtId, selectDebt]);

  const menuItems = useMemo(
    () =>
      [
        { id: 'profile', label: 'Profile' },
        { id: 'addDebt', label: 'Add Debt' },
        {
          id: 'debts',
          label: 'Debts',
          disabled: debts.length === 0,
        },
      ] as Array<{ id: ViewKey; label: string; disabled?: boolean }>,
    [debts.length],
  );

  const viewContent = useMemo(() => {
    switch (activeView) {
      case 'profile':
        return <ProfileForm />;
      case 'addDebt':
        return <DebtSettings mode="create" />;
      case 'debts':
        return (
          <div className="debts-view">
            <DebtSettings mode="manage" />
            <DebtSimulationTabs />
          </div>
        );
      default:
        return null;
    }
  }, [activeView, debts.length]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>Financial Advisor Agents</h1>
          <p>
            Profile clients, capture debts, and generate payoff simulations that stay
            in sync with browser storage.
          </p>
        </div>
        <div className="status">
          {loading && <span className="info">Working…</span>}
          {!loading && initialized && <span className="success">Ready</span>}
          {error && <span className="error">{error}</span>}
        </div>
      </header>
      <div className="app-body">
        <nav className="sidebar" aria-label="Primary navigation">
          {menuItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-button ${activeView === item.id ? 'active' : ''}`}
              onClick={() => setActiveView(item.id)}
              disabled={item.disabled}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <main className="app-main">{viewContent}</main>
      </div>
    </div>
  );
}

export default App;
