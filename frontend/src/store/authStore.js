import { create } from 'zustand';
import { clearAccessToken, getAccessToken, setAccessToken } from '../utils/session';
import { login as loginRequest, logout as logoutRequest, me as meRequest, register as registerRequest, refreshSession } from '../api/auth';

function extractToken(payload) {
  return payload?.accessToken || payload?.data?.accessToken || null;
}

function normalizeProfile(profile) {
  if (!profile) return null;
  return {
    id: profile.id || profile._id,
    email: profile.email,
    full_name: profile.full_name,
    role: profile.role,
    department: profile.department,
    metadata: profile.metadata || {}
  };
}

export const useAuthStore = create((set, get) => ({
  profile: null,
  token: getAccessToken(),
  status: 'loading',
  error: null,

  bootstrap: async () => {
    set({ status: 'loading', error: null });
    try {
      let token = getAccessToken();
      if (!token) {
        const refreshPayload = await refreshSession().catch(() => null);
        token = extractToken(refreshPayload);
        if (token) setAccessToken(token);
      }

      if (token) {
        const profile = normalizeProfile(await meRequest());
        set({ profile, token, status: 'ready', error: null });
        return profile;
      }

      set({ profile: null, token: null, status: 'guest', error: null });
      return null;
    } catch (error) {
      clearAccessToken();
      set({ profile: null, token: null, status: 'guest', error: error.message || 'Unable to authenticate' });
      return null;
    }
  },

  login: async credentials => {
    const payload = await loginRequest(credentials);
    const token = extractToken(payload);
    if (token) setAccessToken(token);
    const profile = normalizeProfile(await meRequest());
    set({ profile, token, status: 'ready', error: null });
    return profile;
  },

  register: async credentials => {
    const payload = await registerRequest(credentials);
    const token = extractToken(payload);
    if (token) setAccessToken(token);
    const profile = token ? normalizeProfile(await meRequest()) : null;
    set({ profile, token, status: token ? 'ready' : 'guest', error: null });
    return profile;
  },

  logout: async () => {
    await logoutRequest().catch(() => null);
    clearAccessToken();
    set({ profile: null, token: null, status: 'guest', error: null });
  },

  setProfile: profile => set({ profile: normalizeProfile(profile) }),
  setError: error => set({ error })
}));
