import { useMemo } from 'react';
import { useFinancialStore } from '../store/useFinancialStore';

const currency = (value: number) =>
  value.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
  });

const percent = new Intl.NumberFormat(undefined, {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});

type DebtSimulationVariant = 'card' | 'embedded';

type DebtSimulationProps = {
  variant?: DebtSimulationVariant;
};

export function DebtSimulation({ variant = 'card' }: DebtSimulationProps) {
  const debts = useFinancialStore((state) => state.debts);
  const selectedDebtId = useFinancialStore((state) => state.selectedDebtId);
  const simulations = useFinancialStore((state) => state.simulations);

  const selectedDebt = useMemo(
    () => debts.find((debt) => debt.id === selectedDebtId) ?? null,
    [debts, selectedDebtId],
  );

  const simulation = selectedDebt
    ? simulations[selectedDebt.id]
    : undefined;

  const rateEquivalences = useMemo(() => {
    if (!selectedDebt) {
      return null;
    }
    const effectiveAnnual = selectedDebt.interestRateAnnual / 100;
    const effectiveMonthly = Math.pow(1 + effectiveAnnual, 1 / 12) - 1;
    const nominalAnnual = effectiveMonthly * 12;
    const nominalMonthly = nominalAnnual / 12;
    return {
      effectiveAnnual,
      effectiveMonthly,
      nominalAnnual,
      nominalMonthly,
    };
  }, [selectedDebt]);

  const Wrapper = variant === 'card' ? 'section' : 'div';
  const wrapperClassName =
    variant === 'card' ? 'card simulation-card' : 'simulation-body';

  if (!selectedDebt || !simulation) {
    return (
      <Wrapper className={wrapperClassName}>
        {variant === 'card' && (
          <header className="card-header">
            <h2>Debt Simulation</h2>
            <p>Select a debt to review the amortization details.</p>
          </header>
        )}
        <p>No debt selected.</p>
      </Wrapper>
    );
  }

  const summaryContent = (
    <>
      {rateEquivalences && (
        <ul className="rate-equivalences">
          <li>
            <strong>EA:</strong>{' '}
            <span>{percent.format(rateEquivalences.effectiveAnnual)}</span>
          </li>
          <li>
            <strong>EM:</strong>{' '}
            <span>{percent.format(rateEquivalences.effectiveMonthly)}</span>
          </li>
          <li>
            <strong>NA:</strong>{' '}
            <span>{percent.format(rateEquivalences.nominalAnnual)}</span>
          </li>
          <li>
            <strong>NM:</strong>{' '}
            <span>{percent.format(rateEquivalences.nominalMonthly)}</span>
          </li>
        </ul>
      )}
      <div className="metrics-grid">
        <div>
          <span className="metric-label">Months to Payoff</span>
          <strong className="metric-value">
            {simulation.summary.months.toLocaleString()}
          </strong>
        </div>
        <div>
          <span className="metric-label">Payoff Date</span>
          <strong className="metric-value">
            {new Date(simulation.summary.payoffDateISO).toLocaleDateString()}
          </strong>
        </div>
        <div>
          <span className="metric-label">Total Principal</span>
          <strong className="metric-value">
            {currency(simulation.summary.totalPrincipal)}
          </strong>
        </div>
        <div>
          <span className="metric-label">Total Interest</span>
          <strong className="metric-value">
            {currency(simulation.summary.totalInterest)}
          </strong>
        </div>
        <div>
          <span className="metric-label">Total Insurance</span>
          <strong className="metric-value">
            {currency(simulation.summary.totalInsurance)}
          </strong>
        </div>
        <div>
          <span className="metric-label">Total Paid</span>
          <strong className="metric-value">
            {currency(simulation.summary.totalPaid)}
          </strong>
        </div>
      </div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Payment #</th>
              <th>Date</th>
              <th>Principal</th>
              <th>Interest</th>
              <th>Insurance</th>
              <th>Total Cuota</th>
              <th>Saldo</th>
            </tr>
          </thead>
          <tbody>
            {simulation.schedule.map((row) => (
              <tr key={row.monthNumber}>
                <td>{row.monthNumber}</td>
                <td>
                  {new Date(row.paymentDateISO).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                  })}
                </td>
                <td>{currency(row.principalPaid)}</td>
                <td>{currency(row.interestPaid)}</td>
                <td>{currency(row.insurancePaid)}</td>
                <td>{currency(row.totalPayment)}</td>
                <td>{currency(row.remainingBalance)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th colSpan={2}>Totals</th>
              <th>{currency(simulation.summary.totalPrincipal)}</th>
              <th>{currency(simulation.summary.totalInterest)}</th>
              <th>{currency(simulation.summary.totalInsurance)}</th>
              <th>{currency(simulation.summary.totalPaid)}</th>
              <th>{currency(0)}</th>
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  );

  return (
    <Wrapper className={wrapperClassName}>
      {variant === 'card' && (
        <header className="card-header">
          <h2>Debt Simulation</h2>
          <p>
            Fixed payment schedule for <strong>{selectedDebt.loanName}</strong>
          </p>
        </header>
      )}
      <div
        className={
          variant === 'card'
            ? 'card-content simulation-content'
            : 'simulation-content'
        }
      >
        {summaryContent}
      </div>
    </Wrapper>
  );
}
