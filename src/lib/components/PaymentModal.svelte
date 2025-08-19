<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { apiClient } from '$lib/api';
  import { auth } from '$lib/auth';
  import { initializeStripe, createPaymentMethod, getPaymentErrorMessage, stripeElementsOptions } from '$lib/stripe';
  import { loadStripe } from '@stripe/stripe-js';

  export let isOpen: boolean = false;
  export let selectedPlan: any = null;

  const dispatch = createEventDispatcher();

  let isLoading = false;
  let error = '';
  let success = '';
  let cardElement: any = null;
  let elements: any = null;
  let stripe: any = null;
  let cardContainer: HTMLElement;

  onMount(async () => {
    // Initialize Stripe
    try {
      stripe = await initializeStripe();
      elements = stripe.elements(stripeElementsOptions);
      
      // Create card element
      cardElement = elements.create('card', {
        style: stripeElementsOptions.style
      });
      
      // Mount card element
      if (cardContainer) {
        cardElement.mount(cardContainer);
      }
    } catch (err) {
      console.error('Failed to initialize Stripe:', err);
      error = 'Failed to initialize payment system. Please refresh and try again.';
    }
  });

  function closeModal() {
    dispatch('close');
  }

  async function handlePayment() {
    if (!selectedPlan) {
      error = 'No plan selected';
      return;
    }

    if (!cardElement) {
      error = 'Payment form not loaded. Please refresh and try again.';
      return;
    }

    isLoading = true;
    error = '';
    success = '';

    try {
      // Get current user
      const currentAuth = $auth;
      if (!currentAuth.user || !currentAuth.token) {
        throw new Error('User not authenticated');
      }

      // Create payment method
      const { paymentMethod, error: paymentError } = await createPaymentMethod(
        cardElement,
        {
          name: currentAuth.user.full_name || currentAuth.user.username,
          email: currentAuth.user.email
        }
      );

      if (paymentError) {
        throw new Error(getPaymentErrorMessage(paymentError));
      }

      // Create subscription with payment method
      const result = await apiClient.createSubscription(
        selectedPlan.id,
        selectedPlan.name,
        currentAuth.user.user_type,
        currentAuth.token,
        paymentMethod.id,
        0 // No trial days for paid plans
      );

      success = result.message || 'Subscription created successfully!';
      
      // Update user subscription in auth store
      if (currentAuth.user) {
        const updatedUser = {
          ...currentAuth.user,
          subscription_tier: result.tier || selectedPlan.name.toLowerCase().replace(' ', '_')
        };
        
        auth.update(state => ({
          ...state,
          user: updatedUser
        }));
      }
      
      // Close modal after success
      setTimeout(() => {
        closeModal();
      }, 2000);
    } catch (err: any) {
      error = err.message || 'Payment failed. Please try again.';
      console.error('Payment error:', err);
    } finally {
      isLoading = false;
    }
  }

  // Cleanup on component destroy
  function cleanup() {
    if (cardElement) {
      cardElement.destroy();
    }
  }
</script>

{#if isOpen}
  <div class="modal-overlay" on:click={closeModal}>
    <div class="modal-content" on:click|stopPropagation>
      <div class="modal-header">
        <h2>Complete Your Payment</h2>
        <button class="close-btn" on:click={closeModal}>&times;</button>
      </div>
      
      <div class="modal-body">
        {#if selectedPlan}
          <div class="plan-summary">
            <h3>Order Summary</h3>
            <div class="plan-details">
              <div class="plan-name">{selectedPlan.name}</div>
              <div class="plan-price">${selectedPlan.price}/{selectedPlan.billingCycle}</div>
              <div class="plan-description">{selectedPlan.description}</div>
            </div>
          </div>

          <form on:submit|preventDefault={handlePayment} class="payment-form">
            <div class="form-group">
              <label for="card-element">Card Information</label>
              <div id="card-element" bind:this={cardContainer} class="stripe-card-element"></div>
              <div class="card-help">
                <p>🔒 Your payment information is secure and encrypted by Stripe</p>
                <p class="test-cards">
                  <strong>Test Cards:</strong> 4242 4242 4242 4242 (success), 4000 0000 0000 0002 (decline)
                </p>
              </div>
            </div>
          </form>
        {:else}
          <div class="no-plan">
            <p>No plan selected. Please go back and select a subscription plan.</p>
          </div>
        {/if}
        
        {#if error}
          <div class="error-message">{error}</div>
        {/if}
        
        {#if success}
          <div class="success-message">{success}</div>
        {/if}
      </div>
      
      {#if selectedPlan}
        <div class="modal-footer">
          <button class="btn-secondary" on:click={closeModal} disabled={isLoading}>
            Cancel
          </button>
          <button class="btn-primary" on:click={handlePayment} disabled={isLoading}>
            {isLoading ? 'Processing...' : `Subscribe for $${selectedPlan.price}`}
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
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background: white;
    border-radius: 8px;
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }

  .modal-header {
    padding: 20px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .modal-header h2 {
    margin: 0;
    color: #333;
    font-size: 1.5rem;
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
    transition: background-color 0.2s;
  }

  .close-btn:hover {
    background-color: #f5f5f5;
  }

  .modal-body {
    padding: 20px;
  }

  .plan-summary {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 6px;
    margin-bottom: 20px;
  }

  .plan-summary h3 {
    margin: 0 0 10px 0;
    color: #333;
    font-size: 1.1rem;
  }

  .plan-details {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .plan-name {
    font-weight: 600;
    color: #2c3e50;
  }

  .plan-price {
    font-size: 1.2rem;
    color: #27ae60;
    font-weight: 600;
  }

  .plan-description {
    color: #666;
    font-size: 0.9rem;
  }

  .payment-form {
    margin-bottom: 20px;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #333;
  }

  .stripe-card-element {
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 12px;
    background: white;
    min-height: 40px;
  }

  .card-help {
    margin-top: 10px;
    font-size: 0.85rem;
    color: #666;
  }

  .card-help p {
    margin: 5px 0;
  }

  .test-cards {
    background: #fff3cd;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid #ffeaa7;
    margin-top: 10px;
  }

  .error-message {
    background: #f8d7da;
    color: #721c24;
    padding: 12px;
    border-radius: 6px;
    margin: 15px 0;
    border: 1px solid #f5c6cb;
  }

  .success-message {
    background: #d4edda;
    color: #155724;
    padding: 12px;
    border-radius: 6px;
    margin: 15px 0;
    border: 1px solid #c3e6cb;
  }

  .modal-footer {
    padding: 20px;
    border-top: 1px solid #eee;
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }

  .btn-primary, .btn-secondary {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
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

  .no-plan {
    text-align: center;
    padding: 40px 20px;
    color: #666;
  }

  @media (max-width: 600px) {
    .modal-content {
      width: 95%;
      margin: 10px;
    }
    
    .modal-footer {
      flex-direction: column;
    }
    
    .btn-primary, .btn-secondary {
      width: 100%;
    }
  }
</style> 