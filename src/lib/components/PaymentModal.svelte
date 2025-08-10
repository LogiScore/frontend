<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { apiClient } from '$lib/api';
  import { auth } from '$lib/auth';

  export let isOpen: boolean = false;
  export let selectedPlan: any = null;

  const dispatch = createEventDispatcher();

  let isLoading = false;
  let error = '';
  let success = '';
  let cardNumber = '';
  let expiryDate = '';
  let cvv = '';
  let cardholderName = '';

  function closeModal() {
    dispatch('close');
  }

  async function handlePayment() {
    if (!selectedPlan) {
      error = 'No plan selected';
      return;
    }

    if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
      error = 'Please fill in all payment fields';
      return;
    }

    isLoading = true;
    error = '';
    success = '';

    try {
      // In a real implementation, this would create a Stripe payment intent
      // For demo mode, we'll simulate the payment process
      const result = await apiClient.processPayment({
        plan_id: selectedPlan.id,
        plan_name: selectedPlan.name,
        amount: selectedPlan.price,
        currency: 'USD',
        payment_method: 'card',
        card_number: cardNumber.replace(/\s/g, ''),
        expiry_date: expiryDate,
        cvv: cvv,
        cardholder_name: cardholderName
      }) as { message: string };

      success = result.message || 'Payment processed successfully!';
      
      // Update user subscription
      const currentAuth = $auth;
      if (currentAuth.user) {
        const updatedUser = {
          ...currentAuth.user,
          subscription_tier: selectedPlan.name.toLowerCase().replace(' ', '_')
        };
        // Update the store
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
    } finally {
      isLoading = false;
    }
  }

  function formatCardNumber(value: string) {
    // Remove all non-digits
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    // Add spaces every 4 digits
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  }

  function formatExpiryDate(value: string) {
    // Remove all non-digits
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    // Add slash after 2 digits
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
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
              <div class="plan-price">${selectedPlan.price}/month</div>
              <div class="plan-description">{selectedPlan.description}</div>
            </div>
          </div>

          <form on:submit|preventDefault={handlePayment} class="payment-form">
            <div class="form-group">
              <label for="cardholder-name">Cardholder Name</label>
              <input 
                type="text" 
                id="cardholder-name"
                bind:value={cardholderName}
                required
                placeholder="John Doe"
              />
            </div>

            <div class="form-group">
              <label for="card-number">Card Number</label>
              <input 
                type="text" 
                id="card-number"
                bind:value={cardNumber}
                on:input={(e) => cardNumber = formatCardNumber((e.target as HTMLInputElement).value)}
                required
                placeholder="1234 5678 9012 3456"
                maxlength="19"
              />
            </div>

            <div class="card-details">
              <div class="form-group">
                <label for="expiry-date">Expiry Date</label>
                <input 
                  type="text" 
                  id="expiry-date"
                  bind:value={expiryDate}
                  on:input={(e) => expiryDate = formatExpiryDate((e.target as HTMLInputElement).value)}
                  required
                  placeholder="MM/YY"
                  maxlength="5"
                />
              </div>

              <div class="form-group">
                <label for="cvv">CVV</label>
                <input 
                  type="text" 
                  id="cvv"
                  bind:value={cvv}
                  required
                  placeholder="123"
                  maxlength="4"
                  pattern="[0-9]{3,4}"
                />
              </div>
            </div>

            <div class="security-note">
              <p>🔒 Your payment information is secure and encrypted</p>
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
            {isLoading ? 'Processing...' : `Pay $${selectedPlan.price}`}
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
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #e5e7eb;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #111827;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #6b7280;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .close-btn:hover {
    color: #374151;
  }

  .modal-body {
    padding: 24px;
  }

  .plan-summary {
    margin-bottom: 24px;
    padding: 16px;
    background: #f9fafb;
    border-radius: 6px;
    border: 1px solid #e5e7eb;
  }

  .plan-summary h3 {
    margin: 0 0 12px 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #111827;
  }

  .plan-details {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .plan-name {
    font-weight: 600;
    color: #111827;
  }

  .plan-price {
    font-size: 1.2rem;
    font-weight: 700;
    color: #059669;
  }

  .plan-description {
    color: #6b7280;
    font-size: 0.9rem;
  }

  .payment-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .form-group label {
    font-weight: 500;
    color: #374151;
    font-size: 0.9rem;
  }

  .form-group input {
    padding: 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.2s;
  }

  .form-group input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .card-details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .security-note {
    margin-top: 16px;
    padding: 12px;
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: 6px;
    text-align: center;
  }

  .security-note p {
    margin: 0;
    color: #0369a1;
    font-size: 0.9rem;
  }

  .error-message {
    margin-top: 16px;
    padding: 12px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 6px;
    color: #dc2626;
  }

  .success-message {
    margin-top: 16px;
    padding: 12px;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 6px;
    color: #059669;
  }

  .no-plan {
    text-align: center;
    padding: 40px 20px;
    color: #6b7280;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 20px 24px;
    border-top: 1px solid #e5e7eb;
  }

  .btn-primary, .btn-secondary {
    padding: 10px 20px;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    font-size: 0.9rem;
  }

  .btn-primary {
    background: #3b82f6;
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: #2563eb;
  }

  .btn-primary:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }

  .btn-secondary {
    background: #f3f4f6;
    color: #374151;
  }

  .btn-secondary:hover:not(:disabled) {
    background: #e5e7eb;
  }

  .btn-secondary:disabled {
    background: #f3f4f6;
    color: #9ca3af;
    cursor: not-allowed;
  }
</style> 