<script lang="ts">
  import { auth, authMethods } from '$lib/auth';
  import { fade, scale } from 'svelte/transition';
  import { onMount, onDestroy } from 'svelte';
  
  let authState: { 
    user: any; 
    token: string | null; 
    isLoading: boolean; 
    error: string | null;
    showInactivityPrompt: boolean;
  } = {
    user: null,
    token: null,
    isLoading: false,
    error: null,
    showInactivityPrompt: false
  };
  
  let timeLeft = 60; // 60 seconds
  let countdownInterval: number;
  
  // Subscribe to auth store
  auth.subscribe(state => {
    authState = state;
    
    // Start countdown when prompt is shown
    if (state.showInactivityPrompt && !countdownInterval) {
      startCountdown();
    } else if (!state.showInactivityPrompt && countdownInterval) {
      stopCountdown();
    }
  });
  
  function startCountdown() {
    timeLeft = 60;
    countdownInterval = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        stopCountdown();
        // Timeout will be handled by the auth system
      }
    }, 1000);
  }
  
  function stopCountdown() {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = 0;
    }
  }
  
  function extendSession() {
    authMethods.extendSession();
  }
  
  function endSession() {
    authMethods.endSession();
  }
  
  onDestroy(() => {
    stopCountdown();
  });
  
  $: minutes = Math.floor(timeLeft / 60);
  $: seconds = timeLeft % 60;
  $: timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;
</script>

{#if authState.showInactivityPrompt}
  <div class="inactivity-overlay" transition:fade={{ duration: 200 }}>
    <div class="inactivity-modal" transition:scale={{ duration: 200 }}>
      <div class="modal-header">
        <h3>Session Timeout</h3>
        <div class="timer" class:warning={timeLeft <= 10}>
          {timeDisplay}
        </div>
      </div>
      
      <div class="modal-content">
        <p>You've been inactive for 10 minutes. Would you like to keep your session open?</p>
        <p class="warning">You'll be automatically logged out in {timeLeft} seconds if you don't respond.</p>
      </div>
      
      <div class="modal-actions">
        <button class="btn-secondary" on:click={endSession}>
          End Session
        </button>
        <button class="btn-primary" on:click={extendSession}>
          Keep Session Open
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .inactivity-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    backdrop-filter: blur(4px);
  }
  
  .inactivity-modal {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    text-align: center;
  }
  
  .modal-header {
    margin-bottom: 1.5rem;
  }
  
  .modal-header h3 {
    margin: 0 0 0.5rem 0;
    color: #111827;
    font-size: 1.5rem;
    font-weight: 600;
  }
  
  .timer {
    background: #fef3c7;
    color: #d97706;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 600;
    display: inline-block;
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  
  .timer.warning {
    background: #fee2e2;
    color: #dc2626;
    animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
  
  .modal-content {
    margin-bottom: 2rem;
  }
  
  .modal-content p {
    margin: 0 0 1rem 0;
    color: #374151;
    line-height: 1.5;
  }
  
  .warning {
    color: #dc2626 !important;
    font-weight: 500;
    font-size: 0.875rem;
  }
  
  .modal-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }
  
  .btn-primary {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
    min-width: 120px;
  }
  
  .btn-primary:hover {
    background: #2563eb;
  }
  
  .btn-secondary {
    background: white;
    color: #374151;
    border: 1px solid #d1d5db;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 120px;
  }
  
  .btn-secondary:hover {
    border-color: #9ca3af;
    background: #f9fafb;
  }
  
  @media (max-width: 480px) {
    .inactivity-modal {
      padding: 1.5rem;
      margin: 1rem;
    }
    
    .modal-actions {
      flex-direction: column;
    }
    
    .btn-primary,
    .btn-secondary {
      width: 100%;
    }
  }
</style>
