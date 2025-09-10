<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { auth } from '$lib/auth';
  import { apiClient } from '$lib/api';
  import { onMount } from 'svelte';

  const dispatch = createEventDispatcher();

  // Props
  export let isOpen = false;
  export let freightForwarderId: string = '';
  export let freightForwarderName: string = '';

  // State
  let authState = $auth;
  let subscriptions: any[] = [];
  let isLoading = false;
  let error = '';
  let success = '';

  // Form data for new subscription
  let newSubscription = {
    threshold_type: 'percentage_drop' as 'percentage_drop' | 'absolute_score',
    threshold_score: 10,
    notification_frequency: 'immediate' as 'immediate' | 'daily' | 'weekly'
  };

  // Reactive statements
  $: isShipper = authState.user?.user_type === 'shipper';
  $: isAnnualSubscriber = authState.user?.subscription_tier === 'annual';

  onMount(() => {
    if (isOpen && authState.token) {
      loadSubscriptions();
    }
  });

  // Watch for modal open/close
  $: if (isOpen && authState.token) {
    loadSubscriptions();
  }

  async function loadSubscriptions() {
    if (!authState.token) return;
    
    try {
      isLoading = true;
      error = '';
      const result = await apiClient.getThresholdSubscriptions(authState.token);
      console.log('Threshold Notifications Modal: API response:', result);
      
      // Handle both response formats: direct array or object with subscriptions property
      if (Array.isArray(result)) {
        subscriptions = result;
      } else if (result && result.subscriptions && Array.isArray(result.subscriptions)) {
        subscriptions = result.subscriptions;
      } else {
        console.error('Invalid API response format:', result);
        subscriptions = [];
        error = 'Invalid response from server';
      }
      
      console.log('Threshold Notifications Modal: Loaded subscriptions:', subscriptions);
    } catch (err: any) {
      console.error('Failed to load threshold subscriptions:', err);
      error = err.message || 'Failed to load threshold subscriptions';
      subscriptions = [];
    } finally {
      isLoading = false;
    }
  }

  function closeModal() {
    console.log('ThresholdNotificationModal: closeModal called');
    try {
      dispatch('close');
      // Reset state
      error = '';
      success = '';
      newSubscription = {
        threshold_type: 'percentage_drop',
        threshold_score: 10,
        notification_frequency: 'immediate'
      };
    } catch (err) {
      console.error('Error in closeModal:', err);
    }
  }

  async function createSubscription() {
    if (!authState.token || !freightForwarderId) return;
    
    try {
      isLoading = true;
      error = '';
      
      const subscriptionData = {
        freight_forwarder_id: freightForwarderId,
        freight_forwarder_name: freightForwarderName,
        threshold_type: newSubscription.threshold_type,
        threshold_score: newSubscription.threshold_score,
        notification_frequency: newSubscription.notification_frequency
      };
      
      const result = await apiClient.createThresholdSubscription(authState.token, subscriptionData);
      success = result.message;
      await loadSubscriptions(); // Reload to get updated list
      
      // Reset form
      newSubscription = {
        threshold_type: 'percentage_drop',
        threshold_score: 10,
        notification_frequency: 'immediate'
      };
    } catch (err: any) {
      console.error('Failed to create threshold subscription:', err);
      error = err.message || 'Failed to create threshold subscription';
    } finally {
      isLoading = false;
    }
  }

  async function toggleSubscription(subscriptionId: string) {
    console.log('ThresholdNotificationModal: toggleSubscription called for ID:', subscriptionId);
    if (!authState.token) return;
    
    try {
      const result = await apiClient.toggleThresholdSubscription(authState.token, subscriptionId);
      success = result.message;
      await loadSubscriptions(); // Reload to get updated status
    } catch (err: any) {
      console.error('Failed to toggle subscription:', err);
      error = err.message || 'Failed to toggle subscription';
    }
  }

  async function deleteSubscription(subscriptionId: string) {
    if (!authState.token) return;
    
    if (!confirm('Are you sure you want to delete this threshold subscription?')) {
      return;
    }
    
    try {
      const result = await apiClient.deleteThresholdSubscription(authState.token, subscriptionId);
      success = result.message;
      await loadSubscriptions(); // Reload to get updated list
    } catch (err: any) {
      console.error('Failed to delete subscription:', err);
      error = err.message || 'Failed to delete subscription';
    }
  }

  function formatThresholdValue(subscription: any): string {
    console.log('formatThresholdValue - subscription:', subscription);
    console.log('threshold_score:', subscription.threshold_score);
    console.log('threshold_type:', subscription.threshold_type);
    
    if (subscription.threshold_type === 'percentage_drop') {
      return `${subscription.threshold_score}% drop`;
    } else {
      return `Below ${subscription.threshold_score}/5.0`;
    }
  }

  function formatLastTriggered(lastTriggered: string | undefined): string {
    if (!lastTriggered) return 'Never';
    return new Date(lastTriggered).toLocaleDateString();
  }
</script>

{#if isOpen}
  <div class="modal-overlay" on:click={closeModal}>
    <div class="modal-content" on:click|stopPropagation>
      <div class="modal-header">
        <h2>Score Threshold Notifications</h2>
        <button type="button" class="close-btn" on:click={closeModal}>&times;</button>
      </div>

      <div class="modal-body">
        {#if !isShipper}
          <div class="access-denied">
            <p>This feature is only available for shippers.</p>
          </div>
        {:else if !isAnnualSubscriber}
          <div class="subscription-required">
            <h3>Annual Subscription Required</h3>
            <p>Score threshold notifications are only available for annual subscribers.</p>
            <p>Upgrade to an annual subscription to set up threshold alerts for freight forwarders.</p>
          </div>
        {:else}
          <!-- Success/Error Messages -->
          {#if success}
            <div class="alert alert-success">
              {success}
            </div>
          {/if}
          
          {#if error}
            <div class="alert alert-error">
              {error}
            </div>
          {/if}

          <!-- New Subscription Form -->
          <div class="new-subscription-form">
            <h3>Set Up New Threshold Alert</h3>
            <p>Get notified when {freightForwarderName || 'this freight forwarder'}'s score changes.</p>
            
            <div class="form-group">
              <label for="threshold-type">Alert Type:</label>
              <select bind:value={newSubscription.threshold_type} id="threshold-type">
                <option value="percentage_drop">Percentage Drop</option>
                <option value="absolute_score">Absolute Score</option>
              </select>
            </div>

            <div class="form-group">
              <label for="threshold-value">
                {newSubscription.threshold_type === 'percentage_drop' ? 'Drop Percentage:' : 'Minimum Score:'}
              </label>
              <input 
                type="number" 
                bind:value={newSubscription.threshold_score}
                id="threshold-value"
                min={newSubscription.threshold_type === 'percentage_drop' ? 1 : 1}
                max={newSubscription.threshold_type === 'percentage_drop' ? 50 : 5}
                step={newSubscription.threshold_type === 'percentage_drop' ? 1 : 0.1}
              />
              <span class="input-suffix">
                {newSubscription.threshold_type === 'percentage_drop' ? '%' : '/5.0'}
              </span>
            </div>

            <div class="form-group">
              <label for="notification-frequency">Notification Frequency:</label>
              <select bind:value={newSubscription.notification_frequency} id="notification-frequency">
                <option value="immediate">Immediate</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            <button 
              type="button" 
              class="btn-primary" 
              on:click={createSubscription}
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Alert'}
            </button>
          </div>

          <!-- Existing Subscriptions -->
          <div class="existing-subscriptions">
            <h3>Your Threshold Alerts</h3>
            
            {#if isLoading}
              <div class="loading">Loading threshold subscriptions...</div>
            {:else if subscriptions.length === 0}
              <div class="no-subscriptions">
                <p>No threshold alerts set up yet.</p>
                <p>Create your first alert above to get notified when scores change.</p>
              </div>
            {:else}
              <div class="subscriptions-list">
                {#each subscriptions as subscription (subscription.id)}
                  <div class="subscription-item">
                    <div class="subscription-header">
                      <h4>{subscription.freight_forwarder_name || 'Unknown Company'}</h4>
                      <div class="subscription-actions">
                        <button 
                          type="button" 
                          class="btn-toggle {subscription.is_active ? 'active' : 'inactive'}"
                          on:click={() => toggleSubscription(subscription.id)}
                        >
                          {subscription.is_active ? 'Active' : 'Inactive'}
                        </button>
                        <button 
                          type="button" 
                          class="btn-delete"
                          on:click={() => deleteSubscription(subscription.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    <div class="subscription-details">
                      <div class="detail-item">
                        <span class="label">Alert Type:</span>
                        <span class="value">{formatThresholdValue(subscription)}</span>
                      </div>
                      <div class="detail-item">
                        <span class="label">Frequency:</span>
                        <span class="value">{subscription.notification_frequency}</span>
                      </div>
                      {#if subscription.current_score}
                        <div class="detail-item">
                          <span class="label">Current Score:</span>
                          <span class="value">{subscription.current_score}/5.0</span>
                        </div>
                      {/if}
                      <div class="detail-item">
                        <span class="label">Last Triggered:</span>
                        <span class="value">{formatLastTriggered(subscription.last_triggered)}</span>
                      </div>
                      <div class="detail-item">
                        <span class="label">Created:</span>
                        <span class="value">{new Date(subscription.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
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
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background: white;
    border-radius: 8px;
    width: 90%;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #e5e7eb;
  }

  .modal-header h2 {
    margin: 0;
    color: #1f2937;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #6b7280;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .close-btn:hover {
    color: #374151;
  }

  .modal-body {
    padding: 20px;
  }

  .access-denied,
  .subscription-required {
    text-align: center;
    padding: 40px 20px;
    color: #6b7280;
  }

  .subscription-required h3 {
    color: #1f2937;
    margin-bottom: 10px;
  }

  .alert {
    padding: 12px 16px;
    border-radius: 4px;
    margin-bottom: 16px;
  }

  .alert-success {
    background-color: #d1fae5;
    color: #065f46;
    border: 1px solid #a7f3d0;
  }

  .alert-error {
    background-color: #fee2e2;
    color: #991b1b;
    border: 1px solid #fca5a5;
  }

  .new-subscription-form {
    background-color: #f9fafb;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 30px;
  }

  .new-subscription-form h3 {
    margin-top: 0;
    color: #1f2937;
  }

  .form-group {
    margin-bottom: 16px;
  }

  .form-group label {
    display: block;
    margin-bottom: 4px;
    font-weight: 500;
    color: #374151;
  }

  .form-group input,
  .form-group select {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 14px;
  }

  .form-group input:focus,
  .form-group select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .input-suffix {
    margin-left: 8px;
    color: #6b7280;
    font-size: 14px;
  }

  .btn-primary {
    background-color: #3b82f6;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
  }

  .btn-primary:hover:not(:disabled) {
    background-color: #2563eb;
  }

  .btn-primary:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }

  .existing-subscriptions h3 {
    color: #1f2937;
    margin-bottom: 16px;
  }

  .loading {
    text-align: center;
    color: #6b7280;
    padding: 20px;
  }

  .no-subscriptions {
    text-align: center;
    color: #6b7280;
    padding: 40px 20px;
  }

  .subscriptions-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .subscription-item {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 16px;
    background-color: white;
  }

  .subscription-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .subscription-header h4 {
    margin: 0;
    color: #1f2937;
  }

  .subscription-actions {
    display: flex;
    gap: 8px;
  }

  .btn-toggle {
    padding: 6px 12px;
    border: 1px solid;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
  }

  .btn-toggle.active {
    background-color: #d1fae5;
    color: #065f46;
    border-color: #a7f3d0;
  }

  .btn-toggle.inactive {
    background-color: #fee2e2;
    color: #991b1b;
    border-color: #fca5a5;
  }

  .btn-delete {
    background-color: #ef4444;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
  }

  .btn-delete:hover {
    background-color: #dc2626;
  }

  .subscription-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 8px;
  }

  .detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .detail-item .label {
    font-weight: 500;
    color: #6b7280;
    font-size: 14px;
  }

  .detail-item .value {
    color: #1f2937;
    font-size: 14px;
  }

  .modal-actions {
    padding: 20px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
  }

  .btn-secondary {
    background-color: #6b7280;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  }

  .btn-secondary:hover {
    background-color: #4b5563;
  }

  @media (max-width: 640px) {
    .modal-content {
      width: 95%;
      margin: 10px;
    }
    
    .subscription-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
    
    .subscription-actions {
      width: 100%;
      justify-content: flex-end;
    }
    
    .subscription-details {
      grid-template-columns: 1fr;
    }
  }
</style>
