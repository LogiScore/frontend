<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { apiClient } from '$lib/api';
  import { auth } from '$lib/auth';

  export let isOpen = false;

  const dispatch = createEventDispatcher();

  let currentPassword = '';
  let newPassword = '';
  let confirmPassword = '';
  let isLoading = false;
  let error = '';
  let success = '';
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

  // Watch for modal opening to reset form data
  $: if (isOpen) {
    resetForm();
  }

  function closeModal() {
    dispatch('close');
    resetForm();
  }

  function resetForm() {
    currentPassword = '';
    newPassword = '';
    confirmPassword = '';
    error = '';
    success = '';
  }

  async function handleSubmit() {
    if (newPassword !== confirmPassword) {
      error = 'New passwords do not match';
      return;
    }

    if (newPassword.length < 6) {
      error = 'New password must be at least 6 characters long';
      return;
    }

    isLoading = true;
    error = '';
    success = '';

    try {
      if (!authState.token) {
        throw new Error('Not authenticated');
      }

      await apiClient.changePassword(currentPassword, newPassword, authState.token);
      success = 'Password changed successfully!';
      
      // Reset form after successful change
      setTimeout(() => {
        closeModal();
      }, 2000);
    } catch (err: any) {
      error = err.message || 'Failed to change password';
    } finally {
      isLoading = false;
    }
  }
</script>

{#if isOpen}
  <div class="modal-overlay" on:click|self={closeModal}>
    <div class="modal-content" on:click|stopPropagation>
      <div class="modal-header">
        <h2>Change Password</h2>
        <button class="close-btn" on:click={closeModal}>&times;</button>
      </div>
      
      <form on:submit|preventDefault={handleSubmit} class="modal-body">
        <div class="form-group">
          <input 
            type="password" 
            id="current-password" 
            bind:value={currentPassword}
            placeholder="Current Password"
            required
            disabled={isLoading}
          />
        </div>
        
        <div class="form-group">
          <input 
            type="password" 
            id="new-password" 
            bind:value={newPassword}
            placeholder="New Password"
            required
            disabled={isLoading}
            minlength="6"
          />
        </div>
        
        <div class="form-group">
          <input 
            type="password" 
            id="confirm-password" 
            bind:value={confirmPassword}
            placeholder="Confirm New Password"
            required
            disabled={isLoading}
            minlength="6"
          />
        </div>
        
        {#if error}
          <div class="error-message">{error}</div>
        {/if}
        
        {#if success}
          <div class="success-message">{success}</div>
        {/if}
        
        <div class="modal-footer">
          <button type="button" class="btn-secondary" on:click={closeModal} disabled={isLoading}>
            Cancel
          </button>
          <button type="submit" class="btn-primary" disabled={isLoading}>
            {isLoading ? 'Changing Password...' : 'Change Password'}
          </button>
        </div>
      </form>
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
    max-width: 350px;
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

  .form-group {
    margin-bottom: 20px;
  }

  .form-group input {
    width: 60%;
    padding: 12px;
    border: 2px solid #e9ecef;
    border-radius: 6px;
    font-size: 1rem;
  }

  .form-group input:focus {
    outline: none;
    border-color: #007bff;
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
    background: #007bff;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
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
</style> 