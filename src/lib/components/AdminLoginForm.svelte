<script lang="ts">
  import { authMethods } from '$lib/auth';
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  let username = '';
  let password = '';
  let isLoading = false;
  let error = '';
  
  async function handleAdminLogin() {
    if (!username || !password) {
      error = 'Please enter both username and password';
      return;
    }
    
    isLoading = true;
    error = '';
    
    try {
      const result = await authMethods.adminLogin({ username, password });
      
      if (result.success) {
        console.log('Admin login successful');
        dispatch('loginSuccess');
      } else {
        error = result.error || 'Admin login failed';
      }
    } catch (err: any) {
      error = err.message || 'An unexpected error occurred';
    } finally {
      isLoading = false;
    }
  }
  
  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleAdminLogin();
    }
  }
</script>

<div class="admin-login-form">
  <div class="form-header">
    <h2>🔐 Admin Authentication</h2>
    <p>Enter your administrator credentials to access the dashboard</p>
  </div>
  
  <form on:submit|preventDefault={handleAdminLogin}>
    <div class="form-group">
      <label for="admin-username">Username</label>
      <input
        type="text"
        id="admin-username"
        bind:value={username}
        placeholder="Enter admin username"
        on:keypress={handleKeyPress}
        required
        autocomplete="username"
      />
    </div>
    
    <div class="form-group">
      <label for="admin-password">Password</label>
      <input
        type="password"
        id="admin-password"
        bind:value={password}
        placeholder="Enter admin password"
        on:keypress={handleKeyPress}
        required
        autocomplete="current-password"
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
        Authenticating...
      {:else}
        🔐 Sign In as Administrator
      {/if}
    </button>
  </form>
  
  <div class="demo-credentials">
    <h4>Demo Admin Account</h4>
    <p><strong>Username:</strong> admin</p>
    <p><strong>Password:</strong> admin123</p>
    <small>Use these credentials for testing purposes</small>
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
