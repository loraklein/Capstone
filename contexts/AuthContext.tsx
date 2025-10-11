import React, { createContext, useState, useContext, useEffect } from 'react';
import { createClient, Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase configuration
const SUPABASE_URL = 'https://bhoodtyyzsywvbxoanjg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJob29kdHl5enN5d3ZieG9hbmpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMTg5MTksImV4cCI6MjA3Mzg5NDkxOX0.OPlD0zT9gadb4kZdnxwjUKVwp453REggwYt-Emk2rzY';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load session from storage on mount
    loadSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session) {
        saveSession(session);
      } else {
        clearSession();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadSession = async () => {
    try {
      const sessionStr = await AsyncStorage.getItem('supabase_session');
      if (sessionStr) {
        const savedSession = JSON.parse(sessionStr);
        const { data, error } = await supabase.auth.setSession({
          access_token: savedSession.access_token,
          refresh_token: savedSession.refresh_token,
        });
        if (!error && data.session) {
          setSession(data.session);
          setUser(data.session.user);
        }
      }
    } catch (error) {
      console.error('Error loading session:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSession = async (session: Session) => {
    try {
      await AsyncStorage.setItem('supabase_session', JSON.stringify(session));
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const clearSession = async () => {
    try {
      await AsyncStorage.removeItem('supabase_session');
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      // Call Supabase Auth directly (CORRECT way - supports OAuth, etc.)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      // Database trigger automatically creates user profile
      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        await saveSession(data.session);
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Call Supabase Auth directly (CORRECT way)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        await saveSession(data.session);
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    await clearSession();
  };

  const getAccessToken = () => {
    return session?.access_token ?? null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        getAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { supabase };

