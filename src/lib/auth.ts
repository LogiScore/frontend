import { writable } from 'svelte/store';
import { apiClient } from './api';
import type { User } from './api';

// Helper function to get current store value - moved to top
function get<T>(store: any): T {
  let value: T;
  store.subscribe((v: T) => value = v)();
  return value!;
}

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
    // Also store token timestamp for expiration checking
    localStorage.setItem('logiscore_token_timestamp', Date.now().toString());
  }
}

function getStoredToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('logiscore_token');
  }
  return null;
}

function getStoredTokenTimestamp(): number | null {
  if (typeof window !== 'undefined') {
    const timestamp = localStorage.getItem('logiscore_token_timestamp');
    return timestamp ? parseInt(timestamp) : null;
  }
  return null;
}

function removeStoredToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('logiscore_token');
    localStorage.removeItem('logiscore_user');
    localStorage.removeItem('logiscore_token_timestamp');
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

// JWT token utility functions
function isTokenExpired(token: string): boolean {
  try {
    // Decode JWT token (without verification - just for expiration check)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Check if token is expired or will expire in the next 5 minutes
    const bufferTime = 5 * 60; // 5 minutes buffer
    const isExpired = payload.exp && (payload.exp - bufferTime) < currentTime;
    
    // Token expiration check completed
    
    return isExpired;
  } catch (error) {
    console.warn('Failed to decode token for expiration check:', error);
    // If we can't decode the token, assume it's expired
    return true;
  }
}

function getTokenExpirationTime(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null; // Convert to milliseconds
  } catch (error) {
    console.warn('Failed to get token expiration time:', error);
    return null;
  }
}

// Inactivity tracking
let inactivityTimer: number | null = null;
let inactivityPromptTimer: number | null = null;
const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes
const PROMPT_TIMEOUT = 1 * 60 * 1000; // 1 minute to respond to prompt

function resetInactivityTimer() {
  // Check if user is authenticated before setting timer
  const currentState = get<AuthState>(auth);
  if (!currentState.user || !currentState.token) {
    // User not authenticated, skipping inactivity timer
    return;
  }
  
  // Resetting inactivity timer
  
  // Clear existing timers
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }
  if (inactivityPromptTimer) {
    clearTimeout(inactivityPromptTimer);
    inactivityPromptTimer = null;
  }
  
  // Reset the inactivity prompt state
  auth.update(state => ({ ...state, showInactivityPrompt: false }));
  
  // Set new inactivity timer
  inactivityTimer = setTimeout(() => {
          // User inactive for 10 minutes, showing prompt
    auth.update(state => ({ ...state, showInactivityPrompt: true }));
    
    // Set prompt timeout - if user doesn't respond in 1 minute, logout
    inactivityPromptTimer = setTimeout(() => {
      // Inactivity prompt timeout, logging out user
      authMethods.logout();
    }, PROMPT_TIMEOUT);
  }, INACTIVITY_TIMEOUT);
  
  // New inactivity timer set
}

function setupInactivityTracking() {
  if (typeof window === 'undefined') return;
  
  // Check if user is authenticated before setting up tracking
  const currentState = get<AuthState>(auth);
  if (!currentState.user || !currentState.token) {
    // User not authenticated, skipping inactivity tracking setup
    return;
  }
  
  // Setting up inactivity tracking
  
  // Events that indicate user activity
  const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
  
  // Remove any existing listeners first
  activityEvents.forEach(event => {
    document.removeEventListener(event, resetInactivityTimer, true);
  });
  
  // Create a debounced version of resetInactivityTimer to avoid excessive calls
  let debounceTimer: number | null = null;
  const debouncedResetTimer = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      resetInactivityTimer();
      debounceTimer = null;
    }, 100); // 100ms debounce
  };
  
  // Reset timer on any user activity
  activityEvents.forEach(event => {
    document.addEventListener(event, debouncedResetTimer, true);
  });
  
  // Also listen for window focus/blur events
  window.addEventListener('focus', resetInactivityTimer);
  window.addEventListener('blur', () => {
    // Window lost focus, pausing inactivity timer
  });
  
  // Start the initial timer
  resetInactivityTimer();
  
  // Inactivity tracking setup complete
}

function clearInactivityTracking() {
  // Clearing inactivity tracking
  
  // Clear existing timers
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }
  if (inactivityPromptTimer) {
    clearTimeout(inactivityPromptTimer);
    inactivityPromptTimer = null;
  }
  
  // Reset the inactivity prompt state
  auth.update(state => ({ ...state, showInactivityPrompt: false }));
  
  // Remove event listeners
  if (typeof window !== 'undefined') {
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach(event => {
      document.removeEventListener(event, resetInactivityTimer, true);
    });
    
    // Remove window event listeners
    window.removeEventListener('focus', resetInactivityTimer);
  }
  
  // Inactivity tracking cleared
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
    // Auth state changed
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
      
      // Start inactivity tracking after successful login
      setTimeout(() => {
        authMethods.startInactivityTracking();
      }, 100);
      
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
    // Clear inactivity tracking before logout
    clearInactivityTracking();
    
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
      
      // Start inactivity tracking after successful registration
      setTimeout(() => {
        authMethods.startInactivityTracking();
      }, 100);
      
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

  getCurrentUser: async (token?: string): Promise<void> => {
    try {
      const currentState = get<AuthState>(auth);
      const authToken = token || currentState.token;
      
      // getCurrentUser called
      
      if (!authToken) {
        throw new Error('No token available');
      }
      
      // Check if token is expired before making API call
      if (isTokenExpired(authToken)) {
        // Token is expired, attempting to refresh...
        
        // Try to refresh the token
        try {
          const refreshResult = await authMethods.refreshToken();
          if (refreshResult.success && refreshResult.newToken) {
            // Token refreshed successfully, retrying getCurrentUser
            // Recursively call getCurrentUser with the new token
            return await authMethods.getCurrentUser(refreshResult.newToken);
          } else {
            // Token refresh failed, logging out user
            authMethods.logout();
            return;
          }
        } catch (refreshError) {
          // Token refresh error, logging out user
          authMethods.logout();
          return;
        }
      }
      
      // Try to get user from API
      try {
        const user = await apiClient.getCurrentUser(authToken);
        // getCurrentUser API call successful
        
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
          // Maintaining existing user session despite API failure
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
        // Network error detected, maintaining existing session
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

  // Check auth status
  checkAuth: async () => {
    try {
      // checkAuth called
      const currentState = get<AuthState>(auth);
      // Current state checked
      
      // First, try to restore from localStorage if store is empty
      if (!currentState.token || !currentState.user) {
        // Store incomplete, attempting to restore from localStorage
        const storedToken = getStoredToken();
        const storedUser = getStoredUser();
        
        if (storedToken && storedUser) {
          // Found stored token and user, restoring to store
          
          // Check if stored token is expired
          if (isTokenExpired(storedToken)) {
            // Stored token is expired, attempting refresh...
            try {
              const refreshResult = await authMethods.refreshToken();
              if (refreshResult.success && refreshResult.newToken) {
                // Token refreshed during auth check
                auth.update(state => ({
                  ...state,
                  token: refreshResult.newToken!,
                  user: storedUser
                }));
                return;
              } else {
                // Token refresh failed during auth check
                removeStoredToken();
                auth.update(state => ({
                  ...state,
                  user: null,
                  token: null
                }));
                return;
              }
            } catch (refreshError) {
              // Token refresh error during auth check
              removeStoredToken();
              auth.update(state => ({
                ...state,
                user: null,
                token: null
              }));
              return;
            }
          }
          
          auth.update(state => ({
            ...state,
            token: storedToken,
            user: storedUser
          }));
          
          // Now try to validate the token with the backend
          try {
            await authMethods.getCurrentUser(storedToken);
            // Token validation successful
            return;
          } catch (validationError: any) {
            console.warn('Token validation failed, but maintaining local session:', validationError.message);
            // Don't logout immediately, just maintain the local session
            return;
          }
        }
      }
      
      // If we have both token and user in store, check if token needs refresh
      if (currentState.token && currentState.user) {
        // Using existing token and user from store
        
        // Check if token is expired
        if (isTokenExpired(currentState.token)) {
          // Existing token is expired, attempting refresh...
          try {
            const refreshResult = await authMethods.refreshToken();
            if (refreshResult.success && refreshResult.newToken) {
              // Token refreshed during auth check
              auth.update(state => ({
                ...state,
                token: refreshResult.newToken!
              }));
              return;
            } else {
              // Token refresh failed during auth check
              authMethods.logout();
              return;
            }
          } catch (refreshError) {
            // Token refresh error during auth check
            authMethods.logout();
            return;
          }
        }
        
        saveToken(currentState.token);
        saveUser(currentState.user);
        return;
      }
      
      // If we only have token, try to get user
      if (currentState.token && !currentState.user) {
        // Using existing token from store, attempting to get user
        try {
          await authMethods.getCurrentUser(currentState.token);
          return;
        } catch (error: any) {
          console.warn('Failed to get user with existing token:', error.message);
          // Don't logout immediately, maintain the token
          return;
        }
      }
      
      // No valid authentication found
    } catch (error: any) {
      console.error('checkAuth failed:', error);
      // Only clear everything if it's a critical error, not just a network issue
      if (error.message?.includes('Network error') || error.message?.includes('Failed to fetch')) {
        // Network error detected, maintaining existing session
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
    
    // AUTH DEBUG INFO
    // Store and localStorage state checked
    
    return {
      store: currentState,
      localStorage: { token: storedToken, user: storedUser }
    };
  },

  // Handle inactivity prompt responses
  extendSession: () => {
    // User chose to extend session
    resetInactivityTimer();
  },

  endSession: () => {
    // User chose to end session
    authMethods.logout();
  },

  // Development/testing method - manually trigger inactivity prompt
  testInactivityPrompt: () => {
    // Manually triggering inactivity prompt for testing
    auth.update(state => ({ ...state, showInactivityPrompt: true }));
    
    // Set prompt timeout - if user doesn't respond in 1 minute, logout
    if (inactivityPromptTimer) {
      clearTimeout(inactivityPromptTimer);
    }
    inactivityPromptTimer = setTimeout(() => {
      // Inactivity prompt timeout, logging out user
      authMethods.logout();
    }, PROMPT_TIMEOUT);
  },

  // Test inactivity timer with shorter duration
  testInactivityTimer: (seconds: number = 30) => {
    // Testing inactivity timer with shorter duration
    
    // Clear existing timers
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
      inactivityTimer = null;
    }
    if (inactivityPromptTimer) {
      clearTimeout(inactivityPromptTimer);
      inactivityPromptTimer = null;
    }
    
    // Reset the inactivity prompt state
    auth.update(state => ({ ...state, showInactivityPrompt: false }));
    
    // Set test timer
    inactivityTimer = setTimeout(() => {
      // Test: User inactive for specified seconds, showing prompt
      auth.update(state => ({ ...state, showInactivityPrompt: true }));
      
      // Set prompt timeout - if user doesn't respond in 1 minute, logout
      inactivityPromptTimer = setTimeout(() => {
        // Test: Inactivity prompt timeout, logging out user
        authMethods.logout();
      }, PROMPT_TIMEOUT);
    }, seconds * 1000);
    
    // Test timer set
  },

  // Check inactivity timer status
  getInactivityStatus: () => {
    const currentState = get<AuthState>(auth);
    return {
      showInactivityPrompt: currentState.showInactivityPrompt,
      hasInactivityTimer: !!inactivityTimer,
      hasPromptTimer: !!inactivityPromptTimer,
      inactivityTimeout: INACTIVITY_TIMEOUT / 1000,
      promptTimeout: PROMPT_TIMEOUT / 1000
    };
  },

  // Debug inactivity tracking
  debugInactivityTracking: () => {
    // Debug inactivity tracking function
    
    return {
      windowExists: typeof window !== 'undefined',
      documentExists: typeof document !== 'undefined',
      readyState: document?.readyState,
      bodyExists: !!document?.body,
      timers: {
        inactivity: inactivityTimer,
        prompt: inactivityPromptTimer
      },
      authState: get<AuthState>(auth)
    };
  },

  // Recovery method - restore original user session from localStorage
  recoverSession: () => {
    // Attempting to recover original user session...
    const storedToken = getStoredToken();
    const storedUser = getStoredUser();
    
    if (storedToken && storedUser) {
      // Found stored session, restoring...
      // Stored user retrieved
      
      // Restore the session
      auth.update(state => ({
        ...state,
        user: storedUser,
        token: storedToken,
        error: null
      }));
      
      return { success: true, message: 'Session recovered successfully' };
    } else {
      // No stored session found
      return { success: false, message: 'No stored session to recover' };
    }
  },

  // ===== METHOD: signinWithCode =====
  // Sign in using email verification code
  async signinWithCode(email: string, code: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Signing in with verification code...
      
      const response = await apiClient.verifySigninCode(email, code);
      
      if (response.user && response.access_token) {
        // Save the real JWT token and user data
        saveToken(response.access_token);
        saveUser(response.user);
        
        // Update the auth store
        auth.update(state => ({
          ...state,
          user: response.user,
          token: response.access_token,
          error: null,
          isLoading: false
        }));
        
        // Start inactivity tracking after successful signin
        setTimeout(() => {
          authMethods.startInactivityTracking();
        }, 100);
        
        // Sign in successful with real JWT token
        return { success: true };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Sign in with code failed:', error);
      
      // Update the auth store with error
      auth.update(state => ({
        ...state,
        error: error.message || 'Failed to sign in with verification code',
        isLoading: false
      }));
      
      return { 
        success: false, 
        error: error.message || 'Failed to sign in with verification code' 
      };
    }
  },

  // ===== METHOD: requestSigninCode =====
  // Request verification code for existing user sign-in
  async requestSigninCode(email: string): Promise<{ success: boolean; error?: string; expires_in?: number }> {
    try {
      // AuthMethods.requestSigninCode called
      
      const response = await apiClient.sendSigninCode(email);
      // API response received
      
      // Verification code sent successfully for sign-in
      return { 
        success: true, 
        expires_in: response.expires_in 
      };
    } catch (error: any) {
      console.error('💥 AuthMethods.requestSigninCode failed:', error);
      console.error('💥 Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      return { 
        success: false, 
        error: error.message || 'Failed to send verification code for sign-in' 
      };
    }
  },

  // ===== METHOD: requestSignupCode =====
  // Request verification code for new user sign-up
  async requestSignupCode(email: string, userType: string, companyName: string): Promise<{ success: boolean; error?: string; expires_in?: number }> {
    try {
      // AuthMethods.requestSignupCode called
      
      const response = await apiClient.sendSignupCode(email, userType, companyName);
      // API response received
      
      // Verification code sent successfully for sign-up
      return { 
        success: true, 
        expires_in: response.expires_in 
      };
    } catch (error: any) {
      console.error('💥 AuthMethods.requestSignupCode failed:', error);
      console.error('💥 Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      return { 
        success: false, 
        error: error.message || 'Failed to send verification code for sign-up' 
      };
    }
  },

  // ===== METHOD: verifySignupCode =====
  // Verify sign-up code and complete new user registration
  async verifySignupCode(email: string, code: string, fullName: string, companyName: string, userType: string): Promise<{ success: boolean; error?: string }> {
    try {
      // AuthMethods.verifySignupCode called
      
      const response = await apiClient.verifySignupCode(email, code, fullName, companyName, userType);
      
      if (response.user && response.access_token) {
        // Save the real JWT token and user data
        saveToken(response.access_token);
        saveUser(response.user);
        
        // Update the auth store
        auth.update(state => ({
          ...state,
          user: response.user,
          token: response.access_token,
          error: null,
          isLoading: false
        }));
        
        // Send welcome email to new user
        try {
          await apiClient.sendWelcomeEmail(
            email,
            fullName,
            companyName,
            userType
          );
          console.log('Welcome email sent successfully to:', email);
        } catch (welcomeEmailError) {
          console.error('Failed to send welcome email:', welcomeEmailError);
          // Don't fail the signup process if welcome email fails
        }
        
        // Start inactivity tracking after successful signup
        setTimeout(() => {
          authMethods.startInactivityTracking();
        }, 100);
        
        // Sign up successful with real JWT token
        return { success: true };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Sign up with code failed:', error);
      
      // Update the auth store with error
      auth.update(state => ({
        ...state,
        error: error.message || 'Failed to complete sign-up with verification code',
        isLoading: false
      }));
      
      return { 
        success: false, 
        error: error.message || 'Failed to complete sign-up with verification code' 
      };
    }
  },

  // ===== METHOD: requestCode =====
  // Legacy method: Request verification code to be sent to email (for backward compatibility)
  async requestCode(email: string): Promise<{ success: boolean; error?: string; expires_in?: number }> {
    try {
      // AuthMethods.requestCode called
      
      const response = await apiClient.sendVerificationCode(email);
      // API response received
      
      // Verification code sent successfully
      return { 
        success: true, 
        expires_in: response.expires_in 
      };
    } catch (error: any) {
      console.error('💥 AuthMethods.requestCode failed:', error);
      console.error('💥 Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      return { 
        success: false, 
        error: error.message || 'Failed to send verification code' 
      };
    }
  },

  // Token refresh method
  async refreshToken(): Promise<{ success: boolean; newToken?: string }> {
    const currentToken = getStoredToken();
    if (!currentToken) {
      console.warn('No token to refresh.');
      return { success: false };
    }

    try {
      const response = await apiClient.refreshToken(currentToken);
      if (response.access_token) {
        saveToken(response.access_token);
        // Token refreshed successfully
        return { success: true, newToken: response.access_token };
      } else {
        console.warn('Token refresh failed, invalid response from API.');
        return { success: false };
      }
    } catch (error: any) {
      console.error('Token refresh error:', error);
      return { success: false };
    }
  },

  // Start inactivity tracking manually
  startInactivityTracking: () => {
    // Manually starting inactivity tracking
    setupInactivityTracking();
  },

  // Stop inactivity tracking manually
  stopInactivityTracking: () => {
    // Manually stopping inactivity tracking
    clearInactivityTracking();
  },

  // Check and refresh token if needed before making API calls
  ensureValidToken: async (): Promise<string | null> => {
    const currentState = get<AuthState>(auth);
    if (!currentState.token) {
      return null;
    }
    
    // Check if token is expired or will expire soon
    if (isTokenExpired(currentState.token)) {
      // Token expired, attempting refresh before API call...
      try {
        const refreshResult = await authMethods.refreshToken();
        if (refreshResult.success && refreshResult.newToken) {
          // Token refreshed before API call
          return refreshResult.newToken;
        } else {
          // Token refresh failed before API call
          authMethods.logout();
          return null;
        }
      } catch (refreshError) {
        // Token refresh error before API call
        authMethods.logout();
        return null;
      }
    }
    
    return currentState.token;
  }
};

// Initialize auth check on app start
if (typeof window !== 'undefined') {
  // Auth system initializing...
  // Stored authentication checked
  
  // Ensure the store is properly initialized with stored values
  const storedToken = getStoredToken();
  const storedUser = getStoredUser();
  
  if (storedToken && storedUser) {
    // Restoring stored authentication on init
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
      // Check if token will expire soon (within 10 minutes)
      if (isTokenExpired(currentState.token)) {
        // Token expired, attempting refresh...
        authMethods.refreshToken().catch(() => {
          // If refresh fails, logout user
          authMethods.logout();
        });
      } else {
        // Token is still valid, just validate it
        authMethods.getCurrentUser(currentState.token).catch(() => {
          // If validation fails, logout user
          authMethods.logout();
        });
      }
    }
  }, 5 * 60 * 1000); // 5 minutes

  // Set up inactivity tracking with proper timing
  const initializeInactivityTracking = () => {
    // Check if user is authenticated before setting up tracking
    const currentState = get<AuthState>(auth);
    if (!currentState.user || !currentState.token) {
      // User not authenticated, skipping inactivity tracking initialization
      return;
    }
    
    if (document.readyState === 'complete') {
      // Document ready, setting up inactivity tracking
      setupInactivityTracking();
    } else {
      // Document not ready, waiting for load event
      window.addEventListener('load', () => {
        // Window load event fired, setting up inactivity tracking
        setupInactivityTracking();
      });
      
      // Also try on DOMContentLoaded as backup
      document.addEventListener('DOMContentLoaded', () => {
        // DOMContentLoaded fired, setting up inactivity tracking
        setupInactivityTracking();
      });
    }
  };
  
  // Initialize with a slight delay to ensure everything is ready
  setTimeout(initializeInactivityTracking, 100);
}

