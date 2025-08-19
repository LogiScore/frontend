<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  
  // Cookie consent state
  const showBanner = writable(false);
  const consentGiven = writable(false);
  const showPreferences = writable(false);
  
  // Cookie preferences
  let preferences: Record<string, boolean> = {
    necessary: true, // Always true, can't be disabled
    functional: true,
    analytics: false,
    marketing: false
  };
  
  onMount(() => {
    // Check if consent has already been given
    const existingConsent = localStorage.getItem('logiscore-cookie-consent');
    if (!existingConsent) {
      showBanner.set(true);
    } else {
      try {
        const savedPreferences = JSON.parse(existingConsent);
        preferences = { ...preferences, ...savedPreferences };
        consentGiven.set(true);
      } catch (e) {
        showBanner.set(true);
      }
    }
  });
  
  function acceptAll() {
    preferences = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true
    };
    saveConsent();
    showBanner.set(false);
    consentGiven.set(true);
  }
  
  function acceptEssential() {
    preferences = {
      necessary: true,
      functional: true,
      analytics: false,
      marketing: false
    };
    saveConsent();
    showBanner.set(false);
    consentGiven.set(true);
  }
  
  function saveConsent() {
    localStorage.setItem('logiscore-cookie-consent', JSON.stringify(preferences));
    
    // Here you would typically trigger your analytics/marketing scripts based on preferences
    if (preferences.analytics) {
      // Enable analytics cookies
      console.log('Analytics cookies enabled');
    }
    if (preferences.marketing) {
      // Enable marketing cookies
      console.log('Marketing cookies enabled');
    }
  }
  
  function togglePreferences() {
    showPreferences.set(!$showPreferences);
  }
  
  function updatePreference(type: string, value: boolean) {
    if (type === 'necessary') return; // Can't disable necessary cookies
    preferences[type] = value;
  }
  
  function savePreferences() {
    saveConsent();
    showPreferences.set(false);
    showBanner.set(false);
    consentGiven.set(true);
  }
</script>

{#if $showBanner}
  <div class="cookie-banner" class:show-preferences={$showPreferences}>
    <div class="cookie-content">
      <div class="cookie-header">
        <h3>🍪 Cookie Consent</h3>
        <p>We use cookies to enhance your experience on LogiScore. Some cookies are essential for the platform to function properly, while others help us improve our services.</p>
      </div>
      
      {#if $showPreferences}
        <div class="cookie-preferences">
          <h4>Cookie Preferences</h4>
          
          <div class="preference-item">
            <label class="preference-label">
              <input type="checkbox" checked={preferences.necessary} disabled />
              <span class="checkmark"></span>
              <div class="preference-text">
                <strong>Strictly Necessary Cookies</strong>
                <small>Required for the platform to function (login, security, transactions)</small>
              </div>
            </label>
          </div>
          
          <div class="preference-item">
            <label class="preference-label">
              <input type="checkbox" bind:checked={preferences.functional} />
              <span class="checkmark"></span>
              <div class="preference-text">
                <strong>Functional Cookies</strong>
                <small>Remember your preferences and login sessions</small>
              </div>
            </label>
          </div>
          
          <div class="preference-item">
            <label class="preference-label">
              <input type="checkbox" bind:checked={preferences.analytics} />
              <span class="checkmark"></span>
              <div class="preference-text">
                <strong>Analytics Cookies</strong>
                <small>Help us understand how you use the platform to improve services</small>
              </div>
            </label>
          </div>
          
          <div class="preference-item">
            <label class="preference-label">
              <input type="checkbox" bind:checked={preferences.marketing} />
              <span class="checkmark"></span>
              <div class="preference-text">
                <strong>Marketing Cookies</strong>
                <small>Deliver relevant advertising and measure campaign effectiveness</small>
              </div>
            </label>
          </div>
          
          <div class="preference-actions">
            <button class="btn btn-secondary" on:click={() => showPreferences.set(false)}>Cancel</button>
            <button class="btn btn-primary" on:click={savePreferences}>Save Preferences</button>
          </div>
        </div>
             {:else}
         <div class="cookie-actions">
           <button class="btn btn-secondary" on:click={acceptEssential}>Accept Essential Only</button>
           <button class="btn btn-secondary" on:click={togglePreferences}>Customize</button>
           <button class="btn btn-primary" on:click={acceptAll}>Accept All</button>
         </div>
       {/if}
      
      <div class="cookie-footer">
        <p>By continuing to use LogiScore, you agree to our <a href="/cookies">Cookie Policy</a> and <a href="/privacy">Privacy Policy</a>.</p>
      </div>
    </div>
  </div>
{/if}

<style>
  .cookie-banner {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    border-top: 2px solid #ffd700;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    transform: translateY(100%);
    transition: transform 0.3s ease;
    animation: slideUp 0.5s ease forwards;
  }
  
  @keyframes slideUp {
    to {
      transform: translateY(0);
    }
  }
  
  .cookie-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .cookie-header h3 {
    margin: 0 0 10px 0;
    color: #333;
    font-size: 1.2rem;
  }
  
  .cookie-header p {
    margin: 0 0 20px 0;
    color: #666;
    line-height: 1.5;
  }
  
  .cookie-actions {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }
  
  .cookie-preferences {
    margin-bottom: 20px;
  }
  
  .cookie-preferences h4 {
    margin: 0 0 15px 0;
    color: #333;
    font-size: 1.1rem;
  }
  
  .preference-item {
    margin-bottom: 15px;
  }
  
  .preference-label {
    display: flex;
    align-items: flex-start;
    cursor: pointer;
    gap: 12px;
  }
  
  .preference-label input[type="checkbox"] {
    display: none;
  }
  
  .checkmark {
    width: 20px;
    height: 20px;
    border: 2px solid #ddd;
    border-radius: 4px;
    position: relative;
    flex-shrink: 0;
    margin-top: 2px;
  }
  
  .preference-label input[type="checkbox"]:checked + .checkmark {
    background: #ffd700;
    border-color: #ffd700;
  }
  
  .preference-label input[type="checkbox"]:checked + .checkmark::after {
    content: '✓';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #333;
    font-size: 14px;
    font-weight: bold;
  }
  
  .preference-label input[type="checkbox"]:disabled + .checkmark {
    background: #f5f5f5;
    border-color: #ccc;
    cursor: not-allowed;
  }
  
  .preference-text strong {
    display: block;
    color: #333;
    margin-bottom: 4px;
  }
  
  .preference-text small {
    color: #666;
    font-size: 0.9rem;
    line-height: 1.4;
  }
  
  .preference-actions {
    display: flex;
    gap: 15px;
    margin-top: 20px;
  }
  
  .cookie-footer {
    border-top: 1px solid #eee;
    padding-top: 15px;
    margin-top: 15px;
  }
  
  .cookie-footer p {
    margin: 0;
    font-size: 0.9rem;
    color: #666;
    text-align: center;
  }
  
  .cookie-footer a {
    color: #007bff;
    text-decoration: none;
  }
  
  .cookie-footer a:hover {
    text-decoration: underline;
  }
  
  .btn {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
  }
  
  .btn-primary {
    background: #ffd700;
    color: #333;
  }
  
  .btn-primary:hover {
    background: #ffed4e;
    transform: translateY(-1px);
  }
  
  .btn-secondary {
    background: #f8f9fa;
    color: #333;
    border: 1px solid #dee2e6;
  }
  
  .btn-secondary:hover {
    background: #e9ecef;
    transform: translateY(-1px);
  }
  
  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 768px) {
    .cookie-content {
      padding: 15px;
    }
    
    .cookie-actions,
    .preference-actions {
      flex-direction: column;
    }
    
    .btn {
      width: 100%;
    }
    
    .preference-label {
      align-items: flex-start;
    }
  }
</style>
