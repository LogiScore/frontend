<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { auth } from '$lib/auth';
  import { apiClient } from '$lib/api';

  export let isOpen = false;

  const dispatch = createEventDispatcher();

  let isLoading = false;
  let error = '';
  let success = '';

  // Form data
  let formData = {
    username: '',
    full_name: '',
    email: '',
    company_name: '',
    user_type: 'shipper'
  };

  // Get user data from auth store
  let authState: { user: any; token: string | null; isLoading: boolean; error: string | null } = {
    user: null,
    token: null,
    isLoading: false,
    error: null
  };

  // Subscribe to auth store
  auth.subscribe(state => {
    authState = state;
    if (state.user) {
      // Initialize form data with current user data
      formData = {
        username: state.user.username || '',
        full_name: state.user.full_name || state.user.username || '',
        email: state.user.email || '',
        company_name: state.user.company_name || '',
        user_type: state.user.user_type || 'shipper'
      };
    }
  });

  function closeModal() {
    isOpen = false;
    resetForm();
  }

  function resetForm() {
    error = '';
    success = '';
  }

  async function handleSubmit() {
    if (!authState.user || !authState.token) {
      error = 'You must be logged in to update your profile';
      return;
    }

    isLoading = true;
    error = '';
    success = '';

    try {
      // Call the profile update API
      const response = await apiClient.updateUserProfile(authState.token, {
        username: formData.username,
        full_name: formData.full_name,
        company_name: formData.company_name
      });
      
      success = 'Profile updated successfully!';
      
      // Close modal after success
      setTimeout(() => {
        closeModal();
      }, 2000);
    } catch (err: any) {
      error = err.message || 'Failed to update profile';
    } finally {
      isLoading = false;
    }
  }
</script>

{#if isOpen}
  <div class="modal-overlay" on:click={closeModal}>
    <div class="modal-content" on:click|stopPropagation>
      <div class="modal-header">
        <h2>Edit Profile</h2>
        <button class="close-btn" on:click={closeModal}>&times;</button>
      </div>
      
      <div class="modal-body">
        <form on:submit|preventDefault={handleSubmit}>
          <div class="form-group">
            <label for="full_name">Full Name</label>
            <input 
              type="text" 
              id="full_name"
              bind:value={formData.full_name}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div class="form-group">
            <label for="username">Username</label>
            <input 
              type="text" 
              id="username"
              bind:value={formData.username}
              placeholder="Enter your username"
              required
            />
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <div class="readonly-field" id="email">
              {formData.email}
            </div>
          </div>

          <div class="form-group">
            <label for="company_name">Company Name</label>
            <input 
              type="text" 
              id="company_name"
              bind:value={formData.company_name}
              placeholder="Enter your company name (optional)"
            />
          </div>

          <div class="form-group">
            <label for="user_type">User Type</label>
            <div class="readonly-field" id="user_type">
              {formData.user_type === 'shipper' ? 'Shipper' : 'Freight Forwarder'}
            </div>
          </div>

          {#if error}
            <div class="error-message">{error}</div>
          {/if}
          
          {#if success}
            <div class="success-message">{success}</div>
          {/if}

          <div class="form-actions">
            <button type="button" class="btn-secondary" on:click={closeModal} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" class="btn-primary" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
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

  .form-group {
    margin-bottom: 20px;
  }

  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #333;
  }

  .form-group input,
  .form-group select {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.2s;
  }

  .form-group input:focus,
  .form-group select:focus {
    outline: none;
    border-color: #667eea;
  }

  .readonly-field {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
    background-color: #f8f9fa;
    color: #6c757d;
    cursor: not-allowed;
    user-select: none;
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

  .form-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 20px;
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
</style> 