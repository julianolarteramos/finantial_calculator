import { profileInputSchema, type ProfileInput } from './schemas';
import { db } from './database';
import type { UserProfile } from '../types/financial';

const PROFILE_ID = 'current-profile';

export async function loadProfile(): Promise<UserProfile | null> {
  const profile = await db.profiles.get(PROFILE_ID);
  return profile ?? null;
}

export async function saveProfile(input: ProfileInput): Promise<UserProfile> {
  const parsed = profileInputSchema.parse(input);
  const profile: UserProfile = {
    id: PROFILE_ID,
    ...parsed,
    monthlyIncome: Number(parsed.monthlyIncome),
    monthlyExpenses: Number(parsed.monthlyExpenses),
    updatedAt: new Date().toISOString(),
  };
  await db.profiles.put(profile);
  return profile;
}
