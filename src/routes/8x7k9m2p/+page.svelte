<script lang="ts">
  import { auth, authMethods } from '$lib/auth';
  import { apiClient } from '$lib/api';
  import { onMount } from 'svelte';
  import AdminLoginForm from '$lib/components/AdminLoginForm.svelte';
  import TrialReminderTest from '$lib/components/TrialReminderTest.svelte';
  
  let authState: { user: any; token: string | null; isLoading: boolean; error: string | null } = {
    user: null,
    token: null,
    isLoading: false,
    error: null
  };

  // Subscribe to auth store
  auth.subscribe(state => {
    authState = state;
    
    // Check if user is authenticated and has admin access
    if (state.user && state.token) {
      // Check if user has admin privileges
      if (state.user.user_type === 'admin') {
        // User has admin access - ready to load data
      } else {
        // Redirect non-admin users to home page
        window.location.href = '/';
      }
    } else if (!state.token) {
      // User not logged in - stay on page to show login form
    } else if (!state.user) {
      // No user data - showing login form
    }
  });

  onMount(() => {
    // Initialize admin page
    console.log('Admin page initialized');

    // Cleanup function
    return () => {
      stopAutoRefresh();
      if (userSearchTimeout) {
        clearTimeout(userSearchTimeout);
      }
    };
  });

  // Global error handler
  function handleGlobalError(error: ErrorEvent) {
    // Prevent default error handling for known issues
    if (error.message?.includes('ResizeObserver') || 
        error.message?.includes('Source Map') ||
        error.message?.includes('favicon')) {
      error.preventDefault();
      return;
    }
    
    // Show user-friendly error for other issues
    addNotification('error', 'An unexpected error occurred. Please refresh the page.');
  }

  // Add global error listener
  onMount(() => {
    window.addEventListener('error', handleGlobalError);
    
    return () => {
      window.removeEventListener('error', handleGlobalError);
    };
  });

  // Admin state
  let activeTab = 'dashboard';
  let isLoading = false;
  let showAddCompanyModal = false;
  let showEditCompanyModal = false;
  let showSubscriptionModal = false;
  let showEditUserModal = false;
  let selectedUserId: string | null = null;
  let selectedUser: any = null;
  let selectedCompanyId: string | null = null;
  let subscriptionData = {
    tier: 'free',
    comment: '',
    duration: '1',
    isPaid: false
  };

  // Promotion system state
  let promotionConfig = {
    isActive: true,
    maxRewardsPerUser: 3,
    rewardMonths: 1,
    description: 'Get 1 month free subscription for each review submitted (max 3 months)'
  };
  let userRewards: any[] = [];
  let promotionStats = {
    totalRewardsGiven: 0,
    activeUsers: 0,
    totalMonthsAwarded: 0
  };
  let editUserData = {
    full_name: '',
    email: '',
    user_type: 'shipper',
    company_name: ''
  };

  // Notification system
  let notifications: Array<{id: string; type: 'success' | 'error' | 'info' | 'warning'; message: string; timestamp: Date}> = [];
  let notificationId = 0;

  // Company update loading state
  let isUpdatingCompany = false;

  // Dashboard data
  let dashboardStats = {
    totalUsers: 0,
    totalCompanies: 0,
    totalReviews: 0,
    pendingDisputes: 0,
    pendingReviews: 0,
    totalRevenue: 0
  };
  
  // Dashboard error states
  let dashboardError: string | null = null;
  let recentActivityError: string | null = null;

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
  
  // Debounce timers
  let userSearchTimeout: number | null = null;

  // Debounced search function
  function debouncedUserSearch() {
    if (userSearchTimeout) {
      clearTimeout(userSearchTimeout);
    }
    userSearchTimeout = setTimeout(() => {
      if (activeTab === 'users' && authState.token && authState.user?.user_type === 'admin') {
        loadUsers();
      }
    }, 500); // 500ms debounce for search
  }

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
        } else if (activeTab === 'promotions') {
          loadPromotionData();
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

    // Clear any existing errors when refreshing
    dashboardError = null;
    recentActivityError = null;
    
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
      case 'promotions':
        await loadPromotionData();
        break;
    }
  }

  // Promotion management functions
  async function togglePromotion() {
    if (!authState.token || authState.user?.user_type !== 'admin') return;
    
    try {
      promotionConfig.isActive = !promotionConfig.isActive;
      
      // Update promotion status in backend
      await apiClient.updatePromotionConfig(authState.token, {
        isActive: promotionConfig.isActive,
        maxRewardsPerUser: promotionConfig.maxRewardsPerUser,
        rewardMonths: promotionConfig.rewardMonths
      });
      
      addNotification('success', `Promotion ${promotionConfig.isActive ? 'activated' : 'deactivated'} successfully`);
      
      // Refresh promotion data
      if (activeTab === 'promotions') {
        loadPromotionData();
      }
    } catch (error) {

      addNotification('error', 'Failed to update promotion status');
      // Revert the change
      promotionConfig.isActive = !promotionConfig.isActive;
    }
  }

  async function loadPromotionData() {
    if (!authState.token || authState.user?.user_type !== 'admin') return;
    
    try {
      // Load promotion configuration
      const config = await apiClient.getPromotionConfig(authState.token);
      promotionConfig = { ...promotionConfig, ...config };
      
      // Load user rewards
      userRewards = await apiClient.getUserRewards(authState.token);
      
      // Load promotion statistics
      promotionStats = await apiClient.getPromotionStats(authState.token);
    } catch (error) {

      addNotification('error', 'Failed to load promotion data');
    }
  }

  async function awardUserReward(userId: string, reviewId: string) {
    if (!authState.token || authState.user?.user_type !== 'admin') return;
    
    try {
      const result = await apiClient.awardUserReward(authState.token, userId, reviewId, promotionConfig.rewardMonths);
      
      if (result.success) {
        addNotification('success', `Awarded ${promotionConfig.rewardMonths} month(s) to user`);
        
        // Send reward notification email
        try {
          // Find user details for email
          const user = users.find(u => u.id === userId);
          if (user) {
            const emailResult = await apiClient.sendRewardNotificationEmail(
              user.email,
              user.full_name || user.username,
              promotionConfig.rewardMonths,
              (userRewards.filter(r => r.user_id === userId).length || 0) + 1,
              promotionConfig.maxRewardsPerUser
            );
            
            if (emailResult.success) {
              addNotification('success', 'Reward notification email sent to user');
            } else {
              addNotification('warning', `Reward awarded but email notification failed: ${emailResult.message}`);
            }
          }
        } catch (emailError) {

          addNotification('warning', 'Reward awarded but email notification failed');
        }
        
        // Refresh promotion data
        await loadPromotionData();
      } else {
        addNotification('error', result.message || 'Failed to award user');
      }
    } catch (error) {

      addNotification('error', 'Failed to award user reward');
    }
  }

  // Test authentication token with backend
  async function testAuthToken() {
    if (!authState.token) {
      console.log('No auth token available for testing');
      return false;
    }
    
    try {
      console.log('Testing auth token with backend...');

      
      // Test with a simple health check or try to get user info
      const response = await fetch('https://logiscorebe.onrender.com/health', {
        headers: {
          'Authorization': `Bearer ${authState.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Auth token test response:', {
        status: response.status,
        ok: response.ok
      });
      
      if (response.ok) {
        console.log('Auth token is valid');
        return true;
      } else {
        console.log('Auth token test failed:', response.status);
        return false;
      }
    } catch (error) {
      console.log('Error testing auth token:', {
        message: error.message,
        stack: error.stack
      });
      return false;
    }
  }

  // Load dashboard stats
  async function loadDashboardStats() {
    if (!authState.token) {
      console.log('No auth token for loading dashboard stats');
      return;
    }
    
    // Prevent multiple simultaneous calls
    if (dashboardLoading) {
      console.log('Dashboard stats already loading, skipping...');
      return;
    }
    
    // Test authentication first
    const isTokenValid = await testAuthToken();
    if (!isTokenValid) {
      console.log('Invalid auth token, clearing auth state');
      auth.update(state => ({ ...state, user: null, token: null }));
      return;
    }
    
    try {
      dashboardLoading = true;
      console.log('Loading dashboard stats...');
      
      const stats = await apiClient.getDashboardStats(authState.token) as any;
      console.log('Dashboard stats loaded:', stats);
      
      dashboardStats = {
        totalUsers: stats?.total_users || 0,
        totalCompanies: stats?.total_companies || 0,
        totalReviews: stats?.total_reviews || 0,
        pendingDisputes: stats?.pending_disputes || 0,
        pendingReviews: stats?.pending_reviews || 0,
        totalRevenue: stats?.total_revenue || 0
      };
    } catch (error) {
      console.log('Error loading dashboard stats:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Handle specific error types
      if ((error as any).message?.includes('Authentication failed')) {
        console.log('Authentication failed, clearing auth state');
        // Clear invalid auth state and show login form
        auth.update(state => ({ ...state, user: null, token: null }));
        return;
      }
      
      // Set error state for user display
      dashboardError = 'Failed to load dashboard statistics. Please try again later.';

    } finally {
      dashboardLoading = false;
    }
  }

  // Load users
  async function loadUsers() {
    if (!authState.token) {
      console.log('No auth token for loading users');
      return;
    }
    
    // Prevent multiple simultaneous calls
    if (usersLoading) {
      console.log('Users already loading, skipping...');
      return;
    }
    
    try {
      usersLoading = true;
      console.log('Loading users...');

      const usersData = await apiClient.getAdminUsers(authState.token, userSearch, userTypeFilter) as any[];
      console.log('Users loaded:', usersData.length, 'users');

      
      // Find the user we just updated to see if the subscription changed
      if (selectedUserId) {
        const updatedUser = usersData.find(u => u.id === selectedUserId);
        if (updatedUser) {
          console.log('Updated user found:', updatedUser);
        }
      }
      
      users = usersData;
    } catch (error) {
      console.log('Error loading users:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      if ((error as any).message?.includes('Authentication failed')) {
        console.log('Authentication failed, clearing auth state');
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

      return;
    }
    
    // Prevent multiple simultaneous calls
    if (reviewsLoading) {

      return;
    }
    
    try {
      reviewsLoading = true;

      pendingReviews = await apiClient.getAdminReviews(authState.token, reviewStatusFilter) as any[];

    } catch (error) {

      
      if ((error as any).message?.includes('Authentication failed')) {

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

      return;
    }
    
    // Prevent multiple simultaneous calls
    if (disputesLoading) {

      return;
    }
    
    try {
      disputesLoading = true;

      disputes = await apiClient.getAdminDisputes(authState.token, disputeStatusFilter) as any[];
    } catch (error) {

      
      if ((error as any).message?.includes('Authentication failed')) {

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
      console.log('No auth token for loading companies');
      return;
    }
    
    // Prevent multiple simultaneous calls
    if (companiesLoading) {
      console.log('Companies already loading, skipping...');
      return;
    }
    
    try {
      companiesLoading = true;
      console.log('Loading companies...');

      
      // Load all companies first (without search filter)
      const allCompanies = await apiClient.getAdminCompanies(authState.token) as any[];
      console.log('Companies loaded:', allCompanies.length, 'companies');
      
      // Apply client-side search filtering for substring search
      if (companySearch && companySearch.trim()) {
        const searchTerm = companySearch.trim().toLowerCase();
        companies = allCompanies.filter(company => 
          company.name && company.name.toLowerCase().includes(searchTerm)
        );
        console.log('Filtered companies:', companies.length, 'matches for search:', searchTerm);
      } else {
        companies = allCompanies;
      }
    } catch (error) {
      console.log('Error loading companies:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      if ((error as any).message?.includes('Authentication failed')) {
        console.log('Authentication failed, clearing auth state');
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
      console.log('No auth token for loading recent activity');
      return;
    }
    
    try {
      console.log('Loading recent activity...');
      recentActivity = await apiClient.getRecentActivity(authState.token) as any[];
      console.log('Recent activity loaded:', recentActivity.length, 'activities');
    } catch (error) {
      console.log('Error loading recent activity:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      if ((error as any).message?.includes('Authentication failed')) {
        console.log('Authentication failed, clearing auth state');
        auth.update(state => ({ ...state, user: null, token: null }));
        return;
      }
      
      // Set error state for user display
      recentActivityError = 'Failed to load recent activity. Please try again later.';
    }
  }

  // Load analytics data
  async function loadAnalytics() {
    if (!authState.token) {
      console.log('No auth token for loading analytics');
      return;
    }
    
    // Prevent multiple simultaneous calls
    if (analyticsLoading) {
      console.log('Analytics already loading, skipping...');
      return;
    }
    
    try {
      analyticsLoading = true;
      analyticsError = null;
      console.log('Loading analytics...');
      analyticsData = await apiClient.getAdminAnalytics(authState.token);
      console.log('Analytics loaded:', analyticsData);
    } catch (error) {
      console.log('Error loading analytics:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      analyticsError = (error as any).message || 'Failed to load analytics data';
      analyticsData = null;
    } finally {
      analyticsLoading = false;
    }
  }

  // Track previous values for dashboard
  let previousDashboardTab = '';
  let hasDashboardInitialLoad = false;
  
  // Load data when tab changes - only if properly authenticated
  $: if (activeTab === 'dashboard' && authState.token && authState.user?.user_type === 'admin') {
    // Load on initial authentication or when tab changes
    const tabChanged = activeTab !== previousDashboardTab;
    const isInitialLoad = !hasDashboardInitialLoad;
    
    if (isInitialLoad || tabChanged) {
      console.log('Dashboard tab activated:', { isInitialLoad, tabChanged, activeTab });
      previousDashboardTab = activeTab;
      hasDashboardInitialLoad = true;
      loadDashboardStats();
      loadRecentActivity();
    }
  }

  // Start auto-refresh when user is authenticated
  $: if (authState.token && authState.user?.user_type === 'admin') {
    startAutoRefresh();
  } else {
    stopAutoRefresh();
  }

  // Track previous values to prevent unnecessary reloads
  let previousUserSearch = '';
  let previousUserTypeFilter = '';
  let previousActiveTab = '';
  let hasInitialLoad = false;
  
  $: if (activeTab === 'users' && authState.token && authState.user?.user_type === 'admin') {
    // Load on initial authentication or when tab/filter changes
    const filterChanged = userTypeFilter !== previousUserTypeFilter;
    const tabChanged = activeTab !== previousActiveTab;
    const isInitialLoad = !hasInitialLoad;
    
    if (isInitialLoad || tabChanged || filterChanged) {
      console.log('Users tab activated:', { isInitialLoad, tabChanged, filterChanged, activeTab, userTypeFilter });
      previousUserTypeFilter = userTypeFilter;
      previousActiveTab = activeTab;
      hasInitialLoad = true;
      loadUsers();
    }
  }
  
  // Handle search input changes with debouncing
  $: if (userSearch !== previousUserSearch && activeTab === 'users') {
    previousUserSearch = userSearch;
    debouncedUserSearch();
  }

  // Track previous values for reviews
  let previousReviewsTab = '';
  let previousReviewStatusFilter = '';
  let hasReviewsInitialLoad = false;
  
  $: if (activeTab === 'reviews' && authState.token && authState.user?.user_type === 'admin') {
    // Load on initial authentication or when tab/filter changes
    const tabChanged = activeTab !== previousReviewsTab;
    const filterChanged = reviewStatusFilter !== previousReviewStatusFilter;
    const isInitialLoad = !hasReviewsInitialLoad;
    
    if (isInitialLoad || tabChanged || filterChanged) {

      previousReviewsTab = activeTab;
      previousReviewStatusFilter = reviewStatusFilter;
      hasReviewsInitialLoad = true;
      loadReviews();
      // Also load companies to enable company name lookup in reviews
      if (companies.length === 0) {
        loadCompanies();
      }
    }
  }

  // Track previous values for disputes
  let previousDisputesTab = '';
  let previousDisputeStatusFilter = '';
  let hasDisputesInitialLoad = false;
  
  $: if (activeTab === 'disputes' && authState.token && authState.user?.user_type === 'admin') {
    // Load on initial authentication or when tab/filter changes
    const tabChanged = activeTab !== previousDisputesTab;
    const filterChanged = disputeStatusFilter !== previousDisputeStatusFilter;
    const isInitialLoad = !hasDisputesInitialLoad;
    
    if (isInitialLoad || tabChanged || filterChanged) {

      previousDisputesTab = activeTab;
      previousDisputeStatusFilter = disputeStatusFilter;
      hasDisputesInitialLoad = true;
      loadDisputes();
    }
  }

  // Track previous values for companies
  let previousCompaniesTab = '';
  let previousCompanySearch = '';
  let hasCompaniesInitialLoad = false;
  
  $: if (activeTab === 'companies' && authState.token && authState.user?.user_type === 'admin') {
    // Load on initial authentication or when tab/search changes
    const tabChanged = activeTab !== previousCompaniesTab;
    const searchChanged = companySearch !== previousCompanySearch;
    const isInitialLoad = !hasCompaniesInitialLoad;
    
    if (isInitialLoad || tabChanged || searchChanged) {
      console.log('Companies tab activated:', { isInitialLoad, tabChanged, searchChanged, activeTab, companySearch });
      previousCompaniesTab = activeTab;
      previousCompanySearch = companySearch;
      hasCompaniesInitialLoad = true;
      loadCompanies();
    }
  }

  // Track previous values for analytics
  let previousAnalyticsTab = '';
  let hasAnalyticsInitialLoad = false;
  
  $: if (activeTab === 'analytics' && authState.token && authState.user?.user_type === 'admin') {
    // Load on initial authentication or when tab changes
    const tabChanged = activeTab !== previousAnalyticsTab;
    const isInitialLoad = !hasAnalyticsInitialLoad;
    
    if (isInitialLoad || tabChanged) {
      console.log('Analytics tab activated:', { isInitialLoad, tabChanged, activeTab });
      previousAnalyticsTab = activeTab;
      hasAnalyticsInitialLoad = true;
      loadAnalytics();
    }
  }
  
  // Track previous values for promotions
  let previousPromotionsTab = '';
  let hasPromotionsInitialLoad = false;
  
  $: if (activeTab === 'promotions' && authState.token && authState.user?.user_type === 'admin') {
    // Load on initial authentication or when tab changes
    const tabChanged = activeTab !== previousPromotionsTab;
    const isInitialLoad = !hasPromotionsInitialLoad;
    
    if (isInitialLoad || tabChanged) {
      console.log('Promotions tab activated:', { isInitialLoad, tabChanged, activeTab });
      previousPromotionsTab = activeTab;
      hasPromotionsInitialLoad = true;
      loadPromotionData();
    }
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
      return `${diffMins} hours ago`;
    } else {
      return `${diffDays} days ago`;
    }
  }

  // Utility function to get CSS-safe subscription class
  function getSubscriptionClass(tier: string): string {
    if (!tier) return 'free';
    return tier.toLowerCase().replace(/\s+/g, '-');
  }

  // Utility function to get company name from freight_forwarder_id
  function getCompanyName(review: any): string {
    // First try to use the freight_forwarder_name if it exists and is not an ID
    if (review.freight_forwarder_name && !review.freight_forwarder_name.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return review.freight_forwarder_name;
    }
    
    // If freight_forwarder_name is an ID or doesn't exist, try to find the company by ID
    if (review.freight_forwarder_id && companies.length > 0) {
      const company = companies.find(c => c.id === review.freight_forwarder_id);
      if (company && company.name) {
        return company.name;
      }
    }
    
    // Fallback to showing the ID if no name is found
    return review.freight_forwarder_id || 'N/A';
  }

  // Utility function to format subscription expiry date
  function formatSubscriptionExpiry(endDate: string | undefined): string {
    if (!endDate) return 'N/A';
    
    try {
      const date = new Date(endDate);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {

      return 'Invalid Date';
    }
  }

  // Utility function to get subscription expiry status
  function getSubscriptionExpiryStatus(endDate: string | undefined): 'active' | 'expiring' | 'expired' | 'no-date' {
    if (!endDate) return 'no-date';
    
    try {
      const expiryDate = new Date(endDate);
      const now = new Date();
      const diffTime = expiryDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return 'expired';
      if (diffDays <= 7) return 'expiring';
      return 'active';
    } catch (error) {

      return 'no-date';
    }
  }

  // Utility function to get days remaining
  function getDaysRemaining(endDate: string | undefined): number {
    if (!endDate) return 0;
    
    try {
      const expiryDate = new Date(endDate);
      const now = new Date();
      const diffTime = expiryDate.getTime() - now.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (error) {

      return 0;
    }
  }

  // Notification functions
  function addNotification(type: 'success' | 'error' | 'info' | 'warning', message: string) {
    const id = `notification-${++notificationId}`;
    notifications = [...notifications, { id, type, message, timestamp: new Date() }];
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  }

  function removeNotification(id: string) {
    notifications = notifications.filter(n => n.id !== id);
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
      isUpdatingCompany = true;
      console.log('Updating company:', selectedCompanyId, editCompanyData);
      
      const result = await apiClient.updateCompany(authState.token, selectedCompanyId, {
        name: editCompanyData.name,
        website: editCompanyData.website,
        logo_url: editCompanyData.logo_url,
        description: editCompanyData.description,
        headquarters_country: editCompanyData.headquarters_country
      });
      console.log('Company update result:', result);
      
      // Check if we got a valid result or if it's empty (which might still indicate success)
      if (result && typeof result === 'object' && Object.keys(result).length > 0) {
        console.log('Company update successful with result');
      } else {
        console.log('Company update successful with empty result');
      }
      
      // Show success message
      addNotification('success', 'Company updated successfully!');
      
      await loadCompanies(); // Reload companies
      closeEditCompanyModal();
    } catch (error) {
      console.log('Error updating company:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        selectedCompanyId,
        editCompanyData
      });
      
      // Extract more detailed error information
      let errorMessage = 'Failed to update company';
      
      if (error instanceof Error) {
        if (error.message.includes('API request failed:')) {
          // Extract the specific API error details
          errorMessage = error.message.replace('API request failed:', 'Update failed:').trim();
        } else if (error.message !== 'Failed to update company') {
          // Use the original error message if it's different from our generic one
          errorMessage = error.message;
        }
      }
      
      // Show the detailed error message
      addNotification('error', `Failed to update company: ${errorMessage}`);
    } finally {
      isUpdatingCompany = false;
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

      addNotification('error', `Failed to delete company: ${(error as any).message || 'Unknown error'}`);
    }
  }

  function openSubscriptionModal(user: any) {



    
    selectedUserId = user.id;
    selectedUser = user;
    
    // Initialize subscription data with current user values
    subscriptionData = {
      tier: user.subscription_tier || 'free',
      comment: '',
      duration: '1',
      isPaid: false
    };
    

    showSubscriptionModal = true;
  }

  function getCommentPlaceholder() {
    const duration = Number(subscriptionData.duration);
    const isPaid = subscriptionData.isPaid;
    const tier = subscriptionData.tier;
    
    if (tier === 'free') {
      return isPaid ? 
        `Paid trial for ${duration} month${duration > 1 ? 's' : ''} - ` : 
        `Free trial for ${duration} month${duration > 1 ? 's' : ''} - `;
    } else if (tier === 'monthly') {
      return isPaid ? 
        `Paid monthly subscription for ${duration} month${duration > 1 ? 's' : ''} - ` : 
        `Monthly subscription for ${duration} month${duration > 1 ? 's' : ''} - `;
    } else if (tier === 'annual') {
      return isPaid ? 
        `Paid annual subscription for ${duration} year${duration > 1 ? 's' : ''} - ` : 
        `Annual subscription for ${duration} year${duration > 1 ? 's' : ''} - `;
    } else if (tier === 'enterprise') {
      return isPaid ? 
        `Paid enterprise subscription for ${duration} year${duration > 1 ? 's' : ''} - ` : 
        `Enterprise subscription for ${duration} year${duration > 1 ? 's' : ''} - `;
    }
    
    return 'Add a comment about this subscription...';
  }

  function closeSubscriptionModal() {
    showSubscriptionModal = false;
    selectedUserId = null;
    selectedUser = null;
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
    
    console.log('Updating user subscription:', {
      selectedUserId,
      subscriptionData
    });
    
    try {
      // Convert duration to months based on subscription tier
      let durationInMonths = Number(subscriptionData.duration);
      if (subscriptionData.tier === 'annual' || subscriptionData.tier === 'enterprise') {
        // Convert years to months
        durationInMonths = Number(subscriptionData.duration) * 12;
      }
      
      const requestData = {
        tier: subscriptionData.tier,
        comment: subscriptionData.comment,
        duration: durationInMonths,
        is_paid: subscriptionData.isPaid
      };
      console.log('Subscription update request data:', requestData);
      
      const result = await apiClient.updateUserSubscription(authState.token, selectedUserId, requestData);
      console.log('Subscription update result:', result);
      
      await loadUsers(); // Reload users

      
      closeSubscriptionModal();
      
      // Format the tier name for display
      let tierDisplayName = subscriptionData.tier;
      if (subscriptionData.tier === 'monthly') tierDisplayName = 'Monthly';
      else if (subscriptionData.tier === 'annual') tierDisplayName = 'Annual';
      else if (subscriptionData.tier === 'enterprise') tierDisplayName = 'Enterprise';
      else if (subscriptionData.tier === 'free') tierDisplayName = 'Free';
      
      addNotification('success', `Subscription updated to ${tierDisplayName}`);
    } catch (error) {
      console.log('Error updating user subscription:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        selectedUserId,
        requestData
      });
      addNotification('error', `Failed to update subscription: ${(error as any).message || 'Unknown error'}`);
    }
  }

  async function updateUserProfile() {
    if (!authState.token || !selectedUserId) {
      console.log('No auth token or selected user for profile update');
      return;
    }
    
    console.log('Updating user profile:', {
      selectedUserId,
      editUserData
    });
    
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
      console.log('No valid data to update user profile');
      alert('No valid data to update. Please fill in at least one field.');
      return;
    }
    
    console.log('User profile update data:', userUpdateData);
    
    try {
      const result = await apiClient.adminUpdateUser(authState.token, selectedUserId, userUpdateData);
      console.log('User profile update result:', result);
      
      await loadUsers(); // Reload users
      closeEditUserModal();
    } catch (error: any) {
      console.log('Error updating user profile:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        selectedUserId,
        userUpdateData
      });
      alert(`Failed to update user profile: ${error.message || 'Unknown error'}`);
    }
  }



  async function resolveDispute(disputeId: string) {
    if (!authState.token) {
      console.log('No auth token for resolving dispute');
      return;
    }
    
    console.log('Resolving dispute:', disputeId);
    
    try {
      await apiClient.resolveDispute(authState.token, disputeId);
      console.log('Dispute resolved successfully');
      await loadDisputes(); // Reload disputes
    } catch (error) {
      console.log('Error resolving dispute:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        disputeId
      });
    }
  }
</script>

<svelte:head>
  <title>Admin Dashboard - LogiScore</title>
  <meta name="description" content="LogiScore Admin Dashboard - Manage reviews, disputes, users, and company data." />
</svelte:head>

<!-- Admin Dashboard -->
<section class="admin-dashboard">
  <!-- Notification System -->
  {#if notifications.length > 0}
    <div class="notifications-container">
      {#each notifications as notification}
        <div class="notification notification-{notification.type}" on:click={() => removeNotification(notification.id)}>
          <div class="notification-content">
            <span class="notification-icon">
              {#if notification.type === 'success'}✅{/if}
              {#if notification.type === 'error'}❌{/if}
              {#if notification.type === 'info'}ℹ️{/if}
              {#if notification.type === 'warning'}⚠️{/if}
            </span>
            <span class="notification-message">{notification.message}</span>
            <button class="notification-close" on:click={() => removeNotification(notification.id)}>&times;</button>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <div class="admin-banner">
    <div class="container">
      <!-- Admin Login Form -->
      {#if !authState.token || !authState.user}
        <div class="admin-login-section">
          <AdminLoginForm on:loginSuccess={() => {
            // Login success is handled by the auth store update in AdminLoginForm
            // No additional action needed here
          }} />
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
        <button class="tab-button {activeTab === 'promotions' ? 'active' : ''}" on:click={() => activeTab = 'promotions'}>
          🎁 Promotions
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
          {#if dashboardError}
            <div class="dashboard-error">
              <div class="error-icon">⚠️</div>
              <h3>Dashboard Data Unavailable</h3>
              <p>{dashboardError}</p>
              <button class="btn-retry" on:click={refreshCurrentTab}>
                🔄 Retry
              </button>
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
          {/if}

          {#if recentActivityError}
            <div class="recent-activity-error">
              <div class="error-icon">⚠️</div>
              <h3>Recent Activity Unavailable</h3>
              <p>{recentActivityError}</p>
              <button class="btn-retry" on:click={refreshCurrentTab}>
                🔄 Retry
              </button>
            </div>
          {:else}
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
          {/if}
          
          <!-- Trial Reminder Test Component -->
          <div class="trial-test-section">
            <TrialReminderTest />
          </div>
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
                    <th>Company</th>
                    <th>Reviewer</th>
                    <th>Rating</th>
                    <th>Location</th>
                    <th>Shipment Reference</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {#each pendingReviews as review}
                    <tr>
                      <td>{review.freight_forwarder_name || 'N/A'}</td>
                      <td>{review.reviewer_name || 'Anonymous'}</td>
                      <td>
                        {#if review.rating}
                          <span class="rating-display">
                            {review.rating.toFixed(1)} ⭐
                          </span>
                        {:else}
                          <span class="no-rating">N/A</span>
                        {/if}
                      </td>
                      <td>
                        {#if review.city && review.country}
                          {review.city}, {review.country}
                        {:else if review.city}
                          {review.city}
                        {:else if review.country}
                          {review.country}
                        {:else}
                          N/A
                        {/if}
                      </td>
                      <td>{review.shipment_reference || 'N/A'}</td>
                      <td><span class="status {review.status?.toLowerCase() || 'inactive'}">{review.status || 'Inactive'}</span></td>
                      <td>{review.created_at ? new Date(review.created_at).toLocaleDateString() : 'N/A'}</td>
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
                      <td>{dispute.freight_forwarder_name || dispute.freight_forwarder_id || 'N/A'}</td>
                      <td>{dispute.issue || dispute.description || 'N/A'}</td>
                      <td><span class="status {dispute.status?.toLowerCase().replace(' ', '-') || 'unknown'}">{dispute.status || 'Unknown'}</span></td>
                      <td>{dispute.created_at ? new Date(dispute.created_at).toLocaleDateString() : 'N/A'}</td>
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
                    <th>Expiry Date</th>
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
                      <td>
                        <span class="subscription {getSubscriptionClass(user.subscription_tier)}">
                          {#if user.subscription_tier === 'free' || !user.subscription_tier}
                            Free
                          {:else if user.subscription_tier === 'monthly'}
                            Monthly
                          {:else if user.subscription_tier === 'annual'}
                            Annual
                          {:else if user.subscription_tier === 'enterprise'}
                            Enterprise
                          {:else}
                            {user.subscription_tier}
                          {/if}
                        </span>
                      </td>
                      <td>
                        <span class="expiry-date {getSubscriptionExpiryStatus(user.subscription_end_date)}">
                          {#if user.subscription_end_date}
                            {formatSubscriptionExpiry(user.subscription_end_date)}
                            {#if getSubscriptionExpiryStatus(user.subscription_end_date) === 'expiring'}
                              <span class="days-remaining">({getDaysRemaining(user.subscription_end_date)} days)</span>
                            {/if}
                          {:else}
                            N/A
                          {/if}
                        </span>
                      </td>
                      <td><span class="status {user.is_active ? 'active' : 'inactive'}">{user.is_active ? 'Active' : 'Inactive'}</span></td>
                      <td>
                        <button class="btn-secondary" on:click={() => openEditUserModal(user)}>Edit</button>
                        <button class="btn-secondary">Suspend</button>
                        <button class="btn-primary" on:click={() => openSubscriptionModal(user)}>Manage Subscription</button>
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

      <!-- Promotions Tab -->
      {#if activeTab === 'promotions'}
        <div class="promotions-content">
          <div class="promotions-header">
            <h2>Review Reward Promotion</h2>
            <button class="btn-refresh" on:click={refreshCurrentTab}>🔄 Refresh</button>
          </div>
          
          <!-- Promotion Configuration -->
          <div class="promotion-config">
            <h3>Promotion Settings</h3>
            <div class="config-grid">
              <div class="config-item">
                <label>Status:</label>
                <div class="toggle-container">
                  <button 
                    class="toggle-button {promotionConfig.isActive ? 'active' : ''}" 
                    on:click={togglePromotion}
                  >
                    {promotionConfig.isActive ? '🟢 Active' : '🔴 Inactive'}
                  </button>
                </div>
              </div>
              <div class="config-item">
                <label>Max Rewards per User:</label>
                <span class="config-value">{promotionConfig.maxRewardsPerUser}</span>
              </div>
              <div class="config-item">
                <label>Reward (Months):</label>
                <span class="config-value">{promotionConfig.rewardMonths}</span>
              </div>
            </div>
            <p class="promotion-description">{promotionConfig.description}</p>
          </div>

          <!-- Promotion Statistics -->
          <div class="promotion-stats">
            <h3>Promotion Statistics</h3>
            <div class="stats-grid">
              <div class="stat-card">
                <h4>Total Rewards Given</h4>
                <div class="stat-number">{promotionStats.totalRewardsGiven}</div>
              </div>
              <div class="stat-card">
                <h4>Active Users</h4>
                <div class="stat-number">{promotionStats.activeUsers}</div>
              </div>
              <div class="stat-card">
                <h4>Total Months Awarded</h4>
                <div class="stat-number">{promotionStats.totalMonthsAwarded}</div>
              </div>
            </div>
          </div>

          <!-- User Rewards Table -->
          <div class="user-rewards">
            <h3>User Rewards</h3>
            {#if userRewards.length > 0}
              <div class="rewards-table">
                <table>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Review</th>
                      <th>Rewards Earned</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {#each userRewards as reward}
                      <tr>
                        <td>{reward.user_name || 'Unknown'}</td>
                        <td>{reward.user_email || 'N/A'}</td>
                        <td>{reward.review_id || 'N/A'}</td>
                        <td>{reward.months_awarded || 0} month(s)</td>
                        <td>{reward.awarded_at ? new Date(reward.awarded_at).toLocaleDateString() : 'N/A'}</td>
                        <td>
                          <button 
                            class="btn-award" 
                            on:click={() => awardUserReward(reward.user_id, reward.review_id)}
                            disabled={!promotionConfig.isActive}
                          >
                            🎁 Award
                          </button>
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            {:else}
              <div class="empty-state">
                <div class="empty-icon">🎁</div>
                <h3>No Rewards Yet</h3>
                <p>No users have earned rewards yet. The promotion will automatically award users when they submit reviews.</p>
              </div>
            {/if}
          </div>
        </div>
      {/if}
    {/if}
  </div>
</section>

<!-- Subscription Management Modal -->
{#if showSubscriptionModal}
  <div class="modal-overlay" on:click={closeSubscriptionModal}>
    <div class="modal-content" on:click|stopPropagation>
      <!-- Force re-render with user-specific key -->
      {#key selectedUser?.id || 'no-user'}
      <div class="modal-header">
        <div>
          <h2>Manage User Subscription</h2>
          {#if selectedUser}
            <p class="user-info">
              {selectedUser.full_name || selectedUser.username} ({selectedUser.user_type}) - 
              Current: <span class="current-tier">{selectedUser.subscription_tier || 'Free'}</span>
            </p>
          {/if}
        </div>
        <button class="close-btn" on:click={closeSubscriptionModal}>&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="form-group">
          <label for="subscription-tier">Subscription Tier:</label>
          <select id="subscription-tier" bind:value={subscriptionData.tier}>
            <option value="free">Free</option>
            {#if selectedUser && selectedUser.user_type === 'shipper'}
              <option value="monthly">Monthly ($38/month)</option>
              <option value="annual">Annual ($418/year)</option>
            {:else if selectedUser && selectedUser.user_type === 'forwarder'}
              <option value="monthly">Monthly ($76/month)</option>
              <option value="annual">Annual ($836/year)</option>
              <option value="enterprise">Enterprise ($3,450/year)</option>
            {:else}
              <!-- Default options for unknown user type -->
              <option value="monthly">Monthly</option>
              <option value="annual">Annual</option>
              <option value="enterprise">Enterprise</option>
            {/if}
          </select>
          <!-- Debug info -->
          {#if selectedUser}
            <div class="debug-info" style="font-size: 0.8rem; color: #999; margin-top: 5px;">
              Debug: User type = "{selectedUser.user_type}", ID = "{selectedUser.id}"
              <br>Current tier: "{selectedUser.subscription_tier || 'free'}"
              <br>Selected tier: "{subscriptionData.tier}"
            </div>
          {/if}
          {#if selectedUser}
            <div class="pricing-note">
              {#if selectedUser.user_type === 'shipper'}
                <small>Shipper plans: Monthly $38, Annual $418</small>
              {:else if selectedUser.user_type === 'forwarder'}
                <small>Forwarder plans: Monthly $76, Annual $836, Enterprise $3,450</small>
              {/if}
            </div>
          {/if}
        </div>
        
        <!-- Duration field - contextual based on subscription tier -->
        {#if subscriptionData.tier === 'free'}
          <div class="form-group">
            <label for="subscription-duration">Trial Duration (months):</label>
            <input type="number" id="subscription-duration" bind:value={subscriptionData.duration} min="1" max="12" />
            <small class="field-help">How many months should the free trial last?</small>
          </div>
        {:else if subscriptionData.tier === 'monthly'}
          <div class="form-group">
            <label for="subscription-duration">Number of Months:</label>
            <input type="number" id="subscription-duration" bind:value={subscriptionData.duration} min="1" max="12" />
            <small class="field-help">How many months to apply the monthly rate?</small>
          </div>
        {:else if subscriptionData.tier === 'annual'}
          <div class="form-group">
            <label for="subscription-duration">Number of Years:</label>
            <input type="number" id="subscription-duration" bind:value={subscriptionData.duration} min="1" max="5" step="1" />
            <small class="field-help">How many years should the annual subscription last?</small>
          </div>
        {:else if subscriptionData.tier === 'enterprise'}
          <div class="form-group">
            <label for="subscription-duration">Number of Years:</label>
            <input type="number" id="subscription-duration" bind:value={subscriptionData.duration} min="1" max="10" step="1" />
            <small class="field-help">How many years should the enterprise subscription last?</small>
          </div>
        {/if}
        
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
            placeholder={getCommentPlaceholder()}
            rows="3"
          ></textarea>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn-secondary" on:click={closeSubscriptionModal}>Cancel</button>
        <button class="btn-primary" on:click={updateUserSubscription}>Update Subscription</button>
      </div>
      {/key}
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
        <button class="btn-secondary" on:click={closeEditCompanyModal} disabled={isUpdatingCompany}>Cancel</button>
        <button class="btn-primary" on:click={updateCompany} disabled={isUpdatingCompany}>
          {#if isUpdatingCompany}
            🔄 Updating...
          {:else}
            Update Company
          {/if}
        </button>
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

  /* Optimize for ResizeObserver stability */
  html, body {
    overflow-x: hidden;
    will-change: auto;
  }

  /* Reduce layout thrashing */
  .admin-dashboard {
    contain: layout style;
  }

  .container {
    contain: layout;
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
    font-size: 11px;
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


  .btn-danger {
    background: #dc3545;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 11px;
    margin-left: 5px;
  }

  .btn-danger:hover {
    background: #c82333;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
  }

  .btn-primary {
    background: #667eea;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    font-size: 11px;
    transition: all 0.3s;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .btn-primary:hover {
    background: #5a6fd8;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  .btn-secondary {
    background: #6c757d;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    font-size: 11px;
    transition: all 0.3s;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-right: 5px;
  }

  .btn-secondary:hover {
    background: #5a6268;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(108, 117, 125, 0.3);
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

  .rating-display {
    background: #fff3cd;
    color: #856404;
    padding: 4px 8px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 0.9rem;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .no-rating {
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

  .subscription.free {
    background: #e3f2fd;
    color: #1976d2;
  }

  .subscription.monthly {
    background: #fff3e0;
    color: #f57c00;
  }

  .subscription.annual {
    background: #e8f5e8;
    color: #388e3c;
  }

  .subscription.enterprise {
    background: #f3e5f5;
    color: #7b1fa2;
  }

  /* Expiry Date Styles */
  .expiry-date {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .expiry-date.active {
    background: #e8f5e8;
    color: #388e3c;
  }

  .expiry-date.expiring {
    background: #fff3e0;
    color: #f57c00;
    font-weight: 600;
  }

  .expiry-date.expired {
    background: #ffebee;
    color: #d32f2f;
    font-weight: 600;
  }

  .expiry-date.no-date {
    background: #f5f5f5;
    color: #757575;
    font-style: italic;
  }

  .days-remaining {
    font-size: 0.75rem;
    font-weight: 600;
    opacity: 0.8;
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
    margin: 0 0 8px 0;
    color: #333;
  }

  .user-info {
    margin: 0;
    font-size: 0.9rem;
    color: #666;
    font-weight: 500;
  }

  .current-tier {
    color: #667eea;
    font-weight: 600;
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

  .field-help {
    display: block;
    margin-top: 4px;
    font-size: 0.85rem;
    color: #666;
    font-style: italic;
  }

  .pricing-note {
    margin-top: 8px;
    padding: 8px 12px;
    background: #f8f9fa;
    border-radius: 6px;
    border-left: 3px solid #667eea;
  }

  .pricing-note small {
    color: #666;
    font-size: 0.85rem;
    font-weight: 500;
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

  /* Dashboard Error States */
  .dashboard-error,
  .recent-activity-error {
    background: #fff5f5;
    border: 2px dashed #f56565;
    border-radius: 12px;
    padding: 40px;
    text-align: center;
    margin: 20px 0;
    color: #c53030;
  }

  .dashboard-error .error-icon,
  .recent-activity-error .error-icon {
    font-size: 3rem;
    margin-bottom: 20px;
  }

  .dashboard-error h3,
  .recent-activity-error h3 {
    color: #c53030;
    margin-bottom: 15px;
    font-size: 1.5rem;
  }

  .dashboard-error p,
  .recent-activity-error p {
    color: #742a2a;
    font-size: 1.1rem;
    margin-bottom: 20px;
  }

  .btn-retry {
    background: #3182ce;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 1rem;
    transition: all 0.3s;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .btn-retry:hover {
    background: #2c5aa0;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(49, 130, 206, 0.3);
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

  /* Notification System */
  .notifications-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 400px;
  }

  .notification {
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 15px;
    cursor: pointer;
    transition: all 0.3s ease;
    border-left: 4px solid;
    animation: slideInRight 0.3s ease;
  }

  .notification:hover {
    transform: translateX(-5px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  }

  .notification-success {
    border-left-color: #28a745;
    background: #d4edda;
  }

  .notification-error {
    border-left-color: #dc3545;
    background: #f8d7da;
  }

  .notification-info {
    border-left-color: #17a2b8;
    background: #d1ecf1;
  }

  .notification-content {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .notification-icon {
    font-size: 1.2rem;
    flex-shrink: 0;
  }

  .notification-message {
    flex: 1;
    font-weight: 500;
    color: #333;
  }

  .notification-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s ease;
  }

  .notification-close:hover {
    background: rgba(0, 0, 0, 0.1);
    color: #333;
  }

  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  /* Button loading state */
  .btn-primary:disabled {
    background: #6c757d;
    cursor: not-allowed;
    opacity: 0.7;
  }

  .btn-primary:disabled:hover {
    transform: none;
    box-shadow: none;
  }

  .trial-test-section {
    margin-top: 30px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
  }
</style> 