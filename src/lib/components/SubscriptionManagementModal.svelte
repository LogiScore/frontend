<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { apiClient } from '$lib/api';
  import { auth, authMethods } from '$lib/auth';
  import { getPlansForUserType, type Plan } from '$lib/subscription-plans';

  export let isOpen = false;

  const dispatch = createEventDispatcher();

  let subscriptionData: any = null;
  let availablePlans: Plan[] = [];
  let isLoading = false;
  let error = '';
  let success = '';
  let isUpgrading = false;
  let isCanceling = false;

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
  });

  // Load data when modal opens
  $: if (isOpen && authState.user && authState.token) {
    loadSubscriptionData();
    loadAvailablePlans();
  }

  async function loadSubscriptionData() {
    if (!authState.token) return;
    
    try {
      isLoading = true;
      error = '';
      subscriptionData = await apiClient.getCurrentSubscription(authState.token);
    } catch (err: any) {
      console.error('Failed to load subscription:', err);
      error = err.message || 'Failed to load subscription information';
    } finally {
      isLoading = false;
    }
  }

  async function loadAvailablePlans() {
    if (!authState.user) return;
    
    try {
      availablePlans = getPlansForUserType(authState.user.user_type);
    } catch (err: any) {
      console.error('Failed to load plans:', err);
    }
  }

  async function handleUpgrade(plan: Plan) {
    if (!authState.token || !subscriptionData) return;

    if (plan.price <= (subscriptionData.price || 0)) {
      alert('Please select a higher-tier plan to upgrade.');
      return;
    }

    // Check if user has an active paid subscription
    const hasActivePaidSubscription = subscriptionData.status === 'active' && subscriptionData.price > 0;
    
    if (hasActivePaidSubscription) {
      // For existing paid subscribers, do direct upgrade
      if (!confirm(`Are you sure you want to upgrade to ${plan.name} for $${plan.price}/${plan.billingCycle}?`)) {
        return;
      }

      try {
        isUpgrading = true;
        error = '';
        success = '';

        // Map plan names to tier names that the backend expects
        let tierName = '';
        if (plan.name === 'Subscription Monthly') {
          tierName = 'monthly';
        } else if (plan.name === 'Subscription Annual') {
          tierName = 'annual';
        } else if (plan.name === 'Subscription Annual Plus') {
          tierName = 'enterprise';
        } else {
          // Fallback to plan name if no mapping found
          tierName = plan.name.toLowerCase().replace(' ', '_');
        }

        console.log('Upgrading subscription:', {
          planName: plan.name,
          tierName: tierName,
          price: plan.price
        });

        const result = await apiClient.upgradeSubscription(
          authState.token,
          tierName,
          plan.name
        );

        success = result.message || 'Subscription upgraded successfully!';
        
        // Reload subscription data
        await loadSubscriptionData();
        
        // Update user subscription data locally as fallback
        await authMethods.updateUserSubscriptionData({
          tier: subscriptionData?.tier,
          start_date: subscriptionData?.start_date,
          end_date: subscriptionData?.end_date
        });
        
        // Refresh user data from backend to get updated subscription_tier
        await authMethods.refreshUserData();

        // Notify parent
        dispatch('subscriptionUpdated', { action: 'upgraded', plan: plan.name });
      } catch (err: any) {
        console.error('Failed to upgrade subscription:', err);
        error = err.message || 'Failed to upgrade subscription';
      } finally {
        isUpgrading = false;
      }
    } else {
      // For free users or trial users, redirect to payment page
      dispatch('upgrade', { plan: plan });
      closeModal();
    }
  }

  async function handleCancel() {
    if (!authState.token || !subscriptionData) return;

    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.')) {
      return;
    }

    try {
      isCanceling = true;
      error = '';
      success = '';

      const result = await apiClient.cancelSubscription(authState.token);
      success = result.message || 'Subscription canceled successfully!';
      
      // Reload subscription data
      await loadSubscriptionData();
      
      // Update user subscription data locally as fallback
      await authMethods.updateUserSubscriptionData({
        tier: subscriptionData?.tier,
        start_date: subscriptionData?.start_date,
        end_date: subscriptionData?.end_date
      });
      
      // Refresh user data from backend to get updated subscription_tier
      await authMethods.refreshUserData();
      
      // Notify parent
      dispatch('subscriptionUpdated', { action: 'canceled' });
    } catch (err: any) {
      console.error('Failed to cancel subscription:', err);
      error = err.message || 'Failed to cancel subscription';
    } finally {
      isCanceling = false;
    }
  }

  function closeModal() {
    dispatch('close');
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
        return '#10b981';
      case 'trial':
        return '#3b82f6';
      case 'past_due':
        return '#f59e0b';
      case 'canceled':
        return '#6b7280';
      case 'expired':
        return '#ef4444';
      default:
        return '#6b7280';
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
</script>

{#if isOpen}
  <div class="modal-overlay" on:click={closeModal}>
    <div class="modal-content" on:click|stopPropagation>
      <div class="modal-header">
        <h2>Manage Subscription</h2>
        <button class="close-btn" on:click={closeModal}>&times;</button>
      </div>
      
      <div class="modal-body">
        {#if isLoading}
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Loading subscription information...</p>
          </div>
        {:else if error}
          <div class="error-state">
            <p class="error-message">{error}</p>
            <button type="button" class="btn-retry" on:click={loadSubscriptionData}>Retry</button>
          </div>
        {:else if success}
          <div class="success-state">
            <p class="success-message">{success}</p>
          </div>
        {/if}

        {#if subscriptionData}
          <!-- Current Subscription -->
          <div class="current-subscription">
            <h3>Current Plan</h3>
            <div class="subscription-card">
              <div class="plan-header">
                <h4>{subscriptionData.tier || 'Free'}</h4>
                <span class="status-badge" style="background-color: {getStatusColor(subscriptionData.status)}">
                  {getStatusText(subscriptionData.status)}
                </span>
              </div>
              
              {#if subscriptionData.status === 'trial'}
                <div class="trial-info">
                  <p><strong>Trial expires:</strong> {formatDate(subscriptionData.end_date)}</p>
                  {#if subscriptionData.days_remaining !== undefined}
                    <p class="days-remaining">({subscriptionData.days_remaining} days remaining)</p>
                  {/if}
                </div>
              {:else if subscriptionData.status === 'active'}
                <div class="billing-info">
                  <p><strong>Next billing:</strong> {formatDate(subscriptionData.next_billing_date)}</p>
                  <p><strong>Subscription ends:</strong> {formatDate(subscriptionData.end_date)}</p>
                </div>
              {/if}
            </div>
          </div>

          <!-- Available Plans -->
          {#if subscriptionData.status !== 'canceled' && subscriptionData.status !== 'expired'}
            <div class="available-plans">
              <h3>Available Plans</h3>
              <div class="plans-grid">
                {#each availablePlans as plan}
                  {#if plan.price > 0}
                    <div class="plan-card" class:current={plan.name.toLowerCase().replace(' ', '_') === subscriptionData.tier}>
                      <div class="plan-header">
                        <h4>{plan.name}</h4>
                        <div class="plan-price">${plan.price}/{plan.billingCycle}</div>
                      </div>
                      
                      <div class="plan-features">
                        <ul>
                          {#each plan.features.slice(0, 3) as feature}
                            <li>✓ {feature}</li>
                          {/each}
                        </ul>
                      </div>
                      
                      <div class="plan-actions">
                        {#if plan.name.toLowerCase().replace(' ', '_') === subscriptionData.tier}
                          <button type="button" class="btn-current" disabled>Current Plan</button>
                        {:else if plan.price > (subscriptionData.price || 0)}
                          <button 
                            type="button"
                            class="btn-upgrade" 
                            on:click={() => handleUpgrade(plan)}
                            disabled={isUpgrading}
                          >
                            {isUpgrading ? 'Upgrading...' : 'Upgrade'}
                          </button>
                        {:else}
                          <button type="button" class="btn-downgrade" disabled>
                            Downgrade (Contact Support)
                          </button>
                        {/if}
                      </div>
                    </div>
                  {/if}
                {/each}
              </div>
            </div>
          {/if}

          <!-- Subscription Actions -->
          <div class="subscription-actions">
            {#if subscriptionData.status === 'active' || subscriptionData.status === 'trial'}
              <button 
                type="button"
                class="btn-danger" 
                on:click={handleCancel}
                disabled={isCanceling}
              >
                {isCanceling ? 'Canceling...' : 'Cancel Subscription'}
              </button>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

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
    max-width: 800px;
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

  .loading-state {
    text-align: center;
    padding: 40px;
    color: #666;
  }

  .spinner {
    width: 30px;
    height: 30px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 15px;
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
    margin-bottom: 20px;
  }

  .success-state {
    text-align: center;
    padding: 20px;
    background: #d4edda;
    border: 1px solid #c3e6cb;
    border-radius: 6px;
    color: #155724;
    margin-bottom: 20px;
  }

  .error-message, .success-message {
    margin: 0 0 10px 0;
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
  }

  .btn-retry:hover {
    background: #138496;
  }

  .current-subscription {
    margin-bottom: 30px;
  }

  .current-subscription h3 {
    margin: 0 0 15px 0;
    color: #333;
  }

  .subscription-card {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 20px;
  }

  .plan-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }

  .plan-header h4 {
    margin: 0;
    color: #333;
    font-size: 1.2rem;
  }

  .status-badge {
    color: white;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  .trial-info, .billing-info {
    color: #666;
    font-size: 0.9rem;
  }

  .trial-info p, .billing-info p {
    margin: 5px 0;
  }

  .days-remaining {
    font-style: italic;
    color: #999;
  }

  .available-plans h3 {
    margin: 0 0 20px 0;
    color: #333;
  }

  .plans-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
  }

  .plan-card {
    background: white;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    padding: 20px;
    transition: all 0.3s ease;
  }

  .plan-card:hover {
    border-color: #667eea;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  }

  .plan-card.current {
    border-color: #10b981;
    background: #f0fdf4;
  }

  .plan-card .plan-header {
    margin-bottom: 15px;
  }

  .plan-price {
    font-size: 1.1rem;
    font-weight: 600;
    color: #667eea;
  }

  .plan-features ul {
    list-style: none;
    padding: 0;
    margin: 0 0 20px 0;
  }

  .plan-features li {
    padding: 5px 0;
    color: #666;
    font-size: 0.9rem;
  }

  .plan-actions {
    text-align: center;
  }

  .btn-current, .btn-upgrade, .btn-downgrade, .btn-danger {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
    transition: background-color 0.2s;
  }

  .btn-current {
    background: #10b981;
    color: white;
    cursor: not-allowed;
  }

  .btn-upgrade {
    background: #667eea;
    color: white;
  }

  .btn-upgrade:hover:not(:disabled) {
    background: #5a6fd8;
  }

  .btn-downgrade {
    background: #6c757d;
    color: white;
    cursor: not-allowed;
  }

  .btn-danger {
    background: #dc3545;
    color: white;
  }

  .btn-danger:hover:not(:disabled) {
    background: #c82333;
  }

  .btn-current:disabled,
  .btn-upgrade:disabled,
  .btn-downgrade:disabled,
  .btn-danger:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .subscription-actions {
    text-align: center;
    padding-top: 20px;
    border-top: 1px solid #e9ecef;
  }

  @media (max-width: 768px) {
    .plans-grid {
      grid-template-columns: 1fr;
    }
    
    .plan-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }
  }
</style>
