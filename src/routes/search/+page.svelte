<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { auth } from '$lib/auth';
  import { apiClient } from '$lib/api';
  import type { FreightForwarder, Location } from '$lib/api';

  let searchType: 'company' | 'location' = 'company';
  let companyQuery = '';
  let locationQuery = '';
  let searchResults: FreightForwarder[] = [];
  let isLoading = false;
  let error: string | null = null;
  let showSubscriptionPrompt = false;
  let user: any = null;
  let userSubscription = 'free';

  // Get search query from URL parameters
  $: {
    const urlParams = new URLSearchParams($page.url.search);
    const query = urlParams.get('q') || '';
    const type = urlParams.get('type') || 'company';
    
    searchType = type as 'company' | 'location';
    if (type === 'company') {
      companyQuery = query;
    } else {
      locationQuery = query;
    }
    
    if (query) {
      performSearch();
    }
  }

  onMount(() => {
    // Subscribe to auth store to get user info
    const unsubscribe = auth.subscribe(state => {
      user = state.user;
      userSubscription = state.user?.subscription_tier || 'free';
    });
    
    return unsubscribe;
  });

  function canSearchByLocation(): boolean {
    // Only paid subscribers can search by location
    return userSubscription !== 'free';
  }

  function canSearchByCompany(): boolean {
    // All users can search by company
    return true;
  }

  async function performSearch() {
    const query = searchType === 'company' ? companyQuery : locationQuery;
    if (!query.trim()) return;

    // Check subscription restrictions
    if (searchType === 'location' && !canSearchByLocation()) {
      showSubscriptionPrompt = true;
      return;
    }

    isLoading = true;
    error = null;
    showSubscriptionPrompt = false;

    try {
      let results: FreightForwarder[] = [];
      
      if (searchType === 'company') {
        // Use the aggregated endpoint for comprehensive company search
        // This provides ratings, review counts, and category scores
        const response = await fetch(`https://logiscorebe.onrender.com/api/freight-forwarders/aggregated/?search=${encodeURIComponent(query.trim())}&limit=50`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        results = data;
      } else {
        // Search freight forwarders by location
        // First get locations matching the query
        const locations = await apiClient.searchLocations(query.trim());
        
        if (locations.length === 0) {
          searchResults = [];
          return;
        }
        
        // For location search, we'll use the aggregated endpoint to get all companies
        // and then filter by those that have operations in the searched locations
        const response = await fetch(`https://logiscorebe.onrender.com/api/freight-forwarders/aggregated/?limit=100`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const allCompanies = await response.json();
        
        // Filter companies that might have operations in the searched locations
        const locationCountries = locations.map(loc => loc.country.toLowerCase());
        results = allCompanies.filter((company: FreightForwarder) => 
          company.headquarters_country && 
          locationCountries.includes(company.headquarters_country.toLowerCase())
        );
      }

      searchResults = results.map(company => ({
        ...company,
        logo_url: company.logo_url || '/logo-placeholder.svg'
      }));
    } catch (err: any) {
      console.error('Error searching:', err);
      error = 'Failed to load search results';
      searchResults = [];
    } finally {
      isLoading = false;
    }
  }

  function handleSearch() {
    const query = searchType === 'company' ? companyQuery : locationQuery;
    if (query.trim()) {
          const url = new URL(window.location.href);
    url.searchParams.set('q', query.trim());
    url.searchParams.set('type', searchType);
    window.history.pushState({}, '', url.toString());
      performSearch();
    }
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleSearch();
    }
  }

  function switchSearchType(type: 'company' | 'location') {
    searchType = type;
    searchResults = [];
    error = null;
    showSubscriptionPrompt = false;
    
    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set('type', type);
    if (type === 'company' && companyQuery) {
      url.searchParams.set('q', companyQuery);
    } else if (type === 'location' && locationQuery) {
      url.searchParams.set('q', locationQuery);
    } else {
      url.searchParams.delete('q');
    }
    window.history.pushState({}, '', url.toString());
  }

  function getSearchPlaceholder(): string {
    if (searchType === 'company') {
      return 'Search by company name...';
    } else {
      return 'Search by city, state, or country...';
    }
  }

  function getCurrentQuery(): string {
    return searchType === 'company' ? companyQuery : locationQuery;
  }

  function setCurrentQuery(value: string) {
    if (searchType === 'company') {
      companyQuery = value;
    } else {
      locationQuery = value;
    }
  }
</script>

<svelte:head>
  <title>Search Freight Forwarders - LogiScore</title>
  <meta name="description" content="Search and compare freight forwarders on LogiScore" />
</svelte:head>

<main>
  <section class="search-hero">
    <div class="container">
      <h1>Search Freight Forwarders</h1>
      <p>Find the perfect logistics partner for your business</p>
      
      <!-- Search Type Selector -->
      <div class="search-type-selector">
        <button 
          class="search-type-btn {searchType === 'company' ? 'active' : ''}"
          on:click={() => switchSearchType('company')}
        >
          <span class="icon">🏢</span>
          Search by Company
        </button>
        <button 
          class="search-type-btn {searchType === 'location' ? 'active' : ''}"
          on:click={() => switchSearchType('location')}
          class:disabled={!canSearchByLocation()}
        >
          <span class="icon">📍</span>
          Search by Location
          {#if !canSearchByLocation()}
            <span class="premium-badge">Premium</span>
          {/if}
        </button>
      </div>

      <!-- Search Box -->
      <div class="search-box">
        <input 
          type="text" 
          placeholder={getSearchPlaceholder()}
          value={getCurrentQuery()}
          on:input={(e) => setCurrentQuery(e.currentTarget.value)}
          on:keypress={handleKeyPress}
          class="search-input"
        />
        <button on:click={handleSearch} class="search-button">
          Search
        </button>
      </div>

      <!-- Subscription Notice for Location Search -->
      {#if searchType === 'location' && !canSearchByLocation()}
        <div class="subscription-notice">
          <p>🔒 Location search requires a premium subscription to access detailed location-based results.</p>
          <a href="/pricing" class="upgrade-link">View Pricing Plans</a>
        </div>
      {/if}
    </div>
  </section>

  <!-- Subscription Prompt Modal -->
  {#if showSubscriptionPrompt}
    <div class="modal-overlay" on:click={() => showSubscriptionPrompt = false}>
      <div class="subscription-modal" on:click|stopPropagation>
        <h3>🔒 Premium Feature</h3>
        <p>Location-based search is available to premium subscribers only.</p>
        <p>Upgrade your subscription to unlock:</p>
        <ul>
          <li>Search freight forwarders by location</li>
          <li>Location-specific ratings and reviews</li>
          <li>Detailed branch-level analytics</li>
          <li>Compare performance across locations</li>
        </ul>
        <div class="modal-actions">
          <a href="/pricing" class="upgrade-btn">View Pricing Plans</a>
          <button class="cancel-btn" on:click={() => showSubscriptionPrompt = false}>
            Continue with Company Search
          </button>
        </div>
      </div>
    </div>
  {/if}

  <section class="search-results">
    <div class="container">
      {#if isLoading}
        <div class="loading">
          <p>Searching...</p>
        </div>
      {:else if error}
        <div class="error">
          <p>{error}</p>
        </div>
      {:else if searchResults.length > 0}
        <h2>Search Results ({searchResults.length} companies found)</h2>
        <p class="search-summary">
          {#if searchType === 'company'}
            Showing companies matching "{companyQuery}"
          {:else}
            Showing companies with operations in locations matching "{locationQuery}"
          {/if}
        </p>
        <div class="results-grid">
          {#each searchResults as company}
            <div class="company-card">
              <div class="company-header">
                <div class="company-logo">
                  <img 
                    src={company.logo_url} 
                    alt="{company.name} logo" 
                    class="company-logo-img"
                    on:error={(e) => {
                      const target = e.target;
                      if (target && target instanceof HTMLImageElement) {
                        target.src = '/logo-placeholder.svg';
                      }
                    }}
                  />
                </div>
                <div class="company-info">
                  <h3 class="company-name">{company.name}</h3>
                  {#if company.headquarters_country}
                    <p class="company-headquarters">📍 {company.headquarters_country}</p>
                  {/if}
                  {#if company.average_rating}
                    <div class="company-rating">
                      <span class="stars">
                        {#each Array(5) as _, i}
                          <span class="star {i < Math.floor(company.average_rating || 0) ? 'filled' : ''}">★</span>
                        {/each}
                      </span>
                      {#if user && user.subscription_tier && user.subscription_tier !== 'free'}
                        <span class="rating-text">{(company.average_rating || 0).toFixed(1)}/5</span>
                      {/if}
                    </div>
                  {/if}
                </div>
              </div>
              <div class="company-stats">
                {#if company.review_count}
                  <span class="stat">
                    <span class="stat-label">Reviews:</span>
                    <span class="stat-value">{company.review_count}</span>
                  </span>
                {/if}
              </div>
              <a href="/freight-forwarder/{company.id}" class="view-profile-btn">View Profile</a>
            </div>
          {/each}
        </div>
      {:else if getCurrentQuery()}
        <div class="no-results">
          <h2>No results found</h2>
          <p>Try adjusting your search terms or browse all freight forwarders.</p>
          <div class="no-results-suggestions">
            <h3>Search Tips:</h3>
            <ul>
              {#if searchType === 'company'}
                <li>Try using partial company names (e.g., "DHL" instead of "DHL Supply Chain")</li>
                <li>Check spelling and try alternative spellings</li>
                <li>Use company abbreviations if known</li>
              {:else}
                <li>Try searching by country name (e.g., "Germany" instead of "Hamburg")</li>
                <li>Use major city names (e.g., "London", "New York")</li>
                <li>Check spelling of city and country names</li>
              {/if}
            </ul>
          </div>
        </div>
      {:else}
        <div class="search-prompt">
          <h2>Start Your Search</h2>
          <p>Choose a search type above and enter your query to find freight forwarders.</p>
          <div class="search-examples">
            <div class="example-section">
              <h3>Company Search Examples:</h3>
              <ul>
                <li>"DHL" - Find DHL Supply Chain</li>
                <li>"Kuehne" - Find Kuehne + Nagel</li>
                <li>"DB Schenker" - Find DB Schenker</li>
              </ul>
            </div>
            <div class="example-section">
              <h3>Location Search Examples:</h3>
              <ul>
                <li>"Germany" - Companies in Germany</li>
                <li>"New York" - Companies in New York</li>
                <li>"Singapore" - Companies in Singapore</li>
              </ul>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </section>
</main>

<style>
  .search-hero {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 80px 0;
    text-align: center;
  }

  .search-hero h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .search-hero p {
    font-size: 1.2rem;
    margin-bottom: 2rem;
    opacity: 0.9;
  }

  .search-type-selector {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }

  .search-type-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 1.5rem;
    border: 2px solid rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s;
    position: relative;
  }

  .search-type-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
  }

  .search-type-btn.active {
    background: rgba(255, 255, 255, 0.9);
    color: #667eea;
    border-color: white;
  }

  .search-type-btn.disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .search-type-btn .icon {
    font-size: 1.2rem;
  }

  .premium-badge {
    background: #ffd700;
    color: #333;
    padding: 0.2rem 0.5rem;
    border-radius: 12px;
    font-size: 0.7rem;
    font-weight: bold;
    margin-left: 0.5rem;
  }

  .search-box {
    display: flex;
    max-width: 600px;
    margin: 0 auto;
    gap: 1rem;
  }

  .search-input {
    flex: 1;
    padding: 1rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
  }

  .search-button {
    padding: 1rem 2rem;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.3s;
  }

  .search-button:hover {
    background: #5a6fd8;
  }

  .subscription-notice {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    padding: 1rem;
    margin-top: 1rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .subscription-notice p {
    margin: 0 0 0.5rem 0;
    font-size: 0.9rem;
  }

  .upgrade-link {
    color: #ffd700;
    text-decoration: none;
    font-weight: bold;
  }

  .upgrade-link:hover {
    text-decoration: underline;
  }

  .search-results {
    padding: 60px 0;
  }

  .search-results h2 {
    color: #333;
    margin-bottom: 1rem;
    text-align: center;
  }

  .search-summary {
    text-align: center;
    color: #666;
    margin-bottom: 2rem;
    font-style: italic;
  }

  .results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .company-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s, box-shadow 0.3s;
  }

  .company-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  .company-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 1rem;
    text-align: center;
  }

  .company-logo {
    width: 80px;
    height: 80px;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .company-logo-img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .company-info {
    width: 100%;
    text-align: center;
  }

  .company-name {
    margin: 0 0 0.5rem 0;
    font-size: 1.2rem;
    color: #333;
  }

  .company-headquarters {
    color: #555;
    font-size: 0.9rem;
    margin: 0.5rem 0;
  }

  .company-rating {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .stars {
    display: flex;
    gap: 2px;
  }

  .star {
    color: #ddd;
    font-size: 1rem;
  }

  .star.filled {
    color: #ffd700;
  }

  .rating-text {
    font-size: 0.9rem;
    color: #666;
    font-weight: bold;
  }



  .company-stats {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #f8f9fa;
    padding: 0.5rem;
    border-radius: 6px;
    min-width: 80px;
  }

  .stat-label {
    font-size: 0.8rem;
    color: #666;
    margin-bottom: 0.2rem;
  }

  .stat-value {
    font-weight: bold;
    color: #333;
  }

  .view-profile-btn {
    background: #667eea;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.3s;
    text-decoration: none;
    display: inline-block;
    text-align: center;
    width: calc(100% - 2rem);
    max-width: 200px;
    box-sizing: border-box;
  }

  .view-profile-btn:hover {
    background: #5a6fd8;
  }

  .loading, .error, .no-results, .search-prompt {
    text-align: center;
    padding: 60px 0;
  }

  .loading p, .error p, .no-results p, .search-prompt p {
    color: #666;
    font-size: 1.1rem;
  }

  .error p {
    color: #e74c3c;
  }

  .no-results-suggestions {
    text-align: left;
    max-width: 600px;
    margin: 2rem auto 0;
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 8px;
  }

  .no-results-suggestions h3 {
    color: #333;
    margin-bottom: 1rem;
  }

  .no-results-suggestions ul {
    color: #666;
    line-height: 1.6;
  }

  .search-examples {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    max-width: 800px;
    margin: 2rem auto 0;
    text-align: left;
  }

  .example-section h3 {
    color: #333;
    margin-bottom: 1rem;
  }

  .example-section ul {
    color: #666;
    line-height: 1.6;
  }

  /* Modal Styles */
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
  }

  .subscription-modal {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    max-width: 500px;
    width: 90%;
    text-align: center;
  }

  .subscription-modal h3 {
    color: #333;
    margin-bottom: 1rem;
  }

  .subscription-modal p {
    color: #666;
    margin-bottom: 1rem;
  }

  .subscription-modal ul {
    text-align: left;
    color: #666;
    line-height: 1.6;
    margin-bottom: 1.5rem;
  }

  .modal-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .upgrade-btn {
    background: #667eea;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    text-decoration: none;
    font-weight: bold;
    transition: background 0.3s;
  }

  .upgrade-btn:hover {
    background: #5a6fd8;
  }

  .cancel-btn {
    background: #6c757d;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.3s;
  }

  .cancel-btn:hover {
    background: #5a6268;
  }

  @media (max-width: 768px) {
    .search-hero h1 {
      font-size: 2rem;
    }
    
    .search-type-selector {
      flex-direction: column;
      align-items: center;
    }
    
    .search-box {
      flex-direction: column;
    }
    
    .results-grid {
      grid-template-columns: 1fr;
    }

    .search-examples {
      grid-template-columns: 1fr;
    }

    .modal-actions {
      flex-direction: column;
    }
  }
</style>

