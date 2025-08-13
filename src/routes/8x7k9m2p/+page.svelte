<script lang="ts">
  import { auth, authMethods } from '$lib/auth';
  import { apiClient } from '$lib/api';
  
  let authState: { user: any; token: string | null; isLoading: boolean; error: string | null } = {
    user: null,
    token: null,
    isLoading: false,
    error: null
  };

  // Subscribe to auth store
  auth.subscribe(state => {
    authState = state;
  });

  // Admin state
  let activeTab = 'dashboard';
  let isLoading = false;
  let showAddCompanyModal = false;
  let showSubscriptionModal = false;
  let selectedUserId: string | null = null;
  let subscriptionData = {
    tier: 'free',
    comment: '',
    duration: '1',
    isPaid: false
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

  // Search and filter states
  let userSearch = '';
  let userTypeFilter = '';
  let companySearch = '';
  let reviewStatusFilter = '';
  let disputeStatusFilter = '';

  // Load dashboard stats
  async function loadDashboardStats() {
    if (!authState.token) return;
    
    try {
      isLoading = true;
      const stats = await apiClient.getDashboardStats(authState.token);
      dashboardStats = {
        totalUsers: stats.total_users,
        totalCompanies: stats.total_companies,
        totalReviews: stats.total_reviews,
        pendingDisputes: stats.pending_disputes,
        pendingReviews: stats.pending_reviews,
        totalRevenue: stats.total_revenue
      };
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      isLoading = false;
    }
  }

  // Load users
  async function loadUsers() {
    if (!authState.token) return;
    
    try {
      isLoading = true;
      users = await apiClient.getAdminUsers(authState.token, userSearch, userTypeFilter);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      isLoading = false;
    }
  }

  // Load reviews
  async function loadReviews() {
    if (!authState.token) return;
    
    try {
      isLoading = true;
      pendingReviews = await apiClient.getAdminReviews(authState.token, reviewStatusFilter);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      isLoading = false;
    }
  }

  // Load disputes
  async function loadDisputes() {
    if (!authState.token) return;
    
    try {
      isLoading = true;
      disputes = await apiClient.getAdminDisputes(authState.token, disputeStatusFilter);
    } catch (error) {
      console.error('Failed to load disputes:', error);
    } finally {
      isLoading = false;
    }
  }

  // Load companies
  async function loadCompanies() {
    if (!authState.token) return;
    
    try {
      isLoading = true;
      companies = await apiClient.getAdminCompanies(authState.token, companySearch);
    } catch (error) {
      console.error('Failed to load companies:', error);
    } finally {
      isLoading = false;
    }
  }

  // Load data when tab changes
  $: if (activeTab === 'dashboard' && authState.token) {
    loadDashboardStats();
  }

  $: if (activeTab === 'users' && authState.token) {
    loadUsers();
  }

  $: if (activeTab === 'reviews' && authState.token) {
    loadReviews();
  }

  $: if (activeTab === 'disputes' && authState.token) {
    loadDisputes();
  }

  $: if (activeTab === 'companies' && authState.token) {
    loadCompanies();
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
    description: '',
    headquarters_country: ''
  };



  async function addCompany() {
    if (!authState.token) return;
    
    try {
      await apiClient.createCompany(authState.token, {
        name: newCompany.name,
        website: newCompany.website,
        description: newCompany.description,
        headquarters_country: newCompany.headquarters_country
      });
      
      await loadCompanies(); // Reload companies
      newCompany = { name: '', website: '', description: '', headquarters_country: '' };
    } catch (error) {
      console.error('Failed to add company:', error);
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
  <div class="container">
    <div class="admin-header">
      <h1>Admin Dashboard</h1>
      <p>Manage reviews, disputes, users, and company data</p>
    </div>

    <!-- Tab Navigation -->
    <div class="tab-navigation">
      <button class="tab-button {activeTab === 'dashboard' ? 'active' : ''}" on:click={() => activeTab = 'dashboard'}>
        Dashboard
      </button>
      <button class="tab-button {activeTab === 'reviews' ? 'active' : ''}" on:click={() => activeTab = 'reviews'}>
        Review Management
      </button>
      <button class="tab-button {activeTab === 'disputes' ? 'active' : ''}" on:click={() => activeTab = 'disputes'}>
        Disputes
      </button>
      <button class="tab-button {activeTab === 'companies' ? 'active' : ''}" on:click={() => activeTab = 'companies'}>
        Company Management
      </button>
      <button class="tab-button {activeTab === 'users' ? 'active' : ''}" on:click={() => activeTab = 'users'}>
        User Management
      </button>
      <button class="tab-button {activeTab === 'analytics' ? 'active' : ''}" on:click={() => activeTab = 'analytics'}>
        Analytics
      </button>
    </div>

    <!-- Dashboard Tab -->
    {#if activeTab === 'dashboard'}
      <div class="dashboard-content">
        <div class="stats-grid">
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
        </div>

        <div class="recent-activity">
          <h2>Recent Activity</h2>
          <div class="activity-list">
            <div class="activity-item">
              <span class="activity-time">2 hours ago</span>
              <span class="activity-text">New review submitted for DHL Supply Chain</span>
            </div>
            <div class="activity-item">
              <span class="activity-time">4 hours ago</span>
              <span class="activity-text">Dispute opened for Kuehne + Nagel review</span>
            </div>
            <div class="activity-item">
              <span class="activity-time">1 day ago</span>
              <span class="activity-text">New company registered: C.H. Robinson</span>
            </div>
          </div>
        </div>
      </div>
    {/if}

    <!-- Review Management Tab -->
    {#if activeTab === 'reviews'}
      <div class="reviews-content">
        <h2>Review Management</h2>
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
      </div>
    {/if}

    <!-- Disputes Tab -->
    {#if activeTab === 'disputes'}
      <div class="disputes-content">
        <h2>Dispute Resolution</h2>
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
      </div>
    {/if}

    <!-- Company Management Tab -->
    {#if activeTab === 'companies'}
      <div class="companies-content">
        <div class="companies-header">
          <h2>Company Management</h2>
          <button class="btn-primary" on:click={() => showAddCompanyModal = true}>Add Company</button>
        </div>

        <!-- Add Company Form -->
        <div class="add-company-form">
          <h3>Add New Company</h3>
          <form on:submit|preventDefault={addCompany}>
            <div class="form-group">
              <label for="company-name">Company Name</label>
              <input type="text" id="company-name" bind:value={newCompany.name} required />
            </div>
            <div class="form-group">
              <label for="company-website">Website</label>
              <input type="url" id="company-website" bind:value={newCompany.website} />
            </div>

            <button type="submit" class="btn-primary">Add Company</button>
          </form>
        </div>

        <!-- Companies Table -->
        <div class="companies-table">
          <table>
            <thead>
              <tr>
                <th>Logo</th>
                <th>Company Name</th>
                <th>Website</th>
                <th>Headquarters</th>
                <th>Description</th>
                <th>Branches</th>
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
                        🌐 Visit
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
                  <td>{company.branches_count}</td>
                  <td>{company.reviews_count}</td>
                  <td><span class="status {company.status.toLowerCase()}">{company.status}</span></td>
                  <td>
                    <button class="btn-secondary">Edit</button>
                    <button class="btn-secondary">Manage Branches</button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}

    <!-- User Management Tab -->
    {#if activeTab === 'users'}
      <div class="users-content">
        <h2>User Management</h2>
        <div class="users-filters">
          <input type="text" placeholder="Search users..." class="search-input" />
          <select class="filter-select">
            <option value="">All Roles</option>
            <option value="shipper">Shippers</option>
            <option value="forwarder">Forwarders</option>
            <option value="admin">Admins</option>
          </select>
        </div>
        <div class="users-table">
          <table>
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
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
                  <td><span class="subscription {user.subscription_tier}">{user.subscription_tier}</span></td>
                  <td><span class="status {user.is_active ? 'active' : 'inactive'}">{user.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <button class="btn-secondary">Edit</button>
                    <button class="btn-secondary">Suspend</button>
                    <button class="btn-primary" on:click={() => openSubscriptionModal(user.id)}>Manage Subscription</button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}

    <!-- Analytics Tab -->
    {#if activeTab === 'analytics'}
      <div class="analytics-content">
        <h2>Platform Analytics</h2>
        <div class="analytics-grid">
          <div class="analytics-card">
            <h3>Review Growth</h3>
            <div class="chart-placeholder">📈 Chart: Monthly review submissions</div>
          </div>
          <div class="analytics-card">
            <h3>User Engagement</h3>
            <div class="chart-placeholder">📊 Chart: Active users over time</div>
          </div>
          <div class="analytics-card">
            <h3>Revenue Metrics</h3>
            <div class="chart-placeholder">💰 Chart: Subscription revenue</div>
          </div>
          <div class="analytics-card">
            <h3>Top Companies</h3>
            <div class="chart-placeholder">🏆 Chart: Most reviewed companies</div>
          </div>
        </div>
      </div>
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
    padding: 40px 0;
    background: #f8f9fa;
    min-height: calc(100vh - 200px);
  }

  .admin-header {
    text-align: center;
    margin-bottom: 40px;
  }

  .admin-header h1 {
    font-size: 2.5rem;
    margin-bottom: 10px;
    color: #333;
  }

  .admin-header p {
    color: #666;
    font-size: 1.1rem;
  }

  /* Tab Navigation */
  .tab-navigation {
    display: flex;
    gap: 10px;
    margin-bottom: 30px;
    flex-wrap: wrap;
  }

  .tab-button {
    padding: 12px 24px;
    border: none;
    background: white;
    color: #666;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s;
  }

  .tab-button:hover {
    background: #f0f0f0;
  }

  .tab-button.active {
    background: #667eea;
    color: white;
  }

  /* Dashboard Stats */
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

  /* Company Management */
  .companies-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
  }

  .add-company-form {
    background: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    margin-bottom: 30px;
  }

  .add-company-form h3 {
    margin-bottom: 20px;
    color: #333;
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

  .form-group input {
    width: 100%;
    padding: 12px;
    border: 2px solid #e9ecef;
    border-radius: 6px;
    font-size: 1rem;
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

  /* Responsive Design */
  @media (max-width: 768px) {
    .nav-menu {
      display: none;
    }

    .admin-header h1 {
      font-size: 2rem;
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