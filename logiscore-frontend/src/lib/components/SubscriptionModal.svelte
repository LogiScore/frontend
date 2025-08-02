<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { auth } from '$lib/auth';
  import { getPlansForUserType, type SubscriptionPlan } from '$lib/subscription-plans';
  import { apiClient } from '$lib/api';

  export let isOpen = false;

  const dispatch = createEventDispatcher();

  let selectedPlan: SubscriptionPlan | null = null;
  let isLoading = false;
  let error = '';
  let success = '';

  // Get user type from auth store
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

  // Get available plans for user type
  let availablePlans: SubscriptionPlan[] = [];

  // Load plans from backend when modal opens
  async function loadPlansFromBackend() {
    if (!authState.user || !authState.token) return;
    
    try {
      const result = await apiClient.getSubscriptionPlans(authState.token);
      // Convert backend plans to frontend format
      availablePlans = result.plans.map(plan => ({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        price: plan.price,
        currency: plan.currency,
        billingCycle: plan.billing_cycle,
        features: plan.features,
        userType: authState.user.user_type,
        isPopular: plan.is_popular || false
      }));
    } catch (error) {
      console.error('Failed to load plans from backend:', error);
      // Fallback to frontend plans
      availablePlans = getPlansForUserType(authState.user.user_type);
    }
  }

  // Load plans when modal opens
  $: if (isOpen && authState.user && authState.token) {
    loadPlansFromBackend();
  }

  // Initialize plans when user changes
  $: if (authState.user && !isOpen) {
    availablePlans = getPlansForUserType(authState.user.user_type);
  }

  function closeModal() {
    isOpen = false;
    resetForm();
  }

  function resetForm() {
    selectedPlan = null;
    error = '';
    success = '';
  }

  function selectPlan(plan: SubscriptionPlan) {
    selectedPlan = plan;
    error = '';
  }

  async function handleUpgrade() {
    if (!selectedPlan) {
      error = 'Please select a plan';
      return;
    }

    if (!authState.user) {
      error = 'You must be logged in to upgrade';
      return;
    }

    // Check if user type matches plan type
    if (authState.user.user_type !== selectedPlan.userType) {
      error = `This plan is only available for ${selectedPlan.userType}s`;
      return;
    }

    isLoading = true;
    error = '';
    success = '';

    try {
      // Call the backend API to create subscription
      const result = await apiClient.createSubscription(
        selectedPlan.id,
        selectedPlan.name,
        selectedPlan.userType,
        authState.token!
      );

      success = result.message || `Successfully upgraded to ${selectedPlan.name}!`;
      
      // Update the user's subscription tier in the auth store
      if (authState.user) {
        authState.user.subscription_tier = selectedPlan.name.toLowerCase().replace(' ', '_');
      }
      
      // Close modal after success
      setTimeout(() => {
        closeModal();
      }, 2000);
    } catch (err: any) {
      error = err.message || 'Failed to upgrade subscription';
    } finally {
      isLoading = false;
    }
  }
</script>

{#if isOpen}
  <div class="modal-overlay" on:click={closeModal}>
    <div class="modal-content" on:click|stopPropagation>
      <div class="modal-header">
        <h2>Upgrade Your Subscription</h2>
        <button class="close-btn" on:click={closeModal}>&times;</button>
      </div>
      
      <div class="modal-body">
        {#if authState.user}
          <div class="user-info">
            <p>Welcome, <strong>{authState.user.username}</strong>!</p>
            <p>You are registered as a <strong>{authState.user.user_type}</strong>.</p>
          </div>

          <div class="plans-container">
            <h3>Available Plans for {authState.user.user_type}s</h3>
            
            {#if availablePlans.length > 0}
              <div class="plans-grid">
                {#each availablePlans as plan}
                  <div class="plan-card" class:selected={selectedPlan?.id === plan.id} on:click={() => selectPlan(plan)}>
                    {#if plan.isPopular}
                      <div class="popular-badge">Most Popular</div>
                    {/if}
                    
                    <h4 class="plan-name">{plan.name}</h4>
                    <div class="plan-price">
                      <span class="currency">$</span>
                      <span class="amount">{plan.price}</span>
                      <span class="period">/month</span>
                    </div>
                    
                    <p class="plan-description">{plan.description}</p>
                    
                    <ul class="plan-features">
                      {#each plan.features as feature}
                        <li>{feature}</li>
                      {/each}
                    </ul>
                  </div>
                {/each}
              </div>
            {:else}
              <p class="no-plans">No plans available for your user type.</p>
            {/if}
          </div>
        {:else}
          <div class="login-required">
            <p>You must be logged in to view subscription plans.</p>
            <button class="btn-primary" on:click={closeModal}>Sign In</button>
          </div>
        {/if}
        
        {#if error}
          <div class="error-message">{error}</div>
        {/if}
        
        {#if success}
          <div class="success-message">{success}</div>
        {/if}
      </div>
      
      {#if selectedPlan && authState.user}
        <div class="modal-footer">
          <button class="btn-secondary" on:click={closeModal} disabled={isLoading}>
            Cancel
          </button>
          <button class="btn-primary" on:click={handleUpgrade} disabled={isLoading}>
            {isLoading ? 'Processing...' : `Upgrade to ${selectedPlan.name}`}
          </button>
        </div>
      {/if}
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

  .modal-footer {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    padding: 20px;
    border-top: 1px solid #e9ecef;
  }

  .user-info {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
  }

  .user-info p {
    margin: 5px 0;
    color: #666;
  }

  .plans-container h3 {
    margin-bottom: 20px;
    color: #333;
  }

  .plans-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
  }

  .plan-card {
    border: 2px solid #e9ecef;
    border-radius: 12px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
  }

  .plan-card:hover {
    border-color: #667eea;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }

  .plan-card.selected {
    border-color: #667eea;
    background: #f8f9ff;
  }

  .popular-badge {
    position: absolute;
    top: -10px;
    right: 20px;
    background: #667eea;
    color: white;
    padding: 5px 15px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .plan-name {
    margin: 0 0 15px 0;
    color: #333;
    font-size: 1.2rem;
  }

  .plan-price {
    margin-bottom: 15px;
    text-align: center;
  }

  .currency {
    font-size: 1.2rem;
    color: #666;
  }

  .amount {
    font-size: 2.5rem;
    font-weight: 700;
    color: #333;
  }

  .period {
    font-size: 1rem;
    color: #666;
  }

  .plan-description {
    color: #666;
    margin-bottom: 20px;
    font-size: 0.9rem;
  }

  .plan-features {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .plan-features li {
    padding: 8px 0;
    color: #555;
    font-size: 0.9rem;
    position: relative;
    padding-left: 20px;
  }

  .plan-features li:before {
    content: "✓";
    position: absolute;
    left: 0;
    color: #28a745;
    font-weight: bold;
  }

  .no-plans {
    text-align: center;
    color: #666;
    font-style: italic;
  }

  .login-required {
    text-align: center;
    padding: 40px 20px;
  }

  .error-message {
    background: #f8d7da;
    color: #721c24;
    padding: 12px;
    border-radius: 6px;
    margin-bottom: 20px;
    border: 1px solid #f5c6cb;
  }

  .success-message {
    background: #d4edda;
    color: #155724;
    padding: 12px;
    border-radius: 6px;
    margin-bottom: 20px;
    border: 1px solid #c3e6cb;
  }

  .btn-primary {
    background: #667eea;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
  }

  .btn-primary:hover:not(:disabled) {
    background: #5a6fd8;
  }

  .btn-primary:disabled {
    background: #6c757d;
    cursor: not-allowed;
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
  }

  .btn-secondary:hover:not(:disabled) {
    background: #545b62;
  }

  .btn-secondary:disabled {
    background: #adb5bd;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    .plans-grid {
      grid-template-columns: 1fr;
    }
    
    .modal-content {
      width: 95%;
      margin: 10px;
    }
  }
</style> 