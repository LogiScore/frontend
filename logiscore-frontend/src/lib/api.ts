// API service for LogiScore backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://logiscore-backend.onrender.com';

export interface FreightForwarder {
  id: string;
  name: string;
  website?: string;
  logo_url?: string;
  description?: string;
  rating?: number;
  review_count?: number;
}

export interface Review {
  id: string;
  freight_forwarder_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface User {
  id: string;
  github_id?: string;
  username: string;
  full_name?: string;
  email?: string;
  avatar_url?: string;
  company_name?: string;
  user_type: string;
  subscription_tier: string;
  is_verified: boolean;
  is_active: boolean;
  created_at?: string;
}

// API client class
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Health check
  async healthCheck() {
    return this.request<{
      status: string;
      database: string;
      timestamp: string;
    }>('/health');
  }

  // Freight forwarders
  async getFreightForwarders(): Promise<FreightForwarder[]> {
    return this.request<FreightForwarder[]>('/api/freight-forwarders/');
  }

  async getFreightForwarder(id: string): Promise<FreightForwarder> {
    return this.request<FreightForwarder>(`/api/freight-forwarders/${id}`);
  }

  // Reviews
  async getReviews(freightForwarderId: string): Promise<Review[]> {
    return this.request<Review[]>(`/api/reviews/?freight_forwarder_id=${freightForwarderId}`);
  }

  async createReview(review: {
    freight_forwarder_id: string;
    rating: number;
    comment?: string;
  }): Promise<Review> {
    return this.request<Review>('/api/reviews/', {
      method: 'POST',
      body: JSON.stringify(review),
    });
  }

  // Search
  async searchFreightForwarders(query: string): Promise<FreightForwarder[]> {
    return this.request<FreightForwarder[]>(`/api/search/?q=${encodeURIComponent(query)}`);
  }

  // Authentication - Email/Password
  async signup(email: string, password: string, name: string, company?: string, userType?: string): Promise<{ user: User; access_token: string; token_type: string }> {
    return this.request<{ user: User; access_token: string; token_type: string }>('/api/users/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, company, user_type: userType }),
    });
  }

  async signin(email: string, password: string): Promise<{ user: User; access_token: string; token_type: string }> {
    return this.request<{ user: User; access_token: string; token_type: string }>('/api/users/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async changePassword(currentPassword: string, newPassword: string, token: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/users/change-password', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
  }

  async forgotPassword(email: string): Promise<{ message: string; reset_token?: string; expires_in?: string }> {
    return this.request<{ message: string; reset_token?: string; expires_in?: string }>('/api/users/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(email: string, resetToken: string, newPassword: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/users/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, reset_token: resetToken, new_password: newPassword }),
    });
  }

  // Authentication - GitHub OAuth (keeping for backward compatibility)
  async getGitHubAuthUrl(): Promise<{ auth_url: string }> {
    return this.request<{ auth_url: string }>('/api/users/github/auth');
  }

  async handleGitHubCallback(code: string): Promise<{ access_token: string; user: User }> {
    return this.request<{ access_token: string; user: User }>('/api/users/github/callback', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  // User management
  async getCurrentUser(token: string): Promise<User> {
    return this.request<User>('/api/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // Subscriptions
  async createSubscription(
    planId: string,
    planName: string,
    userType: string,
    token: string
  ): Promise<{ subscription_id: string; message: string }> {
    return this.request<{ subscription_id: string; message: string }>('/api/subscriptions/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        plan_id: planId,
        plan_name: planName,
        user_type: userType
      }),
    });
  }

  async getSubscriptionPlans(token: string): Promise<{ plans: any[] }> {
    return this.request<{ plans: any[] }>('/api/subscriptions/plans', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async getCurrentSubscription(token: string): Promise<{
    subscription_tier: string;
    user_type: string;
    created_at: string;
    updated_at: string;
  }> {
    return this.request<{
      subscription_tier: string;
      user_type: string;
      created_at: string;
      updated_at: string;
    }>('/api/subscriptions/current', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient(); 