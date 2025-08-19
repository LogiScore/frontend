<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { apiClient } from '$lib/api';
  import { auth } from '$lib/auth';

  export let showActions: boolean = true;

  const dispatch = createEventDispatcher();

  let currentSubscription: any = null;
  let isLoading = true;
  let error = '';
  let isCanceling = false;
  let isReactivating = false;
  let isUpgrading = false;

  onMount(async () => {
    await loadCurrentSubscription();
  });

  async function loadCurrentSubscription() {
    try {
      isLoading = true;
      error = '';
      
      const currentAuth = $auth;
      if (!currentAuth.user || !currentAuth.token) {
        throw new Error('User not authenticated');
      }

      const subscription = await apiClient.getCurrentSubscription(currentAuth.token);
      currentSubscription = subscription;
    } catch (err: any) {
      console.error('Failed to load subscription:', err);
      error = err.message || 'Failed to load subscription information';
    } finally {
      isLoading = false;
    }
  }

  async function handleCancel() {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.')) {
      return;
    }

    try {
      isCanceling = true;
      const currentAuth = $auth;
      if (!currentAuth.token) {
        throw new Error('User not authenticated');
      }

      const result = await apiClient.cancelSubscription(currentAuth.token);
      
      // Reload subscription data
      await loadCurrentSubscription();
      
      // Notify parent component
      dispatch('subscriptionUpdated', { action: 'canceled', message: result.message });
    } catch (err: any) {
      console.error('Failed to cancel subscription:', err);
      error = err.message || 'Failed to cancel subscription';
    } finally {
      isCanceling = false;
    }
  }

  async function handleReactivate() {
    try {
      isReactivating = true;
      const currentAuth = $auth;
      if (!currentAuth.token) {
        throw new Error('User not authenticated');
      }

      const result = await apiClient.reactivateSubscription(currentAuth.token);
      
      // Reload subscription data
      await loadCurrentSubscription();
      
      // Notify parent component
      dispatch('subscriptionUpdated', { action: 'reactivated', message: result.message });
    } catch (err: any) {
      console.error('Failed to reactivate subscription:', err);
      error = err.message || 'Failed to reactivate subscription';
    } finally {
      isReactivating = false;
    }
  }

  async function handleBillingPortal() {
    try {
      const currentAuth = $auth;
      if (!currentAuth.token) {
        throw new Error('User not authenticated');
      }

      const result = await apiClient.getBillingPortal(currentAuth.token);
      
      // Open billing portal in new window
      window.open(result.url, '_blank');
    } catch (err: any) {
      console.error('Failed to get billing portal:', err);
      error = err.message || 'Failed to access billing portal';
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

  function formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function getDaysRemaining(endDate: string): number {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }
</script>

<div class="subscription-status">
  {#if isLoading}
    <div class="loading">
      <div class="loading-spinner"></div>
      <p>Loading subscription information...</p>
    </div>
  {:else if error}
    <div class="error">
      <p>{error}</p>
      <button class="btn-retry" on:click={loadCurrentSubscription}>
        Try Again
      </button>
    </div>
  {:else if currentSubscription}
    <div class="subscription-card">
      <div class="subscription-header">
        <h3>Current Subscription</h3>
        <div class="status-badge" style="background-color: {getStatusColor(currentSubscription.status)}">
          {getStatusText(currentSubscription.status)}
        </div>
      </div>

      <div class="subscription-details">
        <div class="detail-row">
          <span class="label">Plan:</span>
          <span class="value">{currentSubscription.tier}</span>
        </div>
        
        <div class="detail-row">
          <span class="label">Start Date:</span>
          <span class="value">{formatDate(currentSubscription.start_date)}</span>
        </div>
        
        <div class="detail-row">
          <span class="label">End Date:</span>
          <span class="value">{formatDate(currentSubscription.end_date)}</span>
        </div>
        
        {#if currentSubscription.days_remaining !== undefined}
          <div class="detail-row">
            <span class="label">Days Remaining:</span>
            <span class="value days-remaining {currentSubscription.days_remaining <= 7 ? 'warning' : ''}">
              {currentSubscription.days_remaining} days
            </span>
          </div>
        {/if}
        
        <div class="detail-row">
          <span class="label">Auto-Renew:</span>
          <span class="value">{currentSubscription.auto_renew ? 'Yes' : 'No'}</span>
        </div>
      </div>

      {#if showActions}
        <div class="subscription-actions">
          {#if currentSubscription.status === 'active'}
            <button class="btn-secondary" on:click={handleBillingPortal}>
              Manage Billing
            </button>
            <button class="btn-danger" on:click={handleCancel} disabled={isCanceling}>
              {isCanceling ? 'Canceling...' : 'Cancel Subscription'}
            </button>
          {:else if currentSubscription.status === 'canceled'}
            <button class="btn-primary" on:click={handleReactivate} disabled={isReactivating}>
              {isReactivating ? 'Reactivating...' : 'Reactivate'}
            </button>
          {:else if currentSubscription.status === 'expired'}
            <button class="btn-primary" on:click={() => dispatch('upgrade')}>
              Upgrade Plan
            </button>
          {/if}
        </div>
      {/if}
    </div>
  {:else}
    <div class="no-subscription">
      <p>No active subscription found.</p>
      <button class="btn-primary" on:click={() => dispatch('upgrade')}>
        Get Started
      </button>
    </div>
  {/if}
</div>

<style>
  .subscription-status {
    max-width: 600px;
    margin: 0 auto;
  }

  .loading {
    text-align: center;
    padding: 40px 20px;
    color: #666;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .error {
    background: #f8d7da;
    color: #721c24;
    padding: 20px;
    border-radius: 8px;
    border: 1px solid #f5c6cb;
    text-align: center;
  }

  .btn-retry {
    background: #007bff;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 10px;
  }

  .btn-retry:hover {
    background: #0056b3;
  }

  .subscription-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .subscription-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e5e7eb;
  }

  .subscription-header h3 {
    margin: 0;
    color: #111827;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .status-badge {
    color: white;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 500;
    text-transform: capitalize;
  }

  .subscription-details {
    margin-bottom: 24px;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f3f4f6;
  }

  .detail-row:last-child {
    border-bottom: none;
  }

  .label {
    font-weight: 500;
    color: #374151;
  }

  .value {
    color: #111827;
    font-weight: 600;
  }

  .days-remaining {
    color: #059669;
  }

  .days-remaining.warning {
    color: #d97706;
  }

  .subscription-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    padding-top: 20px;
    border-top: 1px solid #e5e7eb;
  }

  .btn-primary, .btn-secondary, .btn-danger {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s;
  }

  .btn-primary {
    background: #007bff;
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: #0056b3;
  }

  .btn-primary:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }

  .btn-secondary {
    background: #6c757d;
    color: white;
  }

  .btn-secondary:hover:not(:disabled) {
    background: #545b62;
  }

  .btn-secondary:disabled {
    background: #adb5bd;
    cursor: not-allowed;
  }

  .btn-danger {
    background: #dc3545;
    color: white;
  }

  .btn-danger:hover:not(:disabled) {
    background: #c82333;
  }

  .btn-danger:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }

  .no-subscription {
    text-align: center;
    padding: 40px 20px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 2px dashed #dee2e6;
  }

  .no-subscription p {
    margin: 0 0 20px 0;
    color: #6c7280;
    font-size: 1.1rem;
  }

  @media (max-width: 600px) {
    .subscription-header {
      flex-direction: column;
      gap: 12px;
      align-items: flex-start;
    }

    .subscription-actions {
      flex-direction: column;
    }

    .btn-primary, .btn-secondary, .btn-danger {
      width: 100%;
    }
  }
</style>
