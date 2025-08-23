<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { auth } from '$lib/auth';

  export let isOpen = false;

  const dispatch = createEventDispatcher();

  // Form data
  let formData = {
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
        full_name: state.user.full_name || state.user.username || '',
        email: state.user.email || '',
        company_name: state.user.company_name || '',
        user_type: state.user.user_type || 'shipper'
      };
    }
  });

  // Watch for modal opening to refresh data
  $: if (isOpen && authState.user) {
    formData = {
      full_name: authState.user.full_name || authState.user.username || '',
      email: authState.user.email || '',
      company_name: authState.user.company_name || '',
      user_type: authState.user.user_type || 'shipper'
    };
  }

  function closeModal() {
    dispatch('close');
  }
</script>

{#if isOpen}
  <div class="modal-overlay" on:click|self={closeModal}>
    <div class="modal-content" on:click|stopPropagation>
      <div class="modal-header">
        <h2>View Profile</h2>
        <button class="close-btn" on:click={closeModal}>&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="profile-info">
          <div class="form-group">
            <label for="full_name">Full Name</label>
            <div class="readonly-field" id="full_name">
              {formData.full_name}
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <div class="readonly-field" id="email">
              {formData.email}
            </div>
          </div>

          <div class="form-group">
            <label for="company_name">Company Name</label>
            <div class="readonly-field" id="company_name">
              {formData.company_name || 'Not specified'}
            </div>
          </div>

          <div class="form-group">
            <label for="user_type">User Type</label>
            <div class="readonly-field" id="user_type">
              {formData.user_type === 'shipper' ? 'Shipper' : 'Freight Forwarder'}
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-secondary" on:click={closeModal}>
            Close
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

  .readonly-field {
    width: 100%;
    padding: 12px;
    border: 1px solid #e9ecef;
    border-radius: 6px;
    font-size: 1rem;
    background-color: #f8f9fa;
    color: #495057;
    min-height: 44px;
    display: flex;
    align-items: center;
  }

  .form-actions {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-top: 20px;
    padding: 20px;
    border-top: 1px solid #e9ecef;
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
    transition: background-color 0.2s;
  }

  .btn-secondary:hover:not(:disabled) {
    background: #545b62;
  }
</style> 