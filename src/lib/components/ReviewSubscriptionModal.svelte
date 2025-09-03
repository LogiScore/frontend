<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { auth } from '$lib/auth';
  import { apiClient } from '$lib/api';

  export let isOpen = false;

  const dispatch = createEventDispatcher();

  // Subscription data
  let subscriptions: Array<{
    id: string;
    freight_forwarder_id?: string;
    freight_forwarder_name?: string;
    location_country?: string;
    location_city?: string;
    review_type?: string;
    notification_frequency: string;
    is_active: boolean;
    created_at: string;
  }> = [];

  // UI state
  let isLoading = false;
  let error = '';
  let success = '';

  // Auth state
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

  // Load subscriptions when modal opens
  $: if (isOpen && authState.token) {
    loadSubscriptions();
  }

  onMount(async () => {
    console.log('ReviewSubscriptionModal: onMount called, isOpen:', isOpen, 'hasToken:', !!authState.token);
    if (isOpen && authState.token) {
      await loadSubscriptions();
    }
  });

  async function loadSubscriptions() {
    if (!authState.token) return;
    
    try {
      isLoading = true;
      error = '';
      const result = await apiClient.getReviewSubscriptions(authState.token);
      subscriptions = result.subscriptions;
      console.log('Review Notifications Modal: Loaded subscriptions:', subscriptions);
    } catch (err: any) {
      console.error('Failed to load subscriptions:', err);
      error = err.message || 'Failed to load subscriptions';
    } finally {
      isLoading = false;
    }
  }

  function closeModal() {
    console.log('ReviewSubscriptionModal: closeModal called');
    try {
      dispatch('close');
      // Reset state
      error = '';
      success = '';
    } catch (err) {
      console.error('Error in closeModal:', err);
    }
  }



  async function toggleSubscription(subscriptionId: string) {
    console.log('ReviewSubscriptionModal: toggleSubscription called for ID:', subscriptionId);
    if (!authState.token) return;
    
    try {
      const result = await apiClient.toggleReviewSubscription(authState.token, subscriptionId);
      success = result.message;
      await loadSubscriptions(); // Reload to get updated status
    } catch (err: any) {
      console.error('Failed to toggle subscription:', err);
      error = err.message || 'Failed to toggle subscription';
    }
  }

  async function deleteSubscription(subscriptionId: string) {
    console.log('ReviewSubscriptionModal: deleteSubscription called for ID:', subscriptionId);
    if (!authState.token) return;
    
    if (!confirm('Are you sure you want to delete this subscription?')) return;
    
    try {
      const result = await apiClient.deleteReviewSubscription(authState.token, subscriptionId);
      success = result.message;
      await loadSubscriptions(); // Reload to remove deleted item
    } catch (err: any) {
      console.error('Failed to delete subscription:', err);
      error = err.message || 'Failed to delete subscription';
    }
  }


</script>

{#if isOpen}
  <div class="modal-overlay" on:click|self={closeModal} on:mousedown={() => console.log('Modal overlay mousedown')}>
    <div class="modal-content" on:click|stopPropagation on:mousedown={() => console.log('Modal content mousedown')}>
      <div class="modal-header">
        <h2>Review Notifications</h2>
        <button class="close-btn" on:click={closeModal} on:mousedown={() => console.log('Close button mousedown')} on:mouseup={() => console.log('Close button mouseup')}>&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="subscription-info">
          <p>🔔 Manage your review notification subscriptions below.</p>
          {#if authState.user.user_type === 'shipper'}
            <p><strong>Note:</strong> This feature is available with the Annual Subscription plan.</p>
            <p>You can:</p>
            <ul>
              <li>View your current notification subscriptions</li>
              <li>Enable or disable notifications for specific subscriptions</li>
              <li>Delete subscriptions you no longer need</li>
            </ul>
          {:else if authState.user.user_type === 'forwarder'}
            <p><strong>Note:</strong> This feature is available with the Enterprise Annual Plus plan.</p>
            <p>You can:</p>
            <ul>
              <li>View your notification status</li>
              <li>Monitor your review notification settings</li>
            </ul>
          {/if}
        </div>

        <!-- Error/Success Messages -->
        {#if error}
          <div class="alert alert-error">{error}</div>
        {/if}
        {#if success}
          <div class="alert alert-success">{success}</div>
        {/if}

        <!-- Different functionality for shippers vs forwarders -->
        {#if authState.user.user_type === 'shipper'}
          <!-- Shipper functionality: View and manage existing subscriptions -->
          <div class="subscriptions-section">
            <h3>Your Subscriptions</h3>
            
            {#if isLoading}
              <div class="loading">Loading subscriptions...</div>
            {:else if !subscriptions || subscriptions.length === 0}
              <div class="no-subscriptions">
                <p>You don't have any review subscriptions yet.</p>
                <p>Subscriptions are created automatically when you submit reviews or can be set up through your account settings.</p>
              </div>
            {:else}
              <div class="subscriptions-list">
                {#each subscriptions as subscription}
                  <div class="subscription-item" class:inactive={!subscription.is_active}>
                    <div class="subscription-header">
                      <h4>
                        {#if subscription.freight_forwarder_name}
                          {subscription.freight_forwarder_name}
                        {:else if subscription.location_country}
                          {subscription.location_country}
                          {#if subscription.location_city}
                            - {subscription.location_city}
                          {/if}
                        {:else if subscription.location_city}
                          {subscription.location_city}
                        {:else}
                          General Reviews
                        {/if}
                      </h4>
                      <div class="subscription-actions">
                        <button 
                          class="btn-small" 
                          class:btn-active={subscription.is_active}
                          on:click={() => toggleSubscription(subscription.id)}
                        >
                          {subscription.is_active ? 'Active' : 'Inactive'}
                        </button>
                        <button 
                          class="btn-small btn-danger" 
                          on:click={() => deleteSubscription(subscription.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    <div class="subscription-details">
                      {#if subscription.review_type}
                        <span class="badge">Type: {subscription.review_type}</span>
                      {/if}
                      <span class="badge">Frequency: {subscription.notification_frequency}</span>
                      <span class="badge">Created: {new Date(subscription.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </div>

        {:else if authState.user.user_type === 'forwarder'}
          <!-- Forwarder functionality: Simple notification status -->
          <div class="forwarder-notifications">
            <h3>Review Notifications</h3>
            <p>You will automatically receive notifications when new reviews are posted about your company.</p>
            
            <div class="notification-status">
              <div class="status-item">
                <span class="status-label">Status:</span>
                <span class="status-value active">Active</span>
              </div>
              <div class="status-item">
                <span class="status-label">Frequency:</span>
                <span class="status-value">Immediate</span>
              </div>
            </div>
            
            <div class="forwarder-info">
              <p><strong>Note:</strong> As a forwarder, you cannot modify these notification settings. They are automatically configured for your business.</p>
            </div>
          </div>
        {/if}
      </div>

      <div class="modal-actions">
        <button type="button" class="btn-secondary" on:click={closeModal}>
          Close
        </button>
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

  .subscription-info {
    margin-bottom: 24px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
  }

  .subscription-info p {
    margin: 0 0 8px 0;
    color: #495057;
  }

  .subscription-section {
    margin-bottom: 20px;
  }

  .subscription-section h3 {
    margin: 0 0 8px 0;
    color: #333;
    font-size: 1.1rem;
  }

  .subscription-section p {
    margin: 0;
    color: #666;
    font-size: 0.9rem;
  }

  .coming-soon {
    margin-top: 24px;
    padding: 16px;
    background: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 8px;
    text-align: center;
  }

  .coming-soon p {
    margin: 0;
    color: #856404;
    font-size: 0.9rem;
  }

  .modal-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    padding: 20px;
    border-top: 1px solid #e9ecef;
  }

  .btn-primary, .btn-secondary {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .btn-primary {
    background: #007bff;
    color: white;
  }

  .btn-primary:hover {
    background: #0056b3;
  }

  .btn-secondary {
    background: #6c757d;
    color: white;
  }

  .btn-secondary:hover {
    background: #545b62;
  }

  .btn-small {
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 500;
    margin-left: 8px;
  }

  .btn-small.btn-active {
    background: #28a745;
    color: white;
  }

  .btn-small.btn-active:hover {
    background: #218838;
  }

  .btn-small:not(.btn-active) {
    background: #6c757d;
    color: white;
  }

  .btn-small:not(.btn-active):hover {
    background: #545b62;
  }

  .btn-small.btn-danger {
    background: #dc3545;
    color: white;
  }

  .btn-small.btn-danger:hover {
    background: #c82333;
  }

  .subscription-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .subscription-item {
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 12px;
    background: white;
  }

  .subscription-item.inactive {
    opacity: 0.6;
    background: #f8f9fa;
  }

  .subscription-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .subscription-header h4 {
    margin: 0;
    color: #333;
    font-size: 1rem;
  }

  .subscription-details {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .badge {
    background: #e9ecef;
    color: #495057;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
  }



  .alert {
    padding: 12px 16px;
    border-radius: 4px;
    margin-bottom: 16px;
  }

  .alert-error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }

  .alert-success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }

  .loading {
    text-align: center;
    padding: 20px;
    color: #6c757d;
  }

  .no-subscriptions {
    text-align: center;
    padding: 20px;
    color: #6c757d;
  }

  .forwarder-notifications {
    text-align: center;
    padding: 20px;
  }

  .notification-status {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin: 16px 0;
  }

  .status-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .status-label {
    font-size: 0.8rem;
    color: #6c757d;
    margin-bottom: 4px;
  }

  .status-value {
    font-weight: 500;
    color: #333;
  }

  .status-value.active {
    color: #28a745;
  }

  .forwarder-info {
    margin-top: 16px;
    padding: 12px;
    background: #e9ecef;
    border-radius: 4px;
  }

  .forwarder-info p {
    margin: 0;
    font-size: 0.9rem;
    color: #495057;
  }
</style>
