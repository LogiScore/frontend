<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { auth } from '$lib/auth';
  import { apiClient } from '$lib/api';
  import SubscriptionManagementModal from './SubscriptionManagementModal.svelte';

  export let isOpen = false;

  const dispatch = createEventDispatcher();

  // Form data
  let formData = {
    full_name: '',
    email: '',
    company_name: '',
    user_type: 'shipper'
  };

  // Subscription data
  let subscriptionData: any = null;
  let isLoadingSubscription = false;
  let subscriptionError = '';
  let isCanceling = false;
  let isReactivating = false;
  let isTogglingAutoRenewal = false;
  let isOpeningBillingPortal = false;
  let hasLoadedSubscription = false;
  let showSubscriptionManagement = false;

  // Get user data from auth store
  let authState: { user: any; token: string | null; isLoading: boolean; error: string | null } = {
    user: null,
    token: null,
    isLoading: false,
    error: null
  };

  // Subscribe to auth store
  auth.subscribe(state => {
    authState = state;
    if (state.user) {
      // Initialize form data with current user data
      formData = {
        full_name: state.user.full_name || state.user.username || '',
        email: state.user.email || '',
        company_name: state.user.company_name || '',
        user_type: state.user.user_type || 'shipper'
      };
    }
  });

  // Watch for modal opening to refresh data
  $: if (isOpen && authState.user) {
    formData = {
      full_name: authState.user.full_name || authState.user.username || '',
      email: authState.user.email || '',
      company_name: authState.user.company_name || '',
      user_type: authState.user.user_type || 'shipper'
    };
    
    // Load subscription data only once when modal opens
    if (!hasLoadedSubscription && authState.token) {
      hasLoadedSubscription = true;
      loadSubscriptionData();
    }
  }

  // Reset flag when modal closes
  $: if (!isOpen) {
    hasLoadedSubscription = false;
  }

  async function loadSubscriptionData() {
    if (!authState.token) return;
    
    try {
      isLoadingSubscription = true;
      subscriptionError = '';
      
      // Small delay to prevent rapid re-renders
      await new Promise(resolve => setTimeout(resolve, 100));
      
      subscriptionData = await apiClient.getCurrentSubscription(authState.token);
    } catch (err: any) {
      console.error('Failed to load subscription:', err);
      subscriptionError = err.message || 'Failed to load subscription information';
    } finally {
      isLoadingSubscription = false;
    }
  }

  async function handleCancelSubscription() {
    if (!authState.token) {
      alert('Authentication required');
      return;
    }

    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.')) {
      return;
    }

    try {
      isCanceling = true;
      const result = await apiClient.cancelSubscription(authState.token);
      await loadSubscriptionData(); // Reload subscription data
      alert(result.message);
    } catch (err: any) {
      console.error('Failed to cancel subscription:', err);
      alert(err.message || 'Failed to cancel subscription');
    } finally {
      isCanceling = false;
    }
  }

  async function handleReactivateSubscription() {
    if (!authState.token) {
      alert('Authentication required');
      return;
    }

    try {
      isReactivating = true;
      const result = await apiClient.reactivateSubscription(authState.token);
      await loadSubscriptionData(); // Reload subscription data
      alert(result.message);
    } catch (err: any) {
      console.error('Failed to reactivate subscription:', err);
      alert(err.message || 'Failed to reactivate subscription');
    } finally {
      isReactivating = false;
    }
  }

  function handleBillingPortal() {
    showSubscriptionManagement = true;
  }

  function closeSubscriptionManagement() {
    showSubscriptionManagement = false;
  }

  function handleSubscriptionUpdated(event: CustomEvent) {
    // Reload subscription data when subscription is updated
    loadSubscriptionData();
  }

  function handleUpgrade(event: CustomEvent) {
    // Close the subscription management modal
    showSubscriptionManagement = false;
    
    // Redirect to pricing page for payment
    window.location.href = '/pricing';
  }

  async function handleToggleAutoRenewal() {
    if (!authState.token) {
      alert('Authentication required');
      return;
    }

    if (!subscriptionData) {
      alert('No subscription data available');
      return;
    }

    const newAutoRenewalState = !subscriptionData.auto_renew;
    const action = newAutoRenewalState ? 'enable' : 'disable';
    
    if (!confirm(`Are you sure you want to ${action} auto-renewal?`)) {
      return;
    }

    try {
      isTogglingAutoRenewal = true;
      const result = await apiClient.toggleAutoRenewal(authState.token, newAutoRenewalState);
      
      // Update local subscription data
      subscriptionData.auto_renew = result.auto_renew;
      
      alert(result.message);
    } catch (err: any) {
      console.error('Failed to toggle auto-renewal:', err);
      alert(err.message || 'Failed to update auto-renewal setting');
    } finally {
      isTogglingAutoRenewal = false;
    }
  }

  function formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'active':
        return '#10b981'; // Green
      case 'trial':
        return '#3b82f6'; // Blue
      case 'past_due':
        return '#f59e0b'; // Yellow
      case 'canceled':
        return '#6b7280'; // Gray
      case 'expired':
        return '#ef4444'; // Red
      default:
        return '#6b7280'; // Gray
    }
  }

  function getStatusText(status: string): string {
    switch (status) {
      case 'active':
        return 'Active';
      case 'trial':
        return 'Trial';
      case 'past_due':
        return 'Past Due';
      case 'canceled':
        return 'Canceled';
      case 'expired':
        return 'Expired';
      default:
        return status;
    }
  }

  function closeModal() {
    dispatch('close');
  }
</script>

{#if isOpen}
  <div class="modal-overlay" on:click|self={closeModal}>
    <div class="modal-content" on:click|stopPropagation>
      <div class="modal-header">
        <h2>View Profile</h2>
        <button class="close-btn" on:click={closeModal}>&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="profile-info">
          <div class="profile-field">
            <label for="full_name">Full Name</label>
            <div class="profile-value" id="full_name">
              {formData.full_name}
            </div>
          </div>

          <div class="profile-field">
            <label for="email">Email</label>
            <div class="profile-value" id="email">
              {formData.email}
            </div>
          </div>

          <div class="profile-field">
            <label for="company_name">Company Name</label>
            <div class="profile-value" id="company_name">
              {formData.company_name || 'Not specified'}
            </div>
          </div>

          <div class="profile-field">
            <label for="user_type">User Type</label>
            <div class="profile-value" id="user_type">
              {formData.user_type === 'shipper' ? 'Shipper' : 'Freight Forwarder'}
            </div>
          </div>
        </div>

        <!-- Subscription Details Section -->
        <div class="subscription-section">
          <h3>Subscription Details</h3>
          
          {#key isOpen}
            {#if isLoadingSubscription}
            <div class="loading-state">
              <div class="spinner"></div>
              <p>Loading subscription information...</p>
            </div>
          {:else if subscriptionError}
            <div class="error-state">
              <p class="error-message">{subscriptionError}</p>
              <button class="btn-retry" on:click={loadSubscriptionData}>Retry</button>
            </div>
          {:else if subscriptionData}
            <div class="subscription-details">
              <div class="subscription-field">
                <label>Plan</label>
                <div class="subscription-value">
                  <span class="plan-name">{subscriptionData.tier || 'Free'}</span>
                  <span class="status-badge" style="background-color: {getStatusColor(subscriptionData.status)}">
                    {getStatusText(subscriptionData.status)}
                  </span>
                </div>
              </div>

              {#if subscriptionData.status === 'trial'}
                <div class="subscription-field">
                  <label>Trial Expires</label>
                  <div class="subscription-value">
                    {formatDate(subscriptionData.end_date)}
                    {#if subscriptionData.days_remaining !== undefined}
                      <span class="days-remaining">
                        ({subscriptionData.days_remaining} days remaining)
                      </span>
                    {/if}
                  </div>
                </div>
              {:else if subscriptionData.status === 'active'}
                <div class="subscription-field">
                  <label>Next Billing Date</label>
                  <div class="subscription-value">
                    {formatDate(subscriptionData.next_billing_date)}
                  </div>
                </div>
                <div class="subscription-field">
                  <label>Subscription Ends</label>
                  <div class="subscription-value">
                    {formatDate(subscriptionData.end_date)}
                  </div>
                </div>
              {:else if subscriptionData.status === 'canceled'}
                <div class="subscription-field">
                  <label>Access Ends</label>
                  <div class="subscription-value">
                    {formatDate(subscriptionData.end_date)}
                  </div>
                </div>
              {/if}

              {#if subscriptionData.auto_renew !== undefined}
                <div class="subscription-field">
                  <label>Auto Renewal</label>
                  <div class="subscription-value">
                    <span class="auto-renew" class:enabled={subscriptionData.auto_renew}>
                      {subscriptionData.auto_renew ? 'Enabled' : 'Disabled'}
                    </span>
                    <button 
                      class="btn-toggle" 
                      on:click={handleToggleAutoRenewal} 
                      disabled={isTogglingAutoRenewal}
                      title={subscriptionData.auto_renew ? 'Disable auto-renewal' : 'Enable auto-renewal'}
                    >
                      {isTogglingAutoRenewal ? '...' : (subscriptionData.auto_renew ? 'Disable' : 'Enable')}
                    </button>
                  </div>
                </div>
              {/if}
            </div>

            <!-- Subscription Actions -->
            <div class="subscription-actions">
              {#if subscriptionData.status === 'active'}
                <button class="btn-secondary" on:click={handleBillingPortal}>
                  Manage Billing
                </button>
                <button class="btn-danger" on:click={handleCancelSubscription} disabled={isCanceling}>
                  {isCanceling ? 'Canceling...' : 'Cancel Subscription'}
                </button>
              {:else if subscriptionData.status === 'canceled'}
                <button class="btn-primary" on:click={handleReactivateSubscription} disabled={isReactivating}>
                  {isReactivating ? 'Reactivating...' : 'Reactivate Subscription'}
                </button>
              {:else if subscriptionData.status === 'trial'}
                <button class="btn-secondary" on:click={handleBillingPortal}>
                  Manage Billing
                </button>
                <button class="btn-danger" on:click={handleCancelSubscription} disabled={isCanceling}>
                  {isCanceling ? 'Canceling...' : 'Cancel Trial'}
                </button>
              {:else if subscriptionData.status === 'expired'}
                <button class="btn-primary" on:click={() => window.location.href = '/pricing'}>
                  Upgrade Plan
                </button>
              {/if}
            </div>
          {:else}
            <div class="no-subscription">
              <p>No subscription information available.</p>
              <button class="btn-primary" on:click={() => window.location.href = '/pricing'}>
                View Plans
              </button>
            </div>
          {/if}
          {/key}
        </div>

        <div class="form-actions">
          <button type="button" class="btn-secondary" on:click={closeModal}>
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Subscription Management Modal -->
<SubscriptionManagementModal 
  bind:isOpen={showSubscriptionManagement}
  on:close={closeSubscriptionManagement}
  on:subscriptionUpdated={handleSubscriptionUpdated}
  on:upgrade={handleUpgrade}
/>

<style>
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

  .profile-field {
    margin-bottom: 20px;
  }

  .profile-field label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #333;
  }

  .profile-value {
    font-size: 1rem;
    color: #495057;
    padding: 8px 0;
    border-bottom: 1px solid #e9ecef;
    min-height: 24px;
    display: flex;
    align-items: center;
  }

  .form-actions {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-top: 20px;
    padding: 20px;
    border-top: 1px solid #e9ecef;
  }

  .btn-secondary {
    background: #6c757d;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: background-color 0.2s;
  }

  .btn-secondary:hover:not(:disabled) {
    background: #545b62;
  }

  /* Subscription Section Styles */
  .subscription-section {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 2px solid #e9ecef;
  }

  .subscription-section h3 {
    margin: 0 0 20px 0;
    color: #333;
    font-size: 1.3rem;
    font-weight: 600;
  }

  .subscription-details {
    margin-bottom: 20px;
  }

  .subscription-field {
    margin-bottom: 15px;
  }

  .subscription-field label {
    display: block;
    margin-bottom: 5px;
    font-weight: 600;
    color: #555;
    font-size: 0.9rem;
  }

  .subscription-value {
    font-size: 1rem;
    color: #495057;
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;
    min-height: 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
  }

  .plan-name {
    font-weight: 600;
    color: #333;
  }

  .status-badge {
    color: white;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  .days-remaining {
    color: #666;
    font-size: 0.9rem;
    font-style: italic;
  }

  .auto-renew {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.9rem;
    font-weight: 600;
  }

  .auto-renew.enabled {
    background: #d4edda;
    color: #155724;
  }

  .auto-renew:not(.enabled) {
    background: #f8d7da;
    color: #721c24;
  }

  .btn-toggle {
    background: #17a2b8;
    color: white;
    border: none;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 600;
    margin-left: 10px;
    transition: background-color 0.2s;
  }

  .btn-toggle:hover:not(:disabled) {
    background: #138496;
  }

  .btn-toggle:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .subscription-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid #e9ecef;
  }

  .btn-primary {
    background: #667eea;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
    transition: background-color 0.2s;
  }

  .btn-primary:hover:not(:disabled) {
    background: #5a6fd8;
  }

  .btn-danger {
    background: #dc3545;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
    transition: background-color 0.2s;
  }

  .btn-danger:hover:not(:disabled) {
    background: #c82333;
  }

  .btn-danger:disabled,
  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-retry {
    background: #17a2b8;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
    margin-top: 10px;
  }

  .btn-retry:hover {
    background: #138496;
  }

  .loading-state {
    text-align: center;
    padding: 20px;
    color: #666;
  }

  .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 10px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .error-state {
    text-align: center;
    padding: 20px;
    background: #f8d7da;
    border: 1px solid #f5c6cb;
    border-radius: 6px;
    color: #721c24;
  }

  .error-message {
    margin: 0 0 10px 0;
  }

  .no-subscription {
    text-align: center;
    padding: 20px;
    color: #666;
  }

  .no-subscription p {
    margin: 0 0 15px 0;
  }

  /* Responsive adjustments */
  @media (max-width: 480px) {
    .subscription-value {
      flex-direction: column;
      align-items: flex-start;
    }

    .subscription-actions {
      flex-direction: column;
    }

    .subscription-actions button {
      width: 100%;
    }
  }
</style> 