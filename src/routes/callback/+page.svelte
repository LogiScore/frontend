<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { auth, authMethods } from '$lib/auth';
  import { apiClient } from '$lib/api';

  let isLoading = true;
  let error = '';

  onMount(async () => {
    try {
      // Get the authorization code from URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const errorParam = urlParams.get('error');

      if (errorParam) {
        error = `GitHub authentication failed: ${errorParam}`;
        isLoading = false;
        return;
      }

      if (!code) {
        error = 'No authorization code received from GitHub';
        isLoading = false;
        return;
      }

      // Handle the GitHub callback
      await authMethods.handleGitHubCallback(code);
      
      // Redirect to home page
      goto('/');
    } catch (err) {
      console.error('GitHub callback error:', err);
      error = err instanceof Error ? err.message : 'Authentication failed';
      isLoading = false;
    }
  });
</script>

<svelte:head>
  <title>Authenticating - LogiScore</title>
</svelte:head>

<div class="callback-container">
  {#if isLoading}
    <div class="loading">
      <div class="spinner"></div>
      <h2>Authenticating with GitHub...</h2>
      <p>Please wait while we complete your sign-in.</p>
    </div>
  {:else if error}
    <div class="error">
      <h2>Authentication Failed</h2>
      <p>{error}</p>
      <button class="btn-primary" on:click={() => goto('/')}>
        Return to Home
      </button>
    </div>
  {/if}
</div>

<style>
  .callback-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .loading, .error {
    text-align: center;
    max-width: 400px;
    padding: 40px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    backdrop-filter: blur(10px);
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top: 4px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  h2 {
    margin-bottom: 15px;
    font-size: 1.5rem;
    font-weight: 600;
  }

  p {
    margin-bottom: 20px;
    opacity: 0.9;
    line-height: 1.6;
  }

  .btn-primary {
    background: #ffd700;
    color: #333;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s;
  }

  .btn-primary:hover {
    background: #e6c200;
  }

  .error {
    background: rgba(220, 53, 69, 0.1);
    border: 1px solid rgba(220, 53, 69, 0.3);
  }
</style> 