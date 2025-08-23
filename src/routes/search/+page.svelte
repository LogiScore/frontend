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
  let isCityLoading = false;
  let error: string | null = null;
  let showSubscriptionPrompt = false;
  let user: any = null;
  let userSubscription = 'free';
  let companiesForLocation: FreightForwarder[] = [];
  let citiesWithReviews: string[] = [];
  let selectedCountry: string = '';
  let selectedCity: string = '';
  let selectedCompany: FreightForwarder | null = null;
  let showCompanyDetails = false;

  // Get search query from URL parameters
  $: {
    const urlParams = new URLSearchParams($page.url.search);
    const query = urlParams.get('q') || '';
    let type = urlParams.get('type') || 'company';
    
    console.log('URL parameters changed:', { query, type, canSearchByCountry });
    
    // Force company search for non-subscribed users
    if (type === 'country' && !canSearchByCountry) {
      console.log('Forcing company search for non-subscribed user');
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
    
    console.log('Search state updated:', { searchType, companyQuery, countryQuery });
    
    if (query) {
      console.log('Executing search with query:', query);
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
        userSubscription: userSubscription,
        canSearchByCountry: userSubscription !== 'free'
      });
    });
    
    return unsubscribe;
  });

  $: canSearchByCountry = userSubscription !== 'free';
  $: console.log('Subscription state changed:', { userSubscription, canSearchByCountry });

  function canSearchByCompany(): boolean {
    // All users can search by company
    return true;
  }

  function goBackToCities() {
    console.log('Going back to cities');
    selectedCity = '';
    companiesForLocation = [];
    searchResults = [];
    selectedCompany = null;
    showCompanyDetails = false;
  }

  function goBackToCompanies() {
    console.log('Going back to companies');
    selectedCompany = null;
    showCompanyDetails = false;
  }

  async function selectCompany(company: FreightForwarder) {
    console.log('Company selected:', company);
    selectedCompany = company;
    showCompanyDetails = true;
    
    // Fetch detailed company information with category scores if not already present
    if (!company.category_scores || company.category_scores.length === 0) {
      try {
        console.log('Fetching detailed company information for:', company.id);
        const detailedCompany = await apiClient.getFreightForwarder(company.id);
        console.log('Detailed company information received:', detailedCompany);
        
        // Update the selected company with detailed information
        if (detailedCompany && detailedCompany.category_scores) {
          selectedCompany = detailedCompany;
          console.log('Company updated with category scores:', selectedCompany?.category_scores);
        } else {
          console.log('No category scores found in detailed company data');
        }
      } catch (error) {
        console.error('Failed to fetch detailed company information:', error);
        // Keep the original company data if detailed fetch fails
      }
    } else {
      console.log('Company already has category scores:', company.category_scores);
    }
  }

  async function selectCity(city: string) {
    console.log('City clicked:', city, 'Country:', selectedCountry);
    selectedCity = city;
    isCityLoading = true;
    error = null;
    
    try {
      // Get companies that have reviews in this city
      console.log('Fetching reviews for city:', city);
      const reviews = await apiClient.getReviewsByCity(city, selectedCountry);
      console.log('Reviews received for city:', reviews);
      
      if (reviews.length === 0) {
        console.log('No reviews found for city:', city);
        companiesForLocation = [];
        searchResults = [];
        error = `No reviews found for ${city}, ${selectedCountry}`;
        return;
      }
      
      // Extract unique freight forwarder IDs from the reviews
      const freightForwarderIds = [...new Set(reviews.map(review => review.freight_forwarder_id))];
      console.log('Unique freight forwarder IDs found:', freightForwarderIds);
      
      // Get company details for each freight forwarder that has reviews in this city
      const companiesPromises = freightForwarderIds.map(async (id) => {
        try {
          console.log('Fetching company details for ID:', id);
          const company = await apiClient.getFreightForwarder(id);
          console.log('Company details received:', company);
          return company;
        } catch (error) {
          console.error(`Failed to fetch company ${id}:`, error);
          return null;
        }
      });
      
      const companies = await Promise.all(companiesPromises);
      companiesForLocation = companies.filter(company => company !== null);
      searchResults = companiesForLocation;
      
      console.log('Final companies for location:', companiesForLocation);
      
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
    
    console.log('Performing search:', { searchType, companyQuery, countryQuery });
    isLoading = true;
    error = null;
    searchResults = [];
    companiesForLocation = [];
    citiesWithReviews = [];
    selectedCity = '';
    selectedCompany = null;
    showCompanyDetails = false;
    
    try {
      if (searchType === 'company') {
        // Company search
        console.log('Searching for companies with query:', companyQuery);
        const results = await apiClient.searchFreightForwarders(companyQuery);
        console.log('Company search results:', results);
        searchResults = results;
      } else if (searchType === 'country') {
        // Country search - get cities with reviews
        console.log('Searching for cities in country:', countryQuery);
        selectedCountry = countryQuery;
        const reviews = await apiClient.getReviewsByCountry(countryQuery);
        console.log('Country search reviews:', reviews);
        
        // Extract unique cities from reviews
        const cities = [...new Set(reviews.map(review => review.city).filter((city): city is string => city !== undefined))];
        citiesWithReviews = cities;
        console.log('Cities found:', cities);
        
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
    console.log('Updating search type to:', type);
    searchType = type;
    searchResults = [];
    companiesForLocation = [];
    citiesWithReviews = [];
    selectedCity = '';
    selectedCompany = null;
    showCompanyDetails = false;
    error = null;
    
    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set('type', type);
    url.searchParams.delete('q');
    window.history.pushState({}, '', url.toString());
    console.log('URL updated to:', url.toString());
  }

  function getCurrentQuery(): string {
    const query = searchType === 'company' ? companyQuery : countryQuery;
    console.log('Getting current query:', { searchType, query });
    return query;
  }

  function setCurrentQuery(value: string) {
    console.log('Setting current query:', { searchType, value });
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
    console.log('URL updated to:', url.toString());
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
    console.log('Getting category name:', { categoryId, result });
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
    
    console.log('Formatting score:', { score, result });
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
    
    console.log('Getting score color class:', { score, result });
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
    {console.log('Search type selection state:', { searchType, canSearchByCountry, userSubscription })}
    
    <button 
      class="search-type-btn {searchType === 'company' ? 'active' : ''}"
      on:click={() => {
        console.log('Company search type button clicked');
        updateSearchType('company');
      }}
    >
      Search by Company
    </button>
    
    {#if canSearchByCountry}
      <button 
        class="search-type-btn {searchType === 'country' ? 'active' : ''}"
        on:click={() => {
          console.log('Country search type button clicked');
          updateSearchType('country');
        }}
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
      on:input={(e) => {
        console.log('Search input changed:', e.currentTarget.value);
        setCurrentQuery(e.currentTarget.value);
      }}
      on:keydown={(e) => {
        if (e.key === 'Enter') {
          console.log('Enter key pressed, performing search');
          performSearch();
        }
      }}
      class="search-input"
    />
    <button on:click={() => {
      console.log('Search button clicked');
      performSearch();
    }} class="search-btn" disabled={isLoading}>
      {isLoading ? 'Searching...' : 'Search'}
    </button>
  </div>

  <!-- Error Display -->
  {#if error}
    {console.log('Error display state:', { error, searchType, selectedCity, companiesForLocationLength: companiesForLocation.length })}
    <div class="error-message">
      {error}
    </div>
  {/if}

  <!-- Loading State -->
  {#if isLoading}
    {console.log('Main loading state:', { isLoading, searchType, companyQuery, countryQuery })}
    <div class="loading">
      <div class="spinner"></div>
      <p>Searching...</p>
    </div>
  {/if}

  <!-- City Loading State -->
  {#if isCityLoading}
    {console.log('City loading state:', { isCityLoading, selectedCity, selectedCountry })}
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading companies for {selectedCity}...</p>
    </div>
  {/if}

  <!-- Search Results -->
  {#if !isLoading && !error}
    {console.log('Search results display state:', {
      searchType,
      searchResultsLength: searchResults.length,
      citiesWithReviewsLength: citiesWithReviews.length,
      selectedCity,
      companiesForLocationLength: companiesForLocation.length,
      showCompanyDetails,
      selectedCompany: !!selectedCompany
    })}
    
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
              console.log('City card clicked:', city);
              selectCity(city);
            }}>
              <div class="city-name">{city}</div>
            </div>
          {/each}
        </div>
      </div>
    {:else if searchType === 'country' && selectedCity && companiesForLocation.length > 0 && !showCompanyDetails}
      <!-- City Search Results - Companies -->
      <div class="city-companies-section">
        <div class="city-header">
          <h2>Companies with Reviews in {selectedCity}, {selectedCountry}</h2>
          <button on:click={goBackToCities} class="back-btn">← Back to Cities</button>
        </div>
        
        <div class="companies-grid">
          {#each companiesForLocation as company}
            <div class="company-card clickable" on:click={() => {
              console.log('Company card clicked:', company);
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
                  console.log('View Scores button clicked for company:', company);
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
          <button on:click={goBackToCities} class="btn-primary">Try Another City</button>
        </div>
      </div>
    {:else if searchType === 'country' && selectedCity && error}
      <!-- City Selected but Error Occurred -->
      <div class="city-companies-section">
        <div class="city-header">
          <h2>Companies with Reviews in {selectedCity}, {selectedCountry}</h2>
          <button on:click={goBackToCities} class="back-btn">← Back to Cities</button>
        </div>
        
        <div class="error-display">
          <div class="error-icon">⚠️</div>
          <h3>Unable to Load Companies</h3>
          <p>{error}</p>
          <div class="error-actions">
            <button on:click={() => selectCity(selectedCity)} class="btn-primary">Try Again</button>
            <button on:click={goBackToCities} class="btn-secondary">Back to Cities</button>
          </div>
        </div>
      </div>
    {:else if showCompanyDetails && selectedCompany}
      <!-- Company Details with Category Scores -->
      <div class="company-details-section">
        <div class="company-details-header">
          <button on:click={goBackToCompanies} class="back-btn">← Back to Companies</button>
          <h2>{selectedCompany.name}</h2>
          <div class="company-summary">
            {#if selectedCompany.headquarters_country}
              <p class="company-location">📍 {selectedCompany.headquarters_country}</p>
            {/if}
            {#if selectedCompany.average_rating}
              <div class="company-rating">
                <span class="stars">{'★'.repeat(Math.round(selectedCompany.average_rating))}</span>
                <span class="rating-text">{selectedCompany.average_rating.toFixed(1)}</span>
              </div>
            {/if}
          </div>
        </div>

        {#if selectedCompany.category_scores && selectedCompany.category_scores.length > 0}
          <div class="category-scores-section">
            <h3>Category Performance Scores</h3>
            <p class="scores-description">Performance ratings across 7 key categories based on customer reviews</p>
            
            <div class="category-scores-grid">
              {#each selectedCompany.category_scores as score}
                <div class="category-score-card">
                  <div class="category-header">
                    <h4>{getCategoryName(score.category_name)}</h4>
                    <div class="score-badge {getScoreColorClass(score.average_score)}">
                      {score.average_score.toFixed(1)}
                    </div>
                  </div>
                  <div class="score-details">
                    <div class="score-label">{formatScore(score.average_score)}</div>
                    <div class="review-count">Based on {score.review_count} review{score.review_count !== 1 ? 's' : ''}</div>
                  </div>
                </div>
                
                {console.log('Rendering category score:', { 
                  categoryName: getCategoryName(score.category_name), 
                  formattedScore: formatScore(score.average_score), 
                  scoreColorClass: getScoreColorClass(score.average_score), 
                  reviewCount: score.review_count, 
                  score 
                })}
              {/each}
            </div>
          </div>
        {:else}
          <div class="no-scores">
            <p>No category scores available for this company yet.</p>
            <p>Category scores are calculated from customer reviews and will appear once reviews are submitted.</p>
          </div>
        {/if}

        <div class="company-actions-footer">
          <a href="/freight-forwarder/{selectedCompany.id}" class="view-full-profile-btn">View Full Company Profile</a>
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
    {console.log('Subscription prompt state:', { showSubscriptionPrompt, userSubscription, canSearchByCountry })}
    <div class="subscription-prompt">
      <h3>Upgrade Your Subscription</h3>
      <p>Get access to advanced search features and more comprehensive results.</p>
      <a href="/pricing" class="upgrade-btn">View Pricing Plans</a>
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

