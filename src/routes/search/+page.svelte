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
  let selectedCity = '';
  let companiesForLocation: FreightForwarder[] = [];
  let citiesWithReviews: string[] = [];
  let selectedCountry = '';
  let isCityLoading = false;
  let showSubscriptionPrompt = false;
  let user: any = null;
  let userSubscription = 'free';

  // Initialize search type from URL only once on mount
  let initialSearchTypeSet = false;

  onMount(() => {
    // Subscribe to auth store to get user info
    const unsubscribe = auth.subscribe(state => {
      user = state.user;
      userSubscription = state.user?.subscription_tier || 'free';
    });
    
    // Set initial search type from URL only once
    if (!initialSearchTypeSet && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const type = urlParams.get('type') || 'company';
      const query = urlParams.get('q') || '';
      
      // Handle initial search type - check if user can search by country
      if (type === 'country' && userSubscription === 'free') {
        searchType = 'company';
        if (query) {
          companyQuery = query;
        }
      } else {
        searchType = type as 'company' | 'country';
        if (type === 'company' && query) {
          companyQuery = query;
        } else if (type === 'country' && query) {
          countryQuery = query;
        }
      }
      
      initialSearchTypeSet = true;
      
      // Perform initial search if query exists
      if (query) {
        performSearch();
      }
    }
    
    return unsubscribe;
  });

  $: canSearchByCountry = userSubscription !== 'free';

  function canSearchByCompany(): boolean {
    // All users can search by company
    return true;
  }

  function goBackToCities() {
    console.log('Going back to cities');
    selectedCity = '';
    companiesForLocation = [];
    searchResults = [];
  }

  async function selectCompany(company: FreightForwarder) {
    // Navigate directly to the company's forwarder page
    if (typeof window !== 'undefined') {
      window.location.href = `/freight-forwarder/${company.id}`;
    }
  }

  async function selectCity(city: string) {
    selectedCity = city;
    isCityLoading = true;
    error = null;
    
    try {
      // Get companies that have reviews in this city
      const reviews = await apiClient.getReviewsByCity(city, selectedCountry);
      
      if (reviews.length === 0) {
        companiesForLocation = [];
        searchResults = [];
        error = `No reviews found for ${city}, ${selectedCountry}`;
        return;
      }
      
      // Extract unique freight forwarder IDs from the reviews
      const freightForwarderIds = [...new Set(reviews.map(review => review.freight_forwarder_id))];
      
      // Get company details for each freight forwarder that has reviews in this city
      const companiesPromises = freightForwarderIds.map(async (id) => {
        try {
          // Pass city and country parameters to filter data correctly
          const company = await apiClient.getFreightForwarder(id, city, selectedCountry);
          
          // Convert category_scores_summary to category_scores format for compatibility
          if ((company as any).category_scores_summary) {
            company.category_scores = Object.entries((company as any).category_scores_summary).map(([categoryId, categoryData]: [string, any]) => {
              // Use raw scores directly from backend (no conversion needed)
              const score = parseFloat(categoryData.average_rating) || 0;
              // Use backend review count (now should be correct with city/country filtering)
              const count = parseInt(categoryData.total_reviews) || 0;
              console.log(`Category ${categoryId}: Raw score ${categoryData.average_rating}, Review count: ${count}`);
              return {
                category_name: categoryId,
                average_score: score,
                review_count: count
              };
            });
            console.log('Final category_scores for', company.name, ':', company.category_scores);
          } else {
            company.category_scores = [];
          }
          
          return company;
        } catch (error) {
          console.error(`Failed to fetch company ${id}:`, error);
          return null;
        }
      });
      
      const companies = await Promise.all(companiesPromises);
      companiesForLocation = companies.filter(company => company !== null);
      searchResults = companiesForLocation;
      
      if (companiesForLocation.length === 0) {
        error = `No companies found for ${city}, ${selectedCountry}`;
      }
      
    } catch (err: any) {
      console.error('Error fetching companies for city:', err);
      error = 'Failed to load companies for this city. Please try again.';
      companiesForLocation = [];
      searchResults = [];
    } finally {
      isCityLoading = false;
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
    
    // Clear all search data
    searchResults = [];
    companiesForLocation = [];
    citiesWithReviews = [];
    selectedCity = '';
    error = null;
    
    // Update URL only in browser
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('type', type);
      url.searchParams.delete('q');
      window.history.pushState({}, '', url.toString());
    }
  }

  function getCurrentQuery(): string {
    const query = searchType === 'company' ? companyQuery : countryQuery;
    return query;
  }

  function setCurrentQuery(value: string) {
    if (searchType === 'company') {
      companyQuery = value;
    } else if (searchType === 'country') {
      countryQuery = value;
    }
  }

  function updateURL() {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('type', searchType);
      url.searchParams.set('q', getCurrentQuery());
      window.history.pushState({}, '', url.toString());
    }
  }

  // Get category name from ID
  function getCategoryName(categoryId: string): string {
    const categoryMap: Record<string, string> = {
      'responsiveness': 'Responsiveness',
      'shipment_management': 'Shipment Management',
      'documentation': 'Documentation',
      'customer_experience': 'Customer Experience',
      'technology_process': 'Technology & Process',
      'reliability_execution': 'Reliability & Execution',
      'compliance_security': 'Compliance & Security',
      'proactivity_insight': 'Proactivity & Insight',
      'after_hours_support': 'After Hours Support'
    };
    const result = categoryMap[categoryId] || categoryId;
    return result;
  }

  // Format score for display
  function formatScore(score: number): string {
    let result: string;
    if (score === 0) result = 'N/A';
    else if (score <= 1) result = 'Poor';
    else if (score <= 2) result = 'Fair';
    else if (score <= 3) result = 'Good';
    else result = 'Excellent';
    
    return result;
  }

  // Get score color class
  function getScoreColorClass(score: number): string {
    let result: string;
    if (score === 0) result = 'score-na';
    else if (score <= 1) result = 'score-poor';
    else if (score <= 2) result = 'score-fair';
    else if (score <= 3) result = 'score-good';
    else result = 'score-excellent';
    
    return result;
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
  <div class="search-type-selection">
    
    <button 
      class="search-type-btn {searchType === 'company' ? 'active' : ''}"
      on:click={() => {
        updateSearchType('company');
      }}
    >
      Search by Company
    </button>
    
    <button 
      class="search-type-btn {searchType === 'country' ? 'active' : ''} {!canSearchByCountry ? 'disabled' : ''}"
      on:click={() => {
        updateSearchType('country');
      }}
      title="Search for companies by country"
    >
      Search by Country
      {#if !canSearchByCountry}
        <span class="premium-badge">🔒 Premium</span>
      {/if}
    </button>
    
  </div>

  <!-- Search Input -->
  <div class="search-input-container">
    <input
      type="text"
      placeholder={searchType === 'company' ? 'Enter company name...' : 'Enter country name...'}
      value={getCurrentQuery()}
      on:input={(e) => {
        setCurrentQuery(e.currentTarget.value);
      }}
      on:keydown={(e) => {
        if (e.key === 'Enter') {
          performSearch();
        }
      }}
      class="search-input"
    />
    <button on:click={() => {
      performSearch();
    }} class="search-btn" disabled={isLoading}>
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

  <!-- City Loading State -->
  {#if isCityLoading}
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading companies for {selectedCity}...</p>
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
        <h2>Cities with Reviews in "{selectedCountry}"</h2>
        <p class="cities-subtitle">Click on a city to see companies with reviews there</p>
        
        <div class="cities-grid">
          {#each citiesWithReviews as city}
            <div class="city-card" on:click={() => {
              selectCity(city);
            }}>
              <div class="city-name">{city}</div>
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
            <div class="company-card clickable" on:click={() => {
              selectCompany(company);
            }}>
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
                <button class="view-scores-btn" on:click={() => {
                  selectCompany(company);
                }}>View Scores</button>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {:else if searchType === 'country' && selectedCity && companiesForLocation.length === 0 && !isCityLoading && !error}
      <!-- City Selected but No Companies Found -->
      <div class="city-companies-section">
        <div class="city-header">
          <h2>Companies with Reviews in {selectedCity}, {selectedCountry}</h2>
          <button on:click={goBackToCities} class="back-btn">← Back to Cities</button>
        </div>
        
        <div class="no-companies-found">
          <div class="empty-icon">🏢</div>
          <h3>No Companies Found</h3>
          <p>No companies with reviews were found in {selectedCity}, {selectedCountry}.</p>
          <p>This could mean:</p>
          <ul>
            <li>No reviews have been submitted for companies in this city yet</li>
            <li>The city name might be spelled differently in our database</li>
            <li>Companies in this city haven't received any reviews</li>
          </ul>
          <button on:click={goBackToCities} class="back-btn">← Back to Cities</button>
        </div>
      </div>
    {:else if searchType === 'country' && selectedCity && isCityLoading}
      <!-- City Loading State -->
      <div class="city-companies-section">
        <div class="city-header">
          <h2>Loading Companies for {selectedCity}, {selectedCountry}</h2>
          <button on:click={goBackToCities} class="back-btn">← Back to Cities</button>
        </div>
        
        <div class="loading">
          <div class="spinner"></div>
          <p>Loading companies...</p>
        </div>
      </div>
    {/if}
    
    <!-- CATEGORY COMPARISON TABLE - Side by side comparison of 7 categories -->
    {#if searchType === 'country' && selectedCity && companiesForLocation.length > 0}
      <div style="margin-top: 20px; padding: 20px; background: #e3f2fd; border: 2px solid #2196f3; border-radius: 8px;">
        <h3 style="color: #0d47a1; margin-bottom: 20px; text-align: center;">📊 CATEGORY PERFORMANCE COMPARISON</h3>
        <p style="color: #0d47a1; margin-bottom: 20px; text-align: center;">{selectedCity}</p>
        
        <!-- Category Comparison Table -->
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd; font-weight: bold; color: #333; min-width: 200px;">Category</th>
                {#each companiesForLocation as company}
                  <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd; font-weight: bold; color: #333; min-width: 150px;">
                    <a 
                      href="/freight-forwarder/{company.id}" 
                      style="color: #333; text-decoration: none; cursor: pointer; transition: color 0.2s ease;"
                      on:click|preventDefault={() => selectCompany(company)}
                      on:mouseenter={(e) => e.currentTarget.style.color = '#667eea'}
                      on:mouseleave={(e) => e.currentTarget.style.color = '#333'}
                    >
                      {company.name}
                    </a>
                  </th>
                {/each}
              </tr>
            </thead>
            <tbody>
              {#each ['responsiveness', 'shipment_management', 'documentation', 'customer_experience', 'technology_process', 'reliability_execution', 'compliance_security'] as category}
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 12px; font-weight: 600; color: #555; background: #fafafa;">{getCategoryName(category)}</td>
                  {#each companiesForLocation as company}
                    <td style="padding: 12px; text-align: center; border-left: 1px solid #eee;">
                      {#if company.category_scores && company.category_scores.length > 0}
                        {@const categoryScore = company.category_scores.find(score => score.category_name === category)}
                        {#if categoryScore}
                          <div style="display: flex; flex-direction: column; align-items: center; gap: 5px;">
                            <div style="
                              padding: 6px 12px; 
                              border-radius: 20px; 
                              font-weight: bold; 
                              font-size: 14px;
                              background: {categoryScore.average_score >= 3 ? '#d4edda' : categoryScore.average_score >= 2 ? '#fff3cd' : categoryScore.average_score >= 1 ? '#f8d7da' : '#f8f9fa'};
                              color: {categoryScore.average_score >= 3 ? '#155724' : categoryScore.average_score >= 2 ? '#856404' : categoryScore.average_score >= 1 ? '#721c24' : '#6c757d'};
                              border: 1px solid {categoryScore.average_score >= 3 ? '#c3e6cb' : categoryScore.average_score >= 2 ? '#ffeaa7' : categoryScore.average_score >= 1 ? '#f5c6cb' : '#dee2e6'};
                            ">
                              {categoryScore.average_score.toFixed(1)}
                            </div>
                          </div>
                        {:else}
                          <span style="color: #999; font-style: italic;">N/A</span>
                        {/if}
                      {:else}
                        <span style="color: #999; font-style: italic;">No scores</span>
                      {/if}
                    </td>
                  {/each}
                </tr>
              {/each}
              <!-- Aggregated Score Row -->
              <tr style="background: #f8f9fa; border-top: 2px solid #ddd;">
                <td style="padding: 12px; font-weight: 700; color: #333; background: #e9ecef;">🏆 AGGREGATED SCORE</td>
                {#each companiesForLocation as company}
                  <td style="padding: 12px; text-align: center; border-left: 1px solid #eee;">
                    {#if company.average_rating}
                      <div style="display: flex; flex-direction: column; align-items: center; gap: 5px;">
                        <div style="
                          padding: 8px 16px; 
                          border-radius: 25px; 
                          font-weight: bold; 
                          font-size: 16px;
                          background: {company.average_rating >= 3 ? '#d4edda' : company.average_rating >= 2 ? '#fff3cd' : company.average_rating >= 1 ? '#f8d7da' : '#f8f9fa'};
                          color: {company.average_rating >= 3 ? '#155724' : company.average_rating >= 2 ? '#856404' : company.average_rating >= 1 ? '#721c24' : '#6c757d'};
                          border: 2px solid {company.average_rating >= 3 ? '#c3e6cb' : company.average_rating >= 2 ? '#ffeaa7' : company.average_rating >= 1 ? '#f5c6cb' : '#dee2e6'};
                        ">
                          {company.average_rating.toFixed(1)} ⭐
                        </div>
                        <div style="font-size: 12px; color: #666;">{formatScore(company.average_rating)} ({company.review_count} review{#if company.review_count !== 1}s{/if})</div>
                      </div>
                    {:else}
                      <span style="color: #999; font-style: italic;">No rating</span>
                    {/if}
                  </td>
                {/each}
              </tr>
            </tbody>
          </table>
        </div>
        

        

      </div>
    {/if}
    
    {#if !isLoading && getCurrentQuery() && searchResults.length === 0 && citiesWithReviews.length === 0}
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
      <a href="/pricing" class="upgrade-btn">View Pricing Plans</a>
    </div>
  {/if}
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
    padding: 40px 0;
    background: white;
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
    background: #667eea;
    color: white;
  }

  .search-type-btn.disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: #f8f9fa;
    color: #95a5a6;
    border-color: #dee2e6;
  }

  .search-type-btn.disabled:hover {
    background-color: #f8f9fa;
    color: #95a5a6;
    transform: none;
    box-shadow: none;
  }

  .search-type-selection {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 2rem;
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
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
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
    width: 200px;
    flex-shrink: 0;
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

  .company-card.clickable {
    cursor: pointer;
  }

  .company-card.clickable:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
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

  .view-scores-btn {
    padding: 12px 24px;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  .view-scores-btn:hover {
    background: #218838;
    transform: translateY(-2px);
  }

  /* Company Details Section */
  .company-details-section {
    margin-top: 2rem;
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .company-details-header {
    text-align: center;
    margin-bottom: 2rem;
    position: relative;
  }

  .company-details-header .back-btn {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
  }

  .company-details-header h2 {
    color: #2c3e50;
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  .company-summary {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    flex-wrap: wrap;
  }

  .category-scores-section {
    margin: 3rem 0;
  }

  .category-scores-section h3 {
    color: #2c3e50;
    text-align: center;
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }

  .scores-description {
    text-align: center;
    color: #7f8c8d;
    margin-bottom: 2rem;
    font-size: 1.1rem;
  }

  .category-scores-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .category-score-card {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 10px;
    padding: 1.5rem;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .category-score-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  }

  .category-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .category-header h4 {
    color: #2c3e50;
    font-size: 1.2rem;
    margin: 0;
  }

  .score-badge {
    padding: 8px 16px;
    border-radius: 20px;
    font-weight: bold;
    font-size: 1.1rem;
    color: white;
  }

  .score-na {
    background: #6c757d;
  }

  .score-poor {
    background: #dc3545;
  }

  .score-fair {
    background: #ffc107;
    color: #212529;
  }

  .score-good {
    background: #28a745;
  }

  .score-excellent {
    background: #20c997;
  }

  .score-details {
    text-align: center;
  }

  .score-label {
    font-size: 1.1rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }

  .review-count {
    color: #7f8c8d;
    font-size: 0.9rem;
  }

  .no-scores {
    text-align: center;
    padding: 3rem;
    color: #7f8c8d;
  }

  .no-scores p {
    margin-bottom: 1rem;
    font-size: 1.1rem;
  }

  .company-actions-footer {
    text-align: center;
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid #e9ecef;
  }

  .view-full-profile-btn {
    display: inline-block;
    padding: 15px 30px;
    background: #667eea;
    color: white;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 1.1rem;
    transition: all 0.3s ease;
  }

  .view-full-profile-btn:hover {
    background: #5a6fd8;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
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

  .premium-badge {
    background-color: #ff6b35;
    color: white;
    padding: 8px 12px;
    border-radius: 5px;
    font-size: 0.9rem;
    font-weight: bold;
    margin-left: 10px;
  }

  .no-companies-found {
    text-align: center;
    padding: 3rem;
    color: #7f8c8d;
  }

  .no-companies-found .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .no-companies-found h3 {
    color: #2c3e50;
    margin-bottom: 1rem;
  }

  .no-companies-found p {
    margin-bottom: 1.5rem;
    font-size: 1.1rem;
  }

  .no-companies-found ul {
    list-style: none;
    padding: 0;
    margin-bottom: 2rem;
  }

  .no-companies-found li {
    margin-bottom: 0.5rem;
    font-size: 1rem;
    color: #555;
  }

  .no-companies-found .btn-primary {
    padding: 12px 24px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: background 0.3s ease;
  }

  .no-companies-found .btn-primary:hover {
    background: #5a6fd8;
  }

  .error-display {
    text-align: center;
    padding: 3rem;
    color: #7f8c8d;
  }

  .error-display .error-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .error-display h3 {
    color: #2c3e50;
    margin-bottom: 1rem;
  }

  .error-display p {
    margin-bottom: 1.5rem;
    font-size: 1.1rem;
  }

  .error-display .error-actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }

  .error-display .btn-primary {
    padding: 12px 24px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: background 0.3s ease;
  }

  .error-display .btn-primary:hover {
    background: #5a6fd8;
  }

  .error-display .btn-secondary {
    padding: 12px 24px;
    background: #e0e0e0;
    color: #333;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: background 0.3s ease;
  }

  .error-display .btn-secondary:hover {
    background: #d0d0d0;
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

    .company-details-header .back-btn {
      position: static;
      transform: none;
      margin-bottom: 1rem;
    }

    .company-summary {
      flex-direction: column;
      gap: 1rem;
    }

    .category-scores-grid {
      grid-template-columns: 1fr;
    }
  }
</style>

