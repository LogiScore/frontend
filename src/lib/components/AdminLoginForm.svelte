<script lang="ts">
  import { authMethods } from '$lib/auth';
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  let email = '';
  let verificationCode = '';
  let isLoading = false;
  let error = '';
  let showCodeInput = false;
  let countdown = 0;
  let countdownInterval: number | null = null;
  
  async function handleRequestCode() {
    if (!email) {
      error = 'Please enter your admin email address';
      return;
    }
    
    isLoading = true;
    error = '';
    
    try {
      // Use the regular verification code flow
      const result = await authMethods.requestCode(email);
      
      if (result.success) {
        showCodeInput = true;
        startCountdown(result.expires_in || 300); // Default to 5 minutes
        console.log('Verification code sent successfully');
      } else {
        error = result.error || 'Failed to send verification code';
      }
    } catch (err: any) {
      error = err.message || 'An unexpected error occurred';
    } finally {
      isLoading = false;
    }
  }
  
  async function handleVerifyCode() {
    if (!verificationCode) {
      error = 'Please enter the verification code';
      return;
    }
    
    isLoading = true;
    error = '';
    
    try {
      // Use the regular signin with code flow
      const result = await authMethods.signinWithCode(email, verificationCode);
      
      if (result.success) {
        // Check if user has admin privileges by checking the auth store
        // The user should already be logged in at this point
        console.log('Admin login successful');
        dispatch('loginSuccess');
      } else {
        error = result.error || 'Verification failed';
      }
    } catch (err: any) {
      error = err.message || 'An unexpected error occurred';
    } finally {
      isLoading = false;
    }
  }
  
  function startCountdown(seconds: number) {
    countdown = seconds;
    countdownInterval = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        if (countdownInterval) {
          clearInterval(countdownInterval);
          countdownInterval = null;
        }
      }
    }, 1000);
  }
  
  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      if (showCodeInput) {
        handleVerifyCode();
      } else {
        handleRequestCode();
      }
    }
  }
  
  function resetForm() {
    email = '';
    verificationCode = '';
    showCodeInput = false;
    error = '';
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
    countdown = 0;
  }
  
  // Cleanup on component destroy
  import { onDestroy } from 'svelte';
  onDestroy(() => {
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }
  });
</script>

<div class="admin-login-form">
  <div class="form-header">
    <h2>🔐 Admin Authentication</h2>
    <p>Enter your admin email to receive a verification code</p>
  </div>
  
  {#if !showCodeInput}
    <!-- Email Input Step -->
    <form on:submit|preventDefault={handleRequestCode}>
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
      
      {#if error}
        <div class="error-message">
          <span class="error-icon">❌</span>
          {error}
        </div>
      {/if}
      
      <button type="submit" class="btn-admin-login" disabled={isLoading}>
        {#if isLoading}
          <span class="loading-spinner"></span>
          Sending Code...
        {:else}
          📧 Send Verification Code
        {/if}
      </button>
    </form>
  {:else}
    <!-- Verification Code Step -->
    <form on:submit|preventDefault={handleVerifyCode}>
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
          pattern="[0-9]{6}"
        />
        <div class="help-text">
          Code expires in {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
        </div>
      </div>
      
      {#if error}
        <div class="error-message">
          <span class="error-icon">❌</span>
          {error}
        </div>
      {/if}
      
      <div class="button-group">
        <button type="submit" class="btn-admin-login" disabled={isLoading}>
          {#if isLoading}
            <span class="loading-spinner"></span>
            Verifying...
          {:else}
            ✅ Verify & Sign In
          {/if}
        </button>
        
        <button type="button" class="btn-secondary" on:click={resetForm}>
          🔄 Start Over
        </button>
      </div>
    </form>
    
    <div class="resend-section">
      <p>Didn't receive the code?</p>
      <button 
        type="button" 
        class="btn-resend" 
        on:click={handleRequestCode}
        disabled={countdown > 0}
      >
        {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
      </button>
    </div>
  {/if}
  
  <div class="demo-info">
    <h4>Admin Access Required</h4>
    <p>This dashboard is restricted to authorized administrators only.</p>
    <small>Contact your system administrator if you need access.</small>
  </div>
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
  
  .error-message {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    color: #dc2626;
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }
  
  .error-icon {
    font-size: 1rem;
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
  
  .loading-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .demo-credentials {
    margin-top: 2rem;
    padding: 1rem;
    background: #f3f4f6;
    border-radius: 8px;
    text-align: center;
  }
  
  .demo-credentials h4 {
    color: #374151;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }
  
  .demo-credentials p {
    color: #6b7280;
    margin: 0.25rem 0;
    font-size: 0.85rem;
  }
  
  .demo-credentials small {
    color: #9ca3af;
    font-size: 0.75rem;
  }
</style>
