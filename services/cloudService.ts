
import { createClient } from '@supabase/supabase-js';
import { UserProfile } from './storageService';

// Note: These would typically come from your Supabase dashboard
// For this environment, we simulate the client with fallback logic
const SUPABASE_URL = (process.env as any).SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_KEY = (process.env as any).SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const SESSION_KEY = 'cs_visitor_id';

/**
 * Gets a persistent unique ID for the user to identify their cloud record.
 */
const getVisitorId = (): string => {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
};

/**
 * Pushes the profile to Supabase 'profiles' table.
 */
export const syncProfileToCloud = async (profile: UserProfile): Promise<boolean> => {
  const visitorId = getVisitorId();
  
  try {
    // We use 'upsert' to either update the existing record or create a new one
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: visitorId,
        name: profile.name,
        email: profile.email,
        target_role: profile.targetRole,
        bio: profile.bio,
        skills: profile.skills,
        has_resume: profile.hasResume,
        resume_name: profile.resumeName,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) throw error;
    console.log("Cloud Sync: Success");
    return true;
  } catch (err) {
    console.warn("Cloud Sync Failed (Database likely not set up yet):", err);
    return false;
  }
};

/**
 * Fetches the profile from Supabase.
 */
export const fetchProfileFromCloud = async (): Promise<UserProfile | null> => {
  const visitorId = getVisitorId();
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', visitorId)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      name: data.name,
      email: data.email,
      targetRole: data.target_role,
      location: 'Remote', // Standardized for now
      bio: data.bio,
      skills: data.skills,
      hasResume: data.has_resume,
      resumeName: data.resume_name
    };
  } catch (err) {
    console.warn("Cloud Fetch Failed (Using Local Fallback):", err);
    return null;
  }
};
