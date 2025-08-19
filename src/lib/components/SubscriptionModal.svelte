<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { getPlansForUserType, type Plan } from '$lib/subscription-plans';
  import PaymentModal from './PaymentModal.svelte';

  export let isOpen = false;
  export let userType: 'shipper' | 'forwarder' = 'shipper';

  const dispatch = createEventDispatcher();

  let selectedPlan: Plan | null = null;
  let isLoading = false;
  let showPaymentModal = false;

  // Get the correct plans from subscription-plans.ts
  $: plans = getPlansForUserType(userType);

  function closeModal() {
    dispatch('close');
  }

  async function handleSubscribe() {
    if (!selectedPlan) return;
    
    // For free plans, just close the modal
    if (selectedPlan.price === 0) {
      closeModal();
      return;
    }
    
    // For paid plans, show the payment modal
    showPaymentModal = true;
  }

  function selectPlan(plan: Plan) {
    selectedPlan = plan;
  }

  function handlePaymentClose() {
    showPaymentModal = false;
    selectedPlan = null;
    // Close the subscription modal after payment
    closeModal();
  }
</script>

{#if isOpen}
  <div class="modal-overlay" on:click={closeModal}>
    <div class="modal-content" on:click|stopPropagation>
      <div class="modal-header">
        <h2>Choose Your Plan</h2>
        <button class="close-btn" on:click={closeModal}>×</button>
      </div>
      
      <div class="modal-body">
        <div class="plans-grid">
          {#each plans as plan}
            <div class="plan-card {selectedPlan?.id === plan.id ? 'selected' : ''} {plan.popular ? 'popular' : ''}">
              {#if plan.popular}
                <div class="popular-badge">Most Popular</div>
              {/if}
              
              <div class="plan-header">
                <input
                  type="radio"
                  name="plan"
                  value={plan.id.toString()}
                  checked={selectedPlan?.id === plan.id}
                  on:change={() => selectPlan(plan)}
                  id={plan.id.toString()}
                />
                <label for={plan.id.toString()} class="plan-name">{plan.name}</label>
                <div class="plan-price">
                  {#if plan.price === 0}
                    Free
                  {:else}
                    ${plan.price}/{plan.billingCycle}
                  {/if}
                </div>
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
        
        <div class="subscription-actions">
          <button type="button" class="btn-secondary" on:click={closeModal} disabled={isLoading}>
            Cancel
          </button>
          <button type="button" class="btn-primary" on:click={handleSubscribe} disabled={isLoading || !selectedPlan}>
            {isLoading ? 'Processing...' : selectedPlan ? (selectedPlan.price === 0 ? 'Get Started Free' : `Subscribe to ${selectedPlan.name}`) : 'Select a Plan'}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

{#if showPaymentModal && selectedPlan}
  <PaymentModal 
    isOpen={showPaymentModal} 
    selectedPlan={selectedPlan} 
    on:close={handlePaymentClose} 
  />
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
    border-radius: 8px;
    padding: 2rem;
    max-width: 800px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.3s ease;
  }

  .close-btn:hover {
    background: #f8f9fa;
  }

  .modal-body {
    margin-bottom: 1.5rem;
  }

  .plans-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .plan-card {
    border: 2px solid #e9ecef;
    border-radius: 8px;
    padding: 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative; /* Added for popular badge positioning */
  }

  .plan-card:hover {
    border-color: #007bff;
  }

  .plan-card.selected {
    border-color: #007bff;
    background: #f8f9ff;
  }

  .plan-card.popular {
    border-color: #28a745; /* Green border for popular */
    background: #e8f5e9; /* Light green background for popular */
  }

  .popular-badge {
    position: absolute;
    top: 0;
    right: 0;
    background-color: #28a745;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0 8px 0 8px;
    font-size: 0.8rem;
    font-weight: bold;
    z-index: 1;
  }

  .plan-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .plan-header input[type="radio"] {
    margin: 0;
  }

  .plan-name {
    font-weight: 600;
    font-size: 1.2rem;
    margin: 0;
  }

  .plan-price {
    margin-left: auto;
    font-size: 1.5rem;
    font-weight: 700;
    color: #007bff;
  }

  .plan-description {
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .plan-features {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .plan-features li {
    padding: 0.5rem 0;
    color: #666;
    position: relative;
    padding-left: 1.5rem;
  }

  .plan-features li::before {
    content: "✓";
    position: absolute;
    left: 0;
    color: #28a745;
    font-weight: bold;
  }

  .subscription-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }

  .btn-primary {
    background: #007bff;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.3s ease;
  }

  .btn-primary:hover:not(:disabled) {
    background: #0056b3;
  }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-secondary {
    background: transparent;
    color: #007bff;
    border: 1px solid #007bff;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
  }

  .btn-secondary:hover:not(:disabled) {
    background: #007bff;
    color: white;
  }

  .btn-secondary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    .plans-grid {
      grid-template-columns: 1fr;
    }
    
    .subscription-actions {
      flex-direction: column;
    }
  }
</style>

