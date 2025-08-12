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

// Helper functions for token and user persistence
function saveToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('logiscore_token', token);
  }
}

function getStoredToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('logiscore_token');
  }
  return null;
}

function removeStoredToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('logiscore_token');
    localStorage.removeItem('logiscore_user');
  }
}

function saveUser(user: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('logiscore_user', JSON.stringify(user));
  }
}

function getStoredUser(): any {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('logiscore_user');
    return userStr ? JSON.parse(userStr) : null;
  }
  return null;
}

// Create a writable store for authentication state
export const auth = writable<AuthState>({
  user: getStoredUser(), // Initialize with stored user
  token: getStoredToken(), // Initialize with stored token
  isLoading: false,
  error: null
});

// Auth methods
export const authMethods = {
  login: async (credentials: { email: string; password: string }) => {
    auth.update(state => ({ ...state, isLoading: true, error: null }));
    
    try {
      const response = await apiClient.signin(credentials.email, credentials.password);
      // Save token and user to localStorage
      saveToken(response.access_token);
      saveUser(response.user);
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
    // Remove token from localStorage
    removeStoredToken();
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
      // Save token and user to localStorage
      saveToken(response.access_token);
      saveUser(response.user);
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
      
      console.log('getCurrentUser called with token:', authToken ? 'exists' : 'none');
      
      if (!authToken) {
        throw new Error('No token available');
      }
      
      // Try to get user from API
      try {
        const user = await apiClient.getCurrentUser(authToken);
        console.log('getCurrentUser API call successful, user:', user ? 'exists' : 'none');
        
        // Ensure token is saved to localStorage
        saveToken(authToken);
        auth.update(state => ({
          ...state,
          user,
          token: authToken
        }));
        return;
      } catch (apiError: any) {
        console.warn('API call failed, but maintaining local session:', apiError.message);
        
        // If we have a stored token but API fails, maintain the session locally
        // This prevents users from being logged out due to backend issues
        if (currentState.user) {
          console.log('Maintaining existing user session despite API failure');
          saveToken(authToken);
          auth.update(state => ({
            ...state,
            token: authToken,
            // Keep existing user data
          }));
          return;
        }
        
        // If no existing user data, then we can't maintain the session
        throw apiError;
      }
    } catch (error: any) {
      console.error('getCurrentUser completely failed:', error.message);
      // User not authenticated - clear localStorage too
      removeStoredToken();
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
      console.log('checkAuth called');
      const currentState = get<AuthState>(auth);
      console.log('Current state token:', currentState.token ? 'exists' : 'none');
      console.log('Current state user:', currentState.user ? 'exists' : 'none');
      
      if (currentState.token && currentState.user) {
        console.log('Using existing token and user from store');
        // Just ensure token is saved to localStorage
        saveToken(currentState.token);
        return;
      } else if (currentState.token) {
        console.log('Using existing token from store, attempting to get user');
        // Validate token and get current user
        await authMethods.getCurrentUser(currentState.token);
      } else {
        console.log('No token in store, checking localStorage');
        // Try to get stored token and validate it
        const storedToken = getStoredToken();
        console.log('Stored token found:', storedToken ? 'yes' : 'no');
        if (storedToken) {
          console.log('Attempting to restore session with stored token');
          await authMethods.getCurrentUser(storedToken);
        } else {
          console.log('No stored token found');
        }
      }
    } catch (error) {
      console.error('checkAuth failed:', error);
      // User not authenticated, clear everything
      removeStoredToken();
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
      // Save token to localStorage
      saveToken(response.access_token);
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
  console.log('Auth system initializing...');
  console.log('Stored token on init:', getStoredToken() ? 'exists' : 'none');
  
  authMethods.checkAuth();
  
  // Set up periodic token validation (every 5 minutes)
  setInterval(() => {
    const currentState = get<AuthState>(auth);
    if (currentState.token && currentState.user) {
      authMethods.getCurrentUser(currentState.token).catch(() => {
        // If token validation fails, logout user
        authMethods.logout();
      });
    }
  }, 5 * 60 * 1000); // 5 minutes
}

