import { supabase } from '@/integrations/supabase/client';

export interface User {
  id: string;
  nickname: string;
  email: string; // Add email to User interface
  role: 'user' | 'vip' | 'moderator' | 'admin';
  is_banned: boolean;
  created_at: string;
  avatar_url?: string; // Add avatar_url
  phone?: string; // Add phone
  location?: string; // Add location
  bio?: string; // Add bio
  vip_expires_at?: string; // Add vip_expires_at
}

// Set user context for RLS via RPC
export const setUserContext = async (userId: string | null) => {
  try {
    console.log('Attempting to set RLS user context for userId:', userId);
    const { error } = await supabase.rpc('set_app_user', { user_id: userId });
    if (error) {
      console.error('Failed to set user context RPC error:', error);
      throw new Error('Failed to set user context for RLS.');
    }
    console.log('RLS user context set successfully for userId:', userId);
  } catch (e) {
    console.error('Error calling set_app_user RPC:', e);
    throw e;
  }
};

// Register user with Supabase Auth and create profile
export const registerUser = async (nickname: string, email: string, password: string) => {
  try {
    // Check if nickname already exists in our users table
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('nickname', nickname)
      .single();

    if (profileCheckError && profileCheckError.code !== 'PGRST116') { // PGRST116 means "no rows found"
      throw profileCheckError;
    }
    if (existingProfile) {
      throw new Error('Користувач з таким нікнеймом вже існує');
    }

    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nickname, // Pass nickname to auth.users metadata
        },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Supabase Auth user not returned after signup.');

    // Create user profile in our public.users table
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          nickname,
          email,
          role: 'user',
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (profileError) throw profileError;

    await setUserContext(profile.id);
    return { user: profile as User, error: null };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Невідома помилка реєстрації';
    return { user: null, error: message };
  }
};

// Login user with Supabase Auth
export const loginUser = async (identifier: string, password: string) => {
  try {
    let email = identifier;

    // If identifier is not an email, try to find user by nickname to get email
    if (!identifier.includes('@')) {
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('email, is_banned')
        .eq('nickname', identifier)
        .single();

      if (profileError) throw new Error('Користувача не знайдено');
      if (profileData.is_banned) throw new Error('Ваш акаунт заблоковано');
      if (!profileData.email) throw new Error('Email не знайдено для цього користувача');
      email = profileData.email;
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Supabase Auth user not returned after signin.');

    // Fetch full user profile from public.users
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) throw profileError;
    if (profile.is_banned) throw new Error('Ваш акаунт заблоковано');

    await setUserContext(profile.id);
    return { user: profile as User, error: null };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Невідома помилка авторизації';
    return { user: null, error: message };
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    await setUserContext(null); // Clear RLS context
    return { error: null };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Невідома помилка виходу';
    return { error: message };
  }
};

// Get current user from Supabase Auth and fetch profile
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!authUser) return null;

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profileError) throw profileError;
    return profile as User;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Check if user has permission
export const hasPermission = (user: User | null, requiredRoles: string[]): boolean => {
  if (!user || user.is_banned) return false;
  return requiredRoles.includes(user.role);
};

// Initialize user context on app start or user change
export const initializeUserContext = async () => {
  const user = await getCurrentUser();
  if (user) {
    await setUserContext(user.id);
  } else {
    await setUserContext(null); // Clear context if no user
  }
};

// Admin functions (assuming RLS allows admins to perform these actions)
export const updateUserRole = async (userId: string, role: User['role']) => {
  const { data, error } = await supabase.from('users').update({ role }).eq('id', userId).select().single();
  return { data, error };
};

export const banUser = async (userId: string, banned: boolean) => {
  const { data, error } = await supabase.from('users').update({ is_banned: banned }).eq('id', userId).select().single();
  return { data, error };
};

export const giveVipStatus = async (userId: string, days = 30) => {
  const vipExpiresAt = new Date();
  vipExpiresAt.setDate(vipExpiresAt.getDate() + days);

  const { data, error } = await supabase
    .from('users')
    .update({
      role: 'vip',
      vip_expires_at: vipExpiresAt.toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
};