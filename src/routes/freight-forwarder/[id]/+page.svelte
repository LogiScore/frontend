<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { apiClient } from '$lib/api';
  import { auth } from '$lib/auth';
  import AuthModal from '$lib/components/AuthModal.svelte';
  
  let freightForwarder: any = null;
  let locationScores: any[] = [];
  let countryScores: any[] = [];
  let isLoading = true;
  let isLoadingScores = false;
  let error: string | null = null;
  let activeTab: 'overview' | 'locations' | 'countries' = 'overview';
  let showAuthModal = false;
  let authModalMode: 'signin' | 'signup' = 'signin';
  let isTogglingNotification = false;
  let isSubscribedToCompanyNotifications = false;
  let userSubscriptions: Array<{
    id: string;
    freight_forwarder_id?: string;
    freight_forwarder_name?: string;
    location_country?: string;
    location_city?: string;
    review_type?: string;
    notification_frequency: string;
    is_active: boolean;
    created_at: string;
  }> = [];
  let showSubscriptionList = false;
  
  $: freightForwarderId = $page.params?.id;
  $: user = $auth?.user;
  $: isSubscribed = user && user.subscription_tier && user.subscription_tier !== 'Basic' && user.subscription_tier !== 'free';
  $: isLoggedIn = !!user;
  $: isAnnualSubscriber = user && user.subscription_tier === 'annual';
  $: isMonthlySubscriber = user && user.subscription_tier === 'monthly';
  $: hasExpiredSubscription = user && user.subscription_tier && user.subscription_tier !== 'annual' && user.subscription_tier !== 'free' && user.subscription_tier !== 'Basic';
  
  // Debug subscription tier detection
  $: if (user) {
    console.log('User subscription tier:', user.subscription_tier);
    console.log('Is annual subscriber:', isAnnualSubscriber);
    console.log('Is monthly subscriber:', isMonthlySubscriber);
    console.log('Is subscribed (any tier):', isSubscribed);
  }
  
  // Reactive statement to load detailed scores when auth state changes
  $: if (freightForwarder && isSubscribed && $auth?.token && !isLoadingScores && locationScores.length === 0) {
    // Prevent multiple simultaneous calls
    if (!isLoadingScores) {
      loadDetailedScores();
    }
  }
  
  function openAuthModal(mode: 'signin' | 'signup') {
    authModalMode = mode;
    showAuthModal = true;
  }
  
  function closeAuthModal() {
    showAuthModal = false;
  }



  async function toggleLocationSubscription(forwarderId: string, locationName: string, country: string, city?: string) {
    if (!isAnnualSubscriber || !$auth?.token) {
      alert('This feature is only available for annual subscribers.');
      return;
    }

    try {
      isTogglingNotification = true;
      
      // Check if already subscribed to this location
      console.log('Fetching review subscriptions...');
      const result = await apiClient.getReviewSubscriptions($auth.token);
      console.log('API response:', result);
      
      // Handle both response formats: direct array or object with subscriptions property
      let subscriptions = [];
      if (Array.isArray(result)) {
        subscriptions = result;
      } else if (result && result.subscriptions && Array.isArray(result.subscriptions)) {
        subscriptions = result.subscriptions;
      } else {
        console.error('Invalid API response format:', result);
        throw new Error('Invalid response from server');
      }
      
      const subscription = subscriptions.find(sub => 
        sub.freight_forwarder_id === forwarderId && 
        sub.location_country === country && 
        sub.location_city === city
      );
      
      if (subscription) {
        // Unsubscribe
        console.log('Unsubscribing from location:', locationName, country, city);
        await apiClient.deleteReviewSubscription($auth.token, subscription.id);
        console.log('Successfully unsubscribed from location notifications');
      } else {
        // Subscribe
        console.log('Subscribing to location:', locationName, country, city);
        const subscriptionData = {
          freight_forwarder_id: forwarderId,
          location_country: country,
          location_city: city,
          notification_frequency: 'immediate' as 'immediate' | 'daily' | 'weekly'
        };
        await apiClient.createReviewSubscription($auth.token, subscriptionData);
        console.log('Successfully subscribed to location notifications');
      }
      
      // Reload subscription list after changes
      await loadUserSubscriptions();
    } catch (err: any) {
      console.error('Failed to toggle location notification subscription:', err);
      alert('Failed to update notification settings. Please try again.');
    } finally {
      isTogglingNotification = false;
    }
  }

  async function toggleCountrySubscription(forwarderId: string, country: string) {
    if (!isAnnualSubscriber || !$auth?.token) {
      alert('This feature is only available for annual subscribers.');
      return;
    }

    try {
      isTogglingNotification = true;
      
      // Check if already subscribed to this country
      console.log('Fetching review subscriptions...');
      const result = await apiClient.getReviewSubscriptions($auth.token);
      console.log('API response:', result);
      
      // Handle both response formats: direct array or object with subscriptions property
      let subscriptions = [];
      if (Array.isArray(result)) {
        subscriptions = result;
      } else if (result && result.subscriptions && Array.isArray(result.subscriptions)) {
        subscriptions = result.subscriptions;
      } else {
        console.error('Invalid API response format:', result);
        throw new Error('Invalid response from server');
      }
      
      const subscription = subscriptions.find(sub => 
        sub.freight_forwarder_id === forwarderId && 
        sub.location_country === country && 
        !sub.location_city
      );
      
      if (subscription) {
        // Unsubscribe
        console.log('Unsubscribing from country:', country);
        await apiClient.deleteReviewSubscription($auth.token, subscription.id);
        console.log('Successfully unsubscribed from country notifications');
      } else {
        // Subscribe
        console.log('Subscribing to country:', country);
        const subscriptionData = {
          freight_forwarder_id: forwarderId,
          location_country: country,
          notification_frequency: 'immediate' as 'immediate' | 'daily' | 'weekly'
        };
        await apiClient.createReviewSubscription($auth.token, subscriptionData);
        console.log('Successfully subscribed to country notifications');
      }
      
      // Reload subscription list after changes
      await loadUserSubscriptions();
    } catch (err: any) {
      console.error('Failed to toggle country notification subscription:', err);
      alert('Failed to update notification settings. Please try again.');
    } finally {
      isTogglingNotification = false;
    }
  }

  async function loadUserSubscriptions() {
    if (!isAnnualSubscriber || !$auth?.token) return;
    
    try {
      console.log('Loading all user subscriptions...');
      const result = await apiClient.getReviewSubscriptions($auth.token);
      console.log('All subscriptions API response:', result);
      
      // Handle both response formats: direct array or object with subscriptions property
      let subscriptions = [];
      if (Array.isArray(result)) {
        subscriptions = result;
      } else if (result && result.subscriptions && Array.isArray(result.subscriptions)) {
        subscriptions = result.subscriptions;
      } else {
        console.error('Invalid API response format for loading subscriptions:', result);
        userSubscriptions = [];
        return;
      }
      
      userSubscriptions = subscriptions;
      console.log('Loaded user subscriptions:', userSubscriptions);
    } catch (err: any) {
      console.error('Failed to load user subscriptions:', err);
      userSubscriptions = [];
    }
  }

  function isSubscribedToLocation(forwarderId: string, country: string, city?: string): boolean {
    return userSubscriptions.some(sub => 
      sub.freight_forwarder_id === forwarderId && 
      sub.location_country === country && 
      sub.location_city === city
    );
  }

  function isSubscribedToCountry(forwarderId: string, country: string): boolean {
    return userSubscriptions.some(sub => 
      sub.freight_forwarder_id === forwarderId && 
      sub.location_country === country && 
      !sub.location_city
    );
  }

  async function checkCompanyNotificationSubscription() {
    if (!isAnnualSubscriber || !$auth?.token || !freightForwarderId) return;
    
    try {
      console.log('Checking company notification subscription...');
      const result = await apiClient.getReviewSubscriptions($auth.token);
      console.log('API response for company check:', result);
      
      // Handle both response formats: direct array or object with subscriptions property
      let subscriptions = [];
      if (Array.isArray(result)) {
        subscriptions = result;
      } else if (result && result.subscriptions && Array.isArray(result.subscriptions)) {
        subscriptions = result.subscriptions;
      } else {
        console.error('Invalid API response format for company check:', result);
        isSubscribedToCompanyNotifications = false;
        return;
      }
      
      const subscription = subscriptions.find(sub => 
        sub.freight_forwarder_id === freightForwarderId && 
        !sub.location_country && 
        !sub.location_city
      );
      isSubscribedToCompanyNotifications = !!subscription;
    } catch (err: any) {
      console.error('Failed to check company notification subscription:', err);
      isSubscribedToCompanyNotifications = false;
    }
  }

  async function toggleCompanySubscription(forwarderId: string) {
    if (!isAnnualSubscriber || !$auth?.token) {
      alert('This feature is only available for annual subscribers.');
      return;
    }

    try {
      isTogglingNotification = true;
      
      // Check if already subscribed to this company (no location/country specified)
      console.log('Fetching review subscriptions for company...');
      const result = await apiClient.getReviewSubscriptions($auth.token);
      console.log('API response for company toggle:', result);
      
      // Handle both response formats: direct array or object with subscriptions property
      let subscriptions = [];
      if (Array.isArray(result)) {
        subscriptions = result;
      } else if (result && result.subscriptions && Array.isArray(result.subscriptions)) {
        subscriptions = result.subscriptions;
      } else {
        console.error('Invalid API response format for company toggle:', result);
        throw new Error('Invalid response from server');
      }
      
      const subscription = subscriptions.find(sub => 
        sub.freight_forwarder_id === forwarderId && 
        !sub.location_country && 
        !sub.location_city
      );
      
      if (subscription) {
        // Unsubscribe
        console.log('Unsubscribing from company:', forwarderId);
        await apiClient.deleteReviewSubscription($auth.token, subscription.id);
        isSubscribedToCompanyNotifications = false;
        console.log('Successfully unsubscribed from company notifications');
      } else {
        // Subscribe
        console.log('Subscribing to company:', forwarderId);
        const subscriptionData = {
          freight_forwarder_id: forwarderId,
          notification_frequency: 'immediate' as 'immediate' | 'daily' | 'weekly'
        };
        await apiClient.createReviewSubscription($auth.token, subscriptionData);
        isSubscribedToCompanyNotifications = true;
        console.log('Successfully subscribed to company notifications');
      }
      
      // Reload subscription list after changes
      await loadUserSubscriptions();
    } catch (err: any) {
      console.error('Failed to toggle company notification subscription:', err);
      alert('Failed to update notification settings. Please try again.');
    } finally {
      isTogglingNotification = false;
    }
  }

  async function deleteSubscription(subscriptionId: string) {
    if (!isAnnualSubscriber || !$auth?.token) {
      alert('This feature is only available for annual subscribers.');
      return;
    }

    if (!confirm('Are you sure you want to delete this subscription?')) {
      return;
    }

    try {
      console.log('Deleting subscription:', subscriptionId);
      await apiClient.deleteReviewSubscription($auth.token, subscriptionId);
      console.log('Successfully deleted subscription');
      
      // Reload subscription list after deletion
      await loadUserSubscriptions();
      
      // Also check company subscription status if this was a company subscription
      if (freightForwarderId) {
        await checkCompanyNotificationSubscription();
      }
    } catch (err: any) {
      console.error('Failed to delete subscription:', err);
      alert('Failed to delete subscription. Please try again.');
    }
  }

  // Function to format category names from snake_case to Title Case
  function formatCategoryName(categoryName: string): string {
    if (!categoryName) return '';
    
    return categoryName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  
  onMount(async () => {
    if (!freightForwarderId) {
      error = 'Invalid freight forwarder ID';
      isLoading = false;
      return;
    }
    
    try {
      isLoading = true;
      // Fetch freight forwarder details with timeout
      // Note: Data is fetched fresh each time to ensure up-to-date ratings
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const details = await Promise.race([
        apiClient.getFreightForwarder(freightForwarderId),
        timeoutPromise
      ]);
      freightForwarder = details;
      
      // Convert category_scores_summary to category_scores format for compatibility
      if ((freightForwarder as any).category_scores_summary) {
        freightForwarder.category_scores = Object.entries((freightForwarder as any).category_scores_summary).map(([categoryId, categoryData]: [string, any]) => {
          const score = parseFloat(categoryData.average_rating) || 0;
          const count = parseInt(categoryData.total_reviews) || 0;
          return {
            category_name: categoryId,
            average_score: score,
            review_count: count
          };
        });
      } else {
        freightForwarder.category_scores = [];
      }
      
      // If user is subscribed, fetch location and country scores
      if (isSubscribed && $auth?.token) {
        await loadDetailedScores();
      }
      
      // Check if user is subscribed to company notifications and load all subscriptions
      if (isAnnualSubscriber && $auth?.token) {
        await checkCompanyNotificationSubscription();
        await loadUserSubscriptions();
      }

    } catch (err: any) {
      console.error('Error loading freight forwarder:', err);
      error = err.message || 'Failed to load freight forwarder details';
      
      // Add more specific error handling
      if (err.status === 404) {
        error = 'Freight forwarder not found';
      } else if (err.status === 500) {
        error = 'Server error - please try again later';
      } else if (err.message?.includes('fetch')) {
        error = 'Network error - please check your connection';
      }
    } finally {
      isLoading = false;
    }
  });
  
  async function loadDetailedScores() {
    // Prevent multiple simultaneous calls
    if (isLoadingScores) {
      return;
    }
    
    if (!freightForwarderId || !$auth?.token) {
      return;
    }
    
    try {
      isLoadingScores = true;
      
      const locationPromise = apiClient.getFreightForwarderLocationScores(freightForwarderId, $auth.token);
      const countryPromise = apiClient.getFreightForwarderCountryScores(freightForwarderId, $auth.token);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('API request timeout after 15 seconds')), 15000)
      );
      
      const [locationData, countryData] = await Promise.race([
        Promise.all([locationPromise, countryPromise]),
        timeoutPromise
      ]);
      
      locationScores = locationData || [];
      countryScores = countryData || [];
    } catch (err: any) {
      console.error('Failed to load detailed scores:', err);
    } finally {
      isLoadingScores = false;
    }
  }
  
  function switchTab(tab: 'overview' | 'locations' | 'countries') {
    // Only allow tab switching for subscribed users
    if (!isSubscribed || !user || !user.subscription_tier || user.subscription_tier === 'Basic' || user.subscription_tier === 'free') {
      return;
    }
    
    activeTab = tab;
    
    // Always load scores when switching to locations or countries tabs for subscribed users
    if ((tab === 'locations' || tab === 'countries') && isSubscribed && $auth?.token) {
      loadDetailedScores();
    }
  }
</script>

<svelte:head>
  <title>{freightForwarder ? freightForwarder.name : 'Freight Forwarder'} - LogiScore</title>
  <meta name="description" content="Detailed information and reviews for {freightForwarder ? freightForwarder.name : 'this freight forwarder'}" />
</svelte:head>

<main>
  <div class="container">
    {#if isLoading}
      <div class="loading">Loading freight forwarder details...</div>
    {:else if error}
      <div class="error">
        <h2>Unable to Load Freight Forwarder</h2>
        <p>{error}</p>
        <div class="error-actions">
          <button class="btn btn-primary" on:click={() => window.location.reload()}>
            Try Again
          </button>
          <a href="/search" class="btn btn-outline">Back to Search</a>
        </div>
      </div>
    {:else if freightForwarder}
      <!-- Header Section -->
      <section class="company-header">
        <div class="company-logo">
          {#if freightForwarder.logo_url}
            <img src={freightForwarder.logo_url} alt="{freightForwarder.name} logo" />
          {:else}
            <div class="logo-placeholder">{freightForwarder.name.charAt(0)}</div>
          {/if}
        </div>
        <div class="company-info">
          <!-- Stars only display next to logo -->
          {#if freightForwarder.average_rating && freightForwarder.average_rating > 0}
            <div class="stars-only">
              <div class="stars">{'★'.repeat(Math.round(freightForwarder.average_rating))}</div>
            </div>
          {:else if freightForwarder.rating && freightForwarder.rating > 0}
            <div class="stars-only">
              <div class="stars">{'★'.repeat(Math.round(freightForwarder.rating))}</div>
            </div>
          {:else if freightForwarder.weighted_review_count && freightForwarder.weighted_review_count > 0 && freightForwarder.weighted_review_count <= 5}
            <div class="stars-only">
              <div class="stars">{'★'.repeat(freightForwarder.weighted_review_count)}</div>
            </div>
          {:else if freightForwarder.review_count && freightForwarder.review_count > 0}
            <div class="stars-only">
              <div class="rating-note">Rating being calculated</div>
            </div>
          {:else}
            <div class="stars-only">
              <div class="no-reviews">No reviews yet</div>
            </div>
          {/if}
        </div>
      </section>





      <!-- Company Details Section -->
      <section class="company-details">
        <h2>Company Information</h2>
        <div class="details-grid">
          <div class="detail-item">
            <h3>Company Name</h3>
            <p>{freightForwarder.name}</p>
          </div>
          {#if freightForwarder.website}
            <div class="detail-item">
              <h3>Website</h3>
              <p>
                <a href={freightForwarder.website} target="_blank" rel="noopener noreferrer" class="website-link">
                  {freightForwarder.website}
                </a>
              </p>
            </div>
          {/if}
          {#if freightForwarder.description}
            <div class="detail-item full-width">
              <h3>Company Description</h3>
              <p class="description-text">{freightForwarder.description}</p>
            </div>
          {/if}
          

          {#if freightForwarder.headquarters_country}
            <div class="detail-item">
              <h3>Headquarters</h3>
              <p>📍 {freightForwarder.headquarters_country}</p>
            </div>
          {/if}
          {#if freightForwarder.global_rank}
            <div class="detail-item">
              <h3>Global Rank</h3>
              <p>🏆 #{freightForwarder.global_rank}</p>
            </div>
          {/if}
        </div>
      </section>



      <!-- Tabbed Navigation for Detailed Scores -->
      {#if isSubscribed && user && user.subscription_tier && user.subscription_tier !== 'Basic' && user.subscription_tier !== 'free'}
        <section class="scores-tabs">

          <div class="tab-navigation">
            <button 
              class="tab-button {activeTab === 'overview' ? 'active' : ''}" 
              on:click={() => switchTab('overview')}
            >
              Company Categories
            </button>
            <button 
              class="tab-button {activeTab === 'countries' ? 'active' : ''}" 
              on:click={() => switchTab('countries')}
            >
              Country Scores
            </button>
            <button 
              class="tab-button {activeTab === 'locations' ? 'active' : ''}" 
              on:click={() => switchTab('locations')}
            >
              Location Scores
            </button>
          </div>

          <!-- Tab Content -->
          <div class="tab-content">
            {#if activeTab === 'overview'}
              <!-- Overview Tab - Show aggregate scores -->
              <section class="review-scores">
                <h2>Review Category Scores</h2>

                {#if freightForwarder.category_scores && freightForwarder.category_scores.length > 0}
                  <div class="scores-grid">
                    {#each freightForwarder.category_scores as score}
                      <div class="score-item">
                        <h3>{formatCategoryName(score.category_name)}</h3>
                        <div class="score-display">
                          <span class="score-value">{score.average_score.toFixed(1)}</span>
                          <span class="score-max">/ 5.0</span>
                        </div>
                        <div class="score-bar">
                          <div class="score-fill" style="width: {(score.average_score / 5) * 100}%"></div>
                        </div>
                        <p class="score-count">{score.review_count} reviews</p>
                      </div>
                    {/each}
                  </div>
                {:else}
                  <p class="no-scores">No category scores available yet.</p>
                {/if}
              </section>
            {:else if activeTab === 'locations'}
              <!-- Locations Tab -->
              <section class="location-scores">
                <h2>Location-Based Scores</h2>
                {#if isLoadingScores}
                  <div class="loading-scores">Loading location scores...</div>
                {:else if locationScores && locationScores.length > 0}
                  <div class="location-scores-grid">
                    {#each locationScores.sort((a, b) => a.location_name.localeCompare(b.location_name)) as location}
                      <div class="location-score-card">
                        <div class="location-header">
                          <h3>{location.location_name}</h3>
                          <div class="location-info">
                            <span class="country">📍 {location.country}</span>
                            {#if location.city}
                              <span class="city">🏙️ {location.city}</span>
                            {/if}
                          </div>
                        </div>
                        <div class="location-score">
                          <div class="score-circle small">
                            <span class="score-number">{location.aggregate_score.toFixed(1)}</span>
                            <span class="score-max">/5.0</span>
                          </div>
                          <div class="score-details">

                          </div>
                        </div>
                        {#if location.category_scores && location.category_scores.length > 0}
                          <div class="category-breakdown">
                            <h4>Category Breakdown</h4>
                            <div class="category-scores">
                              {#each location.category_scores as category}
                                <div class="category-score">
                                  <span class="category-name">{formatCategoryName(category.category_name)}</span>
                                  <span class="category-value">{category.average_score.toFixed(1)}</span>
                                </div>
                              {/each}
                            </div>
                          </div>
                        {/if}
                        
                        <!-- Location Notification Button -->
                        {#if isAnnualSubscriber}
                          <div class="location-notification-section">
                            <button 
                              class="btn btn-outline btn-small location-notification-btn" 
                              class:btn-active={isSubscribedToLocation(freightForwarder.id, location.country, location.city)}
                              on:click={() => toggleLocationSubscription(freightForwarder.id, location.location_name, location.country, location.city)}
                              disabled={isTogglingNotification}
                            >
                              {#if isTogglingNotification}
                                <span class="spinner"></span>
                                {isSubscribedToLocation(freightForwarder.id, location.country, location.city) ? 'Unsubscribing...' : 'Subscribing...'}
                              {:else if isSubscribedToLocation(freightForwarder.id, location.country, location.city)}
                                🔔 Stop Notifications
                              {:else}
                                🔔 Receive Notifications
                              {/if}
                            </button>
                          </div>
                        {/if}
                      </div>
                    {/each}
                  </div>
                {:else}
                  <p class="no-scores">No location scores available yet.</p>
                {/if}
              </section>
            {:else if activeTab === 'countries'}
              <!-- Countries Tab -->
              <section class="country-scores">
                <h2>Country-Based Scores</h2>
                {#if isLoadingScores}
                  <div class="loading-scores">Loading country scores...</div>
                {:else if countryScores.length > 0}
                  <div class="country-scores-grid">
                    {#each countryScores.sort((a, b) => a.country.localeCompare(b.country)) as country}
                      <div class="country-score-card">
                        <div class="country-header">
                          <h3>🇺🇳 {country.country}</h3>
                          <div class="country-stats">
                            <span class="location-count">📍 {country.location_count} locations</span>

                          </div>
                        </div>
                        <div class="country-score">
                          <div class="score-circle small">
                            <span class="score-number">{country.aggregate_score.toFixed(1)}</span>
                            <span class="score-max">/5.0</span>
                          </div>
                        </div>
                        {#if country.category_scores && country.category_scores.length > 0}
                          <div class="category-breakdown">
                            <h4>Category Breakdown</h4>
                            <div class="category-scores">
                              {#each country.category_scores as category}
                                <div class="category-score">
                                  <span class="category-name">{formatCategoryName(category.category_name)}</span>
                                  <span class="category-value">{category.average_score.toFixed(1)}</span>
                                </div>
                              {/each}
                            </div>
                          </div>
                        {/if}
                        
                        <!-- Country Notification Button -->
                        {#if isAnnualSubscriber}
                          <div class="country-notification-section">
                            <button 
                              class="btn btn-outline btn-small country-notification-btn" 
                              class:btn-active={isSubscribedToCountry(freightForwarder.id, country.country)}
                              on:click={() => toggleCountrySubscription(freightForwarder.id, country.country)}
                              disabled={isTogglingNotification}
                            >
                              {#if isTogglingNotification}
                                <span class="spinner"></span>
                                {isSubscribedToCountry(freightForwarder.id, country.country) ? 'Unsubscribing...' : 'Subscribing...'}
                              {:else if isSubscribedToCountry(freightForwarder.id, country.country)}
                                🔔 Stop Notifications
                              {:else}
                                🔔 Receive Notifications
                              {/if}
                            </button>
                          </div>
                        {/if}
                      </div>
                    {/each}
                  </div>
                {:else}
                  <p class="no-scores">No country scores available yet.</p>
                {/if}
              </section>
            {/if}
          </div>
        </section>
      {:else}
        <!-- For non-subscribed or non-logged-in users, show subscription prompt -->
        <div class="subscription-prompt">
          <h3>🔒 Unlock Detailed Analytics</h3>
          <p>With a subscription view category scores, location and country-specific scores, advanced analytics, and more detailed insights.</p>
          {#if isLoggedIn}
            <!-- Pricing plans button removed -->
          {:else}
            <div class="auth-actions">
              <button class="btn btn-primary" on:click={() => openAuthModal('signin')}>Sign In</button>
              <button class="btn btn-outline" on:click={() => openAuthModal('signup')}>Sign Up</button>
            </div>
          {/if}
        </div>
      {/if}

      <!-- Detailed Rating Information (for subscribed users) -->
      {#if isSubscribed && user && user.subscription_tier && user.subscription_tier !== 'Basic' && user.subscription_tier !== 'free'}
        <section class="detailed-rating">
          <h2>Detailed Rating Information</h2>
          {#if freightForwarder.average_rating && freightForwarder.average_rating > 0}
            <div class="rating-details">
              <div class="rating-summary">
                <div class="score-circle">
                  <span class="score-number">{freightForwarder.average_rating.toFixed(1)}</span>
                  <span class="score-max">/5.0</span>
                </div>
                <div class="rating-info">
                  <div class="stars">{'★'.repeat(Math.round(freightForwarder.average_rating))}</div>
                  {#if freightForwarder.global_rank}
                    <div class="global-rank">Global Rank: #{freightForwarder.global_rank}</div>
                  {/if}
                  {#if freightForwarder.review_count}
                    <div class="review-count">Based on {freightForwarder.review_count} reviews</div>
                  {/if}
                </div>
              </div>
            </div>
          {:else if freightForwarder.rating && freightForwarder.rating > 0}
            <div class="rating-details">
              <div class="rating-summary">
                <div class="score-circle">
                  <span class="score-number">{freightForwarder.rating.toFixed(1)}</span>
                  <span class="score-max">/5.0</span>
                </div>
                <div class="rating-info">
                  <div class="stars">{'★'.repeat(Math.round(freightForwarder.rating))}</div>
                  {#if freightForwarder.global_rank}
                    <div class="global-rank">Global Rank: #{freightForwarder.global_rank}</div>
                  {/if}
                  {#if freightForwarder.review_count}
                    <div class="review-count">Based on {freightForwarder.review_count} reviews</div>
                  {/if}
                </div>
              </div>
            </div>
          {:else}
            <p class="no-rating">No detailed rating information available.</p>
          {/if}
        </section>
      {/if}

      <!-- Company Notification and Submit Review Buttons - Only show for logged-in and subscribed users -->
      {#if isLoggedIn && isSubscribed}
        <div class="review-section">
          <!-- Company-wide Notification Button - Only for annual subscribers -->
          {#if isAnnualSubscriber}
            <div class="notification-section">
              <button 
                class="btn btn-outline notification-btn" 
                class:btn-loading={isTogglingNotification}
                on:click={() => toggleCompanySubscription(freightForwarder.id)}
                disabled={isTogglingNotification}
              >
                {#if isTogglingNotification}
                  <span class="spinner"></span>
                  {isSubscribedToCompanyNotifications ? 'Unsubscribing...' : 'Subscribing...'}
                {:else if isSubscribedToCompanyNotifications}
                  🔔 Stop Company Notifications
                {:else}
                  🔔 Receive Company Notifications
                {/if}
              </button>
              <p class="notification-help">
                {isSubscribedToCompanyNotifications 
                  ? 'You will receive notifications when new reviews are posted for this company.'
                  : 'Get notified when new reviews are posted for this company.'
                }
              </p>
              
              <!-- Subscription List Toggle -->
              <button 
                class="btn btn-outline btn-small subscription-list-toggle" 
                on:click={() => showSubscriptionList = !showSubscriptionList}
              >
                {showSubscriptionList ? '📋 Hide My Subscriptions' : '📋 View My Subscriptions'}
              </button>
            </div>
          {:else if hasExpiredSubscription}
            <!-- Show subscription list button for expired users -->
            <div class="notification-section">
              <button 
                class="btn btn-outline btn-small subscription-list-toggle" 
                on:click={() => showSubscriptionList = !showSubscriptionList}
              >
                {showSubscriptionList ? '📋 Hide My Subscriptions' : '📋 View My Subscriptions'}
              </button>
            </div>
          {/if}
          
          <!-- Submit Review Button -->
          <a href="/reviews?company={freightForwarder.id}" class="btn btn-primary">Submit Review</a>
        </div>
        
        <!-- Subscription List Display -->
        {#if isAnnualSubscriber && showSubscriptionList}
          <div class="subscription-list-section">
            <h3>Your Notification Subscriptions</h3>
            {#if userSubscriptions && userSubscriptions.length > 0}
              <div class="subscriptions-list">
                {#each userSubscriptions as subscription}
                  <div class="subscription-item">
                    <div class="subscription-header">
                      <h4>
                        {#if subscription.freight_forwarder_name}
                          {subscription.freight_forwarder_name}
                        {:else}
                          Company ID: {subscription.freight_forwarder_id}
                        {/if}
                      </h4>
                      <div class="subscription-actions">
                        <span class="subscription-status" class:active={subscription.is_active}>
                          {subscription.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <button 
                          class="btn btn-outline btn-small btn-danger" 
                          on:click={() => deleteSubscription(subscription.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div class="subscription-details">
                      {#if subscription.location_country}
                        <span class="badge">📍 {subscription.location_country}</span>
                      {/if}
                      {#if subscription.location_city}
                        <span class="badge">🏙️ {subscription.location_city}</span>
                      {/if}
                      {#if !subscription.location_country && !subscription.location_city}
                        <span class="badge">🌍 Company-wide</span>
                      {/if}
                      <span class="badge">Frequency: {subscription.notification_frequency}</span>
                      <span class="badge">Created: {new Date(subscription.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                {/each}
              </div>
            {:else}
              <div class="no-subscriptions">
                <p>You don't have any notification subscriptions yet.</p>
                <p>Subscribe to companies, locations, or countries to get notified of new reviews.</p>
              </div>
            {/if}
          </div>
        {:else if hasExpiredSubscription && showSubscriptionList}
          <div class="subscription-list-section">
            <h3>Your Notification Subscriptions</h3>
            <div class="subscription-expired-notice">
              <div class="expired-icon">⚠️</div>
              <h4>Subscription Expired</h4>
              <p>Your annual subscription has expired. Notification subscriptions are no longer available.</p>
              <p>To continue receiving notifications, please renew your annual subscription.</p>
              <a href="/pricing" class="btn btn-primary">Renew Subscription</a>
            </div>
          </div>
        {/if}
      {:else if isLoggedIn}
        <div class="review-section">
          <div class="review-prompt">
            <p>🔒 Subscribe to submit reviews and help the community</p>
            <a href="/pricing" class="btn btn-outline">View Pricing Plans</a>
          </div>
        </div>

      {/if}
    {:else}
      <div class="not-found">Freight forwarder not found.</div>
    {/if}
  </div>
  
  <!-- Auth Modal -->
  {#if showAuthModal}
    <AuthModal
      isOpen={showAuthModal}
      mode={authModalMode}
      on:close={closeAuthModal}
    />
  {/if}
</main>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .loading, .error, .not-found {
    text-align: center;
    padding: 4rem 2rem;
    font-size: 1.2rem;
  }

  .error {
    color: #dc3545;
    text-align: center;
    padding: 2rem;
  }

  .error h2 {
    margin-bottom: 1rem;
    color: #dc3545;
  }

  .error p {
    margin-bottom: 2rem;
    font-size: 1.1rem;
  }

  .error-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .not-found {
    color: #666;
  }

  /* Company Header */
  .company-header {
    display: flex;
    align-items: center;
    gap: 3rem;
    padding: 3rem 0;
    border-bottom: 2px solid #e0e0e0;
    margin-bottom: 3rem;
  }

  .company-name {
    font-size: 2.5rem;
    margin-bottom: 1.5rem;
    color: #333;
  }

  .aggregate-score {
    display: flex;
    align-items: center;
    gap: 2rem;
  }

  .score-circle {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  }

  .score-circle.small {
    width: 80px;
    height: 80px;
  }

  .score-circle.no-rating {
    background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
    opacity: 0.8;
  }

  .score-circle.no-rating .score-number {
    font-size: 1.5rem;
  }

  .score-circle.no-rating .score-max {
    font-size: 0.8rem;
    opacity: 0.9;
  }

  .stars-only {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .stars-only .stars {
    font-size: 2rem;
    color: #ffc107;
  }

  .no-rating-note {
    font-size: 0.9rem;
    color: #666;
    font-style: italic;
  }

  .rating-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .rating-indicator {
    font-size: 1.2rem;
    animation: pulse 2s infinite;
  }

  .rating-text {
    font-size: 0.9rem;
    color: #666;
    font-style: italic;
  }

  .rating-info {
    font-size: 0.8rem;
    color: #888;
    font-style: italic;
    margin-top: 0.25rem;
  }

  .rating-note {
    font-size: 0.9rem;
    color: #666;
    font-style: italic;
    margin-top: 0.5rem;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .no-reviews {
    font-size: 0.9rem;
    color: #666;
    font-style: italic;
  }

  .score-number {
    font-size: 2rem;
    font-weight: bold;
    line-height: 1;
  }

  .score-circle.small .score-number {
    font-size: 1.5rem;
  }

  .score-max {
    font-size: 0.9rem;
    opacity: 0.9;
  }

  .score-circle.small .score-max {
    font-size: 0.8rem;
  }

  .score-details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .stars {
    color: #ffc107;
    font-size: 1.2rem;
  }

  .stars.calculating {
    color: #ccc;
    opacity: 0.6;
    animation: calculating-pulse 2s infinite;
  }

  @keyframes calculating-pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 0.3; }
  }

  .global-rank {
    color: #667eea;
    font-weight: 600;
    font-size: 0.9rem;
  }

  .company-logo {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .company-logo img {
    width: 360px;
    height: 180px;
    border-radius: 16px;
    object-fit: contain;
    padding: 10px;
  }

  .logo-placeholder {
    width: 360px;
    height: 180px;
    background: #667eea;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 4rem;
    font-weight: bold;
    border-radius: 16px;
  }

  .company-info {
    flex: 1;
  }

  .rating {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .stars {
    color: #ffc107;
    font-size: 1.2rem;
  }

  .rating-text {
    font-size: 1.1rem;
    font-weight: bold;
    color: #333;
  }

  .review-count {
    color: #666;
    font-size: 0.9rem;
  }

  /* Company Details */
  .company-details {
    margin-bottom: 3rem;
  }

  .company-details h2 {
    font-size: 2rem;
    margin-bottom: 2rem;
    color: #333;
  }

  .details-grid {
    display: grid;
    gap: 2rem;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }

  .detail-item.full-width {
    grid-column: 1 / -1;
  }

  .detail-item h3 {
    font-size: 1.3rem;
    margin-bottom: 0.5rem;
    color: #333;
  }

  .detail-item p {
    color: #666;
    line-height: 1.6;
    margin: 0;
  }

  .description-text {
    white-space: pre-line;
    color: #666;
    line-height: 1.6;
    margin: 0;
  }

  /* Review Scores */
  .review-scores {
    margin-bottom: 3rem;
  }

  .review-scores h2 {
    font-size: 2rem;
    margin-bottom: 2rem;
    color: #333;
  }

  .scores-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
  }

  .score-item {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 8px;
    text-align: center;
  }

  .score-item h3 {
    font-size: 1.2rem;
    margin-bottom: 1rem;
    color: #333;
  }

  .score-display {
    margin-bottom: 1rem;
  }

  .score-value {
    font-size: 2rem;
    font-weight: bold;
    color: #667eea;
  }

  .score-max {
    font-size: 1rem;
    color: #666;
  }

  .score-bar {
    width: 100%;
    height: 8px;
    background: #e0e0e0;
    border-radius: 4px;
    margin-bottom: 0.5rem;
    overflow: hidden;
  }

  .score-fill {
    height: 100%;
    background: #667eea;
    transition: width 0.3s ease;
  }

  .score-count {
    color: #666;
    font-size: 0.9rem;
    margin: 0;
  }

  .no-scores {
    text-align: center;
    color: #666;
    font-style: italic;
    padding: 2rem;
  }

  /* Review Section */
  .review-section {
    text-align: center;
    padding: 2rem 0;
  }

  .review-prompt {
    background: #f8f9fa;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 1.5rem;
    margin: 0 auto;
    max-width: 500px;
  }

  .review-prompt p {
    margin-bottom: 1rem;
    color: #666;
    font-size: 1rem;
  }

  .review-prompt .auth-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .btn {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 600;
    font-size: 1rem;
    transition: all 0.3s ease;
    border: 2px solid;
  }

  .btn-primary {
    color: white;
    border-color: #667eea;
    background: #667eea;
  }

  .btn-primary:hover {
    background: #5a6268;
    border-color: #5a6268;
  }

  .btn-outline {
    color: #667eea;
    border-color: #667eea;
    background: transparent;
  }

  .btn-outline:hover {
    background: #667eea;
    color: white;
  }

  .btn-small {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }

  .btn-active {
    background: #28a745;
    color: white;
    border-color: #28a745;
  }

  .btn-active:hover {
    background: #218838;
    border-color: #1e7e34;
  }

  /* Tabbed Navigation */
  .scores-tabs {
    margin-bottom: 3rem;
  }

  .tab-navigation {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
    border-bottom: 2px solid #e0e0e0;
  }

  .tab-button {
    padding: 0.75rem 1.5rem;
    border: none;
    background: transparent;
    color: #666;
    font-weight: 600;
    cursor: pointer;
    border-bottom: 3px solid transparent;
    transition: all 0.3s ease;
  }

  .tab-button:hover {
    color: #667eea;
  }

  .tab-button.active {
    color: #667eea;
    border-bottom-color: #667eea;
  }

  .tab-content {
    min-height: 400px;
  }

  /* Location and Country Score Cards */
  .location-scores-grid,
  .country-scores-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(175px, 1fr));
    gap: 2rem;
  }

  .location-score-card,
  .country-score-card {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 1.5rem;
    border: 1px solid #e0e0e0;
    transition: all 0.3s ease;
  }

  .location-score-card:hover,
  .country-score-card:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  .location-header,
  .country-header {
    margin-bottom: 1rem;
  }

  .location-header h3,
  .country-header h3 {
    font-size: 1.3rem;
    margin-bottom: 0.5rem;
    color: #333;
  }

  .location-info,
  .country-stats {
    display: flex;
    gap: 1rem;
    font-size: 0.9rem;
    color: #666;
  }

  .location-score,
  .country-score {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .category-breakdown {
    border-top: 1px solid #e0e0e0;
    padding-top: 1rem;
  }

  .category-breakdown h4 {
    font-size: 1rem;
    margin-bottom: 0.75rem;
    color: #333;
  }

  .category-scores {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .category-score {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    background: white;
    border-radius: 6px;
    font-size: 0.9rem;
  }

  .category-name {
    color: #666;
  }

  .category-value {
    font-weight: 600;
    color: #667eea;
  }

  .loading-scores {
    text-align: center;
    padding: 2rem;
    color: #666;
    font-style: italic;
  }

  .cta-section {
    text-align: center;
    margin-bottom: 1rem;
  }
  


  /* Subscription Prompt */
  .subscription-prompt {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 2rem;
    border-radius: 12px;
    text-align: center;
    margin-top: 2rem;
  }

  .subscription-prompt h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  .subscription-prompt p {
    margin-bottom: 1.5rem;
    opacity: 0.9;
    line-height: 1.6;
  }

  .auth-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .auth-actions .btn {
    min-width: 120px;
  }

  /* Detailed Rating Section */
  .detailed-rating {
    margin: 3rem 0;
    padding: 2rem;
    background: #f8f9fa;
    border-radius: 12px;
    border: 1px solid #e0e0e0;
  }

  .detailed-rating h2 {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    color: #333;
    text-align: center;
  }

  .rating-details {
    display: flex;
    justify-content: center;
  }

  .rating-summary {
    display: flex;
    align-items: center;
    gap: 2rem;
    text-align: center;
  }

  .rating-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .rating-info .stars {
    font-size: 1.5rem;
    color: #ffc107;
  }

  .rating-info .global-rank {
    color: #667eea;
    font-weight: 600;
    font-size: 1rem;
  }

  .rating-info .review-count {
    color: #666;
    font-size: 0.9rem;
  }

  .no-rating {
    text-align: center;
    color: #666;
    font-style: italic;
  }

  /* Quick Score Overview */
  .quick-score-overview {
    margin-bottom: 3rem;
    padding: 2rem;
    background: #f8f9fa;
    border-radius: 12px;
    border: 1px solid #e0e0e0;
  }

  .quick-score-overview h2 {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    color: #333;
    text-align: center;
  }

  .overview-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  }

  .overview-section {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
  }

  .overview-section h3 {
    font-size: 1.2rem;
    margin-bottom: 1rem;
    color: #333;
    text-align: center;
  }

  .scores-summary {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .score-summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: #f8f9fa;
    border-radius: 6px;
    font-size: 0.9rem;
  }

  .category-name,
  .country-name,
  .location-name {
    color: #333;
    font-weight: 500;
  }

  .score-value {
    font-weight: 600;
    color: #667eea;
  }

  .more-scores {
    text-align: center;
    color: #666;
    font-size: 0.8rem;
    font-style: italic;
    padding: 0.5rem;
    background: #e9ecef;
    border-radius: 4px;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .company-header {
      flex-direction: column;
      text-align: center;
      gap: 1rem;
    }

    .company-name {
      font-size: 2rem;
    }

    .aggregate-score {
      flex-direction: column;
      gap: 1rem;
    }

    .scores-grid {
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .location-scores-grid,
    .country-scores-grid {
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
    }

    .tab-navigation {
      flex-wrap: wrap;
    }

    .tab-button {
      flex: 1;
      min-width: 120px;
    }

    .container {
      padding: 1rem;
    }

    .overview-grid {
      grid-template-columns: 1fr;
    }

    .score-item {
      padding: 1rem;
    }

    .score-item h3 {
      font-size: 1.1rem;
    }

    .score-value {
      font-size: 1.5rem;
    }

    .location-score-card,
    .country-score-card {
      padding: 1.25rem;
    }
  }

  /* Subscription Checkbox Styles */
  .subscription-checkbox {
    margin-top: 12px;
  }

  .checkbox-label {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    cursor: pointer;
    padding: 8px 0;
  }

  .checkbox-label input[type="checkbox"] {
    margin: 0;
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  .checkbox-text {
    font-size: 0.95rem;
    color: #495057;
    line-height: 1.4;
  }

  .subscription-note {
    margin: 8px 0 0 30px;
    font-size: 0.85rem;
    color: #6c757d;
    font-style: italic;
  }

  @media (max-width: 480px) {
    .scores-grid {
      gap: 0.75rem;
    }

    .score-item {
      padding: 0.75rem;
    }

    .score-item h3 {
      font-size: 1rem;
      margin-bottom: 0.75rem;
    }

    .score-value {
      font-size: 1.25rem;
    }

    .score-count {
      font-size: 0.8rem;
    }

    .location-scores-grid,
    .country-scores-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .location-score-card,
    .country-score-card {
      padding: 1rem;
    }

    .category-breakdown {
      padding-top: 0.75rem;
    }

    .category-breakdown h4 {
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }

    .category-score {
      padding: 0.4rem;
      font-size: 0.8rem;
    }
  }

  @media (min-width: 1200px) {
    .scores-grid {
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2.5rem;
    }

    .location-scores-grid,
    .country-scores-grid {
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2.5rem;
    }

    .score-item {
      padding: 2rem;
    }

    .score-item h3 {
      font-size: 1.4rem;
    }

    .score-value {
      font-size: 2.5rem;
    }
  }

  /* Notification Button Styles */
  .notification-section {
    margin-bottom: 20px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
  }

  .notification-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    margin-left: auto;
    margin-right: auto;
  }

  .notification-btn.btn-loading {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .notification-help {
    margin: 0;
    font-size: 0.9rem;
    color: #6c757d;
    line-height: 1.4;
  }

  /* Location and Country Notification Button Styles */
  .location-notification-section,
  .country-notification-section {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e9ecef;
    text-align: center;
  }

  .location-notification-btn,
  .country-notification-btn {
    width: 100%;
    justify-content: center;
  }

  /* Company Notification Button Styles */
  .notification-section {
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .notification-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    margin-left: auto;
    margin-right: auto;
  }

  .notification-btn.btn-loading {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .notification-help {
    margin: 0;
    font-size: 0.9rem;
    color: #6c757d;
    line-height: 1.4;
  }

  /* Subscription List Styles */
  .subscription-list-toggle {
    margin-top: 0.5rem;
    font-size: 0.8rem;
  }

  .subscription-list-section {
    margin-top: 2rem;
    padding: 1.5rem;
    background: #f8f9fa;
    border-radius: 12px;
    border: 1px solid #e9ecef;
  }

  .subscription-list-section h3 {
    margin: 0 0 1rem 0;
    color: #333;
    font-size: 1.2rem;
  }

  .subscriptions-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .subscription-item {
    background: white;
    border-radius: 8px;
    padding: 1rem;
    border: 1px solid #e0e0e0;
    transition: all 0.3s ease;
  }

  .subscription-item:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .subscription-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .subscription-header h4 {
    margin: 0;
    color: #333;
    font-size: 1rem;
  }

  .subscription-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .subscription-status {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 500;
    background: #dc3545;
    color: white;
  }

  .subscription-status.active {
    background: #28a745;
  }

  .subscription-details {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .badge {
    padding: 0.25rem 0.5rem;
    background: #e9ecef;
    color: #495057;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 500;
  }

  .no-subscriptions {
    text-align: center;
    padding: 2rem;
    color: #6c757d;
  }

  .no-subscriptions p {
    margin: 0.5rem 0;
  }

  .btn-danger {
    background: #dc3545;
    color: white;
    border-color: #dc3545;
  }

  .btn-danger:hover {
    background: #c82333;
    border-color: #bd2130;
  }

  /* Subscription Expired Notice */
  .subscription-expired-notice {
    text-align: center;
    padding: 2rem;
    background: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 8px;
    color: #856404;
  }

  .expired-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .subscription-expired-notice h4 {
    margin: 0 0 1rem 0;
    color: #856404;
    font-size: 1.2rem;
  }

  .subscription-expired-notice p {
    margin: 0.5rem 0;
    line-height: 1.5;
  }

  .subscription-expired-notice .btn {
    margin-top: 1rem;
  }
</style>
