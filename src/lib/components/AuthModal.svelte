<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { auth, authMethods } from '../auth';
  import { apiClient } from '../api';

  export let isOpen = false;
  export let mode = 'signin'; // 'signin' or 'signup'

  const dispatch = createEventDispatcher();

  let email = '';
  let verificationCode = '';
  let confirmPassword = '';
  let fullName = '';
  let isLoading = false;
  let errorMessage = '';
  let successMessage = '';
  let codeRequested = false;
  let codeSent = false;

  function closeModal() {
    dispatch('close');
    // Reset state when closing
    resetForm();
  }

  function resetForm() {
    email = '';
    verificationCode = '';
    confirmPassword = '';
    fullName = '';
    errorMessage = '';
    successMessage = '';
    codeRequested = false;
    codeSent = false;
  }

  async function requestCode() {
    if (!email) {
      errorMessage = 'Please enter your email address';
      return;
    }

    isLoading = true;
    errorMessage = '';

    try {
      const result = await authMethods.requestCode(email);
      if (result.success) {
        successMessage = `Verification code sent! Check your email. Code expires in ${result.expires_in} minutes.`;
        codeRequested = true;
        codeSent = true;
      } else {
        errorMessage = result.error || 'Failed to send verification code';
      }
    } catch (error: any) {
      errorMessage = error.message || 'Failed to send verification code';
    } finally {
      isLoading = false;
    }
  }

  async function handleSubmit() {
    isLoading = true;
    errorMessage = '';

    try {
      if (mode === 'signin') {
        if (!codeSent) {
          await requestCode();
          return;
        }
        
        if (!verificationCode) {
          errorMessage = 'Please enter the verification code';
          return;
        }

        const result = await authMethods.signinWithCode(email, verificationCode);
        if (result.success) {
          closeModal();
        } else {
          errorMessage = result.error || 'Invalid verification code';
        }
      } else {
        // For signup, we'll use the same email + code system
        if (!codeSent) {
          await requestCode();
          return;
        }
        
        if (!verificationCode) {
          errorMessage = 'Please enter the verification code';
          return;
        }

        if (!fullName) {
          errorMessage = 'Please enter your full name';
          return;
        }

        // For signup, complete the signup process with the verification code
        const result = await apiClient.completeSignup(email, verificationCode, fullName);
        if (result.user && result.access_token) {
          // Update auth store
          auth.update(state => ({
            ...state,
            user: result.user,
            token: result.access_token,
            isLoading: false,
            error: null
          }));
          // Save token and user to localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('logiscore_token', result.access_token);
            localStorage.setItem('logiscore_user', JSON.stringify(result.user));
          }
          closeModal();
        } else {
          errorMessage = 'Registration failed';
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
    resetForm();
  }

  function resendCode() {
    codeSent = false;
    codeRequested = false;
    verificationCode = '';
    errorMessage = '';
    successMessage = '';
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
              placeholder="Enter your full name"
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
            disabled={isLoading || codeSent}
            placeholder="Enter your email address"
          />
        </div>

        {#if !codeSent}
          <div class="form-actions">
            <button type="button" class="btn-secondary" on:click={closeModal} disabled={isLoading}>
              Cancel
            </button>
            <button type="button" class="btn-primary" on:click={requestCode} disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </div>
        {:else}
          <div class="form-group">
            <label for="verificationCode">6-Digit Verification Code</label>
            <input
              type="text"
              id="verificationCode"
              bind:value={verificationCode}
              required
              disabled={isLoading}
              placeholder="Enter 6-digit code"
              maxlength="6"
              inputmode="numeric"
              on:input={(e) => {
                // Only allow numeric input
                const target = e.target as HTMLInputElement;
                verificationCode = target.value.replace(/[^0-9]/g, '');
              }}
            />
            <small class="help-text">Enter the 6-digit code sent to your email</small>
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
          
          <div class="form-actions">
            <button type="button" class="btn-secondary" on:click={closeModal} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" class="btn-primary" disabled={isLoading}>
              {isLoading ? 'Verifying...' : (mode === 'signin' ? 'Sign In' : 'Sign Up')}
            </button>
          </div>

          <div class="resend-section">
            <button type="button" class="link-btn" on:click={resendCode} disabled={isLoading}>
              Send New Code
            </button>
          </div>
        {/if}
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
    max-width: 320px;
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

  .help-text {
    display: block;
    margin-top: 0.25rem;
    font-size: 0.8rem;
    color: #666;
  }

  .success-message {
    background: #d4edda;
    color: #155724;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    font-size: 0.9rem;
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

  .resend-section {
    text-align: center;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
  }
</style>

