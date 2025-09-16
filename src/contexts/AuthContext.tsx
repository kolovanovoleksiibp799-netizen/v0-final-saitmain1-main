import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { User, initializeUserContext as libInitializeUserContext, logoutUser as libLogoutUser } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

type SupabaseAuthUser = Session['user'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void; // Add setUser to context
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async (authUser: SupabaseAuthUser | null) => {
    if (!authUser) {
      setUser(null);
      return;
    }
    try {
      const { data: profile, error } = await supabase.from('users').select('*').eq('id', authUser.id).single();
      if (error || !profile) {
        console.error('Error fetching user profile:', error);
        setUser(null);
        return;
      }

      setUser(profile as User);
    } catch (error: unknown) {
      console.error('Error fetching user profile:', error);
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    await fetchUserProfile(authUser);
  }, [fetchUserProfile]);

  const signOut = useCallback(async () => {
    await libLogoutUser(); // Use the refactored logoutUser
    setUser(null);
    setSession(null);
  }, []);

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      await fetchUserProfile(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
      setSession(session);
      await fetchUserProfile(session?.user ?? null);
      setLoading(false);
      // Also update RLS context on auth state change
      await libInitializeUserContext();
    });

    return () => subscription.unsubscribe();
  }, [fetchUserProfile]);

  // Ensure RLS context is set/cleared when user object changes
  useEffect(() => {
    libInitializeUserContext();
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};