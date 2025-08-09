<script>
  import { createEventDispatcher } from 'svelte';

  export let isOpen = false;

  const dispatch = createEventDispatcher();

  let selectedPlan = 'basic';
  let isLoading = false;

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 29,
      features: [
        'Submit unlimited reviews',
        'Advanced search options',
        'Review management',
        'Email support'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 79,
      features: [
        'All Basic features',
        'Analytics dashboard',
        'Priority support',
        'API access',
        'Custom reports'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 199,
      features: [
        'All Pro features',
        'Unlimited API access',
        'White-label options',
        'Dedicated support',
        'Custom integrations'
      ]
    }
  ];

  function closeModal() {
    dispatch('close');
  }

  async function handleSubscribe() {
    isLoading = true;
    
    try {
      // Simulate subscription API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success - close modal
      closeModal();
    } catch (error) {
      console.error('Subscription failed:', error);
    } finally {
      isLoading = false;
    }
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
            <div class="plan-card {selectedPlan === plan.id ? 'selected' : ''}">
              <div class="plan-header">
                <input
                  type="radio"
                  name="plan"
                  value={plan.id}
                  bind:group={selectedPlan}
                  id={plan.id}
                />
                <label for={plan.id} class="plan-name">{plan.name}</label>
                <div class="plan-price">${plan.price}/month</div>
              </div>
              
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
          <button type="button" class="btn-primary" on:click={handleSubscribe} disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Subscribe Now'}
          </button>
        </div>
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
  }

  .plan-card:hover {
    border-color: #007bff;
  }

  .plan-card.selected {
    border-color: #007bff;
    background: #f8f9ff;
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

