
const STORAGE_KEY = 'career_strategist_user_data';

export interface UserProfile {
  name: string;
  email: string;
  targetRole: string;
  location: string;
  bio: string;
  skills: string;
  hasResume: boolean;
  resumeName: string;
  lastSynced?: string;
}

export const saveProfile = (profile: UserProfile): void => {
  const data = {
    ...profile,
    lastSynced: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const loadProfile = (): UserProfile | null => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch (e) {
    console.error("Failed to parse stored profile", e);
    return null;
  }
};

export const clearStoredData = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
