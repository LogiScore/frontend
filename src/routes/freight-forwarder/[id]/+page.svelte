<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { apiClient } from '$lib/api';
  import { auth } from '$lib/auth';
  
  let freightForwarder: any = null;
  let locationScores: any[] = [];
  let countryScores: any[] = [];
  let isLoading = true;
  let isLoadingScores = false;
  let error: string | null = null;
  let activeTab: 'overview' | 'locations' | 'countries' = 'overview';
  
  $: freightForwarderId = $page.params?.id;
  $: user = get(auth).user as any;
  $: isSubscribed = user && user.subscription_tier && user.subscription_tier !== 'Basic';
  $: isLoggedIn = !!user;
  
  // Helper function to get current store value
  function get<T>(store: any): T {
    let value: T;
    store.subscribe((v: T) => value = v)();
    return value!;
  }
  
  onMount(async () => {
    if (!freightForwarderId) {
      error = 'Invalid freight forwarder ID';
      isLoading = false;
      return;
    }
    
    try {
      isLoading = true;
      // Fetch freight forwarder details
      const details = await apiClient.getFreightForwarder(freightForwarderId);
      freightForwarder = details;
      
      // If user is subscribed, fetch location and country scores
      if (isSubscribed && user?.token) {
        await loadDetailedScores();
      }
    } catch (err: any) {
      error = err.message || 'Failed to load freight forwarder details';
    } finally {
      isLoading = false;
    }
  });
  
  async function loadDetailedScores() {
    if (!freightForwarderId || !user?.token) return;
    
    try {
      isLoadingScores = true;
      const [locationData, countryData] = await Promise.all([
        apiClient.getFreightForwarderLocationScores(freightForwarderId, user.token),
        apiClient.getFreightForwarderCountryScores(freightForwarderId, user.token)
      ]);
      
      locationScores = locationData;
      countryScores = countryData;
    } catch (err: any) {
      console.error('Failed to load detailed scores:', err);
    } finally {
      isLoadingScores = false;
    }
  }
  
  function switchTab(tab: 'overview' | 'locations' | 'countries') {
    activeTab = tab;
    
    // Load scores if switching to a tab that needs them and they haven't been loaded yet
    if ((tab === 'locations' || tab === 'countries') && isSubscribed && user?.token && 
        ((tab === 'locations' && locationScores.length === 0) || 
         (tab === 'countries' && countryScores.length === 0))) {
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
      <div class="error">{error}</div>
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
          <h1 class="company-name">{freightForwarder.name}</h1>
          
          <!-- Aggregate Score Display -->
          {#if freightForwarder.rating}
            <div class="aggregate-score">
              <div class="score-circle">
                <span class="score-number">{freightForwarder.rating.toFixed(1)}</span>
                <span class="score-max">/5.0</span>
              </div>
              <div class="score-details">
                <div class="stars">{'★'.repeat(Math.round(freightForwarder.rating))}</div>
                <div class="review-count">{freightForwarder.review_count} reviews</div>
                {#if freightForwarder.global_rank}
                  <div class="global-rank">Global Rank: #{freightForwarder.global_rank}</div>
                {/if}
              </div>
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
      {#if isSubscribed}
        <section class="scores-tabs">
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
                {#if isLoadingScores}
                  <div class="loading-scores">Loading location scores...</div>
                {:else if locationScores.length > 0}
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
                            <div class="review-count">{location.review_count} reviews</div>
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
                            <span class="review-count">📝 {country.review_count} reviews</span>
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
          <p>Upgrade to Pro or Enterprise to view category scores, location and country-specific scores, advanced analytics, and more detailed insights.</p>
          {#if isLoggedIn}
            <a href="/pricing" class="btn btn-primary">View Pricing Plans</a>
          {:else}
            <div class="auth-actions">
              <a href="/auth" class="btn btn-primary">Sign In</a>
              <a href="/pricing" class="btn btn-outline">View Pricing Plans</a>
            </div>
          {/if}
        </div>
      {/if}



      <!-- Submit Review Button -->
      <div class="review-section">
        <a href="/reviews?company={freightForwarder.id}" class="btn btn-primary">Submit Review</a>
      </div>
    {:else}
      <div class="not-found">Freight forwarder not found.</div>
    {/if}
  </div>
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

  .review-count {
    color: #666;
    font-size: 0.9rem;
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
  }
</style>
