import { w as writable } from "./index2.js";
const API_BASE_URL = "https://logiscorebe.onrender.com";
class ApiClient {
  baseUrl;
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers
      },
      ...options
    });
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }
  // Health check
  async healthCheck() {
    return this.request("/health");
  }
  // Freight forwarders
  async getFreightForwarders() {
    return this.request("/api/freight-forwarders/");
  }
  async getFreightForwarder(id) {
    return this.request(`/api/freight-forwarders/${id}`);
  }
  // Reviews
  async getReviews(freightForwarderId) {
    return this.request(`/api/reviews/?freight_forwarder_id=${freightForwarderId}`);
  }
  async createReview(review) {
    return this.request("/api/reviews/", {
      method: "POST",
      body: JSON.stringify(review)
    });
  }
  // Search
  async searchFreightForwarders(query) {
    return this.request(`/api/search/?q=${encodeURIComponent(query)}`);
  }
  // Authentication - Email/Password
  async signup(email, password, name, company, userType) {
    return this.request("/api/users/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name, company, user_type: userType })
    });
  }
  async signin(email, password) {
    return this.request("/api/users/signin", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
  }
  async changePassword(currentPassword, newPassword, token) {
    return this.request("/api/users/change-password", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
    });
  }
  async forgotPassword(email) {
    return this.request("/api/users/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email })
    });
  }
  async resetPassword(email, resetToken, newPassword) {
    return this.request("/api/users/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, reset_token: resetToken, new_password: newPassword })
    });
  }
  // Authentication - GitHub OAuth (keeping for backward compatibility)
  async getGitHubAuthUrl() {
    return this.request("/api/users/github/auth");
  }
  async handleGitHubCallback(code) {
    return this.request("/api/users/github/callback", {
      method: "POST",
      body: JSON.stringify({ code })
    });
  }
  // User management
  async getCurrentUser(token) {
    return this.request("/api/users/me", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
  }
  // Subscriptions
  async createSubscription(planId, planName, userType, token) {
    return this.request("/api/subscriptions/create", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        plan_id: planId,
        plan_name: planName,
        user_type: userType
      })
    });
  }
  async getSubscriptionPlans(token) {
    return this.request("/api/subscriptions/plans", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
  }
  async getCurrentSubscription(token) {
    return this.request("/api/subscriptions/current", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
  }
}
const apiClient = new ApiClient();
function createAuthStore() {
  const { subscribe, set, update } = writable({
    user: null,
    token: null,
    isLoading: false,
    error: null
  });
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("logiscore_token");
    const userData = localStorage.getItem("logiscore_user");
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        set({ user, token, isLoading: false, error: null });
      } catch (e) {
        localStorage.removeItem("logiscore_token");
        localStorage.removeItem("logiscore_user");
      }
    }
  }
  return {
    subscribe,
    // Set authentication data
    setAuth: (user, token) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("logiscore_token", token);
        localStorage.setItem("logiscore_user", JSON.stringify(user));
      }
      set({ user, token, isLoading: false, error: null });
    },
    // Clear authentication data
    logout: () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("logiscore_token");
        localStorage.removeItem("logiscore_user");
      }
      set({ user: null, token: null, isLoading: false, error: null });
    },
    // Set loading state
    setLoading: (isLoading) => {
      update((state) => ({ ...state, isLoading }));
    },
    // Set error
    setError: (error) => {
      update((state) => ({ ...state, error }));
    },
    // Sign up with email and password
    async signup(email, password, name, company, userType) {
      update((state) => ({ ...state, isLoading: true, error: null }));
      try {
        const { user, access_token } = await apiClient.signup(email, password, name, company, userType);
        this.setAuth(user, access_token);
        return { user, token: access_token };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Signup failed";
        update((state) => ({ ...state, error: errorMessage, isLoading: false }));
        throw error;
      }
    },
    // Sign in with email and password
    async signin(email, password) {
      update((state) => ({ ...state, isLoading: true, error: null }));
      try {
        const { user, access_token } = await apiClient.signin(email, password);
        this.setAuth(user, access_token);
        return { user, token: access_token };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Sign in failed";
        update((state) => ({ ...state, error: errorMessage, isLoading: false }));
        throw error;
      }
    },
    // Get current user from API
    async getCurrentUser() {
      update((state) => ({ ...state, isLoading: true }));
      try {
        const token = localStorage.getItem("logiscore_token");
        if (!token) {
          throw new Error("No token found");
        }
        const user = await apiClient.getCurrentUser(token);
        update((state) => ({ ...state, user, isLoading: false }));
        return user;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to get current user";
        update((state) => ({ ...state, error: errorMessage, isLoading: false }));
        this.logout();
        throw error;
      }
    },
    // Handle GitHub OAuth callback (keeping for backward compatibility)
    async handleGitHubCallback(code) {
      update((state) => ({ ...state, isLoading: true, error: null }));
      try {
        const { access_token, user } = await apiClient.handleGitHubCallback(code);
        this.setAuth(user, access_token);
        return { user, access_token };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "GitHub authentication failed";
        update((state) => ({ ...state, error: errorMessage, isLoading: false }));
        throw error;
      }
    }
  };
}
const auth = createAuthStore();
export {
  auth as a,
  apiClient as b
};
