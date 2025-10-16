import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { useFinancialStore } from '../store/useFinancialStore';
import { profileInputSchema, riskProfiles } from '../agents/schemas';
import type { RiskProfile } from '../types/financial';

type ProfileFormState = {
  name: string;
  monthlyIncome: string;
  monthlyExpenses: string;
  riskProfile: RiskProfile;
};

const emptyForm: ProfileFormState = {
  name: '',
  monthlyIncome: '',
  monthlyExpenses: '',
  riskProfile: 'moderate',
};

export function ProfileForm() {
  const profile = useFinancialStore((state) => state.profile);
  const saveProfile = useFinancialStore((state) => state.saveProfile);
  const loading = useFinancialStore((state) => state.loading);
  const globalError = useFinancialStore((state) => state.error);

  const [formState, setFormState] = useState<ProfileFormState>(emptyForm);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFormState({
        name: profile.name,
        monthlyIncome: profile.monthlyIncome.toString(),
        monthlyExpenses: profile.monthlyExpenses.toString(),
        riskProfile: profile.riskProfile,
      });
    }
  }, [profile]);

  useEffect(() => {
    if (globalError) {
      setSuccessMessage(null);
    }
  }, [globalError]);

  const pending = loading;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const payload = {
      name: formState.name.trim(),
      monthlyIncome: formState.monthlyIncome,
      monthlyExpenses: formState.monthlyExpenses,
      riskProfile: formState.riskProfile,
    };

    const parsed = profileInputSchema.safeParse(payload);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Invalid input';
      setErrorMessage(firstError);
      return;
    }

    try {
      await saveProfile(parsed.data);
      setSuccessMessage('Profile saved');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to save profile',
      );
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit} noValidate>
      <header className="card-header">
        <h2>Profile</h2>
        <p>Keep the investor context up to date to tailor insights.</p>
      </header>
      <div className="grid">
        <label>
          <span>Name</span>
          <input
            type="text"
            name="name"
            value={formState.name}
            onChange={(event) =>
              setFormState((prev) => ({
                ...prev,
                name: event.target.value,
              }))
            }
            placeholder="Jane Doe"
            required
          />
        </label>
        <label>
          <span>Monthly Income</span>
          <input
            type="number"
            name="monthlyIncome"
            value={formState.monthlyIncome}
            onChange={(event) =>
              setFormState((prev) => ({
                ...prev,
                monthlyIncome: event.target.value,
              }))
            }
            placeholder="5000"
            min={0}
            step="0.01"
            required
          />
        </label>
        <label>
          <span>Monthly Expenses</span>
          <input
            type="number"
            name="monthlyExpenses"
            value={formState.monthlyExpenses}
            onChange={(event) =>
              setFormState((prev) => ({
                ...prev,
                monthlyExpenses: event.target.value,
              }))
            }
            placeholder="3200"
            min={0}
            step="0.01"
            required
          />
        </label>
        <label>
          <span>Risk Profile</span>
          <select
            name="riskProfile"
            value={formState.riskProfile}
            onChange={(event) =>
              setFormState((prev) => ({
                ...prev,
                riskProfile: event.target.value as RiskProfile,
              }))
            }
          >
            {riskProfiles.map((risk) => (
              <option value={risk} key={risk}>
                {risk.charAt(0).toUpperCase() + risk.slice(1)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <footer className="card-footer">
        <button type="submit" disabled={pending}>
          {pending ? 'Saving…' : 'Save Profile'}
        </button>
        {errorMessage && <p className="error">{errorMessage}</p>}
        {!errorMessage && successMessage && (
          <p className="success">{successMessage}</p>
        )}
      </footer>
    </form>
  );
}
