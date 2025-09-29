<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { auth } from '../auth';
  import { apiClient } from '../api';

  export let isOpen = false;

  const dispatch = createEventDispatcher();

  let newForwarder = {
    name: '',
    website: ''
  };
  let isCreatingForwarder = false;
  let errorMessage = '';
  let successMessage = '';
  let user: any = null;

  // Subscribe to auth store to get user info
  $: auth.subscribe(state => {
    user = state.user;
  })();

  function closeModal() {
    dispatch('close');
    resetForm();
  }

  function resetForm() {
    newForwarder = {
      name: '',
      website: ''
    };
    errorMessage = '';
    successMessage = '';
  }

  async function createNewForwarder() {
    try {
      isCreatingForwarder = true;
      errorMessage = '';
      successMessage = '';

      // Check authentication first
      if (!user || !auth) {
        errorMessage = 'You must be logged in to add new forwarders. Please sign in first.';
        return;
      }

      // Get auth token
      let authToken = '';
      auth.subscribe(state => {
        authToken = state.token || '';
      })();

      if (!authToken) {
        errorMessage = 'Authentication required. Please sign in again.';
        return;
      }

      if (!newForwarder.name.trim()) {
        errorMessage = 'Company name is required';
        return;
      }

      const createdForwarder = await apiClient.createFreightForwarder(newForwarder, authToken);

      // Send admin notification about new freight forwarder
      try {
        if (user) {
          await apiClient.sendAdminNewForwarderNotification(
            createdForwarder.name,
            newForwarder.website,
            '', // No description field
            user.full_name || user.username || 'Unknown User',
            user.email || 'No email provided'
          );
        }
      } catch (notificationError) {
        // Don't fail the entire operation if notification fails
        console.warn('Failed to send admin notification:', notificationError);
      }

      // Show success message
      successMessage = `Successfully added "${createdForwarder.name}" to the database!`;
      
      // Dispatch success event with the created forwarder
      dispatch('success', { forwarder: createdForwarder });

      // Reset form and close modal after a short delay
      setTimeout(() => {
        resetForm();
        closeModal();
      }, 2000);

    } catch (err: any) {
      errorMessage = err.message || 'Failed to create new forwarder. Please try again.';
    } finally {
      isCreatingForwarder = false;
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      closeModal();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <div class="modal-overlay" on:click={closeModal} on:keydown={(e) => e.key === 'Escape' && closeModal()} role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1">
    <div class="modal-content" on:click|stopPropagation role="document" on:keydown|stopPropagation>
      <div class="modal-header">
        <h2 id="modal-title">Add New Freight Forwarder</h2>
        <button class="close-btn" on:click={closeModal} aria-label="Close modal">×</button>
      </div>
      
      <div class="modal-body">
        <p class="form-description">Help expand our database by adding a new freight forwarder company.</p>
        
        <div class="form-group">
          <label for="newCompanyName">Company Name *</label>
          <input 
            type="text" 
            id="newCompanyName" 
            bind:value={newForwarder.name} 
            placeholder="Enter company name"
            required
            disabled={isCreatingForwarder}
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="newCompanyWebsite">Website</label>
          <input 
            type="url" 
            id="newCompanyWebsite" 
            bind:value={newForwarder.website} 
            placeholder="https://example.com"
            disabled={isCreatingForwarder}
            class="form-input"
          />
        </div>

        {#if successMessage}
          <div class="success-message">
            {successMessage}
          </div>
        {/if}
        
        {#if errorMessage}
          <div class="error-message">
            {errorMessage}
          </div>
        {/if}
      </div>
      
      <div class="modal-footer">
        <div class="form-actions">
          <button 
            type="button" 
            class="btn btn-secondary" 
            on:click={closeModal}
            disabled={isCreatingForwarder}
          >
            Cancel
          </button>
          
          <button 
            type="button" 
            class="btn btn-primary" 
            on:click={createNewForwarder}
            disabled={isCreatingForwarder}
          >
            {#if isCreatingForwarder}
              <span class="spinner"></span>
              Adding Company...
            {:else}
              Add Company
            {/if}
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
    padding: 1.5rem;
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #eee;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #333;
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

  .form-description {
    color: #6c757d;
    text-align: center;
    margin-bottom: 2rem;
    font-size: 0.9rem;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #333;
    font-size: 1rem;
  }

  .form-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
    box-sizing: border-box;
  }

  .form-input:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }

  .form-input:disabled {
    background: #f8f9fa;
    cursor: not-allowed;
  }

  .success-message {
    background: #d4edda;
    color: #155724;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    font-size: 0.9rem;
    text-align: center;
  }

  .error-message {
    background: #f8d7da;
    color: #721c24;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    font-size: 0.9rem;
    text-align: center;
  }

  .modal-footer {
    padding-top: 1.5rem;
    border-top: 1px solid #eee;
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .btn {
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
    min-width: 120px;
    font-size: 1rem;
    border: none;
  }

  .btn-primary {
    background: #007bff;
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: #0056b3;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-secondary {
    background: transparent;
    color: #007bff;
    border: 1px solid #007bff;
  }

  .btn-secondary:hover:not(:disabled) {
    background: #007bff;
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .btn-secondary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid #ffffff;
    border-radius: 50%;
    border-top-color: transparent;
    animation: spin 1s ease-in-out infinite;
    margin-right: 0.5rem;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Responsive improvements */
  @media (max-width: 450px) {
    .modal-content {
      padding: 1rem;
      width: 95%;
      margin: 1rem;
    }
    
    .form-actions {
      flex-direction: column;
      gap: 0.75rem;
    }
    
    .btn {
      min-width: 100%;
    }
  }
</style>
