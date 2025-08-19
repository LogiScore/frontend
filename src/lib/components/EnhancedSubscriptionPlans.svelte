<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { apiClient } from '$lib/api';
  import { auth } from '$lib/auth';
  import { getPlansForUserType } from '$lib/subscription-plans';
  import PaymentModal from './PaymentModal.svelte';

  export let userType: 'shipper' | 'forwarder' = 'shipper';

  const dispatch = createEventDispatcher();

  let plans: any[] = [];
  let currentSubscription: any = null;
  let isLoading = true;
  let error = '';
  let showPaymentModal = false;
  let selectedPlan: any = null;
  let backendPlans: any[] = [];

  onMount(async () => {
    await Promise.all([
      loadCurrentSubscription(),
      loadBackendPlans()
    ]);
  });

  async function loadCurrentSubscription() {
    try {
      const currentAuth = $auth;
      if (!currentAuth.user || !currentAuth.token) {
        return;
      }

      const subscription = await apiClient.getCurrentSubscription(currentAuth.token);
      currentSubscription = subscription;
    } catch (err: any) {
      console.error('Failed to load current subscription:', err);
      // Don't show error for this, just log it
    }
  }

  async function loadBackendPlans() {
    try {
      isLoading = true;
      const currentAuth = $auth;
      if (!currentAuth.token) {
        // Use local plans if not authenticated
        plans = getPlansForUserType(userType);
        return;
      }

      // Try to get plans from backend
      const result = await apiClient.getSubscriptionPlans(currentAuth.token);
      backendPlans = result.plans || [];
      
      // Merge backend plans with local plans
      const localPlans = getPlansForUserType(userType);
      plans = localPlans.map(localPlan => {
        const backendPlan = backendPlans.find(bp => bp.id === localPlan.id);
        return {
          ...localPlan,
          stripe_price_id: backendPlan?.stripe_price_id,
          stripe_product_id: backendPlan?.stripe_product_id,
          is_backend_plan: !!backendPlan
        };
      });
    } catch (err: any) {
      console.error('Failed to load backend plans:', err);
      // Fallback to local plans
      plans = getPlansForUserType(userType);
    } finally {
      isLoading = false;
    }
  }

  function handlePlanSelect(plan: any) {
    selectedPlan = plan;
    showPaymentModal = true;
  }

  function handlePaymentClose() {
    showPaymentModal = false;
    selectedPlan = null;
    // Reload subscription data after payment
    loadCurrentSubscription();
  }

  function handleUpgrade() {
    dispatch('upgrade');
  }

  function isCurrentPlan(plan: any): boolean {
    if (!currentSubscription) return false;
    return currentSubscription.tier === plan.name.toLowerCase().replace(' ', '_') ||
           currentSubscription.tier === plan.id.toString();
  }

  function isPlanDisabled(plan: any): boolean {
    // Disable if it's the current plan or if user is not authenticated
    return isCurrentPlan(plan) || !$auth.user;
  }

  function getPlanButtonText(plan: any): string {
    if (isCurrentPlan(plan)) {
      return 'Current Plan';
    }
    if (plan.price === 0) {
      return 'Free Plan';
    }
    return `Subscribe for $${plan.price}`;
  }

  function getPlanButtonClass(plan: any): string {
    if (isCurrentPlan(plan)) {
      return 'btn-current';
    }
    if (plan.price === 0) {
      return 'btn-free';
    }
    if (plan.popular) {
      return 'btn-popular';
    }
    return 'btn-subscribe';
  }
</script>

<div class="subscription-plans">
  {#if isLoading}
    <div class="loading">
      <div class="loading-spinner"></div>
      <p>Loading subscription plans...</p>
    </div>
  {:else if error}
    <div class="error">
      <p>{error}</p>
      <button class="btn-retry" on:click={loadBackendPlans}>
        Try Again
      </button>
    </div>
  {:else}
    <div class="plans-header">
      <h2>Choose Your Plan</h2>
      <p>Select the perfect plan for your {userType} needs</p>
    </div>

    <div class="plans-grid">
      {#each plans as plan}
        <div class="plan-card {plan.popular ? 'popular' : ''} {isCurrentPlan(plan) ? 'current' : ''}">
          {#if plan.popular}
            <div class="popular-badge">Most Popular</div>
          {/if}
          
          {#if isCurrentPlan(plan)}
            <div class="current-badge">Current Plan</div>
          {/if}

          <div class="plan-header">
            <h3 class="plan-name">{plan.name}</h3>
            <div class="plan-price">
              <span class="currency">$</span>
              <span class="amount">{plan.price}</span>
              <span class="period">/{plan.billingCycle}</span>
            </div>
            <p class="plan-description">{plan.description}</p>
          </div>

          <ul class="plan-features">
            {#each plan.features as feature}
              <li>
                <span class="feature-icon">✓</span>
                {feature}
              </li>
            {/each}
          </ul>

          <div class="plan-actions">
            <button 
              class="btn {getPlanButtonClass(plan)}"
              disabled={isPlanDisabled(plan)}
              on:click={() => handlePlanSelect(plan)}
            >
              {getPlanButtonText(plan)}
            </button>
          </div>

          {#if plan.is_backend_plan}
            <div class="backend-indicator">
              <span class="indicator-dot"></span>
              Backend Integrated
            </div>
          {/if}
        </div>
      {/each}
    </div>

    {#if currentSubscription}
      <div class="current-subscription-info">
        <h3>Your Current Subscription</h3>
        <p>
          You're currently on the <strong>{currentSubscription.tier}</strong> plan.
          {#if currentSubscription.days_remaining !== undefined}
            <br>Days remaining: <strong>{currentSubscription.days_remaining}</strong>
          {/if}
        </p>
        <button class="btn-secondary" on:click={handleUpgrade}>
          Manage Subscription
        </button>
      </div>
    {/if}
  {/if}
</div>

{#if showPaymentModal && selectedPlan}
  <PaymentModal 
    isOpen={showPaymentModal} 
    selectedPlan={selectedPlan} 
    on:close={handlePaymentClose} 
  />
{/if}

<style>
  .subscription-plans {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }

  .loading {
    text-align: center;
    padding: 60px 20px;
    color: #666;
  }

  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 5px solid #f3f3f3;
    border-top: 5px solid #007bff;
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
    margin: 20px 0;
  }

  .btn-retry {
    background: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    margin-top: 15px;
  }

  .btn-retry:hover {
    background: #0056b3;
  }

  .plans-header {
    text-align: center;
    margin-bottom: 40px;
  }

  .plans-header h2 {
    font-size: 2.5rem;
    color: #111827;
    margin: 0 0 16px 0;
    font-weight: 700;
  }

  .plans-header p {
    font-size: 1.1rem;
    color: #6b7280;
    margin: 0;
  }

  .plans-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 24px;
    margin-bottom: 40px;
  }

  .plan-card {
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 16px;
    padding: 32px;
    position: relative;
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }

  .plan-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  }

  .plan-card.popular {
    border-color: #007bff;
    box-shadow: 0 8px 16px rgba(0, 123, 255, 0.15);
  }

  .plan-card.current {
    border-color: #10b981;
    background: #f0fdf4;
  }

  .popular-badge {
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    background: #007bff;
    color: white;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .current-badge {
    position: absolute;
    top: -12px;
    right: 20px;
    background: #10b981;
    color: white;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .plan-header {
    text-align: center;
    margin-bottom: 24px;
  }

  .plan-name {
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
    margin: 0 0 16px 0;
  }

  .plan-price {
    margin-bottom: 16px;
  }

  .currency {
    font-size: 1.5rem;
    color: #6b7280;
    vertical-align: top;
  }

  .amount {
    font-size: 3rem;
    font-weight: 800;
    color: #111827;
    line-height: 1;
  }

  .period {
    font-size: 1.1rem;
    color: #6b7280;
    font-weight: 500;
  }

  .plan-description {
    color: #6b7280;
    font-size: 1rem;
    line-height: 1.5;
    margin: 0;
  }

  .plan-features {
    list-style: none;
    padding: 0;
    margin: 0 0 32px 0;
  }

  .plan-features li {
    display: flex;
    align-items: flex-start;
    padding: 8px 0;
    color: #374151;
    line-height: 1.5;
  }

  .feature-icon {
    color: #10b981;
    font-weight: bold;
    margin-right: 12px;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .plan-actions {
    text-align: center;
  }

  .btn {
    width: 100%;
    padding: 14px 24px;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .btn-subscribe {
    background: #007bff;
    color: white;
  }

  .btn-subscribe:hover:not(:disabled) {
    background: #0056b3;
    transform: translateY(-2px);
  }

  .btn-popular {
    background: #007bff;
    color: white;
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
  }

  .btn-popular:hover:not(:disabled) {
    background: #0056b3;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 123, 255, 0.4);
  }

  .btn-current {
    background: #10b981;
    color: white;
    cursor: default;
  }

  .btn-free {
    background: #6b7280;
    color: white;
    cursor: default;
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }

  .backend-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 20px;
    padding: 8px 16px;
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: 20px;
    font-size: 0.75rem;
    color: #0369a1;
    font-weight: 500;
  }

  .indicator-dot {
    width: 6px;
    height: 6px;
    background: #0369a1;
    border-radius: 50%;
    margin-right: 8px;
  }

  .current-subscription-info {
    text-align: center;
    background: #f8f9fa;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 24px;
    margin-top: 40px;
  }

  .current-subscription-info h3 {
    margin: 0 0 16px 0;
    color: #111827;
    font-size: 1.25rem;
  }

  .current-subscription-info p {
    margin: 0 0 20px 0;
    color: #6b7280;
    line-height: 1.6;
  }

  .btn-secondary {
    background: #6c757d;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s;
  }

  .btn-secondary:hover {
    background: #545b62;
  }

  @media (max-width: 768px) {
    .plans-grid {
      grid-template-columns: 1fr;
      gap: 20px;
    }

    .plan-card {
      padding: 24px;
    }

    .plans-header h2 {
      font-size: 2rem;
    }

    .amount {
      font-size: 2.5rem;
    }
  }
</style>
