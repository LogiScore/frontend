<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { auth, authMethods } from '../auth';
  import { apiClient } from '../api';
  import { validateBusinessEmail } from '../emailValidation';

  export let isOpen = false;
  export let mode = 'signin'; // 'signin' or 'signup'

  const dispatch = createEventDispatcher();

  let email = '';
  let verificationCode = '';
  let confirmPassword = '';
  let fullName = '';
  let companyName = '';
  let userType = 'shipper'; // Default to shipper
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
    companyName = '';
    userType = 'shipper';
    errorMessage = '';
    successMessage = '';
    codeRequested = false;
    codeSent = false;
  }

  // Generate username from full name
  function generateUsername(fullName: string): string {
    if (!fullName) return '';
    return fullName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20);
  }

  async function requestCode() {
    if (!email) {
      errorMessage = 'Please enter your email address';
      return;
    }

    // Validate email against free email service restrictions
    const emailValidation = validateBusinessEmail(email);
    if (!emailValidation.isValid) {
      errorMessage = emailValidation.reason || 'Invalid email address';
      return;
    }

    console.log('🔍 Starting email verification process for:', email);
    isLoading = true;
    errorMessage = '';

    try {
      console.log('📧 Calling authMethods.requestCode...');
      const result = await authMethods.requestCode(email);
      console.log('📧 Result from requestCode:', result);
      
      if (result.success) {
        successMessage = `Verification code sent! Check your email. Code expires in ${result.expires_in} minutes.`;
        codeRequested = true;
        codeSent = true;
        console.log('✅ Verification code sent successfully');
      } else {
        errorMessage = result.error || 'Failed to send verification code';
        console.error('❌ Failed to send verification code:', result.error);
      }
    } catch (error: any) {
      errorMessage = error.message || 'Failed to send verification code';
      console.error('💥 Exception during verification code request:', error);
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

        if (!companyName) {
          errorMessage = 'Please enter your company name';
          return;
        }

        // Generate username from full name
        const username = generateUsername(fullName);

        console.log('🔐 Calling verifyCode endpoint with:', { email, code: verificationCode, name: fullName, company: companyName, userType });

        // For signup, verify the code and complete user authentication
        const result = await apiClient.verifyCode(email, verificationCode, fullName, companyName, userType);
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

          <div class="form-group">
            <label for="companyName">Company Name</label>
            <input
              type="text"
              id="companyName"
              bind:value={companyName}
              required
              disabled={isLoading}
              placeholder="Enter your company name"
            />
          </div>

          <div class="form-group">
            <label for="userType">I am a:</label>
            <select
              id="userType"
              bind:value={userType}
              required
              disabled={isLoading}
            >
              <option value="shipper">Shipper/Importer/Exporter/BCO</option>
              <option value="freight_forwarder">Freight Forwarder</option>
            </select>
            <small class="help-text">
              This determines your pricing tier and available features
            </small>
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
          {#if mode === 'signup'}
            <small class="help-text email-restriction">
              <strong>Note:</strong> Only corporate or business email addresses are allowed. 
              Free email services (Gmail, Yahoo, Hotmail, etc.) are not permitted.
            </small>
          {/if}
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
    padding: 1.44rem;
    max-width: 360px;
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

  .form-group input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
    box-sizing: border-box;
  }

  .form-group input:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }

  .form-group input:disabled {
    background: #f8f9fa;
    cursor: not-allowed;
  }

  .form-group select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
    background-color: white;
    cursor: pointer;
    box-sizing: border-box;
  }

  .form-group select:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }

  .form-group select:disabled {
    background: #f8f9fa;
    cursor: not-allowed;
  }

  .help-text {
    display: block;
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: #666;
    line-height: 1.4;
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

  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 2rem;
    margin-bottom: 1rem;
  }

  .btn-primary {
    background: #007bff;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
    min-width: 120px;
    font-size: 1rem;
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
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
    min-width: 120px;
    font-size: 1rem;
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

  .modal-footer {
    text-align: center;
    padding-top: 1.5rem;
    border-top: 1px solid #eee;
    margin-top: 1rem;
  }

  .modal-footer p {
    margin: 0;
    color: #666;
    font-size: 1rem;
    line-height: 1.5;
  }

  .link-btn {
    background: none;
    border: none;
    color: #007bff;
    cursor: pointer;
    font-weight: 500;
    text-decoration: underline;
    margin-left: 0.5rem;
    font-size: 1rem;
    transition: color 0.3s ease;
  }

  .link-btn:hover {
    color: #0056b3;
  }

  .resend-section {
    text-align: center;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid #eee;
  }

  .email-restriction {
    color: #856404;
    background-color: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 4px;
    padding: 0.75rem;
    margin-top: 0.5rem;
    display: block;
    font-size: 0.875rem;
    line-height: 1.4;
  }

  /* Responsive improvements */
  @media (max-width: 450px) {
    .modal-content {
      padding: 1.08rem;
      width: 95%;
      margin: 1rem;
    }
    
    .form-actions {
      flex-direction: column;
      gap: 0.75rem;
    }
    
    .btn-primary,
    .btn-secondary {
      min-width: 100%;
    }
  }
</style>

