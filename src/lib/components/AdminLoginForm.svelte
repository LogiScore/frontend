<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { auth, authMethods } from '../auth';
  import { apiClient } from '../api';

  const dispatch = createEventDispatcher();

  // Admin email is pre-configured
  const ADMIN_EMAIL = 'admin@logiscore.net';
  
  let verificationCode = '';
  let isLoading = false;
  let errorMessage = '';
  let successMessage = '';
  let codeRequested = false;
  let codeSent = false;

  function resetForm() {
    verificationCode = '';
    errorMessage = '';
    successMessage = '';
    codeRequested = false;
    codeSent = false;
  }

  async function requestCode() {
    isLoading = true;
    errorMessage = '';

    try {
      // Use admin-specific verification code request with pre-filled email
      const response = await apiClient.sendAdminVerificationCode(ADMIN_EMAIL);
      successMessage = `Verification code sent! Check your email. Code expires in ${response.expires_in} minutes.`;
      codeRequested = true;
      codeSent = true;
    } catch (error: any) {
      console.error('Failed to request admin verification code:', error);
      errorMessage = error.message || 'Failed to send verification code. Please check your email and try again.';
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
      // Use admin-specific verification with pre-filled email
      const response = await apiClient.verifyAdminCode(ADMIN_EMAIL, verificationCode);
      
      if (response.user && response.access_token) {
        // Check if user has admin privileges
        if (response.user.user_type === 'admin') {
          console.log('Admin login successful');
          
          // Manually update the auth store with admin user data
          auth.update(state => ({
            ...state,
            user: response.user,
            token: response.access_token,
            error: null,
            isLoading: false
          }));
          
          // Save to localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('logiscore_token', response.access_token);
            localStorage.setItem('logiscore_user', JSON.stringify(response.user));
          }
          
          dispatch('loginSuccess');
        } else {
          errorMessage = 'Access denied. This page is restricted to administrators only.';
        }
      } else {
        errorMessage = 'Invalid verification code or response';
      }
    } catch (error: any) {
      console.error('Admin verification failed:', error);
      errorMessage = error.message || 'Verification failed. Please check your code and try again.';
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
  </div>
  
  <form on:submit|preventDefault={handleSubmit}>
    {#if !codeSent}
      <!-- Send Code Step -->
      <div class="form-group">
        <p class="help-text">Click the button below to receive a verification code</p>
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
    max-width: 320px;
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
    width: 100%;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #374151;
    width: 100%;
  }
  
  .form-group input {
    width: 100%;
    padding: 0.875rem;
    border: 2px solid #d1d5db;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.2s ease;
    box-sizing: border-box;
  }
  
  .form-group input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  .admin-email-display {
    background: #f8fafc;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    padding: 1rem;
    text-align: center;
    margin-bottom: 1rem;
    color: #374151;
    width: 100%;
    box-sizing: border-box;
  }
  
  .help-text {
    color: #6b7280;
    font-size: 0.875rem;
    margin-top: 0.5rem;
    text-align: center;
    width: 100%;
  }
  
  .success-message {
    background: #d1fae5;
    color: #065f46;
    padding: 0.75rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    font-size: 0.9rem;
    width: 100%;
    box-sizing: border-box;
  }
  
  .error-message {
    background: #fef2f2;
    color: #dc2626;
    padding: 0.75rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    font-size: 0.9rem;
    width: 100%;
    box-sizing: border-box;
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
    box-sizing: border-box;
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
    box-sizing: border-box;
  }
  
  .btn-secondary:hover {
    background: #e5e7eb;
    border-color: #9ca3af;
  }
  
  .form-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
  }
  
  .resend-section {
    text-align: center;
    margin-top: 1.5rem;
    width: 100%;
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

  /* Ensure form takes full width */
  form {
    width: 100%;
  }

  /* Fix any potential margin/padding issues */
  * {
    box-sizing: border-box;
  }

  /* Additional alignment fixes */
  .admin-login-form > * {
    width: 100%;
  }

  /* Ensure consistent button alignment */
  button {
    box-sizing: border-box;
    width: 100%;
  }

  /* Fix form group spacing */
  .form-group > * {
    width: 100%;
    display: block;
  }

  /* Ensure help text is properly aligned */
  .help-text {
    text-align: center;
    margin: 0.5rem 0;
  }

  /* Fix button margins */
  .btn-admin-login,
  .btn-secondary {
    margin: 0.5rem 0;
  }

  /* Ensure form actions are properly spaced */
  .form-actions > * {
    margin: 0.25rem 0;
  }
</style>
