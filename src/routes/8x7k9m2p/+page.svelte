<script lang="ts">
  import { auth, authMethods } from '$lib/auth';
  import { apiClient } from '$lib/api';
  import { onMount } from 'svelte';
  import AdminLoginForm from '$lib/components/AdminLoginForm.svelte';
  
  let authState: { user: any; token: string | null; isLoading: boolean; error: string | null } = {
    user: null,
    token: null,
    isLoading: false,
    error: null
  };

  // Subscribe to auth store
  auth.subscribe(state => {
    console.log('Admin page: Auth state changed:', state);
    console.log('Admin page: Token present:', !!state.token);
    console.log('Admin page: User present:', !!state.user);
    console.log('Admin page: User type:', state.user?.user_type);
    
    authState = state;
    
    // Check if user is authenticated and has admin access
    if (state.user && state.token) {
      console.log('Admin page: User authenticated:', state.user);
      console.log('Admin page: Token length:', state.token.length);
      console.log('Admin page: Token preview:', state.token.substring(0, 50) + '...');
      
      // Check if user has admin privileges
      if (state.user.user_type === 'admin') {
        console.log('Admin page: User has admin access - ready to load data');
      } else {
        console.log('Admin page: User does not have admin access - redirecting');
        // Redirect non-admin users to home page
        window.location.href = '/';
      }
    } else if (!state.token) {
      console.log('Admin page: No token - showing login form');
      // User not logged in - stay on page to show login form
    } else if (!state.user) {
      console.log('Admin page: No user data - showing login form');
    }
  });

  onMount(() => {
    console.log('Admin page mounted');
    console.log('Current auth state:', authState);
    
    // Try to recover session if needed
    if (authState.user && authState.user.username === 'Demo User') {
      console.log('Admin page: Detected demo user, attempting to recover session');
      const result = authMethods.recoverSession();
      console.log('Session recovery result:', result);
    }
  });

  // Admin state
  let activeTab = 'dashboard';
  let isLoading = false;
  let showAddCompanyModal = false;
  let showEditCompanyModal = false;
  let showSubscriptionModal = false;
  let showEditUserModal = false;
  let selectedUserId: string | null = null;
  let selectedCompanyId: string | null = null;
  let subscriptionData = {
    tier: 'free',
    comment: '',
    duration: '1',
    isPaid: false
  };
  let editUserData = {
    full_name: '',
    email: '',
    user_type: 'shipper',
    company_name: ''
  };

  // Dashboard data
  let dashboardStats = {
    totalUsers: 0,
    totalCompanies: 0,
    totalReviews: 0,
    pendingDisputes: 0,
    pendingReviews: 0,
    totalRevenue: 0
  };

  // Dynamic data for different sections
  let pendingReviews: any[] = [];
  let disputes: any[] = [];
  let companies: any[] = [];
  let users: any[] = [];
  let recentActivity: any[] = [];
  let analyticsData: any = null;
  let analyticsError: string | null = null;

  // Search and filter states
  let userSearch = '';
  let userTypeFilter = '';
  let companySearch = '';
  let reviewStatusFilter = '';
  let disputeStatusFilter = '';

  // Loading states for different sections
  let dashboardLoading = false;
  let usersLoading = false;
  let reviewsLoading = false;
  let disputesLoading = false;
  let companiesLoading = false;
  let analyticsLoading = false;

  // Auto-refresh interval
  let refreshInterval: number | null = null;
  let lastRefreshTime = new Date();

  // Start auto-refresh when authenticated
  function startAutoRefresh() {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
    
    // Refresh dashboard data every 30 seconds
    refreshInterval = setInterval(() => {
      if (authState.token && authState.user?.user_type === 'admin') {
        console.log('Auto-refreshing dashboard data...');
        lastRefreshTime = new Date();
        
        if (activeTab === 'dashboard') {
          loadDashboardStats();
          loadRecentActivity();
        } else if (activeTab === 'users') {
          loadUsers();
        } else if (activeTab === 'reviews') {
          loadReviews();
        } else if (activeTab === 'disputes') {
          loadDisputes();
        } else if (activeTab === 'companies') {
          loadCompanies();
        } else if (activeTab === 'analytics') {
          loadAnalytics();
        }
      }
    }, 30000); // 30 seconds
  }

  // Stop auto-refresh
  function stopAutoRefresh() {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  }

  // Manual refresh function
  async function refreshCurrentTab() {
    if (!authState.token || authState.user?.user_type !== 'admin') return;
    
    lastRefreshTime = new Date();
    
    switch (activeTab) {
      case 'dashboard':
        await Promise.all([loadDashboardStats(), loadRecentActivity()]);
        break;
      case 'users':
        await loadUsers();
        break;
      case 'reviews':
        await loadReviews();
        break;
      case 'disputes':
        await loadDisputes();
        break;
      case 'companies':
        await loadCompanies();
        break;
      case 'analytics':
        await loadAnalytics();
        break;
    }
  }

  // Test authentication token with backend
  async function testAuthToken() {
    if (!authState.token) {
      console.log('No token to test');
      return false;
    }
    
    try {
      console.log('Testing authentication token...');
      console.log('Token length:', authState.token.length);
      console.log('Token preview:', authState.token.substring(0, 50) + '...');
      
      // Test with a simple health check or try to get user info
      const response = await fetch('https://logiscorebe.onrender.com/health', {
        headers: {
          'Authorization': `Bearer ${authState.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Auth test response status:', response.status);
      console.log('Auth test response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        console.log('✅ Token is valid');
        return true;
      } else {
        console.log('❌ Token validation failed:', response.status, response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Error testing auth token:', error);
      return false;
    }
  }

  // Load dashboard stats
  async function loadDashboardStats() {
    if (!authState.token) {
      console.log('Cannot load dashboard stats: No authentication token');
      return;
    }
    
    // Test authentication first
    const isTokenValid = await testAuthToken();
    if (!isTokenValid) {
      console.error('Authentication token is invalid - clearing auth state');
      auth.update(state => ({ ...state, user: null, token: null }));
      return;
    }
    
    try {
      dashboardLoading = true;
      console.log('Loading dashboard stats with valid token:', authState.token.substring(0, 20) + '...');
      
      const stats = await apiClient.getDashboardStats(authState.token) as any;
      console.log('Dashboard stats received:', stats);
      
      dashboardStats = {
        totalUsers: stats?.total_users || 0,
        totalCompanies: stats?.total_companies || 0,
        totalReviews: stats?.total_reviews || 0,
        pendingDisputes: stats?.pending_disputes || 0,
        pendingReviews: stats?.pending_reviews || 0,
        totalRevenue: stats?.total_revenue || 0
      };
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      
      // Handle specific error types
      if ((error as any).message?.includes('Authentication failed')) {
        console.error('Authentication error - redirecting to login');
        // Clear invalid auth state and show login form
        auth.update(state => ({ ...state, user: null, token: null }));
        return;
      }
      
      // Show user-friendly error message
      if ((error as any).message) {
        console.error('Dashboard Error:', (error as any).message);
      }
    } finally {
      isLoading = false;
    }
  }

  // Load users
  async function loadUsers() {
    if (!authState.token) {
      console.log('Cannot load users: No authentication token');
      return;
    }
    
    try {
      usersLoading = true;
      console.log('Loading users with token:', authState.token.substring(0, 20) + '...');
      users = await apiClient.getAdminUsers(authState.token, userSearch, userTypeFilter) as any[];
    } catch (error) {
      console.error('Failed to load users:', error);
      
      if ((error as any).message?.includes('Authentication failed')) {
        console.error('Authentication error - redirecting to login');
        auth.update(state => ({ ...state, user: null, token: null }));
        return;
      }
    } finally {
      usersLoading = false;
    }
  }

  // Load reviews
  async function loadReviews() {
    if (!authState.token) {
      console.log('Cannot load reviews: No authentication token');
      return;
    }
    
    try {
      reviewsLoading = true;
      console.log('Loading reviews with token:', authState.token.substring(0, 20) + '...');
      pendingReviews = await apiClient.getAdminReviews(authState.token, reviewStatusFilter) as any[];
    } catch (error) {
      console.error('Failed to load reviews:', error);
      
      if ((error as any).message?.includes('Authentication failed')) {
        console.error('Authentication error - redirecting to login');
        auth.update(state => ({ ...state, user: null, token: null }));
        return;
      }
    } finally {
      reviewsLoading = false;
    }
  }

  // Load disputes
  async function loadDisputes() {
    if (!authState.token) {
      console.log('Cannot load disputes: No authentication token');
      return;
    }
    
    try {
      disputesLoading = true;
      console.log('Loading disputes with token:', authState.token.substring(0, 20) + '...');
      disputes = await apiClient.getAdminDisputes(authState.token, disputeStatusFilter) as any[];
    } catch (error) {
      console.error('Failed to load disputes:', error);
      
      if ((error as any).message?.includes('Authentication failed')) {
        console.error('Authentication error - redirecting to login');
        auth.update(state => ({ ...state, user: null, token: null }));
        return;
      }
    } finally {
      disputesLoading = false;
    }
  }

  // Load companies
  async function loadCompanies() {
    if (!authState.token) {
      console.log('Cannot load companies: No authentication token');
      return;
    }
    
    try {
      companiesLoading = true;
      console.log('Loading companies with token:', authState.token.substring(0, 20) + '...');
      
      // Load all companies first (without search filter)
      const allCompanies = await apiClient.getAdminCompanies(authState.token) as any[];
      
      // Apply client-side search filtering for substring search
      if (companySearch && companySearch.trim()) {
        const searchTerm = companySearch.trim().toLowerCase();
        companies = allCompanies.filter(company => 
          company.name && company.name.toLowerCase().includes(searchTerm)
        );
        console.log(`Filtered ${companies.length} companies from ${allCompanies.length} total for search: "${searchTerm}"`);
      } else {
        companies = allCompanies;
      }
    } catch (error) {
      console.error('Failed to load companies:', error);
      
      if ((error as any).message?.includes('Authentication failed')) {
        console.error('Authentication error - redirecting to login');
        auth.update(state => ({ ...state, user: null, token: null }));
        return;
      }
    } finally {
      companiesLoading = false;
    }
  }

  // Load recent activity
  async function loadRecentActivity() {
    if (!authState.token) {
      console.log('Cannot load recent activity: No authentication token');
      return;
    }
    
    try {
      console.log('Loading recent activity with token:', authState.token.substring(0, 20) + '...');
      recentActivity = await apiClient.getRecentActivity(authState.token) as any[];
    } catch (error) {
      console.error('Failed to load recent activity:', error);
      
      if ((error as any).message?.includes('Authentication failed')) {
        console.error('Authentication error - redirecting to login');
        auth.update(state => ({ ...state, user: null, token: null }));
        return;
      }
    }
  }

  // Load analytics data
  async function loadAnalytics() {
    if (!authState.token) return;
    
    try {
      analyticsLoading = true;
      analyticsError = null;
      analyticsData = await apiClient.getAdminAnalytics(authState.token);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      analyticsError = (error as any).message || 'Failed to load analytics data';
      analyticsData = null;
    } finally {
      analyticsLoading = false;
    }
  }

  // Load data when tab changes - only if properly authenticated
  $: if (activeTab === 'dashboard' && authState.token && authState.user?.user_type === 'admin') {
    console.log('Loading dashboard data for admin user');
    loadDashboardStats();
    loadRecentActivity();
  }

  // Start auto-refresh when user is authenticated
  $: if (authState.token && authState.user?.user_type === 'admin') {
    startAutoRefresh();
  } else {
    stopAutoRefresh();
  }

  // Cleanup on component unmount
  onMount(() => {
    console.log('Admin page mounted');
    console.log('Current auth state:', authState);
    
    // Try to recover session if needed
    if (authState.user && authState.user.username === 'Demo User') {
      console.log('Admin page: Detected demo user, attempting to recover session');
      const result = authMethods.recoverSession();
      console.log('Session recovery result:', result);
    }

    // Cleanup function
    return () => {
      stopAutoRefresh();
    };
  });

  $: if (activeTab === 'users' && authState.token && authState.user?.user_type === 'admin') {
    console.log('Loading users data for admin user');
    loadUsers();
  }

  $: if (activeTab === 'reviews' && authState.token && authState.user?.user_type === 'admin') {
    console.log('Loading reviews data for admin user');
    loadReviews();
  }

  $: if (activeTab === 'disputes' && authState.token && authState.user?.user_type === 'admin') {
    console.log('Loading disputes data for admin user');
    loadDisputes();
  }

  $: if (activeTab === 'companies' && authState.token && authState.user?.user_type === 'admin') {
    console.log('Loading companies data for admin user');
    loadCompanies();
  }

  $: if (activeTab === 'analytics' && authState.token && authState.user?.user_type === 'admin') {
    console.log('Loading analytics data for admin user');
    loadAnalytics();
  }

  // Watch for search changes
  $: if (userSearch !== undefined && activeTab === 'users') {
    loadUsers();
  }

  $: if (userTypeFilter !== undefined && activeTab === 'users') {
    loadUsers();
  }

  $: if (companySearch !== undefined && activeTab === 'companies') {
    loadCompanies();
  }

  $: if (reviewStatusFilter !== undefined && activeTab === 'reviews') {
    loadReviews();
  }

  $: if (disputeStatusFilter !== undefined && activeTab === 'disputes') {
    loadDisputes();
  }

  // Company standardization
  let newCompany = {
    name: '',
    website: '',
    logo_url: '',
    description: '',
    headquarters_country: ''
  };

  let editCompanyData = {
    name: '',
    website: '',
    logo_url: '',
    description: '',
    headquarters_country: ''
  };

  // Utility function to format time ago
  function formatTimeAgo(timestamp: string): string {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return `${diffDays} days ago`;
    }
  }



  async function addCompany() {
    if (!authState.token) return;
    
    try {
      await apiClient.createCompany(authState.token, {
        name: newCompany.name,
        website: newCompany.website,
        logo_url: newCompany.logo_url,
        description: newCompany.description,
        headquarters_country: newCompany.headquarters_country
      });
      
      await loadCompanies(); // Reload companies
      newCompany = { name: '', website: '', logo_url: '', description: '', headquarters_country: '' };
    } catch (error) {
      console.error('Failed to add company:', error);
    }
  }

  function openEditCompanyModal(company: any) {
    selectedCompanyId = company.id;
    editCompanyData = {
      name: company.name || '',
      website: company.website || '',
      logo_url: company.logo_url || '',
      description: company.description || '',
      headquarters_country: company.headquarters_country || ''
    };
    showEditCompanyModal = true;
  }

  function closeEditCompanyModal() {
    showEditCompanyModal = false;
    selectedCompanyId = null;
    editCompanyData = { name: '', website: '', logo_url: '', description: '', headquarters_country: '' };
  }

  async function updateCompany() {
    if (!authState.token || !selectedCompanyId) return;
    
    try {
      await apiClient.updateCompany(authState.token, selectedCompanyId, {
        name: editCompanyData.name,
        website: editCompanyData.website,
        logo_url: editCompanyData.logo_url,
        description: editCompanyData.description,
        headquarters_country: editCompanyData.headquarters_country
      });
      
      await loadCompanies(); // Reload companies
      closeEditCompanyModal();
    } catch (error) {
      console.error('Failed to update company:', error);
      alert(`Failed to update company: ${(error as any).message || 'Unknown error'}`);
    }
  }

  function confirmDeleteCompany(company: any) {
    if (confirm(`Are you sure you want to delete "${company.name}"? This action cannot be undone.`)) {
      deleteCompany(company.id);
    }
  }

  async function deleteCompany(companyId: string) {
    if (!authState.token) return;
    
    try {
      await apiClient.deleteCompany(authState.token, companyId);
      await loadCompanies(); // Reload companies
    } catch (error) {
      console.error('Failed to delete company:', error);
      alert(`Failed to delete company: ${(error as any).message || 'Unknown error'}`);
    }
  }

  function openSubscriptionModal(userId: string) {
    selectedUserId = userId;
    showSubscriptionModal = true;
  }

  function closeSubscriptionModal() {
    showSubscriptionModal = false;
    selectedUserId = null;
    subscriptionData = { tier: 'free', comment: '', duration: '1', isPaid: false };
  }

  function openEditUserModal(user: any) {
    selectedUserId = user.id;
    editUserData = {
      full_name: (user.full_name || user.username || '').toString(),
      email: (user.email || '').toString(),
      user_type: (user.user_type || 'shipper').toString(),
      company_name: (user.company_name || '').toString()
    };
    showEditUserModal = true;
  }

  function closeEditUserModal() {
    showEditUserModal = false;
    selectedUserId = null;
    editUserData = { full_name: '', email: '', user_type: 'shipper', company_name: '' };
  }

  async function updateUserSubscription() {
    if (!authState.token || !selectedUserId) return;
    
    try {
      await apiClient.updateUserSubscription(authState.token, selectedUserId, {
        tier: subscriptionData.tier,
        comment: subscriptionData.comment,
        duration: Number(subscriptionData.duration),
        is_paid: subscriptionData.isPaid
      });
      
      await loadUsers(); // Reload users
      closeSubscriptionModal();
    } catch (error) {
      console.error('Failed to update subscription:', error);
    }
  }

  async function updateUserProfile() {
    if (!authState.token || !selectedUserId) {
      return;
    }
    
    // Validate and clean the data before sending to backend
    const userUpdateData: any = {};
    
    // Only include fields that have valid values
    if (editUserData.full_name && editUserData.full_name.trim() !== '') {
      userUpdateData.full_name = editUserData.full_name.trim();
    }
    
    if (editUserData.email && editUserData.email.trim() !== '') {
      userUpdateData.email = editUserData.email.trim();
    }
    
    if (editUserData.user_type && editUserData.user_type.trim() !== '') {
      userUpdateData.user_type = editUserData.user_type.trim();
    }
    
    if (editUserData.company_name && editUserData.company_name.trim() !== '') {
      userUpdateData.company_name = editUserData.company_name.trim();
    }
    
    // Check if we have any data to update
    if (Object.keys(userUpdateData).length === 0) {
      alert('No valid data to update. Please fill in at least one field.');
      return;
    }
    
    try {
      const result = await apiClient.adminUpdateUser(authState.token, selectedUserId, userUpdateData);
      
      await loadUsers(); // Reload users
      closeEditUserModal();
    } catch (error: any) {
      console.error('Failed to update user profile:', error);
      alert(`Failed to update user profile: ${error.message || 'Unknown error'}`);
    }
  }

  async function approveReview(reviewId: string) {
    if (!authState.token) return;
    
    try {
      await apiClient.approveReview(authState.token, reviewId);
      await loadReviews(); // Reload reviews
    } catch (error) {
      console.error('Failed to approve review:', error);
    }
  }

  async function rejectReview(reviewId: string) {
    if (!authState.token) return;
    
    try {
      await apiClient.rejectReview(authState.token, reviewId);
      await loadReviews(); // Reload reviews
    } catch (error) {
      console.error('Failed to reject review:', error);
    }
  }

  async function resolveDispute(disputeId: string) {
    if (!authState.token) return;
    
    try {
      await apiClient.resolveDispute(authState.token, disputeId);
      await loadDisputes(); // Reload disputes
    } catch (error) {
      console.error('Failed to resolve dispute:', error);
    }
  }
</script>

<svelte:head>
  <title>Admin Dashboard - LogiScore</title>
  <meta name="description" content="LogiScore Admin Dashboard - Manage reviews, disputes, users, and company data." />
</svelte:head>

<!-- Admin Dashboard -->
<section class="admin-dashboard">
  <div class="admin-banner">
    <div class="container">
      <!-- Admin Login Form -->
      {#if !authState.token || !authState.user}
        <div class="admin-login-section">
          <AdminLoginForm on:loginSuccess={() => console.log('Admin login successful')} />
        </div>
      {/if}
    </div>
  </div>

  <div class="container">




    <!-- Admin Content - Only show when authenticated -->
    {#if authState.token && authState.user}
      <!-- Tab Navigation -->
      <div class="tab-navigation">
        <button class="tab-button {activeTab === 'dashboard' ? 'active' : ''}" on:click={() => activeTab = 'dashboard'}>
          📊 Dashboard
        </button>
        <button class="tab-button {activeTab === 'reviews' ? 'active' : ''}" on:click={() => activeTab = 'reviews'}>
          📝 Review Management
        </button>
        <button class="tab-button {activeTab === 'disputes' ? 'active' : ''}" on:click={() => activeTab = 'disputes'}>
          ⚖️ Disputes
        </button>
        <button class="tab-button {activeTab === 'companies' ? 'active' : ''}" on:click={() => activeTab = 'companies'}>
          🏢 Company Management
        </button>
        <button class="tab-button {activeTab === 'users' ? 'active' : ''}" on:click={() => activeTab = 'users'}>
          👥 User Management
        </button>
        <button class="tab-button {activeTab === 'analytics' ? 'active' : ''}" on:click={() => activeTab = 'analytics'}>
          📈 Analytics
        </button>
      </div>

      <!-- Dashboard Tab -->
      {#if activeTab === 'dashboard'}
        <div class="dashboard-content">
          <div class="dashboard-header">
            <h2>Dashboard Overview</h2>
            <div class="dashboard-actions">
              <div class="refresh-info">
                <span class="last-refresh">Last updated: {lastRefreshTime.toLocaleTimeString()}</span>
                <span class="auto-refresh-status">🔄 Auto-refresh: ON</span>
              </div>
              <div class="action-buttons">
                <button class="btn-test-auth" on:click={testAuthToken}>
                  🔐 Test Auth
                </button>
                <button class="btn-refresh" on:click={refreshCurrentTab}>
                  🔄 Refresh Now
                </button>
              </div>
            </div>
          </div>
          
          <!-- Authentication Status Check -->
          {#if !authState.user || authState.user.user_type !== 'admin'}
            <div class="auth-warning">
              <div class="warning-icon">⚠️</div>
              <h3>Authentication Required</h3>
              <p>Please log in with admin credentials to view dashboard data.</p>
            </div>
          {:else}
          <div class="stats-grid">
            {#if dashboardLoading}
              {#each Array(6) as _, i}
                <div class="stat-card loading">
                  <div class="stat-skeleton"></div>
                </div>
              {/each}
            {:else}
              <div class="stat-card">
                <h3>Total Users</h3>
                <div class="stat-number">{dashboardStats.totalUsers.toLocaleString()}</div>
              </div>
              <div class="stat-card">
                <h3>Total Companies</h3>
                <div class="stat-number">{dashboardStats.totalCompanies}</div>
              </div>
              <div class="stat-card">
                <h3>Total Reviews</h3>
                <div class="stat-number">{dashboardStats.totalReviews.toLocaleString()}</div>
              </div>
              <div class="stat-card">
                <h3>Pending Disputes</h3>
                <div class="stat-number warning">{dashboardStats.pendingDisputes}</div>
              </div>
              <div class="stat-card">
                <h3>Pending Reviews</h3>
                <div class="stat-number warning">{dashboardStats.pendingReviews}</div>
              </div>
              <div class="stat-card">
                <h3>Monthly Revenue</h3>
                <div class="stat-number">${dashboardStats.totalRevenue.toLocaleString()}</div>
              </div>
            {/if}
          </div>

          <div class="recent-activity">
            <h2>Recent Activity</h2>
            <div class="activity-list">
              {#if recentActivity.length > 0}
                {#each recentActivity as activity}
                  <div class="activity-item">
                    <span class="activity-time">{formatTimeAgo(activity.timestamp)}</span>
                    <span class="activity-text">{activity.message}</span>
                  </div>
                {/each}
              {:else}
                <div class="activity-item">
                  <span class="activity-text">No recent activity</span>
                </div>
              {/if}
            </div>
          </div>
          {/if}
        </div>
      {/if}

      <!-- Review Management Tab -->
      {#if activeTab === 'reviews'}
        <div class="reviews-content">
          <div class="reviews-header">
            <h2>Review Management</h2>
            <button class="btn-refresh" on:click={refreshCurrentTab}>🔄 Refresh</button>
          </div>
          
          {#if reviewsLoading}
            <div class="loading-placeholder">Loading reviews...</div>
          {:else if pendingReviews.length > 0}
            <div class="reviews-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Company</th>
                    <th>Branch</th>
                    <th>Reviewer</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {#each pendingReviews as review}
                    <tr>
                      <td>{review.id}</td>
                      <td>{review.freight_forwarder_name}</td>
                      <td>{review.branch_name || 'N/A'}</td>
                      <td>{review.reviewer_name}</td>
                      <td><span class="status {review.status.toLowerCase()}">{review.status}</span></td>
                      <td>{new Date(review.created_at).toLocaleDateString()}</td>
                      <td>
                        <button class="btn-approve" on:click={() => approveReview(review.id)}>Approve</button>
                        <button class="btn-reject" on:click={() => rejectReview(review.id)}>Reject</button>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {:else}
            <div class="empty-state">
              <div class="empty-icon">📝</div>
              <h3>No Pending Reviews</h3>
              <p>All reviews have been processed or there are no pending reviews at the moment.</p>
            </div>
          {/if}
        </div>
      {/if}

      <!-- Disputes Tab -->
      {#if activeTab === 'disputes'}
        <div class="disputes-content">
          <div class="disputes-header">
            <h2>Dispute Resolution</h2>
            <button class="btn-refresh" on:click={refreshCurrentTab}>🔄 Refresh</button>
          </div>
          
          {#if disputesLoading}
            <div class="loading-placeholder">Loading disputes...</div>
          {:else if disputes.length > 0}
            <div class="disputes-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Company</th>
                    <th>Issue</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                  {#each disputes as dispute}
                    <tr>
                      <td>{dispute.id}</td>
                      <td>{dispute.freight_forwarder_name}</td>
                      <td>{dispute.issue}</td>
                      <td><span class="status {dispute.status.toLowerCase().replace(' ', '-')}">{dispute.status}</span></td>
                      <td>{new Date(dispute.created_at).toLocaleDateString()}</td>
                      <td>
                        <button class="btn-primary" on:click={() => resolveDispute(dispute.id)}>Resolve</button>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {:else}
            <div class="empty-state">
              <div class="empty-icon">⚖️</div>
              <h3>No Active Disputes</h3>
              <p>All disputes have been resolved or there are no active disputes at the moment.</p>
            </div>
          {/if}
        </div>
      {/if}

      <!-- Company Management Tab -->
      {#if activeTab === 'companies'}
        <div class="companies-content">
          <div class="companies-header">
            <h2>Company Management</h2>
            <div class="header-actions">
              <button class="btn-refresh" on:click={refreshCurrentTab}>🔄 Refresh</button>
              <button class="btn-primary" on:click={() => showAddCompanyModal = true}>Add Company</button>
            </div>
          </div>



          <!-- Company Search -->
          <div class="company-search">
            <div class="search-container">
              <input 
                type="text" 
                placeholder="Search companies by name..." 
                class="search-input" 
                bind:value={companySearch}
              />
              {#if companySearch && companySearch.trim()}
                <div class="search-results">
                  Found {companies.length} company{companies.length !== 1 ? 'ies' : 'y'}
                </div>
              {/if}
            </div>
          </div>

          <!-- Companies Table -->
          {#if companiesLoading}
            <div class="loading-placeholder">Loading companies...</div>
          {:else if companies.length > 0}
            <div class="companies-table">
              <table>
                <thead>
                  <tr>
                    <th>Logo</th>
                    <th>Company Name</th>
                    <th>Website</th>
                    <th>Headquarters</th>
                    <th>Description</th>
                    <th>Reviews</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {#each companies as company}
                    <tr>
                      <td>
                        {#if company.logo_url}
                          <img src={company.logo_url} alt="{company.name} logo" class="company-logo" />
                        {:else}
                          <div class="logo-placeholder">No Logo</div>
                        {/if}
                      </td>
                      <td>{company.name}</td>
                      <td>
                        {#if company.website}
                          <a href={company.website} target="_blank" rel="noopener noreferrer" class="website-link">
                            {company.website}
                          </a>
                        {:else}
                          <span class="no-data">-</span>
                        {/if}
                      </td>
                      <td>
                        {#if company.headquarters_country}
                          <span class="headquarters">📍 {company.headquarters_country}</span>
                        {:else}
                          <span class="no-data">-</span>
                        {/if}
                      </td>
                      <td>
                        {#if company.description}
                          <div class="description-cell" title={company.description}>
                            {company.description.length > 50 ? company.description.substring(0, 50) + '...' : company.description}
                          </div>
                        {:else}
                          <span class="no-data">-</span>
                        {/if}
                      </td>
                      <td>{company.reviews_count}</td>
                      <td><span class="status {company.status.toLowerCase()}">{company.status}</span></td>
                      <td>
                        <button class="btn-secondary" on:click={() => openEditCompanyModal(company)}>Edit</button>
                        <button class="btn-danger" on:click={() => confirmDeleteCompany(company)}>Delete</button>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {:else}
            <div class="empty-state">
              <div class="empty-icon">🏢</div>
              <h3>No Companies Found</h3>
              <p>No companies match your search criteria or there are no companies in the system yet.</p>
            </div>
          {/if}
        </div>
      {/if}

      <!-- User Management Tab -->
      {#if activeTab === 'users'}
        <div class="users-content">
          <div class="users-header">
            <h2>User Management</h2>
            <button class="btn-refresh" on:click={refreshCurrentTab}>🔄 Refresh</button>
          </div>
          <div class="users-filters">
            <input 
              type="text" 
              placeholder="Search users..." 
              class="search-input" 
              bind:value={userSearch}
            />
            <select class="filter-select" bind:value={userTypeFilter}>
              <option value="">All Roles</option>
              <option value="shipper">Shippers</option>
              <option value="forwarder">Forwarders</option>
              <option value="admin">Admins</option>
            </select>
          </div>
          {#if usersLoading}
            <div class="loading-placeholder">Loading users...</div>
          {:else if users.length > 0}
            <div class="users-table">
              <table>
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Company Name</th>
                    <th>Subscription</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {#each users as user}
                    <tr>
                      <td>{user.id}</td>
                      <td>{user.full_name || user.username || 'N/A'}</td>
                      <td>{user.email}</td>
                      <td>{user.user_type}</td>
                      <td>{user.company_name || 'N/A'}</td>
                      <td><span class="subscription {user.subscription_tier}">{user.subscription_tier}</span></td>
                      <td><span class="status {user.is_active ? 'active' : 'inactive'}">{user.is_active ? 'Active' : 'Inactive'}</span></td>
                      <td>
                        <button class="btn-secondary" on:click={() => openEditUserModal(user)}>Edit</button>
                        <button class="btn-secondary">Suspend</button>
                        <button class="btn-primary" on:click={() => openSubscriptionModal(user.id)}>Manage Subscription</button>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {:else}
            <div class="empty-state">
              <div class="empty-icon">👥</div>
              <h3>No Users Found</h3>
              <p>No users match your search criteria or there are no users in the system yet.</p>
            </div>
          {/if}
        </div>
      {/if}

      <!-- Analytics Tab -->
      {#if activeTab === 'analytics'}
        <div class="analytics-content">
          <div class="analytics-header">
            <h2>Platform Analytics</h2>
            <button class="btn-refresh" on:click={refreshCurrentTab}>🔄 Refresh</button>
          </div>
          {#if analyticsData}
            <div class="analytics-grid">
              <div class="analytics-card">
                <h3>Review Growth</h3>
                <div class="chart-data">
                  <div class="chart-labels">
                    {#each analyticsData.review_growth.labels as label}
                      <span class="chart-label">{label}</span>
                    {/each}
                  </div>
                  <div class="chart-values">
                    {#each analyticsData.review_growth.data as value}
                      <div class="chart-bar" style="height: {value / 2}px;">
                        <span class="chart-value">{value}</span>
                      </div>
                    {/each}
                  </div>
                </div>
              </div>
              <div class="analytics-card">
                <h3>User Engagement</h3>
                <div class="chart-data">
                  <div class="chart-labels">
                    {#each analyticsData.user_engagement.labels as label}
                      <span class="chart-label">{label}</span>
                    {/each}
                  </div>
                  <div class="chart-values">
                    {#each analyticsData.user_engagement.data as value}
                      <div class="chart-bar" style="height: {value / 20}px;">
                        <span class="chart-value">{value.toLocaleString()}</span>
                      </div>
                    {/each}
                  </div>
                </div>
              </div>
              <div class="analytics-card">
                <h3>Revenue Metrics</h3>
                <div class="chart-data">
                  <div class="chart-labels">
                    {#each analyticsData.revenue_metrics.labels as label}
                      <span class="chart-label">{label}</span>
                    {/each}
                  </div>
                  <div class="chart-values">
                    {#each analyticsData.revenue_metrics.data as value}
                      <div class="chart-bar" style="height: {value / 50}px;">
                        <span class="chart-value">${value.toLocaleString()}</span>
                      </div>
                    {/each}
                  </div>
                </div>
              </div>
              <div class="analytics-card">
                <h3>Top Companies</h3>
                <div class="top-companies-list">
                  {#each analyticsData.top_companies as company}
                    <div class="company-stat">
                      <span class="company-name">{company.name}</span>
                      <span class="company-reviews">{company.reviews} reviews</span>
                      <span class="company-rating">⭐ {company.rating}</span>
                    </div>
                  {/each}
                </div>
              </div>
            </div>
          {:else if analyticsLoading}
            <div class="loading-placeholder">Loading analytics data...</div>
          {:else if analyticsError}
            <div class="analytics-error">
              <div class="error-icon">⚠️</div>
              <h3>Analytics Data Unavailable</h3>
              <p>{analyticsError}</p>
              <button class="btn-retry" on:click={loadAnalytics}>🔄 Retry</button>
            </div>
          {:else}
            <div class="empty-state">
              <div class="empty-icon">📈</div>
              <h3>No Analytics Data</h3>
              <p>Analytics data is not available at the moment. Please try refreshing later.</p>
            </div>
          {/if}
        </div>
      {/if}
    {/if}
  </div>
</section>

<!-- Subscription Management Modal -->
{#if showSubscriptionModal}
  <div class="modal-overlay" on:click={closeSubscriptionModal}>
    <div class="modal-content" on:click|stopPropagation>
      <div class="modal-header">
        <h2>Manage User Subscription</h2>
        <button class="close-btn" on:click={closeSubscriptionModal}>&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="form-group">
          <label for="subscription-tier">Subscription Tier:</label>
          <select id="subscription-tier" bind:value={subscriptionData.tier}>
            <option value="free">Free</option>
            <option value="premium">Premium</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="subscription-duration">Duration (months):</label>
          <input type="number" id="subscription-duration" bind:value={subscriptionData.duration} min="1" max="12" />
        </div>
        
        <div class="form-group">
          <label>
            <input type="checkbox" bind:checked={subscriptionData.isPaid} />
            Paid Subscription
          </label>
        </div>
        
        <div class="form-group">
          <label for="subscription-comment">Comment:</label>
          <textarea 
            id="subscription-comment" 
            bind:value={subscriptionData.comment}
            placeholder={subscriptionData.isPaid ? 
              `Paid subscription for ${subscriptionData.duration} month${Number(subscriptionData.duration) > 1 ? 's' : ''} - ` : 
              `Free subscription for ${subscriptionData.duration} month${Number(subscriptionData.duration) > 1 ? 's' : ''} - `}
            rows="3"
          ></textarea>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn-secondary" on:click={closeSubscriptionModal}>Cancel</button>
        <button class="btn-primary" on:click={updateUserSubscription}>Update Subscription</button>
      </div>
    </div>
  </div>
{/if}

<!-- Edit Company Modal -->
{#if showEditCompanyModal}
  <div class="modal-overlay" on:click={closeEditCompanyModal}>
    <div class="modal-content" on:click|stopPropagation>
      <div class="modal-header">
        <h2>Edit Company</h2>
        <button class="close-btn" on:click={closeEditCompanyModal}>&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="form-group">
          <label for="edit-company-name">Company Name:</label>
          <input 
            type="text" 
            id="edit-company-name" 
            bind:value={editCompanyData.name}
            placeholder="Enter company name"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="edit-company-website">Website:</label>
          <input 
            type="url" 
            id="edit-company-website" 
            bind:value={editCompanyData.website}
            placeholder="Enter website URL"
          />
        </div>
        
        <div class="form-group">
          <label for="edit-company-logo">Logo URL:</label>
          <input 
            type="url" 
            id="edit-company-logo" 
            bind:value={editCompanyData.logo_url}
            placeholder="Enter logo URL"
          />
        </div>
        
        <div class="form-group">
          <label for="edit-company-description">Description:</label>
          <textarea 
            id="edit-company-description" 
            bind:value={editCompanyData.description}
            placeholder="Enter company description"
            rows="3"
          ></textarea>
        </div>
        
        <div class="form-group">
          <label for="edit-company-headquarters">Headquarters Country:</label>
          <input 
            type="text" 
            id="edit-company-headquarters" 
            bind:value={editCompanyData.headquarters_country}
            placeholder="Enter headquarters country"
          />
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn-secondary" on:click={closeEditCompanyModal}>Cancel</button>
        <button class="btn-primary" on:click={updateCompany}>Update Company</button>
      </div>
    </div>
  </div>
{/if}

<!-- Add Company Modal -->
{#if showAddCompanyModal}
  <div class="modal-overlay" on:click={() => showAddCompanyModal = false}>
    <div class="modal-content" on:click|stopPropagation>
      <div class="modal-header">
        <h2>Add New Company</h2>
        <button class="close-btn" on:click={() => showAddCompanyModal = false}>&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="form-group">
          <label for="new-company-name">Company Name: *</label>
          <input 
            type="text" 
            id="new-company-name" 
            bind:value={newCompany.name}
            placeholder="Enter company name"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="new-company-website">Website:</label>
          <input 
            type="url" 
            id="new-company-website" 
            bind:value={newCompany.website}
            placeholder="https://example.com"
          />
        </div>
        
        <div class="form-group">
          <label for="new-company-logo">Logo URL:</label>
          <input 
            type="url" 
            id="new-company-logo" 
            bind:value={newCompany.logo_url}
            placeholder="https://example.com/logo.png"
          />
        </div>
        
        <div class="form-group">
          <label for="new-company-description">Description:</label>
          <textarea 
            id="new-company-description" 
            bind:value={newCompany.description}
            placeholder="Enter company description"
            rows="3"
          ></textarea>
        </div>
        
        <div class="form-group">
          <label for="new-company-headquarters">Headquarters Country:</label>
          <input 
            type="text" 
            id="new-company-headquarters" 
            bind:value={newCompany.headquarters_country}
            placeholder="e.g., United States, Germany, Singapore"
          />
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn-secondary" on:click={() => showAddCompanyModal = false}>Cancel</button>
        <button class="btn-primary" on:click={addCompany} disabled={!newCompany.name.trim()}>Add Company</button>
      </div>
    </div>
  </div>
{/if}

<!-- Edit User Modal -->
{#if showEditUserModal}
  <div class="modal-overlay" on:click={closeEditUserModal}>
    <div class="modal-content" on:click|stopPropagation>
      <div class="modal-header">
        <h2>Edit User Profile</h2>
        <button class="close-btn" on:click={closeEditUserModal}>&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="form-group">
          <label for="edit-full-name">Full Name:</label>
          <input 
            type="text" 
            id="edit-full-name" 
            bind:value={editUserData.full_name}
            placeholder="Enter full name"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="edit-email">Email Address:</label>
          <input 
            type="email" 
            id="edit-email" 
            bind:value={editUserData.email}
            placeholder="Enter email address"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="edit-user-type">User Type:</label>
          <select id="edit-user-type" bind:value={editUserData.user_type}>
            <option value="shipper">Shipper</option>
            <option value="forwarder">Freight Forwarder</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="edit-company-name">Company Name:</label>
          <input 
            type="text" 
            id="edit-company-name" 
            bind:value={editUserData.company_name}
            placeholder="Enter company name (optional)"
          />
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn-secondary" on:click={closeEditUserModal}>Cancel</button>
        <button class="btn-primary" on:click={updateUserProfile}>Update Profile</button>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Global Styles */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    line-height: 1.6;
    color: #333;
    font-weight: 400;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  /* Admin Dashboard */
  .admin-dashboard {
    padding: 0;
    background: #f8f9fa;
    min-height: calc(100vh - 200px);
  }

  /* Authentication Warning */
  .auth-warning {
    background: #fff3cd;
    border: 2px solid #ffc107;
    border-radius: 12px;
    padding: 40px;
    text-align: center;
    margin: 40px 0;
    box-shadow: 0 2px 10px rgba(255, 193, 7, 0.2);
  }

  .warning-icon {
    font-size: 3rem;
    margin-bottom: 20px;
  }

  .auth-warning h3 {
    color: #856404;
    margin-bottom: 15px;
    font-size: 1.5rem;
  }

  .auth-warning p {
    color: #856404;
    font-size: 1.1rem;
    margin: 0;
  }

  .admin-banner {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    padding: 80px 0;
    text-align: center;
    margin-bottom: 40px;
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
  }





  .admin-login-section {
    margin-top: 2rem;
    display: flex;
    justify-content: center;
  }

  /* Tab Navigation */
  .tab-navigation {
    display: flex;
    gap: 10px;
    margin-bottom: 30px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .tab-button {
    padding: 15px 25px;
    border: none;
    background: white;
    color: #666;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    font-size: 0.95rem;
  }

  .tab-button:hover {
    background: #f0f0f0;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .tab-button.active {
    background: #667eea;
    color: white;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  }



  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 1;
    }
  }

  /* Dashboard Stats */
  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
  }

  .dashboard-header h2 {
    margin: 0;
    color: #333;
  }

  .dashboard-actions {
    display: flex;
    flex-direction: column;
    gap: 15px;
    align-items: flex-end;
  }

  .refresh-info {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 5px;
    font-size: 0.85rem;
    color: #666;
  }

  .last-refresh {
    font-weight: 500;
  }

  .auto-refresh-status {
    color: #28a745;
    font-weight: 600;
  }

  .action-buttons {
    display: flex;
    gap: 10px;
  }

  .btn-test-auth {
    background: #17a2b8;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .btn-test-auth:hover {
    background: #138496;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(23, 162, 184, 0.3);
  }

  .btn-refresh {
    background: #28a745;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .btn-refresh:hover {
    background: #218838;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
  }

  .stat-card {
    background: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    text-align: center;
    border-left: 4px solid #667eea;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  }

  .stat-card.loading {
    pointer-events: none;
  }

  .stat-skeleton {
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: 8px;
  }

  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  .stat-card h3 {
    font-size: 1rem;
    color: #666;
    margin-bottom: 10px;
  }

  .stat-number {
    font-size: 2.5rem;
    font-weight: 800;
    color: #333;
  }

  .stat-number.warning {
    color: #ff6b35;
  }

  /* Recent Activity */
  .recent-activity {
    background: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }

  .recent-activity h2 {
    margin-bottom: 20px;
    color: #333;
  }

  .activity-item {
    display: flex;
    justify-content: space-between;
    padding: 15px 0;
    border-bottom: 1px solid #eee;
  }

  .activity-time {
    color: #666;
    font-size: 0.9rem;
  }

  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }

  th, td {
    padding: 15px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }

  th {
    background: #f8f9fa;
    font-weight: 600;
    color: #333;
  }

  .status {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 500;
  }

  .status.pending {
    background: #fff3cd;
    color: #856404;
  }

  .status.flagged {
    background: #f8d7da;
    color: #721c24;
  }

  .status.active {
    background: #d4edda;
    color: #155724;
  }

  .status.open {
    background: #cce5ff;
    color: #004085;
  }

  .status.under-review {
    background: #fff3cd;
    color: #856404;
  }

  /* Buttons */
  .btn-approve {
    background: #28a745;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    margin-right: 5px;
  }

  .btn-reject {
    background: #dc3545;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
  }

  .btn-danger {
    background: #dc3545;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    margin-left: 5px;
  }

  .btn-danger:hover {
    background: #c82333;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
  }

  /* Tab Headers */
  .reviews-header,
  .disputes-header,
  .users-header,
  .analytics-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
  }

  .header-actions {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  /* Company Management */
  .companies-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
  }

  .company-search {
    margin-bottom: 20px;
  }

  .search-container {
    display: flex;
    align-items: center;
    gap: 15px;
    flex-wrap: wrap;
  }

  .company-search .search-input {
    width: 100%;
    max-width: 400px;
    padding: 12px 16px;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.3s, box-shadow 0.3s;
  }

  .company-search .search-input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .company-search .search-input::placeholder {
    color: #999;
  }

  .search-results {
    color: #666;
    font-size: 0.9rem;
    font-weight: 500;
    padding: 8px 12px;
    background: #f8f9fa;
    border-radius: 6px;
    border-left: 3px solid #667eea;
  }

  .help-text {
    font-size: 0.85rem;
    color: #666;
    margin-top: 5px;
  }

  .company-logo {
    width: 40px;
    height: 40px;
    object-fit: contain;
    border-radius: 4px;
  }

  .logo-placeholder {
    width: 40px;
    height: 40px;
    background: #f8f9fa;
    border: 1px solid #ddd;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    color: #666;
  }

  .website-link {
    color: #007bff;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.3s;
  }

  .website-link:hover {
    color: #0056b3;
    text-decoration: underline;
  }

  .headquarters {
    font-weight: 500;
    color: #333;
  }

  .description-cell {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.9rem;
    color: #666;
  }

  .no-data {
    color: #999;
    font-style: italic;
  }

  /* User Management */
  .users-filters {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
  }

  .search-input, .filter-select {
    padding: 10px;
    border: 2px solid #e9ecef;
    border-radius: 6px;
    font-size: 1rem;
  }

  .search-input {
    flex: 1;
  }

  /* Subscription Status Badges */
  .subscription {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .subscription.free {
    background: #e3f2fd;
    color: #1976d2;
  }

  .subscription.premium {
    background: #fff3e0;
    color: #f57c00;
  }

  .subscription.enterprise {
    background: #e8f5e8;
    color: #388e3c;
  }

  /* Subscription Modal */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #e9ecef;
  }

  .modal-header h2 {
    margin: 0;
    color: #333;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
  }

  .modal-body {
    padding: 20px;
  }

  .modal-footer {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    padding: 20px;
    border-top: 1px solid #e9ecef;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #333;
  }

  .form-group input,
  .form-group select,
  .form-group textarea {
    width: 100%;
    padding: 12px;
    border: 2px solid #e9ecef;
    border-radius: 6px;
    font-size: 1rem;
  }

  .form-group textarea {
    resize: vertical;
    min-height: 80px;
  }

  .form-group input[type="checkbox"] {
    width: auto;
    margin-right: 8px;
  }

  /* Analytics */
  .analytics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
  }

  .analytics-card {
    background: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }

  .analytics-card h3 {
    margin-bottom: 20px;
    color: #333;
  }

  .chart-placeholder {
    height: 200px;
    background: #f8f9fa;
    border: 2px dashed #ddd;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    font-size: 1.2rem;
  }

  .chart-data {
    height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .chart-labels {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .chart-label {
    font-size: 0.8rem;
    color: #666;
    flex: 1;
    text-align: center;
  }

  .chart-values {
    display: flex;
    align-items: end;
    justify-content: space-between;
    height: 120px;
    gap: 5px;
  }

  .chart-bar {
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: 4px 4px 0 0;
    min-width: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    transition: all 0.3s ease;
  }

  .chart-bar:hover {
    transform: scaleY(1.1);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  .chart-value {
    color: white;
    font-size: 0.7rem;
    font-weight: 600;
    position: absolute;
    top: -25px;
    white-space: nowrap;
  }

  .top-companies-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .company-stat {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 8px;
    border-left: 4px solid #667eea;
  }

  .company-name {
    font-weight: 600;
    color: #333;
    flex: 1;
  }

  .company-reviews {
    color: #666;
    font-size: 0.9rem;
    margin: 0 15px;
  }

  .company-rating {
    color: #f57c00;
    font-weight: 600;
  }

  .loading-placeholder {
    height: 200px;
    background: #f8f9fa;
    border: 2px dashed #ddd;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    font-size: 1.2rem;
    animation: pulse 2s infinite;
  }

  .empty-state {
    height: 300px;
    background: #f8f9fa;
    border: 2px dashed #ddd;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #666;
    text-align: center;
    padding: 40px;
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 20px;
    opacity: 0.6;
  }

  .empty-state h3 {
    color: #333;
    margin-bottom: 10px;
    font-size: 1.3rem;
  }

  .empty-state p {
    color: #666;
    font-size: 1rem;
    max-width: 400px;
    line-height: 1.5;
  }

  .analytics-error {
    height: 200px;
    background: #fff5f5;
    border: 2px dashed #f56565;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #c53030;
    text-align: center;
    padding: 20px;
  }

  .error-icon {
    font-size: 2rem;
    margin-bottom: 10px;
  }

  .analytics-error h3 {
    margin: 0 0 10px 0;
    color: #c53030;
  }

  .analytics-error p {
    margin: 0 0 15px 0;
    color: #742a2a;
    font-size: 0.9rem;
  }

  .btn-retry {
    background: #3182ce;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s;
  }

  .btn-retry:hover {
    background: #2c5aa0;
    transform: translateY(-1px);
  }

  /* Feature Notice */
  .feature-notice {
    background: #fff3cd;
    border: 1px solid #ffc107;
    border-radius: 6px;
    padding: 10px;
    margin-top: 15px;
    text-align: center;
    color: #856404;
    font-size: 0.9rem;
    font-weight: 500;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .nav-menu {
      display: none;
    }



    .tab-navigation {
      flex-direction: column;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .companies-header {
      flex-direction: column;
      gap: 15px;
    }

    .users-filters {
      flex-direction: column;
    }

    .analytics-grid {
      grid-template-columns: 1fr;
    }
  }
</style> 