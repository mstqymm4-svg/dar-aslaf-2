import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import { tokenStore } from '@/lib/api/config';
import { authApi } from '@/lib/api/authApi';
import { getAccountEmail } from '@/lib/activeUser';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

// Create raw Base44 client
const rawBase44 = createClient({
  appId: appId || 'dar-al-uloom-standalone',
  token,
  functionsVersion,
  serverUrl: '',
  requiresAuth: false,
  appBaseUrl
});

// Bulletproof wrapper for standalone & independent environments
export const base44 = {
  ...rawBase44,
  auth: {
    ...rawBase44.auth,
    me: async () => {
      if (tokenStore.access) {
        try {
          const u = await authApi.me();
          if (u) return { ...u, full_name: u.fullName || u.email?.split('@')[0] };
        } catch {}
      }
      const em = getAccountEmail();
      if (em) return { email: em, full_name: em.split('@')[0], role: 'USER' };
      try {
        return await rawBase44.auth.me();
      } catch {
        return null;
      }
    },
    updateMe: async (data) => {
      try {
        return await rawBase44.auth.updateMe(data);
      } catch {
        return data;
      }
    },
    logout: (redirectUrl = '/') => {
      tokenStore.clear();
      try { rawBase44.auth.logout(redirectUrl); } catch {}
      window.location.href = redirectUrl;
    },
    redirectToLogin: () => {
      window.location.href = '/login';
    },
  },
  functions: {
    ...rawBase44.functions,
    invoke: async (fnName, params) => {
      try {
        return await rawBase44.functions.invoke(fnName, params);
      } catch {
        return { data: null };
      }
    },
  },
};
