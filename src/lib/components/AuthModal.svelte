<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { auth, authMethods } from '../auth';

  export let isOpen = false;
  export let mode = 'signin'; // 'signin' or 'signup'

  const dispatch = createEventDispatcher();

  let email = '';
  let password = '';
  let confirmPassword = '';
  let fullName = '';
  let isLoading = false;
  let errorMessage = '';

  function closeModal() {
    dispatch('close');
  }

  async function handleSubmit() {
    isLoading = true;
    errorMessage = '';

    try {
      if (mode === 'signin') {
        const result = await authMethods.login({ email, password });
        if (result.success) {
          closeModal();
        } else {
          errorMessage = result.error || 'Login failed';
        }
      } else {
        if (password !== confirmPassword) {
          errorMessage = 'Passwords do not match';
          return;
        }
        const result = await authMethods.register({ 
          email, 
          password, 
          full_name: fullName 
        });
        if (result.success) {
          closeModal();
        } else {
          errorMessage = result.error || 'Registration failed';
        }
      }
    } catch (error: any) {
      errorMessage = error.message || 'An error occurred';
    } finally {
      isLoading = false;
    }
  }

  function switchMode() {
    mode = mode === 'signin' ? 'signup' : 'signin';
    errorMessage = '';
  }
</script>

{#if isOpen}
  <div class="modal-overlay" on:click={closeModal}>
    <div class="modal-content" on:click|stopPropagation>
      <div class="modal-header">
        <h2>{mode === 'signin' ? 'Sign In' : 'Sign Up'}</h2>
        <button class="close-btn" on:click={closeModal}>×</button>
      </div>
      
      <form class="modal-body" on:submit|preventDefault={handleSubmit}>
        {#if mode === 'signup'}
          <div class="form-group">
            <label for="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              bind:value={fullName}
              required
              disabled={isLoading}
            />
          </div>
        {/if}
        
        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            bind:value={email}
            required
            disabled={isLoading}
          />
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            bind:value={password}
            required
            minlength="6"
            disabled={isLoading}
          />
        </div>
        
        {#if mode === 'signup'}
          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              bind:value={confirmPassword}
              required
              minlength="6"
              disabled={isLoading}
            />
          </div>
        {/if}
        
        {#if errorMessage}
          <div class="error-message">
            {errorMessage}
          </div>
        {/if}
        
        <div class="form-actions">
          <button type="button" class="btn-secondary" on:click={closeModal} disabled={isLoading}>
            Cancel
          </button>
          <button type="submit" class="btn-primary" disabled={isLoading}>
            {isLoading ? 'Loading...' : (mode === 'signin' ? 'Sign In' : 'Sign Up')}
          </button>
        </div>
      </form>
      
      <div class="modal-footer">
        <p>
          {mode === 'signin' ? "Don't have an account?" : "Already have an account?"}
          <button class="link-btn" on:click={switchMode}>
            {mode === 'signin' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
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
    max-width: 400px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
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

  .form-group {
    margin-bottom: 1rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #333;
  }

  .form-group input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
  }

  .form-group input:focus {
    outline: none;
    border-color: #007bff;
  }

  .form-group input:disabled {
    background: #f8f9fa;
    cursor: not-allowed;
  }

  .error-message {
    background: #f8d7da;
    color: #721c24;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }

  .form-actions {
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

  .modal-footer {
    text-align: center;
    padding-top: 1rem;
    border-top: 1px solid #eee;
  }

  .modal-footer p {
    margin: 0;
    color: #666;
  }

  .link-btn {
    background: none;
    border: none;
    color: #007bff;
    cursor: pointer;
    font-weight: 500;
    text-decoration: underline;
    margin-left: 0.5rem;
  }

  .link-btn:hover {
    color: #0056b3;
  }
</style>

