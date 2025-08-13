import { writable } from 'svelte/store';
import { apiClient } from './api';
import type { User } from './api';

// Define the auth store type
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  showInactivityPrompt: boolean;
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

// Inactivity tracking
let inactivityTimer: number | null = null;
let inactivityPromptTimer: number | null = null;
const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes
const PROMPT_TIMEOUT = 1 * 60 * 1000; // 1 minute to respond to prompt

function resetInactivityTimer() {
  // Clear existing timers
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }
  if (inactivityPromptTimer) {
    clearTimeout(inactivityPromptTimer);
  }
  
  // Reset the inactivity prompt state
  auth.update(state => ({ ...state, showInactivityPrompt: false }));
  
  // Set new inactivity timer
  inactivityTimer = setTimeout(() => {
    console.log('User inactive for 10 minutes, showing prompt');
    auth.update(state => ({ ...state, showInactivityPrompt: true }));
    
    // Set prompt timeout - if user doesn't respond in 1 minute, logout
    inactivityPromptTimer = setTimeout(() => {
      console.log('Inactivity prompt timeout, logging out user');
      authMethods.logout();
    }, PROMPT_TIMEOUT);
  }, INACTIVITY_TIMEOUT);
}

function setupInactivityTracking() {
  if (typeof window === 'undefined') return;
  
  // Events that indicate user activity
  const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
  
  // Reset timer on any user activity
  activityEvents.forEach(event => {
    document.addEventListener(event, resetInactivityTimer, true);
  });
  
  // Start the initial timer
  resetInactivityTimer();
}

// Create a writable store for authentication state
export const auth = writable<AuthState>({
  user: getStoredUser(), // Initialize with stored user
  token: getStoredToken(), // Initialize with stored token
  isLoading: false,
  error: null,
  showInactivityPrompt: false
});

// Subscribe to auth changes for debugging
if (typeof window !== 'undefined') {
  auth.subscribe(state => {
    console.log('Auth state changed:', {
      hasUser: !!state.user,
      hasToken: !!state.token,
      isLoading: state.isLoading,
      error: state.error
    });
  });
}

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
        
        // Ensure token and user are saved to localStorage
        saveToken(authToken);
        saveUser(user);
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
          saveUser(currentState.user);
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
      
      // Only clear authentication for critical errors, not network issues
      if (error.message?.includes('Network error') || error.message?.includes('Failed to fetch')) {
        console.log('Network error detected, maintaining existing session');
        return;
      }
      
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
      
      // First, try to restore from localStorage if store is empty
      if (!currentState.token || !currentState.user) {
        console.log('Store incomplete, attempting to restore from localStorage');
        const storedToken = getStoredToken();
        const storedUser = getStoredUser();
        
        if (storedToken && storedUser) {
          console.log('Found stored token and user, restoring to store');
          auth.update(state => ({
            ...state,
            token: storedToken,
            user: storedUser
          }));
          
          // Now try to validate the token with the backend
          try {
            await authMethods.getCurrentUser(storedToken);
            console.log('Token validation successful');
            return;
          } catch (validationError: any) {
            console.warn('Token validation failed, but maintaining local session:', validationError.message);
            // Don't logout immediately, just maintain the local session
            return;
          }
        }
      }
      
      // If we have both token and user in store, just ensure they're saved to localStorage
      if (currentState.token && currentState.user) {
        console.log('Using existing token and user from store');
        saveToken(currentState.token);
        saveUser(currentState.user);
        return;
      }
      
      // If we only have token, try to get user
      if (currentState.token && !currentState.user) {
        console.log('Using existing token from store, attempting to get user');
        try {
          await authMethods.getCurrentUser(currentState.token);
          return;
        } catch (error: any) {
          console.warn('Failed to get user with existing token:', error.message);
          // Don't logout immediately, maintain the token
          return;
        }
      }
      
      console.log('No valid authentication found');
    } catch (error: any) {
      console.error('checkAuth failed:', error);
      // Only clear everything if it's a critical error, not just a network issue
      if (error.message?.includes('Network error') || error.message?.includes('Failed to fetch')) {
        console.log('Network error detected, maintaining existing session');
        return;
      }
      
      // For other errors, clear authentication
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
  },

  // Debug method to check current auth status
  debugAuthStatus: () => {
    const currentState = get<AuthState>(auth);
    const storedToken = getStoredToken();
    const storedUser = getStoredUser();
    
    console.log('=== AUTH DEBUG INFO ===');
    console.log('Store state:', {
      hasUser: !!currentState.user,
      hasToken: !!currentState.token,
      user: currentState.user,
      token: currentState.token ? 'exists' : 'none'
    });
    console.log('localStorage state:', {
      hasStoredToken: !!storedToken,
      hasStoredUser: !!storedUser,
      storedToken: storedToken ? 'exists' : 'none',
      storedUser: storedUser
    });
    console.log('=======================');
    
    return {
      store: currentState,
      localStorage: { token: storedToken, user: storedUser }
    };
  },

  // Handle inactivity prompt responses
  extendSession: () => {
    console.log('User chose to extend session');
    resetInactivityTimer();
  },

  endSession: () => {
    console.log('User chose to end session');
    authMethods.logout();
  },

  // Development/testing method - manually trigger inactivity prompt
  testInactivityPrompt: () => {
    console.log('Manually triggering inactivity prompt for testing');
    auth.update(state => ({ ...state, showInactivityPrompt: true }));
    
    // Set prompt timeout - if user doesn't respond in 1 minute, logout
    if (inactivityPromptTimer) {
      clearTimeout(inactivityPromptTimer);
    }
    inactivityPromptTimer = setTimeout(() => {
      console.log('Inactivity prompt timeout, logging out user');
      authMethods.logout();
    }, PROMPT_TIMEOUT);
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
  console.log('Stored user on init:', getStoredUser() ? 'exists' : 'none');
  
  // Ensure the store is properly initialized with stored values
  const storedToken = getStoredToken();
  const storedUser = getStoredUser();
  
  if (storedToken && storedUser) {
    console.log('Restoring stored authentication on init');
    auth.update(state => ({
      ...state,
      token: storedToken,
      user: storedUser
    }));
  }
  
  // Now check auth status
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

  // Set up inactivity tracking
  setupInactivityTracking();
}

