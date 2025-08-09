// API client for LogiScore frontend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://logiscorebe.onrender.com';

export const apiClient = {
  // Auth methods
  login: async (credentials: { email: string; password: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },

  register: async (userData: { email: string; password: string; full_name: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!response.ok) throw new Error('Registration failed');
    return response.json();
  },

  getCurrentUser: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to get user');
    return response.json();
  },

  changePassword: async (currentPassword: string, newPassword: string, token: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
    });
    if (!response.ok) throw new Error('Failed to change password');
    return response.json();
  },

  // Payment methods
  processPayment: async (paymentData: any) => {
    // Simulate payment processing for demo
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ message: 'Payment processed successfully!' });
      }, 1000);
    });
  },

  // Admin methods
  getDashboardStats: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to get dashboard stats');
    return response.json();
  },

  getAdminUsers: async (token: string, search?: string, filter?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (filter) params.append('filter', filter);
    
    const response = await fetch(`${API_BASE_URL}/admin/users?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to get users');
    return response.json();
  },

  getAdminReviews: async (token: string, status?: string) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    
    const response = await fetch(`${API_BASE_URL}/admin/reviews?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to get reviews');
    return response.json();
  },

  getAdminDisputes: async (token: string, status?: string) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    
    const response = await fetch(`${API_BASE_URL}/admin/disputes?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to get disputes');
    return response.json();
  },

  getAdminCompanies: async (token: string, search?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    
    const response = await fetch(`${API_BASE_URL}/admin/companies?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to get companies');
    return response.json();
  },

  createCompany: async (token: string, companyData: any) => {
    const response = await fetch(`${API_BASE_URL}/admin/companies`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(companyData)
    });
    if (!response.ok) throw new Error('Failed to create company');
    return response.json();
  },

  updateUserSubscription: async (token: string, userId: string, subscriptionData: any) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/subscription`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(subscriptionData)
    });
    if (!response.ok) throw new Error('Failed to update subscription');
    return response.json();
  },

  approveReview: async (token: string, reviewId: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/reviews/${reviewId}/approve`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to approve review');
    return response.json();
  },

  rejectReview: async (token: string, reviewId: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/reviews/${reviewId}/reject`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to reject review');
    return response.json();
  },

  resolveDispute: async (token: string, disputeId: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/disputes/${disputeId}/resolve`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to resolve dispute');
    return response.json();
  }
};

