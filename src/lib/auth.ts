import { writable } from 'svelte/store';
import { apiClient } from './api';
import type { User } from './api';

// Define the auth store type
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

// Create a writable store for authentication state
export const auth = writable<AuthState>({
  user: null,
  token: null,
  isLoading: false,
  error: null
});

// Auth methods
export const authMethods = {
  login: async (credentials: { email: string; password: string }) => {
    auth.update(state => ({ ...state, isLoading: true, error: null }));
    
    try {
      const response = await apiClient.signin(credentials.email, credentials.password);
      auth.update(state => ({
        ...state,
        user: response.user,
        token: response.access_token,
        isLoading: false,
        error: null
      }));
      return { success: true };
    } catch (error: any) {
      auth.update(state => ({ 
        ...state, 
        isLoading: false, 
        error: error.message || 'Login failed' 
      }));
      return { success: false, error: error.message };
    }
  },

  logout: () => {
    auth.update(state => ({
      ...state,
      user: null,
      token: null,
      error: null
    }));
  },

  register: async (userData: { email: string; password: string; full_name: string }) => {
    auth.update(state => ({ ...state, isLoading: true, error: null }));
    
    try {
      const response = await apiClient.signup(userData.email, userData.password, userData.full_name);
      auth.update(state => ({
        ...state,
        user: response.user,
        token: response.access_token,
        isLoading: false,
        error: null
      }));
      return { success: true };
    } catch (error: any) {
      auth.update(state => ({ 
        ...state, 
        isLoading: false, 
        error: error.message || 'Registration failed' 
      }));
      return { success: false, error: error.message };
    }
  },

  getCurrentUser: async (token?: string) => {
    try {
      const currentState = get<AuthState>(auth);
      const authToken = token || currentState.token;
      
      if (!authToken) {
        throw new Error('No token available');
      }
      
      const user = await apiClient.getCurrentUser(authToken);
      auth.update(state => ({
        ...state,
        user,
        token: authToken
      }));
    } catch (error: any) {
      // User not authenticated
      auth.update(state => ({
        ...state,
        user: null,
        token: null,
        error: error.message
      }));
    }
  },

  checkAuth: async () => {
    try {
      const currentState = get<AuthState>(auth);
      if (currentState.token) {
        await authMethods.getCurrentUser(currentState.token);
      }
    } catch (error) {
      // User not authenticated
      auth.update(state => ({
        ...state,
        user: null,
        token: null
      }));
    }
  },

  handleGitHubCallback: async (code: string) => {
    try {
      // Exchange the authorization code for an access token
      const response = await apiClient.handleGitHubCallback(code);
      auth.update(state => ({
        ...state,
        user: response.user,
        token: response.access_token,
        isLoading: false,
        error: null
      }));
      return { success: true };
    } catch (error: any) {
      auth.update(state => ({
        ...state,
        isLoading: false,
        error: error.message || 'GitHub authentication failed'
      }));
      throw error;
    }
  }
};

// Helper function to get current store value
function get<T>(store: any): T {
  let value: T;
  store.subscribe((v: T) => value = v)();
  return value!;
}

// Initialize auth check on app start
if (typeof window !== 'undefined') {
  authMethods.checkAuth();
}

