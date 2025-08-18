<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { auth, authMethods } from '../auth';
  import { apiClient } from '../api';

  const dispatch = createEventDispatcher();

  let email = '';
  let verificationCode = '';
  let isLoading = false;
  let errorMessage = '';
  let successMessage = '';
  let codeRequested = false;
  let codeSent = false;

  function resetForm() {
    email = '';
    verificationCode = '';
    errorMessage = '';
    successMessage = '';
    codeRequested = false;
    codeSent = false;
  }

  async function requestCode() {
    if (!email) {
      errorMessage = 'Please enter your admin email address';
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
    if (!codeSent) {
      await requestCode();
      return;
    }
    
    if (!verificationCode) {
      errorMessage = 'Please enter the verification code';
      return;
    }

    isLoading = true;
    errorMessage = '';

    try {
      const result = await authMethods.signinWithCode(email, verificationCode);
      if (result.success) {
        // Check if user has admin privileges
        try {
          // Get current user from auth store
          let currentUser: any = null;
          auth.subscribe(state => {
            currentUser = state.user;
          })();
          
          if (currentUser && currentUser.user_type === 'admin') {
            console.log('Admin login successful');
            dispatch('loginSuccess');
          } else {
            errorMessage = 'Access denied. This page is restricted to administrators only.';
            // Log out the non-admin user
            authMethods.logout();
          }
        } catch (err) {
          errorMessage = 'Failed to verify admin privileges. Please contact support.';
          authMethods.logout();
        }
      } else {
        errorMessage = result.error || 'Invalid verification code';
      }
    } catch (error: any) {
      errorMessage = error.message || 'Verification failed';
    } finally {
      isLoading = false;
    }
  }

  function resendCode() {
    resetForm();
    requestCode();
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  }
</script>

<div class="admin-login-form">
  <div class="form-header">
    <h2>🔐 Admin Authentication</h2>
    <p>Enter your admin email to receive a verification code</p>
  </div>
  
  <form on:submit|preventDefault={handleSubmit}>
    {#if !codeSent}
      <!-- Email Input Step -->
      <div class="form-group">
        <label for="admin-email">Admin Email</label>
        <input
          type="email"
          id="admin-email"
          bind:value={email}
          placeholder="Enter your admin email address"
          on:keypress={handleKeyPress}
          required
          autocomplete="email"
        />
      </div>
      
      <button type="submit" class="btn-admin-login" disabled={isLoading}>
        {isLoading ? 'Sending Code...' : '📧 Send Verification Code'}
      </button>
    {:else}
      <!-- Verification Code Step -->
      <div class="form-group">
        <label for="verification-code">Verification Code</label>
        <input
          type="text"
          id="verification-code"
          bind:value={verificationCode}
          placeholder="Enter the 6-digit code"
          on:keypress={handleKeyPress}
          required
          autocomplete="one-time-code"
          maxlength="6"
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
        <button type="button" class="btn-secondary" on:click={resetForm} disabled={isLoading}>
          Start Over
        </button>
        <button type="submit" class="btn-admin-login" disabled={isLoading}>
          {isLoading ? 'Verifying...' : '✅ Verify & Sign In'}
        </button>
      </div>

      <div class="resend-section">
        <button type="button" class="link-btn" on:click={resendCode} disabled={isLoading}>
          Send New Code
        </button>
      </div>
    {/if}
  </form>
</div>

<style>
  .admin-login-form {
    max-width: 400px;
    margin: 0 auto;
    padding: 2rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
  
  .form-header {
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .form-header h2 {
    color: #1f2937;
    margin-bottom: 0.5rem;
    font-size: 1.5rem;
  }
  
  .form-header p {
    color: #6b7280;
    font-size: 0.9rem;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    color: #374151;
    font-weight: 600;
    font-size: 0.9rem;
  }
  
  .form-group input {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.2s ease;
  }
  
  .form-group input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  .help-text {
    font-size: 0.8rem;
    color: #6b7280;
    margin-top: 0.5rem;
  }
  
  .success-message {
    background: #d1fae5;
    color: #065f46;
    padding: 0.75rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }
  
  .error-message {
    background: #fef2f2;
    color: #dc2626;
    padding: 0.75rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }
  
  .btn-admin-login {
    width: 100%;
    padding: 0.875rem;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .btn-admin-login:hover:not(:disabled) {
    background: #5a67d8;
    transform: translateY(-1px);
  }
  
  .btn-admin-login:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  .btn-secondary {
    width: 100%;
    padding: 0.75rem;
    background: #f3f4f6;
    color: #374151;
    border: 2px solid #d1d5db;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  
  .btn-secondary:hover {
    background: #e5e7eb;
    border-color: #9ca3af;
  }
  
  .form-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .resend-section {
    text-align: center;
    margin-top: 1.5rem;
  }
  
  .link-btn {
    background: none;
    border: none;
    color: #667eea;
    font-weight: 600;
    cursor: pointer;
    text-decoration: underline;
    font-size: 0.9rem;
    transition: color 0.2s ease;
  }
  
  .link-btn:hover:not(:disabled) {
    color: #5a67d8;
  }
  
  .link-btn:disabled {
    color: #9ca3af;
    cursor: not-allowed;
    text-decoration: none;
  }
</style>
