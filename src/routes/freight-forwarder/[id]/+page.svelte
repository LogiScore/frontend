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
  
  $: freightForwarderId = $page.params?.id;
  $: user = $auth?.user;
  $: isSubscribed = user && user.subscription_tier && user.subscription_tier !== 'Basic' && user.subscription_tier !== 'free';
  $: isLoggedIn = !!user;
  
  // Reactive statement to load detailed scores when auth state changes
  $: if (freightForwarder && isSubscribed && $auth?.token && !isLoadingScores && locationScores.length === 0) {
    console.log('🚀 Reactive trigger: Loading detailed scores...', {
      hasFreightForwarder: !!freightForwarder,
      isSubscribed,
      hasToken: !!$auth?.token,
      isLoadingScores,
      locationScoresLength: locationScores.length,
      timestamp: new Date().toISOString()
    });
    
    // Prevent multiple simultaneous calls
    if (!isLoadingScores) {
      loadDetailedScores();
    } else {
      console.log('⚠️ Skipping loadDetailedScores call - already loading');
    }
  }
  
  function openAuthModal(mode: 'signin' | 'signup') {
    authModalMode = mode;
    showAuthModal = true;
  }
  
  function closeAuthModal() {
    showAuthModal = false;
  }

  
  onMount(async () => {
    if (!freightForwarderId) {
      error = 'Invalid freight forwarder ID';
      isLoading = false;
      return;
    }
    
    try {
      isLoading = true;
      console.log('Fetching freight forwarder details for ID:', freightForwarderId);
      
      // Fetch freight forwarder details with timeout
      // Note: Data is fetched fresh each time to ensure up-to-date ratings
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const details = await Promise.race([
        apiClient.getFreightForwarder(freightForwarderId),
        timeoutPromise
      ]);
      console.log('Received freight forwarder details:', details);
      freightForwarder = details;
      
      // Convert category_scores_summary to category_scores format for compatibility
      if ((freightForwarder as any).category_scores_summary) {
        freightForwarder.category_scores = Object.entries((freightForwarder as any).category_scores_summary).map(([categoryId, categoryData]: [string, any]) => {
          const score = parseFloat(categoryData.average_rating) || 0;
          const count = parseInt(categoryData.total_reviews) || 0;
          console.log(`Category ${categoryId}: Raw score ${categoryData.average_rating}, Review count: ${count}`);
          return {
            category_name: categoryId,
            average_score: score,
            review_count: count
          };
        });
        console.log('Final category_scores for', freightForwarder.name, ':', freightForwarder.category_scores);
      } else {
        freightForwarder.category_scores = [];
      }
      
      // If user is subscribed, fetch location and country scores
      console.log('🔍 onMount: Checking if should load detailed scores:', {
        isSubscribed,
        hasToken: !!$auth?.token,
        user: $auth?.user
      });
      
      if (isSubscribed && $auth?.token) {
        console.log('✅ onMount: Loading detailed scores immediately');
        await loadDetailedScores();
      } else {
        console.log('⏳ onMount: Not loading detailed scores yet, waiting for auth state...');
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
    console.log('🔍 loadDetailedScores called with:', {
      freightForwarderId,
      hasToken: !!$auth?.token,
      token: $auth?.token ? `${$auth.token.substring(0, 20)}...` : 'none',
      isSubscribed,
      user: $auth?.user,
      callTime: new Date().toISOString(),
      isLoadingScores
    });
    
    // Prevent multiple simultaneous calls
    if (isLoadingScores) {
      console.log('⚠️ loadDetailedScores called while already loading, skipping...');
      return;
    }
    
    if (!freightForwarderId || !$auth?.token) {
      console.log('❌ Cannot load detailed scores: missing ID or token');
      return;
    }
    
    try {
      isLoadingScores = true;
      console.log('🔄 Loading detailed scores for freight forwarder:', freightForwarderId);
      
      console.log('📡 Making API calls...');
      const locationPromise = apiClient.getFreightForwarderLocationScores(freightForwarderId, $auth.token);
      const countryPromise = apiClient.getFreightForwarderCountryScores(freightForwarderId, $auth.token);
      
      console.log('⏳ Waiting for API responses...');
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('API request timeout after 15 seconds')), 15000)
      );
      
      const [locationData, countryData] = await Promise.race([
        Promise.all([locationPromise, countryPromise]),
        timeoutPromise
      ]);
      
      console.log('✅ Location scores received:', locationData);
      console.log('✅ Country scores received:', countryData);
      
      locationScores = locationData || [];
      countryScores = countryData || [];
      
      console.log('📊 Updated locationScores:', locationScores);
      console.log('📊 Updated countryScores:', countryScores);
    } catch (err: any) {
      console.error('❌ Failed to load detailed scores:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.status,
        response: err.response,
        stack: err.stack
      });
    } finally {
      isLoadingScores = false;
      console.log('🏁 loadDetailedScores completed, isLoadingScores set to false');
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
          <div class="debug-info">
            <p>Debug: User logged in = {isLoggedIn}</p>
            <p>Debug: User subscribed = {isSubscribed}</p>
            <p>Debug: User subscription tier = {user?.subscription_tier}</p>
            <p>Debug: Auth token exists = {!!$auth?.token}</p>
            <p>Debug: Active tab = {activeTab}</p>
          </div>
          <div class="tab-navigation">
            <button 
              class="tab-button {activeTab === 'overview' ? 'active' : ''}" 
              on:click={() => switchTab('overview')}
            >
              Overview
            </button>
            <button 
              class="tab-button {activeTab === 'locations' ? 'active' : ''}" 
              on:click={() => switchTab('locations')}
            >
              Location Scores
            </button>
            <button 
              class="tab-button {activeTab === 'countries' ? 'active' : ''}" 
              on:click={() => switchTab('countries')}
            >
              Country Scores
            </button>
          </div>

          <!-- Tab Content -->
          <div class="tab-content">
            {#if activeTab === 'overview'}
              <!-- Overview Tab - Show aggregate scores -->
              <section class="review-scores">
                <h2>Review Category Scores</h2>
                <div class="debug-info">
                  <p>Debug: freightForwarder.category_scores = {JSON.stringify(freightForwarder.category_scores, null, 2)}</p>
                </div>
                {#if freightForwarder.category_scores && freightForwarder.category_scores.length > 0}
                  <div class="scores-grid">
                    {#each freightForwarder.category_scores as score}
                      <div class="score-item">
                        <h3>{score.category_name}</h3>
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
                <div class="debug-info">
                  <p>Debug: isLoadingScores = {isLoadingScores}</p>
                  <p>Debug: locationScores.length = {locationScores.length}</p>
                  <p>Debug: locationScores data = {JSON.stringify(locationScores, null, 2)}</p>
                  <p>Debug: User logged in = {isLoggedIn}</p>
                  <p>Debug: User subscribed = {isSubscribed}</p>
                  <p>Debug: User subscription tier = {user?.subscription_tier || 'none'}</p>
                  <p>Debug: Auth token exists = {!!$auth?.token}</p>
                  <p>Debug: Active tab = {activeTab}</p>
                  <button class="btn btn-secondary" on:click={() => loadDetailedScores()}>
                    🔄 Reload Scores
                  </button>
                </div>
                {#if isLoadingScores}
                  <div class="loading-scores">Loading location scores...</div>
                {:else if locationScores && locationScores.length > 0}
                  <div class="location-scores-grid">
                    {#each locationScores as location}
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
                                  <span class="category-name">{category.category_name}</span>
                                  <span class="category-value">{category.average_score.toFixed(1)}</span>
                                </div>
                              {/each}
                            </div>
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
                    {#each countryScores as country}
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
                                  <span class="category-name">{category.category_name}</span>
                                  <span class="category-value">{category.average_score.toFixed(1)}</span>
                                </div>
                              {/each}
                            </div>
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

      <!-- Submit Review Button - Only show for logged-in and subscribed users -->
      {#if isLoggedIn && isSubscribed}
        <div class="review-section">
          <a href="/reviews?company={freightForwarder.id}" class="btn btn-primary">Submit Review</a>
        </div>
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
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
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

  .debug-info {
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
    font-family: monospace;
    font-size: 0.9rem;
    color: #495057;
  }

  .debug-info p {
    margin: 0.25rem 0;
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
      grid-template-columns: 1fr;
    }

    .location-scores-grid,
    .country-scores-grid {
      grid-template-columns: 1fr;
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
  }
</style>
