import { writable } from 'svelte/store';
import { apiClient } from './api';

// Create a writable store for authentication state
export const auth = writable({
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
      const response = await apiClient.login(credentials);
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
      const response = await apiClient.register(userData);
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
      const currentState = get(auth);
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
      const currentState = get(auth);
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

