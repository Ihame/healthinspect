import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  supabaseUser: SupabaseUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (authError) {
        throw new Error(authError.message);
      }
      
      if (data.user) {
        // Try to get user profile from database by ID first
        let { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();
          
        // If not found by ID, try to find by email
        if (profileError || !userProfile) {
          const { data: emailProfile, error: emailError } = await supabase
            .from('users')
            .select('*')
            .eq('email', data.user.email)
            .maybeSingle();
            
          if (emailError || !emailProfile) {
            throw new Error('User profile not found. Please contact administrator.');
          }
          
          userProfile = emailProfile;
          
          // Update the user record with the correct auth ID
          await supabase
            .from('users')
            .update({ id: data.user.id })
            .eq('email', data.user.email);
        }
        
        if (!userProfile.is_active) {
          throw new Error('Your account has been suspended. Please contact administrator.');
        }
        
        setCurrentUser({
          id: userProfile.id,
          email: userProfile.email,
          phone: userProfile.phone || undefined,
          name: userProfile.name,
          role: userProfile.role,
          district: userProfile.district || undefined,
          createdAt: new Date(userProfile.created_at),
          isActive: userProfile.is_active,
        });
        
        setSupabaseUser(data.user);
      }
    } catch (err) {
      console.error('Login failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await supabase.auth.signOut();
      setCurrentUser(null);
      setSupabaseUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      setError('Logout failed');
    }
  };

  useEffect(() => {
    // Check for existing session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data: userProfile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
            
          if (userProfile && userProfile.is_active) {
            setCurrentUser({
              id: userProfile.id,
              email: userProfile.email,
              phone: userProfile.phone || undefined,
              name: userProfile.name,
              role: userProfile.role,
              district: userProfile.district || undefined,
              createdAt: new Date(userProfile.created_at),
              isActive: userProfile.is_active,
            });
            setSupabaseUser(session.user);
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setCurrentUser(null);
          setSupabaseUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    currentUser,
    supabaseUser,
    login,
    logout,
    loading,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};