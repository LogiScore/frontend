<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { auth } from '$lib/auth';
  import { apiClient } from '$lib/api';
  import type { FreightForwarder } from '$lib/api';

  let searchType: 'company' | 'country' = 'company';
  let companyQuery = '';
  let countryQuery = '';
  let searchResults: FreightForwarder[] = [];
  let isLoading = false;
  let error: string | null = null;
  let showSubscriptionPrompt = false;
  let user: any = null;
  let userSubscription = 'free';
  let companiesForLocation: FreightForwarder[] = [];
  let citiesWithReviews: string[] = [];
  let selectedCountry: string = '';
  let selectedCity: string = '';

  // Get search query from URL parameters
  $: {
    const urlParams = new URLSearchParams($page.url.search);
    const query = urlParams.get('q') || '';
    let type = urlParams.get('type') || 'company';
    
    // Force company search for non-subscribed users
    if (type === 'country' && !canSearchByCountry) {
      type = 'company';
      // Update URL to reflect the change
      const url = new URL(window.location.href);
      url.searchParams.set('type', 'company');
      window.history.replaceState({}, '', url.toString());
    }
    
    searchType = type as 'company' | 'country';
    if (type === 'company') {
      companyQuery = query;
    } else if (type === 'country') {
      countryQuery = query;
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
      console.log('Auth state updated:', {
        user: state.user,
        subscription_tier: state.user?.subscription_tier,
        userSubscription: userSubscription
      });
    });
    
    return unsubscribe;
  });

  $: canSearchByCountry = userSubscription !== 'free';

  function canSearchByCompany(): boolean {
    // All users can search by company
    return true;
  }

  function goBackToCities() {
    selectedCity = '';
    companiesForLocation = [];
    searchResults = [];
  }

  async function selectCity(city: string) {
    selectedCity = city;
    isLoading = true;
    error = null;
    
    try {
      // Get companies that have reviews in this city
      const reviews = await apiClient.getReviewsByCity(city, selectedCountry);
      
      if (reviews.length === 0) {
        companiesForLocation = [];
        searchResults = [];
        return;
      }
      
      // Extract unique freight forwarder IDs from the reviews
      const freightForwarderIds = [...new Set(reviews.map(review => review.freight_forwarder_id))];
      
      // Get company details for each freight forwarder that has reviews in this city
      const companiesPromises = freightForwarderIds.map(async (id) => {
        try {
          const company = await apiClient.getFreightForwarder(id);
          return company;
        } catch (error) {
          console.error(`Failed to fetch company ${id}:`, error);
          return null;
        }
      });
      
      const companies = await Promise.all(companiesPromises);
      companiesForLocation = companies.filter(company => company !== null);
      searchResults = companiesForLocation;
      
    } catch (err: any) {
      console.error('Error fetching companies for city:', err);
      error = 'Failed to load companies for this city';
      companiesForLocation = [];
      searchResults = [];
    } finally {
      isLoading = false;
    }
  }

  async function performSearch() {
    if (searchType === 'company' && !companyQuery.trim()) return;
    if (searchType === 'country' && !countryQuery.trim()) return;
    
    isLoading = true;
    error = null;
    searchResults = [];
    companiesForLocation = [];
    citiesWithReviews = [];
    selectedCity = '';
    
    try {
      if (searchType === 'company') {
        // Company search
        const results = await apiClient.searchFreightForwarders(companyQuery);
        searchResults = results;
      } else if (searchType === 'country') {
        // Country search - get cities with reviews
        selectedCountry = countryQuery;
        const reviews = await apiClient.getReviewsByCountry(countryQuery);
        
        // Extract unique cities from reviews
        const cities = [...new Set(reviews.map(review => review.city).filter((city): city is string => city !== undefined))];
        citiesWithReviews = cities;
        
        // Show cities instead of companies
        searchResults = [];
      }
    } catch (err: any) {
      console.error('Search error:', err);
      error = 'Search failed. Please try again.';
    } finally {
      isLoading = false;
    }
  }

  function updateSearchType(type: 'company' | 'country') {
    searchType = type;
    searchResults = [];
    companiesForLocation = [];
    citiesWithReviews = [];
    selectedCity = '';
    error = null;
    
    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set('type', type);
    url.searchParams.delete('q');
    window.history.pushState({}, '', url.toString());
  }

  function getCurrentQuery(): string {
    return searchType === 'company' ? companyQuery : countryQuery;
  }

  function setCurrentQuery(value: string) {
    if (searchType === 'company') {
      companyQuery = value;
    } else if (searchType === 'country') {
      countryQuery = value;
    }
  }

  function updateURL() {
    const url = new URL(window.location.href);
    url.searchParams.set('type', searchType);
    url.searchParams.set('q', getCurrentQuery());
    window.history.pushState({}, '', url.toString());
  }
</script>

<svelte:head>
  <title>Search - LogiScore</title>
  <meta name="description" content="Search for freight forwarders and logistics companies on LogiScore" />
</svelte:head>

<main>
  <!-- Hero Section -->
  <section class="hero">
    <div class="container">
      <h1>Search</h1>
      <p class="hero-subtitle">Find freight forwarders and logistics companies</p>
    </div>
  </section>

  <!-- Search Section -->
  <section class="search-section">
    <div class="container">



  <!-- Search Type Selection -->
  <div class="search-type-selector">
    <button 
      class="search-type-btn {searchType === 'company' ? 'active' : ''}"
      on:click={() => updateSearchType('company')}
    >
      Search by Company
    </button>
    
    {#if canSearchByCountry}
      <button 
        class="search-type-btn {searchType === 'country' ? 'active' : ''}"
        on:click={() => updateSearchType('country')}
      >
        Search by Country
      </button>
    {/if}
  </div>

  <!-- Search Input -->
  <div class="search-input-container">
    <input
      type="text"
      placeholder={searchType === 'company' ? 'Enter company name...' : 'Enter country name...'}
      value={getCurrentQuery()}
      on:input={(e) => setCurrentQuery(e.currentTarget.value)}
      on:keydown={(e) => e.key === 'Enter' && performSearch()}
      class="search-input"
    />
    <button on:click={performSearch} class="search-btn" disabled={isLoading}>
      {isLoading ? 'Searching...' : 'Search'}
    </button>
  </div>

  <!-- Error Display -->
  {#if error}
    <div class="error-message">
      {error}
    </div>
  {/if}

  <!-- Loading State -->
  {#if isLoading}
    <div class="loading">
      <div class="spinner"></div>
      <p>Searching...</p>
    </div>
  {/if}

  <!-- Search Results -->
  {#if !isLoading && !error}
    {#if searchType === 'company' && searchResults.length > 0}
      <!-- Company Search Results -->
      <div class="results-section">
        <h2>Companies Found ({searchResults.length})</h2>
        <div class="companies-grid">
          {#each searchResults as company}
            <div class="company-card">
              <div class="company-info">
                <h3>{company.name}</h3>
                {#if company.headquarters_country}
                  <p class="company-location">📍 {company.headquarters_country}</p>
                {/if}
                {#if company.description}
                  <p class="company-description">{company.description}</p>
                {/if}
                {#if company.average_rating}
                  <div class="company-rating">
                    <span class="stars">{'★'.repeat(Math.round(company.average_rating))}</span>
                    <span class="rating-text">{company.average_rating.toFixed(1)}</span>
                  </div>
                {/if}
              </div>
              <div class="company-actions">
                <a href="/freight-forwarder/{company.id}" class="view-details-btn">View Details</a>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {:else if searchType === 'country' && citiesWithReviews.length > 0}
      <!-- Country Search Results - Cities -->
      <div class="results-section">
        <h2>Cities with Reviews in "{selectedCountry}" ({citiesWithReviews.length})</h2>
        <p class="cities-subtitle">Click on a city to see companies with reviews there</p>
        
        <div class="cities-grid">
          {#each citiesWithReviews as city}
            <div class="city-card" on:click={() => selectCity(city)}>
              <div class="city-name">{city}</div>
              <div class="city-country">{selectedCountry}</div>
            </div>
          {/each}
        </div>
      </div>
    {:else if searchType === 'country' && selectedCity && companiesForLocation.length > 0}
      <!-- City Search Results - Companies -->
      <div class="city-companies-section">
        <div class="city-header">
          <h2>Companies with Reviews in {selectedCity}, {selectedCountry}</h2>
          <button on:click={goBackToCities} class="back-btn">← Back to Cities</button>
        </div>
        
        <div class="companies-grid">
          {#each companiesForLocation as company}
            <div class="company-card">
              <div class="company-info">
                <h3>{company.name}</h3>
                {#if company.headquarters_country}
                  <p class="company-location">📍 {company.headquarters_country}</p>
                {/if}
                {#if company.description}
                  <p class="company-description">{company.description}</p>
                {/if}
                {#if company.average_rating}
                  <div class="company-rating">
                    <span class="stars">{'★'.repeat(Math.round(company.average_rating))}</span>
                    <span class="rating-text">{company.average_rating.toFixed(1)}</span>
                  </div>
                {/if}
              </div>
              <div class="company-actions">
                <a href="/freight-forwarder/{company.id}" class="view-details-btn">View Details</a>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {:else if !isLoading && getCurrentQuery() && searchResults.length === 0 && citiesWithReviews.length === 0}
      <!-- No Results -->
      <div class="no-results">
        <p>No results found for "{getCurrentQuery()}".</p>
        <p>Try adjusting your search terms or search type.</p>
      </div>
    {/if}
  {/if}

  <!-- Subscription Prompt -->
  {#if showSubscriptionPrompt}
    <div class="subscription-prompt">
      <h3>Upgrade Your Subscription</h3>
      <p>Get access to advanced search features and more comprehensive results.</p>
      <a href="/pricing" class="upgrade-btn">View Plans</a>
    </div>
  {/if}
    </div>
  </section>
</main>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  /* Hero Section */
  .hero {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 80px 0;
    text-align: center;
  }

  .hero h1 {
    font-size: 3.5rem;
    margin-bottom: 1rem;
    font-weight: 700;
  }

  .hero-subtitle {
    font-size: 1.3rem;
    margin-bottom: 2rem;
    opacity: 0.9;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  /* Search Section */
  .search-section {
    padding: 80px 0;
    background: #f8f9fa;
  }



  .search-type-selector {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .btn {
    display: inline-block;
    padding: 12px 24px;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s ease;
    border: none;
    cursor: pointer;
  }

  .btn-outline {
    background: transparent;
    color: #667eea;
    border: 2px solid #667eea;
  }

  .btn-outline:hover {
    background: #667eea;
    color: white;
  }

  .search-type-btn {
    padding: 1rem 2rem;
    border: 2px solid #667eea;
    background: transparent;
    color: #667eea;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1.1rem;
    font-weight: 600;
    transition: all 0.3s ease;
    min-width: 180px;
  }

  .search-type-btn:hover {
    background: #3498db;
    color: white;
  }

  .search-type-btn.active {
    background: #3498db;
    color: white;
  }

  .search-input-container {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    justify-content: center;
  }

  .search-input {
    padding: 1rem;
    border: 2px solid #e0e0e0;
    border-radius: 6px;
    font-size: 1rem;
    min-width: 400px;
    transition: border-color 0.3s ease;
  }

  .search-input:focus {
    outline: none;
    border-color: #667eea;
  }

  .search-btn {
    padding: 12px 24px;
    background: #ff6b35;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .search-btn:hover:not(:disabled) {
    background: #e55a2b;
    transform: translateY(-2px);
  }

  .search-btn:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
  }

  .error-message {
    background: #e74c3c;
    color: white;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    text-align: center;
  }

  .loading {
    text-align: center;
    padding: 2rem;
  }

  .spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .results-section {
    margin-top: 2rem;
  }

  .results-section h2 {
    color: #2c3e50;
    margin-bottom: 1rem;
    text-align: center;
  }

  .cities-subtitle {
    text-align: center;
    color: #7f8c8d;
    margin-bottom: 2rem;
  }

  .cities-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .city-card {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 10px;
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
  }

  .city-card:hover {
    transform: translateY(-5px);
  }

  .city-name {
    font-size: 1.2rem;
    font-weight: bold;
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }

  .city-country {
    color: #7f8c8d;
    font-size: 0.9rem;
  }

  .city-companies-section {
    margin-top: 2rem;
  }

  .city-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .back-btn {
    padding: 12px 24px;
    background: #6c757d;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.3s ease;
  }

  .back-btn:hover {
    background: #5a6268;
  }

  .companies-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
  }

  .company-card {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 10px;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
  }

  .company-card:hover {
    transform: translateY(-5px);
  }

  .company-info h3 {
    color: #2c3e50;
    margin-bottom: 0.5rem;
    font-size: 1.3rem;
  }

  .company-location {
    color: #7f8c8d;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }

  .company-description {
    color: #34495e;
    margin-bottom: 1rem;
    line-height: 1.5;
  }

  .company-rating {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .stars {
    color: #f39c12;
    font-size: 1.1rem;
  }

  .rating-text {
    color: #7f8c8d;
    font-weight: bold;
  }

  .company-actions {
    text-align: right;
  }

  .view-details-btn {
    display: inline-block;
    padding: 12px 24px;
    background: #667eea;
    color: white;
    text-decoration: none;
    border-radius: 6px;
    transition: background 0.3s ease;
  }

  .view-details-btn:hover {
    background: #5a6fd8;
  }

  .no-results {
    text-align: center;
    padding: 3rem;
    color: #7f8c8d;
  }

  .subscription-prompt {
    background: #f8f9fa;
    border: 2px solid #667eea;
    border-radius: 10px;
    padding: 2rem;
    text-align: center;
    margin-top: 2rem;
  }

  .subscription-prompt h3 {
    color: #2c3e50;
    margin-bottom: 1rem;
  }

  .subscription-prompt p {
    color: #7f8c8d;
    margin-bottom: 1.5rem;
  }

  .upgrade-btn {
    display: inline-block;
    padding: 12px 24px;
    background: #ff6b35;
    color: white;
    text-decoration: none;
    border-radius: 6px;
    transition: background 0.3s ease;
  }

  .upgrade-btn:hover {
    background: #e55a2b;
  }

  @media (max-width: 768px) {
    .hero h1 {
      font-size: 2.5rem;
    }

    .hero-subtitle {
      font-size: 1.1rem;
    }

    .search-input-container {
      flex-direction: column;
      align-items: center;
    }

    .search-input {
      min-width: 100%;
      max-width: 400px;
    }

    .cities-grid {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    }

    .companies-grid {
      grid-template-columns: 1fr;
    }

    .city-header {
      flex-direction: column;
      gap: 1rem;
      text-align: center;
    }
  }
</style>

