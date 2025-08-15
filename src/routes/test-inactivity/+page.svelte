<script lang="ts">
  import { auth, authMethods } from '$lib/auth';
  import { onMount } from 'svelte';
  
  let authState: any = {};
  let inactivityStatus: any = {};
  
  // Subscribe to auth store
  auth.subscribe(state => {
    authState = state;
  });
  
  onMount(() => {
    // Get initial inactivity status
    inactivityStatus = authMethods.getInactivityStatus();
  });
  
  function test30SecondTimer() {
    authMethods.testInactivityTimer(30);
    inactivityStatus = authMethods.getInactivityStatus();
  }
  
  function test10SecondTimer() {
    authMethods.testInactivityTimer(10);
    inactivityStatus = authMethods.getInactivityStatus();
  }
  
  function resetTimers() {
    authMethods.extendSession();
    inactivityStatus = authMethods.getInactivityStatus();
  }
  
  function checkStatus() {
    inactivityStatus = authMethods.getInactivityStatus();
  }
  
  function clearPrompt() {
    auth.update(state => ({ ...state, showInactivityPrompt: false }));
    inactivityStatus = authMethods.getInactivityStatus();
  }
  
  function debugTracking() {
    const debugInfo = authMethods.debugInactivityTracking();
    console.log('Debug info:', debugInfo);
    alert('Check console for debug information');
  }
  
  function startTracking() {
    authMethods.startInactivityTracking();
    inactivityStatus = authMethods.getInactivityStatus();
  }
  
  function stopTracking() {
    authMethods.stopInactivityTracking();
    inactivityStatus = authMethods.getInactivityStatus();
  }
</script>

<svelte:head>
  <title>Test Inactivity - LogiScore</title>
</svelte:head>

<div class="container">
  <h1>Inactivity Timer Test Page</h1>
  
  <div class="status-section">
    <h2>Current Status</h2>
    <div class="status-grid">
      <div class="status-item">
        <strong>User Logged In:</strong> {authState.user ? 'Yes' : 'No'}
      </div>
      <div class="status-item">
        <strong>Show Inactivity Prompt:</strong> {authState.showInactivityPrompt ? 'Yes' : 'No'}
      </div>
      <div class="status-item">
        <strong>Has Inactivity Timer:</strong> {inactivityStatus.hasInactivityTimer ? 'Yes' : 'No'}
      </div>
      <div class="status-item">
        <strong>Has Prompt Timer:</strong> {inactivityStatus.hasPromptTimer ? 'Yes' : 'No'}
      </div>
      <div class="status-item">
        <strong>Inactivity Timeout:</strong> {inactivityStatus.inactivityTimeout || 'N/A'} seconds
      </div>
      <div class="status-item">
        <strong>Prompt Timeout:</strong> {inactivityStatus.promptTimeout || 'N/A'} seconds
      </div>
    </div>
    
    {#if authState.user}
      <div class="auth-info">
        <h3>Authentication Info</h3>
        <p><strong>User:</strong> {authState.user.email || authState.user.username || 'Unknown'}</p>
        <p><strong>Token:</strong> {authState.token ? 'Present' : 'Missing'}</p>
      </div>
    {:else}
      <div class="auth-warning">
        <h3>⚠️ Not Authenticated</h3>
        <p>You need to log in first for inactivity tracking to work.</p>
        <p>Go to the main page and sign in, then return here to test.</p>
      </div>
    {/if}
  </div>
  
  <div class="test-section">
    <h2>Test Controls</h2>
    <div class="button-group">
      <button class="btn btn-primary" on:click={test30SecondTimer}>
        Test 30 Second Timer
      </button>
      <button class="btn btn-primary" on:click={test10SecondTimer}>
        Test 10 Second Timer
      </button>
      <button class="btn btn-secondary" on:click={resetTimers}>
        Reset Timers
      </button>
      <button class="btn btn-secondary" on:click={checkStatus}>
        Check Status
      </button>
      <button class="btn btn-warning" on:click={clearPrompt}>
        Clear Prompt
      </button>
      <button class="btn btn-info" on:click={debugTracking}>
        Debug Tracking
      </button>
      <button class="btn btn-info" on:click={startTracking}>
        Start Tracking
      </button>
      <button class="btn btn-info" on:click={stopTracking}>
        Stop Tracking
      </button>
    </div>
  </div>
  
  <div class="info-section">
    <h2>How to Test</h2>
    <ol>
      <li>Click "Test 30 Second Timer" to set a 30-second inactivity timer</li>
      <li>Wait 30 seconds without moving your mouse or pressing keys</li>
      <li>The inactivity prompt should appear</li>
      <li>You have 60 seconds to respond before automatic logout</li>
      <li>Use "Reset Timers" to restart the normal 10-minute timer</li>
    </ol>
    
    <h3>Debug Information</h3>
    <p>Check the browser console for detailed logging of timer events.</p>
    <p>Normal inactivity timeout: 10 minutes (600 seconds)</p>
    <p>Prompt response timeout: 1 minute (60 seconds)</p>
  </div>
</div>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  
  h1 {
    color: #1f2937;
    text-align: center;
    margin-bottom: 2rem;
  }
  
  h2 {
    color: #374151;
    margin-top: 2rem;
    margin-bottom: 1rem;
  }
  
  .status-section, .test-section, .info-section {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .status-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }
  
  .status-item {
    background: white;
    padding: 1rem;
    border-radius: 6px;
    border: 1px solid #d1d5db;
  }
  
  .button-group {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  
  .btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 150px;
  }
  
  .btn-primary {
    background: #3b82f6;
    color: white;
  }
  
  .btn-primary:hover {
    background: #2563eb;
  }
  
  .btn-secondary {
    background: #6b7280;
    color: white;
  }
  
  .btn-secondary:hover {
    background: #4b5563;
  }
  
  .btn-warning {
    background: #f59e0b;
    color: white;
  }
  
  .btn-warning:hover {
    background: #d97706;
  }
  
  .btn-info {
    background: #4b5563;
    color: white;
  }
  
  .btn-info:hover {
    background: #374151;
  }
  
  .auth-info {
    background: #dbeafe;
    border: 1px solid #3b82f6;
    border-radius: 6px;
    padding: 1rem;
    margin-top: 1rem;
  }
  
  .auth-info h3 {
    color: #1e40af;
    margin: 0 0 0.5rem 0;
    font-size: 1.1rem;
  }
  
  .auth-info p {
    margin: 0.25rem 0;
    color: #1e40af;
  }
  
  .auth-warning {
    background: #fef3c7;
    border: 1px solid #f59e0b;
    border-radius: 6px;
    padding: 1rem;
    margin-top: 1rem;
  }
  
  .auth-warning h3 {
    color: #d97706;
    margin: 0 0 0.5rem 0;
    font-size: 1.1rem;
  }
  
  .auth-warning p {
    margin: 0.25rem 0;
    color: #d97706;
  }
  
  .info-section ol {
    padding-left: 1.5rem;
  }
  
  .info-section li {
    margin-bottom: 0.5rem;
    line-height: 1.6;
  }
  
  .info-section p {
    line-height: 1.6;
    color: #4b5563;
  }
  
  @media (max-width: 640px) {
    .container {
      padding: 1rem;
    }
    
    .button-group {
      flex-direction: column;
    }
    
    .btn {
      width: 100%;
    }
  }
</style>
