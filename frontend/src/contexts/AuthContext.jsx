import React, { createContext, useContext, useEffect, useState } from 'react';
import supabase from '../api/supabaseClient';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data }) => {
      if (data?.session?.user) setUser(data.session.user);
      setLoading(false);
    });

    const { subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.access_token) fetchProfile(session.access_token);
      if (!session) {
        setProfile(null);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  async function fetchProfile(accessToken) {
    try {
      const res = await axios.get('/api/v1/auth/me', { headers: { Authorization: `Bearer ${accessToken}` } });
      setProfile(res.data.data);
    } catch (err) {
      console.warn('Failed to fetch backend profile', err?.response?.data || err.message);
    }
  }

  async function signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data?.session?.access_token) await fetchProfile(data.session.access_token);
    return data;
  }

  async function signUp({ email, password, full_name }) {
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name } } });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  const value = { user, profile, loading, signIn, signUp, signOut };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
