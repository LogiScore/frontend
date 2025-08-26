<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { auth } from '$lib/auth';

  export let isOpen = false;

  const dispatch = createEventDispatcher();

  // Subscription data
  let subscriptions = {
    forwarders: [] as string[],
    countries: [] as string[],
    cities: [] as string[]
  };

  // Auth state
  let authState: { user: any; token: string | null; isLoading: boolean; error: string | null } = {
    user: null,
    token: null,
    isLoading: false,
    error: null
  };

  // Subscribe to auth store
  auth.subscribe(state => {
    authState = state;
  });

  function closeModal() {
    dispatch('close');
  }

  function saveSubscriptions() {
    // TODO: Implement API call to save subscriptions
    alert('Subscriptions saved! (Feature coming soon)');
    closeModal();
  }
</script>

{#if isOpen}
  <div class="modal-overlay" on:click|self={closeModal}>
    <div class="modal-content" on:click|stopPropagation>
      <div class="modal-header">
        <h2>Review Notifications</h2>
        <button class="close-btn" on:click={closeModal}>&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="subscription-info">
          <p>🔔 Get notified when new reviews are submitted for your subscribed forwarders, countries, or cities.</p>
          <p><strong>Note:</strong> This feature is available with the Annual Subscription plan.</p>
        </div>

        <div class="subscription-section">
          <h3>Freight Forwarders</h3>
          <p>Subscribe to specific forwarders to get notified of new reviews.</p>
        </div>

        <div class="subscription-section">
          <h3>Countries</h3>
          <p>Subscribe to countries to get notified of new reviews in those regions.</p>
        </div>

        <div class="subscription-section">
          <h3>Cities</h3>
          <p>Subscribe to cities to get notified of new reviews in those locations.</p>
        </div>

        <div class="coming-soon">
          <p>🚧 This feature is coming soon! Check back after the backend implementation is complete.</p>
        </div>
      </div>

      <div class="modal-actions">
        <button type="button" class="btn-secondary" on:click={closeModal}>
          Close
        </button>
        <button type="button" class="btn-primary" on:click={saveSubscriptions}>
          Save Subscriptions
        </button>
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
    border-radius: 12px;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #e9ecef;
  }

  .modal-header h2 {
    margin: 0;
    color: #333;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
  }

  .modal-body {
    padding: 20px;
  }

  .subscription-info {
    margin-bottom: 24px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
  }

  .subscription-info p {
    margin: 0 0 8px 0;
    color: #495057;
  }

  .subscription-section {
    margin-bottom: 20px;
  }

  .subscription-section h3 {
    margin: 0 0 8px 0;
    color: #333;
    font-size: 1.1rem;
  }

  .subscription-section p {
    margin: 0;
    color: #666;
    font-size: 0.9rem;
  }

  .coming-soon {
    margin-top: 24px;
    padding: 16px;
    background: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 8px;
    text-align: center;
  }

  .coming-soon p {
    margin: 0;
    color: #856404;
    font-size: 0.9rem;
  }

  .modal-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    padding: 20px;
    border-top: 1px solid #e9ecef;
  }

  .btn-primary, .btn-secondary {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .btn-primary {
    background: #007bff;
    color: white;
  }

  .btn-primary:hover {
    background: #0056b3;
  }

  .btn-secondary {
    background: #6c757d;
    color: white;
  }

  .btn-secondary:hover {
    background: #545b62;
  }
</style>
