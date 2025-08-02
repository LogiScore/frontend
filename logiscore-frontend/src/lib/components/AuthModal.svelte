<script lang="ts">
  import { auth } from '$lib/auth';
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  export let isOpen = false;
  export let defaultMode: 'signin' | 'signup' = 'signin';
  
  let mode: 'signin' | 'signup' = defaultMode;
  let isLoading = false;
  let error = '';
  
  // Form data
  let signinData = {
    email: '',
    password: ''
  };
  
  let signupData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    userType: 'shipper'
  };
  
  // Reactive statement to update mode when defaultMode changes
  $: mode = defaultMode;
  
  function closeModal() {
    isOpen = false;
    dispatch('close');
  }
  
  function switchMode() {
    mode = mode === 'signin' ? 'signup' : 'signin';
    error = '';
  }
  
  async function handleSignin() {
    if (!signinData.email || !signinData.password) {
      error = 'Please fill in all fields';
      return;
    }
    
    isLoading = true;
    error = '';
    
    try {
      await auth.signin(signinData.email, signinData.password);
      closeModal();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Sign in failed';
    } finally {
      isLoading = false;
    }
  }
  
  async function handleSignup() {
    if (!signupData.name || !signupData.email || !signupData.password || !signupData.confirmPassword) {
      error = 'Please fill in all required fields';
      return;
    }
    
    if (signupData.password !== signupData.confirmPassword) {
      error = 'Passwords do not match';
      return;
    }
    
    if (signupData.password.length < 6) {
      error = 'Password must be at least 6 characters long';
      return;
    }
    
    isLoading = true;
    error = '';
    
    try {
      await auth.signup(
        signupData.email, 
        signupData.password, 
        signupData.name, 
        signupData.company || undefined,
        signupData.userType
      );
      closeModal();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Sign up failed';
    } finally {
      isLoading = false;
    }
  }
  
  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      closeModal();
    }
  }
</script>

<svelte:window on:keydown={handleKeyPress} />

{#if isOpen}
  <div class="modal-overlay" on:click={closeModal}>
    <div class="modal-content" on:click|stopPropagation>
      <button class="close-button" on:click={closeModal}>×</button>
      
      <div class="auth-container">
        <h2>{mode === 'signin' ? 'Sign In' : 'Create Account'}</h2>
        
        {#if error}
          <div class="error-message">
            {error}
          </div>
        {/if}
        
        {#if mode === 'signin'}
          <form on:submit|preventDefault={handleSignin} class="auth-form">
            <div class="form-group">
              <label for="signin-email">Email</label>
              <input 
                type="email" 
                id="signin-email"
                bind:value={signinData.email}
                required
                placeholder="Enter your email"
              />
            </div>
            
            <div class="form-group">
              <label for="signin-password">Password</label>
              <input 
                type="password" 
                id="signin-password"
                bind:value={signinData.password}
                required
                placeholder="Enter your password"
              />
            </div>
            
            <button type="submit" class="btn-primary" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        {:else}
          <form on:submit|preventDefault={handleSignup} class="auth-form">
            <div class="form-group">
              <label for="signup-name">Full Name *</label>
              <input 
                type="text" 
                id="signup-name"
                bind:value={signupData.name}
                required
                placeholder="Enter your full name"
              />
            </div>
            
            <div class="form-group">
              <label for="signup-email">Email *</label>
              <input 
                type="email" 
                id="signup-email"
                bind:value={signupData.email}
                required
                placeholder="Enter your email"
              />
            </div>
            
            <div class="form-group">
              <label for="signup-company">Company (Optional)</label>
              <input 
                type="text" 
                id="signup-company"
                bind:value={signupData.company}
                placeholder="Enter your company name"
              />
            </div>
            
            <div class="form-group">
              <label for="signup-user-type">I am a *</label>
              <select 
                id="signup-user-type"
                bind:value={signupData.userType}
                required
              >
                <option value="shipper">Shipper (I need freight forwarding services)</option>
                <option value="forwarder">Freight Forwarder (I provide freight forwarding services)</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="signup-password">Password *</label>
              <input 
                type="password" 
                id="signup-password"
                bind:value={signupData.password}
                required
                placeholder="Create a password"
              />
            </div>
            
            <div class="form-group">
              <label for="signup-confirm-password">Confirm Password *</label>
              <input 
                type="password" 
                id="signup-confirm-password"
                bind:value={signupData.confirmPassword}
                required
                placeholder="Confirm your password"
              />
            </div>
            
            <button type="submit" class="btn-primary" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        {/if}
        
        <div class="auth-footer">
          <p>
            {mode === 'signin' ? "Don't have an account?" : "Already have an account?"}
            <button class="link-button" on:click={switchMode}>
              {mode === 'signin' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
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
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
  }

  .modal-content {
    background: white;
    border-radius: 12px;
    padding: 0;
    max-width: 400px;
    width: 100%;
    position: relative;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }

  .close-button {
    position: absolute;
    top: 15px;
    right: 20px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    z-index: 1;
  }

  .close-button:hover {
    color: #333;
  }

  .auth-container {
    padding: 40px;
  }

  .auth-container h2 {
    text-align: center;
    margin-bottom: 30px;
    color: #333;
    font-size: 1.8rem;
  }

  .error-message {
    background: #f8d7da;
    color: #721c24;
    padding: 12px;
    border-radius: 6px;
    margin-bottom: 20px;
    font-size: 0.9rem;
  }

  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .form-group label {
    font-weight: 600;
    color: #333;
    font-size: 0.9rem;
  }

  .form-group input,
  .form-group select {
    padding: 12px;
    border: 2px solid #e9ecef;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.3s;
  }

  .form-group input:focus,
  .form-group select:focus {
    outline: none;
    border-color: #667eea;
  }

  .btn-primary {
    background: #667eea;
    color: white;
    padding: 12px;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s;
  }

  .btn-primary:hover:not(:disabled) {
    background: #5a6fd8;
  }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .auth-footer {
    margin-top: 30px;
    text-align: center;
    padding-top: 20px;
    border-top: 1px solid #e9ecef;
  }

  .auth-footer p {
    color: #666;
    font-size: 0.9rem;
  }

  .link-button {
    background: none;
    border: none;
    color: #667eea;
    font-weight: 600;
    cursor: pointer;
    text-decoration: underline;
    margin-left: 5px;
  }

  .link-button:hover {
    color: #5a6fd8;
  }

  @media (max-width: 480px) {
    .auth-container {
      padding: 30px 20px;
    }
    
    .modal-overlay {
      padding: 10px;
    }
  }
</style> 