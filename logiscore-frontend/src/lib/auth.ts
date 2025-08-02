import { writable } from 'svelte/store';
import { apiClient, type User } from './api';

// Authentication store
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>({
    user: null,
    token: null,
    isLoading: false,
    error: null,
  });

  // Initialize from localStorage
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('logiscore_token');
    const userData = localStorage.getItem('logiscore_user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        set({ user, token, isLoading: false, error: null });
      } catch (e) {
        // Clear invalid data
        localStorage.removeItem('logiscore_token');
        localStorage.removeItem('logiscore_user');
      }
    }
  }

  return {
    subscribe,
    
    // Set authentication data
    setAuth: (user: User, token: string) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('logiscore_token', token);
        localStorage.setItem('logiscore_user', JSON.stringify(user));
      }
      set({ user, token, isLoading: false, error: null });
    },

    // Clear authentication data
    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('logiscore_token');
        localStorage.removeItem('logiscore_user');
      }
      set({ user: null, token: null, isLoading: false, error: null });
    },

    // Set loading state
    setLoading: (isLoading: boolean) => {
      update(state => ({ ...state, isLoading }));
    },

    // Set error
    setError: (error: string | null) => {
      update(state => ({ ...state, error }));
    },

    // Sign up with email and password
    async signup(email: string, password: string, name: string, company?: string, userType?: string) {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const { user, access_token } = await apiClient.signup(email, password, name, company, userType);
        this.setAuth(user, access_token);
        return { user, token: access_token };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Signup failed';
        update(state => ({ ...state, error: errorMessage, isLoading: false }));
        throw error;
      }
    },

    // Sign in with email and password
    async signin(email: string, password: string) {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const { user, access_token } = await apiClient.signin(email, password);
        this.setAuth(user, access_token);
        return { user, token: access_token };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
        update(state => ({ ...state, error: errorMessage, isLoading: false }));
        throw error;
      }
    },

    // Get current user from API
    async getCurrentUser() {
      update(state => ({ ...state, isLoading: true }));
      
      try {
        const token = localStorage.getItem('logiscore_token');
        if (!token) {
          throw new Error('No token found');
        }

        const user = await apiClient.getCurrentUser(token);
        update(state => ({ ...state, user, isLoading: false }));
        return user;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to get current user';
        update(state => ({ ...state, error: errorMessage, isLoading: false }));
        this.logout(); // Clear invalid token
        throw error;
      }
    },

    // Handle GitHub OAuth callback (keeping for backward compatibility)
    async handleGitHubCallback(code: string) {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const { access_token, user } = await apiClient.handleGitHubCallback(code);
        this.setAuth(user, access_token);
        return { user, access_token };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'GitHub authentication failed';
        update(state => ({ ...state, error: errorMessage, isLoading: false }));
        throw error;
      }
    },
  };
}

export const auth = createAuthStore(); 