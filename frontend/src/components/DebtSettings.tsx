import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { debtInputSchema } from '../agents/schemas';
import type { Debt } from '../types/financial';
import { useFinancialStore } from '../store/useFinancialStore';

const emptyDebtForm = {
  loanName: '',
  originalAmount: '',
  currentBalance: '',
  interestRateAnnual: '',
  monthlyPayment: '',
  insuranceCost: '',
  monthsRemaining: '',
};

type DebtFormState = typeof emptyDebtForm;

type DebtSettingsMode = 'create' | 'manage';

type DebtSettingsProps = {
  mode?: DebtSettingsMode;
};

export function DebtSettings({ mode = 'manage' }: DebtSettingsProps) {
  const isManageMode = mode === 'manage';
  const debts = useFinancialStore((state) => state.debts);
  const simulations = useFinancialStore((state) => state.simulations);
  const selectedDebtId = useFinancialStore((state) => state.selectedDebtId);
  const saveDebt = useFinancialStore((state) => state.saveDebt);
  const deleteDebt = useFinancialStore((state) => state.deleteDebt);
  const selectDebt = useFinancialStore((state) => state.selectDebt);
  const loading = useFinancialStore((state) => state.loading);

  const [formState, setFormState] = useState<DebtFormState>(emptyDebtForm);
  const [editingDebtId, setEditingDebtId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<boolean>(false);

  const pending = loading;

  useEffect(() => {
    if (!isManageMode) {
      setFormState(emptyDebtForm);
      setEditingDebtId(null);
      setErrorMessage(null);
      setSuccessMessage(null);
      setCollapsed(false);
    }
  }, [isManageMode]);

  const toggleCollapsed = () => {
    setCollapsed((prev) => !prev);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isManageMode && !editingDebtId) {
      return;
    }
    setErrorMessage(null);
    setSuccessMessage(null);

    const payload = {
      loanName: formState.loanName.trim(),
      originalAmount: formState.originalAmount,
      currentBalance: formState.currentBalance,
      interestRateAnnual: formState.interestRateAnnual,
      monthlyPayment: formState.monthlyPayment,
      insuranceCost: formState.insuranceCost,
      monthsRemaining: formState.monthsRemaining,
    };

    const parsed = debtInputSchema.safeParse(payload);
    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message ?? 'Invalid debt input';
      setErrorMessage(first);
      return;
    }

    try {
      await saveDebt({ ...parsed.data, id: editingDebtId ?? undefined });
      setSuccessMessage(
        isManageMode && editingDebtId ? 'Debt updated' : 'Debt added',
      );
      setFormState(emptyDebtForm);
      setEditingDebtId(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to save debt',
      );
    }
  };

  const handleEdit = (debt: Debt) => {
    if (!isManageMode) {
      return;
    }
    setCollapsed(false);
    setFormState({
      loanName: debt.loanName,
      originalAmount: debt.originalAmount.toString(),
      currentBalance: debt.currentBalance.toString(),
      interestRateAnnual: debt.interestRateAnnual.toString(),
      monthlyPayment: debt.monthlyPayment.toString(),
      insuranceCost: debt.insuranceCost.toString(),
      monthsRemaining: debt.monthsRemaining.toString(),
    });
    setEditingDebtId(debt.id);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleDelete = async (id: string) => {
    if (!isManageMode) {
      return;
    }
    const confirmDelete = window.confirm(
      'Delete this debt configuration and its stored simulation?',
    );
    if (!confirmDelete) {
      return;
    }
    try {
      await deleteDebt(id);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to delete debt',
      );
    }
  };

  const resetForm = () => {
    setFormState(emptyDebtForm);
    setEditingDebtId(null);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  return (
    <section className="card">
      <header className="card-header">
        <div className="card-header-text">
          <h2>{isManageMode ? 'Manage Debts' : 'Add New Debt'}</h2>
          <p>
            {isManageMode
              ? 'Review stored loans, update assumptions, or delete entries.'
              : 'Capture fixed-rate loan details to generate payoff projections.'}
          </p>
        </div>
        {isManageMode && (
          <button
            type="button"
            className="link collapse-toggle"
            onClick={toggleCollapsed}
            aria-expanded={!collapsed}
          >
            {collapsed ? 'Expand' : 'Collapse'}
          </button>
        )}
      </header>
      {collapsed ? (
        <div className="card-content">
          <p className="muted">Panel collapsed. Expand to edit or review debts.</p>
        </div>
      ) : (
        <div className="card-content">
          {isManageMode && !editingDebtId ? (
            <p className="muted">Select a debt from the list to enable editing.</p>
          ) : (
            <form onSubmit={handleSubmit} className="grid" noValidate>
              <label>
                <span>Loan Name</span>
                <input
                  type="text"
                  name="loanName"
                  value={formState.loanName}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      loanName: event.target.value,
                    }))
                  }
                  placeholder="Mortgage"
                  required
                  disabled={isManageMode && !editingDebtId}
                />
              </label>
              <label>
                <span>Original Amount</span>
                <input
                  type="number"
                  name="originalAmount"
                  value={formState.originalAmount}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      originalAmount: event.target.value,
                    }))
                  }
                  placeholder="200000"
                  min={0}
                  step="0.01"
                  required
                  disabled={isManageMode && !editingDebtId}
                />
              </label>
              <label>
                <span>Current Balance</span>
                <input
                  type="number"
                  name="currentBalance"
                  value={formState.currentBalance}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      currentBalance: event.target.value,
                    }))
                  }
                  placeholder="150000"
                  min={0}
                  step="0.01"
                  required
                  disabled={isManageMode && !editingDebtId}
                />
              </label>
              <label>
                <span>Interest Rate EA (%)</span>
                <input
                  type="number"
                  name="interestRateAnnual"
                  value={formState.interestRateAnnual}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      interestRateAnnual: event.target.value,
                    }))
                  }
                  placeholder="11.5"
                  min={0}
                  step="0.01"
                  required
                  disabled={isManageMode && !editingDebtId}
                />
              </label>
              <label>
                <span>Monthly Payment (incl. capital)</span>
                <input
                  type="number"
                  name="monthlyPayment"
                  value={formState.monthlyPayment}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      monthlyPayment: event.target.value,
                    }))
                  }
                  placeholder="1800"
                  min={0}
                  step="0.01"
                  required
                  disabled={isManageMode && !editingDebtId}
                />
              </label>
              <label>
                <span>Insurance Cost</span>
                <input
                  type="number"
                  name="insuranceCost"
                  value={formState.insuranceCost}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      insuranceCost: event.target.value,
                    }))
                  }
                  placeholder="50"
                  min={0}
                  step="0.01"
                  required
                  disabled={isManageMode && !editingDebtId}
                />
              </label>
              <label>
                <span>Months Remaining</span>
                <input
                  type="number"
                  name="monthsRemaining"
                  value={formState.monthsRemaining}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      monthsRemaining: event.target.value,
                    }))
                  }
                  placeholder="240"
                  min={1}
                  step={1}
                  required
                  disabled={isManageMode && !editingDebtId}
                />
              </label>
              <div className="form-actions">
                <button
                  type="submit"
                  disabled={pending || (isManageMode && !editingDebtId)}
                >
                  {isManageMode && editingDebtId
                    ? pending
                      ? 'Updating…'
                      : 'Update Debt'
                    : pending
                      ? 'Saving…'
                      : 'Add Debt'}
                </button>
                {isManageMode && editingDebtId && (
                  <button
                    type="button"
                    className="link"
                    onClick={resetForm}
                    disabled={pending}
                  >
                    Cancel edit
                  </button>
                )}
              </div>
            </form>
          )}
          {errorMessage && <p className="error">{errorMessage}</p>}
          {!errorMessage && successMessage && (
            <p className="success">{successMessage}</p>
          )}
        </div>
      )}
      {isManageMode ? (
        !collapsed && (
          <div className="card-footer vertical-gap">
            <h3>Tracked Debts</h3>
            {debts.length === 0 ? (
              <p>No debts configured yet.</p>
            ) : (
              <ul className="debt-list">
                {debts.map((debt) => {
                  const simulation = simulations[debt.id];
                  const isSelected = selectedDebtId === debt.id;
                  return (
                    <li key={debt.id}>
                      <div>
                        <strong>{debt.loanName}</strong>
                        <p>
                          Balance ${debt.currentBalance.toLocaleString()} · Rate{' '}
                          {debt.interestRateAnnual}% · Payment $
                          {debt.monthlyPayment.toLocaleString()}
                        </p>
                        {simulation && (
                          <p className="muted">
                            Payoff in {simulation.summary.months} months · Total paid $
                            {simulation.summary.totalPaid.toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="debt-actions">
                        <button
                          type="button"
                          className={isSelected ? 'secondary' : ''}
                          onClick={() => selectDebt(debt.id)}
                        >
                          {isSelected ? 'Viewing' : 'View Simulation'}
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => handleEdit(debt)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="danger"
                          onClick={() => handleDelete(debt.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )
      ) : (
        <footer className="card-footer">
          <p className="muted">
            Need to review or simulate a stored debt? Visit the Debts view in the sidebar.
          </p>
        </footer>
      )}
    </section>
  );
}
